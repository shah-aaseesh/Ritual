import { MuscleGroup } from '../types';

export type EquipmentType = 'Barbell' | 'Dumbbell' | 'Machine' | 'Cable' | 'Bodyweight' | 'Cardio';

export interface ExerciseDefinition {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  category: EquipmentType;
  equipment: EquipmentType;
  secondaryMuscles?: string[];
  defaultSets: number;
  defaultReps: number;
  defaultWeightKg: number;
  instructions: string;
  cues?: string[];
  alternatives?: string[]; // IDs of swap alternatives
}

export const PRESET_EXERCISES: ExerciseDefinition[] = [
  // ==================== CHEST ====================
  {
    id: 'bench-press',
    name: 'Barbell Bench Press',
    muscleGroup: 'Chest',
    category: 'Barbell',
    equipment: 'Barbell',
    secondaryMuscles: ['Triceps', 'Front Delts'],
    defaultSets: 4,
    defaultReps: 8,
    defaultWeightKg: 60,
    instructions: 'Retract scapulae, touch lower chest, drive bar upwards in a slight J-curve.',
    cues: ['Pinch shoulder blades together', 'Keep feet firmly planted on floor', 'Elbows tucked at 45° angle'],
    alternatives: ['db-bench-press', 'incline-db-press', 'chest-press-machine', 'dips']
  },
  {
    id: 'db-bench-press',
    name: 'Flat Dumbbell Press',
    muscleGroup: 'Chest',
    category: 'Dumbbell',
    equipment: 'Dumbbell',
    secondaryMuscles: ['Triceps', 'Front Delts'],
    defaultSets: 3,
    defaultReps: 10,
    defaultWeightKg: 24,
    instructions: 'Full stretch at bottom, converge dumbbells at top without clanking.',
    cues: ['Deep stretch across pectorals', 'Control the descent for 2 seconds'],
    alternatives: ['bench-press', 'incline-db-press', 'push-ups']
  },
  {
    id: 'incline-db-press',
    name: 'Incline Dumbbell Press',
    muscleGroup: 'Chest',
    category: 'Dumbbell',
    equipment: 'Dumbbell',
    secondaryMuscles: ['Front Delts', 'Triceps'],
    defaultSets: 3,
    defaultReps: 10,
    defaultWeightKg: 22,
    instructions: '30-degree incline bench, full stretch at bottom, squeeze clavicular upper chest.',
    cues: ['Avoid arching lower back excessively', 'Drive elbows together at lockout'],
    alternatives: ['incline-bb-press', 'cable-crossover', 'bench-press']
  },
  {
    id: 'incline-bb-press',
    name: 'Incline Barbell Bench Press',
    muscleGroup: 'Chest',
    category: 'Barbell',
    equipment: 'Barbell',
    secondaryMuscles: ['Front Delts', 'Triceps'],
    defaultSets: 3,
    defaultReps: 8,
    defaultWeightKg: 50,
    instructions: 'Lower bar to upper chest clavicular area, press upward with control.',
    cues: ['Keep wrists stacked over elbows', 'Focus on upper pectoral contraction'],
    alternatives: ['incline-db-press', 'cable-crossover']
  },
  {
    id: 'cable-crossover',
    name: 'Cable Chest Flyes',
    muscleGroup: 'Chest',
    category: 'Cable',
    equipment: 'Cable',
    secondaryMuscles: ['Front Delts'],
    defaultSets: 3,
    defaultReps: 12,
    defaultWeightKg: 15,
    instructions: 'Slight elbow bend, bring handles together in a hugging motion with peak contraction.',
    cues: ['Keep chest proud and shoulders back', 'Hold peak squeeze for 1 second'],
    alternatives: ['pec-deck-machine', 'dips', 'db-bench-press']
  },
  {
    id: 'pec-deck-machine',
    name: 'Pec Deck Machine Fly',
    muscleGroup: 'Chest',
    category: 'Machine',
    equipment: 'Machine',
    secondaryMuscles: ['Front Delts'],
    defaultSets: 3,
    defaultReps: 12,
    defaultWeightKg: 40,
    instructions: 'Adjust seat so handles align with mid-chest, isolate pectorals across full arc.',
    cues: ['Avoid letting shoulders roll forward', 'Constant tension throughout range'],
    alternatives: ['cable-crossover', 'db-bench-press']
  },
  {
    id: 'dips',
    name: 'Chest Parallel Dips',
    muscleGroup: 'Chest',
    category: 'Bodyweight',
    equipment: 'Bodyweight',
    secondaryMuscles: ['Triceps', 'Front Delts'],
    defaultSets: 3,
    defaultReps: 10,
    defaultWeightKg: 0,
    instructions: 'Lean torso forward 30 degrees to bias lower pectorals, descend to 90-degree elbow bend.',
    cues: ['Keep elbows slightly flared', 'Full lockout with chest squeezed'],
    alternatives: ['bench-press', 'cable-crossover']
  },
  {
    id: 'push-ups',
    name: 'Standard Push-Ups',
    muscleGroup: 'Chest',
    category: 'Bodyweight',
    equipment: 'Bodyweight',
    secondaryMuscles: ['Triceps', 'Core'],
    defaultSets: 3,
    defaultReps: 15,
    defaultWeightKg: 0,
    instructions: 'Hands shoulder-width apart, rigid core plank, chest to floor.',
    cues: ['Keep core braced and glutes tight', 'Full lockout at top'],
    alternatives: ['dips', 'bench-press']
  },

  // ==================== BACK ====================
  {
    id: 'barbell-deadlift',
    name: 'Conventional Deadlift',
    muscleGroup: 'Back',
    category: 'Barbell',
    equipment: 'Barbell',
    secondaryMuscles: ['Hamstrings', 'Glutes', 'Traps', 'Forearms'],
    defaultSets: 4,
    defaultReps: 5,
    defaultWeightKg: 100,
    instructions: 'Brace core, push the floor away, maintain neutral spine and lock hips through.',
    cues: ['Pull slack out of barbell before lifting', 'Bar stays glued to shins and thighs'],
    alternatives: ['trap-bar-deadlift', 'barbell-row', 'romanian-deadlift']
  },
  {
    id: 'lat-pulldown',
    name: 'Wide-Grip Lat Pulldown',
    muscleGroup: 'Back',
    category: 'Cable',
    equipment: 'Cable',
    secondaryMuscles: ['Biceps', 'Rear Delts'],
    defaultSets: 4,
    defaultReps: 10,
    defaultWeightKg: 50,
    instructions: 'Drive elbows down towards back pockets, squeeze lats hard at bottom.',
    cues: ['Avoid leaning back too far', 'Initiate movement by depressing scapulae'],
    alternatives: ['pull-ups', 'seated-cable-row', 'single-arm-pulldown']
  },
  {
    id: 'pull-ups',
    name: 'Strict Pull-Ups',
    muscleGroup: 'Back',
    category: 'Bodyweight',
    equipment: 'Bodyweight',
    secondaryMuscles: ['Biceps', 'Forearms', 'Core'],
    defaultSets: 3,
    defaultReps: 8,
    defaultWeightKg: 0,
    instructions: 'Full dead-hang stretch to chin cleanly above the bar.',
    cues: ['Lead with the chest toward the bar', 'Avoid kipping or swinging'],
    alternatives: ['lat-pulldown', 'seated-cable-row']
  },
  {
    id: 'barbell-row',
    name: 'Bent-Over Barbell Row',
    muscleGroup: 'Back',
    category: 'Barbell',
    equipment: 'Barbell',
    secondaryMuscles: ['Biceps', 'Traps', 'Erectors'],
    defaultSets: 4,
    defaultReps: 8,
    defaultWeightKg: 60,
    instructions: 'Torso hinged at 45 degrees, pull bar to navel, pinch shoulder blades together.',
    cues: ['Keep spine rigid and neutral', 'Pull with your elbows, not hands'],
    alternatives: ['db-single-arm-row', 'seated-cable-row', 'chest-supported-row']
  },
  {
    id: 'seated-cable-row',
    name: 'Seated Cable Row',
    muscleGroup: 'Back',
    category: 'Cable',
    equipment: 'Cable',
    secondaryMuscles: ['Biceps', 'Rear Delts', 'Rhomboids'],
    defaultSets: 3,
    defaultReps: 10,
    defaultWeightKg: 45,
    instructions: 'Keep torso upright, pull handle to lower sternum, pause for 1 second at peak contraction.',
    cues: ['Full stretch forward without rounding lumbar', 'Drive elbows straight back'],
    alternatives: ['barbell-row', 'db-single-arm-row']
  },
  {
    id: 'db-single-arm-row',
    name: 'Single-Arm Dumbbell Row',
    muscleGroup: 'Back',
    category: 'Dumbbell',
    equipment: 'Dumbbell',
    secondaryMuscles: ['Biceps', 'Rhomboids'],
    defaultSets: 3,
    defaultReps: 10,
    defaultWeightKg: 24,
    instructions: 'One knee on bench, pull dumbbell to hip crease with elbow driving backward.',
    cues: ['Allow full lat stretch at bottom', 'Avoid twisting torso excessively'],
    alternatives: ['seated-cable-row', 'barbell-row']
  },

  // ==================== SHOULDERS ====================
  {
    id: 'overhead-press',
    name: 'Overhead Barbell Press (OHP)',
    muscleGroup: 'Shoulders',
    category: 'Barbell',
    equipment: 'Barbell',
    secondaryMuscles: ['Triceps', 'Upper Chest', 'Core'],
    defaultSets: 4,
    defaultReps: 6,
    defaultWeightKg: 45,
    instructions: 'Squeeze glutes & core, press straight overhead clearing chin/forehead, lock out overhead.',
    cues: ['Head moves slightly forward at lockout', 'Keep ribcage down, don’t overarch lumbar'],
    alternatives: ['seated-db-shoulder-press', 'arnold-press', 'machine-shoulder-press']
  },
  {
    id: 'seated-db-shoulder-press',
    name: 'Seated Dumbbell Shoulder Press',
    muscleGroup: 'Shoulders',
    category: 'Dumbbell',
    equipment: 'Dumbbell',
    secondaryMuscles: ['Triceps', 'Upper Chest'],
    defaultSets: 3,
    defaultReps: 10,
    defaultWeightKg: 18,
    instructions: 'Upright bench, press dumbbells in a slight inward arc to full lockout overhead.',
    cues: ['Keep elbows angled slightly forward (scapular plane)', 'Control the lowering phase'],
    alternatives: ['overhead-press', 'arnold-press']
  },
  {
    id: 'lateral-raise',
    name: 'Dumbbell Lateral Raise',
    muscleGroup: 'Shoulders',
    category: 'Dumbbell',
    equipment: 'Dumbbell',
    secondaryMuscles: ['Traps'],
    defaultSets: 4,
    defaultReps: 15,
    defaultWeightKg: 10,
    instructions: 'Lead with elbows, slight forward torso lean, raise arms to parallel.',
    cues: ['Pour the water motion at top', 'Slow eccentric descent for 2 seconds'],
    alternatives: ['cable-lateral-raise', 'face-pulls']
  },
  {
    id: 'cable-lateral-raise',
    name: 'Cable Lateral Raise',
    muscleGroup: 'Shoulders',
    category: 'Cable',
    equipment: 'Cable',
    secondaryMuscles: ['Traps'],
    defaultSets: 3,
    defaultReps: 15,
    defaultWeightKg: 7.5,
    instructions: 'Set cable to wrist height, pull across body for constant tension on lateral delts.',
    cues: ['Maintain continuous resistance at bottom', 'Smooth controlled motion'],
    alternatives: ['lateral-raise', 'overhead-press']
  },
  {
    id: 'face-pulls',
    name: 'Rope Face Pulls',
    muscleGroup: 'Shoulders',
    category: 'Cable',
    equipment: 'Cable',
    secondaryMuscles: ['Rear Delts', 'Rotator Cuff', 'Upper Traps'],
    defaultSets: 3,
    defaultReps: 15,
    defaultWeightKg: 20,
    instructions: 'Pull rope toward eye-level while externally rotating shoulders, thumbs pointed backward.',
    cues: ['Pull past ears to maximize rear delt recruitment', 'Essential for shoulder health & longevity'],
    alternatives: ['reverse-pec-deck', 'lateral-raise']
  },
  {
    id: 'reverse-pec-deck',
    name: 'Rear Delt Machine Fly',
    muscleGroup: 'Shoulders',
    category: 'Machine',
    equipment: 'Machine',
    secondaryMuscles: ['Rhomboids', 'Traps'],
    defaultSets: 3,
    defaultReps: 12,
    defaultWeightKg: 35,
    instructions: 'Sit facing machine, push handles outward and backward focusing entirely on rear delts.',
    cues: ['Keep arms almost straight', 'Don’t shrug traps'],
    alternatives: ['face-pulls', 'lateral-raise']
  },

  // ==================== QUADS & HAMSTRINGS / LEGS ====================
  {
    id: 'barbell-squat',
    name: 'Barbell Back Squat',
    muscleGroup: 'Quads',
    category: 'Barbell',
    equipment: 'Barbell',
    secondaryMuscles: ['Glutes', 'Hamstrings', 'Core', 'Erectors'],
    defaultSets: 4,
    defaultReps: 8,
    defaultWeightKg: 80,
    instructions: 'Break at hips and knees together, hit parallel or below, drive upward through mid-foot.',
    cues: ['Chest proud, brace abdominal wall with 360° breath', 'Knees track over second toe'],
    alternatives: ['leg-press', 'goblet-squat', 'hack-squat', 'bulgarian-split-squat']
  },
  {
    id: 'leg-press',
    name: '45° Incline Leg Press',
    muscleGroup: 'Quads',
    category: 'Machine',
    equipment: 'Machine',
    secondaryMuscles: ['Glutes', 'Hamstrings'],
    defaultSets: 3,
    defaultReps: 12,
    defaultWeightKg: 140,
    instructions: 'Feet shoulder-width on platform, deep descent without lower back peeling off pad.',
    cues: ['Never lock knees violently at top', 'Control negative smoothly'],
    alternatives: ['barbell-squat', 'hack-squat', 'leg-extension']
  },
  {
    id: 'leg-extension',
    name: 'Seated Leg Extension',
    muscleGroup: 'Quads',
    category: 'Machine',
    equipment: 'Machine',
    secondaryMuscles: [],
    defaultSets: 3,
    defaultReps: 15,
    defaultWeightKg: 45,
    instructions: 'Align knee joint with machine axis, extend legs fully, squeeze rectus femoris quad at top.',
    cues: ['Hold contraction for 1 full second', 'Great for knee tendon conditioning'],
    alternatives: ['barbell-squat', 'leg-press']
  },
  {
    id: 'bulgarian-split-squat',
    name: 'Bulgarian Split Squat',
    muscleGroup: 'Quads',
    category: 'Dumbbell',
    equipment: 'Dumbbell',
    secondaryMuscles: ['Glutes', 'Hamstrings', 'Adductors'],
    defaultSets: 3,
    defaultReps: 10,
    defaultWeightKg: 14,
    instructions: 'Rear foot elevated on bench, descend until front thigh is parallel, drive through front heel.',
    cues: ['Torso slight forward lean for glute/quad recruitment', 'Unilateral balance builder'],
    alternatives: ['walking-lunges', 'leg-press']
  },
  {
    id: 'romanian-deadlift',
    name: 'Romanian Deadlift (RDL)',
    muscleGroup: 'Hamstrings',
    category: 'Barbell',
    equipment: 'Barbell',
    secondaryMuscles: ['Glutes', 'Erectors', 'Lats'],
    defaultSets: 3,
    defaultReps: 10,
    defaultWeightKg: 70,
    instructions: 'Hinge hips backward until hamstring tension peaks at shin level, snap hips forward to lock out.',
    cues: ['Keep bar skimming down thighs and shins', 'Soft knee bend, don’t squat it down'],
    alternatives: ['db-rdl', 'leg-curl', 'barbell-deadlift']
  },
  {
    id: 'db-rdl',
    name: 'Dumbbell Romanian Deadlift',
    muscleGroup: 'Hamstrings',
    category: 'Dumbbell',
    equipment: 'Dumbbell',
    secondaryMuscles: ['Glutes', 'Erectors'],
    defaultSets: 3,
    defaultReps: 10,
    defaultWeightKg: 22,
    instructions: 'Hold dumbbells in front of thighs, hinge hips back, squeeze glutes at top.',
    cues: ['Push glutes toward rear wall', 'Keep back flat as a table'],
    alternatives: ['romanian-deadlift', 'leg-curl']
  },
  {
    id: 'leg-curl',
    name: 'Lying Leg Curl',
    muscleGroup: 'Hamstrings',
    category: 'Machine',
    equipment: 'Machine',
    secondaryMuscles: ['Calves'],
    defaultSets: 3,
    defaultReps: 12,
    defaultWeightKg: 35,
    instructions: 'Curl pad towards glutes, hold peak contraction for 1 second, resist on way down.',
    cues: ['Keep hips pressed firmly into pad', 'Full hamstring flexion'],
    alternatives: ['seated-leg-curl', 'romanian-deadlift']
  },

  // ==================== ARMS (BICEPS & TRICEPS) ====================
  {
    id: 'incline-db-curl',
    name: 'Incline Dumbbell Bicep Curl',
    muscleGroup: 'Biceps',
    category: 'Dumbbell',
    equipment: 'Dumbbell',
    secondaryMuscles: ['Forearms'],
    defaultSets: 3,
    defaultReps: 10,
    defaultWeightKg: 14,
    instructions: 'Incline bench, let arms hang straight down behind torso, curl with full forearm supination.',
    cues: ['Elbows stay pinned behind torso for deep long-head stretch', 'Squeeze bicep peak at top'],
    alternatives: ['barbell-bicep-curl', 'hammer-curl', 'cable-bicep-curl']
  },
  {
    id: 'barbell-bicep-curl',
    name: 'Standing Barbell / EZ-Bar Curl',
    muscleGroup: 'Biceps',
    category: 'Barbell',
    equipment: 'Barbell',
    secondaryMuscles: ['Brachialis', 'Forearms'],
    defaultSets: 3,
    defaultReps: 10,
    defaultWeightKg: 25,
    instructions: 'Stand tall with core braced, curl bar upward to shoulder height without swinging body.',
    cues: ['Keep elbows tucked at ribs', 'Resist downward phase for 3 seconds'],
    alternatives: ['incline-db-curl', 'hammer-curl']
  },
  {
    id: 'hammer-curl',
    name: 'Neutral-Grip Hammer Curl',
    muscleGroup: 'Biceps',
    category: 'Dumbbell',
    equipment: 'Dumbbell',
    secondaryMuscles: ['Brachialis', 'Forearms'],
    defaultSets: 3,
    defaultReps: 12,
    defaultWeightKg: 14,
    instructions: 'Palms facing each other, curl dumbbells upward focusing on forearm and brachialis thickness.',
    cues: ['No momentum or swaying', 'Adds arm width and grip strength'],
    alternatives: ['incline-db-curl', 'barbell-bicep-curl']
  },
  {
    id: 'tricep-pushdown',
    name: 'Tricep Rope Pushdown',
    muscleGroup: 'Triceps',
    category: 'Cable',
    equipment: 'Cable',
    secondaryMuscles: [],
    defaultSets: 3,
    defaultReps: 12,
    defaultWeightKg: 25,
    instructions: 'Pin elbows to your sides, push rope down and spread handles apart at bottom for full lockout.',
    cues: ['Lock out triceps with maximum tension', 'Keep upper arms completely static'],
    alternatives: ['skull-crushers', 'overhead-tricep-extension', 'dips']
  },
  {
    id: 'skull-crushers',
    name: 'EZ-Bar Skull Crushers',
    muscleGroup: 'Triceps',
    category: 'Barbell',
    equipment: 'Barbell',
    secondaryMuscles: [],
    defaultSets: 3,
    defaultReps: 10,
    defaultWeightKg: 30,
    instructions: 'Lie on bench, lower EZ-bar toward forehead/crown, extend elbows to press bar back up.',
    cues: ['Angling upper arms slightly back increases tricep long-head tension', 'Control the descent'],
    alternatives: ['tricep-pushdown', 'overhead-tricep-extension']
  },
  {
    id: 'overhead-tricep-extension',
    name: 'Cable Overhead Tricep Extension',
    muscleGroup: 'Triceps',
    category: 'Cable',
    equipment: 'Cable',
    secondaryMuscles: [],
    defaultSets: 3,
    defaultReps: 12,
    defaultWeightKg: 20,
    instructions: 'Facing away from cable, extend arms forward and overhead to target the long head in stretch.',
    cues: ['Deep stretch behind neck', 'Keep elbows pointed forward'],
    alternatives: ['tricep-pushdown', 'skull-crushers']
  },

  // ==================== CORE & CARDIO ====================
  {
    id: 'hanging-leg-raise',
    name: 'Hanging Leg Raises',
    muscleGroup: 'Core',
    category: 'Bodyweight',
    equipment: 'Bodyweight',
    secondaryMuscles: ['Hip Flexors', 'Forearms'],
    defaultSets: 3,
    defaultReps: 12,
    defaultWeightKg: 0,
    instructions: 'Hang from pull-up bar, curl pelvis upward toward chest, lower legs with slow control.',
    cues: ['Roll pelvis up to engage lower abs', 'Avoid swinging back and forth'],
    alternatives: ['cable-woodchoppers', 'plank-hold']
  },
  {
    id: 'cable-woodchoppers',
    name: 'High-to-Low Cable Woodchopper',
    muscleGroup: 'Core',
    category: 'Cable',
    equipment: 'Cable',
    secondaryMuscles: ['Obliques', 'Shoulders'],
    defaultSets: 3,
    defaultReps: 12,
    defaultWeightKg: 15,
    instructions: 'Rotate torso diagonally across body from high pulley to opposite hip, pivot back foot.',
    cues: ['Drive rotation through the torso/core, not just arms', 'Brace core at end range'],
    alternatives: ['hanging-leg-raise', 'plank-hold']
  },
  {
    id: 'zone2-cardio',
    name: 'Zone 2 Incline Treadmill Walk',
    muscleGroup: 'Cardio',
    category: 'Cardio',
    equipment: 'Cardio',
    secondaryMuscles: ['Calves', 'Cardiovascular'],
    defaultSets: 1,
    defaultReps: 30,
    defaultWeightKg: 0,
    instructions: '12% incline, 4.5 km/h, sustain nasal breathing at 120-135 BPM for mitochondrial health.',
    cues: ['Maintain steady rhythmic cadence', 'Do not hold onto treadmill handrails'],
    alternatives: ['rowing-intervals', 'air-bike-sprints']
  }
];

