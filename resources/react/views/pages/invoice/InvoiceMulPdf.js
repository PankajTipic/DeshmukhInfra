// import React, { useState } from 'react'
// import html2pdf from 'html2pdf.js'
// import { getUserData } from '../../../util/session'

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
//     },
//   },
//   bengali: {
//     name: 'বাংলা',
//     font: "'Noto Sans Bengali', Arial, sans-serif",
//     labels: {
//       projectName: 'প্রকল্পের নাম:',
//       customerName: 'গ্রাহকের নাম:',
//       customerAddress: 'গ্রাহকের ঠিকানা:',
//       mobile: 'মোবাইল নম্বর:',
//       invoiceNumber: 'ইনভয়েস নম্বর:',
//       invoiceDate: 'ইনভয়েসের তারিখ:',
//       deliveryDate: 'ডেলিভারির তারিখ:',
//       works: 'কাজের বিবরণ',
//       serialNo: 'ক্রমিক নং',
//       workType: 'কাজের ধরন',
//       price: 'মূল্য (₹)',
//       quantity: 'পরিমাণ',
//       total: 'মোট (₹)',
//       grandTotal: 'মোট',
//       totalAfterDiscount: 'ছাড়ের পরে মোট',
//       paymentDetails: 'পেমেন্টের বিবরণ',
//       amountPaid: 'প্রদত্ত অর্থ:',
//       amountRemaining: 'বকেয়া অর্থ:',
//       paymentMode: 'পেমেন্টের মাধ্যম:',
//       qrCode: 'কিউআর কোড',
//       scanToPay: 'পেমেন্টের জন্য স্ক্যান করুন',
//       amountInWords: 'কথায় অর্থ:',
//       bankDetails: 'ব্যাংকের বিবরণ',
//       bank: 'ব্যাংক:',
//       accountNo: 'অ্যাকাউন্ট নম্বর:',
//       ifscCode: 'IFSC কোড:',
//       eSignature: 'ই-স্বাক্ষর',
//       authorizedSignature: 'অনুমোদিত স্বাক্ষর',
//       footerNote: 'এই চালানটি কম্পিউটার দ্বারা তৈরি এবং অনুমোদিত।',
//       only: 'টাকা মাত্র',
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
//       grandTotal: 'Total',
//       totalAfterDiscount: 'Total after discount',
//       paymentDetails: 'Payment Details',
//       amountPaid: 'Amount Paid:',
//       amountRemaining: 'Amount Remaining:',
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
//     },
//   },
//   tamil: {
//     name: 'தமிழ்',
//     font: "'Noto Sans Tamil', Arial, sans-serif",
//     labels: {
//       projectName: 'திட்டப் பெயர்:',
//       customerName: 'வாடிக்கையாளர் பெயர்:',
//       customerAddress: 'வாடிக்கையாளர் முகவரி:',
//       mobile: 'கைபேசி எண்:',
//       invoiceNumber: 'விலைப்பட்டியல் எண்:',
//       invoiceDate: 'விலைப்பட்டியல் தேதி:',
//       deliveryDate: 'விநியோக தேதி:',
//       works: 'வேலை விவரங்கள்',
//       serialNo: 'வ.எண்.',
//       workType: 'வேலை வகை',
//       price: 'விலை (₹)',
//       quantity: 'அளவு',
//       total: 'மொத்தம் (₹)',
//       grandTotal: 'மொத்தம்',
//       totalAfterDiscount: 'தள்ளுபடிக்குப் பிறகு மொத்தம்',
//       paymentDetails: 'கட்டணம் விவரங்கள்',
//       amountPaid: 'செலுத்திய தொகை:',
//       amountRemaining: 'மீதமுள்ள தொகை:',
//       paymentMode: 'கட்டணம் முறை:',
//       qrCode: 'QR கோட்',
//       scanToPay: 'கட்டணம் செலுத்த ஸ்கேன் செய்யவும்',
//       amountInWords: 'வார்த்தைகளில் தொகை:',
//       bankDetails: 'வங்கி விவரங்கள்',
//       bank: 'வங்கி:',
//       accountNo: 'கணக்கு எண்:',
//       ifscCode: 'IFSC கோட்:',
//       eSignature: 'இ-கையொப்பம்',
//       authorizedSignature: 'அங்கீகரிக்கப்பட்ட கையொப்பம்',
//       footerNote: 'இந்த விலைப்பட்டியல் கணினியால் உருவாக்கப்பட்டது மற்றும் அங்கீகரிக்கப்பட்டது.',
//       only: 'மட்டும்',
//     },
//   },
// }

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

 
//   // Map numeric type → display text
// function getInvoiceTypeText(type) {
//   switch (Number(type)) {
//     case 1: return "Quotation";
//     case 2: return "Proforma Invoice";
//     case 3: return "Invoice";
//     default: return "___";
//   }
// }



//   const MAX_ROWS = 14;

//     // ✅ Make sure formData.items is an array
//   const items = Array.isArray(formData.items) ? formData.items : [];

//   // ✅ Split into two groups before using inside the template
//   const itemsPage1 = items.slice(0, MAX_ROWS);
//   const itemsPage2 = items.slice(MAX_ROWS);

//   const user = getUserData();
//   console.log(user);

  
  




// const htmlContent = `
// <html>
// <head>
//   <style>
//     body { font-family: Arial, sans-serif; font-size: 12px; margin:0; padding:0; }
//     .invoice-box { width:100%; padding:20px; border:1px solid #000; }
//     table { width:100%; border-collapse:collapse; }
//     table td, table th { padding:6px; vertical-align:top; }
//     .details-table th, .details-table td { border:1px solid #000; }
//     .details-table th { background:#d9e9ff; font-weight:bold; text-align:center; }
//     .summary td, .summary th { border:1px solid #000; padding:6px; }
//     .summary th { background:#d9e9ff; font-weight:bold; text-align:right; }
//     .right { text-align:right; }
//     .center { text-align:center; }
//     .page-break { page-break-before: always; }

//     /* ✅ Prevent last section from splitting across pages */
//     .no-split {
//       page-break-inside: avoid;
//       break-inside: avoid;
//     }
//   </style>
// </head>
// <body>

// ${(() => {
//   const MAX_ROWS = 19;  // ✅ Show only 23 rows per page
//   const items = Array.isArray(formData.items) ? formData.items : [];

//   let pagesHtml = "";

//   for (let page = 0; page < Math.ceil(items.length / MAX_ROWS); page++) {
//     const start = page * MAX_ROWS;
//     const end = start + MAX_ROWS;
//     const itemsPage = items.slice(start, end);

//     pagesHtml += `
//       <div class="invoice-box ${page > 0 ? 'page-break' : ''}">
        
//         ${page === 0 ? `
//         <!-- ===== Header on first page ===== -->
//         <table class="company-header">
//           <tr>
//             <td style="width:70%; vertical-align:top;">
//               <div style="display:flex; align-items:center;">
//                 <img src="your-logo.png" style="width:60px;height:60px;margin-right:10px;" />
//                 <div>
//                   <div style="font-size:18px; font-weight:bold;">
//                     ${getUserData()?.company_info?.company_name || 'Company Name'}
//                   </div>
//                   <div style="font-size:12px;">
//                     ${getUserData()?.company_info?.land_mark || '-'}
//                   </div>
//                 </div>
//               </div>
//             </td>
//             <td style="text-align:right; font-size:12px;">
//               <div><b>Name:</b> ${getUserData()?.company_info?.name || 'Owner Name'}</div>
//               <div><b>Phone:</b>  ${getUserData()?.company_info?.phone_no || '-'}</div>
//               <div><b>Email:</b> ${getUserData()?.company_info?.email_id || '-'}</div>
              
//             </td>
//           </tr>
//         </table>

//         <!-- ✅ Black line -->
//         <hr style="border:1px solid black; margin:4px 0;" />

//       <div style="
//   background-color:#cfe2ff;   /* light blue */
//   text-align:center;
//   font-weight:bold;
//   font-size:20px;
//   padding:8px 0;
//   border:1px solid #000;
//   margin:10px 0;
//   letter-spacing:1px;
// ">
//   ${getInvoiceTypeText(formData.invoiceType)}
// </div>


