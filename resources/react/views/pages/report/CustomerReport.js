// // import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
// // import {
// //   CBadge,
// //   CButton,
// //   CCard,
// //   CCardBody,
// //   CCardHeader,
// //   CCol,
// //   CFormInput,
// //   CFormLabel,
// //   CRow,
// //   CTable,
// //   CTableBody,
// //   CTableDataCell,
// //   CTableHead,
// //   CTableHeaderCell,
// //   CTableRow,
// //   CSpinner,
// //   CFormSelect
// // } from '@coreui/react';
// // import { useNavigate } from 'react-router-dom';
// // import { useToast } from '../../common/toast/ToastContext';
// // import { useTranslation } from 'react-i18next';
// // import { cilTrash } from '@coreui/icons';
// // import CIcon from '@coreui/icons-react';
// // import { deleteAPICall, getAPICall } from '../../../util/api';
// // import EditExpense from '../expense/EditExpense';
// // import ConfirmationModal from '../../common/ConfirmationModal';
// // import { getUserType } from '../../../util/session';

// // const isMobile = window.innerWidth < 768;

// // const CustomerReport = () => {
// //   const navigate = useNavigate();
// //   const { showToast } = useToast();
// //   const { t } = useTranslation("global");

// //   const usertype = getUserType();
  
// //   const [showEditModal, setShowEditModal] = useState(false);
// //   const [selectedExpense, setSelectedExpense] = useState(null);
// //   // State management
// //   const [expenses, setExpenses] = useState([]);
// //   const [searchTerm, setSearchTerm] = useState('');
// //   const [searchInput, setSearchInput] = useState('');
// //   const [deleteResource, setDeleteResource] = useState();
// //   const [deleteModalVisible, setDeleteModalVisible] = useState(false);
// //   const [totalExpense, setTotalExpense] = useState(0);
// //   const [nextCursor, setNextCursor] = useState(null);
// //   const [hasMorePages, setHasMorePages] = useState(false);
// //   const [isLoading, setIsLoading] = useState(false);
// //   const [isFetchingMore, setIsFetchingMore] = useState(false);
// //   const [isMobile, setIsMobile] = useState(false);
// //   const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
// //   const [customerSuggestions, setCustomerSuggestions] = useState([]);
// //   const [selectedCustomer, setSelectedCustomer] = useState({ name: '', id: null });
// //   const [gstFilter, setGstFilter] = useState('');

// //   const handleSort = (key) => {
// //     let direction = 'asc';
// //     if (sortConfig.key === key && sortConfig.direction === 'asc') {
// //       direction = 'desc';
// //     }
// //     setSortConfig({ key, direction });
// //   };

// //   const getSortIcon = (columnKey) => {
// //     if (sortConfig.key === columnKey) {
// //       return sortConfig.direction === 'asc' ? '↑' : '↓';
// //     }
// //     return '↕';
// //   };

// //   const getSortIconStyle = (columnKey) => ({
// //     marginLeft: '8px',
// //     fontSize: '14px',
// //     opacity: sortConfig.key === columnKey ? 1 : 0.5,
// //     color: sortConfig.key === columnKey ? '#0d6efd' : '#6c757d',
// //     transition: 'all 0.2s ease'
// //   });

// //   // Refs for scroll and debouncing
// //   const tableContainerRef = useRef(null);
// //   const debounceTimerRef = useRef(null);
// //   const scrollTimeoutRef = useRef(null);
// //   const scrollPositionRef = useRef(0);
// //   const isInfiniteScrollingRef = useRef(false);
// //   const customerSearchDebounceRef = useRef(null);

// //   // Check screen size for mobile responsiveness
// //   useEffect(() => {
// //     const checkScreenSize = () => {
// //       setIsMobile(window.innerWidth <= 768);
// //     };

// //     checkScreenSize();
// //     window.addEventListener('resize', checkScreenSize);
// //     return () => window.removeEventListener('resize', checkScreenSize);
// //   }, []);

// //   const handleEditExpense = (expense) => {
// //     setSelectedExpense(expense);
// //     setShowEditModal(true);
// //   };

// //   const handleExpenseUpdated = (updatedExpense) => {
// //     fetchExpenses(true); // Triggers full refresh
// //   };

// //   // Debounced search implementation for expenses
// //   const debouncedSearch = useCallback((value) => {
// //     if (debounceTimerRef.current) {
// //       clearTimeout(debounceTimerRef.current);
// //     }
// //     debounceTimerRef.current = setTimeout(() => {
// //       setSearchTerm(value);
// //     }, 300);
// //   }, []);

// //   // Debounced search for customers
// //   const debouncedCustomerSearch = useCallback((value) => {
// //     if (customerSearchDebounceRef.current) {
// //       clearTimeout(customerSearchDebounceRef.current);
// //     }
// //     customerSearchDebounceRef.current = setTimeout(() => {
// //       fetchCustomers(value);
// //     }, 300);
// //   }, []);

// //   const fetchCustomers = async (searchQuery = '') => {
// //     try {
// //       const url = `/api/projects?searchQuery=${encodeURIComponent(searchQuery)}`;
// //       const response = await getAPICall(url);
// //       setCustomerSuggestions(response || []);
// //     } catch (error) {
// //       showToast('danger', 'Error fetching customers: ' + error);
// //     }
// //   };

// //   const handleCustomerNameChange = (e) => {
// //     const value = e.target.value;
// //     setSelectedCustomer({ name: value, id: null });
// //     debouncedCustomerSearch(value);
// //   };

// //   const handleCustomerSelect = (customer) => {
// //     setSelectedCustomer({ name: customer.project_name, id: customer.id });
// //     setCustomerSuggestions([]);
// //   };

// //   const sortedFilteredExpenses = useMemo(() => {
// //     let filtered = expenses.map((expense, index) => ({
// //       ...expense,
// //       sr_no: index + 1
// //     }));

// //     if (searchTerm.trim()) {
// //       const searchLower = searchTerm.toLowerCase();
// //       filtered = filtered.filter(expense =>
// //         expense.expense_type?.name?.toLowerCase().includes(searchLower) ||
// //         expense.expense_date?.toLowerCase().includes(searchLower) ||
// //         expense.total_price?.toString().includes(searchTerm) ||
// //         expense.contact?.toLowerCase().includes(searchLower) ||
// //         expense.desc?.toLowerCase().includes(searchLower) ||
// //         expense.payment_by?.toLowerCase().includes(searchLower) ||
// //         expense.payment_type?.toLowerCase().includes(searchLower) ||
// //         expense.pending_amount?.toString().includes(searchTerm)
// //       );
// //     }

// //     if (gstFilter === 'gst') {
// //       filtered = filtered.filter(expense => expense.isGst === 1 || expense.isGst === true);
// //     } else if (gstFilter === 'non-gst') {
// //       filtered = filtered.filter(expense => expense.isGst === 0 || expense.isGst === false);
// //     }

// //     if (!sortConfig.key) return filtered;

// //     return [...filtered].sort((a, b) => {
// //       let aVal = a[sortConfig.key];
// //       let bVal = b[sortConfig.key];

// //       if (sortConfig.key === 'expense_type') {
// //         aVal = a.expense_type?.name || '';
// //         bVal = b.expense_type?.name || '';
// //       }

// //       if (typeof aVal === 'string') aVal = aVal.toLowerCase();
// //       if (typeof bVal === 'string') bVal = bVal.toLowerCase();

// //       if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
// //       if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
// //       return 0;
// //     });
// //   }, [expenses, searchTerm, sortConfig, gstFilter]);

// //   const handleScroll = useCallback(() => {
// //     if (scrollTimeoutRef.current) {
// //       clearTimeout(scrollTimeoutRef.current);
// //     }

// //     scrollTimeoutRef.current = setTimeout(() => {
// //       const container = tableContainerRef.current;
// //       if (!container) return;

// //       const { scrollTop, scrollHeight, clientHeight } = container;
// //       const threshold = 100;

// //       scrollPositionRef.current = scrollTop;

// //       if (
// //         scrollTop + clientHeight >= scrollHeight - threshold &&
// //         hasMorePages &&
// //         !isFetchingMore &&
// //         !isLoading
// //       ) {
// //         isInfiniteScrollingRef.current = true;
// //         fetchExpenses(false);
// //       }
// //     }, 100);
// //   }, [hasMorePages, isFetchingMore, isLoading]);

// //   const fetchExpenses = async (reset = true) => {
// //     if (!selectedCustomer.id) {
// //       showToast('warning', t("MSG.please_select_customer") || 'Please select a customer');
// //       return;
// //     }

// //     if (reset) {
// //       setIsLoading(true);
// //       isInfiniteScrollingRef.current = false;
// //     } else {
// //       setIsFetchingMore(true);
// //     }

// //     try {
// //       const url = `/api/expense?customerId=${selectedCustomer.id}` +
// //         (nextCursor && !reset ? `&cursor=${nextCursor}` : '');

// //       const response = await getAPICall(url);

// //       if (response.error) {
// //         showToast('danger', response.error);
// //       } else {
// //         const newExpenses = reset ? response.data : [...expenses, ...response.data];
        
// //         const currentScrollPosition = scrollPositionRef.current;
        
// //         setExpenses(newExpenses);
// //         setTotalExpense(response.totalExpense || 0);
// //         setNextCursor(response.next_cursor || null);
// //         setHasMorePages(response.has_more_pages);

// //         if (isInfiniteScrollingRef.current && !reset) {
// //           requestAnimationFrame(() => {
// //             requestAnimationFrame(() => {
// //               if (tableContainerRef.current) {
// //                 tableContainerRef.current.scrollTop = currentScrollPosition;
// //               }
// //               isInfiniteScrollingRef.current = false;
// //             });
// //           });
// //         }
// //       }
// //     } catch (error) {
// //       showToast('danger', 'Error occurred: ' + error);
// //     } finally {
// //       setIsLoading(false);
// //       setIsFetchingMore(false);
// //     }
// //   };

// //   const handleDelete = async () => {
// //     try {
// //       await deleteAPICall('/api/expense/' + deleteResource.id);
// //       setDeleteModalVisible(false);
      
// //       isInfiniteScrollingRef.current = false;
// //       scrollPositionRef.current = 0;
      
// //       fetchExpenses(true);
// //       showToast('success', t("MSG.expense_deleted_successfully") || 'Expense deleted successfully');
// //     } catch (error) {
// //       showToast('danger', 'Error occurred: ' + error);
// //     }
// //   };

// //   const handleEdit = (expense) => {
// //     navigate('/expense/edit/' + expense.id);
// //   };

// //   const formatCurrency = (amount) => {
// //     return new Intl.NumberFormat('en-IN', {
// //       style: 'currency',
// //       currency: 'INR',
// //     }).format(amount || 0);
// //   };

// //   const formatDate = (dateString) => {
// //     const options = { day: 'numeric', month: 'short', year: 'numeric' };
// //     const date = new Date(dateString);
// //     const formattedDate = date.toLocaleDateString('en-US', options).replace(',', '');
// //     const [month, day] = formattedDate.split(' ');
// //     return `${day} ${month}`;
// //   };

// //   const handleFilterClick = () => {
// //     isInfiniteScrollingRef.current = false;
// //     scrollPositionRef.current = 0;
// //     setNextCursor(null);
// //     fetchExpenses(true);
// //   };

// //   const handleSearchChange = (e) => {
// //     const value = e.target.value;
// //     setSearchInput(value);
// //     debouncedSearch(value);
// //   };

// //   const clearSearch = () => {
// //     setSearchInput('');
// //     setSearchTerm('');
// //     if (debounceTimerRef.current) {
// //       clearTimeout(debounceTimerRef.current);
// //     }
// //   };

// //   const handleDeleteClick = (expense) => {
// //     setDeleteResource(expense);
// //     setDeleteModalVisible(true);
// //   };

// //   // Fetch customers on component mount
// //   useEffect(() => {
// //     fetchCustomers();
// //   }, []);

// //   // Cleanup timers
// //   useEffect(() => {
// //     return () => {
// //       if (debounceTimerRef.current) {
// //         clearTimeout(debounceTimerRef.current);
// //       }
// //       if (scrollTimeoutRef.current) {
// //         clearTimeout(scrollTimeoutRef.current);
// //       }
// //       if (customerSearchDebounceRef.current) {
// //         clearTimeout(customerSearchDebounceRef.current);
// //       }
// //     };
// //   }, []);

// //   if (isLoading) {
// //     return (
// //       <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
// //         <div className="text-center">
// //           <CSpinner color="primary" size="lg" />
// //           <p className="mt-3 text-muted">Loading expenses...</p>
// //         </div>
// //       </div>
// //     );
// //   }

// //   const renderMobileCard = (expense) => (
// //     <>
// //       <style>{expenseCardStyles}</style>
      
// //       <CCard key={expense.id} className="mb-3 expense-card">
// //         <CCardBody>
// //           <div className="card-row-1">
// //             <div className="expense-name-section">
// //               <div className="expense-name">{expense.expense_type?.name || 'N/A'}</div>
// //               <div className="expense-type">
// //                 <span className="category-text">{expense.sr_no}</span>
// //               </div>
// //             </div>
// //             <div className="expense-total">
// //               <div className="total-amount">{formatCurrency(expense.total_price)}</div>
// //               <div className="total-label">Amount</div>
// //             </div>
// //           </div>

// //           <div className="card-row-2">
// //             <div className="expense-date">
// //               📅 {formatDate(expense.expense_date)}
// //             </div>
// //             <div className="expense-details">
// //               <span className="detail-item">{expense.contact || '-'}</span>
// //               <span className="detail-item">{expense.payment_by || '-'}</span>
// //             </div>
// //           </div>

// //           <div className="card-row-2">
// //             <div className="expense-details">
// //               <span className="detail-item">{expense.payment_type || '-'}</span>
// //               <span className="detail-item">{expense.pending_amount ? formatCurrency(expense.pending_amount) : '-'}</span>
// //             </div>
// //           </div>

// //           <div className="card-row-3">
// //             <div className="expense-details">
// //               <span className="detail-item">{expense.desc || '-'}</span>
// //             </div>
// //           </div>

// //           <div className="card-row-3">
// //             <div className="action-buttons-mobile">
// //               <button 
// //                 className="badge bg-primary"
// //                 onClick={() => handleEditExpense(expense)}
// //                 role="button"
// //               >
// //                 {t('LABELS.edit') || 'Edit'}
// //               </button>
// //               <button 
// //                 className="badge bg-danger"
// //                 onClick={() => handleDeleteClick(expense)}
// //                 role="button"
// //               >
// //                 {t('LABELS.delete') || 'Delete'}
// //               </button>
// //             </div>
// //           </div>
// //         </CCardBody>
// //       </CCard>
// //     </>
// //   );

// //   const expenseCardStyles = `
// //     .expense-card {
// //       border: 1px solid #dee2e6;
// //       border-radius: 8px;
// //       box-shadow: 0 1px 4px rgba(0,0,0,0.1);
// //       transition: all 0.3s ease;
// //       overflow: hidden;
// //       margin-bottom: 12px;
// //     }

// //     .expense-card:hover {
// //       transform: translateY(-1px);
// //       box-shadow: 0 2px 8px rgba(0,0,0,0.15);
// //     }

// //     .expense-card .card-body {
// //       padding: 12px !important;
// //     }

// //     .expense-card .card-row-1 {
// //       display: flex;
// //       justify-content: space-between;
// //       align-items: flex-start;
// //       margin-bottom: 8px;
// //     }

// //     .expense-name-section {
// //       flex: 1;
// //       display: flex;
// //       flex-direction: column;
// //       gap: 4px;
// //     }

// //     .expense-name {
// //       font-weight: 600;
// //       font-size: 1em;
// //       color: #333;
// //       line-height: 1.1;
// //     }

// //     .expense-type {
// //       display: flex;
// //       gap: 8px;
// //       align-items: center;
// //     }

// //     .category-text {
// //       color: #666;
// //       font-size: 0.8em;
// //     }

// //     .expense-total {
// //       text-align: right;
// //     }

// //     .total-amount {
// //       font-weight: 600;
// //       font-size: 1.1em;
// //       color: #d32f2f;
// //       line-height: 1.1;
// //     }

// //     .total-label {
// //       font-size: 0.7em;
// //       color: #666;
// //     }

// //     .expense-card .card-row-2 {
// //       margin-bottom: 8px;
// //       padding: 4px 0;
// //       border-top: 1px solid #f0f0f0;
// //       display: flex;
// //       justify-content: space-between;
// //       align-items: center;
// //     }

// //     .expense-date {
// //       color: #666;
// //       font-size: 0.85em;
// //       display: flex;
// //       align-items: center;
// //       gap: 4px;
// //     }

// //     .expense-details {
// //       display: flex;
// //       gap: 24px;
// //     }

// //     .detail-item {
// //       color: #333;
// //       font-size: 0.85em;
// //       font-weight: 500;
// //     }

// //     .expense-card .card-row-3 {
// //       padding: 6px 0;
// //       border-top: 1px solid #f0f0f0;
// //     }

// //     .expense-card .action-buttons-mobile {
// //       display: flex;
// //       gap: 8px;
// //       justify-content: flex-start;
// //       width: 100%;
// //     }

// //     .expense-card .action-buttons-mobile .badge {
// //       font-size: 0.85em;
// //       padding: 8px 8px;
// //       border-radius: 16px;
// //       cursor: pointer;
// //       transition: all 0.2s ease;
// //       border: 1px solid transparent;
// //       text-align: center;
// //       min-height: 36px;
// //       display: flex;
// //       align-items: center;
// //       justify-content: center;
// //       font-weight: 500;
// //       width: 100%;
// //     }

// //     .expense-card .action-buttons-mobile .badge:hover {
// //       transform: translateY(-1px);
// //       box-shadow: 0 2px 4px rgba(0,0,0,0.1);
// //     }

// //     .expense-card .action-buttons-mobile .badge.bg-danger {
// //       background-color: #dc3545 !important;
// //       border-color: #dc3545;
// //       color: white !important;
// //     }

// //     .suggestions-list {
// //       position: absolute;
// //       z-index: 1000;
// //       background: white;
// //       border: 1px solid #ccc;
// //       list-style: none;
// //       padding: 0;
// //       max-height: 200px;
// //       overflow-y: auto;
// //       width: 100%;
// //       box-shadow: 0 2px 4px rgba(0,0,0,0.1);
// //     }

// //     .suggestions-list li {
// //       padding: 8px;
// //       cursor: pointer;
// //       border-bottom: 1px solid #eee;
// //     }

// //     .suggestions-list li:hover {
// //       background: #f5f5f5;
// //     }

// //     @media (max-width: 576px) {
// //       .expense-name {
// //         font-size: 0.95em;
// //       }
      
// //       .expense-card .card-body {
// //         padding: 10px !important;
// //       }
      
// //       .expense-card .action-buttons-mobile .badge {
// //         font-size: 0.8em;
// //         padding: 6px 12px;
// //         min-height: 32px;
// //       }
// //     }
// //   `;

// //   return (
// //     <>
// //       <style jsx global>{`
// //         .table-container {
// //           height: 350px;
// //           overflow-y: auto;
// //           border: 1px solid #dee2e6;
// //           border-radius: 0.375rem;
// //           position: relative;
// //         }

// //         @media (max-width: 768px) {
// //           .table-container {
// //             height: 400px;
// //             overflow-x: auto;
// //             overflow-y: auto;
// //           }
// //         }

// //         .expenses-table {
// //           width: 100%;
// //           table-layout: fixed;
// //           margin-bottom: 0;
// //         }

// //         .expenses-table thead th {
// //           position: sticky;
// //           top: 0;
// //           z-index: 10;
// //           background-color: #f8f9fa;
// //           border-bottom: 2px solid #dee2e6;
// //           box-shadow: 0 2px 2px -1px rgba(0, 0, 0, 0.1);
// //         }

// //         .expenses-table th,
// //         .expenses-table td {
// //           text-align: center;
// //           vertical-align: middle;
// //           padding: 8px 4px;
// //           word-wrap: break-word;
// //           overflow-wrap: break-word;
// //         }

