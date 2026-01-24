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

  const [previousProformas, setPreviousProformas] = useState([]);


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
  gstPercentage: 0,  // ✅ Changed from 18 to 0
  sgstPercentage: 0, // ✅ Changed from 9 to 0
  cgstPercentage: 0, // ✅ Changed from 9 to 0
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
    remark: '',
    gst_percent: 18,  // ✅ Keep row-level GST at 18%
    cgst_amount: 9,
    sgst_amount: 9,
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
  



  // Load work order data
  useEffect(() => {
  if (workOrderData) {
    // ✅ FIX: Calculate GST percentages from order amounts
    let globalGstPercentage = 0;
    let globalSgstPercentage = 0;
    let globalCgstPercentage = 0;
    let globalIgstPercentage = 0;
    
    // Get amounts from order
    const totalAmount = parseFloat(workOrderData.totalAmount) || 0;
    const cgstAmount = parseFloat(workOrderData.cgst) || 0;
    const sgstAmount = parseFloat(workOrderData.sgst) || 0;
    const igstAmount = parseFloat(workOrderData.igst) || 0;
    const gstAmount = parseFloat(workOrderData.gst) || 0;
    
    // ✅ Calculate percentages from amounts (if totalAmount > 0)
    if (totalAmount > 0) {
      if (cgstAmount > 0) {
        globalCgstPercentage = Math.round((cgstAmount / totalAmount) * 100 * 100) / 100;
      }
      if (sgstAmount > 0) {
        globalSgstPercentage = Math.round((sgstAmount / totalAmount) * 100 * 100) / 100;
      }
      if (igstAmount > 0) {
        globalIgstPercentage = Math.round((igstAmount / totalAmount) * 100 * 100) / 100;
      }
      if (gstAmount > 0) {
        globalGstPercentage = Math.round((gstAmount / totalAmount) * 100 * 100) / 100;
      } else {
        globalGstPercentage = globalCgstPercentage + globalSgstPercentage + globalIgstPercentage;
      }
    }
    
    setForm(prev => ({
      ...prev,
      work_order_id: workOrderData.id,
      project_id: workOrderData.project_id,
      gstPercentage: globalGstPercentage,      // ✅ Calculated GST %
      sgstPercentage: globalSgstPercentage,    // ✅ Calculated SGST %
      cgstPercentage: globalCgstPercentage,    // ✅ Calculated CGST %
      igstPercentage: globalIgstPercentage,    // ✅ Calculated IGST %
    }))

    if (workOrderData.items && workOrderData.items.length > 0) {
      const loadedWorks = workOrderData.items.map(item => {
        const qty = parseFloat(item.qty) || 0;
        const price = parseFloat(item.price) || 0;
        const totalPrice = parseFloat(item.total_price) || 0;
        
        // ✅ Get GST % from order_details.gst_percent
        let gstPercent = 0;
        if (item.gst_percent !== null && item.gst_percent !== undefined) {
          gstPercent = parseFloat(item.gst_percent);
          if (isNaN(gstPercent)) gstPercent = 0;
        } else {
          // ✅ Fallback: Calculate from cgst_amount + sgst_amount
          const itemCgst = parseFloat(item.cgst_amount) || 0;
          const itemSgst = parseFloat(item.sgst_amount) || 0;
          const baseAmount = qty * price;
          
          if (baseAmount > 0 && (itemCgst > 0 || itemSgst > 0)) {
            const totalGstAmount = itemCgst + itemSgst;
            gstPercent = Math.round((totalGstAmount / baseAmount) * 100 * 100) / 100;
          }
        }
        
        const cgstAmount = parseFloat(item.cgst_amount) || 0;
        const sgstAmount = parseFloat(item.sgst_amount) || 0;
        
        return {
        id: item.id,  // ✅ ADD THIS LINE
        work_type: item.work_type || '',
        uom: item.uom || '',
        qty: qty,
        price: price,
        total_price: totalPrice,
        remark: item.remark || '',
        gst_percent: gstPercent,
        cgst_amount: cgstAmount,
        sgst_amount: sgstAmount,
      }
    })
    .sort((a, b) => (a.id || 0) - (b.id || 0))
      setWorks(loadedWorks)
      loadedWorks.forEach((_, i) => recalcRow(i, loadedWorks))
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




const recalcRow = (index, rows = works) => {
  const updated = [...rows]
  const w = updated[index]

  const base = (w.qty || 0) * (w.price || 0)
  const half = (w.gst_percent || 0) / 2

  w.cgst_amount = +(base * half / 100).toFixed(2)
  w.sgst_amount = +(base * half / 100).toFixed(2)
  w.total_price = +(base + w.cgst_amount + w.sgst_amount).toFixed(2)

  setWorks(updated)
  calculateTotals(updated)
}







// const handleWorkChange = (index, field, value) => {
//   const updated = [...works];

//   if (field === 'qty' || field === 'price') {
//     updated[index][field] = value === "" ? 0 : parseFloat(value) || 0;
//   } 
//   else if (field === 'gst_percent') {
//     updated[index].gst_percent = value === "" || value === null || value === undefined 
//       ? 0 
//       : parseFloat(value) || 0;
//   } 
//   else {
//     updated[index][field] = value;
//   }

//   const qty = updated[index].qty || 0;
//   const price = updated[index].price || 0;
//   const gstPercent = updated[index].gst_percent ?? 0;

//   const baseAmount = qty * price;
//   const halfGST = gstPercent / 2;

//   // ✅ Round to 2 decimal places
//   const cgst = Math.round((baseAmount * (halfGST / 100)) * 100) / 100;
//   const sgst = Math.round((baseAmount * (halfGST / 100)) * 100) / 100;

//   updated[index].cgst_amount = cgst;
//   updated[index].sgst_amount = sgst;
//   updated[index].total_price = Math.round((baseAmount + cgst + sgst) * 100) / 100;

//   setWorks(updated);
//   calculateTotals(updated);
// };





const handleWorkChange = (index, field, value) => {
  const updated = [...works]

  if (field === 'qty') {
    const max =
      updated[index].original_qty
        ? updated[index].original_qty - updated[index].used_qty
        : Infinity

    updated[index].qty = Math.max(
      0,
      Math.min(Number(value) || 0, max)
    )
  } else if (field === 'price' || field === 'gst_percent') {
    updated[index][field] = Number(value) || 0
  } else {
    updated[index][field] = value
  }

  setWorks(updated)
  recalcRow(index, updated)
}









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
      gst_percent: 18,  // ✅ Keep row-level GST at 18%
      cgst_amount: 9,
      sgst_amount: 9,
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



//  const calculateTotals = (currentWorks) => {
//   setForm(prev => {
//     // Calculate base subtotal
//     const subtotal = currentWorks.reduce((sum, w) => sum + (w.qty * w.price), 0);
    
//     // Calculate row-level GST totals
//     const totalCGST = currentWorks.reduce((sum, w) => sum + (w.cgst_amount || 0), 0);
//     const totalSGST = currentWorks.reduce((sum, w) => sum + (w.sgst_amount || 0), 0);
    
//     // Total after row GST
//     const totalAfterRowGST = currentWorks.reduce((sum, w) => sum + (w.total_price || 0), 0);
    
//     // Apply global GST percentages - ✅ Round to 2 decimals
//     // const globalSGST = Math.round((totalAfterRowGST * (prev.sgstPercentage / 100)) * 100) / 100;
//     // const globalCGST = Math.round((totalAfterRowGST * (prev.cgstPercentage / 100)) * 100) / 100;
//     const globalIGST = Math.round((totalAfterRowGST * (prev.igstPercentage / 100)) * 100) / 100;
//     const globalTotalGST = Math.round((globalSGST + globalCGST + globalIGST) * 100) / 100;
    
//     // Final calculation
//     const beforeDiscount = Math.round((totalAfterRowGST + globalTotalGST) * 100) / 100;
//     const finalAmount = Math.round((beforeDiscount - (prev.discount || 0)) * 100) / 100;
    
//     return {
//       ...prev,
//       subtotal: Math.round(subtotal * 100) / 100,
//       taxableAmount: Math.round(totalAfterRowGST * 100) / 100,
//       gstAmount: globalTotalGST,
//       cgstAmount: globalCGST,
//       sgstAmount: globalSGST,
//       igstAmount: globalIGST,
//       finalAmount: finalAmount,
//     };
//   });
// };




// const calculateTotals = (currentWorks) => {
//   setForm(prev => {
//     const subtotal = currentWorks.reduce(
//       (sum, w) => sum + ((w.qty || 0) * (w.price || 0)),
//       0
//     )

//     const totalCGST = currentWorks.reduce(
//       (sum, w) => sum + (w.cgst_amount || 0),
//       0
//     )

//     const totalSGST = currentWorks.reduce(
//       (sum, w) => sum + (w.sgst_amount || 0),
//       0
//     )

//     const finalAmount = currentWorks.reduce(
//       (sum, w) => sum + (w.total_price || 0),
//       0
//     )

//     return {
//       ...prev,
//       subtotal: +subtotal.toFixed(2),
//       taxableAmount: +subtotal.toFixed(2),
//       cgstAmount: +totalCGST.toFixed(2),
//       sgstAmount: +totalSGST.toFixed(2),
//       gstAmount: +(totalCGST + totalSGST).toFixed(2),
//       finalAmount: +finalAmount.toFixed(2),
//     }
//   })
// }

const calculateTotals = (rows = works) => {
  const taxable = rows.reduce(
    (s, w) => s + (w.qty || 0) * (w.price || 0),
    0
  )

  const cgst = rows.reduce((s, w) => s + (w.cgst_amount || 0), 0)
  const sgst = rows.reduce((s, w) => s + (w.sgst_amount || 0), 0)

  setForm(prev => ({
    ...prev,
    subtotal: +taxable.toFixed(2),
    taxableAmount: +taxable.toFixed(2),
    cgstAmount: +cgst.toFixed(2),
    sgstAmount: +sgst.toFixed(2),
    gstAmount: +(cgst + sgst).toFixed(2),
    finalAmount: +(taxable + cgst + sgst - (prev.discount || 0)).toFixed(2)
  }))
}


























const fetchPreviousProformas = async () => {
  try {
    const resp = await getAPICall(
      `/api/proforma-invoices?work_order_id=${workOrderId}`
    );

    setPreviousProformas(resp?.data?.data || []);
  } catch (err) {
    console.error('Failed to load previous proformas', err);
    setPreviousProformas([]);
  }
};

console.log('Previous Proformas:', previousProformas);



useEffect(() => {
  if (workOrderId) {
    fetchPreviousProformas();
  }
}, [workOrderId]);








useEffect(() => {
  if (!workOrderData?.items) return;

  const loadedWorks = workOrderData.items.map(original => {
    const originalWorkType = original.work_type?.trim().toLowerCase();
    const originalQty = parseFloat(original.qty) || 0;

    let used = 0;

    previousProformas.forEach(proforma => {
      proforma.details?.forEach(detail => {
        if (
          detail.work_type?.trim().toLowerCase() === originalWorkType
        ) {
          used += parseFloat(detail.qty) || 0;
        }
      });
    });

    const remaining = Math.max(0, originalQty - used);

    return {
      original_qty: originalQty,
      used_qty: used,
      work_type: original.work_type || "",
      uom: original.uom || "",
      qty: remaining,
      price: parseFloat(original.price) || 0,
      total_price: parseFloat(original.total_price) || 0,
      remark: original.remark || "",
      gst_percent: parseFloat(original.gst_percent) || 18,
      cgst_amount: parseFloat(original.cgst_amount) || 0,
      sgst_amount: parseFloat(original.sgst_amount) || 0,
    };
  });

  setWorks(loadedWorks);
  loadedWorks.forEach((_, i) => recalcRow(i, loadedWorks))
  calculateTotals(loadedWorks);
}, [workOrderData, previousProformas]);


















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
        gst_percent: item.gst_percent !== null && item.gst_percent !== undefined 
          ? parseFloat(item.gst_percent) 
          : 0,
        cgst_amount: parseFloat(item.cgst_amount) || 0,
        sgst_amount: parseFloat(item.sgst_amount) || 0,
      }))

    const data = {
      work_order_id: form.work_order_id,
      project_id: form.project_id,
      tally_invoice_number: form.tally_invoice_number || null,
      invoice_date: form.invoice_date,
      delivery_date: form.delivery_date || null,
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
      showToast('danger', resp.message || 'Failed to create proforma invoice', 8000)
    }
  } catch (error) {
    console.error('Submit error:', error)
    
    const errorMessage = error.message || 'Failed to create proforma invoice'
    
    showToast('danger', errorMessage, 8000)
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
                  <div className="small text-muted">Type: {workOrderData.project?.project_type?.name}</div>
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













              <h6 className="mt-4 mb-3 fw-semibold text-primary border-bottom border-primary pb-2">
  Work Details
</h6>

{works.map((w, idx) => (
  <div key={idx} className="border rounded p-3 mb-3 bg-light">
    {/* First Row */}
    <CRow className="g-3 mb-2 align-items-end">
      <CCol md={3}>
        <CFormInput
          label="Work Type *"
          placeholder="Work Type"
          value={w.work_type}
          onChange={(e) => handleWorkChange(idx, 'work_type', e.target.value)}
          required
        />
      </CCol>

      <CCol md={2}>
        <CFormInput
          label="UOM"
          placeholder="Unit"
          value={w.uom}
          onChange={(e) => handleWorkChange(idx, 'uom', e.target.value)}
        />
      </CCol>

      {/* <CCol md={2}>
        <CFormInput
          label="Qty *"
          type="number"
          placeholder="Qty"
          step="0.01"
          min="0"
          value={w.qty}
          onChange={(e) => handleWorkChange(idx, 'qty', e.target.value)}
          required
        />
      </CCol> */}




<CCol md={2}>
  <CFormLabel><span> Qty *
  {w.original_qty > 0 && w.used_qty > 0 && (
    <small className="text-danger d-block mt-1">
      {/* Remaining: <strong>{(w.original_qty - w.used_qty).toFixed(2)}</strong>  */}
      Billed : {w.used_qty.toFixed(2)} of {w.original_qty.toFixed(2)}
    </small>
  )} </span>
  </CFormLabel>
  <CFormInput
    type="number"
    step="0.01"
    min="0"
    value={w.qty}
    onChange={(e) => {
      let val = parseFloat(e.target.value) || 0;
      if (w.original_qty) {  // only limit for original items
        const max = w.original_qty - w.used_qty;
        val = Math.min(val, max);
        val = Math.max(0, val);
      }
      handleWorkChange(idx, 'qty', val);
    }}
    required
  />
 
</CCol>




      <CCol md={2}>
        <CFormLabel>Rate *</CFormLabel>
        <CInputGroup>
          <CInputGroupText>₹</CInputGroupText>
          <CFormInput
            type="number"
            step="0.01"
            min="0"
            value={w.price}
            onChange={(e) => handleWorkChange(idx, 'price', e.target.value)}
            required
            readOnly
            disabled
          />
        </CInputGroup>
      </CCol>

      <CCol md={2}>
        <CFormLabel>Base Amount</CFormLabel>
        <div className="fw-medium">₹{((w.qty || 0) * (w.price || 0)).toFixed(2)}</div>
      </CCol>

      <CCol md={1} className="d-flex align-items-end">
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

    {/* Second Row */}
    <CRow className="g-3 align-items-end">
      <CCol md={2}>
        <CFormInput
          label="GST %"
          type="number"
          step="0.01"
          min="0"
          max="100"
          value={w.gst_percent}
          onChange={(e) => handleWorkChange(idx, 'gst_percent', e.target.value)}
          readOnly
            disabled
        />
      </CCol>

      <CCol md={2}>
      <CFormLabel>CGST</CFormLabel>
      <div className="text-success fw-medium">₹{Number(w.cgst_amount || 0).toFixed(2)}</div>
    </CCol>

    <CCol md={2}>
      <CFormLabel>SGST</CFormLabel>
      <div className="text-success fw-medium">₹{Number(w.sgst_amount || 0).toFixed(2)}</div>
    </CCol>

      <CCol md={2}>
        <CFormLabel className="text-primary">Total (with GST)</CFormLabel>
        <div className="fw-bold text-primary">₹{(w.total_price || 0).toFixed(2)}</div>
      </CCol>

      <CCol md={4}>
        <CFormInput
          label="Remark"
          placeholder="Remark"
          value={w.remark}
          onChange={(e) => handleWorkChange(idx, 'remark', e.target.value)}
        />
      </CCol>
    </CRow>
  </div>
))}



{/* <CButton
  color="warning"
  variant="outline"
  className="mb-4"
  onClick={addWorkRow}
>
  + Add Work
</CButton> */}


  <h6 className="mt-4 mb-3 fw-semibold text-primary border-bottom border-primary pb-2">
 Calculations 
</h6>

              {/* GST Details */}
             {/*} <h6 className="mt-4 mb-3 fw-semibold text-primary border-bottom border-primary pb-2">
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
              </CRow> */}

              {/* Financial Summary */}
              <CRow className="mb-3">
                <CCol md={3}>
                  <CFormLabel>Total Amount before GST</CFormLabel>
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
                {/* <CCol md={3}>
                  <CFormLabel>Taxable Amount</CFormLabel>
                  <CInputGroup>
                    <CInputGroupText>₹</CInputGroupText>
                    <CFormInput
                      type="number"
                      value={form.taxableAmount.toFixed(2)}
                      readOnly
                    />
                  </CInputGroup>
                </CCol> */}
                <CCol md={3}>
                  <CFormLabel>Total Amount after GST</CFormLabel>
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

















// import React, { useState, useEffect } from 'react'
// import { useLocation, useNavigate } from 'react-router-dom'
// import {
//   CCard, CCardBody, CCardHeader, CButton, CForm, CFormInput,
//   CFormLabel, CRow, CCol, CInputGroup, CInputGroupText,
//   CSpinner, CAlert, CFormTextarea
// } from '@coreui/react'
// import CIcon from '@coreui/icons-react'
// import { cilArrowLeft, cilSave } from '@coreui/icons'
// import { post, getAPICall } from '../../../util/api'
// import { useToast } from '../../common/toast/ToastContext'

// const CreateProformaInvoice = () => {
//   const location = useLocation()
//   const navigate = useNavigate()
//   const { showToast } = useToast()
//   const { workOrderId, workOrderData } = location.state || {}

//   const [loading, setLoading] = useState(false)
//   const [validated, setValidated] = useState(false)
//   const [previousProformas, setPreviousProformas] = useState([])

//   const [form, setForm] = useState({
//     discount: 0,
//     subtotal: 0,
//     taxableAmount: 0,
//     cgstAmount: 0,
//     sgstAmount: 0,
//     gstAmount: 0,
//     finalAmount: 0,
//     notes: ''
//   })

//   const [works, setWorks] = useState([])

//   /* ---------------- FETCH PREVIOUS PROFORMAS ---------------- */
//   useEffect(() => {
//     if (!workOrderId) return
//     getAPICall(`/api/proforma-invoices?work_order_id=${workOrderId}`)
//       .then(res => setPreviousProformas(res?.data?.data || []))
//       .catch(() => setPreviousProformas([]))
//   }, [workOrderId])

//   /* ---------------- LOAD WORK ORDER ITEMS ---------------- */
//   useEffect(() => {
//     if (!workOrderData?.items) return

//     const loaded = workOrderData.items.map(original => {
//       const originalQty = Number(original.qty) || 0
//       let used = 0

//       previousProformas.forEach(p =>
//         p.details?.forEach(d => {
//           if (d.work_type === original.work_type) {
//             used += Number(d.qty) || 0
//           }
//         })
//       )

//       const remaining = Math.max(0, originalQty - used)

//       return {
//         original_qty: originalQty,
//         used_qty: used,
//         work_type: original.work_type,
//         uom: original.uom,
//         qty: remaining,
//         price: Number(original.price) || 0,
//         gst_percent: Number(original.gst_percent) || 18,
//         cgst_amount: 0,
//         sgst_amount: 0,
//         total_price: 0,
//         remark: ''
//       }
//     })

//     setWorks(loaded)

//     loaded.forEach((_, i) =>
//       recalcRow(i, loaded)
//     )
//   }, [workOrderData, previousProformas])

//   /* ---------------- ROW CALCULATION ---------------- */
//   const recalcRow = (index, rows = works) => {
//     const updated = [...rows]
//     const w = updated[index]

//     const base = (w.qty || 0) * (w.price || 0)
//     const half = (w.gst_percent || 0) / 2

//     w.cgst_amount = +(base * half / 100).toFixed(2)
//     w.sgst_amount = +(base * half / 100).toFixed(2)
//     w.total_price = +(base + w.cgst_amount + w.sgst_amount).toFixed(2)

//     setWorks(updated)
//     calculateTotals(updated)
//   }

//   /* ---------------- WORK CHANGE ---------------- */
//   const handleWorkChange = (idx, field, value) => {
//     const updated = [...works]

//     if (field === 'qty') {
//       const max = updated[idx].original_qty - updated[idx].used_qty
//       updated[idx].qty = Math.max(0, Math.min(Number(value) || 0, max))
//     } else if (field === 'price' || field === 'gst_percent') {
//       updated[idx][field] = Number(value) || 0
//     } else {
//       updated[idx][field] = value
//     }

//     setWorks(updated)
//     recalcRow(idx, updated)
//   }

//   /* ---------------- SUMMARY TOTALS ---------------- */
//   const calculateTotals = rows => {
//     const taxable = rows.reduce((s, w) => s + (w.qty * w.price), 0)
//     const cgst = rows.reduce((s, w) => s + w.cgst_amount, 0)
//     const sgst = rows.reduce((s, w) => s + w.sgst_amount, 0)

//     setForm(prev => ({
//       ...prev,
//       subtotal: +taxable.toFixed(2),
//       taxableAmount: +taxable.toFixed(2),
//       cgstAmount: +cgst.toFixed(2),
//       sgstAmount: +sgst.toFixed(2),
//       gstAmount: +(cgst + sgst).toFixed(2),
//       finalAmount: +(taxable + cgst + sgst - prev.discount).toFixed(2)
//     }))
//   }

//   /* ---------------- SUBMIT ---------------- */
//   const handleSubmit = async e => {
//     e.preventDefault()
//     if (!e.currentTarget.checkValidity()) {
//       setValidated(true)
//       return
//     }

//     try {
//       setLoading(true)

//       const payload = {
//         work_order_id: workOrderId,
//         project_id: workOrderData.project_id,
//         discount: form.discount,
//         notes: form.notes,
//         items: works.map(w => ({
//           work_type: w.work_type,
//           uom: w.uom,
//           qty: w.qty,
//           price: w.price,
//           gst_percent: w.gst_percent,
//           cgst_amount: w.cgst_amount,
//           sgst_amount: w.sgst_amount,
//           total_price: w.total_price,
//           remark: w.remark
//         }))
//       }

//       const res = await post('/api/proforma-invoices', payload)
//       showToast('success', 'Proforma created')
//       navigate(`/proforma-invoice-details/${res.data.id}`)
//     } catch {
//       showToast('danger', 'Failed')
//     } finally {
//       setLoading(false)
//     }
//   }

//   if (!workOrderId) {
//     return <CAlert color="warning">No Work Order</CAlert>
//   }

//   return (
//     <CCard>
//       <CCardHeader>
//         <CButton size="sm" onClick={() => navigate(-1)}>
//           <CIcon icon={cilArrowLeft} /> Back
//         </CButton>
//       </CCardHeader>

//       <CCardBody>
//         <CForm validated={validated} onSubmit={handleSubmit}>
//           {works.map((w, i) => (
//             <div key={i} className="border p-3 mb-3">
//               <CRow>
//                 <CCol md={3}>
//                   <CFormInput value={w.work_type} readOnly />
//                 </CCol>
//                 <CCol md={2}>
//                   <CFormInput type="number" value={w.qty}
//                     onChange={e => handleWorkChange(i, 'qty', e.target.value)} />
//                   <small className="text-danger">
//                     Billed {w.used_qty} of {w.original_qty}
//                   </small>
//                 </CCol>
//                 <CCol md={2}>
//                   <CFormInput type="number" value={w.price}
//                     onChange={e => handleWorkChange(i, 'price', e.target.value)} />
//                 </CCol>
//                 <CCol md={2}>
//                   ₹{(w.qty * w.price).toFixed(2)}
//                 </CCol>
//                 <CCol md={3}>
//                   Total ₹{w.total_price.toFixed(2)}
//                 </CCol>
//               </CRow>
//             </div>
//           ))}

//           <CRow className="mt-3">
//             <CCol md={3}>Taxable ₹{form.subtotal}</CCol>
//             <CCol md={3}>GST ₹{form.gstAmount}</CCol>
//             <CCol md={3}><b>Final ₹{form.finalAmount}</b></CCol>
//           </CRow>

//           <CButton type="submit" color="primary" disabled={loading}>
//             {loading ? <CSpinner size="sm" /> : <CIcon icon={cilSave} />}
//             Submit
//           </CButton>
//         </CForm>
//       </CCardBody>
//     </CCard>
//   )
// }

// export default CreateProformaInvoice

