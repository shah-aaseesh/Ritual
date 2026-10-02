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

  const handleProcessImage = async (imageInput: File | string) => {
    setIsAnalyzing(true);
    setProgressState({ percent: 20, status: 'Initializing Gemini Flash Vision pipeline...' });

    try {
      if (typeof imageInput === 'string') {
        // Sample image URL
        setProgressState({ percent: 40, status: 'Fetching dish image...' });
      } else {
        // Direct camera photo file
        setProgressState({ percent: 40, status: 'Processing camera photo pixels...' });
      }

      setProgressState({ percent: 75, status: 'Gemini 3.1 Flash-Lite extracting macros...' });

      const result = await analyzeFoodImageWithGemini(
        imageInput,
        aiSettings.openRouterApiKey,
        (pct, status) => setProgressState({ percent: pct, status })
      );

      setAnalysisResult(result);
      setPortionMultiplier(1.0);
      showToast(`Analyzed ${result.dishName} (${result.totalCalories} kcal) in ${(result.durationMs / 1000).toFixed(2)}s!`, 'success');
    } catch (err: any) {
      showToast(err?.message || 'Error analyzing food photo. Please try again.', 'warning');
    } finally {
      setIsAnalyzing(false);
      setProgressState({ percent: 0, status: '' });
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

    const scaledFood: FoodItem = {
      id: `gemini-food-${Date.now()}`,
      name: analysisResult.dishName,
      servingSize: analysisResult.servingSize,
      calories: Math.round(analysisResult.totalCalories * portionMultiplier),
      proteinG: Math.round(analysisResult.proteinG * portionMultiplier),
      carbsG: Math.round(analysisResult.carbsG * portionMultiplier),
      fatG: Math.round(analysisResult.fatG * portionMultiplier),
      category: 'Indian Whole Foods'
    };

    onFoodLogged(selectedMeal, scaledFood, 1);
    showToast(`Logged ${scaledFood.name} to ${selectedMeal}!`, 'success');
    setAnalysisResult(null);
    onClose();
  };

  const currentCalories = analysisResult ? Math.round(analysisResult.totalCalories * portionMultiplier) : 0;
  const currentProtein = analysisResult ? Math.round(analysisResult.proteinG * portionMultiplier) : 0;
  const currentCarbs = analysisResult ? Math.round(analysisResult.carbsG * portionMultiplier) : 0;
  const currentFat = analysisResult ? Math.round(analysisResult.fatG * portionMultiplier) : 0;
  const currentFiber = analysisResult?.fiberG !== undefined ? Math.round(analysisResult.fiberG * portionMultiplier) : undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-[2.5rem] max-w-lg w-full p-6 sm:p-7 shadow-modal border border-mint-200 text-charcoal-900 space-y-5 max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-mint-100 pb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-mint-100 text-forest-800 border border-mint-200 flex items-center justify-center font-mono">
              <Camera className="w-5 h-5 text-forest-800" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-black text-forest-950">Gemini AI Meal Camera</h3>
                <span className="px-2 py-0.2 rounded-full bg-mint-100 text-forest-800 text-[10px] font-mono font-bold border border-mint-200">
                  ⚡ &lt;1s Vision
                </span>
              </div>
              <p className="text-xs text-charcoal-600 font-mono">Instant photo calorie estimation</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-charcoal-400 hover:text-charcoal-700 hover:bg-mint-50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto space-y-5 pr-1">
          
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

          {/* Initial Capture Screen */}
          {!analysisResult && !isAnalyzing && (
            <div className="space-y-4">
              {/* Target Meal Pill Selector */}
              <div className="space-y-1.5">
                <span className="text-xs font-mono font-bold uppercase text-charcoal-600 block">
                  Log this meal to:
                </span>
                <div className="grid grid-cols-4 gap-2 text-xs font-mono">
                  {(['breakfast', 'lunch', 'dinner', 'snacks'] as MealCategory[]).map((meal) => (
                    <button
                      key={meal}
                      type="button"
                      onClick={() => setSelectedMeal(meal)}
                      className={`py-2 rounded-xl border text-center capitalize font-bold transition ${
                        selectedMeal === meal
                          ? 'bg-forest-900 text-white border-forest-900 shadow-soft font-extrabold'
                          : 'bg-cream-50 text-charcoal-700 border-mint-100 hover:bg-mint-50'
                      }`}
                    >
                      {meal}
                    </button>
                  ))}
                </div>
              </div>

              {/* Big 2-Card Direct Capture Actions */}
              <div className="grid grid-cols-2 gap-3.5 pt-2">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="p-6 rounded-[2rem] bg-cream-50/80 hover:bg-mint-50/50 border border-mint-200 flex flex-col items-center justify-center gap-3 text-center transition group active:scale-98 shadow-soft"
                >
                  <div className="w-14 h-14 rounded-full bg-forest-900 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                    <Camera className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <span className="text-sm font-black text-forest-950 block">Take Meal Photo</span>
                    <span className="text-xs text-charcoal-500 mt-0.5 block">Direct Camera Viewfinder</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-6 rounded-[2rem] bg-cream-50/80 hover:bg-mint-50/50 border border-mint-200 flex flex-col items-center justify-center gap-3 text-center transition group active:scale-98 shadow-soft"
                >
                  <div className="w-14 h-14 rounded-full bg-mint-100 border border-mint-200 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                    <Upload className="w-7 h-7 text-forest-800" />
                  </div>
                  <div>
                    <span className="text-sm font-black text-forest-950 block">Upload Food Image</span>
                    <span className="text-xs text-charcoal-500 mt-0.5 block">From Photo Library</span>
                  </div>
                </button>
              </div>

              {/* Sample Food Quick Test Grid */}
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-charcoal-600 uppercase tracking-wider">
                    Or Test Fast Demo Meals:
                  </span>
                  <span className="text-[10px] text-charcoal-400 font-mono">1-Click Test</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {SAMPLE_MEAL_IMAGES.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleProcessImage(sample.preview)}
                      className="p-3 rounded-2xl bg-white hover:bg-mint-50/40 border border-mint-200 text-left flex items-center gap-3 transition group shadow-soft"
                    >
                      <img
                        src={sample.preview}
                        alt={sample.name}
                        className="w-12 h-12 rounded-xl object-cover border border-mint-200 group-hover:scale-105 transition-transform shrink-0"
                      />
                      <div className="overflow-hidden">
                        <span className="text-xs font-bold text-forest-950 block truncate group-hover:text-forest-800">
                          {sample.name}
                        </span>
                        <span className="text-[10px] text-charcoal-500 block truncate font-sans">
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
            <div className="p-8 rounded-[2rem] bg-cream-50/70 border border-mint-200 flex flex-col items-center justify-center space-y-4 text-center">
              <div className="relative w-20 h-20 rounded-full bg-mint-100 border border-mint-300 flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-forest-800 animate-spin" />
                <div className="absolute inset-0 rounded-full border-2 border-mint-500 animate-ping opacity-25" />
              </div>

              <div className="space-y-1">
                <h4 className="text-base font-black text-forest-950">
                  Gemini Flash Vision Processing
                </h4>
                <p className="text-xs text-charcoal-600 font-mono">
                  {progressState.status || 'Extracting food volume and macronutrients...'}
                </p>
              </div>

              <div className="w-full max-w-xs bg-cream-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-forest-900 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${progressState.percent}%` }}
                />
              </div>
            </div>
          )}

          {/* Analysis Results View */}
          {analysisResult && !isAnalyzing && (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* Dish Overview & Photo Header */}
              <div className="p-4 rounded-[2rem] bg-cream-50/70 border border-mint-200 flex items-center gap-4">
                {analysisResult.imageThumbnail && (
                  <img
                    src={analysisResult.imageThumbnail}
                    alt={analysisResult.dishName}
                    className="w-20 h-20 rounded-2xl object-cover border border-mint-200 shrink-0"
                  />
                )}
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-mint-100 text-forest-800 border border-mint-200 text-[10px] font-mono font-bold">
                      {analysisResult.confidence.toUpperCase()} CONFIDENCE
                    </span>
                    <span className="text-[10px] text-charcoal-500 font-mono">
                      {(analysisResult.durationMs / 1000).toFixed(1)}s • {analysisResult.modelUsed}
                    </span>
                  </div>
                  <h4 className="text-base font-black text-forest-950 truncate mt-1">
                    {analysisResult.dishName}
                  </h4>
                  <p className="text-xs text-charcoal-600 font-mono">
                    Baseline Portion: {analysisResult.servingSize}
                  </p>
                </div>
              </div>

              {/* Huge Calorie & Macro Banner */}
              <div className="p-5 rounded-[2rem] bg-white border border-mint-200/80 shadow-card space-y-4">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-forest-700">
                      Calculated Energy
                    </span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-4xl font-black text-forest-950 font-mono leading-none">
                        {currentCalories}
                      </span>
                      <span className="text-sm font-bold text-charcoal-500 font-mono">kcal</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-mono text-charcoal-500 block uppercase">Target Meal</span>
                    <span className="text-xs font-black text-forest-950 font-mono uppercase bg-mint-100 px-2.5 py-1 rounded-full border border-mint-200">
                      {selectedMeal}
                    </span>
                  </div>
                </div>

                {/* Macro Badges */}
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 font-mono">
                  <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-center">
                    <div className="flex items-center justify-center gap-1 text-[10px] uppercase font-bold text-rose-700">
                      <Beef className="w-3 h-3" />
                      <span>Protein</span>
                    </div>
                    <span className="text-base font-black text-forest-950 block mt-0.5">
                      {currentProtein}g
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-center">
                    <div className="flex items-center justify-center gap-1 text-[10px] uppercase font-bold text-amber-700">
                      <Wheat className="w-3 h-3" />
                      <span>Carbs</span>
                    </div>
                    <span className="text-base font-black text-forest-950 block mt-0.5">
                      {currentCarbs}g
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-teal-50 border border-teal-200 text-center">
                    <div className="flex items-center justify-center gap-1 text-[10px] uppercase font-bold text-teal-700">
                      <Cookie className="w-3 h-3" />
                      <span>Fat</span>
                    </div>
                    <span className="text-base font-black text-forest-950 block mt-0.5">
                      {currentFat}g
                    </span>
                  </div>

                  {currentFiber !== undefined && (
                    <div className="p-3 rounded-2xl bg-mint-50 border border-mint-200 text-center col-span-3 sm:col-span-1">
                      <div className="flex items-center justify-center gap-1 text-[10px] uppercase font-bold text-forest-700">
                        <Sparkles className="w-3 h-3" />
                        <span>Fiber</span>
                      </div>
                      <span className="text-base font-black text-forest-950 block mt-0.5">
                        {currentFiber}g
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Dynamic Portion Multiplier Scaler */}
              <div className="p-4 rounded-2xl bg-cream-50/70 border border-mint-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-charcoal-700">
                    Portion Size Scaler ({portionMultiplier}x)
                  </span>
                  <span className="text-charcoal-500 font-mono text-[11px]">
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
                          ? 'bg-forest-900 text-white font-extrabold shadow-soft'
                          : 'bg-white text-charcoal-700 hover:text-forest-900 border border-mint-200'
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
                  <span className="text-xs font-mono font-bold text-charcoal-600 uppercase tracking-wider block">
                    Detected Component Breakdown:
                  </span>
                  <div className="space-y-1.5">
                    {analysisResult.components.map((comp, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-white border border-mint-100 flex items-center justify-between text-xs shadow-soft"
                      >
                        <div>
                          <span className="font-bold text-forest-950 block">{comp.name}</span>
                          <span className="text-[10px] text-charcoal-500 font-mono">{comp.portion}</span>
                        </div>
                        <div className="text-right font-mono">
                          <span className="font-bold text-forest-950 block">{Math.round(comp.calories * portionMultiplier)} kcal</span>
                          <span className="text-[10px] text-charcoal-500">
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
                <div className="p-3.5 rounded-2xl bg-cream-50 border border-mint-200 text-xs text-charcoal-700 font-sans leading-relaxed">
                  <strong className="text-forest-950 font-mono uppercase text-[10px] block mb-1">
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
                  className="py-3 px-4 rounded-full bg-cream-50 hover:bg-mint-100 text-charcoal-800 font-bold text-xs transition flex items-center justify-center gap-1.5 border border-mint-200"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Retake</span>
                </button>

                <button
                  type="button"
                  onClick={handleConfirmLog}
                  className="flex-1 py-3.5 px-5 rounded-full bg-forest-900 hover:bg-forest-800 text-white font-extrabold text-xs shadow-soft transition active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4 text-mint-300" />
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
