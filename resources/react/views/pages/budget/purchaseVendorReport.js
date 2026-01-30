
// import React, { useState, useEffect } from "react";
// import {
//   CCard,
//   CCardHeader,
//   CCardBody,
//   CTable,
//   CTableHead,
//   CTableRow,
//   CTableHeaderCell,
//   CTableBody,
//   CTableDataCell,
//   CButton,
//   CCollapse,
//   CSpinner,
//   CAlert,
//   CBadge,
//   CRow,
//   CCol,
// } from "@coreui/react";
// import CIcon from "@coreui/icons-react";
// import { cilSearch } from "@coreui/icons";
// import Select from "react-select";
// import { getAPICall } from "../../../util/api";
// import { useNavigate, useLocation } from "react-router-dom";
// import { exportToPDF, exportToExcel } from "./exportPDFandExcel";

// const PurchaseVendorReport = () => {
//   const [vendors, setVendors] = useState([]);
//   const [selectedVendor, setSelectedVendor] = useState(null);
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [expandedLogs, setExpandedLogs] = useState({});

//   const navigate = useNavigate();
//   const location = useLocation();

//   useEffect(() => {
//     const fetchVendors = async () => {
//       try {
//         const res = await getAPICall("/api/getPurchesVendor");
//         const vendorOptions = (res || []).map((v) => ({
//           value: v.id,
//           label: v.name || v.vendor_name || "Unnamed Vendor",
//         }));

//         setVendors(vendorOptions);

//         const passedVendorId = location.state?.vendorId;
//         if (passedVendorId) {
//           const found = vendorOptions.find(
//             (opt) => opt.value === Number(passedVendorId)
//           );
//           if (found) {
//             setSelectedVendor(found);
//           }
//         }
//       } catch (err) {
//         console.error("Failed to load vendors", err);
//         setError("Could not load vendor list");
//       }
//     };

//     fetchVendors();
//   }, [location.state?.vendorId]);

//   useEffect(() => {
//     if (!selectedVendor?.value) {
//       setData(null);
//       setError("");
//       return;
//     }

//     const fetchReport = async () => {
//       setData(null);
//       setError("");
//       setLoading(true);

//       try {
//         const vendorId = selectedVendor.value;
//         const response = await getAPICall(`/api/vendor-wise-payments?vendor_id=${vendorId}`);

//         const vendorData = response.data;

//         if (vendorData && vendorData.vendor_details) {
//           setData(vendorData);
//           setError("");
//         } else {
//           setError("No purchases or projects found for this vendor");
//           setData(null);
//         }
//       } catch (err) {
//         const errorMessage =
//           err.response?.data?.message ||
//           err.message ||
//           "Failed to load vendor payment details";
//         setError(errorMessage);
//         setData(null);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchReport();
//   }, [selectedVendor]);

//   const toggleLogs = (key) => {
//     setExpandedLogs((prev) => ({
//       ...prev,
//       [key]: !prev[key],
//     }));
//   };

//   const safeSum = (arr, keyPath) => {
//     return (arr || []).reduce((sum, item) => {
//       const val = keyPath.split(".").reduce((o, k) => (o || {})[k], item);
//       return sum + (Number(val) || 0);
//     }, 0);
//   };

//   const goToLedger = () => {
//     if (!selectedVendor) {
//       alert("Please select a vendor first");
//       return;
//     }

//     navigate("/PurchaseVendorLedgerReport", {
//       state: {
//         vendorId: selectedVendor.value,
//         vendorLabel: selectedVendor.label,
//       },
//     });
//   };

//   return (
//     <div className="container-fluid" style={{ padding: '8px' }}>
//       <CCard style={{ marginBottom: '8px' }}>
//         <CCardHeader className="bg-primary text-white d-flex justify-content-between align-items-center" style={{ padding: '8px 12px' }}>
//           <strong style={{ fontSize: '0.95rem' }}>Vendor Wise Purchase & Payment Report</strong>
//           <small>Select a vendor to view purchases & payments</small>
//         </CCardHeader>

//         <CCardBody style={{ padding: '12px' }}>
//           <div className="row align-items-end" style={{ gap: '8px', marginBottom: '12px' }}>
//             <div className="col-md-6 col-lg-5">
//               <label className="form-label fw-bold" style={{ marginBottom: '4px', fontSize: '0.9rem' }}>
//                 Select Vendor <span className="text-danger">*</span>
//               </label>

//               <Select
//                 placeholder="Search vendor name..."
//                 options={vendors}
//                 value={selectedVendor}
//                 onChange={setSelectedVendor}
//                 isSearchable
//                 isClearable
//                 styles={{
//                   control: (base) => ({
//                     ...base,
//                     minHeight: "36px",
//                     fontSize: '0.9rem'
//                   }),
//                 }}
//               />
//             </div>

//             <div className="col-md-6 col-lg-4 d-flex flex-wrap" style={{ gap: '6px' }}>
//               <CButton
//                 color="primary"
//                 onClick={() => setSelectedVendor({ ...selectedVendor })}
//                 disabled={loading || !selectedVendor}
//                 className="flex-grow-1"
//                 style={{ padding: '6px 12px', fontSize: '0.9rem' }}
//               >
//                 <CIcon icon={cilSearch} style={{ marginRight: '4px' }} />
//                 {loading ? "Loading..." : "Refresh"}
//               </CButton>

//               <CButton
//                 color="info"
//                 onClick={goToLedger}
//                 disabled={loading || !selectedVendor}
//                 className="flex-grow-1"
//                 style={{ padding: '6px 12px', fontSize: '0.9rem' }}
//               >
//                 View Ledger Report
//               </CButton>

