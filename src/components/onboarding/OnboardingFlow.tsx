import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  WellnessGoal, 
  HealthGoal,
  TrainingExperience
} from '../../types';
import { MOSAIC_PRODUCTS_CATALOG } from '../../data/mosaicProducts';
import { 
  Leaf, 
  ArrowRight, 
  Check, 
  Bot, 
  ChevronRight, 
  Dumbbell, 
  ShieldCheck,
  ScanLine,
  Utensils,
  FileText
} from 'lucide-react';

interface CombinedGoalOption {
  id: string;
  category: 'fitness' | 'wellness';
  healthGoalKey?: HealthGoal;
  wellnessGoalKey?: WellnessGoal;
  title: string;
  desc: string;
  icon: string;
  badge: string;
  defaultPillar: 'health' | 'wellness';
}

const ALL_GOAL_OPTIONS: CombinedGoalOption[] = [
  {
    id: 'hypertrophy_strength',
    category: 'fitness',
    healthGoalKey: 'hypertrophy_strength',
    wellnessGoalKey: 'body_care',
    title: 'Muscle Growth & Hypertrophy',
    desc: 'Progressive overload tracking, power output, and muscle protein synthesis.',
    icon: '🏋️',
    badge: 'High Protein • Creatine Monohydrate',
    defaultPillar: 'health'
  },
  {
    id: 'fat_loss_recomp',
    category: 'fitness',
    healthGoalKey: 'fat_loss_recomp',
    wellnessGoalKey: 'body_care',
    title: 'Fat Loss & Body Recomposition',
    desc: 'Caloric deficit management with maximum lean muscle mass retention.',
    icon: '⚡',
    badge: 'Macro Deficit • Thermogenic',
    defaultPillar: 'health'
  },
  {
    id: 'athletic_conditioning',
    category: 'fitness',
    healthGoalKey: 'athletic_conditioning',
    wellnessGoalKey: 'sleep_recovery',
    title: 'Athletic Conditioning & Endurance',
    desc: 'VO2 max recovery kinetics, intra-workout electrolytes, and stamina.',
    icon: '🏃',
    badge: 'Electrolyte Balance • CNS Recovery',
    defaultPillar: 'health'
  },
  {
    id: 'hair_health',
    category: 'wellness',
    wellnessGoalKey: 'hair_health',
    healthGoalKey: 'longevity_health',
    title: 'Hair Health & Follicle Density',
    desc: 'Scalp microcirculation, follicle reactivation, and shedding reduction.',
    icon: '🌿',
    badge: '3% Redensyl • Procapil',
    defaultPillar: 'wellness'
  },
  {
    id: 'body_care',
    category: 'wellness',
    wellnessGoalKey: 'body_care',
    healthGoalKey: 'hypertrophy_strength',
    title: 'Skin & Body Barrier Health',
    desc: 'Clear body acne, keratosis pilaris, and lipid barrier restoration.',
    icon: '💧',
    badge: '1% Salicylic Acid • Niacinamide',
    defaultPillar: 'wellness'
  },
  {
    id: 'sleep_recovery',
    category: 'wellness',
    wellnessGoalKey: 'sleep_recovery',
    healthGoalKey: 'longevity_health',
    title: 'Sleep Latency & Deep Recovery',
    desc: 'Lower sleep latency, modulate nocturnal cortisol, and promote deep REM sleep.',
    icon: '🌙',
    badge: 'Melatonin • Mg Bisglycinate',
    defaultPillar: 'wellness'
  }
];

