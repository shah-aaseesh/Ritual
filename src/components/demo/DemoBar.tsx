import React from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, RotateCcw, AlertTriangle } from 'lucide-react';

export const DemoBar: React.FC = () => {
  const { isDemoMode, loadDemoState, resetToCleanState, simulateMissedDays, setShowRoutineRescue } = useApp();

  return (
    <div className="bg-forest-950 text-cream-100 text-xs px-3 py-1.5 border-b border-forest-800">
      <div className="max-w-md mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 font-medium truncate">
          <span className="w-2 h-2 rounded-full bg-mint-400 animate-pulse shrink-0"></span>
          <span className="text-mint-300 font-semibold">Reviewer Mode:</span>
          <span className="text-cream-300 truncate">{isDemoMode ? 'Demo Profile (Aarav)' : 'Clean State'}</span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={isDemoMode ? resetToCleanState : loadDemoState}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-forest-800 hover:bg-forest-700 text-cream-100 border border-forest-700 transition"
            title={isDemoMode ? 'Switch to clean state to test fresh onboarding' : 'Load complete demo profile'}
          >
            {isDemoMode ? (
              <>
                <RotateCcw className="w-3 h-3 text-coral-400" />
                <span>Reset Clean</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3 text-mint-400" />
                <span>Load Demo</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              simulateMissedDays();
              setShowRoutineRescue(true);
            }}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-800/80 transition"
            title="Simulate low adherence to test Routine Rescue immediately"
          >
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            <span className="hidden sm:inline">Test</span> Rescue
          </button>
        </div>
      </div>
    </div>
  );
};