// //         .expenses-table th:nth-child(1) { width: 8%; }
// //         .expenses-table th:nth-child(2) { width: 12%; }
// //         .expenses-table th:nth-child(3) { width: 15%; text-align: left; }
// //         .expenses-table th:nth-child(4) { width: 12%; }
// //         .expenses-table th:nth-child(5) { width: 12%; }
// //         .expenses-table th:nth-child(6) { width: 15%; text-align: left; }
// //         .expenses-table th:nth-child(7) { width: 12%; }
// //         .expenses-table th:nth-child(8) { width: 12%; }
// //         .expenses-table th:nth-child(9) { width: 12%; }
// //         .expenses-table th:nth-child(10) { width: 12%; }

// //         .expenses-table td:nth-child(1) { width: 8%; }
// //         .expenses-table td:nth-child(2) { width: 12%; }
// //         .expenses-table td:nth-child(3) { width: 15%; text-align: left; }
// //         .expenses-table td:nth-child(4) { width: 12%; }
// //         .expenses-table td:nth-child(5) { width: 12%; }
// //         .expenses-table td:nth-child(6) { width: 15%; text-align: left; }
// //         .expenses-table td:nth-child(7) { width: 12%; }
// //         .expenses-table td:nth-child(8) { width: 12%; }
// //         .expenses-table td:nth-child(9) { width: 12%; }
// //         .expenses-table td:nth-child(10) { width: 12%; }

// //         .search-container {
// //           position: relative;
// //           width: 100%;
// //         }

// //         .search-input {
// //           padding-left: 40px;
// //         }

// //         .search-icon {
// //           position: absolute;
// //           left: 12px;
// //           top: 50%;
// //           transform: translateY(-50%);
// //           color: #6c757d;
// //           pointer-events: none;
// //         }

// //         .clear-search {
// //           position: absolute;
// //           right: 12px;
// //           top: 50%;
// //           transform: translateY(-50%);
// //           background: none;
// //           border: none;
// //           color: #6c757d;
// //           cursor: pointer;
// //           padding: 0;
// //           font-size: 16px;
// //         }

// //         .clear-search:hover {
// //           color: #dc3545;
// //         }

// //         .filter-button-mobile {
// //           margin-top: 0;
// //         }

// //         @media (max-width: 768px) {
// //           .filter-button-mobile {
// //             margin-top: 5px;
// //           }
// //         }

// //         .action-buttons {
// //           display: flex;
// //           gap: 4px;
// //           justify-content: center;
// //           flex-wrap: wrap;
// //         }

// //         .loading-more {
// //           position: sticky;
// //           bottom: 0;
// //           background: #f8f9fa;
// //           border-top: 1px solid #dee2e6;
// //           padding: 10px;
// //           text-align: center;
// //           z-index: 5;
// //         }

// //         .total-expense-card {
// //           background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
// //           border: none;
// //           border-radius: 12px;
// //           box-shadow: 0 4px 8px rgba(220, 53, 69, 0.2);
// //         }

// //         .total-expense-icon {
// //           background: rgba(255, 255, 255, 0.2);
// //           border-radius: 50%;
// //           width: 40px;
// //           height: 40px;
// //           display: flex;
// //           align-items: center;
// //           justify-content: center;
// //           font-size: 18px;
// //           font-weight: bold;
// //           color: white;
// //         }

// //         .filter-section {
// //           background: #f8f9fa;
// //           border: 1px solid #e9ecef;
// //           border-radius: 8px;
// //           padding: 5px;
// //           margin-bottom: 5px;
// //         }

// //         @media (max-width: 768px) {
// //           .expenses-table {
// //             min-width: 950px;
// //             table-layout: fixed;
// //           }

// //           .expenses-table th,
// //           .expenses-table td {
// //             white-space: nowrap;
// //             padding: 8px 6px;
// //             border-right: 1px solid #dee2e6;
// //             font-size: 13px;
// //           }

// //           .expenses-table th:nth-child(1),
// //           .expenses-table td:nth-child(1) {
// //             width: 80px;
// //             min-width: 80px;
// //           }

// //           .expenses-table th:nth-child(2),
// //           .expenses-table td:nth-child(2) {
// //             width: 120px;
// //             min-width: 120px;
// //           }

// //           .expenses-table th:nth-child(3),
// //           .expenses-table td:nth-child(3) {
// //             width: 160px;
// //             min-width: 160px;
// //           }

// //           .expenses-table th:nth-child(4),
// //           .expenses-table td:nth-child(4) {
// //             width: 120px;
// //             min-width: 120px;
// //           }

// //           .expenses-table th:nth-child(5),
// //           .expenses-table td:nth-child(5) {
// //             width: 120px;
// //             min-width: 120px;
// //           }

// //           .expenses-table th:nth-child(6),
// //           .expenses-table td:nth-child(6) {
// //             width: 160px;
// //             min-width: 160px;
// //           }

// //           .expenses-table th:nth-child(7),
// //           .expenses-table td:nth-child(7) {
// //             width: 120px;
// //             min-width: 120px;
// //           }

// //           .expenses-table th:nth-child(8),
// //           .expenses-table td:nth-child(8) {
// //             width: 120px;
// //             min-width: 120px;
// //           }

// //           .expenses-table th:nth-child(9),
// //           .expenses-table td:nth-child(9) {
// //             width: 120px;
// //             min-width: 120px;
// //           }

// //           .action-buttons {
// //             flex-direction: row;
// //             gap: 2px;
// //           }

// //           .action-buttons .badge {
// //             font-size: 10px;
// //             padding: 2px 6px;
// //           }

// //           .filter-section {
// //             padding: 15px;
// //           }

// //           .total-expense-card {
// //             margin-top: 0.3rem;
// //           }
// //         }

// //         @media (max-width: 576px) {
// //           .expenses-table {
// //             font-size: 12px;
// //             min-width: 900px;
// //           }

// //           .expenses-table th,
// //           .expenses-table td {
// //             padding: 6px 4px;
// //           }

// //           .action-buttons .badge {
// //             font-size: 9px;
// //             padding: 2px 4px;
// //           }

// //           .filter-section {
// //             padding: 5px;
// //           }

// //           .expenses-table {
// //             display: none !important;
// //           }
// //         }
// //       `}</style>

// //       <EditExpense
// //         visible={showEditModal}
// //         onClose={() => setShowEditModal(false)}
// //         expense={selectedExpense}
// //         onExpenseUpdated={handleExpenseUpdated}
// //       />

// //       <CRow>
// //         <ConfirmationModal
// //           visible={deleteModalVisible}
// //           setVisible={setDeleteModalVisible}
// //           onYes={handleDelete}
// //           resource={`Delete expense - ${deleteResource?.name}`}
// //         />

// //         <CCol xs={12}>
// //           <CCard>
// //             <CCardHeader>
// //               <strong>{t("LABELS.project_expenses") || "Projects Expenses"}</strong>
// //               <span className="ms-2 text-muted">
// //                 {t("LABELS.total") } {sortedFilteredExpenses.length} expenses
// //               </span>
// //             </CCardHeader>
// //             <CCardBody>
// //               <div className="filter-section">
// //                 <CRow className="g-1 align-items-end">
// //                   <CCol xs={12} md={6}>
// //                     <CFormLabel htmlFor="customer_id" className="mb-1 small fw-medium">
// //                       {t("LABELS.search_projects") || "Select Customer"}
// //                     </CFormLabel>
// //                     <div className="search-container" style={{ position: 'relative' }}>
// //                       <CFormInput
// //                         type="text"
// //                         id="customer_id"
// //                         className="search-input"
// //                         placeholder={t("LABELS.enter_project_name") || "Enter customer name"}
// //                         value={selectedCustomer.name}
// //                         onChange={handleCustomerNameChange}
// //                         autoComplete="off"
// //                         size="sm"
// //                       />
// //                       <div className="search-icon">🔍</div>
// //                       {customerSuggestions.length > 0 && (
// //                         <ul className="suggestions-list">
// //                           {customerSuggestions.map((customer) => (
// //                             <li 
// //                               key={customer.id}
// //                               onClick={() => handleCustomerSelect(customer)}
// //                               onMouseEnter={(e) => e.target.style.background = '#f5f5f5'}
// //                               onMouseLeave={(e) => e.target.style.background = 'white'}
// //                             >
// //                               {customer.project_name} 
// //                             </li>
// //                           ))}
// //                         </ul>
// //                       )}
// //                     </div>
// //                   </CCol>
// //                   <CCol xs={12} md={3}>
// //                     <CButton
// //                       color="primary"
// //                       onClick={handleFilterClick}
// //                       disabled={isLoading}
// //                       size="sm"
// //                       className="w-100 filter-button-mobile"
// //                     >
// //                       {isLoading ? t("LABELS.loading") || "Loading..." : t("LABELS.filter") || "Filter"}
// //                     </CButton>
// //                   </CCol>
// //                   <CCol xs={12} md={3}>
// //                     <div className="total-expense-card text-white p-2 w-100">
// //                       <div className="d-flex align-items-center justify-content-start">
// //                         <div className="total-expense-icon me-2">₹</div>
// //                         <div>
// //                           <div className="small opacity-75">
// //                             {t("LABELS.total_expenses") || "Total Expenses"}
// //                           </div>
// //                           <div className="h4 mb-0 fw-bold">
// //                             {totalExpense}
// //                           </div>
// //                         </div>
// //                       </div>
// //                     </div>
// //                   </CCol>
// //                 </CRow>
// //               </div>

// //               <CRow className="mb-3">
// //                 <CCol xs={12} md={6} lg={4}>
// //                   <div className="search-container">
// //                     <CFormInput
// //                       type="text"
// //                       className="search-input"
// //                       placeholder="Search expenses..."
// //                       value={searchInput}
// //                       onChange={handleSearchChange}
// //                     />
// //                     <div className="search-icon">🔍</div>
// //                     {searchInput && (
// //                       <button className="clear-search" onClick={clearSearch} title="Clear search">
// //                         ✕
// //                       </button>
// //                     )}
// //                   </div>
// //                 </CCol>

// //                      {/* Dropdown Filter */}
// //   <CCol xs={12} md={6} lg={3}>
// //     <CFormSelect
// //       value={gstFilter}
// //       onChange={(e) => setGstFilter(e.target.value)}
// //     >
// //       <option value="">Default</option>
// //       <option value="gst">GST</option>
// //       <option value="non-gst">Non-GST</option>
// //     </CFormSelect>
// //   </CCol>

// //                 {searchTerm && (
// //                   <CCol xs={12} className="mt-2">
// //                     <small className="text-muted">
// //                       {sortedFilteredExpenses.length} expenses found for "{searchTerm}"
// //                     </small>
// //                   </CCol>
// //                 )}

              
// //               </CRow>

// //               {isMobile ? (
// //                 <div className="mobile-cards-container">
// //                   {sortedFilteredExpenses.length === 0 ? (
// //                     <div className="text-center text-muted py-4">
// //                       {searchTerm ? (
// //                         <>
// //                           <p>No expenses found for "{searchTerm}"</p>
// //                           <CButton color="primary" onClick={clearSearch} size="sm">
// //                             Clear Search
// //                           </CButton>
// //                         </>
// //                       ) : selectedCustomer.id ? (
// //                         <>
// //                           <p>{t("MSG.no_expenses_found_for_project") || "No expenses found for the selected Product."}</p>
// //                           <CButton color="primary" onClick={() => navigate('/expense/new')} size="sm">
// //                             {t("LABELS.add_expense") || "Add Expense"}
// //                           </CButton>
// //                         </>
// //                       ) : (
// //                         <p>{t("MSG.select_project_to_view_expenses") || "Select a project to view expenses."}</p>
// //                       )}
// //                     </div>
// //                   ) : (
// //                     sortedFilteredExpenses.map(renderMobileCard)
// //                   )}

// //                   {isFetchingMore && (
// //                     <div className="loading-more">
// //                       <CSpinner color="primary" size="sm" />
// //                       <span className="ms-2 text-muted">
// //                         {t("MSG.loading") || "Loading more expenses..."}
// //                       </span>
// //                     </div>
// //                   )}
// //                 </div>
// //               ) : (
// //                 <div
// //                   className="table-container"
// //                   ref={tableContainerRef}
// //                   onScroll={handleScroll}
// //                 >
// //                   <CTable className="expenses-table">
// //                     <CTableHead>
// //                       <CTableRow>
// //                         <CTableHeaderCell onClick={() => handleSort('sr_no')} style={{ cursor: 'pointer' }}>
// //                           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
// //                             Sr No <span style={getSortIconStyle('sr_no')}>{getSortIcon('sr_no')}</span>
// //                           </div>
// //                         </CTableHeaderCell>
// //                         <CTableHeaderCell onClick={() => handleSort('expense_date')} style={{ cursor: 'pointer' }}>
// //                           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
// //                             Date <span style={getSortIconStyle('expense_date')}>{getSortIcon('expense_date')}</span>
// //                           </div>
// //                         </CTableHeaderCell>
// //                         <CTableHeaderCell onClick={() => handleSort('expense_type')} style={{ cursor: 'pointer' }}>
// //                           <div style={{ display: 'flex', alignItems: 'center' }}>
// //                             Expense Details <span style={getSortIconStyle('expense_type')}>{getSortIcon('expense_type')}</span>
// //                           </div>
// //                         </CTableHeaderCell>
// //                         <CTableHeaderCell onClick={() => handleSort('total_price')} style={{ cursor: 'pointer' }}>
// //                           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
// //                             Amount <span style={getSortIconStyle('total_price')}>{getSortIcon('total_price')}</span>
// //                           </div>
// //                         </CTableHeaderCell>
// //                         <CTableHeaderCell onClick={() => handleSort('contact')} style={{ cursor: 'pointer' }}>
// //                           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
// //                             Contact <span style={getSortIconStyle('contact')}>{getSortIcon('contact')}</span>
// //                           </div>
// //                         </CTableHeaderCell>
// //                         <CTableHeaderCell onClick={() => handleSort('desc')} style={{ cursor: 'pointer' }}>
// //                           <div style={{ display: 'flex', alignItems: 'center' }}>
// //                             Notes <span style={getSortIconStyle('desc')}>{getSortIcon('desc')}</span>
// //                           </div>
// //                         </CTableHeaderCell>
// //                         <CTableHeaderCell onClick={() => handleSort('payment_by')} style={{ cursor: 'pointer' }}>
// //                           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
// //                             Payment By <span style={getSortIconStyle('payment_by')}>{getSortIcon('payment_by')}</span>
// //                           </div>
// //                         </CTableHeaderCell>
// //                         <CTableHeaderCell onClick={() => handleSort('payment_type')} style={{ cursor: 'pointer' }}>
// //                           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
// //                             Payment Type <span style={getSortIconStyle('payment_type')}>{getSortIcon('payment_type')}</span>
// //                           </div>
// //                         </CTableHeaderCell>
// //                         <CTableHeaderCell onClick={() => handleSort('pending_amount')} style={{ cursor: 'pointer' }}>
// //                           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
// //                             Pending Amount <span style={getSortIconStyle('pending_amount')}>{getSortIcon('pending_amount')}</span>
// //                           </div>
// //                         </CTableHeaderCell>
// //                         <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
// //                       </CTableRow>
// //                     </CTableHead>
// //                     <CTableBody>
// //                       {sortedFilteredExpenses.length === 0 ? (
// //                         <CTableRow>
// //                           <CTableDataCell colSpan={10} className="text-center py-4">
// //                             {searchTerm ? (
// //                               <div className="text-muted">
// //                                 <p>No expenses found for "{searchTerm}"</p>
// //                                 <CButton color="primary" onClick={clearSearch} size="sm">
// //                                   Clear Search
// //                                 </CButton>
// //                               </div>
// //                             ) : selectedCustomer.id ? (
// //                               <div className="text-muted">
// //                                 <p>{t("MSG.no_expenses_found_for_project") || "No expenses found for the selected Product."}</p>
// //                                 <CButton color="primary" onClick={() => navigate('/expense/new')} size="sm">
// //                                   {t("LABELS.add_expense") || "Add Expense"}
// //                                 </CButton>
// //                               </div>
// //                             ) : (
// //                               <p className="text-muted">{t("MSG.select_project_to_view_expenses") || "Select a project to view expenses."}</p>
// //                             )}
// //                           </CTableDataCell>
// //                         </CTableRow>
// //                       ) : (
// //                         sortedFilteredExpenses.map((expense) => (
// //                           <CTableRow key={expense.id}>
// //                             <CTableDataCell>
// //                               <div style={{ fontSize: '0.85em' }}>{expense.sr_no}</div>
// //                             </CTableDataCell>
// //                             <CTableDataCell>
// //                               <div style={{ fontSize: '0.85em' }}>{formatDate(expense.expense_date)}</div>
// //                             </CTableDataCell>
// //                             <CTableDataCell style={{ textAlign: 'left' }}>
// //                               <div style={{ wordBreak: 'break-word' }}>{expense.expense_type?.name || '-'}</div>
// //                             </CTableDataCell>
// //                             <CTableDataCell>
// //                               <span style={{ fontWeight: '500', color: '#dc3545' }}>{formatCurrency(expense.total_price)}</span>
// //                             </CTableDataCell>
// //                             <CTableDataCell>
// //                               <div style={{ wordBreak: 'break-word' }}>{expense.contact || '-'}</div>
// //                             </CTableDataCell>
// //                             <CTableDataCell style={{ textAlign: 'left' }}>
// //                               <div style={{ wordBreak: 'break-word' }}>{expense.desc || '-'}</div>
// //                             </CTableDataCell>
// //                             <CTableDataCell>
// //                               <div style={{ wordBreak: 'break-word' }}>{expense.payment_by || '-'}</div>
// //                             </CTableDataCell>
// //                             <CTableDataCell>
// //                               <div style={{ wordBreak: 'break-word' }}>{expense.payment_type || '-'}</div>
// //                             </CTableDataCell>
// //                             <CTableDataCell>
// //                               <span style={{ fontWeight: '500' }}>{expense.pending_amount ? formatCurrency(expense.pending_amount) : '-'}</span>
// //                             </CTableDataCell>

// //                           <CTableDataCell>
// //   <div className="action-buttons">
// //     {usertype === 1 ? (
// //       <>
// //         <CBadge
// //           role="button"
// //           color="primary"
// //           onClick={() => handleEditExpense(expense)}
// //           style={{ cursor: 'pointer', fontSize: '0.75em' }}
// //         >
// //           Edit
// //         </CBadge>
// //         <CBadge
// //           role="button"
// //           color="danger"
// //           onClick={() => handleDeleteClick(expense)}
// //           style={{ cursor: 'pointer', fontSize: '0.75em' }}
// //         >
// //           Delete
// //         </CBadge>
// //       </>
// //     ) : (
// //       <CBadge
// //         role="button"
// //         color="primary"
// //         onClick={() => handleEditExpense(expense)}
// //         style={{ cursor: 'pointer', fontSize: '0.75em' }}
// //       >
// //         Edit
// //       </CBadge>
// //     )}
// //   </div>
// // </CTableDataCell>









// //                             {/* <CTableDataCell>
// //                               <div className="action-buttons">
// //                                 <CBadge
// //                                   role="button"
// //                                   color="primary"
// //                                   onClick={() => handleEditExpense(expense)}
// //                                   style={{ cursor: 'pointer', fontSize: '0.75em' }}
// //                                 >
// //                                   Edit
// //                                 </CBadge>
// //                                 <CBadge
// //                                   role="button"
// //                                   color="danger"
// //                                   onClick={() => handleDeleteClick(expense)}
// //                                   style={{ cursor: 'pointer', fontSize: '0.75em' }}
// //                                 >
// //                                   Delete
// //                                 </CBadge>
// //                               </div>
// //                             </CTableDataCell> */}


