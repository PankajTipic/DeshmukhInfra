import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
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
  CSpinner,
  CCollapse
} from '@coreui/react';
import { getAPICall, put } from '../../../util/api';
import ConfirmationModal from '../../common/ConfirmationModal';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '../../common/toast/ToastContext';
import CIcon from '@coreui/icons-react';
import { cilPhone, cilChatBubble, cilArrowCircleTop, cilArrowCircleBottom } from '@coreui/icons';
import { useTranslation } from 'react-i18next';

const Orders = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t, i18n } = useTranslation('global');
  const route = window.location.href.split('/').pop();

  const [loadingDeliver, setLoadingDeliver] = useState(false);

  const { search } = useLocation();
const queryParams = new URLSearchParams(search);
const convertTo = queryParams.get("convertTo");
  // State management
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [selectedDueFilter, setSelectedDueFilter] = useState(null);

  const [nextCursor, setNextCursor] = useState(null);
  const [hasMorePages, setHasMorePages] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedCards, setExpandedCards] = useState(new Set());
  
  // Modal states
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deliverModalVisible, setDeliverModalVisible] = useState(false);
  const [deleteOrder, setDeleteOrder] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Delivery modal states
  const [paidAmount, setPaidAmount] = useState(0);
  const [balance, setBalance] = useState(0);
  const [finalAmount, setFinalAmount] = useState(0);
  const [additionalPaid, setAdditionalPaid] = useState('');

  const [validationError, setValidationError] = useState('');

  const [currentStocks, setCurrentStocks] = useState({});


  // Refs for scroll and debouncing
  const tableContainerRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const scrollTimeoutRef = useRef(null);

  const userData = JSON.parse(localStorage.getItem('userData'));
  const companyName = userData?.user?.company_info?.company_name || 'Nursery';

  // Get order type based on route
  const getOrderType = () => {
    if (route === 'order') return -1;
    if (route === 'bookings') return 2;
    if (route === 'quotation') return 3;
    return 1;
  };

  // Check screen size for mobile responsiveness
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);


  useEffect(() => {
  const additionalPaidNum = parseFloat(additionalPaid) || 0;
  const balanceNum = parseFloat(balance) || 0;

  if (additionalPaidNum > balanceNum) {
    setValidationError(t('validation.amountExceedsBalance'));
  } else if (additionalPaidNum < 0) {
    setValidationError(t('validation.amountCannotBeNegative'));
  } else {
    setValidationError('');
  }
}, [additionalPaid, balance, t]);


  // Debounced search implementation
  const debouncedSearch = useCallback((value) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      setSearchTerm(value);
    }, 300);
  }, []);

  // Enhanced filtering with debouncing
const parseDueDate = (dateStr) => {
  if (!dateStr) return null;
  
  // If already Date object, return it
  if (dateStr instanceof Date) return dateStr;
  
  // Try standard parsing first
  let parsed = new Date(dateStr);
  if (!isNaN(parsed)) return parsed;

  // Try DD MMM format (e.g., "11 Aug")
  const parts = dateStr.split(' ');
  if (parts.length >= 2) {
    const day = parseInt(parts[0], 10);
    const monthIndex = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
      .indexOf(parts[1]);
    const year = parts[2] ? parseInt(parts[2], 10) : new Date().getFullYear();
    if (monthIndex >= 0) {
      return new Date(year, monthIndex, day);
    }
  }
  
  return null;
};

const filteredOrders = useMemo(() => {
  if (!orders || !Array.isArray(orders)) return [];

  return orders.filter(order => {
    // Badge filter based on deliveryDate
    if (selectedDueFilter) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const dueDate = new Date(order.deliveryDate);
      if (isNaN(dueDate)) return false;
      dueDate.setHours(0, 0, 0, 0);

      const diffDays = Math.floor((dueDate - today) / (1000 * 60 * 60 * 24));

      if (selectedDueFilter === 'missed' && diffDays >= 0) return false; // past date only
      if (selectedDueFilter === 'today' && diffDays !== 0) return false; // exact today
      if (selectedDueFilter === 'within15' && (diffDays < 1 || diffDays > 15)) return false;

      if (selectedDueFilter === 'more15' && diffDays <= 15) return false;
    }

    // Search filter
    if (!searchTerm.trim()) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      order.customer?.name?.toLowerCase().includes(searchLower) ||
      order.customer?.mobile?.toString().includes(searchTerm) ||
      order.customer?.email?.toLowerCase().includes(searchLower) ||
      order.invoiceDate?.toLowerCase().includes(searchLower) ||
      order.items?.some(item =>
        item.product_name?.toLowerCase().includes(searchLower) ||
        item.product_local_name?.toLowerCase().includes(searchLower) ||
        item.remark?.toLowerCase().includes(searchLower)
      ) ||
      order.finalAmount?.toString().includes(searchTerm) ||
      order.paidAmount?.toString().includes(searchTerm)
    );
  });
}, [orders, searchTerm, selectedDueFilter]);





 const getDeliveryDateBadgeColor = (deliveryDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison
  const delivery = new Date(deliveryDate);
  delivery.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison
  const diffTime = delivery.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { color: 'secondary', className: 'badge-strobe-grey' };    // Grey with strobing for missed deliveries
  if (diffDays === 0) return { color: 'danger', className: 'badge-strobe-danger' };    // Red with strobing
  if (diffDays > 0 && diffDays <= 15) return { color: 'warning', className: 'badge-strobe-warning' }; // Orange with strobing
  if (diffDays > 15) return { color: 'success', className: '' };    // Green without strobing
  return { color: 'secondary', className: '' };                     // Fallback
};

