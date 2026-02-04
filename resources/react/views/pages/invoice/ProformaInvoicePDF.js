// import html2pdf from 'html2pdf.js'
// import { getUserData } from '../../../util/session'

// const LANGUAGES = {
//   english: {
//     name: 'English',
//     labels: {
//       proformaInvoice: 'Proforma Invoice',
//       invoiceNo: 'Invoice No:',
//       tallyInvoiceNo: 'Tally Invoice No:',
//       invoiceDate: 'Invoice Date:',
//       deliveryDate: 'Delivery Date:',
//       workOrder: 'Work Order:',
//       project: 'Project:',
//       customer: 'Customer:',
//       location: 'Location:',
//       mobile: 'Mobile:',
//       workDetails: 'Work Details',
//       srNo: 'Sr. No.',
//       workType: 'Work Type',
//       unit: 'Unit',
//       quantity: 'Quantity',
//       price: 'Price',
//       baseAmount: 'Base Amount',
//       gstPercent: 'GST %',
//       cgst: 'CGST',
//       sgst: 'SGST',
//       igst: 'IGST',
//       total: 'Total',
//       subtotal: 'Subtotal:',
//       discount: 'Discount:',
//       taxableAmount: 'Taxable Amount:',
//       gstDetails: 'GST Details',
//       totalGst: 'Total GST:',
//       finalAmount: 'Final Amount:',
//       grandTotal: 'Grand Total:',
//       paidAmount: 'Amount Paid:',
//       balanceAmount: 'Balance Amount:',
//       amountInWords: 'Amount in Words:',
//       only: 'Only',
//       paymentTerms: 'Payment Terms',
//       termsConditions: 'Terms & Conditions',
//       notes: 'Notes',
//       authorizedSignature: 'Authorized Signature',
//       footer: 'This invoice has been computer-generated and is authorized.',
//     },
//   },
//   marathi: {
//     name: 'मराठी',
//     labels: {
//       proformaInvoice: 'प्रोफॉर्मा इनव्हॉईस',
//       invoiceNo: 'इनव्हॉईस क्रमांक:',
//       tallyInvoiceNo: 'टॅली इनव्हॉईस क्रमांक:',
//       invoiceDate: 'इनव्हॉईस तारीख:',
//       deliveryDate: 'डिलिव्हरी तारीख:',
//       workOrder: 'वर्क ऑर्डर:',
//       project: 'प्रकल्प:',
//       customer: 'ग्राहक:',
//       location: 'स्थान:',
//       mobile: 'मोबाईल:',
//       workDetails: 'कामाचे तपशील',
//       srNo: 'अ.क्र.',
//       workType: 'काम प्रकार',
//       unit: 'युनिट',
//       quantity: 'प्रमाण',
//       price: 'किंमत',
//       baseAmount: 'मूळ रक्कम',
//       gstPercent: 'जीएसटी %',
//       cgst: 'सीजीएसटी',
//       sgst: 'एसजीएसटी',
//       igst: 'आयजीएसटी',
//       total: 'एकूण',
//       subtotal: 'उपएकूण:',
//       discount: 'सूट:',
//       taxableAmount: 'करपात्र रक्कम:',
//       gstDetails: 'जीएसटी तपशील',
//       totalGst: 'एकूण जीएसटी:',
//       finalAmount: 'अंतिम रक्कम:',
//       grandTotal: 'एकूण रक्कम:',
//       paidAmount: 'भरलेली रक्कम:',
//       balanceAmount: 'शिल्लक रक्कम:',
//       amountInWords: 'रकमा शब्दांत:',
//       only: 'फक्त',
//       paymentTerms: 'पेमेंट अटी',
//       termsConditions: 'अटी व शर्ती',
//       notes: 'टिपा',
//       authorizedSignature: 'अधिकृत स्वाक्षरी',
//       footer: 'हे संगणकाद्वारे तयार केलेले इनव्हॉईस अधिकृत आहे.',
//     },
//   },
// }

// const numberToWords = (number) => {
//   if (number === 0) return 'Zero'

//   const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
//   const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
//   const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

//   const convertHundreds = (num) => {
//     let result = ''
//     if (num >= 100) {
//       result += units[Math.floor(num / 100)] + ' Hundred '
//       num %= 100
//     }
//     if (num >= 20) {
//       result += tens[Math.floor(num / 10)]
//       if (num % 10 > 0) result += ' ' + units[num % 10]
//     } else if (num >= 10) {
//       result += teens[num - 10]
//     } else if (num > 0) {
//       result += units[num]
//     }
//     return result.trim()
//   }

