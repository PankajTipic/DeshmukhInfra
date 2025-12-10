import{b as O,r as m,j as e,u as Z}from"./index-D77JVx93.js";import{g as J,a as U,b as K,d as Q}from"./api-C2dAnRUz.js";import{C as X}from"./ConfirmationModal-DirynaBs.js";import{N as ee}from"./NewCustomerModal-B9709xYM.js";import{u as Y,a as te,b as se,c as ae,d as re,C as oe}from"./DefaultLayout-B9m2Op0L.js";import{C as ie}from"./CForm-CvVYu-wE.js";import{C as M}from"./CFormLabel-Dc8HuNh9.js";import{C as k}from"./CFormInput-l8xIFq1a.js";import{C as de}from"./CFormTextarea-BeYCqixl.js";import{C as W}from"./CButton-1GsZ7-l4.js";import{a as V,b as q}from"./index.esm-CnYARBHd.js";import{C as le,a as ne}from"./CCardBody-CmpV1lA4.js";import{C as ce}from"./CCardHeader-CTLciU6o.js";import{C as me,a as ue,b as H,c as D,d as he,e as A}from"./CTable-_iNV6x85.js";import"./RawMaterial-BtjEDAbB.js";import"./cil-mobile-CeKkmNgt.js";import"./CFormControlWrapper-Bm4xoNnJ.js";function pe({visible:b,setVisible:d,onSuccess:F,customer:n}){var $,I;const u=J(),{showToast:p}=O(),{t:a}=Y("global"),[s,w]=m.useState({id:null,name:"",mobile:"",discount:0,company_id:0,show:!0,address:"",start_date:"",end_date:""}),[h,y]=m.useState([]),[o,x]=m.useState({}),[L,N]=m.useState(!1);m.useEffect(()=>{b&&(U("/api/company").then(t=>{if(t){const i=t.map(l=>({label:l.company_name,value:l.company_id}));u.type===0?y(i):y(i.filter(l=>l.value===u.company_id))}}),n&&w({id:n.id,name:n.name||"",mobile:n.mobile||"",discount:n.discount||0,company_id:n.company_id||(u==null?void 0:u.company_id),show:n.show!==void 0?n.show:!0,address:n.address||"",start_date:n.start_date||"",end_date:n.end_date||""}),x({}))},[b,n,u.type,u.company_id]);const B=t=>!t||t.trim().length===0?a("MSG.project_name_is_required_msg")||"Project name is required":t.trim().length<2?a("MSG.project_name_min_length")||"Project name must be at least 2 characters long":t.trim().length>50?a("MSG.project_name_max_length")||"Project name must not exceed 50 characters":/^[a-zA-Z\u0900-\u097F\s.'-]+$/.test(t.trim())?null:a("MSG.project_name_invalid_chars")||"Project name can only contain English letters, Marathi characters, spaces, dots, apostrophes, and hyphens",G=t=>!t||t.trim().length===0?a("MSG.mobile_number_is_required_msg")||"Mobile number is required":/^\d{10}$/.test(t.trim())?/^(\d)\1{9}$/.test(t.trim())?a("MSG.mobile_all_same_digits")||"Mobile number cannot have all same digits":t.trim().startsWith("0")||t.trim().startsWith("1")||t.trim().startsWith("2")?a("MSG.mobile_invalid_start")||"Mobile number should start with digits 3-9":null:a("MSG.please_provide_mobile_number_msg")||"Please provide a valid 10-digit mobile number",g=t=>{if(t===""||t===null||t===void 0)return null;const i=parseFloat(t);return isNaN(i)?a("MSG.discount_not_number")||"Discount must be a valid number":i<0?a("MSG.discount_negative")||"Discount cannot be negative":i>100?a("MSG.discount_exceed")||"Discount cannot exceed 100%":null},_=t=>t&&t.length>500?a("MSG.address_max_length")||"Address must not exceed 500 characters":null,S=(t,i)=>{if(!t||t.trim().length===0)return null;const l=new Date(t);return isNaN(l.getTime())?a(`MSG.${i}_invalid`,`${i} is invalid`)||`${i} is invalid`:null},P=()=>{const t={},i=B(s.name);i&&(t.name=i);const l=G(s.mobile);l&&(t.mobile=l);const j=g(s.discount);j&&(t.discount=j);const c=_(s.address);c&&(t.address=c);const C=S(s.start_date,"start_date");C&&(t.start_date=C);const E=S(s.end_date,"end_date");return E&&(t.end_date=E),x(t),Object.keys(t).length===0},v=t=>{const{name:i,value:l}=t.target;if(w({...s,[i]:l}),o[i]){const j={...o};delete j[i],x(j),setTimeout(()=>{let c=null;switch(i){case"name":c=B(l);break;case"mobile":c=G(l);break;case"discount":c=g(l);break;case"address":c=_(l);break;case"start_date":c=S(l,"start_date");break;case"end_date":c=S(l,"end_date");break}c&&x(C=>({...C,[i]:c}))},500)}},z=async t=>{var l,j,c,C,E,R;if(t.preventDefault(),!P()){p("danger",a("MSG.check_fields_before_submit")||"Please fix the validation errors before submitting");return}N(!0);let i={name:(l=s.name)==null?void 0:l.trim(),mobile:(j=s.mobile)==null?void 0:j.trim(),discount:s.discount||0,company_id:s.company_id,show:s.show,address:(c=s.address)==null?void 0:c.trim(),start_date:s.start_date,end_date:s.end_date};try{const f=await K("/api/customer/"+i.id,i);f!=null&&f.id?(p("success",a("MSG.data_updated_successfully_msg")||"Project updated successfully"),F(f),d(!1),T()):p("danger",a("MSG.failed_to_update_project")||"Failed to update project")}catch(f){(E=(C=f.response)==null?void 0:C.data)!=null&&E.message?p("danger",f.response.data.message):(R=f.message)!=null&&R.includes("mobile")?(x({mobile:a("MSG.mobile_already_taken")||"This mobile number is already registered"}),p("danger",a("MSG.mobile_already_taken")||"Mobile number already exists")):p("danger",a("MSG.error_occurred")||"Error occurred: "+f.message)}finally{N(!1)}},T=()=>{w({id:null,name:"",mobile:"",discount:0,company_id:(u==null?void 0:u.company_id)||0,show:!0,address:"",start_date:"",end_date:""}),x({})},r=()=>{T(),d(!1)};return e.jsx(e.Fragment,{children:e.jsxs(te,{backdrop:"static",visible:b,onClose:r,"aria-labelledby":"EditCustomerModalLabel",size:"md",children:[e.jsx(se,{children:e.jsx(ae,{id:"EditCustomerModalLabel",children:a("LABELS.edit_project")||"Edit Project"})}),e.jsx(re,{children:e.jsxs(ie,{className:"needs-validation",noValidate:!0,onSubmit:z,children:[e.jsxs("div",{className:"mb-3",children:[e.jsxs(M,{htmlFor:"edit-pname",children:[a("LABELS.project_name")||"Project Name"," ",e.jsx("span",{className:"text-danger",children:"*"})]}),e.jsx(k,{type:"text",id:"edit-pname",placeholder:a("MSG.enter_project_name_msg")||"Enter project name",name:"name",value:s.name||"",onChange:v,invalid:!!o.name,valid:!o.name&&s.name&&s.name.trim().length>0,maxLength:50}),o.name&&e.jsx("div",{className:"invalid-feedback d-block",children:o.name})]}),e.jsxs("div",{className:"mb-3",children:[e.jsxs(M,{htmlFor:"edit-plmobile",children:[a("LABELS.mobile_number")||"Mobile Number"," ",e.jsx("span",{className:"text-danger",children:"*"})]}),e.jsx(k,{type:"tel",id:"edit-plmobile",placeholder:a("MSG.enter_mob_no_msg")||"Enter mobile number",name:"mobile",value:s.mobile||"",onChange:t=>{const i=t.target.value.replace(/\D/g,"").slice(0,10);v({target:{name:"mobile",value:i}})},invalid:!!o.mobile,valid:!o.mobile&&s.mobile&&/^\d{10}$/.test(s.mobile),maxLength:10,autoComplete:"off"}),o.mobile&&e.jsx("div",{className:"invalid-feedback d-block",children:o.mobile}),s.mobile&&s.mobile.length>0&&s.mobile.length<10&&!o.mobile&&e.jsxs("div",{className:"form-text",children:[10-s.mobile.length," more digits required"]})]}),e.jsxs("div",{className:"mb-3",children:[e.jsx(M,{htmlFor:"edit-address",children:a("LABELS.address")||"Address"}),e.jsx(de,{id:"edit-address",rows:3,name:"address",value:s.address||"",onChange:v,placeholder:a("MSG.enter_address")||"Enter project address (optional)",invalid:!!o.address,maxLength:500}),o.address&&e.jsx("div",{className:"invalid-feedback d-block",children:o.address}),s.address&&e.jsxs("div",{className:"form-text",children:[s.address.length,"/500 characters"]})]}),e.jsxs("div",{className:"mb-3",children:[e.jsx(M,{htmlFor:"edit-start_date",children:a("LABELS.start_date")||"Start Date"}),e.jsx(k,{type:"date",id:"edit-start_date",name:"start_date",value:s.start_date||"",onChange:v,invalid:!!o.start_date,valid:!o.start_date&&(($=s.start_date)==null?void 0:$.trim().length)>0}),o.start_date&&e.jsx("div",{className:"invalid-feedback d-block",children:o.start_date})]}),e.jsxs("div",{className:"mb-3",children:[e.jsx(M,{htmlFor:"edit-end_date",children:a("LABELS.end_date")||"End Date"}),e.jsx(k,{type:"date",id:"edit-end_date",name:"end_date",value:s.end_date||"",onChange:v,invalid:!!o.end_date,valid:!o.end_date&&((I=s.end_date)==null?void 0:I.trim().length)>0}),o.end_date&&e.jsx("div",{className:"invalid-feedback d-block",children:o.end_date})]}),e.jsxs("div",{className:"d-flex justify-content-end gap-2",children:[e.jsx(W,{color:"success",type:"submit",disabled:L||Object.keys(o).length>0,children:L?e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"spinner-border spinner-border-sm me-2",role:"status","aria-hidden":"true"}),a("LABELS.updating")||"Updating..."]}):a("LABELS.update")||"Update"}),e.jsx(W,{color:"secondary",onClick:r,disabled:L,children:a("LABELS.close")||"Close"})]})]})})]})})}const Be=()=>{Z();const{showToast:b}=O(),{t:d,i18n:F}=Y("global");F.language;const[n,u]=m.useState([]),[p,a]=m.useState(),[s,w]=m.useState(!1),[h,y]=m.useState(""),[o,x]=m.useState(!1),[L,N]=m.useState(!1),[B,G]=m.useState(null),g=async()=>{try{const r=await U("/api/customer");u(r)}catch{b("danger",d("MSG.error_occurred")||"An error occurred")}};m.useEffect(()=>{g()},[]);const _=m.useMemo(()=>h.trim()?n.filter(r=>r.name.toLowerCase().includes(h.toLowerCase())||r.mobile&&r.mobile.toString().includes(h)||r.email&&r.email.toLowerCase().includes(h.toLowerCase())||r.address&&r.address.toLowerCase().includes(h.toLowerCase())):n,[n,h]),S=async()=>{try{await Q(`/api/customer/${p.id}`),w(!1),g(),b("success",d("MSG.project_deleted_successfully")||"Project deleted successfully")}catch{b("danger",d("MSG.error_occurred")||"An error occurred")}},P=r=>{G(r),N(!0)},v=()=>{x(!0)},z=r=>{g(),b("success",d("LABELS.project_created")||"Project created successfully")},T=r=>{g(),b("success",d("LABELS.project_updated")||"Project updated successfully")};return e.jsxs(e.Fragment,{children:[e.jsx("style",{jsx:!0,global:!0,children:`
        /* Responsive table styles with frozen headers */
        .customers-table {
          width: 100%;
          table-layout: fixed;
        }

        /* Freeze table headers */
        .customers-table thead th {
          position: sticky;
          top: 0;
          z-index: 10;
          background-color: #f8f9fa;
          border-bottom: 2px solid #dee2e6;
          box-shadow: 0 2px 2px -1px rgba(0, 0, 0, 0.1);
        }

        /* Column width distribution */
        .customers-table .name-col {
          width: 30%;
          text-align: center;
          vertical-align: middle;
          padding: 8px 4px;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }

        .customers-table .mobile-col {
          width: 25%;
          text-align: center;
          vertical-align: middle;
          padding: 8px 4px;
        }

        .customers-table .address-col {
          width: 30%;
          text-align: center;
          vertical-align: middle;
          padding: 8px 4px;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }

        .customers-table .actions-col {
          width: 15%;
          text-align: center;
          vertical-align: middle;
          padding: 8px 4px;
        }

        .custom-placeholder::placeholder {
          font-size: 11px !important;
        }

        /* Ensure table container allows for sticky positioning */
        .table-responsive {
          max-height: 65vh;
          overflow-y: auto;
          border: 1px solid #dee2e6;
          border-radius: 0.375rem;
        }

        /* Header row layout */
        .header-row {
          justify-content: space-between;
          align-items: center;
        }

        /* Mobile responsive styles */
        @media (max-width: 768px) {
          .table-responsive {
            max-height: 65vh;
          }

          .customers-table .name-col,
          .customers-table .mobile-col,
          .customers-table .address-col,
          .customers-table .actions-col {
            padding: 6px 2px;
            font-size: 12px;
          }

          .customers-table .name-col {
            width: 30%;
          }

          .customers-table .mobile-col {
            width: 25%;
          }

          .customers-table .address-col {
            width: 30%;
          }

          .customers-table .actions-col {
            width: 15%;
          }

          .customers-table thead th {
            background-color: #f8f9fa;
            font-size: 12px;
          }

          .action-buttons {
            flex-direction: column;
            gap: 2px !important;
          }

          .action-buttons .badge {
            font-size: 10px;
            padding: 2px 6px;
          }

          /* Stack header elements on mobile */
          .header-row {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px;
          }

          .header-buttons {
            width: 100%;
          }

          .search-container {
            width: 100%;
          }
        }

        @media (max-width: 576px) {
          .table-responsive {
            max-height: 68vh;
          }

          .customers-table {
            font-size: 11px;
          }

          .customers-table .name-col,
          .customers-table .mobile-col,
          .customers-table .address-col,
          .customers-table .actions-col {
            padding: 4px 1px;
          }

          .customers-table thead th {
            font-size: 11px;
          }

          .customers-table .name-col {
            width: 30%;
          }

          .customers-table .mobile-col {
            width: 25%;
          }

          .customers-table .address-col {
            width: 30%;
          }

          .customers-table .actions-col {
            width: 15%;
          }

          /* Tighter spacing for customer info */
          .customers-table td div {
            line-height: 1.2 !important;
          }

          .customers-table td div div {
            margin-top: 1px !important;
          }
        }

        /* Search input styling */
        .search-container {
          position: relative;
          max-width: 300px;
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

        /* Contact info styling */
        .contact-info {
          font-size: 0.85em;
          color: #6c757d;
          margin-top: 2px;
        }

        /* Address text with ellipsis for long content */
        .address-text {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      `}),e.jsx(V,{className:"mb-3",children:e.jsx(q,{xs:12,children:e.jsxs("div",{className:"d-flex header-row",children:[e.jsx("div",{className:"header-buttons",children:e.jsx(W,{color:"primary",onClick:v,children:d("LABELS.add_new_project")||"Add New Project"})}),e.jsxs("div",{className:"search-container",children:[e.jsx(k,{type:"text",className:"search-input",placeholder:d("LABELS.search_projects")||"Search projects...",value:h,onChange:r=>y(r.target.value)}),e.jsx("div",{className:"search-icon",children:"🔍"}),h&&e.jsx("button",{className:"clear-search",onClick:()=>y(""),title:d("LABELS.clear_search")||"Clear search",children:"✕"})]})]})})}),h&&e.jsx(V,{className:"mb-3",children:e.jsx(q,{xs:12,children:e.jsxs("small",{className:"text-muted",children:[_.length," ",d("LABELS.projects_found")||"projects found for",' "',h,'"']})})}),e.jsxs(V,{children:[e.jsx(X,{visible:s,setVisible:w,onYes:S,resource:`${d("LABELS.delete_project")||"Delete project"} - ${p==null?void 0:p.name}`}),e.jsx(ee,{visible:o,setVisible:x,onSuccess:z,hint:""}),e.jsx(pe,{visible:L,setVisible:N,onSuccess:T,customer:B}),e.jsx(q,{xs:12,children:e.jsxs(le,{className:"mb-4",children:[e.jsxs(ce,{className:"d-flex justify-content-between align-items-center",children:[e.jsx("strong",{children:d("LABELS.all_projects")||"All Projects"}),e.jsxs("small",{className:"text-muted",children:[d("LABELS.total")||"Total",": ",_.length," ",d("LABELS.projects")||"projects"]})]}),e.jsx(ne,{className:"p-0",children:e.jsx("div",{className:"table-responsive",children:e.jsxs(me,{className:"customers-table mb-0",children:[e.jsx(ue,{children:e.jsxs(H,{children:[e.jsx(D,{scope:"col",className:"name-col",children:d("LABELS.name")||"Name"}),e.jsx(D,{scope:"col",className:"mobile-col",children:d("LABELS.mobile")||"Mobile"}),e.jsx(D,{scope:"col",className:"address-col",children:d("LABELS.address")||"Address"}),e.jsx(D,{scope:"col",className:"actions-col",children:d("LABELS.actions")||"Actions"})]})}),e.jsx(he,{children:_.length===0?e.jsx(H,{children:e.jsx(A,{colSpan:4,className:"text-center py-4 text-muted",children:h?d("LABELS.no_projects_found")||"No projects found":d("LABELS.no_projects_available")||"No projects available"})}):_.map((r,$)=>e.jsxs(H,{children:[e.jsx(A,{className:"name-col",children:e.jsxs("div",{style:{wordBreak:"break-word"},children:[e.jsx("div",{style:{fontWeight:"500"},children:r.name}),r.email&&e.jsx("div",{className:"contact-info",children:r.email})]})}),e.jsx(A,{className:"mobile-col",children:e.jsx("div",{style:{fontWeight:"500"},children:r.mobile||"-"})}),e.jsx(A,{className:"address-col",children:e.jsx("div",{className:"address-text",title:r.address,children:r.address||"-"})}),e.jsx(A,{className:"actions-col",children:e.jsx("div",{className:"action-buttons d-flex justify-content-center gap-1",children:e.jsx(oe,{role:"button",color:"info",onClick:()=>P(r),style:{cursor:"pointer",fontSize:"0.75em"},children:d("LABELS.edit")||"Edit"})})})]},r.id))})]})})})]})})]})]})};export{Be as default};
