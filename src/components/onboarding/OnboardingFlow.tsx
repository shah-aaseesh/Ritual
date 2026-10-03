import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Bot, 
  ChevronRight, 
  ChevronLeft,
  Sparkles, 
  Activity,
  Flame,
  User,
  Mail,
  Scale,
  Ruler,
  Calendar,
  Check
} from 'lucide-react';
import { WellnessGoal, HealthGoal, DailyTimeCommitment, TrainingExperience } from '../../types';

export const OnboardingFlow: React.FC = () => {
  const { completeOnboarding, aiSettings, updateAISettings, setActiveTab } = useApp();

  // Stepped Flow State
  const [step, setStep] = useState<number>(1);
  
  // User Profile Baselines
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState<number>(24);
  const [heightFeet, setHeightFeet] = useState<number>(5);
  const [heightInches, setHeightInches] = useState<number>(9);
  const [weightKg, setWeightKg] = useState<number>(70);

  // Goal & Focus State
  const [primaryGoal, setPrimaryGoal] = useState<WellnessGoal>('hair_health');
  const [healthGoal, setHealthGoal] = useState<HealthGoal>('hypertrophy_strength');
  const [trainingExperience, setTrainingExperience] = useState<TrainingExperience>('intermediate');
  const [dailyTime, setDailyTime] = useState<DailyTimeCommitment>('5_min');

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

  const handleQuickSkip = () => {
    completeOnboarding({
      name: 'Alex Patel',
      email: 'alex@ritual.health',
      age: 24,
      heightFeet: 5,
      heightInches: 10,
      weightKg: 72,
      gender: 'male',
      bmi: 22.8,
      bmiCategory: 'Healthy Normal',
      bmr: 1720,
      maintenanceCalories: 2490,
      primaryGoal: 'hair_health',
      healthGoal: 'hypertrophy_strength',
      trainingExperience: 'intermediate',
      dailyTime: '5_min',
      alreadyOwnsProducts: true,
      isOnboarded: true
    });
    setActiveTab('home');
  };

  const handleFinishOnboarding = () => {
    try {
      localStorage.setItem('ritual_macro_targets', JSON.stringify({
        calories: metrics.maintenanceCalories,
        proteinG: metrics.proteinG,
        carbsG: metrics.carbsG,
        fatG: metrics.fatG,
        waterMl: 3000
      }));
    } catch (e) {}

    completeOnboarding({
      name: name.trim() || 'Alex Patel',
      email: email.trim() || `${(name.trim() || 'alex').toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      age,
      heightFeet,
      heightInches,
      weightKg,
      gender,
      bmi: metrics.bmi,
      bmiCategory: metrics.bmiCategory,
      bmr: metrics.bmr,
      maintenanceCalories: metrics.maintenanceCalories,
      primaryGoal,
      healthGoal,
      trainingExperience,
      dailyTime,
      alreadyOwnsProducts: true,
      isOnboarded: true
    });
    setActiveTab('home');
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
              onClick={handleQuickSkip}
              className="px-3.5 py-1.5 rounded-full bg-cream-50 hover:bg-mint-100 text-xs font-bold text-forest-900 border border-mint-200 transition active:scale-95 shadow-2xs"
            >
              <span>Quick Demo Profile ›</span>
            </button>

            <button
              onClick={() => setShowApiKeyModal(true)}
              className="p-2 rounded-full bg-cream-50 hover:bg-mint-100 border border-mint-200 text-charcoal-600 hover:text-forest-900 transition"
              title="AI Settings"
            >
              <Bot className="w-4 h-4 text-forest-800" />
            </button>
          </div>
        </div>

        {/* Stepper Progress Bar */}
        <div className="pt-4 pb-2">
          <div className="flex items-center justify-between mb-2 text-xs font-mono font-bold text-charcoal-500">
            <span className={step === 1 ? 'text-forest-950 font-black' : ''}>1. Basics & Stats</span>
            <span className={step === 2 ? 'text-forest-950 font-black' : ''}>2. Focus & Goals</span>
            <span className={step === 3 ? 'text-forest-950 font-black' : ''}>3. Custom Plan</span>
          </div>
          <div className="w-full h-2 bg-cream-100 rounded-full overflow-hidden flex border border-mint-100">
            <div 
              className="h-full bg-forest-900 transition-all duration-300 rounded-full"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* STEP 1: PERSONAL DETAILS & STATS                                          */}
        {/* ========================================================================= */}
        {step === 1 && (
          <div className="space-y-5 pt-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-black uppercase tracking-widest text-forest-700 block">
                STEP 1 OF 3 • YOUR BASELINES
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-forest-950 tracking-tight">
                Personal Details & Body Stats
              </h2>
              <p className="text-xs text-charcoal-600">
                We calibrate your exact daily energy needs, protein targets, and routine protocols from your body metrics.
              </p>
            </div>

            {/* Main Details Card */}
            <div className="p-5 sm:p-7 rounded-[2rem] bg-white border border-mint-200/90 shadow-card space-y-5">
              
              {/* Row 1: Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-forest-950">
                    <User className="w-3.5 h-3.5 text-forest-700" />
                    <span>Your Name</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Patel"
                    className="w-full px-4 py-3 rounded-2xl bg-cream-50/80 border border-mint-200 text-charcoal-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-forest-700 font-bold"
                    autoFocus
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-forest-950">
                    <Mail className="w-3.5 h-3.5 text-forest-700" />
                    <span>Email Address</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@gmail.com"
                    className="w-full px-4 py-3 rounded-2xl bg-cream-50/80 border border-mint-200 text-charcoal-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-forest-700 font-medium font-mono"
                  />
                </div>
              </div>

              {/* Row 2: Biological Sex & Age */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
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

              {/* Row 3: Height (Feet & Inches) */}
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
                      className="w-full py-2.5 px-3 rounded-xl bg-cream-50/80 border border-mint-200 text-xs sm:text-sm font-black text-forest-950 focus:outline-none focus:ring-1 focus:ring-forest-700"
                    >
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((inc) => (
                        <option key={inc} value={inc}>
                          {inc} Inches ({Math.round(((heightFeet * 12) + inc) * 2.54)} cm)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Row 4: Body Weight in Kg */}
              <div className="space-y-2 pt-2 border-t border-mint-100">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-forest-950">
                    <Scale className="w-3.5 h-3.5 text-forest-700" />
                    <span>Body Weight</span>
                  </label>
                  <span className="text-xs font-mono font-black text-forest-900 bg-mint-100 px-2.5 py-0.5 rounded-full border border-mint-200">
                    {weightKg} kg • {(weightKg * 2.20462).toFixed(1)} lbs
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="40"
                    max="140"
                    step="1"
                    value={weightKg}
                    onChange={(e) => setWeightKg(parseInt(e.target.value))}
                    className="flex-1 accent-forest-900 h-2.5 bg-mint-100 rounded-lg cursor-pointer"
                  />
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setWeightKg(w => Math.max(40, w - 1))}
                      className="w-9 h-9 rounded-xl bg-cream-50 hover:bg-mint-100 border border-mint-200 font-black text-sm text-forest-950 flex items-center justify-center active:scale-95 transition"
                    >
                      -
                    </button>
                    <span className="w-14 text-center text-xs font-mono font-black text-forest-950 bg-cream-50 py-2 rounded-xl border border-mint-200">
                      {weightKg} kg
                    </span>
                    <button
                      type="button"
                      onClick={() => setWeightKg(w => Math.min(140, w + 1))}
                      className="w-9 h-9 rounded-xl bg-cream-50 hover:bg-mint-100 border border-mint-200 font-black text-sm text-forest-950 flex items-center justify-center active:scale-95 transition"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Integrated Real-time Metabolic Health Dashboard Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-forest-900 text-white space-y-3 shadow-lg shadow-forest-950/10">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-mint-400" />
                    <span className="font-bold text-mint-300 uppercase tracking-wider">Estimated Metabolic Targets</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border font-mono ${metrics.bmiColor}`}>
                    {metrics.bmiCategory}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="p-2.5 rounded-xl bg-forest-800/80 border border-forest-700/60 space-y-0.5">
                    <span className="text-[10px] text-cream-300/80 block uppercase tracking-wider font-bold">BMI</span>
                    <span className="text-base font-black text-white font-mono">{metrics.bmi}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-forest-800/80 border border-forest-700/60 space-y-0.5">
                    <span className="text-[10px] text-cream-300/80 block uppercase tracking-wider font-bold">Daily Burn</span>
                    <span className="text-base font-black text-mint-300 font-mono">{metrics.maintenanceCalories} <span className="text-[10px]">kcal</span></span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-forest-800/80 border border-forest-700/60 space-y-0.5">
                    <span className="text-[10px] text-cream-300/80 block uppercase tracking-wider font-bold">Protein Target</span>
                    <span className="text-base font-black text-white font-mono">{metrics.proteinG}g</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: FOCUS & HEALTH GOALS                                              */}
        {/* ========================================================================= */}
        {step === 2 && (
          <div className="space-y-5 pt-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-black uppercase tracking-widest text-forest-700 block">
                STEP 2 OF 3 • YOUR FOCUS
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-forest-950 tracking-tight">
                Select Your Health & Fitness Goals
              </h2>
              <p className="text-xs text-charcoal-600">
                Choose your primary wellness focus and athletic targets to configure your custom routine.
              </p>
            </div>

            {/* Goal Card 1: Primary Wellness Focus */}
            <div className="p-5 rounded-[2rem] bg-white border border-mint-200/90 shadow-card space-y-3">
              <span className="text-xs font-mono font-black uppercase text-charcoal-500 block">
                1. Primary Wellness Pillar
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { id: 'hair_health' as WellnessGoal, name: 'Hair Health', icon: '🌿', desc: 'DHT blockers, follicle density, nutrition' },
                  { id: 'body_care' as WellnessGoal, name: 'Body & Skin', icon: '💧', desc: 'Skin barrier, active topicals, clear skin' },
                  { id: 'sleep_recovery' as WellnessGoal, name: 'Sleep & Recovery', icon: '🌙', desc: 'Deep sleep, circadian rhythm, rest' }
                ].map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setPrimaryGoal(g.id)}
                    className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                      primaryGoal === g.id
                        ? 'bg-forest-900 text-white border-forest-900 shadow-md ring-2 ring-forest-800'
                        : 'bg-cream-50/70 hover:bg-mint-50 text-charcoal-800 border-mint-200'
                    }`}
                  >
                    <div>
                      <span className="text-2xl block mb-1.5">{g.icon}</span>
                      <h4 className="text-xs font-black">{g.name}</h4>
                      <p className={`text-[10px] mt-1 leading-snug ${primaryGoal === g.id ? 'text-mint-100' : 'text-charcoal-500'}`}>
                        {g.desc}
                      </p>
                    </div>
                    {primaryGoal === g.id && (
                      <span className="self-end mt-2 w-4 h-4 rounded-full bg-mint-400 text-forest-950 flex items-center justify-center text-[10px] font-bold">
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Goal Card 2: Fitness & Strength Focus */}
            <div className="p-5 rounded-[2rem] bg-white border border-mint-200/90 shadow-card space-y-3">
              <span className="text-xs font-mono font-black uppercase text-charcoal-500 block">
                2. Fitness & Body Goal
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { id: 'hypertrophy_strength' as HealthGoal, name: 'Muscle & Strength', icon: '🏋️', desc: 'Hypertrophy & overload' },
                  { id: 'fat_loss_recomp' as HealthGoal, name: 'Fat Loss & Recomp', icon: '⚡', desc: 'Lean caloric deficit' },
                  { id: 'athletic_conditioning' as HealthGoal, name: 'Conditioning', icon: '🏃', desc: 'Stamina & power output' },
                  { id: 'longevity_health' as HealthGoal, name: 'Metabolic Longevity', icon: '🧬', desc: 'Insulin sensitivity & health' }
                ].map((hg) => (
                  <button
                    key={hg.id}
                    type="button"
                    onClick={() => setHealthGoal(hg.id)}
                    className={`p-3 rounded-xl border text-left transition flex items-center gap-2.5 ${
                      healthGoal === hg.id
                        ? 'bg-forest-900 text-white border-forest-900 shadow-sm'
                        : 'bg-cream-50/70 hover:bg-mint-50 text-charcoal-800 border-mint-200'
                    }`}
                  >
                    <span className="text-xl shrink-0">{hg.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-black truncate">{hg.name}</h4>
                      <p className={`text-[10px] truncate ${healthGoal === hg.id ? 'text-mint-200' : 'text-charcoal-500'}`}>
                        {hg.desc}
                      </p>
                    </div>
                    {healthGoal === hg.id && (
                      <Check className="w-3.5 h-3.5 text-mint-300 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Goal Card 3: Training Experience */}
            <div className="p-4 sm:p-5 rounded-[2rem] bg-white border border-mint-200/90 shadow-card space-y-2.5">
              <span className="text-xs font-mono font-black uppercase text-charcoal-500 block">
                3. Training Experience
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'beginner' as TrainingExperience, label: 'Beginner', sub: '0–1 years' },
                  { id: 'intermediate' as TrainingExperience, label: 'Intermediate', sub: '1–3 years' },
                  { id: 'advanced' as TrainingExperience, label: 'Advanced', sub: '3+ years' }
                ].map((exp) => (
                  <button
                    key={exp.id}
                    type="button"
                    onClick={() => setTrainingExperience(exp.id)}
                    className={`py-2 px-2 rounded-xl border text-center transition ${
                      trainingExperience === exp.id
                        ? 'bg-forest-900 text-white border-forest-900 font-black shadow-xs'
                        : 'bg-cream-50 text-charcoal-700 border-mint-200 hover:bg-mint-50'
                    }`}
                  >
                    <span className="text-xs font-black block">{exp.label}</span>
                    <span className={`text-[9px] block ${trainingExperience === exp.id ? 'text-mint-200' : 'text-charcoal-500'}`}>{exp.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Goal Card 4: Daily Time Commitment */}
            <div className="p-4 sm:p-5 rounded-[2rem] bg-white border border-mint-200/90 shadow-card space-y-2.5">
              <span className="text-xs font-mono font-black uppercase text-charcoal-500 block">
                4. Daily Routine Commitment
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: '2_min' as DailyTimeCommitment, label: '2 mins', sub: 'Micro-habits' },
                  { id: '5_min' as DailyTimeCommitment, label: '5 mins', sub: 'Core protocol' },
                  { id: '10_min' as DailyTimeCommitment, label: '10 mins', sub: 'Comprehensive' }
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setDailyTime(t.id)}
                    className={`py-2 px-2 rounded-xl border text-center transition ${
                      dailyTime === t.id
                        ? 'bg-forest-900 text-white border-forest-900 font-black shadow-xs'
                        : 'bg-cream-50 text-charcoal-700 border-mint-200 hover:bg-mint-50'
                    }`}
                  >
                    <span className="text-xs font-black block">{t.label}</span>
                    <span className={`text-[9px] block ${dailyTime === t.id ? 'text-mint-200' : 'text-charcoal-500'}`}>{t.sub}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: CUSTOM PLAN & DASHBOARD LAUNCH                                    */}
        {/* ========================================================================= */}
        {step === 3 && (
          <div className="space-y-5 pt-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-black uppercase tracking-widest text-forest-700 block">
                STEP 3 OF 3 • YOUR CUSTOM BLUEPRINT
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-forest-950 tracking-tight">
                Welcome to Ritual, {name || 'Alex'}!
              </h2>
              <p className="text-xs text-charcoal-600">
                Your personalized protocol is ready. We calibrated your macros, workout plan, and daily evidence-backed habits.
              </p>
            </div>

            {/* Athlete Passport Card */}
            <div className="p-5 sm:p-6 rounded-[2.5rem] bg-gradient-to-br from-forest-950 via-forest-900 to-forest-950 text-white shadow-xl space-y-4 border border-mint-700/30">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-mint-500/20 border border-mint-400/40 text-mint-300 flex items-center justify-center font-black text-lg">
                    {(name.trim() || 'Alex').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">{name || 'Alex Patel'}</h3>
                    <span className="text-xs text-mint-200 font-mono">{email || 'alex@ritual.health'}</span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-mint-500/20 text-mint-300 border border-mint-400/30 text-[10px] font-mono font-bold">
                  Active Member
                </span>
              </div>

              {/* 4 Key Calibrated Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] font-mono text-mint-300 uppercase block">BMI Score</span>
                  <span className="text-base font-black text-white font-mono">{metrics.bmi}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] font-mono text-mint-300 uppercase block">Daily Energy</span>
                  <span className="text-base font-black text-white font-mono">{metrics.maintenanceCalories} kcal</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] font-mono text-mint-300 uppercase block">Protein Goal</span>
                  <span className="text-base font-black text-white font-mono">{metrics.proteinG}g/day</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] font-mono text-mint-300 uppercase block">Routine Time</span>
                  <span className="text-base font-black text-white font-mono">{dailyTime.replace('_', ' ')}</span>
                </div>
              </div>
            </div>

            {/* 3 Core Calibrated Features */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-white border border-mint-200 text-center space-y-1 shadow-soft">
                <span className="text-xl block">🏋️</span>
                <span className="text-xs font-black text-forest-950 block">Workout Log</span>
                <p className="text-[10px] text-charcoal-500">Body mapping & sets</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-mint-200 text-center space-y-1 shadow-soft">
                <span className="text-xl block">🥗</span>
                <span className="text-xs font-black text-forest-950 block">Macro Tracker</span>
                <p className="text-[10px] text-charcoal-500">AI meal photo vision</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-mint-200 text-center space-y-1 shadow-soft">
                <span className="text-xl block">🌿</span>
                <span className="text-xs font-black text-forest-950 block">Daily Protocol</span>
                <p className="text-[10px] text-charcoal-500">Evidence-based habits</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Step Buttons */}
      <div className="pt-6 border-t border-mint-200/80 mt-6 flex items-center justify-between gap-3">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep(s => s - 1)}
            className="px-4 py-3 rounded-2xl bg-cream-50 hover:bg-mint-100 text-charcoal-700 font-bold text-xs sm:text-sm border border-mint-200 transition flex items-center gap-1.5 active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        ) : (
          <div />
        )}

        {step < 3 ? (
          <button
            type="button"
            onClick={() => setStep(s => s + 1)}
            className="px-6 py-3 rounded-2xl bg-forest-900 hover:bg-forest-800 text-white font-black text-xs sm:text-sm shadow-soft transition flex items-center gap-2 active:scale-95 ml-auto"
          >
            <span>Continue to {step === 1 ? 'Goals' : 'Your Plan'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleFinishOnboarding}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#FC5200] hover:bg-[#E04800] text-white font-black text-xs sm:text-sm shadow-lg shadow-[#FC5200]/25 transition flex items-center justify-center gap-2 active:scale-95 ml-auto"
          >
            <span>Launch My Dashboard ›</span>
            <Sparkles className="w-4 h-4" />
          </button>
        )}
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
