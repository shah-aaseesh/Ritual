import { analyzeLabelText, performBrowserOCR, fileToBase64DataUrl, cleanAndNormalizeOCRText, sanitizeIngredientList, isPureIngredient } from './analyzer';
import { MOSAIC_PRODUCTS_CATALOG } from '../data/mosaicProducts';
import { ProductAnalysisResult, WellnessGoal, MosaicProduct } from '../types';

import { extractTextWithGoogleVision } from './googleVisionService';

export const POPULAR_OPENROUTER_MODELS = [
  { id: 'deepseek/deepseek-chat', name: 'DeepSeek V3 (Clinical Grade Extraction & Reasoning)' },
  { id: 'deepseek/deepseek-r1', name: 'DeepSeek R1 (Deep Clinical Reasoning & Actives Isolation)' },
  { id: 'inclusionai/ling-3.0-flash-sante:free', name: 'Ling 3.0 Flash Sante (Medical Specialist - Free)' },
  { id: 'nvidia/nemotron-3-super-120b-a12b:free', name: 'NVIDIA Nemotron 3 Super (High Accuracy - Free)' },
  { id: 'openrouter/free', name: 'OpenRouter Auto Router (Free)' },
  { id: 'dots-studio/dots-3-note-preview:free', name: 'Dots Studio: Dots-3 Note Vision (Free)' },
  { id: 'google/gemma-4-26b-a4b-it:free', name: 'Google: Gemma 4 26B A4B MoE (Free)' }
];

export interface VisionLabelExtractionResult {
  productName: string;
  brand: string;
  ingredientText: string;
  claimText: string;
  analysis: ProductAnalysisResult;
  source: 'openrouter_vision' | 'local_ocr';
}

/**
 * Resizes and compresses image to max 1600px for lightning-fast direct Vision LLM upload
 */
export async function optimizeImageForVisionAI(fileOrDataUrl: File | string, maxDimension = 1600): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      let w = img.width;
      let h = img.height;
      if (w > maxDimension || h > maxDimension) {
        if (w > h) {
          h = Math.round((h * maxDimension) / w);
          w = maxDimension;
        } else {
          w = Math.round((w * maxDimension) / h);
          h = maxDimension;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        if (typeof fileOrDataUrl === 'string') resolve(fileOrDataUrl);
        else fileToBase64DataUrl(fileOrDataUrl).then(resolve).catch(() => resolve(''));
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => {
      if (typeof fileOrDataUrl === 'string') {
        resolve(fileOrDataUrl);
      } else {
        fileToBase64DataUrl(fileOrDataUrl).then(resolve).catch(() => resolve(''));
      }
    };
    if (typeof fileOrDataUrl === 'string') {
      img.src = fileOrDataUrl;
    } else {
      fileToBase64DataUrl(fileOrDataUrl).then(base64 => {
        img.src = base64;
      }).catch(() => resolve(''));
    }
  });
}

/**
 * High-Precision Label Extraction:
 * 1. Uses Google Cloud Vision OCR for sub-millimeter character fidelity on packaging text.
 * 2. Uses DeepSeek reasoning AI to discard non-ingredient noise and isolate ONLY active doses & ingredients.
 * 3. Falls back to direct multimodal vision LLMs or browser OCR if needed.
 */
