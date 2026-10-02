const xlsx = require('xlsx');
const workbook = xlsx.readFile('Mosaic_Wellness_Brands_and_Products.xlsx');
const sheet = workbook.Sheets['Products'];
const rawData = xlsx.utils.sheet_to_json(sheet, { header: 1 });
for (let i = 0; i < Math.min(15, rawData.length); i++) {
  console.log(`Row ${i}:`, JSON.stringify(rawData[i]));
}
