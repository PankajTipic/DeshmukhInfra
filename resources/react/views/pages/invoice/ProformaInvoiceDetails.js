// src/views/invoices/ProformaInvoiceDetails.js

import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CButton,
  CRow,
  CCol,
  CSpinner,
  CBadge,
  CAlert,
  CFormSelect,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilArrowLeft, cilPencil, cilCreditCard, cilHistory, cilPrint } from '@coreui/icons'
import { getAPICall } from '../../../util/api'
import { useToast } from '../../common/toast/ToastContext'
import { generateProformaInvoicePDF } from './ProformaInvoicePDF'
import RecordPaymentModal from './RecordPaymentModal'

const ProformaInvoiceDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  
  const [loading, setLoading] = useState(true)
  const [proformaInvoice, setProformaInvoice] = useState(null)
  const [selectedLang, setSelectedLang] = useState('english')
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  useEffect(() => {
    fetchProformaInvoice()
  }, [id])

  const fetchProformaInvoice = async () => {
    try {
      setLoading(true)
      const response = await getAPICall(`/api/proforma-invoices/${id}`)
      
      if (response.success) {
        setProformaInvoice(response.data)
      } else {
        showToast('danger', 'Failed to fetch proforma invoice')
      }
    } catch (error) {
      console.error('Error fetching proforma invoice:', error)
      showToast('danger', 'Error fetching proforma invoice details')
    } finally {
      setLoading(false)
    }
  }

  const handleRecordPayment = () => {
    setShowPaymentModal(true)
  }

  const handlePaymentRecorded = () => {
    fetchProformaInvoice()
    setShowPaymentModal(false)
  }

  const handleDownload = async () => {
    if (!proformaInvoice) return
    
    await generateProformaInvoicePDF(
      proformaInvoice,
      selectedLang,
      'save'
    )
  }

  const handlePrint = () => {
    window.print()
  }

  const getPaymentStatusBadge = (status) => {
    const badges = {
      pending: { color: 'danger', text: 'Pending' },
      partial: { color: 'warning', text: 'Partially Paid' },
      paid: { color: 'success', text: 'Fully Paid' },
    }
    return badges[status] || badges.pending
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <CSpinner color="primary" />
        <div className="mt-2">Loading proforma invoice...</div>
      </div>
    )
  }

  if (!proformaInvoice) {
    return (
      <CAlert color="warning">
        Proforma invoice not found
      </CAlert>
    )
  }

  const statusBadge = getPaymentStatusBadge(proformaInvoice.payment_status)

  return (
    <>
      <CCard>
        <CCardHeader>
          <div className="d-flex justify-content-between align-items-center">
            <h5>Proforma Invoice {proformaInvoice.proforma_invoice_number}</h5>
            <div>
              <CBadge color={statusBadge.color} className="me-2">
                {statusBadge.text}
              </CBadge>
              <CButton
                color="secondary"
                size="sm"
                onClick={() => navigate('/invoiceTable')}
              >
                <CIcon icon={cilArrowLeft} className="me-1" />
                Back
              </CButton>
            </div>
          </div>
        </CCardHeader>
        <CCardBody>
          {/* Invoice Info */}
          <div className="row section mb-4">
            <div className="col-md-6">
              <h6>Invoice Information</h6>
              <p><strong>Proforma Invoice :</strong> {proformaInvoice.proforma_invoice_number}</p>
              {proformaInvoice.tally_invoice_number && (
                <p><strong>Tally Invoice :</strong> {proformaInvoice.tally_invoice_number}</p>
              )}
              <p><strong>Invoice Date:</strong> {new Date(proformaInvoice.invoice_date).toLocaleDateString()}</p>
              {proformaInvoice.delivery_date && (
                <p><strong>Delivery Date:</strong> {new Date(proformaInvoice.delivery_date).toLocaleDateString()}</p>
              )}
            </div>
            <div className="col-md-6">
              <h6>Work Order & Project Information</h6>
              <p><strong>Work Order :</strong> {proformaInvoice.work_order?.invoice_number}</p>
              <p><strong>Project:</strong> {proformaInvoice.project?.project_name}</p>
              <p><strong>Customer:</strong> {proformaInvoice.customer?.name}</p>
              <p><strong>Location:</strong> {proformaInvoice.customer?.address}</p>
              <p><strong>Mobile:</strong> {proformaInvoice.customer?.mobile}</p>
            </div>
          </div>

          {/* Work Details Table */}
          <div className="row section mb-4">
            <div className="col-md-12">
              <h6>Work Details</h6>
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Sr. No.</th>
                    <th>Work Type</th>
                    <th>Unit</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Total</th>
                    <th>Remark</th>
                  </tr>
                </thead>
                <tbody>
                  {proformaInvoice.details && proformaInvoice.details.length > 0 ? (
                    proformaInvoice.details.map((item, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{item.work_type}</td>
                        <td>{item.uom}</td>
                        <td>{item.qty}</td>
                        <td>₹{parseFloat(item.price).toFixed(2)}</td>
                        <td>₹{parseFloat(item.total_price).toFixed(2)}</td>
                        <td>{item.remark || '-'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center">No work details available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Details */}
          <div className="row section mb-4">
            <div className="col-md-12">
              <h6>Financial Summary</h6>
              <table className="table table-bordered">
                <tbody>
                  <tr>
                    <td><strong>Subtotal:</strong></td>
                    <td className="text-end">₹{parseFloat(proformaInvoice.subtotal).toFixed(2)}</td>
                  </tr>
                  {proformaInvoice.discount > 0 && (
                    <tr>
                      <td><strong>Discount:</strong></td>
                      <td className="text-end">₹{parseFloat(proformaInvoice.discount).toFixed(2)}</td>
                    </tr>
                  )}
                  <tr>
                    <td><strong>Taxable Amount:</strong></td>
                    <td className="text-end">₹{parseFloat(proformaInvoice.taxable_amount).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td><strong>CGST ({proformaInvoice.cgst_percentage}%):</strong></td>
                    <td className="text-end">₹{parseFloat(proformaInvoice.cgst_amount).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td><strong>SGST ({proformaInvoice.sgst_percentage}%):</strong></td>
                    <td className="text-end">₹{parseFloat(proformaInvoice.sgst_amount).toFixed(2)}</td>
                  </tr>
                  {proformaInvoice.igst_amount > 0 && (
                    <tr>
                      <td><strong>IGST ({proformaInvoice.igst_percentage}%):</strong></td>
                      <td className="text-end">₹{parseFloat(proformaInvoice.igst_amount).toFixed(2)}</td>
                    </tr>
                  )}
                  <tr>
                    <td><strong>Total GST:</strong></td>
                    <td className="text-end">₹{parseFloat(proformaInvoice.gst_amount).toFixed(2)}</td>
                  </tr>
                  <tr className="table-primary">
                    <td><strong>Final Amount:</strong></td>
                    <td className="text-end"><strong>₹{parseFloat(proformaInvoice.final_amount).toFixed(2)}</strong></td>
                  </tr>
                  <tr className="table-success">
                    <td><strong>Paid Amount:</strong></td>
                    <td className="text-end">₹{parseFloat(proformaInvoice.paid_amount).toFixed(2)}</td>
                  </tr>
                  <tr className="table-warning">
                    <td><strong>Pending Amount:</strong></td>
                    <td className="text-end">₹{parseFloat(proformaInvoice.pending_amount).toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment History */}
          {/* {proformaInvoice.incomes && proformaInvoice.incomes.length > 0 && (
            <div className="row section mb-4">
              <div className="col-md-12">
                <h6>Payment History</h6>
                <table className="table table-bordered table-sm">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Payment Type</th>
                      <th>Received By</th>
                      <th>Sender's Bank</th>
                      <th>Receiver's Bank</th>
                    </tr>
                  </thead>
                  <tbody>
                    {proformaInvoice.incomes.map((income, index) => (
                      <tr key={index}>
                        <td>{new Date(income.invoice_date).toLocaleDateString()}</td>
                        <td>₹{parseFloat(income.received_amount).toFixed(2)}</td>
                        <td>{income.payment_type?.toUpperCase()}</td>
                        <td>{income.received_by}</td>
                        <td>{income.senders_bank}</td>
                        <td>{income.receivers_bank}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )} */}

          {/* Terms & Conditions */}
          {/* {proformaInvoice.invoice_rules && proformaInvoice.invoice_rules.length > 0 && (
            <div className="row section mb-4">
              <div className="col-md-12">
                <h6>Terms & Conditions</h6>
                <ul>
                  {proformaInvoice.invoice_rules.map((ir, index) => (
                    <li key={index}>{ir.rule?.description || 'N/A'}</li>
                  ))}
                </ul>
              </div>
            </div>
          )} */}

          {/* Notes */}
          {proformaInvoice.notes && (
            <div className="row section mb-4">
              <div className="col-md-12">
                <h6>Additional Notes</h6>
                <p>{proformaInvoice.notes}</p>
              </div>
            </div>
          )}





          {/* Terms, Payment Terms, and Notes */}
<div className="row section mb-4">
  <div className="col-md-12">


{/* Payment Terms */}
    {proformaInvoice.payment_terms && (
      <>
        <h6 className="mt-3">Payment Terms</h6>
        <ul>
          {proformaInvoice.payment_terms
            .split('\n')
            .filter((line) => line.trim() !== '')
            .map((line, index) => (
              <li key={index}>{line}</li>
            ))}
        </ul>
      </>
    )}




    {/* Terms & Conditions */}
    {proformaInvoice.terms_conditions && (
      <>
        <h6>Terms & Conditions</h6>
        <ul>
          {proformaInvoice.terms_conditions
            .split('\n')
            .filter((line) => line.trim() !== '')
            .map((line, index) => (
              <li key={index}>{line}</li>
            ))}
        </ul>
      </>
    )}

    
  
  </div>
</div>














          {/* Action Buttons */}
          <div className="d-flex justify-content-center flex-wrap gap-2 d-print-none">
            {proformaInvoice.pending_amount > 0 && (
              <CButton
                color="success"
                onClick={handleRecordPayment}
              >
                <CIcon icon={cilCreditCard} className="me-1" />
                Record Payment
              </CButton>
            )}
            
            {/* <CButton
              color="primary"
              onClick={handlePrint}
            >
              <CIcon icon={cilPrint} className="me-1" />
              Print
            </CButton> */}

            {/* <CFormSelect
              className="d-inline-block"
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              style={{ width: 'auto' }}
            >
              <option value="english">English</option>
              <option value="marathi">Marathi</option>
              <option value="tamil">Tamil</option>
              <option value="bengali">Bengali</option>
            </CFormSelect> */}

            <CButton
              color="info"
              onClick={handleDownload}
            >
              Download PDF ({selectedLang})
            </CButton>
          </div>
        </CCardBody>
      </CCard>

      {/* Payment Modal */}
      {showPaymentModal && (
        <RecordPaymentModal
          visible={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          orderData={{
            id: proformaInvoice.id,
            proforma_invoice_id: proformaInvoice.id,
            invoice_number: proformaInvoice.proforma_invoice_number,
            project_name: proformaInvoice.project?.project_name,
            finalAmount: proformaInvoice.final_amount,
            paidAmount: proformaInvoice.paid_amount,
            isProformaInvoice: true,
          }}
          onPaymentRecorded={handlePaymentRecorded}
        />
      )}
    </>
  )
}

export default ProformaInvoiceDetails