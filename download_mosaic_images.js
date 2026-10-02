import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = path.resolve('public/images/mosaic');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const PRODUCTS_TO_DOWNLOAD = [
  {
    id: 'mw-hair-01',
    name: 'Advanced Hair Growth Serum',
    url: 'https://bebodywise.com/product/advanced-hair-growth-serum',
    fallbackDirect: 'https://i.mscwlns.co/media/misc/pdp_rcl/advanced-hair-growth-serum/IntroPage%20copy%207_kjlbi1.jpg'
  },
  {
    id: 'mw-hair-02',
    name: '1% Ketoconazole Anti-Dandruff Shampoo',
    url: 'https://manmatters.com/dp/1-ketoconazole-shampoo-100-ml/1144207',
    fallbackDirect: 'https://i.mscwlns.co/mosaic-wellness/image/upload/v1642668775/New%20hero%20images/Keto-Power-Shampoo.png'
  },
  {
    id: 'mw-hair-03',
    name: '0.5mm Scalp Activator Derma Roller',
    url: 'https://manmatters.com/dp/hair-activator-derma-roller/591102',
    fallbackDirect: 'https://i.mscwlns.co/mosaic-wellness/image/upload/v1614580439/Man%20Matters/Derma%20roller/Derma-Roller_1600X1200.jpg'
  },
  {
    id: 'mw-body-01',
    name: '1% Salicylic Acid Body Wash',
    url: 'https://bebodywise.com/product/1-salicylic-acid-body-wash',
    fallbackDirect: 'https://i.mscwlns.co/media/misc/pdp_rcl/1-salicylic-acid-body-wash/1%20Salicylic%20Acid%20Body%20Wash%201_s4s8g3.jpg'
  },
  {
    id: 'mw-body-02',
    name: '10% Niacinamide Body Lotion',
    url: 'https://bebodywise.com/product/niacinamide-body-lotion',
    fallbackDirect: 'https://i.mscwlns.co/media/misc/pdp_rcl/niacinamide-body-lotion/Niacinamide%20Body%20Lotion%201_a62wep.jpg'
  },
  {
    id: 'mw-body-03',
    name: '10% AHA Body Scrub',
    url: 'https://bebodywise.com/product/10-aha-body-scrub',
    fallbackDirect: 'https://i.mscwlns.co/media/misc/pdp_rcl/10-aha-body-scrub/10%20AHA%20Body%20Scrub%201_2_s0p48l.jpg'
  },
  {
    id: 'mw-sleep-01',
    name: '5-in-1 Magnesium Glycinate Gummies (60N)',
    url: 'https://bebodywise.com/product/magnesium-glycinate-gummies-60n',
    fallbackDirect: 'https://i.mscwlns.co/media/misc/pdp_rcl/magnesium-glycinate-gummies-60n/IntroPage_1.jpg'
  },
  {
    id: 'mw-sleep-02',
    name: '10% Magnesium Body Lotion',
    url: 'https://bebodywise.com/product/10-magnesium-lotion-300ml',
    fallbackDirect: 'https://i.mscwlns.co/media/misc/pdp_rcl/10-magnesium-lotion-300ml/10%25%20Magnesium%20Lotion%201_b12j4m.jpg'
  }
];

async function downloadFile(url, destPath) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length < 1000) throw new Error('File too small or invalid');
    fs.writeFileSync(destPath, buffer);
    console.log(`✓ Downloaded ${path.basename(destPath)} (${Math.round(buffer.length / 1024)} KB)`);
    return true;
  } catch (err) {
    console.warn(`  Failed downloading ${url}:`, err.message);
    return false;
  }
}

async function run() {
  console.log('--- Starting Mosaic Wellness Product Image Downloader ---');
  for (const item of PRODUCTS_TO_DOWNLOAD) {
    const dest = path.join(OUTPUT_DIR, `${item.id}.jpg`);
    console.log(`\nProcessing [${item.id}] ${item.name}...`);
    
    // First try scraping product page for main hero image
    let foundUrl = '';
    try {
      const pageRes = await fetch(item.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      if (pageRes.ok) {
        const html = await pageRes.text();
        const matches = [...html.matchAll(/https:\/\/i\.mscwlns\.co\/[^"'\s\)]+\.(?:jpg|jpeg|png|webp)/gi)].map(m => m[0]);
        // Find best product hero image (exclude logos/icons)
        const productImgs = matches.filter(u => 
          !u.includes('logo') && 
          !u.includes('favicon') && 
          !u.includes('icon') && 
          !u.includes('rating') &&
          (u.includes('pdp_rcl') || u.includes('upload') || u.includes('product') || u.includes('hero'))
        );
        if (productImgs.length > 0) {
          foundUrl = productImgs[0];
          console.log(`  Found scraped image URL: ${foundUrl.substring(0, 70)}...`);
        }
      }
    } catch (e) {
      // ignore
    }

    let success = false;
    if (foundUrl) {
      success = await downloadFile(foundUrl, dest);
    }
    if (!success && item.fallbackDirect) {
      console.log(`  Trying direct CDN fallback...`);
      success = await downloadFile(item.fallbackDirect, dest);
    }

    // If still failed, create clean SVG fallback
    if (!success) {
      console.log(`  Generating high-res product graphic for ${item.id}...`);
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600" fill="none">
        <rect width="600" height="600" rx="40" fill="#FAF7F2"/>
        <circle cx="300" cy="280" r="140" fill="#E8E2D5" opacity="0.6"/>
        <path d="M260 200 H340 V380 C340 400 320 420 300 420 C280 420 260 400 260 380 Z" fill="#2E4A3D" opacity="0.85"/>
        <rect x="275" y="160" width="50" height="40" rx="8" fill="#1C3026"/>
        <text x="300" y="490" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="bold" font-size="22" fill="#1C3026">${item.name}</text>
        <text x="300" y="525" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="600" font-size="16" fill="#6B7280">Mosaic Wellness Formulation</text>
      </svg>`;
      fs.writeFileSync(path.join(OUTPUT_DIR, `${item.id}.svg`), svg);
      console.log(`✓ Created SVG fallback for ${item.id}`);
    }
  }
  console.log('\n--- Finished downloading Mosaic product images to public/images/mosaic/ ---');
}

run();
