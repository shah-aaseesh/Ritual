import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShelfProduct, WellnessGoal } from '../../types';
import { 
  Plus, 
  Layers, 
  AlertTriangle, 
  Trash2, 
  Edit3, 
  Sun, 
  Moon, 
  ExternalLink, 
  Sparkles, 
  Calendar,
  X,
  Search
} from 'lucide-react';

export const SmartShelfView: React.FC = () => {
  const { 
    shelfProducts, 
    addShelfProduct, 
    editShelfProduct, 
    removeShelfProduct, 
    duplicateAlerts,
    setActiveTab,
    profile
  } = useApp();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Hair' | 'Body' | 'Sleep'>('All');
  
  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const [formName, setFormName] = useState<string>('');
  const [formBrand, setFormBrand] = useState<string>('');
  const [formCategory, setFormCategory] = useState<'Hair' | 'Body' | 'Sleep' | 'Face' | 'General'>('Hair');
  const [formGoal, setFormGoal] = useState<WellnessGoal>(profile.primaryGoal);
  const [formIngredients, setFormIngredients] = useState<string>('');
  const [formSummary, setFormSummary] = useState<string>('');
  const [formTimeOfDay, setFormTimeOfDay] = useState<'morning' | 'evening' | 'both'>('evening');
  const [formOfficialUrl, setFormOfficialUrl] = useState<string>('');

  const openAddModal = () => {
    setEditingProductId(null);
    setFormName('');
    setFormBrand('');
    setFormCategory('Hair');
    setFormGoal(profile.primaryGoal);
    setFormIngredients('');
    setFormSummary('Formulated with active botanicals and targeted carrier ingredients.');
    setFormTimeOfDay('evening');
    setFormOfficialUrl('');
    setIsModalOpen(true);
  };

  const openEditModal = (prod: ShelfProduct) => {
    setEditingProductId(prod.id);
    setFormName(prod.name);
    setFormBrand(prod.brand);
    setFormCategory(prod.category);
    setFormGoal(prod.relevantGoal);
    setFormIngredients(prod.activeIngredients.join(', '));
    setFormSummary(prod.evidenceSummary);
    setFormTimeOfDay(prod.timeOfDay);
    setFormOfficialUrl(prod.officialUrl || '');
    setIsModalOpen(true);
  };

  const handleSaveModal = () => {
    if (!formName.trim()) return;

    const actives = formIngredients
      .split(',')
      .map(i => i.trim())
      .filter(i => i.length > 0);

    if (editingProductId) {
      editShelfProduct(editingProductId, {
        name: formName,
        brand: formBrand || 'Custom Brand',
        category: formCategory,
        relevantGoal: formGoal,
        activeIngredients: actives.length > 0 ? actives : ['Active Complex'],
        evidenceSummary: formSummary,
        timeOfDay: formTimeOfDay,
        officialUrl: formOfficialUrl || undefined
      });
    } else {
      addShelfProduct({
        name: formName,
        brand: formBrand || 'Custom Brand',
        category: formCategory,
        relevantGoal: formGoal,
        activeIngredients: actives.length > 0 ? actives : ['Active Complex'],
        evidenceSummary: formSummary,
        evidenceTier: 'promising_limited',
        timeOfDay: formTimeOfDay,
        officialUrl: formOfficialUrl || undefined
      });
    }
    setIsModalOpen(false);
  };

  const filteredProducts = shelfProducts.filter(prod => {
    const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.activeIngredients.some(i => i.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFilter = selectedFilter === 'All' || prod.category.toLowerCase().includes(selectedFilter.toLowerCase());
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 pb-28 animate-in fade-in duration-200 text-charcoal-900">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="px-3 py-1 rounded-full bg-mint-100 text-forest-900 text-[10px] font-extrabold uppercase tracking-wider font-mono border border-mint-200">
            Cabinet Inventory
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-forest-950 tracking-tight mt-1.5">
            Smart Shelf
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-600">
            Keep track of what you own, observe duplicate actives, and feed your daily routines.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-forest-900 text-white hover:bg-forest-800 font-extrabold text-xs shadow-soft transition active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 text-mint-300" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Neutral Duplication Alerts Banner */}
      {duplicateAlerts.length > 0 && (
        <div className="p-5 rounded-[2rem] bg-amber-50/80 border border-amber-200 shadow-card space-y-2">
          <div className="flex items-center gap-2 text-amber-900 font-extrabold text-xs uppercase tracking-wider font-mono">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Active Ingredient Duplication Check</span>
          </div>
          <div className="space-y-1.5 text-xs text-charcoal-800">
            {duplicateAlerts.map((alert, idx) => (
              <p key={idx} className="bg-white p-3 rounded-xl border border-amber-100 leading-relaxed shadow-sm">
                <strong className="text-forest-950">{alert.ingredientName}:</strong> {alert.neutralMessage}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved products or ingredients..."
            className="w-full pl-10 pr-4 py-3 rounded-full bg-white border border-mint-200 text-xs sm:text-sm text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:ring-2 focus:ring-mint-500 shadow-soft"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar shrink-0">
          {(['All', 'Hair', 'Body', 'Sleep'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedFilter(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition shrink-0 ${
                selectedFilter === cat
                  ? 'bg-forest-900 text-white font-extrabold shadow-soft'
                  : 'bg-white text-charcoal-600 hover:text-forest-900 border border-mint-200 shadow-soft'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Shelf Product Cards */}
      {shelfProducts.length === 0 ? (
        <div className="p-8 rounded-[2.5rem] bg-white border border-mint-200/80 text-center space-y-3 shadow-card">
          <div className="w-12 h-12 rounded-2xl bg-mint-100 text-forest-900 flex items-center justify-center mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-forest-950">Your Smart Shelf is empty</h3>
            <p className="text-xs text-charcoal-600 mt-1 max-w-xs mx-auto leading-relaxed">
              Scan your products using Label Lens or add items manually to start organizing your routine.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('labellens')}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-forest-900 text-white text-xs font-extrabold shadow-soft hover:bg-forest-800 transition"
          >
            <Sparkles className="w-4 h-4 text-mint-300" />
            <span>Scan with Label Lens</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((prod) => (
            <div
              key={prod.id}
              className="p-6 rounded-[2rem] bg-white hover:bg-mint-50/20 border border-mint-200/80 hover:border-mint-400 shadow-card transition-all duration-300 space-y-4 flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-forest-700 font-mono">
                      {prod.brand}
                    </span>
                    <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-cream-50 text-charcoal-700 border border-mint-200">
                      {prod.category}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-mint-100 text-forest-800 border border-mint-200">
                      {prod.timeOfDay === 'morning' ? <Sun className="w-3 h-3 text-amber-600" /> : prod.timeOfDay === 'evening' ? <Moon className="w-3 h-3 text-teal-700" /> : <Sparkles className="w-3 h-3 text-forest-800" />}
                      <span className="capitalize">{prod.timeOfDay}</span>
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-forest-950 mt-1.5 leading-snug">
                    {prod.name}
                  </h3>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => openEditModal(prod)}
                    className="p-1.5 rounded-xl text-charcoal-400 hover:text-forest-900 hover:bg-mint-50 transition"
                    title="Edit product"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeShelfProduct(prod.id)}
                    className="p-1.5 rounded-xl text-charcoal-400 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Remove from shelf"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Active Ingredients Badges */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-charcoal-500 block font-mono">
                  Key Actives:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {prod.activeIngredients.map((ing, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-xl bg-cream-50/70 text-forest-950 border border-mint-200 text-xs font-semibold"
                    >
                      {ing}
                    </span>
                  ))}
                </div>
              </div>

              {/* Evidence Overview */}
              <div className="p-3.5 rounded-2xl bg-cream-50/70 border border-mint-100 text-xs text-charcoal-700 leading-relaxed">
                <div className="flex items-center gap-1.5 font-bold text-forest-950 mb-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-forest-800" />
                  <span>Evidence Overview</span>
                </div>
                <p className="text-charcoal-600">{prod.evidenceSummary}</p>
              </div>

              {/* Footer info: Date Added + External Link */}
              <div className="flex items-center justify-between text-[11px] text-charcoal-500 pt-2 border-t border-mint-100 font-mono">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Added {prod.dateAdded}
                </span>

                {prod.officialUrl && (
                  <a
                    href={prod.officialUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 font-bold text-forest-900 hover:underline transition"
                  >
                    <span>Product info</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] max-w-sm w-full p-6 shadow-modal border border-mint-200 space-y-4 max-h-[90vh] overflow-y-auto text-charcoal-900">
            <div className="flex items-center justify-between border-b border-mint-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-mint-100 flex items-center justify-center text-forest-900 border border-mint-200">
                  <Layers className="w-4 h-4 text-forest-800" />
                </div>
                <h3 className="text-base font-black text-forest-950">
                  {editingProductId ? 'Edit Shelf Product' : 'Add Product to Shelf'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-charcoal-400 hover:text-charcoal-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-charcoal-600 mb-1">Product Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. 2% Salicylic Acid Body Wash"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-cream-50 border border-mint-200 text-charcoal-900 font-medium focus:outline-none focus:ring-2 focus:ring-mint-500"
                />
              </div>

              <div>
                <label className="block font-bold text-charcoal-600 mb-1">Brand Name</label>
                <input
                  type="text"
                  value={formBrand}
                  onChange={(e) => setFormBrand(e.target.value)}
                  placeholder="e.g. DermaCure, Be Bodywise"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-cream-50 border border-mint-200 text-charcoal-900 font-medium focus:outline-none focus:ring-2 focus:ring-mint-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-charcoal-600 mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-cream-50 border border-mint-200 text-charcoal-900 font-medium focus:outline-none focus:ring-2 focus:ring-mint-500"
                  >
                    <option value="Hair">Hair</option>
                    <option value="Body">Body</option>
                    <option value="Sleep">Sleep</option>
                    <option value="Face">Face</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-charcoal-600 mb-1">Timing</label>
                  <select
                    value={formTimeOfDay}
                    onChange={(e) => setFormTimeOfDay(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-cream-50 border border-mint-200 text-charcoal-900 font-medium focus:outline-none focus:ring-2 focus:ring-mint-500"
                  >
                    <option value="morning">Morning</option>
                    <option value="evening">Evening</option>
                    <option value="both">Both AM/PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-charcoal-600 mb-1">
                  Active Ingredients (comma-separated)
                </label>
                <input
                  type="text"
                  value={formIngredients}
                  onChange={(e) => setFormIngredients(e.target.value)}
                  placeholder="e.g. Salicylic Acid (2%), Niacinamide"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-cream-50 border border-mint-200 text-charcoal-900 font-medium focus:outline-none focus:ring-2 focus:ring-mint-500"
                />
              </div>

              <div>
                <label className="block font-bold text-charcoal-600 mb-1">Evidence Summary / Notes</label>
                <textarea
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  rows={2}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-cream-50 border border-mint-200 text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-mint-500"
                />
              </div>

              <div>
                <label className="block font-bold text-charcoal-600 mb-1">Official Product URL (Optional)</label>
                <input
                  type="url"
                  value={formOfficialUrl}
                  onChange={(e) => setFormOfficialUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-cream-50 border border-mint-200 text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-mint-500"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3 rounded-full bg-cream-50 text-charcoal-700 font-bold text-xs hover:bg-mint-100 border border-mint-200 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveModal}
                className="flex-1 py-3 rounded-full bg-forest-900 text-white font-extrabold text-xs shadow-soft hover:bg-forest-800 transition"
              >
                {editingProductId ? 'Update' : 'Add to Shelf'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
