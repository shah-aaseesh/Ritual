import React, { useState, useEffect, useMemo } from 'react';
import { 
  Check, 
  X, 
  RotateCcw, 
  Sparkles, 
  ExternalLink, 
  Eye,
  PenTool,
  Award
} from 'lucide-react';
import { ProductAnalysisResult, DetectedIngredient, EvidenceTier } from '../../types';

interface IngredientDebunkPaperProps {
  productName: string;
  brand?: string;
  rawIngredientText: string;
  analysis: ProductAnalysisResult;
  onReplay?: () => void;
  autoAnimate?: boolean;
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
  isStruckThrough: boolean;
  strikeReason?: string;
}

export const IngredientDebunkPaper: React.FC<IngredientDebunkPaperProps> = ({
  productName,
  brand,
  rawIngredientText,
  analysis,
  autoAnimate = true
}) => {
  const [animationStep, setAnimationStep] = useState<'writing' | 'marking' | 'complete'>('complete');
  const [displayedCount, setDisplayedCount] = useState<number>(100);
  const [markedCount, setMarkedCount] = useState<number>(100);
  const [activeFilter, setActiveFilter] = useState<'all' | 'actives' | 'fillers'>('all');
  const [selectedItem, setSelectedItem] = useState<ParsedItem | null>(null);

  // Parse items from raw ingredient text and match with detected ingredients
  const parsedItems: ParsedItem[] = useMemo(() => {
    if (!rawIngredientText || rawIngredientText.trim().length === 0) {
      return [];
    }

    // Split raw ingredient text
    const rawTokens = rawIngredientText
      .split(/[,;\n•·|]/)
      .map(t => t.trim())
      .filter(t => t.length > 1 && !/^(ingredients|contains|active ingredients|inactive ingredients):?$/i.test(t));

    const detectedMap = new Map<string, DetectedIngredient>();
    if (analysis?.detectedIngredients) {
      analysis.detectedIngredients.forEach(d => {
        detectedMap.set(d.ingredient.name.toLowerCase(), d);
        d.ingredient.aliases.forEach(a => detectedMap.set(a.toLowerCase(), d));
      });
    }

    const items: ParsedItem[] = [];
    const seen = new Set<string>();

    for (let i = 0; i < rawTokens.length; i++) {
      const token = rawTokens[i];
      const norm = token.toLowerCase();

      if (seen.has(norm)) continue;
      seen.add(norm);

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
        // Excipient, filler, fragrance, solvent or unverified marketing additive
        const isCarrierOrPreservative = /water|aqua|glycerin|phenoxyethanol|alcohol|fragrance|parfum|citric|edta|pectin|sugar|glucose|triglyceride|preservative|sorbate|benzoate/i.test(norm);
        
        items.push({
          id: `item-${i}`,
          rawText: token,
          cleanName: token.replace(/\(.*\)/, '').trim(),
          isActive: false,
          isStruckThrough: true,
          strikeReason: isCarrierOrPreservative ? 'Excipient / Base Carrier (No active therapeutic action)' : 'Bulking Agent / Marketing Additive'
        });
      }
    }

    return items;
  }, [rawIngredientText, analysis]);

  // Run handwriting & marking animation sequence
  const startAnimation = () => {
    setAnimationStep('writing');
    setDisplayedCount(0);
    setMarkedCount(0);

    const total = parsedItems.length;
    let current = 0;

    // Phase 1: Write down ingredients one by one
    const writeTimer = setInterval(() => {
      current += 1;
      setDisplayedCount(current);

      if (current >= total) {
        clearInterval(writeTimer);
        setAnimationStep('marking');

        // Phase 2: Circle actives in green and strikethrough unvaluable in red
        let marked = 0;
        const markTimer = setInterval(() => {
          marked += 1;
          setMarkedCount(marked);

          if (marked >= total) {
            clearInterval(markTimer);
            setAnimationStep('complete');
          }
        }, 80);
      }
    }, 35);
  };

  useEffect(() => {
    if (autoAnimate && parsedItems.length > 0) {
      startAnimation();
    } else {
      setAnimationStep('complete');
      setDisplayedCount(parsedItems.length);
      setMarkedCount(parsedItems.length);
    }
  }, [rawIngredientText]);

  const provenActivesCount = parsedItems.filter(p => p.isActive).length;
  const fillersCount = parsedItems.filter(p => p.isStruckThrough).length;

  const visibleItems = parsedItems.filter(item => {
    if (activeFilter === 'actives') return item.isActive;
    if (activeFilter === 'fillers') return item.isStruckThrough;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Top Controls & Counter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Minimalist Filter Pill Group */}
        <div className="inline-flex p-1 bg-cream-200/80 rounded-2xl border border-cream-300 text-xs shadow-xs">
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
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Circled Actives ({provenActivesCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('fillers')}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
              activeFilter === 'fillers'
                ? 'bg-rose-700 text-white shadow-sm'
                : 'text-rose-800 hover:text-rose-950'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            <span>Struck Fillers ({fillersCount})</span>
          </button>
        </div>

        {/* Replay Handwriting Animation Button */}
        <button
          type="button"
          onClick={startAnimation}
          className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-cream-100 border border-cream-300 text-charcoal-800 text-xs font-bold flex items-center gap-1.5 transition shadow-soft active:scale-95"
          title="Replay handwriting & debunk audit"
        >
          <RotateCcw className="w-3.5 h-3.5 text-forest-800" />
          <span>Replay Handwriting Audit</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* THE CLINICAL DEBUNK PRESCRIPTION PAPER SHEET                              */}
      {/* ========================================================================= */}
      <div className="relative rounded-3xl rx-paper-ruled border-2 border-[#E2DAC8] shadow-card overflow-hidden p-6 sm:p-8 font-sans transition-all">
        
        {/* Paper Notebook Header Stamp */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-dashed border-[#CFC5B0]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-forest-950 text-mint-300 text-[10px] font-black uppercase tracking-widest font-mono">
                Rx CLINICAL AUDIT
              </span>
              <span className="text-[10px] font-extrabold text-charcoal-400 uppercase tracking-widest font-mono">
                FORMULATION REPORT
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-forest-950 tracking-tight">
              {productName}
            </h3>
            {brand && (
              <p className="text-xs text-charcoal-600 font-medium">
                Audited Brand: <span className="font-bold text-forest-900">{brand}</span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 bg-white/80 backdrop-blur-xs px-3.5 py-2 rounded-2xl border border-cream-300 self-start sm:self-auto shadow-xs">
            <div className="text-left">
              <span className="text-[10px] font-bold text-charcoal-400 uppercase tracking-wider block">
                AUDIT VERDICT
              </span>
              <span className="text-xs font-extrabold text-emerald-800 flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                {provenActivesCount} Clinically Circled
              </span>
            </div>
            <div className="w-px h-6 bg-cream-300" />
            <div className="text-left">
              <span className="text-[10px] font-bold text-charcoal-400 uppercase tracking-wider block">
                EXCIPIENTS
              </span>
              <span className="text-xs font-extrabold text-rose-700 flex items-center gap-1">
                <X className="w-3.5 h-3.5 text-rose-600 stroke-[3]" />
                {fillersCount} Struck Inactive
              </span>
            </div>
          </div>
        </div>

        {/* Live Writing / Marking Progress Banner */}
        {animationStep === 'writing' && (
          <div className="mb-4 p-2.5 rounded-2xl bg-amber-900/10 text-amber-950 text-xs font-bold flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-2">
              <PenTool className="w-4 h-4 text-amber-800 animate-bounce" />
              <span>Transcribing packaging ingredients onto paper...</span>
            </div>
            <span className="text-[11px] font-mono">{displayedCount} / {parsedItems.length}</span>
          </div>
        )}

        {animationStep === 'marking' && (
          <div className="mb-4 p-2.5 rounded-2xl bg-emerald-900/10 text-emerald-950 text-xs font-bold flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 animate-spin" />
              <span>Evaluating active potency: Circling actives in green & striking fillers in red...</span>
            </div>
            <span className="text-[11px] font-mono">{markedCount} / {parsedItems.length}</span>
          </div>
        )}

        {/* Paper Body: Handwritten Ingredients List */}
        <div className="space-y-3 min-h-[180px] pt-1">
          {visibleItems.length === 0 ? (
            <p className="text-xs text-charcoal-400 italic py-8 text-center font-serif">
              No ingredients match the selected filter.
            </p>
          ) : (
            visibleItems.map((item, idx) => {
              const isWritten = animationStep === 'complete' || idx < displayedCount;
              if (!isWritten) return null;

              const isMarked = animationStep === 'complete' || (animationStep === 'marking' && idx < markedCount);
              const isProven = isMarked && item.isActive;
              const isStruck = isMarked && item.isStruckThrough;

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`group relative p-3 sm:p-3.5 rounded-2xl transition-all duration-300 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                    isProven
                      ? 'bg-emerald-500/10 border-2 border-emerald-500/40 shadow-xs hover:border-emerald-600'
                      : isStruck
                      ? 'bg-white/40 border border-transparent hover:bg-rose-50/40 hover:border-rose-200'
                      : 'bg-white/70 border border-cream-200'
                  }`}
                >
                  {/* Left Column: Ingredient with Handwritten Script & Animated Marking */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      {/* Ingredient Text Container with SVG Circle or Red Strikethrough */}
                      <div className="relative inline-flex items-center py-0.5 px-1">
                        {/* 1. ANIMATED GREEN HAND-DRAWN CIRCLE/OVAL FOR VALUABLE ACTIVES */}
                        {isProven && (
                          <svg
                            className="absolute -inset-x-2.5 -inset-y-1.5 w-[calc(100%+20px)] h-[calc(100%+12px)] pointer-events-none z-0"
                            viewBox="0 0 160 50"
                            preserveAspectRatio="none"
                          >
                            <path
                              d="M 12 25 C 10 10, 35 4, 80 4 C 135 4, 154 10, 154 25 C 154 38, 125 46, 75 46 C 25 46, 6 36, 6 22 C 6 15, 20 8, 45 6"
                              fill="none"
                              stroke="#059669"
                              strokeWidth="2.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="animate-green-circle drop-shadow-xs"
                            />
                          </svg>
                        )}

                        {/* Text: Circled Green or Struck in Red */}
                        <span
                          className={`relative z-10 text-sm sm:text-base font-bold tracking-tight transition-all duration-300 font-sans ${
                            isProven
                              ? 'text-emerald-950 font-black'
                              : isStruck
                              ? 'text-charcoal-400 animate-red-strike font-medium'
                              : 'text-forest-950 font-bold'
                          }`}
                        >
                          {item.rawText}
                        </span>
                      </div>

                      {/* Active Circled Status Badge */}
                      {isProven && (
                        <span className="relative z-10 inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-600 text-white shadow-xs">
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>Clinically Valuable Active</span>
                        </span>
                      )}

                      {/* Red Struck Reason Annotation */}
                      {isStruck && item.strikeReason && (
                        <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-md border border-rose-200/60 font-sans">
                          {item.strikeReason}
                        </span>
                      )}
                    </div>

                    {/* Pharmacological role note */}
                    {isProven && item.purpose && (
                      <p className="text-xs text-emerald-900 font-medium mt-1 leading-relaxed pl-1">
                        ✦ {item.purpose}
                      </p>
                    )}
                  </div>

                  {/* Right Action: Evidence Tag / Info */}
                  <div className="shrink-0 flex items-center gap-1.5 self-end sm:self-center">
                    {item.sourceUrl && (
                      <a
                        href={item.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded-lg text-emerald-800 hover:bg-emerald-200/70 transition"
                        title="View published clinical evidence on PubMed"
                      >
                        <ExternalLink className="w-4 h-4 text-emerald-700" />
                      </a>
                    )}
                    <button
                      type="button"
                      className="text-xs text-charcoal-400 group-hover:text-forest-900 transition p-1"
                      title="Inspect clinical breakdown"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Paper Footer: Clinical Summary Verdict */}
        <div className="mt-6 pt-5 border-t border-dashed border-[#CFC5B0] bg-[#F4EFE6]/60 -mx-6 sm:-mx-8 -mb-6 sm:-mb-8 p-6 sm:p-8 rounded-b-3xl">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-forest-900 text-mint-300 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
              <Award className="w-4 h-4 text-mint-300" />
            </div>
            <div className="space-y-1 text-xs">
              <span className="font-black text-forest-950 uppercase tracking-wider block text-xs">
                Clinical Pharmacological Synthesis
              </span>
              <p className="text-charcoal-800 leading-relaxed font-sans text-xs sm:text-sm">
                "{analysis.summary.synthesisText}"
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
                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                  selectedItem.isActive ? 'bg-emerald-100 text-emerald-900 border border-emerald-200' : 'bg-rose-100 text-rose-900 border border-rose-200'
                }`}>
                  {selectedItem.isActive ? 'Clinically Active Compound' : 'Carrier / Inactive Excipient'}
                </span>
                <h4 className="text-base sm:text-lg font-black text-forest-950 mt-1.5">
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

            <div className="space-y-3 text-xs text-charcoal-700">
              {selectedItem.purpose && (
                <div className="p-3 rounded-2xl bg-cream-50 border border-cream-200">
                  <span className="font-bold text-forest-950 block text-xs mb-0.5">Clinical Purpose:</span>
                  <p className="text-charcoal-700">{selectedItem.purpose}</p>
                </div>
              )}

              {selectedItem.explanation && (
                <div>
                  <span className="font-bold text-forest-950 block mb-0.5">Mechanism of Action:</span>
                  <p className="leading-relaxed text-charcoal-600">{selectedItem.explanation}</p>
                </div>
              )}

              {selectedItem.strikeReason && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950">
                  <span className="font-bold block text-xs mb-0.5">Why this was struck through:</span>
                  <p className="text-xs text-rose-900">{selectedItem.strikeReason}</p>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-between">
              {selectedItem.sourceUrl ? (
                <a
                  href={selectedItem.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-forest-800 hover:text-mint-600 flex items-center gap-1.5 underline"
                >
                  <span>View PubMed Evidence</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : <div />}

              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 rounded-xl bg-forest-900 hover:bg-forest-800 text-cream-50 text-xs font-bold shadow-soft transition"
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
