import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ScanLine, 
  CheckCircle2, 
  Circle, 
  Sun, 
  Moon, 
  ArrowRight, 
  Clock, 
  Dumbbell,
  Camera,
  ChevronRight,
  Share2,
  Sparkles,
  Award
} from 'lucide-react';
import { DisclaimerBanner } from '../common/DisclaimerBanner';
import { SocialShareModal } from '../common/SocialShareModal';
import { ShareCardData } from '../../types';

export const TodayView: React.FC = () => {
  const { 
    profile, 
    routineSteps, 
    toggleRoutineStep, 
    setActiveTab, 
    progressHistory,
    activePillar,
    setActivePillar
  } = useApp();

  const [shareModalData, setShareModalData] = useState<ShareCardData | null>(null);

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

  // Streak days estimate
  const currentStreak = progressHistory.filter(p => p.completionRate >= 0.75).length + (progressPercent >= 75 ? 1 : 0);

  const createProtocolShareData = (): ShareCardData => {
    const completedSteps = routineSteps.filter(s => s.isCompletedToday);
    const highlightNames = completedSteps.map(s => s.productName || s.action).slice(0, 4);

    return {
      type: 'protocol',
      title: 'Daily Bio-Protocol Complete',
      subtitle: `${completedCount} of ${totalSteps} clinical habits checked in`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      primaryStat: {
        label: 'DAILY ADHERENCE',
        value: `${progressPercent}%`,
        unit: 'LOCKED'
      },
      secondaryStats: [
        { label: 'STREAK', value: `${currentStreak} Days`, highlight: true },
        { label: '7-DAY CONSISTENCY', value: `${avgCompletion}%` },
        { label: 'HABITS DONE', value: `${completedCount}/${totalSteps}` }
      ],
      highlightItems: highlightNames.length > 0 ? highlightNames : ['Morning Protocol', 'Hydration & Nutrition', 'Evening Recovery'],
      badgeText: progressPercent === 100 ? '🌟 PERFECT 100% PROTOCOL' : '🌿 DAILY PROTOCOL ACTIVE',
      tagline: 'Evidence-Based Wellness Stack'
    };
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-200 text-charcoal-900 max-w-4xl mx-auto">


      {/* ========================================================================= */}
      {/* 🎯 CATEGORY CHOOSER AT THE BEGINNING (FRONT & CENTER)                     */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-forest-700">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}
          </span>
          <span className="text-xs font-mono text-charcoal-500 font-medium">
            Goal: <strong className="text-forest-950 capitalize">
              {activePillar === 'health' 
                ? (profile.healthGoal 
                    ? ({
                        hypertrophy_strength: 'Hypertrophy & Strength',
                        fat_loss_recomp: 'Fat Loss & Recomp',
                        athletic_conditioning: 'Athletic Conditioning',
                        longevity_health: 'Metabolic Longevity'
                      }[profile.healthGoal] || profile.healthGoal.replace('_', ' '))
                    : 'Strength & Performance')
                : profile.primaryGoal.replace('_', ' ')}
            </strong>
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-forest-950 tracking-tight">
          {getGreeting()}, {profile.name || 'Aarav'}
        </h2>

        {/* Big Touch-Friendly Category Chooser */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-white rounded-[1.75rem] border border-mint-200/80 shadow-soft">
          <button
            type="button"
            onClick={() => setActivePillar('wellness')}
            className={`py-3 px-4 rounded-[1.25rem] text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all duration-200 active:scale-98 ${
              activePillar === 'wellness'
                ? 'bg-forest-900 text-white shadow-soft scale-[1.01]'
                : 'text-charcoal-600 hover:text-forest-900 hover:bg-mint-50'
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
                ? 'bg-forest-900 text-white shadow-soft scale-[1.01]'
                : 'text-charcoal-600 hover:text-forest-900 hover:bg-mint-50'
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
          <div className="bg-white rounded-[2rem] p-5 sm:p-6 shadow-card border border-mint-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase text-forest-700 tracking-wider">
                Daily Ritual Progress
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-forest-950 font-mono leading-none">
                  {progressPercent}%
                </span>
                <span className="text-xs text-charcoal-500 font-mono">
                  ({completedCount}/{totalSteps} steps completed)
                </span>
              </div>
              <span className="text-[11px] text-charcoal-500 block pt-1">
                7-Day Consistency: <strong className="text-forest-950">{avgCompletion}%</strong> • Active Streak: <strong className="text-forest-950">🔥 {currentStreak}d</strong>
              </span>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-center">
              <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
                <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-mint-100 stroke-current"
                    strokeWidth="3.5"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-forest-900 stroke-current transition-all duration-500 ease-out"
                    strokeDasharray={`${progressPercent}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute text-[11px] font-bold text-forest-950 font-mono">{progressPercent}%</span>
              </div>

              <button
                type="button"
                onClick={() => setShareModalData(createProtocolShareData())}
                className="px-3.5 py-2.5 rounded-2xl bg-[#FC5200] hover:bg-[#E04800] text-white text-xs font-black transition active:scale-95 shadow-soft flex items-center gap-1.5"
                title="Share Strava-Style Activity Card"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Card</span>
              </button>
            </div>
          </div>

          {/* 100% Completion Celebration Banner */}
          {progressPercent === 100 && (
            <div className="p-4 sm:p-5 rounded-[2rem] bg-gradient-to-r from-forest-900 via-forest-800 to-forest-900 text-white border border-mint-400/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in zoom-in-95">
              <div className="flex items-center gap-3 text-left">
                <div className="w-12 h-12 rounded-2xl bg-[#FC5200] text-white flex items-center justify-center shrink-0 shadow-lg shadow-[#FC5200]/30 animate-bounce">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-mint-300 font-mono">
                      Protocol Completed
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#FC5200] text-white text-[9px] font-mono font-bold">
                      100% Done
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    Flawless Consistency Today!
                  </h3>
                  <p className="text-xs text-mint-100/80">
                    You checked in every morning & evening habit. Share your achievement to Strava / Socials!
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShareModalData(createProtocolShareData())}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-[#FC5200] hover:bg-[#E04800] text-white text-xs sm:text-sm font-black transition active:scale-95 shadow-lg shadow-[#FC5200]/30 flex items-center justify-center gap-2 shrink-0"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate Share Card 📸</span>
              </button>
            </div>
          )}

          {/* Quick Action: Rx Label Lens */}
          <button
            type="button"
            onClick={() => setActiveTab('labellens')}
            className="w-full p-4 sm:p-5 rounded-[2rem] bg-white hover:bg-mint-50/20 border border-mint-200/80 hover:border-mint-400 transition text-left flex items-center justify-between shadow-card group active:scale-99"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-mint-100 text-forest-900 border border-mint-200 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <ScanLine className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-black text-forest-950">
                    Audit Product with Label Lens
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-cream-50 text-forest-800 border border-mint-200 text-[10px] font-mono">
                    Rx Lens
                  </span>
                </div>
                <p className="text-xs text-charcoal-600 mt-0.5">
                  Scan bottle barcode, take photo, or paste ingredients to check scientific evidence.
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-charcoal-400 group-hover:text-forest-900 transition shrink-0" />
          </button>

          {/* Morning Checklist */}
          {morningSteps.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono font-bold uppercase text-forest-700 px-1">
                <div className="flex items-center gap-1.5">
                  <Sun className="w-4 h-4 text-amber-600" />
                  <span>Morning Ritual</span>
                </div>
                <span>{morningSteps.filter(s => s.isCompletedToday).length}/{morningSteps.length} done</span>
              </div>

              <div className="space-y-2">
                {morningSteps.map((step) => (
                  <div
                    key={step.id}
                    onClick={() => toggleRoutineStep(step.id)}
                    className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 shadow-soft ${
                      step.isCompletedToday
                        ? 'bg-cream-50/50 border-mint-100 text-charcoal-400'
                        : 'bg-white border-mint-200/80 hover:border-mint-400 text-charcoal-900'
                    }`}
                  >
                    <button
                      type="button"
                      className="shrink-0 focus:outline-none"
                    >
                      {step.isCompletedToday ? (
                        <CheckCircle2 className="w-5 h-5 text-forest-900 fill-forest-100" />
                      ) : (
                        <Circle className="w-5 h-5 text-charcoal-400 hover:text-forest-800" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-xs sm:text-sm font-bold truncate ${step.isCompletedToday ? 'line-through text-charcoal-400' : 'text-forest-950'}`}>
                          {step.action}
                        </span>
                        <span className="text-[10px] font-mono text-charcoal-500 flex items-center gap-1 shrink-0">
                          <Clock className="w-3 h-3" />
                          {step.estimatedMinutes}m
                        </span>
                      </div>
                      <p className="text-[11px] text-charcoal-500 truncate mt-0.5">{step.shortExplanation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Evening Checklist */}
          {eveningSteps.length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs font-mono font-bold uppercase text-forest-700 px-1">
                <div className="flex items-center gap-1.5">
                  <Moon className="w-4 h-4 text-teal-700" />
                  <span>Evening Ritual</span>
                </div>
                <span>{eveningSteps.filter(s => s.isCompletedToday).length}/{eveningSteps.length} done</span>
              </div>

              <div className="space-y-2">
                {eveningSteps.map((step) => (
                  <div
                    key={step.id}
                    onClick={() => toggleRoutineStep(step.id)}
                    className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 shadow-soft ${
                      step.isCompletedToday
                        ? 'bg-cream-50/50 border-mint-100 text-charcoal-400'
                        : 'bg-white border-mint-200/80 hover:border-mint-400 text-charcoal-900'
                    }`}
                  >
                    <button
                      type="button"
                      className="shrink-0 focus:outline-none"
                    >
                      {step.isCompletedToday ? (
                        <CheckCircle2 className="w-5 h-5 text-forest-900 fill-forest-100" />
                      ) : (
                        <Circle className="w-5 h-5 text-charcoal-400 hover:text-forest-800" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-xs sm:text-sm font-bold truncate ${step.isCompletedToday ? 'line-through text-charcoal-400' : 'text-forest-950'}`}>
                          {step.action}
                        </span>
                        <span className="text-[10px] font-mono text-charcoal-500 flex items-center gap-1 shrink-0">
                          <Clock className="w-3 h-3" />
                          {step.estimatedMinutes}m
                        </span>
                      </div>
                      <p className="text-[11px] text-charcoal-500 truncate mt-0.5">{step.shortExplanation}</p>
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
            className="p-5 sm:p-6 rounded-[2rem] bg-white hover:bg-mint-50/20 border border-mint-200/80 hover:border-mint-400 transition cursor-pointer shadow-card flex items-center justify-between gap-4 group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-forest-800 to-forest-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform shrink-0 shadow-soft">
                <Dumbbell className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-forest-700 uppercase tracking-wider block">
                  Athletic Performance
                </span>
                <h3 className="text-base sm:text-lg font-black text-forest-950 mt-0.5">
                  Gym Tracker & 3D Body Map
                </h3>
                <p className="text-xs text-charcoal-600 mt-1">
                  Log sets, reps, and RPE with built-in rest timers & muscle recovery heatmaps.
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-charcoal-400 group-hover:text-forest-900 transition shrink-0" />
          </div>

          {/* Calorie & Gemini AI Vision Action Tile */}
          <div
            onClick={() => setActiveTab('calories')}
            className="p-5 sm:p-6 rounded-[2rem] bg-white hover:bg-mint-50/20 border border-mint-200/80 hover:border-mint-400 transition cursor-pointer shadow-card flex items-center justify-between gap-4 group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-mint-700 to-forest-900 text-white flex items-center justify-center group-hover:scale-105 transition-transform shrink-0 shadow-soft">
                <Camera className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-forest-700 uppercase tracking-wider block">
                  Instant &lt;1s Vision AI
                </span>
                <h3 className="text-base sm:text-lg font-black text-forest-950 mt-0.5">
                  Snap Meal Photos & Track Calories
                </h3>
                <p className="text-xs text-charcoal-600 mt-1">
                  Smart Multimodal AI vision automatically estimates calories, protein, carbs & fat.
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-charcoal-400 group-hover:text-forest-900 transition shrink-0" />
          </div>

          {/* Biomechanical Readiness Pill */}
          <div className="p-4 rounded-2xl bg-white border border-mint-200/80 shadow-soft flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-mint-500 animate-pulse" />
              <span className="text-charcoal-800 font-bold">Biomechanical Readiness: 88% Primed</span>
            </div>
            <button
              onClick={() => setActiveTab('gym')}
              className="text-forest-900 hover:text-forest-700 font-bold flex items-center gap-1 transition"
            >
              <span>View Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      <DisclaimerBanner compact />

      {/* Strava-Style Social Share Modal */}
      {shareModalData && (
        <SocialShareModal
          isOpen={!!shareModalData}
          onClose={() => setShareModalData(null)}
          data={shareModalData}
        />
      )}
    </div>
  );
};
