import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { WellnessGoal, DailyTimeCommitment } from '../../types';
import { Leaf, ArrowRight, Check, Sparkles, Clock, ShieldCheck } from 'lucide-react';

export const OnboardingFlow: React.FC = () => {
  const { completeOnboarding } = useApp();
  const [step, setStep] = useState<number>(1);
  const [name, setName] = useState<string>('');
  const [goal, setGoal] = useState<WellnessGoal>('hair_health');
  const [dailyTime, setDailyTime] = useState<DailyTimeCommitment>('5_min');
  const [ownsProducts, setOwnsProducts] = useState<boolean>(true);

  const totalSteps = 4;

  const handleFinish = () => {
    completeOnboarding({
      name: name.trim() || 'Friend',
      primaryGoal: goal,
      dailyTime,
      alreadyOwnsProducts: ownsProducts,
      isOnboarded: true
    });
  };

  const goalOptions: { id: WellnessGoal; title: string; desc: string; icon: string; tag: string }[] = [
    {
      id: 'hair_health',
      title: 'Improve hair health',
      desc: 'Understand hair actives (Redensyl, Minoxidil, Rosemary) and build steady scalp consistency.',
      icon: '🌿',
      tag: 'Hair & Scalp'
    },
    {
      id: 'body_care',
      title: 'Build a body-care routine',
      desc: 'Clarify body acne, smooth strawberry legs, and repair barrier lipids with BHAs & Ceramides.',
      icon: '💧',
      tag: 'Body & Skin'
    },
    {
      id: 'sleep_recovery',
      title: 'Sleep and recover better',
      desc: 'Evaluate adaptogens & nocturnal minerals (Ashwagandha, Magnesium, Melatonin) for deep rest.',
      icon: '🌙',
      tag: 'Sleep & Stress'
    }
  ];

  const timeOptions: { id: DailyTimeCommitment; title: string; desc: string; icon: React.FC<{ className?: string }> }[] = [
    {
      id: '2_min',
      title: '2 minutes / day',
      desc: 'Frictionless micro-habits. Perfect when your schedule is packed.',
      icon: Clock
    },
    {
      id: '5_min',
      title: '5 minutes / day',
      desc: 'The sweet spot. Balanced AM and PM rituals with real scientific momentum.',
      icon: Sparkles
    },
    {
      id: '10_min',
      title: '10 minutes / day',
      desc: 'Comprehensive multi-step routine including targeted massage and barrier care.',
      icon: ShieldCheck
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-charcoal-900 flex flex-col justify-between p-4 sm:p-8 max-w-lg mx-auto">
      {/* Top Brand Header */}
      <div>
        <div className="flex items-center justify-between pt-2 pb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-forest-900 flex items-center justify-center text-cream-50 shadow-sm">
              <Leaf className="w-4 h-4 text-mint-300" />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-forest-950">Ritual</span>
          </div>

          {step <= totalSteps && (
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    s === step
                      ? 'w-6 bg-forest-800'
                      : s < step
                      ? 'w-2.5 bg-mint-500'
                      : 'w-2.5 bg-cream-300'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Step 1: Welcome & Name */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-mint-600">
                Step 1 of 4 • Welcome
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-forest-950 leading-tight">
                Know what works. <br />
                <span className="text-forest-700">Build what sticks.</span>
              </h2>
              <p className="text-sm text-charcoal-600 leading-relaxed pt-1">
                Ritual is an evidence-first wellness companion. We decode wellness claims, organize what you already own, and turn products into sustainable daily routines.
              </p>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-2">
                What should we call you?
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your first name (e.g. Aarav, Ananya)"
                className="w-full px-4 py-3.5 rounded-2xl bg-white border border-cream-300 text-charcoal-900 text-base placeholder:text-charcoal-400 focus:outline-none focus:ring-2 focus:ring-forest-800 shadow-soft transition"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && name.trim()) setStep(2);
                }}
              />
            </div>

            <div className="p-4 rounded-2xl bg-mint-50 border border-mint-200 text-xs text-charcoal-700 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-forest-900">
                <ShieldCheck className="w-4 h-4 text-mint-600" />
                <span>Zero fluff, zero marketing bias</span>
              </div>
              <p className="text-charcoal-600">
                No sponsored rankings. No fake miracle scores. All ingredient analysis is grounded in peer-reviewed dermatology and clinical literature.
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Primary Goal */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-mint-600">
                Step 2 of 4 • Focus Area
              </span>
              <h2 className="text-2xl font-bold text-forest-950">
                What is your primary wellness goal, {name || 'friend'}?
              </h2>
              <p className="text-xs text-charcoal-500">
                You can adjust or expand your focus anytime in preferences.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {goalOptions.map((opt) => {
                const isSelected = goal === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setGoal(opt.id)}
                    type="button"
                    className={`w-full p-4 rounded-2xl border text-left transition-all duration-200 relative ${
                      isSelected
                        ? 'bg-forest-900 text-cream-50 border-forest-900 shadow-card ring-2 ring-forest-700'
                        : 'bg-white text-charcoal-800 border-cream-300 hover:border-mint-300 hover:bg-cream-50 shadow-soft'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl p-2 rounded-xl bg-cream-100/30 shrink-0">
                          {opt.icon}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className={`text-base font-bold ${isSelected ? 'text-cream-50' : 'text-forest-950'}`}>
                              {opt.title}
                            </h3>
                          </div>
                          <p className={`text-xs mt-1 leading-relaxed ${isSelected ? 'text-cream-200' : 'text-charcoal-600'}`}>
                            {opt.desc}
                          </p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-1 ${
                        isSelected ? 'bg-mint-400 border-mint-400 text-forest-950' : 'border-charcoal-300'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Daily Time Commitment */}
        {step === 3 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-mint-600">
                Step 3 of 4 • Daily Habit Pace
              </span>
              <h2 className="text-2xl font-bold text-forest-950">
                How much time can you spend daily?
              </h2>
              <p className="text-xs text-charcoal-500">
                Consistency beats intensity. Choose a pace you can genuinely stick to for 90 days.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {timeOptions.map((t) => {
                const isSelected = dailyTime === t.id;
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setDailyTime(t.id)}
                    type="button"
                    className={`w-full p-4 rounded-2xl border text-left transition-all duration-200 ${
                      isSelected
                        ? 'bg-forest-900 text-cream-50 border-forest-900 shadow-card ring-2 ring-forest-700'
                        : 'bg-white text-charcoal-800 border-cream-300 hover:border-mint-300 hover:bg-cream-50 shadow-soft'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className={`p-2.5 rounded-xl shrink-0 ${isSelected ? 'bg-forest-800 text-mint-300' : 'bg-cream-100 text-forest-800'}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className={`text-base font-bold ${isSelected ? 'text-cream-50' : 'text-forest-950'}`}>
                            {t.title}
                          </h3>
                          <p className={`text-xs mt-0.5 leading-relaxed ${isSelected ? 'text-cream-200' : 'text-charcoal-600'}`}>
                            {t.desc}
                          </p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-1 ${
                        isSelected ? 'bg-mint-400 border-mint-400 text-forest-950' : 'border-charcoal-300'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 4: Product Ownership */}
        {step === 4 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-mint-600">
                Step 4 of 4 • Your Current Setup
              </span>
              <h2 className="text-2xl font-bold text-forest-950">
                Do you already own wellness products?
              </h2>
              <p className="text-xs text-charcoal-500">
                Ritual is brand-neutral. We prioritize organizing products already in your cabinet.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={() => setOwnsProducts(true)}
                type="button"
                className={`w-full p-4 rounded-2xl border text-left transition-all duration-200 ${
                  ownsProducts
                    ? 'bg-forest-900 text-cream-50 border-forest-900 shadow-card ring-2 ring-forest-700'
                    : 'bg-white text-charcoal-800 border-cream-300 hover:border-mint-300 hover:bg-cream-50 shadow-soft'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className={`text-base font-bold ${ownsProducts ? 'text-cream-50' : 'text-forest-950'}`}>
                      Yes, I have bottles and tubs at home
                    </h3>
                    <p className={`text-xs mt-1 leading-relaxed ${ownsProducts ? 'text-cream-200' : 'text-charcoal-600'}`}>
                      You can photograph or scan ingredient labels with Label Lens to audit their clinical evidence and build a routine.
                    </p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-1 ${
                    ownsProducts ? 'bg-mint-400 border-mint-400 text-forest-950' : 'border-charcoal-300'
                  }`}>
                    {ownsProducts && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
              </button>

              <button
                onClick={() => setOwnsProducts(false)}
                type="button"
                className={`w-full p-4 rounded-2xl border text-left transition-all duration-200 ${
                  !ownsProducts
                    ? 'bg-forest-900 text-cream-50 border-forest-900 shadow-card ring-2 ring-forest-700'
                    : 'bg-white text-charcoal-800 border-cream-300 hover:border-mint-300 hover:bg-cream-50 shadow-soft'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className={`text-base font-bold ${!ownsProducts ? 'text-cream-50' : 'text-forest-950'}`}>
                      No, I'm starting from scratch
                    </h3>
                    <p className={`text-xs mt-1 leading-relaxed ${!ownsProducts ? 'text-cream-200' : 'text-charcoal-600'}`}>
                      We will start with foundational evidence-backed habits (hydration, scalp circulation, sleep hygiene) without requiring any purchase.
                    </p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-1 ${
                    !ownsProducts ? 'bg-mint-400 border-mint-400 text-forest-950' : 'border-charcoal-300'
                  }`}>
                    {!ownsProducts && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Personalized Welcome & Routine Preview */}
        {step === 5 && (
          <div className="space-y-6 text-center py-6 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-3xl bg-forest-900 text-mint-300 flex items-center justify-center mx-auto shadow-card">
              <Sparkles className="w-8 h-8 animate-pulse" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-mint-600">
                Routine Ready
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-forest-950">
                Welcome to Ritual, {name || 'Aarav'}!
              </h2>
              <p className="text-sm text-charcoal-600 max-w-xs mx-auto leading-relaxed">
                Your personalized {dailyTime.replace('_', ' ')} routine for{' '}
                <strong className="text-forest-900 font-semibold">
                  {goal === 'hair_health' ? 'Hair Health' : goal === 'body_care' ? 'Body Care' : 'Sleep & Recovery'}
                </strong>{' '}
                is ready.
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-cream-300 text-left shadow-soft space-y-2 text-xs">
              <div className="flex items-center justify-between text-charcoal-500 border-b border-cream-200 pb-2">
                <span>Daily Commitment:</span>
                <span className="font-semibold text-forest-900">{dailyTime.replace('_', ' ')}</span>
              </div>
              <div className="flex items-center justify-between text-charcoal-500 border-b border-cream-200 pb-2">
                <span>Hero Feature:</span>
                <span className="font-semibold text-forest-900">Label Lens (Scan & Audit)</span>
              </div>
              <div className="flex items-center justify-between text-charcoal-500">
                <span>Next Step:</span>
                <span className="font-semibold text-mint-600">Review Today's Checklist</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Button Navigation */}
      <div className="pt-6 pb-2">
        {step < 5 ? (
          <div className="flex items-center gap-3">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="py-3.5 px-5 rounded-2xl bg-cream-200 text-charcoal-700 font-semibold text-sm hover:bg-cream-300 transition"
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                if (step === 1 && !name.trim()) {
                  setName('Aarav');
                }
                if (step === 4) {
                  setStep(5);
                } else {
                  setStep((s) => s + 1);
                }
              }}
              className="flex-1 py-3.5 px-6 rounded-2xl bg-forest-900 hover:bg-forest-800 text-cream-50 font-bold text-sm shadow-card flex items-center justify-center gap-2 transition transform active:scale-98"
            >
              <span>{step === 4 ? 'Build My Routine' : 'Continue'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleFinish}
            className="w-full py-4 px-6 rounded-2xl bg-forest-900 hover:bg-forest-800 text-cream-50 font-bold text-base shadow-card flex items-center justify-center gap-2 transition transform active:scale-98"
          >
            <span>Enter Today View</span>
            <ArrowRight className="w-5 h-5 text-mint-300" />
          </button>
        )}
      </div>
    </div>
  );
};
