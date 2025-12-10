import{u as ee,r as o,b as se,j as e}from"./index-C2h9iXsq.js";import{a as ae,d as te,p as ne,b as le}from"./api-C2dAnRUz.js";import{C as ie}from"./ConfirmationModal-C-jW-mSH.js";import{u as oe,a as M,b as D,c as F,d as I,e as P,C as E}from"./DefaultLayout-Bb3k2Kjc.js";import{a as L,b as _}from"./index.esm-DQbyd5df.js";import{C as b}from"./CButton--W_4ZeJh.js";import{C as p}from"./CFormInput-Da28fgYD.js";import{C as V}from"./CForm-BVvPNiqY.js";import{C as d}from"./CFormLabel-DkkhltaS.js";import{C as G}from"./CFormSelect-ukCskt8P.js";import{C as H}from"./CFormCheck-1aTfEnVQ.js";import{C as ce,a as re}from"./CCardBody-DHWC5_BS.js";import{C as de}from"./CCardHeader-BOYr8GAh.js";import{C as pe,a as xe,b as S,c as m,d as me,e as x}from"./CTable-B2fFA3gN.js";import"./RawMaterial-BtjEDAbB.js";import"./cil-mobile-CRjBRZgk.js";import"./CFormControlWrapper-CgtL4Ts4.js";const Be=()=>{ee();const[v,q]=o.useState([]),[u,O]=o.useState(),[R,N]=o.useState(!1),{showToast:r}=se(),{t:a,i18n:Y}=oe("global");Y.language;const[i,C]=o.useState(""),[$,y]=o.useState(!1),[K,g]=o.useState(!1),[k,w]=o.useState(!1),[t,h]=o.useState({name:"",localName:"",expense_category:"",desc:"",show:1}),[U,W]=o.useState(null),f=async()=>{try{const s=await ae("/api/expenseType");q(s)}catch(s){r("danger","Error occurred "+s)}};o.useEffect(()=>{f()},[]);const j=o.useMemo(()=>i.trim()?v.filter(s=>s.name.toLowerCase().includes(i.toLowerCase())||s.localName&&s.localName.toLowerCase().includes(i.toLowerCase())||s.expense_category&&s.expense_category.toLowerCase().includes(i.toLowerCase())||s.desc&&s.desc.toLowerCase().includes(i.toLowerCase())):v,[v,i]),A=s=>{O(s),N(!0)},Z=async()=>{try{await te("/api/expenseType/"+u.id),N(!1),f(),r("success",a("MSG.expense_type_deleted_successfully")||"Expense type deleted successfully")}catch(s){r("danger","Error occurred "+s)}},T=s=>{W(s.id),h({name:s.name||"",localName:s.localName||"",expense_category:s.expense_category||"",desc:s.desc||"",show:s.show}),w(!1),g(!0)},J=()=>{h({name:"",localName:"",expense_category:"",desc:"",show:1}),w(!1),y(!0)},c=s=>{const{name:n,value:l,type:Q,checked:X}=s.target;Q==="checkbox"?h({...t,[n]:X?1:0}):n==="name"?/^[a-zA-Z0-9 ]*$/.test(l)&&h({...t,[n]:l}):h({...t,[n]:l})},B=async s=>{if(s&&(s.preventDefault(),s.stopPropagation()),w(!0),!!t.name)try{const n={name:t.name,localName:t.localName||"",expense_category:t.expense_category||"",desc:t.desc||"",show:t.show===1?1:0,slug:t.name.replace(/[^\w]/g,"_")};await ne("/api/expenseType",n)?(r("success",a("MSG.expense_type_added_successfully_msg")||"Expense type added successfully"),y(!1),f()):r("danger",a("MSG.failed_to_add_expense_type_msg")||"Error occurred. Please try again later.")}catch(n){r("danger","Error occurred: "+n)}},z=async s=>{if(s&&(s.preventDefault(),s.stopPropagation()),w(!0),!!t.name)try{const n={name:t.name,localName:t.localName||"",expense_category:t.expense_category||"",desc:t.desc||"",show:t.show===1?1:0};await le(`/api/expenseType/${U}`,n)?(r("success",a("MSG.expense_type_updated_successfully_msg")||"Expense type updated successfully"),g(!1),f()):r("danger",a("MSG.failed_to_update_expense_type_msg")||"Error occurred. Please try again later.")}catch(n){r("danger","Error occurred: "+n)}};return e.jsxs(e.Fragment,{children:[e.jsx("style",{jsx:!0,global:!0,children:`
        .table-responsive-custom {
  overflow-x: auto;
  overflow-y: auto;
  max-height: 70vh;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  background: white;
  position: relative;
}

/* Custom scrollbar */
.table-responsive-custom::-webkit-scrollbar {
  height: 8px;
  width: 8px;
}

.table-responsive-custom::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.table-responsive-custom::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.table-responsive-custom::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Main table */
.expense-types-table {
  min-width: 800px;
  width: 100%;
  table-layout: fixed;
  margin-bottom: 0;
}

/* Sticky header */
.expense-types-table thead th {
  position: sticky;
  top: 0;
  z-index: 20;
  background-color: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  white-space: nowrap;
  font-weight: 600;
  padding: 12px 8px;
  vertical-align: middle;
}

/* Column widths */
.expense-types-table .sr-no-col {
  width: 80px;
  min-width: 60px;
  text-align: center;
}

.expense-types-table .name-col,
.expense-types-table .local-name-col {
  width: 150px;
  min-width: 120px;
  text-align: left;
}

.expense-types-table .category-col {
  width: 160px;
  min-width: 140px;
  text-align: left;
}

.expense-types-table .desc-col {
  width: 200px;
  min-width: 150px;
  text-align: left;
}

.expense-types-table .status-col {
  width: 100px;
  min-width: 80px;
  text-align: center;
}

.expense-types-table .actions-col {
  width: 120px;
  min-width: 100px;
  text-align: center;
}

/* Table cells */
.expense-types-table td {
  padding: 12px 8px;
  vertical-align: middle;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

/* Text truncation */
.text-truncate-custom {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

/* Header layout */
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.header-buttons {
  flex-shrink: 0;
  margin-right: auto; /* Pushes it to the left */
}

/* Search container */
.search-container {
  position: relative;
  max-width: 350px;
  min-width: 250px;
}

.search-input {
  padding-left: 40px;
  padding-right: 35px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  pointer-events: none;
  font-size: 14px;
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
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clear-search:hover {
  color: #dc3545;
}

/* Action buttons */
.action-buttons {
  display: flex;
  justify-content: center;
  gap: 4px;
  flex-wrap: wrap;
}

.action-buttons .badge {
  font-size: 0.7em;
  padding: 4px 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  min-width: 35px;
  text-align: center;
  border-radius: 4px;
}

.action-buttons .badge:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* Status badges */
.badge-visible {
  background-color: #28a745 !important;
  color: white !important;
}

.badge-hidden {
  background-color: #dc3545 !important;
  color: white !important;
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #6c757d;
}

.empty-state-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

/* Loading states */
.table-loading {
  opacity: 0.7;
  pointer-events: none;
}

.fade-in {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Responsive breakpoints */

/* Large tablets (992px - 1199px) */
@media (max-width: 1199px) and (min-width: 992px) {
  .expense-types-table {
    min-width: 750px;
  }
  
  .search-container {
    max-width: 300px;
    min-width: 200px;
  }
}

/* Tablets (768px - 991px) */
@media (max-width: 991px) and (min-width: 768px) {
  .table-responsive-custom {
    max-height: 65vh;
  }

  .expense-types-table {
    min-width: 700px;
    font-size: 0.95em;
  }

  .expense-types-table thead th,
  .expense-types-table td {
    padding: 12px 8px;
    font-size: 0.95em;
  }

  .header-row {
    justify-content: center;
    text-align: center;
  }

  .search-container {
    max-width: 100%;
    min-width: 250px;
  }

  .action-buttons .badge {
    font-size: 0.75em;
    padding: 6px 10px;
    min-width: 40px;
  }
}

/* Small tablets (576px - 767px) */
@media (max-width: 767px) and (min-width: 576px) {
  .table-responsive-custom {
    max-height: 60vh;
  }

  .expense-types-table {
    min-width: 650px;
    font-size: 0.9em;
  }

  .expense-types-table thead th {
    font-size: 0.9em;
    font-weight: 700;
    padding: 10px 6px;
  }

  .expense-types-table td {
    padding: 10px 6px;
    font-size: 0.9em;
  }

  .expense-types-table .sr-no-col {
    width: 60px;
    min-width: 50px;
  }

  .expense-types-table .name-col,
  .expense-types-table .local-name-col {
    width: 120px;
    min-width: 100px;
  }

  .expense-types-table .category-col {
    width: 130px;
    min-width: 110px;
  }

  .expense-types-table .desc-col {
    width: 140px;
    min-width: 120px;
  }

  .expense-types-table .status-col {
    width: 80px;
    min-width: 70px;
  }

  .expense-types-table .actions-col {
    width: 100px;
    min-width: 90px;
  }

  .header-row {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }

  .search-container {
    max-width: 100%;
    min-width: auto;
  }

  .action-buttons .badge {
    font-size: 0.8em;
    padding: 6px 10px;
    min-width: 40px;
  }
}

/* Mobile phones (up to 575px) */
@media (max-width: 575px) {
  .table-responsive-custom {
    max-height: 55vh;
  }

  .expense-types-table {
    min-width: 600px;
    font-size: 0.85em;
  }

  .expense-types-table thead th {
    font-size: 0.85em;
    padding: 8px 4px;
    font-weight: 700;
  }

  .expense-types-table td {
    padding: 8px 4px;
    font-size: 0.85em;
  }

  .expense-types-table .sr-no-col {
    width: 50px;
    min-width: 45px;
  }

  .expense-types-table .name-col,
  .expense-types-table .local-name-col {
    width: 110px;
    min-width: 90px;
  }

  .expense-types-table .category-col {
    width: 120px;
    min-width: 100px;
  }

  .expense-types-table .desc-col {
    width: 130px;
    min-width: 110px;
  }

  .expense-types-table .status-col {
    width: 70px;
    min-width: 60px;
  }

  .expense-types-table .actions-col {
    width: 90px;
    min-width: 80px;
  }

  .header-row {
    flex-direction: column;
    gap: 12px;
  }

  .search-container {
    width: 100%;
    max-width: 100%;
    min-width: 100%;
  }

  .search-input {
    width: 100%;
  }

  .action-buttons .badge {
    font-size: 0.7em;
    padding: 4px 6px;
    min-width: 30px;
  }

  .badge-visible,
  .badge-hidden {
    font-size: 0.7em;
    padding: 4px 6px;
  }
}

/* Extra small devices (up to 400px) */
@media (max-width: 400px) {
  .expense-types-table {
    min-width: 550px;
    font-size: 0.8em;
  }

  .expense-types-table thead th {
    font-size: 0.8em;
    padding: 6px 3px;
  }

  .expense-types-table td {
    padding: 6px 3px;
    font-size: 0.8em;
  }

  .expense-types-table .sr-no-col,
  .expense-types-table .status-col {
    width: 45px;
    min-width: 40px;
  }

  .expense-types-table .name-col,
  .expense-types-table .local-name-col {
    width: 100px;
    min-width: 80px;
  }

  .expense-types-table .category-col {
    width: 110px;
    min-width: 90px;
  }

  .expense-types-table .desc-col {
    width: 120px;
    min-width: 100px;
  }

  .expense-types-table .actions-col {
    width: 80px;
    min-width: 70px;
  }

  .action-buttons .badge {
    font-size: 0.65em;
    padding: 3px 5px;
    min-width: 25px;
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .action-buttons .badge {
    transition: none;
  }
  
  .action-buttons .badge:hover {
    transform: none;
  }
  
  .fade-in {
    animation: none;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .expense-types-table thead th {
    border-bottom: 3px solid #000;
  }
  
  .table-responsive-custom {
    border: 2px solid #000;
  }
}

/* Touch improvements */
@media (max-width: 767px) {
  .action-buttons .badge {
    touch-action: manipulation;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
  }
  
  .action-buttons .badge:active {
    transform: scale(0.95);
  }
}
      `}),e.jsx(L,{className:"mb-3",children:e.jsx(_,{xs:12,children:e.jsxs("div",{className:"header-row",children:[e.jsx("div",{className:"header-buttons",children:e.jsx(b,{color:"success",onClick:J,children:a("LABELS.new_expense_type")||"New Expense Type"})}),e.jsxs("div",{className:"search-container",children:[e.jsx(p,{type:"text",className:"search-input",placeholder:a("LABELS.search_expense_types")||"Search expense types...",value:i,onChange:s=>C(s.target.value)}),e.jsx("div",{className:"search-icon",children:"🔍"}),i&&e.jsx("button",{className:"clear-search",onClick:()=>C(""),title:a("LABELS.clear_search")||"Clear search","aria-label":"Clear search",children:"✕"})]})]})})}),i&&e.jsx(L,{className:"mb-3",children:e.jsx(_,{xs:12,children:e.jsxs("small",{className:"text-muted",children:[j.length," ","expense types found for",' "',i,'"']})})}),e.jsxs(L,{children:[e.jsx(ie,{visible:R,setVisible:N,onYes:Z,resource:"Delete expense type - "+(u==null?void 0:u.name)}),e.jsxs(M,{visible:$,onClose:()=>y(!1),size:"lg",children:[e.jsx(D,{children:e.jsx(F,{children:a("LABELS.new_expense_type")||"New Expense Type"})}),e.jsx(I,{children:e.jsxs(V,{noValidate:!0,validated:k,onSubmit:B,children:[e.jsxs("div",{className:"row",children:[e.jsx("div",{className:"col-sm-6",children:e.jsxs("div",{className:"mb-3",children:[e.jsx(d,{htmlFor:"name",children:e.jsxs("b",{children:[a("LABELS.name")||"Name"," *"]})}),e.jsx(p,{type:"text",id:"name",placeholder:"",name:"name",value:t.name,onChange:c,required:!0,feedbackInvalid:a("MSG.please_provide_name_msg")||"Please provide a name. Only alphabets, numbers and spaces are allowed."})]})}),e.jsx("div",{className:"col-sm-6",children:e.jsxs("div",{className:"mb-3",children:[e.jsx(d,{htmlFor:"localName",children:e.jsxs("b",{children:[a("LABELS.local_name")||"Local Name"," *"]})}),e.jsx(p,{type:"text",id:"localName",placeholder:"",name:"localName",value:t.localName,onChange:c,required:!0,feedbackInvalid:a("MSG.please_provide_local_name_msg")||"Please provide a local name."})]})})]}),e.jsxs("div",{className:"mb-3",children:[e.jsx(d,{htmlFor:"expense_category",children:e.jsxs("b",{children:[a("LABELS.expense_category")," *"]})}),e.jsxs(G,{id:"expense_category",name:"expense_category",value:t.expense_category,onChange:c,required:!0,feedbackInvalid:"Please select an expense category.",children:[e.jsx("option",{value:"",children:"-- Select Category --"}),e.jsx("option",{value:"Operational Expense",children:"Operational Expense"}),e.jsx("option",{value:"Capital Expense",children:"Capital Expense"})]})]}),e.jsx("div",{className:"row",children:e.jsx("div",{className:"col-sm-12",children:e.jsxs("div",{className:"mb-3",children:[e.jsx(d,{htmlFor:"desc",children:e.jsxs("b",{children:[a("LABELS.short_desc")||"Short Description"," *"]})}),e.jsx(p,{type:"text",id:"desc",placeholder:"",name:"desc",value:t.desc,onChange:c,required:!0,feedbackInvalid:a("MSG.please_provide_description_msg")||"Please provide a short description."})]})})}),e.jsx("div",{className:"row",children:e.jsx("div",{className:"col-sm-6",children:e.jsx("div",{className:"mb-3",children:e.jsx(H,{id:"show",label:a("LABELS.visible")||"Visible",name:"show",checked:t.show===1,onChange:c})})})})]})}),e.jsxs(P,{children:[e.jsx(b,{color:"secondary",onClick:()=>y(!1),children:a("LABELS.cancel")||"Cancel"}),e.jsx(b,{color:"primary",onClick:B,children:a("LABELS.submit")||"Submit"})]})]}),e.jsxs(M,{visible:K,onClose:()=>g(!1),size:"lg",children:[e.jsx(D,{children:e.jsx(F,{children:a("LABELS.edit_expense_type")||"Edit Expense Type"})}),e.jsx(I,{children:e.jsxs(V,{noValidate:!0,validated:k,onSubmit:z,children:[e.jsxs("div",{className:"row",children:[e.jsx("div",{className:"col-sm-6",children:e.jsxs("div",{className:"mb-3",children:[e.jsx(d,{htmlFor:"edit-name",children:e.jsx("b",{children:a("LABELS.name")||"Name"})}),e.jsx(p,{type:"text",id:"edit-name",placeholder:"",name:"name",value:t.name,onChange:c,required:!0,feedbackInvalid:a("MSG.please_provide_name_msg")||"Please provide a name. Only alphabets, numbers and spaces are allowed."})]})}),e.jsx("div",{className:"col-sm-6",children:e.jsxs("div",{className:"mb-3",children:[e.jsx(d,{htmlFor:"edit-localName",children:e.jsx("b",{children:a("LABELS.local_name")||"Local Name"})}),e.jsx(p,{type:"text",id:"edit-localName",placeholder:"",name:"localName",value:t.localName,onChange:c})]})})]}),e.jsxs("div",{className:"mb-3",children:[e.jsx(d,{htmlFor:"expense_category",children:e.jsx("b",{children:a("LABELS.expense_category")})}),e.jsxs(G,{id:"expense_category",name:"expense_category",value:t.expense_category,onChange:c,required:!0,feedbackInvalid:"Please select an expense category.",children:[e.jsx("option",{value:"",children:"-- Select Category --"}),e.jsx("option",{value:"Operational Expense",children:"Operational Expense"}),e.jsx("option",{value:"Capital Expense",children:"Capital Expense"})]})]}),e.jsx("div",{className:"row",children:e.jsx("div",{className:"col-sm-12",children:e.jsxs("div",{className:"mb-3",children:[e.jsx(d,{htmlFor:"edit-desc",children:e.jsx("b",{children:a("LABELS.short_desc")||"Short Description"})}),e.jsx(p,{type:"text",id:"edit-desc",placeholder:"",name:"desc",value:t.desc,onChange:c})]})})}),e.jsx("div",{className:"row",children:e.jsx("div",{className:"col-sm-6",children:e.jsx("div",{className:"mb-3",children:e.jsx(H,{id:"edit-show",label:a("LABELS.visible")||"Visible",name:"show",checked:t.show===1,onChange:c})})})})]})}),e.jsxs(P,{children:[e.jsx(b,{color:"secondary",onClick:()=>g(!1),children:a("LABELS.cancel")||"Cancel"}),e.jsx(b,{color:"primary",onClick:z,children:a("LABELS.update")||"Update"})]})]}),e.jsx(_,{xs:12,children:e.jsxs(ce,{className:"mb-4",children:[e.jsxs(de,{className:"d-flex justify-content-between align-items-center flex-wrap",children:[e.jsx("strong",{children:a("LABELS.all_expense_types")||"All Expense Types"}),e.jsxs("small",{className:"text-muted",children:[a("LABELS.total")||"Total",": ",j.length," ",a("LABELS.expense_types")||"expense types"]})]}),e.jsx(re,{className:"p-0",children:e.jsx("div",{className:"table-responsive-custom",children:e.jsxs(pe,{className:"expense-types-table mb-0 fade-in",children:[e.jsx(xe,{children:e.jsxs(S,{children:[e.jsx(m,{scope:"col",className:"name-col",children:a("LABELS.name")||"Name"}),e.jsx(m,{scope:"col",className:"local-name-col",children:a("LABELS.local_name")||"Local Name"}),e.jsx(m,{scope:"col",className:"category-col",children:a("LABELS.expense_category")||"Category"}),e.jsx(m,{scope:"col",className:"desc-col",children:a("LABELS.short_desc")||"Description"}),e.jsx(m,{scope:"col",className:"status-col",children:a("LABELS.status")||"Status"}),e.jsx(m,{scope:"col",className:"actions-col",children:a("LABELS.actions")||"Actions"})]})}),e.jsx(me,{children:j.length===0?e.jsx(S,{children:e.jsxs(x,{colSpan:7,className:"empty-state",children:[e.jsx("div",{className:"empty-state-icon",children:"📋"}),e.jsx("div",{children:i?"No expense types found matching your search":"No expense types available. Create your first expense type!"}),i&&e.jsxs("small",{className:"mt-2 d-block",children:["Try adjusting your search terms or"," ",e.jsx("button",{className:"btn btn-link p-0 text-decoration-underline",onClick:()=>C(""),children:"clear the search"})]})]})}):j.map((s,n)=>e.jsxs(S,{children:[e.jsx(x,{className:"name-col",children:e.jsx("div",{style:{fontWeight:"500"},title:s.name,children:e.jsx("div",{className:"text-truncate-custom",children:s.name})})}),e.jsx(x,{className:"local-name-col",children:e.jsx("div",{title:s.localName||"No local name",children:e.jsx("div",{className:"text-truncate-custom",children:s.localName||"-"})})}),e.jsx(x,{className:"category-col",children:e.jsx("div",{title:s.expense_category||"No category",children:e.jsx("div",{className:"text-truncate-custom",children:s.expense_category||"-"})})}),e.jsx(x,{className:"desc-col",children:e.jsx("div",{title:s.desc||"No description",children:e.jsx("div",{className:"text-truncate-custom",children:s.desc||"-"})})}),e.jsx(x,{className:"status-col",children:e.jsx(E,{color:s.show===1?"success":"danger",className:s.show===1?"badge-visible":"badge-hidden",children:s.show===1?a("LABELS.visible")||"Visible":a("LABELS.hidden")||"Hidden"})}),e.jsx(x,{className:"actions-col",children:e.jsxs("div",{className:"action-buttons",children:[e.jsx(E,{role:"button",color:"info",onClick:()=>T(s),style:{cursor:"pointer"},title:`Edit ${s.name}`,tabIndex:0,onKeyDown:l=>{(l.key==="Enter"||l.key===" ")&&(l.preventDefault(),T(s))},children:a("LABELS.edit")||"Edit"}),e.jsx(E,{role:"button",color:"danger",onClick:()=>A(s),style:{cursor:"pointer"},title:`Delete ${s.name}`,tabIndex:0,onKeyDown:l=>{(l.key==="Enter"||l.key===" ")&&(l.preventDefault(),A(s))},children:a("LABELS.delete")||"Delete"})]})})]},s.id))})]})})})]})})]})]})};export{Be as default};
