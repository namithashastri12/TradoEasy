import React from 'react';
import { Search, RotateCcw, Compass } from 'lucide-react';
import { FilterState } from '../types/market';

interface FilterBarProps {
  filter: FilterState;
  onFilterChange: (newFilter: FilterState | ((prev: FilterState) => FilterState)) => void;
  onResetFilters: () => void;
  onOpenUniverseModal: () => void;
  activeUniverseName: string;
  sectorsList: string[];
  totalMatches: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filter,
  onFilterChange,
  onResetFilters,
  onOpenUniverseModal,
  activeUniverseName,
  sectorsList,
  totalMatches,
}) => {
  const updateField = (field: keyof FilterState, value: string) => {
    onFilterChange((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const hasActiveFilters =
    filter.avgVolumePeriod !== '45D' ||
    filter.priceChangePeriod !== '1D' ||
    filter.volume !== 'ALL' ||
    filter.priceChange !== 'ALL' ||
    filter.sector !== 'ALL' ||
    filter.relativeVolume !== 'ALL' ||
    filter.searchQuery.trim() !== '';

  return (
    <div className="bg-[#101522] border border-[#232C42] rounded-lg p-3 mb-4 shadow-md">
      <div className="flex flex-wrap items-center gap-2.5">
        
        {/* 1. Universe Selector Button */}
        <button
          onClick={onOpenUniverseModal}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#161C2D] hover:bg-[#1E263C] border border-[#232C42] hover:border-blue-500 text-xs font-mono font-medium text-white transition-colors"
          title="Change active index or sectoral universe"
        >
          <Compass className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-slate-400">Index:</span>
          <span className="text-blue-300 font-semibold">{activeUniverseName}</span>
        </button>

        {/* Days for Avg Volume Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-mono text-cyan-400 font-medium">Avg Vol Days:</span>
          <select
            value={filter.avgVolumePeriod}
            onChange={(e) => updateField('avgVolumePeriod', e.target.value as any)}
            className="bg-[#161C2D] border border-cyan-800/60 hover:border-cyan-500 focus:border-cyan-400 rounded px-2 py-1 text-xs font-mono text-cyan-200 focus:outline-none transition-colors"
          >
            <option value="45D">45 days- default</option>
            <option value="1W">1 week</option>
            <option value="1M">1 month</option>
            <option value="3M">3 month</option>
            <option value="6M">6 month</option>
          </select>
        </div>

        {/* Days for % Change Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-mono text-emerald-400 font-medium">% Change Days:</span>
          <select
            value={filter.priceChangePeriod}
            onChange={(e) => updateField('priceChangePeriod', e.target.value as any)}
            className="bg-[#161C2D] border border-emerald-800/60 hover:border-emerald-500 focus:border-emerald-400 rounded px-2 py-1 text-xs font-mono text-emerald-200 focus:outline-none transition-colors"
          >
            <option value="1D">1 day -default</option>
            <option value="1W">1 week</option>
            <option value="1M">1 month</option>
            <option value="3M">3 month</option>
            <option value="6M">6 month</option>
          </select>
        </div>

        <div className="h-5 w-[1px] bg-[#232C42] hidden sm:block" />

        {/* 2. Relative Volume Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-mono text-slate-400">RVOL:</span>
          <select
            value={filter.relativeVolume}
            onChange={(e) => updateField('relativeVolume', e.target.value)}
            className="bg-[#161C2D] border border-[#232C42] hover:border-slate-500 focus:border-blue-500 rounded px-2 py-1 text-xs font-mono text-slate-200 focus:outline-none transition-colors"
          >
            <option value="ALL">All RVOL</option>
            <option value="1X">≥ 100% (Normal)</option>
            <option value="1.5X">≥ 150% (High)</option>
            <option value="2X">≥ 200% (Spike)</option>
            <option value="3X">≥ 300% (Extreme)</option>
          </select>
        </div>

        {/* 3. Volume Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-mono text-slate-400">Vol:</span>
          <select
            value={filter.volume}
            onChange={(e) => updateField('volume', e.target.value)}
            className="bg-[#161C2D] border border-[#232C42] hover:border-slate-500 focus:border-blue-500 rounded px-2 py-1 text-xs font-mono text-slate-200 focus:outline-none transition-colors"
          >
            <option value="ALL">All Volume</option>
            <option value="ABOVE_AVERAGE">Above Average</option>
            <option value="BELOW_AVERAGE">Below Average</option>
            <option value="HIGH_VOLUME">High Volume (&gt;1.5x)</option>
          </select>
        </div>

        {/* 4. Price Change Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-mono text-slate-400">Change:</span>
          <select
            value={filter.priceChange}
            onChange={(e) => updateField('priceChange', e.target.value)}
            className="bg-[#161C2D] border border-[#232C42] hover:border-slate-500 focus:border-blue-500 rounded px-2 py-1 text-xs font-mono text-slate-200 focus:outline-none transition-colors"
          >
            <option value="ALL">All Changes</option>
            <option value="POSITIVE">Positive (+)</option>
            <option value="NEGATIVE">Negative (-)</option>
            <option value="1%">≥ +1.0%</option>
            <option value="2%">≥ +2.0%</option>
            <option value="<-1%">≤ -1.0%</option>
            <option value="<-2%">≤ -2.0%</option>
          </select>
        </div>

        {/* 5. Sector Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-mono text-slate-400">Sector:</span>
          <select
            value={filter.sector}
            onChange={(e) => updateField('sector', e.target.value)}
            className="bg-[#161C2D] border border-[#232C42] hover:border-slate-500 focus:border-blue-500 rounded px-2 py-1 text-xs font-mono text-slate-200 focus:outline-none transition-colors"
          >
            <option value="ALL">All Sectors</option>
            {sectorsList.map((sec) => (
              <option key={sec} value={sec}>
                {sec}
              </option>
            ))}
          </select>
        </div>

        {/* 6. Find Stock Search Box */}
        <div className="flex-1 min-w-[160px] sm:min-w-[200px] relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Find stock (INFY, SBI, Reliance)..."
            value={filter.searchQuery}
            onChange={(e) => updateField('searchQuery', e.target.value)}
            className="w-full bg-[#161C2D] border border-[#232C42] hover:border-slate-500 focus:border-blue-500 rounded pl-8 pr-3 py-1 text-xs font-mono text-white placeholder-slate-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Matches Indicator */}
        <div className="hidden xl:flex items-center px-2 py-1 rounded bg-[#161C2D] border border-[#232C42] text-[11px] font-mono text-slate-400">
          <span>Matching: <strong className="text-white">{totalMatches}</strong></span>
        </div>

        {/* Reset Filters Control */}
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            title="Reset active filters"
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}

      </div>
    </div>
  );
};
