// src/components/purchase-vendor/PurchesVendorPayment.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  CCard,
  CCardHeader,
  CCardBody,
  CRow,
  CCol,
  CButton,
  CSpinner,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CBadge,
  CInputGroup,
  CFormInput,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import {
  cilPlus,
  cilDollar,
  cilPencil,
  cilList,
  cilSearch,
  cilX,
  cilFile,
  cilSpreadsheet,
} from "@coreui/icons";

import { getAPICall, post, put, deleteAPICall, postFormData } from "../../../util/api";
import ProjectSelectionModal from "../../common/ProjectSelectionModal";
import { useToast } from "../../common/toast/ToastContext";

import PayModal from "./PayModal";
import AddEditMaterialModal from "./AddEditMaterialModal";
import PaymentLogsModal from "./PaymentLogsModal";
import {
  exportToPDF,
  exportToExcel,
  exportAllLogsToPDF,
  exportAllLogsToExcel,
  downloadPDF,
  downloadExcel,
} from "./exportHelpers";

const PurchesVendorPayment = () => {
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [payments, setPayments] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);

  // Project search dropdown
  const [projects, setProjects] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Refs
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Modals
  const [showPayModal, setShowPayModal] = useState(false);
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);

  // Data
  const [selectedVendorPayment, setSelectedVendorPayment] = useState(null);
  const [logsData, setLogsData] = useState(null);
  const [logsLoading, setLogsLoading] = useState(false);

  // Form states
  const [isEdit, setIsEdit] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    vendor_id: "",
    material_name: "",
    about: "",
    qty: "",
    price: "",
    total: 0,
    date: "",
    project_id: "",
    payment_id: null,
  });
  const [modalError, setModalError] = useState("");

  const [payForm, setPayForm] = useState({
    purches_vendor_id: "",
    paid_by: "Admin",
    payment_type: "Cash",
    amount: "",
    payment_date: new Date().toISOString().split("T")[0],
    description: "",
    remark: "",
    payment_file: null,
    bank_name: "",
    acc_number: "",
    ifsc: "",
    transaction_id: "",
  });

  const [payError, setPayError] = useState("");
  const [payLoading, setPayLoading] = useState(false);

  const { showToast } = useToast();

  /* ------------------------------------------------------------------ */
  /* API HELPERS */
  /* ------------------------------------------------------------------ */
  const fetchVendors = async () => {
    try {
      const res = await getAPICall("/api/getPurchesVendor");
      setVendors(res || []);
    } catch (e) {
      showToast("danger", "Failed to load vendors");
    }
  };

  const fetchPayments = async () => {
    if (!selectedProjectId) return;
    setLoading(true);
    try {
      const res = await getAPICall(`/api/getPurchesVedorPayment?project_id=${selectedProjectId}`);
      if (res && res.success && Array.isArray(res.data)) {
        setPayments(res.data);
      } else {
        setPayments([]);
      }
    } catch (e) {
      showToast("danger", "Failed to load payments");
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentLogs = async (vendorId) => {
    setLogsLoading(true);
    try {
      const res = await getAPICall(`/api/getVendorPaymentDetails/${vendorId}`);
      setLogsData(res);
    } catch (e) {
      showToast("danger", "Failed to load payment logs");
      setLogsData(null);
    } finally {
      setLogsLoading(false);
    }
  };

  const addVendorPayment = async (activeTab) => {
    setPayError("");

    // Basic validation
    if (!payForm.paid_by.trim()) 
      return setPayError("Paid by is required");

    if (!payForm.payment_type.trim()) 
      return setPayError("Payment type is required");

    if (!payForm.amount || payForm.amount <= 0) 
      return setPayError("Amount must be > 0");

    if (!payForm.payment_date) 
      return setPayError("Payment date is required");

    // Check amount must NOT be more than pending balance
    if (Number(payForm.amount) > Number(selectedVendorPayment?.balance_amount)) {
      return setPayError(`Amount cannot be more than pending balance ₹${selectedVendorPayment?.balance_amount}`);
    }

    // Define conditional checks
    const isBankTransfer = ["imps", "neft", "rtgs"].includes(payForm.payment_type.toLowerCase());
    const isUPI = payForm.payment_type.toLowerCase() === "upi";

    // Conditional validation for bank details
    if (isBankTransfer) {
      if (!payForm.bank_name?.trim()) return setPayError("Bank name is required");
      if (!payForm.acc_number?.trim()) return setPayError("Account number is required");
      if (!payForm.ifsc?.trim()) return setPayError("IFSC code is required");
      if (!payForm.transaction_id?.trim()) return setPayError("Transaction ID is required");
    }

    if (isUPI) {
      if (!payForm.transaction_id?.trim()) return setPayError("UPI Transaction ID is required");
    }

    // File required ONLY if user is on Upload tab
    if (activeTab === "upload" && !payForm.payment_file) {
      return setPayError("Payment file is required");
    }

    const formData = new FormData();
    formData.append("purches_vendor_id", payForm.purches_vendor_id);
    formData.append("paid_by", payForm.paid_by);
    formData.append("payment_type", payForm.payment_type);
    formData.append("amount", parseFloat(payForm.amount));
    formData.append("payment_date", payForm.payment_date);
    if (payForm.description?.trim()) {
      formData.append("description", payForm.description);
    }
    if (payForm.remark?.trim()) {
      formData.append("remark", payForm.remark);
    }
    if (payForm.payment_file) {
      formData.append("payment_file", payForm.payment_file);
    }
    // Append bank details (backend can handle empty as null)
    formData.append("bank_name", payForm.bank_name || "");
    formData.append("acc_number", payForm.acc_number || "");
    formData.append("ifsc", payForm.ifsc || "");
    formData.append("transaction_id", payForm.transaction_id || "");

    setPayLoading(true);
    try {
      const res = await postFormData("/api/addVendorPayment", formData);
      showToast("success", res.message || "Payment added successfully!");
      setShowPayModal(false);
      resetPayForm();
      fetchPayments();
    } catch (e) {
      const msg = e.response?.data?.message || "Payment failed";
      setPayError(msg);
    } finally {
      setPayLoading(false);
    }
  };

  const syncPurchases = async () => {
    if (!selectedProjectId) return;
    setLoading(true);
    try {
      await post(`/api/projects/${selectedProjectId}/sync-purchases`, {});
      showToast("success", "Purchases synced!");
      fetchPayments();
    } catch (e) {
      showToast("danger", "Sync failed");
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------------------------------------------------ */
  /* PROJECT SEARCH */
  /* ------------------------------------------------------------------ */
  const fetchProjects = useCallback(async (q) => {
    if (!q.trim()) {
      setProjects([]);
      return;
    }
    try {
      const res = await getAPICall(`/api/projects?searchQuery=${q}`);
      setProjects(res || []);
    } catch {
      setProjects([]);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length > 2) {
        fetchProjects(searchQuery);
      } else {
        setProjects([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, fetchProjects]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      fetchPayments();
    } else {
      setPayments([]);
    }
  }, [selectedProjectId]);

  const selectProject = (p) => {
    setSearchQuery(p.project_name);
    setSelectedProjectId(p.id);
    setProjects([]);
    setShowDropdown(false);
    if (inputRef.current) inputRef.current.blur();
  };

  /* ------------------------------------------------------------------ */
  /* MODAL HANDLERS */
  /* ------------------------------------------------------------------ */
  const openAddModal = () => {
    setIsEdit(false);
    setEditingId(null);
    setForm({
      vendor_id: "",
      material_name: "",
      about: "",
      qty: "",
      price: "",
      total: 0,
      date: new Date().toISOString().split("T")[0],
      project_id: selectedProjectId,
      payment_id: null,
    });
    setModalError("");
    setShowAddEditModal(true);
  };

  const openEditModal = (row) => {
    setIsEdit(true);
    setEditingId(row.id);
    const purchase = row.purchase || {};

    setForm({
      vendor_id: purchase.vendor_id || "",
      material_name: purchase.material_name || "",
      about: purchase.about || "",
      qty: parseFloat(purchase.qty) || "",
      price: parseFloat(purchase.price_per_unit) || "",
      total: parseFloat(purchase.total) || 0,
      date: purchase.date || new Date().toISOString().split("T")[0],
      project_id: selectedProjectId,
      payment_id: row.id,
    });
    setModalError("");
    setShowAddEditModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "qty" || name === "price") {
        const qty = name === "qty" ? parseFloat(value) || 0 : parseFloat(prev.qty) || 0;
        const price = name === "price" ? parseFloat(value) || 0 : parseFloat(prev.price) || 0;
        updated.total = (qty * price).toFixed(2);
      }
      return updated;
    });
  };

  const validate = () => {
    if (!form.vendor_id) return "Vendor is required";
    if (!form.material_name.trim()) return "Material name is required";
    if (!form.qty || form.qty <= 0) return "Qty must be > 0";
    if (!form.price || form.price <= 0) return "Price must be > 0";
    if (!form.date) return "Date is required";
    return "";
  };

  const submitForm = async () => {
    const err = validate();
    if (err) return setModalError(err);

    const payload = {
      project_id: parseInt(selectedProjectId),
      vendor_id: parseInt(form.vendor_id),
      material_name: form.material_name,
      about: form.about || null,
      price_per_unit: parseFloat(form.price),
      qty: parseFloat(form.qty),
      total: parseFloat(form.total),
      date: form.date,
    };

    try {
      if (isEdit) {
        await put("/api/updatePurchesVendorPayment", { ...payload, payment_id: form.payment_id });
      } else {
        await post("/api/purchesVendor", payload);
      }
      showToast("success", isEdit ? "Updated successfully!" : "Added successfully!");
      setShowAddEditModal(false);
      fetchPayments();
    } catch (e) {
      setModalError(e.response?.data?.message || "Operation failed");
    }
  };

  /* ------------------------------------------------------------------ */
  /* PAY MODAL */
  /* ------------------------------------------------------------------ */
  const openPayModal = (payment) => {
    setSelectedVendorPayment(payment);
    setPayForm({
      purches_vendor_id: payment.purches_vendor_id,
      paid_by: "",
      payment_type: "",
      amount: "",
      payment_date: new Date().toISOString().split("T")[0],
      description: "",
      remark: "",
      payment_file: null,
      bank_name: "",
      acc_number: "",
      ifsc: "",
      transaction_id: "",
    });
    setPayError("");
    setShowPayModal(true);
  };

  const resetPayForm = () => {
    setPayForm({
      purches_vendor_id: "",
      paid_by: "Admin",
      payment_type: "Cash",
      amount: "",
      payment_date: new Date().toISOString().split("T")[0],
      description: "",
      remark: "",
      payment_file: null,
      bank_name: "",
      acc_number: "",
      ifsc: "",
      transaction_id: "",
    });
  };

  const handlePayChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "payment_file" && files && files[0]) {
      setPayForm((prev) => ({ ...prev, payment_file: files[0] }));
    } else {
      setPayForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  /* ------------------------------------------------------------------ */
  /* LOGS MODAL */
  /* ------------------------------------------------------------------ */
  const openLogsModal = async (vendorId) => {
    setShowLogsModal(true);
    await fetchPaymentLogs(vendorId);
  };

  /* ------------------------------------------------------------------ */
  /* EFFECTS */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    fetchVendors();
  }, []);

  return (
    <>
      <CCard className="mb-4">
        <CCardHeader className="bg-primary text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Purchase Vendor Payments</h5>
          <div>
            {selectedProjectId && payments.length > 0 && (
              <>
                <CButton size="sm" color="light" className="me-2" onClick={() => exportToPDF(payments, searchQuery)}>
                  <CIcon icon={cilFile} /> PDF
                </CButton>
                <CButton size="sm" color="light" className="me-2" onClick={() => exportToExcel(payments, searchQuery)}>
                  <CIcon icon={cilSpreadsheet} /> Excel
                </CButton>
              </>
            )}
            {payments.some((p) => p.logs?.length > 0) && (
              <>
                <CButton size="sm" color="light" className="me-2" onClick={() => exportAllLogsToPDF(payments, searchQuery)}>
                  All Logs PDF
                </CButton>
                <CButton size="sm" color="light" onClick={() => exportAllLogsToExcel(payments, searchQuery)}>
                  All Logs Excel
                </CButton>
              </>
            )}
          </div>
        </CCardHeader>

        <CCardBody>
          {/* Project Search */}
          <CRow className="mb-4">
            <CCol md={12}>
              <div className="position-relative" ref={dropdownRef}>
                <CInputGroup>
                  <CFormInput
                    ref={inputRef}
                    type="text"
                    placeholder="Search and select project..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (selectedProjectId && e.target.value !== searchQuery) {
                        setSelectedProjectId("");
                      }
                    }}
                    onFocus={() => projects.length > 0 && setShowDropdown(true)}
                    autoComplete="off"
                  />
                  {!selectedProjectId ? (
                    <CButton color="primary" variant="outline" onClick={() => setShowProjectModal(true)}>
                      <CIcon icon={cilSearch} />
                    </CButton>
                  ) : (
                    <CButton
                      color="danger"
                      variant="outline"
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedProjectId("");
                        setPayments([]);
                      }}
                    >
                      <CIcon icon={cilX} />
                    </CButton>
                  )}
                </CInputGroup>

                {/* Dropdown */}
                {showDropdown && projects.length > 0 && (
                  <div
                    className="border bg-white shadow-sm rounded"
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      maxHeight: "200px",
                      overflowY: "auto",
                      zIndex: 1000,
                      marginTop: "2px",
                    }}
                  >
                    {projects.map((p) => (
                      <div
                        key={p.id}
                        className="px-3 py-2 hover-bg-light cursor-pointer"
                        style={{ cursor: "pointer" }}
                        onClick={() => selectProject(p)}
                      >
                        {p.project_name}
                      </div>
                    ))}
                  </div>
                )}

                {selectedProjectId && (
                  <small className="text-success d-block mt-1">
                    Selected: <strong>{searchQuery}</strong>
                  </small>
                )}
              </div>
            </CCol>
          </CRow>

           {/* Table */}
           {loading ? (
            <div className="text-center py-4"><CSpinner /></div>
          ) : payments.length > 0 ? (
            <div className="table-responsive">
              <CTable striped hover>
                <CTableHead color="light">
                  <CTableRow>
                    <CTableHeaderCell>Vendor Name</CTableHeaderCell>
                    <CTableHeaderCell>Total</CTableHeaderCell>
                    <CTableHeaderCell>Paid</CTableHeaderCell>
                    <CTableHeaderCell>Balance</CTableHeaderCell>
                    <CTableHeaderCell>Status</CTableHeaderCell>
                    <CTableHeaderCell>Created</CTableHeaderCell>
                    <CTableHeaderCell>Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {payments.map((p) => {
                    const paidPercentage = (parseFloat(p.paid_amount) / parseFloat(p.amount)) * 100;
                    const statusColor = paidPercentage === 0 ? "danger" : paidPercentage === 100 ? "success" : "warning";
                    const statusText = paidPercentage === 0 ? "Unpaid" : paidPercentage === 100 ? "Paid" : "Partial";
                    const canPay = parseFloat(p.balance_amount) > 0;

                    return (
                      <CTableRow key={p.id}>
                        <CTableDataCell>{p?.purchase?.vendor?.name}</CTableDataCell>
                        <CTableDataCell>₹{parseFloat(p.amount).toFixed(2)}</CTableDataCell>
                        <CTableDataCell>₹{parseFloat(p.paid_amount).toFixed(2)}</CTableDataCell>
                        <CTableDataCell>₹{parseFloat(p.balance_amount).toFixed(2)}</CTableDataCell>
                        <CTableDataCell><CBadge color={statusColor}>{statusText}</CBadge></CTableDataCell>
                        <CTableDataCell>{new Date(p.created_at).toLocaleDateString()}</CTableDataCell>
                        <CTableDataCell>
                          <CButton
                            color="info"
                            size="sm"
                            className="me-1"
                            onClick={() => openLogsModal(p.purches_vendor_id)}
                            disabled={!p.logs || p.logs.length === 0}
                          >
                            <CIcon icon={cilList} /> Logs ({p.logs?.length || 0})
                          </CButton>
                          <CButton
                            color="success"
                            size="sm"
                            className="me-1"
                            onClick={() => openPayModal(p)}
                            disabled={!canPay}
                            title={canPay ? "Make Payment" : "Fully Paid"}
                          >
                            <CIcon icon={cilDollar} /> Pay
                          </CButton>
                          <CButton color="warning" size="sm" className="me-1" onClick={() => openEditModal(p)}>
                            <CIcon icon={cilPencil} />
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    );
                  })}
                </CTableBody>
              </CTable>
            </div>
          ) : selectedProjectId ? (
            <div className="text-center py-5">
              <h5 className="text-muted">No payments yet</h5>
              <CButton color="primary" onClick={openAddModal}>
                <CIcon icon={cilPlus} className="me-1" />
                Add First Material
              </CButton>
            </div>
          ) : (
            <div className="text-center py-5">
              <h5 className="text-muted">Select a project to view payments</h5>
            </div>
          )}
          {selectedProjectId && !loading && (
            <div className="mt-3">
              <CButton color="success" onClick={openAddModal}>
                <CIcon icon={cilPlus} className="me-1" />
                Add Material
              </CButton>
            </div>
          )}
          
        </CCardBody>
      </CCard>

      {/* Modals */}
      <PayModal
        visible={showPayModal}
        onClose={() => setShowPayModal(false)}
        payForm={payForm}
        payError={payError}
        payLoading={payLoading}
        onChange={handlePayChange}
        onSubmit={addVendorPayment}
        selectedVendorPayment={selectedVendorPayment}
     

      />

      <AddEditMaterialModal
        visible={showAddEditModal}
        onClose={() => setShowAddEditModal(false)}
        isEdit={isEdit}
        form={form}
        vendors={vendors}
        onChange={handleFormChange}
        onSubmit={submitForm}
        error={modalError}
      />

      <PaymentLogsModal
        visible={showLogsModal}
        onClose={() => setShowLogsModal(false)}
        logsData={logsData}
        loading={logsLoading}
        onDownloadPDF={() => downloadPDF(logsData)}
        onDownloadExcel={() => downloadExcel(logsData)}
      />

      <ProjectSelectionModal
        visible={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        onSelectProject={(p) => {
          selectProject(p);
          setShowProjectModal(false);
        }}
      />
    </>
  );
};

