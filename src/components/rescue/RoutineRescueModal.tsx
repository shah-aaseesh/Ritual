import React from 'react';
import { useApp } from '../../context/AppContext';
import { generateRoutineRescue } from '../../services/routineGenerator';
import { HeartHandshake, Sparkles, Clock, Sun, Moon } from 'lucide-react';

export const RoutineRescueModal: React.FC = () => {
  const { 
    showRoutineRescue, 
    dismissRescueRoutine, 
    acceptRescueRoutine, 
    profile, 
    routineSteps 
  } = useApp();

  if (!showRoutineRescue) return null;

  const rescueSteps = generateRoutineRescue(profile.primaryGoal, routineSteps);
  const totalRescueMinutes = rescueSteps.reduce((acc, curr) => acc + curr.estimatedMinutes, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#121217] rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-white/10 space-y-5">
        {/* Header Icon & Warm Title */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto shadow-lg">
            <HeartHandshake className="w-7 h-7" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full font-mono">
            Protocol Recovery
          </span>
          <h3 className="text-xl font-black text-white">
            Life gets busy. Let’s calibrate down.
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed max-w-xs mx-auto">
            Missing days happens to every elite athlete. Rather than abandoning momentum, let’s condense your daily commitment to an effortless <strong className="text-white font-bold">{totalRescueMinutes} minutes</strong>.
          </p>
        </div>

        {/* Simplified Minimum Viable Routine (MVR) */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400 uppercase tracking-wider font-mono">
            <span>Minimum Viable Protocol (MVP):</span>
            <span>{rescueSteps.length} Steps • {totalRescueMinutes}m total</span>
          </div>

          <div className="space-y-2">
            {rescueSteps.map((step, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-[#09090D] border border-white/10 shadow-sm space-y-1 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-black text-white">
                    {step.timeOfDay === 'morning' ? (
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                    ) : (
                      <Moon className="w-3.5 h-3.5 text-indigo-400" />
                    )}
                    <span className="capitalize">{step.timeOfDay}:</span>
                    <span>{step.action}</span>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] text-zinc-400 font-mono font-semibold shrink-0">
                    <Clock className="w-3 h-3" />
                    {step.estimatedMinutes}m
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  {step.shortExplanation}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={() => acceptRescueRoutine(rescueSteps)}
            className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-zinc-100 text-black font-black text-sm shadow-xl flex items-center justify-center gap-2 transition active:scale-98"
          >
            <Sparkles className="w-4 h-4 text-black" />
            <span>Adopt Streamlined Protocol ({totalRescueMinutes}m)</span>
          </button>

          <button
            type="button"
            onClick={dismissRescueRoutine}
            className="w-full py-2.5 px-4 rounded-2xl bg-[#181822] hover:bg-[#20202c] border border-white/10 text-zinc-300 font-bold text-xs transition"
          >
            Keep Full Target Protocol
          </button>
        </div>
      </div>
    </div>
  );
};
