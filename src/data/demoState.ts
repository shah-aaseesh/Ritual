import { UserProfile, ShelfProduct, RoutineStep, ProgressEntry } from '../types';

export const DEMO_USER_PROFILE: UserProfile = {
  name: '',
  primaryGoal: 'hair_health',
  dailyTime: '5_min',
  alreadyOwnsProducts: false,
  isOnboarded: false,
  createdAt: new Date().toISOString()
};

export const DEMO_SHELF_PRODUCTS: ShelfProduct[] = [];

export const DEMO_ROUTINE_STEPS: RoutineStep[] = [];

export function getDemoProgressHistory(): ProgressEntry[] {
  return [];
}

export function getMissedAdherenceHistory(): ProgressEntry[] {
  return [];
}
