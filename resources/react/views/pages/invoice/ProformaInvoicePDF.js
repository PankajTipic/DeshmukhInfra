import html2pdf from 'html2pdf.js'
import { getUserData } from '../../../util/session'

const LANGUAGES = {
  english: {
    name: 'English',
    labels: {
      proformaInvoice: 'Proforma Invoice',
      invoiceNo: 'Invoice No:',
      tallyInvoiceNo: 'Tally Invoice No:',
      invoiceDate: 'Invoice Date:',
      deliveryDate: 'Delivery Date:',
      workOrder: 'Work Order:',
      project: 'Project:',
      customer: 'Customer:',
      location: 'Location:',
      mobile: 'Mobile:',
      workDetails: 'Work Details',
      srNo: 'Sr. No.',
      workType: 'Work Type',
      quantity: 'Quantity',
      price: 'Price (₹)',
      total: 'Total (₹)',
      remark: 'Remark',
      subtotal: 'Subtotal:',
      discount: 'Discount:',
      taxableAmount: 'Taxable Amount:',
      cgst: 'CGST',
      sgst: 'SGST',
      igst: 'IGST',
      totalGst: 'Total GST:',
      finalAmount: 'Final Amount:',
      paidAmount: 'Paid Amount:',
      pendingAmount: 'Pending Amount:',
      termsConditions: 'Terms & Conditions',
      notes: 'Notes',
      authorizedSignature: 'Authorized Signature',
      footer: 'This is a computer generated proforma invoice.',
    },
  },
  marathi: {
    name: 'मराठी',
    labels: {
      proformaInvoice: 'प्रोफॉर्मा इनव्हॉईस',
      invoiceNo: 'इनव्हॉईस क्रमांक:',
      tallyInvoiceNo: 'टॅली इनव्हॉईस क्रमांक:',
      invoiceDate: 'इनव्हॉईस तारीख:',
      deliveryDate: 'डिलिव्हरी तारीख:',
      workOrder: 'वर्क ऑर्डर:',
      project: 'प्रकल्प:',
      customer: 'ग्राहक:',
      location: 'स्थान:',
      mobile: 'मोबाईल:',
      workDetails: 'कामाचे तपशील',
      srNo: 'अ.क्र.',
      workType: 'काम प्रकार',
      quantity: 'प्रमाण',
      price: 'किंमत (₹)',
      total: 'एकूण (₹)',
      remark: 'टिप्पणी',
      subtotal: 'उपएकूण:',
      discount: 'सूट:',
      taxableAmount: 'करपात्र रक्कम:',
      cgst: 'सीजीएसटी',
      sgst: 'एसजीएसटी',
      igst: 'आयजीएसटी',
      totalGst: 'एकूण जीएसटी:',
      finalAmount: 'अंतिम रक्कम:',
      paidAmount: 'भरलेली रक्कम:',
      pendingAmount: 'शिल्लक रक्कम:',
      termsConditions: 'अटी व शर्ती',
      notes: 'टिपा',
      authorizedSignature: 'अधिकृत स्वाक्षरी',
      footer: 'हे संगणकाद्वारे तयार केलेले प्रोफॉर्मा इनव्हॉईस आहे.',
    },
  },
  tamil: {
    name: 'தமிழ்',
    labels: {
      proformaInvoice: 'ப்ரோஃபார்மா விலைப்பட்டியல்',
      invoiceNo: 'விலைப்பட்டியல் எண்:',
      tallyInvoiceNo: 'டாலி விலைப்பட்டியல் எண்:',
      invoiceDate: 'விலைப்பட்டியல் தேதி:',
      deliveryDate: 'விநியோக தேதி:',
      workOrder: 'வேலை ஆர்டர்:',
      project: 'திட்டம்:',
      customer: 'வாடிக்கையாளர்:',
      location: 'இடம்:',
      mobile: 'கைபேசி:',
      workDetails: 'வேலை விவரங்கள்',
      srNo: 'வ.எண்.',
      workType: 'வேலை வகை',
      quantity: 'அளவு',
      price: 'விலை (₹)',
      total: 'மொத்தம் (₹)',
      remark: 'குறிப்பு',
      subtotal: 'துணை மொத்தம்:',
      discount: 'தள்ளுபடி:',
      taxableAmount: 'வரி விதிக்கக்கூடிய தொகை:',
      cgst: 'சிஜிஎஸ்டி',
      sgst: 'எஸ்ஜிஎஸ்டி',
      igst: 'ஐஜிஎஸ்டி',
      totalGst: 'மொத்த ஜிஎஸ்டி:',
      finalAmount: 'இறுதி தொகை:',
      paidAmount: 'செலுத்திய தொகை:',
      pendingAmount: 'நிலுவை தொகை:',
      termsConditions: 'விதிமுறைகள் மற்றும் நிபந்தனைகள்',
      notes: 'குறிப்புகள்',
      authorizedSignature: 'அங்கீகரிக்கப்பட்ட கையொப்பம்',
      footer: 'இது கணினியால் உருவாக்கப்பட்ட ப்ரோஃபார்மா விலைப்பட்டியல்.',
    },
  },
  bengali: {
    name: 'বাংলা',
    labels: {
      proformaInvoice: 'প্রোফর্মা ইনভয়েস',
      invoiceNo: 'ইনভয়েস নম্বর:',
      tallyInvoiceNo: 'ট্যালি ইনভয়েস নম্বর:',
      invoiceDate: 'ইনভয়েসের তারিখ:',
      deliveryDate: 'ডেলিভারির তারিখ:',
      workOrder: 'ওয়ার্ক অর্ডার:',
      project: 'প্রকল্প:',
      customer: 'গ্রাহক:',
      location: 'অবস্থান:',
      mobile: 'মোবাইল:',
      workDetails: 'কাজের বিবরণ',
      srNo: 'ক্র.নং.',
      workType: 'কাজের ধরন',
      quantity: 'পরিমাণ',
      price: 'মূল্য (₹)',
      total: 'মোট (₹)',
      remark: 'মন্তব্য',
      subtotal: 'উপমোট:',
      discount: 'ছাড়:',
      taxableAmount: 'করযোগ্য পরিমাণ:',
      cgst: 'সিজিএসটি',
      sgst: 'এসজিএসটি',
      igst: 'আইজিএসটি',
      totalGst: 'মোট জিএসটি:',
      finalAmount: 'চূড়ান্ত পরিমাণ:',
      paidAmount: 'প্রদত্ত পরিমাণ:',
      pendingAmount: 'বাকি পরিমাণ:',
      termsConditions: 'শর্তাবলী',
      notes: 'নোট',
      authorizedSignature: 'অনুমোদিত স্বাক্ষর',
      footer: 'এটি একটি কম্পিউটার তৈরি প্রোফর্মা ইনভয়েস.',
    },
  },
}

