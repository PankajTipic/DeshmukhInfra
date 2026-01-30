import{r as d,_ as et,h as tt,R as Re,T as at,g as st,f as rt,P as le,j as e,C as nt,b as lt}from"./index-CJXHrff7.js";import{C as $e}from"./CFormLabel-8D0Pltr5.js";import{C as Fe}from"./CFormInput-DutJdJy2.js";import{C as k}from"./CFormSelect-CK1A6__C.js";import{a as me}from"./api-CZlTOVJA.js";import{u as Se,i as ot,C as ct}from"./DefaultLayout-CNh0tT-4.js";import{a as it,b as dt}from"./index.esm-DLrlVdAB.js";import{C as mt,a as ut}from"./CCardBody-7UkCj7dm.js";import{C as pt,a as xt,b as Ae,d as ht,c as R,e as B}from"./CTable-jq9PJ4oM.js";import{C as Z}from"./CButton-BmvBNVXy.js";import{T as jt,a as ft,b as gt,c as ge,C as vt,d as yt}from"./index.esm-C713oclL.js";import{M as bt}from"./MantineProvider-C-YdUbtg.js";import"./CFormControlWrapper-NSzEXkpp.js";import"./RawMaterial-BtjEDAbB.js";import"./cil-mobile-BUM7kWOO.js";import"./emotion-react.browser.esm-DBx96lGy.js";var Nt=function(r){if(!r)return 0;var a=window.getComputedStyle(r),n=a.transitionDuration,o=a.transitionDelay,c=Number.parseFloat(n),m=Number.parseFloat(o);return!c&&!m?0:(n=n.split(",")[0],o=o.split(",")[0],(Number.parseFloat(n)+Number.parseFloat(o))*1e3)},ce=d.forwardRef(function(r,a){var n=r.children,o=r.className,c=r.itemKey,m=r.onHide,v=r.onShow,C=r.transition,D=C===void 0?!0:C,A=r.visible,u=et(r,["children","className","itemKey","onHide","onShow","transition","visible"]),w=d.useContext(jt),F=w._activeItemKey,h=w.id,b=d.useRef(),i=tt(a,b),x=d.useState(A||F===c),M=x[0],E=x[1];return d.useEffect(function(){A!==void 0&&E(A)},[A]),d.useEffect(function(){E(F===c)},[F]),Re.createElement(at,{in:M,nodeRef:b,onEnter:v,onExit:m,timeout:b.current?Nt(b.current):0},function(J){return Re.createElement("div",st({className:rt("tab-pane",{active:M,fade:D,show:J==="entered"},o),id:"".concat(h).concat(c,"-tab-pane"),role:"tabpanel","aria-labelledby":"".concat(h).concat(c,"-tab"),tabIndex:0,ref:i},u),n)})});ce.propTypes={children:le.node,className:le.string,itemKey:le.oneOfType([le.number,le.string]).isRequired,onHide:le.func,onShow:le.func,transition:le.bool,visible:le.bool};ce.displayName="CTabPanel";function Le(r){const a=Object.prototype.toString.call(r);return r instanceof Date||typeof r=="object"&&a==="[object Date]"?new r.constructor(+r):typeof r=="number"||a==="[object Number]"||typeof r=="string"||a==="[object String]"?new Date(r):new Date(NaN)}let wt={};function Ge(){return wt}function Ye(r,a){var C,D,A,u;const n=Ge(),o=(a==null?void 0:a.weekStartsOn)??((D=(C=a==null?void 0:a.locale)==null?void 0:C.options)==null?void 0:D.weekStartsOn)??n.weekStartsOn??((u=(A=n.locale)==null?void 0:A.options)==null?void 0:u.weekStartsOn)??0,c=Le(r),m=c.getDay(),v=(m<o?7:0)+m-o;return c.setDate(c.getDate()-v),c.setHours(0,0,0,0),c}var O=[];for(var Ee=0;Ee<256;++Ee)O.push((Ee+256).toString(16).slice(1));function St(r,a=0){return(O[r[a+0]]+O[r[a+1]]+O[r[a+2]]+O[r[a+3]]+"-"+O[r[a+4]]+O[r[a+5]]+"-"+O[r[a+6]]+O[r[a+7]]+"-"+O[r[a+8]]+O[r[a+9]]+"-"+O[r[a+10]]+O[r[a+11]]+O[r[a+12]]+O[r[a+13]]+O[r[a+14]]+O[r[a+15]]).toLowerCase()}var we,Lt=new Uint8Array(16);function Ct(){if(!we&&(we=typeof crypto<"u"&&crypto.getRandomValues&&crypto.getRandomValues.bind(crypto),!we))throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");return we(Lt)}var _t=typeof crypto<"u"&&crypto.randomUUID&&crypto.randomUUID.bind(crypto);const ze={randomUUID:_t};function Te(r,a,n){if(ze.randomUUID&&!a&&!r)return ze.randomUUID();r=r||{};var o=r.random||(r.rng||Ct)();return o[6]=o[6]&15|64,o[8]=o[8]&63|128,St(o)}function Ie(r,a){return r instanceof Date?new r.constructor(a):new Date(a)}function We(r,a){const n=Le(r);if(isNaN(a))return Ie(r,NaN);if(!a)return n;const o=n.getDate(),c=Ie(r,n.getTime());c.setMonth(n.getMonth()+a+1,0);const m=c.getDate();return o>=m?c:(n.setFullYear(c.getFullYear(),c.getMonth(),o),n)}function Oe(r,a){var C,D,A,u;const n=Ge(),o=(a==null?void 0:a.weekStartsOn)??((D=(C=a==null?void 0:a.locale)==null?void 0:C.options)==null?void 0:D.weekStartsOn)??n.weekStartsOn??((u=(A=n.locale)==null?void 0:A.options)==null?void 0:u.weekStartsOn)??0,c=Le(r),m=c.getDay(),v=(m<o?-7:0)+6-(m-o);return c.setDate(c.getDate()+v),c.setHours(23,59,59,999),c}function ke(r){const a=Le(r),n=a.getFullYear(),o=a.getMonth(),c=Ie(r,0);return c.setFullYear(n,o+1,0),c.setHours(0,0,0,0),c.getDate()}function Dt(r,a){return We(r,-a)}const At=e.jsx("svg",{width:"20",height:"20",viewBox:"0 0 20 20",xmlns:"http://www.w3.org/2000/svg",children:e.jsx("path",{fillRule:"evenodd",clipRule:"evenodd",d:"M7.05806 3.30806C7.30214 3.06398 7.69786 3.06398 7.94194 3.30806L14.1919 9.55806C14.436 9.80214 14.436 10.1979 14.1919 10.4419L7.94194 16.6919C7.69786 16.936 7.30214 16.936 7.05806 16.6919C6.81398 16.4479 6.81398 16.0521 7.05806 15.8081L12.8661 10L7.05806 4.19194C6.81398 3.94786 6.81398 3.55214 7.05806 3.30806Z"})}),Et=e.jsx("svg",{width:"20",height:"20",viewBox:"0 0 20 20",xmlns:"http://www.w3.org/2000/svg",children:e.jsx("path",{fillRule:"evenodd",clipRule:"evenodd",d:"M12.9419 3.30806C13.186 3.55214 13.186 3.94786 12.9419 4.19194L7.13388 10L12.9419 15.8081C13.186 16.0521 13.186 16.4479 12.9419 16.6919C12.6979 16.936 12.3021 16.936 12.0581 16.6919L5.80806 10.4419C5.56398 10.1979 5.56398 9.80214 5.80806 9.55806L12.0581 3.30806C12.3021 3.06398 12.6979 3.06398 12.9419 3.30806Z"})}),Tt=({onChange:r})=>{const[a,n]=d.useState(!1),[o,c]=d.useState(new Date),[m,v]=d.useState({firstDay:Ye(new Date,{weekStartsOn:1}),lastDay:Oe(new Date,{weekStartsOn:1})});d.useEffect(()=>{r&&r(m)},[m]);const C=()=>new Date(new Date().getFullYear(),1,29).getDate()===29,D=b=>{let i=new Date(b),x=i.getFullYear(),M=String(i.getMonth()+1).padStart(2,"0");return`${String(i.getDate()).padStart(2,"0")}.${M}.${x}`},A=b=>{let i;b.target.id.includes("prev")?(i=new Date(o.setDate(1)),c(new Date(o.setDate(1)))):b.target.id.includes("next")?(i=new Date(o.setDate(ke(o))),c(new Date(o.setDate(ke(o))))):(i=new Date(o.setDate(b.target.id)),c(new Date(o.setDate(b.target.id))));const x=Ye(i,{weekStartsOn:1}),M=Oe(i,{weekStartsOn:1});v({firstDay:x,lastDay:M})},u=["Jan.","Feb.","Mar.","Apr.","May","Jun","July","Aug.","Sep.","Oct.","Nov.","Dec."],w={1:31,2:C()?29:28,3:31,4:30,5:31,6:30,7:31,8:31,9:30,10:31,11:30,12:31},F=()=>{let b=o.getMonth()+1,i=[];for(let _=1;_<=w[b];_++){let Y=new Date(o).setDate(_),$="single-number ";new Date(m.firstDay).getTime()<=new Date(Y).getTime()&&new Date(Y).getTime()<=new Date(m.lastDay).getTime()&&($=$+"selected-week"),i.push(e.jsx("div",{id:_,className:$,onClick:A,children:_},Te()))}const x=new Date(o).setDate(1);let M=new Date(x).getDay();M<1&&(M=7);let E=[],J=new Date(o).getMonth();J===0&&(J=12);for(let _=M;_>1;_--){let Y=new Date(o).setMonth(new Date(o).getMonth()-1),$=new Date(Y).setDate(w[J]-_+2),T="single-number other-month",oe=new Date($).getTime(),X=new Date(m.firstDay).getTime(),Q=new Date(m.lastDay).getTime();oe>=X&&oe<=Q&&(T="single-number selected-week"),E.push(e.jsx("div",{onClick:A,id:"prev-"+_,className:T,children:w[J]-_+2},Te()))}let p=[],ie=35;[...E,...i].length>35&&(ie=42);for(let _=1;_<=ie-[...E,...i].length;_++){let Y="single-number other-month";const $=m.lastDay.getTime(),T=new Date(new Date(o).setDate(ke(o)));T.getTime()<=$&&m.firstDay.getMonth()===T.getMonth()&&(Y="single-number selected-week"),p.push(e.jsx("div",{onClick:A,id:"next-"+_,className:Y,children:_},Te()))}return[...E,...i,...p]},h=b=>{let i=new Date(o);b?i=We(i,1):i=Dt(i,1),c(new Date(i))};return e.jsxs("div",{className:"week-picker-display",onBlur:()=>n(!1),onClick:()=>n(!0),tabIndex:0,children:[e.jsxs("h6",{children:[D(m.firstDay),"   to   ",D(m.lastDay)]}),a&&e.jsxs("div",{className:"week-picker-options",children:[e.jsxs("div",{className:"title-week",children:[e.jsx("div",{onClick:()=>h(!1),className:"arrow-container",children:Et}),`${u[o.getMonth()]} ${o.getFullYear()}.`,e.jsx("div",{onClick:()=>h(!0),className:"arrow-container",children:At})]}),e.jsxs("div",{className:"numbers-container",children:[e.jsx("div",{className:"single-number day",children:"Mon"}),e.jsx("div",{className:"single-number day",children:"Tue"}),e.jsx("div",{className:"single-number day",children:"Wed"}),e.jsx("div",{className:"single-number day",children:"Thu"}),e.jsx("div",{className:"single-number day",children:"Fri"}),e.jsx("div",{className:"single-number day",children:"Sat"}),e.jsx("div",{className:"single-number day",children:"Sun"})]}),e.jsx("div",{className:"numbers-container",children:F()})]})]})};function Qe({setStateCustom:r}){const a=d.useRef(),n=d.useRef(),o=()=>{const c=a.current.value,m=n.current.value;c&&m&&r({start_date:c,end_date:m})};return e.jsxs("div",{className:"row mt-1",children:[e.jsx("div",{className:"col-sm-6 mb-3",children:e.jsxs("div",{className:"mb-1",children:[e.jsx($e,{htmlFor:"start_date",children:"Start Date"}),e.jsx(Fe,{type:"date",ref:a,id:"start_date",name:"start_date",placeholder:"Select Start Date",onChange:o,required:!0,feedbackInvalid:"Please select a date."})]})}),e.jsx("div",{className:"col-sm-6 mb-3",children:e.jsxs("div",{className:"mb-1",children:[e.jsx($e,{htmlFor:"end_date",children:"End Date"}),e.jsx(Fe,{type:"date",id:"end_date",ref:n,name:"end_date",onChange:o,required:!0,feedbackInvalid:"Please select a date."})]})})]})}function Ue({setStateMonth:r}){const a=i=>i%4===0&&i%100!==0||i%400===0,n=(i,x)=>x===2?a(i)?29:28:[4,6,9,11].includes(x)?30:31,o=new Date().getFullYear(),c=(new Date().getMonth()+1).toString().padStart(2,"0"),[m,v]=d.useState(o.toString()),[C,D]=d.useState(c),A=2023,u=2030,w=()=>{const i=[];for(let x=A;x<=u;x++)i.push(e.jsx("option",{value:x.toString(),children:x},x));return i},F=()=>[{value:"01",label:"January"},{value:"02",label:"February"},{value:"03",label:"March"},{value:"04",label:"April"},{value:"05",label:"May"},{value:"06",label:"June"},{value:"07",label:"July"},{value:"08",label:"August"},{value:"09",label:"September"},{value:"10",label:"October"},{value:"11",label:"November"},{value:"12",label:"December"}].map(x=>e.jsx("option",{value:x.value,children:x.label},x.value)),h=i=>{const x=i.target.value;v(x);const M=n(parseInt(x),parseInt(C));r({start_date:`${x}-${C}-01`,end_date:`${x}-${C}-${M}`})},b=i=>{const x=i.target.value;D(x);const M=n(parseInt(m),parseInt(x));r({start_date:`${m}-${x}-01`,end_date:`${m}-${x}-${M}`})};return d.useEffect(()=>{const i=m||o,x=C||c,M=n(parseInt(i),parseInt(x));r({start_date:`${i}-${x}-01`,end_date:`${i}-${x}-${M}`})},[m,C]),e.jsxs("div",{className:"d-flex mb-3",children:[e.jsx("div",{className:"flex-fill mx-1",children:e.jsx(k,{className:"pl-3","aria-label":"Select Year",value:m,onChange:h,children:w()})}),e.jsx("div",{className:"flex-fill mx-1",children:e.jsx(k,{className:"pl-3","aria-label":"Select Month",value:C,onChange:b,children:F()})})]})}function Ke({setStateQuarter:r}){const a=h=>h>=4&&h<=6?"1":h>=7&&h<=9?"2":h>=10&&h<=12?"3":"4",n=(h,b)=>{switch(b){case"1":return`${h}-04-01`;case"2":return`${h}-07-01`;case"3":return`${h}-10-01`;case"4":return`${h+1}-01-01`;default:return`${h}-04-01`}},o=(h,b)=>{switch(b){case"1":return`${h}-06-30`;case"2":return`${h}-09-30`;case"3":return`${h}-12-31`;case"4":return`${h+1}-03-31`;default:return`${h+1}-03-31`}},c=new Date().getFullYear(),m=new Date().getMonth()+1,v=m<=3?(c-1).toString():c.toString(),[C,D]=d.useState(v),[A,u]=d.useState(a(m));d.useEffect(()=>{const h=parseInt(C,10),b=n(h,A),i=o(h,A);r({start_date:b,end_date:i})},[C,A,r]);const w=h=>{D(h.target.value)},F=h=>{u(h.target.value)};return e.jsxs("div",{className:"d-flex",children:[e.jsx("div",{className:"flex-fill mx-1 col-sm-2",children:e.jsx(k,{className:"pl-3 w-100","aria-label":"Select Financial Year",value:C,onChange:w,children:Array.from({length:7},(h,b)=>e.jsx("option",{value:2023+b,children:`${2023+b}-${(2023+b+1).toString().slice(-2)}`},2023+b))})}),e.jsx("div",{className:"flex-fill mx-1 col-sm-4",children:e.jsx(k,{className:"pl-3 w-100","aria-label":"Select Quarter",value:A,onChange:F,children:[{value:"1",label:"Q1 (Apr - Jun)"},{value:"2",label:"Q2 (Jul - Sep)"},{value:"3",label:"Q3 (Oct - Dec)"},{value:"4",label:"Q4 (Jan - Mar)"}].map(h=>e.jsx("option",{value:h.value,children:h.label},h.value))})})]})}function He({setStateYear:r}){const a=new Date().getFullYear(),o=new Date().getMonth()+1<=3?(a-1).toString():a.toString(),[c,m]=d.useState(o);return d.useEffect(()=>{const v=parseInt(c,10);r({start_date:`${v}-04-01`,end_date:`${v+1}-03-31`})},[c,r]),e.jsx("div",{className:"mt-2 col-sm-2 d-flex justify-content-center",children:e.jsx("div",{className:"flex-fill mx-1",children:e.jsx(k,{className:"pl-3 w-100","aria-label":"Select Financial Year",value:c,onChange:v=>m(v.target.value),children:Array.from({length:7},(v,C)=>{const D=2023+C;return e.jsx("option",{value:D.toString(),children:`${D}-${(D+1).toString().slice(-2)}`},D)})})})})}function Je({setStateWeek:r}){const[a,n]=d.useState({firstDay:new Date,lastDay:new Date}),o=m=>{let v=new Date(m),C=v.getFullYear(),D=String(v.getMonth()+1).padStart(2,"0"),A=String(v.getDate()).padStart(2,"0");return`${C}-${D}-${A}`},c=m=>{n(m),r({start_date:o(m.firstDay),end_date:o(m.lastDay)})};return e.jsx("div",{className:"App ",children:e.jsx(Tt,{onChange:c})})}function ve({selectedOption:r,salesData:a,expenseData:n,pnlData:o,expenseType:c,productWiseData:m,onLoadMore:v,hasMorePages:C,isFetchingMore:D,scrollCursor:A}){const{t:u}=Se("global"),[w,F]=d.useState(""),[h,b]=d.useState(""),[i,x]=d.useState(!1),M=d.useRef(null),E=d.useRef(null),J=d.useRef(null),[p,ie]=d.useState({key:null,direction:"asc"});d.useEffect(()=>{const l=()=>{x(window.innerWidth<=768)};return l(),window.addEventListener("resize",l),()=>window.removeEventListener("resize",l)},[]);const _=l=>{if(!l)return"-";try{const s=new Date(l);if(isNaN(s.getTime()))return console.warn("Invalid date format:",l),l;const j=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],L=s.getDate().toString().padStart(2,"0"),U=j[s.getMonth()],z=s.getFullYear();return i?`${L}/${s.getMonth()+1}/${z.toString().slice(-2)}`:`${L} ${U} ${z}`}catch(s){return console.warn("Date formatting error:",s,"for date:",l),l}},Y=l=>{if(!l&&l!==0)return"₹0";const s=Number(l);if(i&&s>=1e3){if(s>=1e7)return`₹${(s/1e7).toFixed(1)}Cr`;if(s>=1e5)return`₹${(s/1e5).toFixed(1)}L`;if(s>=1e3)return`₹${(s/1e3).toFixed(1)}K`}return`₹${s.toLocaleString()}`},$=l=>{const s=Number(l);if(i&&s>=1e3){if(s>=1e6)return`${(s/1e6).toFixed(1)}M`;if(s>=1e3)return`${(s/1e3).toFixed(1)}K`}return s.toLocaleString()},T=l=>{let s="asc";p.key===l&&p.direction==="asc"&&(s="desc"),ie({key:l,direction:s})},oe=d.useCallback(l=>{E.current&&clearTimeout(E.current),E.current=setTimeout(()=>{F(l)},300)},[]),X=d.useCallback(()=>{J.current&&clearTimeout(J.current),J.current=setTimeout(()=>{const l=M.current;if(!l)return;const{scrollTop:s,scrollHeight:j,clientHeight:L}=l;s+L>=j-100&&C&&!D&&v&&v()},100)},[C,D,v]);d.useEffect(()=>()=>{E.current&&clearTimeout(E.current),J.current&&clearTimeout(J.current)},[]);const Q=l=>{if(!l)return new Date(0);const s=new Date(l);return isNaN(s.getTime())?new Date(0):s},ne=()=>{let l=[];switch(r){case"1":return l=(a==null?void 0:a.data)||[],console.log("Income Report Data:",l),[...l].sort((s,j)=>Q(j.date)-Q(s.date));case"2":return l=(n==null?void 0:n.data)||[],[...l].sort((s,j)=>Q(j.expenseDate)-Q(s.expenseDate));case"3":return l=(o==null?void 0:o.Data)||[],[...l].sort((s,j)=>Q(j.date)-Q(s.date));case"4":return Array.isArray(m)?m:m!=null&&m.data&&Array.isArray(m.data)?m.data:[];default:return[]}},de=d.useMemo(()=>{let l=ne();return!l||!Array.isArray(l)?(console.warn("No valid data for filtering:",l),[]):(w.trim()&&(l=l.filter(s=>{switch(r){case"1":return s.date&&_(s.date).toLowerCase().includes(w.toLowerCase())||s.projectName&&s.projectName.toLowerCase().includes(w.toLowerCase())||s.totalIncomeAmount&&s.totalIncomeAmount.toString().includes(w);case"2":return s.expenseDate&&_(s.expenseDate).toLowerCase().includes(w.toLowerCase())||s.projectName&&s.projectName.toLowerCase().includes(w.toLowerCase())||s.totalExpense&&s.totalExpense.toString().includes(w);case"3":return s.date&&_(s.date).toLowerCase().includes(w.toLowerCase())||s.projectName&&s.projectName.toLowerCase().includes(w.toLowerCase())||s.totalIncome&&s.totalIncome.toString().includes(w)||s.totalExpenses&&s.totalExpenses.toString().includes(w)||s.profitLoss&&s.profitLoss.toString().includes(w);case"4":return s.projectName&&s.projectName.toLowerCase().includes(w.toLowerCase())||s.product_name&&s.product_name.toLowerCase().includes(w.toLowerCase())||s.dPrice&&s.dPrice.toString().includes(w)||s.totalQty&&s.totalQty.toString().includes(w)||s.totalRevenue&&s.totalRevenue.toString().includes(w);default:return!0}})),p.key&&(l=[...l].sort((s,j)=>{let L=s[p.key],U=j[p.key];return["date","expenseDate"].includes(p.key)&&(L=Q(L),U=Q(U)),L==null&&U==null?0:L==null?p.direction==="asc"?-1:1:U==null?p.direction==="asc"?1:-1:typeof L=="number"&&typeof U=="number"?p.direction==="asc"?L-U:U-L:p.direction==="asc"?String(L).localeCompare(String(U)):String(U).localeCompare(String(L))})),console.log("Filtered Data:",l),l)},[ne,w,p,r,i]),ye=()=>{if(w)return u("LABELS.no_results_found")||"No results found for your search";switch(r){case"1":return u("MSG.no_income_data")||"No income data available";case"2":return u("MSG.no_expense_data")||"No expense data available";case"3":return u("MSG.no_pnl_data")||"No profit/loss data available";case"4":return u("MSG.no_product_data")||"No product data available";default:return"No data available"}},ue=()=>{switch(r){case"1":return u("LABELS.search_income_logs")||"Search income data...";case"2":return u("LABELS.search_expenses")||"Search expense data...";case"3":return u("LABELS.search_pnl")||"Search profit & loss data...";case"4":return u("LABELS.search_products")||"Search product data...";default:return u("LABELS.search_data")||"Search data..."}},be=l=>{const s=l.target.value;b(s),oe(s)},pe=()=>{b(""),F(""),E.current&&clearTimeout(E.current)},Ne=()=>{const l=L=>p.key===L?p.direction==="asc"?"↑":"↓":"↕",s=L=>({marginLeft:i?"4px":"8px",fontSize:i?"14px":"18px",opacity:p.key===L?1:.5,color:p.key===L?"#0d6efd":"#6c757d"}),j={cursor:"pointer",fontSize:i?"0.75rem":"0.875rem"};switch(r){case"1":return e.jsxs(e.Fragment,{children:[e.jsxs(R,{onClick:()=>T("projectName"),style:j,children:[i?"Project":u("LABELS.project_name")||"Project Name",e.jsx("span",{style:s("projectName"),children:l("projectName")})]}),e.jsxs(R,{onClick:()=>T("projectType"),style:j,children:[u("LABELS.project_type")||"Type",e.jsx("span",{style:s("projectType"),children:l("projectType")})]}),e.jsxs(R,{onClick:()=>T("date"),style:j,children:[u("LABELS.date")||"Date",e.jsx("span",{style:s("date"),children:l("date")})]}),e.jsxs(R,{onClick:()=>T("totalIncomeAmount"),style:j,children:[i?"Amount":"Total Income Amount",e.jsx("span",{style:s("totalIncomeAmount"),children:l("totalIncomeAmount")})]})]});case"2":return e.jsxs(e.Fragment,{children:[e.jsxs(R,{onClick:()=>T("projectName"),style:j,children:[i?"Project":u("LABELS.project_name")||"Project Name",e.jsx("span",{style:s("projectName"),children:l("projectName")})]}),e.jsxs(R,{onClick:()=>T("projectType"),style:j,children:[u("LABELS.project_type")||"Type",e.jsx("span",{style:s("projectType"),children:l("projectType")})]}),e.jsxs(R,{onClick:()=>T("expenseDate"),style:j,children:[u("LABELS.expense_date")||"Date",e.jsx("span",{style:s("expenseDate"),children:l("expenseDate")})]}),e.jsxs(R,{onClick:()=>T("totalExpense"),style:j,children:[i?"Expense":u("LABELS.total_expense")||"Total Expense",e.jsx("span",{style:s("totalExpense"),children:l("totalExpense")})]})]});case"3":return e.jsxs(e.Fragment,{children:[e.jsxs(R,{onClick:()=>T("projectName"),style:j,children:[i?"Project":u("LABELS.project_name")||"Project Name",e.jsx("span",{style:s("projectName"),children:l("projectName")})]}),e.jsxs(R,{onClick:()=>T("projectType"),style:j,children:[u("LABELS.project_type")||"Type",e.jsx("span",{style:s("projectType"),children:l("projectType")})]}),e.jsxs(R,{onClick:()=>T("date"),style:j,children:[u("LABELS.date")||"Date",e.jsx("span",{style:s("date"),children:l("date")})]}),e.jsxs(R,{onClick:()=>T("totalIncome"),style:j,children:[i?"Income":u("LABELS.income_grand_total")||"Income Total",e.jsx("span",{style:s("totalIncome"),children:l("totalIncome")})]}),e.jsxs(R,{onClick:()=>T("totalExpenses"),style:j,children:[i?"Expenses":u("LABELS.total_expenses")||"Total Expenses",e.jsx("span",{style:s("totalExpenses"),children:l("totalExpenses")})]})]});case"4":return e.jsxs(e.Fragment,{children:[e.jsxs(R,{onClick:()=>T("projectName"),style:j,children:[i?"Project":u("LABELS.project_name")||"Project Name",e.jsx("span",{style:s("projectName"),children:l("projectName")})]}),e.jsxs(R,{onClick:()=>T("projectType"),style:j,children:[u("LABELS.project_type")||"Type",e.jsx("span",{style:s("projectType"),children:l("projectType")})]}),e.jsxs(R,{onClick:()=>T("product_name"),style:j,children:[i?"Product":u("LABELS.product_name")||"Product Name",e.jsx("span",{style:s("product_name"),children:l("product_name")})]}),e.jsxs(R,{onClick:()=>T("dPrice"),style:j,children:[i?"Price":u("LABELS.unit_price")||"Unit Price",e.jsx("span",{style:s("dPrice"),children:l("dPrice")})]}),e.jsxs(R,{onClick:()=>T("totalQty"),style:j,children:[i?"Qty":u("LABELS.quantity")||"Quantity",e.jsx("span",{style:s("totalQty"),children:l("totalQty")})]}),e.jsxs(R,{onClick:()=>T("totalRevenue"),style:j,children:[i?"Revenue":u("LABELS.total_revenue")||"Total Revenue",e.jsx("span",{style:s("totalRevenue"),children:l("totalRevenue")})]})]});default:return null}},xe=()=>{const l=de;if(l.length===0){const s=r==="1"||r==="2"?4:6;return e.jsx(Ae,{children:e.jsx(B,{colSpan:s,className:"text-center empty-message",children:ye()})})}return l.map((s,j)=>e.jsxs(Ae,{className:"data-row",children:[r==="1"&&e.jsxs(e.Fragment,{children:[e.jsx(B,{className:"project-cell",children:e.jsx("div",{className:"cell-wrapper",children:e.jsx("span",{className:"truncate-text",title:s.projectName,children:s.projectName||"-"})})}),e.jsx(B,{className:"project-type-cell",children:s.projectType||"-"}),e.jsx(B,{className:"date-cell",children:_(s.date)}),e.jsx(B,{className:"amount-cell",children:e.jsx("span",{className:"amount-value",children:Y(s.totalIncomeAmount)})})]}),r==="2"&&e.jsxs(e.Fragment,{children:[e.jsx(B,{className:"project-cell",children:e.jsx("div",{className:"cell-wrapper",children:e.jsx("span",{className:"truncate-text",title:s.projectName,children:s.projectName||"-"})})}),e.jsx(B,{className:"project-type-cell",children:s.projectType||"-"}),e.jsx(B,{className:"date-cell",children:_(s.expenseDate)}),e.jsx(B,{className:"amount-cell",children:e.jsx("span",{className:"amount-value",children:Y(s.totalExpense)})})]}),r==="3"&&e.jsxs(e.Fragment,{children:[e.jsx(B,{className:"project-cell",children:e.jsx("div",{className:"cell-wrapper",children:e.jsx("span",{className:"truncate-text",title:s.projectName,children:s.projectName||"-"})})}),e.jsx(B,{className:"project-type-cell",children:s.projectType||"-"}),e.jsx(B,{className:"date-cell",children:_(s.date)}),e.jsx(B,{className:"amount-cell",children:e.jsx("span",{className:"amount-value",children:Y(s.totalIncome)})}),e.jsx(B,{className:"amount-cell",children:e.jsx("span",{className:"amount-value",children:Y(s.totalExpenses)})})]}),r==="4"&&e.jsxs(e.Fragment,{children:[e.jsx(B,{className:"project-cell",children:e.jsx("div",{className:"cell-wrapper",children:e.jsx("span",{className:"truncate-text",title:s.projectName,children:s.projectName||"-"})})}),e.jsx(B,{className:"project-type-cell",children:s.projectType||"-"}),e.jsx(B,{className:"product-cell",children:e.jsx("div",{className:"cell-wrapper",children:e.jsx("span",{className:"truncate-text",title:s.product_name,children:s.product_name||"-"})})}),e.jsx(B,{className:"amount-cell",children:e.jsx("span",{className:"amount-value",children:Y(s.dPrice)})}),e.jsx(B,{className:"quantity-cell",children:$(s.totalQty)}),e.jsx(B,{className:"amount-cell",children:e.jsx("span",{className:"amount-value revenue",children:Y(s.totalRevenue)})})]})]},j))};return e.jsxs(e.Fragment,{children:[e.jsx("style",{jsx:!0,children:`
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
      `}),e.jsx(it,{children:e.jsx(dt,{xs:12,children:e.jsxs(mt,{className:"mb-4",children:[e.jsxs("div",{className:"custom-card-header",children:[e.jsxs("div",{className:"header-left",children:[e.jsxs("div",{className:"header-search-container",children:[e.jsx("input",{type:"text",className:"header-search-input",placeholder:ue(),value:h,onChange:be}),e.jsx("div",{className:"header-search-icon",children:"🔍"}),h&&e.jsx("button",{className:"header-clear-search",onClick:pe,title:u("LABELS.clear_search")||"Clear search",children:"×"})]}),w&&e.jsxs("div",{className:"search-results-info",children:[de.length," ",u("LABELS.results_found")||"results found for",' "',w,'"']})]}),e.jsxs("div",{className:"records-count",children:[de.length," ",u("LABELS.records")||"records"]})]}),e.jsx(ut,{className:"p-0",children:e.jsxs("div",{className:"table-container",ref:M,onScroll:X,children:[e.jsxs(pt,{className:"reports-table",children:[e.jsx(xt,{children:e.jsx(Ae,{children:Ne()})}),e.jsx(ht,{children:xe()})]}),D&&e.jsxs("div",{className:"loading-more",children:[e.jsx(nt,{color:"primary",size:"sm"}),e.jsx("span",{className:"ms-2 text-muted",children:u("MSG.loading")||"Loading more..."})]})]})})]})})})]})}function se({ReportOptions:r,selectedOption:a,setSelectedOption:n}){const{t:o,ready:c}=Se("global");if(!c)return e.jsx("div",{children:o("LABELS.loading")});const m=[...r];return e.jsx("div",{children:e.jsx(k,{id:"report-select",options:m,value:a,onChange:v=>n(v.target.value)})})}function re({fetchReportData:r}){const{t:a,ready:n}=Se("global");return n?e.jsx("div",{children:e.jsx(Z,{color:"success",onClick:r,children:a("LABELS.fetch_report")})}):e.jsx("div",{children:a("LABELS.loading")})}function Gt({companyId:r}){const{t:a}=Se("global"),[n,o]=d.useState("3"),[c,m]=d.useState(""),[v,C]=d.useState([]),[D,A]=d.useState({start_date:"",end_date:""}),[u,w]=d.useState({start_date:"",end_date:""}),[F,h]=d.useState({start_date:"",end_date:""}),[b,i]=d.useState({start_date:"",end_date:""}),[x,M]=d.useState("Year"),[E,J]=d.useState([]),[p,ie]=d.useState(""),[_,Y]=d.useState({start_date:"",end_date:""}),{showToast:$}=lt(),[T,oe]=d.useState(1),[X,Q]=d.useState(!1),[ne,de]=d.useState(!1),[ye,ue]=d.useState(null),[be,pe]=d.useState(null),[Ne,xe]=d.useState(null),[l,s]=d.useState(null),j=[{label:a("LABELS.incomeReport")||"Income Report",value:"1"},{label:a("LABELS.expenseReport")||"Expense Report",value:"2"},{label:a("LABELS.profit_loss")||"Profit and Loss",value:"3"}],[L,U]=d.useState({data:[],totalIncomeAmount:0,totalTaxAmount:0}),[z,Ce]=d.useState([]),[G,_e]=d.useState({data:[],totalExpense:0}),[V,De]=d.useState({Data:[],totalIncome:0,totalTax:0,totalExpenses:0,totalProfitLoss:0});d.useEffect(()=>{(async()=>{try{const[y,f]=await Promise.all([me(`/api/projects${r?`?companyId=${r}`:""}`),me("/api/project-types")]);if(y&&Array.isArray(y)){const q=y.map(K=>({value:K.id,label:K.project_name,typeId:K.project_type_id}));C(q)}else if(y&&Array.isArray(y.data)){const q=y.data.map(K=>({value:K.id,label:K.project_name,typeId:K.project_type_id}));C(q)}else $("danger",a("MSG.failed_fetch_projects")||"Failed to fetch projects");f&&Array.isArray(f)&&J(f)}catch(y){console.error("Error fetching data:",y),$("danger",a("MSG.failed_fetch_projects")||"Failed to fetch projects")}})()},[r,a]),d.useEffect(()=>{if(x==="Month"&&n==="3"&&u.start_date&&u.end_date){const t=new Date(u.start_date).getFullYear();(async()=>{try{const f=await me(`/api/monthlyIncomeSummaries?year=${t}`);f.success&&s(f)}catch(f){console.error(f)}})()}else s(null)},[x,n,u]);const Ve=t=>{M(t),U({data:[],totalIncomeAmount:0,totalTaxAmount:0}),_e({data:[],totalExpense:0}),De({Data:[],totalIncome:0,totalTax:0,totalExpenses:0,totalProfitLoss:0}),Ce([]),oe(1),Q(!1),ue(null),pe(null),xe(null)},ee=t=>{m(t),Me()},te=t=>{ie(t),m(""),Me()},Me=()=>{U({data:[],totalIncomeAmount:0,totalTaxAmount:0}),_e({data:[],totalExpense:0}),De({Data:[],totalIncome:0,totalTax:0,totalExpenses:0,totalProfitLoss:0}),Ce([]),oe(1),Q(!1),ue(null),pe(null),xe(null)},Pe=()=>{if(!Array.isArray(z)||z.length===0)return[];const t=z.reduce((y,f)=>y+(Number(f.totalRevenue)||0),0);return z.sort((y,f)=>(Number(f.totalRevenue)||0)-(Number(y.totalRevenue)||0)).slice(0,3).map(y=>({...y,percentage:t>0?Math.round(Number(y.totalRevenue)/t*100):0}))},qe=()=>{const t=Pe();if(t.length===0)return{labels:[],datasets:[{data:[],backgroundColor:[],borderWidth:2}]};const y=["#FF6B6B","#4ECDC4","#45B7D1"];return{labels:t.map(f=>f.product_name),datasets:[{data:t.map(f=>Number(f.totalRevenue)||0),backgroundColor:y.slice(0,t.length),borderColor:"#fff",borderWidth:2}]}},Ze=()=>{if(!l)return null;const y={labels:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],datasets:[{label:"Income",data:l.monthlySales,backgroundColor:"rgba(13, 110, 253, 0.6)"},{label:"Expenses",data:l.monthlyExpense,backgroundColor:"rgba(220, 53, 69, 0.6)"},{label:"P&L",data:l.monthlyPandL,backgroundColor:"rgba(25, 135, 84, 0.6)"}]};return e.jsx("div",{className:"monthly-summary row mt-4",children:e.jsx("div",{className:"col-12",children:e.jsxs("div",{className:"card",children:[e.jsx("div",{className:"card-header",children:a("LABELS.monthly_summary")||"Monthly Summary"}),e.jsx("div",{className:"card-body",children:e.jsx(vt,{data:y})})]})})})};d.useEffect(()=>{if(x!=="Custom"){let t=!1;switch(x){case"Year":t=b.start_date&&b.end_date;break;case"Quarter":t=F.start_date&&F.end_date;break;case"Month":t=u.start_date&&u.end_date;break;case"Week":t=_.start_date&&_.end_date;break}if(t){const y=setTimeout(()=>{Xe()},100);return()=>clearTimeout(y)}}},[x,b,F,u,_,c,p]);const W=async(t=1,y=!1)=>{try{de(t>1);let f={},q=[],K=[];switch(x){case"Custom":f=D;break;case"Month":f=u;break;case"Quarter":f=F;break;case"Year":f=b;break;case"Week":f=_;break;default:break}if(!f.start_date||!f.end_date){$("warning",a("MSG.select_dates")||"Please select dates");return}const H=new URLSearchParams;if(H.append("startDate",f.start_date),H.append("endDate",f.end_date),H.append("perPage","370"),c&&H.append("projectId",c),p&&H.append("project_type_id",p),n==="1"||n==="3"){const N=new URLSearchParams(H);ye&&N.append("cursor",ye);const I=await me(`/api/incomeSummaryReport?${N.toString()}`);if(I&&I.incomes){const g=I.incomes.map(S=>({date:S.date,projectName:S.project_name||"Unknown Project",totalIncomeAmount:Number(S.totalIncomeAmount)||0,taxAmount:Number(S.taxAmount)||0,projectType:S.project_type||"N/A"}));q=[...g],U(S=>{var P,Be;return{data:y?[...S.data,...g]:g,totalIncomeAmount:(P=I.summary)!=null&&P.totalIncomeAmount?Number(I.summary.totalIncomeAmount):S.totalIncomeAmount||0,totalTaxAmount:(Be=I.summary)!=null&&Be.totalTaxAmount?Number(I.summary.totalTaxAmount):S.totalTaxAmount||0}}),Q(I.has_more_pages||!1),ue(I.next_cursor||null)}else $("danger",a("MSG.failed_fetch_income_logs")||"Failed to fetch income logs")}if(n==="2"||n==="3"){const N=new URLSearchParams(H);be&&N.append("cursor",be);const I=await me(`/api/expense-report?${N.toString()}`);if(I&&I.data){const g=I.data.map(S=>({id:S.id,expenseDate:S.expense_date,totalExpense:Number(S.total_expense)||0,projectName:S.project_name||"Unknown Project",projectType:S.project_type||"N/A"}));K=[...g],_e(S=>({data:y?[...S.data,...g]:g,totalExpense:Number(I.total_expense)||0})),Q(I.has_more_pages||!1),pe(I.next_cursor||null)}else $("danger",a("MSG.failed_fetch_expense")||"Failed to fetch expenses")}if(n==="4"){const N=await me(`/api/reportProductWiseEarnings?startDate=${f.start_date}&endDate=${f.end_date}&perPage=370${Ne?`&cursor=${Ne}`:""}${H?`&${H.toString()}`:""}`);if(N&&Array.isArray(N.data)){const I=N.data.map(g=>({product_id:g.id,product_name:g.product_name,dPrice:Number(g.product_dPrice)||0,totalQty:Number(g.totalQty)||0,totalRevenue:Number(g.totalRevenue)||0,projectName:g.project_name||"Unknown Project"}));Ce(g=>{const S=Array.isArray(g)?g:(g==null?void 0:g.data)||[];return y?[...S,...I]:I}),Q(N.has_more_pages||!1),xe(N.next_cursor||null)}else $("danger",a("MSG.invalid_product_data_format")||"Invalid product data format")}if(n==="3"){const N=new Map;q.forEach(g=>{const S=`${g.date}|${g.projectName}`;N.set(S,{date:g.date,projectName:g.projectName,totalIncome:g.totalIncomeAmount,totalTax:g.taxAmount,totalExpenses:0,profitLoss:g.totalIncomeAmount-g.taxAmount,projectType:g.projectType})}),K.forEach(g=>{const S=`${g.expenseDate}|${g.projectName}`,P=N.get(S)||{date:g.expenseDate,projectName:g.projectName,totalIncome:0,totalTax:0,totalExpenses:0,profitLoss:0,projectType:g.projectType};P.totalExpenses+=g.totalExpense,P.profitLoss=P.totalIncome-P.totalTax-P.totalExpenses,N.set(S,P)});const I=Array.from(N.values());De(g=>({Data:y?[...g.Data,...I]:I,totalIncome:q.reduce((S,P)=>S+(Number(P.totalIncomeAmount)||0),0),totalTax:q.reduce((S,P)=>S+(Number(P.taxAmount)||0),0),totalExpenses:K.reduce((S,P)=>S+(Number(P.totalExpense)||0),0),totalProfitLoss:q.reduce((S,P)=>S+(Number(P.totalIncomeAmount)-Number(P.taxAmount)||0),0)-K.reduce((S,P)=>S+(Number(P.totalExpense)||0),0)}))}}catch(f){console.error("Error fetching report data:",f),$("danger",a("MSG.error_fetching_data")||"Error fetching data")}finally{de(!1)}},Xe=()=>{W(1,!1)},he=()=>{X&&!ne&&(oe(t=>t+1),W(T+1,!0))},je=()=>{if(n==="1")return e.jsxs("div",{className:"summary-cards row g-3",children:[e.jsx("div",{className:"col-md-6 col-lg-4",children:e.jsx("div",{className:"card bg-primary-light",children:e.jsxs("div",{className:"card-body d-flex align-items-center",children:[e.jsx("div",{className:"icon-container me-3",children:e.jsx("i",{className:"bi bi-currency-rupee"})}),e.jsxs("div",{children:[e.jsx("h6",{className:"card-title mb-1",children:a("LABELS.total_income_amount")||"Total Income Amount"}),e.jsxs("h4",{className:"card-text",children:["₹",L.totalIncomeAmount.toLocaleString()]})]})]})})}),e.jsx("div",{className:"col-md-6 col-lg-4",children:e.jsx("div",{className:"card bg-info-light",children:e.jsxs("div",{className:"card-body d-flex align-items-center",children:[e.jsx("div",{className:"icon-container me-3",children:e.jsx("i",{className:"bi bi-percent"})}),e.jsxs("div",{children:[e.jsx("h6",{className:"card-title mb-1",children:"Total Tax Collected"}),e.jsxs("h4",{className:"card-text",children:["₹",L.totalTaxAmount.toLocaleString()]})]})]})})})]});if(n==="2")return e.jsx("div",{className:"summary-cards row g-3",children:e.jsx("div",{className:"col-md-6 col-lg-4",children:e.jsx("div",{className:"card bg-danger-light",children:e.jsxs("div",{className:"card-body d-flex align-items-center",children:[e.jsx("div",{className:"icon-container me-3",children:e.jsx("i",{className:"bi bi-currency-rupee"})}),e.jsxs("div",{children:[e.jsx("h6",{className:"card-title mb-1",children:a("LABELS.total_expense")||"Total Expense"}),e.jsxs("h4",{className:"card-text",children:["₹",G.totalExpense.toLocaleString()]})]})]})})})});if(n==="3"){const t=V.totalProfitLoss>=0,y=Math.abs(V.totalProfitLoss).toLocaleString(),f=t?"+":"-";return e.jsxs("div",{className:"summary-cards row g-3",children:[e.jsx("div",{className:"col-md-3",children:e.jsx("div",{className:"card bg-primary-light",children:e.jsxs("div",{className:"card-body d-flex align-items-center",children:[e.jsx("div",{className:"icon-container me-3",children:e.jsx("i",{className:"bi bi-currency-rupee"})}),e.jsxs("div",{children:[e.jsx("h6",{className:"card-title mb-1",children:"Income"}),e.jsxs("h5",{className:"card-text",children:["₹",V.totalIncome.toLocaleString()]})]})]})})}),e.jsx("div",{className:"col-md-3",children:e.jsx("div",{className:"card bg-info-light",children:e.jsxs("div",{className:"card-body d-flex align-items-center",children:[e.jsx("div",{className:"icon-container me-3",children:e.jsx("i",{className:"bi bi-percent"})}),e.jsxs("div",{children:[e.jsx("h6",{className:"card-title mb-1",children:"Tax Deducted"}),e.jsxs("h5",{className:"card-text",children:["₹",V.totalTax.toLocaleString()]})]})]})})}),e.jsx("div",{className:"col-md-3",children:e.jsx("div",{className:"card bg-danger-light",children:e.jsxs("div",{className:"card-body d-flex align-items-center",children:[e.jsx("div",{className:"icon-container me-3",children:e.jsx("i",{className:"bi bi-currency-rupee"})}),e.jsxs("div",{children:[e.jsx("h6",{className:"card-title mb-1",children:"Expenses"}),e.jsxs("h5",{className:"card-text",children:["₹",V.totalExpenses.toLocaleString()]})]})]})})}),e.jsx("div",{className:"col-md-3",children:e.jsx("div",{className:`card ${t?"bg-success-light":"bg-danger-light"}`,children:e.jsxs("div",{className:"card-body d-flex align-items-center",children:[e.jsx("div",{className:"icon-container me-3",children:e.jsx("i",{className:"bi bi-currency-rupee"})}),e.jsxs("div",{children:[e.jsx("h6",{className:"card-title mb-1",children:t?a("LABELS.profit")||"Profit":a("LABELS.loss")||"Loss"}),e.jsxs("h4",{className:"card-text",children:[f,"₹",y]})]})]})})})]})}return null},fe=()=>{const t=Pe();return e.jsxs("div",{className:"top-products-section row mt-4",children:[e.jsx("div",{className:"col-md-6",children:e.jsxs("div",{className:"card",children:[e.jsx("div",{className:"card-header",children:a("LABELS.top_products")}),e.jsx("div",{className:"card-body",children:t.map((y,f)=>e.jsxs("div",{className:"d-flex justify-content-between align-items-center mb-3",children:[e.jsxs("div",{children:[e.jsx(ct,{color:["primary","success","info"][f],className:"badge-rank me-2",children:f+1}),y.product_name]}),e.jsxs("div",{className:"text-end",children:[e.jsxs("strong",{children:["₹",Number(y.totalRevenue).toLocaleString()]}),e.jsxs("small",{className:"text-muted ms-2",children:["(",y.percentage,"%)"]})]})]},f))})]})}),e.jsx("div",{className:"col-md-6",children:e.jsxs("div",{className:"card",children:[e.jsx("div",{className:"card-header",children:a("LABELS.revenue_distribution")}),e.jsx("div",{className:"card-body",children:e.jsx(yt,{data:qe()})})]})})]})},ae=()=>{let t="",y=[],f=[];if(n==="1"?(y=["Date","Project","Project Type","Income Amount","Tax Amount"],f=L.data.map(N=>[N.date,N.projectName,N.projectType||"N/A",N.totalIncomeAmount,N.taxAmount||0])):n==="2"?(y=["Expense Date","Project","Project Type","Expense Amount"],f=G.data.map(N=>[N.expenseDate,N.projectName,N.projectType||"N/A",N.totalExpense])):n==="3"&&(y=["Date","Project","Project Type","Total Income","Total Tax","Total Expenses","Profit/Loss"],f=V.Data.map(N=>[N.date,N.projectName,N.projectType||"N/A",N.totalIncome,N.totalTax,N.totalExpenses,N.profitLoss])),f.length===0){$("warning",a("MSG.no_data_to_download")||"No data available to download");return}t+=y.join(",")+`
`,f.forEach(N=>{t+=N.map(I=>`"${I??""}"`).join(",")+`
`});const q=new Blob([t],{type:"text/csv;charset=utf-8;"}),K=URL.createObjectURL(q),H=document.createElement("a");H.href=K,H.setAttribute("download","report.csv"),document.body.appendChild(H),H.click(),document.body.removeChild(H),URL.revokeObjectURL(K)};return e.jsxs(bt,{children:[e.jsx("div",{className:"responsive-container",children:e.jsxs(ft,{activeItemKey:x,onChange:Ve,children:[e.jsxs(gt,{variant:"tabs",className:"mb-3",children:[e.jsx(ge,{itemKey:"Year",children:a("LABELS.year")}),e.jsx(ge,{itemKey:"Quarter",children:a("LABELS.quarter")}),e.jsx(ge,{itemKey:"Month",children:a("LABELS.month")}),e.jsx(ge,{itemKey:"Week",children:a("LABELS.week")}),e.jsx(ge,{itemKey:"Custom",children:a("LABELS.custom")})]}),e.jsxs(ot,{children:[e.jsxs(ce,{className:"p-3",itemKey:"Custom",children:[e.jsxs("div",{className:"d-none d-md-flex mb-3 justify-content-between flex-wrap",children:[e.jsx("div",{className:"flex-fill mx-1",children:e.jsx(Qe,{setStateCustom:A})}),e.jsx("div",{className:"flex-fill mx-1",children:e.jsxs(k,{value:p,onChange:t=>te(t.target.value),className:"larger-dropdown",children:[e.jsx("option",{value:"",children:a("LABELS.select_project_type")||"Select Project Type"}),E.map(t=>e.jsx("option",{value:t.id,children:t.name},t.id))]})}),e.jsx("div",{className:"flex-fill mx-1",children:e.jsxs(k,{value:c,onChange:t=>ee(t.target.value),className:"larger-dropdown",children:[e.jsx("option",{value:"",children:a("LABELS.select_project")}),v.filter(t=>!p||t.typeId==p).map(t=>e.jsx("option",{value:t.value,children:t.label},t.value))]})}),e.jsx("div",{className:"flex-fill mx-1",children:e.jsx(se,{setSelectedOption:o,ReportOptions:j,selectedOption:n})}),e.jsxs("div",{className:"flex-fill mx-1 d-flex",children:[e.jsx(re,{fetchReportData:W}),e.jsx(Z,{color:"info",className:"ms-2",style:{height:"38px"},onClick:ae,children:a("LABELS.download")})]})]}),e.jsx("div",{className:"d-md-none mb-3",children:e.jsxs("div",{className:"row gy-3",children:[e.jsx("div",{className:"col-12",children:e.jsx(Qe,{setStateCustom:A})}),e.jsx("div",{className:"col-12",children:e.jsxs(k,{value:p,onChange:t=>te(t.target.value),className:"larger-dropdown",children:[e.jsx("option",{value:"",children:a("LABELS.select_project_type")||"Select Project Type"}),E.map(t=>e.jsx("option",{value:t.id,children:t.name},t.id))]})}),e.jsx("div",{className:"col-12",children:e.jsxs(k,{value:c,onChange:t=>ee(t.target.value),className:"larger-dropdown",children:[e.jsx("option",{value:"",children:a("LABELS.select_project")}),v.filter(t=>!p||t.typeId==p).map(t=>e.jsx("option",{value:t.value,children:t.label},t.value))]})}),e.jsx("div",{className:"col-12",children:e.jsx(se,{setSelectedOption:o,ReportOptions:j,selectedOption:n})}),e.jsxs("div",{className:"col-12 d-flex justify-content-start",children:[e.jsx(re,{fetchReportData:W}),e.jsx(Z,{color:"info",className:"ms-2",onClick:ae,children:a("LABELS.download")})]})]})}),(L.data.length>0||G.data.length>0)&&je(),n==="4"&&z.length>0&&fe(),e.jsx("div",{className:"mt-3",children:e.jsx(ve,{selectedOption:n,salesData:L,expenseData:G,pnlData:V,expenseType:{},productWiseData:z,onLoadMore:he,hasMorePages:X,isFetchingMore:ne,scrollCursor:null})})]}),e.jsxs(ce,{className:"p-3",itemKey:"Month",children:[e.jsxs("div",{className:"d-none d-md-flex mb-3 justify-content-between flex-wrap",children:[e.jsx("div",{className:"flex-fill mx-1",children:e.jsx(Ue,{setStateMonth:w})}),e.jsx("div",{className:"flex-fill mx-1",children:e.jsxs(k,{value:p,onChange:t=>te(t.target.value),className:"larger-dropdown",children:[e.jsx("option",{value:"",children:a("LABELS.select_project_type")||"Select Project Type"}),E.map(t=>e.jsx("option",{value:t.id,children:t.name},t.id))]})}),e.jsx("div",{className:"flex-fill mx-1",children:e.jsxs(k,{value:c,onChange:t=>ee(t.target.value),className:"larger-dropdown",children:[e.jsx("option",{value:"",children:a("LABELS.select_project")}),v.filter(t=>!p||t.typeId==p).map(t=>e.jsx("option",{value:t.value,children:t.label},t.value))]})}),e.jsx("div",{className:"flex-fill mx-1",children:e.jsx(se,{setSelectedOption:o,ReportOptions:j,selectedOption:n})}),e.jsxs("div",{className:"flex-fill mx-1 d-flex",children:[e.jsx(re,{fetchReportData:W}),e.jsx(Z,{color:"info",className:"ms-2",style:{height:"38px"},onClick:ae,children:a("LABELS.download")})]})]}),e.jsx("div",{className:"d-md-none mb-3",children:e.jsxs("div",{className:"row gy-3",children:[e.jsx("div",{className:"col-12",children:e.jsx(Ue,{setStateMonth:w})}),e.jsx("div",{className:"col-12",children:e.jsxs(k,{value:p,onChange:t=>te(t.target.value),className:"larger-dropdown",children:[e.jsx("option",{value:"",children:a("LABELS.select_project_type")||"Select Project Type"}),E.map(t=>e.jsx("option",{value:t.id,children:t.name},t.id))]})}),e.jsx("div",{className:"col-12",children:e.jsxs(k,{value:c,onChange:t=>ee(t.target.value),className:"larger-dropdown",children:[e.jsx("option",{value:"",children:a("LABELS.select_project")}),v.filter(t=>!p||t.typeId==p).map(t=>e.jsx("option",{value:t.value,children:t.label},t.value))]})}),e.jsx("div",{className:"col-12",children:e.jsx(se,{setSelectedOption:o,ReportOptions:j,selectedOption:n})}),e.jsxs("div",{className:"col-12 d-flex justify-content-start",children:[e.jsx(re,{fetchReportData:W}),e.jsx(Z,{color:"info",className:"ms-2",onClick:ae,children:a("LABELS.download")})]})]})}),(L.data.length>0||G.data.length>0)&&je(),n==="3"&&l&&Ze(),n==="4"&&z.length>0&&fe(),e.jsx("div",{className:"mt-3",children:e.jsx(ve,{selectedOption:n,salesData:L,expenseData:G,pnlData:V,expenseType:{},productWiseData:z,onLoadMore:he,hasMorePages:X,isFetchingMore:ne,scrollCursor:null})})]}),e.jsxs(ce,{className:"p-3",itemKey:"Quarter",children:[e.jsxs("div",{className:"d-none d-md-flex mb-3 justify-content-between flex-wrap",children:[e.jsx("div",{className:"flex-fill mx-1",children:e.jsx(Ke,{setStateQuarter:h})}),e.jsx("div",{className:"flex-fill mx-1",children:e.jsxs(k,{value:p,onChange:t=>te(t.target.value),className:"larger-dropdown",children:[e.jsx("option",{value:"",children:a("LABELS.select_project_type")||"Select Project Type"}),E.map(t=>e.jsx("option",{value:t.id,children:t.name},t.id))]})}),e.jsx("div",{className:"flex-fill mx-1",children:e.jsxs(k,{value:c,onChange:t=>ee(t.target.value),className:"larger-dropdown",children:[e.jsx("option",{value:"",children:a("LABELS.select_project")}),v.filter(t=>!p||t.typeId==p).map(t=>e.jsx("option",{value:t.value,children:t.label},t.value))]})}),e.jsx("div",{className:"flex-fill mx-1",children:e.jsx(se,{setSelectedOption:o,ReportOptions:j,selectedOption:n})}),e.jsxs("div",{className:"flex-fill mx-1 d-flex",children:[e.jsx(re,{fetchReportData:W}),e.jsx(Z,{color:"info",className:"ms-2",style:{height:"38px"},onClick:ae,children:a("LABELS.download")})]})]}),e.jsx("div",{className:"d-md-none mb-3",children:e.jsxs("div",{className:"row gy-3",children:[e.jsx("div",{className:"col-12",children:e.jsx(Ke,{setStateQuarter:h})}),e.jsx("div",{className:"col-12",children:e.jsxs(k,{value:p,onChange:t=>te(t.target.value),className:"larger-dropdown",children:[e.jsx("option",{value:"",children:a("LABELS.select_project_type")||"Select Project Type"}),E.map(t=>e.jsx("option",{value:t.id,children:t.name},t.id))]})}),e.jsx("div",{className:"col-12",children:e.jsxs(k,{value:c,onChange:t=>ee(t.target.value),className:"larger-dropdown",children:[e.jsx("option",{value:"",children:a("LABELS.select_project")}),v.map(t=>e.jsx("option",{value:t.value,children:t.label},t.value))]})}),e.jsx("div",{className:"col-12",children:e.jsx(se,{setSelectedOption:o,ReportOptions:j,selectedOption:n})}),e.jsxs("div",{className:"col-12 d-flex justify-content-start",children:[e.jsx(re,{fetchReportData:W}),e.jsx(Z,{color:"info",className:"ms-2",onClick:ae,children:a("LABELS.download")})]})]})}),(L.data.length>0||G.data.length>0)&&je(),n==="4"&&z.length>0&&fe(),e.jsx("div",{className:"mt-3",children:e.jsx(ve,{selectedOption:n,salesData:L,expenseData:G,pnlData:V,expenseType:{},productWiseData:z,onLoadMore:he,hasMorePages:X,isFetchingMore:ne,scrollCursor:null})})]}),e.jsxs(ce,{className:"p-3",itemKey:"Week",children:[e.jsxs("div",{className:"d-none d-md-flex mb-3 justify-content-between flex-wrap",children:[e.jsx("div",{className:"flex-fill mx-1",children:e.jsx(Je,{setStateWeek:Y})}),e.jsx("div",{className:"flex-fill mx-1",children:e.jsxs(k,{value:p,onChange:t=>te(t.target.value),className:"larger-dropdown",children:[e.jsx("option",{value:"",children:a("LABELS.select_project_type")||"Select Project Type"}),E.map(t=>e.jsx("option",{value:t.id,children:t.name},t.id))]})}),e.jsx("div",{className:"flex-fill mx-1",children:e.jsxs(k,{value:c,onChange:t=>ee(t.target.value),className:"larger-dropdown",children:[e.jsx("option",{value:"",children:a("LABELS.select_project")}),v.filter(t=>!p||t.typeId==p).map(t=>e.jsx("option",{value:t.value,children:t.label},t.value))]})}),e.jsx("div",{className:"flex-fill mx-1",children:e.jsx(se,{setSelectedOption:o,ReportOptions:j,selectedOption:n})}),e.jsxs("div",{className:"flex-fill mx-1 d-flex",children:[e.jsx(re,{fetchReportData:W}),e.jsx(Z,{color:"info",className:"ms-2",style:{height:"38px"},onClick:ae,children:a("LABELS.download")})]})]}),e.jsx("div",{className:"d-md-none mb-3",children:e.jsxs("div",{className:"row gy-3",children:[e.jsx("div",{className:"col-12",children:e.jsx(Je,{setStateWeek:Y})}),e.jsx("div",{className:"col-12",children:e.jsxs(k,{value:p,onChange:t=>te(t.target.value),className:"larger-dropdown",children:[e.jsx("option",{value:"",children:a("LABELS.select_project_type")||"Select Project Type"}),E.map(t=>e.jsx("option",{value:t.id,children:t.name},t.id))]})}),e.jsx("div",{className:"col-12",children:e.jsxs(k,{value:c,onChange:t=>ee(t.target.value),className:"larger-dropdown",children:[e.jsx("option",{value:"",children:a("LABELS.select_project")}),v.map(t=>e.jsx("option",{value:t.value,children:t.label},t.value))]})}),e.jsx("div",{className:"col-12",children:e.jsx(se,{setSelectedOption:o,ReportOptions:j,selectedOption:n})}),e.jsxs("div",{className:"col-12 d-flex justify-content-start",children:[e.jsx(re,{fetchReportData:W}),e.jsx(Z,{color:"info",className:"ms-2",onClick:ae,children:a("LABELS.download")})]})]})}),(L.data.length>0||G.data.length>0)&&je(),n==="4"&&z.length>0&&fe(),e.jsx("div",{className:"mt-3",children:e.jsx(ve,{selectedOption:n,salesData:L,expenseData:G,pnlData:V,expenseType:{},productWiseData:z,onLoadMore:he,hasMorePages:X,isFetchingMore:ne,scrollCursor:null})})]}),e.jsxs(ce,{className:"p-3",itemKey:"Year",children:[e.jsxs("div",{className:"d-none d-md-flex mb-3 align-items-end flex-wrap",children:[e.jsx(He,{setStateYear:i}),e.jsx("div",{className:"mx-1 mt-2 flex-fill",children:e.jsxs(k,{value:p,onChange:t=>te(t.target.value),className:"larger-dropdown",children:[e.jsx("option",{value:"",children:a("LABELS.select_project_type")||"Select Project Type"}),E.map(t=>e.jsx("option",{value:t.id,children:t.name},t.id))]})}),e.jsx("div",{className:"mx-1 mt-2",children:e.jsxs(k,{value:c,onChange:t=>ee(t.target.value),className:"larger-dropdown",children:[e.jsx("option",{value:"",children:a("LABELS.select_project")}),v.filter(t=>!p||t.typeId==p).map(t=>e.jsx("option",{value:t.value,children:t.label},t.value))]})}),e.jsx("div",{className:"mx-1 mt-2",children:e.jsx(se,{setSelectedOption:o,ReportOptions:j,selectedOption:n})}),e.jsxs("div",{className:"mx-1 mt-2 d-flex",children:[e.jsx(re,{fetchReportData:W}),e.jsx(Z,{color:"info",className:"ms-2",onClick:ae,children:a("LABELS.download")})]})]}),e.jsx("div",{className:"d-md-none mb-3",children:e.jsxs("div",{className:"row gy-3",children:[e.jsx("div",{className:"col-12",children:e.jsx(He,{setStateYear:i})}),e.jsx("div",{className:"col-12",children:e.jsxs(k,{value:p,onChange:t=>te(t.target.value),className:"larger-dropdown",children:[e.jsx("option",{value:"",children:a("LABELS.select_project_type")||"Select Project Type"}),E.map(t=>e.jsx("option",{value:t.id,children:t.name},t.id))]})}),e.jsx("div",{className:"col-12",children:e.jsxs(k,{value:c,onChange:t=>ee(t.target.value),className:"larger-dropdown",children:[e.jsx("option",{value:"",children:a("LABELS.select_project")}),v.map(t=>e.jsx("option",{value:t.value,children:t.label},t.value))]})}),e.jsx("div",{className:"col-12",children:e.jsx(se,{setSelectedOption:o,ReportOptions:j,selectedOption:n})}),e.jsxs("div",{className:"col-12 d-flex justify-content-start",children:[e.jsx(re,{fetchReportData:W}),e.jsx(Z,{color:"info",className:"ms-2",onClick:ae,children:a("LABELS.download")})]})]})}),(L.data.length>0||G.data.length>0)&&je(),n==="4"&&z.length>0&&fe(),e.jsx("div",{className:"mt-3",children:e.jsx(ve,{selectedOption:n,salesData:L,expenseData:G,pnlData:V,expenseType:{},productWiseData:z,onLoadMore:he,hasMorePages:X,isFetchingMore:ne,scrollCursor:null})})]})]})]})}),e.jsx("style",{jsx:!0,children:`
        .responsive-container { width: 100%; max-width: 100%; overflow-x: hidden; }
        @media (max-width: 768px) {
          .responsive-container { padding: 0 5px; }
        }
        :global(.larger-dropdown select) {
          min-width: 200px !important;
          font-size: 1.1rem !important;
          height: auto !important;
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
        .bg-info-light {
          background-color: rgba(13, 202, 240, 0.1);
          border-color: rgba(13, 202, 240, 0.4);
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
      `})]})}export{Gt as default};
