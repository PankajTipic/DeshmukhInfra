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

  // Replace columns array
  content = content.replace(
    /const columns = \['Date', 'Voucher No', 'Particulars', 'Debit', 'Credit', 'Running Balance'\];/,
    "const columns = ['Date', 'Particulars', 'Vch Type', 'Vch No.', 'Debit', 'Credit', 'Running Balance'];"
  );

  // Replace Opening Balance row push
  content = content.replace(
    /rows\.push\(\[\s*startDate \|\| '',\s*'',\s*parseFloat\(runningBalance\) >= 0 \? 'CR Opening Balance' : 'DR Opening Balance',\s*runningBalance < 0 \? formatCurrency\(Math\.abs\(runningBalance\)\) : '',\s*runningBalance > 0 \? formatCurrency\(runningBalance\) : '',\s*formatBal\(runningBalance\)\s*\]\);/,
    `rows.push([
          startDate || '',
          parseFloat(runningBalance) >= 0 ? 'CR Opening Balance' : 'DR Opening Balance',
          '',
          '',
          runningBalance < 0 ? formatCurrency(Math.abs(runningBalance)) : '',
          runningBalance > 0 ? formatCurrency(runningBalance) : '',
          formatBal(runningBalance)
      ]);`
  );

  // Replace ledger entry row push
  content = content.replace(
    /rows\.push\(\[\s*entry\.date \|\| '',\s*entry\.vch_no \? `\$\{entry\.vch_type\} - \$\{entry\.vch_no\}` : \(entry\.vch_type \|\| ''\),\s*entry\.particulars \|\| '',\s*deb > 0 \? formatCurrency\(deb\) : '',\s*cre > 0 \? formatCurrency\(cre\) : '',\s*formatBal\(runningBalance\)\s*\]\);/,
    `rows.push([
              entry.date || '',
              entry.particulars || '',
              entry.vch_type || '',
              entry.vch_no || '',
              deb > 0 ? formatCurrency(deb) : '',
              cre > 0 ? formatCurrency(cre) : '',
              formatBal(runningBalance)
          ]);`
  );

  // Replace Period Total row push
  content = content.replace(
    /rows\.push\(\[\s*'',\s*'',\s*'Period Total Transactions',\s*periodTotalDebit > 0 \? formatCurrency\(periodTotalDebit\) : '',\s*periodTotalCredit > 0 \? formatCurrency\(periodTotalCredit\) : '',\s*''\s*\]\);/,
    `rows.push([
          '',
          'Period Total Transactions',
          '',
          '',
          periodTotalDebit > 0 ? formatCurrency(periodTotalDebit) : '',
          periodTotalCredit > 0 ? formatCurrency(periodTotalCredit) : '',
          ''
      ]);`
  );

  // Replace Period End Balance row push
  content = content.replace(
    /rows\.push\(\[\s*endDate \|\| '',\s*'',\s*'Period End Balance',\s*'',\s*'',\s*formatBal\(runningBalance\)\s*\]\);/,
    `rows.push([
          endDate || '',
          'Period End Balance',
          '',
          '',
          '',
          '',
          formatBal(runningBalance)
      ]);`
  );

  // Replace columnStyles
  const oldStylesRegex = /columnStyles:\s*\{\s*0:\s*\{\s*cellWidth:\s*70,\s*halign:\s*'left'\s*\},\s*\/\/\s*Date\s*1:\s*\{\s*cellWidth:\s*100,\s*halign:\s*'left'\s*\},\s*\/\/\s*Voucher No\s*2:\s*\{\s*cellWidth:\s*300,\s*halign:\s*'left'\s*\},\s*\/\/\s*Particulars\s*3:\s*\{\s*cellWidth:\s*80,\s*halign:\s*'right'\s*\},\s*\/\/\s*Debit\s*4:\s*\{\s*cellWidth:\s*80,\s*halign:\s*'right'\s*\},\s*\/\/\s*Credit\s*5:\s*\{\s*cellWidth:\s*90,\s*halign:\s*'right'\s*\},\s*\/\/\s*Balance\s*\}/;

  const newStyles = `columnStyles: {
            0: { cellWidth: 70, halign: 'left' },    // Date
            1: { cellWidth: 260, halign: 'left' },   // Particulars
            2: { cellWidth: 70, halign: 'center' },  // Vch Type
            3: { cellWidth: 70, halign: 'center' },  // Vch No
            4: { cellWidth: 80, halign: 'right' },   // Debit
            5: { cellWidth: 80, halign: 'right' },   // Credit
            6: { cellWidth: 90, halign: 'right' },   // Balance
        }`;

  content = content.replace(oldStylesRegex, newStyles);

  fs.writeFileSync(file, content);
  console.log('Fixed PDF format in ' + file);
});
