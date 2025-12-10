import React, { useEffect, useState, useCallback, useRef } from "react";
import { getAPICall, post, put, deleteAPICall } from "../../../util/api";
import { 
  CButton, CCard, CCardHeader, CCardBody, CCol, 
  CFormSelect, CFormInput, CInputGroup, CRow, 
  CSpinner, CAlert, CModal, CModalHeader, CModalTitle,
  CModalBody, CModalFooter, CFormTextarea, CBadge,
  CTable, CTableHead, CTableRow, CTableHeaderCell,
  CTableBody, CTableDataCell, CNav, CNavItem, CNavLink,
  CTabContent, CTabPane
} from '@coreui/react';
import { cilSearch, cilMoney, cilHistory, cilPlus, cilMinus, cilPencil, cilTrash, cilX } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { paymentTypes, receiver_bank } from "../../../util/Feilds";
import ProjectSelectionModal from '../../common/ProjectSelectionModal'; // adjust path as needed
import { useToast } from "../../common/toast/ToastContext";

const VendorPaymentReport = () => {
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [vendorPayments, setVendorPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAlert, setShowAlert] = useState(false); // Removed alertMessage and alertType as we'll use toast

  // Payment Modal State - Now with tabs
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentModalTab, setPaymentModalTab] = useState('direct');
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [paymentModalError, setPaymentModalError] = useState(''); // Local error state for payment modal
  
  // Direct Payment Fields
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paidBy, setPaidBy] = useState('');
  const [paymentType, setPaymentType] = useState('');
  const [description, setDescription] = useState('');
  
  // On Behalf Payment Fields
  const [onBehalfAmount, setOnBehalfAmount] = useState('');
  const [onBehalfDate, setOnBehalfDate] = useState(new Date().toISOString().split('T')[0]);
  const [onBehalfPaidBy, setOnBehalfPaidBy] = useState('');
  const [onBehalfPaymentType, setOnBehalfPaymentType] = useState('');
  const [onBehalfDescription, setOnBehalfDescription] = useState('');
  
  const [savingPayment, setSavingPayment] = useState(false);

  // Logs Modal State - Now with tabs
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [logsModalTab, setLogsModalTab] = useState('direct');
  const [selectedVendorLogs, setSelectedVendorLogs] = useState([]);
  const [selectedVendorOnBehalfLogs, setSelectedVendorOnBehalfLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Edit Log Modal State
  const [showEditLogModal, setShowEditLogModal] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  const [editLogAmount, setEditLogAmount] = useState('');
  const [editLogDate, setEditLogDate] = useState('');
  const [editLogPaidBy, setEditLogPaidBy] = useState('');
  const [editLogPaymentType, setEditLogPaymentType] = useState('');
  const [editLogDescription, setEditLogDescription] = useState('');
  const [editLogError, setEditLogError] = useState(''); // Local error state for edit log modal
  const [savingLogEdit, setSavingLogEdit] = useState(false);

  // Edit On Behalf Log Modal State
  const [showEditOnBehalfLogModal, setShowEditOnBehalfLogModal] = useState(false);
  const [editingOnBehalfLog, setEditingOnBehalfLog] = useState(null);
  const [editOnBehalfLogAmount, setEditOnBehalfLogAmount] = useState('');
  const [editOnBehalfLogDate, setEditOnBehalfLogDate] = useState('');
  const [editOnBehalfLogPaidBy, setEditOnBehalfLogPaidBy] = useState('');
  const [editOnBehalfLogPaymentType, setEditOnBehalfLogPaymentType] = useState('');
  const [editOnBehalfLogDescription, setEditOnBehalfLogDescription] = useState('');
  const [editOnBehalfLogError, setEditOnBehalfLogError] = useState(''); // Local error state for on behalf edit modal
  const [savingOnBehalfLogEdit, setSavingOnBehalfLogEdit] = useState(false);

  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingLog, setDeletingLog] = useState(null);
  const [deletingLogId, setDeletingLogId] = useState(false);
  const [deletingLogType, setDeletingLogType] = useState('direct');
  const [deleteLogError, setDeleteLogError] = useState(''); // Local error state for delete confirmation

  // Expandable rows for vendor details
  const [expandedRows, setExpandedRows] = useState({});

  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  const { showToast } = useToast(); // Assuming useToast is available

  const showTempAlert = (message, type) => {
    showToast(type, message); // Using toast instead of local alert
  };

  const fetchProjects = useCallback(async (query) => {
    try {
      const response = await getAPICall(`/api/projects?searchQuery=${query}`);
      setProjects(response || []);
      setShowDropdown(true);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
      setShowDropdown(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery && searchQuery.length > 2) {
        fetchProjects(searchQuery);
      } else {
        setProjects([]);
        setShowDropdown(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchProjects]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      fetchVendorPayments();
    } else {
      setVendorPayments([]);
    }
  }, [selectedProjectId]);

  const handleProjectChange = (project) => {
    setSearchQuery(project.project_name);
    setSelectedProjectId(project.id);
    setProjects([]);
    setShowDropdown(false);
    if (inputRef.current) inputRef.current.blur();
  };

  const handleInputFocus = () => {
    if (projects.length > 0) setShowDropdown(true);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (selectedProjectId && value !== searchQuery) {
      setSelectedProjectId('');
    }
  };

  const syncVendorPayments = async () => {
    if (!selectedProjectId) return;

    setLoading(true);
    try {
      const response = await post(`/api/projects/${selectedProjectId}/sync-vendor-payments`, {});
      
      if (response && (response.message || response.vendor_payments_count !== undefined)) {
        const count = response.vendor_payments_count || 0;
        showTempAlert(
          `Vendor payments synced successfully! Created/Updated ${count} vendor payment records.`, 
          'success'
        );
        fetchVendorPayments();
      } else {
        showTempAlert('Sync completed but no data returned', 'warning');
        fetchVendorPayments();
      }
    } catch (error) {
      console.error('Sync error:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to sync vendor payments';
      showTempAlert(errorMessage, 'danger');
    } finally {
      setLoading(false);
    }
  };

  const fetchVendorPayments = async () => {
    if (!selectedProjectId) {
      showTempAlert('Please select a project', 'warning');
      return;
    }

    setLoading(true);
    try {
      const response = await getAPICall(`/api/vendor-payments/${selectedProjectId}`);
      
      if (Array.isArray(response)) {
        setVendorPayments(response);
        if (response.length === 0) {
          showTempAlert('No vendor payments found for this project', 'info');
        }
      } else if (response && response.data) {
        setVendorPayments(response.data || []);
        if (response.message) {
          showTempAlert(response.message, 'warning');
        }
      } else {
        setVendorPayments([]);
        showTempAlert('No vendor payments found for this project', 'info');
      }
    } catch (error) {
      console.error('Error fetching vendor payments:', error);
      showTempAlert('Failed to fetch vendor payments', 'danger');
      setVendorPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const openPaymentModal = (vendor) => {
    setSelectedVendor(vendor);
    setPaymentModalTab('direct');
    
    setPaymentAmount(vendor.balance_amount || '');
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setPaidBy('');
    setPaymentType('cash');
    setDescription('');
    
    setOnBehalfAmount('');
    setOnBehalfDate(new Date().toISOString().split('T')[0]);
    setOnBehalfPaidBy('');
    setOnBehalfPaymentType('cash');
    setOnBehalfDescription('');
    
    setPaymentModalError(''); // Clear previous error
    setShowPaymentModal(true);
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedVendor(null);
    setPaymentModalTab('direct');
    setPaymentModalError(''); // Clear error on close
  };

  const handleDirectPaymentSubmit = async () => {
    if (!paymentAmount || !paymentDate || !paidBy) {
      setPaymentModalError('Please fill all required fields (Amount, Date, Paid By)');
      return;
    }

    if (parseFloat(paymentAmount) <= 0) {
      setPaymentModalError('Payment amount must be greater than 0');
      return;
    }

    if (parseFloat(paymentAmount) > parseFloat(selectedVendor.balance_amount)) {
      setPaymentModalError('Payment amount cannot exceed balance amount');
      return;
    }

    setSavingPayment(true);

    const payload = {
      amount: parseFloat(paymentAmount),
      payment_date: paymentDate,
      paid_by: paidBy,
      payment_type: paymentType || 'cash',
      description: description || '',
      is_on_behalf: false
    };

    try {
      const response = await post(`/api/vendor-payments/${selectedVendor.id}/pay`, payload);
      
      if (response && (response.message || response.vendor_payment)) {
        showTempAlert('Payment recorded successfully!', 'success');
        closePaymentModal();
        fetchVendorPayments();
      } else {
        setPaymentModalError(response?.error || 'Failed to record payment');
      }
    } catch (error) {
      console.error('Payment error:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to record payment. Please try again.';
      setPaymentModalError(errorMessage);
    } finally {
      setSavingPayment(false);
    }
  };

  const handleOnBehalfPaymentSubmit = async () => {
    if (!onBehalfAmount || !onBehalfDate || !onBehalfPaidBy) {
      setPaymentModalError('Please fill all required fields (Amount, Date, Paid By)');
      return;
    }

    if (parseFloat(onBehalfAmount) <= 0) {
      setPaymentModalError('Payment amount must be greater than 0');
      return;
    }

    if (parseFloat(onBehalfAmount) > parseFloat(selectedVendor.balance_amount)) {
      setPaymentModalError('Payment amount cannot exceed balance amount');
      return;
    }

    setSavingPayment(true);

    const payload = {
      amount: parseFloat(onBehalfAmount),
      payment_date: onBehalfDate,
      paid_by: onBehalfPaidBy,
      payment_type: onBehalfPaymentType || 'cash',
      description: onBehalfDescription || '',
      is_on_behalf: true
    };

    try {
      const response = await post(`/api/vendor-payments/${selectedVendor.id}/pay-on-behalf`, payload);
      
      if (response && (response.message || response.on_behalf_log)) {
        showTempAlert('On behalf payment recorded successfully!', 'success');
        closePaymentModal();
        fetchVendorPayments();
      } else {
        setPaymentModalError(response?.error || 'Failed to record on behalf payment');
      }
    } catch (error) {
      console.error('On behalf payment error:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to record on behalf payment. Please try again.';
      setPaymentModalError(errorMessage);
    } finally {
      setSavingPayment(false);
    }
  };

  const fetchVendorLogs = async (vendorPaymentId) => {
    setLoadingLogs(true);
    try {
      const directLogsResponse = await getAPICall(`/api/vendor-payments/${vendorPaymentId}/logs`);
      setSelectedVendorLogs(directLogsResponse || []);
      
      const onBehalfLogsResponse = await getAPICall(`/api/vendor-payments/${vendorPaymentId}/on-behalf-logs`);
      setSelectedVendorOnBehalfLogs(onBehalfLogsResponse || []);
      
      setLogsModalTab('direct');
      setShowLogsModal(true);
    } catch (error) {
      console.error('Error fetching logs:', error);
      showTempAlert('Failed to fetch payment logs', 'danger');
      setSelectedVendorLogs([]);
      setSelectedVendorOnBehalfLogs([]);
    } finally {
      setLoadingLogs(false);
    }
  };

  // Direct Payment Log Edit Functions
  const openEditLogModal = (log) => {
    setEditingLog(log);
    setEditLogAmount(log.amount.toString());
    setEditLogDate(log.payment_date.split('T')[0]);
    setEditLogPaidBy(log.paid_by);
    setEditLogPaymentType(log.payment_type || 'cash');
    setEditLogDescription(log.description || '');
    setEditLogError(''); // Clear previous error
    setShowEditLogModal(true);
  };

  const closeEditLogModal = () => {
    setShowEditLogModal(false);
    setEditingLog(null);
    setEditLogError(''); // Clear error on close
  };

  const handleEditLogSubmit = async () => {
    if (!editLogAmount || !editLogDate || !editLogPaidBy) {
      setEditLogError('Please fill all required fields (Amount, Date, Paid By)');
      return;
    }

    if (parseFloat(editLogAmount) <= 0) {
      setEditLogError('Payment amount must be greater than 0');
      return;
    }

    setSavingLogEdit(true);

    const payload = {
      amount: parseFloat(editLogAmount),
      payment_date: editLogDate,
      paid_by: editLogPaidBy,
      payment_type: editLogPaymentType || 'cash',
      description: editLogDescription || ''
    };

    try {
      const response = await put(`/api/vendor-payment-logs/${editingLog.id}`, payload);
      
      if (response && response.message) {
        showTempAlert('Payment log updated successfully!', 'success');
        closeEditLogModal();
        fetchVendorLogs(editingLog.vendor_payment_id);
        fetchVendorPayments();
      } else {
        setEditLogError(response?.error || 'Failed to update payment log');
      }
    } catch (error) {
      console.error('Edit log error:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to update payment log. Please try again.';
      setEditLogError(errorMessage);
    } finally {
      setSavingLogEdit(false);
    }
  };

  // On Behalf Payment Log Edit Functions
  const openEditOnBehalfLogModal = (log) => {
    setEditingOnBehalfLog(log);
    setEditOnBehalfLogAmount(log.amount.toString());
    setEditOnBehalfLogDate(log.payment_date.split('T')[0]);
    setEditOnBehalfLogPaidBy(log.paid_by);
    setEditOnBehalfLogPaymentType(log.payment_type || 'cash');
    setEditOnBehalfLogDescription(log.description || '');
    setEditOnBehalfLogError(''); // Clear previous error
    setShowEditOnBehalfLogModal(true);
  };

  const closeEditOnBehalfLogModal = () => {
    setShowEditOnBehalfLogModal(false);
    setEditingOnBehalfLog(null);
    setEditOnBehalfLogError(''); // Clear error on close
  };

  const handleEditOnBehalfLogSubmit = async () => {
    if (!editOnBehalfLogAmount || !editOnBehalfLogDate || !editOnBehalfLogPaidBy) {
      setEditOnBehalfLogError('Please fill all required fields (Amount, Date, Paid By)');
      return;
    }

    if (parseFloat(editOnBehalfLogAmount) <= 0) {
      setEditOnBehalfLogError('Payment amount must be greater than 0');
      return;
    }

    setSavingOnBehalfLogEdit(true);

    const payload = {
      amount: parseFloat(editOnBehalfLogAmount),
      payment_date: editOnBehalfLogDate,
      paid_by: editOnBehalfLogPaidBy,
      payment_type: editOnBehalfLogPaymentType || 'cash',
      description: editOnBehalfLogDescription || ''
    };

    try {
      const response = await put(`/api/vendor-on-behalf-payment-logs/${editingOnBehalfLog.id}`, payload);
      
      if (response && response.message) {
        showTempAlert('On behalf payment log updated successfully!', 'success');
        closeEditOnBehalfLogModal();
        fetchVendorLogs(editingOnBehalfLog.vendor_payment_id);
        fetchVendorPayments();
      } else {
        setEditOnBehalfLogError(response?.error || 'Failed to update on behalf payment log');
      }
    } catch (error) {
      console.error('Edit on behalf log error:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to update on behalf payment log. Please try again.';
      setEditOnBehalfLogError(errorMessage);
    } finally {
      setSavingOnBehalfLogEdit(false);
    }
  };

  // Delete Log Functions
  const openDeleteConfirm = (log, type = 'direct') => {
    setDeletingLog(log);
    setDeletingLogType(type);
    setDeleteLogError(''); // Clear previous error
    setShowDeleteConfirm(true);
  };

  const closeDeleteConfirm = () => {
    setShowDeleteConfirm(false);
    setDeletingLog(null);
    setDeletingLogType('direct');
    setDeleteLogError(''); // Clear error on close
  };

  const handleDeleteLog = async () => {
    if (!deletingLog) return;

    setDeletingLogId(true);

    try {
      const endpoint = deletingLogType === 'onbehalf' 
        ? `/api/vendor-on-behalf-payment-logs/${deletingLog.id}`
        : `/api/vendor-payment-logs/${deletingLog.id}`;
      
      const response = await deleteAPICall(endpoint);
      
      if (response && response.message) {
        showTempAlert('Payment log deleted successfully!', 'success');
        closeDeleteConfirm();
        fetchVendorLogs(deletingLog.vendor_payment_id);
        fetchVendorPayments();
      } else {
        setDeleteLogError(response?.error || 'Failed to delete payment log');
      }
    } catch (error) {
      console.error('Delete log error:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to delete payment log. Please try again.';
      setDeleteLogError(errorMessage);
    } finally {
      setDeletingLogId(false);
    }
  };

  const toggleRowExpansion = (vendorId) => {
    setExpandedRows(prev => ({
      ...prev,
      [vendorId]: !prev[vendorId]
    }));
  };

  const getPaymentStatus = (vendor) => {
    const total = parseFloat(vendor.total_amount || 0);
    const paid = parseFloat(vendor.paid_amount || 0);
    
    if (paid === 0) return { text: 'Unpaid', color: 'danger' };
    if (paid >= total) return { text: 'Paid', color: 'success' };
    return { text: 'Partial', color: 'warning' };
  };

  const getPaymentTypeLabel = (paymentTypeValue) => {
    if (!paymentTypeValue) return 'Cash';
    const paymentType = paymentTypes.find(type => type.value === paymentTypeValue);
    return paymentType ? paymentType.label : paymentTypeValue;
  };

  return (
    <div className="container-fluid py-2">
      <CCard>
        <CCardHeader className="bg-primary text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Vendor Payment Management</h5>
          {selectedProjectId && (
            <CButton 
              color="light" 
              size="sm"
              onClick={syncVendorPayments}
              disabled={loading}
            >
              {loading ? (
                <>
                  <CSpinner size="sm" className="me-2" /> Syncing...
                </>
              ) : (
                <>
                  <CIcon icon={cilMoney} className="me-2" /> Sync Payments
                </>
              )}
            </CButton>
          )}
        </CCardHeader>
        <CCardBody>
          {showAlert && (
            <CAlert color="danger" dismissible onClose={() => setShowAlert(false)}>
              {alertMessage}
            </CAlert>
          )}

          {/* Project Selection */}
          <CRow className="mb-4">
            <CCol md={12}>
              <div className="position-relative" ref={dropdownRef}>
                <CInputGroup>
                  <CFormInput
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    placeholder="Search and select a project to view vendor payments..."
                    className="border"
                    autoComplete="off"
                  />

                  {!selectedProjectId ? (
                    <CButton
                      color="primary"
                      variant="outline"
                      onClick={() => setShowProjectModal(true)}
                      style={{
                        position: 'absolute',
                        right: '0',
                        top: '0',
                        bottom: '0',
                        zIndex: 5,
                        borderTopLeftRadius: 0,
                        borderBottomLeftRadius: 0,
                      }}
                    >
                      <CIcon icon={cilSearch} />
                    </CButton>
                  ) : (
                    <CButton
                      color="danger"
                      variant="outline"
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedProjectId('');
                        setProjects([]);
                        setVendorPayments([]);
                      }}
                      style={{
                        position: 'absolute',
                        right: '0',
                        top: '0',
                        bottom: '0',
                        zIndex: 5,
                        borderTopLeftRadius: 0,
                        borderBottomLeftRadius: 0,
                      }}
                    >
                      <CIcon icon={cilX} />
                    </CButton>
                  )}
                </CInputGroup>

                {showDropdown && projects.length > 0 && (
                  <div
                    className="dropdown-menu show w-100"
                    style={{
                      maxHeight: '200px',
                      overflowY: 'auto',
                      position: 'absolute',
                      zIndex: 1000,
                      marginTop: '2px',
                    }}
                  >
                    {projects.map((project) => (
                      <div
                        key={project.id}
                        className="dropdown-item"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleProjectChange(project)}
                      >
                        {project.project_name}
                      </div>
                    ))}
                  </div>
                )}

                {selectedProjectId && (
                  <div className="text-success mt-1 small">
                    ✓ Selected: {searchQuery}
                  </div>
                )}
              </div>
            </CCol>
          </CRow>

          {loading && (
            <div className="text-center py-4">
              <CSpinner />
              <p className="mt-2">Loading vendor payments...</p>
            </div>
          )}

          {!loading && vendorPayments.length > 0 && (
            <div className="table-responsive">
              <CTable striped hover>
                <CTableHead color="primary">
                  <CTableRow>
                    <CTableHeaderCell>Vendor Name</CTableHeaderCell>
                    <CTableHeaderCell>Total Amount</CTableHeaderCell>
                    <CTableHeaderCell>Paid Amount</CTableHeaderCell>
                    <CTableHeaderCell>Balance Amount</CTableHeaderCell>
                    <CTableHeaderCell>Status</CTableHeaderCell>
                    <CTableHeaderCell>Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {vendorPayments.map((vendor) => {
                    const status = getPaymentStatus(vendor);
                    const isExpanded = expandedRows[vendor.id];
                    return (
                      <React.Fragment key={vendor.id}>
                        <CTableRow>
                          <CTableDataCell>
                            {vendor.vendor ? vendor.vendor.name : 'Unknown Vendor'}
                          </CTableDataCell>
                          <CTableDataCell>₹{parseFloat(vendor.total_amount || 0).toFixed(2)}</CTableDataCell>
                          <CTableDataCell>₹{parseFloat(vendor.paid_amount || 0).toFixed(2)}</CTableDataCell>
                          <CTableDataCell>₹{parseFloat(vendor.balance_amount || 0).toFixed(2)}</CTableDataCell>
                          <CTableDataCell>
                            <CBadge color={status.color}>{status.text}</CBadge>
                          </CTableDataCell>
                          <CTableDataCell>
                            <div className="d-flex gap-2">
                              <CButton
                                color="success"
                                size="sm"
                                onClick={() => openPaymentModal(vendor)}
                              >
                                <CIcon icon={cilMoney} className="me-1" />
                                Pay
                              </CButton>
                              <CButton
                                color="info"
                                size="sm"
                                onClick={() => fetchVendorLogs(vendor.id)}
                              >
                                <CIcon icon={cilHistory} className="me-1" />
                                Logs
                              </CButton>
                              <CButton
                                color="secondary"
                                size="sm"
                                onClick={() => toggleRowExpansion(vendor.id)}
                                title={isExpanded ? "Hide Details" : "Show Details"}
                              >
                                <CIcon icon={isExpanded ? cilMinus : cilPlus} />
                              </CButton>
                            </div>
                          </CTableDataCell>
                        </CTableRow>
                        
                        {isExpanded && (
                          <CTableRow>
                            <CTableDataCell colSpan="7">
                              <div className="p-3 bg-light">
                                <h6>Vendor Details</h6>
                                <CRow>
                                  <CCol md={4}>
                                    <p><strong>Name:</strong> {vendor.vendor?.name || 'N/A'}</p>
                                  </CCol>
                                  <CCol md={4}>
                                    <p><strong>Mobile:</strong> {vendor.vendor?.mobile || 'N/A'}</p>
                                  </CCol>
                                  <CCol md={4}>
                                    <p><strong>Address:</strong> {vendor.vendor?.address || 'N/A'}</p>
                                  </CCol>
                                </CRow>
                                <CRow>
                                  <CCol md={4}>
                                    <p><strong>Bank Name:</strong> {vendor.vendor?.bank_name || 'N/A'}</p>
                                  </CCol>
                                  <CCol md={4}>
                                    <p><strong>Account No:</strong> {vendor.vendor?.account_number || 'N/A'}</p>
                                  </CCol>
                                  <CCol md={4}>
                                    <p><strong>IFSC Code:</strong> {vendor.vendor?.ifsc_code || 'N/A'}</p>
                                  </CCol>
                                </CRow>
                                {(vendor.vendor?.gst_no || vendor.vendor?.adhar_number || vendor.vendor?.pan_number) && (
                                  <CRow>
                                    {vendor.vendor?.gst_no && (
                                      <CCol md={4}>
                                        <p><strong>GST No:</strong> {vendor.vendor.gst_no}</p>
                                      </CCol>
                                    )}
                                    {vendor.vendor?.adhar_number && (
                                      <CCol md={4}>
                                        <p><strong>Aadhar No:</strong> {vendor.vendor.adhar_number}</p>
                                      </CCol>
                                    )}
                                    {vendor.vendor?.pan_number && (
                                      <CCol md={4}>
                                        <p><strong>PAN No:</strong> {vendor.vendor.pan_number}</p>
                                      </CCol>
                                    )}
                                  </CRow>
                                )}
                              </div>
                            </CTableDataCell>
                          </CTableRow>
                        )}
                      </React.Fragment>
                    );
                  })}
                </CTableBody>
              </CTable>
            </div>
          )}

          {!loading && vendorPayments.length === 0 && selectedProjectId && (
            <div className="text-center py-5">
              <div className="mb-4">
                <CIcon icon={cilMoney} size="3xl" className="text-muted mb-3" />
                <h5 className="text-muted">No vendor payments found</h5>
                <p className="text-muted mb-4">
                  This could mean:
                  <br />• No budgets have been created for this project
                  <br />• Budgets exist but vendor payments need to be synced
                  <br />• No operators are assigned to work on this project
                </p>
              </div>
              
              <div className="d-flex justify-content-center gap-3">
                <CButton 
                  color="warning" 
                  onClick={syncVendorPayments}
                  disabled={loading}
                >
                  <CIcon icon={cilMoney} className="me-2" />
                  Sync Vendor Payments
                </CButton>
              </div>
            </div>
          )}

          {!selectedProjectId && !loading && (
            <div className="text-center py-5">
              <CIcon icon={cilSearch} size="3xl" className="text-muted mb-3" />
              <h5 className="text-muted">Select a project to get started</h5>
              <p className="text-muted">
                Search and select a project from the dropdown above to view vendor payments.
              </p>
            </div>
          )}

          {/* Payment Modal with Tabs */}
          <CModal visible={showPaymentModal} onClose={closePaymentModal} backdrop="static" size="lg">
            <CModalHeader onClose={closePaymentModal}>
              <CModalTitle>Record Payment</CModalTitle>
            </CModalHeader>
            <CModalBody>
              {selectedVendor && (
                <div>
                  <div className="mb-3 p-3 bg-light rounded">
                    <h6>Vendor: {selectedVendor.vendor?.name || 'Unknown'}</h6>
                    <p className="mb-1">Total Amount: ₹{parseFloat(selectedVendor.total_amount || 0).toFixed(2)}</p>
                    <p className="mb-1">Paid Amount: ₹{parseFloat(selectedVendor.paid_amount || 0).toFixed(2)}</p>
                    <p className="mb-0">Balance Amount: ₹{parseFloat(selectedVendor.balance_amount || 0).toFixed(2)}</p>
                  </div>

                  <CNav variant="tabs" role="tablist" className="mb-3">
                    <CNavItem>
                      <CNavLink
                        active={paymentModalTab === 'direct'}
                        onClick={() => setPaymentModalTab('direct')}
                        style={{ cursor: 'pointer' }}
                      >
                        Direct Payment
                      </CNavLink>
                    </CNavItem>
                    <CNavItem>
                      <CNavLink
                        active={paymentModalTab === 'onbehalf'}
                        onClick={() => setPaymentModalTab('onbehalf')}
                        style={{ cursor: 'pointer' }}
                      >
                        On Behalf Payment
                      </CNavLink>
                    </CNavItem>
                  </CNav>

                  <CTabContent>
                    <CTabPane visible={paymentModalTab === 'direct'}>
                      <CRow>
                        <CCol md={6}>
                          <div className="mb-3">
                            <label className="form-label">Payment Amount *</label>
                            <CFormInput
                              type="number"
                              value={paymentAmount}
                              onChange={(e) => setPaymentAmount(e.target.value)}
                              placeholder="Enter payment amount"
                              step="0.01"
                              max={selectedVendor.balance_amount}
                            />
                          </div>
                        </CCol>
                        <CCol md={6}>
                          <div className="mb-3">
                            <label className="form-label">Payment Date *</label>
                            <CFormInput
                              type="date"
                              value={paymentDate}
                              onChange={(e) => setPaymentDate(e.target.value)}
                            />
                          </div>
                        </CCol>
                      </CRow>

                      <CRow>
                        <CCol md={6}>
                          <div className="mb-3">
                            <label className="form-label">Paid By *</label>
                            <CFormSelect
                              value={paidBy}
                              onChange={(e) => setPaidBy(e.target.value)}
                            >
                              <option value="">Select Payment By</option>
                              {receiver_bank.map((bank) => (
                                <option key={bank.value} value={bank.value}>{bank.label}</option>
                              ))}
                            </CFormSelect>
                          </div>
                        </CCol>
                        <CCol md={6}>
                          <div className="mb-3">
                            <label className="form-label">Payment Type *</label>
                            <CFormSelect
                              value={paymentType}
                              onChange={(e) => setPaymentType(e.target.value)}
                            >
                              {paymentTypes.map((type) => (
                                <option key={type.value} value={type.value}>{type.label}</option>
                              ))}
                            </CFormSelect>
                          </div>
                        </CCol>
                      </CRow>

                      <div className="mb-3">
                        <label className="form-label">Description</label>
                        <CFormTextarea
                          rows="3"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Enter payment description (optional)"
                        />
                      </div>
                    </CTabPane>

                    <CTabPane visible={paymentModalTab === 'onbehalf'}>
                      <div className="alert alert-info mb-3">
                        <small>
                          <strong>Note:</strong> On behalf payments are made to another vendor on behalf of this vendor. 
                          These payments will reduce the balance amount of this vendor.
                        </small>
                      </div>

                      <CRow>
                        <CCol md={6}>
                          <div className="mb-3">
                            <label className="form-label">Payment Amount *</label>
                            <CFormInput
                              type="number"
                              value={onBehalfAmount}
                              onChange={(e) => setOnBehalfAmount(e.target.value)}
                              placeholder="Enter payment amount"
                              step="0.01"
                              min="0.01"
                            />
                          </div>
                        </CCol>
                        <CCol md={6}>
                          <div className="mb-3">
                            <label className="form-label">Payment Date *</label>
                            <CFormInput
                              type="date"
                              value={onBehalfDate}
                              onChange={(e) => setOnBehalfDate(e.target.value)}
                            />
                          </div>
                        </CCol>
                      </CRow>

                      <CRow>
                        <CCol md={6}>
                          <div className="mb-3">
                            <label className="form-label">Paid By *</label>
                            <CFormSelect
                              value={onBehalfPaidBy}
                              onChange={(e) => setOnBehalfPaidBy(e.target.value)}
                            >
                              <option value="">Select Payment By</option>
                              {receiver_bank.map((bank) => (
                                <option key={bank.value} value={bank.value}>{bank.label}</option>
                              ))}
                            </CFormSelect>
                          </div>
                        </CCol>
                        <CCol md={6}>
                          <div className="mb-3">
                            <label className="form-label">Payment Type *</label>
                            <CFormSelect
                              value={onBehalfPaymentType}
                              onChange={(e) => setOnBehalfPaymentType(e.target.value)}
                            >
                              {paymentTypes.map((type) => (
                                <option key={type.value} value={type.value}>{type.label}</option>
                              ))}
                            </CFormSelect>
                          </div>
                        </CCol>
                      </CRow>

                      <div className="mb-3">
                        <label className="form-label">Description</label>
                        <CFormTextarea
                          rows="3"
                          value={onBehalfDescription}
                          onChange={(e) => setOnBehalfDescription(e.target.value)}
                          placeholder="Enter payment description (optional)"
                        />
                      </div>
                    </CTabPane>
                  </CTabContent>

                  {paymentModalError && (
                    <div className="alert alert-danger mt-3" role="alert">
                      {paymentModalError}
                    </div>
                  )}
                </div>
              )}
            </CModalBody>
            <CModalFooter>
              <CButton color="secondary" onClick={closePaymentModal}>
                Cancel
              </CButton>
              <CButton 
                color="primary" 
                disabled={savingPayment} 
                onClick={paymentModalTab === 'direct' ? handleDirectPaymentSubmit : handleOnBehalfPaymentSubmit}
              >
                {savingPayment ? (
                  <>
                    <CSpinner size="sm" className="me-2" />
                    Recording...
                  </>
                ) : (
                  paymentModalTab === 'direct' ? 'Record Payment' : 'Record On Behalf Payment'
                )}
              </CButton>
            </CModalFooter>
          </CModal>

          {/* Logs Modal with Tabs */}
          <CModal visible={showLogsModal} onClose={() => setShowLogsModal(false)} size="xl">
            <CModalHeader onClose={() => setShowLogsModal(false)}>
              <CModalTitle>Payment Logs</CModalTitle>
            </CModalHeader>
            <CModalBody>
              {loadingLogs ? (
                <div className="text-center py-4">
                  <CSpinner />
                  <p className="mt-2">Loading payment logs...</p>
                </div>
              ) : (
                <div>
                  <CNav variant="tabs" role="tablist" className="mb-3">
                    <CNavItem>
                      <CNavLink
                        active={logsModalTab === 'direct'}
                        onClick={() => setLogsModalTab('direct')}
                        style={{ cursor: 'pointer' }}
                      >
                        Direct Payments ({selectedVendorLogs.length})
                      </CNavLink>
                    </CNavItem>
                    <CNavItem>
                      <CNavLink
                        active={logsModalTab === 'onbehalf'}
                        onClick={() => setLogsModalTab('onbehalf')}
                        style={{ cursor: 'pointer' }}
                      >
                        On Behalf Payments ({selectedVendorOnBehalfLogs.length})
                      </CNavLink>
                    </CNavItem>
                  </CNav>

                  <CTabContent>
                    <CTabPane visible={logsModalTab === 'direct'}>
                      {selectedVendorLogs.length > 0 ? (
                        <div className="table-responsive">
                          <CTable striped>
                            <CTableHead>
                              <CTableRow>
                                <CTableHeaderCell>Date</CTableHeaderCell>
                                <CTableHeaderCell>Amount</CTableHeaderCell>
                                <CTableHeaderCell>Paid By</CTableHeaderCell>
                                <CTableHeaderCell>Payment Type</CTableHeaderCell>
                                <CTableHeaderCell>Description</CTableHeaderCell>
                                <CTableHeaderCell>Actions</CTableHeaderCell>
                              </CTableRow>
                            </CTableHead>
                            <CTableBody>
                              {selectedVendorLogs.map((log) => (
                                <CTableRow key={log.id}>
                                  <CTableDataCell>
                                    {new Date(log.payment_date).toLocaleDateString()}
                                  </CTableDataCell>
                                  <CTableDataCell>₹{parseFloat(log.amount).toFixed(2)}</CTableDataCell>
                                  <CTableDataCell>{log.paid_by}</CTableDataCell>
                                  <CTableDataCell>
                                    <CBadge color="info">
                                      {getPaymentTypeLabel(log.payment_type)}
                                    </CBadge>
                                  </CTableDataCell>
                                  <CTableDataCell>{log.description || '-'}</CTableDataCell>
                                  <CTableDataCell>
                                    <div className="d-flex gap-2">
                                      <CButton
                                        color="warning"
                                        size="sm"
                                        onClick={() => openEditLogModal(log)}
                                        title="Edit Payment Log"
                                      >
                                        <CIcon icon={cilPencil} />
                                      </CButton>
                                      <CButton
                                        color="danger"
                                        size="sm"
                                        onClick={() => openDeleteConfirm(log, 'direct')}
                                        title="Delete Payment Log"
                                      >
                                        <CIcon icon={cilTrash} />
                                      </CButton>
                                    </div>
                                  </CTableDataCell>
                                </CTableRow>
                              ))}
                            </CTableBody>
                          </CTable>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <h6 className="text-muted">No direct payment logs found</h6>
                        </div>
                      )}
                    </CTabPane>

                    <CTabPane visible={logsModalTab === 'onbehalf'}>
                      {selectedVendorOnBehalfLogs.length > 0 ? (
                        <div className="table-responsive">
                          <CTable striped>
                            <CTableHead>
                              <CTableRow>
                                <CTableHeaderCell>Date</CTableHeaderCell>
                                <CTableHeaderCell>Amount</CTableHeaderCell>
                                <CTableHeaderCell>Paid By</CTableHeaderCell>
                                <CTableHeaderCell>Payment Type</CTableHeaderCell>
                                <CTableHeaderCell>Description</CTableHeaderCell>
                                <CTableHeaderCell>Actions</CTableHeaderCell>
                              </CTableRow>
                            </CTableHead>
                            <CTableBody>
                              {selectedVendorOnBehalfLogs.map((log) => (
                                <CTableRow key={log.id}>
                                  <CTableDataCell>
                                    {new Date(log.payment_date).toLocaleDateString()}
                                  </CTableDataCell>
                                  <CTableDataCell>₹{parseFloat(log.amount).toFixed(2)}</CTableDataCell>
                                  <CTableDataCell>{log.paid_by}</CTableDataCell>
                                  <CTableDataCell>
                                    <CBadge color="info">
                                      {getPaymentTypeLabel(log.payment_type)}
                                    </CBadge>
                                  </CTableDataCell>
                                  <CTableDataCell>{log.description || '-'}</CTableDataCell>
                                  <CTableDataCell>
                                    <div className="d-flex gap-2">
                                      <CButton
                                        color="warning"
                                        size="sm"
                                        onClick={() => openEditOnBehalfLogModal(log)}
                                        title="Edit On Behalf Payment Log"
                                      >
                                        <CIcon icon={cilPencil} />
                                      </CButton>
                                      <CButton
                                        color="danger"
                                        size="sm"
                                        onClick={() => openDeleteConfirm(log, 'onbehalf')}
                                        title="Delete On Behalf Payment Log"
                                      >
                                        <CIcon icon={cilTrash} />
                                      </CButton>
                                    </div>
                                  </CTableDataCell>
                                </CTableRow>
                              ))}
                            </CTableBody>
                          </CTable>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <h6 className="text-muted">No on behalf payment logs found</h6>
                        </div>
                      )}
                    </CTabPane>
                  </CTabContent>
                </div>
              )}
            </CModalBody>
            <CModalFooter>
              <CButton color="secondary" onClick={() => setShowLogsModal(false)}>
                Close
              </CButton>
            </CModalFooter>
          </CModal>

          {/* Edit Direct Payment Log Modal */}
          <CModal visible={showEditLogModal} onClose={closeEditLogModal} backdrop="static" size="lg">
            <CModalHeader onClose={closeEditLogModal}>
              <CModalTitle>Edit Direct Payment Log</CModalTitle>
            </CModalHeader>
            <CModalBody>
              {editingLog && (
                <div>
                  <div className="mb-3 p-3 bg-light rounded">
                    <h6>Editing Payment Log</h6>
                    <p className="mb-0">
                      Original Amount: ₹{parseFloat(editingLog.amount).toFixed(2)} on {new Date(editingLog.payment_date).toLocaleDateString()}
                      <br />
                      Original Payment Type: {getPaymentTypeLabel(editingLog.payment_type)}
                    </p>
                  </div>

                  <CRow>
                    <CCol md={6}>
                      <div className="mb-3">
                        <label className="form-label">Payment Amount *</label>
                        <CFormInput
                          type="number"
                          value={editLogAmount}
                          onChange={(e) => setEditLogAmount(e.target.value)}
                          placeholder="Enter payment amount"
                          step="0.01"
                          min="0.01"
                        />
                      </div>
                    </CCol>
                    <CCol md={6}>
                      <div className="mb-3">
                        <label className="form-label">Payment Date *</label>
                        <CFormInput
                          type="date"
                          value={editLogDate}
                          onChange={(e) => setEditLogDate(e.target.value)}
                        />
                      </div>
                    </CCol>
                  </CRow>

                  <CRow>
                    <CCol md={6}>
                      <div className="mb-3">
                        <label className="form-label">Paid By *</label>
                        <CFormSelect
                          value={editLogPaidBy}
                          onChange={(e) => setEditLogPaidBy(e.target.value)}
                        >
                          <option value="">Select Payment By</option>
                          {receiver_bank.map((bank) => (
                            <option key={bank.value} value={bank.value}>{bank.label}</option>
                          ))}
                        </CFormSelect>
                      </div>
                    </CCol>
                    <CCol md={6}>
                      <div className="mb-3">
                        <label className="form-label">Payment Type *</label>
                        <CFormSelect
                          value={editLogPaymentType}
                          onChange={(e) => setEditLogPaymentType(e.target.value)}
                        >
                          {paymentTypes.map((type) => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                          ))}
                        </CFormSelect>
                      </div>
                    </CCol>
                  </CRow>

                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <CFormTextarea
                      rows="3"
                      value={editLogDescription}
                      onChange={(e) => setEditLogDescription(e.target.value)}
                      placeholder="Enter payment description (optional)"
                    />
                  </div>

                  {editLogError && (
                    <div className="alert alert-danger mt-3" role="alert">
                      {editLogError}
                    </div>
                  )}
                </div>
              )}
            </CModalBody>
            <CModalFooter>
              <CButton color="secondary" onClick={closeEditLogModal}>
                Cancel
              </CButton>
              <CButton color="primary" disabled={savingLogEdit} onClick={handleEditLogSubmit}>
                {savingLogEdit ? (
                  <>
                    <CSpinner size="sm" className="me-2" />
                    Updating...
                  </>
                ) : (
                  'Update Log'
                )}
              </CButton>
            </CModalFooter>
          </CModal>

          {/* Edit On Behalf Payment Log Modal */}
          <CModal visible={showEditOnBehalfLogModal} onClose={closeEditOnBehalfLogModal} backdrop="static" size="lg">
            <CModalHeader onClose={closeEditOnBehalfLogModal}>
              <CModalTitle>Edit On Behalf Payment Log</CModalTitle>
            </CModalHeader>
            <CModalBody>
              {editingOnBehalfLog && (
                <div>
                  <div className="mb-3 p-3 bg-light rounded">
                    <h6>Editing On Behalf Payment Log</h6>
                    <p className="mb-0">
                      Original Amount: ₹{parseFloat(editingOnBehalfLog.amount).toFixed(2)} on {new Date(editingOnBehalfLog.payment_date).toLocaleDateString()}
                      <br />
                      Original Payment Type: {getPaymentTypeLabel(editingOnBehalfLog.payment_type)}
                    </p>
                  </div>

                  <CRow>
                    <CCol md={6}>
                      <div className="mb-3">
                        <label className="form-label">Payment Amount *</label>
                        <CFormInput
                          type="number"
                          value={editOnBehalfLogAmount}
                          onChange={(e) => setEditOnBehalfLogAmount(e.target.value)}
                          placeholder="Enter payment amount"
                          step="0.01"
                          min="0.01"
                        />
                      </div>
                    </CCol>
                    <CCol md={6}>
                      <div className="mb-3">
                        <label className="form-label">Payment Date *</label>
                        <CFormInput
                          type="date"
                          value={editOnBehalfLogDate}
                          onChange={(e) => setEditOnBehalfLogDate(e.target.value)}
                        />
                      </div>
                    </CCol>
                  </CRow>

                  <CRow>
                    <CCol md={6}>
                      <div className="mb-3">
                        <label className="form-label">Paid By *</label>
                        <CFormSelect
                          value={editOnBehalfLogPaidBy}
                          onChange={(e) => setEditOnBehalfLogPaidBy(e.target.value)}
                        >
                          <option value="">Select Payment By</option>
                          {receiver_bank.map((bank) => (
                            <option key={bank.value} value={bank.value}>{bank.label}</option>
                          ))}
                        </CFormSelect>
                      </div>
                    </CCol>
                    <CCol md={6}>
                      <div className="mb-3">
                        <label className="form-label">Payment Type *</label>
                        <CFormSelect
                          value={editOnBehalfLogPaymentType}
                          onChange={(e) => setEditOnBehalfLogPaymentType(e.target.value)}
                        >
                          {paymentTypes.map((type) => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                          ))}
                        </CFormSelect>
                      </div>
                    </CCol>
                  </CRow>

                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <CFormTextarea
                      rows="3"
                      value={editOnBehalfLogDescription}
                      onChange={(e) => setEditOnBehalfLogDescription(e.target.value)}
                      placeholder="Enter payment description (optional)"
                    />
                  </div>

                  {editOnBehalfLogError && (
                    <div className="alert alert-danger mt-3" role="alert">
                      {editOnBehalfLogError}
                    </div>
                  )}
                </div>
              )}
            </CModalBody>
            <CModalFooter>
              <CButton color="secondary" onClick={closeEditOnBehalfLogModal}>
                Cancel
              </CButton>
              <CButton color="primary" disabled={savingOnBehalfLogEdit} onClick={handleEditOnBehalfLogSubmit}>
                {savingOnBehalfLogEdit ? (
                  <>
                    <CSpinner size="sm" className="me-2" />
                    Updating...
                  </>
                ) : (
                  'Update Log'
                )}
              </CButton>
            </CModalFooter>
          </CModal>

          {/* Delete Confirmation Modal */}
          <CModal visible={showDeleteConfirm} onClose={closeDeleteConfirm} backdrop="static">
            <CModalHeader onClose={closeDeleteConfirm}>
              <CModalTitle>Confirm Delete</CModalTitle>
            </CModalHeader>
            <CModalBody>
              {deletingLog && (
                <div>
                  <p><strong>Are you sure you want to delete this {deletingLogType === 'onbehalf' ? 'on behalf ' : ''}payment log?</strong></p>
                  <div className="p-3 bg-light rounded">
                    <p className="mb-1"><strong>Amount:</strong> ₹{parseFloat(deletingLog.amount).toFixed(2)}</p>
                    <p className="mb-1"><strong>Date:</strong> {new Date(deletingLog.payment_date).toLocaleDateString()}</p>
                    <p className="mb-1"><strong>Paid By:</strong> {deletingLog.paid_by}</p>
                    <p className="mb-1"><strong>Payment Type:</strong> {getPaymentTypeLabel(deletingLog.payment_type)}</p>
                    <p className="mb-0"><strong>Description:</strong> {deletingLog.description || 'N/A'}</p>
                  </div>
                  <div className="alert alert-warning mt-3">
                    <small>
                      <strong>Warning:</strong> This action cannot be undone. The vendor payment totals will be recalculated automatically.
                    </small>
                  </div>

                  {deleteLogError && (
                    <div className="alert alert-danger mt-3" role="alert">
                      {deleteLogError}
                    </div>
                  )}
                </div>
              )}
            </CModalBody>
            <CModalFooter>
              <CButton color="secondary" onClick={closeDeleteConfirm}>
                Cancel
              </CButton>
              <CButton color="danger" disabled={deletingLogId} onClick={handleDeleteLog}>
                {deletingLogId ? (
                  <>
                    <CSpinner size="sm" className="me-2" />
                    Deleting...
                  </>
                ) : (
                  'Delete Log'
                )}
              </CButton>
            </CModalFooter>
          </CModal>
        </CCardBody>
      </CCard>
      <ProjectSelectionModal
        visible={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        onSelectProject={handleProjectChange}
      />
    </div>
  );
};

export default VendorPaymentReport;