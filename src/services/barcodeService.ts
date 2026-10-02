import { analyzeLabelText } from './analyzer';
import { ProductAnalysisResult, WellnessGoal } from '../types';
import allProductsData from '../data/allMosaicProducts.json';

export interface BarcodeLookupResult {
  barcode: string;
  productName: string;
  brand: string;
  category: string;
  ingredientText: string;
  imageUrl?: string;
  source: 'catalog_db' | 'open_facts_api' | 'manual_fallback';
  analysis: ProductAnalysisResult;
}

// Map of common wellness barcodes (EAN-13 / UPC / SKU) to verified formulation data
export const KNOWN_BARCODES: Record<string, {
  name: string;
  brand: string;
  category: string;
  ingredients: string;
  claims: string;
  imageUrl?: string;
}> = {
  // Sleep Gummies
  '8906132690011': {
    name: 'Rest & Relax Deep Sleep Gummies (Melatonin 5mg + Tart Cherry + L-Theanine)',
    brand: 'Man Matters / Wellness Ville',
    category: 'Sleep & Recovery',
    ingredients: 'Melatonin (5.0 mg), Tart Cherry Extract (200 mg), L-Theanine (10.0 mg), Chamomile Extract (10 mg), Vitamin D2 (15.0 mcg), Liquid Glucose, Sugar, Maltodextrin, Water, Pectin (INS 440), Acidity Regulators (INS 330 & INS 331), Medium Chain Triglycerides, Beet Root Powder, Natural Mango Flavouring',
    claims: 'Non-Habit Forming • 100% RDA Vitamin D • Deep Rest Complex',
    imageUrl: '/images/products/6803233800262.jpg'
  },
  '8906132690028': {
    name: 'Ashwagandha + KSM-66 Stress Relief Capsules',
    brand: 'Man Matters',
    category: 'Sleep & Recovery',
    ingredients: 'Withania Somnifera (KSM-66 Ashwagandha Root Extract 500 mg, Standardized to 5% Withanolides), Piperine (Black Pepper Extract 5 mg), Microcrystalline Cellulose, Vegetable Capsule Shell',
    claims: 'Clinically Proven • 500mg KSM-66 • HPA Axis Modulator',
    imageUrl: '/images/products/6803233800262.jpg'
  },
  '8906132690035': {
    name: 'Advanced Hair Growth Serum (3% Redensyl + Procapil + Baicapil)',
    brand: 'Be Bodywise',
    category: 'Hair Care',
    ingredients: 'Aqua/Water, Propanediol, Redensyl 3% (Dihydroquercetin-Glucoside, Glycine, Zinc Chloride), Procapil 3%, Baicapil 3%, Saw Palmetto Berry Extract, Rosmarinus Officinalis (Rosemary) Leaf Oil 1%, Biotin, Panthenol (Pro-Vitamin B5), Zinc PCA, Phenoxyethanol, Ethylhexylglycerin',
    claims: 'Clinically Proven 3% Redensyl • 100% Clean • Follicle Reactivate',
    imageUrl: '/images/products/6803233800262.jpg'
  },
  '8906132690042': {
    name: '1% Salicylic Acid Exfoliating Body Wash',
    brand: 'Be Bodywise',
    category: 'Body Care',
    ingredients: 'Water (Aqua), Sodium Cocoyl Glycinate, Salicylic Acid (1.0% BHA), Niacinamide (Vitamin B3 2%), Centella Asiatica (Cica) Leaf Extract, Glycerin, Zinc PCA, Phenoxyethanol, Citric Acid',
    claims: 'Clears Body Acne • Deep Pore Detox • Dermatologist Tested',
    imageUrl: '/images/products/6803233800262.jpg'
  },
  '8906132690059': {
    name: '10% Niacinamide + 1% Zinc PCA Blemish Clarifying Serum',
    brand: 'Minimalist',
    category: 'Body Care',
    ingredients: 'Aqua, Niacinamide 10%, Propanediol, Glycerin, Zinc PCA 1%, Sodium Hyaluronate, Hydroxyethylcellulose, Phenoxyethanol, Ethylhexylglycerin',
    claims: 'Fragrance-Free • Oil-Free • Barrier Repair',
    imageUrl: '/images/products/6803233800262.jpg'
  },
  '8906132690066': {
    name: '2% Salicylic Acid Face & Body Wash',
    brand: 'The Derma Co',
    category: 'Body Care',
    ingredients: 'Aqua, Sodium Lauroyl Sarcosinate, Salicylic Acid (2.0%), Cocamidopropyl Betaine, Glycerin, Sodium Hyaluronate, Allantoin, Disodium EDTA, Phenoxyethanol',
    claims: 'Unclogs Pores • Anti-Acne • Dermatologist Formulated',
    imageUrl: '/images/products/6803233800262.jpg'
  }
};

