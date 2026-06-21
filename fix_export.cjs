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

  // Fix PDF Opening Balance text
  content = content.replace(
    /'Balance Forward',/,
    `parseFloat(runningBalance) >= 0 ? 'CR Opening Balance' : 'DR Opening Balance',`
  );

  // Fix Excel Export to include ledger entries instead of just summary
  const excelRegex = /const exportExcel = \(\) => \{[\s\S]*?XLSXWriteFile\(wb, '[^']+'\);\s*\};/;
  
  const newExcel = `const exportExcel = () => {
    const exportData = [];
    data.forEach(item => {
      exportData.push({
        Date: '',
        'Voucher No': '',
        Particulars: \`Vendor: \${item.vendor.name} - \${item.vendor.mobile}\`,
        Debit: '',
        Credit: '',
        'Running Balance': ''
      });
      
      const ob = parseFloat(item.summary.opening_balance) || 0;
      exportData.push({
        Date: startDate || '',
        'Voucher No': '',
        Particulars: ob >= 0 ? 'CR Opening Balance' : 'DR Opening Balance',
        Debit: ob < 0 ? Math.abs(ob) : '',
        Credit: ob >= 0 ? Math.abs(ob) : '',
        'Running Balance': Math.abs(ob) + (ob >= 0 ? ' CR' : ' DR')
      });
      
      let runningBalance = ob;
      if (item.ledger_entries) {
        item.ledger_entries.filter(e => !e.is_opening).forEach(entry => {
          const deb = parseFloat(entry.debit) || 0;
          const cre = parseFloat(entry.credit) || 0;
          runningBalance += (cre - deb);
          exportData.push({
            Date: entry.date,
            'Voucher No': entry.vch_no ? \`\${entry.vch_type} - \${entry.vch_no}\` : entry.vch_type,
            Particulars: entry.particulars,
            Debit: deb > 0 ? deb : '',
            Credit: cre > 0 ? cre : '',
            'Running Balance': Math.abs(runningBalance).toFixed(2) + (runningBalance >= 0 ? ' CR' : ' DR')
          });
        });
      }
      
      exportData.push({
        Date: endDate || '',
        'Voucher No': '',
        Particulars: runningBalance >= 0 ? 'CR Closing Balance' : 'DR Closing Balance',
        Debit: runningBalance < 0 ? Math.abs(runningBalance) : '',
        Credit: runningBalance >= 0 ? Math.abs(runningBalance) : '',
        'Running Balance': Math.abs(runningBalance).toFixed(2) + (runningBalance >= 0 ? ' CR' : ' DR')
      });
      
      exportData.push({ Date: '', 'Voucher No': '', Particulars: '', Debit: '', Credit: '', 'Running Balance': '' });
    });

    const ws = XLSXUtils.json_to_sheet(exportData);
    const wb = XLSXUtils.book_new();
    XLSXUtils.book_append_sheet(wb, ws, 'Ledger');
    XLSXWriteFile(wb, 'Ledger_Report.xlsx');
  };`;

  content = content.replace(excelRegex, newExcel);

  fs.writeFileSync(file, content);
  console.log('Fixed PDF and Excel in ' + file);
});
