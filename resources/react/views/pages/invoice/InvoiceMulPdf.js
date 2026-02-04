// import React, { useState } from 'react'
// import html2pdf from 'html2pdf.js'
// import { getUserData } from '../../../util/session'
// import { host } from '../../../util/constants'

// // Language configurations
// const LANGUAGES = {
//   marathi: {
//     name: 'मराठी',
//     font: 'Arial, sans-serif',
//     labels: {
//       projectName: 'प्रकल्पाचे नाव:',
//       customerName: 'ग्राहकाचे नाव:',
//       customerAddress: 'ग्राहकाचा पत्ता:',
//       mobile: 'मोबाईल क्रमांक:',
//       invoiceNumber: 'चलन क्रमांक:',
//       invoiceDate: 'चलन तारीख:',
//       deliveryDate: 'डिलीव्हरी तारीख:',
//       works: 'कामाचे तपशील',
//       serialNo: 'अनुक्रमांक',
//       workType: 'कामाचे प्रकार',
//       price: 'किंमत (₹)',
//       quantity: 'प्रमाण',
//       total: 'एकूण (₹)',
//       grandTotal: 'एकूण',
//       totalAfterDiscount: 'सूट नंतरची एकूण',
//       paymentDetails: 'पेमेंट तपशील',
//       amountPaid: 'रक्कम भरलेली:',
//       amountRemaining: 'शिल्लक रक्कम:',
//       paymentMode: 'पेमेंट मोड:',
//       qrCode: 'QR कोड',
//       scanToPay: 'पेमेंटसाठी स्कॅन करा',
//       amountInWords: 'रक्कम शब्दांत:',
//       bankDetails: 'बँक तपशील',
//       bank: 'बँक:',
//       accountNo: 'खाते क्रमांक:',
//       ifscCode: 'IFSC कोड:',
//       eSignature: 'ई-स्वाक्षरी',
//       authorizedSignature: 'अधिकृत स्वाक्षरी',
//       footerNote: 'हे चलन संगणकाद्वारे तयार केले आहे आणि अधिकृत आहे.',
//       only: 'फक्त',
//       baseAmount: 'मूळ रक्कम',
//       gstPercent: 'जीएसटी %',
//       cgst: 'सीजीएसटी',
//       sgst: 'एसजीएसटी',
//       taxableAmount: 'करपात्र रक्कम',
//       gstDetails: 'जीएसटी तपशील',
//     },
//   },
//   english: {
//     name: 'English',
//     font: 'Arial, sans-serif',
//     labels: {
//       projectName: 'Project Name:',
//       customerName: 'Customer Name:',
//       customerAddress: 'Customer Address:',
//       mobile: 'Mobile Number:',
//       invoiceNumber: 'Invoice Number:',
//       invoiceDate: 'Invoice Date:',
//       deliveryDate: 'Delivery Date:',
//       works: 'Work Details',
//       serialNo: 'Sr. No.',
//       workType: 'Work Type',
//       price: 'Price (₹)',
//       quantity: 'Quantity',
//       total: 'Total (₹)',
//       grandTotal: 'Grand Total',
//       totalAfterDiscount: 'Total after discount',
//       paymentDetails: 'Payment Details',
//       amountPaid: 'Amount Received:',
//       amountRemaining: 'Amount Due:',
//       paymentMode: 'Payment Mode:',
//       qrCode: 'QR CODE',
//       scanToPay: 'Scan to Pay',
//       amountInWords: 'Amount in Words:',
//       bankDetails: 'Bank Details',
//       bank: 'Bank:',
//       accountNo: 'Account Number:',
//       ifscCode: 'IFSC Code:',
//       eSignature: 'E-Signature',
//       authorizedSignature: 'Authorized Signature',
//       footerNote: 'This invoice is computer generated and authorized.',
//       only: 'only',
//       baseAmount: 'Base Amount',
//       gstPercent: 'GST %',
//       cgst: 'CGST',
//       sgst: 'SGST',
//       taxableAmount: 'Taxable Amount',
//       gstDetails: 'GST Details',
//     },
//   },
// }

// // Helper functions
// const hasRowLevelGST = (items) => {
//   if (!items || items.length === 0) return false;
//   return items.some(item => 
//     (item.gst_percent && item.gst_percent > 0) ||
//     (item.cgst_amount && item.cgst_amount > 0) ||
//     (item.sgst_amount && item.sgst_amount > 0)
//   );
// };

// const hasGlobalGST = (formData) => {
//   return (
//     (formData.cgst && Number(formData.cgst) > 0) ||
//     (formData.sgst && Number(formData.sgst) > 0) ||
//     (formData.gst && Number(formData.gst) > 0) ||
//     (formData.igst && Number(formData.igst) > 0)
//   );
// };

// export const generateMultiLanguagePDF = (
//   finalAmount,
//   invoiceNumber,
//   customerName,
//   formData,
//   balanceAmount,
//   totalAmountWords,
//   lang = 'english',
//   mode = 'save'
// ) => {
//   const labels = LANGUAGES[lang].labels
//   const font = LANGUAGES[lang].font

//   // Sort items by ID in ascending order (to show in save order)
//   const items = Array.isArray(formData.items) 
//     ? [...formData.items].sort((a, b) => (a.id || 0) - (b.id || 0))
//     : [];
  
//   const showRowGST = hasRowLevelGST(items);
//   const showGlobalGST = hasGlobalGST(formData);

// const htmlContent = `
// <html>
// <head>
//   <style>
//     @page {
//       size: A4;
//       margin: 0;
//     }
    
//     * {
//       margin: 0;
//       padding: 0;
//       box-sizing: border-box;
//     }
    
//     body { 
//       font-family: ${font}; 
//       font-size: 12px; 
//       margin: 0; 
//       padding: 0;
//     }
    
//     .invoice-box {
//       width: 100%;
//       min-height: 100vh;
//       padding: 20px;
//       border: 3px solid #000;
//       box-sizing: border-box;
//       position: relative;
//       display: flex;
//       flex-direction: column;
//     }
    
//     .content-wrapper {
//       flex: 1;
//     }
    
//     table { 
//       width: 100%; 
//       border-collapse: collapse; 
//     }
    
//     table td, table th { 
//       padding: 5px; 
//       vertical-align: top; 
//       font-size: 11px;
//     }
    
//     .details-table th, .details-table td { 
//       border: 1px solid #000; 
//     }
    
//     .details-table th { 
//       background: #d9e9ff; 
//       font-weight: bold; 
//       text-align: center; 
//     }
    
//     .summary td, .summary th { 
//       border: 1px solid #000; 
//       padding: 5px; 
//     }
    
//     .summary th { 
//       background: #d9e9ff; 
//       font-weight: bold; 
//       text-align: right; 
//     }
    
//     .right { text-align: right; }
//     .center { text-align: center; }
//     .page-break { page-break-before: always; }

//     .no-split {
//       page-break-inside: avoid;
//       break-inside: avoid;
//     }

//     .terms-section {
//       padding: 8px 0;
//       font-size: 12px;
//       margin-bottom: 10px;
//     }
    
//     .terms-section h3 {
//       margin: 0 0 6px 0;
//       font-size: 15px;
//       border-bottom: 2px solid #000;
//       padding-bottom: 4px;
//     }
    
//     .terms-content {
//       line-height: 1.5;
//       white-space: pre-line;
//       padding-left: 8px;
//     }

//     .footer {
//       text-align: center;
//       font-size: 11px;
//       padding: 8px 0;
//       width: 100%;
//       margin-top: auto;
//       background: transparent;
//     }

//     .footer-content {
//       display: flex;
//       justify-content: space-between;
//       align-items: center;
//       width: 100%;
//       padding: 0 25px;
//       box-sizing: border-box;
//     }

//     .footer-item {
//       display: flex;
//       align-items: center;
//       gap: 6px;
//       font-size: 11px;
//     }

//     .foot {
//       text-align: center;
//       margin: 8px 0;
//       font-size: 10px;
//     }

//     @media print {
//       body {
//         margin: 0;
//         padding: 0;
//       }
      
//       .invoice-box {
//         border: 3px solid #000;
//       }
//     }
//   </style>
// </head>
// <body>

// ${(() => {
//   const MAX_ROWS = 19;
//   const totalPages = Math.ceil(items.length / MAX_ROWS) || 1;
//   const hasTermsPage = !!(formData.note || formData.payment_terms || formData.terms_and_conditions);

//   let pagesHtml = "";

//   // ===== INVOICE PAGES =====
//   for (let page = 0; page < totalPages; page++) {
//     const start = page * MAX_ROWS;
//     const end = start + MAX_ROWS;
//     const itemsPage = items.slice(start, end);
//     const isLastInvoicePage = page === totalPages - 1;

//     pagesHtml += `
//       ${page > 0 ? '<div class="page-break"></div>' : ''}
//       <div class="invoice-box">
//         <div class="content-wrapper">
        
//         ${page === 0 ? `
//         <!-- ===== Header on first page ===== -->
//         <table class="company-header" style="width: 100%; margin-bottom: 5px;">
//           <tr>
//             <td style="width: 70%; vertical-align: top;">
//               <div style="font-size: 22px; font-weight: bold; line-height: 1.2;">
//                 ${getUserData()?.company_info?.company_name || 'Company Name'}
//               </div>
//               <div style="font-size: 11px; margin-top: 2px;">
//                 ${getUserData()?.company_info?.land_mark || '-'}
//               </div>
//               <div style="font-size: 11px; margin-top: 3px;">
//                 <b>Phone:</b> ${getUserData()?.company_info?.phone_no || '-'}
//               </div>
//             </td>
//             <td style="width: 30%; text-align: right; vertical-align: top;">
//               <img 
//                 src='${host}/img/${getUserData()?.company_info?.logo}' 
//                 alt="Company Logo" 
//                 style="width: 75px; height: 75px; object-fit: contain; border: 1px solid #ccc; border-radius: 5px;"
//               />
//             </td>
//           </tr>
//         </table>

