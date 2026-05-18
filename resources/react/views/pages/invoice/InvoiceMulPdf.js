
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

// // const formatScopePoints = (text = '') => {
// //   if (!text) return '—';
// //   const points = text
// //     .split(/[\n•,|.]+/)
// //     .map(t => t.trim())
// //     .filter(Boolean);
// //   if (!points.length) return '—';
// //   return points
// //     .map((p) => `• ${p}`)
// //     .join('\n_______________________\n');
// // };

// const formatScopePoints = (text = '') => {
//   if (!text?.trim()) return '—';

//   // Split on newlines or existing bullets, clean each part
//   const points = text
//     .split(/[\n•]+/)
//     .map(t => t.trim())
//     .filter(Boolean);

//   if (!points.length) return '—';

//   // Join with newline + horizontal line after EACH point
//   return points
//     .map(point => point)
//     .join('\n________________________\n');
// };

// const hasRowLevelGST = (items) => {
//   if (!items || items.length === 0) return false;
//   return items.some(
//     (item) =>
//       Number(item.gst_percent || 0) > 0 ||
//       Number(item.cgst_amount || 0) > 0 ||
//       Number(item.sgst_amount || 0) > 0
//   );
// };

// const hasGlobalGST = (formData) => {
//   return (
//     Number(formData.cgst || 0) > 0 ||
//     Number(formData.sgst || 0) > 0 ||
//     Number(formData.igst || 0) > 0 ||
//     Number(formData.gst || 0) > 0
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
// export const generateMultiLanguagePDF = async (
//   finalAmount,
//   invoiceNumber,
//   customerName,
//   formData,
//   balanceAmount,
//   totalAmountWords,
//   lang = 'english',
//   mode = 'save',
  
// ) => {
//   const user = getUserData() || {};
//   const company = user.company_info || {};
//   const companyName = company.company_name || 'Company Name';
//   const companyPhone = company.phone_no || '—';
//   const companyEmail = company.email_id || '—';
//   const companyAddress = company.land_mark || company.address || '—';
//   const companyGST = company.gst_number || '—';
//   const companyDist = company.Dist || '—';
//   const companyTal = company.Tal || '—';

//   const customer = formData.customer || {};
//   const items = Array.isArray(formData.items)
//     ? [...formData.items].sort((a, b) => (a.id || 0) - (b.id || 0))
//     : [];

//   const showRowGST = hasRowLevelGST(items);
//   const showGlobalGST = hasGlobalGST(formData);
//   const showScope = hasScope(items);
//   const hasTermsPage = !!(
//     formData.note ||
//     formData.payment_terms ||
//     formData.terms_and_conditions
//   );

// const getDocumentTitle = () => {
//     const type = Number(formData.invoiceType);
    
//     switch (type) {
//       case 1:  return 'Quotation';
//       case 2:  return 'Work Order';
     
//       default: return 'Document';           // fallback
//     }
//   };

//   const documentTitle = getDocumentTitle();

// console.log(documentTitle);


//   const logoUrl = company.logo ? `${host}/img/${company.logo}` : null;
  
//   // Load logo once at the beginning
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
//         console.warn("Failed to add logo to PDF", e);
//       }
//     }

//     cy += 26;
//     // Horizontal line
//     doc.setLineWidth(0.8);
//     doc.setDrawColor(0, 0, 0);
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
//       doc.text(documentTitle, pageWidth / 2, cy + 19, { align: 'center' });
//       cy += 34;

//       // From / To / Details table
//       doc.autoTable({
//         startY: cy,
//         head: [['FROM', 'TO', 'DETAILS']],
//         body: [
//           [
//             `${companyName}\n${companyAddress}\nPhone: ${user.mobile || '—'}\nGSTIN: ${companyGST}\nDist: ${companyDist}\nTal: ${companyTal}\nEmail: ${companyEmail}`,
//             `Customer: ${customer.name || '—'}\nSite: ${formData.project_name || '—'}\n${customer.address || '—'}\nPhone: ${customer.mobile || '—'}\nGSTIN: ${formData.gst_number || '—'}\nPAN: ${formData.pan_number || '—'}`,
//             `Quotation No: ${invoiceNumber}\nDate: ${formData.date || '—'}\nReference: ${formData.ref_id || '—'}\nPO No: ${formData.po_number || '—'}`,
//           ],
//         ],
//         margin: { left: margin, right: margin },
//         theme: 'grid',
//         tableWidth: contentWidth,
//         styles: {
//           fontSize: 9,
//           cellPadding: 6,
//           overflow: 'linebreak',
//           textColor: [0, 0, 0],
//           lineColor: [0, 0, 0],
//           lineWidth: 0.5,
//         },
//         headStyles: {
//           fillColor: [210, 230, 255],
//           textColor: [0, 0, 0],
//           halign: 'left',
//           fontStyle: 'bold',
//           lineColor: [0, 0, 0],
//           lineWidth: 0.5,
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
//       'This quotation is computer generated and authorized.',
//       pageWidth / 2,
//       pageHeight - 50,
//       { align: 'center' }
//     );

