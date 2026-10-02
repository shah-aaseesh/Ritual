import { analyzeLabelText, performBrowserOCR, fileToBase64DataUrl, cleanAndNormalizeOCRText, sanitizeIngredientList, isPureIngredient } from './analyzer';
import { MOSAIC_PRODUCTS_CATALOG } from '../data/mosaicProducts';
import { ProductAnalysisResult, WellnessGoal, MosaicProduct } from '../types';

export const POPULAR_OPENROUTER_MODELS = [
  { id: 'openai/gpt-4o', name: 'OpenAI: GPT-4o (Frontier Vision - Exact ChatGPT Engine)' },
  { id: 'openai/gpt-4o-2024-11-20', name: 'OpenAI: GPT-4o Latest (High-Res Packaging Vision)' },
  { id: 'deepseek/deepseek-chat', name: 'DeepSeek V3 (Clinical Grade Extraction & Reasoning)' },
  { id: 'deepseek/deepseek-r1', name: 'DeepSeek R1 (Deep Clinical Reasoning & Actives Isolation)' },
  { id: 'deepseek/deepseek-v4.1-flash', name: 'DeepSeek Vision V4.1 (Multimodal Vision)' },
  { id: 'inclusionai/ling-3.0-flash-sante:free', name: 'Ling 3.0 Flash Sante (Medical Specialist - Free)' },
  { id: 'nvidia/nemotron-3-super-120b-a12b:free', name: 'NVIDIA Nemotron 3 Super (High Accuracy - Free)' },
  { id: 'openrouter/free', name: 'OpenRouter Auto Router (Free)' }
];

export interface VisionLabelExtractionResult {
  productName: string;
  brand: string;
  ingredientText: string;
  claimText: string;
  analysis: ProductAnalysisResult;
  source: 'openrouter_vision' | 'local_ocr';
  debugTrace?: {
    model: string;
    prompt: string;
    rawResponse: string;
    parsedJson?: any;
    imageThumbnail?: string;
    durationMs?: number;
    tokens?: any;
    timestamp: string;
  };
}

/**
 * Resizes and compresses image to max 2048px with high clarity for GPT-4o multi-tile vision
 */