//         <hr style="border: 1px solid black; margin: 3px 0;" />

//         <div style="
//           background-color: #cfe2ff;
//           text-align: center;
//           font-weight: bold;
//           font-size: 18px;
//           padding: 6px 0;
//           border: 1px solid #000;
//           margin: 6px 0;
//           letter-spacing: 1px;
//         ">
//           Quotation
//         </div>

//         <table style="border: 1px solid #000; margin: 6px 0;">
//           <tr>
//             <th style="border: 1px solid #000; background: #d9e9ff; font-size: 11px; padding: 4px;">FROM :</th>
//             <th style="border: 1px solid #000; background: #d9e9ff; font-size: 11px; padding: 4px;">TO :</th>
//             <th style="border: 1px solid #000; background: #d9e9ff; font-size: 11px; padding: 4px;">DETAILS :</th>
//           </tr>
//           <tr>
//             <td style="border: 1px solid #000; font-size: 10px; padding: 5px; line-height: 1.4;">
//               <b>${getUserData()?.company_info?.company_name || 'Company Name'}</b><br/>
//               ${getUserData()?.name || 'Owner Name'}<br/>
//               ${getUserData()?.company_info?.land_mark || '-'}<br/>
//               <b>Phone:</b> ${getUserData()?.mobile || 'N/A'}<br/>
//               <b>GSTIN:</b> ${getUserData()?.company_info?.gst_number || 'N/A'}<br/>
//               Dist: ${getUserData()?.company_info?.Dist || '-'}<br/>
//               Tal: ${getUserData()?.company_info?.Tal || '-'}<br/>
//               Email: ${getUserData()?.company_info?.email_id || '-'}
//             </td>
//             <td style="border: 1px solid #000; font-size: 10px; padding: 5px; line-height: 1.4;">
//               <b>Customer Name:</b> ${formData.customer?.name || 'Customer Name'}<br/>
//               <b>Site:</b> ${formData.project_name || 'Project Name'}<br/>
//               ${formData.customer?.address || 'Customer Address'}<br/>
//               <b>Phone:</b> ${formData.customer?.mobile || 'N/A'}<br/>
//               <b>GSTIN:</b> ${formData.gst_number || '-'}<br/>
//               <b>PAN:</b> ${formData.pan_number || '-'}
//             </td>
//             <td style="border: 1px solid #000; font-size: 10px; padding: 5px; line-height: 1.4;">
//               <b>Invoice No:</b> ${invoiceNumber}<br/>
//               <b>Invoice Date:</b> ${formData.date}<br/>
//               <b>Reference ID:</b> ${formData.ref_id || '-'}<br/>
//               <b>PO Number:</b> ${formData.po_number || '-'}
//             </td>
//           </tr>
//         </table>
//         ` : ""}

//         <table class="details-table" style="margin-top: 8px;">
//           ${page === 0 ? `
//           <thead>
//             <tr>
//               <th style="width: ${showRowGST ? '5%' : '6%'}; font-size: 10px;">${labels.serialNo}</th>
//               <th style="width: ${showRowGST ? '20%' : '38%'}; font-size: 10px;">${labels.workType}</th>
//               <th style="width: ${showRowGST ? '8%' : '10%'}; font-size: 10px;">Unit</th>
//               <th style="width: ${showRowGST ? '7%' : '10%'}; font-size: 10px;">${labels.quantity}</th>
//               <th style="width: ${showRowGST ? '10%' : '18%'}; font-size: 10px;">${labels.price}</th>
//               ${showRowGST ? `
//                 <th style="width: 12%; font-size: 10px;">${labels.baseAmount}</th>
//                 <th style="width: 8%; font-size: 10px;">${labels.gstPercent}</th>
//                 <th style="width: 12%; font-size: 10px;">${labels.cgst}</th>
//                 <th style="width: 12%; font-size: 10px;">${labels.sgst}</th>
//               ` : ''}
//               <th style="width: ${showRowGST ? '12%' : '18%'}; font-size: 10px;">${labels.total}</th>
//             </tr>
//           </thead>` : ""}
//           <tbody>
//             ${itemsPage.map((item, i) => {
//               const cgstPercent = item.gst_percent ? item.gst_percent / 2 : 0;
//               const sgstPercent = item.gst_percent ? item.gst_percent / 2 : 0;
              
//               return `
//               <tr>
//                 <td class="center" style="width: ${showRowGST ? '5%' : '6%'}; font-size: 10px;">${i + 1 + start}</td>
//                 <td style="width: ${showRowGST ? '20%' : '38%'}; font-size: 10px;">${item.work_type || ''}</td>
//                 <td class="center" style="width: ${showRowGST ? '8%' : '10%'}; font-size: 10px;">${item.uom || ''}</td>
//                 <td class="center" style="width: ${showRowGST ? '7%' : '10%'}; font-size: 10px;">${item.qty || 0}</td>
//                 <td class="right" style="width: ${showRowGST ? '10%' : '18%'}; font-size: 10px;">₹${Number(item.price || 0).toFixed(2)}</td>
//                 ${showRowGST ? `
//                   <td class="right" style="width: 12%; font-size: 10px;">₹${Number((item.qty * item.price) || 0).toFixed(2)}</td>
//                   <td class="center" style="width: 8%; font-size: 10px;">${item.gst_percent ? item.gst_percent + '%' : '-'}</td>
//                   <td class="right" style="width: 12%; font-size: 10px;">${item.cgst_amount > 0 ? '₹' + Number(item.cgst_amount).toFixed(2) + ' (' + cgstPercent + '%)' : '-'}</td>
//                   <td class="right" style="width: 12%; font-size: 10px;">${item.sgst_amount > 0 ? '₹' + Number(item.sgst_amount).toFixed(2) + ' (' + sgstPercent + '%)' : '-'}</td>
//                 ` : ''}
//                 <td class="right" style="width: ${showRowGST ? '12%' : '18%'}; font-size: 10px;">₹${Number(item.total_price || 0).toFixed(2)}</td>
//               </tr>`;
//             }).join('')}
//             ${isLastInvoicePage && items.length > 0 ? `
//               <tr style="background: #fff3cd; font-weight: bold;">
//                 <td colspan="${showRowGST ? '5' : '4'}" class="right" style="font-size: 11px; padding: 6px;">Total:</td>
//                 ${showRowGST ? `<td class="right" style="font-size: 11px;">₹${items.reduce((sum, item) => sum + ((item.qty * item.price) || 0), 0).toFixed(2)}</td>` : ''}
//                 ${showRowGST ? `<td class="center" style="font-size: 11px;">-</td>` : ''}
//                 ${showRowGST ? `<td class="right" style="font-size: 11px;">₹${items.reduce((sum, item) => sum + (item.cgst_amount || 0), 0).toFixed(2)}</td>` : ''}
//                 ${showRowGST ? `<td class="right" style="font-size: 11px;">₹${items.reduce((sum, item) => sum + (item.sgst_amount || 0), 0).toFixed(2)}</td>` : ''}
//                 <td class="right" style="font-size: 11px;">₹${items.reduce((sum, item) => sum + (item.total_price || 0), 0).toFixed(2)}</td>
//               </tr>
//             ` : ''}
//           </tbody>
//         </table>

//     ${isLastInvoicePage ? `
//   <div class="no-split">
//     ${showGlobalGST ? `
//       <table class="summary" style="margin-top: 8px;">
//         <tr>
//           <th colspan="2" style="font-size: 12px; background: #d9e9ff; text-align: center;">${labels.gstDetails}</th>
//         </tr>
//         <tr>
//           <th style="font-size: 11px;">${labels.taxableAmount}</th>
//           <td class="right" style="font-size: 11px;">₹${(() => {
//             const totalAfterRowGST = items.reduce((sum, item) => sum + (item.total_price || 0), 0);
//             return Number(totalAfterRowGST).toFixed(2);
//           })()}</td>
//         </tr>
//         ${Number(formData.cgst || 0) > 0 ? `
//         <tr>
//           <th style="font-size: 11px;">${labels.cgst} (${formData.cgstPercentage || (Number(formData.gst || 0) / 2)}%)</th>
//           <td class="right" style="font-size: 11px;">₹${Number(formData.cgst || 0).toFixed(2)}</td>
//         </tr>` : ''}
//         ${Number(formData.sgst || 0) > 0 ? `
//         <tr>
//           <th style="font-size: 11px;">${labels.sgst} (${formData.sgstPercentage || (Number(formData.gst || 0) / 2)}%)</th>
//           <td class="right" style="font-size: 11px;">₹${Number(formData.sgst || 0).toFixed(2)}</td>
//         </tr>` : ''}
//         ${Number(formData.igst || 0) > 0 ? `
//         <tr>
//           <th style="font-size: 11px;">IGST (${formData.igstPercentage || Number(formData.gst || 0)}%)</th>
//           <td class="right" style="font-size: 11px;">₹${Number(formData.igst || 0).toFixed(2)}</td>
//         </tr>` : ''}
//         <tr style="background: #e8f5e9;">
//           <th style="font-size: 11px;">Total GST Amount</th>
//           <td class="right" style="font-size: 11px;"><strong>₹${(Number(formData.cgst || 0) + Number(formData.sgst || 0) + Number(formData.igst || 0)).toFixed(2)}</strong></td>
//         </tr>
//       </table>
//     ` : ''}