//         <!-- Buyer / Consignee / Invoice details -->
//         <table style="border:1px solid #000;margin:10px 0;">
//           <tr>
//             <th style="border:1px solid #000;background:#d9e9ff;">Details of Buyer | Billed to:</th>
//             <th style="border:1px solid #000;background:#d9e9ff;">Details of Consignee | Shipped to:</th>
//             <th style="border:1px solid #000;background:#d9e9ff;">Invoice Details</th>
//           </tr>
//           <tr>
//             <td style="border:1px solid #000;">
//               <b>Customer Name:</b>${formData.customer.name || 'Customer Name'}<br/>
//               <b>Site:</b>${formData.project_name || 'Project Name'}</br>
//               ${formData.customer.address || 'Customer Address'}<br/>
//               <b>Phone:</b> ${formData.customer.mobile || 'N/A'}<br/>
//               <b>GSTIN:</b> ${formData.customer.gstin || '-'}<br/>
//               <b>PAN:</b> ${formData.customer.pan || '-'}
//             </td>
//             <td style="border:1px solid #000;">
//               <b>${getUserData()?.company_info?.company_name || 'Company Name'}</b><br/>
//              ${getUserData()?.name || 'Owner Name'}<br/>
//                ${getUserData()?.company_info?.land_mark || '-'}<br/>
//               <b>Phone:</b> ${getUserData()?.mobile || 'N/A'}<br/>
//               <b>GSTIN:</b> ${getUserData()?.gst ||  'N/A'}<br/>
//                Dist: ${getUserData()?.company_info?.Dist || '-'}<br/>
//                Tal: ${getUserData()?.company_info?.Tal || '-'}
//                Email : ${getUserData()?.company_info?.email_id || '-'}
              
//             </td>
//             <td style="border:1px solid #000;">
//               <b>Invoice No:</b> ${invoiceNumber}<br/>
//               <b>Invoice Date:</b> ${formData.date}
//             </td>
//           </tr>
//         </table>
//         ` : ""}

//         <!-- Item Table -->
//         <table class="details-table">
//           ${page === 0 ? `
//           <thead>
//             <tr>
//               <th>${labels.serialNo}</th>
//               <th>${labels.workType}</th>
//               <th>${labels.quantity}</th>
//               <th>${labels.price}</th>
//               <th>${labels.total}</th>
//             </tr>
//           </thead>` : ""}
//           <tbody>
//             ${itemsPage.map((item,i)=>`
//               <tr>
//                 <td class="center">${i+1+start}</td>
//                 <td>${item.work_type || ''}</td>
//                 <td class="center">${item.qty || 0}</td>
//                 <td class="right">₹${Number(item.price||0).toFixed(2)}</td>
//                 <td class="right">₹${Number(item.total_price||0).toFixed(2)}</td>
//               </tr>`).join('')}
//           </tbody>
//         </table>

//       ${page === Math.ceil(items.length / MAX_ROWS) - 1 ? `
//     <!-- ===== Summary Section (only last page) ===== -->
//     <div class="no-split">
//       <table class="summary" style="margin-top:10px;">
//         <tr>
//           <th>${labels.grandTotal}</th>
//           <td class="right">₹${Number(formData.totalAmount||0).toFixed(2)}</td>
//         </tr>

//         <tr>
//           <th>CGST</th>
//           <td class="right">₹${Number(formData.cgst||0).toFixed(2)}</td>
//         </tr>
//         <tr>
//           <th>SGST</th>
//           <td class="right">₹${Number(formData.sgst||0).toFixed(2)}</td>
//         </tr>
//         <tr>
//           <th>GST</th>
//           <td class="right">₹${Number(formData.gst||0).toFixed(2)}</td>
//         </tr>

//         ${formData.discount ? `
//         <tr>
//           <th>${labels.totalAfterDiscount}</th>
//           <td class="right">₹${Number(finalAmount||0).toFixed(2)}</td>
//         </tr>` : ''}

//         <tr>
//           <th>${labels.amountPaid}</th>
//           <td class="right">₹${Number(formData.amountPaid||0).toFixed(2)}</td>
//         </tr>
//         <tr>
//           <th>${labels.amountRemaining}</th>
//           <td class="right">₹${Number(balanceAmount||0).toFixed(2)}</td>
//         </tr>
//       </table>

//       <!-- Bank & Signature -->
//       <table style="margin-top:15px;">
//         <tr>
//           <td style="width:60%">
//             <div class="bold">${labels.bankDetails}</div>
//             ${labels.bank} ${getUserData()?.company_info?.bank_name || ''}<br/>
//             ${labels.accountNo} ${getUserData()?.company_info?.account_no || ''}<br/>
//             ${labels.ifscCode} ${getUserData()?.company_info?.IFSC_code || ''}
//           </td>
//           <td class="right">
//             <div class="bold">${labels.eSignature}</div>
//             <img src="${getUserData()?.company_info?.sign ? 'img/'+getUserData()?.company_info?.sign : ''}" style="width:120px;height:40px;"/><br/>
//             ${labels.authorizedSignature}
//           </td>
//         </tr>
//       </table>

//       <div class="footer">
//         ${labels.amountInWords} ${totalAmountWords} ${labels.only}<br/>
//         ${labels.footerNote}
//       </div>
//     </div>



// <!-- ✅ Always add Terms & Conditions page after summary -->
   
   
// <div class="page-break">
//   <!-- ===== Header (same as first page) ===== -->
//   <table class="company-header" style="width:100%; margin-bottom:10px;">
//     <tr>
//       <td style="width:70%; vertical-align:top;">
//         <div style="display:flex; align-items:center;">
//           <img src="your-logo.png" style="width:60px;height:60px;margin-right:10px;" />
//           <div>
//             <div style="font-size:18px; font-weight:bold;">
//               ${getUserData()?.company_info?.company_name || 'Company Name'}
//             </div>
//             <div style="font-size:12px;">
//               ${getUserData()?.company_info?.land_mark || '-'}
//             </div>
//           </div>
//         </div>
//       </td>
//       <td style="text-align:right; font-size:12px;">
//         <div><b>Name:</b> ${getUserData()?.company_info?.name || 'Owner Name'}</div>
//         <div><b>Phone:</b> ${getUserData()?.company_info?.phone_no || '-'}</div>
//         <div><b>Email:</b> ${getUserData()?.company_info?.email_id || '-'}</div>
//       </td>
//     </tr>
//   </table>

//   <hr style="border:1px solid black; margin:4px 0;" />

//   <!-- Notes -->
//   <div style="padding:10px; font-size:13px;">
//     <h3 style="margin-bottom:5px;">Notes</h3>
//     <ul style="margin-top:0; padding-left:20px; line-height:1.5;">
//       <li>Project details and scope of work is considered approx. for ${formData.project_name || 'the project'}.</li>
//     </ul>
//   </div>

//   <!-- Payment Terms -->
//   <div style="padding:10px; font-size:13px;">
//     <h3 style="margin-bottom:5px;">Payment Terms</h3>
//     <ul style="margin-top:0; padding-left:20px; line-height:1.5;">
//       ${
//         (formData.invoice_rules || [])
//           .filter(r => r.rule?.type === "payment")
//           .map(r => `<li>${r.rule?.description || ''}</li>`)
//           .join('')
//       }
//     </ul>
//   </div>

//   <!-- Terms & Conditions -->
//   <div style="padding:10px; font-size:13px;">
//     <h3 style="margin-bottom:5px;">Terms & Conditions</h3>
//     <ul style="margin-top:0; padding-left:20px; line-height:1.5;">
//       ${
//         (formData.invoice_rules || [])
//           .filter(r => r.rule?.type === "term")
//           .map(r => `<li>${r.rule?.description || ''}</li>`)
//           .join('')
//       }
//     </ul>
//   </div>
// </div>





// ` : ""}

//       </div>
//     `;
//   }

//   return pagesHtml;
// })()}

// </body>
// </html>


//   `;

