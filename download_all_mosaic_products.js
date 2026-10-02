import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = path.resolve('public/images/products');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const rawData = JSON.parse(fs.readFileSync('mosaic_products_extracted.json', 'utf8'));

// Generate a clean safe filename from SKU or product name
function getSafeFileName(item, idx) {
  if (item.sku && item.sku.trim().length > 0) {
    return item.sku.replace(/[^a-zA-Z0-9_\-]/g, '_').toLowerCase();
  }
  const cleanTitle = (item.product || `product_${idx}`).replace(/[^a-zA-Z0-9_\-]/g, '_').toLowerCase();
  return cleanTitle.substring(0, 40);
}

async function fetchImageForProduct(item, idx) {
  const filename = `${getSafeFileName(item, idx)}.jpg`;
  const destPath = path.join(OUTPUT_DIR, filename);
  const localRelativeUrl = `/images/products/${filename}`;

  // If already downloaded, skip
  if (fs.existsSync(destPath) && fs.statSync(destPath).size > 1000) {
    return { ...item, localImageUrl: localRelativeUrl, status: 'cached' };
  }

  if (!item.url || !item.url.startsWith('http')) {
    return { ...item, localImageUrl: null, status: 'no_url' };
  }

  try {
    const pageRes = await fetch(item.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      signal: AbortSignal.timeout(8000)
    });

    if (!pageRes.ok) throw new Error(`HTTP ${pageRes.status}`);
    const html = await pageRes.text();

    const matches = [...html.matchAll(/https:\/\/i\.mscwlns\.co\/[^"'\s\)]+\.(?:jpg|jpeg|png|webp)/gi)].map(m => m[0]);
    const productImgs = matches.filter(u => 
      !u.includes('logo') && 
      !u.includes('favicon') && 
      !u.includes('icon') && 
      !u.includes('rating') &&
      !u.includes('apple-touch')
    );

    if (productImgs.length === 0) {
      return { ...item, localImageUrl: null, status: 'no_img_found' };
    }

    const imgUrl = productImgs[0];
    const imgRes = await fetch(imgUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      signal: AbortSignal.timeout(8000)
    });

    if (!imgRes.ok) throw new Error(`Image HTTP ${imgRes.status}`);
    const buffer = Buffer.from(await imgRes.arrayBuffer());
    if (buffer.length < 500) throw new Error('File too small');

    fs.writeFileSync(destPath, buffer);
    return { ...item, localImageUrl: localRelativeUrl, status: 'downloaded', sizeKB: Math.round(buffer.length / 1024) };
  } catch (err) {
    return { ...item, localImageUrl: null, status: 'failed', error: err.message };
  }
}

// Concurrency pool helper
async function mapConcurrent(items, limit, fn, onProgress) {
  const results = new Array(items.length);
  let currentIndex = 0;
  let completed = 0;

  const workers = Array(limit).fill(0).map(async () => {
    while (currentIndex < items.length) {
      const idx = currentIndex++;
      const item = items[idx];
      results[idx] = await fn(item, idx);
      completed++;
      if (onProgress) onProgress(completed, items.length, results[idx]);
    }
  });

  await Promise.all(workers);
  return results;
}

async function run() {
  console.log(`--- Starting Batch Downloader for ${rawData.length} Mosaic Wellness Products ---`);
  console.log(`Saving images locally to: ${OUTPUT_DIR}\n`);

  const results = await mapConcurrent(
    rawData,
    6, // Concurrency limit of 6 to be lightweight on network and CPU
    fetchImageForProduct,
    (completed, total, res) => {
      if (completed % 15 === 0 || completed === total) {
        console.log(`Progress: ${completed}/${total} products processed (${Math.round((completed / total) * 100)}%)`);
      }
      if (res.status === 'downloaded') {
        console.log(`  ✓ [${completed}/${total}] Saved ${path.basename(res.localImageUrl)} (${res.sizeKB} KB) - ${res.product?.substring(0, 35)}`);
      }
    }
  );

  const downloadedCount = results.filter(r => r.localImageUrl).length;
  console.log(`\n=== Batch Download Complete: ${downloadedCount}/${rawData.length} images saved locally! ===`);

  // Write catalog mapping file
  fs.writeFileSync('src/data/allMosaicProducts.json', JSON.stringify(results, null, 2));
  console.log(`Updated catalog mapping: src/data/allMosaicProducts.json`);
}

run();
