import time
from app.services.alerts import AlertsEngine
from app.models.market import AlertRule, NormalizedTick


def test_alert_price_above_trigger():
    engine = AlertsEngine(default_cooldown_seconds=300)
    rule = AlertRule(
        id="r1",
        symbol="NSE:INFY-EQ",
        type="PRICE_ABOVE",
        threshold=1850.0,
        cooldown_seconds=60
    )
    engine.add_rule(rule)

    # Tick below threshold - no alert
    tick_below = NormalizedTick(
        symbol="NSE:INFY-EQ", ticker="INFY", company_name="Infosys", sector="IT",
        ltp=1840.0, prev_close=1800.0, timestamp=1700000000
    )
    notifications = engine.evaluate_tick(tick_below)
    assert len(notifications) == 0

    # Tick at or above threshold - should trigger alert
    tick_above = NormalizedTick(
        symbol="NSE:INFY-EQ", ticker="INFY", company_name="Infosys", sector="IT",
        ltp=1855.0, prev_close=1800.0, timestamp=1700000001
    )
    notifications = engine.evaluate_tick(tick_above)
    assert len(notifications) == 1
    assert "crossed above" in notifications[0].message
    assert notifications[0].triggered_value == 1855.0


def test_alert_cooldown_deduplication():
    engine = AlertsEngine(default_cooldown_seconds=60)
    rule = AlertRule(
        id="r_rvol",
        symbol="NSE:SBIN-EQ",
        type="RVOL_ABOVE",
        threshold=2.0,
        cooldown_seconds=60
    )
    engine.add_rule(rule)

    tick = NormalizedTick(
        symbol="NSE:SBIN-EQ", ticker="SBIN", company_name="SBI", sector="Banking",
        ltp=820.0, prev_close=800.0, relative_volume=2.3, timestamp=1700000000
    )

    # 1st time: fires
    n1 = engine.evaluate_tick(tick)
    assert len(n1) == 1

    # 2nd time immediately after: suppressed by cooldown!
    n2 = engine.evaluate_tick(tick)
    assert len(n2) == 0

    # 3rd tick still within 60s cooldown: suppressed
    n3 = engine.evaluate_tick(tick)
    assert len(n3) == 0
