

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { host } from '../../../util/constants';
import { getUserData } from '../../../util/session';

export const exportToPDF = (
  state,
  projects,
  expenseTypes,
  totalExpense,
  sortedFilteredExpenses,
  expenseType,
  formatIndianNumber,
  formatDate,
  showToast,
  totalCgstAmount,
  totalSgstAmount,
  totalIgstAmount,
  sumQty,
  sumBase
) => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;

  // User & company data
  const user = getUserData();
  const companyInfo = user?.company_info || {};
  const totalGst = totalCgstAmount + totalSgstAmount + totalIgstAmount;
  const selectedProject = projects.find(p => p.id === parseInt(state.project_id));

  // Track page numbers
  let pageNumber = 0;
  let headerHeight = 0;


  // ─────────────────────────────────────────────────
  // Function to draw header + border on current page
  // ─────────────────────────────────────────────────
  const drawHeaderAndBorder = (isFirstPage) => {
    // 1. Outer border
    doc.setDrawColor(80, 80, 80);
    doc.setLineWidth(1);
    doc.rect(margin, margin, pageWidth - margin * 2, pageHeight - margin * 2);

    // 2. Logo (top-right)
    const logoSize = 70; // pt (~25mm)
    const logoX = pageWidth - margin - logoSize - 15;
    const logoY = margin + 15;
    let logoUrl = null;

    if (companyInfo.logo && companyInfo.logo !== "invoice/empty.png") {
      logoUrl = `${host}/img/${companyInfo.logo}`;
    }

    if (logoUrl) {
      try {
        doc.addImage(logoUrl, 'PNG', logoX, logoY, logoSize, logoSize);
      } catch (err) {
        console.warn("Logo failed to load:", err);
        doc.setFillColor(220, 220, 240);
        doc.rect(logoX, logoY, logoSize, logoSize, 'F');
        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text("LOGO", logoX + 15, logoY + 40);
      }
    } else {
      doc.setFillColor(220, 220, 240);
      doc.rect(logoX, logoY, logoSize, logoSize, 'F');
      doc.setFontSize(12);
      doc.setTextColor(100);
      doc.text("LOGO", logoX + 15, logoY + 40);
    }

    // 3. Company name & details (top-left)
    const textX = margin + 15;
    let textY = margin + 30;

    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(40, 40, 60);
    doc.text(companyInfo.company_name || "Deshmukh Infra Soft", textX, textY);

    textY += 22;
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(60);

    const details = [
      companyInfo.land_mark || "Urali Kanchan, Pune",
      `Phone: ${companyInfo.phone_no || "9173635656"}`,
      `Email: ${companyInfo.email_id || "shreyas.gijare.21@gmail.com"}`,
      `GSTIN: ${companyInfo.gst_number || "Not Available"}`,
    ];

    details.forEach(line => {
      if (line && line.trim()) {
        doc.text(line, textX, textY);
        textY += 15;
      }
    });

    // 4. Horizontal separator
    doc.setLineWidth(1.5);
    doc.setDrawColor(0, 0, 0);
    doc.line(margin + 10, textY + 10, pageWidth - margin - 10, textY + 10);

    // 5. Title
    // doc.setFontSize(18);
    // doc.setFont(undefined, 'bold');
    // doc.setTextColor(0);
    // let titleText = 'EXPENSE REPORT';
    // // if (!isFirstPage) titleText += ' (continued)';
    // doc.text(titleText, pageWidth / 2, textY + 35, { align: 'center' });

    // 5. Title (ONLY on First Page)
if (isFirstPage) {
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(0);

  doc.text(
    'EXPENSE REPORT',
    pageWidth / 2,
    textY + 35,
    { align: 'center' }
  );
}


    // Return content start Y (below header)
    let contentStartY = textY + 50;

    // Period & Generated date (ONLY on first page)
    if (isFirstPage) {
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(70);

      const startDate = state.start_date || 'All';
      const endDate = state.end_date || 'All';
      const generatedDate = new Date().toLocaleDateString('en-GB');

      doc.text(`Period: ${startDate} to ${endDate}`, pageWidth / 2, textY + 55, { align: 'center' });
      doc.text(`Generated on: ${generatedDate}`, pageWidth / 2, textY + 70, { align: 'center' });

      contentStartY = textY + 90;
    }

    // Grand Total at the top (ONLY on first page)
    if (isFirstPage) {
      doc.setFillColor(231, 76, 60);
      doc.setDrawColor(192, 57, 43);
      doc.setLineWidth(2);
      doc.rect(margin, contentStartY, pageWidth - margin * 2, 35, 'FD');

      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(255, 255, 255);

      const grandText = `Grand Total of Expenses : Amount: Rs ${formatIndianNumber(totalExpense)} | GST: Rs ${formatIndianNumber(totalGst)} | CGST: Rs ${formatIndianNumber(totalCgstAmount)} | SGST: Rs ${formatIndianNumber(totalSgstAmount)} | IGST: Rs ${formatIndianNumber(totalIgstAmount)}`;
      doc.text(grandText, pageWidth / 2, contentStartY + 23, { align: 'center' });

      contentStartY += 50;
    }

    return contentStartY;
  };

  // Draw header on first page
  // let yPosition = drawHeaderAndBorder(true);
  let yPosition = drawHeaderAndBorder(true);
