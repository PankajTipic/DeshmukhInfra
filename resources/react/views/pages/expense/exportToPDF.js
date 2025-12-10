import jsPDF from 'jspdf';
import 'jspdf-autotable';

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

  // Helper function to add header on each page
  const addHeader = (pageNum) => {
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('EXPENSE REPORT', pageWidth / 2, 30, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    const startDate = state.start_date || 'All';
    const endDate = state.end_date || 'All';
    const generatedDate = new Date().toLocaleDateString('en-GB');
    doc.text(`Period: ${startDate} to ${endDate}`, pageWidth / 2, 48, { align: 'center' });
    doc.text(`Generated on: ${generatedDate}`, pageWidth / 2, 62, { align: 'center' });
    
    doc.setLineWidth(1);
    doc.line(margin, 70, pageWidth - margin, 70);
    
    return 80;
  };

  let yPosition = addHeader(1);
  let currentPage = 1;

  const selectedProject = projects.find(p => p.id === parseInt(state.project_id));
  const selectedExpenseType = expenseTypes.find(et => et.id === parseInt(state.expense_type_id));
  const totalGst = totalCgstAmount + totalSgstAmount + totalIgstAmount;

  // Grand Total at the top
  if (yPosition > pageHeight - 100) {
    doc.addPage();
    currentPage++;
    yPosition = addHeader(currentPage);
  }

  doc.setFillColor(231, 76, 60);
  doc.setDrawColor(192, 57, 43);
  doc.setLineWidth(2);
  doc.rect(margin, yPosition, pageWidth - margin * 2, 35, 'FD');
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(255, 255, 255);
  const grandText = `Grand Total of Expenses :   Amount: Rs ${formatIndianNumber(totalExpense)} | GST: Rs ${formatIndianNumber(totalGst)} | CGST: Rs ${formatIndianNumber(totalCgstAmount)} | SGST: Rs ${formatIndianNumber(totalSgstAmount)} | IGST: Rs ${formatIndianNumber(totalIgstAmount)}`;
  doc.text(grandText, pageWidth / 2, yPosition + 23, { align: 'center' });

  yPosition += 45;

  // Group expenses by project if project filter is applied, otherwise show all
  let groupedExpenses = {};
  
  if (selectedProject) {
    groupedExpenses[selectedProject.project_name] = sortedFilteredExpenses;
  } else {
    // Group by project
    sortedFilteredExpenses.forEach(exp => {
      const projectName = exp.project?.project_name || 'No Project';
      if (!groupedExpenses[projectName]) {
        groupedExpenses[projectName] = [];
      }
      groupedExpenses[projectName].push(exp);
    });
  }

  // Process each project group
  Object.keys(groupedExpenses).forEach((projectName, groupIndex) => {
    const projectExpenses = groupedExpenses[projectName];
    
    // Check if we need a new page
    if (yPosition > pageHeight - 200) {
      doc.addPage();
      currentPage++;
      yPosition = addHeader(currentPage);
    }
    
    // Project header
    doc.setFillColor(41, 128, 185);
    doc.rect(margin, yPosition, pageWidth - margin * 2, 20, 'F');
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(`Project: ${projectName}`, margin + 10, yPosition + 14);
    
    yPosition += 25;

    // Table columns
    const tableColumn = [
      'Sr', 'Date', 'Expense Type', 'Category', 'Qty', 'Price', 
      'Base Amount', 'GST Rs', 'CGST Rs', 'SGST Rs', 'IGST Rs', 'Total',
      'Payment By', 'Payment Type', 'Contact', 'Bank', 'Account', 'IFSC', 'Txn ID', 'About'
    ];

    const tableRows = projectExpenses.map((exp, i) => [
      i + 1,
      formatDate(exp.expense_date),
      exp.expense_type?.name || expenseType[exp.expense_id] || '-',
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

    // Calculate project totals
    const projectTotal = projectExpenses.reduce((sum, exp) => sum + parseFloat(exp.total_price || 0), 0);
    const projectQty = projectExpenses.reduce((sum, exp) => sum + parseFloat(exp.qty || 0), 0);
    const projectBase = projectExpenses.reduce((sum, exp) => sum + ((exp.qty || 0) * (exp.price || 0)), 0);
    const projectGst = projectExpenses.reduce((sum, exp) => sum + parseFloat(exp.gst || 0), 0);
    const projectCgst = projectExpenses.reduce((sum, exp) => sum + parseFloat(exp.cgst || 0), 0);
    const projectSgst = projectExpenses.reduce((sum, exp) => sum + parseFloat(exp.sgst || 0), 0);
    const projectIgst = projectExpenses.reduce((sum, exp) => sum + parseFloat(exp.igst || 0), 0);

    // Add footer row for project totals
    tableRows.push([
      { content: 'Total:', colSpan: 4, styles: { fontStyle: 'bold', halign: 'right' } },
      projectQty,
      '-',
      formatIndianNumber(projectBase),
      formatIndianNumber(projectGst),
      formatIndianNumber(projectCgst),
      formatIndianNumber(projectSgst),
      formatIndianNumber(projectIgst),
      formatIndianNumber(projectTotal),
      '', '', '', '', '', '', ''
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
      margin: { left: margin, right: margin },
      tableWidth: pageWidth - margin * 2,
      alternateRowStyles: { fillColor: [249, 249, 249] },
      didDrawPage: (data) => {
        // Add page number
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
          `Page ${currentPage}`,
          pageWidth / 2,
          pageHeight - 20,
          { align: 'center' }
        );
      }
    });

    yPosition = doc.lastAutoTable.finalY + 20;
  });

  // Add footer on last page
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text(
    `Expense Report | Period: ${state.start_date || 'All'} to ${state.end_date || 'All'} | Generated: ${new Date().toLocaleDateString('en-GB')}`,
    pageWidth / 2,
    pageHeight - 20,
    { align: 'center' }
  );

  const fileName = `Expense_Report_${state.start_date || 'All'}_to_${state.end_date || 'All'}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
  showToast('success', 'PDF file downloaded successfully!');
};