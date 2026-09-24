import React from 'react';
import {
  Activity,
  WifiOff,
  AlertTriangle,
  RotateCcw,
  Bell,
  Trash2,
  Clock,
  Zap,
} from 'lucide-react';
import { MarketStatusInfo, ConnectionState, AppMode } from '../types/market';
import { formatTime } from '../utils/formatters';

interface HeaderProps {
  marketStatus: MarketStatusInfo;
  connectionState: ConnectionState;
  mode: AppMode;
  isStale: boolean;
  secondsSinceLastUpdate: number;
  lastUpdateTimestamp: number | null;
  onRefresh: () => void;
  onOpenClearNotes: () => void;
  onOpenAlertModal: () => void;
  onOpenFyersModal: () => void;
  savedNotesCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  marketStatus,
  connectionState,
  mode,
  isStale,
  secondsSinceLastUpdate,
  lastUpdateTimestamp,
  onRefresh,
  onOpenClearNotes,
  onOpenAlertModal,
  onOpenFyersModal,
  savedNotesCount,
}) => {
  // Connection badge color & text
  const getConnectionBadge = () => {
    if (connectionState === 'DISCONNECTED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-950/60 border border-red-800/80 text-red-400 text-xs font-mono font-medium">
          <WifiOff className="w-3.5 h-3.5 text-red-400" />
          OFFLINE
        </span>
      );
    }
    if (connectionState === 'RECONNECTING' || connectionState === 'CONNECTING') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-950/60 border border-amber-800/80 text-amber-400 text-xs font-mono font-medium animate-pulse">
          <RotateCcw className="w-3.5 h-3.5 animate-spin text-amber-400" />
          {connectionState === 'RECONNECTING' ? 'RECONNECTING...' : 'CONNECTING...'}
        </span>
      );
    }
    if (mode === 'LIVE') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950/60 border border-emerald-600/80 text-emerald-300 text-xs font-mono font-medium shadow-[0_0_10px_rgba(16,185,129,0.2)]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          LIVE · FYERS
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950/40 border border-emerald-600/60 text-emerald-300 text-xs font-mono font-medium">
        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        DEMO · 200 STOCKS ACTIVE
      </span>
    );
  };

  // Market status color
  const getMarketStatusColor = () => {
    if (marketStatus.status === 'OPEN') return 'text-emerald-400 border-emerald-800/60 bg-emerald-950/40';
    if (marketStatus.status === 'PRE_MARKET') return 'text-amber-400 border-amber-800/60 bg-amber-950/40';
    return 'text-slate-400 border-slate-700/60 bg-slate-900/40';
  };

  return (
    <header className="border-b border-[#232C42] bg-[#0E131F]/90 backdrop-blur sticky top-0 z-30 px-4 py-3">
      <div className="max-w-[1720px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        {/* Left: Brand & Real-Time Intelligence */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-wider font-mono text-white">tradoeasy</h1>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-900/50 border border-blue-700/60 text-blue-300 font-mono">
                  v1.0
                </span>
              </div>
              <p className="text-[10px] tracking-widest text-slate-400 font-mono uppercase">
                REAL-TIME MARKET INTELLIGENCE
              </p>
            </div>
          </div>

          <div className="h-6 w-[1px] bg-[#232C42] hidden sm:block" />

          {/* Market Status */}
          <div className={`hidden sm:inline-flex items-center gap-2 px-2.5 py-1 rounded text-xs font-mono font-medium border ${getMarketStatusColor()}`}>
            <span className={`h-2 w-2 rounded-full ${marketStatus.status === 'OPEN' ? 'bg-emerald-400 animate-pulse' : marketStatus.status === 'PRE_MARKET' ? 'bg-amber-400' : 'bg-slate-500'}`} />
            {marketStatus.display || 'NSE MARKET'}
          </div>
        </div>

        {/* Right: Telemetry & Terminal Actions */}
        <div className="flex items-center flex-wrap gap-2.5 w-full md:w-auto justify-between md:justify-end">
          
          {/* Stale Warning */}
          {isStale && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-950/70 border border-red-700 text-red-300 text-xs font-mono animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              <span>DATA STALE · Last update {secondsSinceLastUpdate}s ago</span>
            </div>
          )}

          {/* Connection Status Badge (Clickable to open FYERS modal) */}
          <button
            onClick={onOpenFyersModal}
            title="Configure FYERS API V3 Real-Time Feed"
            className="hover:opacity-90 transition-opacity focus:outline-none"
          >
            {getConnectionBadge()}
          </button>

          {/* FYERS Connect / Live Feed Settings Button */}
          <button
            onClick={onOpenFyersModal}
            title="FYERS API V3 Real-Time Connection Settings"
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-mono font-medium transition-colors border ${
              mode === 'LIVE'
                ? 'bg-emerald-950/70 border-emerald-600/90 text-emerald-300 hover:bg-emerald-900/80 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                : 'bg-blue-950/60 border-blue-600/80 text-blue-300 hover:bg-blue-900/60'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>{mode === 'LIVE' ? 'FYERS LIVE' : 'Connect FYERS'}</span>
          </button>

          {/* Last Update Time */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#161C2D] border border-[#232C42] text-slate-300 text-xs font-mono">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>Updated {formatTime(lastUpdateTimestamp)}</span>
          </div>

          {/* Refresh snapshot button */}
          <button
            onClick={onRefresh}
            title="Force refresh market snapshot (auto-refreshes every 20s)"
            className="p-1.5 rounded bg-[#161C2D] hover:bg-[#1E263C] border border-[#232C42] hover:border-slate-600 text-slate-300 hover:text-white transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Alerts Trigger Button */}
          <button
            onClick={onOpenAlertModal}
            title="Configure Real-Time Alerts"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-[#161C2D] hover:bg-[#1E263C] border border-[#232C42] hover:border-slate-600 text-slate-300 hover:text-white text-xs font-mono transition-colors"
          >
            <Bell className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Alerts</span>
          </button>

          {/* Clear Saved Notes Button */}
          <button
            onClick={onOpenClearNotes}
            title="Clear Support/Resistance observations"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-[#161C2D] hover:bg-red-950/50 border border-[#232C42] hover:border-red-800 text-slate-300 hover:text-red-300 text-xs font-mono transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 text-slate-400 hover:text-red-400" />
            <span className="hidden sm:inline">Clear Notes</span>
            {savedNotesCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-blue-900/60 border border-blue-700/60 text-blue-300 text-[10px]">
                {savedNotesCount}
              </span>
            )}
          </button>
        </div>

      </div>
    </header>
  );
};
