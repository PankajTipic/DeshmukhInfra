
import React, { useEffect, useState, useRef, useCallback } from 'react';
import './Invoice.css';
import {
  CAlert,
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CRow,
  CSpinner,
  CInputGroup,
  CInputGroupText,
  CFormSelect,
  CFormCheck,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormTextarea,
} from '@coreui/react';
import { cilArrowLeft, cilCart, cilChevronBottom, cilList, cilSearch, cilX, cilPlus, cilPencil } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import { getAPICall, post } from '../../../util/api';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../common/toast/ToastContext';
import { useTranslation } from 'react-i18next';
import ProjectSelectionModal from '../../common/ProjectSelectionModal';

const Invoice = ({ editMode = false, initialData = null, onSubmit = null }) => {
  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [showProjectModal, setShowProjectModal] = useState(false);

  const [allProjects, setAllProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [isModalSelection, setIsModalSelection] = useState(false);
  const projectInputRef = useRef(null);
  const dropdownRef = useRef(null);

  const [form, setForm] = useState({
    projectId: null,
    projectName: '',
    customer_id: null,
    customer_name: '',
    address: '',
    mobile_number: '',
    customer: { name: '', address: '', mobile: '' },
    invoiceType: 1, // Default: Quotation
    invoiceDate: new Date().toISOString().split('T')[0],
    deliveryDate: new Date().toISOString().split('T')[0],
    discount: 0,
    paidAmount: 0,
    subtotal: 0,
    taxableAmount: 0,
    gstAmount: 0,
    sgstAmount: 0,
    cgstAmount: 0,
    igstAmount: 0,
    finalAmount: 0,
    gstPercentage: 18,
    sgstPercentage: 9,
    cgstPercentage: 9,
    igstPercentage: 0,
    ref_id: '',
    po_number: '',
    gstOnGstMode: false,
    
  });

  //const [works, setWorks] = useState([{ work_type: '', uom: '', qty: 0, price: 0, total_price: 0, remark: '' }]);

  const [works, setWorks] = useState([{
  work_type: '',
  uom: '',
  qty: 0,
  price: 0,
  total_price: 0,           // ← This will now be: (qty × price) + CGST + SGST
  gst_percent: 18,          // customizable per row
  cgst_amount: 0,
  sgst_amount: 0,
  remark: ''
}]);

  // Modal state for adding new project
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [newProjectForm, setNewProjectForm] = useState({
    customer_name: '',
    mobile_number: '',
    project_name: '',
    work_place: '',
    // is_confirm: 0,
  });

  // Payment Terms
  const initialPaymentTerms = [
    '25% Advance release on team mobilization onsite.',
    '25% Release on completion of pile foundation.',
    '20% Release after completion of MMS and Module mounting.',
    '20% to be released on completion of AC/DC.',
    '10% released after work has been completed and handed over to the client.',
  ];
  const [paymentTerms, setPaymentTerms] = useState(initialPaymentTerms);
  const [editingPaymentIndex, setEditingPaymentIndex] = useState(-1);
  const [editingPaymentValue, setEditingPaymentValue] = useState('');
  const [newPaymentTerm, setNewPaymentTerm] = useState('');

  // Terms & Conditions
  const initialTermsAndConditions = [
    '18% Tax Extra',
    'ROW on your side',
    'Work will commence only after receiving an official work order',
  ];
  const [termsAndConditions, setTermsAndConditions] = useState(initialTermsAndConditions);
  const [editingConditionIndex, setEditingConditionIndex] = useState(-1);
  const [editingConditionValue, setEditingConditionValue] = useState('');
  const [newCondition, setNewCondition] = useState('');

  // Note
  const [note, setNote] = useState('');

  // Calculate remaining amount
  const calculateRemainingAmount = () => {
    return Math.max(0, form.finalAmount - form.paidAmount);
  };

  // Fetch projects with search functionality
  const fetchProjects = useCallback(async (query = '') => {
    setProjectsLoading(true);
    try {
      const endpoint = query ? `/api/projects?searchQuery=${encodeURIComponent(query)}` : '/api/projects';
      const resp = await getAPICall(endpoint);
      console.log('Fetched projects (raw):', resp);

      const data = Array.isArray(resp) ? resp : resp?.data;

      if (!data || !Array.isArray(data)) {
        console.log('Invalid API response - no data array');
        setAllProjects([]);
        if (!query) showToast('warning', 'No projects data available from server');
        return;
      }

      const validProjects = data
        .map((p) => ({
          id: p.id,
          project_name: p.project_name || 'Unknown Project',
          customer_name: p.customer_name || 'Unknown Customer',
          work_place: p.work_place || '',
          project_cost: p.project_cost || '0',
          mobile_number: p.mobile_number || '',
          gst_number: p.gst_number || '',
          remark: p.remark || '',
          customer_id: p.customer_id || p.id,
          customer: {
            name: p.customer_name || 'Unknown',
            address: p.work_place || 'N/A',
            mobile: p.mobile_number || 'N/A',
          },
          start_date: p.start_date,
          end_date: p.end_date,
        }))
        .filter((p) => p.project_name && p.customer_id);

      console.log('Transformed projects:', validProjects);
      setAllProjects(validProjects);

      if (validProjects.length === 0 && !query) {
        showToast('warning', 'No valid projects found - check API data');
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setAllProjects([]);
      if (!query) showToast('danger', 'Failed to fetch projects');
    } finally {
      setProjectsLoading(false);
    }
  }, []);

  // Initialize with initialData if in edit mode
  useEffect(() => {
    if (editMode && initialData) {
      setForm({
        projectId: initialData.projectId,
        projectName: initialData.projectName,
        customer_id: initialData.customer_id,
        customer_name: initialData.customer?.name || '',
        address: initialData.customer?.address || '',
        mobile_number: initialData.customer?.mobile || '',
        customer: initialData.customer,
        invoiceType: initialData.invoiceType,
        invoiceDate: initialData.invoiceDate,
        deliveryDate: initialData.deliveryDate || new Date().toISOString().split('T')[0],
        discount: initialData.discount || 0,
        paidAmount: initialData.paidAmount || 0,
        subtotal: initialData.subtotal || 0,
        taxableAmount: initialData.taxableAmount || 0,
        gstAmount: initialData.gstAmount || 0,
        sgstAmount: initialData.sgst || 0,
        cgstAmount: initialData.cgst || 0,
        igstAmount: initialData.igst || 0,
        finalAmount: initialData.finalAmount || 0,
        gstPercentage: initialData.gstPercentage || 18,
        sgstPercentage: initialData.sgstPercentage || 9,
        cgstPercentage: initialData.cgstPercentage || 9,
        igstPercentage: initialData.igstPercentage || 0,
        ref_id: initialData.ref_id,
        	po_number: initialData.po_number || '',
      });
      setWorks(initialData.items || [{ work_type: '', uom: '', qty: 0, price: 0, total_price: 0, remark: '' }]);
      setSearchQuery(initialData.projectName || '');
      calculateTotals(initialData.items || works);
      setPaymentTerms(initialData.payment_terms ? initialData.payment_terms.split('\n') : initialPaymentTerms);
      setTermsAndConditions(initialData.terms_and_conditions ? initialData.terms_and_conditions.split('\n') : initialTermsAndConditions);
      setNote(initialData.note || '');
    }
  }, [editMode, initialData]);

  // Initial fetch
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery && searchQuery.length > 2 && !isModalSelection && !form.projectId) {
        fetchProjects(searchQuery);
      } else {
        setAllProjects([]);
        setFilteredProjects([]);
        setShowDropdown(false);
      }
      setIsModalSelection(false); // Reset after handling
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchProjects, isModalSelection, form.projectId]);

  // Filter projects based on search query
  useEffect(() => {
    if (searchQuery && allProjects.length > 0 && !form.projectId) {
      const query = searchQuery.toLowerCase();
      const filtered = allProjects.filter((p) => {
        return (
          (p.project_name && p.project_name.toLowerCase().includes(query)) ||
          (p.customer_name && p.customer_name.toLowerCase().includes(query)) ||
          (p.work_place && p.work_place.toLowerCase().includes(query)) ||
          (p.mobile_number && p.mobile_number.includes(query)) ||
          (p.remark && p.remark.toLowerCase().includes(query))
        );
      });
      console.log('Filtered projects:', filtered, 'Query:', searchQuery);
      setFilteredProjects(filtered);
      setShowDropdown(filtered.length > 0 && searchQuery.length > 2 && !form.projectId);
    } else {
      setFilteredProjects([]);
      setShowDropdown(false);
    }
  }, [searchQuery, allProjects, form.projectId]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        projectInputRef.current &&
        !projectInputRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  // Handle project selection (used for both dropdown and modal)
  const handleProjectChange = (project) => {
    console.log('Selected project:', project);
    setForm((prev) => ({
      ...prev,
      projectId: project.id,
      projectName: project.project_name,
      customer_id: project.customer_id || project.id,
      customer_name: project.customer_name || project.customer?.name || '',
      address: project.work_place || project.location || '',
      mobile_number: project.mobile_number || project.customer?.mobile || '',
      customer: {
        name: project.customer_name || project.customer?.name || '',
        address: project.work_place || project.location || '',
        mobile: project.mobile_number || project.customer?.mobile || '',
      },
    }));
    setSearchQuery(project.project_name);
    setIsModalSelection(true);
    setShowDropdown(false);
    setAllProjects([]);
    setFilteredProjects([]);
  };

  const clearProject = () => {
    setForm((prev) => ({
      ...prev,
      projectId: null,
      projectName: '',
      customer_id: null,
      customer_name: '',
      address: '',
      mobile_number: '',
      customer: { name: '', address: '', mobile: '' },
    }));
    setSearchQuery('');
    setShowDropdown(false);
    setAllProjects([]);
    setFilteredProjects([]);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      let newForm = {
        ...prev,
        [name]: name === 'discount' || name === 'paidAmount' || name.endsWith('Percentage') ? parseFloat(value) || 0 : value,
      };

      if (name === 'gstPercentage') {
        const totalGST = parseFloat(value) || 0;
        const halfGST = totalGST / 2;
        newForm = {
          ...newForm,
          sgstPercentage: halfGST,
          cgstPercentage: halfGST,
        };
      } else if (name === 'sgstPercentage' || name === 'cgstPercentage') {
        const sgst = name === 'sgstPercentage' ? parseFloat(value) || 0 : prev.sgstPercentage;
        const cgst = name === 'cgstPercentage' ? parseFloat(value) || 0 : prev.cgstPercentage;
        newForm = {
          ...newForm,
          gstPercentage: sgst + cgst,
        };
      }

      if (name === 'discount' || name.endsWith('Percentage')) {
        const subtotal = works.reduce((sum, w) => sum + (w.total_price || 0), 0);
        const base = subtotal - newForm.discount;
        const sgstAmount = base * (newForm.sgstPercentage / 100);
        const cgstAmount = base * (newForm.cgstPercentage / 100);
        const igstAmount = base * (newForm.igstPercentage / 100);
        const gstAmount = sgstAmount + cgstAmount + igstAmount;
        const finalAmount = base + gstAmount;
        newForm = {
          ...newForm,
          subtotal,
          taxableAmount: base,
          gstAmount,
          sgstAmount,
          cgstAmount,
          igstAmount,
          finalAmount,
        };
      }

      return newForm;
    });
  };

  // const handleWorkChange = (index, field, value) => {
  //   const updated = [...works];
  //   updated[index][field] = field === 'qty' || field === 'price' ? parseFloat(value) || 0 : value;
  //   updated[index].total_price = (updated[index].qty || 0) * (updated[index].price || 0);
  //   setWorks(updated);
  //   calculateTotals(updated);
  // };

  // const addWorkRow = () => {
  //   setWorks([...works, { work_type: '', uom: '', qty: 0, price: 0, total_price: 0, remark: '' }]);
  // };