//     ${formData.discount > 0 ? `
//     <table class="summary" style="margin-top: 8px;">
//       <tr>
//         <th style="font-size: 11px;">Discount</th>
//         <td class="right" style="font-size: 11px;">₹${Number(formData.discount || 0).toFixed(2)}</td>
//       </tr>
//     </table>
//     ` : ''}

//     <table class="summary" style="margin-top: 8px;">
//       <tr style="background: #fff3cd;">
//         <th style="font-size: 12px;">${labels.grandTotal}</th>
//         <td class="right" style="font-size: 12px;"><strong>₹${Number(finalAmount || 0).toFixed(2)}</strong></td>
//       </tr>
//       <tr>
//         <th style="font-size: 11px;">${labels.amountPaid}</th>
//         <td class="right" style="font-size: 11px;">₹${Number(formData.amountPaid || 0).toFixed(2)}</td>
//       </tr>
//       <tr style="background: #f8d7da;">
//         <th style="vertical-align: top; font-size: 11px;">
//           ${labels.amountRemaining}<br />
//           <span style="font-weight: normal; font-size: 10px;">
//             ${labels.amountInWords} ${totalAmountWords} ${labels.only}
//           </span>
//         </th>
//         <td class="right" style="vertical-align: top; font-size: 11px;">
//           <strong>₹${Number(balanceAmount || 0).toFixed(2)}</strong>
//         </td>
//       </tr>
//     </table>
//   </div>
// ` : ""}

//         </div>

//         <div class="foot">
//           ${labels.footerNote}
//         </div>
//         <div class="footer">
//           <div class="footer-content">
//             <div class="footer-item">
//               <span>✉️</span>
//               <span>deshmukhinfra@gmail.com</span>
//             </div>
//             <div class="footer-item">
//               <span>🌐</span>
//               <span>www.deshmukhinfrasolutions.com</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     `;
//   }
      
//   // ===== TERMS & CONDITIONS PAGE =====
//   if (hasTermsPage) {
//     pagesHtml += `
//     <div class="page-break"></div>
//     <div class="invoice-box">
//       <div class="content-wrapper">
//         <table class="company-header" style="width: 100%; margin-bottom: 5px;">
//           <tr>
//             <td style="width: 70%; vertical-align: top;">
//               <div style="font-size: 22px; font-weight: bold; line-height: 1.2;">
//                 ${getUserData()?.company_info?.company_name || 'Company Name'}
//               </div>
//               <div style="font-size: 11px; margin-top: 2px;">
//                 ${getUserData()?.company_info?.land_mark || '-'}
//               </div>
//               <div style="font-size: 11px; margin-top: 3px;">
//                 <b>Phone:</b> ${getUserData()?.company_info?.phone_no || '-'}
//               </div>
//             </td>
//             <td style="width: 30%; text-align: right; vertical-align: top;">
//               <img 
//                 src='${host}/img/${getUserData()?.company_info?.logo}' 
//                 alt="Company Logo" 
//                 style="width: 75px; height: 75px; object-fit: contain; border: 1px solid #ccc; border-radius: 5px;"
//               />
//             </td>
//           </tr>
//         </table>

//         <hr style="border: 1px solid black; margin: 3px 0;" />

//         ${formData.note ? `
//         <div class="terms-section">
//           <h3>Notes</h3>
//           <div class="terms-content">${formData.note}</div>
//         </div>
//         ` : ''}

//         ${formData.payment_terms ? `
//         <div class="terms-section">
//           <h3>Payment Terms</h3>
//           <div class="terms-content">${formData.payment_terms}</div>
//         </div>
//         ` : ''}

//         ${formData.terms_and_conditions ? `
//         <div class="terms-section">
//           <h3>Terms & Conditions</h3>
//           <div class="terms-content">${formData.terms_and_conditions}</div>
//         </div>
//         ` : ''}
//       </div>

//       <div class="footer">
//         <div class="footer-content">
//           <div class="footer-item">
//             <span>✉️</span>
//             <span>deshmukhinfra@gmail.com</span>
//           </div>
//           <div class="footer-item">
//             <span>🌐</span>
//             <span>www.deshmukhinfrasolutions.com</span>
//           </div>
//         </div>
//       </div>
//     </div>
//     `;
//   }

//   return pagesHtml;
// })()}

// </body>
// </html>
// `;

//   const opt = {
//     margin: 0.5,
//     filename: `${invoiceNumber}_${customerName}.pdf`,
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

// function UnifiedInvoicePdf() {
//   const [selectedLanguage, setSelectedLanguage] = useState('english')

//   const sampleFormData = {
//     project_name: selectedLanguage === 'marathi' ? 'नमुना प्रकल्प' : 'Sample Project',
//     customer_id: 1,
//     customer: {
//       name: selectedLanguage === 'marathi' ? 'श्रेया ग' : 'Shreya G',
//       address: selectedLanguage === 'marathi' ? 'कर्वेनगर' : 'Karvenagar',
//       mobile: '1234567890',
//     },
//     date: '2024-12-31',
//     InvoiceStatus: selectedLanguage === 'marathi' ? 'डिलिव्हर्ड ऑर्डर' : 'Delivered Order',
//     InvoiceType: 3,
//     DeliveryDate: '2025-01-01',
//     lat: 'Sample Address Line',
//     items: Array.from({ length: 28 }, (_, i) => ({
//       id: i + 1,
//       work_type: String.fromCharCode(97 + (i % 26)),
//       qty: Math.floor(Math.random() * 100) + 1,
//       price: Math.random() * 1000,
//       total_price: Math.random() * 1000,
//       gst_percent: i % 2 === 0 ? 12 : 18,
//       cgst_amount: Math.random() * 50,
//       sgst_amount: Math.random() * 50,
//     })),
//     totalAmount: 400,
//     discount: 10,
//     finalAmount: 360,
//     amountPaid: 300,
//     paymentMode: selectedLanguage === 'marathi' ? 'ऑनलाइन' : 'Online',
//     note: 'This is a sample note for testing purposes.',
//     payment_terms: 'Payment should be made within 30 days of invoice date.',
//     terms_and_conditions: 'All disputes subject to Pune jurisdiction only.',
//   }

//   const totalAmountWords = selectedLanguage === 'marathi' ? 'तीनशे साठ' : 'Three Hundred and Sixty'

//   const handleDownload = () => {
//     generateMultiLanguagePDF(
//       360,
//       'INV-001',
//       sampleFormData.customer.name,
//       sampleFormData,
//       60,
//       totalAmountWords,
//       selectedLanguage,
//       'save'
//     )
//   }

//   return (
//     <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
//       <h2>Multi-Language Invoice PDF Generator (Fixed Blank Page)</h2>

//       <div style={{ marginBottom: '20px' }}>
//         <label style={{ marginRight: '10px' }}>Select Language:</label>
//         <select
//           value={selectedLanguage}
//           onChange={(e) => setSelectedLanguage(e.target.value)}
//           style={{ padding: '5px', fontSize: '16px' }}
//         >
//           {Object.entries(LANGUAGES).map(([key, lang]) => (
//             <option key={key} value={key}>
//               {lang.name}
//             </option>
//           ))}
//         </select>
//       </div>

//       <button
//         onClick={handleDownload}
//         style={{
//           padding: '10px 20px',
//           fontSize: '16px',
//           backgroundColor: '#4CAF50',
//           color: 'white',
//           border: 'none',
//           borderRadius: '5px',
//           cursor: 'pointer',
//         }}
//       >
//         {selectedLanguage === 'tamil'
//           ? 'விலைப்பட்டியல் பதிவிறக்கம் செய்யவும்'
//           : selectedLanguage === 'bengali'
//           ? 'ইনভয়েস ডাউনলোড করুন'
//           : selectedLanguage === 'marathi'
//           ? 'चलन डाउनलोड करा'
//           : 'Download Invoice'}
//       </button>

//       <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
//         <h3>Updated Improvements:</h3>
//         <ul>
//           <li>✅ Increased overall padding from 5px to 10px</li>
//           <li>✅ Increased customer details font size from 10px to 12px</li>
//           <li>✅ Increased invoice details font size from 10px to 12px</li>
//           <li>✅ Increased company name font size from 14px to 16px</li>
//           <li>✅ Increased company address font size from 10px to 12px</li>
//           <li>✅ Increased table cell padding from 4px to 6px</li>
//           <li>✅ Increased payment details font size from 10px to 12px</li>
//           <li>✅ Improved overall spacing and margins</li>
//           <li>✅ Adapted to customer-based API response (customer_name as project_name)</li>
//           <li>✅ Added customer_id to form data</li>
//         </ul>
//       </div>
//     </div>
//   )
// }

// export default UnifiedInvoicePdf















// import React, { useState } from 'react'
// import html2pdf from 'html2pdf.js'
// import { getUserData } from '../../../util/session'
// import { host } from '../../../util/constants'