//     doc.setFontSize(7.5);
//     doc.setTextColor(0, 0, 0);
//     doc.text(companyEmail, margin + 5, pageHeight - 18);
//     doc.setTextColor(0, 0, 0);
//     doc.text(
//       'www.deshmukhinfrasolutions.com',
//       pageWidth - margin - 5,
//       pageHeight - 18,
//       { align: 'right' }
//     );
//   };

//   /* ---------- PAGE 1 (full header with banner and details) ---------- */
//   y = drawCompanyHeader(true);

//   /* ---------- ITEMS TABLE CONFIG ---------- */
//   let COLS;
//   if (showRowGST) {
//     if (showScope) {
//       COLS = [
//         { key: 'sr', title: 'Sr', w: 5 },
//         { key: 'type', title: 'Work Type', w: 18 },
//         { key: 'scope', title: 'Scope', w: 22 },
//         { key: 'uom', title: 'Unit', w: 6 },
//         { key: 'qty', title: 'Qty', w: 6 },
//         { key: 'price', title: 'Rate', w: 8 },
//         { key: 'base', title: 'Base', w: 8 },
//         { key: 'gstp', title: 'GST%', w: 5 },
//         { key: 'cgst', title: 'CGST', w: 7 },
//         { key: 'sgst', title: 'SGST', w: 7 },
//         { key: 'total', title: 'Total', w: 8 },
//       ];
//     } else {
//       COLS = [
//         { key: 'sr', title: 'Sr', w: 5 },
//         { key: 'type', title: 'Work Type', w: 40 },
//         { key: 'uom', title: 'Unit', w: 6 },
//         { key: 'qty', title: 'Qty', w: 6 },
//         { key: 'price', title: 'Rate', w: 8 },
//         { key: 'base', title: 'Base', w: 8 },
//         { key: 'gstp', title: 'GST%', w: 5 },
//         { key: 'cgst', title: 'CGST', w: 7 },
//         { key: 'sgst', title: 'SGST', w: 7 },
//         { key: 'total', title: 'Total', w: 8 },
//       ];
//     }
//   } else {
//     if (showScope) {
//       COLS = [
//         { key: 'sr', title: 'Sr', w: 6 },
//         { key: 'type', title: 'Work Type', w: 22 },
//         { key: 'scope', title: 'Scope', w: 28 },
//         { key: 'uom', title: 'Unit', w: 7 },
//         { key: 'qty', title: 'Qty', w: 7 },
//         { key: 'price', title: 'Rate', w: 12 },
//         { key: 'total', title: 'Total', w: 18 },
//       ];
//     } else {
//       COLS = [
//         { key: 'sr', title: 'Sr', w: 6 },
//         { key: 'type', title: 'Work Type', w: 50 },
//         { key: 'uom', title: 'Unit', w: 7 },
//         { key: 'qty', title: 'Qty', w: 7 },
//         { key: 'price', title: 'Rate', w: 12 },
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
//     return COLS.map(c => {
//       switch (c.key) {
//         case 'sr': return idx + 1;
//         case 'type': return item.work_type || '—';
//         case 'scope': return showScope ? scopeText : undefined;
//         case 'uom': return item.uom || '—';
//         case 'qty': return formatCurrency(qty);
//         case 'price': return formatCurrency(price);
//         case 'base': return showRowGST ? formatCurrency(base) : '';
//         case 'gstp': return item.gst_percent ? item.gst_percent + '%' : '—';
//         case 'cgst': return item.cgst_amount ? formatCurrency(item.cgst_amount) : '—';
//         case 'sgst': return item.sgst_amount ? formatCurrency(item.sgst_amount) : '—';
//         case 'total': return formatCurrency(item.total_price || base);
//         default: return '';
//       }
//     }).filter(cell => cell !== undefined);
//   });

