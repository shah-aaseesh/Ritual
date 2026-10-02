export type WellnessGoal = 
  | 'hair_health' 
  | 'body_care' 
  | 'sleep_recovery';

export type HealthGoal = 
  | 'hypertrophy_strength' 
  | 'fat_loss_recomp' 
  | 'athletic_conditioning' 
  | 'longevity_health';

export type TrainingExperience = 'beginner' | 'intermediate' | 'advanced';

export type DailyTimeCommitment = '2_min' | '5_min' | '10_min';

export type EvidenceTier = 
  | 'strong_evidence' 
  | 'conditional_evidence' 
  | 'promising_limited' 
  | 'supporting_ingredient' 
  | 'insufficient_info';

export type ClaimVerdict = 
  | 'supported' 
  | 'partially_supported' 
  | 'too_vague_to_verify' 
  | 'marketing_heavy';

export interface UserProfile {
  name: string;
  age?: number;
  primaryGoal: WellnessGoal;
  healthGoal?: HealthGoal;
  trainingExperience?: TrainingExperience;
  dailyTime: DailyTimeCommitment;
  alreadyOwnsProducts: boolean;
  isOnboarded: boolean;
  createdAt: string;
}

export interface AISettings {
  enabled: boolean;
  provider: 'local' | 'openrouter';
  openRouterApiKey: string;
  selectedModel: string;
}

export interface IngredientInfo {
  id: string;
  name: string;
  aliases: string[];
  category: 'hair' | 'body' | 'sleep' | 'skin' | 'general';
  commonPurpose: string;
  evidenceTier: EvidenceTier;
  conditionsOrLimitations: string;
  doseMatters: boolean;
  shortExplanation: string;
  sourceUrl: string;
  sourceLabel: string;
  relevantGoals: WellnessGoal[];
}

export interface DetectedIngredient {
  ingredient: IngredientInfo;
  rawTextMatch: string;
  relevanceToGoal: 'high' | 'moderate' | 'supporting' | 'general';
  doesLabelDiscloseDose: boolean;
  explanation: string;
}

export interface ClaimInfo {
  id: string;
  claimPattern: string;
  displayName: string;
  whatItMeans: string;
  verdict: ClaimVerdict;
  missingInformation: string;
  supportRationale: string;
}

export interface LabelAnalysisSummary {
  goalRelevanceScore: 'High' | 'Moderate' | 'Low';
  goalRelevanceDescription: string;
  evidenceQualityScore: 'Strong' | 'Mixed' | 'Limited' | 'Insufficient';
  evidenceQualityDescription: string;
  doseTransparencyScore: 'Transparent' | 'Partially Disclosed' | 'Undisclosed';
  doseTransparencyDescription: string;
  claimCredibilityScore: 'Credible' | 'Moderate' | 'Marketing-Heavy';
  claimCredibilityDescription: string;
  synthesisText: string;
}

export interface ProductAnalysisResult {
  productName: string;
  brand?: string;
  category: string;
  rawIngredientText: string;
  rawClaimText?: string;
  detectedIngredients: DetectedIngredient[];
  unmatchedIngredients: string[];
  detectedClaims: ClaimInfo[];
  summary: LabelAnalysisSummary;
  timestamp: string;
}

export interface OnboardingProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  ingredientImage?: string;
  ingredientText: string;
  claimImage?: string;
  claimText: string;
  ingredientAnalysis?: ProductAnalysisResult;
  matchedMosaic?: MosaicProduct[];
}

export interface ShelfProduct {
  id: string;
  name: string;
  brand: string;
  category: 'Hair' | 'Body' | 'Sleep' | 'Face' | 'General';
  relevantGoal: WellnessGoal;
  activeIngredients: string[];
  evidenceSummary: string;
  evidenceTier: EvidenceTier;
  timeOfDay: 'morning' | 'evening' | 'both';
  dateAdded: string;
  officialUrl?: string;
  notes?: string;
}