// // const htmlContent = `
// // <html>
// // <head>
// //   <style>
// //     body { font-family: Arial, sans-serif; font-size: 12px; margin:0; padding:0; }
// //     .invoice-box { width:100%; padding:20px; border:1px solid #000; }
// //     table { width:100%; border-collapse:collapse; }
// //     table td, table th { padding:6px; vertical-align:top; }
// //     .details-table th, .details-table td { border:1px solid #000; }
// //     .details-table th { background:#d9e9ff; font-weight:bold; text-align:center; }
// //     .summary td, .summary th { border:1px solid #000; padding:6px; }
// //     .summary th { background:#d9e9ff; font-weight:bold; text-align:right; }
// //     .right { text-align:right; }
// //     .center { text-align:center; }
// //     .page-break { page-break-before: always; }
// //     .no-split { page-break-inside: avoid; break-inside: avoid; }
// //   </style>
// // </head>
// // <body>

// // ${(() => {
// //   const MAX_ROWS = 22;
// //   const items = Array.isArray(formData.items) ? formData.items : [];
// //   let pagesHtml = "";

// //   for (let page = 0; page < Math.ceil(items.length / MAX_ROWS); page++) {
// //     const start = page * MAX_ROWS;
// //     const end = start + MAX_ROWS;
// //     const itemsPage = items.slice(start, end);

// //     pagesHtml += `
// //       <div class="invoice-box ${page > 0 ? 'page-break' : ''}">
        
// //         ${page === 0 ? `
// //         <!-- ===== Header with Project / Company / Invoice ===== -->
// //         <table style="border:1px solid #000;margin-bottom:10px;">
// //           <tr>
// //             <th style="border:1px solid #000;background:#d9e9ff;">Project Information</th>
// //             <th style="border:1px solid #000;background:#d9e9ff;">Company Information</th>
// //             <th style="border:1px solid #000;background:#d9e9ff;">Invoice Details</th>
// //           </tr>
// //           <tr>
// //             <!-- ✅ Project Info -->
// //             <td style="border:1px solid #000;">
// //               <b>Project Name:</b> ${formData.project_name || '-'}<br/>
// //               <b>Customer:</b> ${formData.customer.name || '-'}<br/>
// //               <b>Address:</b> ${formData.customer.address || '-'}<br/>
// //               <b>Mobile:</b> ${formData.customer.mobile || '-'}
// //             </td>

// //             <!-- ✅ Company Info -->
// //             <td style="border:1px solid #000;">
// //               <b>${getUserData()?.company_info?.company_name || 'Company Name'}</b><br/>
// //               Dist: ${getUserData()?.company_info?.Dist || '-'}<br/>
// //               Tal: ${getUserData()?.company_info?.Tal || '-'}<br/>
// //               Landmark: ${getUserData()?.company_info?.land_mark || '-'}<br/>
// //               Phone: ${getUserData()?.company_info?.phone_no || '-'}<br/>
// //               Email: ${getUserData()?.company_info?.email_id || '-'}
// //             </td>

// //             <!-- ✅ Invoice Details -->
// //             <td style="border:1px solid #000;">
// //               <b>Invoice No:</b> ${invoiceNumber}<br/>
// //               <b>Invoice Date:</b> ${formData.date}<br/>
// //               <b>Delivery Date:</b> ${formData.DeliveryDate || '-'}<br/>
// //               <b>App Mode:</b> ${getUserData()?.company_info?.appMode || '-'}
// //             </td>
// //           </tr>
// //         </table>
// //         ` : ""}

// //         <!-- ===== Item Table ===== -->
// //         <table class="details-table">
// //           ${page === 0 ? `
// //           <thead>
// //             <tr>
// //               <th>${labels.serialNo}</th>
// //               <th>${labels.workType}</th>
// //               <th>${labels.quantity}</th>
// //               <th>${labels.price}</th>
// //               <th>${labels.total}</th>
// //             </tr>
// //           </thead>` : ""}
// //           <tbody>
// //             ${itemsPage.map((item,i)=>`
// //               <tr>
// //                 <td class="center">${i+1+start}</td>
// //                 <td>${item.work_type || ''}</td>
// //                 <td class="center">${item.qty || 0}</td>
// //                 <td class="right">₹${Number(item.price||0).toFixed(2)}</td>
// //                 <td class="right">₹${Number(item.total_price||0).toFixed(2)}</td>
// //               </tr>`).join('')}
// //           </tbody>
// //         </table>

// //         ${page === Math.ceil(items.length / MAX_ROWS) - 1 ? `
// //         <!-- ===== Summary on Last Page ===== -->
// //         <div class="no-split">
// //           <table class="summary" style="margin-top:10px;">
// //             <tr>
// //               <th>${labels.grandTotal}</th>
// //               <td class="right">₹${Number(formData.totalAmount||0).toFixed(2)}</td>
// //             </tr>
// //             ${formData.discount ? `
// //             <tr>
// //               <th>${labels.totalAfterDiscount}</th>
// //               <td class="right">₹${Number(finalAmount||0).toFixed(2)}</td>
// //             </tr>` : ''}
// //             <tr>
// //               <th>${labels.amountPaid}</th>
// //               <td class="right">₹${Number(formData.amountPaid||0).toFixed(2)}</td>
// //             </tr>
// //             <tr>
// //               <th>${labels.amountRemaining}</th>
// //               <td class="right">₹${Number(balanceAmount||0).toFixed(2)}</td>
// //             </tr>
// //           </table>

// //           <div style="margin-top:15px;">
// //             <b>${labels.bankDetails}</b><br/>
// //             ${labels.bank} ${getUserData()?.company_info?.bank_name || ''}<br/>
// //             ${labels.accountNo} ${getUserData()?.company_info?.account_no || ''}<br/>
// //             ${labels.ifscCode} ${getUserData()?.company_info?.IFSC_code || ''}
// //           </div>

// //           <div style="text-align:right;margin-top:10px;">
// //             <b>${labels.eSignature}</b><br/>
// //             <img src="${getUserData()?.company_info?.sign ? 'img/'+getUserData()?.company_info?.sign : ''}" style="width:120px;height:40px;"/><br/>
// //             ${labels.authorizedSignature}
// //           </div>

// //           <div style="margin-top:10px;text-align:center;">
// //             ${labels.amountInWords} ${totalAmountWords} ${labels.only}<br/>
// //             ${labels.footerNote}
// //           </div>
// //         </div>
// //         ` : ""}
// //       </div>
// //     `;
// //   }
// //   return pagesHtml;
// // })()}

// // </body>
// // </html>
// // `;





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
//     project_name:
//       selectedLanguage === 'tamil'
//         ? 'மாதிரி திட்டம்'
//         : selectedLanguage === 'bengali'
//         ? 'নমুনা প্রকল্প'
//         : selectedLanguage === 'marathi'
//         ? 'नमुना प्रकल्प'
//         : 'Sample Project',
//     customer_id: 1,
//     customer: {
//       name:
//         selectedLanguage === 'tamil'
//           ? 'ஸ்ரேயா ஜி'
//           : selectedLanguage === 'bengali'
//           ? 'শ্রেয়া জি'
//           : selectedLanguage === 'marathi'
//           ? 'श्रेया ग'
//           : 'Shreya G',
//       address:
//         selectedLanguage === 'tamil'
//           ? 'கார்வேநகர்'
//           : selectedLanguage === 'bengali'
//           ? 'কারভেনগর'
//           : selectedLanguage === 'marathi'
//           ? 'कर्वेनगर'
//           : 'Karvenagar',
//       mobile: '1234567890',
//     },
//     date: '2024-12-31',
//     InvoiceStatus:
//       selectedLanguage === 'tamil'
//         ? 'விநியோகம் முடிந்த ஆர்டர்'
//         : selectedLanguage === 'bengali'
//         ? 'বিতরণ সম্পন্ন অর্ডার'
//         : selectedLanguage === 'marathi'
//         ? 'डिलिव्हर्ड ऑर्डर'
//         : 'Delivered Order',
//     InvoiceType: 3,
//     DeliveryDate: '2025-01-01',
//     lat: 'Sample Address Line',
//     items: [
//       {
//         work_type:
//           selectedLanguage === 'tamil'
//             ? 'ஆப்பிள் வேலை'
//             : selectedLanguage === 'bengali'
//             ? 'আপেল কাজ'
//             : selectedLanguage === 'marathi'
//             ? 'सफरचंद काम'
//             : 'Apple Work',
//         price: 100,
//         qty: 2,
//         total_price: 200,
//       },
//       {
//         work_type:
//           selectedLanguage === 'tamil'
//             ? 'வாழைப்பழம் வேலை'
//             : selectedLanguage === 'bengali'
//             ? 'কলা কাজ'
//             : selectedLanguage === 'marathi'
//             ? 'केळी काम'
//             : 'Banana Work',
//         price: 50,
//         qty: 4,
//         total_price: 200,
//       },
//     ],
//     totalAmount: 400,
//     discount: 10,
//     finalAmount: 360,
//     amountPaid: 300,
//     paymentMode:
//       selectedLanguage === 'tamil'
//         ? 'ஆன்லைன்'
//         : selectedLanguage === 'bengali'
//         ? 'অনলাইন'
//         : selectedLanguage === 'marathi'
//         ? 'ऑनलाइन'
//         : 'Online',
//   }

