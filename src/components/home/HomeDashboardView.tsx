import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Dumbbell, 
  Utensils, 
  ScanLine, 
  FileText, 
  ChevronRight, 
  Camera, 
  Sparkles, 
  ShieldCheck, 
  Flame
} from 'lucide-react';
import { DEFAULT_MACRO_TARGETS } from '../../data/calorieData';

export const HomeDashboardView: React.FC = () => {
  const { profile, setActiveTab, healthDocuments } = useApp();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Get food logs from localStorage for quick overview
  const foodLogs = (() => {
    try {
      const saved = localStorage.getItem('ritual_food_logs');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  })();

  const currentCalories = foodLogs.reduce((acc: number, entry: any) => {
    return acc + Math.round((entry.food?.calories || 0) * (entry.quantity || 1));
  }, 0);

  const targetCalories = DEFAULT_MACRO_TARGETS.calories;
  const calPercent = Math.min(100, Math.round((currentCalories / targetCalories) * 100));

  const goalName = profile.healthGoal ? {
    hypertrophy_strength: 'Hypertrophy & Strength',
    fat_loss_recomp: 'Fat Loss & Recomp',
    athletic_conditioning: 'Athletic Conditioning',
    longevity_health: 'Metabolic Longevity'
  }[profile.healthGoal] : profile.primaryGoal.replace('_', ' ');

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto animate-in fade-in duration-200 text-white">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div>
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-zinc-400 block">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-0.5">
            {getGreeting()}, {profile.name || 'Athlete'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-full bg-[#14141C] border border-white/10 text-xs font-mono font-bold text-zinc-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#FF3B30] animate-pulse" />
            <span>Target: <strong className="text-white capitalize">{goalName}</strong></span>
          </span>
        </div>
      </div>

      {/* 4 PRIMARY INTERACTIVE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        
        {/* CARD 1: 🏋️ WORKOUT LOG (MINIMALIST) */}
        <div 
          onClick={() => setActiveTab('workout')}
          className="group p-6 sm:p-7 rounded-[2.5rem] bg-[#121217] hover:bg-[#181822] border border-white/10 hover:border-[#FF3B30]/40 transition-all duration-200 cursor-pointer shadow-card flex flex-col justify-between space-y-5 relative overflow-hidden"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#FF3B30] to-rose-700 text-white flex items-center justify-center shadow-lg shadow-[#FF3B30]/25 group-hover:scale-105 transition-transform p-3">
                <Dumbbell className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono font-bold text-zinc-300">
                ⚡ Hevy-Style HUD
              </span>
            </div>

            <div>
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-[#FF3B30] block">
                MODULE 1 • ATHLETIC TRAINING
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1 group-hover:text-[#FF3B30] transition">
                Workout Log
              </h2>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Log sets, reps, and weights with auto rest timers, 6 preset templates & live workout HUD.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
              <Flame className="w-3.5 h-3.5 text-[#FF3B30]" />
              <span>14-Day Streak</span>
            </div>
            <button
              type="button"
              className="px-4 py-2 rounded-full bg-white text-black font-black text-xs group-hover:bg-zinc-200 transition shadow-md flex items-center gap-1"
            >
              <span>Start Workout</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* CARD 2: 🥗 CALORIE TRACKER & GEMINI VISION AI */}
        <div 
          onClick={() => setActiveTab('calories')}
          className="group p-6 sm:p-7 rounded-[2.5rem] bg-[#121217] hover:bg-[#181822] border border-white/10 hover:border-emerald-500/40 transition-all duration-200 cursor-pointer shadow-card flex flex-col justify-between space-y-5 relative overflow-hidden"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform p-3">
                <Utensils className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1">
                <Camera className="w-3 h-3" />
                <span>Gemini Flash Vision</span>
              </span>
            </div>

            <div>
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-emerald-400 block">
                MODULE 2 • NUTRITION & MACROS
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1 group-hover:text-emerald-400 transition">
                Calorie Tracker
              </h2>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Snap meal photos for instant &lt;1s AI calorie estimation, protein goals & daily macro rings.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-300">
              <span className="font-bold text-white">{currentCalories}</span>
              <span className="text-zinc-500">/ {targetCalories} kcal ({calPercent}%)</span>
            </div>
            <button
              type="button"
              className="px-4 py-2 rounded-full bg-white text-black font-black text-xs group-hover:bg-zinc-200 transition shadow-md flex items-center gap-1"
            >
              <span>Track Food</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* CARD 3: 🔬 INGREDIENT & CLAIM MYTH BUSTER */}
        <div 
          onClick={() => setActiveTab('mythbuster')}
          className="group p-6 sm:p-7 rounded-[2.5rem] bg-[#121217] hover:bg-[#181822] border border-white/10 hover:border-amber-500/40 transition-all duration-200 cursor-pointer shadow-card flex flex-col justify-between space-y-5 relative overflow-hidden"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-lg shadow-amber-500/25 group-hover:scale-105 transition-transform p-3">
                <ScanLine className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-mono font-bold text-amber-400">
                Rx Lens & Myths
              </span>
            </div>

            <div>
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-amber-400 block">
                MODULE 3 • LABEL LENS & FORMULATIONS
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1 group-hover:text-amber-400 transition">
                Ingredient & Claim Myth Buster
              </h2>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Scan bottle barcodes or labels to debunk marketing claims, verify active dosages & find clinical alternatives.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Evidence-Backed</span>
            </div>
            <button
              type="button"
              className="px-4 py-2 rounded-full bg-white text-black font-black text-xs group-hover:bg-zinc-200 transition shadow-md flex items-center gap-1"
            >
              <span>Scan Product</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* CARD 4: 📁 DOCUMENT STORE & AI REPORT ANALYZER */}
        <div 
          onClick={() => setActiveTab('documents')}
          className="group p-6 sm:p-7 rounded-[2.5rem] bg-[#121217] hover:bg-[#181822] border border-white/10 hover:border-indigo-500/40 transition-all duration-200 cursor-pointer shadow-card flex flex-col justify-between space-y-5 relative overflow-hidden"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-700 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform p-3">
                <FileText className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-mono font-bold text-indigo-400">
                {healthDocuments.length} Stored Reports
              </span>
            </div>

            <div>
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-indigo-400 block">
                MODULE 4 • HEALTH DOCS & BIOMARKERS
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1 group-hover:text-indigo-400 transition">
                Document Store & AI Analyzer
              </h2>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Securely store blood test PDFs, lipid panels & prescriptions. Gemini AI analyzes biomarkers into actionable advice.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Biomarker Insights</span>
            </div>
            <button
              type="button"
              className="px-4 py-2 rounded-full bg-white text-black font-black text-xs group-hover:bg-zinc-200 transition shadow-md flex items-center gap-1"
            >
              <span>View Reports</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
