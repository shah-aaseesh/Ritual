import { INGREDIENTS_DATABASE, findIngredientMatch } from './src/data/ingredientsDb.ts';
import { KNOWN_CLAIMS, detectClaimsInText } from './src/data/claimsDb.ts';
import { SAMPLE_PRODUCTS } from './src/data/sampleProducts.ts';
import { MOSAIC_PRODUCTS_CATALOG } from './src/data/mosaicProducts.ts';
import { analyzeLabelText } from './src/services/analyzer.ts';
import { generateRoutineFromProfile, generateRoutineRescue } from './src/services/routineGenerator.ts';
import { DEMO_USER_PROFILE, DEMO_SHELF_PRODUCTS, DEMO_ROUTINE_STEPS, getDemoProgressHistory, getMissedAdherenceHistory } from './src/data/demoState.ts';

console.log('--- Starting Ritual Automated Test Suite ---');

let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failedTests++;
  }
}

// 1. Evidence Database Tests
console.log('\n[1. Testing Evidence Database]');
assert(INGREDIENTS_DATABASE.length >= 20, `Database has ${INGREDIENTS_DATABASE.length} ingredients (>= 20 required)`);
assert(INGREDIENTS_DATABASE.every(i => i.name && i.commonPurpose && i.evidenceTier && i.sourceUrl), 'All ingredients have complete evidence fields and PubMed source links');

const testMatch = findIngredientMatch('Rosmarinus Officinalis');
assert(testMatch !== undefined && testMatch.id === 'rosemary_oil', 'Alias matching resolves Rosmarinus Officinalis to Rosemary');

// 2. Claims Database Tests
console.log('\n[2. Testing Claims Database & Regex Engine]');
assert(KNOWN_CLAIMS.length >= 8, `Known claims registry has ${KNOWN_CLAIMS.length} entries`);
const detectedClaims = detectClaimsInText('This cream is 100% natural, clinically proven and chemical-free with detox action.');
assert(detectedClaims.length >= 4, `Detected ${detectedClaims.length} claims from packaging copy`);
assert(detectedClaims.some(c => c.id === 'clinically_proven'), 'Recognized "clinically proven"');
assert(detectedClaims.some(c => c.id === 'chemical_free' && c.verdict === 'marketing_heavy'), 'Classified "chemical-free" as marketing-heavy verdict');

// 3. Sample Products & Analyzer Tests
console.log('\n[3. Testing Label Lens 4-Dimension Analyzer]');
SAMPLE_PRODUCTS.forEach(sample => {
  const result = analyzeLabelText(sample.ingredientLabelText, sample.frontLabelText, sample.goal, sample.name);
  assert(result.detectedIngredients.length > 0, `Sample "${sample.name}" identified ${result.detectedIngredients.length} recognized actives`);
  assert(result.summary.goalRelevanceScore !== undefined, `Calculated Goal Relevance: ${result.summary.goalRelevanceScore}`);
  assert(result.summary.evidenceQualityScore !== undefined, `Calculated Evidence Quality: ${result.summary.evidenceQualityScore}`);
  assert(result.summary.doseTransparencyScore !== undefined, `Calculated Dose Transparency: ${result.summary.doseTransparencyScore}`);
  assert(result.summary.claimCredibilityScore !== undefined, `Calculated Claim Credibility: ${result.summary.claimCredibilityScore}`);
  assert(result.summary.synthesisText.length > 20, `Generated synthesis paragraph: "${result.summary.synthesisText}"`);
});

// 4. Routine Generator Tests
console.log('\n[4. Testing Routine Builder & Routine Rescue]');
const generatedRoutine = generateRoutineFromProfile('hair_health', '5_min', DEMO_SHELF_PRODUCTS);
assert(generatedRoutine.length >= 3, `Generated ${generatedRoutine.length} routine steps`);
assert(generatedRoutine.some(s => s.timeOfDay === 'morning'), 'Contains morning step');
assert(generatedRoutine.some(s => s.timeOfDay === 'evening'), 'Contains evening step');
assert(generatedRoutine.some(s => s.isProductFreeHabit), 'Includes non-commercial habit step');

// Routine Rescue test
const rescue = generateRoutineRescue('hair_health', generatedRoutine);
assert(rescue.length <= 2, `Rescue generated ${rescue.length} steps (<= 2 required)`);
const totalRescueTime = rescue.reduce((acc, curr) => acc + curr.estimatedMinutes, 0);
assert(totalRescueTime <= 5, `Total rescue routine time is ${totalRescueTime} min (<= 5 min required)`);

// 5. Mosaic Catalog Integration Tests
console.log('\n[5. Testing Brand-Neutral Mosaic Catalog]');
assert(MOSAIC_PRODUCTS_CATALOG.length >= 5, `Mosaic catalog has ${MOSAIC_PRODUCTS_CATALOG.length} verified products`);
assert(MOSAIC_PRODUCTS_CATALOG.every(p => p.officialUrl && p.whyItFits), 'All Mosaic products have official URLs and objective scientific fit reasons');

// 6. Progress & Demo State Tests
console.log('\n[6. Testing Progress History & Demo States]');
const demoHistory = getDemoProgressHistory();
assert(demoHistory.length === 7, `Demo progress history has 7 days of entries`);
const missedHistory = getMissedAdherenceHistory();
assert(missedHistory.filter(h => h.completionRate < 0.3).length >= 3, 'Missed history simulates low adherence to trigger Routine Rescue');

console.log(`\n=== Test Summary: ${passedTests} passed, ${failedTests} failed ===`);
if (failedTests > 0) process.exit(1);
