import React, { useEffect, useState } from 'react';
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormFeedback,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormTextarea,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react';
import { getAPICall, post } from '../../../util/api';
import { getUserData } from '../../../util/session';
import { useToast } from '../../common/toast/ToastContext';
import { useTranslation } from 'react-i18next';

const NewCustomerBulkUpload = () => {
  const { showToast } = useToast();
  const { t } = useTranslation("global");
  const user = getUserData();

  const [companyList, setCompanyList] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const [customers, setCustomers] = useState([
    { name: '', mobile: '', address: '', credit: 0, company_id: '' }
  ]);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const resp = await getAPICall('/api/companies');
        if (resp?.length) {
          const mappedList = resp.map(itm => ({ label: itm.company_name, value: itm.company_id }));
          if (user.type === 0) {
            setCompanyList(mappedList);
          } else {
            setCompanyList(mappedList.filter(e => e.value === user.company_id));
            setSelectedCompany(user.company_id);
          }
        }
      } catch (error) {
        showToast('danger', 'Error occurred fetching companies: ' + error);
      }
    };

    fetchCompanies();
  }, []);

  const handleChange = (index, e) => {
    const { name, value } = e.target;
    const updatedCustomers = [...customers];
    updatedCustomers[index][name] = value;
    setCustomers(updatedCustomers);
  };

  const handleAddCustomer = () => {
    setCustomers([
      ...customers,
      {
        name: '',
        mobile: '',
        address: '',
        credit: 0,
        company_id: selectedCompany
      },
    ]);
  };

  const handleRemoveCustomer = (index) => {
    const updatedCustomers = customers.filter((_, i) => i !== index);
    setCustomers(updatedCustomers);
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData('text');
    const rows = paste.trim().split('\n');
    const parsedCustomers = rows.map(row => {
      const cols = row.split(/\t|,/); // handle tab or comma
      return {
        name: cols[0]?.trim() || '',
        mobile: cols[1]?.trim() || '',
        address: cols[2]?.trim() || '',
        credit: parseFloat(cols[3]) || 0,
        company_id: selectedCompany
      };
    });
    setCustomers(parsedCustomers);
    e.preventDefault();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};

    if (!selectedCompany) errors.selectedCompany = true;

    customers.forEach((c, i) => {
      if (!c.name.trim()) errors[`name-${i}`] = true;
      if (!/^\d{10}$/.test(c.mobile)) errors[`mobile-${i}`] = true;
    });

    const hasDuplicateMobile = new Set(customers.map(c => c.mobile)).size !== customers.length;
    if (hasDuplicateMobile) {
      showToast('danger', 'Duplicate mobile numbers are not allowed.');
      return;
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showToast('danger', 'Please fix validation errors before submitting.');
      return;
    }

    let data = [...customers];
    data = data.map(c => ({
      ...c,
      company_id: selectedCompany
    }));

    try {
      const resp = await post('/api/bulkCustomerCreation', data);
      if (resp?.success) {
        showToast('success', 'Customers created');
        setCustomers([{
          name: '', mobile: '', address: '', credit: 0,
          company_id: selectedCompany
        }]);
        setFormErrors({});
      } else {
        showToast('danger', 'Error occurred, please try again later.');
      }
    } catch (error) {
      showToast('danger', 'Error occurred ' + error);
    }
  };

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Bulk Add Customers</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit}>
              <CRow className="mb-3">
                <CCol md={6}>
                  <CFormLabel>Select Company</CFormLabel>
                  <CFormSelect
                    value={selectedCompany}
                    onChange={(e) => {
                      setSelectedCompany(e.target.value);
                      setFormErrors(prev => ({ ...prev, selectedCompany: false }));
                      setCustomers(customers.map(c => ({ ...c, company_id: e.target.value })));
                    }}
                    invalid={formErrors.selectedCompany}
                  >
                    <option value="">Select</option>
                    {companyList.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </CFormSelect>
                  {formErrors.selectedCompany && (
                    <CFormFeedback invalid>Please select a company.</CFormFeedback>
                  )}
                </CCol>
              </CRow>

              <CRow className="mb-3">
                <CCol>
                  <CFormLabel>Paste Excel Data (Name, Mobile, Address, Credit)</CFormLabel>
                  <CFormTextarea
                    rows={2}
                    placeholder="Paste tab or comma separated data here, or data from excel sheet. Eg= Ravi Kumar,9871234567,Bazaar Road,0"
                    onPaste={handlePaste}
                  />
                </CCol>
              </CRow>

              <CTable bordered responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Name</CTableHeaderCell>
                    <CTableHeaderCell>Mobile</CTableHeaderCell>
                    <CTableHeaderCell>Address</CTableHeaderCell>
                    <CTableHeaderCell>Credit</CTableHeaderCell>
                    <CTableHeaderCell>Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {customers.map((customer, index) => (
                    <CTableRow key={index}>
                      <CTableDataCell>
                        <CFormInput
                          name="name"
                          value={customer.name}
                          onChange={(e) => handleChange(index, e)}
                          invalid={!!formErrors[`name-${index}`]}
                        />
                        {formErrors[`name-${index}`] && (
                          <CFormFeedback invalid>Name is required.</CFormFeedback>
                        )}
                      </CTableDataCell>
                      <CTableDataCell>
                        <CFormInput
                          name="mobile"
                          value={customer.mobile}
                          onChange={(e) => handleChange(index, e)}
                          minLength={10}
                          maxLength={10}
                          pattern="\d{10}"
                          invalid={!!formErrors[`mobile-${index}`]}
                        />
                        {formErrors[`mobile-${index}`] && (
                          <CFormFeedback invalid>Enter a valid 10-digit mobile.</CFormFeedback>
                        )}
                      </CTableDataCell>
                      <CTableDataCell>
                        <CFormTextarea
                          name="address"
                          rows={1}
                          value={customer.address}
                          onChange={(e) => handleChange(index, e)}
                        />
                      </CTableDataCell>
                      <CTableDataCell>
                        <CFormInput
                          type="number"
                          name="credit"
                          onWheel={(e) => e.target.blur()}
                          value={customer.credit}
                          onChange={(e) => handleChange(index, e)}
                          min={0}
                        />
                      </CTableDataCell>
                      <CTableDataCell>
                        <CButton color="danger" onClick={() => handleRemoveCustomer(index)}>Remove</CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>

              <div className="d-flex justify-content-between mt-3">
                <CButton color="primary" onClick={handleAddCustomer}>
                  Add Another Customer
                </CButton>
                <CButton color="success" type="submit">
                  Submit
                </CButton>
              </div>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default NewCustomerBulkUpload;