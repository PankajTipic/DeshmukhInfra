import React, { useState, useEffect } from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CRow,
  CCol,
  CSpinner,
  CAlert
} from '@coreui/react'
import { post, put } from '../../../util/api'
import { paymentTypes, receiver_bank } from '../../../util/Feilds'
import { cilCreditCard, cilX, cilPencil } from '@coreui/icons'
import CIcon from '@coreui/icons-react'

const RecordPaymentModal = ({ 
  visible, 
  onClose, 
  orderData, 
  onPaymentRecorded 
}) => {
  const [formData, setFormData] = useState({
    received_amount: '',
    received_by: '',
    payment_type: 'cash',
    senders_bank: '',
    receivers_bank: '',
    remark: '',
    payment_date: new Date().toISOString().split('T')[0] // Today's date in YYYY-MM-DD format
  })
  
  const [loading, setLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' })
  const [originalAmount, setOriginalAmount] = useState(0)

  // Check if this is an edit operation
  const isEdit = orderData?.isEdit || false

  // Check if this is a proforma invoice payment
  const isProformaInvoice = orderData?.isProformaInvoice || false

  // Calculate amounts when orderData changes
  useEffect(() => {
    if (!visible || !orderData) return

    if (isEdit) {
      const currentAmount = parseFloat(orderData.received_amount ?? orderData.amount ?? 0) || 0

      setOriginalAmount(currentAmount)

      // Extract date from orderData if available
      let paymentDate = new Date().toISOString().split('T')[0]
      if (orderData.payment_date) {
        paymentDate = new Date(orderData.payment_date).toISOString().split('T')[0]
      } else if (orderData.created_at) {
        paymentDate = new Date(orderData.created_at).toISOString().split('T')[0]
      }

      setFormData({
        received_amount: currentAmount.toString(),
        received_by: orderData.received_by ?? "",
        payment_type: orderData.payment_type ?? "cash",
        senders_bank: orderData.senders_bank ?? "",
        receivers_bank: orderData.receivers_bank ?? "",
        remark: orderData.remark ?? "",
        payment_date: paymentDate,
      })
    } else {
      // New payment - calculate remaining amount
      const totalAmount = parseFloat(orderData.finalAmount ?? orderData.totalAmount ?? 0)
      const paidAmount = parseFloat(orderData.paidAmount ?? 0)
      const remainingAmount = totalAmount - paidAmount

      setOriginalAmount(0)
      setFormData((prev) => ({
        ...prev,
        received_amount: remainingAmount > 0 ? remainingAmount.toFixed(2) : "0.00",
        payment_date: new Date().toISOString().split('T')[0]
      }))
    }
  }, [visible, orderData, isEdit])

  // Reset form when modal closes
  useEffect(() => {
    if (!visible) {
      setFormData({
        received_amount: '',
        received_by: '',
        payment_type: 'cash',
        senders_bank: '',
        receivers_bank: '',
        remark: '',
        payment_date: new Date().toISOString().split('T')[0]
      })
      setAlert({ show: false, message: '', type: 'success' })
      setOriginalAmount(0)
      setIsSubmitting(false)
    }
  }, [visible])

  const showAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type })
    setTimeout(() => setAlert({ show: false, message: '', type: 'success' }), 5000)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    
    // Validate received amount for new payments only
    if (name === 'received_amount' && !isEdit) {
      const totalAmount = orderData?.finalAmount || orderData?.totalAmount || 0
      const paidAmount = orderData?.paidAmount || 0
      const remainingAmount = totalAmount - paidAmount
      const receivedAmount = parseFloat(value) || 0
      
      if (receivedAmount > remainingAmount) {
        showAlert(`Amount cannot exceed pending amount of ₹${remainingAmount.toLocaleString()}`, 'danger')
        return
      }
    }
    
    // Validate payment date (cannot be future date)
    if (name === 'payment_date') {
      const selectedDate = new Date(value)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (selectedDate > today) {
        showAlert('Payment date cannot be in the future', 'danger')
        return
      }
    }
    
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Prevent multiple submissions
    if (loading || isSubmitting) return

    if (!orderData) {
      showAlert('Order data not available', 'danger')
      return
    }

    const receivedAmount = parseFloat(formData.received_amount)
    // if (receivedAmount <= 0) {
    //   showAlert('Please enter a valid amount', 'danger')
    //   return
    // }

    // Validate payment date
    if (!formData.payment_date) {
      showAlert('Please select a payment date', 'danger')
      return
    }

    setLoading(true)
    setIsSubmitting(true)

    try {
      if (isEdit) {
        // ===== EDIT MODE: Update existing income =====
        const incomeId = orderData.incomeId || orderData.originalIncomeId

        if (!incomeId) {
          showAlert('Income ID missing! Cannot update income record.', 'danger')
          return
        }

        const incomeUpdateData = {
          received_by: formData.received_by,
          payment_type: formData.payment_type,
          senders_bank: formData.senders_bank,
          receivers_bank: formData.receivers_bank,
          remark: formData.remark,
          received_amount: receivedAmount.toString(),
          payment_date: formData.payment_date,
        }

        const incomeResponse = await put(`/api/income/${incomeId}`, incomeUpdateData)

        if (!incomeResponse.success && !incomeResponse.message) {
          showAlert('Failed to update payment record', 'danger')
          return
        }

        showAlert('Payment updated successfully!', 'success')

        if (onPaymentRecorded) {
          onPaymentRecorded(orderData.id || orderData.proforma_invoice_id || incomeId, receivedAmount)
        }

        setTimeout(() => onClose(), 1500)
      } 
      else {
        // ===== NEW PAYMENT MODE =====
        
        if (isProformaInvoice) {
          // Record payment for proforma invoice
          const proformaId = orderData.proforma_invoice_id || orderData.id

          if (!proformaId) {
            showAlert('Proforma Invoice ID missing for payment recording', 'danger')
            return
          }

          const paymentData = {
            received_amount: formData.received_amount,
            received_by: formData.received_by,
            payment_type: formData.payment_type,
            senders_bank: formData.senders_bank,
            receivers_bank: formData.receivers_bank,
            remark: formData.remark,
            payment_date: formData.payment_date,
          }

          const response = await post(`/api/proforma-invoices/${proformaId}/record-payment`, paymentData)

          if (!response.success) {
            showAlert(response.message || 'Error recording payment', 'danger')
            return
          }

          showAlert('Payment recorded successfully!', 'success')
          
          if (onPaymentRecorded) {
            onPaymentRecorded(proformaId, receivedAmount)
          }

          setTimeout(() => onClose(), 1500)
        } 
        else {
          // Regular order payment
          const orderId = orderData.id || orderData.orderId

          if (!orderId) {
            showAlert('Order ID missing for payment recording', 'danger')
            return
          }

          const orderPaymentData = {
            received_amount: formData.received_amount,
            received_by: formData.received_by,
            payment_type: formData.payment_type,
            senders_bank: formData.senders_bank,
            receivers_bank: formData.receivers_bank,
            remark: formData.remark,
            payment_date: formData.payment_date,
          }

          const response = await post(`/api/recordPayment/${orderId}`, orderPaymentData)

          if (!response.success) {
            showAlert(response.message || 'Error recording payment', 'danger')
            return
          }

          showAlert('Payment recorded successfully!', 'success')
          
          if (onPaymentRecorded) {
            onPaymentRecorded(orderId, receivedAmount)
          }

          setTimeout(() => onClose(), 1500)
        }
      }
    } catch (error) {
      console.error('Payment processing error:', error)
      showAlert(error.response?.data?.message || 'Error processing payment', 'danger')
    } finally {
      setLoading(false)
      setIsSubmitting(false)
    }
  }

  if (!orderData) return null

  const totalAmount = orderData.finalAmount || orderData.totalAmount || orderData.billing_amount || 0
  const paidAmount = orderData.paidAmount || parseFloat(orderData.received_amount || 0) || 0
  const remainingAmount = isEdit ? 0 : (totalAmount - paidAmount)

  return (
    <CModal 
      visible={visible} 
      onClose={onClose}
      size="lg"
      backdrop="static"
      keyboard={false}
    >
      <CModalHeader>
        <CModalTitle>
          <CIcon icon={isEdit ? cilPencil : cilCreditCard} className="me-2" />
          {isEdit ? 'Edit Payment' : 'Record Payment'}
        </CModalTitle>
      </CModalHeader>
      
      <CForm onSubmit={handleSubmit}>
        <CModalBody>
          {alert.show && (
            <CAlert color={alert.type} dismissible onClose={() => setAlert({ show: false, message: '', type: 'success' })}>
              {alert.message}
            </CAlert>
          )}

          {/* Order/Invoice Information */}
          <div className="bg-light p-3 rounded mb-4">
            <h6 className="mb-2">{isEdit ? 'Payment Details' : (isProformaInvoice ? 'Proforma Invoice Details' : 'Order Details')}</h6>
            <CRow className="mb-2">
              <CCol lg={6} md={6} sm={6} xs={6}>
                <small className="text-muted d-block">Invoice Number:</small>
                <div><strong>{orderData.invoice_no || orderData.invoice_number || `INV-${orderData.id}`}</strong></div>
              </CCol>
              <CCol lg={6} md={6} sm={6} xs={6}>
                <small className="text-muted d-block">Project:</small>
                <div><strong>{orderData.project_name || orderData.project?.project_name || 'N/A'}</strong></div>
              </CCol>
            </CRow>
            
            {!isEdit && (
              <CRow>
                <CCol lg={4} md={4} sm={4} xs={4}>
                  <small className="text-muted d-block">Total Amount:</small>
                  <div><strong>₹{totalAmount.toLocaleString()}</strong></div>
                </CCol>
                <CCol lg={4} md={4} sm={4} xs={4}>
                  <small className="text-muted d-block">Paid Amount:</small>
                  <div className="text-success"><strong>₹{paidAmount.toLocaleString()}</strong></div>
                </CCol>
                <CCol lg={4} md={4} sm={4} xs={4}>
                  <small className="text-muted d-block">Pending Amount:</small>
                  <div className="text-danger"><strong>₹{remainingAmount.toLocaleString()}</strong></div>
                </CCol>
              </CRow>
            )}
          </div>

          {/* Payment Form */}
          <CRow className="mb-3">
            <CCol lg={6} md={6} sm={6} xs={12} className="mb-3 mb-sm-0">
              <CFormLabel htmlFor="received_amount">Payment Amount *</CFormLabel>
              <CFormInput
                type="number"
                step="0.01"
                name="received_amount"
                value={formData.received_amount}
                onChange={handleInputChange}
                placeholder="Enter payment amount"
                required
                max={!isEdit ? remainingAmount : undefined}
                disabled={loading || isSubmitting}
              />
              {!isEdit && (
                <small className="text-muted">
                  Maximum: ₹{remainingAmount.toLocaleString()}
                </small>
              )}
            </CCol>

            <CCol lg={6} md={6} sm={6} xs={12}>
              <CFormLabel htmlFor="payment_date">Payment Date *</CFormLabel>
              <CFormInput
                type="date"
                name="payment_date"
                value={formData.payment_date}
                onChange={handleInputChange}
                max={new Date().toISOString().split('T')[0]}
                required
                disabled={loading || isSubmitting}
              />
            </CCol>
          </CRow>

          <CRow className="mb-3">
            <CCol lg={6} md={6} sm={6} xs={12} className="mb-3 mb-sm-0">
              <CFormLabel htmlFor="received_by">Received From *</CFormLabel>
              <CFormInput
                type="text"
                name="received_by"
                value={formData.received_by}
                onChange={handleInputChange}
                placeholder="Enter payer name"
                required
                disabled={loading || isSubmitting}
              />
            </CCol>

            <CCol lg={6} md={6} sm={6} xs={12}>
              <CFormLabel htmlFor="payment_type">Payment Type *</CFormLabel>
              <CFormSelect
                name="payment_type"
                value={formData.payment_type}
                onChange={handleInputChange}
                required
                disabled={loading || isSubmitting}
              >
                {paymentTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
          </CRow>

          <CRow className="mb-3">
            <CCol lg={6} md={6} sm={6} xs={12} className="mb-3 mb-sm-0">
              <CFormLabel htmlFor="senders_bank">Sender's Bank *</CFormLabel>
              <CFormInput
                type="text"
                name="senders_bank"
                value={formData.senders_bank}
                onChange={handleInputChange}
                placeholder="Enter sender's bank name"
                required
                disabled={loading || isSubmitting}
              />
            </CCol>

            <CCol lg={6} md={6} sm={6} xs={12}>
              <CFormLabel htmlFor="receivers_bank">Receiver's Bank *</CFormLabel>
              <CFormSelect
                name="receivers_bank"
                value={formData.receivers_bank}
                onChange={handleInputChange}
                required
                disabled={loading || isSubmitting}
              >
                <option value="">Select receiver's bank</option>
                {receiver_bank.map((bank) => (
                  <option key={bank.value} value={bank.value}>
                    {bank.label}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
          </CRow>

          <CRow className="mb-3">
            <CCol xs={12}>
              <CFormLabel htmlFor="remark">Transaction Number</CFormLabel>
              <CFormInput
                type="text"
                name="remark"
                value={formData.remark}
                onChange={handleInputChange}
                placeholder="Enter transaction number (optional)"
                disabled={loading || isSubmitting}
              />
            </CCol>
          </CRow>
        </CModalBody>

        <CModalFooter className="d-flex justify-content-end gap-2">
          <CButton 
            color="secondary" 
            onClick={onClose}
            disabled={loading || isSubmitting}
            className="flex-sm-grow-0 flex-grow-1"
          >
            <CIcon icon={cilX} className="me-1 d-none d-sm-inline" />
            Cancel
          </CButton>
          <CButton 
            color="primary" 
            type="submit"
            disabled={loading || isSubmitting}
            className="flex-sm-grow-0 flex-grow-1"
          >
            {(loading || isSubmitting) ? (
              <>
                <CSpinner size="sm" className="me-2" />
                <span className="d-none d-sm-inline">{isEdit ? 'Updating...' : 'Recording...'}</span>
                <span className="d-inline d-sm-none">{isEdit ? 'Updating' : 'Recording'}</span>
              </>
            ) : (
              <>
                <CIcon icon={isEdit ? cilPencil : cilCreditCard} className="me-1 d-none d-sm-inline" />
                <span className="d-none d-sm-inline">{isEdit ? 'Update Payment' : 'Record Payment'}</span>
                <span className="d-inline d-sm-none">{isEdit ? 'Update' : 'Record'}</span>
              </>
            )}
          </CButton>
        </CModalFooter>
      </CForm>
    </CModal>
  )
}

export default RecordPaymentModal