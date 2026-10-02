import { INGREDIENTS_DATABASE } from '../data/ingredientsDb';
import { detectClaimsInText } from '../data/claimsDb';
import { 
  WellnessGoal, 
  DetectedIngredient, 
  ClaimInfo, 
  LabelAnalysisSummary, 
  ProductAnalysisResult,
  EvidenceTier
} from '../types';
import { createWorker } from 'tesseract.js';

export const FUNCTIONAL_PATTERNS: { test: RegExp; name: string; tier: EvidenceTier; purpose: string; expl: string }[] = [
  { test: /aqua|water/i, name: 'Purified Water (Aqua)', tier: 'supporting_ingredient', purpose: 'Solvent & Delivery Vehicle', expl: 'Essential pharmaceutical-grade solvent carrier allowing dissolution and absorption of active ingredients.' },
  { test: /glycerin/i, name: 'Glycerin', tier: 'strong_evidence', purpose: 'Primary Biological Humectant', expl: 'Proven natural moisturizing factor (NMF) that binds water and prevents moisture loss.' },
  { test: /hyaluron|sodium hyaluronate/i, name: 'Sodium Hyaluronate (Hyaluronic Acid)', tier: 'strong_evidence', purpose: 'High-Molecular Humectant', expl: 'Holds up to 1000x its weight in water, providing multi-depth hydration and tissue plumping.' },
  { test: /panthenol|provitamin b5/i, name: 'Panthenol (Pro-Vitamin B5)', tier: 'strong_evidence', purpose: 'Barrier Repair & Conditioning', expl: 'Penetrates cellular matrix to enhance hydration, elasticity, and reduce transepidermal water loss.' },
  { test: /dimethicone|cyclomethicone|silicone/i, name: 'Dimethicone', tier: 'supporting_ingredient', purpose: 'Barrier Sealant & Texture Agent', expl: 'Breathable emollient that forms a non-comedogenic protective film preventing moisture evaporation.' },
  { test: /phenoxyethanol|ethylhexylglycerin/i, name: 'Phenoxyethanol', tier: 'supporting_ingredient', purpose: 'Antimicrobial Preservative', expl: 'Safe, globally approved preservative preventing microbial contamination.' },
  { test: /cetearyl alcohol|cetyl alcohol|stearyl alcohol/i, name: 'Cetearyl Alcohol', tier: 'supporting_ingredient', purpose: 'Fatty Alcohol Emollient & Stabilizer', expl: 'Non-drying plant-derived fatty alcohol that softens tissue and stabilizes emulsions.' },
  { test: /medium chain triglycerides|mct|caprylic|capric triglyceride/i, name: 'Medium Chain Triglycerides (MCT Oil)', tier: 'supporting_ingredient', purpose: 'Lipid Carrier & Bioavailability Enhancer', expl: 'Plant-derived lipid vehicle that solubilizes fat-soluble vitamins (such as Vitamin D2) to maximize gastrointestinal absorption.' },
  { test: /pectin|ins\s*440/i, name: 'Pectin (INS 440)', tier: 'supporting_ingredient', purpose: 'Plant-Based Gelling Matrix', expl: 'Natural plant fiber extracted from citrus peels and apples, providing 100% vegan chewable gummy texture without animal gelatin.' },
  { test: /beet\s*root|beta vulgaris/i, name: 'Beet Root Powder', tier: 'supporting_ingredient', purpose: 'Natural Colorant & Betalain Antioxidant', expl: 'Clean-label natural botanical pigment that provides vibrant color and gentle antioxidant polyphenols.' },
  { test: /maltodextrin/i, name: 'Maltodextrin', tier: 'supporting_ingredient', purpose: 'Texture Stabilizer & Carrier Matrix', expl: 'Plant-derived complex carbohydrate matrix that maintains physical integrity and uniform active ingredient dispersion.' },
  { test: /liquid glucose|glucose syrup|sugar|sucrose/i, name: 'Liquid Glucose & Sugar Base', tier: 'supporting_ingredient', purpose: 'Gummy Base Matrix & Sweetener', expl: 'Standard chewable gummy confectionery matrix providing structure, sweetness, and shelf-stability.' },
  { test: /ins\s*330|ins\s*331|acidity regulator|citric acid|sodium citrate/i, name: 'Acidity Regulators (Citric Acid & Sodium Citrate)', tier: 'supporting_ingredient', purpose: 'pH Buffering & Pectin Setting Agent', expl: 'Buffering salts that regulate acidity to activate pectin cross-linking for optimal gummy chewiness and fresh taste.' },
  { test: /natural flavour|natural flavoring|mango/i, name: 'Natural Mango Flavouring', tier: 'supporting_ingredient', purpose: 'Natural Botanical Aroma', expl: 'Food-grade natural flavor fractions ensuring pleasant palatability without artificial chemical flavorings.' },
  { test: /tocopherol|vitamin e/i, name: 'Tocopherol (Vitamin E)', tier: 'strong_evidence', purpose: 'Lipid-Soluble Antioxidant', expl: 'Protects cell membranes from lipid peroxidation and stabilizes active botanical oils.' },
  { test: /disodium edta|tetrasodium edta/i, name: 'Disodium EDTA', tier: 'supporting_ingredient', purpose: 'Chelating Agent', expl: 'Binds trace metal ions to prevent formula degradation and maintain chemical stability.' },
  { test: /centella|cica|madecassoside/i, name: 'Centella Asiatica (Cica)', tier: 'strong_evidence', purpose: 'Anti-Inflammatory & Wound Healing', expl: 'Rich in triterpenoids that calm redness, soothe micro-inflammation, and promote tissue synthesis.' },
  { test: /allantoin/i, name: 'Allantoin', tier: 'strong_evidence', purpose: 'Soothing & Keratolytic Agent', expl: 'Promotes cellular desquamation and epithelialization, calming irritated tissue.' },
  { test: /argan|argania/i, name: 'Argan Kernel Oil', tier: 'promising_limited', purpose: 'Nutritive Lipid Replenisher', expl: 'Rich in linoleic acid and oleic acid to lubricate hair shafts and seal damaged cuticle scales.' },
  { test: /jojoba|simmondsia/i, name: 'Jojoba Seed Oil', tier: 'promising_limited', purpose: 'Biomimetic Sebum Lipid', expl: 'Chemically resembles human sebum, regulating lipid balance without clogging follicles.' }
];

