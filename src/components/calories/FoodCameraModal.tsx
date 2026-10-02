import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  X, 
  Beef, 
  Wheat, 
  Cookie, 
  RefreshCw,
  Plus
} from 'lucide-react';
import { analyzeFoodImageWithGemini, FoodVisionAnalysisResult } from '../../services/aiService';
import { MealCategory, FoodItem } from '../../types';
import { useApp } from '../../context/AppContext';

interface FoodCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMeal?: MealCategory;
  onFoodLogged: (meal: MealCategory, food: FoodItem, quantity: number) => void;
}

const SAMPLE_MEAL_IMAGES = [
  {
    name: 'Grilled Salmon & Quinoa Bowl',
    preview: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
    description: 'High Omega-3 salmon, quinoa base, fresh avocados & greens.'
  },
  {
    name: 'Chicken Rice & Broccoli',
    preview: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&auto=format&fit=crop&q=80',
    description: 'Classic lean protein & complex carbs performance plate.'
  },
  {
    name: 'Avocado Toast with Poached Eggs',
    preview: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&auto=format&fit=crop&q=80',
    description: 'Sourdough, smashed avocado, two eggs & microgreens.'
  },
  {
    name: 'Paneer Protein Salad Bowl',
    preview: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80',
    description: 'Grilled paneer cubes, chickpeas, crisp cucumber & olive oil.'
  }
];

