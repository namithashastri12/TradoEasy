import React from 'react';
import { Info } from 'lucide-react';
import { AppMode } from '../types/market';

interface DemoBannerProps {
  mode: AppMode;
  onOpenFyersModal?: () => void;
}

export const DemoBanner: React.FC<DemoBannerProps> = ({ mode, onOpenFyersModal }) => {
  if (mode === 'LIVE') return null;

  return (
    <div className="bg-amber-950/40 border-b border-amber-600/40 px-4 py-1.5 text-center text-amber-300 text-xs font-mono flex flex-wrap items-center justify-center gap-2">
      <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
      <span>
        <strong>DEMO MODE:</strong> Showing 200 NSE stocks simulated market stream. Connect FYERS API V3 to switch to live trading feed.
      </span>
      {onOpenFyersModal && (
        <button
          onClick={onOpenFyersModal}
          className="ml-2 px-2 py-0.5 rounded bg-amber-900/60 hover:bg-amber-800/80 border border-amber-500/70 text-amber-200 text-[11px] font-bold uppercase transition-colors"
        >
          Connect FYERS Live
        </button>
      )}
    </div>
  );
};
