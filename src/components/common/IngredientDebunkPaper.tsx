import React, { useState, useEffect, useMemo } from 'react';
import { 
  Check, 
  RotateCcw, 
  ExternalLink, 
  PenTool, 
  Zap, 
  Trophy, 
  Info,
  X,
  FileText
} from 'lucide-react';
import { ProductAnalysisResult, EvidenceTier } from '../../types';

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
  sourceLabel?: string;
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

  // Default Inactive Excipient / Processing Vehicle
  return {
    strikeTag: '⚗️ Inactive Excipient',
    strikeReason: 'Preservative, binder, emulsifier, pH adjuster or solubilizer. Inactive formulation vehicle.'
  };
}

export const IngredientDebunkPaper: React.FC<IngredientDebunkPaperProps> = ({
  productName,
  brand,
  rawIngredientText,
  analysis,
  onReplay,
  autoAnimate = true
}) => {
  // Animation timeline state
  const [animationStep, setAnimationStep] = useState<'idle' | 'writing' | 'marking' | 'complete'>('idle');
  const [displayedCount, setDisplayedCount] = useState<number>(0);
  const [markedCount, setMarkedCount] = useState<number>(0);
  const [selectedItem, setSelectedItem] = useState<ParsedItem | null>(null);
  const [purgeFluffMode, setPurgeFluffMode] = useState<boolean>(false);

  // Parse raw ingredients & match with detected clinical actives
  const parsedItems: ParsedItem[] = useMemo(() => {
    if (!rawIngredientText || !rawIngredientText.trim()) {
      return analysis.detectedIngredients.map((d, i) => ({
        id: `ing-${i}`,
        rawText: d.rawTextMatch || d.ingredient.name,
        cleanName: d.ingredient.name,
        isActive: d.ingredient.evidenceTier === 'strong_evidence' || d.ingredient.evidenceTier === 'conditional_evidence' || d.ingredient.evidenceTier === 'promising_limited',
        tier: d.ingredient.evidenceTier,
        purpose: d.ingredient.commonPurpose,
        explanation: d.ingredient.shortExplanation,
        sourceUrl: d.ingredient.sourceUrl,
        sourceLabel: d.ingredient.sourceLabel,
        hasDose: Boolean(d.doesLabelDiscloseDose),
        isStruckThrough: d.ingredient.evidenceTier === 'insufficient_info' || d.ingredient.evidenceTier === 'supporting_ingredient',
        ...getSpecificDebunkVerdict(d.rawTextMatch || d.ingredient.name)
      }));
    }

    const tokens = rawIngredientText
      .split(/[,;\n\r•*|]+/)
      .map(t => t.trim())
      .filter(t => t.length > 1 && !/^(ingredients?:?|contains:?|composition:?)$/i.test(t));

    return tokens.map((tok, idx) => {
      const match = analysis.detectedIngredients.find(d => {
        const raw = (d.rawTextMatch || '').toLowerCase();
        const ing = d.ingredient.name.toLowerCase();
        const t = tok.toLowerCase();
        return t.includes(raw) || t.includes(ing) || (raw.length > 3 && raw.includes(t));
      });

      if (match) {
        const isLegit = match.ingredient.evidenceTier === 'strong_evidence' || match.ingredient.evidenceTier === 'conditional_evidence' || match.ingredient.evidenceTier === 'promising_limited';
        const specific = getSpecificDebunkVerdict(tok);
        return {
          id: `tok-${idx}`,
          rawText: tok,
          cleanName: match.ingredient.name,
          isActive: isLegit,
          tier: match.ingredient.evidenceTier,
          purpose: match.ingredient.commonPurpose,
          explanation: match.ingredient.shortExplanation,
          sourceUrl: match.ingredient.sourceUrl,
          sourceLabel: match.ingredient.sourceLabel,
          hasDose: Boolean(match.doesLabelDiscloseDose),
          isStruckThrough: !isLegit,
          strikeTag: !isLegit ? specific.strikeTag : undefined,
          strikeReason: !isLegit ? specific.strikeReason : undefined
        };
      }

      const specific = getSpecificDebunkVerdict(tok);
      return {
        id: `tok-${idx}`,
        rawText: tok,
        cleanName: tok.replace(/\(.*\)/g, '').trim(),
        isActive: false,
        isStruckThrough: true,
        strikeTag: specific.strikeTag,
        strikeReason: specific.strikeReason
      };
    });
  }, [rawIngredientText, analysis]);

  // Proven actives and fillers counts
  const provenActivesCount = parsedItems.filter(i => i.isActive).length;
  const fillersCount = parsedItems.filter(i => !i.isActive).length;
  const activePercentage = parsedItems.length > 0 ? Math.round((provenActivesCount / parsedItems.length) * 100) : 0;

  // Grade formulation integrity
  const formulationGrade = useMemo(() => {
    if (activePercentage >= 50) return { grade: 'A', label: 'Clinical Strength High-Potency Formulation', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-300', ring: '#317353' };
    if (activePercentage >= 25) return { grade: 'B', label: 'Moderate Active Density (Carrier Dominant)', color: 'text-mint-700', bg: 'bg-mint-50 border-mint-300', ring: '#44926C' };
    if (activePercentage >= 10) return { grade: 'C', label: 'Diluted Active Ratio (High Excipient Bulk)', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-300', ring: '#F59E0B' };
    return { grade: 'D', label: 'Severe Marketing Gimmick / Diluted Formulation', color: 'text-rose-700', bg: 'bg-rose-50 border-rose-300', ring: '#EF4444' };
  }, [activePercentage]);

  // Start Animation
  const startAnimation = () => {
    setAnimationStep('writing');
    setDisplayedCount(0);
    setMarkedCount(0);
    if (onReplay) onReplay();
  };

  useEffect(() => {
    if (autoAnimate) {
      startAnimation();
    } else {
      setAnimationStep('complete');
      setDisplayedCount(parsedItems.length);
      setMarkedCount(parsedItems.length);
    }
  }, [parsedItems, autoAnimate]);

  // Sequence writing animation
  useEffect(() => {
    if (animationStep === 'writing') {
      if (displayedCount < parsedItems.length) {
        const timer = setTimeout(() => {
          setDisplayedCount(prev => prev + 1);
        }, 30);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => {
          setAnimationStep('marking');
        }, 150);
        return () => clearTimeout(timer);
      }
    }

    if (animationStep === 'marking') {
      if (markedCount < parsedItems.length) {
        const timer = setTimeout(() => {
          setMarkedCount(prev => prev + 1);
        }, 40);
        return () => clearTimeout(timer);
      } else {
        setAnimationStep('complete');
      }
    }
  }, [animationStep, displayedCount, markedCount, parsedItems.length]);

  const visibleItems = useMemo(() => {
    if (!purgeFluffMode) return parsedItems;
    return parsedItems.filter(i => i.isActive);
  }, [parsedItems, purgeFluffMode]);

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* ========================================================================= */}
      {/* 📊 FORMULATION PURITY HERO SCORECARD (CLEAN & MINIMALIST)                 */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-[2rem] p-5 sm:p-6 border border-mint-200/80 shadow-card space-y-4 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
          {/* Left: Score Dial & Formulation Integrity Tier */}
          <div className="flex items-center gap-4 w-full sm:w-auto">
            {/* Circular Clinical Score Ring */}
            <div className="relative w-14 h-14 shrink-0 flex items-center justify-center rounded-full bg-cream-50/70 border border-mint-200">
              <svg className="w-14 h-14 -rotate-90" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r="19" stroke="#E1EBE6" strokeWidth="3" fill="none" />
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
                <span className="text-xs font-black font-mono leading-none text-forest-950">{activePercentage}%</span>
                <span className="text-[8px] font-bold text-charcoal-500 uppercase">Potency</span>
              </div>
            </div>

            {/* Score & Formulation Classification */}
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-black text-forest-950 tracking-tight">
                  Formulation Integrity: {formulationGrade.grade} Tier
                </span>
                <span className="text-[9px] px-2 py-0.5 rounded-md bg-mint-100 text-forest-800 border border-mint-200 font-black uppercase font-mono">
                  Rx Audit
                </span>
              </div>
              <p className="text-xs text-charcoal-600 font-medium">
                {formulationGrade.label}
              </p>
            </div>
          </div>

          {/* Right: Clinical Actives vs Inactive Excipients Counter + Filter Mode */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-2 bg-cream-50/70 p-1.5 rounded-2xl border border-mint-100 text-xs font-mono">
              <div className="px-2.5 py-1 rounded-xl bg-mint-100 border border-mint-200 text-center">
                <span className="block text-forest-900 font-black text-xs leading-none">
                  {provenActivesCount}
                </span>
                <span className="text-[9px] text-forest-700 font-medium uppercase">Active</span>
              </div>

              <div className="px-2.5 py-1 rounded-xl bg-white border border-mint-100 text-center">
                <span className="block text-charcoal-600 font-black text-xs leading-none">
                  {fillersCount}
                </span>
                <span className="text-[9px] text-charcoal-500 font-medium uppercase">Excipients</span>
              </div>

              <button
                type="button"
                onClick={startAnimation}
                className="p-2 rounded-xl bg-white hover:bg-mint-100 text-charcoal-700 border border-mint-200 transition"
                title="Replay Clinical Audit"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Filter Toggle */}
            <button
              type="button"
              onClick={() => setPurgeFluffMode(!purgeFluffMode)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-black flex items-center gap-1.5 transition ${
                purgeFluffMode
                  ? 'bg-forest-900 text-white shadow-soft'
                  : 'bg-cream-50 hover:bg-mint-100 text-forest-900 border border-mint-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-forest-700" />
              <span>{purgeFluffMode ? 'Showing Actives Only' : 'Filter Inactive Fillers'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 📜 CLEAN PRESCRIPTION AUDIT SHEET (COMPACT & BITE-SIZED)                  */}
      {/* ========================================================================= */}
      <div className="relative rounded-3xl bg-white border border-mint-200/80 shadow-card overflow-hidden p-4 sm:p-6 font-sans transition-all">
        {/* Top Paper Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-dashed border-mint-200">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-md bg-mint-100 text-forest-800 text-[9px] font-black uppercase font-mono tracking-widest border border-mint-200">
                Rx AUDIT SHEET
              </span>
              <span className="text-[10px] font-mono font-bold text-charcoal-500 uppercase tracking-wider">
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
          <div className="mb-3 p-2 rounded-2xl bg-mint-50 text-forest-900 text-xs font-bold flex items-center justify-between animate-pulse border border-mint-200">
            <div className="flex items-center gap-1.5">
              <PenTool className="w-3.5 h-3.5 text-forest-800 animate-bounce" />
              <span>Scanning packaging ingredients & circling active compounds...</span>
            </div>
            <span className="text-[10px] font-mono">{displayedCount} / {parsedItems.length}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* COMPACT INTERACTIVE INGREDIENT LIST                                       */}
        {/* ========================================================================= */}
        <div className="space-y-2">
          {visibleItems.length === 0 ? (
            <div className="text-center py-8 text-charcoal-500 space-y-1">
              <p className="text-xs italic font-mono">Zero proven active ingredients found in this formulation.</p>
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
                  className={`group relative px-3.5 py-2.5 rounded-2xl transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 ${
                    isProven
                      ? 'bg-mint-50/80 border border-mint-300 hover:bg-mint-100'
                      : isStruck
                      ? 'bg-cream-50/50 border border-mint-100/60 opacity-80 hover:opacity-100'
                      : 'bg-cream-50/70 border border-mint-100'
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
                            stroke="#317353"
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
                            ? 'text-forest-950 font-black'
                            : isStruck
                            ? 'text-charcoal-400 line-through decoration-rose-500/70 font-medium'
                            : 'text-charcoal-700 font-bold'
                        }`}
                      >
                        {item.rawText}
                      </span>
                    </div>

                    {/* Quick Active Badge or Snappy Debunk Pill */}
                    {isProven && (
                      <span className="relative z-10 inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full bg-forest-900 text-white shadow-soft">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                        <span>Active</span>
                      </span>
                    )}

                    {isStruck && item.strikeTag && (
                      <span className="text-[9px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                        {item.strikeTag}
                      </span>
                    )}
                  </div>

                  {/* Right: Quick Action Pill */}
                  <div className="shrink-0 flex items-center gap-1 text-[10px] font-bold text-charcoal-400 group-hover:text-forest-900 transition">
                    <span className="hidden sm:inline">Details</span>
                    <Info className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Minimalist Gamified Bottom Line Verdict */}
        <div className="mt-4 pt-3 border-t border-dashed border-mint-200 flex items-center justify-between text-xs text-charcoal-600 gap-2">
          <div className="flex items-center gap-1.5 font-bold text-forest-950 shrink-0 font-mono">
            <Trophy className="w-4 h-4 text-amber-600" />
            <span>Reality Verdict:</span>
          </div>
          <span className="text-charcoal-600 font-medium text-right text-[11px] truncate">
            {analysis.summary.synthesisText}
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🔍 CLEAN QUICK-DETAILS MODAL (OPENS ON TAP)                               */}
      {/* ========================================================================= */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-modal border border-mint-200 space-y-4 text-charcoal-900">
            <div className="flex items-start justify-between gap-2 border-b border-mint-100 pb-3">
              <div>
                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full font-mono ${
                  selectedItem.isActive ? 'bg-mint-100 text-forest-800 border border-mint-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
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
                className="p-1 rounded-full text-charcoal-400 hover:text-charcoal-700 transition font-bold"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-charcoal-700">
              {selectedItem.purpose && (
                <div className="p-3 rounded-2xl bg-cream-50 border border-mint-100">
                  <span className="font-bold text-forest-950 block text-[11px] mb-0.5 font-mono uppercase">Clinical Purpose:</span>
                  <p className="text-charcoal-700 leading-relaxed">{selectedItem.purpose}</p>
                </div>
              )}

              {selectedItem.explanation && (
                <div className="p-3 rounded-2xl bg-cream-50 border border-mint-100">
                  <span className="font-bold text-forest-950 block text-[11px] mb-0.5 font-mono uppercase">Pharmacological Action:</span>
                  <p className="leading-relaxed text-charcoal-600">{selectedItem.explanation}</p>
                </div>
              )}

              {selectedItem.strikeReason && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-1">
                  <span className="font-black block text-[11px] font-mono uppercase text-rose-700">Reality Check:</span>
                  <p className="text-xs text-rose-800 leading-relaxed">{selectedItem.strikeReason}</p>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-mint-100">
              {selectedItem.sourceUrl ? (
                <a
                  href={selectedItem.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-forest-900 hover:underline flex items-center gap-1.5 font-mono bg-mint-50 px-3 py-1.5 rounded-xl border border-mint-200 transition hover:bg-mint-100"
                >
                  <FileText className="w-3.5 h-3.5 text-forest-700" />
                  <span>{selectedItem.sourceLabel || 'Read PubMed Research Paper'}</span>
                  <ExternalLink className="w-3 h-3 text-forest-600" />
                </a>
              ) : <div />}

              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 rounded-xl bg-forest-900 hover:bg-forest-800 text-white text-xs font-black shadow-soft transition"
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
