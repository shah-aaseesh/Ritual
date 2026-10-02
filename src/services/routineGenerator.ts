import { 
  WellnessGoal, 
  DailyTimeCommitment, 
  ShelfProduct, 
  RoutineStep 
} from '../types';

export function generateRoutineFromProfile(
  goal: WellnessGoal,
  dailyTime: DailyTimeCommitment,
  shelfProducts: ShelfProduct[] = []
): RoutineStep[] {
  const steps: RoutineStep[] = [];
  const maxMinutes = dailyTime === '2_min' ? 2 : dailyTime === '5_min' ? 5 : 10;

  // Identify matching products on shelf
  const hairProducts = shelfProducts.filter(p => p.relevantGoal === 'hair_health' || p.category === 'Hair');
  const bodyProducts = shelfProducts.filter(p => p.relevantGoal === 'body_care' || p.category === 'Body');
  const sleepProducts = shelfProducts.filter(p => p.relevantGoal === 'sleep_recovery' || p.category === 'Sleep');

  // --- GOAL: HAIR HEALTH ---
  if (goal === 'hair_health') {
    // Morning Steps
    steps.push({
      id: 'step-hair-am-1',
      action: 'Morning Scalp Hydration & Gentle Massage',
      shortExplanation: '2 minutes of fingertip scalp stimulation to support microvascular blood flow to hair follicles.',
      estimatedMinutes: 2,
      timeOfDay: 'morning',
      isCompletedToday: false,
      isProductFreeHabit: true,
      category: 'hair'
    });

    const morningSerum = hairProducts.find(p => p.timeOfDay === 'morning' || p.timeOfDay === 'both');
    if (morningSerum && maxMinutes >= 5) {
      steps.push({
        id: 'step-hair-am-2',
        action: `Apply ${morningSerum.name}`,
        productId: morningSerum.id,
        productName: morningSerum.name,
        shortExplanation: `Apply 1ml dropper to target thinning areas across crown and hairline.`,
        estimatedMinutes: 1,
        timeOfDay: 'morning',
        isCompletedToday: false,
        isProductFreeHabit: false,
        category: 'hair'
      });
    }

    // Evening Steps
    const eveningSerum = hairProducts.find(p => p.timeOfDay === 'evening' || p.timeOfDay === 'both') || morningSerum;
    if (eveningSerum) {
      steps.push({
        id: 'step-hair-pm-1',
        action: `Apply ${eveningSerum.name}`,
        productId: eveningSerum.id,
        productName: eveningSerum.name,
        shortExplanation: 'Leave-on active treatment during nocturnal resting cycle.',
        estimatedMinutes: 2,
        timeOfDay: 'evening',
        isCompletedToday: false,
        isProductFreeHabit: false,
        category: 'hair'
      });
    }

    if (maxMinutes >= 5) {
      steps.push({
        id: 'step-hair-pm-2',
        action: 'Nightly Silk/Satin Pillowcase & Gentle Detangling',
        shortExplanation: 'Minimizes friction breakage and physical tension on vulnerable hair shafts.',
        estimatedMinutes: 1,
        timeOfDay: 'evening',
        isCompletedToday: false,
        isProductFreeHabit: true,
        category: 'lifestyle'
      });
    }
  }

  // --- GOAL: BODY CARE ---
  else if (goal === 'body_care') {
    const bodyWash = bodyProducts.find(p => p.name.toLowerCase().includes('wash') || p.category === 'Body');
    const bodyLotion = bodyProducts.find(p => p.name.toLowerCase().includes('lotion') || p.name.toLowerCase().includes('cream'));

    // Morning Steps
    if (bodyWash) {
      steps.push({
        id: 'step-body-am-1',
        action: `Cleanse with ${bodyWash.name}`,
        productId: bodyWash.id,
        productName: bodyWash.name,
        shortExplanation: 'Allow BHA/active lather to sit on chest and back for 60 seconds before rinsing.',
        estimatedMinutes: 2,
        timeOfDay: 'morning',
        isCompletedToday: false,
        isProductFreeHabit: false,
        category: 'body'
      });
    } else {
      steps.push({
        id: 'step-body-am-1',
        action: 'Lukewarm Shower & Gentle Pat-Dry',
        shortExplanation: 'Avoid scalding water to preserve the skin’s natural lipid barrier matrix.',
        estimatedMinutes: 2,
        timeOfDay: 'morning',
        isCompletedToday: false,
        isProductFreeHabit: true,
        category: 'lifestyle'
      });
    }

    if (maxMinutes >= 5) {
      steps.push({
        id: 'step-body-am-2',
        action: 'Broad-Spectrum Body & Neck Sunscreen',
        shortExplanation: 'Protects exfoliating skin from post-inflammatory hyperpigmentation and UV degradation.',
        estimatedMinutes: 1,
        timeOfDay: 'morning',
        isCompletedToday: false,
        isProductFreeHabit: true,
        category: 'body'
      });
    }

    // Evening Steps
    if (bodyLotion) {
      steps.push({
        id: 'step-body-pm-1',
        action: `Moisturize with ${bodyLotion.name}`,
        productId: bodyLotion.id,
        productName: bodyLotion.name,
        shortExplanation: 'Lock in moisture on slightly damp skin to replenish ceramides and barrier lipids.',
        estimatedMinutes: 2,
        timeOfDay: 'evening',
        isCompletedToday: false,
        isProductFreeHabit: false,
        category: 'body'
      });
    } else {
      steps.push({
        id: 'step-body-pm-1',
        action: 'Evening Barrier Hydration & Moisture Seal',
        shortExplanation: 'Hydrate dry zones (elbows, knees, legs) to avoid nocturnal trans-epidermal water loss.',
        estimatedMinutes: 2,
        timeOfDay: 'evening',
        isCompletedToday: false,
        isProductFreeHabit: true,
        category: 'body'
      });
    }
  }

  // --- GOAL: SLEEP & RECOVERY ---
  else {
    const sleepTab = sleepProducts[0];

    // Morning Steps
    steps.push({
      id: 'step-sleep-am-1',
      action: '10-Minute Morning Sunlight Exposure',
      shortExplanation: 'Natural blue sunlight anchors circadian suprachiasmatic clock & regulates evening melatonin release.',
      estimatedMinutes: 2,
      timeOfDay: 'morning',
      isCompletedToday: false,
      isProductFreeHabit: true,
      category: 'lifestyle'
    });

    if (maxMinutes >= 10) {
      steps.push({
        id: 'step-sleep-am-2',
        action: 'Morning Rehydration & Caffeine Cutoff Schedule',
        shortExplanation: 'Drink 500ml water; ensure caffeine consumption stops 8 hours before intended sleep.',
        estimatedMinutes: 1,
        timeOfDay: 'morning',
        isCompletedToday: false,
        isProductFreeHabit: true,
        category: 'lifestyle'
      });
    }

    // Evening Steps
    if (sleepTab) {
      steps.push({
        id: 'step-sleep-pm-1',
        action: `Take ${sleepTab.name}`,
        productId: sleepTab.id,
        productName: sleepTab.name,
        shortExplanation: 'Take 45 minutes before sleep with half a glass of room-temperature water.',
        estimatedMinutes: 1,
        timeOfDay: 'evening',
        isCompletedToday: false,
        isProductFreeHabit: false,
        category: 'sleep'
      });
    }

    steps.push({
      id: 'step-sleep-pm-2',
      action: '30-Minute Screen Dimming & Relaxing Breathwork',
      shortExplanation: 'Reduces cortisol and retinal stimulation to prime natural melatonin production.',
      estimatedMinutes: 2,
      timeOfDay: 'evening',
      isCompletedToday: false,
      isProductFreeHabit: true,
      category: 'lifestyle'
    });
  }

  return steps;
}

