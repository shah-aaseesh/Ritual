import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { RoutineStep } from '../../types';
import { MOSAIC_PRODUCTS_CATALOG } from '../../data/mosaicProducts';
import { findMatchingMosaicProducts } from '../../services/aiService';
import { ClinicalRecommendations } from '../recommendations/ClinicalRecommendations';
import { 
  Sun, 
  Moon, 
  Plus, 
  ArrowUp, 
  ArrowDown, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Circle, 
  Clock, 
  RotateCcw, 
  X
} from 'lucide-react';

export const RoutineView: React.FC = () => {
  const { 
    profile, 
    routineSteps, 
    toggleRoutineStep, 
    addRoutineStep, 
    editRoutineStep, 
    removeRoutineStep, 
    reorderRoutineSteps, 
    regenerateRoutine,
    shelfProducts
  } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingStepId, setEditingStepId] = useState<string | null>(null);

  const [formAction, setFormAction] = useState<string>('');
  const [formExplanation, setFormExplanation] = useState<string>('');
  const [formMinutes, setFormMinutes] = useState<number>(2);
  const [formTimeOfDay, setFormTimeOfDay] = useState<'morning' | 'evening'>('morning');
  const [formProductId, setFormProductId] = useState<string>('');
  const [formIsHabit, setFormIsHabit] = useState<boolean>(true);

  // Filter catalog matching user's active ingredients or primary goal
  const contextualFormulations = useMemo(() => {
    const shelfActives = shelfProducts.flatMap(p => p.activeIngredients || []);
    if (shelfActives.length > 0) {
      const matches = findMatchingMosaicProducts(shelfActives, profile.primaryGoal);
      if (matches.length > 0) return matches;
    }
    return MOSAIC_PRODUCTS_CATALOG.filter(p => p.targetGoal === profile.primaryGoal).slice(0, 2);
  }, [shelfProducts, profile.primaryGoal]);

  const morningSteps = routineSteps.filter(s => s.timeOfDay === 'morning');
  const eveningSteps = routineSteps.filter(s => s.timeOfDay === 'evening');

  const openAddModal = () => {
    setEditingStepId(null);
    setFormAction('');
    setFormExplanation('');
    setFormMinutes(2);
    setFormTimeOfDay('morning');
    setFormProductId('');
    setFormIsHabit(true);
    setIsAddModalOpen(true);
  };

  const openEditModal = (step: RoutineStep) => {
    setEditingStepId(step.id);
    setFormAction(step.action);
    setFormExplanation(step.shortExplanation);
    setFormMinutes(step.estimatedMinutes);
    setFormTimeOfDay(step.timeOfDay);
    setFormProductId(step.productId || '');
    setFormIsHabit(!!step.isProductFreeHabit);
    setIsAddModalOpen(true);
  };

  const handleSaveStepModal = () => {
    if (!formAction.trim()) return;

    const matchedShelfProd = shelfProducts.find(p => p.id === formProductId);

    if (editingStepId) {
      editRoutineStep(editingStepId, {
        action: formAction,
        shortExplanation: formExplanation,
        estimatedMinutes: Number(formMinutes) || 1,
        timeOfDay: formTimeOfDay,
        productId: matchedShelfProd ? matchedShelfProd.id : undefined,
        productName: matchedShelfProd ? matchedShelfProd.name : undefined,
        isProductFreeHabit: formIsHabit
      });
    } else {
      addRoutineStep({
        action: formAction,
        shortExplanation: formExplanation,
        estimatedMinutes: Number(formMinutes) || 1,
        timeOfDay: formTimeOfDay,
        productId: matchedShelfProd ? matchedShelfProd.id : undefined,
        productName: matchedShelfProd ? matchedShelfProd.name : undefined,
        isProductFreeHabit: formIsHabit
      });
    }
    setIsAddModalOpen(false);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= routineSteps.length) return;
    reorderRoutineSteps(index, target);
  };

  return (
    <div className="space-y-6 pb-28 animate-in fade-in duration-200 text-charcoal-900">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="px-3 py-1 rounded-full bg-mint-100 text-forest-900 text-[10px] font-extrabold uppercase tracking-wider font-mono border border-mint-200">
            Daily System
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-forest-950 tracking-tight mt-1.5">
            Routine Builder
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-600">
            Balanced morning & evening steps combining your shelf products with foundational non-commercial habits.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => regenerateRoutine(profile.primaryGoal)}
            className="p-3 rounded-full bg-cream-50 hover:bg-mint-100 text-forest-900 border border-mint-200 transition shadow-soft"
            title="Recalculate routine"
          >
            <RotateCcw className="w-4 h-4 text-forest-800" />
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-forest-900 text-white hover:bg-forest-800 font-extrabold text-xs shadow-soft transition active:scale-95"
          >
            <Plus className="w-4 h-4 text-mint-300" />
            <span>Add Step</span>
          </button>
        </div>
      </div>

      {/* Routine Overview Summary Banner */}
      <div className="p-4 rounded-2xl bg-white border border-mint-200/80 shadow-card flex items-center justify-between text-xs text-charcoal-700">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-forest-950">{routineSteps.length} Steps Total</span>
          <span className="text-charcoal-400">•</span>
          <span>{routineSteps.reduce((acc, curr) => acc + curr.estimatedMinutes, 0)} mins daily</span>
        </div>
        <span className="text-[11px] font-bold text-forest-900 bg-mint-100 px-3 py-0.5 rounded-full border border-mint-200 font-mono">
          Goal: {profile.primaryGoal.replace('_', ' ')}
        </span>
      </div>

      {/* Responsive 2-Column Grid for Morning & Evening on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* MORNING ROUTINE SECTION */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-forest-950">
              <div className="p-1.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
                <Sun className="w-4 h-4" />
              </div>
              <span className="font-black">Morning Ritual</span>
              <span className="text-xs text-charcoal-500 font-mono font-medium">({morningSteps.length} steps)</span>
            </div>
          </div>

          {morningSteps.length === 0 ? (
            <div className="p-6 rounded-[2rem] bg-white border border-dashed border-mint-200 text-center text-xs text-charcoal-500 shadow-soft">
              No morning steps. Click "Add Step" to add one.
            </div>
          ) : (
            <div className="space-y-3">
              {morningSteps.map((step) => {
                const fullIndex = routineSteps.findIndex(s => s.id === step.id);
                return (
                  <div
                    key={step.id}
                    className="p-5 rounded-[2rem] bg-white border border-mint-200/80 hover:border-mint-400 shadow-card transition-all duration-200 space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <button
                          onClick={() => toggleRoutineStep(step.id)}
                          className="mt-0.5 shrink-0 focus:outline-none"
                        >
                          {step.isCompletedToday ? (
                            <CheckCircle2 className="w-5 h-5 text-forest-900 fill-forest-100" />
                          ) : (
                            <Circle className="w-5 h-5 text-charcoal-400 hover:text-forest-800" />
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className={`text-sm font-black truncate ${step.isCompletedToday ? 'line-through text-charcoal-400' : 'text-forest-950'}`}>
                              {step.action}
                            </h4>
                            {step.isProductFreeHabit ? (
                              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-cream-50 text-charcoal-700 border border-mint-200">
                                Habit Step
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-mint-100 text-forest-800 border border-mint-200">
                                Product Step
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-charcoal-600 mt-1 leading-relaxed">
                            {step.shortExplanation}
                          </p>

                          {step.productName && (
                            <p className="text-[11px] font-bold text-forest-900 mt-1">
                              🧴 Shelf product: {step.productName}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Step Action Controls */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleMove(fullIndex, 'up')}
                          disabled={fullIndex === 0}
                          className="p-1 rounded-lg text-charcoal-400 hover:text-forest-900 disabled:opacity-20"
                          title="Move up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMove(fullIndex, 'down')}
                          disabled={fullIndex === routineSteps.length - 1}
                          className="p-1 rounded-lg text-charcoal-400 hover:text-forest-900 disabled:opacity-20"
                          title="Move down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(step)}
                          className="p-1 rounded-lg text-charcoal-400 hover:text-forest-900"
                          title="Edit step"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => removeRoutineStep(step.id)}
                          className="p-1 rounded-lg text-charcoal-400 hover:text-rose-600"
                          title="Remove step"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-charcoal-500 pt-2 border-t border-mint-100 font-mono">
                      <span className="flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3" />
                        Estimated {step.estimatedMinutes} min
                      </span>
                      <button
                        onClick={() => editRoutineStep(step.id, { timeOfDay: 'evening' })}
                        className="text-forest-900 hover:underline font-bold"
                      >
                        Switch to PM ➔
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* EVENING ROUTINE SECTION */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-forest-950">
              <div className="p-1.5 rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
                <Moon className="w-4 h-4" />
              </div>
              <span className="font-black">Evening Ritual</span>
              <span className="text-xs text-charcoal-500 font-mono font-medium">({eveningSteps.length} steps)</span>
            </div>
          </div>

          {eveningSteps.length === 0 ? (
            <div className="p-6 rounded-[2rem] bg-white border border-dashed border-mint-200 text-center text-xs text-charcoal-500 shadow-soft">
              No evening steps. Click "Add Step" to add one.
            </div>
          ) : (
            <div className="space-y-3">
              {eveningSteps.map((step) => {
                const fullIndex = routineSteps.findIndex(s => s.id === step.id);
                return (
                  <div
                    key={step.id}
                    className="p-5 rounded-[2rem] bg-white border border-mint-200/80 hover:border-mint-400 shadow-card transition-all duration-200 space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <button
                          onClick={() => toggleRoutineStep(step.id)}
                          className="mt-0.5 shrink-0 focus:outline-none"
                        >
                          {step.isCompletedToday ? (
                            <CheckCircle2 className="w-5 h-5 text-forest-900 fill-forest-100" />
                          ) : (
                            <Circle className="w-5 h-5 text-charcoal-400 hover:text-forest-800" />
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className={`text-sm font-black truncate ${step.isCompletedToday ? 'line-through text-charcoal-400' : 'text-forest-950'}`}>
                              {step.action}
                            </h4>
                            {step.isProductFreeHabit ? (
                              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-cream-50 text-charcoal-700 border border-mint-200">
                                Habit Step
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-mint-100 text-forest-800 border border-mint-200">
                                Product Step
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-charcoal-600 mt-1 leading-relaxed">
                            {step.shortExplanation}
                          </p>

                          {step.productName && (
                            <p className="text-[11px] font-bold text-forest-900 mt-1">
                              🧴 Shelf product: {step.productName}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Step Action Controls */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleMove(fullIndex, 'up')}
                          disabled={fullIndex === 0}
                          className="p-1 rounded-lg text-charcoal-400 hover:text-forest-900 disabled:opacity-20"
                          title="Move up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMove(fullIndex, 'down')}
                          disabled={fullIndex === routineSteps.length - 1}
                          className="p-1 rounded-lg text-charcoal-400 hover:text-forest-900 disabled:opacity-20"
                          title="Move down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(step)}
                          className="p-1 rounded-lg text-charcoal-400 hover:text-forest-900"
                          title="Edit step"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => removeRoutineStep(step.id)}
                          className="p-1 rounded-lg text-charcoal-400 hover:text-rose-600"
                          title="Remove step"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-charcoal-500 pt-2 border-t border-mint-100 font-mono">
                      <span className="flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3" />
                        Estimated {step.estimatedMinutes} min
                      </span>
                      <button
                        onClick={() => editRoutineStep(step.id, { timeOfDay: 'morning' })}
                        className="text-forest-900 hover:underline font-bold"
                      >
                        Switch to AM ➔
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Clinically Matched Product Formulations */}
      <div className="pt-6 border-t border-mint-200">
        <ClinicalRecommendations
          products={contextualFormulations}
          title="Evidence-Based Product Formulations"
          subtitle="Clinical formulation alternatives with high bioavailability and clean excipients for your daily routine."
        />
      </div>

      {/* Add / Edit Step Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] max-w-sm w-full p-6 shadow-modal border border-mint-200 space-y-4 text-charcoal-900">
            <div className="flex items-center justify-between border-b border-mint-100 pb-3">
              <h3 className="text-base font-black text-forest-950">
                {editingStepId ? 'Edit Routine Step' : 'Add Routine Step'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-full text-charcoal-400 hover:text-charcoal-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-charcoal-600 mb-1">Step Action Title</label>
                <input
                  type="text"
                  value={formAction}
                  onChange={(e) => setFormAction(e.target.value)}
                  placeholder="e.g. Apply 1ml Scalp Serum"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-cream-50 border border-mint-200 text-charcoal-900 font-medium focus:outline-none focus:ring-2 focus:ring-mint-500"
                />
              </div>

              <div>
                <label className="block font-bold text-charcoal-600 mb-1">Timing</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormTimeOfDay('morning')}
                    className={`py-2 rounded-xl border font-bold capitalize transition ${
                      formTimeOfDay === 'morning' ? 'bg-forest-900 text-white border-forest-900 shadow-soft' : 'bg-cream-50 text-charcoal-700 border-mint-200 hover:bg-mint-50'
                    }`}
                  >
                    ☀️ Morning
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormTimeOfDay('evening')}
                    className={`py-2 rounded-xl border font-bold capitalize transition ${
                      formTimeOfDay === 'evening' ? 'bg-forest-900 text-white border-forest-900 shadow-soft' : 'bg-cream-50 text-charcoal-700 border-mint-200 hover:bg-mint-50'
                    }`}
                  >
                    🌙 Evening
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-charcoal-600 mb-1">Estimated Minutes</label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={formMinutes}
                  onChange={(e) => setFormMinutes(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-cream-50 border border-mint-200 text-forest-950 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-mint-500"
                />
              </div>

              <div>
                <label className="block font-bold text-charcoal-600 mb-1">Link Shelf Product (Optional)</label>
                <select
                  value={formProductId}
                  onChange={(e) => {
                    setFormProductId(e.target.value);
                    if (e.target.value) setFormIsHabit(false);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-cream-50 border border-mint-200 text-charcoal-900 font-medium focus:outline-none focus:ring-2 focus:ring-mint-500"
                >
                  <option value="">None (Product-free habit step)</option>
                  {shelfProducts.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.brand})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-charcoal-600 mb-1">Short Explanation / Instructions</label>
                <textarea
                  value={formExplanation}
                  onChange={(e) => setFormExplanation(e.target.value)}
                  rows={2}
                  placeholder="Why this step matters and how to perform it..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-cream-50 border border-mint-200 text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-mint-500"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="flex-1 py-3 rounded-full bg-cream-50 text-charcoal-700 font-bold text-xs hover:bg-mint-100 border border-mint-200 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveStepModal}
                className="flex-1 py-3 rounded-full bg-forest-900 text-white font-extrabold text-xs shadow-soft hover:bg-forest-800 transition"
              >
                Save Step
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
