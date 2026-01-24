import React, { useState, useEffect, useRef } from 'react';
import {
  CCard,
  CCardHeader,
  CCardBody,
  CButton,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormInput,
  CFormSelect,
  CFormTextarea,
  CFormLabel,
  CRow,
  CCol,
  CAlert,
  CSpinner,
  CBadge,
  CInputGroup,
  CInputGroupText
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilPlus, cilPencil, cilTrash, cilCloudDownload, cilSwapHorizontal, cilX, cilFile, cilCalendar, cilSearch } from '@coreui/icons';
import { getAPICall, post, put, deleteAPICall } from '../../../util/api';
import { receiver_bank } from '../../../util/Feilds';
import { generateTransferReportPDF } from './transferReportGenerator';

const InternalMoneyTransfer = () => {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('');
  const [showAlert, setShowAlert] = useState(false);

  // Filter states
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterAccount, setFilterAccount] = useState('');
  const [filterProject, setFilterProject] = useState('');

  // Transfer Modal
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [editingTransfer, setEditingTransfer] = useState(null);
  const [projectId, setProjectId] = useState('');
  const [projectName, setProjectName] = useState('');
  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [transferDate, setTransferDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [showCustomToAccount, setShowCustomToAccount] = useState(false);
  const [customToAccount, setCustomToAccount] = useState('');
  const [savingTransfer, setSavingTransfer] = useState(false);

  // Project search - Enhanced
  const [allProjects, setAllProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Delete Confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingTransfer, setDeletingTransfer] = useState(null);
  const [deletingTransferId, setDeletingTransferId] = useState(false);

  // Download Modal states
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadAccount, setDownloadAccount] = useState('all');
  const [downloadStartDate, setDownloadStartDate] = useState('');
  const [downloadEndDate, setDownloadEndDate] = useState('');
  const [downloadError, setDownloadError] = useState('');
  const [downloadLoading, setDownloadLoading] = useState(false);

  useEffect(() => {
    fetchTransfers();
  }, [filterStartDate, filterEndDate, filterAccount, filterProject]);

  // Load all projects when dropdown is opened
  useEffect(() => {
    if (showDropdown && allProjects.length === 0) {
      fetchAllProjects();
    }
  }, [showDropdown]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && 
          inputRef.current && !inputRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showTempAlert = (message, type) => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 5000);
  };

  const fetchAllProjects = async () => {
    setLoadingProjects(true);
    try {
      // Fetch all projects without search query
      const response = await getAPICall('/api/projects');
      setAllProjects(response || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setAllProjects([]);
      showTempAlert('Failed to load projects', 'warning');
    } finally {
      setLoadingProjects(false);
    }
  };

  const fetchTransfers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStartDate) params.append('start_date', filterStartDate);
      if (filterEndDate) params.append('end_date', filterEndDate);
      if (filterAccount) params.append('account', filterAccount);
      if (filterProject) params.append('project_id', filterProject);

      const response = await getAPICall(`/api/internal-money-transfers?${params.toString()}`);
      setTransfers(response || []);
    } catch (error) {
      console.error('Error fetching transfers:', error);
      showTempAlert('Failed to fetch internal money transfers', 'danger');
      setTransfers([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = () => {
    const accountSummary = {};
    
    transfers.forEach(transfer => {
      if (!accountSummary[transfer.from_account]) {
        accountSummary[transfer.from_account] = {
          account: transfer.from_account,
          total_out: 0,
          total_in: 0,
          net: 0
        };
      }
      accountSummary[transfer.from_account].total_out += parseFloat(transfer.amount);

      if (!accountSummary[transfer.to_account]) {
        accountSummary[transfer.to_account] = {
          account: transfer.to_account,
          total_out: 0,
          total_in: 0,
          net: 0
        };
      }
      accountSummary[transfer.to_account].total_in += parseFloat(transfer.amount);
    });

    Object.values(accountSummary).forEach(data => {
      data.net = data.total_in - data.total_out;
    });

    return {
      summary: Object.values(accountSummary),
      total_transfers: transfers.length,
      total_amount: transfers.reduce((sum, t) => sum + parseFloat(t.amount), 0)
    };
  };

  const summaryData = calculateSummary();

  const openTransferModal = (transfer = null) => {
    if (transfer) {
      setEditingTransfer(transfer);
      setProjectId(transfer.project_id || '');
      setProjectName(transfer.project?.project_name || '');
      setSearchQuery(transfer.project?.project_name || '');
      setFromAccount(transfer.from_account);
      setToAccount(transfer.to_account);
      setAmount(transfer.amount.toString());
      setTransferDate(transfer.transfer_date.split('T')[0]);
      setDescription(transfer.description || '');
      setReferenceNumber(transfer.reference_number || '');
      
      const isCustom = !receiver_bank.some(bank => bank.value === transfer.to_account);
      setShowCustomToAccount(isCustom);
      if (isCustom) {
        setCustomToAccount(transfer.to_account);
      }
    } else {
      setEditingTransfer(null);
      setProjectId('');
      setProjectName('');
      setSearchQuery('');
      setFromAccount('');
      setToAccount('');
      setAmount('');
      setTransferDate(new Date().toISOString().split('T')[0]);
      setDescription('');
      setReferenceNumber('');
      setShowCustomToAccount(false);
      setCustomToAccount('');
    }
    setShowTransferModal(true);
    setShowDropdown(false);
  };

  const closeTransferModal = () => {
    setShowTransferModal(false);
    setEditingTransfer(null);
    setShowDropdown(false);
    setAllProjects([]);
  };

  const handleProjectChange = (project) => {
    setProjectId(project.id);
    setProjectName(project.project_name);
    setSearchQuery(project.project_name);
    setShowDropdown(false);
  };

  const clearProject = () => {
    setProjectId('');
    setProjectName('');
    setSearchQuery('');
    setShowDropdown(false);
  };

  const handleInputFocus = () => {
    setShowDropdown(true);
    if (allProjects.length === 0) {
      fetchAllProjects();
    }
  };

  const handleFromAccountChange = (value) => {
    setFromAccount(value);
    if (value === toAccount) {
      setToAccount('');
    }
  };

  const handleToAccountChange = (value) => {
    if (value === 'custom') {
      setShowCustomToAccount(true);
      setToAccount('');
    } else {
      setShowCustomToAccount(false);
      setCustomToAccount('');
      setToAccount(value);
    }
  };

  const getAvailableToAccounts = () => {
    if (!fromAccount) return [];
    return receiver_bank.filter(bank => bank.value !== fromAccount);
  };

  const handleTransferSubmit = async () => {
    const finalToAccount = showCustomToAccount ? customToAccount : toAccount;

    if (!fromAccount || !finalToAccount || !amount || !transferDate) {
      showTempAlert('Please fill all required fields', 'danger');
      return;
    }

    if (fromAccount === finalToAccount) {
      showTempAlert('From and To accounts must be different', 'danger');
      return;
    }

    if (parseFloat(amount) <= 0) {
      showTempAlert('Amount must be greater than 0', 'danger');
      return;
    }

    setSavingTransfer(true);

    const payload = {
      project_id: projectId || null,
      from_account: fromAccount,
      to_account: finalToAccount,
      amount: parseFloat(amount),
      transfer_date: transferDate,
      description: description || null,
      reference_number: referenceNumber || null
    };

    try {
      if (editingTransfer) {
        await put(`/api/internal-money-transfers/${editingTransfer.id}`, payload);
        showTempAlert('Transfer updated successfully!', 'success');
      } else {
        await post('/api/internal-money-transfers', payload);
        showTempAlert('Transfer recorded successfully!', 'success');
      }
      
      closeTransferModal();
      fetchTransfers();
    } catch (error) {
      console.error('Transfer error:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to save transfer';
      showTempAlert(errorMessage, 'danger');
    } finally {
      setSavingTransfer(false);
    }
  };

  const openDeleteConfirm = (transfer) => {
    setDeletingTransfer(transfer);
    setShowDeleteConfirm(true);
  };

  const closeDeleteConfirm = () => {
    setShowDeleteConfirm(false);
    setDeletingTransfer(null);
  };

  const handleDeleteTransfer = async () => {
    if (!deletingTransfer) return;

    setDeletingTransferId(true);

    try {
      await deleteAPICall(`/api/internal-money-transfers/${deletingTransfer.id}`);
      showTempAlert('Transfer deleted successfully!', 'success');
      closeDeleteConfirm();
      fetchTransfers();
    } catch (error) {
      console.error('Delete error:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to delete transfer';
      showTempAlert(errorMessage, 'danger');
    } finally {
      setDeletingTransferId(false);
    }
  };

  const openDownloadModal = () => {
    setDownloadAccount('all');
    setDownloadStartDate('');
    setDownloadEndDate('');
    setDownloadError('');
    setShowDownloadModal(true);
  };

  const closeDownloadModal = () => {
    setShowDownloadModal(false);
    setDownloadAccount('all');
    setDownloadStartDate('');
    setDownloadEndDate('');
    setDownloadError('');
  };

  const handleAccountChange = (value) => {
    setDownloadAccount(value);
    setDownloadStartDate('');
    setDownloadEndDate('');
    setDownloadError('');
  };

  const handleDownloadSubmit = async () => {
    if (!downloadStartDate || !downloadEndDate) {
      setDownloadError('Please select both start and end dates');
      return;
    }

    if (new Date(downloadStartDate) > new Date(downloadEndDate)) {
      setDownloadError('Start date cannot be after end date');
      return;
    }

    setDownloadError('');
    setDownloadLoading(true);

    try {
      await generateTransferReportPDF(downloadStartDate, downloadEndDate, downloadAccount);
      showTempAlert('PDF report downloaded successfully!', 'success');
      closeDownloadModal();
    } catch (error) {
      console.error('Download error:', error);
      setDownloadError(error.message || 'Failed to generate PDF report');
      showTempAlert('Failed to generate PDF report', 'danger');
    } finally {
      setDownloadLoading(false);
    }
  };

  const setQuickRange = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    
    setDownloadStartDate(start.toISOString().split('T')[0]);
    setDownloadEndDate(end.toISOString().split('T')[0]);
    setDownloadError('');
  };

  const setCurrentMonth = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    setDownloadStartDate(start.toISOString().split('T')[0]);
    setDownloadEndDate(end.toISOString().split('T')[0]);
    setDownloadError('');
  };

  const setLastMonth = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    
    setDownloadStartDate(start.toISOString().split('T')[0]);
    setDownloadEndDate(end.toISOString().split('T')[0]);
    setDownloadError('');
  };

  const setCurrentYear = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const end = new Date(now.getFullYear(), 11, 31);
    
    setDownloadStartDate(start.toISOString().split('T')[0]);
    setDownloadEndDate(end.toISOString().split('T')[0]);
    setDownloadError('');
  };

  const setLastYear = () => {
    const now = new Date();
    const start = new Date(now.getFullYear() - 1, 0, 1);
    const end = new Date(now.getFullYear() - 1, 11, 31);
    
    setDownloadStartDate(start.toISOString().split('T')[0]);
    setDownloadEndDate(end.toISOString().split('T')[0]);
    setDownloadError('');
  };

  const setCurrentQuarter = () => {
    const now = new Date();
    const quarter = Math.floor(now.getMonth() / 3);
    const start = new Date(now.getFullYear(), quarter * 3, 1);
    const end = new Date(now.getFullYear(), quarter * 3 + 3, 0);
    
    setDownloadStartDate(start.toISOString().split('T')[0]);
    setDownloadEndDate(end.toISOString().split('T')[0]);
    setDownloadError('');
  };

  const setAllTime = () => {
    const end = new Date();
    const start = new Date();
    start.setFullYear(start.getFullYear() - 5);
    
    setDownloadStartDate(start.toISOString().split('T')[0]);
    setDownloadEndDate(end.toISOString().split('T')[0]);
    setDownloadError('');
  };

  const getAccountLabel = (accountValue) => {
    const account = receiver_bank.find(bank => bank.value === accountValue);
    return account ? account.label : accountValue;
  };

  const formatCurrency = (amount) => {
    return `Rs${parseFloat(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getUniqueAccounts = () => {
    const accounts = new Set();
    transfers.forEach(t => {
      accounts.add(t.from_account);
      accounts.add(t.to_account);
    });
    return Array.from(accounts);
  };

  const getUniqueProjects = () => {
    const projects = new Map();
    transfers.forEach(t => {
      if (t.project_id && t.project) {
        projects.set(t.project_id, t.project.project_name);
      }
    });
    return Array.from(projects.entries()).map(([id, name]) => ({ id, name }));
  };

  const filteredProjects = (allProjects || []).filter(p =>
    (p?.project_name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container-fluid py-2">
      <CCard>
        <CCardHeader className="bg-primary text-white d-flex justify-content-between align-items-center flex-column flex-md-row gap-2 pb-3 pt-3">
          <h5 className="mb-0">Internal Money Transfer Management</h5>
          <div className="d-flex gap-2">
            <CButton color="success" size="sm" onClick={() => openTransferModal()}>
              <CIcon icon={cilPlus} className="me-1" />
              New Transfer
            </CButton>
            <CButton color="light" size="sm" onClick={openDownloadModal}>
              <CIcon icon={cilCloudDownload} className="me-1" />
              Download Report
            </CButton>
          </div>
        </CCardHeader>
        <CCardBody>
          {showAlert && (
            <CAlert color={alertType} dismissible onClose={() => setShowAlert(false)}>
              {alertMessage}
            </CAlert>
          )}

          {/* Filters */}
          <CRow className="mb-4">
            <CCol xs={12} md={3}>
              <CFormLabel>Start Date</CFormLabel>
              <CFormInput
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
              />
            </CCol>
            <CCol xs={12} md={3}>
              <CFormLabel>End Date</CFormLabel>
              <CFormInput
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
              />
            </CCol>
            <CCol xs={12} md={2}>
              <CFormLabel>Filter by Account</CFormLabel>
              <CFormSelect
                value={filterAccount}
                onChange={(e) => setFilterAccount(e.target.value)}
              >
                <option value="">All Accounts</option>
                {receiver_bank.map((bank) => (
                  <option key={bank.value} value={bank.value}>{bank.label}</option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol xs={12} md={2}>
              <CFormLabel>Filter by Project</CFormLabel>
              <CFormSelect
                value={filterProject}
                onChange={(e) => setFilterProject(e.target.value)}
              >
                <option value="">All Projects</option>
                {getUniqueProjects().map((project) => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol xs={12} md={2} className="d-flex align-items-end">
              <CButton
                color="secondary"
                className="w-100"
                onClick={() => {
                  setFilterStartDate('');
                  setFilterEndDate('');
                  setFilterAccount('');
                  setFilterProject('');
                }}
              >
                Clear Filters
              </CButton>
            </CCol>
          </CRow>

          {/* Transfers Table */}
          {loading ? (
            <div className="text-center py-4">
              <CSpinner />
              <p className="mt-2">Loading transfers...</p>
            </div>
          ) : transfers.length > 0 ? (
            <div className="table-responsive">
              <CTable striped hover responsive>
                <CTableHead color="primary">
                  <CTableRow>
                    <CTableHeaderCell>Date</CTableHeaderCell>
                    <CTableHeaderCell>Project</CTableHeaderCell>
                    <CTableHeaderCell>From Account</CTableHeaderCell>
                    <CTableHeaderCell>To Account</CTableHeaderCell>
                    <CTableHeaderCell>Amount</CTableHeaderCell>
                    <CTableHeaderCell>Reference Number</CTableHeaderCell>
                    <CTableHeaderCell>Description</CTableHeaderCell>
                    <CTableHeaderCell>Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {transfers.map((transfer) => (
                    <CTableRow key={transfer.id}>
                      <CTableDataCell>{formatDate(transfer.transfer_date)}</CTableDataCell>
                      <CTableDataCell>
                        {transfer.project ? (
                          <CBadge color="primary">{transfer.project.project_name}</CBadge>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </CTableDataCell>
                      <CTableDataCell>
                        <CBadge color="info">{getAccountLabel(transfer.from_account)}</CBadge>
                      </CTableDataCell>
                      <CTableDataCell>
                        <CBadge color="success">{getAccountLabel(transfer.to_account)}</CBadge>
                      </CTableDataCell>
                      <CTableDataCell className="fw-bold">{formatCurrency(transfer.amount)}</CTableDataCell>
                      <CTableDataCell>{transfer.reference_number || '-'}</CTableDataCell>
                      <CTableDataCell>{transfer.description || '-'}</CTableDataCell>
                      <CTableDataCell>
                        <div className="d-flex gap-2">
                          <CButton
                            color="warning"
                            size="sm"
                            onClick={() => openTransferModal(transfer)}
                          >
                            <CIcon icon={cilPencil} />
                          </CButton>
                          <CButton
                            color="danger"
                            size="sm"
                            onClick={() => openDeleteConfirm(transfer)}
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
            <div className="text-center py-5">
              <CIcon icon={cilSwapHorizontal} size="3xl" className="text-muted mb-3" />
              <h5 className="text-muted">No transfers found</h5>
              <p className="text-muted">
                {filterStartDate || filterEndDate || filterAccount || filterProject
                  ? 'Try adjusting your filters'
                  : 'Click "New Transfer" to record your first transfer'}
              </p>
            </div>
          )}

          {/* Transfer Modal */}
          <CModal visible={showTransferModal} onClose={closeTransferModal} backdrop="static" size="lg" scrollable>
            <CModalHeader onClose={closeTransferModal}>
              <CModalTitle>
                {editingTransfer ? 'Edit Transfer' : 'New Transfer'}
              </CModalTitle>
            </CModalHeader>
            <CModalBody>
              {/* Project Selection - Enhanced Searchable Dropdown */}
              <CRow>
                <CCol xs={12}>
                  <div className="mb-3" style={{ position: 'relative' }}>
                    <CFormLabel>Project</CFormLabel>
                    <CInputGroup>
                      <CInputGroupText>
                        <CIcon icon={cilSearch} />
                      </CInputGroupText>
                      <CFormInput
                        ref={inputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={handleInputFocus}
                        placeholder="Click to select or search projects..."
                        autoComplete="off"
                      />
                      {projectName && (
                        <CButton
                          type="button"
                          color="danger"
                          variant="outline"
                          onClick={clearProject}
                        >
                          <CIcon icon={cilX} />
                        </CButton>
                      )}
                    </CInputGroup>
                    
                    {/* Enhanced Dropdown */}
                    {showDropdown && (
                      <div
                        ref={dropdownRef}
                        className="border rounded bg-white mt-1 shadow"
                        style={{
                          maxHeight: '300px',
                          overflowY: 'auto',
                          position: 'absolute',
                          zIndex: 1050,
                          width: '100%',
                          top: '100%'
                        }}
                      >
                        {loadingProjects ? (
                          <div className="p-3 text-center">
                            <CSpinner size="sm" className="me-2" />
                            <span>Loading projects...</span>
                          </div>
                        ) : filteredProjects.length > 0 ? (
                          <>
                            <div className="p-2 bg-light border-bottom sticky-top">
                              <small className="text-muted fw-bold">
                                {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''} found
                              </small>
                            </div>
                            {filteredProjects.map((project) => (
                              <div
                                key={project.id}
                                className="p-3 border-bottom cursor-pointer"
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleProjectChange(project)}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8f9fa')}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
                              >
                                <div className="fw-medium text-primary">{project.project_name}</div>
                                <div className="d-flex justify-content-between align-items-center mt-1">
                                  {project.project_cost && (
                                    <small className="text-muted">
                                      Cost: ₹{parseFloat(project.project_cost).toLocaleString('en-IN')}
                                    </small>
                                  )}
                                  {project.client_name && (
                                    <small className="text-muted">
                                      Client: {project.client_name}
                                    </small>
                                  )}
                                </div>
                              </div>
                            ))}
                          </>
                        ) : (
                          <div className="p-3 text-center text-muted">
                            {searchQuery ? 'No projects found matching your search' : 'No projects available'}
                          </div>
                        )}
                      </div>
                    )}

                    {projectName && (
                      <div className="mt-2 p-2 bg-light border rounded">
                        <small className="text-success fw-bold">✓ Selected Project:</small>
                        <div className="fw-medium">{projectName}</div>
                      </div>
                    )}
                  </div>
                </CCol>
              </CRow>

              <CRow>
                <CCol xs={12} md={6}>
                  <div className="mb-3">
                    <CFormLabel>From Account <span className="text-danger">*</span></CFormLabel>
                    <CFormSelect
                      value={fromAccount}
                      onChange={(e) => handleFromAccountChange(e.target.value)}
                    >
                      <option value="">Select Account</option>
                      {receiver_bank.map((bank) => (
                        <option key={bank.value} value={bank.value}>{bank.label}</option>
                      ))}
                    </CFormSelect>
                  </div>
                </CCol>
                <CCol xs={12} md={6}>
                  <div className="mb-3">
                    <CFormLabel>To Account <span className="text-danger">*</span></CFormLabel>
                    <CFormSelect
                      value={showCustomToAccount ? 'custom' : toAccount}
                      onChange={(e) => handleToAccountChange(e.target.value)}
                      disabled={!fromAccount}
                    >
                      <option value="">Select Account</option>
                      {getAvailableToAccounts().map((bank) => (
                        <option key={bank.value} value={bank.value}>{bank.label}</option>
                      ))}
                      <option value="custom">Custom Account</option>
                    </CFormSelect>
                  </div>
                </CCol>
              </CRow>

              {showCustomToAccount && (
                <CRow>
                  <CCol xs={12}>
                    <div className="mb-3">
                      <CFormLabel>Custom Account Name <span className="text-danger">*</span></CFormLabel>
                      <CFormInput
                        type="text"
                        value={customToAccount}
                        onChange={(e) => setCustomToAccount(e.target.value)}
                        placeholder="Enter custom account name"
                      />
                    </div>
                  </CCol>
                </CRow>
              )}

              <CRow>
                <CCol xs={12} md={6}>
                  <div className="mb-3">
                    <CFormLabel>Amount <span className="text-danger">*</span></CFormLabel>
                    <CFormInput
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Enter amount"
                      step="0.01"
                      min="0.01"
                    />
                  </div>
                </CCol>
                <CCol xs={12} md={6}>
                  <div className="mb-3">
                    <CFormLabel>Transfer Date <span className="text-danger">*</span></CFormLabel>
                    <CFormInput
                      type="date"
                      value={transferDate}
                      onChange={(e) => setTransferDate(e.target.value)}
                    />
                  </div>
                </CCol>
              </CRow>

              <CRow>
                <CCol xs={12}>
                  <div className="mb-3">
                    <CFormLabel>Reference Number</CFormLabel>
                    <CFormInput
                      type="text"
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                      placeholder="Enter reference/transaction number"
                    />
                  </div>
                </CCol>
              </CRow>

              <CRow>
                <CCol xs={12}>
                  <div className="mb-3">
                    <CFormLabel>Description</CFormLabel>
                    <CFormTextarea
                      rows="3"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter transfer description (optional)"
                    />
                  </div>
                </CCol>
              </CRow>
            </CModalBody>
            <CModalFooter className="d-flex justify-content-between">
              <CButton color="secondary" onClick={closeTransferModal}>
                Cancel
              </CButton>
              <CButton color="primary" disabled={savingTransfer} onClick={handleTransferSubmit}>
                {savingTransfer ? (
                  <>
                    <CSpinner size="sm" className="me-2" />
                    Saving...
                  </>
                ) : (
                  editingTransfer ? 'Update Transfer' : 'Record Transfer'
                )}
              </CButton>
            </CModalFooter>
          </CModal>

          {/* Download Modal */}
          <CModal visible={showDownloadModal} onClose={closeDownloadModal} backdrop="static" size="lg" scrollable>
            <CModalHeader onClose={closeDownloadModal}>
              <CModalTitle>
                <CIcon icon={cilCalendar} className="me-2" />
                Select Date Range for Transfer Report
              </CModalTitle>
            </CModalHeader>
            
            <CModalBody>
              {downloadError && (
                <CAlert color="danger" dismissible onClose={() => setDownloadError('')}>
                  {downloadError}
                </CAlert>
              )}

              <div className="mb-4">
                <CFormLabel className="fw-bold">
                  Select Account <span className="text-danger">*</span>
                </CFormLabel>
                <CFormSelect
                  value={downloadAccount}
                  onChange={(e) => handleAccountChange(e.target.value)}
                >
                  <option value="all">All Accounts</option>
                  {receiver_bank.map((bank) => (
                    <option key={bank.value} value={bank.value}>{bank.label}</option>
                  ))}
                </CFormSelect>
              </div>

              <div className="mb-4">
                <h6 className="mb-3">📅 Custom Date Range</h6>
                <CRow>
                  <CCol xs={12} md={6} className="mb-3 mb-md-0">
                    <CFormLabel htmlFor="downloadStartDate" className="fw-bold">
                      Start Date <span className="text-danger">*</span>
                    </CFormLabel>
                    <CFormInput
                      type="date"
                      id="downloadStartDate"
                      value={downloadStartDate}
                      onChange={(e) => {
                        setDownloadStartDate(e.target.value);
                        setDownloadError('');
                      }}
                      max={downloadEndDate || undefined}
                      disabled={downloadAccount === ''}
                    />
                  </CCol>
                  <CCol xs={12} md={6}>
                    <CFormLabel htmlFor="downloadEndDate" className="fw-bold">
                      End Date <span className="text-danger">*</span>
                    </CFormLabel>
                    <CFormInput
                      type="date"
                      id="downloadEndDate"
                      value={downloadEndDate}
                      onChange={(e) => {
                        setDownloadEndDate(e.target.value);
                        setDownloadError('');
                      }}
                      min={downloadStartDate || undefined}
                      disabled={downloadAccount === ''}
                    />
                  </CCol>
                </CRow>
              </div>

              <div className="mb-3">
                <h6 className="mb-3">⚡ Quick Select:</h6>
                
                <div className="mb-3">
                  <small className="text-muted d-block mb-2 fw-bold">Days:</small>
                  <div className="d-flex flex-wrap gap-2">
                    <CButton size="sm" color="secondary" variant="outline" onClick={() => setQuickRange(7)} disabled={downloadAccount === ''}>
                      Last 7 Days
                    </CButton>
                    <CButton size="sm" color="secondary" variant="outline" onClick={() => setQuickRange(15)} disabled={downloadAccount === ''}>
                      Last 15 Days
                    </CButton>
                    <CButton size="sm" color="secondary" variant="outline" onClick={() => setQuickRange(30)} disabled={downloadAccount === ''}>
                      Last 30 Days
                    </CButton>
                    <CButton size="sm" color="secondary" variant="outline" onClick={() => setQuickRange(90)} disabled={downloadAccount === ''}>
                      Last 90 Days
                    </CButton>
                  </div>
                </div>

                <div className="mb-3">
                  <small className="text-muted d-block mb-2 fw-bold">Months:</small>
                  <div className="d-flex flex-wrap gap-2">
                    <CButton size="sm" color="info" variant="outline" onClick={setCurrentMonth} disabled={downloadAccount === ''}>
                      Current Month
                    </CButton>
                    <CButton size="sm" color="info" variant="outline" onClick={setLastMonth} disabled={downloadAccount === ''}>
                      Last Month
                    </CButton>
                  </div>
                </div>

                <div className="mb-3">
                  <small className="text-muted d-block mb-2 fw-bold">Quarters & Years:</small>
                  <div className="d-flex flex-wrap gap-2">
                    <CButton size="sm" color="warning" variant="outline" onClick={setCurrentQuarter} disabled={downloadAccount === ''}>
                      Current Quarter
                    </CButton>
                    <CButton size="sm" color="warning" variant="outline" onClick={setCurrentYear} disabled={downloadAccount === ''}>
                      Current Year
                    </CButton>
                    <CButton size="sm" color="warning" variant="outline" onClick={setLastYear} disabled={downloadAccount === ''}>
                      Last Year
                    </CButton>
                  </div>
                </div>

                <div>
                  <small className="text-muted d-block mb-2 fw-bold">All Time:</small>
                  <div className="d-flex flex-wrap gap-2">
                    <CButton size="sm" color="dark" variant="outline" onClick={setAllTime} disabled={downloadAccount === ''}>
                      All Time (Last 5 Years)
                    </CButton>
                  </div>
                </div>
              </div>

              {downloadStartDate && downloadEndDate && (
                <div className="alert alert-success mb-0">
                  <strong>✓ Selected Range:</strong> {formatDate(downloadStartDate)} to {formatDate(downloadEndDate)}
                  {downloadAccount !== 'all' && (
                    <div className="mt-1">
                      <strong>Account:</strong> {getAccountLabel(downloadAccount)}
                    </div>
                  )}
                </div>
              )}
            </CModalBody>

            <CModalFooter className="d-flex justify-content-between">
              <CButton color="secondary" onClick={closeDownloadModal}>
                <CIcon icon={cilX} className="me-1" />
                Cancel
              </CButton>
              <CButton 
                color="success" 
                onClick={handleDownloadSubmit}
                disabled={downloadLoading || !downloadStartDate || !downloadEndDate || downloadAccount === ''}
              >
                {downloadLoading ? (
                  <>
                    <CSpinner size="sm" className="me-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <CIcon icon={cilFile} className="me-1" />
                    Download Transfer Report
                  </>
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
              {deletingTransfer && (
                <div>
                  <p><strong>Are you sure you want to delete this transfer?</strong></p>
                  <div className="p-3 bg-light rounded">
                    <p className="mb-1"><strong>Date:</strong> {formatDate(deletingTransfer.transfer_date)}</p>
                    {deletingTransfer.project && (
                      <p className="mb-1"><strong>Project:</strong> {deletingTransfer.project.project_name}</p>
                    )}
                    <p className="mb-1"><strong>From:</strong> {getAccountLabel(deletingTransfer.from_account)}</p>
                    <p className="mb-1"><strong>To:</strong> {getAccountLabel(deletingTransfer.to_account)}</p>
                    <p className="mb-1"><strong>Amount:</strong> {formatCurrency(deletingTransfer.amount)}</p>
                    <p className="mb-0"><strong>Reference:</strong> {deletingTransfer.reference_number || 'N/A'}</p>
                  </div>
                  <div className="alert alert-warning mt-3 mb-0">
                    <small>
                      <strong>Warning:</strong> This action cannot be undone.
                    </small>
                  </div>
                </div>
              )}
            </CModalBody>
            <CModalFooter className="d-flex justify-content-between">
              <CButton color="secondary" onClick={closeDeleteConfirm}>
                Cancel
              </CButton>
              <CButton color="danger" disabled={deletingTransferId} onClick={handleDeleteTransfer}>
                {deletingTransferId ? (
                  <>
                    <CSpinner size="sm" className="me-2" />
                    Deleting...
                  </>
                ) : (
                  'Delete Transfer'
                )}
              </CButton>
            </CModalFooter>
          </CModal>
        </CCardBody>
      </CCard>
    </div>
  );
};

export default InternalMoneyTransfer;