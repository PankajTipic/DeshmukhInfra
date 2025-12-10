import{r as i,R as de,f as Se,P as A,_ as Te,g as Pe,h as qe,T as st,j as e,C as rt,b as nt}from"./index-D77JVx93.js";import{C as Ye}from"./CFormLabel-Dc8HuNh9.js";import{C as ze}from"./CFormInput-l8xIFq1a.js";import{C as Y}from"./CFormSelect-BEYL04sy.js";import{a as je}from"./api-C2dAnRUz.js";import{t as lt,u as Le,i as ot}from"./DefaultLayout-B9m2Op0L.js";import{a as ct,b as it}from"./index.esm-CnYARBHd.js";import{C as dt,a as ut}from"./CCardBody-CmpV1lA4.js";import{C as mt,a as ht,b as _e,d as xt,c as F,e as R}from"./CTable-_iNV6x85.js";import{C as G}from"./CButton-1GsZ7-l4.js";import{C as pt,a as ft}from"./index.esm-ChW0gnUx.js";import{M as gt}from"./MantineProvider-DrL-PrdZ.js";import"./CFormControlWrapper-Bm4xoNnJ.js";import"./RawMaterial-BtjEDAbB.js";import"./cil-mobile-CeKkmNgt.js";import"./emotion-react.browser.esm-CqI2bEna.js";var jt=function(s){if(!s)return 0;var a=window.getComputedStyle(s),n=a.transitionDuration,l=a.transitionDelay,c=Number.parseFloat(n),u=Number.parseFloat(l);return!c&&!u?0:(n=n.split(",")[0],l=l.split(",")[0],(Number.parseFloat(n)+Number.parseFloat(l))*1e3)},Re=i.createContext({}),Be=i.forwardRef(function(s,a){var n=s.children,l=s.activeItemKey,c=s.className,u=s.onChange,x=i.useId(),S=i.useState(l),b=S[0],C=S[1];return i.useEffect(function(){b&&u&&u(b)},[b]),de.createElement(Re.Provider,{value:{_activeItemKey:b,setActiveItemKey:C,id:x}},de.createElement("div",{className:Se("tabs",c),ref:a},n))});Be.propTypes={activeItemKey:A.oneOfType([A.number,A.string]).isRequired,children:A.node,className:A.string,onChange:A.func};Be.displayName="CTabs";var oe=i.forwardRef(function(s,a){var n=s.children,l=s.className,c=s.itemKey,u=Te(s,["children","className","itemKey"]),x=i.useContext(Re),S=x._activeItemKey,b=x.setActiveItemKey,C=x.id,m=function(){return c===S};return de.createElement("button",Pe({className:Se("nav-link",{active:m()},l),id:"".concat(C).concat(c,"-tab"),onClick:function(){return b(c)},onFocus:function(){return b(c)},role:"tab",tabIndex:m()?0:-1,type:"button","aria-controls":"".concat(C).concat(c,"-tab-pane"),"aria-selected":m(),ref:a},u),n)});oe.propTypes={children:A.node,className:A.string,itemKey:A.oneOfType([A.number,A.string]).isRequired};oe.displayName="CTab";var ce=i.forwardRef(function(s,a){var n=s.children,l=s.className,c=s.itemKey,u=s.onHide,x=s.onShow,S=s.transition,b=S===void 0?!0:S,C=s.visible,m=Te(s,["children","className","itemKey","onHide","onShow","transition","visible"]),h=i.useContext(Re),p=h._activeItemKey,k=h.id,L=i.useRef(),d=qe(a,L),f=i.useState(C||p===c),I=f[0],T=f[1];return i.useEffect(function(){C!==void 0&&T(C)},[C]),i.useEffect(function(){T(p===c)},[p]),de.createElement(st,{in:I,nodeRef:L,onEnter:x,onExit:u,timeout:L.current?jt(L.current):0},function(z){return de.createElement("div",Pe({className:Se("tab-pane",{active:I,fade:b,show:z==="entered"},l),id:"".concat(k).concat(c,"-tab-pane"),role:"tabpanel","aria-labelledby":"".concat(k).concat(c,"-tab"),tabIndex:0,ref:d},m),n)})});ce.propTypes={children:A.node,className:A.string,itemKey:A.oneOfType([A.number,A.string]).isRequired,onHide:A.func,onShow:A.func,transition:A.bool,visible:A.bool};ce.displayName="CTabPanel";var $e=i.forwardRef(function(s,a){var n,l=s.children,c=s.className,u=s.layout,x=s.variant,S=Te(s,["children","className","layout","variant"]),b=i.useRef(null),C=qe(a,b),m=function(h){if(b.current!==null&&(h.key==="ArrowDown"||h.key==="ArrowUp"||h.key==="ArrowLeft"||h.key==="ArrowRight"||h.key==="Home"||h.key==="End")){h.preventDefault();var p=h.target,k=Array.from(b.current.querySelectorAll(".nav-link:not(.disabled):not(:disabled)")),L=void 0;h.key==="Home"||h.key==="End"?L=h.key==="End"?k.at(-1):k[0]:L=lt(k,p,h.key==="ArrowDown"||h.key==="ArrowRight",!0),L&&L.focus({preventScroll:!0})}};return de.createElement("div",Pe({className:Se("nav",(n={},n["nav-".concat(u)]=u,n["nav-".concat(x)]=x,n),c),role:"tablist",onKeyDown:m,ref:C},S),l)});$e.propTypes={children:A.node,className:A.string,layout:A.oneOf(["fill","justified"]),variant:A.oneOf(["pills","tabs","underline","underline-border"])};$e.displayName="CTabList";function Ce(s){const a=Object.prototype.toString.call(s);return s instanceof Date||typeof s=="object"&&a==="[object Date]"?new s.constructor(+s):typeof s=="number"||a==="[object Number]"||typeof s=="string"||a==="[object String]"?new Date(s):new Date(NaN)}let vt={};function Ve(){return vt}function Ke(s,a){var S,b,C,m;const n=Ve(),l=(a==null?void 0:a.weekStartsOn)??((b=(S=a==null?void 0:a.locale)==null?void 0:S.options)==null?void 0:b.weekStartsOn)??n.weekStartsOn??((m=(C=n.locale)==null?void 0:C.options)==null?void 0:m.weekStartsOn)??0,c=Ce(s),u=c.getDay(),x=(u<l?7:0)+u-l;return c.setDate(c.getDate()-x),c.setHours(0,0,0,0),c}var B=[];for(var Ee=0;Ee<256;++Ee)B.push((Ee+256).toString(16).slice(1));function bt(s,a=0){return(B[s[a+0]]+B[s[a+1]]+B[s[a+2]]+B[s[a+3]]+"-"+B[s[a+4]]+B[s[a+5]]+"-"+B[s[a+6]]+B[s[a+7]]+"-"+B[s[a+8]]+B[s[a+9]]+"-"+B[s[a+10]]+B[s[a+11]]+B[s[a+12]]+B[s[a+13]]+B[s[a+14]]+B[s[a+15]]).toLowerCase()}var we,yt=new Uint8Array(16);function Nt(){if(!we&&(we=typeof crypto<"u"&&crypto.getRandomValues&&crypto.getRandomValues.bind(crypto),!we))throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");return we(yt)}var wt=typeof crypto<"u"&&crypto.randomUUID&&crypto.randomUUID.bind(crypto);const Oe={randomUUID:wt};function Ae(s,a,n){if(Oe.randomUUID&&!a&&!s)return Oe.randomUUID();s=s||{};var l=s.random||(s.rng||Nt)();return l[6]=l[6]&15|64,l[8]=l[8]&63|128,bt(l)}function Me(s,a){return s instanceof Date?new s.constructor(a):new Date(a)}function Ze(s,a){const n=Ce(s);if(isNaN(a))return Me(s,NaN);if(!a)return n;const l=n.getDate(),c=Me(s,n.getTime());c.setMonth(n.getMonth()+a+1,0);const u=c.getDate();return l>=u?c:(n.setFullYear(c.getFullYear(),c.getMonth(),l),n)}function Qe(s,a){var S,b,C,m;const n=Ve(),l=(a==null?void 0:a.weekStartsOn)??((b=(S=a==null?void 0:a.locale)==null?void 0:S.options)==null?void 0:b.weekStartsOn)??n.weekStartsOn??((m=(C=n.locale)==null?void 0:C.options)==null?void 0:m.weekStartsOn)??0,c=Ce(s),u=c.getDay(),x=(u<l?-7:0)+6-(u-l);return c.setDate(c.getDate()+x),c.setHours(23,59,59,999),c}function Ie(s){const a=Ce(s),n=a.getFullYear(),l=a.getMonth(),c=Me(s,0);return c.setFullYear(n,l+1,0),c.setHours(0,0,0,0),c.getDate()}function St(s,a){return Ze(s,-a)}const Lt=e.jsx("svg",{width:"20",height:"20",viewBox:"0 0 20 20",xmlns:"http://www.w3.org/2000/svg",children:e.jsx("path",{fillRule:"evenodd",clipRule:"evenodd",d:"M7.05806 3.30806C7.30214 3.06398 7.69786 3.06398 7.94194 3.30806L14.1919 9.55806C14.436 9.80214 14.436 10.1979 14.1919 10.4419L7.94194 16.6919C7.69786 16.936 7.30214 16.936 7.05806 16.6919C6.81398 16.4479 6.81398 16.0521 7.05806 15.8081L12.8661 10L7.05806 4.19194C6.81398 3.94786 6.81398 3.55214 7.05806 3.30806Z"})}),Ct=e.jsx("svg",{width:"20",height:"20",viewBox:"0 0 20 20",xmlns:"http://www.w3.org/2000/svg",children:e.jsx("path",{fillRule:"evenodd",clipRule:"evenodd",d:"M12.9419 3.30806C13.186 3.55214 13.186 3.94786 12.9419 4.19194L7.13388 10L12.9419 15.8081C13.186 16.0521 13.186 16.4479 12.9419 16.6919C12.6979 16.936 12.3021 16.936 12.0581 16.6919L5.80806 10.4419C5.56398 10.1979 5.56398 9.80214 5.80806 9.55806L12.0581 3.30806C12.3021 3.06398 12.6979 3.06398 12.9419 3.30806Z"})}),Dt=({onChange:s})=>{const[a,n]=i.useState(!1),[l,c]=i.useState(new Date),[u,x]=i.useState({firstDay:Ke(new Date,{weekStartsOn:1}),lastDay:Qe(new Date,{weekStartsOn:1})});i.useEffect(()=>{s&&s(u)},[u]);const S=()=>new Date(new Date().getFullYear(),1,29).getDate()===29,b=L=>{let d=new Date(L),f=d.getFullYear(),I=String(d.getMonth()+1).padStart(2,"0");return`${String(d.getDate()).padStart(2,"0")}.${I}.${f}`},C=L=>{let d;L.target.id.includes("prev")?(d=new Date(l.setDate(1)),c(new Date(l.setDate(1)))):L.target.id.includes("next")?(d=new Date(l.setDate(Ie(l))),c(new Date(l.setDate(Ie(l))))):(d=new Date(l.setDate(L.target.id)),c(new Date(l.setDate(L.target.id))));const f=Ke(d,{weekStartsOn:1}),I=Qe(d,{weekStartsOn:1});x({firstDay:f,lastDay:I})},m=["Jan.","Feb.","Mar.","Apr.","May","Jun","July","Aug.","Sep.","Oct.","Nov.","Dec."],h={1:31,2:S()?29:28,3:31,4:30,5:31,6:30,7:31,8:31,9:30,10:31,11:30,12:31},p=()=>{let L=l.getMonth()+1,d=[];for(let _=1;_<=h[L];_++){let M=new Date(l).setDate(_),K="single-number ";new Date(u.firstDay).getTime()<=new Date(M).getTime()&&new Date(M).getTime()<=new Date(u.lastDay).getTime()&&(K=K+"selected-week"),d.push(e.jsx("div",{id:_,className:K,onClick:C,children:_},Ae()))}const f=new Date(l).setDate(1);let I=new Date(f).getDay();I<1&&(I=7);let T=[],z=new Date(l).getMonth();z===0&&(z=12);for(let _=I;_>1;_--){let M=new Date(l).setMonth(new Date(l).getMonth()-1),K=new Date(M).setDate(h[z]-_+2),D="single-number other-month",se=new Date(K).getTime(),ee=new Date(u.firstDay).getTime(),U=new Date(u.lastDay).getTime();se>=ee&&se<=U&&(D="single-number selected-week"),T.push(e.jsx("div",{onClick:C,id:"prev-"+_,className:D,children:h[z]-_+2},Ae()))}let E=[],ie=35;[...T,...d].length>35&&(ie=42);for(let _=1;_<=ie-[...T,...d].length;_++){let M="single-number other-month";const K=u.lastDay.getTime(),D=new Date(new Date(l).setDate(Ie(l)));D.getTime()<=K&&u.firstDay.getMonth()===D.getMonth()&&(M="single-number selected-week"),E.push(e.jsx("div",{onClick:C,id:"next-"+_,className:M,children:_},Ae()))}return[...T,...d,...E]},k=L=>{let d=new Date(l);L?d=Ze(d,1):d=St(d,1),c(new Date(d))};return e.jsxs("div",{className:"week-picker-display",onBlur:()=>n(!1),onClick:()=>n(!0),tabIndex:0,children:[e.jsxs("h6",{children:[b(u.firstDay),"   to   ",b(u.lastDay)]}),a&&e.jsxs("div",{className:"week-picker-options",children:[e.jsxs("div",{className:"title-week",children:[e.jsx("div",{onClick:()=>k(!1),className:"arrow-container",children:Ct}),`${m[l.getMonth()]} ${l.getFullYear()}.`,e.jsx("div",{onClick:()=>k(!0),className:"arrow-container",children:Lt})]}),e.jsxs("div",{className:"numbers-container",children:[e.jsx("div",{className:"single-number day",children:"Mon"}),e.jsx("div",{className:"single-number day",children:"Tue"}),e.jsx("div",{className:"single-number day",children:"Wed"}),e.jsx("div",{className:"single-number day",children:"Thu"}),e.jsx("div",{className:"single-number day",children:"Fri"}),e.jsx("div",{className:"single-number day",children:"Sat"}),e.jsx("div",{className:"single-number day",children:"Sun"})]}),e.jsx("div",{className:"numbers-container",children:p()})]})]})};function Ue({setStateCustom:s}){const a=i.useRef(),n=i.useRef(),l=()=>{const c=a.current.value,u=n.current.value;c&&u&&s({start_date:c,end_date:u})};return e.jsxs("div",{className:"row mt-1",children:[e.jsx("div",{className:"col-sm-6 mb-3",children:e.jsxs("div",{className:"mb-1",children:[e.jsx(Ye,{htmlFor:"start_date",children:"Start Date"}),e.jsx(ze,{type:"date",ref:a,id:"start_date",name:"start_date",placeholder:"Select Start Date",onChange:l,required:!0,feedbackInvalid:"Please select a date."})]})}),e.jsx("div",{className:"col-sm-6 mb-3",children:e.jsxs("div",{className:"mb-1",children:[e.jsx(Ye,{htmlFor:"end_date",children:"End Date"}),e.jsx(ze,{type:"date",id:"end_date",ref:n,name:"end_date",onChange:l,required:!0,feedbackInvalid:"Please select a date."})]})})]})}function He({setStateMonth:s}){const a=d=>d%4===0&&d%100!==0||d%400===0,n=(d,f)=>f===2?a(d)?29:28:[4,6,9,11].includes(f)?30:31,l=new Date().getFullYear(),c=(new Date().getMonth()+1).toString().padStart(2,"0"),[u,x]=i.useState(l.toString()),[S,b]=i.useState(c),C=2023,m=2030,h=()=>{const d=[];for(let f=C;f<=m;f++)d.push(e.jsx("option",{value:f.toString(),children:f},f));return d},p=()=>[{value:"01",label:"January"},{value:"02",label:"February"},{value:"03",label:"March"},{value:"04",label:"April"},{value:"05",label:"May"},{value:"06",label:"June"},{value:"07",label:"July"},{value:"08",label:"August"},{value:"09",label:"September"},{value:"10",label:"October"},{value:"11",label:"November"},{value:"12",label:"December"}].map(f=>e.jsx("option",{value:f.value,children:f.label},f.value)),k=d=>{const f=d.target.value;x(f);const I=n(parseInt(f),parseInt(S));s({start_date:`${f}-${S}-01`,end_date:`${f}-${S}-${I}`})},L=d=>{const f=d.target.value;b(f);const I=n(parseInt(u),parseInt(f));s({start_date:`${u}-${f}-01`,end_date:`${u}-${f}-${I}`})};return i.useEffect(()=>{const d=u||l,f=S||c,I=n(parseInt(d),parseInt(f));s({start_date:`${d}-${f}-01`,end_date:`${d}-${f}-${I}`})},[u,S]),e.jsxs("div",{className:"d-flex mb-3",children:[e.jsx("div",{className:"flex-fill mx-1",children:e.jsx(Y,{className:"pl-3","aria-label":"Select Year",value:u,onChange:k,children:h()})}),e.jsx("div",{className:"flex-fill mx-1",children:e.jsx(Y,{className:"pl-3","aria-label":"Select Month",value:S,onChange:L,children:p()})})]})}function Je({setStateQuarter:s}){const a=p=>p>=4&&p<=6?"1":p>=7&&p<=9?"2":p>=10&&p<=12?"3":"4",n=(p,k)=>{switch(k){case"1":return`${p}-04-01`;case"2":return`${p}-07-01`;case"3":return`${p}-10-01`;case"4":return`${p+1}-01-01`;default:return`${p}-04-01`}},l=(p,k)=>{switch(k){case"1":return`${p}-06-30`;case"2":return`${p}-09-30`;case"3":return`${p}-12-31`;case"4":return`${p+1}-03-31`;default:return`${p+1}-03-31`}},c=new Date().getFullYear(),u=new Date().getMonth()+1,[x,S]=i.useState(c.toString()),[b,C]=i.useState(a(u));i.useEffect(()=>{const p=parseInt(x,10),k=n(p,b),L=l(p,b);s({start_date:k,end_date:L})},[x,b,s]);const m=p=>{S(p.target.value)},h=p=>{C(p.target.value)};return e.jsxs("div",{className:"d-flex",children:[e.jsx("div",{className:"flex-fill mx-1 col-sm-2",children:e.jsx(Y,{className:"pl-3 w-100","aria-label":"Select Financial Year",value:x,onChange:m,children:Array.from({length:7},(p,k)=>e.jsx("option",{value:2023+k,children:`${2023+k}-${(2023+k+1).toString().slice(-2)}`},2023+k))})}),e.jsx("div",{className:"flex-fill mx-1 col-sm-4",children:e.jsx(Y,{className:"pl-3 w-100","aria-label":"Select Quarter",value:b,onChange:h,children:[{value:"1",label:"Q1 (Apr - Jun)"},{value:"2",label:"Q2 (Jul - Sep)"},{value:"3",label:"Q3 (Oct - Dec)"},{value:"4",label:"Q4 (Jan - Mar)"}].map(p=>e.jsx("option",{value:p.value,children:p.label},p.value))})})]})}function Ge({setStateYear:s}){const a=new Date().getFullYear(),[n,l]=i.useState(a.toString());return i.useEffect(()=>{const c=parseInt(n,10);s({start_date:`${c}-04-01`,end_date:`${c+1}-03-31`})},[n,s]),e.jsx("div",{className:"mt-2 col-sm-2 d-flex justify-content-center",children:e.jsx("div",{className:"flex-fill mx-1",children:e.jsx(Y,{className:"pl-3 w-100","aria-label":"Select Financial Year",value:n,onChange:c=>l(c.target.value),children:Array.from({length:7},(c,u)=>{const x=2023+u;return e.jsx("option",{value:x.toString(),children:`${x}-${(x+1).toString().slice(-2)}`},x)})})})})}function We({setStateWeek:s}){const[a,n]=i.useState({firstDay:new Date,lastDay:new Date}),l=u=>{let x=new Date(u),S=x.getFullYear(),b=String(x.getMonth()+1).padStart(2,"0"),C=String(x.getDate()).padStart(2,"0");return`${S}-${b}-${C}`},c=u=>{n(u),s({start_date:l(u.firstDay),end_date:l(u.lastDay)})};return e.jsx("div",{className:"App ",children:e.jsx(Dt,{onChange:c})})}function ve({selectedOption:s,salesData:a,expenseData:n,pnlData:l,expenseType:c,productWiseData:u,onLoadMore:x,hasMorePages:S,isFetchingMore:b,scrollCursor:C}){const{t:m}=Le("global"),[h,p]=i.useState(""),[k,L]=i.useState(""),[d,f]=i.useState(!1),I=i.useRef(null),T=i.useRef(null),z=i.useRef(null),[E,ie]=i.useState({key:null,direction:"asc"});i.useEffect(()=>{const o=()=>{f(window.innerWidth<=768)};return o(),window.addEventListener("resize",o),()=>window.removeEventListener("resize",o)},[]);const _=o=>{if(!o)return"-";try{const t=new Date(o);if(isNaN(t.getTime()))return console.warn("Invalid date format:",o),o;const N=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],w=t.getDate().toString().padStart(2,"0"),$=N[t.getMonth()],O=t.getFullYear();return d?`${w}/${t.getMonth()+1}/${O.toString().slice(-2)}`:`${w} ${$} ${O}`}catch(t){return console.warn("Date formatting error:",t,"for date:",o),o}},M=o=>{if(!o&&o!==0)return"₹0";const t=Number(o);if(d&&t>=1e3){if(t>=1e7)return`₹${(t/1e7).toFixed(1)}Cr`;if(t>=1e5)return`₹${(t/1e5).toFixed(1)}L`;if(t>=1e3)return`₹${(t/1e3).toFixed(1)}K`}return`₹${t.toLocaleString()}`},K=o=>{const t=Number(o);if(d&&t>=1e3){if(t>=1e6)return`${(t/1e6).toFixed(1)}M`;if(t>=1e3)return`${(t/1e3).toFixed(1)}K`}return t.toLocaleString()},D=o=>{let t="asc";E.key===o&&E.direction==="asc"&&(t="desc"),ie({key:o,direction:t})},se=i.useCallback(o=>{T.current&&clearTimeout(T.current),T.current=setTimeout(()=>{p(o)},300)},[]),ee=i.useCallback(()=>{z.current&&clearTimeout(z.current),z.current=setTimeout(()=>{const o=I.current;if(!o)return;const{scrollTop:t,scrollHeight:N,clientHeight:w}=o;t+w>=N-100&&S&&!b&&x&&x()},100)},[S,b,x]);i.useEffect(()=>()=>{T.current&&clearTimeout(T.current),z.current&&clearTimeout(z.current)},[]);const U=o=>{if(!o)return new Date(0);const t=new Date(o);return isNaN(t.getTime())?new Date(0):t},ue=()=>{let o=[];switch(s){case"1":return o=(a==null?void 0:a.data)||[],console.log("Income Report Data:",o),[...o].sort((t,N)=>U(N.date)-U(t.date));case"2":return o=(n==null?void 0:n.data)||[],[...o].sort((t,N)=>U(N.expenseDate)-U(t.expenseDate));case"3":return o=(l==null?void 0:l.Data)||[],[...o].sort((t,N)=>U(N.date)-U(t.date));case"4":return Array.isArray(u)?u:u!=null&&u.data&&Array.isArray(u.data)?u.data:[];default:return[]}},re=i.useMemo(()=>{let o=ue();return!o||!Array.isArray(o)?(console.warn("No valid data for filtering:",o),[]):(h.trim()&&(o=o.filter(t=>{switch(s){case"1":return t.date&&_(t.date).toLowerCase().includes(h.toLowerCase())||t.projectName&&t.projectName.toLowerCase().includes(h.toLowerCase())||t.totalIncomeAmount&&t.totalIncomeAmount.toString().includes(h);case"2":return t.expenseDate&&_(t.expenseDate).toLowerCase().includes(h.toLowerCase())||t.projectName&&t.projectName.toLowerCase().includes(h.toLowerCase())||t.totalExpense&&t.totalExpense.toString().includes(h);case"3":return t.date&&_(t.date).toLowerCase().includes(h.toLowerCase())||t.projectName&&t.projectName.toLowerCase().includes(h.toLowerCase())||t.totalIncome&&t.totalIncome.toString().includes(h)||t.totalExpenses&&t.totalExpenses.toString().includes(h)||t.profitLoss&&t.profitLoss.toString().includes(h);case"4":return t.projectName&&t.projectName.toLowerCase().includes(h.toLowerCase())||t.product_name&&t.product_name.toLowerCase().includes(h.toLowerCase())||t.dPrice&&t.dPrice.toString().includes(h)||t.totalQty&&t.totalQty.toString().includes(h)||t.totalRevenue&&t.totalRevenue.toString().includes(h);default:return!0}})),E.key&&(o=[...o].sort((t,N)=>{let w=t[E.key],$=N[E.key];return["date","expenseDate"].includes(E.key)&&(w=U(w),$=U($)),w==null&&$==null?0:w==null?E.direction==="asc"?-1:1:$==null?E.direction==="asc"?1:-1:typeof w=="number"&&typeof $=="number"?E.direction==="asc"?w-$:$-w:E.direction==="asc"?String(w).localeCompare(String($)):String($).localeCompare(String(w))})),console.log("Filtered Data:",o),o)},[ue,h,E,s,d]),be=()=>{if(h)return m("LABELS.no_results_found")||"No results found for your search";switch(s){case"1":return m("MSG.no_income_data")||"No income data available";case"2":return m("MSG.no_expense_data")||"No expense data available";case"3":return m("MSG.no_pnl_data")||"No profit/loss data available";case"4":return m("MSG.no_product_data")||"No product data available";default:return"No data available"}},me=()=>{switch(s){case"1":return m("LABELS.search_income_logs")||"Search income data...";case"2":return m("LABELS.search_expenses")||"Search expense data...";case"3":return m("LABELS.search_pnl")||"Search profit & loss data...";case"4":return m("LABELS.search_products")||"Search product data...";default:return m("LABELS.search_data")||"Search data..."}},ye=o=>{const t=o.target.value;L(t),se(t)},he=()=>{L(""),p(""),T.current&&clearTimeout(T.current)},ne=()=>{const o=w=>E.key===w?E.direction==="asc"?"↑":"↓":"↕",t=w=>({marginLeft:d?"4px":"8px",fontSize:d?"14px":"18px",opacity:E.key===w?1:.5,color:E.key===w?"#0d6efd":"#6c757d"}),N={cursor:"pointer",fontSize:d?"0.75rem":"0.875rem"};switch(s){case"1":return e.jsxs(e.Fragment,{children:[e.jsxs(F,{onClick:()=>D("projectName"),style:N,children:[d?"Project":m("LABELS.project_name")||"Project Name",e.jsx("span",{style:t("projectName"),children:o("projectName")})]}),e.jsxs(F,{onClick:()=>D("date"),style:N,children:[m("LABELS.date")||"Date",e.jsx("span",{style:t("date"),children:o("date")})]}),e.jsxs(F,{onClick:()=>D("totalIncomeAmount"),style:N,children:[d?"Amount":"Total Income Amount",e.jsx("span",{style:t("totalIncomeAmount"),children:o("totalIncomeAmount")})]})]});case"2":return e.jsxs(e.Fragment,{children:[e.jsxs(F,{onClick:()=>D("projectName"),style:N,children:[d?"Project":m("LABELS.project_name")||"Project Name",e.jsx("span",{style:t("projectName"),children:o("projectName")})]}),e.jsxs(F,{onClick:()=>D("expenseDate"),style:N,children:[m("LABELS.expense_date")||"Date",e.jsx("span",{style:t("expenseDate"),children:o("expenseDate")})]}),e.jsxs(F,{onClick:()=>D("totalExpense"),style:N,children:[d?"Expense":m("LABELS.total_expense")||"Total Expense",e.jsx("span",{style:t("totalExpense"),children:o("totalExpense")})]})]});case"3":return e.jsxs(e.Fragment,{children:[e.jsxs(F,{onClick:()=>D("projectName"),style:N,children:[d?"Project":m("LABELS.project_name")||"Project Name",e.jsx("span",{style:t("projectName"),children:o("projectName")})]}),e.jsxs(F,{onClick:()=>D("date"),style:N,children:[m("LABELS.date")||"Date",e.jsx("span",{style:t("date"),children:o("date")})]}),e.jsxs(F,{onClick:()=>D("totalIncome"),style:N,children:[d?"Income":m("LABELS.income_grand_total")||"Income Total",e.jsx("span",{style:t("totalIncome"),children:o("totalIncome")})]}),e.jsxs(F,{onClick:()=>D("totalExpenses"),style:N,children:[d?"Expenses":m("LABELS.total_expenses")||"Total Expenses",e.jsx("span",{style:t("totalExpenses"),children:o("totalExpenses")})]}),e.jsxs(F,{onClick:()=>D("profitLoss"),style:N,children:[d?"P/L":m("LABELS.profit_loss")||"Profit/Loss",e.jsx("span",{style:t("profitLoss"),children:o("profitLoss")})]})]});case"4":return e.jsxs(e.Fragment,{children:[e.jsxs(F,{onClick:()=>D("projectName"),style:N,children:[d?"Project":m("LABELS.project_name")||"Project Name",e.jsx("span",{style:t("projectName"),children:o("projectName")})]}),e.jsxs(F,{onClick:()=>D("product_name"),style:N,children:[d?"Product":m("LABELS.product_name")||"Product Name",e.jsx("span",{style:t("product_name"),children:o("product_name")})]}),e.jsxs(F,{onClick:()=>D("dPrice"),style:N,children:[d?"Price":m("LABELS.unit_price")||"Unit Price",e.jsx("span",{style:t("dPrice"),children:o("dPrice")})]}),e.jsxs(F,{onClick:()=>D("totalQty"),style:N,children:[d?"Qty":m("LABELS.quantity")||"Quantity",e.jsx("span",{style:t("totalQty"),children:o("totalQty")})]}),e.jsxs(F,{onClick:()=>D("totalRevenue"),style:N,children:[d?"Revenue":m("LABELS.total_revenue")||"Total Revenue",e.jsx("span",{style:t("totalRevenue"),children:o("totalRevenue")})]})]});default:return null}},Ne=()=>{const o=re;if(o.length===0){const t=s==="1"||s==="2"?3:5;return e.jsx(_e,{children:e.jsx(R,{colSpan:t,className:"text-center empty-message",children:be()})})}return o.map((t,N)=>e.jsxs(_e,{className:"data-row",children:[s==="1"&&e.jsxs(e.Fragment,{children:[e.jsx(R,{className:"project-cell",children:e.jsx("div",{className:"cell-wrapper",children:e.jsx("span",{className:"truncate-text",title:t.projectName,children:t.projectName||"-"})})}),e.jsx(R,{className:"date-cell",children:_(t.date)}),e.jsx(R,{className:"amount-cell",children:e.jsx("span",{className:"amount-value",children:M(t.totalIncomeAmount)})})]}),s==="2"&&e.jsxs(e.Fragment,{children:[e.jsx(R,{className:"project-cell",children:e.jsx("div",{className:"cell-wrapper",children:e.jsx("span",{className:"truncate-text",title:t.projectName,children:t.projectName||"-"})})}),e.jsx(R,{className:"date-cell",children:_(t.expenseDate)}),e.jsx(R,{className:"amount-cell",children:e.jsx("span",{className:"amount-value",children:M(t.totalExpense)})})]}),s==="3"&&e.jsxs(e.Fragment,{children:[e.jsx(R,{className:"project-cell",children:e.jsx("div",{className:"cell-wrapper",children:e.jsx("span",{className:"truncate-text",title:t.projectName,children:t.projectName||"-"})})}),e.jsx(R,{className:"date-cell",children:_(t.date)}),e.jsx(R,{className:"amount-cell",children:e.jsx("span",{className:"amount-value",children:M(t.totalIncome)})}),e.jsx(R,{className:"amount-cell",children:e.jsx("span",{className:"amount-value",children:M(t.totalExpenses)})}),e.jsx(R,{className:`amount-cell ${t.profitLoss>=0?"profit-cell":"loss-cell"}`,children:e.jsx("span",{className:"amount-value",children:M(t.profitLoss)})})]}),s==="4"&&e.jsxs(e.Fragment,{children:[e.jsx(R,{className:"project-cell",children:e.jsx("div",{className:"cell-wrapper",children:e.jsx("span",{className:"truncate-text",title:t.projectName,children:t.projectName||"-"})})}),e.jsx(R,{className:"product-cell",children:e.jsx("div",{className:"cell-wrapper",children:e.jsx("span",{className:"truncate-text",title:t.product_name,children:t.product_name||"-"})})}),e.jsx(R,{className:"amount-cell",children:e.jsx("span",{className:"amount-value",children:M(t.dPrice)})}),e.jsx(R,{className:"quantity-cell",children:K(t.totalQty)}),e.jsx(R,{className:"amount-cell",children:e.jsx("span",{className:"amount-value revenue",children:M(t.totalRevenue)})})]})]},N))};return e.jsxs(e.Fragment,{children:[e.jsx("style",{jsx:!0,children:`
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
      `}),e.jsx(ct,{children:e.jsx(it,{xs:12,children:e.jsxs(dt,{className:"mb-4",children:[e.jsxs("div",{className:"custom-card-header",children:[e.jsxs("div",{className:"header-left",children:[e.jsxs("div",{className:"header-search-container",children:[e.jsx("input",{type:"text",className:"header-search-input",placeholder:me(),value:k,onChange:ye}),e.jsx("div",{className:"header-search-icon",children:"🔍"}),k&&e.jsx("button",{className:"header-clear-search",onClick:he,title:m("LABELS.clear_search")||"Clear search",children:"×"})]}),h&&e.jsxs("div",{className:"search-results-info",children:[re.length," ",m("LABELS.results_found")||"results found for",' "',h,'"']})]}),e.jsxs("div",{className:"records-count",children:[re.length," ",m("LABELS.records")||"records"]})]}),e.jsx(ut,{className:"p-0",children:e.jsxs("div",{className:"table-container",ref:I,onScroll:ee,children:[e.jsxs(mt,{className:"reports-table",children:[e.jsx(ht,{children:e.jsx(_e,{children:ne()})}),e.jsx(xt,{children:Ne()})]}),b&&e.jsxs("div",{className:"loading-more",children:[e.jsx(rt,{color:"primary",size:"sm"}),e.jsx("span",{className:"ms-2 text-muted",children:m("MSG.loading")||"Loading more..."})]})]})})]})})})]})}function Z({ReportOptions:s,selectedOption:a,setSelectedOption:n}){const{t:l,ready:c}=Le("global");if(!c)return e.jsx("div",{children:l("LABELS.loading")});const u=[...s];return e.jsx("div",{children:e.jsx(Y,{id:"report-select",options:u,value:a,onChange:x=>n(x.target.value)})})}function X({fetchReportData:s}){const{t:a,ready:n}=Le("global");return n?e.jsx("div",{children:e.jsx(G,{color:"success",onClick:s,children:a("LABELS.fetch_report")})}):e.jsx("div",{children:a("LABELS.loading")})}function Ut({companyId:s}){const{t:a}=Le("global"),[n,l]=i.useState("3"),[c,u]=i.useState(""),[x,S]=i.useState([]),[b,C]=i.useState({start_date:"",end_date:""}),[m,h]=i.useState({start_date:"",end_date:""}),[p,k]=i.useState({start_date:"",end_date:""}),[L,d]=i.useState({start_date:"",end_date:""}),[f,I]=i.useState("Year"),[T,z]=i.useState({start_date:"",end_date:""}),{showToast:E}=nt(),[ie,_]=i.useState(1),[M,K]=i.useState(!1),[D,se]=i.useState(!1),[ee,U]=i.useState(null),[ue,re]=i.useState(null),[be,me]=i.useState(null),[ye,he]=i.useState(null),[ne,Ne]=i.useState(null);i.useRef(0),i.useRef(!1);const o=[{label:a("LABELS.incomeReport")||"Income Report",value:"1"},{label:a("LABELS.expenseReport")||"Expense Report",value:"2"},{label:a("LABELS.profit_loss")||"Profit and Loss",value:"3"}],[t,N]=i.useState({data:[],totalIncomeAmount:0}),[w,$]=i.useState([]),[O,De]=i.useState({data:[],totalExpense:0}),[xe,kt]=i.useState({}),[W,ke]=i.useState({Data:[],totalIncome:0,totalExpenses:0,totalProfitLoss:0});i.useEffect(()=>{(async()=>{try{const y=await je(`/api/projects${s?`?companyId=${s}`:""}`);console.log("Projects API Response:",y);let j=Array.isArray(y)?y:Array.isArray(y.data)?y.data:[];Array.isArray(j)?S(j.map(te=>({label:te.project_name,value:te.id}))):E("danger",a("MSG.failed_fetch_projects")||"Failed to fetch projects")}catch(y){console.error("Error fetching projects:",y),E("danger",a("MSG.failed_fetch_projects")||"Failed to fetch projects")}})()},[s]),i.useEffect(()=>{if(f==="Month"&&n==="3"&&m.start_date&&m.end_date){const r=new Date(m.start_date).getFullYear();(async()=>{try{const j=await je(`/api/monthlyIncomeSummaries?year=${r}`);j.success&&Ne(j)}catch(j){console.error(j)}})()}else Ne(null)},[f,n,m]);const Xe=r=>{I(r),N({data:[],totalIncomeAmount:0}),De({data:[],totalExpense:0}),ke({Data:[],totalIncome:0,totalExpenses:0,totalProfitLoss:0}),$([]),_(1),K(!1),U(null),re(null),me(null),he(null)},q=r=>{u(r),N({data:[],totalIncomeAmount:0}),De({data:[],totalExpense:0}),ke({Data:[],totalIncome:0,totalExpenses:0,totalProfitLoss:0}),$([]),_(1),K(!1),U(null),re(null),me(null),he(null)},Fe=()=>{if(!Array.isArray(w)||w.length===0)return[];const r=w.reduce((y,j)=>y+(Number(j.totalRevenue)||0),0);return w.sort((y,j)=>(Number(j.totalRevenue)||0)-(Number(y.totalRevenue)||0)).slice(0,3).map(y=>({...y,percentage:r>0?Math.round(Number(y.totalRevenue)/r*100):0}))},et=()=>{const r=Fe();if(r.length===0)return{labels:[],datasets:[{data:[],backgroundColor:[],borderWidth:2}]};const y=["#FF6B6B","#4ECDC4","#45B7D1"];return{labels:r.map(j=>j.product_name),datasets:[{data:r.map(j=>Number(j.totalRevenue)||0),backgroundColor:y.slice(0,r.length),borderColor:"#fff",borderWidth:2}]}},tt=()=>{if(!ne)return null;const y={labels:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],datasets:[{label:"Income",data:ne.monthlySales,backgroundColor:"rgba(13, 110, 253, 0.6)"},{label:"Expenses",data:ne.monthlyExpense,backgroundColor:"rgba(220, 53, 69, 0.6)"},{label:"P&L",data:ne.monthlyPandL,backgroundColor:"rgba(25, 135, 84, 0.6)"}]};return e.jsx("div",{className:"monthly-summary row mt-4",children:e.jsx("div",{className:"col-12",children:e.jsxs("div",{className:"card",children:[e.jsx("div",{className:"card-header",children:a("LABELS.monthly_summary")||"Monthly Summary"}),e.jsx("div",{className:"card-body",children:e.jsx(pt,{data:y})})]})})})};i.useEffect(()=>{if(f!=="Custom"){let r=!1;switch(f){case"Year":r=L.start_date&&L.end_date;break;case"Quarter":r=p.start_date&&p.end_date;break;case"Month":r=m.start_date&&m.end_date;break;case"Week":r=T.start_date&&T.end_date;break}if(r){const y=setTimeout(()=>{at()},100);return()=>clearTimeout(y)}}},[f,L,p,m,T,c]);const J=async(r=1,y=!1)=>{try{se(r>1);let j={},te=[],le=[];switch(f){case"Custom":j=b;break;case"Month":j=m;break;case"Quarter":j=p;break;case"Year":j=L;break;case"Week":j=T;break;default:break}if(!j.start_date||!j.end_date){alert(a("MSG.select_dates")||"Please select dates");return}const ae=c?`&projectId=${c}`:"";if(n==="1"||n==="3"){const g=await je(`/api/incomeSummaryReport?startDate=${j.start_date}&endDate=${j.end_date}&perPage=370${ue?`&cursor=${ue}`:""}${ae}`);if(console.log("Income API Response:",g),g&&g.incomes){const Q=g.incomes.map(v=>({date:v.date,projectName:v.project_name||"Unknown Project",totalIncomeAmount:Number(v.totalIncomeAmount)||0}));te=[...Q],N(v=>{var P;return{data:y?[...v.data,...Q]:Q,totalIncomeAmount:(P=g.summary)!=null&&P.totalIncomeAmount?Number(g.summary.totalIncomeAmount):v.totalIncomeAmount||0}}),console.log("Updated incomeData:",t),K(g.has_more_pages||!1),re(g.next_cursor||null)}else E("danger",a("MSG.failed_fetch_income_logs")||"Failed to fetch income logs")}if(n==="2"||n==="3"){const g=await je(`/api/expense-report?startDate=${j.start_date}&endDate=${j.end_date}&perPage=370${be?`&cursor=${be}`:""}${ae}`);if(g&&g.data){const Q=g.data.map(v=>({id:v.id,expenseDate:v.expense_date,totalExpense:Number(v.total_expense)||0,projectName:v.project_name||"Unknown Project"}));le=[...Q],De(v=>({data:y?[...v.data,...Q]:Q,totalExpense:Number(g.total_expense)||0})),K(g.has_more_pages||!1),me(g.next_cursor||null)}else E("danger",a("MSG.failed_fetch_expense")||"Failed to fetch expenses")}if(n==="4"){const g=await je(`/api/reportProductWiseEarnings?startDate=${j.start_date}&endDate=${j.end_date}&perPage=370${ye?`&cursor=${ye}`:""}${ae}`);if(g&&Array.isArray(g.data)){const Q=g.data.map(v=>({product_id:v.id,product_name:v.product_name,dPrice:Number(v.product_dPrice)||0,totalQty:Number(v.totalQty)||0,totalRevenue:Number(v.totalRevenue)||0,projectName:v.project_name||"Unknown Project"}));$(v=>{const P=Array.isArray(v)?v:(v==null?void 0:v.data)||[];return y?[...P,...Q]:Q}),K(g.has_more_pages||!1),he(g.next_cursor||null)}else E("danger",a("MSG.invalid_product_data_format")||"Invalid product data format")}if(n==="3"){const g=new Map;te.forEach(v=>{const P=`${v.date}|${v.projectName}`;g.set(P,{date:v.date,projectName:v.projectName,totalIncome:v.totalIncomeAmount,totalExpenses:0,profitLoss:v.totalIncomeAmount})}),le.forEach(v=>{const P=`${v.expenseDate}|${v.projectName}`,H=g.get(P)||{date:v.expenseDate,projectName:v.projectName,totalIncome:0,totalExpenses:0,profitLoss:0};H.totalExpenses+=v.totalExpense,H.profitLoss=H.totalIncome-H.totalExpenses,g.set(P,H)});const Q=Array.from(g.values());ke(v=>({Data:y?[...v.Data,...Q]:Q,totalIncome:te.reduce((P,H)=>P+(Number(H.totalIncomeAmount)||0),0),totalExpenses:le.reduce((P,H)=>P+(Number(H.totalExpense)||0),0),totalProfitLoss:te.reduce((P,H)=>P+(Number(H.totalIncomeAmount)||0),0)-le.reduce((P,H)=>P+(Number(H.totalExpense)||0),0)}))}}catch(j){console.error("Error fetching report data:",j),E("danger",a("MSG.error_fetching_data")||"Error fetching data")}finally{se(!1)}},at=()=>{J(1,!1)},pe=()=>{M&&!D&&(_(r=>r+1),J(ie+1,!0))},fe=()=>{if(n==="1")return e.jsx("div",{className:"summary-cards row g-3",children:e.jsx("div",{className:"col-md-6 col-lg-4",children:e.jsx("div",{className:"card bg-primary-light",children:e.jsxs("div",{className:"card-body d-flex align-items-center",children:[e.jsx("div",{className:"icon-container me-3",children:e.jsx("i",{className:"bi bi-currency-rupee"})}),e.jsxs("div",{children:[e.jsx("h6",{className:"card-title mb-1",children:a("LABELS.total_income_amount")||"Total Income Amount"}),e.jsxs("h4",{className:"card-text",children:["₹",t.totalIncomeAmount.toLocaleString()]})]})]})})})});if(n==="2")return e.jsx("div",{className:"summary-cards row g-3",children:e.jsx("div",{className:"col-md-6 col-lg-4",children:e.jsx("div",{className:"card bg-danger-light",children:e.jsxs("div",{className:"card-body d-flex align-items-center",children:[e.jsx("div",{className:"icon-container me-3",children:e.jsx("i",{className:"bi bi-currency-rupee"})}),e.jsxs("div",{children:[e.jsx("h6",{className:"card-title mb-1",children:a("LABELS.total_expense")||"Total Expense"}),e.jsxs("h4",{className:"card-text",children:["₹",O.totalExpense.toLocaleString()]})]})]})})})});if(n==="3"){const r=W.totalProfitLoss>=0,y=Math.abs(W.totalProfitLoss);return e.jsxs("div",{className:"summary-cards row g-3",children:[e.jsx("div",{className:"col-md-4",children:e.jsx("div",{className:"card bg-primary-light",children:e.jsxs("div",{className:"card-body d-flex align-items-center",children:[e.jsx("div",{className:"icon-container me-3",children:e.jsx("i",{className:"bi bi-currency-rupee"})}),e.jsxs("div",{children:[e.jsx("h6",{className:"card-title mb-1",children:a("LABELS.income_grand_total")||"Income Grand Total"}),e.jsxs("h4",{className:"card-text",children:["₹",W.totalIncome.toLocaleString()]})]})]})})}),e.jsx("div",{className:"col-md-4",children:e.jsx("div",{className:"card bg-danger-light",children:e.jsxs("div",{className:"card-body d-flex align-items-center",children:[e.jsx("div",{className:"icon-container me-3",children:e.jsx("i",{className:"bi bi-currency-rupee"})}),e.jsxs("div",{children:[e.jsx("h6",{className:"card-title mb-1",children:a("LABELS.total_expenses")||"Total Expenses"}),e.jsxs("h4",{className:"card-text",children:["₹",W.totalExpenses.toLocaleString()]})]})]})})}),e.jsx("div",{className:"col-md-4",children:e.jsx("div",{className:`card ${r?"bg-success-light":"bg-danger-light"}`,children:e.jsxs("div",{className:"card-body d-flex align-items-center",children:[e.jsx("div",{className:"icon-container me-3",children:e.jsx("i",{className:"bi bi-currency-rupee"})}),e.jsxs("div",{children:[e.jsx("h6",{className:"card-title mb-1",children:r?a("LABELS.profit")||"Profit":a("LABELS.loss")||"Loss"}),e.jsxs("h4",{className:"card-text",children:["₹",y.toLocaleString()]})]})]})})})]})}return null},ge=()=>{const r=Fe();return e.jsxs("div",{className:"top-products-section row mt-4",children:[e.jsx("div",{className:"col-md-6",children:e.jsxs("div",{className:"card",children:[e.jsx("div",{className:"card-header",children:a("LABELS.top_products")}),e.jsx("div",{className:"card-body",children:r.map((y,j)=>e.jsxs("div",{className:"d-flex justify-content-between align-items-center mb-3",children:[e.jsxs("div",{children:[e.jsx(CBadge,{color:["primary","success","info"][j],className:"badge-rank me-2",children:j+1}),y.product_name]}),e.jsxs("div",{className:"text-end",children:[e.jsxs("strong",{children:["₹",Number(y.totalRevenue).toLocaleString()]}),e.jsxs("small",{className:"text-muted ms-2",children:["(",y.percentage,"%)"]})]})]},j))})]})}),e.jsx("div",{className:"col-md-6",children:e.jsxs("div",{className:"card",children:[e.jsx("div",{className:"card-header",children:a("LABELS.revenue_distribution")}),e.jsx("div",{className:"card-body",children:e.jsx(ft,{data:et()})})]})})]})},V=()=>{let r="",y=[],j=[];if(n==="1"?(y=["Date","Project","Income Amount"],j=t.data.map(g=>[g.date,g.projectName,g.totalIncomeAmount])):n==="2"?(y=["Expense Date","Project","Expense Amount"],j=O.data.map(g=>[g.expenseDate,g.projectName,g.totalExpense])):n==="3"&&(y=["Date","Project","Total Income","Total Expenses","Profit/Loss"],j=W.Data.map(g=>[g.date,g.projectName,g.totalIncome,g.totalExpenses,g.profitLoss])),j.length===0){E("warning",a("MSG.no_data_to_download")||"No data available to download");return}r+=y.join(",")+`
`,j.forEach(g=>{r+=g.map(Q=>`"${Q??""}"`).join(",")+`
`});const te=new Blob([r],{type:"text/csv;charset=utf-8;"}),le=URL.createObjectURL(te),ae=document.createElement("a");ae.href=le,ae.setAttribute("download","report.csv"),document.body.appendChild(ae),ae.click(),document.body.removeChild(ae),URL.revokeObjectURL(le)};return e.jsxs(gt,{children:[e.jsx("div",{className:"responsive-container",children:e.jsxs(Be,{activeItemKey:f,onChange:Xe,children:[e.jsxs($e,{variant:"tabs",className:"mb-3",children:[e.jsx(oe,{itemKey:"Year",children:a("LABELS.year")}),e.jsx(oe,{itemKey:"Quarter",children:a("LABELS.quarter")}),e.jsx(oe,{itemKey:"Month",children:a("LABELS.month")}),e.jsx(oe,{itemKey:"Week",children:a("LABELS.week")}),e.jsx(oe,{itemKey:"Custom",children:a("LABELS.custom")})]}),e.jsxs(ot,{children:[e.jsxs(ce,{className:"p-3",itemKey:"Custom",children:[e.jsxs("div",{className:"d-none d-md-flex mb-3 justify-content-between",children:[e.jsx("div",{className:"flex-fill mx-1",children:e.jsx(Ue,{setStateCustom:C})}),e.jsx("div",{className:"flex-fill mx-1",children:e.jsxs(Y,{value:c,onChange:r=>q(r.target.value),className:"larger-dropdown",children:[e.jsx("option",{value:"",children:a("LABELS.select_project")}),x.map(r=>e.jsx("option",{value:r.value,children:r.label},r.value))]})}),e.jsx("div",{className:"flex-fill mx-1",children:e.jsx(Z,{setSelectedOption:l,ReportOptions:o,selectedOption:n})}),e.jsxs("div",{className:"flex-fill mx-1 d-flex",children:[e.jsx(X,{fetchReportData:J}),e.jsx(G,{color:"info",className:"ms-2",style:{height:"38px"},onClick:V,children:a("LABELS.download")})]})]}),e.jsx("div",{className:"d-md-none mb-3",children:e.jsxs("div",{className:"row gy-3",children:[e.jsx("div",{className:"col-12",children:e.jsx(Ue,{setStateCustom:C})}),e.jsx("div",{className:"col-12",children:e.jsxs(Y,{value:c,onChange:r=>q(r.target.value),className:"larger-dropdown",children:[e.jsx("option",{value:"",children:a("LABELS.select_project")}),x.map(r=>e.jsx("option",{value:r.value,children:r.label},r.value))]})}),e.jsx("div",{className:"col-12",children:e.jsx(Z,{setSelectedOption:l,ReportOptions:o,selectedOption:n})}),e.jsxs("div",{className:"col-12 d-flex justify-content-start",children:[e.jsx(X,{fetchReportData:J}),e.jsx(G,{color:"info",className:"ms-2",onClick:V,children:a("LABELS.download")})]})]})}),(t.data.length>0||O.data.length>0)&&fe(),n==="4"&&w.length>0&&ge(),e.jsx("div",{className:"mt-3",children:e.jsx(ve,{selectedOption:n,salesData:t,expenseData:O,pnlData:W,expenseType:xe,productWiseData:w,onLoadMore:pe,hasMorePages:M,isFetchingMore:D,scrollCursor:ee})})]}),e.jsxs(ce,{className:"p-3",itemKey:"Month",children:[e.jsxs("div",{className:"d-none d-md-flex mb-3 justify-content-between",children:[e.jsx("div",{className:"flex-fill mx-1",children:e.jsx(He,{setStateMonth:h})}),e.jsx("div",{className:"flex-fill mx-1",children:e.jsxs(Y,{value:c,onChange:r=>q(r.target.value),className:"larger-dropdown",children:[e.jsx("option",{value:"",children:a("LABELS.select_project")}),x.map(r=>e.jsx("option",{value:r.value,children:r.label},r.value))]})}),e.jsx("div",{className:"flex-fill mx-1",children:e.jsx(Z,{setSelectedOption:l,ReportOptions:o,selectedOption:n})}),e.jsxs("div",{className:"flex-fill mx-1 d-flex",children:[e.jsx(X,{fetchReportData:J}),e.jsx(G,{color:"info",className:"ms-2",style:{height:"38px"},onClick:V,children:a("LABELS.download")})]})]}),e.jsx("div",{className:"d-md-none mb-3",children:e.jsxs("div",{className:"row gy-3",children:[e.jsx("div",{className:"col-12",children:e.jsx(He,{setStateMonth:h})}),e.jsx("div",{className:"col-12",children:e.jsxs(Y,{value:c,onChange:r=>q(r.target.value),className:"larger-dropdown",children:[e.jsx("option",{value:"",children:a("LABELS.select_project")}),x.map(r=>e.jsx("option",{value:r.value,children:r.label},r.value))]})}),e.jsx("div",{className:"col-12",children:e.jsx(Z,{setSelectedOption:l,ReportOptions:o,selectedOption:n})}),e.jsxs("div",{className:"col-12 d-flex justify-content-start",children:[e.jsx(X,{fetchReportData:J}),e.jsx(G,{color:"info",className:"ms-2",onClick:V,children:a("LABELS.download")})]})]})}),(t.data.length>0||O.data.length>0)&&fe(),n==="3"&&ne&&tt(),n==="4"&&w.length>0&&ge(),e.jsx("div",{className:"mt-3",children:e.jsx(ve,{selectedOption:n,salesData:t,expenseData:O,pnlData:W,expenseType:xe,productWiseData:w,onLoadMore:pe,hasMorePages:M,isFetchingMore:D,scrollCursor:ee})})]}),e.jsxs(ce,{className:"p-3",itemKey:"Quarter",children:[e.jsxs("div",{className:"d-none d-md-flex mb-3 justify-content-between",children:[e.jsx("div",{className:"flex-fill mx-1",children:e.jsx(Je,{setStateQuarter:k})}),e.jsx("div",{className:"flex-fill mx-1",children:e.jsxs(Y,{value:c,onChange:r=>q(r.target.value),className:"larger-dropdown",children:[e.jsx("option",{value:"",children:a("LABELS.select_project")}),x.map(r=>e.jsx("option",{value:r.value,children:r.label},r.value))]})}),e.jsx("div",{className:"flex-fill mx-1",children:e.jsx(Z,{setSelectedOption:l,ReportOptions:o,selectedOption:n})}),e.jsxs("div",{className:"flex-fill mx-1 d-flex",children:[e.jsx(X,{fetchReportData:J}),e.jsx(G,{color:"info",className:"ms-2",style:{height:"38px"},onClick:V,children:a("LABELS.download")})]})]}),e.jsx("div",{className:"d-md-none mb-3",children:e.jsxs("div",{className:"row gy-3",children:[e.jsx("div",{className:"col-12",children:e.jsx(Je,{setStateQuarter:k})}),e.jsx("div",{className:"col-12",children:e.jsxs(Y,{value:c,onChange:r=>q(r.target.value),className:"larger-dropdown",children:[e.jsx("option",{value:"",children:a("LABELS.select_project")}),x.map(r=>e.jsx("option",{value:r.value,children:r.label},r.value))]})}),e.jsx("div",{className:"col-12",children:e.jsx(Z,{setSelectedOption:l,ReportOptions:o,selectedOption:n})}),e.jsxs("div",{className:"col-12 d-flex justify-content-start",children:[e.jsx(X,{fetchReportData:J}),e.jsx(G,{color:"info",className:"ms-2",onClick:V,children:a("LABELS.download")})]})]})}),(t.data.length>0||O.data.length>0)&&fe(),n==="4"&&w.length>0&&ge(),e.jsx("div",{className:"mt-3",children:e.jsx(ve,{selectedOption:n,salesData:t,expenseData:O,pnlData:W,expenseType:xe,productWiseData:w,onLoadMore:pe,hasMorePages:M,isFetchingMore:D,scrollCursor:ee})})]}),e.jsxs(ce,{className:"p-3",itemKey:"Week",children:[e.jsxs("div",{className:"d-none d-md-flex mb-3 justify-content-between",children:[e.jsx("div",{className:"flex-fill mx-1",children:e.jsx(We,{setStateWeek:z})}),e.jsx("div",{className:"flex-fill mx-1",children:e.jsxs(Y,{value:c,onChange:r=>q(r.target.value),className:"larger-dropdown",children:[e.jsx("option",{value:"",children:a("LABELS.select_project")}),x.map(r=>e.jsx("option",{value:r.value,children:r.label},r.value))]})}),e.jsx("div",{className:"flex-fill mx-1",children:e.jsx(Z,{setSelectedOption:l,ReportOptions:o,selectedOption:n})}),e.jsxs("div",{className:"flex-fill mx-1 d-flex",children:[e.jsx(X,{fetchReportData:J}),e.jsx(G,{color:"info",className:"ms-2",style:{height:"38px"},onClick:V,children:a("LABELS.download")})]})]}),e.jsx("div",{className:"d-md-none mb-3",children:e.jsxs("div",{className:"row gy-3",children:[e.jsx("div",{className:"col-12",children:e.jsx(We,{setStateWeek:z})}),e.jsx("div",{className:"col-12",children:e.jsxs(Y,{value:c,onChange:r=>q(r.target.value),className:"larger-dropdown",children:[e.jsx("option",{value:"",children:a("LABELS.select_project")}),x.map(r=>e.jsx("option",{value:r.value,children:r.label},r.value))]})}),e.jsx("div",{className:"col-12",children:e.jsx(Z,{setSelectedOption:l,ReportOptions:o,selectedOption:n})}),e.jsxs("div",{className:"col-12 d-flex justify-content-start",children:[e.jsx(X,{fetchReportData:J}),e.jsx(G,{color:"info",className:"ms-2",onClick:V,children:a("LABELS.download")})]})]})}),(t.data.length>0||O.data.length>0)&&fe(),n==="4"&&w.length>0&&ge(),e.jsx("div",{className:"mt-3",children:e.jsx(ve,{selectedOption:n,salesData:t,expenseData:O,pnlData:W,expenseType:xe,productWiseData:w,onLoadMore:pe,hasMorePages:M,isFetchingMore:D,scrollCursor:ee})})]}),e.jsxs(ce,{className:"p-3",itemKey:"Year",children:[e.jsxs("div",{className:"d-none d-md-flex mb-3 align-items-end",children:[e.jsx(Ge,{setStateYear:d}),e.jsx("div",{className:"mx-1 mt-2",children:e.jsxs(Y,{value:c,onChange:r=>q(r.target.value),className:"larger-dropdown",children:[e.jsx("option",{value:"",children:a("LABELS.select_project")}),x.map(r=>e.jsx("option",{value:r.value,children:r.label},r.value))]})}),e.jsx("div",{className:"mx-1 mt-2",children:e.jsx(Z,{setSelectedOption:l,ReportOptions:o,selectedOption:n})}),e.jsxs("div",{className:"mx-1 mt-2 d-flex",children:[e.jsx(X,{fetchReportData:J}),e.jsx(G,{color:"info",className:"ms-2",onClick:V,children:a("LABELS.download")})]})]}),e.jsx("div",{className:"d-md-none mb-3",children:e.jsxs("div",{className:"row gy-3",children:[e.jsx("div",{className:"col-12",children:e.jsx(Ge,{setStateYear:d})}),e.jsx("div",{className:"col-12",children:e.jsxs(Y,{value:c,onChange:r=>q(r.target.value),className:"larger-dropdown",children:[e.jsx("option",{value:"",children:a("LABELS.select_project")}),x.map(r=>e.jsx("option",{value:r.value,children:r.label},r.value))]})}),e.jsx("div",{className:"col-12",children:e.jsx(Z,{setSelectedOption:l,ReportOptions:o,selectedOption:n})}),e.jsxs("div",{className:"col-12 d-flex justify-content-start",children:[e.jsx(X,{fetchReportData:J}),e.jsx(G,{color:"info",className:"ms-2",onClick:V,children:a("LABELS.download")})]})]})}),(t.data.length>0||O.data.length>0)&&fe(),n==="4"&&w.length>0&&ge(),e.jsx("div",{className:"mt-3",children:e.jsx(ve,{selectedOption:n,salesData:t,expenseData:O,pnlData:W,expenseType:xe,productWiseData:w,onLoadMore:pe,hasMorePages:M,isFetchingMore:D,scrollCursor:ee})})]})]})]})}),e.jsx("style",{jsx:!0,children:`
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
      `})]})}export{Ut as default};
