import React, { useState, useMemo } from 'react';
import { ArrowUpDown, AlertCircle, TrendingUp } from 'lucide-react';
import { MarketTick, SRObservation } from '../types/market';
import { ScannerRow } from './ScannerRow';

interface ScannerTableProps {
  ticks: MarketTick[];
  observations: Record<string, SRObservation>;
  onUpdateSR: (symbol: string, field: 'support' | 'resistance', value: string) => void;
}

type SortField = 'ticker' | 'avg_volume' | 'today_volume' | 'relative_volume' | 'ltp' | 'change_percent';
type SortOrder = 'asc' | 'desc';

export const ScannerTable: React.FC<ScannerTableProps> = ({
  ticks,
  observations,
  onUpdateSR,
}) => {
  const [sortField, setSortField] = useState<SortField>('relative_volume');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc'); // Default to descending for numbers
    }
  };

  const sortedTicks = useMemo(() => {
    const list = [...ticks];
    list.sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (typeof valA === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });
    return list;
  }, [ticks, sortField, sortOrder]);

  return (
    <div className="bg-[#101522] border border-[#232C42] rounded-xl overflow-hidden shadow-xl mb-6 flex flex-col">
      
      {/* Table Section Header */}
      <div className="px-5 py-3.5 border-b border-[#232C42] bg-[#0E131F] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-bold font-mono text-white tracking-wide uppercase">
              Volume & Price Scanner
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Monitor real-time price movement, relative volume (RVOL), and support/resistance boundaries.
          </p>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <span className="text-xs font-mono text-slate-400">
            Showing <strong className="text-white">{sortedTicks.length}</strong> instruments
          </span>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto max-h-[70vh] relative">
        <table className="w-full border-collapse text-left">
          
          {/* Sticky Header */}
          <thead className="bg-[#131826] text-slate-400 text-[11px] font-mono uppercase tracking-wider sticky top-0 z-20 border-b border-[#232C42]">
            <tr>
              <th className="py-2.5 px-3 text-center w-12">Sl.</th>

              <th
                onClick={() => handleSort('ticker')}
                className="py-2.5 px-3 cursor-pointer hover:text-white transition-colors select-none"
              >
                <div className="flex items-center gap-1">
                  <span>Stock</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>

              <th
                onClick={() => handleSort('avg_volume')}
                className="py-2.5 px-3 text-right cursor-pointer hover:text-white transition-colors select-none"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Avg Volume</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>

              <th
                onClick={() => handleSort('today_volume')}
                className="py-2.5 px-3 text-right cursor-pointer hover:text-white transition-colors select-none"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Today's Vol</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>

              <th
                onClick={() => handleSort('relative_volume')}
                className="py-2.5 px-3 text-right cursor-pointer hover:text-amber-400 transition-colors select-none"
              >
                <div className="flex items-center justify-end gap-1">
                  <span className="text-amber-400 font-semibold">Rel. Vol. (%)</span>
                  <ArrowUpDown className="w-3 h-3 text-amber-500" />
                </div>
              </th>

              <th
                onClick={() => handleSort('ltp')}
                className="py-2.5 px-3 text-right cursor-pointer hover:text-white transition-colors select-none"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Last Price</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>

              <th
                onClick={() => handleSort('change_percent')}
                className="py-2.5 px-3 text-right cursor-pointer hover:text-white transition-colors select-none"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Price Change</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>

              <th className="py-2.5 px-3">Sector</th>
              <th className="py-2.5 px-2 w-28 text-right text-emerald-400">Support</th>
              <th className="py-2.5 px-2 w-28 text-right text-red-400">Resistance</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-[#1E263C]">
            {sortedTicks.length > 0 ? (
              sortedTicks.map((tick, idx) => (
                <ScannerRow
                  key={tick.symbol}
                  index={idx}
                  tick={tick}
                  srNote={observations[tick.symbol]}
                  onUpdateSR={onUpdateSR}
                />
              ))
            ) : (
              <tr>
                <td colSpan={10} className="py-16 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-400 max-w-md mx-auto px-4">
                    <AlertCircle className="w-8 h-8 text-slate-500 mb-2" />
                    <p className="font-mono text-sm font-semibold text-slate-200">
                      No stocks match your filters
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Try adjusting your filters or search query to view instruments.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>

        </table>
      </div>

    </div>
  );
};
