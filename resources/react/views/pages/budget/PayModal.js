




// // src/components/purchase-vendor/PayModal.jsx
// import React, { useState } from "react";
// import {
//   CModal,
//   CModalHeader,
//   CModalTitle,
//   CModalBody,
//   CModalFooter,
//   CButton,
//   CForm,
//   CFormLabel,
//   CFormInput,
//   CFormSelect,
//   CCol,
//   CRow,
//   CAlert,
//   CSpinner,
//   CNav,
//   CNavItem,
//   CNavLink,
//   CTabContent,
//   CTabPane,
// } from "@coreui/react";
// import { paymentTypes, receiver_bank } from "../../../util/Feilds";

// const PayModal = ({
//   visible,
//   onClose,
//   payForm = {},
//   payError,
//   payLoading,
//   onChange,           // <-- this will now handle file + normal inputs
//   onSubmit,
//   selectedVendorPayment,
 
// }) => {
//   const [activeTab, setActiveTab] = useState("upload");

//   // Helper to show file name / preview
//   const renderFileInfo = () => {
//     if (!payForm.payment_file) return null;

//     const file = payForm.payment_file;
//     const isImage = file.type.startsWith("image/");
//     const isPDF = file.type === "application/pdf";

//     return (
//       <div className="mt-3 p-3 border rounded bg-light">
//         <strong>Selected file:</strong> {file.name} ({(file.size / 1024).toFixed(2)} KB)
//         {isImage && (
//           <div className="mt-2">
//             <img
//               src={URL.createObjectURL(file)}
//               alt="Preview"
//               style={{ maxWidth: "100%", maxHeight: "200px", objectFit: "contain" }}
//             />
//           </div>
//         )}
//         {isPDF && (
//           <div className="mt-2 text-primary">
//             <strong>PDF file selected</strong>
//           </div>
//         )}
//       </div>
//     );
//   };

//   return (
//     <CModal visible={visible} onClose={onClose} backdrop="static" size="lg">
//       <CModalHeader onClose={onClose}>
//         <CModalTitle>Make Payment</CModalTitle>
//       </CModalHeader>

//       <CModalBody>
//         <CForm>
//           {/* Vendor + Balance */}
//           <CRow className="g-3 mb-3">
//             <CCol md={6}>
//               <CFormLabel>Vendor Name</CFormLabel>
//               <div className="form-control bg-light">
//                 {selectedVendorPayment?.purchase?.vendor?.name || "—"}
//               </div>
//             </CCol>
//             <CCol md={6}>
//               <CFormLabel>Remaining Balance</CFormLabel>
//               <div className="form-control text-danger fw-bold">
//                 ₹{parseFloat(selectedVendorPayment?.balance_amount || 0).toFixed(2)}
//               </div>
//             </CCol>
//           </CRow>

//           {/* Paid By + Payment Type */}
//           <CRow className="g-3 mb-3">
//             <CCol md={6}>
//               <CFormLabel>Paid By *</CFormLabel>
//               <CFormSelect
//                 name="paid_by"
//                 value={payForm.paid_by || ""}
//                 onChange={onChange}
//               >
//                 <option value="">Select Paid By</option>
//                 {receiver_bank.map((b) => (
//                   <option key={b.value} value={b.value}>
//                     {b.label}
//                   </option>
//                 ))}
//               </CFormSelect>
//             </CCol>
//             <CCol md={6}>
//               <CFormLabel>Payment Type *</CFormLabel>
//               <CFormSelect
//                 name="payment_type"
//                 value={payForm.payment_type || ""}
//                 onChange={onChange}
//               >
//                 <option value="">Select Payment Type</option>
//                 {paymentTypes.map((t) => (
//                   <option key={t.value} value={t.value}>
//                     {t.label}
//                   </option>
//                 ))}
//               </CFormSelect>
//             </CCol>
//           </CRow>

