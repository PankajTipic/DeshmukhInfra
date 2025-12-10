// import * as XLSX from 'xlsx';

// export const exportToExcel = (
//   state,
//   projects,
//   expenseTypes,
//   totalExpense,
//   sortedFilteredExpenses,
//   expenseType,
//   formatIndianNumber,
//   formatDate,
//   showToast,
//   origin,
//   totalCgstAmount,
//   totalSgstAmount,
//   totalIgstAmount,
//   sumQty,
//   sumBase
// ) => {
//   showToast('info', 'Preparing Excel file with images...');

//   try {
//     // Create workbook
//     const workbook = XLSX.utils.book_new();

//     // Prepare data with GST calculations moved to end of columns
//     const worksheetData = sortedFilteredExpenses.map((expense, index) => {
//       const photoUrl = expense.photo_url 
//         ? `${origin}/${expense.photo_url.replace(/\\/g, '/')}` 
//         : '';
      
//       // Calculate GST amounts
//       const price = parseFloat(expense.price || 0);
//       const qty = parseFloat(expense.qty || 0);
//       const baseAmount = price * qty;
//       const gstPercentage = parseFloat(expense.gst || 0);
//       const cgstPercentage = parseFloat(expense.cgst || 0);
//       const sgstPercentage = parseFloat(expense.sgst || 0);
//       const igstPercentage = parseFloat(expense.igst || 0);
      
//       const cgstAmount = expense.isGst ? (baseAmount * cgstPercentage) / 100 : 0;
//       const sgstAmount = expense.isGst ? (baseAmount * sgstPercentage) / 100 : 0;
//       const igstAmount = expense.isGst ? (baseAmount * igstPercentage) / 100 : 0;
//       const totalGstAmount = cgstAmount + sgstAmount + igstAmount;

//       return {
//         'Sr No': index + 1,
//         'Date': formatDate(expense.expense_date),
//         'Project': expense.project?.project_name || '-',
//         'Expense Type': expense.expense_type?.name || expenseType[expense.expense_id] || '-',
//         'Expense Category': expense.expense_type?.expense_category || '-',
//         'Qty': expense.qty || '-',
//         'Price': expense.price ? formatIndianNumber(expense.price) : '-',
//         'Base Amount': formatIndianNumber(baseAmount),
//         'Payment By': expense.payment_by || '-',
//         'Payment Type': expense.payment_type || '-',
//         'Contact': expense.contact || '-',
//         'Bank Name': expense.bank_name || '-',
//         'Account Number': expense.account_number || '-',
//         'IFSC Code': expense.ifsc_code || '-',
//         'Transaction ID': expense.transaction_id || '-',
//         'About': expense.name || '-',
//         'Notes': expense.photo_remark || '-',
//         'Photo/PDF': photoUrl || '-',
//         'GST (%)': expense.isGst ? (gstPercentage || '-') : '-',
//         'CGST (%)': expense.isGst ? (cgstPercentage || '-') : '-',
//         'CGST Amount': expense.isGst ? formatIndianNumber(cgstAmount) : '-',
//         'SGST (%)': expense.isGst ? (sgstPercentage || '-') : '-',
//         'SGST Amount': expense.isGst ? formatIndianNumber(sgstAmount) : '-',
//         'IGST (%)': expense.isGst ? (igstPercentage || '-') : '-',
//         'IGST Amount': expense.isGst ? formatIndianNumber(igstAmount) : '-',
//         'Total GST': expense.isGst ? formatIndianNumber(totalGstAmount) : '-',
//         'Total Amount': formatIndianNumber(expense.total_price || baseAmount + totalGstAmount)
//       };
//     });

