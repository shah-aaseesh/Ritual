import React, { useState } from 'react';
import { useApp, NavTab } from '../../context/AppContext';
import { WellnessGoal, DailyTimeCommitment } from '../../types';
import { 
  Settings, 
  Check, 
  X, 
  Leaf, 
  Sun, 
  ScanLine, 
  Layers, 
  CheckSquare, 
  TrendingUp,
  Dumbbell,
  Utensils
} from 'lucide-react';

export const Header: React.FC = () => {
  const { profile, updateProfile, regenerateRoutine, activeTab, setActiveTab, shelfProducts, activePillar, setActivePillar } = useApp();
  const [showSettings, setShowSettings] = useState(false);
  const [tempGoal, setTempGoal] = useState<WellnessGoal>(profile.primaryGoal);
  const [tempTime, setTempTime] = useState<DailyTimeCommitment>(profile.dailyTime);
  const [tempName, setTempName] = useState(profile.name);

  const goalLabels: Record<WellnessGoal, { label: string; icon: string }> = {
    hair_health: { label: 'Hair Health', icon: '🌿' },
    body_care: { label: 'Body Care', icon: '💧' },
    sleep_recovery: { label: 'Sleep & Recovery', icon: '🌙' }
  };

  const wellnessTabs: { id: NavTab; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { id: 'today', label: 'Daily Ritual', icon: Sun },
    { id: 'labellens', label: 'Label Lens', icon: ScanLine },
    { id: 'smartshelf', label: 'Smart Shelf', icon: Layers, badge: shelfProducts.length > 0 ? shelfProducts.length : undefined },
    { id: 'routine', label: 'Routine', icon: CheckSquare },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
  ];

  const healthTabs: { id: NavTab; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { id: 'gym', label: 'Gym & Strength', icon: Dumbbell },
    { id: 'calories', label: 'Calorie & Macro Hub', icon: Utensils },
    { id: 'progress', label: 'Longevity Progress', icon: TrendingUp },
  ];

  const currentTabs = activePillar === 'health' ? healthTabs : wellnessTabs;

  const handleSaveSettings = () => {
    updateProfile({
      name: tempName,
      primaryGoal: tempGoal,
      dailyTime: tempTime
    });
    if (tempGoal !== profile.primaryGoal) {
      regenerateRoutine(tempGoal);
    }
    setShowSettings(false);
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-cream-200/80 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center justify-between gap-3">
            <button 
              onClick={() => {
                setActivePillar('wellness');
                setActiveTab('today');
              }}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-forest-900 flex items-center justify-center text-cream-50 shadow-sm border border-forest-800 group-hover:scale-105 transition">
                <Leaf className="w-5 h-5 text-mint-300" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-lg font-bold tracking-tight text-forest-950 font-sans">
                    Ritual
                  </h1>
                  <span className="text-[10px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded bg-mint-100 text-forest-800 border border-mint-200">
                    Clinical Suite
                  </span>
                </div>
              </div>
            </button>

            {/* Category Pillar Switcher */}
            <div className="inline-flex p-1 bg-cream-200/90 rounded-2xl border border-cream-300 text-xs shadow-2xs">
              <button
                type="button"
                onClick={() => setActivePillar('wellness')}
                className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition ${
                  activePillar === 'wellness'
                    ? 'bg-forest-900 text-cream-50 shadow-sm'
                    : 'text-charcoal-700 hover:text-forest-950'
                }`}
              >
                <span>🌿 Wellness</span>
              </button>
              <button
                type="button"
                onClick={() => setActivePillar('health')}
                className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition ${
                  activePillar === 'health'
                    ? 'bg-forest-900 text-cream-50 shadow-sm'
                    : 'text-charcoal-700 hover:text-forest-950'
                }`}
              >
                <span>⚡ Health</span>
              </button>
            </div>
          </div>

          {/* Desktop Navigation Links based on active pillar */}
          <nav className="hidden md:flex items-center gap-1 bg-cream-100/80 p-1 rounded-2xl border border-cream-200">
            {currentTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const isHero = tab.id === 'labellens';

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-150 ${
                    isActive
                      ? isHero
                        ? 'bg-forest-900 text-mint-300 shadow-sm'
                        : 'bg-forest-900 text-cream-50 shadow-sm'
                      : 'text-charcoal-600 hover:text-forest-950 hover:bg-cream-200/70'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span className="px-1.5 py-0.2 rounded-full bg-forest-800 text-cream-50 text-[10px] font-mono">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action: Goal Chip & Profile Settings */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                setTempName(profile.name);
                setTempGoal(profile.primaryGoal);
                setTempTime(profile.dailyTime);
                setShowSettings(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-cream-100 border border-cream-300 text-xs font-medium text-forest-900 transition shadow-soft"
              aria-label="Profile Settings"
            >
              <span>{goalLabels[profile.primaryGoal]?.icon}</span>
              <span className="font-semibold">{goalLabels[profile.primaryGoal]?.label}</span>
              <span className="text-charcoal-400 hidden lg:inline">• {profile.dailyTime.replace('_', ' ')}</span>
              <Settings className="w-3.5 h-3.5 text-charcoal-400 ml-1" />
            </button>
          </div>
        </div>
      </header>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-cream-50 rounded-3xl max-w-sm w-full p-6 shadow-modal border border-cream-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-mint-100 flex items-center justify-center text-forest-800">
                  <Settings className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-forest-950">Profile & Preferences</h2>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1 rounded-full text-charcoal-400 hover:text-charcoal-700 hover:bg-cream-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-cream-300 focus:outline-none focus:ring-2 focus:ring-forest-700 text-charcoal-900"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  Primary Wellness Goal
                </label>
                <div className="grid grid-cols-1 gap-1.5">
                  {(['hair_health', 'body_care', 'sleep_recovery'] as WellnessGoal[]).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setTempGoal(g)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-left text-xs font-medium transition ${
                        tempGoal === g
                          ? 'bg-forest-900 text-cream-50 border-forest-900 shadow-sm'
                          : 'bg-white text-charcoal-800 border-cream-200 hover:bg-cream-100'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{goalLabels[g].icon}</span>
                        <span>{goalLabels[g].label}</span>
                      </span>
                      {tempGoal === g && <Check className="w-4 h-4 text-mint-300" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  Daily Time Commitment
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['2_min', '5_min', '10_min'] as DailyTimeCommitment[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTempTime(t)}
                      className={`py-2 px-2 rounded-xl border text-xs font-medium text-center transition ${
                        tempTime === t
                          ? 'bg-forest-900 text-cream-50 border-forest-900 shadow-sm'
                          : 'bg-white text-charcoal-700 border-cream-200 hover:bg-cream-100'
                      }`}
                    >
                      {t.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleSaveSettings}
                  className="w-full py-2.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-cream-50 font-semibold text-sm shadow-soft transition"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