// // Language configurations
// const LANGUAGES = {
//   english: {
//     name: 'English',
//     font: 'Arial, sans-serif',
//     labels: {
//       projectName: 'Project Name:',
//       customerName: 'Customer Name:',
//       customerAddress: 'Customer Address:',
//       mobile: 'Mobile Number:',
//       invoiceNumber: 'Invoice Number:',
//       invoiceDate: 'Invoice Date:',
//       deliveryDate: 'Delivery Date:',
//       works: 'Work Details',
//       serialNo: 'Sr. No.',
//       workType: 'Work Type',
//       price: 'Price (₹)',
//       quantity: 'Quantity',
//       total: 'Total (₹)',
//       grandTotal: 'Grand Total',
//       totalAfterDiscount: 'Total after discount',
//       paymentDetails: 'Payment Details',
//       amountPaid: 'Amount Received:',
//       amountRemaining: 'Amount Due:',
//       paymentMode: 'Payment Mode:',
//       qrCode: 'QR CODE',
//       scanToPay: 'Scan to Pay',
//       amountInWords: 'Amount in Words:',
//       bankDetails: 'Bank Details',
//       bank: 'Bank:',
//       accountNo: 'Account Number:',
//       ifscCode: 'IFSC Code:',
//       eSignature: 'E-Signature',
//       authorizedSignature: 'Authorized Signature',
//       footerNote: 'This invoice is computer generated and authorized.',
//       only: 'only',
//       baseAmount: 'Base Amount',
//       gstPercent: 'GST %',
//       cgst: 'CGST',
//       sgst: 'SGST',
//       taxableAmount: 'Taxable Amount',
//       gstDetails: 'GST Details',
//     },
//   },
// }

// // Helper functions
// const hasRowLevelGST = (items) => {
//   if (!items || items.length === 0) return false;
//   return items.some(item =>
//     (item.gst_percent && item.gst_percent > 0) ||
//     (item.cgst_amount && item.cgst_amount > 0) ||
//     (item.sgst_amount && item.sgst_amount > 0)
//   );
// };

// const hasGlobalGST = (formData) => {
//   return (
//     (formData.cgst && Number(formData.cgst) > 0) ||
//     (formData.sgst && Number(formData.sgst) > 0) ||
//     (formData.gst && Number(formData.gst) > 0) ||
//     (formData.igst && Number(formData.igst) > 0)
//   );
// };

// export const generateMultiLanguagePDF = (
//   finalAmount,
//   invoiceNumber,
//   customerName,
//   formData,
//   balanceAmount,
//   totalAmountWords,
//   lang = 'english',
//   mode = 'save'
// ) => {
//   const labels = LANGUAGES[lang].labels
//   const font = LANGUAGES[lang].font

//   // Sort items by ID in ascending order
//   const items = Array.isArray(formData.items)
//     ? [...formData.items].sort((a, b) => (a.id || 0) - (b.id || 0))
//     : [];

//   const showRowGST = hasRowLevelGST(items);
//   const showGlobalGST = hasGlobalGST(formData);
//   const hasTermsPage = !!(formData.note || formData.payment_terms || formData.terms_and_conditions);

//   // ========== DOM MEASUREMENT FOR ACCURATE PAGINATION ==========
  
//   // Create temporary container
//   const tempContainer = document.createElement('div');
//   tempContainer.style.position = 'absolute';
//   tempContainer.style.left = '-9999px';
//   tempContainer.style.width = '794px'; // A4 width at 96dpi
//   tempContainer.style.fontFamily = font;
//   tempContainer.style.fontSize = '12px';
//   document.body.appendChild(tempContainer);

//   // A4 dimensions in pixels (96 DPI)
//   const PAGE_HEIGHT = 1123; // A4 height
//   const PADDING_VERTICAL = 40; // 20px top + 20px bottom
//   const AVAILABLE_HEIGHT = PAGE_HEIGHT - PADDING_VERTICAL;

//   // Measure first page header
//   tempContainer.innerHTML = `
//     <div style="width: 740px; padding: 20px; box-sizing: border-box;">
//       <table style="width: 100%; margin-bottom: 5px; border-collapse: collapse;">
//         <tr>
//           <td style="width: 70%; vertical-align: top;">
//             <div style="font-size: 22px; font-weight: bold; line-height: 1.2;">
//               ${getUserData()?.company_info?.company_name || 'Company Name'}
//             </div>
//             <div style="font-size: 12px; margin-top: 2px;">
//               ${getUserData()?.company_info?.land_mark || '-'}
//             </div>
//             <div style="font-size: 12px; margin-top: 3px;">
//               <b>Phone:</b> ${getUserData()?.company_info?.phone_no || '-'}
//             </div>
//           </td>
//           <td style="width: 30%; text-align: right; vertical-align: top;">
//             <div style="width: 75px; height: 75px; border: 1px solid #ccc;"></div>
//           </td>
//         </tr>
//       </table>
//       <hr style="border: 1px solid black; margin: 3px 0;" />
//       <div style="background-color: #cfe2ff; text-align: center; font-weight: bold; font-size: 18px; padding: 6px 0; border: 1px solid #000; margin: 6px 0;">
//         Quotation
//       </div>
//       <table style="border: 1px solid #000; margin: 6px 0; width: 100%; border-collapse: collapse;">
//         <tr>
//           <th style="border: 1px solid #000; background: #d9e9ff; font-size: 12px; padding: 4px;">FROM</th>
//           <th style="border: 1px solid #000; background: #d9e9ff; font-size: 12px; padding: 4px;">TO</th>
//           <th style="border: 1px solid #000; background: #d9e9ff; font-size: 12px; padding: 4px;">DETAILS</th>
//         </tr>
//         <tr>
//           <td style="border: 1px solid #000; font-size: 12px; padding: 5px; line-height: 1.4;">
//             <b>${getUserData()?.company_info?.company_name || 'Company'}</b><br/>
//             ${getUserData()?.name || 'Name'}<br/>
//             ${getUserData()?.company_info?.land_mark || '-'}<br/>
//             <b>Phone:</b> ${getUserData()?.mobile || '-'}<br/>
//             <b>GSTIN:</b> ${getUserData()?.company_info?.gst_number || '-'}<br/>
//             Dist: ${getUserData()?.company_info?.Dist || '-'}<br/>
//             Tal: ${getUserData()?.company_info?.Tal || '-'}<br/>
//             Email: ${getUserData()?.company_info?.email_id || '-'}
//           </td>
//           <td style="border: 1px solid #000; font-size: 12px; padding: 5px; line-height: 1.4;">
//             <b>Customer:</b> ${formData.customer?.name || '-'}<br/>
//             <b>Site:</b> ${formData.project_name || '-'}<br/>
//             ${formData.customer?.address || '-'}<br/>
//             <b>Phone:</b> ${formData.customer?.mobile || '-'}<br/>
//             <b>GSTIN:</b> ${formData.gst_number || '-'}<br/>
//             <b>PAN:</b> ${formData.pan_number || '-'}
//           </td>
//           <td style="border: 1px solid #000; font-size: 12px; padding: 5px; line-height: 1.4;">
//             <b>Invoice No:</b> ${invoiceNumber}<br/>
//             <b>Invoice Date:</b> ${formData.date}<br/>
//             <b>Reference:</b> ${formData.ref_id || '-'}<br/>
//             <b>PO:</b> ${formData.po_number || '-'}
//           </td>
//         </tr>
//       </table>
//     </div>
//   `;
//   const firstPageHeaderHeight = tempContainer.offsetHeight;

//   // Measure subsequent page header
//   tempContainer.innerHTML = `
//     <div style="width: 740px; padding: 20px; box-sizing: border-box;">
//       <table style="width: 100%; margin-bottom: 5px; border-collapse: collapse;">
//         <tr>
//           <td style="width: 70%; vertical-align: top;">
//             <div style="font-size: 22px; font-weight: bold; line-height: 1.2;">
//               ${getUserData()?.company_info?.company_name || 'Company Name'}
//             </div>
//             <div style="font-size: 12px; margin-top: 2px;">
//               ${getUserData()?.company_info?.land_mark || '-'}
//             </div>
//             <div style="font-size: 12px; margin-top: 3px;">
//               <b>Phone:</b> ${getUserData()?.company_info?.phone_no || '-'}
//             </div>
//           </td>
//           <td style="width: 30%; text-align: right; vertical-align: top;">
//             <div style="width: 75px; height: 75px; border: 1px solid #ccc;"></div>
//           </td>
//         </tr>
//       </table>
//       <hr style="border: 1px solid black; margin: 3px 0;" />
//     </div>
//   `;
//   const subsequentPageHeaderHeight = tempContainer.offsetHeight;

//   // Measure footer
//   tempContainer.innerHTML = `
//     <div style="width: 740px; padding: 20px; box-sizing: border-box;">
//       <div style="text-align: center; margin: 8px 0; font-size: 10px;">
//         ${labels.footerNote}
//       </div>
//       <div style="text-align: center; font-size: 11px; padding: 8px 0; border-top: 1px solid #999;">
//         <div style="display: flex; justify-content: space-between; padding: 0 25px;">
//           <div>✉️ deshmukhinfra@gmail.com</div>
//           <div>🌐 www.deshmukhinfrasolutions.com</div>
//         </div>
//       </div>
//     </div>
//   `;
//   const footerHeight = tempContainer.offsetHeight;

