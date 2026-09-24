import pytest
from app.services.scanner import ScannerEngine
from app.models.market import NormalizedTick


@pytest.fixture
def sample_ticks():
    return [
        NormalizedTick(
            symbol="NSE:INFY-EQ", ticker="INFY", company_name="Infosys Ltd", sector="IT",
            ltp=1850.0, prev_close=1800.0, change=50.0, change_percent=2.78,
            today_volume=2500000, avg_volume=1000000, relative_volume=2.5,
            open_price=1810.0, high_price=1860.0, low_price=1805.0,
            timestamp=1700000000, is_volume_spike=True
        ),
        NormalizedTick(
            symbol="NSE:TCS-EQ", ticker="TCS", company_name="Tata Consultancy", sector="IT",
            ltp=4100.0, prev_close=4200.0, change=-100.0, change_percent=-2.38,
            today_volume=900000, avg_volume=1000000, relative_volume=0.9,
            open_price=4180.0, high_price=4210.0, low_price=4090.0,
            timestamp=1700000001, is_volume_spike=False
        ),
        NormalizedTick(
            symbol="NSE:HDFCBANK-EQ", ticker="HDFCBANK", company_name="HDFC Bank", sector="Banking",
            ltp=1680.0, prev_close=1650.0, change=30.0, change_percent=1.82,
            today_volume=1800000, avg_volume=1000000, relative_volume=1.8,
            open_price=1655.0, high_price=1690.0, low_price=1650.0,
            timestamp=1700000002, is_volume_spike=False
        ),
        NormalizedTick(
            symbol="NSE:SBIN-EQ", ticker="SBIN", company_name="State Bank of India", sector="Banking",
            ltp=810.0, prev_close=820.0, change=-10.0, change_percent=-1.22,
            today_volume=3200000, avg_volume=1500000, relative_volume=2.13,
            open_price=815.0, high_price=825.0, low_price=805.0,
            timestamp=1700000003, is_volume_spike=True
        ),
    ]


def test_sector_filter(sample_ticks):
    scanner = ScannerEngine()
    it_ticks = scanner.filter_ticks(sample_ticks, sector_filter="IT")
    assert len(it_ticks) == 2
    assert {t.ticker for t in it_ticks} == {"INFY", "TCS"}

    banking_ticks = scanner.filter_ticks(sample_ticks, sector_filter="Banking")
    assert len(banking_ticks) == 2
    assert {t.ticker for t in banking_ticks} == {"HDFCBANK", "SBIN"}


def test_rvol_filter(sample_ticks):
    scanner = ScannerEngine()
    rvol_2x = scanner.filter_ticks(sample_ticks, rvol_filter="2X")
    assert len(rvol_2x) == 2
    assert {t.ticker for t in rvol_2x} == {"INFY", "SBIN"}

    rvol_1_5x = scanner.filter_ticks(sample_ticks, rvol_filter="1.5X")
    assert len(rvol_1_5x) == 3
    assert {t.ticker for t in rvol_1_5x} == {"INFY", "HDFCBANK", "SBIN"}


def test_price_change_filter(sample_ticks):
    scanner = ScannerEngine()
    positive = scanner.filter_ticks(sample_ticks, price_filter="POSITIVE")
    assert len(positive) == 2
    assert {t.ticker for t in positive} == {"INFY", "HDFCBANK"}

    gt_2pct = scanner.filter_ticks(sample_ticks, price_filter="2%")
    assert len(gt_2pct) == 1
    assert gt_2pct[0].ticker == "INFY"

    lt_minus_2 = scanner.filter_ticks(sample_ticks, price_filter="<-2%")
    assert len(lt_minus_2) == 1
    assert lt_minus_2[0].ticker == "TCS"


def test_search_filter(sample_ticks):
    scanner = ScannerEngine()
    search_infy = scanner.filter_ticks(sample_ticks, search_query="infy")
    assert len(search_infy) == 1
    assert search_infy[0].ticker == "INFY"

    search_bank = scanner.filter_ticks(sample_ticks, search_query="Bank")
    assert len(search_bank) == 2
    assert {t.ticker for t in search_bank} == {"HDFCBANK", "SBIN"}


def test_combined_filters_simultaneous(sample_ticks):
    scanner = ScannerEngine()
    # Combined: Sector: IT + RVOL: 2x + Price: Positive + Search: INFY
    result = scanner.filter_ticks(
        sample_ticks,
        sector_filter="IT",
        rvol_filter="2X",
        price_filter="POSITIVE",
        search_query="INFY"
    )
    assert len(result) == 1
    assert result[0].ticker == "INFY"

    # Conflicting combined filters should yield 0 results gracefully
    empty_result = scanner.filter_ticks(
        sample_ticks,
        sector_filter="Banking",
        price_filter="2%",  # No banking stock is > 2% in sample
    )
    assert len(empty_result) == 0
