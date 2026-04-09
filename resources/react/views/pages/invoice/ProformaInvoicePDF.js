
// import jsPDF from 'jspdf';
// import 'jspdf-autotable';
// import { getUserData } from '../../../util/session';
// import { host } from '../../../util/constants';

// /* ---------------- HELPERS ---------------- */
// const formatCurrency = (value) => {
//   const num = Number(value || 0);
//   return num.toLocaleString('en-IN', {
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 2,
//   });
// };


// // Indian Rupees number to words (with paise support)
// const numberToWordsIndian = (num) => {
//   if (!num || isNaN(num)) return '';

//   const belowTwenty = [
//     '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
//     'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
//     'Seventeen', 'Eighteen', 'Nineteen'
//   ];

//   const tens = [
//     '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
//   ];

//   const thousands = ['', 'Thousand', 'Lakh', 'Crore'];

//   function convertLessThanThousand(n) {
//     if (n === 0) return '';
//     if (n < 20) return belowTwenty[n];
//     if (n < 100) {
//       return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + belowTwenty[n % 10] : '');
//     }
//     return (
//       belowTwenty[Math.floor(n / 100)] + ' Hundred' +
//       (n % 100 ? ' ' + convertLessThanThousand(n % 100) : '')
//     );
//   }

//   const whole = Math.floor(num);
//   const fraction = Math.round((num - whole) * 100);

//   let words = '';
//   let i = 0;

//   let temp = whole;
//   while (temp > 0) {
//     const part = temp % 1000;
//     if (part > 0) {
//       let partWords = convertLessThanThousand(part);
//       if (i > 0) partWords += ' ' + thousands[i];
//       words = partWords + (words ? ' ' + words : '');
//     }
//     temp = Math.floor(temp / 1000);
//     i++;
//     if (i === 3) i = 1; // after thousand → lakh, then crore, etc.
//   }

//   if (!words) words = 'Zero';

//   let result = words + ' Rupees';

//   if (fraction > 0) {
//     result += ' and ' + convertLessThanThousand(fraction) + ' Paise';
//   }

//   return result + ' Only';
// };

// const formatScopePoints = (text = '') => {
//   if (!text) return '—';
//   const points = text
//     .split(/[\n•,|.]+/)
//     .map(t => t.trim())
//     .filter(Boolean);
//   if (!points.length) return '—';
//   return points.map(p => `• ${p}`).join('\n_____________________\n');
// };

// const hasRowLevelGST = (items) => {
//   if (!items || items.length === 0) return false;
//   return items.some(
//     item =>
//       Number(item.gst_percent || 0) > 0 ||
//       Number(item.cgst_amount || 0) > 0 ||
//       Number(item.sgst_amount || 0) > 0
//   );
// };

// const hasGlobalGST = (data) => {
//   return (
//     Number(data.cgst_amount || 0) > 0 ||
//     Number(data.sgst_amount || 0) > 0 ||
//     Number(data.igst_amount || 0) > 0
//   );
// };

// const hasScope = (items) => {
//   if (!items || items.length === 0) return false;
//   return items.some(item => item.work_sub_description && item.work_sub_description.trim());
// };

// /* ---------------- IMAGE LOADER ---------------- */
// const loadImage = (url) =>
//   new Promise((resolve, reject) => {
//     const img = new Image();
//     img.crossOrigin = 'Anonymous';
//     img.onload = () => {
//       const canvas = document.createElement('canvas');
//       canvas.width = img.width;
//       canvas.height = img.height;
//       canvas.getContext('2d').drawImage(img, 0, 0);
//       resolve(canvas.toDataURL('image/png'));
//     };
//     img.onerror = reject;
//     img.src = url;
//   });

// /* ---------------- MAIN ---------------- */
// export const generateProformaInvoicePDF = async (
//   proformaInvoice,
//   lang = 'english',
//   mode = 'save'
// ) => {
//   const user = getUserData() || {};
//   const company = user.company_info || {};
//   const companyName = company.company_name || 'Company Name';
//   const companyPhone = company.phone_no || '—';
//   const companyEmail = company.email_id || '—';
//   const companyAddress = company.land_mark || company.address || '—';
//   const companyGST = company.gst_number || user.gst || '—';

//   const customer = proformaInvoice.customer || {};
//   const items = Array.isArray(proformaInvoice.details)
//     ? [...proformaInvoice.details].sort((a, b) => (a.id || 0) - (b.id || 0))
//     : [];

//   const showRowGST = hasRowLevelGST(items);
//   const showGlobalGST = hasGlobalGST(proformaInvoice);
//   const showScope = hasScope(items);
//   const hasTermsPage = !!(
//     proformaInvoice.notes ||
//     proformaInvoice.payment_terms ||
//     proformaInvoice.terms_conditions
//   );

//   const logoUrl = company.logo ? `${host}/img/${company.logo}` : null;
//   let logoDataUrl = null;
//   if (logoUrl) {
//     try {
//       logoDataUrl = await loadImage(logoUrl);
//     } catch (e) {
//       console.warn('Logo failed to load:', e);
//     }
//   }

//   /* ---------- DOCUMENT ---------- */
//   const doc = new jsPDF({
//     orientation: 'portrait',
//     unit: 'pt',
//     format: 'a4',
//   });

//   const pageWidth = doc.internal.pageSize.getWidth();
//   const pageHeight = doc.internal.pageSize.getHeight();
//   const margin = 40;
//   const contentWidth = pageWidth - margin * 2;
//   let y = margin;

