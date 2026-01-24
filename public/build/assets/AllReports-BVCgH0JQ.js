import{r as c,j as e,C as $e,b as Qe}from"./index-CGnoF1dV.js";import{C as Ye,a as Ge,b as he,c as ue,d as Te,M as Pe,Q as Be,W as Ie,Y as Me,e as Ke,f as Ue}from"./Dates-BtNbVyK2.js";import{a as se}from"./api-CIBCEetx.js";import{u as be,i as qe}from"./DefaultLayout-DHlug5s4.js";import{a as He,b as We}from"./index.esm-D8P94hpm.js";import{C as Je,a as Ve}from"./CCardBody-Bt_5D1od.js";import{C as Xe,a as Ze,b as Ee,d as Oe,c as L,e as w}from"./CTable-CjqO0VO9.js";import{C as b}from"./CFormSelect-u2gLT3fX.js";import{C as F}from"./CButton-CQ0wb11W.js";import{M as et}from"./MantineProvider-Bioh8cVB.js";import"./CFormLabel-DYxra1Db.js";import"./CFormInput-BHTC9PBz.js";import"./CFormControlWrapper-CkM5c0Ff.js";import"./RawMaterial-BtjEDAbB.js";import"./cil-mobile-onxU4-nl.js";import"./emotion-react.browser.esm-DagbXIXy.js";function je({selectedOption:N,salesData:r,expenseData:l,pnlData:_,expenseType:C,productWiseData:M,onLoadMore:E,hasMorePages:re,isFetchingMore:le,scrollCursor:Ne}){const{t:o}=be("global"),[u,Z]=c.useState(""),[ne,O]=c.useState(""),[g,H]=c.useState(!1),fe=c.useRef(null),S=c.useRef(null),ee=c.useRef(null),[n,we]=c.useState({key:null,direction:"asc"});c.useEffect(()=>{const s=()=>{H(window.innerWidth<=768)};return s(),window.addEventListener("resize",s),()=>window.removeEventListener("resize",s)},[]);const z=s=>{if(!s)return"-";try{const a=new Date(s);if(isNaN(a.getTime()))return console.warn("Invalid date format:",s),s;const i=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],v=a.getDate().toString().padStart(2,"0"),j=i[a.getMonth()],A=a.getFullYear();return g?`${v}/${a.getMonth()+1}/${A.toString().slice(-2)}`:`${v} ${j} ${A}`}catch(a){return console.warn("Date formatting error:",a,"for date:",s),s}},W=s=>{if(!s&&s!==0)return"₹0";const a=Number(s);if(g&&a>=1e3){if(a>=1e7)return`₹${(a/1e7).toFixed(1)}Cr`;if(a>=1e5)return`₹${(a/1e5).toFixed(1)}L`;if(a>=1e3)return`₹${(a/1e3).toFixed(1)}K`}return`₹${a.toLocaleString()}`},J=s=>{const a=Number(s);if(g&&a>=1e3){if(a>=1e6)return`${(a/1e6).toFixed(1)}M`;if(a>=1e3)return`${(a/1e3).toFixed(1)}K`}return a.toLocaleString()},y=s=>{let a="asc";n.key===s&&n.direction==="asc"&&(a="desc"),we({key:s,direction:a})},oe=c.useCallback(s=>{S.current&&clearTimeout(S.current),S.current=setTimeout(()=>{Z(s)},300)},[]),X=c.useCallback(()=>{ee.current&&clearTimeout(ee.current),ee.current=setTimeout(()=>{const s=fe.current;if(!s)return;const{scrollTop:a,scrollHeight:i,clientHeight:v}=s;a+v>=i-100&&re&&!le&&E&&E()},100)},[re,le,E]);c.useEffect(()=>()=>{S.current&&clearTimeout(S.current),ee.current&&clearTimeout(ee.current)},[]);const P=s=>{if(!s)return new Date(0);const a=new Date(s);return isNaN(a.getTime())?new Date(0):a},V=()=>{let s=[];switch(N){case"1":return s=(r==null?void 0:r.data)||[],console.log("Income Report Data:",s),[...s].sort((a,i)=>P(i.date)-P(a.date));case"2":return s=(l==null?void 0:l.data)||[],[...s].sort((a,i)=>P(i.expenseDate)-P(a.expenseDate));case"3":return s=(_==null?void 0:_.Data)||[],[...s].sort((a,i)=>P(i.date)-P(a.date));case"4":return Array.isArray(M)?M:M!=null&&M.data&&Array.isArray(M.data)?M.data:[];default:return[]}},ae=c.useMemo(()=>{let s=V();return!s||!Array.isArray(s)?(console.warn("No valid data for filtering:",s),[]):(u.trim()&&(s=s.filter(a=>{switch(N){case"1":return a.date&&z(a.date).toLowerCase().includes(u.toLowerCase())||a.projectName&&a.projectName.toLowerCase().includes(u.toLowerCase())||a.totalIncomeAmount&&a.totalIncomeAmount.toString().includes(u);case"2":return a.expenseDate&&z(a.expenseDate).toLowerCase().includes(u.toLowerCase())||a.projectName&&a.projectName.toLowerCase().includes(u.toLowerCase())||a.totalExpense&&a.totalExpense.toString().includes(u);case"3":return a.date&&z(a.date).toLowerCase().includes(u.toLowerCase())||a.projectName&&a.projectName.toLowerCase().includes(u.toLowerCase())||a.totalIncome&&a.totalIncome.toString().includes(u)||a.totalExpenses&&a.totalExpenses.toString().includes(u)||a.profitLoss&&a.profitLoss.toString().includes(u);case"4":return a.projectName&&a.projectName.toLowerCase().includes(u.toLowerCase())||a.product_name&&a.product_name.toLowerCase().includes(u.toLowerCase())||a.dPrice&&a.dPrice.toString().includes(u)||a.totalQty&&a.totalQty.toString().includes(u)||a.totalRevenue&&a.totalRevenue.toString().includes(u);default:return!0}})),n.key&&(s=[...s].sort((a,i)=>{let v=a[n.key],j=i[n.key];return["date","expenseDate"].includes(n.key)&&(v=P(v),j=P(j)),v==null&&j==null?0:v==null?n.direction==="asc"?-1:1:j==null?n.direction==="asc"?1:-1:typeof v=="number"&&typeof j=="number"?n.direction==="asc"?v-j:j-v:n.direction==="asc"?String(v).localeCompare(String(j)):String(j).localeCompare(String(v))})),console.log("Filtered Data:",s),s)},[V,u,n,N,g]),te=()=>{if(u)return o("LABELS.no_results_found")||"No results found for your search";switch(N){case"1":return o("MSG.no_income_data")||"No income data available";case"2":return o("MSG.no_expense_data")||"No expense data available";case"3":return o("MSG.no_pnl_data")||"No profit/loss data available";case"4":return o("MSG.no_product_data")||"No product data available";default:return"No data available"}},ge=()=>{switch(N){case"1":return o("LABELS.search_income_logs")||"Search income data...";case"2":return o("LABELS.search_expenses")||"Search expense data...";case"3":return o("LABELS.search_pnl")||"Search profit & loss data...";case"4":return o("LABELS.search_products")||"Search product data...";default:return o("LABELS.search_data")||"Search data..."}},ve=s=>{const a=s.target.value;O(a),oe(a)},ce=()=>{O(""),Z(""),S.current&&clearTimeout(S.current)},ye=()=>{const s=v=>n.key===v?n.direction==="asc"?"↑":"↓":"↕",a=v=>({marginLeft:g?"4px":"8px",fontSize:g?"14px":"18px",opacity:n.key===v?1:.5,color:n.key===v?"#0d6efd":"#6c757d"}),i={cursor:"pointer",fontSize:g?"0.75rem":"0.875rem"};switch(N){case"1":return e.jsxs(e.Fragment,{children:[e.jsxs(L,{onClick:()=>y("projectName"),style:i,children:[g?"Project":o("LABELS.project_name")||"Project Name",e.jsx("span",{style:a("projectName"),children:s("projectName")})]}),e.jsxs(L,{onClick:()=>y("projectType"),style:i,children:[o("LABELS.project_type")||"Type",e.jsx("span",{style:a("projectType"),children:s("projectType")})]}),e.jsxs(L,{onClick:()=>y("date"),style:i,children:[o("LABELS.date")||"Date",e.jsx("span",{style:a("date"),children:s("date")})]}),e.jsxs(L,{onClick:()=>y("totalIncomeAmount"),style:i,children:[g?"Amount":"Total Income Amount",e.jsx("span",{style:a("totalIncomeAmount"),children:s("totalIncomeAmount")})]})]});case"2":return e.jsxs(e.Fragment,{children:[e.jsxs(L,{onClick:()=>y("projectName"),style:i,children:[g?"Project":o("LABELS.project_name")||"Project Name",e.jsx("span",{style:a("projectName"),children:s("projectName")})]}),e.jsxs(L,{onClick:()=>y("projectType"),style:i,children:[o("LABELS.project_type")||"Type",e.jsx("span",{style:a("projectType"),children:s("projectType")})]}),e.jsxs(L,{onClick:()=>y("expenseDate"),style:i,children:[o("LABELS.expense_date")||"Date",e.jsx("span",{style:a("expenseDate"),children:s("expenseDate")})]}),e.jsxs(L,{onClick:()=>y("totalExpense"),style:i,children:[g?"Expense":o("LABELS.total_expense")||"Total Expense",e.jsx("span",{style:a("totalExpense"),children:s("totalExpense")})]})]});case"3":return e.jsxs(e.Fragment,{children:[e.jsxs(L,{onClick:()=>y("projectName"),style:i,children:[g?"Project":o("LABELS.project_name")||"Project Name",e.jsx("span",{style:a("projectName"),children:s("projectName")})]}),e.jsxs(L,{onClick:()=>y("projectType"),style:i,children:[o("LABELS.project_type")||"Type",e.jsx("span",{style:a("projectType"),children:s("projectType")})]}),e.jsxs(L,{onClick:()=>y("date"),style:i,children:[o("LABELS.date")||"Date",e.jsx("span",{style:a("date"),children:s("date")})]}),e.jsxs(L,{onClick:()=>y("totalIncome"),style:i,children:[g?"Income":o("LABELS.income_grand_total")||"Income Total",e.jsx("span",{style:a("totalIncome"),children:s("totalIncome")})]}),e.jsxs(L,{onClick:()=>y("totalExpenses"),style:i,children:[g?"Expenses":o("LABELS.total_expenses")||"Total Expenses",e.jsx("span",{style:a("totalExpenses"),children:s("totalExpenses")})]})]});case"4":return e.jsxs(e.Fragment,{children:[e.jsxs(L,{onClick:()=>y("projectName"),style:i,children:[g?"Project":o("LABELS.project_name")||"Project Name",e.jsx("span",{style:a("projectName"),children:s("projectName")})]}),e.jsxs(L,{onClick:()=>y("projectType"),style:i,children:[o("LABELS.project_type")||"Type",e.jsx("span",{style:a("projectType"),children:s("projectType")})]}),e.jsxs(L,{onClick:()=>y("product_name"),style:i,children:[g?"Product":o("LABELS.product_name")||"Product Name",e.jsx("span",{style:a("product_name"),children:s("product_name")})]}),e.jsxs(L,{onClick:()=>y("dPrice"),style:i,children:[g?"Price":o("LABELS.unit_price")||"Unit Price",e.jsx("span",{style:a("dPrice"),children:s("dPrice")})]}),e.jsxs(L,{onClick:()=>y("totalQty"),style:i,children:[g?"Qty":o("LABELS.quantity")||"Quantity",e.jsx("span",{style:a("totalQty"),children:s("totalQty")})]}),e.jsxs(L,{onClick:()=>y("totalRevenue"),style:i,children:[g?"Revenue":o("LABELS.total_revenue")||"Total Revenue",e.jsx("span",{style:a("totalRevenue"),children:s("totalRevenue")})]})]});default:return null}},de=()=>{const s=ae;if(s.length===0){const a=N==="1"||N==="2"?4:6;return e.jsx(Ee,{children:e.jsx(w,{colSpan:a,className:"text-center empty-message",children:te()})})}return s.map((a,i)=>e.jsxs(Ee,{className:"data-row",children:[N==="1"&&e.jsxs(e.Fragment,{children:[e.jsx(w,{className:"project-cell",children:e.jsx("div",{className:"cell-wrapper",children:e.jsx("span",{className:"truncate-text",title:a.projectName,children:a.projectName||"-"})})}),e.jsx(w,{className:"project-type-cell",children:a.projectType||"-"}),e.jsx(w,{className:"date-cell",children:z(a.date)}),e.jsx(w,{className:"amount-cell",children:e.jsx("span",{className:"amount-value",children:W(a.totalIncomeAmount)})})]}),N==="2"&&e.jsxs(e.Fragment,{children:[e.jsx(w,{className:"project-cell",children:e.jsx("div",{className:"cell-wrapper",children:e.jsx("span",{className:"truncate-text",title:a.projectName,children:a.projectName||"-"})})}),e.jsx(w,{className:"project-type-cell",children:a.projectType||"-"}),e.jsx(w,{className:"date-cell",children:z(a.expenseDate)}),e.jsx(w,{className:"amount-cell",children:e.jsx("span",{className:"amount-value",children:W(a.totalExpense)})})]}),N==="3"&&e.jsxs(e.Fragment,{children:[e.jsx(w,{className:"project-cell",children:e.jsx("div",{className:"cell-wrapper",children:e.jsx("span",{className:"truncate-text",title:a.projectName,children:a.projectName||"-"})})}),e.jsx(w,{className:"project-type-cell",children:a.projectType||"-"}),e.jsx(w,{className:"date-cell",children:z(a.date)}),e.jsx(w,{className:"amount-cell",children:e.jsx("span",{className:"amount-value",children:W(a.totalIncome)})}),e.jsx(w,{className:"amount-cell",children:e.jsx("span",{className:"amount-value",children:W(a.totalExpenses)})})]}),N==="4"&&e.jsxs(e.Fragment,{children:[e.jsx(w,{className:"project-cell",children:e.jsx("div",{className:"cell-wrapper",children:e.jsx("span",{className:"truncate-text",title:a.projectName,children:a.projectName||"-"})})}),e.jsx(w,{className:"project-type-cell",children:a.projectType||"-"}),e.jsx(w,{className:"product-cell",children:e.jsx("div",{className:"cell-wrapper",children:e.jsx("span",{className:"truncate-text",title:a.product_name,children:a.product_name||"-"})})}),e.jsx(w,{className:"amount-cell",children:e.jsx("span",{className:"amount-value",children:W(a.dPrice)})}),e.jsx(w,{className:"quantity-cell",children:J(a.totalQty)}),e.jsx(w,{className:"amount-cell",children:e.jsx("span",{className:"amount-value revenue",children:W(a.totalRevenue)})})]})]},i))};return e.jsxs(e.Fragment,{children:[e.jsx("style",{jsx:!0,children:`
        .reports-table {
          width: 100%;
          min-width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          background-color: #fff;
          border-radius: 0.375rem;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          font-size: 0.875rem;
        }
        
        .reports-table th,
        .reports-table td {
          padding: 12px 8px;
          border-bottom: 1px solid #dee2e6;
          vertical-align: middle;
          word-wrap: break-word;
          overflow-wrap: break-word;
          text-align: center;
        }
        
        .reports-table thead th {
          background-color: #f8f9fa;
          font-weight: 600;
          color: #495057;
          border-bottom: 2px solid #dee2e6;
          cursor: pointer;
          user-select: none;
          position: sticky;
          top: 0;
          z-index: 10;
          text-align: center;
        }
        
        .reports-table tbody tr:hover {
          background-color: #f1f3f5;
        }
        
        .cell-wrapper {
          width: 100%;
          min-width: 0;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        .truncate-text {
          display: block;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
          text-align: center;
        }
        
        .project-cell {
          max-width: 150px;
          min-width: 100px;
          text-align: center;
        }
        
        .product-cell {
          max-width: 120px;
          min-width: 80px;
          text-align: center;
        }
        
        .date-cell {
          min-width: 80px;
          font-size: 0.8rem;
          color: #6c757d;
          text-align: center;
        }
        
        .amount-cell {
          text-align: center;
          font-weight: 600;
          min-width: 80px;
        }
        
        .quantity-cell {
          text-align: center;
          font-weight: 500;
          min-width: 60px;
        }
        
        .amount-value {
          display: inline-block;
          white-space: nowrap;
        }
        
        .amount-value.revenue {
          color: #0d6efd;
          font-weight: 700;
        }
        
        .profit-cell .amount-value {
          color: #198754;
        }
        
        .loss-cell .amount-value {
          color: #dc3545;
        }
        
        .empty-message {
          padding: 2rem !important;
          color: #6c757d;
          font-style: italic;
        }
        
        .header-search-container {
          position: relative;
          flex-grow: 1;
          max-width: 450px;
        }
        
        .header-search-input {
          padding: 12px 45px 12px 45px;
          border-radius: 25px;
          border: 2px solid #e9ecef;
          background-color: #fff;
          width: 100%;
          font-size: 14px;
          transition: all 0.3s ease;
          box-shadow: 0 2px 4px rgba(0,0,0,0.04);
        }
        
        .header-search-input:focus {
          outline: none;
          border-color: #0d6efd;
          box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.15), 0 4px 12px rgba(0,0,0,0.1);
          transform: translateY(-1px);
        }
        
        .header-search-input::placeholder {
          color: #adb5bd;
          font-style: italic;
        }
        
        .header-search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #6c757d;
          pointer-events: none;
          font-size: 16px;
          transition: color 0.3s ease;
        }
        
        .header-search-input:focus + .header-search-icon {
          color: #0d6efd;
        }
        
        .header-clear-search {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          background: #f8f9fa;
          border: none;
          color: #6c757d;
          cursor: pointer;
          padding: 4px;
          font-size: 12px;
          z-index: 1;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          opacity: 0.7;
        }
        
        .header-clear-search:hover {
          background: #dc3545;
          color: #fff;
          opacity: 1;
          transform: translateY(-50%) scale(1.1);
        }
        
        .custom-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 15px;
          padding: 1.25rem;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-bottom: 1px solid #dee2e6;
          border-radius: 0.375rem 0.375rem 0 0;
        }
        
        .header-left {
          display: flex;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
          flex-grow: 1;
        }
        
        .records-count {
          white-space: nowrap;
          font-size: 0.875rem;
          color: #495057;
          background: #fff;
          padding: 8px 16px;
          border-radius: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.08);
          border: 1px solid #e9ecef;
          font-weight: 500;
        }
        
        .search-results-info {
          margin-top: 0.5rem;
          font-size: 0.8rem;
          color: #0d6efd;
          background: rgba(13, 110, 253, 0.1);
          padding: 6px 12px;
          border-radius: 15px;
          font-weight: 500;
          animation: slideIn 0.3s ease;
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .loading-more {
          position: sticky;
          bottom: 0;
          background: rgba(248, 249, 250, 0.95);
          backdrop-filter: blur(5px);
          border-top: 1px solid #dee2e6;
          padding: 10px;
          text-align: center;
          z-index: 5;
        }
        
        .table-container {
          max-height: 70vh;
          overflow: auto;
          position: relative;
        }
        
        /* Tablet Responsiveness */
        @media (max-width: 1024px) {
          .reports-table {
            font-size: 0.8rem;
          }
          
          .reports-table th,
          .reports-table td {
            padding: 10px 6px;
            text-align: center;
          }
          
          .project-cell {
            max-width: 120px;
            min-width: 80px;
          }
          
          .product-cell {
            max-width: 100px;
            min-width: 70px;
          }
          
          .header-search-input {
            padding: 10px 40px 10px 40px;
            font-size: 0.9rem;
          }
        }
        
        /* Mobile Responsiveness */
        @media (max-width: 768px) {
          .custom-card-header {
            flex-direction: column;
            align-items: stretch;
            gap: 15px;
            padding: 1rem;
          }
          
          .header-left {
            flex-direction: column;
            align-items: stretch;
            gap: 15px;
          }
          
          .header-search-container {
            max-width: none;
            width: 100%;
          }
          
          .header-search-input {
            padding: 14px 45px 14px 45px;
            font-size: 16px;
          }
          
          .records-count {
            text-align: center;
            order: 2;
            align-self: center;
          }
          
          .search-results-info {
            text-align: center;
            margin-top: 10px;
          }
          
          .reports-table {
            font-size: 0.75rem;
          }
          
          .reports-table th,
          .reports-table td {
            padding: 8px 4px;
            text-align: center;
          }
          
          .project-cell,
          .product-cell {
            max-width: 100px;
            min-width: 60px;
            text-align: center;
          }
          
          .date-cell {
            min-width: 60px;
            font-size: 0.7rem;
            text-align: center;
          }
          
          .amount-cell,
          .quantity-cell {
            min-width: 60px;
            font-size: 0.75rem;
            text-align: center;
          }
          
          .table-container {
            max-height: 60vh;
          }
        }
        
        /* Small Mobile */
        @media (max-width: 576px) {
          .custom-card-header {
            padding: 0.75rem;
          }
          
          .reports-table {
            font-size: 0.7rem;
          }
          
          .reports-table th,
          .reports-table td {
            padding: 6px 3px;
            text-align: center;
          }
          
          .project-cell,
          .product-cell {
            max-width: 80px;
            min-width: 50px;
            text-align: center;
          }
          
          .date-cell {
            min-width: 50px;
            font-size: 0.65rem;
            text-align: center;
          }
          
          .amount-cell,
          .quantity-cell {
            min-width: 50px;
            font-size: 0.7rem;
            text-align: center;
          }
          
          .truncate-text {
            font-size: 0.7rem;
            text-align: center;
          }
          
          .header-search-input {
            font-size: 16px;
            padding: 12px 40px 12px 40px;
          }
          
          .header-search-icon {
            left: 14px;
            font-size: 15px;
          }
          
          .header-clear-search {
            right: 14px;
            width: 18px;
            height: 18px;
            font-size: 11px;
          }
          
          .records-count {
            font-size: 0.8rem;
            padding: 6px 12px;
          }
          
          .search-results-info {
            font-size: 0.75rem;
            padding: 4px 8px;
          }
        }
        
        /* Extra Small Mobile */
        @media (max-width: 420px) {
          .reports-table {
            font-size: 0.65rem;
          }
          
          .reports-table th,
          .reports-table td {
            padding: 5px 2px;
            text-align: center;
          }
          
          .project-cell,
          .product-cell {
            max-width: 70px;
            min-width: 45px;
            text-align: center;
          }
          
          .date-cell {
            min-width: 45px;
            font-size: 0.6rem;
            text-align: center;
          }
          
          .amount-cell,
          .quantity-cell {
            min-width: 45px;
            font-size: 0.65rem;
            text-align: center;
          }
          
          .truncate-text {
            font-size: 0.65rem;
            text-align: center;
          }
          
          .amount-value {
            font-size: 0.65rem;
          }
        }
        
        /* Landscape Mobile */
        @media (max-width: 896px) and (orientation: landscape) {
          .table-container {
            max-height: 50vh;
          }
          
          .reports-table th,
          .reports-table td {
            padding: 6px 4px;
            text-align: center;
          }
        }
        
        /* Large Desktop */
        @media (min-width: 1200px) {
          .project-cell {
            max-width: 200px;
            min-width: 150px;
          }
          
          .product-cell {
            max-width: 150px;
            min-width: 120px;
          }
          
          .reports-table th,
          .reports-table td {
            padding: 15px 12px;
          }
        }
        
        /* High DPI Displays */
        @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
          .reports-table {
            border: 0.5px solid #dee2e6;
          }
          
          .reports-table th,
          .reports-table td {
            border-bottom: 0.5px solid #dee2e6;
          }
        }
        
        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .reports-table {
            background-color: #2d3748;
            color: #e2e8f0;
          }
          
          .reports-table thead th {
            background-color: #4a5568;
            color: #e2e8f0;
          }
          
          .reports-table tbody tr:hover {
            background-color: #4a5568;
          }
        }
        
        .header-search-input::-webkit-search-cancel-button {
          display: none;
        }
        
        /* Print styles */
        @media print {
          .header-search-container,
          .loading-more {
            display: none !important;
          }
          
          .reports-table {
            box-shadow: none;
            border: 1px solid #000;
          }
          
          .reports-table th,
          .reports-table td {
            border: 1px solid #000;
            padding: 8px;
          }
        }
        
        /* Accessibility improvements */
        @media (prefers-reduced-motion: reduce) {
          .header-search-input,
          .header-clear-search,
          .search-results-info {
            transition: none;
            animation: none;
          }
        }
        
        /* Focus management for keyboard navigation */
        .reports-table th:focus,
        .header-search-input:focus,
        .header-clear-search:focus {
          outline: 2px solid #0d6efd;
          outline-offset: 2px;
        }
      `}),e.jsx(He,{children:e.jsx(We,{xs:12,children:e.jsxs(Je,{className:"mb-4",children:[e.jsxs("div",{className:"custom-card-header",children:[e.jsxs("div",{className:"header-left",children:[e.jsxs("div",{className:"header-search-container",children:[e.jsx("input",{type:"text",className:"header-search-input",placeholder:ge(),value:ne,onChange:ve}),e.jsx("div",{className:"header-search-icon",children:"🔍"}),ne&&e.jsx("button",{className:"header-clear-search",onClick:ce,title:o("LABELS.clear_search")||"Clear search",children:"×"})]}),u&&e.jsxs("div",{className:"search-results-info",children:[ae.length," ",o("LABELS.results_found")||"results found for",' "',u,'"']})]}),e.jsxs("div",{className:"records-count",children:[ae.length," ",o("LABELS.records")||"records"]})]}),e.jsx(Ve,{className:"p-0",children:e.jsxs("div",{className:"table-container",ref:fe,onScroll:X,children:[e.jsxs(Xe,{className:"reports-table",children:[e.jsx(Ze,{children:e.jsx(Ee,{children:ye()})}),e.jsx(Oe,{children:de()})]}),le&&e.jsxs("div",{className:"loading-more",children:[e.jsx($e,{color:"primary",size:"sm"}),e.jsx("span",{className:"ms-2 text-muted",children:o("MSG.loading")||"Loading more..."})]})]})})]})})})]})}function U({ReportOptions:N,selectedOption:r,setSelectedOption:l}){const{t:_,ready:C}=be("global");if(!C)return e.jsx("div",{children:_("LABELS.loading")});const M=[...N];return e.jsx("div",{children:e.jsx(b,{id:"report-select",options:M,value:r,onChange:E=>l(E.target.value)})})}function q({fetchReportData:N}){const{t:r,ready:l}=be("global");return l?e.jsx("div",{children:e.jsx(F,{color:"success",onClick:N,children:r("LABELS.fetch_report")})}):e.jsx("div",{children:r("LABELS.loading")})}function gt({companyId:N}){const{t:r}=be("global"),[l,_]=c.useState("3"),[C,M]=c.useState(""),[E,re]=c.useState([]),[le,Ne]=c.useState({start_date:"",end_date:""}),[o,u]=c.useState({start_date:"",end_date:""}),[Z,ne]=c.useState({start_date:"",end_date:""}),[O,g]=c.useState({start_date:"",end_date:""}),[H,fe]=c.useState("Year"),[S,ee]=c.useState([]),[n,we]=c.useState(""),[z,W]=c.useState({start_date:"",end_date:""}),{showToast:J}=Qe(),[y,oe]=c.useState(1),[X,P]=c.useState(!1),[V,ae]=c.useState(!1),[te,ge]=c.useState(null),[ve,ce]=c.useState(null),[ye,de]=c.useState(null),[s,a]=c.useState(null),[i,v]=c.useState(null);c.useRef(0),c.useRef(!1);const j=[{label:r("LABELS.incomeReport")||"Income Report",value:"1"},{label:r("LABELS.expenseReport")||"Expense Report",value:"2"},{label:r("LABELS.profit_loss")||"Profit and Loss",value:"3"}],[A,Le]=c.useState({data:[],totalIncomeAmount:0}),[B,Se]=c.useState([]),[R,_e]=c.useState({data:[],totalExpense:0}),[ie,tt]=c.useState({}),[$,Ce]=c.useState({Data:[],totalIncome:0,totalExpenses:0,totalProfitLoss:0});c.useEffect(()=>{(async()=>{try{const[m,d]=await Promise.all([se(`/api/projects${N?`?companyId=${N}`:""}`),se("/api/project-types")]);if(m&&Array.isArray(m)){const K=m.map(T=>({value:T.id,label:T.project_name,typeId:T.project_type_id}));re(K)}else if(m&&Array.isArray(m.data)){const K=m.data.map(T=>({value:T.id,label:T.project_name,typeId:T.project_type_id}));re(K)}else J("danger",r("MSG.failed_fetch_projects")||"Failed to fetch projects");d&&Array.isArray(d)&&ee(d)}catch(m){console.error("Error fetching data:",m),J("danger",r("MSG.failed_fetch_projects")||"Failed to fetch projects")}})()},[N,r]),c.useEffect(()=>{if(H==="Month"&&l==="3"&&o.start_date&&o.end_date){const t=new Date(o.start_date).getFullYear();(async()=>{try{const d=await se(`/api/monthlyIncomeSummaries?year=${t}`);d.success&&v(d)}catch(d){console.error(d)}})()}else v(null)},[H,l,o]);const Re=t=>{fe(t),Le({data:[],totalIncomeAmount:0}),_e({data:[],totalExpense:0}),Ce({Data:[],totalIncome:0,totalExpenses:0,totalProfitLoss:0}),Se([]),oe(1),P(!1),ge(null),ce(null),de(null),a(null)},Q=t=>{M(t),Ae()},Y=t=>{we(t),M(""),Ae()},Ae=()=>{Le({data:[],totalIncomeAmount:0}),_e({data:[],totalExpense:0}),Ce({Data:[],totalIncome:0,totalExpenses:0,totalProfitLoss:0}),Se([]),oe(1),P(!1),ge(null),ce(null),de(null),a(null)},ke=()=>{if(!Array.isArray(B)||B.length===0)return[];const t=B.reduce((m,d)=>m+(Number(d.totalRevenue)||0),0);return B.sort((m,d)=>(Number(d.totalRevenue)||0)-(Number(m.totalRevenue)||0)).slice(0,3).map(m=>({...m,percentage:t>0?Math.round(Number(m.totalRevenue)/t*100):0}))},De=()=>{const t=ke();if(t.length===0)return{labels:[],datasets:[{data:[],backgroundColor:[],borderWidth:2}]};const m=["#FF6B6B","#4ECDC4","#45B7D1"];return{labels:t.map(d=>d.product_name),datasets:[{data:t.map(d=>Number(d.totalRevenue)||0),backgroundColor:m.slice(0,t.length),borderColor:"#fff",borderWidth:2}]}},ze=()=>{if(!i)return null;const m={labels:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],datasets:[{label:"Income",data:i.monthlySales,backgroundColor:"rgba(13, 110, 253, 0.6)"},{label:"Expenses",data:i.monthlyExpense,backgroundColor:"rgba(220, 53, 69, 0.6)"},{label:"P&L",data:i.monthlyPandL,backgroundColor:"rgba(25, 135, 84, 0.6)"}]};return e.jsx("div",{className:"monthly-summary row mt-4",children:e.jsx("div",{className:"col-12",children:e.jsxs("div",{className:"card",children:[e.jsx("div",{className:"card-header",children:r("LABELS.monthly_summary")||"Monthly Summary"}),e.jsx("div",{className:"card-body",children:e.jsx(Ke,{data:m})})]})})})};c.useEffect(()=>{if(H!=="Custom"){let t=!1;switch(H){case"Year":t=O.start_date&&O.end_date;break;case"Quarter":t=Z.start_date&&Z.end_date;break;case"Month":t=o.start_date&&o.end_date;break;case"Week":t=z.start_date&&z.end_date;break}if(t){const m=setTimeout(()=>{Fe()},100);return()=>clearTimeout(m)}}},[H,O,Z,o,z,C,n]);const D=async(t=1,m=!1)=>{try{ae(t>1);let d={},K=[],T=[];switch(H){case"Custom":d=le;break;case"Month":d=o;break;case"Quarter":d=Z;break;case"Year":d=O;break;case"Week":d=z;break;default:break}if(!d.start_date||!d.end_date){alert(r("MSG.select_dates")||"Please select dates");return}const I=new URLSearchParams;if(I.append("startDate",d.start_date),I.append("endDate",d.end_date),I.append("perPage","370"),C&&I.append("projectId",C),n&&I.append("project_type_id",n),l==="1"||l==="3"){const x=new URLSearchParams(I);ve&&x.append("cursor",ve);const f=await se(`/api/incomeSummaryReport?${x.toString()}`);if(console.log("Income API Response:",f),f&&f.incomes){const p=f.incomes.map(h=>({date:h.date,projectName:h.project_name||"Unknown Project",totalIncomeAmount:Number(h.totalIncomeAmount)||0,projectType:h.project_type||"N/A"}));K=[...p],Le(h=>{var k;return{data:m?[...h.data,...p]:p,totalIncomeAmount:(k=f.summary)!=null&&k.totalIncomeAmount?Number(f.summary.totalIncomeAmount):h.totalIncomeAmount||0}}),console.log("Updated incomeData:",A),P(f.has_more_pages||!1),ce(f.next_cursor||null)}else J("danger",r("MSG.failed_fetch_income_logs")||"Failed to fetch income logs")}if(l==="2"||l==="3"){const x=new URLSearchParams(I);ye&&x.append("cursor",ye);const f=await se(`/api/expense-report?${x.toString()}`);if(f&&f.data){const p=f.data.map(h=>({id:h.id,expenseDate:h.expense_date,totalExpense:Number(h.total_expense)||0,projectName:h.project_name||"Unknown Project",projectType:h.project_type||"N/A"}));T=[...p],_e(h=>({data:m?[...h.data,...p]:p,totalExpense:Number(f.total_expense)||0})),P(f.has_more_pages||!1),de(f.next_cursor||null)}else J("danger",r("MSG.failed_fetch_expense")||"Failed to fetch expenses")}if(l==="4"){const x=await se(`/api/reportProductWiseEarnings?startDate=${d.start_date}&endDate=${d.end_date}&perPage=370${s?`&cursor=${s}`:""}${I}`);if(x&&Array.isArray(x.data)){const f=x.data.map(p=>({product_id:p.id,product_name:p.product_name,dPrice:Number(p.product_dPrice)||0,totalQty:Number(p.totalQty)||0,totalRevenue:Number(p.totalRevenue)||0,totalRevenue:Number(p.totalRevenue)||0,projectName:p.project_name||"Unknown Project"}));Se(p=>{const h=Array.isArray(p)?p:(p==null?void 0:p.data)||[];return m?[...h,...f]:f}),P(x.has_more_pages||!1),a(x.next_cursor||null)}else J("danger",r("MSG.invalid_product_data_format")||"Invalid product data format")}if(l==="3"){const x=new Map;K.forEach(p=>{const h=`${p.date}|${p.projectName}`;x.set(h,{date:p.date,projectName:p.projectName,totalIncome:p.totalIncomeAmount,totalExpenses:0,profitLoss:p.totalIncomeAmount,projectType:p.projectType})}),T.forEach(p=>{const h=`${p.expenseDate}|${p.projectName}`,k=x.get(h)||{date:p.expenseDate,projectName:p.projectName,totalIncome:0,totalExpenses:0,profitLoss:0,projectType:p.projectType};k.totalExpenses+=p.totalExpense,k.profitLoss=k.totalIncome-k.totalExpenses,x.set(h,k)});const f=Array.from(x.values());Ce(p=>({Data:m?[...p.Data,...f]:f,totalIncome:K.reduce((h,k)=>h+(Number(k.totalIncomeAmount)||0),0),totalExpenses:T.reduce((h,k)=>h+(Number(k.totalExpense)||0),0),totalProfitLoss:K.reduce((h,k)=>h+(Number(k.totalIncomeAmount)||0),0)-T.reduce((h,k)=>h+(Number(k.totalExpense)||0),0)}))}}catch(d){console.error("Error fetching report data:",d),J("danger",r("MSG.error_fetching_data")||"Error fetching data")}finally{ae(!1)}},Fe=()=>{D(1,!1)},pe=()=>{X&&!V&&(oe(t=>t+1),D(y+1,!0))},me=()=>l==="1"?e.jsx("div",{className:"summary-cards row g-3",children:e.jsx("div",{className:"col-md-6 col-lg-4",children:e.jsx("div",{className:"card bg-primary-light",children:e.jsxs("div",{className:"card-body d-flex align-items-center",children:[e.jsx("div",{className:"icon-container me-3",children:e.jsx("i",{className:"bi bi-currency-rupee"})}),e.jsxs("div",{children:[e.jsx("h6",{className:"card-title mb-1",children:r("LABELS.total_income_amount")||"Total Income Amount"}),e.jsxs("h4",{className:"card-text",children:["₹",A.totalIncomeAmount.toLocaleString()]})]})]})})})}):l==="2"?e.jsx("div",{className:"summary-cards row g-3",children:e.jsx("div",{className:"col-md-6 col-lg-4",children:e.jsx("div",{className:"card bg-danger-light",children:e.jsxs("div",{className:"card-body d-flex align-items-center",children:[e.jsx("div",{className:"icon-container me-3",children:e.jsx("i",{className:"bi bi-currency-rupee"})}),e.jsxs("div",{children:[e.jsx("h6",{className:"card-title mb-1",children:r("LABELS.total_expense")||"Total Expense"}),e.jsxs("h4",{className:"card-text",children:["₹",R.totalExpense.toLocaleString()]})]})]})})})}):l==="3"?($.totalProfitLoss>=0,Math.abs($.totalProfitLoss),e.jsxs("div",{className:"summary-cards row g-3",children:[e.jsx("div",{className:"col-md-4",children:e.jsx("div",{className:"card bg-primary-light",children:e.jsxs("div",{className:"card-body d-flex align-items-center",children:[e.jsx("div",{className:"icon-container me-3",children:e.jsx("i",{className:"bi bi-currency-rupee"})}),e.jsxs("div",{children:[e.jsx("h6",{className:"card-title mb-1",children:r("LABELS.income_grand_total")||"Income Grand Total"}),e.jsxs("h4",{className:"card-text",children:["₹",$.totalIncome.toLocaleString()]})]})]})})}),e.jsx("div",{className:"col-md-4",children:e.jsx("div",{className:"card bg-danger-light",children:e.jsxs("div",{className:"card-body d-flex align-items-center",children:[e.jsx("div",{className:"icon-container me-3",children:e.jsx("i",{className:"bi bi-currency-rupee"})}),e.jsxs("div",{children:[e.jsx("h6",{className:"card-title mb-1",children:r("LABELS.total_expenses")||"Total Expenses"}),e.jsxs("h4",{className:"card-text",children:["₹",$.totalExpenses.toLocaleString()]})]})]})})})]})):null,xe=()=>{const t=ke();return e.jsxs("div",{className:"top-products-section row mt-4",children:[e.jsx("div",{className:"col-md-6",children:e.jsxs("div",{className:"card",children:[e.jsx("div",{className:"card-header",children:r("LABELS.top_products")}),e.jsx("div",{className:"card-body",children:t.map((m,d)=>e.jsxs("div",{className:"d-flex justify-content-between align-items-center mb-3",children:[e.jsxs("div",{children:[e.jsx(CBadge,{color:["primary","success","info"][d],className:"badge-rank me-2",children:d+1}),m.product_name]}),e.jsxs("div",{className:"text-end",children:[e.jsxs("strong",{children:["₹",Number(m.totalRevenue).toLocaleString()]}),e.jsxs("small",{className:"text-muted ms-2",children:["(",m.percentage,"%)"]})]})]},d))})]})}),e.jsx("div",{className:"col-md-6",children:e.jsxs("div",{className:"card",children:[e.jsx("div",{className:"card-header",children:r("LABELS.revenue_distribution")}),e.jsx("div",{className:"card-body",children:e.jsx(Ue,{data:De()})})]})})]})},G=()=>{let t="",m=[],d=[];if(l==="1"?(m=["Date","Project","Project Type","Income Amount"],d=A.data.map(x=>[x.date,x.projectName,x.projectType||"N/A",x.totalIncomeAmount])):l==="2"?(m=["Expense Date","Project","Project Type","Expense Amount"],d=R.data.map(x=>[x.expenseDate,x.projectName,x.projectType||"N/A",x.totalExpense])):l==="3"&&(m=["Date","Project","Project Type","Total Income","Total Expenses","Profit/Loss"],d=$.Data.map(x=>[x.date,x.projectName,x.projectType||"N/A",x.totalIncome,x.totalExpenses,x.profitLoss])),d.length===0){J("warning",r("MSG.no_data_to_download")||"No data available to download");return}t+=m.join(",")+`
`,d.forEach(x=>{t+=x.map(f=>`"${f??""}"`).join(",")+`
`});const K=new Blob([t],{type:"text/csv;charset=utf-8;"}),T=URL.createObjectURL(K),I=document.createElement("a");I.href=T,I.setAttribute("download","report.csv"),document.body.appendChild(I),I.click(),document.body.removeChild(I),URL.revokeObjectURL(T)};return e.jsxs(et,{children:[e.jsx("div",{className:"responsive-container",children:e.jsxs(Ye,{activeItemKey:H,onChange:Re,children:[e.jsxs(Ge,{variant:"tabs",className:"mb-3",children:[e.jsx(he,{itemKey:"Year",children:r("LABELS.year")}),e.jsx(he,{itemKey:"Quarter",children:r("LABELS.quarter")}),e.jsx(he,{itemKey:"Month",children:r("LABELS.month")}),e.jsx(he,{itemKey:"Week",children:r("LABELS.week")}),e.jsx(he,{itemKey:"Custom",children:r("LABELS.custom")})]}),e.jsxs(qe,{children:[e.jsxs(ue,{className:"p-3",itemKey:"Custom",children:[e.jsxs("div",{className:"d-none d-md-flex mb-3 justify-content-between flex-wrap",children:[e.jsx("div",{className:"flex-fill mx-1",children:e.jsx(Te,{setStateCustom:Ne})}),e.jsx("div",{className:"flex-fill mx-1",children:e.jsxs(b,{value:n,onChange:t=>Y(t.target.value),className:"larger-dropdown",children:[e.jsx("option",{value:"",children:r("LABELS.select_project_type")||"Select Project Type"}),S.map(t=>e.jsx("option",{value:t.id,children:t.name},t.id))]})}),e.jsx("div",{className:"flex-fill mx-1",children:e.jsxs(b,{value:C,onChange:t=>Q(t.target.value),className:"larger-dropdown",children:[e.jsx("option",{value:"",children:r("LABELS.select_project")}),E.filter(t=>!n||t.typeId==n).map(t=>e.jsx("option",{value:t.value,children:t.label},t.value))]})}),e.jsx("div",{className:"flex-fill mx-1",children:e.jsx(U,{setSelectedOption:_,ReportOptions:j,selectedOption:l})}),e.jsxs("div",{className:"flex-fill mx-1 d-flex",children:[e.jsx(q,{fetchReportData:D}),e.jsx(F,{color:"info",className:"ms-2",style:{height:"38px"},onClick:G,children:r("LABELS.download")})]})]}),e.jsx("div",{className:"d-md-none mb-3",children:e.jsxs("div",{className:"row gy-3",children:[e.jsx("div",{className:"col-12",children:e.jsx(Te,{setStateCustom:Ne})}),e.jsx("div",{className:"col-12",children:e.jsxs(b,{value:n,onChange:t=>Y(t.target.value),className:"larger-dropdown",children:[e.jsx("option",{value:"",children:r("LABELS.select_project_type")||"Select Project Type"}),S.map(t=>e.jsx("option",{value:t.id,children:t.name},t.id))]})}),e.jsx("div",{className:"col-12",children:e.jsxs(b,{value:C,onChange:t=>Q(t.target.value),className:"larger-dropdown",children:[e.jsx("option",{value:"",children:r("LABELS.select_project")}),E.filter(t=>!n||t.typeId==n).map(t=>e.jsx("option",{value:t.value,children:t.label},t.value))]})}),e.jsx("div",{className:"col-12",children:e.jsx(U,{setSelectedOption:_,ReportOptions:j,selectedOption:l})}),e.jsxs("div",{className:"col-12 d-flex justify-content-start",children:[e.jsx(q,{fetchReportData:D}),e.jsx(F,{color:"info",className:"ms-2",onClick:G,children:r("LABELS.download")})]})]})}),(A.data.length>0||R.data.length>0)&&me(),l==="4"&&B.length>0&&xe(),e.jsx("div",{className:"mt-3",children:e.jsx(je,{selectedOption:l,salesData:A,expenseData:R,pnlData:$,expenseType:ie,productWiseData:B,onLoadMore:pe,hasMorePages:X,isFetchingMore:V,scrollCursor:te})})]}),e.jsxs(ue,{className:"p-3",itemKey:"Month",children:[e.jsxs("div",{className:"d-none d-md-flex mb-3 justify-content-between flex-wrap",children:[e.jsx("div",{className:"flex-fill mx-1",children:e.jsx(Pe,{setStateMonth:u})}),e.jsx("div",{className:"flex-fill mx-1",children:e.jsxs(b,{value:n,onChange:t=>Y(t.target.value),className:"larger-dropdown",children:[e.jsx("option",{value:"",children:r("LABELS.select_project_type")||"Select Project Type"}),S.map(t=>e.jsx("option",{value:t.id,children:t.name},t.id))]})}),e.jsx("div",{className:"flex-fill mx-1",children:e.jsxs(b,{value:C,onChange:t=>Q(t.target.value),className:"larger-dropdown",children:[e.jsx("option",{value:"",children:r("LABELS.select_project")}),E.filter(t=>!n||t.typeId==n).map(t=>e.jsx("option",{value:t.value,children:t.label},t.value))]})}),e.jsx("div",{className:"flex-fill mx-1",children:e.jsx(U,{setSelectedOption:_,ReportOptions:j,selectedOption:l})}),e.jsxs("div",{className:"flex-fill mx-1 d-flex",children:[e.jsx(q,{fetchReportData:D}),e.jsx(F,{color:"info",className:"ms-2",style:{height:"38px"},onClick:G,children:r("LABELS.download")})]})]}),e.jsx("div",{className:"d-md-none mb-3",children:e.jsxs("div",{className:"row gy-3",children:[e.jsx("div",{className:"col-12",children:e.jsx(Pe,{setStateMonth:u})}),e.jsx("div",{className:"col-12",children:e.jsxs(b,{value:n,onChange:t=>Y(t.target.value),className:"larger-dropdown",children:[e.jsx("option",{value:"",children:r("LABELS.select_project_type")||"Select Project Type"}),S.map(t=>e.jsx("option",{value:t.id,children:t.name},t.id))]})}),e.jsx("div",{className:"col-12",children:e.jsxs(b,{value:C,onChange:t=>Q(t.target.value),className:"larger-dropdown",children:[e.jsx("option",{value:"",children:r("LABELS.select_project")}),E.filter(t=>!n||t.typeId==n).map(t=>e.jsx("option",{value:t.value,children:t.label},t.value))]})}),e.jsx("div",{className:"col-12",children:e.jsx(U,{setSelectedOption:_,ReportOptions:j,selectedOption:l})}),e.jsxs("div",{className:"col-12 d-flex justify-content-start",children:[e.jsx(q,{fetchReportData:D}),e.jsx(F,{color:"info",className:"ms-2",onClick:G,children:r("LABELS.download")})]})]})}),(A.data.length>0||R.data.length>0)&&me(),l==="3"&&i&&ze(),l==="4"&&B.length>0&&xe(),e.jsx("div",{className:"mt-3",children:e.jsx(je,{selectedOption:l,salesData:A,expenseData:R,pnlData:$,expenseType:ie,productWiseData:B,onLoadMore:pe,hasMorePages:X,isFetchingMore:V,scrollCursor:te})})]}),e.jsxs(ue,{className:"p-3",itemKey:"Quarter",children:[e.jsxs("div",{className:"d-none d-md-flex mb-3 justify-content-between flex-wrap",children:[e.jsx("div",{className:"flex-fill mx-1",children:e.jsx(Be,{setStateQuarter:ne})}),e.jsx("div",{className:"flex-fill mx-1",children:e.jsxs(b,{value:n,onChange:t=>Y(t.target.value),className:"larger-dropdown",children:[e.jsx("option",{value:"",children:r("LABELS.select_project_type")||"Select Project Type"}),S.map(t=>e.jsx("option",{value:t.id,children:t.name},t.id))]})}),e.jsx("div",{className:"flex-fill mx-1",children:e.jsxs(b,{value:C,onChange:t=>Q(t.target.value),className:"larger-dropdown",children:[e.jsx("option",{value:"",children:r("LABELS.select_project")}),E.filter(t=>!n||t.typeId==n).map(t=>e.jsx("option",{value:t.value,children:t.label},t.value))]})}),e.jsx("div",{className:"flex-fill mx-1",children:e.jsx(U,{setSelectedOption:_,ReportOptions:j,selectedOption:l})}),e.jsxs("div",{className:"flex-fill mx-1 d-flex",children:[e.jsx(q,{fetchReportData:D}),e.jsx(F,{color:"info",className:"ms-2",style:{height:"38px"},onClick:G,children:r("LABELS.download")})]})]}),e.jsx("div",{className:"d-md-none mb-3",children:e.jsxs("div",{className:"row gy-3",children:[e.jsx("div",{className:"col-12",children:e.jsx(Be,{setStateQuarter:ne})}),e.jsx("div",{className:"col-12",children:e.jsxs(b,{value:n,onChange:t=>Y(t.target.value),className:"larger-dropdown",children:[e.jsx("option",{value:"",children:r("LABELS.select_project_type")||"Select Project Type"}),S.map(t=>e.jsx("option",{value:t.id,children:t.name},t.id))]})}),e.jsx("div",{className:"col-12",children:e.jsxs(b,{value:C,onChange:t=>Q(t.target.value),className:"larger-dropdown",children:[e.jsx("option",{value:"",children:r("LABELS.select_project")}),E.map(t=>e.jsx("option",{value:t.value,children:t.label},t.value))]})}),e.jsx("div",{className:"col-12",children:e.jsx(U,{setSelectedOption:_,ReportOptions:j,selectedOption:l})}),e.jsxs("div",{className:"col-12 d-flex justify-content-start",children:[e.jsx(q,{fetchReportData:D}),e.jsx(F,{color:"info",className:"ms-2",onClick:G,children:r("LABELS.download")})]})]})}),(A.data.length>0||R.data.length>0)&&me(),l==="4"&&B.length>0&&xe(),e.jsx("div",{className:"mt-3",children:e.jsx(je,{selectedOption:l,salesData:A,expenseData:R,pnlData:$,expenseType:ie,productWiseData:B,onLoadMore:pe,hasMorePages:X,isFetchingMore:V,scrollCursor:te})})]}),e.jsxs(ue,{className:"p-3",itemKey:"Week",children:[e.jsxs("div",{className:"d-none d-md-flex mb-3 justify-content-between flex-wrap",children:[e.jsx("div",{className:"flex-fill mx-1",children:e.jsx(Ie,{setStateWeek:W})}),e.jsx("div",{className:"flex-fill mx-1",children:e.jsxs(b,{value:n,onChange:t=>Y(t.target.value),className:"larger-dropdown",children:[e.jsx("option",{value:"",children:r("LABELS.select_project_type")||"Select Project Type"}),S.map(t=>e.jsx("option",{value:t.id,children:t.name},t.id))]})}),e.jsx("div",{className:"flex-fill mx-1",children:e.jsxs(b,{value:C,onChange:t=>Q(t.target.value),className:"larger-dropdown",children:[e.jsx("option",{value:"",children:r("LABELS.select_project")}),E.filter(t=>!n||t.typeId==n).map(t=>e.jsx("option",{value:t.value,children:t.label},t.value))]})}),e.jsx("div",{className:"flex-fill mx-1",children:e.jsx(U,{setSelectedOption:_,ReportOptions:j,selectedOption:l})}),e.jsxs("div",{className:"flex-fill mx-1 d-flex",children:[e.jsx(q,{fetchReportData:D}),e.jsx(F,{color:"info",className:"ms-2",style:{height:"38px"},onClick:G,children:r("LABELS.download")})]})]}),e.jsx("div",{className:"d-md-none mb-3",children:e.jsxs("div",{className:"row gy-3",children:[e.jsx("div",{className:"col-12",children:e.jsx(Ie,{setStateWeek:W})}),e.jsx("div",{className:"col-12",children:e.jsxs(b,{value:n,onChange:t=>Y(t.target.value),className:"larger-dropdown",children:[e.jsx("option",{value:"",children:r("LABELS.select_project_type")||"Select Project Type"}),S.map(t=>e.jsx("option",{value:t.id,children:t.name},t.id))]})}),e.jsx("div",{className:"col-12",children:e.jsxs(b,{value:C,onChange:t=>Q(t.target.value),className:"larger-dropdown",children:[e.jsx("option",{value:"",children:r("LABELS.select_project")}),E.map(t=>e.jsx("option",{value:t.value,children:t.label},t.value))]})}),e.jsx("div",{className:"col-12",children:e.jsx(U,{setSelectedOption:_,ReportOptions:j,selectedOption:l})}),e.jsxs("div",{className:"col-12 d-flex justify-content-start",children:[e.jsx(q,{fetchReportData:D}),e.jsx(F,{color:"info",className:"ms-2",onClick:G,children:r("LABELS.download")})]})]})}),(A.data.length>0||R.data.length>0)&&me(),l==="4"&&B.length>0&&xe(),e.jsx("div",{className:"mt-3",children:e.jsx(je,{selectedOption:l,salesData:A,expenseData:R,pnlData:$,expenseType:ie,productWiseData:B,onLoadMore:pe,hasMorePages:X,isFetchingMore:V,scrollCursor:te})})]}),e.jsxs(ue,{className:"p-3",itemKey:"Year",children:[e.jsxs("div",{className:"d-none d-md-flex mb-3 align-items-end flex-wrap",children:[e.jsx(Me,{setStateYear:g}),e.jsx("div",{className:"mx-1 mt-2 flex-fill",children:e.jsxs(b,{value:n,onChange:t=>Y(t.target.value),className:"larger-dropdown",children:[e.jsx("option",{value:"",children:r("LABELS.select_project_type")||"Select Project Type"}),S.map(t=>e.jsx("option",{value:t.id,children:t.name},t.id))]})}),e.jsx("div",{className:"mx-1 mt-2",children:e.jsxs(b,{value:C,onChange:t=>Q(t.target.value),className:"larger-dropdown",children:[e.jsx("option",{value:"",children:r("LABELS.select_project")}),E.filter(t=>!n||t.typeId==n).map(t=>e.jsx("option",{value:t.value,children:t.label},t.value))]})}),e.jsx("div",{className:"mx-1 mt-2",children:e.jsx(U,{setSelectedOption:_,ReportOptions:j,selectedOption:l})}),e.jsxs("div",{className:"mx-1 mt-2 d-flex",children:[e.jsx(q,{fetchReportData:D}),e.jsx(F,{color:"info",className:"ms-2",onClick:G,children:r("LABELS.download")})]})]}),e.jsx("div",{className:"d-md-none mb-3",children:e.jsxs("div",{className:"row gy-3",children:[e.jsx("div",{className:"col-12",children:e.jsx(Me,{setStateYear:g})}),e.jsx("div",{className:"col-12",children:e.jsxs(b,{value:n,onChange:t=>Y(t.target.value),className:"larger-dropdown",children:[e.jsx("option",{value:"",children:r("LABELS.select_project_type")||"Select Project Type"}),S.map(t=>e.jsx("option",{value:t.id,children:t.name},t.id))]})}),e.jsx("div",{className:"col-12",children:e.jsxs(b,{value:C,onChange:t=>Q(t.target.value),className:"larger-dropdown",children:[e.jsx("option",{value:"",children:r("LABELS.select_project")}),E.map(t=>e.jsx("option",{value:t.value,children:t.label},t.value))]})}),e.jsx("div",{className:"col-12",children:e.jsx(U,{setSelectedOption:_,ReportOptions:j,selectedOption:l})}),e.jsxs("div",{className:"col-12 d-flex justify-content-start",children:[e.jsx(q,{fetchReportData:D}),e.jsx(F,{color:"info",className:"ms-2",onClick:G,children:r("LABELS.download")})]})]})}),(A.data.length>0||R.data.length>0)&&me(),l==="4"&&B.length>0&&xe(),e.jsx("div",{className:"mt-3",children:e.jsx(je,{selectedOption:l,salesData:A,expenseData:R,pnlData:$,expenseType:ie,productWiseData:B,onLoadMore:pe,hasMorePages:X,isFetchingMore:V,scrollCursor:te})})]})]})]})}),e.jsx("style",{jsx:!0,children:`
        .responsive-container { width: 100%; max-width: 100%; overflow-x: hidden; }
        .language-selector { margin-bottom: 10px; }
        @media (max-width: 768px) {
          .responsive-container { padding: 0 5px; }
        }
        :global(.larger-dropdown select) {
          min-width: 200px !important;
          font-size: 1.1rem !important;
          height: auto !important;
          padding: 8px 12px !important;
        }
        :global(.larger-dropdown .dropdown-toggle) {
          min-width: 200px !important;
          font-size: 1.1rem !important;
          padding: 8px 12px !important;
        }
        :global(.larger-dropdown .dropdown-menu .dropdown-item) {
          font-size: 1.1rem !important;
          padding: 8px 12px !important;
        }
        .summary-cards .card {
          border-radius: 12px;
          transition: transform 0.3s ease;
          border: 1px solid transparent;
        }
        .summary-cards .card:hover {
          transform: translateY(-5px);
        }
        .bg-primary-light {
          background-color: rgba(13, 110, 253, 0.1);
          border-color: rgba(13, 110, 253, 0.4);
        }
        .bg-danger-light {
          background-color: rgba(220, 53, 69, 0.1);
          border-color: rgba(220, 53, 69, 0.4);
        }
        .bg-success-light {
          background-color: rgba(25, 135, 84, 0.1);
          border-color: rgba(25, 135, 84, 0.4);
        }
        .bg-warning-light {
          background-color: rgba(255, 193, 7, 0.1);
          border-color: rgba(255, 193, 7, 0.4);
        }
        .icon-container {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .top-products-section .card {
          transition: all 0.3s ease;
          border: 1px solid #e3e6f0;
        }
        .top-products-section .card:hover {
          transform: translateY(-2px);
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
        }
        .badge-rank {
          font-size: 0.8rem;
          font-weight: 600;
        }
      `})]})}export{gt as default};