export const generateProformaInvoicePDF = async (
  proformaInvoice,
  lang = 'english',
  mode = 'save'
) => {
  const labels = LANGUAGES[lang].labels
  const user = getUserData()

  // const htmlContent = `
  //   <html>
  //   <head>
  //     <style>
  //       body { font-family: Arial, sans-serif; font-size: 12px; margin: 0; padding: 0; }
  //       .container { padding: 20px; }
  //       table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
  //       th, td { padding: 8px; text-align: left; border: 1px solid #000; }
  //       th { background-color: #d9e9ff; font-weight: bold; }
  //       .text-right { text-align: right; }
  //       .text-center { text-align: center; }
  //       .header { text-align: center; margin-bottom: 20px; }
  //       .header h2 { margin: 0; padding: 10px; background: #cfe2ff; border: 1px solid #000; }
  //       .section { margin-bottom: 20px; }
  //       .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
  //       .footer { text-align: center; margin-top: 30px; font-size: 10px; }
  //     </style>
  //   </head>
  //   <body>
  //     <div class="container">
  //       <!-- Header -->
  //       <div class="header">
  //         <h2>${labels.proformaInvoice}</h2>
  //       </div>

  //       <!-- Company & Invoice Info -->
  //       <table>
  //         <tr>
  //           <th>Company Information</th>
  //           <th>Invoice Details</th>
  //         </tr>
  //         <tr>
  //           <td>
  //             <strong>${user?.company_info?.company_name || 'Company Name'}</strong><br/>
  //             ${user?.company_info?.land_mark || ''}<br/>
  //             Phone: ${user?.company_info?.phone_no || 'N/A'}<br/>
  //             Email: ${user?.company_info?.email_id || 'N/A'}
  //           </td>
  //           <td>
  //             ${labels.invoiceNo} <strong>${proformaInvoice.proforma_invoice_number}</strong><br/>
  //             ${proformaInvoice.tally_invoice_number ? `${labels.tallyInvoiceNo} ${proformaInvoice.tally_invoice_number}<br/>` : ''}
  //             ${labels.invoiceDate} ${new Date(proformaInvoice.invoice_date).toLocaleDateString()}<br/>
  //             ${proformaInvoice.delivery_date ? `${labels.deliveryDate} ${new Date(proformaInvoice.delivery_date).toLocaleDateString()}` : ''}
  //           </td>
  //         </tr>
  //       </table>

  //       <!-- Customer & Project Info -->
  //       <table>
  //         <tr>
  //           <th>Customer Information</th>
  //           <th>Project Information</th>
  //         </tr>
  //         <tr>
  //           <td>
  //             ${labels.customer} <strong>${proformaInvoice.customer?.name || 'N/A'}</strong><br/>
  //             ${labels.location} ${proformaInvoice.customer?.address || 'N/A'}<br/>
  //             ${labels.mobile} ${proformaInvoice.customer?.mobile || 'N/A'}
  //           </td>
  //           <td>
  //             ${labels.workOrder} ${proformaInvoice.work_order?.invoice_number || 'N/A'}<br/>
  //             ${labels.project} ${proformaInvoice.project?.project_name || 'N/A'}
  //           </td>
  //         </tr>
  //       </table>

  //       <!-- Work Details -->
  //       <h3>${labels.workDetails}</h3>
  //       <table>
  //         <thead>
  //           <tr>
  //             <th class="text-center">${labels.srNo}</th>
  //             <th>${labels.workType}</th>
  //             <th class="text-center">${labels.quantity}</th>
  //             <th class="text-right">${labels.price}</th>
  //             <th class="text-right">${labels.total}</th>
  //             <th>${labels.remark}</th>
  //           </tr>
  //         </thead>
  //         <tbody>
  //           ${proformaInvoice.details?.map((item, index) => `
  //             <tr>
  //               <td class="text-center">${index + 1}</td>
  //               <td>${item.work_type}</td>
  //               <td class="text-center">${item.qty}</td>
  //               <td class="text-right">₹${parseFloat(item.price).toFixed(2)}</td>
  //               <td class="text-right">₹${parseFloat(item.total_price).toFixed(2)}</td>
  //               <td>${item.remark || '-'}</td>
  //             </tr>
  //           `).join('') || '<tr><td colspan="6" class="text-center">No items</td></tr>'}
  //         </tbody>
  //       </table>

  //       <!-- Financial Summary -->
  //       <table style="width: 50%; margin-left: auto;">
  //         <tr>
  //           <td>${labels.subtotal}</td>
  //           <td class="text-right">₹${parseFloat(proformaInvoice.subtotal).toFixed(2)}</td>
  //         </tr>
  //         ${proformaInvoice.discount > 0 ? `
  //         <tr>
  //           <td>${labels.discount}</td>
  //           <td class="text-right">₹${parseFloat(proformaInvoice.discount).toFixed(2)}</td>
  //         </tr>` : ''}
  //         <tr>
  //           <td>${labels.taxableAmount}</td>
  //           <td class="text-right">₹${parseFloat(proformaInvoice.taxable_amount).toFixed(2)}</td>
  //         </tr>
  //         <tr>
  //           <td>${labels.cgst} (${proformaInvoice.cgst_percentage}%)</td>
  //           <td class="text-right">₹${parseFloat(proformaInvoice.cgst_amount).toFixed(2)}</td>
  //         </tr>
  //         <tr>
  //           <td>${labels.sgst} (${proformaInvoice.sgst_percentage}%)</td>
  //           <td class="text-right">₹${parseFloat(proformaInvoice.sgst_amount).toFixed(2)}</td>
  //         </tr>
  //         ${proformaInvoice.igst_amount > 0 ? `
  //         <tr>
  //           <td>${labels.igst} (${proformaInvoice.igst_percentage}%)</td>
  //           <td class="text-right">₹${parseFloat(proformaInvoice.igst_amount).toFixed(2)}</td>
  //         </tr>` : ''}
  //         <tr>
  //           <td><strong>${labels.finalAmount}</strong></td>
  //           <td class="text-right"><strong>₹${parseFloat(proformaInvoice.final_amount).toFixed(2)}</strong></td>
  //         </tr>
  //         <tr style="background: #d4edda;">
  //           <td>${labels.paidAmount}</td>
  //           <td class="text-right">₹${parseFloat(proformaInvoice.paid_amount).toFixed(2)}</td>
  //         </tr>
  //         <tr style="background: #fff3cd;">
  //           <td>${labels.pendingAmount}</td>
  //           <td class="text-right">₹${parseFloat(proformaInvoice.pending_amount).toFixed(2)}</td>
  //         </tr>
  //       </table>

  //       <!-- Terms & Conditions -->
  //       ${proformaInvoice.invoice_rules && proformaInvoice.invoice_rules.length > 0 ? `
  //       <div class="section">
  //         <h3>${labels.termsConditions}</h3>
  //         <ul>
  //           ${proformaInvoice.invoice_rules.map(ir => `<li>${ir.rule?.description || ''}</li>`).join('')}
  //         </ul>
  //       </div>` : ''}

  //       <!-- Notes -->
  //       ${proformaInvoice.notes ? `
  //       <div class="section">
  //         <h3>${labels.notes}</h3>
  //         <p>${proformaInvoice.notes}</p>
  //       </div>` : ''}

  //       <!-- Signature -->
  //       <div style="text-align: right; margin-top: 40px;">
  //         ${user?.company_info?.sign ? `<img src="img/${user.company_info.sign}" style="width:120px;height:40px;"/><br/>` : ''}
  //         <p>${labels.authorizedSignature}</p>
  //       </div>

  //       <!-- Footer -->
  //       <div class="footer">
  //         <p>${labels.footer}</p>
  //       </div>
  //     </div>
  //   </body>
  //   </html>
  // `











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
      box-sizing: border-box;
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
      justify-content: space-between;
      align-items: center;
      width: 100%;
      padding: 0 25px;
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
  const items = Array.isArray(proformaInvoice.details) ? proformaInvoice.details : [];
  const totalPages = Math.ceil(items.length / MAX_ROWS);

  // Convert final amount to words (assuming a utility function exists or is implemented)
  const amountInWords = (amount) => {
    // Placeholder: Replace with actual number-to-words conversion logic
    // Example: You can use a library like 'number-to-words' or a custom function
    return 'Rupees ' + parseFloat(amount).toFixed(2) + ' Only';
  };
  const totalAmountWords = amountInWords(proformaInvoice.pending_amount || 0);

  let pagesHtml = '';

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
                ${user?.company_info?.company_name || 'Company Name'}
              </div>
              <div style="font-size: 11px; margin-top: 2px;">
                ${user?.company_info?.land_mark || '-'}
              </div>
              <div style="font-size: 11px; margin-top: 3px;">
                <b>Phone:</b> ${user?.company_info?.phone_no || '-'}
              </div>
            </td>
            <td style="width: 30%; text-align: right; vertical-align: top;">
              ${user?.company_info?.logo ? `
              <img 
                src='/img/${user.company_info.logo}' 
                alt="Company Logo" 
                style="width: 75px; height: 75px; object-fit: contain; border: 1px solid #ccc; border-radius: 5px;"
              />
              ` : ''}
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
          ${labels.proformaInvoice}
        </div>

        <table style="border: 1px solid #000; margin: 6px 0;">
          <tr>
            <th style="border: 1px solid #000; background: #d9e9ff; font-size: 11px; padding: 4px;">FROM :</th>
            <th style="border: 1px solid #000; background: #d9e9ff; font-size: 11px; padding: 4px;">TO :</th>
            <th style="border: 1px solid #000; background: #d9e9ff; font-size: 11px; padding: 4px;">DETAILS :</th>
          </tr>
          <tr>
            <td style="border: 1px solid #000; font-size: 10px; padding: 5px; line-height: 1.4;">
              <b>${user?.company_info?.company_name || 'Company Name'}</b><br/>
              ${user?.name || 'Owner Name'}<br/>
              ${user?.company_info?.land_mark || '-'}<br/>
              <b>Phone:</b> ${user?.company_info?.phone_no || 'N/A'}<br/>
              <b>Email:</b> ${user?.company_info?.email_id || 'N/A'}<br/>
              <b>GSTIN:</b> ${user?.gst || 'N/A'}<br/>
              Dist: ${user?.company_info?.Dist || '-'}<br/>
              Tal: ${user?.company_info?.Tal || '-'}
            </td>
            <td style="border: 1px solid #000; font-size: 10px; padding: 5px; line-height: 1.4;">
              <b>Customer Name:</b> ${proformaInvoice.customer?.name || 'N/A'}<br/>
              <b>Site:</b> ${proformaInvoice.project?.project_name || 'N/A'}<br/>
              ${proformaInvoice.customer?.address || 'N/A'}<br/>
              <b>Phone:</b> ${proformaInvoice.customer?.mobile || 'N/A'}<br/>
              <b>GSTIN:</b> ${proformaInvoice.customer?.gstin || '-'}<br/>
              <b>PAN:</b> ${proformaInvoice.customer?.pan || '-'}
            </td>
            <td style="border: 1px solid #000; font-size: 10px; padding: 5px; line-height: 1.4;">
              <b>Invoice No:</b> ${proformaInvoice.proforma_invoice_number}<br/>
              ${proformaInvoice.tally_invoice_number ? `<b>Tally Invoice No:</b> ${proformaInvoice.tally_invoice_number}<br/>` : ''}
              <b>Invoice Date:</b> ${new Date(proformaInvoice.invoice_date).toLocaleDateString()}<br/>
              ${proformaInvoice.delivery_date ? `<b>Delivery Date:</b> ${new Date(proformaInvoice.delivery_date).toLocaleDateString()}` : ''}
              <b>Work Order ID : </b> ${proformaInvoice.work_order?.invoice_number || 'N/A'}
            </td>
          </tr>
        </table>
        ` : ''}

        <table class="details-table" style="margin-top: 8px;">
          ${page === 0 ? `
          <thead>
            <tr>
              <th style="width: 6%; font-size: 10px;">${labels.srNo}</th>
              <th style="width: 38%; font-size: 10px;">${labels.workType}</th>
              <th style="width: 10%; font-size: 10px;">Unit of Measurement</th>
              <th style="width: 10%; font-size: 10px;">${labels.quantity}</th>
              <th style="width: 18%; font-size: 10px;">${labels.price}</th>
              <th style="width: 18%; font-size: 10px;">${labels.total}</th>
            </tr>
          </thead>` : ''}
          <tbody>
            ${itemsPage.map((item, i) => `
              <tr>
                <td class="center" style="width: 6%; font-size: 10px;">${i + 1 + start}</td>
                <td style="width: 38%; font-size: 10px;">${item.work_type || '-'}</td>
                <td class="center" style="width: 10%; font-size: 10px;">${item.uom || '-'}</td>
                <td class="center" style="width: 10%; font-size: 10px;">${item.qty || 0}</td>
                <td class="right" style="width: 18%; font-size: 10px;">₹${parseFloat(item.price || 0).toFixed(2)}</td>
                <td class="right" style="width: 18%; font-size: 10px;">₹${parseFloat(item.total_price || 0).toFixed(2)}</td>
              </tr>`).join('')}
          </tbody>
        </table>

        ${isLastPage ? `
        <div class="no-split">
          <table class="summary" style="margin-top: 8px; width: 100%;">
            <tr>
              <th style="font-size: 11px;">${labels.subtotal}</th>
              <td class="right" style="font-size: 11px;">₹${parseFloat(proformaInvoice.subtotal || 0).toFixed(2)}</td>
            </tr>
            ${proformaInvoice.discount > 0 ? `
            <tr>
              <th style="font-size: 11px;">${labels.discount}</th>
              <td class="right" style="font-size: 11px;">₹${parseFloat(proformaInvoice.discount || 0).toFixed(2)}</td>
            </tr>` : ''}
            <tr>
              <th style="font-size: 11px;">${labels.taxableAmount}</th>
              <td class="right" style="font-size: 11px;">₹${parseFloat(proformaInvoice.taxable_amount || 0).toFixed(2)}</td>
            </tr>
            <tr>
              <th style="font-size: 11px;">${labels.cgst} (${proformaInvoice.cgst_percentage}%)</th>
              <td class="right" style="font-size: 11px;">₹${parseFloat(proformaInvoice.cgst_amount || 0).toFixed(2)}</td>
            </tr>
            <tr>
              <th style="font-size: 11px;">${labels.sgst} (${proformaInvoice.sgst_percentage}%)</th>
              <td class="right" style="font-size: 11px;">₹${parseFloat(proformaInvoice.sgst_amount || 0).toFixed(2)}</td>
            </tr>
            ${proformaInvoice.igst_amount > 0 ? `
            <tr>
              <th style="font-size: 11px;">${labels.igst} (${proformaInvoice.igst_percentage}%)</th>
              <td class="right" style="font-size: 11px;">₹${parseFloat(proformaInvoice.igst_amount || 0).toFixed(2)}</td>
            </tr>` : ''}
            <tr>
              <th style="font-size: 11px;">${labels.finalAmount}</th>
              <td class="right" style="font-size: 11px;">₹${parseFloat(proformaInvoice.final_amount || 0).toFixed(2)}</td>
            </tr>
            <tr>
              <th style="font-size: 11px; background: #d4edda;">${labels.paidAmount}</th>
              <td class="right" style="font-size: 11px; background: #d4edda;">₹${parseFloat(proformaInvoice.paid_amount || 0).toFixed(2)}</td>
            </tr>
            <tr>
              <th style="font-size: 11px; background: #fff3cd;">
                ${labels.pendingAmount}<br />
                <span style="font-weight: normal; font-size: 10px;">
                  ${labels.amountInWords} ${totalAmountWords} ${labels.only}
                </span>
              </th>
              <td class="right" style="font-size: 11px; background: #fff3cd;">₹${parseFloat(proformaInvoice.pending_amount || 0).toFixed(2)}</td>
            </tr>
          </table>

          ${user?.company_info?.sign ? `
          <div style="text-align: right; margin-top: 20px;">
            <img src="/img/${user.company_info.sign}" style="width: 120px; height: 40px;" /><br/>
            <p>${labels.authorizedSignature}</p>
          </div>
          ` : ''}
        </div>
        ` : ''}
        </div>

        <div class="foot">
          ${labels.footer || labels.footerNote || ''}
        </div>
        <div class="footer">
          <div class="footer-content">
            <div class="footer-item">
              <span>✉️</span>
              <span>${user?.company_info?.email_id || 'deshmukhinfra@gmail.com'}</span>
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
  if (proformaInvoice.invoice_rules?.length > 0 || proformaInvoice.notes) {
    pagesHtml += `
    <div class="page-break"></div>
    <div class="invoice-box">
      <div class="content-wrapper">
        <table class="company-header" style="width: 100%; margin-bottom: 5px;">
          <tr>
            <td style="width: 70%; vertical-align: top;">
              <div style="font-size: 22px; font-weight: bold; line-height: 1.2;">
                ${user?.company_info?.company_name || 'Company Name'}
              </div>
              <div style="font-size: 11px; margin-top: 2px;">
                ${user?.company_info?.land_mark || '-'}
              </div>
              <div style="font-size: 11px; margin-top: 3px;">
                <b>Phone:</b> ${user?.company_info?.phone_no || '-'}
              </div>
            </td>
            <td style="width: 30%; text-align: right; vertical-align: top;">
              ${user?.company_info?.logo ? `
              <img 
                src='/img/${user.company_info.logo}' 
                alt="Company Logo" 
                style="width: 75px; height: 75px; object-fit: contain; border: 1px solid #ccc; border-radius: 5px;"
              />
              ` : ''}
            </td>
          </tr>
        </table>

        <hr style="border: 1px solid black; margin: 3px 0;" />

        ${proformaInvoice.notes ? `
        <div class="terms-section">
          <h3>${labels.notes}</h3>
          <div class="terms-content">${proformaInvoice.notes}</div>
        </div>
        ` : ''}

        


${proformaInvoice.payment_terms ? `
        <div class="terms-section">
          <h3>Payment Terms</h3>
          <div class="terms-content">${proformaInvoice.payment_terms}</div>
        </div>
        ` : ''}


        ${proformaInvoice.terms_conditions ? `
        <div class="terms-section">
          <h3>Terms & Conditions</h3>
          <div class="terms-content">${proformaInvoice.terms_conditions}</div>
        </div>
        ` : ''}



      </div>

      <div class="footer">
        <div class="footer-content">
          <div class="footer-item">
            <span>✉️</span>
            <span>${user?.company_info?.email_id || 'deshmukhinfra@gmail.com'}</span>
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
    filename: `${proformaInvoice.proforma_invoice_number}_${proformaInvoice.customer?.name || 'invoice'}.pdf`,
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