// {/* New Export Buttons */}
//   <CButton
//     color="success"
//     onClick={() => exportToExcel(data)}
//     disabled={loading || !data}
//     className="flex-grow-1"
//     style={{ padding: '6px 12px', fontSize: '0.9rem' }}
//   >
//     Export Excel
//   </CButton>

//   <CButton
//     color="warning"
//     onClick={() => exportToPDF(data)}
//     disabled={loading || !data}
//     className="flex-grow-1"
//     style={{ padding: '6px 12px', fontSize: '0.9rem' }}
//   >
//     Export PDF
//   </CButton>

//             </div>
//           </div>

//           {loading && (
//             <div className="text-center" style={{ padding: '40px 0' }}>
//               <CSpinner color="primary" variant="grow" size="lg" />
//               <p style={{ marginTop: '12px' }} className="text-muted">Loading vendor payment details...</p>
//             </div>
//           )}

//           {error && !loading && <CAlert color="danger" dismissible style={{ marginBottom: '8px' }}>{error}</CAlert>}

//           {!loading && !selectedVendor && !error && (
//             <CAlert color="info" style={{ marginTop: '12px', marginBottom: '8px' }}>
//               Please select a vendor from the dropdown above to view the report.
//             </CAlert>
//           )}

//           {!loading && data && (
//             <>
//               {/* Vendor Details Header */}
//               <div style={{ marginTop: '12px', marginBottom: '12px', padding: '8px 12px', backgroundColor: '#f8f9fa', borderRadius: '4px', border: '1px solid #dee2e6' }}>
//                 <div className="d-flex justify-content-between align-items-center flex-wrap" style={{ gap: '8px' }}>
//                   <div style={{ fontSize: '0.9rem' }}>
//                     <strong>Vendor:</strong> {data.vendor_details?.vendor_name || "—"}
//                     <CBadge color="info" style={{ marginLeft: '8px', fontSize: '0.75rem' }}>
//                       ID: {data.vendor_details?.vendor_id || "—"}
//                     </CBadge>
                  
//                   <div style={{ fontSize: '0.85rem' }}>
//                     <strong>Mobile:</strong> {data.vendor_details?.mobile || "—"}
//                   </div>
//                   <div style={{ fontSize: '0.85rem' }}>
//                     <strong>Address:</strong> {data.vendor_details?.address || "—"}
//                   </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Summary Cards in Single Row */}
//            {data && (
//   <CRow  className="g-3">
//     {/* Total Amount */}
//     <CCol md={4}>
//       <CCard className="text-center border shadow-sm h-100">
//         <CCardBody className="py-2 px-2">
//           <small className="text-muted d-block mb-1 fs-6">Total Amount</small>
//           <strong className="fs-4">
//             ₹{(data.vendor_summary?.total_amount ?? 0).toFixed(2)}
//           </strong>
//         </CCardBody>
//       </CCard>
//     </CCol>

//     {/* Paid Amount */}
//     <CCol md={4}>
//       <CCard className="text-center border shadow-sm h-100 border-success-subtle">
//         <CCardBody className="py-2 px-2">
//           <small className="text-success d-block mb-1 fs-6">Paid Amount</small>
//           <strong className="text-success fs-4">
//             ₹{(data.vendor_summary?.paid_amount ?? 0).toFixed(2)}
//           </strong>
//         </CCardBody>
//       </CCard>
//     </CCol>

//     {/* Balance Due */}
//     <CCol md={4}>
//       <CCard className="text-center border shadow-sm h-100 border-danger-subtle">
//         <CCardBody className="py-2 px-2">
//           <small className="text-danger d-block mb-1 fs-6">Balance Due</small>
//           <strong className="text-danger fs-4">
//             ₹{(data.vendor_summary?.balance_amount ?? 0).toFixed(2)}
//           </strong>
//         </CCardBody>
//       </CCard>
//     </CCol>
//   </CRow>
// )}

//               {/* Projects / Purchases / Payment Logs */}
//             {data.projects?.length > 0 ? (
//   data.projects.map((project, pIndex) => {
//     const projectKey = `proj-${project.project_details?.project_id || pIndex}`;

//     const projectTotal = safeSum(project.purchases || [], "purchase_details.total");
//     const projectPaid = safeSum(project.purchases || [], "payment_master.paid_amount");
//     const projectBalance = safeSum(project.purchases || [], "payment_master.balance_amount");

//     return (
//       <div
//         key={projectKey}
//         style={{
//           marginTop: '12px',
//           marginBottom: '12px',
//           border: '1px solid #dee2e6',
//           borderRadius: '4px',
//           padding: '10px',
//           backgroundColor: 'white',
//         }}
//       >
//         {/* Project Header */}
//         <div className="d-flex justify-content-between align-items-center flex-wrap" style={{ marginBottom: '12px', gap: '8px' }}>
//           <h5 style={{ marginBottom: '0', fontSize: '1rem' }}>
//             Project: <strong>{project.project_details?.project_name || "Unnamed Project"}</strong>
//             {project.project_details?.project_id && (
//               <small className="text-muted" style={{ marginLeft: '6px', fontSize: '0.85rem' }}>
//                 (ID: {project.project_details.project_id})
//               </small>
//             )}
//           </h5>
//         </div>

