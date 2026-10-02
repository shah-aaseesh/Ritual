import { ClaimInfo, ClaimVerdict } from '../types';

export interface ClaimDefinition {
  id: string;
  pattern: RegExp;
  displayName: string;
  whatItMeans: string;
  defaultVerdict: ClaimVerdict;
  missingInformation: string;
  supportRationale: string;
}

export const KNOWN_CLAIMS: ClaimDefinition[] = [
  {
    id: 'clinically_proven',
    pattern: /clinically\s*(proven|tested|backed|validated)/i,
    displayName: 'Clinically Proven',
    whatItMeans: 'Implies the final formulation or its key ingredients were tested in controlled human clinical trials with statistically significant positive outcomes.',
    defaultVerdict: 'partially_supported',
    missingInformation: 'Labels rarely cite sample size, control groups, study duration, or whether the entire finished product (vs. an isolated third-party active) was tested.',
    supportRationale: 'While individual actives (e.g. Minoxidil, Salicylic Acid, Melatonin) have extensive clinical literature, finished cosmetic formulations rarely publish independent peer-reviewed trial data on pack.'
  },
  {
    id: 'natural',
    pattern: /100%\s*natural|natural\s*origin|all\s*natural|pure\s*natural/i,
    displayName: 'Natural / 100% Natural',
    whatItMeans: 'Suggests ingredients are derived directly from botanical or mineral sources without synthetic chemical alteration.',
    defaultVerdict: 'too_vague_to_verify',
    missingInformation: 'There is no universal legal regulatory definition of "natural" in cosmetics. Extraction methods, stabilizing agents, and preservatives often involve standard chemical processing.',
    supportRationale: 'Natural origin does not automatically correlate with higher efficacy or lower irritation risk. Poison ivy is natural; refined actives are often purer and more stable.'
  },
  {
    id: 'chemical_free',
    pattern: /chemical[\s-]*free|no\s*chemicals|0%\s*chemicals/i,
    displayName: 'Chemical-Free',
    whatItMeans: 'Marketed to imply safety by supposedly avoiding synthetic or industrial substances.',
    defaultVerdict: 'marketing_heavy',
    missingInformation: 'Scientifically impossible: all physical matter (including water, aloe vera, plant oils, and human skin) is composed entirely of chemical compounds.',
    supportRationale: 'This is an unscientific marketing term designed to exploit chemophobia. Look for specific exclusion lists (e.g. sulfate-free, paraben-free) instead of blanket "chemical-free" claims.'
  },
  {
    id: 'detox',
    pattern: /detox(ifying|ification)?|flushes\s*toxins/i,
    displayName: 'Detox / Toxin Flush',
    whatItMeans: 'Claims to purge metabolic waste or environmental toxins from skin, scalp, or digestive tract.',
    defaultVerdict: 'marketing_heavy',
    missingInformation: 'Skin and topical cosmetics do not perform systemic detoxification; your liver, kidneys, and lungs continuously handle metabolic detoxification.',
    supportRationale: 'Topical products can clarify sebum and remove surface environmental grime, but cannot draw "toxins" out of tissues.'
  },
  {
    id: 'dermatologist_tested',
    pattern: /dermatologist[\s-]*(tested|approved|recommended)/i,
    displayName: 'Dermatologist Tested',
    whatItMeans: 'Indicates at least one board-certified dermatologist oversaw a patch or safety test of the product.',
    defaultVerdict: 'partially_supported',
    missingInformation: 'Does not disclose how many participants were tested, what the test protocol was (e.g., standard 48-hr HRIPT patch test for contact irritation vs. long-term efficacy), or what the pass criteria were.',
    supportRationale: 'Confirms basic safety or hypoallergenic screening occurred, but does not guarantee the product will outperform alternatives or be non-comedogenic for every individual.'
  },
  {
    id: 'doctor_recommended',
    pattern: /doctor[\s-]*(recommended|developed|formulated)|trichologist[\s-]*recommended/i,
    displayName: 'Doctor / Trichologist Recommended',
    whatItMeans: 'Suggests healthcare professionals endorse the product or contributed to formulation design.',
    defaultVerdict: 'too_vague_to_verify',
    missingInformation: 'Usually lacks disclosure of survey size, methodology, commercial affiliations, or independent peer endorsements.',
    supportRationale: 'May indicate medical advisor involvement, but individual medical suitability depends on personal history and diagnosis.'
  },
  {
    id: 'boosts_immunity',
    pattern: /boosts?\s*immunit(y|ies)|immune\s*defense|immune\s*booster/i,
    displayName: 'Boosts Immunity',
    whatItMeans: 'Claims to enhance the immune system response against pathogens or fatigue.',
    defaultVerdict: 'too_vague_to_verify',
    missingInformation: 'Over-stimulating the immune system is clinically undesirable (autoimmunity). Micronutrients support normal baseline function, not an artificial "boost".',
    supportRationale: 'Unless treating a documented nutritional deficiency (e.g., Vitamin D or Zinc deficiency), supplements do not create a super-charged immune state.'
  },
  {
    id: 'advanced_formula',
    pattern: /advanced\s*formula|breakthrough\s*technology|next[\s-]gen\s*tech|bio[\s-]*active\s*complex/i,
    displayName: 'Advanced Formula / Breakthrough Tech',
    whatItMeans: 'Positioned as an innovative, state-of-the-art formulation superior to standard market options.',
    defaultVerdict: 'marketing_heavy',
    missingInformation: 'Proprietary marketing descriptors that do not correspond to any standard regulatory concentration or clinical threshold.',
    supportRationale: 'Evaluation must rest on the actual listed actives, percentages, and formulation pH rather than buzzwords.'
  },
  {
    id: 'clean',
    pattern: /clean\s*(beauty|formulation|wellness)|100%\s*clean|clean\s*ingredients/i,
    displayName: 'Clean Wellness / Clean Formulation',
    whatItMeans: 'Brand shorthand indicating exclusion of certain controversial ingredients (such as parabens, phthalates, or harsh sulfates).',
    defaultVerdict: 'too_vague_to_verify',
    missingInformation: 'Every brand maintains a completely different subjective list of what is defined as "clean".',
    supportRationale: 'Useful if you are specifically allergic to a particular surfactant or fragrance, but lacks a universal scientific standard.'
  }
];

export function detectClaimsInText(text: string): ClaimInfo[] {
  const detected: ClaimInfo[] = [];
  const normalized = text.toLowerCase();

  for (const def of KNOWN_CLAIMS) {
    if (def.pattern.test(normalized)) {
      detected.push({
        id: def.id,
        claimPattern: def.displayName,
        displayName: def.displayName,
        whatItMeans: def.whatItMeans,
        verdict: def.defaultVerdict,
        missingInformation: def.missingInformation,
        supportRationale: def.supportRationale
      });
    }
  }

  return detected;
}
