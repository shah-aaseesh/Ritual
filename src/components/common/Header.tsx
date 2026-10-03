import React, { useState } from 'react';
import { useApp, NavTab } from '../../context/AppContext';
import { WellnessGoal, HealthGoal, DailyTimeCommitment, ShareCardData } from '../../types';
import { LayoutDashboard, Dumbbell, Utensils, ScanLine, FileText, Settings, Check, X, Download, Share2 } from 'lucide-react';
import { SocialShareModal } from './SocialShareModal';

export const Header: React.FC = () => {
  const { profile, updateProfile, activeTab, setActiveTab, healthDocuments, activePillar, routineSteps, progressHistory } = useApp();
  const [showSettings, setShowSettings] = useState(false);
  const [shareModalData, setShareModalData] = useState<ShareCardData | null>(null);
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

  const mainNavTabs: { id: NavTab; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { id: 'home', label: 'Home', icon: LayoutDashboard },
    { id: 'workout', label: 'Workout Log', icon: Dumbbell },
    { id: 'calories', label: 'Calorie Tracker', icon: Utensils },
    { id: 'mythbuster', label: 'Myth Buster', icon: ScanLine },
    { id: 'documents', label: 'Medical Docs & AI', icon: FileText, badge: healthDocuments.length > 0 ? healthDocuments.length : undefined },
  ];

  const handleSaveSettings = () => {
    updateProfile({
      name: tempName,
      primaryGoal: tempGoal,
      healthGoal: tempHealthGoal,
      dailyTime: tempTime
    });
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
            {/* Screenshot & Strava Share Button */}
            <button
              type="button"
              onClick={() => {
                const completedCount = routineSteps.filter(s => s.isCompletedToday).length;
                const totalSteps = routineSteps.length;
                const rate = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;
                const streak = progressHistory.filter(p => p.completionRate >= 0.75).length + (rate >= 75 ? 1 : 0);

                const data: ShareCardData = {
                  type: activePillar === 'health' ? 'workout' : 'protocol',
                  title: activePillar === 'health' ? 'Daily Workout & Training Stack' : 'Daily Wellness Protocol',
                  subtitle: `Tracked on Ritual • ${profile.name || 'Athlete'}`,
                  date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                  primaryStat: {
                    label: activePillar === 'health' ? 'PERFORMANCE SCORE' : 'DAILY ADHERENCE',
                    value: `${rate}%`,
                    unit: 'LOCKED'
                  },
                  secondaryStats: [
                    { label: 'STREAK', value: `${streak} Days`, highlight: true },
                    { label: 'HABITS DONE', value: `${completedCount}/${totalSteps}` },
                    { label: 'HEALTH PILLAR', value: activePillar.toUpperCase() }
                  ],
                  highlightItems: ['Habit Consistency', 'Clinical Formulations', 'Biomarker Tracking'],
                  badgeText: '⚡ RITUAL // PERFORMANCE LAB',
                  tagline: 'Evidence-Based Longevity & Fitness'
                };
                setShareModalData(data);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FC5200] hover:bg-[#E04800] text-xs font-black text-white transition active:scale-95 shadow-soft"
              title="Screenshot & Share Strava-Style Card"
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
                setTempName(profile.name);
                setTempGoal(profile.primaryGoal);
                setTempHealthGoal(profile.healthGoal || 'hypertrophy_strength');
                setTempTime(profile.dailyTime);
                setShowSettings(true);
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white hover:bg-mint-50 border border-mint-200/80 text-xs font-bold text-charcoal-800 transition shadow-soft"
              aria-label="Profile Settings"
              title="Profile & Settings"
            >
              <div className="w-5 h-5 rounded-full bg-forest-900 text-white flex items-center justify-center text-[10px] font-black">
                {(profile.name || 'A').charAt(0).toUpperCase()}
              </div>
              <span className="font-bold text-forest-900 max-w-[90px] truncate">
                {profile.name || 'Profile'}
              </span>
              <Settings className="w-3.5 h-3.5 text-charcoal-400" />
            </button>
          </div>
        </div>
      </header>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] max-w-sm w-full p-6 shadow-modal border border-mint-200 text-charcoal-900">
            <div className="flex items-center justify-between mb-4 border-b border-mint-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-mint-100 flex items-center justify-center text-forest-900 border border-mint-200">
                  <Settings className="w-4 h-4 text-forest-700" />
                </div>
                <h2 className="text-base font-black text-forest-950">Profile & Calibration</h2>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1 rounded-full text-charcoal-400 hover:text-charcoal-700 hover:bg-mint-50 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-cream-50 border border-mint-200 focus:outline-none focus:ring-2 focus:ring-mint-500 text-charcoal-900 font-bold"
                  placeholder="Enter your name"
                />
              </div>

              {activePillar === 'health' ? (
                <div>
                  <label className="block text-xs font-bold text-charcoal-700 mb-1">
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
                            ? 'bg-forest-900 text-white border-forest-900 shadow-soft font-extrabold'
                            : 'bg-cream-50 text-charcoal-700 border-mint-100 hover:bg-mint-50'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{healthGoalLabels[g].icon}</span>
                          <span>{healthGoalLabels[g].label}</span>
                        </span>
                        {tempHealthGoal === g && <Check className="w-4 h-4 text-white stroke-[3]" />}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-charcoal-700 mb-1">
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
                            ? 'bg-forest-900 text-white border-forest-900 shadow-soft font-extrabold'
                            : 'bg-cream-50 text-charcoal-700 border-mint-100 hover:bg-mint-50'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{goalLabels[g].icon}</span>
                          <span>{goalLabels[g].label}</span>
                        </span>
                        {tempGoal === g && <Check className="w-4 h-4 text-white stroke-[3]" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1">
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
                          ? 'bg-forest-900 text-white border-forest-900 shadow-soft font-extrabold'
                          : 'bg-cream-50 text-charcoal-700 border-mint-100 hover:bg-mint-50'
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
                  className="w-full py-3 rounded-full bg-forest-900 text-white font-extrabold text-sm shadow-soft hover:bg-forest-800 transition"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
