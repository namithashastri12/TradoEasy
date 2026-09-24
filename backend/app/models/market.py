from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class NormalizedTick(BaseModel):
    symbol: str
    ticker: str
    company_name: str
    sector: str
    ltp: float = Field(..., description="Last Traded Price")
    prev_close: float = Field(0.0, description="Previous session closing price")
    change: float = Field(0.0, description="Absolute price change from prev close")
    change_percent: float = Field(0.0, description="Percentage change from prev close")
    today_volume: int = Field(0, description="Cumulative volume traded today")
    avg_volume: int = Field(1, description="Historical average volume (e.g. 20-day SMA)")
    relative_volume: float = Field(1.0, description="today_volume / avg_volume")
    open_price: float = Field(0.0, description="Day open price")
    high_price: float = Field(0.0, description="Day high price")
    low_price: float = Field(0.0, description="Day low price")
    timestamp: int = Field(..., description="Epoch timestamp of the update in seconds")
    is_volume_spike: bool = Field(False, description="True if RVOL >= configured threshold")
    avg_volumes: Optional[Dict[str, int]] = Field(None, description="Average volumes by period: 1W, 1M, 45D, 3M, 6M")
    price_changes: Optional[Dict[str, Dict[str, float]]] = Field(None, description="Price change and % change by period: 1W, 1M, 3M, 6M")


class MarketSummary(BaseModel):
    stocks_monitored: int = 0
    above_average_volume: int = 0
    high_rvol: int = 0
    gainers: int = 0
    losers: int = 0
    unchanged: int = 0
    total_volume_traded: int = 0
    last_update_time: Optional[int] = None


class MarketStatusInfo(BaseModel):
    status: str
    display: str
    is_open: bool
    ist_time: str
    reason: Optional[str] = None


class InstrumentMetadata(BaseModel):
    symbol: str
    ticker: str
    name: str
    sector: str
    default_avg_volume: int = 1000000


class UniverseDefinition(BaseModel):
    id: str
    name: str
    category: str
    description: Optional[str] = None
    symbols: List[str]


class SystemStatusResponse(BaseModel):
    mode: str  # "LIVE" or "DEMO"
    connection_status: str  # "CONNECTED", "CONNECTING", "RECONNECTING", "DISCONNECTED"
    fyers_connected: bool
    is_stale: bool
    last_tick_time: Optional[int] = None
    seconds_since_last_tick: Optional[float] = None
    active_universe: str
    symbols_count: int
    market_status: MarketStatusInfo


class AlertRule(BaseModel):
    id: str
    symbol: str
    type: str  # "PRICE_ABOVE", "PRICE_BELOW", "RVOL_ABOVE", "CHANGE_PCT_ABOVE", "CHANGE_PCT_BELOW"
    threshold: float
    notes: Optional[str] = None
    cooldown_seconds: int = 300  # 5 minutes default cooldown per symbol/rule
    created_at: int = 0


class AlertNotification(BaseModel):
    id: str
    rule_id: str
    symbol: str
    ticker: str
    title: str
    message: str
    triggered_value: float
    threshold: float
    timestamp: int
