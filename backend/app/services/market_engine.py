import threading
import time
from typing import Dict, List, Optional, Any, Callable
from app.config import settings
from app.models.catalog import INSTRUMENTS_MAP, INSTRUMENTS_DATA, UNIVERSES, NIFTY_50_SYMBOLS
from app.models.market import (
    NormalizedTick,
    MarketSummary,
    MarketStatusInfo,
    SystemStatusResponse,
    AlertNotification
)
from app.services.scanner import ScannerEngine
from app.services.alerts import AlertsEngine
from app.services.historical_data import HistoricalDataProvider
from app.services.fyers_auth import fyers_auth_manager
from app.services.fyers_market_data import FyersMarketDataService
from app.services.demo_data import DemoMarketDataService
from app.utils.market_timing import evaluate_market_status
from app.utils.logger import logger


class MarketEngine:
    """
    Central Market Engine maintaining in-memory state, coordinating live/demo feeds,
    normalizing incoming raw ticks, tracking stale data, and triggering alerts.
    """

    def __init__(self, broadcast_callback: Optional[Callable[[Dict[str, Any]], None]] = None):
        self.broadcast_callback = broadcast_callback
        self.scanner = ScannerEngine(rvol_threshold=settings.RVOL_THRESHOLD)
        self.alerts = AlertsEngine()
        self.historical_data = HistoricalDataProvider(fyers_auth_manager)

        self._active_universe_id: str = "nifty_500"
        self._state: Dict[str, NormalizedTick] = {}
        self._lock = threading.RLock()
        self._last_tick_time: Optional[float] = None
        self._is_stale: bool = False
        self._forced_mode: Optional[str] = None

        # Data providers
        self.fyers_data_service = FyersMarketDataService(
            auth_manager=fyers_auth_manager,
            on_tick_callback=self.process_raw_tick
        )
        self.demo_data_service = DemoMarketDataService(
            on_tick_callback=self.process_raw_tick
        )

        self._initialize_universe_state(self._active_universe_id)

    @property
    def active_universe_id(self) -> str:
        return self._active_universe_id

    @property
    def is_live_mode(self) -> bool:
        if self._forced_mode:
            return self._forced_mode.upper() == "LIVE" and fyers_auth_manager.is_authenticated()
        return settings.APP_MODE.lower() == "live" and fyers_auth_manager.is_authenticated()

    def get_current_mode_label(self) -> str:
        return "LIVE" if self.is_live_mode else "DEMO"

    def set_mode(self, mode: str) -> bool:
        """Switches runtime mode between LIVE (FYERS) and DEMO (Simulation)."""
        target = mode.upper()
        if target == "LIVE":
            if not fyers_auth_manager.is_authenticated():
                return False
            self._forced_mode = "LIVE"
            settings.APP_MODE = "live"
        else:
            self._forced_mode = "DEMO"
            settings.APP_MODE = "demo"

        logger.info(f"MarketEngine mode switched to {target}")
        self.stop()
        self.start()
        return True

    def _initialize_universe_state(self, universe_id: str) -> None:
        """Initializes empty baseline NormalizedTicks for all instruments in universe."""
        with self._lock:
            universe = UNIVERSES.get(universe_id) or UNIVERSES["nifty_500"]
            self._active_universe_id = universe.id

            for symbol in universe.symbols:
                if symbol not in self._state:
                    meta = INSTRUMENTS_MAP.get(symbol)
                    if meta:
                        metrics = self.historical_data.get_symbol_metrics(symbol)
                        avg_vol = metrics.get("avg_volume", self.historical_data.get_average_volume(symbol))
                        avg_vols = metrics.get("avg_volumes")
                        price_changes = metrics.get("price_changes")

                        # Seed base price from catalog data
                        base_p = 1000.0
                        for it in INSTRUMENTS_DATA:
                            if it["symbol"] == symbol:
                                base_p = it.get("base_price", 1000.0)
                                break
                        self._state[symbol] = NormalizedTick(
                            symbol=symbol,
                            ticker=meta.ticker,
                            company_name=meta.name,
                            sector=meta.sector,
                            ltp=base_p,
                            prev_close=base_p,
                            change=0.0,
                            change_percent=0.0,
                            today_volume=int(avg_vol * 0.8),
                            avg_volume=avg_vol,
                            relative_volume=0.8,
                            open_price=base_p,
                            high_price=base_p,
                            low_price=base_p,
                            timestamp=int(time.time()),
                            is_volume_spike=False,
                            avg_volumes=avg_vols,
                            price_changes=price_changes
                        )

    def start(self) -> None:
        """Starts the appropriate market data feed based on configuration."""
        universe = UNIVERSES.get(self._active_universe_id) or UNIVERSES["nifty_500"]
        symbols = universe.symbols

        if self.is_live_mode:
            logger.info("Starting in LIVE MODE with FYERS Market Data WebSocket...")
            started = self.fyers_data_service.start(symbols)
            if not started:
                logger.warning("Failed to start FYERS WebSocket. Falling back to DEMO MODE.")
                self.demo_data_service.start(symbols)
        else:
            logger.info("Starting in DEMO MODE with simulated market data.")
            self.demo_data_service.start(symbols)

    def stop(self) -> None:
        """Stops all active data feeds."""
        self.fyers_data_service.stop()
        self.demo_data_service.stop()

    def set_active_universe(self, universe_id: str) -> bool:
        """Changes active universe and subscribes to corresponding instruments."""
        if universe_id not in UNIVERSES:
            return False

        with self._lock:
            self._active_universe_id = universe_id
            self._initialize_universe_state(universe_id)
            symbols = UNIVERSES[universe_id].symbols

            if self.is_live_mode and self.fyers_data_service.is_connected:
                self.fyers_data_service.update_subscriptions(symbols)
            elif self.demo_data_service.is_connected:
                # Demo service naturally samples from active symbols
                pass

        logger.info(f"Switched active universe to: {universe_id} ({len(symbols)} symbols)")
        return True

    def process_raw_tick(self, raw: Dict[str, Any]) -> None:
        """
        Normalizes raw tick from FYERS WebSocket (or Demo generator),
        updates in-memory state, calculates derived values, and checks alerts.
        """
        symbol = raw.get("symbol")
        if not symbol:
            return

        ltp = float(raw.get("ltp", 0.0))
        if ltp <= 0:
            return

        now = time.time()
        self._last_tick_time = now
        self._is_stale = False

        with self._lock:
            meta = INSTRUMENTS_MAP.get(symbol)
            ticker = meta.ticker if meta else symbol.split(":")[1].replace("-EQ", "")
            company_name = meta.name if meta else ticker
            sector = meta.sector if meta else "Other"
            metrics = self.historical_data.get_symbol_metrics(symbol)
            avg_vol = metrics.get("avg_volume", self.historical_data.get_average_volume(symbol))
            avg_vols = metrics.get("avg_volumes")
            price_changes = metrics.get("price_changes")

            # Extract fields with safe fallbacks
            prev_close = float(raw.get("prev_close_price", 0.0))
            existing = self._state.get(symbol)
            if prev_close <= 0 and existing and existing.prev_close > 0:
                prev_close = existing.prev_close

            # If prev_close still missing, default to ltp so change is 0
            if prev_close <= 0:
                prev_close = ltp

            change = round(ltp - prev_close, 2)
            change_percent = round((change / prev_close) * 100.0, 2) if prev_close > 0 else 0.0

            today_vol = int(raw.get("vol_traded_today", raw.get("volume", 0)))
            if today_vol <= 0 and existing:
                today_vol = existing.today_volume

            rvol = self.scanner.calculate_relative_volume(today_vol, avg_vol)
            is_spike = self.scanner.is_volume_spike(rvol)

            open_p = float(raw.get("open_price", existing.open_price if existing else ltp))
            high_p = float(raw.get("high_price", existing.high_price if existing else ltp))
            low_p = float(raw.get("low_price", existing.low_price if existing else ltp))
            high_p = max(high_p, ltp)
            low_p = min(low_p, ltp) if low_p > 0 else ltp

            ts = int(raw.get("timestamp", now))

            normalized = NormalizedTick(
                symbol=symbol,
                ticker=ticker,
                company_name=company_name,
                sector=sector,
                ltp=ltp,
                prev_close=prev_close,
                change=change,
                change_percent=change_percent,
                today_volume=today_vol,
                avg_volume=avg_vol,
                relative_volume=rvol,
                open_price=open_p,
                high_price=high_p,
                low_price=low_p,
                timestamp=ts,
                is_volume_spike=is_spike,
                avg_volumes=avg_vols,
                price_changes=price_changes
            )

            self._state[symbol] = normalized

        # Check alerts
        triggered_alerts = self.alerts.evaluate_tick(normalized)

        # Broadcast via WebSocket if callback is set
        if self.broadcast_callback:
            payload = {
                "type": "TICK",
                "tick": normalized.model_dump(),
                "alerts": [a.model_dump() for a in triggered_alerts] if triggered_alerts else []
            }
            try:
                self.broadcast_callback(payload)
            except Exception as e:
                logger.error(f"Error in broadcast_callback: {e}")

    def check_stale_data(self) -> bool:
        """Evaluates whether data has become stale."""
        if not self._last_tick_time:
            return False
        elapsed = time.time() - self._last_tick_time
        self._is_stale = elapsed > settings.STALE_DATA_TIMEOUT_SECONDS
        return self._is_stale

    def get_snapshot(self) -> Dict[str, Any]:
        """Returns the full market state for the currently active universe."""
        with self._lock:
            universe = UNIVERSES.get(self._active_universe_id) or UNIVERSES["nifty_500"]
            active_ticks = [
                self._state[s] for s in universe.symbols
                if s in self._state and self._state[s].ltp > 0
            ]

            summary = self.scanner.compute_market_summary(active_ticks)
            m_status = evaluate_market_status()

            connection_state = "CONNECTED"
            if self.is_live_mode:
                connection_state = self.fyers_data_service.connection_state
            else:
                connection_state = self.demo_data_service.connection_state

            elapsed = (time.time() - self._last_tick_time) if self._last_tick_time else None

            return {
                "universe_id": self._active_universe_id,
                "universe_name": universe.name,
                "mode": self.get_current_mode_label(),
                "connection_state": connection_state,
                "is_stale": self.check_stale_data(),
                "last_tick_time": int(self._last_tick_time) if self._last_tick_time else None,
                "seconds_since_last_tick": round(elapsed, 1) if elapsed is not None else None,
                "market_status": m_status,
                "summary": summary.model_dump(),
                "ticks": [t.model_dump() for t in active_ticks]
            }

    def get_system_status(self) -> SystemStatusResponse:
        """Returns diagnostic health and connection status."""
        m_status = evaluate_market_status()
        universe = UNIVERSES.get(self._active_universe_id) or UNIVERSES["nifty_500"]
        elapsed = (time.time() - self._last_tick_time) if self._last_tick_time else None

        conn_state = (
            self.fyers_data_service.connection_state
            if self.is_live_mode else self.demo_data_service.connection_state
        )

        return SystemStatusResponse(
            mode=self.get_current_mode_label(),
            connection_status=conn_state,
            fyers_connected=self.fyers_data_service.is_connected,
            is_stale=self.check_stale_data(),
            last_tick_time=int(self._last_tick_time) if self._last_tick_time else None,
            seconds_since_last_tick=round(elapsed, 1) if elapsed is not None else None,
            active_universe=universe.name,
            symbols_count=len(universe.symbols),
            market_status=MarketStatusInfo(
                status=m_status["status"],
                display=m_status["display"],
                is_open=m_status["is_open"],
                ist_time=m_status["ist_time"],
                reason=m_status.get("reason")
            )
        )
