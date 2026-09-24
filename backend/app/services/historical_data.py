from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from app.models.catalog import INSTRUMENTS_MAP
from app.utils.logger import logger


class HistoricalDataProvider:
    """
    Historical Data Service for calculating historical baseline metrics
    (such as 20-day average volume) and modularly exposing FYERS Expired F&O APIs.
    """

    def __init__(self, auth_manager):
        self.auth_manager = auth_manager
        self._avg_volume_cache: Dict[str, int] = {}

    def get_average_volume(self, symbol: str) -> int:
        """Returns cached or default average volume for a symbol."""
        if symbol in self._avg_volume_cache:
            return self._avg_volume_cache[symbol]
        if symbol in INSTRUMENTS_MAP:
            return INSTRUMENTS_MAP[symbol].default_avg_volume
        return 1000000

    def compute_20d_average_volume(self, symbol: str) -> int:
        """
        Queries FYERS history API for the last 30 calendar days of daily candles,
        and computes the average volume of the most recent 20 trading sessions.
        """
        client = self.auth_manager.get_fyers_client()
        if not client:
            return self.get_average_volume(symbol)

        try:
            today = datetime.now()
            thirty_days_ago = today - timedelta(days=45)
            range_from = thirty_days_ago.strftime("%Y-%m-%d")
            range_to = today.strftime("%Y-%m-%d")

            data = {
                "symbol": symbol,
                "resolution": "D",
                "date_format": "1",
                "range_from": range_from,
                "range_to": range_to,
                "cont_flag": "1"
            }
            response = client.history(data)

            if isinstance(response, dict) and response.get("s") == "ok":
                candles = response.get("candles", [])
                if candles:
                    # candle format: [timestamp, open, high, low, close, volume]
                    recent_candles = candles[-20:] if len(candles) >= 20 else candles
                    volumes = [c[5] for c in recent_candles if len(c) > 5 and isinstance(c[5], (int, float))]
                    if volumes:
                        avg_vol = int(sum(volumes) / len(volumes))
                        self._avg_volume_cache[symbol] = max(1, avg_vol)
                        return self._avg_volume_cache[symbol]

        except Exception as e:
            logger.warning(f"Could not compute 20D average volume from FYERS for {symbol}: {e}")

        # Fallback to catalog default
        default_val = self.get_average_volume(symbol)
        self._avg_volume_cache[symbol] = default_val
        return default_val

    def populate_universe_avg_volumes(self, symbols: List[str]) -> Dict[str, int]:
        """Preloads average volume for a list of symbols."""
        results = {}
        for symbol in symbols:
            results[symbol] = self.compute_20d_average_volume(symbol)
        return results

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