// //                           </CTableRow>
// //                         ))
// //                       )}
// //                     </CTableBody>
// //                   </CTable>
// //                   {isFetchingMore && (
// //                     <div className="loading-more">
// //                       <CSpinner color="primary" size="sm" />
// //                       <span className="ms-2 text-muted">{t("MSG.loading") || "Loading more expenses..."}</span>
// //                     </div>
// //                   )}
// //                 </div>
// //               )}
// //             </CCardBody>
// //           </CCard>
// //         </CCol>
// //       </CRow>
// //     </>
// //   );
// // };

// // export default CustomerReport;



// // import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
// // import {
// //   CBadge,
// //   CButton,
// //   CCard,
// //   CCardBody,
// //   CCardHeader,
// //   CCol,
// //   CFormInput,
// //   CFormLabel,
// //   CRow,
// //   CTable,
// //   CTableBody,
// //   CTableDataCell,
// //   CTableHead,
// //   CTableHeaderCell,
// //   CTableRow,
// //   CSpinner,
// //   CFormSelect,
// //   CModal,
// //   CModalHeader,
// //   CModalTitle,
// //   CModalBody,
// //   CModalFooter,
// // } from '@coreui/react';
// // import { useNavigate } from 'react-router-dom';
// // import { useToast } from '../../common/toast/ToastContext';
// // import { useTranslation } from 'react-i18next';
// // import { cilTrash } from '@coreui/icons';
// // import CIcon from '@coreui/icons-react';
// // import { deleteAPICall, getAPICall } from '../../../util/api';
// // import EditExpense from '../expense/EditExpense';
// // import ConfirmationModal from '../../common/ConfirmationModal';
// // import { getUserType } from '../../../util/session';

// // const CustomerReport = () => {
// //   const navigate = useNavigate();
// //   const { showToast } = useToast();
// //   const { t } = useTranslation("global");

// //   const usertype = getUserType();

// //   const [showEditModal, setShowEditModal] = useState(false);
// //   const [selectedExpense, setSelectedExpense] = useState(null);
// //   // State management
// //   const [expenses, setExpenses] = useState([]);
// //   const [searchTerm, setSearchTerm] = useState('');
// //   const [searchInput, setSearchInput] = useState('');
// //   const [deleteResource, setDeleteResource] = useState();
// //   const [deleteModalVisible, setDeleteModalVisible] = useState(false);
// //   const [totalExpense, setTotalExpense] = useState(0);
// //   const [nextCursor, setNextCursor] = useState(null);
// //   const [hasMorePages, setHasMorePages] = useState(false);
// //   const [isLoading, setIsLoading] = useState(false);
// //   const [isFetchingMore, setIsFetchingMore] = useState(false);
// //   const [isMobile, setIsMobile] = useState(false);
// //   const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
// //   const [customerSuggestions, setCustomerSuggestions] = useState([]);
// //   const [selectedCustomer, setSelectedCustomer] = useState({ name: '', id: null });
// //   const [gstFilter, setGstFilter] = useState('');
// //   // New state for image modal
// //   const [showImageModal, setShowImageModal] = useState(false);
// //   const [selectedImage, setSelectedImage] = useState('');

// //   const handleSort = (key) => {
// //     let direction = 'asc';
// //     if (sortConfig.key === key && sortConfig.direction === 'asc') {
// //       direction = 'desc';
// //     }
// //     setSortConfig({ key, direction });
// //   };

// //   const getSortIcon = (columnKey) => {
// //     if (sortConfig.key === columnKey) {
// //       return sortConfig.direction === 'asc' ? '↑' : '↓';
// //     }
// //     return '↕';
// //   };

// //   const getSortIconStyle = (columnKey) => ({
// //     marginLeft: '8px',
// //     fontSize: '14px',
// //     opacity: sortConfig.key === columnKey ? 1 : 0.5,
// //     color: sortConfig.key === columnKey ? '#0d6efd' : '#6c757d',
// //     transition: 'all 0.2s ease',
// //   });

// //   // Refs for scroll and debouncing
// //   const tableContainerRef = useRef(null);
// //   const debounceTimerRef = useRef(null);
// //   const scrollTimeoutRef = useRef(null);
// //   const scrollPositionRef = useRef(0);
// //   const isInfiniteScrollingRef = useRef(false);
// //   const customerSearchDebounceRef = useRef(null);

// //   // Check screen size for mobile responsiveness
// //   useEffect(() => {
// //     const checkScreenSize = () => {
// //       setIsMobile(window.innerWidth <= 768);
// //     };

// //     checkScreenSize();
// //     window.addEventListener('resize', checkScreenSize);
// //     return () => window.removeEventListener('resize', checkScreenSize);
// //   }, []);

// //   const handleEditExpense = (expense) => {
// //     setSelectedExpense(expense);
// //     setShowEditModal(true);
// //   };

// //   const handleExpenseUpdated = (updatedExpense) => {
// //     fetchExpenses(true); // Triggers full refresh
// //   };

// //   // Debounced search implementation for expenses
// //   const debouncedSearch = useCallback((value) => {
// //     if (debounceTimerRef.current) {
// //       clearTimeout(debounceTimerRef.current);
// //     }
// //     debounceTimerRef.current = setTimeout(() => {
// //       setSearchTerm(value);
// //     }, 300);
// //   }, []);

// //   // Debounced search for customers
// //   const debouncedCustomerSearch = useCallback((value) => {
// //     if (customerSearchDebounceRef.current) {
// //       clearTimeout(customerSearchDebounceRef.current);
// //     }
// //     customerSearchDebounceRef.current = setTimeout(() => {
// //       fetchCustomers(value);
// //     }, 300);
// //   }, []);

// //   const fetchCustomers = async (searchQuery = '') => {
// //     try {
// //       const url = `/api/projects?searchQuery=${encodeURIComponent(searchQuery)}`;
// //       const response = await getAPICall(url);
// //       setCustomerSuggestions(response || []);
// //     } catch (error) {
// //       showToast('danger', 'Error fetching customers: ' + error);
// //     }
// //   };

// //   const handleCustomerNameChange = (e) => {
// //     const value = e.target.value;
// //     setSelectedCustomer({ name: value, id: null });
// //     debouncedCustomerSearch(value);
// //   };

// //   const handleCustomerSelect = (customer) => {
// //     setSelectedCustomer({ name: customer.project_name, id: customer.id });
// //     setCustomerSuggestions([]);
// //   };

// //   const sortedFilteredExpenses = useMemo(() => {
// //     let filtered = expenses.map((expense, index) => ({
// //       ...expense,
// //       sr_no: index + 1,
// //     }));

// //     if (searchTerm.trim()) {
// //       const searchLower = searchTerm.toLowerCase();
// //       filtered = filtered.filter((expense) =>
// //         expense.expense_type?.name?.toLowerCase().includes(searchLower) ||
// //         expense.expense_date?.toLowerCase().includes(searchLower) ||
// //         expense.total_price?.toString().includes(searchTerm) ||
// //         expense.contact?.toLowerCase().includes(searchLower) ||
// //         expense.desc?.toLowerCase().includes(searchLower) ||
// //         expense.payment_by?.toLowerCase().includes(searchLower) ||
// //         expense.payment_type?.toLowerCase().includes(searchLower) ||
// //         expense.pending_amount?.toString().includes(searchTerm)
// //       );
// //     }

// //     if (gstFilter === 'gst') {
// //       filtered = filtered.filter((expense) => expense.isGst === 1 || expense.isGst === true);
// //     } else if (gstFilter === 'non-gst') {
// //       filtered = filtered.filter((expense) => expense.isGst === 0 || expense.isGst === false);
// //     }

// //     if (!sortConfig.key) return filtered;

// //     return [...filtered].sort((a, b) => {
// //       let aVal = a[sortConfig.key];
// //       let bVal = b[sortConfig.key];

// //       if (sortConfig.key === 'expense_type') {
// //         aVal = a.expense_type?.name || '';
// //         bVal = b.expense_type?.name || '';
// //       }

// //       if (typeof aVal === 'string') aVal = aVal.toLowerCase();
// //       if (typeof bVal === 'string') bVal = bVal.toLowerCase();

// //       if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
// //       if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
// //       return 0;
// //     });
// //   }, [expenses, searchTerm, sortConfig, gstFilter]);

// //   const handleScroll = useCallback(() => {
// //     if (scrollTimeoutRef.current) {
// //       clearTimeout(scrollTimeoutRef.current);
// //     }

// //     scrollTimeoutRef.current = setTimeout(() => {
// //       const container = tableContainerRef.current;
// //       if (!container) return;

// //       const { scrollTop, scrollHeight, clientHeight } = container;
// //       const threshold = 100;

// //       scrollPositionRef.current = scrollTop;

// //       if (
// //         scrollTop + clientHeight >= scrollHeight - threshold &&
// //         hasMorePages &&
// //         !isFetchingMore &&
// //         !isLoading
// //       ) {
// //         isInfiniteScrollingRef.current = true;
// //         fetchExpenses(false);
// //       }
// //     }, 100);
// //   }, [hasMorePages, isFetchingMore, isLoading]);

// //   const fetchExpenses = async (reset = true) => {
// //     if (!selectedCustomer.id) {
// //       showToast('warning', t("MSG.please_select_customer") || 'Please select a customer');
// //       return;
// //     }

// //     if (reset) {
// //       setIsLoading(true);
// //       isInfiniteScrollingRef.current = false;
// //     } else {
// //       setIsFetchingMore(true);
// //     }

// //     try {
// //       const url = `/api/expense?customerId=${selectedCustomer.id}` +
// //         (nextCursor && !reset ? `&cursor=${nextCursor}` : '');

// //       const response = await getAPICall(url);

// //       if (response.error) {
// //         showToast('danger', response.error);
// //       } else {
// //         const newExpenses = reset ? response.data : [...expenses, ...response.data];

// //         const currentScrollPosition = scrollPositionRef.current;

// //         setExpenses(newExpenses);
// //         setTotalExpense(response.totalExpense || 0);
// //         setNextCursor(response.next_cursor || null);
// //         setHasMorePages(response.has_more_pages);

// //         if (isInfiniteScrollingRef.current && !reset) {
// //           requestAnimationFrame(() => {
// //             requestAnimationFrame(() => {
// //               if (tableContainerRef.current) {
// //                 tableContainerRef.current.scrollTop = currentScrollPosition;
// //               }
// //               isInfiniteScrollingRef.current = false;
// //             });
// //           });
// //         }
// //       }
// //     } catch (error) {
// //       showToast('danger', 'Error occurred: ' + error);
// //     } finally {
// //       setIsLoading(false);
// //       setIsFetchingMore(false);
// //     }
// //   };

// //   const handleDelete = async () => {
// //     try {
// //       await deleteAPICall('/api/expense/' + deleteResource.id);
// //       setDeleteModalVisible(false);

// //       isInfiniteScrollingRef.current = false;
// //       scrollPositionRef.current = 0;

// //       fetchExpenses(true);
// //       showToast('success', t("MSG.expense_deleted_successfully") || 'Expense deleted successfully');
// //     } catch (error) {
// //       showToast('danger', 'Error occurred: ' + error);
// //     }
// //   };

// //   const handleEdit = (expense) => {
// //     navigate('/expense/edit/' + expense.id);
// //   };

// //   const formatCurrency = (amount) => {
// //     return new Intl.NumberFormat('en-IN', {
// //       style: 'currency',
// //       currency: 'INR',
// //     }).format(amount || 0);
// //   };

// //   const formatDate = (dateString) => {
// //     const options = { day: 'numeric', month: 'short', year: 'numeric' };
// //     const date = new Date(dateString);
// //     const formattedDate = date.toLocaleDateString('en-US', options).replace(',', '');
// //     const [month, day] = formattedDate.split(' ');
// //     return `${day} ${month}`;
// //   };

// //   const handleFilterClick = () => {
// //     isInfiniteScrollingRef.current = false;
// //     scrollPositionRef.current = 0;
// //     setNextCursor(null);
// //     fetchExpenses(true);
// //   };

// //   const handleSearchChange = (e) => {
// //     const value = e.target.value;
// //     setSearchInput(value);
// //     debouncedSearch(value);
// //   };

// //   const clearSearch = () => {
// //     setSearchInput('');
// //     setSearchTerm('');
// //     if (debounceTimerRef.current) {
// //       clearTimeout(debounceTimerRef.current);
// //     }
// //   };

// //   const handleDeleteClick = (expense) => {
// //     setDeleteResource(expense);
// //     setDeleteModalVisible(true);
// //   };

// //   const handleViewImage = (expense) => {
// //     setSelectedImage(expense.photo_url || ''); // Assuming photo_url contains the image path
// //     setShowImageModal(true);
// //   };

// //   // Fetch customers on component mount
// //   useEffect(() => {
// //     fetchCustomers();
// //   }, []);

// //   // Cleanup timers
// //   useEffect(() => {
// //     return () => {
// //       if (debounceTimerRef.current) {
// //         clearTimeout(debounceTimerRef.current);
// //       }
// //       if (scrollTimeoutRef.current) {
// //         clearTimeout(scrollTimeoutRef.current);
// //       }
// //       if (customerSearchDebounceRef.current) {
// //         clearTimeout(customerSearchDebounceRef.current);
// //       }
// //     };
// //   }, []);

// //   if (isLoading) {
// //     return (
// //       <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
// //         <div className="text-center">
// //           <CSpinner color="primary" size="lg" />
// //           <p className="mt-3 text-muted">Loading expenses...</p>
// //         </div>
// //       </div>
// //     );
// //   }

// //   const renderMobileCard = (expense) => (
// //     <>
// //       <style>{expenseCardStyles}</style>

// //       <CCard key={expense.id} className="mb-3 expense-card">
// //         <CCardBody>
// //           <div className="card-row-1">
// //             <div className="expense-name-section">
// //               <div className="expense-name">{expense.expense_type?.name || 'N/A'}</div>
// //               <div className="expense-type">
// //                 <span className="category-text">{expense.sr_no}</span>
// //               </div>
// //             </div>
// //             <div className="expense-total">
// //               <div className="total-amount">{formatCurrency(expense.total_price)}</div>
// //               <div className="total-label">Amount</div>
// //             </div>
// //           </div>

// //           <div className="card-row-2">
// //             <div className="expense-date">
// //               📅 {formatDate(expense.expense_date)}
// //             </div>
// //             <div className="expense-details">
// //               <span className="detail-item">{expense.contact || '-'}</span>
// //               <span className="detail-item">{expense.payment_by || '-'}</span>
// //             </div>
// //           </div>

// //           <div className="card-row-2">
// //             <div className="expense-details">
// //               <span className="detail-item">{expense.payment_type || '-'}</span>
// //               <span className="detail-item">{expense.pending_amount ? formatCurrency(expense.pending_amount) : '-'}</span>
// //             </div>
// //           </div>

// //           <div className="card-row-3">
// //             <div className="expense-details">
// //               <span className="detail-item">{expense.desc || '-'}</span>
// //             </div>
// //           </div>

// //           <div className="card-row-3">
// //             <div className="action-buttons-mobile">
// //               <button
// //                 className="badge bg-primary"
// //                 onClick={() => handleEditExpense(expense)}
// //                 role="button"
// //               >
// //                 {t('LABELS.edit') || 'Edit'}
// //               </button>
// //               <button
// //                 className="badge bg-danger"
// //                 onClick={() => handleDeleteClick(expense)}
// //                 role="button"
// //               >
// //                 {t('LABELS.delete') || 'Delete'}
// //               </button>
// //               {expense.photo_url && (
// //                 <button
// //                   className="badge bg-secondary"
// //                   onClick={() => handleViewImage(expense)}
// //                   role="button"
// //                 >
// //                   {t('LABELS.view') || 'View'}
// //                 </button>
// //               )}
// //             </div>
// //           </div>
// //         </CCardBody>
// //       </CCard>
// //     </>
// //   );

// //   const expenseCardStyles = `
// //     .expense-card {
// //       border: 1px solid #dee2e6;
// //       border-radius: 8px;
// //       box-shadow: 0 1px 4px rgba(0,0,0,0.1);
// //       transition: all 0.3s ease;
// //       overflow: hidden;
// //       margin-bottom: 12px;
// //     }

// //     .expense-card:hover {
// //       transform: translateY(-1px);
// //       box-shadow: 0 2px 8px rgba(0,0,0,0.15);
// //     }

// //     .expense-card .card-body {
// //       padding: 12px !important;
// //     }

// //     .expense-card .card-row-1 {
// //       display: flex;
// //       justify-content: space-between;
// //       align-items: flex-start;
// //       margin-bottom: 8px;
// //     }

// //     .expense-name-section {
// //       flex: 1;
// //       display: flex;
// //       flex-direction: column;
// //       gap: 4px;
// //     }

// //     .expense-name {
// //       font-weight: 600;
// //       font-size: 1em;
// //       color: #333;
// //       line-height: 1.1;
// //     }

// //     .expense-type {
// //       display: flex;
// //       gap: 8px;
// //       align-items: center;
// //     }

// //     .category-text {
// //       color: #666;
// //       font-size: 0.8em;
// //     }

// //     .expense-total {
// //       text-align: right;
// //     }

// //     .total-amount {
// //       font-weight: 600;
// //       font-size: 1.1em;
// //       color: #d32f2f;
// //       line-height: 1.1;
// //     }

// //     .total-label {
// //       font-size: 0.7em;
// //       color: #666;
// //     }

// //     .expense-card .card-row-2 {
// //       margin-bottom: 8px;
// //       padding: 4px 0;
// //       border-top: 1px solid #f0f0f0;
// //       display: flex;
// //       justify-content: space-between;
// //       align-items: center;
// //     }

// //     .expense-date {
// //       color: #666;
// //       font-size: 0.85em;
// //       display: flex;
// //       align-items: center;
// //       gap: 4px;
// //     }

// //     .expense-details {
// //       display: flex;
// //       gap: 24px;
// //     }

// //     .detail-item {
// //       color: #333;
// //       font-size: 0.85em;
// //       font-weight: 500;
// //     }

// //     .expense-card .card-row-3 {
// //       padding: 6px 0;
// //       border-top: 1px solid #f0f0f0;
// //     }

// //     .expense-card .action-buttons-mobile {
// //       display: flex;
// //       gap: 8px;
// //       justify-content: flex-start;
// //       width: 100%;
// //     }

// //     .expense-card .action-buttons-mobile .badge {
// //       font-size: 0.85em;
// //       padding: 8px 8px;
// //       border-radius: 16px;
// //       cursor: pointer;
// //       transition: all 0.2s ease;
// //       border: 1px solid transparent;
// //       text-align: center;
// //       min-height: 36px;
// //       display: flex;
// //       align-items: center;
// //       justify-content: center;
// //       font-weight: 500;
// //       width: 100%;
// //     }

// //     .expense-card .action-buttons-mobile .badge:hover {
// //       transform: translateY(-1px);
// //       box-shadow: 0 2px 4px rgba(0,0,0,0.1);
// //     }

// //     .expense-card .action-buttons-mobile .badge.bg-danger {
// //       background-color: #dc3545 !important;
// //       border-color: #dc3545;
// //       color: white !important;
// //     }

// //     .suggestions-list {
// //       position: absolute;
// //       z-index: 1000;
// //       background: white;
// //       border: 1px solid #ccc;
// //       list-style: none;
// //       padding: 0;
// //       max-height: 200px;
// //       overflow-y: auto;
// //       width: 100%;
// //       box-shadow: 0 2px 4px rgba(0,0,0,0.1);
// //     }

// //     .suggestions-list li {
// //       padding: 8px;
// //       cursor: pointer;
// //       border-bottom: 1px solid #eee;
// //     }

// //     .suggestions-list li:hover {
// //       background: #f5f5f5;
// //     }

// //     @media (max-width: 576px) {
// //       .expense-name {
// //         font-size: 0.95em;
// //       }

// //       .expense-card .card-body {
// //         padding: 10px !important;
// //       }

// //       .expense-card .action-buttons-mobile .badge {
// //         font-size: 0.8em;
// //         padding: 6px 12px;
// //         min-height: 32px;
// //       }
// //     }
// //   `;

