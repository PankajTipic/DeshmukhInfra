import{r as n,u as X,b as H,j as e}from"./index-D77JVx93.js";import{C as G,a as K,b as U,c as z}from"./index.esm-CnYARBHd.js";import{i as Z,p as T,s as q}from"./api-C2dAnRUz.js";import{C as J,a as Q}from"./CCardBody-CmpV1lA4.js";import{C as ee}from"./CForm-CvVYu-wE.js";import{C as te}from"./CInputGroup-iSurCesp.js";import{C as re}from"./CInputGroupText-BPolkdL-.js";import{c as ae}from"./RawMaterial-BtjEDAbB.js";import{C as ne}from"./CFormInput-l8xIFq1a.js";import"./CFormControlWrapper-Bm4xoNnJ.js";import"./CFormLabel-Dc8HuNh9.js";var oe=["512 512","<path fill='var(--ci-primary-color, currentColor)' d='M336,113.375H176v144H56V296L255.8,496,456,296.007V257.375H336Zm81.361,176L255.826,450.746,94.616,289.375H208v-144h96v144Z' class='ci-primary'/><rect width='400' height='32' x='56' y='17.376' fill='var(--ci-primary-color, currentColor)' class='ci-primary'/>"];const ie="1.0.37_10_12_2025",he=()=>{const[N,y]=n.useState(!1),[b,m]=n.useState(!1),[x,w]=n.useState(!1),d=X(),v=n.useRef(),{showToast:O}=H(),[p,k]=n.useState(!1),[l,f]=n.useState(["","","","","",""]),[j,I]=n.useState(""),[S,o]=n.useState(""),[u,i]=n.useState(""),[R,F]=n.useState(""),c=n.useRef([]),[s,h]=n.useState(0);n.useEffect(()=>{Z()&&d("/dashboard")},[]),n.useEffect(()=>{const a=t=>{t.preventDefault(),window.deferredPrompt=t,y(!0)};return window.addEventListener("beforeinstallprompt",a),()=>{window.removeEventListener("beforeinstallprompt",a)}},[]),n.useEffect(()=>{if(s>0){const a=setTimeout(()=>h(s-1),1e3);return()=>clearTimeout(a)}},[s]);const E=a=>{let t=a.target.value;/^\d*$/.test(t)&&t.length>10&&(t=t.slice(0,10)),F(t)},W=async()=>{if(window.deferredPrompt){window.deferredPrompt.prompt();const{outcome:a}=await window.deferredPrompt.userChoice;a==="accepted"&&(window.deferredPrompt=null,y(!1))}};async function C(a){w(!0);try{const t=await T("/api/send",{email:a});t!=null&&t.ttl_minutes?(i("success"),o(`OTP sent successfully to ${a}. Valid for ${t.ttl_minutes} minutes.`),k(!0),h(t.ttl_minutes*60),setTimeout(()=>{var r;return(r=c.current[0])==null?void 0:r.focus()},100)):(i("danger"),o("Failed to send OTP. Please try again."))}catch(t){console.error("OTP send error:",t),i("danger"),o("Error sending OTP. Please check your email and try again.")}finally{w(!1)}}const D=async a=>{var r;a.preventDefault(),o(""),i("");const t=(r=v.current)==null?void 0:r.value;if(!t){i("danger"),o("Please enter your email or mobile number");return}I(t),await C(t)},B=(a,t)=>{var g;if(!/^\d*$/.test(t))return;const r=[...l];r[a]=t.slice(-1),f(r),t&&a<5&&((g=c.current[a+1])==null||g.focus())},V=(a,t)=>{var r;t.key==="Backspace"&&!l[a]&&a>0&&((r=c.current[a-1])==null||r.focus())},Y=a=>{var g;a.preventDefault();const t=a.clipboardData.getData("text").slice(0,6);if(!/^\d+$/.test(t))return;const r=[...l];t.split("").forEach((_,P)=>{P<6&&(r[P]=_)}),f(r),(g=c.current[Math.min(t.length,5)])==null||g.focus()},L=async a=>{a.preventDefault(),m(!0),o(""),i("");const t=l.join("");if(t.length<6){i("danger"),o("Please enter complete 6-digit OTP"),m(!1);return}try{const r=await T("/api/verify",{email:j,code:t});r!=null&&r.token&&(r!=null&&r.user)?(q(r),O("success","Login Successful!"),r.user.type===1?d("/dashboard"):r.user.type===2||r.user.type===3?d("/worklog"):r.user.type===4?d("/displayPurchesVendors"):d("/")):(i("danger"),o("Invalid OTP. Please try again."))}catch(r){console.error("OTP verify error:",r),i("danger"),o("Invalid OTP or server error. Please try again.")}finally{m(!1)}},A=async()=>{s>0||(f(["","","","","",""]),o(""),i(""),await C(j))},$=()=>{k(!1),f(["","","","","",""]),o(""),i(""),h(0)},M=a=>{const t=Math.floor(a/60),r=a%60;return`${t}:${r.toString().padStart(2,"0")}`};return e.jsxs("div",{className:"min-vh-100 d-flex flex-row align-items-center",style:{background:"linear-gradient(135deg, #667eea 0%, #764ba2 50%, #a855f7 100%)",position:"relative",overflow:"hidden"},children:[e.jsx("div",{style:{position:"absolute",top:"10%",right:"15%",width:"300px",height:"300px",background:"radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)",borderRadius:"50%",animation:"float 25s infinite ease-in-out",filter:"blur(60px)"}}),e.jsx("div",{style:{position:"absolute",top:"60%",right:"5%",width:"200px",height:"200px",background:"radial-gradient(circle, rgba(59, 130, 246, 0.25) 0%, transparent 70%)",borderRadius:"50%",animation:"float 18s infinite ease-in-out reverse",filter:"blur(50px)"}}),e.jsx("div",{style:{position:"absolute",bottom:"20%",left:"10%",width:"350px",height:"350px",background:"radial-gradient(circle, rgba(168, 85, 247, 0.25) 0%, transparent 70%)",borderRadius:"50%",animation:"float 30s infinite ease-in-out",filter:"blur(70px)"}}),e.jsx("div",{style:{position:"absolute",top:"30%",left:"5%",width:"250px",height:"250px",background:"radial-gradient(circle, rgba(96, 165, 250, 0.2) 0%, transparent 70%)",borderRadius:"50%",animation:"float 22s infinite ease-in-out reverse",filter:"blur(55px)"}}),e.jsx("div",{style:{position:"absolute",top:0,left:0,width:"100%",height:"100%",background:"radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)",pointerEvents:"none"}}),e.jsx(G,{fluid:!0,className:"px-3 px-sm-4",style:{position:"relative",zIndex:10},children:e.jsx(K,{className:"justify-content-center",children:e.jsx(U,{xs:12,sm:11,md:9,lg:7,xl:5,xxl:4,children:e.jsx(J,{className:"shadow-lg border-0",style:{borderRadius:"32px",overflow:"hidden",background:"linear-gradient(145deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.08) 100%)",backdropFilter:"blur(30px)",boxShadow:"0 20px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)",border:"1px solid rgba(255, 255, 255, 0.15)"},children:e.jsxs(Q,{className:"p-4 p-sm-5",children:[e.jsxs("div",{className:"text-center mb-3",children:[e.jsxs("div",{style:{width:"80px",height:"80px",background:"linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)",backdropFilter:"blur(20px)",borderRadius:"24px",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",boxShadow:"0 12px 40px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.3)",border:"2px solid rgba(255, 255, 255, 0.2)",position:"relative",overflow:"hidden"},children:[e.jsx("div",{style:{position:"absolute",top:"-50%",left:"-50%",width:"200%",height:"200%",background:"linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%)",animation:"shine 3s infinite"}}),e.jsx("span",{style:{fontSize:"40px",position:"relative",zIndex:1},children:"🔐"})]}),e.jsx("h2",{style:{fontWeight:"800",background:"linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.9) 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",fontSize:"clamp(24px, 5vw, 32px)",marginBottom:"8px",textShadow:"0 4px 20px rgba(0,0,0,0.2)",letterSpacing:"-0.5px"},children:"Welcome Back"}),e.jsx("p",{style:{fontSize:"clamp(13px, 3vw, 15px)",color:"rgba(255, 255, 255, 0.85)",marginBottom:0,fontWeight:"500",letterSpacing:"0.3px"},children:p?"Check your inbox for the code":"Sign in to access your account"})]}),S&&e.jsxs("div",{style:{padding:"14px 18px",borderRadius:"16px",marginBottom:"20px",background:u==="success"?"linear-gradient(135deg, rgba(34, 197, 94, 0.25) 0%, rgba(34, 197, 94, 0.15) 100%)":"linear-gradient(135deg, rgba(239, 68, 68, 0.25) 0%, rgba(239, 68, 68, 0.15) 100%)",backdropFilter:"blur(15px)",border:`1.5px solid ${u==="success"?"rgba(34, 197, 94, 0.4)":"rgba(239, 68, 68, 0.4)"}`,color:"#ffffff",fontSize:"13px",fontWeight:"600",display:"flex",alignItems:"center",gap:"10px",boxShadow:u==="success"?"0 8px 24px rgba(34, 197, 94, 0.2)":"0 8px 24px rgba(239, 68, 68, 0.2)"},children:[e.jsx("span",{style:{fontSize:"18px"},children:u==="success"?"✅":"❌"}),e.jsx("span",{children:S})]}),e.jsxs(ee,{onSubmit:p?L:D,children:[e.jsxs("div",{className:"mb-3",children:[e.jsx("label",{style:{display:"block",marginBottom:"10px",fontSize:"13px",fontWeight:"700",color:"rgba(255, 255, 255, 0.95)",letterSpacing:"0.3px"},children:"Email or Mobile Number"}),e.jsxs(te,{style:{borderRadius:"18px",overflow:"hidden",background:"rgba(255, 255, 255, 0.12)",backdropFilter:"blur(15px)",border:"1.5px solid rgba(255, 255, 255, 0.2)",transition:"all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",boxShadow:"0 4px 20px rgba(0, 0, 0, 0.15)"},className:"glass-input-group",children:[e.jsx(re,{style:{background:"transparent",border:"none",padding:"14px 16px"},children:e.jsx(z,{icon:ae,style:{color:"rgba(255, 255, 255, 0.9)",fontSize:"20px"}})}),e.jsx(ne,{ref:v,placeholder:"Enter your email or mobile",required:!0,value:R,onChange:E,disabled:p,style:{border:"none",padding:"14px 16px 14px 0",fontSize:"15px",background:"transparent",color:"#ffffff",fontWeight:"600"}})]})]}),p&&e.jsxs("div",{className:"mb-3",children:[e.jsxs("div",{className:"d-flex justify-content-between align-items-center mb-2",children:[e.jsx("label",{style:{fontSize:"13px",fontWeight:"700",color:"rgba(255, 255, 255, 0.95)",marginBottom:0,letterSpacing:"0.3px"},children:"Enter 6-Digit OTP"}),s>0&&e.jsxs("span",{style:{fontSize:"12px",color:"#ffffff",fontWeight:"700",background:"linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(59, 130, 246, 0.3) 100%)",padding:"5px 12px",borderRadius:"12px",backdropFilter:"blur(10px)",border:"1px solid rgba(255, 255, 255, 0.2)",boxShadow:"0 4px 12px rgba(0, 0, 0, 0.15)"},children:["⏱️ ",M(s)]})]}),e.jsx("div",{style:{display:"flex",gap:"10px",justifyContent:"center",marginBottom:"16px"},children:l.map((a,t)=>e.jsx("input",{ref:r=>c.current[t]=r,type:"text",inputMode:"numeric",maxLength:1,value:a,onChange:r=>B(t,r.target.value),onKeyDown:r=>V(t,r),onPaste:t===0?Y:void 0,style:{width:"clamp(44px, 12vw, 54px)",height:"clamp(50px, 13vw, 58px)",fontSize:"clamp(20px, 5vw, 24px)",fontWeight:"800",textAlign:"center",borderRadius:"14px",border:"2px solid rgba(255, 255, 255, 0.25)",background:"linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%)",backdropFilter:"blur(15px)",color:"#ffffff",outline:"none",transition:"all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",boxShadow:a?"0 8px 32px rgba(139, 92, 246, 0.4), inset 0 2px 8px rgba(255, 255, 255, 0.15)":"0 4px 16px rgba(0, 0, 0, 0.1)"},className:"otp-input"},t))})]}),e.jsx("div",{className:"mb-3",children:p?e.jsx("button",{type:"submit",disabled:b||l.join("").length<6,style:{width:"100%",background:"linear-gradient(135deg, rgba(34, 197, 94, 0.5) 0%, rgba(16, 185, 129, 0.5) 100%)",backdropFilter:"blur(20px)",padding:"16px",fontSize:"15px",fontWeight:"800",borderRadius:"16px",border:"1.5px solid rgba(255, 255, 255, 0.25)",color:"#ffffff",boxShadow:"0 12px 40px rgba(34, 197, 94, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)",transition:"all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",textTransform:"uppercase",letterSpacing:"1.5px",cursor:b||l.join("").length<6?"not-allowed":"pointer",position:"relative",overflow:"hidden",opacity:b||l.join("").length<6?.6:1},className:"enhanced-button",children:e.jsx("span",{style:{position:"relative",zIndex:2},children:b?e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"spinner-border spinner-border-sm me-2"}),"Verifying..."]}):e.jsx(e.Fragment,{children:"✅ Verify & Login"})})}):e.jsx("button",{type:"submit",disabled:x,style:{width:"100%",background:"linear-gradient(135deg, rgba(139, 92, 246, 0.5) 0%, rgba(59, 130, 246, 0.5) 100%)",backdropFilter:"blur(20px)",padding:"16px",fontSize:"15px",fontWeight:"800",borderRadius:"16px",border:"1.5px solid rgba(255, 255, 255, 0.25)",color:"#ffffff",boxShadow:"0 12px 40px rgba(139, 92, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)",transition:"all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",textTransform:"uppercase",letterSpacing:"1.5px",cursor:x?"not-allowed":"pointer",position:"relative",overflow:"hidden"},className:"enhanced-button",children:e.jsx("span",{style:{position:"relative",zIndex:2},children:x?e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"spinner-border spinner-border-sm me-2"}),"Sending OTP..."]}):e.jsx(e.Fragment,{children:"📧 Send OTP"})})})}),p?e.jsxs("div",{className:"d-flex justify-content-between align-items-center",children:[e.jsx("button",{type:"button",onClick:$,style:{background:"none",border:"none",color:"rgba(255, 255, 255, 0.9)",fontSize:"14px",fontWeight:"700",cursor:"pointer",padding:"10px 0",textDecoration:"none",transition:"all 0.3s ease",letterSpacing:"0.3px"},className:"text-button",children:"← Change Email"}),e.jsx("button",{type:"button",onClick:A,disabled:s>0||x,style:{background:"none",border:"none",color:s>0?"rgba(255, 255, 255, 0.4)":"rgba(255, 255, 255, 0.9)",fontSize:"14px",fontWeight:"700",cursor:s>0?"not-allowed":"pointer",padding:"10px 0",textDecoration:"none",transition:"all 0.3s ease",letterSpacing:"0.3px"},className:"text-button",children:"🔄 Resend OTP"})]}):e.jsx("div",{className:"text-center"})]}),e.jsx("div",{className:"text-center mt-3 pt-3",style:{borderTop:"1.5px solid rgba(255, 255, 255, 0.15)"},children:e.jsx("p",{style:{fontSize:"12px",color:"rgba(255, 255, 255, 0.8)",marginBottom:0,fontWeight:"600",letterSpacing:"0.5px"},children:"🛡️ Secured Infrastructure Portal"})})]})})})})}),N&&e.jsx("button",{onClick:W,style:{position:"fixed",top:"28px",right:"28px",width:"64px",height:"64px",borderRadius:"50%",background:"linear-gradient(135deg, #28a745 0%, #218838 100%)",border:"1.5px solid rgba(0, 0, 0, 0.2)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",boxShadow:"0 12px 40px rgba(0, 0, 0, 0.25)",zIndex:2e3,transition:"transform 0.2s ease-in-out"},className:"install-button",children:e.jsx(z,{icon:oe,style:{fontSize:"26px",color:"#ffffff"}})}),e.jsxs("div",{style:{position:"fixed",bottom:"28px",right:"28px",fontSize:"13px",color:"#ffffff",background:"linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%)",backdropFilter:"blur(20px)",padding:"12px 20px",borderRadius:"22px",border:"1.5px solid rgba(255, 255, 255, 0.2)",zIndex:1e3,fontFamily:"monospace",fontWeight:"800",boxShadow:"0 8px 32px rgba(0, 0, 0, 0.2)",letterSpacing:"1px"},children:["v",ie]}),e.jsx("style",{children:`
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) translateX(0px) rotate(0deg); 
          }
          33% { 
            transform: translateY(-30px) translateX(15px) rotate(3deg); 
          }
          66% { 
            transform: translateY(-15px) translateX(-15px) rotate(-3deg); 
          }
        }

        @keyframes shine {
          0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
          100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
        }

        .glass-input-group:focus-within {
          background: rgba(255, 255, 255, 0.18) !important;
          border-color: rgba(255, 255, 255, 0.4) !important;
          box-shadow: 0 12px 40px rgba(139, 92, 246, 0.25), 0 0 0 4px rgba(139, 92, 246, 0.1) !important;
          transform: translateY(-2px);
        }

        .enhanced-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
        }

        .enhanced-button:hover:not(:disabled)::before {
          left: 100%;
        }

        .enhanced-button:hover:not(:disabled) {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 16px 50px rgba(139, 92, 246, 0.45), inset 0 2px 0 rgba(255, 255, 255, 0.3) !important;
          border-color: rgba(255, 255, 255, 0.4) !important;
        }

        .enhanced-button:active:not(:disabled) {
          transform: translateY(-1px) scale(0.98);
        }

        .otp-input:focus {
          border-color: rgba(139, 92, 246, 0.6) !important;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0.15) 100%) !important;
          box-shadow: 0 12px 40px rgba(139, 92, 246, 0.5), 0 0 0 4px rgba(139, 92, 246, 0.15) !important;
          transform: scale(1.08);
        }

        .text-button:hover:not(:disabled) {
          color: rgba(255, 255, 255, 1) !important;
          text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
          transform: translateX(2px);
        }

        .install-button:hover {
          transform: translateY(-4px) rotate(5deg) scale(1.1);
          box-shadow: 0 16px 50px rgba(139, 92, 246, 0.4) !important;
        }

        input::placeholder {
          color: rgba(255, 255, 255, 0.55);
          font-weight: 500;
        }

        input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Smooth scrollbar styling */
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        /* Enhanced mobile responsiveness */
        @media (max-width: 576px) {
          .min-vh-100 {
            padding: 20px 0;
          }
          
          .enhanced-button {
            padding: 16px !important;
            font-size: 15px !important;
          }

          .install-button {
            width: 56px !important;
            height: 56px !important;
            top: 20px !important;
            right: 20px !important;
          }
        }

        /* Add glass morphism effect on card */
        .shadow-lg {
          animation: none !important;
        }

        @keyframes cardFloat {
          0%, 100% { 
            transform: translateY(0px); 
          }
          50% { 
            transform: translateY(-8px); 
          }
        }

        /* Enhance spinner animation */
        .spinner-border {
          border-width: 3px;
          animation: spinner-border 0.6s linear infinite;
        }

        @keyframes spinner-border {
          to { transform: rotate(360deg); }
        }

        /* Add subtle pulse to alert messages */
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.95; }
        }

        /* Glow effect for focused elements */
        input:focus, button:focus {
          outline: none;
        }

        /* Add shimmer to version badge */
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
      `})]})};export{he as default};
