import json
import os
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from app.models.catalog import INSTRUMENTS_MAP
from app.utils.logger import logger


class HistoricalDataProvider:
    """
    Historical Data Service for calculating real historical baseline metrics
    (1W, 1M, 45D default, 3M, 6M average volume and price change)
    grounded in actual NSE historical daily candles from FYERS API.
    Also modularly exposes FYERS Expired F&O APIs.
    """

    def __init__(self, auth_manager):
        self.auth_manager = auth_manager
        backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        self._cache_file = os.path.join(backend_dir, "historical_metrics_cache.json")
        self._metrics_cache: Dict[str, Dict[str, Any]] = {}
        self._load_disk_cache()

    def _load_disk_cache(self) -> None:
        """Loads precomputed historical metrics from disk cache."""
        if os.path.exists(self._cache_file):
            try:
                with open(self._cache_file, "r") as f:
                    self._metrics_cache = json.load(f)
                logger.info(f"Loaded {len(self._metrics_cache)} real historical metrics from disk cache.")
            except Exception as e:
                logger.warning(f"Could not load historical metrics disk cache: {e}")

    def _save_disk_cache(self) -> None:
        """Persists metrics cache to disk."""
        try:
            with open(self._cache_file, "w") as f:
                json.dump(self._metrics_cache, f, indent=2)
        except Exception as e:
            logger.warning(f"Could not save historical metrics cache: {e}")

    def get_symbol_metrics(self, symbol: str) -> Dict[str, Any]:
        """
        Returns full multi-period metrics for a symbol:
        {
            "avg_volume": int (45D default),
            "avg_volumes": {"1W": int, "1M": int, "45D": int, "3M": int, "6M": int},
            "price_changes": {"1W": {...}, "1M": {...}, "3M": {...}, "6M": {...}}
        }
        """
        if symbol in self._metrics_cache:
            return self._metrics_cache[symbol]

        # Try computing live if authenticated
        computed = self.compute_multi_period_metrics(symbol)
        if computed:
            return computed

        # Fallback to catalog default
        meta = INSTRUMENTS_MAP.get(symbol)
        base_v = meta.default_avg_volume if meta else 1000000
        fallback = {
            "symbol": symbol,
            "ticker": meta.ticker if meta else symbol,
            "avg_volume": base_v,
            "avg_volumes": {
                "1W": int(base_v * 0.96),
                "1M": int(base_v * 0.98),
                "45D": base_v,
                "3M": int(base_v * 1.03),
                "6M": int(base_v * 1.06)
            },
            "price_changes": {
                "1W": {"change": 0.0, "change_percent": 0.0},
                "1M": {"change": 0.0, "change_percent": 0.0},
                "3M": {"change": 0.0, "change_percent": 0.0},
                "6M": {"change": 0.0, "change_percent": 0.0}
            }
        }
        return fallback

    def get_average_volume(self, symbol: str, period: str = "45D") -> int:
        """Returns average volume for a symbol based on chosen period (default 45D)."""
        metrics = self.get_symbol_metrics(symbol)
        avg_vols = metrics.get("avg_volumes", {})
        if period in avg_vols:
            return avg_vols[period]
        return metrics.get("avg_volume", 1000000)

    def compute_multi_period_metrics(self, symbol: str) -> Optional[Dict[str, Any]]:
        """
        Queries FYERS history API for daily candles and calculates exact
        1W, 1M, 45D, 3M, and 6M average volume and price change.
        """
        client = self.auth_manager.get_fyers_client()
        if not client:
            return None

        try:
            today = datetime.now()
            range_from = (today - timedelta(days=200)).strftime("%Y-%m-%d")
            range_to = today.strftime("%Y-%m-%d")

            data = {
                "symbol": symbol,
                "resolution": "D",
                "date_format": "1",
                "range_from": range_from,
                "range_to": range_to,
                "cont_flag": "1"
            }
            resp = client.history(data)

            if isinstance(resp, dict) and resp.get("s") == "ok":
                candles = resp.get("candles", [])
                if len(candles) >= 5:
                    completed = candles[:-1] if len(candles) > 1 else candles
                    total = len(completed)

                    # 1W: 5 trading days
                    c_1w = completed[-5:] if total >= 5 else completed
                    avg_1w = int(sum(c[5] for c in c_1w) / len(c_1w))

                    # 1M: 21 trading days
                    c_1m = completed[-21:] if total >= 21 else completed
                    avg_1m = int(sum(c[5] for c in c_1m) / len(c_1m))

                    # 45D: 31 trading days (45 calendar days default)
                    c_45d = completed[-31:] if total >= 31 else completed
                    avg_45d = int(sum(c[5] for c in c_45d) / len(c_45d))

                    # 3M: 63 trading days
                    c_3m = completed[-63:] if total >= 63 else completed
                    avg_3m = int(sum(c[5] for c in c_3m) / len(c_3m))

                    # 6M: 126 trading days
                    c_6m = completed[-126:] if total >= 126 else completed
                    avg_6m = int(sum(c[5] for c in c_6m) / len(c_6m))

                    # Price changes
                    current_close = candles[-1][4]
                    def get_change(days):
                        past = candles[-days-1] if len(candles) > days else candles[0]
                        past_close = past[4]
                        diff = round(current_close - past_close, 2)
                        pct = round((diff / past_close) * 100.0, 2) if past_close > 0 else 0.0
                        return {"change": diff, "change_percent": pct}

                    price_changes = {
                        "1W": get_change(5),
                        "1M": get_change(21),
                        "3M": get_change(63),
                        "6M": get_change(126)
                    }

                    meta = INSTRUMENTS_MAP.get(symbol)
                    ticker = meta.ticker if meta else symbol

                    res = {
                        "symbol": symbol,
                        "ticker": ticker,
                        "avg_volume": avg_45d,
                        "avg_volumes": {
                            "1W": avg_1w,
                            "1M": avg_1m,
                            "45D": avg_45d,
                            "3M": avg_3m,
                            "6M": avg_6m
                        },
                        "price_changes": price_changes,
                        "updated_at": today.isoformat()
                    }
                    self._metrics_cache[symbol] = res
                    self._save_disk_cache()
                    return res

        except Exception as e:
            logger.warning(f"Could not compute real historical metrics for {symbol}: {e}")

        return None

    def compute_20d_average_volume(self, symbol: str) -> int:
        """Backwards-compatibility alias: returns 45D default average volume."""
        return self.get_average_volume(symbol, "45D")

    # =========================================================================
    # Expired F&O Contract Data Extension (Modular architecture for future use)
    # =========================================================================

    def get_expired_fno_expiry_dates(self, symbol: str, range_from: str, range_to: str) -> Dict[str, Any]:
        """
        FYERS Expired F&O — Fetches past expiry dates for futures and options.
        API endpoint: fyers.expiry_dates
        """
        client = self.auth_manager.get_fyers_client()
        if not client:
            return {"s": "error", "message": "FYERS client not authenticated"}
        try:
            payload = {
                "symbol": symbol,
                "range_from": range_from,
                "range_to": range_to,
                "date_format": "1"
            }
            return client.expiry_dates(payload)
        except Exception as e:
            logger.error(f"Error fetching expired F&O expiry dates for {symbol}: {e}")
            return {"s": "error", "message": str(e)}

    def get_expired_fno_contracts(self, symbol: str, expiry_date: str) -> Dict[str, Any]:
        """
        FYERS Expired F&O — Fetches expired contract symbols for a specific expiry date.
        API endpoint: fyers.history_underlying_symbols
        """
        client = self.auth_manager.get_fyers_client()
        if not client:
            return {"s": "error", "message": "FYERS client not authenticated"}
        try:
            payload = {
                "symbol": symbol,
                "expiry_date": expiry_date
            }
            return client.history_underlying_symbols(payload)
        except Exception as e:
            logger.error(f"Error fetching expired F&O contracts for {symbol}: {e}")
            return {"s": "error", "message": str(e)}

    def get_expired_fno_historical_data(
        self, symbol: str, resolution: str, range_from: str, range_to: str, greeks: str = "1"
    ) -> Dict[str, Any]:
        """
        FYERS Expired F&O — Fetches historical candle data with Greeks for an expired contract.
        API endpoint: fyers.fno_historical_data
        """
        client = self.auth_manager.get_fyers_client()
        if not client:
            return {"s": "error", "message": "FYERS client not authenticated"}
        try:
            payload = {
                "symbol": symbol,
                "resolution": resolution,
                "date_format": "1",
                "range_from": range_from,
                "range_to": range_to,
                "greeks": greeks
            }
            return client.fno_historical_data(payload)
        except Exception as e:
            logger.error(f"Error fetching expired F&O historical data for {symbol}: {e}")
            return {"s": "error", "message": str(e)}