//   /* ---------- REUSABLE HEADER FUNCTION ---------- */
//   const drawCompanyHeader = (includeBannerAndDetails = false) => {
//     // Outer border
//     doc.setLineWidth(1.1);
//     doc.rect(
//       margin - 10,
//       margin - 10,
//       pageWidth - (margin - 10) * 2,
//       pageHeight - (margin - 10) * 2
//     );

//     let cy = margin + 16;

//     // Company info - left
//     doc.setFont('helvetica', 'bold');
//     doc.setFontSize(19);
//     doc.setTextColor(20);
//     doc.text(companyName, margin, cy);

//     doc.setFont('helvetica', 'normal');
//     doc.setFontSize(9.5);
//     doc.setTextColor(70);
//     cy += 22;
//     doc.text(companyAddress, margin, cy);
//     cy += 14;
//     doc.text(`Phone: ${companyPhone} | Email: ${companyEmail}`, margin, cy);

//     // Logo - right
//     const size = 68;
//     const lx = pageWidth - margin - size;
//     const ly = margin;
//     doc.setFillColor(235, 240, 255);
//     doc.rect(lx, ly, size, size, 'F');

//     if (logoDataUrl) {
//       try {
//         doc.addImage(logoDataUrl, 'PNG', lx + 4, ly + 4, size - 8, size - 8);
//       } catch (e) {
//         console.warn("Failed to add logo", e);
//       }
//     }

//     cy += 26;
//     // Horizontal line
//     doc.setLineWidth(0.8);
//     doc.line(margin, cy, pageWidth - margin, cy);
//     cy += 6;

//     if (includeBannerAndDetails) {
//       // Banner
//       doc.setFillColor(200, 225, 255);
//       doc.rect(margin, cy, contentWidth, 28, 'F');
//       doc.rect(margin, cy, contentWidth, 28);
//       doc.setFontSize(17);
//       doc.setFont('helvetica', 'bold');
//       doc.setTextColor(20);
//       doc.text('Proforma Invoice', pageWidth / 2, cy + 19, { align: 'center' });
//       cy += 34;

//       // From / To / Details table
//       doc.autoTable({
//         startY: cy,
//         head: [['FROM', 'TO', 'DETAILS']],
//         body: [
//           [
//             `${companyName}\n${companyAddress}\nPhone: ${user.mobile || '—'}\nGSTIN: ${companyGST}\nEmail: ${companyEmail}`,
//             `Customer: ${customer.name || '—'}\nSite: ${proformaInvoice.project?.project_name || '—'}\n${customer.address || '—'}\nPhone: ${customer.mobile || '—'}\nGSTIN: ${customer.gstin || '—'}`,
//             `Proforma Invoice No: ${proformaInvoice.proforma_invoice_number || '—'}\n${
//               proformaInvoice.tally_invoice_number ? `Tally Invoice No: ${proformaInvoice.tally_invoice_number}\n` : ''
//             }Date: ${proformaInvoice.invoice_date || '—'}\n${
//               proformaInvoice.delivery_date ? `Delivery Date: ${proformaInvoice.delivery_date}\n` : ''
//             }Work Order: ${proformaInvoice.work_order?.invoice_number || '—'}`,
//           ],
//         ],
//         margin: { left: margin, right: margin },
//         theme: 'grid',
//         tableWidth: contentWidth,
//         styles: {
//           fontSize: 9,
//           cellPadding: 6,
//           overflow: 'linebreak',
//           lineColor: [0, 0, 0],
//           lineWidth: 0.5,
//         },
//         headStyles: {
//           fillColor: [210, 230, 255],
//           textColor: [0, 0, 0],
//           halign: 'left',
//           fontStyle: 'bold',
//         },
//         columnStyles: {
//           0: { cellWidth: contentWidth * 0.38 },
//           1: { cellWidth: contentWidth * 0.38 },
//           2: { cellWidth: contentWidth * 0.24 },
//         },
//       });

//       cy = doc.lastAutoTable.finalY + 10;
//     }

//     return cy;
//   };

//   /* ---------- FOOTER FUNCTION ---------- */
//   const drawFooter = () => {
//     doc.setFontSize(9);
//     doc.setTextColor(70);
//     doc.text(
//       'This proforma invoice is computer generated and authorized.',
//       pageWidth / 2,
//       pageHeight - 50,
//       { align: 'center' }
//     );

//     doc.setFontSize(7.5);
//     doc.setTextColor(0, 0, 0);
//     doc.text(companyEmail, margin + 5, pageHeight - 18);
//     doc.text(
//       'www.deshmukhinfrasolutions.com',
//       pageWidth - margin - 5,
//       pageHeight - 18,
//       { align: 'right' }
//     );
//   };

//   /* ---------- PAGE 1 ---------- */
//   y = drawCompanyHeader(true);

