import React, { useState } from 'react';
import { 
  Award, 
  CheckCircle2, 
  Target
} from 'lucide-react';

export interface ObjectiveItem {
  id: string;
  title: string;
  category: 'resistance' | 'nutrition' | 'evidence';
  targetScore: number;
  isCompleted: boolean;
  progressText: string;
  impactDescription: string;
}

export interface LongevityMilestone {
  id: string;
  title: string;
  description: string;
  category: string;
  isUnlocked: boolean;
  tier: 'Gold' | 'Platinum' | 'Silver' | 'Bronze';
  unlockedDate?: string;
}

export const GamificationHub: React.FC = () => {
  const [consistencyScore] = useState<number>(88);
  const [activeStreakDays] = useState<number>(14);

  const [objectives, setObjectives] = useState<ObjectiveItem[]>([
    { 
      id: 'o-1', 
      title: 'Prescribed Resistance Volume (12+ Sets)', 
      category: 'resistance', 
      targetScore: 25, 
      isCompleted: true, 
      progressText: '14 of 12 sets logged', 
      impactDescription: 'Sufficient mechanical tension for myofibrillar protein synthesis.' 
    },
    { 
      id: 'o-2', 
      title: 'Target Amino Acid & Protein Threshold (160g)', 
      category: 'nutrition', 
      targetScore: 25, 
      isCompleted: false, 
      progressText: '135g / 160g logged', 
      impactDescription: 'Provides 2.5g leucine per meal for optimal mTOR activation.' 
    },
    { 
      id: 'o-3', 
      title: 'Formulation Ingredient Audit via Label Lens', 
      category: 'evidence', 
      targetScore: 20, 
      isCompleted: true, 
      progressText: '1 product analyzed', 
      impactDescription: 'Eliminates unverified excipients and confirms active bioavailability.' 
    },
    { 
      id: 'o-4', 
      title: 'Euvolemic Hydration Target (3,000ml)', 
      category: 'nutrition', 
      targetScore: 18, 
      isCompleted: false, 
      progressText: '2,250ml / 3,000ml', 
      impactDescription: 'Maintains optimal blood volume and electrolyte balance.' 
    }
  ]);

  const milestones: LongevityMilestone[] = [
    { 
      id: 'm-1', 
      title: 'Unbroken Ritual Adherence', 
      description: 'Maintained 14-day consecutive active compliance across daily morning & evening steps.',
      category: 'Habit Consistency',
      isUnlocked: true,
      tier: 'Platinum',
      unlockedDate: 'Active Streak'
    },
    { 
      id: 'm-2', 
      title: '10-Tonne Progressive Overload', 
      description: 'Accumulated over 10,000 kg in mechanical tonnage across multi-joint compound movements.',
      category: 'Strength Adaptation',
      isUnlocked: true,
      tier: 'Gold',
      unlockedDate: '3 days ago'
    },
    { 
      id: 'm-3', 
      title: 'Clinical Formulation Literacy', 
      description: 'Decoded and debunked over 20 commercial packaging formulations with PubMed evidence.',
      category: 'Science & Health',
      isUnlocked: true,
      tier: 'Gold',
      unlockedDate: 'Yesterday'
    },
    { 
      id: 'm-4', 
      title: 'Precision Macro Adherence', 
      description: 'Hit target protein, carbohydrate, and fat ratios within a ±5% clinical variance for 7 days.',
      category: 'Nutritional Precision',
      isUnlocked: false,
      tier: 'Silver'
    }
  ];

  const toggleObjective = (id: string) => {
    setObjectives(prev => prev.map(obj => {
      if (obj.id === id) {
        return { ...obj, isCompleted: !obj.isCompleted };
      }
      return obj;
    }));
  };

  const completedCount = objectives.filter(o => o.isCompleted).length;
  const completionPercentage = Math.round((completedCount / objectives.length) * 100);

  return (
    <div className="rounded-3xl bg-[#121217] border border-white/10 p-6 sm:p-8 shadow-xl space-y-6 font-sans">
      {/* Formal Header: Consistency & Longevity Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-[#181822] text-[#FF3B30] text-[10px] font-black uppercase tracking-wider font-mono border border-white/10">
              LONGEVITY & ADHERENCE INDEX
            </span>
            <span className="text-xs text-zinc-400 font-semibold font-mono">
              Evidence-Based Performance
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Daily Biological Objectives & Milestones
          </h3>
        </div>

        {/* Consistency Stat Badges */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-2xl bg-[#09090D] border border-white/10 text-left">
            <span className="text-[10px] font-bold uppercase text-zinc-400 block font-mono">
              Habit Streak
            </span>
            <span className="text-sm font-black text-white flex items-center gap-1 font-mono">
              <span>{activeStreakDays} Consecutive Days</span>
            </span>
          </div>

          <div className="px-3.5 py-2 rounded-2xl bg-[#FF3B30] text-white text-left shadow-lg shadow-[#FF3B30]/20">
            <span className="text-[10px] font-bold uppercase text-white/80 block font-mono">
              Adherence Index
            </span>
            <span className="text-sm font-black text-white font-mono">
              {consistencyScore}% Prime
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Daily Objectives | Right Milestone Certifications */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Daily Objectives */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2 font-mono">
              <Target className="w-4 h-4 text-[#FF3B30]" />
              <span>Today's Evidence-Based Objectives</span>
            </h4>
            <span className="text-xs font-mono font-bold text-zinc-400">
              {completedCount} of {objectives.length} Complete ({completionPercentage}%)
            </span>
          </div>

          <div className="space-y-2.5">
            {objectives.map((obj) => (
              <div
                key={obj.id}
                onClick={() => toggleObjective(obj.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                  obj.isCompleted
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-white'
                    : 'bg-[#181822] border-white/10 hover:border-white/25 text-zinc-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    className={`mt-0.5 w-5 h-5 rounded-lg flex items-center justify-center transition shrink-0 ${
                      obj.isCompleted
                        ? 'bg-emerald-500 text-black'
                        : 'border border-white/20 bg-[#09090D] text-transparent hover:border-white/40'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                  </button>

                  <div className="space-y-0.5">
                    <span className={`text-xs font-black block ${obj.isCompleted ? 'text-emerald-300' : 'text-white'}`}>
                      {obj.title}
                    </span>
                    <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                      {obj.impactDescription}
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-mono font-bold text-zinc-300 shrink-0 bg-[#09090D] px-2.5 py-1 rounded-md border border-white/10">
                  {obj.progressText}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Longevity Milestones */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2 font-mono">
              <Award className="w-4 h-4 text-[#FF3B30]" />
              <span>Verified Longevity Milestones</span>
            </h4>
            <span className="text-xs font-mono font-bold text-zinc-400">
              3 Verified
            </span>
          </div>

          <div className="space-y-2.5">
            {milestones.map((m) => (
              <div
                key={m.id}
                className={`p-3.5 rounded-2xl border flex items-start justify-between gap-3 ${
                  m.isUnlocked
                    ? 'bg-[#181822] border-white/10 shadow-md'
                    : 'bg-[#09090D] border-dashed border-white/10 opacity-50'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-white">{m.title}</span>
                    <span className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-md ${
                      m.tier === 'Platinum' ? 'bg-white text-black' :
                      m.tier === 'Gold' ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' :
                      'bg-zinc-800 text-zinc-400'
                    }`}>
                      {m.tier} Tier
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-snug">
                    {m.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
