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
  Code2,
  Copy,
  Check,
  X
} from 'lucide-react';

export const LabelLensView: React.FC = () => {
  const { profile, addShelfProduct, showToast, aiSettings } = useApp();

  const [productName, setProductName] = useState<string>('Follicle Reactivate Scalp Serum');
  const [frontClaimText, setFrontClaimText] = useState<string>(SAMPLE_PRODUCTS[0].frontLabelText);
  const [ingredientText, setIngredientText] = useState<string>(SAMPLE_PRODUCTS[0].ingredientLabelText);
  const [selectedSampleId, setSelectedSampleId] = useState<string>(SAMPLE_PRODUCTS[0].id);

  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState<boolean>(false);

  const [scanProgress, setScanProgress] = useState<{ percent: number; status: string }>({ percent: 0, status: '' });
  const [showManualEditor, setShowManualEditor] = useState<boolean>(false);
  const [activeAnalysisTab, setActiveAnalysisTab] = useState<'all' | 'ingredients' | 'claims'>('all');

  // Quick Paste Drawer
  const [isQuickPasteOpen, setIsQuickPasteOpen] = useState<boolean>(false);
  const [quickPasteInput, setQuickPasteInput] = useState<string>('');
  const [isCleaningText, setIsCleaningText] = useState<boolean>(false);

  // AI Inspector State
  const [latestDebugTrace, setLatestDebugTrace] = useState<any>(null);
  const [isDebugModalOpen, setIsDebugModalOpen] = useState<boolean>(false);
  const [debugTab, setDebugTab] = useState<'response' | 'image' | 'prompt' | 'parsed'>('response');
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
    showToast(`Loaded sample: ${sample.name}`, 'info');
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
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8 animate-in fade-in duration-200 text-white">
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

      {/* Top Hero Banner */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-white/10 text-white text-[10px] font-extrabold uppercase tracking-wider font-mono border border-white/10">
            Scientific Audit
          </span>
          <span className="text-xs text-zinc-400 font-mono font-medium">Hero Feature</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Label Lens
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
          Decode what's inside wellness packaging. We audit active ingredient evidence against published literature and evaluate marketing claim credibility.
        </p>
      </div>

      {/* Desktop 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (Desktop: 5 cols): Inputs, Sample Selectors, Scanner, Manual Editor */}
        <div className="lg:col-span-5 space-y-5">
          {/* 3 Sample Product Selectors */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block font-mono">
              Choose a Sample Product or Upload:
            </span>
            <div className="grid grid-cols-3 gap-2">
              {SAMPLE_PRODUCTS.map((sample) => {
                const isSelected = selectedSampleId === sample.id;
                return (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => handleSelectSample(sample)}
                    className={`p-3.5 rounded-[1.5rem] border text-left transition-all duration-200 flex flex-col justify-between ${
                      isSelected
                        ? 'bg-white text-black border-white shadow-lg'
                        : 'bg-[#121217] text-zinc-300 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div>
                      <span className={`text-[10px] font-bold block truncate font-mono ${isSelected ? 'text-[#FF3B30]' : 'text-zinc-400'}`}>
                        {sample.category}
                      </span>
                      <p className={`text-xs font-black mt-1 line-clamp-2 leading-tight ${isSelected ? 'text-black' : 'text-white'}`}>
                        {sample.name.split(' ')[0]} {sample.name.split(' ')[1]}
                      </p>
                    </div>
                    <span className={`text-[9px] mt-2 block font-medium ${isSelected ? 'text-zinc-700' : 'text-zinc-500'}`}>
                      {sample.suggestedClaims.length} claims
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Capture / Upload & Manual Edit Action Bar */}
          <div className="p-6 rounded-[2rem] bg-[#0C0C10] border border-white/10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#FF3B30]" />
                <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Scan Your Physical Label
                </span>
              </div>

              <div className="flex items-center gap-2">
                {latestDebugTrace && (
                  <button
                    onClick={() => setIsDebugModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-[11px] font-bold hover:bg-white/20 transition active:scale-95"
                  >
                    <Terminal className="w-3 h-3 text-[#FF3B30]" />
                    <span>Inspect AI Trace</span>
                  </button>
                )}

                <button
                  onClick={() => setShowManualEditor(!showManualEditor)}
                  className="flex items-center gap-1 text-xs font-bold text-zinc-400 hover:text-white transition"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{showManualEditor ? 'Hide Editor' : 'Edit Text'}</span>
                </button>
              </div>
            </div>

            {/* Barcode Scanner Primary Button */}
            <button
              type="button"
              onClick={() => setIsBarcodeModalOpen(true)}
              disabled={isScanning}
              className="w-full p-4 rounded-full bg-white text-black hover:bg-zinc-200 flex items-center justify-center gap-2.5 text-xs font-extrabold shadow-lg transition-all active:scale-[0.99]"
            >
              <ScanBarcode className="w-4 h-4 text-[#FF3B30] animate-pulse" />
              <span>Scan Product Barcode (Instant 100% Match)</span>
            </button>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isScanning}
                className="p-3 rounded-full bg-[#14141C] hover:bg-[#1E1E28] border border-white/10 text-white flex items-center justify-center gap-2 text-xs font-bold transition disabled:opacity-50"
              >
                <Upload className="w-4 h-4 text-[#FF3B30]" />
                <span>Scan Bottle Photo</span>
              </button>

              <button
                type="button"
                onClick={() => setIsQuickPasteOpen(!isQuickPasteOpen)}
                className={`p-3 rounded-full border text-xs font-bold flex items-center justify-center gap-2 transition ${
                  isQuickPasteOpen
                    ? 'bg-white text-black border-white shadow-md'
                    : 'bg-[#14141C] hover:bg-[#1E1E28] text-white border-white/10'
                }`}
              >
                <ClipboardPaste className="w-4 h-4 text-[#FF3B30]" />
                <span>Paste from Web</span>
              </button>
            </div>

            {/* Quick Paste Drawer */}
            {isQuickPasteOpen && (
              <div className="p-4 rounded-2xl bg-[#14141C] border border-white/10 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#FF3B30]" />
                    <span className="text-xs font-bold text-white">
                      Paste from ChatGPT / Product Page
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-zinc-400">
                    Auto-Filters Noise
                  </span>
                </div>

                <textarea
                  value={quickPasteInput}
                  onChange={(e) => setQuickPasteInput(e.target.value)}
                  placeholder="Paste ingredients (e.g. 'Melatonin 5mg, L-Theanine 10mg, Pectin, Glucose Syrup, Citric Acid...')"
                  rows={3}
                  className="w-full p-3 rounded-xl bg-black/50 border border-white/10 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-[#FF3B30] placeholder:text-zinc-500"
                />

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickPasteClean()}
                    disabled={isCleaningText || !quickPasteInput.trim()}
                    className="flex-1 py-2.5 px-3 rounded-full bg-white text-black font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm transition disabled:opacity-50 hover:bg-zinc-200"
                  >
                    {isCleaningText ? (
                      <>
                        <Sparkles className="w-3.5 h-3.5 animate-spin text-[#FF3B30]" />
                        <span>Isolating Actives with AI...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 text-[#FF3B30]" />
                        <span>Clean & Debunk on Canvas</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* OCR In-Flight Progress */}
            {isScanning && (
              <div className="p-4 rounded-2xl bg-[#14141C] border border-white/10 text-white space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-300 font-medium flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 animate-spin text-[#FF3B30]" />
                    {scanProgress.status}
                  </span>
                  <span className="font-bold text-white">{scanProgress.percent}%</span>
                </div>
                <div className="w-full bg-black/40 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-[#FF3B30] h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${scanProgress.percent}%` }}
                  />
                </div>
              </div>
            )}

            {/* Manual Text Editor Drawer */}
            {showManualEditor && (
              <div className="pt-3 border-t border-white/10 space-y-3 animate-in fade-in duration-200">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => {
                      setProductName(e.target.value);
                      handleReanalyze(ingredientText, frontClaimText, e.target.value);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#FF3B30]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
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
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-[#FF3B30]"
                  />
                </div>
              </div>
            )}
          </div>

          <DisclaimerBanner />
        </div>

        {/* Right Column (Desktop: 7 cols): 4-Dimension Matrix, Summary, Ingredients & Claims */}
        <div className="lg:col-span-7 space-y-5">
          {/* 4-DIMENSION EVALUATION MATRIX */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-white">
                Scientific Evaluation Dimensions
              </h3>
              <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
                4-Pillar Matrix
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* 1. Goal Relevance */}
              <div className="p-4 rounded-[1.5rem] bg-[#121217] border border-white/10 shadow-card space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono">
                  1. Goal Relevance
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-base font-extrabold text-white">
                    {analysisResult.summary.goalRelevanceScore}
                  </span>
                  <span className="text-sm">🎯</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-tight">
                  {analysisResult.summary.goalRelevanceDescription}
                </p>
              </div>

              {/* 2. Evidence Quality */}
              <div className="p-4 rounded-[1.5rem] bg-[#121217] border border-white/10 shadow-card space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono">
                  2. Evidence Quality
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-base font-extrabold text-white">
                    {analysisResult.summary.evidenceQualityScore}
                  </span>
                  <span className="text-sm">🔬</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-tight">
                  {analysisResult.summary.evidenceQualityDescription}
                </p>
              </div>

              {/* 3. Dose Transparency */}
              <div className="p-4 rounded-[1.5rem] bg-[#121217] border border-white/10 shadow-card space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono">
                  3. Dose Transparency
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-base font-extrabold text-white">
                    {analysisResult.summary.doseTransparencyScore}
                  </span>
                  <span className="text-sm">📊</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-tight">
                  {analysisResult.summary.doseTransparencyDescription}
                </p>
              </div>

              {/* 4. Claim Credibility */}
              <div className="p-4 rounded-[1.5rem] bg-[#121217] border border-white/10 shadow-card space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono">
                  4. Claim Credibility
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-base font-extrabold text-white">
                    {analysisResult.summary.claimCredibilityScore}
                  </span>
                  <span className="text-sm">🛡️</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-tight">
                  {analysisResult.summary.claimCredibilityDescription}
                </p>
              </div>
            </div>

            {/* Synthesis Paragraph Card */}
            <div className="p-5 rounded-[2rem] bg-[#121217] border border-white/10 text-xs sm:text-sm text-zinc-300 leading-relaxed shadow-card">
              <div className="flex items-center gap-1.5 text-white font-bold mb-1.5 uppercase tracking-wider text-[11px] font-mono">
                <Sparkles className="w-4 h-4 text-[#FF3B30]" />
                <span>Synthesis Summary</span>
              </div>
              <p className="font-sans text-zinc-300">
                "{analysisResult.summary.synthesisText}"
              </p>
            </div>
          </div>

          {/* Save to Smart Shelf CTA */}
          <div className="flex items-center justify-between p-5 bg-[#0C0C10] rounded-[2rem] border border-white/10 text-white shadow-2xl">
            <div>
              <h4 className="text-sm sm:text-base font-black text-white">Save this analysis</h4>
              <p className="text-xs text-zinc-400">Organize this product in your Smart Shelf and link it to your routine.</p>
            </div>
            <button
              onClick={() => setSaveModalOpen(true)}
              className="px-4 py-2 rounded-full bg-white text-black font-extrabold text-xs shadow-md flex items-center gap-1.5 transition shrink-0 hover:bg-zinc-200"
            >
              <BookmarkPlus className="w-4 h-4 text-[#FF3B30]" />
              <span>Save to Shelf</span>
            </button>
          </div>

          {/* Section Tabs: All, Ingredients, Claims */}
          <div className="flex items-center gap-2 border-b border-white/10 pb-2.5">
            <button
              onClick={() => setActiveAnalysisTab('all')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
                activeAnalysisTab === 'all'
                  ? 'bg-white text-black font-extrabold'
                  : 'bg-[#121217] text-zinc-400 hover:text-white'
              }`}
            >
              All ({analysisResult.detectedIngredients.length + analysisResult.detectedClaims.length})
            </button>
            <button
              onClick={() => setActiveAnalysisTab('ingredients')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
                activeAnalysisTab === 'ingredients'
                  ? 'bg-white text-black font-extrabold'
                  : 'bg-[#121217] text-zinc-400 hover:text-white'
              }`}
            >
              Ingredients ({analysisResult.detectedIngredients.length})
            </button>
            <button
              onClick={() => setActiveAnalysisTab('claims')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
                activeAnalysisTab === 'claims'
                  ? 'bg-white text-black font-extrabold'
                  : 'bg-[#121217] text-zinc-400 hover:text-white'
              }`}
            >
              Claims ({analysisResult.detectedClaims.length})
            </button>
          </div>

          {/* THE CLINICAL INGREDIENT DEBUNK PAPER */}
          {(activeAnalysisTab === 'all' || activeAnalysisTab === 'ingredients') && (
            <div className="space-y-3">
              <IngredientDebunkPaper
                productName={productName}
                brand={saveBrand}
                rawIngredientText={ingredientText}
                analysis={analysisResult}
              />
            </div>
          )}

          {/* CLAIM AUDIT BREAKDOWN */}
          {(activeAnalysisTab === 'all' || activeAnalysisTab === 'claims') && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Front-Pack Claim Analysis</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-zinc-300 font-mono">
                    {analysisResult.detectedClaims.length} detected
                  </span>
                </h3>
              </div>

              {analysisResult.detectedClaims.length === 0 ? (
                <div className="p-6 rounded-2xl bg-[#121217] border border-white/10 text-center text-xs text-zinc-400">
                  No front-pack marketing claims detected. Add claims like "Clinically Proven" or "100% Natural" to test.
                </div>
              ) : (
                <div className="space-y-3">
                  {analysisResult.detectedClaims.map((claim) => (
                    <div
                      key={claim.id}
                      className="p-5 rounded-[2rem] bg-[#121217] border border-white/10 shadow-card space-y-3 transition hover:border-white/20"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono">
                            Detected Claim
                          </span>
                          <h4 className="text-base font-black text-white">
                            "{claim.displayName}"
                          </h4>
                        </div>
                        <VerdictBadge verdict={claim.verdict} size="sm" />
                      </div>

                      <div className="space-y-2 text-xs sm:text-sm text-zinc-300">
                        <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                          <strong className="text-white font-bold block text-xs">
                            What this phrase usually means:
                          </strong>
                          <p className="text-zinc-400">{claim.whatItMeans}</p>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                          <strong className="text-white font-bold block text-xs">
                            What clinical evidence or data is missing:
                          </strong>
                          <p className="text-zinc-400">{claim.missingInformation}</p>
                        </div>
                      </div>

                      <p className="text-xs text-zinc-500 italic pt-1.5 border-t border-white/10">
                        {claim.supportRationale}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Clinically Matched Alternative Formulations */}
          <ClinicalRecommendations
            products={matchingFormulations}
            title="Evidence-Based Alternative Formulations"
            subtitle="Higher-bioavailability, clean-label clinical formulations matching the active ingredients detected on this label."
          />
        </div>
      </div>

      {/* Save To Smart Shelf Modal */}
      {saveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#121218] rounded-[2rem] max-w-sm w-full p-6 shadow-2xl border border-white/10 space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <BookmarkPlus className="w-5 h-5 text-[#FF3B30]" />
                <h3 className="text-base font-black text-white">Save to Smart Shelf</h3>
              </div>
              <button
                onClick={() => setSaveModalOpen(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-zinc-400 mb-1">Product Title</label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white font-medium focus:outline-none focus:ring-1 focus:ring-[#FF3B30]"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-400 mb-1">Brand Name</label>
                <input
                  type="text"
                  value={saveBrand}
                  onChange={(e) => setSaveBrand(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white font-medium focus:outline-none focus:ring-1 focus:ring-[#FF3B30]"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-400 mb-1">Recommended Usage Time</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['morning', 'evening', 'both'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSaveTimeOfDay(t)}
                      className={`py-2 rounded-xl border text-center font-bold capitalize transition ${
                        saveTimeOfDay === t
                          ? 'bg-white text-black border-white'
                          : 'bg-black/40 text-zinc-400 border-white/5 hover:bg-white/5'
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
                className="flex-1 py-3 rounded-full bg-white/10 text-zinc-300 font-bold text-xs hover:bg-white/20 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveToShelf}
                className="flex-1 py-3 rounded-full bg-white text-black font-extrabold text-xs shadow-lg hover:bg-zinc-200 transition"
              >
                Save Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Inspector / Debug Modal */}
      {isDebugModalOpen && latestDebugTrace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#121218] text-white rounded-[2rem] max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-white/10 overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#181822]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-black/40 text-[#FF3B30]">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>AI Model Processing Inspector</span>
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-white text-[10px] font-mono">
                      {latestDebugTrace.model}
                    </span>
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Live raw payload & JSON inspection
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsDebugModalOpen(false)}
                className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Metrics Bar */}
            <div className="px-5 py-2.5 bg-black/30 border-b border-white/10 flex items-center justify-between text-[11px] font-mono text-zinc-400">
              <div className="flex items-center gap-4">
                <span>⏱️ Latency: <strong className="text-white">{latestDebugTrace.durationMs || 0}ms</strong></span>
                {latestDebugTrace.tokens && (
                  <span>📊 Tokens: <strong className="text-white">{latestDebugTrace.tokens.total_tokens || latestDebugTrace.tokens.completion_tokens || 'N/A'}</strong></span>
                )}
              </div>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(latestDebugTrace.rawResponse || '');
                  setHasCopiedRaw(true);
                  setTimeout(() => setHasCopiedRaw(false), 2000);
                }}
                className="flex items-center gap-1 text-[11px] text-[#FF3B30] hover:text-white font-sans font-bold transition"
              >
                {hasCopiedRaw ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Raw</span>
                  </>
                )}
              </button>
            </div>

            {/* Tabs */}
            <div className="px-5 pt-3 border-b border-white/10 flex items-center gap-2 bg-[#121218]">
              <button
                onClick={() => setDebugTab('response')}
                className={`pb-2.5 px-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 ${
                  debugTab === 'response'
                    ? 'border-white text-white'
                    : 'border-transparent text-zinc-500 hover:text-white'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Raw AI Response</span>
              </button>

              <button
                onClick={() => setDebugTab('prompt')}
                className={`pb-2.5 px-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 ${
                  debugTab === 'prompt'
                    ? 'border-white text-white'
                    : 'border-transparent text-zinc-500 hover:text-white'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Prompt Sent</span>
              </button>
            </div>

            {/* Content Area */}
            <div className="p-5 overflow-y-auto flex-1 font-mono text-xs">
              {debugTab === 'response' && (
                <div className="p-4 rounded-2xl bg-black/50 border border-white/5 text-emerald-400 whitespace-pre-wrap leading-relaxed overflow-x-auto">
                  {latestDebugTrace.rawResponse || 'No raw response recorded'}
                </div>
              )}

              {debugTab === 'prompt' && (
                <div className="p-4 rounded-2xl bg-black/50 border border-white/5 text-zinc-300 whitespace-pre-wrap leading-relaxed overflow-x-auto">
                  {latestDebugTrace.prompt || 'No prompt recorded'}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 bg-[#181822] flex items-center justify-between font-sans">
              <span className="text-[11px] text-zinc-400">
                Dev inspector for AI prompts and responses.
              </span>
              <button
                onClick={() => setIsDebugModalOpen(false)}
                className="py-2 px-4 rounded-full bg-white text-black font-extrabold text-xs shadow-md transition hover:bg-zinc-200"
              >
                Close
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
