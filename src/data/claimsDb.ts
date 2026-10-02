import { ClaimInfo, ClaimVerdict } from '../types';

export interface ClaimDefinition {
  id: string;
  pattern: RegExp;
  displayName: string;
  whatItMeans: string;
  defaultVerdict: ClaimVerdict;
  missingInformation: string;
  supportRationale: string;
  sourceUrl: string;
  sourceLabel: string;
}

export const KNOWN_CLAIMS: ClaimDefinition[] = [
  {
    id: 'clinically_proven',
    pattern: /clinically\s*(proven|tested|backed|validated)/i,
    displayName: 'Clinically Proven',
    whatItMeans: 'Implies the final formulation or its key ingredients were tested in controlled human clinical trials with statistically significant positive outcomes.',
    defaultVerdict: 'partially_supported',
    missingInformation: 'Labels rarely cite sample size, control groups, study duration, or whether the entire finished product (vs. an isolated third-party active) was tested.',
    supportRationale: 'While individual actives (e.g. Minoxidil, Salicylic Acid, Melatonin) have extensive clinical literature, finished cosmetic formulations rarely publish independent peer-reviewed trial data on pack.',
    sourceUrl: 'https://pubmed.ncbi.nlm.nih.gov/28574488/',
    sourceLabel: 'PubMed (Dermatol Ther - Clinical Study Standards)'
  },
  {
    id: 'natural',
    pattern: /100%\s*natural|natural\s*origin|all\s*natural|pure\s*natural/i,
    displayName: 'Natural / 100% Natural',
    whatItMeans: 'Suggests ingredients are derived directly from botanical or mineral sources without synthetic chemical alteration.',
    defaultVerdict: 'too_vague_to_verify',
    missingInformation: 'There is no universal legal regulatory definition of "natural" in cosmetics. Extraction methods, stabilizing agents, and preservatives often involve standard chemical processing.',
    supportRationale: 'Natural origin does not automatically correlate with higher efficacy or lower irritation risk. Poison ivy is natural; refined actives are often purer and more stable.',
    sourceUrl: 'https://pubmed.ncbi.nlm.nih.gov/30678601/',
    sourceLabel: 'PubMed (Dermatitis Review - Botanical Sensitizers)'
  },
  {
    id: 'chemical_free',
    pattern: /chemical[\s-]*free|no\s*chemicals|0%\s*chemicals/i,
    displayName: 'Chemical-Free',
    whatItMeans: 'Marketed to imply safety by supposedly avoiding synthetic or industrial substances.',
    defaultVerdict: 'marketing_heavy',
    missingInformation: 'Scientifically impossible: all physical matter (including water, aloe vera, plant oils, and human skin) is composed entirely of chemical compounds.',
    supportRationale: 'This is an unscientific marketing term designed to exploit chemophobia. Look for specific exclusion lists (e.g. sulfate-free, paraben-free) instead of blanket "chemical-free" claims.',
    sourceUrl: 'https://pubmed.ncbi.nlm.nih.gov/27083656/',
    sourceLabel: 'PubMed (Crit Rev Food Sci Nutr - Chemophobia Analysis)'
  },
  {
    id: 'detox',
    pattern: /detox(ifying|ification)?|flushes\s*toxins/i,
    displayName: 'Detox / Toxin Flush',
    whatItMeans: 'Claims to purge metabolic waste or environmental toxins from skin, scalp, or digestive tract.',
    defaultVerdict: 'marketing_heavy',
    missingInformation: 'Skin and topical cosmetics do not perform systemic detoxification; your liver, kidneys, and lungs continuously handle metabolic detoxification.',
    supportRationale: 'Topical products can clarify sebum and remove surface environmental grime, but cannot draw "toxins" out of tissues.',
    sourceUrl: 'https://pubmed.ncbi.nlm.nih.gov/25522674/',
    sourceLabel: 'PubMed (J Hum Nutr Diet - Critical Review of Detox Diets & Topicals)'
  },
  {
    id: 'dermatologist_tested',
    pattern: /dermatologist[\s-]*(tested|approved|recommended)/i,
    displayName: 'Dermatologist Tested',
    whatItMeans: 'Indicates at least one board-certified dermatologist oversaw a patch or safety test of the product.',
    defaultVerdict: 'partially_supported',
    missingInformation: 'Does not disclose how many participants were tested, what the test protocol was (e.g., standard 48-hr HRIPT patch test for contact irritation vs. long-term efficacy), or what the pass criteria were.',
    supportRationale: 'Confirms basic safety or hypoallergenic screening occurred, but does not guarantee the product will outperform alternatives or be non-comedogenic for every individual.',
    sourceUrl: 'https://pubmed.ncbi.nlm.nih.gov/23767873/',
    sourceLabel: 'PubMed (Contact Dermatitis - Patch Testing Standards)'
  },
  {
    id: 'doctor_recommended',
    pattern: /doctor[\s-]*(recommended|developed|formulated)|trichologist[\s-]*recommended/i,
    displayName: 'Doctor / Trichologist Recommended',
    whatItMeans: 'Suggests healthcare professionals endorse the product or contributed to formulation design.',
    defaultVerdict: 'too_vague_to_verify',
    missingInformation: 'Usually lacks disclosure of survey size, methodology, commercial affiliations, or independent peer endorsements.',
    supportRationale: 'May indicate medical advisor involvement, but individual medical suitability depends on personal history and diagnosis.',
    sourceUrl: 'https://pubmed.ncbi.nlm.nih.gov/31102555/',
    sourceLabel: 'PubMed (Health Aff - Medical Endorsement Verification)'
  },
  {
    id: 'boosts_immunity',
    pattern: /boosts?\s*immunit(y|ies)|immune\s*defense|immune\s*booster/i,
    displayName: 'Boosts Immunity',
    whatItMeans: 'Claims to enhance the immune system response against pathogens or fatigue.',
    defaultVerdict: 'too_vague_to_verify',
    missingInformation: 'Over-stimulating the immune system is clinically undesirable (autoimmunity). Micronutrients support normal baseline function, not an artificial "boost".',
    supportRationale: 'Unless treating a documented nutritional deficiency (e.g., Vitamin D or Zinc deficiency), supplements do not create a super-charged immune state.',
    sourceUrl: 'https://pubmed.ncbi.nlm.nih.gov/32297184/',
    sourceLabel: 'PubMed (Nutrients - Micronutrient Homeostasis in Immunity)'
  },
  {
    id: 'advanced_formula',
    pattern: /advanced\s*formula|breakthrough\s*technology|next[\s-]gen\s*tech|bio[\s-]*active\s*complex/i,
    displayName: 'Advanced Formula / Breakthrough Tech',
    whatItMeans: 'Positioned as an innovative, state-of-the-art formulation superior to standard market options.',
    defaultVerdict: 'marketing_heavy',
    missingInformation: 'Proprietary marketing descriptors that do not correspond to any standard regulatory concentration or clinical threshold.',
    supportRationale: 'Evaluation must rest on the actual listed actives, percentages, and formulation pH rather than buzzwords.',
    sourceUrl: 'https://pubmed.ncbi.nlm.nih.gov/31588615/',
    sourceLabel: 'PubMed (Clin Cosmet Investig Dermatol - Cosmetic Formulation Science)'
  },
  {
    id: 'clean',
    pattern: /clean\s*(beauty|formulation|wellness)|100%\s*clean|clean\s*ingredients/i,
    displayName: 'Clean Wellness / Clean Formulation',
    whatItMeans: 'Brand shorthand indicating exclusion of certain controversial ingredients (such as parabens, phthalates, or harsh sulfates).',
    defaultVerdict: 'too_vague_to_verify',
    missingInformation: 'Every brand maintains a completely different subjective list of what is defined as "clean".',
    supportRationale: 'Useful if you are specifically allergic to a particular surfactant or fragrance, but lacks a universal scientific standard.',
    sourceUrl: 'https://pubmed.ncbi.nlm.nih.gov/34212519/',
    sourceLabel: 'PubMed (Int J Dermatol - Clean Beauty Standards vs Toxicology)'
  },
  {
    id: 'hair_fall_days',
    pattern: /(stops?|reduces?|reverses?)\s*hair\s*fall\s*in\s*\d+\s*days|fast\s*hair\s*growth/i,
    displayName: 'Stops Hair Fall in 7-14 Days',
    whatItMeans: 'Promises immediate arrest of hair shedding within 1 to 2 weeks of use.',
    defaultVerdict: 'marketing_heavy',
    missingInformation: 'Biological impossibility: human hair follicles operate on a 90-day telogen (shedding) cycle.',
    supportRationale: 'Hairs currently shedding entered the telogen phase 2–3 months ago. Any legitimate topical treatment (like Minoxidil or Redensyl) takes a minimum of 8 to 12 weeks of continuous use to show measurable density changes.',
    sourceUrl: 'https://pubmed.ncbi.nlm.nih.gov/10778724/',
    sourceLabel: 'PubMed (J Invest Dermatol - The Biology of Hair Follicle Cycling)'
  },
  {
    id: 'topical_collagen_antiaging',
    pattern: /collagen\s*(infusion|plumping|renewal|elasticity|restoring)|anti[\s-]*aging\s*collagen/i,
    displayName: 'Topical Collagen Penetration',
    whatItMeans: 'Claims that topical collagen molecules will absorb into dermis and rebuild the extracellular matrix.',
    defaultVerdict: 'marketing_heavy',
    missingInformation: 'Native collagen has a molecular weight of ~300,000 Daltons, whereas skin permeability is strictly limited to molecules under 500 Daltons (500 Dalton Rule).',
    supportRationale: 'Topical intact collagen acts purely as a surface humectant and cannot penetrate stratum corneum to replace dermal collagen. Only oral hydrolyzed collagen peptides or topical peptides/retinoids stimulate actual collagen synthesis.',
    sourceUrl: 'https://pubmed.ncbi.nlm.nih.gov/10839713/',
    sourceLabel: 'PubMed (Exp Dermatol - The 500 Dalton Rule for Skin Penetration)'
  },
  {
    id: 'shrinks_pores',
    pattern: /(shrinks?|closes?|erases?)\s*(open\s*)?pores|pore[\s-]*minimizing/i,
    displayName: 'Shrinks / Closes Open Pores',
    whatItMeans: 'Claims to physically tighten or reduce the anatomical diameter of skin pores permanently.',
    defaultVerdict: 'partially_supported',
    missingInformation: 'Pores do not have muscles and cannot physically open, close, or shrink permanently.',
    supportRationale: 'Exfoliants like Salicylic Acid (BHA) clear oxidized sebum and keratin plugs inside the pore lining, making pores appear visually smaller and cleaner, but do not alter genetic pore diameter.',
    sourceUrl: 'https://pubmed.ncbi.nlm.nih.gov/26844894/',
    sourceLabel: 'PubMed (Clin Cosmet Investig Dermatol - Facial Pores Etiology & Care)'
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
        supportRationale: def.supportRationale,
        sourceUrl: def.sourceUrl,
        sourceLabel: def.sourceLabel
      });
    }
  }

  return detected;
}