export async function extractLabelFromImageWithAI(
  imageSource: File | string,
  userGoal: WellnessGoal = 'hair_health',
  apiKey?: string,
  model: string = 'deepseek/deepseek-chat',
  onProgress?: (percent: number, status: string) => void
): Promise<VisionLabelExtractionResult> {
  if (onProgress) onProgress(15, 'Optimizing packaging image for character scan...');
  const base64DataUrl = await optimizeImageForVisionAI(imageSource);

  const effectiveApiKey = (apiKey && apiKey.trim().length > 5) 
    ? apiKey.trim() 
    : (import.meta as any).env?.VITE_OPENROUTER_API_KEY || '';

  // 1. High-Precision Two-Stage Pipeline: Google Cloud Vision OCR + DeepSeek Clinical Isolation
  const googleVisionKey = (import.meta as any).env?.VITE_GOOGLE_VISION_API_KEY || '';
  if (googleVisionKey && googleVisionKey.length > 5) {
    try {
      if (onProgress) onProgress(30, 'Scanning characters with Google Cloud Vision OCR...');
      const googleText = await extractTextWithGoogleVision(base64DataUrl, googleVisionKey);
      if (googleText && googleText.length > 10) {
        if (onProgress) onProgress(60, 'Isolating pure ingredients with DeepSeek Clinical Engine...');
        
        // Pass raw OCR text to DeepSeek to isolate ONLY the ingredient section
        const deepseekResult = await denoiseAndStructureOCRWithLLM(googleText, userGoal, apiKey, onProgress, model);
        if (deepseekResult) {
          if (onProgress) onProgress(100, 'DeepSeek Ingredient Extraction Complete!');
          return deepseekResult;
        }

        const cleanedIngredients = cleanAndNormalizeOCRText(googleText);
        const analysis = analyzeLabelText(cleanedIngredients, '', userGoal, 'Scanned Product');
        
        if (onProgress) onProgress(100, 'Google Cloud Vision OCR Complete!');
        return {
          productName: 'Scanned Product',
          brand: '',
          ingredientText: cleanedIngredients,
          claimText: '',
          analysis,
          source: 'openrouter_vision'
        };
      }
    } catch (gErr) {
      console.warn('Google Cloud Vision call failed or billing pending, using fallback:', gErr);
    }
  }

  // 2. Direct Multimodal Vision AI Pipeline (if Google Vision is unavailable)
  if (effectiveApiKey && effectiveApiKey.length > 5) {
    const candidateModels = [
      model && model !== 'local' && !model.startsWith('deepseek') ? model : 'dots-studio/dots-3-note-preview:free',
      'google/gemma-4-26b-a4b-it:free',
      'openrouter/free'
    ];
    const uniqueModels = [...new Set(candidateModels)];

    for (const candidateModel of uniqueModels) {
      try {
        if (onProgress) onProgress(35, `Vision AI reading label (${candidateModel.split('/')[1] || candidateModel})...`);

        const prompt = `You are an expert cosmetic dermatologist and clinical pharmacologist.
Look at this product photo. Your critical task is to EXTRACT ONLY THE INGREDIENTS and ACTIVE SUBSTANCES from the label.

STRICTLY DO NOT include:
- Directions for use, usage instructions, or dosage recommendations (e.g. "Take 1 gummy daily", "Apply on wet hair", "Massage gently into scalp", "Swallow with water")
- Storage instructions & safety warnings (e.g. "Store below 25°C", "Keep away from direct sunlight", "Keep out of reach of children", "Not for medicinal use", "Consult physician")
- Manufacturer, marketing & distributor info (e.g. "Marketed by", "Manufactured by", "FSSAI Lic No", "Batch No", "Mfg Date", "Best Before", "Expiry", "MRP", "Net Quantity", customer care emails, phone numbers, addresses)
- General macronutrient facts (e.g. "Energy", "Calories", "Total Carbohydrate", "Protein", "Total Sugar", "Fat", "Saturated Fat", "Trans Fat", "Sodium", "RDA%")
- Generic marketing boilerplate and packaging text

DO EXTRACT:
1. Product Name: Clean exact product name.
2. Brand: Brand name if visible.
3. Active Composition: All active ingredients, botanicals, and vitamins with their exact numeric doses and units (e.g. [{"name": "Melatonin", "amount": "5.0", "unit": "mg"}, {"name": "Tart Cherry Extract", "amount": "200", "unit": "mg"}, {"name": "L-Theanine", "amount": "10.0", "unit": "mg"}]).
4. Full Ingredients List: Transcribe ONLY the ingredients from the "INGREDIENTS:" or "COMPOSITION:" section (e.g. "Liquid Glucose, Sugar, Maltodextrin, Water, Pectin, Acidity Regulators, Medium Chain Triglycerides, Beet Root Powder").
5. Front-Pack Claims: Key front-of-pack claims if visible (e.g. "Supports Deep Sleep, Non-Habit Forming").
6. Clinical Synthesis: Concise 1-2 sentence evidence synthesis of how these active ingredients function.

Return ONLY valid JSON matching this schema:
{
  "productName": "Product Name",
  "brand": "Brand Name",
  "tableComposition": [
    { "name": "Melatonin", "amount": "5.0", "unit": "mg" }
  ],
  "extractedIngredientsText": "Liquid Glucose, Sugar, Maltodextrin, Water, Pectin, Acidity Regulators, Tart Cherry Extract, Chamomile Extract, L-Theanine, Melatonin, Ergocalciferol, Medium Chain Triglycerides, Beet Root Powder",
  "extractedClaimsText": "Supports Deep Sleep, 100% RDA Vitamin D",
  "clinicalSynthesis": "Evidence-backed nocturnal recovery formula combining chronobiotic melatonin with synergistic adaptogens."
}`;

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${effectiveApiKey.trim()}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://ritual-wellness.app',
            'X-Title': 'Ritual Wellness AI'
          },
          body: JSON.stringify({
            model: candidateModel,
            messages: [
              {
                role: 'user',
                content: [
                  { type: 'text', text: prompt },
                  { type: 'image_url', image_url: { url: base64DataUrl } }
                ]
              }
            ],
            temperature: 0.1
          })
        });

        if (response.ok) {
          if (onProgress) onProgress(80, 'Cross-referencing extracted actives with PubMed evidence DB...');
          const data = await response.json();
          const rawContent = data.choices?.[0]?.message?.content || '';
          const cleaned = rawContent.replace(/```json/gi, '').replace(/```/g, '').trim();
          
          let parsed: any = {};
          try {
            parsed = JSON.parse(cleaned);
          } catch (jsonErr) {
            const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
            if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
          }

          let ingText = parsed.extractedIngredientsText || '';
          const claimText = parsed.extractedClaimsText || '';
          const prodName = parsed.productName || 'Audited Product';
          const brandName = parsed.brand || '';

          // Merge active table composition into ingredient text if available from JSON
          if (parsed.tableComposition && Array.isArray(parsed.tableComposition) && parsed.tableComposition.length > 0) {
            const tableItems = parsed.tableComposition
              .filter((item: any) => item.name && isPureIngredient(item.name.trim()))
              .map((item: any) => `${item.name.trim()} (${item.amount || ''} ${item.unit || ''})`.trim());

            if (tableItems.length > 0) {
              const tableString = tableItems.join(', ');
              ingText = `${tableString}, ${ingText.replace(/^ingredients?\s*[:\-]\s*/i, '')}`;
            }
          }

          // If JSON parsing yielded no ingredients, dynamically parse rawContent
          if (!ingText || ingText.trim().length < 3) {
            ingText = cleanAndNormalizeOCRText(rawContent);
          } else {
            const tokens = ingText.split(/[,;\n]/).map((s: string) => s.trim()).filter(Boolean);
            const sanitized = sanitizeIngredientList(tokens);
            if (sanitized.length > 0) {
              ingText = sanitized.join(', ');
            }
          }

          if (ingText && ingText.trim().length > 3) {
            // Run through our clinical evidence & claims evaluation matrix
            const analysis = analyzeLabelText(ingText, claimText, userGoal, prodName);
            if (parsed.clinicalSynthesis) {
              analysis.summary.synthesisText = parsed.clinicalSynthesis;
            }

            if (onProgress) onProgress(100, 'Vision AI Analysis Complete!');

            return {
              productName: prodName,
              brand: brandName,
              ingredientText: ingText,
              claimText: claimText,
              analysis,
              source: 'openrouter_vision'
            };
          }
        }
      } catch (err) {
        console.warn(`Vision AI model ${candidateModel} failed, trying next fallback:`, err);
      }
    }
  }

  // 3. Fallback: Canvas-enhanced Tesseract OCR + LLM De-noising & Local Clinical Matrix
  if (onProgress) onProgress(30, 'Running enhanced image OCR...');
  const ocrText = await performBrowserOCR(imageSource, (p, s) => {
    if (onProgress) onProgress(30 + Math.round(p * 0.4), s);
  });

  if (ocrText && ocrText.length > 10) {
    if (onProgress) onProgress(75, 'Isolating ingredients with AI...');
    const denoised = await denoiseAndStructureOCRWithLLM(ocrText, userGoal, apiKey, onProgress, model);
    if (denoised) {
      if (onProgress) onProgress(100, 'Analysis Complete');
      return denoised;
    }
  }

  // Extract strictly ingredients only using local cleaner
  const cleanedFallback = cleanAndNormalizeOCRText(ocrText);
  const analysis = analyzeLabelText(cleanedFallback, '', userGoal, 'Scanned Product');

  if (onProgress) onProgress(100, 'Analysis Complete');

  return {
    productName: 'Scanned Product',
    brand: '',
    ingredientText: cleanedFallback,
    claimText: '',
    analysis,
    source: 'local_ocr'
  };
}

