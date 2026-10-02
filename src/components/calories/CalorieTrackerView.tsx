import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  Droplets, 
  Beef, 
  Wheat, 
  Cookie, 
  ChevronLeft, 
  ChevronRight, 
  Flame, 
  Search, 
  Sliders,
  Camera
} from 'lucide-react';
import { FoodItem, FoodLogEntry, MealCategory } from '../../types';
import { PRESET_FOODS, DEFAULT_MACRO_TARGETS, DEMO_FOOD_LOGS } from '../../data/calorieData';
import { useApp } from '../../context/AppContext';
import { FoodCameraModal } from './FoodCameraModal';

type CalorieSubView = 'hub' | 'meal_detail' | 'hydration' | 'food_library' | 'targets' | 'custom_food';

export const CalorieTrackerView: React.FC = () => {
  const { showToast } = useApp();

  // Nested Navigation View State
  const [subView, setSubView] = useState<CalorieSubView>('hub');
  const [activeMealCategory, setActiveMealCategory] = useState<MealCategory>('breakfast');
  const [isCameraModalOpen, setIsCameraModalOpen] = useState<boolean>(false);

  // Macro Targets
  const [macroTargets, setMacroTargets] = useState(DEFAULT_MACRO_TARGETS);

  // Food logs for today
  const [foodLogs, setFoodLogs] = useState<FoodLogEntry[]>(() => {
    const saved = localStorage.getItem('ritual_food_logs');
    return saved ? JSON.parse(saved) : DEMO_FOOD_LOGS;
  });

  // Water intake in ml
  const [waterMl, setWaterMl] = useState<number>(() => {
    const saved = localStorage.getItem('ritual_water_ml');
    return saved ? parseInt(saved) : 1750;
  });

  // Search & Filter in Food Library
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');

  // Custom Quick Add state
  const [customName, setCustomName] = useState<string>('');
  const [customServing, setCustomServing] = useState<string>('1 portion');
  const [customCals, setCustomCals] = useState<number>(250);
  const [customProtein, setCustomProtein] = useState<number>(25);
  const [customCarbs, setCustomCarbs] = useState<number>(20);
  const [customFat, setCustomFat] = useState<number>(6);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('ritual_food_logs', JSON.stringify(foodLogs));
  }, [foodLogs]);

  useEffect(() => {
    localStorage.setItem('ritual_water_ml', waterMl.toString());
  }, [waterMl]);

  // Aggregate current daily macros
  const currentMacros = useMemo(() => {
    return foodLogs.reduce((acc, entry) => {
      const q = entry.quantity;
      return {
        calories: acc.calories + Math.round(entry.food.calories * q),
        proteinG: acc.proteinG + Math.round(entry.food.proteinG * q),
        carbsG: acc.carbsG + Math.round(entry.food.carbsG * q),
        fatG: acc.fatG + Math.round(entry.food.fatG * q)
      };
    }, { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 });
  }, [foodLogs]);

  const calRemaining = Math.max(0, macroTargets.calories - currentMacros.calories);
  const calPercentage = Math.min(100, Math.round((currentMacros.calories / macroTargets.calories) * 100));
  const proteinPercentage = Math.min(100, Math.round((currentMacros.proteinG / macroTargets.proteinG) * 100));
  const carbsPercentage = Math.min(100, Math.round((currentMacros.carbsG / macroTargets.carbsG) * 100));
  const fatPercentage = Math.min(100, Math.round((currentMacros.fatG / macroTargets.fatG) * 100));

  // Log a food
  const handleLogFood = (food: FoodItem, quantity: number = 1, targetMeal?: MealCategory) => {
    const meal = targetMeal || activeMealCategory;
    const newEntry: FoodLogEntry = {
      id: `entry-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      meal,
      food,
      quantity
    };

    setFoodLogs(prev => [newEntry, ...prev]);
    showToast(`🥗 Logged ${food.name} to ${meal} (${Math.round(food.calories * quantity)} kcal)`, 'success');
  };

  // Add custom food
  const handleAddCustomFood = () => {
    if (!customName.trim()) return;

    const customFood: FoodItem = {
      id: `custom-${Date.now()}`,
      name: customName,
      servingSize: customServing,
      calories: customCals,
      proteinG: customProtein,
      carbsG: customCarbs,
      fatG: customFat,
      category: 'Supplements'
    };

    handleLogFood(customFood, 1, activeMealCategory);
    setSubView('meal_detail');
    setCustomName('');
  };

  const removeFoodLog = (id: string) => {
    setFoodLogs(prev => prev.filter(item => item.id !== id));
    showToast('Removed item', 'info');
  };

  const addWater = (amountMl: number) => {
    setWaterMl(prev => {
      const next = prev + amountMl;
      showToast(`💧 Logged +${amountMl}ml water (${next}ml today)`, 'info');
      return next;
    });
  };

  const mealCategories: { id: MealCategory; label: string; icon: string; subtitle: string }[] = [
    { id: 'breakfast', label: 'Breakfast', icon: '🌅', subtitle: 'Metabolic kickstart & amino pool replenishment' },
    { id: 'lunch', label: 'Lunch', icon: '☀️', subtitle: 'Sustained cognitive & physical energy fuel' },
    { id: 'dinner', label: 'Dinner', icon: '🌙', subtitle: 'Tissue repair & overnight recovery nutrition' },
    { id: 'snacks', label: 'Snacks & Intra-Workout', icon: '⚡', subtitle: 'Targeted glycogen top-up & hydration' },
  ];

  const filteredPresetFoods = PRESET_FOODS.filter(food => {
    const matchesSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategoryFilter === 'All' || food.category === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getMealLogs = (mealId: MealCategory) => foodLogs.filter(f => f.meal === mealId);

  const getMealMacros = (mealId: MealCategory) => {
    return getMealLogs(mealId).reduce((acc, entry) => {
      const q = entry.quantity;
      return {
        calories: acc.calories + Math.round(entry.food.calories * q),
        proteinG: acc.proteinG + Math.round(entry.food.proteinG * q),
        carbsG: acc.carbsG + Math.round(entry.food.carbsG * q),
        fatG: acc.fatG + Math.round(entry.food.fatG * q)
      };
    }, { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 });
  };

  return (
    <div className="space-y-6 pb-24 text-white">
      {/* ========================================================================= */}
      {/* 🧭 NESTED VIEW HEADER & NAVIGATION BAR                                     */}
      {/* ========================================================================= */}
      {subView !== 'hub' && (
        <div className="flex items-center justify-between bg-[#121217] p-3.5 sm:p-4 rounded-3xl border border-white/10 shadow-lg">
          <button
            type="button"
            onClick={() => setSubView('hub')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-black text-white transition active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Nutrition Hub</span>
          </button>

          <span className="text-xs font-mono font-black uppercase text-zinc-300 tracking-wider">
            {subView === 'meal_detail' && `🥗 ${activeMealCategory.toUpperCase()} LOG`}
            {subView === 'food_library' && '🔍 Food & Supplement Library'}
            {subView === 'hydration' && '💧 Hydration & Electrolytes'}
            {subView === 'targets' && '⚖️ Target Calibrator'}
            {subView === 'custom_food' && '➕ Quick Macro Entry'}
          </span>

          <div className="flex items-center gap-1.5">
            {subView === 'meal_detail' && (
              <button
                type="button"
                onClick={() => setSubView('food_library')}
                className="px-3 py-1.5 rounded-full bg-white text-black text-xs font-black flex items-center gap-1 shadow-md hover:bg-zinc-200 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Food</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🏠 MAIN NESTED HUB SCREEN (CLEAN BITE-SIZED OVERVIEW)                     */}
      {/* ========================================================================= */}
      {subView === 'hub' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Main Caloric & Macro Summary Card */}
          <div className="bg-[#0C0C10] rounded-[2.5rem] p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono font-black uppercase text-[#FF3B30] tracking-widest block">
                  METABOLIC PRECISION
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-0.5">
                  Caloric & Macro Targets
                </h1>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCameraModalOpen(true)}
                  className="px-4 py-2 rounded-full bg-[#FF3B30] hover:bg-[#E0352B] text-white font-black text-xs transition shadow-lg flex items-center gap-1.5 active:scale-95 animate-pulse"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Snap Meal (Gemini AI)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSubView('custom_food')}
                  className="px-4 py-2 rounded-full bg-white text-black hover:bg-zinc-200 font-black text-xs transition shadow-lg flex items-center gap-1.5 active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Quick Add</span>
                </button>
              </div>
            </div>

            {/* Caloric Big Dial & Triple Concentric Progress */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-2">
              {/* Left Dial */}
              <div className="md:col-span-5 flex items-center gap-5 p-5 rounded-3xl bg-[#14141C] border border-white/5">
                <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                  <svg className="w-20 h-20 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.08)" strokeWidth="8" fill="none" />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#FF3B30"
                      strokeWidth="8"
                      strokeDasharray="251.32"
                      strokeDashoffset={251.32 * (1 - calPercentage / 100)}
                      strokeLinecap="round"
                      fill="none"
                      className="transition-all duration-700"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center font-mono">
                    <Flame className="w-5 h-5 text-[#FF3B30]" />
                  </div>
                </div>

                <div className="space-y-1 font-mono">
                  <span className="text-2xl sm:text-3xl font-black text-white leading-none block">
                    {calRemaining}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">
                    kcal Remaining
                  </span>
                  <span className="text-xs font-bold text-zinc-300">
                    {currentMacros.calories} / {macroTargets.calories} kcal consumed
                  </span>
                </div>
              </div>

              {/* Right Macro Triple Bars */}
              <div className="md:col-span-7 space-y-3">
                {/* Protein Bar */}
                <div className="p-3.5 rounded-2xl bg-[#14141C] border border-white/5 space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <div className="flex items-center gap-1.5 font-bold text-white">
                      <Beef className="w-3.5 h-3.5 text-rose-400" />
                      <span>Protein</span>
                    </div>
                    <span className="font-bold text-zinc-300">
                      {currentMacros.proteinG}g / {macroTargets.proteinG}g ({proteinPercentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#09090D] overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full transition-all duration-500" style={{ width: `${proteinPercentage}%` }} />
                  </div>
                </div>

                {/* Carbs Bar */}
                <div className="p-3.5 rounded-2xl bg-[#14141C] border border-white/5 space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <div className="flex items-center gap-1.5 font-bold text-white">
                      <Wheat className="w-3.5 h-3.5 text-amber-400" />
                      <span>Carbohydrates</span>
                    </div>
                    <span className="font-bold text-zinc-300">
                      {currentMacros.carbsG}g / {macroTargets.carbsG}g ({carbsPercentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#09090D] overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${carbsPercentage}%` }} />
                  </div>
                </div>

                {/* Fats Bar */}
                <div className="p-3.5 rounded-2xl bg-[#14141C] border border-white/5 space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <div className="flex items-center gap-1.5 font-bold text-white">
                      <Cookie className="w-3.5 h-3.5 text-teal-400" />
                      <span>Fats</span>
                    </div>
                    <span className="font-bold text-zinc-300">
                      {currentMacros.fatG}g / {macroTargets.fatG}g ({fatPercentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#09090D] overflow-hidden">
                    <div className="h-full bg-teal-500 rounded-full transition-all duration-500" style={{ width: `${fatPercentage}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Hydration Stepper Bar */}
            <div className="p-4 rounded-3xl bg-[#14141C] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono">
              <div 
                onClick={() => setSubView('hydration')}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                  <Droplets className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-black text-white group-hover:text-cyan-400 transition">
                    Hydration Target: {waterMl} / {macroTargets.waterMl} ml
                  </span>
                  <span className="text-[10px] text-zinc-400 block font-sans">Euvolemic electrolyte baseline</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => addWater(250)}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition active:scale-95"
                >
                  +250 ml
                </button>
                <button
                  type="button"
                  onClick={() => addWater(500)}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-black transition active:scale-95 shadow-md"
                >
                  +500 ml
                </button>
              </div>
            </div>
          </div>

          {/* Four Meal Category Navigation Tiles (Nested Drill-Downs) */}
          <div className="space-y-3">
            <h2 className="text-xs font-black uppercase text-zinc-400 tracking-wider font-mono px-1">
              Daily Meal Breakdown (Tap to Drill Down)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {mealCategories.map((cat) => {
                const logs = getMealLogs(cat.id);
                const macros = getMealMacros(cat.id);

                return (
                  <div
                    key={cat.id}
                    onClick={() => {
                      setActiveMealCategory(cat.id);
                      setSubView('meal_detail');
                    }}
                    className="group p-5 rounded-[2rem] bg-[#121217] hover:bg-[#181822] border border-white/10 hover:border-[#FF3B30]/40 transition-all cursor-pointer shadow-card flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{cat.icon}</span>
                        <div>
                          <h3 className="text-base font-black text-white group-hover:text-[#FF3B30] transition">
                            {cat.label}
                          </h3>
                          <span className="text-[10px] text-zinc-400 font-mono">
                            {logs.length} {logs.length === 1 ? 'item' : 'items'} logged
                          </span>
                        </div>
                      </div>

                      <div className="text-right font-mono">
                        <span className="text-base font-black text-white block">
                          {macros.calories} kcal
                        </span>
                        <span className="text-[10px] text-rose-400 font-bold">
                          {macros.proteinG}g P
                        </span>
                      </div>
                    </div>

                    <div className="pt-1 flex items-center justify-between border-t border-white/5 text-[11px] text-zinc-400">
                      <span className="truncate max-w-[200px]">
                        {logs.length > 0 ? logs.map(l => l.food.name).join(', ') : 'No foods logged yet'}
                      </span>
                      <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-white group-hover:translate-x-1 transition shrink-0" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Tools Tile Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div
              onClick={() => setIsCameraModalOpen(true)}
              className="p-4 rounded-2xl bg-[#1C1215] hover:bg-[#25151A] border border-[#FF3B30]/30 hover:border-[#FF3B30] cursor-pointer transition flex items-center gap-3 group shadow-card"
            >
              <div className="w-10 h-10 rounded-xl bg-[#FF3B30]/20 text-[#FF3B30] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-black text-white group-hover:text-[#FF3B30] transition">Snap Meal Photo</h4>
                  <span className="px-1.5 py-0.2 rounded bg-[#FF3B30]/20 text-[#FF3B30] text-[9px] font-mono font-bold">&lt;1s</span>
                </div>
                <p className="text-[10px] text-zinc-400">Instant Gemini Vision Macros</p>
              </div>
            </div>

            <div
              onClick={() => setSubView('food_library')}
              className="p-4 rounded-2xl bg-[#121217] hover:bg-[#181822] border border-white/10 cursor-pointer transition flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-white/5 text-[#FF3B30] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white group-hover:text-[#FF3B30] transition">Food Database</h4>
                <p className="text-[10px] text-zinc-400">Search verified whole foods</p>
              </div>
            </div>

            <div
              onClick={() => setSubView('hydration')}
              className="p-4 rounded-2xl bg-[#121217] hover:bg-[#181822] border border-white/10 cursor-pointer transition flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white group-hover:text-cyan-400 transition">Hydration Engine</h4>
                <p className="text-[10px] text-zinc-400">Electrolyte & volume logs</p>
              </div>
            </div>

            <div
              onClick={() => setSubView('targets')}
              className="p-4 rounded-2xl bg-[#121217] hover:bg-[#181822] border border-white/10 cursor-pointer transition flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white group-hover:text-amber-400 transition">Target Calibrator</h4>
                <p className="text-[10px] text-zinc-400">Calibrate protein & carbs</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🥗 SUB-VIEW: MEAL DETAIL & FOOD LOG LIST                                   */}
      {/* ========================================================================= */}
      {subView === 'meal_detail' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Meal Header Stats */}
          <div className="bg-[#0C0C10] rounded-[2.5rem] p-6 sm:p-8 border border-white/10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-black uppercase text-[#FF3B30] tracking-widest block">
                  MEAL LOG
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white capitalize">
                  {activeMealCategory}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCameraModalOpen(true)}
                  className="px-4 py-2 rounded-full bg-[#FF3B30] hover:bg-[#E0352B] text-white font-black text-xs transition shadow-md flex items-center gap-1.5 active:scale-95 animate-pulse"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Snap Meal (Gemini AI)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSubView('food_library')}
                  className="px-4 py-2 rounded-full bg-white text-black hover:bg-zinc-200 font-black text-xs transition shadow-md flex items-center gap-1 active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Search Food</span>
                </button>
              </div>
            </div>

            {/* Meal Specific Macro Totals */}
            <div className="grid grid-cols-4 gap-2 font-mono text-center pt-2">
              <div className="p-3 rounded-2xl bg-[#14141C] border border-white/5 space-y-0.5">
                <span className="text-[10px] text-zinc-400 uppercase block">Calories</span>
                <span className="text-base font-black text-white">{getMealMacros(activeMealCategory).calories} kcal</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#14141C] border border-white/5 space-y-0.5">
                <span className="text-[10px] text-rose-400 uppercase block">Protein</span>
                <span className="text-base font-black text-white">{getMealMacros(activeMealCategory).proteinG}g</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#14141C] border border-white/5 space-y-0.5">
                <span className="text-[10px] text-amber-400 uppercase block">Carbs</span>
                <span className="text-base font-black text-white">{getMealMacros(activeMealCategory).carbsG}g</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#14141C] border border-white/5 space-y-0.5">
                <span className="text-[10px] text-teal-400 uppercase block">Fats</span>
                <span className="text-base font-black text-white">{getMealMacros(activeMealCategory).fatG}g</span>
              </div>
            </div>
          </div>

          {/* Logged Food Items in this meal */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase text-zinc-400 tracking-wider font-mono px-1">
              Logged Items in {activeMealCategory}
            </h3>

            {getMealLogs(activeMealCategory).length === 0 ? (
              <div className="p-8 rounded-[2rem] bg-[#121217] border border-white/10 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-[#FF3B30]">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">No items logged for {activeMealCategory}</h4>
                  <p className="text-xs text-zinc-400 font-mono mt-0.5">Take a plate photo with Gemini AI Vision or search verified whole foods.</p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsCameraModalOpen(true)}
                    className="px-4 py-2.5 rounded-full bg-[#FF3B30] hover:bg-[#E0352B] text-white font-black text-xs shadow-lg flex items-center gap-1.5 active:scale-95"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Snap Photo (Gemini AI &lt;1s)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubView('food_library')}
                    className="px-4 py-2.5 rounded-full bg-white text-black hover:bg-zinc-200 font-black text-xs shadow-md"
                  >
                    + Food Database
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                {getMealLogs(activeMealCategory).map((entry) => (
                  <div
                    key={entry.id}
                    className="p-4 rounded-2xl bg-[#121217] border border-white/10 flex items-center justify-between gap-3 shadow-md"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-white">{entry.food.name}</span>
                        <span className="text-[10px] font-mono text-zinc-400 bg-white/5 px-2 py-0.5 rounded-full">
                          {entry.quantity} × {entry.food.servingSize}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                        <span className="text-[#FF3B30] font-bold">{Math.round(entry.food.calories * entry.quantity)} kcal</span>
                        <span>•</span>
                        <span>{Math.round(entry.food.proteinG * entry.quantity)}g P</span>
                        <span>•</span>
                        <span>{Math.round(entry.food.carbsG * entry.quantity)}g C</span>
                        <span>•</span>
                        <span>{Math.round(entry.food.fatG * entry.quantity)}g F</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFoodLog(entry.id)}
                      className="p-2 rounded-xl text-zinc-400 hover:text-[#FF3B30] transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🔍 SUB-VIEW: SEARCHABLE FOOD & SUPPLEMENT DATABASE                         */}
      {/* ========================================================================= */}
      {subView === 'food_library' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="bg-[#0C0C10] rounded-[2.5rem] p-6 sm:p-8 border border-white/10 shadow-2xl space-y-4">
            <div>
              <span className="text-[10px] font-mono font-black uppercase text-[#FF3B30] tracking-widest block">
                CATALOG
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Food & Supplement Database
              </h2>
            </div>

            {/* Target Meal Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase text-zinc-400">Adding to:</span>
              <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-mono">
                {mealCategories.map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setActiveMealCategory(m.id)}
                    className={`px-3 py-1 rounded-full font-bold transition ${
                      activeMealCategory === m.id
                        ? 'bg-white text-black shadow-md'
                        : 'bg-[#181822] text-zinc-400 hover:text-white border border-white/10'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search food, protein source, shake, or supplement..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#09090D] border border-white/10 text-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#FF3B30]"
              />
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
              {(['All', 'Protein', 'Carbohydrates', 'Fats', 'Supplements', 'Indian Whole Foods'] as const).map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-full font-bold whitespace-nowrap transition ${
                    selectedCategoryFilter === cat
                      ? 'bg-white text-black'
                      : 'bg-[#181822] text-zinc-400 hover:text-white border border-white/5'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Food Results List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredPresetFoods.map(food => (
              <div
                key={food.id}
                onClick={() => {
                  handleLogFood(food, 1, activeMealCategory);
                  setSubView('meal_detail');
                }}
                className="p-4 rounded-2xl bg-[#121217] hover:bg-[#181822] border border-white/10 hover:border-[#FF3B30]/40 transition cursor-pointer flex items-center justify-between group"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-white group-hover:text-[#FF3B30] transition">{food.name}</span>
                    <span className="text-[9px] font-mono text-zinc-400 bg-white/5 px-2 py-0.5 rounded-full">{food.category}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400">
                    <span className="text-zinc-200 font-bold">{food.calories} kcal</span>
                    <span>•</span>
                    <span className="text-rose-400 font-bold">{food.proteinG}g P</span>
                    <span>•</span>
                    <span>{food.carbsG}g C</span>
                    <span>•</span>
                    <span>{food.fatG}g F</span>
                  </div>
                </div>

                <div className="w-8 h-8 rounded-xl bg-white/5 group-hover:bg-white group-hover:text-black flex items-center justify-center text-zinc-400 transition shadow-sm shrink-0">
                  <Plus className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 💧 SUB-VIEW: HYDRATION PROTOCOL                                           */}
      {/* ========================================================================= */}
      {subView === 'hydration' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="bg-[#0C0C10] rounded-[2.5rem] p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6">
            <div>
              <span className="text-[10px] font-mono font-black uppercase text-cyan-400 tracking-widest block">
                EUVOLEMIC HYDRATION
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Fluid & Electrolyte Tracker
              </h2>
              <p className="text-xs text-zinc-400 mt-1">Maintaining optimal blood volume, intracellular pressure & nutrient transport.</p>
            </div>

            <div className="p-6 rounded-3xl bg-[#14141C] border border-white/5 flex flex-col items-center justify-center space-y-4 text-center">
              <div className="w-24 h-24 rounded-3xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shadow-lg">
                <Droplets className="w-12 h-12" />
              </div>

              <div className="space-y-1 font-mono">
                <span className="text-4xl sm:text-5xl font-black text-white leading-none block">
                  {waterMl} <span className="text-lg text-cyan-400 font-bold">/ {macroTargets.waterMl} ml</span>
                </span>
                <span className="text-xs text-zinc-400 block">
                  {Math.round((waterMl / macroTargets.waterMl) * 100)}% of daily baseline completed
                </span>
              </div>

              <div className="w-full max-w-md h-3 rounded-full bg-[#09090D] overflow-hidden border border-white/10">
                <div 
                  className="h-full bg-cyan-400 rounded-full transition-all duration-700" 
                  style={{ width: `${Math.min(100, (waterMl / macroTargets.waterMl) * 100)}%` }} 
                />
              </div>

              <div className="flex items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => addWater(250)}
                  className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-mono font-black text-xs transition active:scale-95"
                >
                  +250 ml (1 Glass)
                </button>
                <button
                  type="button"
                  onClick={() => addWater(500)}
                  className="px-5 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-black text-xs transition active:scale-95 shadow-md"
                >
                  +500 ml (1 Bottle)
                </button>
                <button
                  type="button"
                  onClick={() => addWater(1000)}
                  className="px-5 py-3 rounded-2xl bg-white hover:bg-zinc-200 text-black font-mono font-black text-xs transition active:scale-95 shadow-md"
                >
                  +1,000 ml
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ⚖️ SUB-VIEW: TARGET CALIBRATOR                                             */}
      {/* ========================================================================= */}
      {subView === 'targets' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="bg-[#0C0C10] rounded-[2.5rem] p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6">
            <div>
              <span className="text-[10px] font-mono font-black uppercase text-amber-400 tracking-widest block">
                CALIBRATION
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Daily Macronutrient Targets
              </h2>
              <p className="text-xs text-zinc-400 mt-1">Calibrate target calories and macro ratios for your specific athletic goals.</p>
            </div>

            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">Target Calories (kcal)</label>
                <input
                  type="number"
                  value={macroTargets.calories}
                  onChange={(e) => setMacroTargets(prev => ({ ...prev, calories: parseInt(e.target.value) || 2000 }))}
                  className="w-full px-4 py-3 rounded-xl bg-[#14141C] border border-white/10 text-white font-mono font-bold focus:outline-none focus:ring-1 focus:ring-[#FF3B30]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-rose-400 mb-1">Protein (g)</label>
                  <input
                    type="number"
                    value={macroTargets.proteinG}
                    onChange={(e) => setMacroTargets(prev => ({ ...prev, proteinG: parseInt(e.target.value) || 150 }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#14141C] border border-white/10 text-white font-mono font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-amber-400 mb-1">Carbs (g)</label>
                  <input
                    type="number"
                    value={macroTargets.carbsG}
                    onChange={(e) => setMacroTargets(prev => ({ ...prev, carbsG: parseInt(e.target.value) || 200 }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#14141C] border border-white/10 text-white font-mono font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-teal-400 mb-1">Fats (g)</label>
                  <input
                    type="number"
                    value={macroTargets.fatG}
                    onChange={(e) => setMacroTargets(prev => ({ ...prev, fatG: parseInt(e.target.value) || 60 }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#14141C] border border-white/10 text-white font-mono font-bold focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  showToast('Updated Daily Targets', 'success');
                  setSubView('hub');
                }}
                className="w-full py-3 rounded-2xl bg-white hover:bg-zinc-200 text-black font-black text-xs shadow-lg transition"
              >
                Save Targets
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ➕ SUB-VIEW: QUICK MACRO & CUSTOM ENTRY                                    */}
      {/* ========================================================================= */}
      {subView === 'custom_food' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="bg-[#0C0C10] rounded-[2.5rem] p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6">
            <div>
              <span className="text-[10px] font-mono font-black uppercase text-[#FF3B30] tracking-widest block">
                CUSTOM INPUT
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Quick Macro Entry
              </h2>
              <p className="text-xs text-zinc-400 mt-1">Log custom foods, meal shakes, or quick raw macronutrient values.</p>
            </div>

            <div className="space-y-4 max-w-md">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">Food / Shake Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Whey Shake + Banana..."
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#14141C] border border-white/10 text-white text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#FF3B30]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">Serving Size</label>
                  <input
                    type="text"
                    placeholder="e.g. 1 scoop (35g), 1 bowl..."
                    value={customServing}
                    onChange={(e) => setCustomServing(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#14141C] border border-white/10 text-white text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#FF3B30]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">Target Meal</label>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  {mealCategories.map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setActiveMealCategory(m.id)}
                      className={`p-2.5 rounded-xl border font-bold transition text-left ${
                        activeMealCategory === m.id
                          ? 'bg-white text-black border-white shadow-md'
                          : 'bg-[#14141C] text-zinc-400 border-white/10 hover:text-white'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono">
                <div>
                  <label className="block text-[10px] uppercase text-zinc-400 mb-1">Calories</label>
                  <input
                    type="number"
                    value={customCals}
                    onChange={(e) => setCustomCals(parseInt(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-xl bg-[#14141C] border border-white/10 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-rose-400 mb-1">Protein (g)</label>
                  <input
                    type="number"
                    value={customProtein}
                    onChange={(e) => setCustomProtein(parseInt(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-xl bg-[#14141C] border border-white/10 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-amber-400 mb-1">Carbs (g)</label>
                  <input
                    type="number"
                    value={customCarbs}
                    onChange={(e) => setCustomCarbs(parseInt(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-xl bg-[#14141C] border border-white/10 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-teal-400 mb-1">Fat (g)</label>
                  <input
                    type="number"
                    value={customFat}
                    onChange={(e) => setCustomFat(parseInt(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-xl bg-[#14141C] border border-white/10 text-white font-bold"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddCustomFood}
                className="w-full py-3.5 rounded-2xl bg-white hover:bg-zinc-200 text-black font-black text-xs shadow-lg transition"
              >
                Log Meal to {activeMealCategory}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gemini AI Vision Food Camera Modal */}
      <FoodCameraModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        defaultMeal={activeMealCategory}
        onFoodLogged={(meal, food, quantity) => handleLogFood(food, quantity, meal)}
      />
    </div>
  );
};