export default PurchesVendorPayment;





























































// // src/components/purchase-vendor/PurchesVendorPayment.jsx
// import React, { useEffect, useState, useCallback, useRef } from "react";
// import {
//   CCard,
//   CCardHeader,
//   CCardBody,
//   CRow,
//   CCol,
//   CButton,
//   CSpinner,
//   CTable,
//   CTableHead,
//   CTableBody,
//   CTableRow,
//   CTableHeaderCell,
//   CTableDataCell,
//   CBadge,
//   CInputGroup,
//   CFormInput,
// } from "@coreui/react";
// import CIcon from "@coreui/icons-react";
// import {
//   cilPlus,
//   cilDollar,
//   cilPencil,
//   cilList,
//   cilSearch,
//   cilX,
//   cilFile,
//   cilSpreadsheet,
// } from "@coreui/icons";

// import { getAPICall, post, put, deleteAPICall, postFormData } from "../../../util/api";
// import ProjectSelectionModal from "../../common/ProjectSelectionModal";
// import { useToast } from "../../common/toast/ToastContext";

// import PayModal from "./PayModal";
// import AddEditMaterialModal from "./AddEditMaterialModal";
// import PaymentLogsModal from "./PaymentLogsModal";
// import {
//   exportToPDF,
//   exportToExcel,
//   exportAllLogsToPDF,
//   exportAllLogsToExcel,
//   downloadPDF,
//   downloadExcel,
// } from "./exportHelpers";

// const PurchesVendorPayment = () => {
//   const [selectedProjectId, setSelectedProjectId] = useState("");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [payments, setPayments] = useState([]);
//   const [vendors, setVendors] = useState([]);
//   const [loading, setLoading] = useState(false);

//   // Project search dropdown
//   const [projects, setProjects] = useState([]);
//   const [showDropdown, setShowDropdown] = useState(false);

//   // Refs
//   const dropdownRef = useRef(null);
//   const inputRef = useRef(null);

//   // Modals
//   const [showPayModal, setShowPayModal] = useState(false);
//   const [showAddEditModal, setShowAddEditModal] = useState(false);
//   const [showLogsModal, setShowLogsModal] = useState(false);
//   const [showProjectModal, setShowProjectModal] = useState(false);

//   // Data
//   const [selectedVendorPayment, setSelectedVendorPayment] = useState(null);
//   const [logsData, setLogsData] = useState(null);
//   const [logsLoading, setLogsLoading] = useState(false);

//   // Form states
//   const [isEdit, setIsEdit] = useState(false);
//   const [editingId, setEditingId] = useState(null);
//   const [form, setForm] = useState({
//     vendor_id: "",
//     material_name: "",
//     about: "",
//     qty: "",
//     price: "",
//     total: 0,
//     date: "",
//     project_id: "",
//     payment_id: null,
//   });
//   const [modalError, setModalError] = useState("");

//   // const [payForm, setPayForm] = useState({
//   //   purches_vendor_id: "",
//   //   paid_by: "Admin",
//   //   payment_type: "Cash",
//   //   amount: "",
//   //   payment_date: "",
//   //   description: "",
//   // });
// const [payForm, setPayForm] = useState({
//   purches_vendor_id: "",
//   paid_by: "Admin",
//   payment_type: "Cash",
//   amount: "",
//   payment_date: new Date().toISOString().split("T")[0],
//   description: "",
//   remark: "",
//   payment_file: null,  
//           // <-- new
// });

//   const [payError, setPayError] = useState("");
//   const [payLoading, setPayLoading] = useState(false);

//   const { showToast } = useToast();

//   /* ------------------------------------------------------------------ */
//   /* API HELPERS */
//   /* ------------------------------------------------------------------ */
//   const fetchVendors = async () => {
//     try {
//       const res = await getAPICall("/api/getPurchesVendor");
//       setVendors(res || []);
//     } catch (e) {
//       showToast("danger", "Failed to load vendors");
//     }
//   };

//   const fetchPayments = async () => {
//     if (!selectedProjectId) return;
//     setLoading(true);
//     try {
//       const res = await getAPICall(`/api/getPurchesVedorPayment?project_id=${selectedProjectId}`);
//       if (res && res.success && Array.isArray(res.data)) {
//         setPayments(res.data);
//       } else {
//         setPayments([]);
//       }
//     } catch (e) {
//       showToast("danger", "Failed to load payments");
//       setPayments([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchPaymentLogs = async (vendorId) => {
//     setLogsLoading(true);
//     try {
//       const res = await getAPICall(`/api/getVendorPaymentDetails/${vendorId}`);
//       setLogsData(res);
//     } catch (e) {
//       showToast("danger", "Failed to load payment logs");
//       setLogsData(null);
//     } finally {
//       setLogsLoading(false);
//     }
//   };



//   // const addVendorPayment = async () => {
//   //   setPayError("");




//   //   if (!payForm.paid_by.trim()) return setPayError("Paid by is required");
//   //   if (!payForm.payment_type.trim()) return setPayError("Payment type is required");
//   //   if (!payForm.amount || payForm.amount <= 0) return setPayError("Amount must be > 0");
//   //   if (!payForm.payment_date) return setPayError("Payment date is required");

//   //   const payload = {
//   //     purches_vendor_id: payForm.purches_vendor_id,
//   //     paid_by: payForm.paid_by,
//   //     payment_type: payForm.payment_type,
//   //     amount: parseFloat(payForm.amount),
//   //     payment_date: payForm.payment_date,
//   //     description: payForm.description || null,
//   //   };

//   //   setPayLoading(true);
//   //   try {
//   //     const res = await post("/api/addVendorPayment", payload);
//   //     showToast("success", res.message || "Payment added successfully!");
//   //     setShowPayModal(false);
//   //     resetPayForm();
//   //     fetchPayments();
//   //   } catch (e) {
//   //     const msg = e.response?.data?.message || "Payment failed";
//   //     setPayError(msg);
//   //   } finally {
//   //     setPayLoading(false);
//   //   }
//   // };
   

// const addVendorPayment = async (activeTab) => {
//   // setPayError("");

//   // basic validation
//   // if (!payForm.paid_by.trim()) return setPayError("Paid by is required");
//   // if (!payForm.payment_type.trim()) return setPayError("Payment type is required");
//   // if (!payForm.amount || payForm.amount <= 0) return setPayError("Amount must be > 0");
//   // if (!payForm.payment_date) return setPayError("Payment date is required");



//   setPayError("");

//   // basic validation
//   if (!payForm.paid_by.trim()) 
//     return setPayError("Paid by is required");

//   if (!payForm.payment_type.trim()) 
//     return setPayError("Payment type is required");

//   if (!payForm.amount || payForm.amount <= 0) 
//     return setPayError("Amount must be > 0");

//   if (!payForm.payment_date) 
//     return setPayError("Payment date is required");

//   // ❗ Check amount must NOT be more than pending balance
//   if (Number(payForm.amount) > Number(selectedVendorPayment?.balance_amount)) {
//     return setPayError(`Amount cannot be more than pending balance ₹${selectedVendorPayment?.balance_amount}`);
//   }

//   // ❗ If user opened file upload UI but no file selected → show error
//  // File required ONLY if user is on Upload tab
// if (activeTab === "upload" && !payForm.payment_file) {
//   return setPayError("Payment file is required");
// }





// const formData = new FormData();
// formData.append("purches_vendor_id", payForm.purches_vendor_id);
// formData.append("paid_by", payForm.paid_by);
// formData.append("payment_type", payForm.payment_type);
// formData.append("amount", parseFloat(payForm.amount));
// formData.append("payment_date", payForm.payment_date);
// if (payForm.description?.trim()) {
//     formData.append("description", payForm.description);
// }
// if (payForm.remark?.trim()) {
//     formData.append("remark", payForm.remark);  // THIS WAS MISSING OR EMPTY!
// }
// if (payForm.payment_file) {
//     formData.append("payment_file", payForm.payment_file);
// }

//   setPayLoading(true);
//   try {
//     const res = await postFormData("/api/addVendorPayment", formData);
//     showToast("success", res.message || "Payment added successfully!");
//     setShowPayModal(false);
//     resetPayForm();
//     fetchPayments();
//   } catch (e) {
//     const msg = e.response?.data?.message || "Payment failed";
//     setPayError(msg);
//   } finally {
//     setPayLoading(false);
//   }
// };





