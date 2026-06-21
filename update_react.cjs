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

  // Add state variables
  if (!content.includes('filterFinancialYear')) {
    content = content.replace(/const \[startDate, setStartDate\] = useState\(''\);/,
      `const [startDate, setStartDate] = useState('');
  const [filterFinancialYear, setFilterFinancialYear] = useState('');
  const [filterVoucherType, setFilterVoucherType] = useState('');
  const [filterTransactionType, setFilterTransactionType] = useState('');

  const financialYears = [];
  const currentYear = new Date().getFullYear();
  for (let i = currentYear - 5; i <= currentYear + 1; i++) {
      financialYears.push({ label: \`\${i}-\${(i + 1).toString().slice(2)}\`, value: \`\${i}-\${(i + 1).toString().slice(2)}\` });
  }

  const handleFYChange = (selected) => {
      setFilterFinancialYear(selected);
      if (!selected) {
          setStartDate('');
          setEndDate('');
          return;
      }
      const year = parseInt(selected.value.split('-')[0]);
      const nextYear = year + 1;
      setStartDate(\`\${year}-04-01\`);
      setEndDate(\`\${nextYear}-03-31\`);
  };
`);
  }

  // Add parameters to API call
  content = content.replace(/if \(endDate\) params\.append\("end_date", endDate\);/g, 
    `if (endDate) params.append("end_date", endDate);
      if (filterVoucherType) params.append("voucher_type", filterVoucherType.value);
      if (filterTransactionType) params.append("transaction_type", filterTransactionType.value);`);

  // Update JSX Form Filters
  const filterReplacement = `<CCol md={2}>
              <CFormLabel>Financial Year</CFormLabel>
              <Select
                placeholder="Select FY"
                options={financialYears}
                value={filterFinancialYear}
                onChange={handleFYChange}
                isClearable
              />
            </CCol>
            <CCol md={2}>
              <CFormLabel>Start Date</CFormLabel>`;
  content = content.replace(/<CCol[^>]*>\s*<CFormLabel>Start Date<\/CFormLabel>/, filterReplacement);

  const typeFilters = `<CCol md={2}>
              <CFormLabel>Voucher Type</CFormLabel>
              <Select
                placeholder="Any"
                options={[
                  {label: 'Purchase', value: 'Purchase'},
                  {label: 'Payment', value: 'Payment'},
                  {label: 'Receipt', value: 'Receipt'},
                  {label: 'Sales', value: 'Sales'},
                  {label: 'Journal', value: 'Journal'},
                  {label: 'Subcontract', value: 'Subcontract'}
                ]}
                value={filterVoucherType}
                onChange={setFilterVoucherType}
                isClearable
              />
            </CCol>
            <CCol md={2}>
              <CFormLabel>Dr/Cr</CFormLabel>
              <Select
                placeholder="Any"
                options={[
                  {label: 'Debit (Dr)', value: 'Debit'},
                  {label: 'Credit (Cr)', value: 'Credit'}
                ]}
                value={filterTransactionType}
                onChange={setFilterTransactionType}
                isClearable
              />
            </CCol>
            `;

  content = content.replace(/(<CButton color="primary" onClick=\{fetchLedgerReport\})/, typeFilters + '\n              $1');

  fs.writeFileSync(file, content);
  console.log('Updated filters in ' + file);
});
