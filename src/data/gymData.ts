import { MuscleGroup, WorkoutSession } from '../types';

export interface ExerciseDefinition {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  category: 'Barbell' | 'Dumbbell' | 'Machine' | 'Cable' | 'Bodyweight' | 'Cardio';
  defaultSets: number;
  defaultReps: number;
  defaultWeightKg: number;
  instructions: string;
}

export const PRESET_EXERCISES: ExerciseDefinition[] = [
  // Chest
  { id: 'bench-press', name: 'Barbell Bench Press', muscleGroup: 'Chest', category: 'Barbell', defaultSets: 4, defaultReps: 8, defaultWeightKg: 60, instructions: 'Retract scapulae, touch lower chest, drive upwards.' },
  { id: 'incline-db-press', name: 'Incline Dumbbell Press', muscleGroup: 'Chest', category: 'Dumbbell', defaultSets: 3, defaultReps: 10, defaultWeightKg: 22, instructions: '30-degree incline, full stretch at bottom, squeeze clavicular chest.' },
  { id: 'cable-crossover', name: 'Cable Chest Flyes', muscleGroup: 'Chest', category: 'Cable', defaultSets: 3, defaultReps: 12, defaultWeightKg: 15, instructions: 'Slight elbow bend, bring hands together in a hugging motion.' },
  { id: 'dips', name: 'Chest Dips', muscleGroup: 'Chest', category: 'Bodyweight', defaultSets: 3, defaultReps: 10, defaultWeightKg: 0, instructions: 'Lean forward slightly to target lower pectorals.' },

  // Back
  { id: 'barbell-deadlift', name: 'Conventional Deadlift', muscleGroup: 'Back', category: 'Barbell', defaultSets: 4, defaultReps: 5, defaultWeightKg: 100, instructions: 'Brace core, push the floor away, maintain neutral spine.' },
  { id: 'lat-pulldown', name: 'Lat Pulldown', muscleGroup: 'Back', category: 'Cable', defaultSets: 4, defaultReps: 10, defaultWeightKg: 50, instructions: 'Drive elbows down to hips, squeeze lats at contraction.' },
  { id: 'seated-cable-row', name: 'Seated Cable Row', muscleGroup: 'Back', category: 'Cable', defaultSets: 3, defaultReps: 10, defaultWeightKg: 45, instructions: 'Keep torso upright, pull handle to navel, pinch shoulder blades.' },
  { id: 'pull-ups', name: 'Strict Pull-Ups', muscleGroup: 'Back', category: 'Bodyweight', defaultSets: 3, defaultReps: 8, defaultWeightKg: 0, instructions: 'Full dead-hang to chin above bar.' },

  // Quads & Hamstrings / Legs
  { id: 'barbell-squat', name: 'Barbell Back Squat', muscleGroup: 'Quads', category: 'Barbell', defaultSets: 4, defaultReps: 8, defaultWeightKg: 80, instructions: 'Break at hips and knees, hit parallel or below, drive through mid-foot.' },
  { id: 'leg-press', name: '45° Leg Press', muscleGroup: 'Quads', category: 'Machine', defaultSets: 3, defaultReps: 12, defaultWeightKg: 140, instructions: 'Feet shoulder-width, control descent, avoid locking knees at top.' },
  { id: 'romanian-deadlift', name: 'Romanian Deadlift (RDL)', muscleGroup: 'Hamstrings', category: 'Barbell', defaultSets: 3, defaultReps: 10, defaultWeightKg: 70, instructions: 'Hinge hips backwards until hamstring tension peaks, keep bar close to shins.' },
  { id: 'leg-curl', name: 'Lying Leg Curl', muscleGroup: 'Hamstrings', category: 'Machine', defaultSets: 3, defaultReps: 12, defaultWeightKg: 35, instructions: 'Curl weight towards glutes, hold peak contraction for 1 second.' },

  // Shoulders
  { id: 'overhead-press', name: 'Overhead Barbell Press', muscleGroup: 'Shoulders', category: 'Barbell', defaultSets: 4, defaultReps: 6, defaultWeightKg: 45, instructions: 'Lock glutes & core, press straight overhead clearing forehead.' },
  { id: 'lateral-raise', name: 'Dumbbell Lateral Raise', muscleGroup: 'Shoulders', category: 'Dumbbell', defaultSets: 4, defaultReps: 15, defaultWeightKg: 10, instructions: 'Lead with elbows, slight forward lean, control the eccentric.' },
  { id: 'face-pulls', name: 'Rope Face Pulls', muscleGroup: 'Shoulders', category: 'Cable', defaultSets: 3, defaultReps: 15, defaultWeightKg: 20, instructions: 'Pull rope to eye-level while externally rotating shoulders.' },

  // Arms (Biceps & Triceps)
  { id: 'incline-db-curl', name: 'Incline Dumbbell Bicep Curl', muscleGroup: 'Biceps', category: 'Dumbbell', defaultSets: 3, defaultReps: 10, defaultWeightKg: 14, instructions: 'Keep elbows fixed behind torso for long-head stretch.' },
  { id: 'tricep-pushdown', name: 'Tricep Rope Pushdown', muscleGroup: 'Triceps', category: 'Cable', defaultSets: 3, defaultReps: 12, defaultWeightKg: 25, instructions: 'Spread rope apart at bottom, lock out triceps.' },
  { id: 'skull-crushers', name: 'EZ-Bar Skull Crushers', muscleGroup: 'Triceps', category: 'Barbell', defaultSets: 3, defaultReps: 10, defaultWeightKg: 30, instructions: 'Lower bar to crown of head, flare triceps to press.' },

  // Core & Cardio
  { id: 'hanging-leg-raise', name: 'Hanging Leg Raises', muscleGroup: 'Core', category: 'Bodyweight', defaultSets: 3, defaultReps: 12, defaultWeightKg: 0, instructions: 'Curl pelvis up towards chest, avoid swinging.' },
  { id: 'zone2-cardio', name: 'Zone 2 Incline Treadmill Walk', muscleGroup: 'Cardio', category: 'Cardio', defaultSets: 1, defaultReps: 30, defaultWeightKg: 0, instructions: '12% incline, 4.5 km/h, sustain 120-135 BPM.' }
];