//         {/* Purchase Table */}
//         <CTable striped bordered hover responsive style={{ marginBottom: '12px', fontSize: '0.88rem' }}>
//           <CTableHead >
//             <CTableRow>
//               <CTableHeaderCell style={{ padding: '6px 8px' }}>Material</CTableHeaderCell>
//               <CTableHeaderCell className="text-end" style={{ padding: '6px 8px' }}>Qty</CTableHeaderCell>
//               <CTableHeaderCell className="text-end" style={{ padding: '6px 8px' }}>Rate</CTableHeaderCell>
//               <CTableHeaderCell className="text-end" style={{ padding: '6px 8px' }}>Total</CTableHeaderCell>
//               <CTableHeaderCell className="text-center" style={{ padding: '6px 8px' }}>GST</CTableHeaderCell>
//               <CTableHeaderCell style={{ padding: '6px 8px' }}>Date</CTableHeaderCell>
//               <CTableHeaderCell className="text-end" style={{ padding: '6px 8px' }}>Paid</CTableHeaderCell>
//               <CTableHeaderCell className="text-end" style={{ padding: '6px 8px' }}>Balance</CTableHeaderCell>
//               <CTableHeaderCell style={{ padding: '6px 8px', width: '80px' }}></CTableHeaderCell> {/* Action column */}
//             </CTableRow>
//           </CTableHead>

//           <CTableBody>
//           {project.purchases?.map((purchase, purchaseIndex) => {
//   const logKey = `${projectKey}-purchase-${purchaseIndex}`;
//   const hasLogs = purchase.payment_logs?.length > 0;

//   return (
//     <React.Fragment key={purchaseIndex}>
//       {/* Main Purchase Row */}
//       <CTableRow>
//         <CTableDataCell style={{ padding: '6px 8px' }}>
//           {purchase.purchase_details?.material_name || "—"}
//         </CTableDataCell>
//         <CTableDataCell className="text-end" style={{ padding: '6px 8px' }}>
//           {purchase.purchase_details?.qty ?? "—"}
//         </CTableDataCell>
//         <CTableDataCell className="text-end" style={{ padding: '6px 8px' }}>
//           ₹{(purchase.purchase_details?.price_per_unit ?? 0)}
//         </CTableDataCell>
//         <CTableDataCell className="text-end fw-bold" style={{ padding: '6px 8px' }}>
//           ₹{(purchase.purchase_details?.total ?? 0)}
//         </CTableDataCell>
//         <CTableDataCell className="text-center" style={{ padding: '6px 8px' }}>
//           {purchase.purchase_details?.gst_included ? (
//             <CBadge color="success">
//               {purchase.purchase_details?.gst_percent ?? 0}%
//             </CBadge>
//           ) : (
//             <CBadge color="secondary">No GST</CBadge>
//           )}
//         </CTableDataCell>
//         <CTableDataCell style={{ padding: '6px 8px' }}>
//           {purchase.purchase_details?.date || "—"}
//         </CTableDataCell>
//         <CTableDataCell className="text-end text-success fw-bold" style={{ padding: '6px 8px' }}>
//           ₹{(purchase.payment_master?.paid_amount ?? 0)}
//         </CTableDataCell>
//         <CTableDataCell className="text-end text-danger fw-bold" style={{ padding: '6px 8px' }}>
//           ₹{(purchase.payment_master?.balance_amount ?? 0)}
//         </CTableDataCell>
//         <CTableDataCell style={{ padding: '6px 8px', textAlign: 'center' }}>
//           {hasLogs && (
//             <CButton
//               color="info"
//               size="sm"
//               variant="outline"
//               onClick={() => toggleLogs(logKey)}
//               style={{ padding: '2px 6px', fontSize: '0.75rem' }}
//             >
//               {expandedLogs[logKey] ? "Hide" : "Logs"}
//             </CButton>
//           )}
//         </CTableDataCell>
//       </CTableRow>

//       {/* Payment Logs Sub-Row (no background) */}
//       <CTableRow>
//         <CTableDataCell colSpan="9" style={{ padding: 0, border: 0 }}>
//           <CCollapse visible={!!expandedLogs[logKey]}>
//             {hasLogs ? (
//               <div style={{ padding: '8px 12px' }}>  {/* ← Removed bg & border */}
//                 <small className="text-primary fw-bold d-block mb-2">
//                   Payment Logs for: {purchase.purchase_details?.material_name || "this purchase"}
//                 </small>
//                 <CTable small responsive style={{ marginBottom: 0, fontSize: '0.82rem' }}>
//                   <CTableHead>
//                     <CTableRow>
//                       <CTableHeaderCell style={{ padding: '4px 6px' }}>Date</CTableHeaderCell>
//                       <CTableHeaderCell className="text-end" style={{ padding: '4px 6px' }}>Amount</CTableHeaderCell>
//                       <CTableHeaderCell style={{ padding: '4px 6px' }}>Mode</CTableHeaderCell>
//                       <CTableHeaderCell style={{ padding: '4px 6px' }}>Paid By</CTableHeaderCell>
//                       <CTableHeaderCell style={{ padding: '4px 6px' }}>Remark</CTableHeaderCell>
//                     </CTableRow>
//                   </CTableHead>
//                   <CTableBody>
//                     {purchase.payment_logs.map((log, logIdx) => (
//                       <CTableRow key={logIdx}>
//                         <CTableDataCell style={{ padding: '4px 6px' }}>{log.payment_date || "—"}</CTableDataCell>
//                         <CTableDataCell className="text-end fw-bold" style={{ padding: '4px 6px' }}>
//                           ₹{(log.amount ?? 0)}
//                         </CTableDataCell>
//                         <CTableDataCell style={{ padding: '4px 6px' }}>
//                           <CBadge color="info">
//                             {(log.payment_type || "—").toUpperCase()}
//                           </CBadge>
//                         </CTableDataCell>
//                         <CTableDataCell style={{ padding: '4px 6px' }}>{log.paid_by || "—"}</CTableDataCell>
//                         <CTableDataCell style={{ padding: '4px 6px' }}>{log.remark || "—"}</CTableDataCell>
//                       </CTableRow>
//                     ))}
//                   </CTableBody>
//                 </CTable>
//               </div>
//             ) : null}
//           </CCollapse>
//         </CTableDataCell>
//       </CTableRow>
//     </React.Fragment>
//   );
// })}

