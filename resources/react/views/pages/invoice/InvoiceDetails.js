import './style.css'
import { CButton, CCard, CCardBody, CCardHeader, CContainer, CFormSelect } from '@coreui/react'
import React, { useState, useEffect, useRef } from 'react'
import { generateMultiLanguagePDF } from './InvoiceMulPdf'
import { getAPICall, postFormData } from '../../../util/api'
import { useParams, useNavigate } from 'react-router-dom'
import { getUserData } from '../../../util/session'
import { useToast } from '../../common/toast/ToastContext'

const InvoiceDetails = () => {
  const ci = getUserData()?.company_info
  const { id } = useParams()
  const [remainingAmount, setRemainingAmount] = useState(0)
  const fileInputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [selectedLang, setSelectedLang] = useState('english')
  const [totalAmountWords, setTotalAmountWords] = useState('')
  const [grandTotal, setGrandTotal] = useState(0)
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    project_name: '',
    customer: { name: '', address: '', mobile: '', gst_number: '' },
    date: '',
    items: [],
    discount: 0,
    amountPaid: 0,
    paymentMode: '',
    invoiceStatus: '',
    finalAmount: 0,
    totalAmount: 0,
    invoice_number: '',
    status: '',
    deliveryDate: '',
    invoiceType: '',
    cgst: 0,
    sgst: 0,
    gst: 0,
    igst: 0,
    invoice_rules: [],
    ref_id: '',
    po_number: '',
  })

  const handleEdit = () => {
    navigate(`/edit-order/${id}`)
  }

  const numberToWords = (number) => {
    if (number === 0) return 'Zero'

    const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

    const convertHundreds = (num) => {
      let result = ''
      if (num >= 100) {
        result += units[Math.floor(num / 100)] + ' Hundred '
        num %= 100
      }
      if (num >= 20) {
        result += tens[Math.floor(num / 10)]
        if (num % 10 > 0) result += ' ' + units[num % 10]
      } else if (num >= 10) {
        result += teens[num - 10]
      } else if (num > 0) {
        result += units[num]
      }
      return result.trim()
    }

    let words = ''
    let num = Math.floor(number)
    if (num >= 10000000) {
      const crores = Math.floor(num / 10000000)
      words += convertHundreds(crores) + ' Crore '
      num %= 10000000
    }
    if (num >= 100000) {
      const lakhs = Math.floor(num / 100000)
      words += convertHundreds(lakhs) + ' Lakh '
      num %= 100000
    }
    if (num >= 1000) {
      const thousands = Math.floor(num / 1000)
      words += convertHundreds(thousands) + ' Thousand '
      num %= 1000
    }
    if (num > 0) {
      words += convertHundreds(num)
    }
    return words.trim() + ' Rupees Only'
  }

  const handlePrint = () => {
    window.print()
  }

  const fetchOrder = async () => {
  try {
    const response = await getAPICall(`/api/order/${id}`)
    console.log('Fetched order:', response)

    const paymentModeString =
      response.paymentType === 0 ? 'Cash' : 'Online (UPI/Bank Transfer)'

    let orderStatusString = ''
    switch (response.orderStatus) {
      case 0:
        orderStatusString = 'Cancelled Order'
        break
      case 1:
        orderStatusString = 'Delivered Order'
        break
      case 2:
        orderStatusString = 'Order Pending'
        break
      case 3:
        orderStatusString = 'Quotation'
        break
      default:
        orderStatusString = 'Unknown Status'
    }

    const discountValue = response.discount || 0
    const finalAmount = Number(response.finalAmount || 0).toFixed(2)
    const totalAmount = Number(response.totalAmount || 0).toFixed(2)
    const remaining = finalAmount - (response.paidAmount || 0)
    setRemainingAmount(Math.max(0, remaining))

    // Calculate GST percentages from amounts
    const cgstAmt = Number(response.cgst || 0)
    const sgstAmt = Number(response.sgst || 0)
    const igstAmt = Number(response.igst || 0)
    const gstAmt = Number(response.gst || 0)
    const totalAmt = Number(response.totalAmount || 0)
    
    const cgstPercentage = totalAmt > 0 ? Math.round((cgstAmt / totalAmt) * 100 * 100) / 100 : 0
    const sgstPercentage = totalAmt > 0 ? Math.round((sgstAmt / totalAmt) * 100 * 100) / 100 : 0
    const igstPercentage = totalAmt > 0 ? Math.round((igstAmt / totalAmt) * 100 * 100) / 100 : 0
    const gstPercentage = totalAmt > 0 ? Math.round((gstAmt / totalAmt) * 100 * 100) / 100 : 0

    setFormData({
      project_name: response.project?.project_name || 'N/A',
      project_type: response.project?.project_type?.name || 'N/A',
      customer: {
        name: response.project?.customer_name || 'N/A',
        address: response.project?.work_place || 'N/A',
        mobile: response.project?.mobile_number || 'N/A',
      },
      gst_number: response.project?.gst_number || 'N/A',
      pan_number: response.project?.pan_number || 'N/A',

      date: response.invoiceDate || '',
      items: (response.items || []).map((item) => ({
        id: item.id,
        work_type: item.product_name || item.work_type || 'N/A',
        qty: item.dQty || item.qty || 0,
        uom: item.uom || 'N/A',
        price: item.dPrice || item.price || 0,
        total_price: item.total_price || 0,
        remark: item.remark || '',
        gst_percent: Number(item.gst_percent) || 0,
        cgst_amount: Number(item.cgst_amount) || 0,
        sgst_amount: Number(item.sgst_amount) || 0,
      })).sort((a, b) => a.id - b.id), // Sort by id ascending to show items in the order they were saved
      discount: discountValue,
      amountPaid: response.paidAmount || 0,
      paymentMode: paymentModeString,
      invoiceStatus: orderStatusString,
      totalAmount: totalAmount,
      finalAmount: finalAmount,

      cgst: cgstAmt.toFixed(2),
      sgst: sgstAmt.toFixed(2),
      gst: gstAmt.toFixed(2),
      igst: igstAmt.toFixed(2),
      
      // Add calculated GST percentages
      cgstPercentage: cgstPercentage,
      sgstPercentage: sgstPercentage,
      igstPercentage: igstPercentage,
      gstPercentage: gstPercentage,

      ref_id: response.ref_id,
      po_number: response.po_number || '',

      terms_and_conditions: response.terms_and_conditions || '',
      payment_terms: response.payment_terms || '',
      note: response.note || '',

      invoice_number: response.invoice_number || 'N/A',
      status: response.orderStatus,
      deliveryDate: response.deliveryDate || '',
      invoiceType: response.invoiceType || 3,
      invoice_rules: Array.isArray(response.invoice_rules) ? response.invoice_rules : [],
    })

    setGrandTotal(finalAmount)
    setTotalAmountWords(numberToWords(finalAmount))
  } catch (error) {
    console.error('Error fetching order data:', error)
    showToast('danger', 'Error fetching invoice details')
  }
}

  console.log('Customer GST Number:', formData?.gst_number)

  useEffect(() => {
    fetchOrder()
  }, [id])

  const handleSendWhatsApp = async () => {
    try {
      const pdfBlob = await generateMultiLanguagePDF(
        formData.finalAmount,
        formData.invoice_number,
        formData.customer.name,
        formData,
        remainingAmount,
        totalAmountWords,
        selectedLang,
        'blob'
      )

      const pdfUrl = URL.createObjectURL(pdfBlob)

      const message = encodeURIComponent(`*Invoice from ${ci?.company_name || 'Company'}*\n
Project: ${formData.project_name}
Invoice Number: ${formData.invoice_number}
Total Amount: ₹${formData.finalAmount}
Amount Paid: ₹${formData.amountPaid}
Remaining: ₹${remainingAmount}

📄 Download Invoice: ${pdfUrl}

Thank you!`)

      const whatsappUrl = `https://wa.me/${formData.customer.mobile}?text=${message}`
      window.open(whatsappUrl, '_blank')
    } catch (error) {
      showToast('danger', 'Error sharing on WhatsApp: ' + error.message)
    }
  }

  const handleDownload = async (lang) => {
    await generateMultiLanguagePDF(
      formData.finalAmount,
      formData.invoice_number,
      formData.customer.name,
      formData,
      remainingAmount,
      totalAmountWords,
      lang,
      'save'
    )
  }

  // Check if any items have row-level GST
  const hasRowGST = () => {
    if (!formData.items || formData.items.length === 0) return false
    return formData.items.some(item => 
      (item.gst_percent && item.gst_percent > 0) ||
      (item.cgst_amount && item.cgst_amount > 0) ||
      (item.sgst_amount && item.sgst_amount > 0)
    )
  }

  // Check if global GST exists (from GST Details section)
  const hasGlobalGST = () => {
    return (
      (formData.cgst && Number(formData.cgst) > 0) ||
      (formData.sgst && Number(formData.sgst) > 0) ||
      (formData.gst && Number(formData.gst) > 0) ||
      (formData.igst && Number(formData.igst) > 0)
    )
  }

  const showRowGST = hasRowGST()
  const showGlobalGST = hasGlobalGST()

  // Calculate totals from items
  const calculateDisplayTotals = () => {
    const subtotalWithoutGST = formData.items.reduce((sum, item) => 
      sum + (item.qty * item.price), 0
    )
    
    // Row-level GST totals (already included in item.total_price)
    const rowCGST = formData.items.reduce((sum, item) => 
      sum + (item.cgst_amount || 0), 0
    )
    const rowSGST = formData.items.reduce((sum, item) => 
      sum + (item.sgst_amount || 0), 0
    )
    const totalAfterRowGST = formData.items.reduce((sum, item) => 
      sum + (item.total_price || 0), 0
    )
    
    // Global GST (from GST Details section - applied on top)
    const globalCGST = Number(formData.cgst || 0)
    const globalSGST = Number(formData.sgst || 0)
    const globalIGST = Number(formData.igst || 0)
    const globalTotalGST = globalCGST + globalSGST + globalIGST

    return {
      subtotalWithoutGST,
      rowCGST,
      rowSGST,
      totalAfterRowGST,
      globalCGST,
      globalSGST,
      globalIGST,
      globalTotalGST,
    }
  }

  const displayTotals = calculateDisplayTotals()

  return (
    <CCard>
      <CCardHeader>
        <h5>Invoice {formData.invoice_number}</h5>
      </CCardHeader>
      <CCardBody>
        <CContainer fluid>
          <div className="row section">
            <div className="col-md-6">
              <p><strong>Project Name:</strong> {formData.project_name}</p>
              <p><strong>Project Type:</strong> {formData.project_type}</p>
              <p><strong>Customer Name:</strong> {formData.customer.name}</p>
              <p><strong>Customer Address:</strong> {formData.customer.address}</p>
              <p><strong>Mobile Number:</strong> {formData.customer.mobile}</p>
              <p><strong>GST Number:</strong> {formData.gst_number}</p>
            </div>
            <div className="col-md-6">
              <p><strong>Invoice Number:</strong> {formData.invoice_number}</p>
              <p><strong>Reference ID:</strong> {formData.ref_id}</p>
              <p><strong>Po Number:</strong> {formData.po_number}</p>
              <p><strong>Invoice Date:</strong> {formData.date}</p>
              <p><strong>PAN Number:</strong> {formData.pan_number}</p>
            </div>
          </div>

          <div className="row section">
            <div className="col-md-12">
              <table className="table table-bordered border-black">
                <thead>
                  <tr>
                    <th>Sr. No.</th>
                    <th>Work Type</th>
                    <th>Unit</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    {showRowGST && <th>Base Amount</th>}
                    {showRowGST && <th>GST %</th>}
                    {showRowGST && <th>CGST</th>}
                    {showRowGST && <th>SGST</th>}
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.length > 0 ? (
                    formData.items.map((item, index) => {
                      const cgstPercent = item.gst_percent ? item.gst_percent / 2 : 0;
                      const sgstPercent = item.gst_percent ? item.gst_percent / 2 : 0;
                      
                      return (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{item.work_type}</td>
                          <td>{item?.uom}</td>
                          <td>{item.qty}</td>
                          <td>₹{item.price.toFixed(2)}</td>
                          {showRowGST && <td>₹{(item.qty * item.price).toFixed(2)}</td>}
                          {showRowGST && <td>{item.gst_percent ? `${item.gst_percent}%` : '-'}</td>}
                          {showRowGST && (
                            <td>
                              {item.cgst_amount > 0 
                                ? `₹${(item.cgst_amount || 0).toFixed(2)} (${cgstPercent}%)` 
                                : '-'}
                            </td>
                          )}
                          {showRowGST && (
                            <td>
                              {item.sgst_amount > 0 
                                ? `₹${(item.sgst_amount || 0).toFixed(2)} (${sgstPercent}%)` 
                                : '-'}
                            </td>
                          )}
                          <td>₹{item.total_price.toFixed(2)}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={showRowGST ? "10" : "6"} className="text-center">No work details available</td>
                    </tr>
                  )}
                  
                  {/* Total Row */}
                  {formData.items && formData.items.length > 0 && (
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

          {/* Show ONLY Global GST breakdown (from GST Details section) */}
          {showGlobalGST && (
            <div className="row section">
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
                        <td><strong>CGST ({formData.cgstPercentage || (Number(formData.gst || 0) / 2)}%):</strong></td>
                        <td className="text-center">₹{displayTotals.globalCGST.toFixed(2)}</td>
                      </tr>
                    )}
                    {displayTotals.globalSGST > 0 && (
                      <tr>
                        <td><strong>SGST ({formData.sgstPercentage || (Number(formData.gst || 0) / 2)}%):</strong></td>
                        <td className="text-center">₹{displayTotals.globalSGST.toFixed(2)}</td>
                      </tr>
                    )}
                    {displayTotals.globalIGST > 0 && (
                      <tr>
                        <td><strong>IGST ({formData.igstPercentage || Number(formData.gst || 0)}%):</strong></td>
                        <td className="text-center">₹{displayTotals.globalIGST.toFixed(2)}</td>
                      </tr>
                    )}
                    <tr className="table-success">
                      <td><strong>Total GST Amount:</strong></td>
                      <td className="text-center"><strong>₹{displayTotals.globalTotalGST.toFixed(2)}</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Discount section */}
          {formData.discount > 0 && (
            <div className="row section">
              <div className="col-md-12">
                <table className="table table-bordered border-black">
                  <tbody>
                    <tr>
                      <td>Discount:</td>
                      <td className="text-center">₹{formData.discount}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Final Amount */}
          <div className="row section">
            <div className="col-md-12">
              <table className="table table-bordered border-black">
                <tbody>
                  <tr>
                    <td><strong>Grand Total:</strong></td>
                    <td className="text-center"><strong>₹{formData.finalAmount}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="row section">
            <div className="col-md-12">
              <table className="table table-bordered border-black">
                <tbody>
                  <tr>
                    <td>Amount Paid:</td>
                    <td>₹{formData.amountPaid}</td>
                  </tr>
                  <tr>
                    <td>Balance Amount:</td>
                    <td>₹{remainingAmount.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="row section mt-3">
            <div className="col-md-12">
              <h6 className="mt-4 mb-2 fw-semibold text-primary border-bottom border-primary pb-2">
                Note
              </h6>
              <p className="ms-2 text-dark">
                {formData?.note ? formData.note : "No note available."}
              </p>

              <h6 className="mt-4 mb-2 fw-semibold text-primary border-bottom border-primary pb-2">
                Payment Terms
              </h6>
              <ul className="ms-3">
                {formData?.payment_terms ? (
                  formData.payment_terms.split("\n").map((line, index) => (
                    <li key={index} className="text-dark">{line}</li>
                  ))
                ) : (
                  <li className="text-muted">No payment terms available.</li>
                )}
              </ul>

              <h6 className="mt-4 mb-2 fw-semibold text-primary border-bottom border-primary pb-2">
                Terms & Conditions
              </h6>
              <ul className="ms-3">
                {formData?.terms_and_conditions ? (
                  formData.terms_and_conditions.split("\n").map((line, index) => (
                    <li key={index} className="text-dark">{line}</li>
                  ))
                ) : (
                  <li className="text-muted">No terms and conditions provided.</li>
                )}
              </ul>
            </div>
          </div>

          <div className="row section mt-3">
            <div className="col-md-12 text-center">
              <p>This bill has been computer-generated and is authorized.</p>
            </div>
          </div>

          <div className="d-flex justify-content-center flex-wrap gap-2">
            <CButton
              color="danger"
              variant="outline"
              className="d-print-none flex-fill"
              onClick={handleEdit}
            >
              Edit Order
            </CButton>
            <CButton
              color="primary"
              variant="outline"
              onClick={handlePrint}
              className="d-print-none flex-fill"
              style={{ display: 'none' }}
            >
              Print
            </CButton>
            <CFormSelect
              className="mb-2 d-print-none flex-fill"
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              style={{ maxWidth: '200px', display: 'none' }}
            >
              <option value="english">English</option>
              <option value="marathi">Marathi</option>
              <option value="tamil">Tamil</option>
              <option value="bengali">Bengali</option>
            </CFormSelect>
            <CButton
              color="success"
              variant="outline"
              onClick={() => handleDownload(selectedLang)}
              className="d-print-none flex-fill"
            >
              Download PDF
            </CButton>
            <CButton
              color="success"
              variant="outline"
              onClick={() => handleSendWhatsApp()}
              className="d-print-none flex-fill"
            >
              Share on WhatsApp
            </CButton>
          </div>
        </CContainer>
      </CCardBody>
    </CCard>
  )
}

export default InvoiceDetails