//     // Add totals row at the end of data
//     worksheetData.push({
//       'Sr No': '',
//       'Date': '',
//       'Project': '',
//       'Expense Type': '',
//       'Expense Category': 'Total',
//       'Qty': sumQty,
//       'Price': '',
//       'Base Amount': formatIndianNumber(sumBase),
//       'Payment By': '',
//       'Payment Type': '',
//       'Contact': '',
//       'Bank Name': '',
//       'Account Number': '',
//       'IFSC Code': '',
//       'Transaction ID': '',
//       'About': '',
//       'Notes': '',
//       'Photo/PDF': '',
//       'GST (%)': '',
//       'CGST (%)': '',
//       'CGST Amount': formatIndianNumber(totalCgstAmount),
//       'SGST (%)': '',
//       'SGST Amount': formatIndianNumber(totalSgstAmount),
//       'IGST (%)': '',
//       'IGST Amount': formatIndianNumber(totalIgstAmount),
//       'Total GST': formatIndianNumber(totalCgstAmount + totalSgstAmount + totalIgstAmount),
//       'Total Amount': formatIndianNumber(totalExpense)
//     });

//     // Prepare header section
//     const summary = [
//       ['EXPENSE REPORT'],
//       [`Period: ${state.start_date || 'All'} to ${state.end_date || 'All'}`],
//       [`Generated on: ${new Date().toLocaleDateString('en-GB')}`],
//       ['']
//     ];

//     // Create worksheet
//     const worksheet = XLSX.utils.json_to_sheet(worksheetData, { origin: summary.length + 1 });

//     // Add summary at top
//     XLSX.utils.sheet_add_aoa(worksheet, summary, { origin: 'A1' });

//     // Set column widths
//     worksheet['!cols'] = [
//       { wch: 6 },   // Sr No
//       { wch: 12 },  // Date
//       { wch: 20 },  // Project
//       { wch: 20 },  // Expense Type
//       { wch: 18 },  // Expense Category
//       { wch: 8 },   // Qty
//       { wch: 12 },  // Price
//       { wch: 14 },  // Base Amount
//       { wch: 15 },  // Payment By
//       { wch: 15 },  // Payment Type
//       { wch: 15 },  // Contact
//       { wch: 18 },  // Bank Name
//       { wch: 18 },  // Account Number
//       { wch: 14 },  // IFSC
//       { wch: 16 },  // Transaction ID
//       { wch: 20 },  // About
//       { wch: 20 },  // Notes
//       { wch: 50 },  // Photo/PDF URL
//       { wch: 10 },  // GST %
//       { wch: 10 },  // CGST %
//       { wch: 12 },  // CGST Amount
//       { wch: 10 },  // SGST %
//       { wch: 12 },  // SGST Amount
//       { wch: 10 },  // IGST %
//       { wch: 12 },  // IGST Amount
//       { wch: 12 },  // Total GST
//       { wch: 14 }   // Total Amount
//     ];

//     // Apply styles to cells
//     const range = XLSX.utils.decode_range(worksheet['!ref']);
    
//     // Style for main title
//     const titleCell = worksheet['A1'];
//     if (titleCell) {
//       titleCell.s = {
//         font: { bold: true, sz: 18, color: { rgb: "FFFFFF" } },
//         fill: { fgColor: { rgb: "2980B9" } },
//         alignment: { horizontal: "center", vertical: "center" }
//       };
//     }
    
//     // Merge title cell
//     if (!worksheet['!merges']) worksheet['!merges'] = [];
//     worksheet['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 26 } });

//     // Style for Period and Generated on
//     for (let row = 1; row <= 2; row++) {
//       const cell = worksheet[XLSX.utils.encode_cell({ r: row, c: 0 })];
//       if (cell) {
//         cell.s = {
//           font: { bold: true, sz: 11, color: { rgb: "34495E" } },
//           alignment: { horizontal: "center" }
//         };
//       }
//       worksheet['!merges'].push({ s: { r: row, c: 0 }, e: { r: row, c: 26 } });
//     }

//     // Style for column headers
//     const headerRow = summary.length;
//     for (let col = 0; col <= 26; col++) {
//       const cell = worksheet[XLSX.utils.encode_cell({ r: headerRow, c: col })];
//       if (cell) {
//         cell.s = {
//           font: { bold: true, sz: 11, color: { rgb: "FFFFFF" } },
//           fill: { fgColor: { rgb: "2C3E50" } },
//           alignment: { horizontal: "center", vertical: "center", wrapText: true },
//           border: {
//             top: { style: "medium", color: { rgb: "000000" } },
//             bottom: { style: "medium", color: { rgb: "000000" } },
//             left: { style: "thin", color: { rgb: "000000" } },
//             right: { style: "thin", color: { rgb: "000000" } }
//           }
//         };
//       }
//     }