//   const syncPurchases = async () => {
//     if (!selectedProjectId) return;
//     setLoading(true);
//     try {
//       await post(`/api/projects/${selectedProjectId}/sync-purchases`, {});
//       showToast("success", "Purchases synced!");
//       fetchPayments();
//     } catch (e) {
//       showToast("danger", "Sync failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ------------------------------------------------------------------ */
//   /* PROJECT SEARCH */
//   /* ------------------------------------------------------------------ */
//   const fetchProjects = useCallback(async (q) => {
//     if (!q.trim()) {
//       setProjects([]);
//       return;
//     }
//     try {
//       const res = await getAPICall(`/api/projects?searchQuery=${q}`);
//       setProjects(res || []);
//     } catch {
//       setProjects([]);
//     }
//   }, []);

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       if (searchQuery.length > 2) {
//         fetchProjects(searchQuery);
//       } else {
//         setProjects([]);
//         setShowDropdown(false);
//       }
//     }, 300);

//     return () => clearTimeout(timer);
//   }, [searchQuery, fetchProjects]);

//   // Close dropdown when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
//         setShowDropdown(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   useEffect(() => {
//     if (selectedProjectId) {
//       fetchPayments();
//     } else {
//       setPayments([]);
//     }
//   }, [selectedProjectId]);

//   const selectProject = (p) => {
//     setSearchQuery(p.project_name);
//     setSelectedProjectId(p.id);
//     setProjects([]);
//     setShowDropdown(false);
//     if (inputRef.current) inputRef.current.blur();
//   };

//   /* ------------------------------------------------------------------ */
//   /* MODAL HANDLERS */
//   /* ------------------------------------------------------------------ */
//   const openAddModal = () => {
//     setIsEdit(false);
//     setEditingId(null);
//     setForm({
//       vendor_id: "",
//       material_name: "",
//       about: "",
//       qty: "",
//       price: "",
//       total: 0,
//       date: new Date().toISOString().split("T")[0],
//       project_id: selectedProjectId,
//       payment_id: null,
//     });
//     setModalError("");
//     setShowAddEditModal(true);
//   };

//   const openEditModal = (row) => {
//     setIsEdit(true);
//     setEditingId(row.id);
//     const purchase = row.purchase || {};

//     setForm({
//       vendor_id: purchase.vendor_id || "",
//       material_name: purchase.material_name || "",
//       about: purchase.about || "",
//       qty: parseFloat(purchase.qty) || "",
//       price: parseFloat(purchase.price_per_unit) || "",
//       total: parseFloat(purchase.total) || 0,
//       date: purchase.date || new Date().toISOString().split("T")[0],
//       project_id: selectedProjectId,
//       payment_id: row.id,
//     });
//     setModalError("");
//     setShowAddEditModal(true);
//   };

//   const handleFormChange = (e) => {
//     const { name, value } = e.target;
//     setForm((prev) => {
//       const updated = { ...prev, [name]: value };
//       if (name === "qty" || name === "price") {
//         const qty = name === "qty" ? parseFloat(value) || 0 : parseFloat(prev.qty) || 0;
//         const price = name === "price" ? parseFloat(value) || 0 : parseFloat(prev.price) || 0;
//         updated.total = (qty * price).toFixed(2);
//       }
//       return updated;
//     });
//   };

//   const validate = () => {
//     if (!form.vendor_id) return "Vendor is required";
//     if (!form.material_name.trim()) return "Material name is required";
//     if (!form.qty || form.qty <= 0) return "Qty must be > 0";
//     if (!form.price || form.price <= 0) return "Price must be > 0";
//     if (!form.date) return "Date is required";
//     return "";
//   };

//   const submitForm = async () => {
//     const err = validate();
//     if (err) return setModalError(err);

//     const payload = {
//       project_id: parseInt(selectedProjectId),
//       vendor_id: parseInt(form.vendor_id),
//       material_name: form.material_name,
//       about: form.about || null,
//       price_per_unit: parseFloat(form.price),
//       qty: parseFloat(form.qty),
//       total: parseFloat(form.total),
//       date: form.date,
//     };

//     try {
//       if (isEdit) {
//         await put("/api/updatePurchesVendorPayment", { ...payload, payment_id: form.payment_id });
//       } else {
//         await post("/api/purchesVendor", payload);
//       }
//       showToast("success", isEdit ? "Updated successfully!" : "Added successfully!");
//       setShowAddEditModal(false);
//       fetchPayments();
//     } catch (e) {
//       setModalError(e.response?.data?.message || "Operation failed");
//     }
//   };

//   /* ------------------------------------------------------------------ */
//   /* PAY MODAL */
//   /* ------------------------------------------------------------------ */
//   const openPayModal = (payment) => {
//     setSelectedVendorPayment(payment);
//     setPayForm({
//       purches_vendor_id: payment.purches_vendor_id,
//       paid_by: "",
//       payment_type: "",
//       amount: "",
//       payment_date: new Date().toISOString().split("T")[0],
//       description: "",
//     });
//     setPayError("");
//     setShowPayModal(true);
//   };

//   // const resetPayForm = () => {
//   //   setPayForm({
//   //     purches_vendor_id: "",
//   //     paid_by: "Admin",
//   //     payment_type: "Cash",
//   //     amount: "",
//   //     payment_date: new Date().toISOString().split("T")[0],
//   //     description: "",
//   //   });
//   // };

//   const resetPayForm = () => {
//   setPayForm({
//     purches_vendor_id: "",
//     paid_by: "Admin",
//     payment_type: "Cash",
//     amount: "",
//     payment_date: new Date().toISOString().split("T")[0],
//     description: "",
//     remark: "",
//     payment_file: null,
//   });
// };

//   // const handlePayChange = (e) => {
//   //   const { name, value } = e.target;

//   //   setPayForm((prev) => ({ ...prev, [name]: value }));
//   // };
//   const handlePayChange = (e) => {
//   const { name, value, files } = e.target;  // You missed 'files' here!!!

//   if (name === "payment_file" && files && files[0]) {
//     setPayForm((prev) => ({ ...prev, payment_file: files[0] }));
//   } else {
//     setPayForm((prev) => ({ ...prev, [name]: value }));
//   }
// };

//   /* ------------------------------------------------------------------ */
//   /* LOGS MODAL */
//   /* ------------------------------------------------------------------ */
//   const openLogsModal = async (vendorId) => {
//     setShowLogsModal(true);
//     await fetchPaymentLogs(vendorId);
//   };

//   /* ------------------------------------------------------------------ */
//   /* EFFECTS */
//   /* ------------------------------------------------------------------ */
//   useEffect(() => {
//     fetchVendors();
//   }, []);

//   return (
//     <>
//       <CCard className="mb-4">
//         <CCardHeader className="bg-primary text-white d-flex justify-content-between align-items-center">
//           <h5 className="mb-0">Purchase Vendor Payments</h5>
//           <div>
//             {selectedProjectId && payments.length > 0 && (
//               <>
//                 <CButton size="sm" color="light" className="me-2" onClick={() => exportToPDF(payments, searchQuery)}>
//                   <CIcon icon={cilFile} /> PDF
//                 </CButton>
//                 <CButton size="sm" color="light" className="me-2" onClick={() => exportToExcel(payments, searchQuery)}>
//                   <CIcon icon={cilSpreadsheet} /> Excel
//                 </CButton>
//               </>
//             )}
//             {payments.some((p) => p.logs?.length > 0) && (
//               <>
//                 <CButton size="sm" color="light" className="me-2" onClick={() => exportAllLogsToPDF(payments, searchQuery)}>
//                   All Logs PDF
//                 </CButton>
//                 <CButton size="sm" color="light" onClick={() => exportAllLogsToExcel(payments, searchQuery)}>
//                   All Logs Excel
//                 </CButton>
//               </>
//             )}
//           </div>
//         </CCardHeader>

//         <CCardBody>
//           {/* Project Search */}
//           <CRow className="mb-4">
//             <CCol md={12}>
//               <div className="position-relative" ref={dropdownRef}>
//                 <CInputGroup>
//                   <CFormInput
//                     ref={inputRef}
//                     type="text"
//                     placeholder="Search and select project..."
//                     value={searchQuery}
//                     onChange={(e) => {
//                       setSearchQuery(e.target.value);
//                       if (selectedProjectId && e.target.value !== searchQuery) {
//                         setSelectedProjectId("");
//                       }
//                     }}
//                     onFocus={() => projects.length > 0 && setShowDropdown(true)}
//                     autoComplete="off"
//                   />
//                   {!selectedProjectId ? (
//                     <CButton color="primary" variant="outline" onClick={() => setShowProjectModal(true)}>
//                       <CIcon icon={cilSearch} />
//                     </CButton>
//                   ) : (
//                     <CButton
//                       color="danger"
//                       variant="outline"
//                       onClick={() => {
//                         setSearchQuery("");
//                         setSelectedProjectId("");
//                         setPayments([]);
//                       }}
//                     >
//                       <CIcon icon={cilX} />
//                     </CButton>
//                   )}
//                 </CInputGroup>

//                 {/* Dropdown */}
//                 {showDropdown && projects.length > 0 && (
//                   <div
//                     className="border bg-white shadow-sm rounded"
//                     style={{
//                       position: "absolute",
//                       top: "100%",
//                       left: 0,
//                       right: 0,
//                       maxHeight: "200px",
//                       overflowY: "auto",
//                       zIndex: 1000,
//                       marginTop: "2px",
//                     }}
//                   >
//                     {projects.map((p) => (
//                       <div
//                         key={p.id}
//                         className="px-3 py-2 hover-bg-light cursor-pointer"
//                         style={{ cursor: "pointer" }}
//                         onClick={() => selectProject(p)}
//                       >
//                         {p.project_name}
//                       </div>
//                     ))}
//                   </div>
//                 )}

//                 {selectedProjectId && (
//                   <small className="text-success d-block mt-1">
//                     Selected: <strong>{searchQuery}</strong>
//                   </small>
//                 )}
//               </div>
//             </CCol>
//           </CRow>

//           {/* Rest of your table will go here */}
//           {/* {loading ? (
//             <div className="text-center py-5">
//               <CSpinner />
//             </div>
//           ) : (
//             <p>Table content goes here...</p>
//           )} */}




//            {/* Table */}
//            {loading ? (
//             <div className="text-center py-4"><CSpinner /></div>
//           ) : payments.length > 0 ? (
//             <div className="table-responsive">
//               <CTable striped hover>
//                 <CTableHead color="light">
//                   <CTableRow>
//                     <CTableHeaderCell>Vendor Name</CTableHeaderCell>
//                     <CTableHeaderCell>Total</CTableHeaderCell>
//                     <CTableHeaderCell>Paid</CTableHeaderCell>
//                     <CTableHeaderCell>Balance</CTableHeaderCell>
//                     <CTableHeaderCell>Status</CTableHeaderCell>
//                     <CTableHeaderCell>Created</CTableHeaderCell>
//                     <CTableHeaderCell>Actions</CTableHeaderCell>
//                   </CTableRow>
//                 </CTableHead>
//                 <CTableBody>
//                   {payments.map((p) => {
//                     const paidPercentage = (parseFloat(p.paid_amount) / parseFloat(p.amount)) * 100;
//                     const statusColor = paidPercentage === 0 ? "danger" : paidPercentage === 100 ? "success" : "warning";
//                     const statusText = paidPercentage === 0 ? "Unpaid" : paidPercentage === 100 ? "Paid" : "Partial";
//                     const canPay = parseFloat(p.balance_amount) > 0;

//                     return (
//                       <CTableRow key={p.id}>
//                         <CTableDataCell>{p?.purchase?.vendor?.name}</CTableDataCell>
//                         <CTableDataCell>₹{parseFloat(p.amount).toFixed(2)}</CTableDataCell>
//                         <CTableDataCell>₹{parseFloat(p.paid_amount).toFixed(2)}</CTableDataCell>
//                         <CTableDataCell>₹{parseFloat(p.balance_amount).toFixed(2)}</CTableDataCell>
//                         <CTableDataCell><CBadge color={statusColor}>{statusText}</CBadge></CTableDataCell>
//                         <CTableDataCell>{new Date(p.created_at).toLocaleDateString()}</CTableDataCell>
//                         <CTableDataCell>
//                           <CButton
//                             color="info"
//                             size="sm"
//                             className="me-1"
//                             onClick={() => openLogsModal(p.purches_vendor_id)}
//                             disabled={!p.logs || p.logs.length === 0}
//                           >
//                             <CIcon icon={cilList} /> Logs ({p.logs?.length || 0})
//                           </CButton>
//                           <CButton
//                             color="success"
//                             size="sm"
//                             className="me-1"
//                             onClick={() => openPayModal(p)}
//                             disabled={!canPay}
//                             title={canPay ? "Make Payment" : "Fully Paid"}
//                           >
//                             <CIcon icon={cilDollar} /> Pay
//                           </CButton>
//                           <CButton color="warning" size="sm" className="me-1" onClick={() => openEditModal(p)}>
//                             <CIcon icon={cilPencil} />
//                           </CButton>
//                         </CTableDataCell>
//                       </CTableRow>
//                     );
//                   })}
//                 </CTableBody>
//               </CTable>
//             </div>
//           ) : selectedProjectId ? (
//             <div className="text-center py-5">
//               <h5 className="text-muted">No payments yet</h5>
//               <CButton color="primary" onClick={openAddModal}>
//                 <CIcon icon={cilPlus} className="me-1" />
//                 Add First Material
//               </CButton>
//             </div>
//           ) : (
//             <div className="text-center py-5">
//               <h5 className="text-muted">Select a project to view payments</h5>
//             </div>
//           )}
//           {selectedProjectId && !loading && (
//             <div className="mt-3">
//               <CButton color="success" onClick={openAddModal}>
//                 <CIcon icon={cilPlus} className="me-1" />
//                 Add Material
//               </CButton>
//             </div>
//           )}






          
//         </CCardBody>
//       </CCard>

//       {/* Modals */}
//       <PayModal
//         visible={showPayModal}
//         onClose={() => setShowPayModal(false)}
//         payForm={payForm}
//         payError={payError}
//         payLoading={payLoading}
//         onChange={handlePayChange}
//         onSubmit={addVendorPayment}
//         selectedVendorPayment={selectedVendorPayment}
     

//       />

//       <AddEditMaterialModal
//         visible={showAddEditModal}
//         onClose={() => setShowAddEditModal(false)}
//         isEdit={isEdit}
//         form={form}
//         vendors={vendors}
//         onChange={handleFormChange}
//         onSubmit={submitForm}
//         error={modalError}
//       />

//       <PaymentLogsModal
//         visible={showLogsModal}
//         onClose={() => setShowLogsModal(false)}
//         logsData={logsData}
//         loading={logsLoading}
//         onDownloadPDF={() => downloadPDF(logsData)}
//         onDownloadExcel={() => downloadExcel(logsData)}
//       />

//       <ProjectSelectionModal
//         visible={showProjectModal}
//         onClose={() => setShowProjectModal(false)}
//         onSelectProject={(p) => {
//           selectProject(p);
//           setShowProjectModal(false);
//         }}
//       />
//     </>
//   );
// };

// export default PurchesVendorPayment;
























































































































































// __________________________________________________________________________________________
// without pdf download workable code 

// import React, { useEffect, useState, useCallback, useRef } from "react";
// import {
//   CButton,
//   CCard,
//   CCardHeader,
//   CCardBody,
//   CCol,
//   CFormInput,
//   CInputGroup,
//   CRow,
//   CSpinner,
//   CModal,
//   CModalHeader,
//   CModalTitle,
//   CModalBody,
//   CModalFooter,
//   CForm,
//   CFormLabel,
//   CFormSelect,
//   CTable,
//   CTableHead,
//   CTableRow,
//   CTableHeaderCell,
//   CTableBody,
//   CTableDataCell,
//   CBadge,
//   CAlert,
// } from "@coreui/react";
// import {
//   cilSearch,
//   cilPlus,
//   cilPencil,
//   cilTrash,
//   cilX,
//   cilSync,
//   cilList,
//   cilDollar,
// } from "@coreui/icons";
// import CIcon from "@coreui/icons-react";
// import { getAPICall, post, put, deleteAPICall } from "../../../util/api";
// import ProjectSelectionModal from "../../common/ProjectSelectionModal";
// import { useToast } from "../../common/toast/ToastContext";

// const PurchesVendorPayment = () => {
//   /* ------------------------------------------------------------------ */
//   /* STATE & REFS */
//   /* ------------------------------------------------------------------ */
//   const [showProjectModal, setShowProjectModal] = useState(false);
//   const [payments, setPayments] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [projects, setProjects] = useState([]);
//   const [selectedProjectId, setSelectedProjectId] = useState("");
//   const [showDropdown, setShowDropdown] = useState(false);

//   // Modals
//   const [showModal, setShowModal] = useState(false);
//   const [isEdit, setIsEdit] = useState(false);
//   const [editingId, setEditingId] = useState(null);
//   const [modalError, setModalError] = useState("");

//   const [showLogsModal, setShowLogsModal] = useState(false);
//   const [logsData, setLogsData] = useState(null);
//   const [logsLoading, setLogsLoading] = useState(false);

//   // Pay Modal
//   const [showPayModal, setShowPayModal] = useState(false);
//   const [payForm, setPayForm] = useState({
//     purches_vendor_id: "",
//     paid_by: "Admin",
//     payment_type: "Cash",
//     amount: "",
//     payment_date: new Date().toISOString().split("T")[0],
//     description: "",
//   });
//   const [payError, setPayError] = useState("");
//   const [payLoading, setPayLoading] = useState(false);
//   const [selectedVendorPayment, setSelectedVendorPayment] = useState(null);

//   // Form fields
//   const [form, setForm] = useState({
//     vendor_id: "",
//     material_name: "",
//     about: "",
//     qty: 1,
//     price: 0,
//     total: 0,
//     date: new Date().toISOString().split("T")[0],
//     project_id: "",
//     payment_id: null,
//   });
//   const [vendors, setVendors] = useState([]);

//   const dropdownRef = useRef(null);
//   const inputRef = useRef(null);
//   const { showToast } = useToast();

//   /* ------------------------------------------------------------------ */
//   /* API HELPERS */
//   /* ------------------------------------------------------------------ */
//   const fetchVendors = async () => {
//     try {
//       const res = await getAPICall("/api/getPurchesVendor");
//       setVendors(res || []);
//     } catch (e) {
//       showToast("danger", "Failed to load vendors");
//     }
//   };

//   const fetchPayments = async () => {
//     if (!selectedProjectId) return;
//     setLoading(true);
//     try {
//       const res = await getAPICall(`/api/getPurchesVedorPayment?project_id=${selectedProjectId}`);
//       if (res && res.success && Array.isArray(res.data)) {
//         setPayments(res.data);
//       } else {
//         setPayments([]);
//       }
//     } catch (e) {
//       showToast("danger", "Failed to load payments");
//       setPayments([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchPaymentLogs = async (vendorId) => {
//     setLogsLoading(true);
//     try {
//       const res = await getAPICall(`/api/getVendorPaymentDetails/${vendorId}`);
//       setLogsData(res);
//     } catch (e) {
//       showToast("danger", "Failed to load payment logs");
//       setLogsData(null);
//     } finally {
//       setLogsLoading(false);
//     }
//   };

//   const addVendorPayment = async () => {
//     setPayError("");
//     if (!payForm.paid_by.trim()) return setPayError("Paid by is required");
//     if (!payForm.amount || payForm.amount <= 0) return setPayError("Amount must be > 0");
//     if (!payForm.payment_date) return setPayError("Payment date is required");

//     const payload = {
//       purches_vendor_id: payForm.purches_vendor_id,
//       paid_by: payForm.paid_by,
//       payment_type: payForm.payment_type,
//       amount: parseFloat(payForm.amount),
//       payment_date: payForm.payment_date,
//       description: payForm.description || null,
//     };

//     setPayLoading(true);
//     try {
//       const res = await post("/api/addVendorPayment", payload);
//       showToast("success", res.message || "Payment added successfully!");
//       setShowPayModal(false);
//       resetPayForm();
//       fetchPayments();
//     } catch (e) {
//       const msg = e.response?.data?.message || "Payment failed";
//       setPayError(msg);
//     } finally {
//       setPayLoading(false);
//     }
//   };

//   const syncPurchases = async () => {
//     if (!selectedProjectId) return;
//     setLoading(true);
//     try {
//       await post(`/api/projects/${selectedProjectId}/sync-purchases`, {});
//       showToast("success", "Purchases synced!");
//       fetchPayments();
//     } catch (e) {
//       showToast("danger", "Sync failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ------------------------------------------------------------------ */
//   /* PROJECT SEARCH */
//   /* ------------------------------------------------------------------ */
//   const fetchProjects = useCallback(async (q) => {
//     try {
//       const res = await getAPICall(`/api/projects?searchQuery=${q}`);
//       setProjects(res || []);
//       setShowDropdown(true);
//     } catch {
//       setProjects([]);
//       setShowDropdown(false);
//     }
//   }, []);

//   useEffect(() => {
//     const t = setTimeout(() => {
//       if (searchQuery && searchQuery.length > 2) fetchProjects(searchQuery);
//       else {
//         setProjects([]);
//         setShowDropdown(false);
//       }
//     }, 300);
//     return () => clearTimeout(t);
//   }, [searchQuery, fetchProjects]);

//   useEffect(() => {
//     const clickOut = (e) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(e.target))
//         setShowDropdown(false);
//     };
//     document.addEventListener("mousedown", clickOut);
//     return () => document.removeEventListener("mousedown", clickOut);
//   }, []);

//   useEffect(() => {
//     if (selectedProjectId) fetchPayments();
//     else setPayments([]);
//   }, [selectedProjectId]);

//   const selectProject = (p) => {
//     setSearchQuery(p.project_name);
//     setSelectedProjectId(p.id);
//     setProjects([]);
//     setShowDropdown(false);
//     if (inputRef.current) inputRef.current.blur();
//   };

//   /* ------------------------------------------------------------------ */
//   /* MODAL HANDLERS */
//   /* ------------------------------------------------------------------ */
//   const openAddModal = () => {
//     setIsEdit(false);
//     setEditingId(null);
//     setForm({
//       vendor_id: "",
//       material_name: "",
//       about: "",
//       qty: 1,
//       price: 0,
//       total: 0,
//       date: new Date().toISOString().split("T")[0],
//       project_id: selectedProjectId,
//       payment_id: null,
//     });
//     setModalError("");
//     setShowModal(true);
//   };

//   const openEditModal = (row) => {
//     setIsEdit(true);
//     setEditingId(row.id);

//     const purchase = row.purchase || {};

//     setForm({
//       vendor_id: purchase.vendor_id || "",
//       material_name: purchase.material_name || "",
//       about: purchase.about || "",
//       qty: parseFloat(purchase.qty) || 1,
//       price: parseFloat(purchase.price_per_unit) || 0,
//       total: parseFloat(purchase.total) || 0,
//       date: purchase.date || new Date().toISOString().split("T")[0],
//       project_id: selectedProjectId,
//       payment_id: row.id,
//     });

//     setModalError("");
//     setShowModal(true);
//   };

//   const closeModal = () => {
//     setShowModal(false);
//     setModalError("");
//   };

//   const handleFormChange = (e) => {
//     const { name, value } = e.target;
//     setForm((prev) => {
//       const updated = { ...prev, [name]: value };

//       if (name === "qty" || name === "price") {
//         const qty = name === "qty" ? parseFloat(value) : parseFloat(prev.qty) || 0;
//         const price = name === "price" ? parseFloat(value) : parseFloat(prev.price) || 0;
//         updated.total = (qty * price).toFixed(2);
//       }

//       return updated;
//     });
//   };

//   const validate = () => {
//     if (!selectedProjectId) return "Select a project first";
//     if (!form.vendor_id) return "Vendor is required";
//     if (!form.material_name.trim()) return "Material name is required";
//     if (!form.qty || form.qty <= 0) return "Qty must be > 0";
//     if (!form.price || form.price <= 0) return "Price must be > 0";
//     if (!form.date) return "Date is required";
//     return "";
//   };

//   const submitForm = async () => {
//     const err = validate();
//     if (err) {
//       setModalError(err);
//       return;
//     }

//     const payload = {
//       project_id: parseInt(form.project_id),
//       vendor_id: parseInt(form.vendor_id),
//       material_name: form.material_name,
//       about: form.about || null,
//       price_per_unit: parseFloat(form.price),
//       qty: parseFloat(form.qty),
//       total: parseFloat(form.total),
//       date: form.date,
//       paid_amount: isEdit ? undefined : 0, // Only for Add
//     };

//     try {
//       let res;
//       if (isEdit) {
//         // EDIT: Use updatePurchesVendorPayment
//         const editPayload = {
//           payment_id: form.payment_id,
//           vendor_id: parseInt(form.vendor_id),
//           project_id: parseInt(form.project_id),
//           material_name: form.material_name,
//           about: form.about || null,
//           price_per_unit: parseFloat(form.price),
//           qty: parseFloat(form.qty),
//           date: form.date,
//         };
//         res = await put("/api/updatePurchesVendorPayment", editPayload);
//       } else {
//         // ADD: Use purchesVendor
//         res = await post("/api/purchesVendor", payload);
//       }

//       showToast("success", res.message || `${isEdit ? "Updated" : "Added"} successfully!`);
//       closeModal();
//       fetchPayments();
//     } catch (e) {
//       const msg = e.response?.data?.message || "Operation failed";
//       setModalError(msg);
//     }
//   };

//   const deleteRow = async (id) => {
//     if (!window.confirm("Delete this payment record?")) return;
//     try {
//       await deleteAPICall(`/api/purchases/${id}`);
//       showToast("success", "Payment deleted");
//       fetchPayments();
//     } catch {
//       showToast("danger", "Delete failed");
//     }
//   };

//   /* ------------------------------------------------------------------ */
//   /* PAY MODAL HANDLERS */
//   /* ------------------------------------------------------------------ */
//   const openPayModal = (payment) => {
//     setSelectedVendorPayment(payment);
//     setPayForm({
//       purches_vendor_id: payment.purches_vendor_id,
//       paid_by: "Admin",
//       payment_type: "Cash",
//       amount: "",
//       payment_date: new Date().toISOString().split("T")[0],
//       description: "",
//     });
//     setPayError("");
//     setShowPayModal(true);
//   };

//   const closePayModal = () => {
//     setShowPayModal(false);
//     setSelectedVendorPayment(null);
//     resetPayForm();
//   };

//   const resetPayForm = () => {
//     setPayForm({
//       purches_vendor_id: "",
//       paid_by: "Admin",
//       payment_type: "Cash",
//       amount: "",
//       payment_date: new Date().toISOString().split("T")[0],
//       description: "",
//     });
//     setPayError("");
//   };

//   const handlePayChange = (e) => {
//     const { name, value } = e.target;
//     setPayForm((prev) => ({ ...prev, [name]: value }));
//   };

//   /* ------------------------------------------------------------------ */
//   /* LOGS MODAL */
//   /* ------------------------------------------------------------------ */
//   const openLogsModal = async (vendorId) => {
//     setShowLogsModal(true);
//     await fetchPaymentLogs(vendorId);
//   };

//   const closeLogsModal = () => {
//     setShowLogsModal(false);
//     setLogsData(null);
//   };

//   /* ------------------------------------------------------------------ */
//   /* EFFECTS */
//   /* ------------------------------------------------------------------ */
//   useEffect(() => {
//     fetchVendors();
//   }, []);

//   /* ------------------------------------------------------------------ */
//   /* RENDER */
//   /* ------------------------------------------------------------------ */
//   return (
//     <>
//       <CCard className="mb-4">
//         <CCardHeader className="bg-primary text-white d-flex justify-content-between align-items-center">
//           <h5 className="mb-0">Purchase Vendor Payments</h5>
//           {/* {selectedProjectId && (
//             <CButton color="light" size="sm" onClick={syncPurchases} disabled={loading}>
//               {loading ? (
//                 <>
//                   <CSpinner size="sm" className="me-2" />
//                   Syncing...
//                 </>
//               ) : (
//                 <>
//                   <CIcon icon={cilSync} className="me-2" />
//                   Sync Purchases
//                 </>
//               )}
//             </CButton>
//           )} */}
//         </CCardHeader>
//         <CCardBody>
//           {/* Project Selector */}
//           <CRow className="mb-4">
//             <CCol md={12}>
//               <div className="position-relative" ref={dropdownRef}>
//                 <CInputGroup>
//                   <CFormInput
//                     ref={inputRef}
//                     type="text"
//                     placeholder="Search project..."
//                     value={searchQuery}
//                     onChange={(e) => {
//                       setSearchQuery(e.target.value);
//                       if (selectedProjectId && e.target.value !== searchQuery)
//                         setSelectedProjectId("");
//                     }}
//                     onFocus={() => projects.length && setShowDropdown(true)}
//                     autoComplete="off"
//                   />
//                   {!selectedProjectId ? (
//                     <CButton
//                       color="primary"
//                       variant="outline"
//                       onClick={() => setShowProjectModal(true)}
//                       style={{ position: "absolute", right: 0, top: 0, bottom: 0, zIndex: 5, borderRadius: 0 }}
//                     >
//                       <CIcon icon={cilSearch} />
//                     </CButton>
//                   ) : (
//                     <CButton
//                       color="danger"
//                       variant="outline"
//                       onClick={() => {
//                         setSearchQuery("");
//                         setSelectedProjectId("");
//                         setPayments([]);
//                       }}
//                       style={{ position: "absolute", right: 0, top: 0, bottom: 0, zIndex: 5, borderRadius: 0 }}
//                     >
//                       <CIcon icon={cilX} />
//                     </CButton>
//                   )}
//                 </CInputGroup>
//                 {showDropdown && projects.length > 0 && (
//                   <div
//                     className="dropdown-menu show w-100"
//                     style={{ maxHeight: "200px", overflowY: "auto", position: "absolute", zIndex: 1000, marginTop: "2px" }}
//                   >
//                     {projects.map((p) => (
//                       <div
//                         key={p.id}
//                         className="dropdown-item"
//                         style={{ cursor: "pointer" }}
//                         onClick={() => selectProject(p)}
//                       >
//                         {p.project_name}
//                       </div>
//                     ))}
//                   </div>
//                 )}
//                 {selectedProjectId && (
//                   <div className="text-success mt-1 small">Selected: {searchQuery}</div>
//                 )}
//               </div>
//             </CCol>
//           </CRow>

//           {/* Table */}
//           {loading ? (
//             <div className="text-center py-4"><CSpinner /></div>
//           ) : payments.length > 0 ? (
//             <div className="table-responsive">
//               <CTable striped hover>
//                 <CTableHead color="light">
//                   <CTableRow>
//                     <CTableHeaderCell>Vendor Name</CTableHeaderCell>
//                     <CTableHeaderCell>Total</CTableHeaderCell>
//                     <CTableHeaderCell>Paid</CTableHeaderCell>
//                     <CTableHeaderCell>Balance</CTableHeaderCell>
//                     <CTableHeaderCell>Status</CTableHeaderCell>
//                     <CTableHeaderCell>Created</CTableHeaderCell>
//                     <CTableHeaderCell>Actions</CTableHeaderCell>
//                   </CTableRow>
//                 </CTableHead>
//                 <CTableBody>
//                   {payments.map((p) => {
//                     const paidPercentage = (parseFloat(p.paid_amount) / parseFloat(p.amount)) * 100;
//                     const statusColor = paidPercentage === 0 ? "danger" : paidPercentage === 100 ? "success" : "warning";
//                     const statusText = paidPercentage === 0 ? "Unpaid" : paidPercentage === 100 ? "Paid" : "Partial";
//                     const canPay = parseFloat(p.balance_amount) > 0;

//                     return (
//                       <CTableRow key={p.id}>
//                         <CTableDataCell>{p?.purchase?.vendor?.name}</CTableDataCell>
//                         <CTableDataCell>₹{parseFloat(p.amount).toFixed(2)}</CTableDataCell>
//                         <CTableDataCell>₹{parseFloat(p.paid_amount).toFixed(2)}</CTableDataCell>
//                         <CTableDataCell>₹{parseFloat(p.balance_amount).toFixed(2)}</CTableDataCell>
//                         <CTableDataCell><CBadge color={statusColor}>{statusText}</CBadge></CTableDataCell>
//                         <CTableDataCell>{new Date(p.created_at).toLocaleDateString()}</CTableDataCell>
//                         <CTableDataCell>
//                           <CButton
//                             color="info"
//                             size="sm"
//                             className="me-1"
//                             onClick={() => openLogsModal(p.purches_vendor_id)}
//                             disabled={!p.logs || p.logs.length === 0}
//                           >
//                             <CIcon icon={cilList} /> Logs ({p.logs?.length || 0})
//                           </CButton>
//                           <CButton
//                             color="success"
//                             size="sm"
//                             className="me-1"
//                             onClick={() => openPayModal(p)}
//                             disabled={!canPay}
//                             title={canPay ? "Make Payment" : "Fully Paid"}
//                           >
//                             <CIcon icon={cilDollar} /> Pay
//                           </CButton>
//                           <CButton color="warning" size="sm" className="me-1" onClick={() => openEditModal(p)}>
//                             <CIcon icon={cilPencil} />
//                           </CButton>
//                         </CTableDataCell>
//                       </CTableRow>
//                     );
//                   })}
//                 </CTableBody>
//               </CTable>
//             </div>
//           ) : selectedProjectId ? (
//             <div className="text-center py-5">
//               <h5 className="text-muted">No payments yet</h5>
//               <CButton color="primary" onClick={openAddModal}>
//                 <CIcon icon={cilPlus} className="me-1" />
//                 Add First Material
//               </CButton>
//             </div>
//           ) : (
//             <div className="text-center py-5">
//               <h5 className="text-muted">Select a project to view payments</h5>
//             </div>
//           )}
//           {selectedProjectId && !loading && (
//             <div className="mt-3">
//               <CButton color="success" onClick={openAddModal}>
//                 <CIcon icon={cilPlus} className="me-1" />
//                 Add Material
//               </CButton>
//             </div>
//           )}
//         </CCardBody>
//       </CCard>

//       {/* PAYMENT MODAL */}
//       <CModal visible={showPayModal} onClose={closePayModal} backdrop="static">
//         <CModalHeader onClose={closePayModal}>
//           <CModalTitle>Make Payment</CModalTitle>
//         </CModalHeader>
//         <CModalBody>
//           <CForm>
//             <CRow className="g-3">
//               <CCol md={6}>
//                 <CFormLabel>Vendor Name</CFormLabel>
//                 <div
//                   className="form-control"
//                   style={{
//                     backgroundColor: "#f0f4f7",
//                     fontWeight: "500",
//                     minHeight: "38px",
//                     display: "flex",
//                     alignItems: "center",
//                     padding: "0.375rem 0.75rem",
//                     border: "1px solid #ced4da",
//                     borderRadius: "0.375rem",
//                   }}
//                 >
//                   {selectedVendorPayment?.purchase?.vendor?.name || "—"}
//                 </div>
//               </CCol>
//               <CCol md={6}>
//                 <CFormLabel>Remaining Balance</CFormLabel>
//                 <div
//                   className="form-control"
//                   style={{
//                     backgroundColor: "#f8f9fa",
//                     fontWeight: "600",
//                     color: "#d63384",
//                     minHeight: "38px",
//                     display: "flex",
//                     alignItems: "center",
//                     padding: "0.375rem 0.75rem",
//                     border: "1px solid #ced4da",
//                     borderRadius: "0.375rem",
//                   }}
//                 >
//                   ₹{parseFloat(selectedVendorPayment?.balance_amount || 0).toFixed(2)}
//                 </div>
//               </CCol>
//             </CRow>

//             <CRow className="g-3 mt-2">
//               <CCol md={6}>
//                 <CFormLabel>Paid By *</CFormLabel>
//                 <CFormInput
//                   name="paid_by"
//                   value={payForm.paid_by}
//                   onChange={handlePayChange}
//                   placeholder="e.g. Admin 12345"
//                 />
//               </CCol>
//               <CCol md={6}>
//                 <CFormLabel>Payment Type</CFormLabel>
//                 <CFormSelect
//                   name="payment_type"
//                   value={payForm.payment_type}
//                   onChange={handlePayChange}
//                 >
//                   <option value="Cash">Cash</option>
//                   <option value="Online">Online</option>
//                   <option value="Cheque">Cheque</option>
//                 </CFormSelect>
//               </CCol>
//             </CRow>

//             <CRow className="g-3 mt-2">
//               <CCol md={6}>
//                 <CFormLabel>Amount *</CFormLabel>
//                 <CFormInput
//                   type="number"
//                   name="amount"
//                   value={payForm.amount}
//                   onChange={handlePayChange}
//                   min="0.01"
//                   step="0.01"
//                   placeholder="0.00"
//                 />
//               </CCol>
//               <CCol md={6}>
//                 <CFormLabel>Payment Date *</CFormLabel>
//                 <CFormInput
//                   type="date"
//                   name="payment_date"
//                   value={payForm.payment_date}
//                   onChange={handlePayChange}
//                   max={new Date().toISOString().split("T")[0]}
//                 />
//               </CCol>
//             </CRow>

//             <CRow className="g-3 mt-2">
//               <CCol md={12}>
//                 <CFormLabel>Description (optional)</CFormLabel>
//                 <CFormInput
//                   type="text"
//                   name="description"
//                   value={payForm.description}
//                   onChange={handlePayChange}
//                   placeholder="e.g. Payment for Stones delivery"
//                 />
//               </CCol>
//             </CRow>

//             {payError && <CAlert color="danger" className="mt-3">{payError}</CAlert>}
//           </CForm>
//         </CModalBody>
//         <CModalFooter>
//           <CButton color="secondary" onClick={closePayModal}>Cancel</CButton>
//           <CButton color="primary" onClick={addVendorPayment} disabled={payLoading}>
//             {payLoading ? <CSpinner size="sm" /> : "Submit Payment"}
//           </CButton>
//         </CModalFooter>
//       </CModal>

//       {/* ADD/EDIT MODAL */}
//       <CModal visible={showModal} onClose={closeModal} backdrop="static" size="lg">
//         <CModalHeader onClose={closeModal}>
//           <CModalTitle>{isEdit ? "Edit" : "Add"} Material</CModalTitle>
//         </CModalHeader>
//         <CModalBody>
//           <CForm>
//             <CRow className="g-3">
//               <CCol md={6}>
//                 <CFormLabel>Vendor *</CFormLabel>
//                 <select className="form-select" name="vendor_id" value={form.vendor_id} onChange={handleFormChange} required>
//                   <option value="">Select Vendor</option>
//                   {vendors.map((v) => (
//                     <option key={v.id} value={v.id}>{v.name}</option>
//                   ))}
//                 </select>
//               </CCol>
//               <CCol md={6}>
//                 <CFormLabel>Material Name *</CFormLabel>
//                 <CFormInput type="text" name="material_name" value={form.material_name} onChange={handleFormChange} required />
//               </CCol>
//             </CRow>

//             <CRow className="g-3 mt-2">
//               <CCol md={12}>
//                 <CFormLabel>About (optional)</CFormLabel>
//                 <CFormInput type="text" name="about" value={form.about} onChange={handleFormChange} />
//               </CCol>
//             </CRow>

//             <CRow className="g-3 mt-2 align-items-end">
//               <CCol md={3}>
//                 <CFormLabel>Qty *</CFormLabel>
//                 <CFormInput type="number" name="qty" min="0.01" step="0.01" value={form.qty} onChange={handleFormChange} required />
//               </CCol>
//               <CCol md={3}>
//                 <CFormLabel>Price/Unit *</CFormLabel>
//                 <CFormInput type="number" name="price" min="0" step="0.01" value={form.price} onChange={handleFormChange} required />
//               </CCol>
//               <CCol md={3}>
//                 <CFormLabel>Total</CFormLabel>
//                 <CFormInput type="number" value={form.total} readOnly />
//               </CCol>
//               <CCol md={3}>
//                 <CFormLabel>Date *</CFormLabel>
//                 <CFormInput type="date" name="date" value={form.date} onChange={handleFormChange} max={new Date().toISOString().split("T")[0]} required />
//               </CCol>
//             </CRow>

//             {modalError && <CAlert color="danger" className="mt-3">{modalError}</CAlert>}
//           </CForm>
//         </CModalBody>
//         <CModalFooter>
//           <CButton color="secondary" onClick={closeModal}>Cancel</CButton>
//           <CButton color="primary" onClick={submitForm}>
//             {isEdit ? "Update" : "Save"}
//           </CButton>
//         </CModalFooter>
//       </CModal>

//       {/* LOGS MODAL */}
//       <CModal visible={showLogsModal} onClose={closeLogsModal} backdrop="static" size="xl">
//         <CModalHeader onClose={closeLogsModal}><CModalTitle>Payment Logs</CModalTitle></CModalHeader>
//         <CModalBody>
//           {logsLoading ? (
//             <div className="text-center py-4"><CSpinner /><p>Loading logs...</p></div>
//           ) : logsData ? (
//             <>
//               <CCard className="mb-3">
//                 <CCardHeader className="bg-light"><h6 className="mb-0">Payment Summary</h6></CCardHeader>
//                 <CCardBody>
//                   <CRow>
//                     <CCol md={4}><strong>Vendor ID:</strong> {logsData.payment_master?.purches_vendor_id}</CCol>
//                     <CCol md={4}><strong>Total:</strong> ₹{parseFloat(logsData.payment_master?.total_amount || 0).toFixed(2)}</CCol>
//                     <CCol md={4}><strong>Paid:</strong> ₹{parseFloat(logsData.payment_master?.paid_amount || 0).toFixed(2)}</CCol>
//                   </CRow>
//                   <CRow className="mt-2">
//                     <CCol md={4}><strong>Balance:</strong> ₹{parseFloat(logsData.payment_master?.balance_amount || 0).toFixed(2)}</CCol>
//                     <CCol md={8}>
//                       <CBadge color={parseFloat(logsData.payment_master?.balance_amount || 0) === 0 ? 'success' : 'warning'}>
//                         {parseFloat(logsData.payment_master?.balance_amount || 0) === 0 ? 'Fully Paid' : 'Pending'}
//                       </CBadge>
//                     </CCol>
//                   </CRow>
//                 </CCardBody>
//               </CCard>
//               <h6>Payment History</h6>
//               {logsData.payment_logs?.length > 0 ? (
//                 <CTable striped bordered>
//                   <CTableHead color="dark">
//                     <CTableRow>
//                       <CTableHeaderCell>#</CTableHeaderCell>
//                       <CTableHeaderCell>Paid By</CTableHeaderCell>
//                       <CTableHeaderCell>Type</CTableHeaderCell>
//                       <CTableHeaderCell>Amount</CTableHeaderCell>
//                       <CTableHeaderCell>Date</CTableHeaderCell>
//                       <CTableHeaderCell>Description</CTableHeaderCell>
//                       <CTableHeaderCell>Created</CTableHeaderCell>
//                     </CTableRow>
//                   </CTableHead>
//                   <CTableBody>
//                     {logsData.payment_logs.map((log, i) => (
//                       <CTableRow key={log.id}>
//                         <CTableDataCell>{i + 1}</CTableDataCell>
//                         <CTableDataCell>{log.paid_by}</CTableDataCell>
//                         <CTableDataCell><CBadge color={log.payment_type === 'Cash' ? 'success' : 'primary'}>{log.payment_type}</CBadge></CTableDataCell>
//                         <CTableDataCell><strong>₹{parseFloat(log.amount).toFixed(2)}</strong></CTableDataCell>
//                         <CTableDataCell>{new Date(log.payment_date).toLocaleDateString()}</CTableDataCell>
//                         <CTableDataCell>{log.description || "—"}</CTableDataCell>
//                         <CTableDataCell>{new Date(log.created_at).toLocaleString()}</CTableDataCell>
//                       </CTableRow>
//                     ))}
//                   </CTableBody>
//                 </CTable>
//               ) : (
//                 <p className="text-center text-muted">No logs available</p>
//               )}
//             </>
//           ) : (
//             <p className="text-center text-muted">No data</p>
//           )}
//         </CModalBody>
//         <CModalFooter>
//           <CButton color="secondary" onClick={closeLogsModal}>Close</CButton>
//         </CModalFooter>
//       </CModal>

//       <ProjectSelectionModal
//         visible={showProjectModal}
//         onClose={() => setShowProjectModal(false)}
//         onSelectProject={selectProject}
//       />
//     </>
//   );
// };

// export default PurchesVendorPayment;
























// ________________________________________________________________________________________________
// with pdf download workbale code 

// import React, { useEffect, useState, useCallback, useRef } from "react";
// import {
//   CButton,
//   CCard,
//   CCardHeader,
//   CCardBody,
//   CCol,
//   CFormInput,
//   CInputGroup,
//   CRow,
//   CSpinner,
//   CModal,
//   CModalHeader,
//   CModalTitle,
//   CModalBody,
//   CModalFooter,
//   CForm,
//   CFormLabel,
//   CFormSelect,
//   CTable,
//   CTableHead,
//   CTableRow,
//   CTableHeaderCell,
//   CTableBody,
//   CTableDataCell,
//   CBadge,
//   CAlert,
// } from "@coreui/react";
// import {
//   cilSearch,
//   cilPlus,
//   cilPencil,
//   cilTrash,
//   cilX,
//   cilSync,
//   cilList,
//   cilDollar,
//   cilFile,
//   cilSpreadsheet,
// } from "@coreui/icons";
// import CIcon from "@coreui/icons-react";
// import { getAPICall, post, put, deleteAPICall } from "../../../util/api";
// import ProjectSelectionModal from "../../common/ProjectSelectionModal";
// import { useToast } from "../../common/toast/ToastContext";
// import jsPDF from "jspdf";
// import "jspdf-autotable";
// import * as XLSX from "xlsx";

// const PurchesVendorPayment = () => {
//   /* ------------------------------------------------------------------ */
//   /* STATE & REFS */
//   /* ------------------------------------------------------------------ */
//   const [showProjectModal, setShowProjectModal] = useState(false);
//   const [payments, setPayments] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [projects, setProjects] = useState([]);
//   const [selectedProjectId, setSelectedProjectId] = useState("");
//   const [showDropdown, setShowDropdown] = useState(false);

//   // Modals
//   const [showModal, setShowModal] = useState(false);
//   const [isEdit, setIsEdit] = useState(false);
//   const [editingId, setEditingId] = useState(null);
//   const [modalError, setModalError] = useState("");

//   const [showLogsModal, setShowLogsModal] = useState(false);
//   const [logsData, setLogsData] = useState(null);
//   const [logsLoading, setLogsLoading] = useState(false);

//   // Pay Modal
//   const [showPayModal, setShowPayModal] = useState(false);
//   const [payForm, setPayForm] = useState({
//     purches_vendor_id: "",
//     paid_by: "Admin",
//     payment_type: "Cash",
//     amount: "",
//     payment_date: new Date().toISOString().split("T")[0],
//     description: "",
//   });
//   const [payError, setPayError] = useState("");
//   const [payLoading, setPayLoading] = useState(false);
//   const [selectedVendorPayment, setSelectedVendorPayment] = useState(null);

//   // Form fields
//   const [form, setForm] = useState({
//     vendor_id: "",
//     material_name: "",
//     about: "",
//     qty: 1,
//     price: 0,
//     total: 0,
//     date: new Date().toISOString().split("T")[0],
//     project_id: "",
//     payment_id: null,
//   });
//   const [vendors, setVendors] = useState([]);

//   const dropdownRef = useRef(null);
//   const inputRef = useRef(null);
//   const { showToast } = useToast();

//   /* ------------------------------------------------------------------ */
//   /* API HELPERS */
//   /* ------------------------------------------------------------------ */
//   const fetchVendors = async () => {
//     try {
//       const res = await getAPICall("/api/getPurchesVendor");
//       setVendors(res || []);
//     } catch (e) {
//       showToast("danger", "Failed to load vendors");
//     }
//   };

//   const fetchPayments = async () => {
//     if (!selectedProjectId) return;
//     setLoading(true);
//     try {
//       const res = await getAPICall(`/api/getPurchesVedorPayment?project_id=${selectedProjectId}`);
//       if (res && res.success && Array.isArray(res.data)) {
//         setPayments(res.data);
//       } else {
//         setPayments([]);
//       }
//     } catch (e) {
//       showToast("danger", "Failed to load payments");
//       setPayments([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchPaymentLogs = async (vendorId) => {
//     setLogsLoading(true);
//     try {
//       const res = await getAPICall(`/api/getVendorPaymentDetails/${vendorId}`);
//       setLogsData(res);
//     } catch (e) {
//       showToast("danger", "Failed to load payment logs");
//       setLogsData(null);
//     } finally {
//       setLogsLoading(false);
//     }
//   };

//   const addVendorPayment = async () => {
//     setPayError("");
//     if (!payForm.paid_by.trim()) return setPayError("Paid by is required");
//     if (!payForm.amount || payForm.amount <= 0) return setPayError("Amount must be > 0");
//     if (!payForm.payment_date) return setPayError("Payment date is required");

//     const payload = {
//       purches_vendor_id: payForm.purches_vendor_id,
//       paid_by: payForm.paid_by,
//       payment_type: payForm.payment_type,
//       amount: parseFloat(payForm.amount),
//       payment_date: payForm.payment_date,
//       description: payForm.description || null,
//     };

//     setPayLoading(true);
//     try {
//       const res = await post("/api/addVendorPayment", payload);
//       showToast("success", res.message || "Payment added successfully!");
//       setShowPayModal(false);
//       resetPayForm();
//       fetchPayments();
//     } catch (e) {
//       const msg = e.response?.data?.message || "Payment failed";
//       setPayError(msg);
//     } finally {
//       setPayLoading(false);
//     }
//   };

//   const syncPurchases = async () => {
//     if (!selectedProjectId) return;
//     setLoading(true);
//     try {
//       await post(`/api/projects/${selectedProjectId}/sync-purchases`, {});
//       showToast("success", "Purchases synced!");
//       fetchPayments();
//     } catch (e) {
//       showToast("danger", "Sync failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ------------------------------------------------------------------ */
//   /* PROJECT SEARCH */
//   /* ------------------------------------------------------------------ */
//   const fetchProjects = useCallback(async (q) => {
//     try {
//       const res = await getAPICall(`/api/projects?searchQuery=${q}`);
//       setProjects(res || []);
//       setShowDropdown(true);
//     } catch {
//       setProjects([]);
//       setShowDropdown(false);
//     }
//   }, []);

//   useEffect(() => {
//     const t = setTimeout(() => {
//       if (searchQuery && searchQuery.length > 2) fetchProjects(searchQuery);
//       else {
//         setProjects([]);
//         setShowDropdown(false);
//       }
//     }, 300);
//     return () => clearTimeout(t);
//   }, [searchQuery, fetchProjects]);

//   useEffect(() => {
//     const clickOut = (e) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(e.target))
//         setShowDropdown(false);
//     };
//     document.addEventListener("mousedown", clickOut);
//     return () => document.removeEventListener("mousedown", clickOut);
//   }, []);

//   useEffect(() => {
//     if (selectedProjectId) fetchPayments();
//     else setPayments([]);
//   }, [selectedProjectId]);

//   const selectProject = (p) => {
//     setSearchQuery(p.project_name);
//     setSelectedProjectId(p.id);
//     setProjects([]);
//     setShowDropdown(false);
//     if (inputRef.current) inputRef.current.blur();
//   };

//   /* ------------------------------------------------------------------ */
//   /* EXPORT FUNCTIONS */
//   /* ------------------------------------------------------------------ */
 

// const exportToPDF = () => {
//   const doc = new jsPDF();
  
//   // Title - Bold and Large
//   doc.setFontSize(22);
//   doc.setFont(undefined, 'bold');
//   doc.text("Purchase Vendor Payments Report", 14, 20);
  
//   // Project Name
//   doc.setFontSize(14);
//   doc.setFont(undefined, 'normal');
//   doc.text(`Project: ${searchQuery}`, 14, 32);
  
//   // Generated timestamp
//   doc.setFontSize(12);
//   const timestamp = new Date().toLocaleString('en-GB', { 
//     day: '2-digit', 
//     month: '2-digit', 
//     year: 'numeric',
//     hour: '2-digit',
//     minute: '2-digit',
//     second: '2-digit'
//   });
//   doc.text(`Generated on: ${timestamp}`, 14, 42);
  
//   // Prepare table data
//   const tableColumn = ["Vendor Name", "Total", "Paid", "Balance", "Status", "Created"];
//   const tableRows = [];
  
//   // Calculate totals
//   let totalAmount = 0;
//   let totalPaid = 0;
//   let totalBalance = 0;
  
//   payments.forEach((p) => {
//     const paidPercentage = (parseFloat(p.paid_amount) / parseFloat(p.amount)) * 100;
//     const statusText = paidPercentage === 0 ? "Unpaid" : paidPercentage === 100 ? "Paid" : "Partial";
    
//     const amount = parseFloat(p.amount);
//     const paid = parseFloat(p.paid_amount);
//     const balance = parseFloat(p.balance_amount);
    
//     totalAmount += amount;
//     totalPaid += paid;
//     totalBalance += balance;
    
//     const rowData = [
//       p?.purchase?.vendor?.name || "-",
//       amount.toFixed(2),
//       paid.toFixed(2),
//       balance.toFixed(2),
//       statusText,
//       new Date(p.created_at).toLocaleDateString('en-GB'),
//     ];
//     tableRows.push(rowData);
//   });
  
//   // Add totals row
//   tableRows.push([
//     "Total:",
//     totalAmount.toFixed(2),
//     totalPaid.toFixed(2),
//     totalBalance.toFixed(2),
//     "",
//     ""
//   ]);
  
//   // Generate table
//   (doc).autoTable({
//     head: [tableColumn],
//     body: tableRows,
//     startY: 52,
//     theme: "grid",
//     styles: { 
//       fontSize: 10, 
//       cellPadding: 4,
//       lineColor: [44, 62, 80],
//       lineWidth: 0.1,
//     },
//     headStyles: { 
//       fillColor: [52, 152, 219], // Blue header
//       textColor: [255, 255, 255],
//       fontStyle: 'bold',
//       halign: 'center',
//       fontSize: 11,
//     },
//     columnStyles: {
//       0: { cellWidth: 45, halign: 'left' },   // Vendor Name
//       1: { cellWidth: 28, halign: 'right' },  // Total
//       2: { cellWidth: 28, halign: 'right' },  // Paid
//       3: { cellWidth: 28, halign: 'right' },  // Balance
//       4: { cellWidth: 25, halign: 'center' }, // Status
//       5: { cellWidth: 30, halign: 'center' }, // Created
//     },
//     alternateRowStyles: {
//       fillColor: [245, 245, 245] // Light gray for alternate rows
//     },
//     didParseCell: function(data) {
//       // Style the last row (totals row) with bold text and light background
//       if (data.row.index === tableRows.length - 1) {
//         data.cell.styles.fontStyle = 'bold';
//         data.cell.styles.fillColor = [220, 230, 241]; // Light blue background
//         data.cell.styles.textColor = [0, 0, 0];
//       }
//     }
//   });
  
//   // Save the PDF
//   const fileName = `vendor-payments-${searchQuery.replace(/\s+/g, "-")}-${new Date().getTime()}.pdf`;
//   doc.save(fileName);
// };




// const exportToExcel = () => {
//   // Calculate totals
//   let totalAmount = 0;
//   let totalPaid = 0;
//   let totalBalance = 0;

//   // Prepare data rows
//   const worksheetData = payments.map((p) => {
//     const paidPercentage = (parseFloat(p.paid_amount) / parseFloat(p.amount)) * 100;
//     const statusText = paidPercentage === 0 ? "Unpaid" : paidPercentage === 100 ? "Paid" : "Partial";

//     const amount = parseFloat(p.amount);
//     const paid = parseFloat(p.paid_amount);
//     const balance = parseFloat(p.balance_amount);

//     totalAmount += amount;
//     totalPaid += paid;
//     totalBalance += balance;

//     return {
//       "Vendor Name": p?.purchase?.vendor?.name || "-",
//       "Total": amount.toFixed(2),
//       "Paid": paid.toFixed(2),
//       "Balance": balance.toFixed(2),
//       "Status": statusText,
//       "Created": new Date(p.created_at).toLocaleDateString('en-GB'),
//     };
//   });

//   // Add totals row
//   worksheetData.push({
//     "Vendor Name": "Total:",
//     "Total": totalAmount.toFixed(2),
//     "Paid": totalPaid.toFixed(2),
//     "Balance": totalBalance.toFixed(2),
//     "Status": "",
//     "Created": ""
//   });

//   // Create workbook and worksheet
//   const wb = XLSX.utils.book_new();
//   const ws = XLSX.utils.aoa_to_sheet([]);

//   // Add header information (Title, Project, Generated on)
//   const timestamp = new Date().toLocaleString('en-GB', { 
//     day: '2-digit', 
//     month: '2-digit', 
//     year: 'numeric',
//     hour: '2-digit',
//     minute: '2-digit',
//     second: '2-digit'
//   });

//   XLSX.utils.sheet_add_aoa(ws, [
//     ["Purchase Vendor Payments Report"],
//     [`Project: ${searchQuery}`],
//     [`Generated on: ${timestamp}`],
//     [], // Empty row for spacing
//   ], { origin: "A1" });

//   // Add table data starting from row 5
//   XLSX.utils.sheet_add_json(ws, worksheetData, { 
//     origin: "A5",
//     skipHeader: false 
//   });

//   // Style the header row (row 5 in 0-based index is row 4)
//   const headerRow = 4;
//   const columns = ["A", "B", "C", "D", "E", "F"];
  
//   // Apply header styling
//   columns.forEach(col => {
//     const cellRef = `${col}${headerRow + 1}`;
//     if (!ws[cellRef]) return;
//     ws[cellRef].s = {
//       font: { bold: true, color: { rgb: "FFFFFF" } },
//       fill: { fgColor: { rgb: "3498DB" } },
//       alignment: { horizontal: "center", vertical: "center" }
//     };
//   });

//   // Style the totals row (last data row)
//   const totalsRowIndex = headerRow + worksheetData.length;
//   columns.forEach(col => {
//     const cellRef = `${col}${totalsRowIndex + 1}`;
//     if (!ws[cellRef]) return;
//     ws[cellRef].s = {
//       font: { bold: true },
//       fill: { fgColor: { rgb: "DCE6F1" } },
//       alignment: { 
//         horizontal: col === "A" ? "left" : ["B", "C", "D"].includes(col) ? "right" : "center"
//       }
//     };
//   });

//   // Style title rows
//   ["A1", "A2", "A3"].forEach((cell, index) => {
//     if (ws[cell]) {
//       ws[cell].s = {
//         font: { bold: index === 0, sz: index === 0 ? 16 : 12 },
//         alignment: { horizontal: "left" }
//       };
//     }
//   });

//   // Set column widths
//   ws["!cols"] = [
//     { wch: 30 }, // Vendor Name
//     { wch: 15 }, // Total
//     { wch: 15 }, // Paid
//     { wch: 15 }, // Balance
//     { wch: 12 }, // Status
//     { wch: 18 }, // Created
//   ];

//   // Merge cells for title
//   ws["!merges"] = [
//     { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }, // Title row
//     { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } }, // Project row
//     { s: { r: 2, c: 0 }, e: { r: 2, c: 5 } }, // Generated on row
//   ];

//   // Add worksheet to workbook
//   XLSX.utils.book_append_sheet(wb, ws, "Payments");

//   // Save file
//   const fileName = `vendor-payments-${searchQuery.replace(/\s+/g, "-")}-${new Date().getTime()}.xlsx`;
//   XLSX.writeFile(wb, fileName);
// };





// const exportAllLogsToPDF = () => {
//   const doc = new jsPDF("landscape");

//   // Compact Header
//   doc.setFontSize(18);
//   doc.setFont("helvetica", "bold");
//   doc.text("All Vendor Payment Logs", 14, 15);

//   doc.setFontSize(12);
//   doc.setFont("helvetica", "normal");
//   doc.text(`Project: ${searchQuery}`, 14, 23);

//   doc.setFontSize(10);
//   doc.text(`Generated: ${new Date().toLocaleDateString("en-GB")} ${new Date().toLocaleTimeString("en-GB", { hour: '2-digit', minute: '2-digit' })}`, 14, 30);

//   const body = [];
//   let grandTotal = 0, grandPaid = 0, grandBalance = 0;

//   payments.forEach((p) => {
//     const vendor = p.purchase?.vendor?.name || "Unknown";
//     const material = p.purchase?.material_name || "-";
//     const total = parseFloat(p.amount);
//     const paid = parseFloat(p.paid_amount);
//     const balance = parseFloat(p.balance_amount);

//     grandTotal += total;
//     grandPaid += paid;
//     grandBalance += balance;

//     // Vendor + Material Header (Compact & Clean)
//     // body.push([
//     //   {
//     //     content: `${vendor} → ${material}`,
//     //     colSpan: 6,
//     //     styles: { fontStyle: "bold", fillColor: [220, 235, 255], fontSize: 10, textColor: [0, 50, 120] }
//     //   },
//     //   { content: total.toFixed(2), styles: { fontStyle: "bold", halign: "right", fontSize: 10 } },
//     //   { content: paid.toFixed(2), styles: { fontStyle: "bold", halign: "right", fontSize: 10 } },
//     //   { content: balance.toFixed(2), styles: { fontStyle: "bold", halign: "right", fontSize: 10, fillColor: balance === 0 ? [220, 255, 220] : [255, 230, 230] } }
//     // ]);

//     body.push([
//   {
//     content: `Vendor Name:${vendor} ,  Material Name:${material}`,
//     colSpan: 6,
//     styles: {
//       fontStyle: "bold",
//       fillColor: [230, 240, 255],
//       fontSize: 11,
//       textColor: [20, 40, 90],
//       halign: "left",
//       cellPadding: { top: 3, bottom: 3 },
//       lineHeight: 1.2
//     }
//   },
//   { content: total.toFixed(2), styles: { fontStyle: "bold", halign: "right", fontSize: 10 } },
//   { content: paid.toFixed(2), styles: { fontStyle: "bold", halign: "right", fontSize: 10 } },
//   {
//     content: balance.toFixed(2),
//     styles: {
//       fontStyle: "bold",
//       halign: "right",
//       fontSize: 10,
//       fillColor: balance === 0 ? [220, 255, 220] : [255, 230, 230]
//     }
//   }
// ]);


//     // Payment Logs (Super Compact)
//     if (p.logs && p.logs.length > 0) {
//       p.logs.forEach((log, i) => {
//         body.push([
//           i + 1,
//           log.paid_by || "-",
//           log.payment_type || "-",
//           parseFloat(log.amount).toFixed(2),
//           new Date(log.payment_date).toLocaleDateString("en-GB"),
//           (log.description || "-").substring(0, 40) + (log.description?.length > 40 ? "..." : ""),
//           "", "", ""
//         ]);
//       });
//     } else {
//       body.push([
//         { content: "No payments yet", colSpan: 6, styles: { fontStyle: "italic", fontSize: 9, textColor: [150,150,150] } },
//         "", "", ""
//       ]);
//     }

//     // Small spacing
//     body.push(["", "", "", "", "", "", "", "", ""]);
//   });

//   // Grand Total
//   body.push([
//     {
//       content: "GRAND TOTAL",
//       colSpan: 6,
//       styles: { fontStyle: "bold", fillColor: [200, 230, 200], fontSize: 11 }
//     },
//     { content: grandTotal.toFixed(2), styles: { fontStyle: "bold", halign: "right", fontSize: 11 } },
//     { content: grandPaid.toFixed(2), styles: { fontStyle: "bold", halign: "right", fontSize: 11 } },
//     { content: grandBalance.toFixed(2), styles: { fontStyle: "bold", halign: "right", fontSize: 11, fillColor: grandBalance === 0 ? [180, 255, 180] : [255, 180, 180] } }
//   ]);

//   // Ultra Compact Table
//   (doc).autoTable({
//     head: [[
//       "No.", "Paid By", "Type", "Amount", "Date", "Description",
//       "Total", "Paid", "Balance"
//     ]],
//     body,
//     startY: 35,
//     theme: "grid",
//     styles: {
//       fontSize: 8.5,
//       cellPadding: 2.5,
//       lineColor: [180, 180, 180],
//       lineWidth: 0.1,
//       overflow: "linebreak",
//     },
//     headStyles: {
//       fillColor: [30, 100, 180],
//       textColor: 255,
//       fontStyle: "bold",
//       fontSize: 9,
//       halign: "center"
//     },
//     columnStyles: {
//       0: { cellWidth: 12, halign: "center" },
//       1: { cellWidth: 32, halign: "left" },
//       2: { cellWidth: 22, halign: "center" },
//       3: { cellWidth: 24, halign: "right" },
//       4: { cellWidth: 26, halign: "center" },
//       5: { cellWidth: 78, halign: "left" },   // Description takes max space
//       6: { cellWidth: 28, halign: "right" },
//       7: { cellWidth: 28, halign: "right" },
//       8: { cellWidth: 28, halign: "right" },
//     },
//     margin: { top: 35, left: 8, right: 8, bottom: 10 },
//     pageBreak: "auto",
//     rowPageBreak: "avoid",
//   });

//   // Save with clean name
//   doc.save(`All_Logs_${searchQuery.replace(/[^a-zA-Z0-9]/g, "_")}_${Date.now()}.pdf`);
// };
//   /* ------------------------------------------------------------------ */
//   /* ALL LOGS EXCEL - GROUPED + SUMMARY */
//   /* ------------------------------------------------------------------ */
//  const exportAllLogsToExcel = () => {
//   const rows = [];
//   let grandTotal = 0, grandPaid = 0, grandBalance = 0;

//   payments.forEach((p) => {
//     const vendor = p.purchase?.vendor?.name || "Unknown";
//     const material = p.purchase?.material_name || "-";
//     const total = parseFloat(p.amount);
//     const paid = parseFloat(p.paid_amount);
//     const balance = parseFloat(p.balance_amount);

//     grandTotal += total;
//     grandPaid += paid;
//     grandBalance += balance;

//     // Vendor Summary Row
//     rows.push({
//       "Vendor → Material": `${vendor} → ${material}`,
//       "#": "",
//       "Paid By": "",
//       "Type": "",
//       "Amount": "",
//       "Payment Date": "",
//       "Description": "",
//       "Total": total.toFixed(2),
//       "Paid": paid.toFixed(2),
//       "Balance": balance.toFixed(2),
//     });

//     // Payment Logs
//     if (p.logs && p.logs.length > 0) {
//       p.logs.forEach((log, i) => {
//         rows.push({
//           "Vendor → Material": "",
//           "#": i + 1,
//           "Paid By": log.paid_by,
//           "Type": log.payment_type,
//           "Amount": parseFloat(log.amount).toFixed(2),
//           "Payment Date": new Date(log.payment_date).toLocaleDateString("en-GB"),
//           "Description": log.description || "-",
//           "Total": "",
//           "Paid": "",
//           "Balance": "",
//         });
//       });
//     } else {
//       rows.push({
//         "Vendor → Material": "",
//         "#": "",
//         "Paid By": "No payments recorded yet",
//         "Type": "",
//         "Amount": "",
//         "Payment Date": "",
//         "Description": "",
//         "Total": "",
//         "Paid": "",
//         "Balance": "",
//       });
//     }

//     // Empty row spacer
//     rows.push({
//       "Vendor → Material": "",
//       "#": "",
//       "Paid By": "",
//       "Type": "",
//       "Amount": "",
//       "Payment Date": "",
//       "Description": "",
//       "Total": "",
//       "Paid": "",
//       "Balance": "",
//     });
//   });

//   // Grand Total Row
//   rows.push({
//     "Vendor → Material": "GRAND TOTAL",
//     "#": "",
//     "Paid By": "",
//     "Type": "",
//     "Amount": "",
//     "Payment Date": "",
//     "Description": "",
//     "Total": grandTotal.toFixed(2),
//     "Paid": grandPaid.toFixed(2),
//     "Balance": grandBalance.toFixed(2),
//   });

//   const wb = XLSX.utils.book_new();
//   const ws = XLSX.utils.aoa_to_sheet([]);

//   // Add header information
//   const timestamp = new Date().toLocaleString("en-GB", {
//     day: "2-digit", month: "2-digit", year: "numeric",
//     hour: "2-digit", minute: "2-digit", second: "2-digit"
//   });

//   XLSX.utils.sheet_add_aoa(ws, [
//     ["All Vendor Payment Logs (Detailed)"],
//     [`Project: ${searchQuery}`],
//     [`Generated on: ${timestamp}`],
//     [], // Empty row for spacing
//   ], { origin: "A1" });

//   // Add data starting from row 5
//   XLSX.utils.sheet_add_json(ws, rows, {
//     origin: "A5",
//     skipHeader: false
//   });

//   // Apply styling
//   const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
  
//   // Style vendor summary rows
//   for (let R = 4; R <= range.e.r; ++R) {
//     const cellA = ws[XLSX.utils.encode_cell({ r: R, c: 0 })];
//     if (cellA && cellA.v && String(cellA.v).includes("→")) {
//       // Style entire summary row
//       for (let C = 0; C <= 9; ++C) {
//         const cell = ws[XLSX.utils.encode_cell({ r: R, c: C })];
//         if (cell) {
//           cell.s = {
//             font: { bold: true },
//             fill: { fgColor: { rgb: "E6F0FF" } },
//             alignment: { horizontal: C >= 7 ? "right" : "left" }
//           };
//         }
//       }
//     }
    
//     // Style GRAND TOTAL row
//     if (cellA && cellA.v === "GRAND TOTAL") {
//       for (let C = 0; C <= 9; ++C) {
//         const cell = ws[XLSX.utils.encode_cell({ r: R, c: C })];
//         if (cell) {
//           cell.s = {
//             font: { bold: true, sz: 11 },
//             fill: { fgColor: { rgb: "C8E6C9" } },
//             alignment: { horizontal: C >= 7 ? "right" : "left" }
//           };
//         }
//       }
//     }
//   }

//   // Style header rows
//   ["A1", "A2", "A3"].forEach((cell, index) => {
//     if (ws[cell]) {
//       ws[cell].s = {
//         font: { bold: index === 0, sz: index === 0 ? 14 : 12 },
//         alignment: { horizontal: "left" }
//       };
//     }
//   });

//   // Column widths
//   ws["!cols"] = [
//     { wch: 40 }, // Vendor → Material
//     { wch: 8 },  // #
//     { wch: 25 }, // Paid By
//     { wch: 15 }, // Type
//     { wch: 15 }, // Amount
//     { wch: 18 }, // Payment Date
//     { wch: 35 }, // Description
//     { wch: 15 }, // Total
//     { wch: 15 }, // Paid
//     { wch: 15 }  // Balance
//   ];

//   // Merge header cells
//   ws["!merges"] = [
//     { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } },
//     { s: { r: 1, c: 0 }, e: { r: 1, c: 9 } },
//     { s: { r: 2, c: 0 }, e: { r: 2, c: 9 } },
//   ];

//   XLSX.utils.book_append_sheet(wb, ws, "All Payment Logs");
//   XLSX.writeFile(wb, `all-payment-logs-${searchQuery.replace(/\s+/g, "-")}-${Date.now()}.xlsx`);
// };



// const downloadPDF = () => {
//   const doc = new jsPDF("landscape");

//   // HEADER
//   doc.setFontSize(18);
//   doc.text("Vendor Payment Report", 14, 15);

//   doc.setFontSize(12);
//   doc.text(`Project: ${logsData.vendor_details.project.project_name}`, 14, 25);

//   const currentDate = new Date().toLocaleString();
//   doc.text(`Generated: ${currentDate}`, 14, 32);

//   // TOP DETAILS (One Row)
//   const vendorInfo = [
//     [
//       `Vendor Name: ${logsData.vendor_details.vendor_name}`,
//       `Material Name: ${logsData.vendor_details.material_name}`,
//       `Total: ${logsData.payment_master.total_amount}`,
//       `Paid: ${logsData.payment_master.paid_amount}`,
//       `Balance: ${logsData.payment_master.balance_amount}`,
//     ],
//   ];

//   doc.autoTable({
//     startY: 40,
//     body: vendorInfo,
//     theme: "plain",
//     styles: { fontSize: 12, cellPadding: 3 },
//     columnStyles: {
//       0: { cellWidth: 70 },
//       1: { cellWidth: 70 },
//       2: { cellWidth: 35 },
//       3: { cellWidth: 35 },
//       4: {
//         cellWidth: 35,
//         fillColor:
//           parseFloat(logsData.payment_master.balance_amount) === 0
//             ? [200, 255, 200]
//             : [255, 230, 150],
//       },
//     },
//   });

//   // TABLE DATA
//   const tableData = logsData.payment_logs.map((log, index) => [
//     index + 1,
//     log.paid_by,
//     log.payment_type,
//     Number(log.amount).toFixed(2),
//     new Date(log.payment_date).toLocaleDateString(),
//     log.description || "-",
//   ]);

//   // TABLE HEADERS + DESIGN
//   doc.autoTable({
//     head: [
//       [
//         "No.",
//         "Paid By",
//         "Type",
//         "Amount",
//         "Date",
//         "Description",
//       ],
//     ],
//     body: tableData,
//     startY: doc.lastAutoTable.finalY + 5,
//     headStyles: {
//       fillColor: [0, 72, 144], // Blue like screenshot
//       textColor: "#fff",
//       fontSize: 12,
//       halign: "center",
//     },
//     bodyStyles: { fontSize: 11 },
//     alternateRowStyles: { fillColor: [240, 248, 255] },
//     styles: { cellPadding: 4 },
//   });

//   doc.save("Vendor-Payment-Logs.pdf");
// };




// const downloadExcel = () => {
//   const vendor = logsData.vendor_details;
//   const master = logsData.payment_master;

//   const project = vendor.project || {};

//   const excelData = [];

//   // MAIN TITLE
//   excelData.push(["Vendor Payment Report"]);
//   excelData.push([]);

//   // PROJECT + GENERATED DATE
//   excelData.push(["Project:", project.project_name || "-"]);
//   excelData.push(["Generated:", new Date().toLocaleString()]);
//   excelData.push([]);

//   // TOP INFO ROW (same as PDF)
//   excelData.push([
//     `Vendor Name: ${vendor.vendor_name}`,
//     `Material Name: ${vendor.material_name}`,
//     `Total: ${master.total_amount}`,
//     `Paid: ${master.paid_amount}`,
//     `Balance: ${master.balance_amount}`,
//   ]);

//   excelData.push([]);

//   // TABLE HEADERS
//   excelData.push([
//     "No.",
//     "Paid By",
//     "Type",
//     "Amount",
//     "Date",
//     "Description",
//   ]);

//   // TABLE ROWS
//   logsData.payment_logs.forEach((log, i) => {
//     excelData.push([
//       i + 1,
//       log.paid_by,
//       log.payment_type,
//       Number(log.amount).toFixed(2),
//       new Date(log.payment_date).toLocaleDateString(),
//       log.description || "-",
//     ]);
//   });

//   // CREATE EXCEL WORKBOOK
//   const worksheet = XLSX.utils.aoa_to_sheet(excelData);
//   const workbook = XLSX.utils.book_new();
//   XLSX.utils.book_append_sheet(workbook, worksheet, "Vendor Logs");

//   // AUTO COLUMN WIDTH (clean output)
//   worksheet["!cols"] = [
//     { wch: 5 },   // No.
//     { wch: 20 },  // Paid By
//     { wch: 15 },  // Type
//     { wch: 12 },  // Amount
//     { wch: 15 },  // Date
//     { wch: 40 },  // Description
//   ];

//   XLSX.writeFile(workbook, "Vendor-Payment-Logs.xlsx");
// };














//   /* ------------------------------------------------------------------ */
//   /* MODAL HANDLERS */
//   /* ------------------------------------------------------------------ */
//   const openAddModal = () => {
//     setIsEdit(false);
//     setEditingId(null);
//     setForm({
//       vendor_id: "",
//       material_name: "",
//       about: "",
//       qty: 1,
//       price: 0,
//       total: 0,
//       date: new Date().toISOString().split("T")[0],
//       project_id: selectedProjectId,
//       payment_id: null,
//     });
//     setModalError("");
//     setShowModal(true);
//   };

//   const openEditModal = (row) => {
//     setIsEdit(true);
//     setEditingId(row.id);

//     const purchase = row.purchase || {};

//     setForm({
//       vendor_id: purchase.vendor_id || "",
//       material_name: purchase.material_name || "",
//       about: purchase.about || "",
//       qty: parseFloat(purchase.qty) || 1,
//       price: parseFloat(purchase.price_per_unit) || 0,
//       total: parseFloat(purchase.total) || 0,
//       date: purchase.date || new Date().toISOString().split("T")[0],
//       project_id: selectedProjectId,
//       payment_id: row.id,
//     });

//     setModalError("");
//     setShowModal(true);
//   };

//   const closeModal = () => {
//     setShowModal(false);
//     setModalError("");
//   };

//   const handleFormChange = (e) => {
//     const { name, value } = e.target;
//     setForm((prev) => {
//       const updated = { ...prev, [name]: value };

//       if (name === "qty" || name === "price") {
//         const qty = name === "qty" ? parseFloat(value) : parseFloat(prev.qty) || 0;
//         const price = name === "price" ? parseFloat(value) : parseFloat(prev.price) || 0;
//         updated.total = (qty * price).toFixed(2);
//       }

//       return updated;
//     });
//   };

//   const validate = () => {
//     if (!selectedProjectId) return "Select a project first";
//     if (!form.vendor_id) return "Vendor is required";
//     if (!form.material_name.trim()) return "Material name is required";
//     if (!form.qty || form.qty <= 0) return "Qty must be > 0";
//     if (!form.price || form.price <= 0) return "Price must be > 0";
//     if (!form.date) return "Date is required";
//     return "";
//   };

//   const submitForm = async () => {
//     const err = validate();
//     if (err) {
//       setModalError(err);
//       return;
//     }

//     const payload = {
//       project_id: parseInt(form.project_id),
//       vendor_id: parseInt(form.vendor_id),
//       material_name: form.material_name,
//       about: form.about || null,
//       price_per_unit: parseFloat(form.price),
//       qty: parseFloat(form.qty),
//       total: parseFloat(form.total),
//       date: form.date,
//       paid_amount: isEdit ? undefined : 0,
//     };

//     try {
//       let res;
//       if (isEdit) {
//         const editPayload = {
//           payment_id: form.payment_id,
//           vendor_id: parseInt(form.vendor_id),
//           project_id: parseInt(form.project_id),
//           material_name: form.material_name,
//           about: form.about || null,
//           price_per_unit: parseFloat(form.price),
//           qty: parseFloat(form.qty),
//           date: form.date,
//         };
//         res = await put("/api/updatePurchesVendorPayment", editPayload);
//       } else {
//         res = await post("/api/purchesVendor", payload);
//       }

//       showToast("success", res.message || `${isEdit ? "Updated" : "Added"} successfully!`);
//       closeModal();
//       fetchPayments();
//     } catch (e) {
//       const msg = e.response?.data?.message || "Operation failed";
//       setModalError(msg);
//     }
//   };

//   const deleteRow = async (id) => {
//     if (!window.confirm("Delete this payment record?")) return;
//     try {
//       await deleteAPICall(`/api/purchases/${id}`);
//       showToast("success", "Payment deleted");
//       fetchPayments();
//     } catch {
//       showToast("danger", "Delete failed");
//     }
//   };

//   /* ------------------------------------------------------------------ */
//   /* PAY MODAL HANDLERS */
//   /* ------------------------------------------------------------------ */
//   const openPayModal = (payment) => {
//     setSelectedVendorPayment(payment);
//     setPayForm({
//       purches_vendor_id: payment.purches_vendor_id,
//       paid_by: "Admin",
//       payment_type: "Cash",
//       amount: "",
//       payment_date: new Date().toISOString().split("T")[0],
//       description: "",
//     });
//     setPayError("");
//     setShowPayModal(true);
//   };

//   const closePayModal = () => {
//     setShowPayModal(false);
//     setSelectedVendorPayment(null);
//     resetPayForm();
//   };

//   const resetPayForm = () => {
//     setPayForm({
//       purches_vendor_id: "",
//       paid_by: "Admin",
//       payment_type: "Cash",
//       amount: "",
//       payment_date: new Date().toISOString().split("T")[0],
//       description: "",
//     });
//     setPayError("");
//   };

//   const handlePayChange = (e) => {
//     const { name, value } = e.target;
//     setPayForm((prev) => ({ ...prev, [name]: value }));
//   };

//   /* ------------------------------------------------------------------ */
//   /* LOGS MODAL */
//   /* ------------------------------------------------------------------ */
//   const openLogsModal = async (vendorId) => {
//     setShowLogsModal(true);
//     await fetchPaymentLogs(vendorId);
//   };

//   const closeLogsModal = () => {
//     setShowLogsModal(false);
//     setLogsData(null);
//   };

//   /* ------------------------------------------------------------------ */
//   /* EFFECTS */
//   /* ------------------------------------------------------------------ */
//   useEffect(() => {
//     fetchVendors();
//   }, []);

//   /* ------------------------------------------------------------------ */
//   /* RENDER */
//   /* ------------------------------------------------------------------ */
//   return (
//     <>
//       <CCard className="mb-4">
//         <CCardHeader className="bg-primary text-white d-flex justify-content-between align-items-center">
//           <h5 className="mb-0">Purchase Vendor Payments</h5>
//           <div>
//             {selectedProjectId && payments.length > 0 && (
//               <>
//                 <CButton color="light" size="sm" className="me-2" onClick={exportToPDF}>
//                   <CIcon icon={cilFile} className="me-1" />
//                   PDF
//                 </CButton>
//                 <CButton color="light" size="sm" onClick={exportToExcel}>
//                   <CIcon icon={cilSpreadsheet} className="me-1" />
//                   Excel
//                 </CButton>
//               </>
//             )}

// &nbsp;&nbsp;



// {selectedProjectId && payments.some(p => p.logs && p.logs.length > 0) && (
//               <>
//                 <CButton color="light" size="sm" className="me-2" onClick={exportAllLogsToPDF}>
//                   <CIcon icon={cilFile} className="me-1" />
//                   All Logs PDF
//                 </CButton>
//                 <CButton color="light" size="sm" onClick={exportAllLogsToExcel}>
//                   <CIcon icon={cilSpreadsheet} className="me-1" />
//                   All Logs Excel
//                 </CButton>
//               </>
//             )}






//           </div>
//         </CCardHeader>
//         <CCardBody>
//           {/* Project Selector */}
//           <CRow className="mb-4">
//             <CCol md={12}>
//               <div className="position-relative" ref={dropdownRef}>
//                 <CInputGroup>
//                   <CFormInput
//                     ref={inputRef}
//                     type="text"
//                     placeholder="Search project..."
//                     value={searchQuery}
//                     onChange={(e) => {
//                       setSearchQuery(e.target.value);
//                       if (selectedProjectId && e.target.value !== searchQuery)
//                         setSelectedProjectId("");
//                     }}
//                     onFocus={() => projects.length && setShowDropdown(true)}
//                     autoComplete="off"
//                   />
//                   {!selectedProjectId ? (
//                     <CButton
//                       color="primary"
//                       variant="outline"
//                       onClick={() => setShowProjectModal(true)}
//                       style={{ position: "absolute", right: 0, top: 0, bottom: 0, zIndex: 5, borderRadius: 0 }}
//                     >
//                       <CIcon icon={cilSearch} />
//                     </CButton>
//                   ) : (
//                     <CButton
//                       color="danger"
//                       variant="outline"
//                       onClick={() => {
//                         setSearchQuery("");
//                         setSelectedProjectId("");
//                         setPayments([]);
//                       }}
//                       style={{ position: "absolute", right: 0, top: 0, bottom: 0, zIndex: 5, borderRadius: 0 }}
//                     >
//                       <CIcon icon={cilX} />
//                     </CButton>
//                   )}
//                 </CInputGroup>
//                 {showDropdown && projects.length > 0 && (
//                   <div
//                     className="dropdown-menu show w-100"
//                     style={{ maxHeight: "200px", overflowY: "auto", position: "absolute", zIndex: 1000, marginTop: "2px" }}
//                   >
//                     {projects.map((p) => (
//                       <div
//                         key={p.id}
//                         className="dropdown-item"
//                         style={{ cursor: "pointer" }}
//                         onClick={() => selectProject(p)}
//                       >
//                         {p.project_name}
//                       </div>
//                     ))}
//                   </div>
//                 )}
//                 {selectedProjectId && (
//                   <div className="text-success mt-1 small">Selected: {searchQuery}</div>
//                 )}
//               </div>
//             </CCol>
//           </CRow>

//           {/* Table */}
//           {loading ? (
//             <div className="text-center py-4"><CSpinner /></div>
//           ) : payments.length > 0 ? (
//             <div className="table-responsive">
//               <CTable striped hover>
//                 <CTableHead color="light">
//                   <CTableRow>
//                     <CTableHeaderCell>Vendor Name</CTableHeaderCell>
//                     <CTableHeaderCell>Total</CTableHeaderCell>
//                     <CTableHeaderCell>Paid</CTableHeaderCell>
//                     <CTableHeaderCell>Balance</CTableHeaderCell>
//                     <CTableHeaderCell>Status</CTableHeaderCell>
//                     <CTableHeaderCell>Created</CTableHeaderCell>
//                     <CTableHeaderCell>Actions</CTableHeaderCell>
//                   </CTableRow>
//                 </CTableHead>
//                 <CTableBody>
//                   {payments.map((p) => {
//                     const paidPercentage = (parseFloat(p.paid_amount) / parseFloat(p.amount)) * 100;
//                     const statusColor = paidPercentage === 0 ? "danger" : paidPercentage === 100 ? "success" : "warning";
//                     const statusText = paidPercentage === 0 ? "Unpaid" : paidPercentage === 100 ? "Paid" : "Partial";
//                     const canPay = parseFloat(p.balance_amount) > 0;

//                     return (
//                       <CTableRow key={p.id}>
//                         <CTableDataCell>{p?.purchase?.vendor?.name}</CTableDataCell>
//                         <CTableDataCell>₹{parseFloat(p.amount).toFixed(2)}</CTableDataCell>
//                         <CTableDataCell>₹{parseFloat(p.paid_amount).toFixed(2)}</CTableDataCell>
//                         <CTableDataCell>₹{parseFloat(p.balance_amount).toFixed(2)}</CTableDataCell>
//                         <CTableDataCell><CBadge color={statusColor}>{statusText}</CBadge></CTableDataCell>
//                         <CTableDataCell>{new Date(p.created_at).toLocaleDateString()}</CTableDataCell>
//                         <CTableDataCell>
//                           <CButton
//                             color="info"
//                             size="sm"
//                             className="me-1"
//                             onClick={() => openLogsModal(p.purches_vendor_id)}
//                             disabled={!p.logs || p.logs.length === 0}
//                           >
//                             <CIcon icon={cilList} /> Logs ({p.logs?.length || 0})
//                           </CButton>
//                           <CButton
//                             color="success"
//                             size="sm"
//                             className="me-1"
//                             onClick={() => openPayModal(p)}
//                             disabled={!canPay}
//                             title={canPay ? "Make Payment" : "Fully Paid"}
//                           >
//                             <CIcon icon={cilDollar} /> Pay
//                           </CButton>
//                           <CButton color="warning" size="sm" className="me-1" onClick={() => openEditModal(p)}>
//                             <CIcon icon={cilPencil} />
//                           </CButton>
//                         </CTableDataCell>
//                       </CTableRow>
//                     );
//                   })}
//                 </CTableBody>
//               </CTable>
//             </div>
//           ) : selectedProjectId ? (
//             <div className="text-center py-5">
//               <h5 className="text-muted">No payments yet</h5>
//               <CButton color="primary" onClick={openAddModal}>
//                 <CIcon icon={cilPlus} className="me-1" />
//                 Add First Material
//               </CButton>
//             </div>
//           ) : (
//             <div className="text-center py-5">
//               <h5 className="text-muted">Select a project to view payments</h5>
//             </div>
//           )}
//           {selectedProjectId && !loading && (
//             <div className="mt-3">
//               <CButton color="success" onClick={openAddModal}>
//                 <CIcon icon={cilPlus} className="me-1" />
//                 Add Material
//               </CButton>
//             </div>
//           )}
//         </CCardBody>
//       </CCard>

//       {/* PAYMENT MODAL */}
//       <CModal visible={showPayModal} onClose={closePayModal} backdrop="static">
//         <CModalHeader onClose={closePayModal}>
//           <CModalTitle>Make Payment</CModalTitle>
//         </CModalHeader>
//         <CModalBody>
//           <CForm>
//             <CRow className="g-3">
//               <CCol md={6}>
//                 <CFormLabel>Vendor Name</CFormLabel>
//                 <div
//                   className="form-control"
//                   style={{
//                     backgroundColor: "#f0f4f7",
//                     fontWeight: "500",
//                     minHeight: "38px",
//                     display: "flex",
//                     alignItems: "center",
//                     padding: "0.375rem 0.75rem",
//                     border: "1px solid #ced4da",
//                     borderRadius: "0.375rem",
//                   }}
//                 >
//                   {selectedVendorPayment?.purchase?.vendor?.name || "—"}
//                 </div>
//               </CCol>
//               <CCol md={6}>
//                 <CFormLabel>Remaining Balance</CFormLabel>
//                 <div
//                   className="form-control"
//                   style={{
//                     backgroundColor: "#f8f9fa",
//                     fontWeight: "600",
//                     color: "#d63384",
//                     minHeight: "38px",
//                     display: "flex",
//                     alignItems: "center",
//                     padding: "0.375rem 0.75rem",
//                     border: "1px solid #ced4da",
//                     borderRadius: "0.375rem",
//                   }}
//                 >
//                   ₹{parseFloat(selectedVendorPayment?.balance_amount || 0).toFixed(2)}
//                 </div>
//               </CCol>
//             </CRow>

//             <CRow className="g-3 mt-2">
//               <CCol md={6}>
//                 <CFormLabel>Paid By *</CFormLabel>
//                 <CFormInput
//                   name="paid_by"
//                   value={payForm.paid_by}
//                   onChange={handlePayChange}
//                   placeholder="e.g. Admin 12345"
//                 />
//               </CCol>
//               <CCol md={6}>
//                 <CFormLabel>Payment Type</CFormLabel>
//                 <CFormSelect
//                   name="payment_type"
//                   value={payForm.payment_type}
//                   onChange={handlePayChange}
//                 >
//                   <option value="Cash">Cash</option>
//                   <option value="Online">Online</option>
//                   <option value="Cheque">Cheque</option>
//                 </CFormSelect>
//               </CCol>
//             </CRow>

//             <CRow className="g-3 mt-2">
//               <CCol md={6}>
//                 <CFormLabel>Amount *</CFormLabel>
//                 <CFormInput
//                   type="number"
//                   name="amount"
//                   value={payForm.amount}
//                   onChange={handlePayChange}
//                   min="0.01"
//                   step="0.01"
//                   placeholder="0.00"
//                 />
//               </CCol>
//               <CCol md={6}>
//                 <CFormLabel>Payment Date *</CFormLabel>
//                 <CFormInput
//                   type="date"
//                   name="payment_date"
//                   value={payForm.payment_date}
//                   onChange={handlePayChange}
//                   max={new Date().toISOString().split("T")[0]}
//                 />
//               </CCol>
//             </CRow>

//             <CRow className="g-3 mt-2">
//               <CCol md={12}>
//                 <CFormLabel>Description (optional)</CFormLabel>
//                 <CFormInput
//                   type="text"
//                   name="description"
//                   value={payForm.description}
//                   onChange={handlePayChange}
//                   placeholder="e.g. Payment for Stones delivery"
//                 />
//               </CCol>
//             </CRow>

//             {payError && <CAlert color="danger" className="mt-3">{payError}</CAlert>}
//           </CForm>
//         </CModalBody>
//         <CModalFooter>
//           <CButton color="secondary" onClick={closePayModal}>Cancel</CButton>
//           <CButton color="primary" onClick={addVendorPayment} disabled={payLoading}>
//             {payLoading ? <CSpinner size="sm" /> : "Submit Payment"}
//           </CButton>
//         </CModalFooter>
//       </CModal>

//       {/* ADD/EDIT MODAL */}
//       <CModal visible={showModal} onClose={closeModal} backdrop="static" size="lg">
//         <CModalHeader onClose={closeModal}>
//           <CModalTitle>{isEdit ? "Edit" : "Add"} Material</CModalTitle>
//         </CModalHeader>
//         <CModalBody>
//           <CForm>
//             <CRow className="g-3">
//               <CCol md={6}>
//                 <CFormLabel>Vendor *</CFormLabel>
//                 <select className="form-select" name="vendor_id" value={form.vendor_id} onChange={handleFormChange} required>
//                   <option value="">Select Vendor</option>
//                   {vendors.map((v) => (
//                     <option key={v.id} value={v.id}>{v.name}</option>
//                   ))}
//                 </select>
//               </CCol>
//               <CCol md={6}>
//                 <CFormLabel>Material Name *</CFormLabel>
//                 <CFormInput type="text" name="material_name" value={form.material_name} onChange={handleFormChange} required />
//               </CCol>
//             </CRow>

//             <CRow className="g-3 mt-2">
//               <CCol md={12}>
//                 <CFormLabel>About (optional)</CFormLabel>
//                 <CFormInput type="text" name="about" value={form.about} onChange={handleFormChange} />
//               </CCol>
//             </CRow>

//             <CRow className="g-3 mt-2 align-items-end">
//               <CCol md={3}>
//                 <CFormLabel>Qty *</CFormLabel>
//                 <CFormInput type="number" name="qty" min="0.01" step="0.01" value={form.qty} onChange={handleFormChange} required />
//               </CCol>
//               <CCol md={3}>
//                 <CFormLabel>Price/Unit *</CFormLabel>
//                 <CFormInput type="number" name="price" min="0" step="0.01" value={form.price} onChange={handleFormChange} required />
//               </CCol>
//               <CCol md={3}>
//                 <CFormLabel>Total</CFormLabel>
//                 <CFormInput type="number" value={form.total} readOnly />
//               </CCol>
//               <CCol md={3}>
//                 <CFormLabel>Date *</CFormLabel>
//                 <CFormInput type="date" name="date" value={form.date} onChange={handleFormChange} max={new Date().toISOString().split("T")[0]} required />
//               </CCol>
//             </CRow>

//             {modalError && <CAlert color="danger" className="mt-3">{modalError}</CAlert>}
//           </CForm>
//         </CModalBody>
//         <CModalFooter>
//           <CButton color="secondary" onClick={closeModal}>Cancel</CButton>
//           <CButton color="primary" onClick={submitForm}>
//             {isEdit ? "Update" : "Save"}
//           </CButton>
//         </CModalFooter>
//       </CModal>

//       {/* LOGS MODAL */}
//       <CModal visible={showLogsModal} onClose={closeLogsModal} backdrop="static" size="xl">
//         <CModalHeader onClose={closeLogsModal}><CModalTitle>Payment Logs</CModalTitle></CModalHeader>
//         <CModalBody>
//           {logsLoading ? (
//             <div className="text-center py-4"><CSpinner /><p>Loading logs...</p></div>
//           ) : logsData ? (
//             <>

//               {/* Action Buttons */}
//         <div className="d-flex justify-content-end gap-2 mb-3">
//           <CButton color="primary" onClick={downloadPDF}>
//             Download PDF
//           </CButton>

//           <CButton color="success" onClick={downloadExcel}>
//             Download Excel
//           </CButton>
//         </div>



//               <CCard className="mb-3">
//                 <CCardHeader className="bg-light"><h6 className="mb-0">Payment Summary</h6></CCardHeader>
//                 <CCardBody>
//                   <CRow>
//                     <CCol md={4}><strong>Vendor:</strong> {logsData.vendor_details?.vendor_name}</CCol>
//                     <CCol md={4}><strong>Total:</strong> ₹{parseFloat(logsData.payment_master?.total_amount || 0).toFixed(2)}</CCol>
//                     <CCol md={4}><strong>Paid:</strong> ₹{parseFloat(logsData.payment_master?.paid_amount || 0).toFixed(2)}</CCol>
//                   </CRow>
//                   <CRow className="mt-2">
//                     <CCol md={4}><strong>Balance:</strong> ₹{parseFloat(logsData.payment_master?.balance_amount || 0).toFixed(2)}</CCol>
//                     <CCol md={8}>
//                       <CBadge color={parseFloat(logsData.payment_master?.balance_amount || 0) === 0 ? 'success' : 'warning'}>
//                         {parseFloat(logsData.payment_master?.balance_amount || 0) === 0 ? 'Fully Paid' : 'Pending'}
//                       </CBadge>
//                     </CCol>
//                   </CRow>
//                 </CCardBody>
//               </CCard>
//               <h6>Payment History</h6>
//               {logsData.payment_logs?.length > 0 ? (
//                 <CTable striped bordered>
//                   <CTableHead color="dark">
//                     <CTableRow>
//                       <CTableHeaderCell>#</CTableHeaderCell>
//                       <CTableHeaderCell>Paid By</CTableHeaderCell>
//                       <CTableHeaderCell>Type</CTableHeaderCell>
//                       <CTableHeaderCell>Amount</CTableHeaderCell>
//                       <CTableHeaderCell>Date</CTableHeaderCell>
//                       <CTableHeaderCell>Description</CTableHeaderCell>
//                       <CTableHeaderCell>Created</CTableHeaderCell>
//                     </CTableRow>
//                   </CTableHead>
//                   <CTableBody>
//                     {logsData.payment_logs.map((log, i) => (
//                       <CTableRow key={log.id}>
//                         <CTableDataCell>{i + 1}</CTableDataCell>
//                         <CTableDataCell>{log.paid_by}</CTableDataCell>
//                         <CTableDataCell><CBadge color={log.payment_type === 'Cash' ? 'success' : 'primary'}>{log.payment_type}</CBadge></CTableDataCell>
//                         <CTableDataCell><strong>₹{parseFloat(log.amount).toFixed(2)}</strong></CTableDataCell>
//                         <CTableDataCell>{new Date(log.payment_date).toLocaleDateString()}</CTableDataCell>
//                         <CTableDataCell>{log.description || "—"}</CTableDataCell>
//                         <CTableDataCell>{new Date(log.created_at).toLocaleString()}</CTableDataCell>
//                       </CTableRow>
//                     ))}
//                   </CTableBody>
//                 </CTable>
//               ) : (
//                 <p className="text-center text-muted">No logs available</p>
//               )}
//             </>
//           ) : (
//             <p className="text-center text-muted">No data</p>
//           )}
//         </CModalBody>
//         <CModalFooter>
//           <CButton color="secondary" onClick={closeLogsModal}>Close</CButton>
//         </CModalFooter>
//       </CModal>

//       <ProjectSelectionModal
//         visible={showProjectModal}
//         onClose={() => setShowProjectModal(false)}
//         onSelectProject={selectProject}
//       />
//     </>
//   );
// };

// export default PurchesVendorPayment;



















