import React from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, RotateCcw, AlertTriangle } from 'lucide-react';

export const DemoBar: React.FC = () => {
  const { isDemoMode, loadDemoState, resetToCleanState, simulateMissedDays, setShowRoutineRescue } = useApp();

  return (
    <div className="hidden md:block bg-mint-50/80 text-charcoal-700 text-xs px-4 py-1.5 border-b border-mint-200/80">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-medium truncate">
          <span className="w-2 h-2 rounded-full bg-mint-500 animate-pulse shrink-0"></span>
          <span className="text-forest-950 font-extrabold">Reviewer Mode:</span>
          <span className="text-charcoal-600 truncate">{isDemoMode ? 'Demo Profile (Aarav)' : 'Clean State'}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={isDemoMode ? resetToCleanState : loadDemoState}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white hover:bg-mint-100 text-charcoal-800 border border-mint-200 text-xs font-bold transition shadow-soft"
            title={isDemoMode ? 'Switch to clean state to test fresh onboarding' : 'Load complete demo profile'}
          >
            {isDemoMode ? (
              <>
                <RotateCcw className="w-3 h-3 text-forest-700" />
                <span>Reset Clean</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3 text-mint-600" />
                <span>Load Demo</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              simulateMissedDays();
              setShowRoutineRescue(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-coral-50 hover:bg-coral-100 text-coral-700 border border-coral-200 text-xs font-bold transition shadow-soft"
            title="Simulate low adherence to test Routine Rescue immediately"
          >
            <AlertTriangle className="w-3 h-3 text-coral-600" />
            <span className="hidden sm:inline">Test</span> Rescue
          </button>
        </div>
      </div>
    </div>
  );
};