// //   return (
// //     <>
// //       <style jsx global>{`
// //         .table-container {
// //           height: 350px;
// //           overflow-y: auto;
// //           border: 1px solid #dee2e6;
// //           border-radius: 0.375rem;
// //           position: relative;
// //         }

// //         @media (max-width: 768px) {
// //           .table-container {
// //             height: 400px;
// //             overflow-x: auto;
// //             overflow-y: auto;
// //           }
// //         }

// //         .expenses-table {
// //           width: 100%;
// //           table-layout: fixed;
// //           margin-bottom: 0;
// //         }

// //         .expenses-table thead th {
// //           position: sticky;
// //           top: 0;
// //           z-index: 10;
// //           background-color: #f8f9fa;
// //           border-bottom: 2px solid #dee2e6;
// //           box-shadow: 0 2px 2px -1px rgba(0, 0, 0, 0.1);
// //         }

// //         .expenses-table th,
// //         .expenses-table td {
// //           text-align: center;
// //           vertical-align: middle;
// //           padding: 8px 4px;
// //           word-wrap: break-word;
// //           overflow-wrap: break-word;
// //         }

// //         .expenses-table th:nth-child(1) { width: 8%; }
// //         .expenses-table th:nth-child(2) { width: 12%; }
// //         .expenses-table th:nth-child(3) { width: 15%; text-align: left; }
// //         .expenses-table th:nth-child(4) { width: 12%; }
// //         .expenses-table th:nth-child(5) { width: 12%; }
// //         .expenses-table th:nth-child(6) { width: 15%; text-align: left; }
// //         .expenses-table th:nth-child(7) { width: 12%; }
// //         .expenses-table th:nth-child(8) { width: 12%; }
// //         .expenses-table th:nth-child(9) { width: 12%; }
// //         .expenses-table th:nth-child(10) { width: 12%; }

// //         .expenses-table td:nth-child(1) { width: 8%; }
// //         .expenses-table td:nth-child(2) { width: 12%; }
// //         .expenses-table td:nth-child(3) { width: 15%; text-align: left; }
// //         .expenses-table td:nth-child(4) { width: 12%; }
// //         .expenses-table td:nth-child(5) { width: 12%; }
// //         .expenses-table td:nth-child(6) { width: 15%; text-align: left; }
// //         .expenses-table td:nth-child(7) { width: 12%; }
// //         .expenses-table td:nth-child(8) { width: 12%; }
// //         .expenses-table td:nth-child(9) { width: 12%; }
// //         .expenses-table td:nth-child(10) { width: 12%; }

// //         .search-container {
// //           position: relative;
// //           width: 100%;
// //         }

// //         .search-input {
// //           padding-left: 40px;
// //         }

// //         .search-icon {
// //           position: absolute;
// //           left: 12px;
// //           top: 50%;
// //           transform: translateY(-50%);
// //           color: #6c757d;
// //           pointer-events: none;
// //         }

// //         .clear-search {
// //           position: absolute;
// //           right: 12px;
// //           top: 50%;
// //           transform: translateY(-50%);
// //           background: none;
// //           border: none;
// //           color: #6c757d;
// //           cursor: pointer;
// //           padding: 0;
// //           font-size: 16px;
// //         }

// //         .clear-search:hover {
// //           color: #dc3545;
// //         }

// //         .filter-button-mobile {
// //           margin-top: 0;
// //         }

// //         @media (max-width: 768px) {
// //           .filter-button-mobile {
// //             margin-top: 5px;
// //           }
// //         }

// //         .action-buttons {
// //           display: flex;
// //           gap: 4px;
// //           justify-content: center;
// //           flex-wrap: wrap;
// //         }

// //         .loading-more {
// //           position: sticky;
// //           bottom: 0;
// //           background: #f8f9fa;
// //           border-top: 1px solid #dee2e6;
// //           padding: 10px;
// //           text-align: center;
// //           z-index: 5;
// //         }

// //         .total-expense-card {
// //           background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
// //           border: none;
// //           border-radius: 12px;
// //           box-shadow: 0 4px 8px rgba(220, 53, 69, 0.2);
// //         }

// //         .total-expense-icon {
// //           background: rgba(255, 255, 255, 0.2);
// //           border-radius: 50%;
// //           width: 40px;
// //           height: 40px;
// //           display: flex;
// //           align-items: center;
// //           justify-content: center;
// //           font-size: 18px;
// //           font-weight: bold;
// //           color: white;
// //         }

// //         .filter-section {
// //           background: #f8f9fa;
// //           border: 1px solid #e9ecef;
// //           border-radius: 8px;
// //           padding: 5px;
// //           margin-bottom: 5px;
// //         }

// //         @media (max-width: 768px) {
// //           .expenses-table {
// //             min-width: 950px;
// //             table-layout: fixed;
// //           }

// //           .expenses-table th,
// //           .expenses-table td {
// //             white-space: nowrap;
// //             padding: 8px 6px;
// //             border-right: 1px solid #dee2e6;
// //             font-size: 13px;
// //           }

// //           .expenses-table th:nth-child(1),
// //           .expenses-table td:nth-child(1) {
// //             width: 80px;
// //             min-width: 80px;
// //           }

// //           .expenses-table th:nth-child(2),
// //           .expenses-table td:nth-child(2) {
// //             width: 120px;
// //             min-width: 120px;
// //           }

// //           .expenses-table th:nth-child(3),
// //           .expenses-table td:nth-child(3) {
// //             width: 160px;
// //             min-width: 160px;
// //           }

// //           .expenses-table th:nth-child(4),
// //           .expenses-table td:nth-child(4) {
// //             width: 120px;
// //             min-width: 120px;
// //           }

// //           .expenses-table th:nth-child(5),
// //           .expenses-table td:nth-child(5) {
// //             width: 120px;
// //             min-width: 120px;
// //           }

// //           .expenses-table th:nth-child(6),
// //           .expenses-table td:nth-child(6) {
// //             width: 160px;
// //             min-width: 160px;
// //           }

// //           .expenses-table th:nth-child(7),
// //           .expenses-table td:nth-child(7) {
// //             width: 120px;
// //             min-width: 120px;
// //           }

// //           .expenses-table th:nth-child(8),
// //           .expenses-table td:nth-child(8) {
// //             width: 120px;
// //             min-width: 120px;
// //           }

// //           .expenses-table th:nth-child(9),
// //           .expenses-table td:nth-child(9) {
// //             width: 120px;
// //             min-width: 120px;
// //           }

// //           .action-buttons {
// //             flex-direction: row;
// //             gap: 2px;
// //           }

// //           .action-buttons .badge {
// //             font-size: 10px;
// //             padding: 2px 6px;
// //           }

// //           .filter-section {
// //             padding: 15px;
// //           }

// //           .total-expense-card {
// //             margin-top: 0.3rem;
// //           }
// //         }

// //         @media (max-width: 576px) {
// //           .expenses-table {
// //             font-size: 12px;
// //             min-width: 900px;
// //           }

// //           .expenses-table th,
// //           .expenses-table td {
// //             padding: 6px 4px;
// //           }

// //           .action-buttons .badge {
// //             font-size: 9px;
// //             padding: 2px 4px;
// //           }

// //           .filter-section {
// //             padding: 5px;
// //           }

// //           .expenses-table {
// //             display: none !important;
// //           }
// //         }
// //       `}</style>

// //       <EditExpense
// //         visible={showEditModal}
// //         onClose={() => setShowEditModal(false)}
// //         expense={selectedExpense}
// //         onExpenseUpdated={handleExpenseUpdated}
// //       />

// //       <CModal visible={showImageModal} onClose={() => setShowImageModal(false)}>
// //         <CModalHeader>
// //           <CModalTitle>{t('LABELS.view_image') || 'View Image'}</CModalTitle>
// //         </CModalHeader>
// //         <CModalBody>
// //           {selectedImage ? (
// //             <img
// //               src={`/bill/bill/${selectedImage.split('/').pop()}`}
// //               alt="Expense"
// //               style={{ maxWidth: '100%', maxHeight: '70vh' }}
// //               onError={(e) => {
// //                 e.target.onerror = null; // Prevent infinite loop
// //                 e.target.replaceWith(
// //                   document.createElement("div")
// //                 ).innerHTML = "<p style='color:red;text-align:center;'>Image not available</p>";
// //               }}
// //             />
// //           ) : (
// //             <p >Image not available</p>
// //           )}
// //         </CModalBody>
// //         <CModalFooter>
// //           <CButton color="secondary" onClick={() => setShowImageModal(false)}>
// //             {t('LABELS.close') || 'Close'}
// //           </CButton>
// //         </CModalFooter>
// //       </CModal>

// //       <CRow>
// //         <ConfirmationModal
// //           visible={deleteModalVisible}
// //           setVisible={setDeleteModalVisible}
// //           onYes={handleDelete}
// //           resource={`Delete expense - ${deleteResource?.name}`}
// //         />

// //         <CCol xs={12}>
// //           <CCard>
// //             <CCardHeader>
// //               <strong>{t("LABELS.project_expenses") || "Projects Expenses"}</strong>
// //               <span className="ms-2 text-muted">
// //                 {t("LABELS.total")} {sortedFilteredExpenses.length} expenses
// //               </span>
// //             </CCardHeader>
// //             <CCardBody>
// //               <div className="filter-section">
// //                 <CRow className="g-1 align-items-end">
// //                   <CCol xs={12} md={6}>
// //                     <CFormLabel htmlFor="customer_id" className="mb-1 small fw-medium">
// //                       {t("LABELS.search_projects") || "Select Customer"}
// //                     </CFormLabel>
// //                     <div className="search-container" style={{ position: 'relative' }}>
// //                       <CFormInput
// //                         type="text"
// //                         id="customer_id"
// //                         className="search-input"
// //                         placeholder={t("LABELS.enter_project_name") || "Enter customer name"}
// //                         value={selectedCustomer.name}
// //                         onChange={handleCustomerNameChange}
// //                         autoComplete="off"
// //                         size="sm"
// //                       />
// //                       <div className="search-icon">🔍</div>
// //                       {customerSuggestions.length > 0 && (
// //                         <ul className="suggestions-list">
// //                           {customerSuggestions.map((customer) => (
// //                             <li
// //                               key={customer.id}
// //                               onClick={() => handleCustomerSelect(customer)}
// //                               onMouseEnter={(e) => (e.target.style.background = '#f5f5f5')}
// //                               onMouseLeave={(e) => (e.target.style.background = 'white')}
// //                             >
// //                               {customer.project_name}
// //                             </li>
// //                           ))}
// //                         </ul>
// //                       )}
// //                     </div>
// //                   </CCol>
// //                   <CCol xs={12} md={3}>
// //                     <CButton
// //                       color="primary"
// //                       onClick={handleFilterClick}
// //                       disabled={isLoading}
// //                       size="sm"
// //                       className="w-100 filter-button-mobile"
// //                     >
// //                       {isLoading ? t("LABELS.loading") || "Loading..." : t("LABELS.filter") || "Filter"}
// //                     </CButton>
// //                   </CCol>
// //                   <CCol xs={12} md={3}>
// //                     <div className="total-expense-card text-white p-2 w-100">
// //                       <div className="d-flex align-items-center justify-content-start">
// //                         <div className="total-expense-icon me-2">₹</div>
// //                         <div>
// //                           <div className="small opacity-75">
// //                             {t("LABELS.total_expenses") || "Total Expenses"}
// //                           </div>
// //                           <div className="h4 mb-0 fw-bold">
// //                             {formatCurrency(totalExpense)}
// //                           </div>
// //                         </div>
// //                       </div>
// //                     </div>
// //                   </CCol>
// //                 </CRow>
// //               </div>

// //               <CRow className="mb-3">
// //                 <CCol xs={12} md={6} lg={4}>
// //                   <div className="search-container">
// //                     <CFormInput
// //                       type="text"
// //                       className="search-input"
// //                       placeholder="Search expenses..."
// //                       value={searchInput}
// //                       onChange={handleSearchChange}
// //                     />
// //                     <div className="search-icon">🔍</div>
// //                     {searchInput && (
// //                       <button className="clear-search" onClick={clearSearch} title="Clear search">
// //                         ✕
// //                       </button>
// //                     )}
// //                   </div>
// //                 </CCol>

// //                 <CCol xs={12} md={6} lg={3}>
// //                   <CFormSelect
// //                     value={gstFilter}
// //                     onChange={(e) => setGstFilter(e.target.value)}
// //                   >
// //                     <option value="">Default</option>
// //                     <option value="gst">GST</option>
// //                     <option value="non-gst">Non-GST</option>
// //                   </CFormSelect>
// //                 </CCol>

// //                 {searchTerm && (
// //                   <CCol xs={12} className="mt-2">
// //                     <small className="text-muted">
// //                       {sortedFilteredExpenses.length} expenses found for "{searchTerm}"
// //                     </small>
// //                   </CCol>
// //                 )}
// //               </CRow>

// //               {isMobile ? (
// //                 <div className="mobile-cards-container">
// //                   {sortedFilteredExpenses.length === 0 ? (
// //                     <div className="text-center text-muted py-4">
// //                       {searchTerm ? (
// //                         <>
// //                           <p>No expenses found for "{searchTerm}"</p>
// //                           <CButton color="primary" onClick={clearSearch} size="sm">
// //                             Clear Search
// //                           </CButton>
// //                         </>
// //                       ) : selectedCustomer.id ? (
// //                         <>
// //                           <p>
// //                             {t("MSG.no_expenses_found_for_project") ||
// //                               "No expenses found for the selected Product."}
// //                           </p>
// //                           <CButton color="primary" onClick={() => navigate('/expense/new')} size="sm">
// //                             {t("LABELS.add_expense") || "Add Expense"}
// //                           </CButton>
// //                         </>
// //                       ) : (
// //                         <p>
// //                           {t("MSG.select_project_to_view_expenses") ||
// //                             "Select a project to view expenses."}
// //                         </p>
// //                       )}
// //                     </div>
// //                   ) : (
// //                     sortedFilteredExpenses.map(renderMobileCard)
// //                   )}

// //                   {isFetchingMore && (
// //                     <div className="loading-more">
// //                       <CSpinner color="primary" size="sm" />
// //                       <span className="ms-2 text-muted">
// //                         {t("MSG.loading") || "Loading more expenses..."}
// //                       </span>
// //                     </div>
// //                   )}
// //                 </div>
// //               ) : (
// //                 <div
// //                   className="table-container"
// //                   ref={tableContainerRef}
// //                   onScroll={handleScroll}
// //                 >
// //                   <CTable className="expenses-table">
// //                     <CTableHead>
// //                       <CTableRow>
// //                         <CTableHeaderCell onClick={() => handleSort('sr_no')} style={{ cursor: 'pointer' }}>
// //                           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
// //                             Sr No <span style={getSortIconStyle('sr_no')}>{getSortIcon('sr_no')}</span>
// //                           </div>
// //                         </CTableHeaderCell>
// //                         <CTableHeaderCell onClick={() => handleSort('expense_date')} style={{ cursor: 'pointer' }}>
// //                           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
// //                             Date <span style={getSortIconStyle('expense_date')}>{getSortIcon('expense_date')}</span>
// //                           </div>
// //                         </CTableHeaderCell>
// //                         <CTableHeaderCell onClick={() => handleSort('expense_type')} style={{ cursor: 'pointer' }}>
// //                           <div style={{ display: 'flex', alignItems: 'center' }}>
// //                             Expense Details <span style={getSortIconStyle('expense_type')}>{getSortIcon('expense_type')}</span>
// //                           </div>
// //                         </CTableHeaderCell>
// //                         <CTableHeaderCell onClick={() => handleSort('total_price')} style={{ cursor: 'pointer' }}>
// //                           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
// //                             Amount <span style={getSortIconStyle('total_price')}>{getSortIcon('total_price')}</span>
// //                           </div>
// //                         </CTableHeaderCell>
// //                         <CTableHeaderCell onClick={() => handleSort('contact')} style={{ cursor: 'pointer' }}>
// //                           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
// //                             Contact <span style={getSortIconStyle('contact')}>{getSortIcon('contact')}</span>
// //                           </div>
// //                         </CTableHeaderCell>
// //                         <CTableHeaderCell onClick={() => handleSort('desc')} style={{ cursor: 'pointer' }}>
// //                           <div style={{ display: 'flex', alignItems: 'center' }}>
// //                             Notes <span style={getSortIconStyle('desc')}>{getSortIcon('desc')}</span>
// //                           </div>
// //                         </CTableHeaderCell>
// //                         <CTableHeaderCell onClick={() => handleSort('payment_by')} style={{ cursor: 'pointer' }}>
// //                           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
// //                             Payment By <span style={getSortIconStyle('payment_by')}>{getSortIcon('payment_by')}</span>
// //                           </div>
// //                         </CTableHeaderCell>
// //                         <CTableHeaderCell onClick={() => handleSort('payment_type')} style={{ cursor: 'pointer' }}>
// //                           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
// //                             Payment Type <span style={getSortIconStyle('payment_type')}>{getSortIcon('payment_type')}</span>
// //                           </div>
// //                         </CTableHeaderCell>
// //                         <CTableHeaderCell onClick={() => handleSort('pending_amount')} style={{ cursor: 'pointer' }}>
// //                           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
// //                             Pending Amount <span style={getSortIconStyle('pending_amount')}>{getSortIcon('pending_amount')}</span>
// //                           </div>
// //                         </CTableHeaderCell>
// //                         <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
// //                       </CTableRow>
// //                     </CTableHead>
// //                     <CTableBody>
// //                       {sortedFilteredExpenses.length === 0 ? (
// //                         <CTableRow>
// //                           <CTableDataCell colSpan={10} className="text-center py-4">
// //                             {searchTerm ? (
// //                               <div className="text-muted">
// //                                 <p>No expenses found for "{searchTerm}"</p>
// //                                 <CButton color="primary" onClick={clearSearch} size="sm">
// //                                   Clear Search
// //                                 </CButton>
// //                               </div>
// //                             ) : selectedCustomer.id ? (
// //                               <div className="text-muted">
// //                                 <p>
// //                                   {t("MSG.no_expenses_found_for_project") ||
// //                                     "No expenses found for the selected Product."}
// //                                 </p>
// //                                 <CButton color="primary" onClick={() => navigate('/expense/new')} size="sm">
// //                                   {t("LABELS.add_expense") || "Add Expense"}
// //                                 </CButton>
// //                               </div>
// //                             ) : (
// //                               <p className="text-muted">
// //                                 {t("MSG.select_project_to_view_expenses") ||
// //                                   "Select a project to view expenses."}
// //                               </p>
// //                             )}
// //                           </CTableDataCell>
// //                         </CTableRow>
// //                       ) : (
// //                         sortedFilteredExpenses.map((expense) => (
// //                           <CTableRow key={expense.id}>
// //                             <CTableDataCell>
// //                               <div style={{ fontSize: '0.85em' }}>{expense.sr_no}</div>
// //                             </CTableDataCell>
// //                             <CTableDataCell>
// //                               <div style={{ fontSize: '0.85em' }}>{formatDate(expense.expense_date)}</div>
// //                             </CTableDataCell>
// //                             <CTableDataCell style={{ textAlign: 'left' }}>
// //                               <div style={{ wordBreak: 'break-word' }}>{expense.expense_type?.name || '-'}</div>
// //                             </CTableDataCell>
// //                             <CTableDataCell>
// //                               <span style={{ fontWeight: '500', color: '#dc3545' }}>{formatCurrency(expense.total_price)}</span>
// //                             </CTableDataCell>
// //                             <CTableDataCell>
// //                               <div style={{ wordBreak: 'break-word' }}>{expense.contact || '-'}</div>
// //                             </CTableDataCell>
// //                             <CTableDataCell style={{ textAlign: 'left' }}>
// //                               <div style={{ wordBreak: 'break-word' }}>{expense.desc || '-'}</div>
// //                             </CTableDataCell>
// //                             <CTableDataCell>
// //                               <div style={{ wordBreak: 'break-word' }}>{expense.payment_by || '-'}</div>
// //                             </CTableDataCell>
// //                             <CTableDataCell>
// //                               <div style={{ wordBreak: 'break-word' }}>{expense.payment_type || '-'}</div>
// //                             </CTableDataCell>
// //                             <CTableDataCell>
// //                               <span style={{ fontWeight: '500' }}>{expense.pending_amount ? formatCurrency(expense.pending_amount) : '-'}</span>
// //                             </CTableDataCell>
// //                             <CTableDataCell>
// //                               <div className="action-buttons">
// //                                 {usertype === 1 ? (
// //                                   <>
// //                                     <CBadge
// //                                       role="button"
// //                                       color="primary"
// //                                       onClick={() => handleEditExpense(expense)}
// //                                       style={{ cursor: 'pointer', fontSize: '0.75em' }}
// //                                     >
// //                                       Edit
// //                                     </CBadge>
// //                                     <CBadge
// //                                       role="button"
// //                                       color="danger"
// //                                       onClick={() => handleDeleteClick(expense)}
// //                                       style={{ cursor: 'pointer', fontSize: '0.75em' }}
// //                                     >
// //                                       Delete
// //                                     </CBadge>
// //                                   </>
// //                                 ) : (
// //                                   <CBadge
// //                                     role="button"
// //                                     color="primary"
// //                                     onClick={() => handleEditExpense(expense)}
// //                                     style={{ cursor: 'pointer', fontSize: '0.75em' }}
// //                                   >
// //                                     Edit
// //                                   </CBadge>
// //                                 )}
// //                                 {expense.photo_url && (
// //                                   <CBadge
// //                                     role="button"
// //                                     color="secondary"
// //                                     onClick={() => handleViewImage(expense)}
// //                                     style={{ cursor: 'pointer', fontSize: '0.75em' }}
// //                                   >
// //                                     {t('LABELS.view') || 'View'}
// //                                   </CBadge>
// //                                 )}
// //                               </div>
// //                             </CTableDataCell>
// //                           </CTableRow>
// //                         ))
// //                       )}
// //                     </CTableBody>
// //                   </CTable>
// //                   {isFetchingMore && (
// //                     <div className="loading-more">
// //                       <CSpinner color="primary" size="sm" />
// //                       <span className="ms-2 text-muted">{t("MSG.loading") || "Loading more expenses..."}</span>
// //                     </div>
// //                   )}
// //                 </div>
// //               )}
// //             </CCardBody>
// //           </CCard>
// //         </CCol>
// //       </CRow>
// //     </>
// //   );
// // };

