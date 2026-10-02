import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  Droplets, 
  Beef, 
  Wheat, 
  Cookie
} from 'lucide-react';
import { FoodItem, FoodLogEntry, MealCategory } from '../../types';
import { PRESET_FOODS, DEFAULT_MACRO_TARGETS, DEMO_FOOD_LOGS } from '../../data/calorieData';
import { useApp } from '../../context/AppContext';

export const CalorieTrackerView: React.FC = () => {
  const { showToast } = useApp();

  // Macro Targets
  const macroTargets = DEFAULT_MACRO_TARGETS;

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

  // Food Picker Modal
  const [showAddFoodModal, setShowAddFoodModal] = useState<boolean>(false);
  const [activeMealCategory, setActiveMealCategory] = useState<MealCategory>('breakfast');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');

  // Custom Quick Add Modal
  const [showCustomFoodModal, setShowCustomFoodModal] = useState<boolean>(false);
  const [customName, setCustomName] = useState<string>('');
  const [customServing, setCustomServing] = useState<string>('1 portion');
  const [customCals, setCustomCals] = useState<number>(200);
  const [customProtein, setCustomProtein] = useState<number>(20);
  const [customCarbs, setCustomCarbs] = useState<number>(15);
  const [customFat, setCustomFat] = useState<number>(5);

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
  const handleLogFood = (food: FoodItem, quantity: number = 1) => {
    const newEntry: FoodLogEntry = {
      id: `entry-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      meal: activeMealCategory,
      food,
      quantity
    };

    setFoodLogs(prev => [newEntry, ...prev]);
    setShowAddFoodModal(false);
    showToast(`🥗 Logged ${food.name} (${Math.round(food.calories * quantity)} kcal)`, 'success');
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

    handleLogFood(customFood, 1);
    setShowCustomFoodModal(false);
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

  return (
    <div className="space-y-6 pb-20 text-white">
      {/* ========================================================================= */}
      {/* 🥗 CALORIE & MACRO SUITE HERO HEADER                                      */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#FF3B30]/20 text-[#FF3B30] text-[10px] font-black uppercase tracking-wider font-mono border border-[#FF3B30]/30">
              METABOLIC PRECISION
            </span>
            <span className="text-xs text-zinc-400 font-medium">Daily Macronutrient Calibration</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-1">
            Nutritional Balance & Macro Hub
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Precision macronutrient distribution, verified whole-food logging, and cellular hydration tracking.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setActiveMealCategory('breakfast');
            setShowAddFoodModal(true);
          }}
          className="px-5 py-3 rounded-full bg-white text-black hover:bg-zinc-200 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition active:scale-95"
        >
          <Plus className="w-4 h-4 text-[#FF3B30]" />
          <span>Record Meal</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 🎯 MACRO TARGET RINGS HUD                                                 */}
      {/* ========================================================================= */}
      <div className="rounded-[2.5rem] bg-[#0C0C10] border border-white/10 p-6 sm:p-8 text-white shadow-2xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Main Calorie Ring */}
          <div className="md:col-span-1 p-5 rounded-[2rem] bg-[#14141C] border border-white/5 flex flex-col items-center justify-center text-center relative">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-32 h-32 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="14" stroke="rgba(255,255,255,0.1)" strokeWidth="3" fill="none" />
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  stroke="#FF3B30"
                  strokeWidth="3.2"
                  strokeDasharray="87.96"
                  strokeDashoffset={87.96 - (87.96 * calPercentage) / 100}
                  strokeLinecap="round"
                  fill="none"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black font-mono leading-none text-white">
                  {currentMacros.calories}
                </span>
                <span className="text-[9px] font-bold text-zinc-400 uppercase mt-0.5 font-mono">
                  / {macroTargets.calories} kcal
                </span>
              </div>
            </div>
            <span className="text-xs font-black text-[#FF3B30] mt-3">
              {calRemaining > 0 ? `${calRemaining} kcal remaining` : 'Target Achieved!'}
            </span>
          </div>

          {/* 3 Macro Target Progress Bars */}
          <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Protein */}
            <div className="p-4 rounded-[2rem] bg-[#14141C] border border-white/5 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Beef className="w-3.5 h-3.5" />
                  <span>Protein</span>
                </span>
                <span className="text-xs font-mono font-black text-white">
                  {currentMacros.proteinG}g / {macroTargets.proteinG}g
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-black/50 overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-700" 
                  style={{ width: `${proteinPercentage}%` }}
                />
              </div>
              <span className="text-[10px] text-zinc-400 font-medium">
                {Math.max(0, macroTargets.proteinG - currentMacros.proteinG)}g left to hit anabolic threshold
              </span>
            </div>

            {/* Carbs */}
            <div className="p-4 rounded-[2rem] bg-[#14141C] border border-white/5 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Wheat className="w-3.5 h-3.5" />
                  <span>Carbs</span>
                </span>
                <span className="text-xs font-mono font-black text-white">
                  {currentMacros.carbsG}g / {macroTargets.carbsG}g
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-black/50 overflow-hidden">
                <div 
                  className="h-full bg-amber-500 rounded-full transition-all duration-700" 
                  style={{ width: `${carbsPercentage}%` }}
                />
              </div>
              <span className="text-[10px] text-zinc-400 font-medium">
                Glycogen replenishment fueling
              </span>
            </div>

            {/* Fats */}
            <div className="p-4 rounded-[2rem] bg-[#14141C] border border-white/5 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Cookie className="w-3.5 h-3.5" />
                  <span>Fats</span>
                </span>
                <span className="text-xs font-mono font-black text-white">
                  {currentMacros.fatG}g / {macroTargets.fatG}g
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-black/50 overflow-hidden">
                <div 
                  className="h-full bg-rose-500 rounded-full transition-all duration-700" 
                  style={{ width: `${fatPercentage}%` }}
                />
              </div>
              <span className="text-[10px] text-zinc-400 font-medium">
                Hormonal synthesis & cellular health
              </span>
            </div>
          </div>
        </div>

        {/* 💧 Hydration Tracker Bar */}
        <div className="p-4 rounded-2xl bg-[#14141C] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-black text-white block">
                Hydration Tracker: {waterMl} ml / {macroTargets.waterMl} ml
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">
                {Math.round((waterMl / macroTargets.waterMl) * 100)}% of daily cellular target
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => addWater(250)}
              className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-blue-300 text-xs font-bold transition"
            >
              +250 ml (Glass)
            </button>
            <button
              type="button"
              onClick={() => addWater(500)}
              className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-blue-200 text-xs font-bold transition"
            >
              +500 ml (Bottle)
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🍲 MEAL LOGGING SECTIONS                                                  */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        {mealCategories.map((meal) => {
          const mealEntries = foodLogs.filter(e => e.meal === meal.id);
          const mealCals = mealEntries.reduce((acc, e) => acc + Math.round(e.food.calories * e.quantity), 0);
          const mealProtein = mealEntries.reduce((acc, e) => acc + Math.round(e.food.proteinG * e.quantity), 0);

          return (
            <div
              key={meal.id}
              className="p-5 sm:p-6 rounded-[2rem] bg-[#0C0C10] border border-white/10 shadow-card space-y-3.5"
            >
              {/* Meal Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{meal.icon}</span>
                  <div>
                    <h3 className="text-base font-black text-white">{meal.label}</h3>
                    <p className="text-[11px] text-zinc-400">{meal.subtitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-white bg-white/10 px-3 py-1 rounded-full">
                    {mealCals} kcal • {mealProtein}g P
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveMealCategory(meal.id);
                      setShowAddFoodModal(true);
                    }}
                    className="p-2 rounded-full bg-white text-black hover:bg-zinc-200 text-xs font-bold flex items-center gap-1 transition"
                  >
                    <Plus className="w-4 h-4 text-[#FF3B30]" />
                    <span className="hidden sm:inline">Add Food</span>
                  </button>
                </div>
              </div>

              {/* Logged items in this meal */}
              {mealEntries.length === 0 ? (
                <div className="p-4 rounded-2xl bg-[#14141C] border border-dashed border-white/10 text-center text-xs text-zinc-500">
                  No items logged for {meal.label.toLowerCase()} yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {mealEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="p-3 rounded-2xl bg-[#14141C] hover:bg-[#181822] border border-white/5 transition flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{entry.food.name}</span>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          ({entry.quantity}x • {entry.food.servingSize})
                        </span>
                      </div>

                      <div className="flex items-center gap-3 font-mono">
                        <span className="font-bold text-white">
                          {Math.round(entry.food.calories * entry.quantity)} kcal
                        </span>
                        <span className="text-emerald-400 font-bold">
                          {Math.round(entry.food.proteinG * entry.quantity)}g P
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFoodLog(entry.id)}
                          className="p-1 text-zinc-500 hover:text-[#FF3B30] transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 🔍 ADD FOOD MODAL                                                         */}
      {/* ========================================================================= */}
      {showAddFoodModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#121218] rounded-[2rem] max-w-lg w-full p-6 shadow-2xl border border-white/10 space-y-4 max-h-[85vh] flex flex-col text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#FF3B30] bg-[#FF3B30]/10 px-2.5 py-0.5 rounded-full border border-[#FF3B30]/20 font-mono">
                  LOGGING FOR {activeMealCategory.toUpperCase()}
                </span>
                <h3 className="text-lg font-black text-white mt-1">Nutrition Food Library</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddFoodModal(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
              {['All', 'Protein', 'Grains', 'Dairy', 'Seafood', 'Fruits', 'Nuts', 'Supplements'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategoryFilter(cat)}
                  className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition ${
                    selectedCategoryFilter === cat
                      ? 'bg-white text-black'
                      : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search whole foods (e.g. Chicken, Oats, Salmon)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 p-3 rounded-xl bg-black/40 border border-white/10 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-[#FF3B30]"
              />
              <button
                type="button"
                onClick={() => setShowCustomFoodModal(true)}
                className="px-3.5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold whitespace-nowrap"
              >
                + Custom
              </button>
            </div>

            {/* Food List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredPresetFoods.map((food) => (
                <div
                  key={food.id}
                  onClick={() => handleLogFood(food, 1)}
                  className="p-3 rounded-xl bg-[#181822] hover:bg-[#20202C] border border-white/5 hover:border-white/20 transition cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-white">{food.name}</span>
                      <span className="text-[9px] font-bold text-zinc-400 px-2 py-0.5 bg-white/5 rounded-full">
                        {food.servingSize}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono mt-0.5">
                      <span>{food.calories} kcal</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-bold">{food.proteinG}g Protein</span>
                      <span>•</span>
                      <span>{food.carbsG}g Carbs</span>
                    </div>
                  </div>
                  <Plus className="w-4 h-4 text-[#FF3B30] shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ✏️ CUSTOM FOOD CREATOR MODAL                                              */}
      {/* ========================================================================= */}
      {showCustomFoodModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#121218] rounded-[2rem] max-w-sm w-full p-6 shadow-2xl border border-white/10 space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h4 className="text-sm font-black text-white">Add Custom Meal / Food</h4>
              <button
                type="button"
                onClick={() => setShowCustomFoodModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-zinc-400 block mb-1">Food Name</label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g. Lentil Bowl"
                    className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 font-bold text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-zinc-400 block mb-1">Serving Size</label>
                  <input
                    type="text"
                    value={customServing}
                    onChange={(e) => setCustomServing(e.target.value)}
                    placeholder="e.g. 1 bowl"
                    className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 font-bold text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-zinc-400 block mb-1">Calories (kcal)</label>
                  <input
                    type="number"
                    value={customCals}
                    onChange={(e) => setCustomCals(parseInt(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 font-mono font-bold text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-zinc-400 block mb-1">Protein (g)</label>
                  <input
                    type="number"
                    value={customProtein}
                    onChange={(e) => setCustomProtein(parseInt(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 font-mono font-bold text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-zinc-400 block mb-1">Carbs (g)</label>
                  <input
                    type="number"
                    value={customCarbs}
                    onChange={(e) => setCustomCarbs(parseInt(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 font-mono font-bold text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-zinc-400 block mb-1">Fat (g)</label>
                  <input
                    type="number"
                    value={customFat}
                    onChange={(e) => setCustomFat(parseInt(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 font-mono font-bold text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddCustomFood}
              className="w-full py-3 rounded-full bg-white text-black font-extrabold text-xs transition shadow-lg hover:bg-zinc-200"
            >
              Log Custom Food
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