//   const totalAmountWords =
//     selectedLanguage === 'tamil'
//       ? 'முன்னூற்று அறுபது'
//       : selectedLanguage === 'bengali'
//       ? 'তিনশত ষাট'
//       : selectedLanguage === 'marathi'
//       ? 'तीनশে साठ'
//       : 'Three Hundred and Sixty'

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
//       <h2>Multi-Language Invoice PDF Generator (Full Page)</h2>

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




import React, { useState } from 'react'
import html2pdf from 'html2pdf.js'
import { getUserData } from '../../../util/session'
import { host } from '../../../util/constants'
// import logo from '../../../../../public/bill/'

// Language configurations
const LANGUAGES = {
  marathi: {
    name: 'मराठी',
    font: 'Arial, sans-serif',
    labels: {
      projectName: 'प्रकल्पाचे नाव:',
      customerName: 'ग्राहकाचे नाव:',
      customerAddress: 'ग्राहकाचा पत्ता:',
      mobile: 'मोबाईल क्रमांक:',
      invoiceNumber: 'चलन क्रमांक:',
      invoiceDate: 'चलन तारीख:',
      deliveryDate: 'डिलीव्हरी तारीख:',
      works: 'कामाचे तपशील',
      serialNo: 'अनुक्रमांक',
      workType: 'कामाचे प्रकार',
      price: 'किंमत (₹)',
      quantity: 'प्रमाण',
      total: 'एकूण (₹)',
      grandTotal: 'एकूण',
      totalAfterDiscount: 'सूट नंतरची एकूण',
      paymentDetails: 'पेमेंट तपशील',
      amountPaid: 'रक्कम भरलेली:',
      amountRemaining: 'शिल्लक रक्कम:',
      paymentMode: 'पेमेंट मोड:',
      qrCode: 'QR कोड',
      scanToPay: 'पेमेंटसाठी स्कॅन करा',
      amountInWords: 'रक्कम शब्दांत:',
      bankDetails: 'बँक तपशील',
      bank: 'बँक:',
      accountNo: 'खाते क्रमांक:',
      ifscCode: 'IFSC कोड:',
      eSignature: 'ई-स्वाक्षरी',
      authorizedSignature: 'अधिकृत स्वाक्षरी',
      footerNote: 'हे चलन संगणकाद्वारे तयार केले आहे आणि अधिकृत आहे.',
      only: 'फक्त',
    },
  },
  bengali: {
    name: 'বাংলা',
    font: "'Noto Sans Bengali', Arial, sans-serif",
    labels: {
      projectName: 'প্রকল্পের নাম:',
      customerName: 'গ্রাহকের নাম:',
      customerAddress: 'গ্রাহকের ঠিকানা:',
      mobile: 'মোবাইল নম্বর:',
      invoiceNumber: 'ইনভয়েস নম্বর:',
      invoiceDate: 'ইনভয়েসের তারিখ:',
      deliveryDate: 'ডেলিভারির তারিখ:',
      works: 'কাজের বিবরণ',
      serialNo: 'ক্রমিক নং',
      workType: 'কাজের ধরন',
      price: 'মূল্য (₹)',
      quantity: 'পরিমাণ',
      total: 'মোট (₹)',
      grandTotal: 'মোট',
      totalAfterDiscount: 'ছাড়ের পরে মোট',
      paymentDetails: 'পেমেন্টের বিবরণ',
      amountPaid: 'প্রদত্ত অর্থ:',
      amountRemaining: 'বকেয়া অর্থ:',
      paymentMode: 'পেমেন্টের মাধ্যম:',
      qrCode: 'কিউআর কোড',
      scanToPay: 'পেমেন্টের জন্য স্ক্যান করুন',
      amountInWords: 'কথায় অর্থ:',
      bankDetails: 'ব্যাংকের বিবরণ',
      bank: 'ব্যাংক:',
      accountNo: 'অ্যাকাউন্ট নম্বর:',
      ifscCode: 'IFSC কোড:',
      eSignature: 'ই-স্বাক্ষর',
      authorizedSignature: 'অনুমোদিত স্বাক্ষর',
      footerNote: 'এই চালানটি কম্পিউটার দ্বারা তৈরি এবং অনুমোদিত।',
      only: 'টাকা মাত্র',
    },
  },
  english: {
    name: 'English',
    font: 'Arial, sans-serif',
    labels: {
      projectName: 'Project Name:',
      customerName: 'Customer Name:',
      customerAddress: 'Customer Address:',
      mobile: 'Mobile Number:',
      invoiceNumber: 'Invoice Number:',
      invoiceDate: 'Invoice Date:',
      deliveryDate: 'Delivery Date:',
      works: 'Work Details',
      serialNo: 'Sr. No.',
      workType: 'Work Type',
      price: 'Price (₹)',
      quantity: 'Quantity',
      total: 'Total (₹)',
      grandTotal: 'Total',
      totalAfterDiscount: 'Total after discount',
      paymentDetails: 'Payment Details',
      amountPaid: 'Amount Received:',
      amountRemaining: 'Amount Due:',
      paymentMode: 'Payment Mode:',
      qrCode: 'QR CODE',
      scanToPay: 'Scan to Pay',
      amountInWords: 'Amount in Words:',
      bankDetails: 'Bank Details',
      bank: 'Bank:',
      accountNo: 'Account Number:',
      ifscCode: 'IFSC Code:',
      eSignature: 'E-Signature',
      authorizedSignature: 'Authorized Signature',
      footerNote: 'This invoice is computer generated and authorized.',
      only: 'only',
    },
  },
  tamil: {
    name: 'தமிழ்',
    font: "'Noto Sans Tamil', Arial, sans-serif",
    labels: {
      projectName: 'திட்டப் பெயர்:',
      customerName: 'வாடிக்கையாளர் பெயர்:',
      customerAddress: 'வாடிக்கையாளர் முகவரி:',
      mobile: 'கைபேசி எண்:',
      invoiceNumber: 'விலைப்பட்டியல் எண்:',
      invoiceDate: 'விலைப்பட்டியல் தேதி:',
      deliveryDate: 'விநியோக தேதி:',
      works: 'வேலை விவரங்கள்',
      serialNo: 'வ.எண்.',
      workType: 'வேலை வகை',
      price: 'விலை (₹)',
      quantity: 'அளவு',
      total: 'மொத்தம் (₹)',
      grandTotal: 'மொத்தம்',
      totalAfterDiscount: 'தள்ளுபடிக்குப் பிறகு மொத்தம்',
      paymentDetails: 'கட்டணம் விவரங்கள்',
      amountPaid: 'செலுத்திய தொகை:',
      amountRemaining: 'மீதமுள்ள தொகை:',
      paymentMode: 'கட்டணம் முறை:',
      qrCode: 'QR கோட்',
      scanToPay: 'கட்டணம் செலுத்த ஸ்கேன் செய்யவும்',
      amountInWords: 'வார்த்தைகளில் தொகை:',
      bankDetails: 'வங்கி விவரங்கள்',
      bank: 'வங்கி:',
      accountNo: 'கணக்கு எண்:',
      ifscCode: 'IFSC கோட்:',
      eSignature: 'இ-கையொப்பம்',
      authorizedSignature: 'அங்கீகரிக்கப்பட்ட கையொப்பம்',
      footerNote: 'இந்த விலைப்பட்டியல் கணினியால் உருவாக்கப்பட்டது மற்றும் அங்கீகரிக்கப்பட்டது.',
      only: 'மட்டும்',
    },
  },
}

