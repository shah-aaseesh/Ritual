import React, { useState, useRef, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { SAMPLE_PRODUCTS, SampleProductLabel } from '../../data/sampleProducts';
import { analyzeLabelText } from '../../services/analyzer';
import { extractLabelFromImageWithAI, findMatchingMosaicProducts } from '../../services/aiService';
import { ProductAnalysisResult, EvidenceTier } from '../../types';
import { BarcodeScannerModal } from '../common/BarcodeScannerModal';
import { IngredientDebunkPaper } from '../common/IngredientDebunkPaper';
import { BarcodeLookupResult } from '../../services/barcodeService';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  ScanBarcode, 
  FileText, 
  ShieldCheck, 
  X, 
  AlertTriangle, 
  Award, 
  BookmarkPlus,
  ThumbsDown,
  ThumbsUp,
  Info
} from 'lucide-react';

type MythBusterTab = 'audit_paper' | 'claims_matrix' | 'science_pillars' | 'alternatives';

export const LabelLensView: React.FC = () => {
  const { profile, addShelfProduct, showToast, aiSettings } = useApp();

  // Active Results Tab
  const [activeTab, setActiveTab] = useState<MythBusterTab>('audit_paper');

  // ============================================================================
  // DUAL CAPTURE STATE: FRONT (CLAIMS) & BACK (INGREDIENTS)
  // ============================================================================
  const [productName, setProductName] = useState<string>('Follicle Reactivate 3% Redensyl + Rosemary Scalp Serum');
  const [saveBrand, setSaveBrand] = useState<string>('Apex Derma Lab');
  
  // Front Label State
  const [frontClaimText, setFrontClaimText] = useState<string>(SAMPLE_PRODUCTS[0].frontLabelText);
  const [frontImageThumbnail, setFrontImageThumbnail] = useState<string | null>(null);

  // Back Label State
  const [ingredientText, setIngredientText] = useState<string>(SAMPLE_PRODUCTS[0].ingredientLabelText);
  const [backImageThumbnail, setBackImageThumbnail] = useState<string | null>(null);

  // Selected Sample
  const [selectedSampleId, setSelectedSampleId] = useState<string>(SAMPLE_PRODUCTS[0].id);

  // Scanning / Vision AI Progress
  const [isScanningFront, setIsScanningFront] = useState<boolean>(false);
  const [isScanningBack, setIsScanningBack] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<{ percent: number; status: string }>({ percent: 0, status: '' });

  // Modals
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState<boolean>(false);
  const [saveModalOpen, setSaveModalOpen] = useState<boolean>(false);
  const [saveTimeOfDay, setSaveTimeOfDay] = useState<'morning' | 'evening' | 'both'>('evening');

  // File Input References
  const frontFileInputRef = useRef<HTMLInputElement>(null);
  const backFileInputRef = useRef<HTMLInputElement>(null);

  // ============================================================================
  // ANALYSIS ENGINE (RUNS CROSS-EXAMINATION ON INGREDIENTS & CLAIMS)
  // ============================================================================
  const [analysisResult, setAnalysisResult] = useState<ProductAnalysisResult>(() => {
    return analyzeLabelText(
      SAMPLE_PRODUCTS[0].ingredientLabelText,
      SAMPLE_PRODUCTS[0].frontLabelText,
      profile.primaryGoal,
      SAMPLE_PRODUCTS[0].name
    );
  });

  const handleReanalyze = (newIngText: string, newClaimText: string, newName: string) => {
    const res = analyzeLabelText(newIngText, newClaimText, profile.primaryGoal, newName);
    setAnalysisResult(res);
  };

  const handleSelectSample = (sample: SampleProductLabel) => {
    setSelectedSampleId(sample.id);
    setProductName(sample.name);
    setFrontClaimText(sample.frontLabelText);
    setIngredientText(sample.ingredientLabelText);
    setSaveBrand(sample.brandSuggestion);
    setFrontImageThumbnail(null);
    setBackImageThumbnail(null);

    const res = analyzeLabelText(
      sample.ingredientLabelText,
      sample.frontLabelText,
      profile.primaryGoal,
      sample.name
    );
    setAnalysisResult(res);
    showToast(`Loaded sample: ${sample.name}`, 'info');
  };

  // Process Vision AI for Front Label (Claims & Name)
  const handleFrontFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onload = () => setFrontImageThumbnail(reader.result as string);
    reader.readAsDataURL(file);

    setIsScanningFront(true);
    setScanProgress({ percent: 20, status: 'Scanning Front Label for marketing claims & brand...' });

    try {
      const result = await extractLabelFromImageWithAI(
        file,
        profile.primaryGoal,
        aiSettings.openRouterApiKey,
        aiSettings.selectedModel,
        (pct, msg) => setScanProgress({ percent: pct, status: msg })
      );

      const claims = result.claimText || result.ingredientText;
      setFrontClaimText(claims);
      if (result.productName) setProductName(result.productName);
      if (result.brand) setSaveBrand(result.brand);

      handleReanalyze(ingredientText, claims, result.productName || productName);
      setSelectedSampleId('');
      showToast('Front label claims extracted successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Vision AI scan failed. You can type claims manually.', 'warning');
    } finally {
      setIsScanningFront(false);
      setScanProgress({ percent: 0, status: '' });
    }
  };

  // Process Vision AI for Back Label (Ingredients & Dosage)
  const handleBackFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onload = () => setBackImageThumbnail(reader.result as string);
    reader.readAsDataURL(file);

    setIsScanningBack(true);
    setScanProgress({ percent: 20, status: 'Scanning Back Label for ingredients & active concentrations...' });

    try {
      const result = await extractLabelFromImageWithAI(
        file,
        profile.primaryGoal,
        aiSettings.openRouterApiKey,
        aiSettings.selectedModel,
        (pct, msg) => setScanProgress({ percent: pct, status: msg })
      );

      setIngredientText(result.ingredientText);
      if (result.productName && productName === 'Scanned Product') setProductName(result.productName);
      if (result.brand && saveBrand === 'Apex Derma Lab') setSaveBrand(result.brand);

      handleReanalyze(result.ingredientText, frontClaimText, result.productName || productName);
      setSelectedSampleId('');
      showToast('Back label ingredients parsed successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Vision AI scan failed. You can paste ingredients manually.', 'warning');
    } finally {
      setIsScanningBack(false);
      setScanProgress({ percent: 0, status: '' });
    }
  };

  const handleBarcodeProductFound = (result: BarcodeLookupResult) => {
    setProductName(result.productName);
    setSaveBrand(result.brand);
    setIngredientText(result.ingredientText);
    setAnalysisResult(result.analysis);
    setSelectedSampleId('');
    showToast(`Found product via barcode: ${result.productName}`, 'success');
  };

  // Matching Clinical Alternatives
  const matchingFormulations = useMemo(() => {
    const activeNames = analysisResult?.detectedIngredients?.map(i => i.ingredient?.name || i.rawTextMatch) || [];
    return findMatchingMosaicProducts(activeNames, profile.primaryGoal);
  }, [analysisResult?.detectedIngredients, profile.primaryGoal]);

  // Save Product to Smart Shelf
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
      name: productName || 'Audited Wellness Product',
      brand: saveBrand || 'Custom Brand',
      category: (analysisResult.category.includes('Hair') ? 'Hair' : analysisResult.category.includes('Body') ? 'Body' : analysisResult.category.includes('Sleep') ? 'Sleep' : 'General') as any,
      relevantGoal: profile.primaryGoal,
      activeIngredients: activeNames.length > 0 ? activeNames : ['Active Botanical Complex'],
      evidenceSummary: analysisResult.summary.synthesisText,
      evidenceTier: topTier,
      timeOfDay: saveTimeOfDay,
      notes: `Audited via Myth Buster on ${new Date().toLocaleDateString('en-IN')}`
    });

    setSaveModalOpen(false);
    showToast('Saved product to Smart Shelf!', 'success');
  };

  const claimsCount = analysisResult.detectedClaims.length;

  return (
    <div className="space-y-6 pb-28 text-charcoal-900 font-sans">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={frontFileInputRef}
        accept="image/*"
        capture="environment"
        onChange={handleFrontFileSelected}
        className="hidden"
      />
      <input
        type="file"
        ref={backFileInputRef}
        accept="image/*"
        capture="environment"
        onChange={handleBackFileSelected}
        className="hidden"
      />

      {/* ========================================================================= */}
      {/* 🛡️ HERO BANNER: DUAL FRONT & BACK CAPTURE / AUDIT ENGINE                  */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border border-mint-200/80 shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-mint-100 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-mint-100 text-forest-800 text-[10px] font-black uppercase tracking-wider font-mono border border-mint-200">
                CLINICAL MYTH BUSTER
              </span>
              <span className="text-xs text-charcoal-500 font-mono">
                Front Claims vs Back Formulation Cross-Examination
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-forest-950 tracking-tight mt-1">
              Label Lens & Myth Buster
            </h1>
            <p className="text-xs text-charcoal-600 mt-1 max-w-xl">
              Snap both Front (Claims & Buzzwords) and Back (Ingredients List) to uncover marketing exaggerations, fairy dusting, and true clinical actives.
            </p>
          </div>

          {/* Quick Barcode Scanner Button */}
          <button
            type="button"
            onClick={() => setIsBarcodeModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-cream-50 hover:bg-mint-100 border border-mint-200 text-forest-900 font-black text-xs flex items-center gap-2 shadow-soft transition active:scale-95 shrink-0"
          >
            <ScanBarcode className="w-4 h-4 text-forest-800" />
            <span>Scan Barcode</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* 📸 DUAL CAPTURE SLOTS: FRONT (CLAIMS) & BACK (INGREDIENTS)                 */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* SLOT 1: FRONT LABEL (MARKETING CLAIMS & BUZZWORDS) */}
          <div className="p-5 rounded-[2rem] bg-cream-50/70 border border-mint-200/80 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-forest-900 text-white font-mono text-xs font-black flex items-center justify-center">
                    1
                  </span>
                  <h3 className="text-sm font-black text-forest-950 uppercase tracking-wider font-mono">
                    Front Label (Claims)
                  </h3>
                </div>

                <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded-full border border-mint-200 text-forest-800">
                  {claimsCount} Claims Found
                </span>
              </div>

              <p className="text-[11px] text-charcoal-600">
                Marketing promises, buzzwords & product name (e.g. "10x Fast Growth", "100% Organic", "No Chemicals").
              </p>

              {/* Photo Preview / Upload Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => frontFileInputRef.current?.click()}
                  disabled={isScanningFront}
                  className="flex-1 py-2 rounded-xl bg-white hover:bg-mint-100 border border-mint-200 text-forest-900 font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-soft"
                >
                  <Camera className="w-3.5 h-3.5 text-forest-800" />
                  <span>{isScanningFront ? 'AI Scanning...' : frontImageThumbnail ? 'Retake Front' : 'Snap Front Photo'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => frontFileInputRef.current?.click()}
                  disabled={isScanningFront}
                  className="p-2 rounded-xl bg-white hover:bg-mint-100 border border-mint-200 text-forest-900 transition"
                  title="Upload Front Image"
                >
                  <Upload className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Editable Front Claim Textarea */}
              <textarea
                rows={2}
                value={frontClaimText}
                onChange={(e) => {
                  setFrontClaimText(e.target.value);
                  handleReanalyze(ingredientText, e.target.value, productName);
                }}
                placeholder="Type or edit front label claims (e.g. '100% Chemical-Free, Regrows Hair in 14 Days')..."
                className="w-full p-2.5 rounded-xl bg-white border border-mint-200 text-xs text-charcoal-800 font-medium focus:outline-none focus:ring-2 focus:ring-mint-500 resize-none font-mono"
              />
            </div>

            {/* Front Photo Thumbnail Preview */}
            {frontImageThumbnail && (
              <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-mint-100 text-[11px]">
                <div className="flex items-center gap-2 truncate">
                  <img src={frontImageThumbnail} alt="Front Thumbnail" className="w-8 h-8 rounded-lg object-cover border border-mint-200" />
                  <span className="font-bold text-forest-950 truncate">Front photo captured</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFrontImageThumbnail(null)}
                  className="text-charcoal-400 hover:text-rose-600 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* SLOT 2: BACK LABEL (FULL INGREDIENTS LIST & DOSING) */}
          <div className="p-5 rounded-[2rem] bg-cream-50/70 border border-mint-200/80 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-forest-900 text-white font-mono text-xs font-black flex items-center justify-center">
                    2
                  </span>
                  <h3 className="text-sm font-black text-forest-950 uppercase tracking-wider font-mono">
                    Back Label (Ingredients)
                  </h3>
                </div>

                <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded-full border border-mint-200 text-forest-800">
                  {analysisResult.detectedIngredients.length} Compounds Parsed
                </span>
              </div>

              <p className="text-[11px] text-charcoal-600">
                Full ingredient (INCI) composition, carrier oils, excipients, and declared active percentages.
              </p>

              {/* Photo Preview / Upload Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => backFileInputRef.current?.click()}
                  disabled={isScanningBack}
                  className="flex-1 py-2 rounded-xl bg-white hover:bg-mint-100 border border-mint-200 text-forest-900 font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-soft"
                >
                  <Camera className="w-3.5 h-3.5 text-forest-800" />
                  <span>{isScanningBack ? 'AI Scanning...' : backImageThumbnail ? 'Retake Back' : 'Snap Back Photo'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => backFileInputRef.current?.click()}
                  disabled={isScanningBack}
                  className="p-2 rounded-xl bg-white hover:bg-mint-100 border border-mint-200 text-forest-900 transition"
                  title="Upload Back Image"
                >
                  <Upload className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Editable Ingredients Textarea */}
              <textarea
                rows={2}
                value={ingredientText}
                onChange={(e) => {
                  setIngredientText(e.target.value);
                  handleReanalyze(e.target.value, frontClaimText, productName);
                }}
                placeholder="Paste or edit ingredients list (e.g. 'Water, Redensyl 3%, Rosemary Oil 1%, Glycerin, Phenoxyethanol')..."
                className="w-full p-2.5 rounded-xl bg-white border border-mint-200 text-xs text-charcoal-800 font-medium focus:outline-none focus:ring-2 focus:ring-mint-500 resize-none font-mono"
              />
            </div>

            {/* Back Photo Thumbnail Preview */}
            {backImageThumbnail && (
              <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-mint-100 text-[11px]">
                <div className="flex items-center gap-2 truncate">
                  <img src={backImageThumbnail} alt="Back Thumbnail" className="w-8 h-8 rounded-lg object-cover border border-mint-200" />
                  <span className="font-bold text-forest-950 truncate">Back photo captured</span>
                </div>
                <button
                  type="button"
                  onClick={() => setBackImageThumbnail(null)}
                  className="text-charcoal-400 hover:text-rose-600 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Scanning Live Status Banner */}
        {(isScanningFront || isScanningBack) && (
          <div className="p-4 rounded-2xl bg-mint-100/80 border border-mint-300 flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-forest-800 animate-spin" />
              <span className="text-xs font-bold text-forest-950 font-mono">
                {scanProgress.status || 'Multimodal Vision AI processing label pixels...'}
              </span>
            </div>
            <span className="text-xs font-mono font-black text-forest-900">{scanProgress.percent}%</span>
          </div>
        )}

        {/* Quick Pre-Loaded Sample Debunk Products Carousel */}
        <div className="space-y-2 pt-2">
          <span className="text-[11px] font-mono font-bold uppercase text-charcoal-500 block">
            Or Test with Pre-Loaded Real-World Debunk Samples:
          </span>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {SAMPLE_PRODUCTS.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => handleSelectSample(sample)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 flex items-center gap-1.5 ${
                  selectedSampleId === sample.id
                    ? 'bg-forest-900 text-white shadow-soft font-black'
                    : 'bg-cream-50 text-charcoal-700 hover:bg-mint-100 hover:text-forest-900 border border-mint-200'
                }`}
              >
                <span>{sample.name.split(' ')[0]} {sample.name.split(' ')[1]}</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                  sample.bannerBadge.includes('Busted') || sample.bannerBadge.includes('Alert')
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-mint-100 text-forest-800'
                }`}>
                  {sample.bannerBadge.split(' ')[0]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🧭 MYTH BUSTER AUDIT REPORT TABS                                          */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-[2.5rem] p-3 sm:p-4 border border-mint-200/80 shadow-card flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('audit_paper')}
            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 whitespace-nowrap active:scale-95 ${
              activeTab === 'audit_paper'
                ? 'bg-forest-900 text-white shadow-soft'
                : 'bg-cream-50 text-charcoal-700 hover:bg-mint-100 hover:text-forest-900 border border-mint-100'
            }`}
          >
            <FileText className="w-4 h-4 text-mint-300" />
            <span>Formulation Debunk Paper</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('claims_matrix')}
            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 whitespace-nowrap active:scale-95 ${
              activeTab === 'claims_matrix'
                ? 'bg-forest-900 text-white shadow-soft'
                : 'bg-cream-50 text-charcoal-700 hover:bg-mint-100 hover:text-forest-900 border border-mint-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-mint-400" />
            <span>Front Claims vs Back Reality ({claimsCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('science_pillars')}
            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 whitespace-nowrap active:scale-95 ${
              activeTab === 'science_pillars'
                ? 'bg-forest-900 text-white shadow-soft'
                : 'bg-cream-50 text-charcoal-700 hover:bg-mint-100 hover:text-forest-900 border border-mint-100'
            }`}
          >
            <Award className="w-4 h-4 text-forest-700" />
            <span>4-Pillar Scientific Matrix</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('alternatives')}
            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 whitespace-nowrap active:scale-95 ${
              activeTab === 'alternatives'
                ? 'bg-forest-900 text-white shadow-soft'
                : 'bg-cream-50 text-charcoal-700 hover:bg-mint-100 hover:text-forest-900 border border-mint-100'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Clinical Formulations ({matchingFormulations.length})</span>
          </button>
        </div>

        {/* Save to Smart Shelf CTA */}
        <button
          type="button"
          onClick={() => setSaveModalOpen(true)}
          className="hidden md:flex px-4 py-2 rounded-2xl bg-forest-900 hover:bg-forest-800 text-white font-extrabold text-xs items-center gap-1.5 shrink-0 transition active:scale-95 shadow-soft"
        >
          <BookmarkPlus className="w-3.5 h-3.5 text-mint-300" />
          <span>Save to Smart Shelf</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 📜 TAB 1: FORMULATION DEBUNK PAPER (ANIMATED STRIKETHROUGH REPORT)        */}
      {/* ========================================================================= */}
      {activeTab === 'audit_paper' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <IngredientDebunkPaper
            productName={productName}
            brand={saveBrand}
            rawIngredientText={ingredientText}
            analysis={analysisResult}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* ⚔️ TAB 2: FRONT CLAIMS VS BACK REALITY CROSS-EXAMINATION MATRIX           */}
      {/* ========================================================================= */}
      {activeTab === 'claims_matrix' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border border-mint-200/80 shadow-card space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-mint-100 pb-5">
              <div>
                <span className="text-[10px] font-mono font-black uppercase text-forest-700 tracking-wider block">
                  CROSS-EXAMINATION REPORT
                </span>
                <h2 className="text-2xl font-black text-forest-950 mt-0.5">
                  Front Marketing Claims vs Back Chemistry
                </h2>
                <p className="text-xs text-charcoal-600 mt-0.5">
                  We cross-examined every front-pack promise against the physical ingredients and declared clinical dosage.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-mint-100 text-forest-800 font-mono font-black text-xs border border-mint-200">
                  {claimsCount} Promises Audited
                </span>
              </div>
            </div>

            {/* Claims Audit Cards List */}
            {analysisResult.detectedClaims.length === 0 ? (
              <div className="p-8 rounded-2xl bg-cream-50/70 border border-mint-100 text-center text-xs text-charcoal-600">
                No specific marketing buzzwords detected. Type your front-label claims in the top box above to audit!
              </div>
            ) : (
              <div className="space-y-4">
                {analysisResult.detectedClaims.map((claim, cIdx) => {
                  const isPositive = claim.verdict === 'supported';
                  const isUnderdosed = claim.verdict === 'partially_supported' || claim.verdict === 'too_vague_to_verify';
                  const isBusted = claim.verdict === 'marketing_heavy';

                  return (
                    <div
                      key={cIdx}
                      className={`p-5 rounded-[2rem] border transition shadow-soft space-y-3.5 ${
                        isPositive
                          ? 'bg-emerald-50/40 border-emerald-300'
                          : isUnderdosed
                          ? 'bg-amber-50/40 border-amber-300'
                          : 'bg-rose-50/40 border-rose-300'
                      }`}
                    >
                      {/* Top Header: Claim Name & Myth Buster Verdict */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/5 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black font-mono px-2 py-0.5 rounded-md bg-white border border-black/10 text-charcoal-800">
                            Claim #{cIdx + 1}
                          </span>
                          <h3 className="text-base font-black text-forest-950">
                            "{claim.displayName}"
                          </h3>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {isPositive && (
                            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs font-mono flex items-center gap-1 border border-emerald-300">
                              <ThumbsUp className="w-3.5 h-3.5" />
                              <span>Clinically Validated</span>
                            </span>
                          )}
                          {isUnderdosed && (
                            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-black text-xs font-mono flex items-center gap-1 border border-amber-300">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>Vague / Unregulated Marketing</span>
                            </span>
                          )}
                          {isBusted && (
                            <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 font-black text-xs font-mono flex items-center gap-1 border border-rose-300">
                              <ThumbsDown className="w-3.5 h-3.5" />
                              <span>Busted Marketing Gimmick</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Side-by-Side Comparison: Front Promise vs Back Reality */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="p-3.5 rounded-xl bg-white/90 border border-black/5 space-y-1">
                          <span className="text-[10px] font-mono font-black uppercase text-charcoal-500 block">
                            Front Marketing Promise:
                          </span>
                          <p className="text-xs font-bold text-forest-950">
                            {claim.displayName}
                          </p>
                          <p className="text-[11px] text-charcoal-600">
                            {claim.whatItMeans}
                          </p>
                        </div>

                        <div className="p-3.5 rounded-xl bg-white/90 border border-black/5 space-y-1">
                          <span className="text-[10px] font-mono font-black uppercase text-charcoal-500 block">
                            Back Formulation Reality:
                          </span>
                          <p className="text-xs font-bold text-forest-950">
                            {claim.supportRationale}
                          </p>
                          {claim.missingInformation && (
                            <span className="text-[10px] text-amber-700 font-mono font-bold block">
                              Missing Info: {claim.missingInformation}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Scientific Citation / Educational Takeaway */}
                      <div className="flex items-center gap-2 text-[11px] text-charcoal-700 bg-white/60 p-2.5 rounded-xl border border-black/5">
                        <Info className="w-4 h-4 text-forest-800 shrink-0" />
                        <span>
                          <strong>Clinical Insight:</strong> Therapeutic efficacy requires declared active concentrations meeting peer-reviewed clinical trial benchmarks rather than marketing buzzwords.
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🔬 TAB 3: 4-PILLAR SCIENTIFIC MATRIX                                      */}
      {/* ========================================================================= */}
      {activeTab === 'science_pillars' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-6 sm:p-8 rounded-[2.5rem] bg-white border border-mint-200/80 shadow-card space-y-5">
            <div className="flex items-center justify-between border-b border-mint-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-forest-700 font-mono">
                  OBJECTIVE 4-PILLAR METRIC
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-forest-950">
                  Scientific Evaluation Dimensions
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-mint-100 text-forest-900 border border-mint-200 text-xs font-mono font-black">
                {analysisResult.summary.goalRelevanceScore} Relevance
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 1. Goal Relevance */}
              <div className="p-5 rounded-2xl bg-cream-50/70 border border-mint-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-500 font-mono">
                    1. Goal Relevance
                  </span>
                  <span className="text-sm">🎯</span>
                </div>
                <div className="text-lg font-black text-forest-950">
                  {analysisResult.summary.goalRelevanceScore}
                </div>
                <p className="text-xs text-charcoal-600 leading-relaxed">
                  {analysisResult.summary.goalRelevanceDescription}
                </p>
              </div>

              {/* 2. Evidence Quality */}
              <div className="p-5 rounded-2xl bg-cream-50/70 border border-mint-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-500 font-mono">
                    2. Evidence Quality
                  </span>
                  <span className="text-sm">🔬</span>
                </div>
                <div className="text-lg font-black text-forest-950">
                  {analysisResult.summary.evidenceQualityScore}
                </div>
                <p className="text-xs text-charcoal-600 leading-relaxed">
                  {analysisResult.summary.evidenceQualityDescription}
                </p>
              </div>

              {/* 3. Dose Transparency */}
              <div className="p-5 rounded-2xl bg-cream-50/70 border border-mint-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-500 font-mono">
                    3. Dose Transparency
                  </span>
                  <span className="text-sm">📊</span>
                </div>
                <div className="text-lg font-black text-forest-950">
                  {analysisResult.summary.doseTransparencyScore}
                </div>
                <p className="text-xs text-charcoal-600 leading-relaxed">
                  {analysisResult.summary.doseTransparencyDescription}
                </p>
              </div>

              {/* 4. Claim Credibility */}
              <div className="p-5 rounded-2xl bg-cream-50/70 border border-mint-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-500 font-mono">
                    4. Claim Credibility
                  </span>
                  <span className="text-sm">🛡️</span>
                </div>
                <div className="text-lg font-black text-forest-950">
                  {analysisResult.summary.claimCredibilityScore}
                </div>
                <p className="text-xs text-charcoal-600 leading-relaxed">
                  {analysisResult.summary.claimCredibilityDescription}
                </p>
              </div>
            </div>

            {/* Clinical Synthesis Box */}
            <div className="p-5 rounded-2xl bg-mint-50/90 border border-mint-200 text-xs sm:text-sm text-charcoal-800 space-y-2">
              <div className="flex items-center gap-1.5 text-forest-950 font-bold uppercase tracking-wider text-[11px] font-mono">
                <Sparkles className="w-4 h-4 text-forest-800" />
                <span>Clinical Pharmacological Synthesis</span>
              </div>
              <p className="font-sans text-charcoal-800 leading-relaxed">
                "{analysisResult.summary.synthesisText}"
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🌿 TAB 4: CLINICAL ALTERNATIVES & MOSAIC WELLNESS FORMULATIONS            */}
      {/* ========================================================================= */}
      {activeTab === 'alternatives' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border border-mint-200/80 shadow-card space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-mint-100 pb-5">
              <div>
                <span className="text-[10px] font-mono font-black uppercase text-forest-700 tracking-widest block">
                  TRANSPARENT FORMULATIONS
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-forest-950 mt-1">
                  Evidence-Backed Clinical Formulations
                </h2>
                <p className="text-xs text-charcoal-600 mt-0.5">
                  Peer-reviewed formulations with transparent dosage disclosure and clinical bio-availability.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-full bg-mint-100 border border-mint-200 text-forest-800 text-xs font-mono font-black flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-mint-600" />
                  <span>100% Label Transparency</span>
                </span>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matchingFormulations.map((prod) => (
                <div
                  key={prod.id}
                  className="p-5 rounded-[2rem] bg-cream-50/70 border border-mint-200/80 hover:border-mint-400 transition space-y-4 flex flex-col justify-between group shadow-soft"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-black uppercase text-forest-800 bg-mint-100 px-2.5 py-0.5 rounded-full border border-mint-200">
                        {prod.brand} • {prod.category}
                      </span>
                      <span className="text-xs font-mono font-bold text-forest-900">
                        ₹{prod.sitePrice}
                      </span>
                    </div>

                    <div className="flex items-start gap-3.5">
                      <div className="w-16 h-16 rounded-2xl bg-white border border-mint-200 shrink-0 overflow-hidden relative flex items-center justify-center">
                        {prod.imageUrl && (
                          <img
                            src={prod.imageUrl}
                            alt={prod.product}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-black text-forest-950 group-hover:text-forest-800 transition leading-tight">
                          {prod.product}
                        </h3>
                        <p className="text-xs text-charcoal-600 mt-1 leading-relaxed line-clamp-2">
                          {prod.description}
                        </p>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-mint-100 space-y-1 text-xs">
                      <div className="flex items-center justify-between text-charcoal-600 text-[11px]">
                        <span>Declared Actives</span>
                        <span className="font-mono text-forest-950 font-bold">{prod.keyIngredients.join(' • ')}</span>
                      </div>
                      <div className="flex items-center justify-between text-charcoal-600 text-[11px]">
                        <span>Clinical Advantage</span>
                        <span className="font-mono text-mint-700 font-bold">{prod.clinicalAdvantage || 'Bio-enhanced formulation'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-mint-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-charcoal-600">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>{prod.potencyBadge || 'Verified Clinical Efficacy'}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => showToast(`Added ${prod.product} to your routine!`, 'success')}
                      className="px-4 py-1.5 rounded-full bg-forest-900 text-white hover:bg-forest-800 text-xs font-black transition active:scale-95 shadow-soft"
                    >
                      Add to Routine
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 📥 SAVE TO SMART SHELF MODAL                                              */}
      {/* ========================================================================= */}
      {saveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[2.5rem] max-w-md w-full p-6 shadow-modal border border-mint-200 space-y-5 text-charcoal-900">
            <div className="flex items-center justify-between border-b border-mint-100 pb-3">
              <div className="flex items-center gap-2">
                <BookmarkPlus className="w-5 h-5 text-forest-800" />
                <h3 className="text-base font-black text-forest-950">Save to Smart Shelf</h3>
              </div>
              <button
                type="button"
                onClick={() => setSaveModalOpen(false)}
                className="p-1.5 rounded-full text-charcoal-400 hover:text-charcoal-700 bg-cream-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-charcoal-700">Product Name:</label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-cream-50 border border-mint-200 font-bold text-forest-950"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-charcoal-700">Brand:</label>
                <input
                  type="text"
                  value={saveBrand}
                  onChange={(e) => setSaveBrand(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-cream-50 border border-mint-200 font-bold text-forest-950"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-charcoal-700">Usage Timing:</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['morning', 'evening', 'both'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSaveTimeOfDay(t)}
                      className={`p-2 rounded-xl font-bold uppercase text-[10px] font-mono transition ${
                        saveTimeOfDay === t
                          ? 'bg-forest-900 text-white shadow-soft'
                          : 'bg-cream-50 text-charcoal-600 border border-mint-100'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSaveModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-cream-50 text-charcoal-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveToShelf}
                className="flex-1 py-2.5 rounded-xl bg-forest-900 text-white font-black text-xs shadow-soft"
              >
                Confirm & Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barcode Scanner Modal */}
      {isBarcodeModalOpen && (
        <BarcodeScannerModal
          isOpen={isBarcodeModalOpen}
          onClose={() => setIsBarcodeModalOpen(false)}
          onProductFound={handleBarcodeProductFound}
          userGoal={profile.primaryGoal}
        />
      )}
    </div>
  );
};
