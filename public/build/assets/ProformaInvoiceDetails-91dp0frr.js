import{d as V,u as Y,b as Z,r as v,j as t,C as tt}from"./index-D77JVx93.js";import{c as H}from"./index.esm-CnYARBHd.js";import{g as et,a as st}from"./api-C2dAnRUz.js";import{h as it}from"./html2pdf-D4UtjU8J.js";import{R as nt}from"./RecordPaymentModal-CFG7pDFU.js";import{C as ot}from"./cil-mobile-CeKkmNgt.js";import{C as at,a as rt}from"./CCardBody-CmpV1lA4.js";import{C as dt}from"./CCardHeader-CTLciU6o.js";import{C as lt}from"./DefaultLayout-B9m2Op0L.js";import{C as A}from"./CButton-1GsZ7-l4.js";import{c as ct}from"./cil-arrow-left-D66Kb3Zq.js";import{c as mt}from"./cil-credit-card-KG5pHjdT.js";import"./jspdf.es.min-CzbIXxHz.js";import"./jspdf.es.min-P9DMHkwx.js";import"./typeof-QjJsDpFa.js";import"./html2canvas-Cp8pj6h7.js";import"./Feilds-BHjWXeSc.js";import"./cil-pencil-m516yCOw.js";import"./CForm-CvVYu-wE.js";import"./CFormLabel-Dc8HuNh9.js";import"./CFormInput-l8xIFq1a.js";import"./CFormControlWrapper-Bm4xoNnJ.js";import"./CFormSelect-BEYL04sy.js";import"./cil-x-0440B5Ce.js";import"./RawMaterial-BtjEDAbB.js";const pt={english:{name:"English",labels:{proformaInvoice:"Proforma Invoice",invoiceNo:"Invoice No:",tallyInvoiceNo:"Tally Invoice No:",invoiceDate:"Invoice Date:",deliveryDate:"Delivery Date:",workOrder:"Work Order:",project:"Project:",customer:"Customer:",location:"Location:",mobile:"Mobile:",workDetails:"Work Details",srNo:"Sr. No.",workType:"Work Type",quantity:"Quantity",price:"Price (₹)",total:"Total (₹)",remark:"Remark",subtotal:"Subtotal:",discount:"Discount:",taxableAmount:"Taxable Amount:",cgst:"CGST",sgst:"SGST",igst:"IGST",totalGst:"Total GST:",finalAmount:"Final Amount:",paidAmount:"Paid Amount:",pendingAmount:"Pending Amount:",termsConditions:"Terms & Conditions",notes:"Notes",authorizedSignature:"Authorized Signature",footer:"This is a computer generated proforma invoice."}},marathi:{name:"मराठी",labels:{proformaInvoice:"प्रोफॉर्मा इनव्हॉईस",invoiceNo:"इनव्हॉईस क्रमांक:",tallyInvoiceNo:"टॅली इनव्हॉईस क्रमांक:",invoiceDate:"इनव्हॉईस तारीख:",deliveryDate:"डिलिव्हरी तारीख:",workOrder:"वर्क ऑर्डर:",project:"प्रकल्प:",customer:"ग्राहक:",location:"स्थान:",mobile:"मोबाईल:",workDetails:"कामाचे तपशील",srNo:"अ.क्र.",workType:"काम प्रकार",quantity:"प्रमाण",price:"किंमत (₹)",total:"एकूण (₹)",remark:"टिप्पणी",subtotal:"उपएकूण:",discount:"सूट:",taxableAmount:"करपात्र रक्कम:",cgst:"सीजीएसटी",sgst:"एसजीएसटी",igst:"आयजीएसटी",totalGst:"एकूण जीएसटी:",finalAmount:"अंतिम रक्कम:",paidAmount:"भरलेली रक्कम:",pendingAmount:"शिल्लक रक्कम:",termsConditions:"अटी व शर्ती",notes:"टिपा",authorizedSignature:"अधिकृत स्वाक्षरी",footer:"हे संगणकाद्वारे तयार केलेले प्रोफॉर्मा इनव्हॉईस आहे."}},tamil:{name:"தமிழ்",labels:{proformaInvoice:"ப்ரோஃபார்மா விலைப்பட்டியல்",invoiceNo:"விலைப்பட்டியல் எண்:",tallyInvoiceNo:"டாலி விலைப்பட்டியல் எண்:",invoiceDate:"விலைப்பட்டியல் தேதி:",deliveryDate:"விநியோக தேதி:",workOrder:"வேலை ஆர்டர்:",project:"திட்டம்:",customer:"வாடிக்கையாளர்:",location:"இடம்:",mobile:"கைபேசி:",workDetails:"வேலை விவரங்கள்",srNo:"வ.எண்.",workType:"வேலை வகை",quantity:"அளவு",price:"விலை (₹)",total:"மொத்தம் (₹)",remark:"குறிப்பு",subtotal:"துணை மொத்தம்:",discount:"தள்ளுபடி:",taxableAmount:"வரி விதிக்கக்கூடிய தொகை:",cgst:"சிஜிஎஸ்டி",sgst:"எஸ்ஜிஎஸ்டி",igst:"ஐஜிஎஸ்டி",totalGst:"மொத்த ஜிஎஸ்டி:",finalAmount:"இறுதி தொகை:",paidAmount:"செலுத்திய தொகை:",pendingAmount:"நிலுவை தொகை:",termsConditions:"விதிமுறைகள் மற்றும் நிபந்தனைகள்",notes:"குறிப்புகள்",authorizedSignature:"அங்கீகரிக்கப்பட்ட கையொப்பம்",footer:"இது கணினியால் உருவாக்கப்பட்ட ப்ரோஃபார்மா விலைப்பட்டியல்."}},bengali:{name:"বাংলা",labels:{proformaInvoice:"প্রোফর্মা ইনভয়েস",invoiceNo:"ইনভয়েস নম্বর:",tallyInvoiceNo:"ট্যালি ইনভয়েস নম্বর:",invoiceDate:"ইনভয়েসের তারিখ:",deliveryDate:"ডেলিভারির তারিখ:",workOrder:"ওয়ার্ক অর্ডার:",project:"প্রকল্প:",customer:"গ্রাহক:",location:"অবস্থান:",mobile:"মোবাইল:",workDetails:"কাজের বিবরণ",srNo:"ক্র.নং.",workType:"কাজের ধরন",quantity:"পরিমাণ",price:"মূল্য (₹)",total:"মোট (₹)",remark:"মন্তব্য",subtotal:"উপমোট:",discount:"ছাড়:",taxableAmount:"করযোগ্য পরিমাণ:",cgst:"সিজিএসটি",sgst:"এসজিএসটি",igst:"আইজিএসটি",totalGst:"মোট জিএসটি:",finalAmount:"চূড়ান্ত পরিমাণ:",paidAmount:"প্রদত্ত পরিমাণ:",pendingAmount:"বাকি পরিমাণ:",termsConditions:"শর্তাবলী",notes:"নোট",authorizedSignature:"অনুমোদিত স্বাক্ষর",footer:"এটি একটি কম্পিউটার তৈরি প্রোফর্মা ইনভয়েস."}}},xt=async(i,$="english",l="save")=>{var N;const o=pt[$].labels,e=et(),s=`
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
${(()=>{var _,x,h,g,b,y,f,u,n,a,D,S,C,T,O,G,L,R,W,M,E,q,B,U,X;const d=Array.isArray(i.details)?i.details:[],m=Math.ceil(d.length/19),z=(r=>"Rupees "+parseFloat(r).toFixed(2)+" Only")(i.pending_amount||0);let p="";for(let r=0;r<m;r++){const F=r*19,I=F+19,Q=d.slice(F,I),J=r===m-1;p+=`
      ${r>0?'<div class="page-break"></div>':""}
      <div class="invoice-box">
        <div class="content-wrapper">
        
        ${r===0?`
        <!-- ===== Header on first page ===== -->
        <table class="company-header" style="width: 100%; margin-bottom: 5px;">
          <tr>
            <td style="width: 70%; vertical-align: top;">
              <div style="font-size: 22px; font-weight: bold; line-height: 1.2;">
                ${((_=e==null?void 0:e.company_info)==null?void 0:_.company_name)||"Company Name"}
              </div>
              <div style="font-size: 11px; margin-top: 2px;">
                ${((x=e==null?void 0:e.company_info)==null?void 0:x.land_mark)||"-"}
              </div>
              <div style="font-size: 11px; margin-top: 3px;">
                <b>Phone:</b> ${((h=e==null?void 0:e.company_info)==null?void 0:h.phone_no)||"-"}
              </div>
            </td>
            <td style="width: 30%; text-align: right; vertical-align: top;">
              ${(g=e==null?void 0:e.company_info)!=null&&g.logo?`
              <img 
                src='/img/${e.company_info.logo}' 
                alt="Company Logo" 
                style="width: 75px; height: 75px; object-fit: contain; border: 1px solid #ccc; border-radius: 5px;"
              />
              `:""}
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
          ${o.proformaInvoice}
        </div>

        <table style="border: 1px solid #000; margin: 6px 0;">
          <tr>
            <th style="border: 1px solid #000; background: #d9e9ff; font-size: 11px; padding: 4px;">FROM :</th>
            <th style="border: 1px solid #000; background: #d9e9ff; font-size: 11px; padding: 4px;">TO :</th>
            <th style="border: 1px solid #000; background: #d9e9ff; font-size: 11px; padding: 4px;">DETAILS :</th>
          </tr>
          <tr>
            <td style="border: 1px solid #000; font-size: 10px; padding: 5px; line-height: 1.4;">
              <b>${((b=e==null?void 0:e.company_info)==null?void 0:b.company_name)||"Company Name"}</b><br/>
              ${(e==null?void 0:e.name)||"Owner Name"}<br/>
              ${((y=e==null?void 0:e.company_info)==null?void 0:y.land_mark)||"-"}<br/>
              <b>Phone:</b> ${((f=e==null?void 0:e.company_info)==null?void 0:f.phone_no)||"N/A"}<br/>
              <b>Email:</b> ${((u=e==null?void 0:e.company_info)==null?void 0:u.email_id)||"N/A"}<br/>
              <b>GSTIN:</b> ${(e==null?void 0:e.gst)||"N/A"}<br/>
              Dist: ${((n=e==null?void 0:e.company_info)==null?void 0:n.Dist)||"-"}<br/>
              Tal: ${((a=e==null?void 0:e.company_info)==null?void 0:a.Tal)||"-"}
            </td>
            <td style="border: 1px solid #000; font-size: 10px; padding: 5px; line-height: 1.4;">
              <b>Customer Name:</b> ${((D=i.customer)==null?void 0:D.name)||"N/A"}<br/>
              <b>Site:</b> ${((S=i.project)==null?void 0:S.project_name)||"N/A"}<br/>
              ${((C=i.customer)==null?void 0:C.address)||"N/A"}<br/>
              <b>Phone:</b> ${((T=i.customer)==null?void 0:T.mobile)||"N/A"}<br/>
              <b>GSTIN:</b> ${((O=i.customer)==null?void 0:O.gstin)||"-"}<br/>
              <b>PAN:</b> ${((G=i.customer)==null?void 0:G.pan)||"-"}
            </td>
            <td style="border: 1px solid #000; font-size: 10px; padding: 5px; line-height: 1.4;">
              <b>Invoice No:</b> ${i.proforma_invoice_number}<br/>
              ${i.tally_invoice_number?`<b>Tally Invoice No:</b> ${i.tally_invoice_number}<br/>`:""}
              <b>Invoice Date:</b> ${new Date(i.invoice_date).toLocaleDateString()}<br/>
              ${i.delivery_date?`<b>Delivery Date:</b> ${new Date(i.delivery_date).toLocaleDateString()}`:""}
              <b>Work Order ID : </b> ${((L=i.work_order)==null?void 0:L.invoice_number)||"N/A"}
            </td>
          </tr>
        </table>
        `:""}

        <table class="details-table" style="margin-top: 8px;">
          ${r===0?`
          <thead>
            <tr>
              <th style="width: 6%; font-size: 10px;">${o.srNo}</th>
              <th style="width: 38%; font-size: 10px;">${o.workType}</th>
              <th style="width: 10%; font-size: 10px;">Unit of Measurement</th>
              <th style="width: 10%; font-size: 10px;">${o.quantity}</th>
              <th style="width: 18%; font-size: 10px;">${o.price}</th>
              <th style="width: 18%; font-size: 10px;">${o.total}</th>
            </tr>
          </thead>`:""}
          <tbody>
            ${Q.map((j,K)=>`
              <tr>
                <td class="center" style="width: 6%; font-size: 10px;">${K+1+F}</td>
                <td style="width: 38%; font-size: 10px;">${j.work_type||"-"}</td>
                <td class="center" style="width: 10%; font-size: 10px;">${j.uom||"-"}</td>
                <td class="center" style="width: 10%; font-size: 10px;">${j.qty||0}</td>
                <td class="right" style="width: 18%; font-size: 10px;">₹${parseFloat(j.price||0).toFixed(2)}</td>
                <td class="right" style="width: 18%; font-size: 10px;">₹${parseFloat(j.total_price||0).toFixed(2)}</td>
              </tr>`).join("")}
          </tbody>
        </table>

        ${J?`
        <div class="no-split">
          <table class="summary" style="margin-top: 8px; width: 100%;">
            <tr>
              <th style="font-size: 11px;">${o.subtotal}</th>
              <td class="right" style="font-size: 11px;">₹${parseFloat(i.subtotal||0).toFixed(2)}</td>
            </tr>
            ${i.discount>0?`
            <tr>
              <th style="font-size: 11px;">${o.discount}</th>
              <td class="right" style="font-size: 11px;">₹${parseFloat(i.discount||0).toFixed(2)}</td>
            </tr>`:""}
            <tr>
              <th style="font-size: 11px;">${o.taxableAmount}</th>
              <td class="right" style="font-size: 11px;">₹${parseFloat(i.taxable_amount||0).toFixed(2)}</td>
            </tr>
            <tr>
              <th style="font-size: 11px;">${o.cgst} (${i.cgst_percentage}%)</th>
              <td class="right" style="font-size: 11px;">₹${parseFloat(i.cgst_amount||0).toFixed(2)}</td>
            </tr>
            <tr>
              <th style="font-size: 11px;">${o.sgst} (${i.sgst_percentage}%)</th>
              <td class="right" style="font-size: 11px;">₹${parseFloat(i.sgst_amount||0).toFixed(2)}</td>
            </tr>
            ${i.igst_amount>0?`
            <tr>
              <th style="font-size: 11px;">${o.igst} (${i.igst_percentage}%)</th>
              <td class="right" style="font-size: 11px;">₹${parseFloat(i.igst_amount||0).toFixed(2)}</td>
            </tr>`:""}
            <tr>
              <th style="font-size: 11px;">${o.finalAmount}</th>
              <td class="right" style="font-size: 11px;">₹${parseFloat(i.final_amount||0).toFixed(2)}</td>
            </tr>
            <tr>
              <th style="font-size: 11px; background: #d4edda;">${o.paidAmount}</th>
              <td class="right" style="font-size: 11px; background: #d4edda;">₹${parseFloat(i.paid_amount||0).toFixed(2)}</td>
            </tr>
            <tr>
              <th style="font-size: 11px; background: #fff3cd;">
                ${o.pendingAmount}<br />
                <span style="font-weight: normal; font-size: 10px;">
                  ${o.amountInWords} ${z} ${o.only}
                </span>
              </th>
              <td class="right" style="font-size: 11px; background: #fff3cd;">₹${parseFloat(i.pending_amount||0).toFixed(2)}</td>
            </tr>
          </table>

          ${(R=e==null?void 0:e.company_info)!=null&&R.sign?`
          <div style="text-align: right; margin-top: 20px;">
            <img src="/img/${e.company_info.sign}" style="width: 120px; height: 40px;" /><br/>
            <p>${o.authorizedSignature}</p>
          </div>
          `:""}
        </div>
        `:""}
        </div>

        <div class="foot">
          ${o.footer||o.footerNote||""}
        </div>
        <div class="footer">
          <div class="footer-content">
            <div class="footer-item">
              <span>✉️</span>
              <span>${((W=e==null?void 0:e.company_info)==null?void 0:W.email_id)||"deshmukhinfra@gmail.com"}</span>
            </div>
            <div class="footer-item">
              <span>🌐</span>
              <span>www.deshmukhinfrasolutions.com</span>
            </div>
          </div>
        </div>
      </div>
    `}return(((M=i.invoice_rules)==null?void 0:M.length)>0||i.notes)&&(p+=`
    <div class="page-break"></div>
    <div class="invoice-box">
      <div class="content-wrapper">
        <table class="company-header" style="width: 100%; margin-bottom: 5px;">
          <tr>
            <td style="width: 70%; vertical-align: top;">
              <div style="font-size: 22px; font-weight: bold; line-height: 1.2;">
                ${((E=e==null?void 0:e.company_info)==null?void 0:E.company_name)||"Company Name"}
              </div>
              <div style="font-size: 11px; margin-top: 2px;">
                ${((q=e==null?void 0:e.company_info)==null?void 0:q.land_mark)||"-"}
              </div>
              <div style="font-size: 11px; margin-top: 3px;">
                <b>Phone:</b> ${((B=e==null?void 0:e.company_info)==null?void 0:B.phone_no)||"-"}
              </div>
            </td>
            <td style="width: 30%; text-align: right; vertical-align: top;">
              ${(U=e==null?void 0:e.company_info)!=null&&U.logo?`
              <img 
                src='/img/${e.company_info.logo}' 
                alt="Company Logo" 
                style="width: 75px; height: 75px; object-fit: contain; border: 1px solid #ccc; border-radius: 5px;"
              />
              `:""}
            </td>
          </tr>
        </table>

        <hr style="border: 1px solid black; margin: 3px 0;" />

        ${i.notes?`
        <div class="terms-section">
          <h3>${o.notes}</h3>
          <div class="terms-content">${i.notes}</div>
        </div>
        `:""}

        


${i.payment_terms?`
        <div class="terms-section">
          <h3>Payment Terms</h3>
          <div class="terms-content">${i.payment_terms}</div>
        </div>
        `:""}


        ${i.terms_conditions?`
        <div class="terms-section">
          <h3>Terms & Conditions</h3>
          <div class="terms-content">${i.terms_conditions}</div>
        </div>
        `:""}



      </div>

      <div class="footer">
        <div class="footer-content">
          <div class="footer-item">
            <span>✉️</span>
            <span>${((X=e==null?void 0:e.company_info)==null?void 0:X.email_id)||"deshmukhinfra@gmail.com"}</span>
          </div>
          <div class="footer-item">
            <span>🌐</span>
            <span>www.deshmukhinfrasolutions.com</span>
          </div>
        </div>
      </div>
    </div>
    `),p})()}
</body>
</html>
`,w={margin:.5,filename:`${i.proforma_invoice_number}_${((N=i.customer)==null?void 0:N.name)||"invoice"}.pdf`,image:{type:"jpeg",quality:.98},html2canvas:{scale:2,useCORS:!0},jsPDF:{unit:"in",format:"a4",orientation:"portrait"}},c=it().set(w).from(s);if(l==="blob")return c.outputPdf("blob");if(l==="save")return c.save()},Wt=()=>{var h,g,b,y,f,u;const{id:i}=V(),$=Y(),{showToast:l}=Z(),[o,e]=v.useState(!0),[s,w]=v.useState(null),[c,N]=v.useState("english"),[k,d]=v.useState(!1);v.useEffect(()=>{m()},[i]);const m=async()=>{try{e(!0);const n=await st(`/api/proforma-invoices/${i}`);n.success?w(n.data):l("danger","Failed to fetch proforma invoice")}catch(n){console.error("Error fetching proforma invoice:",n),l("danger","Error fetching proforma invoice details")}finally{e(!1)}},P=()=>{d(!0)},z=()=>{m(),d(!1)},p=async()=>{s&&await xt(s,c,"save")},_=n=>{const a={pending:{color:"danger",text:"Pending"},partial:{color:"warning",text:"Partially Paid"},paid:{color:"success",text:"Fully Paid"}};return a[n]||a.pending};if(o)return t.jsxs("div",{className:"text-center py-5",children:[t.jsx(tt,{color:"primary"}),t.jsx("div",{className:"mt-2",children:"Loading proforma invoice..."})]});if(!s)return t.jsx(ot,{color:"warning",children:"Proforma invoice not found"});const x=_(s.payment_status);return t.jsxs(t.Fragment,{children:[t.jsxs(at,{children:[t.jsx(dt,{children:t.jsxs("div",{className:"d-flex justify-content-between align-items-center",children:[t.jsxs("h5",{children:["Proforma Invoice ",s.proforma_invoice_number]}),t.jsxs("div",{children:[t.jsx(lt,{color:x.color,className:"me-2",children:x.text}),t.jsxs(A,{color:"secondary",size:"sm",onClick:()=>$("/invoiceTable"),children:[t.jsx(H,{icon:ct,className:"me-1"}),"Back"]})]})]})}),t.jsxs(rt,{children:[t.jsxs("div",{className:"row section mb-4",children:[t.jsxs("div",{className:"col-md-6",children:[t.jsx("h6",{children:"Invoice Information"}),t.jsxs("p",{children:[t.jsx("strong",{children:"Proforma Invoice :"})," ",s.proforma_invoice_number]}),s.tally_invoice_number&&t.jsxs("p",{children:[t.jsx("strong",{children:"Tally Invoice :"})," ",s.tally_invoice_number]}),t.jsxs("p",{children:[t.jsx("strong",{children:"Invoice Date:"})," ",new Date(s.invoice_date).toLocaleDateString()]}),s.delivery_date&&t.jsxs("p",{children:[t.jsx("strong",{children:"Delivery Date:"})," ",new Date(s.delivery_date).toLocaleDateString()]})]}),t.jsxs("div",{className:"col-md-6",children:[t.jsx("h6",{children:"Work Order & Project Information"}),t.jsxs("p",{children:[t.jsx("strong",{children:"Work Order :"})," ",(h=s.work_order)==null?void 0:h.invoice_number]}),t.jsxs("p",{children:[t.jsx("strong",{children:"Project:"})," ",(g=s.project)==null?void 0:g.project_name]}),t.jsxs("p",{children:[t.jsx("strong",{children:"Customer:"})," ",(b=s.customer)==null?void 0:b.name]}),t.jsxs("p",{children:[t.jsx("strong",{children:"Location:"})," ",(y=s.customer)==null?void 0:y.address]}),t.jsxs("p",{children:[t.jsx("strong",{children:"Mobile:"})," ",(f=s.customer)==null?void 0:f.mobile]})]})]}),t.jsx("div",{className:"row section mb-4",children:t.jsxs("div",{className:"col-md-12",children:[t.jsx("h6",{children:"Work Details"}),t.jsxs("table",{className:"table table-bordered",children:[t.jsx("thead",{children:t.jsxs("tr",{children:[t.jsx("th",{children:"Sr. No."}),t.jsx("th",{children:"Work Type"}),t.jsx("th",{children:"Unit"}),t.jsx("th",{children:"Quantity"}),t.jsx("th",{children:"Price"}),t.jsx("th",{children:"Total"}),t.jsx("th",{children:"Remark"})]})}),t.jsx("tbody",{children:s.details&&s.details.length>0?s.details.map((n,a)=>t.jsxs("tr",{children:[t.jsx("td",{children:a+1}),t.jsx("td",{children:n.work_type}),t.jsx("td",{children:n.uom}),t.jsx("td",{children:n.qty}),t.jsxs("td",{children:["₹",parseFloat(n.price).toFixed(2)]}),t.jsxs("td",{children:["₹",parseFloat(n.total_price).toFixed(2)]}),t.jsx("td",{children:n.remark||"-"})]},a)):t.jsx("tr",{children:t.jsx("td",{colSpan:"6",className:"text-center",children:"No work details available"})})})]})]})}),t.jsx("div",{className:"row section mb-4",children:t.jsxs("div",{className:"col-md-12",children:[t.jsx("h6",{children:"Financial Summary"}),t.jsx("table",{className:"table table-bordered",children:t.jsxs("tbody",{children:[t.jsxs("tr",{children:[t.jsx("td",{children:t.jsx("strong",{children:"Subtotal:"})}),t.jsxs("td",{className:"text-end",children:["₹",parseFloat(s.subtotal).toFixed(2)]})]}),s.discount>0&&t.jsxs("tr",{children:[t.jsx("td",{children:t.jsx("strong",{children:"Discount:"})}),t.jsxs("td",{className:"text-end",children:["₹",parseFloat(s.discount).toFixed(2)]})]}),t.jsxs("tr",{children:[t.jsx("td",{children:t.jsx("strong",{children:"Taxable Amount:"})}),t.jsxs("td",{className:"text-end",children:["₹",parseFloat(s.taxable_amount).toFixed(2)]})]}),t.jsxs("tr",{children:[t.jsx("td",{children:t.jsxs("strong",{children:["CGST (",s.cgst_percentage,"%):"]})}),t.jsxs("td",{className:"text-end",children:["₹",parseFloat(s.cgst_amount).toFixed(2)]})]}),t.jsxs("tr",{children:[t.jsx("td",{children:t.jsxs("strong",{children:["SGST (",s.sgst_percentage,"%):"]})}),t.jsxs("td",{className:"text-end",children:["₹",parseFloat(s.sgst_amount).toFixed(2)]})]}),s.igst_amount>0&&t.jsxs("tr",{children:[t.jsx("td",{children:t.jsxs("strong",{children:["IGST (",s.igst_percentage,"%):"]})}),t.jsxs("td",{className:"text-end",children:["₹",parseFloat(s.igst_amount).toFixed(2)]})]}),t.jsxs("tr",{children:[t.jsx("td",{children:t.jsx("strong",{children:"Total GST:"})}),t.jsxs("td",{className:"text-end",children:["₹",parseFloat(s.gst_amount).toFixed(2)]})]}),t.jsxs("tr",{className:"table-primary",children:[t.jsx("td",{children:t.jsx("strong",{children:"Final Amount:"})}),t.jsx("td",{className:"text-end",children:t.jsxs("strong",{children:["₹",parseFloat(s.final_amount).toFixed(2)]})})]}),t.jsxs("tr",{className:"table-success",children:[t.jsx("td",{children:t.jsx("strong",{children:"Paid Amount:"})}),t.jsxs("td",{className:"text-end",children:["₹",parseFloat(s.paid_amount).toFixed(2)]})]}),t.jsxs("tr",{className:"table-warning",children:[t.jsx("td",{children:t.jsx("strong",{children:"Pending Amount:"})}),t.jsxs("td",{className:"text-end",children:["₹",parseFloat(s.pending_amount).toFixed(2)]})]})]})})]})}),s.notes&&t.jsx("div",{className:"row section mb-4",children:t.jsxs("div",{className:"col-md-12",children:[t.jsx("h6",{children:"Additional Notes"}),t.jsx("p",{children:s.notes})]})}),t.jsx("div",{className:"row section mb-4",children:t.jsxs("div",{className:"col-md-12",children:[s.payment_terms&&t.jsxs(t.Fragment,{children:[t.jsx("h6",{className:"mt-3",children:"Payment Terms"}),t.jsx("ul",{children:s.payment_terms.split(`
`).filter(n=>n.trim()!=="").map((n,a)=>t.jsx("li",{children:n},a))})]}),s.terms_conditions&&t.jsxs(t.Fragment,{children:[t.jsx("h6",{children:"Terms & Conditions"}),t.jsx("ul",{children:s.terms_conditions.split(`
`).filter(n=>n.trim()!=="").map((n,a)=>t.jsx("li",{children:n},a))})]})]})}),t.jsxs("div",{className:"d-flex justify-content-center flex-wrap gap-2 d-print-none",children:[s.pending_amount>0&&t.jsxs(A,{color:"success",onClick:P,children:[t.jsx(H,{icon:mt,className:"me-1"}),"Record Payment"]}),t.jsxs(A,{color:"info",onClick:p,children:["Download PDF (",c,")"]})]})]})]}),k&&t.jsx(nt,{visible:k,onClose:()=>d(!1),orderData:{id:s.id,proforma_invoice_id:s.id,invoice_number:s.proforma_invoice_number,project_name:(u=s.project)==null?void 0:u.project_name,finalAmount:s.final_amount,paidAmount:s.paid_amount,isProformaInvoice:!0},onPaymentRecorded:z})]})};export{Wt as default};
