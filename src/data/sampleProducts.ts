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
}

export const SAMPLE_PRODUCTS: SampleProductLabel[] = [
  {
    id: 'sample_hair_serum',
    name: 'Follicle Reactivate 3% Redensyl + Rosemary Scalp Serum',
    brandSuggestion: 'Apex Derma Lab',
    category: 'Hair Care',
    goal: 'hair_health',
    shortDesc: 'Multi-active topical serum formulated for hairline density & follicle awakening.',
    bannerBadge: 'Hair Wellness Sample',
    frontLabelText: 'FOLLICLE REACTIVATE • 3% REDENSYL + 1% ROSEMARY • CLINICALLY PROVEN • 100% CLEAN FORMULATION • ADVANCED FORMULA • DERMATOLOGIST TESTED',
    ingredientLabelText: 'Aqua/Water, Propanediol, Redensyl 3% (Dihydroquercetin-Glucoside, Glycine, Zinc Chloride), Rosmarinus Officinalis (Rosemary) Leaf Oil 1%, Biotin (Vitamin B7), Saw Palmetto Berry Extract, Caffeine Anhydrous, Panthenol (Pro-Vitamin B5), Zinc PCA, Tocopheryl Acetate (Vitamin E), Phenoxyethanol, Ethylhexylglycerin.',
    suggestedClaims: ['Clinically Proven', 'Clean', 'Advanced Formula', 'Dermatologist Tested']
  },
  {
    id: 'sample_body_wash',
    name: 'Clarify & Barrier 2% Salicylic Acid Exfoliating Wash',
    brandSuggestion: 'DermaCure Body',
    category: 'Body Care',
    goal: 'body_care',
    shortDesc: 'BHA clarifying cleanser for back/chest bumps and strawberry legs.',
    bannerBadge: 'Body Care Sample',
    frontLabelText: 'CLARIFY & BARRIER 2% BHA BODY CLEANSER • DEEP DETOX • CHEMICAL-FREE BOTANICALS • DERMATOLOGIST TESTED • DOCTOR RECOMMENDED',
    ingredientLabelText: 'Water (Aqua), Sodium Cocoyl Glycinate, Salicylic Acid (2.0% BHA), Niacinamide (Vitamin B3 3%), Glycolic Acid (AHA 1%), Ceramide NP, Centella Asiatica (Cica) Leaf Extract, Sodium Hyaluronate (Hyaluronic Acid), Glycerin, Zinc PCA, Phenoxyethanol, Citric Acid.',
    suggestedClaims: ['Detox', 'Chemical-Free', 'Dermatologist Tested', 'Doctor Recommended']
  },
  {
    id: 'sample_sleep_tabs',
    name: 'Deep Rest Circadian 3mg Melatonin + Ashwagandha Tablets',
    brandSuggestion: 'Somna Rest Labs',
    category: 'Sleep & Recovery',
    goal: 'sleep_recovery',
    shortDesc: 'Neuro-calm nighttime blend for sleep latency and stress reduction.',
    bannerBadge: 'Sleep Support Sample',
    frontLabelText: 'DEEP REST CIRCADIAN TABLETS • 100% NATURAL • CLINICALLY BACKED • BOOSTS IMMUNITY • DOCTOR FORMULATED • RESTORATIVE SLEEP COMPLEX',
    ingredientLabelText: 'Melatonin (3.0 mg), Withania Somnifera (KSM-66 Ashwagandha Root Extract 300 mg), Magnesium Bisglycinate (150 mg elemental magnesium), L-Theanine (100 mg), Chamomile Flower Extract (Apigenin 50 mg), Valerian Root Extract, Microcrystalline Cellulose, Silicon Dioxide.',
    suggestedClaims: ['Natural', 'Clinically Proven', 'Boosts Immunity', 'Doctor Recommended']
  }
];