headerHeight = yPosition;

  pageNumber = 1;

  // Group expenses
  let groupedExpenses = {};
  if (selectedProject) {
    groupedExpenses[selectedProject.project_name] = sortedFilteredExpenses;
  } else {
    sortedFilteredExpenses.forEach(exp => {
      const projectName = exp.project?.project_name || 'No Project';
      if (!groupedExpenses[projectName]) groupedExpenses[projectName] = [];
      groupedExpenses[projectName].push(exp);
    });
  }

  // Process each group
  Object.keys(groupedExpenses).forEach((projectName) => {
    const projectExpenses = groupedExpenses[projectName];

    // Project header
    doc.setFillColor(41, 128, 185);
    doc.rect(margin, yPosition, pageWidth - margin * 2, 25, 'F');
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(`Project: ${projectName}`, margin + 15, yPosition + 18);

    yPosition += 35;

    // Table
    const tableColumn = [
      'Sr', 'Date', 'Expense Type', 'Party Name', 'Party GST', 'Party Address',
      'Category', 'Qty', 'Price',
      'Base Amount', 'GST Rs', 'CGST Rs', 'SGST Rs', 'IGST Rs',
      'Total', 'Payment By', 'Payment Type', 'Contact', 'Bank',
      'Account', 'IFSC', 'Txn ID', 'About'
    ];

    const tableRows = projectExpenses.map((exp, i) => [
      i + 1,
      formatDate(exp.expense_date),
      exp.expense_type?.name || expenseType[exp.expense_id] || '-',
 exp.party_name || '-',
     exp.party_gst_number || '-',
     exp.party_address || '-',
      exp.expense_type?.expense_category || '-',
      exp.qty || '-',
      formatIndianNumber(exp.price || 0),
      formatIndianNumber((exp.qty || 0) * (exp.price || 0)),
      exp.isGst ? formatIndianNumber(exp.gst || 0) : '-',
      exp.isGst ? formatIndianNumber(exp.cgst || 0) : '-',
      exp.isGst ? formatIndianNumber(exp.sgst || 0) : '-',
      exp.isGst ? formatIndianNumber(exp.igst || 0) : '-',
      formatIndianNumber(exp.total_price || 0),
      exp.payment_by || '-',
      exp.payment_type || '-',
      exp.contact || '-',
      exp.bank_name || '-',
      exp.account_number || '-',
      exp.ifsc_code || '-',
      exp.transaction_id || '-',
      exp.name || '-'
    ]);

    // Project totals
    const projectTotal = projectExpenses.reduce((sum, exp) => sum + parseFloat(exp.total_price || 0), 0);
    const projectQty = projectExpenses.reduce((sum, exp) => sum + parseFloat(exp.qty || 0), 0);
    const projectBase = projectExpenses.reduce((sum, exp) => sum + ((exp.qty || 0) * (exp.price || 0)), 0);
    const projectGst = projectExpenses.reduce((sum, exp) => sum + parseFloat(exp.gst || 0), 0);
    const projectCgst = projectExpenses.reduce((sum, exp) => sum + parseFloat(exp.cgst || 0), 0);
    const projectSgst = projectExpenses.reduce((sum, exp) => sum + parseFloat(exp.sgst || 0), 0);
    const projectIgst = projectExpenses.reduce((sum, exp) => sum + parseFloat(exp.igst || 0), 0);

    tableRows.push([
      { content: 'Total:', colSpan: 7, styles: { fontStyle: 'bold', halign: 'right' } },
      projectQty,
      '-',  
      formatIndianNumber(projectBase),
      formatIndianNumber(projectGst),
      formatIndianNumber(projectCgst),
      formatIndianNumber(projectSgst),
      formatIndianNumber(projectIgst),
      formatIndianNumber(projectTotal),
      '', '', '', '', '', '', '', '', '', ''
    ]);



  

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: yPosition,
      theme: 'grid',
      styles: {
        fontSize: 7,
        cellPadding: 3,
        halign: 'center',
        valign: 'middle',
        lineWidth: 0.5,
        lineColor: [200, 200, 200]
      },
      headStyles: {
        fillColor: [52, 73, 94],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 7,
        halign: 'center'
      },
      footStyles: {
        fillColor: [236, 240, 241],
        textColor: [0, 0, 0],
        fontStyle: 'bold'
      },
      // margin: { 
      //   left: margin, 
      //   right: margin,
      //   top: 180, // Reserve space for header on new pages
      //   bottom: 60 // Reserve space for footer
      // },

margin: { 
  left: margin,
  right: margin,
  top: 180,   // fixed header space
  bottom: 60
},


      tableWidth: pageWidth - margin * 2,
      alternateRowStyles: { fillColor: [249, 249, 249] },




      didDrawPage: (data) => {
        const currentPageNum = doc.internal.getCurrentPageInfo().pageNumber;
        
        // Draw header on new pages (not page 1)
        if (currentPageNum > pageNumber) {
          pageNumber = currentPageNum;
          drawHeaderAndBorder(false);
        }

        // Page number
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
          `Page ${currentPageNum}`,
          pageWidth / 2,
          pageHeight - 20,
          { align: 'center' }
        );
      },


// didDrawPage: (data) => {
//   const currentPageNum = doc.internal.getCurrentPageInfo().pageNumber;

//   // Draw header on every new page
//   const startY = drawHeaderAndBorder(currentPageNum === 1);

//   // Update cursor position so table starts BELOW header
//   data.cursor.y = startY;

//   // Save for next pages
//   headerHeight = startY;

//   // Page Number
//   doc.setFontSize(8);
//   doc.setTextColor(128, 128, 128);

//   doc.text(
//     `Page ${currentPageNum}`,
//     pageWidth / 2,
//     pageHeight - 20,
//     { align: 'center' }
//   );
// },



      
      showHead: 'everyPage',
      rowPageBreak: 'avoid',
    });

    yPosition = doc.lastAutoTable.finalY + 25;
  });

  // Final footer text on all pages
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Expense Report | Period: ${state.start_date || 'All'} to ${state.end_date || 'All'} | Generated: ${new Date().toLocaleDateString('en-GB')}`,
      pageWidth / 2,
      pageHeight - 35,
      { align: 'center' }
    );
  }

  const fileName = `Expense_Report_${state.start_date || 'All'}_to_${state.end_date || 'All'}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
  showToast('success', 'PDF file downloaded successfully!');
};