export const generateMultiLanguagePDF = (
  finalAmount,
  invoiceNumber,
  customerName,
  formData,
  balanceAmount,
  totalAmountWords,
  lang = 'english',
  mode = 'save'
) => {
  const labels = LANGUAGES[lang].labels
  const font = LANGUAGES[lang].font

 
  // Map numeric type → display text
// function getInvoiceTypeText(type) {
//   switch (Number(type)) {
//     case 1: return "Quotation";
//     case 2: return "Proforma Invoice";
//     case 3: return "Invoice";
//     default: return "___";
//   }
// }



  const MAX_ROWS = 19;

    // ✅ Make sure formData.items is an array
  const items = Array.isArray(formData.items) ? formData.items : [];

  // ✅ Split into two groups before using inside the template
  const itemsPage1 = items.slice(0, MAX_ROWS);
  const itemsPage2 = items.slice(MAX_ROWS);

  const user = getUserData();
  console.log(user);

  


// const htmlContent = `
// <html>
// <head>
//   <style>
//     body { font-family: Arial, sans-serif; font-size: 12px; margin:0; padding:0; }
//     .invoice-box { width:100%; padding:20px; border:1px solid #000; box-sizing:border-box; }
//     table { width:100%; border-collapse:collapse; }
//     table td, table th { padding:6px; vertical-align:top; }
//     .details-table th, .details-table td { border:1px solid #000; }
//     .details-table th { background:#d9e9ff; font-weight:bold; text-align:center; }
//     .summary td, .summary th { border:1px solid #000; padding:6px; }
//     .summary th { background:#d9e9ff; font-weight:bold; text-align:right; }
//     .right { text-align:right; }
//     .center { text-align:center; }
//     .page-break { page-break-before: always; }

//     /* ✅ Prevent last section from splitting across pages */
//     .no-split {
//       page-break-inside: avoid;
//       break-inside: avoid;
//     }

//     /* Styles for terms page */
//     .terms-section {
//       padding: 10px;
//       font-size: 13px;
//       margin-bottom: 15px;
//     }
//     .terms-section h3 {
//       margin: 0 0 8px 0;
//       font-size: 16px;
//       border-bottom: 2px solid #000;
//       padding-bottom: 5px;
//     }
//     .terms-content {
//       line-height: 1.6;
//       white-space: pre-line;
//       padding-left: 10px;
//     }

   

// /* ✅ Footer perfectly aligned at bottom and centered */
// .footer {
//   text-align: center;
//   font-size: 12px;
//   background: #f4f6fb; /* light gray background */
//   border-top: 1px solid #000;
//   padding: 6px 0;
//   width: 100%;
//   box-sizing: border-box;
//   position: absolute;
//   bottom: 0;
//   left: 0;
//   right: 0;
// }

// .foot{
// text-align: center;
// }



    
//   </style>
// </head>
// <body>

// ${(() => {
//   const MAX_ROWS = 19;
//   const items = Array.isArray(formData.items) ? formData.items : [];
//   const totalPages = Math.ceil(items.length / MAX_ROWS);

//   let pagesHtml = "";

//   // ===== INVOICE PAGES =====
//   for (let page = 0; page < totalPages; page++) {
//     const start = page * MAX_ROWS;
//     const end = start + MAX_ROWS;
//     const itemsPage = items.slice(start, end);
//     const isLastPage = page === totalPages - 1;

//     pagesHtml += `
//       ${page > 0 ? '<div class="page-break">     </div>' : ''}
//       <div class="invoice-box">
        
//         ${page === 0 ? `
//         <!-- ===== Header on first page ===== -->
//        <table class="company-header" style="width: 100%;">
//   <tr>
//     <!-- LEFT SIDE: Company name, address, and phone -->
//     <td style="width: 70%; vertical-align: top;">
//       <div style="font-size: 25px; font-weight: bold;">
//         ${getUserData()?.company_info?.company_name || 'Company Name'}
//       </div>
//       <div style="font-size: 12px; margin-top: 2px;">
//         ${getUserData()?.company_info?.land_mark || '-'}
//       </div>
//       <div style="font-size: 12px; margin-top: 4px;">
//         <b>Phone:</b> ${getUserData()?.company_info?.phone_no || '-'}
//       </div>
//     </td>

//     <!-- RIGHT SIDE: Logo aligned properly -->
//     <td style="width: 30%; text-align: right; vertical-align: top;">
//       <img 
//         src='${host}/img/${getUserData()?.company_info?.logo}' 
//         alt="Company Logo" 
//         style="width: 80px; height: 80px; object-fit: contain; border: 1px solid #ccc; border-radius: 6px;"
//       />
//     </td>
//   </tr>
// </table>


//         <!-- ✅ Black line -->
//         <hr style="border:1px solid black; margin:4px 0;" />

//         <div style="
//           background-color:#cfe2ff;
//           text-align:center;
//           font-weight:bold;
//           font-size:20px;
//           padding:8px 0;
//           border:1px solid #000;
//           margin:10px 0;
//           letter-spacing:1px;
//         ">
//           ${getInvoiceTypeText(formData.invoiceType)}
//         </div>

//         <!-- Buyer / Consignee / Invoice details -->
//         <table style="border:1px solid #000;margin:10px 0;">
//           <tr>
//           <th style="border:1px solid #000;background:#d9e9ff;">FROM :</th>
//             <th style="border:1px solid #000;background:#d9e9ff;">TO :</th>
//             <th style="border:1px solid #000;background:#d9e9ff;">DETAILS :</th>
//           </tr>
//           <tr>
            
//             <td style="border:1px solid #000;">
//               <b>${getUserData()?.company_info?.company_name || 'Company Name'}</b><br/>
//               ${getUserData()?.name || 'Owner Name'}<br/>
//               ${getUserData()?.company_info?.land_mark || '-'}<br/>
//               <b>Phone:</b> ${getUserData()?.mobile || 'N/A'}<br/>
//               <b>GSTIN:</b> ${getUserData()?.gst ||  'N/A'}<br/>
//               Dist: ${getUserData()?.company_info?.Dist || '-'}<br/>
//               Tal: ${getUserData()?.company_info?.Tal || '-'}<br/>
//               Email : ${getUserData()?.company_info?.email_id || '-'}
//             </td>
//             <td style="border:1px solid #000;">
//               <b>Customer Name:</b>${formData.customer.name || 'Customer Name'}<br/>
//               <b>Site:</b>${formData.project_name || 'Project Name'}</br>
//               ${formData.customer.address || 'Customer Address'}<br/>
//               <b>Phone:</b> ${formData.customer.mobile || 'N/A'}<br/>
//               <b>GSTIN:</b> ${formData.customer.gstin || '-'}<br/>
//               <b>PAN:</b> ${formData.customer.pan || '-'}
//             </td>
//             <td style="border:1px solid #000;">
//               <b>Invoice No:</b> ${invoiceNumber}<br/>
//               <b>Reference ID:</b> ${formData.ref_id}<br/>
//               <b>Invoice Date:</b> ${formData.date} <br/>
//             </td>
//           </tr>
//         </table>
//         ` : ""}

//         <!-- Item Table -->
//        <!-- Item Table -->
// <table class="details-table">
//   ${page === 0 ? `
//   <thead>
//     <tr>
//       <th style="width:6%;">${labels.serialNo}</th>
//       <th style="width:38%;">${labels.workType}</th>
//       <th style="width:10%;">Unit of Measurement</th>
//       <th style="width:10%;">${labels.quantity}</th>
//       <th style="width:18%;">${labels.price}</th>
//       <th style="width:18%;">${labels.total}</th>
//     </tr>
//   </thead>` : ""}
//   <tbody>
//     ${itemsPage.map((item, i) => `
//       <tr>
//         <td class="center" style="width:6%;">${i + 1 + start}</td>
//         <td style="width:38%;">${item.work_type || ''}</td>
//         <td class="center" style="width:10%;">${item.uom || ''}</td>
//         <td class="center" style="width:10%;">${item.qty || 0}</td>
//         <td class="right" style="width:18%;">₹${Number(item.price || 0).toFixed(2)}</td>
//         <td class="right" style="width:18%;">₹${Number(item.total_price || 0).toFixed(2)}</td>
//       </tr>`).join('')}
//   </tbody>
// </table>


//         ${isLastPage ? `
//         <!-- ===== Summary Section (only last page) ===== -->
//         <div class="no-split">
//           <table class="summary" style="margin-top:10px;">
//             <tr>
//               <th>${labels.grandTotal}</th>
//               <td class="right">₹${Number(formData.totalAmount||0).toFixed(2)}</td>
//             </tr>
//             <tr>
//               <th>CGST (%)</th>
//               <td class="right">₹${Number(formData.cgst||0).toFixed(2)}</td>
//             </tr>
//             <tr>
//               <th>SGST (%)</th>
//               <td class="right">₹${Number(formData.sgst||0).toFixed(2)}</td>
//             </tr>
//             <tr>
//               <th>GST (%)</th>
//               <td class="right">₹${Number(formData.gst||0).toFixed(2)}</td>
//             </tr>
//             ${formData.discount ? `
//             <tr>
//               <th>${labels.totalAfterDiscount}</th>
//               <td class="right">₹${Number(finalAmount||0).toFixed(2)}</td>
//             </tr>` : ''}
//             <tr>
//               <th>${labels.amountPaid}</th>
//               <td class="right">₹${Number(formData.amountPaid||0).toFixed(2)}</td>
//             </tr>
//             <tr>
//   <th style="vertical-align: top;">
//     ${labels.amountRemaining}<br />
//     <span style="font-weight: normal;">
//       ${labels.amountInWords} ${totalAmountWords} ${labels.only}
//     </span>
//   </th>
//   <td class="right" style="vertical-align: top;">
//     ₹${Number(balanceAmount || 0).toFixed(2)}
//   </td>
// </tr>

//           </table>



          

//         </div>
//         ` : ""}
//         </div>
//         <div class="foot">
//         ${labels.footerNote}
//         </div>
//         `;
//       }
      
//   // ===== TERMS & CONDITIONS PAGE (SEPARATE) =====
//   if (formData.note || formData.payment_terms || formData.terms_and_conditions) {
//     pagesHtml += `
    
//     <div class="page-break"></div>
//     <div class="invoice-box">
//       <!-- ===== Header ===== -->
//       <table class="company-header" style="width: 100%;">
//   <tr>
//     <!-- LEFT SIDE: Company name, address, and phone -->
//     <td style="width: 70%; vertical-align: top;">
//       <div style="font-size: 25px; font-weight: bold;">
//         ${getUserData()?.company_info?.company_name || 'Company Name'}
//       </div>
//       <div style="font-size: 12px; margin-top: 2px;">
//         ${getUserData()?.company_info?.land_mark || '-'}
//       </div>
//       <div style="font-size: 12px; margin-top: 4px;">
//         <b>Phone:</b> ${getUserData()?.company_info?.phone_no || '-'}
//       </div>
//     </td>

//     <!-- RIGHT SIDE: Logo aligned properly -->
//     <td style="width: 30%; text-align: right; vertical-align: top;">
//       <img 
//         src='${host}/img/${getUserData()?.company_info?.logo}' 
//         alt="Company Logo" 
//         style="width: 80px; height: 80px; object-fit: contain; border: 1px solid #ccc; border-radius: 6px;"
//       />
//     </td>
//   </tr>
// </table>

//       <hr style="border:1px solid black; margin:4px 0;" />

//       <!-- Notes Section -->
//       ${formData.note ? `
//       <div class="terms-section">
//         <h3>Notes</h3>
//         <div class="terms-content">${formData.note}</div>
//       </div>
//       ` : ''}

//       <!-- Payment Terms Section -->
//       ${formData.payment_terms ? `
//       <div class="terms-section">
//         <h3>Payment Terms</h3>
//         <div class="terms-content">${formData.payment_terms}</div>
//       </div>
//       ` : ''}

//       <!-- Terms & Conditions Section -->
//       ${formData.terms_and_conditions ? `
//       <div class="terms-section">
//         <h3>Terms & Conditions</h3>
//         <div class="terms-content">${formData.terms_and_conditions}</div>
//       </div>
//       ` : ''}
//     </div>
//     `;
//   }

//   return pagesHtml;
// })()}

// </body>
// </html>
// `;


const htmlContent = `
<html>
<head>
  <style>
    @page {
      size: A4;
      margin: 0;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border;
    }
    
    body { 
      font-family: Arial, sans-serif; 
      font-size: 12px; 
      margin: 0; 
      padding: 0;
    }
    
    .invoice-box {
      width: 100%;
      min-height: 100vh;
      padding: 20px;
      border: 3px solid #000;
      box-sizing: border-box;
      position: relative;
      page-break-after: always;
      display: flex;
      flex-direction: column;
    }
    
    .content-wrapper {
      flex: 1;
    }
    
    table { 
      width: 100%; 
      border-collapse: collapse; 
    }
    
    table td, table th { 
      padding: 5px; 
      vertical-align: top; 
      font-size: 11px;
    }
    
    .details-table th, .details-table td { 
      border: 1px solid #000; 
    }
    
    .details-table th { 
      background: #d9e9ff; 
      font-weight: bold; 
      text-align: center; 
    }
    
    .summary td, .summary th { 
      border: 1px solid #000; 
      padding: 5px; 
    }
    
    .summary th { 
      background: #d9e9ff; 
      font-weight: bold; 
      text-align: right; 
    }
    
    .right { text-align: right; }
    .center { text-align: center; }
    .page-break { page-break-before: always; }

    .no-split {
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .terms-section {
      padding: 8px 0;
      font-size: 12px;
      margin-bottom: 10px;
    }
    
    .terms-section h3 {
      margin: 0 0 6px 0;
      font-size: 15px;
      border-bottom: 2px solid #000;
      padding-bottom: 4px;
    }
    
    .terms-content {
      line-height: 1.5;
      white-space: pre-line;
      padding-left: 8px;
    }

    .footer {
      text-align: center;
      font-size: 11px;
      padding: 8px 0;
      width: 100%;
      margin-top: auto;
      background: transparent;
    }

    .footer-content {
  display: flex;
  justify-content: space-between; /* 👈 puts left and right at corners */
  align-items: center;
  width: 100%;
  padding: 0 25px; /* adds spacing from page edges */
  box-sizing: border-box;
}

.footer-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
}

    .foot {
      text-align: center;
      margin: 8px 0;
      font-size: 10px;
    }

    @media print {
      body {
        margin: 0;
        padding: 0;
      }
      
      .invoice-box {
        page-break-after: always;
        border: 3px solid #000;
      }
    }
  </style>
</head>
<body>

${(() => {
  const MAX_ROWS = 19;
  const items = Array.isArray(formData.items) ? formData.items : [];
  const totalPages = Math.ceil(items.length / MAX_ROWS);

  let pagesHtml = "";

  // ===== INVOICE PAGES =====
  for (let page = 0; page < totalPages; page++) {
    const start = page * MAX_ROWS;
    const end = start + MAX_ROWS;
    const itemsPage = items.slice(start, end);
    const isLastPage = page === totalPages - 1;

    pagesHtml += `
      ${page > 0 ? '<div class="page-break"></div>' : ''}
      <div class="invoice-box">
        <div class="content-wrapper">
        
        ${page === 0 ? `
        <!-- ===== Header on first page ===== -->
        <table class="company-header" style="width: 100%; margin-bottom: 5px;">
          <tr>
            <td style="width: 70%; vertical-align: top;">
              <div style="font-size: 22px; font-weight: bold; line-height: 1.2;">
                ${getUserData()?.company_info?.company_name || 'Company Name'}
              </div>
              <div style="font-size: 11px; margin-top: 2px;">
                ${getUserData()?.company_info?.land_mark || '-'}
              </div>
              <div style="font-size: 11px; margin-top: 3px;">
                <b>Phone:</b> ${getUserData()?.company_info?.phone_no || '-'}
              </div>
            </td>
            <td style="width: 30%; text-align: right; vertical-align: top;">
              <img 
                src='${host}/img/${getUserData()?.company_info?.logo}' 
                alt="Company Logo" 
                style="width: 75px; height: 75px; object-fit: contain; border: 1px solid #ccc; border-radius: 5px;"
              />
            </td>
          </tr>
        </table>

        <hr style="border: 1px solid black; margin: 3px 0;" />

        <div style="
          background-color: #cfe2ff;
          text-align: center;
          font-weight: bold;
          font-size: 18px;
          padding: 6px 0;
          border: 1px solid #000;
          margin: 6px 0;
          letter-spacing: 1px;
        ">
         
        Quotation
        </div>

        <table style="border: 1px solid #000; margin: 6px 0;">
          <tr>
            <th style="border: 1px solid #000; background: #d9e9ff; font-size: 11px; padding: 4px;">FROM :</th>
            <th style="border: 1px solid #000; background: #d9e9ff; font-size: 11px; padding: 4px;">TO :</th>
            <th style="border: 1px solid #000; background: #d9e9ff; font-size: 11px; padding: 4px;">DETAILS :</th>
          </tr>
          <tr>
            <td style="border: 1px solid #000; font-size: 10px; padding: 5px; line-height: 1.4;">
              <b>${getUserData()?.company_info?.company_name || 'Company Name'}</b><br/>
              ${getUserData()?.name || 'Owner Name'}<br/>
              ${getUserData()?.company_info?.land_mark || '-'}<br/>
              <b>Phone:</b> ${getUserData()?.mobile || 'N/A'}<br/>
              <b>GSTIN:</b> ${getUserData()?.company_info?.gst_number || 'N/A'}<br/>
              Dist: ${getUserData()?.company_info?.Dist || '-'}<br/>
              Tal: ${getUserData()?.company_info?.Tal || '-'}<br/>
              Email: ${getUserData()?.company_info?.email_id || '-'}
            </td>
            <td style="border: 1px solid #000; font-size: 10px; padding: 5px; line-height: 1.4;">
              <b>Customer Name:</b> ${formData.customer.name || 'Customer Name'}<br/>
              <b>Site:</b> ${formData.project_name || 'Project Name'}<br/>
              ${formData.customer.address || 'Customer Address'}<br/>
              <b>Phone:</b> ${formData.customer.mobile || 'N/A'}<br/>
              <b>GSTIN:</b> ${formData.gst_number || '-'}<br/>
              <b>PAN:</b> ${formData.pan_number || '-'}
            </td>
            <td style="border: 1px solid #000; font-size: 10px; padding: 5px; line-height: 1.4;">
              <b>Invoice No:</b> ${invoiceNumber}<br/>
              <b>Invoice Date:</b> ${formData.date}<br/>
              <b>Reference ID:</b> ${formData.ref_id}<br/>
            </td>
          </tr>
        </table>
        ` : ""}

        <table class="details-table" style="margin-top: 8px;">
          ${page === 0 ? `
          <thead>
            <tr>
              <th style="width: 6%; font-size: 10px;">${labels.serialNo}</th>
              <th style="width: 38%; font-size: 10px;">${labels.workType}</th>
              <th style="width: 10%; font-size: 10px;">Unit of Measurement</th>
              <th style="width: 10%; font-size: 10px;">${labels.quantity}</th>
              <th style="width: 18%; font-size: 10px;">${labels.price}</th>
              <th style="width: 18%; font-size: 10px;">${labels.total}</th>
            </tr>
          </thead>` : ""}
          <tbody>
            ${itemsPage.map((item, i) => `
              <tr>
                <td class="center" style="width: 6%; font-size: 10px;">${i + 1 + start}</td>
                <td style="width: 38%; font-size: 10px;">${item.work_type || ''}</td>
                <td class="center" style="width: 10%; font-size: 10px;">${item.uom || ''}</td>
                <td class="center" style="width: 10%; font-size: 10px;">${item.qty || 0}</td>
                <td class="right" style="width: 18%; font-size: 10px;">₹${Number(item.price || 0).toFixed(2)}</td>
                <td class="right" style="width: 18%; font-size: 10px;">₹${Number(item.total_price || 0).toFixed(2)}</td>
              </tr>`).join('')}
          </tbody>
        </table>

    ${isLastPage ? `
  <div class="no-split">
    <table class="summary" style="margin-top: 8px;">
      <tr>
        <th style="font-size: 11px;">Amount Total</th>
        <td class="right" style="font-size: 11px;">₹${Number(formData.totalAmount || 0).toFixed(2)}</td>
      </tr>

      ${(() => {
        const total = Number(formData.totalAmount || 0);
        const cgst = Number(formData.cgst || 0);
        const sgst = Number(formData.sgst || 0);
        const gst = Number(formData.gst || 0);

        const cgstPercent = total ? ((cgst / total) * 100).toFixed(2) : 0;
        const sgstPercent = total ? ((sgst / total) * 100).toFixed(2) : 0;
        const gstPercent = total ? ((gst / total) * 100).toFixed(2) : 0;

        return `
          <tr>
            <th style="font-size: 11px;">CGST (${cgstPercent}%)</th>
            <td class="right" style="font-size: 11px;">₹${cgst.toFixed(2)}</td>
          </tr>
          <tr>
            <th style="font-size: 11px;">SGST (${sgstPercent}%)</th>
            <td class="right" style="font-size: 11px;">₹${sgst.toFixed(2)}</td>
          </tr>
          <tr>
            <th style="font-size: 11px;">GST (${gstPercent}%)</th>
            <td class="right" style="font-size: 11px;">₹${gst.toFixed(2)}</td>
          </tr>
        `;
      })()}
      
      ${formData.discount ? `
      <tr>
        <th style="font-size: 11px;">${labels.totalAfterDiscount}</th>
        <td class="right" style="font-size: 11px;">₹${Number(finalAmount || 0).toFixed(2)}</td>
      </tr>` : ''}

      <tr>
        <th style="font-size: 11px;">${labels.amountPaid}</th>
        <td class="right" style="font-size: 11px;">₹${Number(formData.amountPaid || 0).toFixed(2)}</td>
      </tr>
      <tr>
        <th style="vertical-align: top; font-size: 11px;">
          ${labels.amountRemaining}<br />
          <span style="font-weight: normal; font-size: 10px;">
            ${labels.amountInWords} ${totalAmountWords} ${labels.only}
          </span>
        </th>
        <td class="right" style="vertical-align: top; font-size: 11px;">
          ₹${Number(balanceAmount || 0).toFixed(2)}
        </td>
      </tr>
    </table>
  </div>
` : ""}


        
        
        </div>

         <div class="foot">
          ${labels.footerNote}
        </div>
        <div class="footer">
       
          <div class="footer-content">
            <div class="footer-item">
              <span>✉️</span>
              <span>deshmukhinfra@gmail.com</span>
            </div>
            <div class="footer-item">
              <span>🌐</span>
              <span>www.deshmukhinfrasolutions.com</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }
      
  // ===== TERMS & CONDITIONS PAGE =====
  if (formData.note || formData.payment_terms || formData.terms_and_conditions) {
    pagesHtml += `
    <div class="page-break"></div>
    <div class="invoice-box">
      <div class="content-wrapper">
        <table class="company-header" style="width: 100%; margin-bottom: 5px;">
          <tr>
            <td style="width: 70%; vertical-align: top;">
              <div style="font-size: 22px; font-weight: bold; line-height: 1.2;">
                ${getUserData()?.company_info?.company_name || 'Company Name'}
              </div>
              <div style="font-size: 11px; margin-top: 2px;">
                ${getUserData()?.company_info?.land_mark || '-'}
              </div>
              <div style="font-size: 11px; margin-top: 3px;">
                <b>Phone:</b> ${getUserData()?.company_info?.phone_no || '-'}
              </div>
            </td>
            <td style="width: 30%; text-align: right; vertical-align: top;">
              <img 
                src='${host}/img/${getUserData()?.company_info?.logo}' 
                alt="Company Logo" 
                style="width: 75px; height: 75px; object-fit: contain; border: 1px solid #ccc; border-radius: 5px;"
              />
            </td>
          </tr>
        </table>

        <hr style="border: 1px solid black; margin: 3px 0;" />

        ${formData.note ? `
        <div class="terms-section">
          <h3>Notes</h3>
          <div class="terms-content">${formData.note}</div>
        </div>
        ` : ''}

        ${formData.payment_terms ? `
        <div class="terms-section">
          <h3>Payment Terms</h3>
          <div class="terms-content">${formData.payment_terms}</div>
        </div>
        ` : ''}

        ${formData.terms_and_conditions ? `
        <div class="terms-section">
          <h3>Terms & Conditions</h3>
          <div class="terms-content">${formData.terms_and_conditions}</div>
        </div>
        ` : ''}
      </div>

      <div class="footer">
        <div class="footer-content">
          <div class="footer-item">
            <span>✉️</span>
            <span>deshmukhinfra@gmail.com</span>
          </div>
          <div class="footer-item">
            <span>🌐</span>
            <span>www.deshmukhinfrasolutions.com</span>
          </div>
        </div>
      </div>
    </div>
    `;
  }

  return pagesHtml;
})()}

