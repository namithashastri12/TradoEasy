export type AvgVolumePeriod = '1W' | '1M' | '45D' | '3M' | '6M';
export type PriceChangePeriod = '1D' | '1W' | '1M' | '3M' | '6M';

export interface MarketTick {
  symbol: string;
  ticker: string;
  company_name: string;
  sector: string;
  ltp: number;
  prev_close: number;
  change: number;
  change_percent: number;
  today_volume: number;
  avg_volume: number;
  relative_volume: number;
  open_price: number;
  high_price: number;
  low_price: number;
  timestamp: number;
  is_volume_spike: boolean;
  avg_volumes?: Partial<Record<AvgVolumePeriod, number>>;
  price_changes?: Partial<Record<PriceChangePeriod, { change: number; change_percent: number }>>;
}

export interface MarketSummary {
  stocks_monitored: number;
  above_average_volume: number;
  high_rvol: number;
  gainers: number;
  losers: number;
  unchanged: number;
  total_volume_traded: number;
  last_update_time?: number | null;
}

export interface MarketStatusInfo {
  status: 'PRE_MARKET' | 'OPEN' | 'CLOSED' | string;
  display: string;
  is_open: boolean;
  ist_time: string;
  reason?: string;
}

export interface Universe {
  id: string;
  name: string;
  category: string;
  description?: string;
  symbols_count: number;
}

export interface FilterState {
  universeId: string;
  avgVolumePeriod: AvgVolumePeriod; // '1W' | '1M' | '45D' (default) | '3M' | '6M'
  priceChangePeriod: PriceChangePeriod; // '1D' (default) | '1W' | '1M' | '3M' | '6M'
  volume: string;       // "ALL" | "ABOVE_AVERAGE" | "BELOW_AVERAGE" | "HIGH_VOLUME"
  priceChange: string;  // "ALL" | "POSITIVE" | "NEGATIVE" | "1%" | "2%" | "<-1%" | "<-2%"
  sector: string;       // "ALL" | specific sector
  relativeVolume: string; // "ALL" | "1X" | "1.5X" | "2X" | "3X"
  searchQuery: string;
}

export interface SRObservation {
  support: string;
  resistance: string;
}

export interface AlertRule {
  id: string;
  symbol: string;
  type: 'PRICE_ABOVE' | 'PRICE_BELOW' | 'RVOL_ABOVE' | 'CHANGE_PCT_ABOVE' | 'CHANGE_PCT_BELOW';
  threshold: number;
  notes?: string;
}

export interface AlertNotification {
  id: string;
  rule_id: string;
  symbol: string;
  ticker: string;
  title: string;
  message: string;
  triggered_value: number;
  threshold: number;
  timestamp: number;
}

export type ConnectionState = 'CONNECTED' | 'CONNECTING' | 'RECONNECTING' | 'DISCONNECTED';
export type AppMode = 'LIVE' | 'DEMO';
