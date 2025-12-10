import{u as Ze,b as et,r as i,e as tt,j as e,C as G}from"./index-C2h9iXsq.js";import{a as we,b as ye}from"./api-C2dAnRUz.js";import{C as st}from"./ConfirmationModal-C-jW-mSH.js";import{a as X,b as V,c as R}from"./index.esm-DQbyd5df.js";import{u as ot,C as m}from"./DefaultLayout-Bb3k2Kjc.js";import{C as at}from"./CFormInput-Da28fgYD.js";import{C as ve,a as Ne}from"./CCardBody-DHWC5_BS.js";import{C as nt}from"./CCardHeader-BOYr8GAh.js";import{C as rt,a as it,b as Z,c as f,d as lt,e as h}from"./CTable-B2fFA3gN.js";import{c as Se,a as ke}from"./cil-phone-DD-NWLBR.js";import{C as Ce}from"./CButton--W_4ZeJh.js";import{c as ct,a as dt}from"./cil-arrow-circle-top-BMvXO1_r.js";import{C as mt}from"./CCollapse-Bz0mBxpl.js";import"./RawMaterial-BtjEDAbB.js";import"./cil-mobile-CRjBRZgk.js";import"./CFormControlWrapper-CgtL4Ts4.js";import"./CFormLabel-DkkhltaS.js";const Bt=()=>{var ge,fe;const Y=Ze(),{showToast:x}=et(),{t:o,i18n:ee}=ot("global"),n=window.location.href.split("/").pop(),[U,te]=i.useState(!1),{search:Ae}=tt();new URLSearchParams(Ae).get("convertTo");const[y,Le]=i.useState([]),[g,se]=i.useState(""),[oe,ae]=i.useState(""),[C,ne]=i.useState(!1),[v,re]=i.useState(!1),[c,j]=i.useState(null),[ie,$]=i.useState(null),[_,Ee]=i.useState(!1),[pt,_e]=i.useState(!1),[Be,le]=i.useState(new Set),[Te,Q]=i.useState(!1),[De,q]=i.useState(!1),[B,ze]=i.useState(null),[O,Fe]=i.useState(null),[Me,Re]=i.useState(0),[P,$e]=i.useState(0),[qe,Oe]=i.useState(0),[T,ce]=i.useState(""),[I,W]=i.useState(""),[Pe,J]=i.useState({}),A=i.useRef(null),N=i.useRef(null),D=i.useRef(null),K=JSON.parse(localStorage.getItem("userData")),de=((fe=(ge=K==null?void 0:K.user)==null?void 0:ge.company_info)==null?void 0:fe.company_name)||"Nursery",Ie=()=>n==="order"?-1:n==="bookings"?2:n==="quotation"?3:1;i.useEffect(()=>{const t=()=>{_e(window.innerWidth<=768)};return t(),window.addEventListener("resize",t),()=>window.removeEventListener("resize",t)},[]),i.useEffect(()=>{const t=parseFloat(T)||0,s=parseFloat(P)||0;t>s?W(o("validation.amountExceedsBalance")):t<0?W(o("validation.amountCannotBeNegative")):W("")},[T,P,o]);const He=i.useCallback(t=>{N.current&&clearTimeout(N.current),N.current=setTimeout(()=>{se(t)},300)},[]),S=i.useMemo(()=>!y||!Array.isArray(y)?[]:y.filter(t=>{var a,l,r,d,u,b,p,H,F,M;if(c){const L=new Date;L.setHours(0,0,0,0);const E=new Date(t.deliveryDate);if(isNaN(E))return!1;E.setHours(0,0,0,0);const w=Math.floor((E-L)/(1e3*60*60*24));if(c==="missed"&&w>=0||c==="today"&&w!==0||c==="within15"&&(w<1||w>15)||c==="more15"&&w<=15)return!1}if(!g.trim())return!0;const s=g.toLowerCase();return((l=(a=t.customer)==null?void 0:a.name)==null?void 0:l.toLowerCase().includes(s))||((d=(r=t.customer)==null?void 0:r.mobile)==null?void 0:d.toString().includes(g))||((b=(u=t.customer)==null?void 0:u.email)==null?void 0:b.toLowerCase().includes(s))||((p=t.invoiceDate)==null?void 0:p.toLowerCase().includes(s))||((H=t.items)==null?void 0:H.some(L=>{var E,w,je;return((E=L.product_name)==null?void 0:E.toLowerCase().includes(s))||((w=L.product_local_name)==null?void 0:w.toLowerCase().includes(s))||((je=L.remark)==null?void 0:je.toLowerCase().includes(s))}))||((F=t.finalAmount)==null?void 0:F.toString().includes(g))||((M=t.paidAmount)==null?void 0:M.toString().includes(g))}),[y,g,c]),me=t=>{const s=new Date;s.setHours(0,0,0,0);const a=new Date(t);a.setHours(0,0,0,0);const l=a.getTime()-s.getTime(),r=Math.ceil(l/(1e3*60*60*24));return r<0?{color:"secondary",className:"badge-strobe-grey"}:r===0?{color:"danger",className:"badge-strobe-danger"}:r>0&&r<=15?{color:"warning",className:"badge-strobe-warning"}:r>15?{color:"success",className:""}:{color:"secondary",className:""}},Ge=t=>{le(s=>{const a=new Set;return s.has(t)||a.add(t),a})};i.useEffect(()=>{le(new Set)},[n]);const k=async(t=!0)=>{t?ne(!0):re(!0);try{const s=Ie(),a=s===2?2:s===3?3:void 0,l=`/api/order?invoiceType=${s}`+(a!==void 0?`&orderStatus=${a}`:"")+(ie&&!t?`&cursor=${ie}`:""),r=await we(l);if(r.error)x("danger",r.error);else{const d=t?r.data:[...y,...r.data];Le(d),$(r.next_cursor||null),Ee(r.has_more_pages||!1)}}catch(s){x("danger",o("TOAST.error_occurred")+": "+s.message)}finally{ne(!1),re(!1)}},ue=i.useCallback(()=>{D.current&&clearTimeout(D.current),D.current=setTimeout(()=>{const t=A.current;if(!t)return;const{scrollTop:s,scrollHeight:a,clientHeight:l}=t,r=60,d=Math.floor(l/r),u=Math.floor(a/r),b=Math.floor(s/r),p=b+d,H=p>=u-2,F=u-p,M=F<=2;console.log("Row-based Scroll Debug:",{scrollTop:s,clientHeight:l,scrollHeight:a,approximateRowHeight:r,visibleRows:d,totalScrollableRows:u,currentTopRow:b,currentBottomRow:p,rowsRemainingBelow:F,isOn2ndLastRow:H,shouldLoadMore:M,hasMorePages:_,isFetchingMore:v,isLoading:C}),M&&_&&!v&&!C&&(console.log("Loading more orders - reached 2nd last row..."),k(!1))},100)},[_,v,C,k]);i.useCallback(()=>{if(!A.current)return;const t=new IntersectionObserver(l=>{l.forEach(r=>{if(r.isIntersecting){const d=parseInt(r.target.dataset.rowIndex),u=y.length;d===u-2&&_&&!v&&!C&&(console.log("2nd last row visible - loading more..."),k(!1))}})},{root:A.current,rootMargin:"0px",threshold:.1}),s=A.current.querySelectorAll("[data-row-index]");return Array.from(s).slice(-3).forEach(l=>t.observe(l)),t},[y,_,v,C,k]),i.useEffect(()=>{$(null),k(!0)},[n]),i.useEffect(()=>()=>{N.current&&clearTimeout(N.current),D.current&&clearTimeout(D.current)},[]);const z=t=>{const s={day:"numeric",month:"short",year:"numeric"},l=new Date(t).toLocaleDateString("en-US",s).replace(",",""),[r,d]=l.split(" ");return`${d} ${r}`},pe=t=>{if(!t||typeof t!="string")return"N/A";try{let[s,a]=t.split(":").map(Number);if(isNaN(s)||isNaN(a))return"N/A";const l=s>=12?"PM":"AM";return s=s%12||12,`${s}:${a.toString().padStart(2,"0")} ${l}`}catch(s){return console.warn("Error converting time:",t,s),"N/A"}},Ve=t=>{ze(t),Q(!0)},Ye=async()=>{try{await ye(`/api/order/${B.id}/cancel`,{...B,orderStatus:0}),Q(!1),x("danger",o("TOAST.order_cancelled")),$(null),k(!0)}catch(t){x("danger",o("TOAST.error_occurred")+": "+t.message)}},Ue=t=>{Y(`/invoice-details/${t.id}`)},Qe=async t=>{Fe(t),Re(t.paidAmount),$e(t.finalAmount-t.paidAmount),Oe(t.finalAmount),q(!0);try{const s=t.items.map(l=>l.product_sizes_id).join(","),a=await we(`/api/product-sizes?ids=${s}`);if(a.error)x("danger",a.error),J({});else{const l={};a.data.forEach(r=>{l[r.id]=r.stock}),J(l)}}catch(s){x("danger","Error fetching stock: "+s.message),J({})}},We=async()=>{var t;if(!U){te(!0);try{await ye(`/api/updateorder/${O.id}`,{orderStatus:1,customer_id:(t=O.customer)==null?void 0:t.id,amountToBePaid:parseInt(T||0)}),x("success",o("TOAST.order_delivered")),q(!1),ce(""),$(null),k(!0)}catch(s){x("danger",o("TOAST.error_occurred")+": "+s.message)}finally{te(!1)}}},Je=t=>{const s=t.target.value;ae(s),He(s)},Ke=()=>{ae(""),se(""),N.current&&clearTimeout(N.current)},xe=t=>{const s={0:{color:"danger",text:"Cancelled"},1:{color:"success",text:"Delivered"},2:{color:"warning",text:"Pending"},3:{color:"primary",text:"Quotation"}},a=s[t]||s[2];return e.jsx(m,{color:a.color,children:a.text})},be=t=>!t||t.length===0?e.jsx("span",{className:"text-muted",children:"Only cash collected"}):e.jsx("div",{className:"items-list",children:t.map((s,a)=>e.jsxs("div",{className:"item-row",children:[e.jsxs("div",{className:"item-name",children:[ee.language==="en"?s.product_name:s.product_local_name,e.jsxs("span",{className:"item-qty",children:[" (",s.dQty," × ₹",s.dPrice,")"]})]}),s.remark&&e.jsx("div",{className:"item-remark text-muted small",children:e.jsxs("em",{children:["Note: ",s.remark]})})]},s.id||a))}),he=t=>e.jsxs("div",{className:"action-buttons",children:[n==="order"&&t.orderStatus!==0&&e.jsx(m,{role:"button",color:"info",onClick:()=>Ue(t),style:{cursor:"pointer",fontSize:"0.75em"},children:"Show"}),n==="bookings"&&t.orderStatus!==0&&e.jsx(m,{role:"button",color:"success",onClick:()=>Qe(t),style:{cursor:"pointer",fontSize:"0.75em"},children:"Deliver"}),(n==="bookings"||n==="order")&&t.orderStatus!==0&&e.jsx(m,{role:"button",color:"danger",onClick:()=>Ve(t),style:{cursor:"pointer",fontSize:"0.75em"},children:"Cancel"}),n==="quotation"&&t.orderStatus===3&&e.jsxs(e.Fragment,{children:[e.jsx(m,{role:"button",color:"success",onClick:()=>Y(`/edit-order/${t.id}?convertTo=1`),style:{cursor:"pointer",fontSize:"0.75em"},children:o("order.convert_regular")}),e.jsx(m,{role:"button",color:"warning",onClick:()=>Y(`/edit-order/${t.id}?convertTo=2`),style:{cursor:"pointer",fontSize:"0.75em"},children:o("order.convert_advance")})]})]}),Xe=(t,s)=>{var r,d,u,b;const a=Be.has(t.id),l=n==="bookings"?me(t.deliveryDate):null;return e.jsx(ve,{className:"mb-3 order-card",onClick:()=>Ge(t.id),style:{cursor:"pointer"},children:e.jsxs(Ne,{children:[e.jsxs("div",{className:"card-row-1",children:[e.jsxs("div",{className:"customer-name-section",children:[e.jsx("div",{className:"customer-name",children:((r=t.customer)==null?void 0:r.name)||"Unknown"}),n==="order"&&e.jsx("div",{className:"status-badge",children:xe(t.orderStatus)})]}),e.jsxs("div",{className:"contact-icons",children:[e.jsx("a",{className:"contact-btn call-btn",href:`tel:+91${(d=t.customer)==null?void 0:d.mobile}`,title:"Call",onClick:p=>p.stopPropagation(),children:e.jsx(R,{icon:Se,size:"sm"})}),e.jsx("a",{className:"contact-btn sms-btn",href:`sms:+91${(u=t.customer)==null?void 0:u.mobile}?body=Hello ${(b=t.customer)==null?void 0:b.name}, your order is ready. Balance: ₹${(t.finalAmount-t.paidAmount).toFixed(2)}. From - ${de}`,title:"SMS",onClick:p=>p.stopPropagation(),children:e.jsx(R,{icon:ke,size:"sm"})})]})]}),e.jsxs("div",{className:"card-row-2",children:[e.jsx("div",{className:"date-badge-section",children:t.items&&t.items.length>0?`${ee.language==="en"?t.items[0].product_name:t.items[0].product_local_name}${t.items.length>1?` +${t.items.length-1} items`:""}`:"Only cash collected"}),e.jsxs("div",{className:"expand-arrow d-flex align-items-center gap-2",children:[n==="bookings"&&l?e.jsx(m,{color:l.color,className:`date-badge ${l.className}`,children:z(t.deliveryDate)}):e.jsx(m,{color:"primary",className:"date-badge",children:z(t.invoiceDate)}),e.jsx(R,{icon:a?ct:dt})]})]}),e.jsx("div",{className:"card-row-3",children:e.jsxs("div",{className:"order-details-line",children:["📅 ",z(t.invoiceDate)," • ",pe(t.deliveryTime)]})}),e.jsx(mt,{visible:a,children:e.jsxs("div",{className:"expanded-details",children:[e.jsxs("div",{className:"detail-section",children:[e.jsx("div",{className:"detail-label",children:"Items:"}),e.jsx("div",{className:"detail-content",children:be(t.items)})]}),e.jsxs("div",{className:"amount-details",children:[e.jsxs("div",{className:"amount-row",children:[e.jsx("span",{children:"Paid:"}),e.jsxs("span",{className:"amount-paid",children:["₹",parseFloat(t.paidAmount).toFixed(2)]})]}),e.jsxs("div",{className:"amount-row",children:[e.jsx("span",{children:"Balance:"}),e.jsxs("span",{className:"amount-balance",children:["₹",(t.finalAmount-t.paidAmount).toFixed(2)]})]}),e.jsxs("div",{className:"amount-row total-row",children:[e.jsx("span",{children:"Total:"}),e.jsxs("span",{className:"amount-total",children:["₹",parseFloat(t.finalAmount).toFixed(2)]})]})]})]})}),e.jsx("div",{className:"card-row-4",onClick:p=>p.stopPropagation(),children:e.jsx("div",{className:"action-buttons-mobile",children:he(t)})})]})},t.id)};return C?e.jsx("div",{className:"d-flex justify-content-center align-items-center",style:{minHeight:"400px"},children:e.jsxs("div",{className:"text-center",children:[e.jsx(G,{color:"primary",size:"lg"}),e.jsx("p",{className:"mt-3 text-muted",children:"Loading orders..."})]})}):e.jsxs(e.Fragment,{children:[e.jsx("style",{jsx:!0,global:!0,children:`

/* New Mobile Card Structure - COMPACT VERSION */
.order-card {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  overflow: hidden;
  margin-bottom: 12px;
}

.order-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

/* Card Body Padding - MOST IMPORTANT FOR COMPACTNESS */
.order-card .card-body {
  padding: 12px !important;
}

/* Card Row 1: Customer name, status, contact icons */
.card-row-1 {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.customer-name-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.customer-name {
  font-weight: 600;
  font-size: 1em;
  color: #333;
  line-height: 1.1;
}

.status-badge {
  align-self: flex-start;
}

.contact-icons {
  display: flex;
  gap: 6px;
  align-items: flex-start;
}

.contact-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
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

/* Card Row 2: Date badge and expand arrow */
.card-row-2 {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  cursor: pointer;
  padding: 4px 0;
}

.date-badge-section {
  flex: 1;
}

.date-badge {
  font-size: 0.8em;
  padding: 4px 10px;
  border-radius: 16px;
  font-weight: 500;
}

.expand-arrow {
  color: #007bff;
  transition: transform 0.3s ease;
  padding: 2px;
}

.expand-arrow:hover {
  transform: scale(1.1);
}

/* Card Row 3: Order details line */
.card-row-3 {
  margin-bottom: 8px;
  padding: 4px 0;
  border-top: 1px solid #f0f0f0;
}

.order-details-line {
  color: #666;
  font-size: 0.85em;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Card Row 4: Action buttons - LARGER AND HALF-HALF LAYOUT */
.card-row-4 {
  padding: 6px 0;
  border-top: 1px solid #f0f0f0;
}

.action-buttons-mobile {
  
  gap: 8px;
  justify-content: space-between;
  width: 100%;
}

.action-buttons-mobile .badge {
  font-size: 0.85em;
  padding: 8px 16px;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  text-align: center;
  flex: 1;
  min-height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
}

.action-buttons-mobile .badge:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* Specific colors for action buttons */
.action-buttons-mobile .badge[role="button"] {
  border: 1px solid;
}

.action-buttons-mobile .badge.bg-info {
  background-color: #0dcaf0 !important;
  border-color: #0dcaf0;
  color: white !important;
}

.action-buttons-mobile .badge.bg-success {
  background-color: #198754 !important;
  border-color: #198754;
  color: white !important;
}

.action-buttons-mobile .badge.bg-danger {
  background-color: #dc3545 !important;
  border-color: #dc3545;
  color: white !important;
}

/* For single button, take full width */
.action-buttons-mobile .badge:only-child {
  flex: 1;
}

/* For two buttons, equal halves */
.action-buttons-mobile .badge:first-child:nth-last-child(2),
.action-buttons-mobile .badge:first-child:nth-last-child(2) ~ .badge {
  flex: 1;
}

/* For three buttons, equal thirds */
.action-buttons-mobile .badge:first-child:nth-last-child(3),
.action-buttons-mobile .badge:first-child:nth-last-child(3) ~ .badge {
  flex: 1;
}

/* Expandable Details */
.expanded-details {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 2px solid #f0f0f0;
  background: #fafafa;
  margin: 12px -12px -12px -12px;
  padding: 12px;
}

.detail-section {
  margin-bottom: 12px;
}

.detail-label {
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
  font-size: 0.85em;
}

.detail-content {
  background: white;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
}

.amount-details {
  background: white;
  border-radius: 6px;
  padding: 12px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.amount-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  font-size: 0.9em;
}

.amount-row:last-child {
  margin-bottom: 0;
}

.total-row {
  border-top: 1px solid #dee2e6;
  padding-top: 6px;
  font-weight: 600;
  font-size: 0.95em;
}

.amount-paid {
  color: #28a745 !important;
  font-weight: 600;
}

.amount-balance {
  color: #dc3545 !important;
  font-weight: 600;
}

.amount-total {
  color: #333 !important;
  font-weight: 600;
}

/* Remove old mobile styles that conflict */
.card-header-row,
.order-meta-actions,
.order-date-status,
.pre-expand-actions,
.card-actions {
  display: none !important;
}

/* Desktop Table Styles */
.table-container {
  height: 422px;
  overflow-y: auto;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  position: relative;
}

@media (max-width: 768px) {
  .table-container {
    height: 600px;
    overflow-x: auto;
    overflow-y: auto;
  }
}

.orders-table {
  width: 100%;
  table-layout: fixed;
  margin-bottom: 0;
}

.orders-table thead th {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
  box-shadow: 0 2px 2px -1px rgba(0, 0, 0, 0.1);
  font-size: 0.85em;
  padding: 8px 6px;
  white-space: nowrap;
  text-align: center;
  vertical-align: middle;
}

/* Column width fixes - remove sr no column */
.col-customer { width: 18%; min-width: 120px; }
.col-contact { width: 9%; min-width: 80px; }
.col-date { width: 13%; min-width: 100px; }
.col-delivery { width: 11%; min-width: 90px; }
.col-items { width: 22%; min-width: 150px; }
.col-paid { width: 9%; min-width: 70px; }
.col-balance { width: 9%; min-width: 70px; }
.col-total { width: 9%; min-width: 70px; }
.col-status { width: 9%; min-width: 70px; }
.col-actions { width: 13%; min-width: 100px; }

.orders-table th,
.orders-table td {
  text-align: center;
  vertical-align: middle;
  padding: 8px 6px;
  word-wrap: break-word;
  overflow-wrap: break-word;
  font-size: 0.9em;
  border-right: 1px solid #dee2e6;
}

.orders-table td {
  border-bottom: 1px solid #dee2e6;
}

/* Text alignment fixes */
.text-left {
  text-align: left !important;
}

.orders-table .col-customer,
.orders-table .col-items {
  text-align: left !important;
}

/* Mobile Card Styles */
@media (max-width: 768px) {
  .desktop-table {
    display: none;
  }
  
  .mobile-cards {
    display: block;
  }
}

@media (min-width: 769px) {
  .desktop-table {
    display: block;
  }
  
  .mobile-cards {
    display: none;
  }
}

/* Strobing animations */
@keyframes strobe-grey {
  0% { opacity: 1; }
  50% { opacity: 0.6; }
  100% { opacity: 1; }
}
.badge-strobe-grey {
  animation: strobe-grey 1.8s infinite;
}

@keyframes strobe-red {
  0% { opacity: 1; }
  50% { opacity: 0.4; }
  100% { opacity: 1; }
}
@keyframes strobe-orange {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}
.badge-strobe-danger {
  animation: strobe-red 1.5s infinite;
}
.badge-strobe-warning {
  animation: strobe-orange 2s infinite;
}

/* Search bar styles */
.search-container {
  position: relative;
}
.search-input {
  padding-left: 40px;
}
.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  pointer-events: none;
}
.clear-search {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 0;
  font-size: 16px;
}
.clear-search:hover {
  color: #dc3545;
}

/* Items styling */
.items-list {
  font-size: 0.8em;
  text-align: left;
}
.item-row {
  margin-bottom: 2px;
}
.item-name {
  font-weight: 500;
}
.item-qty {
  color: #6c757d;
  font-weight: normal;
}
.item-remark {
  margin-top: 1px;
  font-style: italic;
}

/* Contact and action buttons for desktop */
.contact-buttons {
  display: flex;
  gap: 4px;
  justify-content: center;
  align-items: center;
}
.action-buttons {
  display: flex;
  gap: 4px;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}

.loading-more {
  position: sticky;
  bottom: 0;
  background: #f8f9fa;
  border-top: 1px solid #dee2e6;
  padding: 10px;
  text-align: center;
  z-index: 5;
}

/* Mobile scrollable container */
.mobile-cards-container {
  height: 600px;
  overflow-y: auto;
  padding: 0 4px;
}

/* Responsive adjustments for very small screens */
@media (max-width: 576px) {
  .contact-btn {
    width: 28px;
    height: 28px;
  }
  
  .customer-name {
    font-size: 0.95em;
  }
  
  .date-badge {
    font-size: 0.75em;
    padding: 3px 6px;
  }
  
  .order-card .card-body {
    padding: 10px !important;
  }
  
  .action-buttons-mobile .badge {
    font-size: 0.8em;
    padding: 6px 12px;
    min-height: 32px;
  
  }
}

      `}),e.jsxs(X,{className:"mb-3",children:[e.jsx(V,{xs:12,md:6,lg:4,children:e.jsxs("div",{className:"search-container",children:[e.jsx(at,{type:"text",className:"search-input",placeholder:o(n==="bookings"?"LABELS.search_bookings":n==="quotation"?"LABELS.search_quotation":"LABELS.search_orders"),value:oe,onChange:Je}),e.jsx("div",{className:"search-icon",children:"🔍"}),oe&&e.jsx("button",{className:"clear-search",onClick:Ke,title:o("LABELS.clear_search"),children:"✕"})]})}),g&&e.jsx(V,{xs:12,className:"mt-2",children:e.jsx("small",{className:"text-muted",children:o("LABELS.results_found",{count:S.length,type:o(n==="bookings"?"LABELS.bookings":n==="quotation"?"LABELS.quotation":"LABELS.orders"),term:g})})})]}),e.jsx("div",{className:"mobile-cards",children:e.jsx(X,{children:e.jsxs(V,{xs:12,children:[e.jsxs("div",{className:"d-flex justify-content-between align-items-center mb-3",children:[e.jsx("strong",{children:n==="bookings"?e.jsxs("span",{children:[o("LABELS.advance_booking"),e.jsxs("span",{className:"ms-2",children:[e.jsx(m,{color:"secondary",className:"badge-strobe-grey me-1",style:{fontSize:"0.6em",cursor:"pointer",border:c==="missed"?"2px solid black":"none"},onClick:()=>j(c==="missed"?null:"missed"),children:o("BADGES.missed")}),e.jsx(m,{color:"danger",className:"badge-strobe-danger me-1",style:{fontSize:"0.6em",cursor:"pointer",border:c==="today"?"2px solid black":"none"},onClick:()=>j(c==="today"?null:"today"),children:o("BADGES.today")}),e.jsx(m,{color:"warning",className:"badge-strobe-warning me-1",style:{fontSize:"0.6em",cursor:"pointer",border:c==="within15"?"2px solid black":"none"},onClick:()=>j(c==="within15"?null:"within15"),children:o("BADGES.within_15_days")}),e.jsx(m,{color:"success",style:{fontSize:"0.6em",cursor:"pointer",border:c==="more15"?"2px solid black":"none"},onClick:()=>j(c==="more15"?null:"more15"),children:o("BADGES.more_than_15_days")})]})]}):o(n==="quotation"?"LABELS.all_quotation":"LABELS.all_orders")}),e.jsxs("small",{className:"text-muted",children:[o("LABELS.total")," ",S.length," ",o(n==="bookings"?"LABELS.bookings":n==="quotation"?"LABELS.quotation":"LABELS.orders")]})]}),e.jsxs("div",{className:"mobile-cards-container",ref:A,onScroll:ue,children:[S.length===0?e.jsx("div",{className:"text-center py-5 text-muted",children:g?o("LABELS.no_results_found",{type:o(n==="bookings"?"LABELS.bookings":n==="quotation"?"LABELS.quotation":"LABELS.orders")}):o("LABELS.no_data_available",{type:o(n==="bookings"?"LABELS.bookings":n==="quotation"?"LABELS.quotation":"LABELS.orders")})}):S.map((t,s)=>Xe(t)),v&&e.jsxs("div",{className:"text-center py-3",children:[e.jsx(G,{color:"primary",size:"sm"}),e.jsx("span",{className:"ms-2 text-muted",children:o("MSG.loading")||"Loading more..."})]})]})]})})}),e.jsx("div",{className:"desktop-table",children:e.jsx(X,{children:e.jsx(V,{xs:12,children:e.jsxs(ve,{className:"mb-4",children:[e.jsxs(nt,{className:"d-flex justify-content-between align-items-center",children:[e.jsx("strong",{children:n==="bookings"?e.jsxs("span",{children:[o("LABELS.advance_booking"),e.jsxs("span",{className:"ms-2",children:[e.jsx(m,{color:"secondary",className:"badge-strobe-grey me-1",style:{fontSize:"0.6em",cursor:"pointer",border:c==="missed"?"2px solid black":"none"},onClick:()=>j(c==="missed"?null:"missed"),children:o("BADGES.missed")}),e.jsx(m,{color:"danger",className:"badge-strobe-danger me-1",style:{fontSize:"0.6em",cursor:"pointer",border:c==="today"?"2px solid black":"none"},onClick:()=>j(c==="today"?null:"today"),children:o("BADGES.today")}),e.jsx(m,{color:"warning",className:"badge-strobe-warning me-1",style:{fontSize:"0.6em",cursor:"pointer",border:c==="within15"?"2px solid black":"none"},onClick:()=>j(c==="within15"?null:"within15"),children:o("BADGES.within_15_days")}),e.jsx(m,{color:"success",style:{fontSize:"0.6em",cursor:"pointer",border:c==="more15"?"2px solid black":"none"},onClick:()=>j(c==="more15"?null:"more15"),children:o("BADGES.more_than_15_days")})]})]}):n==="quotation"?o("LABELS.all_quotation")||"All quotation":o("LABELS.all_orders")}),e.jsxs("small",{className:"text-muted",children:[o("LABELS.total"),": ",S.length," ",n==="bookings"?"bookings":n==="quotation"?"quotation":"orders"]})]}),e.jsx(Ne,{className:"p-0",children:e.jsxs("div",{className:"table-container",ref:A,onScroll:ue,children:[e.jsxs(rt,{className:"orders-table",children:[e.jsx(it,{children:e.jsxs(Z,{children:[e.jsx(f,{scope:"col",className:"col-customer",children:"Customer"}),e.jsx(f,{scope:"col",className:"col-contact",children:"Contact"}),e.jsx(f,{scope:"col",className:"col-date",children:"Date & Time"}),n==="bookings"&&e.jsx(f,{scope:"col",className:"col-delivery",children:"Delivery Date"}),e.jsx(f,{scope:"col",className:"col-items",children:"Items"}),e.jsx(f,{scope:"col",className:"col-paid",children:"Paid"}),e.jsx(f,{scope:"col",className:"col-balance",children:"Balance"}),e.jsx(f,{scope:"col",className:"col-total",children:"Total"}),e.jsx(f,{scope:"col",className:"col-status",children:"Status"}),e.jsx(f,{scope:"col",className:"col-actions",children:"Actions"})]})}),e.jsx(lt,{children:S.length===0?e.jsx(Z,{children:e.jsx(h,{colSpan:n==="bookings"?10:9,className:"text-center py-4 text-muted",children:g?`No ${n==="bookings"?"bookings":n==="quotation"?"quotation":"orders"} found`:`No ${n==="bookings"?"bookings":n==="quotation"?"quotation":"orders"} available`})}):S.map((t,s)=>{var a,l,r,d,u;return e.jsxs(Z,{children:[e.jsx(h,{className:"col-customer text-left",children:e.jsxs("div",{style:{wordBreak:"break-word"},children:[e.jsx("div",{style:{fontWeight:"500"},children:((a=t.customer)==null?void 0:a.name)||"Unknown"}),((l=t.customer)==null?void 0:l.email)&&e.jsx("div",{className:"text-muted small",children:t.customer.email})]})}),e.jsx(h,{className:"col-contact",children:e.jsxs("div",{className:"contact-buttons",children:[e.jsx("a",{className:"btn btn-outline-info btn-sm",href:`tel:+91${(r=t.customer)==null?void 0:r.mobile}`,title:"Call",children:e.jsx(R,{icon:Se,size:"sm"})}),e.jsx("a",{className:"btn btn-outline-success btn-sm",href:`sms:+91${(d=t.customer)==null?void 0:d.mobile}?body=Hello ${(u=t.customer)==null?void 0:u.name}, your order is ready. Balance: ₹${(t.finalAmount-t.paidAmount).toFixed(2)}. From - ${de}`,title:"SMS",children:e.jsx(R,{icon:ke,size:"sm"})})]})}),e.jsx(h,{className:"col-date",children:e.jsxs("div",{style:{fontSize:"0.85em"},children:[e.jsx("div",{children:z(t.invoiceDate)}),e.jsx("div",{className:"text-muted",children:pe(t.deliveryTime)})]})}),n==="bookings"&&e.jsx(h,{className:"col-delivery",children:(()=>{const b=me(t.deliveryDate);return e.jsx(m,{color:b.color,className:b.className,children:z(t.deliveryDate)})})()}),e.jsx(h,{className:"col-items text-left",children:be(t.items)}),e.jsx(h,{className:"col-paid",children:e.jsxs("span",{className:"amount-paid",children:["₹",parseFloat(t.paidAmount).toFixed(2)]})}),e.jsx(h,{className:"col-balance",children:e.jsxs("span",{className:"amount-balance",children:["₹",(t.finalAmount-t.paidAmount).toFixed(2)]})}),e.jsx(h,{className:"col-total",children:e.jsxs("span",{className:"amount-total",children:["₹",parseFloat(t.finalAmount).toFixed(2)]})}),e.jsx(h,{className:"col-status",children:xe(t.orderStatus)}),e.jsx(h,{className:"col-actions",children:he(t)})]},t.id)})})]}),v&&e.jsxs("div",{className:"loading-more",children:[e.jsx(G,{color:"primary",size:"sm"}),e.jsx("span",{className:"ms-2 text-muted",children:o("MSG.loading")||"Loading more..."})]})]})})]})})})}),e.jsx(st,{visible:Te,setVisible:Q,onYes:Ye,resource:`Cancel Order - ${B==null?void 0:B.id}`}),De&&O&&e.jsx("div",{className:"modal d-block",tabIndex:"-1",role:"dialog",style:{backgroundColor:"rgba(0,0,0,0.5)"},children:e.jsx("div",{className:"modal-dialog",role:"document",children:e.jsxs("div",{className:"modal-content",children:[e.jsxs("div",{className:"modal-header",children:[e.jsx("h5",{className:"modal-title",children:o("modal.confirmDelivery")}),e.jsx("button",{type:"button",className:"btn-close",onClick:()=>q(!1)})]}),e.jsxs("div",{className:"modal-body",children:[e.jsxs("p",{children:[e.jsxs("strong",{children:[o("labels.finalAmount"),":"]})," ₹",qe]}),e.jsxs("div",{className:"mb-3",children:[e.jsx("label",{htmlFor:"paidAmount",className:"form-label",children:o("labels.advancedPayment")}),e.jsx("input",{id:"paidAmount",type:"number",className:"form-control",value:Me,readOnly:!0})]}),e.jsxs("div",{className:"mb-3",children:[e.jsx("label",{htmlFor:"balance",className:"form-label",children:o("labels.balanceAmount")}),e.jsx("input",{id:"balance",type:"number",className:"form-control",value:P,readOnly:!0})]}),e.jsxs("div",{className:"mb-3",children:[e.jsx("label",{htmlFor:"additionalPaid",className:"form-label",children:o("labels.amountToBePaid")}),e.jsx("input",{id:"additionalPaid",type:"number",className:`form-control ${I?"is-invalid":""}`,value:T,onWheel:t=>t.target.blur(),onChange:t=>ce(t.target.value),max:P,min:"0"}),I&&e.jsx("div",{className:"invalid-feedback",children:I})]})]}),e.jsxs("div",{className:"modal-footer",children:[e.jsx(Ce,{color:"success",disabled:U,onClick:()=>{let t=!1;for(const s of O.items){const a=Pe[s.product_sizes_id];if(a===void 0){x("danger",o("errors.stock_data_missing",{product:s.product_name})),t=!0;break}if(a<s.dQty){x("danger",o("errors.stock_not_enough",{product:s.product_name,available:a,required:s.dQty})),t=!0;break}}if(!t){if(parseFloat(T||"0")<0||I){x("danger",o("validation.invalid_payment"));return}We()}},children:U?e.jsxs(e.Fragment,{children:[e.jsx(G,{size:"sm",className:"me-2"}),o("buttons.delivering")||"Delivering..."]}):o("buttons.deliver")}),e.jsx(Ce,{color:"secondary",onClick:()=>q(!1),children:o("buttons.cancel")})]})]})})})]})};export{Bt as default};
