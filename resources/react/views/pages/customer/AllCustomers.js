import React, { useEffect, useState, useMemo } from 'react';
import { 
  CBadge, 
  CButton, 
  CCol, 
  CRow, 
  CFormInput,
  CCard,
  CCardBody,
  CCardHeader,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow
} from '@coreui/react';

import { deleteAPICall, getAPICall } from '../../../util/api';
import ConfirmationModal from '../../common/ConfirmationModal';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../common/toast/ToastContext';
import { useTranslation } from 'react-i18next';
import NewCustomerModal from '../../common/NewCustomerModal';
import EditCustomerModal from '../../common/EditCustomerModal';

const AllCustomers = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t, i18n } = useTranslation('global');
  const lng = i18n.language;
  const [customers, setCustomers] = useState([]);
  const [deleteCustomer, setDeleteCustomer] = useState();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [newCustomerModalVisible, setNewCustomerModalVisible] = useState(false);
  const [editCustomerModalVisible, setEditCustomerModalVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const fetchCustomers = async () => {
    try {
      const response = await getAPICall('/api/customer');
      setCustomers(response);
    } catch (error) {
      showToast('danger', t('MSG.error_occurred') || 'An error occurred');
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    if (!searchTerm.trim()) return customers;
    
    return customers.filter(customer => 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.mobile && customer.mobile.toString().includes(searchTerm)) ||
      (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (customer.address && customer.address.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [customers, searchTerm]);

  const handleDelete = (p) => {
    setDeleteCustomer(p);
    setDeleteModalVisible(true);
  };

  const onDelete = async () => {
    try {
      await deleteAPICall(`/api/customer/${deleteCustomer.id}`);
      setDeleteModalVisible(false);
      fetchCustomers();
      showToast('success', t('MSG.project_deleted_successfully') || 'Project deleted successfully');
    } catch (error) {
      showToast('danger', t('MSG.error_occurred') || 'An error occurred');
    }
  };

  const handleEdit = (customer) => {
    setSelectedCustomer(customer);
    setEditCustomerModalVisible(true);
  };

  const handleAddNew = () => {
    setNewCustomerModalVisible(true);
  };

  const onNewCustomerSuccess = (newCustomer) => {
    fetchCustomers(); // Refresh the list
    showToast('success', t("LABELS.project_created") || 'Project created successfully');
  };

  const onEditCustomerSuccess = (updatedCustomer) => {
    fetchCustomers(); // Refresh the list
    showToast('success', t("LABELS.project_updated") || 'Project updated successfully');
  };

  return (
    <>
      {/* Updated CSS with proper column widths */}
      <style jsx global>{`
        /* Responsive table styles with frozen headers */
        .customers-table {
          width: 100%;
          table-layout: fixed;
        }

        /* Freeze table headers */
        .customers-table thead th {
          position: sticky;
          top: 0;
          z-index: 10;
          background-color: #f8f9fa;
          border-bottom: 2px solid #dee2e6;
          box-shadow: 0 2px 2px -1px rgba(0, 0, 0, 0.1);
        }

        /* Column width distribution */
        .customers-table .name-col {
          width: 30%;
          text-align: center;
          vertical-align: middle;
          padding: 8px 4px;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }

        .customers-table .mobile-col {
          width: 25%;
          text-align: center;
          vertical-align: middle;
          padding: 8px 4px;
        }

        .customers-table .address-col {
          width: 30%;
          text-align: center;
          vertical-align: middle;
          padding: 8px 4px;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }

        .customers-table .actions-col {
          width: 15%;
          text-align: center;
          vertical-align: middle;
          padding: 8px 4px;
        }

        .custom-placeholder::placeholder {
          font-size: 11px !important;
        }

        /* Ensure table container allows for sticky positioning */
        .table-responsive {
          max-height: 65vh;
          overflow-y: auto;
          border: 1px solid #dee2e6;
          border-radius: 0.375rem;
        }

        /* Header row layout */
        .header-row {
          justify-content: space-between;
          align-items: center;
        }

        /* Mobile responsive styles */
        @media (max-width: 768px) {
          .table-responsive {
            max-height: 65vh;
          }

          .customers-table .name-col,
          .customers-table .mobile-col,
          .customers-table .address-col,
          .customers-table .actions-col {
            padding: 6px 2px;
            font-size: 12px;
          }

          .customers-table .name-col {
            width: 30%;
          }

          .customers-table .mobile-col {
            width: 25%;
          }

          .customers-table .address-col {
            width: 30%;
          }

          .customers-table .actions-col {
            width: 15%;
          }

          .customers-table thead th {
            background-color: #f8f9fa;
            font-size: 12px;
          }

          .action-buttons {
            flex-direction: column;
            gap: 2px !important;
          }

          .action-buttons .badge {
            font-size: 10px;
            padding: 2px 6px;
          }

          /* Stack header elements on mobile */
          .header-row {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px;
          }

          .header-buttons {
            width: 100%;
          }

          .search-container {
            width: 100%;
          }
        }

        @media (max-width: 576px) {
          .table-responsive {
            max-height: 68vh;
          }

          .customers-table {
            font-size: 11px;
          }

          .customers-table .name-col,
          .customers-table .mobile-col,
          .customers-table .address-col,
          .customers-table .actions-col {
            padding: 4px 1px;
          }

          .customers-table thead th {
            font-size: 11px;
          }

          .customers-table .name-col {
            width: 30%;
          }

          .customers-table .mobile-col {
            width: 25%;
          }

          .customers-table .address-col {
            width: 30%;
          }

          .customers-table .actions-col {
            width: 15%;
          }

          /* Tighter spacing for customer info */
          .customers-table td div {
            line-height: 1.2 !important;
          }

          .customers-table td div div {
            margin-top: 1px !important;
          }
        }

        /* Search input styling */
        .search-container {
          position: relative;
          max-width: 300px;
        }

        .search-input {
          padding-left: 40px;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #6c757d;
          pointer-events: none;
        }

        .clear-search {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #6c757d;
          cursor: pointer;
          padding: 0;
          font-size: 16px;
        }

        .clear-search:hover {
          color: #dc3545;
        }

        /* Contact info styling */
        .contact-info {
          font-size: 0.85em;
          color: #6c757d;
          margin-top: 2px;
        }

        /* Address text with ellipsis for long content */
        .address-text {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      `}</style>

      {/* Header Row with Add New Button and Search Bar */}
      <CRow className="mb-3">
        <CCol xs={12}>
          <div className="d-flex header-row">
            <div className="header-buttons">
              <CButton color="primary" onClick={handleAddNew}>
                {t('LABELS.add_new_project') || 'Add New Project'}
              </CButton>
            </div>
            <div className="search-container">
              <CFormInput
                type="text"
                className="search-input"
                placeholder={t('LABELS.search_projects') || 'Search projects...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="search-icon">
                🔍
              </div>
              {searchTerm && (
                <button
                  className="clear-search"
                  onClick={() => setSearchTerm('')}
                  title={t('LABELS.clear_search') || 'Clear search'}
                >
                  ✕
                </button>
              )}
            </div>
          
          </div>
        </CCol>
      </CRow>
       

      {/* Search Results Info */}
      {searchTerm && (
        <CRow className="mb-3">
          <CCol xs={12}>
            <small className="text-muted">
              {filteredCustomers.length} {t('LABELS.projects_found') || 'projects found for'} "{searchTerm}"
            </small>
          </CCol>
        </CRow>
      )}
      
      <CRow>
        {/* Confirmation Modal for Delete */}
        <ConfirmationModal
          visible={deleteModalVisible}
          setVisible={setDeleteModalVisible}
          onYes={onDelete}
          resource={`${t('LABELS.delete_project') || 'Delete project'} - ${deleteCustomer?.name}`}
        />

        {/* New Customer Modal */}
        <NewCustomerModal
          visible={newCustomerModalVisible}
          setVisible={setNewCustomerModalVisible}
          onSuccess={onNewCustomerSuccess}
          hint=""
        />

        {/* Edit Customer Modal */}
        <EditCustomerModal
          visible={editCustomerModalVisible}
          setVisible={setEditCustomerModalVisible}
          onSuccess={onEditCustomerSuccess}
          customer={selectedCustomer}
        />

        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <strong>{t('LABELS.all_projects') || 'All Projects'}</strong>
              <small className="text-muted">
                {t('LABELS.total') || 'Total'}: {filteredCustomers.length} {t('LABELS.projects') || 'projects'}
              </small>
            </CCardHeader>
            <CCardBody className="p-0">
              <div className="table-responsive">
                <CTable className="customers-table mb-0">
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell scope="col" className="name-col">{t('LABELS.name') || 'Name'}</CTableHeaderCell>
                      <CTableHeaderCell scope="col" className="mobile-col">{t('LABELS.mobile') || 'Mobile'}</CTableHeaderCell>
                      <CTableHeaderCell scope="col" className="address-col">{t('LABELS.address') || 'Address'}</CTableHeaderCell>
                      <CTableHeaderCell scope="col" className="actions-col">{t('LABELS.actions') || 'Actions'}</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {filteredCustomers.length === 0 ? (
                      <CTableRow>
                        <CTableDataCell colSpan={4} className="text-center py-4 text-muted">
                          {searchTerm ? 
                            (t('LABELS.no_projects_found') || 'No projects found') : 
                            (t('LABELS.no_projects_available') || 'No projects available')
                          }
                        </CTableDataCell>
                      </CTableRow>
                    ) : (
                      filteredCustomers.map((customer, index) => (
                        <CTableRow key={customer.id}>
                          <CTableDataCell className="name-col">
                            <div style={{ wordBreak: 'break-word' }}>
                              <div style={{ fontWeight: '500' }}>{customer.name}</div>
                              {customer.email && (
                                <div className="contact-info">
                                  {customer.email}
                                </div>
                              )}
                            </div>
                          </CTableDataCell>
                          <CTableDataCell className="mobile-col">
                            <div style={{ fontWeight: '500' }}>
                              {customer.mobile || '-'}
                            </div>
                          </CTableDataCell>
                          <CTableDataCell className="address-col">
                            <div className="address-text" title={customer.address}>
                              {customer.address || '-'}
                            </div>
                          </CTableDataCell>
                          <CTableDataCell className="actions-col">
                            <div className="action-buttons d-flex justify-content-center gap-1">
                              <CBadge
                                role="button"
                                color="info"
                                onClick={() => handleEdit(customer)}
                                style={{ cursor: 'pointer', fontSize: '0.75em' }}
                              >
                                {t('LABELS.edit') || 'Edit'}
                              </CBadge>
                              {/* Uncomment if delete functionality is needed
                              <CBadge
                                role="button"
                                color="danger"
                                onClick={() => handleDelete(customer)}
                                style={{ cursor: 'pointer', fontSize: '0.75em' }}
                              >
                                {t('LABELS.delete') || 'Delete'}
                              </CBadge>
                              */}
                            </div>
                          </CTableDataCell>
                        </CTableRow>
                      ))
                    )}
                  </CTableBody>
                </CTable>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  );
};

export default AllCustomers;