import { MuscleGroup } from './index';

export type ShareCardType = 'workout' | 'protocol' | 'nutrition' | 'milestone';

export type ShareTheme = 
  | 'ember_flame'     // Intense Athletic Ember / Volcanic Orange with sleek topographic contours
  | 'mosaic_emerald'  // Deep obsidian & forest green, mint accents, gold badge
  | 'cyber_neon'      // Midnight black, neon radioactive lime & cyan glow
  | 'sunset_mirage'   // Violet-to-coral dusk gradient, warm energetic tones
  | 'clean_mono'      // Swiss minimal editorial, high-contrast monochrome
  | 'gold_champion';  // Luxury matte black & metallic champagne gold

export type ShareAspectRatio = 'post' | 'story' | 'square'; // 4:5, 9:16, 1:1

export type PhotoFilter = 'none' | 'dark_scrim' | 'contrast' | 'noir' | 'warm';

export interface ShareStatItem {
  label: string;
  value: string | number;
  unit?: string;
  highlight?: boolean;
}

export interface ShareCardData {
  type: ShareCardType;
  title: string;
  subtitle?: string;
  date?: string;
  userName?: string;
  primaryStat: {
    label: string;
    value: string | number;
    unit?: string;
  };
  secondaryStats: ShareStatItem[];
  badgeText?: string;
  tagline?: string;
  targetMuscles?: MuscleGroup[];
  highlightItems?: string[]; // e.g. ["Heavy Bench Press 85kg", "Incline DB 32kg"] or ["Morning Protocol", "Evening Protocol"]
  streakDays?: number;
  caloriesBurned?: number;
  personalRecord?: string;
  userCaption?: string;
  completionRate?: number; // 0 to 100
  
  // Screenshot & Photo Background Support
  backgroundImage?: string; // base64 or URL
  backgroundMode?: 'gradient' | 'photo_cover';
  photoFilter?: PhotoFilter;
  photoOpacity?: number; // 0.1 to 1.0
}
