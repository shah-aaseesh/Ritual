import { MosaicProduct } from '../types';

export const MOSAIC_PRODUCTS_CATALOG: MosaicProduct[] = [
  // --- HAIR HEALTH ---
  {
    id: 'mw-hair-01',
    brand: 'Be Bodywise',
    product: 'Advanced Hair Growth Serum (3% Redensyl + Procapil + Baicapil)',
    category: 'Hair Care',
    description: 'Leave-on aqueous scalp serum formulated for hair density and early follicular thinning.',
    sitePrice: 699,
    currency: '₹',
    officialUrl: 'https://bebodywise.com/product/advanced-hair-growth-serum',
    imageUrl: '/images/mosaic/mw-hair-01.jpg',
    whyItFits: 'Water-based non-greasy vehicle suitable for daily morning or evening scalp application without buildup.',
    keyIngredients: ['Redensyl', 'Procapil', 'Baicapil', 'Saw Palmetto'],
    targetGoal: 'hair_health',
    timeOfDay: 'both'
  },
  {
    id: 'mw-hair-02',
    brand: 'Man Matters',
    product: '1% Ketoconazole Anti-Dandruff Shampoo',
    category: 'Hair Care',
    description: 'Targeted scalp cleanser to manage Malassezia fungal overgrowth and scalp flaking.',
    sitePrice: 289,
    currency: '₹',
    officialUrl: 'https://manmatters.com/dp/1-ketoconazole-shampoo-100-ml/1144207',
    imageUrl: '/images/mosaic/mw-hair-02.jpg',
    whyItFits: 'Reduces micro-inflammation around follicle openings; recommended for 2–3x weekly use.',
    keyIngredients: ['Ketoconazole', 'Aloe Vera'],
    targetGoal: 'hair_health',
    timeOfDay: 'morning'
  },
  {
    id: 'mw-hair-03',
    brand: 'Man Matters',
    product: '0.5mm Scalp Activator Derma Roller',
    category: 'Hair Tools',
    description: 'Micro-needle mechanical tool to stimulate local blood flow and topical product delivery.',
    sitePrice: 274,
    currency: '₹',
    officialUrl: 'https://manmatters.com/dp/hair-activator-derma-roller/591102',
    imageUrl: '/images/mosaic/mw-hair-03.jpg',
    whyItFits: 'Promotes micro-vascularization when used gently 1–2 times per week before serum.',
    keyIngredients: ['Surgical Grade Titanium Micro-needles'],
    targetGoal: 'hair_health',
    timeOfDay: 'evening'
  },

  // --- BODY CARE ---
  {
    id: 'mw-body-01',
    brand: 'Be Bodywise',
    product: '1% Salicylic Acid Body Wash',
    category: 'Body Care',
    description: 'Gentle exfoliating body cleanser for managing clogged pores, back acne, and bumps.',
    sitePrice: 329,
    currency: '₹',
    officialUrl: 'https://bebodywise.com/product/1-salicylic-acid-body-wash',
    imageUrl: '/images/mosaic/mw-body-01.jpg',
    whyItFits: 'Provides lipophilic BHA exfoliation during your daily shower routine without requiring leave-on residue.',
    keyIngredients: ['Salicylic Acid (1%)', 'Chamomile Extract'],
    targetGoal: 'body_care',
    timeOfDay: 'morning'
  },
  {
    id: 'mw-body-02',
    brand: 'Be Bodywise',
    product: '10% Niacinamide Body Lotion with Aloe',
    category: 'Body Care',
    description: 'Lightweight post-shower hydrator to fade body blemishes and support lipid barrier.',
    sitePrice: 399,
    currency: '₹',
    officialUrl: 'https://bebodywise.com/product/niacinamide-body-lotion',
    imageUrl: '/images/mosaic/mw-body-02.jpg',
    whyItFits: 'Restores skin barrier hydration after exfoliation and helps even out post-inflammatory marks.',
    keyIngredients: ['Niacinamide (10%)', 'Aloe Vera', 'Glycerin'],
    targetGoal: 'body_care',
    timeOfDay: 'both'
  },
  {
    id: 'mw-body-03',
    brand: 'Be Bodywise',
    product: '10% AHA Body Scrub with Exfoliating Beads',
    category: 'Body Care',
    description: 'Targeted physical and chemical exfoliant for rough elbows, knees, and strawberry legs.',
    sitePrice: 369,
    currency: '₹',
    officialUrl: 'https://bebodywise.com/product/10-aha-body-scrub',
    imageUrl: '/images/mosaic/mw-body-03.jpg',
    whyItFits: 'Provides periodic 2x weekly chemical smoothing for dry keratin build-up.',
    keyIngredients: ['Glycolic Acid (AHA)', 'Lactic Acid', 'Walnut Shell Micro-granules'],
    targetGoal: 'body_care',
    timeOfDay: 'evening'
  },

  // --- SLEEP & RECOVERY ---
  {
    id: 'mw-sleep-01',
    brand: 'Be Bodywise',
    product: '5-in-1 Magnesium Glycinate Gummies (60N)',
    category: 'Sleep & Recovery',
    description: 'High-absorption chelated magnesium glycinate with Vitamin D3 to promote muscle relaxation and nocturnal recovery.',
    sitePrice: 599,
    currency: '₹',
    officialUrl: 'https://bebodywise.com/product/magnesium-glycinate-gummies-60n',
    imageUrl: '/images/mosaic/mw-sleep-01.jpg',
    whyItFits: 'Encourages GABAergic relaxation and reduces evening cortisol spikes 45 minutes before sleep.',
    keyIngredients: ['Magnesium Glycinate', 'Vitamin D3', 'L-Theanine'],
    targetGoal: 'sleep_recovery',
    timeOfDay: 'evening'
  },
  {
    id: 'mw-sleep-02',
    brand: 'Be Bodywise',
    product: '10% Magnesium Body Lotion (Muscle Recovery)',
    category: 'Recovery',
    description: 'Transdermal magnesium cream designed for tired muscles and evening relaxation massage.',
    sitePrice: 499,
    currency: '₹',
    officialUrl: 'https://bebodywise.com/product/10-magnesium-lotion-300ml',
    imageUrl: '/images/mosaic/mw-sleep-02.jpg',
    whyItFits: 'Non-oral soothing topical option to pair with evening wind-down massage.',
    keyIngredients: ['Magnesium Chloride (10%)', 'Lavender Oil', 'Shea Butter'],
    targetGoal: 'sleep_recovery',
    timeOfDay: 'evening'
  }
];

export const LITTLE_JOYS_PREVIEW = {
  brand: 'Little Joys',
  title: 'Future Family Profile Preview',
  subtitle: 'Clean nutrition & gentle care for toddlers and school-age kids',
  description: 'Ritual will soon support multi-profile household routines, including child-friendly daily nutrition (Ragi health mixes, Calcium gummies, DHA gummies).',
  sampleProducts: [
    { name: 'Calcium & Vit D3 Gummies', benefit: 'Bone & teeth development support' },
    { name: 'Nutri-Mix Daily Shake (Ragi + Bajra)', benefit: 'Clean whole-grain micronutrient support' },
    { name: 'Plant Protein & DHA Kids Powder', benefit: 'Cognitive & physical growth' }
  ]
};