// import jsPDF from 'jspdf';
// import 'jspdf-autotable';
// import { host } from '../../../util/constants';
// import { getUserData } from '../../../util/session';

// export const exportToPDF = (
//   state,
//   projects,
//   expenseTypes,
//   totalExpense,
//   sortedFilteredExpenses,
//   expenseType,
//   formatIndianNumber,
//   formatDate,
//   showToast,
//   totalCgstAmount,
//   totalSgstAmount,
//   totalIgstAmount,
//   sumQty,
//   sumBase
// ) => {
//   const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
//   const pageWidth = doc.internal.pageSize.getWidth();
//   const pageHeight = doc.internal.pageSize.getHeight();
//   const margin = 40;        // Outer margin
//   const borderGap = 2;      // 2px gap from border as requested

//   const user = getUserData();
//   const companyInfo = user?.company_info || {};
//   const totalGst = totalCgstAmount + totalSgstAmount + totalIgstAmount;
//   const selectedProject = projects.find(p => p.id === parseInt(state.project_id));

//   let pageNumber = 0;

//   // Draw Header + Border on every page
//   const drawHeaderAndBorder = (isFirstPage = false) => {
//     // Outer Border with 2px gap
//     doc.setDrawColor(80, 80, 80);
//     doc.setLineWidth(1.5);
//     doc.rect(
//       margin + borderGap, 
//       margin + borderGap, 
//       pageWidth - margin * 2 - borderGap * 2, 
//       pageHeight - margin * 2 - borderGap * 2
//     );