const handleWorkChange = (index, field, value) => {
  const updated = [...works];

  // Update the changed field
  if (field === 'qty' || field === 'price' || field === 'gst_percent') {
    updated[index][field] = parseFloat(value) || 0;
  } else {
    updated[index][field] = value;
  }

  const qty = updated[index].qty || 0;
  const price = updated[index].price || 0;
  const gstPercent = updated[index].gst_percent || 0;

  // Calculations
  const baseAmount = qty * price;                          // 100 × 10 = 1000
  const cgst = baseAmount * (gstPercent / 2 / 100);         // 9% CGST
  const sgst = baseAmount * (gstPercent / 2 / 100);         // 9% SGST

  // total_price = base + tax (this is what customer pays per line)
  const finalLineTotal = baseAmount + cgst + sgst;

  // Update all values
  updated[index].total_price = finalLineTotal;  // ← This now includes GST
  updated[index].cgst_amount = cgst;
  updated[index].sgst_amount = sgst;

  setWorks(updated);
  calculateTotals(updated);
};

const addWorkRow = () => {
  setWorks([
    ...works,
    {
      work_type: '',
      uom: '',
      qty: 0,
      price: 0,
      total_price: 0,           // will include GST after entry
      gst_percent: 18,          // default 18%
      cgst_amount: 0,
      sgst_amount: 0,
      remark: ''
    }
  ]);
};



  const removeWorkRow = (index) => {
    const updated = [...works];
    updated.splice(index, 1);
    setWorks(updated);
    calculateTotals(updated);
  };

  // const calculateTotals = (currentWorks) => {
  //   setForm((prev) => {
  //     const subtotal = currentWorks.reduce((sum, w) => sum + (w.total_price || 0), 0);
  //     const base = subtotal - (prev.discount || 0);
  //     const sgstAmount = base * (prev.sgstPercentage / 100);
  //     const cgstAmount = base * (prev.cgstPercentage / 100);
  //     const igstAmount = base * (prev.igstPercentage / 100);
  //     const gstAmount = sgstAmount + cgstAmount + igstAmount;
  //     const finalAmount = base + gstAmount;
  //     return { ...prev, subtotal, taxableAmount: base, gstAmount, sgstAmount, cgstAmount, igstAmount, finalAmount };
  //   });
  // };



