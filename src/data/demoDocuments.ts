import { HealthDocument } from '../types';

export const DEMO_HEALTH_DOCUMENTS: HealthDocument[] = [
  {
    id: 'doc-1',
    title: 'Comprehensive Metabolic & Lipid Blood Panel',
    category: 'blood_test',
    uploadDate: '2026-09-28',
    fileSizeText: '2.4 MB PDF',
    doctorOrLab: 'Metropolis Diagnostics • Dr. R. Verma (MD)',
    biomarkers: [
      {
        id: 'bm-1',
        name: 'HbA1c (Glycated Hemoglobin)',
        value: '5.2',
        unit: '%',
        referenceRange: '< 5.7 %',
        status: 'optimal',
        category: 'Metabolic',
        impactExplanation: 'Excellent insulin sensitivity and glucose regulation over the past 90 days.'
      },
      {
        id: 'bm-2',
        name: 'Total Cholesterol / HDL Ratio',
        value: '3.4',
        unit: 'ratio',
        referenceRange: '< 4.5',
        status: 'optimal',
        category: 'Lipid',
        impactExplanation: 'Low cardiovascular atherogenic risk profile with healthy HDL protective fraction.'
      },
      {
        id: 'bm-3',
        name: 'Serum Vitamin D3 (25-OH)',
        value: '26.4',
        unit: 'ng/mL',
        referenceRange: '30.0 - 100.0 ng/mL',
        status: 'borderline',
        category: 'Vitamin & Mineral',
        impactExplanation: 'Sub-optimal D3 status; recommended 2000-4000 IU supplementation with K2 for bone and immune support.'
      },
      {
        id: 'bm-4',
        name: 'Serum Ferritin',
        value: '118',
        unit: 'ng/mL',
        referenceRange: '30 - 400 ng/mL',
        status: 'optimal',
        category: 'Vitamin & Mineral',
        impactExplanation: 'Healthy iron reserves ensuring normal cellular oxygen delivery and endurance capacity.'
      },
      {
        id: 'bm-5',
        name: 'Total Testosterone',
        value: '640',
        unit: 'ng/dL',
        referenceRange: '300 - 1000 ng/dL',
        status: 'optimal',
        category: 'Hormonal',
        impactExplanation: 'Robust androgenic baseline supporting muscular hypertrophy and athletic recovery.'
      }
    ],
    aiAnalysis: {
      summary: 'Overall metabolic and lipid profile is in the top tier (Optimal). Sub-clinical Vitamin D3 level detected which can be corrected with targeted micro-dosing.',
      keyFindings: [
        'Insulin sensitivity is prime (HbA1c 5.2%) — ideal for high-carb post-workout glycogen replenishment.',
        'Lipid markers show strong vascular protection.',
        'Vitamin D3 (26.4 ng/mL) is slightly below the athletic 40+ ng/mL threshold.'
      ],
      actionableDietAdvice: [
        'Maintain current high-protein intake (1.6–2.0g/kg).',
        'Add fatty fish (wild salmon, mackerel) 2x/week or egg yolks for natural D3 co-factors.'
      ],
      actionableWorkoutAdvice: [
        'Current recovery kinetics support high-frequency progressive overload (4–5 resistance sessions/week).',
        'Include morning outdoor warm-ups (15 mins direct sunlight).'
      ],
      recommendedSupplementIds: ['mw-health-01', 'mw-sleep-01', 'mw-health-04']
    }
  },
  {
    id: 'doc-2',
    title: 'DEXA Body Composition & Bone Density Scan',
    category: 'dxa_scan',
    uploadDate: '2026-09-10',
    fileSizeText: '1.8 MB PDF',
    doctorOrLab: 'Apollo Sports Medicine Center',
    biomarkers: [
      {
        id: 'bm-6',
        name: 'Body Fat Percentage',
        value: '14.8',
        unit: '%',
        referenceRange: '10 - 20 %',
        status: 'optimal',
        category: 'Metabolic',
        impactExplanation: 'Athletic lean body composition with low visceral fat distribution.'
      },
      {
        id: 'bm-7',
        name: 'Lean Skeletal Mass',
        value: '61.2',
        unit: 'kg',
        referenceRange: '> 54 kg',
        status: 'optimal',
        category: 'Metabolic',
        impactExplanation: 'Well-developed contractile muscle tissue across thoracic and posterior chain.'
      }
    ],
    aiAnalysis: {
      summary: 'Body fat is at an athletic 14.8% with strong symmetry between left and right limb lean mass.',
      keyFindings: [
        'Visceral adipose tissue (VAT) is extremely low (<50 cm²).',
        'Skeletal mass index (SMI) ranks in the 85th percentile for age group.'
      ],
      actionableDietAdvice: [
        'Maintain a slight caloric surplus (+200-300 kcal) for lean mass hypertrophy.'
      ],
      actionableWorkoutAdvice: [
        'Focus on progressive overload in compound barbell movements (Squat, Deadlift, Bench Press).'
      ],
      recommendedSupplementIds: ['mw-health-01', 'mw-health-02']
    }
  }
];
