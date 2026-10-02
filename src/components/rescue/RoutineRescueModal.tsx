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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-modal border border-mint-200 space-y-5 text-charcoal-900">
        {/* Header Icon & Warm Title */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center mx-auto shadow-soft">
            <HeartHandshake className="w-7 h-7" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 border border-amber-200 px-2.5 py-0.5 rounded-full font-mono">
            Protocol Recovery
          </span>
          <h3 className="text-xl font-black text-forest-950">
            Life gets busy. Let’s calibrate down.
          </h3>
          <p className="text-xs text-charcoal-600 leading-relaxed max-w-xs mx-auto">
            Missing days happens to every athlete. Rather than abandoning momentum, let’s condense your daily commitment to an effortless <strong className="text-forest-950 font-bold">{totalRescueMinutes} minutes</strong>.
          </p>
        </div>

        {/* Simplified Minimum Viable Routine (MVR) */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-charcoal-500 uppercase tracking-wider font-mono">
            <span>Minimum Viable Protocol (MVP):</span>
            <span>{rescueSteps.length} Steps • {totalRescueMinutes}m total</span>
          </div>

          <div className="space-y-2">
            {rescueSteps.map((step, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-cream-50/70 border border-mint-100 shadow-soft space-y-1 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-black text-forest-950">
                    {step.timeOfDay === 'morning' ? (
                      <Sun className="w-3.5 h-3.5 text-amber-600" />
                    ) : (
                      <Moon className="w-3.5 h-3.5 text-teal-700" />
                    )}
                    <span className="capitalize">{step.timeOfDay}:</span>
                    <span>{step.action}</span>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] text-charcoal-500 font-mono font-semibold shrink-0">
                    <Clock className="w-3 h-3" />
                    {step.estimatedMinutes}m
                  </span>
                </div>
                <p className="text-[11px] text-charcoal-600 leading-relaxed">
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
            className="w-full py-3.5 px-4 rounded-2xl bg-forest-900 hover:bg-forest-800 text-white font-black text-sm shadow-soft flex items-center justify-center gap-2 transition active:scale-98"
          >
            <Sparkles className="w-4 h-4 text-mint-300" />
            <span>Adopt Streamlined Protocol ({totalRescueMinutes}m)</span>
          </button>

          <button
            type="button"
            onClick={dismissRescueRoutine}
            className="w-full py-2.5 px-4 rounded-2xl bg-cream-50 hover:bg-mint-100 border border-mint-200 text-charcoal-700 font-bold text-xs transition"
          >
            Keep Full Target Protocol
          </button>
        </div>
      </div>
    </div>
  );
};