const calculateTotals = (currentWorks) => {
  setForm((prev) => {
    const subtotal = currentWorks.reduce((sum, w) => sum + (w.qty * w.price), 0);
    const totalCGST = currentWorks.reduce((sum, w) => sum + w.cgst_amount, 0);
    const totalSGST = currentWorks.reduce((sum, w) => sum + w.sgst_amount, 0);
    const totalGST = totalCGST + totalSGST;

    const grandTotal = currentWorks.reduce((sum, w) => sum + w.total_price, 0);

    return {
      ...prev,
      subtotal: subtotal,
      taxableAmount: subtotal,
      gstAmount: totalGST,
      cgstAmount: totalCGST,
      sgstAmount: totalSGST,
      igstAmount: 0,
      finalAmount: grandTotal - (prev.discount || 0),
    };
  });
};






  const submitInvoice = async (e) => {
    e.preventDefault();
    const formElement = e.currentTarget;
    if (!formElement.checkValidity()) {
      setValidated(true);
      return;
    }
    if (!form.projectId || !form.customer_id) {
      showToast('danger', 'Please select a project with a valid customer');
      return;
    }
    // if (works.length === 0 || works.every((w) => !w.work_type || w.qty <= 0)) {
    //   showToast('danger', 'Please add at least one valid work item');
    //   return;
    // }

    try {
      setLoading(true);
      const data = {
        ...form,
        project_id: form.projectId,
        customer_name: form.customer_name,
        address: form.address,
        mobile_number: form.mobile_number,
        items: works.filter((w) => w.work_type && w.qty > 0),
        payment_terms: paymentTerms.join('\n'),
        terms_and_conditions: termsAndConditions.join('\n'),
        note: note,
      };
      console.log('Submitting data:', data);

      if (editMode && onSubmit) {
        await onSubmit(data);
      } else {
        const resp = await post('/api/order', data);
        if (resp) {
          showToast('success', 'Invoice created successfully');
          navigate(`/invoice-details/${resp.id}`);
        }
      }
    } catch (error) {
      console.error('Submit error:', error);
      showToast('danger', 'Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleNewProjectChange = (e) => {
    const { name, value } = e.target;
    setNewProjectForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const saveNewProject = async () => {
    try {
      const resp = await post('/api/projects', newProjectForm);
      if (resp) {
        showToast('success', 'Project added successfully');
        setShowAddProjectModal(false);
        setNewProjectForm({ customer_name: '', mobile_number: '', project_name: '', work_place: '', is_confirm: 0 });
        fetchProjects();
      }
    } catch (error) {
      console.error('Error adding project:', error);
      showToast('danger', 'Failed to add project');
    }
  };

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>{editMode ? 'Edit Invoice' : 'Create Invoice'}</strong>
          </CCardHeader>
          <CCardBody>
            <CForm validated={validated} onSubmit={submitInvoice}>
              {/* Project Selection */}
              <CRow className="mb-3">
                <CCol md={6}>
                  <CFormLabel>Project Name *</CFormLabel>
                  <div ref={projectInputRef} style={{ position: 'relative' }}>
                    <CInputGroup>
                      <CFormInput
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          if (!form.projectId) {
                            setShowDropdown(e.target.value.length > 2);
                          } else {
                            setShowDropdown(false);
                          }
                        }}
                        placeholder="Search by project name, customer, location..."
                        required
                      />
                      <CInputGroupText
                        className="cursor-pointer"
                        onClick={() => {
                          if (form.projectName || searchQuery) {
                            clearProject();
                          } else {
                            setShowProjectModal(true);
                          }
                        }}
                      >
                        <CIcon icon={form.projectName || searchQuery ? cilX : cilSearch} />
                      </CInputGroupText>
                    </CInputGroup>

                    {projectsLoading && showDropdown && searchQuery.length > 2 && (
                      <div className="dropdown-menu show p-2">
                        <CSpinner size="sm" /> Loading projects...
                      </div>
                    )}

                    {showDropdown && filteredProjects.length > 0 && !form.projectId && (
                      <div ref={dropdownRef} className="dropdown-menu show" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {filteredProjects.map((project) => (
                          <div
                            key={project.id}
                            className="dropdown-item cursor-pointer p-2 border-bottom"
                            onClick={() => handleProjectChange(project)}
                            onMouseEnter={(e) => (e.target.style.backgroundColor = '#f8f9fa')}
                            onMouseLeave={(e) => (e.target.style.backgroundColor = 'white')}
                          >
                            <div className="fw-medium text-primary">{project.project_name}</div>
                            <div className="small text-muted">
                              <strong>Customer:</strong> {project.customer_name}
                            </div>
                            {project.work_place && (
                              <div className="small text-muted">
                                <strong>Location:</strong> {project.work_place}
                              </div>
                            )}
                            {project.project_cost && (
                              <div className="small text-success">
                                <strong>Amount:</strong> ₹{project.project_cost}
                              </div>
                            )}
                            {project.mobile_number && (
                              <div className="small text-muted">
                                <strong>Mobile:</strong> {project.mobile_number}
                              </div>
                            )}
                          </div>
                        ))}
                        {!form.projectId && (
                          <div
                            className="dropdown-item cursor-pointer p-2 border-top text-primary"
                            onClick={() => setShowAddProjectModal(true)}
                          >
                            <CIcon icon={cilPlus} className="me-2" />
                            Add New Project
                          </div>
                        )}
                      </div>
                    )}

                    {searchQuery.length > 2 && filteredProjects.length === 0 && !projectsLoading && !form.projectId && (
                      <div className="dropdown-menu show" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        <div
                          className="dropdown-item cursor-pointer p-2 border-top text-primary"
                          onClick={() => setShowAddProjectModal(true)}
                        >
                          <CIcon icon={cilPlus} className="me-2" />
                          Add New Project
                        </div>
                      </div>
                    )}
                  </div>

                  {form.projectName && (
                    <div className="mt-1 p-2 bg-light rounded border">
                      <div className="small text-success">
                        <strong>Selected:</strong> {form.projectName}
                      </div>
                      <div className="small text-muted">
                        <strong>Customer:</strong> {form.customer.name}
                      </div>
                      {form.customer.address && (
                        <div className="small text-muted">
                          <strong>Location:</strong> {form.customer.address}
                        </div>
                      )}
                    </div>
                  )}
                </CCol>

                <CCol md={6}>
                  <CFormLabel>Invoice Date *</CFormLabel>
                  <CFormInput
                    type="date"
                    name="invoiceDate"
                    value={form.invoiceDate}
                    onChange={handleFormChange}
                    required
                  />
                </CCol>
              </CRow>

              <CRow className="mb-3">
                <CCol md={4}>
                  <CFormLabel>Invoice Date *</CFormLabel>
                  <CFormInput
                    type="date"
                    name="deliveryDate"
                    value={form.deliveryDate}
                    onChange={handleFormChange}
                    required
                  />
                </CCol>
                <CCol md={4}>
                  <CFormLabel>Reference ID</CFormLabel>
                  <CFormInput
                    type="text"
                    name="ref_id"
                    value={form.ref_id}
                    onChange={handleFormChange}
                    placeholder="Enter Reference ID"
                  />
                </CCol>

                <CCol md={4}>
                  <CFormLabel>Po Number</CFormLabel>
                  <CFormInput
                    type="text"
                    name="po_number"
                    value={form.po_number}
                    onChange={handleFormChange}
                    placeholder="Enter PO Number"
                  />
                </CCol>
              </CRow>

              <CRow className="mb-3">
                <CCol md={4}>
                  <CFormLabel>Customer Name</CFormLabel>
                  <CFormInput value={form.customer.name} readOnly placeholder="Select a project to populate" />
                </CCol>
                <CCol md={4}>
                  <CFormLabel>Work Location</CFormLabel>
                  <CFormInput value={form.customer.address} readOnly placeholder="Select a project to populate" />
                </CCol>
                <CCol md={4}>
                  <CFormLabel>Customer Mobile</CFormLabel>
                  <CFormInput value={form.customer.mobile} readOnly placeholder="Select a project to populate" />
                </CCol>
              </CRow>

              <CRow className="mb-3">
                <CCol md={6}>
                  <CFormLabel>Invoice Type *</CFormLabel>
                  <CFormSelect name="invoiceType" value={form.invoiceType} onChange={handleFormChange} required>
                    <option value={1}>Quotation</option>
                    <option value={2}>Work Order</option>
                  </CFormSelect>
                </CCol>
              </CRow>









              {/* <h6 className="mt-4 mb-3 fw-semibold text-primary border-bottom border-primary pb-2">Work Details</h6>
              {works.map((w, idx) => (
                <CRow className="g-3 mb-3 align-items-center" key={idx}>
                  <CCol md={2}>
                    <CFormInput
                      label="Work Type"
                      placeholder="Work Type"
                      value={w.work_type}
                      onChange={(e) => handleWorkChange(idx, 'work_type', e.target.value)}
                      required
                    />
                  </CCol>
                  <CCol md={2}>
                    <CFormInput
                      label="Unit Of Measurement"
                      placeholder="Unit"
                      value={w.uom}
                      onChange={(e) => handleWorkChange(idx, 'uom', e.target.value)}
                    />
                  </CCol>
                  <CCol md={2}>
                    <CFormInput
                      label="Quantity"
                      type="number"
                       step="0.01"
                      placeholder="Quantity"
                      value={w.qty}
                      onChange={(e) => handleWorkChange(idx, 'qty', parseFloat(e.target.value) || 0)}
                      min="0"
                      required
                    />
                  </CCol>
                  <CCol md={2}>
                    <CFormLabel>Price</CFormLabel>
                    <CInputGroup>
                      <CInputGroupText>₹</CInputGroupText>
                      <CFormInput
                        type="number"
                        placeholder="Price"
                        value={w.price}
                        onChange={(e) => handleWorkChange(idx, 'price', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                        required
                      />
                    </CInputGroup>
                  </CCol>
                  <CCol md={1}>
                    <CFormLabel>Total</CFormLabel>
                    <div>
                      <span className="text-success fw-medium">₹{w.total_price.toFixed(2)}</span>
                    </div>
                  </CCol>
                  <CCol md={2}>
                    <CFormInput
                      label="Description"
                      placeholder="Remark"
                      value={w.remark}
                      onChange={(e) => handleWorkChange(idx, 'remark', e.target.value)}
                    />
                  </CCol>
                  <CCol md={1}>
                    <CButton color="danger" size="sm" onClick={() => removeWorkRow(idx)} disabled={works.length === 1}>
                      ×
                    </CButton>
                  </CCol>
                </CRow>
              ))}
              <CButton color="warning" variant="outline" className="mb-4" onClick={addWorkRow}>
                + Add Work
              </CButton> */}











<h6 className="mt-4 mb-3 fw-semibold text-primary border-bottom border-primary pb-2">
  Work Details
</h6>

{works.map((w, idx) => (
  <CRow className="g-3 mb-3 align-items-end" key={idx}>
    <CCol md={2}>
      <CFormInput
        label="Work Type"
        placeholder="Work Type"
        value={w.work_type}
        onChange={(e) => handleWorkChange(idx, 'work_type', e.target.value)}
        required
      />
    </CCol>

    <CCol md={1}>
      <CFormInput
        label="Unit"
        placeholder="UMO"
        value={w.uom}
        onChange={(e) => handleWorkChange(idx, 'uom', e.target.value)}
      />
    </CCol>

    <CCol md={1}>
      <CFormInput
        label="Qty"
        type="number"
        step="0.01"
        min="0"
        value={w.qty}
        onChange={(e) => handleWorkChange(idx, 'qty', e.target.value)}
        required
      />
    </CCol>

    <CCol md={1}>
      <CFormLabel>Rate</CFormLabel>
      <CInputGroup>
        <CInputGroupText>₹</CInputGroupText>
        <CFormInput
          type="number"
          step="0.01"
          min="0"
          value={w.price}
          onChange={(e) => handleWorkChange(idx, 'price', e.target.value)}
          required
        />
      </CInputGroup>
    </CCol>

    <CCol md={1}>
      <CFormLabel>Base Amt</CFormLabel>
      <div className="fw-medium">₹{(w.qty * w.price).toFixed(2)}</div>
    </CCol>

    <CCol md={1}>
      <CFormInput
        label="GST %"
        type="number"
        step="0.01"
        min="0"
        max="100"
        value={w.gst_percent}
        onChange={(e) => handleWorkChange(idx, 'gst_percent', e.target.value)}
      />
    </CCol>

    <CCol md={1}>
      <CFormLabel>CGST</CFormLabel>
      <div className="text-success fw-medium">₹{w.cgst_amount}</div>
    </CCol>

    <CCol md={1}>
      <CFormLabel>SGST</CFormLabel>
      <div className="text-success fw-medium">₹{w.sgst_amount}</div>
    </CCol>

    {/* Final Total (includes GST) */}
    <CCol md={1}>
      <CFormLabel className="text-primary">Total</CFormLabel>
      <div className="fw-bold text-primary">₹{w.total_price}</div>
    </CCol>

    <CCol md={1}>
      <CFormInput
        label="Remark"
        placeholder="Optional"
        value={w.remark}
        onChange={(e) => handleWorkChange(idx, 'remark', e.target.value)}
      />
    </CCol>

    <CCol md={1} className="d-flex align-items-end">
       <CButton color="danger" size="sm" onClick={() => removeWorkRow(idx)} disabled={works.length === 1}>
                      ×
                    </CButton>
    </CCol>
  </CRow>
))}

<CButton color="warning" variant="outline" className="mb-4" onClick={addWorkRow}>
  + Add Work
</CButton>












              

              <h6 className="mt-4 mb-3 fw-semibold text-primary border-bottom border-primary pb-2">GST Details</h6>
              <CRow className="mb-3">
                <CCol md={3}>
                  <CFormLabel>Total GST (%)</CFormLabel>
                  <CInputGroup>
                    <CFormInput
                      type="number"
                      name="gstPercentage"
                      value={form.gstPercentage}
                      onChange={handleFormChange}
                      min="0"
                      max="100"
                      step="0.01"
                      disabled={loading}
                      placeholder="18.00"
                    />
                    <CInputGroupText>%</CInputGroupText>
                  </CInputGroup>
                  <div className="form-text text-muted">
                    <small>GST Amount: ₹{form.gstAmount.toFixed(2)}</small>
                  </div>
                </CCol>
                <CCol md={3}>
                  <CFormLabel>SGST (%)</CFormLabel>
                  <CInputGroup>
                    <CFormInput
                      type="number"
                      name="sgstPercentage"
                      value={form.sgstPercentage}
                      onChange={handleFormChange}
                      min="0"
                      max="50"
                      step="0.01"
                      disabled={loading}
                      placeholder="9.00"
                    />
                    <CInputGroupText>%</CInputGroupText>
                  </CInputGroup>
                  <div className="form-text text-muted">
                    <small>SGST Amount: ₹{form.sgstAmount.toFixed(2)}</small>
                  </div>
                </CCol>
                <CCol md={3}>
                  <CFormLabel>CGST (%)</CFormLabel>
                  <CInputGroup>
                    <CFormInput
                      type="number"
                      name="cgstPercentage"
                      value={form.cgstPercentage}
                      onChange={handleFormChange}
                      min="0"
                      max="50"
                      step="0.01"
                      disabled={loading}
                      placeholder="9.00"
                    />
                    <CInputGroupText>%</CInputGroupText>
                  </CInputGroup>
                  <div className="form-text text-muted">
                    <small>CGST Amount: ₹{form.cgstAmount.toFixed(2)}</small>
                  </div>
                </CCol>
                <CCol md={3}>
                  <CFormLabel>IGST (%)</CFormLabel>
                  <CInputGroup>
                    <CFormInput
                      type="number"
                      name="igstPercentage"
                      value={form.igstPercentage}
                      onChange={handleFormChange}
                      min="0"
                      max="100"
                      step="0.01"
                      disabled={loading}
                      placeholder="0.00"
                    />
                    <CInputGroupText>%</CInputGroupText>
                  </CInputGroup>
                  <div className="form-text text-muted">
                    <small>IGST Amount: ₹{form.igstAmount.toFixed(2)}</small>
                  </div>
                </CCol>
              </CRow>
              <div className="alert alert-info border-0 bg-info-subtle mb-3">
                <div className="d-flex">
                  <div>
                    <strong className="text-info">Auto-Calculation:</strong>
                    <ul className="mb-0 mt-1 text-info">
                      <li>
                        <small>Enter total GST % to auto-split into CGST and SGST</small>
                      </li>
                      <li>
                        <small>Modify CGST or SGST to auto-update total GST %</small>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <CRow className="mb-3">
                <CCol md={4}>
                  <CFormLabel>Subtotal</CFormLabel>
                  <CInputGroup>
                    <CInputGroupText>₹</CInputGroupText>
                    <CFormInput type="number" value={form.subtotal.toFixed(2)} readOnly />
                  </CInputGroup>
                </CCol>
                {/* <CCol md={3}>
                  <CFormLabel>Discount</CFormLabel>
                  <CInputGroup>
                    <CInputGroupText>₹</CInputGroupText>
                    <CFormInput
                      type="number"
                      name="discount"
                      value={form.discount}
                      onChange={handleFormChange}
                      min="0"
                      step="0.01"
                    />
                  </CInputGroup>
                </CCol> */}
                <CCol md={4}>
                  <CFormLabel>Taxable Amount</CFormLabel>
                  <CInputGroup>
                    <CInputGroupText>₹</CInputGroupText>
                    <CFormInput type="number" value={form.taxableAmount.toFixed(2)} readOnly />
                  </CInputGroup>
                </CCol>
                <CCol md={4}>
                  <CFormLabel>GST Amount</CFormLabel>
                  <CInputGroup>
                    <CInputGroupText>₹</CInputGroupText>
                    <CFormInput type="number" value={form.gstAmount.toFixed(2)} readOnly />
                  </CInputGroup>
                </CCol>
              </CRow>
              <CRow className="mb-3">
                <CCol md={6}>
                  <CFormLabel>Final Amount</CFormLabel>
                  <CInputGroup>
                    <CInputGroupText>₹</CInputGroupText>
                    <CFormInput type="number" value={form.finalAmount.toFixed(2)} readOnly />
                  </CInputGroup>
                </CCol>
                {/*<CCol md={4}>
                   <CFormLabel>Paid Amount</CFormLabel>
                  <CInputGroup>
                    <CInputGroupText>₹</CInputGroupText>
                    <CFormInput
                      type="number"
                      name="paidAmount"
                      value={form.paidAmount}
                      onChange={handleFormChange}
                      min="0"
                      step="0.01"
                    />
                  </CInputGroup> 
                </CCol> */}
                <CCol md={6}>
                  <CFormLabel>Remaining Amount</CFormLabel>
                  <CInputGroup>
                    <CInputGroupText>₹</CInputGroupText>
                    <CFormInput
                      type="number"
                      value={calculateRemainingAmount().toFixed(2)}
                      readOnly
                      className="text-danger fw-medium"
                    />
                  </CInputGroup>
                </CCol>
              </CRow>

              <h6 className="mt-4 mb-3 fw-semibold text-primary border-bottom border-primary pb-2">Payment Terms</h6>
              <div className="d-flex flex-wrap gap-2 mb-3">
                {paymentTerms.map((term, idx) => {
                  if (editingPaymentIndex === idx) {
                    return (
                      <CInputGroup key={idx} style={{ width: 'auto' }}>
                        <CFormInput
                          value={editingPaymentValue}
                          onChange={(e) => setEditingPaymentValue(e.target.value)}
                        />
                        <CButton
                          color="success"
                          onClick={() => {
                            const newTerms = [...paymentTerms];
                            newTerms[idx] = editingPaymentValue;
                            setPaymentTerms(newTerms);
                            setEditingPaymentIndex(-1);
                          }}
                        >
                          Save
                        </CButton>
                        <CButton color="secondary" onClick={() => setEditingPaymentIndex(-1)}>
                          Cancel
                        </CButton>
                      </CInputGroup>
                    );
                  } else {
                    return (
                      <CBadge color="info" key={idx} className="me-1 mb-1" style={{ fontSize: '0.9em' }}>
                        {term}
                        <CIcon
                          icon={cilPencil}
                          className="ms-2"
                          style={{ cursor: 'pointer' }}
                          onClick={() => {
                            setEditingPaymentIndex(idx);
                            setEditingPaymentValue(term);
                          }}
                        />
                        <CIcon
                          icon={cilX}
                          className="ms-1"
                          style={{ cursor: 'pointer' }}
                          onClick={() => {
                            setPaymentTerms(paymentTerms.filter((_, i) => i !== idx));
                          }}
                        />
                      </CBadge>
                    );
                  }
                })}
              </div>
              <CRow className="mb-3">
                <CCol md={6}>
                  <CInputGroup>
                    <CFormInput
                      placeholder="Add new payment term..."
                      value={newPaymentTerm}
                      onChange={(e) => setNewPaymentTerm(e.target.value)}
                    />
                    <CButton
                      color="primary"
                      onClick={() => {
                        if (newPaymentTerm.trim()) {
                          setPaymentTerms([...paymentTerms, newPaymentTerm.trim()]);
                          setNewPaymentTerm('');
                        }
                      }}
                    >
                      Add
                    </CButton>
                  </CInputGroup>
                </CCol>
              </CRow>

              <h6 className="mt-4 mb-3 fw-semibold text-primary border-bottom border-primary pb-2">Terms & Conditions</h6>
              <div className="d-flex flex-wrap gap-2 mb-3">
                {termsAndConditions.map((term, idx) => {
                  if (editingConditionIndex === idx) {
                    return (
                      <CInputGroup key={idx} style={{ width: 'auto' }}>
                        <CFormInput
                          value={editingConditionValue}
                          onChange={(e) => setEditingConditionValue(e.target.value)}
                        />
                        <CButton
                          color="success"
                          onClick={() => {
                            const newConditions = [...termsAndConditions];
                            newConditions[idx] = editingConditionValue;
                            setTermsAndConditions(newConditions);
                            setEditingConditionIndex(-1);
                          }}
                        >
                          Save
                        </CButton>
                        <CButton color="secondary" onClick={() => setEditingConditionIndex(-1)}>
                          Cancel
                        </CButton>
                      </CInputGroup>
                    );
                  } else {
                    return (
                      <CBadge color="warning" key={idx} className="me-1 mb-1" style={{ fontSize: '0.9em' }}>
                        {term}
                        <CIcon
                          icon={cilPencil}
                          className="ms-2"
                          style={{ cursor: 'pointer' }}
                          onClick={() => {
                            setEditingConditionIndex(idx);
                            setEditingConditionValue(term);
                          }}
                        />
                        <CIcon
                          icon={cilX}
                          className="ms-1"
                          style={{ cursor: 'pointer' }}
                          onClick={() => {
                            setTermsAndConditions(termsAndConditions.filter((_, i) => i !== idx));
                          }}
                        />
                      </CBadge>
                    );
                  }
                })}
              </div>
              <CRow className="mb-3">
                <CCol md={6}>
                  <CInputGroup>
                    <CFormInput
                      placeholder="Add new condition..."
                      value={newCondition}
                      onChange={(e) => setNewCondition(e.target.value)}
                    />
                    <CButton
                      color="primary"
                      onClick={() => {
                        if (newCondition.trim()) {
                          setTermsAndConditions([...termsAndConditions, newCondition.trim()]);
                          setNewCondition('');
                        }
                      }}
                    >
                      Add
                    </CButton>
                  </CInputGroup>
                </CCol>
              </CRow>

              <h6 className="mt-4 mb-2 fw-semibold text-primary border-bottom border-primary pb-2">Additional Note</h6>
              <CFormTextarea
                type="text"
                className="mb-3"
                placeholder="Enter note if any..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />

              <CButton
                color="primary"
                type="submit"
                disabled={loading || !form.projectId || !form.customer_id || projectsLoading}
              >
                {loading ? <CSpinner size="sm" /> : editMode ? 'Update Invoice' : 'Submit Invoice'}
              </CButton>
              &nbsp;&nbsp;
              {editMode && (
                <CButton color="secondary" type="button" onClick={() => navigate('/invoiceTable')}>
                  Close
                </CButton>
              )}
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>

      <CModal visible={showAddProjectModal} onClose={() => setShowAddProjectModal(false)}>
        <CModalHeader>
          <CModalTitle>Add New Project</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel>Customer Name *</CFormLabel>
                <CFormInput
                  type="text"
                  name="customer_name"
                  value={newProjectForm.customer_name}
                  onChange={handleNewProjectChange}
                  required
                  maxLength={255}
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Mobile Number *</CFormLabel>
                <CFormInput
                  type="text"
                  name="mobile_number"
                  value={newProjectForm.mobile_number}
                  onChange={handleNewProjectChange}
                  required
                  // maxLength={255}
                 
  maxLength={10}
  minLength={10}
  pattern="^[0-9]{10}$"
  placeholder="Enter 10-digit mobile number"
                />
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel>Project Name *</CFormLabel>
                <CFormInput
                  type="text"
                  name="project_name"
                  value={newProjectForm.project_name}
                  onChange={handleNewProjectChange}
                  required
                  maxLength={255}
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Work Place</CFormLabel>
                <CFormInput
                  type="text"
                  name="work_place"
                  value={newProjectForm.work_place}
                  onChange={handleNewProjectChange}
                  maxLength={255}
                />
              </CCol>
            </CRow>

 <CRow className="mb-3">
            <CCol md={6}>
                <CFormLabel>GST number</CFormLabel>
                {/* <CFormInput
                  type="text"
                  name="gst_number"
                  value={newProjectForm.gst_number}
                  onChange={handleNewProjectChange}
                  required
                  placeholder="Enter GST number..."
                /> */}

                <CFormInput
  type="text"
  name="gst_number"
  value={newProjectForm.gst_number}
  onChange={(e) => {
    const value = e.target.value.toUpperCase();

    // Only allow A–Z and 0–9 and max 15 chars
    if (/^[A-Z0-9]{0,15}$/.test(value)) {
      handleNewProjectChange({
        target: { name: "gst_number", value }
      });
    }
  }}
  required
  maxLength={15}
  minLength={15}
  placeholder="Enter GST number (15 chars)"
/>

              </CCol>

              <CCol md={6}>
                <CFormLabel>Pan Card number</CFormLabel>
                {/* <CFormInput
                  type="text"
                  name="pan_number"
                  value={newProjectForm.pan_number}
                  onChange={handleNewProjectChange}
                  required
                  placeholder="Enter Pan Card number..."
                /> */}

                <CFormInput
  type="text"
  name="pan_number"
  value={newProjectForm.pan_number}
  onChange={(e) => {
    const value = e.target.value.toUpperCase();

    // Only allow A–Z and 0–9 and max 10 chars
    if (/^[A-Z0-9]{0,10}$/.test(value)) {
      handleNewProjectChange({
        target: { name: "pan_number", value }
      });
    }
  }}
  required
  maxLength={10}
  minLength={10}
  placeholder="Enter PAN number (10 chars)"
/>

              </CCol>  
              </CRow>

{/* 
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormCheck
                  type="checkbox"
                  id="is_confirm"
                  label="Is Confirmed"
                  //  checked={true}   
                  checked={newProjectForm.is_confirm === 1}
                  onChange={(e) =>
                    setNewProjectForm((prev) => ({
                      ...prev,
                      is_confirm: e.target.checked ? 1 : 0,
                    }))
                  }
                />
              </CCol>
            </CRow> */}
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowAddProjectModal(false)}>
            Close
          </CButton>
          <CButton color="primary" onClick={saveNewProject}>
            Save
          </CButton>
        </CModalFooter>
      </CModal>

      <ProjectSelectionModal
        visible={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        onSelectProject={handleProjectChange}
      />
    </CRow>
  );
};

export default Invoice