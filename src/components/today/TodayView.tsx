import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ScanLine, 
  CheckCircle2, 
  Circle, 
  Sparkles, 
  Sun, 
  Moon, 
  ArrowRight, 
  Clock, 
  HeartHandshake,
  Plus,
  Dumbbell,
  Utensils
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
    loadDemoState,
    isDemoMode,
    setActivePillar,
    shelfProducts
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

  // Contextual science suggestions based on user's goal
  const getContextualSuggestion = () => {
    switch (profile.primaryGoal) {
      case 'hair_health':
        return {
          title: 'Follicular Cycle Insight',
          text: 'Hair growth occurs in 90–120 day anagen cycles. Actives like Redensyl or Rosemary support cellular signaling, but require unbroken daily contact before visible root density shifts occur.'
        };
      case 'body_care':
        return {
          title: 'Acid Exfoliation Dynamics',
          text: 'Salicylic Acid is lipid-soluble, allowing it to penetrate sebum-clogged pores on chest and back. Allow body wash lather to sit on skin for 60 seconds before rinsing for full keratolytic action.'
        };
      case 'sleep_recovery':
        return {
          title: 'Circadian Timing Nuance',
          text: 'Melatonin acts as a circadian chronobiotic rather than a heavy sedative. Taking 0.5–3mg approximately 45–60 minutes prior to intended sleep produces optimal sleep latency reduction.'
        };
      default:
        return {
          title: 'Evidence-Based Consistency',
          text: 'Small, frictionless daily applications outperform sporadic high-dose treatments across all biological systems.'
        };
    }
  };

  const suggestion = getContextualSuggestion();

  // Calculate consistency score from past 7 days
  const recent7 = progressHistory.slice(-7);
  const avgCompletion = recent7.length > 0 
    ? Math.round((recent7.reduce((acc, curr) => acc + curr.completionRate, 0) / recent7.length) * 100) 
    : 0;

  return (
    <div className="space-y-6 pb-20 md:pb-8 animate-in fade-in duration-200 text-white">
      {/* Routine Rescue Banner if triggered */}
      {showRoutineRescue && (
        <div className="p-5 rounded-[2rem] bg-[#1C1410] border border-[#FF3B30]/40 shadow-xl animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-2xl bg-[#FF3B30]/20 text-[#FF3B30] shrink-0 mt-0.5">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-extrabold text-white">
                You planned a lot. Let’s make it easier.
              </h4>
              <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                Consistency dropped recently. Would you like a 1-step morning & 1-step evening minimum viable routine (under 5 mins) to restart momentum effortlessly?
              </p>
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => setShowRoutineRescue(true)}
                  className="px-4 py-2 rounded-full bg-white text-black font-extrabold text-xs hover:bg-zinc-200 transition"
                >
                  Simplify Routine
                </button>
                <button
                  onClick={() => setShowRoutineRescue(false)}
                  className="px-4 py-2 rounded-full bg-white/10 text-zinc-300 font-bold text-xs hover:bg-white/20 transition"
                >
                  Keep Current
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#FF3B30] uppercase tracking-widest font-mono">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-1">
            {getGreeting()}, {profile.name || 'Aarav'}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-medium">
            Focus: <span className="text-zinc-200 font-bold capitalize">{profile.primaryGoal.replace('_', ' ')}</span> • {profile.dailyTime.replace('_', ' ')} daily commitment
          </p>
        </div>

        {!isDemoMode && (
          <button
            onClick={loadDemoState}
            className="self-start sm:self-center flex items-center gap-2 px-4 py-2 rounded-full bg-[#181822] hover:bg-[#22222E] border border-white/10 text-xs font-bold text-zinc-200 hover:text-white transition shadow-soft"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FF3B30]" />
            <span>Load Demo Data</span>
          </button>
        )}
      </div>

      {/* Category Pillar Portals (Wellness vs Health) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 🌿 Wellness Category Card */}
        <div 
          className="relative overflow-hidden rounded-[2rem] p-6 bg-[#121217] hover:bg-[#16161F] text-white border border-white/10 shadow-card flex flex-col justify-between group transition-all duration-300 hover:border-white/20"
        >
          <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-[11px] font-extrabold border border-white/10">
                🌿 Wellness Suite
              </span>
              <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase">
                Active Domain
              </span>
            </div>

            <h3 className="text-2xl font-black text-white tracking-tight">
              Formulation & Daily Rituals
            </h3>
            <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
              Clinical ingredient safety, Rx label debunking, smart shelf cabinet & morning/evening habit adherence.
            </p>

            {/* Quick shortcuts */}
            <div className="flex flex-wrap gap-2 mt-5">
              <button
                type="button"
                onClick={() => setActiveTab('labellens')}
                className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
              >
                <ScanLine className="w-3.5 h-3.5 text-[#FF3B30]" />
                <span>Rx Label Lens</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('smartshelf')}
                className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
              >
                <span>Smart Shelf ({shelfProducts.length})</span>
              </button>
            </div>
          </div>
        </div>

        {/* ⚡ Health & Performance Category Card */}
        <div 
          onClick={() => {
            setActivePillar('health');
            setActiveTab('gym');
          }}
          className="relative overflow-hidden rounded-[2rem] p-6 bg-[#121217] hover:bg-[#181822] text-white border border-[#FF3B30]/30 hover:border-[#FF3B30]/60 shadow-card flex flex-col justify-between group cursor-pointer transition-all duration-300"
        >
          <div className="absolute top-0 right-0 w-36 h-36 bg-[#FF3B30]/15 rounded-full blur-3xl pointer-events-none"></div>

          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF3B30]/20 text-[#FF3B30] text-[11px] font-black border border-[#FF3B30]/30">
                ⚡ Health & Athletics Hub
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#FF3B30] group-hover:translate-x-0.5 transition">
                <span>Explore Health</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

            <h3 className="text-2xl font-black text-white tracking-tight">
              Gym, Calories & Muscle Heatmap
            </h3>
            <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
              Biomechanical recovery heatmaps, live strength set/rep tracking with timers, and precise macro & calorie logging.
            </p>

            {/* Quick shortcuts into health modules */}
            <div className="flex flex-wrap gap-2 mt-5" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => {
                  setActivePillar('health');
                  setActiveTab('gym');
                }}
                className="px-3.5 py-1.5 rounded-full bg-white text-black text-xs font-extrabold flex items-center gap-1.5 hover:bg-zinc-200 active:scale-95 transition shadow-sm"
              >
                <Dumbbell className="w-3.5 h-3.5 text-[#FF3B30]" />
                <span>Gym & Body Map</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActivePillar('health');
                  setActiveTab('calories');
                }}
                className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
              >
                <Utensils className="w-3.5 h-3.5" />
                <span>Calorie & Macro Tracker</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (Desktop: 5 cols): Progress Card + Scan CTA + Context Insight */}
        <div className="lg:col-span-5 space-y-5">
          {/* Progress Card */}
          <div className="bg-[#121217] rounded-[2rem] p-6 shadow-card border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-44 h-44 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex items-center justify-between gap-4 relative z-10">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
                  Today's Ritual Adherence
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl font-black text-white tracking-tight font-mono">
                    {progressPercent}%
                  </span>
                  <span className="text-xs text-zinc-400">
                    ({completedCount} of {totalSteps} steps completed)
                  </span>
                </div>
              </div>

              <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
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

            {/* 7-Day Mini Dots */}
            <div className="mt-4 pt-3.5 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-zinc-400 font-medium">7-Day Consistency: <strong className="text-white font-bold">{avgCompletion}%</strong></span>
              <button
                onClick={() => setActiveTab('progress')}
                className="flex items-center gap-1 text-[#FF3B30] hover:text-white font-semibold transition"
              >
                <span>View Journal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Biomechanical & Muscle Readiness Card */}
          <div className="bg-[#121217] rounded-[2rem] p-6 shadow-card border border-white/10 space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-black uppercase text-zinc-300 font-mono tracking-widest">
                  MUSCLE RECOVERY HEATMAP
                </span>
              </div>

              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-black border border-emerald-500/30">
                88% PRIMED
              </span>
            </div>

            {/* Quick Muscle Recovery Status Chips */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                <span className="text-[9px] text-emerald-400 font-black block font-mono">100% READY</span>
                <span className="font-bold text-white text-[11px]">Chest & Delts</span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                <span className="text-[9px] text-emerald-400 font-black block font-mono">95% READY</span>
                <span className="font-bold text-white text-[11px]">Back & Lats</span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                <span className="text-[9px] text-amber-400 font-black block font-mono">45% SORE</span>
                <span className="font-bold text-white text-[11px]">Legs & Glutes</span>
              </div>
            </div>

            {/* Action Buttons to Jump to Gym & Calories */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setActivePillar('health');
                  setActiveTab('gym');
                }}
                className="py-2.5 px-3 rounded-full bg-white text-black font-extrabold text-xs flex items-center justify-center gap-1.5 hover:bg-zinc-200 active:scale-95 transition shadow-sm"
              >
                <Dumbbell className="w-3.5 h-3.5 text-[#FF3B30]" />
                <span>Open Body Map</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActivePillar('health');
                  setActiveTab('calories');
                }}
                className="py-2.5 px-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <Utensils className="w-3.5 h-3.5" />
                <span>Log Nutrition</span>
              </button>
            </div>
          </div>

          {/* Primary Action Card: Scan a Product with Label Lens */}
          <div 
            onClick={() => setActiveTab('labellens')}
            className="group cursor-pointer bg-[#121217] hover:bg-[#181822] p-5 rounded-[2rem] border border-white/10 hover:border-[#FF3B30]/40 transition-all duration-300 shadow-card flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#1C1C26] group-hover:bg-[#FF3B30] text-white flex items-center justify-center shrink-0 shadow-sm transition">
                <ScanLine className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">
                    Audit a Product with Label Lens
                  </h3>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/10 text-white border border-white/10">
                    Hero
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1 leading-snug">
                  Photograph front claims & ingredient labels to decode scientific evidence.
                </p>
              </div>
            </div>
            <div className="p-2.5 rounded-full bg-white/10 group-hover:bg-white group-hover:text-black text-white transition shrink-0">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Contextual Science Suggestion */}
          <div className="p-5 rounded-[2rem] bg-[#121217] border border-white/10 space-y-2 shadow-card">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#FF3B30] uppercase tracking-wider font-mono">
              <Sparkles className="w-4 h-4" />
              <span>{suggestion.title}</span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
              {suggestion.text}
            </p>
          </div>

          {/* Safety Disclaimer */}
          <DisclaimerBanner compact />
        </div>

        {/* Right Column (Desktop: 7 cols): Morning & Evening Routine Steps */}
        <div className="lg:col-span-7 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-white">Today's Routine Checklist</h3>
              <p className="text-xs text-zinc-400">Tap steps as you complete them to track daily consistency</p>
            </div>
            <button
              onClick={() => setActiveTab('routine')}
              className="text-xs font-bold text-zinc-300 hover:text-white flex items-center gap-1 transition"
            >
              <span>Manage routine</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#FF3B30]" />
            </button>
          </div>

          {/* Morning Section */}
          {morningSteps.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
                <Sun className="w-4 h-4 text-amber-400" />
                <span>Morning Ritual ({morningSteps.length} steps)</span>
              </div>
              <div className="space-y-2">
                {morningSteps.map((step) => (
                  <div
                    key={step.id}
                    onClick={() => toggleRoutineStep(step.id)}
                    className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-start gap-3.5 shadow-card ${
                      step.isCompletedToday
                        ? 'bg-[#181822]/60 border-white/5 text-zinc-500'
                        : 'bg-[#121217] border-white/10 hover:border-white/20 text-white'
                    }`}
                  >
                    <button
                      type="button"
                      className="mt-0.5 shrink-0 focus:outline-none"
                      aria-label={step.isCompletedToday ? 'Mark incomplete' : 'Mark complete'}
                    >
                      {step.isCompletedToday ? (
                        <CheckCircle2 className="w-5 h-5 text-[#FF3B30] fill-[#FF3B30]/20" />
                      ) : (
                        <Circle className="w-5 h-5 text-zinc-600 hover:text-zinc-400" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className={`text-sm font-bold truncate ${step.isCompletedToday ? 'line-through text-zinc-500' : 'text-white'}`}>
                          {step.action}
                        </h4>
                        <span className="flex items-center gap-1 text-xs font-mono font-medium text-zinc-400 shrink-0">
                          <Clock className="w-3 h-3" />
                          {step.estimatedMinutes}m
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                        {step.shortExplanation}
                      </p>
                      {step.productName && (
                        <span className="inline-block mt-2 text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-white/5 text-zinc-300 border border-white/10">
                          Product: {step.productName}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Evening Section */}
          {eveningSteps.length > 0 && (
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
                <Moon className="w-4 h-4 text-indigo-400" />
                <span>Evening Ritual ({eveningSteps.length} steps)</span>
              </div>
              <div className="space-y-2">
                {eveningSteps.map((step) => (
                  <div
                    key={step.id}
                    onClick={() => toggleRoutineStep(step.id)}
                    className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-start gap-3.5 shadow-card ${
                      step.isCompletedToday
                        ? 'bg-[#181822]/60 border-white/5 text-zinc-500'
                        : 'bg-[#121217] border-white/10 hover:border-white/20 text-white'
                    }`}
                  >
                    <button
                      type="button"
                      className="mt-0.5 shrink-0 focus:outline-none"
                      aria-label={step.isCompletedToday ? 'Mark incomplete' : 'Mark complete'}
                    >
                      {step.isCompletedToday ? (
                        <CheckCircle2 className="w-5 h-5 text-[#FF3B30] fill-[#FF3B30]/20" />
                      ) : (
                        <Circle className="w-5 h-5 text-zinc-600 hover:text-zinc-400" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className={`text-sm font-bold truncate ${step.isCompletedToday ? 'line-through text-zinc-500' : 'text-white'}`}>
                          {step.action}
                        </h4>
                        <span className="flex items-center gap-1 text-xs font-mono font-medium text-zinc-400 shrink-0">
                          <Clock className="w-3 h-3" />
                          {step.estimatedMinutes}m
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                        {step.shortExplanation}
                      </p>
                      {step.productName && (
                        <span className="inline-block mt-2 text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-white/5 text-zinc-300 border border-white/10">
                          Product: {step.productName}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty Routine fallback */}
          {morningSteps.length === 0 && eveningSteps.length === 0 && (
            <div className="p-8 rounded-[2rem] bg-[#121217] border border-white/10 shadow-card text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6 text-[#FF3B30]" />
              </div>
              <h4 className="text-base font-bold text-white">No routine steps active yet</h4>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                Add products or non-commercial evidence habits to build your daily science-backed AM/PM ritual.
              </p>
              <button
                onClick={() => setActiveTab('routine')}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white text-black text-xs font-extrabold shadow-soft hover:bg-zinc-200 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Build My Routine</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
