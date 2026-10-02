import React, { useState } from 'react';
import { 
  Check, 
  X, 
  RotateCcw, 
  Sparkles, 
  ExternalLink, 
  ShieldCheck, 
  Eye
} from 'lucide-react';
import { ProductAnalysisResult, DetectedIngredient, EvidenceTier } from '../../types';

interface IngredientDebunkPaperProps {
  productName: string;
  brand?: string;
  rawIngredientText: string;
  analysis: ProductAnalysisResult;
  onReplay?: () => void;
}

interface ParsedItem {
  id: string;
  rawText: string;
  cleanName: string;
  isActive: boolean;
  tier?: EvidenceTier;
  purpose?: string;
  explanation?: string;
  sourceUrl?: string;
  hasDose?: boolean;
  doseText?: string;
  isStruckThrough: boolean;
  strikeReason?: string;
}

export const IngredientDebunkPaper: React.FC<IngredientDebunkPaperProps> = ({
  productName,
  brand,
  rawIngredientText,
  analysis,
}) => {
  const [animationStep, setAnimationStep] = useState<'writing' | 'analyzing' | 'debunked'>('debunked');
  const [activeFilter, setActiveFilter] = useState<'all' | 'actives' | 'fillers'>('all');
  const [selectedItem, setSelectedItem] = useState<ParsedItem | null>(null);
  const [displayedCount, setDisplayedCount] = useState<number>(100);

  // Parse items from raw ingredient text and match with detected ingredients
  const parsedItems: ParsedItem[] = React.useMemo(() => {
    if (!rawIngredientText || rawIngredientText.trim().length === 0) {
      return [];
    }

    // Split raw ingredient text
    const rawTokens = rawIngredientText
      .split(/[,;\n•·|]/)
      .map(t => t.trim())
      .filter(t => t.length > 1 && !/^(ingredients|contains|active ingredients|inactive ingredients):?$/i.test(t));

    const detectedMap = new Map<string, DetectedIngredient>();
    analysis.detectedIngredients.forEach(d => {
      detectedMap.set(d.ingredient.name.toLowerCase(), d);
      d.ingredient.aliases.forEach(a => detectedMap.set(a.toLowerCase(), d));
    });

    const items: ParsedItem[] = [];
    const seen = new Set<string>();

    for (let i = 0; i < rawTokens.length; i++) {
      const token = rawTokens[i];
      const norm = token.toLowerCase();

      // Check if duplicate
      if (seen.has(norm)) continue;
      seen.add(norm);

      // Match against detected ingredients
      let matchedDetected: DetectedIngredient | undefined;
      for (const [key, d] of detectedMap.entries()) {
        if (norm.includes(key) || key.includes(norm)) {
          matchedDetected = d;
          break;
        }
      }

      if (matchedDetected) {
        const tier = matchedDetected.ingredient.evidenceTier;
        const isSupportingCarrier = tier === 'supporting_ingredient';
        
        items.push({
          id: `item-${i}`,
          rawText: token,
          cleanName: matchedDetected.ingredient.name,
          isActive: !isSupportingCarrier,
          tier: tier,
          purpose: matchedDetected.ingredient.commonPurpose,
          explanation: matchedDetected.explanation,
          sourceUrl: matchedDetected.ingredient.sourceUrl,
          hasDose: matchedDetected.doesLabelDiscloseDose,
          isStruckThrough: isSupportingCarrier,
          strikeReason: isSupportingCarrier ? 'Carrier / Solvent / Texture Matrix' : undefined
        });
      } else {
        // Filler, fragrance, preservative, or unverified item
        const isPreservativeOrSolvent = /water|aqua|glycerin|phenoxyethanol|alcohol|fragrance|parfum|citric|edta|pectin|sugar|glucose|triglyceride/i.test(norm);
        
        items.push({
          id: `item-${i}`,
          rawText: token,
          cleanName: token.replace(/\(.*\)/, '').trim(),
          isActive: false,
          isStruckThrough: true,
          strikeReason: isPreservativeOrSolvent ? 'Excipient / Solvent / Base Carrier' : 'Unverified Marketing Claim / Trace Additive'
        });
      }
    }

    return items;
  }, [rawIngredientText, analysis]);

  // Handle animation sequence
  const startDebunkAnimation = () => {
    setAnimationStep('writing');
    setDisplayedCount(0);

    const total = parsedItems.length;
    let current = 0;

    const writeInterval = setInterval(() => {
      current += 1;
      setDisplayedCount(current);
      if (current >= total) {
        clearInterval(writeInterval);
        setAnimationStep('analyzing');

        setTimeout(() => {
          setAnimationStep('debunked');
        }, 600);
      }
    }, 45);
  };

  const provenActivesCount = parsedItems.filter(p => p.isActive).length;
  const fillersCount = parsedItems.filter(p => p.isStruckThrough).length;

  const visibleItems = parsedItems.filter(item => {
    if (activeFilter === 'actives') return item.isActive;
    if (activeFilter === 'fillers') return item.isStruckThrough;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Top Controls & Metrics Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        {/* Minimalist Filter Pill Group */}
        <div className="inline-flex p-1 bg-cream-200/70 rounded-2xl border border-cream-300 text-xs">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              activeFilter === 'all'
                ? 'bg-forest-900 text-cream-50 shadow-sm'
                : 'text-charcoal-700 hover:text-forest-950'
            }`}
          >
            All Items ({parsedItems.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('actives')}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
              activeFilter === 'actives'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-emerald-900 hover:text-emerald-950'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Proven Actives ({provenActivesCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('fillers')}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
              activeFilter === 'fillers'
                ? 'bg-coral-700 text-white shadow-sm'
                : 'text-coral-800 hover:text-coral-950'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-coral-400" />
            <span>Struck Fillers ({fillersCount})</span>
          </button>
        </div>

        {/* Replay Scan Button */}
        <button
          type="button"
          onClick={startDebunkAnimation}
          className="px-3 py-1.5 rounded-xl bg-white hover:bg-cream-100 border border-cream-300 text-charcoal-700 text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
          title="Replay visual audit"
        >
          <RotateCcw className="w-3.5 h-3.5 text-forest-800" />
          <span>Replay Audit</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* THE CLINICAL DEBUNK PAPER SLIP                                            */}
      {/* ========================================================================= */}
      <div className="relative rounded-3xl bg-[#FDFBF7] border border-amber-900/15 shadow-xl overflow-hidden p-6 sm:p-8 font-sans">
        
        {/* Subtle Paper Notebook Header Stamp */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-dashed border-amber-900/20">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-900/60 font-mono">
                LAB VERIFICATION REPORT
              </span>
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-amber-900/10 text-amber-950 font-bold font-mono">
                Rx AUDIT
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-forest-950 tracking-tight">
              {productName}
            </h3>
            {brand && (
              <p className="text-xs text-charcoal-500 font-medium">
                Brand: <span className="font-semibold text-charcoal-800">{brand}</span>
              </p>
            )}
          </div>

          <div className="text-right">
            <span className="text-[11px] font-bold text-forest-900 block font-mono">
              {provenActivesCount} / {parsedItems.length} Actives
            </span>
            <span className="text-[10px] text-charcoal-500">
              {fillersCount} Carriers Excluded
            </span>
          </div>
        </div>

        {/* Dynamic Scanning State Banner */}
        {animationStep === 'analyzing' && (
          <div className="mb-4 p-3 rounded-2xl bg-forest-950 text-mint-300 text-xs font-bold flex items-center justify-center gap-2 animate-pulse">
            <Sparkles className="w-4 h-4 animate-spin text-mint-400" />
            <span>Auditing chemical compounds against clinical dermatology literature...</span>
          </div>
        )}

        {/* Paper Body: Items Grid with Strikethroughs & Active Badges */}
        <div className="space-y-2.5 min-h-[160px]">
          {visibleItems.length === 0 ? (
            <p className="text-xs text-charcoal-400 italic py-6 text-center">
              No ingredients match the selected filter.
            </p>
          ) : (
            visibleItems.map((item, idx) => {
              if (animationStep === 'writing' && idx >= displayedCount) {
                return null;
              }

              const isDebunked = animationStep === 'debunked';
              const isStruck = isDebunked && item.isStruckThrough;
              const isProven = isDebunked && item.isActive;

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`group relative p-3 rounded-2xl border transition-all duration-300 cursor-pointer flex items-center justify-between gap-3 ${
                    isProven
                      ? 'bg-emerald-50/80 border-emerald-300 hover:border-emerald-500 shadow-sm'
                      : isStruck
                      ? 'bg-amber-900/[0.02] border-transparent hover:bg-coral-50/40 hover:border-coral-200'
                      : 'bg-white border-cream-200'
                  }`}
                >
                  {/* Left Column: Ingredient Name with Animated Strikethrough */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-xs sm:text-sm font-bold tracking-tight transition-all duration-300 ${
                          isProven
                            ? 'text-emerald-950 font-extrabold'
                            : isStruck
                            ? 'text-charcoal-400 line-through decoration-coral-500/80 decoration-2'
                            : 'text-charcoal-900'
                        }`}
                      >
                        {item.rawText}
                      </span>

                      {/* Proven Active Badge */}
                      {isProven && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-xs">
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>Clinically Proven</span>
                        </span>
                      )}

                      {/* Struck Reason Badge */}
                      {isStruck && item.strikeReason && (
                        <span className="text-[10px] font-semibold text-coral-700/80 bg-coral-50 px-2 py-0.5 rounded-md border border-coral-200/60">
                          {item.strikeReason}
                        </span>
                      )}
                    </div>

                    {/* Purpose explanation if proven */}
                    {isProven && item.purpose && (
                      <p className="text-[11px] text-emerald-900 font-medium mt-0.5 line-clamp-1">
                        {item.purpose}
                      </p>
                    )}
                  </div>

                  {/* Right Action: Evidence Tag / PubMed Icon */}
                  <div className="shrink-0 flex items-center gap-1.5">
                    {item.sourceUrl && (
                      <a
                        href={item.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded-lg text-emerald-800 hover:bg-emerald-200/60 transition"
                        title="View published clinical trial on PubMed"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      type="button"
                      className="text-xs text-charcoal-400 group-hover:text-forest-900 transition p-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Paper Footer: Clinical Synthesis Verdict */}
        <div className="mt-6 pt-5 border-t border-dashed border-amber-900/20 bg-amber-900/[0.02] -mx-6 sm:-mx-8 -mb-6 sm:-mb-8 p-6 sm:p-8 rounded-b-3xl">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-xl bg-forest-900 text-mint-300 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="space-y-1 text-xs">
              <span className="font-extrabold text-forest-950 uppercase tracking-wider block text-[11px]">
                Clinical Synthesis Verdict
              </span>
              <p className="text-charcoal-800 leading-relaxed">
                {analysis.summary.synthesisText}
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Item Details Drawer Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-cream-300 space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  selectedItem.isActive ? 'bg-emerald-100 text-emerald-900' : 'bg-coral-100 text-coral-900'
                }`}>
                  {selectedItem.isActive ? 'Active Compound' : 'Carrier / Filler'}
                </span>
                <h4 className="text-base font-extrabold text-forest-950 mt-1">
                  {selectedItem.cleanName}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="p-1 rounded-full text-charcoal-400 hover:text-forest-900 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-charcoal-700">
              {selectedItem.purpose && (
                <div>
                  <span className="font-bold text-charcoal-900 block">Pharmacological Role:</span>
                  <p>{selectedItem.purpose}</p>
                </div>
              )}

              {selectedItem.explanation && (
                <div>
                  <span className="font-bold text-charcoal-900 block">Scientific Analysis:</span>
                  <p className="leading-relaxed">{selectedItem.explanation}</p>
                </div>
              )}

              {selectedItem.strikeReason && (
                <div className="p-2.5 rounded-xl bg-coral-50 border border-coral-200 text-coral-950">
                  <span className="font-bold block text-[11px]">Reason for Strikethrough:</span>
                  <p className="text-[11px]">{selectedItem.strikeReason}</p>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-between">
              {selectedItem.sourceUrl ? (
                <a
                  href={selectedItem.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-forest-800 hover:text-mint-600 flex items-center gap-1"
                >
                  <span>PubMed Literature Reference</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : <div />}

              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 rounded-xl bg-forest-900 text-cream-50 text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
