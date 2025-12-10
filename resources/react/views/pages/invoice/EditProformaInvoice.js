import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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
  CFormSelect,
  CBadge,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilArrowLeft, cilPencil, cilSave, cilX } from '@coreui/icons'
import { getAPICall, put } from '../../../util/api'
import { useToast } from '../../common/toast/ToastContext'

const EditProformaInvoice = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [validated, setValidated] = useState(false)
  const [rules, setRules] = useState([])
  const [selectedRules, setSelectedRules] = useState([])
  const [proformaData, setProformaData] = useState(null)

  const [form, setForm] = useState({
    tally_invoice_number: '',
    invoice_date: '',
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
    status: 'draft',
    terms_conditions: '',
    payment_terms: '',
  })

  const [works, setWorks] = useState([
    { work_type: '', uom: '', qty: 0, price: 0, total_price: 0, remark: '' },
  ])

  // Payment Terms
  const [paymentTerms, setPaymentTerms] = useState([])
  const [editingPaymentIndex, setEditingPaymentIndex] = useState(-1)
  const [editingPaymentValue, setEditingPaymentValue] = useState('')
  const [newPaymentTerm, setNewPaymentTerm] = useState('')

  // Terms & Conditions
  const [termsAndConditions, setTermsAndConditions] = useState([])
  const [editingConditionIndex, setEditingConditionIndex] = useState(-1)
  const [editingConditionValue, setEditingConditionValue] = useState('')
  const [newCondition, setNewCondition] = useState('')

  // Fetch proforma invoice data
  useEffect(() => {
    fetchProformaInvoice()
    fetchRules()
  }, [id])

  const fetchProformaInvoice = async () => {
    try {
      setLoading(true)
      const response = await getAPICall(`/api/proforma-invoices/${id}`)
      
      if (response && response.success && response.data) {
        const data = response.data
        setProformaData(data)

        // Set form data
        setForm({
          tally_invoice_number: data.tally_invoice_number || '',
          invoice_date: data.invoice_date?.split('T')[0] || '',
          delivery_date: data.delivery_date?.split('T')[0] || '',
          discount: parseFloat(data.discount) || 0,
          subtotal: parseFloat(data.subtotal) || 0,
          taxableAmount: parseFloat(data.taxable_amount) || 0,
          gstAmount: parseFloat(data.gst_amount) || 0,
          sgstAmount: parseFloat(data.sgst_amount) || 0,
          cgstAmount: parseFloat(data.cgst_amount) || 0,
          igstAmount: parseFloat(data.igst_amount) || 0,
          finalAmount: parseFloat(data.final_amount) || 0,
          gstPercentage: parseFloat(data.gst_percentage) || 18,
          sgstPercentage: parseFloat(data.sgst_percentage) || 9,
          cgstPercentage: parseFloat(data.cgst_percentage) || 9,
          igstPercentage: parseFloat(data.igst_percentage) || 0,
          notes: data.notes || '',
          status: data.status || 'draft',
          terms_conditions: data.terms_conditions || '',
          payment_terms: data.payment_terms || '',
        })

        // Set work items
        // if (data.details && data.details.length > 0) {
        //   setWorks(data.details.map(item => ({
        //     work_type: item.work_type || '',
        //     uom: item.uom || '',
        //     qty: parseFloat(item.qty) || 0,
        //     price: parseFloat(item.price) || 0,
        //     total_price: parseFloat(item.total_price) || 0,
        //     remark: item.remark || '',
        //   })))
        // }

        if (data.details && data.details.length > 0) {
  setWorks(data.details.map(item => ({
    work_type: item.work_type || '',
    uom: item.uom || '',
    qty: parseFloat(item.qty) || 0,
    price: parseFloat(item.price) || 0,
    total_price: parseFloat(item.total_price) || 0,
    gst_percent: parseFloat(item.gst_percent) || 18,      // New
    cgst_amount: parseFloat(item.cgst_amount) || 0,      // New
    sgst_amount: parseFloat(item.sgst_amount) || 0,      // New
    remark: item.remark || '',
  })))
}

        // Set payment terms
        if (data.payment_terms) {
          setPaymentTerms(data.payment_terms.split('\n').filter(term => term.trim()))
        }

        // Set terms and conditions
        if (data.terms_conditions) {
          setTermsAndConditions(data.terms_conditions.split('\n').filter(term => term.trim()))
        }

        // Set selected rules
        if (data.invoice_rules && data.invoice_rules.length > 0) {
          setSelectedRules(data.invoice_rules.map(ir => ir.rules_id))
        }
      }
    } catch (error) {
      console.error('Error fetching proforma invoice:', error)
      showToast('danger', 'Failed to load proforma invoice')
      setTimeout(() => navigate('/invoiceTable'), 2000)
    } finally {
      setLoading(false)
    }
  }

  const fetchRules = async () => {
    try {
      const resp = await getAPICall('/api/rules')
      setRules(Array.isArray(resp) ? resp : [])
    } catch (error) {
      console.error('Error fetching rules:', error)
    }
  }

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
  //   setWorks([...works, { work_type: '', uom: '', qty: 0, price: 0, total_price: 0, remark: '' }])
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
    if (works.length === 1) return
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
      subtotal: subtotal,
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

    // if (works.length === 0 || works.every(w => !w.work_type || w.qty <= 0)) {
    //   showToast('danger', 'Please add at least one valid work item')
    //   return
    // }

    try {
      setSaving(true)

      const data = {
        tally_invoice_number: form.tally_invoice_number || null,
        invoice_date: form.invoice_date,
        delivery_date: form.delivery_date || null,
        // items: works.filter(w => w.work_type && w.qty > 0),


        items: works
  .filter(w => w.work_type && w.qty > 0)
  .map(w => ({
    work_type: w.work_type,
    uom: w.uom,
    qty: w.qty,
    price: w.price,
    total_price: w.total_price,
    remark: w.remark || '',
    gst_percent: w.gst_percent,
    cgst_amount: w.cgst_amount,
    sgst_amount: w.sgst_amount,
  })),

        discount: form.discount,
        gst_percentage: form.gstPercentage,
        cgst_percentage: form.cgstPercentage,
        sgst_percentage: form.sgstPercentage,
        igst_percentage: form.igstPercentage,
        rule_ids: selectedRules,
        notes: form.notes || null,
        status: form.status,
        terms_conditions: termsAndConditions.join('\n') || null,
        payment_terms: paymentTerms.join('\n') || null,
      }

      const resp = await put(`/api/proforma-invoices/${id}`, data)

      if (resp && resp.success) {
        showToast('success', 'Proforma invoice updated successfully')
        setTimeout(() => {
          navigate(`/proforma-invoice-details/${id}`)
        }, 1500)
      } else {
        throw new Error(resp.message || 'Failed to update proforma invoice')
      }
    } catch (error) {
      console.error('Update error:', error)
      const errorMessage = error.response?.data?.message || 'Failed to update proforma invoice'
      showToast('danger', errorMessage)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <CCard>
        <CCardBody className="text-center py-5">
          <CSpinner color="primary" />
          <div className="mt-3">Loading proforma invoice...</div>
        </CCardBody>
      </CCard>
    )
  }

  if (!proformaData) {
    return (
      <CCard>
        <CCardBody>
          <CAlert color="danger">
            <h5>Proforma Invoice Not Found</h5>
            <p>The requested proforma invoice could not be found.</p>
            <CButton color="primary" onClick={() => navigate('/invoiceTable')}>
              Back to Orders
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
              <strong>Edit Proforma Invoice #{proformaData.proforma_invoice_number}</strong>
              <CButton
                color="secondary"
                size="sm"
                onClick={() => navigate(`/proforma-invoice-details/${id}`)}
              >
                <CIcon icon={cilArrowLeft} className="me-1" />
                Back to Details
              </CButton>
            </div>
          </CCardHeader>
          <CCardBody>
            {/* Work Order Info */}
            <div className="bg-light p-3 rounded mb-4">
              <h6 className="mb-2">Work Order Information</h6>
              <CRow>
                <CCol md={3}>
                  <small className="text-muted">Work Order #:</small>
                  <div><strong>{proformaData.work_order?.invoice_number}</strong></div>
                </CCol>
                <CCol md={3}>
                  <small className="text-muted">Project:</small>
                  <div><strong>{proformaData.project?.project_name}</strong></div>
                </CCol>
                <CCol md={3}>
                  <small className="text-muted">Customer:</small>
                  <div><strong>{proformaData.customer?.name}</strong></div>
                </CCol>
                <CCol md={3}>
                  <small className="text-muted">Payment Status:</small>
                  <div><strong className="text-capitalize">{proformaData.payment_status}</strong></div>
                </CCol>
              </CRow>
            </div>

            <CForm validated={validated} onSubmit={handleSubmit}>
              {/* Invoice Details */}
              <CRow className="mb-3">
                <CCol md={3}>
                  <CFormLabel>Tally Invoice Number</CFormLabel>
                  <CFormInput
                    type="text"
                    name="tally_invoice_number"
                    value={form.tally_invoice_number}
                    onChange={handleFormChange}
                    placeholder="Optional"
                  />
                </CCol>
                <CCol md={3}>
                  <CFormLabel>Invoice Date *</CFormLabel>
                  <CFormInput
                    type="date"
                    name="invoice_date"
                    value={form.invoice_date}
                    onChange={handleFormChange}
                    required
                  />
                </CCol>
                <CCol md={3}>
                  <CFormLabel>Delivery Date</CFormLabel>
                  <CFormInput
                    type="date"
                    name="delivery_date"
                    value={form.delivery_date}
                    onChange={handleFormChange}
                  />
                </CCol>
                <CCol md={3}>
                  <CFormLabel>Status</CFormLabel>
                  <CFormSelect
                    name="status"
                    value={form.status}
                    onChange={handleFormChange}
                  >
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="approved">Approved</option>
                    <option value="cancelled">Cancelled</option>
                  </CFormSelect>
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
                      placeholder="Unit"
                      value={w.uom}
                      onChange={(e) => handleWorkChange(idx, 'uom', e.target.value)}
                    />
                  </CCol>
                  <CCol md={2}>
                    <CFormInput
                      type="number"
                      placeholder="Quantity"
                      value={w.qty}
                      onChange={(e) => handleWorkChange(idx, 'qty', e.target.value)}
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
                        onChange={(e) => handleWorkChange(idx, 'price', e.target.value)}
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
      <div className="text-success fw-medium">₹{w.cgst_amount.toFixed(2)}</div>
    </CCol>
    <CCol md={1}>
      <CFormLabel>SGST</CFormLabel>
      <div className="text-success fw-medium">₹{w.sgst_amount.toFixed(2)}</div>
    </CCol>
    <CCol md={1}>
      <CFormLabel className="text-primary">Total</CFormLabel>
      <div className="fw-bold text-primary">₹{w.total_price.toFixed(2)}</div>
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
                  <small className="text-muted">Amount: ₹{form.gstAmount.toFixed(2)}</small>
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
                  <small className="text-muted">Amount: ₹{form.sgstAmount.toFixed(2)}</small>
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
                  <small className="text-muted">Amount: ₹{form.cgstAmount.toFixed(2)}</small>
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
                  <small className="text-muted">Amount: ₹{form.igstAmount.toFixed(2)}</small>
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
                            newTerms[idx] = editingPaymentValue.trim()
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

              {/* Terms & Conditions */}
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
                            newConditions[idx] = editingConditionValue.trim()
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
                    placeholder="Enter any additional notes..."
                  />
                </CCol>
              </CRow>

              <div className="d-flex gap-2">
                <CButton
                  color="primary"
                  type="submit"
                  disabled={saving}
                >
                  {saving ? <CSpinner size="sm" /> : <CIcon icon={cilSave} className="me-1" />}
                  Update Proforma Invoice
                </CButton>
                <CButton
                  color="secondary"
                  onClick={() => navigate(`/proforma-invoice-details/${id}`)}
                  disabled={saving}
                >
                  Cancel
                </CButton>
              </div>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default EditProformaInvoice