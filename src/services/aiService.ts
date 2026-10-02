import { analyzeLabelText } from './analyzer';
import { MOSAIC_PRODUCTS_CATALOG } from '../data/mosaicProducts';
import { ProductAnalysisResult, WellnessGoal, MosaicProduct } from '../types';

export const POPULAR_OPENROUTER_MODELS = [
  { id: 'google/gemma-4-31b:free', name: 'Google: Gemma 4 31B Multimodal (Free)' },
  { id: 'google/gemma-4-26b-a4b:free', name: 'Google: Gemma 4 26B A4B MoE (Free)' },
  { id: 'google/gemini-2.0-flash-exp:free', name: 'Google: Gemini 2.0 Flash (Free)' },
  { id: 'qwen/qwen-2.5-vl-72b-instruct:free', name: 'Qwen 2.5 VL 72B Vision (Free)' },
  { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B Instruct (Free)' },
  { id: 'deepseek/deepseek-r1:free', name: 'DeepSeek R1 Reasoning (Free)' }
];

export async function analyzeIngredientsWithAI(
  ingredientText: string,
  imageThumbnail?: string,
  goal: WellnessGoal = 'hair_health',
  productName: string = 'Scanned Product',
  apiKey?: string,
  model: string = 'google/gemini-2.0-flash-exp:free'
): Promise<ProductAnalysisResult> {
  // If user provided an OpenRouter API key, we can query OpenRouter
  if (apiKey && apiKey.trim().length > 5) {
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
      if (imageThumbnail && (model.includes('gemini') || model.includes('vl'))) {
        messages.push({
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: imageThumbnail } }
          ]
        });
      } else {
        messages.push({
          role: 'user',
          content: prompt
        });
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
          model: model || 'google/gemini-2.0-flash-exp:free',
          messages,
          temperature: 0.2
        })
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || '';
        const cleaned = content.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        
        // Merge with local rule-based verification for maximum accuracy & PubMed references
        const localResult = analyzeLabelText(ingredientText, '', goal, productName);
        
        if (parsed.synthesisText) {
          localResult.summary.synthesisText = parsed.synthesisText;
        }
        return localResult;
      }
    } catch (e) {
      console.warn('OpenRouter API call failed or timed out, falling back to local clinical engine:', e);
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
    // Check goal match
    const goalMatches = p.targetGoal === goal;
    
    // Check ingredient synergy
    const ingredientMatches = p.keyIngredients.some(ing => 
      normalizedActives.some(act => act.includes(ing.toLowerCase()) || ing.toLowerCase().includes(act))
    );

    return goalMatches || ingredientMatches;
  });

  return matches.slice(0, 3);
}
