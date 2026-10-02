import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-sm px-4 pointer-events-none">
      {toasts.map(toast => {
        const isSuccess = toast.type === 'success';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-modal text-sm font-medium transition-all duration-300 transform translate-y-0 animate-in fade-in slide-in-from-top-2 ${
              isSuccess
                ? 'bg-forest-900 text-cream-50 border border-forest-700'
                : isWarning
                ? 'bg-amber-900 text-amber-50 border border-amber-700'
                : 'bg-charcoal-900 text-cream-50 border border-charcoal-700'
            }`}
          >
            {isSuccess && <CheckCircle2 className="w-4 h-4 text-mint-300 shrink-0" />}
            {isWarning && <AlertCircle className="w-4 h-4 text-amber-300 shrink-0" />}
            {!isSuccess && !isWarning && <Info className="w-4 h-4 text-cream-300 shrink-0" />}
            <span className="flex-1 leading-snug">{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
};
