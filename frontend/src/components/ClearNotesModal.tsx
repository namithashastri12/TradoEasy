import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ClearNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  count: number;
}

export const ClearNotesModal: React.FC<ClearNotesModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  count,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-[#101522] border border-red-900/60 rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#232C42]">
          <div className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-mono font-bold text-sm text-white">Clear Saved Observations</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#1E263C]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 text-xs font-mono text-slate-300 space-y-3">
          <p>
            Are you sure you want to delete all <strong className="text-white">{count}</strong> saved personal Support and Resistance notes?
          </p>
          <div className="p-2.5 rounded bg-red-950/40 border border-red-900/50 text-red-300 text-[11px]">
            This action only clears your personal Support and Resistance inputs from browser storage. It will <strong className="text-white">NOT</strong> affect market data, filters, or connection settings.
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-[#232C42] bg-[#0E131F]">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded text-xs font-mono text-slate-300 hover:text-white border border-[#232C42] hover:border-slate-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded text-xs font-mono font-semibold bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-600/30 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Notes
          </button>
        </div>

      </div>
    </div>
  );
};