//   // Measure table header
//   tempContainer.innerHTML = `
//     <div style="width: 740px; padding: 20px; box-sizing: border-box;">
//       <table style="width: 100%; border-collapse: collapse; margin-top: 8px;">
//         <thead>
//           <tr>
//             <th style="border: 1px solid #000; background: #d9e9ff; font-size: 11px; padding: 6px; width: ${showRowGST ? '4%' : '5%'};">${labels.serialNo}</th>
//             <th style="border: 1px solid #000; background: #d9e9ff; font-size: 11px; padding: 6px; width: ${showRowGST ? '22%' : '40%'};">${labels.workType}</th>
//             <th style="border: 1px solid #000; background: #d9e9ff; font-size: 11px; padding: 6px; width: ${showRowGST ? '5%' : '8%'};">Unit</th>
//             <th style="border: 1px solid #000; background: #d9e9ff; font-size: 11px; padding: 6px; width: ${showRowGST ? '5%' : '8%'};">${labels.quantity}</th>
//             <th style="border: 1px solid #000; background: #d9e9ff; font-size: 11px; padding: 6px; width: ${showRowGST ? '10%' : '15%'};">${labels.price}</th>
//             ${showRowGST ? `
//               <th style="border: 1px solid #000; background: #d9e9ff; font-size: 11px; padding: 6px; width: 10%;">${labels.baseAmount}</th>
//               <th style="border: 1px solid #000; background: #d9e9ff; font-size: 11px; padding: 6px; width: 5%;">${labels.gstPercent}</th>
//               <th style="border: 1px solid #000; background: #d9e9ff; font-size: 11px; padding: 6px; width: 10%;">${labels.cgst}</th>
//               <th style="border: 1px solid #000; background: #d9e9ff; font-size: 11px; padding: 6px; width: 10%;">${labels.sgst}</th>
//             ` : ''}
//             <th style="border: 1px solid #000; background: #d9e9ff; font-size: 11px; padding: 6px; width: ${showRowGST ? '19%' : '24%'};">${labels.total}</th>
//           </tr>
//         </thead>
//       </table>
//     </div>
//   `;
//   const tableHeaderHeight = tempContainer.querySelector('thead').offsetHeight;

//   // Measure each item row
//   const rowHeights = [];
//   items.forEach((item, index) => {
//     const cgstPercent = item.gst_percent ? item.gst_percent / 2 : 0;
//     const sgstPercent = item.gst_percent ? item.gst_percent / 2 : 0;
    
//     tempContainer.innerHTML = `
//       <div style="width: 740px; padding: 20px; box-sizing: border-box;">
//         <table style="width: 100%; border-collapse: collapse;">
//           <tbody>
//             <tr>
//               <td style="border: 1px solid #000; text-align: center; font-size: 11px; padding: 6px; width: ${showRowGST ? '4%' : '5%'};">${index + 1}</td>
//               <td style="border: 1px solid #000; font-size: 11px; padding: 6px; width: ${showRowGST ? '22%' : '40%'}; word-break: break-word;">${item.work_type || ''}</td>
//               <td style="border: 1px solid #000; text-align: center; font-size: 11px; padding: 6px; width: ${showRowGST ? '5%' : '8%'};">${item.uom || ''}</td>
//               <td style="border: 1px solid #000; text-align: center; font-size: 11px; padding: 6px; width: ${showRowGST ? '5%' : '8%'};">${item.qty || 0}</td>
//               <td style="border: 1px solid #000; text-align: right; font-size: 11px; padding: 6px; width: ${showRowGST ? '10%' : '15%'};">₹${Number(item.price || 0).toFixed(2)}</td>
//               ${showRowGST ? `
//                 <td style="border: 1px solid #000; text-align: right; font-size: 11px; padding: 6px; width: 10%;">₹${Number((item.qty * item.price) || 0).toFixed(2)}</td>
//                 <td style="border: 1px solid #000; text-align: center; font-size: 11px; padding: 6px; width: 5%;">${item.gst_percent ? item.gst_percent + '%' : '-'}</td>
//                 <td style="border: 1px solid #000; text-align: right; font-size: 11px; padding: 6px; width: 10%;">${item.cgst_amount > 0 ? '₹' + Number(item.cgst_amount).toFixed(2) : '-'}</td>
//                 <td style="border: 1px solid #000; text-align: right; font-size: 11px; padding: 6px; width: 10%;">${item.sgst_amount > 0 ? '₹' + Number(item.sgst_amount).toFixed(2) : '-'}</td>
//               ` : ''}
//               <td style="border: 1px solid #000; text-align: right; font-size: 11px; padding: 6px; width: ${showRowGST ? '19%' : '24%'};">₹${Number(item.total_price || 0).toFixed(2)}</td>
//             </tr>
//           </tbody>
//         </table>
//       </div>
//   `;
//     rowHeights.push(tempContainer.querySelector('tr').offsetHeight);
//   });

//   // Measure total row
//   tempContainer.innerHTML = `
//     <div style="width: 740px; padding: 20px; box-sizing: border-box;">
//       <table style="width: 100%; border-collapse: collapse;">
//         <tbody>
//           <tr style="background: #fff3cd; font-weight: bold;">
//             <td colspan="${showRowGST ? '5' : '4'}" style="border: 1px solid #000; text-align: right; font-size: 12px; padding: 6px;">Total:</td>
//             ${showRowGST ? `<td style="border: 1px solid #000; text-align: right; font-size: 12px; padding: 6px;">₹0.00</td>` : ''}
//             ${showRowGST ? `<td style="border: 1px solid #000; text-align: center; font-size: 12px; padding: 6px;">-</td>` : ''}
//             ${showRowGST ? `<td style="border: 1px solid #000; text-align: right; font-size: 12px; padding: 6px;">₹0.00</td>` : ''}
//             ${showRowGST ? `<td style="border: 1px solid #000; text-align: right; font-size: 12px; padding: 6px;">₹0.00</td>` : ''}
//             <td style="border: 1px solid #000; text-align: right; font-size: 12px; padding: 6px;">₹0.00</td>
//           </tr>
//         </tbody>
//       </table>
//     </div>
//   `;
//   const totalRowHeight = tempContainer.querySelector('tr').offsetHeight;

//   // Measure summary section
//   tempContainer.innerHTML = `
//     <div style="width: 740px; padding: 20px; box-sizing: border-box;">
//       ${showGlobalGST ? `
//         <table style="width: 100%; border-collapse: collapse; margin-top: 8px;">
//           <tr>
//             <th colspan="2" style="border: 1px solid #000; font-size: 12px; background: #d9e9ff; text-align: center; padding: 6px;">${labels.gstDetails}</th>
//           </tr>
//           <tr>
//             <th style="border: 1px solid #000; font-size: 12px; padding: 6px; background: #d9e9ff; text-align: right;">${labels.taxableAmount}</th>
//             <td style="border: 1px solid #000; text-align: right; font-size: 12px; padding: 6px;">₹0.00</td>
//           </tr>
//           ${Number(formData.cgst || 0) > 0 ? `
//           <tr>
//             <th style="border: 1px solid #000; font-size: 12px; padding: 6px; background: #d9e9ff; text-align: right;">${labels.cgst}</th>
//             <td style="border: 1px solid #000; text-align: right; font-size: 12px; padding: 6px;">₹0.00</td>
//           </tr>` : ''}
//           ${Number(formData.sgst || 0) > 0 ? `
//           <tr>
//             <th style="border: 1px solid #000; font-size: 12px; padding: 6px; background: #d9e9ff; text-align: right;">${labels.sgst}</th>
//             <td style="border: 1px solid #000; text-align: right; font-size: 12px; padding: 6px;">₹0.00</td>
//           </tr>` : ''}
//           ${Number(formData.igst || 0) > 0 ? `
//           <tr>
//             <th style="border: 1px solid #000; font-size: 12px; padding: 6px; background: #d9e9ff; text-align: right;">IGST</th>
//             <td style="border: 1px solid #000; text-align: right; font-size: 12px; padding: 6px;">₹0.00</td>
//           </tr>` : ''}
//           <tr style="background: #e8f5e9;">
//             <th style="border: 1px solid #000; font-size: 12px; padding: 6px; text-align: right;">Total GST</th>
//             <td style="border: 1px solid #000; text-align: right; font-size: 12px; padding: 6px;">₹0.00</td>
//           </tr>
//         </table>
//       ` : ''}
//       ${formData.discount > 0 ? `
//       <table style="width: 100%; border-collapse: collapse; margin-top: 8px;">
//         <tr>
//           <th style="border: 1px solid #000; font-size: 12px; padding: 6px; background: #d9e9ff; text-align: right;">Discount</th>
//           <td style="border: 1px solid #000; text-align: right; font-size: 12px; padding: 6px;">₹0.00</td>
//         </tr>
//       </table>
//       ` : ''}
//       <table style="width: 100%; border-collapse: collapse; margin-top: 8px;">
//         <tr style="background: #fff3cd;">
//           <th style="border: 1px solid #000; font-size: 12px; padding: 6px; background: #d9e9ff; text-align: right;">${labels.grandTotal}</th>
//           <td style="border: 1px solid #000; text-align: right; font-size: 12px; padding: 6px;">₹0.00</td>
//         </tr>
//         <tr>
//           <th style="border: 1px solid #000; font-size: 12px; padding: 6px; background: #d9e9ff; text-align: right;">${labels.amountPaid}</th>
//           <td style="border: 1px solid #000; text-align: right; font-size: 12px; padding: 6px;">₹0.00</td>
//         </tr>
//         <tr style="background: #f8d7da;">
//           <th style="border: 1px solid #000; vertical-align: top; font-size: 12px; padding: 6px; background: #d9e9ff; text-align: right;">
//             ${labels.amountRemaining}<br />
//             <span style="font-weight: normal; font-size: 11px;">${labels.amountInWords} ${totalAmountWords} ${labels.only}</span>
//           </th>
//           <td style="border: 1px solid #000; text-align: right; vertical-align: top; font-size: 12px; padding: 6px;">₹0.00</td>
//         </tr>
//       </table>
//     </div>
//   `;
//   const summaryHeight = tempContainer.offsetHeight - 40; // subtract padding

//   // Clean up
//   document.body.removeChild(tempContainer);

//   // ========== PAGINATION LOGIC ==========
  
//   let pages = [];
//   let currentPage = [];
//   let currentHeight = 0;
  
//   // let pageAvailableHeight = AVAILABLE_HEIGHT - firstPageHeaderHeight - footerHeight - tableHeaderHeight;
//  let pageAvailableHeight =
//   AVAILABLE_HEIGHT
//   - firstPageHeaderHeight
//   - tableHeaderHeight;

//   let isFirstPage = true;

