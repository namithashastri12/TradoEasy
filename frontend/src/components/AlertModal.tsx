import React, { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, X, AlertCircle } from 'lucide-react';
import { AlertRule, MarketTick } from '../types/market';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableTicks: MarketTick[];
}

export const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  onClose,
  availableTicks,
}) => {
  const [alerts, setAlerts] = useState<AlertRule[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('');
  const [alertType, setAlertType] = useState<AlertRule['type']>('PRICE_ABOVE');
  const [threshold, setThreshold] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Fetch active alerts from backend
  const fetchAlerts = () => {
    fetch('/api/alerts')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setAlerts(data);
      })
      .catch((err) => console.warn('Error fetching alerts:', err));
  };

  useEffect(() => {
    if (isOpen) {
      fetchAlerts();
      if (!selectedSymbol && availableTicks.length > 0) {
        setSelectedSymbol(availableTicks[0].symbol);
      }
    }
  }, [isOpen, availableTicks, selectedSymbol]);

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(threshold);
    if (!selectedSymbol || isNaN(val)) return;

    const newRule: AlertRule = {
      id: `rule_${Date.now()}`,
      symbol: selectedSymbol,
      type: alertType,
      threshold: val,
      notes: notes.trim() || undefined,
    };

    fetch('/api/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRule),
    })
      .then((res) => res.json())
      .then(() => {
        fetchAlerts();
        setThreshold('');
        setNotes('');
      })
      .catch((err) => console.error('Error adding alert rule:', err));
  };

  const handleDelete = (ruleId: string) => {
    fetch(`/api/alerts/${ruleId}`, { method: 'DELETE' })
      .then(() => fetchAlerts())
      .catch((err) => console.error('Error deleting alert:', err));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-[#101522] border border-[#232C42] rounded-xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#232C42]">
          <div className="flex items-center gap-2 text-blue-400">
            <Bell className="w-5 h-5" />
            <h3 className="font-mono font-bold text-sm text-white">Market Alert Rules</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#1E263C]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Informational Notice */}
        <div className="bg-[#161C2D] border-b border-[#232C42] px-5 py-2.5 flex items-center gap-2 text-[11px] font-mono text-slate-400">
          <AlertCircle className="w-4 h-4 text-blue-400 shrink-0" />
          <span>Informational alerts only. TradoEasy does not place brokerage orders or execute trades.</span>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* New Alert Form */}
          <form onSubmit={handleCreate} className="space-y-3 bg-[#131826] p-3.5 rounded-lg border border-[#232C42]">
            <h4 className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider">
              Create New Alert
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Symbol */}
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Stock</label>
                <select
                  value={selectedSymbol}
                  onChange={(e) => setSelectedSymbol(e.target.value)}
                  className="w-full bg-[#161C2D] border border-[#232C42] rounded px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                >
                  {availableTicks.map((t) => (
                    <option key={t.symbol} value={t.symbol}>
                      {t.ticker} ({t.company_name})
                    </option>
                  ))}
                </select>
              </div>

              {/* Condition */}
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Condition</label>
                <select
                  value={alertType}
                  onChange={(e) => setAlertType(e.target.value as any)}
                  className="w-full bg-[#161C2D] border border-[#232C42] rounded px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="PRICE_ABOVE">Price Above (₹)</option>
                  <option value="PRICE_BELOW">Price Below (₹)</option>
                  <option value="RVOL_ABOVE">RVOL Above (x)</option>
                  <option value="CHANGE_PCT_ABOVE">Surge Above (+%)</option>
                  <option value="CHANGE_PCT_BELOW">Decline Below (-%)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Threshold */}
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Threshold ({alertType.includes('PRICE') ? '₹' : alertType.includes('RVOL') ? 'x' : '%'})
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="e.g. 1500 or 2.0"
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  className="w-full bg-[#161C2D] border border-[#232C42] rounded px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Notes (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Day high breakout"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-[#161C2D] border border-[#232C42] rounded px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-medium bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Alert Rule
              </button>
            </div>
          </form>

          {/* Active Rules List */}
          <div>
            <h4 className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Active Alerts ({alerts.length})
            </h4>

            {alerts.length === 0 ? (
              <p className="text-xs font-mono text-slate-500 text-center py-4 bg-[#131826] rounded-lg border border-[#232C42]">
                No active alert rules configured.
              </p>
            ) : (
              <div className="space-y-2">
                {alerts.map((rule) => {
                  const ticker = rule.symbol.split(':')[1]?.replace('-EQ', '') || rule.symbol;
                  return (
                    <div
                      key={rule.id}
                      className="flex items-center justify-between p-2.5 rounded bg-[#161C2D] border border-[#232C42] text-xs font-mono"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{ticker}</span>
                          <span className="px-1.5 py-0.2 rounded bg-[#1E263C] text-blue-300 text-[10px]">
                            {rule.type.replace('_', ' ')}
                          </span>
                          <span className="text-amber-400 font-semibold">
                            {rule.threshold}
                          </span>
                        </div>
                        {rule.notes && (
                          <div className="text-[11px] text-slate-400 mt-0.5">{rule.notes}</div>
                        )}
                      </div>
                      <button
                        onClick={() => handleDelete(rule.id)}
                        className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-[#1E263C] transition-colors"
                        title="Delete Alert"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-5 py-3 border-t border-[#232C42] bg-[#0E131F]">
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
