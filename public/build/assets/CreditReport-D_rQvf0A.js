import{r as x,b as Ae,R as ne,j as e,C as P}from"./index-C2h9iXsq.js";import{g as re,a as ie,b as Le}from"./api-C2dAnRUz.js";import{a as T,b as _,c as w}from"./index.esm-DQbyd5df.js";import{h as $e}from"./html2pdf-CMXm5eKC.js";import{u as Pe,C as D}from"./DefaultLayout-Bb3k2Kjc.js";import{C as B,a as z}from"./CCardBody-DHWC5_BS.js";import{C as _e}from"./CCardHeader-BOYr8GAh.js";import{C as De}from"./CForm-BVvPNiqY.js";import{C as O}from"./CFormInput-Da28fgYD.js";import{C as M}from"./CButton--W_4ZeJh.js";import{C as de,a as le,b as v,c as y,d as ce,e as b}from"./CTable-B2fFA3gN.js";import{c as me,a as pe}from"./cil-arrow-circle-top-BMvXO1_r.js";import{c as xe,a as he}from"./cil-phone-DD-NWLBR.js";import"./jspdf.es.min-B0tN83gG.js";import"./jspdf.es.min-BwCsaKCZ.js";import"./typeof-QjJsDpFa.js";import"./html2canvas.esm-DZlvpFNH.js";import"./RawMaterial-BtjEDAbB.js";import"./cil-mobile-CRjBRZgk.js";import"./CFormControlWrapper-CgtL4Ts4.js";import"./CFormLabel-DkkhltaS.js";let ue;const Ee=300,tt=()=>{var te,se,ae,oe;const[E,I]=x.useState([]),[f,S]=x.useState([]),[U,fe]=x.useState("");x.useState({});const[F,be]=x.useState({}),[A,H]=x.useState({}),[j,R]=x.useState({}),[Y,q]=x.useState({});x.useState({});const[k,W]=x.useState({}),{showToast:C}=Ae(),L=(se=(te=re())==null?void 0:te.company_info)==null?void 0:se.company_name,$=(oe=(ae=re())==null?void 0:ae.company_info)==null?void 0:oe.phone_no,{t:r,i18n:ge}=Pe("global");ge.language;const[c,ye]=x.useState({key:null,direction:"asc"}),G=t=>{let s="asc";c.key===t&&c.direction==="asc"&&(s="desc"),ye({key:t,direction:s})},je=()=>{const t=f.reduce((a,d)=>a+Math.abs(d.totalPayment),0),s=`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #2980b9;
          margin-bottom: 10px;
        }
        .summary {
          background-color: #f8f9fa;
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 20px;
        }
        .summary p {
          margin: 5px 0;
          font-size: 14px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th {
          background-color: #2980b9;
          color: white;
          padding: 12px;
          text-align: left;
          font-weight: bold;
        }
        td {
          padding: 10px;
          border-bottom: 1px solid #ddd;
        }
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        tr:hover {
          background-color: #f5f5f5;
        }
        .amount {
          text-align: right;
          font-weight: bold;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Credit Report</h1>
        <p>Generated on ${new Date().toLocaleDateString()}</p>
      </div>
      
      <div class="summary">
        <p><strong>Total Customers:</strong> ${f.length}</p>
        <p><strong>Total Due Amount:</strong> Rs.${t.toFixed(2)}</p>
      </div>

      <table>
        <thead>
          <tr>
            <th>Sr No.</th>
            <th>Name</th>
            <th>Mobile</th>
            <th>Due Amount</th>
          </tr>
        </thead>
        <tbody>
          ${f.map((a,d)=>`
            <tr>
              <td>${d+1}</td>
              <td>${a.name}</td>
              <td>${a.mobile}</td>
              <td class="amount">Rs.${Math.abs(a.totalPayment).toFixed(2)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
      
      <div class="footer">
        <p>This report was generated automatically</p>
      </div>
    </body>
    </html>
  `,o={margin:1,filename:"credit_report.pdf",image:{type:"jpeg",quality:.98},html2canvas:{scale:2,useCORS:!0,letterRendering:!0,allowTaint:!0},jsPDF:{unit:"in",format:"a4",orientation:"portrait"}};$e().set(o).from(s).save()};x.useEffect(()=>{(async()=>{try{const s=await ie("/api/creditReport");if(s){const o=s.filter(a=>{var d;return a.totalPayment<0&&(a.totalPayment!==0||((d=a.items)==null?void 0:d.some(n=>n.quantity>0)))}).sort((a,d)=>a.name.localeCompare(d.name));I(o),S(o)}}catch(s){C("danger","Error occurred "+s)}})()},[]);const Ce=t=>{clearTimeout(ue),ue=setTimeout(()=>{(t==null?void 0:t.length)>0?S(E.filter(s=>s.name.toLowerCase().includes(t.toLowerCase()))):S(E)},Ee)},we=async t=>{if(!A[t]){q(s=>({...s,[t]:!0}));try{const s=await ie(`/api/customer/${t}/unpaid-orders`);if(s){const a=s.filter(n=>n.orderStatus===1||n.orderStatus===2).sort((n,i)=>{const m=new Date(n.deliveryDate||n.createdAt||0);return new Date(i.deliveryDate||i.createdAt||0)-m});H(n=>({...n,[t]:a}));const d={};a.forEach(n=>{d[n.id]=""}),R(n=>({...n,[t]:d}))}}catch(s){C("danger",`Error fetching orders: ${s.message}`)}finally{q(s=>({...s,[t]:!1}))}}},K=async t=>{const s=!F[t];be(o=>({...o,[t]:s})),s&&await we(t)},J=(t,s,o)=>{(o===""||/^[0-9]*\.?[0-9]*$/.test(o))&&R(a=>({...a,[t]:{...a[t],[s]:o}}))},Q=async(t,s)=>{var m;if(k[s])return;const o=parseFloat(((m=j[t])==null?void 0:m[s])||0),d=(A[t]||[]).find(l=>l.id===s);if(!d)return;if(isNaN(o)||o<=0){C("warning",r("TOAST.invalid_amount"));return}const n=parseFloat(d.unpaidAmount.toFixed(2));if(parseFloat(o.toFixed(2))-n>.01){C("warning",r("TOAST.invalid_payment_amount"));return}W(l=>({...l,[s]:!0}));try{const l=await Le(`/api/orders/${s}/payment`,{paymentAmount:o});l&&l.success&&(C("success",r("TOAST.payment_updated")),H(h=>({...h,[t]:h[t].map(u=>u.id===s?{...u,unpaidAmount:u.unpaidAmount-o,paidAmount:u.paidAmount+o}:u)})),R(h=>({...h,[t]:{...h[t],[s]:""}})),ke(t,o))}catch(l){C("danger",`${r("TOAST.error_occurred")}: ${l.message}`)}finally{W(l=>({...l,[s]:!1}))}},ke=(t,s)=>{const o=E.map(a=>a.customerId===t?{...a,totalPayment:a.totalPayment+s}:a);I(o),S(o.filter(a=>a.name.toLowerCase().includes(U.toLowerCase())))},X=t=>{if(!t)return"N/A";try{const s={day:"numeric",month:"short",year:"numeric"},a=new Date(t).toLocaleDateString("en-US",s).replace(",",""),[d,n,i]=a.split(" ");return`${n} ${d} ${i}`}catch{return"N/A"}},Ne=ne.useMemo(()=>c.key?[...f].sort((t,s)=>{let o=t[c.key],a=s[c.key];return c.key==="name"||c.key==="customerId"?(o=(o==null?void 0:o.toString().toLowerCase())||"",a=(a==null?void 0:a.toString().toLowerCase())||"",c.direction==="asc"?o.localeCompare(a):a.localeCompare(o)):c.key==="totalPayment"?c.direction==="asc"?(o||0)-(a||0):(a||0)-(o||0):0}):f,[f,c]),Z=t=>c.key===t?c.direction==="asc"?"↑":"↓":"↕",V=t=>({marginLeft:"8px",fontSize:"18px",opacity:c.key===t?1:.5,color:c.key===t?"#0d6efd":"#6c757d",transition:"all 0.2s ease"}),ve=(t,s)=>{const o=F[t.customerId],a=A[t.customerId]||[],d=Y[t.customerId],n=[...a].sort((i,m)=>m.id-i.id);return e.jsx(B,{className:"mb-1 credit-card",style:{cursor:"pointer"},children:e.jsxs(z,{children:[e.jsxs("div",{className:"card-row-1",children:[e.jsx("div",{className:"customer-name-section",children:e.jsx("div",{className:"customer-name",children:t.name})}),e.jsxs("div",{className:"contact-icons",children:[e.jsx("a",{className:"contact-btn call-btn",href:"tel:+91"+t.mobile.replace(/^(\+91)?/,""),title:"Call",onClick:i=>i.stopPropagation(),children:e.jsx(w,{icon:xe,size:"sm"})}),e.jsx("a",{className:"contact-btn sms-btn",href:`sms:+91${t.mobile.replace(/^(\+91)?/,"")}?body=${t.totalPayment<0?`${r("sms.sms_part_1")} ${Math.abs(t.totalPayment).toFixed(2)} ${r("sms.sms_part_2")} ${r("sms.sms_part_3")} ${L} (${$})`:`${r("sms.clear_message")} ${r("sms.sms_part_3")} ${L} (${$})`}`,title:"SMS",onClick:i=>i.stopPropagation(),children:e.jsx(w,{icon:he,size:"sm"})})]})]}),e.jsxs("div",{className:"card-row-2",onClick:()=>K(t.customerId),children:[e.jsx("div",{className:"amount-badge-section",children:e.jsxs(D,{color:"danger",className:"amount-badge",children:["₹",Math.abs(t.totalPayment).toFixed(2)]})}),e.jsx("div",{className:"expand-arrow",children:e.jsx(w,{icon:o?me:pe})})]}),o&&e.jsxs("div",{className:"expanded-details",children:[e.jsx("h6",{className:"mb-2",children:r("LABELS.unpaid_orders")}),d?e.jsxs("div",{className:"text-center py-3",children:[e.jsx(P,{size:"sm"}),e.jsxs("span",{className:"ms-2",children:[r("LABELS.loading"),"..."]})]}):n.length>0?e.jsx("div",{className:"orders-list",children:n.map(i=>{var m,l,h,u,N,p;return e.jsxs("div",{className:"order-item",children:[e.jsxs("div",{className:"order-header",children:[e.jsxs("span",{className:"order-id",children:["Order ",i.id]}),e.jsx("span",{className:"order-date",children:X(i.deliveryDate)})]}),e.jsxs("div",{className:"order-amounts",children:[e.jsxs("div",{className:"amount-row",children:[e.jsxs("span",{children:[r("LABELS.total"),":"]}),e.jsxs("span",{children:["₹",((m=i.finalAmount)==null?void 0:m.toFixed(2))||"0.00"]})]}),e.jsxs("div",{className:"amount-row",children:[e.jsxs("span",{children:[r("LABELS.paid"),":"]}),e.jsxs("span",{className:"amount-paid",children:["₹",((l=i.paidAmount)==null?void 0:l.toFixed(2))||"0.00"]})]}),e.jsxs("div",{className:"amount-row",children:[e.jsxs("span",{children:[r("LABELS.due"),":"]}),e.jsxs("span",{className:"amount-due",children:["₹",((h=i.unpaidAmount)==null?void 0:h.toFixed(2))||"0.00"]})]})]}),e.jsxs("div",{className:"payment-input-section",onClick:g=>g.stopPropagation(),children:[e.jsx(O,{type:"number",step:"0.01",placeholder:"Payment amount",value:((u=j[t.customerId])==null?void 0:u[i.id])??"",onChange:g=>J(t.customerId,i.id,g.target.value),onWheel:g=>g.target.blur(),onKeyDown:g=>{(g.key==="-"||g.key==="e")&&g.preventDefault()},className:"payment-input",max:i.unpaidAmount}),e.jsx(M,{size:"sm",color:"primary",onClick:()=>Q(t.customerId,i.id),disabled:!((N=j[t.customerId])!=null&&N[i.id])||parseFloat((p=j[t.customerId])==null?void 0:p[i.id])<=0||k[i.id],className:"pay-button",children:k[i.id]?e.jsx(P,{size:"sm"}):r("LABELS.pay")})]})]},i.id)})}):e.jsx("div",{className:"text-center py-3 text-muted",children:r("LABELS.no_unpaid_orders")})]})]})},t.customerId+"_"+s)},Se=`
<style>
/* Credit Report Mobile Card Styles */
.credit-card {
  border: 1px solid #dee2e6;
  border-radius: 3px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  overflow: hidden;
  margin-bottom: 12px;
}

.credit-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.credit-card .card-body {
  padding: 10px !important;
}

/* Card Row 1: Customer name and contact icons */
.card-row-1 {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.customer-name-section {
  flex: 1;
}

.customer-name {
  font-weight: 600;
  font-size: 1.1em;
  color: #333;
  margin-bottom: 4px;
}

.customer-id {
  font-size: 0.85em;
  color: #666;
}

.contact-icons {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.contact-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  text-decoration: none;
  transition: all 0.2s ease;
}

.call-btn {
  background: #e3f2fd;
  color: #1976d2;
  border: 2px solid #bbdefb;
}

.call-btn:hover {
  background: #bbdefb;
  color: #0d47a1;
  transform: scale(1.05);
}

.sms-btn {
  background: #e8f5e8;
  color: #388e3c;
  border: 2px solid #c8e6c9;
}

.sms-btn:hover {
  background: #c8e6c9;
  color: #1b5e20;
  transform: scale(1.05);
}

/* Card Row 2: Amount badge and expand arrow */
.card-row-2 {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: px;
  cursor: pointer;
  padding: 8px 0;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
}

.amount-badge-section {
  flex: 1;
}

.amount-badge {
  font-size: 1em;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
}

.expand-arrow {
  color: #007bff;
  transition: transform 0.3s ease;
  padding: 4px;
}

.expand-arrow:hover {
  transform: scale(1.1);
}

/* Expandable Details */
.expanded-details {
  margin-top: 5px;
  padding: 5px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.orders-list {
  max-height: 400px;
  overflow-y: auto;
}

.order-item {
  background: white;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-weight: 600;
}

.order-id {
  color: #007bff;
  font-size: 0.9em;
}

.order-date {
  color: #666;
  font-size: 0.85em;
}

.order-amounts {
  margin-bottom: 12px;
}

.amount-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
  font-size: 0.9em;
}

.amount-paid {
  color: #28a745;
}

.amount-due {
  color: #dc3545;
  font-weight: 600;
}

.payment-input-section {
  display: flex;
  gap: 8px;
  align-items: center;
}

.payment-input {
  flex: 1;
  font-size: 0.9em;
}

.pay-button {
  min-width: 60px;
}

/* Desktop Styles - Updated to match image layout */
.desktop-customer-row {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.desktop-customer-row:hover {
  background-color: #f8f9fa;
}

.desktop-expanded-section {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  margin: 0;
}

.desktop-expanded-content {
  padding: 20px;
}

.desktop-orders-section h6 {
  margin-bottom: 15px;
  color: #333;
  font-weight: 600;
}

.desktop-orders-table {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.desktop-orders-table .table {
  margin-bottom: 0;
}

.desktop-orders-table thead th {
  background-color: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
  font-weight: 600;
  color: #495057;
  font-size: 0.9em;
  padding: 12px 8px;
}

.desktop-orders-table tbody td {
  padding: 12px 8px;
  vertical-align: middle;
  border-top: 1px solid #e9ecef;
}

.desktop-order-id {
  color: #007bff;
  font-weight: 600;
}

.desktop-order-date {
  color: #666;
  font-size: 0.9em;
}

.desktop-amount {
  font-weight: 600;
}

.desktop-amount-paid {
  color: #28a745;
  font-weight: 600;
}

.desktop-amount-due {
  color: #dc3545;
  font-weight: 600;
}

.desktop-payment-section {
  display: flex;
  gap: 8px;
  align-items: center;
}

.desktop-payment-input {
  width: 100px;
  font-size: 0.9em;
}

.desktop-pay-button {
  min-width: 60px;
  font-size: 0.9em;
}

.expand-icon {
  transition: transform 0.3s ease;
  cursor: pointer;
  color: #007bff;
}

.expand-icon:hover {
  transform: scale(1.1);
}

/* Mobile Cards Container */
.mobile-cards-container {
  padding: 0 4px;
}

/* Responsive breakpoints */
@media (max-width: 767.98px) {
  .desktop-table {
    display: none !important;
  }
  
  .mobile-cards {
    display: block !important;
  }
}

@media (min-width: 768px) {
  .desktop-table {
    display: block !important;
  }
  
  .mobile-cards {
    display: none !important;
  }
}
</style>
`,ee=f.reduce((t,s)=>t+s.totalPayment,0);return e.jsx(T,{children:e.jsx(_,{xs:12,style:{padding:"2px"},children:e.jsxs(B,{className:"mb-4",children:[e.jsx(_e,{children:e.jsx("strong",{children:r("LABELS.credit_report")})}),e.jsxs(z,{children:[e.jsx("div",{dangerouslySetInnerHTML:{__html:Se}}),e.jsx(B,{className:"mb-3 border-danger",children:e.jsxs(z,{className:"p-3",children:[e.jsxs(T,{className:"align-items-center",children:[e.jsx(_,{xs:6,children:e.jsx("h5",{className:"mb-0 text-danger",children:r("LABELS.total_outstanding")})}),e.jsx(_,{xs:6,className:"text-end",children:e.jsx("h4",{className:"mb-0",children:ee<0?e.jsxs(D,{color:"danger",className:"fs-6 p-2",children:["₹",Math.abs(ee).toFixed(2)]}):e.jsx("span",{className:"text-success",children:"₹0.00"})})})]}),e.jsx(T,{className:"mt-2",children:e.jsx(_,{xs:6,children:e.jsxs("small",{className:"text-muted",children:[r("LABELS.total_customers"),": ",f.length]})})})]})}),e.jsxs(De,{className:"d-flex justify-content-between mb-3",children:[e.jsx(O,{type:"text",placeholder:r("LABELS.search"),value:U,onChange:t=>{fe(t.target.value),Ce(t.target.value),t.preventDefault()},className:"me-2"}),e.jsx("div",{children:e.jsx(M,{color:"success",size:"sm",className:"ms-2",onClick:je,children:"Export PDF"})})]}),e.jsx("div",{className:"mobile-cards d-md-none",children:e.jsx("div",{className:"mobile-cards-container",children:f.length===0?e.jsx("div",{className:"text-center py-5 text-muted",children:"No customers with outstanding balance found"}):f.map((t,s)=>ve(t,s))})}),e.jsx("div",{className:"desktop-table d-none d-md-block",children:e.jsx("div",{className:"table-responsive",style:{height:"450px",overflowY:"auto",border:"1px solid #dee2e6",borderRadius:"0.375rem"},children:e.jsxs(de,{className:"mb-0",style:{position:"relative"},children:[e.jsx(le,{style:{position:"sticky",top:0,zIndex:10,backgroundColor:"#f8f9fa",borderBottom:"2px solid #dee2e6"},children:e.jsxs(v,{children:[e.jsxs(y,{scope:"col",onClick:()=>G("name"),style:{cursor:"pointer"},children:[r("LABELS.name"),e.jsx("span",{style:V("name"),children:Z("name")})]}),e.jsxs(y,{scope:"col",onClick:()=>G("totalPayment"),style:{cursor:"pointer"},children:[r("LABELS.total"),e.jsx("span",{style:V("totalPayment"),children:Z("totalPayment")})]}),e.jsx(y,{scope:"col",children:r("LABELS.actions")})]})}),e.jsx(ce,{children:Ne.map((t,s)=>{const o=F[t.customerId],a=A[t.customerId]||[],d=Y[t.customerId];return e.jsxs(ne.Fragment,{children:[e.jsxs(v,{className:"desktop-customer-row",onClick:()=>K(t.customerId),children:[e.jsx(b,{children:e.jsxs("div",{className:"d-flex align-items-center",children:[e.jsx(w,{icon:o?me:pe,className:"me-2 expand-icon",size:"lg"}),e.jsx("span",{children:t.name})]})}),e.jsx(b,{children:t.totalPayment<0?e.jsx(D,{color:"danger",className:"fs-6 px-3 py-2",children:Math.abs(t.totalPayment).toFixed(2)}):e.jsxs("span",{className:"text-success fw-bold",children:["₹",Math.abs(t.totalPayment).toFixed(2)]})}),e.jsxs(b,{onClick:n=>n.stopPropagation(),children:[e.jsx("a",{className:"btn btn-outline-primary btn-sm me-2",href:"tel:+91"+t.mobile.replace(/^(\+91)?/,""),title:"Call",children:e.jsx(w,{icon:xe})}),e.jsx("a",{className:"btn btn-outline-success btn-sm",href:`sms:+91${t.mobile.replace(/^(\+91)?/,"")}?body=${t.totalPayment<0?`${r("sms.sms_part_1")} ${Math.abs(t.totalPayment).toFixed(2)} ${r("sms.sms_part_2")} ${r("sms.sms_part_3")} ${L} (${$})`:`${r("sms.clear_message")} ${r("sms.sms_part_3")} ${L} (${$})`}`,title:"SMS",children:e.jsx(w,{icon:he})})]})]}),o&&e.jsx(v,{children:e.jsx(b,{colSpan:4,className:"desktop-expanded-section p-0",children:e.jsx("div",{className:"desktop-expanded-content",children:e.jsxs("div",{className:"desktop-orders-section",children:[e.jsx("h6",{children:"Unpaid Orders"}),d?e.jsxs("div",{className:"text-center py-4",children:[e.jsx(P,{size:"sm"}),e.jsxs("span",{className:"ms-2",children:[r("LABELS.loading"),"..."]})]}):a.length>0?e.jsx("div",{className:"desktop-orders-table",children:e.jsxs(de,{children:[e.jsx(le,{children:e.jsxs(v,{children:[e.jsx(y,{children:"Order ID"}),e.jsx(y,{children:"Date"}),e.jsx(y,{children:"Total Amount"}),e.jsx(y,{children:"Paid Amount"}),e.jsx(y,{children:"Unpaid Amount"}),e.jsx(y,{children:"Return"})]})}),e.jsx(ce,{children:a.map(n=>{var i,m,l,h,u,N;return e.jsxs(v,{children:[e.jsx(b,{className:"desktop-order-id",children:n.id}),e.jsx(b,{className:"desktop-order-date",children:X(n.deliveryDate)}),e.jsxs(b,{className:"desktop-amount",children:["₹",((i=n.finalAmount)==null?void 0:i.toFixed(2))||"0.00"]}),e.jsxs(b,{className:"desktop-amount-paid",children:["₹",((m=n.paidAmount)==null?void 0:m.toFixed(2))||"0.00"]}),e.jsx(b,{children:e.jsxs(D,{color:"danger",className:"px-3 py-2",children:["₹",((l=n.unpaidAmount)==null?void 0:l.toFixed(2))||"0.00"]})}),e.jsx(b,{onClick:p=>p.stopPropagation(),children:e.jsxs("div",{className:"desktop-payment-section",children:[e.jsx(O,{type:"number",step:"0.01",placeholder:"Amount",value:((h=j[t.customerId])==null?void 0:h[n.id])??"",onChange:p=>J(t.customerId,n.id,p.target.value),onWheel:p=>p.target.blur(),onKeyDown:p=>{(p.key==="-"||p.key==="e")&&p.preventDefault()},className:"desktop-payment-input",max:n.unpaidAmount}),e.jsx(M,{size:"sm",color:"primary",onClick:()=>Q(t.customerId,n.id),disabled:!((u=j[t.customerId])!=null&&u[n.id])||parseFloat((N=j[t.customerId])==null?void 0:N[n.id])<=0||k[n.id],className:"desktop-pay-button",children:k[n.id]?e.jsx(P,{size:"sm"}):r("LABELS.pay")})]})})]},n.id)})})]})}):e.jsx("div",{className:"text-center py-4 text-muted",children:r("LABELS.no_unpaid_orders")})]})})})})]},t.customerId)})})]})})})]})]})})})};export{tt as default};
