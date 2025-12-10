import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
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
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CSpinner,
  CFormSelect,
  CModal,
  CModalBody,
  CModalHeader,
  CModalTitle,
  CModalFooter,
} from '@coreui/react';
import { deleteAPICall, getAPICall, put } from '../../../util/api';
import ConfirmationModal from '../../common/ConfirmationModal';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../common/toast/ToastContext';
import EditExpense from '../expense/EditExpense';
import { useTranslation } from 'react-i18next';
import { getUserType } from '../../../util/session';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { exportToPDF } from './exportToPDF';
import { exportToExcel } from './exportToExcel';

const ExpenseReport = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useTranslation("global");
  const usertype = getUserType();

  // State management
  const [expenseType, setExpenseType] = useState({});
  const [expenses, setExpenses] = useState([]);
  const [totalExpense, setTotalExpense] = useState(0);
  const [deleteResource, setDeleteResource] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [validated, setValidated] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMorePages, setHasMorePages] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [gstFilter, setGstFilter] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');

  // New state for filters
  const [projects, setProjects] = useState([]);
  const [expenseTypes, setExpenseTypes] = useState([]);
  
  const [state, setState] = useState({
    start_date: '',
    end_date: '',
    project_id: '',
    expense_type_id: '',
  });

  // Refs
  const tableContainerRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const scrollTimeoutRef = useRef(null);
  const scrollPositionRef = useRef(0);
  const isInfiniteScrollingRef = useRef(false);

  // Fetch projects
  const fetchProjects = async () => {
    try {
      const response = await getAPICall('/api/projects');
      setProjects(response || []);
    } catch (error) {
      showToast('danger', 'Error fetching projects: ' + error);
    }
  };

  // Fetch expense types
  const fetchExpenseTypes = async () => {
    try {
      const response = await getAPICall('/api/expenseType');
      setExpenseTypes(response || []);
      const result = response.reduce((acc, current) => {
        acc[current.id] = current.name;
        return acc;
      }, {});
      setExpenseType(result);
    } catch (error) {
      showToast('danger', 'Error fetching expense types: ' + error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setState({ ...state, [name]: value });
  };

  const fetchExpense = async (reset = true) => {
    if (!state.start_date || !state.end_date) {
      if (!state.project_id && !state.expense_type_id) {
        showToast('warning', 'Please select dates or at least one filter (Project or Expense Type)');
        return;
      }
    }

    if (reset) {
      setIsLoading(true);
      isInfiniteScrollingRef.current = false;
    } else {
      setIsFetchingMore(true);
    }

    try {
      let url = `/api/expense?`;
      const params = [];
      
      if (state.start_date && state.end_date) {
        params.push(`startDate=${state.start_date}`);
        params.push(`endDate=${state.end_date}`);
      }
      
      if (state.project_id) {
        params.push(`customerId=${state.project_id}`);
      }
      
      if (state.expense_type_id) {
        params.push(`expenseTypeId=${state.expense_type_id}`);
      }
      
      if (nextCursor && !reset) {
        params.push(`cursor=${nextCursor}`);
      }
      
      url += params.join('&');

      const response = await getAPICall(url);

      if (response.error) {
        showToast('danger', response.error);
      } else {
        const newExpenses = reset ? response.data : [...expenses, ...response.data];
        setExpenses(newExpenses);
        setTotalExpense(response.totalExpense || 0);
        setNextCursor(response.next_cursor || null);
        setHasMorePages(response.has_more_pages);

        if (isInfiniteScrollingRef.current && !reset) {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              if (tableContainerRef.current) {
                tableContainerRef.current.scrollTop = scrollPositionRef.current;
              }
              isInfiniteScrollingRef.current = false;
            });
          });
        }
      }
    } catch (error) {
      showToast('danger', 'Error occurred: ' + error);
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  };

  const handleSubmit = async (event) => {
    try {
      const form = event.currentTarget;
      event.preventDefault();
      event.stopPropagation();
      setValidated(true);
      if (form.checkValidity()) {
        isInfiniteScrollingRef.current = false;
        scrollPositionRef.current = 0;
        setNextCursor(null);
        await fetchExpense(true);
      }
    } catch (e) {
      showToast('danger', 'Error occurred: ' + e);
    }
  };

  const handleScroll = useCallback(() => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      const container = tableContainerRef.current;
      if (!container) return;

      const { scrollTop, scrollHeight, clientHeight } = container;
      const threshold = 100;

      scrollPositionRef.current = scrollTop;

      if (
        scrollTop + clientHeight >= scrollHeight - threshold &&
        hasMorePages &&
        !isFetchingMore &&
        !isLoading
      ) {
        isInfiniteScrollingRef.current = true;
        fetchExpense(false);
      }
    }, 100);
  }, [hasMorePages, isFetchingMore, isLoading]);

  const debouncedSearch = useCallback((value) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      setSearchTerm(value);
    }, 300);
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    debouncedSearch(value);
  };

  const clearSearch = () => {
    setSearchInput('');
    setSearchTerm('');
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
  };

  const handleDelete = (expense) => {
    setDeleteResource(expense);
    setDeleteModalVisible(true);
  };

  const onDelete = async () => {
    try {
      await deleteAPICall('/api/expense/' + deleteResource.id);
      setDeleteModalVisible(false);
      fetchExpense(true);
      showToast('success', t("MSG.expense_deleted_successfully") || 'Expense deleted successfully');
    } catch (error) {
      showToast('danger', 'Error occurred: ' + error);
    }
  };

  const handleEdit = async (expense) => {
    try {
      await put('/api/expense/' + expense.id, { ...expense, show: !expense.show });
      fetchExpense(true);
    } catch (error) {
      showToast('danger', 'Error occurred: ' + error);
    }
  };

  const handleEditExpense = (expense) => {
    setSelectedExpense(expense);
    setShowEditModal(true);
  };

  const handleExpenseUpdated = () => {
    fetchExpense(true);
  };

  const handleViewImage = (expense) => {
    setSelectedImage(expense.photo_url || '');
    setShowImageModal(true);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key === columnKey) {
      return sortConfig.direction === 'asc' ? '↑' : '↓';
    }
    return '↕';
  };

  const getSortIconStyle = (columnKey) => ({
    marginLeft: '8px',
    fontSize: '14px',
    opacity: sortConfig.key === columnKey ? 1 : 0.5,
    color: sortConfig.key === columnKey ? '#0d6efd' : '#6c757d',
    transition: 'all 0.2s ease',
  });

  const formatIndianNumber = (amount) => {
    const numericAmount = parseFloat(amount) || 0;
    if (isNaN(numericAmount)) return '0.00';
    
    const [integerPart, decimalPart = '00'] = numericAmount.toFixed(2).split('.');
    const lastThree = integerPart.slice(-3);
    const otherNumbers = integerPart.slice(0, -3);
    const formattedInteger =
      otherNumbers.length > 0
        ? otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree
        : lastThree;
    return `${formattedInteger}.${decimalPart}`;
  };

  const formatCurrency = (amount) => {
    return `Rs ${formatIndianNumber(amount)}`;
  };

  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('en-US', options).replace(',', '');
    const [month, day] = formattedDate.split(' ');
    return `${day} ${month}`;
  };

  const handleExportToPDF = () => {
    exportToPDF(
      state,
      projects,
      expenseTypes,
      filteredTotalExpense,
      sortedFilteredExpenses,
      expenseType,
      formatIndianNumber,
      formatDate,
      showToast,
      totalCgstAmount,
      totalSgstAmount,
      totalIgstAmount,
      sumQty,
      sumBase
    );
  };

  const handleExportToExcel = () => {
    exportToExcel(
      state,
      projects,
      expenseTypes,
      filteredTotalExpense,
      sortedFilteredExpenses,
      expenseType,
      formatIndianNumber,
      formatDate,
      showToast,
      window.location.origin,
      totalCgstAmount,
      totalSgstAmount,
      totalIgstAmount,
      sumQty,
      sumBase
    );
  };























  

  const sortedFilteredExpenses = useMemo(() => {
    let filtered = expenses.map((expense, index) => ({
      ...expense,
      sr_no: index + 1,
    }));

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((expense) =>
        expenseType[expense.expense_id]?.toLowerCase().includes(searchLower) ||
        expense.expense_date?.toLowerCase().includes(searchLower) ||
        expense.total_price?.toString().includes(searchTerm) ||
        expense.contact?.toLowerCase().includes(searchLower) ||
        expense.desc?.toLowerCase().includes(searchLower) ||
        expense.payment_by?.toLowerCase().includes(searchLower) ||
        expense.payment_type?.toLowerCase().includes(searchLower) ||
        expense.project?.project_name?.toLowerCase().includes(searchLower)
      );
    }

    if (gstFilter === 'gst') {
      filtered = filtered.filter(expense => expense.isGst === 1 || expense.isGst === true);
    } else if (gstFilter === 'non-gst') {
      filtered = filtered.filter(expense => expense.isGst === 0 || expense.isGst === false);
    }

    if (!sortConfig.key) return filtered;

    return [...filtered].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (sortConfig.key === 'expense_type') {
        aVal = expenseType[a.expense_id] || '';
        bVal = expenseType[b.expense_id] || '';
      } else if (sortConfig.key === 'customer_name') {
        aVal = a.project?.project_name || '';
        bVal = b.project?.project_name || '';
      } else if (sortConfig.key === 'category') {
        aVal = a.expense_type?.expense_category || '';
        bVal = b.expense_type?.expense_category || '';
      }

      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [expenses, searchTerm, sortConfig, expenseType, gstFilter]);

  const filteredTotalExpense = useMemo(() => 
    sortedFilteredExpenses.reduce((sum, expense) => sum + parseFloat(expense.total_price || 0), 0),
    [sortedFilteredExpenses]
  );

  const sumQty = useMemo(() => 
    sortedFilteredExpenses.reduce((sum, expense) => sum + parseFloat(expense.qty || 0), 0),
    [sortedFilteredExpenses]
  );

  const sumPrice = useMemo(() => 
    sortedFilteredExpenses.reduce((sum, expense) => sum + parseFloat(expense.price || 0), 0),
    [sortedFilteredExpenses]
  );

  const sumBase = useMemo(() => 
    sortedFilteredExpenses.reduce((sum, expense) => {
      const qty = parseFloat(expense.qty || 0);
      const price = parseFloat(expense.price || 0);
      return sum + (qty * price);
    }, 0),
    [sortedFilteredExpenses]
  );

  const totalCgstAmount = useMemo(() =>
    sortedFilteredExpenses.reduce((sum, expense) => {
      return sum + parseFloat(expense.cgst || 0);
    }, 0),
    [sortedFilteredExpenses]
  );

  const totalSgstAmount = useMemo(() =>
    sortedFilteredExpenses.reduce((sum, expense) => {
      return sum + parseFloat(expense.sgst || 0);
    }, 0),
    [sortedFilteredExpenses]
  );

  const totalIgstAmount = useMemo(() =>
    sortedFilteredExpenses.reduce((sum, expense) => {
      return sum + parseFloat(expense.igst || 0);
    }, 0),
    [sortedFilteredExpenses]
  );

  const totalGstAmount = useMemo(() =>
    sortedFilteredExpenses.reduce((sum, expense) => {
      return sum + parseFloat(expense.gst || 0);
    }, 0),
    [sortedFilteredExpenses]
  );

  useEffect(() => {
    fetchProjects();
    fetchExpenseTypes();
  }, []);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const renderMobileCard = (expense) => (
    <CCard key={expense.id} className="mb-3 expense-card">
      <CCardBody>
        <div className="card-row-1">
          <div className="expense-name-section">
            <div className="expense-name">{expenseType[expense.expense_id] || 'N/A'}</div>
            <div className="expense-type">
              <span className="category-text">{expense.sr_no}</span>
            </div>
          </div>
          <div className="expense-total">
            <div className="total-amount">{formatCurrency(expense.total_price)}</div>
            <div className="total-label">Amount</div>
          </div>
        </div>

        <div className="card-row-2">
          <div className="expense-date">📅 {formatDate(expense.expense_date)}</div>
          <div className="expense-details">
            <span className="detail-item">{expense.project?.project_name || '-'}</span>
          </div>
        </div>

        <div className="card-row-2">
          <div className="expense-details">
            <span className="detail-item">Category: {expense.expense_type?.expense_category || '-'}</span>
            <span className="detail-item">Qty: {expense.qty || '-'}</span>
          </div>
        </div>

        <div className="card-row-2">
          <div className="expense-details">
            <span className="detail-item">Price: Rs {formatIndianNumber(expense.price || 0)}</span>
            <span className="detail-item">
              {expense.isGst ? (
                <>GST: {expense.gst || 0}Rs | CGST: {expense.cgst || 0}Rs | SGST: {expense.sgst || 0}Rs | IGST: {expense.igst || 0}Rs</>
              ) : (
                'Non-GST'
              )}
            </span>
          </div>
        </div>

        <div className="card-row-2">
          <div className="expense-details">
            <span className="detail-item">{expense.contact || '-'}</span>
            <span className="detail-item">{expense.payment_by || '-'}</span>
          </div>
        </div>

        <div className="card-row-2">
          <div className="expense-details">
            <span className="detail-item">{expense.payment_type || '-'}</span>
            <span className="detail-item">{expense.bank_name || '-'}</span>
          </div>
        </div>

        <div className="card-row-3">
          <div className="expense-details">
            <span className="detail-item">Acc: {expense.account_number || '-'} IFSC: {expense.ifsc_code || '-'} Trans: {expense.transaction_id || '-'}</span>
          </div>
        </div>

        <div className="card-row-3">
          <div className="expense-details">
            <span className="detail-item">{expense.name || '-'}</span>
          </div>
        </div>

        <div className="card-row-3">
          <div className="expense-details">
            <span className="detail-item">{expense.photo_remark || '-'}</span>
          </div>
        </div>

        <div className="card-row-3">
          <div className="action-buttons-mobile">
            {usertype === 1 && (
              <button className="badge bg-info" onClick={() => handleEdit(expense)} role="button">
                {expense.show ? 'Valid' : 'Invalid'}
              </button>
            )}
            <button className="badge bg-primary" onClick={() => handleEditExpense(expense)} role="button">
              Edit
            </button>
            {usertype === 1 && (
              <button className="badge bg-danger" onClick={() => handleDelete(expense)} role="button">
                Delete
              </button>
            )}
            {expense.photo_url && expense.photo_url !== "NA" && (
              <button className="badge bg-secondary" onClick={() => handleViewImage(expense)} role="button">
                View
              </button>
            )}
          </div>
        </div>
      </CCardBody>
    </CCard>
  );

  if (isLoading && !isFetchingMore) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <CSpinner color="primary" size="lg" />
          <p className="mt-3 text-muted">Loading expenses...</p>
        </div>
      </div>
    );
  }

  const selectedProject = projects.find(p => p.id === parseInt(state.project_id));
  const selectedExpenseType = expenseTypes.find(et => et.id === parseInt(state.expense_type_id));

  return (
    <>
      <style jsx global>{`
        .expense-card {
          border: 1px solid #dee2e6;
          border-radius: 8px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
        }
        .expense-card:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        .expense-card .card-body {
          padding: 12px !important;
        }
        .card-row-1 {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .expense-name {
          font-weight: 600;
          font-size: 1em;
          color: #333;
        }
        .expense-total {
          text-align: right;
        }
        .total-amount {
          font-weight: 600;
          font-size: 1.1em;
          color: #d32f2f;
        }
        .card-row-2, .card-row-3 {
          margin-bottom: 8px;
          padding: 4px 0;
          border-top: 1px solid #f0f0f0;
        }
        .action-buttons-mobile {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .action-buttons-mobile .badge {
          font-size: 0.85em;
          padding: 6px 12px;
          border-radius: 16px;
          cursor: pointer;
        }
        .table-container {
          height: 350px;
          overflow-y: auto;
          border: 1px solid #dee2e6;
          border-radius: 0.375rem;
        }
        .expenses-table thead th {
          position: sticky;
          top: 0;
          z-index: 10;
          background-color: #f8f9fa;
          border-bottom: 2px solid #dee2e6;
        }
        .search-container {
          position: relative;
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
        }
        .summary-container {
          margin-bottom: 20px;
          padding: 10px;
          background-color: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 0.375rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .summary-item {
          flex: 1;
          text-align: center;
          font-weight: 500;
        }
        .summary-item strong {
          display: block;
          font-size: 0.9em;
          color: #555;
        }
      `}</style>

      <EditExpense
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        expense={selectedExpense}
        onExpenseUpdated={handleExpenseUpdated}
      />

      <CModal visible={showImageModal} onClose={() => setShowImageModal(false)}>
        <CModalHeader>
          <CModalTitle>View File</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedImage ? (
            (() => {
              const fileName = selectedImage.split('/').pop();
              const fileUrl = `/img/bill/${fileName}`;
              const fileExtension = fileName.split('.').pop().toLowerCase();

              if (fileExtension === 'pdf') {
                return (
                  <iframe src={fileUrl} title="PDF Preview" style={{ width: '100%', height: '70vh', border: 'none' }} />
                );
              }

              if (['jpg', 'jpeg', 'png'].includes(fileExtension)) {
                return (
                  <img src={fileUrl} alt="Expense" style={{ maxWidth: '100%', maxHeight: '70vh', display: 'block', margin: 'auto' }} />
                );
              }

              return <p style={{ color: 'red', textAlign: 'center' }}>Unsupported file type</p>;
            })()
          ) : (
            <p style={{ color: 'red', textAlign: 'center' }}>File not available</p>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowImageModal(false)}>Close</CButton>
        </CModalFooter>
      </CModal>

      <CRow>
        <ConfirmationModal
          visible={deleteModalVisible}
          setVisible={setDeleteModalVisible}
          onYes={onDelete}
          resource={`Delete expense`}
        />
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Expense Report</strong>
              <span className="ms-2 text-muted">Total {sortedFilteredExpenses.length} expenses</span>
            </CCardHeader>
            <CCardBody>
              <CForm noValidate validated={validated} onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-sm-3">
                    <div className="mb-1">
                      <CFormLabel htmlFor="project_id">Project</CFormLabel>
                      <CFormSelect
                        id="project_id"
                        name="project_id"
                        value={state.project_id}
                        onChange={handleChange}
                      >
                        <option value="">All Projects</option>
                        {projects.map((project) => (
                          <option key={project.id} value={project.id}>
                            {project.project_name}
                          </option>
                        ))}
                      </CFormSelect>
                    </div>
                  </div>

                  <div className="col-sm-2">
                    <div className="mb-1">
                      <CFormLabel htmlFor="start_date">Start Date</CFormLabel>
                      <CFormInput
                        type="date"
                        id="start_date"
                        name="start_date"
                        value={state.start_date}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="col-sm-2">
                    <div className="mb-1">
                      <CFormLabel htmlFor="end_date">End Date</CFormLabel>
                      <CFormInput
                        type="date"
                        id="end_date"
                        name="end_date"
                        value={state.end_date}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="col-sm-3">
                    <div className="mb-1">
                      <CFormLabel htmlFor="expense_type_id">Expense Type</CFormLabel>
                      <CFormSelect
                        id="expense_type_id"
                        name="expense_type_id"
                        value={state.expense_type_id}
                        onChange={handleChange}
                      >
                        <option value="">All Expense Types</option>
                        {expenseTypes.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.name}
                          </option>
                        ))}
                      </CFormSelect>
                    </div>
                  </div>

                  <div className="col-sm-2">
                    <div className="mb-1 mt-4">
                      <CButton color="success" type="submit" disabled={isLoading} className="w-100">
                        {isLoading ? 'Loading...' : 'Submit'}
                      </CButton>
                    </div>
                  </div>
                </div>
              </CForm>

              <hr />

              <CRow className="mb-3">
                <CCol xs={12} md={6} lg={3}>
                  <div className="mb-1">
                    <CFormLabel htmlFor="gstFilter">GST/Non-GST</CFormLabel>
                    <CFormSelect id="gstFilter" value={gstFilter} onChange={(e) => setGstFilter(e.target.value)}>
                      <option value="">All</option>
                      <option value="gst">GST</option>
                      <option value="non-gst">Non-GST</option>
                    </CFormSelect>
                  </div>
                </CCol>

                <CCol xs={12} md={6} lg={3}>
                  <div className="d-flex gap-2 mt-4">
                    <CButton color="primary" onClick={handleExportToExcel} disabled={!sortedFilteredExpenses.length}>
                      Download Excel
                    </CButton>
                    <CButton color="warning" onClick={handleExportToPDF} disabled={!sortedFilteredExpenses.length}>
                      Download PDF
                    </CButton>
                  </div>
                </CCol>

                {searchTerm && (
                  <CCol xs={12} className="mt-2">
                    <small className="text-muted">
                      {sortedFilteredExpenses.length} expenses found for "{searchTerm}"
                    </small>
                  </CCol>
                )}
              </CRow>

              {isMobile ? (
                <div className="mobile-cards-container">
                  {sortedFilteredExpenses.length === 0 ? (
                    <div className="text-center text-muted py-4">
                      <p>No expenses found</p>
                    </div>
                  ) : (
                    sortedFilteredExpenses.map(renderMobileCard)
                  )}
                  {isFetchingMore && (
                    <div className="loading-more">
                      <CSpinner color="primary" size="sm" />
                      <span className="ms-2 text-muted">Loading more...</span>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {sortedFilteredExpenses.length > 0 && (
                    <div className="summary-container">
                      <div className="summary-item"><strong>Total Amount</strong>{formatCurrency(filteredTotalExpense)}</div>
                      <div className="summary-item"><strong>GST</strong>{formatCurrency(totalGstAmount)}</div>
                      <div className="summary-item"><strong>CGST</strong>{formatCurrency(totalCgstAmount)}</div>
                      <div className="summary-item"><strong>SGST</strong>{formatCurrency(totalSgstAmount)}</div>
                      <div className="summary-item"><strong>IGST</strong>{formatCurrency(totalIgstAmount)}</div>
                    </div>
                  )}
                  <div className="table-container" ref={tableContainerRef} onScroll={handleScroll}>
                    <div className="table-responsive">
                      <CTable className="expenses-table">
                        <CTableHead>
                          <CTableRow>
                            <CTableHeaderCell onClick={() => handleSort('sr_no')} style={{ cursor: 'pointer' }}>
                              Sr No <span style={getSortIconStyle('sr_no')}>{getSortIcon('sr_no')}</span>
                            </CTableHeaderCell>
                            <CTableHeaderCell onClick={() => handleSort('expense_date')} style={{ cursor: 'pointer' }}>
                              Date <span style={getSortIconStyle('expense_date')}>{getSortIcon('expense_date')}</span>
                            </CTableHeaderCell>
                            <CTableHeaderCell onClick={() => handleSort('customer_name')} style={{ cursor: 'pointer' }}>
                              Project <span style={getSortIconStyle('customer_name')}>{getSortIcon('customer_name')}</span>
                            </CTableHeaderCell>
                            <CTableHeaderCell onClick={() => handleSort('expense_type')} style={{ cursor: 'pointer' }}>
                              Expense Type <span style={getSortIconStyle('expense_type')}>{getSortIcon('expense_type')}</span>
                            </CTableHeaderCell>
                            <CTableHeaderCell>Category</CTableHeaderCell>
                            <CTableHeaderCell>Qty</CTableHeaderCell>
                            <CTableHeaderCell onClick={() => handleSort('price')} style={{ cursor: 'pointer' }}>
                              Price <span style={getSortIconStyle('price')}>{getSortIcon('price')}</span>
                            </CTableHeaderCell>
                            <CTableHeaderCell onClick={() => handleSort('total_price')} style={{ cursor: 'pointer' }}>
                              Total <span style={getSortIconStyle('total_price')}>{getSortIcon('total_price')}</span>
                            </CTableHeaderCell>
                            <CTableHeaderCell>GST Rs</CTableHeaderCell>
                            <CTableHeaderCell>CGST Rs</CTableHeaderCell>
                            <CTableHeaderCell>SGST Rs</CTableHeaderCell>
                            <CTableHeaderCell>IGST Rs</CTableHeaderCell>
                            <CTableHeaderCell>Payment By</CTableHeaderCell>
                            <CTableHeaderCell>Payment Type</CTableHeaderCell>
                            <CTableHeaderCell>Contact</CTableHeaderCell>
                            <CTableHeaderCell>Bank Name</CTableHeaderCell>
                            <CTableHeaderCell>Account Number</CTableHeaderCell>
                            <CTableHeaderCell>IFSC</CTableHeaderCell>
                            <CTableHeaderCell>Transaction ID</CTableHeaderCell>
                            <CTableHeaderCell>About</CTableHeaderCell>
                            <CTableHeaderCell>Notes</CTableHeaderCell>
                            <CTableHeaderCell>Actions</CTableHeaderCell>
                          </CTableRow>
                        </CTableHead>
                        <CTableBody>
                          {sortedFilteredExpenses.length === 0 ? (
                            <CTableRow>
                              <CTableDataCell colSpan={22} className="text-center py-4">
                                <p>No expenses found</p>
                              </CTableDataCell>
                            </CTableRow>
                          ) : (
                            sortedFilteredExpenses.map((expense) => (
                              <CTableRow key={expense.id}>
                                <CTableDataCell>{expense.sr_no}</CTableDataCell>
                                <CTableDataCell>{formatDate(expense.expense_date)}</CTableDataCell>
                                <CTableDataCell>{expense.project?.project_name || '-'}</CTableDataCell>
                                <CTableDataCell>{expenseType[expense.expense_id] || '-'}</CTableDataCell>
                                <CTableDataCell>{expense.expense_type?.expense_category || '-'}</CTableDataCell>
                                <CTableDataCell>{expense.qty || '-'}</CTableDataCell>
                                <CTableDataCell>{expense.price ? formatIndianNumber(expense.price) : '-'}</CTableDataCell>
                                <CTableDataCell>
                                  <span style={{ fontWeight: '500', color: '#dc3545' }}>
                                    {formatCurrency(expense.total_price)}
                                  </span>
                                </CTableDataCell>
                                <CTableDataCell>{expense.isGst ? (expense.gst !== null ? `${expense.gst}Rs` : '-') : '-'}</CTableDataCell>
                                <CTableDataCell>{expense.isGst ? (expense.cgst !== null ? `${expense.cgst}Rs` : '-') : '-'}</CTableDataCell>
                                <CTableDataCell>{expense.isGst ? (expense.sgst !== null ? `${expense.sgst}Rs` : '-') : '-'}</CTableDataCell>
                                <CTableDataCell>{expense.isGst ? (expense.igst !== null ? `${expense.igst}Rs` : '-') : '-'}</CTableDataCell>
                                <CTableDataCell>{expense.payment_by || '-'}</CTableDataCell>
                                <CTableDataCell>{expense.payment_type || '-'}</CTableDataCell>
                                <CTableDataCell>{expense.contact || '-'}</CTableDataCell>
                                <CTableDataCell>{expense.bank_name || '-'}</CTableDataCell>
                                <CTableDataCell>{expense.acc_number || '-'}</CTableDataCell>
                                <CTableDataCell>{expense.ifsc || '-'}</CTableDataCell>
                                <CTableDataCell>{expense.transaction_id || '-'}</CTableDataCell>
                                <CTableDataCell>{expense.name || '-'}</CTableDataCell>
                                <CTableDataCell>{expense.photo_remark || '-'}</CTableDataCell>
                                <CTableDataCell>
                                  <div className="action-buttons">
                                    {usertype === 1 ? (
                                      <>
                                        <CBadge
                                          role="button"
                                          color={expense.show ? 'success' : 'danger'}
                                          onClick={() => handleEdit(expense)}
                                          style={{ cursor: 'pointer', fontSize: '0.75em' }}
                                        >
                                          {expense.show ? 'Valid' : 'Invalid'}
                                        </CBadge>
                                        <CBadge
                                          role="button"
                                          color="primary"
                                          onClick={() => handleEditExpense(expense)}
                                          style={{ cursor: 'pointer', fontSize: '0.75em' }}
                                        >
                                          Edit
                                        </CBadge>
                                        <CBadge
                                          role="button"
                                          color="danger"
                                          onClick={() => handleDelete(expense)}
                                          style={{ cursor: 'pointer', fontSize: '0.75em' }}
                                        >
                                          Delete
                                        </CBadge>
                                      </>
                                    ) : (
                                      <CBadge
                                        role="button"
                                        color="primary"
                                        onClick={() => handleEditExpense(expense)}
                                        style={{ cursor: 'pointer', fontSize: '0.75em' }}
                                      >
                                        Edit
                                      </CBadge>
                                    )}
                                    {expense.photo_url && expense.photo_url !== "NA" && (
                                      <CBadge
                                        role="button"
                                        color="secondary"
                                        onClick={() => handleViewImage(expense)}
                                        style={{ cursor: 'pointer', fontSize: '0.75em' }}
                                      >
                                        View
                                      </CBadge>
                                    )}
                                  </div>
                                </CTableDataCell>
                              </CTableRow>
                            ))
                          )}
                        </CTableBody>
                      </CTable>
                    </div>
                    {isFetchingMore && (
                      <div className="loading-more">
                        <CSpinner color="primary" size="sm" />
                        <span className="ms-2 text-muted">Loading more...</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  );
};

export default ExpenseReport;