// Comprehensive regex for nutrition panel headers, packaging metadata, macros, and legal text to completely exclude
export const NON_INGREDIENT_FILTER_REGEX = /^(energy|calories|protein|carbohydrates?|total sugars?|added sugars?|fat|saturated fat|trans fat|cholesterol|sodium|potassium|chloride|dietary fiber|mrp|net qty|net quantity|batch|mfg|exp|best before|fssai|marketed|manufactured|trademark|feedback|email|call|phone|store below|store in|keep out|dosage|recommended|serving size|per serving|each gummy|each tablet|each capsule|not for medicinal|appropriate overages|icmr|rda|approx|ins\s*\d+|ins\b|contains\s+natural|qty\.?\s*per|nutritional|composition|loss on storage|not to be sold|unit sale price|for feedback|customercare)/i;

export function isPureIngredient(item: string): boolean {
  if (!item) return false;
  const trimmed = item.trim();
  if (trimmed.length < 2) return false;
  if (/^[0-9\W]+$/.test(trimmed)) return false;
  if (NON_INGREDIENT_FILTER_REGEX.test(trimmed)) return false;
  if (/^[a-z]['"]?$/i.test(trimmed)) return false;
  if (/^(z+|z'|zz|zzz)$/i.test(trimmed)) return false;
  return true;
}

export function sanitizeIngredientList(items: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of items) {
    const trimmed = item
      .replace(/^[^\w\(\)]+/g, '')
      .replace(/[^\w\(\)\.\s]+$/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!isPureIngredient(trimmed)) continue;

    const lower = trimmed.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      result.push(trimmed);
    }
  }

  return result;
}

const NUTRITION_IGNORE_PATTERNS = [
  NON_INGREDIENT_FILTER_REGEX,
  /nutritional information/i,
  /composition/i,
  /each gummy/i,
  /contains approx/i,
  /per serving/i,
  /serving size/i,
  /rda calculated/i,
  /icmr-nin/i,
  /rda values not/i,
  /appropriate overages/i,
  /not to be sold/i,
  /recommended usage/i,
  /loss on storage/i,
  /qty\.?\s*per serving/i,
  /rda limits/i,
  /%?\s*rda/i
];

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

  // Pre-extract doses from tabular format like "Chamomile Extract (mg) 10", "Melatonin (mg) 5.0", "Tart Cherry Extract (mg) 200", "Vitamin D2 (mcg) 15.0"
  const tableDoseMap = new Map<string, string>();
  const tableRegex = /([a-zA-Z0-9\s\-]+?)\s*\((mg|mcg|g|iu|%)\)\s*([\d\.]+)/gi;
  let match: RegExpExecArray | null;
  while ((match = tableRegex.exec(ingredientText)) !== null) {
    const rawIng = match[1].trim().toLowerCase();
    const unit = match[2];
    const val = match[3];
    tableDoseMap.set(rawIng, `${val} ${unit}`);
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
    
    // Check if this line is pure nutrition/packaging metadata
    const isIgnored = NUTRITION_IGNORE_PATTERNS.some(p => p.test(norm));
    let matched = false;

    // 1. Check primary clinical evidence database
    for (const dbItem of INGREDIENTS_DATABASE) {
      const nameMatch = norm.includes(dbItem.name.toLowerCase());
      const aliasMatch = dbItem.aliases.some(a => norm.includes(a.toLowerCase()));

      if (nameMatch || aliasMatch) {
        if (!detectedMap.has(dbItem.id)) {
          // Check dose in segment or from table map
          let hasDose = /\d+(\.\d+)?\s*(%|mg|mcg|g|ml|iu|w\/w)/i.test(segment);
          let doseText = '';
          for (const [tKey, tDose] of tableDoseMap.entries()) {
            if (tKey.includes(dbItem.name.toLowerCase()) || dbItem.aliases.some(a => tKey.includes(a.toLowerCase()))) {
              hasDose = true;
              doseText = tDose;
              break;
            }
          }

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
            rawTextMatch: doseText ? `${segment} (${doseText})` : segment,
            relevanceToGoal: relevance,
            doesLabelDiscloseDose: hasDose,
            explanation: generateIngredientExplanation(dbItem, hasDose, userGoal)
          });
        }
        matched = true;
        break;
      }
    }

    // 2. Check functional cosmetic/supplement/carrier patterns
    if (!matched && segment.length > 2) {
      for (const pattern of FUNCTIONAL_PATTERNS) {
        if (pattern.test.test(norm)) {
          const synthId = 'func-' + pattern.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
          if (!detectedMap.has(synthId)) {
            const hasDose = /\d+(\.\d+)?\s*(%|mg|mcg|g|ml|iu|w\/w)/i.test(segment);
            detectedMap.set(synthId, {
              ingredient: {
                id: synthId,
                name: pattern.name,
                aliases: [],
                category: 'general',
                commonPurpose: pattern.purpose,
                evidenceTier: pattern.tier,
                conditionsOrLimitations: 'Standard pharmaceutical / dietary formulation component.',
                doseMatters: false,
                shortExplanation: pattern.expl,
                sourceUrl: 'https://pubmed.ncbi.nlm.nih.gov/',
                sourceLabel: 'Pharmacopeia & Formulation Reference',
                relevantGoals: []
              },
              rawTextMatch: segment,
              relevanceToGoal: 'supporting',
              doesLabelDiscloseDose: hasDose,
              explanation: pattern.expl
            });
          }
          matched = true;
          break;
        }
      }
    }

    // 3. For any remaining specific ingredient (skip pure metadata / noise lines)
    if (!matched && !isIgnored && segment.length > 3 && !/^[0-9\s\.\-%:\(\)\/]+$/.test(segment) && !/^(and|with|for|the|or|contains|qty|not)$/i.test(segment.trim())) {
      const cleanName = segment.trim().replace(/^[\s•\-_,:]+|[\s•\-_,:]+$/g, '');
      const synthId = 'gen-' + cleanName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      if (cleanName.length > 2 && !detectedMap.has(synthId)) {
        const hasDose = /\d+(\.\d+)?\s*(%|mg|mcg|g|ml|iu|w\/w)/i.test(segment);
        detectedMap.set(synthId, {
          ingredient: {
            id: synthId,
            name: cleanName,
            aliases: [],
            category: 'general',
            commonPurpose: 'Formulation Component / Botanical',
            evidenceTier: 'supporting_ingredient',
            conditionsOrLimitations: 'Contributes to formulation texture, stability, or carrier delivery.',
            doseMatters: false,
            shortExplanation: `Formulation ingredient: ${cleanName}.`,
            sourceUrl: 'https://pubmed.ncbi.nlm.nih.gov/',
            sourceLabel: 'Formulation & INCI Dictionary',
            relevantGoals: []
          },
          rawTextMatch: segment,
          relevanceToGoal: 'general',
          doesLabelDiscloseDose: hasDose,
          explanation: `Functional formulation constituent in ${productName}. Contributes to product stability, texture, or carrier delivery.`
        });
      }
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
 * Converts a File or Blob into a Base64 data URL
 */
export function fileToBase64DataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

/**
 * Fully dynamic case-by-case OCR cleaner & formula parser
 * Evaluates whatever text is on the specific bottle without hardcoding lists or default units.
 */
export function cleanAndNormalizeOCRText(raw: string): string {
  if (!raw || raw.trim().length === 0) return '';

  const dynamicExtracted: string[] = [];
  const seenNames = new Set<string>();

  // Words that represent non-ingredient packaging metadata/macros to filter out
  const skipWords = /^(energy|protein|carbohydrate|carbohydrates|total sugar|added sugar|fat|saturated fat|trans fat|cholesterol|serving|gummy|per day|rda|net quantity|mrp|loss|feedback|email|visit|store below|batch)/i;

  // 1. Dynamic Table Row Parser: Matches plain text or Markdown tables "[Ingredient Name] (unit) [number]"
  // Plain text: "Chamomile Extract (mg) 10"
  // Markdown: "| **Chamomile Extract (mg)** | 10 |"
  const tableUnitRegex = /(?:\|\s*\*{0,2})?([a-zA-Z0-9\s\-]+?)\s*\(([a-zA-Z%]+)\)\*{0,2}\s*(?:\|\s*)?([\d\.]+)/g;
  let match: RegExpExecArray | null;

  while ((match = tableUnitRegex.exec(raw)) !== null) {
    let rawName = match[1].trim().replace(/^[^a-zA-Z]+/, '');
    // If the captured text has multiple words with noise at the front, take the valid constituent name
    const words = rawName.split(/\s+/).filter(w => w.length > 1);
    if (words.length > 4) {
      rawName = words.slice(-3).join(' ');
    } else {
      rawName = words.join(' ');
    }

    const unit = match[2].trim();
    const val = match[3].trim();

    if (rawName.length >= 2 && !skipWords.test(rawName)) {
      const lower = rawName.toLowerCase();
      if (!seenNames.has(lower)) {
        seenNames.add(lower);
        dynamicExtracted.push(`${rawName} (${val} ${unit})`);
      }
    }
  }

  // 2. Dynamic Dosage Parser: Matches any "[Ingredient Name] [number][unit]"
  // e.g. "Salicylic Acid 2%", "Redensyl 3%", "Biotin 5000mcg", "Zinc PCA 1%"
  const inlineDoseRegex = /([a-zA-Z0-9\s\-]+?)\s+(\d+(?:\.\d+)?)\s*(%|mg|mcg|g|ml|iu|w\/w)\b/gi;
  while ((match = inlineDoseRegex.exec(raw)) !== null) {
    let rawName = match[1].trim().replace(/^[^a-zA-Z]+/, '');
    const words = rawName.split(/\s+/).filter(w => w.length > 1);
    if (words.length > 4) {
      rawName = words.slice(-3).join(' ');
    } else {
      rawName = words.join(' ');
    }
    const val = match[2];
    const unit = match[3];

    if (rawName.length >= 3 && !skipWords.test(rawName)) {
      const lower = rawName.toLowerCase();
      if (!seenNames.has(lower)) {
        seenNames.add(lower);
        dynamicExtracted.push(`${rawName} (${val}${unit})`);
      }
    }
  }

  // 3. Dynamic "INGREDIENTS: ..." section parser
  const ingSectionMatch = raw.match(/ingredients?\s*[:\-]\s*([\s\S]+?)(?=\.|\n\n|contains\s+natural|mfg|batch|$)/i);
  if (ingSectionMatch && ingSectionMatch[1]) {
    const ingSection = ingSectionMatch[1];
    const tokens = ingSection.split(/[,;\n•·]/);
    for (const token of tokens) {
      const cleaned = token
        .replace(/^[^\w\(\)]+/g, '')
        .replace(/[^\w\(\)\.\s]+$/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      if (cleaned.length >= 3 && !/^[0-9\W]+$/.test(cleaned) && !skipWords.test(cleaned)) {
        const lower = cleaned.toLowerCase();
        const isDuplicate = Array.from(seenNames).some(seen => lower.includes(seen) || seen.includes(lower));
        if (!isDuplicate) {
          seenNames.add(lower);
          dynamicExtracted.push(cleaned);
        }
      }
    }
  }

  // If dynamic extraction found entries, return the strictly sanitized list
  if (dynamicExtracted.length > 0) {
    const sanitized = sanitizeIngredientList(dynamicExtracted);
    if (sanitized.length > 0) {
      return sanitized.join(', ');
    }
  }

  // Fallback: tokenize raw text, strip non-ingredient packaging lines, and sanitize
  const rawTokens = raw
    .replace(/[|—–_•·]/g, ',')
    .split(/[,;\n]/)
    .map(s => s.trim())
    .filter(s => isPureIngredient(s));

  const sanitizedFallback = sanitizeIngredientList(rawTokens);
  if (sanitizedFallback.length > 0) {
    return sanitizedFallback.join(', ');
  }

  return '';
}

/**
 * Preprocesses image on an HTML5 canvas to boost contrast, sharpness and readability
 */
export async function preprocessImageForOCR(imageSource: File | string): Promise<string> {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(typeof imageSource === 'string' ? imageSource : URL.createObjectURL(imageSource));
          return;
        }

        // Scale to standard optimal OCR width (~1600px)
        const targetWidth = Math.min(1800, Math.max(1200, img.width));
        const scale = targetWidth / img.width;
        canvas.width = targetWidth;
        canvas.height = img.height * scale;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Apply grayscale and contrast adjustment
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          // Grayscale luminance
          let gray = 0.299 * r + 0.587 * g + 0.114 * b;
          // Contrast stretch (1.25 factor)
          gray = (gray - 128) * 1.25 + 128;
          gray = Math.min(255, Math.max(0, gray));
          data[i] = gray;
          data[i + 1] = gray;
          data[i + 2] = gray;
        }
        ctx.putImageData(imgData, 0, 0);

        resolve(canvas.toDataURL('image/jpeg', 0.92));
      };
      img.onerror = () => {
        resolve(typeof imageSource === 'string' ? imageSource : URL.createObjectURL(imageSource));
      };

      if (typeof imageSource === 'string') {
        img.src = imageSource;
      } else {
        img.src = URL.createObjectURL(imageSource);
      }
    } catch (e) {
      resolve(typeof imageSource === 'string' ? imageSource : URL.createObjectURL(imageSource));
    }
  });
}

/**
 * Browser-based OCR extraction with Tesseract.js (with canvas contrast preprocessing)
 */
export async function performBrowserOCR(
  imageSource: File | string,
  onProgress?: (percent: number, status: string) => void
): Promise<string> {
  try {
    if (onProgress) onProgress(15, 'Optimizing image contrast & sharpness for label reading...');
    
    // Preprocess image on canvas
    const processedDataUrl = await preprocessImageForOCR(imageSource);

    if (onProgress) onProgress(35, 'Initializing local OCR worker...');
    const worker = await createWorker('eng');
    
    if (onProgress) onProgress(65, 'Analyzing label typography & chemical names...');
    const ret = await worker.recognize(processedDataUrl);
    
    if (onProgress) onProgress(90, 'Cleaning extracted typography...');
    await worker.terminate();
    
    const cleanedText = cleanAndNormalizeOCRText(ret.data.text || '');
    if (onProgress) onProgress(100, 'OCR Analysis Complete');
    
    return cleanedText;
  } catch (err) {
    console.error('OCR Error:', err);
    throw new Error('Image OCR could not extract text clearly. Please use manual paste or sample labels.');
  }
}
