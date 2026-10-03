import { FoodItem, DailyMacroTarget } from '../types';

export const DEFAULT_MACRO_TARGETS: DailyMacroTarget = {
  calories: 2250,
  proteinG: 160,
  carbsG: 235,
  fatG: 65,
  waterMl: 3000
};

export const PRESET_FOODS: FoodItem[] = [
  // High Protein
  { id: 'f-1', name: 'Grilled Chicken Breast', servingSize: '150g', calories: 247, proteinG: 46, carbsG: 0, fatG: 5, category: 'Protein' },
  { id: 'f-2', name: 'Whey Protein Isolate Shake', servingSize: '1 scoop (32g)', calories: 120, proteinG: 27, carbsG: 1.5, fatG: 0.5, category: 'Supplements' },
  { id: 'f-3', name: 'Greek Yogurt (0% Fat)', servingSize: '200g', calories: 118, proteinG: 20, carbsG: 7, fatG: 0.8, category: 'Dairy' },
  { id: 'f-4', name: 'Whole Eggs (Boiled/Poached)', servingSize: '2 large eggs', calories: 144, proteinG: 12.6, carbsG: 0.8, fatG: 9.9, category: 'Protein' },
  { id: 'f-5', name: 'Paneer (Cottage Cheese)', servingSize: '100g', calories: 265, proteinG: 18, carbsG: 4, fatG: 20, category: 'Dairy' },
  { id: 'f-6', name: 'Tofu (Extra Firm)', servingSize: '150g', calories: 145, proteinG: 15, carbsG: 3, fatG: 8, category: 'Vegan' },
  { id: 'f-7', name: 'Salmon Fillet (Wild)', servingSize: '150g', calories: 280, proteinG: 34, carbsG: 0, fatG: 15, category: 'Seafood' },

  // Clean Carbs
  { id: 'f-8', name: 'Cooked Basmati / Brown Rice', servingSize: '1 bowl (180g)', calories: 230, proteinG: 4.8, carbsG: 50, fatG: 0.8, category: 'Grains' },
  { id: 'f-9', name: 'Rolled Oats with Water', servingSize: '60g dry', calories: 227, proteinG: 8, carbsG: 40, fatG: 4, fiberG: 6, category: 'Grains' },
  { id: 'f-10', name: 'Sweet Potato (Baked)', servingSize: '1 medium (150g)', calories: 135, proteinG: 2.5, carbsG: 31, fatG: 0.2, fiberG: 4, category: 'Veggies' },
  { id: 'f-11', name: 'Whole Wheat Roti / Flatbread', servingSize: '2 medium rotis', calories: 180, proteinG: 6, carbsG: 36, fatG: 1.5, category: 'Grains' },
  { id: 'f-12', name: 'Quinoa Bowl (Cooked)', servingSize: '185g', calories: 222, proteinG: 8, carbsG: 39, fatG: 3.6, category: 'Grains' },

  // Healthy Fats & Fruits
  { id: 'f-13', name: 'Raw Almonds & Walnuts', servingSize: '30g', calories: 185, proteinG: 5.5, carbsG: 5, fatG: 16, category: 'Nuts' },
  { id: 'f-14', name: 'Peanut Butter (Natural)', servingSize: '1 tbsp (32g)', calories: 190, proteinG: 8, carbsG: 7, fatG: 16, category: 'Nuts' },
  { id: 'f-15', name: 'Avocado', servingSize: '1/2 medium (100g)', calories: 160, proteinG: 2, carbsG: 8.5, fatG: 14.7, category: 'Fruits' },
  { id: 'f-16', name: 'Fresh Banana', servingSize: '1 medium', calories: 105, proteinG: 1.3, carbsG: 27, fatG: 0.3, category: 'Fruits' },
  { id: 'f-17', name: 'Blueberries & Strawberries', servingSize: '1 cup (150g)', calories: 65, proteinG: 1.1, carbsG: 15, fatG: 0.4, category: 'Fruits' }
];