//     // Style for data rows
//     const dataStartRow = summary.length + 1;
//     const dataEndRow = dataStartRow + sortedFilteredExpenses.length;
    
//     for (let row = dataStartRow; row <= dataEndRow; row++) {
//       const isTotalRow = row === dataEndRow;
//       const fillColor = isTotalRow ? "E74C3C" : (row - dataStartRow) % 2 === 0 ? "FFFFFF" : "ECF0F1";
//       const fontColor = isTotalRow ? "FFFFFF" : "000000";
      
//       for (let col = 0; col <= 26; col++) {
//         const cell = worksheet[XLSX.utils.encode_cell({ r: row, c: col })];
//         if (cell) {
//           cell.s = {
//             font: { sz: 10, bold: isTotalRow, color: { rgb: fontColor } },
//             fill: { fgColor: { rgb: fillColor } },
//             alignment: { 
//               horizontal: col === 0 || (col >= 5 && col <= 7) || (col >= 18) ? "right" : "left",
//               vertical: "center",
//               wrapText: true
//             },
//             border: {
//               top: { style: isTotalRow ? "medium" : "thin", color: { rgb: isTotalRow ? "000000" : "BDC3C7" } },
//               bottom: { style: isTotalRow ? "medium" : "thin", color: { rgb: isTotalRow ? "000000" : "BDC3C7" } },
//               left: { style: "thin", color: { rgb: isTotalRow ? "000000" : "BDC3C7" } },
//               right: { style: "thin", color: { rgb: isTotalRow ? "000000" : "BDC3C7" } }
//             }
//           };
//         }
//       }
//     }

//     // Convert Photo/PDF column to hyperlinks
//     const photoColIndex = 17;
//     const startRow = summary.length + 1;
    
//     for (let i = 0; i < sortedFilteredExpenses.length; i++) {
//       const cellAddress = XLSX.utils.encode_cell({ r: startRow + i, c: photoColIndex });
//       const expense = sortedFilteredExpenses[i];
      
//       if (expense.photo_url && expense.photo_url !== 'NA') {
//         const fileUrl = `${origin}/${expense.photo_url.replace(/\\/g, '/')}`;
//         const fileName = expense.photo_url.split('/').pop();
        
//         worksheet[cellAddress] = {
//           t: 's',
//           v: fileName,
//           l: { Target: fileUrl, Tooltip: 'Click to view file' },
//           s: {
//             font: { color: { rgb: "0563C1" }, underline: true },
//             alignment: { horizontal: "left", vertical: "center" }
//           }
//         };
//       }
//     }

//     // Add filter information section after data
//     const filterStartRow = dataEndRow + 2;
//     const selectedProject = projects.find(p => p.id === parseInt(state.project_id));
//     const selectedExpenseType = expenseTypes.find(et => et.id === parseInt(state.expense_type_id));

//     const filterData = [
//       ['FILTERS APPLIED'],
//       [''],
//       ['Total Records', sortedFilteredExpenses.length]
//     ];

//     if (selectedProject) {
//       filterData.push(['Project', selectedProject.project_name]);
//     }
//     if (selectedExpenseType) {
//       filterData.push(['Expense Type', selectedExpenseType.name]);
//     }

//     XLSX.utils.sheet_add_aoa(worksheet, filterData, { origin: filterStartRow });

//     // Style FILTERS section
//     const filterTitleCell = worksheet[XLSX.utils.encode_cell({ r: filterStartRow, c: 0 })];
//     if (filterTitleCell) {
//       filterTitleCell.s = {
//         font: { bold: true, sz: 14, color: { rgb: "FFFFFF" } },
//         fill: { fgColor: { rgb: "16A085" } },
//         alignment: { horizontal: "center", vertical: "center" }
//       };
//     }
//     worksheet['!merges'].push({ s: { r: filterStartRow, c: 0 }, e: { r: filterStartRow, c: 7 } });

