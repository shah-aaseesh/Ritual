import React, { useState, useRef, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { SAMPLE_PRODUCTS, SampleProductLabel } from '../../data/sampleProducts';
import { analyzeLabelText } from '../../services/analyzer';
import { extractLabelFromImageWithAI, denoiseAndStructureOCRWithLLM, findMatchingMosaicProducts } from '../../services/aiService';
import { ProductAnalysisResult, EvidenceTier } from '../../types';
import { VerdictBadge } from '../common/EvidenceBadge';
import { DisclaimerBanner } from '../common/DisclaimerBanner';
import { BarcodeScannerModal } from '../common/BarcodeScannerModal';
import { IngredientDebunkPaper } from '../common/IngredientDebunkPaper';
import { ClinicalRecommendations } from '../recommendations/ClinicalRecommendations';
import { BarcodeLookupResult } from '../../services/barcodeService';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  Edit3, 
  BookmarkPlus,
  ScanBarcode,
  ClipboardPaste,
  CheckCircle,
  Terminal,
  Copy,
  Check,
  ChevronRight,
  ArrowLeft,
  FileText,
  ShieldCheck,
  Activity,
  Layers,
  FlaskConical,
  Zap
} from 'lucide-react';

export type LabelLensSubView = 
  | 'hub' 
  | 'audit_sheet' 
  | 'matrix' 
  | 'claims' 
  | 'alternatives' 
  | 'samples' 
  | 'ai_inspector';