//   items.forEach((item, index) => {
//     const rowHeight = rowHeights[index];
    
//     // Check if adding this row would exceed page height
//     if (currentHeight + rowHeight > pageAvailableHeight && currentPage.length > 0) {
//       // Start new page
//       pages.push(currentPage);
//       currentPage = [];
//       currentHeight = 0;
//       isFirstPage = false;
//       pageAvailableHeight = AVAILABLE_HEIGHT - subsequentPageHeaderHeight - footerHeight - tableHeaderHeight;
//     }
    
//     currentPage.push({ ...item, originalIndex: index });
//     currentHeight += rowHeight;
//   });

//   // Handle last page with summary
//   // let needSummaryPage = false;
//   // if (currentPage.length > 0) {
//   //   const remainingHeight = pageAvailableHeight - currentHeight;
//   //   const neededHeight = totalRowHeight + summaryHeight;
    
//   //   if (remainingHeight < neededHeight) {
//   //     needSummaryPage = true;
//   //   }
    
//   //   // If not enough space, pop items until it fits or page is empty
//   //   while (remainingHeight < neededHeight && currentPage.length > 0) {
//   //     const movedItem = currentPage.pop();
//   //     currentHeight -= rowHeights[movedItem.originalIndex];
//   //   }

//   //   if (currentPage.length > 0) {
//   //     pages.push(currentPage);
//   //   }
//   // }

//   // if (needSummaryPage) {
//   //   pages.push([]);
//   // }


// // ✅ FINAL PAGE HANDLING — NO ROW LOSS
// if (currentPage.length > 0) {
//   pages.push(currentPage);
// }

// // If summary does not fit, push a new EMPTY page for summary
// const remainingHeight = pageAvailableHeight - currentHeight;
// const neededHeight = totalRowHeight + summaryHeight;



// if (remainingHeight < summaryHeight + totalRowHeight) {
//   // create new page ONLY for summary
//   pages.push([]);
// }


// if (remainingHeight < neededHeight) {
//   pages.push([]); // summary-only page
// }


//   const totalPages = pages.length || 1;

//   // ========== GENERATE HTML ==========

//   const htmlContent = `
// <html>
// <head>
//   <style>
//     @page {
//       size: A4;
//       margin: 0;
//     }
//     * {
//       margin: 0;
//       padding: 0;
//       box-sizing: border-box;
//     }
//     body {
//       font-family: ${font};
//       font-size: 12px;
//       margin: 0;
//       padding: 0;
//       background: white;
//     }
//     .invoice-box {
//       width: 100%;
//       min-height: auto;
//       margin: 0;
//       padding: 20px;
//       border: 3px solid #000;
//       box-sizing: border-box;
//       position: relative;
//       display: flex;
//       flex-direction: column;
//       page-break-after: always;
//       background: white;
//     }



// .page-spacer {
//   height: 12px;          /* critical */
//   width: 100%;
// }



//     .content-wrapper {
//       flex: 1;
//     }
//     table {
//       width: 100%;
//       border-collapse: collapse;
//       table-layout: fixed;
//     }
//     table td, table th {
//       padding: 6px;
//       vertical-align: top;
//       font-size: 11px;
//       word-break: break-word;
//     }
//     .details-table th, .details-table td {
//       border: 1px solid #000;
//     }
//     .details-table th {
//       background: #d9e9ff;
//       font-weight: bold;
//       text-align: center;
//     }
//     .summary td, .summary th {
//       border: 1px solid #000;
//       padding: 6px;
//       word-break: break-word;
//     }
//     .summary th {
//       background: #d9e9ff;
//       font-weight: bold;
//       text-align: right;
//     }
//     .right { text-align: right; }
//     .center { text-align: center; }
    
//     .footer {
//       text-align: center;
//       font-size: 11px;
//       padding: 8px 0;
//       width: 100%;
//       margin-top: auto;
//       background: transparent;
//       border-top: 1px solid #999;
//     }
//     .footer-content {
//       display: flex;
//       justify-content: space-between;
//       align-items: center;
//       width: 100%;
//       padding: 0 25px;
//       box-sizing: border-box;
//     }
//     .footer-item {
//       display: flex;
//       align-items: center;
//       gap: 6px;
//       font-size: 11px;
//     }
//     .foot {
//       text-align: center;
//       margin: 8px 0;
//       font-size: 10px;
//     }
//     .terms-section {
//       padding: 8px 0;
//       font-size: 12px;
//       margin-bottom: 10px;
//     }
//     .terms-section h3 {
//       margin: 0 0 6px 0;
//       font-size: 15px;
//       border-bottom: 2px solid #000;
//       padding-bottom: 4px;
//     }
//     .terms-content {
//       line-height: 1.5;
//       white-space: pre-line;
//       padding-left: 8px;
//     }
//     @media print {
//       body {
//         margin: 0;
//         padding: 0;
//       }
//       .invoice-box {
//         border: 3px solid #000;
//       }
//     }
//   </style>
// </head>
// <body>
// ${(() => {
//   let pagesHtml = "";
  
//   // ===== INVOICE PAGES =====
//   for (let page = 0; page < totalPages; page++) {
//     const itemsPage = pages[page] || [];
//     const isFirstPage = page === 0;
//     const isLastInvoicePage = page === totalPages - 1;
    
//     if (itemsPage.length === 0 && !isLastInvoicePage) continue; // Skip empty non-last pages to avoid blanks
    
//     pagesHtml += `
//       ${page > 0 ? '<div class="page-spacer"></div>' : ''}
//       <div class="invoice-box ${page > 0 ? 'no-top-border' : ''}">
//         <div class="content-wrapper">
      
//         <!-- Header -->
//         <table class="company-header" style="width: 100%; margin-bottom: 5px;">
//           <tr>
//             <td style="width: 70%; vertical-align: top;">
//               <div style="font-size: 22px; font-weight: bold; line-height: 1.2;">
//                 ${getUserData()?.company_info?.company_name || 'Company Name'}
//               </div>
//               <div style="font-size: 12px; margin-top: 2px;">
//                 ${getUserData()?.company_info?.land_mark || '-'}
//               </div>
//               <div style="font-size: 12px; margin-top: 3px;">
//                 <b>Phone:</b> ${getUserData()?.company_info?.phone_no || '-'}
//               </div>
//             </td>
//             <td style="width: 30%; text-align: right; vertical-align: top;">
//               <img
//                 src='${host}/img/${getUserData()?.company_info?.logo}'
//                 alt="Company Logo"
//                 style="width: 75px; height: 75px; object-fit: contain; border: 1px solid #ccc; border-radius: 5px;"
//               />
//             </td>
//           </tr>
//         </table>
//         <hr style="border: 1px solid black; margin: 3px 0;" />
        
//         ${isFirstPage ? `
//         <div style="
//           background-color: #cfe2ff;
//           text-align: center;
//           font-weight: bold;
//           font-size: 18px;
//           padding: 6px 0;
//           border: 1px solid #000;
//           margin: 6px 0;
//           letter-spacing: 1px;
//         ">
//           Quotation
//         </div>
//         <table style="border: 1px solid #000; margin: 6px 0; table-layout: fixed;">
//           <tr>
//             <th style="border: 1px solid #000; background: #d9e9ff; font-size: 12px; padding: 4px; width: 40%;">FROM :</th>
//             <th style="border: 1px solid #000; background: #d9e9ff; font-size: 12px; padding: 4px; width: 40%;">TO :</th>
//             <th style="border: 1px solid #000; background: #d9e9ff; font-size: 12px; padding: 4px; width: 20%;">DETAILS :</th>
//           </tr>
//           <tr>
//             <td style="border: 1px solid #000; font-size: 12px; padding: 5px; line-height: 1.4;">
//               <b>${getUserData()?.company_info?.company_name || 'Company Name'}</b><br/>
//               ${getUserData()?.name || 'Owner Name'}<br/>
//               ${getUserData()?.company_info?.land_mark || '-'}<br/>
//               <b>Phone:</b> ${getUserData()?.mobile || 'N/A'}<br/>
//               <b>GSTIN:</b> ${getUserData()?.company_info?.gst_number || 'N/A'}<br/>
//               Dist: ${getUserData()?.company_info?.Dist || '-'}<br/>
//               Tal: ${getUserData()?.company_info?.Tal || '-'}<br/>
//               Email: ${getUserData()?.company_info?.email_id || '-'}
//             </td>
//             <td style="border: 1px solid #000; font-size: 12px; padding: 5px; line-height: 1.4;">
//               <b>Customer Name:</b> ${formData.customer?.name || 'Customer Name'}<br/>
//               <b>Site:</b> ${formData.project_name || 'Project Name'}<br/>
//               ${formData.customer?.address || 'Customer Address'}<br/>
//               <b>Phone:</b> ${formData.customer?.mobile || 'N/A'}<br/>
//               <b>GSTIN:</b> ${formData.gst_number || '-'}<br/>
//               <b>PAN:</b> ${formData.pan_number || '-'}
//             </td>
//             <td style="border: 1px solid #000; font-size: 12px; padding: 5px; line-height: 1.4;">
//               <b>Invoice No:</b> ${invoiceNumber}<br/>
//               <b>Invoice Date:</b> ${formData.date}<br/>
//               <b>Reference ID:</b> ${formData.ref_id || '-'}<br/>
//               <b>PO Number:</b> ${formData.po_number || '-'}
//             </td>
//           </tr>
//         </table>
//         ` : ''}
        