export const FoodCameraModal: React.FC<FoodCameraModalProps> = ({
  isOpen,
  onClose,
  defaultMeal = 'lunch',
  onFoodLogged
}) => {
  const { aiSettings, showToast } = useApp();

  const [selectedMeal, setSelectedMeal] = useState<MealCategory>(defaultMeal);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [progressState, setProgressState] = useState<{ percent: number; status: string }>({ percent: 0, status: '' });
  const [analysisResult, setAnalysisResult] = useState<FoodVisionAnalysisResult | null>(null);
  const [portionMultiplier, setPortionMultiplier] = useState<number>(1.0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleProcessImage = async (fileOrUrl: File | string) => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setPortionMultiplier(1.0);
    setProgressState({ percent: 15, status: 'Sending to Google Gemini Flash-Lite Vision...' });

    try {
      const result = await analyzeFoodImageWithGemini(
        fileOrUrl,
        aiSettings.openRouterApiKey,
        (pct, status) => setProgressState({ percent: pct, status })
      );

      setAnalysisResult(result);
      showToast(`Analyzed ${result.dishName} in ${(result.durationMs / 1000).toFixed(1)}s`, 'success');
    } catch (err: any) {
      showToast('Vision scan failed. Please try again.', 'warning');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessImage(file);
    }
  };

  const handleConfirmLog = () => {
    if (!analysisResult) return;

    const scaledFoodItem: FoodItem = {
      id: `ai-food-${Date.now()}`,
      name: analysisResult.dishName,
      servingSize: analysisResult.servingSize,
      calories: Math.round(analysisResult.totalCalories * portionMultiplier),
      proteinG: Math.round(analysisResult.proteinG * portionMultiplier),
      carbsG: Math.round(analysisResult.carbsG * portionMultiplier),
      fatG: Math.round(analysisResult.fatG * portionMultiplier),
      fiberG: analysisResult.fiberG ? Math.round(analysisResult.fiberG * portionMultiplier) : undefined,
      brand: 'Gemini Vision AI',
      category: 'AI Scanned'
    };

    onFoodLogged(selectedMeal, scaledFoodItem, 1);
    showToast(`Logged ${scaledFoodItem.name} to ${selectedMeal}!`, 'success');
    onClose();
  };

  const currentCalories = analysisResult ? Math.round(analysisResult.totalCalories * portionMultiplier) : 0;
  const currentProtein = analysisResult ? Math.round(analysisResult.proteinG * portionMultiplier) : 0;
  const currentCarbs = analysisResult ? Math.round(analysisResult.carbsG * portionMultiplier) : 0;
  const currentFat = analysisResult ? Math.round(analysisResult.fatG * portionMultiplier) : 0;
  const currentFiber = analysisResult?.fiberG ? Math.round(analysisResult.fiberG * portionMultiplier) : undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      {/* Hidden File / Camera Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="bg-[#121218] border border-white/10 rounded-[2.5rem] max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#181822]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-[#FF3B30]">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">Gemini Food & Calorie Vision</h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  aiSettings.openRouterApiKey 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-[#FF3B30]/20 text-[#FF3B30]'
                }`}>
                  {aiSettings.openRouterApiKey ? '🟢 Live Gemini Flash' : '⚡ Local Vision AI'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Snap or upload your meal photo to estimate instant macros & calories
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {/* Target Meal Bar */}
          <div className="flex items-center justify-between gap-2 p-1.5 rounded-2xl bg-[#09090D] border border-white/5">
            {(['breakfast', 'lunch', 'dinner', 'snacks'] as const).map(meal => (
              <button
                key={meal}
                type="button"
                onClick={() => setSelectedMeal(meal)}
                className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold capitalize transition ${
                  selectedMeal === meal
                    ? 'bg-white text-black shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {meal}
              </button>
            ))}
          </div>

          {/* Action Trigger Buttons (Camera Snap vs Upload) */}
          {!isAnalyzing && !analysisResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="p-6 rounded-[2rem] bg-[#181822] hover:bg-[#20202D] border border-white/10 flex flex-col items-center justify-center gap-3 text-center transition group active:scale-98 shadow-card"
                >
                  <div className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Camera className="w-7 h-7 text-[#FF3B30]" />
                  </div>
                  <div>
                    <span className="text-sm font-black text-white block">Take Meal Photo</span>
                    <span className="text-xs text-zinc-400 mt-0.5 block">Direct Camera Viewfinder</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-6 rounded-[2rem] bg-[#181822] hover:bg-[#20202D] border border-white/10 flex flex-col items-center justify-center gap-3 text-center transition group active:scale-98 shadow-card"
                >
                  <div className="w-14 h-14 rounded-full bg-white/10 border border-white/10 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Upload className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <span className="text-sm font-black text-white block">Upload Food Image</span>
                    <span className="text-xs text-zinc-400 mt-0.5 block">From Photo Library</span>
                  </div>
                </button>
              </div>

              {/* Sample Food Quick Test Grid */}
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
                    Or Test Fast Demo Meals:
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">1-Click Test</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {SAMPLE_MEAL_IMAGES.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleProcessImage(sample.preview)}
                      className="p-3 rounded-2xl bg-[#14141C] hover:bg-[#1C1C28] border border-white/5 text-left flex items-center gap-3 transition group"
                    >
                      <img
                        src={sample.preview}
                        alt={sample.name}
                        className="w-12 h-12 rounded-xl object-cover border border-white/10 group-hover:scale-105 transition-transform shrink-0"
                      />
                      <div className="overflow-hidden">
                        <span className="text-xs font-bold text-white block truncate group-hover:text-white">
                          {sample.name}
                        </span>
                        <span className="text-[10px] text-zinc-400 block truncate font-sans">
                          {sample.description}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* In-Flight Scanning State */}
          {isAnalyzing && (
            <div className="p-8 rounded-[2rem] bg-[#14141C] border border-white/10 flex flex-col items-center justify-center space-y-4 text-center">
              <div className="relative w-20 h-20 rounded-full bg-[#FF3B30]/10 border border-[#FF3B30]/30 flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-[#FF3B30] animate-spin" />
                <div className="absolute inset-0 rounded-full border-2 border-[#FF3B30] animate-ping opacity-25" />
              </div>

              <div className="space-y-1">
                <h4 className="text-base font-black text-white">
                  Gemini Flash Vision Processing
                </h4>
                <p className="text-xs text-zinc-400 font-mono">
                  {progressState.status || 'Extracting food volume and macronutrients...'}
                </p>
              </div>

              <div className="w-full max-w-xs bg-black/50 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-[#FF3B30] h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${progressState.percent}%` }}
                />
              </div>
            </div>
          )}

          {/* Analysis Results View */}
          {analysisResult && !isAnalyzing && (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* Dish Overview & Photo Header */}
              <div className="p-4 rounded-[2rem] bg-[#181822] border border-white/10 flex items-center gap-4">
                {analysisResult.imageThumbnail && (
                  <img
                    src={analysisResult.imageThumbnail}
                    alt={analysisResult.dishName}
                    className="w-20 h-20 rounded-2xl object-cover border border-white/10 shrink-0"
                  />
                )}
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">
                      {analysisResult.confidence.toUpperCase()} CONFIDENCE
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {(analysisResult.durationMs / 1000).toFixed(1)}s • {analysisResult.modelUsed}
                    </span>
                  </div>
                  <h4 className="text-base font-black text-white truncate mt-1">
                    {analysisResult.dishName}
                  </h4>
                  <p className="text-xs text-zinc-400 font-mono">
                    Baseline Portion: {analysisResult.servingSize}
                  </p>
                </div>
              </div>

              {/* Huge Calorie & Macro Banner */}
              <div className="p-5 rounded-[2rem] bg-[#14141C] border border-white/10 shadow-card space-y-4">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#FF3B30]">
                      Calculated Energy
                    </span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-4xl font-black text-white font-mono leading-none">
                        {currentCalories}
                      </span>
                      <span className="text-sm font-bold text-zinc-400 font-mono">kcal</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-mono text-zinc-400 block uppercase">Target Meal</span>
                    <span className="text-xs font-black text-white font-mono uppercase bg-white/10 px-2.5 py-1 rounded-full">
                      {selectedMeal}
                    </span>
                  </div>
                </div>

                {/* Macro Badges */}
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 font-mono">
                  <div className="p-3 rounded-2xl bg-[#1C1418] border border-rose-500/20 text-center">
                    <div className="flex items-center justify-center gap-1 text-[10px] uppercase font-bold text-rose-400">
                      <Beef className="w-3 h-3" />
                      <span>Protein</span>
                    </div>
                    <span className="text-base font-black text-white block mt-0.5">
                      {currentProtein}g
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#1C1A14] border border-amber-500/20 text-center">
                    <div className="flex items-center justify-center gap-1 text-[10px] uppercase font-bold text-amber-400">
                      <Wheat className="w-3 h-3" />
                      <span>Carbs</span>
                    </div>
                    <span className="text-base font-black text-white block mt-0.5">
                      {currentCarbs}g
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#141A1C] border border-cyan-500/20 text-center">
                    <div className="flex items-center justify-center gap-1 text-[10px] uppercase font-bold text-cyan-400">
                      <Cookie className="w-3 h-3" />
                      <span>Fat</span>
                    </div>
                    <span className="text-base font-black text-white block mt-0.5">
                      {currentFat}g
                    </span>
                  </div>

                  {currentFiber !== undefined && (
                    <div className="p-3 rounded-2xl bg-[#141C16] border border-emerald-500/20 text-center col-span-3 sm:col-span-1">
                      <div className="flex items-center justify-center gap-1 text-[10px] uppercase font-bold text-emerald-400">
                        <Sparkles className="w-3 h-3" />
                        <span>Fiber</span>
                      </div>
                      <span className="text-base font-black text-white block mt-0.5">
                        {currentFiber}g
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Dynamic Portion Multiplier Scaler */}
              <div className="p-4 rounded-2xl bg-[#181822] border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-zinc-300">
                    Portion Size Scaler ({portionMultiplier}x)
                  </span>
                  <span className="text-zinc-400 font-mono text-[11px]">
                    Adjust to match your plate size
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-1.5 font-mono text-xs">
                  {[0.5, 0.75, 1.0, 1.5, 2.0].map(mult => (
                    <button
                      key={mult}
                      type="button"
                      onClick={() => setPortionMultiplier(mult)}
                      className={`py-2 rounded-xl font-bold transition ${
                        portionMultiplier === mult
                          ? 'bg-white text-black font-extrabold shadow-md'
                          : 'bg-black/40 text-zinc-400 hover:text-white border border-white/5'
                      }`}
                    >
                      {mult}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Detected Dish Components Breakdown */}
              {analysisResult.components && analysisResult.components.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                    Detected Component Breakdown:
                  </span>
                  <div className="space-y-1.5">
                    {analysisResult.components.map((comp, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-[#14141C] border border-white/5 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-white block">{comp.name}</span>
                          <span className="text-[10px] text-zinc-400 font-mono">{comp.portion}</span>
                        </div>
                        <div className="text-right font-mono">
                          <span className="font-bold text-white block">{Math.round(comp.calories * portionMultiplier)} kcal</span>
                          <span className="text-[10px] text-zinc-400">
                            {Math.round(comp.proteinG * portionMultiplier)}P • {Math.round(comp.carbsG * portionMultiplier)}C • {Math.round(comp.fatG * portionMultiplier)}F
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Clinical Health Notes */}
              {analysisResult.healthNotes && (
                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 text-xs text-zinc-400 font-sans leading-relaxed">
                  <strong className="text-white font-mono uppercase text-[10px] block mb-1">
                    💡 Nutritional Synthesis:
                  </strong>
                  {analysisResult.healthNotes}
                </div>
              )}

              {/* Action Buttons: Retake vs Confirm Log */}
              <div className="flex items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setAnalysisResult(null)}
                  className="py-3 px-4 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Retake</span>
                </button>

                <button
                  type="button"
                  onClick={handleConfirmLog}
                  className="flex-1 py-3.5 px-5 rounded-full bg-white hover:bg-zinc-200 text-black font-extrabold text-xs shadow-xl transition active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4 text-[#FF3B30]" />
                  <span>Log to {selectedMeal.toUpperCase()} (+{currentCalories} kcal)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
