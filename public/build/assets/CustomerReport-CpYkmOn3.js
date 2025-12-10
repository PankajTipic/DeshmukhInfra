import{u as Oe,b as qe,r as i,j as e,C as W}from"./index-D77JVx93.js";import{a as $,b as y}from"./index.esm-CnYARBHd.js";import{e as Qe,a as me,d as Je}from"./api-C2dAnRUz.js";import{E as Xe}from"./EditExpense-BfYHlNev.js";import{C as Ze}from"./ConfirmationModal-DirynaBs.js";import{utils as H,writeFile as Ke}from"./xlsx-B6sNpj_1.js";import{E as et}from"./jspdf.es.min-P9DMHkwx.js";import"./jspdf.plugin.autotable-DMTpKMcF.js";import{u as tt,a as st,b as nt,c as rt,d as it,e as lt,C as M}from"./DefaultLayout-B9m2Op0L.js";import{C as j}from"./CButton-1GsZ7-l4.js";import{C as ue,a as fe}from"./CCardBody-CmpV1lA4.js";import{C as at}from"./CCardHeader-CTLciU6o.js";import{C as ot}from"./CFormLabel-Dc8HuNh9.js";import{C as ge}from"./CFormInput-l8xIFq1a.js";import{C as ct}from"./CFormSelect-BEYL04sy.js";import{C as dt,a as pt,b as V,c as h,d as xt,e as p}from"./CTable-_iNV6x85.js";import"./Feilds-BHjWXeSc.js";import"./CForm-CvVYu-wE.js";import"./typeof-QjJsDpFa.js";import"./jspdf.es.min-CzbIXxHz.js";import"./RawMaterial-BtjEDAbB.js";import"./cil-mobile-CeKkmNgt.js";import"./CFormControlWrapper-Bm4xoNnJ.js";const Pt=()=>{const U=Oe(),{showToast:g}=qe(),{t:a}=tt("global"),be=Qe(),[ye,Y]=i.useState(!1),[je,we]=i.useState(null),[P,Ce]=i.useState([]),[d,O]=i.useState(""),[q,Q]=i.useState(""),[E,_e]=i.useState(),[ve,D]=i.useState(!1),[J,Se]=i.useState(0),[X,Z]=i.useState(null),[K,Ne]=i.useState(!1),[v,ee]=i.useState(!1),[L,te]=i.useState(!1),[ke,Ee]=i.useState(!1),[o,Le]=i.useState({key:null,direction:"asc"}),[se,ne]=i.useState([]),[S,re]=i.useState({name:"",id:null}),[z,ze]=i.useState(""),[Te,B]=i.useState(!1),[ie,Ae]=i.useState(""),m=t=>{let s="asc";o.key===t&&o.direction==="asc"&&(s="desc"),Le({key:t,direction:s})},u=t=>o.key===t?o.direction==="asc"?"↑":"↓":"↕",f=t=>({marginLeft:"8px",fontSize:"14px",opacity:o.key===t?1:.5,color:o.key===t?"#0d6efd":"#6c757d",transition:"all 0.2s ease"}),T=i.useRef(null),w=i.useRef(null),N=i.useRef(null),A=i.useRef(0),C=i.useRef(!1),k=i.useRef(null);i.useEffect(()=>{const t=()=>{Ee(window.innerWidth<=768)};return t(),window.addEventListener("resize",t),()=>window.removeEventListener("resize",t)},[]);const R=t=>{we(t),Y(!0)},Ie=t=>{I(!0)},Fe=i.useCallback(t=>{w.current&&clearTimeout(w.current),w.current=setTimeout(()=>{O(t)},300)},[]),Me=i.useCallback(t=>{k.current&&clearTimeout(k.current),k.current=setTimeout(()=>{le(t)},300)},[]),le=async(t="")=>{try{const s=`/api/projects?searchQuery=${encodeURIComponent(t)}`,r=await me(s);ne(r||[])}catch(s){g("danger","Error fetching customers: "+s)}},Pe=t=>{const s=t.target.value;re({name:s,id:null}),Me(s)},De=t=>{re({name:t.project_name,id:t.id}),ne([])},x=i.useMemo(()=>{let t=P.map((s,r)=>({...s,sr_no:r+1}));if(d.trim()){const s=d.toLowerCase();t=t.filter(r=>{var n,l,c,_,ce,de,pe,xe,he;return((l=(n=r.expense_type)==null?void 0:n.name)==null?void 0:l.toLowerCase().includes(s))||((c=r.expense_date)==null?void 0:c.toLowerCase().includes(s))||((_=r.total_price)==null?void 0:_.toString().includes(d))||((ce=r.contact)==null?void 0:ce.toLowerCase().includes(s))||((de=r.desc)==null?void 0:de.toLowerCase().includes(s))||((pe=r.payment_by)==null?void 0:pe.toLowerCase().includes(s))||((xe=r.payment_type)==null?void 0:xe.toLowerCase().includes(s))||((he=r.pending_amount)==null?void 0:he.toString().includes(d))})}return z==="gst"?t=t.filter(s=>s.isGst===1||s.isGst===!0):z==="non-gst"&&(t=t.filter(s=>s.isGst===0||s.isGst===!1)),o.key?[...t].sort((s,r)=>{var c,_;let n=s[o.key],l=r[o.key];return o.key==="expense_type"&&(n=((c=s.expense_type)==null?void 0:c.name)||"",l=((_=r.expense_type)==null?void 0:_.name)||""),typeof n=="string"&&(n=n.toLowerCase()),typeof l=="string"&&(l=l.toLowerCase()),n<l?o.direction==="asc"?-1:1:n>l?o.direction==="asc"?1:-1:0}):t},[P,d,o,z]),Be=i.useCallback(()=>{N.current&&clearTimeout(N.current),N.current=setTimeout(()=>{const t=T.current;if(!t)return;const{scrollTop:s,scrollHeight:r,clientHeight:n}=t,l=100;A.current=s,s+n>=r-l&&K&&!L&&!v&&(C.current=!0,I(!1))},100)},[K,L,v]),I=async(t=!0)=>{if(!S.id){g("warning",a("MSG.please_select_customer")||"Please select a customer");return}t?(ee(!0),C.current=!1):te(!0);try{const s=`/api/expense?customerId=${S.id}`+(X&&!t?`&cursor=${X}`:""),r=await me(s);if(r.error)g("danger",r.error);else{const n=t?r.data:[...P,...r.data],l=A.current;Ce(n),Se(r.totalExpense||0),Z(r.next_cursor||null),Ne(r.has_more_pages),C.current&&!t&&requestAnimationFrame(()=>{requestAnimationFrame(()=>{T.current&&(T.current.scrollTop=l),C.current=!1})})}}catch(s){g("danger","Error occurred: "+s)}finally{ee(!1),te(!1)}},Re=async()=>{try{await Je("/api/expense/"+E.id),D(!1),C.current=!1,A.current=0,I(!0),g("success",a("MSG.expense_deleted_successfully")||"Expense deleted successfully")}catch(t){g("danger","Error occurred: "+t)}},Ge=t=>{const s=parseFloat(t)||0,[r,n="00"]=s.toFixed(2).split("."),l=r.slice(-3),c=r.slice(0,-3);return`${c.length>0?c.replace(/\B(?=(\d{2})+(?!\d))/g,",")+","+l:l}.${n}`},b=t=>`INR ${Ge(t)}`,F=t=>{const s={day:"numeric",month:"short",year:"numeric"},n=new Date(t).toLocaleDateString("en-US",s).replace(",",""),[l,c]=n.split(" ");return`${c} ${l}`},We=()=>{C.current=!1,A.current=0,Z(null),I(!0)},$e=t=>{const s=t.target.value;Q(s),Fe(s)},G=()=>{Q(""),O(""),w.current&&clearTimeout(w.current)},ae=t=>{_e(t),D(!0)},oe=t=>{Ae(t.photo_url||""),B(!0)},He=()=>{const t=x.map((n,l)=>{var c;return{"Sr No":n.sr_no,Date:F(n.expense_date),"Expense Details":((c=n.expense_type)==null?void 0:c.name)||"-",Amount:n.total_price,Contact:n.contact||"-",Notes:n.desc||"-","Payment By":n.payment_by||"-","Payment Type":n.payment_type||"-","Pending Amount":n.pending_amount||0}}),s=H.json_to_sheet(t),r=H.book_new();H.book_append_sheet(r,s,"Expenses"),Ke(r,`Project_Expense_Report_${new Date().toISOString().split("T")[0]}.xlsx`),g("success","Excel file downloaded successfully!")},Ve=()=>{const t=new et({orientation:"landscape",unit:"pt",format:"a4"}),s=["Sr No","Date","Expense Details","Amount","Contact","Notes","Payment By","Payment Type","Pending Amount"],r=x.map(n=>{var l;return[n.sr_no,F(n.expense_date),((l=n.expense_type)==null?void 0:l.name)||"-",b(n.total_price),n.contact||"-",n.desc||"-",n.payment_by||"-",n.payment_type||"-",n.pending_amount?b(n.pending_amount):"-"]});t.setFontSize(14),t.text("Project Expense Report",40,40),t.autoTable({head:[s],body:r,startY:60,theme:"striped",styles:{fontSize:8,cellPadding:3,overflow:"linebreak",valign:"middle"},headStyles:{fillColor:[22,160,133],textColor:255,halign:"center"},columnStyles:{0:{cellWidth:40},1:{cellWidth:70},2:{cellWidth:100},3:{cellWidth:70},4:{cellWidth:80},5:{cellWidth:100},6:{cellWidth:70},7:{cellWidth:70},8:{cellWidth:80}},didDrawPage:()=>{const n=t.internal.pageSize.getHeight();t.setFontSize(12),t.text(`Total Amount: ${b(J)}`,40,n-20)}}),t.save(`Project_Expense_Report_${new Date().toISOString().split("T")[0]}.pdf`),g("success","PDF file downloaded successfully!")};if(i.useEffect(()=>{le()},[]),i.useEffect(()=>()=>{w.current&&clearTimeout(w.current),N.current&&clearTimeout(N.current),k.current&&clearTimeout(k.current)},[]),v)return e.jsx("div",{className:"d-flex justify-content-center align-items-center",style:{minHeight:"400px"},children:e.jsxs("div",{className:"text-center",children:[e.jsx(W,{color:"primary",size:"lg"}),e.jsx("p",{className:"mt-3 text-muted",children:"Loading expenses..."})]})});const Ue=t=>{var s;return e.jsxs(e.Fragment,{children:[e.jsx("style",{children:Ye}),e.jsx(ue,{className:"mb-3 expense-card",children:e.jsxs(fe,{children:[e.jsxs("div",{className:"card-row-1",children:[e.jsxs("div",{className:"expense-name-section",children:[e.jsx("div",{className:"expense-name",children:((s=t.expense_type)==null?void 0:s.name)||"N/A"}),e.jsx("div",{className:"expense-type",children:e.jsx("span",{className:"category-text",children:t.sr_no})})]}),e.jsxs("div",{className:"expense-total",children:[e.jsx("div",{className:"total-amount",children:b(t.total_price)}),e.jsx("div",{className:"total-label",children:"Amount"})]})]}),e.jsxs("div",{className:"card-row-2",children:[e.jsxs("div",{className:"expense-date",children:["📅 ",F(t.expense_date)]}),e.jsxs("div",{className:"expense-details",children:[e.jsx("span",{className:"detail-item",children:t.contact||"-"}),e.jsx("span",{className:"detail-item",children:t.payment_by||"-"})]})]}),e.jsx("div",{className:"card-row-2",children:e.jsxs("div",{className:"expense-details",children:[e.jsx("span",{className:"detail-item",children:t.payment_type||"-"}),e.jsx("span",{className:"detail-item",children:t.pending_amount?b(t.pending_amount):"-"})]})}),e.jsx("div",{className:"card-row-3",children:e.jsx("div",{className:"expense-details",children:e.jsx("span",{className:"detail-item",children:t.desc||"-"})})}),e.jsx("div",{className:"card-row-3",children:e.jsxs("div",{className:"action-buttons-mobile",children:[e.jsx("button",{className:"badge bg-primary",onClick:()=>R(t),role:"button",children:a("LABELS.edit")||"Edit"}),e.jsx("button",{className:"badge bg-danger",onClick:()=>ae(t),role:"button",children:a("LABELS.delete")||"Delete"}),t.photo_url&&t.photo_url!==null&&e.jsx("button",{className:"badge bg-secondary",onClick:()=>oe(t),role:"button",children:"View"})]})})]})},t.id)]})},Ye=`
    .expense-card {
      border: 1px solid #dee2e6;
      border-radius: 8px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
      overflow: hidden;
      margin-bottom: 12px;
    }

    .expense-card:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }

    .expense-card .card-body {
      padding: 12px !important;
    }

    .expense-card .card-row-1 {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
    }

    .expense-name-section {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .expense-name {
      font-weight: 600;
      font-size: 1em;
      color: #333;
      line-height: 1.1;
    }

    .expense-type {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .category-text {
      color: #666;
      font-size: 0.8em;
    }

    .expense-total {
      text-align: right;
    }

    .total-amount {
      font-weight: 600;
      font-size: 1.1em;
      color: #d32f2f;
      line-height: 1.1;
    }

    .total-label {
      font-size: 0.7em;
      color: #666;
    }

    .expense-card .card-row-2 {
      margin-bottom: 8px;
      padding: 4px 0;
      border-top: 1px solid #f0f0f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .expense-date {
      color: #666;
      font-size: 0.85em;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .expense-details {
      display: flex;
      gap: 24px;
    }

    .detail-item {
      color: #333;
      font-size: 0.85em;
      font-weight: 500;
    }

    .expense-card .card-row-3 {
      padding: 6px 0;
      border-top: 1px solid #f0f0f0;
    }

    .expense-card .action-buttons-mobile {
      display: flex;
      gap: 8px;
      justify-content: flex-start;
      width: 100%;
    }

    .expense-card .action-buttons-mobile .badge {
      font-size: 0.85em;
      padding: 8px 8px;
      border-radius: 16px;
      cursor: pointer;
      transition: all 0.2s ease;
      border: 1px solid transparent;
      text-align: center;
      min-height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 500;
      width: 100%;
    }

    .expense-card .action-buttons-mobile .badge:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .expense-card .action-buttons-mobile .badge.bg-danger {
      background-color: #dc3545 !important;
      border-color: #dc3545;
      color: white !important;
    }

    .suggestions-list {
      position: absolute;
      z-index: 1000;
      background: white;
      border: 1px solid #ccc;
      list-style: none;
      padding: 0;
      max-height: 200px;
      overflow-y: auto;
      width: 100%;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .suggestions-list li {
      padding: 8px;
      cursor: pointer;
      border-bottom: 1px solid #eee;
    }

    .suggestions-list li:hover {
      background: #f5f5f5;
    }

    @media (max-width: 576px) {
      .expense-name {
        font-size: 0.95em;
      }

      .expense-card .card-body {
        padding: 10px !important;
      }

      .expense-card .action-buttons-mobile .badge {
        font-size: 0.8em;
        padding: 6px 12px;
        min-height: 32px;
      }
    }
  `;return e.jsxs(e.Fragment,{children:[e.jsx("style",{jsx:!0,global:!0,children:`
        .table-container {
          height: 350px;
          overflow-y: auto;
          border: 1px solid #dee2e6;
          border-radius: 0.375rem;
          position: relative;
        }

        @media (max-width: 768px) {
          .table-container {
            height: 400px;
            overflow-x: auto;
            overflow-y: auto;
          }
        }

        .expenses-table {
          width: 100%;
          table-layout: fixed;
          margin-bottom: 0;
        }

        .expenses-table thead th {
          position: sticky;
          top: 0;
          z-index: 10;
          background-color: #f8f9fa;
          border-bottom: 2px solid #dee2e6;
          box-shadow: 0 2px 2px -1px rgba(0, 0, 0, 0.1);
        }

        .expenses-table th,
        .expenses-table td {
          text-align: center;
          vertical-align: middle;
          padding: 8px 4px;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }

        .expenses-table th:nth-child(1) { width: 8%; }
        .expenses-table th:nth-child(2) { width: 12%; }
        .expenses-table th:nth-child(3) { width: 15%; text-align: left; }
        .expenses-table th:nth-child(4) { width: 12%; }
        .expenses-table th:nth-child(5) { width: 12%; }
        .expenses-table th:nth-child(6) { width: 15%; text-align: left; }
        .expenses-table th:nth-child(7) { width: 12%; }
        .expenses-table th:nth-child(8) { width: 12%; }
        .expenses-table th:nth-child(9) { width: 12%; }
        .expenses-table th:nth-child(10) { width: 12%; }

        .expenses-table td:nth-child(1) { width: 8%; }
        .expenses-table td:nth-child(2) { width: 12%; }
        .expenses-table td:nth-child(3) { width: 15%; text-align: left; }
        .expenses-table td:nth-child(4) { width: 12%; }
        .expenses-table td:nth-child(5) { width: 12%; }
        .expenses-table td:nth-child(6) { width: 15%; text-align: left; }
        .expenses-table td:nth-child(7) { width: 12%; }
        .expenses-table td:nth-child(8) { width: 12%; }
        .expenses-table td:nth-child(9) { width: 12%; }
        .expenses-table td:nth-child(10) { width: 12%; }

        .search-container {
          position: relative;
          width: 100%;
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

        .filter-button-mobile {
          margin-top: 0;
        }

        @media (max-width: 768px) {
          .filter-button-mobile {
            margin-top: 5px;
          }
        }

        .action-buttons {
          display: flex;
          gap: 4px;
          justify-content: center;
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

        .total-expense-card {
          background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
          border: none;
          border-radius: 12px;
          box-shadow: 0 4px 8px rgba(220, 53, 69, 0.2);
        }

        .total-expense-icon {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: bold;
          color: white;
        }

        .filter-section {
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          padding: 5px;
          margin-bottom: 5px;
        }

        @media (max-width: 768px) {
          .expenses-table {
            min-width: 950px;
            table-layout: fixed;
          }

          .expenses-table th,
          .expenses-table td {
            white-space: nowrap;
            padding: 8px 6px;
            border-right: 1px solid #dee2e6;
            font-size: 13px;
          }

          .expenses-table th:nth-child(1),
          .expenses-table td:nth-child(1) {
            width: 80px;
            min-width: 80px;
          }

          .expenses-table th:nth-child(2),
          .expenses-table td:nth-child(2) {
            width: 120px;
            min-width: 120px;
          }

          .expenses-table th:nth-child(3),
          .expenses-table td:nth-child(3) {
            width: 160px;
            min-width: 160px;
          }

          .expenses-table th:nth-child(4),
          .expenses-table td:nth-child(4) {
            width: 120px;
            min-width: 120px;
          }

          .expenses-table th:nth-child(5),
          .expenses-table td:nth-child(5) {
            width: 120px;
            min-width: 120px;
          }

          .expenses-table th:nth-child(6),
          .expenses-table td:nth-child(6) {
            width: 160px;
            min-width: 160px;
          }

          .expenses-table th:nth-child(7),
          .expenses-table td:nth-child(7) {
            width: 120px;
            min-width: 120px;
          }

          .expenses-table th:nth-child(8),
          .expenses-table td:nth-child(8) {
            width: 120px;
            min-width: 120px;
          }

          .expenses-table th:nth-child(9),
          .expenses-table td:nth-child(9) {
            width: 120px;
            min-width: 120px;
          }

          .action-buttons {
            flex-direction: row;
            gap: 2px;
          }

          .action-buttons .badge {
            font-size: 10px;
            padding: 2px 6px;
          }

          .filter-section {
            padding: 15px;
          }

          .total-expense-card {
            margin-top: 0.3rem;
          }
        }

        @media (max-width: 576px) {
          .expenses-table {
            font-size: 12px;
            min-width: 900px;
          }

          .expenses-table th,
          .expenses-table td {
            padding: 6px 4px;
          }

          .action-buttons .badge {
            font-size: 9px;
            padding: 2px 4px;
          }

          .filter-section {
            padding: 5px;
          }

          .expenses-table {
            display: none !important;
          }
        }
      `}),e.jsx(Xe,{visible:ye,onClose:()=>Y(!1),expense:je,onExpenseUpdated:Ie}),e.jsxs(st,{visible:Te,onClose:()=>B(!1),children:[e.jsx(nt,{children:e.jsx(rt,{children:"View File"})}),e.jsx(it,{children:ie?(()=>{const t=ie.split("/").pop(),s=`/bill/bill/${t}`,r=t.split(".").pop().toLowerCase();return r==="pdf"?e.jsx("iframe",{src:s,title:"PDF Preview",style:{width:"100%",height:"70vh",border:"none"}}):["jpg","jpeg","png"].includes(r)?e.jsx("img",{src:s,alt:"Expense",style:{maxWidth:"100%",maxHeight:"70vh",display:"block",margin:"auto"},onError:n=>{n.target.onerror=null,n.target.replaceWith(Object.assign(document.createElement("div"),{innerHTML:"<p style='color:red;text-align:center;'>Image not available</p>"}))}}):e.jsx("p",{style:{color:"red",textAlign:"center"},children:"Unsupported file type"})})():e.jsx("p",{style:{color:"red",textAlign:"center"},children:"File not available"})}),e.jsx(lt,{children:e.jsx(j,{color:"secondary",onClick:()=>B(!1),children:a("LABELS.close")||"Close"})})]}),e.jsxs($,{children:[e.jsx(Ze,{visible:ve,setVisible:D,onYes:Re,resource:`Delete expense - ${E==null?void 0:E.name}`}),e.jsx(y,{xs:12,children:e.jsxs(ue,{children:[e.jsxs(at,{children:[e.jsx("strong",{children:a("LABELS.project_expenses")||"Projects Expenses"}),e.jsxs("span",{className:"ms-2 text-muted",children:[a("LABELS.total")," ",x.length," expenses"]})]}),e.jsxs(fe,{children:[e.jsx("div",{className:"filter-section",children:e.jsxs($,{className:"g-1 align-items-end",children:[e.jsxs(y,{xs:12,md:6,children:[e.jsx(ot,{htmlFor:"customer_id",className:"mb-1 small fw-medium",children:a("LABELS.search_projects")||"Select Customer"}),e.jsxs("div",{className:"search-container",style:{position:"relative"},children:[e.jsx(ge,{type:"text",id:"customer_id",className:"search-input",placeholder:a("LABELS.enter_project_name")||"Enter customer name",value:S.name,onChange:Pe,autoComplete:"off",size:"sm"}),e.jsx("div",{className:"search-icon"}),se.length>0&&e.jsx("ul",{className:"suggestions-list",children:se.map(t=>e.jsx("li",{onClick:()=>De(t),onMouseEnter:s=>s.target.style.background="#f5f5f5",onMouseLeave:s=>s.target.style.background="white",children:t.project_name},t.id))})]})]}),e.jsx(y,{xs:12,md:3,children:e.jsx(j,{color:"primary",onClick:We,disabled:v,size:"sm",className:"w-100 filter-button-mobile",children:v?a("LABELS.loading")||"Loading...":a("LABELS.filter")||"Filter"})}),e.jsx(y,{xs:12,md:3,children:e.jsx("div",{className:"total-expense-card text-white p-2 w-100",children:e.jsxs("div",{className:"d-flex align-items-center justify-content-start",children:[e.jsx("div",{className:"total-expense-icon me-2",children:"₹"}),e.jsxs("div",{children:[e.jsx("div",{className:"small opacity-75",children:a("LABELS.total_expenses")||"Total Expenses"}),e.jsx("div",{className:"h4 mb-0 fw-bold",children:b(J)})]})]})})})]})}),e.jsxs($,{className:"mb-3",children:[e.jsx(y,{xs:12,md:6,lg:4,children:e.jsxs("div",{className:"search-container",children:[e.jsx(ge,{type:"text",className:"search-input",placeholder:"Search expenses...",value:q,onChange:$e}),e.jsx("div",{className:"search-icon",children:"🔍"}),q&&e.jsx("button",{className:"clear-search",onClick:G,title:"Clear search",children:"✕"})]})}),e.jsx(y,{xs:12,md:6,lg:3,children:e.jsxs(ct,{value:z,onChange:t=>ze(t.target.value),children:[e.jsx("option",{value:"",children:"Default"}),e.jsx("option",{value:"gst",children:"GST"}),e.jsx("option",{value:"non-gst",children:"Non-GST"})]})}),e.jsx(y,{xs:12,md:6,lg:3,children:e.jsxs("div",{className:"d-flex gap-2 ",children:[e.jsx(j,{color:"primary",onClick:He,disabled:!x.length,size:"sm",className:"w-100 mb-1 p-2",children:"Download Excel"}),e.jsx(j,{color:"warning",onClick:Ve,disabled:!x.length,size:"sm",className:"w-100 mb-1",children:"Download PDF"})]})}),d&&e.jsx(y,{xs:12,className:"mt-2",children:e.jsxs("small",{className:"text-muted",children:[x.length,' expenses found for "',d,'"']})})]}),ke?e.jsxs("div",{className:"mobile-cards-container",children:[x.length===0?e.jsx("div",{className:"text-center text-muted py-4",children:d?e.jsxs(e.Fragment,{children:[e.jsxs("p",{children:['No expenses found for "',d,'"']}),e.jsx(j,{color:"primary",onClick:G,size:"sm",children:"Clear Search"})]}):S.id?e.jsxs(e.Fragment,{children:[e.jsx("p",{children:a("MSG.no_expenses_found_for_project")||"No expenses found for the selected Product."}),e.jsx(j,{color:"primary",onClick:()=>U("/expense/new"),size:"sm",children:a("LABELS.add_expense")||"Add Expense"})]}):e.jsx("p",{children:a("MSG.select_project_to_view_expenses")||"Select a project to view expenses."})}):x.map(Ue),L&&e.jsxs("div",{className:"loading-more",children:[e.jsx(W,{color:"primary",size:"sm"}),e.jsx("span",{className:"ms-2 text-muted",children:a("MSG.loading")||"Loading more expenses..."})]})]}):e.jsxs("div",{className:"table-container",ref:T,onScroll:Be,children:[e.jsxs(dt,{className:"expenses-table",children:[e.jsx(pt,{children:e.jsxs(V,{children:[e.jsx(h,{onClick:()=>m("sr_no"),style:{cursor:"pointer"},children:e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"center"},children:["Sr No ",e.jsx("span",{style:f("sr_no"),children:u("sr_no")})]})}),e.jsx(h,{onClick:()=>m("expense_date"),style:{cursor:"pointer"},children:e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"center"},children:["Date ",e.jsx("span",{style:f("expense_date"),children:u("expense_date")})]})}),e.jsx(h,{onClick:()=>m("expense_type"),style:{cursor:"pointer"},children:e.jsxs("div",{style:{display:"flex",alignItems:"center"},children:["Expense Details ",e.jsx("span",{style:f("expense_type"),children:u("expense_type")})]})}),e.jsx(h,{onClick:()=>m("total_price"),style:{cursor:"pointer"},children:e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"center"},children:["Amount ",e.jsx("span",{style:f("total_price"),children:u("total_price")})]})}),e.jsx(h,{onClick:()=>m("contact"),style:{cursor:"pointer"},children:e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"center"},children:["About ",e.jsx("span",{style:f("contact"),children:u("contact")})]})}),e.jsx(h,{onClick:()=>m("contact"),style:{cursor:"pointer"},children:e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"center"},children:["Contact ",e.jsx("span",{style:f("contact"),children:u("contact")})]})}),e.jsx(h,{onClick:()=>m("payment_by"),style:{cursor:"pointer"},children:e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"center"},children:["Payment By ",e.jsx("span",{style:f("payment_by"),children:u("payment_by")})]})}),e.jsx(h,{onClick:()=>m("payment_type"),style:{cursor:"pointer"},children:e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"center"},children:["Payment Type ",e.jsx("span",{style:f("payment_type"),children:u("payment_type")})]})}),e.jsx(h,{onClick:()=>m("pending_amount"),style:{cursor:"pointer"},children:e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"center"},children:["Pending Amount ",e.jsx("span",{style:f("pending_amount"),children:u("pending_amount")})]})}),e.jsx(h,{scope:"col",children:"Actions"})]})}),e.jsx(xt,{children:x.length===0?e.jsx(V,{children:e.jsx(p,{colSpan:10,className:"text-center py-4",children:d?e.jsxs("div",{className:"text-muted",children:[e.jsxs("p",{children:['No expenses found for "',d,'"']}),e.jsx(j,{color:"primary",onClick:G,size:"sm",children:"Clear Search"})]}):S.id?e.jsxs("div",{className:"text-muted",children:[e.jsx("p",{children:a("MSG.no_expenses_found_for_project")||"No expenses found for the selected Product."}),e.jsx(j,{color:"primary",onClick:()=>U("/expense/new"),size:"sm",children:a("LABELS.add_expense")||"Add Expense"})]}):e.jsx("p",{className:"text-muted",children:a("MSG.select_project_to_view_expenses")||"Select a project to view expenses."})})}):x.map(t=>{var s;return e.jsxs(V,{children:[e.jsx(p,{children:e.jsx("div",{style:{fontSize:"0.85em"},children:t.sr_no})}),e.jsx(p,{children:e.jsx("div",{style:{fontSize:"0.85em"},children:F(t.expense_date)})}),e.jsx(p,{style:{textAlign:"left"},children:e.jsx("div",{style:{wordBreak:"break-word"},children:((s=t.expense_type)==null?void 0:s.name)||"-"})}),e.jsx(p,{children:e.jsx("span",{style:{fontWeight:"500",color:"#dc3545"},children:b(t.total_price)})}),e.jsx(p,{children:e.jsx("div",{style:{wordBreak:"break-word"},children:t.name||"-"})}),e.jsx(p,{children:e.jsx("div",{style:{wordBreak:"break-word"},children:t.contact||"-"})}),e.jsx(p,{style:{textAlign:"center"},children:e.jsx("div",{style:{wordBreak:"break-word"},children:t.payment_by||"-"})}),e.jsx(p,{children:e.jsx("div",{style:{wordBreak:"break-word"},children:t.payment_type||"-"})}),e.jsx(p,{children:e.jsx("span",{style:{fontWeight:"500"},children:t.pending_amount?b(t.pending_amount):"-"})}),e.jsx(p,{children:e.jsxs("div",{className:"action-buttons",children:[be===1?e.jsxs(e.Fragment,{children:[e.jsx(M,{role:"button",color:"primary",onClick:()=>R(t),style:{cursor:"pointer",fontSize:"0.75em"},children:"Edit"}),e.jsx(M,{role:"button",color:"danger",onClick:()=>ae(t),style:{cursor:"pointer",fontSize:"0.75em"},children:"Delete"})]}):e.jsx(M,{role:"button",color:"primary",onClick:()=>R(t),style:{cursor:"pointer",fontSize:"0.75em"},children:"Edit"}),(t==null?void 0:t.photo_url)&&(t==null?void 0:t.photo_url)!=="NA"&&e.jsx(M,{role:"button",color:"secondary",onClick:()=>oe(t),style:{cursor:"pointer",fontSize:"0.75em"},children:"View"})]})})]},t.id)})})]}),L&&e.jsxs("div",{className:"loading-more",children:[e.jsx(W,{color:"primary",size:"sm"}),e.jsx("span",{className:"ms-2 text-muted",children:a("MSG.loading")||"Loading more expenses..."})]})]})]})]})})]})]})};export{Pt as default};