//   // Grand Total row
//   if (items.length > 0) {
//     const grandTotal = items.reduce((sum, item) => sum + Number(item.total_price || (item.qty * item.price || 0)), 0);
//     let totalBase = 0;
//     let totalCGST = 0;
//     let totalSGST = 0;

//     if (showRowGST) {
//       items.forEach(item => {
//         const qty = Number(item.qty || 0);
//         const price = Number(item.price || 0);
//         const base = qty * price;
//         totalBase += base;
//         totalCGST += Number(item.cgst_amount || 0);
//         totalSGST += Number(item.sgst_amount || 0);
//       });
//     } else {
//       totalBase = grandTotal;
//     }

//     let mergeColspan = 0;
//     COLS.forEach(col => {
//       if (['sr', 'type', 'scope', 'uom', 'qty', 'price'].includes(col.key)) {
//         mergeColspan++;
//       }
//     });

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
//           styles: { ...baseStyle, halign: 'right', valign: 'middle' }
//         };
//       }
//       if (['type', 'scope', 'uom', 'qty', 'price'].includes(key)) return undefined;

//       if (key === 'base') {
//         return { content: formatCurrency(totalBase), styles: { ...baseStyle, halign: 'right' } };
//       }
//       if (key === 'gstp') {
//         return { content: '-', styles: { ...baseStyle, halign: 'center' } };
//       }
//       if (key === 'cgst') {
//         if (showRowGST && totalCGST > 0) {
//           const firstRate = items[0]?.gst_percent || 0;
//           const allSame = items.every(i => Number(i.gst_percent || 0) === firstRate);
//           const half = allSame && firstRate > 0 ? firstRate / 2 : null;
//           let txt = formatCurrency(totalCGST);
//           if (half) txt += `\n(${half}%)`;
//           return { content: txt, styles: { ...baseStyle, halign: 'right', fontSize: 8.5, valign: 'middle' } };
//         }
//         return { content: '-', styles: { ...baseStyle, halign: 'right' } };
//       }
//       if (key === 'sgst') {
//         if (showRowGST && totalSGST > 0) {
//           const firstRate = items[0]?.gst_percent || 0;
//           const allSame = items.every(i => Number(i.gst_percent || 0) === firstRate);
//           const half = allSame && firstRate > 0 ? firstRate / 2 : null;
//           let txt = formatCurrency(totalSGST);
//           if (half) txt += `\n(${half}%)`;
//           return { content: txt, styles: { ...baseStyle, halign: 'right', fontSize: 8.5, valign: 'middle' } };
//         }
//         return { content: '-', styles: { ...baseStyle, halign: 'right' } };
//       }
//       if (key === 'total') {
//         return { content: formatCurrency(grandTotal), styles: { ...baseStyle, halign: 'right' } };
//       }
//       return { content: '', styles: baseStyle };
//     }).filter(Boolean);

//     tableBody.push(totalRow);
//   }

//   /* ---------- ITEMS TABLE with automatic header on new pages ---------- */
//   doc.autoTable({
//     startY: y,
//     head: [headRow],
//     body: tableBody,
//     theme: 'grid',
//     tableWidth: contentWidth,
//     margin: { 
//       left: margin, 
//       right: margin,
//       top: 140,  // Space for header on continuation pages
//       bottom: 80  // Space for footer
//     },
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
//       lineColor: [0, 0, 0],
//       lineWidth: 0.5,
//     },
//     columnStyles,
//     showHead: 'everyPage',  // Show table header on every page
//     rowPageBreak: 'avoid',  // Try to keep rows together
//     didDrawPage: (data) => {
//       // Draw company header on pages 2, 3, 4... (not page 1, it already has full header)
//       if (data.pageNumber > 1) {
//         const currentPage = doc.internal.getCurrentPageInfo().pageNumber;
//         doc.setPage(currentPage);
//         drawCompanyHeader(false); // Only company info, logo, and line (no banner/details)
//       }
      
//       // Draw footer on every page
//       drawFooter();
      
//       // Optional: Add page number
//       doc.setFontSize(8);
//       doc.setTextColor(100);
//       doc.text(
//         `Page ${data.pageNumber}`,
//         pageWidth - margin - 30,
//         pageHeight - 30,
//         { align: 'right' }
//       );
//     },
//     didParseCell: (data) => {
//       if (data.section === 'body' && COLS[data.column.index]?.key === 'scope') {
//         data.cell.styles.fontSize = 8;
//         data.cell.styles.cellPadding = 4;
//         data.cell.styles.valign = 'top';
//       }
//       if (data.row.index === tableBody.length - 1) {
//         data.cell.styles.fontStyle = 'bold';
//       }
//     },
//   });

