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

  const targetCalories = profile.maintenanceCalories || DEFAULT_MACRO_TARGETS.calories;
  const calPercent = Math.min(100, Math.round((currentCalories / targetCalories) * 100));

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto animate-in fade-in duration-200 text-charcoal-900">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div>
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-charcoal-500 block">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-forest-950 tracking-tight mt-0.5">
            {getGreeting()}, {profile.name || 'Friend'}
          </h1>
          {profile.email && (
            <span className="text-xs text-charcoal-500 font-mono block">
              {profile.email}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {profile.bmi && (
            <span className="px-3 py-1.5 rounded-full bg-white border border-mint-200 text-xs font-mono font-bold text-charcoal-700 shadow-soft">
              BMI: <strong className="text-forest-900">{profile.bmi}</strong>
            </span>
          )}
          <span className="px-3.5 py-1.5 rounded-full bg-white border border-mint-200 text-xs font-mono font-bold text-charcoal-700 flex items-center gap-1.5 shadow-soft">
            <span className="w-2 h-2 rounded-full bg-mint-500 animate-pulse" />
            <span>TDEE: <strong className="text-forest-900">{targetCalories} kcal</strong></span>
          </span>
        </div>
      </div>

      {/* 4 PRIMARY INTERACTIVE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        
        {/* CARD 1: 🏋️ WORKOUT LOG (MINIMALIST) */}
        <div 
          onClick={() => setActiveTab('workout')}
          className="group p-6 sm:p-7 rounded-[2.5rem] bg-white hover:bg-mint-50/30 border border-mint-200/80 hover:border-mint-400 transition-all duration-200 cursor-pointer shadow-card flex flex-col justify-between space-y-5 relative overflow-hidden"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-forest-800 to-forest-600 text-white flex items-center justify-center shadow-md shadow-forest-900/15 group-hover:scale-105 transition-transform p-3">
                <Dumbbell className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 rounded-full bg-mint-100 border border-mint-200 text-[10px] font-mono font-bold text-forest-800">
                ⚡ Hevy-Style HUD
              </span>
            </div>

            <div>
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-forest-700 block">
                MODULE 1 • ATHLETIC TRAINING
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-forest-950 mt-1 group-hover:text-forest-800 transition">
                Workout Log
              </h2>
              <p className="text-xs text-charcoal-600 mt-1 leading-relaxed">
                Log sets, reps, and weights with auto rest timers, 6 preset templates & live workout HUD.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-mint-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-charcoal-600">
              <Flame className="w-3.5 h-3.5 text-coral-500" />
              <span>14-Day Streak</span>
            </div>
            <button
              type="button"
              className="px-4 py-2 rounded-full bg-forest-900 text-white font-black text-xs group-hover:bg-forest-800 transition shadow-soft flex items-center gap-1"
            >
              <span>Start Workout</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* CARD 2: 🥗 CALORIE TRACKER & GEMINI VISION AI */}
        <div 
          onClick={() => setActiveTab('calories')}
          className="group p-6 sm:p-7 rounded-[2.5rem] bg-white hover:bg-mint-50/30 border border-mint-200/80 hover:border-mint-400 transition-all duration-200 cursor-pointer shadow-card flex flex-col justify-between space-y-5 relative overflow-hidden"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-mint-600 to-teal-700 text-white flex items-center justify-center shadow-md shadow-mint-600/15 group-hover:scale-105 transition-transform p-3">
                <Utensils className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 rounded-full bg-mint-100 border border-mint-200 text-[10px] font-mono font-bold text-mint-700 flex items-center gap-1">
                <Camera className="w-3 h-3" />
                <span>Gemini Flash Vision</span>
              </span>
            </div>

            <div>
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-mint-700 block">
                MODULE 2 • NUTRITION & MACROS
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-forest-950 mt-1 group-hover:text-mint-700 transition">
                Calorie Tracker
              </h2>
              <p className="text-xs text-charcoal-600 mt-1 leading-relaxed">
                Snap meal photos for instant &lt;1s AI calorie estimation, protein goals & daily macro rings.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-mint-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-charcoal-700">
              <span className="font-bold text-forest-950">{currentCalories}</span>
              <span className="text-charcoal-500">/ {targetCalories} kcal ({calPercent}%)</span>
            </div>
            <button
              type="button"
              className="px-4 py-2 rounded-full bg-forest-900 text-white font-black text-xs group-hover:bg-forest-800 transition shadow-soft flex items-center gap-1"
            >
              <span>Track Food</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* CARD 3: 🔬 INGREDIENT & CLAIM MYTH BUSTER */}
        <div 
          onClick={() => setActiveTab('mythbuster')}
          className="group p-6 sm:p-7 rounded-[2.5rem] bg-white hover:bg-amber-50/20 border border-mint-200/80 hover:border-amber-400/60 transition-all duration-200 cursor-pointer shadow-card flex flex-col justify-between space-y-5 relative overflow-hidden"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-amber-600 to-orange-600 text-white flex items-center justify-center shadow-md shadow-amber-600/15 group-hover:scale-105 transition-transform p-3">
                <ScanLine className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-[10px] font-mono font-bold text-amber-800">
                Rx Lens & Myths
              </span>
            </div>

            <div>
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-amber-700 block">
                MODULE 3 • LABEL LENS & FORMULATIONS
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-forest-950 mt-1 group-hover:text-amber-700 transition">
                Ingredient & Claim Myth Buster
              </h2>
              <p className="text-xs text-charcoal-600 mt-1 leading-relaxed">
                Scan bottle barcodes or labels to debunk marketing claims, verify active dosages & find clinical alternatives.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-mint-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-mono text-charcoal-600">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>Evidence-Backed</span>
            </div>
            <button
              type="button"
              className="px-4 py-2 rounded-full bg-forest-900 text-white font-black text-xs group-hover:bg-forest-800 transition shadow-soft flex items-center gap-1"
            >
              <span>Scan Product</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* CARD 4: 📁 DOCUMENT STORE & AI REPORT ANALYZER */}
        <div 
          onClick={() => setActiveTab('documents')}
          className="group p-6 sm:p-7 rounded-[2.5rem] bg-white hover:bg-mint-50/30 border border-mint-200/80 hover:border-mint-400 transition-all duration-200 cursor-pointer shadow-card flex flex-col justify-between space-y-5 relative overflow-hidden"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-teal-700 to-forest-800 text-white flex items-center justify-center shadow-md shadow-teal-700/15 group-hover:scale-105 transition-transform p-3">
                <FileText className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 rounded-full bg-mint-100 border border-mint-200 text-[10px] font-mono font-bold text-forest-800">
                {healthDocuments.length} Stored Reports
              </span>
            </div>

            <div>
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-forest-700 block">
                MODULE 4 • HEALTH DOCS & BIOMARKERS
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-forest-950 mt-1 group-hover:text-forest-800 transition">
                Document Store & AI Analyzer
              </h2>
              <p className="text-xs text-charcoal-600 mt-1 leading-relaxed">
                Securely store blood test PDFs, lipid panels & prescriptions. Gemini AI analyzes biomarkers into actionable advice.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-mint-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-mono text-charcoal-600">
              <Sparkles className="w-3.5 h-3.5 text-mint-600" />
              <span>Biomarker Insights</span>
            </div>
            <button
              type="button"
              className="px-4 py-2 rounded-full bg-forest-900 text-white font-black text-xs group-hover:bg-forest-800 transition shadow-soft flex items-center gap-1"
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
