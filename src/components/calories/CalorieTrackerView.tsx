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
      category: 'Custom'
    };

    handleLogFood(customFood, 1);
    setShowCustomFoodModal(false);
    setCustomName('');
  };

  const removeFoodLog = (id: string) => {
    setFoodLogs(prev => prev.filter(item => item.id !== id));
  };

  const addWater = (ml: number) => {
    setWaterMl(prev => Math.min(6000, prev + ml));
    showToast(`💧 Added ${ml}ml water intake`, 'info');
  };

  const mealCategories: { id: MealCategory; label: string; icon: string; subtitle: string }[] = [
    { id: 'breakfast', label: 'Breakfast', icon: '🍳', subtitle: 'Start with high bioavailable protein' },
    { id: 'lunch', label: 'Lunch', icon: '🥗', subtitle: 'Complex carbs & lean protein matrix' },
    { id: 'dinner', label: 'Dinner', icon: '🍲', subtitle: 'Light digestible recovery meal' },
    { id: 'snacks', label: 'Snacks & Pre/Post Workout', icon: '🍎', subtitle: 'Fruit, nuts, shakes' }
  ];

  const filteredPresetFoods = PRESET_FOODS.filter(food => {
    const matchesSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategoryFilter === 'All' || food.category === selectedCategoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 pb-20">
      {/* ========================================================================= */}
      {/* 🥗 CALORIE & MACRO SUITE HERO HEADER                                      */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black uppercase tracking-wider font-mono">
              HEALTH SUITE • NUTRITION
            </span>
            <span className="text-xs font-bold text-charcoal-400">Precision Macro & Calorie Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-forest-950 tracking-tight mt-1">
            Nutrition & Macro Hub
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-600">
            Log daily nutrition, balance protein ratios, and maintain optimal clinical hydration.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setActiveMealCategory('breakfast');
            setShowAddFoodModal(true);
          }}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-forest-950 to-forest-900 text-cream-50 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-card hover:scale-[1.02] active:scale-95 transition"
        >
          <Plus className="w-4 h-4 text-mint-300 stroke-[3]" />
          <span>Quick Log Meal</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 🎯 MACRO TARGET RINGS HUD                                                 */}
      {/* ========================================================================= */}
      <div className="rounded-3xl bg-gradient-to-br from-forest-950 via-forest-900 to-forest-950 border border-emerald-500/30 p-5 sm:p-6 text-cream-50 shadow-card relative overflow-hidden space-y-5">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/5 to-transparent animate-shimmer-sweep pointer-events-none" />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10">
          {/* Main Calorie Ring */}
          <div className="md:col-span-1 p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center text-center relative">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-28 h-28 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="14" stroke="rgba(255,255,255,0.1)" strokeWidth="3" fill="none" />
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  stroke="#10B981"
                  strokeWidth="3"
                  strokeDasharray="87.96"
                  strokeDashoffset={87.96 - (87.96 * calPercentage) / 100}
                  strokeLinecap="round"
                  fill="none"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-black font-mono leading-none text-white">
                  {currentMacros.calories}
                </span>
                <span className="text-[9px] font-bold text-cream-300 uppercase mt-0.5">
                  / {macroTargets.calories} kcal
                </span>
              </div>
            </div>
            <span className="text-xs font-black text-emerald-400 mt-2">
              {calRemaining > 0 ? `${calRemaining} kcal remaining` : 'Target Achieved!'}
            </span>
          </div>

          {/* 3 Macro Target Progress Bars */}
          <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Protein */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Beef className="w-3.5 h-3.5" />
                  <span>Protein</span>
                </span>
                <span className="text-xs font-mono font-black text-emerald-400">
                  {currentMacros.proteinG}g / {macroTargets.proteinG}g
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-700" 
                  style={{ width: `${proteinPercentage}%` }}
                />
              </div>
              <span className="text-[10px] text-cream-300 font-medium">
                {Math.max(0, macroTargets.proteinG - currentMacros.proteinG)}g left to hit anabolic threshold
              </span>
            </div>

            {/* Carbs */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Wheat className="w-3.5 h-3.5" />
                  <span>Carbs</span>
                </span>
                <span className="text-xs font-mono font-black text-amber-400">
                  {currentMacros.carbsG}g / {macroTargets.carbsG}g
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden">
                <div 
                  className="h-full bg-amber-500 rounded-full transition-all duration-700" 
                  style={{ width: `${carbsPercentage}%` }}
                />
              </div>
              <span className="text-[10px] text-cream-300 font-medium">
                Glycogen replenishment fueling
              </span>
            </div>

            {/* Fats */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Cookie className="w-3.5 h-3.5" />
                  <span>Fats</span>
                </span>
                <span className="text-xs font-mono font-black text-rose-400">
                  {currentMacros.fatG}g / {macroTargets.fatG}g
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden">
                <div 
                  className="h-full bg-rose-500 rounded-full transition-all duration-700" 
                  style={{ width: `${fatPercentage}%` }}
                />
              </div>
              <span className="text-[10px] text-cream-300 font-medium">
                Hormonal synthesis & cellular health
              </span>
            </div>
          </div>
        </div>

        {/* 💧 Hydration Tracker Bar */}
        <div className="p-3.5 rounded-2xl bg-blue-950/60 border border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Droplets className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-black text-blue-200 block">
                Hydration Tracker: {waterMl} ml / {macroTargets.waterMl} ml
              </span>
              <span className="text-[10px] text-blue-300/80">
                {Math.round((waterMl / macroTargets.waterMl) * 100)}% of daily cellular target
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => addWater(250)}
              className="px-3 py-1 rounded-xl bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 text-xs font-bold transition"
            >
              +250 ml (Glass)
            </button>
            <button
              type="button"
              onClick={() => addWater(500)}
              className="px-3 py-1 rounded-xl bg-blue-500/30 hover:bg-blue-500/50 text-blue-200 text-xs font-bold transition"
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
              className="p-4 sm:p-5 rounded-3xl bg-white border border-cream-200 shadow-soft space-y-3"
            >
              {/* Meal Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{meal.icon}</span>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-forest-950">{meal.label}</h3>
                    <p className="text-[11px] text-charcoal-500">{meal.subtitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-forest-900 bg-cream-100 px-2.5 py-1 rounded-xl">
                    {mealCals} kcal • {mealProtein}g P
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveMealCategory(meal.id);
                      setShowAddFoodModal(true);
                    }}
                    className="p-1.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-cream-50 text-xs font-bold flex items-center gap-1 transition"
                  >
                    <Plus className="w-4 h-4 text-mint-300" />
                    <span className="hidden sm:inline">Add Food</span>
                  </button>
                </div>
              </div>

              {/* Logged items in this meal */}
              {mealEntries.length === 0 ? (
                <div className="p-3 rounded-2xl bg-cream-50/60 border border-dashed border-cream-200 text-center text-xs text-charcoal-400">
                  No items logged for {meal.label.toLowerCase()} yet.
                </div>
              ) : (
                <div className="space-y-1.5">
                  {mealEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="p-2.5 rounded-2xl bg-cream-50 hover:bg-cream-100/80 border border-cream-200 transition flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-forest-950">{entry.food.name}</span>
                        <span className="text-[10px] text-charcoal-500 font-mono">
                          ({entry.quantity}x • {entry.food.servingSize})
                        </span>
                      </div>

                      <div className="flex items-center gap-3 font-mono">
                        <span className="font-bold text-forest-950">
                          {Math.round(entry.food.calories * entry.quantity)} kcal
                        </span>
                        <span className="text-emerald-700 font-bold">
                          {Math.round(entry.food.proteinG * entry.quantity)}g P
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFoodLog(entry.id)}
                          className="p-1 text-charcoal-400 hover:text-rose-600 transition"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-cream-300 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-cream-200 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  LOGGING FOR {activeMealCategory.toUpperCase()}
                </span>
                <h3 className="text-lg font-black text-forest-950 mt-1">Nutrition Food Library</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddFoodModal(false)}
                className="p-1 rounded-full text-charcoal-400 hover:text-forest-900"
              >
                ✕
              </button>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {['All', 'Protein', 'Grains', 'Dairy', 'Seafood', 'Fruits', 'Nuts', 'Supplements'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition ${
                    selectedCategoryFilter === cat
                      ? 'bg-forest-900 text-cream-50'
                      : 'bg-cream-100 text-charcoal-700 hover:bg-cream-200'
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
                className="flex-1 p-2.5 rounded-xl bg-cream-50 border border-cream-300 text-xs font-bold text-forest-950 focus:outline-none focus:ring-1 focus:ring-forest-900"
              />
              <button
                type="button"
                onClick={() => setShowCustomFoodModal(true)}
                className="px-3 py-2.5 rounded-xl bg-cream-200 hover:bg-cream-300 text-forest-950 text-xs font-bold whitespace-nowrap"
              >
                + Custom Food
              </button>
            </div>

            {/* Food List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredPresetFoods.map((food) => (
                <div
                  key={food.id}
                  onClick={() => handleLogFood(food, 1)}
                  className="p-3 rounded-2xl bg-cream-50 hover:bg-emerald-50 border border-cream-200 hover:border-emerald-300 transition cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-forest-950">{food.name}</span>
                      <span className="text-[9px] font-bold text-charcoal-500 px-2 py-0.5 bg-white rounded-full border border-cream-200">
                        {food.servingSize}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-charcoal-600 font-mono mt-0.5">
                      <span>{food.calories} kcal</span>
                      <span>•</span>
                      <span className="text-emerald-700 font-bold">{food.proteinG}g Protein</span>
                      <span>•</span>
                      <span>{food.carbsG}g Carbs</span>
                      <span>•</span>
                      <span>{food.fatG}g Fat</span>
                    </div>
                  </div>
                  <Plus className="w-4 h-4 text-emerald-700 shrink-0" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-cream-300 space-y-3.5">
            <div className="flex items-center justify-between border-b border-cream-200 pb-2">
              <h4 className="text-sm font-black text-forest-950">Add Custom Meal / Food</h4>
              <button
                type="button"
                onClick={() => setShowCustomFoodModal(false)}
                className="text-charcoal-400 hover:text-forest-900"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-charcoal-700 block mb-0.5">Food Name</label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g. Lentil Bowl"
                    className="w-full p-2 rounded-xl bg-cream-50 border border-cream-300 font-bold text-forest-950 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-charcoal-700 block mb-0.5">Serving Size</label>
                  <input
                    type="text"
                    value={customServing}
                    onChange={(e) => setCustomServing(e.target.value)}
                    placeholder="e.g. 1 bowl (200g)"
                    className="w-full p-2 rounded-xl bg-cream-50 border border-cream-300 font-bold text-forest-950 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-charcoal-700 block mb-0.5">Calories (kcal)</label>
                  <input
                    type="number"
                    value={customCals}
                    onChange={(e) => setCustomCals(parseInt(e.target.value) || 0)}
                    className="w-full p-2 rounded-xl bg-cream-50 border border-cream-300 font-mono font-bold text-forest-950 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-charcoal-700 block mb-0.5">Protein (g)</label>
                  <input
                    type="number"
                    value={customProtein}
                    onChange={(e) => setCustomProtein(parseInt(e.target.value) || 0)}
                    className="w-full p-2 rounded-xl bg-cream-50 border border-cream-300 font-mono font-bold text-forest-950 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-charcoal-700 block mb-0.5">Carbs (g)</label>
                  <input
                    type="number"
                    value={customCarbs}
                    onChange={(e) => setCustomCarbs(parseInt(e.target.value) || 0)}
                    className="w-full p-2 rounded-xl bg-cream-50 border border-cream-300 font-mono font-bold text-forest-950 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-charcoal-700 block mb-0.5">Fat (g)</label>
                  <input
                    type="number"
                    value={customFat}
                    onChange={(e) => setCustomFat(parseInt(e.target.value) || 0)}
                    className="w-full p-2 rounded-xl bg-cream-50 border border-cream-300 font-mono font-bold text-forest-950 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddCustomFood}
              className="w-full py-2.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-cream-50 text-xs font-bold transition shadow-soft"
            >
              Log Custom Food
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
