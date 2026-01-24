

import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CRow,
  CCol,
  CForm,
  CFormLabel,
  CFormInput,
  CFormTextarea,
  CFormCheck,
  CButton,
  CFormSelect,
} from '@coreui/react'
import { getAPICall, post } from '../../../util/api';
import { useToast } from '../../common/toast/ToastContext';
import { useNavigate } from 'react-router-dom';

const OperatorForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    address: '',
    bank_name: '',
    account_number: '',
    adhar_number: '',
    ifsc_code: '',
    pan_number: '',
    gst_no: '',
    payment: '',
    type: '',        // 0 = Supervisor, 1 = Operator, 2 = Vendor
    project_id: '',  // project id if supervisor
    show: true,
  });

  const [projects, setProjects] = useState([]);
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    getAPICall('/api/projects')
      .then(res => setProjects(Array.isArray(res) ? res : []))
      .catch(err => {
        console.error(err);
        setProjects([]);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      showToast("danger", 'Name is required');
      return;
    }
    if (!formData.mobile || formData.mobile.length !== 10) {
      showToast("danger", 'Mobile number must be 10 digits');
      return;
    }
    if (!formData.address.trim()) {
      showToast("danger", 'Address is required');
      return;
    }
    if (!formData.type) {
      showToast("danger", 'Role is required');
      return;
    }
    
    // Role-specific validations
    if (formData.type === "0" && !formData.project_id) {
      showToast("danger", 'Project is required for Supervisor');
      return;
    }
    if ((formData.type === "0" || formData.type === "1") && !formData.payment) {
      showToast("danger", 'Payment is required for Supervisor and Operator');
      return;
    }
    if (formData.type === "2" && !formData.gst_no.trim()) {
      showToast("danger", 'GST Number is required for Vendor');
      return;
    }
    if (formData.type === "3" && !formData.gst_no.trim()) {
      showToast("danger", 'GST Number is required for Vendor');
      return;
    }

    // Bank details validation
    if (formData.bank_name && !formData.account_number) {
      showToast("danger", 'Account Number is required when Bank Name is provided');
      return;
    }
    if (formData.account_number && !formData.bank_name) {
      showToast("danger", 'Bank Name is required when Account Number is provided');
      return;
    }
    if ((formData.bank_name || formData.account_number) && !formData.ifsc_code) {
      showToast("danger", 'IFSC Code is required when bank details are provided');
      return;
    }

    const payload = {
      ...formData,
      project_id: formData.type === "1" || formData.type === "2" || formData.type === "3" ? "0" : formData.project_id,
      payment: formData.type === "2" || formData.type === "3" ? "0" : formData.payment
    };

    try {
      await post('/api/operators', payload);
      showToast("success", 'User created successfully!');
      setFormData({
        name: '',
        mobile: '',
        address: '',
        bank_name: '',
        account_number: '',
        adhar_number: '',
        ifsc_code: '',
        pan_number: '',
        gst_no: '',
        payment: '',
        type: '',
        project_id: '',
        show: true,
      });
      navigate('/OpratorList');
    } catch (error) {
      console.error('Error creating user:', error.response?.data || error.message);
      showToast("danger", 'Failed to create user');
    }
  };

  return (
    <CCard className="mb-4">
      <CCardHeader>
        <strong>Create User (Supervisor / Operator / Vendor / Purches Vendor)</strong>
      </CCardHeader>
      <CCardBody>
        <CForm onSubmit={handleSubmit}>
          {/* 1. Name & Mobile */}
          <CRow className="mb-3">
            <CCol md={6}>
              <CFormLabel>Name <span style={{color: 'red'}}>*</span></CFormLabel>
              <CFormInput
                type="text"
                name="name"
                placeholder="Enter Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </CCol>

            <CCol md={6}>
              <CFormLabel>Mobile <span style={{color: 'red'}}>*</span></CFormLabel>
              <CFormInput
                type="text"
                name="mobile"
                placeholder="Enter Mobile Number (10 digits)"
                maxLength={10}
                value={formData.mobile}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value) && value.length <= 10) {
                    setFormData(prev => ({ ...prev, mobile: value }));
                  }
                }}
                required
              />
            </CCol>
          </CRow>

          {/* 2. Address */}
          <CRow className="mb-3">
            <CCol md={12}>
              <CFormLabel>Address <span style={{color: 'red'}}>*</span></CFormLabel>
              <CFormTextarea
                name="address"
                placeholder="Enter Address"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </CCol>
          </CRow>

          {/* 7. Bank Details - Bank Name, Account Number, IFSC in one row */}
          <CRow className="mb-3">
            <CCol md={4}>
              <CFormLabel>Bank Name</CFormLabel>
              <CFormInput
                name="bank_name"
                placeholder="Enter Bank Name"
                value={formData.bank_name}
                onChange={handleChange}
              />
            </CCol>
            <CCol md={4}>
              <CFormLabel>Account Number</CFormLabel>
              <CFormInput
                name="account_number"
                placeholder="Enter Account Number"
                maxLength={18}
                value={formData.account_number}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value)) {
                    setFormData(prev => ({ ...prev, account_number: value }));
                  }
                }}
              />
            </CCol>
            <CCol md={4}>
              <CFormLabel>IFSC Code</CFormLabel>
              <CFormInput
                name="ifsc_code"
                placeholder="Enter IFSC Code (11 characters)"
                maxLength={11}
                value={formData.ifsc_code}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  if (/^[A-Z0-9]*$/.test(value)) {
                    setFormData(prev => ({ ...prev, ifsc_code: value }));
                  }
                }}
              />
            </CCol>
          </CRow>

          {/* 8. Aadhar and PAN in one row */}
          <CRow className="mb-3">
            <CCol md={6}>
              <CFormLabel>Aadhar Number</CFormLabel>
              <CFormInput
                name="adhar_number"
                placeholder="Enter Aadhar Number (12 digits)"
                maxLength={12}
                value={formData.adhar_number}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value)) {
                    setFormData(prev => ({ ...prev, adhar_number: value }));
                  }
                }}
              />
            </CCol>
            <CCol md={6}>
              <CFormLabel>PAN Number</CFormLabel>
              <CFormInput
                name="pan_number"
                placeholder="Enter PAN Number (10 characters)"
                maxLength={10}
                value={formData.pan_number}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  if (/^[A-Z0-9]*$/.test(value)) {
                    setFormData(prev => ({ ...prev, pan_number: value }));
                  }
                }}
              />
            </CCol>
          </CRow>

          {/* 3. Role Selection */}
          <CRow className="mb-3">
            <CCol md={6}>
              <CFormLabel>Select Role <span style={{color: 'red'}}>*</span></CFormLabel>
              <CFormSelect
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <option value="">Select Role</option>
                <option value="0">Supervisor</option>
                <option value="1">Operator</option>
                <option value="2">Vendor</option>
                <option value="3">Purches Vendor</option>
              </CFormSelect>
            </CCol>

            <CCol md={6} className="d-flex align-items-center">
              <CFormCheck
                id="show"
                label="Show User"
                name="show"
                checked={formData.show}
                onChange={handleChange}
              />
            </CCol>
          </CRow>

          {/* 4. Payment and Project for Supervisor side by side */}
          {formData.type === "0" && (
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel>Payment <span style={{color: 'red'}}>*</span></CFormLabel>
                <CFormInput
                  type="number"
                  name="payment"
                  placeholder="Enter Payment Amount"
                  min="0"
                  value={formData.payment}
                  onKeyDown={(e) => { if (["-", "e", "E"].includes(e.key)) e.preventDefault(); }}
                  onChange={handleChange}
                  required
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Select Project <span style={{color: 'red'}}>*</span></CFormLabel>
                <CFormSelect
                  name="project_id"
                  value={formData.project_id}
                  onChange={handleChange}
                
                >
                  <option value="">Select Project</option>
                  {projects.map(proj => (
                    <option key={proj.id} value={String(proj.id)}>
                      {proj.project_name}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
            </CRow>
          )}

          {/* 5. Payment for Operator only */}
          {formData.type === "1" && (
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel>Payment <span style={{color: 'red'}}>*</span></CFormLabel>
                <CFormInput
                  type="number"
                  name="payment"
                  placeholder="Enter Payment Amount"
                  min="0"
                  value={formData.payment}
                  onKeyDown={(e) => { if (["-", "e", "E"].includes(e.key)) e.preventDefault(); }}
                  onChange={handleChange}
                  required
                />
              </CCol>
            </CRow>
          )}

          {/* 6. GST for Vendor */}
          {(formData.type === "2"|| formData.type === "3") && (
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel>GST Number <span style={{color: 'red'}}>*</span></CFormLabel>
                <CFormInput
                  name="gst_no"
                  placeholder="Enter GST Number (15 characters)"
                  maxLength={15}
                  value={formData.gst_no}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase();
                    if (/^[0-9A-Z]*$/.test(value)) {
                      setFormData(prev => ({ ...prev, gst_no: value }));
                    }
                  }}
                  required
                />
              </CCol>
            </CRow>
          )}

          {/* Submit / Close */}
          <CRow className="mt-3">
            <CCol xs="auto">
              <CButton type="submit" color="primary">
                Submit
              </CButton>
            </CCol>
            <CCol xs="auto">
              <CButton
                type="button"
                color="secondary"
                onClick={() => navigate("/OpratorList")}
              >
                Close
              </CButton>
            </CCol>
          </CRow>
        </CForm>
      </CCardBody>
    </CCard>
  )
}

export default OperatorForm;