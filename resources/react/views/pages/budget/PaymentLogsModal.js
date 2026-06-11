// // src/components/purchase-vendor/PaymentLogsModal.jsx
// import React, { useState } from "react";
// import { CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CButton, CCard, CCardHeader, CCardBody, CTable, CTableHead, CTableBody, CTableRow, CTableHeaderCell, CTableDataCell, CBadge, CRow, CCol, CSpinner, CAlert } from "@coreui/react";
// import CIcon from "@coreui/icons-react";
// import { cilFile, cilSpreadsheet } from "@coreui/icons";
// import { host } from "../../../util/constants";

// const PaymentLogsModal = ({ visible, onClose, logsData, loading, onDownloadPDF, onDownloadExcel }) => {


//   const [previewFile, setPreviewFile] = useState(null);




//   return (
//     <>
//     <CModal visible={visible} onClose={onClose} size="xl" backdrop="static">
//       <CModalHeader onClose={onClose}><CModalTitle>Payment Logs</CModalTitle></CModalHeader>
//       <CModalBody>
//         {loading ? (
//           <div className="text-center py-5"><CSpinner /><p>Loading...</p></div>
//         ) : logsData ? (
//           <>
//             <div className="d-flex justify-content-end gap-2 mb-3">
//               <CButton color="primary" onClick={onDownloadPDF}><CIcon icon={cilFile} /> PDF</CButton>
//               <CButton color="success" onClick={onDownloadExcel}><CIcon icon={cilSpreadsheet} /> Excel</CButton>
//             </div>

//             <CCard className="mb-4">
//               <CCardHeader>Summary</CCardHeader>
//               <CCardBody>
//                 <CRow>
//                   <CCol><strong>Vendor:</strong> {logsData.vendor_details?.vendor_name}</CCol>
//                   <CCol><strong>Total:</strong> ₹{parseFloat(logsData.payment_master?.total_amount || 0).toFixed(2)}</CCol>
//                   <CCol><strong>Paid:</strong> ₹{parseFloat(logsData.payment_master?.paid_amount || 0).toFixed(2)}</CCol>
//                   <CCol><strong>Balance:</strong> ₹{parseFloat(logsData.payment_master?.balance_amount || 0).toFixed(2)}</CCol>
//                 </CRow>
//               </CCardBody>
//             </CCard>

//             <CTable striped bordered hover>
//               <CTableHead color="dark">
//                 <CTableRow>
//                   <CTableHeaderCell>#</CTableHeaderCell>
//                   <CTableHeaderCell>Paid By</CTableHeaderCell>
//                   <CTableHeaderCell>Type</CTableHeaderCell>
//                   <CTableHeaderCell>Amount</CTableHeaderCell>
//                   <CTableHeaderCell>Date</CTableHeaderCell>
//                   <CTableHeaderCell>Description</CTableHeaderCell>


// <CTableHeaderCell>Bank Name</CTableHeaderCell>
//                   <CTableHeaderCell>A/C No</CTableHeaderCell>
//                   <CTableHeaderCell>IFSC</CTableHeaderCell>
//                   <CTableHeaderCell>Transaction ID / UTR</CTableHeaderCell>

//                  <CTableHeaderCell>File</CTableHeaderCell>


//                 </CTableRow>
//               </CTableHead>
//               <CTableBody>
//                 {logsData.payment_logs?.map((log, i) => (
//                   <CTableRow key={log.id}>
//                     <CTableDataCell>{i + 1}</CTableDataCell>
//                     <CTableDataCell>{log.paid_by}</CTableDataCell>
//                     <CTableDataCell><CBadge color={log.payment_type === "Cash" ? "success" : "info"}>{log.payment_type}</CBadge></CTableDataCell>
//                     <CTableDataCell>₹{parseFloat(log.amount).toFixed(2)}</CTableDataCell>
//                     <CTableDataCell>{new Date(log.payment_date).toLocaleDateString()}</CTableDataCell>
//                     <CTableDataCell>{log.description || "-"}</CTableDataCell>

//                     <CTableDataCell>{log.bank_name || "-"}</CTableDataCell>
//                     <CTableDataCell>{log.acc_number || "-"}</CTableDataCell>
//                     <CTableDataCell>{log.ifsc || "-"}</CTableDataCell>
//                     <CTableDataCell>{log.transaction_id || "-"}</CTableDataCell>
                    

// <CTableDataCell>
//   {log.payment_file ? (
//     <CButton
//       size="sm"
//       color="info"
//       onClick={() => setPreviewFile(log.payment_file)}
//     >
//       View
//     </CButton>
//   ) : (
//     <CBadge color="secondary">No File</CBadge>
//   )}
// </CTableDataCell>


