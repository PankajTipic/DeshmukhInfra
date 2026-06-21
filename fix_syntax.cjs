const fs = require('fs');
const files = [
  'resources/react/views/pages/report/SubContractLadger.js',
  'resources/react/views/pages/report/RegularProjectsLadger.js',
  'resources/react/views/pages/report/PurchaseVendorLadger.js',
  'resources/react/views/pages/report/VendorLadger.js'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // Fix duplicated columnStyles block
  const brokenRegex = /columnStyles:\s*\{\s*0:\s*\{[^}]+\},\s*\/\/ Date\s*1:\s*\{[^}]+\},\s*\/\/ Voucher No\s*2:\s*\{[^}]+\},\s*\/\/ Particulars\s*3:\s*\{[^}]+\},\s*\/\/ Debit\s*4:\s*\{[^}]+\},\s*\/\/ Credit\s*5:\s*\{[^}]+\},\s*\/\/ Balance\s*\},\s*\/\/ Date\s*1:\s*\{[^}]+\},\s*\/\/ Particulars\s*2:\s*\{[^}]+\},\s*\/\/ Vch Type\s*3:\s*\{[^}]+\},\s*\/\/ Vch No\s*4:\s*\{[^}]+\},\s*\/\/ Debit\s*5:\s*\{[^}]+\},\s*\/\/ Credit\s*6:\s*\{[^}]+\},\s*\/\/ Balance\s*\}/g;

  const fixedBlock = `columnStyles: {
            0: { cellWidth: 70, halign: 'left' },    // Date
            1: { cellWidth: 100, halign: 'left' },   // Voucher No
            2: { cellWidth: 300, halign: 'left' },   // Particulars
            3: { cellWidth: 80, halign: 'right' },   // Debit
            4: { cellWidth: 80, halign: 'right' },   // Credit
            5: { cellWidth: 90, halign: 'right' },   // Balance
        }`;

  // wait, the broken text in the file is EXACTLY:
  const brokenRegex2 = /columnStyles:\s*\{[\s\S]*?\}\s*,\s*\/\/ Date[\s\S]*?6:\s*\{\s*cellWidth:\s*90,\s*halign:\s*'right'\s*\},?\s*\/\/\s*Balance\s*\}/g;

  content = content.replace(brokenRegex2, fixedBlock);

  // In case the file wasn't updated by my previous export script correctly because of the broken syntax:
  // let's do another quick check to ensure 'Balance Forward' is 'CR Opening Balance' : 'DR Opening Balance'
  // I already did this in fix_export.cjs and it succeeded.
  
  fs.writeFileSync(file, content);
  console.log('Fixed syntax error in ' + file);
});
