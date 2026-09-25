import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Database,
  Calendar,
  Search,
  Download,
  Save,
  CheckCircle2,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Layers,
} from 'lucide-react';
import { formatPrice, formatVolume, formatRVOL } from '../utils/formatters';
import { apiFetch } from '../utils/api';

interface DailyHistoryRecord {
  id?: number;
  date: string;
  symbol: string;
  ticker: string;
  name: string;
  sector: string;
  open_price: number;
  high_price: number;
  low_price: number;
  close_price: number;
  prev_close: number;
  change: number;
  change_percent: number;
  today_volume: number;
  avg_volume_45d: number;
  relative_volume: number;
  timestamp: number;
}

interface DailyHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DailyHistoryModal: React.FC<DailyHistoryModalProps> = ({ isOpen, onClose }) => {
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [records, setRecords] = useState<DailyHistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortField, setSortField] = useState<keyof DailyHistoryRecord>('relative_volume');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Fetch available dates when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const fetchDates = async () => {
      try {
        setIsLoading(true);
        const res = await apiFetch('/api/history/dates');
        if (!res.ok) throw new Error('Failed to fetch dates');
        const data = await res.json();
        const dates: string[] = data.dates || [];
        setAvailableDates(dates);
        if (dates.length > 0) {
          // Default to latest date
          setSelectedDate((prev) => (dates.includes(prev) ? prev : dates[0]));
        }
      } catch (err) {
        console.error('Error fetching history dates:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDates();
  }, [isOpen]);

  // Fetch records whenever selectedDate changes
  useEffect(() => {
    if (!selectedDate || !isOpen) return;

    const fetchDayRecords = async () => {
      try {
        setIsLoading(true);
        const res = await apiFetch(`/api/history/day/${selectedDate}`);
        if (!res.ok) throw new Error('Failed to fetch day records');
        const data = await res.json();
        setRecords(data.records || data.stocks || []);
      } catch (err) {
        console.error(`Error fetching records for ${selectedDate}:`, err);
        setRecords([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDayRecords();
  }, [selectedDate, isOpen]);

  // Handle immediate snapshot save
  const handleSaveNow = async () => {
    try {
      setIsSaving(true);
      setSaveSuccessMsg(null);
      const res = await apiFetch('/api/history/save-now', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setSaveSuccessMsg(`Saved ${data.saved_records || 208} stocks for ${data.date}`);
        // Refresh available dates and reload current day
        const dRes = await apiFetch('/api/history/dates');
        const dData = await dRes.json();
        const dates: string[] = dData.dates || [];
        setAvailableDates(dates);
        if (data.date) {
          setSelectedDate(data.date);
        }
        setTimeout(() => setSaveSuccessMsg(null), 4000);
      }
    } catch (err) {
      console.error('Failed to save snapshot:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Export current date records to CSV
  const handleExportCSV = () => {
    if (records.length === 0) return;

    const headers = [
      'Date',
      'Ticker',
      'Symbol',
      'Company Name',
      'Sector',
      'Close (INR)',
      'Change (INR)',
      'Change (%)',
      'Today Volume',
      '45D Avg Volume',
      'Relative Volume (RVOL)',
      'Open',
      'High',
      'Low',
    ];

    const rows = records.map((r) => [
      r.date,
      r.ticker,
      r.symbol,
      `"${(r.name || '').replace(/"/g, '""')}"`,
      `"${(r.sector || '').replace(/"/g, '""')}"`,
      r.close_price.toFixed(2),
      r.change.toFixed(2),
      r.change_percent.toFixed(2),
      r.today_volume,
      r.avg_volume_45d,
      r.relative_volume.toFixed(2),
      r.open_price.toFixed(2),
      r.high_price.toFixed(2),
      r.low_price.toFixed(2),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tradoeasy_daily_history_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter and sort records
  const filteredRecords = useMemo(() => {
    let list = records;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.ticker.toLowerCase().includes(q) ||
          r.symbol.toLowerCase().includes(q) ||
          (r.name && r.name.toLowerCase().includes(q)) ||
          (r.sector && r.sector.toLowerCase().includes(q))
      );
    }

    return [...list].sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];
      if (typeof valA === 'string') {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortAsc ? valA - valB : valB - valA;
    });
  }, [records, searchQuery, sortField, sortAsc]);

  const handleSort = (field: keyof DailyHistoryRecord) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-5">
      <div className="bg-[#101522] border border-[#232C42] rounded-xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#232C42] bg-[#0E131F]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold font-mono text-white">Daily History Archive</h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-600/60 text-emerald-300 font-mono">
                  15-DAY ROLLING RETENTION
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Persistent end-of-session market records (Price, Volume, RVOL) · Retains 15 trading sessions automatically
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveNow}
              disabled={isSaving}
              title="Archive current market session right now"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-medium bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/50 text-blue-300 transition-colors disabled:opacity-50"
            >
              {isSaving ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5 text-blue-400" />
              )}
              <span>{isSaving ? 'Archiving...' : 'Archive Session Now'}</span>
            </button>

            <button
              onClick={handleExportCSV}
              disabled={records.length === 0}
              title="Export this session data to CSV"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-medium bg-[#161C2D] hover:bg-[#1E263C] border border-[#232C42] hover:border-slate-600 text-slate-300 transition-colors disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-[#1E263C] transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Success Alert Banner */}
        {saveSuccessMsg && (
          <div className="bg-emerald-950/70 border-b border-emerald-600/50 px-6 py-2 flex items-center gap-2 text-emerald-300 text-xs font-mono animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* Date Selector Pill Bar & Filters */}
        <div className="px-6 py-3.5 border-b border-[#232C42] bg-[#141A28] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Available Dates Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
            <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400 shrink-0 mr-1">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span>Session:</span>
            </div>

            {availableDates.length === 0 ? (
              <span className="text-xs font-mono text-slate-500 italic">No saved dates found</span>
            ) : (
              availableDates.map((dateStr, idx) => {
                const isSelected = selectedDate === dateStr;
                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`px-2.5 py-1 rounded text-xs font-mono whitespace-nowrap transition-all border ${
                      isSelected
                        ? 'bg-blue-600 border-blue-400 text-white font-semibold shadow-md shadow-blue-600/30'
                        : 'bg-[#161C2D] border-[#232C42] text-slate-300 hover:border-slate-600 hover:bg-[#1C2438]'
                    }`}
                  >
                    <span>{dateStr}</span>
                    {idx === 0 && (
                      <span className="ml-1 text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-normal">
                        Latest
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Search Filter */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by symbol or sector..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded bg-[#0A0D14] border border-[#232C42] focus:border-blue-500 text-xs text-white placeholder-slate-500 font-mono outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

        </div>

        {/* Content Table Area */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-400" />
              <p className="font-mono text-sm">Loading session records for {selectedDate}...</p>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-500 gap-2">
              <Layers className="w-10 h-10 stroke-1" />
              <p className="font-mono text-sm text-slate-400">No records found for the selected query.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead className="sticky top-0 bg-[#0E131F] border-b border-[#232C42] text-slate-400 z-10 select-none">
                <tr>
                  <th
                    onClick={() => handleSort('ticker')}
                    className="py-3 px-4 cursor-pointer hover:text-white"
                  >
                    SYMBOL {sortField === 'ticker' && (sortAsc ? '▲' : '▼')}
                  </th>
                  <th
                    onClick={() => handleSort('close_price')}
                    className="py-3 px-4 text-right cursor-pointer hover:text-white"
                  >
                    CLOSE (₹) {sortField === 'close_price' && (sortAsc ? '▲' : '▼')}
                  </th>
                  <th
                    onClick={() => handleSort('change_percent')}
                    className="py-3 px-4 text-right cursor-pointer hover:text-white"
                  >
                    CHANGE % {sortField === 'change_percent' && (sortAsc ? '▲' : '▼')}
                  </th>
                  <th
                    onClick={() => handleSort('today_volume')}
                    className="py-3 px-4 text-right cursor-pointer hover:text-white"
                  >
                    SESSION VOL {sortField === 'today_volume' && (sortAsc ? '▲' : '▼')}
                  </th>
                  <th
                    onClick={() => handleSort('avg_volume_45d')}
                    className="py-3 px-4 text-right cursor-pointer hover:text-white"
                  >
                    45D AVG VOL {sortField === 'avg_volume_45d' && (sortAsc ? '▲' : '▼')}
                  </th>
                  <th
                    onClick={() => handleSort('relative_volume')}
                    className="py-3 px-4 text-center cursor-pointer hover:text-white"
                  >
                    RVOL % {sortField === 'relative_volume' && (sortAsc ? '▲' : '▼')}
                  </th>
                  <th className="py-3 px-4 text-right">SESSION RANGE</th>
                  <th
                    onClick={() => handleSort('sector')}
                    className="py-3 px-4 cursor-pointer hover:text-white hidden md:table-cell"
                  >
                    SECTOR {sortField === 'sector' && (sortAsc ? '▲' : '▼')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1B2234]">
                {filteredRecords.map((row) => {
                  const isPositive = row.change > 0;
                  const isNegative = row.change < 0;
                  const rvolValue = row.relative_volume || 0;

                  return (
                    <tr
                      key={row.symbol || row.ticker}
                      className="hover:bg-[#161C2D]/80 transition-colors"
                    >
                      {/* Symbol */}
                      <td className="py-2.5 px-4 font-semibold text-white">
                        <div className="flex items-center gap-1.5">
                          <span>{row.ticker}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-normal truncate max-w-[180px]">
                          {row.name}
                        </div>
                      </td>

                      {/* Close Price */}
                      <td className="py-2.5 px-4 text-right font-medium text-slate-200">
                        {formatPrice(row.close_price)}
                      </td>

                      {/* Change % */}
                      <td className="py-2.5 px-4 text-right">
                        <span
                          className={`inline-flex items-center gap-1 font-semibold ${
                            isPositive
                              ? 'text-emerald-400'
                              : isNegative
                              ? 'text-red-400'
                              : 'text-slate-400'
                          }`}
                        >
                          {isPositive && <TrendingUp className="w-3 h-3" />}
                          {isNegative && <TrendingDown className="w-3 h-3" />}
                          {isPositive ? '+' : ''}
                          {row.change_percent ? row.change_percent.toFixed(2) : '0.00'}%
                        </span>
                        <div className="text-[10px] text-slate-400">
                          {isPositive ? '+' : ''}₹{Math.abs(row.change).toFixed(2)}
                        </div>
                      </td>

                      {/* Session Volume */}
                      <td className="py-2.5 px-4 text-right text-slate-300">
                        {formatVolume(row.today_volume)}
                      </td>

                      {/* 45D Avg Volume */}
                      <td className="py-2.5 px-4 text-right text-slate-400">
                        {formatVolume(row.avg_volume_45d)}
                      </td>

                      {/* Relative Volume */}
                      <td className="py-2.5 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${
                            rvolValue >= 2.0
                              ? 'bg-purple-950/60 border-purple-500/70 text-purple-300 shadow-[0_0_8px_rgba(168,85,247,0.25)]'
                              : rvolValue >= 1.2
                              ? 'bg-emerald-950/60 border-emerald-500/70 text-emerald-300'
                              : rvolValue >= 0.8
                              ? 'bg-blue-950/40 border-blue-600/50 text-blue-300'
                              : 'bg-slate-900 border-slate-700/60 text-slate-400'
                          }`}
                        >
                          {formatRVOL(rvolValue)}
                        </span>
                      </td>

                      {/* Session Range */}
                      <td className="py-2.5 px-4 text-right text-[11px] text-slate-400">
                        <span>{formatPrice(row.low_price)}</span>
                        <span className="mx-1 text-slate-600">-</span>
                        <span>{formatPrice(row.high_price)}</span>
                      </td>

                      {/* Sector */}
                      <td className="py-2.5 px-4 text-slate-400 hidden md:table-cell text-[11px] truncate max-w-[140px]">
                        {row.sector || 'Others'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-[#232C42] bg-[#0E131F] text-xs font-mono text-slate-400">
          <div className="flex items-center gap-3">
            <span>
              Showing <strong className="text-white">{filteredRecords.length}</strong> of{' '}
              <strong className="text-white">{records.length}</strong> stocks for{' '}
              <strong className="text-blue-400">{selectedDate || 'N/A'}</strong>
            </span>
            <span className="hidden sm:inline text-slate-600">|</span>
            <span className="hidden sm:inline text-slate-500">
              Total preserved sessions: <strong className="text-slate-300">{availableDates.length}/15</strong>
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded text-xs font-mono text-slate-300 hover:text-white border border-[#232C42] hover:border-slate-600 transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
