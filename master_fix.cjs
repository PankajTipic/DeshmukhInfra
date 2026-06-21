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

  // 1. DEFAULT FY LOGIC
  const defaultFYBlock = `
  const defaultFYStart = new Date().getMonth() + 1 >= 4 ? new Date().getFullYear() : new Date().getFullYear() - 1;
  const defaultFYLabel = \`\${defaultFYStart}-\${(defaultFYStart + 1).toString().slice(2)}\`;
  const defaultFYValue = { label: defaultFYLabel, value: defaultFYLabel };

  const [startDate, setStartDate] = useState(\`\${defaultFYStart}-04-01\`);
  const [filterFinancialYear, setFilterFinancialYear] = useState(defaultFYValue);
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

  const [endDate, setEndDate] = useState(\`\${defaultFYStart + 1}-03-31\`);
`;
  
  content = content.replace(/const \[startDate, setStartDate\] = useState\(''\);\s*const \[filterFinancialYear, setFilterFinancialYear\] = useState\(''\);\s*const \[filterVoucherType, setFilterVoucherType\] = useState\(''\);\s*const \[filterTransactionType, setFilterTransactionType\] = useState\(''\);[\s\S]*?const \[endDate, setEndDate\] = useState\(''\);/, defaultFYBlock);

  // 2. EXCEL LOGIC
  const excelReplacement = `const exportExcel = () => {
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
        'Running Balance': Math.abs(ob).toFixed(2) + (ob >= 0 ? ' CR' : ' DR')
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
  content = content.replace(/const exportExcel = \(\) => \{[\s\S]*?XLSXWriteFile\(wb, '[^']+'\);\s*\};/, excelReplacement);

  // 3. PDF LOGIC (replace entire generatePdf function)
  const pdfRegex = /const generatePdf = \(\) => \{[\s\S]*?doc\.save\([^)]+\);\n\s*\};/;
  const pdfReplacement = `const generatePdf = () => {
    const doc = new jsPDF('p', 'pt', 'a4');
    const margin = 40;
    const pageWidth = doc.internal.pageSize.width;

    const dateRangeStr = (startDate && endDate) ? \`\${startDate} To \${endDate}\` : (startDate ? \`From \${startDate}\` : (endDate ? \`Up to \${endDate}\` : 'All Dates'));

    data.forEach((item, index) => {
      if (index > 0) doc.addPage();

      const drawHeader = (vendor) => {
        let currentY = margin;
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Deshmukh Infra Soft", pageWidth / 2, currentY, { align: 'center' });
        
        currentY += 15;
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("Ledger Report", pageWidth / 2, currentY, { align: 'center' });

        currentY += 20;
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text(\`Vendor: \${vendor.name}\`, margin, currentY);
        
        doc.setFont("helvetica", "normal");
        const today = new Date();
        const timeStr = today.toLocaleTimeString('en-US', { hour12: false });
        doc.text(\`Page - \${index + 1}\`, pageWidth - margin, currentY - 20, { align: 'right' });
        doc.text(\`Date - \${today.toLocaleDateString('en-GB')}\`, pageWidth - margin, currentY - 10, { align: 'right' });
        doc.text(\`Time - \${timeStr}\`, pageWidth - margin, currentY, { align: 'right' });
        doc.text(\`Period - \${dateRangeStr}\`, pageWidth - margin, currentY + 10, { align: 'right' });

        currentY += 15;
        doc.text(\`Mobile: \${vendor.mobile}\`, margin, currentY);
        currentY += 15;
        doc.text(\`Address: \${vendor.address || 'N/A'}\`, margin, currentY);

        return currentY + 15;
      };

      let yPosition = drawHeader(item.vendor);
      let runningBalance = parseFloat(item.summary.opening_balance) || 0;
      
      const formatBal = (bal) => {
          if (Math.abs(bal) < 0.01) return "0.00";
          return Math.abs(bal).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + (bal >= 0 ? " CR" : " DR");
      };
      const formatCurrency = (val) => val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

      const columns = ['Date', 'Voucher No', 'Particulars', 'Debit', 'Credit', 'Running Balance'];
      const rows = [];

      rows.push([
          startDate || '',
          '',
          parseFloat(runningBalance) >= 0 ? 'CR Opening Balance' : 'DR Opening Balance',
          runningBalance < 0 ? formatCurrency(Math.abs(runningBalance)) : '',
          runningBalance > 0 ? formatCurrency(runningBalance) : '',
          formatBal(runningBalance)
      ]);

      let periodTotalDebit = 0;
      let periodTotalCredit = 0;

      item.ledger_entries.forEach(entry => {
          if (entry.is_opening) return;
          let deb = parseFloat(entry.debit) || 0;
          let cre = parseFloat(entry.credit) || 0;
          periodTotalDebit += deb;
          periodTotalCredit += cre;
          runningBalance += (cre - deb); 
          rows.push([
              entry.date || '',
              entry.vch_no ? \`\${entry.vch_type} - \${entry.vch_no}\` : (entry.vch_type || ''),
              entry.particulars || '',
              deb > 0 ? formatCurrency(deb) : '',
              cre > 0 ? formatCurrency(cre) : '',
              formatBal(runningBalance)
          ]);
      });

      rows.push([
          '',
          '',
          'Period Total Transactions',
          periodTotalDebit > 0 ? formatCurrency(periodTotalDebit) : '',
          periodTotalCredit > 0 ? formatCurrency(periodTotalCredit) : '',
          ''
      ]);

      rows.push([
          endDate || '',
          '',
          'Period End Balance',
          '',
          '',
          formatBal(runningBalance)
      ]);

      doc.autoTable({
        startY: yPosition,
        head: [columns],
        body: rows,
        theme: 'plain',
        styles: { font: 'helvetica', fontSize: 8, cellPadding: 4, textColor: 0 },
        headStyles: { fontStyle: 'bold' },
        columnStyles: {
            0: { cellWidth: 70, halign: 'left' },
            1: { cellWidth: 100, halign: 'left' },
            2: { cellWidth: 170, halign: 'left' },
            3: { cellWidth: 60, halign: 'right' },
            4: { cellWidth: 60, halign: 'right' },
            5: { cellWidth: 60, halign: 'right' },
        },
        willDrawCell: function(data) {
            const setDash = () => {
               if (typeof doc.setLineDashPattern === 'function') doc.setLineDashPattern([3, 3], 0);
            };
            const resetDash = () => {
               if (typeof doc.setLineDashPattern === 'function') doc.setLineDashPattern([], 0);
            };
            if (data.row.section === 'head') {
                doc.setDrawColor(0);
                doc.setLineWidth(0.5);
                setDash();
                doc.line(data.cell.x, data.cell.y, data.cell.x + data.cell.width, data.cell.y);
                doc.line(data.cell.x, data.cell.y + data.cell.height, data.cell.x + data.cell.width, data.cell.y + data.cell.height);
                resetDash();
            }
            if (data.row.index === 0 || data.row.index >= rows.length - 2) {
                doc.setFont("helvetica", "bold");
            }
            if (data.row.index === rows.length - 2) {
                doc.setDrawColor(0);
                doc.setLineWidth(0.5);
                setDash();
                doc.line(data.cell.x, data.cell.y, data.cell.x + data.cell.width, data.cell.y);
                resetDash();
            }
        },
        didDrawPage: (data) => {},
        margin: { top: margin, left: margin, right: margin }
      });
    });
    const todayStr = new Date().toLocaleDateString('en-GB').replace(/\\//g, '-');
    doc.save(\`Ledger_Report_\${todayStr}.pdf\`);
  };`;
  content = content.replace(pdfRegex, pdfReplacement);

  // 4. HTML TABLE HEADERS
  const oldThead = `<CTableHead>
                        <CTableRow>
                            <CTableHeaderCell>Date</CTableHeaderCell>
                            <CTableHeaderCell>Particulars</CTableHeaderCell>
                            <CTableHeaderCell>Vch Type</CTableHeaderCell>
                            <CTableHeaderCell>Vch No.</CTableHeaderCell>
                            <CTableHeaderCell>Debit</CTableHeaderCell>
                            <CTableHeaderCell>Credit</CTableHeaderCell>
                            <CTableHeaderCell>Balance</CTableHeaderCell>
                        </CTableRow>
                    </CTableHead>`;
  const newThead = `<CTableHead>
                        <CTableRow>
                            <CTableHeaderCell>Date</CTableHeaderCell>
                            <CTableHeaderCell>Voucher No</CTableHeaderCell>
                            <CTableHeaderCell>Particulars</CTableHeaderCell>
                            <CTableHeaderCell>Debit</CTableHeaderCell>
                            <CTableHeaderCell>Credit</CTableHeaderCell>
                            <CTableHeaderCell>Running Balance</CTableHeaderCell>
                        </CTableRow>
                    </CTableHead>`;
  content = content.replace(oldThead, newThead);

  // 5. HTML TABLE ROWS (opening balance)
  const oldOpRow = `<CTableRow>
                                                <CTableDataCell className="fw-bold">{startDate || ''}</CTableDataCell>
                                                <CTableDataCell className="fw-bold text-center">Balance Forward</CTableDataCell>
                                                <CTableDataCell></CTableDataCell>
                                                <CTableDataCell></CTableDataCell>
                                                <CTableDataCell className="text-end fw-bold">
                                                    {parseFloat(summary.opening_balance) < 0 ? formatCurrency(Math.abs(summary.opening_balance)) : ''}
                                                </CTableDataCell>
                                                <CTableDataCell className="text-end fw-bold">
                                                    {parseFloat(summary.opening_balance) > 0 ? formatCurrency(summary.opening_balance) : ''}
                                                </CTableDataCell>
                                                <CTableDataCell className="text-end fw-bold">{formatBal(runningBalance)}</CTableDataCell>
                                            </CTableRow>`;
  const newOpRow = `<CTableRow>
                                                <CTableDataCell className="fw-bold">{startDate || ''}</CTableDataCell>
                                                <CTableDataCell></CTableDataCell>
                                                <CTableDataCell className="fw-bold text-center">
                                                  {parseFloat(summary.opening_balance) >= 0 ? 'CR Opening Balance' : 'DR Opening Balance'}
                                                </CTableDataCell>
                                                <CTableDataCell className="text-end fw-bold">
                                                    {parseFloat(summary.opening_balance) < 0 ? formatCurrency(Math.abs(summary.opening_balance)) : ''}
                                                </CTableDataCell>
                                                <CTableDataCell className="text-end fw-bold">
                                                    {parseFloat(summary.opening_balance) > 0 ? formatCurrency(summary.opening_balance) : ''}
                                                </CTableDataCell>
                                                <CTableDataCell className="text-end fw-bold">{formatBal(runningBalance)}</CTableDataCell>
                                            </CTableRow>`;
  content = content.replace(oldOpRow, newOpRow);

  // 6. HTML TABLE ROWS (data entries)
  const oldDataRow = `<CTableDataCell>{entry.date}</CTableDataCell>
                                                        <CTableDataCell>{entry.particulars}</CTableDataCell>
                                                        <CTableDataCell>{entry.vch_type}</CTableDataCell>
                                                        <CTableDataCell>{entry.vch_no}</CTableDataCell>
                                                        <CTableDataCell className="text-end">{deb > 0 ? formatCurrency(deb) : ''}</CTableDataCell>
                                                        <CTableDataCell className="text-end">{cre > 0 ? formatCurrency(cre) : ''}</CTableDataCell>
                                                        <CTableDataCell className="text-end fw-bold">{formatBal(runningBalance)}</CTableDataCell>`;
  const newDataRow = `<CTableDataCell>{entry.date}</CTableDataCell>
                                                        <CTableDataCell>{entry.vch_no ? \`\${entry.vch_type} - \${entry.vch_no}\` : entry.vch_type}</CTableDataCell>
                                                        <CTableDataCell>{entry.particulars}</CTableDataCell>
                                                        <CTableDataCell className="text-end">{deb > 0 ? formatCurrency(deb) : ''}</CTableDataCell>
                                                        <CTableDataCell className="text-end">{cre > 0 ? formatCurrency(cre) : ''}</CTableDataCell>
                                                        <CTableDataCell className="text-end fw-bold">{formatBal(runningBalance)}</CTableDataCell>`;
  content = content.replace(oldDataRow, newDataRow);

  // 7. HTML TABLE ROWS (period total)
  const oldTotRow = `<CTableRow>
                                                <CTableDataCell></CTableDataCell>
                                                <CTableDataCell className="fw-bold text-center">Period Total Transactions</CTableDataCell>
                                                <CTableDataCell></CTableDataCell>
                                                <CTableDataCell></CTableDataCell>
                                                <CTableDataCell className="text-end fw-bold">
                                                    {periodTotalDebit > 0 ? formatCurrency(periodTotalDebit) : ''}
                                                </CTableDataCell>
                                                <CTableDataCell className="text-end fw-bold">
                                                    {periodTotalCredit > 0 ? formatCurrency(periodTotalCredit) : ''}
                                                </CTableDataCell>
                                                <CTableDataCell></CTableDataCell>
                                            </CTableRow>`;
  const newTotRow = `<CTableRow>
                                                <CTableDataCell></CTableDataCell>
                                                <CTableDataCell></CTableDataCell>
                                                <CTableDataCell className="fw-bold text-center">Period Total Transactions</CTableDataCell>
                                                <CTableDataCell className="text-end fw-bold">
                                                    {periodTotalDebit > 0 ? formatCurrency(periodTotalDebit) : ''}
                                                </CTableDataCell>
                                                <CTableDataCell className="text-end fw-bold">
                                                    {periodTotalCredit > 0 ? formatCurrency(periodTotalCredit) : ''}
                                                </CTableDataCell>
                                                <CTableDataCell></CTableDataCell>
                                            </CTableRow>`;
  content = content.replace(oldTotRow, newTotRow);

  // 8. HTML TABLE ROWS (period end balance)
  const oldEndRow = `<CTableRow>
                                                <CTableDataCell className="fw-bold">{endDate || ''}</CTableDataCell>
                                                <CTableDataCell className="fw-bold text-center">Period End Balance</CTableDataCell>
                                                <CTableDataCell></CTableDataCell>
                                                <CTableDataCell></CTableDataCell>
                                                <CTableDataCell></CTableDataCell>
                                                <CTableDataCell></CTableDataCell>
                                                <CTableDataCell className="text-end fw-bold">{formatBal(runningBalance)}</CTableDataCell>
                                            </CTableRow>`;
  const newEndRow = `<CTableRow>
                                                <CTableDataCell className="fw-bold">{endDate || ''}</CTableDataCell>
                                                <CTableDataCell></CTableDataCell>
                                                <CTableDataCell className="fw-bold text-center">Period End Balance</CTableDataCell>
                                                <CTableDataCell></CTableDataCell>
                                                <CTableDataCell></CTableDataCell>
                                                <CTableDataCell className="text-end fw-bold">{formatBal(runningBalance)}</CTableDataCell>
                                            </CTableRow>`;
  content = content.replace(oldEndRow, newEndRow);

  // 9. REMOVE BUTTONS
  content = content.replace(/<CButton color="info"[\s\S]*?Print Ledger\s*<\/CButton>/, '');
  content = content.replace(/<CButton color="success"[\s\S]*?WhatsApp PDF\s*<\/CButton>/, '');
  content = content.replace(/<CButton color="warning"[\s\S]*?Email PDF\s*<\/CButton>/, '');

  // 10. REMOVE DROPDOWNS
  content = content.replace(/<CCol md=\{2\}>\s*<CFormLabel>Voucher Type<\/CFormLabel>[\s\S]*?<\/CCol>/g, '');
  content = content.replace(/<CCol md=\{2\}>\s*<CFormLabel>Dr\/Cr<\/CFormLabel>[\s\S]*?<\/CCol>/g, '');

  fs.writeFileSync(file, content);
  console.log('Applied master fix to ' + file);
});
