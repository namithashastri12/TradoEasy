from datetime import datetime, time, timezone, timedelta
from typing import Dict, Any
from enum import Enum

IST = timezone(timedelta(hours=5, minutes=30))

# Standard Indian Market Hours
PRE_MARKET_OPEN = time(9, 0)
NORMAL_MARKET_OPEN = time(9, 15)
NORMAL_MARKET_CLOSE = time(15, 30)


class MarketState(str, Enum):
    PRE_MARKET = "PRE_MARKET"
    OPEN = "OPEN"
    CLOSED = "CLOSED"


def get_current_ist_time() -> datetime:
    """Returns the current datetime in Indian Standard Time (IST)."""
    return datetime.now(IST)


def evaluate_market_status(target_time: datetime | None = None) -> Dict[str, Any]:
    """
    Evaluates whether the Indian Equity Market is PRE_MARKET, OPEN, or CLOSED.
    Uses IST (UTC+5:30) timezone logic.
    """
    now = target_time if target_time is not None else get_current_ist_time()
    # 0 = Monday, 6 = Sunday
    weekday = now.weekday()
    current_time = now.time()

    is_weekend = weekday >= 5

    if is_weekend:
        return {
            "status": MarketState.CLOSED.value,
            "display": "MARKET CLOSED (WEEKEND)",
            "is_open": False,
            "ist_time": now.strftime("%Y-%m-%d %I:%M:%S %p"),
            "reason": "Weekend trading holiday"
        }

    if PRE_MARKET_OPEN <= current_time < NORMAL_MARKET_OPEN:
        return {
            "status": MarketState.PRE_MARKET.value,
            "display": "NSE · PRE-MARKET",
            "is_open": False,
            "ist_time": now.strftime("%Y-%m-%d %I:%M:%S %p"),
            "reason": "Pre-market session (09:00 AM - 09:15 AM IST)"
        }
    elif NORMAL_MARKET_OPEN <= current_time < NORMAL_MARKET_CLOSE:
        return {
            "status": MarketState.OPEN.value,
            "display": "NSE · MARKET OPEN",
            "is_open": True,
            "ist_time": now.strftime("%Y-%m-%d %I:%M:%S %p"),
            "reason": "Regular market session (09:15 AM - 03:30 PM IST)"
        }
    else:
        return {
            "status": MarketState.CLOSED.value,
            "display": "NSE · MARKET CLOSED",
            "is_open": False,
            "ist_time": now.strftime("%Y-%m-%d %I:%M:%S %p"),
            "reason": "Outside regular trading hours (09:15 AM - 03:30 PM IST)"
        }
