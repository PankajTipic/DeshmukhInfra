import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CButton,
  CForm,
  CFormInput,
  CFormLabel,
  CRow,
  CCol,
  CInputGroup,
  CInputGroupText,
  CSpinner,
  CAlert,
  CFormTextarea,
  CFormCheck,
  CBadge,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilArrowLeft, cilPencil, cilSave, cilX } from '@coreui/icons'
import { post, getAPICall } from '../../../util/api'
import { useToast } from '../../common/toast/ToastContext'

const CreateProformaInvoice = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { workOrderId, workOrderData } = location.state || {}

  const [loading, setLoading] = useState(false)
  const [validated, setValidated] = useState(false)
  const [rules, setRules] = useState([])
  const [selectedRules, setSelectedRules] = useState([])

  const [form, setForm] = useState({
    work_order_id: workOrderId || null,
    project_id: workOrderData?.project_id || null,
    tally_invoice_number: '',
    invoice_date: new Date().toISOString().split('T')[0],
    delivery_date: '',
    discount: 0,
    subtotal: 0,
    taxableAmount: 0,
    gstAmount: 0,
    sgstAmount: 0,
    cgstAmount: 0,
    igstAmount: 0,
    finalAmount: 0,
    gstPercentage: 18,
    sgstPercentage: 9,
    cgstPercentage: 9,
    igstPercentage: 0,
    notes: '',
    terms_conditions:'',
    payment_terms:''
  })

  // const [works, setWorks] = useState([
  //   { work_type: '', uom:'', qty: 0, price: 0, total_price: 0, remark: '' }
  // ])

  const [works, setWorks] = useState([
  {
    work_type: '',
    uom: '',
    qty: 0,
    price: 0,
    total_price: 0,
    remark: '',        // Will include base + CGST + SGST
    gst_percent: 18,       // New: per-line GST %
    cgst_amount: 0,
    sgst_amount: 0,
    
  }
])


   // --- Payment Terms ---
  const initialPaymentTerms = [
    '25% Advance release on team mobilization onsite.',
    '25% Release on completion of pile foundation.',
    '20% Release after completion of MMS and Module mounting.',
    '20% to be released on completion of AC/DC.',
    '10% released after work has been completed and handed over to the client.'
  ]
  const [paymentTerms, setPaymentTerms] = useState(initialPaymentTerms)
  const [editingPaymentIndex, setEditingPaymentIndex] = useState(-1)
  const [editingPaymentValue, setEditingPaymentValue] = useState('')
  const [newPaymentTerm, setNewPaymentTerm] = useState('')
  
  // --- Terms & Conditions ---
  const initialTermsAndConditions = [
    '18% Tax Extra',
    'ROW on your side',
    'Work will commence only after receiving an official work order'
  ]
  const [termsAndConditions, setTermsAndConditions] = useState(initialTermsAndConditions)
  const [editingConditionIndex, setEditingConditionIndex] = useState(-1)
  const [editingConditionValue, setEditingConditionValue] = useState('')
  const [newCondition, setNewCondition] = useState('')
  
  // --- Note ---
  const [note, setNote] = useState('')
  








  // // Fetch rules
  // useEffect(() => {
  //   const fetchRules = async () => {
  //     try {
  //       const resp = await getAPICall('/api/rules')
  //       setRules(Array.isArray(resp) ? resp : [])
  //     } catch (error) {
  //       console.error('Error fetching rules:', error)
  //       showToast('danger', 'Failed to fetch rules')
  //     }
  //   }
  //   fetchRules()
  // }, [])

  // Load work order data
  useEffect(() => {
    if (workOrderData) {
      setForm(prev => ({
        ...prev,
        work_order_id: workOrderData.id,
        project_id: workOrderData.project_id,
      }))

      if (workOrderData.items && workOrderData.items.length > 0) {
        const loadedWorks = workOrderData.items.map(item => ({
          work_type: item.work_type || '',
          uom:item.uom || '',
          qty: item.qty || 0,
          price: item.price || 0,
          total_price: item.total_price || 0,
          remark: item.remark || '',
          gst_percent: item.gst_percent || 18,
          cgst_amount: item.cgst_amount || 0,
          sgst_amount: item.sgst_amount || 0,
        }))
        setWorks(loadedWorks)
        calculateTotals(loadedWorks)
      }
    }
  }, [workOrderData])

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setForm(prev => {
      let newForm = {
        ...prev,
        [name]: name === 'discount' || name.endsWith('Percentage') 
          ? parseFloat(value) || 0 
          : value,
      }

      if (name === 'gstPercentage') {
        const totalGST = parseFloat(value) || 0
        const halfGST = totalGST / 2
        newForm = {
          ...newForm,
          sgstPercentage: halfGST,
          cgstPercentage: halfGST,
        }
      } else if (name === 'sgstPercentage' || name === 'cgstPercentage') {
        const sgst = name === 'sgstPercentage' ? parseFloat(value) || 0 : prev.sgstPercentage
        const cgst = name === 'cgstPercentage' ? parseFloat(value) || 0 : prev.cgstPercentage
        newForm = {
          ...newForm,
          gstPercentage: sgst + cgst,
        }
      }

      if (name === 'discount' || name.endsWith('Percentage')) {
        const subtotal = works.reduce((sum, w) => sum + (w.total_price || 0), 0)
        const base = subtotal - newForm.discount
        const sgstAmount = base * (newForm.sgstPercentage / 100)
        const cgstAmount = base * (newForm.cgstPercentage / 100)
        const igstAmount = base * (newForm.igstPercentage / 100)
        const gstAmount = sgstAmount + cgstAmount + igstAmount
        const finalAmount = base + gstAmount
        
        newForm = {
          ...newForm,
          subtotal,
          taxableAmount: base,
          gstAmount,
          sgstAmount,
          cgstAmount,
          igstAmount,
          finalAmount,
        }
      }

      return newForm
    })
  }

  // const handleWorkChange = (index, field, value) => {
  //   const updated = [...works]
  //   updated[index][field] = field === 'qty' || field === 'price' 
  //     ? parseFloat(value) || 0 
  //     : value
  //   updated[index].total_price = (updated[index].qty || 0) * (updated[index].price || 0)
  //   setWorks(updated)
  //   calculateTotals(updated)
  // }



