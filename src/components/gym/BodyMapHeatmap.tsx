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
  recoveryPercentage: number; // 0 to 100
  fatigueLevel: 'Fully Recovered' | 'Optimal' | 'Active Recovery' | 'Fatigued';
  lastTrained: string;
  topExercises: string[];
  physiologicalRole: string;
}

const BODY_PARTS_DATA: Record<string, BodyPartInfo> = {
  // Anterior (Front)
  chest: {
    id: 'chest',
    name: 'Pectoralis Major & Minor',
    muscleGroup: 'Chest',
    recoveryPercentage: 88,
    fatigueLevel: 'Optimal',
    lastTrained: 'Yesterday',
    topExercises: ['Barbell Bench Press', 'Incline Dumbbell Press', 'Cable Chest Flyes', 'Chest Dips'],
    physiologicalRole: 'Humeral adduction, internal rotation, and horizontal flexion of the shoulder joint.'
  },
  front_shoulders: {
    id: 'front_shoulders',
    name: 'Anterior & Lateral Deltoids',
    muscleGroup: 'Shoulders',
    recoveryPercentage: 92,
    fatigueLevel: 'Fully Recovered',
    lastTrained: '2 days ago',
    topExercises: ['Overhead Barbell Press', 'Dumbbell Lateral Raise', 'Cable Face Pulls'],
    physiologicalRole: 'Arm abduction in the frontal plane and humeral elevation.'
  },
  biceps: {
    id: 'biceps',
    name: 'Biceps Brachii & Brachialis',
    muscleGroup: 'Biceps',
    recoveryPercentage: 100,
    fatigueLevel: 'Fully Recovered',
    lastTrained: '3 days ago',
    topExercises: ['Incline Dumbbell Curl', 'Barbell Bicep Curl', 'Hammer Curls'],
    physiologicalRole: 'Forearm flexion, supination of the radioulnar joint.'
  },
  abs: {
    id: 'abs',
    name: 'Rectus Abdominis & Core',
    muscleGroup: 'Core',
    recoveryPercentage: 95,
    fatigueLevel: 'Fully Recovered',
    lastTrained: '3 days ago',
    topExercises: ['Hanging Leg Raise', 'Cable Woodchoppers', 'Ab Wheel Rollouts'],
    physiologicalRole: 'Spinal flexion, intra-abdominal pressure stabilization, kinetic force transfer.'
  },
  quads: {
    id: 'quads',
    name: 'Quadriceps Femoris',
    muscleGroup: 'Quads',
    recoveryPercentage: 45,
    fatigueLevel: 'Active Recovery',
    lastTrained: 'Today',
    topExercises: ['Barbell Back Squats', 'Leg Press', 'Bulgarian Split Squats', 'Leg Extensions'],
    physiologicalRole: 'Knee extension and hip flexion via rectus femoris.'
  },

  // Posterior (Back)
  upper_back: {
    id: 'upper_back',
    name: 'Trapezius & Rhomboids',
    muscleGroup: 'Back',
    recoveryPercentage: 85,
    fatigueLevel: 'Optimal',
    lastTrained: '2 days ago',
    topExercises: ['Barbell Rows', 'Face Pulls', 'Shrugs'],
    physiologicalRole: 'Scapular retraction, elevation, and upward humeral rotation.'
  },
  lats: {
    id: 'lats',
    name: 'Latissimus Dorsi',
    muscleGroup: 'Back',
    recoveryPercentage: 82,
    fatigueLevel: 'Optimal',
    lastTrained: '2 days ago',
    topExercises: ['Weighted Pull-Ups', 'Lat Pulldowns', 'Single-Arm Dumbbell Rows'],
    physiologicalRole: 'Shoulder extension, adduction, and horizontal abduction.'
  },
  rear_shoulders: {
    id: 'rear_shoulders',
    name: 'Posterior Deltoids',
    muscleGroup: 'Shoulders',
    recoveryPercentage: 94,
    fatigueLevel: 'Fully Recovered',
    lastTrained: '4 days ago',
    topExercises: ['Rear Delt Flyes', 'Face Pulls', 'Reverse Pec Deck'],
    physiologicalRole: 'Transverse humeral extension and external rotation.'
  },
  triceps: {
    id: 'triceps',
    name: 'Triceps Brachii (3 Heads)',
    muscleGroup: 'Triceps',
    recoveryPercentage: 90,
    fatigueLevel: 'Fully Recovered',
    lastTrained: 'Yesterday',
    topExercises: ['Cable Tricep Pushdowns', 'Skull Crushers', 'Close-Grip Bench Press'],
    physiologicalRole: 'Forearm extension at the elbow joint and humeral adduction.'
  },
  lower_back: {
    id: 'lower_back',
    name: 'Erector Spinae',
    muscleGroup: 'Back',
    recoveryPercentage: 70,
    fatigueLevel: 'Optimal',
    lastTrained: 'Yesterday',
    topExercises: ['Conventional Deadlifts', 'Back Extensions', 'Good Mornings'],
    physiologicalRole: 'Spinal extension, lateral flexion, and postural stabilization.'
  },
  glutes: {
    id: 'glutes',
    name: 'Gluteus Maximus & Medius',
    muscleGroup: 'Quads', // mapped to leg matrix
    recoveryPercentage: 50,
    fatigueLevel: 'Active Recovery',
    lastTrained: 'Today',
    topExercises: ['Barbell Hip Thrusts', 'Romanian Deadlifts', 'Cable Kickbacks'],
    physiologicalRole: 'Hip extension, external rotation, and pelvis stabilization.'
  },
  hamstrings: {
    id: 'hamstrings',
    name: 'Biceps Femoris & Semitendinosus',
    muscleGroup: 'Hamstrings',
    recoveryPercentage: 55,
    fatigueLevel: 'Active Recovery',
    lastTrained: 'Today',
    topExercises: ['Romanian Deadlifts', 'Seated Leg Curls', 'Nordic Curls'],
    physiologicalRole: 'Knee flexion, hip extension, and kinetic deceleration.'
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

  const matchingExercises = PRESET_EXERCISES.filter(
    e => e.muscleGroup === selectedMuscle.muscleGroup
  );

  const getRecoveryTheme = (pct: number) => {
    if (pct >= 80) return { fill: '#10B981', label: 'Prime Readiness', color: 'text-emerald-700', bg: 'bg-emerald-100 border-emerald-300' };
    if (pct >= 60) return { fill: '#34D399', label: 'Optimal Recovery', color: 'text-forest-800', bg: 'bg-mint-100 border-mint-300' };
    if (pct >= 40) return { fill: '#F59E0B', label: 'Active Adaptation', color: 'text-amber-800', bg: 'bg-amber-100 border-amber-300' };
    return { fill: '#E06447', label: 'High Post-Load Fatigue', color: 'text-coral-700', bg: 'bg-coral-100 border-coral-300' };
  };

  const theme = getRecoveryTheme(selectedMuscle.recoveryPercentage);

  return (
    <div className="rounded-3xl bg-white border border-mint-200/80 p-6 sm:p-8 shadow-card space-y-6 transition-all font-sans text-charcoal-900">
      {/* Formal Header & Perspective Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-mint-100 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-mint-100 text-forest-800 text-[10px] font-black uppercase tracking-wider font-mono border border-mint-200">
              PHYSIOLOGICAL RECOVERY INDEX
            </span>
            <span className="text-xs text-charcoal-500 font-semibold font-mono">
              Kinetic Muscle Mapping
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-forest-950 tracking-tight">
            Anatomical Muscle Readiness
          </h3>
        </div>

        {/* View Switcher: Front vs Back View */}
        <div className="inline-flex p-1 bg-cream-50 rounded-2xl border border-mint-200 text-xs">
          <button
            type="button"
            onClick={() => setViewAngle('front')}
            className={`px-4 py-2 rounded-xl font-black flex items-center gap-1.5 transition ${
              viewAngle === 'front'
                ? 'bg-forest-900 text-white shadow-soft'
                : 'text-charcoal-600 hover:text-forest-900'
            }`}
          >
            <Rotate3d className="w-3.5 h-3.5" />
            <span>Anterior View</span>
          </button>
          <button
            type="button"
            onClick={() => setViewAngle('back')}
            className={`px-4 py-2 rounded-xl font-black flex items-center gap-1.5 transition ${
              viewAngle === 'back'
                ? 'bg-forest-900 text-white shadow-soft'
                : 'text-charcoal-600 hover:text-forest-900'
            }`}
          >
            <Rotate3d className="w-3.5 h-3.5" />
            <span>Posterior View</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Medical Silhouette | Right Muscle Details & Prescription */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* ========================================================================= */}
        {/* LEFT: MINIMALIST ANATOMICAL SILHOUETTE (SVG)                             */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-3xl bg-cream-50/70 border border-mint-200/80 relative min-h-[440px]">
          
          {/* Recovery Legend Bar */}
          <div className="flex items-center gap-3 text-[11px] font-mono font-medium text-charcoal-600 mb-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Prime (80%+)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Recovering</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-coral-500" />
              <span>Fatigued</span>
            </span>
          </div>

          {/* SVG Silhouette */}
          <svg
            className="w-56 h-[380px] drop-shadow-md select-none transition-all"
            viewBox="0 0 200 400"
          >
            {/* Background Body Base */}
            <path
              d="M100 20 C90 20 82 28 82 40 C82 50 88 58 95 62 C80 68 62 85 55 105 C48 125 40 160 35 190 C32 205 38 215 45 210 C50 205 55 180 60 160 C62 180 62 210 65 240 C68 270 70 310 75 370 C77 385 85 385 88 370 C92 330 95 280 100 250 C105 280 108 330 112 370 C115 385 123 385 125 370 C130 310 132 270 135 240 C138 210 138 180 140 160 C145 180 150 205 155 210 C162 215 168 205 165 190 C160 160 152 125 145 105 C138 85 120 68 105 62 C112 58 118 50 118 40 C118 28 110 20 100 20 Z"
              fill="#E1EBE6"
              stroke="#C4D4CD"
              strokeWidth="2"
            />

            {/* ANTERIOR (FRONT) MUSCLES */}
            {viewAngle === 'front' && (
              <g className="cursor-pointer transition-all">
                {/* Deltoids */}
                <path
                  d="M60 85 C52 92 48 105 48 118 C56 118 64 105 68 95 Z"
                  fill={selectedMuscleKey === 'front_shoulders' ? '#254E37' : getRecoveryTheme(BODY_PARTS_DATA.front_shoulders.recoveryPercentage).fill}
                  opacity={selectedMuscleKey === 'front_shoulders' ? 1 : 0.85}
                  onClick={() => setSelectedMuscleKey('front_shoulders')}
                />
                <path
                  d="M140 85 C148 92 152 105 152 118 C144 118 136 105 132 95 Z"
                  fill={selectedMuscleKey === 'front_shoulders' ? '#254E37' : getRecoveryTheme(BODY_PARTS_DATA.front_shoulders.recoveryPercentage).fill}
                  opacity={selectedMuscleKey === 'front_shoulders' ? 1 : 0.85}
                  onClick={() => setSelectedMuscleKey('front_shoulders')}
                />

                {/* Pectoralis Major */}
                <path
                  d="M72 90 C85 92 98 96 98 120 C85 122 70 115 68 100 Z"
                  fill={selectedMuscleKey === 'chest' ? '#254E37' : getRecoveryTheme(BODY_PARTS_DATA.chest.recoveryPercentage).fill}
                  opacity={selectedMuscleKey === 'chest' ? 1 : 0.85}
                  stroke={selectedMuscleKey === 'chest' ? '#14291D' : '#9ECCB4'}
                  strokeWidth="1.5"
                  onClick={() => setSelectedMuscleKey('chest')}
                />
                <path
                  d="M128 90 C115 92 102 96 102 120 C115 122 130 115 132 100 Z"
                  fill={selectedMuscleKey === 'chest' ? '#254E37' : getRecoveryTheme(BODY_PARTS_DATA.chest.recoveryPercentage).fill}
                  opacity={selectedMuscleKey === 'chest' ? 1 : 0.85}
                  stroke={selectedMuscleKey === 'chest' ? '#14291D' : '#9ECCB4'}
                  strokeWidth="1.5"
                  onClick={() => setSelectedMuscleKey('chest')}
                />

                {/* Biceps */}
                <path
                  d="M48 122 C44 135 46 150 52 155 C54 145 56 130 54 122 Z"
                  fill={selectedMuscleKey === 'biceps' ? '#254E37' : getRecoveryTheme(BODY_PARTS_DATA.biceps.recoveryPercentage).fill}
                  opacity={selectedMuscleKey === 'biceps' ? 1 : 0.85}
                  onClick={() => setSelectedMuscleKey('biceps')}
                />
                <path
                  d="M152 122 C156 135 154 150 148 155 C146 145 144 130 146 122 Z"
                  fill={selectedMuscleKey === 'biceps' ? '#254E37' : getRecoveryTheme(BODY_PARTS_DATA.biceps.recoveryPercentage).fill}
                  opacity={selectedMuscleKey === 'biceps' ? 1 : 0.85}
                  onClick={() => setSelectedMuscleKey('biceps')}
                />

                {/* Abdominals (Rectus Abdominis) */}
                <path
                  d="M86 125 C94 125 106 125 114 125 C114 175 112 185 100 190 C88 185 86 175 86 125 Z"
                  fill={selectedMuscleKey === 'abs' ? '#254E37' : getRecoveryTheme(BODY_PARTS_DATA.abs.recoveryPercentage).fill}
                  opacity={selectedMuscleKey === 'abs' ? 1 : 0.85}
                  stroke={selectedMuscleKey === 'abs' ? '#14291D' : '#9ECCB4'}
                  strokeWidth="1.5"
                  onClick={() => setSelectedMuscleKey('abs')}
                />

                {/* Quadriceps */}
                <path
                  d="M68 205 C64 225 66 265 76 270 C86 265 88 225 84 205 Z"
                  fill={selectedMuscleKey === 'quads' ? '#254E37' : getRecoveryTheme(BODY_PARTS_DATA.quads.recoveryPercentage).fill}
                  opacity={selectedMuscleKey === 'quads' ? 1 : 0.85}
                  stroke={selectedMuscleKey === 'quads' ? '#14291D' : '#9ECCB4'}
                  strokeWidth="1.5"
                  onClick={() => setSelectedMuscleKey('quads')}
                />
                <path
                  d="M132 205 C136 225 134 265 124 270 C114 265 112 225 116 205 Z"
                  fill={selectedMuscleKey === 'quads' ? '#254E37' : getRecoveryTheme(BODY_PARTS_DATA.quads.recoveryPercentage).fill}
                  opacity={selectedMuscleKey === 'quads' ? 1 : 0.85}
                  stroke={selectedMuscleKey === 'quads' ? '#14291D' : '#9ECCB4'}
                  strokeWidth="1.5"
                  onClick={() => setSelectedMuscleKey('quads')}
                />
              </g>
            )}

            {/* POSTERIOR (BACK) MUSCLES */}
            {viewAngle === 'back' && (
              <g className="cursor-pointer transition-all">
                {/* Upper Back (Traps & Rhomboids) */}
                <path
                  d="M82 70 C92 78 108 78 118 70 C125 90 100 115 100 115 C100 115 75 90 82 70 Z"
                  fill={selectedMuscleKey === 'upper_back' ? '#254E37' : getRecoveryTheme(BODY_PARTS_DATA.upper_back.recoveryPercentage).fill}
                  opacity={selectedMuscleKey === 'upper_back' ? 1 : 0.85}
                  stroke={selectedMuscleKey === 'upper_back' ? '#14291D' : '#9ECCB4'}
                  strokeWidth="1.5"
                  onClick={() => setSelectedMuscleKey('upper_back')}
                />

                {/* Rear Deltoids */}
                <path
                  d="M60 85 C52 92 48 105 48 118 C56 118 64 105 68 95 Z"
                  fill={selectedMuscleKey === 'rear_shoulders' ? '#254E37' : getRecoveryTheme(BODY_PARTS_DATA.rear_shoulders.recoveryPercentage).fill}
                  opacity={selectedMuscleKey === 'rear_shoulders' ? 1 : 0.85}
                  onClick={() => setSelectedMuscleKey('rear_shoulders')}
                />
                <path
                  d="M140 85 C148 92 152 105 152 118 C144 118 136 105 132 95 Z"
                  fill={selectedMuscleKey === 'rear_shoulders' ? '#254E37' : getRecoveryTheme(BODY_PARTS_DATA.rear_shoulders.recoveryPercentage).fill}
                  opacity={selectedMuscleKey === 'rear_shoulders' ? 1 : 0.85}
                  onClick={() => setSelectedMuscleKey('rear_shoulders')}
                />

                {/* Latissimus Dorsi */}
                <path
                  d="M68 110 C80 115 95 120 95 160 C80 160 68 145 62 125 Z"
                  fill={selectedMuscleKey === 'lats' ? '#254E37' : getRecoveryTheme(BODY_PARTS_DATA.lats.recoveryPercentage).fill}
                  opacity={selectedMuscleKey === 'lats' ? 1 : 0.85}
                  stroke={selectedMuscleKey === 'lats' ? '#14291D' : '#9ECCB4'}
                  strokeWidth="1.5"
                  onClick={() => setSelectedMuscleKey('lats')}
                />
                <path
                  d="M132 110 C120 115 105 120 105 160 C120 160 132 145 138 125 Z"
                  fill={selectedMuscleKey === 'lats' ? '#254E37' : getRecoveryTheme(BODY_PARTS_DATA.lats.recoveryPercentage).fill}
                  opacity={selectedMuscleKey === 'lats' ? 1 : 0.85}
                  stroke={selectedMuscleKey === 'lats' ? '#14291D' : '#9ECCB4'}
                  strokeWidth="1.5"
                  onClick={() => setSelectedMuscleKey('lats')}
                />

                {/* Triceps */}
                <path
                  d="M48 122 C44 135 46 150 52 155 C54 145 56 130 54 122 Z"
                  fill={selectedMuscleKey === 'triceps' ? '#254E37' : getRecoveryTheme(BODY_PARTS_DATA.triceps.recoveryPercentage).fill}
                  opacity={selectedMuscleKey === 'triceps' ? 1 : 0.85}
                  onClick={() => setSelectedMuscleKey('triceps')}
                />
                <path
                  d="M152 122 C156 135 154 150 148 155 C146 145 144 130 146 122 Z"
                  fill={selectedMuscleKey === 'triceps' ? '#254E37' : getRecoveryTheme(BODY_PARTS_DATA.triceps.recoveryPercentage).fill}
                  opacity={selectedMuscleKey === 'triceps' ? 1 : 0.85}
                  onClick={() => setSelectedMuscleKey('triceps')}
                />

                {/* Lower Back (Erectors) */}
                <path
                  d="M88 155 C95 155 105 155 112 155 C112 195 100 195 100 195 C100 195 88 195 88 155 Z"
                  fill={selectedMuscleKey === 'lower_back' ? '#254E37' : getRecoveryTheme(BODY_PARTS_DATA.lower_back.recoveryPercentage).fill}
                  opacity={selectedMuscleKey === 'lower_back' ? 1 : 0.85}
                  stroke={selectedMuscleKey === 'lower_back' ? '#14291D' : '#9ECCB4'}
                  strokeWidth="1.5"
                  onClick={() => setSelectedMuscleKey('lower_back')}
                />

                {/* Glutes */}
                <path
                  d="M68 195 C82 195 98 195 98 225 C82 225 66 215 68 195 Z"
                  fill={selectedMuscleKey === 'glutes' ? '#254E37' : getRecoveryTheme(BODY_PARTS_DATA.glutes.recoveryPercentage).fill}
                  opacity={selectedMuscleKey === 'glutes' ? 1 : 0.85}
                  stroke={selectedMuscleKey === 'glutes' ? '#14291D' : '#9ECCB4'}
                  strokeWidth="1.5"
                  onClick={() => setSelectedMuscleKey('glutes')}
                />
                <path
                  d="M132 195 C118 195 102 195 102 225 C118 225 134 215 132 195 Z"
                  fill={selectedMuscleKey === 'glutes' ? '#254E37' : getRecoveryTheme(BODY_PARTS_DATA.glutes.recoveryPercentage).fill}
                  opacity={selectedMuscleKey === 'glutes' ? 1 : 0.85}
                  stroke={selectedMuscleKey === 'glutes' ? '#14291D' : '#9ECCB4'}
                  strokeWidth="1.5"
                  onClick={() => setSelectedMuscleKey('glutes')}
                />

                {/* Hamstrings */}
                <path
                  d="M70 215 C66 235 68 265 76 270 C84 265 86 235 84 215 Z"
                  fill={selectedMuscleKey === 'hamstrings' ? '#254E37' : getRecoveryTheme(BODY_PARTS_DATA.hamstrings.recoveryPercentage).fill}
                  opacity={selectedMuscleKey === 'hamstrings' ? 1 : 0.85}
                  stroke={selectedMuscleKey === 'hamstrings' ? '#14291D' : '#9ECCB4'}
                  strokeWidth="1.5"
                  onClick={() => setSelectedMuscleKey('hamstrings')}
                />
                <path
                  d="M130 215 C134 235 132 265 124 270 C116 265 114 235 116 215 Z"
                  fill={selectedMuscleKey === 'hamstrings' ? '#254E37' : getRecoveryTheme(BODY_PARTS_DATA.hamstrings.recoveryPercentage).fill}
                  opacity={selectedMuscleKey === 'hamstrings' ? 1 : 0.85}
                  stroke={selectedMuscleKey === 'hamstrings' ? '#14291D' : '#9ECCB4'}
                  strokeWidth="1.5"
                  onClick={() => setSelectedMuscleKey('hamstrings')}
                />
              </g>
            )}
          </svg>

          <span className="text-xs font-mono font-semibold text-charcoal-600 mt-3">
            Selected Region: <strong className="text-forest-950 font-bold">{selectedMuscle.name}</strong>
          </span>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT: CLINICAL READINESS & PRESCRIBED EXERCISE ARSENAL                  */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Recovery Diagnostic Card */}
          <div className="p-5 sm:p-6 rounded-3xl bg-cream-50/80 border border-mint-200 space-y-3.5 shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${theme.bg} ${theme.color} font-mono`}>
                  {selectedMuscle.fatigueLevel} • {selectedMuscle.recoveryPercentage}% Recovery Index
                </span>
                <h4 className="text-lg sm:text-xl font-black text-forest-950 mt-1.5">
                  {selectedMuscle.name}
                </h4>
                <p className="text-xs text-charcoal-600 mt-1 leading-relaxed">
                  {selectedMuscle.physiologicalRole}
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] uppercase font-mono font-bold text-charcoal-500 block">Last Stimulated</span>
                <span className="text-xs font-black text-forest-950 font-mono">{selectedMuscle.lastTrained}</span>
              </div>
            </div>

            {/* Recovery Gauge Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs font-mono font-medium">
                <span className="text-charcoal-600">Adaptive Cellular Recovery:</span>
                <span className="font-bold text-forest-950">{selectedMuscle.recoveryPercentage}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-cream-100 overflow-hidden border border-mint-200">
                <div 
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{ 
                    width: `${selectedMuscle.recoveryPercentage}%`,
                    backgroundColor: theme.fill
                  }}
                />
              </div>
            </div>

            {/* Launch Targeted Session */}
            {onStartMuscleWorkout && (
              <button
                type="button"
                onClick={() => onStartMuscleWorkout(selectedMuscle.muscleGroup)}
                className="w-full py-3 px-4 rounded-2xl bg-forest-900 hover:bg-forest-800 text-white font-black text-xs flex items-center justify-center gap-1.5 transition shadow-soft"
              >
                <Play className="w-3.5 h-3.5 fill-current text-white" />
                <span>Initialize {selectedMuscle.muscleGroup} Training Protocol</span>
              </button>
            )}
          </div>

          {/* Evidence-Based Exercise Movements */}
          <div className="space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-forest-900 flex items-center gap-1.5 font-mono">
              <Dumbbell className="w-3.5 h-3.5 text-forest-700" />
              <span>Prescribed Resistance Arsenal ({matchingExercises.length} Movements)</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[220px] overflow-y-auto pr-1">
              {matchingExercises.map((ex) => (
                <div
                  key={ex.id}
                  onClick={() => onSelectExercise && onSelectExercise(ex)}
                  className="p-3.5 rounded-2xl bg-white hover:bg-mint-50/40 border border-mint-200/80 hover:border-mint-400 transition cursor-pointer flex items-center justify-between group shadow-soft"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-black text-forest-950 block">{ex.name}</span>
                    <span className="text-[11px] text-charcoal-500 font-mono">
                      {ex.defaultSets} sets × {ex.defaultReps} reps • {ex.defaultWeightKg} kg
                    </span>
                  </div>
                  <div className="w-6 h-6 rounded-lg bg-mint-100 border border-mint-200 group-hover:bg-forest-900 group-hover:text-white flex items-center justify-center text-forest-800 transition">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
