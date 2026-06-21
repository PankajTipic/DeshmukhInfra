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

  // 1. Remove Voucher Type and Dr/Cr Dropdowns
  // The dropdowns are wrapped in <CCol md={2}> ... </CCol>
  // We'll use a regex that captures both CCols
  const filterRegex = /<CCol md=\{2\}>\s*<CFormLabel>Voucher Type<\/CFormLabel>[\s\S]*?<CFormLabel>Dr\/Cr<\/CFormLabel>[\s\S]*?<\/CCol>\s*/;
  content = content.replace(filterRegex, '');

  // 2. Remove Print Ledger, WhatsApp PDF, Email PDF buttons
  const printBtnRegex = /<CButton color="dark" onClick=\{[^}]+\} disabled=\{loading\} className="text-white me-2">Print Ledger<\/CButton>\s*/;
  const whatsappBtnRegex = /<CButton color="success" variant="outline" onClick=\{[^}]+\} disabled=\{loading\} className="me-2">WhatsApp PDF<\/CButton>\s*/;
  const emailBtnRegex = /<CButton color="primary" variant="outline" onClick=\{[^}]+\} disabled=\{loading\} className="me-2">Email PDF<\/CButton>\s*/;

  content = content.replace(printBtnRegex, '');
  content = content.replace(whatsappBtnRegex, '');
  content = content.replace(emailBtnRegex, '');

  fs.writeFileSync(file, content);
  console.log('Removed requested filters and buttons from ' + file);
});
