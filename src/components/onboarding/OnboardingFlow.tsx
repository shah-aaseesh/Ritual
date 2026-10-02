import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Leaf, 
  ArrowRight, 
  Bot, 
  ChevronRight, 
  Sparkles, 
  ShieldCheck,
  Activity,
  Flame,
  User,
  Mail,
  Scale,
  Ruler,
  Calendar,
  Utensils
} from 'lucide-react';

export const OnboardingFlow: React.FC = () => {
  const { completeOnboarding, aiSettings, updateAISettings, setActiveTab } = useApp();

  // Step 1: Account Creation & Bio-Metrics Intake
  // Step 2: Instant Calculated BMI & Maintenance Calories Blueprint
  // Step 3: Account Verification & Dashboard Launch
  const [step, setStep] = useState<number>(1);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState<number>(24);
  const [heightFeet, setHeightFeet] = useState<number>(5);
  const [heightInches, setHeightInches] = useState<number>(9);
  const [weightKg, setWeightKg] = useState<number>(70);

  const [showApiKeyModal, setShowApiKeyModal] = useState<boolean>(false);
  const [tempApiKey, setTempApiKey] = useState<string>(aiSettings.openRouterApiKey || '');
  const [tempModel, setTempModel] = useState<string>(aiSettings.selectedModel || 'google/gemini-3.1-flash-lite');

  // Bio-Metrics Calculation Engine
  const metrics = useMemo(() => {
    // Height in cm: 1 ft = 30.48 cm, 1 inch = 2.54 cm
    const totalInches = (heightFeet * 12) + heightInches;
    const heightCm = Math.round(totalInches * 2.54);
    const heightM = heightCm / 100;

    // BMI Formula: weight (kg) / (height (m))^2
    const rawBmi = heightM > 0 ? weightKg / (heightM * heightM) : 22.5;
    const bmi = parseFloat(rawBmi.toFixed(1));

    let bmiCategory = 'Healthy Normal Weight';
    let bmiColor = 'text-emerald-700 bg-emerald-50 border-emerald-300';
    let bmiProgressPercent = 50;

    if (bmi < 18.5) {
      bmiCategory = 'Underweight';
      bmiColor = 'text-sky-700 bg-sky-50 border-sky-300';
      bmiProgressPercent = Math.max(10, Math.round((bmi / 18.5) * 30));
    } else if (bmi <= 24.9) {
      bmiCategory = 'Healthy Normal Weight';
      bmiColor = 'text-emerald-700 bg-emerald-50 border-emerald-300';
      bmiProgressPercent = 30 + Math.round(((bmi - 18.5) / (24.9 - 18.5)) * 40);
    } else if (bmi <= 29.9) {
      bmiCategory = 'Overweight / High Muscle';
      bmiColor = 'text-amber-700 bg-amber-50 border-amber-300';
      bmiProgressPercent = 70 + Math.round(((bmi - 25) / (29.9 - 25)) * 20);
    } else {
      bmiCategory = 'Obesity Tier';
      bmiColor = 'text-rose-700 bg-rose-50 border-rose-300';
      bmiProgressPercent = 95;
    }

    // BMR via Mifflin-St Jeor Equation
    // Men: (10 × weight in kg) + (6.25 × height in cm) - (5 × age in yrs) + 5
    // Women: (10 × weight in kg) + (6.25 × height in cm) - (5 × age in yrs) - 161
    const genderOffset = gender === 'male' ? 5 : -161;
    const bmr = Math.round((10 * weightKg) + (6.25 * heightCm) - (5 * age) + genderOffset);

    // Maintenance Calories (TDEE with standard active multiplier 1.45 for workout routine)
    const maintenanceCalories = Math.round(bmr * 1.45);

    // Calibrated Daily Macros
    const proteinG = Math.round(weightKg * 2.0); // 2g per kg for optimal synthesis & muscle retention
    const fatG = Math.round((maintenanceCalories * 0.25) / 9); // 25% healthy fats
    const carbsG = Math.max(60, Math.round((maintenanceCalories - (proteinG * 4) - (fatG * 9)) / 4));

    return {
      heightCm,
      bmi,
      bmiCategory,
      bmiColor,
      bmiProgressPercent,
      bmr,
      maintenanceCalories,
      proteinG,
      carbsG,
      fatG
    };
  }, [gender, age, heightFeet, heightInches, weightKg]);

  const handleQuickSkip = () => {
    completeOnboarding({
      name: 'Athlete',
      email: 'user@ritual.health',
      age: 24,
      heightFeet: 5,
      heightInches: 10,
      weightKg: 72,
      gender: 'male',
      bmi: 22.8,
      bmiCategory: 'Healthy Normal Weight',
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
    // Save calibrated macros to localStorage for CalorieTracker
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
      name: name.trim() || 'Alex',
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
      primaryGoal: 'hair_health',
      healthGoal: 'hypertrophy_strength',
      trainingExperience: 'intermediate',
      dailyTime: '10_min',
      alreadyOwnsProducts: true,
      isOnboarded: true
    });
    setActiveTab('home');
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-charcoal-900 flex flex-col justify-between p-4 sm:p-8 max-w-2xl mx-auto selection:bg-[#44926C] selection:text-white">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between pb-5 border-b border-mint-200/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-forest-900 flex items-center justify-center text-white shadow-soft">
              <Leaf className="w-4 h-4 text-mint-300" />
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-forest-950">RITUAL</span>
              <span className="text-[10px] text-charcoal-500 font-semibold block -mt-0.5 tracking-wider uppercase font-mono">
                Account & Bio-Metrics Intake
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleQuickSkip}
              className="px-3.5 py-1.5 rounded-full bg-cream-50 hover:bg-mint-100 text-xs font-bold text-forest-900 border border-mint-200 transition active:scale-95"
            >
              <span>Quick Demo ›</span>
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

        {/* ========================================================================= */}
        {/* STEP 1: ACCOUNT DETAILS & BIO-METRIC INPUTS                               */}
        {/* ========================================================================= */}
        {step === 1 && (
          <div className="space-y-5 pt-5 animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div className="space-y-1.5">
              <span className="text-xs font-mono font-black uppercase tracking-widest text-forest-700">
                Step 1 of 3 • Bio-Metrics Intake
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-forest-950 tracking-tight">
                Create Account & Enter Baselines
              </h2>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                We use your height, weight, age, and email to calculate your exact BMI, BMR, and daily maintenance calories.
              </p>
            </div>

            {/* Form Fields Card */}
            <div className="p-5 sm:p-6 rounded-[2rem] bg-white border border-mint-200/90 shadow-card space-y-4">
              
              {/* Row 1: Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-mono uppercase text-charcoal-500 mb-1.5">
                    <User className="w-3.5 h-3.5 text-forest-800" />
                    <span>Your Full Name</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Sharma"
                    className="w-full px-4 py-3 rounded-xl bg-cream-50/70 border border-mint-200 text-charcoal-900 text-sm focus:outline-none focus:ring-2 focus:ring-mint-500 font-medium"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-mono uppercase text-charcoal-500 mb-1.5">
                    <Mail className="w-3.5 h-3.5 text-forest-800" />
                    <span>Email Address</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@example.com"
                    className="w-full px-4 py-3 rounded-xl bg-cream-50/70 border border-mint-200 text-charcoal-900 text-sm focus:outline-none focus:ring-2 focus:ring-mint-500 font-medium font-mono"
                  />
                </div>
              </div>

              {/* Row 2: Biological Sex & Age */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-mono uppercase text-charcoal-500 mb-1.5">
                    <Activity className="w-3.5 h-3.5 text-forest-800" />
                    <span>Biological Sex</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setGender('male')}
                      className={`py-2.5 rounded-xl border text-xs font-black transition flex items-center justify-center gap-1.5 ${
                        gender === 'male'
                          ? 'bg-forest-900 text-white border-forest-900 shadow-soft'
                          : 'bg-cream-50/70 text-charcoal-700 border-mint-200 hover:bg-mint-50'
                      }`}
                    >
                      <span>♂ Male</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender('female')}
                      className={`py-2.5 rounded-xl border text-xs font-black transition flex items-center justify-center gap-1.5 ${
                        gender === 'female'
                          ? 'bg-forest-900 text-white border-forest-900 shadow-soft'
                          : 'bg-cream-50/70 text-charcoal-700 border-mint-200 hover:bg-mint-50'
                      }`}
                    >
                      <span>♀ Female</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-mono uppercase text-charcoal-500 mb-1.5">
                    <Calendar className="w-3.5 h-3.5 text-forest-800" />
                    <span>Age (Years): <strong className="text-forest-950 font-black">{age}</strong></span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[18, 21, 24, 28, 32, 36].map((a) => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => setAge(a)}
                        className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition ${
                          age === a
                            ? 'bg-forest-900 text-white border-forest-900 shadow-soft font-black'
                            : 'bg-cream-50/70 text-charcoal-700 border-mint-200 hover:bg-mint-50'
                        }`}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 3: Height in Feet & Inches */}
              <div className="space-y-2 pt-1 border-t border-mint-100">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-xs font-mono uppercase text-charcoal-500">
                    <Ruler className="w-3.5 h-3.5 text-forest-800" />
                    <span>Height in Feet & Inches</span>
                  </label>
                  <span className="text-xs font-mono font-black text-forest-900">
                    {heightFeet}' {heightInches}" ({metrics.heightCm} cm)
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] font-mono text-charcoal-500 block mb-1">Feet (ft)</span>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[4, 5, 6, 7].map((ft) => (
                        <button
                          key={ft}
                          type="button"
                          onClick={() => setHeightFeet(ft)}
                          className={`py-2 rounded-xl border text-xs font-bold transition ${
                            heightFeet === ft
                              ? 'bg-forest-900 text-white border-forest-900 font-black'
                              : 'bg-cream-50 text-charcoal-700 border-mint-200 hover:bg-mint-50'
                          }`}
                        >
                          {ft} ft
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-mono text-charcoal-500 block mb-1">Inches (in)</span>
                    <div className="grid grid-cols-6 gap-1">
                      {[0, 2, 4, 6, 8, 10].map((inc) => (
                        <button
                          key={inc}
                          type="button"
                          onClick={() => setHeightInches(inc)}
                          className={`py-2 rounded-xl border text-xs font-bold transition ${
                            heightInches === inc
                              ? 'bg-forest-900 text-white border-forest-900 font-black'
                              : 'bg-cream-50 text-charcoal-700 border-mint-200 hover:bg-mint-50'
                          }`}
                        >
                          {inc}"
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 4: Body Weight in Kg */}
              <div className="space-y-2 pt-1 border-t border-mint-100">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-xs font-mono uppercase text-charcoal-500">
                    <Scale className="w-3.5 h-3.5 text-forest-800" />
                    <span>Body Weight in Kgs</span>
                  </label>
                  <span className="text-xs font-mono font-black text-forest-900">
                    {weightKg} kg ({(weightKg * 2.20462).toFixed(1)} lbs)
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
                    className="flex-1 accent-forest-900 h-2 bg-mint-100 rounded-lg cursor-pointer"
                  />
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setWeightKg(w => Math.max(40, w - 1))}
                      className="w-8 h-8 rounded-lg bg-cream-50 hover:bg-mint-100 border border-mint-200 font-black text-sm flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="w-12 text-center text-xs font-mono font-black text-forest-950">
                      {weightKg} kg
                    </span>
                    <button
                      type="button"
                      onClick={() => setWeightKg(w => Math.min(140, w + 1))}
                      className="w-8 h-8 rounded-lg bg-cream-50 hover:bg-mint-100 border border-mint-200 font-black text-sm flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Calculation Preview Strip */}
            <div className="p-4 rounded-2xl bg-mint-50/80 border border-mint-200/90 flex items-center justify-between gap-3 shadow-soft">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-forest-900 text-white flex items-center justify-center shrink-0">
                  <Flame className="w-4 h-4 text-mint-300" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-charcoal-500 font-bold block">
                    Live Calculation Preview
                  </span>
                  <span className="text-xs font-black text-forest-950">
                    BMI {metrics.bmi} • {metrics.maintenanceCalories} kcal/day Maintenance
                  </span>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border ${metrics.bmiColor}`}>
                {metrics.bmiCategory}
              </span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: METRICS BLUEPRINT & MAINTENANCE CALORIES                          */}
        {/* ========================================================================= */}
        {step === 2 && (
          <div className="space-y-5 pt-5 animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div className="space-y-1.5">
              <span className="text-xs font-mono font-black uppercase tracking-widest text-forest-700">
                Step 2 of 3 • Bio-Metabolic Blueprint
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-forest-950 tracking-tight">
                Your Calculated BMI & Maintenance Energy
              </h2>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                Calculated using the clinical Mifflin-St Jeor formula and WHO BMI benchmarks.
              </p>
            </div>

            {/* 2 Big Highlight Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Card 1: BMI */}
              <div className="p-5 rounded-[2rem] bg-white border border-mint-200 shadow-card space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-black uppercase text-charcoal-500 tracking-wider">
                    BODY MASS INDEX (BMI)
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${metrics.bmiColor}`}>
                    {metrics.bmiCategory}
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-forest-950 font-mono">
                    {metrics.bmi}
                  </span>
                  <span className="text-xs text-charcoal-500 font-mono">kg/m²</span>
                </div>

                {/* Visual Bar Scale */}
                <div className="space-y-1 pt-1">
                  <div className="w-full h-2.5 rounded-full bg-cream-100 overflow-hidden flex">
                    <div className="w-[18.5%] bg-sky-400" title="Underweight" />
                    <div className="w-[32%] bg-emerald-500" title="Normal" />
                    <div className="w-[25%] bg-amber-400" title="Overweight" />
                    <div className="w-[24.5%] bg-rose-500" title="Obese" />
                  </div>
                  <div className="flex justify-between text-[9px] font-mono text-charcoal-400">
                    <span>18.5</span>
                    <span>24.9</span>
                    <span>29.9</span>
                    <span>40+</span>
                  </div>
                </div>

                <p className="text-[11px] text-charcoal-600 leading-relaxed">
                  Based on height of <strong>{heightFeet}'{heightInches}"</strong> and body weight of <strong>{weightKg} kg</strong>.
                </p>
              </div>

              {/* Card 2: Maintenance Calories (TDEE) */}
              <div className="p-5 rounded-[2rem] bg-white border border-mint-200 shadow-card space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-black uppercase text-charcoal-500 tracking-wider">
                    DAILY MAINTENANCE (TDEE)
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-mint-100 text-forest-800 border border-mint-200 text-[10px] font-mono font-bold">
                    Active Multiplier
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-forest-950 font-mono">
                    {metrics.maintenanceCalories}
                  </span>
                  <span className="text-xs text-charcoal-500 font-mono">kcal/day</span>
                </div>

                <div className="flex items-center justify-between text-xs text-charcoal-600 font-mono pt-1">
                  <span>Basal BMR (At Rest):</span>
                  <strong className="text-forest-950">{metrics.bmr} kcal</strong>
                </div>

                <p className="text-[11px] text-charcoal-600 leading-relaxed">
                  Your baseline daily energy burn. Use this target in the Calorie Tracker for lean recomposition or maintenance.
                </p>
              </div>
            </div>

            {/* Calibrated Macro Split Target Breakdown */}
            <div className="p-5 rounded-[2rem] bg-white border border-mint-200 shadow-card space-y-3.5">
              <div className="flex items-center justify-between border-b border-mint-100 pb-2.5">
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-forest-950">
                  <Utensils className="w-4 h-4 text-forest-800" />
                  <span>Calibrated Daily Macro Split for {weightKg} kg Bodyweight</span>
                </div>
                <span className="text-[10px] font-mono text-charcoal-500 font-bold">2.0g Protein / kg</span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl bg-coral-50/70 border border-coral-200">
                  <span className="text-[10px] font-mono font-black uppercase text-coral-700 block">
                    Protein
                  </span>
                  <span className="text-lg font-black text-forest-950 font-mono">
                    {metrics.proteinG}g
                  </span>
                  <span className="text-[10px] text-charcoal-500 block">~{metrics.proteinG * 4} kcal</span>
                </div>

                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200">
                  <span className="text-[10px] font-mono font-black uppercase text-amber-700 block">
                    Carbohydrates
                  </span>
                  <span className="text-lg font-black text-forest-950 font-mono">
                    {metrics.carbsG}g
                  </span>
                  <span className="text-[10px] text-charcoal-500 block">~{metrics.carbsG * 4} kcal</span>
                </div>

                <div className="p-3 rounded-xl bg-teal-50/70 border border-teal-200">
                  <span className="text-[10px] font-mono font-black uppercase text-teal-700 block">
                    Fats
                  </span>
                  <span className="text-lg font-black text-forest-950 font-mono">
                    {metrics.fatG}g
                  </span>
                  <span className="text-[10px] text-charcoal-500 block">~{metrics.fatG * 9} kcal</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: ACCOUNT CREATED & VERIFIED LAUNCH                                 */}
        {/* ========================================================================= */}
        {step === 3 && (
          <div className="space-y-5 pt-5 animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div className="space-y-1.5">
              <span className="text-xs font-mono font-black uppercase tracking-widest text-forest-700">
                Step 3 of 3 • Account Verified
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-forest-950 tracking-tight">
                Welcome to Ritual, {name || 'Alex'}!
              </h2>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                Your profile has been created and your bio-metrics are synchronized across your Workout Log, Calorie Tracker, and Lab Vault.
              </p>
            </div>

            {/* Account ID Card */}
            <div className="p-6 rounded-[2.5rem] bg-gradient-to-br from-forest-950 to-forest-900 text-white shadow-xl space-y-4 relative overflow-hidden border border-mint-700/30">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-mint-500/20 border border-mint-400/40 text-mint-300 flex items-center justify-center font-black text-lg">
                    {(name.trim() || 'Alex').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">{name || 'Alex Sharma'}</h3>
                    <span className="text-xs text-mint-200 font-mono">{email || 'alex@example.com'}</span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-mint-500/20 text-mint-300 border border-mint-400/30 text-[10px] font-mono font-bold">
                  Active Account
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] font-mono text-mint-300 uppercase block">BMI Score</span>
                  <span className="text-base font-black text-white font-mono">{metrics.bmi}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] font-mono text-mint-300 uppercase block">Maintenance</span>
                  <span className="text-base font-black text-white font-mono">{metrics.maintenanceCalories} kcal</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] font-mono text-mint-300 uppercase block">Daily Protein</span>
                  <span className="text-base font-black text-white font-mono">{metrics.proteinG}g</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] font-mono text-mint-300 uppercase block">Height/Weight</span>
                  <span className="text-base font-black text-white font-mono">{weightKg}kg • {heightFeet}'{heightInches}"</span>
                </div>
              </div>
            </div>

            {/* Feature Access Highlights */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-2xl bg-white border border-mint-200 shadow-card flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-forest-800 shrink-0" />
                <div>
                  <span className="text-xs font-black text-forest-950 block">Workout Logger</span>
                  <span className="text-[10px] text-charcoal-500 block">3D Muscle Anatomy</span>
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-white border border-mint-200 shadow-card flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-forest-800 shrink-0" />
                <div>
                  <span className="text-xs font-black text-forest-950 block">AI Calorie Tracker</span>
                  <span className="text-[10px] text-charcoal-500 block">Photo Vision Scanner</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="pt-5 pb-2 border-t border-mint-200 mt-5">
        <div className="flex items-center gap-3">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(s => s - 1)}
              className="py-3.5 px-5 rounded-2xl bg-cream-50 text-charcoal-700 font-bold text-xs hover:bg-mint-100 border border-mint-200 transition active:scale-95"
            >
              Back
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => {
                if (step === 1 && !name.trim()) setName('Alex');
                if (step === 1 && !email.trim()) setEmail('alex@example.com');
                setStep(s => s + 1);
              }}
              className="flex-1 py-4 px-6 rounded-2xl bg-forest-900 hover:bg-forest-800 text-white font-black text-xs sm:text-sm shadow-soft flex items-center justify-center gap-2 transition active:scale-98"
            >
              <span>{step === 1 ? 'Calculate BMI & Maintenance Calories' : 'Verify Account & Continue'}</span>
              <ArrowRight className="w-4 h-4 text-mint-300" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinishOnboarding}
              className="flex-1 py-4 px-6 rounded-2xl bg-forest-900 hover:bg-forest-800 text-white font-black text-xs sm:text-sm shadow-soft flex items-center justify-center gap-2 transition active:scale-98"
            >
              <span>Launch Ritual Dashboard</span>
              <ChevronRight className="w-5 h-5 text-mint-300" />
            </button>
          )}
        </div>
      </div>

      {/* AI Settings Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-modal border border-mint-200 space-y-4 text-charcoal-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-forest-800" />
                <h3 className="text-base font-black text-forest-950">AI Model Provider</h3>
              </div>
              <button onClick={() => setShowApiKeyModal(false)} className="text-charcoal-400 hover:text-charcoal-700 font-bold">✕</button>
            </div>

            <p className="text-xs text-charcoal-600 leading-relaxed">
              Ritual runs completely free offline with its built-in clinical database. You can optionally connect OpenRouter or Gemini models for vision.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-mono uppercase text-charcoal-500 mb-1">OpenRouter API Key (Optional)</label>
                <input
                  type="password"
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  placeholder="sk-or-v1-..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-cream-50 border border-mint-200 text-charcoal-900 font-mono focus:outline-none focus:ring-2 focus:ring-mint-500"
                />
              </div>

              <div>
                <label className="block font-mono uppercase text-charcoal-500 mb-1">AI Model Engine</label>
                <input
                  type="text"
                  value={tempModel}
                  onChange={(e) => setTempModel(e.target.value)}
                  placeholder="google/gemini-3.1-flash-lite"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-cream-50 border border-mint-200 text-charcoal-900 font-mono focus:outline-none focus:ring-2 focus:ring-mint-500"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  updateAISettings({
                    openRouterApiKey: tempApiKey.trim(),
                    selectedModel: tempModel,
                    provider: tempApiKey.trim() ? 'openrouter' : 'local'
                  });
                  setShowApiKeyModal(false);
                }}
                className="w-full py-3 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-black text-xs shadow-soft transition"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
