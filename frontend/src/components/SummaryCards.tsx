import React from 'react';
import { Layers, Volume2, Zap, TrendingUp, TrendingDown } from 'lucide-react';
import { MarketSummary } from '../types/market';

interface SummaryCardsProps {
  summary: MarketSummary;
  activeUniverseName: string;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ summary, activeUniverseName }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
      {/* 1. Stocks Monitored */}
      <div className="bg-[#101522] border border-[#232C42] rounded-lg p-3.5 flex flex-col justify-between hover:border-[#2F3B59] transition-colors">
        <div className="flex items-center justify-between text-slate-400 mb-1.5">
          <span className="text-xs font-mono font-medium tracking-wide uppercase">Monitored</span>
          <Layers className="w-4 h-4 text-blue-400" />
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-mono font-bold text-white tracking-tight">
            {summary.stocks_monitored}
          </span>
          <span className="text-[11px] font-mono text-slate-400 truncate max-w-[90px]" title={activeUniverseName}>
            {activeUniverseName}
          </span>
        </div>
      </div>

      {/* 2. Above Average Volume */}
      <div className="bg-[#101522] border border-[#232C42] rounded-lg p-3.5 flex flex-col justify-between hover:border-[#2F3B59] transition-colors">
        <div className="flex items-center justify-between text-slate-400 mb-1.5">
          <span className="text-xs font-mono font-medium tracking-wide uppercase">Above Avg Vol</span>
          <Volume2 className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-mono font-bold text-cyan-300 tracking-tight">
            {summary.above_average_volume}
          </span>
          <span className="text-[11px] font-mono text-slate-500">
            {summary.stocks_monitored > 0
              ? `${Math.round((summary.above_average_volume / summary.stocks_monitored) * 100)}%`
              : '0%'}
          </span>
        </div>
      </div>

      {/* 3. High RVOL (Volume Spike) */}
      <div className="bg-[#101522] border border-[#232C42] rounded-lg p-3.5 flex flex-col justify-between hover:border-amber-600/40 transition-colors">
        <div className="flex items-center justify-between text-slate-400 mb-1.5">
          <span className="text-xs font-mono font-medium tracking-wide uppercase text-amber-300">High RVOL (&gt;200%)</span>
          <Zap className="w-4 h-4 text-amber-400" />
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-mono font-bold text-amber-400 tracking-tight">
            {summary.high_rvol}
          </span>
          <span className="text-[11px] font-mono text-amber-500/80">Spike</span>
        </div>
      </div>

      {/* 4. Gainers */}
      <div className="bg-[#101522] border border-[#232C42] rounded-lg p-3.5 flex flex-col justify-between hover:border-emerald-600/40 transition-colors">
        <div className="flex items-center justify-between text-slate-400 mb-1.5">
          <span className="text-xs font-mono font-medium tracking-wide uppercase text-emerald-400">Gainers</span>
          <TrendingUp className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-mono font-bold text-emerald-400 tracking-tight">
            {summary.gainers}
          </span>
          <span className="text-[11px] font-mono text-emerald-500/80">
            {summary.stocks_monitored > 0
              ? `${Math.round((summary.gainers / summary.stocks_monitored) * 100)}%`
              : '0%'}
          </span>
        </div>
      </div>

      {/* 5. Losers */}
      <div className="bg-[#101522] border border-[#232C42] rounded-lg p-3.5 flex flex-col justify-between hover:border-red-600/40 transition-colors">
        <div className="flex items-center justify-between text-slate-400 mb-1.5">
          <span className="text-xs font-mono font-medium tracking-wide uppercase text-red-400">Losers</span>
          <TrendingDown className="w-4 h-4 text-red-400" />
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-mono font-bold text-red-400 tracking-tight">
            {summary.losers}
          </span>
          <span className="text-[11px] font-mono text-red-500/80">
            {summary.stocks_monitored > 0
              ? `${Math.round((summary.losers / summary.stocks_monitored) * 100)}%`
              : '0%'}
          </span>
        </div>
      </div>
    </div>
  );
};