//           {/* Amount + Date */}
//           <CRow className="g-3 mb-3">
//             <CCol md={6}>
//               <CFormLabel>Amount *</CFormLabel>
//               <CFormInput
//                 type="number"
//                 name="amount"
//                 value={payForm.amount || ""}
//                 onChange={onChange}
//                 step="0.01"
//                 min="0.01"
//                 placeholder="0.00"
//               />
//             </CCol>
//             <CCol md={6}>
//               <CFormLabel>Payment Date *</CFormLabel>
//               <CFormInput
//                 type="date"
//                 name="payment_date"
//                 value={payForm.payment_date || ""}
//                 onChange={onChange}
//                 max={new Date().toISOString().split("T")[0]}
//               />
//             </CCol>
//           </CRow>

//           {/* Description */}
//           <CRow className="mb-3">
//             <CCol>
//               <CFormLabel>Description (optional)</CFormLabel>
//               <CFormInput
//                 name="description"
//                 value={payForm.description || ""}
//                 onChange={onChange}
//                 placeholder="e.g. Payment for material delivery"
//               />
//             </CCol>
//           </CRow>

//           {/* Tabs */}
//           <CNav variant="pills" className="mb-3">
//             <CNavItem>
//               <CNavLink
//                 active={activeTab === "upload"}
//                 onClick={() => setActiveTab("upload")}
//                 style={{ cursor: "pointer" }}
//               >
//                 Upload Photo / File
//               </CNavLink>
//             </CNavItem>
//             <CNavItem>
//               <CNavLink
//                 active={activeTab === "remark"}
//                 onClick={() => setActiveTab("remark")}
//                 style={{ cursor: "pointer" }}
//               >
//                 Remark
//               </CNavLink>
//             </CNavItem>
//           </CNav>

//           <CTabContent>
//             {/* Upload Tab */}
//             <CTabPane visible={activeTab === "upload"}>
//               <CFormLabel>Upload Photo / File (optional)</CFormLabel>
//               <CFormInput
//                 type="file"
//                 name="payment_file"
//                 accept="image/png,image/jpeg,image/jpg,application/pdf"
//                 onChange={onChange}   // same onChange handles file
//               />
//               {renderFileInfo()}
//             </CTabPane>

//             {/* Remark Tab */}
//             <CTabPane visible={activeTab === "remark"}>
//               <CFormLabel>Remark (optional)</CFormLabel>
//               <textarea
//                 className="form-control"
//                 name="remark"
//                 rows="4"
//                 value={payForm.remark || ""}
//                 onChange={onChange}
//                 placeholder="Enter any remark..."
//               />
//             </CTabPane>
//           </CTabContent>

//           {payError && <CAlert color="danger" className="mt-3">{payError}</CAlert>}
//         </CForm>
//       </CModalBody>

//       <CModalFooter>
//         <CButton color="secondary" onClick={onClose}>
//           Cancel
//         </CButton>
//         <CButton color="primary" onClick={()=>onSubmit(activeTab)} disabled={payLoading}>
//           {payLoading ? <CSpinner size="sm" /> : "Submit Payment"}
//         </CButton>
//       </CModalFooter>
//     </CModal>
//   );
// };

// export default PayModal;




















// // src/components/purchase-vendor/PayModal.jsx
// import React, { useState } from "react";
// import {
//   CModal,
//   CModalHeader,
//   CModalTitle,
//   CModalBody,
//   CModalFooter,
//   CButton,
//   CForm,
//   CFormLabel,
//   CFormInput,
//   CFormSelect,
//   CCol,
//   CRow,
//   CAlert,
//   CSpinner,
//   CNav,
//   CNavItem,
//   CNavLink,
//   CTabContent,
//   CTabPane,
// } from "@coreui/react";
// import { paymentTypes, receiver_bank } from "../../../util/Feilds";

// const PayModal = ({
//   visible,
//   onClose,
//   payForm = {},
//   payError,
//   payLoading,
//   onChange,
//   onSubmit,
//   selectedVendorPayment,
// }) => {
//   const [activeTab, setActiveTab] = useState("upload");

//   // Helper to show file name / preview
//   const renderFileInfo = () => {
//     if (!payForm.payment_file) return null;

//     const file = payForm.payment_file;
//     const isImage = file.type.startsWith("image/");
//     const isPDF = file.type === "application/pdf";