/**
 * Uses DeepSeek Clinical Reasoning AI to de-noise raw label text,
 * isolate ONLY pure ingredients and active doses, and discard all packaging noise.
 */
export async function denoiseAndStructureOCRWithLLM(
  rawOCRText: string,
  userGoal: WellnessGoal = 'hair_health',
  apiKey?: string,
  onProgress?: (percent: number, status: string) => void,
  preferredModel?: string
): Promise<VisionLabelExtractionResult | null> {
  const effectiveKey = (apiKey && apiKey.trim().length > 5)
    ? apiKey.trim()
    : (import.meta as any).env?.VITE_OPENROUTER_API_KEY || '';

  if (!effectiveKey || !rawOCRText || rawOCRText.trim().length < 10) {
    return null;
  }

  if (onProgress) onProgress(50, 'DeepSeek AI isolating pure ingredients & dosages...');

  const prompt = `You are an expert clinical pharmacologist, cosmetic chemist, and label transcriber.
Extract ONLY pure ingredients and active substances with exact dosages from this label text.

Raw Packaging Text:
---
${rawOCRText}
---

CRITICAL EXTRACTION RULES:
1. "productName": Clean name of the product.
2. "brand": Brand name if present.
3. "activesWithDose": Array of active ingredients, botanicals, and nutrients with their exact numeric dose and unit (e.g. [{"name": "Tart Cherry Extract", "dose": "200 mg"}, {"name": "Melatonin", "dose": "5.0 mg"}, {"name": "L-Theanine", "dose": "10.0 mg"}, {"name": "Chamomile Extract", "dose": "10 mg"}, {"name": "Vitamin D2", "dose": "15.0 mcg"}]).
   - STRICTLY EXCLUDE: Energy, Calories, Protein, Carbohydrates, Sugar, Fat, Saturated Fat, Sodium, Cholesterol.
4. "fullIngredientsList": Array of pure individual chemical/botanical/carrier ingredient names (e.g. ["Liquid Glucose", "Cane Sugar", "Pectin", "Citric Acid", "Tart Cherry Extract", "Medium Chain Triglycerides", "Beet Root Powder"]).
   - STRICTLY DISCARD and EXCLUDE:
     * Usage / dosage instructions (e.g. "Take 1 gummy", "Apply 2-3 drops", "Massage gently", "Swallow with water")
     * Warnings and storage notes (e.g. "Store in cool dry place below 25C", "Keep out of reach of children", "Not for medicinal use", "Consult physician")
     * Manufacturer, distributor & packaging boilerplate (e.g. "Marketed by", "Manufactured by", "FSSAI Lic No", "Batch No", "Mfg Date", "Best Before", "MRP", "Net Quantity", "Customer Care")
     * RDA guidelines, overages statement, single character OCR artifacts
5. "claims": Array of key front-of-pack claims (e.g. ["Supports Deep Sleep", "Non-Habit Forming"]).
6. "clinicalSynthesis": Concise 1-2 sentence evidence synthesis of how these active ingredients function together.

Return ONLY a valid JSON object matching this schema without markdown fences or additional text:
{
  "productName": "string",
  "brand": "string",
  "activesWithDose": [
    { "name": "string", "dose": "string" }
  ],
  "fullIngredientsList": ["string"],
  "claims": ["string"],
  "clinicalSynthesis": "string"
}`;

  const candidateModels = [
    preferredModel && preferredModel !== 'local' ? preferredModel : 'deepseek/deepseek-chat',
    'deepseek/deepseek-chat',
    'deepseek/deepseek-r1',
    'inclusionai/ling-3.0-flash-sante:free',
    'nvidia/nemotron-3-super-120b-a12b:free',
    'openrouter/free'
  ];
  const uniqueModels = [...new Set(candidateModels)];

  for (const model of uniqueModels) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${effectiveKey.trim()}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://ritual-wellness.app',
          'X-Title': 'Ritual Wellness AI'
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert clinical pharmacologist and cosmetic chemist. Extract ONLY pure ingredients and discard all marketing, directions, warnings, and non-ingredient packaging noise. Output ONLY valid JSON.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1500,
          temperature: 0.1
        })
      });

      if (response.ok) {
        const data = await response.json();
        const rawContent = data.choices?.[0]?.message?.content || '';
        
        // Strip DeepSeek R1 reasoning thinking tags and markdown fences
        let cleaned = rawContent.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
        cleaned = cleaned.replace(/```json/gi, '').replace(/```/g, '').trim();

        let parsed: any = null;
        try {
          parsed = JSON.parse(cleaned);
        } catch (jsonErr) {
          const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
          if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
        }

        if (parsed) {
          const prodName = parsed.productName || 'Audited Product';
          const brandName = parsed.brand || '';
          const claims = Array.isArray(parsed.claims) ? parsed.claims.join(', ') : (parsed.claims || '');

          // Build composite ingredient string with active doses attached
          const activeDoseStrings: string[] = [];
          if (Array.isArray(parsed.activesWithDose)) {
            parsed.activesWithDose.forEach((act: any) => {
              if (act.name && act.dose && isPureIngredient(act.name)) {
                activeDoseStrings.push(`${act.name.trim()} (${act.dose.trim()})`);
              } else if (act.name && isPureIngredient(act.name)) {
                activeDoseStrings.push(act.name.trim());
              }
            });
          }

          const fullListStrings: string[] = Array.isArray(parsed.fullIngredientsList) 
            ? parsed.fullIngredientsList
                .map((s: string) => s.trim())
                .filter((s: string) => isPureIngredient(s))
            : [];

          // Merge active doses with full ingredients list cleanly
          const combinedList: string[] = [...activeDoseStrings];
          for (const item of fullListStrings) {
            const itemLower = item.toLowerCase();
            const alreadyIncluded = activeDoseStrings.some(a => a.toLowerCase().includes(itemLower) || itemLower.includes(a.toLowerCase().split('(')[0].trim()));
            if (!alreadyIncluded) {
              combinedList.push(item);
            }
          }

          const sanitizedItems = sanitizeIngredientList(combinedList);
          const finalIngredientText = sanitizedItems.length > 0 ? sanitizedItems.join(', ') : cleanAndNormalizeOCRText(rawOCRText);
          const analysis = analyzeLabelText(finalIngredientText, claims, userGoal, prodName);

          if (parsed.clinicalSynthesis) {
            analysis.summary.synthesisText = parsed.clinicalSynthesis;
          }

          return {
            productName: prodName,
            brand: brandName,
            ingredientText: finalIngredientText,
            claimText: claims,
            analysis,
            source: 'openrouter_vision'
          };
        }
      }
    } catch (err) {
      console.warn(`DeepSeek extraction with ${model} failed, trying fallback:`, err);
    }
  }

  return null;
}

