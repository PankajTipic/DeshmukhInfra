import React, { useEffect, useState, useMemo } from 'react';
import {
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CFormCheck,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CRow,
  CFormSelect,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow
} from '@coreui/react';
import { deleteAPICall, getAPICall, post, put } from '../../../util/api';
import ConfirmationModal from '../../common/ConfirmationModal';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../common/toast/ToastContext';
import { useTranslation } from 'react-i18next';

const AllExpenseType = () => {
  const navigate = useNavigate();
  const [expenseType, setExpenseType] = useState([]);
  const [deleteResource, setDeleteResource] = useState();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const { showToast } = useToast();
  const { t, i18n } = useTranslation("global");
  const lng = i18n.language;
  const [searchTerm, setSearchTerm] = useState('');

  // New expense type form state
  const [newExpenseModalVisible, setNewExpenseModalVisible] = useState(false);
  const [editExpenseModalVisible, setEditExpenseModalVisible] = useState(false);
  const [validated, setValidated] = useState(false);
  const [expenseTypeForm, setExpenseTypeForm] = useState({
    name: '',
    localName: '',
    expense_category: '',
    desc: '',
    show: 1,
  });
  const [currentExpenseTypeId, setCurrentExpenseTypeId] = useState(null);

  const fetchExpenseType = async () => {
    try {
      const response = await getAPICall('/api/expenseType');
      setExpenseType(response); // Keep all fields, including 'id'
    } catch (error) {
      showToast('danger', 'Error occurred ' + error);
    }
  };

  useEffect(() => {
    fetchExpenseType();
  }, []);

  const filteredExpenseTypes = useMemo(() => {
    if (!searchTerm.trim()) return expenseType;
    
    return expenseType.filter(expense => 
      expense.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (expense.localName && expense.localName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (expense.expense_category && expense.expense_category.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (expense.desc && expense.desc.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [expenseType, searchTerm]);

  const handleDelete = (p) => {
    setDeleteResource(p); // Store the resource with the full data (including id)
    setDeleteModalVisible(true);
  };

  const onDelete = async () => {
    try {
      await deleteAPICall('/api/expenseType/' + deleteResource.id); // Use the expense `id` from the resource
      setDeleteModalVisible(false);
      fetchExpenseType();
      showToast('success', t("MSG.expense_type_deleted_successfully") || 'Expense type deleted successfully'); // Refresh the list after deletion
    } catch (error) {
      showToast('danger', 'Error occurred ' + error);
    }
  };

  const handleEdit = (p) => {
    setCurrentExpenseTypeId(p.id);
    setExpenseTypeForm({
      name: p.name || '',
      localName: p.localName || '',
      expense_category : p.expense_category || '',
      desc: p.desc || '',
      show: p.show,
    });
    setValidated(false);
    setEditExpenseModalVisible(true);
  };

  const handleNewExpenseTypeClick = () => {
    setExpenseTypeForm({
      name: '',
      localName: '',
      expense_category: '',
      desc: '',
      show: 1,
    });
    setValidated(false);
    setNewExpenseModalVisible(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      setExpenseTypeForm({ ...expenseTypeForm, [name]: checked ? 1 : 0 });
    } else if (name === 'name') {
      // Only restrict the main name field to alphanumeric characters
      const regex = /^[a-zA-Z0-9 ]*$/;
      if (regex.test(value)) {
        setExpenseTypeForm({ ...expenseTypeForm, [name]: value });
      }
    } else {
      // Allow all characters for localName and other fields
      setExpenseTypeForm({ ...expenseTypeForm, [name]: value });
    }
  };

  const handleSubmitNewExpenseType = async (event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    setValidated(true);

    if (!expenseTypeForm.name) {
      return;
    }

    try {
      // Create a clean object for submission
      const submissionData = {
        name: expenseTypeForm.name,
        localName: expenseTypeForm.localName || '',
        expense_category : expenseTypeForm.expense_category || '',
        desc: expenseTypeForm.desc || '',
        show: expenseTypeForm.show === 1 ? 1 : 0,
        // Add the slug functionality here
        slug: expenseTypeForm.name.replace(/[^\w]/g, '_'), // This will generate a slug
      };

      const resp = await post('/api/expenseType', submissionData);
      if (resp) {
        showToast('success', t("MSG.expense_type_added_successfully_msg") || 'Expense type added successfully');
        setNewExpenseModalVisible(false);
        fetchExpenseType();
      } else {
        showToast('danger', t("MSG.failed_to_add_expense_type_msg") || 'Error occurred. Please try again later.');
      }
    } catch (error) {
      showToast('danger', 'Error occurred: ' + error);
    }
  };

  const handleSubmitEditExpenseType = async (event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    setValidated(true);

    if (!expenseTypeForm.name) {
      return;
    }

    try {
      // Create a clean object for submission
      const submissionData = {
        name: expenseTypeForm.name,
        localName: expenseTypeForm.localName || '',
        expense_category: expenseTypeForm.expense_category || '',
        desc: expenseTypeForm.desc || '',
        show: expenseTypeForm.show === 1 ? 1 : 0,
      };

      const resp = await put(`/api/expenseType/${currentExpenseTypeId}`, submissionData);
      if (resp) {
        showToast('success', t("MSG.expense_type_updated_successfully_msg") || 'Expense type updated successfully');
        setEditExpenseModalVisible(false);
        fetchExpenseType();
      } else {
        showToast('danger', t("MSG.failed_to_update_expense_type_msg") || 'Error occurred. Please try again later.');
      }
    } catch (error) {
      showToast('danger', 'Error occurred: ' + error);
    }
  };

  return (
    <>
      {/* Enhanced responsive CSS with horizontal scroll */}
      <style jsx global>{`
        .table-responsive-custom {
  overflow-x: auto;
  overflow-y: auto;
  max-height: 70vh;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  background: white;
  position: relative;
}

/* Custom scrollbar */
.table-responsive-custom::-webkit-scrollbar {
  height: 8px;
  width: 8px;
}

.table-responsive-custom::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.table-responsive-custom::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.table-responsive-custom::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Main table */
.expense-types-table {
  min-width: 800px;
  width: 100%;
  table-layout: fixed;
  margin-bottom: 0;
}

/* Sticky header */
.expense-types-table thead th {
  position: sticky;
  top: 0;
  z-index: 20;
  background-color: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  white-space: nowrap;
  font-weight: 600;
  padding: 12px 8px;
  vertical-align: middle;
}

/* Column widths */
.expense-types-table .sr-no-col {
  width: 80px;
  min-width: 60px;
  text-align: center;
}

.expense-types-table .name-col,
.expense-types-table .local-name-col {
  width: 150px;
  min-width: 120px;
  text-align: left;
}

.expense-types-table .category-col {
  width: 160px;
  min-width: 140px;
  text-align: left;
}

.expense-types-table .desc-col {
  width: 200px;
  min-width: 150px;
  text-align: left;
}

.expense-types-table .status-col {
  width: 100px;
  min-width: 80px;
  text-align: center;
}

.expense-types-table .actions-col {
  width: 120px;
  min-width: 100px;
  text-align: center;
}

/* Table cells */
.expense-types-table td {
  padding: 12px 8px;
  vertical-align: middle;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

/* Text truncation */
.text-truncate-custom {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

/* Header layout */
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.header-buttons {
  flex-shrink: 0;
  margin-right: auto; /* Pushes it to the left */
}

/* Search container */
.search-container {
  position: relative;
  max-width: 350px;
  min-width: 250px;
}

.search-input {
  padding-left: 40px;
  padding-right: 35px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  pointer-events: none;
  font-size: 14px;
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
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clear-search:hover {
  color: #dc3545;
}

/* Action buttons */
.action-buttons {
  display: flex;
  justify-content: center;
  gap: 4px;
  flex-wrap: wrap;
}

.action-buttons .badge {
  font-size: 0.7em;
  padding: 4px 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  min-width: 35px;
  text-align: center;
  border-radius: 4px;
}

.action-buttons .badge:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* Status badges */
.badge-visible {
  background-color: #28a745 !important;
  color: white !important;
}

.badge-hidden {
  background-color: #dc3545 !important;
  color: white !important;
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #6c757d;
}

.empty-state-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

/* Loading states */
.table-loading {
  opacity: 0.7;
  pointer-events: none;
}

.fade-in {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Responsive breakpoints */

/* Large tablets (992px - 1199px) */
@media (max-width: 1199px) and (min-width: 992px) {
  .expense-types-table {
    min-width: 750px;
  }
  
  .search-container {
    max-width: 300px;
    min-width: 200px;
  }
}

/* Tablets (768px - 991px) */
@media (max-width: 991px) and (min-width: 768px) {
  .table-responsive-custom {
    max-height: 65vh;
  }

  .expense-types-table {
    min-width: 700px;
    font-size: 0.95em;
  }

  .expense-types-table thead th,
  .expense-types-table td {
    padding: 12px 8px;
    font-size: 0.95em;
  }

  .header-row {
    justify-content: center;
    text-align: center;
  }

  .search-container {
    max-width: 100%;
    min-width: 250px;
  }

  .action-buttons .badge {
    font-size: 0.75em;
    padding: 6px 10px;
    min-width: 40px;
  }
}

/* Small tablets (576px - 767px) */
@media (max-width: 767px) and (min-width: 576px) {
  .table-responsive-custom {
    max-height: 60vh;
  }

  .expense-types-table {
    min-width: 650px;
    font-size: 0.9em;
  }

  .expense-types-table thead th {
    font-size: 0.9em;
    font-weight: 700;
    padding: 10px 6px;
  }

  .expense-types-table td {
    padding: 10px 6px;
    font-size: 0.9em;
  }

  .expense-types-table .sr-no-col {
    width: 60px;
    min-width: 50px;
  }

  .expense-types-table .name-col,
  .expense-types-table .local-name-col {
    width: 120px;
    min-width: 100px;
  }

  .expense-types-table .category-col {
    width: 130px;
    min-width: 110px;
  }

  .expense-types-table .desc-col {
    width: 140px;
    min-width: 120px;
  }

  .expense-types-table .status-col {
    width: 80px;
    min-width: 70px;
  }

  .expense-types-table .actions-col {
    width: 100px;
    min-width: 90px;
  }

  .header-row {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }

  .search-container {
    max-width: 100%;
    min-width: auto;
  }

  .action-buttons .badge {
    font-size: 0.8em;
    padding: 6px 10px;
    min-width: 40px;
  }
}

/* Mobile phones (up to 575px) */
@media (max-width: 575px) {
  .table-responsive-custom {
    max-height: 55vh;
  }

  .expense-types-table {
    min-width: 600px;
    font-size: 0.85em;
  }

  .expense-types-table thead th {
    font-size: 0.85em;
    padding: 8px 4px;
    font-weight: 700;
  }

  .expense-types-table td {
    padding: 8px 4px;
    font-size: 0.85em;
  }

  .expense-types-table .sr-no-col {
    width: 50px;
    min-width: 45px;
  }

  .expense-types-table .name-col,
  .expense-types-table .local-name-col {
    width: 110px;
    min-width: 90px;
  }

  .expense-types-table .category-col {
    width: 120px;
    min-width: 100px;
  }

  .expense-types-table .desc-col {
    width: 130px;
    min-width: 110px;
  }

  .expense-types-table .status-col {
    width: 70px;
    min-width: 60px;
  }

  .expense-types-table .actions-col {
    width: 90px;
    min-width: 80px;
  }

  .header-row {
    flex-direction: column;
    gap: 12px;
  }

  .search-container {
    width: 100%;
    max-width: 100%;
    min-width: 100%;
  }

  .search-input {
    width: 100%;
  }

  .action-buttons .badge {
    font-size: 0.7em;
    padding: 4px 6px;
    min-width: 30px;
  }

  .badge-visible,
  .badge-hidden {
    font-size: 0.7em;
    padding: 4px 6px;
  }
}

/* Extra small devices (up to 400px) */
@media (max-width: 400px) {
  .expense-types-table {
    min-width: 550px;
    font-size: 0.8em;
  }

  .expense-types-table thead th {
    font-size: 0.8em;
    padding: 6px 3px;
  }

  .expense-types-table td {
    padding: 6px 3px;
    font-size: 0.8em;
  }

  .expense-types-table .sr-no-col,
  .expense-types-table .status-col {
    width: 45px;
    min-width: 40px;
  }

  .expense-types-table .name-col,
  .expense-types-table .local-name-col {
    width: 100px;
    min-width: 80px;
  }

  .expense-types-table .category-col {
    width: 110px;
    min-width: 90px;
  }

  .expense-types-table .desc-col {
    width: 120px;
    min-width: 100px;
  }

  .expense-types-table .actions-col {
    width: 80px;
    min-width: 70px;
  }

  .action-buttons .badge {
    font-size: 0.65em;
    padding: 3px 5px;
    min-width: 25px;
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .action-buttons .badge {
    transition: none;
  }
  
  .action-buttons .badge:hover {
    transform: none;
  }
  
  .fade-in {
    animation: none;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .expense-types-table thead th {
    border-bottom: 3px solid #000;
  }
  
  .table-responsive-custom {
    border: 2px solid #000;
  }
}

/* Touch improvements */
@media (max-width: 767px) {
  .action-buttons .badge {
    touch-action: manipulation;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
  }
  
  .action-buttons .badge:active {
    transform: scale(0.95);
  }
}
      `}</style>

      {/* Header Row with Add New Button and Search Bar */}
      <CRow className="mb-3">
        <CCol xs={12}>
          <div className="header-row">
            <div className="header-buttons">
              <CButton color="success" onClick={handleNewExpenseTypeClick}>
                {t("LABELS.new_expense_type") || "New Expense Type"}
              </CButton>
            </div>
            <div className="search-container">
              <CFormInput
                type="text"
                className="search-input"
                placeholder={t('LABELS.search_expense_types') || 'Search expense types...'}
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
                  aria-label="Clear search"
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
              {filteredExpenseTypes.length} { 'expense types found for'} "{searchTerm}"
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
          resource={'Delete expense type - ' + deleteResource?.name}
        />

      {/* New Expense Type Modal */}
<CModal
  visible={newExpenseModalVisible}
  onClose={() => setNewExpenseModalVisible(false)}
  size="lg"
>
  <CModalHeader>
    <CModalTitle>{t("LABELS.new_expense_type") || "New Expense Type"}</CModalTitle>
  </CModalHeader>
  <CModalBody>
    <CForm noValidate validated={validated} onSubmit={handleSubmitNewExpenseType}>
      <div className="row">
        <div className="col-sm-6">
          <div className="mb-3">
            <CFormLabel htmlFor="name"><b>{t("LABELS.name") || "Name"} *</b></CFormLabel>
            <CFormInput
              type="text"
              id="name"
              placeholder=""
              name="name"
              value={expenseTypeForm.name}
              onChange={handleFormChange}
              required
              feedbackInvalid={t("MSG.please_provide_name_msg") || "Please provide a name. Only alphabets, numbers and spaces are allowed."}
            />
          </div>
        </div>
        <div className="col-sm-6">
          <div className="mb-3">
            <CFormLabel htmlFor="localName"><b>{t("LABELS.local_name") || "Local Name"} *</b></CFormLabel>
            <CFormInput
              type="text"
              id="localName"
              placeholder=""
              name="localName"
              value={expenseTypeForm.localName}
              onChange={handleFormChange}
              required
              feedbackInvalid={t("MSG.please_provide_local_name_msg") || "Please provide a local name."}
            />
          </div>
        </div>
      </div>
      <div className="mb-3">
        <CFormLabel htmlFor="expense_category"><b>{t("LABELS.expense_category")} *</b></CFormLabel>
        <CFormSelect
          id="expense_category"
          name="expense_category"
          value={expenseTypeForm.expense_category}
          onChange={handleFormChange}
          required
          feedbackInvalid="Please select an expense category."
        >
          <option value="">-- Select Category --</option>
          <option value="Operational Expense">Operational Expense</option>
          <option value="Capital Expense">Capital Expense</option>
        </CFormSelect>
      </div>

      <div className="row">
        <div className="col-sm-12">
          <div className="mb-3">
            <CFormLabel htmlFor="desc"><b>{t("LABELS.short_desc") || "Short Description"} *</b></CFormLabel>
            <CFormInput
              type="text"
              id="desc"
              placeholder=""
              name="desc"
              value={expenseTypeForm.desc}
              onChange={handleFormChange}
              required
              feedbackInvalid={t("MSG.please_provide_description_msg") || "Please provide a short description."}
            />
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-sm-6">
          <div className="mb-3">
            <CFormCheck
              id="show"
              label={t("LABELS.visible") || "Visible"}
              name="show"
              checked={expenseTypeForm.show === 1}
              onChange={handleFormChange}
            />
          </div>
        </div>
      </div>
    </CForm>
  </CModalBody>
  <CModalFooter>
    <CButton
      color="secondary"
      onClick={() => setNewExpenseModalVisible(false)}
    >
      {t("LABELS.cancel") || "Cancel"}
    </CButton>
    <CButton
      color="primary"
      onClick={handleSubmitNewExpenseType}
    >
      {t("LABELS.submit") || "Submit"}
    </CButton>
  </CModalFooter>
</CModal>

        {/* Edit Expense Type Modal */}
        <CModal
          visible={editExpenseModalVisible}
          onClose={() => setEditExpenseModalVisible(false)}
          size="lg"
        >
          <CModalHeader>
            <CModalTitle>{t("LABELS.edit_expense_type") || "Edit Expense Type"}</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CForm noValidate validated={validated} onSubmit={handleSubmitEditExpenseType}>
              <div className="row">
                <div className="col-sm-6">
                  <div className="mb-3">
                    <CFormLabel htmlFor="edit-name"><b>{t("LABELS.name") || "Name"}</b></CFormLabel>
                    <CFormInput
                      type="text"
                      id="edit-name"
                      placeholder=""
                      name="name"
                      value={expenseTypeForm.name}
                      onChange={handleFormChange}
                      required
                      feedbackInvalid={t("MSG.please_provide_name_msg") || "Please provide a name. Only alphabets, numbers and spaces are allowed."}
                    />
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="mb-3">
                    <CFormLabel htmlFor="edit-localName"><b>{t("LABELS.local_name") || "Local Name"}</b></CFormLabel>
                    <CFormInput
                      type="text"
                      id="edit-localName"
                      placeholder=""
                      name="localName"
                      value={expenseTypeForm.localName}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>
              </div>
              <div className="mb-3">
                <CFormLabel htmlFor="expense_category"><b>{t("LABELS.expense_category")}</b></CFormLabel>
                <CFormSelect
                  id="expense_category"
                  name="expense_category"
                  value={expenseTypeForm.expense_category}
                  onChange={handleFormChange}
                  required
                  feedbackInvalid="Please select an expense category."
                >
                  <option value="">-- Select Category --</option>
                  <option value="Operational Expense">Operational Expense</option>
                  <option value="Capital Expense">Capital Expense</option>
                </CFormSelect>
              </div>
              <div className="row">
                <div className="col-sm-12">
                  <div className="mb-3">
                    <CFormLabel htmlFor="edit-desc"><b>{t("LABELS.short_desc") || "Short Description"}</b></CFormLabel>
                    <CFormInput
                      type="text"
                      id="edit-desc"
                      placeholder=""
                      name="desc"
                      value={expenseTypeForm.desc}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-sm-6">
                  <div className="mb-3">
                    <CFormCheck
                      id="edit-show"
                      label={t("LABELS.visible") || "Visible"}
                      name="show"
                      checked={expenseTypeForm.show === 1}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>
              </div>
            </CForm>
          </CModalBody>
          <CModalFooter>
            <CButton
              color="secondary"
              onClick={() => setEditExpenseModalVisible(false)}
            >
              {t("LABELS.cancel") || "Cancel"}
            </CButton>
            <CButton
              color="primary"
              onClick={handleSubmitEditExpenseType}
            >
              {t("LABELS.update") || "Update"}
            </CButton>
          </CModalFooter>
        </CModal>

        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center flex-wrap">
              <strong>{t("LABELS.all_expense_types") || "All Expense Types"}</strong>
              <small className="text-muted">
                {t('LABELS.total') || 'Total'}: {filteredExpenseTypes.length} {t('LABELS.expense_types') || 'expense types'}
              </small>
            </CCardHeader>
            <CCardBody className="p-0">
              <div className="table-responsive-custom">
                {/* Scroll hint for mobile users
                <div className="scroll-hint d-md-none">
                  ← Scroll horizontally →
                </div> */}
                <CTable className="expense-types-table mb-0 fade-in">
                  <CTableHead>
                    <CTableRow>
                      
                      <CTableHeaderCell scope="col" className="name-col">
                        {t("LABELS.name") || "Name"}
                      </CTableHeaderCell>
                      <CTableHeaderCell scope="col" className="local-name-col">
                        {t("LABELS.local_name") || "Local Name"}
                      </CTableHeaderCell>
                      <CTableHeaderCell scope="col" className="category-col">
                        {t("LABELS.expense_category") || "Category"}
                      </CTableHeaderCell>
                      <CTableHeaderCell scope="col" className="desc-col">
                        {t("LABELS.short_desc") || "Description"}
                      </CTableHeaderCell>
                      <CTableHeaderCell scope="col" className="status-col">
                        {t("LABELS.status") || "Status"}
                      </CTableHeaderCell>
                      <CTableHeaderCell scope="col" className="actions-col">
                        {t("LABELS.actions") || "Actions"}
                      </CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {filteredExpenseTypes.length === 0 ? (
                      <CTableRow>
                        <CTableDataCell colSpan={7} className="empty-state">
                          <div className="empty-state-icon">
                            📋
                          </div>
                          <div>
                            {searchTerm ? 
                              'No expense types found matching your search' : 
                               'No expense types available. Create your first expense type!'
                            }
                          </div>
                          {searchTerm && (
                            <small className="mt-2 d-block">
                              Try adjusting your search terms or{' '}
                              <button 
                                className="btn btn-link p-0 text-decoration-underline"
                                onClick={() => setSearchTerm('')}
                              >
                                clear the search
                              </button>
                            </small>
                          )}
                        </CTableDataCell>
                      </CTableRow>
                    ) : (
                      filteredExpenseTypes.map((expense, index) => (
                        <CTableRow key={expense.id}>
                          
                          <CTableDataCell className="name-col">
                            <div style={{ fontWeight: '500' }} title={expense.name}>
                              <div className="text-truncate-custom">
                                {expense.name}
                              </div>
                            </div>
                          </CTableDataCell>
                          <CTableDataCell className="local-name-col">
                            <div title={expense.localName || 'No local name'}>
                              <div className="text-truncate-custom">
                                {expense.localName || '-'}
                              </div>
                            </div>
                          </CTableDataCell>
                          <CTableDataCell className="category-col">
                            <div title={expense.expense_category || 'No category'}>
                              <div className="text-truncate-custom">
                                {expense.expense_category || '-'}
                              </div>
                            </div>
                          </CTableDataCell>
                          <CTableDataCell className="desc-col">
                            <div title={expense.desc || 'No description'}>
                              <div className="text-truncate-custom">
                                {expense.desc || '-'}
                              </div>
                            </div>
                          </CTableDataCell>
                          <CTableDataCell className="status-col">
                            <CBadge 
                              color={expense.show === 1 ? 'success' : 'danger'}
                              className={expense.show === 1 ? 'badge-visible' : 'badge-hidden'}
                            >
                              {expense.show === 1 ? 
                                (t('LABELS.visible') || 'Visible') : 
                                (t('LABELS.hidden') || 'Hidden')
                              }
                            </CBadge>
                          </CTableDataCell>
                          <CTableDataCell className="actions-col">
                            <div className="action-buttons">
                              <CBadge
                                role="button"
                                color="info"
                                onClick={() => handleEdit(expense)}
                                style={{ cursor: 'pointer' }}
                                title={`Edit ${expense.name}`}
                                tabIndex={0}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    handleEdit(expense);
                                  }
                                }}
                              >
                                {t("LABELS.edit") || "Edit"}
                              </CBadge>
                              <CBadge
                                role="button"
                                color="danger"
                                onClick={() => handleDelete(expense)}
                                style={{ cursor: 'pointer' }}
                                title={`Delete ${expense.name}`}
                                tabIndex={0}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    handleDelete(expense);
                                  }
                                }}
                              >
                                {t("LABELS.delete") || "Delete"}
                              </CBadge>
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

export default AllExpenseType;