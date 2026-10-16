import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { getUserData } from '../../../util/session';
import { host } from '../../../util/constants';

/* ─────────────── HELPERS ─────────────── */
const fmt = (val) =>
  Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const numberToWords = (num) => {
  if (!num || isNaN(num)) return '';
  const belowTwenty = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight',
    'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const thousands = ['', 'Thousand', 'Lakh', 'Crore'];

  function convertLT(n) {
    if (n === 0) return '';
    if (n < 20) return belowTwenty[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + belowTwenty[n % 10] : '');
    return belowTwenty[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convertLT(n % 100) : '');
  }

  const whole = Math.floor(num);
  const fraction = Math.round((num - whole) * 100);
  let words = '';
  let i = 0;
  let temp = whole;
  while (temp > 0) {
    const part = temp % 1000;
    if (part > 0) {
      let pw = convertLT(part);
      if (i > 0) pw += ' ' + thousands[i];
      words = pw + (words ? ' ' + words : '');
    }
    temp = Math.floor(temp / 1000);
    i++;
    if (i === 3) i = 1;
  }
  if (!words) words = 'Zero';
  let result = words + ' Rupees';
  if (fraction > 0) result += ' and ' + convertLT(fraction) + ' Paise';
  return result + ' Only';
};

const loadImage = (url) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      canvas.getContext('2d').drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = url;
  });

