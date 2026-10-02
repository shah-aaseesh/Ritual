import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ScanLine, 
  CheckCircle2, 
  Circle, 
  Sun, 
  Moon, 
  ArrowRight, 
  Clock, 
  HeartHandshake,
  Dumbbell,
  Camera,
  ChevronRight
} from 'lucide-react';
import { DisclaimerBanner } from '../common/DisclaimerBanner';

export const TodayView: React.FC = () => {
  const { 
    profile, 
    routineSteps, 
    toggleRoutineStep, 
    setActiveTab, 
    progressHistory,
    showRoutineRescue,
    setShowRoutineRescue,
    activePillar,
    setActivePillar
  } = useApp();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const morningSteps = routineSteps.filter(s => s.timeOfDay === 'morning');
  const eveningSteps = routineSteps.filter(s => s.timeOfDay === 'evening');
  const totalSteps = routineSteps.length;
  const completedCount = routineSteps.filter(s => s.isCompletedToday).length;
  const progressPercent = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  // Calculate consistency score from past 7 days
  const recent7 = progressHistory.slice(-7);
  const avgCompletion = recent7.length > 0 
    ? Math.round((recent7.reduce((acc, curr) => acc + curr.completionRate, 0) / recent7.length) * 100) 
    : 0;

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-200 text-white max-w-4xl mx-auto">
      {/* Routine Rescue Banner if triggered */}
      {showRoutineRescue && (
        <div className="p-4 sm:p-5 rounded-[2rem] bg-[#1C1410] border border-[#FF3B30]/40 shadow-xl">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-[#FF3B30]/20 text-[#FF3B30] shrink-0 mt-0.5">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-extrabold text-white">
                Simplify your routine?
              </h4>
              <p className="text-xs text-zinc-300 mt-0.5 leading-relaxed">
                Consistency dropped recently. Switch to a 1-step morning & evening ritual to rebuild momentum effortlessly.
              </p>
              <div className="flex items-center gap-2 mt-2.5">
                <button
                  onClick={() => setShowRoutineRescue(true)}
                  className="px-3.5 py-1.5 rounded-full bg-white text-black font-extrabold text-xs hover:bg-zinc-200 transition"
                >
                  Simplify Routine
                </button>
                <button
                  onClick={() => setShowRoutineRescue(false)}
                  className="px-3.5 py-1.5 rounded-full bg-white/10 text-zinc-300 font-bold text-xs hover:bg-white/20 transition"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🎯 CATEGORY CHOOSER AT THE BEGINNING (FRONT & CENTER)                     */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-zinc-400">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}
          </span>
          <span className="text-xs font-mono text-zinc-400 font-medium">
            Goal: <strong className="text-white capitalize">{profile.primaryGoal.replace('_', ' ')}</strong>
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          {getGreeting()}, {profile.name || 'Aarav'}
        </h2>

        {/* Big Touch-Friendly Category Chooser */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-[#121217] rounded-[1.75rem] border border-white/10 shadow-inner">
          <button
            type="button"
            onClick={() => setActivePillar('wellness')}
            className={`py-3 px-4 rounded-[1.25rem] text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all duration-200 active:scale-98 ${
              activePillar === 'wellness'
                ? 'bg-white text-black shadow-lg scale-[1.01]'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="text-base">🌿</span>
            <span>Wellness & Rituals</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePillar('health')}
            className={`py-3 px-4 rounded-[1.25rem] text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all duration-200 active:scale-98 ${
              activePillar === 'health'
                ? 'bg-white text-black shadow-lg scale-[1.01]'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="text-base">⚡</span>
            <span>Health & Fitness</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🌿 WELLNESS SUITE ACTIVE VIEW                                             */}
      {/* ========================================================================= */}
      {activePillar === 'wellness' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Daily Ritual Adherence Progress Card */}
          <div className="bg-[#121217] rounded-[2rem] p-5 sm:p-6 shadow-card border border-white/10 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase text-zinc-400 tracking-wider">
                Daily Ritual Progress
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-white font-mono leading-none">
                  {progressPercent}%
                </span>
                <span className="text-xs text-zinc-400 font-mono">
                  ({completedCount}/{totalSteps} steps completed)
                </span>
              </div>
              <span className="text-[11px] text-zinc-400 block pt-1">
                7-Day Consistency: <strong className="text-white">{avgCompletion}%</strong>
              </span>
            </div>

            <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
              <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-white/10 stroke-current"
                  strokeWidth="3.5"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-[#FF3B30] stroke-current transition-all duration-500 ease-out"
                  strokeDasharray={`${progressPercent}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-xs font-bold text-white font-mono">{progressPercent}%</span>
            </div>
          </div>

          {/* Quick Action: Rx Label Lens */}
          <button
            type="button"
            onClick={() => setActiveTab('labellens')}
            className="w-full p-4 sm:p-5 rounded-[2rem] bg-[#0C0C10] hover:bg-[#14141C] border border-white/10 hover:border-[#FF3B30]/40 transition text-left flex items-center justify-between shadow-2xl group active:scale-99"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#FF3B30]/15 text-[#FF3B30] border border-[#FF3B30]/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <ScanLine className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-black text-white">
                    Audit Product with Label Lens
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-white/10 text-white text-[10px] font-mono">
                    Rx Lens
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Scan bottle barcode, take photo, or paste ingredients to check scientific evidence.
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:text-white transition shrink-0" />
          </button>

          {/* Morning Checklist */}
          {morningSteps.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono font-bold uppercase text-zinc-400 px-1">
                <div className="flex items-center gap-1.5">
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>Morning Ritual</span>
                </div>
                <span>{morningSteps.filter(s => s.isCompletedToday).length}/{morningSteps.length} done</span>
              </div>

              <div className="space-y-2">
                {morningSteps.map((step) => (
                  <div
                    key={step.id}
                    onClick={() => toggleRoutineStep(step.id)}
                    className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 shadow-sm ${
                      step.isCompletedToday
                        ? 'bg-[#14141C]/50 border-white/5 text-zinc-500'
                        : 'bg-[#121217] border-white/10 hover:border-white/20 text-white'
                    }`}
                  >
                    <button
                      type="button"
                      className="shrink-0 focus:outline-none"
                    >
                      {step.isCompletedToday ? (
                        <CheckCircle2 className="w-5 h-5 text-[#FF3B30] fill-[#FF3B30]/20" />
                      ) : (
                        <Circle className="w-5 h-5 text-zinc-600 hover:text-zinc-400" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-xs sm:text-sm font-bold truncate ${step.isCompletedToday ? 'line-through text-zinc-500' : 'text-white'}`}>
                          {step.action}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1 shrink-0">
                          <Clock className="w-3 h-3" />
                          {step.estimatedMinutes}m
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 truncate mt-0.5">{step.shortExplanation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Evening Checklist */}
          {eveningSteps.length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs font-mono font-bold uppercase text-zinc-400 px-1">
                <div className="flex items-center gap-1.5">
                  <Moon className="w-4 h-4 text-indigo-400" />
                  <span>Evening Ritual</span>
                </div>
                <span>{eveningSteps.filter(s => s.isCompletedToday).length}/{eveningSteps.length} done</span>
              </div>

              <div className="space-y-2">
                {eveningSteps.map((step) => (
                  <div
                    key={step.id}
                    onClick={() => toggleRoutineStep(step.id)}
                    className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 shadow-sm ${
                      step.isCompletedToday
                        ? 'bg-[#14141C]/50 border-white/5 text-zinc-500'
                        : 'bg-[#121217] border-white/10 hover:border-white/20 text-white'
                    }`}
                  >
                    <button
                      type="button"
                      className="shrink-0 focus:outline-none"
                    >
                      {step.isCompletedToday ? (
                        <CheckCircle2 className="w-5 h-5 text-[#FF3B30] fill-[#FF3B30]/20" />
                      ) : (
                        <Circle className="w-5 h-5 text-zinc-600 hover:text-zinc-400" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-xs sm:text-sm font-bold truncate ${step.isCompletedToday ? 'line-through text-zinc-500' : 'text-white'}`}>
                          {step.action}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1 shrink-0">
                          <Clock className="w-3 h-3" />
                          {step.estimatedMinutes}m
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 truncate mt-0.5">{step.shortExplanation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* ⚡ HEALTH & FITNESS ACTIVE VIEW                                           */}
      {/* ========================================================================= */}
      {activePillar === 'health' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Gym & Strength Action Tile */}
          <div
            onClick={() => setActiveTab('gym')}
            className="p-5 sm:p-6 rounded-[2rem] bg-[#121217] hover:bg-[#181822] border border-white/10 hover:border-[#FF3B30]/40 transition cursor-pointer shadow-card flex items-center justify-between gap-4 group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#FF3B30] group-hover:scale-110 transition-transform shrink-0">
                <Dumbbell className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-[#FF3B30] uppercase tracking-wider block">
                  Athletic Performance
                </span>
                <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                  Gym Tracker & 3D Body Map
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Log sets, reps, and RPE with built-in rest timers & muscle recovery heatmaps.
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:text-white transition shrink-0" />
          </div>

          {/* Calorie & Gemini AI Vision Action Tile */}
          <div
            onClick={() => setActiveTab('calories')}
            className="p-5 sm:p-6 rounded-[2rem] bg-[#121217] hover:bg-[#181822] border border-white/10 hover:border-[#FF3B30]/40 transition cursor-pointer shadow-card flex items-center justify-between gap-4 group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#FF3B30]/15 border border-[#FF3B30]/30 flex items-center justify-center text-[#FF3B30] group-hover:scale-110 transition-transform shrink-0">
                <Camera className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-[#FF3B30] uppercase tracking-wider block">
                  Instant &lt;1s Vision AI
                </span>
                <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                  Snap Meal Photos & Track Calories
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Gemini Flash multimodal vision automatically estimates calories, protein, carbs & fat.
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:text-white transition shrink-0" />
          </div>

          {/* Biomechanical Readiness Pill */}
          <div className="p-4 rounded-2xl bg-[#14141C] border border-white/5 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-zinc-300 font-bold">Biomechanical Readiness: 88% Primed</span>
            </div>
            <button
              onClick={() => setActiveTab('gym')}
              className="text-[#FF3B30] hover:text-white font-bold flex items-center gap-1 transition"
            >
              <span>View Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      <DisclaimerBanner compact />
    </div>
  );
};