</body>
</html>
`;




  const opt = {
    margin: 0.5,
    filename: `${invoiceNumber}_${customerName}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
  }

  const pdfInstance = html2pdf().set(opt).from(htmlContent)

  if (mode === 'blob') {
    return pdfInstance.outputPdf('blob')
  } else if (mode === 'save') {
    return pdfInstance.save()
  }
}

function UnifiedInvoicePdf() {
  const [selectedLanguage, setSelectedLanguage] = useState('english')

  const sampleFormData = {
    project_name:
      selectedLanguage === 'tamil'
        ? 'மாதிரி திட்டம்'
        : selectedLanguage === 'bengali'
        ? 'নমুনা প্রকল্প'
        : selectedLanguage === 'marathi'
        ? 'नमुना प्रकल्प'
        : 'Sample Project',
    customer_id: 1,
    customer: {
      name:
        selectedLanguage === 'tamil'
          ? 'ஸ்ரேயா ஜி'
          : selectedLanguage === 'bengali'
          ? 'শ্রেয়া জি'
          : selectedLanguage === 'marathi'
          ? 'श्रेया ग'
          : 'Shreya G',
      address:
        selectedLanguage === 'tamil'
          ? 'கார்வேநகர்'
          : selectedLanguage === 'bengali'
          ? 'কারভেনগর'
          : selectedLanguage === 'marathi'
          ? 'कर्वेनगर'
          : 'Karvenagar',
      mobile: '1234567890',
    },
    date: '2024-12-31',
    InvoiceStatus:
      selectedLanguage === 'tamil'
        ? 'விநியோகம் முடிந்த ஆர்டர்'
        : selectedLanguage === 'bengali'
        ? 'বিতরণ সম্পন্ন অর্ডার'
        : selectedLanguage === 'marathi'
        ? 'डिलिव्हर्ड ऑर्डर'
        : 'Delivered Order',
    InvoiceType: 3,
    DeliveryDate: '2025-01-01',
    lat: 'Sample Address Line',
    items: Array.from({ length: 28 }, (_, i) => ({
      work_type: String.fromCharCode(97 + (i % 26)),
      qty: Math.floor(Math.random() * 100) + 1,
      price: Math.random() * 1000,
      total_price: Math.random() * 1000,
    })),
    totalAmount: 400,
    discount: 10,
    finalAmount: 360,
    amountPaid: 300,
    paymentMode:
      selectedLanguage === 'tamil'
        ? 'ஆன்லைன்'
        : selectedLanguage === 'bengali'
        ? 'অনলাইন'
        : selectedLanguage === 'marathi'
        ? 'ऑनलाइन'
        : 'Online',
  }

  const totalAmountWords =
    selectedLanguage === 'tamil'
      ? 'முன்னூற்று அறுபது'
      : selectedLanguage === 'bengali'
      ? 'তিনশত ষাট'
      : selectedLanguage === 'marathi'
      ? 'तीनशे साठ'
      : 'Three Hundred and Sixty'

  const handleDownload = () => {
    generateMultiLanguagePDF(
      360,
      'INV-001',
      sampleFormData.customer.name,
      sampleFormData,
      60,
      totalAmountWords,
      selectedLanguage,
      'save'
    )
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Multi-Language Invoice PDF Generator (Full Page)</h2>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ marginRight: '10px' }}>Select Language:</label>
        <select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          style={{ padding: '5px', fontSize: '16px' }}
        >
          {Object.entries(LANGUAGES).map(([key, lang]) => (
            <option key={key} value={key}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleDownload}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        {selectedLanguage === 'tamil'
          ? 'விலைப்பட்டியல் பதிவிறக்கம் செய்யவும்'
          : selectedLanguage === 'bengali'
          ? 'ইনভয়েস ডাউনলোড করুন'
          : selectedLanguage === 'marathi'
          ? 'चलन डाउनलोड करा'
          : 'Download Invoice'}
      </button>

      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
        <h3>Updated Improvements:</h3>
        <ul>
          <li>✅ Increased overall padding from 5px to 10px</li>
          <li>✅ Increased customer details font size from 10px to 12px</li>
          <li>✅ Increased invoice details font size from 10px to 12px</li>
          <li>✅ Increased company name font size from 14px to 16px</li>
          <li>✅ Increased company address font size from 10px to 12px</li>
          <li>✅ Increased table cell padding from 4px to 6px</li>
          <li>✅ Increased payment details font size from 10px to 12px</li>
          <li>✅ Improved overall spacing and margins</li>
          <li>✅ Adapted to customer-based API response (customer_name as project_name)</li>
          <li>✅ Added customer_id to form data</li>
        </ul>
      </div>
    </div>
  )
}

