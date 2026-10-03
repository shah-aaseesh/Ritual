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
  Sparkles, 
  ScanBarcode, 
  FileText, 
  ShieldCheck, 
  X, 
  AlertTriangle, 
  BookmarkPlus,
  ThumbsDown,
  ThumbsUp,
  ExternalLink
} from 'lucide-react';

type MythBusterTab = 'debunk' | 'claims' | 'alternatives';

export const LabelLensView: React.FC = () => {
  const { profile, addShelfProduct, showToast, aiSettings } = useApp();

  // Active View Tab
  const [activeTab, setActiveTab] = useState<MythBusterTab>('debunk');

  // Product Info
  const [productName, setProductName] = useState<string>('Follicle Reactivate 3% Redensyl + Rosemary Scalp Serum');
  const [saveBrand, setSaveBrand] = useState<string>('Apex Derma Lab');
  
  // Front & Back Labels
  const [frontClaimText, setFrontClaimText] = useState<string>(SAMPLE_PRODUCTS[0].frontLabelText);
  const [ingredientText, setIngredientText] = useState<string>(SAMPLE_PRODUCTS[0].ingredientLabelText);

  // Selected Sample
  const [selectedSampleId, setSelectedSampleId] = useState<string>(SAMPLE_PRODUCTS[0].id);

  // Scanning Progress
  const [isScanningFront, setIsScanningFront] = useState<boolean>(false);
  const [isScanningBack, setIsScanningBack] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<{ percent: number; status: string }>({ percent: 0, status: '' });

  // Modals
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState<boolean>(false);
  const [saveModalOpen, setSaveModalOpen] = useState<boolean>(false);
  const [saveTimeOfDay, setSaveTimeOfDay] = useState<'morning' | 'evening' | 'both'>('evening');

  // File Inputs
  const frontFileInputRef = useRef<HTMLInputElement>(null);
  const backFileInputRef = useRef<HTMLInputElement>(null);

  // Analysis Result
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

    const res = analyzeLabelText(
      sample.ingredientLabelText,
      sample.frontLabelText,
      profile.primaryGoal,
      sample.name
    );
    setAnalysisResult(res);
    showToast(`Loaded: ${sample.name}`, 'info');
  };

  // Process Vision AI for Front Label (Claims & Name)
  const handleFrontFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanningFront(true);
    setScanProgress({ percent: 25, status: 'Scanning Front Label for claims...' });

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
      showToast('Front claims extracted!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Scan failed. You can type claims manually.', 'warning');
    } finally {
      setIsScanningFront(false);
      setScanProgress({ percent: 0, status: '' });
    }
  };

  // Process Vision AI for Back Label (Ingredients)
  const handleBackFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanningBack(true);
    setScanProgress({ percent: 25, status: 'Scanning Back Label for ingredients...' });

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
      showToast('Back ingredients extracted!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Scan failed. You can paste ingredients manually.', 'warning');
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
    showToast(`Found: ${result.productName}`, 'success');
  };

  const matchingFormulations = useMemo(() => {
    const activeNames = analysisResult?.detectedIngredients?.map(i => i.ingredient?.name || i.rawTextMatch) || [];
    return findMatchingMosaicProducts(activeNames, profile.primaryGoal);
  }, [analysisResult?.detectedIngredients, profile.primaryGoal]);

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
    showToast('Saved to Smart Shelf!', 'success');
  };

  const claimsCount = analysisResult.detectedClaims.length;

  return (
    <div className="space-y-5 pb-28 text-charcoal-900 font-sans max-w-5xl mx-auto">
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
      {/* 🌟 MINIMAL HEADER & SCANNER CONTROLS                                       */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-mint-200/80 shadow-card space-y-4">
        {/* Title & Quick Action Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-mint-100 pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-forest-950 tracking-tight flex items-center gap-2">
              <span>Myth Buster & Label Lens</span>
            </h1>
            <p className="text-xs text-charcoal-600 mt-0.5">
              Cross-examine front marketing claims against back formulation chemistry & PubMed clinical trials.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsBarcodeModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-cream-50 hover:bg-mint-100 border border-mint-200 text-forest-900 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 shadow-xs"
            >
              <ScanBarcode className="w-3.5 h-3.5 text-forest-800" />
              <span>Barcode Scan</span>
            </button>

            <button
              type="button"
              onClick={() => setSaveModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-bold text-xs flex items-center gap-1.5 transition active:scale-95 shadow-soft"
            >
              <BookmarkPlus className="w-3.5 h-3.5 text-mint-300" />
              <span>Save Shelf</span>
            </button>
          </div>
        </div>

        {/* Minimalist Dual Capture Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Front Card (Claims) */}
          <div className="p-4 rounded-2xl bg-cream-50/60 border border-mint-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-forest-900 text-white font-mono text-[10px] font-black flex items-center justify-center">
                  1
                </span>
                <span className="text-xs font-black text-forest-950 uppercase font-mono">
                  Front Label (Claims)
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => frontFileInputRef.current?.click()}
                  disabled={isScanningFront}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-mint-50 border border-mint-200 text-forest-900 font-bold text-[11px] flex items-center gap-1 transition shadow-xs"
                >
                  <Camera className="w-3 h-3 text-forest-800" />
                  <span>{isScanningFront ? 'Scanning...' : 'Scan Front'}</span>
                </button>
              </div>
            </div>

            <textarea
              rows={2}
              value={frontClaimText}
              onChange={(e) => {
                setFrontClaimText(e.target.value);
                handleReanalyze(ingredientText, e.target.value, productName);
              }}
              placeholder="Enter front marketing claims..."
              className="w-full p-2.5 rounded-xl bg-white border border-mint-200 text-xs text-charcoal-800 font-mono focus:outline-none focus:ring-1 focus:ring-mint-500 resize-none"
            />
          </div>

          {/* Back Card (Ingredients) */}
          <div className="p-4 rounded-2xl bg-cream-50/60 border border-mint-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-forest-900 text-white font-mono text-[10px] font-black flex items-center justify-center">
                  2
                </span>
                <span className="text-xs font-black text-forest-950 uppercase font-mono">
                  Back Label (Ingredients)
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => backFileInputRef.current?.click()}
                  disabled={isScanningBack}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-mint-50 border border-mint-200 text-forest-900 font-bold text-[11px] flex items-center gap-1 transition shadow-xs"
                >
                  <Camera className="w-3 h-3 text-forest-800" />
                  <span>{isScanningBack ? 'Scanning...' : 'Scan Back'}</span>
                </button>
              </div>
            </div>

            <textarea
              rows={2}
              value={ingredientText}
              onChange={(e) => {
                setIngredientText(e.target.value);
                handleReanalyze(e.target.value, frontClaimText, productName);
              }}
              placeholder="Paste ingredient list..."
              className="w-full p-2.5 rounded-xl bg-white border border-mint-200 text-xs text-charcoal-800 font-mono focus:outline-none focus:ring-1 focus:ring-mint-500 resize-none"
            />
          </div>
        </div>

        {/* Live Scan Status */}
        {(isScanningFront || isScanningBack) && (
          <div className="p-3 rounded-xl bg-mint-100 border border-mint-300 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-forest-800 animate-spin" />
              <span className="font-bold text-forest-950">{scanProgress.status}</span>
            </div>
            <span className="font-black text-forest-900">{scanProgress.percent}%</span>
          </div>
        )}

        {/* Sample Presets */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 no-scrollbar">
          <span className="text-[10px] font-mono font-bold uppercase text-charcoal-400 shrink-0">
            Samples:
          </span>
          {SAMPLE_PRODUCTS.map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => handleSelectSample(sample)}
              className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition active:scale-95 flex items-center gap-1.5 ${
                selectedSampleId === sample.id
                  ? 'bg-forest-900 text-white font-black'
                  : 'bg-cream-50 text-charcoal-700 hover:bg-mint-100 border border-mint-100'
              }`}
            >
              <span>{sample.name.split(' ')[0]} {sample.name.split(' ')[1]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🧭 MINIMAL TAB NAVIGATION                                                  */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl p-1.5 border border-mint-200/80 shadow-soft flex items-center gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('debunk')}
          className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'debunk'
              ? 'bg-forest-900 text-white shadow-sm'
              : 'text-charcoal-600 hover:text-forest-900 hover:bg-mint-50'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Formulation Audit</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('claims')}
          className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'claims'
              ? 'bg-forest-900 text-white shadow-sm'
              : 'text-charcoal-600 hover:text-forest-900 hover:bg-mint-50'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Claims vs Reality ({claimsCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('alternatives')}
          className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'alternatives'
              ? 'bg-forest-900 text-white shadow-sm'
              : 'text-charcoal-600 hover:text-forest-900 hover:bg-mint-50'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Clinical Alternatives ({matchingFormulations.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 📜 TAB 1: FORMULATION AUDIT & DEBUNK PAPER                                */}
      {/* ========================================================================= */}
      {activeTab === 'debunk' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <IngredientDebunkPaper
            productName={productName}
            brand={saveBrand}
            rawIngredientText={ingredientText}
            analysis={analysisResult}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* ⚔️ TAB 2: CLAIMS VS REALITY REPORT                                        */}
      {/* ========================================================================= */}
      {activeTab === 'claims' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-mint-200/80 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-mint-100 pb-3">
              <div>
                <h3 className="text-base font-black text-forest-950">Marketing Claims Cross-Examination</h3>
                <p className="text-xs text-charcoal-600">Front buzzwords evaluated against clinical dosage & physical formulation.</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-mint-100 text-forest-800 font-mono font-bold text-xs border border-mint-200">
                {claimsCount} Audited
              </span>
            </div>

            {analysisResult.detectedClaims.length === 0 ? (
              <div className="p-6 rounded-2xl bg-cream-50 text-center text-xs text-charcoal-600">
                No specific marketing buzzwords detected. Enter claims in the box above to audit.
              </div>
            ) : (
              <div className="space-y-3">
                {analysisResult.detectedClaims.map((claim, cIdx) => {
                  const isPositive = claim.verdict === 'supported';
                  const isUnderdosed = claim.verdict === 'partially_supported' || claim.verdict === 'too_vague_to_verify';
                  const isBusted = claim.verdict === 'marketing_heavy';

                  return (
                    <div
                      key={cIdx}
                      className={`p-4 rounded-2xl border transition space-y-3 ${
                        isPositive
                          ? 'bg-emerald-50/40 border-emerald-300'
                          : isUnderdosed
                          ? 'bg-amber-50/40 border-amber-300'
                          : 'bg-rose-50/40 border-rose-300'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <h4 className="text-sm font-black text-forest-950">
                          "{claim.displayName}"
                        </h4>
                        <div>
                          {isPositive && (
                            <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-black text-[11px] font-mono flex items-center gap-1 border border-emerald-300">
                              <ThumbsUp className="w-3 h-3" />
                              <span>Clinically Validated</span>
                            </span>
                          )}
                          {isUnderdosed && (
                            <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-800 font-black text-[11px] font-mono flex items-center gap-1 border border-amber-300">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Vague / Unregulated</span>
                            </span>
                          )}
                          {isBusted && (
                            <span className="px-2.5 py-0.5 rounded-md bg-rose-100 text-rose-800 font-black text-[11px] font-mono flex items-center gap-1 border border-rose-300">
                              <ThumbsDown className="w-3 h-3" />
                              <span>Marketing Gimmick</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="p-3 rounded-xl bg-white/90 border border-black/5 space-y-0.5">
                          <span className="text-[10px] font-mono font-bold uppercase text-charcoal-400">Claim Promise</span>
                          <p className="text-forest-950 font-medium">{claim.whatItMeans}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-white/90 border border-black/5 space-y-0.5">
                          <span className="text-[10px] font-mono font-bold uppercase text-charcoal-400">Chemical Reality</span>
                          <p className="text-forest-950 font-medium">{claim.supportRationale}</p>
                        </div>
                      </div>

                      {claim.sourceUrl && (
                        <div className="flex items-center justify-between pt-1 text-[11px]">
                          <span className="text-charcoal-600 truncate">
                            <strong>Reference:</strong> {claim.sourceLabel || 'Clinical Trial'}
                          </span>
                          <a
                            href={claim.sourceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-forest-900 bg-white hover:bg-mint-50 px-2.5 py-1 rounded-lg border border-mint-200 shrink-0 transition"
                          >
                            <span>PubMed Trial</span>
                            <ExternalLink className="w-3 h-3 text-forest-700" />
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🌿 TAB 3: CLINICAL ALTERNATIVES                                           */}
      {/* ========================================================================= */}
      {activeTab === 'alternatives' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-mint-200/80 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-mint-100 pb-3">
              <div>
                <h3 className="text-base font-black text-forest-950">Evidence-Backed Formulations</h3>
                <p className="text-xs text-charcoal-600">Formulations with 100% declared active dosages.</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-mint-100 text-forest-800 font-mono font-bold text-xs border border-mint-200">
                {matchingFormulations.length} Available
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {matchingFormulations.map((prod) => (
                <div
                  key={prod.id}
                  className="p-4 rounded-2xl bg-cream-50/60 border border-mint-200/80 hover:border-mint-400 transition space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-forest-800 bg-mint-100 px-2 py-0.5 rounded-md border border-mint-200">
                        {prod.brand} • ₹{prod.sitePrice}
                      </span>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-14 h-14 rounded-xl bg-white border border-mint-200 shrink-0 overflow-hidden flex items-center justify-center">
                        {prod.imageUrl && (
                          <img
                            src={prod.imageUrl}
                            alt={prod.product}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-black text-forest-950 truncate">{prod.product}</h4>
                        <p className="text-xs text-charcoal-600 line-clamp-2 mt-0.5">{prod.description}</p>
                      </div>
                    </div>

                    <div className="p-2 rounded-lg bg-white border border-mint-100 text-[11px] font-mono text-charcoal-600">
                      <strong>Actives:</strong> {prod.keyIngredients.join(', ')}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => showToast(`Added ${prod.product} to routine!`, 'success')}
                    className="w-full py-2 rounded-xl bg-forest-900 text-white hover:bg-forest-800 text-xs font-bold transition active:scale-95"
                  >
                    Add to Routine
                  </button>
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
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-modal border border-mint-200 space-y-4 text-charcoal-900">
            <div className="flex items-center justify-between border-b border-mint-100 pb-3">
              <div className="flex items-center gap-2">
                <BookmarkPlus className="w-4 h-4 text-forest-800" />
                <h3 className="text-base font-black text-forest-950">Save to Smart Shelf</h3>
              </div>
              <button
                type="button"
                onClick={() => setSaveModalOpen(false)}
                className="p-1 rounded-full text-charcoal-400 hover:text-charcoal-700"
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
                          ? 'bg-forest-900 text-white'
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
                className="flex-1 py-2.5 rounded-xl bg-forest-900 text-white font-bold text-xs"
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