//   /* ---------- ITEMS TABLE COLUMNS ---------- */
//   let COLS;
//   if (showRowGST) {
//     if (showScope) {
//       COLS = [
//         { key: 'sr', title: 'Sr. No.', w: 5 },
//         { key: 'type', title: 'Work Type', w: 18 },
//         { key: 'scope', title: 'Scope', w: 22 },
//         { key: 'uom', title: 'Unit', w: 6 },
//         { key: 'qty', title: 'Quantity', w: 6 },
//         { key: 'price', title: 'Price', w: 8 },
//         { key: 'base', title: 'Base Amount', w: 8 },
//         { key: 'gstp', title: 'GST %', w: 5 },
//         { key: 'cgst', title: 'CGST', w: 7 },
//         { key: 'sgst', title: 'SGST', w: 7 },
//         { key: 'total', title: 'Total', w: 8 },
//       ];
//     } else {
//       COLS = [
//         { key: 'sr', title: 'Sr. No.', w: 5 },
//         { key: 'type', title: 'Work Type', w: 40 },
//         { key: 'uom', title: 'Unit', w: 6 },
//         { key: 'qty', title: 'Quantity', w: 6 },
//         { key: 'price', title: 'Price', w: 8 },
//         { key: 'base', title: 'Base Amount', w: 8 },
//         { key: 'gstp', title: 'GST %', w: 5 },
//         { key: 'cgst', title: 'CGST', w: 7 },
//         { key: 'sgst', title: 'SGST', w: 7 },
//         { key: 'total', title: 'Total', w: 8 },
//       ];
//     }
//   } else {
//     if (showScope) {
//       COLS = [
//         { key: 'sr', title: 'Sr. No.', w: 6 },
//         { key: 'type', title: 'Work Type', w: 22 },
//         { key: 'scope', title: 'Scope', w: 28 },
//         { key: 'uom', title: 'Unit', w: 7 },
//         { key: 'qty', title: 'Quantity', w: 7 },
//         { key: 'price', title: 'Price', w: 12 },
//         { key: 'total', title: 'Total', w: 18 },
//       ];
//     } else {
//       COLS = [
//         { key: 'sr', title: 'Sr. No.', w: 6 },
//         { key: 'type', title: 'Work Type', w: 50 },
//         { key: 'uom', title: 'Unit', w: 7 },
//         { key: 'qty', title: 'Quantity', w: 7 },
//         { key: 'price', title: 'Price', w: 12 },
//         { key: 'total', title: 'Total', w: 18 },
//       ];
//     }
//   }

//   const columnStyles = {};
//   COLS.forEach((c, i) => {
//     columnStyles[i] = {
//       cellWidth: (contentWidth * c.w) / 100,
//       halign:
//         (c.key === 'scope' || c.key === 'type')
//           ? 'left'
//           : ['sr', 'uom', 'qty', 'gstp'].includes(c.key)
//           ? 'center'
//           : 'right',
//       valign: 'top',
//     };
//   });

//   const headRow = COLS.map(c => c.title);

//   const tableBody = items.map((item, idx) => {
//     const qty = Number(item.qty || 0);
//     const price = Number(item.price || 0);
//     const base = qty * price;
//     const scopeText = formatScopePoints(item.work_sub_description || '');
//     const gstPercent = Number(item.gst_percent || 0);
//     const halfGst = gstPercent > 0 ? gstPercent / 2 : 0;

//     return COLS.map(c => {
//       switch (c.key) {
//         case 'sr':     return idx + 1;
//         case 'type':   return item.work_type || '—';
//         case 'scope':  return showScope ? scopeText : undefined;
//         case 'uom':    return item.uom || '—';
//         case 'qty':    return formatCurrency(qty);
//         case 'price':  return formatCurrency(price);
//         case 'base':   return showRowGST ? formatCurrency(base) : '';
//         case 'gstp':   return gstPercent ? gstPercent.toFixed(2) + '%' : '—';
//         case 'cgst':
//           return item.cgst_amount
//             ? `${formatCurrency(item.cgst_amount)}${halfGst ? ` (${halfGst}%)` : ''}`
//             : '—';
//         case 'sgst':
//           return item.sgst_amount
//             ? `${formatCurrency(item.sgst_amount)}${halfGst ? ` (${halfGst}%)` : ''}`
//             : '—';
//         case 'total':  return formatCurrency(item.total_price || base);
//         default:       return '';
//       }
//     }).filter(cell => cell !== undefined);
//   });

//   // Grand Total row
//   if (items.length > 0) {
//     const grandTotal = items.reduce((sum, i) => sum + Number(i.total_price || (i.qty * i.price || 0)), 0);
//     let totalBase = 0;
//     let totalCGST = 0;
//     let totalSGST = 0;

//     if (showRowGST) {
//       items.forEach(item => {
//         totalBase += Number(item.qty || 0) * Number(item.price || 0);
//         totalCGST += Number(item.cgst_amount || 0);
//         totalSGST += Number(item.sgst_amount || 0);
//       });
//     } else {
//       totalBase = grandTotal;
//     }

//     let mergeColspan = COLS.filter(c => ['sr','type','scope','uom','qty','price'].includes(c.key)).length;

//     const baseStyle = {
//       fillColor: [255, 245, 210],
//       fontStyle: 'bold',
//       textColor: [0, 0, 0],
//       lineColor: [0, 0, 0],
//       lineWidth: 0.5,
//     };

//     const totalRow = COLS.map((col, idx) => {
//       const key = col.key;
//       if (idx === 0) {
//         return {
//           content: 'Total:',
//           colSpan: mergeColspan,
//           styles: { ...baseStyle, halign: 'right' }
//         };
//       }
//       if (['type','scope','uom','qty','price'].includes(key)) return undefined;

