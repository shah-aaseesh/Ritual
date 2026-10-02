import { WellnessGoal } from '../types';

export interface SampleProductLabel {
  id: string;
  name: string;
  brandSuggestion: string;
  category: string;
  goal: WellnessGoal;
  shortDesc: string;
  frontLabelText: string;
  ingredientLabelText: string;
  suggestedClaims: string[];
  bannerBadge: string;
  debunkHighlight?: string;
}

export const SAMPLE_PRODUCTS: SampleProductLabel[] = [
  {
    id: 'sample_hair_serum',
    name: 'Follicle Reactivate 3% Redensyl + Rosemary Scalp Serum',
    brandSuggestion: 'Apex Derma Lab',
    category: 'Hair Care',
    goal: 'hair_health',
    shortDesc: 'Multi-active clinical formulation with transparent active concentrations.',
    bannerBadge: 'Verified Clinical Strength',
    frontLabelText: 'FOLLICLE REACTIVATE • 3% REDENSYL + 1% ROSEMARY • CLINICALLY PROVEN • 100% CLEAN FORMULATION • ADVANCED FORMULA • DERMATOLOGIST TESTED',
    ingredientLabelText: 'Aqua/Water, Propanediol, Redensyl 3% (Dihydroquercetin-Glucoside, Glycine, Zinc Chloride), Rosmarinus Officinalis (Rosemary) Leaf Oil 1%, Biotin (Vitamin B7), Saw Palmetto Berry Extract, Caffeine Anhydrous, Panthenol (Pro-Vitamin B5), Zinc PCA, Tocopheryl Acetate (Vitamin E), Phenoxyethanol, Ethylhexylglycerin.',
    suggestedClaims: ['Clinically Proven', 'Clean', 'Advanced Formula', 'Dermatologist Tested'],
    debunkHighlight: 'Verified: 3% Redensyl matches clinical efficacy trials for anagen phase follicle stimulation.'
  },
  {
    id: 'sample_onion_fairy_dust',
    name: 'Miracle 10x Red Onion Hair Growth Oil',
    brandSuggestion: 'Botanica Herbal Labs',
    category: 'Hair Care',
    goal: 'hair_health',
    shortDesc: 'Marketing-heavy traditional oil featuring extreme claims vs carrier oil base.',
    bannerBadge: 'Fairy Dusting Alert (Busted)',
    frontLabelText: 'MIRACLE 10X ONION OIL • 100% CHEMICAL-FREE • REGROWS BALD PATCHES IN 14 DAYS • 100% ORGANIC • NO TOXINS • AYURVEDIC DOCTOR RECOMMENDED',
    ingredientLabelText: 'Mineral Oil (Paraffinum Liquidum 92%), Isopropyl Myristate, Fragrance (Parfum), Allium Cepa (Red Onion) Seed Extract 0.05%, Argania Spinosa Kernel Oil 0.01%, Tocopheryl Acetate, BHT, CI 26100.',
    suggestedClaims: ['Chemical-Free', 'Organic', 'Doctor Recommended', 'Clean'],
    debunkHighlight: 'BUSTED: 92% Mineral oil carrier; Onion extract is below 0.05% (placed after artificial fragrance). "Chemical-free" is scientifically impossible.'
  },
  {
    id: 'sample_body_wash',
    name: 'Clarify & Barrier 2% Salicylic Acid Exfoliating Wash',
    brandSuggestion: 'DermaCure Body',
    category: 'Body Care',
    goal: 'body_care',
    shortDesc: 'BHA clarifying cleanser for back/chest bumps and strawberry legs.',
    bannerBadge: 'Therapeutic Dose Verified',
    frontLabelText: 'CLARIFY & BARRIER 2% BHA BODY CLEANSER • DEEP DETOX • CHEMICAL-FREE BOTANICALS • DERMATOLOGIST TESTED • DOCTOR RECOMMENDED',
    ingredientLabelText: 'Water (Aqua), Sodium Cocoyl Glycinate, Salicylic Acid (2.0% BHA), Niacinamide (Vitamin B3 3%), Glycolic Acid (AHA 1%), Ceramide NP, Centella Asiatica (Cica) Leaf Extract, Sodium Hyaluronate (Hyaluronic Acid), Glycerin, Zinc PCA, Phenoxyethanol, Citric Acid.',
    suggestedClaims: ['Detox', 'Chemical-Free', 'Dermatologist Tested', 'Doctor Recommended'],
    debunkHighlight: 'Mixed Verdict: Contains verified 2% Salicylic Acid & 3% Niacinamide, but "Deep Detox" & "Chemical-Free" are marketing buzzwords.'
  },
  {
    id: 'sample_collagen_drink',
    name: 'Instant Wrinkle Eraser Collagen & Glutathione Elixir',
    brandSuggestion: 'GlowMatrix Nutra',
    category: 'Skin Care',
    goal: 'body_care',
    shortDesc: 'High-sugar beauty beverage claiming transdermal cellular wrinkle erasure.',
    bannerBadge: 'Pseudoscience Claim Alert',
    frontLabelText: 'INSTANT WRINKLE ERASER • 10,000MG COLLAGEN • AGE REVERSAL IN 7 DAYS • 100% NATURAL BIO-ACTIVE • CELLULAR REPROGRAMMING',
    ingredientLabelText: 'High Fructose Corn Syrup, Water, Hydrolyzed Gelatin (Bovine Collagen 2g), Citric Acid, Artificial Berry Flavor, Sodium Benzoate, Sucralose, Glutathione 10mg, Ascorbic Acid (Vitamin C 20mg), Red 40.',
    suggestedClaims: ['Natural', 'Advanced Formula', 'Clinically Proven'],
    debunkHighlight: 'BUSTED: High-sugar syrup base; 10mg oral glutathione is degraded by stomach acid; "Age reversal in 7 days" violates biological collagen turnover rates (4-8 weeks).'
  },
  {
    id: 'sample_sleep_tabs',
    name: 'Deep Rest Circadian 3mg Melatonin + KSM-66 Tablets',
    brandSuggestion: 'Somna Rest Labs',
    category: 'Sleep & Recovery',
    goal: 'sleep_recovery',
    shortDesc: 'Neuro-calm nighttime blend for sleep latency and circadian reset.',
    bannerBadge: 'Clinical Strength Active',
    frontLabelText: 'DEEP REST CIRCADIAN TABLETS • 100% NATURAL • CLINICALLY BACKED • BOOSTS IMMUNITY • DOCTOR FORMULATED • RESTORATIVE SLEEP COMPLEX',
    ingredientLabelText: 'Melatonin (3.0 mg), Withania Somnifera (KSM-66 Ashwagandha Root Extract 300 mg), Magnesium Bisglycinate (150 mg elemental magnesium), L-Theanine (100 mg), Chamomile Flower Extract (Apigenin 50 mg), Valerian Root Extract, Microcrystalline Cellulose, Silicon Dioxide.',
    suggestedClaims: ['Natural', 'Clinically Proven', 'Boosts Immunity', 'Doctor Recommended'],
    debunkHighlight: 'Verified: Contains therapeutic 3mg Melatonin and standardized 300mg KSM-66 Ashwagandha for circadian synchronization.'
  }
];