export interface RoutineStep {
  id: string;
  action: string;
  productId?: string;
  productName?: string;
  shortExplanation: string;
  estimatedMinutes: number;
  timeOfDay: 'morning' | 'evening';
  isCompletedToday: boolean;
  isProductFreeHabit?: boolean;
  category?: 'hair' | 'body' | 'sleep' | 'lifestyle';
}

export interface ProgressEntry {
  id: string;
  date: string; // YYYY-MM-DD
  completedStepIds: string[];
  totalSteps: number;
  completionRate: number; // 0 to 1
  mood?: 'great' | 'good' | 'neutral' | 'low' | 'stressed';
  energy?: 'high' | 'medium' | 'low';
  observation?: string;
  photoUrl?: string; // local base64 thumbnail
}

export interface MosaicProduct {
  id: string;
  brand: 'Be Bodywise' | 'Man Matters' | 'Root Labs' | 'Little Joys' | string;
  product: string;
  category: string;
  description: string;
  sitePrice: number;
  currency: string;
  officialUrl: string;
  imageUrl?: string;
  whyItFits: string;
  keyIngredients: string[];
  targetGoal: WellnessGoal;
  timeOfDay: 'morning' | 'evening' | 'both';
  clinicalAdvantage?: string;
  bioavailabilityRating?: string;
  potencyBadge?: string;
}

export interface DuplicateIngredientAlert {
  ingredientName: string;
  productNames: string[];
  neutralMessage: string;
}

// ============================================================================
// GYM & WORKOUT SUITE TYPES
// ============================================================================
export type MuscleGroup = 'Chest' | 'Back' | 'Quads' | 'Hamstrings' | 'Shoulders' | 'Biceps' | 'Triceps' | 'Core' | 'Cardio';

export interface WorkoutSet {
  id: string;
  setNumber: number;
  weightKg: number;
  reps: number;
  isCompleted: boolean;
  isPersonalRecord?: boolean;
}

export interface ExerciseLog {
  id: string;
  exerciseId: string;
  exerciseName: string;
  muscleGroup: MuscleGroup;
  sets: WorkoutSet[];
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string;
  durationMinutes: number;
  exercises: ExerciseLog[];
  totalVolumeKg: number;
  totalSets: number;
  notes?: string;
}

// ============================================================================
// NUTRITION & CALORIE SUITE TYPES
// ============================================================================
export type MealCategory = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

export interface FoodItem {
  id: string;
  name: string;
  servingSize: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG?: number;
  brand?: string;
  category?: string;
}

export interface FoodLogEntry {
  id: string;
  date: string; // YYYY-MM-DD
  meal: MealCategory;
  food: FoodItem;
  quantity: number; // multiplier
}

export interface DailyMacroTarget {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  waterMl: number;
}

// ============================================================================
// HEALTH DOCUMENT STORE & AI REPORT ANALYZER TYPES
// ============================================================================
export type DocumentCategory = 'blood_test' | 'prescription' | 'dxa_scan' | 'lipid_profile' | 'general';

export interface BiomarkerResult {
  id: string;
  name: string;
  value: number | string;
  unit: string;
  referenceRange: string;
  status: 'optimal' | 'borderline' | 'high' | 'low';
  category: 'Metabolic' | 'Lipid' | 'Hormonal' | 'Vitamin & Mineral' | 'Organ Function';
  impactExplanation: string;
}

export interface HealthDocument {
  id: string;
  title: string;
  category: DocumentCategory;
  uploadDate: string;
  fileSizeText?: string;
  previewUrl?: string;
  doctorOrLab?: string;
  biomarkers?: BiomarkerResult[];
  aiAnalysis?: {
    summary: string;
    keyFindings: string[];
    actionableDietAdvice: string[];
    actionableWorkoutAdvice: string[];
    recommendedSupplementIds: string[];
  };
}

