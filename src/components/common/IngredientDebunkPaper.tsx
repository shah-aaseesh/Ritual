import React, { useState, useEffect, useMemo } from 'react';
import { 
  Check, 
  RotateCcw, 
  ExternalLink, 
  PenTool, 
  Zap, 
  Trophy, 
  Info,
  X
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
  strikeTag?: string;
  strikeReason?: string;
}

/**
 * Specifically categorizes marketing gimmicks, fairy dusting, synthetic scent masking,
 * candy syrup bulkers, and cheap inert fillers without sugarcoating.
 */
function getSpecificDebunkVerdict(token: string): { strikeTag: string; strikeReason: string } {
  const norm = token.toLowerCase();

  // 1. Synthetic Fragrances, Perfume, and Allergen Scents
  if (/fragrance|parfum|perfume|aroma|linalool|limonene|citronellol|geraniol|eugenol|cinnamal|coumarin|benzyl alcohol|benzyl benzoate|hexyl cinnamal/i.test(norm)) {
    return {
      strikeTag: '⚠️ Sensitizing Fragrance',
      strikeReason: 'Scent masking only. #1 clinical cause of skin barrier redness, irritation & contact dermatitis.'
    };
  }

  // 2. Added Sugars & Glucose Candy Syrups in Wellness Gummies
  if (/liquid glucose|glucose syrup|cane sugar|sucrose|fructose|corn syrup|maltitol syrup|dextrose|invert sugar/i.test(norm)) {
    return {
      strikeTag: '🍬 Candy Sugar Bulker',
      strikeReason: 'Adds 2–4g of refined sugar matrix disguised as "wellness healthcare".'
    };
  }

  // 3. Silicones (Cosmetic Smoothness Illusion)
  if (/dimethicone|cyclomethicone|cyclopentasiloxane|amodimethicone|dimethiconol|phenyl trimethicone/i.test(norm)) {
    return {
      strikeTag: '🎭 Cosmetic Silicone Film',
      strikeReason: 'Coats surfaces for an instant artificial slip. Zero deep cellular or follicle repair.'
    };
  }

  // 4. Fairy-Dusted Micro-Exotics & Gold / Diamond / Pearl / Exotic Stem Cell Gimmicks
  if (/gold|diamond|pearl|caviar|ruby|platinum|rare apple stem|exotic orchid|snake venom|snail mucin extract \d*ppm|black truffle|meteorite/i.test(norm)) {
    return {
      strikeTag: '🚩 Fairy-Dusting Gimmick',
      strikeReason: 'Added at <0.001% homeopathic trace levels purely for marketing box claims. Zero bioactivity.'
    };
  }

  // 5. Cheap Synthetic Dyes & Food Colorings
  if (/ci\s*\d+|fd&c|d&c|yellow\s*\d+|blue\s*\d+|red\s*\d+|caramel color|titanium dioxide|iron oxides/i.test(norm)) {
    return {
      strikeTag: '🎨 Artificial Color Dye',
      strikeReason: 'Visual food dye added to simulate fresh color. Zero therapeutic potency.'
    };
  }

  // 6. Water / Aqua Dilution
  if (/^(aqua|water|purified water|demineralized water)$/i.test(norm.trim())) {
    return {
      strikeTag: '💧 85%+ Water Dilution',
      strikeReason: 'Essential solvent vehicle, but provides zero proprietary active power.'
    };
  }

  // 7. Standard Chemical Thickeners & Binders
  if (/carbomer|xanthan gum|acrylates|cellulose|hydroxyethylcellulose|magnesium stearate|stearic acid|guar gum|carrageenan|polyacrylate/i.test(norm)) {
    return {
      strikeTag: '📦 Bulking Thickener',
      strikeReason: 'Inactive gelling agent to thicken fluid or bind tablets. Zero therapeutic action.'
    };
  }

  // 8. Chelating agents & Chemical Preservatives
  if (/disodium edta|tetrasodium edta|bht|bha|phenoxyethanol|sodium benzoate|potassium sorbate|methylparaben|propylparaben|ethylhexylglycerin/i.test(norm)) {
    return {
      strikeTag: '🛡️ Shelf Stabilizer',
      strikeReason: 'Chemical stabilizer required for 24-month shelf life. Zero active wellness benefit.'
    };
  }

  // 9. Fatty Alcohols & Emulsifying Vehicles
  if (/cetearyl alcohol|cetyl alcohol|stearyl alcohol|polysorbate|ceteareth|peg-\d+|glyceryl stearate|sorbitan|isostearate/i.test(norm)) {
    return {
      strikeTag: '🧴 Emulsifier Vehicle',
      strikeReason: 'Keeps oil and water blended on shelf. Inactive formulation carrier.'
    };
  }

  // 10. Generic unverified marketing herbal extracts
  if (/extract|juice|oil|leaf|root|bark|flower|seed/i.test(norm)) {
    return {
      strikeTag: '📢 Unverified Botanical',
      strikeReason: 'Unstandardized botanical with undisclosed active percentage. Often added at trace amounts.'
    };
  }

  // Default fallback for other fillers
  return {
    strikeTag: '🚫 Inactive Excipient',
    strikeReason: 'Non-therapeutic filler providing zero clinical activity for your wellness goal.'
  };
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
  const [purgeFluffMode, setPurgeFluffMode] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<ParsedItem | null>(null);

  // Parse items from raw ingredient text and match with detected ingredients
  const parsedItems: ParsedItem[] = useMemo(() => {
    if (!rawIngredientText || rawIngredientText.trim().length === 0) {
      return [];
    }

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
        
        if (isSupportingCarrier) {
          const debunk = getSpecificDebunkVerdict(token);
          items.push({
            id: `item-${i}`,
            rawText: token,
            cleanName: matchedDetected.ingredient.name,
            isActive: false,
            tier: tier,
            purpose: matchedDetected.ingredient.commonPurpose,
            explanation: matchedDetected.explanation,
            sourceUrl: matchedDetected.ingredient.sourceUrl,
            hasDose: matchedDetected.doesLabelDiscloseDose,
            isStruckThrough: true,
            strikeTag: debunk.strikeTag,
            strikeReason: debunk.strikeReason
          });
        } else {
          items.push({
            id: `item-${i}`,
            rawText: token,
            cleanName: matchedDetected.ingredient.name,
            isActive: true,
            tier: tier,
            purpose: matchedDetected.ingredient.commonPurpose,
            explanation: matchedDetected.explanation,
            sourceUrl: matchedDetected.ingredient.sourceUrl,
            hasDose: matchedDetected.doesLabelDiscloseDose,
            isStruckThrough: false
          });
        }
      } else {
        const debunk = getSpecificDebunkVerdict(token);
        items.push({
          id: `item-${i}`,
          rawText: token,
          cleanName: token.replace(/\(.*\)/, '').trim(),
          isActive: false,
          isStruckThrough: true,
          strikeTag: debunk.strikeTag,
          strikeReason: debunk.strikeReason
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

    const writeTimer = setInterval(() => {
      current += 1;
      setDisplayedCount(current);

      if (current >= total) {
        clearInterval(writeTimer);
        setAnimationStep('marking');

        let marked = 0;
        const markTimer = setInterval(() => {
          marked += 1;
          setMarkedCount(marked);

          if (marked >= total) {
            clearInterval(markTimer);
            setAnimationStep('complete');
          }
        }, 50);
      }
    }, 25);
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
  const totalCount = parsedItems.length || 1;
  const activePercentage = Math.round((provenActivesCount / totalCount) * 100);

  // Compute Gamified Formulation Grade
  const formulationGrade = useMemo(() => {
    if (activePercentage >= 50) return { grade: 'A', label: 'Clinical Grade Potency', color: 'text-emerald-400', ring: '#10B981', bg: 'bg-emerald-500/10' };
    if (activePercentage >= 25) return { grade: 'B', label: 'Moderate Active Density', color: 'text-mint-400', ring: '#34D399', bg: 'bg-mint-500/10' };
    if (activePercentage >= 15) return { grade: 'C', label: 'Commercial Standard (High Fluff)', color: 'text-amber-400', ring: '#F59E0B', bg: 'bg-amber-500/10' };
    return { grade: 'D-', label: 'Extreme Marketing Gimmick / Dilution', color: 'text-rose-400', ring: '#EF4444', bg: 'bg-rose-500/10' };
  }, [activePercentage]);

  const visibleItems = useMemo(() => {
    if (purgeFluffMode) {
      return parsedItems.filter(p => p.isActive);
    }
    return parsedItems;
  }, [parsedItems, purgeFluffMode]);

  return (
    <div className="space-y-3.5">
      {/* ========================================================================= */}
      {/* 🔬 CLINICAL FORMULATION INTEGRITY INDEX & EXCIPIENT AUDIT                 */}
      {/* ========================================================================= */}
      <div className="rounded-3xl bg-forest-950 border border-emerald-500/20 p-5 sm:p-6 text-cream-50 shadow-card relative overflow-hidden font-sans">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
          {/* Left: Score Dial & Formulation Integrity Tier */}
          <div className="flex items-center gap-4 w-full sm:w-auto">
            {/* Circular Clinical Score Ring */}
            <div className="relative w-14 h-14 shrink-0 flex items-center justify-center rounded-full bg-black/40 border border-white/10">
              <svg className="w-14 h-14 -rotate-90" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r="19" stroke="rgba(255,255,255,0.1)" strokeWidth="3" fill="none" />
                <circle
                  cx="24"
                  cy="24"
                  r="19"
                  stroke={formulationGrade.ring}
                  strokeWidth="3"
                  strokeDasharray="119.38"
                  strokeDashoffset={119.38 - (119.38 * Math.max(activePercentage, 10)) / 100}
                  strokeLinecap="round"
                  fill="none"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs font-bold font-mono leading-none text-white">{activePercentage}%</span>
                <span className="text-[8px] font-medium text-cream-300 uppercase">Potency</span>
              </div>
            </div>

            {/* Score & Formulation Classification */}
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                  Formulation Integrity: {formulationGrade.grade} Tier
                </span>
                <span className="text-[9px] px-2 py-0.5 rounded-md bg-white/10 text-cream-200 font-bold uppercase font-mono">
                  Rx Audit
                </span>
              </div>
              <p className="text-xs text-cream-300 font-medium">
                {formulationGrade.label}
              </p>
            </div>
          </div>

          {/* Right: Clinical Actives vs Inactive Excipients Counter + Filter Mode */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-2 bg-black/30 p-1.5 rounded-2xl border border-white/10 text-xs font-mono">
              <div className="px-2.5 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-center">
                <span className="block text-emerald-400 font-bold text-xs leading-none">
                  {provenActivesCount}
                </span>
                <span className="text-[9px] text-emerald-300 font-medium uppercase">Active</span>
              </div>

              <div className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-center">
                <span className="block text-cream-300 font-bold text-xs leading-none">
                  {fillersCount}
                </span>
                <span className="text-[9px] text-cream-400 font-medium uppercase">Excipients</span>
              </div>

              <button
                type="button"
                onClick={startAnimation}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-cream-200 transition"
                title="Replay Clinical Audit"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Filter Toggle */}
            <button
              type="button"
              onClick={() => setPurgeFluffMode(!purgeFluffMode)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition ${
                purgeFluffMode
                  ? 'bg-forest-800 text-cream-50 border border-mint-400/40 shadow-sm'
                  : 'bg-white/10 hover:bg-white/20 text-cream-100 border border-white/10'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-mint-300" />
              <span>{purgeFluffMode ? 'Showing Actives Only' : 'Filter Inactive Fillers'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 📜 CLEAN PRESCRIPTION AUDIT SHEET (COMPACT & BITE-SIZED)                  */}
      {/* ========================================================================= */}
      <div className="relative rounded-3xl rx-paper-ruled border-2 border-[#E2DAC8] shadow-card overflow-hidden p-4 sm:p-6 font-sans transition-all">
        
        {/* Dynamic Scanning Laser Beam Overlay */}
        {(animationStep === 'writing' || animationStep === 'marking') && (
          <div className="animate-laser-beam" />
        )}

        {/* Top Paper Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-dashed border-[#CFC5B0]">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-md bg-forest-950 text-mint-300 text-[9px] font-black uppercase font-mono tracking-widest">
                Rx AUDIT SHEET
              </span>
              <span className="text-[10px] font-extrabold text-charcoal-500 uppercase tracking-wider font-mono">
                {productName} {brand ? `• ${brand}` : ''}
              </span>
            </div>
          </div>

          <span className="text-[11px] font-mono text-charcoal-500 font-bold">
            {visibleItems.length} {visibleItems.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        {/* Live Writing / Marking Progress Banner */}
        {animationStep !== 'complete' && (
          <div className="mb-3 p-2 rounded-2xl bg-amber-900/10 text-amber-950 text-xs font-bold flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-1.5">
              <PenTool className="w-3.5 h-3.5 text-amber-800 animate-bounce" />
              <span>Scanning packaging ingredients & circling active compounds...</span>
            </div>
            <span className="text-[10px] font-mono">{displayedCount} / {parsedItems.length}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* COMPACT INTERACTIVE INGREDIENT LIST (NO BLOAT / NO DENSE TEXT WALLS)      */}
        {/* ========================================================================= */}
        <div className="space-y-2">
          {visibleItems.length === 0 ? (
            <div className="text-center py-8 text-charcoal-400 space-y-1">
              <p className="text-xs font-serif italic">Zero proven active ingredients found in this formulation.</p>
              <button
                type="button"
                onClick={() => setPurgeFluffMode(false)}
                className="text-xs font-bold text-forest-900 underline"
              >
                View all packaging fillers
              </button>
            </div>
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
                  className={`group relative px-3.5 py-2.5 rounded-2xl transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 animate-pop-card ${
                    isProven
                      ? 'bg-emerald-500/10 border-2 border-emerald-500/50 shadow-xs hover:border-emerald-600 hover:bg-emerald-500/15'
                      : isStruck
                      ? 'bg-white/60 border border-cream-200/80 hover:bg-rose-50/70 hover:border-rose-300 opacity-80 hover:opacity-100'
                      : 'bg-white/80 border border-cream-200'
                  }`}
                >
                  {/* Left: Ingredient Name with Handwritten Circling or Strikethrough */}
                  <div className="flex items-center gap-2 flex-wrap min-w-0 flex-1">
                    <div className="relative inline-flex items-center py-0.5 px-1">
                      {/* Green Hand-Drawn Oval Circle for Actives */}
                      {isProven && (
                        <svg
                          className="absolute -inset-x-2 -inset-y-1 w-[calc(100%+16px)] h-[calc(100%+8px)] pointer-events-none z-0"
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
                            className="animate-green-circle"
                          />
                        </svg>
                      )}

                      {/* Text */}
                      <span
                        className={`relative z-10 text-xs sm:text-sm font-bold tracking-tight font-sans ${
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

                    {/* Quick Active Badge or Snappy Debunk Pill */}
                    {isProven && (
                      <span className="relative z-10 inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-2xs">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                        <span>Active</span>
                      </span>
                    )}

                    {isStruck && item.strikeTag && (
                      <span className="text-[9px] font-extrabold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200/80 shadow-2xs">
                        {item.strikeTag}
                      </span>
                    )}
                  </div>

                  {/* Right: Quick Action Pill */}
                  <div className="shrink-0 flex items-center gap-1 text-[10px] font-bold text-charcoal-400 group-hover:text-forest-900 transition">
                    <span className="hidden sm:inline">Tap for details</span>
                    <Info className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Minimalist Gamified Bottom Line Verdict */}
        <div className="mt-4 pt-3 border-t border-dashed border-[#CFC5B0] flex items-center justify-between text-xs text-charcoal-600 gap-2">
          <div className="flex items-center gap-1.5 font-bold text-forest-950 shrink-0">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Reality Verdict:</span>
          </div>
          <span className="text-charcoal-700 font-medium text-right text-[11px] truncate">
            {analysis.summary.synthesisText}
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🔍 CLEAN QUICK-DETAILS MODAL (OPENS ON TAP)                               */}
      {/* ========================================================================= */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-cream-300 space-y-3.5">
            <div className="flex items-start justify-between gap-2 border-b border-cream-200 pb-3">
              <div>
                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  selectedItem.isActive ? 'bg-emerald-100 text-emerald-900 border border-emerald-200' : 'bg-rose-100 text-rose-900 border border-rose-200'
                }`}>
                  {selectedItem.isActive ? 'Clinically Active Compound' : (selectedItem.strikeTag || 'Inactive Filler')}
                </span>
                <h4 className="text-base font-black text-forest-950 mt-1">
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

            <div className="space-y-2.5 text-xs text-charcoal-700">
              {selectedItem.purpose && (
                <div className="p-2.5 rounded-xl bg-cream-50 border border-cream-200">
                  <span className="font-bold text-forest-950 block text-[11px] mb-0.5">Clinical Purpose:</span>
                  <p className="text-charcoal-700 leading-relaxed">{selectedItem.purpose}</p>
                </div>
              )}

              {selectedItem.explanation && (
                <div>
                  <span className="font-bold text-forest-950 block text-[11px] mb-0.5">Pharmacological Action:</span>
                  <p className="leading-relaxed text-charcoal-600">{selectedItem.explanation}</p>
                </div>
              )}

              {selectedItem.strikeReason && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 space-y-1">
                  <span className="font-extrabold block text-[11px]">Reality Check:</span>
                  <p className="text-xs text-rose-900 leading-relaxed">{selectedItem.strikeReason}</p>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-cream-200">
              {selectedItem.sourceUrl ? (
                <a
                  href={selectedItem.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-forest-800 hover:text-mint-600 flex items-center gap-1 underline"
                >
                  <span>PubMed Study</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : <div />}

              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="px-4 py-1.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-cream-50 text-xs font-bold shadow-soft transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
