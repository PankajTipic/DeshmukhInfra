import React, { useEffect, useState, useCallback, useRef } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import { getAPICall, post, put } from "../../../util/api";
import { gst, receiver_bank, paymentTypes } from "../../../util/Feilds";
import { 
  CButton, CCard, CCardHeader, CCardBody, CCol, 
  CFormSelect, CFormInput, CInputGroup, CRow, 
  CSpinner, CAlert, CForm, CFormLabel 
} from '@coreui/react';
import { cilSearch, cilPlus, cilPencil, cilArrowLeft } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import 'bootstrap/dist/css/bootstrap.min.css';

const ProjectIncome = () => {
  const gst_percentage = gst;
  const location = useLocation();
  const navigate = useNavigate();

  // Form states
  const [formData, setFormData] = useState({
    project_id: '',
    po_no: '',
    po_date: '',
    invoice_no: '',
    invoice_date: '',
    basic_amount: '',
    gst_amount: '',
    billing_amount: '',
    received_amount: '',
    received_by: '',
    senders_bank: '',
    payment_type: '',
    receivers_bank: '',
    pending_amount: '',
    remark: ''
  });

  // Other states
  const [projects, setProjects] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedProjectName, setSelectedProjectName] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [fromInvoice, setFromInvoice] = useState(false);
  const [orderId, setOrderId] = useState(null);
  
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  const showAlertMessage = (message, type) => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 5000);
  };

  // Handle edit data from navigation state (including from invoice table)
  useEffect(() => {
    if (location.state?.income) {
      const income = location.state.income;
      
      // Check if this is coming from invoice table
      setFromInvoice(location.state.fromInvoice || false);
      setOrderId(location.state.orderId || null);
      
      setFormData({
        project_id: income.project_id,
        po_no: income.po_no || '',
        po_date: formatDateForInput(income.po_date),
        invoice_no: income.invoice_no || '',
        invoice_date: formatDateForInput(income.invoice_date),
        basic_amount: income.basic_amount?.toString() || '',
        gst_amount: income.gst_amount?.toString() || '',
        billing_amount: income.billing_amount?.toString() || '',
        received_amount: income.received_amount?.toString() || '',
        received_by: income.received_by || '',
        senders_bank: income.senders_bank || '',
        payment_type: income.payment_type || 'cash',
        receivers_bank: income.receivers_bank || '',
        pending_amount: income.pending_amount?.toString() || '0.00',
        remark: income.remark || ''
      });
      
      // Set project if available
      if (income.project_id) {
        const projectName = income.project_name || `Project ${income.project_id}`;
        setSearchQuery(projectName);
        setSelectedProjectId(income.project_id);
        setSelectedProjectName(projectName);
      }
      
      // Set editing state if not from invoice
      if (!location.state.fromInvoice && income.id) {
        setIsEditing(true);
        setEditingId(income.id);
      }
    }
  }, [location.state, allProjects]);

  // Fetch all projects initially
  const fetchAllProjects = useCallback(async () => {
    try {
      const response = await getAPICall('/api/projects');
      setAllProjects(response || []);
    } catch (error) {
      console.error('Error fetching all projects:', error);
      setAllProjects([]);
    }
  }, []);

  // Fetch projects with search query
  const fetchProjects = useCallback(async (query = '') => {
    try {
      const url = query 
        ? `/api/projects?searchQuery=${query}`
        : '/api/projects';
      const response = await getAPICall(url);
      setProjects(response || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
    }
  }, []);

  // Initialize component
  useEffect(() => {
    fetchAllProjects();
  }, [fetchAllProjects]);

  // Handle search with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length > 0 && showDropdown && !selectedProjectId) {
        fetchProjects(searchQuery);
      } else if (showDropdown && !selectedProjectId) {
        setProjects(allProjects);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchProjects, allProjects, showDropdown, selectedProjectId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProjectChange = (project) => {
    setSearchQuery(project.project_name);
    setSelectedProjectId(project.id);
    setSelectedProjectName(project.project_name);
    setFormData(prev => ({ ...prev, project_id: project.id }));
    setProjects([]);
    setShowDropdown(false);
    if (inputRef.current) inputRef.current.blur();
  };

  const handleInputFocus = () => {
    if (allProjects.length > 0 && !selectedProjectId) {
      setProjects(allProjects);
      setShowDropdown(true);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowDropdown(true);
    if (selectedProjectId && value !== selectedProjectName) {
      setSelectedProjectId('');
      setSelectedProjectName('');
      setFormData(prev => ({ ...prev, project_id: '' }));
    }
  };

  const handleFormInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'basic_amount') {
      const basicAmount = parseFloat(value) || 0;
      const gstAmount = (basicAmount * gst_percentage / 100);
      const billingAmount = basicAmount + gstAmount;
      
      setFormData(prev => ({ 
        ...prev, 
        [name]: value,
        gst_amount: gstAmount.toFixed(2),
        billing_amount: billingAmount.toFixed(2)
      }));

      const receivedAmount = parseFloat(formData.received_amount) || 0;
      if (receivedAmount > 0) {
        const pendingAmount = billingAmount - receivedAmount;
        setFormData(prev => ({ 
          ...prev, 
          pending_amount: pendingAmount > 0 ? pendingAmount.toFixed(2) : '0.00'
        }));
      }
    }
    else if (name === 'received_amount') {
      const billingAmount = parseFloat(formData.billing_amount) || 0;
      const receivedAmount = parseFloat(value) || 0;
      if (receivedAmount > billingAmount) {
        showAlertMessage('Received Amount cannot exceed Amount With GST', 'danger');
        setFormData(prev => ({ ...prev, [name]: billingAmount.toString() }));
        return;
      }
      const pendingAmount = billingAmount - receivedAmount;
      
      setFormData(prev => ({ 
        ...prev, 
        [name]: value,
        pending_amount: pendingAmount > 0 ? pendingAmount.toFixed(2) : '0.00'
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      project_id: '',
      po_no: '',
      po_date: '',
      invoice_no: '',
      invoice_date: '',
      basic_amount: '',
      gst_amount: '',
      billing_amount: '',
      received_amount: '',
      received_by: '',
      senders_bank: '',
      payment_type: '',
      receivers_bank: '',
      pending_amount: '',
      remark: ''
    });
    setSearchQuery('');
    setSelectedProjectId('');
    setSelectedProjectName('');
    setShowDropdown(false);
    setIsEditing(false);
    setEditingId(null);
    setFromInvoice(false);
    setOrderId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const billingAmount = parseFloat(formData.billing_amount) || 0;
    const receivedAmount = parseFloat(formData.received_amount) || 0;
    if (receivedAmount > billingAmount) {
      showAlertMessage('Received Amount cannot exceed Amount With GST', 'danger');
      return;
    }

    if (!formData.project_id) {
      showAlertMessage('Please select a project', 'danger');
      return;
    }

    setFormLoading(true);
    try {
      let response;
      if (isEditing) {
        response = await put(`/api/income/${editingId}`, formData);
      } else {
        response = await post('/api/income', formData);
      }
      
      if (response.message) {
        showAlertMessage(isEditing ? 'Income updated successfully!' : 'Income stored successfully!', 'success');
        
        // If this payment was recorded from an invoice, update the order's paid amount
        if (fromInvoice && orderId) {
          try {
            await post(`/api/recordPayment/${orderId}`, {
              received_amount: formData.received_amount,
              received_by: formData.received_by,
              payment_type: formData.payment_type,
              senders_bank: formData.senders_bank,
              receivers_bank: formData.receivers_bank,
              remark: formData.remark
            });
          } catch (error) {
            console.error('Error updating order payment:', error);
            // Don't show error to user as the income was recorded successfully
          }
        }
        
        // Navigate back based on context
        setTimeout(() => {
          if (fromInvoice) {
            navigate('/invoiceTable');
          } else {
            navigate('/incomeTable');
          }
        }, 1500);
      } else {
        showAlertMessage('Error saving income data', 'danger');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      showAlertMessage('Error saving income data', 'danger');
    } finally {
      setFormLoading(false);
    }
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const handleGoBack = () => {
    if (fromInvoice) {
      navigate('/invoiceTable');
    } else {
      navigate('/incomeTable');
    }
  };

  return (
    <div className="container-fluid py-4">
      <CCard className="mb-4">
        <CCardHeader className="bg-primary text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <CIcon icon={cilPlus} className="me-2" />
            {fromInvoice ? 'Record Payment' : (isEditing ? 'Edit Project Income' : 'Add Project Income')}
          </h5>
          <div className="d-flex gap-2">
            {(isEditing || fromInvoice) && (
              <CButton color="light" size="sm" onClick={handleGoBack}>
                <CIcon icon={cilArrowLeft} className="me-1" />
                {fromInvoice ? 'Back to Invoices' : 'Cancel'}
              </CButton>
            )}
          </div>
        </CCardHeader>
        <CCardBody>
          {fromInvoice && (
            <CAlert color="info" className="mb-3">
              <strong>Recording Payment:</strong> Fill in the payment details below. The order will be automatically updated once the payment is recorded.
            </CAlert>
          )}
          
          {showAlert && (
            <CAlert color={alertType} dismissible onClose={() => setShowAlert(false)}>
              {alertMessage}
            </CAlert>
          )}

          <CForm onSubmit={handleSubmit}>
            <CRow className="mb-3">
              <CCol md={4}>
                <CFormLabel htmlFor="project">Project *</CFormLabel>
                <div className="position-relative" ref={dropdownRef}>
                  <CInputGroup>
                    <CFormInput
                      ref={inputRef}
                      type="text"
                      value={searchQuery}
                      onChange={handleInputChange}
                      onFocus={handleInputFocus}
                      placeholder="Search and select project..."
                      className="border"
                      autoComplete="off"
                      required
                      disabled={fromInvoice} // Disable if coming from invoice
                    />
                    <CIcon 
                      icon={cilSearch} 
                      className="position-absolute" 
                      style={{ right: '10px', top: '50%', transform: 'translateY(-50%)', zIndex: 5, color: '#6c757d' }} 
                    />
                  </CInputGroup>

                  {showDropdown && projects.length > 0 && !fromInvoice && (
                    <div className="dropdown-menu show w-100" style={{ maxHeight: '200px', overflowY: 'auto', position: 'absolute', zIndex: 1000, marginTop: '2px' }}>
                      {projects.map((project) => (
                        <div
                          key={project.id}
                          className="dropdown-item cursor-pointer"
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
                      Selected: {selectedProjectName}
                    </div>
                  )}
                </div>
              </CCol>

              <CCol md={4}>
                <CFormLabel htmlFor="po_no">PO Number *</CFormLabel>
                <CFormInput
                  type="text"
                  name="po_no"
                  value={formData.po_no}
                  onChange={handleFormInputChange}
                  placeholder="Enter PO Number"
                  required
                />
              </CCol>

              <CCol md={4}>
                <CFormLabel htmlFor="po_date">PO Date *</CFormLabel>
                <CFormInput
                  type="date"
                  name="po_date"
                  value={formData.po_date}
                  onChange={handleFormInputChange}
                  required
                />
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={4}>
                <CFormLabel htmlFor="invoice_no">Invoice Number *</CFormLabel>
                <CFormInput
                  type="text"
                  name="invoice_no"
                  value={formData.invoice_no}
                  onChange={handleFormInputChange}
                  placeholder="Enter Invoice Number"
                  required
                />
              </CCol>

              <CCol md={4}>
                <CFormLabel htmlFor="invoice_date">Invoice Date *</CFormLabel>
                <CFormInput
                  type="date"
                  name="invoice_date"
                  value={formData.invoice_date}
                  onChange={handleFormInputChange}
                  required
                />
              </CCol>

              <CCol md={4}>
                <CFormLabel htmlFor="basic_amount">Amount Before GST*</CFormLabel>
                <CFormInput
                  type="number"
                  step="0.01"
                  name="basic_amount"
                  value={formData.basic_amount}
                  onChange={handleFormInputChange}
                  placeholder="Enter Basic Amount"
                  required
                />
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={4}>
                <CFormLabel htmlFor="gst_amount">GST Amount ({gst_percentage}%)</CFormLabel>
                <CFormInput
                  type="number"
                  step="0.01"
                  name="gst_amount"
                  value={formData.gst_amount}
                  onChange={handleFormInputChange}
                  placeholder="Auto-calculated"
                  disabled
                />
              </CCol>

              <CCol md={4}>
                <CFormLabel htmlFor="billing_amount">Amount With GST</CFormLabel>
                <CFormInput
                  type="number"
                  step="0.01"
                  name="billing_amount"
                  value={formData.billing_amount}
                  onChange={handleFormInputChange}
                  placeholder="Auto-calculated"
                  disabled
                />
              </CCol>

              <CCol md={4}>
                <CFormLabel htmlFor="received_amount">Received Amount *</CFormLabel>
                <CFormInput
                  type="number"
                  step="0.01"
                  name="received_amount"
                  value={formData.received_amount}
                  onChange={handleFormInputChange}
                  placeholder="Enter Received Amount"
                  required
                />
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={4}>
                <CFormLabel htmlFor="pending_amount">Pending Amount</CFormLabel>
                <CFormInput
                  type="number"
                  step="0.01"
                  name="pending_amount"
                  value={formData.pending_amount}
                  onChange={handleFormInputChange}
                  placeholder="Auto-calculated"
                  disabled
                />
              </CCol>

              <CCol md={4}>
                <CFormLabel htmlFor="received_by">Sent By *</CFormLabel>
                <CFormInput
                  type="text"
                  name="received_by"
                  value={formData.received_by}
                  onChange={handleFormInputChange}
                  placeholder="Enter Receiver Name"
                  required
                />
              </CCol>

              <CCol md={4}>
                <CFormLabel htmlFor="payment_type">Payment Type *</CFormLabel>
                <CFormSelect
                  name="payment_type"
                  value={formData.payment_type}
                  onChange={handleFormInputChange}
                  required
                >
                  <option value="">Select Payment Type</option>
                  {paymentTypes.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </CFormSelect>
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={4}>
                <CFormLabel htmlFor="senders_bank">Sender's Bank *</CFormLabel>
                <CFormInput
                  type="text"
                  name="senders_bank"
                  value={formData.senders_bank}
                  onChange={handleFormInputChange}
                  placeholder="Enter Sender's Bank"
                  required
                />
              </CCol>

              <CCol md={4}>
                <CFormLabel htmlFor="receivers_bank">Receiver's Bank *</CFormLabel>
                <CFormSelect
                  name="receivers_bank"
                  value={formData.receivers_bank}
                  onChange={handleFormInputChange}
                  required
                >
                  <option value="">Select Receiver's Bank</option>
                  {receiver_bank.map((bank) => (
                    <option key={bank.value} value={bank.value}>{bank.label}</option>
                  ))}
                </CFormSelect>
              </CCol>

              <CCol md={4}>
                <CFormLabel htmlFor="remark">Transaction Number</CFormLabel>
                <CFormInput
                  type="text"
                  name="remark"
                  value={formData.remark}
                  onChange={handleFormInputChange}
                  placeholder="Enter Transaction Number (optional)"
                />
              </CCol>
            </CRow>

            <CRow>
              <CCol md={12} className="d-flex gap-2">
                <CButton
                  type="submit"
                  color="primary"
                  disabled={formLoading}
                >
                  {formLoading ? (
                    <>
                      <CSpinner size="sm" className="me-2" />
                      {fromInvoice ? 'Recording Payment...' : (isEditing ? 'Updating...' : 'Saving...')}
                    </>
                  ) : (
                    <>
                      <CIcon icon={isEditing ? cilPencil : cilPlus} className="me-2" />
                      {fromInvoice ? 'Record Payment' : (isEditing ? 'Update Income' : 'Save Income')}
                    </>
                  )}
                </CButton>
                
                <CButton
                  type="button"
                  color="secondary"
                  onClick={handleGoBack}
                >
                  Cancel
                </CButton>
              </CCol>
            </CRow>
          </CForm>
        </CCardBody>
      </CCard>
    </div>
  );
};

export default ProjectIncome;