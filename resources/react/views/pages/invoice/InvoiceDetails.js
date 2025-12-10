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
  ref_id:''

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

    setFormData({
      project_name: response.project?.project_name || 'N/A',
      customer: {
        name: response.project?.customer_name || 'N/A',
        address: response.project?.work_place || 'N/A',
        mobile: response.project?.mobile_number || 'N/A',
      },
      gst_number: response.project?.gst_number || 'N/A', 
      pan_number: response.project?.pan_number || 'N/A',
      
      date: response.invoiceDate || '',
      items: (response.items || []).map((item) => ({
        work_type: item.product_name || item.work_type || 'N/A',
        qty: item.dQty || item.qty || 0,
        uom:item.uom || 'N/A',
        price: item.dPrice || item.price || 0,
        total_price: item.total_price || 0,
        remark: item.remark || '',
      })),
      discount: discountValue,
      amountPaid: response.paidAmount || 0,
      paymentMode: paymentModeString,
      invoiceStatus: orderStatusString,
      totalAmount: totalAmount,
      finalAmount: finalAmount,

      cgst: Number(response.cgst || 0).toFixed(2),
  sgst: Number(response.sgst || 0).toFixed(2),
  gst:  Number(response.gst  || 0).toFixed(2),
  igst: Number(response.igst || 0).toFixed(2),

  ref_id:response.ref_id,
  po_number:response.po_number || '',

  // terms: response.terms,
  terms_and_conditions: response.terms_and_conditions|| '',
  payment_terms: response.payment_terms|| '',
  note: response.note|| '',

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

      console.log('Customer GST Number:', formData?.gst_number  );



  useEffect(() => {
    fetchOrder()
  }, [id])

  // const handleSendWhatsApp = async () => {
  //   try {
  //     const pdfBlob = await generateMultiLanguagePDF(
  //       formData.finalAmount,
  //       formData.invoice_number,
  //       formData.customer.name,
  //       formData,
  //       remainingAmount,
  //       totalAmountWords,
  //       selectedLang,
  //       'blob'
  //     )

  //     const formDataUpload = new FormData()
  //     formDataUpload.append('file', pdfBlob, `${formData.invoice_number}_${formData.customer.name}.pdf`)

  //     const uploadResponse = await postFormData('/api/upload', formDataUpload)
  //     const pdfUrl = uploadResponse.fileUrl

  //     const message = encodeURIComponent(`*Invoice from ${ci?.company_name || 'Company'}*
      
  //     Project: ${formData.project_name}
  //     Invoice Number: ${formData.invoice_number}
  //     Total Amount: ₹${formData.finalAmount}
  //     Amount Paid: ₹${formData.amountPaid}
  //     Remaining: ₹${remainingAmount}
      
  //     View Invoice: ${pdfUrl}
      
  //     Thank you!`)

  //     const whatsappUrl = `https://wa.me/${formData.customer.mobile}?text=${message}`
  //     window.open(whatsappUrl, '_blank')
  //   } catch (error) {
  //     showToast('danger', 'Error sharing on WhatsApp: ' + error.message)
  //   }
  // }

  const handleSendWhatsApp = async () => {
  try {
    // ✅ 1. Generate PDF in the browser (no upload)
    const pdfBlob = await generateMultiLanguagePDF(
      formData.finalAmount,
      formData.invoice_number,
      formData.customer.name,
      formData,
      remainingAmount,
      totalAmountWords,
      selectedLang,
      'blob'  // keep 'blob' to get PDF as Blob
    )

    // ✅ 2. Create a temporary local URL for the Blob
    const pdfUrl = URL.createObjectURL(pdfBlob)

    // ✅ 3. Prepare WhatsApp message with direct link
    const message = encodeURIComponent(`*Invoice from ${ci?.company_name || 'Company'}*\n
Project: ${formData.project_name}
Invoice Number: ${formData.invoice_number}
Total Amount: ₹${formData.finalAmount}
Amount Paid: ₹${formData.amountPaid}
Remaining: ₹${remainingAmount}

📄 Download Invoice: ${pdfUrl}

Thank you!`)

    // ✅ 4. Open WhatsApp with the message
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
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.length > 0 ? (
                    formData.items.map((item, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{item.work_type}</td>
                        <td>{item?.uom}</td>
                        <td>₹{item.price.toFixed(2)}</td>
                        <td>{item.qty}</td>
                        <td>₹{item.total_price.toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center">No work details available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {formData.discount > 0 && (
            <div className="row section">
              <div className="col-md-12">
                <table className="table table-bordered border-black">
                  <tbody>
                    <tr>
                      <td>Total Amount :</td>
                      <td className="text-center">₹{formData.totalAmount}</td>
                    </tr>
                    <tr>
                      <td>Discount:</td>
                      <td className="text-center">₹{formData.discount}</td>
                    </tr>
                    <tr>
                      <td>Final Amount:</td>
                      <td className="text-center">₹{formData.finalAmount}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}



{formData.discount === 0 && (
  <div className="row section">
    <div className="col-md-12">
      <table className="table table-bordered border-black">
        <tbody>
          <tr>
            <td><strong>Total Amount (Without GST):</strong></td>
            <td className="text-center">₹{formData.totalAmount}</td>
          </tr>
          <tr>
            <td><strong>CGST:</strong></td>
            <td className="text-center">₹{formData.cgst}</td>
          </tr>
          <tr>
            <td><strong>SGST:</strong></td>
            <td className="text-center">₹{formData.sgst}</td>
          </tr>
          <tr>
            <td><strong>Total GST:</strong></td>
            <td className="text-center">₹{formData.gst}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
)}




          {formData.discount === 0 && (
            <div className="row section">
              <div className="col-md-12">
                <table className="table table-bordered border-black">
                  <tbody>
                    <tr>
                      <td>Total Amount with GST:</td>
                      <td className="text-center">₹{formData.finalAmount}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

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
                  {/* <tr>
                    <td>Payment Mode:</td>
                    <td>{formData.paymentMode}</td>
                  </tr> */}
                </tbody>
              </table>
            </div>
          </div>

          {/* <div className="d-flex flex-column flex-md-row border p-3 border-black">
            {(ci?.bank_name || ci?.account_no || ci?.IFSC_code) && (
              <div className="flex-fill mb-3 mb-md-0">
                <div className="d-flex flex-column">
                  <h6>Bank Details</h6>
                  {ci?.bank_name && <p className="mb-1">{ci.bank_name}</p>}
                  {ci?.account_no && <p className="mb-1">Account No: {ci.account_no}</p>}
                  {ci?.IFSC_code && <p className="mb-0">IFSC code: {ci.IFSC_code}</p>}
                </div>
              </div>
            )}

            {ci?.paymentQRCode && (
              <div className="flex-fill mb-3 mb-md-0">
                <div className="d-flex flex-column align-items-center text-center">
                  <h6>QR CODE</h6>
                  <img
                    height="120"
                    width="120"
                    src={'img/' + ci.paymentQRCode}
                    alt="QR Code"
                    className="img-fluid"
                    style={{ maxWidth: '120px', height: 'auto' }}
                  />
                  <p className="mb-0 mt-2">Scan to Pay</p>
                </div>
              </div>
            )}

            {ci?.sign && (
              <div className="flex-fill">
                <div className="d-flex flex-column align-items-center text-center">
                  <h6>E-SIGNATURE</h6>
                  <img
                    height="25"
                    width="100"
                    src={'img/' + ci.sign}
                    alt="signature"
                    className="img-fluid"
                    style={{ maxWidth: '200px', height: 'auto' }}
                  />
                  <p className="mb-0 mt-2">Authorized Signature</p>
                </div>
              </div>
            )}

            {!(ci?.bank_name || ci?.account_no || ci?.IFSC_code || ci?.paymentQRCode || ci?.sign) && (
              <div className="flex-fill text-center">
                <p className="mb-0 text-muted">No payment or signature details available</p>
              </div>
            )}
          </div> */}



<div className="row section mt-3">
            <div className="col-md-12">
              {/* <h6>Payment Terms & Conditions</h6> */}
              {/* <ul>
                {Array.isArray(formData.invoice_rules) && formData.invoice_rules.length > 0 ? (
                  formData.invoice_rules.map((rule, index) => (
                    <li key={index}>{rule.rule?.description || 'N/A'}</li>
                  ))
                ) : (
                  <li>No terms and conditions specified</li>
                )}
              </ul> */}

{/* NOTE */}
<h6 className="mt-4 mb-2 fw-semibold text-primary border-bottom border-primary pb-2">
  Note
</h6>
<p className="ms-2 text-dark">
  {formData?.note ? formData.note : "No note available."}
</p>

{/* PAYMENT TERMS */}
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

{/* TERMS & CONDITIONS */}
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
              style={{  display:'none'}}
            >
              Print
            </CButton>
            <CFormSelect
              className="mb-2 d-print-none flex-fill"
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              style={{ maxWidth: '200px' , display:'none'}}
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