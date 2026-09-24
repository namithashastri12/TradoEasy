import React, { useState } from 'react';
import { X, Check, Compass } from 'lucide-react';
import { Universe } from '../types/market';

interface UniverseSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  universes: Universe[];
  currentUniverseId: string;
  onSelectUniverse: (universeId: string) => void;
}

export const UniverseSelectorModal: React.FC<UniverseSelectorModalProps> = ({
  isOpen,
  onClose,
  universes,
  currentUniverseId,
  onSelectUniverse,
}) => {
  const [selected, setSelected] = useState<string>(currentUniverseId);

  if (!isOpen) return null;

  const keyIndices = universes.filter((u) => u.category === 'Key Indices');
  const sectoralIndices = universes.filter((u) => u.category === 'Sectoral Indices');
  const otherIndices = universes.filter((u) => u.category !== 'Key Indices' && u.category !== 'Sectoral Indices');

  const handleApply = () => {
    onSelectUniverse(selected);
    onClose();
  };

  const handleReset = () => {
    setSelected('nifty_500');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#101522] border border-[#232C42] rounded-xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#232C42]">
          <div className="flex items-center gap-2.5">
            <Compass className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="text-base font-bold font-mono text-white">Select Market Universe</h3>
              <p className="text-xs text-slate-400">Configure the active equity universe monitored by the scanner</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#1E263C] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Key Indices */}
          <div>
            <h4 className="text-xs font-mono font-semibold tracking-wider text-slate-400 uppercase mb-2.5">
              Key Indices (NSE)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {keyIndices.map((uni) => {
                const isCurrent = selected === uni.id;
                return (
                  <button
                    key={uni.id}
                    onClick={() => setSelected(uni.id)}
                    className={`flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                      isCurrent
                        ? 'bg-blue-950/50 border-blue-500/80 text-white shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                        : 'bg-[#161C2D] border-[#232C42] text-slate-300 hover:border-slate-600 hover:bg-[#1A2236]'
                    }`}
                  >
                    <div>
                      <div className="font-mono font-medium text-sm flex items-center gap-1.5">
                        {uni.name}
                        {uni.id === 'nifty_500' && (
                          <span className="text-[10px] px-1 py-0.2 rounded bg-blue-900/60 text-blue-300 border border-blue-700/60">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">
                        {uni.symbols_count} stocks
                      </div>
                    </div>
                    {isCurrent && <Check className="w-4 h-4 text-blue-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sectoral Indices */}
          <div>
            <h4 className="text-xs font-mono font-semibold tracking-wider text-slate-400 uppercase mb-2.5">
              Sectoral Indices
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {sectoralIndices.map((uni) => {
                const isCurrent = selected === uni.id;
                return (
                  <button
                    key={uni.id}
                    onClick={() => setSelected(uni.id)}
                    className={`flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                      isCurrent
                        ? 'bg-blue-950/50 border-blue-500/80 text-white shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                        : 'bg-[#161C2D] border-[#232C42] text-slate-300 hover:border-slate-600 hover:bg-[#1A2236]'
                    }`}
                  >
                    <div>
                      <div className="font-mono font-medium text-sm">{uni.name}</div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">
                        {uni.symbols_count} stocks
                      </div>
                    </div>
                    {isCurrent && <Check className="w-4 h-4 text-blue-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Other Indices if any */}
          {otherIndices.length > 0 && (
            <div>
              <h4 className="text-xs font-mono font-semibold tracking-wider text-slate-400 uppercase mb-2.5">
                Other Indices
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {otherIndices.map((uni) => (
                  <button
                    key={uni.id}
                    onClick={() => setSelected(uni.id)}
                    className={`flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                      selected === uni.id
                        ? 'bg-blue-950/50 border-blue-500/80 text-white'
                        : 'bg-[#161C2D] border-[#232C42] text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <div>
                      <div className="font-mono font-medium text-sm">{uni.name}</div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">
                        {uni.symbols_count} stocks
                      </div>
                    </div>
                    {selected === uni.id && <Check className="w-4 h-4 text-blue-400 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-[#232C42] bg-[#0E131F]">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded text-xs font-mono text-slate-400 hover:text-white border border-[#232C42] hover:border-slate-600 transition-colors"
          >
            Reset (NIFTY 500)
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded text-xs font-mono text-slate-300 hover:text-white border border-[#232C42] hover:border-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-1.5 rounded text-xs font-mono font-medium bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 transition-colors"
            >
              Apply Selection
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