// // export default CustomerReport;





// import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
// import {
//   CBadge,
//   CButton,
//   CCard,
//   CCardBody,
//   CCardHeader,
//   CCol,
//   CFormInput,
//   CFormLabel,
//   CRow,
//   CTable,
//   CTableBody,
//   CTableDataCell,
//   CTableHead,
//   CTableHeaderCell,
//   CTableRow,
//   CSpinner,
//   CFormSelect,
//   CModal,
//   CModalHeader,
//   CModalTitle,
//   CModalBody,
//   CModalFooter,
// } from '@coreui/react';
// import { useNavigate } from 'react-router-dom';
// import { useToast } from '../../common/toast/ToastContext';
// import { useTranslation } from 'react-i18next';
// import { cilTrash } from '@coreui/icons';
// import CIcon from '@coreui/icons-react';
// import { deleteAPICall, getAPICall } from '../../../util/api';
// import EditExpense from '../expense/EditExpense';
// import ConfirmationModal from '../../common/ConfirmationModal';
// import { getUserType } from '../../../util/session';
// import * as XLSX from 'xlsx'; // For Excel export
// import jsPDF from 'jspdf'; // For PDF export
// import 'jspdf-autotable'; // For table in PDF

// const CustomerReport = () => {
//   const navigate = useNavigate();
//   const { showToast } = useToast();
//   const { t } = useTranslation("global");

//   const usertype = getUserType();

//   const [showEditModal, setShowEditModal] = useState(false);
//   const [selectedExpense, setSelectedExpense] = useState(null);
//   // State management
//   const [expenses, setExpenses] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [searchInput, setSearchInput] = useState('');
//   const [deleteResource, setDeleteResource] = useState();
//   const [deleteModalVisible, setDeleteModalVisible] = useState(false);
//   const [totalExpense, setTotalExpense] = useState(0);
//   const [nextCursor, setNextCursor] = useState(null);
//   const [hasMorePages, setHasMorePages] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isFetchingMore, setIsFetchingMore] = useState(false);
//   const [isMobile, setIsMobile] = useState(false);
//   const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
//   const [customerSuggestions, setCustomerSuggestions] = useState([]);
//   const [selectedCustomer, setSelectedCustomer] = useState({ name: '', id: null });
//   const [gstFilter, setGstFilter] = useState('');
//   // New state for image modal
//   const [showImageModal, setShowImageModal] = useState(false);
//   const [selectedImage, setSelectedImage] = useState('');

//   const handleSort = (key) => {
//     let direction = 'asc';
//     if (sortConfig.key === key && sortConfig.direction === 'asc') {
//       direction = 'desc';
//     }
//     setSortConfig({ key, direction });
//   };

//   const getSortIcon = (columnKey) => {
//     if (sortConfig.key === columnKey) {
//       return sortConfig.direction === 'asc' ? '↑' : '↓';
//     }
//     return '↕';
//   };

//   const getSortIconStyle = (columnKey) => ({
//     marginLeft: '8px',
//     fontSize: '14px',
//     opacity: sortConfig.key === columnKey ? 1 : 0.5,
//     color: sortConfig.key === columnKey ? '#0d6efd' : '#6c757d',
//     transition: 'all 0.2s ease',
//   });

//   // Refs for scroll and debouncing
//   const tableContainerRef = useRef(null);
//   const debounceTimerRef = useRef(null);
//   const scrollTimeoutRef = useRef(null);
//   const scrollPositionRef = useRef(0);
//   const isInfiniteScrollingRef = useRef(false);
//   const customerSearchDebounceRef = useRef(null);

//   // Check screen size for mobile responsiveness
//   useEffect(() => {
//     const checkScreenSize = () => {
//       setIsMobile(window.innerWidth <= 768);
//     };

//     checkScreenSize();
//     window.addEventListener('resize', checkScreenSize);
//     return () => window.removeEventListener('resize', checkScreenSize);
//   }, []);

//   const handleEditExpense = (expense) => {
//     setSelectedExpense(expense);
//     setShowEditModal(true);
//   };

//   const handleExpenseUpdated = (updatedExpense) => {
//     fetchExpenses(true); // Triggers full refresh
//   };

//   // Debounced search implementation for expenses
//   const debouncedSearch = useCallback((value) => {
//     if (debounceTimerRef.current) {
//       clearTimeout(debounceTimerRef.current);
//     }
//     debounceTimerRef.current = setTimeout(() => {
//       setSearchTerm(value);
//     }, 300);
//   }, []);

//   // Debounced search for customers
//   const debouncedCustomerSearch = useCallback((value) => {
//     if (customerSearchDebounceRef.current) {
//       clearTimeout(customerSearchDebounceRef.current);
//     }
//     customerSearchDebounceRef.current = setTimeout(() => {
//       fetchCustomers(value);
//     }, 300);
//   }, []);

//   const fetchCustomers = async (searchQuery = '') => {
//     try {
//       const url = `/api/projects?searchQuery=${encodeURIComponent(searchQuery)}`;
//       const response = await getAPICall(url);
//       setCustomerSuggestions(response || []);
//     } catch (error) {
//       showToast('danger', 'Error fetching customers: ' + error);
//     }
//   };

//   const handleCustomerNameChange = (e) => {
//     const value = e.target.value;
//     setSelectedCustomer({ name: value, id: null });
//     debouncedCustomerSearch(value);
//   };

//   const handleCustomerSelect = (customer) => {
//     setSelectedCustomer({ name: customer.project_name, id: customer.id });
//     setCustomerSuggestions([]);
//   };

//   const sortedFilteredExpenses = useMemo(() => {
//     let filtered = expenses.map((expense, index) => ({
//       ...expense,
//       sr_no: index + 1,
//     }));

//     if (searchTerm.trim()) {
//       const searchLower = searchTerm.toLowerCase();
//       filtered = filtered.filter((expense) =>
//         expense.expense_type?.name?.toLowerCase().includes(searchLower) ||
//         expense.expense_date?.toLowerCase().includes(searchLower) ||
//         expense.total_price?.toString().includes(searchTerm) ||
//         expense.contact?.toLowerCase().includes(searchLower) ||
//         expense.desc?.toLowerCase().includes(searchLower) ||
//         expense.payment_by?.toLowerCase().includes(searchLower) ||
//         expense.payment_type?.toLowerCase().includes(searchLower) ||
//         expense.pending_amount?.toString().includes(searchTerm)
//       );
//     }

//     if (gstFilter === 'gst') {
//       filtered = filtered.filter((expense) => expense.isGst === 1 || expense.isGst === true);
//     } else if (gstFilter === 'non-gst') {
//       filtered = filtered.filter((expense) => expense.isGst === 0 || expense.isGst === false);
//     }

//     if (!sortConfig.key) return filtered;

//     return [...filtered].sort((a, b) => {
//       let aVal = a[sortConfig.key];
//       let bVal = b[sortConfig.key];

//       if (sortConfig.key === 'expense_type') {
//         aVal = a.expense_type?.name || '';
//         bVal = b.expense_type?.name || '';
//       }

//       if (typeof aVal === 'string') aVal = aVal.toLowerCase();
//       if (typeof bVal === 'string') bVal = bVal.toLowerCase();

//       if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
//       if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
//       return 0;
//     });
//   }, [expenses, searchTerm, sortConfig, gstFilter]);

//   const handleScroll = useCallback(() => {
//     if (scrollTimeoutRef.current) {
//       clearTimeout(scrollTimeoutRef.current);
//     }

//     scrollTimeoutRef.current = setTimeout(() => {
//       const container = tableContainerRef.current;
//       if (!container) return;

//       const { scrollTop, scrollHeight, clientHeight } = container;
//       const threshold = 100;

//       scrollPositionRef.current = scrollTop;

//       if (
//         scrollTop + clientHeight >= scrollHeight - threshold &&
//         hasMorePages &&
//         !isFetchingMore &&
//         !isLoading
//       ) {
//         isInfiniteScrollingRef.current = true;
//         fetchExpenses(false);
//       }
//     }, 100);
//   }, [hasMorePages, isFetchingMore, isLoading]);

//   const fetchExpenses = async (reset = true) => {
//     if (!selectedCustomer.id) {
//       showToast('warning', t("MSG.please_select_customer") || 'Please select a customer');
//       return;
//     }

//     if (reset) {
//       setIsLoading(true);
//       isInfiniteScrollingRef.current = false;
//     } else {
//       setIsFetchingMore(true);
//     }

//     try {
//       const url = `/api/expense?customerId=${selectedCustomer.id}` +
//         (nextCursor && !reset ? `&cursor=${nextCursor}` : '');

//       const response = await getAPICall(url);

//       if (response.error) {
//         showToast('danger', response.error);
//       } else {
//         const newExpenses = reset ? response.data : [...expenses, ...response.data];

//         const currentScrollPosition = scrollPositionRef.current;

//         setExpenses(newExpenses);
//         setTotalExpense(response.totalExpense || 0);
//         setNextCursor(response.next_cursor || null);
//         setHasMorePages(response.has_more_pages);

//         if (isInfiniteScrollingRef.current && !reset) {
//           requestAnimationFrame(() => {
//             requestAnimationFrame(() => {
//               if (tableContainerRef.current) {
//                 tableContainerRef.current.scrollTop = currentScrollPosition;
//               }
//               isInfiniteScrollingRef.current = false;
//             });
//           });
//         }
//       }
//     } catch (error) {
//       showToast('danger', 'Error occurred: ' + error);
//     } finally {
//       setIsLoading(false);
//       setIsFetchingMore(false);
//     }
//   };

//   const handleDelete = async () => {
//     try {
//       await deleteAPICall('/api/expense/' + deleteResource.id);
//       setDeleteModalVisible(false);

//       isInfiniteScrollingRef.current = false;
//       scrollPositionRef.current = 0;

//       fetchExpenses(true);
//       showToast('success', t("MSG.expense_deleted_successfully") || 'Expense deleted successfully');
//     } catch (error) {
//       showToast('danger', 'Error occurred: ' + error);
//     }
//   };

//   const handleEdit = (expense) => {
//     navigate('/expense/edit/' + expense.id);
//   };

//   // const formatCurrency = (amount) => {
//   //   return new Intl.NumberFormat('en-IN', {
//   //     style: 'currency',
//   //     currency: 'INR',
//   //   }).format(amount || 0);
//   // };

//   const formatDate = (dateString) => {
//     const options = { day: 'numeric', month: 'short', year: 'numeric' };
//     const date = new Date(dateString);
//     const formattedDate = date.toLocaleDateString('en-US', options).replace(',', '');
//     const [month, day] = formattedDate.split(' ');
//     return `${day} ${month}`;
//   };

//   const handleFilterClick = () => {
//     isInfiniteScrollingRef.current = false;
//     scrollPositionRef.current = 0;
//     setNextCursor(null);
//     fetchExpenses(true);
//   };

//   const handleSearchChange = (e) => {
//     const value = e.target.value;
//     setSearchInput(value);
//     debouncedSearch(value);
//   };

//   const clearSearch = () => {
//     setSearchInput('');
//     setSearchTerm('');
//     if (debounceTimerRef.current) {
//       clearTimeout(debounceTimerRef.current);
//     }
//   };

//   const handleDeleteClick = (expense) => {
//     setDeleteResource(expense);
//     setDeleteModalVisible(true);
//   };

//   const handleViewImage = (expense) => {
//     setSelectedImage(expense.photo_url || ''); // Assuming photo_url contains the image path
//     setShowImageModal(true);
//   };

//   // Export to Excel
//   const exportToExcel = () => {
//     const worksheetData = sortedFilteredExpenses.map((expense, index) => ({
//       'Sr No': expense.sr_no,
//       'Date': formatDate(expense.expense_date),
//       'Expense Details': expense.expense_type?.name || '-',
//       'Amount': expense.total_price,
//       'Contact': expense.contact || '-',
//       'Notes': expense.desc || '-',
//       'Payment By': expense.payment_by || '-',
//       'Payment Type': expense.payment_type || '-',
//       'Pending Amount': expense.pending_amount || 0,
//     }));

//     const worksheet = XLSX.utils.json_to_sheet(worksheetData);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, 'Expenses');
//     XLSX.writeFile(workbook, `Project_Expense_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
//     showToast('success', 'Excel file downloaded successfully!');
//   };

//   // Export to PDF
//   // const exportToPDF = () => {
//   //   const doc = new jsPDF();
//   //   const tableColumn = [
//   //     'Sr No', 'Date', 'Expense Details', 'Amount', 'Contact', 'Notes', 'Payment By', 'Payment Type', 'Pending Amount',
//   //   ];
//   //   const tableRows = sortedFilteredExpenses.map((expense) => [
//   //     expense.sr_no,
//   //     formatDate(expense.expense_date),
//   //     expense.expense_type?.name || '-',
//   //     formatCurrency(expense.total_price),
//   //     expense.contact || '-',
//   //     expense.desc || '-',
//   //     expense.payment_by || '-',
//   //     expense.payment_type || '-',
//   //     expense.pending_amount ? formatCurrency(expense.pending_amount) : '-',
//   //   ]);

//   //   doc.autoTable({
//   //     head: [tableColumn],
//   //     body: tableRows,
//   //     startY: 20,
//   //     theme: 'striped',
//   //     styles: { fontSize: 8 },
//   //     headStyles: { fillColor: [22, 160, 133] },
//   //   });

//   //   doc.text('Customer Expense Report', 14, 15);
//   //   doc.text(`Total Amount: ${formatCurrency(totalExpense)}`, 14, doc.internal.pageSize.height - 10);
//   //   doc.save(`Project_Expense_Report_${new Date().toISOString().split('T')[0]}.pdf`);
//   //   showToast('success', 'PDF file downloaded successfully!');
//   // };

//   // ✅ Indian number formatting
// const formatIndianNumber = (amount) => {
//   const numericAmount = parseFloat(amount) || 0
//   const [integerPart, decimalPart = '00'] = numericAmount.toFixed(2).split('.')
//   const lastThree = integerPart.slice(-3)
//   const otherNumbers = integerPart.slice(0, -3)
//   const formattedInteger =
//     otherNumbers.length > 0
//       ? otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree
//       : lastThree
//   return `${formattedInteger}.${decimalPart}`
// }

// const formatCurrency = (amt) => `INR ${formatIndianNumber(amt)}`

// // ✅ Export PDF with auto landscape if needed
// const exportToPDF = () => {
//   // 👉 Try portrait first; if table is too wide jsPDF will wrap to next page.
//   // We can simply start in landscape for safety when many columns.
//   const doc = new jsPDF({
//     orientation: 'landscape',  // <-- use landscape for wider page
//     unit: 'pt',
//     format: 'a4'
//   })

//   const tableColumn = [
//     'Sr No',
//     'Date',
//     'Expense Details',
//     'Amount',
//     'Contact',
//     'Notes',
//     'Payment By',
//     'Payment Type',
//     'Pending Amount'
//   ]

//   const tableRows = sortedFilteredExpenses.map((exp) => [
//     exp.sr_no,
//     formatDate(exp.expense_date),
//     exp.expense_type?.name || '-',
//     formatCurrency(exp.total_price),
//     exp.contact || '-',
//     exp.desc || '-',
//     exp.payment_by || '-',
//     exp.payment_type || '-',
//     exp.pending_amount ? formatCurrency(exp.pending_amount) : '-',
//   ])

//   doc.setFontSize(14)
//   doc.text('Project Expense Report', 40, 40)

//   doc.autoTable({
//     head: [tableColumn],
//     body: tableRows,
//     startY: 60,
//     theme: 'striped',
//     styles: {
//       fontSize: 8,
//       cellPadding: 3,
//       overflow: 'linebreak',
//       valign: 'middle'
//     },
//     headStyles: {
//       fillColor: [22, 160, 133],
//       textColor: 255,
//       halign: 'center'
//     },
//     // Adjust widths for landscape page
//     columnStyles: {
//       0: { cellWidth: 40 },
//       1: { cellWidth: 70 },
//       2: { cellWidth: 100 },
//       3: { cellWidth: 70 },
//       4: { cellWidth: 80 },
//       5: { cellWidth: 100 },
//       6: { cellWidth: 70 },
//       7: { cellWidth: 70 },
//       8: { cellWidth: 80 },
//     },
//     didDrawPage: () => {
//       const pageHeight = doc.internal.pageSize.getHeight()
//       doc.setFontSize(12)
//       doc.text(
//         `Total Amount: ${formatCurrency(totalExpense)}`,
//         40,
//         pageHeight - 20
//       )
//     }
//   })

//   doc.save(`Project_Expense_Report_${new Date().toISOString().split('T')[0]}.pdf`)
//   showToast('success', 'PDF file downloaded successfully!')
// }

//   // Fetch customers on component mount
//   useEffect(() => {
//     fetchCustomers();
//   }, []);

//   // Cleanup timers
//   useEffect(() => {
//     return () => {
//       if (debounceTimerRef.current) {
//         clearTimeout(debounceTimerRef.current);
//       }
//       if (scrollTimeoutRef.current) {
//         clearTimeout(scrollTimeoutRef.current);
//       }
//       if (customerSearchDebounceRef.current) {
//         clearTimeout(customerSearchDebounceRef.current);
//       }
//     };
//   }, []);

//   if (isLoading) {
//     return (
//       <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
//         <div className="text-center">
//           <CSpinner color="primary" size="lg" />
//           <p className="mt-3 text-muted">Loading expenses...</p>
//         </div>
//       </div>
//     );
//   }