//             {/* Project Total Row */}
//             <CTableRow className="fw-bold">
//               <CTableDataCell colSpan="3" className="text-end" style={{ padding: '8px' }}>
//                 Project Total
//               </CTableDataCell>
//               <CTableDataCell className="text-end" style={{ padding: '8px' }}>
//                 ₹{projectTotal}
//               </CTableDataCell>
//               <CTableDataCell style={{ padding: '8px' }} />
//               <CTableDataCell style={{ padding: '8px' }} />
//               <CTableDataCell className="text-end text-success" style={{ padding: '8px' }}>
//                 ₹{projectPaid}
//               </CTableDataCell>
//               <CTableDataCell className="text-end text-danger" style={{ padding: '8px' }}>
//                 ₹{projectBalance}
//               </CTableDataCell>
//               <CTableDataCell style={{ padding: '8px' }} />
//             </CTableRow>
//           </CTableBody>
//         </CTable>
//       </div>
//     );
//   })
// ) : (
//   <CAlert color="warning" className="text-center py-3 mt-3">
//     No projects or purchases found for this vendor.
//   </CAlert>
// )}
//             </>
//           )}
//         </CCardBody>
//       </CCard>
//     </div>
//   );
// };

// export default PurchaseVendorReport;































import React, { useState, useEffect } from "react";
import {
  CCard,
  CCardHeader,
  CCardBody,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CCollapse,
  CSpinner,
  CAlert,
  CBadge,
  CRow,
  CCol,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
  CFormInput,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilSearch, cilArrowRight } from "@coreui/icons";
import Select from "react-select";
import { getAPICall } from "../../../util/api";
import { useNavigate, useLocation } from "react-router-dom";
import { exportToPDF, exportToExcel, exportDateWisePDF, exportDateWiseExcel  } from "./exportPDFandExcel";

const PurchaseVendorReport = () => {
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [data, setData] = useState(null);           // project-wise data
  const [ledgerData, setLedgerData] = useState(null); // date-wise / ledger data
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("project"); // 'project' or 'date'
  const [expandedLogs, setExpandedLogs] = useState({});

  // ── NEW states for date filter ──
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [appliedStartDate, setAppliedStartDate] = useState(""); // what is actually sent to API
  const [appliedEndDate, setAppliedEndDate] = useState("");

 
 const [filterStartDate, setFilterStartDate] = useState("");     // input field
 const [filterEndDate,   setFilterEndDate]   = useState("");
 const [appliedFromDate, setAppliedFromDate] = useState("");     // actually sent to API
  const [appliedToDate,   setAppliedToDate]   = useState("");

  // Add near other useState declarations
const [projects, setProjects] = useState([]);
const [filterProject, setFilterProject] = useState(null);   // selected project object {value, label}
const [appliedProjectId, setAppliedProjectId] = useState(null);  // actually sent to API

const [materials, setMaterials] = useState([]);              // array of strings
const [selectedMaterial, setSelectedMaterial] = useState(null);  // {value, label} or null
const [appliedMaterialName, setAppliedMaterialName] = useState(null); // string sent to API

  const navigate = useNavigate();
  const location = useLocation();

  // ────────────────────────────────────────────────
  // 1. Load vendors list + pre-select if passed
  // ────────────────────────────────────────────────
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const res = await getAPICall("/api/getPurchesVendor");
        const vendorOptions = (res || []).map((v) => ({
          value: v.id,
          label: v.name || v.vendor_name || "Unnamed Vendor",
        }));

        setVendors(vendorOptions);

        const passedVendorId = location.state?.vendorId;
        if (passedVendorId) {
          const found = vendorOptions.find((opt) => opt.value === Number(passedVendorId));
          if (found) setSelectedVendor(found);
        }
      } catch (err) {
        console.error("Failed to load vendors", err);
        setError("Could not load vendor list");
      }
    };

    fetchVendors();
  }, [location.state?.vendorId]);


  useEffect(() => {
  const fetchProjects = async () => {
    try {
      const res = await getAPICall("/api/projects");
      setProjects(res || []);
    } catch (err) {
      console.error("Failed to load projects", err);
      // Optional: show toast/notification
      // showToast('danger', 'Failed to load projects');
    }
  };

  fetchProjects();
}, []);

useEffect(() => {
  const fetchMaterials = async () => {
    try {
      const res = await getAPICall("/api/materialList");
      // res is array like ["Ciment", "Sand (Updated)", "Pipes", ...]
      const materialOptions = (res || []).map(name => ({
        value: name,
        label: name,
      }));

      setMaterials(materialOptions);
    } catch (err) {
      console.error("Failed to load materials", err);
      // Optional: setError("Could not load material list");
    }
  };

  fetchMaterials();
}, []);
  


