from typing import List, Dict, Any, Optional
from app.config import settings
from app.models.market import NormalizedTick, MarketSummary


class ScannerEngine:
    """
    Computes derived metrics (RVOL, volume spikes, price change)
    and aggregates market summaries. Also provides backend filtering logic.
    """

    def __init__(self, rvol_threshold: float = 2.0):
        self.rvol_threshold = rvol_threshold

    def calculate_relative_volume(self, today_volume: int, avg_volume: int) -> float:
        """
        Calculates relative volume:
        relative_volume = currentVolume / averageVolume
        Guarantees safe division and rounding to 2 decimal places.
        """
        if avg_volume <= 0:
            return 1.0
        return round(float(today_volume) / float(avg_volume), 2)

    def calculate_price_change(self, ltp: float, prev_close: float) -> tuple[float, float]:
        """
        Calculates absolute change and percentage change.
        Returns: (change, change_percent)
        """
        if prev_close <= 0:
            return 0.0, 0.0
        change = round(ltp - prev_close, 2)
        change_percent = round((change / prev_close) * 100.0, 2)
        return change, change_percent

    def is_volume_spike(self, relative_volume: float) -> bool:
        """Determines if a volume spike condition is met (RVOL >= threshold)."""
        return relative_volume >= self.rvol_threshold

    def compute_market_summary(self, ticks: List[NormalizedTick]) -> MarketSummary:
        """
        Computes aggregate market summary cards from a list of normalized ticks.
        """
        stocks_monitored = len(ticks)
        above_avg_vol = 0
        high_rvol = 0
        gainers = 0
        losers = 0
        unchanged = 0
        total_vol = 0
        latest_ts = 0

        for tick in ticks:
            total_vol += tick.today_volume
            if tick.today_volume > tick.avg_volume:
                above_avg_vol += 1
            if tick.relative_volume >= self.rvol_threshold:
                high_rvol += 1
            if tick.change > 0:
                gainers += 1
            elif tick.change < 0:
                losers += 1
            else:
                unchanged += 1
            if tick.timestamp > latest_ts:
                latest_ts = tick.timestamp

        return MarketSummary(
            stocks_monitored=stocks_monitored,
            above_average_volume=above_avg_vol,
            high_rvol=high_rvol,
            gainers=gainers,
            losers=losers,
            unchanged=unchanged,
            total_volume_traded=total_vol,
            last_update_time=latest_ts if latest_ts > 0 else None
        )

    def filter_ticks(
        self,
        ticks: List[NormalizedTick],
        volume_filter: str = "ALL",
        price_filter: str = "ALL",
        sector_filter: str = "ALL",
        rvol_filter: str = "ALL",
        search_query: str = ""
    ) -> List[NormalizedTick]:
        """
        Applies combined filters simultaneously.
        Every condition must be satisfied for an instrument to be included.
        """
        clean_search = search_query.strip().lower()

        filtered = []
        for tick in ticks:
            # 1. Search Query filter (matches ticker, symbol, or company name)
            if clean_search:
                match_symbol = clean_search in tick.symbol.lower()
                match_ticker = clean_search in tick.ticker.lower()
                match_name = clean_search in tick.company_name.lower()
                if not (match_symbol or match_ticker or match_name):
                    continue

            # 2. Sector filter
            if sector_filter and sector_filter.upper() != "ALL":
                if tick.sector.lower() != sector_filter.lower():
                    continue

            # 3. Relative Volume filter
            if rvol_filter and rvol_filter.upper() != "ALL":
                rvol_upper = rvol_filter.upper()
                if rvol_upper == "1X" and tick.relative_volume < 1.0:
                    continue
                elif rvol_upper == "1.5X" and tick.relative_volume < 1.5:
                    continue
                elif rvol_upper == "2X" and tick.relative_volume < 2.0:
                    continue
                elif rvol_upper == "3X" and tick.relative_volume < 3.0:
                    continue

            # 4. Volume filter
            if volume_filter and volume_filter.upper() != "ALL":
                vol_upper = volume_filter.upper()
                if vol_upper in ("ABOVE_AVERAGE", "ABOVE AVERAGE") and tick.today_volume <= tick.avg_volume:
                    continue
                elif vol_upper in ("BELOW_AVERAGE", "BELOW AVERAGE") and tick.today_volume >= tick.avg_volume:
                    continue
                elif vol_upper in ("HIGH_VOLUME", "HIGH VOLUME") and tick.today_volume < (tick.avg_volume * 1.5):
                    continue

            # 5. Price Change filter
            if price_filter and price_filter.upper() != "ALL":
                p_upper = price_filter.upper()
                if p_upper == "POSITIVE" and tick.change <= 0:
                    continue
                elif p_upper == "NEGATIVE" and tick.change >= 0:
                    continue
                elif p_upper in ("1%", "GT_1") and tick.change_percent < 1.0:
                    continue
                elif p_upper in ("2%", "GT_2") and tick.change_percent < 2.0:
                    continue
                elif p_upper in ("<-1%", "LT_MINUS_1") and tick.change_percent > -1.0:
                    continue
                elif p_upper in ("<-2%", "LT_MINUS_2") and tick.change_percent > -2.0:
                    continue

            filtered.append(tick)

        return filtered
