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

  // Replace initial empty states with current FY defaults
  const oldState = `const [startDate, setStartDate] = useState('');
  const [filterFinancialYear, setFilterFinancialYear] = useState('');`;
  
  const newState = `const defaultFYStart = new Date().getMonth() + 1 >= 4 ? new Date().getFullYear() : new Date().getFullYear() - 1;
  const defaultFYLabel = \`\${defaultFYStart}-\${(defaultFYStart + 1).toString().slice(2)}\`;
  const defaultFYValue = { label: defaultFYLabel, value: defaultFYLabel };

  const [startDate, setStartDate] = useState(\`\${defaultFYStart}-04-01\`);
  const [filterFinancialYear, setFilterFinancialYear] = useState(defaultFYValue);`;

  content = content.replace(oldState, newState);

  // We also need to find the stray `const [endDate, setEndDate] = useState('');` and change it
  // Usually it looks like:
  // const [endDate, setEndDate] = useState('');
  content = content.replace(/const \[endDate, setEndDate\] = useState\(''\);/, `const [endDate, setEndDate] = useState(\`\${defaultFYStart + 1}-03-31\`);`);

  fs.writeFileSync(file, content);
  console.log('Updated default states in ' + file);
});
