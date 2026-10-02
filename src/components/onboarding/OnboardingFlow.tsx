import React, { useState } from 'react';
import { useApp, AppPillar } from '../../context/AppContext';
import { 
  WellnessGoal, 
  HealthGoal,
  TrainingExperience,
  DailyTimeCommitment
} from '../../types';
import { MOSAIC_PRODUCTS_CATALOG } from '../../data/mosaicProducts';
import { 
  Leaf, 
  ArrowRight, 
  Check, 
  Bot, 
  ChevronRight, 
  Dumbbell, 
  Sparkles, 
  ShieldCheck 
} from 'lucide-react';

export const OnboardingFlow: React.FC = () => {
  const { completeOnboarding, aiSettings, updateAISettings, setActivePillar, setActiveTab } = useApp();

  // Wizard Step State
  // 1: Name & Age (Baselines) -> 2: Choose Category (Health vs Wellness) -> 3: Domain-Specific Calibration & Recommended Products
  const [step, setStep] = useState<number>(1);
  const [name, setName] = useState<string>('');
  const [age, setAge] = useState<number>(24);
  const [chosenPillar, setChosenPillar] = useState<AppPillar>('health');

  // Health-Specific States
  const [healthGoal, setHealthGoal] = useState<HealthGoal>('hypertrophy_strength');
  const [trainingExp, setTrainingExp] = useState<TrainingExperience>('intermediate');

  // Wellness-Specific States
  const [wellnessGoal, setWellnessGoal] = useState<WellnessGoal>('hair_health');
  const [dailyTime] = useState<DailyTimeCommitment>('5_min');

  const [showApiKeyModal, setShowApiKeyModal] = useState<boolean>(false);
  const [tempApiKey, setTempApiKey] = useState<string>(aiSettings.openRouterApiKey || '');
  const [tempModel, setTempModel] = useState<string>(aiSettings.selectedModel || 'google/gemini-3.1-flash-lite');

  const healthGoalOptions: { id: HealthGoal; title: string; desc: string; icon: string; badge: string }[] = [
    {
      id: 'hypertrophy_strength',
      title: 'Muscle Hypertrophy & Strength',
      desc: 'Progressive overload, peak power output, and muscle protein synthesis.',
      icon: '🏋️',
      badge: 'High Protein • 5g Creatine'
    },
    {
      id: 'fat_loss_recomp',
      title: 'Fat Loss & Body Recomposition',
      desc: 'Caloric deficit management with maximum lean mass preservation.',
      icon: '⚡',
      badge: 'Thermogenic • Protein Retention'
    },
    {
      id: 'athletic_conditioning',
      title: 'Athletic Conditioning & Endurance',
      desc: 'VO2 max recovery kinetics, intra-workout electrolyte hydration & stamina.',
      icon: '🏃',
      badge: 'Electrolytes • CNS Recovery'
    },
    {
      id: 'longevity_health',
      title: 'Metabolic Health & Longevity',
      desc: 'Insulin sensitivity, functional bone density, and restorative sleep kinetics.',
      icon: '🧬',
      badge: 'Chelated Minerals • D3+K2'
    }
  ];

  const wellnessGoalOptions: { id: WellnessGoal; title: string; desc: string; icon: string; badge: string }[] = [
    {
      id: 'hair_health',
      title: 'Improve Hair Health & Density',
      desc: 'Follicular stem cell reactivation, scalp microcirculation & shedding reduction.',
      icon: '🌿',
      badge: '3% Redensyl • Procapil'
    },
    {
      id: 'body_care',
      title: 'Epidermal Barrier & Body Care',
      desc: 'Clear body acne, keratosis pilaris and lipid barrier repair.',
      icon: '💧',
      badge: '1% Salicylic BHA • Niacinamide'
    },
    {
      id: 'sleep_recovery',
      title: 'Sleep Latency & Circadian Rhythm',
      desc: 'Lower sleep latency, regulate nocturnal cortisol & deep restorative REM sleep.',
      icon: '🌙',
      badge: '5mg Melatonin • Mg Bisglycinate'
    }
  ];

  const healthRecommendedProducts = MOSAIC_PRODUCTS_CATALOG.filter(p => 
    p.category.includes('Athletic') || p.category.includes('Recovery') || p.category.includes('Hydration')
  ).slice(0, 3);

  const wellnessRecommendedProducts = MOSAIC_PRODUCTS_CATALOG.filter(p => 
    p.category.includes('Hair') || p.category.includes('Body') || p.category.includes('Sleep')
  ).slice(0, 3);

  const handleQuickSkip = () => {
    setActivePillar('health');
    setActiveTab('today');
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
    setActivePillar(chosenPillar);
    if (chosenPillar === 'health') {
      setActiveTab('gym');
      completeOnboarding({
        name: name.trim() || 'Aarav',
        age,
        primaryGoal: 'hair_health',
        healthGoal,
        trainingExperience: trainingExp,
        dailyTime: '10_min',
        alreadyOwnsProducts: true,
        isOnboarded: true
      });
    } else {
      setActiveTab('today');
      completeOnboarding({
        name: name.trim() || 'Aarav',
        age,
        primaryGoal: wellnessGoal,
        dailyTime,
        alreadyOwnsProducts: true,
        isOnboarded: true
      });
    }
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
              <span className="text-[10px] text-charcoal-500 font-semibold block -mt-0.5 tracking-wider uppercase font-mono">Performance & Wellness</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleQuickSkip}
              className="px-3.5 py-1.5 rounded-full bg-cream-50 hover:bg-mint-100 text-xs font-bold text-forest-900 border border-mint-200 transition active:scale-95"
            >
              <span>Skip Setup ›</span>
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
        {/* STEP 1: NAME & AGE FIRST (BASELINES)                                      */}
        {/* ========================================================================= */}
        {step === 1 && (
          <div className="space-y-6 pt-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div className="space-y-2">
              <span className="text-xs font-mono font-black uppercase tracking-widest text-forest-700">
                Step 1 of 3 • Profile Baselines
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-forest-950 tracking-tight">
                Welcome to Ritual. Who are you?
              </h2>
              <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
                Let's calibrate your baseline profile before selecting your primary health or wellness focus.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-mono uppercase text-charcoal-500 mb-1.5">
                  Your Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex, Jordan, Aarav"
                  className="w-full px-5 py-4 rounded-2xl bg-white border border-mint-200 text-charcoal-900 text-base focus:outline-none focus:ring-2 focus:ring-mint-500 shadow-card font-medium"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') setStep(2);
                  }}
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-charcoal-500 mb-1.5">
                  Your Age
                </label>
                <div className="flex items-center gap-2">
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
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: CHOOSE CATEGORY (HEALTH VS WELLNESS)                              */}
        {/* ========================================================================= */}
        {step === 2 && (
          <div className="space-y-6 pt-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div className="space-y-2">
              <span className="text-xs font-mono font-black uppercase tracking-widest text-forest-700">
                Step 2 of 3 • Category Directive
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-forest-950 tracking-tight">
                Select your focus, {name || 'athlete'}
              </h2>
              <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
                Choose your primary realm. You can switch between Health and Wellness anytime inside the app with 1 tap.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Option 1: ⚡ Health & Fitness */}
              <div
                onClick={() => setChosenPillar('health')}
                className={`p-6 rounded-[2rem] border transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 shadow-card ${
                  chosenPillar === 'health'
                    ? 'bg-mint-50/80 border-mint-500 ring-2 ring-forest-800'
                    : 'bg-white border-mint-200/80 hover:border-mint-400'
                }`}
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-forest-800 to-mint-700 text-white flex items-center justify-center shadow-soft">
                    <Dumbbell className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-black text-forest-950">
                        Health & Fitness
                      </h3>
                      {chosenPillar === 'health' && (
                        <span className="w-5 h-5 rounded-full bg-forest-900 text-white flex items-center justify-center text-xs font-black">
                          ✓
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-charcoal-600 mt-1 leading-relaxed">
                      Gym strength tracker, 3D muscle recovery heatmap, and instant &lt;1s Gemini Vision AI food & calorie scanner.
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-mint-100 flex items-center justify-between text-xs font-mono">
                  <span className="text-charcoal-500">Athletics & Nutrition</span>
                  <span className="text-forest-900 font-bold flex items-center gap-1">
                    Select ⚡
                  </span>
                </div>
              </div>

              {/* Option 2: 🌿 Wellness & Formulations */}
              <div
                onClick={() => setChosenPillar('wellness')}
                className={`p-6 rounded-[2rem] border transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 shadow-card ${
                  chosenPillar === 'wellness'
                    ? 'bg-mint-50/80 border-mint-500 ring-2 ring-forest-800'
                    : 'bg-white border-mint-200/80 hover:border-mint-400'
                }`}
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-mint-700 to-forest-800 text-white flex items-center justify-center shadow-soft">
                    <Leaf className="w-6 h-6 text-mint-200" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-black text-forest-950">
                        Wellness & Rituals
                      </h3>
                      {chosenPillar === 'wellness' && (
                        <span className="w-5 h-5 rounded-full bg-forest-900 text-white flex items-center justify-center text-xs font-black">
                          ✓
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-charcoal-600 mt-1 leading-relaxed">
                      AM/PM daily habit checklists, Rx Label Lens debunking, and Smart Shelf active compound tracking.
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-mint-100 flex items-center justify-between text-xs font-mono">
                  <span className="text-charcoal-500">Clinical Formulation</span>
                  <span className="text-forest-900 font-bold flex items-center gap-1">
                    Select 🌿
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3A: HEALTH-SPECIFIC ONBOARDING & PRODUCT RECOMMENDATIONS             */}
        {/* ========================================================================= */}
        {step === 3 && chosenPillar === 'health' && (
          <div className="space-y-6 pt-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div className="space-y-2">
              <span className="text-xs font-mono font-black uppercase tracking-widest text-forest-700">
                Step 3 of 3 • Athletic Calibration
              </span>
              <h2 className="text-3xl font-black text-forest-950 tracking-tight">
                Your Health & Performance Goal
              </h2>
              <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
                Select your resistance & metabolic target. We calibrate your workout logger and recommend evidence-based supplements.
              </p>
            </div>

            {/* Health Goals Selection */}
            <div className="space-y-2.5">
              {healthGoalOptions.map((opt) => {
                const isSelected = healthGoal === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setHealthGoal(opt.id)}
                    className={`w-full p-4 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between gap-3 shadow-soft ${
                      isSelected
                        ? 'bg-mint-50/80 text-forest-950 border-mint-400 ring-2 ring-forest-800'
                        : 'bg-white text-charcoal-800 border-mint-200/80 hover:border-mint-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{opt.icon}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className={`text-sm font-black ${isSelected ? 'text-forest-950' : 'text-charcoal-900'}`}>
                            {opt.title}
                          </h4>
                          <span className="px-2 py-0.2 rounded-full bg-mint-100 text-[10px] font-mono font-bold text-forest-800 border border-mint-200">
                            {opt.badge}
                          </span>
                        </div>
                        <p className="text-xs text-charcoal-600 mt-0.5">{opt.desc}</p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-forest-900 border-forest-900 text-white' : 'border-mint-200'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Training Experience Bar */}
            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase text-charcoal-500">
                Resistance Training Experience Level
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

            {/* HEALTH PRODUCT RECOMMENDATIONS */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-forest-950">
                  <ShieldCheck className="w-4 h-4 text-forest-800" />
                  <span>Evidence-Backed Performance Formulations</span>
                </div>
                <span className="text-[10px] text-charcoal-500 font-mono">Matched to Goal</span>
              </div>

              <div className="space-y-2.5">
                {healthRecommendedProducts.map((prod) => (
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

        {/* ========================================================================= */}
        {/* STEP 3B: WELLNESS-SPECIFIC ONBOARDING & PRODUCT RECOMMENDATIONS           */}
        {/* ========================================================================= */}
        {step === 3 && chosenPillar === 'wellness' && (
          <div className="space-y-6 pt-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div className="space-y-2">
              <span className="text-xs font-mono font-black uppercase tracking-widest text-forest-700">
                Step 3 of 3 • Wellness Calibration
              </span>
              <h2 className="text-3xl font-black text-forest-950 tracking-tight">
                Your Clinical Wellness Priority
              </h2>
              <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
                Select your biological area of focus. We structure your morning/evening ritual and recommend active clinical formulations.
              </p>
            </div>

            {/* Wellness Goals Selection */}
            <div className="space-y-2.5">
              {wellnessGoalOptions.map((opt) => {
                const isSelected = wellnessGoal === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setWellnessGoal(opt.id)}
                    className={`w-full p-4 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between gap-3 shadow-soft ${
                      isSelected
                        ? 'bg-mint-50/80 text-forest-950 border-mint-400 ring-2 ring-forest-800'
                        : 'bg-white text-charcoal-800 border-mint-200/80 hover:border-mint-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{opt.icon}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className={`text-sm font-black ${isSelected ? 'text-forest-950' : 'text-charcoal-900'}`}>
                            {opt.title}
                          </h4>
                          <span className="px-2 py-0.2 rounded-full bg-mint-100 text-[10px] font-mono font-bold text-forest-800 border border-mint-200">
                            {opt.badge}
                          </span>
                        </div>
                        <p className="text-xs text-charcoal-600 mt-0.5">{opt.desc}</p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-forest-900 border-forest-900 text-white' : 'border-mint-200'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* WELLNESS PRODUCT RECOMMENDATIONS */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-forest-950">
                  <Sparkles className="w-4 h-4 text-forest-800" />
                  <span>Clinically Matched Active Formulations</span>
                </div>
                <span className="text-[10px] text-charcoal-500 font-mono">Clean Label</span>
              </div>

              <div className="space-y-2.5">
                {wellnessRecommendedProducts.map((prod) => (
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
              <span>{step === 1 ? 'Next: Choose Category' : `Configure ${chosenPillar === 'health' ? 'Health' : 'Wellness'} Focus`}</span>
              <ArrowRight className="w-4 h-4 text-mint-300" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinishOnboarding}
              className="flex-1 py-4 px-6 rounded-2xl bg-forest-900 hover:bg-forest-800 text-white font-black text-xs sm:text-sm shadow-soft flex items-center justify-center gap-2 transition active:scale-98"
            >
              <span>Launch {chosenPillar === 'health' ? 'Health & Fitness Suite' : 'Wellness Protocol'}</span>
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
