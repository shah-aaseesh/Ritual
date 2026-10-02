import React, { useState } from 'react';
import { 
  Rotate3d, 
  Dumbbell, 
  Plus, 
  Play
} from 'lucide-react';
import { MuscleGroup } from '../../types';
import { PRESET_EXERCISES, ExerciseDefinition } from '../../data/gymData';

interface BodyPartInfo {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  recoveryPercentage: number; // 0 (fatigued/sore) to 100 (fully primed)
  fatigueLevel: 'Fresh' | 'Optimal' | 'Recovering' | 'High Fatigue';
  lastTrained: string;
  topExercises: string[];
  growthTier: string;
  xpValue: number;
}

const BODY_PARTS_DATA: Record<string, BodyPartInfo> = {
  // Front View
  chest: {
    id: 'chest',
    name: 'Pectoralis Major & Minor',
    muscleGroup: 'Chest',
    recoveryPercentage: 85,
    fatigueLevel: 'Optimal',
    lastTrained: 'Yesterday',
    topExercises: ['Barbell Bench Press', 'Incline Dumbbell Press', 'Cable Chest Flyes', 'Chest Dips'],
    growthTier: 'Tier 3 Hypertrophy',
    xpValue: 120
  },
  front_shoulders: {
    id: 'front_shoulders',
    name: 'Anterior & Lateral Deltoids',
    muscleGroup: 'Shoulders',
    recoveryPercentage: 90,
    fatigueLevel: 'Fresh',
    lastTrained: '2 days ago',
    topExercises: ['Overhead Barbell Press', 'Dumbbell Lateral Raise', 'Cable Face Pulls'],
    growthTier: 'Tier 2 Strength',
    xpValue: 110
  },
  biceps: {
    id: 'biceps',
    name: 'Biceps Brachii & Brachialis',
    muscleGroup: 'Biceps',
    recoveryPercentage: 100,
    fatigueLevel: 'Fresh',
    lastTrained: '3 days ago',
    topExercises: ['Incline Dumbbell Curl', 'Barbell Bicep Curl', 'Hammer Curls'],
    growthTier: 'Tier 1 Prime',
    xpValue: 90
  },
  abs: {
    id: 'abs',
    name: 'Rectus Abdominis & Obliques',
    muscleGroup: 'Core',
    recoveryPercentage: 95,
    fatigueLevel: 'Fresh',
    lastTrained: '3 days ago',
    topExercises: ['Hanging Leg Raises', 'Cable Woodchoppers', 'Ab Wheel Rollouts'],
    growthTier: 'Tier 2 Endurance',
    xpValue: 80
  },
  quads: {
    id: 'quads',
    name: 'Quadriceps (Vastus & Rectus Femoris)',
    muscleGroup: 'Quads',
    recoveryPercentage: 40,
    fatigueLevel: 'Recovering',
    lastTrained: 'Today',
    topExercises: ['Barbell Back Squat', '45° Leg Press', 'Walking Barbell Lunges'],
    growthTier: 'Tier 4 Power',
    xpValue: 160
  },
  calves_front: {
    id: 'calves_front',
    name: 'Tibialis Anterior & Calves',
    muscleGroup: 'Quads',
    recoveryPercentage: 90,
    fatigueLevel: 'Fresh',
    lastTrained: '2 days ago',
    topExercises: ['Standing Calf Raises', 'Tibialis Raises'],
    growthTier: 'Tier 1 Steady',
    xpValue: 60
  },

  // Back View
  traps_upper_back: {
    id: 'traps_upper_back',
    name: 'Trapezius & Rhomboids',
    muscleGroup: 'Back',
    recoveryPercentage: 75,
    fatigueLevel: 'Optimal',
    lastTrained: '2 days ago',
    topExercises: ['Barbell Shrugs', 'Face Pulls', 'Rack Pulls'],
    growthTier: 'Tier 3 Density',
    xpValue: 100
  },
  lats: {
    id: 'lats',
    name: 'Latissimus Dorsi',
    muscleGroup: 'Back',
    recoveryPercentage: 80,
    fatigueLevel: 'Optimal',
    lastTrained: '2 days ago',
    topExercises: ['Strict Pull-Ups', 'Lat Pulldown', 'Seated Cable Row'],
    growthTier: 'Tier 4 V-Taper',
    xpValue: 150
  },
  triceps: {
    id: 'triceps',
    name: 'Triceps Brachii (Long, Lateral & Medial Head)',
    muscleGroup: 'Triceps',
    recoveryPercentage: 88,
    fatigueLevel: 'Fresh',
    lastTrained: 'Yesterday',
    topExercises: ['Tricep Rope Pushdown', 'EZ-Bar Skull Crushers', 'Close-Grip Bench Press'],
    growthTier: 'Tier 2 Density',
    xpValue: 95
  },
  glutes: {
    id: 'glutes',
    name: 'Gluteus Maximus & Medius',
    muscleGroup: 'Hamstrings',
    recoveryPercentage: 35,
    fatigueLevel: 'High Fatigue',
    lastTrained: 'Today',
    topExercises: ['Barbell Hip Thrusts', 'Barbell Back Squat', 'Romanian Deadlift'],
    growthTier: 'Tier 4 Athletic',
    xpValue: 140
  },
  hamstrings: {
    id: 'hamstrings',
    name: 'Hamstrings (Biceps Femoris & Semitendinosus)',
    muscleGroup: 'Hamstrings',
    recoveryPercentage: 45,
    fatigueLevel: 'Recovering',
    lastTrained: 'Today',
    topExercises: ['Romanian Deadlift (RDL)', 'Lying Leg Curl', 'Glute-Ham Raise'],
    growthTier: 'Tier 3 Hinge',
    xpValue: 130
  }
};