export const LabelLensView: React.FC = () => {
  const { profile, addShelfProduct, showToast, aiSettings } = useApp();

  // Active Mobile Sub-View Navigation
  const [activeSubView, setActiveSubView] = useState<LabelLensSubView>('hub');

  const [productName, setProductName] = useState<string>('Follicle Reactivate Scalp Serum');
  const [frontClaimText, setFrontClaimText] = useState<string>(SAMPLE_PRODUCTS[0].frontLabelText);
  const [ingredientText, setIngredientText] = useState<string>(SAMPLE_PRODUCTS[0].ingredientLabelText);
  const [selectedSampleId, setSelectedSampleId] = useState<string>(SAMPLE_PRODUCTS[0].id);

  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState<boolean>(false);

  const [scanProgress, setScanProgress] = useState<{ percent: number; status: string }>({ percent: 0, status: '' });
  const [showManualEditor, setShowManualEditor] = useState<boolean>(false);

  // Quick Paste Drawer
  const [isQuickPasteOpen, setIsQuickPasteOpen] = useState<boolean>(false);
  const [quickPasteInput, setQuickPasteInput] = useState<string>('');
  const [isCleaningText, setIsCleaningText] = useState<boolean>(false);

  // AI Inspector State
  const [latestDebugTrace, setLatestDebugTrace] = useState<any>(null);
  const [debugTab, setDebugTab] = useState<'response' | 'prompt'>('response');
  const [hasCopiedRaw, setHasCopiedRaw] = useState<boolean>(false);

  const [analysisResult, setAnalysisResult] = useState<ProductAnalysisResult>(() => {
    return analyzeLabelText(
      SAMPLE_PRODUCTS[0].ingredientLabelText,
      SAMPLE_PRODUCTS[0].frontLabelText,
      profile.primaryGoal,
      SAMPLE_PRODUCTS[0].name
    );
  });

  const matchingFormulations = useMemo(() => {
    const activeNames = analysisResult?.detectedIngredients?.map(i => i.ingredient?.name || i.rawTextMatch) || [];
    return findMatchingMosaicProducts(activeNames, profile.primaryGoal);
  }, [analysisResult?.detectedIngredients, profile.primaryGoal]);

  const [saveModalOpen, setSaveModalOpen] = useState<boolean>(false);
  const [saveTimeOfDay, setSaveTimeOfDay] = useState<'morning' | 'evening' | 'both'>('evening');
  const [saveBrand, setSaveBrand] = useState<string>('Apex Derma Lab');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const frontFileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectSample = (sample: SampleProductLabel) => {
    setSelectedSampleId(sample.id);
    setProductName(sample.name);
    setFrontClaimText(sample.frontLabelText);
    setIngredientText(sample.ingredientLabelText);
    setSaveBrand(sample.brandSuggestion);

    const res = analyzeLabelText(
      sample.ingredientLabelText,
      sample.frontLabelText,
      profile.primaryGoal,
      sample.name
    );
    setAnalysisResult(res);
    showToast(`Loaded: ${sample.name}`, 'info');
  };

  const handleReanalyze = (newIngText: string, newClaimText: string, newName: string) => {
    const res = analyzeLabelText(newIngText, newClaimText, profile.primaryGoal, newName);
    setAnalysisResult(res);
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>, isFrontLabel: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setScanProgress({ percent: 15, status: 'Sending photo directly to Vision AI...' });

    try {
      const result = await extractLabelFromImageWithAI(
        file,
        profile.primaryGoal,
        aiSettings.openRouterApiKey,
        aiSettings.selectedModel,
        (pct: number, msg: string) => setScanProgress({ percent: pct, status: msg })
      );

      if (result.debugTrace) {
        setLatestDebugTrace(result.debugTrace);
      }

      if (isFrontLabel) {
        const claims = result.claimText || result.ingredientText;
        setFrontClaimText(claims);
        if (result.productName) setProductName(result.productName);
        handleReanalyze(ingredientText, claims, result.productName || productName);
        showToast('Front label analyzed', 'success');
      } else {
        setIngredientText(result.ingredientText);
        if (result.productName) setProductName(result.productName);
        handleReanalyze(result.ingredientText, frontClaimText, result.productName || productName);
        showToast('Ingredients analyzed', 'success');
      }
      setSelectedSampleId('');
    } catch (err: any) {
      showToast(err.message || 'Vision AI scan failed. You can paste ingredients manually.', 'warning');
    } finally {
      setIsScanning(false);
    }
  };

  const handleQuickPasteClean = async (textOverride?: string) => {
    const textToClean = textOverride || quickPasteInput;
    if (!textToClean.trim()) return;

    setIsCleaningText(true);
    showToast('Isolating active compounds with AI...', 'info');

    try {
      const structured = await denoiseAndStructureOCRWithLLM(
        textToClean, 
        profile.primaryGoal, 
        aiSettings.openRouterApiKey,
        undefined,
        aiSettings.selectedModel
      );
      if (structured && structured.ingredientText) {
        setIngredientText(structured.ingredientText);
        if (structured.productName) setProductName(structured.productName);
        if (structured.claimText) setFrontClaimText(structured.claimText);
        setSelectedSampleId('');
        handleReanalyze(structured.ingredientText, structured.claimText || frontClaimText, structured.productName || productName);
        setIsQuickPasteOpen(false);
        setQuickPasteInput('');
        showToast('Ingredients analyzed', 'success');
      }
    } catch (err) {
      setIngredientText(textToClean);
      setSelectedSampleId('');
      handleReanalyze(textToClean, frontClaimText, productName);
      setIsQuickPasteOpen(false);
      setQuickPasteInput('');
      showToast('Ingredients analyzed', 'info');
    } finally {
      setIsCleaningText(false);
    }
  };

  const handleBarcodeProductFound = (result: BarcodeLookupResult) => {
    setProductName(result.productName);
    setSaveBrand(result.brand);
    setIngredientText(result.ingredientText);
    setAnalysisResult(result.analysis);
    setSelectedSampleId('');
    showToast(`Found: ${result.productName}`, 'success');
  };

  const handleSaveToShelf = () => {
    const activeNames = analysisResult.detectedIngredients.map(d => d.ingredient.name);
    let topTier: EvidenceTier = 'supporting_ingredient';
    if (analysisResult.detectedIngredients.some(d => d.ingredient.evidenceTier === 'strong_evidence')) {
      topTier = 'strong_evidence';
    } else if (analysisResult.detectedIngredients.some(d => d.ingredient.evidenceTier === 'conditional_evidence')) {
      topTier = 'conditional_evidence';
    } else if (analysisResult.detectedIngredients.some(d => d.ingredient.evidenceTier === 'promising_limited')) {
      topTier = 'promising_limited';
    }

    addShelfProduct({
      name: productName || 'Scanned Wellness Product',
      brand: saveBrand || 'Custom Brand',
      category: (analysisResult.category.includes('Hair') ? 'Hair' : analysisResult.category.includes('Body') ? 'Body' : analysisResult.category.includes('Sleep') ? 'Sleep' : 'General') as any,
      relevantGoal: profile.primaryGoal,
      activeIngredients: activeNames.length > 0 ? activeNames : ['Active Botanical Complex'],
      evidenceSummary: analysisResult.summary.synthesisText,
      evidenceTier: topTier,
      timeOfDay: saveTimeOfDay,
      notes: `Scanned via Label Lens on ${new Date().toLocaleDateString('en-IN')}`
    });

    setSaveModalOpen(false);
    showToast('Saved to Smart Shelf', 'success');
  };

  return (
    <div className="space-y-5 pb-24 text-charcoal-900 animate-in fade-in duration-200">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        capture="environment"
        onChange={(e) => handleFileSelected(e, false)}
        className="hidden"
      />
      <input
        type="file"
        ref={frontFileInputRef}
        accept="image/*"
        capture="environment"
        onChange={(e) => handleFileSelected(e, true)}
        className="hidden"
      />

      {/* ========================================================================= */}
      {/* SUB-VIEW 1: AUDIT SHEET */}
      {/* ========================================================================= */}
      {activeSubView === 'audit_sheet' && (
        <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-mint-200/80 shadow-soft sticky top-0 z-20 backdrop-blur-md">
            <button
              onClick={() => setActiveSubView('hub')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-mint-100 hover:bg-mint-200 text-xs font-bold text-forest-900 transition active:scale-95"
            >
              <ArrowLeft className="w-4 h-4 text-forest-800" />
              <span>‹ Label Lens Hub</span>
            </button>
            <div className="text-right">
              <span className="text-[10px] font-mono font-bold text-charcoal-500 uppercase block">Active Product</span>
              <span className="text-xs font-black text-forest-950 truncate max-w-[180px] block">{productName}</span>
            </div>
          </div>

          <IngredientDebunkPaper
            productName={productName}
            brand={saveBrand}
            rawIngredientText={ingredientText}
            analysis={analysisResult}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 2: 4-DIMENSION MATRIX & SYNTHESIS */}
      {/* ========================================================================= */}
      {activeSubView === 'matrix' && (
        <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-mint-200/80 shadow-soft sticky top-0 z-20 backdrop-blur-md">
            <button
              onClick={() => setActiveSubView('hub')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-mint-100 hover:bg-mint-200 text-xs font-bold text-forest-900 transition active:scale-95"
            >
              <ArrowLeft className="w-4 h-4 text-forest-800" />
              <span>‹ Label Lens Hub</span>
            </button>
            <div className="text-right">
              <span className="text-[10px] font-mono font-bold text-charcoal-500 uppercase block">Scientific Matrix</span>
              <span className="text-xs font-black text-forest-950 truncate max-w-[180px] block">{productName}</span>
            </div>
          </div>

          <div className="p-6 sm:p-8 rounded-[2.5rem] bg-white border border-mint-200/80 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-forest-700 font-mono">
                  Objective 4-Pillar Metric
                </span>
                <h3 className="text-xl font-black text-forest-950">Scientific Evaluation Dimensions</h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-mint-100 text-forest-900 border border-mint-200 text-[11px] font-mono font-bold">
                {analysisResult.summary.goalRelevanceScore}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* 1. Goal Relevance */}
              <div className="p-4 rounded-[1.5rem] bg-cream-50/70 border border-mint-100 shadow-soft space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-500 font-mono">
                    1. Goal Relevance
                  </span>
                  <span className="text-xs">🎯</span>
                </div>
                <div className="text-lg font-black text-forest-950">
                  {analysisResult.summary.goalRelevanceScore}
                </div>
                <p className="text-xs text-charcoal-600 leading-relaxed">
                  {analysisResult.summary.goalRelevanceDescription}
                </p>
              </div>

              {/* 2. Evidence Quality */}
              <div className="p-4 rounded-[1.5rem] bg-cream-50/70 border border-mint-100 shadow-soft space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-500 font-mono">
                    2. Evidence Quality
                  </span>
                  <span className="text-xs">🔬</span>
                </div>
                <div className="text-lg font-black text-forest-950">
                  {analysisResult.summary.evidenceQualityScore}
                </div>
                <p className="text-xs text-charcoal-600 leading-relaxed">
                  {analysisResult.summary.evidenceQualityDescription}
                </p>
              </div>

              {/* 3. Dose Transparency */}
              <div className="p-4 rounded-[1.5rem] bg-cream-50/70 border border-mint-100 shadow-soft space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-500 font-mono">
                    3. Dose Transparency
                  </span>
                  <span className="text-xs">📊</span>
                </div>
                <div className="text-lg font-black text-forest-950">
                  {analysisResult.summary.doseTransparencyScore}
                </div>
                <p className="text-xs text-charcoal-600 leading-relaxed">
                  {analysisResult.summary.doseTransparencyDescription}
                </p>
              </div>

              {/* 4. Claim Credibility */}
              <div className="p-4 rounded-[1.5rem] bg-cream-50/70 border border-mint-100 shadow-soft space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-500 font-mono">
                    4. Claim Credibility
                  </span>
                  <span className="text-xs">🛡️</span>
                </div>
                <div className="text-lg font-black text-forest-950">
                  {analysisResult.summary.claimCredibilityScore}
                </div>
                <p className="text-xs text-charcoal-600 leading-relaxed">
                  {analysisResult.summary.claimCredibilityDescription}
                </p>
              </div>
            </div>

            {/* Synthesis Paragraph Card */}
            <div className="p-5 rounded-[1.5rem] bg-mint-50/80 border border-mint-200 text-xs sm:text-sm text-charcoal-800 leading-relaxed">
              <div className="flex items-center gap-1.5 text-forest-950 font-bold mb-2 uppercase tracking-wider text-[11px] font-mono">
                <Sparkles className="w-4 h-4 text-forest-800" />
                <span>Clinical Synthesis</span>
              </div>
              <p className="font-sans text-charcoal-800 leading-relaxed">
                "{analysisResult.summary.synthesisText}"
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 3: FRONT-PACK CLAIM AUDIT */}
      {/* ========================================================================= */}
      {activeSubView === 'claims' && (
        <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-mint-200/80 shadow-soft sticky top-0 z-20 backdrop-blur-md">
            <button
              onClick={() => setActiveSubView('hub')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-mint-100 hover:bg-mint-200 text-xs font-bold text-forest-900 transition active:scale-95"
            >
              <ArrowLeft className="w-4 h-4 text-forest-800" />
              <span>‹ Label Lens Hub</span>
            </button>
            <div className="text-right">
              <span className="text-[10px] font-mono font-bold text-charcoal-500 uppercase block">Claims Audited</span>
              <span className="text-xs font-black text-forest-950">{analysisResult.detectedClaims.length} Claims</span>
            </div>
          </div>

          <div className="space-y-3.5">
            {analysisResult.detectedClaims.length === 0 ? (
              <div className="p-8 rounded-[2rem] bg-white border border-mint-200/80 text-center space-y-2 shadow-card">
                <ShieldCheck className="w-8 h-8 text-charcoal-400 mx-auto" />
                <p className="text-sm font-bold text-forest-950">No front-pack marketing claims detected</p>
                <p className="text-xs text-charcoal-500">Add front label text like "Clinically Proven" or "100% Natural" to test credibility.</p>
              </div>
            ) : (
              analysisResult.detectedClaims.map((claim) => (
                <div
                  key={claim.id}
                  className="p-5 rounded-[2rem] bg-white border border-mint-200/80 shadow-card space-y-3.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-charcoal-500 uppercase tracking-wider font-mono">
                        Audited Claim Statement
                      </span>
                      <h4 className="text-base font-black text-forest-950 mt-0.5">
                        "{claim.displayName}"
                      </h4>
                    </div>
                    <VerdictBadge verdict={claim.verdict} size="sm" />
                  </div>

                  <div className="space-y-2 text-xs text-charcoal-800">
                    <div className="p-3.5 rounded-2xl bg-cream-50/70 border border-mint-100 space-y-1">
                      <strong className="text-forest-950 font-bold block text-xs">
                        What this phrase usually means:
                      </strong>
                      <p className="text-charcoal-600 leading-relaxed">{claim.whatItMeans}</p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-cream-50/70 border border-mint-100 space-y-1">
                      <strong className="text-forest-950 font-bold block text-xs">
                        What clinical evidence or data is missing:
                      </strong>
                      <p className="text-charcoal-600 leading-relaxed">{claim.missingInformation}</p>
                    </div>
                  </div>

                  <p className="text-xs text-charcoal-500 italic pt-2 border-t border-mint-100">
                    {claim.supportRationale}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 4: CLINICALLY UPGRADED ALTERNATIVES */}
      {/* ========================================================================= */}
      {activeSubView === 'alternatives' && (
        <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-mint-200/80 shadow-soft sticky top-0 z-20 backdrop-blur-md">
            <button
              onClick={() => setActiveSubView('hub')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-mint-100 hover:bg-mint-200 text-xs font-bold text-forest-900 transition active:scale-95"
            >
              <ArrowLeft className="w-4 h-4 text-forest-800" />
              <span>‹ Label Lens Hub</span>
            </button>
            <div className="text-right">
              <span className="text-[10px] font-mono font-bold text-charcoal-500 uppercase block">Formulation Matches</span>
              <span className="text-xs font-black text-forest-950">{matchingFormulations.length} Upgrades</span>
            </div>
          </div>

          <ClinicalRecommendations
            products={matchingFormulations}
            title="Evidence-Based Alternative Formulations"
            subtitle="Higher-bioavailability, clean-label clinical formulations matching the active ingredients detected on this label."
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 5: SAMPLE BENCHMARK LIBRARY */}
      {/* ========================================================================= */}
      {activeSubView === 'samples' && (
        <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-mint-200/80 shadow-soft sticky top-0 z-20 backdrop-blur-md">
            <button
              onClick={() => setActiveSubView('hub')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-mint-100 hover:bg-mint-200 text-xs font-bold text-forest-900 transition active:scale-95"
            >
              <ArrowLeft className="w-4 h-4 text-forest-800" />
              <span>‹ Label Lens Hub</span>
            </button>
            <div className="text-right">
              <span className="text-[10px] font-mono font-bold text-charcoal-500 uppercase block">Sample Library</span>
              <span className="text-xs font-black text-forest-950">{SAMPLE_PRODUCTS.length} Benchmarks</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {SAMPLE_PRODUCTS.map((sample) => {
              const isSelected = selectedSampleId === sample.id;
              return (
                <div
                  key={sample.id}
                  className={`p-5 rounded-[2rem] border transition-all duration-200 flex flex-col justify-between ${
                    isSelected
                      ? 'bg-mint-50/80 text-charcoal-900 border-mint-400 shadow-card'
                      : 'bg-white text-charcoal-800 border-mint-200/80 hover:border-mint-400 shadow-soft'
                  }`}
                >
                  <div className="space-y-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest font-mono text-forest-700">
                      {sample.category}
                    </span>
                    <h4 className="text-base font-black text-forest-950">
                      {sample.name}
                    </h4>
                    <p className="text-xs text-charcoal-600">
                      Brand: <span className="font-bold text-forest-900">{sample.brandSuggestion}</span>
                    </p>
                  </div>

                  <div className="pt-4 border-t border-mint-100 mt-4 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-charcoal-500">
                      {sample.suggestedClaims.length} Claims Included
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        handleSelectSample(sample);
                        setActiveSubView('audit_sheet');
                      }}
                      className="px-3.5 py-1.5 rounded-full text-xs font-extrabold transition active:scale-95 bg-forest-900 text-white hover:bg-forest-800 shadow-soft"
                    >
                      Audit This Sample ›
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 6: AI VISION & OCR INSPECTOR */}
      {/* ========================================================================= */}
      {activeSubView === 'ai_inspector' && latestDebugTrace && (
        <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-mint-200/80 shadow-soft sticky top-0 z-20 backdrop-blur-md">
            <button
              onClick={() => setActiveSubView('hub')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-mint-100 hover:bg-mint-200 text-xs font-bold text-forest-900 transition active:scale-95"
            >
              <ArrowLeft className="w-4 h-4 text-forest-800" />
              <span>‹ Label Lens Hub</span>
            </button>
            <div className="text-right">
              <span className="text-[10px] font-mono font-bold text-charcoal-500 uppercase block">Model Trace</span>
              <span className="text-xs font-black text-forest-950">{latestDebugTrace.model || 'Vision AI'}</span>
            </div>
          </div>

          <div className="p-6 rounded-[2rem] bg-white border border-mint-200/80 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-mint-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-mint-100 text-forest-900">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-forest-950">Live AI Extraction Trace</h3>
                  <p className="text-xs text-charcoal-500">Latency: {latestDebugTrace.durationMs || 0}ms • Tokens: {latestDebugTrace.tokens?.total_tokens || 'N/A'}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(latestDebugTrace.rawResponse || '');
                  setHasCopiedRaw(true);
                  setTimeout(() => setHasCopiedRaw(false), 2000);
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-cream-50 hover:bg-mint-100 border border-mint-200 text-xs font-bold text-forest-900 transition"
              >
                {hasCopiedRaw ? <Check className="w-3.5 h-3.5 text-forest-800" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{hasCopiedRaw ? 'Copied' : 'Copy JSON'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setDebugTab('response')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
                  debugTab === 'response' ? 'bg-forest-900 text-white font-extrabold shadow-soft' : 'bg-cream-50 text-charcoal-600 border border-mint-200'
                }`}
              >
                Raw LLM Response
              </button>
              <button
                onClick={() => setDebugTab('prompt')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
                  debugTab === 'prompt' ? 'bg-forest-900 text-white font-extrabold shadow-soft' : 'bg-cream-50 text-charcoal-600 border border-mint-200'
                }`}
              >
                Prompt Instructions Sent
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-forest-950 border border-forest-900 font-mono text-xs text-mint-300 whitespace-pre-wrap max-h-96 overflow-y-auto">
              {debugTab === 'response' ? (latestDebugTrace.rawResponse || 'No response recorded') : (latestDebugTrace.prompt || 'No prompt recorded')}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MAIN HUB VIEW (Nested Mobile Dashboard) */}
      {/* ========================================================================= */}
      {activeSubView === 'hub' && (
        <div className="space-y-6">
          {/* Top Title & Scanner Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-mint-100 text-forest-900 text-[10px] font-extrabold uppercase tracking-wider font-mono border border-mint-200">
                  Scientific Audit Suite
                </span>
                <span className="text-xs text-charcoal-500 font-mono font-medium">Hero Hub</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-forest-950 tracking-tight mt-1">
                Label Lens
              </h2>
              <p className="text-xs sm:text-sm text-charcoal-600 max-w-xl">
                Audit wellness labels against published literature, PubMed trials, and clinical dosages.
              </p>
            </div>

            <button
              onClick={() => setSaveModalOpen(true)}
              className="self-start sm:self-center flex items-center gap-2 px-4 py-2.5 rounded-full bg-forest-900 text-white hover:bg-forest-800 font-extrabold text-xs shadow-soft transition active:scale-95"
            >
              <BookmarkPlus className="w-4 h-4 text-mint-300" />
              <span>Save to Smart Shelf</span>
            </button>
          </div>

          {/* ACTIVE AUDITED PRODUCT CARD */}
          <div className="p-6 sm:p-8 rounded-[2.5rem] bg-white border border-mint-200/80 shadow-card relative overflow-hidden group">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-forest-700 uppercase tracking-widest font-mono">
                    Currently Loaded Product
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-mint-100 text-forest-800 border border-mint-200 text-[10px] font-mono font-bold">
                    Audited
                  </span>
                </div>
                <h3 className="text-2xl font-black text-forest-950 tracking-tight">
                  {productName}
                </h3>
                <p className="text-xs text-charcoal-600 font-medium">
                  Brand: <span className="text-forest-950 font-bold">{saveBrand}</span> • Category: <span className="text-forest-950 font-bold">{analysisResult.category}</span>
                </p>
              </div>

              {/* 4 Quick Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="px-3.5 py-2 rounded-2xl bg-cream-50/70 border border-mint-100 text-center">
                  <span className="text-[9px] font-mono uppercase text-charcoal-500 block">Relevance</span>
                  <span className="text-xs font-black text-forest-950">{analysisResult.summary.goalRelevanceScore}</span>
                </div>
                <div className="px-3.5 py-2 rounded-2xl bg-cream-50/70 border border-mint-100 text-center">
                  <span className="text-[9px] font-mono uppercase text-charcoal-500 block">Evidence</span>
                  <span className="text-xs font-black text-forest-950">{analysisResult.summary.evidenceQualityScore}</span>
                </div>
                <div className="px-3.5 py-2 rounded-2xl bg-cream-50/70 border border-mint-100 text-center">
                  <span className="text-[9px] font-mono uppercase text-charcoal-500 block">Dose Clarity</span>
                  <span className="text-xs font-black text-forest-950">{analysisResult.summary.doseTransparencyScore}</span>
                </div>
                <div className="px-3.5 py-2 rounded-2xl bg-cream-50/70 border border-mint-100 text-center">
                  <span className="text-[9px] font-mono uppercase text-charcoal-500 block">Claims</span>
                  <span className="text-xs font-black text-forest-950">{analysisResult.summary.claimCredibilityScore}</span>
                </div>
              </div>
            </div>

            {/* Quick Action Button into Audit Sheet */}
            <div className="mt-5 pt-4 border-t border-mint-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-charcoal-600">
                <FlaskConical className="w-4 h-4 text-forest-800" />
                <span><strong className="text-forest-950">{analysisResult.detectedIngredients.length}</strong> active compounds identified</span>
              </div>
              <button
                onClick={() => setActiveSubView('audit_sheet')}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-forest-900 text-white font-extrabold text-xs hover:bg-forest-800 transition active:scale-95 shadow-soft"
              >
                <span>View Rx Audit Sheet</span>
                <ChevronRight className="w-3.5 h-3.5 text-mint-300" />
              </button>
            </div>
          </div>

          {/* INSTANT SCAN ACTION BAR */}
          <div className="p-6 rounded-[2.5rem] bg-white border border-mint-200/80 shadow-card space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-forest-950 uppercase tracking-wider font-mono flex items-center gap-2">
                <Camera className="w-4 h-4 text-forest-800" />
                <span>Scan New Physical Product</span>
              </span>
              <button
                onClick={() => setShowManualEditor(!showManualEditor)}
                className="flex items-center gap-1 text-xs font-bold text-charcoal-600 hover:text-forest-900 transition"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{showManualEditor ? 'Hide Editor' : 'Edit Ingredients'}</span>
              </button>
            </div>

            {/* Barcode Primary CTA */}
            <button
              type="button"
              onClick={() => setIsBarcodeModalOpen(true)}
              disabled={isScanning}
              className="w-full p-4 rounded-full bg-forest-900 text-white hover:bg-forest-800 flex items-center justify-center gap-2.5 text-xs font-extrabold shadow-soft transition active:scale-[0.99]"
            >
              <ScanBarcode className="w-4 h-4 text-mint-300" />
              <span>Scan Barcode (Instant Optical Barcode Match)</span>
            </button>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isScanning}
                className="p-3.5 rounded-full bg-cream-50 hover:bg-mint-50 border border-mint-200 text-forest-950 flex items-center justify-center gap-2 text-xs font-bold transition disabled:opacity-50"
              >
                <Upload className="w-4 h-4 text-forest-800" />
                <span>Scan Bottle Photo</span>
              </button>

              <button
                type="button"
                onClick={() => setIsQuickPasteOpen(!isQuickPasteOpen)}
                className={`p-3.5 rounded-full border text-xs font-bold flex items-center justify-center gap-2 transition ${
                  isQuickPasteOpen
                    ? 'bg-forest-900 text-white border-forest-900 shadow-soft'
                    : 'bg-cream-50 hover:bg-mint-50 text-forest-950 border-mint-200'
                }`}
              >
                <ClipboardPaste className="w-4 h-4" />
                <span>Paste Text from Web</span>
              </button>
            </div>

            {/* Quick Paste Box */}
            {isQuickPasteOpen && (
              <div className="p-4 rounded-2xl bg-cream-50/70 border border-mint-200 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-forest-950 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-forest-800" />
                    Paste Product Ingredients / E-Commerce text
                  </span>
                  <span className="text-[10px] text-charcoal-500">Auto AI Denoise</span>
                </div>

                <textarea
                  value={quickPasteInput}
                  onChange={(e) => setQuickPasteInput(e.target.value)}
                  placeholder="Paste ingredients (e.g. 'Melatonin 5mg, L-Theanine 100mg, Pectin, Glucose Syrup, Citric Acid...')"
                  rows={3}
                  className="w-full p-3 rounded-xl bg-white border border-mint-200 text-xs text-charcoal-900 font-mono focus:outline-none focus:ring-2 focus:ring-mint-500 placeholder:text-charcoal-400"
                />

                <button
                  type="button"
                  onClick={() => handleQuickPasteClean()}
                  disabled={isCleaningText || !quickPasteInput.trim()}
                  className="w-full py-2.5 px-3 rounded-full bg-forest-900 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-soft transition disabled:opacity-50 hover:bg-forest-800"
                >
                  {isCleaningText ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5 animate-spin text-mint-300" />
                      <span>Isolating Actives with AI...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-3.5 h-3.5 text-mint-300" />
                      <span>Clean & Debunk On Canvas</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* OCR Progress */}
            {isScanning && (
              <div className="p-4 rounded-2xl bg-cream-50/70 border border-mint-200 space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-charcoal-700 font-medium flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 animate-spin text-forest-800" />
                    {scanProgress.status}
                  </span>
                  <span className="font-bold text-forest-950">{scanProgress.percent}%</span>
                </div>
                <div className="w-full bg-mint-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-forest-900 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${scanProgress.percent}%` }}
                  />
                </div>
              </div>
            )}

            {/* Manual Editor */}
            {showManualEditor && (
              <div className="pt-3 border-t border-mint-100 space-y-3 animate-in fade-in duration-200">
                <div>
                  <label className="block text-[11px] font-bold text-charcoal-600 uppercase tracking-wider mb-1">
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => {
                      setProductName(e.target.value);
                      handleReanalyze(ingredientText, frontClaimText, e.target.value);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-cream-50 border border-mint-200 text-xs text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-mint-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-charcoal-600 uppercase tracking-wider mb-1">
                    Raw Ingredient List
                  </label>
                  <textarea
                    value={ingredientText}
                    onChange={(e) => {
                      setIngredientText(e.target.value);
                      setSelectedSampleId('');
                      handleReanalyze(e.target.value, frontClaimText, productName);
                    }}
                    rows={4}
                    className="w-full px-3 py-2 rounded-xl bg-cream-50 border border-mint-200 text-xs text-charcoal-900 font-mono focus:outline-none focus:ring-2 focus:ring-mint-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* NESTED MOBILE APP DRILL-DOWN TILES */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-forest-700 uppercase tracking-wider block font-mono">
              Deep-Dive Scientific Modules
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Tile 1: Rx Clinical Audit Sheet */}
              <button
                type="button"
                onClick={() => setActiveSubView('audit_sheet')}
                className="p-5 rounded-[2rem] bg-white hover:bg-mint-50/30 border border-mint-200/80 hover:border-mint-400 text-left transition-all duration-200 flex items-center justify-between group shadow-card"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-mint-100 border border-mint-200 flex items-center justify-center text-forest-900 group-hover:scale-105 transition-transform">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-forest-950">
                      Clinical Rx Audit Sheet
                    </h4>
                    <p className="text-xs text-charcoal-600 mt-0.5">
                      {analysisResult.detectedIngredients.length} actives • PubMed trials & evidence tiers
                    </p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-cream-50 border border-mint-100 flex items-center justify-center text-charcoal-400 group-hover:text-forest-900 transition">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>

              {/* Tile 2: 4-Dimension Matrix & Synthesis */}
              <button
                type="button"
                onClick={() => setActiveSubView('matrix')}
                className="p-5 rounded-[2rem] bg-white hover:bg-mint-50/30 border border-mint-200/80 hover:border-mint-400 text-left transition-all duration-200 flex items-center justify-between group shadow-card"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-mint-100 border border-mint-200 flex items-center justify-center text-forest-900 group-hover:scale-105 transition-transform">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-forest-950">
                      4-Dimension Matrix
                    </h4>
                    <p className="text-xs text-charcoal-600 mt-0.5">
                      Relevance, evidence, dose & claim scorecards
                    </p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-cream-50 border border-mint-100 flex items-center justify-center text-charcoal-400 group-hover:text-forest-900 transition">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>

              {/* Tile 3: Front-Pack Claim Audit */}
              <button
                type="button"
                onClick={() => setActiveSubView('claims')}
                className="p-5 rounded-[2rem] bg-white hover:bg-mint-50/30 border border-mint-200/80 hover:border-mint-400 text-left transition-all duration-200 flex items-center justify-between group shadow-card"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-mint-100 border border-mint-200 flex items-center justify-center text-forest-900 group-hover:scale-105 transition-transform">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-forest-950">
                      Claim Credibility Audit
                    </h4>
                    <p className="text-xs text-charcoal-600 mt-0.5">
                      {analysisResult.detectedClaims.length} marketing claims verified
                    </p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-cream-50 border border-mint-100 flex items-center justify-center text-charcoal-400 group-hover:text-forest-900 transition">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>

              {/* Tile 4: Clinically Upgraded Alternatives */}
              <button
                type="button"
                onClick={() => setActiveSubView('alternatives')}
                className="p-5 rounded-[2rem] bg-white hover:bg-mint-50/30 border border-mint-200/80 hover:border-mint-400 text-left transition-all duration-200 flex items-center justify-between group shadow-card"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-mint-100 border border-mint-200 flex items-center justify-center text-forest-900 group-hover:scale-105 transition-transform">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-forest-950">
                      Alternative Formulations
                    </h4>
                    <p className="text-xs text-charcoal-600 mt-0.5">
                      {matchingFormulations.length} clinically matched formulations
                    </p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-cream-50 border border-mint-100 flex items-center justify-center text-charcoal-400 group-hover:text-forest-900 transition">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>

              {/* Tile 5: Sample Benchmark Library */}
              <button
                type="button"
                onClick={() => setActiveSubView('samples')}
                className="p-5 rounded-[2rem] bg-white hover:bg-mint-50/30 border border-mint-200/80 hover:border-mint-400 text-left transition-all duration-200 flex items-center justify-between group shadow-card"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-mint-100 border border-mint-200 flex items-center justify-center text-forest-900 group-hover:scale-105 transition-transform">
                    <Layers className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-forest-950">
                      Sample Benchmark Library
                    </h4>
                    <p className="text-xs text-charcoal-600 mt-0.5">
                      Test Hair, Sleep & Recovery reference labs
                    </p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-cream-50 border border-mint-100 flex items-center justify-center text-charcoal-400 group-hover:text-forest-900 transition">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>

              {/* Tile 6: AI Vision / OCR Trace Inspector (if trace available) */}
              {latestDebugTrace && (
                <button
                  type="button"
                  onClick={() => setActiveSubView('ai_inspector')}
                  className="p-5 rounded-[2rem] bg-white hover:bg-mint-50/30 border border-mint-200/80 hover:border-mint-400 text-left transition-all duration-200 flex items-center justify-between group shadow-card"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-mint-100 border border-mint-200 flex items-center justify-center text-forest-900 group-hover:scale-105 transition-transform">
                      <Terminal className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-base font-black text-forest-950">
                        AI Model Inspector
                      </h4>
                      <p className="text-xs text-charcoal-600 mt-0.5">
                        Latency: {latestDebugTrace.durationMs || 0}ms • Tokens: {latestDebugTrace.tokens?.total_tokens || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-cream-50 border border-mint-100 flex items-center justify-center text-charcoal-400 group-hover:text-forest-900 transition">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </button>
              )}
            </div>
          </div>

          <DisclaimerBanner />
        </div>
      )}

      {/* Save To Smart Shelf Modal */}
      {saveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] max-w-sm w-full p-6 shadow-modal border border-mint-200 space-y-4 text-charcoal-900">
            <div className="flex items-center justify-between border-b border-mint-100 pb-3">
              <div className="flex items-center gap-2">
                <BookmarkPlus className="w-5 h-5 text-forest-800" />
                <h3 className="text-base font-black text-forest-950">Save to Smart Shelf</h3>
              </div>
              <button
                onClick={() => setSaveModalOpen(false)}
                className="p-1 rounded-full text-charcoal-400 hover:text-charcoal-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-charcoal-600 mb-1">Product Title</label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-cream-50 border border-mint-200 text-charcoal-900 font-medium focus:outline-none focus:ring-2 focus:ring-mint-500"
                />
              </div>

              <div>
                <label className="block font-bold text-charcoal-600 mb-1">Brand Name</label>
                <input
                  type="text"
                  value={saveBrand}
                  onChange={(e) => setSaveBrand(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-cream-50 border border-mint-200 text-charcoal-900 font-medium focus:outline-none focus:ring-2 focus:ring-mint-500"
                />
              </div>

              <div>
                <label className="block font-bold text-charcoal-600 mb-1">Recommended Usage Time</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['morning', 'evening', 'both'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSaveTimeOfDay(t)}
                      className={`py-2 rounded-xl border text-center font-bold capitalize transition ${
                        saveTimeOfDay === t
                          ? 'bg-forest-900 text-white border-forest-900 shadow-soft'
                          : 'bg-cream-50 text-charcoal-600 border-mint-200 hover:bg-mint-50'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSaveModalOpen(false)}
                className="flex-1 py-3 rounded-full bg-cream-50 text-charcoal-700 font-bold text-xs hover:bg-mint-100 border border-mint-200 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveToShelf}
                className="flex-1 py-3 rounded-full bg-forest-900 text-white font-extrabold text-xs shadow-soft hover:bg-forest-800 transition"
              >
                Save Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barcode Scanner Viewfinder Modal */}
      <BarcodeScannerModal
        isOpen={isBarcodeModalOpen}
        onClose={() => setIsBarcodeModalOpen(false)}
        onProductFound={handleBarcodeProductFound}
        userGoal={profile.primaryGoal}
      />
    </div>
  );
};
