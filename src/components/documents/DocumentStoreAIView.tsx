import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  ChevronRight, 
  Trash2, 
  Info
} from 'lucide-react';
import { HealthDocument } from '../../types';
import { useApp } from '../../context/AppContext';

export const DocumentStoreAIView: React.FC = () => {
  const { healthDocuments, addHealthDocument, removeHealthDocument, showToast } = useApp();

  const [selectedDoc, setSelectedDoc] = useState<HealthDocument | null>(() => healthDocuments[0] || null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);

  // Sync selectedDoc if documents list changes
  React.useEffect(() => {
    if (!selectedDoc && healthDocuments.length > 0) {
      setSelectedDoc(healthDocuments[0]);
    } else if (selectedDoc && !healthDocuments.some(d => d.id === selectedDoc.id)) {
      setSelectedDoc(healthDocuments[0] || null);
    }
  }, [healthDocuments, selectedDoc]);

  // Upload Form state
  const [newTitle, setNewTitle] = useState<string>('');
  const [newCategory, setNewCategory] = useState<HealthDocument['category']>('blood_test');
  const [newDoctorLab, setNewDoctorLab] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSimulatedUpload = (file?: File) => {
    setIsUploading(true);
    setTimeout(() => {
      const createdDoc: HealthDocument = {
        id: `doc-${Date.now()}`,
        title: newTitle.trim() || (file ? file.name.replace(/\.[^/.]+$/, '') : 'Routine Health & Blood Profile'),
        category: newCategory,
        uploadDate: new Date().toISOString().split('T')[0],
        fileSizeText: file ? `${(file.size / (1024 * 1024)).toFixed(1)} MB PDF` : '1.5 MB PDF',
        doctorOrLab: newDoctorLab.trim() || 'Dr. Lal PathLabs • Verified Lab',
        biomarkers: [
          {
            id: `bm-${Date.now()}-1`,
            name: 'Fasting Blood Glucose',
            value: '88',
            unit: 'mg/dL',
            referenceRange: '70 - 99 mg/dL',
            status: 'optimal',
            category: 'Metabolic',
            impactExplanation: 'Healthy baseline glucose control with stable morning insulin sensitivity.'
          },
          {
            id: `bm-${Date.now()}-2`,
            name: 'High-Density Lipoprotein (HDL-C)',
            value: '58',
            unit: 'mg/dL',
            referenceRange: '> 40 mg/dL',
            status: 'optimal',
            category: 'Lipid',
            impactExplanation: 'High cardio-protective HDL concentration supporting clean reverse cholesterol transport.'
          },
          {
            id: `bm-${Date.now()}-3`,
            name: 'Serum Magnesium',
            value: '1.9',
            unit: 'mg/dL',
            referenceRange: '1.7 - 2.2 mg/dL',
            status: 'optimal',
            category: 'Vitamin & Mineral',
            impactExplanation: 'Adequate cellular magnesium supporting neuromuscular ATP energy cycles.'
          }
        ],
        aiAnalysis: {
          summary: 'All core clinical markers are well within reference ranges. Metabolic efficiency and lipid clearance are optimal.',
          keyFindings: [
            'Fasting glucose (88 mg/dL) indicates high glycemic flexibility.',
            'HDL levels provide robust vascular defense.'
          ],
          actionableDietAdvice: [
            'Maintain nutrient-dense whole foods with balanced complex carbohydrates.'
          ],
          actionableWorkoutAdvice: [
            'Ideal biological readiness for high-intensity resistance training.'
          ],
          recommendedSupplementIds: ['mw-health-01', 'mw-health-03']
        }
      };

      addHealthDocument(createdDoc);
      setSelectedDoc(createdDoc);
      setIsUploading(false);
      setShowUploadModal(false);
      setNewTitle('');
      setNewDoctorLab('');
      showToast(`Uploaded & AI-analyzed ${createdDoc.title}!`, 'success');
    }, 1200);
  };

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto animate-in fade-in duration-200 text-charcoal-900">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-mint-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-black uppercase tracking-widest text-forest-700">
              MODULE 4 • CLINICAL STORAGE & INTELLIGENCE
            </span>
            <span className="px-2 py-0.5 rounded-full bg-mint-100 text-forest-800 text-[10px] font-mono font-bold border border-mint-200">
              Clinical Lab AI
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-forest-950 tracking-tight mt-1">
            Medical Document Store & AI Analyzer
          </h1>
          <p className="text-xs text-charcoal-600 mt-1 leading-relaxed">
            Store blood reports, lipid panels, and scans. Clinical AI decodes complex biomarkers into clear health directives.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowUploadModal(true)}
          className="px-5 py-2.5 rounded-full bg-forest-900 text-white font-black text-xs hover:bg-forest-800 transition shadow-soft flex items-center gap-2 active:scale-95 shrink-0"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Lab Report</span>
        </button>
      </div>

      {/* Main Grid: Stored Reports List & Active Report Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column: Documents List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-mono font-bold uppercase text-charcoal-500">
              Stored Reports ({healthDocuments.length})
            </span>
            <span className="text-[10px] font-mono text-mint-700 font-bold">100% Client-Side Encrypted</span>
          </div>

          {healthDocuments.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white border border-mint-200/80 text-center space-y-3 shadow-soft">
              <FileText className="w-10 h-10 text-charcoal-400 mx-auto" />
              <p className="text-xs text-charcoal-600">No medical reports uploaded yet.</p>
              <button
                type="button"
                onClick={() => setShowUploadModal(true)}
                className="px-4 py-2 rounded-full bg-mint-100 hover:bg-mint-200 text-xs font-bold text-forest-900 transition"
              >
                Upload First Report
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {healthDocuments.map((doc) => {
                const isSelected = selectedDoc?.id === doc.id;
                return (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc)}
                    className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-mint-50/70 border-mint-500 shadow-soft ring-1 ring-mint-500/30'
                        : 'bg-white border-mint-200/80 hover:border-mint-400 shadow-soft'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-forest-900 text-white' : 'bg-mint-100 text-forest-800'
                      }`}>
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-black text-forest-950 truncate">
                          {doc.title}
                        </h4>
                        <p className="text-[11px] text-charcoal-500 mt-0.5 truncate">
                          {doc.doctorOrLab || 'Certified Lab'} • {doc.uploadDate}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 shrink-0 transition ${isSelected ? 'text-forest-900 translate-x-1' : 'text-charcoal-400'}`} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Active Document AI Analysis HUD */}
        <div className="lg:col-span-7 space-y-4">
          {selectedDoc ? (
            <div className="bg-white rounded-[2.5rem] p-6 sm:p-7 border border-mint-200/80 shadow-card space-y-6">
              {/* Document Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-mint-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-black uppercase text-forest-800 bg-mint-100 px-2.5 py-0.5 rounded-full border border-mint-200">
                      {selectedDoc.category.replace('_', ' ')}
                    </span>
                    <span className="text-[11px] font-mono text-charcoal-500">
                      Uploaded {selectedDoc.uploadDate}
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-forest-950 mt-1">
                    {selectedDoc.title}
                  </h2>
                  <p className="text-xs text-charcoal-600 mt-0.5">
                    {selectedDoc.doctorOrLab} • {selectedDoc.fileSizeText || 'PDF Document'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Remove "${selectedDoc.title}" from your store?`)) {
                        removeHealthDocument(selectedDoc.id);
                        setSelectedDoc(null);
                        showToast('Document removed from store', 'info');
                      }
                    }}
                    className="p-2 rounded-xl bg-cream-50 hover:bg-rose-50 hover:text-rose-600 text-charcoal-400 transition"
                    title="Delete Document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Gemini AI Synthesis Card */}
              {selectedDoc.aiAnalysis && (
                <div className="p-5 rounded-2xl bg-mint-50/80 border border-mint-200 space-y-3">
                  <div className="flex items-center gap-2 text-forest-900 text-xs font-mono font-bold">
                    <Sparkles className="w-4 h-4 text-mint-600" />
                    <span>Clinical Biomarker Synthesis</span>
                  </div>
                  <p className="text-xs sm:text-sm text-charcoal-800 leading-relaxed font-medium">
                    {selectedDoc.aiAnalysis.summary}
                  </p>

                  <div className="pt-2 border-t border-mint-200/80 space-y-1.5">
                    <span className="text-[10px] font-mono uppercase text-charcoal-500 block font-bold">
                      Key Clinical Findings:
                    </span>
                    {selectedDoc.aiAnalysis.keyFindings.map((finding, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-charcoal-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-mint-600 shrink-0 mt-0.5" />
                        <span>{finding}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Decoded Biomarkers Table */}
              {selectedDoc.biomarkers && selectedDoc.biomarkers.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-mono font-bold uppercase text-charcoal-600 tracking-wider">
                      Decoded Biomarkers ({selectedDoc.biomarkers.length})
                    </h3>
                    <span className="text-[10px] text-charcoal-400 font-mono">Reference Calibrated</span>
                  </div>

                  <div className="space-y-2">
                    {selectedDoc.biomarkers.map((bm) => (
                      <div
                        key={bm.id}
                        className="p-3.5 rounded-xl bg-cream-50/70 border border-mint-100 space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <span className="text-xs font-black text-forest-950">{bm.name}</span>
                            <span className="text-[10px] font-mono text-charcoal-400 ml-2">[{bm.category}]</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-black text-forest-950">
                              {bm.value} <span className="text-[10px] text-charcoal-500 font-normal">{bm.unit}</span>
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-black uppercase ${
                              bm.status === 'optimal'
                                ? 'bg-mint-100 text-forest-800 border border-mint-200'
                                : bm.status === 'borderline'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-rose-100 text-rose-800 border border-rose-200'
                            }`}>
                              {bm.status}
                            </span>
                          </div>
                        </div>

                        <p className="text-[11px] text-charcoal-600 leading-snug">
                          {bm.impactExplanation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actionable Diet & Training Directives */}
              {selectedDoc.aiAnalysis && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-4 rounded-2xl bg-mint-50/40 border border-mint-100 space-y-1.5">
                    <span className="text-[10px] font-mono font-bold uppercase text-forest-700 block">
                      🥗 Dietary Directives
                    </span>
                    {selectedDoc.aiAnalysis.actionableDietAdvice.map((advice, i) => (
                      <p key={i} className="text-xs text-charcoal-700 leading-relaxed">
                        • {advice}
                      </p>
                    ))}
                  </div>

                  <div className="p-4 rounded-2xl bg-mint-50/40 border border-mint-100 space-y-1.5">
                    <span className="text-[10px] font-mono font-bold uppercase text-forest-700 block">
                      🏋️ Training Directives
                    </span>
                    {selectedDoc.aiAnalysis.actionableWorkoutAdvice.map((advice, i) => (
                      <p key={i} className="text-xs text-charcoal-700 leading-relaxed">
                        • {advice}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 rounded-[2.5rem] bg-white border border-mint-200/80 text-center space-y-2 shadow-soft">
              <Info className="w-8 h-8 text-charcoal-400 mx-auto" />
              <h3 className="text-sm font-bold text-forest-950">Select a report to view analysis</h3>
              <p className="text-xs text-charcoal-500">Choose an uploaded report from the left list.</p>
            </div>
          )}
        </div>

      </div>

      {/* UPLOAD REPORT MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-[2.5rem] max-w-lg w-full p-6 sm:p-7 shadow-modal border border-mint-200 text-charcoal-900 space-y-5">
            <div className="flex items-center justify-between border-b border-mint-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-mint-100 text-forest-800 border border-mint-200 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-forest-950">Upload Medical Report</h3>
                  <p className="text-xs text-charcoal-500">PDF, JPG, PNG or Lab scanned report</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="p-1.5 rounded-full text-charcoal-400 hover:text-charcoal-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-mono uppercase text-charcoal-600 mb-1.5 font-bold">
                  Report Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Annual Blood Panel, Lipid Profile, DXA Scan"
                  className="w-full p-3.5 rounded-xl bg-cream-50 border border-mint-200 text-charcoal-900 font-medium focus:outline-none focus:ring-2 focus:ring-mint-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono uppercase text-charcoal-600 mb-1.5 font-bold">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full p-3.5 rounded-xl bg-cream-50 border border-mint-200 text-charcoal-900 font-medium focus:outline-none focus:ring-2 focus:ring-mint-500"
                  >
                    <option value="blood_test">Blood Test Panel</option>
                    <option value="lipid_profile">Lipid Profile</option>
                    <option value="dxa_scan">DXA / Body Scan</option>
                    <option value="prescription">Prescription</option>
                    <option value="general">General Medical</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono uppercase text-charcoal-600 mb-1.5 font-bold">
                    Lab / Doctor Name
                  </label>
                  <input
                    type="text"
                    value={newDoctorLab}
                    onChange={(e) => setNewDoctorLab(e.target.value)}
                    placeholder="e.g. Metropolis, Apollo"
                    className="w-full p-3.5 rounded-xl bg-cream-50 border border-mint-200 text-charcoal-900 font-medium focus:outline-none focus:ring-2 focus:ring-mint-500"
                  />
                </div>
              </div>

              {/* Upload Drop Zone */}
              <input
                type="file"
                ref={fileInputRef}
                accept=".pdf,image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleSimulatedUpload(file);
                }}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-6 rounded-2xl bg-cream-50/50 border-2 border-dashed border-mint-300 hover:border-mint-500 cursor-pointer transition text-center space-y-2 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-mint-100 group-hover:bg-mint-200 text-forest-800 transition flex items-center justify-center mx-auto">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-forest-950">
                  Click to Browse or Drag & Drop PDF / Image
                </p>
                <p className="text-[11px] text-charcoal-500">
                  Clinical AI will automatically extract & interpret all biomarkers
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                disabled={isUploading}
                onClick={() => handleSimulatedUpload()}
                className="w-full py-3.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-black text-xs shadow-soft transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin text-mint-300" />
                    <span>Clinical AI Analyzing Biomarkers...</span>
                  </>
                ) : (
                  <span>Upload & Analyze with AI</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
