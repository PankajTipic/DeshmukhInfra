import{d as J,u as K,b as V,r as z,j as t,C as X}from"./index-CNMq-rCg.js";import{c as Y}from"./index.esm-Bbeoo9c3.js";import{g as I,a as tt}from"./api-CZlTOVJA.js";import{h as et}from"./html2pdf-B20Ybkn5.js";import{R as st}from"./RecordPaymentModal-DUUyNS_V.js";import{C as at}from"./cil-mobile-DjqsD1wp.js";import{C as ot,a as rt}from"./CCardBody-DLWCLQvj.js";import{C as lt}from"./CCardHeader-BdKdg7pI.js";import{C as nt}from"./DefaultLayout-Cno0YDHn.js";import{C as Q}from"./CButton-YpSFTA1o.js";import{c as it}from"./cil-pencil-m516yCOw.js";import{c as dt}from"./cil-credit-card-KG5pHjdT.js";import"./jspdf.es.min-nUgWeO4W.js";import"./typeof-QjJsDpFa.js";import"./html2canvas-DEoSsVVa.js";import"./Feilds-BHjWXeSc.js";import"./CForm-B8lPynQY.js";import"./CFormLabel-DGPk2V6A.js";import"./CFormInput-Nbj_qCx9.js";import"./CFormControlWrapper-CwLfWU8E.js";import"./CFormSelect-D_Pn3B5f.js";import"./cil-x-0440B5Ce.js";import"./RawMaterial-BtjEDAbB.js";const ct={english:{name:"English",labels:{proformaInvoice:"Proforma Invoice",invoiceNo:"Invoice No:",tallyInvoiceNo:"Tally Invoice No:",invoiceDate:"Invoice Date:",deliveryDate:"Delivery Date:",workOrder:"Work Order:",project:"Project:",customer:"Customer:",location:"Location:",mobile:"Mobile:",workDetails:"Work Details",srNo:"Sr. No.",workType:"Work Type",unit:"Unit",quantity:"Quantity",price:"Price",baseAmount:"Base Amount",gstPercent:"GST %",cgst:"CGST",sgst:"SGST",igst:"IGST",total:"Total",subtotal:"Subtotal:",discount:"Discount:",taxableAmount:"Taxable Amount:",gstDetails:"GST Details",totalGst:"Total GST:",finalAmount:"Final Amount:",grandTotal:"Grand Total:",paidAmount:"Amount Paid:",balanceAmount:"Balance Amount:",amountInWords:"Amount in Words:",only:"Only",paymentTerms:"Payment Terms",termsConditions:"Terms & Conditions",notes:"Notes",authorizedSignature:"Authorized Signature",footer:"This invoice has been computer-generated and is authorized."}},marathi:{name:"मराठी",labels:{proformaInvoice:"प्रोफॉर्मा इनव्हॉईस",invoiceNo:"इनव्हॉईस क्रमांक:",tallyInvoiceNo:"टॅली इनव्हॉईस क्रमांक:",invoiceDate:"इनव्हॉईस तारीख:",deliveryDate:"डिलिव्हरी तारीख:",workOrder:"वर्क ऑर्डर:",project:"प्रकल्प:",customer:"ग्राहक:",location:"स्थान:",mobile:"मोबाईल:",workDetails:"कामाचे तपशील",srNo:"अ.क्र.",workType:"काम प्रकार",unit:"युनिट",quantity:"प्रमाण",price:"किंमत",baseAmount:"मूळ रक्कम",gstPercent:"जीएसटी %",cgst:"सीजीएसटी",sgst:"एसजीएसटी",igst:"आयजीएसटी",total:"एकूण",subtotal:"उपएकूण:",discount:"सूट:",taxableAmount:"करपात्र रक्कम:",gstDetails:"जीएसटी तपशील",totalGst:"एकूण जीएसटी:",finalAmount:"अंतिम रक्कम:",grandTotal:"एकूण रक्कम:",paidAmount:"भरलेली रक्कम:",balanceAmount:"शिल्लक रक्कम:",amountInWords:"रकमा शब्दांत:",only:"फक्त",paymentTerms:"पेमेंट अटी",termsConditions:"अटी व शर्ती",notes:"टिपा",authorizedSignature:"अधिकृत स्वाक्षरी",footer:"हे संगणकाद्वारे तयार केलेले इनव्हॉईस अधिकृत आहे."}}},mt=a=>{if(a===0)return"Zero";const F=["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine"],T=["Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"],l=["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"],s=i=>{let u="";return i>=100&&(u+=F[Math.floor(i/100)]+" Hundred ",i%=100),i>=20?(u+=l[Math.floor(i/10)],i%10>0&&(u+=" "+F[i%10])):i>=10?u+=T[i-10]:i>0&&(u+=F[i]),u.trim()};let e="",n=Math.floor(a);if(n>=1e7){const i=Math.floor(n/1e7);e+=s(i)+" Crore ",n%=1e7}if(n>=1e5){const i=Math.floor(n/1e5);e+=s(i)+" Lakh ",n%=1e5}if(n>=1e3){const i=Math.floor(n/1e3);e+=s(i)+" Thousand ",n%=1e3}return n>0&&(e+=s(n)),e.trim()+" Rupees Only"},ht=async(a,F="english",T="save")=>{var E,O,q,L,B,U,N,m,H,h,S,w,v,G,A,P,C,D,r;const l=ct[F].labels,s=I(),e=(a.details||[]).sort((o,d)=>o.id-d.id),n=e.some(o=>(parseFloat(o.gst_percent)||0)>0||(parseFloat(o.cgst_amount)||0)>0||(parseFloat(o.sgst_amount)||0)>0),i=(parseFloat(a.cgst_amount)||0)>0||(parseFloat(a.sgst_amount)||0)>0||(parseFloat(a.igst_amount)||0)>0,u=e.reduce((o,d)=>o+(parseFloat(d.total_price)||0),0),R=mt(parseFloat(a.pending_amount)||0),$=`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page { size: A4; margin: 0; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 11px; }
    .invoice-box { 
      padding: 20px; 
      border: 3px solid #000; 
      page-break-after: always;
    }
    table { width: 100%; border-collapse: collapse; }
    .border-table { border: 1px solid #000; }
    .border-table th, .border-table td { 
      border: 1px solid #000; 
      padding: 4px; 
      font-size: 10px;
    }
    .border-table th { background: #d9e9ff; font-weight: bold; }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .text-left { text-align: left; }
    .header-title {
      background: #cfe2ff;
      text-align: center;
      font-weight: bold;
      font-size: 16px;
      padding: 5px;
      border: 1px solid #000;
      margin: 5px 0;
    }
    .section-title {
      font-size: 12px;
      font-weight: bold;
      color: #0066cc;
      border-bottom: 2px solid #0066cc;
      padding-bottom: 3px;
      margin: 8px 0 5px 0;
    }
    .terms-content {
      white-space: pre-line;
      line-height: 1.4;
      padding: 5px;
    }
    .footer-bar {
      display: flex;
      justify-content: space-between;
      padding: 8px 20px;
      font-size: 10px;
      margin-top: 10px;
    }
  </style>
</head>
<body>
  <div class="invoice-box">
    <!-- Company Header -->
    <table style="margin-bottom: 5px;">
      <tr>
        <td style="width: 70%;">
          <div style="font-size: 20px; font-weight: bold;">${((E=s==null?void 0:s.company_info)==null?void 0:E.company_name)||"Company Name"}</div>
          <div style="font-size: 10px; margin-top: 2px;">${((O=s==null?void 0:s.company_info)==null?void 0:O.land_mark)||"-"}</div>
          <div style="font-size: 10px;"><b>Phone:</b> ${((q=s==null?void 0:s.company_info)==null?void 0:q.phone_no)||"-"}</div>
        </td>
        <td style="width: 30%; text-align: right;">
          ${(L=s==null?void 0:s.company_info)!=null&&L.logo?`<img src="/img/${s.company_info.logo}" style="width: 70px; height: 70px; object-fit: contain; border: 1px solid #ccc; border-radius: 5px;" />`:""}
        </td>
      </tr>
    </table>

    <hr style="border: 1px solid #000; margin: 3px 0;" />

    <!-- Title -->
    <div class="header-title">${l.proformaInvoice}</div>

    <!-- From/To/Details -->
    <table class="border-table" style="margin: 5px 0;">
      <tr>
        <th>FROM:</th>
        <th>TO:</th>
        <th>DETAILS:</th>
      </tr>
      <tr>
        <td style="line-height: 1.3;">
          <b>${((B=s==null?void 0:s.company_info)==null?void 0:B.company_name)||"Company Name"}</b><br/>
          ${(s==null?void 0:s.name)||""}<br/>
          ${((U=s==null?void 0:s.company_info)==null?void 0:U.land_mark)||"-"}<br/>
          <b>Phone:</b> ${((N=s==null?void 0:s.company_info)==null?void 0:N.phone_no)||"N/A"}<br/>
          <b>Email:</b> ${((m=s==null?void 0:s.company_info)==null?void 0:m.email_id)||"N/A"}<br/>
          <b>GSTIN:</b> ${(s==null?void 0:s.gst)||"N/A"}
        </td>
        <td style="line-height: 1.3;">
          <b>${((H=a.customer)==null?void 0:H.name)||"N/A"}</b><br/>
          <b>Site:</b> ${((h=a.project)==null?void 0:h.project_name)||"N/A"}<br/>
          ${((S=a.customer)==null?void 0:S.address)||"N/A"}<br/>
          <b>Phone:</b> ${((w=a.customer)==null?void 0:w.mobile)||"N/A"}<br/>
          <b>GSTIN:</b> ${((v=a.customer)==null?void 0:v.gstin)||"-"}
        </td>
        <td style="line-height: 1.3;">
          <b>Invoice No:</b> ${a.proforma_invoice_number}<br/>
          ${a.tally_invoice_number?`<b>Tally Invoice:</b> ${a.tally_invoice_number}<br/>`:""}
          <b>Date:</b> ${new Date(a.invoice_date).toLocaleDateString()}<br/>
          ${a.delivery_date?`<b>Delivery:</b> ${new Date(a.delivery_date).toLocaleDateString()}<br/>`:""}
          <b>Work Order:</b> ${((G=a.work_order)==null?void 0:G.invoice_number)||"N/A"}
        </td>
      </tr>
    </table>

    <!-- Work Details Table -->
    <table class="border-table" style="margin-top: 5px;">
      <thead>
        <tr>
          <th style="width: 5%;">${l.srNo}</th>
          <th style="width: ${n?"25%":"35%"};">${l.workType}</th>
          <th style="width: 8%;">${l.unit}</th>
          <th style="width: 8%;">${l.quantity}</th>
          <th style="width: ${n?"10%":"16%"};">${l.price}</th>
          ${n?`
          <th style="width: 10%;">${l.baseAmount}</th>
          <th style="width: 7%;">${l.gstPercent}</th>
          <th style="width: 10%;">${l.cgst}</th>
          <th style="width: 10%;">${l.sgst}</th>
          `:""}
          <th style="width: ${n?"12%":"16%"};">${l.total}</th>
        </tr>
      </thead>
      <tbody>
        ${e.map((o,d)=>{const y=parseFloat(o.qty)||0,_=parseFloat(o.price)||0,b=y*_,c=parseFloat(o.gst_percent)||0,g=parseFloat(o.cgst_amount)||0,j=parseFloat(o.sgst_amount)||0,f=parseFloat(o.total_price)||0,x=c?c/2:0,p=c?c/2:0;return`
            <tr>
              <td class="text-center">${d+1}</td>
              <td>${o.work_type||"-"}</td>
              <td class="text-center">${o.uom||"-"}</td>
              <td class="text-center">${y.toFixed(2)}</td>
              <td class="text-right">₹${_.toFixed(2)}</td>
              ${n?`
              <td class="text-right">₹${b.toFixed(2)}</td>
              <td class="text-center">${c>0?c.toFixed(2)+"%":"-"}</td>
              <td class="text-right">${g>0?"₹"+g.toFixed(2)+" ("+x+"%)":"-"}</td>
              <td class="text-right">${j>0?"₹"+j.toFixed(2)+" ("+p+"%)":"-"}</td>
              `:""}
              <td class="text-right">₹${f.toFixed(2)}</td>
            </tr>
          `}).join("")}
        ${e.length>0?`
        <tr style="background: #fff3cd; font-weight: bold;">
          <td colspan="${n?"5":"4"}" class="text-right">Total:</td>
          ${n?`<td class="text-right">₹${e.reduce((o,d)=>o+(parseFloat(d.qty)||0)*(parseFloat(d.price)||0),0).toFixed(2)}</td>`:""}
          ${n?'<td class="text-center">-</td>':""}
          ${n?`<td class="text-right">₹${e.reduce((o,d)=>o+(parseFloat(d.cgst_amount)||0),0).toFixed(2)}</td>`:""}
          ${n?`<td class="text-right">₹${e.reduce((o,d)=>o+(parseFloat(d.sgst_amount)||0),0).toFixed(2)}</td>`:""}
          <td class="text-right">₹${u.toFixed(2)}</td>
        </tr>
        `:""}
      </tbody>
    </table>

    ${i?`
    <!-- GST Details Section -->
    <div class="section-title">${l.gstDetails}</div>
    <table class="border-table">
      <tr>
        <th class="text-left">${l.taxableAmount}</th>
        <td class="text-center">₹${u.toFixed(2)}</td>
      </tr>
      ${parseFloat(a.cgst_amount)>0?`
      <tr>
        <th class="text-left">${l.cgst} (${a.cgst_percentage_calculated||0}%)</th>
        <td class="text-center">₹${parseFloat(a.cgst_amount).toFixed(2)}</td>
      </tr>`:""}
      ${parseFloat(a.sgst_amount)>0?`
      <tr>
        <th class="text-left">${l.sgst} (${a.sgst_percentage_calculated||0}%)</th>
        <td class="text-center">₹${parseFloat(a.sgst_amount).toFixed(2)}</td>
      </tr>`:""}
      ${parseFloat(a.igst_amount)>0?`
      <tr>
        <th class="text-left">${l.igst} (${a.igst_percentage_calculated||0}%)</th>
        <td class="text-center">₹${parseFloat(a.igst_amount).toFixed(2)}</td>
      </tr>`:""}
      <tr style="background: #d4edda;">
        <th class="text-left">${l.totalGst}</th>
        <td class="text-center"><b>₹${(parseFloat(a.cgst_amount||0)+parseFloat(a.sgst_amount||0)+parseFloat(a.igst_amount||0)).toFixed(2)}</b></td>
      </tr>
    </table>
    `:""}

    ${parseFloat(a.discount)>0?`
    <!-- Discount Section -->
    <table class="border-table" style="margin-top: 5px;">
      <tr>
        <th class="text-left">${l.discount}</th>
        <td class="text-center">₹${parseFloat(a.discount).toFixed(2)}</td>
      </tr>
    </table>
    `:""}

    <!-- Grand Total -->
    <table class="border-table" style="margin-top: 5px;">
      <tr>
        <th class="text-left">${l.grandTotal}</th>
        <td class="text-center"><b>₹${parseFloat(a.final_amount).toFixed(2)}</b></td>
      </tr>
    </table>

    <!-- Payment Summary -->
    <table class="border-table" style="margin-top: 5px;">
      <tr>
        <th class="text-left">${l.paidAmount}</th>
        <td class="text-center">₹${parseFloat(a.paid_amount).toFixed(2)}</td>
      </tr>
      <tr style="background: #fff3cd;">
        <th class="text-left">${l.balanceAmount}</th>
        <td class="text-center">₹${parseFloat(a.pending_amount).toFixed(2)}</td>
      </tr>
    </table>

    <div style="margin-top: 5px; font-size: 10px;">
      <b>${l.amountInWords}</b> ${R}
    </div>

    ${(A=s==null?void 0:s.company_info)!=null&&A.sign?`
    <div style="text-align: right; margin-top: 15px;">
      <img src="/img/${s.company_info.sign}" style="width: 100px; height: 35px;" /><br/>
      <span style="font-size: 10px;">${l.authorizedSignature}</span>
    </div>
    `:""}

    <div class="footer-bar">
      <span>✉️ deshmukhinfra@gmail.com</span>
      <span>🌐 www.deshmukhinfrasolutions.com</span>
    </div>

    <div class="text-center" style="font-size: 9px; margin-top: 5px;">${l.footer}</div>
  </div>

  ${a.notes||a.payment_terms||a.terms_conditions?`
  <!-- Terms Page -->
  <div class="invoice-box">
    <table style="margin-bottom: 5px;">
      <tr>
        <td style="width: 70%;">
          <div style="font-size: 20px; font-weight: bold;">${((P=s==null?void 0:s.company_info)==null?void 0:P.company_name)||"Company Name"}</div>
          <div style="font-size: 10px;">${((C=s==null?void 0:s.company_info)==null?void 0:C.land_mark)||"-"}</div>
        </td>
        <td style="width: 30%; text-align: right;">
          ${(D=s==null?void 0:s.company_info)!=null&&D.logo?`<img src="/img/${s.company_info.logo}" style="width: 70px; height: 70px;" />`:""}
        </td>
      </tr>
    </table>
    <hr style="border: 1px solid #000; margin: 3px 0;" />

    ${a.notes?`
    <div class="section-title">${l.notes}</div>
    <div class="terms-content">${a.notes}</div>
    `:""}

    ${a.payment_terms?`
    <div class="section-title">${l.paymentTerms}</div>
    <div class="terms-content">${a.payment_terms}</div>
    `:""}

    ${a.terms_conditions?`
    <div class="section-title">${l.termsConditions}</div>
    <div class="terms-content">${a.terms_conditions}</div>
    `:""}

    <div class="footer-bar">
      <span>✉️ deshmukhinfra@gmail.com</span>
      <span>🌐 www.deshmukhinfrasolutions.com</span>
    </div>
  </div>
  `:""}
</body>
</html>
`,W={margin:.3,filename:`${a.proforma_invoice_number}_${((r=a.customer)==null?void 0:r.name)||"invoice"}.pdf`,image:{type:"jpeg",quality:.98},html2canvas:{scale:2,useCORS:!0},jsPDF:{unit:"in",format:"a4",orientation:"portrait"}},M=et().set(W).from($);if(T==="blob")return M.outputPdf("blob");if(T==="save")return M.save()},Rt=()=>{var S,w,v,G,A,P,C,D;const{id:a}=J(),F=K(),{showToast:T}=V(),[l,s]=z.useState(!0),[e,n]=z.useState(null),[i,u]=z.useState("english"),[R,$]=z.useState(!1);z.useEffect(()=>{W()},[a]);const W=async()=>{try{s(!0);const r=await tt(`/api/proforma-invoices/${a}`);if(r.success){const o=r.data;o.details&&Array.isArray(o.details)&&(o.details=o.details.sort((p,k)=>p.id-k.id));const d=parseFloat(o.cgst_amount)||0,y=parseFloat(o.sgst_amount)||0,_=parseFloat(o.igst_amount)||0,b=parseFloat(o.gst_amount)||0,c=(o.details||[]).reduce((p,k)=>p+(parseFloat(k.total_price)||0),0);let g=0,j=0,f=0,x=0;c>0&&(g=Math.round(d/c*100*100)/100,j=Math.round(y/c*100*100)/100,f=Math.round(_/c*100*100)/100,x=Math.round(b/c*100*100)/100),o.cgst_percentage_calculated=g,o.sgst_percentage_calculated=j,o.igst_percentage_calculated=f,o.gst_percentage_calculated=x,n(o)}else T("danger","Failed to fetch proforma invoice")}catch(r){console.error("Error fetching proforma invoice:",r),T("danger","Error fetching proforma invoice details")}finally{s(!1)}},M=()=>{$(!0)},E=()=>{W(),$(!1)},O=async()=>{e&&await ht(e,i,"save")},q=r=>{const o={pending:{color:"danger",text:"Pending"},partial:{color:"warning",text:"Partially Paid"},paid:{color:"success",text:"Fully Paid"}};return o[r]||o.pending},L=()=>!e||!e.details?!1:e.details.some(r=>(parseFloat(r.gst_percent)||0)>0||(parseFloat(r.cgst_amount)||0)>0||(parseFloat(r.sgst_amount)||0)>0),B=()=>e?(parseFloat(e.cgst_amount)||0)>0||(parseFloat(e.sgst_amount)||0)>0||(parseFloat(e.gst_amount)||0)>0||(parseFloat(e.igst_amount)||0)>0:!1,U=()=>{if(!e||!e.details)return{subtotalWithoutGST:0,rowCGST:0,rowSGST:0,rowTotalGST:0,totalAfterRowGST:0,globalCGST:0,globalSGST:0,globalIGST:0,globalTotalGST:0,grandTotalWithAllGST:0};const r=e.details.reduce((x,p)=>{const k=parseFloat(p.qty)||0,Z=parseFloat(p.price)||0;return x+k*Z},0),o=e.details.reduce((x,p)=>x+(parseFloat(p.cgst_amount)||0),0),d=e.details.reduce((x,p)=>x+(parseFloat(p.sgst_amount)||0),0),y=o+d,_=e.details.reduce((x,p)=>x+(parseFloat(p.total_price)||0),0),b=parseFloat(e.cgst_amount)||0,c=parseFloat(e.sgst_amount)||0,g=parseFloat(e.igst_amount)||0,j=b+c+g,f=_+j;return{subtotalWithoutGST:r,rowCGST:o,rowSGST:d,rowTotalGST:y,totalAfterRowGST:_,globalCGST:b,globalSGST:c,globalIGST:g,globalTotalGST:j,grandTotalWithAllGST:f}};if(l)return t.jsxs("div",{className:"text-center py-5",children:[t.jsx(X,{color:"primary"}),t.jsx("div",{className:"mt-2",children:"Loading proforma invoice..."})]});if(!e)return t.jsx(at,{color:"warning",children:"Proforma invoice not found"});const N=q(e.payment_status),m=L(),H=B(),h=U();return t.jsxs(t.Fragment,{children:[t.jsxs(ot,{children:[t.jsx(lt,{children:t.jsxs("div",{className:"d-flex justify-content-between align-items-center",children:[t.jsx("h5",{className:"mb-0",children:"Proforma Invoice Details"}),t.jsx(nt,{color:N.color,size:"lg",children:N.text})]})}),t.jsxs(rt,{children:[t.jsxs("div",{className:"row mb-4",children:[t.jsxs("div",{className:"col-md-6",children:[t.jsx("h6",{className:"fw-bold text-primary",children:"Bill To:"}),t.jsxs("p",{className:"mb-1",children:[t.jsx("strong",{children:"Name:"})," ",((S=e.project)==null?void 0:S.customer_name)||"N/A"]}),t.jsxs("p",{className:"mb-1",children:[t.jsx("strong",{children:"Address:"})," ",((w=e.project)==null?void 0:w.work_place)||"N/A"]}),t.jsxs("p",{className:"mb-1",children:[t.jsx("strong",{children:"Mobile:"})," ",((v=e.project)==null?void 0:v.mobile_number)||"N/A"]}),((G=e.project)==null?void 0:G.gst_number)&&t.jsxs("p",{className:"mb-1",children:[t.jsx("strong",{children:"GSTIN:"})," ",e.project.gst_number]})]}),t.jsxs("div",{className:"col-md-6 text-end",children:[t.jsx("h6",{className:"fw-bold text-primary",children:"Invoice Details:"}),t.jsxs("p",{className:"mb-1",children:[t.jsx("strong",{children:"Invoice No:"})," ",e.proforma_invoice_number]}),t.jsxs("p",{className:"mb-1",children:[t.jsx("strong",{children:"Date:"})," ",new Date(e.invoice_date).toLocaleDateString("en-IN")]}),t.jsxs("p",{className:"mb-1",children:[t.jsx("strong",{children:"Project:"})," ",((A=e.project)==null?void 0:A.project_name)||"N/A"]}),t.jsxs("p",{className:"mb-1",children:[t.jsx("strong",{children:"Project Type:"})," ",((C=(P=e.project)==null?void 0:P.project_type)==null?void 0:C.name)||"N/A"]}),e.po_number&&t.jsxs("p",{className:"mb-1",children:[t.jsx("strong",{children:"PO Number:"})," ",e.po_number]})]})]}),t.jsx("div",{className:"row section mb-4",children:t.jsxs("div",{className:"col-md-12",children:[t.jsx("h6",{className:"fw-semibold text-primary border-bottom border-primary pb-2 mb-3",children:"Work Details"}),t.jsxs("table",{className:"table table-bordered border-black",children:[t.jsx("thead",{className:"table-primary",children:t.jsxs("tr",{children:[t.jsx("th",{children:"Sr. No"}),t.jsx("th",{children:"Work Type"}),t.jsx("th",{children:"UOM"}),t.jsx("th",{children:"Qty"}),t.jsx("th",{children:"Rate"}),m&&t.jsx("th",{children:"Base Amount"}),m&&t.jsx("th",{children:"GST %"}),m&&t.jsx("th",{children:"CGST"}),m&&t.jsx("th",{children:"SGST"}),t.jsx("th",{children:"Total"})]})}),t.jsxs("tbody",{children:[e.details&&e.details.length>0?e.details.map((r,o)=>{const d=parseFloat(r.qty)||0,y=parseFloat(r.price)||0,_=d*y,b=parseFloat(r.gst_percent)||0,c=parseFloat(r.cgst_amount)||0,g=parseFloat(r.sgst_amount)||0,j=b?b/2:0,f=b?b/2:0,x=parseFloat(r.total_price)||0;return t.jsxs("tr",{children:[t.jsx("td",{children:o+1}),t.jsx("td",{children:r.work_type||"N/A"}),t.jsx("td",{children:r.uom||"N/A"}),t.jsx("td",{children:d.toFixed(2)}),t.jsxs("td",{children:["₹",y.toFixed(2)]}),m&&t.jsxs("td",{children:["₹",_.toFixed(2)]}),m&&t.jsx("td",{children:b?`${b}%`:"-"}),m&&t.jsx("td",{children:c>0?`₹${c.toFixed(2)} (${j}%)`:"-"}),m&&t.jsx("td",{children:g>0?`₹${g.toFixed(2)} (${f}%)`:"-"}),t.jsxs("td",{children:["₹",x.toFixed(2)]})]},o)}):t.jsx("tr",{children:t.jsx("td",{colSpan:m?"10":"6",className:"text-center",children:"No work details available"})}),e.details&&e.details.length>0&&t.jsxs("tr",{className:"table-warning fw-bold",children:[t.jsx("td",{colSpan:m?"5":"4",className:"text-end",children:"Total:"}),m&&t.jsxs("td",{children:["₹",h.subtotalWithoutGST.toFixed(2)]}),m&&t.jsx("td",{children:"-"}),m&&t.jsxs("td",{children:["₹",h.rowCGST.toFixed(2)]}),m&&t.jsxs("td",{children:["₹",h.rowSGST.toFixed(2)]}),t.jsxs("td",{children:["₹",h.totalAfterRowGST.toFixed(2)]})]})]})]})]})}),H&&t.jsx("div",{className:"row section mb-4",children:t.jsxs("div",{className:"col-md-12",children:[t.jsx("h6",{className:"fw-semibold text-primary",children:"GST Details"}),t.jsx("table",{className:"table table-bordered border-black",children:t.jsxs("tbody",{children:[t.jsxs("tr",{children:[t.jsx("td",{children:t.jsx("strong",{children:"Taxable Amount:"})}),t.jsxs("td",{className:"text-center",children:["₹",h.totalAfterRowGST.toFixed(2)]})]}),h.globalCGST>0&&t.jsxs("tr",{children:[t.jsx("td",{children:t.jsxs("strong",{children:["CGST (",e.cgst_percentage_calculated||0,"%):"]})}),t.jsxs("td",{className:"text-center",children:["₹",h.globalCGST.toFixed(2)]})]}),h.globalSGST>0&&t.jsxs("tr",{children:[t.jsx("td",{children:t.jsxs("strong",{children:["SGST (",e.sgst_percentage_calculated||0,"%):"]})}),t.jsxs("td",{className:"text-center",children:["₹",h.globalSGST.toFixed(2)]})]}),h.globalIGST>0&&t.jsxs("tr",{children:[t.jsx("td",{children:t.jsxs("strong",{children:["IGST (",e.igst_percentage_calculated||0,"%):"]})}),t.jsxs("td",{className:"text-center",children:["₹",h.globalIGST.toFixed(2)]})]}),t.jsxs("tr",{className:"table-success",children:[t.jsx("td",{children:t.jsx("strong",{children:"Total GST Amount:"})}),t.jsx("td",{className:"text-center",children:t.jsxs("strong",{children:["₹",h.globalTotalGST.toFixed(2)]})})]})]})})]})}),parseFloat(e.discount)>0&&t.jsx("div",{className:"row section mb-4",children:t.jsx("div",{className:"col-md-12",children:t.jsx("table",{className:"table table-bordered border-black",children:t.jsx("tbody",{children:t.jsxs("tr",{children:[t.jsx("td",{children:t.jsx("strong",{children:"Discount:"})}),t.jsxs("td",{className:"text-center",children:["₹",parseFloat(e.discount).toFixed(2)]})]})})})})}),t.jsx("div",{className:"row section mb-4",children:t.jsx("div",{className:"col-md-12",children:t.jsx("table",{className:"table table-bordered border-black",children:t.jsx("tbody",{children:t.jsxs("tr",{children:[t.jsx("td",{children:t.jsx("strong",{children:"Grand Total:"})}),t.jsx("td",{className:"text-center",children:t.jsxs("strong",{children:["₹",parseFloat(e.final_amount).toFixed(2)]})})]})})})})}),t.jsx("div",{className:"row section mb-4",children:t.jsx("div",{className:"col-md-12",children:t.jsx("table",{className:"table table-bordered border-black",children:t.jsxs("tbody",{children:[t.jsxs("tr",{children:[t.jsx("td",{children:t.jsx("strong",{children:"Amount Paid:"})}),t.jsxs("td",{className:"text-center",children:["₹",parseFloat(e.paid_amount).toFixed(2)]})]}),t.jsxs("tr",{children:[t.jsx("td",{children:t.jsx("strong",{children:"Balance Amount:"})}),t.jsxs("td",{className:"text-center",children:["₹",parseFloat(e.pending_amount).toFixed(2)]})]})]})})})}),t.jsx("div",{className:"row section mb-4",children:t.jsxs("div",{className:"col-md-12",children:[e.notes&&t.jsxs(t.Fragment,{children:[t.jsx("h6",{className:"mt-4 mb-2 fw-semibold text-primary border-bottom border-primary pb-2",children:"Note"}),t.jsx("p",{className:"ms-2 text-dark",children:e.notes})]}),e.payment_terms&&t.jsxs(t.Fragment,{children:[t.jsx("h6",{className:"mt-4 mb-2 fw-semibold text-primary border-bottom border-primary pb-2",children:"Payment Terms"}),t.jsx("ul",{className:"ms-3",children:e.payment_terms.split(`
`).filter(r=>r.trim()!=="").map((r,o)=>t.jsx("li",{className:"text-dark",children:r},o))})]}),e.terms_conditions&&t.jsxs(t.Fragment,{children:[t.jsx("h6",{className:"mt-4 mb-2 fw-semibold text-primary border-bottom border-primary pb-2",children:"Terms & Conditions"}),t.jsx("ul",{className:"ms-3",children:e.terms_conditions.split(`
`).filter(r=>r.trim()!=="").map((r,o)=>t.jsx("li",{className:"text-dark",children:r},o))})]})]})}),t.jsx("div",{className:"row section mb-4",children:t.jsx("div",{className:"col-md-12 text-center",children:t.jsx("p",{children:"This invoice has been computer-generated and is authorized."})})}),t.jsxs("div",{className:"d-flex justify-content-center flex-wrap gap-2 d-print-none",children:[t.jsxs(Q,{color:"danger",variant:"outline",onClick:()=>F(`/edit-proforma-invoice/${a}`),children:[t.jsx(Y,{icon:it,className:"me-1"}),"Edit Proforma Invoice"]}),parseFloat(e.pending_amount)>0&&t.jsxs(Q,{color:"success",onClick:M,children:[t.jsx(Y,{icon:dt,className:"me-1"}),"Record Payment"]}),t.jsxs(Q,{color:"info",onClick:O,children:["Download PDF (",i,")"]})]})]})]}),R&&t.jsx(st,{visible:R,onClose:()=>$(!1),orderData:{id:e.id,proforma_invoice_id:e.id,invoice_number:e.proforma_invoice_number,project_name:(D=e.project)==null?void 0:D.project_name,finalAmount:e.final_amount,paidAmount:e.paid_amount,isProformaInvoice:!0},onPaymentRecorded:E})]})};export{Rt as default};