//   y = doc.lastAutoTable.finalY + 6;

//   /* ---------- SUMMARY ---------- */
//   const summaryBody = [];
//   const taxable = items.reduce((s, i) => s + Number(i.total_price || i.qty * i.price), 0);

//   if (showGlobalGST) {
//     summaryBody.push([
//       {
//         content: 'GST Details',
//         colSpan: 2,
//         styles: { halign: 'center', fillColor: [210, 230, 255], fontStyle: 'bold' },
//       },
//     ]);
//     summaryBody.push(['Taxable Amount', formatCurrency(taxable)]);
//     if (formData.cgst > 0) summaryBody.push(['CGST', formatCurrency(formData.cgst)]);
//     if (formData.sgst > 0) summaryBody.push(['SGST', formatCurrency(formData.sgst)]);
//     if (formData.igst > 0) summaryBody.push(['IGST', formatCurrency(formData.igst)]);
//   }

//   if (formData.discount > 0) {
//     summaryBody.push(['Discount', formatCurrency(formData.discount)]);
//   }

//   summaryBody.push(
//     ['Grand Total', formatCurrency(finalAmount)],
//     ['Amount Received:', formatCurrency(formData.amountPaid || 0)],
//     ['Amount Due:', formatCurrency(balanceAmount)],
//     ['Amount in Words: ' + totalAmountWords + ' only', '']
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
//         const text = data.cell.text.join('\n');
//         if (text.startsWith('Amount Due:') || text.startsWith('Amount in Words:')) {
//           data.cell.styles.fillColor = [255, 240, 245];
//         }
//         if (text.startsWith('Amount in Words:')) {
//           data.cell.styles.halign = 'left';
//         }
//       }
//       if (data.section === 'body' && data.column.index === 1 && data.row.index === summaryBody.length - 1) {
//         data.cell.styles.fillColor = [255, 240, 245];
//       }
//     },
//   });

//   y = doc.lastAutoTable.finalY + 6;

//   /* ---------- TERMS PAGE (if needed) ---------- */
//   if (hasTermsPage) {
//     doc.addPage();
//     y = drawCompanyHeader(false); // Company header without banner

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
//       lines.forEach((line) => {
//         const wrapped = doc.splitTextToSize(line, contentWidth);
//         doc.text(wrapped, margin, y);
//         y += wrapped.length * 13;
//       });
//       y += 12;
//     };

//     printBlock('Notes', formData.note);
//     printBlock('Payment Terms', formData.payment_terms);
//     printBlock('Terms & Conditions', formData.terms_and_conditions);

//     drawFooter();
//   }

//   /* ---------- OUTPUT ---------- */
//   // const fileName = `Quotation_${invoiceNumber}_${(customerName || 'Customer').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

//   let fileName;

// if (formData.invoiceType == 2) {
//     // For Work Order
//     fileName = `Work_Order_${formData.po_number}_${(formData.customer.name || 'Customer')
//         .replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
// } else {
//     // For Quotation (or any other type)
//     fileName = `Quotation_${formData.invoice_number || 'INV'}_${(formData.customer.name || 'Customer')
//         .replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
// }

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

const formatScopePoints = (text = '') => {
  if (!text?.trim()) return '—';
  const points = text
    .split(/[\n•]+/)
    .map(t => t.trim())
    .filter(Boolean);
  if (!points.length) return '—';
  return points
    .map(point => point)
    .join('\n________________________\n');
};

const hasRowLevelGST = (items) => {
  if (!items || items.length === 0) return false;
  return items.some(
    (item) =>
      Number(item.gst_percent || 0) > 0 ||
      Number(item.cgst_amount || 0) > 0 ||
      Number(item.sgst_amount || 0) > 0
  );
};

