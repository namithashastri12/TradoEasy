from datetime import datetime, timezone, timedelta
from app.utils.market_timing import evaluate_market_status, MarketState, IST


def test_market_status_open_during_regular_hours():
    # Wednesday 11:30 AM IST
    wednesday_midday = datetime(2026, 9, 9, 11, 30, 0, tzinfo=IST)
    result = evaluate_market_status(wednesday_midday)
    assert result["status"] == MarketState.OPEN.value
    assert result["is_open"] is True
    assert "MARKET OPEN" in result["display"]


def test_market_status_pre_market():
    # Thursday 09:05 AM IST
    pre_market_time = datetime(2026, 9, 10, 9, 5, 0, tzinfo=IST)
    result = evaluate_market_status(pre_market_time)
    assert result["status"] == MarketState.PRE_MARKET.value
    assert result["is_open"] is False
    assert "PRE-MARKET" in result["display"]


def test_market_status_closed_after_hours():
    # Thursday 04:30 PM IST (16:30)
    evening_time = datetime(2026, 9, 10, 16, 30, 0, tzinfo=IST)
    result = evaluate_market_status(evening_time)
    assert result["status"] == MarketState.CLOSED.value
    assert result["is_open"] is False
    assert "MARKET CLOSED" in result["display"]


def test_market_status_closed_weekend():
    # Saturday 11:00 AM IST
    saturday_midday = datetime(2026, 9, 12, 11, 0, 0, tzinfo=IST)
    result = evaluate_market_status(saturday_midday)
    assert result["status"] == MarketState.CLOSED.value
    assert result["is_open"] is False
    assert "WEEKEND" in result["display"]
