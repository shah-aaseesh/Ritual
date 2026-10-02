import React from 'react';
import { MosaicProduct } from '../../types';
import { Sparkles, ExternalLink, ShieldCheck, Plus, Check, Award, Zap } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ClinicalRecommendationsProps {
  products: MosaicProduct[];
  title?: string;
  subtitle?: string;
  className?: string;
}

export const ClinicalRecommendations: React.FC<ClinicalRecommendationsProps> = ({
  products,
  title = "Evidence-Based Formulation Alternatives",
  subtitle = "Based on the actives detected on your packaging, here are higher-bioavailability, clean-label clinical formulations.",
  className = ""
}) => {
  const { addShelfProduct, showToast, shelfProducts } = useApp();

  if (!products || products.length === 0) {
    return null;
  }

  const handleSaveToShelf = (p: MosaicProduct) => {
    const isAlreadyOnShelf = shelfProducts.some(sp => sp.name.toLowerCase() === p.product.toLowerCase());
    if (isAlreadyOnShelf) {
      showToast(`${p.product} is already in your Smart Shelf`, 'info');
      return;
    }

    addShelfProduct({
      name: p.product,
      brand: p.brand,
      category: p.category.includes('Hair') ? 'Hair' : p.category.includes('Sleep') || p.category.includes('Recovery') ? 'Sleep' : 'Body',
      relevantGoal: p.targetGoal,
      activeIngredients: p.keyIngredients,
      evidenceSummary: p.whyItFits,
      evidenceTier: 'strong_evidence',
      timeOfDay: p.timeOfDay,
      officialUrl: p.officialUrl
    });
    showToast(`Added ${p.product} to your Smart Shelf!`, 'success');
  };

  return (
    <div className={`space-y-4 pt-5 animate-in fade-in duration-300 ${className}`}>
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-cream-200/80 pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-forest-900 text-mint-300 flex items-center justify-center shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-mint-300" />
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-forest-950 tracking-tight">
              {title}
            </h3>
          </div>
          <p className="text-xs text-charcoal-600 mt-1 max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        </div>

        <div className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-900 text-xs font-bold shadow-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Active Ingredient Match</span>
        </div>
      </div>

      {/* Luxury Product Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {products.map((p) => {
          const isSaved = shelfProducts.some(sp => sp.name.toLowerCase() === p.product.toLowerCase());

          return (
            <div
              key={p.id}
              className="group relative flex flex-col justify-between rounded-3xl bg-white border border-cream-300 hover:border-emerald-600/40 shadow-soft hover:shadow-card transition-all duration-300 overflow-hidden"
            >
              {/* Top Hero Visual Showcase */}
              <div className="relative w-full h-48 sm:h-52 bg-gradient-to-b from-[#F9F7F2] to-[#ECE6DC] border-b border-cream-200 overflow-hidden flex items-center justify-center p-4">
                {/* Floating Category Pill */}
                <div className="absolute top-3 left-3 z-10">
                  <span className="px-2.5 py-1 rounded-full bg-forest-950/90 backdrop-blur-md text-mint-300 text-[10px] font-extrabold uppercase tracking-widest shadow-xs">
                    {p.category}
                  </span>
                </div>

                {/* Floating Bioavailability / Clinical Badge */}
                {p.bioavailabilityRating && (
                  <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md border border-emerald-500/20 text-emerald-800 text-[10px] font-extrabold shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{p.bioavailabilityRating}</span>
                  </div>
                )}

                {/* Hero Product Image */}
                {p.imageUrl ? (
                  <img
                    src={p.imageUrl}
                    alt={p.product}
                    className="max-h-full max-w-full object-contain filter drop-shadow-md group-hover:scale-105 transition-transform duration-300 ease-out"
                    loading="lazy"
                  />
                ) : (
                  <div className="text-4xl">🌿</div>
                )}

                {/* Bottom Overlay Pill: Core Potency */}
                {p.potencyBadge && (
                  <div className="absolute bottom-2.5 left-3 z-10">
                    <div className="px-2.5 py-0.5 rounded-xl bg-white/95 backdrop-blur-md border border-cream-300 text-forest-950 text-[10px] font-extrabold shadow-xs flex items-center gap-1">
                      <Zap className="w-3 h-3 text-emerald-600 fill-emerald-100" />
                      <span>{p.potencyBadge}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Middle Section: Content & Clinical Advantage */}
              <div className="p-4 sm:p-5 space-y-3.5 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  {/* Product Name & Short Explanation */}
                  <div>
                    <h4 className="text-base font-extrabold text-forest-950 leading-snug tracking-tight group-hover:text-forest-800 transition">
                      {p.product}
                    </h4>
                    <p className="text-xs text-charcoal-600 mt-1 leading-relaxed line-clamp-2">
                      {p.description}
                    </p>
                  </div>

                  {/* Clinical Formulation Edge Box */}
                  {p.clinicalAdvantage && (
                    <div className="p-3 rounded-2xl bg-mint-50/80 border-l-4 border-l-emerald-600 border-y border-r border-mint-200/70 space-y-1">
                      <div className="flex items-center gap-1.5 text-forest-950 font-bold text-[11px]">
                        <Award className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Formulation Advantage:</span>
                      </div>
                      <p className="text-charcoal-700 text-xs leading-relaxed">
                        {p.clinicalAdvantage}
                      </p>
                    </div>
                  )}

                  {/* Core Active Ingredients */}
                  <div className="space-y-1 pt-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-charcoal-400 block">
                      Active Ingredients:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {p.keyIngredients.map((ing, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-xl bg-cream-100/90 text-forest-950 text-xs font-semibold border border-cream-200/80 hover:bg-cream-200 transition"
                        >
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Section: Price & 2-Column Action Buttons */}
                <div className="pt-3.5 border-t border-cream-200/80 space-y-2.5">
                  {/* Price Row */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-charcoal-400 uppercase tracking-wider">
                      Price
                    </span>
                    <span className="text-lg sm:text-xl font-black text-forest-950">
                      {p.currency}{p.sitePrice}
                    </span>
                  </div>

                  {/* Balanced 2-Column Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleSaveToShelf(p)}
                      className={`w-full py-2.5 px-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                        isSaved
                          ? 'bg-mint-100 text-forest-900 border border-mint-300 shadow-xs'
                          : 'bg-cream-100 hover:bg-cream-200 text-forest-950 border border-cream-300/80 shadow-xs'
                      }`}
                      title="Save to Smart Shelf"
                    >
                      {isSaved ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                          <span>Saved</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5 text-forest-900" />
                          <span>Add to Shelf</span>
                        </>
                      )}
                    </button>

                    <a
                      href={p.officialUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2.5 px-3 rounded-2xl bg-forest-900 hover:bg-forest-800 text-cream-50 font-bold text-xs flex items-center justify-center gap-1.5 shadow-card transition transform active:scale-98"
                    >
                      <span>Explore</span>
                      <ExternalLink className="w-3.5 h-3.5 text-mint-300" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