//   const renderMobileCard = (expense) => (
//     <>
//       <style>{expenseCardStyles}</style>

//       <CCard key={expense.id} className="mb-3 expense-card">
//         <CCardBody>
//           <div className="card-row-1">
//             <div className="expense-name-section">
//               <div className="expense-name">{expense.expense_type?.name || 'N/A'}</div>
//               <div className="expense-type">
//                 <span className="category-text">{expense.sr_no}</span>
//               </div>
//             </div>
//             <div className="expense-total">
//               <div className="total-amount">{formatCurrency(expense.total_price)}</div>
//               <div className="total-label">Amount</div>
//             </div>
//           </div>

//           <div className="card-row-2">
//             <div className="expense-date">
//               📅 {formatDate(expense.expense_date)}
//             </div>
//             <div className="expense-details">
//               <span className="detail-item">{expense.contact || '-'}</span>
//               <span className="detail-item">{expense.payment_by || '-'}</span>
//             </div>
//           </div>

//           <div className="card-row-2">
//             <div className="expense-details">
//               <span className="detail-item">{expense.payment_type || '-'}</span>
//               <span className="detail-item">{expense.pending_amount ? formatCurrency(expense.pending_amount) : '-'}</span>
//             </div>
//           </div>

//           <div className="card-row-3">
//             <div className="expense-details">
//               <span className="detail-item">{expense.desc || '-'}</span>
//             </div>
//           </div>

//           <div className="card-row-3">
//             <div className="action-buttons-mobile">
//               <button
//                 className="badge bg-primary"
//                 onClick={() => handleEditExpense(expense)}
//                 role="button"
//               >
//                 {t('LABELS.edit') || 'Edit'}
//               </button>
//               <button
//                 className="badge bg-danger"
//                 onClick={() => handleDeleteClick(expense)}
//                 role="button"
//               >
//                 {t('LABELS.delete') || 'Delete'}
//               </button>
//               {expense.photo_url && (
//                 <button
//                   className="badge bg-secondary"
//                   onClick={() => handleViewImage(expense)}
//                   role="button"
//                 >
//                   {/* {t('LABELS.view') || 'View'} */} View
//                 </button>
//               )}
//             </div>
//           </div>
//         </CCardBody>
//       </CCard>
//     </>
//   );

//   const expenseCardStyles = `
//     .expense-card {
//       border: 1px solid #dee2e6;
//       border-radius: 8px;
//       box-shadow: 0 1px 4px rgba(0,0,0,0.1);
//       transition: all 0.3s ease;
//       overflow: hidden;
//       margin-bottom: 12px;
//     }

//     .expense-card:hover {
//       transform: translateY(-1px);
//       box-shadow: 0 2px 8px rgba(0,0,0,0.15);
//     }

//     .expense-card .card-body {
//       padding: 12px !important;
//     }

//     .expense-card .card-row-1 {
//       display: flex;
//       justify-content: space-between;
//       align-items: flex-start;
//       margin-bottom: 8px;
//     }

//     .expense-name-section {
//       flex: 1;
//       display: flex;
//       flex-direction: column;
//       gap: 4px;
//     }

//     .expense-name {
//       font-weight: 600;
//       font-size: 1em;
//       color: #333;
//       line-height: 1.1;
//     }

//     .expense-type {
//       display: flex;
//       gap: 8px;
//       align-items: center;
//     }

//     .category-text {
//       color: #666;
//       font-size: 0.8em;
//     }

//     .expense-total {
//       text-align: right;
//     }

//     .total-amount {
//       font-weight: 600;
//       font-size: 1.1em;
//       color: #d32f2f;
//       line-height: 1.1;
//     }

//     .total-label {
//       font-size: 0.7em;
//       color: #666;
//     }

//     .expense-card .card-row-2 {
//       margin-bottom: 8px;
//       padding: 4px 0;
//       border-top: 1px solid #f0f0f0;
//       display: flex;
//       justify-content: space-between;
//       align-items: center;
//     }

//     .expense-date {
//       color: #666;
//       font-size: 0.85em;
//       display: flex;
//       align-items: center;
//       gap: 4px;
//     }

//     .expense-details {
//       display: flex;
//       gap: 24px;
//     }

//     .detail-item {
//       color: #333;
//       font-size: 0.85em;
//       font-weight: 500;
//     }

//     .expense-card .card-row-3 {
//       padding: 6px 0;
//       border-top: 1px solid #f0f0f0;
//     }

//     .expense-card .action-buttons-mobile {
//       display: flex;
//       gap: 8px;
//       justify-content: flex-start;
//       width: 100%;
//     }

//     .expense-card .action-buttons-mobile .badge {
//       font-size: 0.85em;
//       padding: 8px 8px;
//       border-radius: 16px;
//       cursor: pointer;
//       transition: all 0.2s ease;
//       border: 1px solid transparent;
//       text-align: center;
//       min-height: 36px;
//       display: flex;
//       align-items: center;
//       justify-content: center;
//       font-weight: 500;
//       width: 100%;
//     }

//     .expense-card .action-buttons-mobile .badge:hover {
//       transform: translateY(-1px);
//       box-shadow: 0 2px 4px rgba(0,0,0,0.1);
//     }

//     .expense-card .action-buttons-mobile .badge.bg-danger {
//       background-color: #dc3545 !important;
//       border-color: #dc3545;
//       color: white !important;
//     }

//     .suggestions-list {
//       position: absolute;
//       z-index: 1000;
//       background: white;
//       border: 1px solid #ccc;
//       list-style: none;
//       padding: 0;
//       max-height: 200px;
//       overflow-y: auto;
//       width: 100%;
//       box-shadow: 0 2px 4px rgba(0,0,0,0.1);
//     }

//     .suggestions-list li {
//       padding: 8px;
//       cursor: pointer;
//       border-bottom: 1px solid #eee;
//     }

//     .suggestions-list li:hover {
//       background: #f5f5f5;
//     }

//     @media (max-width: 576px) {
//       .expense-name {
//         font-size: 0.95em;
//       }

//       .expense-card .card-body {
//         padding: 10px !important;
//       }

//       .expense-card .action-buttons-mobile .badge {
//         font-size: 0.8em;
//         padding: 6px 12px;
//         min-height: 32px;
//       }
//     }
//   `;

//   return (
//     <>
//       <style jsx global>{`
//         .table-container {
//           height: 350px;
//           overflow-y: auto;
//           border: 1px solid #dee2e6;
//           border-radius: 0.375rem;
//           position: relative;
//         }

//         @media (max-width: 768px) {
//           .table-container {
//             height: 400px;
//             overflow-x: auto;
//             overflow-y: auto;
//           }
//         }

//         .expenses-table {
//           width: 100%;
//           table-layout: fixed;
//           margin-bottom: 0;
//         }

//         .expenses-table thead th {
//           position: sticky;
//           top: 0;
//           z-index: 10;
//           background-color: #f8f9fa;
//           border-bottom: 2px solid #dee2e6;
//           box-shadow: 0 2px 2px -1px rgba(0, 0, 0, 0.1);
//         }

//         .expenses-table th,
//         .expenses-table td {
//           text-align: center;
//           vertical-align: middle;
//           padding: 8px 4px;
//           word-wrap: break-word;
//           overflow-wrap: break-word;
//         }

//         .expenses-table th:nth-child(1) { width: 8%; }
//         .expenses-table th:nth-child(2) { width: 12%; }
//         .expenses-table th:nth-child(3) { width: 15%; text-align: left; }
//         .expenses-table th:nth-child(4) { width: 12%; }
//         .expenses-table th:nth-child(5) { width: 12%; }
//         .expenses-table th:nth-child(6) { width: 15%; text-align: left; }
//         .expenses-table th:nth-child(7) { width: 12%; }
//         .expenses-table th:nth-child(8) { width: 12%; }
//         .expenses-table th:nth-child(9) { width: 12%; }
//         .expenses-table th:nth-child(10) { width: 12%; }

//         .expenses-table td:nth-child(1) { width: 8%; }
//         .expenses-table td:nth-child(2) { width: 12%; }
//         .expenses-table td:nth-child(3) { width: 15%; text-align: left; }
//         .expenses-table td:nth-child(4) { width: 12%; }
//         .expenses-table td:nth-child(5) { width: 12%; }
//         .expenses-table td:nth-child(6) { width: 15%; text-align: left; }
//         .expenses-table td:nth-child(7) { width: 12%; }
//         .expenses-table td:nth-child(8) { width: 12%; }
//         .expenses-table td:nth-child(9) { width: 12%; }
//         .expenses-table td:nth-child(10) { width: 12%; }

//         .search-container {
//           position: relative;
//           width: 100%;
//         }

//         .search-input {
//           padding-left: 40px;
//         }

//         .search-icon {
//           position: absolute;
//           left: 12px;
//           top: 50%;
//           transform: translateY(-50%);
//           color: #6c757d;
//           pointer-events: none;
//         }

//         .clear-search {
//           position: absolute;
//           right: 12px;
//           top: 50%;
//           transform: translateY(-50%);
//           background: none;
//           border: none;
//           color: #6c757d;
//           cursor: pointer;
//           padding: 0;
//           font-size: 16px;
//         }

//         .clear-search:hover {
//           color: #dc3545;
//         }

//         .filter-button-mobile {
//           margin-top: 0;
//         }

//         @media (max-width: 768px) {
//           .filter-button-mobile {
//             margin-top: 5px;
//           }
//         }

//         .action-buttons {
//           display: flex;
//           gap: 4px;
//           justify-content: center;
//           flex-wrap: wrap;
//         }

//         .loading-more {
//           position: sticky;
//           bottom: 0;
//           background: #f8f9fa;
//           border-top: 1px solid #dee2e6;
//           padding: 10px;
//           text-align: center;
//           z-index: 5;
//         }

//         .total-expense-card {
//           background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
//           border: none;
//           border-radius: 12px;
//           box-shadow: 0 4px 8px rgba(220, 53, 69, 0.2);
//         }

//         .total-expense-icon {
//           background: rgba(255, 255, 255, 0.2);
//           border-radius: 50%;
//           width: 40px;
//           height: 40px;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           font-size: 18px;
//           font-weight: bold;
//           color: white;
//         }

//         .filter-section {
//           background: #f8f9fa;
//           border: 1px solid #e9ecef;
//           border-radius: 8px;
//           padding: 5px;
//           margin-bottom: 5px;
//         }

//         @media (max-width: 768px) {
//           .expenses-table {
//             min-width: 950px;
//             table-layout: fixed;
//           }

//           .expenses-table th,
//           .expenses-table td {
//             white-space: nowrap;
//             padding: 8px 6px;
//             border-right: 1px solid #dee2e6;
//             font-size: 13px;
//           }

//           .expenses-table th:nth-child(1),
//           .expenses-table td:nth-child(1) {
//             width: 80px;
//             min-width: 80px;
//           }

//           .expenses-table th:nth-child(2),
//           .expenses-table td:nth-child(2) {
//             width: 120px;
//             min-width: 120px;
//           }

//           .expenses-table th:nth-child(3),
//           .expenses-table td:nth-child(3) {
//             width: 160px;
//             min-width: 160px;
//           }

//           .expenses-table th:nth-child(4),
//           .expenses-table td:nth-child(4) {
//             width: 120px;
//             min-width: 120px;
//           }

//           .expenses-table th:nth-child(5),
//           .expenses-table td:nth-child(5) {
//             width: 120px;
//             min-width: 120px;
//           }

//           .expenses-table th:nth-child(6),
//           .expenses-table td:nth-child(6) {
//             width: 160px;
//             min-width: 160px;
//           }

//           .expenses-table th:nth-child(7),
//           .expenses-table td:nth-child(7) {
//             width: 120px;
//             min-width: 120px;
//           }

//           .expenses-table th:nth-child(8),
//           .expenses-table td:nth-child(8) {
//             width: 120px;
//             min-width: 120px;
//           }

//           .expenses-table th:nth-child(9),
//           .expenses-table td:nth-child(9) {
//             width: 120px;
//             min-width: 120px;
//           }

//           .action-buttons {
//             flex-direction: row;
//             gap: 2px;
//           }

//           .action-buttons .badge {
//             font-size: 10px;
//             padding: 2px 6px;
//           }

//           .filter-section {
//             padding: 15px;
//           }

//           .total-expense-card {
//             margin-top: 0.3rem;
//           }
//         }

//         @media (max-width: 576px) {
//           .expenses-table {
//             font-size: 12px;
//             min-width: 900px;
//           }

//           .expenses-table th,
//           .expenses-table td {
//             padding: 6px 4px;
//           }

//           .action-buttons .badge {
//             font-size: 9px;
//             padding: 2px 4px;
//           }

//           .filter-section {
//             padding: 5px;
//           }

//           .expenses-table {
//             display: none !important;
//           }
//         }
//       `}</style>

//       <EditExpense
//         visible={showEditModal}
//         onClose={() => setShowEditModal(false)}
//         expense={selectedExpense}
//         onExpenseUpdated={handleExpenseUpdated}
//       />

//       <CModal visible={showImageModal} onClose={() => setShowImageModal(false)}>
//         <CModalHeader>
//           <CModalTitle>
//             {/* {t('LABELS.view_image') || 'View Image'} */}
// View Image
//           </CModalTitle>
//         </CModalHeader>
//         <CModalBody>
//           {selectedImage ? (
//             <img
//               src={`/bill/bill/${selectedImage.split('/').pop()}`}
//               alt="Expense"
//               style={{ maxWidth: '100%', maxHeight: '70vh' }}
//               onError={(e) => {
//                 e.target.onerror = null; // Prevent infinite loop
//                 e.target.replaceWith(
//                   document.createElement("div")
//                 ).innerHTML = "<p style='color:red;text-align:center;'>Image not available</p>";
//               }}
//             />
//           ) : (
//             <p style={{ color: 'red', textAlign: 'center' }}>Image not available</p>
//           )}
//         </CModalBody>
//         <CModalFooter>
//           <CButton color="secondary" onClick={() => setShowImageModal(false)}>
//             {t('LABELS.close') || 'Close'}
//           </CButton>
//         </CModalFooter>
//       </CModal>

//       <CRow>
//         <ConfirmationModal
//           visible={deleteModalVisible}
//           setVisible={setDeleteModalVisible}
//           onYes={handleDelete}
//           resource={`Delete expense - ${deleteResource?.name}`}
//         />

//         <CCol xs={12}>
//           <CCard>
//             <CCardHeader>
//               <strong>{t("LABELS.project_expenses") || "Projects Expenses"}</strong>
//               <span className="ms-2 text-muted">
//                 {t("LABELS.total")} {sortedFilteredExpenses.length} expenses
//               </span>
//             </CCardHeader>
//             <CCardBody>
//               <div className="filter-section">
//                 <CRow className="g-1 align-items-end">
//                   <CCol xs={12} md={6}>
//                     <CFormLabel htmlFor="customer_id" className="mb-1 small fw-medium">
//                       {t("LABELS.search_projects") || "Select Customer"}
//                     </CFormLabel>
//                     <div className="search-container" style={{ position: 'relative' }}>
//                       <CFormInput
//                         type="text"
//                         id="customer_id"
//                         className="search-input"
//                         placeholder={t("LABELS.enter_project_name") || "Enter customer name"}
//                         value={selectedCustomer.name}
//                         onChange={handleCustomerNameChange}
//                         autoComplete="off"
//                         size="sm"
//                       />
//                       <div className="search-icon"></div>
//                       {customerSuggestions.length > 0 && (
//                         <ul className="suggestions-list">
//                           {customerSuggestions.map((customer) => (
//                             <li
//                               key={customer.id}
//                               onClick={() => handleCustomerSelect(customer)}
//                               onMouseEnter={(e) => (e.target.style.background = '#f5f5f5')}
//                               onMouseLeave={(e) => (e.target.style.background = 'white')}
//                             >
//                               {customer.project_name}
//                             </li>
//                           ))}
//                         </ul>
//                       )}
//                     </div>
//                   </CCol>
//                   <CCol xs={12} md={3}>
                    
//                     <CButton
//                       color="primary"
//                       onClick={handleFilterClick}
//                       disabled={isLoading}
//                       size="sm"
//                       className="w-100 filter-button-mobile"
//                     >
//                       {isLoading ? t("LABELS.loading") || "Loading..." : t("LABELS.filter") || "Filter"}
//                     </CButton>
//                   </CCol>
//                   <CCol xs={12} md={3}>
//                     <div className="total-expense-card text-white p-2 w-100">
//                       <div className="d-flex align-items-center justify-content-start">
//                         <div className="total-expense-icon me-2">₹</div>
//                         <div>
//                           <div className="small opacity-75">
//                             {t("LABELS.total_expenses") || "Total Expenses"}
//                           </div>
//                           <div className="h4 mb-0 fw-bold">
//                             {formatCurrency(totalExpense)}
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </CCol>
//                 </CRow>
//               </div>

//               <CRow className="mb-3">
//                 <CCol xs={12} md={6} lg={4}>
//                   <div className="search-container">
//                     <CFormInput
//                       type="text"
//                       className="search-input"
//                       placeholder="Search expenses..."
//                       value={searchInput}
//                       onChange={handleSearchChange}
//                     />
//                     <div className="search-icon">🔍</div>
//                     {searchInput && (
//                       <button className="clear-search" onClick={clearSearch} title="Clear search">
//                         ✕
//                       </button>
//                     )}
//                   </div>
//                 </CCol>

//                 <CCol xs={12} md={6} lg={3}>
//                   <CFormSelect
//                     value={gstFilter}
//                     onChange={(e) => setGstFilter(e.target.value)}
//                   >
//                     <option value="">Default</option>
//                     <option value="gst">GST</option>
//                     <option value="non-gst">Non-GST</option>
//                   </CFormSelect>
//                 </CCol>

// <CCol xs={12} md={6} lg={3}>
//    <div className="d-flex gap-2 ">
//                 <CButton
//                       color="primary"
//                       onClick={exportToExcel}
//                       disabled={!sortedFilteredExpenses.length}
//                       size="sm"
//                       className="w-100 mb-1 p-2"
//                     >
//                       {/* {t("LABELS.download_excel") || "Download Excel"} */}  Download Excel
//                     </CButton>
//                     <CButton
//                       color="warning"
//                       onClick={exportToPDF}
//                       disabled={!sortedFilteredExpenses.length}
//                       size="sm"
//                       className="w-100 mb-1"
//                     >
//                       {/* {t("LABELS.download_pdf") || "Download PDF"} */}  Download PDF
//                     </CButton>
//                     </div>
//                     </CCol>

//                 {searchTerm && (
//                   <CCol xs={12} className="mt-2">
//                     <small className="text-muted">
//                       {sortedFilteredExpenses.length} expenses found for "{searchTerm}"
//                     </small>
//                   </CCol>
//                 )}
//               </CRow>

//               {isMobile ? (
//                 <div className="mobile-cards-container">
//                   {sortedFilteredExpenses.length === 0 ? (
//                     <div className="text-center text-muted py-4">
//                       {searchTerm ? (
//                         <>
//                           <p>No expenses found for "{searchTerm}"</p>
//                           <CButton color="primary" onClick={clearSearch} size="sm">
//                             Clear Search
//                           </CButton>
//                         </>
//                       ) : selectedCustomer.id ? (
//                         <>
//                           <p>
//                             {t("MSG.no_expenses_found_for_project") ||
//                               "No expenses found for the selected Product."}
//                           </p>
//                           <CButton color="primary" onClick={() => navigate('/expense/new')} size="sm">
//                             {t("LABELS.add_expense") || "Add Expense"}
//                           </CButton>
//                         </>
//                       ) : (
//                         <p>
//                           {t("MSG.select_project_to_view_expenses") ||
//                             "Select a project to view expenses."}
//                         </p>
//                       )}
//                     </div>
//                   ) : (
//                     sortedFilteredExpenses.map(renderMobileCard)
//                   )}

