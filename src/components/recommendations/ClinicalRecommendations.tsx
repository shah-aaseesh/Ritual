import React from 'react';
import { MosaicProduct } from '../../types';
import { Sparkles, ExternalLink, ShieldCheck, Plus, Check, Award } from 'lucide-react';
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
    <div className={`space-y-5 pt-6 animate-in fade-in duration-300 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cream-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-forest-900 text-mint-300 flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4 text-mint-300" />
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-forest-950 tracking-tight">
              {title}
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-charcoal-600 mt-1.5 max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        </div>

        <div className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/70 text-emerald-900 text-xs font-bold shadow-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Active Ingredient Match</span>
        </div>
      </div>

      {/* Luxury Product Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {products.map((p) => {
          const isSaved = shelfProducts.some(sp => sp.name.toLowerCase() === p.product.toLowerCase());

          return (
            <div
              key={p.id}
              className="group relative flex flex-col justify-between rounded-3xl bg-white border border-cream-200/90 shadow-soft hover:shadow-card hover:border-emerald-600/30 transition-all duration-300 overflow-hidden"
            >
              {/* Top Section: Hero Visual Stage */}
              <div className="relative w-full h-52 sm:h-56 bg-gradient-to-b from-[#F9F7F2] to-[#F1ECE3] border-b border-cream-200/80 overflow-hidden flex items-center justify-center p-4">
                {/* Floating Category Pill */}
                <div className="absolute top-3.5 left-3.5 z-10">
                  <span className="px-3 py-1 rounded-full bg-forest-950/90 backdrop-blur-md text-mint-300 text-[10px] font-extrabold uppercase tracking-widest shadow-xs">
                    {p.category}
                  </span>
                </div>

                {/* Floating Bioavailability / Clinical Badge */}
                {p.bioavailabilityRating && (
                  <div className="absolute top-3.5 right-3.5 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md border border-emerald-500/20 text-emerald-800 text-[11px] font-bold shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
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
                  <div className="absolute bottom-3 left-3.5 z-10">
                    <div className="px-3 py-1 rounded-xl bg-white/95 backdrop-blur-md border border-cream-300/80 text-forest-950 text-[11px] font-extrabold shadow-sm flex items-center gap-1.5">
                      <span className="text-emerald-600">✦</span>
                      <span>{p.potencyBadge}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Middle Section: Content & Clinical Advantage */}
              <div className="p-5 sm:p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  {/* Title & Description */}
                  <div>
                    <h4 className="text-base sm:text-lg font-black text-forest-950 leading-snug tracking-tight group-hover:text-forest-800 transition">
                      {p.product}
                    </h4>
                    <p className="text-xs sm:text-sm text-charcoal-600 mt-1.5 leading-relaxed line-clamp-2">
                      {p.description}
                    </p>
                  </div>

                  {/* Clinical Formulation Edge */}
                  {p.clinicalAdvantage && (
                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-mint-50/90 to-cream-50/90 border border-mint-200/70 space-y-1">
                      <div className="flex items-center gap-1.5 text-forest-950 font-bold text-xs">
                        <Award className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Formulation Advantage:</span>
                      </div>
                      <p className="text-charcoal-700 text-xs leading-relaxed">
                        {p.clinicalAdvantage}
                      </p>
                    </div>
                  )}

                  {/* Core Active Ingredients */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-charcoal-400 block">
                      Active Ingredients:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {p.keyIngredients.map((ing, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-xl bg-cream-100/80 text-forest-950 text-xs font-semibold border border-cream-200/80 hover:bg-cream-200 transition"
                        >
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Section: Price & Wide Action Buttons */}
                <div className="pt-5 mt-4 border-t border-cream-200/80 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-charcoal-400 uppercase tracking-wider block">
                      PRICE
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-forest-950">
                      {p.currency}{p.sitePrice}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleSaveToShelf(p)}
                      className={`px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-1.5 transition whitespace-nowrap ${
                        isSaved
                          ? 'bg-mint-100 text-forest-900 border border-mint-300'
                          : 'bg-cream-100 hover:bg-cream-200 text-forest-950 border border-cream-300/80'
                      }`}
                      title="Save this product to your Smart Shelf"
                    >
                      {isSaved ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                          <span>Saved</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 text-forest-900" />
                          <span>Add to Shelf</span>
                        </>
                      )}
                    </button>

                    <a
                      href={p.officialUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2.5 rounded-2xl bg-forest-900 hover:bg-forest-800 text-cream-50 font-bold text-xs flex items-center gap-1.5 shadow-card transition transform active:scale-98 whitespace-nowrap"
                    >
                      <span>View Product</span>
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
