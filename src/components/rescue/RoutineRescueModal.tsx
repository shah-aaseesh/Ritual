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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-cream-50 rounded-3xl max-w-sm w-full p-6 shadow-modal border border-cream-200 space-y-5">
        {/* Header Icon & Warm Title */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center mx-auto shadow-soft">
            <HeartHandshake className="w-7 h-7" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100/70 px-2.5 py-0.5 rounded-full">
            Routine Rescue
          </span>
          <h3 className="text-xl font-extrabold text-forest-950">
            You planned a lot. Let’s make it easier.
          </h3>
          <p className="text-xs text-charcoal-600 leading-relaxed max-w-xs mx-auto">
            Life gets busy, and missing a few days is completely normal. Rather than feeling overwhelmed, let’s shrink your daily commitment down to an effortless <strong className="text-forest-900 font-bold">{totalRescueMinutes} minutes</strong>.
          </p>
        </div>

        {/* Simplified Minimum Viable Routine (MVR) */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-forest-900 uppercase tracking-wider">
            <span>Minimum Viable Routine (MVR):</span>
            <span>{rescueSteps.length} Steps • {totalRescueMinutes} min total</span>
          </div>

          <div className="space-y-2">
            {rescueSteps.map((step, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-white border border-amber-200 shadow-soft space-y-1 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-forest-950">
                    {step.timeOfDay === 'morning' ? (
                      <Sun className="w-3.5 h-3.5 text-amber-600" />
                    ) : (
                      <Moon className="w-3.5 h-3.5 text-indigo-600" />
                    )}
                    <span className="capitalize">{step.timeOfDay}:</span>
                    <span>{step.action}</span>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] text-charcoal-500 font-semibold shrink-0">
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
            className="w-full py-3.5 px-4 rounded-2xl bg-forest-900 hover:bg-forest-800 text-cream-50 font-bold text-sm shadow-card flex items-center justify-center gap-2 transition active:scale-98"
          >
            <Sparkles className="w-4 h-4 text-mint-300" />
            <span>Adopt Simplified Routine ({totalRescueMinutes} min)</span>
          </button>

          <button
            type="button"
            onClick={dismissRescueRoutine}
            className="w-full py-2.5 px-4 rounded-2xl bg-cream-200 hover:bg-cream-300 text-charcoal-700 font-semibold text-xs transition"
          >
            Keep Original Full Routine
          </button>
        </div>
      </div>
    </div>
  );
};