//                   {isFetchingMore && (
//                     <div className="loading-more">
//                       <CSpinner color="primary" size="sm" />
//                       <span className="ms-2 text-muted">
//                         {t("MSG.loading") || "Loading more expenses..."}
//                       </span>
//                     </div>
//                   )}
//                 </div>
//               ) : (
//                 <div
//                   className="table-container"
//                   ref={tableContainerRef}
//                   onScroll={handleScroll}
//                 >
//                   <CTable className="expenses-table">
//                     <CTableHead>
//                       <CTableRow>
//                         <CTableHeaderCell onClick={() => handleSort('sr_no')} style={{ cursor: 'pointer' }}>
//                           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//                             Sr No <span style={getSortIconStyle('sr_no')}>{getSortIcon('sr_no')}</span>
//                           </div>
//                         </CTableHeaderCell>
//                         <CTableHeaderCell onClick={() => handleSort('expense_date')} style={{ cursor: 'pointer' }}>
//                           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//                             Date <span style={getSortIconStyle('expense_date')}>{getSortIcon('expense_date')}</span>
//                           </div>
//                         </CTableHeaderCell>
//                         <CTableHeaderCell onClick={() => handleSort('expense_type')} style={{ cursor: 'pointer' }}>
//                           <div style={{ display: 'flex', alignItems: 'center' }}>
//                             Expense Details <span style={getSortIconStyle('expense_type')}>{getSortIcon('expense_type')}</span>
//                           </div>
//                         </CTableHeaderCell>
//                         <CTableHeaderCell onClick={() => handleSort('total_price')} style={{ cursor: 'pointer' }}>
//                           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//                             Amount <span style={getSortIconStyle('total_price')}>{getSortIcon('total_price')}</span>
//                           </div>
//                         </CTableHeaderCell>
//                         <CTableHeaderCell onClick={() => handleSort('desc')} style={{ cursor: 'pointer' }}>
//                           <div style={{ display: 'flex', alignItems: 'center' }}>
//                             About <span style={getSortIconStyle('desc')}>{getSortIcon('desc')}</span>
//                           </div>
//                         </CTableHeaderCell>
//                         <CTableHeaderCell onClick={() => handleSort('contact')} style={{ cursor: 'pointer' }}>
//                           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//                             Contact <span style={getSortIconStyle('contact')}>{getSortIcon('contact')}</span>
//                           </div>
//                         </CTableHeaderCell>
                        
//                         <CTableHeaderCell onClick={() => handleSort('payment_by')} style={{ cursor: 'pointer' }}>
//                           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//                             Payment By <span style={getSortIconStyle('payment_by')}>{getSortIcon('payment_by')}</span>
//                           </div>
//                         </CTableHeaderCell>
//                         <CTableHeaderCell onClick={() => handleSort('payment_type')} style={{ cursor: 'pointer' }}>
//                           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//                             Payment Type <span style={getSortIconStyle('payment_type')}>{getSortIcon('payment_type')}</span>
//                           </div>
//                         </CTableHeaderCell>
//                         <CTableHeaderCell onClick={() => handleSort('pending_amount')} style={{ cursor: 'pointer' }}>
//                           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//                             Pending Amount <span style={getSortIconStyle('pending_amount')}>{getSortIcon('pending_amount')}</span>
//                           </div>
//                         </CTableHeaderCell>
//                         <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
//                       </CTableRow>
//                     </CTableHead>
//                     <CTableBody>
//                       {sortedFilteredExpenses.length === 0 ? (
//                         <CTableRow>
//                           <CTableDataCell colSpan={10} className="text-center py-4">
//                             {searchTerm ? (
//                               <div className="text-muted">
//                                 <p>No expenses found for "{searchTerm}"</p>
//                                 <CButton color="primary" onClick={clearSearch} size="sm">
//                                   Clear Search
//                                 </CButton>
//                               </div>
//                             ) : selectedCustomer.id ? (
//                               <div className="text-muted">
//                                 <p>
//                                   {t("MSG.no_expenses_found_for_project") ||
//                                     "No expenses found for the selected Product."}
//                                 </p>
//                                 <CButton color="primary" onClick={() => navigate('/expense/new')} size="sm">
//                                   {t("LABELS.add_expense") || "Add Expense"}
//                                 </CButton>
//                               </div>
//                             ) : (
//                               <p className="text-muted">
//                                 {t("MSG.select_project_to_view_expenses") ||
//                                   "Select a project to view expenses."}
//                               </p>
//                             )}
//                           </CTableDataCell>
//                         </CTableRow>
//                       ) : (
//                         sortedFilteredExpenses.map((expense) => (
//                           <CTableRow key={expense.id}>
//                             <CTableDataCell>
//                               <div style={{ fontSize: '0.85em' }}>{expense.sr_no}</div>
//                             </CTableDataCell>
//                             <CTableDataCell>
//                               <div style={{ fontSize: '0.85em' }}>{formatDate(expense.expense_date)}</div>
//                             </CTableDataCell>
//                             <CTableDataCell style={{ textAlign: 'left' }}>
//                               <div style={{ wordBreak: 'break-word' }}>{expense.expense_type?.name || '-'}</div>
//                             </CTableDataCell>
//                             <CTableDataCell>
//                               <span style={{ fontWeight: '500', color: '#dc3545' }}>{formatCurrency(expense.total_price)}</span>
//                             </CTableDataCell>
//                              <CTableDataCell style={{ textAlign: 'left' }}>
//                               <div style={{ wordBreak: 'break-word' }}>{expense.name || '-'}</div>
//                             </CTableDataCell>
//                             <CTableDataCell>
//                               <div style={{ wordBreak: 'break-word' }}>{expense.contact || '-'}</div>
//                             </CTableDataCell>
//                             {/* <CTableDataCell style={{ textAlign: 'left' }}>
//                               <div style={{ wordBreak: 'break-word' }}>{expense.desc || '-'}</div>
//                             </CTableDataCell> */}
//                             <CTableDataCell style={{ textAlign: 'center' }}>
//                               <div style={{ wordBreak: 'break-word' }}>{expense.payment_by || '-'}</div>
//                             </CTableDataCell>
//                             <CTableDataCell>
//                               <div style={{ wordBreak: 'break-word' }}>{expense.payment_type || '-'}</div>
//                             </CTableDataCell>
//                             {/* <CTableDataCell>
//                               <span style={{ fontWeight: '500' }}>{expense.pending_amount ? formatCurrency(expense.pending_amount) : '-'}</span>
//                             </CTableDataCell> */}
//                             <CTableDataCell>
//                               <div className="action-buttons">
//                                 {usertype === 1 ? (
//                                   <>
//                                     <CBadge
//                                       role="button"
//                                       color="primary"
//                                       onClick={() => handleEditExpense(expense)}
//                                       style={{ cursor: 'pointer', fontSize: '0.75em' }}
//                                     >
//                                       Edit
//                                     </CBadge>
//                                     <CBadge
//                                       role="button"
//                                       color="danger"
//                                       onClick={() => handleDeleteClick(expense)}
//                                       style={{ cursor: 'pointer', fontSize: '0.75em' }}
//                                     >
//                                       Delete
//                                     </CBadge>
//                                   </>
//                                 ) : (
//                                   <CBadge
//                                     role="button"
//                                     color="primary"
//                                     onClick={() => handleEditExpense(expense)}
//                                     style={{ cursor: 'pointer', fontSize: '0.75em' }}
//                                   >
//                                     Edit
//                                   </CBadge>
//                                 )}
//                                 {expense.photo_url && (
//                                   <CBadge
//                                     role="button"
//                                     color="secondary"
//                                     onClick={() => handleViewImage(expense)}
//                                     style={{ cursor: 'pointer', fontSize: '0.75em' }}
//                                   >
//                                     {/* {t('LABELS.view') || 'View'} */}
//                                     View
//                                   </CBadge>
//                                 )}
//                               </div>
//                             </CTableDataCell>
//                           </CTableRow>
//                         ))
//                       )}
//                     </CTableBody>
//                   </CTable>
//                   {isFetchingMore && (
//                     <div className="loading-more">
//                       <CSpinner color="primary" size="sm" />
//                       <span className="ms-2 text-muted">{t("MSG.loading") || "Loading more expenses..."}</span>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </CCardBody>
//           </CCard>
//         </CCol>
//       </CRow>
//     </>
//   );
// };

// export default CustomerReport;