export const OnboardingFlow: React.FC = () => {
  const { completeOnboarding, aiSettings, updateAISettings, setActivePillar, setActiveTab } = useApp();

  // Wizard Step State
  // 1: Name, Age & Goal Selection -> 2: Ritual AI Feature Suite Showcase -> 3: Matched Clinical Formulations
  const [step, setStep] = useState<number>(1);
  const [name, setName] = useState<string>('');
  const [age, setAge] = useState<number>(24);
  const [selectedGoalId, setSelectedGoalId] = useState<string>('hypertrophy_strength');
  const [trainingExp, setTrainingExp] = useState<TrainingExperience>('intermediate');

  const [showApiKeyModal, setShowApiKeyModal] = useState<boolean>(false);
  const [tempApiKey, setTempApiKey] = useState<string>(aiSettings.openRouterApiKey || '');
  const [tempModel, setTempModel] = useState<string>(aiSettings.selectedModel || 'google/gemini-3.1-flash-lite');

  const selectedGoal = ALL_GOAL_OPTIONS.find(g => g.id === selectedGoalId) || ALL_GOAL_OPTIONS[0];

  // Matched Formulations Catalog based on selected goal
  const matchedProducts = React.useMemo(() => {
    if (selectedGoal.category === 'fitness') {
      return MOSAIC_PRODUCTS_CATALOG.filter(p => 
        p.category.includes('Athletic') || p.category.includes('Recovery') || p.category.includes('Hydration') || p.category.includes('Protein')
      ).slice(0, 3);
    } else {
      return MOSAIC_PRODUCTS_CATALOG.filter(p => 
        p.category.includes('Hair') || p.category.includes('Body') || p.category.includes('Sleep') || p.category.includes('Skin')
      ).slice(0, 3);
    }
  }, [selectedGoal]);

  const handleQuickSkip = () => {
    setActivePillar('health');
    setActiveTab('home');
    completeOnboarding({
      name: 'Athlete',
      age: 24,
      primaryGoal: 'hair_health',
      healthGoal: 'hypertrophy_strength',
      trainingExperience: 'intermediate',
      dailyTime: '5_min',
      alreadyOwnsProducts: true,
      isOnboarded: true
    });
  };

  const handleFinishOnboarding = () => {
    setActivePillar(selectedGoal.defaultPillar);
    setActiveTab('home');
    completeOnboarding({
      name: name.trim() || 'Aarav',
      age,
      primaryGoal: selectedGoal.wellnessGoalKey || 'hair_health',
      healthGoal: selectedGoal.healthGoalKey || 'hypertrophy_strength',
      trainingExperience: trainingExp,
      dailyTime: '10_min',
      alreadyOwnsProducts: true,
      isOnboarded: true
    });
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-charcoal-900 flex flex-col justify-between p-4 sm:p-8 max-w-2xl mx-auto selection:bg-[#44926C] selection:text-white">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between pb-6 border-b border-mint-200/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-forest-900 flex items-center justify-center text-white shadow-soft">
              <Leaf className="w-4 h-4 text-mint-300" />
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-forest-950">RITUAL</span>
              <span className="text-[10px] text-charcoal-500 font-semibold block -mt-0.5 tracking-wider uppercase font-mono">
                Performance & Health OS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleQuickSkip}
              className="px-3.5 py-1.5 rounded-full bg-cream-50 hover:bg-mint-100 text-xs font-bold text-forest-900 border border-mint-200 transition active:scale-95"
            >
              <span>Quick Skip ›</span>
            </button>

            <button
              onClick={() => setShowApiKeyModal(true)}
              className="p-2 rounded-full bg-cream-50 hover:bg-mint-100 border border-mint-200 text-charcoal-600 hover:text-forest-900 transition"
              title="AI Settings"
            >
              <Bot className="w-4 h-4 text-forest-800" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* STEP 1: PROFILE BASELINES & PRIMARY GOAL                                  */}
        {/* ========================================================================= */}
        {step === 1 && (
          <div className="space-y-6 pt-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div className="space-y-2">
              <span className="text-xs font-mono font-black uppercase tracking-widest text-forest-700">
                Step 1 of 3 • Profile & Focus
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-forest-950 tracking-tight">
                Welcome to Ritual. Set your focus.
              </h2>
              <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
                Tell us your primary target to calibrate your workout log, calorie targets, and clinical insights.
              </p>
            </div>

            {/* Name & Age Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-mono uppercase text-charcoal-500 mb-1.5">
                  Your Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex, Jordan, Aarav"
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-mint-200 text-charcoal-900 text-sm focus:outline-none focus:ring-2 focus:ring-mint-500 shadow-card font-medium"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-charcoal-500 mb-1.5">
                  Your Age
                </label>
                <div className="flex items-center gap-1.5">
                  {[20, 24, 28, 32, 36].map((presetAge) => (
                    <button
                      key={presetAge}
                      type="button"
                      onClick={() => setAge(presetAge)}
                      className={`flex-1 py-3 rounded-xl border text-xs font-black transition ${
                        age === presetAge
                          ? 'bg-forest-900 text-white border-forest-900 shadow-soft'
                          : 'bg-white text-charcoal-700 border-mint-200 hover:bg-mint-50'
                      }`}
                    >
                      {presetAge}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Primary Goal Selector Cards */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-mono uppercase text-charcoal-500">
                Select Primary Health & Performance Focus
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ALL_GOAL_OPTIONS.map((opt) => {
                  const isSelected = selectedGoalId === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedGoalId(opt.id)}
                      className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between space-y-2 shadow-soft ${
                        isSelected
                          ? 'bg-mint-50/90 text-forest-950 border-mint-400 ring-2 ring-forest-800'
                          : 'bg-white text-charcoal-800 border-mint-200/80 hover:border-mint-400'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-2xl">{opt.icon}</span>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-forest-900 border-forest-900 text-white' : 'border-mint-200'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-black text-forest-950">
                          {opt.title}
                        </h4>
                        <p className="text-[11px] text-charcoal-600 mt-0.5 line-clamp-2 leading-relaxed">
                          {opt.desc}
                        </p>
                      </div>

                      <div className="pt-1">
                        <span className="px-2 py-0.5 rounded-full bg-mint-100 text-[9px] font-mono font-bold text-forest-800 border border-mint-200 block truncate">
                          {opt.badge}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Training Experience Selector */}
            <div className="space-y-2 pt-1">
              <label className="block text-xs font-mono uppercase text-charcoal-500">
                Training Experience Level
              </label>
              <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                {(['beginner', 'intermediate', 'advanced'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setTrainingExp(lvl)}
                    className={`py-2.5 rounded-xl border capitalize font-bold transition ${
                      trainingExp === lvl
                        ? 'bg-forest-900 text-white border-forest-900 shadow-soft'
                        : 'bg-white text-charcoal-700 border-mint-200 hover:bg-mint-50'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: RITUAL INTEGRATED SUITE CAPABILITIES                              */}
        {/* ========================================================================= */}
        {step === 2 && (
          <div className="space-y-6 pt-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div className="space-y-2">
              <span className="text-xs font-mono font-black uppercase tracking-widest text-forest-700">
                Step 2 of 3 • Core Feature Suite
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-forest-950 tracking-tight">
                Everything you need in one place
              </h2>
              <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
                Ritual unifies workout tracking, macro vision AI, formulation debunking, and medical lab records.
              </p>
            </div>

            {/* 4 Core Features Showcase Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              {/* Feature 1: 🏋️ Workout & 3D Anatomy */}
              <div className="p-4 rounded-2xl bg-white border border-mint-200 shadow-card space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-forest-900 text-white flex items-center justify-center shadow-soft">
                  <Dumbbell className="w-5 h-5 text-mint-300" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-forest-950">
                    Workout Log & 3D Anatomy
                  </h4>
                  <p className="text-xs text-charcoal-600 mt-1 leading-relaxed">
                    Interactive 3D muscle anatomy heatmap, exercise library, set/rep logging & progressive overload tracking.
                  </p>
                </div>
                <span className="inline-block text-[10px] font-mono font-bold text-mint-700">
                  ⚡ Interactive Muscle Recovery
                </span>
              </div>

              {/* Feature 2: 🔬 Dual-Slot Myth Buster */}
              <div className="p-4 rounded-2xl bg-white border border-mint-200 shadow-card space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-forest-900 text-white flex items-center justify-center shadow-soft">
                  <ScanLine className="w-5 h-5 text-mint-300" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-forest-950">
                    Dual Myth Buster & Label Lens
                  </h4>
                  <p className="text-xs text-charcoal-600 mt-1 leading-relaxed">
                    Dual-slot Front (claims) & Back (ingredients) scan. Detects fairy dusting with direct PubMed study links.
                  </p>
                </div>
                <span className="inline-block text-[10px] font-mono font-bold text-mint-700">
                  🔬 Direct PubMed Citations
                </span>
              </div>

              {/* Feature 3: 🥗 AI Calorie & Macro Scanner */}
              <div className="p-4 rounded-2xl bg-white border border-mint-200 shadow-card space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-forest-900 text-white flex items-center justify-center shadow-soft">
                  <Utensils className="w-5 h-5 text-mint-300" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-forest-950">
                    Smart AI Calorie Tracker
                  </h4>
                  <p className="text-xs text-charcoal-600 mt-1 leading-relaxed">
                    &lt;1s Multimodal AI food photo scanner, barcode lookups, macro breakdown rings, and water tracker.
                  </p>
                </div>
                <span className="inline-block text-[10px] font-mono font-bold text-mint-700">
                  📸 Photo-to-Macros AI
                </span>
              </div>

              {/* Feature 4: 📋 Medical Docs AI & Lab Vault */}
              <div className="p-4 rounded-2xl bg-white border border-mint-200 shadow-card space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-forest-900 text-white flex items-center justify-center shadow-soft">
                  <FileText className="w-5 h-5 text-mint-300" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-forest-950">
                    Medical Docs & Lab Vault
                  </h4>
                  <p className="text-xs text-charcoal-600 mt-1 leading-relaxed">
                    Upload blood tests and medical PDF reports. AI flags out-of-range biomarkers and synthesizes insights.
                  </p>
                </div>
                <span className="inline-block text-[10px] font-mono font-bold text-mint-700">
                  🩺 Clinical Blood Work AI
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: MATCHED CLINICAL FORMULATIONS & LAUNCH                            */}
        {/* ========================================================================= */}
        {step === 3 && (
          <div className="space-y-6 pt-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div className="space-y-2">
              <span className="text-xs font-mono font-black uppercase tracking-widest text-forest-700">
                Step 3 of 3 • Clinical Match
              </span>
              <h2 className="text-3xl font-black text-forest-950 tracking-tight">
                Formulations for {selectedGoal.title}
              </h2>
              <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
                Clean, 100% disclosed clinical formulations calibrated for your goal.
              </p>
            </div>

            {/* Matched Products List */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-forest-950">
                  <ShieldCheck className="w-4 h-4 text-forest-800" />
                  <span>Evidence-Backed Formulations</span>
                </div>
                <span className="text-[10px] text-charcoal-500 font-mono">Fully Disclosed</span>
              </div>

              <div className="space-y-2.5">
                {matchedProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="p-3.5 sm:p-4 rounded-2xl bg-white border border-mint-200/80 flex items-center justify-between gap-3.5 shadow-card hover:border-mint-400 transition group"
                  >
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      <div className="w-14 h-14 rounded-xl bg-cream-50 border border-mint-200 shrink-0 overflow-hidden relative flex items-center justify-center">
                        {prod.imageUrl && (
                          <img
                            src={prod.imageUrl}
                            alt={prod.product}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        )}
                      </div>

                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-black text-forest-950 truncate">{prod.product}</span>
                          <span className="px-2 py-0.5 rounded-full bg-mint-100 text-forest-800 text-[9px] font-mono font-bold shrink-0 border border-mint-200">
                            {prod.potencyBadge}
                          </span>
                        </div>
                        <p className="text-[11px] text-charcoal-600 leading-snug line-clamp-2">{prod.description}</p>
                        <span className="text-[10px] text-mint-700 font-mono block">
                          ✓ {prod.clinicalAdvantage}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-black text-forest-950 block">
                        {prod.currency}{prod.sitePrice}
                      </span>
                      <span className="text-[9px] text-charcoal-500 font-mono block uppercase">
                        {prod.bioavailabilityRating}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="pt-6 pb-2 border-t border-mint-200 mt-6">
        <div className="flex items-center gap-3">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(s => s - 1)}
              className="py-3.5 px-5 rounded-2xl bg-cream-50 text-charcoal-700 font-bold text-xs hover:bg-mint-100 border border-mint-200 transition active:scale-95"
            >
              Back
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => {
                if (step === 1 && !name.trim()) setName('Athlete');
                setStep(s => s + 1);
              }}
              className="flex-1 py-4 px-6 rounded-2xl bg-forest-900 hover:bg-forest-800 text-white font-black text-xs sm:text-sm shadow-soft flex items-center justify-center gap-2 transition active:scale-98"
            >
              <span>{step === 1 ? 'Next: Explore Features' : 'Next: Matched Formulations'}</span>
              <ArrowRight className="w-4 h-4 text-mint-300" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinishOnboarding}
              className="flex-1 py-4 px-6 rounded-2xl bg-forest-900 hover:bg-forest-800 text-white font-black text-xs sm:text-sm shadow-soft flex items-center justify-center gap-2 transition active:scale-98"
            >
              <span>Enter Ritual Dashboard</span>
              <ChevronRight className="w-5 h-5 text-mint-300" />
            </button>
          )}
        </div>
      </div>

      {/* AI Settings Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-modal border border-mint-200 space-y-4 text-charcoal-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-forest-800" />
                <h3 className="text-base font-black text-forest-950">AI Model Provider</h3>
              </div>
              <button onClick={() => setShowApiKeyModal(false)} className="text-charcoal-400 hover:text-charcoal-700 font-bold">✕</button>
            </div>

            <p className="text-xs text-charcoal-600 leading-relaxed">
              Ritual runs completely free offline with its built-in clinical database. You can optionally connect OpenRouter or Gemini models for vision.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-mono uppercase text-charcoal-500 mb-1">OpenRouter API Key (Optional)</label>
                <input
                  type="password"
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  placeholder="sk-or-v1-..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-cream-50 border border-mint-200 text-charcoal-900 font-mono focus:outline-none focus:ring-2 focus:ring-mint-500"
                />
              </div>

              <div>
                <label className="block font-mono uppercase text-charcoal-500 mb-1">AI Model Engine</label>
                <input
                  type="text"
                  value={tempModel}
                  onChange={(e) => setTempModel(e.target.value)}
                  placeholder="google/gemini-3.1-flash-lite"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-cream-50 border border-mint-200 text-charcoal-900 font-mono focus:outline-none focus:ring-2 focus:ring-mint-500"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  updateAISettings({
                    openRouterApiKey: tempApiKey.trim(),
                    selectedModel: tempModel,
                    provider: tempApiKey.trim() ? 'openrouter' : 'local'
                  });
                  setShowApiKeyModal(false);
                }}
                className="w-full py-3 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-black text-xs shadow-soft transition"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
