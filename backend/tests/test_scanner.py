import pytest
from app.services.scanner import ScannerEngine
from app.models.market import NormalizedTick


def test_calculate_relative_volume():
    scanner = ScannerEngine(rvol_threshold=2.0)
    # Safe division
    assert scanner.calculate_relative_volume(2000000, 1000000) == 2.0
    assert scanner.calculate_relative_volume(1500000, 1000000) == 1.5
    assert scanner.calculate_relative_volume(0, 1000000) == 0.0
    assert scanner.calculate_relative_volume(500000, 0) == 1.0  # Zero avg vol fallback


def test_price_change_calculation():
    scanner = ScannerEngine()
    ch, chp = scanner.calculate_price_change(1050.0, 1000.0)
    assert ch == 50.0
    assert chp == 5.0

    ch_neg, chp_neg = scanner.calculate_price_change(980.0, 1000.0)
    assert ch_neg == -20.0
    assert chp_neg == -2.0


def test_volume_spike_detection():
    scanner = ScannerEngine(rvol_threshold=2.0)
    assert scanner.is_volume_spike(2.0) is True
    assert scanner.is_volume_spike(2.45) is True
    assert scanner.is_volume_spike(1.99) is False
    assert scanner.is_volume_spike(0.85) is False


def test_compute_market_summary():
    scanner = ScannerEngine(rvol_threshold=2.0)
    ticks = [
        NormalizedTick(
            symbol="NSE:INFY-EQ", ticker="INFY", company_name="Infosys", sector="IT",
            ltp=1800.0, prev_close=1750.0, change=50.0, change_percent=2.86,
            today_volume=3000000, avg_volume=1000000, relative_volume=3.0,
            open_price=1760.0, high_price=1810.0, low_price=1755.0,
            timestamp=1700000000, is_volume_spike=True
        ),
        NormalizedTick(
            symbol="NSE:TCS-EQ", ticker="TCS", company_name="TCS", sector="IT",
            ltp=3900.0, prev_close=4000.0, change=-100.0, change_percent=-2.5,
            today_volume=800000, avg_volume=1000000, relative_volume=0.8,
            open_price=3980.0, high_price=4010.0, low_price=3890.0,
            timestamp=1700000001, is_volume_spike=False
        ),
        NormalizedTick(
            symbol="NSE:SBIN-EQ", ticker="SBIN", company_name="SBI", sector="Banking",
            ltp=800.0, prev_close=800.0, change=0.0, change_percent=0.0,
            today_volume=1200000, avg_volume=1000000, relative_volume=1.2,
            open_price=800.0, high_price=805.0, low_price=795.0,
            timestamp=1700000002, is_volume_spike=False
        ),
    ]

    summary = scanner.compute_market_summary(ticks)
    assert summary.stocks_monitored == 3
    assert summary.above_average_volume == 2  # INFY and SBIN > avg_vol
    assert summary.high_rvol == 1  # INFY >= 2.0x
    assert summary.gainers == 1  # INFY
    assert summary.losers == 1  # TCS
    assert summary.unchanged == 1  # SBIN
    assert summary.total_volume_traded == 5000000
