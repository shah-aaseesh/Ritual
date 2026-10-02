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
    topExercises: ['Hanging Leg Raises', 'Cable Woodchoppers', 'Ab Wheel Rollouts'],
    physiologicalRole: 'Spinal flexion, intra-abdominal pressure stabilization, pelvic anterior tilt control.'
  },
  quads: {
    id: 'quads',
    name: 'Quadriceps Femoris',
    muscleGroup: 'Quads',
    recoveryPercentage: 45,
    fatigueLevel: 'Active Recovery',
    lastTrained: 'Today',
    topExercises: ['Barbell Back Squat', '45° Leg Press', 'Walking Barbell Lunges'],
    physiologicalRole: 'Knee extension and hip flexion via rectus femoris.'
  },
  calves_front: {
    id: 'calves_front',
    name: 'Tibialis & Gastrocnemius',
    muscleGroup: 'Quads',
    recoveryPercentage: 90,
    fatigueLevel: 'Fully Recovered',
    lastTrained: '2 days ago',
    topExercises: ['Standing Calf Raises', 'Tibialis Raises'],
    physiologicalRole: 'Ankle dorsiflexion and plantarflexion stability.'
  },

  // Posterior (Back)
  traps_upper_back: {
    id: 'traps_upper_back',
    name: 'Trapezius & Rhomboids',
    muscleGroup: 'Back',
    recoveryPercentage: 78,
    fatigueLevel: 'Optimal',
    lastTrained: '2 days ago',
    topExercises: ['Barbell Shrugs', 'Face Pulls', 'Rack Pulls'],
    physiologicalRole: 'Scapular retraction, elevation, and thoracic postural stability.'
  },
  lats: {
    id: 'lats',
    name: 'Latissimus Dorsi',
    muscleGroup: 'Back',
    recoveryPercentage: 82,
    fatigueLevel: 'Optimal',
    lastTrained: '2 days ago',
    topExercises: ['Strict Pull-Ups', 'Lat Pulldown', 'Seated Cable Row'],
    physiologicalRole: 'Shoulder extension, adduction, and horizontal abduction.'
  },
  triceps: {
    id: 'triceps',
    name: 'Triceps Brachii',
    muscleGroup: 'Triceps',
    recoveryPercentage: 85,
    fatigueLevel: 'Optimal',
    lastTrained: 'Yesterday',
    topExercises: ['Tricep Rope Pushdown', 'EZ-Bar Skull Crushers', 'Close-Grip Bench Press'],
    physiologicalRole: 'Elbow extension and long-head shoulder joint stabilization.'
  },
  glutes: {
    id: 'glutes',
    name: 'Gluteus Maximus & Medius',
    muscleGroup: 'Hamstrings',
    recoveryPercentage: 38,
    fatigueLevel: 'Fatigued',
    lastTrained: 'Today',
    topExercises: ['Barbell Hip Thrusts', 'Barbell Back Squat', 'Romanian Deadlift'],
    physiologicalRole: 'Primary hip extension, pelvic stabilization, and external rotation.'
  },
  hamstrings: {
    id: 'hamstrings',
    name: 'Hamstring Complex',
    muscleGroup: 'Hamstrings',
    recoveryPercentage: 50,
    fatigueLevel: 'Active Recovery',
    lastTrained: 'Today',
    topExercises: ['Romanian Deadlift (RDL)', 'Lying Leg Curl', 'Glute-Ham Raise'],
    physiologicalRole: 'Knee flexion and posterior kinetic chain hip extension.'
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
    if (pct >= 80) return { fill: '#10B981', label: 'Prime Readiness', color: 'text-emerald-800', bg: 'bg-emerald-50 border-emerald-200' };
    if (pct >= 60) return { fill: '#34D399', label: 'Optimal Recovery', color: 'text-forest-800', bg: 'bg-mint-50 border-mint-200' };
    if (pct >= 40) return { fill: '#F59E0B', label: 'Active Adaptation', color: 'text-amber-800', bg: 'bg-amber-50 border-amber-200' };
    return { fill: '#E11D48', label: 'High Post-Load Fatigue', color: 'text-rose-800', bg: 'bg-rose-50 border-rose-200' };
  };

  const theme = getRecoveryTheme(selectedMuscle.recoveryPercentage);

  return (
    <div className="rounded-3xl bg-white border border-cream-300 p-6 sm:p-8 shadow-card space-y-6 transition-all font-sans">
      {/* Formal Header & Perspective Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cream-200 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-forest-900 text-cream-50 text-[10px] font-bold uppercase tracking-wider font-mono">
              PHYSIOLOGICAL RECOVERY INDEX
            </span>
            <span className="text-xs text-charcoal-500 font-medium">
              Kinetic Muscle Mapping
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-forest-950 tracking-tight">
            Anatomical Muscle Readiness
          </h3>
        </div>

        {/* View Switcher: Front vs Back View */}
        <div className="inline-flex p-1 bg-cream-100 rounded-2xl border border-cream-200 text-xs">
          <button
            type="button"
            onClick={() => setViewAngle('front')}
            className={`px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 transition ${
              viewAngle === 'front'
                ? 'bg-forest-900 text-cream-50 shadow-sm'
                : 'text-charcoal-700 hover:text-forest-950'
            }`}
          >
            <Rotate3d className="w-3.5 h-3.5" />
            <span>Anterior View</span>
          </button>
          <button
            type="button"
            onClick={() => setViewAngle('back')}
            className={`px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 transition ${
              viewAngle === 'back'
                ? 'bg-forest-900 text-cream-50 shadow-sm'
                : 'text-charcoal-700 hover:text-forest-950'
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
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-3xl bg-[#F8F5EE] border border-cream-300 relative min-h-[440px]">
          
          {/* Recovery Legend Bar */}
          <div className="flex items-center gap-3 text-[11px] font-medium text-charcoal-600 mb-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Prime (80%+)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Recovering</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Fatigued</span>
            </span>
          </div>

          {/* SVG Silhouette */}
          <svg
            className="w-56 h-[380px] drop-shadow-sm select-none transition-all"
            viewBox="0 0 200 400"
          >
            {/* Background Body Base */}
            <path
              d="M100 20 C90 20 82 28 82 40 C82 50 88 58 95 62 C80 68 62 85 55 105 C48 125 40 160 35 190 C32 205 38 215 45 210 C50 205 55 180 60 160 C62 180 62 210 65 240 C68 270 70 310 75 370 C77 385 85 385 88 370 C92 330 95 280 100 250 C105 280 108 330 112 370 C115 385 123 385 125 370 C130 310 132 270 135 240 C138 210 138 180 140 160 C145 180 150 205 155 210 C162 215 168 205 165 190 C160 160 152 125 145 105 C138 85 120 68 105 62 C112 58 118 50 118 40 C118 28 110 20 100 20 Z"
              fill="#E8E2D6"
              stroke="#D4CCA"
              strokeWidth="2"
            />

            {/* ANTERIOR (FRONT) MUSCLES */}
            {viewAngle === 'front' && (
              <g className="cursor-pointer transition-all">
                {/* Deltoids */}
                <path
                  d="M60 85 C52 92 48 105 48 118 C56 118 64 105 68 95 Z"
                  fill={selectedMuscleKey === 'front_shoulders' ? '#0F4C3A' : getRecoveryTheme(BODY_PARTS_DATA.front_shoulders.recoveryPercentage).fill}
                  opacity={selectedMuscleKey === 'front_shoulders' ? 1 : 0.85}
                  onClick={() => setSelectedMuscleKey('front_shoulders')}
                />
                <path
                  d="M140 85 C148 92 152 105 152 118 C144 118 136 105 132 95 Z"
                  fill={selectedMuscleKey === 'front_shoulders' ? '#0F4C3A' : getRecoveryTheme(BODY_PARTS_DATA.front_shoulders.recoveryPercentage).fill}
                  opacity={selectedMuscleKey === 'front_shoulders' ? 1 : 0.85}
                  onClick={() => setSelectedMuscleKey('front_shoulders')}
                />

                {/* Pectorals */}
                <path
                  d="M72 90 C85 88 98 90 98 120 C85 122 72 115 68 102 Z"
                  fill={selectedMuscleKey === 'chest' ? '#0F4C3A' : getRecoveryTheme(BODY_PARTS_DATA.chest.recoveryPercentage).fill}
                  opacity={selectedMuscleKey === 'chest' ? 1 : 0.85}
                  stroke={selectedMuscleKey === 'chest' ? '#FFFFFF' : '#C7BFA'}
                  strokeWidth="1.5"
                  onClick={() => setSelectedMuscleKey('chest')}
                />
                <path
                  d="M128 90 C115 88 102 90 102 120 C115 122 128 115 132 102 Z"
                  fill={selectedMuscleKey === 'chest' ? '#0F4C3A' : getRecoveryTheme(BODY_PARTS_DATA.chest.recoveryPercentage).fill}
                  opacity={selectedMuscleKey === 'chest' ? 1 : 0.85}
                  stroke={selectedMuscleKey === 'chest' ? '#FFFFFF' : '#C7BFA'}
                  strokeWidth="1.5"
                  onClick={() => setSelectedMuscleKey('chest')}
                />

                {/* Biceps */}
                <path
                  d="M46 122 C42 135 44 150 50 155 C54 150 56 135 52 122 Z"
                  fill={selectedMuscleKey === 'biceps' ? '#0F4C3A' : getRecoveryTheme(BODY_PARTS_DATA.biceps.recoveryPercentage).fill}
                  opacity={selectedMuscleKey === 'biceps' ? 1 : 0.85}
                  onClick={() => setSelectedMuscleKey('biceps')}
                />
                <path
                  d="M154 122 C158 135 156 150 150 155 C146 150 144 135 148 122 Z"
                  fill={selectedMuscleKey === 'biceps' ? '#0F4C3A' : getRecoveryTheme(BODY_PARTS_DATA.biceps.recoveryPercentage).fill}
                  opacity={selectedMuscleKey === 'biceps' ? 1 : 0.85}
                  onClick={() => setSelectedMuscleKey('biceps')}
                />

                {/* Core / Abdominals */}
                <rect
                  x="82"
                  y="126"
                  width="36"
                  height="50"
                  rx="6"
                  fill={selectedMuscleKey === 'abs' ? '#0F4C3A' : getRecoveryTheme(BODY_PARTS_DATA.abs.recoveryPercentage).fill}
                  opacity={selectedMuscleKey === 'abs' ? 1 : 0.85}
                  stroke={selectedMuscleKey === 'abs' ? '#FFFFFF' : '#C7BFA'}
                  strokeWidth="1.5"
                  onClick={() => setSelectedMuscleKey('abs')}
                />

                {/* Quadriceps */}
                <path
                  d="M68 190 C62 215 65 260 76 270 C84 265 88 220 86 190 Z"
                  fill={selectedMuscleKey === 'quads' ? '#0F4C3A' : getRecoveryTheme(BODY_PARTS_DATA.quads.recoveryPercentage).fill}
                  opacity={selectedMuscleKey === 'quads' ? 1 : 0.85}
                  stroke={selectedMuscleKey === 'quads' ? '#FFFFFF' : '#C7BFA'}
                  strokeWidth="1.5"
                  onClick={() => setSelectedMuscleKey('quads')}
                />
                <path
                  d="M132 190 C138 215 135 260 124 270 C116 265 112 220 114 190 Z"
                  fill={selectedMuscleKey === 'quads' ? '#0F4C3A' : getRecoveryTheme(BODY_PARTS_DATA.quads.recoveryPercentage).fill}
                  opacity={selectedMuscleKey === 'quads' ? 1 : 0.85}
                  stroke={selectedMuscleKey === 'quads' ? '#FFFFFF' : '#C7BFA'}
                  strokeWidth="1.5"
                  onClick={() => setSelectedMuscleKey('quads')}
                />

                {/* Calves */}
                <path
                  d="M74 285 C70 310 74 345 80 355 C84 345 86 310 82 285 Z"
                  fill={selectedMuscleKey === 'calves_front' ? '#0F4C3A' : getRecoveryTheme(BODY_PARTS_DATA.calves_front.recoveryPercentage).fill}
                  opacity={selectedMuscleKey === 'calves_front' ? 1 : 0.85}
                  onClick={() => setSelectedMuscleKey('calves_front')}
                />
                <path
                  d="M126 285 C130 310 126 345 120 355 C116 345 114 310 118 285 Z"
                  fill={selectedMuscleKey === 'calves_front' ? '#0F4C3A' : getRecoveryTheme(BODY_PARTS_DATA.calves_front.recoveryPercentage).fill}
                  opacity={selectedMuscleKey === 'calves_front' ? 1 : 0.85}
                  onClick={() => setSelectedMuscleKey('calves_front')}
                />
              </g>
            )}

            {/* POSTERIOR (BACK) MUSCLES */}
            {viewAngle === 'back' && (
              <g className="cursor-pointer transition-all">
                {/* Trapezius */}
                <polygon
                  points="100,60 125,85 100,115 75,85"
                  fill={selectedMuscleKey === 'traps_upper_back' ? '#0F4C3A' : getRecoveryTheme(BODY_PARTS_DATA.traps_upper_back.recoveryPercentage).fill}
                  opacity={selectedMuscleKey === 'traps_upper_back' ? 1 : 0.85}
                  stroke={selectedMuscleKey === 'traps_upper_back' ? '#FFFFFF' : '#C7BFA'}
                  strokeWidth="1.5"
                  onClick={() => setSelectedMuscleKey('traps_upper_back')}
                />

                {/* Lats */}
                <path
                  d="M68 95 C62 120 70 150 82 158 C84 140 82 110 75 95 Z"
                  fill={selectedMuscleKey === 'lats' ? '#0F4C3A' : getRecoveryTheme(BODY_PARTS_DATA.lats.recoveryPercentage).fill}
                  opacity={selectedMuscleKey === 'lats' ? 1 : 0.85}
                  stroke={selectedMuscleKey === 'lats' ? '#FFFFFF' : '#C7BFA'}
                  strokeWidth="1.5"
                  onClick={() => setSelectedMuscleKey('lats')}
                />
                <path
                  d="M132 95 C138 120 130 150 118 158 C116 140 118 110 125 95 Z"
                  fill={selectedMuscleKey === 'lats' ? '#0F4C3A' : getRecoveryTheme(BODY_PARTS_DATA.lats.recoveryPercentage).fill}
                  opacity={selectedMuscleKey === 'lats' ? 1 : 0.85}
                  stroke={selectedMuscleKey === 'lats' ? '#FFFFFF' : '#C7BFA'}
                  strokeWidth="1.5"
                  onClick={() => setSelectedMuscleKey('lats')}
                />

                {/* Triceps */}
                <path
                  d="M48 115 C44 130 46 145 52 150 C54 140 56 125 54 115 Z"
                  fill={selectedMuscleKey === 'triceps' ? '#0F4C3A' : getRecoveryTheme(BODY_PARTS_DATA.triceps.recoveryPercentage).fill}
                  opacity={selectedMuscleKey === 'triceps' ? 1 : 0.85}
                  onClick={() => setSelectedMuscleKey('triceps')}
                />
                <path
                  d="M152 115 C156 130 154 145 148 150 C146 140 144 125 146 115 Z"
                  fill={selectedMuscleKey === 'triceps' ? '#0F4C3A' : getRecoveryTheme(BODY_PARTS_DATA.triceps.recoveryPercentage).fill}
                  opacity={selectedMuscleKey === 'triceps' ? 1 : 0.85}
                  onClick={() => setSelectedMuscleKey('triceps')}
                />

                {/* Gluteal Complex */}
                <ellipse
                  cx="85"
                  cy="195"
                  rx="15"
                  ry="18"
                  fill={selectedMuscleKey === 'glutes' ? '#0F4C3A' : getRecoveryTheme(BODY_PARTS_DATA.glutes.recoveryPercentage).fill}
                  opacity={selectedMuscleKey === 'glutes' ? 1 : 0.85}
                  stroke={selectedMuscleKey === 'glutes' ? '#FFFFFF' : '#C7BFA'}
                  strokeWidth="1.5"
                  onClick={() => setSelectedMuscleKey('glutes')}
                />
                <ellipse
                  cx="115"
                  cy="195"
                  rx="15"
                  ry="18"
                  fill={selectedMuscleKey === 'glutes' ? '#0F4C3A' : getRecoveryTheme(BODY_PARTS_DATA.glutes.recoveryPercentage).fill}
                  opacity={selectedMuscleKey === 'glutes' ? 1 : 0.85}
                  stroke={selectedMuscleKey === 'glutes' ? '#FFFFFF' : '#C7BFA'}
                  strokeWidth="1.5"
                  onClick={() => setSelectedMuscleKey('glutes')}
                />

                {/* Hamstrings */}
                <path
                  d="M70 215 C66 235 68 265 76 270 C84 265 86 235 84 215 Z"
                  fill={selectedMuscleKey === 'hamstrings' ? '#0F4C3A' : getRecoveryTheme(BODY_PARTS_DATA.hamstrings.recoveryPercentage).fill}
                  opacity={selectedMuscleKey === 'hamstrings' ? 1 : 0.85}
                  stroke={selectedMuscleKey === 'hamstrings' ? '#FFFFFF' : '#C7BFA'}
                  strokeWidth="1.5"
                  onClick={() => setSelectedMuscleKey('hamstrings')}
                />
                <path
                  d="M130 215 C134 235 132 265 124 270 C116 265 114 235 116 215 Z"
                  fill={selectedMuscleKey === 'hamstrings' ? '#0F4C3A' : getRecoveryTheme(BODY_PARTS_DATA.hamstrings.recoveryPercentage).fill}
                  opacity={selectedMuscleKey === 'hamstrings' ? 1 : 0.85}
                  stroke={selectedMuscleKey === 'hamstrings' ? '#FFFFFF' : '#C7BFA'}
                  strokeWidth="1.5"
                  onClick={() => setSelectedMuscleKey('hamstrings')}
                />
              </g>
            )}
          </svg>

          <span className="text-xs font-semibold text-charcoal-700 mt-3">
            Selected Region: <strong className="text-forest-950 font-bold">{selectedMuscle.name}</strong>
          </span>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT: CLINICAL READINESS & PRESCRIBED EXERCISE ARSENAL                  */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Recovery Diagnostic Card */}
          <div className="p-5 sm:p-6 rounded-3xl bg-[#FAF7F2] border border-cream-300 space-y-3.5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${theme.bg} ${theme.color}`}>
                  {selectedMuscle.fatigueLevel} • {selectedMuscle.recoveryPercentage}% Recovery Index
                </span>
                <h4 className="text-lg sm:text-xl font-extrabold text-forest-950 mt-1.5">
                  {selectedMuscle.name}
                </h4>
                <p className="text-xs text-charcoal-600 mt-1 leading-relaxed">
                  {selectedMuscle.physiologicalRole}
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] uppercase font-bold text-charcoal-400 block font-mono">Last Stimulated</span>
                <span className="text-xs font-bold text-forest-900">{selectedMuscle.lastTrained}</span>
              </div>
            </div>

            {/* Recovery Gauge Bar */}
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-xs font-mono font-medium">
                <span className="text-charcoal-600">Adaptive Cellular Recovery:</span>
                <span className="font-bold text-forest-950">{selectedMuscle.recoveryPercentage}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-cream-200 overflow-hidden">
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
                className="w-full py-2.5 px-4 rounded-xl bg-forest-900 hover:bg-forest-800 text-cream-50 font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-soft"
              >
                <Play className="w-3.5 h-3.5 fill-current text-mint-300" />
                <span>Initialize {selectedMuscle.muscleGroup} Training Protocol</span>
              </button>
            )}
          </div>

          {/* Evidence-Based Exercise Movements */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-forest-950 flex items-center gap-1.5">
              <Dumbbell className="w-3.5 h-3.5 text-forest-900" />
              <span>Prescribed Resistance Arsenal ({matchingExercises.length} Movements)</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[220px] overflow-y-auto pr-1">
              {matchingExercises.map((ex) => (
                <div
                  key={ex.id}
                  onClick={() => onSelectExercise && onSelectExercise(ex)}
                  className="p-3 rounded-2xl bg-white hover:bg-cream-50 border border-cream-200 hover:border-forest-800 transition cursor-pointer flex items-center justify-between group"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-forest-950 block">{ex.name}</span>
                    <span className="text-[11px] text-charcoal-500 font-mono">
                      {ex.defaultSets} sets × {ex.defaultReps} reps • {ex.defaultWeightKg} kg
                    </span>
                  </div>
                  <div className="w-6 h-6 rounded-lg bg-cream-100 group-hover:bg-forest-900 group-hover:text-cream-50 flex items-center justify-center text-charcoal-600 transition">
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