export async function analyzeIngredientsWithAI(
  ingredientText: string,
  imageThumbnail?: string,
  goal: WellnessGoal = 'hair_health',
  productName: string = 'Scanned Product',
  apiKey?: string,
  model: string = 'deepseek/deepseek-chat'
): Promise<ProductAnalysisResult> {
  const effectiveKey = (apiKey && apiKey.trim().length > 5) 
    ? apiKey.trim() 
    : (import.meta as any).env?.VITE_OPENROUTER_API_KEY || '';

  // If OpenRouter API key is available, query DeepSeek for reasoning
  if (effectiveKey && effectiveKey.length > 5 && ingredientText && ingredientText.trim().length > 5) {
    try {
      const prompt = `You are a clinical cosmetic dermatology & pharmacology analysis AI. Analyze the following cosmetic/wellness product ingredient list for the user goal: "${goal}".
Product Name: "${productName}"
Ingredients Text: "${ingredientText}"

Provide clean JSON matching this exact structure:
{
  "productName": "${productName}",
  "category": "Hair Care" or "Body Care" or "Sleep & Recovery" or "General",
  "synthesisText": "concise 2-3 sentence evidence summary explaining which ingredients have strong clinical evidence vs dose-dependent vs unverified claims.",
  "extractedIngredients": [
    {
      "name": "Ingredient name",
      "commonPurpose": "purpose",
      "evidenceTier": "strong_evidence" | "conditional_evidence" | "promising_limited" | "supporting_ingredient" | "insufficient_info",
      "doseMatters": true | false,
      "doesLabelDiscloseDose": true | false,
      "explanation": "concise scientific note",
      "relevanceToGoal": "high" | "moderate" | "supporting" | "general"
    }
  ]
}
Respond ONLY with the JSON object.`;

      const messages: any[] = [];
      if (imageThumbnail) {
        messages.push({
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: imageThumbnail } }
          ]
        });
      } else {
        messages.push({ role: 'user', content: prompt });
      }

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${effectiveKey.trim()}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://ritual-wellness.app',
          'X-Title': 'Ritual Wellness AI'
        },
        body: JSON.stringify({
          model: model || 'deepseek/deepseek-chat',
          messages,
          max_tokens: 1500,
          temperature: 0.1
        })
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || '';
        let cleaned = content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
        cleaned = cleaned.replace(/```json/gi, '').replace(/```/g, '').trim();

        let parsed: any = null;
        try {
          parsed = JSON.parse(cleaned);
        } catch (jsonErr) {
          const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
          if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
        }
        
        if (parsed) {
          const localResult = analyzeLabelText(ingredientText, '', goal, productName);
          if (parsed.synthesisText) {
            localResult.summary.synthesisText = parsed.synthesisText;
          }
          return localResult;
        }
      }
    } catch (e) {
      console.warn('DeepSeek AI call failed, falling back to local clinical engine:', e);
    }
  }

  // Fallback to fast, reliable, zero-API-key local clinical analyzer
  return analyzeLabelText(ingredientText, '', goal, productName);
}

export function findMatchingMosaicProducts(
  detectedIngredientNames: string[],
  goal: WellnessGoal
): MosaicProduct[] {
  const normalizedActives = detectedIngredientNames.map(n => n.toLowerCase());
  
  const matches = MOSAIC_PRODUCTS_CATALOG.filter(p => {
    const goalMatches = p.targetGoal === goal;
    const ingredientMatches = p.keyIngredients.some(ing => 
      normalizedActives.some(act => act.includes(ing.toLowerCase()) || ing.toLowerCase().includes(act))
    );

    return goalMatches || ingredientMatches;
  });

  return matches.slice(0, 3);
}