export interface WorkoutTemplate {
  id: string;
  category: 'All' | 'Starter' | 'Sweat Mode' | 'Strength';
  subtitle: string;
  title: string;
  intervals: number;
  durationMinutes: number;
  powerSurgeMinutes?: number;
  targetBpm: number;
  targetKcal: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  exerciseIds: string[];
}

export const PRESET_ROUTINE_TEMPLATES: WorkoutTemplate[] = [
  {
    id: 'push-day',
    category: 'Strength',
    subtitle: 'Chest & Delts',
    title: 'Push Power Hypertrophy',
    intervals: 18,
    durationMinutes: 45,
    powerSurgeMinutes: 30,
    targetBpm: 135,
    targetKcal: 410,
    level: 'Intermediate',
    exerciseIds: ['bench-press', 'incline-db-press', 'overhead-press', 'lateral-raise', 'tricep-pushdown']
  },
  {
    id: 'pull-day',
    category: 'Strength',
    subtitle: 'Back & Biceps',
    title: 'Pull Density & Posterior',
    intervals: 16,
    durationMinutes: 40,
    powerSurgeMinutes: 28,
    targetBpm: 130,
    targetKcal: 390,
    level: 'Intermediate',
    exerciseIds: ['barbell-deadlift', 'lat-pulldown', 'seated-cable-row', 'face-pulls', 'incline-db-curl']
  },
  {
    id: 'legs-day',
    category: 'Strength',
    subtitle: 'Quads & Hamstrings',
    title: 'Lower Body Kinetic Chain',
    intervals: 22,
    durationMinutes: 50,
    powerSurgeMinutes: 40,
    targetBpm: 145,
    targetKcal: 560,
    level: 'Advanced',
    exerciseIds: ['barbell-squat', 'romanian-deadlift', 'leg-press', 'leg-curl', 'hanging-leg-raise']
  },
  {
    id: 'upper-body',
    category: 'Strength',
    subtitle: 'Upper Armor',
    title: 'Upper Body Complete Split',
    intervals: 18,
    durationMinutes: 45,
    targetBpm: 135,
    targetKcal: 440,
    level: 'Intermediate',
    exerciseIds: ['bench-press', 'barbell-row', 'overhead-press', 'lat-pulldown', 'lateral-raise']
  },
  {
    id: 'starter-foundation',
    category: 'Starter',
    subtitle: 'Core Foundation',
    title: 'Full Body Primer 25m',
    intervals: 12,
    durationMinutes: 25,
    powerSurgeMinutes: 15,
    targetBpm: 125,
    targetKcal: 230,
    level: 'Beginner',
    exerciseIds: ['barbell-squat', 'bench-press', 'lat-pulldown', 'hanging-leg-raise']
  },
  {
    id: 'fat-melt-hiit',
    category: 'Sweat Mode',
    subtitle: 'Conditioning',
    title: 'Metabolic VO2 & Core Blast',
    intervals: 20,
    durationMinutes: 30,
    powerSurgeMinutes: 25,
    targetBpm: 155,
    targetKcal: 380,
    level: 'Intermediate',
    exerciseIds: ['zone2-cardio', 'hanging-leg-raise', 'barbell-squat', 'dips']
  }
];
