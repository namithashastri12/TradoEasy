import { useState, useEffect, useRef, useCallback } from 'react';
import {
  MarketTick,
  MarketSummary,
  MarketStatusInfo,
  ConnectionState,
  AppMode,
  AlertNotification
} from '../types/market';
import { createInitialTicks, computeSummary } from '../utils/demoDataFallback';

interface UseMarketWebSocketReturn {
  ticks: Record<string, MarketTick>;
  ticksList: MarketTick[];
  summary: MarketSummary;
  marketStatus: MarketStatusInfo;
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  connectionState: ConnectionState;
  isStale: boolean;
  secondsSinceLastUpdate: number;
  lastUpdateTimestamp: number | null;
  changeUniverse: (universeId: string) => void;
  requestSnapshot: () => void;
  recentAlerts: AlertNotification[];
  dismissAlert: (id: string) => void;
  lastAutoRefreshTime: number;
}

const INITIAL_TICKS = createInitialTicks();
const INITIAL_SUMMARY = computeSummary(Object.values(INITIAL_TICKS));

const DEFAULT_MARKET_STATUS: MarketStatusInfo = {
  status: 'OPEN',
  display: 'NSE · MARKET OPEN',
  is_open: true,
  ist_time: new Date().toLocaleTimeString('en-IN'),
};

