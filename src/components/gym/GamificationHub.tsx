import React, { useState } from 'react';
import { 
  Trophy, 
  Target, 
  Award, 
  CheckCircle2, 
  Star
} from 'lucide-react';

export interface QuestItem {
  id: string;
  title: string;
  category: 'gym' | 'nutrition' | 'wellness';
  xpReward: number;
  isCompleted: boolean;
  progressText: string;
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  unlockedDate?: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
}

export const GamificationHub: React.FC = () => {
  const [userLevel] = useState<number>(() => {
    const saved = localStorage.getItem('ritual_user_level');
    return saved ? parseInt(saved) : 14;
  });

  const [currentXp, setCurrentXp] = useState<number>(() => {
    const saved = localStorage.getItem('ritual_user_xp');
    return saved ? parseInt(saved) : 3450;
  });

  const nextLevelXp = userLevel * 350;

  const [quests, setQuests] = useState<QuestItem[]>([
    { id: 'q-1', title: 'Complete Today\'s Push Session (12+ Sets)', category: 'gym', xpReward: 250, isCompleted: true, progressText: '14 / 12 sets' },
    { id: 'q-2', title: 'Hit Daily Protein Target (160g)', category: 'nutrition', xpReward: 150, isCompleted: false, progressText: '135g / 160g' },
    { id: 'q-3', title: 'Scan & Debunk 1 Wellness Product with AI', category: 'wellness', xpReward: 120, isCompleted: true, progressText: '1 / 1 scanned' },
    { id: 'q-4', title: 'Maintain 3,000ml Cellular Hydration', category: 'nutrition', xpReward: 100, isCompleted: false, progressText: '2,250ml / 3,000ml' }
  ]);

  const badges: AchievementBadge[] = [
    { id: 'b-1', title: 'Iron Discipline', description: 'Log 10 complete workout sessions', icon: '🏋️', isUnlocked: true, unlockedDate: 'Yesterday', rarity: 'Rare' },
    { id: 'b-2', title: 'Century Lifter', description: 'Lift over 10,000 kg total volume in a week', icon: '⚡', isUnlocked: true, unlockedDate: '3 days ago', rarity: 'Epic' },
    { id: 'b-3', title: 'Formulation Debunker', description: 'Purge 15+ marketing fillers with Rx Scanner', icon: '🔬', isUnlocked: true, unlockedDate: 'Today', rarity: 'Rare' },
    { id: 'b-4', title: 'Anabolic Perfection', description: 'Hit all 3 macro targets within 5% accuracy', icon: '🥩', isUnlocked: false, rarity: 'Legendary' }
  ];

  const completeQuest = (id: string) => {
    setQuests(prev => prev.map(q => {
      if (q.id === id && !q.isCompleted) {
        const nextXp = currentXp + q.xpReward;
        setCurrentXp(nextXp);
        localStorage.setItem('ritual_user_xp', nextXp.toString());
        return { ...q, isCompleted: true };
      }
      return q;
    }));
  };

  const xpPercentage = Math.min(100, Math.round((currentXp / nextLevelXp) * 100));

  return (
    <div className="rounded-3xl bg-gradient-to-br from-forest-950 via-forest-900 to-forest-950 border border-emerald-500/30 p-5 sm:p-6 text-cream-50 shadow-card space-y-5 relative overflow-hidden">
      {/* Background Neon Shimmer */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/5 to-transparent animate-shimmer-sweep pointer-events-none" />

      {/* Level & XP HUD Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4 relative z-10">
        <div className="flex items-center gap-3.5">
          {/* Level Emblem */}
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-forest-950 flex flex-col items-center justify-center font-black shadow-lg ring-2 ring-amber-300">
            <Trophy className="w-4 h-4" />
            <span className="text-xs leading-none">LVL {userLevel}</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-black text-white">Strength & Science Athlete</span>
              <span className="text-[10px] font-black uppercase text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30 font-mono">
                TIER 3 WARRIOR
              </span>
            </div>
            <p className="text-xs text-cream-300 font-medium">
              {currentXp.toLocaleString()} XP earned • {Math.max(0, nextLevelXp - currentXp)} XP to Level {userLevel + 1}
            </p>
          </div>
        </div>

        {/* Level Progress Bar */}
        <div className="w-full sm:w-64 space-y-1">
          <div className="flex justify-between text-[10px] font-mono font-bold text-cream-300">
            <span>XP Progress</span>
            <span className="text-emerald-400">{xpPercentage}%</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-black/50 overflow-hidden border border-white/10">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 via-mint-400 to-amber-400 rounded-full transition-all duration-700" 
              style={{ width: `${xpPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quests & Badges Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 relative z-10">
        {/* Left: Daily Quests */}
        <div className="lg:col-span-7 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-mint-300 font-mono flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" />
              <span>Daily Health & Strength Quests</span>
            </span>
            <span className="text-[10px] font-mono text-cream-400">
              {quests.filter(q => q.isCompleted).length} / {quests.length} Done
            </span>
          </div>

          <div className="space-y-2">
            {quests.map((quest) => (
              <div
                key={quest.id}
                onClick={() => completeQuest(quest.id)}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                  quest.isCompleted
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-cream-100'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 text-cream-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                    quest.isCompleted ? 'bg-emerald-500 text-forest-950 font-bold' : 'bg-white/10 text-cream-400'
                  }`}>
                    {quest.isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Star className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <span className={`text-xs font-bold block ${quest.isCompleted ? 'line-through text-cream-400' : 'text-white'}`}>
                      {quest.title}
                    </span>
                    <span className="text-[10px] text-cream-400 font-mono">{quest.progressText}</span>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-black shrink-0">
                  +{quest.xpReward} XP
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Achievement Badges */}
        <div className="lg:col-span-5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-amber-300 font-mono flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              <span>Unlocked Milestones</span>
            </span>
            <span className="text-[10px] font-mono text-cream-400">3 / 4 Unlocked</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {badges.map((b) => (
              <div
                key={b.id}
                className={`p-3 rounded-2xl border flex flex-col justify-between space-y-1.5 ${
                  b.isUnlocked
                    ? 'bg-gradient-to-br from-white/10 to-white/5 border-amber-500/30 text-white shadow-xs'
                    : 'bg-black/30 border-white/5 text-cream-500 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl">{b.icon}</span>
                  <span className="text-[9px] font-mono font-black uppercase px-1.5 py-0.5 rounded bg-white/10 text-amber-300">
                    {b.rarity}
                  </span>
                </div>
                <div>
                  <span className="text-xs font-black block">{b.title}</span>
                  <p className="text-[10px] text-cream-300 line-clamp-1">{b.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
