import React from 'react';
import { MosaicProduct } from '../../types';
import { Sparkles, ExternalLink, ShieldCheck, Plus, Zap, Award } from 'lucide-react';
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
  const { addShelfProduct, showToast } = useApp();

  if (!products || products.length === 0) {
    return null;
  }

  const handleSaveToShelf = (p: MosaicProduct) => {
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
    <div className={`space-y-4 pt-4 animate-in fade-in duration-300 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cream-200/80 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-forest-950 tracking-tight">
              {title}
            </h3>
          </div>
          <p className="text-xs text-charcoal-600 mt-1 max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        </div>
        <span className="self-start sm:self-auto text-[11px] font-bold px-3 py-1 rounded-full bg-mint-50 text-forest-900 border border-mint-200/80 shadow-xs flex items-center gap-1.5 shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Active Ingredient Match</span>
        </span>
      </div>

      {/* Large, Rich Formulation Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {products.map((p) => (
          <div
            key={p.id}
            className="group relative flex flex-col justify-between rounded-3xl bg-gradient-to-b from-white via-white to-mint-50/20 border border-cream-300 hover:border-emerald-500/30 hover:shadow-card transition-all duration-300 p-5 sm:p-6 overflow-hidden"
          >
            {/* Top Row: Visual Image + Title + Badges */}
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                {/* Large Product Image with Zoom Effect */}
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-cream-100/60 border border-cream-200/80 overflow-hidden shrink-0 group-hover:shadow-md transition">
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt={p.product}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">
                      🌿
                    </div>
                  )}
                  {p.potencyBadge && (
                    <div className="absolute bottom-1 inset-x-1 py-0.5 px-1 bg-forest-950/80 backdrop-blur-xs rounded-md text-[9px] font-bold text-mint-300 text-center truncate">
                      {p.potencyBadge}
                    </div>
                  )}
                </div>

                {/* Product Title & Brand Meta */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-forest-900 text-mint-300">
                      {p.category}
                    </span>
                    {p.bioavailabilityRating && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/60 flex items-center gap-1">
                        <Zap className="w-2.5 h-2.5 text-emerald-600" />
                        {p.bioavailabilityRating}
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm sm:text-base font-extrabold text-forest-950 leading-snug group-hover:text-forest-800 transition">
                    {p.product}
                  </h4>

                  <p className="text-xs text-charcoal-600 line-clamp-2 leading-relaxed">
                    {p.description}
                  </p>
                </div>
              </div>

              {/* Clinical Advantage Callout Box */}
              {p.clinicalAdvantage && (
                <div className="p-3 rounded-2xl bg-mint-50/80 border border-mint-200/70 text-xs text-charcoal-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-forest-950 font-bold text-[11px]">
                    <Award className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Why this formulation is superior:</span>
                  </div>
                  <p className="text-charcoal-700 text-[11px] leading-relaxed">
                    {p.clinicalAdvantage}
                  </p>
                </div>
              )}

              {/* Key Active Ingredient Pills */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-400 block">
                  Core Active Ingredients:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {p.keyIngredients.map((ing, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-xl bg-cream-100 text-charcoal-800 text-[11px] font-semibold border border-cream-200/80"
                    >
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Row: Price & Actions */}
            <div className="pt-4 mt-4 border-t border-cream-200/80 flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-charcoal-400 block font-medium">Standard Price</span>
                <span className="text-base sm:text-lg font-black text-forest-950">
                  {p.currency}{p.sitePrice}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSaveToShelf(p)}
                  className="px-3.5 py-2 rounded-2xl bg-cream-100 hover:bg-cream-200 text-forest-950 font-bold text-xs flex items-center gap-1.5 transition"
                  title="Save this product to your Smart Shelf"
                >
                  <Plus className="w-3.5 h-3.5 text-forest-900" />
                  <span className="hidden sm:inline">Add to Shelf</span>
                </button>

                <a
                  href={p.officialUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-2xl bg-forest-900 hover:bg-forest-800 text-cream-50 font-bold text-xs flex items-center gap-1.5 shadow-card transition transform active:scale-98"
                >
                  <span>View Product</span>
                  <ExternalLink className="w-3.5 h-3.5 text-mint-300" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
