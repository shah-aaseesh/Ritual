import { analyzeLabelText, performBrowserOCR, fileToBase64DataUrl, cleanAndNormalizeOCRText, sanitizeIngredientList, isPureIngredient } from './analyzer';
import { MOSAIC_PRODUCTS_CATALOG } from '../data/mosaicProducts';
import { ProductAnalysisResult, WellnessGoal, MosaicProduct } from '../types';

export const POPULAR_OPENROUTER_MODELS = [
  { id: 'google/gemini-3.1-flash-lite', name: 'Google: Gemini 3.1 Flash-Lite (Ultra-Fast <1s Response)' },
  { id: 'google/gemini-3.5-flash', name: 'Google: Gemini 3.5 Flash (Free AI Studio Engine)' },
  { id: 'google/gemini-3.8-flash', name: 'Google: Gemini 3.8 Flash (Frontier AI Studio Engine)' }
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
 * Direct Google AI Studio Gemini 3.1/3.5 Flash Multimodal Vision
 * Ultra-fast sub-second multimodal vision directly from Google
 */
export async function extractLabelWithGeminiDirect(
  base64DataUrl: string,
  userGoal: WellnessGoal = 'hair_health',
  geminiApiKey?: string,
  modelName: string = 'gemini-3.1-flash-lite',
  onProgress?: (percent: number, status: string) => void
): Promise<VisionLabelExtractionResult | null> {
  const effectiveKey = (geminiApiKey && geminiApiKey.trim().length > 5)
    ? geminiApiKey.trim()
    : (import.meta as any).env?.VITE_GEMINI_API_KEY || '';

  if (!effectiveKey) return null;

  if (onProgress) onProgress(35, `Reading packaging with Google Gemini (Ultra-Fast Vision)...`);

  const base64Pure = base64DataUrl.replace(/^data:image\/\w+;base64,/, '');
  const mimeMatch = base64DataUrl.match(/^data:(image\/\w+);base64,/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';

  const candidateGeminiModels = [modelName, 'gemini-3.1-flash-lite', 'gemini-3.5-flash', 'gemini-3.8-flash'];
  const uniqueModels = [...new Set(candidateGeminiModels.map(m => m.replace(/^models\//, '').replace(/^google\//, '')))];

  for (const geminiModel of uniqueModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${effectiveKey}`;
      const startTime = Date.now();

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{
              text: 'You are an expert clinical pharmacologist, cosmetic chemist, and label transcriber. Your critical task is to extract ALL THE INGREDIENTS and ONLY INGREDIENTS from the packaging image. STRICTLY exclude directions for use, usage recommendations, storage instructions, safety warnings, manufacturer information, distributor addresses, FSSAI numbers, batch codes, and nutrition facts tables (Calories, Carbs, Fat, Protein). Output only pure ingredients in exact order.'
            }]
          },
          contents: [{
            parts: [
              {
                text: `Extract ALL the ingredients and ONLY ingredients from this product packaging photo.
Transcribe EVERY single chemical, botanical, vitamin, and active ingredient word-for-word in the exact order listed on the bottle.
Do NOT include any directions, warnings, storage, manufacturer details, or nutrition facts.

Output in this clean format:
**Brand:** [Brand name if visible, or Unknown]
**Product Name:** [Product name if visible, or Scanned Product]
**Ingredients:** [Complete comma-separated list containing ALL ingredients and ONLY ingredients, without skipping or summarizing any item]`
              },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Pure
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.0,
            thinkingConfig: {
              thinkingBudget: 0
            },
            maxOutputTokens: 1024
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const durationMs = Date.now() - startTime;
        const candidate = data.candidates?.[0];
        const rawText = candidate?.content?.parts?.map((p: any) => p.text).filter(Boolean).join('\n') || '';

        let cleaned = rawText.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

        // Extract Brand
        let brandName = '';
        const brandMatch = cleaned.match(/\*\*Brand:\*\*\s*([^\n]+)/i) || cleaned.match(/Brand:\s*([^\n]+)/i);
        if (brandMatch && !/unknown|none|n\/a/i.test(brandMatch[1])) {
          brandName = brandMatch[1].trim();
        }

        // Extract Product Name
        let prodName = 'Scanned Product';
        const prodMatch = cleaned.match(/\*\*Product Name:\*\*\s*([^\n]+)/i) || cleaned.match(/Product Name:\s*([^\n]+)/i);
        if (prodMatch && !/unknown|none|n\/a/i.test(prodMatch[1])) {
          prodName = prodMatch[1].trim();
        }

        // Extract Ingredients section
        let ingredientSection = cleaned;
        const ingMatch = cleaned.match(/\*\*Ingredients:\*\*\s*([\s\S]+)/i) || cleaned.match(/Ingredients:\s*([\s\S]+)/i);
        if (ingMatch) {
          ingredientSection = ingMatch[1];
        }

        // Harvest all ingredient lines / tokens
        const rawTokens = ingredientSection
          .replace(/[|—–_•·\*]/g, ',')
          .split(/[,;\n]/)
          .map((s: string) => s.trim())
          .filter((s: string) => s.length > 1);

        const sanitized = sanitizeIngredientList(rawTokens);
        const finalIngText = sanitized.length > 0 ? sanitized.join(', ') : cleanAndNormalizeOCRText(rawText);

        if (finalIngText && finalIngText.trim().length > 3) {
          const analysis = analyzeLabelText(finalIngText, '', userGoal, prodName);

          if (onProgress) onProgress(100, 'Gemini 3.5 Flash Vision Analysis Complete!');

          return {
            productName: prodName,
            brand: brandName,
            ingredientText: finalIngText,
            claimText: '',
            analysis,
            source: 'openrouter_vision',
            debugTrace: {
              model: `Google AI Studio: ${geminiModel}`,
              prompt: 'System Instruction + Multimodal Image Transcription',
              rawResponse: rawText,
              imageThumbnail: base64DataUrl,
              durationMs,
              tokens: data.usageMetadata,
              timestamp: new Date().toLocaleTimeString()
            }
          };
        }
      }
    } catch (err) {
      console.warn(`Gemini direct extraction with ${geminiModel} failed, trying next:`, err);
    }
  }

  return null;
}

/**
 * Resizes and compresses image to max 2048px with high clarity for GPT-4o / Gemini multi-tile vision
 */
export async function optimizeImageForVisionAI(fileOrDataUrl: File | string, maxDimension = 1024): Promise<string> {
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
      resolve(canvas.toDataURL('image/jpeg', 0.80));
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
 * High-Resolution Multimodal Extraction:
 * Prioritizes Direct Google AI Studio Gemini 3.5 Flash (Free & Instant)
 * or Direct GPT-4o Vision, extracting active doses & excipients and discarding packaging noise.
 */
export async function extractLabelFromImageWithAI(
  imageSource: File | string,
  userGoal: WellnessGoal = 'hair_health',
  apiKey?: string,
  model: string = 'google/gemini-3.1-flash-lite',
  onProgress?: (percent: number, status: string) => void
): Promise<VisionLabelExtractionResult> {
  if (onProgress) onProgress(15, 'Enhancing high-res packaging photo for AI Vision...');
  const base64DataUrl = await optimizeImageForVisionAI(imageSource);

  // 1. Direct Google AI Studio Gemini Multimodal Vision (Free & Instant <1s)
  const geminiEnvKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
  const isGeminiRequested = model.includes('gemini') || (apiKey && (apiKey.startsWith('AQ.') || apiKey.startsWith('AIza')));

  if (geminiEnvKey || isGeminiRequested) {
    const geminiResult = await extractLabelWithGeminiDirect(
      base64DataUrl,
      userGoal,
      (apiKey && (apiKey.startsWith('AQ.') || apiKey.startsWith('AIza'))) ? apiKey : geminiEnvKey,
      model.replace('google/', ''),
      onProgress
    );
    if (geminiResult) {
      return geminiResult;
    }
  }

  const effectiveApiKey = (apiKey && apiKey.trim().length > 5) 
    ? apiKey.trim() 
    : (import.meta as any).env?.VITE_OPENROUTER_API_KEY || '';

  // 2. Multimodal Vision via OpenRouter (GPT-4o, DeepSeek, etc.)
  if (effectiveApiKey && effectiveApiKey.length > 5) {
    const candidateModels = [
      model && model !== 'local' ? model : 'openai/gpt-4o',
      'openai/gpt-4o',
      'openai/gpt-4o-2024-11-20',
      'deepseek/deepseek-v4.1-flash',
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
            const jsonMatch = cleaned.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
            if (jsonMatch) {
              try { parsed = JSON.parse(jsonMatch[0]); } catch (e) { /* fallback */ }
            }
          }

          // Comprehensively harvest all ingredients across all potential JSON keys or arrays
          const harvestedTokens: string[] = [];
          
          if (Array.isArray(parsed)) {
            parsed.forEach((item: any) => {
              if (typeof item === 'string') harvestedTokens.push(item);
              else if (item && typeof item === 'object') {
                const name = item.name || item.ingredient || item.active || '';
                const dose = item.dose || (item.amount ? `${item.amount} ${item.unit || ''}` : '');
                if (name) harvestedTokens.push(dose ? `${name.trim()} (${dose.trim()})` : name.trim());
              }
            });
          } else if (parsed && typeof parsed === 'object') {
            const candidateKeys = [
              'extractedIngredientsText',
              'fullIngredientsList',
              'ingredients',
              'ingredientsList',
              'ingredientList',
              'allIngredients',
              'extractedIngredients',
              'rawIngredients',
              'composition',
              'ingredients_text'
            ];

            for (const key of candidateKeys) {
              const val = parsed[key];
              if (typeof val === 'string' && val.trim().length > 2) {
                harvestedTokens.push(...val.split(/[,;\n•·]/));
              } else if (Array.isArray(val)) {
                val.forEach((item: any) => {
                  if (typeof item === 'string') harvestedTokens.push(item);
                  else if (item && typeof item === 'object') {
                    const name = item.name || item.ingredient || item.active || '';
                    const dose = item.dose || (item.amount ? `${item.amount} ${item.unit || ''}` : '');
                    if (name) harvestedTokens.push(dose ? `${name.trim()} (${dose.trim()})` : name.trim());
                  }
                });
              }
            }

            // Also harvest active / table composition
            const tableData = parsed.tableComposition || parsed.activesWithDose || parsed.activeComposition || parsed.actives;
            if (Array.isArray(tableData)) {
              tableData.forEach((item: any) => {
                if (typeof item === 'string') harvestedTokens.push(item);
                else if (item && typeof item === 'object') {
                  const name = item.name || item.ingredient || item.active || '';
                  const dose = item.dose || (item.amount ? `${item.amount} ${item.unit || ''}` : '');
                  if (name) harvestedTokens.push(dose ? `${name.trim()} (${dose.trim()})` : name.trim());
                }
              });
            }
          }

          // If JSON extraction found nothing or only 1 item, parse entire raw LLM content
          if (harvestedTokens.length < 2) {
            const rawFallbackText = cleanAndNormalizeOCRText(rawContent);
            if (rawFallbackText) {
              harvestedTokens.push(...rawFallbackText.split(/[,;\n•·]/));
            }
          }

          const sanitizedList = sanitizeIngredientList(harvestedTokens);
          const ingText = sanitizedList.length > 0 ? sanitizedList.join(', ') : cleanAndNormalizeOCRText(rawContent);

          const claimText = Array.isArray(parsed?.claims) 
            ? parsed.claims.join(', ') 
            : (parsed?.extractedClaimsText || parsed?.claims || '');
          const prodName = parsed?.productName || parsed?.name || 'Audited Product';
          const brandName = parsed?.brand || parsed?.brandName || '';

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

export async function denoiseAndStructureOCRWithLLM(
  rawOCRText: string,
  userGoal: WellnessGoal = 'hair_health',
  apiKey?: string,
  onProgress?: (percent: number, status: string) => void,
  preferredModel: string = 'gemini-3.1-flash-lite'
): Promise<VisionLabelExtractionResult | null> {
  const effectiveGeminiKey = (apiKey && (apiKey.startsWith('AQ.') || apiKey.startsWith('AIza')))
    ? apiKey.trim()
    : (import.meta as any).env?.VITE_GEMINI_API_KEY || '';

  if (!rawOCRText || rawOCRText.trim().length < 5) {
    return null;
  }

  if (onProgress) onProgress(50, 'Google Gemini isolating pure ingredients & dosages...');

  const prompt = `You are an expert clinical pharmacologist, cosmetic chemist, and label transcriber.
Extract ONLY pure ingredients and active substances with exact dosages from this label text.

Raw Packaging Text:
---
${rawOCRText}
---

CRITICAL EXTRACTION RULES:
1. "productName": Clean name of the product.
2. "brand": Brand name if present.
3. "ingredients": Array of pure individual chemical/botanical/carrier ingredient names in exact order.
   - STRICTLY DISCARD and EXCLUDE:
     * Usage / dosage instructions (e.g. "Take 1 gummy", "Apply 2-3 drops", "Massage gently", "Swallow with water")
     * Warnings and storage notes (e.g. "Store in cool dry place below 25C", "Keep out of reach of children", "Not for medicinal use", "Consult physician")
     * Manufacturer, distributor & packaging boilerplate (e.g. "Marketed by", "Manufactured by", "FSSAI Lic No", "Batch No", "Mfg Date", "Best Before", "MRP", "Net Quantity", "Customer Care")
     * Macronutrient facts table (Energy, Calories, Protein, Carbohydrates, Sugar, Fat, Saturated Fat, Sodium, Cholesterol)
4. "activesWithDose": Array of active ingredients with their exact numeric dose and unit (e.g. [{"name": "Tart Cherry Extract", "dose": "200 mg"}, {"name": "Melatonin", "dose": "5.0 mg"}]).
5. "claims": Array of key front-of-pack claims.
6. "clinicalSynthesis": Concise 1-2 sentence evidence synthesis of how these active ingredients function together.

Return ONLY a valid JSON object matching this schema without markdown fences:
{
  "productName": "string",
  "brand": "string",
  "ingredients": ["string"],
  "activesWithDose": [
    { "name": "string", "dose": "string" }
  ],
  "claims": ["string"],
  "clinicalSynthesis": "string"
}`;

  const geminiModels = [preferredModel.replace('google/', ''), 'gemini-3.1-flash-lite', 'gemini-3.5-flash', 'gemini-3.8-flash'];
  const uniqueModels = [...new Set(geminiModels)];

  if (effectiveGeminiKey) {
    for (const model of uniqueModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${effectiveGeminiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.1, maxOutputTokens: 2048 }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const rawContent = data.candidates?.[0]?.content?.parts?.map((p: any) => p.text).filter(Boolean).join('\n') || '';
          let cleaned = rawContent.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
          cleaned = cleaned.replace(/```json/gi, '').replace(/```/g, '').trim();

          let parsed: any = null;
          try {
            parsed = JSON.parse(cleaned);
          } catch (jsonErr) {
            const jsonMatch = cleaned.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
            if (jsonMatch) {
              try { parsed = JSON.parse(jsonMatch[0]); } catch (e) { /* fallback */ }
            }
          }

          if (parsed) {
            const prodName = parsed.productName || 'Audited Product';
            const brandName = parsed.brand || '';
            const claims = Array.isArray(parsed.claims) ? parsed.claims.join(', ') : (parsed.claims || '');

            const activeDoseStrings: string[] = [];
            const candidateArrayKeys = [
              'ingredients',
              'fullIngredientsList',
              'ingredientsList',
              'ingredientList',
              'allIngredients',
              'extractedIngredients',
              'rawIngredients',
              'composition'
            ];

            const harvestedList: string[] = [];

            if (Array.isArray(parsed)) {
              parsed.forEach((item: any) => {
                if (typeof item === 'string') harvestedList.push(item);
                else if (item && typeof item === 'object') {
                  const name = item.name || item.ingredient || item.active || '';
                  const dose = item.dose || (item.amount ? `${item.amount} ${item.unit || ''}` : '');
                  if (name) activeDoseStrings.push(dose ? `${name.trim()} (${dose.trim()})` : name.trim());
                }
              });
            } else if (parsed && typeof parsed === 'object') {
              for (const key of candidateArrayKeys) {
                const val = parsed[key];
                if (typeof val === 'string' && val.trim().length > 2) {
                  harvestedList.push(...val.split(/[,;\n•·]/));
                } else if (Array.isArray(val)) {
                  val.forEach((item: any) => {
                    if (typeof item === 'string') harvestedList.push(item);
                    else if (item && typeof item === 'object') {
                      const name = item.name || item.ingredient || item.active || '';
                      const dose = item.dose || (item.amount ? `${item.amount} ${item.unit || ''}` : '');
                      if (name) activeDoseStrings.push(dose ? `${name.trim()} (${dose.trim()})` : name.trim());
                    }
                  });
                }
              }

              if (parsed.extractedIngredientsText && typeof parsed.extractedIngredientsText === 'string') {
                harvestedList.push(...parsed.extractedIngredientsText.split(/[,;\n•·]/));
              }

              if (Array.isArray(parsed.activesWithDose)) {
                parsed.activesWithDose.forEach((act: any) => {
                  if (act.name && act.dose && isPureIngredient(act.name)) {
                    activeDoseStrings.push(`${act.name.trim()} (${act.dose.trim()})`);
                  } else if (act.name && isPureIngredient(act.name)) {
                    activeDoseStrings.push(act.name.trim());
                  }
                });
              }
            }

            if (harvestedList.length < 2 && activeDoseStrings.length < 2) {
              const rawFallbackText = cleanAndNormalizeOCRText(rawContent);
              if (rawFallbackText) {
                harvestedList.push(...rawFallbackText.split(/[,;\n•·]/));
              }
            }

            const combinedList: string[] = [...activeDoseStrings, ...harvestedList];
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
                model: `Google AI Studio: ${model}`,
                prompt,
                rawResponse: rawContent,
                parsedJson: parsed,
                tokens: data.usageMetadata,
                timestamp: new Date().toLocaleTimeString()
              }
            };
          }
        }
      } catch (err) {
        console.warn(`Gemini extraction with ${model} failed, trying next:`, err);
      }
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
  goal?: WellnessGoal
): MosaicProduct[] {
  if (!detectedIngredientNames || detectedIngredientNames.length === 0) {
    return [];
  }

  const normalizedInput = detectedIngredientNames.map(n => n.toLowerCase().trim()).filter(Boolean);
  if (normalizedInput.length === 0) return [];

  // Score each catalog product based STRICTLY on real active ingredient matches
  const scored = MOSAIC_PRODUCTS_CATALOG.map(product => {
    let matchScore = 0;
    const matchedIngs: string[] = [];

    for (const keyIng of product.keyIngredients) {
      const keyLower = keyIng.toLowerCase();
      // Ignore common neutral excipients from triggering artificial matches
      if (keyLower === 'glycerin' || keyLower === 'water' || keyLower === 'aqua' || keyLower === 'fragrance') continue;

      const hasMatch = normalizedInput.some(inputIng => {
        if (inputIng === 'water' || inputIng === 'aqua' || inputIng === 'fragrance' || inputIng === 'parfum' || inputIng === 'preservative') return false;
        
        return inputIng.includes(keyLower) || keyLower.includes(inputIng) ||
          (keyLower.includes('melatonin') && inputIng.includes('melatonin')) ||
          (keyLower.includes('magnesium') && inputIng.includes('magnesium')) ||
          (keyLower.includes('theanine') && inputIng.includes('theanine')) ||
          (keyLower.includes('salicylic') && (inputIng.includes('salicylic') || inputIng.includes('bha'))) ||
          (keyLower.includes('niacinamide') && (inputIng.includes('niacinamide') || inputIng.includes('nicotinamide') || inputIng.includes('vitamin b3'))) ||
          (keyLower.includes('redensyl') && inputIng.includes('redensyl')) ||
          (keyLower.includes('procapil') && inputIng.includes('procapil')) ||
          (keyLower.includes('baicapil') && inputIng.includes('baicapil')) ||
          (keyLower.includes('ketoconazole') && inputIng.includes('ketoconazole')) ||
          (keyLower.includes('biotin') && inputIng.includes('biotin')) ||
          (keyLower.includes('saw palmetto') && inputIng.includes('saw palmetto')) ||
          (keyLower.includes('glycolic') && (inputIng.includes('glycolic') || inputIng.includes('aha'))) ||
          (keyLower.includes('lactic') && (inputIng.includes('lactic') || inputIng.includes('aha')));
      });

      if (hasMatch) {
        matchScore += 3;
        matchedIngs.push(keyIng);
      }
    }

    if (matchScore > 0 && goal && product.targetGoal === goal) {
      matchScore += 1;
    }

    return {
      product,
      matchScore,
      matchedIngs
    };
  });

  // STRICT REQUIREMENT: Only products with genuine ingredient matches are returned
  const filtered = scored.filter(item => item.matchScore >= 3);
  filtered.sort((a, b) => b.matchScore - a.matchScore);

  return filtered.map(item => item.product).slice(0, 3);
}