const toggleCardExpansion = (orderId) => {
  setExpandedCards(prev => {
    const newSet = new Set();
    if (!prev.has(orderId)) {
      newSet.add(orderId);
    }
    return newSet;
  });
};

  // Toggle card expansion
  useEffect(() => {
  setExpandedCards(new Set());
}, [route]);


  // Fetch orders with pagination
  const fetchOrders = async (reset = true) => {
    if (reset) {
      setIsLoading(true);
    } else {
      setIsFetchingMore(true);
    }

    try {
      const type = getOrderType();
      const orderStatus = type === 2 ? 2 : (type === 3 ? 3 : undefined);

      
      const url = `/api/order?invoiceType=${type}` +
        (orderStatus !== undefined ? `&orderStatus=${orderStatus}` : '') +
        (nextCursor && !reset ? `&cursor=${nextCursor}` : '');

      const response = await getAPICall(url);
      
      if (response.error) {
        showToast('danger', response.error);
      } else {
        const newOrders = reset ? response.data : [...orders, ...response.data];
        setOrders(newOrders);
        setNextCursor(response.next_cursor || null);
        setHasMorePages(response.has_more_pages || false);
      }
    } catch (error) {
      showToast('danger', t('TOAST.error_occurred') + ': ' + error.message);

    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  };
  // Table container scroll handler with debounce
  const handleScroll = useCallback(() => {
  if (scrollTimeoutRef.current) {
    clearTimeout(scrollTimeoutRef.current);
  }
  
  scrollTimeoutRef.current = setTimeout(() => {
    const container = tableContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    
    // Calculate approximate row height
    // You can also store this as a ref or state if you have dynamic row heights
    const approximateRowHeight = 60; // Adjust this based on your actual row height
    
    // Calculate how many rows are currently visible
    const visibleRows = Math.floor(clientHeight / approximateRowHeight);
    
    // Calculate total rows that can fit in the scrollable area
    const totalScrollableRows = Math.floor(scrollHeight / approximateRowHeight);
    
    // Calculate which row is currently at the top of the viewport
    const currentTopRow = Math.floor(scrollTop / approximateRowHeight);
    
    // Calculate which row is at the bottom of the viewport
    const currentBottomRow = currentTopRow + visibleRows;
    
    // Check if we're viewing the 2nd last row
    // (totalScrollableRows - 2) because we want 2nd last, and arrays are 0-indexed
    const isOn2ndLastRow = currentBottomRow >= (totalScrollableRows - 2);
    
    // Alternative approach: Check if there are only 2 rows left below the current view
    const rowsRemainingBelow = totalScrollableRows - currentBottomRow;
    const shouldLoadMore = rowsRemainingBelow <= 2;
    
    // Debug logging (remove in production)
    console.log('Row-based Scroll Debug:', {
      scrollTop,
      clientHeight,
      scrollHeight,
      approximateRowHeight,
      visibleRows,
      totalScrollableRows,
      currentTopRow,
      currentBottomRow,
      rowsRemainingBelow,
      isOn2ndLastRow,
      shouldLoadMore,
      hasMorePages,
      isFetchingMore,
      isLoading
    });

    if (
      shouldLoadMore &&
      hasMorePages &&
      !isFetchingMore &&
      !isLoading
    ) {
      console.log('Loading more orders - reached 2nd last row...');
      fetchOrders(false);
    }
  }, 100);
}, [hasMorePages, isFetchingMore, isLoading, fetchOrders]);

// Alternative approach using Intersection Observer API for more precise detection
// This is more accurate but requires additional setup
const setupIntersectionObserver = useCallback(() => {
  if (!tableContainerRef.current) return;
  
  // Create observer for the last few rows
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const rowIndex = parseInt(entry.target.dataset.rowIndex);
          const totalRows = orders.length; // Assuming 'orders' is your data array
          
          // Check if this is the 2nd last row
          if (rowIndex === totalRows - 2) {
            if (hasMorePages && !isFetchingMore && !isLoading) {
              console.log('2nd last row visible - loading more...');
              fetchOrders(false);
            }
          }
        }
      });
    },
    {
      root: tableContainerRef.current,
      rootMargin: '0px',
      threshold: 0.1 // Trigger when 10% of the row is visible
    }
  );
  
  // Observe the last few rows
  const rows = tableContainerRef.current.querySelectorAll('[data-row-index]');
  const lastFewRows = Array.from(rows).slice(-3); // Watch last 3 rows
  lastFewRows.forEach(row => observer.observe(row));
  
  return observer;
}, [orders, hasMorePages, isFetchingMore, isLoading, fetchOrders]);

  // Initial load and route change
  useEffect(() => {
    setNextCursor(null);
    fetchOrders(true);
  }, [route]);

  // Cleanup timers
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

  // Utility functions
  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('en-US', options).replace(',', '');
    const [month, day] = formattedDate.split(' ');
    return `${day} ${month}`;
  };

  const convertTo12HourFormat = (time) => {
  // Handle null, undefined, or empty string
  if (!time || typeof time !== 'string') {
    return 'N/A'; // or return a default time like '12:00 PM'
  }
  
  try {
    let [hours, minutes] = time.split(':').map(Number);
    
    // Validate the parsed values
    if (isNaN(hours) || isNaN(minutes)) {
      return 'N/A';
    }
    
    const suffix = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes.toString().padStart(2, '0')} ${suffix}`;
  } catch (error) {
    console.warn('Error converting time:', time, error);
    return 'N/A';
  }
};

  // Event handlers
  const handleDelete = (order) => {
    setDeleteOrder(order);
    setDeleteModalVisible(true);
  };

  const onDelete = async () => {
    try {
      await put(`/api/order/${deleteOrder.id}/cancel`, {
        ...deleteOrder,
        orderStatus: 0,
      });
      setDeleteModalVisible(false);
showToast('danger', t('TOAST.order_cancelled'));
      setNextCursor(null);
      fetchOrders(true);
    } catch (error) {
      showToast('danger', t('TOAST.error_occurred') + ': ' + error.message);

    }
  };

  const handleShow = (order) => {
    navigate(`/invoice-details/${order.id}`);
  };

 const handleDeliveredClick = async (order) => {
  setSelectedOrder(order);
  setPaidAmount(order.paidAmount);
  setBalance(order.finalAmount - order.paidAmount);
  setFinalAmount(order.finalAmount);
  setDeliverModalVisible(true);

  // Fetch live stock
  try {
    const ids = order.items.map(i => i.product_sizes_id).join(',');
    const response = await getAPICall(`/api/product-sizes?ids=${ids}`);
    if (response.error) {
      showToast('danger', response.error);
      setCurrentStocks({});
    } else {
      const stockMap = {};
      response.data.forEach(s => {
        stockMap[s.id] = s.stock;
      });
      setCurrentStocks(stockMap);
    }
  } catch (err) {
    showToast('danger', 'Error fetching stock: ' + err.message);
    setCurrentStocks({});
  }
};


 const confirmDeliver = async () => {
  if (loadingDeliver) return; // ✅ Block double submission

  setLoadingDeliver(true); // 🔄 Start spinner
  try {
    await put(`/api/updateorder/${selectedOrder.id}`, {
      orderStatus: 1,
      customer_id: selectedOrder.customer?.id,
      amountToBePaid: parseInt(additionalPaid || 0),
    });

    showToast('success', t('TOAST.order_delivered'));

    setDeliverModalVisible(false);
    setAdditionalPaid('');
    setNextCursor(null);
    fetchOrders(true); // ✅ Refresh order list
  } catch (error) {
    showToast('danger', t('TOAST.error_occurred') + ': ' + error.message);
  } finally {
    setLoadingDeliver(false); // ✅ End spinner
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

  const getStatusBadge = (status) => {
    const statusConfig = {
      0: { color: 'danger', text: 'Cancelled' },
      1: { color: 'success', text: 'Delivered' },
      2: { color: 'warning', text: 'Pending' },
      3: { color: 'primary', text: 'Quotation' }
    };
    const config = statusConfig[status] || statusConfig[2];
    return <CBadge color={config.color}>{config.text}</CBadge>;
  };

  const renderItemsCell = (items) => {
    if (!items || items.length === 0) {
      return <span className="text-muted">Only cash collected</span>;
    }

    return (
      <div className="items-list">
        {items.map((item, index) => (
          <div key={item.id || index} className="item-row">
            <div className="item-name">
              {i18n.language === 'en' ? item.product_name : item.product_local_name}
              <span className="item-qty"> ({item.dQty} × ₹{item.dPrice})</span>
            </div>
            {item.remark && (
              <div className="item-remark text-muted small">
                <em>Note: {item.remark}</em>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Render action buttons based on order type
  const renderActionButtons = (order) => {
    const orderType = getOrderType();
    
    return (
      <div className="action-buttons">
        {(route === 'order') && order.orderStatus !== 0 && (
           <CBadge
          role="button"
          color="info"
          onClick={() => handleShow(order)}
          style={{ cursor: 'pointer', fontSize: '0.75em' }}
        >
          Show
        </CBadge>
        )}
        
        {/* Show Deliver button only for bookings (orderType = 2) */}
        {route === 'bookings' && order.orderStatus !== 0 && (
          <CBadge
            role="button"
            color="success"
            onClick={() => handleDeliveredClick(order)}
            style={{ cursor: 'pointer', fontSize: '0.75em' }}
          >
            Deliver
          </CBadge>
        )}
        
        {/* Show Cancel button for bookings and all orders */}
        {(route === 'bookings' || route === 'order') && order.orderStatus !== 0 && (
          <CBadge
            role="button"
            color="danger"
            onClick={() => handleDelete(order)}
            style={{ cursor: 'pointer', fontSize: '0.75em' }}
          >
            Cancel
          </CBadge>
        )}

        {route === 'quotation' && order.orderStatus === 3 && (
  <>
    <CBadge
      role="button"
      color="success"
      onClick={() => navigate(`/edit-order/${order.id}?convertTo=1`)}
      style={{ cursor: 'pointer', fontSize: '0.75em' }}
    >
      {t('order.convert_regular')}
    </CBadge>
    <CBadge
      role="button"
      color="warning"
      onClick={() => navigate(`/edit-order/${order.id}?convertTo=2`)}
      style={{ cursor: 'pointer', fontSize: '0.75em' }}
    >
      {t('order.convert_advance')}
    </CBadge>
  </>
)}


        
      </div>
    );
  };

const renderMobileCard = (order, index) => {
  const isExpanded = expandedCards.has(order.id);
  const badgeConfig = route === 'bookings' ? getDeliveryDateBadgeColor(order.deliveryDate) : null;

  return (
    <CCard 
      key={order.id} 
      className="mb-3 order-card" 
      onClick={() => toggleCardExpansion(order.id)} 
      style={{ cursor: 'pointer' }}
    >
      <CCardBody>
        {/* First Row: Customer Name with Status and Contact Icons */}
        <div className="card-row-1">
          <div className="customer-name-section">
            <div className="customer-name">{order.customer?.name || 'Unknown'}</div>
            {route === 'order' && (
              <div className="status-badge">
                {getStatusBadge(order.orderStatus)}
              </div>
            )}
          </div>
          <div className="contact-icons">
            <a
              className="contact-btn call-btn"
              href={`tel:+91${order.customer?.mobile}`}
              title="Call"
              onClick={(e) => e.stopPropagation()}
            >
              <CIcon icon={cilPhone} size="sm" />
            </a>
            <a
              className="contact-btn sms-btn"
              href={`sms:+91${order.customer?.mobile}?body=Hello ${order.customer?.name}, your order is ready. Balance: ₹${(order.finalAmount - order.paidAmount).toFixed(2)}. From - ${companyName}`}
              title="SMS"
              onClick={(e) => e.stopPropagation()}
            >
              <CIcon icon={cilChatBubble} size="sm" />
            </a>
          </div>
        </div>

        {/* Second Row: Date Badge and Expand Arrow */}
        <div className="card-row-2">
          <div className="date-badge-section">
            {order.items && order.items.length > 0
              ? `${i18n.language === 'en'
                  ? order.items[0].product_name
                  : order.items[0].product_local_name}${order.items.length > 1 ? ` +${order.items.length - 1} items` : ''}`
              : 'Only cash collected'}
          </div>

          <div className="expand-arrow d-flex align-items-center gap-2">
            {route === 'bookings' && badgeConfig ? (
              <CBadge color={badgeConfig.color} className={`date-badge ${badgeConfig.className}`}>
                {formatDate(order.deliveryDate)}
              </CBadge>
            ) : (
              <CBadge color="primary" className="date-badge">
                {formatDate(order.invoiceDate)}
              </CBadge>
            )}
            <CIcon icon={isExpanded ? cilArrowCircleTop : cilArrowCircleBottom} />
          </div>
        </div>

        {/* Third Row: Order Details (Always Visible) */}
        <div className="card-row-3">
          <div className="order-details-line">
            📅 {formatDate(order.invoiceDate)} • {convertTo12HourFormat(order.deliveryTime)}
          </div>
        </div>

        {/* Expandable Details */}
        <CCollapse visible={isExpanded}>
          <div className="expanded-details">
            {/* Items */}
            <div className="detail-section">
              <div className="detail-label">Items:</div>
              <div className="detail-content">
                {renderItemsCell(order.items)}
              </div>
            </div>

            {/* Amount Details */}
            <div className="amount-details">
              <div className="amount-row">
                <span>Paid:</span>
                <span className="amount-paid">₹{parseFloat(order.paidAmount).toFixed(2)}</span>
              </div>
              <div className="amount-row">
                <span>Balance:</span>
                <span className="amount-balance">₹{(order.finalAmount - order.paidAmount).toFixed(2)}</span>
              </div>
              <div className="amount-row total-row">
                <span>Total:</span>
                <span className="amount-total">₹{parseFloat(order.finalAmount).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CCollapse>

        {/* Fourth Row: Action Buttons */}
        <div className="card-row-4" onClick={(e) => e.stopPropagation()}>
          <div className="action-buttons-mobile">
            {renderActionButtons(order)}
          </div>
        </div>
      </CCardBody>
    </CCard>
  );
};
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <CSpinner color="primary" size="lg" />
          <p className="mt-3 text-muted">Loading orders...</p>
        </div>
      </div>
    );
  }

   return (
    <>
      <style jsx global>{`

/* New Mobile Card Structure - COMPACT VERSION */
.order-card {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  overflow: hidden;
  margin-bottom: 12px;
}

.order-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

/* Card Body Padding - MOST IMPORTANT FOR COMPACTNESS */
.order-card .card-body {
  padding: 12px !important;
}

/* Card Row 1: Customer name, status, contact icons */
.card-row-1 {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.customer-name-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.customer-name {
  font-weight: 600;
  font-size: 1em;
  color: #333;
  line-height: 1.1;
}

.status-badge {
  align-self: flex-start;
}

.contact-icons {
  display: flex;
  gap: 6px;
  align-items: flex-start;
}

.contact-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  text-decoration: none;
  transition: all 0.2s ease;
}

.call-btn {
  background: #e3f2fd;
  color: #1976d2;
  border: 2px solid #bbdefb;
}

.call-btn:hover {
  background: #bbdefb;
  color: #0d47a1;
  transform: scale(1.05);
}

.sms-btn {
  background: #e8f5e8;
  color: #388e3c;
  border: 2px solid #c8e6c9;
}

.sms-btn:hover {
  background: #c8e6c9;
  color: #1b5e20;
  transform: scale(1.05);
}

/* Card Row 2: Date badge and expand arrow */
.card-row-2 {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  cursor: pointer;
  padding: 4px 0;
}

.date-badge-section {
  flex: 1;
}

.date-badge {
  font-size: 0.8em;
  padding: 4px 10px;
  border-radius: 16px;
  font-weight: 500;
}

.expand-arrow {
  color: #007bff;
  transition: transform 0.3s ease;
  padding: 2px;
}

.expand-arrow:hover {
  transform: scale(1.1);
}

/* Card Row 3: Order details line */
.card-row-3 {
  margin-bottom: 8px;
  padding: 4px 0;
  border-top: 1px solid #f0f0f0;
}

.order-details-line {
  color: #666;
  font-size: 0.85em;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Card Row 4: Action buttons - LARGER AND HALF-HALF LAYOUT */
.card-row-4 {
  padding: 6px 0;
  border-top: 1px solid #f0f0f0;
}

.action-buttons-mobile {
  
  gap: 8px;
  justify-content: space-between;
  width: 100%;
}

.action-buttons-mobile .badge {
  font-size: 0.85em;
  padding: 8px 16px;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  text-align: center;
  flex: 1;
  min-height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
}

.action-buttons-mobile .badge:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* Specific colors for action buttons */
.action-buttons-mobile .badge[role="button"] {
  border: 1px solid;
}

.action-buttons-mobile .badge.bg-info {
  background-color: #0dcaf0 !important;
  border-color: #0dcaf0;
  color: white !important;
}

.action-buttons-mobile .badge.bg-success {
  background-color: #198754 !important;
  border-color: #198754;
  color: white !important;
}

.action-buttons-mobile .badge.bg-danger {
  background-color: #dc3545 !important;
  border-color: #dc3545;
  color: white !important;
}

/* For single button, take full width */
.action-buttons-mobile .badge:only-child {
  flex: 1;
}

/* For two buttons, equal halves */
.action-buttons-mobile .badge:first-child:nth-last-child(2),
.action-buttons-mobile .badge:first-child:nth-last-child(2) ~ .badge {
  flex: 1;
}

/* For three buttons, equal thirds */
.action-buttons-mobile .badge:first-child:nth-last-child(3),
.action-buttons-mobile .badge:first-child:nth-last-child(3) ~ .badge {
  flex: 1;
}

/* Expandable Details */
.expanded-details {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 2px solid #f0f0f0;
  background: #fafafa;
  margin: 12px -12px -12px -12px;
  padding: 12px;
}

.detail-section {
  margin-bottom: 12px;
}

.detail-label {
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
  font-size: 0.85em;
}

.detail-content {
  background: white;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
}

.amount-details {
  background: white;
  border-radius: 6px;
  padding: 12px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.amount-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  font-size: 0.9em;
}

.amount-row:last-child {
  margin-bottom: 0;
}

.total-row {
  border-top: 1px solid #dee2e6;
  padding-top: 6px;
  font-weight: 600;
  font-size: 0.95em;
}

.amount-paid {
  color: #28a745 !important;
  font-weight: 600;
}

.amount-balance {
  color: #dc3545 !important;
  font-weight: 600;
}

.amount-total {
  color: #333 !important;
  font-weight: 600;
}

/* Remove old mobile styles that conflict */
.card-header-row,
.order-meta-actions,
.order-date-status,
.pre-expand-actions,
.card-actions {
  display: none !important;
}

/* Desktop Table Styles */
.table-container {
  height: 422px;
  overflow-y: auto;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  position: relative;
}

@media (max-width: 768px) {
  .table-container {
    height: 600px;
    overflow-x: auto;
    overflow-y: auto;
  }
}

.orders-table {
  width: 100%;
  table-layout: fixed;
  margin-bottom: 0;
}

.orders-table thead th {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
  box-shadow: 0 2px 2px -1px rgba(0, 0, 0, 0.1);
  font-size: 0.85em;
  padding: 8px 6px;
  white-space: nowrap;
  text-align: center;
  vertical-align: middle;
}

/* Column width fixes - remove sr no column */
.col-customer { width: 18%; min-width: 120px; }
.col-contact { width: 9%; min-width: 80px; }
.col-date { width: 13%; min-width: 100px; }
.col-delivery { width: 11%; min-width: 90px; }
.col-items { width: 22%; min-width: 150px; }
.col-paid { width: 9%; min-width: 70px; }
.col-balance { width: 9%; min-width: 70px; }
.col-total { width: 9%; min-width: 70px; }
.col-status { width: 9%; min-width: 70px; }
.col-actions { width: 13%; min-width: 100px; }

.orders-table th,
.orders-table td {
  text-align: center;
  vertical-align: middle;
  padding: 8px 6px;
  word-wrap: break-word;
  overflow-wrap: break-word;
  font-size: 0.9em;
  border-right: 1px solid #dee2e6;
}

.orders-table td {
  border-bottom: 1px solid #dee2e6;
}

/* Text alignment fixes */
.text-left {
  text-align: left !important;
}

.orders-table .col-customer,
.orders-table .col-items {
  text-align: left !important;
}

/* Mobile Card Styles */
@media (max-width: 768px) {
  .desktop-table {
    display: none;
  }
  
  .mobile-cards {
    display: block;
  }
}

@media (min-width: 769px) {
  .desktop-table {
    display: block;
  }
  
  .mobile-cards {
    display: none;
  }
}

/* Strobing animations */
@keyframes strobe-grey {
  0% { opacity: 1; }
  50% { opacity: 0.6; }
  100% { opacity: 1; }
}
.badge-strobe-grey {
  animation: strobe-grey 1.8s infinite;
}

@keyframes strobe-red {
  0% { opacity: 1; }
  50% { opacity: 0.4; }
  100% { opacity: 1; }
}
@keyframes strobe-orange {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}
.badge-strobe-danger {
  animation: strobe-red 1.5s infinite;
}
.badge-strobe-warning {
  animation: strobe-orange 2s infinite;
}

/* Search bar styles */
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

/* Items styling */
.items-list {
  font-size: 0.8em;
  text-align: left;
}
.item-row {
  margin-bottom: 2px;
}
.item-name {
  font-weight: 500;
}
.item-qty {
  color: #6c757d;
  font-weight: normal;
}
.item-remark {
  margin-top: 1px;
  font-style: italic;
}

/* Contact and action buttons for desktop */
.contact-buttons {
  display: flex;
  gap: 4px;
  justify-content: center;
  align-items: center;
}
.action-buttons {
  display: flex;
  gap: 4px;
  justify-content: center;
  align-items: center;
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

/* Mobile scrollable container */
.mobile-cards-container {
  height: 600px;
  overflow-y: auto;
  padding: 0 4px;
}

/* Responsive adjustments for very small screens */
@media (max-width: 576px) {
  .contact-btn {
    width: 28px;
    height: 28px;
  }
  
  .customer-name {
    font-size: 0.95em;
  }
  
  .date-badge {
    font-size: 0.75em;
    padding: 3px 6px;
  }
  
  .order-card .card-body {
    padding: 10px !important;
  }
  
  .action-buttons-mobile .badge {
    font-size: 0.8em;
    padding: 6px 12px;
    min-height: 32px;
  
  }
}

      `}</style>

      {/* Header with Search */}
      

      {/* Search Bar */}
     <CRow className="mb-3">
  <CCol xs={12} md={6} lg={4}>
    <div className="search-container">
      <CFormInput
        type="text"
        className="search-input"
        placeholder={
          route === 'bookings'
            ? t('LABELS.search_bookings')
            : route === 'quotation'
            ? t('LABELS.search_quotation')
            : t('LABELS.search_orders')
        }
        value={searchInput}
        onChange={handleSearchChange}
      />
      <div className="search-icon">🔍</div>
      {searchInput && (
        <button
          className="clear-search"
          onClick={clearSearch}
          title={t('LABELS.clear_search')}
        >
          ✕
        </button>
      )}
    </div>
  </CCol>

  {searchTerm && (
    <CCol xs={12} className="mt-2">
      <small className="text-muted">
        {t('LABELS.results_found', {
          count: filteredOrders.length,
          type:
            route === 'bookings'
              ? t('LABELS.bookings')
              : route === 'quotation'
              ? t('LABELS.quotation')
              : t('LABELS.orders'),
          term: searchTerm
        })}
      </small>
    </CCol>
  )}
</CRow>

{/* Mobile Card View */}
<div className="mobile-cards">
  <CRow>
    <CCol xs={12}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <strong>
          {route === 'bookings' ? (
           <span>
  {t('LABELS.advance_booking')}
  <span className="ms-2">
    <CBadge
      color="secondary"
      className="badge-strobe-grey me-1"
      style={{
        fontSize: '0.6em',
        cursor: 'pointer',
        border: selectedDueFilter === 'missed' ? '2px solid black' : 'none'
      }}
      onClick={() => setSelectedDueFilter(selectedDueFilter === 'missed' ? null : 'missed')}
    >
      {t('BADGES.missed')}
    </CBadge>

    <CBadge
      color="danger"
      className="badge-strobe-danger me-1"
      style={{
        fontSize: '0.6em',
        cursor: 'pointer',
        border: selectedDueFilter === 'today' ? '2px solid black' : 'none'
      }}
      onClick={() => setSelectedDueFilter(selectedDueFilter === 'today' ? null : 'today')}
    >
      {t('BADGES.today')}
    </CBadge>

    <CBadge
      color="warning"
      className="badge-strobe-warning me-1"
      style={{
        fontSize: '0.6em',
        cursor: 'pointer',
        border: selectedDueFilter === 'within15' ? '2px solid black' : 'none'
      }}
      onClick={() => setSelectedDueFilter(selectedDueFilter === 'within15' ? null : 'within15')}
    >
      {t('BADGES.within_15_days')}
    </CBadge>

    <CBadge
      color="success"
      style={{
        fontSize: '0.6em',
        cursor: 'pointer',
        border: selectedDueFilter === 'more15' ? '2px solid black' : 'none'
      }}
      onClick={() => setSelectedDueFilter(selectedDueFilter === 'more15' ? null : 'more15')}
    >
      {t('BADGES.more_than_15_days')}
    </CBadge>
  </span>
</span>

          ) : route === 'quotation' ? (
            t('LABELS.all_quotation')
          ) : (
            t('LABELS.all_orders')
          )}
        </strong>
        <small className="text-muted">
          {t('LABELS.total')} {filteredOrders.length}{' '}
          {route === 'bookings'
            ? t('LABELS.bookings')
            : route === 'quotation'
            ? t('LABELS.quotation')
            : t('LABELS.orders')}
        </small>
      </div>

      <div
        className="mobile-cards-container"
        ref={tableContainerRef}
        onScroll={handleScroll}
      >
        {filteredOrders.length === 0 ? (
          <div className="text-center py-5 text-muted">
            {searchTerm
              ? t('LABELS.no_results_found', {
                  type:
                    route === 'bookings'
                      ? t('LABELS.bookings')
                      : route === 'quotation'
                      ? t('LABELS.quotation')
                      : t('LABELS.orders')
                })
              : t('LABELS.no_data_available', {
                  type:
                    route === 'bookings'
                      ? t('LABELS.bookings')
                      : route === 'quotation'
                      ? t('LABELS.quotation')
                      : t('LABELS.orders')
                })}
          </div>
        ) : (
          filteredOrders.map((order, index) => renderMobileCard(order, index))
        )}

        {isFetchingMore && (
          <div className="text-center py-3">
            <CSpinner color="primary" size="sm" />
            <span className="ms-2 text-muted">
              {t("MSG.loading") || "Loading more..."}
            </span>
          </div>
        )}
      </div>
    </CCol>
  </CRow>
</div>


      {/* Desktop Table View */}
      <div className="desktop-table">
        <CRow>
          <CCol xs={12}>
            <CCard className="mb-4">
              <CCardHeader className="d-flex justify-content-between align-items-center">
                <strong>
  {route === 'bookings' ? (
    <span>
      {t('LABELS.advance_booking')}
      <span className="ms-2">
        <CBadge
  color="secondary"
  className="badge-strobe-grey me-1"
  style={{
    fontSize: '0.6em',
    cursor: 'pointer',
    border: selectedDueFilter === 'missed' ? '2px solid black' : 'none'
  }}
  onClick={() => setSelectedDueFilter(selectedDueFilter === 'missed' ? null : 'missed')}
>
  {t('BADGES.missed')}
</CBadge>

<CBadge
  color="danger"
  className="badge-strobe-danger me-1"
  style={{
    fontSize: '0.6em',
    cursor: 'pointer',
    border: selectedDueFilter === 'today' ? '2px solid black' : 'none'
  }}
  onClick={() => setSelectedDueFilter(selectedDueFilter === 'today' ? null : 'today')}
>
  {t('BADGES.today')}
</CBadge>

<CBadge
  color="warning"
  className="badge-strobe-warning me-1"
  style={{
    fontSize: '0.6em',
    cursor: 'pointer',
    border: selectedDueFilter === 'within15' ? '2px solid black' : 'none'
  }}
  onClick={() => setSelectedDueFilter(selectedDueFilter === 'within15' ? null : 'within15')}
>
  {t('BADGES.within_15_days')}
</CBadge>

<CBadge
  color="success"
  style={{
    fontSize: '0.6em',
    cursor: 'pointer',
    border: selectedDueFilter === 'more15' ? '2px solid black' : 'none'
  }}
  onClick={() => setSelectedDueFilter(selectedDueFilter === 'more15' ? null : 'more15')}
>
  {t('BADGES.more_than_15_days')}
</CBadge>

      </span>
    </span>
  ) : route === 'quotation' ? (
                    t('LABELS.all_quotation') || 'All quotation'
                  ) : (
                    t('LABELS.all_orders')
                  )}
</strong>
                <small className="text-muted">
                  {t('LABELS.total')}: {filteredOrders.length} {route === 'bookings'
  ? 'bookings'
  : route === 'quotation'
  ? 'quotation'
  : 'orders'}
                </small>
              </CCardHeader>
              <CCardBody className="p-0">
                <div 
                  className="table-container" 
                  ref={tableContainerRef}
                  onScroll={handleScroll}
                >
                  <CTable className="orders-table">
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell scope="col" className="col-customer">Customer</CTableHeaderCell>
                        <CTableHeaderCell scope="col" className="col-contact">Contact</CTableHeaderCell>
                        <CTableHeaderCell scope="col" className="col-date">Date & Time</CTableHeaderCell>
                        {route === 'bookings' && (
                          <CTableHeaderCell scope="col" className="col-delivery">Delivery Date</CTableHeaderCell>
                        )}
                        <CTableHeaderCell scope="col" className="col-items">Items</CTableHeaderCell>
                        <CTableHeaderCell scope="col" className="col-paid">Paid</CTableHeaderCell>
                        <CTableHeaderCell scope="col" className="col-balance">Balance</CTableHeaderCell>
                        <CTableHeaderCell scope="col" className="col-total">Total</CTableHeaderCell>
                        <CTableHeaderCell scope="col" className="col-status">Status</CTableHeaderCell>
                        <CTableHeaderCell scope="col" className="col-actions">Actions</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>

                    <CTableBody>
                      {filteredOrders.length === 0 ? (
                        <CTableRow>
                          <CTableDataCell colSpan={route === 'bookings' ? 10 : 9} className="text-center py-4 text-muted">
                            {searchTerm ? 
                              `No ${route === 'bookings'
  ? 'bookings'
  : route === 'quotation'
  ? 'quotation'
  : 'orders'} found` : 
                              `No ${route === 'bookings'
  ? 'bookings'
  : route === 'quotation'
  ? 'quotation'
  : 'orders'} available`
                            }
                          </CTableDataCell>
                        </CTableRow>
                      ) : (
                        filteredOrders.map((order, index) => (
                          <CTableRow key={order.id}>
                            <CTableDataCell className="col-customer text-left">
                              <div style={{ wordBreak: 'break-word' }}>
                                <div style={{ fontWeight: '500' }}>
                                  {order.customer?.name || 'Unknown'}
                                </div>
                                {order.customer?.email && (
                                  <div className="text-muted small">
                                    {order.customer.email}
                                  </div>
                                )}
                              </div>
                            </CTableDataCell>
                            <CTableDataCell className="col-contact">
                              <div className="contact-buttons">
                                <a
                                  className="btn btn-outline-info btn-sm"
                                  href={`tel:+91${order.customer?.mobile}`}
                                  title="Call"
                                >
                                  <CIcon icon={cilPhone} size="sm" />
                                </a>
                                <a
                                  className="btn btn-outline-success btn-sm"
                                  href={`sms:+91${order.customer?.mobile}?body=Hello ${order.customer?.name}, your order is ready. Balance: ₹${(order.finalAmount - order.paidAmount).toFixed(2)}. From - ${companyName}`}
                                  title="SMS"
                                >
                                  <CIcon icon={cilChatBubble} size="sm" />
                                </a>
                              </div>
                            </CTableDataCell>
                            <CTableDataCell className="col-date">
                              <div style={{ fontSize: '0.85em' }}>
                                <div>{formatDate(order.invoiceDate)}</div>
                                <div className="text-muted">
                                  {convertTo12HourFormat(order.deliveryTime)}
                                </div>
                              </div>
                            </CTableDataCell>
                            {route === 'bookings' && (
                              <CTableDataCell className="col-delivery">
                                {(() => {
                                  const badgeConfig = getDeliveryDateBadgeColor(order.deliveryDate);
                                  return (
                                    <CBadge color={badgeConfig.color} className={badgeConfig.className}>
                                      {formatDate(order.deliveryDate)}
                                    </CBadge>
                                  );
                                })()}
                              </CTableDataCell>
                            )}
                            <CTableDataCell className="col-items text-left">
                              {renderItemsCell(order.items)}
                            </CTableDataCell>
                            <CTableDataCell className="col-paid">
                              <span className="amount-paid">
                                ₹{parseFloat(order.paidAmount).toFixed(2)}
                              </span>
                            </CTableDataCell>
                            <CTableDataCell className="col-balance">
                              <span className="amount-balance">
                                ₹{(order.finalAmount - order.paidAmount).toFixed(2)}
                              </span>
                            </CTableDataCell>
                            <CTableDataCell className="col-total">
                              <span className="amount-total">
                                ₹{parseFloat(order.finalAmount).toFixed(2)}
                              </span>
                            </CTableDataCell>
                            <CTableDataCell className="col-status">
                              {getStatusBadge(order.orderStatus)}
                            </CTableDataCell>
                            <CTableDataCell className="col-actions">
                              {renderActionButtons(order)}
                            </CTableDataCell>
                          </CTableRow>
                        ))
                      )}
                    </CTableBody>
                  </CTable>

                  {isFetchingMore && (
                    <div className="loading-more">
                      <CSpinner color="primary" size="sm" />
                      <span className="ms-2 text-muted">{t("MSG.loading") || "Loading more..."}</span>
                    </div>
                  )}
                </div>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </div>

      {/* Modals */}
      <ConfirmationModal
        visible={deleteModalVisible}
        setVisible={setDeleteModalVisible}
        onYes={onDelete}
        resource={`Cancel Order - ${deleteOrder?.id}`}
      />

      {/* Delivery Modal */}
{deliverModalVisible && selectedOrder && (
  <div
    className="modal d-block"
    tabIndex="-1"
    role="dialog"
    style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
  >
    <div className="modal-dialog" role="document">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">{t('modal.confirmDelivery')}</h5>
          <button
            type="button"
            className="btn-close"
            onClick={() => setDeliverModalVisible(false)}
          ></button>
        </div>
        <div className="modal-body">
          <p><strong>{t('labels.finalAmount')}:</strong> ₹{finalAmount}</p>

          <div className="mb-3">
            <label htmlFor="paidAmount" className="form-label">{t('labels.advancedPayment')}</label>
            <input
              id="paidAmount"
              type="number"
              className="form-control"
              value={paidAmount}
              readOnly
            />
          </div>

          <div className="mb-3">
            <label htmlFor="balance" className="form-label">{t('labels.balanceAmount')}</label>
            <input
              id="balance"
              type="number"
              className="form-control"
              value={balance}
              readOnly
            />
          </div>

          <div className="mb-3">
            <label htmlFor="additionalPaid" className="form-label">{t('labels.amountToBePaid')}</label>
            <input
              id="additionalPaid"
              type="number"
              className={`form-control ${validationError ? 'is-invalid' : ''}`}
              value={additionalPaid}
              onWheel={(e) => e.target.blur()}
              onChange={(e) => setAdditionalPaid(e.target.value)}
              max={balance}
              min="0"
            />
            {validationError && (
              <div className="invalid-feedback">
                {validationError}
              </div>
            )}
          </div>
        </div>
        <div className="modal-footer">
          <CButton
            color="success"
            disabled={loadingDeliver}
          onClick={() => {
  let hasStockError = false;

  for (const item of selectedOrder.items) {
    const stock = currentStocks[item.product_sizes_id];
    if (stock === undefined) {
      showToast(
        'danger',
        t('errors.stock_data_missing', { product: item.product_name })
      );
      hasStockError = true;
      break;
    }
    if (stock < item.dQty) {
      showToast(
        'danger',
        t('errors.stock_not_enough', {
          product: item.product_name,
          available: stock,
          required: item.dQty
        })
      );
      hasStockError = true;
      break;
    }
  }

  if (hasStockError) return;

  if (parseFloat(additionalPaid || '0') < 0 || validationError) {
    showToast('danger', t('validation.invalid_payment'));
    return;
  }

  confirmDeliver();
}}


          >
            {loadingDeliver ? (
              <>
                <CSpinner size="sm" className="me-2" />
                {t('buttons.delivering') || 'Delivering...'}
              </>
            ) : (
              t('buttons.deliver')
            )}
          </CButton>

          <CButton color="secondary" onClick={() => setDeliverModalVisible(false)}>
            {t('buttons.cancel')}
          </CButton>
        </div>
      </div>
    </div>
  </div>
)}

    </>
  );
};

export default Orders;