//     return (
//       <div className="mt-3 p-3 border rounded bg-light">
//         <strong>Selected file:</strong> {file.name} ({(file.size / 1024).toFixed(2)} KB)
//         {isImage && (
//           <div className="mt-2">
//             <img
//               src={URL.createObjectURL(file)}
//               alt="Preview"
//               style={{ maxWidth: "100%", maxHeight: "200px", objectFit: "contain" }}
//             />
//           </div>
//         )}
//         {isPDF && (
//           <div className="mt-2 text-primary">
//             <strong>PDF file selected</strong>
//           </div>
//         )}
//       </div>
//     );
//   };

//   // Check if payment type is bank transfer (IMPS/NEFT/RTGS)
//   const isBankTransfer = ["imps", "neft", "rtgs"].includes(payForm.payment_type?.toLowerCase());

//   // Check if payment type is UPI
//   const isUPI = payForm.payment_type?.toLowerCase() === "upi";

//   return (
//     <CModal visible={visible} onClose={onClose} backdrop="static" size="xl">
//       <CModalHeader onClose={onClose}>
//         <CModalTitle>Make Payment</CModalTitle>
//       </CModalHeader>

//       <CModalBody>
//         <CForm>
//           {/* Vendor + Balance */}
//           <CRow className="g-3 mb-4">
//             <CCol md={6}>
//               <CFormLabel>Vendor Name</CFormLabel>
//               <div className="form-control bg-light">
//                 {selectedVendorPayment?.purchase?.vendor?.name || "—"}
//               </div>
//             </CCol>
//             <CCol md={6}>
//               <CFormLabel>Remaining Balance</CFormLabel>
//               <div className="form-control text-danger fw-bold">
//                 ₹{parseFloat(selectedVendorPayment?.balance_amount || 0).toFixed(2)}
//               </div>
//             </CCol>
//           </CRow>

//           {/* Paid By + Payment Type */}
//           <CRow className="g-3 mb-4">
//             <CCol md={6}>
//               <CFormLabel>Paid By *</CFormLabel>
//               <CFormSelect
//                 name="paid_by"
//                 value={payForm.paid_by || ""}
//                 onChange={onChange}
//               >
//                 <option value="">Select Paid By</option>
//                 {receiver_bank.map((b) => (
//                   <option key={b.value} value={b.value}>
//                     {b.label}
//                   </option>
//                 ))}
//               </CFormSelect>
//             </CCol>
//             <CCol md={6}>
//               <CFormLabel>Payment Type *</CFormLabel>
//               <CFormSelect
//                 name="payment_type"
//                 value={payForm.payment_type || ""}
//                 onChange={onChange}
//               >
//                 <option value="">Select Payment Type</option>
//                 {paymentTypes.map((t) => (
//                   <option key={t.value} value={t.value}>
//                     {t.label}
//                   </option>
//                 ))}
//               </CFormSelect>
//             </CCol>
//           </CRow>

//           {/* Amount + Date */}
//           <CRow className="g-3 mb-4">
//             <CCol md={6}>
//               <CFormLabel>Amount *</CFormLabel>
//               <CFormInput
//                 type="number"
//                 name="amount"
//                 value={payForm.amount || ""}
//                 onChange={onChange}
//                 step="0.01"
//                 min="0.01"
//                 placeholder="0.00"
//               />
//             </CCol>
//             <CCol md={6}>
//               <CFormLabel>Payment Date *</CFormLabel>
//               <CFormInput
//                 type="date"
//                 name="payment_date"
//                 value={payForm.payment_date || ""}
//                 onChange={onChange}
//                 max={new Date().toISOString().split("T")[0]}
//               />
//             </CCol>
//           </CRow>

