import { UserProfile, ShelfProduct, RoutineStep, ProgressEntry } from '../types';

export const DEMO_USER_PROFILE: UserProfile = {
  name: 'Aarav',
  primaryGoal: 'hair_health',
  dailyTime: '5_min',
  alreadyOwnsProducts: true,
  isOnboarded: true,
  createdAt: '2026-09-25T08:00:00.000Z'
};

export const DEMO_SHELF_PRODUCTS: ShelfProduct[] = [
  {
    id: 'shelf-prod-1',
    name: 'Follicle Reactivate 3% Redensyl Scalp Serum',
    brand: 'Apex Derma Lab',
    category: 'Hair',
    relevantGoal: 'hair_health',
    activeIngredients: ['Redensyl (3%)', 'Rosemary Leaf Oil (1%)', 'Biotin', 'Saw Palmetto', 'Panthenol'],
    evidenceSummary: 'Active biotech blend shown to support hair density when applied continuously for 84+ days.',
    evidenceTier: 'promising_limited',
    timeOfDay: 'evening',
    dateAdded: '2026-09-25',
    notes: 'Apply 1ml dropper to crown and parting before sleep.'
  },
  {
    id: 'shelf-prod-2',
    name: 'Clarify & Barrier 2% Salicylic Acid Body Wash',
    brand: 'DermaCure Body',
    category: 'Body',
    relevantGoal: 'body_care',
    activeIngredients: ['Salicylic Acid (2.0%)', 'Niacinamide (3.0%)', 'Ceramide NP', 'Centella Asiatica'],
    evidenceSummary: 'Lipophilic BHA for exfoliating clogged pores and smoothing back/chest acne.',
    evidenceTier: 'strong_evidence',
    timeOfDay: 'morning',
    dateAdded: '2026-09-26',
    notes: 'Leave lather on skin for 60 seconds during shower.'
  },
  {
    id: 'shelf-prod-3',
    name: 'Deep Rest Circadian Melatonin + Ashwagandha Tabs',
    brand: 'Somna Rest Labs',
    category: 'Sleep',
    relevantGoal: 'sleep_recovery',
    activeIngredients: ['Melatonin (3.0 mg)', 'KSM-66 Ashwagandha (300 mg)', 'Magnesium Bisglycinate (150 mg)', 'L-Theanine'],
    evidenceSummary: 'Neurohormone and adaptogen blend for shortening sleep latency and reducing cortisol.',
    evidenceTier: 'strong_evidence',
    timeOfDay: 'evening',
    dateAdded: '2026-09-27',
    notes: 'Take 45 minutes prior to bedtime.'
  }
];

export const DEMO_ROUTINE_STEPS: RoutineStep[] = [
  {
    id: 'demo-step-1',
    action: 'Morning Scalp Hydration & Gentle Finger Massage',
    shortExplanation: '2 minutes of circular scalp stimulation to prime microvascular blood flow to follicles.',
    estimatedMinutes: 2,
    timeOfDay: 'morning',
    isCompletedToday: true,
    isProductFreeHabit: true,
    category: 'hair'
  },
  {
    id: 'demo-step-2',
    action: 'Apply Broad-Spectrum Scalp & Hairline UV Shield',
    shortExplanation: 'Prevents oxidative photo-damage to exposed scalp partings and follicular melanin.',
    estimatedMinutes: 1,
    timeOfDay: 'morning',
    isCompletedToday: true,
    isProductFreeHabit: true,
    category: 'hair'
  },
  {
    id: 'demo-step-3',
    action: 'Apply Follicle Reactivate 3% Redensyl Scalp Serum',
    productId: 'shelf-prod-1',
    productName: 'Follicle Reactivate 3% Redensyl Scalp Serum',
    shortExplanation: 'Targeted leave-on active dropper applied along hairline and thinning crown areas.',
    estimatedMinutes: 2,
    timeOfDay: 'evening',
    isCompletedToday: false,
    isProductFreeHabit: false,
    category: 'hair'
  },
  {
    id: 'demo-step-4',
    action: 'Nightly Silk Pillowcase & Screen Dimming',
    shortExplanation: 'Minimizes friction breakage and supports circadian melatonin surge.',
    estimatedMinutes: 1,
    timeOfDay: 'evening',
    isCompletedToday: false,
    isProductFreeHabit: true,
    category: 'lifestyle'
  }
];

export function getDemoProgressHistory(): ProgressEntry[] {
  // 7 days of realistic progress data
  const days: ProgressEntry[] = [];
  const today = new Date();
  
  const sampleObservations = [
    'Noticed less scalp dryness after switching to lukewarm water.',
    'Serum absorbs cleanly without weighing down roots.',
    'Scalp massage felt soothing after a long screen-heavy workday.',
    'Consistency feels easy with the 5-minute schedule.',
    'Morning massage now feels like a natural habit.',
    'Remembered to apply serum right before winding down.',
    'Recorded steady adherence across the entire week.'
  ];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    
    // Vary completion rates: 1.0, 0.75, 1.0, 0.5, 1.0, 1.0, 0.5 (today)
    const isPast = i > 0;
    const completionRate = i === 6 ? 1.0 : i === 5 ? 0.75 : i === 4 ? 1.0 : i === 3 ? 0.5 : i === 2 ? 1.0 : i === 1 ? 1.0 : 0.5;
    const completedStepIds = completionRate >= 1.0 ? ['demo-step-1', 'demo-step-2', 'demo-step-3', 'demo-step-4'] : ['demo-step-1', 'demo-step-2'];

    days.push({
      id: `prog-${dateStr}`,
      date: dateStr,
      completedStepIds,
      totalSteps: 4,
      completionRate,
      mood: i % 2 === 0 ? 'great' : 'good',
      energy: i === 3 ? 'low' : 'high',
      observation: isPast ? sampleObservations[6 - i] : 'Completed morning scalp care and hydration.',
    });
  }

  return days;
}

export function getMissedAdherenceHistory(): ProgressEntry[] {
  // Simulates 3-4 missed days to trigger Routine Rescue
  const days: ProgressEntry[] = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    
    const isMissed = i >= 1 && i <= 3; // missed last 3 days
    const completionRate = isMissed ? 0.0 : i > 3 ? 0.75 : 0.25;
    
    days.push({
      id: `prog-missed-${dateStr}`,
      date: dateStr,
      completedStepIds: isMissed ? [] : ['demo-step-1'],
      totalSteps: 4,
      completionRate,
      mood: isMissed ? 'low' : 'neutral',
      energy: isMissed ? 'low' : 'medium',
      observation: isMissed ? 'Missed routine due to busy travel and late work hours.' : 'Managed quick morning hydration.',
    });
  }
  return days;
}
