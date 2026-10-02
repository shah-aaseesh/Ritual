import React, { useState } from 'react';
import { useApp, AppPillar } from '../../context/AppContext';
import { 
  WellnessGoal, 
  DailyTimeCommitment, 
  OnboardingProduct
} from '../../types';
import { 
  findMatchingMosaicProducts, 
  POPULAR_OPENROUTER_MODELS 
} from '../../services/aiService';
import { BarcodeScannerModal } from '../common/BarcodeScannerModal';
import { BarcodeLookupResult } from '../../services/barcodeService';
import { 
  Leaf, 
  ArrowRight, 
  Check, 
  Bot, 
  ChevronRight,
  Dumbbell
} from 'lucide-react';

export const OnboardingFlow: React.FC = () => {
  const { completeOnboarding, aiSettings, updateAISettings, showToast, setActivePillar, setActiveTab } = useApp();

  // Wizard Steps
  // 1: Choose Domain (Health vs Wellness) -> 2: Name & Age -> 3: Specific Goal -> 4: Routine Ready
  const [step, setStep] = useState<number>(1);
  const [chosenPillar, setChosenPillar] = useState<AppPillar>('wellness');
  const [name, setName] = useState<string>('');
  const [age, setAge] = useState<number>(24);
  const [goal, setGoal] = useState<WellnessGoal>('hair_health');
  const [dailyTime] = useState<DailyTimeCommitment>('5_min');

  // Scanned products collection
  const [scannedProducts, setScannedProducts] = useState<OnboardingProduct[]>([
    {
      id: 'prod-1',
      name: '',
      brand: '',
      category: 'Hair Care',
      ingredientText: '',
      claimText: '',
      ingredientAnalysis: undefined,
      matchedMosaic: []
    }
  ]);

  const [showApiKeyModal, setShowApiKeyModal] = useState<boolean>(false);
  const [tempApiKey, setTempApiKey] = useState<string>(aiSettings.openRouterApiKey || '');
  const [tempModel, setTempModel] = useState<string>(aiSettings.selectedModel || 'google/gemini-3.1-flash-lite');
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState<boolean>(false);

  const handleOnboardingBarcodeProduct = (result: BarcodeLookupResult) => {
    const detectedNames = result.analysis.detectedIngredients.map(d => d.ingredient.name);
    const matched = findMatchingMosaicProducts(detectedNames, goal);

    setScannedProducts(prev => {
      const copy = [...prev];
      copy[0] = {
        ...copy[0],
        name: result.productName,
        brand: result.brand,
        ingredientText: result.ingredientText,
        ingredientAnalysis: result.analysis,
        matchedMosaic: matched
      };
      return copy;
    });
    showToast(`Linked: ${result.productName}`, 'success');
  };

  const goalOptions: { id: WellnessGoal; title: string; desc: string; icon: string }[] = [
    {
      id: 'hair_health',
      title: 'Improve Hair Health',
      desc: 'Follicular density, scalp microcirculation & shedding reduction.',
      icon: '🌿'
    },
    {
      id: 'body_care',
      title: 'Build a Body-Care Routine',
      desc: 'Clear body acne, keratosis pilaris & epidermal barrier care.',
      icon: '💧'
    },
    {
      id: 'sleep_recovery',
      title: 'Sleep & Recover Better',
      desc: 'Lower sleep latency, regulate cortisol & nocturnal relaxation.',
      icon: '🌙'
    }
  ];

  const handleQuickLaunch = (pillar: AppPillar) => {
    setActivePillar(pillar);
    if (pillar === 'health') {
      setActiveTab('gym');
      completeOnboarding({
        name: name.trim() || 'Athlete',
        age,
        primaryGoal: 'sleep_recovery',
        dailyTime: '10_min',
        alreadyOwnsProducts: false,
        isOnboarded: true
      });
      showToast('Welcome to Health & Fitness!', 'success');
    } else {
      setActiveTab('today');
      completeOnboarding({
        name: name.trim() || 'Aarav',
        age,
        primaryGoal: goal,
        dailyTime: '5_min',
        alreadyOwnsProducts: true,
        isOnboarded: true
      });
      showToast('Welcome to Clinical Wellness!', 'success');
    }
  };

  const handleFinalFinish = () => {
    setActivePillar(chosenPillar);
    if (chosenPillar === 'health') {
      setActiveTab('gym');
    } else {
      setActiveTab('today');
    }

    completeOnboarding(
      {
        name: name.trim() || (chosenPillar === 'health' ? 'Athlete' : 'Aarav'),
        age,
        primaryGoal: goal,
        dailyTime,
        alreadyOwnsProducts: true,
        isOnboarded: true
      },
      scannedProducts
    );
  };

  return (
    <div className="min-h-screen bg-[#09090D] text-white flex flex-col justify-between p-4 sm:p-8 max-w-2xl mx-auto selection:bg-[#FF3B30] selection:text-white">
      {/* Top Header & Skip Option */}
      <div>
        <div className="flex items-center justify-between pb-6 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#FF3B30] to-rose-700 flex items-center justify-center text-white shadow-md shadow-[#FF3B30]/20">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-white">RITUAL</span>
              <span className="text-[10px] text-zinc-400 font-semibold block -mt-0.5 tracking-wider uppercase font-mono">Evidence Engine</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleQuickLaunch(chosenPillar)}
              className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition active:scale-95"
            >
              <span>Skip to App ›</span>
            </button>

            <button
              onClick={() => setShowApiKeyModal(true)}
              className="p-2 rounded-full bg-[#121217] hover:bg-[#181822] border border-white/10 text-zinc-400 hover:text-white transition"
              title="AI Settings"
            >
              <Bot className="w-4 h-4 text-[#FF3B30]" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* STEP 1: CHOOSE CATEGORY (HEALTH VS WELLNESS) - FIRST SCREEN ON PHONE       */}
        {/* ========================================================================= */}
        {step === 1 && (
          <div className="space-y-6 pt-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div className="space-y-2">
              <span className="text-xs font-mono font-black uppercase tracking-widest text-[#FF3B30]">
                Initial Setup • Step 1 of 3
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Choose your focus
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Select your primary realm to get started. You can toggle between them anytime with a single tap.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Option A: ⚡ Health & Fitness */}
              <div
                onClick={() => setChosenPillar('health')}
                className={`p-6 rounded-[2rem] border transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 ${
                  chosenPillar === 'health'
                    ? 'bg-[#181822] border-[#FF3B30] shadow-xl shadow-[#FF3B30]/15 ring-2 ring-[#FF3B30]'
                    : 'bg-[#121217] border-white/10 hover:border-white/25'
                }`}
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#FF3B30]/15 text-[#FF3B30] border border-[#FF3B30]/30 flex items-center justify-center">
                    <Dumbbell className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-black text-white">
                        Health & Fitness
                      </h3>
                      {chosenPillar === 'health' && (
                        <span className="w-5 h-5 rounded-full bg-[#FF3B30] text-white flex items-center justify-center text-xs font-black">
                          ✓
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      Gym workout logs, 3D body heatmap, and instant &lt;1s Gemini Vision meal & calorie scanner.
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-400">Athletic Suite</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuickLaunch('health');
                    }}
                    className="px-3 py-1.5 rounded-full bg-white text-black font-extrabold text-[11px] hover:bg-zinc-200 active:scale-95 transition"
                  >
                    Enter Health ›
                  </button>
                </div>
              </div>

              {/* Option B: 🌿 Wellness & Formulations */}
              <div
                onClick={() => setChosenPillar('wellness')}
                className={`p-6 rounded-[2rem] border transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 ${
                  chosenPillar === 'wellness'
                    ? 'bg-[#181822] border-white shadow-xl ring-2 ring-white'
                    : 'bg-[#121217] border-white/10 hover:border-white/25'
                }`}
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 text-white border border-white/20 flex items-center justify-center">
                    <Leaf className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-black text-white">
                        Wellness & Rituals
                      </h3>
                      {chosenPillar === 'wellness' && (
                        <span className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center text-xs font-black">
                          ✓
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      Daily AM/PM habit checklists, Rx Label Lens debunking, and Smart Shelf active compound tracker.
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-400">Clinical Suite</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuickLaunch('wellness');
                    }}
                    className="px-3 py-1.5 rounded-full bg-white text-black font-extrabold text-[11px] hover:bg-zinc-200 active:scale-95 transition"
                  >
                    Enter Wellness ›
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: NAME & AGE                                                        */}
        {/* ========================================================================= */}
        {step === 2 && (
          <div className="space-y-6 pt-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div className="space-y-2">
              <span className="text-xs font-mono font-black uppercase tracking-widest text-[#FF3B30]">
                Step 2 of 3 • Profile Calibration
              </span>
              <h2 className="text-3xl font-black text-white tracking-tight">
                Tell us about yourself
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                We use your name and age to calibrate baseline metabolic recovery rates.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                  Your Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aarav, Alex, Jordan"
                  className="w-full px-4 py-3.5 rounded-2xl bg-[#121217] border border-white/10 text-white text-base focus:outline-none focus:ring-2 focus:ring-[#FF3B30]"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                  Age
                </label>
                <div className="flex items-center gap-2">
                  {[20, 24, 28, 32, 36].map((presetAge) => (
                    <button
                      key={presetAge}
                      type="button"
                      onClick={() => setAge(presetAge)}
                      className={`flex-1 py-3 rounded-xl border text-xs font-black transition ${
                        age === presetAge
                          ? 'bg-white text-black border-white shadow-md'
                          : 'bg-[#121217] text-zinc-300 border-white/10 hover:border-white/30'
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
        {/* STEP 3: SPECIFIC PRIORITY GOAL                                            */}
        {/* ========================================================================= */}
        {step === 3 && (
          <div className="space-y-6 pt-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div className="space-y-2">
              <span className="text-xs font-mono font-black uppercase tracking-widest text-[#FF3B30]">
                Step 3 of 3 • Priority Directive
              </span>
              <h2 className="text-3xl font-black text-white tracking-tight">
                What is your primary goal?
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Select your top focus to tailor active ingredient evidence and workouts.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {goalOptions.map((opt) => {
                const isSelected = goal === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setGoal(opt.id)}
                    className={`w-full p-4 sm:p-5 rounded-[2rem] border text-left transition-all duration-200 flex items-center justify-between gap-4 ${
                      isSelected
                        ? 'bg-[#181822] text-white border-[#FF3B30] shadow-lg shadow-[#FF3B30]/10 ring-1 ring-[#FF3B30]'
                        : 'bg-[#121217] text-zinc-300 border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <span className="text-3xl">{opt.icon}</span>
                      <div>
                        <h3 className={`text-sm sm:text-base font-black ${isSelected ? 'text-white' : 'text-zinc-100'}`}>
                          {opt.title}
                        </h3>
                        <p className={`text-xs mt-0.5 ${isSelected ? 'text-zinc-300' : 'text-zinc-400'}`}>
                          {opt.desc}
                        </p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-[#FF3B30] border-[#FF3B30] text-white' : 'border-white/20'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation Buttons */}
      <div className="pt-6 pb-2 border-t border-white/10 mt-6">
        <div className="flex items-center gap-3">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(s => s - 1)}
              className="py-3.5 px-5 rounded-2xl bg-[#121217] text-zinc-300 font-bold text-xs hover:bg-[#181822] border border-white/10 transition active:scale-95"
            >
              Back
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => {
                if (step === 1) {
                  setStep(2);
                } else if (step === 2) {
                  if (!name.trim()) setName(chosenPillar === 'health' ? 'Athlete' : 'Aarav');
                  setStep(3);
                }
              }}
              className="flex-1 py-4 px-6 rounded-2xl bg-white hover:bg-zinc-100 text-black font-black text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2 transition active:scale-98"
            >
              <span>Continue with {chosenPillar === 'health' ? 'Health & Fitness' : 'Wellness & Rituals'}</span>
              <ArrowRight className="w-4 h-4 text-black" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinalFinish}
              className="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-[#FF3B30] to-rose-600 text-white font-black text-xs sm:text-sm shadow-xl shadow-[#FF3B30]/30 flex items-center justify-center gap-2 transition active:scale-98"
            >
              <span>Launch {chosenPillar === 'health' ? 'Health Suite' : 'Wellness Protocol'}</span>
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          )}
        </div>
      </div>

      {/* AI Settings Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#121217] rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-[#FF3B30]" />
                <h3 className="text-base font-black text-white">AI Model Provider</h3>
              </div>
              <button onClick={() => setShowApiKeyModal(false)} className="text-zinc-400 hover:text-white font-bold">✕</button>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Ritual runs completely free offline with its built-in Clinical database. You can optionally connect OpenRouter or Gemini models for vision.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-mono uppercase text-zinc-400 mb-1">Vision AI Model</label>
                <select
                  value={tempModel}
                  onChange={(e) => setTempModel(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090D] border border-white/10 text-white font-medium focus:outline-none focus:ring-1 focus:ring-[#FF3B30]"
                >
                  {POPULAR_OPENROUTER_MODELS.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-mono uppercase text-zinc-400 mb-1">OpenRouter API Key (Optional)</label>
                <input
                  type="password"
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  placeholder="sk-or-v1-..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090D] border border-white/10 text-white font-mono focus:outline-none focus:ring-1 focus:ring-[#FF3B30]"
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
                className="w-full py-3 rounded-xl bg-white hover:bg-zinc-100 text-black font-black text-xs shadow-md transition"
              >
                Save AI Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isBarcodeModalOpen}
        onClose={() => setIsBarcodeModalOpen(false)}
        onProductFound={handleOnboardingBarcodeProduct}
        userGoal={goal}
      />
    </div>
  );
};