//     // Style filter information rows
//     for (let i = 2; i < filterData.length; i++) {
//       const row = filterStartRow + i;
//       const cell1 = worksheet[XLSX.utils.encode_cell({ r: row, c: 0 })];
//       const cell2 = worksheet[XLSX.utils.encode_cell({ r: row, c: 1 })];
//       if (cell1) {
//         cell1.s = {
//           font: { bold: true, sz: 10 },
//           fill: { fgColor: { rgb: "F0F8FF" } },
//           alignment: { horizontal: "left", vertical: "center" }
//         };
//       }
//       if (cell2) {
//         cell2.s = {
//           font: { sz: 10 },
//           fill: { fgColor: { rgb: "F0F8FF" } },
//           alignment: { horizontal: "left", vertical: "center" }
//         };
//       }
//       worksheet['!merges'].push({ s: { r: row, c: 1 }, e: { r: row, c: 7 } });
//     }

//     // Set row heights
//     worksheet['!rows'] = [];
//     worksheet['!rows'][0] = { hpt: 30 };
//     worksheet['!rows'][headerRow] = { hpt: 25 };
//     worksheet['!rows'][filterStartRow] = { hpt: 25 };
//     worksheet['!rows'][dataEndRow] = { hpt: 30 };

//     // Append worksheet to workbook
//     XLSX.utils.book_append_sheet(workbook, worksheet, 'Expense Report');

//     // Generate filename
//     const fileName = `Expense_Report_${state.start_date || 'All'}_to_${state.end_date || 'All'}_${new Date()
//       .toISOString()
//       .split('T')[0]}.xlsx`;

//     // Save Excel file
//     XLSX.writeFile(workbook, fileName, { cellStyles: true });
    
//     showToast('success', 'Excel file downloaded successfully! Click on file links in the "Photo/PDF" column to view files.');
//   } catch (error) {
//     console.error('Error generating Excel:', error);
//     showToast('danger', 'Error generating Excel file: ' + error.message);
//   }
// };


import * as XLSX from 'xlsx';