export async function optimizeImageForVisionAI(fileOrDataUrl: File | string, maxDimension = 2048): Promise<string> {
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
      resolve(canvas.toDataURL('image/jpeg', 0.92));
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
 * High-Resolution Multimodal Extraction using GPT-4o (ChatGPT Vision Engine):
 * Sends the high-res packaging photo directly to GPT-4o with multi-tile detail inspection.
 * GPT-4o reads dense 4pt-6pt ingredient typography, extracts active doses & excipients,
 * and discards all non-ingredient noise.
 */
export async function extractLabelFromImageWithAI(
  imageSource: File | string,
  userGoal: WellnessGoal = 'hair_health',
  apiKey?: string,
  model: string = 'openai/gpt-4o',
  onProgress?: (percent: number, status: string) => void
): Promise<VisionLabelExtractionResult> {
  if (onProgress) onProgress(15, 'Enhancing high-res packaging photo for GPT-4o Vision...');
  const base64DataUrl = await optimizeImageForVisionAI(imageSource);

  const effectiveApiKey = (apiKey && apiKey.trim().length > 5) 
    ? apiKey.trim() 
    : (import.meta as any).env?.VITE_OPENROUTER_API_KEY || '';

  // 1. Direct Multimodal GPT-4o Vision AI (ChatGPT Engine)
  if (effectiveApiKey && effectiveApiKey.length > 5) {
    const candidateModels = [
      model && model !== 'local' ? model : 'openai/gpt-4o',
      'openai/gpt-4o',
      'openai/gpt-4o-2024-11-20',
      'deepseek/deepseek-v4.1-flash',
      'dots-studio/dots-3-note-preview:free',
      'openrouter/free'
    ];
    const uniqueModels = [...new Set(candidateModels)];

    for (const candidateModel of uniqueModels) {
      try {
        const modelLabel = candidateModel.includes('gpt-4o') ? 'GPT-4o Vision (ChatGPT)' : (candidateModel.split('/')[1] || candidateModel);
        if (onProgress) onProgress(35, `Scanning label with ${modelLabel}...`);

        const prompt = `You are an expert cosmetic dermatologist and clinical pharmacologist.
Look closely at this product packaging photo. Your critical task is to EXTRACT ONLY THE INGREDIENTS and ACTIVE SUBSTANCES from the label, exactly like ChatGPT.

STRICTLY DO NOT include:
- Directions for use, usage instructions, or dosage recommendations (e.g. "Take 1 gummy daily", "Apply on wet hair", "Massage gently into scalp", "Swallow with water")
- Storage instructions & safety warnings (e.g. "Store below 25°C", "Keep away from direct sunlight", "Keep out of reach of children", "Not for medicinal use", "Consult physician")
- Manufacturer, marketing & distributor info (e.g. "Marketed by", "Manufactured by", "FSSAI Lic No", "Batch No", "Mfg Date", "Best Before", "Expiry", "MRP", "Net Quantity", customer care emails, phone numbers, addresses)
- General macronutrient facts (e.g. "Energy", "Calories", "Total Carbohydrate", "Protein", "Total Sugar", "Fat", "Saturated Fat", "Trans Fat", "Sodium", "RDA%")
- Generic marketing boilerplate and packaging text

DO EXTRACT:
1. Product Name: Clean exact product name.
2. Brand: Brand name if visible (e.g. "NIVEA", "Mosaic", "Nutraharmony").
3. Full Ingredients List: Transcribe EVERY SINGLE ingredient from the "INGREDIENTS:" or "COMPOSITION:" section word-for-word in the exact order listed on the bottle. (e.g. "Aqua, Glycerin, C15-19 Alkane, Cetearyl Alcohol, Paraffinum Liquidum, Isopropyl Palmitate, Glyceryl Stearate SE, Butyrospermum Parkii Butter, Dimethicone, Hydrogenated Coco-Glycerides, Sodium Cetearyl Sulfate, Carbomer, Sodium Hydroxide, Ethylhexylglycerin, Phenoxyethanol, Linalool, Citronellol, Alpha-Isomethyl Ionone, Benzyl Alcohol, Limonene, Parfum"). Do NOT summarize or skip any chemical name.
4. Active Composition: Any active ingredients with explicit numeric amounts/percentages if stated in a table or on the pack.
5. Front-Pack Claims: Key front-of-pack claims if visible (e.g. "48h Deep Moisture, Rich Nourishing Body Cream").
6. Clinical Synthesis: Concise 1-2 sentence evidence synthesis of how the core active ingredients function.

Return ONLY valid JSON matching this schema:
{
  "productName": "Product Name",
  "brand": "Brand Name",
  "tableComposition": [
    { "name": "Active Ingredient", "amount": "5.0", "unit": "mg" }
  ],
  "extractedIngredientsText": "Aqua, Glycerin, C15-19 Alkane, Cetearyl Alcohol, Paraffinum Liquidum, Isopropyl Palmitate, Glyceryl Stearate SE, Butyrospermum Parkii Butter, Dimethicone, Hydrogenated Coco-Glycerides, Sodium Cetearyl Sulfate, Carbomer, Sodium Hydroxide, Ethylhexylglycerin, Phenoxyethanol, Linalool, Citronellol, Alpha-Isomethyl Ionone, Benzyl Alcohol, Limonene, Parfum",
  "extractedClaimsText": "48h Deep Moisture Care",
  "clinicalSynthesis": "Emollient and humectant-rich barrier repair emulsion combining physiological occlusives with natural hydration agents."
}`;

        const startTime = Date.now();
        console.group(`%c[AI Vision Request] Model: ${candidateModel}`, 'color: #059669; font-weight: bold;');
        console.log('Image Data URL (first 100 chars):', base64DataUrl.slice(0, 100) + '...');
        console.log('Prompt Sent to AI:\n', prompt);
        console.groupEnd();

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
                  { 
                    type: 'image_url', 
                    image_url: { 
                      url: base64DataUrl,
                      detail: 'high'
                    } 
                  }
                ]
              }
            ],
            max_tokens: 1500,
            temperature: 0.1
          })
        });

        const durationMs = Date.now() - startTime;

        if (response.ok) {
          if (onProgress) onProgress(80, 'Cross-referencing extracted actives with PubMed evidence DB...');
          const data = await response.json();
          const rawContent = data.choices?.[0]?.message?.content || '';

          console.group(`%c[AI Vision Response] (${durationMs}ms)`, 'color: #10b981; font-weight: bold;');
          console.log('Raw AI Response Content:\n', rawContent);
          console.log('OpenRouter Usage / Tokens:', data.usage);
          console.groupEnd();
          
          let cleaned = rawContent.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
          cleaned = cleaned.replace(/```json/gi, '').replace(/```/g, '').trim();
          
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

            if (onProgress) onProgress(100, 'Frontier Vision Analysis Complete!');

            return {
              productName: prodName,
              brand: brandName,
              ingredientText: ingText,
              claimText: claimText,
              analysis,
              source: 'openrouter_vision',
              debugTrace: {
                model: candidateModel,
                prompt,
                rawResponse: rawContent,
                parsedJson: parsed,
                imageThumbnail: base64DataUrl,
                durationMs,
                tokens: data.usage,
                timestamp: new Date().toLocaleTimeString()
              }
            };
          }
        }
      } catch (err) {
        console.warn(`Direct photo extraction model ${candidateModel} failed, trying next:`, err);
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
            source: 'openrouter_vision',
            debugTrace: {
              model,
              prompt,
              rawResponse: rawContent,
              parsedJson: parsed,
              tokens: data.usage,
              timestamp: new Date().toLocaleTimeString()
            }
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