//       if (key === 'base')   return { content: formatCurrency(totalBase),   styles: baseStyle };
//       if (key === 'gstp')   return { content: '—',                         styles: baseStyle };
//       if (key === 'cgst')   return { content: formatCurrency(totalCGST),   styles: baseStyle };
//       if (key === 'sgst')   return { content: formatCurrency(totalSGST),   styles: baseStyle };
//       if (key === 'total')  return { content: formatCurrency(grandTotal),  styles: baseStyle };
//       return { content: '', styles: baseStyle };
//     }).filter(Boolean);

//     tableBody.push(totalRow);
//   }

//   /* ---------- ITEMS TABLE ---------- */
//   doc.autoTable({
//     startY: y,
//     head: [headRow],
//     body: tableBody,
//     theme: 'grid',
//     tableWidth: contentWidth,
//     margin: { left: margin, right: margin, top: 140, bottom: 80 },
//     styles: {
//       fontSize: 8.8,
//       cellPadding: 4,
//       overflow: 'linebreak',
//       valign: 'top',
//       lineColor: [70, 70, 70],
//       lineWidth: 0.3,
//     },
//     headStyles: {
//       fillColor: [210, 230, 255],
//       textColor: [0, 0, 0],
//       halign: 'center',
//       fontStyle: 'bold',
//     },
//     columnStyles,
//     showHead: 'everyPage',
//     rowPageBreak: 'avoid',
//     didDrawPage: (data) => {
//       if (data.pageNumber > 1) {
//         drawCompanyHeader(false);
//       }
//       drawFooter();
//       doc.setFontSize(8);
//       doc.setTextColor(100);
//       doc.text(
//         `Page ${data.pageNumber}`,
//         pageWidth - margin - 30,
//         pageHeight - 30,
//         { align: 'right' }
//       );
//     },
//   });

//   y = doc.lastAutoTable.finalY + 6;

//   /* ---------- SUMMARY / TOTALS ---------- */
//   const taxable = items.reduce((s, i) => s + Number(i.total_price || i.qty * i.price), 0);

//   const summaryBody = [];

//   if (showGlobalGST) {
//     summaryBody.push([
//       { content: 'GST Details', colSpan: 2, styles: { halign: 'center', fillColor: [210, 230, 255], fontStyle: 'bold' } }
//     ]);
//     summaryBody.push(['Taxable Amount', formatCurrency(taxable)]);
//     if (Number(proformaInvoice.cgst_amount) > 0)
//       summaryBody.push(['CGST', formatCurrency(proformaInvoice.cgst_amount)]);
//     if (Number(proformaInvoice.sgst_amount) > 0)
//       summaryBody.push(['SGST', formatCurrency(proformaInvoice.sgst_amount)]);
//     if (Number(proformaInvoice.igst_amount) > 0)
//       summaryBody.push(['IGST', formatCurrency(proformaInvoice.igst_amount)]);
//   }

//   if (Number(proformaInvoice.discount) > 0) {
//     summaryBody.push(['Discount', formatCurrency(proformaInvoice.discount)]);
//   }

//   summaryBody.push(
//     ['Grand Total', formatCurrency(proformaInvoice.final_amount)],
//     ['Amount Paid', formatCurrency(proformaInvoice.paid_amount || 0)],
//     ['Balance Amount', formatCurrency(proformaInvoice.pending_amount)],
//     // ['Amount in Words: ' + (proformaInvoice.amount_in_words || '—') + ' Only', '']
//     ['Amount in Words: ' + numberToWordsIndian(proformaInvoice.final_amount) , '']
//   );

//   doc.autoTable({
//     startY: y,
//     body: summaryBody,
//     theme: 'grid',
//     tableWidth: contentWidth,
//     margin: { left: margin, right: margin },
//     styles: {
//       fontSize: 9.5,
//       cellPadding: 3.5,
//       lineColor: 0,
//       lineWidth: 0.4,
//     },
//     columnStyles: {
//       0: { cellWidth: contentWidth * 0.62, halign: 'right' },
//       1: { cellWidth: contentWidth * 0.38, halign: 'right', fontStyle: 'bold' },
//     },
//     didParseCell: (data) => {
//       if (data.section === 'body' && data.column.index === 0) {
//         const txt = data.cell.text.join(' ');
//         if (txt.includes('Balance Amount') || txt.includes('Amount in Words')) {
//           data.cell.styles.fillColor = [255, 240, 245];
//         }
//         if (txt.includes('Amount in Words')) {
//           data.cell.styles.halign = 'left';
//         }
//       }
//     },
//   });

//   y = doc.lastAutoTable.finalY + 6;

//   /* ---------- TERMS & CONDITIONS PAGE ---------- */
//   if (hasTermsPage) {
//     doc.addPage();
//     y = drawCompanyHeader(false);

//     doc.setFont('helvetica', 'normal');
//     doc.setFontSize(10);

//     const printBlock = (title, value) => {
//       if (!value?.trim()) return;
//       doc.setFont('helvetica', 'bold');
//       doc.setFontSize(12);
//       y += 10;
//       doc.text(title, margin, y);
//       y += 14;
//       doc.setFont('helvetica', 'normal');
//       doc.setFontSize(10);

//       const lines = value.split('\n').map(p => p.trim()).filter(Boolean);
//       lines.forEach(line => {
//         const wrapped = doc.splitTextToSize(line, contentWidth);
//         doc.text(wrapped, margin, y);
//         y += wrapped.length * 13;
//       });
//       y += 12;
//     };

