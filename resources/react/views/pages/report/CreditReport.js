import React, { useEffect, useState } from 'react'
import {
  CAlert,
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CSpinner,
} from '@coreui/react'
import { getAPICall, put, post } from '../../../util/api'
import { useToast } from '../../common/toast/ToastContext'
import CIcon from '@coreui/icons-react'
import { cilChatBubble, cilPhone, cilArrowCircleBottom, cilArrowCircleTop, cilMoney } from '@coreui/icons'
import { getUserData } from '../../../util/session'
import { useTranslation } from 'react-i18next'

import html2pdf from 'html2pdf.js';



let debounceTimer
const debounceDelay = 300

const CreditReport = () => {
  const [report, setReport] = useState([])
  const [filteredReport, setFilteredReport] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [returnMoney, setReturnMoney] = useState({})
  const [expandedRows, setExpandedRows] = useState({})
  const [customerOrders, setCustomerOrders] = useState({})
  const [orderPayments, setOrderPayments] = useState({})
  const [loadingOrders, setLoadingOrders] = useState({})
  const [smartPayments, setSmartPayments] = useState({}) // For smart payment allocation
  const [processingPayments, setProcessingPayments] = useState({})
  const { showToast } = useToast()
  const company = getUserData()?.company_info?.company_name
  const phone_no = getUserData()?.company_info?.phone_no
  const { t, i18n } = useTranslation('global')
  const lng = i18n.language

  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const handleSort = (key) => {
  let direction = 'asc'
  if (sortConfig.key === key && sortConfig.direction === 'asc') {
    direction = 'desc'
  }
  setSortConfig({ key, direction })
}

const exportToPDF = () => {
  const totalAmount = filteredReport.reduce((sum, c) => sum + Math.abs(c.totalPayment), 0);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #2980b9;
          margin-bottom: 10px;
        }
        .summary {
          background-color: #f8f9fa;
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 20px;
        }
        .summary p {
          margin: 5px 0;
          font-size: 14px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th {
          background-color: #2980b9;
          color: white;
          padding: 12px;
          text-align: left;
          font-weight: bold;
        }
        td {
          padding: 10px;
          border-bottom: 1px solid #ddd;
        }
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        tr:hover {
          background-color: #f5f5f5;
        }
        .amount {
          text-align: right;
          font-weight: bold;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Credit Report</h1>
        <p>Generated on ${new Date().toLocaleDateString()}</p>
      </div>
      
      <div class="summary">
        <p><strong>Total Customers:</strong> ${filteredReport.length}</p>
        <p><strong>Total Due Amount:</strong> Rs.${totalAmount.toFixed(2)}</p>
      </div>

      <table>
        <thead>
          <tr>
            <th>Sr No.</th>
            <th>Name</th>
            <th>Mobile</th>
            <th>Due Amount</th>
          </tr>
        </thead>
        <tbody>
          ${filteredReport.map((customer, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${customer.name}</td>
              <td>${customer.mobile}</td>
              <td class="amount">Rs.${Math.abs(customer.totalPayment).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="footer">
        <p>This report was generated automatically</p>
      </div>
    </body>
    </html>
  `;

  const options = {
    margin: 1,
    filename: 'credit_report.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2,
      useCORS: true,
      letterRendering: true,
      allowTaint: true
    },
    jsPDF: { 
      unit: 'in', 
      format: 'a4', 
      orientation: 'portrait' 
    }
  };

  html2pdf().set(options).from(htmlContent).save();
};



  useEffect(() => {
    const fetchReport = async () => {
      try {
        const reportData = await getAPICall('/api/creditReport')
        if (reportData) {
          const filteredData = reportData
            .filter(
              (r) =>
                r.totalPayment < 0 && // ✅ only negative balances
                (r.totalPayment !== 0 || r.items?.some((i) => i.quantity > 0))
            )
            .sort((c1, c2) => c1.name.localeCompare(c2.name))

          setReport(filteredData)
          setFilteredReport(filteredData)
        }
      } catch (error) {
        showToast('danger', 'Error occurred ' + error)
      }
    }

    fetchReport()
  }, [])

  const onSearchChange = (searchTerm) => {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      if (searchTerm?.length > 0) {
        setFilteredReport(
          report.filter((r) =>
            r.name.toLowerCase().includes(searchTerm.toLowerCase()),
          ),
        )
      } else {
        setFilteredReport(report)
      }
    }, debounceDelay)
  }

  // Fetch unpaid orders for a specific customer
 const fetchCustomerOrders = async (customerId) => {
  if (customerOrders[customerId]) {
    return // Already fetched
  }

  setLoadingOrders(prev => ({ ...prev, [customerId]: true }))
  
  try {
    const orders = await getAPICall(`/api/customer/${customerId}/unpaid-orders`)
    if (orders) {
  const filteredOrders = orders.filter((o) => o.orderStatus === 1 || o.orderStatus === 2)

  const sortedOrders = filteredOrders.sort((a, b) => {
    const dateA = new Date(a.deliveryDate || a.createdAt || 0)
    const dateB = new Date(b.deliveryDate || b.createdAt || 0)
    return dateB - dateA
  })

      setCustomerOrders(prev => ({
        ...prev,
        [customerId]: sortedOrders
      }))
      
      // Initialize payment amounts for each order
      const initialPayments = {}
      sortedOrders.forEach(order => {
        initialPayments[order.id] = ''
      })
      setOrderPayments(prev => ({
        ...prev,
        [customerId]: initialPayments
      }))
    }
  } catch (error) {
    showToast('danger', `Error fetching orders: ${error.message}`)
  } finally {
    setLoadingOrders(prev => ({ ...prev, [customerId]: false }))
  }
}

  // Handle row expansion
  const handleRowToggle = async (customerId) => {
    const isExpanding = !expandedRows[customerId]
    
    setExpandedRows(prev => ({
      ...prev,
      [customerId]: isExpanding
    }))

    if (isExpanding) {
      await fetchCustomerOrders(customerId)
    }
  }

  // Handle order payment input change
const handleOrderPaymentChange = (customerId, orderId, value) => {
  // Allow blank, digits, and decimal
  if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
    setOrderPayments(prev => ({
      ...prev,
      [customerId]: {
        ...prev[customerId],
        [orderId]: value
      }
    }))
  }
}


  // Handle smart payment input change
  const handleSmartPaymentChange = (customerId, value) => {
    setSmartPayments(prev => ({
      ...prev,
      [customerId]: value
    }))
  }

  

  // Handle individual order payment submission
 const handleOrderPaymentSubmit = async (customerId, orderId) => {
  if (processingPayments[orderId]) return; // ⛔ Prevent double-click

  const paymentAmount = parseFloat(orderPayments[customerId]?.[orderId] || 0);
  const orders = customerOrders[customerId] || [];
  const order = orders.find(o => o.id === orderId);

  if (!order) return;

  if (isNaN(paymentAmount) || paymentAmount <= 0) {
    showToast('warning', t('TOAST.invalid_amount'));
    return;
  }

  const due = parseFloat(order.unpaidAmount.toFixed(2));
  const entered = parseFloat(paymentAmount.toFixed(2));
  if (entered - due > 0.01) {
    showToast('warning', t('TOAST.invalid_payment_amount'));
    return;
  }

  setProcessingPayments(prev => ({ ...prev, [orderId]: true }));

  try {
    const response = await put(`/api/orders/${orderId}/payment`, {
      paymentAmount,
    });

    if (response && response.success) {
      showToast('success', t('TOAST.payment_updated'));

      // Update the order locally
      setCustomerOrders(prev => ({
        ...prev,
        [customerId]: prev[customerId].map(o =>
          o.id === orderId
            ? {
                ...o,
                unpaidAmount: o.unpaidAmount - paymentAmount,
                paidAmount: o.paidAmount + paymentAmount,
              }
            : o
        ),
      }));

      // Clear the input
      setOrderPayments(prev => ({
        ...prev,
        [customerId]: {
          ...prev[customerId],
          [orderId]: '',
        },
      }));

      // Update report
      updateMainReport(customerId, paymentAmount);
    }
  } catch (error) {
    showToast('danger', `${t('TOAST.error_occurred')}: ${error.message}`);
  } finally {
    setProcessingPayments(prev => ({ ...prev, [orderId]: false }));
  }
};




  // Update main report after payment
  const updateMainReport = (customerId, paymentAmount) => {
    const updatedReport = report.map((r) => {
      if (r.customerId === customerId) {
        return {
          ...r,
          totalPayment: r.totalPayment + paymentAmount,
        }
      }
      return r
    })

    setReport(updatedReport)
    setFilteredReport(
      updatedReport.filter((r) =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    )
  }

  const handleReturnMoneyChange = (e, customerId) => {
    const { value } = e.target
    setReturnMoney((prevState) => ({
      ...prevState,
      [customerId]: value,
    }))
  }

  const handleReturnMoneySubmit = async (customerId) => {
    const returnAmount = parseFloat(returnMoney[customerId] || 0)
    const customer = report.find((r) => r.customerId === customerId)
  
    if (!customer) return
  
    if (isNaN(returnAmount) || returnAmount <= 0) {
      showToast('warning', 'Invalid return amount')
      return
    }
  
    if (returnAmount > -customer.totalPayment) {
      showToast('warning', 'Amount cannot be greater than due')
      return
    }
  
    try {
      const updatedData = await put(`/api/paymentTracker/${customerId}`, {
        returnAmount: -returnAmount,
      })
  
      if (updatedData) {
        showToast('success', 'Payment updated successfully')
        updateMainReport(customerId, returnAmount)
  
        setReturnMoney((prevState) => ({
          ...prevState,
          [customerId]: '',
        }))
      }
    } catch (error) {
      showToast('danger', 'Error occurred: ' + error.message)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      const options = { day: 'numeric', month: 'short', year: 'numeric' }
      const date = new Date(dateString)
      const formattedDate = date.toLocaleDateString('en-US', options).replace(',', '')
      
      const [month, day, year] = formattedDate.split(' ')
      return `${day} ${month} ${year}`
    } catch (error) {
      return 'N/A'
    }
  }

  function convertTo12HourFormat(time) {
    if (!time) return 'N/A'
    try {
      let [hours, minutes] = time.split(':').map(Number)
      const suffix = hours >= 12 ? 'PM' : 'AM'
      hours = hours % 12 || 12
      return `${hours}:${minutes.toString().padStart(2, '0')} ${suffix}`
    } catch (error) {
      return 'N/A'
    }
  }

  const sortedFilteredReport = React.useMemo(() => {
  if (!sortConfig.key) return filteredReport

  return [...filteredReport].sort((a, b) => {
    let aVal = a[sortConfig.key]
    let bVal = b[sortConfig.key]

    if (sortConfig.key === 'name' || sortConfig.key === 'customerId') {
      aVal = aVal?.toString().toLowerCase() || ''
      bVal = bVal?.toString().toLowerCase() || ''
      return sortConfig.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
    } else if (sortConfig.key === 'totalPayment') {
      return sortConfig.direction === 'asc'
        ? (aVal || 0) - (bVal || 0)
        : (bVal || 0) - (aVal || 0)
    }

    return 0
  })
}, [filteredReport, sortConfig])

const getSortIcon = (columnKey) => {
  if (sortConfig.key === columnKey) {
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  }
  return '↕'; // Always show this icon when column is not actively sorted
};

const getSortIconStyle = (columnKey) => ({
  marginLeft: '8px',
  fontSize: '18px',
  opacity: sortConfig.key === columnKey ? 1 : 0.5,
  color: sortConfig.key === columnKey ? '#0d6efd' : '#6c757d',
  transition: 'all 0.2s ease'
});


const renderMobileCard = (customer, index) => {
  const isExpanded = expandedRows[customer.customerId];
  const orders = customerOrders[customer.customerId] || [];
  const isLoadingOrders = loadingOrders[customer.customerId];

  // ✅ Sort orders descending by order id
  const sortedOrders = [...orders].sort((a, b) => b.id - a.id);

  return (
    <CCard
      key={customer.customerId + '_' + index}
      className="mb-1 credit-card"
      style={{ cursor: 'pointer' }}
    >
      <CCardBody>
        {/* First Row: Customer Name with Balance and Contact Icons */}
        <div className="card-row-1">
          <div className="customer-name-section">
            <div className="customer-name">{customer.name}</div>
          </div>
          <div className="contact-icons">
            <a
              className="contact-btn call-btn"
              href={'tel:+91' + customer.mobile.replace(/^(\+91)?/, '')}
              title="Call"
              onClick={(e) => e.stopPropagation()}
            >
              <CIcon icon={cilPhone} size="sm" />
            </a>
            <a
              className="contact-btn sms-btn"
              href={`sms:+91${customer.mobile.replace(/^(\+91)?/, '')}?body=${
                customer.totalPayment < 0
                  ? `${t('sms.sms_part_1')} ${Math.abs(customer.totalPayment).toFixed(2)} ${t('sms.sms_part_2')} ${t('sms.sms_part_3')} ${company} (${phone_no})`
                  : `${t('sms.clear_message')} ${t('sms.sms_part_3')} ${company} (${phone_no})`
              }`}
              title="SMS"
              onClick={(e) => e.stopPropagation()}
            >
              <CIcon icon={cilChatBubble} size="sm" />
            </a>
          </div>
        </div>

        {/* Second Row: Amount Badge and Expand Arrow */}
        <div className="card-row-2" onClick={() => handleRowToggle(customer.customerId)}>
          <div className="amount-badge-section">
            <CBadge color="danger" className="amount-badge">
              ₹{Math.abs(customer.totalPayment).toFixed(2)}
            </CBadge>
          </div>
          <div className="expand-arrow">
            <CIcon icon={isExpanded ? cilArrowCircleTop : cilArrowCircleBottom} />
          </div>
        </div>

        {/* Expandable Details */}
        {isExpanded && (
          <div className="expanded-details">
            <h6 className="mb-2">{t('LABELS.unpaid_orders')}</h6>

            {isLoadingOrders ? (
              <div className="text-center py-3">
                <CSpinner size="sm" />
                <span className="ms-2">{t('LABELS.loading')}...</span>
              </div>
            ) : sortedOrders.length > 0 ? (
              <div className="orders-list">
                {sortedOrders.map((order) => (
                  <div key={order.id} className="order-item">
                    <div className="order-header">
                      <span className="order-id">Order {order.id}</span>
                      <span className="order-date">{formatDate(order.deliveryDate)}</span>
                    </div>
                    <div className="order-amounts">
                      <div className="amount-row">
                        <span>{t('LABELS.total')}:</span>
                        <span>₹{order.finalAmount?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="amount-row">
                        <span>{t('LABELS.paid')}:</span>
                        <span className="amount-paid">₹{order.paidAmount?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="amount-row">
                        <span>{t('LABELS.due')}:</span>
                        <span className="amount-due">₹{order.unpaidAmount?.toFixed(2) || '0.00'}</span>
                      </div>
                    </div>
                    <div className="payment-input-section" onClick={(e) => e.stopPropagation()}>
                      <CFormInput
                        type="number"
                        step="0.01"
                        placeholder="Payment amount"
                        value={orderPayments[customer.customerId]?.[order.id] ?? ''}
                        onChange={(e) =>
                          handleOrderPaymentChange(customer.customerId, order.id, e.target.value)
                        }
                        onWheel={(e) => e.target.blur()}
                        onKeyDown={(e) => {
                          if (e.key === '-' || e.key === 'e') {
                            e.preventDefault();
                          }
                        }}
                        className="payment-input"
                        max={order.unpaidAmount}
                      />
                      <CButton
                        size="sm"
                        color="primary"
                        onClick={() =>
                          handleOrderPaymentSubmit(customer.customerId, order.id)
                        }
                        disabled={
                          !orderPayments[customer.customerId]?.[order.id] ||
                          parseFloat(orderPayments[customer.customerId]?.[order.id]) <= 0 ||
                          processingPayments[order.id]
                        }
                        className="pay-button"
                      >
                        {processingPayments[order.id] ? (
                          <CSpinner size="sm" />
                        ) : (
                          t('LABELS.pay')
                        )}
                      </CButton>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-3 text-muted">
                {t('LABELS.no_unpaid_orders')}
              </div>
            )}
          </div>
        )}
      </CCardBody>
    </CCard>
  );
};

const mobileCardStyles = `
<style>
/* Credit Report Mobile Card Styles */
.credit-card {
  border: 1px solid #dee2e6;
  border-radius: 3px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  overflow: hidden;
  margin-bottom: 12px;
}

.credit-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.credit-card .card-body {
  padding: 10px !important;
}

/* Card Row 1: Customer name and contact icons */
.card-row-1 {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.customer-name-section {
  flex: 1;
}

.customer-name {
  font-weight: 600;
  font-size: 1.1em;
  color: #333;
  margin-bottom: 4px;
}

.customer-id {
  font-size: 0.85em;
  color: #666;
}

.contact-icons {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.contact-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
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

/* Card Row 2: Amount badge and expand arrow */
.card-row-2 {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: px;
  cursor: pointer;
  padding: 8px 0;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
}

.amount-badge-section {
  flex: 1;
}

.amount-badge {
  font-size: 1em;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
}

.expand-arrow {
  color: #007bff;
  transition: transform 0.3s ease;
  padding: 4px;
}

.expand-arrow:hover {
  transform: scale(1.1);
}

/* Expandable Details */
.expanded-details {
  margin-top: 5px;
  padding: 5px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.orders-list {
  max-height: 400px;
  overflow-y: auto;
}

.order-item {
  background: white;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-weight: 600;
}

.order-id {
  color: #007bff;
  font-size: 0.9em;
}

.order-date {
  color: #666;
  font-size: 0.85em;
}

.order-amounts {
  margin-bottom: 12px;
}

.amount-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
  font-size: 0.9em;
}

.amount-paid {
  color: #28a745;
}

.amount-due {
  color: #dc3545;
  font-weight: 600;
}

.payment-input-section {
  display: flex;
  gap: 8px;
  align-items: center;
}

.payment-input {
  flex: 1;
  font-size: 0.9em;
}

.pay-button {
  min-width: 60px;
}

/* Desktop Styles - Updated to match image layout */
.desktop-customer-row {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.desktop-customer-row:hover {
  background-color: #f8f9fa;
}

.desktop-expanded-section {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  margin: 0;
}

.desktop-expanded-content {
  padding: 20px;
}

.desktop-orders-section h6 {
  margin-bottom: 15px;
  color: #333;
  font-weight: 600;
}

.desktop-orders-table {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.desktop-orders-table .table {
  margin-bottom: 0;
}

.desktop-orders-table thead th {
  background-color: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
  font-weight: 600;
  color: #495057;
  font-size: 0.9em;
  padding: 12px 8px;
}

.desktop-orders-table tbody td {
  padding: 12px 8px;
  vertical-align: middle;
  border-top: 1px solid #e9ecef;
}

.desktop-order-id {
  color: #007bff;
  font-weight: 600;
}

.desktop-order-date {
  color: #666;
  font-size: 0.9em;
}

.desktop-amount {
  font-weight: 600;
}

.desktop-amount-paid {
  color: #28a745;
  font-weight: 600;
}

.desktop-amount-due {
  color: #dc3545;
  font-weight: 600;
}

.desktop-payment-section {
  display: flex;
  gap: 8px;
  align-items: center;
}

.desktop-payment-input {
  width: 100px;
  font-size: 0.9em;
}

.desktop-pay-button {
  min-width: 60px;
  font-size: 0.9em;
}

.expand-icon {
  transition: transform 0.3s ease;
  cursor: pointer;
  color: #007bff;
}

.expand-icon:hover {
  transform: scale(1.1);
}

/* Mobile Cards Container */
.mobile-cards-container {
  padding: 0 4px;
}

/* Responsive breakpoints */
@media (max-width: 767.98px) {
  .desktop-table {
    display: none !important;
  }
  
  .mobile-cards {
    display: block !important;
  }
}

@media (min-width: 768px) {
  .desktop-table {
    display: block !important;
  }
  
  .mobile-cards {
    display: none !important;
  }
}
</style>
`;
  
// Calculate grand total
const grandTotal = filteredReport.reduce((sum, p) => sum + p.totalPayment, 0)

return (
  <CRow>
    <CCol xs={12} style={{ padding: '2px' }}>
      <CCard className="mb-4">
        <CCardHeader>
          <strong>{t('LABELS.credit_report')}</strong>
        </CCardHeader>
        <CCardBody>
          {/* Add the CSS */}
          <div dangerouslySetInnerHTML={{ __html: mobileCardStyles }} />
          
          {/* Summary Card */}
          <CCard className="mb-3 border-danger">
            <CCardBody className="p-3">
              <CRow className="align-items-center">
                <CCol xs={6}>
                  <h5 className="mb-0 text-danger">
                    {t('LABELS.total_outstanding')}
                  </h5>
                </CCol>
                <CCol xs={6} className="text-end">
                  <h4 className="mb-0">
                    {grandTotal < 0 ? (
                      <CBadge color="danger" className="fs-6 p-2">
                        ₹{Math.abs(grandTotal).toFixed(2)}
                      </CBadge>
                    ) : (
                      <span className="text-success">₹0.00</span>
                    )}
                  </h4>
                </CCol>
              </CRow>
              <CRow className="mt-2">
                <CCol xs={6}>
                  <small className="text-muted">
                    {t('LABELS.total_customers')}: {filteredReport.length}
                  </small>
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>

          <CForm className="d-flex justify-content-between mb-3">
  <CFormInput
    type="text"
    placeholder={t('LABELS.search')}
    value={searchTerm}
    onChange={(e) => {
      setSearchTerm(e.target.value)
      onSearchChange(e.target.value)
      e.preventDefault()
    }}
    className="me-2"
  />
  <div>
    {/* <CButton color="success" size="sm" onClick={exportToCSV}>
      Export CSV
    </CButton> */}
    <CButton color="success" size="sm" className="ms-2" onClick={exportToPDF}>
      Export PDF
    </CButton>
  </div>
</CForm>


          {/* Mobile Card View */}
          <div className="mobile-cards d-md-none">
            <div className="mobile-cards-container">
              {filteredReport.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  No customers with outstanding balance found
                </div>
              ) : (
                filteredReport.map((customer, index) => renderMobileCard(customer, index))
              )}
            </div>
          </div>

          {/* Desktop Table View - Updated to match image layout */}
          <div className="desktop-table d-none d-md-block">
            <div 
              className="table-responsive" 
              style={{ 
                height: '450px', 
                overflowY: 'auto',
                border: '1px solid #dee2e6',
                borderRadius: '0.375rem'
              }}
            >
              <CTable className="mb-0" style={{ position: 'relative' }}>
                <CTableHead 
                  style={{ 
                    position: 'sticky', 
                    top: 0, 
                    zIndex: 10,
                    backgroundColor: '#f8f9fa',
                    borderBottom: '2px solid #dee2e6'
                  }}
                >
                  <CTableRow>
                    <CTableHeaderCell
  scope="col"
  onClick={() => handleSort('name')}
  style={{ cursor: 'pointer' }}
>
  {t('LABELS.name')}
  <span style={getSortIconStyle('name')}>
              {getSortIcon('name')}
            </span>
</CTableHeaderCell>

<CTableHeaderCell
  scope="col"
  onClick={() => handleSort('totalPayment')}
  style={{ cursor: 'pointer' }}
>
  {t('LABELS.total')}
  <span style={getSortIconStyle('totalPayment')}>
              {getSortIcon('totalPayment')}
            </span>
</CTableHeaderCell>

                    <CTableHeaderCell scope="col">{t('LABELS.actions')}</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {sortedFilteredReport.map((customer, customerIndex) => {
                    const isExpanded = expandedRows[customer.customerId]
                    const orders = customerOrders[customer.customerId] || []
                    const isLoadingOrders = loadingOrders[customer.customerId]

                    return (
                      <React.Fragment key={customer.customerId}>
                        {/* Customer Row */}
                        <CTableRow 
                          className="desktop-customer-row"
                          onClick={() => handleRowToggle(customer.customerId)}
                        >
                          <CTableDataCell>
                            <div className="d-flex align-items-center">
                              <CIcon 
                                icon={isExpanded ? cilArrowCircleTop : cilArrowCircleBottom} 
                                className="me-2 expand-icon" 
                                size="lg"
                              />
                              <span>{customer.name}</span>
                            </div>
                          </CTableDataCell>
                          
                          <CTableDataCell>
                            {customer.totalPayment < 0 ? (
                              <CBadge color="danger" className="fs-6 px-3 py-2">
                                {Math.abs(customer.totalPayment).toFixed(2)}
                              </CBadge>
                            ) : (
                              <span className="text-success fw-bold">
                                ₹{Math.abs(customer.totalPayment).toFixed(2)}
                              </span>
                            )}
                          </CTableDataCell>
                          <CTableDataCell onClick={(e) => e.stopPropagation()}>
                            <a
                              className="btn btn-outline-primary btn-sm me-2"
                              href={'tel:+91' + customer.mobile.replace(/^(\+91)?/, '')}
                              title="Call"
                            >
                              <CIcon icon={cilPhone} />
                            </a>
                            <a
                              className="btn btn-outline-success btn-sm"
                              href={`sms:+91${customer.mobile.replace(/^(\+91)?/, '')}?body=${
                                customer.totalPayment < 0
                                  ? `${t('sms.sms_part_1')} ${Math.abs(customer.totalPayment).toFixed(2)} ${t('sms.sms_part_2')} ${t('sms.sms_part_3')} ${company} (${phone_no})`
                                  : `${t('sms.clear_message')} ${t('sms.sms_part_3')} ${company} (${phone_no})`
                              }`}
                              title="SMS"
                            >
                              <CIcon icon={cilChatBubble} />
                            </a>
                          </CTableDataCell>
                        </CTableRow>

                        {/* Expanded Orders Section */}
                        {isExpanded && (
                          <CTableRow>
                            <CTableDataCell colSpan={4} className="desktop-expanded-section p-0">
                              <div className="desktop-expanded-content">
                                <div className="desktop-orders-section">
                                  <h6>Unpaid Orders</h6>
                                  
                                  {isLoadingOrders ? (
                                    <div className="text-center py-4">
                                      <CSpinner size="sm" />
                                      <span className="ms-2">{t('LABELS.loading')}...</span>
                                    </div>
                                  ) : orders.length > 0 ? (
                                    <div className="desktop-orders-table">
                                      <CTable>
                                        <CTableHead>
                                          <CTableRow>
                                            <CTableHeaderCell>Order ID</CTableHeaderCell>
                                            <CTableHeaderCell>Date</CTableHeaderCell>
                                            <CTableHeaderCell>Total Amount</CTableHeaderCell>
                                            <CTableHeaderCell>Paid Amount</CTableHeaderCell>
                                            <CTableHeaderCell>Unpaid Amount</CTableHeaderCell>
                                            <CTableHeaderCell>Return</CTableHeaderCell>
                                          </CTableRow>
                                        </CTableHead>
                                        <CTableBody>
                                          {orders.map(order => (
                                            <CTableRow key={order.id}>
                                              <CTableDataCell className="desktop-order-id">
                                                {order.id}
                                              </CTableDataCell>
                                              <CTableDataCell className="desktop-order-date">
                                                {formatDate(order.deliveryDate)}
                                              </CTableDataCell>
                                              <CTableDataCell className="desktop-amount">
                                                ₹{order.finalAmount?.toFixed(2) || '0.00'}
                                              </CTableDataCell>
                                              <CTableDataCell className="desktop-amount-paid">
                                                ₹{order.paidAmount?.toFixed(2) || '0.00'}
                                              </CTableDataCell>
                                              <CTableDataCell>
                                                <CBadge color="danger" className="px-3 py-2">
                                                  ₹{order.unpaidAmount?.toFixed(2) || '0.00'}
                                                </CBadge>
                                              </CTableDataCell>
                                              <CTableDataCell onClick={(e) => e.stopPropagation()}>
                                                <div className="desktop-payment-section">
                                                  <CFormInput
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="Amount"
                                                    value={orderPayments[customer.customerId]?.[order.id] ?? ''}
                                                    onChange={(e) => handleOrderPaymentChange(customer.customerId, order.id, e.target.value)}
                                                    onWheel={(e) => e.target.blur()}
                                                    onKeyDown={(e) => {
                                                      if (e.key === '-' || e.key === 'e') {
                                                        e.preventDefault()
                                                      }
                                                    }}
                                                    className="desktop-payment-input"
                                                    max={order.unpaidAmount}
                                                  />
                                                  <CButton
                                                    size="sm"
                                                    color="primary"
                                                    onClick={() => handleOrderPaymentSubmit(customer.customerId, order.id)}
                                                    disabled={!orderPayments[customer.customerId]?.[order.id] || parseFloat(orderPayments[customer.customerId]?.[order.id]) <= 0 || processingPayments[order.id]}
                                                    className="desktop-pay-button"
                                                  >
                                                    {processingPayments[order.id] ? <CSpinner size="sm" /> : t('LABELS.pay')}
                                                  </CButton>
                                                </div>
                                              </CTableDataCell>
                                            </CTableRow>
                                          ))}
                                        </CTableBody>
                                      </CTable>
                                    </div>
                                  ) : (
                                    <div className="text-center py-4 text-muted">
                                      {t('LABELS.no_unpaid_orders')}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CTableDataCell>
                          </CTableRow>
                        )}
                      </React.Fragment>
                    )
                  })}
                </CTableBody>
              </CTable>
            </div>
          </div>
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>
);
}

export default CreditReport;