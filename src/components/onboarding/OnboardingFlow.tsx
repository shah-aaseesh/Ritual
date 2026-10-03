import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Bot, 
  Sparkles, 
  Activity,
  Flame,
  User,
  Mail,
  Lock,
  Scale,
  Ruler,
  Calendar,
  Loader2,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { signUpUser, signInUser, syncProfileToSupabase, fetchProfileFromSupabase } from '../../services/supabase';

export const OnboardingFlow: React.FC = () => {
  const { completeOnboarding, aiSettings, updateAISettings, setActiveTab, showToast } = useApp();

  // Auth Mode: Create Account vs Sign In
  const [authMode, setAuthMode] = useState<'signup' | 'signin'>('signup');

  // Account Credentials
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // User Profile Baselines
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState<number>(24);
  const [heightFeet, setHeightFeet] = useState<number>(5);
  const [heightInches, setHeightInches] = useState<number>(9);
  const [weightKg, setWeightKg] = useState<number>(70);

  // AI Modal State
  const [showApiKeyModal, setShowApiKeyModal] = useState<boolean>(false);
  const [tempApiKey, setTempApiKey] = useState<string>(aiSettings.openRouterApiKey || '');
  const [tempModel, setTempModel] = useState<string>(aiSettings.selectedModel || 'google/gemini-3.1-flash-lite');

  // Dynamic Metabolic & BMI Calculation Engine
  const metrics = useMemo(() => {
    const totalInches = (heightFeet * 12) + heightInches;
    const heightCm = Math.round(totalInches * 2.54);
    const heightM = heightCm / 100;

    const rawBmi = heightM > 0 ? weightKg / (heightM * heightM) : 22.5;
    const bmi = parseFloat(rawBmi.toFixed(1));

    let bmiCategory = 'Healthy Normal';
    let bmiColor = 'text-emerald-700 bg-emerald-50 border-emerald-300';

    if (bmi < 18.5) {
      bmiCategory = 'Underweight';
      bmiColor = 'text-sky-700 bg-sky-50 border-sky-300';
    } else if (bmi <= 24.9) {
      bmiCategory = 'Healthy Normal';
      bmiColor = 'text-emerald-700 bg-emerald-50 border-emerald-300';
    } else if (bmi <= 29.9) {
      bmiCategory = 'Overweight / High Muscle';
      bmiColor = 'text-amber-700 bg-amber-50 border-amber-300';
    } else {
      bmiCategory = 'High BMI';
      bmiColor = 'text-rose-700 bg-rose-50 border-rose-300';
    }

    // Mifflin-St Jeor Formula
    const genderOffset = gender === 'male' ? 5 : -161;
    const bmr = Math.round((10 * weightKg) + (6.25 * heightCm) - (5 * age) + genderOffset);
    const maintenanceCalories = Math.round(bmr * 1.45);

    // Calibrated Daily Macros
    const proteinG = Math.round(weightKg * 2.0); // 2.0g per kg target
    const fatG = Math.round((maintenanceCalories * 0.25) / 9);
    const carbsG = Math.max(60, Math.round((maintenanceCalories - (proteinG * 4) - (fatG * 9)) / 4));

    return {
      heightCm,
      bmi,
      bmiCategory,
      bmiColor,
      bmr,
      maintenanceCalories,
      proteinG,
      carbsG,
      fatG
    };
  }, [gender, age, heightFeet, heightInches, weightKg]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const cleanEmail = email.trim();
    const cleanName = name.trim() || cleanEmail.split('@')[0] || 'Alex Patel';

    if (!cleanEmail) {
      setAuthError('Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      setAuthError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    if (authMode === 'signup') {
      const authRes = await signUpUser(cleanEmail, password, cleanName);
      if (authRes.error && !authRes.error.toLowerCase().includes('already registered')) {
        setIsLoading(false);
        setAuthError(authRes.error);
        return;
      }

      // Store auth session locally
      localStorage.setItem('ritual_auth_user', JSON.stringify({ email: cleanEmail, name: cleanName }));
      
      const userProfile = {
        name: cleanName,
        email: cleanEmail,
        age,
        heightFeet,
        heightInches,
        weightKg,
        gender,
        bmi: metrics.bmi,
        bmiCategory: metrics.bmiCategory,
        bmr: metrics.bmr,
        maintenanceCalories: metrics.maintenanceCalories,
        primaryGoal: 'hair_health' as const,
        healthGoal: 'hypertrophy_strength' as const,
        trainingExperience: 'intermediate' as const,
        dailyTime: '5_min' as const,
        alreadyOwnsProducts: true,
        isOnboarded: true,
        createdAt: new Date().toISOString()
      };

      try {
        localStorage.setItem('ritual_macro_targets', JSON.stringify({
          calories: metrics.maintenanceCalories,
          proteinG: metrics.proteinG,
          carbsG: metrics.carbsG,
          fatG: metrics.fatG,
          waterMl: 3000
        }));
      } catch (e) {}

      await syncProfileToSupabase(userProfile);
      completeOnboarding(userProfile);
      setIsLoading(false);
      showToast(`Account created for ${cleanName}! Welcome to Ritual.`, 'success');
      setActiveTab('home');

    } else {
      // Sign In Mode
      const authRes = await signInUser(cleanEmail, password);
      if (authRes.error) {
        setIsLoading(false);
        setAuthError(authRes.error);
        return;
      }

      const remote = await fetchProfileFromSupabase();
      const resolvedName = remote?.name || cleanName;

      localStorage.setItem('ritual_auth_user', JSON.stringify({ email: cleanEmail, name: resolvedName }));

      const userProfile = {
        name: resolvedName,
        email: cleanEmail,
        age: remote?.age || age,
        heightFeet: remote?.heightFeet || heightFeet,
        heightInches: remote?.heightInches || heightInches,
        weightKg: remote?.weightKg || weightKg,
        gender: remote?.gender || gender,
        bmi: remote?.bmi || metrics.bmi,
        bmiCategory: remote?.bmiCategory || metrics.bmiCategory,
        bmr: remote?.bmr || metrics.bmr,
        maintenanceCalories: remote?.maintenanceCalories || metrics.maintenanceCalories,
        primaryGoal: remote?.primaryGoal || ('hair_health' as const),
        healthGoal: remote?.healthGoal || ('hypertrophy_strength' as const),
        trainingExperience: remote?.trainingExperience || ('intermediate' as const),
        dailyTime: remote?.dailyTime || ('5_min' as const),
        alreadyOwnsProducts: true,
        isOnboarded: true,
        createdAt: new Date().toISOString()
      };

      try {
        localStorage.setItem('ritual_macro_targets', JSON.stringify({
          calories: userProfile.maintenanceCalories,
          proteinG: Math.round(userProfile.weightKg * 2.0),
          carbsG: metrics.carbsG,
          fatG: metrics.fatG,
          waterMl: 3000
        }));
      } catch (e) {}

      completeOnboarding(userProfile);
      setIsLoading(false);
      showToast(`Welcome back, ${resolvedName}!`, 'success');
      setActiveTab('home');
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-charcoal-900 flex flex-col justify-between p-4 sm:p-8 max-w-2xl mx-auto selection:bg-[#44926C] selection:text-white">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-mint-200/80">
          <div className="flex items-center gap-2.5">
            <img 
              src="/icons/icon.svg" 
              alt="Ritual Logo" 
              className="w-9 h-9 rounded-2xl object-cover shadow-soft border border-mint-200"
            />
            <div>
              <span className="text-base font-black tracking-tight text-forest-950">RITUAL</span>
              <span className="text-[10px] text-charcoal-500 font-semibold block -mt-0.5 tracking-wider uppercase font-mono">
                Evidence-Based Health Protocol
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowApiKeyModal(true)}
              className="p-2 rounded-full bg-cream-50 hover:bg-mint-100 border border-mint-200 text-charcoal-600 hover:text-forest-900 transition"
              title="AI Settings"
            >
              <Bot className="w-4 h-4 text-forest-800" />
            </button>
          </div>
        </div>

        {/* Main Form Container */}
        <form onSubmit={handleSubmit} className="space-y-5 pt-6 animate-in fade-in duration-200">
          
          {/* Title and Mode Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-forest-950 tracking-tight">
                {authMode === 'signup' ? 'Create Your Account' : 'Welcome Back'}
              </h2>
              <p className="text-xs text-charcoal-600 mt-0.5">
                {authMode === 'signup' 
                  ? 'Set up cloud sync and calibrate your precision health protocol.' 
                  : 'Sign in to access your cloud routine, workouts, and biomarkers.'}
              </p>
            </div>

            {/* Auth Mode Toggle Pill */}
            <div className="flex items-center p-1 bg-cream-100/80 rounded-2xl border border-mint-200 shrink-0 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => { setAuthMode('signup'); setAuthError(null); }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition ${
                  authMode === 'signup'
                    ? 'bg-forest-900 text-white shadow-xs'
                    : 'text-charcoal-600 hover:text-forest-900 font-bold'
                }`}
              >
                Sign Up
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('signin'); setAuthError(null); }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition ${
                  authMode === 'signin'
                    ? 'bg-forest-900 text-white shadow-xs'
                    : 'text-charcoal-600 hover:text-forest-900 font-bold'
                }`}
              >
                Sign In
              </button>
            </div>
          </div>

          {/* Auth Error Banner */}
          {authError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{authError}</span>
            </div>
          )}

          {/* SECTION 1: Credentials Card */}
          <div className="p-5 sm:p-7 rounded-[2rem] bg-white border border-mint-200/90 shadow-card space-y-4">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-forest-700 block">
              1. ACCOUNT CREDENTIALS (SUPABASE SYNC)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {authMode === 'signup' && (
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-forest-950">
                    <User className="w-3.5 h-3.5 text-forest-700" />
                    <span>Your Full Name</span>
                  </label>
                  <input
                    type="text"
                    required={authMode === 'signup'}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Patel"
                    className="w-full px-4 py-3 rounded-2xl bg-cream-50/80 border border-mint-200 text-charcoal-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-forest-700 font-bold"
                    autoFocus
                  />
                </div>
              )}

              <div className={`space-y-1.5 ${authMode === 'signin' ? 'sm:col-span-1' : ''}`}>
                <label className="flex items-center gap-1.5 text-xs font-bold text-forest-950">
                  <Mail className="w-3.5 h-3.5 text-forest-700" />
                  <span>Email Address</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@gmail.com"
                  className="w-full px-4 py-3 rounded-2xl bg-cream-50/80 border border-mint-200 text-charcoal-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-forest-700 font-medium font-mono"
                />
              </div>

              <div className={`space-y-1.5 ${authMode === 'signin' ? 'sm:col-span-1' : 'sm:col-span-2'}`}>
                <label className="flex items-center gap-1.5 text-xs font-bold text-forest-950">
                  <Lock className="w-3.5 h-3.5 text-forest-700" />
                  <span>Password (min. 6 characters)</span>
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-2xl bg-cream-50/80 border border-mint-200 text-charcoal-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-forest-700 font-mono"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Biometrics Card (Always active for calibrated targets) */}
          <div className="p-5 sm:p-7 rounded-[2rem] bg-white border border-mint-200/90 shadow-card space-y-5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-forest-700 block">
              2. BODY METRICS & METABOLIC CALIBRATION
            </span>

            {/* Row: Biological Sex & Age */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-bold text-forest-950">
                  <Activity className="w-3.5 h-3.5 text-forest-700" />
                  <span>Biological Sex</span>
                </label>
                <div className="grid grid-cols-2 gap-2 bg-cream-50/80 p-1.5 rounded-2xl border border-mint-200">
                  <button
                    type="button"
                    onClick={() => setGender('male')}
                    className={`py-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
                      gender === 'male'
                        ? 'bg-forest-900 text-white shadow-soft font-black'
                        : 'text-charcoal-600 hover:text-forest-950 font-bold'
                    }`}
                  >
                    <span>♂ Male</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('female')}
                    className={`py-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
                      gender === 'female'
                        ? 'bg-forest-900 text-white shadow-soft font-black'
                        : 'text-charcoal-600 hover:text-forest-950 font-bold'
                    }`}
                  >
                    <span>♀ Female</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="flex items-center justify-between text-xs font-bold text-forest-950">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-forest-700" />
                    <span>Age</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-charcoal-500">{age} years old</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAge(a => Math.max(14, a - 1))}
                    className="w-10 h-11 rounded-xl bg-cream-50 hover:bg-mint-100 border border-mint-200 font-black text-sm text-forest-950 flex items-center justify-center active:scale-95 transition"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="14"
                    max="100"
                    value={age}
                    onChange={(e) => setAge(Math.max(14, Math.min(100, parseInt(e.target.value) || 20)))}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-cream-50/80 border border-mint-200 text-center text-sm font-black text-forest-950 font-mono focus:outline-none focus:ring-1 focus:ring-forest-700"
                  />
                  <button
                    type="button"
                    onClick={() => setAge(a => Math.min(100, a + 1))}
                    className="w-10 h-11 rounded-xl bg-cream-50 hover:bg-mint-100 border border-mint-200 font-black text-sm text-forest-950 flex items-center justify-center active:scale-95 transition"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Height (Feet & Inches) */}
            <div className="space-y-2 pt-2 border-t border-mint-100">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs font-bold text-forest-950">
                  <Ruler className="w-3.5 h-3.5 text-forest-700" />
                  <span>Height</span>
                </label>
                <span className="text-xs font-mono font-black text-forest-900 bg-mint-100 px-2.5 py-0.5 rounded-full border border-mint-200">
                  {heightFeet}' {heightInches}" • {metrics.heightCm} cm
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-charcoal-500">Feet</span>
                  <select
                    value={heightFeet}
                    onChange={(e) => setHeightFeet(parseInt(e.target.value) || 5)}
                    className="w-full py-2.5 px-3 rounded-xl bg-cream-50/80 border border-mint-200 text-xs sm:text-sm font-black text-forest-950 focus:outline-none focus:ring-1 focus:ring-forest-700"
                  >
                    <option value={4}>4 Feet</option>
                    <option value={5}>5 Feet</option>
                    <option value={6}>6 Feet</option>
                    <option value={7}>7 Feet</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-charcoal-500">Inches</span>
                  <select
                    value={heightInches}
                    onChange={(e) => setHeightInches(parseInt(e.target.value) || 0)}
                    className="w-full py-2.5 px-3 rounded-xl bg-cream-50/80 border border-mint-200 text-xs sm:text-sm font-black text-forest-950 focus:outline-none focus:ring-1 focus:ring-forest-700 font-mono"
                  >
                    {Array.from({ length: 12 }).map((_, i) => (
                      <option key={i} value={i}>{i} Inches</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Weight (kg / lbs) */}
            <div className="space-y-2 pt-2 border-t border-mint-100">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs font-bold text-forest-950">
                  <Scale className="w-3.5 h-3.5 text-forest-700" />
                  <span>Body Weight</span>
                </label>
                <span className="text-xs font-mono font-black text-forest-900 bg-mint-100 px-2.5 py-0.5 rounded-full border border-mint-200">
                  {weightKg} kg ({Math.round(weightKg * 2.20462)} lbs)
                </span>
              </div>

              <div className="space-y-2">
                <input
                  type="range"
                  min="40"
                  max="160"
                  step="1"
                  value={weightKg}
                  onChange={(e) => setWeightKg(parseInt(e.target.value) || 70)}
                  className="w-full accent-forest-900 h-2 bg-cream-100 rounded-lg cursor-pointer"
                />

                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setWeightKg(w => Math.max(40, w - 1))}
                    className="px-3 py-1.5 rounded-xl bg-cream-50 hover:bg-mint-100 border border-mint-200 font-black text-xs text-forest-950 active:scale-95 transition"
                  >
                    - 1 kg
                  </button>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="40"
                      max="160"
                      value={weightKg}
                      onChange={(e) => setWeightKg(Math.max(40, Math.min(160, parseInt(e.target.value) || 70)))}
                      className="w-16 py-1.5 px-2 rounded-xl bg-cream-50/80 border border-mint-200 text-center text-xs font-black text-forest-950 font-mono focus:outline-none focus:ring-1 focus:ring-forest-700"
                    />
                    <span className="text-xs font-bold text-charcoal-500">kg</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setWeightKg(w => Math.min(160, w + 1))}
                    className="px-3 py-1.5 rounded-xl bg-cream-50 hover:bg-mint-100 border border-mint-200 font-black text-xs text-forest-950 active:scale-95 transition"
                  >
                    + 1 kg
                  </button>
                </div>
              </div>
            </div>

            {/* Live Calibrated Target Dashboard */}
            <div className="p-4 rounded-2xl bg-forest-950 text-white border border-forest-800 space-y-3 shadow-soft">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-mint-300/90 font-bold flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-[#FC5200]" />
                  <span>Calibrated Baselines</span>
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${metrics.bmiColor}`}>
                  BMI {metrics.bmi} • {metrics.bmiCategory}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-forest-800/80">
                <div className="p-2 rounded-xl bg-forest-900/60 border border-forest-800">
                  <span className="text-[9px] text-cream-200/70 block uppercase font-mono">Daily Burn</span>
                  <span className="text-xs sm:text-sm font-black text-mint-300 font-mono">{metrics.maintenanceCalories} kcal</span>
                </div>
                <div className="p-2 rounded-xl bg-forest-900/60 border border-forest-800">
                  <span className="text-[9px] text-cream-200/70 block uppercase font-mono">Protein Target</span>
                  <span className="text-xs sm:text-sm font-black text-white font-mono">{metrics.proteinG}g / day</span>
                </div>
                <div className="p-2 rounded-xl bg-forest-900/60 border border-forest-800">
                  <span className="text-[9px] text-cream-200/70 block uppercase font-mono">Base BMR</span>
                  <span className="text-xs sm:text-sm font-black text-cream-100 font-mono">{metrics.bmr} kcal</span>
                </div>
              </div>
            </div>

          </div>

          {/* Submit Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-2xl bg-forest-900 hover:bg-forest-800 disabled:opacity-60 text-white font-black text-sm shadow-lg shadow-forest-950/20 transition flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{authMode === 'signup' ? 'Creating Account & Syncing Cloud...' : 'Signing In...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-mint-300" />
                  <span>{authMode === 'signup' ? 'Create Account & Launch Ritual ›' : 'Sign In & Launch Ritual ›'}</span>
                </>
              )}
            </button>
            <div className="mt-2 text-center flex items-center justify-center gap-1.5 text-[11px] text-charcoal-500 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-forest-700" />
              <span>Protected by Supabase Cloud Encryption</span>
            </div>
          </div>

        </form>
      </div>

      {/* Optional OpenRouter AI Vision Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[2rem] max-w-md w-full p-6 shadow-modal border border-mint-200 space-y-4 text-charcoal-900">
            <div className="flex items-center justify-between border-b border-mint-100 pb-3">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-forest-800" />
                <h3 className="text-base font-black text-forest-950">AI Vision & Synthesis Settings</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowApiKeyModal(false)}
                className="p-1 rounded-full text-charcoal-400 hover:text-charcoal-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-mono uppercase text-charcoal-500 mb-1">
                  OpenRouter API Key (Optional)
                </label>
                <input
                  type="password"
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  placeholder="sk-or-v1-..."
                  className="w-full p-2.5 rounded-xl bg-cream-50 border border-mint-200 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-charcoal-500 mb-1">
                  Preferred Model
                </label>
                <input
                  type="text"
                  value={tempModel}
                  onChange={(e) => setTempModel(e.target.value)}
                  placeholder="google/gemini-3.1-flash-lite"
                  className="w-full p-2.5 rounded-xl bg-cream-50 border border-mint-200 text-xs font-mono"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                updateAISettings({
                  openRouterApiKey: tempApiKey,
                  selectedModel: tempModel,
                  enabled: !!tempApiKey
                });
                setShowApiKeyModal(false);
              }}
              className="w-full py-2.5 rounded-xl bg-forest-900 text-white font-bold text-xs"
            >
              Save AI Configuration
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