useEffect(() => {
  if (!selectedVendor?.value) {
    setData(null);
    setLedgerData(null);
    setError("");
    return;
  }

  const fetchBoth = async () => {
    setLoading(true);
    setError("");
    setData(null);
    setLedgerData(null);

    try {
      const vendorId = selectedVendor.value;

      // Common date values
      const from = appliedFromDate || filterStartDate; // fallback if needed
      const to   = appliedToDate   || filterEndDate;
      const projectId = appliedProjectId;
      const material = appliedMaterialName;

      // ── 1. Project-wise report ────────────────────────────────
      let projectUrl = `/api/vendor-wise-payments?vendor_id=${vendorId}`;
      if (from)  projectUrl += `&from_date=${from}`;
      if (to)    projectUrl += `&to_date=${to}`;
      if (projectId)  projectUrl += `&project_id=${projectId}`;
      if (material)   projectUrl += `&material_name=${encodeURIComponent(material)}`;

      const projectRes = await getAPICall(projectUrl);
      const projectData = projectRes.data || projectRes; // adjust depending on your getAPICall wrapper

      if (projectData?.vendor_details) {
        setData(projectData);
      }

      // ── 2. Ledger / date-wise report ──────────────────────────
      let ledgerUrl = `/api/getVendorLedgerReport?vendor_id=${vendorId}`;
      if (from)  ledgerUrl += `&start_date=${from}`;
      if (to)    ledgerUrl += `&end_date=${to}`;
      if (projectId)  ledgerUrl += `&project_id=${projectId}`;
      if (material)   ledgerUrl += `&material_name=${encodeURIComponent(material)}`;

      const ledgerRes = await getAPICall(ledgerUrl);
      const ledgerDataResponse = ledgerRes.data || ledgerRes;

      console.log(ledgerDataResponse);
      

      if (ledgerDataResponse?.vendor_details) {
        setLedgerData(ledgerDataResponse);
      }

      setError("");
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || "Failed to load report data";
      setError(msg);
      setData(null);
      setLedgerData(null);
    } finally {
      setLoading(false);
    }
  };

  fetchBoth();
}, [selectedVendor, appliedFromDate, appliedToDate, appliedProjectId, appliedMaterialName]);






  const toggleLogs = (key) => {
    setExpandedLogs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const safeSum = (arr, keyPath) => {
    return (arr || []).reduce((sum, item) => {
      const val = keyPath.split(".").reduce((o, k) => (o || {})[k], item);
      return sum + (Number(val) || 0);
    }, 0);
  };

  const goToLedger = () => {
    if (!selectedVendor) {
      alert("Please select a vendor first");
      return;
    }
    navigate("/PurchaseVendorLedgerReport", {
      state: {
        vendorId: selectedVendor.value,
        vendorLabel: selectedVendor.label,
      },
    });
  };

  const formatAmount = (val) => {
    const num = Number(val) || 0;
    return num.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleApplyFilter = () => {
    // Optional: basic validation
    if (startDate && endDate && startDate > endDate) {
      setError("Start date cannot be after end date");
      return;
    }
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
  };

  // ── NEW: Clear filter ──
  const handleClearFilter = () => {
    setStartDate("");
    setEndDate("");
    setAppliedStartDate("");
    setAppliedEndDate("");
  };

  // ────────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────────
  return (
    <div className="container-fluid" style={{ padding: "8px" }}>
      <CCard style={{ marginBottom: "8px" }}>
        <CCardHeader
          className="bg-primary text-white d-flex justify-content-between align-items-center"
          style={{ padding: "8px 12px" }}
        >
          <strong style={{ fontSize: "0.95rem" }}>Vendor Wise Purchase & Payment Report</strong>
          <small>Select a vendor to view purchases & payments</small>
        </CCardHeader>

        <CCardBody style={{ padding: "12px" }}>
          {/* Vendor Select + Buttons */}
          <div className="row align-items-end" style={{ gap: "8px", marginBottom: "12px" }}>
            <div className="col-md-6 col-lg-5">
              <label className="form-label fw-bold" style={{ marginBottom: "4px", fontSize: "0.9rem" }}>
                Select Vendor <span className="text-danger">*</span>
              </label>
              <Select
                placeholder="Search vendor name..."
                options={vendors}
                value={selectedVendor}
                onChange={setSelectedVendor}
                isSearchable
                isClearable
                styles={{
                  control: (base) => ({
                    ...base,
                    minHeight: "36px",
                    fontSize: "0.9rem",
                  }),
                }}
              />
            </div>

            <div className="col-md-6 col-lg-6 d-flex flex-wrap gap-2">
              <CButton
                color="primary"
                onClick={() => setSelectedVendor({ ...selectedVendor })}
                disabled={loading || !selectedVendor}
                style={{ padding: "6px 12px", fontSize: "0.9rem" }}
              >
                <CIcon icon={cilSearch} style={{ marginRight: "4px" }} />
                {loading ? "Loading..." : "Refresh"}
              </CButton>

              {/* <CButton
                color="info"
                onClick={goToLedger}
                disabled={loading || !selectedVendor}
                style={{ padding: "6px 12px", fontSize: "0.9rem" }}
              >
                View Full Ledger
              </CButton> */}

              {activeTab === "project" && (
<>
              <CButton
                color="success"
                onClick={() => exportToExcel(data)}
                disabled={loading || !data}
                style={{ padding: "6px 12px", fontSize: "0.9rem" }}
              >
                Export Excel
              </CButton>

              <CButton
                color="warning"
                onClick={() => exportToPDF(data)}
                disabled={loading || !data}
                style={{ padding: "6px 12px", fontSize: "0.9rem" }}
              >
                Export PDF
              </CButton>
</>
              )}



              {activeTab === "date" && (
      <>
        {/* <CButton
          color="success"
          onClick={() => exportDateWiseExcel(ledgerData)}
          disabled={loading || !ledgerData?.ledger_entries?.length}
          style={{ padding: "6px 12px", fontSize: "0.9rem" }}
        >
          Export Excel 
        </CButton> */}

        <CButton
      color="success"
      onClick={() => exportDateWiseExcel(ledgerData, appliedStartDate, appliedEndDate)}
      disabled={loading || !ledgerData?.ledger_entries?.length}
      style={{ padding: "6px 12px", fontSize: "0.9rem" }}
    >
      Export Excel
    </CButton>
        {/* <CButton
          color="warning"
          onClick={() => exportDateWisePDF(ledgerData)}
          disabled={loading || !ledgerData?.ledger_entries?.length}
          style={{ padding: "6px 12px", fontSize: "0.9rem" }}
        >
          Export PDF 
        </CButton> */}
        <CButton
  color="warning"
  onClick={() => exportDateWisePDF(ledgerData, appliedStartDate, appliedEndDate)}
  disabled={loading || !ledgerData?.ledger_entries?.length}
>
  Export PDF
</CButton>
      </>
    )}






            </div>
          </div>



      {/* ── Date filter ── (moved up, visible for both tabs) */}
{/* {selectedVendor && (
  <CRow className="mb-4 g-3 align-items-end">
    <CCol md={3}>
      <label className="form-label fw-bold small">From Date</label>
      <CFormInput
        type="date"
        value={filterStartDate}
        onChange={(e) => setFilterStartDate(e.target.value)}
      />
    </CCol>

    <CCol md={3}>
      <label className="form-label fw-bold small">To Date</label>
      <CFormInput
        type="date"
        value={filterEndDate}
        onChange={(e) => setFilterEndDate(e.target.value)}
      />
    </CCol>

    <CCol md="auto" className="d-flex gap-2 align-items-end">
      <CButton
        color="primary"
        onClick={() => {
          if (filterStartDate && filterEndDate && filterStartDate > filterEndDate) {
            setError("From date cannot be after To date");
            return;
          }
          setAppliedFromDate(filterStartDate);
          setAppliedToDate(filterEndDate);
        }}
        disabled={loading}
      >
        Apply Date Filter
      </CButton>

      <CButton
        color="secondary"
        variant="outline"
        onClick={() => {
          setFilterStartDate("");
          setFilterEndDate("");
          setAppliedFromDate("");
          setAppliedToDate("");
        }}
        disabled={loading}
      >
        Clear
      </CButton>
    </CCol>
  </CRow>
)} */}

{selectedVendor && (
  <CRow className="mb-4 g-3 align-items-end">

    {/* Project Filter */}
    <CCol md={4} lg={3}>
      <label className="form-label fw-bold small">Project</label>
      <Select
        placeholder="Filter by Project"
        options={projects.map((p) => ({
          value: p.id,
          label: p.project_name || "Unnamed Project",
        }))}
        value={filterProject}
        onChange={(option) => setFilterProject(option)}
        isClearable
        isSearchable
        styles={{
          control: (base) => ({
            ...base,
            minHeight: "38px",
            fontSize: "0.9rem",
          }),
        }}
      />
    </CCol>

    <CCol md={4} lg={3}>
    <label className="form-label fw-bold small">Material</label>
    <Select
      placeholder="Filter by Material"
      options={materials}
      value={selectedMaterial}
      onChange={(option) => setSelectedMaterial(option)}
      isClearable
      isSearchable
      styles={{ control: base => ({ ...base, minHeight: "38px", fontSize: "0.9rem" }) }}
    />
  </CCol>

    {/* From Date */}
    <CCol md={3}>
      <label className="form-label fw-bold small">From Date</label>
      <CFormInput
        type="date"
        value={filterStartDate}
        onChange={(e) => setFilterStartDate(e.target.value)}
      />
    </CCol>

    {/* To Date */}
    <CCol md={3}>
      <label className="form-label fw-bold small">To Date</label>
      <CFormInput
        type="date"
        value={filterEndDate}
        onChange={(e) => setFilterEndDate(e.target.value)}
      />
    </CCol>

    {/* Buttons */}
    <CCol md="auto" className="d-flex gap-2 align-items-end">
      <CButton
        color="primary"
        onClick={() => {
          // Validation
          if (filterStartDate && filterEndDate && filterStartDate > filterEndDate) {
            setError("From date cannot be after To date");
            return;
          }
          setAppliedFromDate(filterStartDate);
          setAppliedToDate(filterEndDate);
          setAppliedProjectId(filterProject?.value || null);   // ← key line
          setAppliedMaterialName(selectedMaterial?.value || null);
        }}
        disabled={loading}
      >
        Apply Filters
      </CButton>

      <CButton
        color="secondary"
        variant="outline"
        onClick={() => {
          setFilterStartDate("");
          setFilterEndDate("");
          setAppliedFromDate("");
          setAppliedToDate("");
          setFilterProject(null);
          setAppliedProjectId(null);
          setSelectedMaterial(null);              // ← reset dropdown
        setAppliedMaterialName(null);
        }}
        disabled={loading}
      >
        Clear All
      </CButton>
    </CCol>
  </CRow>
)}









          {loading && (
            <div className="text-center py-5">
              <CSpinner color="primary" variant="grow" size="lg" />
              <p className="mt-3 text-muted">Loading vendor details...</p>
            </div>
          )}

          {error && !loading && <CAlert color="danger" dismissible>{error}</CAlert>}

          {!loading && !selectedVendor && !error && (
            <CAlert color="info" className="mt-3">
              Please select a vendor to view the report.
            </CAlert>
          )}

          {!loading && selectedVendor && (data || ledgerData) && (
            <>
              {/* Vendor Quick Info */}
              <div
                className="p-2 mb-3 bg-light border rounded"
                style={{ fontSize: "0.9rem" }}
              >
                <strong>Vendor:</strong> {data?.vendor_details?.vendor_name || ledgerData?.vendor_details?.vendor_name || "—"}
                <CBadge color="info" className="ms-2">
                  ID: {data?.vendor_details?.vendor_id || ledgerData?.vendor_details?.vendor_id || "—"}
                </CBadge>
                <span className="ms-4">
                  <strong>Mobile:</strong> {data?.vendor_details?.mobile || ledgerData?.vendor_details?.mobile || "—"}
                </span>
                <span className="ms-4">
                  <strong>Address:</strong> {data?.vendor_details?.address || ledgerData?.vendor_details?.address || "—"}
                </span>
              </div>

              {/* Summary Cards – always visible */}
              <CRow className="g-3 mb-4">
                <CCol md={4}>
                  <CCard className="text-center border shadow-sm h-100">
                    <CCardBody className="py-3">
                      <small className="text-muted d-block mb-1">Total Amount</small>
                      <strong className="fs-4">
                        ₹{formatAmount(data?.vendor_summary?.total_amount ?? ledgerData?.ledger_summary?.total_debit ?? 0)}
                      </strong>
                    </CCardBody>
                  </CCard>
                </CCol>

                <CCol md={4}>
                  <CCard className="text-center border shadow-sm h-100 border-success-subtle">
                    <CCardBody className="py-3">
                      <small className="text-success d-block mb-1">Paid Amount</small>
                      <strong className="text-success fs-4">
                        ₹{formatAmount(data?.vendor_summary?.paid_amount ?? ledgerData?.ledger_summary?.total_credit ?? 0)}
                      </strong>
                    </CCardBody>
                  </CCard>
                </CCol>

                <CCol md={4}>
                  <CCard className="text-center border shadow-sm h-100 border-danger-subtle">
                    <CCardBody className="py-3">
                      <small className="text-danger d-block mb-1">Balance Due</small>
                      <strong className="text-danger fs-4">
                        ₹{formatAmount(data?.vendor_summary?.balance_amount ?? ledgerData?.ledger_summary?.closing_balance ?? 0)}
                      </strong>
                    </CCardBody>
                  </CCard>
                </CCol>
              </CRow>

              {/* Tabs */}
              <CNav variant="tabs" className="mb-3 border-bottom">
                <CNavItem>
                  <CNavLink
                    active={activeTab === "project"}
                    onClick={() => setActiveTab("project")}
                    style={{ cursor: "pointer" }}
                  >
                    Project-wise
                  </CNavLink>
                </CNavItem>
                <CNavItem>
                  <CNavLink
                    active={activeTab === "date"}
                    onClick={() => setActiveTab("date")}
                    style={{ cursor: "pointer" }}
                  >
                    Date-wise
                  </CNavLink>
                </CNavItem>
              </CNav>

              <CTabContent>
                {/* ──────── PROJECT-WISE ──────── */}
                <CTabPane visible={activeTab === "project"} role="tabpanel">
                  {data?.projects?.length > 0 ? (
                    data.projects.map((project, pIndex) => {
                      const projectKey = `proj-${project.project_details?.project_id || pIndex}`;

                      const projectTotal = safeSum(project.purchases || [], "purchase_details.total");
                      const projectPaid = safeSum(project.purchases || [], "payment_master.paid_amount");
                      const projectBalance = safeSum(project.purchases || [], "payment_master.balance_amount");

                      return (
                        <div
                          key={projectKey}
                          className="mb-4 border rounded shadow-sm p-3 bg-white"
                        >
                          <h5 className="mb-3">
                            Project: <strong>{project.project_details?.project_name || "Unnamed Project"}</strong>
                            {project.project_details?.project_id && (
                              <small className="text-muted ms-2">
                                (ID: {project.project_details.project_id})
                              </small>
                            )}
                          </h5>

                          <CTable striped bordered hover responsive size="sm">
                            <CTableHead>
                              <CTableRow>
                                <CTableHeaderCell>Material</CTableHeaderCell>
                                <CTableHeaderCell className="text-end">Qty</CTableHeaderCell>
                                <CTableHeaderCell className="text-end">Rate</CTableHeaderCell>
                                <CTableHeaderCell className="text-end">Total</CTableHeaderCell>
                                <CTableHeaderCell className="text-center">GST</CTableHeaderCell>
                                <CTableHeaderCell>Date</CTableHeaderCell>
                                <CTableHeaderCell className="text-end">Paid</CTableHeaderCell>
                                <CTableHeaderCell className="text-end">Balance</CTableHeaderCell>
                                <CTableHeaderCell style={{ width: 80 }}></CTableHeaderCell>
                              </CTableRow>
                            </CTableHead>
                            <CTableBody>
                              {project.purchases?.map((purchase, idx) => {
                                const logKey = `${projectKey}-pur-${idx}`;
                                const hasLogs = purchase.payment_logs?.length > 0;

                                return (
                                  <React.Fragment key={idx}>
                                    <CTableRow>
                                      <CTableDataCell>{purchase.purchase_details?.material_name || "—"}</CTableDataCell>
                                      <CTableDataCell className="text-end">{purchase.purchase_details?.qty ?? "—"}</CTableDataCell>
                                      <CTableDataCell className="text-end">
                                        ₹{Number(purchase.purchase_details?.price_per_unit ?? 0).toFixed(2)}
                                      </CTableDataCell>
                                      <CTableDataCell className="text-end fw-bold">
                                        ₹{Number(purchase.purchase_details?.total ?? 0).toFixed(2)}
                                      </CTableDataCell>
                                      <CTableDataCell className="text-center">
                                        {purchase.purchase_details?.gst_included ? (
                                          <CBadge color="success">{purchase.purchase_details?.gst_percent ?? 0}%</CBadge>
                                        ) : (
                                          <CBadge color="secondary">No GST</CBadge>
                                        )}
                                      </CTableDataCell>
                                      <CTableDataCell>{purchase.purchase_details?.date || "—"}</CTableDataCell>
                                      <CTableDataCell className="text-end text-success fw-bold">
                                        ₹{Number(purchase.payment_master?.paid_amount ?? 0).toFixed(2)}
                                      </CTableDataCell>
                                      <CTableDataCell className="text-end text-danger fw-bold">
                                        ₹{Number(purchase.payment_master?.balance_amount ?? 0).toFixed(2)}
                                      </CTableDataCell>
                                      <CTableDataCell className="text-center">
                                        {hasLogs && (
                                          <CButton
                                            color="info"
                                            size="sm"
                                            variant="outline"
                                            onClick={() => toggleLogs(logKey)}
                                          >
                                            {expandedLogs[logKey] ? "Hide" : "Logs"}
                                          </CButton>
                                        )}
                                      </CTableDataCell>
                                    </CTableRow>

                                    <CTableRow>
                                      <CTableDataCell colSpan={9} style={{ padding: 0, border: 0 }}>
                                        <CCollapse visible={!!expandedLogs[logKey]}>
                                          {hasLogs && (
                                            <div className="p-3 bg-light">
                                              <small className="text-primary fw-bold d-block mb-2">
                                                Payment Logs
                                              </small>
                                              <CTable small responsive>
                                                <CTableHead>
                                                  <CTableRow>
                                                    <CTableHeaderCell>Date</CTableHeaderCell>
                                                    <CTableHeaderCell className="text-end">Amount</CTableHeaderCell>
                                                    <CTableHeaderCell>Mode</CTableHeaderCell>
                                                    <CTableHeaderCell>Paid By</CTableHeaderCell>
                                                    <CTableHeaderCell>Remark</CTableHeaderCell>
                                                  </CTableRow>
                                                </CTableHead>
                                                <CTableBody>
                                                  {purchase.payment_logs.map((log, i) => (
                                                    <CTableRow key={i}>
                                                      <CTableDataCell>{log.payment_date || "—"}</CTableDataCell>
                                                      <CTableDataCell className="text-end fw-bold">
                                                        ₹{Number(log.amount ?? 0).toFixed(2)}
                                                      </CTableDataCell>
                                                      <CTableDataCell>
                                                        <CBadge color="info">{(log.payment_type || "—").toUpperCase()}</CBadge>
                                                      </CTableDataCell>
                                                      <CTableDataCell>{log.paid_by || "—"}</CTableDataCell>
                                                      <CTableDataCell>{log.remark || "—"}</CTableDataCell>
                                                    </CTableRow>
                                                  ))}
                                                </CTableBody>
                                              </CTable>
                                            </div>
                                          )}
                                        </CCollapse>
                                      </CTableDataCell>
                                    </CTableRow>
                                  </React.Fragment>
                                );
                              })}

                              {/* Project Total Row */}
                              <CTableRow className="table-active fw-bold">
                                <CTableDataCell colSpan={3} className="text-end">Project Total</CTableDataCell>
                                <CTableDataCell className="text-end">₹{projectTotal.toFixed(2)}</CTableDataCell>
                                <CTableDataCell colSpan={2} />
                                <CTableDataCell className="text-end text-success">₹{projectPaid.toFixed(2)}</CTableDataCell>
                                <CTableDataCell className="text-end text-danger">₹{projectBalance.toFixed(2)}</CTableDataCell>
                                <CTableDataCell />
                              </CTableRow>
                            </CTableBody>
                          </CTable>
                        </div>
                      );
                    })
                  ) : (
                    <CAlert color="warning" className="text-center py-4">
                      No projects or purchases found for this vendor.
                    </CAlert>
                  )}
                </CTabPane>

                {/* ──────── DATE-WISE / LEDGER ──────── */}
                <CTabPane visible={activeTab === "date"} role="tabpanel">
                  {ledgerData?.ledger_entries?.length > 0 ? (
                    <CTable bordered hover responsive className="mb-0">
                      <CTableHead style={{ backgroundColor: "#f1f3f5" }}>
                        <CTableRow>
                          <CTableHeaderCell>Date</CTableHeaderCell>
                          <CTableHeaderCell>Type</CTableHeaderCell>
                          <CTableHeaderCell>Project</CTableHeaderCell>
                          <CTableHeaderCell>Materials</CTableHeaderCell>
                          <CTableHeaderCell>Description</CTableHeaderCell>
                          <CTableHeaderCell className="text-end">Debit</CTableHeaderCell>
                          <CTableHeaderCell className="text-end">Credit</CTableHeaderCell>
                          <CTableHeaderCell className="text-end">Balance</CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {ledgerData.ledger_entries.map((entry, i) => (
                          <CTableRow key={i}>
                            <CTableDataCell>{entry.date || "—"}</CTableDataCell>
                            <CTableDataCell>
                              <CBadge color={entry.type === "Purchase" ? "danger" : "success"}>
                                {entry.type}
                              </CBadge>
                            </CTableDataCell>
                             <CTableDataCell>{entry.project || "—"}</CTableDataCell>
                            <CTableDataCell>{entry.material || "—"}</CTableDataCell>
                           
                            <CTableDataCell>{entry.description || "—"}</CTableDataCell>
                            <CTableDataCell className="text-end text-danger fw-bold">
                              {entry.debit > 0 ? `₹${formatAmount(entry.debit)}` : "—"}
                            </CTableDataCell>
                            <CTableDataCell className="text-end text-success fw-bold">
                              {entry.credit > 0 ? `₹${formatAmount(entry.credit)}` : "—"}
                            </CTableDataCell>
                            <CTableDataCell className="text-end fw-bold">
                              ₹{formatAmount(entry.balance)}
                            </CTableDataCell>
                          </CTableRow>
                        ))}
                      </CTableBody>
                    </CTable>
                  ) : (
                    <CAlert color="info" className="text-center py-4">
                      No date-wise ledger entries available.
                    </CAlert>
                  )}
                </CTabPane>
              </CTabContent>
            </>
          )}
        </CCardBody>
      </CCard>
    </div>
  );
};

export default PurchaseVendorReport;