//   let words = ''
//   let num = Math.floor(number)
//   if (num >= 10000000) {
//     const crores = Math.floor(num / 10000000)
//     words += convertHundreds(crores) + ' Crore '
//     num %= 10000000
//   }
//   if (num >= 100000) {
//     const lakhs = Math.floor(num / 100000)
//     words += convertHundreds(lakhs) + ' Lakh '
//     num %= 100000
//   }
//   if (num >= 1000) {
//     const thousands = Math.floor(num / 1000)
//     words += convertHundreds(thousands) + ' Thousand '
//     num %= 1000
//   }
//   if (num > 0) {
//     words += convertHundreds(num)
//   }
//   return words.trim() + ' Rupees Only'
// }

// export const generateProformaInvoicePDF = async (
//   proformaInvoice,
//   lang = 'english',
//   mode = 'save'
// ) => {
//   const labels = LANGUAGES[lang].labels
//   const user = getUserData()

//   // Sort details by id ascending (like InvoiceDetails)
//   const sortedDetails = (proformaInvoice.details || []).sort((a, b) => a.id - b.id)

//   // Check if row-level GST exists
//   const hasRowGST = sortedDetails.some(item =>
//     (parseFloat(item.gst_percent) || 0) > 0 ||
//     (parseFloat(item.cgst_amount) || 0) > 0 ||
//     (parseFloat(item.sgst_amount) || 0) > 0
//   )

//   // Check if global GST exists
//   const hasGlobalGST = 
//     (parseFloat(proformaInvoice.cgst_amount) || 0) > 0 ||
//     (parseFloat(proformaInvoice.sgst_amount) || 0) > 0 ||
//     (parseFloat(proformaInvoice.igst_amount) || 0) > 0

//   // Calculate total after row-level GST
//   const totalAfterRowGST = sortedDetails.reduce((sum, item) => {
//     return sum + (parseFloat(item.total_price) || 0)
//   }, 0)

//   const totalAmountWords = numberToWords(parseFloat(proformaInvoice.pending_amount) || 0)

//   const htmlContent = `
// <!DOCTYPE html>
// <html>
// <head>
//   <meta charset="UTF-8">
//   <style>
//     @page { size: A4; margin: 0; }
//     * { margin: 0; padding: 0; box-sizing: border-box; }
//     body { font-family: Arial, sans-serif; font-size: 11px; }
//     .invoice-box { 
//       padding: 20px; 
//       border: 3px solid #000; 
//       page-break-after: always;
//     }
//     table { width: 100%; border-collapse: collapse; }
//     .border-table { border: 1px solid #000; }
//     .border-table th, .border-table td { 
//       border: 1px solid #000; 
//       padding: 4px; 
//       font-size: 10px;
//     }
//     .border-table th { background: #d9e9ff; font-weight: bold; }
//     .text-center { text-align: center; }
//     .text-right { text-align: right; }
//     .text-left { text-align: left; }
//     .header-title {
//       background: #cfe2ff;
//       text-align: center;
//       font-weight: bold;
//       font-size: 16px;
//       padding: 5px;
//       border: 1px solid #000;
//       margin: 5px 0;
//     }
//     .section-title {
//       font-size: 12px;
//       font-weight: bold;
//       color: #0066cc;
//       border-bottom: 2px solid #0066cc;
//       padding-bottom: 3px;
//       margin: 8px 0 5px 0;
//     }
//     .terms-content {
//       white-space: pre-line;
//       line-height: 1.4;
//       padding: 5px;
//     }
//     .footer-bar {
//       display: flex;
//       justify-content: space-between;
//       padding: 8px 20px;
//       font-size: 10px;
//       margin-top: 10px;
//     }
//   </style>
// </head>
// <body>
//   <div class="invoice-box">
//     <!-- Company Header -->
//     <table style="margin-bottom: 5px;">
//       <tr>
//         <td style="width: 70%;">
//           <div style="font-size: 20px; font-weight: bold;">${user?.company_info?.company_name || 'Company Name'}</div>
//           <div style="font-size: 10px; margin-top: 2px;">${user?.company_info?.land_mark || '-'}</div>
//           <div style="font-size: 10px;"><b>Phone:</b> ${user?.company_info?.phone_no || '-'}</div>
//         </td>
//         <td style="width: 30%; text-align: right;">
//           ${user?.company_info?.logo ? `<img src="/img/${user.company_info.logo}" style="width: 70px; height: 70px; object-fit: contain; border: 1px solid #ccc; border-radius: 5px;" />` : ''}
//         </td>
//       </tr>
//     </table>

