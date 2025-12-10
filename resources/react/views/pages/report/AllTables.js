import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
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
  CTableRow,
  CSpinner
} from '@coreui/react';
import { useTranslation } from 'react-i18next';

function All_Tables({
  selectedOption,
  salesData,
  expenseData,
  pnlData,
  expenseType,
  productWiseData,
  onLoadMore,
  hasMorePages,
  isFetchingMore,
  scrollCursor
}) {
  const { t } = useTranslation('global');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const tableContainerRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const scrollTimeoutRef = useRef(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Check screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.warn('Invalid date format:', dateString);
        return dateString;
      }
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const day = date.getDate().toString().padStart(2, '0');
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      return isMobile ? `${day}/${date.getMonth() + 1}/${year.toString().slice(-2)}` : `${day} ${month} ${year}`;
    } catch (error) {
      console.warn('Date formatting error:', error, 'for date:', dateString);
      return dateString;
    }
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '₹0';
    const number = Number(amount);
    if (isMobile && number >= 1000) {
      if (number >= 10000000) return `₹${(number / 10000000).toFixed(1)}Cr`;
      if (number >= 100000) return `₹${(number / 100000).toFixed(1)}L`;
      if (number >= 1000) return `₹${(number / 1000).toFixed(1)}K`;
    }
    return `₹${number.toLocaleString()}`;
  };

  const formatQuantity = (qty) => {
    const number = Number(qty);
    if (isMobile && number >= 1000) {
      if (number >= 1000000) return `${(number / 1000000).toFixed(1)}M`;
      if (number >= 1000) return `${(number / 1000).toFixed(1)}K`;
    }
    return number.toLocaleString();
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const debouncedSearch = useCallback((value) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      setSearchTerm(value);
    }, 300);
  }, []);

  const handleScroll = useCallback(() => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      const container = tableContainerRef.current;
      if (!container) return;
      const { scrollTop, scrollHeight, clientHeight } = container;
      const threshold = 100;
      if (
        scrollTop + clientHeight >= scrollHeight - threshold &&
        hasMorePages &&
        !isFetchingMore &&
        onLoadMore
      ) {
        onLoadMore();
      }
    }, 100);
  }, [hasMorePages, isFetchingMore, onLoadMore]);

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

  const parseDate = (dateString) => {
    if (!dateString) return new Date(0);
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? new Date(0) : date;
  };

  const getCurrentData = () => {
    let data = [];
    switch (selectedOption) {
      case '1':
        data = salesData?.data || [];
        console.log('Income Report Data:', data);
        return [...data].sort((b, a) => parseDate(a.date) - parseDate(b.date));
      case '2':
        data = expenseData?.data || [];
        return [...data].sort((b, a) => parseDate(a.expenseDate) - parseDate(b.expenseDate));
      case '3':
        data = pnlData?.Data || [];
        return [...data].sort((b, a) => parseDate(a.date) - parseDate(b.date));
      case '4':
        if (Array.isArray(productWiseData)) {
          return productWiseData;
        } else if (productWiseData?.data && Array.isArray(productWiseData.data)) {
          return productWiseData.data;
        }
        return [];
      default:
        return [];
    }
  };

  const filteredData = useMemo(() => {
    let data = getCurrentData();
    if (!data || !Array.isArray(data)) {
      console.warn('No valid data for filtering:', data);
      return [];
    }

    if (searchTerm.trim()) {
      data = data.filter(item => {
        switch (selectedOption) {
          case '1':
            return (
              (item.date && formatDate(item.date).toLowerCase().includes(searchTerm.toLowerCase())) ||
              (item.projectName && item.projectName.toLowerCase().includes(searchTerm.toLowerCase())) ||
              (item.totalIncomeAmount && item.totalIncomeAmount.toString().includes(searchTerm))
            );
          case '2':
            return (
              (item.expenseDate && formatDate(item.expenseDate).toLowerCase().includes(searchTerm.toLowerCase())) ||
              (item.projectName && item.projectName.toLowerCase().includes(searchTerm.toLowerCase())) ||
              (item.totalExpense && item.totalExpense.toString().includes(searchTerm))
            );
          case '3':
            return (
              (item.date && formatDate(item.date).toLowerCase().includes(searchTerm.toLowerCase())) ||
              (item.projectName && item.projectName.toLowerCase().includes(searchTerm.toLowerCase())) ||
              (item.totalIncome && item.totalIncome.toString().includes(searchTerm)) ||
              (item.totalExpenses && item.totalExpenses.toString().includes(searchTerm)) ||
              (item.profitLoss && item.profitLoss.toString().includes(searchTerm))
            );
          case '4':
            return (
              (item.projectName && item.projectName.toLowerCase().includes(searchTerm.toLowerCase())) ||
              (item.product_name && item.product_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
              (item.dPrice && item.dPrice.toString().includes(searchTerm)) ||
              (item.totalQty && item.totalQty.toString().includes(searchTerm)) ||
              (item.totalRevenue && item.totalRevenue.toString().includes(searchTerm))
            );
          default:
            return true;
        }
      });
    }

    if (sortConfig.key) {
      data = [...data].sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        if (['date', 'expenseDate'].includes(sortConfig.key)) {
          aVal = parseDate(aVal);
          bVal = parseDate(bVal);
        }

        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return sortConfig.direction === 'asc' ? -1 : 1;
        if (bVal == null) return sortConfig.direction === 'asc' ? 1 : -1;

        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
        }

        return sortConfig.direction === 'asc'
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal));
      });
    }

    console.log('Filtered Data:', data);
    return data;
  }, [getCurrentData, searchTerm, sortConfig, selectedOption, isMobile]);

  const getEmptyMessage = () => {
    if (searchTerm) {
      return t('LABELS.no_results_found') || 'No results found for your search';
    }
    switch (selectedOption) {
      case '1':
        return t('MSG.no_income_data') || 'No income data available';
      case '2':
        return t('MSG.no_expense_data') || 'No expense data available';
      case '3':
        return t('MSG.no_pnl_data') || 'No profit/loss data available';
      case '4':
        return t('MSG.no_product_data') || 'No product data available';
      default:
        return 'No data available';
    }
  };

  const getSearchPlaceholder = () => {
    switch (selectedOption) {
      case '1':
        return t('LABELS.search_income_logs') || 'Search income data...';
      case '2':
        return t('LABELS.search_expenses') || 'Search expense data...';
      case '3':
        return t('LABELS.search_pnl') || 'Search profit & loss data...';
      case '4':
        return t('LABELS.search_products') || 'Search product data...';
      default:
        return t('LABELS.search_data') || 'Search data...';
    }
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

  const renderTableHeaders = () => {
    const getSortIcon = (columnKey) => {
      if (sortConfig.key === columnKey) {
        return sortConfig.direction === 'asc' ? '↑' : '↓';
      }
      return '↕';
    };

    const getSortIconStyle = (columnKey) => ({
      marginLeft: isMobile ? '4px' : '8px',
      fontSize: isMobile ? '14px' : '18px',
      opacity: sortConfig.key === columnKey ? 1 : 0.5,
      color: sortConfig.key === columnKey ? '#0d6efd' : '#6c757d'
    });

    const headerStyle = { cursor: 'pointer', fontSize: isMobile ? '0.75rem' : '0.875rem' };

    switch (selectedOption) {
      case '1':
        return (
          <>
            <CTableHeaderCell onClick={() => handleSort('projectName')} style={headerStyle}>
              {isMobile ? 'Project' : (t('LABELS.project_name') || 'Project Name')}
              <span style={getSortIconStyle('projectName')}>{getSortIcon('projectName')}</span>
            </CTableHeaderCell>
            <CTableHeaderCell onClick={() => handleSort('date')} style={headerStyle}>
              {t('LABELS.date') || 'Date'}
              <span style={getSortIconStyle('date')}>{getSortIcon('date')}</span>
            </CTableHeaderCell>
            <CTableHeaderCell onClick={() => handleSort('totalIncomeAmount')} style={headerStyle}>
              {isMobile ? 'Amount' : 'Total Income Amount'}
              <span style={getSortIconStyle('totalIncomeAmount')}>{getSortIcon('totalIncomeAmount')}</span>
            </CTableHeaderCell>
          </>
        );
      case '2':
        return (
          <>
            <CTableHeaderCell onClick={() => handleSort('projectName')} style={headerStyle}>
              {isMobile ? 'Project' : (t('LABELS.project_name') || 'Project Name')}
              <span style={getSortIconStyle('projectName')}>{getSortIcon('projectName')}</span>
            </CTableHeaderCell>
            <CTableHeaderCell onClick={() => handleSort('expenseDate')} style={headerStyle}>
              {t('LABELS.expense_date') || 'Date'}
              <span style={getSortIconStyle('expenseDate')}>{getSortIcon('expenseDate')}</span>
            </CTableHeaderCell>
            <CTableHeaderCell onClick={() => handleSort('totalExpense')} style={headerStyle}>
              {isMobile ? 'Expense' : (t('LABELS.total_expense') || 'Total Expense')}
              <span style={getSortIconStyle('totalExpense')}>{getSortIcon('totalExpense')}</span>
            </CTableHeaderCell>
          </>
        );
      case '3':
        return (
          <>
            <CTableHeaderCell onClick={() => handleSort('projectName')} style={headerStyle}>
              {isMobile ? 'Project' : (t('LABELS.project_name') || 'Project Name')}
              <span style={getSortIconStyle('projectName')}>{getSortIcon('projectName')}</span>
            </CTableHeaderCell>
            <CTableHeaderCell onClick={() => handleSort('date')} style={headerStyle}>
              {t('LABELS.date') || 'Date'}
              <span style={getSortIconStyle('date')}>{getSortIcon('date')}</span>
            </CTableHeaderCell>
            <CTableHeaderCell onClick={() => handleSort('totalIncome')} style={headerStyle}>
              {isMobile ? 'Income' : (t('LABELS.income_grand_total') || 'Income Total')}
              <span style={getSortIconStyle('totalIncome')}>{getSortIcon('totalIncome')}</span>
            </CTableHeaderCell>
            <CTableHeaderCell onClick={() => handleSort('totalExpenses')} style={headerStyle}>
              {isMobile ? 'Expenses' : (t('LABELS.total_expenses') || 'Total Expenses')}
              <span style={getSortIconStyle('totalExpenses')}>{getSortIcon('totalExpenses')}</span>
            </CTableHeaderCell>
            <CTableHeaderCell onClick={() => handleSort('profitLoss')} style={headerStyle}>
              {isMobile ? 'P/L' : (t('LABELS.profit_loss') || 'Profit/Loss')}
              <span style={getSortIconStyle('profitLoss')}>{getSortIcon('profitLoss')}</span>
            </CTableHeaderCell>
          </>
        );
      case '4':
        return (
          <>
            <CTableHeaderCell onClick={() => handleSort('projectName')} style={headerStyle}>
              {isMobile ? 'Project' : (t('LABELS.project_name') || 'Project Name')}
              <span style={getSortIconStyle('projectName')}>{getSortIcon('projectName')}</span>
            </CTableHeaderCell>
            <CTableHeaderCell onClick={() => handleSort('product_name')} style={headerStyle}>
              {isMobile ? 'Product' : (t('LABELS.product_name') || 'Product Name')}
              <span style={getSortIconStyle('product_name')}>{getSortIcon('product_name')}</span>
            </CTableHeaderCell>
            <CTableHeaderCell onClick={() => handleSort('dPrice')} style={headerStyle}>
              {isMobile ? 'Price' : (t('LABELS.unit_price') || 'Unit Price')}
              <span style={getSortIconStyle('dPrice')}>{getSortIcon('dPrice')}</span>
            </CTableHeaderCell>
            <CTableHeaderCell onClick={() => handleSort('totalQty')} style={headerStyle}>
              {isMobile ? 'Qty' : (t('LABELS.quantity') || 'Quantity')}
              <span style={getSortIconStyle('totalQty')}>{getSortIcon('totalQty')}</span>
            </CTableHeaderCell>
            <CTableHeaderCell onClick={() => handleSort('totalRevenue')} style={headerStyle}>
              {isMobile ? 'Revenue' : (t('LABELS.total_revenue') || 'Total Revenue')}
              <span style={getSortIconStyle('totalRevenue')}>{getSortIcon('totalRevenue')}</span>
            </CTableHeaderCell>
          </>
        );
      default:
        return null;
    }
  };

  const renderTableRows = () => {
    const data = filteredData;
    if (data.length === 0) {
      const colSpan = selectedOption === '1' || selectedOption === '2' ? 3 : 5;
      return (
        <CTableRow>
          <CTableDataCell colSpan={colSpan} className="text-center empty-message">
            {getEmptyMessage()}
          </CTableDataCell>
        </CTableRow>
      );
    }

    return data.map((item, index) => (
      <CTableRow key={index} className="data-row">
        {selectedOption === '1' && (
          <>
            <CTableDataCell className="project-cell">
              <div className="cell-wrapper">
                <span className="truncate-text" title={item.projectName}>
                  {item.projectName || '-'}
                </span>
              </div>
            </CTableDataCell>
            <CTableDataCell className="date-cell">
              {formatDate(item.date)}
            </CTableDataCell>
            <CTableDataCell className="amount-cell">
              <span className="amount-value">
                {formatCurrency(item.totalIncomeAmount)}
              </span>
            </CTableDataCell>
          </>
        )}
        {selectedOption === '2' && (
          <>
            <CTableDataCell className="project-cell">
              <div className="cell-wrapper">
                <span className="truncate-text" title={item.projectName}>
                  {item.projectName || '-'}
                </span>
              </div>
            </CTableDataCell>
            <CTableDataCell className="date-cell">
              {formatDate(item.expenseDate)}
            </CTableDataCell>
            <CTableDataCell className="amount-cell">
              <span className="amount-value">
                {formatCurrency(item.totalExpense)}
              </span>
            </CTableDataCell>
          </>
        )}
        {selectedOption === '3' && (
          <>
            <CTableDataCell className="project-cell">
              <div className="cell-wrapper">
                <span className="truncate-text" title={item.projectName}>
                  {item.projectName || '-'}
                </span>
              </div>
            </CTableDataCell>
            <CTableDataCell className="date-cell">
              {formatDate(item.date)}
            </CTableDataCell>
            <CTableDataCell className="amount-cell">
              <span className="amount-value">
                {formatCurrency(item.totalIncome)}
              </span>
            </CTableDataCell>
            <CTableDataCell className="amount-cell">
              <span className="amount-value">
                {formatCurrency(item.totalExpenses)}
              </span>
            </CTableDataCell>
            <CTableDataCell className={`amount-cell ${item.profitLoss >= 0 ? 'profit-cell' : 'loss-cell'}`}>
              <span className="amount-value">
                {formatCurrency(item.profitLoss)}
              </span>
            </CTableDataCell>
          </>
        )}
        {selectedOption === '4' && (
          <>
            <CTableDataCell className="project-cell">
              <div className="cell-wrapper">
                <span className="truncate-text" title={item.projectName}>
                  {item.projectName || '-'}
                </span>
              </div>
            </CTableDataCell>
            <CTableDataCell className="product-cell">
              <div className="cell-wrapper">
                <span className="truncate-text" title={item.product_name}>
                  {item.product_name || '-'}
                </span>
              </div>
            </CTableDataCell>
            <CTableDataCell className="amount-cell">
              <span className="amount-value">
                {formatCurrency(item.dPrice)}
              </span>
            </CTableDataCell>
            <CTableDataCell className="quantity-cell">
              {formatQuantity(item.totalQty)}
            </CTableDataCell>
            <CTableDataCell className="amount-cell">
              <span className="amount-value revenue">
                {formatCurrency(item.totalRevenue)}
              </span>
            </CTableDataCell>
          </>
        )}
      </CTableRow>
    ));
  };

  return (
    <>
      <style jsx>{`
        .reports-table {
          width: 100%;
          min-width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          background-color: #fff;
          border-radius: 0.375rem;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          font-size: 0.875rem;
        }
        
        .reports-table th,
        .reports-table td {
          padding: 12px 8px;
          border-bottom: 1px solid #dee2e6;
          vertical-align: middle;
          word-wrap: break-word;
          overflow-wrap: break-word;
          text-align: center;
        }
        
        .reports-table thead th {
          background-color: #f8f9fa;
          font-weight: 600;
          color: #495057;
          border-bottom: 2px solid #dee2e6;
          cursor: pointer;
          user-select: none;
          position: sticky;
          top: 0;
          z-index: 10;
          text-align: center;
        }
        
        .reports-table tbody tr:hover {
          background-color: #f1f3f5;
        }
        
        .cell-wrapper {
          width: 100%;
          min-width: 0;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        .truncate-text {
          display: block;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
          text-align: center;
        }
        
        .project-cell {
          max-width: 150px;
          min-width: 100px;
          text-align: center;
        }
        
        .product-cell {
          max-width: 120px;
          min-width: 80px;
          text-align: center;
        }
        
        .date-cell {
          min-width: 80px;
          font-size: 0.8rem;
          color: #6c757d;
          text-align: center;
        }
        
        .amount-cell {
          text-align: center;
          font-weight: 600;
          min-width: 80px;
        }
        
        .quantity-cell {
          text-align: center;
          font-weight: 500;
          min-width: 60px;
        }
        
        .amount-value {
          display: inline-block;
          white-space: nowrap;
        }
        
        .amount-value.revenue {
          color: #0d6efd;
          font-weight: 700;
        }
        
        .profit-cell .amount-value {
          color: #198754;
        }
        
        .loss-cell .amount-value {
          color: #dc3545;
        }
        
        .empty-message {
          padding: 2rem !important;
          color: #6c757d;
          font-style: italic;
        }
        
        .header-search-container {
          position: relative;
          flex-grow: 1;
          max-width: 450px;
        }
        
        .header-search-input {
          padding: 12px 45px 12px 45px;
          border-radius: 25px;
          border: 2px solid #e9ecef;
          background-color: #fff;
          width: 100%;
          font-size: 14px;
          transition: all 0.3s ease;
          box-shadow: 0 2px 4px rgba(0,0,0,0.04);
        }
        
        .header-search-input:focus {
          outline: none;
          border-color: #0d6efd;
          box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.15), 0 4px 12px rgba(0,0,0,0.1);
          transform: translateY(-1px);
        }
        
        .header-search-input::placeholder {
          color: #adb5bd;
          font-style: italic;
        }
        
        .header-search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #6c757d;
          pointer-events: none;
          font-size: 16px;
          transition: color 0.3s ease;
        }
        
        .header-search-input:focus + .header-search-icon {
          color: #0d6efd;
        }
        
        .header-clear-search {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          background: #f8f9fa;
          border: none;
          color: #6c757d;
          cursor: pointer;
          padding: 4px;
          font-size: 12px;
          z-index: 1;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          opacity: 0.7;
        }
        
        .header-clear-search:hover {
          background: #dc3545;
          color: #fff;
          opacity: 1;
          transform: translateY(-50%) scale(1.1);
        }
        
        .custom-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 15px;
          padding: 1.25rem;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-bottom: 1px solid #dee2e6;
          border-radius: 0.375rem 0.375rem 0 0;
        }
        
        .header-left {
          display: flex;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
          flex-grow: 1;
        }
        
        .records-count {
          white-space: nowrap;
          font-size: 0.875rem;
          color: #495057;
          background: #fff;
          padding: 8px 16px;
          border-radius: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.08);
          border: 1px solid #e9ecef;
          font-weight: 500;
        }
        
        .search-results-info {
          margin-top: 0.5rem;
          font-size: 0.8rem;
          color: #0d6efd;
          background: rgba(13, 110, 253, 0.1);
          padding: 6px 12px;
          border-radius: 15px;
          font-weight: 500;
          animation: slideIn 0.3s ease;
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .loading-more {
          position: sticky;
          bottom: 0;
          background: rgba(248, 249, 250, 0.95);
          backdrop-filter: blur(5px);
          border-top: 1px solid #dee2e6;
          padding: 10px;
          text-align: center;
          z-index: 5;
        }
        
        .table-container {
          max-height: 70vh;
          overflow: auto;
          position: relative;
        }
        
        /* Tablet Responsiveness */
        @media (max-width: 1024px) {
          .reports-table {
            font-size: 0.8rem;
          }
          
          .reports-table th,
          .reports-table td {
            padding: 10px 6px;
            text-align: center;
          }
          
          .project-cell {
            max-width: 120px;
            min-width: 80px;
          }
          
          .product-cell {
            max-width: 100px;
            min-width: 70px;
          }
          
          .header-search-input {
            padding: 10px 40px 10px 40px;
            font-size: 0.9rem;
          }
        }
        
        /* Mobile Responsiveness */
        @media (max-width: 768px) {
          .custom-card-header {
            flex-direction: column;
            align-items: stretch;
            gap: 15px;
            padding: 1rem;
          }
          
          .header-left {
            flex-direction: column;
            align-items: stretch;
            gap: 15px;
          }
          
          .header-search-container {
            max-width: none;
            width: 100%;
          }
          
          .header-search-input {
            padding: 14px 45px 14px 45px;
            font-size: 16px;
          }
          
          .records-count {
            text-align: center;
            order: 2;
            align-self: center;
          }
          
          .search-results-info {
            text-align: center;
            margin-top: 10px;
          }
          
          .reports-table {
            font-size: 0.75rem;
          }
          
          .reports-table th,
          .reports-table td {
            padding: 8px 4px;
            text-align: center;
          }
          
          .project-cell,
          .product-cell {
            max-width: 100px;
            min-width: 60px;
            text-align: center;
          }
          
          .date-cell {
            min-width: 60px;
            font-size: 0.7rem;
            text-align: center;
          }
          
          .amount-cell,
          .quantity-cell {
            min-width: 60px;
            font-size: 0.75rem;
            text-align: center;
          }
          
          .table-container {
            max-height: 60vh;
          }
        }
        
        /* Small Mobile */
        @media (max-width: 576px) {
          .custom-card-header {
            padding: 0.75rem;
          }
          
          .reports-table {
            font-size: 0.7rem;
          }
          
          .reports-table th,
          .reports-table td {
            padding: 6px 3px;
            text-align: center;
          }
          
          .project-cell,
          .product-cell {
            max-width: 80px;
            min-width: 50px;
            text-align: center;
          }
          
          .date-cell {
            min-width: 50px;
            font-size: 0.65rem;
            text-align: center;
          }
          
          .amount-cell,
          .quantity-cell {
            min-width: 50px;
            font-size: 0.7rem;
            text-align: center;
          }
          
          .truncate-text {
            font-size: 0.7rem;
            text-align: center;
          }
          
          .header-search-input {
            font-size: 16px;
            padding: 12px 40px 12px 40px;
          }
          
          .header-search-icon {
            left: 14px;
            font-size: 15px;
          }
          
          .header-clear-search {
            right: 14px;
            width: 18px;
            height: 18px;
            font-size: 11px;
          }
          
          .records-count {
            font-size: 0.8rem;
            padding: 6px 12px;
          }
          
          .search-results-info {
            font-size: 0.75rem;
            padding: 4px 8px;
          }
        }
        
        /* Extra Small Mobile */
        @media (max-width: 420px) {
          .reports-table {
            font-size: 0.65rem;
          }
          
          .reports-table th,
          .reports-table td {
            padding: 5px 2px;
            text-align: center;
          }
          
          .project-cell,
          .product-cell {
            max-width: 70px;
            min-width: 45px;
            text-align: center;
          }
          
          .date-cell {
            min-width: 45px;
            font-size: 0.6rem;
            text-align: center;
          }
          
          .amount-cell,
          .quantity-cell {
            min-width: 45px;
            font-size: 0.65rem;
            text-align: center;
          }
          
          .truncate-text {
            font-size: 0.65rem;
            text-align: center;
          }
          
          .amount-value {
            font-size: 0.65rem;
          }
        }
        
        /* Landscape Mobile */
        @media (max-width: 896px) and (orientation: landscape) {
          .table-container {
            max-height: 50vh;
          }
          
          .reports-table th,
          .reports-table td {
            padding: 6px 4px;
            text-align: center;
          }
        }
        
        /* Large Desktop */
        @media (min-width: 1200px) {
          .project-cell {
            max-width: 200px;
            min-width: 150px;
          }
          
          .product-cell {
            max-width: 150px;
            min-width: 120px;
          }
          
          .reports-table th,
          .reports-table td {
            padding: 15px 12px;
          }
        }
        
        /* High DPI Displays */
        @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
          .reports-table {
            border: 0.5px solid #dee2e6;
          }
          
          .reports-table th,
          .reports-table td {
            border-bottom: 0.5px solid #dee2e6;
          }
        }
        
        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .reports-table {
            background-color: #2d3748;
            color: #e2e8f0;
          }
          
          .reports-table thead th {
            background-color: #4a5568;
            color: #e2e8f0;
          }
          
          .reports-table tbody tr:hover {
            background-color: #4a5568;
          }
        }
        
        .header-search-input::-webkit-search-cancel-button {
          display: none;
        }
        
        /* Print styles */
        @media print {
          .header-search-container,
          .loading-more {
            display: none !important;
          }
          
          .reports-table {
            box-shadow: none;
            border: 1px solid #000;
          }
          
          .reports-table th,
          .reports-table td {
            border: 1px solid #000;
            padding: 8px;
          }
        }
        
        /* Accessibility improvements */
        @media (prefers-reduced-motion: reduce) {
          .header-search-input,
          .header-clear-search,
          .search-results-info {
            transition: none;
            animation: none;
          }
        }
        
        /* Focus management for keyboard navigation */
        .reports-table th:focus,
        .header-search-input:focus,
        .header-clear-search:focus {
          outline: 2px solid #0d6efd;
          outline-offset: 2px;
        }
      `}</style>

      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <div className="custom-card-header">
              <div className="header-left">
                <div className="header-search-container">
                  <input
                    type="text"
                    className="header-search-input"
                    placeholder={getSearchPlaceholder()}
                    value={searchInput}
                    onChange={handleSearchChange}
                  />
                  <div className="header-search-icon">
                    🔍
                  </div>
                  {searchInput && (
                    <button
                      className="header-clear-search"
                      onClick={clearSearch}
                      title={t('LABELS.clear_search') || 'Clear search'}
                    >
                      ×
                    </button>
                  )}
                </div>
                {searchTerm && (
                  <div className="search-results-info">
                    {filteredData.length} {t('LABELS.results_found') || 'results found for'} "{searchTerm}"
                  </div>
                )}
              </div>
              <div className="records-count">
                {filteredData.length} {t('LABELS.records') || 'records'}
              </div>
            </div>
            <CCardBody className="p-0">
              <div 
                className="table-container" 
                ref={tableContainerRef}
                onScroll={handleScroll}
              >
                <CTable className="reports-table">
                  <CTableHead>
                    <CTableRow>
                      {renderTableHeaders()}
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {renderTableRows()}
                  </CTableBody>
                </CTable>
                {isFetchingMore && (
                  <div className="loading-more">
                    <CSpinner color="primary" size="sm" />
                    <span className="ms-2 text-muted">
                      {t('MSG.loading') || 'Loading more...'}
                    </span>
                  </div>
                )}
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  );
}

export default All_Tables;