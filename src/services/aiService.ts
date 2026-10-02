import { analyzeLabelText, performBrowserOCR, fileToBase64DataUrl } from './analyzer';
import { MOSAIC_PRODUCTS_CATALOG } from '../data/mosaicProducts';
import { ProductAnalysisResult, WellnessGoal, MosaicProduct } from '../types';

export const POPULAR_OPENROUTER_MODELS = [
  { id: 'openrouter/free', name: 'OpenRouter Free Multimodal Router (Auto / Fast)' },
  { id: 'google/gemma-4-31b-it:free', name: 'Google: Gemma 4 31B Multimodal (Free)' },
  { id: 'google/gemma-4-26b-a4b-it:free', name: 'Google: Gemma 4 26B A4B MoE (Free)' },
  { id: 'qwen/qwen3.8-27b:free', name: 'Qwen: Qwen3.8 27B Vision (Free)' }
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
 * Direct Vision AI Extraction for bottle/packaging photos.
 * Vision LLMs read curved packaging, tiny typography, and chemical formulas with high accuracy.
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

  // 1. If OpenRouter API key is available, use Multimodal Vision AI with smart model fallback
  if (apiKey && apiKey.trim().length > 5) {
    const candidateModels = [
      model && model !== 'local' ? model : 'openrouter/free',
      'openrouter/free',
      'google/gemma-4-31b-it:free',
      'google/gemma-4-26b-a4b-it:free',
      'qwen/qwen3.8-27b:free'
    ];
    // Remove duplicates
    const uniqueModels = [...new Set(candidateModels)];

    for (const candidateModel of uniqueModels) {
      try {
        if (onProgress) onProgress(25, `Multimodal Vision AI reading bottle label (${candidateModel.split('/')[1] || candidateModel})...`);

        const prompt = `You are an expert cosmetic dermatologist, formulation chemist, and high-precision label reader.
Analyze this cosmetic / supplement / wellness product packaging photo carefully.

Instructions:
1. Product Name: Read the main product title (e.g. "Deep Sleep Gummies", "Salicylic Acid Body Wash").
2. Brand Name: Identify the brand if visible.
3. Ingredients List: Transcribe ALL active ingredients, vitamins, botanical extracts, minerals, and base components accurately in order, fixing optical blur/artifacts into standard INCI names separated by commas (e.g. "Melatonin 5mg, L-Theanine 10mg, Tart Cherry Extract 200mg, Chamomile Extract 10mg, Vitamin D2 15mcg, Liquid Glucose, Sugar, Pectin, Citric Acid").
4. Front-Pack Claims: Extract all marketing or clinical claims (e.g. "Clinically Proven", "Supports Deep Sleep", "100% RDA Vitamin D", "Non-Habit Forming").
5. Explain EVERY single ingredient on the bottle (actives, humectants, carriers, preservatives, botanicals).

Return ONLY valid JSON in this exact structure:
{
  "productName": "Exact product name",
  "brand": "Brand name",
  "extractedIngredientsText": "Melatonin 5mg, L-Theanine 10mg, Tart Cherry Extract 200mg, Chamomile Extract 10mg, Vitamin D2 15mcg, Pectin...",
  "extractedClaimsText": "Supports Deep Sleep, 100% RDA...",
  "clinicalSynthesis": "Summary note for goal ${userGoal}...",
  "ingredientsDetailed": [
    {
      "name": "Melatonin 5mg",
      "purpose": "Circadian chronobiotic active",
      "tier": "strong_evidence",
      "explanation": "Clinically proven to lower sleep latency and regulate sleep-wake cycles."
    }
  ]
}`;

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey.trim()}`,
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

          const ingText = parsed.extractedIngredientsText || '';
          const claimText = parsed.extractedClaimsText || '';
          const prodName = parsed.productName || 'Audited Product';
          const brandName = parsed.brand || '';

          if (ingText && ingText.trim().length > 3) {
            // Run through our clinical evidence & claims evaluation matrix
            const analysis = analyzeLabelText(ingText, claimText, userGoal, prodName);
            if (parsed.clinicalSynthesis) {
              analysis.summary.synthesisText = parsed.clinicalSynthesis;
            }

            // If Vision model provided detailed ingredient notes, merge them
            if (parsed.ingredientsDetailed && Array.isArray(parsed.ingredientsDetailed)) {
              parsed.ingredientsDetailed.forEach((item: any) => {
                if (!item.name) return;
                const existing = analysis.detectedIngredients.find(
                  d => d.ingredient.name.toLowerCase().includes(item.name.toLowerCase()) || 
                       item.name.toLowerCase().includes(d.ingredient.name.toLowerCase())
                );
                if (existing && item.explanation) {
                  existing.explanation = item.explanation;
                }
              });
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

  // 2. Fallback: Canvas-enhanced Tesseract OCR + Local Clinical Matrix
  if (onProgress) onProgress(30, 'Running enhanced local image OCR...');
  const ocrText = await performBrowserOCR(imageSource, (p, s) => {
    if (onProgress) onProgress(30 + Math.round(p * 0.6), s);
  });

  const analysis = analyzeLabelText(ocrText, '', userGoal, 'Scanned Product');
  
  // Assemble a pristine clean list of detected actives & carriers
  const cleanList = analysis.detectedIngredients.map(d => {
    return d.doesLabelDiscloseDose && d.rawTextMatch ? d.rawTextMatch : d.ingredient.name;
  }).join(', ');

  const finalIngredientText = (cleanList && cleanList.length > 5) ? cleanList : ocrText;

  if (onProgress) onProgress(100, 'Analysis Complete');

  return {
    productName: 'Scanned Product',
    brand: '',
    ingredientText: finalIngredientText,
    claimText: '',
    analysis,
    source: 'local_ocr'
  };
}

export async function analyzeIngredientsWithAI(
  ingredientText: string,
  imageThumbnail?: string,
  goal: WellnessGoal = 'hair_health',
  productName: string = 'Scanned Product',
  apiKey?: string,
  model: string = 'openrouter/free'
): Promise<ProductAnalysisResult> {
  // If user provided an OpenRouter API key, query OpenRouter for reasoning
  if (apiKey && apiKey.trim().length > 5 && ingredientText && ingredientText.trim().length > 5) {
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
          'Authorization': `Bearer ${apiKey.trim()}`,
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
