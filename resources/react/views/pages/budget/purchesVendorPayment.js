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
import { getUserType } from "../../../util/session";
import ConfirmationModal from "../../common/ConfirmationModal";
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

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);

  const { showToast } = useToast();
  const usertype = getUserType();

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

    if (!payForm.paid_by.trim()) 
      return setPayError("Paid by is required");

    if (!payForm.payment_type.trim()) 
      return setPayError("Payment type is required");

    if (!payForm.amount || payForm.amount <= 0) 
      return setPayError("Amount must be > 0");

    if (!payForm.payment_date) 
      return setPayError("Payment date is required");

    if (Number(payForm.amount) > Number(selectedVendorPayment?.balance_amount)) {
      return setPayError(`Amount cannot be more than pending balance ₹${selectedVendorPayment?.balance_amount}`);
    }

    const isBankTransfer = ["imps", "neft", "rtgs"].includes(payForm.payment_type.toLowerCase());
    const isUPI = payForm.payment_type.toLowerCase() === "upi";

    if (isBankTransfer) {
      if (!payForm.bank_name?.trim()) return setPayError("Bank name is required");
      if (!payForm.acc_number?.trim()) return setPayError("Account number is required");
      if (!payForm.ifsc?.trim()) return setPayError("IFSC code is required");
      if (!payForm.transaction_id?.trim()) return setPayError("Transaction ID is required");
    }

    if (isUPI) {
      if (!payForm.transaction_id?.trim()) return setPayError("UPI Transaction ID is required");
    }

    if (activeTab === "upload" && !payForm.payment_file) {
      return setPayError("Payment : Photo/file is required");
    }

    if (activeTab === "remark" && !payForm.remark?.trim()) {
      return setPayError("Payment : Remark is required");
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
  /* PROJECT SEARCH - ✅ FIXED VERSION */
  /* ------------------------------------------------------------------ */
  const fetchProjects = useCallback(async (q) => {
    if (!q.trim()) {
      setProjects([]);
      setShowDropdown(false);
      return;
    }
    try {
      const res = await getAPICall(`/api/projects?searchQuery=${q}`);
      setProjects(res || []);
      // ✅ Show dropdown immediately when results arrive
      if (res && res.length > 0) {
        setShowDropdown(true);
      } else {
        setShowDropdown(false);
      }
    } catch {
      setProjects([]);
      setShowDropdown(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      // ✅ Only fetch if we DON'T have a selected project already
      if (searchQuery.length > 2 && !selectedProjectId) {
        fetchProjects(searchQuery);
      } else if (searchQuery.length <= 2) {
        setProjects([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, fetchProjects, selectedProjectId]);

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

  // ✅ NEW: Handle search input change
  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Clear selection if user modifies the search
    if (selectedProjectId && value !== searchQuery) {
      setSelectedProjectId("");
    }
    
    // Show dropdown if there are results and query is long enough
    if (projects.length > 0 && value.length > 2) {
      setShowDropdown(true);
    }
  };

  // ✅ NEW: Handle input focus
  const handleSearchInputFocus = () => {
    // Show dropdown if there are already projects loaded
    if (projects.length > 0 && searchQuery.length > 2) {
      setShowDropdown(true);
    }
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

  const handleDelete = async () => {
    if (!deleteItemId) return;
    try {
      const res = await deleteAPICall(`/api/purchesVendorById/${deleteItemId}`);
      showToast('success', res.message || 'Deleted successfully');
      setDeleteModalVisible(false);
      fetchPayments();
    } catch (e) {
      showToast('danger', 'Failed to delete');
    }
  };

  const openDeleteModal = (id) => {
    setDeleteItemId(id);
    setDeleteModalVisible(true);
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
                    onChange={handleSearchInputChange}
                    onFocus={handleSearchInputFocus}
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
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f0f0f0"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "white"}
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
                    <CTableHeaderCell>Material</CTableHeaderCell>
                    <CTableHeaderCell>Qty</CTableHeaderCell>
                    <CTableHeaderCell>Price/Unit</CTableHeaderCell>
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
                        <CTableDataCell>{p?.purchase?.vendor?.name || "-"}</CTableDataCell>
                        <CTableDataCell>{p?.purchase?.material_name || "-"}</CTableDataCell>
                        <CTableDataCell>{parseFloat(p?.purchase?.qty || 0).toFixed(2)}</CTableDataCell>
                        <CTableDataCell>₹{parseFloat(p?.purchase?.price_per_unit || 0).toFixed(2)}</CTableDataCell>
                        <CTableDataCell>₹{parseFloat(p.amount).toFixed(2)}</CTableDataCell>
                        <CTableDataCell>₹{parseFloat(p.paid_amount).toFixed(2)}</CTableDataCell>
                        <CTableDataCell>₹{parseFloat(p.balance_amount).toFixed(2)}</CTableDataCell>
                        <CTableDataCell><CBadge color={statusColor}>{statusText}</CBadge></CTableDataCell>
                        <CTableDataCell>{new Date(p.created_at).toLocaleDateString()}</CTableDataCell>
                        <CTableDataCell>
                          <div className="d-flex gap-1 align-items-center">
                            <CButton
                              color="info"
                              size="sm"
                              onClick={() => openLogsModal(p.purches_vendor_id)}
                              disabled={!p.logs || p.logs.length === 0}
                              title={`Logs (${p.logs?.length || 0})`}
                            >
                              <CIcon icon={cilList} />
                            </CButton>
                            <CButton
                              color="success"
                              size="sm"
                              onClick={() => openPayModal(p)}
                              disabled={!canPay}
                              title={canPay ? "Make Payment" : "Fully Paid"}
                            >
                              <CIcon icon={cilDollar} />
                            </CButton>
                            <CButton color="warning" size="sm" onClick={() => openEditModal(p)}>
                              Edit
                            </CButton>
                            {usertype === 1 && (
                              <CButton color="danger" size="sm" onClick={() => openDeleteModal(p.purches_vendor_id)}>
                                Delete
                              </CButton>
                            )}
                          </div>
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
        onRefresh={fetchPayments}
      />

      <ProjectSelectionModal
        visible={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        onSelectProject={(p) => {
          selectProject(p);
          setShowProjectModal(false);
        }}
      />

      <ConfirmationModal
        visible={deleteModalVisible}
        setVisible={setDeleteModalVisible}
        resource="Purchase Record"
        onYes={handleDelete}
      />
    </>
  );
};

export default PurchesVendorPayment;