//     // Logo (Top Right)
//     const logoSize = 70;
//     const logoX = pageWidth - margin - logoSize - 20;
//     const logoY = margin + 20;

//     let logoUrl = null;
//     if (companyInfo.logo && companyInfo.logo !== "invoice/empty.png") {
//       logoUrl = `${host}/img/${companyInfo.logo}`;
//     }

//     if (logoUrl) {
//       try {
//         doc.addImage(logoUrl, 'PNG', logoX, logoY, logoSize, logoSize);
//       } catch (err) {
//         doc.setFillColor(220, 220, 240);
//         doc.rect(logoX, logoY, logoSize, logoSize, 'F');
//       }
//     }

//     // Company Details (Top Left)
//     let textY = margin + 35;
//     const textX = margin + 20;

//     doc.setFontSize(18);
//     doc.setFont(undefined, 'bold');
//     doc.setTextColor(40, 40, 60);
//     doc.text(companyInfo.company_name || "Deshmukh Infra Soft", textX, textY);

//     textY += 22;
//     doc.setFontSize(10);
//     doc.setFont(undefined, 'normal');
//     doc.setTextColor(70);

//     const details = [
//       companyInfo.land_mark || "Urali Kanchan, Pune",
//       `Phone: ${companyInfo.phone_no || "9173635656"}`,
//       `Email: ${companyInfo.email_id || "shreyas.gijare.21@gmail.com"}`,
//       `GSTIN: ${companyInfo.gst_number || "Not Available"}`,
//     ];

//     details.forEach(line => {
//       if (line && line.trim()) {
//         doc.text(line, textX, textY);
//         textY += 14;
//       }
//     });

//     // Horizontal Line
//     doc.setLineWidth(1);
//     doc.setDrawColor(0, 0, 0);
//     doc.line(margin + 15, textY + 10, pageWidth - margin - 15, textY + 10);

//     // Title (Only on first page)
//     if (isFirstPage) {
//       doc.setFontSize(16);
//       doc.setFont(undefined, 'bold');
//       doc.setTextColor(0);
//       doc.text('EXPENSE REPORT', pageWidth / 2, textY + 40, { align: 'center' });

//       // Period
//       const startDate = state.start_date || 'All';
//       const endDate = state.end_date || 'All';
//       doc.setFontSize(10);
//       doc.setFont(undefined, 'normal');
//       doc.text(`Period: ${startDate} to ${endDate}`, pageWidth / 2, textY + 58, { align: 'center' });
//     }

//     return textY + 80; // Return starting Y for table
//   };

//   // Start with first page
//   let yPosition = drawHeaderAndBorder(true);
//   pageNumber = 1;

//   // Group by Project
//   let groupedExpenses = {};
//   if (selectedProject) {
//     groupedExpenses[selectedProject.project_name] = sortedFilteredExpenses;
//   } else {
//     sortedFilteredExpenses.forEach(exp => {
//       const projectName = exp.project?.project_name || 'No Project';
//       if (!groupedExpenses[projectName]) groupedExpenses[projectName] = [];
//       groupedExpenses[projectName].push(exp);
//     });
//   }

//   Object.keys(groupedExpenses).forEach((projectName) => {
//     const projectExpenses = groupedExpenses[projectName];

//     // Project Header
//     doc.setFillColor(41, 128, 185);
//     doc.rect(margin + borderGap, yPosition, pageWidth - margin * 2 - borderGap * 2, 28, 'F');
//     doc.setFontSize(12);
//     doc.setFont(undefined, 'bold');
//     doc.setTextColor(255);
//     doc.text(`Project: ${projectName}`, margin + 25, yPosition + 19);