import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import {
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
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
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../common/toast/ToastContext';
import { useTranslation } from 'react-i18next';
import { cilTrash } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import { deleteAPICall, getAPICall } from '../../../util/api';
import EditExpense from '../expense/EditExpense';
import ConfirmationModal from '../../common/ConfirmationModal';
import { getUserType } from '../../../util/session';
import * as XLSX from 'xlsx'; // For Excel export
import jsPDF from 'jspdf'; // For PDF export
import 'jspdf-autotable'; // For table in PDF

const CustomerReport = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useTranslation("global");

  const usertype = getUserType();

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  // State management
  const [expenses, setExpenses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [deleteResource, setDeleteResource] = useState();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [totalExpense, setTotalExpense] = useState(0);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMorePages, setHasMorePages] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [customerSuggestions, setCustomerSuggestions] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState({ name: '', id: null });
  const [gstFilter, setGstFilter] = useState('');
  // New state for image modal
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');

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

  // Refs for scroll and debouncing
  const tableContainerRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const scrollTimeoutRef = useRef(null);
  const scrollPositionRef = useRef(0);
  const isInfiniteScrollingRef = useRef(false);
  const customerSearchDebounceRef = useRef(null);

  // Check screen size for mobile responsiveness
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleEditExpense = (expense) => {
    setSelectedExpense(expense);
    setShowEditModal(true);
  };

  const handleExpenseUpdated = (updatedExpense) => {
    fetchExpenses(true); // Triggers full refresh
  };

  // Debounced search implementation for expenses
  const debouncedSearch = useCallback((value) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      setSearchTerm(value);
    }, 300);
  }, []);

  // Debounced search for customers
  const debouncedCustomerSearch = useCallback((value) => {
    if (customerSearchDebounceRef.current) {
      clearTimeout(customerSearchDebounceRef.current);
    }
    customerSearchDebounceRef.current = setTimeout(() => {
      fetchCustomers(value);
    }, 300);
  }, []);

  const fetchCustomers = async (searchQuery = '') => {
    try {
      const url = `/api/projects?searchQuery=${encodeURIComponent(searchQuery)}`;
      const response = await getAPICall(url);
      setCustomerSuggestions(response || []);
    } catch (error) {
      showToast('danger', 'Error fetching customers: ' + error);
    }
  };

  const handleCustomerNameChange = (e) => {
    const value = e.target.value;
    setSelectedCustomer({ name: value, id: null });
    debouncedCustomerSearch(value);
  };

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer({ name: customer.project_name, id: customer.id });
    setCustomerSuggestions([]);
  };

  const sortedFilteredExpenses = useMemo(() => {
    let filtered = expenses.map((expense, index) => ({
      ...expense,
      sr_no: index + 1,
    }));

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((expense) =>
        expense.expense_type?.name?.toLowerCase().includes(searchLower) ||
        expense.expense_date?.toLowerCase().includes(searchLower) ||
        expense.total_price?.toString().includes(searchTerm) ||
        expense.contact?.toLowerCase().includes(searchLower) ||
        expense.desc?.toLowerCase().includes(searchLower) ||
        expense.payment_by?.toLowerCase().includes(searchLower) ||
        expense.payment_type?.toLowerCase().includes(searchLower) ||
        expense.pending_amount?.toString().includes(searchTerm)
      );
    }

    if (gstFilter === 'gst') {
      filtered = filtered.filter((expense) => expense.isGst === 1 || expense.isGst === true);
    } else if (gstFilter === 'non-gst') {
      filtered = filtered.filter((expense) => expense.isGst === 0 || expense.isGst === false);
    }

    if (!sortConfig.key) return filtered;

    return [...filtered].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (sortConfig.key === 'expense_type') {
        aVal = a.expense_type?.name || '';
        bVal = b.expense_type?.name || '';
      }

      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [expenses, searchTerm, sortConfig, gstFilter]);

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
        fetchExpenses(false);
      }
    }, 100);
  }, [hasMorePages, isFetchingMore, isLoading]);

  const fetchExpenses = async (reset = true) => {
    if (!selectedCustomer.id) {
      showToast('warning', t("MSG.please_select_customer") || 'Please select a customer');
      return;
    }

    if (reset) {
      setIsLoading(true);
      isInfiniteScrollingRef.current = false;
    } else {
      setIsFetchingMore(true);
    }

    try {
      const url = `/api/expense?customerId=${selectedCustomer.id}` +
        (nextCursor && !reset ? `&cursor=${nextCursor}` : '');

      const response = await getAPICall(url);

      if (response.error) {
        showToast('danger', response.error);
      } else {
        const newExpenses = reset ? response.data : [...expenses, ...response.data];

        const currentScrollPosition = scrollPositionRef.current;

        setExpenses(newExpenses);
        setTotalExpense(response.totalExpense || 0);
        setNextCursor(response.next_cursor || null);
        setHasMorePages(response.has_more_pages);

        if (isInfiniteScrollingRef.current && !reset) {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              if (tableContainerRef.current) {
                tableContainerRef.current.scrollTop = currentScrollPosition;
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

  const handleDelete = async () => {
    try {
      await deleteAPICall('/api/expense/' + deleteResource.id);
      setDeleteModalVisible(false);

      isInfiniteScrollingRef.current = false;
      scrollPositionRef.current = 0;

      fetchExpenses(true);
      showToast('success', t("MSG.expense_deleted_successfully") || 'Expense deleted successfully');
    } catch (error) {
      showToast('danger', 'Error occurred: ' + error);
    }
  };

  const handleEdit = (expense) => {
    navigate('/expense/edit/' + expense.id);
  };

  const formatIndianNumber = (amount) => {
    const numericAmount = parseFloat(amount) || 0;
    const [integerPart, decimalPart = '00'] = numericAmount.toFixed(2).split('.');
    const lastThree = integerPart.slice(-3);
    const otherNumbers = integerPart.slice(0, -3);
    const formattedInteger =
      otherNumbers.length > 0
        ? otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree
        : lastThree;
    return `${formattedInteger}.${decimalPart}`;
  };

  const formatCurrency = (amt) => `INR ${formatIndianNumber(amt)}`;

  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('en-US', options).replace(',', '');
    const [month, day] = formattedDate.split(' ');
    return `${day} ${month}`;
  };

  const handleFilterClick = () => {
    isInfiniteScrollingRef.current = false;
    scrollPositionRef.current = 0;
    setNextCursor(null);
    fetchExpenses(true);
  };

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

  const handleDeleteClick = (expense) => {
    setDeleteResource(expense);
    setDeleteModalVisible(true);
  };

  const handleViewImage = (expense) => {
    setSelectedImage(expense.photo_url || '');
    setShowImageModal(true);
  };

  
  // Export to Excel
  const exportToExcel = () => {
    const worksheetData = sortedFilteredExpenses.map((expense, index) => ({
      'Sr No': expense.sr_no,
      'Date': formatDate(expense.expense_date),
      'Expense Details': expense.expense_type?.name || '-',
      'Amount': expense.total_price,
      'Contact': expense.contact || '-',
      'Notes': expense.desc || '-',
      'Payment By': expense.payment_by || '-',
      'Payment Type': expense.payment_type || '-',
      'Pending Amount': expense.pending_amount || 0,
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Expenses');
    XLSX.writeFile(workbook, `Project_Expense_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    showToast('success', 'Excel file downloaded successfully!');
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'pt',
      format: 'a4',
    });

    const tableColumn = [
      'Sr No',
      'Date',
      'Expense Details',
      'Amount',
      'Contact',
      'Notes',
      'Payment By',
      'Payment Type',
      'Pending Amount',
    ];

    const tableRows = sortedFilteredExpenses.map((exp) => [
      exp.sr_no,
      formatDate(exp.expense_date),
      exp.expense_type?.name || '-',
      formatCurrency(exp.total_price),
      exp.contact || '-',
      exp.desc || '-',
      exp.payment_by || '-',
      exp.payment_type || '-',
      exp.pending_amount ? formatCurrency(exp.pending_amount) : '-',
    ]);

    doc.setFontSize(14);
    doc.text('Project Expense Report', 40, 40);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 60,
      theme: 'striped',
      styles: {
        fontSize: 8,
        cellPadding: 3,
        overflow: 'linebreak',
        valign: 'middle',
      },
      headStyles: {
        fillColor: [22, 160, 133],
        textColor: 255,
        halign: 'center',
      },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 70 },
        2: { cellWidth: 100 },
        3: { cellWidth: 70 },
        4: { cellWidth: 80 },
        5: { cellWidth: 100 },
        6: { cellWidth: 70 },
        7: { cellWidth: 70 },
        8: { cellWidth: 80 },
      },
      didDrawPage: () => {
        const pageHeight = doc.internal.pageSize.getHeight();
        doc.setFontSize(12);
        doc.text(`Total Amount: ${formatCurrency(totalExpense)}`, 40, pageHeight - 20);
      },
    });

    doc.save(`Project_Expense_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    showToast('success', 'PDF file downloaded successfully!');
  };

  // Fetch customers on component mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      if (customerSearchDebounceRef.current) {
        clearTimeout(customerSearchDebounceRef.current);
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <CSpinner color="primary" size="lg" />
          <p className="mt-3 text-muted">Loading expenses...</p>
        </div>
      </div>
    );
  }

  const renderMobileCard = (expense) => (
    <>
      <style>{expenseCardStyles}</style>

      <CCard key={expense.id} className="mb-3 expense-card">
        <CCardBody>
          <div className="card-row-1">
            <div className="expense-name-section">
              <div className="expense-name">{expense.expense_type?.name || 'N/A'}</div>
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
            <div className="expense-date">
              📅 {formatDate(expense.expense_date)}
            </div>
            <div className="expense-details">
              <span className="detail-item">{expense.contact || '-'}</span>
              <span className="detail-item">{expense.payment_by || '-'}</span>
            </div>
          </div>

          <div className="card-row-2">
            <div className="expense-details">
              <span className="detail-item">{expense.payment_type || '-'}</span>
              <span className="detail-item">{expense.pending_amount ? formatCurrency(expense.pending_amount) : '-'}</span>
            </div>
          </div>

          <div className="card-row-3">
            <div className="expense-details">
              <span className="detail-item">{expense.desc || '-'}</span>
            </div>
          </div>

          <div className="card-row-3">
            <div className="action-buttons-mobile">
              <button
                className="badge bg-primary"
                onClick={() => handleEditExpense(expense)}
                role="button"
              >
                {t('LABELS.edit') || 'Edit'}
              </button>
              <button
                className="badge bg-danger"
                onClick={() => handleDeleteClick(expense)}
                role="button"
              >
                {t('LABELS.delete') || 'Delete'}
              </button>
              {expense.photo_url && expense.photo_url !== null && (
                <button
                  className="badge bg-secondary"
                  onClick={() => handleViewImage(expense)}
                  role="button"
                >
                  View
                </button>
              )}
            </div>
          </div>
        </CCardBody>
      </CCard>
    </>
  );

  const expenseCardStyles = `
    .expense-card {
      border: 1px solid #dee2e6;
      border-radius: 8px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
      overflow: hidden;
      margin-bottom: 12px;
    }

    .expense-card:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }

    .expense-card .card-body {
      padding: 12px !important;
    }

    .expense-card .card-row-1 {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
    }

    .expense-name-section {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .expense-name {
      font-weight: 600;
      font-size: 1em;
      color: #333;
      line-height: 1.1;
    }

    .expense-type {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .category-text {
      color: #666;
      font-size: 0.8em;
    }

    .expense-total {
      text-align: right;
    }

    .total-amount {
      font-weight: 600;
      font-size: 1.1em;
      color: #d32f2f;
      line-height: 1.1;
    }

    .total-label {
      font-size: 0.7em;
      color: #666;
    }

    .expense-card .card-row-2 {
      margin-bottom: 8px;
      padding: 4px 0;
      border-top: 1px solid #f0f0f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .expense-date {
      color: #666;
      font-size: 0.85em;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .expense-details {
      display: flex;
      gap: 24px;
    }

    .detail-item {
      color: #333;
      font-size: 0.85em;
      font-weight: 500;
    }

    .expense-card .card-row-3 {
      padding: 6px 0;
      border-top: 1px solid #f0f0f0;
    }

    .expense-card .action-buttons-mobile {
      display: flex;
      gap: 8px;
      justify-content: flex-start;
      width: 100%;
    }

    .expense-card .action-buttons-mobile .badge {
      font-size: 0.85em;
      padding: 8px 8px;
      border-radius: 16px;
      cursor: pointer;
      transition: all 0.2s ease;
      border: 1px solid transparent;
      text-align: center;
      min-height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 500;
      width: 100%;
    }

    .expense-card .action-buttons-mobile .badge:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .expense-card .action-buttons-mobile .badge.bg-danger {
      background-color: #dc3545 !important;
      border-color: #dc3545;
      color: white !important;
    }

    .suggestions-list {
      position: absolute;
      z-index: 1000;
      background: white;
      border: 1px solid #ccc;
      list-style: none;
      padding: 0;
      max-height: 200px;
      overflow-y: auto;
      width: 100%;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .suggestions-list li {
      padding: 8px;
      cursor: pointer;
      border-bottom: 1px solid #eee;
    }

    .suggestions-list li:hover {
      background: #f5f5f5;
    }

    @media (max-width: 576px) {
      .expense-name {
        font-size: 0.95em;
      }

      .expense-card .card-body {
        padding: 10px !important;
      }

      .expense-card .action-buttons-mobile .badge {
        font-size: 0.8em;
        padding: 6px 12px;
        min-height: 32px;
      }
    }
  `;

  return (
    <>
      <style jsx global>{`
        .table-container {
          height: 350px;
          overflow-y: auto;
          border: 1px solid #dee2e6;
          border-radius: 0.375rem;
          position: relative;
        }

        @media (max-width: 768px) {
          .table-container {
            height: 400px;
            overflow-x: auto;
            overflow-y: auto;
          }
        }

        .expenses-table {
          width: 100%;
          table-layout: fixed;
          margin-bottom: 0;
        }

        .expenses-table thead th {
          position: sticky;
          top: 0;
          z-index: 10;
          background-color: #f8f9fa;
          border-bottom: 2px solid #dee2e6;
          box-shadow: 0 2px 2px -1px rgba(0, 0, 0, 0.1);
        }

        .expenses-table th,
        .expenses-table td {
          text-align: center;
          vertical-align: middle;
          padding: 8px 4px;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }

        .expenses-table th:nth-child(1) { width: 8%; }
        .expenses-table th:nth-child(2) { width: 12%; }
        .expenses-table th:nth-child(3) { width: 15%; text-align: left; }
        .expenses-table th:nth-child(4) { width: 12%; }
        .expenses-table th:nth-child(5) { width: 12%; }
        .expenses-table th:nth-child(6) { width: 15%; text-align: left; }
        .expenses-table th:nth-child(7) { width: 12%; }
        .expenses-table th:nth-child(8) { width: 12%; }
        .expenses-table th:nth-child(9) { width: 12%; }
        .expenses-table th:nth-child(10) { width: 12%; }

        .expenses-table td:nth-child(1) { width: 8%; }
        .expenses-table td:nth-child(2) { width: 12%; }
        .expenses-table td:nth-child(3) { width: 15%; text-align: left; }
        .expenses-table td:nth-child(4) { width: 12%; }
        .expenses-table td:nth-child(5) { width: 12%; }
        .expenses-table td:nth-child(6) { width: 15%; text-align: left; }
        .expenses-table td:nth-child(7) { width: 12%; }
        .expenses-table td:nth-child(8) { width: 12%; }
        .expenses-table td:nth-child(9) { width: 12%; }
        .expenses-table td:nth-child(10) { width: 12%; }

        .search-container {
          position: relative;
          width: 100%;
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

        .filter-button-mobile {
          margin-top: 0;
        }

        @media (max-width: 768px) {
          .filter-button-mobile {
            margin-top: 5px;
          }
        }

        .action-buttons {
          display: flex;
          gap: 4px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .loading-more {
          position: sticky;
          bottom: 0;
          background: #f8f9fa;
          border-top: 1px solid #dee2e6;
          padding: 10px;
          text-align: center;
          z-index: 5;
        }

        .total-expense-card {
          background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
          border: none;
          border-radius: 12px;
          box-shadow: 0 4px 8px rgba(220, 53, 69, 0.2);
        }

        .total-expense-icon {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: bold;
          color: white;
        }

        .filter-section {
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          padding: 5px;
          margin-bottom: 5px;
        }

        @media (max-width: 768px) {
          .expenses-table {
            min-width: 950px;
            table-layout: fixed;
          }

          .expenses-table th,
          .expenses-table td {
            white-space: nowrap;
            padding: 8px 6px;
            border-right: 1px solid #dee2e6;
            font-size: 13px;
          }

          .expenses-table th:nth-child(1),
          .expenses-table td:nth-child(1) {
            width: 80px;
            min-width: 80px;
          }

          .expenses-table th:nth-child(2),
          .expenses-table td:nth-child(2) {
            width: 120px;
            min-width: 120px;
          }

          .expenses-table th:nth-child(3),
          .expenses-table td:nth-child(3) {
            width: 160px;
            min-width: 160px;
          }

          .expenses-table th:nth-child(4),
          .expenses-table td:nth-child(4) {
            width: 120px;
            min-width: 120px;
          }

          .expenses-table th:nth-child(5),
          .expenses-table td:nth-child(5) {
            width: 120px;
            min-width: 120px;
          }

          .expenses-table th:nth-child(6),
          .expenses-table td:nth-child(6) {
            width: 160px;
            min-width: 160px;
          }

          .expenses-table th:nth-child(7),
          .expenses-table td:nth-child(7) {
            width: 120px;
            min-width: 120px;
          }

          .expenses-table th:nth-child(8),
          .expenses-table td:nth-child(8) {
            width: 120px;
            min-width: 120px;
          }

          .expenses-table th:nth-child(9),
          .expenses-table td:nth-child(9) {
            width: 120px;
            min-width: 120px;
          }

          .action-buttons {
            flex-direction: row;
            gap: 2px;
          }

          .action-buttons .badge {
            font-size: 10px;
            padding: 2px 6px;
          }

          .filter-section {
            padding: 15px;
          }

          .total-expense-card {
            margin-top: 0.3rem;
          }
        }

        @media (max-width: 576px) {
          .expenses-table {
            font-size: 12px;
            min-width: 900px;
          }

          .expenses-table th,
          .expenses-table td {
            padding: 6px 4px;
          }

          .action-buttons .badge {
            font-size: 9px;
            padding: 2px 4px;
          }

          .filter-section {
            padding: 5px;
          }

          .expenses-table {
            display: none !important;
          }
        }
      `}</style>

      <EditExpense
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        expense={selectedExpense}
        onExpenseUpdated={handleExpenseUpdated}
      />

      {/* <CModal visible={showImageModal} onClose={() => setShowImageModal(false)}>
        <CModalHeader>
          <CModalTitle>View Image</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedImage ? (
            <img
              src={`/bill/bill/${selectedImage.split('/').pop()}`}
              alt="Expense"
              style={{ maxWidth: '100%', maxHeight: '70vh' }}
              onError={(e) => {
                e.target.onerror = null; // Prevent infinite loop
                e.target.replaceWith(
                  document.createElement("div")
                ).innerHTML = "<p style='color:red;text-align:center;'>Image not available</p>";
              }}
            />
          ) : (
            <p style={{ color: 'red', textAlign: 'center' }}>Image not available</p>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowImageModal(false)}>
            {t('LABELS.close') || 'Close'}
          </CButton>
        </CModalFooter>
      </CModal> */}
      <CModal visible={showImageModal} onClose={() => setShowImageModal(false)}>
  <CModalHeader>
    <CModalTitle>View File</CModalTitle>
  </CModalHeader>

  <CModalBody>
    {selectedImage ? (
      (() => {
        const fileName = selectedImage.split('/').pop();
        const fileUrl = `/bill/bill/${fileName}`;
        const fileExtension = fileName.split('.').pop().toLowerCase();

        // ✅ If file is a PDF — show it in an iframe
        if (fileExtension === 'pdf') {
          return (
            <iframe
              src={fileUrl}
              title="PDF Preview"
              style={{
                width: '100%',
                height: '70vh',
                border: 'none',
              }}
            />
          );
        }

        // ✅ If file is an image — show it in an img tag
        if (['jpg', 'jpeg', 'png'].includes(fileExtension)) {
          return (
            <img
              src={fileUrl}
              alt="Expense"
              style={{ maxWidth: '100%', maxHeight: '70vh', display: 'block', margin: 'auto' }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.replaceWith(
                  Object.assign(document.createElement("div"), {
                    innerHTML: "<p style='color:red;text-align:center;'>Image not available</p>"
                  })
                );
              }}
            />
          );
        }

        // ✅ If file type is unsupported
        return <p style={{ color: 'red', textAlign: 'center' }}>Unsupported file type</p>;
      })()
    ) : (
      <p style={{ color: 'red', textAlign: 'center' }}>File not available</p>
    )}
  </CModalBody>

  <CModalFooter>
    <CButton color="secondary" onClick={() => setShowImageModal(false)}>
      {t('LABELS.close') || 'Close'}
    </CButton>
  </CModalFooter>
</CModal>


      <CRow>
        <ConfirmationModal
          visible={deleteModalVisible}
          setVisible={setDeleteModalVisible}
          onYes={handleDelete}
          resource={`Delete expense - ${deleteResource?.name}`}
        />

        <CCol xs={12}>
          <CCard>
            <CCardHeader>
              <strong>{t("LABELS.project_expenses") || "Projects Expenses"}</strong>
              <span className="ms-2 text-muted">
                {t("LABELS.total")} {sortedFilteredExpenses.length} expenses
              </span>
            </CCardHeader>
            <CCardBody>
              <div className="filter-section">
                <CRow className="g-1 align-items-end">
                  <CCol xs={12} md={6}>
                    <CFormLabel htmlFor="customer_id" className="mb-1 small fw-medium">
                      {t("LABELS.search_projects") || "Select Customer"}
                    </CFormLabel>
                    <div className="search-container" style={{ position: 'relative' }}>
                      <CFormInput
                        type="text"
                        id="customer_id"
                        className="search-input"
                        placeholder={t("LABELS.enter_project_name") || "Enter customer name"}
                        value={selectedCustomer.name}
                        onChange={handleCustomerNameChange}
                        autoComplete="off"
                        size="sm"
                      />
                      <div className="search-icon"></div>
                      {customerSuggestions.length > 0 && (
                        <ul className="suggestions-list">
                          {customerSuggestions.map((customer) => (
                            <li
                              key={customer.id}
                              onClick={() => handleCustomerSelect(customer)}
                              onMouseEnter={(e) => (e.target.style.background = '#f5f5f5')}
                              onMouseLeave={(e) => (e.target.style.background = 'white')}
                            >
                              {customer.project_name}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </CCol>
                  <CCol xs={12} md={3}>
                    <CButton
                      color="primary"
                      onClick={handleFilterClick}
                      disabled={isLoading}
                      size="sm"
                      className="w-100 filter-button-mobile"
                    >
                      {isLoading ? t("LABELS.loading") || "Loading..." : t("LABELS.filter") || "Filter"}
                    </CButton>
                  </CCol>
                  <CCol xs={12} md={3}>
                    <div className="total-expense-card text-white p-2 w-100">
                      <div className="d-flex align-items-center justify-content-start">
                        <div className="total-expense-icon me-2">₹</div>
                        <div>
                          <div className="small opacity-75">
                            {t("LABELS.total_expenses") || "Total Expenses"}
                          </div>
                          <div className="h4 mb-0 fw-bold">
                            {formatCurrency(totalExpense)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CCol>
                </CRow>
              </div>

              <CRow className="mb-3">
                <CCol xs={12} md={6} lg={4}>
                  <div className="search-container">
                    <CFormInput
                      type="text"
                      className="search-input"
                      placeholder="Search expenses..."
                      value={searchInput}
                      onChange={handleSearchChange}
                    />
                    <div className="search-icon">🔍</div>
                    {searchInput && (
                      <button className="clear-search" onClick={clearSearch} title="Clear search">
                        ✕
                      </button>
                    )}
                  </div>
                </CCol>

                <CCol xs={12} md={6} lg={3}>
                  <CFormSelect
                    value={gstFilter}
                    onChange={(e) => setGstFilter(e.target.value)}
                  >
                    <option value="">Default</option>
                    <option value="gst">GST</option>
                    <option value="non-gst">Non-GST</option>
                  </CFormSelect>
                </CCol>

                <CCol xs={12} md={6} lg={3}>
                  <div className="d-flex gap-2 ">
                    <CButton
                      color="primary"
                      onClick={exportToExcel}
                      disabled={!sortedFilteredExpenses.length}
                      size="sm"
                      className="w-100 mb-1 p-2"
                    >
                      Download Excel
                    </CButton>
                    <CButton
                      color="warning"
                      onClick={exportToPDF}
                      disabled={!sortedFilteredExpenses.length}
                      size="sm"
                      className="w-100 mb-1"
                    >
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
                      {searchTerm ? (
                        <>
                          <p>No expenses found for "{searchTerm}"</p>
                          <CButton color="primary" onClick={clearSearch} size="sm">
                            Clear Search
                          </CButton>
                        </>
                      ) : selectedCustomer.id ? (
                        <>
                          <p>
                            {t("MSG.no_expenses_found_for_project") ||
                              "No expenses found for the selected Product."}
                          </p>
                          <CButton color="primary" onClick={() => navigate('/expense/new')} size="sm">
                            {t("LABELS.add_expense") || "Add Expense"}
                          </CButton>
                        </>
                      ) : (
                        <p>
                          {t("MSG.select_project_to_view_expenses") ||
                            "Select a project to view expenses."}
                        </p>
                      )}
                    </div>
                  ) : (
                    sortedFilteredExpenses.map(renderMobileCard)
                  )}

                  {isFetchingMore && (
                    <div className="loading-more">
                      <CSpinner color="primary" size="sm" />
                      <span className="ms-2 text-muted">
                        {t("MSG.loading") || "Loading more expenses..."}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className="table-container"
                  ref={tableContainerRef}
                  onScroll={handleScroll}
                >
                  <CTable className="expenses-table">
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell onClick={() => handleSort('sr_no')} style={{ cursor: 'pointer' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            Sr No <span style={getSortIconStyle('sr_no')}>{getSortIcon('sr_no')}</span>
                          </div>
                        </CTableHeaderCell>
                        <CTableHeaderCell onClick={() => handleSort('expense_date')} style={{ cursor: 'pointer' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            Date <span style={getSortIconStyle('expense_date')}>{getSortIcon('expense_date')}</span>
                          </div>
                        </CTableHeaderCell>
                        <CTableHeaderCell onClick={() => handleSort('expense_type')} style={{ cursor: 'pointer' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            Expense Details <span style={getSortIconStyle('expense_type')}>{getSortIcon('expense_type')}</span>
                          </div>
                        </CTableHeaderCell>
                        <CTableHeaderCell onClick={() => handleSort('total_price')} style={{ cursor: 'pointer' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            Amount <span style={getSortIconStyle('total_price')}>{getSortIcon('total_price')}</span>
                          </div>
                        </CTableHeaderCell>
                        <CTableHeaderCell onClick={() => handleSort('contact')} style={{ cursor: 'pointer' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            About <span style={getSortIconStyle('contact')}>{getSortIcon('contact')}</span>
                          </div>
                        </CTableHeaderCell>
                        <CTableHeaderCell onClick={() => handleSort('contact')} style={{ cursor: 'pointer' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            Contact <span style={getSortIconStyle('contact')}>{getSortIcon('contact')}</span>
                          </div>
                        </CTableHeaderCell>
                        <CTableHeaderCell onClick={() => handleSort('payment_by')} style={{ cursor: 'pointer' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            Payment By <span style={getSortIconStyle('payment_by')}>{getSortIcon('payment_by')}</span>
                          </div>
                        </CTableHeaderCell>
                        <CTableHeaderCell onClick={() => handleSort('payment_type')} style={{ cursor: 'pointer' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            Payment Type <span style={getSortIconStyle('payment_type')}>{getSortIcon('payment_type')}</span>
                          </div>
                        </CTableHeaderCell>
                        <CTableHeaderCell onClick={() => handleSort('pending_amount')} style={{ cursor: 'pointer' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            Pending Amount <span style={getSortIconStyle('pending_amount')}>{getSortIcon('pending_amount')}</span>
                          </div>
                        </CTableHeaderCell>
                        <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {sortedFilteredExpenses.length === 0 ? (
                        <CTableRow>
                          <CTableDataCell colSpan={10} className="text-center py-4">
                            {searchTerm ? (
                              <div className="text-muted">
                                <p>No expenses found for "{searchTerm}"</p>
                                <CButton color="primary" onClick={clearSearch} size="sm">
                                  Clear Search
                                </CButton>
                              </div>
                            ) : selectedCustomer.id ? (
                              <div className="text-muted">
                                <p>
                                  {t("MSG.no_expenses_found_for_project") ||
                                    "No expenses found for the selected Product."}
                                </p>
                                <CButton color="primary" onClick={() => navigate('/expense/new')} size="sm">
                                  {t("LABELS.add_expense") || "Add Expense"}
                                </CButton>
                              </div>
                            ) : (
                              <p className="text-muted">
                                {t("MSG.select_project_to_view_expenses") ||
                                  "Select a project to view expenses."}
                              </p>
                            )}
                          </CTableDataCell>
                        </CTableRow>
                      ) : (
                        sortedFilteredExpenses.map((expense) => (
                          <CTableRow key={expense.id}>
                            <CTableDataCell>
                              <div style={{ fontSize: '0.85em' }}>{expense.sr_no}</div>
                            </CTableDataCell>
                            <CTableDataCell>
                              <div style={{ fontSize: '0.85em' }}>{formatDate(expense.expense_date)}</div>
                            </CTableDataCell>
                            <CTableDataCell style={{ textAlign: 'left' }}>
                              <div style={{ wordBreak: 'break-word' }}>{expense.expense_type?.name || '-'}</div>
                            </CTableDataCell>
                            <CTableDataCell>
                              <span style={{ fontWeight: '500', color: '#dc3545' }}>{formatCurrency(expense.total_price)}</span>
                            </CTableDataCell>
                            <CTableDataCell>
                              <div style={{ wordBreak: 'break-word' }}>{expense.name || '-'}</div>
                            </CTableDataCell>
                            <CTableDataCell>
                              <div style={{ wordBreak: 'break-word' }}>{expense.contact || '-'}</div>
                            </CTableDataCell>
                            <CTableDataCell style={{ textAlign: 'center' }}>
                              <div style={{ wordBreak: 'break-word' }}>{expense.payment_by || '-'}</div>
                            </CTableDataCell>
                            <CTableDataCell>
                              <div style={{ wordBreak: 'break-word' }}>{expense.payment_type || '-'}</div>
                            </CTableDataCell>
                            <CTableDataCell>
                              <span style={{ fontWeight: '500' }}>{expense.pending_amount ? formatCurrency(expense.pending_amount) : '-'}</span>
                            </CTableDataCell>
                            <CTableDataCell>
                              <div className="action-buttons">
                                {usertype === 1 ? (
                                  <>
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
                                      onClick={() => handleDeleteClick(expense)}
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
                                {expense?.photo_url && expense?.photo_url !== "NA" && (
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
                  {isFetchingMore && (
                    <div className="loading-more">
                      <CSpinner color="primary" size="sm" />
                      <span className="ms-2 text-muted">{t("MSG.loading") || "Loading more expenses..."}</span>
                    </div>
                  )}
                </div>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  );
};

export default CustomerReport;