//     <hr style="border: 1px solid #000; margin: 3px 0;" />

//     <!-- Title -->
//     <div class="header-title">${labels.proformaInvoice}</div>

//     <!-- From/To/Details -->
//     <table class="border-table" style="margin: 5px 0;">
//       <tr>
//         <th>FROM:</th>
//         <th>TO:</th>
//         <th>DETAILS:</th>
//       </tr>
//       <tr>
//         <td style="line-height: 1.3;">
//           <b>${user?.company_info?.company_name || 'Company Name'}</b><br/>
//           ${user?.name || ''}<br/>
//           ${user?.company_info?.land_mark || '-'}<br/>
//           <b>Phone:</b> ${user?.company_info?.phone_no || 'N/A'}<br/>
//           <b>Email:</b> ${user?.company_info?.email_id || 'N/A'}<br/>
//           <b>GSTIN:</b> ${user?.gst || 'N/A'}
//         </td>
//         <td style="line-height: 1.3;">
//           <b>${proformaInvoice.customer?.name || 'N/A'}</b><br/>
//           <b>Site:</b> ${proformaInvoice.project?.project_name || 'N/A'}<br/>
//           ${proformaInvoice.customer?.address || 'N/A'}<br/>
//           <b>Phone:</b> ${proformaInvoice.customer?.mobile || 'N/A'}<br/>
//           <b>GSTIN:</b> ${proformaInvoice.customer?.gstin || '-'}
//         </td>
//         <td style="line-height: 1.3;">
//           <b>Invoice No:</b> ${proformaInvoice.proforma_invoice_number}<br/>
//           ${proformaInvoice.tally_invoice_number ? `<b>Tally Invoice:</b> ${proformaInvoice.tally_invoice_number}<br/>` : ''}
//           <b>Date:</b> ${new Date(proformaInvoice.invoice_date).toLocaleDateString()}<br/>
//           ${proformaInvoice.delivery_date ? `<b>Delivery:</b> ${new Date(proformaInvoice.delivery_date).toLocaleDateString()}<br/>` : ''}
//           <b>Work Order:</b> ${proformaInvoice.work_order?.invoice_number || 'N/A'}
//         </td>
//       </tr>
//     </table>

//     <!-- Work Details Table -->
//     <table class="border-table" style="margin-top: 5px;">
//       <thead>
//         <tr>
//           <th style="width: 5%;">${labels.srNo}</th>
//           <th style="width: ${hasRowGST ? '25%' : '35%'};">${labels.workType}</th>
//           <th style="width: 8%;">${labels.unit}</th>
//           <th style="width: 8%;">${labels.quantity}</th>
//           <th style="width: ${hasRowGST ? '10%' : '16%'};">${labels.price}</th>
//           ${hasRowGST ? `
//           <th style="width: 10%;">${labels.baseAmount}</th>
//           <th style="width: 7%;">${labels.gstPercent}</th>
//           <th style="width: 10%;">${labels.cgst}</th>
//           <th style="width: 10%;">${labels.sgst}</th>
//           ` : ''}
//           <th style="width: ${hasRowGST ? '12%' : '16%'};">${labels.total}</th>
//         </tr>
//       </thead>
//       <tbody>
//         ${sortedDetails.map((item, index) => {
//           const qty = parseFloat(item.qty) || 0
//           const price = parseFloat(item.price) || 0
//           const baseAmount = qty * price
//           const gstPercent = parseFloat(item.gst_percent) || 0
//           const cgstAmount = parseFloat(item.cgst_amount) || 0
//           const sgstAmount = parseFloat(item.sgst_amount) || 0
//           const totalPrice = parseFloat(item.total_price) || 0
//           const cgstPercent = gstPercent ? gstPercent / 2 : 0
//           const sgstPercent = gstPercent ? gstPercent / 2 : 0