export function generateRoutineRescue(goal: WellnessGoal, originalSteps: RoutineStep[]): RoutineStep[] {
  // Generates Minimum Viable Routine (MVR): 1 AM step (2 min) + 1 PM step (2-3 min), max 5 min total
  let amStep: RoutineStep | undefined = originalSteps.find(s => s.timeOfDay === 'morning');
  let pmStep: RoutineStep | undefined = originalSteps.find(s => s.timeOfDay === 'evening');

  if (!amStep) {
    amStep = {
      id: 'rescue-am',
      action: goal === 'hair_health' ? '1-Minute Morning Scalp Touch' : goal === 'body_care' ? 'Quick Morning Rinse & Hydrate' : '5-Minute Morning Window Sun',
      shortExplanation: 'A frictionless micro-habit to keep momentum alive.',
      estimatedMinutes: 2,
      timeOfDay: 'morning',
      isCompletedToday: false,
      isProductFreeHabit: true
    };
  } else {
    amStep = { ...amStep, estimatedMinutes: Math.min(amStep.estimatedMinutes, 2) };
  }

  if (!pmStep) {
    pmStep = {
      id: 'rescue-pm',
      action: goal === 'hair_health' ? 'Nightly Scalp Serum Drops' : goal === 'body_care' ? 'Target Spot Lotion' : 'Nightly Bedtime Breathwork',
      shortExplanation: 'The single most impactful nocturnal active habit.',
      estimatedMinutes: 3,
      timeOfDay: 'evening',
      isCompletedToday: false,
      isProductFreeHabit: false
    };
  } else {
    pmStep = { ...pmStep, estimatedMinutes: Math.min(pmStep.estimatedMinutes, 3) };
  }

  return [amStep, pmStep];
}