//     yPosition += 40;

//     // Table Columns - Added 3 new columns
//     const tableColumn = [
//       'Sr', 'Date', 'Project', 'Party Name', 'Party GST', 'Party Address',
//       'Expense Type', 'Category', 'Qty', 'Price', 'Base Amount',
//       'GST Rs', 'CGST Rs', 'SGST Rs', 'IGST Rs', 'Total',
//       'Payment By', 'Payment Type', 'Contact', 'Bank', 'Account', 'IFSC', 'Txn ID', 'About'
//     ];

//     const tableRows = projectExpenses.map((exp, i) => [
//       i + 1,
//       formatDate(exp.expense_date),
//       exp.project?.project_name || '-',
//       exp.party_name || '-',
//       exp.party_gst_number || '-',
//       exp.party_address || '-',
//       exp.expense_type?.name || expenseType[exp.expense_id] || '-',
//       exp.expense_type?.expense_category || '-',
//       exp.qty || '-',
//       formatIndianNumber(exp.price || 0),
//       formatIndianNumber((exp.qty || 0) * (exp.price || 0)),
//       exp.isGst ? formatIndianNumber(exp.gst || 0) : '-',
//       exp.isGst ? formatIndianNumber(exp.cgst || 0) : '-',
//       exp.isGst ? formatIndianNumber(exp.sgst || 0) : '-',
//       exp.isGst ? formatIndianNumber(exp.igst || 0) : '-',
//       formatIndianNumber(exp.total_price || 0),
//       exp.payment_by || '-',
//       exp.payment_type || '-',
//       exp.contact || '-',
//       exp.bank_name || '-',
//       exp.account_number || '-',
//       exp.ifsc_code || '-',
//       exp.transaction_id || '-',
//       exp.name || '-'
//     ]);

//     // Project Total Row
//     const projectTotal = projectExpenses.reduce((sum, exp) => sum + parseFloat(exp.total_price || 0), 0);

//     tableRows.push([
//       { content: 'Project Total', colSpan: 15, styles: { fontStyle: 'bold', halign: 'right' } },
//       '', '', '', '', '', '', '', '', '', '',
//       formatIndianNumber(projectTotal),
//       '', '', '', '', '', '', '', '', '', ''
//     ]);

//     doc.autoTable({
//       head: [tableColumn],
//       body: tableRows,
//       startY: yPosition,
//       theme: 'grid',
//       styles: { fontSize: 7, cellPadding: 3, halign: 'center', lineWidth: 0.5 },
//       headStyles: { fillColor: [52, 73, 94], textColor: 255, fontStyle: 'bold', fontSize: 7 },
//       margin: { left: margin + borderGap, right: margin + borderGap, top: 180, bottom: 60 },
//       tableWidth: pageWidth - margin * 2 - borderGap * 2,
//       showHead: 'everyPage',
//       didDrawPage: (data) => {
//         const currentPageNum = doc.internal.getCurrentPageInfo().pageNumber;
//         if (currentPageNum > pageNumber) {
//           pageNumber = currentPageNum;
//           drawHeaderAndBorder(false);
//         }
//         // Page Number
//         doc.setFontSize(8);
//         doc.setTextColor(128);
//         doc.text(`Page ${currentPageNum}`, pageWidth / 2, pageHeight - 25, { align: 'center' });
//       }
//     });

//     yPosition = doc.lastAutoTable.finalY + 30;
//   });

//   // Final Footer
//   const totalPages = doc.internal.getNumberOfPages();
//   for (let i = 1; i <= totalPages; i++) {
//     doc.setPage(i);
//     doc.setFontSize(8);
//     doc.setTextColor(100);
//     doc.text(
//       `Expense Report | Generated: ${new Date().toLocaleDateString('en-GB')}`,
//       pageWidth / 2,
//       pageHeight - 40,
//       { align: 'center' }
//     );
//   }

//   const fileName = `Expense_Report_${new Date().toISOString().split('T')[0]}.pdf`;
//   doc.save(fileName);
//   showToast('success', 'PDF downloaded successfully!');
// };