//         <!-- Items Table -->
//         <table class="details-table" style="margin-top: 8px;${itemsPage.length === 0 ? ' display: none;' : ''}">
//           <thead>
//             <tr>
//               <th style="width: ${showRowGST ? '5%' : '6%'}; font-size: 11px;">${labels.serialNo}</th>
//               <th style="width: ${showRowGST ? '30%' : '70%'}; font-size: 11px;">${labels.workType}</th>
//               <th style="border: 1px solid #000; background: #d9e9ff; font-size: 11px; padding: 6px; width: 30%;">${labels.scopeOfWork}</th>
//               <th style="width: ${showRowGST ? '8%' : '10%'}; font-size: 11px;">Unit</th>
//               <th style="width: ${showRowGST ? '7%' : '10%'}; font-size: 11px;">Qty</th>
//               <th style="width: ${showRowGST ? '10%' : '18%'}; font-size: 11px;">${labels.price}</th>
//               ${showRowGST ? `
//                 <th style="width: 12%; font-size: 11px;">${labels.baseAmount}</th>
//                 <th style="width: 8%; font-size: 11px;">${labels.gstPercent}</th>
//                 <th style="width: 12%; font-size: 11px;">${labels.cgst}</th>
//                 <th style="width: 12%; font-size: 11px;">${labels.sgst}</th>
//               ` : ''}
//               <th style="width: ${showRowGST ? '12%' : '18%'}; font-size: 11px;">${labels.total}</th>
//             </tr>
//           </thead>
//           <tbody>
//             ${itemsPage.map((item) => {
//               const cgstPercent = item.gst_percent ? item.gst_percent / 2 : 0;
//               const sgstPercent = item.gst_percent ? item.gst_percent / 2 : 0;
//               return `
//               <tr>
//                 <td class="center" style="width: ${showRowGST ? '4%' : '5%'}; font-size: 11px;">${item.originalIndex + 1}</td>
//                 <td style="width: ${showRowGST ? '22%' : '40%'}; font-size: 11px;">${item.work_type || ''}</td>
//                 <td class="center" style="width: ${showRowGST ? '5%' : '8%'}; font-size: 11px;">${item.uom || ''}</td>
//                 <td class="center" style="width: ${showRowGST ? '5%' : '8%'}; font-size: 11px;">${item.qty || 0}</td>
//                 <td class="right" style="width: ${showRowGST ? '10%' : '15%'}; font-size: 11px;">₹${Number(item.price || 0).toFixed(2)}</td>
//                 ${showRowGST ? `
//                   <td class="right" style="width: 10%; font-size: 11px;">₹${Number((item.qty * item.price) || 0).toFixed(2)}</td>
//                   <td class="center" style="width: 5%; font-size: 11px;">${item.gst_percent ? item.gst_percent + '%' : '-'}</td>
//                   <td class="right" style="width: 10%; font-size: 11px;">${item.cgst_amount > 0 ? '₹' + Number(item.cgst_amount).toFixed(2) + ' (' + cgstPercent + '%)' : '-'}</td>
//                   <td class="right" style="width: 10%; font-size: 11px;">${item.sgst_amount > 0 ? '₹' + Number(item.sgst_amount).toFixed(2) + ' (' + sgstPercent + '%)' : '-'}</td>
//                 ` : ''}
//                 <td class="right" style="width: ${showRowGST ? '19%' : '24%'}; font-size: 11px;">₹${Number(item.total_price || 0).toFixed(2)}</td>
//               </tr>`;
//             }).join('')}
            
//             ${isLastInvoicePage && items.length > 0 ? `
//               <tr style="background: #fff3cd; font-weight: bold;">
//                 <td colspan="${showRowGST ? '5' : '4'}" class="right" style="font-size: 12px; padding: 6px;">Total:</td>
//                 ${showRowGST ? `<td class="right" style="font-size: 12px;">₹${items.reduce((sum, item) => sum + ((item.qty * item.price) || 0), 0).toFixed(2)}</td>` : ''}
//                 ${showRowGST ? `<td class="center" style="font-size: 12px;">-</td>` : ''}
//                 ${showRowGST ? `<td class="right" style="font-size: 12px;">₹${items.reduce((sum, item) => sum + (item.cgst_amount || 0), 0).toFixed(2)}</td>` : ''}
//                 ${showRowGST ? `<td class="right" style="font-size: 12px;">₹${items.reduce((sum, item) => sum + (item.sgst_amount || 0), 0).toFixed(2)}</td>` : ''}
//                 <td class="right" style="font-size: 12px;">₹${items.reduce((sum, item) => sum + (item.total_price || 0), 0).toFixed(2)}</td>
//               </tr>
//             ` : ''}
//           </tbody>
//         </table>
        
//         ${isLastInvoicePage ? `
//         <!-- Summary Section -->
//         <div>
//           ${showGlobalGST ? `
//             <table class="summary" style="margin-top: 8px;">
//               <tr>
//                 <th colspan="2" style="font-size: 12px; background: #d9e9ff; text-align: center;">${labels.gstDetails}</th>
//               </tr>
//               <tr>
//                 <th style="font-size: 12px;">${labels.taxableAmount}</th>
//                 <td class="right" style="font-size: 12px;">₹${(() => {
//                   const totalAfterRowGST = items.reduce((sum, item) => sum + (item.total_price || 0), 0);
//                   return Number(totalAfterRowGST).toFixed(2);
//                 })()}</td>
//               </tr>
//               ${Number(formData.cgst || 0) > 0 ? `
//               <tr>
//                 <th style="font-size: 12px;">${labels.cgst} (${formData.cgstPercentage || (Number(formData.gst || 0) / 2)}%)</th>
//                 <td class="right" style="font-size: 12px;">₹${Number(formData.cgst || 0).toFixed(2)}</td>
//               </tr>` : ''}
//               ${Number(formData.sgst || 0) > 0 ? `
//               <tr>
//                 <th style="font-size: 12px;">${labels.sgst} (${formData.sgstPercentage || (Number(formData.gst || 0) / 2)}%)</th>
//                 <td class="right" style="font-size: 12px;">₹${Number(formData.sgst || 0).toFixed(2)}</td>
//               </tr>` : ''}
//               ${Number(formData.igst || 0) > 0 ? `
//               <tr>
//                 <th style="font-size: 12px;">IGST (${formData.igstPercentage || Number(formData.gst || 0)}%)</th>
//                 <td class="right" style="font-size: 12px;">₹${Number(formData.igst || 0).toFixed(2)}</td>
//               </tr>` : ''}
//               <tr style="background: #e8f5e9;">
//                 <th style="font-size: 12px;">Total GST Amount</th>
//                 <td class="right" style="font-size: 12px;"><strong>₹${(Number(formData.cgst || 0) + Number(formData.sgst || 0) + Number(formData.igst || 0)).toFixed(2)}</strong></td>
//               </tr>
//             </table>
//           ` : ''}
          
//           ${formData.discount > 0 ? `
//           <table class="summary" style="margin-top: 8px;">
//             <tr>
//               <th style="font-size: 12px;">Discount</th>
//               <td class="right" style="font-size: 12px;">₹${Number(formData.discount || 0).toFixed(2)}</td>
//             </tr>
//           </table>
//           ` : ''}
          
//           <table class="summary" style="margin-top: 8px;">
//             <tr style="background: #fff3cd;">
//               <th style="font-size: 12px;">${labels.grandTotal}</th>
//               <td class="right" style="font-size: 12px;"><strong>₹${Number(finalAmount || 0).toFixed(2)}</strong></td>
//             </tr>
//             <tr>
//               <th style="font-size: 12px;">${labels.amountPaid}</th>
//               <td class="right" style="font-size: 12px;">₹${Number(formData.amountPaid || 0).toFixed(2)}</td>
//             </tr>
//             <tr style="background: #f8d7da;">
//               <th style="vertical-align: top; font-size: 12px;">
//                 ${labels.amountRemaining}<br />
//                 <span style="font-weight: normal; font-size: 11px;">
//                   ${labels.amountInWords} ${totalAmountWords} ${labels.only}
//                 </span>
//               </th>
//               <td class="right" style="vertical-align: top; font-size: 12px;">
//                 <strong>₹${Number(balanceAmount || 0).toFixed(2)}</strong>
//               </td>
//             </tr>
//           </table>
//         </div>
//         ` : ""}
        
//         </div>
        
//         <div class="foot">
//           ${labels.footerNote}
//         </div>
//         <div class="footer">
//           <div class="footer-content">
//             <div class="footer-item">
//               <span>✉️</span>
//               <span>deshmukhinfra@gmail.com</span>
//             </div>
//             <div class="footer-item">
//               <span>🌐</span>
//               <span>www.deshmukhinfrasolutions.com</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     `;
//   }
    
//   // ===== TERMS & CONDITIONS PAGE =====
//   if (hasTermsPage) {
//     pagesHtml += `
//     <div class="page-spacer"></div>
//     <div class="invoice-box">
//       <div class="content-wrapper">
//         <table class="company-header" style="width: 100%; margin-bottom: 5px;">
//           <tr>
//             <td style="width: 70%; vertical-align: top;">
//               <div style="font-size: 22px; font-weight: bold; line-height: 1.2;">
//                 ${getUserData()?.company_info?.company_name || 'Company Name'}
//               </div>
//               <div style="font-size: 12px; margin-top: 2px;">
//                 ${getUserData()?.company_info?.land_mark || '-'}
//               </div>
//               <div style="font-size: 12px; margin-top: 3px;">
//                 <b>Phone:</b> ${getUserData()?.company_info?.phone_no || '-'}
//               </div>
//             </td>
//             <td style="width: 30%; text-align: right; vertical-align: top;">
//               <img
//                 src='${host}/img/${getUserData()?.company_info?.logo}'
//                 alt="Company Logo"
//                 style="width: 75px; height: 75px; object-fit: contain; border: 1px solid #ccc; border-radius: 5px;"
//               />
//             </td>
//           </tr>
//         </table>
//         <hr style="border: 1px solid black; margin: 3px 0;" />
        
