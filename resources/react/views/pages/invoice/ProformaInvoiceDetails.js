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
        const data = response.data
        
        // Sort details by id ascending to show items in the order they were saved
        if (data.details && Array.isArray(data.details)) {
          data.details = data.details.sort((a, b) => a.id - b.id)
        }
        
        // Calculate GST percentages from amounts
        const cgstAmt = parseFloat(data.cgst_amount) || 0
        const sgstAmt = parseFloat(data.sgst_amount) || 0
        const igstAmt = parseFloat(data.igst_amount) || 0
        const gstAmt = parseFloat(data.gst_amount) || 0
        
        // Calculate total after row-level GST from details
        const totalAfterRowGST = (data.details || []).reduce((sum, item) => {
          return sum + (parseFloat(item.total_price) || 0)
        }, 0)
        
        // Calculate percentages based on totalAfterRowGST (which is the taxable base for global GST)
        let calculatedCGST = 0
        let calculatedSGST = 0
        let calculatedIGST = 0
        let calculatedGST = 0
        
        if (totalAfterRowGST > 0) {
          calculatedCGST = Math.round((cgstAmt / totalAfterRowGST) * 100 * 100) / 100
          calculatedSGST = Math.round((sgstAmt / totalAfterRowGST) * 100 * 100) / 100
          calculatedIGST = Math.round((igstAmt / totalAfterRowGST) * 100 * 100) / 100
          calculatedGST = Math.round((gstAmt / totalAfterRowGST) * 100 * 100) / 100
        }
        
        // Add calculated percentages to data object
        data.cgst_percentage_calculated = calculatedCGST
        data.sgst_percentage_calculated = calculatedSGST
        data.igst_percentage_calculated = calculatedIGST
        data.gst_percentage_calculated = calculatedGST
        
        setProformaInvoice(data)
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

  // Check if any item has row-level GST data
  const hasRowGSTData = () => {
    if (!proformaInvoice || !proformaInvoice.details) return false
    return proformaInvoice.details.some(item =>
      (parseFloat(item.gst_percent) || 0) > 0 ||
      (parseFloat(item.cgst_amount) || 0) > 0 ||
      (parseFloat(item.sgst_amount) || 0) > 0
    )
  }

  // Check if global GST exists (from GST Details section)
  const hasGlobalGST = () => {
    if (!proformaInvoice) return false
    return (
      (parseFloat(proformaInvoice.cgst_amount) || 0) > 0 ||
      (parseFloat(proformaInvoice.sgst_amount) || 0) > 0 ||
      (parseFloat(proformaInvoice.gst_amount) || 0) > 0 ||
      (parseFloat(proformaInvoice.igst_amount) || 0) > 0
    )
  }

  // Calculate totals from items
  const calculateDisplayTotals = () => {
    if (!proformaInvoice || !proformaInvoice.details) {
      return {
        subtotalWithoutGST: 0,
        rowCGST: 0,
        rowSGST: 0,
        rowTotalGST: 0,
        totalAfterRowGST: 0,
        globalCGST: 0,
        globalSGST: 0,
        globalIGST: 0,
        globalTotalGST: 0,
        grandTotalWithAllGST: 0
      }
    }

    // Base subtotal (qty × price only, no GST)
    const subtotalWithoutGST = proformaInvoice.details.reduce(
      (sum, item) => {
        const qty = parseFloat(item.qty) || 0
        const price = parseFloat(item.price) || 0
        return sum + (qty * price)
      }, 0
    )
    
    // Row-level GST totals (already included in item.total_price)
    const rowCGST = proformaInvoice.details.reduce(
      (sum, item) => sum + (parseFloat(item.cgst_amount) || 0), 0
    )
    const rowSGST = proformaInvoice.details.reduce(
      (sum, item) => sum + (parseFloat(item.sgst_amount) || 0), 0
    )
    const rowTotalGST = rowCGST + rowSGST
    
    // Total after row-level GST
    const totalAfterRowGST = proformaInvoice.details.reduce(
      (sum, item) => sum + (parseFloat(item.total_price) || 0), 0
    )
    
    // Global GST (from GST Details section - applied on top)
    const globalCGST = parseFloat(proformaInvoice.cgst_amount) || 0
    const globalSGST = parseFloat(proformaInvoice.sgst_amount) || 0
    const globalIGST = parseFloat(proformaInvoice.igst_amount) || 0
    const globalTotalGST = globalCGST + globalSGST + globalIGST

    // Grand total
    const grandTotalWithAllGST = totalAfterRowGST + globalTotalGST

    return {
      subtotalWithoutGST,
      rowCGST,
      rowSGST,
      rowTotalGST,
      totalAfterRowGST,
      globalCGST,
      globalSGST,
      globalIGST,
      globalTotalGST,
      grandTotalWithAllGST
    }
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
  const showRowGST = hasRowGSTData()
  const showGlobalGST = hasGlobalGST()
  const displayTotals = calculateDisplayTotals()

  return (
    <>
      <CCard>
        <CCardHeader>
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Proforma Invoice Details</h5>
            <CBadge color={statusBadge.color} size="lg">
              {statusBadge.text}
            </CBadge>
          </div>
        </CCardHeader>

        <CCardBody>
          {/* Invoice Header Section */}
          <div className="row mb-4">
            <div className="col-md-6">
              <h6 className="fw-bold text-primary">Bill To:</h6>
              <p className="mb-1">
                <strong>Name:</strong> {proformaInvoice.project?.customer_name || 'N/A'}
              </p>
              <p className="mb-1">
                <strong>Address:</strong> {proformaInvoice.project?.work_place || 'N/A'}
              </p>
              <p className="mb-1">
                <strong>Mobile:</strong> {proformaInvoice.project?.mobile_number || 'N/A'}
              </p>
              {proformaInvoice.project?.gst_number && (
                <p className="mb-1">
                  <strong>GSTIN:</strong> {proformaInvoice.project.gst_number}
                </p>
              )}
            </div>
            <div className="col-md-6 text-end">
              <h6 className="fw-bold text-primary">Invoice Details:</h6>
              <p className="mb-1">
                <strong>Invoice No:</strong> {proformaInvoice.proforma_invoice_number}
              </p>
              <p className="mb-1">
                <strong>Date:</strong>{' '}
{new Date(proformaInvoice.invoice_date).toLocaleDateString('en-IN')}

              </p>
              <p className="mb-1">
                <strong>Project:</strong> {proformaInvoice.project?.project_name || 'N/A'}
              </p>
              <p className="mb-1">
                <strong>Project Type:</strong> {proformaInvoice.project?.project_type?.name || 'N/A'}
              </p>
              {proformaInvoice.po_number && (
                <p className="mb-1">
                  <strong>PO Number:</strong> {proformaInvoice.po_number}
                </p>
              )}
            </div>
          </div>

          {/* Work Details Table */}
          <div className="row section mb-4">
            <div className="col-md-12">
              <h6 className="fw-semibold text-primary border-bottom border-primary pb-2 mb-3">
                Work Details
              </h6>
              <table className="table table-bordered border-black">
                <thead className="table-primary">
                  <tr>
                    <th>Sr. No</th>
                    <th>Work Type</th>
                    <th>UOM</th>
                    <th>Qty</th>
                    <th>Rate</th>
                    {showRowGST && <th>Base Amount</th>}
                    {showRowGST && <th>GST %</th>}
                    {showRowGST && <th>CGST</th>}
                    {showRowGST && <th>SGST</th>}
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {proformaInvoice.details && proformaInvoice.details.length > 0 ? (
                    proformaInvoice.details.map((item, index) => {
                      const qty = parseFloat(item.qty) || 0
                      const price = parseFloat(item.price) || 0
                      const baseAmount = qty * price
                      const gstPercent = parseFloat(item.gst_percent) || 0
                      const cgstAmount = parseFloat(item.cgst_amount) || 0
                      const sgstAmount = parseFloat(item.sgst_amount) || 0
                      const cgstPercent = gstPercent ? gstPercent / 2 : 0
                      const sgstPercent = gstPercent ? gstPercent / 2 : 0
                      const totalPrice = parseFloat(item.total_price) || 0

                      return (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{item.work_type || 'N/A'}</td>
                          <td>{item.uom || 'N/A'}</td>
                          <td>{qty.toFixed(2)}</td>
                          <td>₹{price.toFixed(2)}</td>
                          {showRowGST && <td>₹{baseAmount.toFixed(2)}</td>}
                          {showRowGST && <td>{gstPercent ? `${gstPercent}%` : '-'}</td>}
                          {showRowGST && (
                            <td>
                              {cgstAmount > 0 
                                ? `₹${cgstAmount.toFixed(2)} (${cgstPercent}%)` 
                                : '-'
                              }
                            </td>
                          )}
                          {showRowGST && (
                            <td>
                              {sgstAmount > 0 
                                ? `₹${sgstAmount.toFixed(2)} (${sgstPercent}%)` 
                                : '-'
                              }
                            </td>
                          )}
                          <td>₹{totalPrice.toFixed(2)}</td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan={showRowGST ? "10" : "6"} className="text-center">
                        No work details available
                      </td>
                    </tr>
                  )}
                  
                  {/* Total Row */}
                  {proformaInvoice.details && proformaInvoice.details.length > 0 && (
                    <tr className="table-warning fw-bold">
                      <td colSpan={showRowGST ? "5" : "4"} className="text-end">Total:</td>
                      {showRowGST && <td>₹{displayTotals.subtotalWithoutGST.toFixed(2)}</td>}
                      {showRowGST && <td>-</td>}
                      {showRowGST && <td>₹{displayTotals.rowCGST.toFixed(2)}</td>}
                      {showRowGST && <td>₹{displayTotals.rowSGST.toFixed(2)}</td>}
                      <td>₹{displayTotals.totalAfterRowGST.toFixed(2)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Show Global GST Details ONLY if global GST exists */}
          {showGlobalGST && (
            <div className="row section mb-4">
              <div className="col-md-12">
                <h6 className="fw-semibold text-primary">GST Details</h6>
                <table className="table table-bordered border-black">
                  <tbody>
                    <tr>
                      <td><strong>Taxable Amount:</strong></td>
                      <td className="text-center">₹{displayTotals.totalAfterRowGST.toFixed(2)}</td>
                    </tr>
                    {displayTotals.globalCGST > 0 && (
                      <tr>
                        <td>
                          <strong>
                            CGST ({proformaInvoice.cgst_percentage_calculated || 0}%):
                          </strong>
                        </td>
                        <td className="text-center">₹{displayTotals.globalCGST.toFixed(2)}</td>
                      </tr>
                    )}
                    {displayTotals.globalSGST > 0 && (
                      <tr>
                        <td>
                          <strong>
                            SGST ({proformaInvoice.sgst_percentage_calculated || 0}%):
                          </strong>
                        </td>
                        <td className="text-center">₹{displayTotals.globalSGST.toFixed(2)}</td>
                      </tr>
                    )}
                    {displayTotals.globalIGST > 0 && (
                      <tr>
                        <td>
                          <strong>
                            IGST ({proformaInvoice.igst_percentage_calculated || 0}%):
                          </strong>
                        </td>
                        <td className="text-center">₹{displayTotals.globalIGST.toFixed(2)}</td>
                      </tr>
                    )}
                    <tr className="table-success">
                      <td><strong>Total GST Amount:</strong></td>
                      <td className="text-center">
                        <strong>₹{displayTotals.globalTotalGST.toFixed(2)}</strong>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Discount section */}
          {parseFloat(proformaInvoice.discount) > 0 && (
            <div className="row section mb-4">
              <div className="col-md-12">
                <table className="table table-bordered border-black">
                  <tbody>
                    <tr>
                      <td><strong>Discount:</strong></td>
                      <td className="text-center">₹{parseFloat(proformaInvoice.discount).toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Final Amount */}
          <div className="row section mb-4">
            <div className="col-md-12">
              <table className="table table-bordered border-black">
                <tbody>
                  <tr>
                    <td><strong>Grand Total:</strong></td>
                    <td className="text-center">
                      <strong>₹{parseFloat(proformaInvoice.final_amount).toFixed(2)}</strong>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="row section mb-4">
            <div className="col-md-12">
              <table className="table table-bordered border-black">
                <tbody>
                  <tr>
                    <td><strong>Amount Paid:</strong></td>
                    <td className="text-center">₹{parseFloat(proformaInvoice.paid_amount).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td><strong>Balance Amount:</strong></td>
                    <td className="text-center">₹{parseFloat(proformaInvoice.pending_amount).toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes, Payment Terms, and Terms & Conditions */}
          <div className="row section mb-4">
            <div className="col-md-12">
              {/* Notes */}
              {proformaInvoice.notes && (
                <>
                  <h6 className="mt-4 mb-2 fw-semibold text-primary border-bottom border-primary pb-2">
                    Note
                  </h6>
                  <p className="ms-2 text-dark">{proformaInvoice.notes}</p>
                </>
              )}

              {/* Payment Terms */}
              {proformaInvoice.payment_terms && (
                <>
                  <h6 className="mt-4 mb-2 fw-semibold text-primary border-bottom border-primary pb-2">
                    Payment Terms
                  </h6>
                  <ul className="ms-3">
                    {proformaInvoice.payment_terms
                      .split('\n')
                      .filter((line) => line.trim() !== '')
                      .map((line, index) => (
                        <li key={index} className="text-dark">{line}</li>
                      ))}
                  </ul>
                </>
              )}

              {/* Terms & Conditions */}
              {proformaInvoice.terms_conditions && (
                <>
                  <h6 className="mt-4 mb-2 fw-semibold text-primary border-bottom border-primary pb-2">
                    Terms & Conditions
                  </h6>
                  <ul className="ms-3">
                    {proformaInvoice.terms_conditions
                      .split('\n')
                      .filter((line) => line.trim() !== '')
                      .map((line, index) => (
                        <li key={index} className="text-dark">{line}</li>
                      ))}
                  </ul>
                </>
              )}
            </div>
          </div>

          {/* Computer Generated Message */}
          <div className="row section mb-4">
            <div className="col-md-12 text-center">
              <p>This invoice has been computer-generated and is authorized.</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="d-flex justify-content-center flex-wrap gap-2 d-print-none">
            <CButton
              color="danger"
              variant="outline"
              onClick={() => navigate(`/edit-proforma-invoice/${id}`)}
            >
              <CIcon icon={cilPencil} className="me-1" />
              Edit Proforma Invoice
            </CButton>

            {parseFloat(proformaInvoice.pending_amount) > 0 && (
              <CButton
                color="success"
                onClick={handleRecordPayment}
              >
                <CIcon icon={cilCreditCard} className="me-1" />
                Record Payment
              </CButton>
            )}

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