const handleWorkChange = (index, field, value) => {
  const updated = [...works];

  if (field === 'qty' || field === 'price' || field === 'gst_percent') {
    updated[index][field] = parseFloat(value) || 0;
  } else {
    updated[index][field] = value;
  }

  const qty = updated[index].qty || 0;
  const price = updated[index].price || 0;
  const gstPercent = updated[index].gst_percent || 0;

  const baseAmount = qty * price;
  const cgst = baseAmount * (gstPercent / 2 / 100);
  const sgst = baseAmount * (gstPercent / 2 / 100);
  const finalLineTotal = baseAmount + cgst + sgst;

  updated[index].total_price = finalLineTotal;
  updated[index].cgst_amount = cgst;
  updated[index].sgst_amount = sgst;

  setWorks(updated);
  calculateTotals(updated);
};



  // const addWorkRow = () => {
  //   setWorks([...works, { work_type: '', uom:'', qty: 0, price: 0, total_price: 0, remark: '' }])
  // }


  const addWorkRow = () => {
  setWorks([
    ...works,
    {
      work_type: '',
      uom: '',
      qty: 0,
      price: 0,
      total_price: 0,
      gst_percent: 18,
      cgst_amount: 0,
      sgst_amount: 0,
      remark: ''
    }
  ]);
};

  const removeWorkRow = (index) => {
    const updated = [...works]
    updated.splice(index, 1)
    setWorks(updated)
    calculateTotals(updated)
  }

  // const calculateTotals = (currentWorks) => {
  //   setForm(prev => {
  //     const subtotal = currentWorks.reduce((sum, w) => sum + (w.total_price || 0), 0)
  //     const base = subtotal - (prev.discount || 0)
  //     const sgstAmount = base * (prev.sgstPercentage / 100)
  //     const cgstAmount = base * (prev.cgstPercentage / 100)
  //     const igstAmount = base * (prev.igstPercentage / 100)
  //     const gstAmount = sgstAmount + cgstAmount + igstAmount
  //     const finalAmount = base + gstAmount
      
  //     return { 
  //       ...prev, 
  //       subtotal, 
  //       taxableAmount: base, 
  //       gstAmount, 
  //       sgstAmount, 
  //       cgstAmount, 
  //       igstAmount, 
  //       finalAmount 
  //     }
  //   })
  // }

  const calculateTotals = (currentWorks) => {
  setForm(prev => {
    const subtotal = currentWorks.reduce((sum, w) => sum + (w.qty * w.price), 0);
    const totalCGST = currentWorks.reduce((sum, w) => sum + (w.cgst_amount || 0), 0);
    const totalSGST = currentWorks.reduce((sum, w) => sum + (w.sgst_amount || 0), 0);
    const totalGST = totalCGST + totalSGST;
    const grandTotal = currentWorks.reduce((sum, w) => sum + (w.total_price || 0), 0);

    return {
      ...prev,
      subtotal: subtotal,              // Sum of base amounts only
      taxableAmount: subtotal,
      gstAmount: totalGST,
      cgstAmount: totalCGST,
      sgstAmount: totalSGST,
      igstAmount: 0,
      finalAmount: grandTotal - (prev.discount || 0),
    };
  });
};

 const handleSubmit = async (e) => {
    e.preventDefault()
    const formElement = e.currentTarget

    if (!formElement.checkValidity()) {
      setValidated(true)
      return
    }

    if (!form.work_order_id || !form.project_id) {
      showToast('danger', 'Work order and project information missing')
      return
    }

    if (works.length === 0 || works.every(w => !w.work_type || w.qty <= 0)) {
      showToast('danger', 'Please add at least one valid work item')
      return
    }

    try {
      setLoading(true)



      const itemsWithGST = works
      .filter(w => w.work_type && w.qty > 0)
      .map(item => ({
        work_type: item.work_type,
        uom: item.uom || null,
        qty: parseFloat(item.qty) || 0,
        price: parseFloat(item.price) || 0,
        total_price: parseFloat(item.total_price) || 0,
        remark: item.remark || null,
        gst_percent: parseFloat(item.gst_percent) || 18,        // ← SEND THIS
        cgst_amount: parseFloat(item.cgst_amount) || 0,         // ← SEND THIS
        sgst_amount: parseFloat(item.sgst_amount) || 0,         // ← SEND THIS
      }))

      const data = {
        work_order_id: form.work_order_id,
        project_id: form.project_id,
        tally_invoice_number: form.tally_invoice_number || null,
        invoice_date: form.invoice_date,
        delivery_date: form.delivery_date || null,
        // items: works.filter(w => w.work_type && w.qty > 0),
        items: itemsWithGST,
        discount: form.discount,
        gst_percentage: form.gstPercentage,
        cgst_percentage: form.cgstPercentage,
        sgst_percentage: form.sgstPercentage,
        igst_percentage: form.igstPercentage,
        rule_ids: selectedRules,
        notes: form.notes || null,
         payment_terms: paymentTerms.join('\n'),
  terms_conditions: termsAndConditions.join('\n'),
      }

      const resp = await post('/api/proforma-invoices', data)

      if (resp && resp.success) {
        showToast('success', 'Proforma invoice created successfully')
        setTimeout(() => {
          navigate(`/proforma-invoice-details/${resp.data.id}`)
        }, 1500)
      } else {
        throw new Error(resp.message || 'Failed to create proforma invoice')
      }
    } catch (error) {
      console.error('Submit error:', error)
      
      // Extract detailed error message from backend
      const errorMessage = error.response?.data?.message || 'Failed to create proforma invoice'
      const errorData = error.response?.data?.data
      
      // If there's detailed allocation info, show it
      if (errorData && errorData.work_order_total !== undefined) {
        const detailMsg = `\n\nWork Order Total: ₹${errorData.work_order_total.toLocaleString()}\n` +
                         `Already Allocated: ₹${errorData.already_allocated.toLocaleString()}\n` +
                         `Remaining: ₹${errorData.remaining_amount.toLocaleString()}\n` +
                         `Requested: ₹${errorData.requested_amount.toLocaleString()}`
        showToast('danger', errorMessage + detailMsg, 8000) // Show for 8 seconds
      } else {
        showToast('danger', errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  if (!workOrderId || !workOrderData) {
    return (
      <CCard>
        <CCardBody>
          <CAlert color="warning">
            <h5>No Work Order Selected</h5>
            <p>Please select a work order to create a proforma invoice.</p>
            <CButton color="primary" onClick={() => navigate('/invoiceTable')}>
              Go to Orders
            </CButton>
          </CAlert>
        </CCardBody>
      </CCard>
    )
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <div className="d-flex justify-content-between align-items-center">
              <strong>Create Proforma Invoice</strong>
              <CButton
                color="secondary"
                size="sm"
                onClick={() => navigate('/invoiceTable')}
              >
                <CIcon icon={cilArrowLeft} className="me-1" />
                Back to Orders
              </CButton>
            </div>
          </CCardHeader>
          <CCardBody>
            {/* Work Order Info */}
            <div className="bg-light p-3 rounded mb-4">
              <h6 className="mb-2">Work Order Information</h6>
              <CRow>
                <CCol md={3}>
                  <small className="text-muted">Work Order :</small>
                  <div><strong>{workOrderData.invoice_number}</strong></div>
                </CCol>
                <CCol md={3}>
                  <small className="text-muted">Project:</small>
                  <div><strong>{workOrderData.project?.project_name}</strong></div>
                </CCol>
                <CCol md={3}>
                  <small className="text-muted">Customer:</small>
                  <div><strong>{workOrderData.project?.customer_name}</strong></div>
                </CCol>
                <CCol md={3}>
                  <small className="text-muted">Location:</small>
                  <div>{workOrderData.project?.work_place}</div>
                </CCol>
              </CRow>
            </div>

            <CForm validated={validated} onSubmit={handleSubmit}>
              {/* Invoice Details */}
              <CRow className="mb-3">
                <CCol md={4}>
                  <CFormLabel>Tally Invoice Number</CFormLabel>
                  <CFormInput
                    type="text"
                    name="tally_invoice_number"
                    value={form.tally_invoice_number}
                    onChange={handleFormChange}
                    placeholder="Optional - Enter Tally invoice "
                  />
                </CCol>
                <CCol md={4}>
                  <CFormLabel>Invoice Date *</CFormLabel>
                  <CFormInput
                    type="date"
                    name="invoice_date"
                    value={form.invoice_date}
                    onChange={handleFormChange}
                    required
                  />
                </CCol>
                <CCol md={4}>
                  <CFormLabel>Delivery Date</CFormLabel>
                  <CFormInput
                    type="date"
                    name="delivery_date"
                    value={form.delivery_date}
                    onChange={handleFormChange}
                  />
                </CCol>
              </CRow>

              {/* Work Details */}
              <h6 className="mt-4 mb-3 fw-semibold text-primary border-bottom border-primary pb-2">
                Work Details
              </h6>


              {/* {works.map((w, idx) => (
                <CRow className="g-3 mb-3 align-items-center" key={idx}>
                  <CCol md={2}>
                    <CFormInput
                  
                      placeholder="Work Type"
                      value={w.work_type}
                      onChange={(e) => handleWorkChange(idx, 'work_type', e.target.value)}
                      required
                    />
                  </CCol>

                  <CCol md={2}>
                    <CFormInput
                      placeholder="Unit of Measurerment"
                      value={w.uom}
                      onChange={(e) => handleWorkChange(idx, 'uom', e.target.value)}
                      required
                    />
                  </CCol>

                  <CCol md={2}>
                    <CFormInput
                      type="number"
                      placeholder="Quantity"
                      value={w.qty}
                      onChange={(e) => handleWorkChange(idx, 'qty', parseFloat(e.target.value) || 0)}
                      min="0"
                      required
                    />
                  </CCol>
                  <CCol md={2}>
                    <CInputGroup>
                      <CInputGroupText>₹</CInputGroupText>
                      <CFormInput
                        type="number"
                        placeholder="Price"
                        value={w.price}
                        onChange={(e) => handleWorkChange(idx, 'price', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                        required
                      />
                    </CInputGroup>
                  </CCol>
                  <CCol md={1}>
                    <span className="text-success fw-medium">₹{w.total_price.toFixed(2)}</span>
                  </CCol>
                  <CCol md={2}>
                    <CFormInput
                      placeholder="Remark"
                      value={w.remark}
                      onChange={(e) => handleWorkChange(idx, 'remark', e.target.value)}
                    />
                  </CCol>
                  <CCol md={1}>
                    <CButton
                      color="danger"
                      size="sm"
                      onClick={() => removeWorkRow(idx)}
                      disabled={works.length === 1}
                    >
                      ×
                    </CButton>
                  </CCol>
                </CRow>
              ))} */}

{works.map((w, idx) => (
  <CRow className="g-3 mb-3 align-items-end" key={idx}>
    <CCol md={2}>
      <CFormLabel>Work Type *</CFormLabel>
      <CFormInput
        placeholder="Work Type"
        value={w.work_type}
        onChange={(e) => handleWorkChange(idx, 'work_type', e.target.value)}
        required
      />
    </CCol>

    <CCol md={1}>
      <CFormLabel>UOM</CFormLabel>
      <CFormInput
        placeholder="Unit"
        value={w.uom}
        onChange={(e) => handleWorkChange(idx, 'uom', e.target.value)}
      />
    </CCol>

    <CCol md={1}>
      <CFormLabel>Qty</CFormLabel>
      <CFormInput
        type="number"
        placeholder="Qty"
        step="0.01"
        min="0"
        value={w.qty}
        onChange={(e) => handleWorkChange(idx, 'qty', e.target.value)}
        required
      />
    </CCol>

    <CCol md={1}>
      <CFormLabel>Rate</CFormLabel>
      <CInputGroup>
        <CInputGroupText>₹</CInputGroupText>
        <CFormInput
          type="number"
          step="0.01"
          min="0"
          value={w.price}
          onChange={(e) => handleWorkChange(idx, 'price', e.target.value)}
          required
        />
      </CInputGroup>
    </CCol>

    <CCol md={1}>
      <CFormLabel>Base Amt</CFormLabel>
      <div className="fw-medium">₹{(w.qty * w.price).toFixed(2)}</div>
    </CCol>

    <CCol md={1}>
      <CFormInput
        label="GST %"
        type="number"
        step="0.01"
        min="0"
        max="100"
        value={w.gst_percent}
        onChange={(e) => handleWorkChange(idx, 'gst_percent', e.target.value)}
      />
    </CCol>

    <CCol md={1}>
      <CFormLabel>CGST</CFormLabel>
      <div className="text-success fw-medium">₹{w.cgst_amount}</div>
    </CCol>

    <CCol md={1}>
      <CFormLabel>SGST</CFormLabel>
      <div className="text-success fw-medium">₹{w.sgst_amount}</div>
    </CCol>

    <CCol md={1}>
      <CFormLabel className="text-primary">Total</CFormLabel>
      <div className="fw-bold text-primary">₹{w.total_price}</div>
    </CCol>

    <CCol md={1}>
      <CFormInput
        placeholder="Remark"
        value={w.remark}
        onChange={(e) => handleWorkChange(idx, 'remark', e.target.value)}
      />
    </CCol>

    <CCol md={1} className="d-flex align-items-end">
      <CButton
        color="danger"
        size="sm"
        className="w-100"
        onClick={() => removeWorkRow(idx)}
        disabled={works.length === 1}
      >
        ×
      </CButton>
    </CCol>
  </CRow>
))}



              <CButton
                color="warning"
                variant="outline"
                className="mb-4"
                onClick={addWorkRow}
              >
                + Add Work
              </CButton>

              {/* GST Details */}
              <h6 className="mt-4 mb-3 fw-semibold text-primary border-bottom border-primary pb-2">
                GST Details
              </h6>
              <CRow className="mb-3">
                <CCol md={3}>
                  <CFormLabel>Total GST (%)</CFormLabel>
                  <CInputGroup>
                    <CFormInput
                      type="number"
                      name="gstPercentage"
                      value={form.gstPercentage}
                      onChange={handleFormChange}
                      min="0"
                      max="100"
                      step="0.01"
                    />
                    <CInputGroupText>%</CInputGroupText>
                  </CInputGroup>
                  <small className="text-muted">Amount: ₹{form.gstAmount}</small>
                </CCol>
                <CCol md={3}>
                  <CFormLabel>SGST (%)</CFormLabel>
                  <CInputGroup>
                    <CFormInput
                      type="number"
                      name="sgstPercentage"
                      value={form.sgstPercentage}
                      onChange={handleFormChange}
                      min="0"
                      max="50"
                      step="0.01"
                    />
                    <CInputGroupText>%</CInputGroupText>
                  </CInputGroup>
                  <small className="text-muted">Amount: ₹{form.sgstAmount}</small>
                </CCol>
                <CCol md={3}>
                  <CFormLabel>CGST (%)</CFormLabel>
                  <CInputGroup>
                    <CFormInput
                      type="number"
                      name="cgstPercentage"
                      value={form.cgstPercentage}
                      onChange={handleFormChange}
                      min="0"
                      max="50"
                      step="0.01"
                    />
                    <CInputGroupText>%</CInputGroupText>
                  </CInputGroup>
                  <small className="text-muted">Amount: ₹{form.cgstAmount}</small>
                </CCol>
                <CCol md={3}>
                  <CFormLabel>IGST (%)</CFormLabel>
                  <CInputGroup>
                    <CFormInput
                      type="number"
                      name="igstPercentage"
                      value={form.igstPercentage}
                      onChange={handleFormChange}
                      min="0"
                      max="100"
                      step="0.01"
                    />
                    <CInputGroupText>%</CInputGroupText>
                  </CInputGroup>
                  <small className="text-muted">Amount: ₹{form.igstAmount}</small>
                </CCol>
              </CRow>

              {/* Financial Summary */}
              <CRow className="mb-3">
                <CCol md={3}>
                  <CFormLabel>Subtotal</CFormLabel>
                  <CInputGroup>
                    <CInputGroupText>₹</CInputGroupText>
                    <CFormInput
                      type="number"
                      value={form.subtotal.toFixed(2)}
                      readOnly
                    />
                  </CInputGroup>
                </CCol>
                <CCol md={3}>
                  <CFormLabel>Discount</CFormLabel>
                  <CInputGroup>
                    <CInputGroupText>₹</CInputGroupText>
                    <CFormInput
                      type="number"
                      name="discount"
                      value={form.discount}
                      onChange={handleFormChange}
                      min="0"
                      step="0.01"
                    />
                  </CInputGroup>
                </CCol>
                <CCol md={3}>
                  <CFormLabel>Taxable Amount</CFormLabel>
                  <CInputGroup>
                    <CInputGroupText>₹</CInputGroupText>
                    <CFormInput
                      type="number"
                      value={form.taxableAmount.toFixed(2)}
                      readOnly
                    />
                  </CInputGroup>
                </CCol>
                <CCol md={3}>
                  <CFormLabel>Final Amount</CFormLabel>
                  <CInputGroup>
                    <CInputGroupText>₹</CInputGroupText>
                    <CFormInput
                      type="number"
                      value={form.finalAmount.toFixed(2)}
                      readOnly
                      className="fw-bold"
                    />
                  </CInputGroup>
                </CCol>
              </CRow>

              {/* Payment Terms */}
              {/* <h6 className="mt-4 mb-3 fw-semibold text-primary border-bottom border-primary pb-2">
                Payment Terms
              </h6>
              <CRow className="mb-3">
                {rules.filter(r => r.type === 'payment').map((rule) => (
                  <CCol md={12} key={rule.id}>
                    <CFormCheck
                      id={`rule_${rule.id}`}
                      label={rule.description}
                      checked={selectedRules.includes(rule.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRules(prev => [...prev, rule.id])
                        } else {
                          setSelectedRules(prev => prev.filter(id => id !== rule.id))
                        }
                      }}
                    />
                  </CCol>
                ))}
              </CRow>

              Terms & Conditions
              <h6 className="mt-4 mb-3 fw-semibold text-primary border-bottom border-primary pb-2">
                Terms & Conditions
              </h6>
              <CRow className="mb-3">
                {rules.filter(r => r.type === 'term').map((rule) => (
                  <CCol md={12} key={rule.id}>
                    <CFormCheck
                      id={`rule_${rule.id}`}
                      label={rule.description}
                      checked={selectedRules.includes(rule.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRules(prev => [...prev, rule.id])
                        } else {
                          setSelectedRules(prev => prev.filter(id => id !== rule.id))
                        }
                      }}
                    />
                  </CCol>
                ))}
              </CRow> */}





{/* PAYMENT TERMS */}
<h6 className="mt-4 mb-3 fw-semibold text-primary border-bottom border-primary pb-2">
  Payment Terms
</h6>
<div className="d-flex flex-wrap gap-2 mb-3">
  {paymentTerms.map((term, idx) => {
    if (editingPaymentIndex === idx) {
      return (
        <CInputGroup key={idx} style={{ width: 'auto' }}>
          <CFormInput
            value={editingPaymentValue}
            onChange={(e) => setEditingPaymentValue(e.target.value)}
          />
          <CButton
            color="success"
            onClick={() => {
              const newTerms = [...paymentTerms]
              newTerms[idx] = editingPaymentValue
              setPaymentTerms(newTerms)
              setEditingPaymentIndex(-1)
            }}
          >
            Save
          </CButton>
          <CButton color="secondary" onClick={() => setEditingPaymentIndex(-1)}>
            Cancel
          </CButton>
        </CInputGroup>
      )
    } else {
      return (
        <CBadge
          color="info"
          key={idx}
          className="me-1 mb-1"
          style={{ fontSize: '0.9em' }}
        >
          {term}
          <CIcon
            icon={cilPencil}
            className="ms-2"
            style={{ cursor: 'pointer' }}
            onClick={() => {
              setEditingPaymentIndex(idx)
              setEditingPaymentValue(term)
            }}
          />
          <CIcon
            icon={cilX}
            className="ms-1"
            style={{ cursor: 'pointer' }}
            onClick={() => {
              setPaymentTerms(paymentTerms.filter((_, i) => i !== idx))
            }}
          />
        </CBadge>
      )
    }
  })}
</div>
<CRow className="mb-3">
  <CCol md={6}>
    <CInputGroup>
      <CFormInput
        placeholder="Add new payment term..."
        value={newPaymentTerm}
        onChange={(e) => setNewPaymentTerm(e.target.value)}
      />
      <CButton
        color="primary"
        onClick={() => {
          if (newPaymentTerm.trim()) {
            setPaymentTerms([...paymentTerms, newPaymentTerm.trim()])
            setNewPaymentTerm('')
          }
        }}
      >
        Add
      </CButton>
    </CInputGroup>
  </CCol>
</CRow>

{/* TERMS & CONDITIONS */}
<h6 className="mt-4 mb-3 fw-semibold text-primary border-bottom border-primary pb-2">
  Terms & Conditions
</h6>
<div className="d-flex flex-wrap gap-2 mb-3">
  {termsAndConditions.map((term, idx) => {
    if (editingConditionIndex === idx) {
      return (
        <CInputGroup key={idx} style={{ width: 'auto' }}>
          <CFormInput
            value={editingConditionValue}
            onChange={(e) => setEditingConditionValue(e.target.value)}
          />
          <CButton
            color="success"
            onClick={() => {
              const newConditions = [...termsAndConditions]
              newConditions[idx] = editingConditionValue
              setTermsAndConditions(newConditions)
              setEditingConditionIndex(-1)
            }}
          >
            Save
          </CButton>
          <CButton
            color="secondary"
            onClick={() => setEditingConditionIndex(-1)}
          >
            Cancel
          </CButton>
        </CInputGroup>
      )
    } else {
      return (
        <CBadge
          color="warning"
          key={idx}
          className="me-1 mb-1"
          style={{ fontSize: '0.9em' }}
        >
          {term}
          <CIcon
            icon={cilPencil}
            className="ms-2"
            style={{ cursor: 'pointer' }}
            onClick={() => {
              setEditingConditionIndex(idx)
              setEditingConditionValue(term)
            }}
          />
          <CIcon
            icon={cilX}
            className="ms-1"
            style={{ cursor: 'pointer' }}
            onClick={() => {
              setTermsAndConditions(termsAndConditions.filter((_, i) => i !== idx))
            }}
          />
        </CBadge>
      )
    }
  })}
</div>
<CRow className="mb-3">
  <CCol md={6}>
    <CInputGroup>
      <CFormInput
        placeholder="Add new condition..."
        value={newCondition}
        onChange={(e) => setNewCondition(e.target.value)}
      />
      <CButton
        color="primary"
        onClick={() => {
          if (newCondition.trim()) {
            setTermsAndConditions([...termsAndConditions, newCondition.trim()])
            setNewCondition('')
          }
        }}
      >
        Add
      </CButton>
    </CInputGroup>
  </CCol>
</CRow>








              {/* Notes */}
              <CRow className="mb-3">
                <CCol md={12}>
                  <CFormLabel>Additional Notes</CFormLabel>
                  <CFormTextarea
                    name="notes"
                    value={form.notes}
                    onChange={handleFormChange}
                    rows={3}
                    placeholder="Enter any additional notes or instructions..."
                  />
                </CCol>
              </CRow>

              <CButton
                color="primary"
                type="submit"
                disabled={loading}
              >
                {loading ? <CSpinner size="sm" /> : <CIcon icon={cilSave} className="me-1" />}
                Create Proforma Invoice
              </CButton>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default CreateProformaInvoice