const hasGlobalGST = (formData) => {
  return (
    Number(formData.cgst || 0) > 0 ||
    Number(formData.sgst || 0) > 0 ||
    Number(formData.igst || 0) > 0 ||
    Number(formData.gst || 0) > 0
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
export const generateMultiLanguagePDF = async (
  finalAmount,
  invoiceNumber,
  customerName,
  formData,
  balanceAmount,
  totalAmountWords,
  lang = 'english',
  mode = 'save',
) => {
  const user = getUserData() || {};
  const company = user.company_info || {};
  const companyName = company.company_name || 'Company Name';
  const companyPhone = company.phone_no || '—';
  const companyEmail = company.email_id || '—';
  const companyAddress = company.land_mark || company.address || '—';
  const companyGST = company.gst_number || '—';
  const companyDist = company.Dist || '—';
  const companyTal = company.Tal || '—';

  const customer = formData.customer || {};
  const items = Array.isArray(formData.items)
    ? [...formData.items].sort((a, b) => (a.id || 0) - (b.id || 0))
    : [];

  const showRowGST = hasRowLevelGST(items);
  const showGlobalGST = hasGlobalGST(formData);
  const showScope = hasScope(items);
  const hasTermsPage = !!(
    formData.note ||
    formData.payment_terms ||
    formData.terms_and_conditions
  );
  const isWorkOrder = Number(formData.invoiceType) === 2;

  const getDocumentTitle = () => {
    const type = Number(formData.invoiceType);
    switch (type) {
      case 1: return 'Quotation';
      case 2: return 'Work Order';
      default: return 'Document';
    }
  };

  const documentTitle = getDocumentTitle();
  console.log(documentTitle);

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
    doc.setLineWidth(1.1);
    doc.rect(
      margin - 10,
      margin - 10,
      pageWidth - (margin - 10) * 2,
      pageHeight - (margin - 10) * 2
    );

    let cy = margin + 16;

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

    const size = 68;
    const lx = pageWidth - margin - size;
    const ly = margin;
    doc.setFillColor(235, 240, 255);
    doc.rect(lx, ly, size, size, 'F');

    if (logoDataUrl) {
      try {
        doc.addImage(logoDataUrl, 'PNG', lx + 4, ly + 4, size - 8, size - 8);
      } catch (e) {
        console.warn('Failed to add logo to PDF', e);
      }
    }

    cy += 26;
    doc.setLineWidth(0.8);
    doc.setDrawColor(0, 0, 0);
    doc.line(margin, cy, pageWidth - margin, cy);
    cy += 6;

    if (includeBannerAndDetails) {
      doc.setFillColor(200, 225, 255);
      doc.rect(margin, cy, contentWidth, 28, 'F');
      doc.rect(margin, cy, contentWidth, 28);
      doc.setFontSize(17);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(20);
      doc.text(documentTitle, pageWidth / 2, cy + 19, { align: 'center' });
      cy += 34;

      doc.autoTable({
        startY: cy,
        head: [['FROM', 'TO', 'DETAILS']],
        body: [
          [
            `${companyName}\n${companyAddress}\nPhone: ${user.mobile || '—'}\nGSTIN: ${companyGST}\nDist: ${companyDist}\nTal: ${companyTal}\nEmail: ${companyEmail}`,
            `Customer: ${customer.name || '—'}\nSite: ${formData.project_name || '—'}\n${customer.address || '—'}\nPhone: ${customer.mobile || '—'}\nGSTIN: ${formData.gst_number || '—'}\nPAN: ${formData.pan_number || '—'}`,
            `Bill No: ${invoiceNumber}\nDate: ${formData.date || '—'}\nReference: ${formData.ref_id || '—'}\nPO No: ${formData.po_number || '—'}`,
          ],
        ],
        margin: { left: margin, right: margin },
        theme: 'grid',
        tableWidth: contentWidth,
        styles: {
          fontSize: 9,
          cellPadding: 6,
          overflow: 'linebreak',
          textColor: [0, 0, 0],
          lineColor: [0, 0, 0],
          lineWidth: 0.5,
        },
        headStyles: {
          fillColor: [210, 230, 255],
          textColor: [0, 0, 0],
          halign: 'left',
          fontStyle: 'bold',
          lineColor: [0, 0, 0],
          lineWidth: 0.5,
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
      'This quotation is computer generated and authorized.',
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

  /* ---------- SIGNATURE BLOCK DRAWING FUNCTION ---------- */
  const drawSignatureSection = (startY) => {
    // If not enough space (~140pt needed), add new page
    if (startY + 140 > pageHeight - 80) {
      doc.addPage();
      startY = drawCompanyHeader(false);
      drawFooter();
    }

    const sigY = startY + 30;
    const leftX = margin;
    const rightX = pageWidth / 2 + 10;
    const lineWidth = 130; // signature line length

    // ---- "Signature & Seal," labels ----
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text('Signature & Seal,', leftX, sigY);
    doc.text('Signature & Seal,', rightX, sigY);

    // ---- Blank space for actual stamp/signature (80pt gap) ----
    const signatureSpaceH = 80;
    const nameY = sigY + signatureSpaceH;

    // ---- Signature lines ----
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.6);
    doc.line(leftX, nameY, leftX + lineWidth, nameY);
    doc.line(rightX, nameY, rightX + lineWidth, nameY);

    // ---- Left — Customer name & designation ----
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(0, 0, 0);
    doc.text(`${customer.name || 'Customer Name'}.`, leftX, nameY + 14);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(40, 40, 40);
    // doc.text('(Managing Director),', leftX, nameY + 27);
    // doc.text(
    //   customer.company_name || customer.name || '—',
    //   leftX,
    //   nameY + 40
    // );

    // ---- Right — Our company name & designation ----
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(0, 0, 0);
    doc.text(companyName, rightX, nameY + 14);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(40, 40, 40);
    // doc.text('Designated Partner', rightX, nameY + 27);

    return nameY + 55; // return updated y
  };

  /* ---------- PAGE 1 ---------- */
  y = drawCompanyHeader(true);

  /* ---------- ITEMS TABLE CONFIG ---------- */
  let COLS;
  if (showRowGST) {
    if (showScope) {
      COLS = [
        { key: 'sr', title: 'Sr', w: 5 },
        { key: 'type', title: 'Work Type', w: 18 },
        { key: 'scope', title: 'Scope', w: 22 },
        { key: 'uom', title: 'Unit', w: 6 },
        { key: 'qty', title: 'Qty', w: 6 },
        { key: 'price', title: 'Rate', w: 8 },
        { key: 'base', title: 'Base', w: 8 },
        { key: 'gstp', title: 'GST%', w: 5 },
        { key: 'cgst', title: 'CGST', w: 7 },
        { key: 'sgst', title: 'SGST', w: 7 },
        { key: 'total', title: 'Total', w: 8 },
      ];
    } else {
      COLS = [
        { key: 'sr', title: 'Sr', w: 5 },
        { key: 'type', title: 'Work Type', w: 40 },
        { key: 'uom', title: 'Unit', w: 6 },
        { key: 'qty', title: 'Qty', w: 6 },
        { key: 'price', title: 'Rate', w: 8 },
        { key: 'base', title: 'Base', w: 8 },
        { key: 'gstp', title: 'GST%', w: 5 },
        { key: 'cgst', title: 'CGST', w: 7 },
        { key: 'sgst', title: 'SGST', w: 7 },
        { key: 'total', title: 'Total', w: 8 },
      ];
    }
  } else {
    if (showScope) {
      COLS = [
        { key: 'sr', title: 'Sr', w: 6 },
        { key: 'type', title: 'Work Type', w: 22 },
        { key: 'scope', title: 'Scope', w: 28 },
        { key: 'uom', title: 'Unit', w: 7 },
        { key: 'qty', title: 'Qty', w: 7 },
        { key: 'price', title: 'Rate', w: 12 },
        { key: 'total', title: 'Total', w: 18 },
      ];
    } else {
      COLS = [
        { key: 'sr', title: 'Sr', w: 6 },
        { key: 'type', title: 'Work Type', w: 50 },
        { key: 'uom', title: 'Unit', w: 7 },
        { key: 'qty', title: 'Qty', w: 7 },
        { key: 'price', title: 'Rate', w: 12 },
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
    return COLS.map(c => {
      switch (c.key) {
        case 'sr': return idx + 1;
        case 'type': return item.work_type || '—';
        case 'scope': return showScope ? scopeText : undefined;
        case 'uom': return item.uom || '—';
        case 'qty': return formatCurrency(qty);
        case 'price': return formatCurrency(price);
        case 'base': return showRowGST ? formatCurrency(base) : '';
        case 'gstp': return item.gst_percent ? item.gst_percent + '%' : '—';
        case 'cgst': return item.cgst_amount ? formatCurrency(item.cgst_amount) : '—';
        case 'sgst': return item.sgst_amount ? formatCurrency(item.sgst_amount) : '—';
        case 'total': return formatCurrency(item.total_price || base);
        default: return '';
      }
    }).filter(cell => cell !== undefined);
  });

  if (items.length > 0) {
    const grandTotal = items.reduce((sum, item) => sum + Number(item.total_price || (item.qty * item.price || 0)), 0);
    let totalBase = 0;
    let totalCGST = 0;
    let totalSGST = 0;

    if (showRowGST) {
      items.forEach(item => {
        const qty = Number(item.qty || 0);
        const price = Number(item.price || 0);
        const base = qty * price;
        totalBase += base;
        totalCGST += Number(item.cgst_amount || 0);
        totalSGST += Number(item.sgst_amount || 0);
      });
    } else {
      totalBase = grandTotal;
    }

    let mergeColspan = 0;
    COLS.forEach(col => {
      if (['sr', 'type', 'scope', 'uom', 'qty', 'price'].includes(col.key)) {
        mergeColspan++;
      }
    });

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
          styles: { ...baseStyle, halign: 'right', valign: 'middle' }
        };
      }
      if (['type', 'scope', 'uom', 'qty', 'price'].includes(key)) return undefined;
      if (key === 'base') {
        return { content: formatCurrency(totalBase), styles: { ...baseStyle, halign: 'right' } };
      }
      if (key === 'gstp') {
        return { content: '-', styles: { ...baseStyle, halign: 'center' } };
      }
      if (key === 'cgst') {
        if (showRowGST && totalCGST > 0) {
          const firstRate = items[0]?.gst_percent || 0;
          const allSame = items.every(i => Number(i.gst_percent || 0) === firstRate);
          const half = allSame && firstRate > 0 ? firstRate / 2 : null;
          let txt = formatCurrency(totalCGST);
          if (half) txt += `\n(${half}%)`;
          return { content: txt, styles: { ...baseStyle, halign: 'right', fontSize: 8.5, valign: 'middle' } };
        }
        return { content: '-', styles: { ...baseStyle, halign: 'right' } };
      }
      if (key === 'sgst') {
        if (showRowGST && totalSGST > 0) {
          const firstRate = items[0]?.gst_percent || 0;
          const allSame = items.every(i => Number(i.gst_percent || 0) === firstRate);
          const half = allSame && firstRate > 0 ? firstRate / 2 : null;
          let txt = formatCurrency(totalSGST);
          if (half) txt += `\n(${half}%)`;
          return { content: txt, styles: { ...baseStyle, halign: 'right', fontSize: 8.5, valign: 'middle' } };
        }
        return { content: '-', styles: { ...baseStyle, halign: 'right' } };
      }
      if (key === 'total') {
        return { content: formatCurrency(grandTotal), styles: { ...baseStyle, halign: 'right' } };
      }
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
    margin: {
      left: margin,
      right: margin,
      top: 140,
      bottom: 80,
    },
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
      lineColor: [0, 0, 0],
      lineWidth: 0.5,
    },
    columnStyles,
    showHead: 'everyPage',
    rowPageBreak: 'avoid',
    didDrawPage: (data) => {
      if (data.pageNumber > 1) {
        const currentPage = doc.internal.getCurrentPageInfo().pageNumber;
        doc.setPage(currentPage);
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
    didParseCell: (data) => {
      if (data.section === 'body' && COLS[data.column.index]?.key === 'scope') {
        data.cell.styles.fontSize = 8;
        data.cell.styles.cellPadding = 4;
        data.cell.styles.valign = 'top';
      }
      if (data.row.index === tableBody.length - 1) {
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });

  y = doc.lastAutoTable.finalY + 6;

  /* ---------- SUMMARY ---------- */
  const summaryBody = [];
  const taxable = items.reduce((s, i) => s + Number(i.total_price || i.qty * i.price), 0);

  if (showGlobalGST) {
    summaryBody.push([
      {
        content: 'GST Details',
        colSpan: 2,
        styles: { halign: 'center', fillColor: [210, 230, 255], fontStyle: 'bold' },
      },
    ]);
    summaryBody.push(['Taxable Amount', formatCurrency(taxable)]);
    if (formData.cgst > 0) summaryBody.push(['CGST', formatCurrency(formData.cgst)]);
    if (formData.sgst > 0) summaryBody.push(['SGST', formatCurrency(formData.sgst)]);
    if (formData.igst > 0) summaryBody.push(['IGST', formatCurrency(formData.igst)]);
  }

  if (formData.discount > 0) {
    summaryBody.push(['Discount', formatCurrency(formData.discount)]);
  }

  summaryBody.push(
    ['Grand Total', formatCurrency(finalAmount)],
    ['Amount Received:', formatCurrency(formData.amountPaid || 0)],
    ['Amount Due:', formatCurrency(balanceAmount)],
    ['Amount in Words: ' + totalAmountWords + ' only', '']
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
        const text = data.cell.text.join('\n');
        if (text.startsWith('Amount Due:') || text.startsWith('Amount in Words:')) {
          data.cell.styles.fillColor = [255, 240, 245];
        }
        if (text.startsWith('Amount in Words:')) {
          data.cell.styles.halign = 'left';
        }
      }
      if (data.section === 'body' && data.column.index === 1 && data.row.index === summaryBody.length - 1) {
        data.cell.styles.fillColor = [255, 240, 245];
      }
    },
  });

  y = doc.lastAutoTable.finalY + 6;

  /* ---------- TERMS PAGE (if needed) ---------- */
  // if (hasTermsPage) {
  //   doc.addPage();
  //   y = drawCompanyHeader(false);

  //   doc.setFont('helvetica', 'normal');
  //   doc.setFontSize(10);

  //   const printBlock = (title, value) => {
  //     if (!value?.trim()) return;
  //     doc.setFont('helvetica', 'bold');
  //     doc.setFontSize(12);
  //     y += 10;
  //     doc.text(title, margin, y);
  //     y += 14;
  //     doc.setFont('helvetica', 'normal');
  //     doc.setFontSize(10);
  //     const lines = value.split('\n').map(p => p.trim()).filter(Boolean);
  //     lines.forEach((line) => {
  //       const wrapped = doc.splitTextToSize(line, contentWidth);
  //       doc.text(wrapped, margin, y);
  //       y += wrapped.length * 13;
  //     });
  //     y += 12;
  //   };

  //   printBlock('Notes', formData.note);
  //   printBlock('Payment Terms', formData.payment_terms);
  //   printBlock('Terms & Conditions', formData.terms_and_conditions);

  //   drawFooter();

  //   // ---- Signature section at bottom of terms page (Work Order only) ----
  //   if (isWorkOrder) {
  //     y = drawSignatureSection(y);
  //   }

  // } else if (isWorkOrder) {
  //   // No terms page — draw signature section after summary
  //   y = drawSignatureSection(y);
  // }



  /* ---------- TERMS PAGE (if needed) ---------- */
  if (hasTermsPage) {
    doc.addPage();
    y = drawCompanyHeader(false) + 3;
 
    // Bottom safe boundary — leave 80pt for footer
    const bottomSafeY = pageHeight - 80;
 
    const printBlock = (title, value) => {
      if (!value?.trim()) return;
 
      // --- Title ---
      // Check if title + at least one line of content fits; if not, new page
      if (y + 10 + 16 + 13 > bottomSafeY) {
        doc.addPage();
        y = drawCompanyHeader(false) + 3;
        drawFooter();
      }
 
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      y += 10;
      doc.text(title, margin, y);
      y += 16;
 
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
 
      const lines = value.split('\n').map(p => p.trim()).filter(Boolean);
      lines.forEach((line) => {
        const wrapped = doc.splitTextToSize(line, contentWidth);
        wrapped.forEach((wline) => {
          // If this line would go past the safe boundary, start a new page
          if (y + 13 > bottomSafeY) {
            doc.addPage();
            y = drawCompanyHeader(false) + 3;
            drawFooter();
            // Re-apply font after page break
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
          }
          doc.text(wline, margin, y);
          y += 13;
        });
      });
      y += 12;
    };
 
    printBlock('Notes', formData.note);
    printBlock('Payment Terms', formData.payment_terms);
    printBlock('Terms & Conditions', formData.terms_and_conditions);
 
    drawFooter();
 
    // ---- Signature section at bottom of terms page (Work Order only) ----
    if (isWorkOrder) {
      y = drawSignatureSection(y);
    }
 
  } else if (isWorkOrder) {
    // No terms page — draw signature section after summary
    y = drawSignatureSection(y);
  }
 


  /* ---------- OUTPUT ---------- */
  let fileName;
  if (formData.invoiceType == 2) {
    fileName = `Work_Order_${formData.po_number}_${(formData.customer.name || 'Customer').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  } else {
    fileName = `Quotation_${formData.invoice_number || 'INV'}_${(formData.customer.name || 'Customer').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  }

  if (mode === 'save') doc.save(fileName);
  else if (mode === 'blob') return doc.output('blob');
  else if (mode === 'open') {
    const dataUri = doc.output('datauristring');
    const win = window.open();
    win.document.write(`<iframe width="100%" height="100%" src="${dataUri}"></iframe>`);
  }

  return doc;
};