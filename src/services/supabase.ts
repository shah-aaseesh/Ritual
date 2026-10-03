import { createClient } from '@supabase/supabase-js';
import { UserProfile, RoutineStep, WorkoutSession, ProgressEntry } from '../types';

export const SUPABASE_URL = ((import.meta as any).env?.VITE_SUPABASE_URL as string) || 'https://pppdmgcsgaoohhaoekit.supabase.co';
export const SUPABASE_ANON_KEY = ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwcGRtZ2NzZ2Fvb2hoYW9la2l0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEwMDkxMjIsImV4cCI6MjEwNjU4NTEyMn0.HDf68VwGddh2V9N4SGD62kWUwLG1jl4wsRjNCF4JY3Q';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Sync user profile to Supabase
 */
export async function syncProfileToSupabase(profile: UserProfile): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: 'default_user',
        name: profile.name,
        email: profile.email,
        age: profile.age,
        gender: profile.gender,
        height_feet: profile.heightFeet,
        height_inches: profile.heightInches,
        weight_kg: profile.weightKg,
        bmi: profile.bmi,
        bmi_category: profile.bmiCategory,
        bmr: profile.bmr,
        maintenance_calories: profile.maintenanceCalories,
        protein_target_g: profile.weightKg ? Math.round(profile.weightKg * 2.0) : 140,
        is_onboarded: profile.isOnboarded,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.warn('Supabase profile sync warning:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase offline fallback:', err);
    return false;
  }
}

/**
 * Fetch user profile from Supabase
 */
export async function fetchProfileFromSupabase(): Promise<Partial<UserProfile> | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', 'default_user')
      .single();

    if (error || !data) return null;

    return {
      name: data.name,
      email: data.email,
      age: data.age,
      gender: data.gender,
      heightFeet: data.height_feet,
      heightInches: data.height_inches,
      weightKg: data.weight_kg,
      bmi: data.bmi,
      bmiCategory: data.bmi_category,
      bmr: data.bmr,
      maintenanceCalories: data.maintenance_calories,
      isOnboarded: data.is_onboarded
    };
  } catch (err) {
    return null;
  }
}

/**
 * Sync routine steps to Supabase
 */
export async function syncRoutineStepsToSupabase(steps: RoutineStep[]): Promise<boolean> {
  try {
    if (!steps || steps.length === 0) return true;

    const payload = steps.map((s, idx) => ({
      id: s.id,
      user_id: 'default_user',
      pillar: s.category || 'wellness',
      action: s.action,
      product_name: s.productName || null,
      time_of_day: s.timeOfDay,
      scientific_rationale: s.shortExplanation || null,
      is_completed_today: s.isCompletedToday,
      order_index: idx,
      created_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('routine_steps')
      .upsert(payload);

    if (error) {
      console.warn('Supabase routine steps sync warning:', error);
      return false;
    }
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Sync workout session to Supabase
 */
export async function saveWorkoutToSupabase(session: WorkoutSession): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('workout_sessions')
      .upsert({
        id: session.id,
        user_id: 'default_user',
        date: session.date,
        title: session.title,
        duration_minutes: session.durationMinutes,
        total_volume_kg: session.totalVolumeKg,
        total_sets: session.totalSets,
        exercises: session.exercises,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.warn('Supabase workout sync error:', error);
      return false;
    }
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Sync daily progress entry to Supabase
 */
export async function saveProgressEntryToSupabase(entry: ProgressEntry): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('progress_entries')
      .upsert({
        id: entry.id,
        user_id: 'default_user',
        date: entry.date,
        completion_rate: entry.completionRate,
        total_steps: entry.totalSteps,
        completed_step_ids: entry.completedStepIds,
        notes: entry.observation || '',
        created_at: new Date().toISOString()
      });

    if (error) {
      console.warn('Supabase progress entry sync error:', error);
      return false;
    }
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Sync nutrition / calorie logs to Supabase
 */
export async function saveNutritionLogToSupabase(date: string, foodItems: any[], macros: { calories: number; proteinG: number; carbsG: number; fatG: number; waterMl: number }): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('nutrition_logs')
      .upsert({
        id: `nutrition-${date}`,
        user_id: 'default_user',
        date,
        food_items: foodItems,
        calories: macros.calories,
        protein_g: macros.proteinG,
        carbs_g: macros.carbsG,
        fat_g: macros.fatG,
        water_ml: macros.waterMl,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.warn('Supabase nutrition sync error:', error);
      return false;
    }
    return true;
  } catch (err) {
    return false;
  }
}
