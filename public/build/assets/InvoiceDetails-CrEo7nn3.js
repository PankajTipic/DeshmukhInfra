import{d as ie,r as A,b as oe,u as re,j as t}from"./index-CGnoF1dV.js";import{h as de}from"./html2pdf-anL5O9wM.js";import{g as d,h as te,a as le}from"./api-CIBCEetx.js";import{C as ae,a as ce}from"./CCardBody-Bt_5D1od.js";import{C as pe}from"./CCardHeader-D0_uHk5b.js";import{C as xe}from"./index.esm-D8P94hpm.js";import{C as et}from"./CButton-CQ0wb11W.js";import{C as ge}from"./CFormSelect-u2gLT3fX.js";import"./jspdf.es.min-BYWWM2cV.js";import"./typeof-QjJsDpFa.js";import"./html2canvas-B7v4Y5pX.js";import"./CFormControlWrapper-CkM5c0Ff.js";import"./CFormLabel-DYxra1Db.js";const ee={english:{name:"English",font:"Arial, sans-serif",labels:{projectName:"Project Name:",customerName:"Customer Name:",customerAddress:"Customer Address:",mobile:"Mobile Number:",invoiceNumber:"Invoice Number:",invoiceDate:"Invoice Date:",deliveryDate:"Delivery Date:",works:"Work Details",serialNo:"Sr. No.",workType:"Work Type",price:"Price (₹)",quantity:"Quantity",total:"Total (₹)",grandTotal:"Grand Total",totalAfterDiscount:"Total after discount",paymentDetails:"Payment Details",amountPaid:"Amount Received:",amountRemaining:"Amount Due:",paymentMode:"Payment Mode:",qrCode:"QR CODE",scanToPay:"Scan to Pay",amountInWords:"Amount in Words:",bankDetails:"Bank Details",bank:"Bank:",accountNo:"Account Number:",ifscCode:"IFSC Code:",eSignature:"E-Signature",authorizedSignature:"Authorized Signature",footerNote:"This invoice is computer generated and authorized.",only:"only",baseAmount:"Base Amount",gstPercent:"GST %",cgst:"CGST",sgst:"SGST",taxableAmount:"Taxable Amount",gstDetails:"GST Details"}}},he=b=>!b||b.length===0?!1:b.some(y=>y.gst_percent&&y.gst_percent>0||y.cgst_amount&&y.cgst_amount>0||y.sgst_amount&&y.sgst_amount>0),be=b=>b.cgst&&Number(b.cgst)>0||b.sgst&&Number(b.sgst)>0||b.gst&&Number(b.gst)>0||b.igst&&Number(b.igst)>0,se=(b,y,C,s,F,q,I="english",O="save")=>{var n,_,k,V,P,X,Y,H,E,R,M,z,Z,J,K,D,m,tt,xt,gt,ht,bt,mt,ut,yt,ft,vt,$t,_t;const r=ee[I].labels,W=ee[I].font,w=Array.isArray(s.items)?[...s.items].sort((c,S)=>(c.id||0)-(S.id||0)):[],o=he(w),e=be(s),st=!!(s.note||s.payment_terms||s.terms_and_conditions),p=document.createElement("div");p.style.position="absolute",p.style.left="-9999px",p.style.width="794px",p.style.fontFamily=W,p.style.fontSize="12px",document.body.appendChild(p);const U=1123-40;p.innerHTML=`
    <div style="width: 740px; padding: 20px; box-sizing: border-box;">
      <table style="width: 100%; margin-bottom: 5px; border-collapse: collapse;">
        <tr>
          <td style="width: 70%; vertical-align: top;">
            <div style="font-size: 22px; font-weight: bold; line-height: 1.2;">
              ${((_=(n=d())==null?void 0:n.company_info)==null?void 0:_.company_name)||"Company Name"}
            </div>
            <div style="font-size: 12px; margin-top: 2px;">
              ${((V=(k=d())==null?void 0:k.company_info)==null?void 0:V.land_mark)||"-"}
            </div>
            <div style="font-size: 12px; margin-top: 3px;">
              <b>Phone:</b> ${((X=(P=d())==null?void 0:P.company_info)==null?void 0:X.phone_no)||"-"}
            </div>
          </td>
          <td style="width: 30%; text-align: right; vertical-align: top;">
            <div style="width: 75px; height: 75px; border: 1px solid #ccc;"></div>
          </td>
        </tr>
      </table>
      <hr style="border: 1px solid black; margin: 3px 0;" />
      <div style="background-color: #cfe2ff; text-align: center; font-weight: bold; font-size: 18px; padding: 6px 0; border: 1px solid #000; margin: 6px 0;">
        Quotation
      </div>
      <table style="border: 1px solid #000; margin: 6px 0; width: 100%; border-collapse: collapse;">
        <tr>
          <th style="border: 1px solid #000; background: #d9e9ff; font-size: 12px; padding: 4px;">FROM</th>
          <th style="border: 1px solid #000; background: #d9e9ff; font-size: 12px; padding: 4px;">TO</th>
          <th style="border: 1px solid #000; background: #d9e9ff; font-size: 12px; padding: 4px;">DETAILS</th>
        </tr>
        <tr>
          <td style="border: 1px solid #000; font-size: 12px; padding: 5px; line-height: 1.4;">
            <b>${((H=(Y=d())==null?void 0:Y.company_info)==null?void 0:H.company_name)||"Company"}</b><br/>
            ${((E=d())==null?void 0:E.name)||"Name"}<br/>
            ${((M=(R=d())==null?void 0:R.company_info)==null?void 0:M.land_mark)||"-"}<br/>
            <b>Phone:</b> ${((z=d())==null?void 0:z.mobile)||"-"}<br/>
            <b>GSTIN:</b> ${((J=(Z=d())==null?void 0:Z.company_info)==null?void 0:J.gst_number)||"-"}<br/>
            Dist: ${((D=(K=d())==null?void 0:K.company_info)==null?void 0:D.Dist)||"-"}<br/>
            Tal: ${((tt=(m=d())==null?void 0:m.company_info)==null?void 0:tt.Tal)||"-"}<br/>
            Email: ${((gt=(xt=d())==null?void 0:xt.company_info)==null?void 0:gt.email_id)||"-"}
          </td>
          <td style="border: 1px solid #000; font-size: 12px; padding: 5px; line-height: 1.4;">
            <b>Customer:</b> ${((ht=s.customer)==null?void 0:ht.name)||"-"}<br/>
            <b>Site:</b> ${s.project_name||"-"}<br/>
            ${((bt=s.customer)==null?void 0:bt.address)||"-"}<br/>
            <b>Phone:</b> ${((mt=s.customer)==null?void 0:mt.mobile)||"-"}<br/>
            <b>GSTIN:</b> ${s.gst_number||"-"}<br/>
            <b>PAN:</b> ${s.pan_number||"-"}
          </td>
          <td style="border: 1px solid #000; font-size: 12px; padding: 5px; line-height: 1.4;">
            <b>Invoice No:</b> ${y}<br/>
            <b>Invoice Date:</b> ${s.date}<br/>
            <b>Reference:</b> ${s.ref_id||"-"}<br/>
            <b>PO:</b> ${s.po_number||"-"}
          </td>
        </tr>
      </table>
    </div>
  `;const nt=p.offsetHeight;p.innerHTML=`
    <div style="width: 740px; padding: 20px; box-sizing: border-box;">
      <table style="width: 100%; margin-bottom: 5px; border-collapse: collapse;">
        <tr>
          <td style="width: 70%; vertical-align: top;">
            <div style="font-size: 22px; font-weight: bold; line-height: 1.2;">
              ${((yt=(ut=d())==null?void 0:ut.company_info)==null?void 0:yt.company_name)||"Company Name"}
            </div>
            <div style="font-size: 12px; margin-top: 2px;">
              ${((vt=(ft=d())==null?void 0:ft.company_info)==null?void 0:vt.land_mark)||"-"}
            </div>
            <div style="font-size: 12px; margin-top: 3px;">
              <b>Phone:</b> ${((_t=($t=d())==null?void 0:$t.company_info)==null?void 0:_t.phone_no)||"-"}
            </div>
          </td>
          <td style="width: 30%; text-align: right; vertical-align: top;">
            <div style="width: 75px; height: 75px; border: 1px solid #ccc;"></div>
          </td>
        </tr>
      </table>
      <hr style="border: 1px solid black; margin: 3px 0;" />
    </div>
  `;const it=p.offsetHeight;p.innerHTML=`
    <div style="width: 740px; padding: 20px; box-sizing: border-box;">
      <div style="text-align: center; margin: 8px 0; font-size: 10px;">
        ${r.footerNote}
      </div>
      <div style="text-align: center; font-size: 11px; padding: 8px 0; border-top: 1px solid #999;">
        <div style="display: flex; justify-content: space-between; padding: 0 25px;">
          <div>✉️ deshmukhinfra@gmail.com</div>
          <div>🌐 www.deshmukhinfrasolutions.com</div>
        </div>
      </div>
    </div>
  `;const ot=p.offsetHeight;p.innerHTML=`
    <div style="width: 740px; padding: 20px; box-sizing: border-box;">
      <table style="width: 100%; border-collapse: collapse; margin-top: 8px;">
        <thead>
          <tr>
            <th style="border: 1px solid #000; background: #d9e9ff; font-size: 11px; padding: 6px; width: ${o?"4%":"5%"};">${r.serialNo}</th>
            <th style="border: 1px solid #000; background: #d9e9ff; font-size: 11px; padding: 6px; width: ${o?"22%":"40%"};">${r.workType}</th>
            <th style="border: 1px solid #000; background: #d9e9ff; font-size: 11px; padding: 6px; width: ${o?"5%":"8%"};">Unit</th>
            <th style="border: 1px solid #000; background: #d9e9ff; font-size: 11px; padding: 6px; width: ${o?"5%":"8%"};">${r.quantity}</th>
            <th style="border: 1px solid #000; background: #d9e9ff; font-size: 11px; padding: 6px; width: ${o?"10%":"15%"};">${r.price}</th>
            ${o?`
              <th style="border: 1px solid #000; background: #d9e9ff; font-size: 11px; padding: 6px; width: 10%;">${r.baseAmount}</th>
              <th style="border: 1px solid #000; background: #d9e9ff; font-size: 11px; padding: 6px; width: 5%;">${r.gstPercent}</th>
              <th style="border: 1px solid #000; background: #d9e9ff; font-size: 11px; padding: 6px; width: 10%;">${r.cgst}</th>
              <th style="border: 1px solid #000; background: #d9e9ff; font-size: 11px; padding: 6px; width: 10%;">${r.sgst}</th>
            `:""}
            <th style="border: 1px solid #000; background: #d9e9ff; font-size: 11px; padding: 6px; width: ${o?"19%":"24%"};">${r.total}</th>
          </tr>
        </thead>
      </table>
    </div>
  `;const B=p.querySelector("thead").offsetHeight,u=[];w.forEach((c,S)=>{c.gst_percent&&c.gst_percent/2,c.gst_percent&&c.gst_percent/2,p.innerHTML=`
      <div style="width: 740px; padding: 20px; box-sizing: border-box;">
        <table style="width: 100%; border-collapse: collapse;">
          <tbody>
            <tr>
              <td style="border: 1px solid #000; text-align: center; font-size: 11px; padding: 6px; width: ${o?"4%":"5%"};">${S+1}</td>
              <td style="border: 1px solid #000; font-size: 11px; padding: 6px; width: ${o?"22%":"40%"}; word-break: break-word;">${c.work_type||""}</td>
              <td style="border: 1px solid #000; text-align: center; font-size: 11px; padding: 6px; width: ${o?"5%":"8%"};">${c.uom||""}</td>
              <td style="border: 1px solid #000; text-align: center; font-size: 11px; padding: 6px; width: ${o?"5%":"8%"};">${c.qty||0}</td>
              <td style="border: 1px solid #000; text-align: right; font-size: 11px; padding: 6px; width: ${o?"10%":"15%"};">₹${Number(c.price||0).toFixed(2)}</td>
              ${o?`
                <td style="border: 1px solid #000; text-align: right; font-size: 11px; padding: 6px; width: 10%;">₹${Number(c.qty*c.price||0).toFixed(2)}</td>
                <td style="border: 1px solid #000; text-align: center; font-size: 11px; padding: 6px; width: 5%;">${c.gst_percent?c.gst_percent+"%":"-"}</td>
                <td style="border: 1px solid #000; text-align: right; font-size: 11px; padding: 6px; width: 10%;">${c.cgst_amount>0?"₹"+Number(c.cgst_amount).toFixed(2):"-"}</td>
                <td style="border: 1px solid #000; text-align: right; font-size: 11px; padding: 6px; width: 10%;">${c.sgst_amount>0?"₹"+Number(c.sgst_amount).toFixed(2):"-"}</td>
              `:""}
              <td style="border: 1px solid #000; text-align: right; font-size: 11px; padding: 6px; width: ${o?"19%":"24%"};">₹${Number(c.total_price||0).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
  `,u.push(p.querySelector("tr").offsetHeight)}),p.innerHTML=`
    <div style="width: 740px; padding: 20px; box-sizing: border-box;">
      <table style="width: 100%; border-collapse: collapse;">
        <tbody>
          <tr style="background: #fff3cd; font-weight: bold;">
            <td colspan="${o?"5":"4"}" style="border: 1px solid #000; text-align: right; font-size: 12px; padding: 6px;">Total:</td>
            ${o?'<td style="border: 1px solid #000; text-align: right; font-size: 12px; padding: 6px;">₹0.00</td>':""}
            ${o?'<td style="border: 1px solid #000; text-align: center; font-size: 12px; padding: 6px;">-</td>':""}
            ${o?'<td style="border: 1px solid #000; text-align: right; font-size: 12px; padding: 6px;">₹0.00</td>':""}
            ${o?'<td style="border: 1px solid #000; text-align: right; font-size: 12px; padding: 6px;">₹0.00</td>':""}
            <td style="border: 1px solid #000; text-align: right; font-size: 12px; padding: 6px;">₹0.00</td>
          </tr>
        </tbody>
      </table>
    </div>
  `;const Q=p.querySelector("tr").offsetHeight;p.innerHTML=`
    <div style="width: 740px; padding: 20px; box-sizing: border-box;">
      ${e?`
        <table style="width: 100%; border-collapse: collapse; margin-top: 8px;">
          <tr>
            <th colspan="2" style="border: 1px solid #000; font-size: 12px; background: #d9e9ff; text-align: center; padding: 6px;">${r.gstDetails}</th>
          </tr>
          <tr>
            <th style="border: 1px solid #000; font-size: 12px; padding: 6px; background: #d9e9ff; text-align: right;">${r.taxableAmount}</th>
            <td style="border: 1px solid #000; text-align: right; font-size: 12px; padding: 6px;">₹0.00</td>
          </tr>
          ${Number(s.cgst||0)>0?`
          <tr>
            <th style="border: 1px solid #000; font-size: 12px; padding: 6px; background: #d9e9ff; text-align: right;">${r.cgst}</th>
            <td style="border: 1px solid #000; text-align: right; font-size: 12px; padding: 6px;">₹0.00</td>
          </tr>`:""}
          ${Number(s.sgst||0)>0?`
          <tr>
            <th style="border: 1px solid #000; font-size: 12px; padding: 6px; background: #d9e9ff; text-align: right;">${r.sgst}</th>
            <td style="border: 1px solid #000; text-align: right; font-size: 12px; padding: 6px;">₹0.00</td>
          </tr>`:""}
          ${Number(s.igst||0)>0?`
          <tr>
            <th style="border: 1px solid #000; font-size: 12px; padding: 6px; background: #d9e9ff; text-align: right;">IGST</th>
            <td style="border: 1px solid #000; text-align: right; font-size: 12px; padding: 6px;">₹0.00</td>
          </tr>`:""}
          <tr style="background: #e8f5e9;">
            <th style="border: 1px solid #000; font-size: 12px; padding: 6px; text-align: right;">Total GST</th>
            <td style="border: 1px solid #000; text-align: right; font-size: 12px; padding: 6px;">₹0.00</td>
          </tr>
        </table>
      `:""}
      ${s.discount>0?`
      <table style="width: 100%; border-collapse: collapse; margin-top: 8px;">
        <tr>
          <th style="border: 1px solid #000; font-size: 12px; padding: 6px; background: #d9e9ff; text-align: right;">Discount</th>
          <td style="border: 1px solid #000; text-align: right; font-size: 12px; padding: 6px;">₹0.00</td>
        </tr>
      </table>
      `:""}
      <table style="width: 100%; border-collapse: collapse; margin-top: 8px;">
        <tr style="background: #fff3cd;">
          <th style="border: 1px solid #000; font-size: 12px; padding: 6px; background: #d9e9ff; text-align: right;">${r.grandTotal}</th>
          <td style="border: 1px solid #000; text-align: right; font-size: 12px; padding: 6px;">₹0.00</td>
        </tr>
        <tr>
          <th style="border: 1px solid #000; font-size: 12px; padding: 6px; background: #d9e9ff; text-align: right;">${r.amountPaid}</th>
          <td style="border: 1px solid #000; text-align: right; font-size: 12px; padding: 6px;">₹0.00</td>
        </tr>
        <tr style="background: #f8d7da;">
          <th style="border: 1px solid #000; vertical-align: top; font-size: 12px; padding: 6px; background: #d9e9ff; text-align: right;">
            ${r.amountRemaining}<br />
            <span style="font-weight: normal; font-size: 11px;">${r.amountInWords} ${q} ${r.only}</span>
          </th>
          <td style="border: 1px solid #000; text-align: right; vertical-align: top; font-size: 12px; padding: 6px;">₹0.00</td>
        </tr>
      </table>
    </div>
  `;const rt=p.offsetHeight-40;document.body.removeChild(p);let g=[],T=[],i=0,x=U-nt-B;w.forEach((c,S)=>{const L=u[S];i+L>x&&T.length>0&&(g.push(T),T=[],i=0,x=U-it-ot-B),T.push({...c,originalIndex:S}),i+=L}),T.length>0&&g.push(T);const f=x-i,j=Q+rt;f<rt+Q&&g.push([]),f<j&&g.push([]);const v=g.length||1,$=`
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
      font-family: ${W};
      font-size: 12px;
      margin: 0;
      padding: 0;
      background: white;
    }
    .invoice-box {
      width: 100%;
      min-height: auto;
      margin: 0;
      padding: 20px;
      border: 3px solid #000;
      box-sizing: border-box;
      position: relative;
      display: flex;
      flex-direction: column;
      page-break-after: always;
      background: white;
    }



.page-spacer {
  height: 12px;          /* critical */
  width: 100%;
}



    .content-wrapper {
      flex: 1;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
    }
    table td, table th {
      padding: 6px;
      vertical-align: top;
      font-size: 11px;
      word-break: break-word;
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
      padding: 6px;
      word-break: break-word;
    }
    .summary th {
      background: #d9e9ff;
      font-weight: bold;
      text-align: right;
    }
    .right { text-align: right; }
    .center { text-align: center; }
    
    .footer {
      text-align: center;
      font-size: 11px;
      padding: 8px 0;
      width: 100%;
      margin-top: auto;
      background: transparent;
      border-top: 1px solid #999;
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
    @media print {
      body {
        margin: 0;
        padding: 0;
      }
      .invoice-box {
        border: 3px solid #000;
      }
    }
  </style>
</head>
<body>
${(()=>{var S,L,wt,jt,Nt,zt,Tt,kt,St,At,Pt,Gt,Ct,Ft,It,Ht,Et,Rt,Mt,Lt,qt,Ot,Wt,Ut,Bt,Qt,Vt,Xt,Yt,Zt,Jt,Kt,Dt;let c="";for(let G=0;G<v;G++){const dt=g[G]||[],ne=G===0,lt=G===v-1;dt.length===0&&!lt||(c+=`
      ${G>0?'<div class="page-spacer"></div>':""}
      <div class="invoice-box ${G>0?"no-top-border":""}">
        <div class="content-wrapper">
      
        <!-- Header -->
        <table class="company-header" style="width: 100%; margin-bottom: 5px;">
          <tr>
            <td style="width: 70%; vertical-align: top;">
              <div style="font-size: 22px; font-weight: bold; line-height: 1.2;">
                ${((L=(S=d())==null?void 0:S.company_info)==null?void 0:L.company_name)||"Company Name"}
              </div>
              <div style="font-size: 12px; margin-top: 2px;">
                ${((jt=(wt=d())==null?void 0:wt.company_info)==null?void 0:jt.land_mark)||"-"}
              </div>
              <div style="font-size: 12px; margin-top: 3px;">
                <b>Phone:</b> ${((zt=(Nt=d())==null?void 0:Nt.company_info)==null?void 0:zt.phone_no)||"-"}
              </div>
            </td>
            <td style="width: 30%; text-align: right; vertical-align: top;">
              <img
                src='${te}/img/${(kt=(Tt=d())==null?void 0:Tt.company_info)==null?void 0:kt.logo}'
                alt="Company Logo"
                style="width: 75px; height: 75px; object-fit: contain; border: 1px solid #ccc; border-radius: 5px;"
              />
            </td>
          </tr>
        </table>
        <hr style="border: 1px solid black; margin: 3px 0;" />
        
        ${ne?`
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
        <table style="border: 1px solid #000; margin: 6px 0; table-layout: fixed;">
          <tr>
            <th style="border: 1px solid #000; background: #d9e9ff; font-size: 12px; padding: 4px; width: 40%;">FROM :</th>
            <th style="border: 1px solid #000; background: #d9e9ff; font-size: 12px; padding: 4px; width: 40%;">TO :</th>
            <th style="border: 1px solid #000; background: #d9e9ff; font-size: 12px; padding: 4px; width: 20%;">DETAILS :</th>
          </tr>
          <tr>
            <td style="border: 1px solid #000; font-size: 12px; padding: 5px; line-height: 1.4;">
              <b>${((At=(St=d())==null?void 0:St.company_info)==null?void 0:At.company_name)||"Company Name"}</b><br/>
              ${((Pt=d())==null?void 0:Pt.name)||"Owner Name"}<br/>
              ${((Ct=(Gt=d())==null?void 0:Gt.company_info)==null?void 0:Ct.land_mark)||"-"}<br/>
              <b>Phone:</b> ${((Ft=d())==null?void 0:Ft.mobile)||"N/A"}<br/>
              <b>GSTIN:</b> ${((Ht=(It=d())==null?void 0:It.company_info)==null?void 0:Ht.gst_number)||"N/A"}<br/>
              Dist: ${((Rt=(Et=d())==null?void 0:Et.company_info)==null?void 0:Rt.Dist)||"-"}<br/>
              Tal: ${((Lt=(Mt=d())==null?void 0:Mt.company_info)==null?void 0:Lt.Tal)||"-"}<br/>
              Email: ${((Ot=(qt=d())==null?void 0:qt.company_info)==null?void 0:Ot.email_id)||"-"}
            </td>
            <td style="border: 1px solid #000; font-size: 12px; padding: 5px; line-height: 1.4;">
              <b>Customer Name:</b> ${((Wt=s.customer)==null?void 0:Wt.name)||"Customer Name"}<br/>
              <b>Site:</b> ${s.project_name||"Project Name"}<br/>
              ${((Ut=s.customer)==null?void 0:Ut.address)||"Customer Address"}<br/>
              <b>Phone:</b> ${((Bt=s.customer)==null?void 0:Bt.mobile)||"N/A"}<br/>
              <b>GSTIN:</b> ${s.gst_number||"-"}<br/>
              <b>PAN:</b> ${s.pan_number||"-"}
            </td>
            <td style="border: 1px solid #000; font-size: 12px; padding: 5px; line-height: 1.4;">
              <b>Invoice No:</b> ${y}<br/>
              <b>Invoice Date:</b> ${s.date}<br/>
              <b>Reference ID:</b> ${s.ref_id||"-"}<br/>
              <b>PO Number:</b> ${s.po_number||"-"}
            </td>
          </tr>
        </table>
        `:""}
        
        <!-- Items Table -->
        <table class="details-table" style="margin-top: 8px;${dt.length===0?" display: none;":""}">
          <thead>
            <tr>
              <th style="width: ${o?"5%":"6%"}; font-size: 11px;">${r.serialNo}</th>
              <th style="width: ${o?"30%":"70%"}; font-size: 11px;">${r.workType}</th>
              <th style="width: ${o?"8%":"10%"}; font-size: 11px;">Unit</th>
              <th style="width: ${o?"7%":"10%"}; font-size: 11px;">Qty</th>
              <th style="width: ${o?"10%":"18%"}; font-size: 11px;">${r.price}</th>
              ${o?`
                <th style="width: 12%; font-size: 11px;">${r.baseAmount}</th>
                <th style="width: 8%; font-size: 11px;">${r.gstPercent}</th>
                <th style="width: 12%; font-size: 11px;">${r.cgst}</th>
                <th style="width: 12%; font-size: 11px;">${r.sgst}</th>
              `:""}
              <th style="width: ${o?"12%":"18%"}; font-size: 11px;">${r.total}</th>
            </tr>
          </thead>
          <tbody>
            ${dt.map(l=>{const N=l.gst_percent?l.gst_percent/2:0,at=l.gst_percent?l.gst_percent/2:0;return`
              <tr>
                <td class="center" style="width: ${o?"4%":"5%"}; font-size: 11px;">${l.originalIndex+1}</td>
                <td style="width: ${o?"22%":"40%"}; font-size: 11px;">${l.work_type||""}</td>
                <td class="center" style="width: ${o?"5%":"8%"}; font-size: 11px;">${l.uom||""}</td>
                <td class="center" style="width: ${o?"5%":"8%"}; font-size: 11px;">${l.qty||0}</td>
                <td class="right" style="width: ${o?"10%":"15%"}; font-size: 11px;">₹${Number(l.price||0).toFixed(2)}</td>
                ${o?`
                  <td class="right" style="width: 10%; font-size: 11px;">₹${Number(l.qty*l.price||0).toFixed(2)}</td>
                  <td class="center" style="width: 5%; font-size: 11px;">${l.gst_percent?l.gst_percent+"%":"-"}</td>
                  <td class="right" style="width: 10%; font-size: 11px;">${l.cgst_amount>0?"₹"+Number(l.cgst_amount).toFixed(2)+" ("+N+"%)":"-"}</td>
                  <td class="right" style="width: 10%; font-size: 11px;">${l.sgst_amount>0?"₹"+Number(l.sgst_amount).toFixed(2)+" ("+at+"%)":"-"}</td>
                `:""}
                <td class="right" style="width: ${o?"19%":"24%"}; font-size: 11px;">₹${Number(l.total_price||0).toFixed(2)}</td>
              </tr>`}).join("")}
            
            ${lt&&w.length>0?`
              <tr style="background: #fff3cd; font-weight: bold;">
                <td colspan="${o?"5":"4"}" class="right" style="font-size: 12px; padding: 6px;">Total:</td>
                ${o?`<td class="right" style="font-size: 12px;">₹${w.reduce((l,N)=>l+(N.qty*N.price||0),0).toFixed(2)}</td>`:""}
                ${o?'<td class="center" style="font-size: 12px;">-</td>':""}
                ${o?`<td class="right" style="font-size: 12px;">₹${w.reduce((l,N)=>l+(N.cgst_amount||0),0).toFixed(2)}</td>`:""}
                ${o?`<td class="right" style="font-size: 12px;">₹${w.reduce((l,N)=>l+(N.sgst_amount||0),0).toFixed(2)}</td>`:""}
                <td class="right" style="font-size: 12px;">₹${w.reduce((l,N)=>l+(N.total_price||0),0).toFixed(2)}</td>
              </tr>
            `:""}
          </tbody>
        </table>
        
        ${lt?`
        <!-- Summary Section -->
        <div>
          ${e?`
            <table class="summary" style="margin-top: 8px;">
              <tr>
                <th colspan="2" style="font-size: 12px; background: #d9e9ff; text-align: center;">${r.gstDetails}</th>
              </tr>
              <tr>
                <th style="font-size: 12px;">${r.taxableAmount}</th>
                <td class="right" style="font-size: 12px;">₹${(()=>{const l=w.reduce((N,at)=>N+(at.total_price||0),0);return Number(l).toFixed(2)})()}</td>
              </tr>
              ${Number(s.cgst||0)>0?`
              <tr>
                <th style="font-size: 12px;">${r.cgst} (${s.cgstPercentage||Number(s.gst||0)/2}%)</th>
                <td class="right" style="font-size: 12px;">₹${Number(s.cgst||0).toFixed(2)}</td>
              </tr>`:""}
              ${Number(s.sgst||0)>0?`
              <tr>
                <th style="font-size: 12px;">${r.sgst} (${s.sgstPercentage||Number(s.gst||0)/2}%)</th>
                <td class="right" style="font-size: 12px;">₹${Number(s.sgst||0).toFixed(2)}</td>
              </tr>`:""}
              ${Number(s.igst||0)>0?`
              <tr>
                <th style="font-size: 12px;">IGST (${s.igstPercentage||Number(s.gst||0)}%)</th>
                <td class="right" style="font-size: 12px;">₹${Number(s.igst||0).toFixed(2)}</td>
              </tr>`:""}
              <tr style="background: #e8f5e9;">
                <th style="font-size: 12px;">Total GST Amount</th>
                <td class="right" style="font-size: 12px;"><strong>₹${(Number(s.cgst||0)+Number(s.sgst||0)+Number(s.igst||0)).toFixed(2)}</strong></td>
              </tr>
            </table>
          `:""}
          
          ${s.discount>0?`
          <table class="summary" style="margin-top: 8px;">
            <tr>
              <th style="font-size: 12px;">Discount</th>
              <td class="right" style="font-size: 12px;">₹${Number(s.discount||0).toFixed(2)}</td>
            </tr>
          </table>
          `:""}
          
          <table class="summary" style="margin-top: 8px;">
            <tr style="background: #fff3cd;">
              <th style="font-size: 12px;">${r.grandTotal}</th>
              <td class="right" style="font-size: 12px;"><strong>₹${Number(b||0).toFixed(2)}</strong></td>
            </tr>
            <tr>
              <th style="font-size: 12px;">${r.amountPaid}</th>
              <td class="right" style="font-size: 12px;">₹${Number(s.amountPaid||0).toFixed(2)}</td>
            </tr>
            <tr style="background: #f8d7da;">
              <th style="vertical-align: top; font-size: 12px;">
                ${r.amountRemaining}<br />
                <span style="font-weight: normal; font-size: 11px;">
                  ${r.amountInWords} ${q} ${r.only}
                </span>
              </th>
              <td class="right" style="vertical-align: top; font-size: 12px;">
                <strong>₹${Number(F||0).toFixed(2)}</strong>
              </td>
            </tr>
          </table>
        </div>
        `:""}
        
        </div>
        
        <div class="foot">
          ${r.footerNote}
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
    `)}return st&&(c+=`
    <div class="page-spacer"></div>
    <div class="invoice-box">
      <div class="content-wrapper">
        <table class="company-header" style="width: 100%; margin-bottom: 5px;">
          <tr>
            <td style="width: 70%; vertical-align: top;">
              <div style="font-size: 22px; font-weight: bold; line-height: 1.2;">
                ${((Vt=(Qt=d())==null?void 0:Qt.company_info)==null?void 0:Vt.company_name)||"Company Name"}
              </div>
              <div style="font-size: 12px; margin-top: 2px;">
                ${((Yt=(Xt=d())==null?void 0:Xt.company_info)==null?void 0:Yt.land_mark)||"-"}
              </div>
              <div style="font-size: 12px; margin-top: 3px;">
                <b>Phone:</b> ${((Jt=(Zt=d())==null?void 0:Zt.company_info)==null?void 0:Jt.phone_no)||"-"}
              </div>
            </td>
            <td style="width: 30%; text-align: right; vertical-align: top;">
              <img
                src='${te}/img/${(Dt=(Kt=d())==null?void 0:Kt.company_info)==null?void 0:Dt.logo}'
                alt="Company Logo"
                style="width: 75px; height: 75px; object-fit: contain; border: 1px solid #ccc; border-radius: 5px;"
              />
            </td>
          </tr>
        </table>
        <hr style="border: 1px solid black; margin: 3px 0;" />
        
        ${s.note?`
        <div class="terms-section">
          <h3>Notes</h3>
          <div class="terms-content">${s.note}</div>
        </div>
        `:""}
        
        ${s.payment_terms?`
        <div class="terms-section">
          <h3>Payment Terms</h3>
          <div class="terms-content">${s.payment_terms}</div>
        </div>
        `:""}
        
        ${s.terms_and_conditions?`
        <div class="terms-section">
          <h3>Terms & Conditions</h3>
          <div class="terms-content">${s.terms_and_conditions}</div>
        </div>
        `:""}
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
    `),c})()}
</body>
</html>
`,h={margin:[10,10,10,10],filename:`${y}_${C}.pdf`,image:{type:"jpeg",quality:.98},html2canvas:{scale:2,useCORS:!0,scrollX:0,scrollY:0,windowWidth:794,letterRendering:!0},jsPDF:{unit:"mm",format:"a4",orientation:"portrait"}},a=de().set(h).from($);if(O==="blob")return a.outputPdf("blob");if(O==="save")return a.save()},Se=()=>{var T;const b=(T=d())==null?void 0:T.company_info,{id:y}=ie(),[C,s]=A.useState(0);A.useRef(null),A.useState(null);const[F,q]=A.useState("english"),[I,O]=A.useState(""),[r,W]=A.useState(0),{showToast:w}=oe(),o=re(),[e,st]=A.useState({project_name:"",customer:{name:"",address:"",mobile:"",gst_number:""},date:"",items:[],discount:0,amountPaid:0,paymentMode:"",invoiceStatus:"",finalAmount:0,totalAmount:0,invoice_number:"",status:"",deliveryDate:"",invoiceType:"",cgst:0,sgst:0,gst:0,igst:0,invoice_rules:[],ref_id:"",po_number:""}),p=()=>{o(`/edit-order/${y}`)},ct=i=>{if(i===0)return"Zero";const x=["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine"],f=["Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"],j=["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"],v=a=>{let n="";return a>=100&&(n+=x[Math.floor(a/100)]+" Hundred ",a%=100),a>=20?(n+=j[Math.floor(a/10)],a%10>0&&(n+=" "+x[a%10])):a>=10?n+=f[a-10]:a>0&&(n+=x[a]),n.trim()};let $="",h=Math.floor(i);if(h>=1e7){const a=Math.floor(h/1e7);$+=v(a)+" Crore ",h%=1e7}if(h>=1e5){const a=Math.floor(h/1e5);$+=v(a)+" Lakh ",h%=1e5}if(h>=1e3){const a=Math.floor(h/1e3);$+=v(a)+" Thousand ",h%=1e3}return h>0&&($+=v(h)),$.trim()+" Rupees Only"},pt=()=>{window.print()},U=async()=>{var i,x,f,j,v,$,h,a;try{const n=await le(`/api/order/${y}`);console.log("Fetched order:",n);const _=n.paymentType===0?"Cash":"Online (UPI/Bank Transfer)";let k="";switch(n.orderStatus){case 0:k="Cancelled Order";break;case 1:k="Delivered Order";break;case 2:k="Order Pending";break;case 3:k="Quotation";break;default:k="Unknown Status"}const V=n.discount||0,P=Number(n.finalAmount||0).toFixed(2),X=Number(n.totalAmount||0).toFixed(2),Y=P-(n.paidAmount||0);s(Math.max(0,Y));const H=Number(n.cgst||0),E=Number(n.sgst||0),R=Number(n.igst||0),M=Number(n.gst||0),z=Number(n.totalAmount||0),Z=z>0?Math.round(H/z*100*100)/100:0,J=z>0?Math.round(E/z*100*100)/100:0,K=z>0?Math.round(R/z*100*100)/100:0,D=z>0?Math.round(M/z*100*100)/100:0;st({project_name:((i=n.project)==null?void 0:i.project_name)||"N/A",project_type:((f=(x=n.project)==null?void 0:x.project_type)==null?void 0:f.name)||"N/A",customer:{name:((j=n.project)==null?void 0:j.customer_name)||"N/A",address:((v=n.project)==null?void 0:v.work_place)||"N/A",mobile:(($=n.project)==null?void 0:$.mobile_number)||"N/A"},gst_number:((h=n.project)==null?void 0:h.gst_number)||"N/A",pan_number:((a=n.project)==null?void 0:a.pan_number)||"N/A",date:n.invoiceDate||"",items:(n.items||[]).map(m=>({id:m.id,work_type:m.product_name||m.work_type||"N/A",qty:m.dQty||m.qty||0,uom:m.uom||"N/A",price:m.dPrice||m.price||0,total_price:m.total_price||0,remark:m.remark||"",gst_percent:Number(m.gst_percent)||0,cgst_amount:Number(m.cgst_amount)||0,sgst_amount:Number(m.sgst_amount)||0})).sort((m,tt)=>m.id-tt.id),discount:V,amountPaid:n.paidAmount||0,paymentMode:_,invoiceStatus:k,totalAmount:X,finalAmount:P,cgst:H.toFixed(2),sgst:E.toFixed(2),gst:M.toFixed(2),igst:R.toFixed(2),cgstPercentage:Z,sgstPercentage:J,igstPercentage:K,gstPercentage:D,ref_id:n.ref_id,po_number:n.po_number||"",terms_and_conditions:n.terms_and_conditions||"",payment_terms:n.payment_terms||"",note:n.note||"",invoice_number:n.invoice_number||"N/A",status:n.orderStatus,deliveryDate:n.deliveryDate||"",invoiceType:n.invoiceType||3,invoice_rules:Array.isArray(n.invoice_rules)?n.invoice_rules:[]}),W(P),O(ct(P))}catch(n){console.error("Error fetching order data:",n),w("danger","Error fetching invoice details")}};console.log("Customer GST Number:",e==null?void 0:e.gst_number),A.useEffect(()=>{U()},[y]);const nt=async()=>{try{const i=await se(e.finalAmount,e.invoice_number,e.customer.name,e,C,I,F,"blob"),x=URL.createObjectURL(i),f=encodeURIComponent(`*Invoice from ${(b==null?void 0:b.company_name)||"Company"}*

Project: ${e.project_name}
Invoice Number: ${e.invoice_number}
Total Amount: ₹${e.finalAmount}
Amount Paid: ₹${e.amountPaid}
Remaining: ₹${C}

📄 Download Invoice: ${x}

Thank you!`),j=`https://wa.me/${e.customer.mobile}?text=${f}`;window.open(j,"_blank")}catch(i){w("danger","Error sharing on WhatsApp: "+i.message)}},it=async i=>{await se(e.finalAmount,e.invoice_number,e.customer.name,e,C,I,i,"save")},ot=()=>!e.items||e.items.length===0?!1:e.items.some(i=>i.gst_percent&&i.gst_percent>0||i.cgst_amount&&i.cgst_amount>0||i.sgst_amount&&i.sgst_amount>0),B=()=>e.cgst&&Number(e.cgst)>0||e.sgst&&Number(e.sgst)>0||e.gst&&Number(e.gst)>0||e.igst&&Number(e.igst)>0,u=ot(),Q=B(),g=(()=>{const i=e.items.reduce((n,_)=>n+_.qty*_.price,0),x=e.items.reduce((n,_)=>n+(_.cgst_amount||0),0),f=e.items.reduce((n,_)=>n+(_.sgst_amount||0),0),j=e.items.reduce((n,_)=>n+(_.total_price||0),0),v=Number(e.cgst||0),$=Number(e.sgst||0),h=Number(e.igst||0),a=v+$+h;return{subtotalWithoutGST:i,rowCGST:x,rowSGST:f,totalAfterRowGST:j,globalCGST:v,globalSGST:$,globalIGST:h,globalTotalGST:a}})();return t.jsxs(ae,{children:[t.jsx(pe,{children:t.jsxs("h5",{children:["Invoice ",e.invoice_number]})}),t.jsx(ce,{children:t.jsxs(xe,{fluid:!0,children:[t.jsxs("div",{className:"row section",children:[t.jsxs("div",{className:"col-md-6",children:[t.jsxs("p",{children:[t.jsx("strong",{children:"Project Name:"})," ",e.project_name]}),t.jsxs("p",{children:[t.jsx("strong",{children:"Project Type:"})," ",e.project_type]}),t.jsxs("p",{children:[t.jsx("strong",{children:"Customer Name:"})," ",e.customer.name]}),t.jsxs("p",{children:[t.jsx("strong",{children:"Customer Address:"})," ",e.customer.address]}),t.jsxs("p",{children:[t.jsx("strong",{children:"Mobile Number:"})," ",e.customer.mobile]}),t.jsxs("p",{children:[t.jsx("strong",{children:"GST Number:"})," ",e.gst_number]})]}),t.jsxs("div",{className:"col-md-6",children:[t.jsxs("p",{children:[t.jsx("strong",{children:"Invoice Number:"})," ",e.invoice_number]}),t.jsxs("p",{children:[t.jsx("strong",{children:"Reference ID:"})," ",e.ref_id]}),t.jsxs("p",{children:[t.jsx("strong",{children:"Po Number:"})," ",e.po_number]}),t.jsxs("p",{children:[t.jsx("strong",{children:"Invoice Date:"})," ",e.date]}),t.jsxs("p",{children:[t.jsx("strong",{children:"PAN Number:"})," ",e.pan_number]})]})]}),t.jsx("div",{className:"row section",children:t.jsx("div",{className:"col-md-12",children:t.jsxs("table",{className:"table table-bordered border-black",children:[t.jsx("thead",{children:t.jsxs("tr",{children:[t.jsx("th",{children:"Sr. No."}),t.jsx("th",{children:"Work Type"}),t.jsx("th",{children:"Unit"}),t.jsx("th",{children:"Quantity"}),t.jsx("th",{children:"Price"}),u&&t.jsx("th",{children:"Base Amount"}),u&&t.jsx("th",{children:"GST %"}),u&&t.jsx("th",{children:"CGST"}),u&&t.jsx("th",{children:"SGST"}),t.jsx("th",{children:"Total"})]})}),t.jsxs("tbody",{children:[e.items.length>0?e.items.map((i,x)=>{const f=i.gst_percent?i.gst_percent/2:0,j=i.gst_percent?i.gst_percent/2:0;return t.jsxs("tr",{children:[t.jsx("td",{children:x+1}),t.jsx("td",{children:i.work_type}),t.jsx("td",{children:i==null?void 0:i.uom}),t.jsx("td",{children:i.qty}),t.jsxs("td",{children:["₹",i.price.toFixed(2)]}),u&&t.jsxs("td",{children:["₹",(i.qty*i.price).toFixed(2)]}),u&&t.jsx("td",{children:i.gst_percent?`${i.gst_percent}%`:"-"}),u&&t.jsx("td",{children:i.cgst_amount>0?`₹${(i.cgst_amount||0).toFixed(2)} (${f}%)`:"-"}),u&&t.jsx("td",{children:i.sgst_amount>0?`₹${(i.sgst_amount||0).toFixed(2)} (${j}%)`:"-"}),t.jsxs("td",{children:["₹",i.total_price.toFixed(2)]})]},x)}):t.jsx("tr",{children:t.jsx("td",{colSpan:u?"10":"6",className:"text-center",children:"No work details available"})}),e.items&&e.items.length>0&&t.jsxs("tr",{className:"table-warning fw-bold",children:[t.jsx("td",{colSpan:u?"5":"4",className:"text-end",children:"Total:"}),u&&t.jsxs("td",{children:["₹",g.subtotalWithoutGST.toFixed(2)]}),u&&t.jsx("td",{children:"-"}),u&&t.jsxs("td",{children:["₹",g.rowCGST.toFixed(2)]}),u&&t.jsxs("td",{children:["₹",g.rowSGST.toFixed(2)]}),t.jsxs("td",{children:["₹",g.totalAfterRowGST.toFixed(2)]})]})]})]})})}),Q&&t.jsx("div",{className:"row section",children:t.jsxs("div",{className:"col-md-12",children:[t.jsx("h6",{className:"fw-semibold text-primary",children:"GST Details"}),t.jsx("table",{className:"table table-bordered border-black",children:t.jsxs("tbody",{children:[t.jsxs("tr",{children:[t.jsx("td",{children:t.jsx("strong",{children:"Taxable Amount:"})}),t.jsxs("td",{className:"text-center",children:["₹",g.totalAfterRowGST.toFixed(2)]})]}),g.globalCGST>0&&t.jsxs("tr",{children:[t.jsx("td",{children:t.jsxs("strong",{children:["CGST (",e.cgstPercentage||Number(e.gst||0)/2,"%):"]})}),t.jsxs("td",{className:"text-center",children:["₹",g.globalCGST.toFixed(2)]})]}),g.globalSGST>0&&t.jsxs("tr",{children:[t.jsx("td",{children:t.jsxs("strong",{children:["SGST (",e.sgstPercentage||Number(e.gst||0)/2,"%):"]})}),t.jsxs("td",{className:"text-center",children:["₹",g.globalSGST.toFixed(2)]})]}),g.globalIGST>0&&t.jsxs("tr",{children:[t.jsx("td",{children:t.jsxs("strong",{children:["IGST (",e.igstPercentage||Number(e.gst||0),"%):"]})}),t.jsxs("td",{className:"text-center",children:["₹",g.globalIGST.toFixed(2)]})]}),t.jsxs("tr",{className:"table-success",children:[t.jsx("td",{children:t.jsx("strong",{children:"Total GST Amount:"})}),t.jsx("td",{className:"text-center",children:t.jsxs("strong",{children:["₹",g.globalTotalGST.toFixed(2)]})})]})]})})]})}),e.discount>0&&t.jsx("div",{className:"row section",children:t.jsx("div",{className:"col-md-12",children:t.jsx("table",{className:"table table-bordered border-black",children:t.jsx("tbody",{children:t.jsxs("tr",{children:[t.jsx("td",{children:"Discount:"}),t.jsxs("td",{className:"text-center",children:["₹",e.discount]})]})})})})}),t.jsx("div",{className:"row section",children:t.jsx("div",{className:"col-md-12",children:t.jsx("table",{className:"table table-bordered border-black",children:t.jsx("tbody",{children:t.jsxs("tr",{children:[t.jsx("td",{children:t.jsx("strong",{children:"Grand Total:"})}),t.jsx("td",{className:"text-center",children:t.jsxs("strong",{children:["₹",e.finalAmount]})})]})})})})}),t.jsx("div",{className:"row section",children:t.jsx("div",{className:"col-md-12",children:t.jsx("table",{className:"table table-bordered border-black",children:t.jsxs("tbody",{children:[t.jsxs("tr",{children:[t.jsx("td",{children:"Amount Paid:"}),t.jsxs("td",{children:["₹",e.amountPaid]})]}),t.jsxs("tr",{children:[t.jsx("td",{children:"Balance Amount:"}),t.jsxs("td",{children:["₹",C.toFixed(2)]})]})]})})})}),t.jsx("div",{className:"row section mt-3",children:t.jsxs("div",{className:"col-md-12",children:[t.jsx("h6",{className:"mt-4 mb-2 fw-semibold text-primary border-bottom border-primary pb-2",children:"Note"}),t.jsx("p",{className:"ms-2 text-dark",children:e!=null&&e.note?e.note:"No note available."}),t.jsx("h6",{className:"mt-4 mb-2 fw-semibold text-primary border-bottom border-primary pb-2",children:"Payment Terms"}),t.jsx("ul",{className:"ms-3",children:e!=null&&e.payment_terms?e.payment_terms.split(`
`).map((i,x)=>t.jsx("li",{className:"text-dark",children:i},x)):t.jsx("li",{className:"text-muted",children:"No payment terms available."})}),t.jsx("h6",{className:"mt-4 mb-2 fw-semibold text-primary border-bottom border-primary pb-2",children:"Terms & Conditions"}),t.jsx("ul",{className:"ms-3",children:e!=null&&e.terms_and_conditions?e.terms_and_conditions.split(`
`).map((i,x)=>t.jsx("li",{className:"text-dark",children:i},x)):t.jsx("li",{className:"text-muted",children:"No terms and conditions provided."})})]})}),t.jsx("div",{className:"row section mt-3",children:t.jsx("div",{className:"col-md-12 text-center",children:t.jsx("p",{children:"This bill has been computer-generated and is authorized."})})}),t.jsxs("div",{className:"d-flex justify-content-center flex-wrap gap-2",children:[t.jsx(et,{color:"danger",variant:"outline",className:"d-print-none flex-fill",onClick:p,children:"Edit Order"}),t.jsx(et,{color:"primary",variant:"outline",onClick:pt,className:"d-print-none flex-fill",style:{display:"none"},children:"Print"}),t.jsxs(ge,{className:"mb-2 d-print-none flex-fill",value:F,onChange:i=>q(i.target.value),style:{maxWidth:"200px",display:"none"},children:[t.jsx("option",{value:"english",children:"English"}),t.jsx("option",{value:"marathi",children:"Marathi"}),t.jsx("option",{value:"tamil",children:"Tamil"}),t.jsx("option",{value:"bengali",children:"Bengali"})]}),t.jsx(et,{color:"success",variant:"outline",onClick:()=>it(F),className:"d-print-none flex-fill",children:"Download PDF"}),t.jsx(et,{color:"success",variant:"outline",onClick:()=>nt(),className:"d-print-none flex-fill",children:"Share on WhatsApp"})]})]})})]})};export{Se as default};