export const PRESET_ROUTINE_TEMPLATES = [
  {
    id: 'push-day',
    title: 'Push Power (Chest / Shoulders / Triceps)',
    exerciseIds: ['bench-press', 'incline-db-press', 'overhead-press', 'lateral-raise', 'tricep-pushdown']
  },
  {
    id: 'pull-day',
    title: 'Pull Hypertrophy (Back / Rear Delts / Biceps)',
    exerciseIds: ['barbell-deadlift', 'lat-pulldown', 'seated-cable-row', 'face-pulls', 'incline-db-curl']
  },
  {
    id: 'legs-day',
    title: 'Legs & Core Conditioning',
    exerciseIds: ['barbell-squat', 'romanian-deadlift', 'leg-press', 'leg-curl', 'hanging-leg-raise']
  },
  {
    id: 'full-body',
    title: 'Full Body Athletic Conditioning',
    exerciseIds: ['barbell-squat', 'bench-press', 'lat-pulldown', 'overhead-press', 'zone2-cardio']
  }
];

export const DEMO_WORKOUT_SESSIONS: WorkoutSession[] = [
  {
    id: 'session-1',
    title: 'Push Power Session',
    date: '2026-10-02',
    startTime: '07:30 AM',
    durationMinutes: 52,
    totalVolumeKg: 6420,
    totalSets: 14,
    notes: 'Hit a PR on Incline Dumbbell Press (24kg x 8 reps). Good shoulder mobility.',
    exercises: [
      {
        id: 'ex-1',
        exerciseId: 'bench-press',
        exerciseName: 'Barbell Bench Press',
        muscleGroup: 'Chest',
        sets: [
          { id: 's1', setNumber: 1, weightKg: 60, reps: 10, isCompleted: true },
          { id: 's2', setNumber: 2, weightKg: 70, reps: 8, isCompleted: true },
          { id: 's3', setNumber: 3, weightKg: 75, reps: 6, isCompleted: true, isPersonalRecord: true },
        ]
      },
      {
        id: 'ex-2',
        exerciseId: 'incline-db-press',
        exerciseName: 'Incline Dumbbell Press',
        muscleGroup: 'Chest',
        sets: [
          { id: 's4', setNumber: 1, weightKg: 22, reps: 10, isCompleted: true },
          { id: 's5', setNumber: 2, weightKg: 24, reps: 8, isCompleted: true, isPersonalRecord: true },
        ]
      },
      {
        id: 'ex-3',
        exerciseId: 'lateral-raise',
        exerciseName: 'Dumbbell Lateral Raise',
        muscleGroup: 'Shoulders',
        sets: [
          { id: 's6', setNumber: 1, weightKg: 10, reps: 15, isCompleted: true },
          { id: 's7', setNumber: 2, weightKg: 10, reps: 14, isCompleted: true },
          { id: 's8', setNumber: 3, weightKg: 12, reps: 12, isCompleted: true },
        ]
      }
    ]
  }
];
