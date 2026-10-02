import { INGREDIENTS_DATABASE } from '../data/ingredientsDb';
import { detectClaimsInText } from '../data/claimsDb';
import { 
  WellnessGoal, 
  DetectedIngredient, 
  ClaimInfo, 
  LabelAnalysisSummary, 
  ProductAnalysisResult 
} from '../types';
import { createWorker } from 'tesseract.js';

/**
 * Parses raw ingredient label text and matches against evidence database
 */
export function analyzeLabelText(
  ingredientText: string,
  frontClaimText: string = '',
  userGoal: WellnessGoal = 'hair_health',
  productName: string = 'Scanned Product'
): ProductAnalysisResult {
  if (!ingredientText || ingredientText.trim().length === 0) {
    return {
      productName,
      category: 'General',
      rawIngredientText: '',
      rawClaimText: frontClaimText,
      detectedIngredients: [],
      unmatchedIngredients: [],
      detectedClaims: detectClaimsInText(frontClaimText),
      summary: {
        goalRelevanceScore: 'Low',
        goalRelevanceDescription: 'No ingredient text provided for analysis.',
        evidenceQualityScore: 'Insufficient',
        evidenceQualityDescription: 'No ingredients detected.',
        doseTransparencyScore: 'Undisclosed',
        doseTransparencyDescription: 'No dosage metrics found.',
        claimCredibilityScore: 'Moderate',
        claimCredibilityDescription: 'No claims verified.',
        synthesisText: 'Please paste or scan an ingredient list to view scientific evidence.'
      },
      timestamp: new Date().toISOString()
    };
  }

  // Tokenize ingredient clauses by commas, semicolons, bullets, and line breaks
  const rawSegments = ingredientText
    .split(/[,;\n•·|]/)
    .map(s => s.trim())
    .filter(s => s.length > 2 && !/^(ingredients|contains|inactive ingredients|active ingredients):?$/i.test(s));

  const detectedMap = new Map<string, DetectedIngredient>();
  const unmatchedList: string[] = [];

  for (const segment of rawSegments) {
    const norm = segment.toLowerCase();
    let matched = false;

    for (const dbItem of INGREDIENTS_DATABASE) {
      const nameMatch = norm.includes(dbItem.name.toLowerCase());
      const aliasMatch = dbItem.aliases.some(a => norm.includes(a.toLowerCase()));

      if (nameMatch || aliasMatch) {
        if (!detectedMap.has(dbItem.id)) {
          // Check if dose is disclosed in this segment (e.g. "3%", "2.0% w/w", "300 mg", "5mg")
          const hasDose = /\d+(\.\d+)?\s*(%|mg|mcg|g|ml|iu|w\/w)/i.test(segment);
          
          // Determine goal relevance
          let relevance: 'high' | 'moderate' | 'supporting' | 'general' = 'general';
          if (dbItem.relevantGoals.includes(userGoal)) {
            relevance = (dbItem.evidenceTier === 'strong_evidence' || dbItem.evidenceTier === 'conditional_evidence') 
              ? 'high' 
              : 'moderate';
          } else if (dbItem.evidenceTier === 'supporting_ingredient') {
            relevance = 'supporting';
          }

          detectedMap.set(dbItem.id, {
            ingredient: dbItem,
            rawTextMatch: segment,
            relevanceToGoal: relevance,
            doesLabelDiscloseDose: hasDose,
            explanation: generateIngredientExplanation(dbItem, hasDose, userGoal)
          });
        }
        matched = true;
        break;
      }
    }

    if (!matched && segment.length > 3 && !/water|aqua|glycerin|fragrance|parfum|edta|benzoate|preservative/i.test(segment)) {
      unmatchedList.push(segment);
    }
  }

  const detectedIngredients = Array.from(detectedMap.values());
  
  // Also detect claims from both front claims text and ingredient text
  const combinedTextForClaims = `${frontClaimText} ${ingredientText}`;
  const detectedClaims: ClaimInfo[] = detectClaimsInText(combinedTextForClaims);

  // Compute 4 separate dimensions
  const summary = computeDimensionsSummary(detectedIngredients, detectedClaims, userGoal);

  // Infer category
  let category = 'General Wellness';
  if (detectedIngredients.some(d => d.ingredient.category === 'hair')) category = 'Hair Care';
  else if (detectedIngredients.some(d => d.ingredient.category === 'body')) category = 'Body Care';
  else if (detectedIngredients.some(d => d.ingredient.category === 'sleep')) category = 'Sleep & Recovery';

  return {
    productName,
    category,
    rawIngredientText: ingredientText,
    rawClaimText: frontClaimText,
    detectedIngredients,
    unmatchedIngredients: unmatchedList.slice(0, 6),
    detectedClaims,
    summary,
    timestamp: new Date().toISOString()
  };
}