//           {/* Conditional Fields: Bank Transfer (IMPS/NEFT/RTGS) */}
//           {isBankTransfer && (
//             <div className="border rounded p-4 mb-4 bg-light">
//               <h6 className="mb-3 text-primary">Bank Transfer Details</h6>
//               <CRow className="g-3">
//                 <CCol md={6} lg={3}>
//                   <CFormLabel htmlFor="bank_name">Bank Name</CFormLabel>
//                   <CFormInput
//                     type="text"
//                     id="bank_name"
//                     name="bank_name"
//                     placeholder="Enter bank name"
//                     value={payForm.bank_name || ""}
//                     onChange={onChange}
//                   />
//                 </CCol>
//                 <CCol md={6} lg={3}>
//                   <CFormLabel htmlFor="acc_number">Account Number</CFormLabel>
//                   <CFormInput
//                     type="text"
//                     id="acc_number"
//                     name="acc_number"
//                     placeholder="Enter account number"
//                     value={payForm.acc_number || ""}
//                     onChange={onChange}
//                   />
//                 </CCol>
//                 <CCol md={6} lg={3}>
//                   <CFormLabel htmlFor="ifsc">IFSC Code</CFormLabel>
//                   <CFormInput
//                     type="text"
//                     id="ifsc"
//                     name="ifsc"
//                     placeholder="Enter IFSC code"
//                     value={payForm.ifsc || ""}
//                     onChange={onChange}
//                   />
//                 </CCol>
//                 <CCol md={6} lg={3}>
//                   <CFormLabel htmlFor="transaction_id">Transaction ID / UTR</CFormLabel>
//                   <CFormInput
//                     type="text"
//                     id="transaction_id"
//                     name="transaction_id"
//                     placeholder="Enter transaction ID"
//                     value={payForm.transaction_id || ""}
//                     onChange={onChange}
//                   />
//                 </CCol>
//               </CRow>
//             </div>
//           )}

//           {/* Conditional Field: UPI */}
//           {isUPI && (
//              <div className="border rounded p-4 mb-4 bg-light">
//             <CRow className="g-3 mb-4">
//               <CCol md={6} lg={4}>
//                 <CFormLabel htmlFor="transaction_id">UPI Transaction ID</CFormLabel>
//                 <CFormInput
//                   type="text"
//                   id="transaction_id"
//                   name="transaction_id"
//                   placeholder="Enter UPI transaction ID"
//                   value={payForm.transaction_id || ""}
//                   onChange={onChange}
//                 />
//               </CCol>
//             </CRow>
//             </div>
//           )}

//           {/* Description */}
//           <CRow className="mb-4">
//             <CCol>
//               <CFormLabel>Description (optional)</CFormLabel>
//               <CFormInput
//                 name="description"
//                 value={payForm.description || ""}
//                 onChange={onChange}
//                 placeholder="e.g. Payment for material delivery"
//               />
//             </CCol>
//           </CRow>

//           {/* Tabs: Upload or Remark */}
//           <CNav variant="pills" className="mb-3">
//             <CNavItem>
//               <CNavLink
//                 active={activeTab === "upload"}
//                 onClick={() => setActiveTab("upload")}
//                 style={{ cursor: "pointer" }}
//               >
//                 Upload Photo / File
//               </CNavLink>
//             </CNavItem>
//             <CNavItem>
//               <CNavLink
//                 active={activeTab === "remark"}
//                 onClick={() => setActiveTab("remark")}
//                 style={{ cursor: "pointer" }}
//               >
//                 Remark
//               </CNavLink>
//             </CNavItem>
//           </CNav>

//           <CTabContent>
//             <CTabPane visible={activeTab === "upload"}>
//               <CFormLabel>Upload Photo / File (optional)</CFormLabel>
//               <CFormInput
//                 type="file"
//                 name="payment_file"
//                 accept="image/png,image/jpeg,image/jpg,application/pdf"
//                 onChange={onChange}
//               />
//               {renderFileInfo()}
//             </CTabPane>

//             <CTabPane visible={activeTab === "remark"}>
//               <CFormLabel>Remark (optional)</CFormLabel>
//               <textarea
//                 className="form-control"
//                 name="remark"
//                 rows="4"
//                 value={payForm.remark || ""}
//                 onChange={onChange}
//                 placeholder="Enter any remark..."
//               />
//             </CTabPane>
//           </CTabContent>

//           {payError && <CAlert color="danger" className="mt-3">{payError}</CAlert>}
//         </CForm>
//       </CModalBody>

//       <CModalFooter>
//         <CButton color="secondary" onClick={onClose}>
//           Cancel
//         </CButton>
//         <CButton color="primary" onClick={() => onSubmit(activeTab)} disabled={payLoading}>
//           {payLoading ? <CSpinner size="sm" /> : "Submit Payment"}
//         </CButton>
//       </CModalFooter>
//     </CModal>
//   );
// };