export const exportToExcel = (
  state,
  projects,
  expenseTypes,
  totalExpense,
  sortedFilteredExpenses,
  expenseType,
  formatIndianNumber,
  formatDate,
  showToast,
  origin,
  totalCgstAmount,
  totalSgstAmount,
  totalIgstAmount,
  sumQty,
  sumBase
) => {
  showToast('info', 'Preparing Excel file with images...');

  try {
    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Prepare data with GST calculations moved to end of columns
    const worksheetData = sortedFilteredExpenses.map((expense, index) => {
      const photoUrl = expense.photo_url && expense.photo_url !== 'NA'
        ? `${origin}/${expense.photo_url.replace(/\\/g, '/')}`
        : '-';
      const fileName = expense.photo_url && expense.photo_url !== 'NA'
        ? expense.photo_url.split('/').pop()
        : '-';

      // Calculate GST amounts
      const price = parseFloat(expense.price || 0);
      const qty = parseFloat(expense.qty || 0);
      const baseAmount = price * qty;
      const gstPercentage = parseFloat(expense.gst || 0);
      const cgstPercentage = parseFloat(expense.cgst || 0);
      const sgstPercentage = parseFloat(expense.sgst || 0);
      const igstPercentage = parseFloat(expense.igst || 0);
      
      const cgstAmount = expense.isGst ? (baseAmount * cgstPercentage) / 100 : 0;
      const sgstAmount = expense.isGst ? (baseAmount * sgstPercentage) / 100 : 0;
      const igstAmount = expense.isGst ? (baseAmount * igstPercentage) / 100 : 0;
      const totalGstAmount = cgstAmount + sgstAmount + igstAmount;

      return {
        'Sr No': index + 1,
        'Date': formatDate(expense.expense_date),
        'Project': expense.project?.project_name || '-',
        'Expense Type': expense.expense_type?.name || expenseType[expense.expense_id] || '-',
        'Expense Category': expense.expense_type?.expense_category || '-',
        'Qty': expense.qty || '-',
        'Price': expense.price ? formatIndianNumber(expense.price) : '-',
        'Base Amount': formatIndianNumber(baseAmount),
        'Payment By': expense.payment_by || '-',
        'Payment Type': expense.payment_type || '-',
        'Contact': expense.contact || '-',
        'Bank Name': expense.bank_name || '-',
        'Account Number': expense.account_number || '-',
        'IFSC Code': expense.ifsc_code || '-',
        'Transaction ID': expense.transaction_id || '-',
        'About': expense.name || '-',
        'Notes': expense.photo_remark || '-',
        'Photo/PDF': fileName, // Display file name, hyperlink added later
        'GST (%)': expense.isGst ? (gstPercentage || '-') : '-',
        'CGST (%)': expense.isGst ? (cgstPercentage || '-') : '-',
        'CGST Amount': expense.isGst ? formatIndianNumber(cgstAmount) : '-',
        'SGST (%)': expense.isGst ? (sgstPercentage || '-') : '-',
        'SGST Amount': expense.isGst ? formatIndianNumber(sgstAmount) : '-',
        'IGST (%)': expense.isGst ? (igstPercentage || '-') : '-',
        'IGST Amount': expense.isGst ? formatIndianNumber(igstAmount) : '-',
        'Total GST': expense.isGst ? formatIndianNumber(totalGstAmount) : '-',
        'Total Amount': formatIndianNumber(expense.total_price || baseAmount + totalGstAmount)
      };
    });

    // Add totals row at the end of data
    worksheetData.push({
      'Sr No': '',
      'Date': '',
      'Project': '',
      'Expense Type': '',
      'Expense Category': 'Total',
      'Qty': sumQty,
      'Price': '',
      'Base Amount': formatIndianNumber(sumBase),
      'Payment By': '',
      'Payment Type': '',
      'Contact': '',
      'Bank Name': '',
      'Account Number': '',
      'IFSC Code': '',
      'Transaction ID': '',
      'About': '',
      'Notes': '',
      'Photo/PDF': '',
      'GST (%)': '',
      'CGST (%)': '',
      'CGST Amount': formatIndianNumber(totalCgstAmount),
      'SGST (%)': '',
      'SGST Amount': formatIndianNumber(totalSgstAmount),
      'IGST (%)': '',
      'IGST Amount': formatIndianNumber(totalIgstAmount),
      'Total GST': formatIndianNumber(totalCgstAmount + totalSgstAmount + totalIgstAmount),
      'Total Amount': formatIndianNumber(totalExpense)
    });

    // Prepare header section
    const summary = [
      ['EXPENSE REPORT'],
      [`Period: ${state.start_date || 'All'} to ${state.end_date || 'All'}`],
      [`Generated on: ${new Date().toLocaleDateString('en-GB')}`],
      ['']
    ];

    // Create worksheet with explicit headers
    const headers = [
      'Sr No',
      'Date',
      'Project',
      'Expense Type',
      'Expense Category',
      'Qty',
      'Price',
      'Base Amount',
      'Payment By',
      'Payment Type',
      'Contact',
      'Bank Name',
      'Account Number',
      'IFSC Code',
      'Transaction ID',
      'About',
      'Notes',
      'Photo/PDF',
      'GST (%)',
      'CGST (%)',
      'CGST Amount',
      'SGST (%)',
      'SGST Amount',
      'IGST (%)',
      'IGST Amount',
      'Total GST',
      'Total Amount'
    ];

    // Create empty worksheet
    const worksheet = XLSX.utils.aoa_to_sheet([]);

    // Add summary at top
    XLSX.utils.sheet_add_aoa(worksheet, summary, { origin: 'A1' });

    // Add headers at row 5
    XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: 'A5' });

    // Add data starting at row 6
    XLSX.utils.sheet_add_json(worksheet, worksheetData, { origin: 'A6', skipHeader: true });

    // Set column widths
    worksheet['!cols'] = [
      { wch: 6 },   // Sr No
      { wch: 12 },  // Date
      { wch: 20 },  // Project
      { wch: 20 },  // Expense Type
      { wch: 18 },  // Expense Category
      { wch: 8 },   // Qty
      { wch: 12 },  // Price
      { wch: 14 }, // Base Amount
      { wch: 15 },  // Payment By
      { wch: 15 },  // Payment Type
      { wch: 15 },  // Contact
      { wch: 18 },  // Bank Name
      { wch: 18 },  // Account Number
      { wch: 14 },  // IFSC
      { wch: 16 },  // Transaction ID
      { wch: 20 },  // About
      { wch: 20 },  // Notes
      { wch: 50 },  // Photo/PDF
      { wch: 10 },  // GST %
      { wch: 10 },  // CGST %
      { wch: 12 },  // CGST Amount
      { wch: 10 },  // SGST %
      { wch: 12 },  // SGST Amount
      { wch: 10 },  // IGST %
      { wch: 12 },  // IGST Amount
      { wch: 12 },  // Total GST
      { wch: 14 }   // Total Amount
    ];

    // Apply styles to cells
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    
    // Style for main title
    const titleCell = worksheet['A1'];
    if (titleCell) {
      titleCell.s = {
        font: { bold: true, sz: 18, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "2980B9" } },
        alignment: { horizontal: "center", vertical: "center" }
      };
    }
    
    // Merge title cell
    if (!worksheet['!merges']) worksheet['!merges'] = [];
    worksheet['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 26 } });

    // Style for Period and Generated on
    for (let row = 1; row <= 2; row++) {
      const cell = worksheet[XLSX.utils.encode_cell({ r: row, c: 0 })];
      if (cell) {
        cell.s = {
          font: { bold: true, sz: 11, color: { rgb: "34495E" } },
          alignment: { horizontal: "center" }
        };
      }
      worksheet['!merges'].push({ s: { r: row, c: 0 }, e: { r: row, c: 26 } });
    }

    // Style for column headers
    const headerRow = 4; // 0-based for row 5
    for (let col = 0; col < headers.length; col++) {
      const cell = worksheet[XLSX.utils.encode_cell({ r: headerRow, c: col })];
      if (cell) {
        cell.s = {
          font: { bold: true, sz: 11, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "2C3E50" } },
          alignment: { horizontal: "center", vertical: "center", wrapText: true },
          border: {
            top: { style: "medium", color: { rgb: "000000" } },
            bottom: { style: "medium", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } }
          }
        };
      }
    }

    // Style for data rows
    const dataStartRow = 5; // 0-based for row 6
    const dataEndRow = dataStartRow + worksheetData.length - 1;
    
    for (let row = dataStartRow; row <= dataEndRow; row++) {
      const isTotalRow = row === dataEndRow;
      const fillColor = isTotalRow ? "E74C3C" : (row - dataStartRow) % 2 === 0 ? "FFFFFF" : "ECF0F1";
      const fontColor = isTotalRow ? "FFFFFF" : "000000";
      
      for (let col = 0; col < headers.length; col++) {
        const cell = worksheet[XLSX.utils.encode_cell({ r: row, c: col })];
        if (cell) {
          cell.s = {
            font: { sz: 10, bold: isTotalRow, color: { rgb: fontColor } },
            fill: { fgColor: { rgb: fillColor } },
            alignment: { 
              horizontal: col === 0 || (col >= 5 && col <= 7) || (col >= 18) ? "right" : "left",
              vertical: "center",
              wrapText: true
            },
            border: {
              top: { style: isTotalRow ? "medium" : "thin", color: { rgb: isTotalRow ? "000000" : "BDC3C7" } },
              bottom: { style: isTotalRow ? "medium" : "thin", color: { rgb: isTotalRow ? "000000" : "BDC3C7" } },
              left: { style: "thin", color: { rgb: isTotalRow ? "000000" : "BDC3C7" } },
              right: { style: "thin", color: { rgb: isTotalRow ? "000000" : "BDC3C7" } }
            }
          };
        }
      }
    }

    // Convert Photo/PDF column to hyperlinks
    const photoColIndex = headers.indexOf('Photo/PDF');
    const startRow = dataStartRow; // 0-based
    
    for (let i = 0; i < sortedFilteredExpenses.length; i++) {
      const cellAddress = XLSX.utils.encode_cell({ r: startRow + i, c: photoColIndex });
      const expense = sortedFilteredExpenses[i];
      
      if (expense.photo_url && expense.photo_url !== 'NA') {
        const fileUrl = `${origin}/${expense.photo_url.replace(/\\/g, '/')}`;
        const fileName = expense.photo_url.split('/').pop();
        
        worksheet[cellAddress] = {
          t: 's',
          v: fileName,
          l: { Target: fileUrl, Tooltip: 'Click to view file' },
          s: {
            font: { color: { rgb: "0563C1" }, underline: true },
            alignment: { horizontal: "left", vertical: "center" }
          }
        };
      } else {
        worksheet[cellAddress] = {
          t: 's',
          v: '-',
          s: {
            font: { color: { rgb: "000000" } },
            alignment: { horizontal: "left", vertical: "center" }
          }
        };
      }
    }

    // Add filter information section after data
    const filterStartRow = dataEndRow + 2;
    const selectedProject = projects.find(p => p.id === parseInt(state.project_id));
    const selectedExpenseType = expenseTypes.find(et => et.id === parseInt(state.expense_type_id));

    const filterData = [
      ['FILTERS APPLIED'],
      [''],
      ['Total Records', sortedFilteredExpenses.length]
    ];

    if (selectedProject) {
      filterData.push(['Project', selectedProject.project_name]);
    }
    if (selectedExpenseType) {
      filterData.push(['Expense Type', selectedExpenseType.name]);
    }

    XLSX.utils.sheet_add_aoa(worksheet, filterData, { origin: XLSX.utils.encode_cell({r: filterStartRow, c: 0}) });

    // Style FILTERS section
    const filterTitleCell = worksheet[XLSX.utils.encode_cell({ r: filterStartRow, c: 0 })];
    if (filterTitleCell) {
      filterTitleCell.s = {
        font: { bold: true, sz: 14, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "16A085" } },
        alignment: { horizontal: "center", vertical: "center" }
      };
    }
    worksheet['!merges'].push({ s: { r: filterStartRow, c: 0 }, e: { r: filterStartRow, c: 7 } });

    // Style filter information rows
    for (let i = 2; i < filterData.length; i++) {
      const row = filterStartRow + i;
      const cell1 = worksheet[XLSX.utils.encode_cell({ r: row, c: 0 })];
      const cell2 = worksheet[XLSX.utils.encode_cell({ r: row, c: 1 })];
      if (cell1) {
        cell1.s = {
          font: { bold: true, sz: 10 },
          fill: { fgColor: { rgb: "F0F8FF" } },
          alignment: { horizontal: "left", vertical: "center" }
        };
      }
      if (cell2) {
        cell2.s = {
          font: { sz: 10 },
          fill: { fgColor: { rgb: "F0F8FF" } },
          alignment: { horizontal: "left", vertical: "center" }
        };
      }
      worksheet['!merges'].push({ s: { r: row, c: 1 }, e: { r: row, c: 7 } });
    }

    // Set row heights
    worksheet['!rows'] = [];
    worksheet['!rows'][0] = { hpt: 30 };
    worksheet['!rows'][headerRow] = { hpt: 25 };
    worksheet['!rows'][filterStartRow] = { hpt: 25 };
    worksheet['!rows'][dataEndRow] = { hpt: 30 };

    // Append worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Expense Report');

    // Generate filename
    const fileName = `Expense_Report_${state.start_date || 'All'}_to_${state.end_date || 'All'}_${new Date()
      .toISOString()
      .split('T')[0]}.xlsx`;

    // Save Excel file
    XLSX.writeFile(workbook, fileName, { cellStyles: true });
    
    showToast('success', 'Excel file downloaded successfully! Click on file links in the "Photo/PDF" column to view files.');
  } catch (error) {
    console.error('Error generating Excel:', error);
    showToast('danger', 'Error generating Excel file: ' + error.message);
  }
};