interface BodyMapHeatmapProps {
  onSelectExercise?: (exercise: ExerciseDefinition) => void;
  onStartMuscleWorkout?: (muscleGroup: MuscleGroup) => void;
}

export const BodyMapHeatmap: React.FC<BodyMapHeatmapProps> = ({
  onSelectExercise,
  onStartMuscleWorkout
}) => {
  const [viewAngle, setViewAngle] = useState<'front' | 'back'>('front');
  const [selectedMuscleKey, setSelectedMuscleKey] = useState<string>('chest');

  const selectedMuscle = BODY_PARTS_DATA[selectedMuscleKey] || BODY_PARTS_DATA.chest;

  // Filter exercises relevant to selected muscle
  const matchingExercises = PRESET_EXERCISES.filter(
    e => e.muscleGroup === selectedMuscle.muscleGroup
  );

  // Recovery Color Helper
  const getRecoveryColor = (pct: number) => {
    if (pct >= 80) return { fill: '#10B981', glow: 'rgba(16, 185, 129, 0.4)', text: 'text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-300' };
    if (pct >= 60) return { fill: '#34D399', glow: 'rgba(52, 211, 153, 0.4)', text: 'text-mint-400', badge: 'bg-mint-500/20 text-mint-300' };
    if (pct >= 40) return { fill: '#F59E0B', glow: 'rgba(245, 158, 11, 0.4)', text: 'text-amber-400', badge: 'bg-amber-500/20 text-amber-300' };
    return { fill: '#EF4444', glow: 'rgba(239, 68, 68, 0.4)', text: 'text-rose-400', badge: 'bg-rose-500/20 text-rose-300' };
  };

  return (
    <div className="rounded-3xl bg-forest-950 text-cream-50 border border-emerald-500/30 p-5 sm:p-7 shadow-card space-y-6 relative overflow-hidden">
      {/* Background Neon Grid Ambience */}
      <div className="absolute inset-0 bg-radial from-emerald-500/10 via-transparent to-transparent pointer-events-none" />

      {/* Header & Angle Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[10px] font-black uppercase text-mint-300 font-mono tracking-widest">
              BIOMECHANICAL RECOVERY RADAR
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-cream-300 font-mono font-bold">
              TAP MUSCLE ZONE
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
            Interactive Anatomical Body Map
          </h3>
        </div>

        {/* View Switcher: Front vs Back View */}
        <div className="inline-flex p-1 bg-black/50 rounded-2xl border border-white/10 text-xs">
          <button
            type="button"
            onClick={() => setViewAngle('front')}
            className={`px-4 py-2 rounded-xl font-black flex items-center gap-1.5 transition ${
              viewAngle === 'front'
                ? 'bg-gradient-to-r from-emerald-500 to-mint-400 text-forest-950 shadow-sm scale-105'
                : 'text-cream-300 hover:text-white'
            }`}
          >
            <Rotate3d className="w-3.5 h-3.5" />
            <span>Anterior (Front)</span>
          </button>
          <button
            type="button"
            onClick={() => setViewAngle('back')}
            className={`px-4 py-2 rounded-xl font-black flex items-center gap-1.5 transition ${
              viewAngle === 'back'
                ? 'bg-gradient-to-r from-emerald-500 to-mint-400 text-forest-950 shadow-sm scale-105'
                : 'text-cream-300 hover:text-white'
            }`}
          >
            <Rotate3d className="w-3.5 h-3.5" />
            <span>Posterior (Back)</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Interactive SVG Silhouette | Right Muscle Details & Quests */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
        
        {/* ========================================================================= */}
        {/* LEFT: INTERACTIVE ANATOMICAL BODY MAP (SVG)                              */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 rounded-3xl bg-black/40 border border-white/10 relative min-h-[420px]">
          
          {/* Recovery Legend Bar */}
          <div className="flex items-center gap-3 text-[10px] font-mono font-bold text-cream-300 mb-3">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span>Prime (80%+)</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span>Recovering</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Fatigued</span>
            </span>
          </div>

          {/* SVG Silhouette */}
          <svg
            className="w-56 h-[380px] drop-shadow-2xl transition-all duration-500 select-none"
            viewBox="0 0 200 400"
          >
            {/* Background Human Outline Silhouette */}
            <path
              d="M100 20 C90 20 82 28 82 40 C82 50 88 58 95 62 C80 68 62 85 55 105 C48 125 40 160 35 190 C32 205 38 215 45 210 C50 205 55 180 60 160 C62 180 62 210 65 240 C68 270 70 310 75 370 C77 385 85 385 88 370 C92 330 95 280 100 250 C105 280 108 330 112 370 C115 385 123 385 125 370 C130 310 132 270 135 240 C138 210 138 180 140 160 C145 180 150 205 155 210 C162 215 168 205 165 190 C160 160 152 125 145 105 C138 85 120 68 105 62 C112 58 118 50 118 40 C118 28 110 20 100 20 Z"
              fill="#0F1F17"
              stroke="rgba(52, 211, 153, 0.2)"
              strokeWidth="2"
            />

            {/* FRONT VIEW ANATOMY */}
            {viewAngle === 'front' && (
              <g className="cursor-pointer transition-all">
                {/* 1. Shoulders / Deltoids (Left & Right) */}
                <path
                  d="M60 85 C52 92 48 105 48 118 C56 118 64 105 68 95 Z"
                  fill={selectedMuscleKey === 'front_shoulders' ? '#34D399' : getRecoveryColor(BODY_PARTS_DATA.front_shoulders.recoveryPercentage).fill}
                  opacity={selectedMuscleKey === 'front_shoulders' ? 0.95 : 0.75}
                  onClick={() => setSelectedMuscleKey('front_shoulders')}
                  className="hover:opacity-100 transition duration-150"
                />
                <path
                  d="M140 85 C148 92 152 105 152 118 C144 118 136 105 132 95 Z"
                  fill={selectedMuscleKey === 'front_shoulders' ? '#34D399' : getRecoveryColor(BODY_PARTS_DATA.front_shoulders.recoveryPercentage).fill}
                  opacity={selectedMuscleKey === 'front_shoulders' ? 0.95 : 0.75}
                  onClick={() => setSelectedMuscleKey('front_shoulders')}
                  className="hover:opacity-100 transition duration-150"
                />

                {/* 2. Chest (Pectorals) */}
                <path
                  d="M72 90 C85 88 98 90 98 120 C85 122 72 115 68 102 Z"
                  fill={selectedMuscleKey === 'chest' ? '#34D399' : getRecoveryColor(BODY_PARTS_DATA.chest.recoveryPercentage).fill}
                  opacity={selectedMuscleKey === 'chest' ? 1 : 0.8}
                  stroke={selectedMuscleKey === 'chest' ? '#FFFFFF' : 'none'}
                  strokeWidth="1.5"
                  onClick={() => setSelectedMuscleKey('chest')}
                  className="hover:opacity-100 transition duration-150"
                />
                <path
                  d="M128 90 C115 88 102 90 102 120 C115 122 128 115 132 102 Z"
                  fill={selectedMuscleKey === 'chest' ? '#34D399' : getRecoveryColor(BODY_PARTS_DATA.chest.recoveryPercentage).fill}
                  opacity={selectedMuscleKey === 'chest' ? 1 : 0.8}
                  stroke={selectedMuscleKey === 'chest' ? '#FFFFFF' : 'none'}
                  strokeWidth="1.5"
                  onClick={() => setSelectedMuscleKey('chest')}
                  className="hover:opacity-100 transition duration-150"
                />

                {/* 3. Biceps */}
                <path
                  d="M46 122 C42 135 44 150 50 155 C54 150 56 135 52 122 Z"
                  fill={selectedMuscleKey === 'biceps' ? '#34D399' : getRecoveryColor(BODY_PARTS_DATA.biceps.recoveryPercentage).fill}
                  opacity={selectedMuscleKey === 'biceps' ? 1 : 0.75}
                  onClick={() => setSelectedMuscleKey('biceps')}
                  className="hover:opacity-100 transition duration-150"
                />
                <path
                  d="M154 122 C158 135 156 150 150 155 C146 150 144 135 148 122 Z"
                  fill={selectedMuscleKey === 'biceps' ? '#34D399' : getRecoveryColor(BODY_PARTS_DATA.biceps.recoveryPercentage).fill}
                  opacity={selectedMuscleKey === 'biceps' ? 1 : 0.75}
                  onClick={() => setSelectedMuscleKey('biceps')}
                  className="hover:opacity-100 transition duration-150"
                />

                {/* 4. Core & Abs */}
                <rect
                  x="82"
                  y="126"
                  width="36"
                  height="50"
                  rx="6"
                  fill={selectedMuscleKey === 'abs' ? '#34D399' : getRecoveryColor(BODY_PARTS_DATA.abs.recoveryPercentage).fill}
                  opacity={selectedMuscleKey === 'abs' ? 1 : 0.75}
                  stroke={selectedMuscleKey === 'abs' ? '#FFFFFF' : 'none'}
                  strokeWidth="1.5"
                  onClick={() => setSelectedMuscleKey('abs')}
                  className="hover:opacity-100 transition duration-150"
                />

                {/* 5. Quads (Left & Right Leg) */}
                <path
                  d="M68 190 C62 215 65 260 76 270 C84 265 88 220 86 190 Z"
                  fill={selectedMuscleKey === 'quads' ? '#34D399' : getRecoveryColor(BODY_PARTS_DATA.quads.recoveryPercentage).fill}
                  opacity={selectedMuscleKey === 'quads' ? 1 : 0.8}
                  stroke={selectedMuscleKey === 'quads' ? '#FFFFFF' : 'none'}
                  strokeWidth="1.5"
                  onClick={() => setSelectedMuscleKey('quads')}
                  className="hover:opacity-100 transition duration-150"
                />
                <path
                  d="M132 190 C138 215 135 260 124 270 C116 265 112 220 114 190 Z"
                  fill={selectedMuscleKey === 'quads' ? '#34D399' : getRecoveryColor(BODY_PARTS_DATA.quads.recoveryPercentage).fill}
                  opacity={selectedMuscleKey === 'quads' ? 1 : 0.8}
                  stroke={selectedMuscleKey === 'quads' ? '#FFFFFF' : 'none'}
                  strokeWidth="1.5"
                  onClick={() => setSelectedMuscleKey('quads')}
                  className="hover:opacity-100 transition duration-150"
                />

                {/* 6. Calves */}
                <path
                  d="M74 285 C70 310 74 345 80 355 C84 345 86 310 82 285 Z"
                  fill={selectedMuscleKey === 'calves_front' ? '#34D399' : getRecoveryColor(BODY_PARTS_DATA.calves_front.recoveryPercentage).fill}
                  opacity={selectedMuscleKey === 'calves_front' ? 1 : 0.75}
                  onClick={() => setSelectedMuscleKey('calves_front')}
                  className="hover:opacity-100 transition duration-150"
                />
                <path
                  d="M126 285 C130 310 126 345 120 355 C116 345 114 310 118 285 Z"
                  fill={selectedMuscleKey === 'calves_front' ? '#34D399' : getRecoveryColor(BODY_PARTS_DATA.calves_front.recoveryPercentage).fill}
                  opacity={selectedMuscleKey === 'calves_front' ? 1 : 0.75}
                  onClick={() => setSelectedMuscleKey('calves_front')}
                  className="hover:opacity-100 transition duration-150"
                />
              </g>
            )}

            {/* BACK VIEW ANATOMY */}
            {viewAngle === 'back' && (
              <g className="cursor-pointer transition-all">
                {/* 1. Traps & Upper Back */}
                <polygon
                  points="100,60 125,85 100,115 75,85"
                  fill={selectedMuscleKey === 'traps_upper_back' ? '#34D399' : getRecoveryColor(BODY_PARTS_DATA.traps_upper_back.recoveryPercentage).fill}
                  opacity={selectedMuscleKey === 'traps_upper_back' ? 1 : 0.8}
                  stroke={selectedMuscleKey === 'traps_upper_back' ? '#FFFFFF' : 'none'}
                  strokeWidth="1.5"
                  onClick={() => setSelectedMuscleKey('traps_upper_back')}
                  className="hover:opacity-100 transition duration-150"
                />

                {/* 2. Lats (V-Taper) */}
                <path
                  d="M68 95 C62 120 70 150 82 158 C84 140 82 110 75 95 Z"
                  fill={selectedMuscleKey === 'lats' ? '#34D399' : getRecoveryColor(BODY_PARTS_DATA.lats.recoveryPercentage).fill}
                  opacity={selectedMuscleKey === 'lats' ? 1 : 0.8}
                  stroke={selectedMuscleKey === 'lats' ? '#FFFFFF' : 'none'}
                  strokeWidth="1.5"
                  onClick={() => setSelectedMuscleKey('lats')}
                  className="hover:opacity-100 transition duration-150"
                />
                <path
                  d="M132 95 C138 120 130 150 118 158 C116 140 118 110 125 95 Z"
                  fill={selectedMuscleKey === 'lats' ? '#34D399' : getRecoveryColor(BODY_PARTS_DATA.lats.recoveryPercentage).fill}
                  opacity={selectedMuscleKey === 'lats' ? 1 : 0.8}
                  stroke={selectedMuscleKey === 'lats' ? '#FFFFFF' : 'none'}
                  strokeWidth="1.5"
                  onClick={() => setSelectedMuscleKey('lats')}
                  className="hover:opacity-100 transition duration-150"
                />

                {/* 3. Triceps */}
                <path
                  d="M48 115 C44 130 46 145 52 150 C54 140 56 125 54 115 Z"
                  fill={selectedMuscleKey === 'triceps' ? '#34D399' : getRecoveryColor(BODY_PARTS_DATA.triceps.recoveryPercentage).fill}
                  opacity={selectedMuscleKey === 'triceps' ? 1 : 0.75}
                  onClick={() => setSelectedMuscleKey('triceps')}
                  className="hover:opacity-100 transition duration-150"
                />
                <path
                  d="M152 115 C156 130 154 145 148 150 C146 140 144 125 146 115 Z"
                  fill={selectedMuscleKey === 'triceps' ? '#34D399' : getRecoveryColor(BODY_PARTS_DATA.triceps.recoveryPercentage).fill}
                  opacity={selectedMuscleKey === 'triceps' ? 1 : 0.75}
                  onClick={() => setSelectedMuscleKey('triceps')}
                  className="hover:opacity-100 transition duration-150"
                />

                {/* 4. Glutes */}
                <ellipse
                  cx="85"
                  cy="195"
                  rx="15"
                  ry="18"
                  fill={selectedMuscleKey === 'glutes' ? '#34D399' : getRecoveryColor(BODY_PARTS_DATA.glutes.recoveryPercentage).fill}
                  opacity={selectedMuscleKey === 'glutes' ? 1 : 0.8}
                  stroke={selectedMuscleKey === 'glutes' ? '#FFFFFF' : 'none'}
                  strokeWidth="1.5"
                  onClick={() => setSelectedMuscleKey('glutes')}
                  className="hover:opacity-100 transition duration-150"
                />
                <ellipse
                  cx="115"
                  cy="195"
                  rx="15"
                  ry="18"
                  fill={selectedMuscleKey === 'glutes' ? '#34D399' : getRecoveryColor(BODY_PARTS_DATA.glutes.recoveryPercentage).fill}
                  opacity={selectedMuscleKey === 'glutes' ? 1 : 0.8}
                  stroke={selectedMuscleKey === 'glutes' ? '#FFFFFF' : 'none'}
                  strokeWidth="1.5"
                  onClick={() => setSelectedMuscleKey('glutes')}
                  className="hover:opacity-100 transition duration-150"
                />

                {/* 5. Hamstrings */}
                <path
                  d="M70 215 C66 235 68 265 76 270 C84 265 86 235 84 215 Z"
                  fill={selectedMuscleKey === 'hamstrings' ? '#34D399' : getRecoveryColor(BODY_PARTS_DATA.hamstrings.recoveryPercentage).fill}
                  opacity={selectedMuscleKey === 'hamstrings' ? 1 : 0.8}
                  stroke={selectedMuscleKey === 'hamstrings' ? '#FFFFFF' : 'none'}
                  strokeWidth="1.5"
                  onClick={() => setSelectedMuscleKey('hamstrings')}
                  className="hover:opacity-100 transition duration-150"
                />
                <path
                  d="M130 215 C134 235 132 265 124 270 C116 265 114 235 116 215 Z"
                  fill={selectedMuscleKey === 'hamstrings' ? '#34D399' : getRecoveryColor(BODY_PARTS_DATA.hamstrings.recoveryPercentage).fill}
                  opacity={selectedMuscleKey === 'hamstrings' ? 1 : 0.8}
                  stroke={selectedMuscleKey === 'hamstrings' ? '#FFFFFF' : 'none'}
                  strokeWidth="1.5"
                  onClick={() => setSelectedMuscleKey('hamstrings')}
                  className="hover:opacity-100 transition duration-150"
                />
              </g>
            )}
          </svg>

          <span className="text-[11px] font-mono text-cream-300 font-bold mt-2">
            Selected: <span className="text-emerald-400 font-black">{selectedMuscle.name}</span>
          </span>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT: SELECTED MUSCLE TELEMETRY & GAMIFIED ACTION CARD                   */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 space-y-4">
          {/* Muscle Readiness Card */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white/5 border border-white/10 space-y-3.5 backdrop-blur-xs">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${getRecoveryColor(selectedMuscle.recoveryPercentage).badge}`}>
                    {selectedMuscle.fatigueLevel} • {selectedMuscle.recoveryPercentage}% Ready
                  </span>
                  <span className="text-[10px] font-mono text-cream-400 font-bold">
                    Last Trained: {selectedMuscle.lastTrained}
                  </span>
                </div>
                <h4 className="text-lg sm:text-xl font-black text-white mt-1">
                  {selectedMuscle.name}
                </h4>
              </div>

              <div className="px-3 py-1.5 rounded-2xl bg-black/40 border border-emerald-500/30 text-right font-mono">
                <span className="text-[9px] text-cream-300 block uppercase">Reward</span>
                <span className="text-xs font-black text-emerald-400">+{selectedMuscle.xpValue} XP</span>
              </div>
            </div>

            {/* Recovery Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-cream-300">Biochemical Soreness Recovery:</span>
                <span className={`font-black ${getRecoveryColor(selectedMuscle.recoveryPercentage).text}`}>
                  {selectedMuscle.recoveryPercentage}% Recovered
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-black/50 overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{ 
                    width: `${selectedMuscle.recoveryPercentage}%`,
                    backgroundColor: getRecoveryColor(selectedMuscle.recoveryPercentage).fill
                  }}
                />
              </div>
            </div>

            {/* Quick Action to Trigger Muscle Workout */}
            {onStartMuscleWorkout && (
              <button
                type="button"
                onClick={() => onStartMuscleWorkout(selectedMuscle.muscleGroup)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-mint-400 hover:brightness-110 text-forest-950 font-black text-xs flex items-center justify-center gap-1.5 transition shadow-soft active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Launch {selectedMuscle.muscleGroup} Training Session (+{selectedMuscle.xpValue} XP)</span>
              </button>
            )}
          </div>

          {/* Recommended Movement Arsenal for this Muscle */}
          <div className="space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-mint-300 font-mono flex items-center gap-1.5">
              <Dumbbell className="w-3.5 h-3.5" />
              <span>Targeted Exercise Arsenal ({matchingExercises.length} movements)</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1">
              {matchingExercises.map((ex) => (
                <div
                  key={ex.id}
                  onClick={() => onSelectExercise && onSelectExercise(ex)}
                  className="p-3 rounded-2xl bg-black/30 hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-400/50 transition cursor-pointer flex items-center justify-between group"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-white group-hover:text-mint-300">{ex.name}</span>
                    </div>
                    <span className="text-[10px] text-cream-400 font-mono">
                      {ex.defaultSets} sets × {ex.defaultReps} reps • {ex.defaultWeightKg} kg
                    </span>
                  </div>
                  <Plus className="w-4 h-4 text-emerald-400 shrink-0 group-hover:scale-110 transition" />
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