export default UnifiedInvoicePdf

















          // <!-- Bank & Signature -->
          // <table style="margin-top:15px;">
          //   <tr>
          //     <td style="width:60%">
          //       <div class="bold">${labels.bankDetails}</div>
          //       ${labels.bank} ${getUserData()?.company_info?.bank_name || ''}<br/>
          //       ${labels.accountNo} ${getUserData()?.company_info?.account_no || ''}<br/>
          //       ${labels.ifscCode} ${getUserData()?.company_info?.IFSC_code || ''}
          //     </td>
          //     <td class="right">
          //       <div class="bold">${labels.eSignature}</div>
          //       <img src="${host}/img/${getUserData()?.company_info?.sign}" style="width:120px;height:40px;"/><br/>
                 
          //       ${labels.authorizedSignature}
          //     </td>
          //   </tr>
          // </table>







        //       ${isLastPage ? `
        // <div class="no-split">
        //   <table class="summary" style="margin-top: 8px;">
        //     <tr>
        //       <th style="font-size: 11px;">${labels.grandTotal}</th>
        //       <td class="right" style="font-size: 11px;">₹${Number(formData.totalAmount||0).toFixed(2)}</td>
        //     </tr>
        //     <tr>
        //       <th style="font-size: 11px;">CGST (%)</th>
        //       <td class="right" style="font-size: 11px;">₹${Number(formData.cgst||0).toFixed(2)}</td>
        //     </tr>
        //     <tr>
        //       <th style="font-size: 11px;">SGST (%)</th>
        //       <td class="right" style="font-size: 11px;">₹${Number(formData.sgst||0).toFixed(2)}</td>
        //     </tr>
        //     <tr>
        //       <th style="font-size: 11px;">GST (%)</th>
        //       <td class="right" style="font-size: 11px;">₹${Number(formData.gst||0).toFixed(2)}</td>
        //     </tr>
        //     ${formData.discount ? `
        //     <tr>
        //       <th style="font-size: 11px;">${labels.totalAfterDiscount}</th>
        //       <td class="right" style="font-size: 11px;">₹${Number(finalAmount||0).toFixed(2)}</td>
        //     </tr>` : ''}
        //     <tr>
        //       <th style="font-size: 11px;">${labels.amountPaid}</th>
        //       <td class="right" style="font-size: 11px;">₹${Number(formData.amountPaid||0).toFixed(2)}</td>
        //     </tr>
        //     <tr>
        //       <th style="vertical-align: top; font-size: 11px;">
        //         ${labels.amountRemaining}<br />
        //         <span style="font-weight: normal; font-size: 10px;">
        //           ${labels.amountInWords} ${totalAmountWords} ${labels.only}
        //         </span>
        //       </th>
        //       <td class="right" style="vertical-align: top; font-size: 11px;">
        //         ₹${Number(balanceAmount || 0).toFixed(2)}
        //       </td>
        //     </tr>
        //   </table>
        // </div>
        // ` : ""}