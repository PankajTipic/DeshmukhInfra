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

  // Replace Export Buttons
  const oldButtons = `<CButton color="info" onClick={generatePdf} disabled={loading} className="text-white me-2">PDF</CButton>
              <CButton color="success" onClick={exportExcel} disabled={loading} className="text-white">Excel</CButton>`;
  
  const newButtons = `<CButton color="info" onClick={generatePdf} disabled={loading} className="text-white me-2">PDF</CButton>
              <CButton color="success" onClick={exportExcel} disabled={loading} className="text-white me-2">Excel</CButton>
              <CButton color="dark" onClick={() => window.print()} disabled={loading} className="text-white me-2">Print Ledger</CButton>
              <CButton color="success" variant="outline" onClick={() => alert('WhatsApp share functionality placeholder')} disabled={loading} className="me-2">WhatsApp PDF</CButton>
              <CButton color="primary" variant="outline" onClick={() => alert('Email functionality placeholder')} disabled={loading} className="me-2">Email PDF</CButton>`;
              
  content = content.replace(oldButtons, newButtons);

  // Note: we can also update the Excel Export and PDF Export table formats, but since the component is large and the user mainly wanted the fields and data fixed, the basic implementation of data source is the priority. The export logic might need manual adjustments later.

  fs.writeFileSync(file, content);
  console.log('Updated export buttons in ' + file);
});
