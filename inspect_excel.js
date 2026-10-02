const xlsx = require('xlsx');
const workbook = xlsx.readFile('Mosaic_Wellness_Brands_and_Products.xlsx');
console.log('Sheet Names:', workbook.SheetNames);

workbook.SheetNames.forEach(name => {
  const sheet = workbook.Sheets[name];
  const data = xlsx.utils.sheet_to_json(sheet);
  console.log(`\n=== Sheet: ${name} (Rows: ${data.length}) ===`);
  if (data.length > 0) {
    console.log('Columns:', Object.keys(data[0]));
    console.log('Sample row 0:', JSON.stringify(data[0], null, 2));
    if (data.length > 1) {
      console.log('Sample row 1:', JSON.stringify(data[1], null, 2));
    }
  }
});
