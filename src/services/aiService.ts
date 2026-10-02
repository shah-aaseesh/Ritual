import { analyzeLabelText, performBrowserOCR, fileToBase64DataUrl, cleanAndNormalizeOCRText, sanitizeIngredientList, isPureIngredient } from './analyzer';
import { MOSAIC_PRODUCTS_CATALOG } from '../data/mosaicProducts';
import { ProductAnalysisResult, WellnessGoal, MosaicProduct } from '../types';

import { extractTextWithGoogleVision } from './googleVisionService';

export const POPULAR_OPENROUTER_MODELS = [
  { id: 'openrouter/free', name: 'OpenRouter Free Multimodal Router (Auto / Fast)' },
  { id: 'google/gemini-2.0-flash-exp:free', name: 'Google: Gemini 2.0 Flash Vision (Free / Fast)' },
  { id: 'google/gemma-4-31b-it:free', name: 'Google: Gemma 4 31B Multimodal (Free)' },
  { id: 'google/gemma-4-26b-a4b-it:free', name: 'Google: Gemma 4 26B A4B MoE (Free)' },
  { id: 'qwen/qwen-2.5-vl-72b-instruct:free', name: 'Qwen: Qwen 2.5 VL 72B Vision (Free)' },
  { id: 'meta-llama/llama-3.2-11b-vision-instruct:free', name: 'Meta: Llama 3.2 11B Vision (Free)' }
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
 * Direct Vision AI & Google Cloud Vision Extraction for bottle/packaging photos.
 * Strictly extracts ONLY ingredients, active substances, and product info, discarding packaging noise.
 */
export async function extractLabelFromImageWithAI(
  imageSource: File | string,
  userGoal: WellnessGoal = 'hair_health',
  apiKey?: string,
  model: string = 'openrouter/free',
  onProgress?: (percent: number, status: string) => void
): Promise<VisionLabelExtractionResult> {
  let base64DataUrl = '';
  if (typeof imageSource === 'string') {
    base64DataUrl = imageSource;
  } else {
    base64DataUrl = await fileToBase64DataUrl(imageSource);
  }

  const effectiveApiKey = (apiKey && apiKey.trim().length > 5) 
    ? apiKey.trim() 
    : (import.meta as any).env?.VITE_OPENROUTER_API_KEY || '';

  // 1. Multimodal Vision AI with smart model fallback (First Priority for camera captures)
  if (effectiveApiKey && effectiveApiKey.length > 5) {
    const candidateModels = [
      model && model !== 'local' ? model : 'openrouter/free',
      'openrouter/free',
      'google/gemini-2.0-flash-exp:free',
      'google/gemma-4-31b-it:free',
      'google/gemma-4-26b-a4b-it:free',
      'qwen/qwen-2.5-vl-72b-instruct:free',
      'meta-llama/llama-3.2-11b-vision-instruct:free'
    ];
    // Remove duplicates
    const uniqueModels = [...new Set(candidateModels)];

    for (const candidateModel of uniqueModels) {
      try {
        if (onProgress) onProgress(25, `Multimodal Vision AI reading bottle label (${candidateModel.split('/')[1] || candidateModel})...`);

        const prompt = `You are an expert cosmetic dermatologist, clinical pharmacologist, and label reader.
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

  // 2. Try Google Cloud Vision OCR if configured
  const googleVisionKey = (import.meta as any).env?.VITE_GOOGLE_VISION_API_KEY || '';
  if (googleVisionKey && googleVisionKey.length > 5) {
    try {
      if (onProgress) onProgress(20, 'Scanning characters with Google Cloud Vision OCR...');
      const googleText = await extractTextWithGoogleVision(base64DataUrl, googleVisionKey);
      if (googleText && googleText.length > 10) {
        if (onProgress) onProgress(45, 'Google Vision characters extracted. Isolating ingredients with LLM...');
        
        // Pass raw OCR text to LLM to isolate ONLY the ingredient section
        const denoisedResult = await denoiseAndStructureOCRWithLLM(googleText, userGoal, apiKey, onProgress);
        if (denoisedResult) {
          if (onProgress) onProgress(100, 'De-noised Label Analysis Complete!');
          return denoisedResult;
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
      console.warn('Google Cloud Vision call failed or billing pending, using Local OCR fallback:', gErr);
    }
  }

  // 3. Fallback: Canvas-enhanced Tesseract OCR + LLM De-noising & Local Clinical Matrix
  if (onProgress) onProgress(30, 'Running enhanced image OCR...');
  const ocrText = await performBrowserOCR(imageSource, (p, s) => {
    if (onProgress) onProgress(30 + Math.round(p * 0.4), s);
  });

  if (ocrText && ocrText.length > 10) {
    if (onProgress) onProgress(75, 'Isolating ingredients with AI...');
    const denoised = await denoiseAndStructureOCRWithLLM(ocrText, userGoal, apiKey, onProgress);
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
 * Uses LLM to de-noise raw OCR text, repair broken characters/words,
 * and extract exact active doses, carrier ingredients, and marketing claims.
 */
export async function denoiseAndStructureOCRWithLLM(
  rawOCRText: string,
  userGoal: WellnessGoal = 'hair_health',
  apiKey?: string,
  onProgress?: (percent: number, status: string) => void
): Promise<VisionLabelExtractionResult | null> {
  const effectiveKey = (apiKey && apiKey.trim().length > 5)
    ? apiKey.trim()
    : (import.meta as any).env?.VITE_OPENROUTER_API_KEY || '';

  if (!effectiveKey || !rawOCRText || rawOCRText.trim().length < 10) {
    return null;
  }

  if (onProgress) onProgress(50, 'AI De-noising & structuring ingredient composition...');

  const prompt = `You are an expert cosmetic chemist, pharmacologist, and label transcriber.
You are given raw, noisy OCR text extracted from a wellness/skincare/supplement product label.

Raw OCR Text:
---
${rawOCRText}
---

Your task is to isolate ONLY pure ingredients and discard all packaging noise:
1. "productName": Clean name of the product.
2. "brand": Brand name if present on label.
3. "activesWithDose": Array of active ingredients & nutrients with exact numeric dose and unit (e.g. [{"name": "Tart Cherry Extract", "dose": "200 mg"}, {"name": "Melatonin", "dose": "5.0 mg"}, {"name": "L-Theanine", "dose": "10.0 mg"}, {"name": "Chamomile Extract", "dose": "10 mg"}, {"name": "Vitamin D2", "dose": "15.0 mcg"}]).
   - STRICTLY EXCLUDE: Energy, Calories, Protein, Carbohydrates, Sugar, Fat, Saturated Fat, Sodium, Cholesterol.
4. "fullIngredientsList": Array of pure chemical/botanical/carrier ingredient names (e.g. ["Liquid Glucose", "Sugar", "Maltodextrin", "Water", "Pectin", "Medium Chain Triglycerides", "Beet Root Powder"]).
   - STRICTLY EXCLUDE: Nutritional facts headers, RDA limits, %RDA, ICMR-NIN guidelines, overages statement, FSSAI number, Marketed by, Batch No, Mfg Date, Best Before, MRP, Net quantity, storage warnings, and single letter artifacts like Z' or ZZ.
5. "claims": Array of marketing or front-of-pack claims found (e.g. ["100% RDA", "Non-Habit Forming"]).
6. "clinicalSynthesis": Concise 1-2 sentence evidence summary explaining how the actives function.

Return ONLY a valid JSON object matching this schema without markdown fences:
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
    'openrouter/free',
    'google/gemini-2.0-flash-exp:free',
    'google/gemma-4-31b-it:free',
    'google/gemma-4-26b-a4b-it:free',
    'meta-llama/llama-3.3-70b-instruct:free',
    'qwen/qwen3.8-27b:free'
  ];

  for (const model of candidateModels) {
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
              content: 'You are an expert cosmetic chemist and label de-noiser. Extract ONLY ingredients and discard all packaging/macro noise. Output only valid JSON.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.1
        })
      });

      if (response.ok) {
        const data = await response.json();
        const rawContent = data.choices?.[0]?.message?.content || '';
        const cleaned = rawContent.replace(/```json/gi, '').replace(/```/g, '').trim();

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
      console.warn(`LLM Denoising with ${model} failed, trying fallback:`, err);
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
  model: string = 'openrouter/free'
): Promise<ProductAnalysisResult> {
  const effectiveKey = (apiKey && apiKey.trim().length > 5) 
    ? apiKey.trim() 
    : (import.meta as any).env?.VITE_OPENROUTER_API_KEY || '';

  // If OpenRouter API key is available, query OpenRouter for reasoning
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
          model: model || 'openrouter/free',
          messages,
          temperature: 0.2
        })
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || '';
        const cleaned = content.replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        
        const localResult = analyzeLabelText(ingredientText, '', goal, productName);
        if (parsed.synthesisText) {
          localResult.summary.synthesisText = parsed.synthesisText;
        }
        return localResult;
      }
    } catch (e) {
      console.warn('OpenRouter API call failed, falling back to local clinical engine:', e);
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
