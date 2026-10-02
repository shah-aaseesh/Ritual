const xlsx = require('xlsx');
const fs = require('fs');

const workbook = xlsx.readFile('Mosaic_Wellness_Brands_and_Products.xlsx');
const sheet = workbook.Sheets['Products'];
const rawData = xlsx.utils.sheet_to_json(sheet, { header: 1 });

const headers = rawData[4];
console.log('Headers:', headers);

const products = [];
for (let i = 5; i < rawData.length; i++) {
  const row = rawData[i];
  if (!row || row.length === 0 || !row[0]) continue;
  
  const p = {
    brand: row[0],
    product: row[1],
    category: row[2],
    description: row[3] || '',
    packUnit: row[4] || '',
    listPrice: row[5],
    sitePrice: row[6],
    currency: row[7] || '₹',
    rating: row[8],
    sku: row[9],
    rxRequired: row[10],
    availability: row[11],
    url: row[12] || '',
    marketplaceUrl: row[13] || '',
  };
  products.push(p);
}

console.log('Total Products:', products.length);
const brands = [...new Set(products.map(p => p.brand))];
console.log('Brands:', brands);
brands.forEach(b => {
  const brandProducts = products.filter(p => p.brand === b);
  const categories = [...new Set(brandProducts.map(p => p.category))];
  console.log(`- ${b}: ${brandProducts.length} products across categories: ${categories.join(', ')}`);
});

fs.writeFileSync('mosaic_products_extracted.json', JSON.stringify(products, null, 2));
console.log('Exported mosaic_products_extracted.json');