//           return `
//             <tr>
//               <td class="text-center">${index + 1}</td>
//               <td>${item.work_type || '-'}</td>
//               <td class="text-center">${item.uom || '-'}</td>
//               <td class="text-center">${qty.toFixed(2)}</td>
//               <td class="text-right">₹${price.toFixed(2)}</td>
//               ${hasRowGST ? `
//               <td class="text-right">₹${baseAmount.toFixed(2)}</td>
//               <td class="text-center">${gstPercent > 0 ? gstPercent.toFixed(2) + '%' : '-'}</td>
//               <td class="text-right">${cgstAmount > 0 ? '₹' + cgstAmount.toFixed(2) + ' (' + cgstPercent + '%)' : '-'}</td>
//               <td class="text-right">${sgstAmount > 0 ? '₹' + sgstAmount.toFixed(2) + ' (' + sgstPercent + '%)' : '-'}</td>
//               ` : ''}
//               <td class="text-right">₹${totalPrice.toFixed(2)}</td>
//             </tr>
//           `
//         }).join('')}
//         ${sortedDetails.length > 0 ? `
//         <tr style="background: #fff3cd; font-weight: bold;">
//           <td colspan="${hasRowGST ? '5' : '4'}" class="text-right">Total:</td>
//           ${hasRowGST ? `<td class="text-right">₹${sortedDetails.reduce((sum, item) => sum + ((parseFloat(item.qty) || 0) * (parseFloat(item.price) || 0)), 0).toFixed(2)}</td>` : ''}
//           ${hasRowGST ? `<td class="text-center">-</td>` : ''}
//           ${hasRowGST ? `<td class="text-right">₹${sortedDetails.reduce((sum, item) => sum + (parseFloat(item.cgst_amount) || 0), 0).toFixed(2)}</td>` : ''}
//           ${hasRowGST ? `<td class="text-right">₹${sortedDetails.reduce((sum, item) => sum + (parseFloat(item.sgst_amount) || 0), 0).toFixed(2)}</td>` : ''}
//           <td class="text-right">₹${totalAfterRowGST.toFixed(2)}</td>
//         </tr>
//         ` : ''}
//       </tbody>
//     </table>

//     ${hasGlobalGST ? `
//     <!-- GST Details Section -->
//     <div class="section-title">${labels.gstDetails}</div>
//     <table class="border-table">
//       <tr>
//         <th class="text-left">${labels.taxableAmount}</th>
//         <td class="text-center">₹${totalAfterRowGST.toFixed(2)}</td>
//       </tr>
//       ${parseFloat(proformaInvoice.cgst_amount) > 0 ? `
//       <tr>
//         <th class="text-left">${labels.cgst} (${proformaInvoice.cgst_percentage_calculated || 0}%)</th>
//         <td class="text-center">₹${parseFloat(proformaInvoice.cgst_amount).toFixed(2)}</td>
//       </tr>` : ''}
//       ${parseFloat(proformaInvoice.sgst_amount) > 0 ? `
//       <tr>
//         <th class="text-left">${labels.sgst} (${proformaInvoice.sgst_percentage_calculated || 0}%)</th>
//         <td class="text-center">₹${parseFloat(proformaInvoice.sgst_amount).toFixed(2)}</td>
//       </tr>` : ''}
//       ${parseFloat(proformaInvoice.igst_amount) > 0 ? `
//       <tr>
//         <th class="text-left">${labels.igst} (${proformaInvoice.igst_percentage_calculated || 0}%)</th>
//         <td class="text-center">₹${parseFloat(proformaInvoice.igst_amount).toFixed(2)}</td>
//       </tr>` : ''}
//       <tr style="background: #d4edda;">
//         <th class="text-left">${labels.totalGst}</th>
//         <td class="text-center"><b>₹${(parseFloat(proformaInvoice.cgst_amount || 0) + parseFloat(proformaInvoice.sgst_amount || 0) + parseFloat(proformaInvoice.igst_amount || 0)).toFixed(2)}</b></td>
//       </tr>
//     </table>
//     ` : ''}

//     ${parseFloat(proformaInvoice.discount) > 0 ? `
//     <!-- Discount Section -->
//     <table class="border-table" style="margin-top: 5px;">
//       <tr>
//         <th class="text-left">${labels.discount}</th>
//         <td class="text-center">₹${parseFloat(proformaInvoice.discount).toFixed(2)}</td>
//       </tr>
//     </table>
//     ` : ''}

