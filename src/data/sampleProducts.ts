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
    name: '3% Redensyl + 1% Rosemary Scalp Serum',
    brandSuggestion: 'Apex Derma Lab',
    category: 'Hair Care',
    goal: 'hair_health',
    shortDesc: 'Clinical scalp formulation with transparent active concentrations.',
    bannerBadge: 'Verified Clinical Strength',
    frontLabelText: '3% REDENSYL + 1% ROSEMARY • STOPS HAIR FALL • CLINICALLY PROVEN',
    ingredientLabelText: 'Redensyl 3%, Rosemary Leaf Oil 1%, Caffeine 1%, Biotin, Purified Water, Phenoxyethanol',
    suggestedClaims: ['Clinically Proven', 'Clean', 'Advanced Formula'],
    debunkHighlight: 'Verified: 3% Redensyl matches clinical efficacy trials for anagen follicle stimulation.'
  },
  {
    id: 'sample_onion_fairy_dust',
    name: '10x Red Onion Hair Growth Oil',
    brandSuggestion: 'Botanica Herbal Labs',
    category: 'Hair Care',
    goal: 'hair_health',
    shortDesc: 'Marketing-heavy traditional oil featuring extreme claims vs mineral oil base.',
    bannerBadge: 'Fairy Dusting Alert (Busted)',
    frontLabelText: '10X ONION OIL • 100% CHEMICAL-FREE • REGROWS HAIR IN 14 DAYS',
    ingredientLabelText: 'Mineral Oil 92%, Synthetic Fragrance, Red Onion Extract 0.05%, Red Color Dye',
    suggestedClaims: ['Chemical-Free', 'Doctor Recommended'],
    debunkHighlight: 'BUSTED: 92% Mineral oil; Onion extract is below 0.05% trace level.'
  },
  {
    id: 'sample_body_wash',
    name: '2% BHA Salicylic Acid Body Cleanser',
    brandSuggestion: 'DermaCure Body',
    category: 'Body Care',
    goal: 'body_care',
    shortDesc: 'BHA clarifying cleanser for back/chest bumps and smooth skin.',
    bannerBadge: 'Therapeutic Dose Verified',
    frontLabelText: '2% BHA SALICYLIC CLEANSER • DEEP DETOX • DERMATOLOGIST TESTED',
    ingredientLabelText: 'Salicylic Acid 2%, Niacinamide 3%, Glycerin, Purified Water, Citric Acid',
    suggestedClaims: ['Detox', 'Dermatologist Tested'],
    debunkHighlight: 'Verified: Contains effective 2% Salicylic Acid and 3% Niacinamide.'
  },
  {
    id: 'sample_sleep_tabs',
    name: '3mg Melatonin + KSM-66 Sleep Tabs',
    brandSuggestion: 'Somna Rest Labs',
    category: 'Sleep & Recovery',
    goal: 'sleep_recovery',
    shortDesc: 'Nighttime blend for sleep latency and circadian synchronization.',
    bannerBadge: 'Clinical Strength Active',
    frontLabelText: '3MG MELATONIN + KSM-66 • RESTORATIVE SLEEP COMPLEX • CLINICALLY BACKED',
    ingredientLabelText: 'Melatonin 3mg, KSM-66 Ashwagandha 300mg, Magnesium 150mg, Plant Cellulose',
    suggestedClaims: ['Clinically Proven', 'Doctor Recommended'],
    debunkHighlight: 'Verified: Contains therapeutic 3mg Melatonin and standardized 300mg Ashwagandha.'
  }
];
