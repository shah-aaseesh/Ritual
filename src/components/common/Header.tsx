import React, { useState, useEffect } from 'react';
import { useApp, NavTab } from '../../context/AppContext';
import { ShareCardData } from '../../types';
import { LayoutDashboard, Dumbbell, Utensils, ScanLine, FileText, Settings, X, Download, Share2, LogIn, LogOut, User } from 'lucide-react';
import { SocialShareModal } from './SocialShareModal';
import { AuthModal } from '../auth/AuthModal';
import { supabase } from '../../services/supabase';

export const Header: React.FC = () => {
  const { profile, updateProfile, activeTab, setActiveTab, healthDocuments, activePillar, routineSteps, progressHistory, logout } = useApp();
  const [showSettings, setShowSettings] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authUser, setAuthUser] = useState<{ email: string; name?: string } | null>(() => {
    const saved = localStorage.getItem('ritual_auth_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return profile.email ? { email: profile.email, name: profile.name } : null;
  });

  useEffect(() => {
    // Listen to Supabase auth state changes
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        const u = {
          email: data.session.user.email || '',
          name: data.session.user.user_metadata?.full_name || data.session.user.email?.split('@')[0]
        };
        setAuthUser(u);
        localStorage.setItem('ritual_auth_user', JSON.stringify(u));
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const u = {
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0]
        };
        setAuthUser(u);
        localStorage.setItem('ritual_auth_user', JSON.stringify(u));
      } else {
        setAuthUser(null);
        localStorage.removeItem('ritual_auth_user');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    setAuthUser(null);
  };
  const [shareModalData, setShareModalData] = useState<ShareCardData | null>(null);
  const [tempName, setTempName] = useState(profile.name || 'Alex');
  const [tempEmail, setTempEmail] = useState(profile.email || '');
  const [tempGender, setTempGender] = useState<'male' | 'female'>((profile.gender as 'male' | 'female') || 'male');
  const [tempAge, setTempAge] = useState<number>(profile.age || 24);
  const [tempHeightFeet, setTempHeightFeet] = useState<number>(profile.heightFeet || 5);
  const [tempHeightInches, setTempHeightInches] = useState<number>(profile.heightInches || 10);
  const [tempWeightKg, setTempWeightKg] = useState<number>(profile.weightKg || 70);

  const mainNavTabs: { id: NavTab; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { id: 'home', label: 'Home', icon: LayoutDashboard },
    { id: 'workout', label: 'Workout Log', icon: Dumbbell },
    { id: 'calories', label: 'Calorie Tracker', icon: Utensils },
    { id: 'mythbuster', label: 'Myth Buster', icon: ScanLine },
    { id: 'documents', label: 'Medical Docs & AI', icon: FileText, badge: healthDocuments.length > 0 ? healthDocuments.length : undefined },
  ];

  // Dynamic live metric calculations
  const tempMetrics = React.useMemo(() => {
    const totalInches = (tempHeightFeet * 12) + tempHeightInches;
    const heightCm = Math.round(totalInches * 2.54);
    const heightM = heightCm / 100;
    const rawBmi = heightM > 0 ? tempWeightKg / (heightM * heightM) : 22.5;
    const bmi = parseFloat(rawBmi.toFixed(1));

    let bmiCategory = 'Healthy Normal';
    if (bmi < 18.5) bmiCategory = 'Underweight';
    else if (bmi <= 24.9) bmiCategory = 'Healthy Normal';
    else if (bmi <= 29.9) bmiCategory = 'Athletic / Overweight';
    else bmiCategory = 'High BMI';

    const genderOffset = tempGender === 'male' ? 5 : -161;
    const bmr = Math.round((10 * tempWeightKg) + (6.25 * heightCm) - (5 * tempAge) + genderOffset);
    const maintenanceCalories = Math.round(bmr * 1.45);
    const proteinG = Math.round(tempWeightKg * 2.0);

    return { heightCm, bmi, bmiCategory, bmr, maintenanceCalories, proteinG };
  }, [tempGender, tempAge, tempHeightFeet, tempHeightInches, tempWeightKg]);

  const handleSaveSettings = () => {
    updateProfile({
      name: tempName.trim() || 'Alex',
      email: tempEmail.trim(),
      gender: tempGender,
      age: tempAge,
      heightFeet: tempHeightFeet,
      heightInches: tempHeightInches,
      weightKg: tempWeightKg,
      bmi: tempMetrics.bmi,
      bmiCategory: tempMetrics.bmiCategory,
      bmr: tempMetrics.bmr,
      maintenanceCalories: tempMetrics.maintenanceCalories
    });

    try {
      localStorage.setItem('ritual_macro_targets', JSON.stringify({
        calories: tempMetrics.maintenanceCalories,
        proteinG: tempMetrics.proteinG,
        carbsG: Math.max(60, Math.round((tempMetrics.maintenanceCalories - (tempMetrics.proteinG * 4) - 500) / 4)),
        fatG: Math.round((tempMetrics.maintenanceCalories * 0.25) / 9),
        waterMl: 3000
      }));
    } catch (e) {}

    setShowSettings(false);
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-[#FBF9F5]/90 backdrop-blur-xl border-b border-mint-200/80 px-4 sm:px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Brand Logo */}
          <button 
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <img 
              src="/icons/icon.svg" 
              alt="Ritual Logo" 
              className="w-8 h-8 rounded-xl object-contain shadow-soft group-hover:scale-105 transition-transform" 
            />
            <div>
              <h1 className="text-lg font-black tracking-tight text-forest-950 font-sans">
                Ritual
              </h1>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 bg-white/90 p-1 rounded-full border border-mint-200/80 shadow-soft">
            {mainNavTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id || (tab.id === 'workout' && activeTab === 'gym') || (tab.id === 'mythbuster' && activeTab === 'labellens');

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all duration-150 ${
                    isActive
                      ? 'bg-forest-900 text-white shadow-sm font-black'
                      : 'text-charcoal-600 hover:text-forest-900 hover:bg-mint-50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span className="px-1.5 py-0.2 rounded-full bg-mint-600 text-white text-[9px] font-mono">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action: Goal Chip & Profile Settings */}
          <div className="flex items-center gap-2">
            {/* Screenshot & Share Button */}
            <button
              type="button"
              onClick={() => {
                const completedCount = routineSteps.filter(s => s.isCompletedToday).length;
                const totalSteps = routineSteps.length || 6;
                const rate = routineSteps.length > 0 ? Math.round((completedCount / routineSteps.length) * 100) : 0;
                const streak = progressHistory.filter(p => p.completionRate >= 0.75).length + (rate >= 75 ? 1 : 0);

                const weightKg = profile.weightKg || 70;
                const totalInches = (profile.heightFeet || 5) * 12 + (profile.heightInches || 9);
                const heightCm = Math.round(totalInches * 2.54);
                const age = profile.age || 24;
                const isMale = profile.gender !== 'female';
                const bmr = isMale 
                  ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5 
                  : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
                const maintenanceKcal = profile.maintenanceCalories || Math.round(bmr * 1.4);
                const proteinTarget = Math.round(weightKg * 2.0);

                const data: ShareCardData = {
                  type: activePillar === 'health' ? 'workout' : 'protocol',
                  title: activePillar === 'health' ? 'Daily Training & Bio-Stack' : 'Daily Bio-Protocol Active',
                  subtitle: `${profile.name || 'Alex Patel'} • ${isMale ? 'Male' : 'Female'}, ${age} yrs • Target: ${maintenanceKcal} kcal`,
                  date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                  primaryStat: rate > 0 ? {
                    label: 'DAILY PROTOCOL ADHERENCE',
                    value: `${rate}%`,
                    unit: rate === 100 ? 'COMPLETED' : 'ACHIEVED'
                  } : {
                    label: 'METABOLIC ENERGY TARGET',
                    value: maintenanceKcal,
                    unit: 'KCAL / DAY'
                  },
                  secondaryStats: [
                    { label: 'PROTEIN TARGET', value: `${proteinTarget}g`, highlight: true },
                    { label: 'ACTIVE STREAK', value: `${streak} Days` },
                    { label: 'HABITS CHECKED', value: `${completedCount}/${totalSteps}` }
                  ],
                  highlightItems: [
                    `Energy: ${maintenanceKcal} kcal`,
                    `Protein: ${proteinTarget}g`,
                    `Weight: ${weightKg}kg`,
                    'Habit Consistency'
                  ],
                  badgeText: rate === 100 ? '🌟 PERFECT 100% PROTOCOL' : '⚡ RITUAL ATHLETE',
                  tagline: 'Evidence-Based Longevity & Fitness',
                  completionRate: rate > 0 ? rate : 100
                };
                setShareModalData(data);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FC5200] hover:bg-[#E04800] text-xs font-black text-white transition active:scale-95 shadow-soft"
              title="Share Activity & Workout Card"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Share / Snap</span>
            </button>

            {/* Install PWA App Button */}
            <button
              type="button"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('open-install-prompt'));
              }}
              className="hidden sm:flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full bg-mint-100 hover:bg-mint-200 border border-mint-300 text-xs font-black text-forest-950 transition active:scale-95 shadow-xs"
              title="Install Ritual App on Phone"
            >
              <Download className="w-3.5 h-3.5 text-forest-900 stroke-[2.5]" />
              <span className="text-[11px] sm:text-xs font-black text-forest-950">Install</span>
            </button>

            {/* Profile & Settings Trigger */}
            <button
              onClick={() => {
                setTempName(profile.name || authUser?.name || 'Alex');
                setTempEmail(profile.email || authUser?.email || '');
                setTempGender((profile.gender as 'male' | 'female') || 'male');
                setTempAge(profile.age || 24);
                setTempHeightFeet(profile.heightFeet || 5);
                setTempHeightInches(profile.heightInches || 10);
                setTempWeightKg(profile.weightKg || 70);
                setShowSettings(true);
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white hover:bg-mint-50 border border-mint-200/80 text-xs font-bold text-charcoal-800 transition shadow-soft"
              aria-label="Profile Settings"
              title="Profile & Body Stats"
            >
              <div className="w-5 h-5 rounded-full bg-forest-900 text-white flex items-center justify-center text-[10px] font-black">
                {(profile.name || authUser?.name || 'A').charAt(0).toUpperCase()}
              </div>
              <span className="font-bold text-forest-900 max-w-[90px] truncate hidden sm:inline">
                {profile.name || authUser?.name || 'Profile'}
              </span>
              <Settings className="w-3.5 h-3.5 text-charcoal-400" />
            </button>

            {/* Authentication Buttons: Login / Logout */}
            {authUser ? (
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 text-xs font-bold transition active:scale-95 shadow-soft"
                title={`Logged in as ${authUser.email} - Click to Log Out`}
              >
                <LogOut className="w-3.5 h-3.5 text-rose-600" />
                <span className="hidden sm:inline">Log Out</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-forest-900 hover:bg-forest-800 text-white text-xs font-black transition active:scale-95 shadow-soft"
                title="Sign in with Supabase"
              >
                <LogIn className="w-3.5 h-3.5 text-mint-300" />
                <span>Log In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Profile & Body Stats Calibration Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] max-w-md w-full p-5 sm:p-6 shadow-modal border border-mint-200 text-charcoal-900 space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Title */}
            <div className="flex items-center justify-between border-b border-mint-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-forest-900 text-mint-300 flex items-center justify-center font-black">
                  <Settings className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-black text-forest-950">Profile & Body Metrics</h2>
                  <span className="text-[10px] text-charcoal-500 font-medium">Your personal baselines & targets</span>
                </div>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1.5 rounded-full text-charcoal-400 hover:text-charcoal-700 hover:bg-mint-50 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="font-bold text-charcoal-700">Full Name</label>
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-cream-50 border border-mint-200 focus:outline-none focus:ring-1 focus:ring-forest-700 text-charcoal-900 font-bold"
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-charcoal-700">Email Address</label>
                  <input
                    type="email"
                    value={tempEmail}
                    onChange={(e) => setTempEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-cream-50 border border-mint-200 focus:outline-none focus:ring-1 focus:ring-forest-700 text-charcoal-900 font-medium"
                    placeholder="alex@gmail.com"
                  />
                </div>
              </div>

              {/* Gender & Age */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="font-bold text-charcoal-700">Biological Sex</label>
                  <div className="grid grid-cols-2 gap-1 bg-cream-50 p-1 rounded-xl border border-mint-200">
                    <button
                      type="button"
                      onClick={() => setTempGender('male')}
                      className={`py-1.5 rounded-lg text-xs font-bold transition ${
                        tempGender === 'male' ? 'bg-forest-900 text-white shadow-xs' : 'text-charcoal-600 hover:text-forest-900'
                      }`}
                    >
                      Male
                    </button>
                    <button
                      type="button"
                      onClick={() => setTempGender('female')}
                      className={`py-1.5 rounded-lg text-xs font-bold transition ${
                        tempGender === 'female' ? 'bg-forest-900 text-white shadow-xs' : 'text-charcoal-600 hover:text-forest-900'
                      }`}
                    >
                      Female
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-charcoal-700">Age</label>
                  <input
                    type="number"
                    min="14"
                    max="100"
                    value={tempAge}
                    onChange={(e) => setTempAge(Math.max(14, parseInt(e.target.value) || 20))}
                    className="w-full px-3 py-2 rounded-xl bg-cream-50 border border-mint-200 focus:outline-none focus:ring-1 focus:ring-forest-700 text-charcoal-900 font-bold"
                  />
                </div>
              </div>

              {/* Height & Weight */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="font-bold text-charcoal-700">Height (ft & in)</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="4"
                      max="7"
                      value={tempHeightFeet}
                      onChange={(e) => setTempHeightFeet(parseInt(e.target.value) || 5)}
                      className="w-1/2 px-2.5 py-2 rounded-xl bg-cream-50 border border-mint-200 text-center font-bold"
                    />
                    <span className="text-charcoal-400 font-bold">ft</span>
                    <input
                      type="number"
                      min="0"
                      max="11"
                      value={tempHeightInches}
                      onChange={(e) => setTempHeightInches(parseInt(e.target.value) || 0)}
                      className="w-1/2 px-2.5 py-2 rounded-xl bg-cream-50 border border-mint-200 text-center font-bold"
                    />
                    <span className="text-charcoal-400 font-bold">in</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-charcoal-700">Weight (kg)</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="35"
                      max="200"
                      value={tempWeightKg}
                      onChange={(e) => setTempWeightKg(parseInt(e.target.value) || 70)}
                      className="w-full px-3 py-2 rounded-xl bg-cream-50 border border-mint-200 text-center font-bold"
                    />
                    <span className="text-charcoal-400 font-bold">kg</span>
                  </div>
                </div>
              </div>

              {/* Real-time Calculated Biomarkers Summary Card */}
              <div className="p-3.5 rounded-2xl bg-forest-900 text-white space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-mint-300 font-bold">LIVE METABOLIC TARGETS</span>
                  <span className="px-2 py-0.5 rounded-full bg-forest-800 text-mint-200 border border-mint-700/50">
                    {tempMetrics.bmiCategory}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                  <div className="p-2 rounded-xl bg-forest-800/80 border border-forest-700/60">
                    <span className="text-[10px] text-cream-300/80 block uppercase">BMI</span>
                    <span className="text-sm font-black text-white font-mono">{tempMetrics.bmi}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-forest-800/80 border border-forest-700/60">
                    <span className="text-[10px] text-cream-300/80 block uppercase">Daily Burn</span>
                    <span className="text-sm font-black text-mint-300 font-mono">{tempMetrics.maintenanceCalories}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-forest-800/80 border border-forest-700/60">
                    <span className="text-[10px] text-cream-300/80 block uppercase">Protein Target</span>
                    <span className="text-sm font-black text-white font-mono">{tempMetrics.proteinG}g</span>
                  </div>
                </div>
              </div>

              {/* Supabase Cloud Account Status */}
              <div className="p-3.5 rounded-2xl bg-cream-50 border border-mint-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-forest-900 text-mint-300 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono uppercase font-bold text-charcoal-500 block">
                      Supabase Cloud Account
                    </span>
                    <span className="text-xs font-bold text-forest-950 truncate block">
                      {authUser?.email || profile.email || 'Connected'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    handleLogout();
                    setShowSettings(false);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 text-[11px] font-bold transition shrink-0"
                >
                  Log Out
                </button>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="flex-1 py-3 rounded-xl bg-cream-50 hover:bg-cream-100 text-charcoal-700 font-bold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  className="flex-1 py-3 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-extrabold text-xs shadow-soft transition active:scale-95"
                >
                  Save & Calibrate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Supabase Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      {/* Strava-Style Social Share Modal */}
      {shareModalData && (
        <SocialShareModal
          isOpen={!!shareModalData}
          onClose={() => setShareModalData(null)}
          data={shareModalData}
        />
      )}
    </>
  );
};
