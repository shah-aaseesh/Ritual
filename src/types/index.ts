export type WellnessGoal = 
  | 'hair_health' 
  | 'body_care' 
  | 'sleep_recovery';

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
  brand: 'Be Bodywise' | 'Man Matters' | 'Root Labs' | 'Little Joys';
  product: string;
  category: string;
  description: string;
  sitePrice: number;
  currency: string;
  officialUrl: string;
  whyItFits: string;
  keyIngredients: string[];
  targetGoal: WellnessGoal;
  timeOfDay: 'morning' | 'evening' | 'both';
}

export interface DuplicateIngredientAlert {
  ingredientName: string;
  productNames: string[];
  neutralMessage: string;
}
