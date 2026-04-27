// Script to parse Scope & Sequence spreadsheets and examine structure
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const resourceDir = path.join('C:', 'Users', 'thelo', 'OneDrive', 'Desktop', 'montessori-navigator-v7', 'Resources');

const files = fs.readdirSync(resourceDir).filter(f => f.endsWith('.xlsx'));

console.log(`Found ${files.length} spreadsheet files:\n`);

for (const file of files) {
  const filePath = path.join(resourceDir, file);
  const workbook = XLSX.readFile(filePath);

  console.log(`\n${'='.repeat(80)}`);
  console.log(`FILE: ${file}`);
  console.log(`Sheets: ${workbook.SheetNames.join(', ')}`);

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    console.log(`\n  Sheet: "${sheetName}" - ${data.length} rows`);

    // Show first 5 rows to understand structure
    for (let i = 0; i < Math.min(5, data.length); i++) {
      const row = data[i];
      if (row && row.length > 0) {
        console.log(`    Row ${i}: ${JSON.stringify(row).substring(0, 200)}`);
      }
    }
  }
}