//     printBlock('Notes', proformaInvoice.notes);
//     printBlock('Payment Terms', proformaInvoice.payment_terms);
//     printBlock('Terms & Conditions', proformaInvoice.terms_conditions);

//     drawFooter();
//   }

//   /* ---------- OUTPUT ---------- */
//   const fileName = `Proforma_${proformaInvoice.proforma_invoice_number}_${(customer.name || 'Customer').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

//   if (mode === 'save') doc.save(fileName);
//   else if (mode === 'blob') return doc.output('blob');
//   else if (mode === 'open') {
//     const dataUri = doc.output('datauristring');
//     const win = window.open();
//     win.document.write(`<iframe width="100%" height="100%" src="${dataUri}"></iframe>`);
//   }

//   return doc;
// };


















import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { getUserData } from '../../../util/session';
import { host } from '../../../util/constants';

/* ---------------- HELPERS ---------------- */
const formatCurrency = (value) => {
  const num = Number(value || 0);
  return num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// Indian Rupees number to words (with paise support)
const numberToWordsIndian = (num) => {
  if (!num || isNaN(num)) return '';

  const belowTwenty = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ];

  const tens = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
  ];

  const thousands = ['', 'Thousand', 'Lakh', 'Crore'];

  function convertLessThanThousand(n) {
    if (n === 0) return '';
    if (n < 20) return belowTwenty[n];
    if (n < 100) {
      return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + belowTwenty[n % 10] : '');
    }
    return (
      belowTwenty[Math.floor(n / 100)] + ' Hundred' +
      (n % 100 ? ' ' + convertLessThanThousand(n % 100) : '')
    );
  }

  const whole = Math.floor(num);
  const fraction = Math.round((num - whole) * 100);

  let words = '';
  let i = 0;

  let temp = whole;
  while (temp > 0) {
    const part = temp % 1000;
    if (part > 0) {
      let partWords = convertLessThanThousand(part);
      if (i > 0) partWords += ' ' + thousands[i];
      words = partWords + (words ? ' ' + words : '');
    }
    temp = Math.floor(temp / 1000);
    i++;
    if (i === 3) i = 1; // after thousand → lakh, then crore, etc.
  }

  if (!words) words = 'Zero';

  let result = words + ' Rupees';

  if (fraction > 0) {
    result += ' and ' + convertLessThanThousand(fraction) + ' Paise';
  }

  return result + ' Only';
};

// const formatScopePoints = (text = '') => {
//   if (!text) return '—';
//   const points = text
//     .split(/[\n•,|.]+/)
//     .map(t => t.trim())
//     .filter(Boolean);
//   if (!points.length) return '—';
//   return points.map(p => `• ${p}`).join('\n_____________________\n');
// };



const formatScopePoints = (text = '') => {
  if (!text?.trim()) return '—';

  // Split on newlines or existing bullets, clean each part
  const points = text
    .split(/[\n•]+/)
    .map(t => t.trim())
    .filter(Boolean);

  if (!points.length) return '—';

  // Join with newline + horizontal line after EACH point
  return points
    .map(point => point)
    .join('\n_____________________\n');
};


const hasRowLevelGST = (items) => {
  if (!items || items.length === 0) return false;
  return items.some(
    item =>
      Number(item.gst_percent || 0) > 0 ||
      Number(item.cgst_amount || 0) > 0 ||
      Number(item.sgst_amount || 0) > 0
  );
};

const hasGlobalGST = (data) => {
  return (
    Number(data.cgst_amount || 0) > 0 ||
    Number(data.sgst_amount || 0) > 0 ||
    Number(data.igst_amount || 0) > 0
  );
};

const hasScope = (items) => {
  if (!items || items.length === 0) return false;
  return items.some(item => item.work_sub_description && item.work_sub_description.trim());
};

/* ---------------- IMAGE LOADER ---------------- */
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