//     <!-- Grand Total -->
//     <table class="border-table" style="margin-top: 5px;">
//       <tr>
//         <th class="text-left">${labels.grandTotal}</th>
//         <td class="text-center"><b>₹${parseFloat(proformaInvoice.final_amount).toFixed(2)}</b></td>
//       </tr>
//     </table>

//     <!-- Payment Summary -->
//     <table class="border-table" style="margin-top: 5px;">
//       <tr>
//         <th class="text-left">${labels.paidAmount}</th>
//         <td class="text-center">₹${parseFloat(proformaInvoice.paid_amount).toFixed(2)}</td>
//       </tr>
//       <tr style="background: #fff3cd;">
//         <th class="text-left">${labels.balanceAmount}</th>
//         <td class="text-center">₹${parseFloat(proformaInvoice.pending_amount).toFixed(2)}</td>
//       </tr>
//     </table>

//     <div style="margin-top: 5px; font-size: 10px;">
//       <b>${labels.amountInWords}</b> ${totalAmountWords}
//     </div>

//     ${user?.company_info?.sign ? `
//     <div style="text-align: right; margin-top: 15px;">
//       <img src="/img/${user.company_info.sign}" style="width: 100px; height: 35px;" /><br/>
//       <span style="font-size: 10px;">${labels.authorizedSignature}</span>
//     </div>
//     ` : ''}

//     <div class="footer-bar">
//       <span>✉️ deshmukhinfra@gmail.com</span>
//       <span>🌐 www.deshmukhinfrasolutions.com</span>
//     </div>

//     <div class="text-center" style="font-size: 9px; margin-top: 5px;">${labels.footer}</div>
//   </div>

//   ${(proformaInvoice.notes || proformaInvoice.payment_terms || proformaInvoice.terms_conditions) ? `
//   <!-- Terms Page -->
//   <div class="invoice-box">
//     <table style="margin-bottom: 5px;">
//       <tr>
//         <td style="width: 70%;">
//           <div style="font-size: 20px; font-weight: bold;">${user?.company_info?.company_name || 'Company Name'}</div>
//           <div style="font-size: 10px;">${user?.company_info?.land_mark || '-'}</div>
//         </td>
//         <td style="width: 30%; text-align: right;">
//           ${user?.company_info?.logo ? `<img src="/img/${user.company_info.logo}" style="width: 70px; height: 70px;" />` : ''}
//         </td>
//       </tr>
//     </table>
//     <hr style="border: 1px solid #000; margin: 3px 0;" />

//     ${proformaInvoice.notes ? `
//     <div class="section-title">${labels.notes}</div>
//     <div class="terms-content">${proformaInvoice.notes}</div>
//     ` : ''}

//     ${proformaInvoice.payment_terms ? `
//     <div class="section-title">${labels.paymentTerms}</div>
//     <div class="terms-content">${proformaInvoice.payment_terms}</div>
//     ` : ''}

//     ${proformaInvoice.terms_conditions ? `
//     <div class="section-title">${labels.termsConditions}</div>
//     <div class="terms-content">${proformaInvoice.terms_conditions}</div>
//     ` : ''}

//     <div class="footer-bar">
//       <span>✉️ deshmukhinfra@gmail.com</span>
//       <span>🌐 www.deshmukhinfrasolutions.com</span>
//     </div>
//   </div>
//   ` : ''}
// </body>
// </html>
// `

//   const opt = {
//     margin: 0.3,
//     filename: `${proformaInvoice.proforma_invoice_number}_${proformaInvoice.customer?.name || 'invoice'}.pdf`,
//     image: { type: 'jpeg', quality: 0.98 },
//     html2canvas: { scale: 2, useCORS: true },
//     jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
//   }

//   const pdfInstance = html2pdf().set(opt).from(htmlContent)

//   if (mode === 'blob') {
//     return pdfInstance.outputPdf('blob')
//   } else if (mode === 'save') {
//     return pdfInstance.save()
//   }
// }
























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

const formatScopePoints = (text = '') => {
  if (!text) return '—';
  const points = text
    .split(/[\n•,|.]+/)
    .map(t => t.trim())
    .filter(Boolean);
  if (!points.length) return '—';
  return points.map(p => `• ${p}`).join('\n_____________________\n');
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

  // Grand Total row
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

  y = doc.lastAutoTable.finalY + 6;

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
    // ['Amount in Words: ' + (proformaInvoice.amount_in_words || '—') + ' Only', '']
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
