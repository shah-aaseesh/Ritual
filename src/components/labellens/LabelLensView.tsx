import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { SAMPLE_PRODUCTS, SampleProductLabel } from '../../data/sampleProducts';
import { analyzeLabelText } from '../../services/analyzer';
import { extractLabelFromImageWithAI } from '../../services/aiService';
import { ProductAnalysisResult, EvidenceTier } from '../../types';
import { VerdictBadge } from '../common/EvidenceBadge';
import { DisclaimerBanner } from '../common/DisclaimerBanner';
import { BarcodeScannerModal } from '../common/BarcodeScannerModal';
import { IngredientDebunkPaper } from '../common/IngredientDebunkPaper';
import { BarcodeLookupResult } from '../../services/barcodeService';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  Edit3, 
  BookmarkPlus,
  ScanBarcode
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

  const [analysisResult, setAnalysisResult] = useState<ProductAnalysisResult>(() => {
    return analyzeLabelText(
      SAMPLE_PRODUCTS[0].ingredientLabelText,
      SAMPLE_PRODUCTS[0].frontLabelText,
      profile.primaryGoal,
      SAMPLE_PRODUCTS[0].name
    );
  });

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
      const visionRes = await extractLabelFromImageWithAI(
        file,
        profile.primaryGoal,
        aiSettings.openRouterApiKey,
        aiSettings.selectedModel,
        (percent, status) => setScanProgress({ percent, status })
      );

      if (isFrontLabel) {
        const combinedClaims = `${frontClaimText} ${visionRes.claimText || visionRes.ingredientText}`.trim();
        setFrontClaimText(combinedClaims);
        if (visionRes.productName && visionRes.productName !== 'Scanned Product') {
          setProductName(visionRes.productName);
        }
        if (visionRes.brand) {
          setSaveBrand(visionRes.brand);
        }
        handleReanalyze(ingredientText, combinedClaims, visionRes.productName || productName);
        showToast('Front label claims analyzed directly with Vision AI', 'success');
      } else {
        setIngredientText(visionRes.ingredientText);
        if (visionRes.claimText && !frontClaimText) {
          setFrontClaimText(visionRes.claimText);
        }
        if (visionRes.productName && visionRes.productName !== 'Scanned Product') {
          setProductName(visionRes.productName);
        }
        if (visionRes.brand) {
          setSaveBrand(visionRes.brand);
        }
        setSelectedSampleId('');
        setAnalysisResult(visionRes.analysis);
        showToast(
          visionRes.source === 'openrouter_vision'
            ? 'Multimodal Vision AI decoded ingredients & claims directly from image!'
            : 'Ingredient label parsed & analyzed',
          'success'
        );
      }
    } catch (err) {
      showToast('Scanner encountered an error. You can paste ingredients or pick a sample.', 'warning');
    } finally {
      setIsScanning(false);
      setScanProgress({ percent: 0, status: '' });
      if (e.target) e.target.value = '';
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
    <div className="space-y-6 pb-20 md:pb-8 animate-in fade-in duration-200">
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
          <span className="px-2.5 py-0.5 rounded-full bg-forest-900 text-mint-300 text-[10px] font-bold uppercase tracking-wider">
            Scientific Audit
          </span>
          <span className="text-xs text-charcoal-500 font-medium">Hero Feature</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-forest-950 tracking-tight">
          Label Lens
        </h2>
        <p className="text-xs sm:text-sm text-charcoal-600 max-w-2xl leading-relaxed">
          Decode what's inside wellness packaging. We audit active ingredient evidence against published dermatological literature and evaluate marketing claim credibility.
        </p>
      </div>

      {/* Desktop 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (Desktop: 5 cols): Inputs, Sample Selectors, Scanner, Manual Editor */}
        <div className="lg:col-span-5 space-y-6">
          {/* 3 Sample Product Selectors */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-forest-900 uppercase tracking-wider block">
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
                    className={`p-3 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between ${
                      isSelected
                        ? 'bg-forest-900 text-cream-50 border-forest-900 shadow-card'
                        : 'bg-white text-charcoal-800 border-cream-300 hover:border-mint-300 shadow-soft'
                    }`}
                  >
                    <div>
                      <span className={`text-[10px] font-bold block truncate ${isSelected ? 'text-mint-300' : 'text-forest-800'}`}>
                        {sample.category}
                      </span>
                      <p className={`text-xs font-bold mt-1 line-clamp-2 leading-tight ${isSelected ? 'text-cream-50' : 'text-forest-950'}`}>
                        {sample.name.split(' ')[0]} {sample.name.split(' ')[1]}
                      </p>
                    </div>
                    <span className={`text-[9px] mt-2 block font-medium ${isSelected ? 'text-cream-300' : 'text-charcoal-500'}`}>
                      {sample.suggestedClaims.length} claims
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Capture / Upload & Manual Edit Action Bar */}
          <div className="p-5 rounded-3xl bg-white border border-cream-300 shadow-card space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-forest-800" />
                <span className="text-xs font-bold text-forest-950 uppercase tracking-wider">
                  Scan Your Physical Label
                </span>
              </div>

              <button
                onClick={() => setShowManualEditor(!showManualEditor)}
                className="flex items-center gap-1 text-xs font-semibold text-forest-800 hover:text-mint-600 transition"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{showManualEditor ? 'Hide Text Editor' : 'Edit Text'}</span>
              </button>
            </div>

            {/* Barcode Scanner Primary Button */}
            <button
              type="button"
              onClick={() => setIsBarcodeModalOpen(true)}
              disabled={isScanning}
              className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-forest-900 to-forest-800 hover:from-forest-800 hover:to-forest-700 text-cream-50 flex items-center justify-center gap-2.5 text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.99] border border-forest-700/60"
            >
              <ScanBarcode className="w-4 h-4 text-mint-400 animate-pulse" />
              <span>Scan Product Barcode (Instant 100% Match)</span>
            </button>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => frontFileInputRef.current?.click()}
                disabled={isScanning}
                className="p-3 rounded-2xl bg-cream-100 hover:bg-cream-200 border border-cream-300 text-charcoal-800 flex items-center justify-center gap-2 text-xs font-semibold transition disabled:opacity-50"
              >
                <Camera className="w-4 h-4 text-forest-800" />
                <span>Scan Front Claims</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isScanning}
                className="p-3 rounded-2xl bg-cream-100 hover:bg-cream-200 border border-cream-300 text-charcoal-800 flex items-center justify-center gap-2 text-xs font-semibold transition disabled:opacity-50"
              >
                <Upload className="w-4 h-4 text-forest-800" />
                <span>Scan Bottle Photo</span>
              </button>
            </div>

            {/* OCR In-Flight Progress */}
            {isScanning && (
              <div className="p-3.5 rounded-2xl bg-forest-950 text-cream-50 space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-mint-300 font-medium flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    {scanProgress.status}
                  </span>
                  <span className="font-bold text-white">{scanProgress.percent}%</span>
                </div>
                <div className="w-full bg-forest-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-mint-400 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${scanProgress.percent}%` }}
                  />
                </div>
              </div>
            )}

            {/* Manual Text Editor Drawer */}
            {showManualEditor && (
              <div className="pt-3 border-t border-cream-200 space-y-3 animate-in fade-in duration-200">
                <div>
                  <label className="block text-[11px] font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => {
                      setProductName(e.target.value);
                      handleReanalyze(ingredientText, frontClaimText, e.target.value);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-cream-50 border border-cream-300 text-xs text-charcoal-900 focus:outline-none focus:ring-1 focus:ring-forest-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
                    Front Claims Text (e.g. "Clinically Proven, 100% Natural, Dermatologist Tested")
                  </label>
                  <input
                    type="text"
                    value={frontClaimText}
                    onChange={(e) => {
                      setFrontClaimText(e.target.value);
                      handleReanalyze(ingredientText, e.target.value, productName);
                    }}
                    placeholder="Paste front packaging claims"
                    className="w-full px-3 py-2 rounded-xl bg-cream-50 border border-cream-300 text-xs text-charcoal-900 focus:outline-none focus:ring-1 focus:ring-forest-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
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
                    placeholder="Paste comma-separated ingredients list"
                    className="w-full px-3 py-2 rounded-xl bg-cream-50 border border-cream-300 text-xs text-charcoal-900 font-mono focus:outline-none focus:ring-1 focus:ring-forest-800"
                  />
                </div>
              </div>
            )}
          </div>

          <DisclaimerBanner />
        </div>

        {/* Right Column (Desktop: 7 cols): 4-Dimension Matrix, Summary, Ingredients & Claims */}
        <div className="lg:col-span-7 space-y-6">
          {/* ========================================================================= */}
          {/* 4-DIMENSION EVALUATION MATRIX                                             */}
          {/* ========================================================================= */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-forest-950">
                Scientific Evaluation Dimensions
              </h3>
              <span className="text-[10px] font-semibold text-charcoal-500 uppercase tracking-wider">
                4-Pillar Matrix
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
              {/* 1. Goal Relevance */}
              <div className="p-4 rounded-3xl bg-white border border-cream-300 shadow-soft space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-500">
                  1. Goal Relevance
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-forest-950">
                    {analysisResult.summary.goalRelevanceScore}
                  </span>
                  <span className="text-sm">
                    {analysisResult.summary.goalRelevanceScore === 'High' ? '🎯' : analysisResult.summary.goalRelevanceScore === 'Moderate' ? '⚖️' : '⚪'}
                  </span>
                </div>
                <p className="text-[11px] text-charcoal-600 leading-tight">
                  {analysisResult.summary.goalRelevanceDescription}
                </p>
              </div>

              {/* 2. Evidence Quality */}
              <div className="p-4 rounded-3xl bg-white border border-cream-300 shadow-soft space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-500">
                  2. Evidence Quality
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-forest-950">
                    {analysisResult.summary.evidenceQualityScore}
                  </span>
                  <span className="text-sm">
                    {analysisResult.summary.evidenceQualityScore === 'Strong' ? '🔬' : '🧪'}
                  </span>
                </div>
                <p className="text-[11px] text-charcoal-600 leading-tight">
                  {analysisResult.summary.evidenceQualityDescription}
                </p>
              </div>

              {/* 3. Dose Transparency */}
              <div className="p-4 rounded-3xl bg-white border border-cream-300 shadow-soft space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-500">
                  3. Dose Transparency
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-forest-950">
                    {analysisResult.summary.doseTransparencyScore}
                  </span>
                  <span className="text-sm">
                    {analysisResult.summary.doseTransparencyScore === 'Transparent' ? '📊' : '🔍'}
                  </span>
                </div>
                <p className="text-[11px] text-charcoal-600 leading-tight">
                  {analysisResult.summary.doseTransparencyDescription}
                </p>
              </div>

              {/* 4. Claim Credibility */}
              <div className="p-4 rounded-3xl bg-white border border-cream-300 shadow-soft space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-500">
                  4. Claim Credibility
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-forest-950">
                    {analysisResult.summary.claimCredibilityScore}
                  </span>
                  <span className="text-sm">
                    {analysisResult.summary.claimCredibilityScore === 'Credible' ? '🛡️' : '📢'}
                  </span>
                </div>
                <p className="text-[11px] text-charcoal-600 leading-tight">
                  {analysisResult.summary.claimCredibilityDescription}
                </p>
              </div>
            </div>

            {/* Synthesis Paragraph Card */}
            <div className="p-4 sm:p-5 rounded-3xl bg-mint-50/90 border border-mint-200 text-xs sm:text-sm text-charcoal-800 leading-relaxed shadow-soft">
              <div className="flex items-center gap-1.5 text-forest-900 font-bold mb-1.5 uppercase tracking-wider text-[11px]">
                <Sparkles className="w-4 h-4 text-mint-600" />
                <span>Synthesis Summary</span>
              </div>
              <p className="font-sans text-charcoal-700">
                "{analysisResult.summary.synthesisText}"
              </p>
            </div>
          </div>

          {/* Save to Smart Shelf CTA */}
          <div className="flex items-center justify-between p-4 sm:p-5 bg-gradient-to-r from-forest-900 to-forest-800 rounded-3xl text-cream-50 shadow-card">
            <div>
              <h4 className="text-sm sm:text-base font-bold text-white">Save this analysis</h4>
              <p className="text-xs text-cream-200">Organize this product in your Smart Shelf and link it to your routine.</p>
            </div>
            <button
              onClick={() => setSaveModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-cream-50 hover:bg-cream-100 text-forest-950 font-bold text-xs sm:text-sm shadow-soft flex items-center gap-1.5 transition shrink-0"
            >
              <BookmarkPlus className="w-4 h-4 text-forest-900" />
              <span>Save to Shelf</span>
            </button>
          </div>

          {/* Section Tabs: All, Ingredients, Claims */}
          <div className="flex items-center gap-2 border-b border-cream-200 pb-2.5">
            <button
              onClick={() => setActiveAnalysisTab('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeAnalysisTab === 'all'
                  ? 'bg-forest-900 text-cream-50'
                  : 'bg-cream-100 text-charcoal-600 hover:bg-cream-200'
              }`}
            >
              All Insights ({analysisResult.detectedIngredients.length + analysisResult.detectedClaims.length})
            </button>
            <button
              onClick={() => setActiveAnalysisTab('ingredients')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeAnalysisTab === 'ingredients'
                  ? 'bg-forest-900 text-cream-50'
                  : 'bg-cream-100 text-charcoal-600 hover:bg-cream-200'
              }`}
            >
              Ingredients ({analysisResult.detectedIngredients.length})
            </button>
            <button
              onClick={() => setActiveAnalysisTab('claims')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeAnalysisTab === 'claims'
                  ? 'bg-forest-900 text-cream-50'
                  : 'bg-cream-100 text-charcoal-600 hover:bg-cream-200'
              }`}
            >
              Claims ({analysisResult.detectedClaims.length})
            </button>
          </div>

          {/* ========================================================================= */}
          {/* THE SIGNATURE CLINICAL INGREDIENT DEBUNK PAPER                            */}
          {/* ========================================================================= */}
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

          {/* ========================================================================= */}
          {/* CLAIM AUDIT BREAKDOWN                                                     */}
          {/* ========================================================================= */}
          {(activeAnalysisTab === 'all' || activeAnalysisTab === 'claims') && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-forest-950 flex items-center gap-2">
                  <span>Front-Pack Claim Analysis</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-cream-200 text-charcoal-700">
                    {analysisResult.detectedClaims.length} detected
                  </span>
                </h3>
              </div>

              {analysisResult.detectedClaims.length === 0 ? (
                <div className="p-6 rounded-2xl bg-white border border-cream-300 text-center text-xs text-charcoal-500">
                  No front-pack marketing claims detected. Add claims like "Clinically Proven" or "100% Natural" to test.
                </div>
              ) : (
                <div className="space-y-3">
                  {analysisResult.detectedClaims.map((claim) => (
                    <div
                      key={claim.id}
                      className="p-4 sm:p-5 rounded-3xl bg-white border border-cream-300 shadow-soft space-y-3 transition hover:border-coral-200"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold text-charcoal-400 uppercase tracking-wider">
                            Detected Claim
                          </span>
                          <h4 className="text-sm sm:text-base font-bold text-forest-950">
                            "{claim.displayName}"
                          </h4>
                        </div>
                        <VerdictBadge verdict={claim.verdict} size="sm" />
                      </div>

                      <div className="space-y-2 text-xs sm:text-sm text-charcoal-700">
                        <div className="p-3 rounded-2xl bg-cream-50 border border-cream-200 space-y-1">
                          <strong className="text-forest-900 font-semibold block text-xs">
                            What this phrase usually means:
                          </strong>
                          <p className="text-charcoal-600">{claim.whatItMeans}</p>
                        </div>

                        <div className="p-3 rounded-2xl bg-cream-50 border border-cream-200 space-y-1">
                          <strong className="text-forest-900 font-semibold block text-xs">
                            What clinical evidence or data is missing:
                          </strong>
                          <p className="text-charcoal-600">{claim.missingInformation}</p>
                        </div>
                      </div>

                      <p className="text-xs text-charcoal-500 italic pt-1.5 border-t border-cream-100">
                        {claim.supportRationale}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Save To Smart Shelf Modal */}
      {saveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-cream-50 rounded-3xl max-w-sm w-full p-6 shadow-modal border border-cream-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookmarkPlus className="w-5 h-5 text-forest-800" />
                <h3 className="text-base font-bold text-forest-950">Save to Smart Shelf</h3>
              </div>
              <button
                onClick={() => setSaveModalOpen(false)}
                className="p-1 rounded-full text-charcoal-400 hover:text-charcoal-700 hover:bg-cream-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-charcoal-700 mb-1">Product Title</label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-cream-300 text-charcoal-900 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-charcoal-700 mb-1">Brand Name</label>
                <input
                  type="text"
                  value={saveBrand}
                  onChange={(e) => setSaveBrand(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-cream-300 text-charcoal-900 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-charcoal-700 mb-1">Recommended Usage Time</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['morning', 'evening', 'both'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSaveTimeOfDay(t)}
                      className={`py-2 rounded-xl border text-center font-medium capitalize transition ${
                        saveTimeOfDay === t
                          ? 'bg-forest-900 text-cream-50 border-forest-900 font-bold'
                          : 'bg-white text-charcoal-700 border-cream-200'
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
                className="flex-1 py-2.5 rounded-xl bg-cream-200 text-charcoal-700 font-semibold text-xs hover:bg-cream-300 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveToShelf}
                className="flex-1 py-2.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-cream-50 font-bold text-xs shadow-soft transition"
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
