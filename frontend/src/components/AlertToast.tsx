import React, { useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { AlertNotification } from '../types/market';
import { formatTime } from '../utils/formatters';

interface AlertToastProps {
  alerts: AlertNotification[];
  onDismiss: (id: string) => void;
}

export const AlertToast: React.FC<AlertToastProps> = ({ alerts, onDismiss }) => {
  useEffect(() => {
    if (alerts.length > 0) {
      const topAlert = alerts[0];
      const timer = setTimeout(() => {
        onDismiss(topAlert.id);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [alerts, onDismiss]);

  if (alerts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {alerts.slice(0, 3).map((alert) => (
        <div
          key={alert.id}
          className="pointer-events-auto bg-[#101522] border border-blue-500/70 rounded-lg p-3.5 shadow-2xl shadow-blue-950/50 flex items-start justify-between gap-3 animate-in slide-in-from-bottom-5 duration-200"
        >
          <div className="flex items-start gap-2.5">
            <div className="p-1 rounded bg-blue-500/20 text-blue-400 mt-0.5">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs text-white">
                  {alert.ticker}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {formatTime(alert.timestamp)}
                </span>
              </div>
              <p className="text-xs font-mono text-slate-300 mt-0.5">
                {alert.message}
              </p>
            </div>
          </div>
          <button
            onClick={() => onDismiss(alert.id)}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