function generateIngredientExplanation(dbItem: (typeof INGREDIENTS_DATABASE)[0], hasDose: boolean, userGoal: WellnessGoal): string {
  const isGoalDirect = dbItem.relevantGoals.includes(userGoal);
  let note = dbItem.shortExplanation;

  if (dbItem.doseMatters) {
    if (hasDose) {
      note += ' The label discloses concentration metrics, allowing review against clinical reference ranges.';
    } else {
      note += ' Clinical efficacy is dose-dependent, but this label omits specific percentage disclosure.';
    }
  }

  if (isGoalDirect) {
    note += ' Directly aligns with your primary wellness goal.';
  }

  return note;
}

function computeDimensionsSummary(
  detected: DetectedIngredient[], 
  claims: ClaimInfo[], 
  _userGoal: WellnessGoal
): LabelAnalysisSummary {
  const total = detected.length;
  const goalRelevant = detected.filter(d => d.relevanceToGoal === 'high' || d.relevanceToGoal === 'moderate');
  const strongEvidence = detected.filter(d => d.ingredient.evidenceTier === 'strong_evidence');
  const conditionalEvidence = detected.filter(d => d.ingredient.evidenceTier === 'conditional_evidence' || d.ingredient.evidenceTier === 'promising_limited');
  const disclosedDoses = detected.filter(d => d.doesLabelDiscloseDose);

  // 1. Goal Relevance
  let goalRelevanceScore: 'High' | 'Moderate' | 'Low' = 'Low';
  let goalRelevanceDescription = 'Few or no identified actives target your specific goal.';
  if (goalRelevant.length >= 2) {
    goalRelevanceScore = 'High';
    goalRelevanceDescription = `${goalRelevant.length} recognized actives directly address your current wellness objective.`;
  } else if (goalRelevant.length === 1) {
    goalRelevanceScore = 'Moderate';
    goalRelevanceDescription = '1 recognized active targets your goal; other ingredients serve supporting formulation roles.';
  }

  // 2. Evidence Quality
  let evidenceQualityScore: 'Strong' | 'Mixed' | 'Limited' | 'Insufficient' = 'Insufficient';
  let evidenceQualityDescription = 'Limited peer-reviewed literature exists for the detected ingredients.';
  if (strongEvidence.length >= 1 && conditionalEvidence.length >= 1) {
    evidenceQualityScore = 'Strong';
    evidenceQualityDescription = 'Formulation contains both gold-standard clinical actives and promising secondary agents.';
  } else if (strongEvidence.length >= 1) {
    evidenceQualityScore = 'Strong';
    evidenceQualityDescription = 'Key actives have extensive published human trial backing.';
  } else if (conditionalEvidence.length >= 1) {
    evidenceQualityScore = 'Mixed';
    evidenceQualityDescription = 'Actives show promise in clinical literature, though outcomes depend on regular adherence and individual response.';
  } else if (total > 0) {
    evidenceQualityScore = 'Limited';
    evidenceQualityDescription = 'Ingredients provide general formulation support without high-potency clinical evidence.';
  }

  // 3. Dose Transparency
  let doseTransparencyScore: 'Transparent' | 'Partially Disclosed' | 'Undisclosed' = 'Undisclosed';
  let doseTransparencyDescription = 'Active ingredient percentages are omitted or obscured in proprietary blends.';
  if (disclosedDoses.length >= 2) {
    doseTransparencyScore = 'Transparent';
    doseTransparencyDescription = `Exact concentrations are stated for ${disclosedDoses.length} key actives.`;
  } else if (disclosedDoses.length === 1) {
    doseTransparencyScore = 'Partially Disclosed';
    doseTransparencyDescription = 'One active concentration is disclosed; remaining actives appear in undisclosed ratios.';
  }

  // 4. Claim Credibility
  let claimCredibilityScore: 'Credible' | 'Moderate' | 'Marketing-Heavy' = 'Credible';
  let claimCredibilityDescription = 'No misleading or unscientific packaging claims detected.';
  const marketingHeavyClaims = claims.filter(c => c.verdict === 'marketing_heavy');
  const vagueClaims = claims.filter(c => c.verdict === 'too_vague_to_verify');

  if (marketingHeavyClaims.length > 0) {
    claimCredibilityScore = 'Marketing-Heavy';
    claimCredibilityDescription = `Found ${marketingHeavyClaims.length} unscientific marketing phrase(s) that lack clinical verifiability.`;
  } else if (vagueClaims.length > 0) {
    claimCredibilityScore = 'Moderate';
    claimCredibilityDescription = `Found ${vagueClaims.length} broad marketing claim(s) that cannot be fully verified from the label alone.`;
  }

  // Natural language synthesis
  const synthesisParts: string[] = [];
  if (goalRelevant.length > 0) {
    synthesisParts.push(`${goalRelevant.length} ${goalRelevant.length === 1 ? 'ingredient is' : 'ingredients are'} relevant to your goal.`);
  } else {
    synthesisParts.push('No primary actives directly target your selected wellness goal.');
  }

  if (strongEvidence.length > 0 && conditionalEvidence.length > 0) {
    synthesisParts.push(`${strongEvidence.length} has strong clinical trial evidence, while ${conditionalEvidence.length} depend on dose or continuous use.`);
  } else if (strongEvidence.length > 0) {
    synthesisParts.push(`${strongEvidence.length} ingredient has strong published evidence.`);
  } else if (conditionalEvidence.length > 0) {
    synthesisParts.push(`${conditionalEvidence.length} ingredients have promising but conditional evidence.`);
  }

  if (claims.length > 0) {
    const unverifiedCount = claims.filter(c => c.verdict !== 'supported').length;
    if (unverifiedCount > 0) {
      synthesisParts.push(`The label does not provide enough clinical data to verify ${unverifiedCount} packaging ${unverifiedCount === 1 ? 'claim' : 'claims'}.`);
    } else {
      synthesisParts.push('Front-label claims align reasonably with the recognized active ingredients.');
    }
  }

  const synthesisText = synthesisParts.join(' ');

  return {
    goalRelevanceScore,
    goalRelevanceDescription,
    evidenceQualityScore,
    evidenceQualityDescription,
    doseTransparencyScore,
    doseTransparencyDescription,
    claimCredibilityScore,
    claimCredibilityDescription,
    synthesisText
  };
}

/**
 * Browser-based OCR extraction with Tesseract.js
 */
export async function performBrowserOCR(
  imageSource: File | string,
  onProgress?: (percent: number, status: string) => void
): Promise<string> {
  try {
    if (onProgress) onProgress(10, 'Initializing OCR engine in browser...');
    
    const worker = await createWorker('eng');
    
    if (onProgress) onProgress(40, 'Analyzing label image contours...');
    
    const ret = await worker.recognize(imageSource);
    
    if (onProgress) onProgress(90, 'Parsing extracted typography...');
    
    await worker.terminate();
    
    if (onProgress) onProgress(100, 'OCR Complete');
    
    return ret.data.text || '';
  } catch (err) {
    console.error('OCR Error:', err);
    throw new Error('Image OCR could not extract text clearly. Please use manual paste or sample labels.');
  }
}
