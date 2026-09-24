import React, { memo, useRef, useEffect, useState } from 'react';
import { MarketTick, SRObservation, AvgVolumePeriod, PriceChangePeriod } from '../types/market';
import { formatPrice, formatVolume, formatRVOL } from '../utils/formatters';
import { getEffectiveAvgVolume, getEffectiveRVOL, getEffectivePriceChange } from '../utils/periodMetrics';

interface ScannerRowProps {
  index: number;
  tick: MarketTick;
  srNote?: SRObservation;
  onUpdateSR: (symbol: string, field: 'support' | 'resistance', value: string) => void;
  avgVolumePeriod?: AvgVolumePeriod;
  priceChangePeriod?: PriceChangePeriod;
}

export const ScannerRow: React.FC<ScannerRowProps> = memo(
  ({ index, tick, srNote, onUpdateSR, avgVolumePeriod = '45D', priceChangePeriod = '1D' }) => {
    const prevLtpRef = useRef<number>(tick.ltp);
    const [flashClass, setFlashClass] = useState<string>('');

    // Trigger green/red flash on price change
    useEffect(() => {
      if (prevLtpRef.current !== tick.ltp && prevLtpRef.current > 0) {
        if (tick.ltp > prevLtpRef.current) {
          setFlashClass('flash-green');
        } else {
          setFlashClass('flash-red');
        }
        const timer = setTimeout(() => setFlashClass(''), 700);
        prevLtpRef.current = tick.ltp;
        return () => clearTimeout(timer);
      }
      prevLtpRef.current = tick.ltp;
    }, [tick.ltp]);

    const effAvgVol = getEffectiveAvgVolume(tick, avgVolumePeriod);
    const effRvol = getEffectiveRVOL(tick, avgVolumePeriod);
    const effChange = getEffectivePriceChange(tick, priceChangePeriod);

    const isGainer = effChange.change_percent > 0;
    const isLoser = effChange.change_percent < 0;
    const changeSign = isGainer ? '+' : '';

    return (
      <tr className={`border-b border-[#1E263C] hover:bg-[#161C2D] transition-colors font-mono text-xs ${flashClass}`}>
        {/* 1. Sl. */}
        <td className="py-2.5 px-3 text-slate-500 text-center w-12 select-none">
          {index + 1}
        </td>

        {/* 2. Stock (Symbol + Company name) */}
        <td className="py-2.5 px-3 whitespace-nowrap min-w-[170px]">
          <div className="flex flex-col">
            <span className="font-bold text-white text-[13px] tracking-wide">
              {tick.ticker}
            </span>
            <span className="text-[11px] text-slate-400 font-sans truncate max-w-[160px]" title={tick.company_name}>
              {tick.company_name}
            </span>
          </div>
        </td>

        {/* 3. Avg Volume */}
        <td className="py-2.5 px-3 text-right text-slate-400 whitespace-nowrap">
          {formatVolume(effAvgVol)}
        </td>

        {/* 4. Today's Volume */}
        <td className="py-2.5 px-3 text-right text-slate-200 whitespace-nowrap">
          {formatVolume(tick.today_volume)}
        </td>

        {/* 5. Rel. Vol. (RVOL) with visual emphasis */}
        <td className="py-2.5 px-3 text-right whitespace-nowrap">
          {effRvol >= 2.0 ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-950/80 border border-amber-500 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.3)] animate-pulse">
              ⚡ {formatRVOL(effRvol)}
            </span>
          ) : effRvol >= 1.5 ? (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold bg-amber-950/40 text-amber-400 border border-amber-700/50">
              {formatRVOL(effRvol)}
            </span>
          ) : (
            <span className="text-slate-400">
              {formatRVOL(effRvol)}
            </span>
          )}
        </td>

        {/* 6. Last Price */}
        <td className="py-2.5 px-3 text-right font-semibold text-white whitespace-nowrap text-[13px]">
          {formatPrice(tick.ltp)}
        </td>

        {/* 7. Price Change (+₹ / %) */}
        <td className="py-2.5 px-3 text-right whitespace-nowrap font-medium">
          <div className="flex flex-col items-end">
            <span className={isGainer ? 'text-emerald-400' : isLoser ? 'text-red-400' : 'text-slate-400'}>
              {changeSign}₹{Math.abs(effChange.change).toFixed(2)}
            </span>
            <span className={`text-[11px] ${isGainer ? 'text-emerald-400 font-bold' : isLoser ? 'text-red-400 font-bold' : 'text-slate-400'}`}>
              {changeSign}{effChange.change_percent.toFixed(2)}%
            </span>
          </div>
        </td>

        {/* 8. Sector */}
        <td className="py-2.5 px-3 whitespace-nowrap">
          <span className="px-2 py-0.5 rounded text-[11px] font-sans bg-[#1E263C] text-slate-300 border border-[#2D3748]">
            {tick.sector}
          </span>
        </td>

        {/* 9. Support (Personal user input) */}
        <td className="py-2.5 px-2 w-28 whitespace-nowrap">
          <input
            type="text"
            placeholder="Support"
            value={srNote?.support || ''}
            onChange={(e) => onUpdateSR(tick.symbol, 'support', e.target.value)}
            className="w-24 bg-[#0A0D14] border border-[#232C42] focus:border-emerald-500 rounded px-2 py-1 text-xs font-mono text-emerald-400 placeholder-slate-600 focus:outline-none text-right transition-colors"
          />
        </td>

        {/* 10. Resistance (Personal user input) */}
        <td className="py-2.5 px-2 w-28 whitespace-nowrap">
          <input
            type="text"
            placeholder="Resistance"
            value={srNote?.resistance || ''}
            onChange={(e) => onUpdateSR(tick.symbol, 'resistance', e.target.value)}
            className="w-24 bg-[#0A0D14] border border-[#232C42] focus:border-red-500 rounded px-2 py-1 text-xs font-mono text-red-400 placeholder-slate-600 focus:outline-none text-right transition-colors"
          />
        </td>
      </tr>
    );
  },
  (prev, next) => {
    return (
      prev.index === next.index &&
      prev.avgVolumePeriod === next.avgVolumePeriod &&
      prev.priceChangePeriod === next.priceChangePeriod &&
      prev.tick.ltp === next.tick.ltp &&
      prev.tick.change === next.tick.change &&
      prev.tick.today_volume === next.tick.today_volume &&
      prev.tick.relative_volume === next.tick.relative_volume &&
      prev.tick.timestamp === next.tick.timestamp &&
      prev.srNote?.support === next.srNote?.support &&
      prev.srNote?.resistance === next.srNote?.resistance
    );
  }
);