/* ─────────────── MAIN EXPORT ─────────────── */
export const generatePurchaseOrderPDF = async (poData, mode = 'save') => {
  const user = getUserData() || {};
  const company = user.company_info || {};
  const companyName    = company.company_name || 'Company Name';
  const companyPhone   = company.phone_no || '—';
  const companyEmail   = company.email_id || '—';
  const companyAddress = company.land_mark || company.address || '—';
  const companyGST     = company.gst_number || '—';
  const companyDist    = company.Dist || '—';
  const companyTal     = company.Tal || '—';
  const companyState   = company.state || '—';
  const companyPAN     = company.pan_number || '—';

  const vendor  = poData.vendor  || {};
  const project = poData.project || {};
  const items   = Array.isArray(poData.items) ? [...poData.items].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)) : [];
  const isInterState = poData.tax_type === 'inter_state';

  // Load logo
  const logoUrl = company.logo ? `${host}/img/${company.logo}` : null;
  let logoDataUrl = null;
  if (logoUrl) {
    try { logoDataUrl = await loadImage(logoUrl); } catch (e) { console.warn('Logo failed', e); }
  }

  /* ─── Setup Document ─── */
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const pageWidth  = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 28;
  const contentWidth = pageWidth - margin * 2; // ~539.28 pt

  const poDate = poData.po_date ? new Date(poData.po_date).toLocaleDateString('en-IN') : '—';
  const delivDate = poData.delivery_date ? new Date(poData.delivery_date).toLocaleDateString('en-IN') : '—';

  /* ─── Outer border ─── */
  const drawBorder = () => {
    doc.setLineWidth(1.0);
    doc.setDrawColor(30, 60, 120);
    doc.rect(margin - 6, margin - 6, pageWidth - (margin - 6) * 2, pageHeight - (margin - 6) * 2);
  };

  /* ─── Footer ─── */
  const drawFooter = (pageNum, totalPages) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(110);
    doc.text('This is a computer-generated Purchase Order and does not require a physical signature.',
      pageWidth / 2, pageHeight - 22, { align: 'center' });

    doc.setFontSize(7.5);
    doc.setTextColor(80);
    doc.text(companyEmail, margin, pageHeight - 12);
    doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth / 2, pageHeight - 12, { align: 'center' });
    doc.text(companyName, pageWidth - margin, pageHeight - 12, { align: 'right' });
  };

  /* ─── Header Heights ─── */
  const HEADER_BOTTOM_Y_FIRST = 118;
  const HEADER_BOTTOM_Y_SUB   = 114;

  /* ─── Company Header (Drawn on EVERY page) ─── */
  const drawCompanyHeader = (isFirstPage, pageNum, totalPages) => {
    let cy = margin + 4;

    // Logo box (top-right)
    const logoSize = 58;
    const lx = pageWidth - margin - logoSize;
    const ly = margin;
    doc.setFillColor(242, 246, 255);
    doc.rect(lx, ly, logoSize, logoSize, 'F');
    doc.setLineWidth(0.5);
    doc.setDrawColor(180, 200, 235);
    doc.rect(lx, ly, logoSize, logoSize);
    if (logoDataUrl) {
      try { doc.addImage(logoDataUrl, 'PNG', lx + 3, ly + 3, logoSize - 6, logoSize - 6); } catch (e) {}
    }

    // Company name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(20, 50, 120);
    doc.text(companyName, margin, cy + 12);

    // Company meta details
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(70);
    cy += 24;
    doc.text(companyAddress, margin, cy);
    cy += 11;
    doc.text(`Phone: ${companyPhone}  |  Email: ${companyEmail}`, margin, cy);
    cy += 11;
    doc.text(`GSTIN: ${companyGST}  |  PAN: ${companyPAN}  |  State: ${companyState}`, margin, cy);
    cy += 12;

    // Divider line
    doc.setLineWidth(1.0);
    doc.setDrawColor(30, 60, 120);
    doc.line(margin, cy, pageWidth - margin, cy);
    cy += 4;

    // Banner
    if (isFirstPage) {
      doc.setFillColor(30, 60, 120);
      doc.rect(margin, cy, contentWidth, 22, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255);
      doc.text('PURCHASE ORDER', pageWidth / 2, cy + 15, { align: 'center' });
    } else {
      doc.setFillColor(30, 60, 120);
      doc.rect(margin, cy, contentWidth, 20, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(255, 255, 255);
      doc.text(`PURCHASE ORDER  —  PO No: ${poData.po_number || '—'}  [Continued]`, margin + 8, cy + 14);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(`Date: ${poDate}  |  Page ${pageNum} of ${totalPages}`, pageWidth - margin - 8, cy + 14, { align: 'right' });
    }
  };

  /* ─── Content Building ─── */
  let y = HEADER_BOTTOM_Y_FIRST + 4;

  // 1. PO Metadata table
  doc.autoTable({
    startY: y,
    head: [['PURCHASE ORDER DETAILS', 'VENDOR', 'DELIVERY TO']],
    body: [[
      `PO Number:   ${poData.po_number || '—'}\nPO Date:       ${poDate}\nDel. Date:     ${delivDate}\nRef. No:       ${poData.reference_no || '—'}\nStatus:         ${poData.status || '—'}`,
      `${vendor.name || '—'}\n${vendor.address || '—'}\nPhone: ${vendor.mobile || '—'}\nGSTIN: ${vendor.gst_no || '—'}`,
      `${companyName}\n${companyAddress}\nDist: ${companyDist}  |  Tal: ${companyTal}\nPhone: ${companyPhone}\nGSTIN: ${companyGST}`,
    ]],
    margin: { top: HEADER_BOTTOM_Y_SUB, bottom: 38, left: margin, right: margin },
    theme: 'grid',
    tableWidth: contentWidth,
    styles: { fontSize: 8, cellPadding: 5, overflow: 'linebreak', textColor: [0, 0, 0], lineColor: [180, 200, 235], lineWidth: 0.5 },
    headStyles: { fillColor: [220, 232, 255], textColor: [20, 50, 120], fontStyle: 'bold', fontSize: 8, halign: 'left', lineColor: [180, 200, 235], lineWidth: 0.5 },
    columnStyles: {
      0: { cellWidth: contentWidth * 0.33 },
      1: { cellWidth: contentWidth * 0.34 },
      2: { cellWidth: contentWidth * 0.33 },
    },
  });

  y = doc.lastAutoTable.finalY + 4;

  // 2. Project site if applicable
  if (project.project_name) {
    doc.autoTable({
      startY: y,
      head: [['PROJECT / SITE DETAILS']],
      body: [[`Project: ${project.project_name} `]],
      margin: { top: HEADER_BOTTOM_Y_SUB, bottom: 38, left: margin, right: margin },
      theme: 'grid',
      tableWidth: contentWidth,
      styles: { fontSize: 8, cellPadding: 4, textColor: [0, 0, 0], lineColor: [180, 200, 235], lineWidth: 0.5 },
      headStyles: { fillColor: [235, 242, 255], textColor: [20, 50, 120], fontStyle: 'bold', fontSize: 8, halign: 'left', lineColor: [180, 200, 235], lineWidth: 0.5 },
    });
    y = doc.lastAutoTable.finalY + 4;
  }

  // 3. Materials table
  const itemsHead = isInterState
    ? [['#', 'Item & Description', 'HSN/SAC', 'Unit', 'Qty', 'Rate (Rs.)', 'Taxable (Rs.)', 'GST', 'IGST (Rs.)', 'Total (Rs.)']]
    : [['#', 'Item & Description', 'HSN/SAC', 'Unit', 'Qty', 'Rate (Rs.)', 'Taxable (Rs.)', 'GST', 'CGST (Rs.)', 'SGST (Rs.)', 'Total (Rs.)']];

  const itemsBody = items.map((item, idx) => {
    const desc = item.description ? `${item.item_name}\n${item.description}` : item.item_name;
    const gstRateStr = `${Number(item.gst_percent || 0)}%`;
    return isInterState
      ? [
          String(idx + 1), desc, item.hsn_code || '—', item.uom || '—',
          fmt(item.qty), fmt(item.rate), fmt(item.taxable_amount),
          gstRateStr, fmt(item.igst_amount), fmt(item.total_amount),
        ]
      : [
          String(idx + 1), desc, item.hsn_code || '—', item.uom || '—',
          fmt(item.qty), fmt(item.rate), fmt(item.taxable_amount),
          gstRateStr, fmt(item.cgst_amount), fmt(item.sgst_amount), fmt(item.total_amount),
        ];
  });

  // Column styles: fixed explicit widths for all numeric/code cols, auto for Item & Description so it fills remaining width exactly
  const itemColStyles = isInterState
    ? {
        0: { cellWidth: 20, halign: 'center' },
        1: { cellWidth: 'auto', halign: 'left' },
        2: { cellWidth: 42, halign: 'center' },
        3: { cellWidth: 30, halign: 'center' },
        4: { cellWidth: 36, halign: 'right' },
        5: { cellWidth: 50, halign: 'right' },
        6: { cellWidth: 58, halign: 'right' },
        7: { cellWidth: 32, halign: 'center' },
        8: { cellWidth: 50, halign: 'right' },
        9: { cellWidth: 56, halign: 'right' },
      }
    : {
        0: { cellWidth: 18, halign: 'center' },
        1: { cellWidth: 'auto', halign: 'left' },
        2: { cellWidth: 38, halign: 'center' },
        3: { cellWidth: 26, halign: 'center' },
        4: { cellWidth: 34, halign: 'right' },
        5: { cellWidth: 46, halign: 'right' },
        6: { cellWidth: 54, halign: 'right' },
        7: { cellWidth: 30, halign: 'center' },
        8: { cellWidth: 45, halign: 'right' },
        9: { cellWidth: 45, halign: 'right' },
        10: { cellWidth: 54, halign: 'right' },
      };

  doc.autoTable({
    startY: y,
    head: itemsHead,
    body: itemsBody,
    margin: { top: HEADER_BOTTOM_Y_SUB, bottom: 38, left: margin, right: margin },
    theme: 'grid',
    tableWidth: contentWidth,
    styles: { fontSize: 7.5, cellPadding: 3.5, overflow: 'linebreak', textColor: [20, 20, 20], lineColor: [180, 200, 235], lineWidth: 0.4 },
    headStyles: { fillColor: [30, 60, 120], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.5, cellPadding: 4, halign: 'center', lineColor: [30, 60, 120], lineWidth: 0.4 },
    alternateRowStyles: { fillColor: [248, 251, 255] },
    columnStyles: itemColStyles,
  });

  y = doc.lastAutoTable.finalY + 6;

  // 4. Financial Summary Table
  const subtotal     = parseFloat(poData.subtotal     || 0);
  const discount     = parseFloat(poData.discount     || 0);
  const taxable      = parseFloat(poData.taxable_amount || 0);
  const cgst         = parseFloat(poData.cgst_amount  || 0);
  const sgst         = parseFloat(poData.sgst_amount  || 0);
  const igst         = parseFloat(poData.igst_amount  || 0);
  const totalTax     = parseFloat(poData.total_tax    || 0);
  const roundOff     = parseFloat(poData.round_off    || 0);
  const finalAmount  = parseFloat(poData.final_amount || 0);

  const taxSummaryBody = [];
  taxSummaryBody.push(['Sub Total', fmt(subtotal)]);
  if (discount > 0) taxSummaryBody.push(['Discount', `(-) ${fmt(discount)}`]);
  taxSummaryBody.push(['Taxable Amount', fmt(taxable)]);
  if (isInterState) {
    taxSummaryBody.push(['IGST', fmt(igst)]);
  } else {
    if (cgst > 0) taxSummaryBody.push(['CGST', fmt(cgst)]);
    if (sgst > 0) taxSummaryBody.push(['SGST', fmt(sgst)]);
  }
  taxSummaryBody.push(['Total Tax', fmt(totalTax)]);
  if (Math.abs(roundOff) > 0.001) taxSummaryBody.push(['Round Off', fmt(roundOff)]);
  taxSummaryBody.push(['Grand Total', fmt(finalAmount)]);

  const sumTableWidth = 220;
  const sumTableLeft  = pageWidth - margin - sumTableWidth;
  const summaryEstH   = taxSummaryBody.length * 16 + 25;

  if (y + summaryEstH > pageHeight - 50) {
    doc.addPage();
    y = HEADER_BOTTOM_Y_SUB + 6;
  }

  doc.autoTable({
    startY: y,
    head: [['Description', 'Amount (Rs.)']],
    body: taxSummaryBody,
    margin: { top: HEADER_BOTTOM_Y_SUB, bottom: 38, left: sumTableLeft, right: margin },
    theme: 'grid',
    tableWidth: sumTableWidth,
    styles: { fontSize: 8, cellPadding: 3.5, textColor: [0, 0, 0], lineColor: [180, 200, 235], lineWidth: 0.4 },
    headStyles: { fillColor: [30, 60, 120], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8, halign: 'center' },
    columnStyles: {
      0: { cellWidth: 120, halign: 'left' },
      1: { cellWidth: 100, halign: 'right' },
    },
    willDrawCell: (data) => {
      if (data.row.index === taxSummaryBody.length - 1) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [215, 230, 255];
        data.cell.styles.textColor = [20, 50, 120];
      }
    },
  });

  y = doc.lastAutoTable.finalY + 6;

  // 5. Amount in Words Box
  if (y + 24 > pageHeight - 50) {
    doc.addPage();
    y = HEADER_BOTTOM_Y_SUB + 6;
  }

  doc.setFillColor(242, 246, 255);
  doc.rect(margin, y, contentWidth, 18, 'F');
  doc.setDrawColor(30, 60, 120);
  doc.setLineWidth(0.5);
  doc.rect(margin, y, contentWidth, 18);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(20, 50, 120);
  doc.text(`Amount in Words: ${numberToWords(finalAmount)}`, margin + 6, y + 12);
  y += 24;

  // 6. Terms & Conditions / Notes
  const termsRows = [];
  if (poData.payment_terms) termsRows.push([`Payment Terms:\n${poData.payment_terms}`]);
  if (poData.delivery_terms) termsRows.push([`Delivery Terms:\n${poData.delivery_terms}`]);
  if (poData.terms_and_conditions) termsRows.push([`Terms & Conditions:\n${poData.terms_and_conditions}`]);
  if (poData.notes) termsRows.push([`Notes:\n${poData.notes}`]);

  if (termsRows.length > 0) {
    // If remaining space on this page cannot even fit terms + signatures, start a new page
    const estTermsH = termsRows.length * 24 + 20;
    if (y + estTermsH + 75 > pageHeight - 45) {
      doc.addPage();
      y = HEADER_BOTTOM_Y_SUB + 6;
    }

    doc.autoTable({
      startY: y,
      head: [['Terms & Conditions / Notes']],
      body: termsRows,
      margin: { top: HEADER_BOTTOM_Y_SUB, bottom: 38, left: margin, right: margin },
      theme: 'grid',
      tableWidth: contentWidth,
      styles: { fontSize: 8, cellPadding: 4, overflow: 'linebreak', textColor: [0, 0, 0], lineColor: [180, 200, 235], lineWidth: 0.4 },
      headStyles: { fillColor: [220, 232, 255], textColor: [20, 50, 120], fontStyle: 'bold', fontSize: 8 },
    });
    y = doc.lastAutoTable.finalY + 8;
  }

  // 7. Signature Section
  if (y + 75 > pageHeight - 45) {
    doc.addPage();
    y = HEADER_BOTTOM_Y_SUB + 6;
  }

  const sigY = y + 14;
  const leftX  = margin + 15;
  const rightX = pageWidth / 2 + 25;
  const lineLen = 140;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 30, 30);
  doc.text('Vendor Signature & Seal', leftX, sigY);
  doc.text('Authorized Signatory', rightX, sigY);

  const namY = sigY + 50;
  doc.setDrawColor(100);
  doc.setLineWidth(0.6);
  doc.line(leftX, namY, leftX + lineLen, namY);
  doc.line(rightX, namY, rightX + lineLen, namY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(20, 50, 120);
  doc.text(vendor.name || 'Vendor Name', leftX, namY + 12);
  doc.text(companyName, rightX, namY + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100);
  doc.text('(Vendor / Supplier)', leftX, namY + 22);
  doc.text('(For ' + companyName + ')', rightX, namY + 22);

  /* ─── FINAL PASS: Draw border, footer, and COMPANY HEADER on EVERY page ─── */
  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    drawBorder();
    drawFooter(p, totalPages);
    drawCompanyHeader(p === 1, p, totalPages);
  }

  /* ─── Save or Return ─── */
  const filename = `PO-${poData.po_number || 'Draft'}.pdf`;
  if (mode === 'save') {
    doc.save(filename);
  } else {
    return doc.output('blob');
  }
};