//                   </CTableRow>
//                 ))}
//               </CTableBody>
//             </CTable>
//           </>
//         ) : (
//           <CAlert color="info">No payment logs found.</CAlert>
//         )}
//       </CModalBody>
//       <CModalFooter>
//         <CButton color="secondary" onClick={onClose}>Close</CButton>
//       </CModalFooter>
//     </CModal>


// <CModal visible={!!previewFile} onClose={() => setPreviewFile(null)} size="lg">
//   <CModalHeader>
//     <CModalTitle>View File</CModalTitle>
//   </CModalHeader>

//   <CModalBody>
//     {previewFile ? (
//       (() => {
//       const fileName = previewFile.split('/').pop();

//   // Fix missing "img/"
//   const correctedPath = previewFile.startsWith("img/")
//     ? previewFile
//     : "img/" + previewFile;

//   const fileUrl = host + correctedPath;

//   const fileExt = fileName.split('.').pop().toLowerCase();

//         // PDF Preview
//         if (fileExt === "pdf") {
//           return (
//             <iframe
//               src={fileUrl}
//               title="PDF Preview"
//               style={{ width: "100%", height: "70vh", border: "none" }}
//             />
//           );
//         }

//         // Image Preview
//         if (["jpg", "jpeg", "png"].includes(fileExt)) {
//           return (
//             <img
//               src={fileUrl}
//               alt="File"
//               style={{
//                 maxWidth: "100%",
//                 maxHeight: "70vh",
//                 display: "block",
//                 margin: "auto",
//                 borderRadius: "10px"
//               }}
//             />
//           );
//         }

//         // Unsupported type
//         return (
//           <p style={{ color: "red", textAlign: "center" }}>
//             Unsupported file type
//           </p>
//         );
//       })()
//     ) : (
//       <p style={{ color: "red", textAlign: "center" }}>File not available</p>
//     )}
//   </CModalBody>

//   <CModalFooter>
//     <CButton color="secondary" onClick={() => setPreviewFile(null)}>
//       Close
//     </CButton>
//   </CModalFooter>
// </CModal>


// </>

//   );
// };

// export default PaymentLogsModal;













// src/components/purchase-vendor/PaymentLogsModal.jsx
import React, { useState } from "react";
import {
  CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
  CButton, CCard, CCardHeader, CCardBody, CTable, CTableHead,
  CTableBody, CTableRow, CTableHeaderCell, CTableDataCell,
  CBadge, CRow, CCol, CSpinner, CAlert,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilFile, cilSpreadsheet, cilCloudDownload } from "@coreui/icons";
import { host } from "../../../util/constants";

// ─────────────────────────────────────────────────────────────
// Resolve any stored payment_file path to a usable URL.
//   • Full https:// URL  → use as-is  (new S3 / Spaces uploads)
//   • Old local path     → prepend host  (legacy local uploads)
// ─────────────────────────────────────────────────────────────
const resolveFileUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  // Legacy: "img/vendor-payments/file.jpg" → prepend host
  return `${host}/${path.replace(/^\//, '')}`;
};

// Download via blob fetch so cross-origin S3 URLs trigger a file save
const downloadFile = async (path, fileName) => {
  const url  = resolveFileUrl(path);
  const name = fileName || path.split('/').pop().split('?')[0];
  try {
    const res     = await fetch(url);
    if (!res.ok) throw new Error('fetch failed');
    const blob    = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link    = document.createElement('a');
    link.href     = blobUrl;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  } catch {
    window.open(url, '_blank');
  }
};

