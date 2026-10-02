import React from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, RotateCcw, AlertTriangle } from 'lucide-react';

export const DemoBar: React.FC = () => {
  const { isDemoMode, loadDemoState, resetToCleanState, simulateMissedDays, setShowRoutineRescue } = useApp();

  return (
    <div className="bg-[#07070A] text-zinc-300 text-xs px-4 py-1.5 border-b border-white/10">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-medium truncate">
          <span className="w-2 h-2 rounded-full bg-[#FF3B30] animate-pulse shrink-0"></span>
          <span className="text-white font-extrabold">Reviewer Mode:</span>
          <span className="text-zinc-400 truncate">{isDemoMode ? 'Demo Profile (Aarav)' : 'Clean State'}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={isDemoMode ? resetToCleanState : loadDemoState}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#14141C] hover:bg-[#1E1E28] text-white border border-white/10 text-xs font-bold transition"
            title={isDemoMode ? 'Switch to clean state to test fresh onboarding' : 'Load complete demo profile'}
          >
            {isDemoMode ? (
              <>
                <RotateCcw className="w-3 h-3 text-[#FF3B30]" />
                <span>Reset Clean</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3 text-[#FF3B30]" />
                <span>Load Demo</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              simulateMissedDays();
              setShowRoutineRescue(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1C1410] hover:bg-[#2A1C14] text-[#FF3B30] border border-[#FF3B30]/30 text-xs font-bold transition"
            title="Simulate low adherence to test Routine Rescue immediately"
          >
            <AlertTriangle className="w-3 h-3 text-[#FF3B30]" />
            <span className="hidden sm:inline">Test</span> Rescue
          </button>
        </div>
      </div>
    </div>
  );
};
