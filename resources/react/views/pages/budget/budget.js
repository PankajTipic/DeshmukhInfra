import React, { useState, useEffect, useCallback } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CRow,
  CCol,
  CForm,
  CFormLabel,
  CFormInput,
  CButton,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CFormSelect,
  CInputGroup,
  CInputGroupText,
  CAlert,
  CSpinner,
} from '@coreui/react';
import '@coreui/coreui/dist/css/coreui.min.css';
import { getAPICall, post } from '../../../util/api'; // Adjust path as needed
import { workTypeDropdown } from '../../../util/Feilds'; // Import workTypeDropdown
import { cilSearch, cilX } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import ProjectSelectionModal from '../../common/ProjectSelectionModal'; // adjust path as needed

const ProjectForm = () => {
  const [budgets, setBudgets] = useState([]);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', color: '' });
  const [editingBudget, setEditingBudget] = useState(null); // Track if editing existing budget
  const [form, setForm] = useState({
    projectName: '',
    projectId: '',
    budget: '',
    projectAmount: '',
    startDate: '',
    endDate: '',
    workPlace: '',
  });
  const [allProjects, setAllProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [works, setWorks] = useState([{ operator: '', workType: '', points: 0, rate: 0 }]);

  // Show alert message
  const showAlert = (message, color = 'success') => {
    setAlert({ show: true, message, color });
    setTimeout(() => setAlert({ show: false, message: '', color: '' }), 5000);
  };

  // Fetch budgets
  const fetchBudgets = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAPICall('/api/budgets');
      setBudgets(response || []);
    } catch (error) {
      console.error('Error fetching budgets:', error);
      showAlert('Failed to fetch budgets', 'danger');
      setBudgets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch projects based on search query
  const fetchProjects = useCallback(async (query) => {
    try {
      const response = await getAPICall(`/api/projects?searchQuery=${query}`);
      setAllProjects(response || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setAllProjects([]);
    }
  }, []);

  // Fetch vendors (type = 2)
  const fetchVendors = useCallback(async () => {
    try {
      const response = await getAPICall('/api/vendors');
      if (!response) throw new Error('Failed to fetch vendors');
      setVendors(response);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      setVendors([]);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchVendors();
    fetchBudgets(); // Fetch budgets on load
  }, [fetchVendors, fetchBudgets]);

  // Debounced project search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery && searchQuery.length > 2) {
        fetchProjects(searchQuery);
      } else {
        setAllProjects([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchProjects]);

  // Update budget based on total work cost
  useEffect(() => {
    const totalWorkCost = works.reduce(
      (sum, w) => sum + Number(w.points || 0) * Number(w.rate || 0),
      0
    );
    setForm(prev => ({ ...prev, budget: totalWorkCost.toString() }));
  }, [works]);

  // Filter projects by search query
  const filteredProjects = (allProjects || []).filter(p =>
    (p?.project_name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleProjectChange = async (project) => {
    try {
      // Reset works to default first
      const defaultWorks = [{ operator: '', workType: '', points: 0, rate: 0 }];
      setWorks(defaultWorks);
      
      setForm(prev => ({
        ...prev,
        projectId: project.id,
        projectName: project.project_name,
        projectAmount: project.project_cost || '',
        startDate: project.start_date ? project.start_date.split('T')[0] : '',
        endDate: project.end_date ? project.end_date.split('T')[0] : '',
        workPlace: project.work_place || '',
      }));
      
      // Check if this project has existing budget
      const existingBudgets = await getAPICall(`/api/budgets?project_id=${project.id}`);
      
      if (existingBudgets && existingBudgets.length > 0) {
        const budget = existingBudgets[0]; // Get the first budget for this project
        setEditingBudget(budget.id); // Set editing mode
        
        // Populate work details from existing budget
        if (budget.works && budget.works.length > 0) {
          const existingWorks = budget.works.map(work => ({
            operator: work.operator_id?.toString() || '',
            workType: work.work_type || '',
            points: work.points || 0,
            rate: work.rate || 0,
          }));
          setWorks(existingWorks);
        }
        
        // Update form with budget data
        setForm(prev => ({
          ...prev,
          budget: budget.budget?.toString() || '',
        }));
        
        // showAlert('Loaded existing budget for this project. You can modify and update it.', 'info');
      } else {
        // No existing budget, create new one
        setEditingBudget(null);
        setWorks(defaultWorks);
      }
    } catch (error) {
      console.error('Error fetching project budget:', error);
      // If error, just reset to default
      setEditingBudget(null);
      setWorks([{ operator: '', workType: '', points: 0, rate: 0 }]);
    }
    
    setSearchQuery(project.project_name);
    setAllProjects([]);
    setShowDropdown(false);
  };

  const clearProject = () => {
    setForm({
      projectName: '',
      projectId: '',
      budget: '',
      projectAmount: '',
      startDate: '',
      endDate: '',
      workPlace: '',
    });
    setSearchQuery('');
    setShowDropdown(false);
    setEditingBudget(null);
    setWorks([{ operator: '', workType: '', points: 0, rate: 0 }]);
  };

  const handleWorkChange = (index, field, value) => {
    const updated = [...works];
    updated[index][field] = value;
    setWorks(updated);
  };

  const addWorkRow = () => {
    setWorks([...works, { operator: '', workType: '', points: 0, rate: 0 }]);
  };

  const removeWorkRow = (index) => {
    if (works.length > 1) {
      const updated = [...works];
      updated.splice(index, 1);
      setWorks(updated);
    }
  };

  const createOrUpdateBudget = async () => {
    // Validation
    if (!form.projectName.trim()) {
      showAlert('Project name is required.', 'warning');
      return;
    }
    if (!form.budget) {
      showAlert('Budget is required.', 'warning');
      return;
    }
    if (!form.projectAmount) {
      showAlert('Project amount is required.', 'warning');
      return;
    }
    if (works.some(w => !w.operator)) {
      showAlert('Please select a vendor for all work entries.', 'warning');
      return;
    }
    if (works.some(w => !w.workType)) {
      showAlert('Please select a work type for all work entries.', 'warning');
      return;
    }
    if (works.some(w => !w.points || w.points <= 0)) {
      showAlert('Points must be greater than 0 for all work entries.', 'warning');
      return;
    }
    if (works.some(w => !w.rate || w.rate <= 0)) {
      showAlert('Rate must be greater than 0 for all work entries.', 'warning');
      return;
    }

    const totalWorkCost = works.reduce(
      (sum, w) => sum + Number(w.points || 0) * Number(w.rate || 0),
      0
    );

    // Check if total work cost exceeds project amount
    if (totalWorkCost > Number(form.projectAmount)) {
      showAlert('Total work cost cannot exceed the project amount.', 'danger');
      return;
    }

    try {
      setSubmitLoading(true);
      
      const payload = {
        project_id: form.projectId || null,
        project_name: form.projectName,
        budget: parseFloat(form.budget),
        project_amount: parseFloat(form.projectAmount),
        start_date: form.startDate || null,
        end_date: form.endDate || null,
        work_place: form.workPlace || null,
        works: works.map(work => ({
          operator: parseInt(work.operator),
          workType: work.workType,
          points: parseInt(work.points),
          rate: parseFloat(work.rate),
        }))
      };

      let response;
      if (editingBudget) {
        // Update existing budget
        response = await post(`/api/budgets/${editingBudget}`, payload, 'PUT');
        showAlert('Budget updated successfully!', 'success');
      } else {
        // Create new budget
        response = await post('/api/budgets', payload);
        showAlert('Budget created successfully!', 'success');
      }
      
      // Reset form
      clearProject();
      
      // Refresh budget list
      fetchBudgets();
      
    } catch (error) {
      console.error('Error saving budget:', error);
      showAlert(
        error.response?.data?.message || 'Failed to save budget. Please try again.',
        'danger'
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  const deleteBudget = async (budgetId) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) {
      return;
    }

    try {
      await post(`/api/budgets/${budgetId}`, {}, 'DELETE');
      showAlert('Budget deleted successfully!', 'success');
      fetchBudgets();
    } catch (error) {
      console.error('Error deleting budget:', error);
      showAlert('Failed to delete budget.', 'danger');
    }
  };

  const editBudget = (budget) => {
    // Populate form with budget data
    setForm({
      projectName: budget.project_name,
      projectId: budget.project_id?.toString() || '',
      budget: budget.budget?.toString() || '',
      projectAmount: budget.project_amount?.toString() || '',
      startDate: budget.start_date ? budget.start_date.split('T')[0] : '',
      endDate: budget.end_date ? budget.end_date.split('T')[0] : '',
      workPlace: budget.work_place || '',
    });

    // Populate work details
    if (budget.works && budget.works.length > 0) {
      const budgetWorks = budget.works.map(work => ({
        operator: work.operator_id?.toString() || '',
        workType: work.work_type || '',
        points: work.points || 0,
        rate: work.rate || 0,
      }));
      setWorks(budgetWorks);
    } else {
      setWorks([{ operator: '', workType: '', points: 0, rate: 0 }]);
    }

    setSearchQuery(budget.project_name);
    setEditingBudget(budget.id);
    
    // Scroll to top of form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getVendorName = (operatorId) => {
    const vendor = vendors.find(v => v.id === parseInt(operatorId));
    return vendor ? `${vendor.name}${vendor.gst_no ? ` (${vendor.gst_no})` : ''}` : 'Unknown';
  };

  return (
    <div className="">
      {alert.show && (
        <CAlert color={alert.color} dismissible onClose={() => setAlert({ show: false, message: '', color: '' })}>
          {alert.message}
        </CAlert>
      )}

      <CCard className="border-grey rounded-3">
        <CCardHeader className="bg-primary bg-gradient text-white fw-semibold fs-5 rounded-top-3 p-2">
          {editingBudget ? 'Update Budget' : 'Budget'}
        </CCardHeader>
        <CCardBody className="p-4">
          <CForm>
            <CRow className="g-3 mb-4">
 <CCol md={6}>
  <CFormLabel className="fw-medium text-dark">Project Name *</CFormLabel>
  <CInputGroup>
    <CFormInput
      type="text"
      value={searchQuery}
      onChange={(e) => {
        setSearchQuery(e.target.value);
        setShowDropdown(true);
      }}
      placeholder="Search for a project..."
      className="rounded-2 border-grey"
    />

    {/* 🔁 Toggle between search and clear buttons */}
    {!form.projectName ? (
      <CButton
        color="primary"
        variant="outline"
        onClick={() => setShowProjectModal(true)}
        className="rounded-2"
      >
        <CIcon icon={cilSearch} />
      </CButton>
    ) : (
      <CButton
        type="button"
        color="danger"
        variant="outline"
        onClick={clearProject}
        className="rounded-2"
      >
        <CIcon icon={cilX} />
      </CButton>
    )}
  </CInputGroup>

  {showDropdown && filteredProjects.length > 0 && (
    <div
      className="border rounded bg-white mt-1 shadow-sm"
      style={{
        maxHeight: '200px',
        overflowY: 'auto',
        position: 'absolute',
        zIndex: 1000,
        width: 'calc(100% - 30px)',
      }}
    >
      {filteredProjects.map((project) => (
        <div
          key={project.id}
          className="p-2 border-bottom cursor-pointer hover-bg-light"
          style={{ cursor: 'pointer' }}
          onClick={() => handleProjectChange(project)}
          onMouseEnter={(e) => (e.target.style.backgroundColor = '#f8f9fa')}
          onMouseLeave={(e) => (e.target.style.backgroundColor = 'white')}
        >
          <div className="fw-medium">{project.project_name}</div>
          {project.project_cost && (
            <small className="text-muted">
              Amount: ₹{project.project_cost}
            </small>
          )}
        </div>
      ))}
    </div>
  )}
</CCol>

              <CCol md={3}>
                <CFormLabel className="fw-medium text-dark">Project Amount *</CFormLabel>
                <CInputGroup>
                  <CInputGroupText>₹</CInputGroupText>
                  <CFormInput
                    name="projectAmount"
                    type="number"
                    value={form.projectAmount}
                    onChange={handleFormChange}
                    className="rounded-2 border-grey"
                    readOnly={!!form.projectId}
                  />
                </CInputGroup>
              </CCol>
              <CCol md={3}>
                <CFormLabel className="fw-medium text-dark">Budget *</CFormLabel>
                <CInputGroup>
                  <CInputGroupText>₹</CInputGroupText>
                  <CFormInput
                    name="budget"
                    type="number"
                    value={form.budget}
                    onChange={handleFormChange}
                    className="rounded-2 border-grey"
                    readOnly
                  />
                </CInputGroup>
              </CCol>
            </CRow>
            <CRow className="g-3 mb-4">
              <CCol md={4}>
                <CFormLabel className="fw-medium text-dark">Work Place</CFormLabel>
                <CFormInput
                  name="workPlace"
                  value={form.workPlace}
                  onChange={handleFormChange}
                  className="rounded-2 border-grey"
                  readOnly={!!form.projectId}
                />
              </CCol>
              <CCol md={4}>
                <CFormLabel className="fw-medium text-dark">Start Date</CFormLabel>
                <CFormInput
                  type="date"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleFormChange}
                  className="rounded-2 border-grey"
                  readOnly={!!form.projectId}
                />
              </CCol>
              <CCol md={4}>
                <CFormLabel className="fw-medium text-dark">End Date</CFormLabel>
                <CFormInput
                  type="date"
                  name="endDate"
                  value={form.endDate}
                  onChange={handleFormChange}
                  className="rounded-2 border-grey"
                  readOnly={!!form.projectId}
                />
              </CCol>
            </CRow>
            
            <h6 className="mt-4 mb-3 fw-semibold text-primary border-bottom border-primary pb-2">
              Work Details
            </h6>
            <CRow className="g-3 mb-2">
              <CCol md={3}>
                <CFormLabel className="fw-medium text-dark">Vendor</CFormLabel>
              </CCol>
              <CCol md={3}>
                <CFormLabel className="fw-medium text-dark">Work Type</CFormLabel>
              </CCol>
              <CCol md={2}>
                <CFormLabel className="fw-medium text-dark">Quantity</CFormLabel>
              </CCol>
              <CCol md={2}>
                <CFormLabel className="fw-medium text-dark">Price</CFormLabel>
              </CCol>
              <CCol md={1}>
                <CFormLabel className="fw-medium text-dark">Total</CFormLabel>
              </CCol>
              <CCol md={1}>
                <CFormLabel className="fw-medium text-dark">Action</CFormLabel>
              </CCol>
            </CRow>
            {works.map((w, idx) => (
              <CRow className="g-3 mb-3 align-items-center" key={idx}>
                <CCol md={3}>
                  <CFormSelect
                    value={w.operator}
                    onChange={(e) => handleWorkChange(idx, 'operator', e.target.value)}
                    className="rounded-2 border-grey"
                  >
                    <option value="">Select Vendor</option>
                    {vendors.map((vendor) => (
                      <option key={vendor.id} value={vendor.id}>
                        {vendor.name} {vendor.gst_no ? `(${vendor.gst_no})` : ''}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
                <CCol md={3}>
                  <CFormSelect
                    value={w.workType}
                    onChange={(e) => handleWorkChange(idx, 'workType', e.target.value)}
                    className="rounded-2 border-grey"
                  >
                    <option value="">Select Work Type</option>
                    {workTypeDropdown.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
                <CCol md={2}>
                  <CFormInput
                    type="number"
                    value={w.points}
                    onChange={(e) => handleWorkChange(idx, 'points', e.target.value)}
                    placeholder="Points"
                    className="rounded-2 border-grey"
                    min="1"
                  />
                </CCol>
                <CCol md={2}>
                  <CInputGroup>
                    <CInputGroupText>₹</CInputGroupText>
                    <CFormInput
                      type="number"
                      value={w.rate}
                      onChange={(e) => handleWorkChange(idx, 'rate', e.target.value)}
                      placeholder="Rate"
                      className="rounded-2 border-grey"
                      min="0.01"
                      step="0.01"
                    />
                  </CInputGroup>
                </CCol>
                <CCol md={1} className="d-flex align-items-center">
                  <span className="text-success fw-medium">
                    ₹{(w.points || 0) * (w.rate || 0)}
                  </span>
                </CCol>
                <CCol md={1} className="d-flex align-items-center">
                  <CButton
                    color="danger"
                    size="sm"
                    shape="rounded-pill"
                    className="shadow-sm"
                    onClick={() => removeWorkRow(idx)}
                    disabled={works.length === 1}
                  >
                    ×
                  </CButton>
                </CCol>
              </CRow>
            ))}
            
            <CButton
              color="warning"
              variant="outline"
              className="mb-4 rounded-pill shadow-sm px-4"
              onClick={addWorkRow}
            >
              + Add Work
            </CButton>
            
            <div className="mt-3">
              <CButton
                color="primary"
                className="bg-gradient rounded-pill shadow-sm px-5 py-2 me-2"
                onClick={createOrUpdateBudget}
                disabled={submitLoading}
              >
                {submitLoading ? (
                  <>
                    <CSpinner size="sm" className="me-2" />
                    {editingBudget ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  editingBudget ? 'Update Budget' : 'Create Budget'
                )}
              </CButton>
              
            </div>
          </CForm>
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

export default ProjectForm;