//         ${formData.note ? `
//         <div class="terms-section">
//           <h3>Notes</h3>
//           <div class="terms-content">${formData.note}</div>
//         </div>
//         ` : ''}
        
//         ${formData.payment_terms ? `
//         <div class="terms-section">
//           <h3>Payment Terms</h3>
//           <div class="terms-content">${formData.payment_terms}</div>
//         </div>
//         ` : ''}
        
//         ${formData.terms_and_conditions ? `
//         <div class="terms-section">
//           <h3>Terms & Conditions</h3>
//           <div class="terms-content">${formData.terms_and_conditions}</div>
//         </div>
//         ` : ''}
//       </div>
      
//       <div class="footer">
//         <div class="footer-content">
//           <div class="footer-item">
//             <span>✉️</span>
//             <span>deshmukhinfra@gmail.com</span>
//           </div>
//           <div class="footer-item">
//             <span>🌐</span>
//             <span>www.deshmukhinfrasolutions.com</span>
//           </div>
//         </div>
//       </div>
//     </div>
//     `;
//   }
  
//   return pagesHtml;
// })()}
// </body>
// </html>
// `;

//   const opt = {
//     margin: [10, 10, 10, 10],
//     filename: `${invoiceNumber}_${customerName}.pdf`,
//     image: { type: 'jpeg', quality: 0.98 },
//     html2canvas: { 
//       scale: 2, 
//       useCORS: true,
//       scrollX: 0,
//       scrollY: 0,
//       windowWidth: 794,
//       letterRendering: true 
//     },
//     jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
//   }

//   const pdfInstance = html2pdf().set(opt).from(htmlContent)

//   if (mode === 'blob') {
//     return pdfInstance.outputPdf('blob')
//   } else if (mode === 'save') {
//     return pdfInstance.save()
//   }
// }

// function UnifiedInvoicePdf() {
//   const [selectedLanguage, setSelectedLanguage] = useState('english')

//   const sampleFormData = {
//     project_name: 'Sample Project',
//     customer_id: 1,
//     customer: {
//       name: 'Shreya G',
//       address: 'Karvenagar, Pune',
//       mobile: '1234567890',
//     },
//     date: '2024-12-31',
//     InvoiceStatus: 'Delivered Order',
//     InvoiceType: 3,
//     DeliveryDate: '2025-01-01',
//     lat: 'Sample Address Line',
//     items: Array.from({ length: 28 }, (_, i) => ({
//       id: i + 1,
//       work_type: `Work Item ${String.fromCharCode(65 + (i % 26))} - ${i + 1}`,
//       uom: 'Nos',
//       qty: Math.floor(Math.random() * 100) + 1,
//       price: Math.random() * 1000,
//       total_price: Math.random() * 1000,
//       gst_percent: i % 2 === 0 ? 12 : 18,
//       cgst_amount: Math.random() * 50,
//       sgst_amount: Math.random() * 50,
//     })),
//     totalAmount: 400,
//     discount: 10,
//     finalAmount: 360,
//     amountPaid: 300,
//     cgst: 18,
//     sgst: 18,
//     paymentMode: 'Online',
//     note: 'This is a sample note for testing purposes.',
//     payment_terms: 'Payment should be made within 30 days of invoice date.',
//     terms_and_conditions: 'All disputes subject to Pune jurisdiction only.',
//   }

//   const totalAmountWords = 'Three Hundred and Sixty'

//   const handleDownload = () => {
//     generateMultiLanguagePDF(
//       360,
//       'INV-001',
//       sampleFormData.customer.name,
//       sampleFormData,
//       60,
//       totalAmountWords,
//       selectedLanguage,
//       'save'
//     )
//   }

//   return (
//     <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
//       <h2>✅ Perfect Invoice PDF - Zero Row Splits</h2>
      
//       <button
//         onClick={handleDownload}
//         style={{
//           padding: '12px 24px',
//           fontSize: '16px',
//           backgroundColor: '#4CAF50',
//           color: 'white',
//           border: 'none',
//           borderRadius: '5px',
//           cursor: 'pointer',
//           marginTop: '20px'
//         }}
//       >
//         Download Perfect PDF
//       </button>

//       <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e8f5e9', borderRadius: '5px' }}>
//         <h3>✅ Improvements:</h3>
//         <ul style={{ lineHeight: '1.8' }}>
//           <li>✅ <strong>DOM-based measurements</strong> - Actual pixel heights measured</li>
//           <li>✅ <strong>Zero row splits</strong> - Complete rows only, never half-cut</li>
//           <li>✅ <strong>Smart summary placement</strong> - Always fits on last page</li>
//           <li>✅ <strong>Accurate pagination</strong> - Each element measured precisely</li>
//           <li>✅ <strong>Professional layout</strong> - Proper spacing and alignment</li>
//           <li>✅ <strong>No blank pages</strong> - Content flows perfectly</li>
//         </ul>
//       </div>

//       <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '5px' }}>
//         <h3>🎯 How it works:</h3>
//         <ol style={{ lineHeight: '1.8' }}>
//           <li>Creates temporary DOM elements to measure actual heights</li>
//           <li>Calculates available space on each page</li>
//           <li>Fits complete rows only - moves to next page if needed</li>
//           <li>Ensures summary section always fits on last page</li>
//           <li>Cleans up temporary elements after measurement</li>
//         </ol>
//       </div>
//     </div>
//   )
// }

// export default UnifiedInvoicePdf



















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
  if (!text) return '—';
  const points = text
    .split(/[\n•,|.]+/)
    .map(t => t.trim())
    .filter(Boolean);
  if (!points.length) return '—';
  return points
    .map((p) => `• ${p}`)
    .join('\n_______________________\n');
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

const getDocumentTitle = () => {
    const type = Number(formData.invoiceType);
    
    switch (type) {
      case 1:  return 'Quotation';
      case 2:  return 'Work Order';
     
      default: return 'Document';           // fallback
    }
  };

  const documentTitle = getDocumentTitle();

console.log(documentTitle);


  const logoUrl = company.logo ? `${host}/img/${company.logo}` : null;
  
  // Load logo once at the beginning
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
        console.warn("Failed to add logo to PDF", e);
      }
    }

    cy += 26;
    // Horizontal line
    doc.setLineWidth(0.8);
    doc.setDrawColor(0, 0, 0);
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
      doc.text(documentTitle, pageWidth / 2, cy + 19, { align: 'center' });
      cy += 34;

      // From / To / Details table
      doc.autoTable({
        startY: cy,
        head: [['FROM', 'TO', 'DETAILS']],
        body: [
          [
            `${companyName}\n${companyAddress}\nPhone: ${user.mobile || '—'}\nGSTIN: ${companyGST}\nDist: ${companyDist}\nTal: ${companyTal}\nEmail: ${companyEmail}`,
            `Customer: ${customer.name || '—'}\nSite: ${formData.project_name || '—'}\n${customer.address || '—'}\nPhone: ${customer.mobile || '—'}\nGSTIN: ${formData.gst_number || '—'}\nPAN: ${formData.pan_number || '—'}`,
            `Quotation No: ${invoiceNumber}\nDate: ${formData.date || '—'}\nReference: ${formData.ref_id || '—'}\nPO No: ${formData.po_number || '—'}`,
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
    doc.setTextColor(0, 0, 0);
    doc.text(
      'www.deshmukhinfrasolutions.com',
      pageWidth - margin - 5,
      pageHeight - 18,
      { align: 'right' }
    );
  };

  /* ---------- PAGE 1 (full header with banner and details) ---------- */
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

  // Grand Total row
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

  /* ---------- ITEMS TABLE with automatic header on new pages ---------- */
  doc.autoTable({
    startY: y,
    head: [headRow],
    body: tableBody,
    theme: 'grid',
    tableWidth: contentWidth,
    margin: { 
      left: margin, 
      right: margin,
      top: 140,  // Space for header on continuation pages
      bottom: 80  // Space for footer
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
    showHead: 'everyPage',  // Show table header on every page
    rowPageBreak: 'avoid',  // Try to keep rows together
    didDrawPage: (data) => {
      // Draw company header on pages 2, 3, 4... (not page 1, it already has full header)
      if (data.pageNumber > 1) {
        const currentPage = doc.internal.getCurrentPageInfo().pageNumber;
        doc.setPage(currentPage);
        drawCompanyHeader(false); // Only company info, logo, and line (no banner/details)
      }
      
      // Draw footer on every page
      drawFooter();
      
      // Optional: Add page number
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
  if (hasTermsPage) {
    doc.addPage();
    y = drawCompanyHeader(false); // Company header without banner

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
      lines.forEach((line) => {
        const wrapped = doc.splitTextToSize(line, contentWidth);
        doc.text(wrapped, margin, y);
        y += wrapped.length * 13;
      });
      y += 12;
    };

    printBlock('Notes', formData.note);
    printBlock('Payment Terms', formData.payment_terms);
    printBlock('Terms & Conditions', formData.terms_and_conditions);

    drawFooter();
  }

  /* ---------- OUTPUT ---------- */
  const fileName = `Quotation_${invoiceNumber}_${(customerName || 'Customer').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

  if (mode === 'save') doc.save(fileName);
  else if (mode === 'blob') return doc.output('blob');
  else if (mode === 'open') {
    const dataUri = doc.output('datauristring');
    const win = window.open();
    win.document.write(`<iframe width="100%" height="100%" src="${dataUri}"></iframe>`);
  }

  return doc;
};