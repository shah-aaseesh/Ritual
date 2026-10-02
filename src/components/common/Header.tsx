import React, { useState } from 'react';
import { useApp, NavTab } from '../../context/AppContext';
import { WellnessGoal, HealthGoal, DailyTimeCommitment } from '../../types';
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
  const [tempHealthGoal, setTempHealthGoal] = useState<HealthGoal>(profile.healthGoal || 'hypertrophy_strength');
  const [tempTime, setTempTime] = useState<DailyTimeCommitment>(profile.dailyTime);
  const [tempName, setTempName] = useState(profile.name);

  const goalLabels: Record<WellnessGoal, { label: string; icon: string }> = {
    hair_health: { label: 'Hair Health', icon: '🌿' },
    body_care: { label: 'Body Care', icon: '💧' },
    sleep_recovery: { label: 'Sleep & Recovery', icon: '🌙' }
  };

  const healthGoalLabels: Record<HealthGoal, { label: string; icon: string }> = {
    hypertrophy_strength: { label: 'Hypertrophy & Strength', icon: '🏋️' },
    fat_loss_recomp: { label: 'Fat Loss & Recomp', icon: '⚡' },
    athletic_conditioning: { label: 'Athletic Conditioning', icon: '🏃' },
    longevity_health: { label: 'Metabolic Longevity', icon: '🧬' }
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
      healthGoal: tempHealthGoal,
      dailyTime: tempTime
    });
    if (tempGoal !== profile.primaryGoal) {
      regenerateRoutine(tempGoal);
    }
    setShowSettings(false);
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-[#0C0C10]/90 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center justify-between gap-3">
            <button 
              onClick={() => {
                if (activePillar === 'health') {
                  setActiveTab('gym');
                } else {
                  setActiveTab('today');
                }
              }}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="w-9 h-9 rounded-2xl bg-[#14141C] flex items-center justify-center text-white shadow-sm border border-white/10 group-hover:scale-105 group-hover:border-[#FF3B30]/40 transition">
                <Leaf className="w-4 h-4 text-[#FF3B30]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-lg font-black tracking-tight text-white font-sans">
                    Ritual
                  </h1>
                  <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-1.5 py-0.5 rounded-full bg-white/10 text-zinc-300 border border-white/10">
                    Clinical
                  </span>
                </div>
              </div>
            </button>

            {/* Category Pillar Switcher */}
            <div className="inline-flex p-1 bg-[#14141C] rounded-full border border-white/10 text-xs shadow-inner">
              <button
                type="button"
                onClick={() => {
                  setActivePillar('wellness');
                  if (activeTab === 'gym' || activeTab === 'calories') {
                    setActiveTab('today');
                  }
                }}
                className={`px-3.5 py-1.5 rounded-full font-bold flex items-center gap-1.5 transition ${
                  activePillar === 'wellness'
                    ? 'bg-white text-black shadow-md font-extrabold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span>🌿 Wellness</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActivePillar('health');
                  if (activeTab === 'today' || activeTab === 'smartshelf' || activeTab === 'routine') {
                    setActiveTab('gym');
                  }
                }}
                className={`px-3.5 py-1.5 rounded-full font-bold flex items-center gap-1.5 transition ${
                  activePillar === 'health'
                    ? 'bg-white text-black shadow-md font-extrabold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span>⚡ Health</span>
              </button>
            </div>
          </div>

          {/* Desktop Navigation Links based on active pillar */}
          <nav className="hidden md:flex items-center gap-1.5 bg-[#14141C] p-1 rounded-full border border-white/10">
            {currentTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all duration-150 ${
                    isActive
                      ? 'bg-white text-black shadow-md font-black'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span className="px-1.5 py-0.2 rounded-full bg-[#FF3B30] text-white text-[9px] font-mono">
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
                setTempHealthGoal(profile.healthGoal || 'hypertrophy_strength');
                setTempTime(profile.dailyTime);
                setShowSettings(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#14141C] hover:bg-[#1E1E28] border border-white/10 text-xs font-bold text-zinc-200 transition shadow-soft"
              aria-label="Profile Settings"
            >
              {activePillar === 'health' ? (
                <>
                  <span>{healthGoalLabels[profile.healthGoal || 'hypertrophy_strength']?.icon}</span>
                  <span className="font-bold text-white">{healthGoalLabels[profile.healthGoal || 'hypertrophy_strength']?.label}</span>
                </>
              ) : (
                <>
                  <span>{goalLabels[profile.primaryGoal]?.icon}</span>
                  <span className="font-bold text-white">{goalLabels[profile.primaryGoal]?.label}</span>
                </>
              )}
              <Settings className="w-3.5 h-3.5 text-zinc-400 ml-1" />
            </button>
          </div>
        </div>
      </header>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#121218] rounded-[2rem] max-w-sm w-full p-6 shadow-2xl border border-white/10 text-white">
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#1C1C26] flex items-center justify-center text-white border border-white/10">
                  <Settings className="w-4 h-4 text-[#FF3B30]" />
                </div>
                <h2 className="text-base font-black text-white">Profile & Calibration</h2>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 focus:outline-none focus:ring-1 focus:ring-[#FF3B30] text-white font-bold"
                  placeholder="Enter your name"
                />
              </div>

              {activePillar === 'health' ? (
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">
                    Athletic & Health Target
                  </label>
                  <div className="grid grid-cols-1 gap-1.5">
                    {(['hypertrophy_strength', 'fat_loss_recomp', 'athletic_conditioning', 'longevity_health'] as HealthGoal[]).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setTempHealthGoal(g)}
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-left text-xs font-bold transition ${
                          tempHealthGoal === g
                            ? 'bg-white text-black border-white shadow-md font-extrabold'
                            : 'bg-black/30 text-zinc-300 border-white/5 hover:bg-white/5'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{healthGoalLabels[g].icon}</span>
                          <span>{healthGoalLabels[g].label}</span>
                        </span>
                        {tempHealthGoal === g && <Check className="w-4 h-4 text-black stroke-[3]" />}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">
                    Primary Wellness Goal
                  </label>
                  <div className="grid grid-cols-1 gap-1.5">
                    {(['hair_health', 'body_care', 'sleep_recovery'] as WellnessGoal[]).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setTempGoal(g)}
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-left text-xs font-bold transition ${
                          tempGoal === g
                            ? 'bg-white text-black border-white shadow-md font-extrabold'
                            : 'bg-black/30 text-zinc-300 border-white/5 hover:bg-white/5'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{goalLabels[g].icon}</span>
                          <span>{goalLabels[g].label}</span>
                        </span>
                        {tempGoal === g && <Check className="w-4 h-4 text-black stroke-[3]" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">
                  Daily Time Commitment
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['2_min', '5_min', '10_min'] as DailyTimeCommitment[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTempTime(t)}
                      className={`py-2 px-2 rounded-xl border text-xs font-bold text-center transition ${
                        tempTime === t
                          ? 'bg-white text-black border-white shadow-md font-extrabold'
                          : 'bg-black/30 text-zinc-300 border-white/5 hover:bg-white/5'
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
                  className="w-full py-3 rounded-full bg-white text-black font-extrabold text-sm shadow-lg hover:bg-zinc-200 transition"
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
