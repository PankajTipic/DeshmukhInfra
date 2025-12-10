import React, { useState, useEffect } from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CRow,
  CCol,
  CSpinner,
  CAlert,
  CBadge,
  CCollapse,
} from '@coreui/react'
import { getAPICall } from '../../../util/api'
import { cilX, cilHistory, cilCalendar, cilCreditCard, cilPencil, cilEyedropper, cilChevronBottom, cilChevronTop, cilNotes } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import RecordPaymentModal from './RecordPaymentModal'
import { useNavigate } from 'react-router-dom'

// Helper function to format numbers in Indian numeric system
const formatIndianNumber = (number) => {
  return new Intl.NumberFormat('en-IN', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  }).format(number)
}

const CombinedPaymentModal = ({ 
  visible, 
  onClose, 
  incomeData, 
  onPaymentUpdated 
}) => {
  const navigate = useNavigate()
  
  // Proforma invoice states
  const [proformaInvoices, setProformaInvoices] = useState([])
  const [logLoading, setLogLoading] = useState(false)
  const [logError, setLogError] = useState('')
  
  // Collapsible states - track which proforma invoices have payments expanded
  const [expandedPayments, setExpandedPayments] = useState({})
  
  // Edit modal states
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedPaymentData, setSelectedPaymentData] = useState(null)

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    } catch (error) {
      return 'N/A'
    }
  }

  // Reset when modal closes
  useEffect(() => {
    if (!visible) {
      setLogError('')
      setProformaInvoices([])
      setExpandedPayments({})
    } else if (visible && incomeData) {
      fetchProformaInvoices()
    }
  }, [visible, incomeData])

  const fetchProformaInvoices = async () => {
    if (!incomeData) return
    
    setLogLoading(true)
    setLogError('')
    
    try {
      const workOrderId = incomeData.workOrderId || incomeData.id
      const response = await getAPICall(`/api/proforma-invoices?work_order_id=${workOrderId}`)
      
      if (response && response.success && response.data) {
        // Handle paginated response
        const invoices = response.data.data || response.data
        
        if (Array.isArray(invoices)) {
          setProformaInvoices(invoices)
        } else {
          setProformaInvoices([])
          setLogError('Invalid data format received')
        }
      } else {
        setProformaInvoices([])
        setLogError('No proforma invoices found for this work order')
      }
    } catch (error) {
      console.error('Error fetching proforma invoices:', error)
      setProformaInvoices([])
      setLogError('Failed to load proforma invoices')
    } finally {
      setLogLoading(false)
    }
  }

  const togglePaymentExpand = (proformaId) => {
    setExpandedPayments(prev => ({
      ...prev,
      [proformaId]: !prev[proformaId]
    }))
  }

  const handleRecordPayment = (proformaInvoice) => {
    setSelectedPaymentData({
      id: proformaInvoice.id,
      proforma_invoice_id: proformaInvoice.id,
      invoice_number: proformaInvoice.proforma_invoice_number,
      project_name: proformaInvoice.project?.project_name,
      finalAmount: proformaInvoice.final_amount,
      paidAmount: proformaInvoice.paid_amount,
      isProformaInvoice: true,
    })
    setShowEditModal(true)
  }

  const handleEditPayment = (income, proformaInvoice) => {
    setSelectedPaymentData({
      incomeId: income.id,
      originalIncomeId: income.id,
      proforma_invoice_id: proformaInvoice.id,
      id: proformaInvoice.id,
      received_amount: income.received_amount,
      received_by: income.received_by,
      payment_type: income.payment_type,
      senders_bank: income.senders_bank,
      receivers_bank: income.receivers_bank,
      remark: income.remark,
      payment_date: income.payment_date || income.invoice_date || income.created_at,
      invoice_number: proformaInvoice.proforma_invoice_number,
      project_name: proformaInvoice.project?.project_name,
      finalAmount: proformaInvoice.final_amount,
      totalAmount: proformaInvoice.final_amount,
      paidAmount: income.received_amount,
      isProformaInvoice: true,
      isEdit: true
    })
    setShowEditModal(true)
  }

  const handleEditProformaInvoice = (proformaId) => {
    navigate(`/edit-proforma-invoice/${proformaId}`)
    onClose() // Close the modal when navigating
  }

  const handlePaymentRecorded = () => {
    fetchProformaInvoices()
    
    if (onPaymentUpdated) {
      onPaymentUpdated(incomeData.workOrderId || incomeData.id)
    }
    
    setShowEditModal(false)
    setSelectedPaymentData(null)
  }

  const getPaymentStatusColor = (paymentStatus) => {
    switch (paymentStatus) {
      case 'paid': return 'success'
      case 'partial': return 'warning'
      case 'pending': return 'danger'
      default: return 'secondary'
    }
  }

  const calculateWorkOrderSummary = () => {
    const workOrderTotal = incomeData.workOrder?.finalAmount || 
                          incomeData.workOrder?.totalAmount || 0
    const projectValuation = incomeData.workOrder?.project?.project_cost || 0
    const totalBilled = proformaInvoices.reduce((sum, pi) => sum + parseFloat(pi.final_amount || 0), 0)
    const totalReceived = proformaInvoices.reduce((sum, pi) => sum + parseFloat(pi.paid_amount || 0), 0)
    const totalPending = proformaInvoices.reduce((sum, pi) => sum + parseFloat(pi.pending_amount || 0), 0)
    const remainingToBill = workOrderTotal - totalBilled
    
    return {
      workOrderTotal,
      projectValuation,
      totalBilled,
      totalReceived,
      totalPending,
      remainingToBill,
      invoiceCount: proformaInvoices.length
    }
  }

  if (!incomeData) return null

  const summary = calculateWorkOrderSummary()

  return (
    <>
      <CModal 
        visible={visible} 
        onClose={onClose}
        size="xl"
        backdrop="static"
        keyboard={false}
      >
        <CModalHeader>
          <CModalTitle>
            <CIcon icon={cilHistory} className="me-2" />
            Proforma Invoices - Work Order #{incomeData.workOrder?.invoice_number || incomeData.id}
          </CModalTitle>
        </CModalHeader>
        
        <CModalBody>
          {/* Work Order Summary */}
          <div className="bg-light p-3 rounded mb-4">
            <h6 className="mb-3">Work Order Summary</h6>
            <CRow>
              <CCol lg={3} md={6} sm={6} xs={6} className="mb-2">
                <small className="text-muted d-block">Project:</small>
                <div><strong>{incomeData.workOrder?.project?.project_name || 'N/A'}</strong></div>
              </CCol>
              <CCol lg={3} md={6} sm={6} xs={6} className="mb-2">
                <small className="text-muted d-block">Work Order #:</small>
                <div><strong>{incomeData.workOrder?.invoice_number || 'N/A'}</strong></div>
              </CCol>
              <CCol lg={3} md={6} sm={6} xs={6} className="mb-2">
                <small className="text-muted d-block">Customer:</small>
                <div><strong>{incomeData.workOrder?.project?.customer_name || 'N/A'}</strong></div>
              </CCol>
              <CCol lg={3} md={6} sm={6} xs={6} className="mb-2">
                <small className="text-muted d-block">Total Proforma Invoices:</small>
                <div><strong>{summary.invoiceCount}</strong></div>
              </CCol>
            </CRow>
            
            <hr className="my-3" />
            
            {/* Financial Summary Cards */}
            <CRow>
              <CCol lg={3} md={6} sm={6} xs={6} className="mb-2">
                <div className="text-center p-2 bg-info bg-opacity-10 rounded">
                  <small className="text-muted d-block">Project Valuation</small>
                  <div className="h6 text-info mb-0">₹{formatIndianNumber(summary.projectValuation)}</div>
                </div>
              </CCol>
              <CCol lg={3} md={6} sm={6} xs={6} className="mb-2">
                <div className="text-center p-2 bg-secondary bg-opacity-10 rounded">
                  <small className="text-muted d-block">Work Order Total</small>
                  <div className="h6 text-secondary mb-0">₹{formatIndianNumber(summary.workOrderTotal)}</div>
                </div>
              </CCol>
              <CCol lg={3} md={6} sm={6} xs={6} className="mb-2">
                <div className="text-center p-2 bg-primary bg-opacity-10 rounded">
                  <small className="text-muted d-block">Total Billed (PI)</small>
                  <div className="h6 text-primary mb-0">₹{formatIndianNumber(summary.totalBilled)}</div>
                </div>
              </CCol>
              <CCol lg={3} md={6} sm={6} xs={6} className="mb-2">
                <div className="text-center p-2 bg-warning bg-opacity-10 rounded">
                  <small className="text-muted d-block">Remaining to Bill</small>
                  <div className="h6 text-warning mb-0">₹{formatIndianNumber(summary.remainingToBill)}</div>
                </div>
              </CCol>
            </CRow>

            <hr className="my-3" />

            <CRow>
              <CCol lg={4} md={6} sm={6} xs={6} className="mb-2">
                <div className="text-center p-2 bg-success bg-opacity-10 rounded">
                  <small className="text-muted d-block">Total Received</small>
                  <div className="h6 text-success mb-0">₹{formatIndianNumber(summary.totalReceived)}</div>
                </div>
              </CCol>
              <CCol lg={4} md={6} sm={6} xs={6} className="mb-2">
                <div className="text-center p-2 bg-danger bg-opacity-10 rounded">
                  <small className="text-muted d-block">Total Pending</small>
                  <div className="h6 text-danger mb-0">₹{formatIndianNumber(summary.totalPending)}</div>
                </div>
              </CCol>
              <CCol lg={4} md={6} sm={12} xs={12} className="mb-2">
                <div className="text-center p-2 bg-primary bg-opacity-10 rounded">
                  <small className="text-muted d-block">Payment Progress</small>
                  <div className="h6 text-primary mb-0">
                    {summary.totalBilled > 0 ? ((summary.totalReceived / summary.totalBilled) * 100).toFixed(1) : 0}%
                  </div>
                </div>
              </CCol>
            </CRow>
          </div>

          {/* Proforma Invoices List */}
          <div className="mb-3">
            <h6>Proforma Invoices</h6>
          </div>
          
          {logError && (
            <CAlert color="warning" dismissible onClose={() => setLogError('')}>
              {logError}
            </CAlert>
          )}

          {logLoading ? (
            <div className="text-center py-4">
              <CSpinner />
              <div className="mt-2">Loading proforma invoices...</div>
            </div>
          ) : proformaInvoices.length > 0 ? (
            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {proformaInvoices.map((proforma, index) => (
                <div key={proforma.id} className="card mb-3 border">
                  <div className="card-body p-3">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <h6 className="mb-1">
                          <strong>Proforma Invoice: {proforma.proforma_invoice_number}</strong>
                        </h6>
                        {proforma.tally_invoice_number && (
                          <small className="text-muted">Tally #: {proforma.tally_invoice_number}</small>
                        )}
                        <div className="small text-muted mt-1">
                          <CIcon icon={cilCalendar} className="me-1" />
                          {formatDate(proforma.invoice_date)}
                        </div>
                      </div>
                      <div className="d-flex gap-1 align-items-start flex-wrap">
                        <CBadge color={getPaymentStatusColor(proforma.payment_status)}>
                          {proforma.payment_status?.toUpperCase()}
                        </CBadge>
                        <CButton
                          color="info"
                          size="sm"
                          onClick={() => navigate(`/proforma-invoice-details/${proforma.id}`)}
                          title="View Details"
                        >
                          <CIcon icon={cilEyedropper} />
                        </CButton>
                        <CButton
                          color="warning"
                          size="sm"
                          onClick={() => handleEditProformaInvoice(proforma.id)}
                          title="Edit Proforma Invoice"
                        >
                          <CIcon icon={cilNotes} />
                        </CButton>
                      </div>
                    </div>
                    
                    <div className="row mb-2">
                      <div className="col-4">
                        <small className="text-muted">Final Amount</small>
                        <div className="fw-bold">₹{formatIndianNumber(proforma.final_amount)}</div>
                      </div>
                      <div className="col-4">
                        <small className="text-muted">Paid Amount</small>
                        <div className="text-success fw-bold">₹{formatIndianNumber(proforma.paid_amount)}</div>
                      </div>
                      <div className="col-4">
                        <small className="text-muted">Pending</small>
                        <div className="text-danger fw-bold">₹{formatIndianNumber(proforma.pending_amount)}</div>
                      </div>
                    </div>
                    
                    {/* Collapsible Payment History */}
                    {proforma.incomes && proforma.incomes.length > 0 && (
                      <div className="mt-3">
                        <CButton
                          color="link"
                          size="sm"
                          onClick={() => togglePaymentExpand(proforma.id)}
                          className="p-0 text-decoration-none"
                        >
                          <CIcon icon={expandedPayments[proforma.id] ? cilChevronTop : cilChevronBottom} className="me-1" />
                          <small className="fw-bold">
                            Payment History ({proforma.incomes.length} {proforma.incomes.length === 1 ? 'payment' : 'payments'})
                          </small>
                        </CButton>
                        
                        <CCollapse visible={expandedPayments[proforma.id]}>
                          <div className="table-responsive mt-2">
                            <table className="table table-sm table-bordered mb-0">
                              <thead className="table-light">
                                <tr>
                                  <th>Payment Date</th>
                                  <th>Received Amount</th>
                                  <th>Sent By</th>
                                  <th>Payment Type</th>
                                  <th>Transaction ID</th>
                                  <th>Received Bank</th>
                                  <th>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {proforma.incomes.map((income, idx) => (
                                  <tr key={idx}>
                                    <td>
                                      <CIcon icon={cilCalendar} className="me-1 text-muted" size="sm" />
                                      {formatDate(income.payment_date || income.invoice_date || income.created_at)}
                                    </td>
                                    <td className="text-success fw-bold">₹{formatIndianNumber(income.received_amount)}</td>
                                    <td>{income.received_by || 'N/A'}</td>
                                    <td>
                                      <CBadge color="primary">{income.payment_type?.toUpperCase()}</CBadge>
                                    </td>
                                    <td>{income.remark || 'N/A'}</td>
                                    <td>{income.receivers_bank || 'N/A'}</td>
                                    <td>
                                      <CButton
                                        color="warning"
                                        size="sm"
                                        onClick={() => handleEditPayment(income, proforma)}
                                        title="Edit Payment"
                                      >
                                        <CIcon icon={cilPencil} />
                                      </CButton>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </CCollapse>
                      </div>
                    )}
                    
                    {/* Record Payment Button */}
                    {proforma.pending_amount > 0 && (
                      <div className="mt-2">
                        <CButton
                          color="success"
                          size="sm"
                          onClick={() => handleRecordPayment(proforma)}
                        >
                          <CIcon icon={cilCreditCard} className="me-1" />
                          Record Payment
                        </CButton>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="text-muted">
                <CIcon icon={cilHistory} size="xl" className="mb-3 opacity-50" />
                <h6>No Proforma Invoices Found</h6>
                <p>No proforma invoices have been created for this work order yet.</p>
              </div>
            </div>
          )}
        </CModalBody>

        <CModalFooter>
          <CButton 
            color="secondary" 
            onClick={onClose}
          >
            <CIcon icon={cilX} className="me-1" />
            Close
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Payment Modal */}
      {showEditModal && selectedPaymentData && (
        <RecordPaymentModal
          visible={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            setSelectedPaymentData(null)
          }}
          orderData={selectedPaymentData}
          onPaymentRecorded={handlePaymentRecorded}
        />
      )}
    </>
  )
}

export default CombinedPaymentModal