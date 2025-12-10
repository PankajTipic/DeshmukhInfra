import { CBadge, CForm, CFormInput, CFormLabel, CModal, CModalBody, CModalHeader, CModalTitle, CButton } from '@coreui/react';
import { cilSortAscending, cilSortDescending, cilX } from '@coreui/icons'; // Import sorting and close icons
import { useCallback, useEffect, useState } from 'react';
import { useToast } from './toast/ToastContext';
import { useTranslation } from 'react-i18next';
import React from 'react';
import { fetchCustomers, filterCustomers } from '../../util/customers';
import CIcon from '@coreui/icons-react';

export default function AllCustomerModal({ visible, setVisible, newCustomer, onClick }) {
  const { showToast } = useToast();
  const { t } = useTranslation("global");
  const [suggestions, setSuggestions] = useState([]);
  const [filterText, setFilterText] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');

  const searchCustomer = useCallback(async (value = '', sortValue = 'asc') => {
    try {
      const customers = await fetchCustomers();
      const filteredCustomers = filterCustomers(customers, value);
      const sortedCustomers = filteredCustomers.sort((a, b) => 
        sortValue === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
      );
      setSuggestions(sortedCustomers); // Removed the extra 'asc' parameter that was causing issues
    } catch (error) {
      showToast('danger', 'Error occurred ' + error);
    }
  }, [showToast]); // Removed sortOrder from dependencies to prevent infinite loop

  useEffect(() => {
    if (visible) {
      searchCustomer('', sortOrder);
    }
  }, [visible]); // Removed searchCustomer from dependencies to prevent infinite loop
  
  const handleChange = (e) => {
    const { value } = e.target;
    setFilterText(value);
    searchCustomer(value, sortOrder);
  };

  const toggleSortOrder = () => {
    const newValue = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newValue);
    searchCustomer(filterText, newValue);
  };

  const handleClear = () => {
    setFilterText('');
  }
  
  return (
    <>
      <CModal
        backdrop="static"
        visible={visible}
        onClose={() => {handleClear();setVisible(false);}}
        aria-labelledby="StaticBackdropExampleLabel"
      >
        <CModalBody>
          <div>
            <CModalTitle id="StaticBackdropExampleLabel">{t("LABELS.all_customers")}</CModalTitle>
            <CButton
              color="danger"
              onClick={() => { handleClear(); setVisible(false); }}
              style={{ position: 'absolute', right: '10px', top: '10px' }}
              aria-label="Close"
            >
              <CIcon icon={cilX} />
            </CButton>
          </div>
          <CForm className="needs-validation" noValidate>
            <div className="mb-3">
              <CFormLabel htmlFor="filterText">{}</CFormLabel>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <CFormInput
                  type="text"
                  id="filterText"
                  placeholder={t('MSG.enter_customer_name_msg')}
                  name="filterText"
                  value={filterText}
                  onChange={handleChange}
                  required
                  feedbackInvalid={t('MSG.please_provide_name')}
                  feedbackValid={t('MSG.looks_good_msg')}
                />
                <CIcon 
                  icon={sortOrder === 'asc' ? cilSortAscending : cilSortDescending} 
                  style={{ cursor: 'pointer', marginLeft: '10px' }} 
                  onClick={toggleSortOrder}
                />
              </div>
              <div className="invalid-feedback">{t("MSG.name_is_required_msg")}</div>
            </div>
            <ul 
              className="suggestions-list" 
              style={{
                maxHeight: '325px', 
                overflowY: 'auto',
                right: '0px',
                listStyle: 'none',
                padding: '0',
                margin: '0'
              }}
            >
              {suggestions.map((suggestion, index) => (
                <li 
                  key={index} 
                  onClick={() => {onClick(suggestion);setVisible(false);}}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #e0e0e0',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease',
                    fontSize: '14px',
                    color: '#333'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#f5f5f5';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                  }}
                >
                  {suggestion.name + ' (' + suggestion.mobile + ')'}
                </li>
              ))}
              {suggestions.length === 0 && 
                <li 
                  onClick={() => newCustomer(true)}
                  style={{
                    padding: '16px',
                    textAlign: 'center'
                  }}
                >
                  <CBadge
                    role="button"
                    color="danger"
                  >
                    {t("LABELS.new_customer")}
                  </CBadge>
                </li>
              }
            </ul>
          </CForm>
        </CModalBody>
      </CModal>
    </>
  )
}