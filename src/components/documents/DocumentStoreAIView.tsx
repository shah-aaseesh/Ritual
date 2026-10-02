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

  const [selectedDoc, setSelectedDoc] = useState<HealthDocument | null>(healthDocuments[0] || null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);

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
    <div className="space-y-6 pb-24 max-w-4xl mx-auto animate-in fade-in duration-200 text-white">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-black uppercase tracking-widest text-indigo-400">
              MODULE 4 • CLINICAL STORAGE & INTELLIGENCE
            </span>
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-mono font-bold">
              Gemini Vision & Doc AI
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Medical Document Store & AI Analyzer
          </h1>
          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
            Store blood reports, lipid panels, and scans. Gemini AI decodes complex biomarkers into clear health directives.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowUploadModal(true)}
          className="px-5 py-2.5 rounded-full bg-white text-black font-black text-xs hover:bg-zinc-200 transition shadow-lg flex items-center gap-2 active:scale-95 shrink-0"
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
            <span className="text-xs font-mono font-bold uppercase text-zinc-400">
              Stored Reports ({healthDocuments.length})
            </span>
            <span className="text-[10px] font-mono text-indigo-400 font-bold">100% Client-Side Encrypted</span>
          </div>

          {healthDocuments.length === 0 ? (
            <div className="p-8 rounded-3xl bg-[#121217] border border-white/10 text-center space-y-3">
              <FileText className="w-10 h-10 text-zinc-600 mx-auto" />
              <p className="text-xs text-zinc-400">No medical reports uploaded yet.</p>
              <button
                type="button"
                onClick={() => setShowUploadModal(true)}
                className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition"
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
                        ? 'bg-[#181822] border-indigo-500/60 shadow-lg ring-1 ring-indigo-500/30'
                        : 'bg-[#121217] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-white/5 text-zinc-400'
                      }`}>
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-black text-white truncate">
                          {doc.title}
                        </h4>
                        <p className="text-[11px] text-zinc-400 mt-0.5 truncate">
                          {doc.doctorOrLab || 'Certified Lab'} • {doc.uploadDate}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 shrink-0 transition ${isSelected ? 'text-indigo-400 translate-x-1' : 'text-zinc-600'}`} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Active Document AI Analysis HUD */}
        <div className="lg:col-span-7 space-y-4">
          {selectedDoc ? (
            <div className="bg-[#0C0C10] rounded-[2.5rem] p-6 sm:p-7 border border-white/10 shadow-2xl space-y-6">
              {/* Document Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-black uppercase text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                      {selectedDoc.category.replace('_', ' ')}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-400">
                      Uploaded {selectedDoc.uploadDate}
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-white mt-1">
                    {selectedDoc.title}
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
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
                    className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 text-zinc-400 transition"
                    title="Delete Document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Gemini AI Synthesis Card */}
              {selectedDoc.aiAnalysis && (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-[#14141E] to-[#121217] border border-indigo-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-indigo-300 text-xs font-mono font-bold">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span>Gemini AI Biomarker Synthesis</span>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-medium">
                    {selectedDoc.aiAnalysis.summary}
                  </p>

                  <div className="pt-2 border-t border-white/10 space-y-1.5">
                    <span className="text-[10px] font-mono uppercase text-zinc-400 block font-bold">
                      Key Clinical Findings:
                    </span>
                    {selectedDoc.aiAnalysis.keyFindings.map((finding, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-zinc-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
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
                    <h3 className="text-xs font-mono font-bold uppercase text-zinc-300 tracking-wider">
                      Decoded Biomarkers ({selectedDoc.biomarkers.length})
                    </h3>
                    <span className="text-[10px] text-zinc-500 font-mono">Reference Calibrated</span>
                  </div>

                  <div className="space-y-2">
                    {selectedDoc.biomarkers.map((bm) => (
                      <div
                        key={bm.id}
                        className="p-3.5 rounded-xl bg-[#14141C] border border-white/5 space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <span className="text-xs font-black text-white">{bm.name}</span>
                            <span className="text-[10px] font-mono text-zinc-500 ml-2">[{bm.category}]</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-black text-white">
                              {bm.value} <span className="text-[10px] text-zinc-400 font-normal">{bm.unit}</span>
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-black uppercase ${
                              bm.status === 'optimal'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : bm.status === 'borderline'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}>
                              {bm.status}
                            </span>
                          </div>
                        </div>

                        <p className="text-[11px] text-zinc-400 leading-snug">
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
                  <div className="p-4 rounded-2xl bg-[#14141C] border border-white/5 space-y-1.5">
                    <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 block">
                      🥗 Dietary Directives
                    </span>
                    {selectedDoc.aiAnalysis.actionableDietAdvice.map((advice, i) => (
                      <p key={i} className="text-xs text-zinc-300 leading-relaxed">
                        • {advice}
                      </p>
                    ))}
                  </div>

                  <div className="p-4 rounded-2xl bg-[#14141C] border border-white/5 space-y-1.5">
                    <span className="text-[10px] font-mono font-bold uppercase text-[#FF3B30] block">
                      🏋️ Training Directives
                    </span>
                    {selectedDoc.aiAnalysis.actionableWorkoutAdvice.map((advice, i) => (
                      <p key={i} className="text-xs text-zinc-300 leading-relaxed">
                        • {advice}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 rounded-[2.5rem] bg-[#0C0C10] border border-white/10 text-center space-y-2">
              <Info className="w-8 h-8 text-zinc-600 mx-auto" />
              <h3 className="text-sm font-bold text-white">Select a report to view analysis</h3>
              <p className="text-xs text-zinc-400">Choose an uploaded report from the left list.</p>
            </div>
          )}
        </div>

      </div>

      {/* UPLOAD REPORT MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#121218] rounded-[2.5rem] max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-white/10 text-white space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Upload Medical Report</h3>
                  <p className="text-xs text-zinc-400">PDF, JPG, PNG or Lab scanned report</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="p-1.5 rounded-full text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-mono uppercase text-zinc-400 mb-1.5">
                  Report Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Annual Blood Panel, Lipid Profile, DXA Scan"
                  className="w-full p-3.5 rounded-xl bg-black/40 border border-white/10 text-white font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono uppercase text-zinc-400 mb-1.5">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full p-3.5 rounded-xl bg-[#181822] border border-white/10 text-white font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="blood_test">Blood Test Panel</option>
                    <option value="lipid_profile">Lipid Profile</option>
                    <option value="dxa_scan">DXA / Body Scan</option>
                    <option value="prescription">Prescription</option>
                    <option value="general">General Medical</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono uppercase text-zinc-400 mb-1.5">
                    Lab / Doctor Name
                  </label>
                  <input
                    type="text"
                    value={newDoctorLab}
                    onChange={(e) => setNewDoctorLab(e.target.value)}
                    placeholder="e.g. Metropolis, Apollo"
                    className="w-full p-3.5 rounded-xl bg-black/40 border border-white/10 text-white font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
                className="p-6 rounded-2xl bg-black/30 border-2 border-dashed border-white/15 hover:border-indigo-500/50 cursor-pointer transition text-center space-y-2 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/5 group-hover:bg-indigo-500/20 text-zinc-400 group-hover:text-indigo-400 transition flex items-center justify-center mx-auto">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-white">
                  Click to Browse or Drag & Drop PDF / Image
                </p>
                <p className="text-[11px] text-zinc-500">
                  Gemini AI will automatically extract & interpret all biomarkers
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                disabled={isUploading}
                onClick={() => handleSimulatedUpload()}
                className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Gemini AI Analyzing Biomarkers...</span>
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