const PaymentLogsModal = ({ visible, onClose, logsData, loading, onDownloadPDF, onDownloadExcel }) => {
  const [previewFile, setPreviewFile] = useState(null);

  return (
    <>
      {/* ── Main Logs Modal ───────────────────────────────── */}
      <CModal visible={visible} onClose={onClose} size="xl" backdrop="static">
        <CModalHeader onClose={onClose}>
          <CModalTitle>Payment Logs</CModalTitle>
        </CModalHeader>

        <CModalBody>
          {loading ? (
            <div className="text-center py-5"><CSpinner /><p>Loading...</p></div>
          ) : logsData ? (
            <>
              <div className="d-flex justify-content-end gap-2 mb-3">
                <CButton color="primary" onClick={onDownloadPDF}><CIcon icon={cilFile} /> PDF</CButton>
                <CButton color="success" onClick={onDownloadExcel}><CIcon icon={cilSpreadsheet} /> Excel</CButton>
              </div>

              <CCard className="mb-4">
                <CCardHeader>Summary</CCardHeader>
                <CCardBody>
                  <CRow>
                    <CCol><strong>Vendor:</strong> {logsData.vendor_details?.vendor_name}</CCol>
                    <CCol><strong>Total:</strong> ₹{parseFloat(logsData.payment_master?.total_amount || 0).toFixed(2)}</CCol>
                    <CCol><strong>Paid:</strong> ₹{parseFloat(logsData.payment_master?.paid_amount || 0).toFixed(2)}</CCol>
                    <CCol><strong>Balance:</strong> ₹{parseFloat(logsData.payment_master?.balance_amount || 0).toFixed(2)}</CCol>
                  </CRow>
                </CCardBody>
              </CCard>

              <CTable striped bordered hover>
                <CTableHead color="dark">
                  <CTableRow>
                    <CTableHeaderCell>#</CTableHeaderCell>
                    <CTableHeaderCell>Paid By</CTableHeaderCell>
                    <CTableHeaderCell>Type</CTableHeaderCell>
                    <CTableHeaderCell>Amount</CTableHeaderCell>
                    <CTableHeaderCell>Date</CTableHeaderCell>
                    <CTableHeaderCell>Description</CTableHeaderCell>
                    <CTableHeaderCell>Bank Name</CTableHeaderCell>
                    <CTableHeaderCell>A/C No</CTableHeaderCell>
                    <CTableHeaderCell>IFSC</CTableHeaderCell>
                    <CTableHeaderCell>Transaction ID / UTR</CTableHeaderCell>
                    <CTableHeaderCell>File</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {logsData.payment_logs?.map((log, i) => (
                    <CTableRow key={log.id}>
                      <CTableDataCell>{i + 1}</CTableDataCell>
                      <CTableDataCell>{log.paid_by}</CTableDataCell>
                      <CTableDataCell>
                        <CBadge color={log.payment_type === "Cash" ? "success" : "info"}>
                          {log.payment_type}
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell>₹{parseFloat(log.amount).toFixed(2)}</CTableDataCell>
                      <CTableDataCell>{new Date(log.payment_date).toLocaleDateString()}</CTableDataCell>
                      <CTableDataCell>{log.description || "-"}</CTableDataCell>
                      <CTableDataCell>{log.bank_name || "-"}</CTableDataCell>
                      <CTableDataCell>{log.acc_number || "-"}</CTableDataCell>
                      <CTableDataCell>{log.ifsc || "-"}</CTableDataCell>
                      <CTableDataCell>{log.transaction_id || "-"}</CTableDataCell>
                      <CTableDataCell>
                        {log.payment_file ? (
                          <CButton
                            size="sm"
                            color="info"
                            onClick={() => setPreviewFile(log.payment_file)}
                          >
                            View
                          </CButton>
                        ) : (
                          <CBadge color="secondary">No File</CBadge>
                        )}
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </>
          ) : (
            <CAlert color="info">No payment logs found.</CAlert>
          )}
        </CModalBody>

        <CModalFooter>
          <CButton color="secondary" onClick={onClose}>Close</CButton>
        </CModalFooter>
      </CModal>

      {/* ── File Preview Modal ────────────────────────────── */}
      <CModal visible={!!previewFile} onClose={() => setPreviewFile(null)} size="lg">
        <CModalHeader>
          <CModalTitle>View File</CModalTitle>
        </CModalHeader>

        <CModalBody>
          {previewFile ? (() => {
            // ← KEY FIX: resolveFileUrl handles both S3 full URLs and old local paths
            const fileUrl  = resolveFileUrl(previewFile);
            const fileName = previewFile.split('/').pop().split('?')[0];
            const fileExt  = fileName.split('.').pop().toLowerCase();

            if (fileExt === 'pdf') {
              return (
                <iframe
                  src={fileUrl}
                  title="PDF Preview"
                  style={{ width: '100%', height: '70vh', border: 'none' }}
                />
              );
            }

            if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt)) {
              return (
                <img
                  src={fileUrl}                 /* ← Full S3 URL or resolved local */
                  alt="Payment file"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '70vh',
                    display: 'block',
                    margin: 'auto',
                    borderRadius: '10px',
                  }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              );
            }

            return (
              <p style={{ color: 'red', textAlign: 'center' }}>Unsupported file type</p>
            );
          })() : (
            <p style={{ color: 'red', textAlign: 'center' }}>File not available</p>
          )}
        </CModalBody>

        <CModalFooter>
          {/* Download button — blob fetch works for cross-origin S3 URLs */}
          {previewFile && (
            <CButton
              color="primary"
              onClick={() => downloadFile(previewFile)}
            >
              <CIcon icon={cilCloudDownload} className="me-1" /> Download
            </CButton>
          )}
          <CButton color="secondary" onClick={() => setPreviewFile(null)}>Close</CButton>
        </CModalFooter>
      </CModal>
    </>
  );
};

export default PaymentLogsModal;