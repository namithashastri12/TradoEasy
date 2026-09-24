import math
import random
import threading
import time
from typing import Callable, Dict, List, Optional
from app.models.catalog import INSTRUMENTS_DATA, INSTRUMENTS_MAP
from app.utils.logger import logger


class DemoMarketDataService:
    """
    Deterministic simulated market data generator for development and testing.
    Produces realistic price micro-movements and volume progression without needing
    active FYERS credentials or market hours.
    """

    def __init__(self, on_tick_callback: Optional[Callable[[Dict], None]] = None):
        self.on_tick_callback = on_tick_callback
        self._thread: Optional[threading.Thread] = None
        self._is_running = False
        self._step = 0
        self._stock_states: Dict[str, Dict] = {}
        self._last_tick_time: Optional[float] = None
        self._initialize_states()

    def _initialize_states(self) -> None:
        """Initializes baseline prices, volumes, and trends for instruments."""
        for item in INSTRUMENTS_DATA:
            symbol = item["symbol"]
            base_price = item.get("base_price", 1000.0)
            avg_vol = item.get("default_avg_volume", 1000000)

            # Assign some variety in initial day change (-3% to +3%)
            initial_change_pct = ((hash(symbol) % 600) - 300) / 100.0
            prev_close = round(base_price / (1.0 + (initial_change_pct / 100.0)), 2)
            open_price = round(prev_close * (1.0 + (((hash(symbol) % 200) - 100) / 10000.0)), 2)

            # Pick a few specific stocks to showcase high RVOL (> 2x)
            is_high_rvol_target = symbol in ["NSE:INFY-EQ", "NSE:SBIN-EQ", "NSE:TATAMOTORS-EQ", "NSE:TITAN-EQ"]
            initial_vol = int(avg_vol * (2.2 if is_high_rvol_target else random.uniform(0.4, 1.4)))

            self._stock_states[symbol] = {
                "symbol": symbol,
                "ltp": base_price,
                "prev_close": prev_close,
                "open_price": open_price,
                "high_price": max(base_price, open_price),
                "low_price": min(base_price, open_price),
                "volume": initial_vol,
                "avg_vol": avg_vol,
                "trend": (hash(symbol) % 5) - 2  # slight drift factor
            }

    @property
    def is_connected(self) -> bool:
        return self._is_running

    @property
    def connection_state(self) -> str:
        return "CONNECTED" if self._is_running else "DISCONNECTED"

    @property
    def last_tick_time(self) -> Optional[float]:
        return self._last_tick_time

    def start(self, symbols: List[str]) -> bool:
        """Starts the demo generator loop in a background thread."""
        if self._is_running:
            return True

        self._is_running = True
        logger.info(f"Starting DEMO market data feed for {len(symbols)} instruments.")

        def _run():
            while self._is_running:
                self._step += 1
                now = time.time()
                self._last_tick_time = now

                # Pick 4 to 8 symbols per cycle for natural tick cadence
                active_symbols = [s for s in symbols if s in self._stock_states]
                if not active_symbols:
                    active_symbols = list(self._stock_states.keys())

                sampled = random.sample(active_symbols, min(len(active_symbols), random.randint(4, 8)))

                for symbol in sampled:
                    state = self._stock_states[symbol]
                    # Deterministic sine-wave micro oscillation + small noise
                    oscillation = math.sin(self._step * 0.1 + hash(symbol) % 10) * 0.0015
                    noise = random.uniform(-0.0008, 0.0008)
                    delta_pct = oscillation + noise + (state["trend"] * 0.0002)

                    new_ltp = round(max(1.0, state["ltp"] * (1.0 + delta_pct)), 2)
                    state["ltp"] = new_ltp
                    state["high_price"] = max(state["high_price"], new_ltp)
                    state["low_price"] = min(state["low_price"], new_ltp)

                    # Accumulate volume
                    vol_increment = random.randint(500, 15000)
                    state["volume"] += vol_increment

                    ch = round(new_ltp - state["prev_close"], 2)
                    chp = round((ch / state["prev_close"]) * 100.0, 2)

                    tick_message = {
                        "symbol": symbol,
                        "ltp": new_ltp,
                        "prev_close_price": state["prev_close"],
                        "open_price": state["open_price"],
                        "high_price": state["high_price"],
                        "low_price": state["low_price"],
                        "vol_traded_today": state["volume"],
                        "ch": ch,
                        "chp": chp,
                        "timestamp": int(now),
                        "source": "DEMO"
                    }

                    if self.on_tick_callback:
                        try:
                            self.on_tick_callback(tick_message)
                        except Exception as e:
                            logger.error(f"Error in demo tick callback: {e}")

                time.sleep(0.4)  # 400ms interval for responsive streaming

        self._thread = threading.Thread(target=_run, daemon=True, name="DemoDataWorker")
        self._thread.start()
        return True

    def stop(self) -> None:
        """Stops the demo feed."""
        self._is_running = False
        logger.info("DEMO market data feed stopped.")