export function useMarketWebSocket(activeUniverseId: string): UseMarketWebSocketReturn {
  const [ticks, setTicks] = useState<Record<string, MarketTick>>(INITIAL_TICKS);
  const [summary, setSummary] = useState<MarketSummary>(INITIAL_SUMMARY);
  const [marketStatus, setMarketStatus] = useState<MarketStatusInfo>(DEFAULT_MARKET_STATUS);
  const [mode, setMode] = useState<AppMode>('DEMO');
  const [connectionState, setConnectionState] = useState<ConnectionState>('CONNECTED');
  const [isStale, setIsStale] = useState<boolean>(false);
  const [secondsSinceLastUpdate, setSecondsSinceLastUpdate] = useState<number>(0);
  const [lastUpdateTimestamp, setLastUpdateTimestamp] = useState<number | null>(Math.floor(Date.now() / 1000));
  const [recentAlerts, setRecentAlerts] = useState<AlertNotification[]>([]);
  const [lastAutoRefreshTime, setLastAutoRefreshTime] = useState<number>(Date.now());
  const [isUsingClientSimulation, setIsUsingClientSimulation] = useState<boolean>(() => {
    const isVercel = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app');
    const hasCustomBackend = typeof window !== 'undefined' && Boolean(localStorage.getItem('tradoeasy_backend_url'));
    return isVercel && !hasCustomBackend;
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const lastTickTimeRef = useRef<number>(Date.now());

  const getBackendBaseUrl = useCallback(() => {
    const saved = localStorage.getItem('tradoeasy_backend_url');
    if (saved) return saved.trim().replace(/\/+$/, '');
    return '';
  }, []);

  // Determine WebSocket URL dynamically based on configured backend or window.location
  const getWebSocketUrl = useCallback(() => {
    const saved = localStorage.getItem('tradoeasy_backend_url');
    if (saved) {
      const clean = saved.trim().replace(/\/+$/, '');
      const wsProtocol = clean.startsWith('https:') ? 'wss:' : 'ws:';
      const hostPart = clean.replace(/^https?:\/\//, '');
      return `${wsProtocol}//${hostPart}/ws/market`;
    }
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    return `${protocol}//${host}/ws/market`;
  }, []);

  // Request a fresh snapshot
  const requestSnapshot = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action: 'REQUEST_SNAPSHOT' }));
    } else {
      const base = getBackendBaseUrl();
      if (!base && typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
        return;
      }
      fetch(`${base}/api/snapshot`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.ticks) {
            const map: Record<string, MarketTick> = {};
            data.ticks.forEach((t: MarketTick) => {
              map[t.symbol] = t;
            });
            setTicks(map);
            if (data.summary) setSummary(data.summary);
            if (data.market_status) setMarketStatus(data.market_status);
            if (data.mode) setMode(data.mode);
            lastTickTimeRef.current = Date.now();
            setLastUpdateTimestamp(data.last_tick_time || Math.floor(Date.now() / 1000));
          }
        })
        .catch((err) => console.warn('Snapshot fetch error:', err));
    }
  }, [getBackendBaseUrl]);

  const changeUniverse = useCallback((universeId: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        action: 'CHANGE_UNIVERSE',
        universe_id: universeId
      }));
    } else {
      const base = getBackendBaseUrl();
      if (!base && typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
        return;
      }
      fetch(`${base}/api/universe/select`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ universe_id: universeId }),
      })
        .then(() => requestSnapshot())
        .catch((err) => console.error('Universe selection error:', err));
    }
  }, [getBackendBaseUrl, requestSnapshot]);

  // Connect WebSocket
  const connect = useCallback(() => {
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const isVercel = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app');
    const hasCustomBackend = typeof window !== 'undefined' && Boolean(localStorage.getItem('tradoeasy_backend_url'));

    if (isVercel && !hasCustomBackend) {
      setIsUsingClientSimulation(true);
      setConnectionState('CONNECTED');
      setMode('DEMO');
      return;
    }

    setConnectionState((prev) => (prev === 'CONNECTED' ? 'RECONNECTING' : 'CONNECTING'));

    try {
      const socketUrl = getWebSocketUrl();
      const ws = new WebSocket(socketUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnectionState('CONNECTED');
        reconnectAttemptsRef.current = 0;
        setIsStale(false);
        lastTickTimeRef.current = Date.now();
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          const now = Date.now();
          lastTickTimeRef.current = now;
          setIsStale(false);

          if (message.type === 'SNAPSHOT' && message.data) {
            const data = message.data;
            const newTicksMap: Record<string, MarketTick> = {};
            (data.ticks || []).forEach((t: MarketTick) => {
              newTicksMap[t.symbol] = t;
            });
            setTicks(newTicksMap);
            if (data.summary) setSummary(data.summary);
            if (data.market_status) setMarketStatus(data.market_status);
            if (data.mode) setMode(data.mode);
            setLastUpdateTimestamp(data.last_tick_time || Math.floor(now / 1000));
          } else if (message.type === 'BATCH_UPDATE' && Array.isArray(message.ticks)) {
            setTicks((prev) => {
              const updated = { ...prev };
              message.ticks.forEach((t: MarketTick) => {
                updated[t.symbol] = t;
              });
              return updated;
            });
            setLastUpdateTimestamp(message.timestamp || Math.floor(now / 1000));

            if (message.alerts && message.alerts.length > 0) {
              setRecentAlerts((prev) => [...message.alerts, ...prev].slice(0, 10));
            }
          } else if (message.type === 'TICK' && message.tick) {
            const tick = message.tick;
            setTicks((prev) => ({
              ...prev,
              [tick.symbol]: tick,
            }));
            setLastUpdateTimestamp(tick.timestamp);

            if (message.alerts && message.alerts.length > 0) {
              setRecentAlerts((prev) => [...message.alerts, ...prev].slice(0, 10));
            }
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      ws.onclose = () => {
        wsRef.current = null;
        setIsUsingClientSimulation(true);

        const isVercelNow = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app');
        const hasCustomBackendNow = typeof window !== 'undefined' && Boolean(localStorage.getItem('tradoeasy_backend_url'));
        if (isVercelNow && !hasCustomBackendNow) {
          setConnectionState('CONNECTED');
          setMode('DEMO');
          return;
        }

        // Exponential backoff reconnect: 1s, 2s, 4s, 8s, max 10s
        const backoff = Math.min(10000, 1000 * Math.pow(1.8, reconnectAttemptsRef.current));
        reconnectAttemptsRef.current += 1;

        if (reconnectTimeoutRef.current) {
          window.clearTimeout(reconnectTimeoutRef.current);
        }
        reconnectTimeoutRef.current = window.setTimeout(() => {
          connect();
        }, backoff);
      };

      ws.onerror = () => {
        setIsUsingClientSimulation(true);
        ws.close();
      };
    } catch (e) {
      console.error('Failed to construct WebSocket:', e);
      setIsUsingClientSimulation(true);
    }
  }, [getWebSocketUrl]);

  // Client-side simulation fallback when WebSocket is disconnected (e.g. standalone Vercel preview)
  useEffect(() => {
    if (!isUsingClientSimulation) return;

    setConnectionState('CONNECTED');
    setMode('DEMO');

    const simInterval = setInterval(() => {
      setTicks((prev) => {
        const symbols = Object.keys(prev);
        if (symbols.length === 0) return prev;

        const updated = { ...prev };
        const count = Math.min(symbols.length, 3 + Math.floor(Math.random() * 4));
        for (let i = 0; i < count; i++) {
          const sym = symbols[Math.floor(Math.random() * symbols.length)];
          const current = updated[sym];
          if (!current) continue;

          const deltaPct = (Math.random() - 0.49) * 0.003;
          const newLtp = Math.round(current.ltp * (1 + deltaPct) * 100) / 100;
          const change = Math.round((newLtp - current.prev_close) * 100) / 100;
          const changePct = Math.round((change / current.prev_close) * 10000) / 100;
          const newVol = current.today_volume + Math.floor(Math.random() * 5000) + 500;
          const rvol = Math.round((newVol / current.avg_volume) * 100) / 100;

          updated[sym] = {
            ...current,
            ltp: newLtp,
            change: change,
            change_percent: changePct,
            today_volume: newVol,
            relative_volume: rvol,
            high_price: Math.max(current.high_price, newLtp),
            low_price: Math.min(current.low_price, newLtp),
            timestamp: Math.floor(Date.now() / 1000),
            is_volume_spike: rvol >= 2.0,
          };
        }

        setSummary(computeSummary(Object.values(updated)));
        lastTickTimeRef.current = Date.now();
        setLastUpdateTimestamp(Math.floor(Date.now() / 1000));
        return updated;
      });
    }, 450);

    return () => clearInterval(simInterval);
  }, [isUsingClientSimulation]);

  // Initial connection and cleanup
  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        window.clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  // Stale data monitoring loop (checks every 1 second)
  useEffect(() => {
    const timer = setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - lastTickTimeRef.current) / 1000);
      setSecondsSinceLastUpdate(elapsedSeconds);
      if (elapsedSeconds > 20) {
        setIsStale(true);
      } else {
        setIsStale(false);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 20-second auto-refresh cycle (preserves filters, refreshes sync state)
  useEffect(() => {
    const interval = setInterval(() => {
      requestSnapshot();
      setLastAutoRefreshTime(Date.now());
    }, 20000); // 20 seconds

    return () => clearInterval(interval);
  }, [requestSnapshot]);

  // Sync active universe with backend when activeUniverseId prop changes
  const isFirstMountRef = useRef(true);
  useEffect(() => {
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      return;
    }
    if (activeUniverseId) {
      changeUniverse(activeUniverseId);
    }
  }, [activeUniverseId, changeUniverse]);

  const dismissAlert = useCallback((id: string) => {
    setRecentAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const ticksList = Object.values(ticks);

  return {
    ticks,
    ticksList,
    summary,
    marketStatus,
    mode,
    setMode,
    connectionState,
    isStale,
    secondsSinceLastUpdate,
    lastUpdateTimestamp,
    changeUniverse,
    requestSnapshot,
    recentAlerts,
    dismissAlert,
    lastAutoRefreshTime,
  };
}