/* ---------------- MAIN ---------------- */
export const generateProformaInvoicePDF = async (
  proformaInvoice,
  lang = 'english',
  mode = 'save'
) => {
  const user = getUserData() || {};
  const company = user.company_info || {};
  const companyName = company.company_name || 'Company Name';
  const companyPhone = company.phone_no || '—';
  const companyEmail = company.email_id || '—';
  const companyAddress = company.land_mark || company.address || '—';
  const companyGST = company.gst_number || user.gst || '—';

  const customer = proformaInvoice.customer || {};
  const items = Array.isArray(proformaInvoice.details)
    ? [...proformaInvoice.details].sort((a, b) => (a.id || 0) - (b.id || 0))
    : [];

  const showRowGST = hasRowLevelGST(items);
  const showGlobalGST = hasGlobalGST(proformaInvoice);
  const showScope = hasScope(items);
  const hasTermsPage = !!(
    proformaInvoice.notes ||
    proformaInvoice.payment_terms ||
    proformaInvoice.terms_conditions
  );

  const logoUrl = company.logo ? `${host}/img/${company.logo}` : null;
  let logoDataUrl = null;
  if (logoUrl) {
    try {
      logoDataUrl = await loadImage(logoUrl);
    } catch (e) {
      console.warn('Logo failed to load:', e);
    }
  }

  /* ---------- DOCUMENT ---------- */
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  /* ---------- REUSABLE HEADER FUNCTION ---------- */
  const drawCompanyHeader = (includeBannerAndDetails = false) => {
    // Outer border
    doc.setLineWidth(1.1);
    doc.rect(
      margin - 10,
      margin - 10,
      pageWidth - (margin - 10) * 2,
      pageHeight - (margin - 10) * 2
    );

    let cy = margin + 16;

    // Company info - left
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(19);
    doc.setTextColor(20);
    doc.text(companyName, margin, cy);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(70);
    cy += 22;
    doc.text(companyAddress, margin, cy);
    cy += 14;
    doc.text(`Phone: ${companyPhone} | Email: ${companyEmail}`, margin, cy);

    // Logo - right
    const size = 68;
    const lx = pageWidth - margin - size;
    const ly = margin;
    doc.setFillColor(235, 240, 255);
    doc.rect(lx, ly, size, size, 'F');

    if (logoDataUrl) {
      try {
        doc.addImage(logoDataUrl, 'PNG', lx + 4, ly + 4, size - 8, size - 8);
      } catch (e) {
        console.warn("Failed to add logo", e);
      }
    }

    cy += 26;
    // Horizontal line
    doc.setLineWidth(0.8);
    doc.line(margin, cy, pageWidth - margin, cy);
    cy += 6;

    if (includeBannerAndDetails) {
      // Banner
      doc.setFillColor(200, 225, 255);
      doc.rect(margin, cy, contentWidth, 28, 'F');
      doc.rect(margin, cy, contentWidth, 28);
      doc.setFontSize(17);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(20);
      doc.text('Proforma Invoice', pageWidth / 2, cy + 19, { align: 'center' });
      cy += 34;

      // From / To / Details table
      doc.autoTable({
        startY: cy,
        head: [['FROM', 'TO', 'DETAILS']],
        body: [
          [
            `${companyName}\n${companyAddress}\nPhone: ${user.mobile || '—'}\nGSTIN: ${companyGST}\nEmail: ${companyEmail}`,
            `Customer: ${customer.name || '—'}\nSite: ${proformaInvoice.project?.project_name || '—'}\n${customer.address || '—'}\nPhone: ${customer.mobile || '—'}\nGSTIN: ${customer.gstin || '—'}`,
            `Proforma Invoice No: ${proformaInvoice.proforma_invoice_number || '—'}\n${
              proformaInvoice.tally_invoice_number ? `Tally Invoice No: ${proformaInvoice.tally_invoice_number}\n` : ''
            }Date: ${proformaInvoice.invoice_date || '—'}\n${
              proformaInvoice.delivery_date ? `Delivery Date: ${proformaInvoice.delivery_date}\n` : ''
            }Work Order: ${proformaInvoice.work_order?.invoice_number || '—'}`,
          ],
        ],
        margin: { left: margin, right: margin },
        theme: 'grid',
        tableWidth: contentWidth,
        styles: {
          fontSize: 9,
          cellPadding: 6,
          overflow: 'linebreak',
          lineColor: [0, 0, 0],
          lineWidth: 0.5,
        },
        headStyles: {
          fillColor: [210, 230, 255],
          textColor: [0, 0, 0],
          halign: 'left',
          fontStyle: 'bold',
        },
        columnStyles: {
          0: { cellWidth: contentWidth * 0.38 },
          1: { cellWidth: contentWidth * 0.38 },
          2: { cellWidth: contentWidth * 0.24 },
        },
      });

      cy = doc.lastAutoTable.finalY + 10;
    }

    return cy;
  };

  /* ---------- FOOTER FUNCTION ---------- */
  const drawFooter = () => {
    doc.setFontSize(9);
    doc.setTextColor(70);
    doc.text(
      'This proforma invoice is computer generated and authorized.',
      pageWidth / 2,
      pageHeight - 50,
      { align: 'center' }
    );

    doc.setFontSize(7.5);
    doc.setTextColor(0, 0, 0);
    doc.text(companyEmail, margin + 5, pageHeight - 18);
    doc.text(
      'www.deshmukhinfrasolutions.com',
      pageWidth - margin - 5,
      pageHeight - 18,
      { align: 'right' }
    );
  };

  /* ---------- PAGE 1 ---------- */
  y = drawCompanyHeader(true);

  /* ---------- ITEMS TABLE COLUMNS ---------- */
  let COLS;
  if (showRowGST) {
    if (showScope) {
      COLS = [
        { key: 'sr', title: 'Sr. No.', w: 5 },
        { key: 'type', title: 'Work Type', w: 18 },
        { key: 'scope', title: 'Scope', w: 22 },
        { key: 'uom', title: 'Unit', w: 6 },
        { key: 'qty', title: 'Quantity', w: 6 },
        { key: 'price', title: 'Price', w: 8 },
        { key: 'base', title: 'Base Amount', w: 8 },
        { key: 'gstp', title: 'GST %', w: 5 },
        { key: 'cgst', title: 'CGST', w: 7 },
        { key: 'sgst', title: 'SGST', w: 7 },
        { key: 'total', title: 'Total', w: 8 },
      ];
    } else {
      COLS = [
        { key: 'sr', title: 'Sr. No.', w: 5 },
        { key: 'type', title: 'Work Type', w: 40 },
        { key: 'uom', title: 'Unit', w: 6 },
        { key: 'qty', title: 'Quantity', w: 6 },
        { key: 'price', title: 'Price', w: 8 },
        { key: 'base', title: 'Base Amount', w: 8 },
        { key: 'gstp', title: 'GST %', w: 5 },
        { key: 'cgst', title: 'CGST', w: 7 },
        { key: 'sgst', title: 'SGST', w: 7 },
        { key: 'total', title: 'Total', w: 8 },
      ];
    }
  } else {
    if (showScope) {
      COLS = [
        { key: 'sr', title: 'Sr. No.', w: 6 },
        { key: 'type', title: 'Work Type', w: 22 },
        { key: 'scope', title: 'Scope', w: 28 },
        { key: 'uom', title: 'Unit', w: 7 },
        { key: 'qty', title: 'Quantity', w: 7 },
        { key: 'price', title: 'Price', w: 12 },
        { key: 'total', title: 'Total', w: 18 },
      ];
    } else {
      COLS = [
        { key: 'sr', title: 'Sr. No.', w: 6 },
        { key: 'type', title: 'Work Type', w: 50 },
        { key: 'uom', title: 'Unit', w: 7 },
        { key: 'qty', title: 'Quantity', w: 7 },
        { key: 'price', title: 'Price', w: 12 },
        { key: 'total', title: 'Total', w: 18 },
      ];
    }
  }

  const columnStyles = {};
  COLS.forEach((c, i) => {
    columnStyles[i] = {
      cellWidth: (contentWidth * c.w) / 100,
      halign:
        (c.key === 'scope' || c.key === 'type')
          ? 'left'
          : ['sr', 'uom', 'qty', 'gstp'].includes(c.key)
          ? 'center'
          : 'right',
      valign: 'top',
    };
  });

  const headRow = COLS.map(c => c.title);

  const tableBody = items.map((item, idx) => {
    const qty = Number(item.qty || 0);
    const price = Number(item.price || 0);
    const base = qty * price;
    const scopeText = formatScopePoints(item.work_sub_description || '');
    const gstPercent = Number(item.gst_percent || 0);
    const halfGst = gstPercent > 0 ? gstPercent / 2 : 0;

    return COLS.map(c => {
      switch (c.key) {
        case 'sr':     return idx + 1;
        case 'type':   return item.work_type || '—';
        case 'scope':  return showScope ? scopeText : undefined;
        case 'uom':    return item.uom || '—';
        case 'qty':    return formatCurrency(qty);
        case 'price':  return formatCurrency(price);
        case 'base':   return showRowGST ? formatCurrency(base) : '';
        case 'gstp':   return gstPercent ? gstPercent.toFixed(2) + '%' : '—';
        case 'cgst':
          return item.cgst_amount
            ? `${formatCurrency(item.cgst_amount)}${halfGst ? ` (${halfGst}%)` : ''}`
            : '—';
        case 'sgst':
          return item.sgst_amount
            ? `${formatCurrency(item.sgst_amount)}${halfGst ? ` (${halfGst}%)` : ''}`
            : '—';
        case 'total':  return formatCurrency(item.total_price || base);
        default:       return '';
      }
    }).filter(cell => cell !== undefined);
  });

  // Grand Total row for items table
  if (items.length > 0) {
    const grandTotal = items.reduce((sum, i) => sum + Number(i.total_price || (i.qty * i.price || 0)), 0);
    let totalBase = 0;
    let totalCGST = 0;
    let totalSGST = 0;

    if (showRowGST) {
      items.forEach(item => {
        totalBase += Number(item.qty || 0) * Number(item.price || 0);
        totalCGST += Number(item.cgst_amount || 0);
        totalSGST += Number(item.sgst_amount || 0);
      });
    } else {
      totalBase = grandTotal;
    }

    let mergeColspan = COLS.filter(c => ['sr','type','scope','uom','qty','price'].includes(c.key)).length;

    const baseStyle = {
      fillColor: [255, 245, 210],
      fontStyle: 'bold',
      textColor: [0, 0, 0],
      lineColor: [0, 0, 0],
      lineWidth: 0.5,
    };

    const totalRow = COLS.map((col, idx) => {
      const key = col.key;
      if (idx === 0) {
        return {
          content: 'Total:',
          colSpan: mergeColspan,
          styles: { ...baseStyle, halign: 'right' }
        };
      }
      if (['type','scope','uom','qty','price'].includes(key)) return undefined;

      if (key === 'base')   return { content: formatCurrency(totalBase),   styles: baseStyle };
      if (key === 'gstp')   return { content: '—',                         styles: baseStyle };
      if (key === 'cgst')   return { content: formatCurrency(totalCGST),   styles: baseStyle };
      if (key === 'sgst')   return { content: formatCurrency(totalSGST),   styles: baseStyle };
      if (key === 'total')  return { content: formatCurrency(grandTotal),  styles: baseStyle };
      return { content: '', styles: baseStyle };
    }).filter(Boolean);

    tableBody.push(totalRow);
  }

  /* ---------- ITEMS TABLE ---------- */
  doc.autoTable({
    startY: y,
    head: [headRow],
    body: tableBody,
    theme: 'grid',
    tableWidth: contentWidth,
    margin: { left: margin, right: margin, top: 140, bottom: 80 },
    styles: {
      fontSize: 8.8,
      cellPadding: 4,
      overflow: 'linebreak',
      valign: 'top',
      lineColor: [70, 70, 70],
      lineWidth: 0.3,
    },
    headStyles: {
      fillColor: [210, 230, 255],
      textColor: [0, 0, 0],
      halign: 'center',
      fontStyle: 'bold',
    },
    columnStyles,
    showHead: 'everyPage',
    rowPageBreak: 'avoid',
    didDrawPage: (data) => {
      if (data.pageNumber > 1) {
        drawCompanyHeader(false);
      }
      drawFooter();
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text(
        `Page ${data.pageNumber}`,
        pageWidth - margin - 30,
        pageHeight - 30,
        { align: 'right' }
      );
    },
  });

  y = doc.lastAutoTable.finalY + 12; // ← increased spacing a bit

 /* ────────── ADVANCE PAYMENTS SECTION ────────── */
const advances = proformaInvoice.advances || []; // array of advance objects

if (advances.length > 0) {
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Advance Payments Received', margin, y);
  y += 10;

  // Prepare body rows
  const advanceRows = advances.map(adv => [
    adv.payment_date || '—',
    formatCurrency(adv.advanced_amount || 0)
    // You can add more columns later, e.g.:
    // adv.payment_type || '—',
    // adv.remark || '—'
  ]);

  doc.autoTable({
    startY: y,
    head: [['Date', 'Amount']],
    body: advanceRows,
    theme: 'grid',
    tableWidth: contentWidth,
    margin: { left: margin, right: margin },
    styles: {
      fontSize: 9.5,
      cellPadding: 6,
      lineColor: [0, 0, 0],
      lineWidth: 0.4,
      valign: 'middle',
    },
    headStyles: {
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { cellWidth: contentWidth * 0.40, halign: 'center' },
      1: { cellWidth: contentWidth * 0.60, halign: 'right', fontStyle: 'bold' },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 1) {
        data.cell.styles.fontStyle = 'bold';
      }
    }
  });

  y = doc.lastAutoTable.finalY + 14; // space before summary
}

  /* ---------- SUMMARY / TOTALS ---------- */
  const taxable = items.reduce((s, i) => s + Number(i.total_price || i.qty * i.price), 0);

  const summaryBody = [];

  if (showGlobalGST) {
    summaryBody.push([
      { content: 'GST Details', colSpan: 2, styles: { halign: 'center', fillColor: [210, 230, 255], fontStyle: 'bold' } }
    ]);
    summaryBody.push(['Taxable Amount', formatCurrency(taxable)]);
    if (Number(proformaInvoice.cgst_amount) > 0)
      summaryBody.push(['CGST', formatCurrency(proformaInvoice.cgst_amount)]);
    if (Number(proformaInvoice.sgst_amount) > 0)
      summaryBody.push(['SGST', formatCurrency(proformaInvoice.sgst_amount)]);
    if (Number(proformaInvoice.igst_amount) > 0)
      summaryBody.push(['IGST', formatCurrency(proformaInvoice.igst_amount)]);
  }

  if (Number(proformaInvoice.discount) > 0) {
    summaryBody.push(['Discount', formatCurrency(proformaInvoice.discount)]);
  }

  summaryBody.push(
    ['Grand Total', formatCurrency(proformaInvoice.final_amount)],
    ['Amount Paid', formatCurrency(proformaInvoice.paid_amount || 0)],
    ['Balance Amount', formatCurrency(proformaInvoice.pending_amount)],
    ['Amount in Words: ' + numberToWordsIndian(proformaInvoice.final_amount) , '']
  );

  doc.autoTable({
    startY: y,
    body: summaryBody,
    theme: 'grid',
    tableWidth: contentWidth,
    margin: { left: margin, right: margin },
    styles: {
      fontSize: 9.5,
      cellPadding: 3.5,
      lineColor: 0,
      lineWidth: 0.4,
    },
    columnStyles: {
      0: { cellWidth: contentWidth * 0.62, halign: 'right' },
      1: { cellWidth: contentWidth * 0.38, halign: 'right', fontStyle: 'bold' },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 0) {
        const txt = data.cell.text.join(' ');
        if (txt.includes('Balance Amount') || txt.includes('Amount in Words')) {
          data.cell.styles.fillColor = [255, 240, 245];
        }
        if (txt.includes('Amount in Words')) {
          data.cell.styles.halign = 'left';
        }
      }
    },
  });

  y = doc.lastAutoTable.finalY + 6;

  /* ---------- TERMS & CONDITIONS PAGE ---------- */
  if (hasTermsPage) {
    doc.addPage();
    y = drawCompanyHeader(false);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    const printBlock = (title, value) => {
      if (!value?.trim()) return;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      y += 10;
      doc.text(title, margin, y);
      y += 14;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);

      const lines = value.split('\n').map(p => p.trim()).filter(Boolean);
      lines.forEach(line => {
        const wrapped = doc.splitTextToSize(line, contentWidth);
        doc.text(wrapped, margin, y);
        y += wrapped.length * 13;
      });
      y += 12;
    };

    printBlock('Notes', proformaInvoice.notes);
    printBlock('Payment Terms', proformaInvoice.payment_terms);
    printBlock('Terms & Conditions', proformaInvoice.terms_conditions);

    drawFooter();
  }

  /* ---------- OUTPUT ---------- */
  const fileName = `Proforma_${proformaInvoice.proforma_invoice_number}_${(customer.name || 'Customer').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

  if (mode === 'save') doc.save(fileName);
  else if (mode === 'blob') return doc.output('blob');
  else if (mode === 'open') {
    const dataUri = doc.output('datauristring');
    const win = window.open();
    win.document.write(`<iframe width="100%" height="100%" src="${dataUri}"></iframe>`);
  }

  return doc;
};