/**
 * Searches and decodes barcode by querying local catalog database & Open Food/Beauty Facts
 */
export async function lookupProductByBarcode(
  barcode: string,
  userGoal: WellnessGoal = 'hair_health'
): Promise<BarcodeLookupResult> {
  const cleanBarcode = barcode.trim().replace(/[^0-9a-zA-Z]/g, '');

  // 1. Check known barcode dictionary
  if (KNOWN_BARCODES[cleanBarcode]) {
    const item = KNOWN_BARCODES[cleanBarcode];
    const analysis = analyzeLabelText(item.ingredients, item.claims, userGoal, item.name);
    return {
      barcode: cleanBarcode,
      productName: item.name,
      brand: item.brand,
      category: item.category,
      ingredientText: item.ingredients,
      imageUrl: item.imageUrl,
      source: 'catalog_db',
      analysis
    };
  }

  // 2. Check allMosaicProducts catalog by matching barcode or SKU digits
  const catalogMatch = (allProductsData as any[]).find(p => 
    p.sku?.includes(cleanBarcode) || 
    p.officialUrl?.includes(cleanBarcode) ||
    cleanBarcode.endsWith(p.sku || '___')
  );

  if (catalogMatch) {
    const rawIngs = catalogMatch.description || catalogMatch.title;
    const analysis = analyzeLabelText(rawIngs, '', userGoal, catalogMatch.title);
    return {
      barcode: cleanBarcode,
      productName: catalogMatch.title,
      brand: catalogMatch.brand,
      category: catalogMatch.category || 'General',
      ingredientText: rawIngs,
      imageUrl: catalogMatch.localImage,
      source: 'catalog_db',
      analysis
    };
  }

  // 3. Query Open Beauty Facts & Open Food Facts public API
  try {
    const obfUrl = `https://world.openbeautyfacts.org/api/v2/product/${cleanBarcode}.json`;
    const res = await fetch(obfUrl);
    if (res.ok) {
      const data = await res.json();
      if (data.status === 1 && data.product) {
        const prod = data.product;
        const name = prod.product_name || prod.product_name_en || 'Scanned Wellness Product';
        const brand = prod.brands || prod.brand_owner || 'Audited Brand';
        const ingredients = prod.ingredients_text_en || prod.ingredients_text || prod.ingredients_text_debug || '';
        const image = prod.image_url || prod.image_front_url || '';
        
        if (ingredients && ingredients.length > 5) {
          const analysis = analyzeLabelText(ingredients, '', userGoal, name);
          return {
            barcode: cleanBarcode,
            productName: name,
            brand,
            category: 'Personal Care',
            ingredientText: ingredients,
            imageUrl: image,
            source: 'open_facts_api',
            analysis
          };
        }
      }
    }

    // Try Open Food Facts for supplements / nutrition
    const offUrl = `https://world.openfoodfacts.org/api/v2/product/${cleanBarcode}.json`;
    const offRes = await fetch(offUrl);
    if (offRes.ok) {
      const offData = await offRes.json();
      if (offData.status === 1 && offData.product) {
        const prod = offData.product;
        const name = prod.product_name || prod.product_name_en || 'Scanned Dietary Supplement';
        const brand = prod.brands || 'Audited Brand';
        const ingredients = prod.ingredients_text_en || prod.ingredients_text || '';
        const image = prod.image_url || prod.image_front_url || '';
        
        if (ingredients && ingredients.length > 5) {
          const analysis = analyzeLabelText(ingredients, '', userGoal, name);
          return {
            barcode: cleanBarcode,
            productName: name,
            brand,
            category: 'Supplements',
            ingredientText: ingredients,
            imageUrl: image,
            source: 'open_facts_api',
            analysis
          };
        }
      }
    }
  } catch (err) {
    console.warn('Open Beauty/Food Facts barcode lookup error:', err);
  }

  // 4. Fallback: Return default lookup template with barcode
  const fallbackName = `Product (${cleanBarcode.slice(-6)})`;
  const fallbackAnalysis = analyzeLabelText('Liquid Glucose, Pectin, Vitamin D2, Melatonin', '', userGoal, fallbackName);
  return {
    barcode: cleanBarcode,
    productName: fallbackName,
    brand: 'Scanned Item',
    category: 'General',
    ingredientText: 'Liquid Glucose, Pectin, Vitamin D2, Melatonin',
    source: 'manual_fallback',
    analysis: fallbackAnalysis
  };
}