// export default PayModal;





import React, { useState } from "react";
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CForm,
  CFormLabel,
  CFormInput,
  CFormSelect,
  CCol,
  CRow,
  CAlert,
  CSpinner,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
} from "@coreui/react";
import { paymentTypes, receiver_bank } from "../../../util/Feilds";

const PayModal = ({
  visible,
  onClose,
  payForm = {},
  payError,
  payLoading,
  onChange,
  onSubmit,
  selectedVendorPayment,
}) => {
  const [activeTab, setActiveTab] = useState("upload");

  // Helper to show file name / preview
  const renderFileInfo = () => {
    if (!payForm.payment_file) return null;

    const file = payForm.payment_file;
    const isImage = file.type.startsWith("image/");
    const isPDF = file.type === "application/pdf";

    return (
      <div className="mt-3 p-3 border rounded bg-light">
        <strong>Selected file:</strong> {file.name} ({(file.size / 1024).toFixed(2)} KB)
        {isImage && (
          <div className="mt-2">
            <img
              src={URL.createObjectURL(file)}
              alt="Preview"
              style={{ maxWidth: "100%", maxHeight: "200px", objectFit: "contain" }}
            />
          </div>
        )}
        {isPDF && (
          <div className="mt-2 text-primary">
            <strong>PDF file selected</strong>
          </div>
        )}
      </div>
    );
  };

  // Check if payment type is bank transfer (IMPS/NEFT/RTGS)
  const isBankTransfer = ["imps", "neft", "rtgs"].includes(payForm.payment_type?.toLowerCase());

  // Check if payment type is UPI
  const isUPI = payForm.payment_type?.toLowerCase() === "upi";

  return (
    <CModal visible={visible} onClose={onClose} backdrop="static" size="xl">
      <CModalHeader onClose={onClose}>
        <CModalTitle>Make Payment</CModalTitle>
      </CModalHeader>

      <CModalBody>
        <CForm>
          {/* Vendor + Balance */}
          <CRow className="g-3 mb-4">
            <CCol md={6}>
              <CFormLabel>Vendor Name</CFormLabel>
              <div className="form-control bg-light">
                {selectedVendorPayment?.purchase?.vendor?.name || "—"}
              </div>
            </CCol>
            <CCol md={6}>
              <CFormLabel>Remaining Balance</CFormLabel>
              <div className="form-control text-danger fw-bold">
                ₹{parseFloat(selectedVendorPayment?.balance_amount || 0).toFixed(2)}
              </div>
            </CCol>
          </CRow>

          {/* Paid By + Payment Type */}
          <CRow className="g-3 mb-4">
            <CCol md={6}>
              <CFormLabel>Paid By *</CFormLabel>
              <CFormSelect
                name="paid_by"
                value={payForm.paid_by || ""}
                onChange={onChange}
              >
                <option value="">Select Paid By</option>
                {receiver_bank.map((b) => (
                  <option key={b.value} value={b.value}>
                    {b.label}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol md={6}>
              <CFormLabel>Payment Type *</CFormLabel>
              <CFormSelect
                name="payment_type"
                value={payForm.payment_type || ""}
                onChange={onChange}
              >
                <option value="">Select Payment Type</option>
                {paymentTypes.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
          </CRow>

          {/* Amount + Date */}
          <CRow className="g-3 mb-4">
            <CCol md={6}>
              <CFormLabel>Amount *</CFormLabel>
              <CFormInput
                type="number"
                name="amount"
                value={payForm.amount || ""}
                onChange={onChange}
                step="0.01"
                min="0.01"
                placeholder="0.00"
              />
            </CCol>
            <CCol md={6}>
              <CFormLabel>Payment Date *</CFormLabel>
              <CFormInput
                type="date"
                name="payment_date"
                value={payForm.payment_date || ""}
                onChange={onChange}
                max={new Date().toISOString().split("T")[0]}
              />
            </CCol>
          </CRow>

          {/* Conditional Fields: Bank Transfer (IMPS/NEFT/RTGS) */}
          {isBankTransfer && (
            <div className="border rounded p-4 mb-4 bg-light">
              <h6 className="mb-3 text-primary">Bank Transfer Details</h6>
              <CRow className="g-3">
                <CCol md={6} lg={3}>
                  <CFormLabel htmlFor="bank_name">Bank Name *</CFormLabel>
                  <CFormInput
                    type="text"
                    id="bank_name"
                    name="bank_name"
                    placeholder="Enter bank name"
                    value={payForm.bank_name || ""}
                    onChange={onChange}
                  />
                </CCol>
                <CCol md={6} lg={3}>
                  <CFormLabel htmlFor="acc_number">Account Number *</CFormLabel>
                  <CFormInput
                    type="text"
                    id="acc_number"
                    name="acc_number"
                    placeholder="Enter account number"
                    value={payForm.acc_number || ""}
                    onChange={onChange}
                  />
                </CCol>
                <CCol md={6} lg={3}>
                  <CFormLabel htmlFor="ifsc">IFSC Code *</CFormLabel>
                  <CFormInput
                    type="text"
                    id="ifsc"
                    name="ifsc"
                    placeholder="Enter IFSC code"
                    value={payForm.ifsc || ""}
                    onChange={onChange}
                  />
                </CCol>
                <CCol md={6} lg={3}>
                  <CFormLabel htmlFor="transaction_id">Transaction ID / UTR *</CFormLabel>
                  <CFormInput
                    type="text"
                    id="transaction_id"
                    name="transaction_id"
                    placeholder="Enter transaction ID"
                    value={payForm.transaction_id || ""}
                    onChange={onChange}
                  />
                </CCol>
              </CRow>
            </div>
          )}

          {/* Conditional Field: UPI */}
          {isUPI && (
             <div className="border rounded p-4 mb-4 bg-light">
            <CRow className="g-3 mb-4">
              <CCol md={6} lg={4}>
                <CFormLabel htmlFor="transaction_id">UPI Transaction ID *</CFormLabel>
                <CFormInput
                  type="text"
                  id="transaction_id"
                  name="transaction_id"
                  placeholder="Enter UPI transaction ID"
                  value={payForm.transaction_id || ""}
                  onChange={onChange}
                />
              </CCol>
            </CRow>
            </div>
          )}

          {/* Description */}
          <CRow className="mb-4">
            <CCol>
              <CFormLabel>Description (optional)</CFormLabel>
              <CFormInput
                name="description"
                value={payForm.description || ""}
                onChange={onChange}
                placeholder="e.g. Payment for material delivery"
              />
            </CCol>
          </CRow>

          {/* Tabs: Upload or Remark */}
          <CNav variant="pills" className="mb-3">
            <CNavItem>
              <CNavLink
                active={activeTab === "upload"}
                onClick={() => setActiveTab("upload")}
                style={{ cursor: "pointer" }}
              >
                Upload Photo / File
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink
                active={activeTab === "remark"}
                onClick={() => setActiveTab("remark")}
                style={{ cursor: "pointer" }}
              >
                Remark
              </CNavLink>
            </CNavItem>
          </CNav>

          <CTabContent>
            <CTabPane visible={activeTab === "upload"}>
              <CFormLabel>Upload Photo / File (optional)</CFormLabel>
              <CFormInput
                type="file"
                name="payment_file"
                accept="image/png,image/jpeg,image/jpg,application/pdf"
                onChange={onChange}
              />
              {renderFileInfo()}
            </CTabPane>

            <CTabPane visible={activeTab === "remark"}>
              <CFormLabel>Remark (optional)</CFormLabel>
              <textarea
                className="form-control"
                name="remark"
                rows="4"
                value={payForm.remark || ""}
                onChange={onChange}
                placeholder="Enter any remark..."
              />
            </CTabPane>
          </CTabContent>

          {payError && <CAlert color="danger" className="mt-3">{payError}</CAlert>}
        </CForm>
      </CModalBody>

      <CModalFooter>
        <CButton color="secondary" onClick={onClose}>
          Cancel
        </CButton>
        <CButton color="primary" onClick={() => onSubmit(activeTab)} disabled={payLoading}>
          {payLoading ? <CSpinner size="sm" /> : "Submit Payment"}
        </CButton>
      </CModalFooter>
    </CModal>
  );
};

export default PayModal;