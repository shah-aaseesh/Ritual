import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  WellnessGoal, 
  DailyTimeCommitment, 
  OnboardingProduct, 
  ProductAnalysisResult 
} from '../../types';
import { SAMPLE_PRODUCTS } from '../../data/sampleProducts';
import { 
  analyzeIngredientsWithAI, 
  extractLabelFromImageWithAI, 
  findMatchingMosaicProducts, 
  POPULAR_OPENROUTER_MODELS 
} from '../../services/aiService';
import { VerdictBadge } from '../common/EvidenceBadge';
import { BarcodeScannerModal } from '../common/BarcodeScannerModal';
import { IngredientDebunkPaper } from '../common/IngredientDebunkPaper';
import { BarcodeLookupResult } from '../../services/barcodeService';
import { 
  Leaf, 
  ArrowRight, 
  Check, 
  Sparkles, 
  Camera, 
  Plus, 
  Bot, 
  ExternalLink,
  ChevronRight,
  ScanBarcode
} from 'lucide-react';

export const OnboardingFlow: React.FC = () => {
  const { completeOnboarding, aiSettings, updateAISettings, showToast } = useApp();

  // Wizard Steps
  // 1: Name -> 2: Age -> 3: Goal -> 4: Own Products? -> 5: Ingredient Scan & Debunk -> 6: Claims Scan & Debunk -> 7: Routine Genesis
  const [step, setStep] = useState<number>(1);
  const [name, setName] = useState<string>('');
  const [age, setAge] = useState<number>(24);
  const [goal, setGoal] = useState<WellnessGoal>('hair_health');
  const [dailyTime] = useState<DailyTimeCommitment>('5_min');
  const [ownsProducts, setOwnsProducts] = useState<boolean>(true);

  // Scanned products collection (multi-product support)
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

  const [activeProdIndex, setActiveProdIndex] = useState<number>(0);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [ocrStatus, setOcrStatus] = useState<string>('');
  const [showApiKeyModal, setShowApiKeyModal] = useState<boolean>(false);
  const [tempApiKey, setTempApiKey] = useState<string>(aiSettings.openRouterApiKey || '');
  const [tempModel, setTempModel] = useState<string>(aiSettings.selectedModel || 'google/gemini-3.1-flash-lite');
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const claimFileInputRef = useRef<HTMLInputElement>(null);

  const handleOnboardingBarcodeProduct = (result: BarcodeLookupResult) => {
    const detectedNames = result.analysis.detectedIngredients.map(d => d.ingredient.name);
    const matched = findMatchingMosaicProducts(detectedNames, goal);

    setScannedProducts(prev => {
      const copy = [...prev];
      copy[activeProdIndex] = {
        ...copy[activeProdIndex],
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

  const loadSamplePreset = (idx: number, sampleIndex: number) => {
    const sample = SAMPLE_PRODUCTS[sampleIndex] || SAMPLE_PRODUCTS[0];
    setScannedProducts(prev => {
      const copy = [...prev];
      copy[idx] = {
        ...copy[idx],
        name: sample.name,
        brand: sample.brandSuggestion,
        ingredientText: sample.ingredientLabelText,
        claimText: sample.frontLabelText
      };
      return copy;
    });
    analyzeActiveProduct(idx, sample.ingredientLabelText);
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

  // Helper to trigger analysis on the active product
  const analyzeActiveProduct = async (productIdx: number, overrideIngText?: string) => {
    const prod = scannedProducts[productIdx];
    if (!prod) return;

    setIsAnalyzing(true);
    setOcrStatus('Clinical AI analyzing active ingredients against evidence database...');

    try {
      const textToAnalyze = overrideIngText || prod.ingredientText || SAMPLE_PRODUCTS[0].ingredientLabelText;
      const result: ProductAnalysisResult = await analyzeIngredientsWithAI(
        textToAnalyze,
        prod.ingredientImage,
        goal,
        prod.name,
        aiSettings.openRouterApiKey,
        aiSettings.selectedModel
      );

      const activeNames = result.detectedIngredients.map(d => d.ingredient.name);
      const mosaicMatches = findMatchingMosaicProducts(activeNames, goal);

      setScannedProducts(prev => {
        const next = [...prev];
        next[productIdx] = {
          ...next[productIdx],
          ingredientText: textToAnalyze,
          ingredientAnalysis: result,
          matchedMosaic: mosaicMatches
        };
        return next;
      });
      showToast('Ingredients audited & debriefed', 'success');
    } catch (e) {
      showToast('Analysis completed using local clinical database', 'info');
    } finally {
      setIsAnalyzing(false);
      setOcrStatus('');
    }
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>, isClaim: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    setOcrStatus('Sending photo directly to Vision AI...');

    try {
      const visionResult = await extractLabelFromImageWithAI(
        file,
        goal,
        aiSettings.openRouterApiKey,
        aiSettings.selectedModel,
        (percent, status) => setOcrStatus(`${status} (${percent}%)`)
      );

      setScannedProducts(prev => {
        const copy = [...prev];
        const cur = copy[activeProdIndex] || copy[0];
        
        if (isClaim) {
          copy[activeProdIndex] = {
            ...cur,
            claimText: visionResult.claimText || cur.claimText || visionResult.ingredientText
          };
        } else {
          const detectedNames = visionResult.analysis.detectedIngredients.map(d => d.ingredient.name);
          const matched = findMatchingMosaicProducts(detectedNames, goal);
          
          copy[activeProdIndex] = {
            ...cur,
            name: (cur.name && cur.name.trim().length > 0) ? cur.name : (visionResult.productName || cur.name),
            brand: (cur.brand && cur.brand.trim().length > 0) ? cur.brand : (visionResult.brand || cur.brand),
            ingredientText: visionResult.ingredientText,
            claimText: visionResult.claimText || cur.claimText,
            ingredientAnalysis: visionResult.analysis,
            matchedMosaic: matched
          };
        }
        return copy;
      });

      showToast(
        visionResult.source === 'openrouter_vision'
          ? 'Vision AI isolated & decoded ingredients directly from photo!'
          : 'Label scanned and parsed with local clinical engine',
        'success'
      );
    } catch (err) {
      showToast('Scan could not extract clearly. You can paste ingredients or choose a sample.', 'warning');
    } finally {
      setIsAnalyzing(false);
      setOcrStatus('');
      if (e.target) e.target.value = '';
    }
  };

  const handleAddAnotherProduct = () => {
    const newIdx = scannedProducts.length + 1;
    const sample = SAMPLE_PRODUCTS[(newIdx - 1) % SAMPLE_PRODUCTS.length];
    const newProd: OnboardingProduct = {
      id: 'prod-' + Date.now().toString(36),
      name: `Product ${newIdx} (${sample.category.split(' ')[0]})`,
      brand: sample.brandSuggestion,
      category: sample.category,
      ingredientText: sample.ingredientLabelText,
      claimText: sample.frontLabelText,
      ingredientAnalysis: undefined,
      matchedMosaic: []
    };

    setScannedProducts(prev => [...prev, newProd]);
    setActiveProdIndex(scannedProducts.length);
    showToast(`Added Product ${newIdx}. Scan or select sample.`, 'info');
  };

  const handleRemoveProduct = (index: number) => {
    if (scannedProducts.length <= 1) return;
    setScannedProducts(prev => prev.filter((_, i) => i !== index));
    setActiveProdIndex(Math.max(0, activeProdIndex - 1));
  };

  const handleFinalFinish = () => {
    completeOnboarding(
      {
        name: name.trim() || 'Friend',
        age,
        primaryGoal: goal,
        dailyTime,
        alreadyOwnsProducts: ownsProducts,
        isOnboarded: true
      },
      ownsProducts ? scannedProducts : []
    );
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-charcoal-900 flex flex-col justify-between p-4 sm:p-8 max-w-2xl mx-auto">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        capture="environment"
        onChange={(e) => handleFileSelected(e, false)}
        className="hidden"
      />
      <input
        type="file"
        ref={claimFileInputRef}
        accept="image/*"
        capture="environment"
        onChange={(e) => handleFileSelected(e, true)}
        className="hidden"
      />

      {/* Top Brand Header & Step Indicator */}
      <div>
        <div className="flex items-center justify-between pb-6 border-b border-cream-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-forest-900 flex items-center justify-center text-cream-50 shadow-sm">
              <Leaf className="w-4 h-4 text-mint-300" />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight text-forest-950">Ritual</span>
              <span className="text-[10px] text-charcoal-500 font-medium block -mt-0.5">Evidence First</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* AI Model / Key Selector */}
            <button
              onClick={() => setShowApiKeyModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cream-100 hover:bg-cream-200 border border-cream-300 text-[11px] font-semibold text-forest-900 transition"
              title="Configure free OpenRouter AI vision model"
            >
              <Bot className="w-3.5 h-3.5 text-mint-600" />
              <span>{aiSettings.openRouterApiKey ? 'OpenRouter AI' : 'Local Clinical AI'}</span>
            </button>

            {/* Step Counter */}
            <span className="text-xs font-bold text-charcoal-400">
              Step {step} of {ownsProducts ? 7 : 5}
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* STEP 1: NAME                                                              */}
        {/* ========================================================================= */}
        {step === 1 && (
          <div className="space-y-6 pt-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-mint-600">
                Welcome to Ritual
              </span>
              <h2 className="text-3xl font-extrabold text-forest-950 tracking-tight">
                What's your name?
              </h2>
              <p className="text-sm text-charcoal-600">
                Let's personalize your evidence-first wellness journey.
              </p>
            </div>

            <div className="pt-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Aarav, Ananya"
                className="w-full px-5 py-4 rounded-2xl bg-white border border-cream-300 text-charcoal-900 text-lg placeholder:text-charcoal-400 focus:outline-none focus:ring-2 focus:ring-forest-800 shadow-soft transition font-medium"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setStep(2);
                }}
              />
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: AGE                                                               */}
        {/* ========================================================================= */}
        {step === 2 && (
          <div className="space-y-6 pt-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-mint-600">
                Personalization
              </span>
              <h2 className="text-3xl font-extrabold text-forest-950 tracking-tight">
                How old are you, {name || 'friend'}?
              </h2>
              <p className="text-sm text-charcoal-600">
                Age calibrates clinical metabolic baselines, cellular renewal rates, and barrier tolerance.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2">
                {[20, 24, 28, 32, 35].map((presetAge) => (
                  <button
                    key={presetAge}
                    type="button"
                    onClick={() => setAge(presetAge)}
                    className={`flex-1 py-3 rounded-2xl border text-sm font-bold transition ${
                      age === presetAge
                        ? 'bg-forest-900 text-cream-50 border-forest-900 shadow-card'
                        : 'bg-white text-charcoal-800 border-cream-300 hover:border-mint-300'
                    }`}
                  >
                    {presetAge}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-600 mb-1">
                  Or enter specific age:
                </label>
                <input
                  type="number"
                  min={16}
                  max={90}
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-cream-300 text-charcoal-900 text-base focus:outline-none focus:ring-2 focus:ring-forest-800"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: GOAL                                                              */}
        {/* ========================================================================= */}
        {step === 3 && (
          <div className="space-y-6 pt-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-mint-600">
                Primary Goal
              </span>
              <h2 className="text-3xl font-extrabold text-forest-950 tracking-tight">
                What are you focusing on?
              </h2>
              <p className="text-sm text-charcoal-600">
                Select your primary wellness priority to guide evidence audits.
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
                    className={`w-full p-4 sm:p-5 rounded-3xl border text-left transition-all duration-200 flex items-center justify-between gap-4 ${
                      isSelected
                        ? 'bg-forest-900 text-cream-50 border-forest-900 shadow-card ring-2 ring-forest-700'
                        : 'bg-white text-charcoal-800 border-cream-300 hover:border-mint-300 shadow-soft'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <span className="text-3xl">{opt.icon}</span>
                      <div>
                        <h3 className={`text-base font-bold ${isSelected ? 'text-cream-50' : 'text-forest-950'}`}>
                          {opt.title}
                        </h3>
                        <p className={`text-xs mt-0.5 ${isSelected ? 'text-cream-200' : 'text-charcoal-600'}`}>
                          {opt.desc}
                        </p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-mint-400 border-mint-400 text-forest-950' : 'border-charcoal-300'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: CURRENTLY USING PRODUCTS?                                         */}
        {/* ========================================================================= */}
        {step === 4 && (
          <div className="space-y-6 pt-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-mint-600">
                Current Products
              </span>
              <h2 className="text-3xl font-extrabold text-forest-950 tracking-tight">
                Are you already using products for this goal?
              </h2>
              <p className="text-sm text-charcoal-600">
                We will analyze their actual ingredients, check dosages, and debunk packaging claims.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={() => setOwnsProducts(true)}
                className={`w-full p-5 rounded-3xl border text-left transition-all ${
                  ownsProducts
                    ? 'bg-forest-900 text-cream-50 border-forest-900 shadow-card ring-2 ring-forest-700'
                    : 'bg-white text-charcoal-800 border-cream-300 hover:border-mint-300 shadow-soft'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`text-base font-bold ${ownsProducts ? 'text-cream-50' : 'text-forest-950'}`}>
                      Yes, I have bottles/tubs at home
                    </h3>
                    <p className={`text-xs mt-1 ${ownsProducts ? 'text-cream-200' : 'text-charcoal-600'}`}>
                      Take a photo of the ingredients list & front claims to decode what's real.
                    </p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                    ownsProducts ? 'bg-mint-400 border-mint-400 text-forest-950' : 'border-charcoal-300'
                  }`}>
                    {ownsProducts && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setOwnsProducts(false)}
                className={`w-full p-5 rounded-3xl border text-left transition-all ${
                  !ownsProducts
                    ? 'bg-forest-900 text-cream-50 border-forest-900 shadow-card ring-2 ring-forest-700'
                    : 'bg-white text-charcoal-800 border-cream-300 hover:border-mint-300 shadow-soft'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`text-base font-bold ${!ownsProducts ? 'text-cream-50' : 'text-forest-950'}`}>
                      No, I'm starting from scratch
                    </h3>
                    <p className={`text-xs mt-1 ${!ownsProducts ? 'text-cream-200' : 'text-charcoal-600'}`}>
                      We'll start with foundational evidence-backed habits without requiring any product purchase.
                    </p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                    !ownsProducts ? 'bg-mint-400 border-mint-400 text-forest-950' : 'border-charcoal-300'
                  }`}>
                    {!ownsProducts && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 5 (IF YES): INGREDIENT PHOTO & DEBUNKER (SUPPORTS MULTIPLE PRODUCTS) */}
        {/* ========================================================================= */}
        {step === 5 && ownsProducts && (
          <div className="space-y-6 pt-4 animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-mint-600">
                Step 5 of 7 • Ingredient Analysis
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-forest-950">
                Photo & Debunk Your Ingredients
              </h2>
              <p className="text-xs sm:text-sm text-charcoal-600">
                Snap or upload the back label of your products to audit active ingredients.
              </p>
            </div>

            {/* Product Switcher Tabs if multiple */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {scannedProducts.map((p, idx) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setActiveProdIndex(idx);
                    if (!p.ingredientAnalysis) {
                      analyzeActiveProduct(idx);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition ${
                    activeProdIndex === idx
                      ? 'bg-forest-900 text-cream-50'
                      : 'bg-white text-charcoal-700 border border-cream-300 hover:bg-cream-100'
                  }`}
                >
                  <span>{p.name || `Product ${idx + 1}`}</span>
                  {scannedProducts.length > 1 && (
                    <span 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveProduct(idx);
                      }}
                      className="hover:text-coral-400 ml-1"
                    >
                      ×
                    </span>
                  )}
                </button>
              ))}

              <button
                type="button"
                onClick={handleAddAnotherProduct}
                className="px-3 py-1.5 rounded-xl border border-dashed border-forest-800 text-forest-900 text-xs font-bold flex items-center gap-1 hover:bg-mint-50 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Product</span>
              </button>
            </div>

            {/* Current Product Card */}
            {scannedProducts[activeProdIndex] && (
              <div className="space-y-4">
                <div className="p-4 sm:p-5 rounded-3xl bg-white border border-cream-300 shadow-card space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-[10px] font-bold text-charcoal-400 uppercase tracking-wider">
                        Product Name
                      </label>
                      <input
                        type="text"
                        value={scannedProducts[activeProdIndex].name}
                        placeholder="e.g. My Rosemary Scalp Serum"
                        onChange={(e) => {
                          const val = e.target.value;
                          setScannedProducts(prev => {
                            const copy = [...prev];
                            copy[activeProdIndex].name = val;
                            return copy;
                          });
                        }}
                        className="font-bold text-forest-950 text-base border-b border-cream-300 focus:outline-none focus:border-forest-800 bg-transparent placeholder:text-charcoal-400 placeholder:font-normal"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsBarcodeModalOpen(true)}
                        className="px-3 py-2 rounded-2xl bg-forest-900 hover:bg-forest-800 text-cream-50 font-bold text-xs flex items-center gap-1.5 shadow-soft transition"
                      >
                        <ScanBarcode className="w-4 h-4 text-mint-400" />
                        <span>Scan Barcode</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-2 rounded-2xl bg-sand-100 hover:bg-sand-200 border border-sand-300 text-forest-950 font-semibold text-xs flex items-center gap-1.5 transition"
                      >
                        <Camera className="w-4 h-4 text-forest-800" />
                        <span>Photo</span>
                      </button>
                    </div>
                  </div>

                  {/* OCR Progress if scanning */}
                  {isAnalyzing && (
                    <div className="p-3 rounded-2xl bg-forest-950 text-cream-50 text-xs flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-mint-300 animate-spin" />
                      <span>{ocrStatus}</span>
                    </div>
                  )}

                  {/* Quick sample chips for testing without photo */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[10px] font-semibold text-charcoal-500">Quick Test:</span>
                    {SAMPLE_PRODUCTS.map((sp, sIdx) => (
                      <button
                        key={sp.id}
                        type="button"
                        onClick={() => loadSamplePreset(activeProdIndex, sIdx)}
                        className="px-2 py-0.5 rounded-lg bg-cream-100 hover:bg-mint-100 text-[10px] font-bold text-forest-900 border border-cream-300 transition"
                      >
                        + {sp.name.split(' ')[0]} {sp.name.split(' ')[1] || ''}
                      </button>
                    ))}
                  </div>

                  {/* Ingredient Text area */}
                  <div>
                    <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                      Ingredients on Back Label:
                    </label>
                    <textarea
                      value={scannedProducts[activeProdIndex].ingredientText}
                      placeholder="e.g. Aqua, Redensyl 3%, Rosemary Extract, Procapil, Saw Palmetto, Glycerin... (or snap photo above)"
                      onChange={(e) => {
                        const val = e.target.value;
                        setScannedProducts(prev => {
                          const copy = [...prev];
                          copy[activeProdIndex].ingredientText = val;
                          return copy;
                        });
                      }}
                      rows={3}
                      className="w-full p-2.5 rounded-xl bg-cream-50 border border-cream-300 text-xs font-mono text-charcoal-800 focus:outline-none focus:ring-1 focus:ring-forest-800 placeholder:text-charcoal-400"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => analyzeActiveProduct(activeProdIndex)}
                      className="px-4 py-2 rounded-xl bg-forest-900 hover:bg-forest-800 text-cream-50 text-xs font-bold flex items-center gap-1.5 shadow-soft transition"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-mint-300" />
                      <span>Debunk Ingredients with AI</span>
                    </button>
                  </div>
                </div>

                {/* Debunking Results with Animated Prescription Slip */}
                {scannedProducts[activeProdIndex].ingredientAnalysis && (
                  <div className="pt-2 animate-in fade-in">
                    <IngredientDebunkPaper
                      productName={scannedProducts[activeProdIndex].name || `Product ${activeProdIndex + 1}`}
                      brand={scannedProducts[activeProdIndex].brand}
                      rawIngredientText={scannedProducts[activeProdIndex].ingredientText}
                      analysis={scannedProducts[activeProdIndex].ingredientAnalysis!}
                    />
                  </div>
                )}

                    {/* Similar Mosaic Wellness Products match */}
                    {scannedProducts[activeProdIndex].matchedMosaic && scannedProducts[activeProdIndex].matchedMosaic!.length > 0 && (
                      <div className="pt-3 border-t border-mint-200 space-y-2">
                        <span className="text-[11px] font-bold text-forest-900 uppercase tracking-wider block">
                          🌿 Similar active formulations in Mosaic Wellness catalog:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {scannedProducts[activeProdIndex].matchedMosaic!.map((m) => (
                            <div key={m.id} className="p-2.5 rounded-2xl bg-white border border-cream-300 text-xs space-y-1.5 flex items-start gap-2.5">
                              {m.imageUrl && (
                                <img
                                  src={m.imageUrl}
                                  alt={m.product}
                                  className="w-10 h-10 rounded-xl object-cover bg-cream-100 border border-cream-200 shrink-0 mt-0.5"
                                  loading="lazy"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="font-bold text-forest-950 truncate">{m.product}</span>
                                  <span className="font-bold text-forest-800 text-[11px] shrink-0">{m.currency}{m.sitePrice}</span>
                                </div>
                                <p className="text-[10px] text-charcoal-500 line-clamp-1">{m.whyItFits}</p>
                                <a href={m.officialUrl} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-forest-800 hover:underline inline-flex items-center gap-1 mt-0.5">
                                  <span>Official Link</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 6 (IF YES): CLAIMS PHOTO & DEBUNKER                                  */}
        {/* ========================================================================= */}
        {step === 6 && ownsProducts && (
          <div className="space-y-6 pt-4 animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-mint-600">
                Step 6 of 7 • Marketing Claims Audit
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-forest-950">
                Verify & Debunk Packaging Claims
              </h2>
              <p className="text-xs sm:text-sm text-charcoal-600">
                Take a photo of the front label claims (e.g. "Clinically Proven", "100% Natural", "Detox").
              </p>
            </div>

            {scannedProducts[activeProdIndex] && (
              <div className="space-y-4">
                <div className="p-4 sm:p-5 rounded-3xl bg-white border border-cream-300 shadow-card space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-charcoal-400 uppercase tracking-wider">
                        Product
                      </span>
                      <h4 className="font-bold text-forest-950 text-base">
                        {scannedProducts[activeProdIndex].name}
                      </h4>
                    </div>

                    <button
                      type="button"
                      onClick={() => claimFileInputRef.current?.click()}
                      className="px-3.5 py-2 rounded-2xl bg-forest-900 hover:bg-forest-800 text-cream-50 font-bold text-xs flex items-center gap-1.5 shadow-soft transition"
                    >
                      <Camera className="w-4 h-4 text-mint-300" />
                      <span>Photo Front Label</span>
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                      Front-Pack Claims Text:
                    </label>
                    <input
                      type="text"
                      value={scannedProducts[activeProdIndex].claimText}
                      onChange={(e) => {
                        const val = e.target.value;
                        setScannedProducts(prev => {
                          const copy = [...prev];
                          copy[activeProdIndex].claimText = val;
                          return copy;
                        });
                      }}
                      placeholder="e.g. Clinically Proven, 100% Clean, Dermatologist Tested"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-cream-50 border border-cream-300 text-xs font-medium text-charcoal-800"
                    />
                  </div>
                </div>

                {/* Claims Breakdown Verdicts */}
                <div className="p-4 sm:p-5 rounded-3xl bg-white border border-cream-300 shadow-soft space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-forest-900">
                    Marketing Claim Verdicts
                  </h4>

                  <div className="space-y-2.5">
                    {scannedProducts[activeProdIndex].ingredientAnalysis?.detectedClaims && scannedProducts[activeProdIndex].ingredientAnalysis!.detectedClaims.length > 0 ? (
                      scannedProducts[activeProdIndex].ingredientAnalysis!.detectedClaims.map((c, i) => (
                        <div key={i} className="p-3 rounded-2xl bg-cream-50 border border-cream-200 text-xs space-y-1.5">
                          <div className="flex items-center justify-between">
                            <strong className="font-bold text-forest-950">"{c.displayName}"</strong>
                            <VerdictBadge verdict={c.verdict} size="sm" />
                          </div>
                          <p className="text-charcoal-600 text-[11px] leading-relaxed">
                            <strong>Missing evidence:</strong> {c.missingInformation}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 rounded-xl bg-cream-50 text-xs text-charcoal-500 text-center">
                        Scan or enter front claims like "Clinically Proven" or "100% Natural" to see debunker verdicts.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 7: ROUTINE GENESIS                                                   */}
        {/* ========================================================================= */}
        {((step === 7 && ownsProducts) || (step === 5 && !ownsProducts)) && (
          <div className="space-y-6 pt-6 animate-in zoom-in-95 duration-300 text-center">
            <div className="w-16 h-16 rounded-3xl bg-forest-900 text-mint-300 flex items-center justify-center mx-auto shadow-card">
              <Sparkles className="w-8 h-8 animate-pulse" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-mint-600">
                Personalized System Ready
              </span>
              <h2 className="text-3xl font-extrabold text-forest-950">
                Your Routine is Ready, {name || 'Aarav'}!
              </h2>
              <p className="text-sm text-charcoal-600 max-w-sm mx-auto">
                We've organized your {scannedProducts.length} scanned products into an evidence-backed {dailyTime.replace('_', ' ')} morning & evening routine.
              </p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-cream-300 text-left shadow-soft space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-cream-200 pb-2.5">
                <span className="text-charcoal-500">Focus Goal:</span>
                <span className="font-bold text-forest-950 capitalize">{goal.replace('_', ' ')}</span>
              </div>
              <div className="flex items-center justify-between border-b border-cream-200 pb-2.5">
                <span className="text-charcoal-500">Daily Commitment:</span>
                <span className="font-bold text-forest-950">{dailyTime.replace('_', ' ')} / day</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-charcoal-500">Products Included:</span>
                <span className="font-bold text-mint-600">{ownsProducts ? scannedProducts.map(p => p.name).join(', ') : 'Foundational Habit Rituals'}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Button Navigation Bar */}
      <div className="pt-6 pb-2 border-t border-cream-200 mt-6">
        <div className="flex items-center gap-3">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(s => s - 1)}
              className="py-3.5 px-5 rounded-2xl bg-cream-200 text-charcoal-700 font-semibold text-xs hover:bg-cream-300 transition"
            >
              Back
            </button>
          )}

          {((step < 7 && ownsProducts) || (step < 5 && !ownsProducts)) ? (
            <button
              type="button"
              onClick={async () => {
                if (step === 1 && !name.trim()) setName('Aarav');
                if (step === 4 && ownsProducts) {
                  // Trigger initial analysis on product 1
                  if (!scannedProducts[0].ingredientAnalysis) {
                    await analyzeActiveProduct(0);
                  }
                  setStep(5);
                } else if (step === 4 && !ownsProducts) {
                  setStep(5); // skip to routine genesis
                } else {
                  setStep(s => s + 1);
                }
              }}
              className="flex-1 py-4 px-6 rounded-2xl bg-forest-900 hover:bg-forest-800 text-cream-50 font-bold text-sm shadow-card flex items-center justify-center gap-2 transition transform active:scale-98"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinalFinish}
              className="flex-1 py-4 px-6 rounded-2xl bg-forest-900 hover:bg-forest-800 text-cream-50 font-bold text-sm shadow-card flex items-center justify-center gap-2 transition transform active:scale-98"
            >
              <span>Enter My Routine Page</span>
              <ChevronRight className="w-5 h-5 text-mint-300" />
            </button>
          )}
        </div>
      </div>

      {/* AI Settings Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-cream-50 rounded-3xl max-w-sm w-full p-6 shadow-modal border border-cream-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-forest-800" />
                <h3 className="text-base font-bold text-forest-950">AI Model Provider</h3>
              </div>
              <button onClick={() => setShowApiKeyModal(false)} className="text-charcoal-400 hover:text-charcoal-700">✕</button>
            </div>

            <p className="text-xs text-charcoal-600 leading-relaxed">
              Ritual runs completely free offline with its built-in Clinical Dermatology database. You can optionally connect free OpenRouter vision models for multimodal photo reasoning.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-charcoal-700 mb-1">OpenRouter Free Model</label>
                <select
                  value={tempModel}
                  onChange={(e) => setTempModel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-cream-300 text-charcoal-900 font-medium"
                >
                  {POPULAR_OPENROUTER_MODELS.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-charcoal-700 mb-1">OpenRouter API Key (Optional)</label>
                <input
                  type="password"
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  placeholder="sk-or-v1-..."
                  className="w-full px-3 py-2 rounded-xl bg-white border border-cream-300 text-charcoal-900 font-mono"
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
                className="w-full py-2.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-cream-50 font-bold text-xs shadow-soft transition"
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
