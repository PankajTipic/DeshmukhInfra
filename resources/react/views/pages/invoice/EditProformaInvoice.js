
// import React, { useState, useEffect } from 'react'
// import { useParams, useNavigate } from 'react-router-dom'
// import {
//   CCard,
//   CCardBody,
//   CCardHeader,
//   CButton,
//   CForm,
//   CFormInput,
//   CFormLabel,
//   CRow,
//   CCol,
//   CInputGroup,
//   CInputGroupText,
//   CSpinner,
//   CAlert,
//   CFormTextarea,
//   CFormSelect,
//   CBadge,
// } from '@coreui/react'
// import CIcon from '@coreui/icons-react'
// import { cilArrowLeft, cilPencil, cilSave, cilX } from '@coreui/icons'
// import { getAPICall, put } from '../../../util/api'
// import { useToast } from '../../common/toast/ToastContext'

// const EditProformaInvoice = () => {
//   const { id } = useParams()
//   const navigate = useNavigate()
//   const { showToast } = useToast()

//   const [loading, setLoading] = useState(true)
//   const [saving, setSaving] = useState(false)
//   const [validated, setValidated] = useState(false)
//   const [rules, setRules] = useState([])
//   const [selectedRules, setSelectedRules] = useState([])
//   const [proformaData, setProformaData] = useState(null)
//   const [workOrderData, setWorkOrderData] = useState(null)
//   const [previousProformas, setPreviousProformas] = useState([])

//   const [form, setForm] = useState({
//     tally_invoice_number: '',
//     invoice_date: '',
//     delivery_date: '',
//     discount: 0,
//     subtotal: 0,
//     taxableAmount: 0,
//     gstAmount: 0,
//     sgstAmount: 0,
//     cgstAmount: 0,
//     igstAmount: 0,
//     finalAmount: 0,
//     gstPercentage: 0,
//     sgstPercentage: 0,
//     cgstPercentage: 0,
//     igstPercentage: 0,
//     notes: '',
//     status: 'draft',
//     terms_conditions: '',
//     payment_terms: '',
//   })

//   const [works, setWorks] = useState([
//     { work_type: '', uom: '', qty: 0, price: 0, total_price: 0, remark: '' },
//   ])


//   console.log(works);


//   // Payment Terms
//   const [paymentTerms, setPaymentTerms] = useState([])
//   const [editingPaymentIndex, setEditingPaymentIndex] = useState(-1)
//   const [editingPaymentValue, setEditingPaymentValue] = useState('')
//   const [newPaymentTerm, setNewPaymentTerm] = useState('')

//   // Terms & Conditions
//   const [termsAndConditions, setTermsAndConditions] = useState([])
//   const [editingConditionIndex, setEditingConditionIndex] = useState(-1)
//   const [editingConditionValue, setEditingConditionValue] = useState('')
//   const [newCondition, setNewCondition] = useState('')

//   // Fetch all data on mount
//   useEffect(() => {
//     fetchProformaInvoice()
//     fetchRules()
//   }, [id])

//   // Fetch work order when proforma data is loaded
//   // useEffect(() => {
//   //   if (proformaData?.work_order_id) {
//   //     fetchWorkOrder(proformaData.work_order_id)
//   //     fetchPreviousProformas(proformaData.work_order_id)
//   //   }
//   // }, [proformaData?.work_order_id])

//   useEffect(() => {
//   if (!proformaData?.work_order_id) return

//   // 🔥 correct order fetch
//   getAPICall(`/api/order/${proformaData.work_order_id}`)
//     .then(res => setWorkOrderData(res))

//   // 🔥 correct previous PI fetch
//   fetchPreviousProformas(proformaData.work_order_id)
// }, [proformaData])


 

//   const fetchProformaInvoice = async () => {
//     try {
//       setLoading(true)
//       const response = await getAPICall(`/api/proforma-invoices/${id}`)
      
//       if (response && response.success && response.data) {
//         const data = response.data
//         setProformaData(data)

//         // Set basic form data
//         const gstPercentage = parseFloat(data.gst_percentage) || 0
//         const sgstPercentage = parseFloat(data.sgst_percentage) || 0
//         const cgstPercentage = parseFloat(data.cgst_percentage) || 0
//         const igstPercentage = parseFloat(data.igst_percentage) || 0
        
//         setForm({
//           tally_invoice_number: data.tally_invoice_number || '',
//           invoice_date: data.invoice_date?.split('T')[0] || '',
//           delivery_date: data.delivery_date?.split('T')[0] || '',
//           discount: parseFloat(data.discount) || 0,
//           subtotal: parseFloat(data.subtotal) || 0,
//           taxableAmount: parseFloat(data.taxable_amount) || 0,
//           gstAmount: parseFloat(data.gst_amount) || 0,
//           sgstAmount: parseFloat(data.sgst_amount) || 0,
//           cgstAmount: parseFloat(data.cgst_amount) || 0,
//           igstAmount: parseFloat(data.igst_amount) || 0,
//           finalAmount: parseFloat(data.final_amount) || 0,
//           gstPercentage: gstPercentage,
//           sgstPercentage: sgstPercentage,
//           cgstPercentage: cgstPercentage,
//           igstPercentage: igstPercentage,
//           notes: data.notes || '',
//           status: data.status || 'draft',
//           terms_conditions: data.terms_conditions || '',
//           payment_terms: data.payment_terms || '',
//         })

//         // Set initial works (will be recalculated with limits later)
//         if (data.details && data.details.length > 0) {
//           const mappedWorks = data.details.map(item => ({
//             id: item.id,
//             work_type: item.work_type || '',
//             uom: item.uom || '',
//             qty: parseFloat(item.qty) || 0,
//             price: parseFloat(item.price) || 0,
//             total_price: parseFloat(item.total_price) || 0,
//             gst_percent: parseFloat(item.gst_percent) || 0,
//             cgst_amount: parseFloat(item.cgst_amount) || 0,
//             sgst_amount: parseFloat(item.sgst_amount) || 0,
//             remark: item.remark || '',
//             original_qty: 0,
//             used_qty: 0,
//           })).sort((a, b) => (a.id || 0) - (b.id || 0))
          
//           setWorks(mappedWorks)
//         }

//         // Set payment terms
//         if (data.payment_terms) {
//           const terms = data.payment_terms.split('\n').filter(term => term.trim() !== '')
//           setPaymentTerms(terms.length > 0 ? terms : [])
//         }

//         // Set terms and conditions
//         if (data.terms_conditions) {
//           const conditions = data.terms_conditions.split('\n').filter(term => term.trim() !== '')
//           setTermsAndConditions(conditions.length > 0 ? conditions : [])
//         }

//         // Set selected rules
//         if (data.invoice_rules && data.invoice_rules.length > 0) {
//           setSelectedRules(data.invoice_rules.map(ir => ir.rules_id))
//         }
//       } else {
//         showToast('danger', 'Failed to load proforma invoice')
//         setTimeout(() => navigate('/invoiceTable'), 2000)
//       }
//     } catch (error) {
//       console.error('Error fetching proforma invoice:', error)
//       showToast('danger', 'Failed to load proforma invoice')
//       setTimeout(() => navigate('/invoiceTable'), 2000)
//     } finally {
//       setLoading(false)
//     }
//   }





// useEffect(() => {
//   if (!workOrderData?.items || !proformaData) return

//   const normalize = v => (v || '').trim().toLowerCase()

//   const updatedWorks = workOrderData.items.map(item => {
//     const key = normalize(item.work_type)
    
//     // ← इथे Number() आवश्यक आहे! string → number करा
//     const originalQty = Number(item.qty) || 0   // यामुळे 1000.00 येईल

//     let usedQty = 0
//     previousProformas.forEach(p => {
//       p.details?.forEach(d => {
//         if (normalize(d.work_type) === key) {
//           usedQty += Number(d.qty) || 0
//         }
//       })
//     })

//     const currentDetail = proformaData.details.find(
//       d => normalize(d.work_type) === key
//     )

//     const currentQty = currentDetail ? Number(currentDetail.qty) : 0

//     return {
//       id: currentDetail?.id,
//       work_type: item.work_type || '',
//       uom: item.uom || '',
//       qty: currentQty,
//       price: currentDetail ? Number(currentDetail.price) : Number(item.price) || 0,
//       gst_percent: currentDetail ? Number(currentDetail.gst_percent) : 18,
//       cgst_amount: currentDetail ? Number(currentDetail.cgst_amount) : 0,
//       sgst_amount: currentDetail ? Number(currentDetail.sgst_amount) : 0,
//       total_price: currentDetail ? Number(currentDetail.total_price) : 0,
//       remark: currentDetail?.remark || '',
//       original_qty: originalQty,   // ← आता हे number असेल
//       used_qty: usedQty,
//     }
//   })

//   console.log("Corrected Works (with real quantities):", updatedWorks)
//   setWorks(updatedWorks)
// }, [workOrderData, previousProformas, proformaData])

//   console.log(previousProformas);












//   const fetchWorkOrder = async (workOrderId) => {
//     try {
//       const response = await getAPICall(`/api/order/${proformaData.work_order_id}`)
//       if (response && response.success && response.data) {
//         setWorkOrderData(response.data)
//       }
//     } catch (error) {
//       console.error('Error fetching work order:', error)
//     }
//   }

//   // const fetchPreviousProformas = async (workOrderId) => {
//   //   try {
//   //     const response = await getAPICall(`/api/proforma-invoices?work_order_id=${workOrderId}`)
//   //     // Filter out current proforma to get only previous ones
//   //     const allProformas = response?.data?.data || []
//   //     const previous = allProformas.filter(p => p.id !== parseInt(id))
//   //     setPreviousProformas(previous)
//   //   } catch (error) {
//   //     console.error('Error fetching previous proformas:', error)
//   //     setPreviousProformas([])
//   //   }
//   // }


// const fetchPreviousProformas = async (workOrderId) => {
//   try {
//     const res = await getAPICall(
//       `/api/proforma-invoices?work_order_id=${workOrderId}`
//     )

//     const list = res?.data?.data || []

//     // remove current proforma
//     const filtered = list.filter(p => p.id !== Number(id))

//     setPreviousProformas(filtered)
//   } catch (e) {
//     console.error(e)
//     setPreviousProformas([])
//   }
// }

















//   const fetchRules = async () => {
//     try {
//       const resp = await getAPICall('/api/rules')
//       setRules(Array.isArray(resp) ? resp : [])
//     } catch (error) {
//       console.error('Error fetching rules:', error)
//     }
//   }

//   const handleFormChange = (e) => {
//     const { name, value } = e.target
//     setForm(prev => {
//       let newForm = {
//         ...prev,
//         [name]: name === 'discount' || name.endsWith('Percentage') 
//           ? parseFloat(value) || 0 
//           : value,
//       }

//       if (name === 'gstPercentage') {
//         const totalGST = parseFloat(value) || 0
//         const halfGST = totalGST / 2
//         newForm = {
//           ...newForm,
//           sgstPercentage: halfGST,
//           cgstPercentage: halfGST,
//         }
//       } else if (name === 'sgstPercentage' || name === 'cgstPercentage') {
//         const sgst = name === 'sgstPercentage' ? parseFloat(value) || 0 : prev.sgstPercentage
//         const cgst = name === 'cgstPercentage' ? parseFloat(value) || 0 : prev.cgstPercentage
//         newForm = {
//           ...newForm,
//           gstPercentage: sgst + cgst,
//         }
//       }

//       if (name === 'discount' || name.endsWith('Percentage')) {
//         calculateTotals(works, newForm)
//       }

//       return newForm
//     })
//   }

//   const recalcRow = (index, rows = works) => {
//     const updated = [...rows]
//     const w = updated[index]

//     const base = (w.qty || 0) * (w.price || 0)
//     const half = (w.gst_percent || 0) / 2

//     w.cgst_amount = Math.round((base * half / 100) * 100) / 100
//     w.sgst_amount = Math.round((base * half / 100) * 100) / 100
//     w.total_price = Math.round((base + w.cgst_amount + w.sgst_amount) * 100) / 100

//     setWorks(updated)
//     calculateTotals(updated)
//   }







//   // const handleWorkChange = (index, field, value) => {
//   //   const updated = [...works]

//   //   if (field === 'qty') {
//   //     const max = updated[index].original_qty 
//   //       ? updated[index].original_qty - updated[index].used_qty 
//   //       : Infinity
      
//   //     updated[index].qty = Math.max(0, Math.min(Number(value) || 0, max))
//   //   } else if (field === 'price' || field === 'gst_percent') {
//   //     updated[index][field] = value === "" || value === null || value === undefined 
//   //       ? 0 
//   //       : parseFloat(value) || 0
//   //   } else {
//   //     updated[index][field] = value
//   //   }

//   //   setWorks(updated)
//   //   recalcRow(index, updated)
//   // }






// const handleWorkChange = (index, field, value) => {
//   const updated = [...works]

//   if (field === 'qty') {
//     const maxAllowed = updated[index].original_qty - updated[index].used_qty

//     let newVal = Number(value) || 0

//     // जर जास्त टाकण्याचा प्रयत्न केला तर
//     if (newVal > maxAllowed && maxAllowed >= 0) {
//       newVal = maxAllowed
//       showToast(
//         'danger',
//         `You can bill maximum ${maxAllowed.toFixed(2)} more (remaining quantity)`,
//         4500
//       )
//     }

//     updated[index].qty = Math.max(0, newVal)
//   } else if (field === 'price' || field === 'gst_percent') {
//     updated[index][field] = Number(value) || 0
//   } else {
//     updated[index][field] = value
//   }

//   setWorks(updated)
//   recalcRow(index, updated)
// }









//   const addWorkRow = () => {
//     setWorks([
//       ...works,
//       {
//         work_type: '',
//         uom: '',
//         qty: 0,
//         price: 0,
//         total_price: 0,
//         gst_percent: 18,
//         cgst_amount: 9,
//         sgst_amount: 9,
//         remark: '',
//         original_qty: 0,
//         used_qty: 0,
//       }
//     ])
//   }

//   const removeWorkRow = (index) => {
//     if (works.length === 1) return
//     const updated = [...works]
//     updated.splice(index, 1)
//     setWorks(updated)
//     calculateTotals(updated)
//   }

//   const calculateTotals = (rows = works, formData = form) => {
//     const taxable = rows.reduce((s, w) => s + (w.qty || 0) * (w.price || 0), 0)
//     const cgst = rows.reduce((s, w) => s + (w.cgst_amount || 0), 0)
//     const sgst = rows.reduce((s, w) => s + (w.sgst_amount || 0), 0)

//     setForm(prev => ({
//       ...prev,
//       subtotal: Math.round(taxable * 100) / 100,
//       taxableAmount: Math.round(taxable * 100) / 100,
//       cgstAmount: Math.round(cgst * 100) / 100,
//       sgstAmount: Math.round(sgst * 100) / 100,
//       gstAmount: Math.round((cgst + sgst) * 100) / 100,
//       finalAmount: Math.round((taxable + cgst + sgst - (formData.discount || 0)) * 100) / 100
//     }))
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     const formElement = e.currentTarget

//     if (!formElement.checkValidity()) {
//       setValidated(true)
//       return
//     }

//     try {
//       setSaving(true)

//       const data = {
//         tally_invoice_number: form.tally_invoice_number || null,
//         invoice_date: form.invoice_date,
//         delivery_date: form.delivery_date || null,
//         items: works
//           .filter(w => w.work_type && w.qty > 0)
//           .map(w => ({
//             work_type: w.work_type,
//             uom: w.uom,
//             qty: w.qty,
//             price: w.price,
//             total_price: w.total_price,
//             remark: w.remark || '',
//             gst_percent: w.gst_percent,
//             cgst_amount: w.cgst_amount,
//             sgst_amount: w.sgst_amount,
//           })),
//         discount: form.discount,
//         gst_percentage: form.gstPercentage,
//         cgst_percentage: form.cgstPercentage,
//         sgst_percentage: form.sgstPercentage,
//         igst_percentage: form.igstPercentage,
//         rule_ids: selectedRules,
//         notes: form.notes || null,
//         status: form.status,
//         terms_conditions: termsAndConditions.join('\n') || null,
//         payment_terms: paymentTerms.join('\n') || null,
//       }

//       const resp = await put(`/api/proforma-invoices/${id}`, data)

//       if (resp && resp.success) {
//         showToast('success', 'Proforma invoice updated successfully')
//         setTimeout(() => {
//           navigate(`/proforma-invoice-details/${id}`)
//         }, 1500)
//       } else {
//         showToast('danger', resp.message || 'Failed to update proforma invoice', 8000)
//       }
//     } catch (error) {
//       console.error('Update error:', error)
//       const errorMessage = error.message || 'Failed to update proforma invoice'
//       showToast('danger', errorMessage, 8000)
//     } finally {
//       setSaving(false)
//     }
//   }


  

//   if (loading) {
//     return (
//       <CCard>
//         <CCardBody className="text-center py-5">
//           <CSpinner color="primary" />
//           <div className="mt-3">Loading proforma invoice...</div>
//         </CCardBody>
//       </CCard>
//     )
//   }

//   if (!proformaData) {
//     return (
//       <CCard>
//         <CCardBody>
//           <CAlert color="danger">
//             <h5>Proforma Invoice Not Found</h5>
//             <p>The requested proforma invoice could not be found.</p>
//             <CButton color="primary" onClick={() => navigate('/invoiceTable')}>
//               Back to Orders
//             </CButton>
//           </CAlert>
//         </CCardBody>
//       </CCard>
//     )
//   }

//   return (
//     <CRow>
//       <CCol xs={12}>
//         <CCard className="mb-4">
//           <CCardHeader>
//             <div className="d-flex justify-content-between align-items-center">
//               <strong>Edit Proforma Invoice #{proformaData.proforma_invoice_number}</strong>
//               <CButton
//                 color="secondary"
//                 size="sm"
//                 onClick={() => navigate(`/proforma-invoice-details/${id}`)}
//               >
//                 <CIcon icon={cilArrowLeft} className="me-1" />
//                 Back to Details
//               </CButton>
//             </div>
//           </CCardHeader>
//           <CCardBody>
//             {/* Work Order Info */}
//             <div className="bg-light p-3 rounded mb-4">
//               <h6 className="mb-2">Work Order Information</h6>
//               <CRow>
//                 <CCol md={3}>
//                   <small className="text-muted">Work Order #:</small>
//                   <div><strong>{proformaData.work_order?.invoice_number}</strong></div>
//                 </CCol>
//                 <CCol md={3}>
//                   <small className="text-muted">Project:</small>
//                   <div><strong>{proformaData.project?.project_name}</strong></div>
//                   <div className="small text-muted">Type: {proformaData.project?.project_type?.name}</div>
//                 </CCol>
//                 <CCol md={3}>
//                   <small className="text-muted">Customer:</small>
//                   <div><strong>{proformaData.customer?.name}</strong></div>
//                 </CCol>
//                 <CCol md={3}>
//                   <small className="text-muted">Payment Status:</small>
//                   <div><strong className="text-capitalize">{proformaData.payment_status}</strong></div>
//                 </CCol>
//               </CRow>
//             </div>

//             <CForm validated={validated} onSubmit={handleSubmit}>
//               {/* Invoice Details */}
//               <CRow className="mb-3">
//                 <CCol md={3}>
//                   <CFormLabel>Tally Invoice Number</CFormLabel>
//                   <CFormInput
//                     type="text"
//                     name="tally_invoice_number"
//                     value={form.tally_invoice_number}
//                     onChange={handleFormChange}
//                     placeholder="Optional"
//                   />
//                 </CCol>
//                 <CCol md={3}>
//                   <CFormLabel>Invoice Date *</CFormLabel>
//                   <CFormInput
//                     type="date"
//                     name="invoice_date"
//                     value={form.invoice_date}
//                     onChange={handleFormChange}
//                     required
//                   />
//                 </CCol>
//                 <CCol md={3}>
//                   <CFormLabel>Delivery Date</CFormLabel>
//                   <CFormInput
//                     type="date"
//                     name="delivery_date"
//                     value={form.delivery_date}
//                     onChange={handleFormChange}
//                   />
//                 </CCol>
//                 <CCol md={3}>
//                   <CFormLabel>Status</CFormLabel>
//                   <CFormSelect
//                     name="status"
//                     value={form.status}
//                     onChange={handleFormChange}
//                   >
//                     <option value="draft">Draft</option>
//                     <option value="sent">Sent</option>
//                     <option value="approved">Approved</option>
//                     <option value="cancelled">Cancelled</option>
//                   </CFormSelect>
//                 </CCol>
//               </CRow>

//               {/* Work Details */}
//               <h6 className="mt-4 mb-3 fw-semibold text-primary border-bottom border-primary pb-2">
//                 Work Details
//               </h6>

//               {works.map((w, idx) => (
//                 <div key={idx} className="border rounded p-3 mb-3 bg-light">
//                   {/* First Row */}
//                   <CRow className="g-3 mb-2 align-items-end">
//                     <CCol md={3}>
//                       <CFormInput
//                         label="Work Type *"
//                         placeholder="Work Type"
//                         value={w.work_type}
//                         onChange={(e) => handleWorkChange(idx, 'work_type', e.target.value)}
//                         required
//                       />
//                     </CCol>

//                     <CCol md={2}>
//                       <CFormInput
//                         label="UOM"
//                         placeholder="Unit"
//                         value={w.uom}
//                         onChange={(e) => handleWorkChange(idx, 'uom', e.target.value)}
//                       />
//                     </CCol>

//                     <CCol md={2}>
//                       {/* <CFormLabel>
//                         Qty *
//                         {w.original_qty > 0 && (
//                           <small className="text-danger d-block mt-1">
//                             Billed: {w.used_qty.toFixed(2)} of {w.original_qty.toFixed(2)}
//                           </small>
//                         )}
//                       </CFormLabel> */}





//                       {/* <CFormInput
//                         type="number"
//                         step="0.01"
//                         min="0"
//                         max={w.original_qty ? w.original_qty - w.used_qty : undefined}
//                         value={w.qty}
//                         onChange={(e) => handleWorkChange(idx, 'qty', e.target.value)}
//                         required
//                       /> */}

        
//   <CFormLabel>
//     Qty <span className="text-danger fw-bold">*</span>
//     <small className="text-danger d-block mt-1" style={{ lineHeight: '1.3' }}>
//       Total in Work Order: <strong>{Number(w.original_qty).toFixed(2)}</strong><br />
//       Already billed (previous PIs): <strong>{w.used_qty.toFixed(2)}</strong><br />
//       <strong style={{ fontSize: '1.05em' }}>
//         Remaining allowed: {(w.original_qty - w.used_qty).toFixed(2)}
//       </strong>
//     </small>
//   </CFormLabel>

//   {/* <CFormInput
//     type="number"
//     step="0.01"
//     min="0"
//     max={w.original_qty - w.used_qty}   // ← ब्राउझर लेव्हल रोक
//     value={w.qty}
//     onChange={(e) => handleWorkChange(idx, 'qty', e.target.value)}
//     required
//   /> */}

//   <CFormInput
//     type="number"
//     step="0.01"
//     min="0"
//     max={Math.max(0, w.original_qty - w.used_qty)}
//     value={w.qty === 0 ? '' : w.qty}   // ← जेव्हा 0 असेल तेव्हा empty string दाखव
//     onChange={(e) => {
//       const inputVal = e.target.value;
      
//       // जर user ने पूर्ण रिकामा केला तर 0 सेट कर
//       if (inputVal === '') {
//         handleWorkChange(idx, 'qty', 0);
//         return;
//       }

//       // इतर वेळी नेहमी number म्हणून हँडल
//       const newVal = Number(inputVal);
//       if (!isNaN(newVal)) {
//         handleWorkChange(idx, 'qty', newVal);
//       }
//     }}
//     required
//     placeholder="0.00"  // ← optional: placeholder लावल्याने कळतं की empty आहे
//   />



//                     </CCol>

//                     <CCol md={2}>
//                       <CFormLabel>Rate *</CFormLabel>
//                       <CInputGroup>
//                         <CInputGroupText>₹</CInputGroupText>
//                         <CFormInput
//                           type="number"
//                           step="0.01"
//                           min="0"
//                           value={w.price}
//                           onChange={(e) => handleWorkChange(idx, 'price', e.target.value)}
//                           required
//                           readOnly
//                           disabled
//                         />
//                       </CInputGroup>
//                     </CCol>

//                     <CCol md={2}>
//                       <CFormLabel>Base Amount</CFormLabel>
//                       <div className="fw-medium">₹{((w.qty || 0) * (w.price || 0)).toFixed(2)}</div>
//                     </CCol>

//                     <CCol md={1} className="d-flex align-items-end">
//                       <CButton
//                         color="danger"
//                         size="sm"
//                         onClick={() => removeWorkRow(idx)}
//                         disabled={works.length === 1}
//                       >
//                         ×
//                       </CButton>
//                     </CCol>
//                   </CRow>

//                   {/* Second Row */}
//                   <CRow className="g-3 align-items-end">
//                     <CCol md={2}>
//                       <CFormInput
//                         label="GST %"
//                         type="number"
//                         step="0.01"
//                         min="0"
//                         max="100"
//                         value={w.gst_percent}
//                         onChange={(e) => handleWorkChange(idx, 'gst_percent', e.target.value)}
//                           readOnly
//                           disabled
//                       />
//                     </CCol>

//                     <CCol md={2}>
//                       <CFormLabel>CGST</CFormLabel>
//                       <div className="text-success fw-medium">₹{Number(w.cgst_amount || 0).toFixed(2)}</div>
//                     </CCol>

//                     <CCol md={2}>
//                       <CFormLabel>SGST</CFormLabel>
//                       <div className="text-success fw-medium">₹{Number(w.sgst_amount || 0).toFixed(2)}</div>
//                     </CCol>

//                     <CCol md={2}>
//                       <CFormLabel className="text-primary">Total (with GST)</CFormLabel>
//                       <div className="fw-bold text-primary">₹{(w.total_price || 0).toFixed(2)}</div>
//                     </CCol>

//                     <CCol md={4}>
//                       <CFormInput
//                         label="Remark"
//                         placeholder="Remark"
//                         value={w.remark}
//                         onChange={(e) => handleWorkChange(idx, 'remark', e.target.value)}
//                       />
//                     </CCol>
//                   </CRow>
//                 </div>
//               ))}

//               {/* <CButton
//                 color="warning"
//                 variant="outline"
//                 className="mb-4"
//                 onClick={addWorkRow}
//               >
//                 + Add Work
//               </CButton> */}


//               {/* Financial Summary */}
//               <CRow className="mb-3">
//                 <CCol md={3}>
//                   <CFormLabel>Total Amount before GST</CFormLabel>
//                   <CInputGroup>
//                     <CInputGroupText>₹</CInputGroupText>
//                     <CFormInput type="number" value={form.subtotal} readOnly />
//                   </CInputGroup>
//                 </CCol>
//                 <CCol md={3}>
//                   <CFormLabel>Discount</CFormLabel>
//                   <CInputGroup>
//                     <CInputGroupText>₹</CInputGroupText>
//                     <CFormInput
//                       type="number"
//                       name="discount"
//                       value={form.discount}
//                       onChange={handleFormChange}
//                       min="0"
//                       step="0.01"
//                        readOnly
//                           disabled
//                     />
//                   </CInputGroup>
//                 </CCol>
//                 <CCol md={3}>
//                   <CFormLabel>Total Amount after GST</CFormLabel>
//                   <CInputGroup>
//                     <CInputGroupText>₹</CInputGroupText>
//                     <CFormInput
//                       type="number"
//                       value={form.finalAmount}
//                       readOnly
//                       className="fw-bold"
//                     />
//                   </CInputGroup>
//                 </CCol>
//               </CRow>

//               {/* Payment Terms */}
//               <h6 className="mt-4 mb-3 fw-semibold text-primary border-bottom border-primary pb-2">
//                 Payment Terms
//               </h6>
//               <div className="d-flex flex-wrap gap-2 mb-3">
//                 {paymentTerms.map((term, idx) => {
//                   if (editingPaymentIndex === idx) {
//                     return (
//                       <CInputGroup key={idx} style={{ width: 'auto' }}>
//                         <CFormInput
//                           value={editingPaymentValue}
//                           onChange={(e) => setEditingPaymentValue(e.target.value)}
//                         />
//                         <CButton
//                           color="success"
//                           onClick={() => {
//                             const newTerms = [...paymentTerms]
//                             newTerms[idx] = editingPaymentValue.trim()
//                             setPaymentTerms(newTerms)
//                             setEditingPaymentIndex(-1)
//                           }}
//                         >
//                           Save
//                         </CButton>
//                         <CButton color="secondary" onClick={() => setEditingPaymentIndex(-1)}>
//                           Cancel
//                         </CButton>
//                       </CInputGroup>
//                     )
//                   } else {
//                     return (
//                       <CBadge
//                         color="info"
//                         key={idx}
//                         className="me-1 mb-1"
//                         style={{ fontSize: '0.9em' }}
//                       >
//                         {term}
//                         <CIcon
//                           icon={cilPencil}
//                           className="ms-2"
//                           style={{ cursor: 'pointer' }}
//                           onClick={() => {
//                             setEditingPaymentIndex(idx)
//                             setEditingPaymentValue(term)
//                           }}
//                         />
//                         <CIcon
//                           icon={cilX}
//                           className="ms-1"
//                           style={{ cursor: 'pointer' }}
//                           onClick={() => {
//                             setPaymentTerms(paymentTerms.filter((_, i) => i !== idx))
//                           }}
//                         />
//                       </CBadge>
//                     )
//                   }
//                 })}
//               </div>
//               <CRow className="mb-3">
//                 <CCol md={6}>
//                   <CInputGroup>
//                     <CFormInput
//                       placeholder="Add new payment term..."
//                       value={newPaymentTerm}
//                       onChange={(e) => setNewPaymentTerm(e.target.value)}
//                     />
//                     <CButton
//                       color="primary"
//                       onClick={() => {
//                         if (newPaymentTerm.trim()) {
//                           setPaymentTerms([...paymentTerms, newPaymentTerm.trim()])
//                           setNewPaymentTerm('')
//                         }
//                       }}
//                     >
//                       Add
//                     </CButton>
//                   </CInputGroup>
//                 </CCol>
//               </CRow>

//               {/* Terms & Conditions */}
//               <h6 className="mt-4 mb-3 fw-semibold text-primary border-bottom border-primary pb-2">
//                 Terms & Conditions
//               </h6>
//               <div className="d-flex flex-wrap gap-2 mb-3">
//                 {termsAndConditions.map((term, idx) => {
//                   if (editingConditionIndex === idx) {
//                     return (
//                       <CInputGroup key={idx} style={{ width: 'auto' }}>
//                         <CFormInput
//                           value={editingConditionValue}
//                           onChange={(e) => setEditingConditionValue(e.target.value)}
//                         />
//                         <CButton
//                           color="success"
//                           onClick={() => {
//                             const newConditions = [...termsAndConditions]
//                             newConditions[idx] = editingConditionValue.trim()
//                             setTermsAndConditions(newConditions)
//                             setEditingConditionIndex(-1)
//                           }}
//                         >
//                           Save
//                         </CButton>
//                         <CButton
//                           color="secondary"
//                           onClick={() => setEditingConditionIndex(-1)}
//                         >
//                           Cancel
//                         </CButton>
//                       </CInputGroup>
//                     )
//                   } else {
//                     return (
//                       <CBadge
//                         color="warning"
//                         key={idx}
//                         className="me-1 mb-1"
//                         style={{ fontSize: '0.9em' }}
//                       >
//                         {term}
//                         <CIcon
//                           icon={cilPencil}
//                           className="ms-2"
//                           style={{ cursor: 'pointer' }}
//                           onClick={() => {
//                             setEditingConditionIndex(idx)
//                             setEditingConditionValue(term)
//                           }}
//                         />
//                         <CIcon
//                           icon={cilX}
//                           className="ms-1"
//                           style={{ cursor: 'pointer' }}
//                           onClick={() => {
//                             setTermsAndConditions(termsAndConditions.filter((_, i) => i !== idx))
//                           }}
//                         />
//                       </CBadge>
//                     )
//                   }
//                 })}
//               </div>
//               <CRow className="mb-3">
//                 <CCol md={6}>
//                   <CInputGroup>
//                     <CFormInput
//                       placeholder="Add new condition..."
//                       value={newCondition}
//                       onChange={(e) => setNewCondition(e.target.value)}
//                     />
//                     <CButton
//                       color="primary"
//                       onClick={() => {
//                         if (newCondition.trim()) {
//                           setTermsAndConditions([...termsAndConditions, newCondition.trim()])
//                           setNewCondition('')
//                         }
//                       }}
//                     >
//                       Add
//                     </CButton>
//                   </CInputGroup>
//                 </CCol>
//               </CRow>

//               {/* Notes */}
//               <CRow className="mb-3">
//                 <CCol md={12}>
//                   <CFormLabel>Additional Notes</CFormLabel>
//                   <CFormTextarea
//                     name="notes"
//                     value={form.notes}
//                     onChange={handleFormChange}
//                     rows={3}
//                     placeholder="Enter any additional notes..."
//                   />
//                 </CCol>
//               </CRow>

//               <div className="d-flex gap-2">
//                 <CButton
//                   color="primary"
//                   type="submit"
//                   disabled={saving}
//                 >
//                   {saving ? <CSpinner size="sm" /> : <CIcon icon={cilSave} className="me-1" />}
//                   Update Proforma Invoice
//                 </CButton>
//                 <CButton
//                   color="secondary"
//                   onClick={() => navigate(`/proforma-invoice-details/${id}`)}
//                   disabled={saving}
//                 >
//                   Cancel
//                 </CButton>
//               </div>
//             </CForm>
//           </CCardBody>
//         </CCard>
//       </CCol>
//     </CRow>
//   )
// }

// export default EditProformaInvoice










































// import React, { useState, useEffect } from 'react'
// import { useParams, useNavigate } from 'react-router-dom'
// import {
//   CCard,
//   CCardBody,
//   CCardHeader,
//   CButton,
//   CForm,
//   CFormInput,
//   CFormLabel,
//   CRow,
//   CCol,
//   CInputGroup,
//   CInputGroupText,
//   CSpinner,
//   CAlert,
//   CFormTextarea,
//   CFormSelect,
//   CBadge,
// } from '@coreui/react'
// import CIcon from '@coreui/icons-react'
// import { cilArrowLeft, cilPencil, cilSave, cilX, cilPlus } from '@coreui/icons'
// import { getAPICall, put } from '../../../util/api'
// import { useToast } from '../../common/toast/ToastContext'

// const EditProformaInvoice = () => {
//   const { id } = useParams()
//   const navigate = useNavigate()
//   const { showToast } = useToast()

//   const [loading, setLoading] = useState(true)
//   const [saving, setSaving] = useState(false)
//   const [validated, setValidated] = useState(false)
//   const [rules, setRules] = useState([])
//   const [selectedRules, setSelectedRules] = useState([])
//   const [proformaData, setProformaData] = useState(null)
//   const [workOrderData, setWorkOrderData] = useState(null)
//   const [previousProformas, setPreviousProformas] = useState([])

//   // Sub-description states
//   const [newSubDescs, setNewSubDescs] = useState([''])
//   const [editingSubDescWorkIdx, setEditingSubDescWorkIdx] = useState(-1)
//   const [editingSubDescIdx, setEditingSubDescIdx] = useState(-1)
//   const [editingSubDescValue, setEditingSubDescValue] = useState('')

//   const [form, setForm] = useState({
//     tally_invoice_number: '',
//     invoice_date: '',
//     delivery_date: '',
//     discount: 0,
//     subtotal: 0,
//     taxableAmount: 0,
//     gstAmount: 0,
//     sgstAmount: 0,
//     cgstAmount: 0,
//     igstAmount: 0,
//     finalAmount: 0,
//     gstPercentage: 0,
//     sgstPercentage: 0,
//     cgstPercentage: 0,
//     igstPercentage: 0,
//     notes: '',
//     status: 'draft',
//     terms_conditions: '',
//     payment_terms: '',
//   })

//   const [works, setWorks] = useState([
//     { 
//       work_type: '', 
//       uom: '', 
//       qty: 0, 
//       price: 0, 
//       total_price: 0, 
//       remark: '',
//       sub_descriptions: [], // always array
//       gst_percent: 18,
//       cgst_amount: 9,
//       sgst_amount: 9,
//     },
//   ])

//   // Payment Terms
//   const [paymentTerms, setPaymentTerms] = useState([])
//   const [editingPaymentIndex, setEditingPaymentIndex] = useState(-1)
//   const [editingPaymentValue, setEditingPaymentValue] = useState('')
//   const [newPaymentTerm, setNewPaymentTerm] = useState('')

//   // Terms & Conditions
//   const [termsAndConditions, setTermsAndConditions] = useState([])
//   const [editingConditionIndex, setEditingConditionIndex] = useState(-1)
//   const [editingConditionValue, setEditingConditionValue] = useState('')
//   const [newCondition, setNewCondition] = useState('')

//   // Fetch all data on mount
//   useEffect(() => {
//     fetchProformaInvoice()
//     fetchRules()
//   }, [id])

//   useEffect(() => {
//     if (!proformaData?.work_order_id) return

//     getAPICall(`/api/order/${proformaData.work_order_id}`)
//       .then(res => setWorkOrderData(res))

//     fetchPreviousProformas(proformaData.work_order_id)
//   }, [proformaData])

//   const fetchProformaInvoice = async () => {
//     try {
//       setLoading(true)
//       const response = await getAPICall(`/api/proforma-invoices/${id}`)
      
//       if (response && response.success && response.data) {
//         const data = response.data
//         setProformaData(data)

//         const gstPercentage = parseFloat(data.gst_percentage) || 0
//         const sgstPercentage = parseFloat(data.sgst_percentage) || 0
//         const cgstPercentage = parseFloat(data.cgst_percentage) || 0
//         const igstPercentage = parseFloat(data.igst_percentage) || 0
        
//         setForm({
//           tally_invoice_number: data.tally_invoice_number || '',
//           invoice_date: data.invoice_date?.split('T')[0] || '',
//           delivery_date: data.delivery_date?.split('T')[0] || '',
//           discount: parseFloat(data.discount) || 0,
//           subtotal: parseFloat(data.subtotal) || 0,
//           taxableAmount: parseFloat(data.taxable_amount) || 0,
//           gstAmount: parseFloat(data.gst_amount) || 0,
//           sgstAmount: parseFloat(data.sgst_amount) || 0,
//           cgstAmount: parseFloat(data.cgst_amount) || 0,
//           igstAmount: parseFloat(data.igst_amount) || 0,
//           finalAmount: parseFloat(data.final_amount) || 0,
//           gstPercentage,
//           sgstPercentage,
//           cgstPercentage,
//           igstPercentage,
//           notes: data.notes || '',
//           status: data.status || 'draft',
//           terms_conditions: data.terms_conditions || '',
//           payment_terms: data.payment_terms || '',
//         })

//         if (data.details && data.details.length > 0) {
//           const mappedWorks = data.details.map(item => ({
//             id: item.id,
//             work_type: item.work_type || '',
//             uom: item.uom || '',
//             qty: parseFloat(item.qty) || 0,
//             price: parseFloat(item.price) || 0,
//             total_price: parseFloat(item.total_price) || 0,
//             gst_percent: parseFloat(item.gst_percent) || 0,
//             cgst_amount: parseFloat(item.cgst_amount) || 0,
//             sgst_amount: parseFloat(item.sgst_amount) || 0,
//             remark: item.remark || '',
//             sub_descriptions: [], // will be filled from work order
//             original_qty: 0,
//             used_qty: 0,
//           })).sort((a, b) => (a.id || 0) - (b.id || 0))
          
//           setWorks(mappedWorks)
//           setNewSubDescs(Array(mappedWorks.length).fill(''))
//         }

//         if (data.payment_terms) {
//           const terms = data.payment_terms.split('\n').filter(term => term.trim() !== '')
//           setPaymentTerms(terms.length > 0 ? terms : [])
//         }

//         if (data.terms_conditions) {
//           const conditions = data.terms_conditions.split('\n').filter(term => term.trim() !== '')
//           setTermsAndConditions(conditions.length > 0 ? conditions : [])
//         }

//         if (data.invoice_rules && data.invoice_rules.length > 0) {
//           setSelectedRules(data.invoice_rules.map(ir => ir.rules_id))
//         }
//       } else {
//         showToast('danger', 'Failed to load proforma invoice')
//         setTimeout(() => navigate('/invoiceTable'), 2000)
//       }
//     } catch (error) {
//       console.error('Error fetching proforma invoice:', error)
//       showToast('danger', 'Failed to load proforma invoice')
//       setTimeout(() => navigate('/invoiceTable'), 2000)
//     } finally {
//       setLoading(false)
//     }
//   }

//   useEffect(() => {
//     if (!workOrderData?.items || !proformaData) return

//     const normalize = v => (v || '').trim().toLowerCase()

//     const updatedWorks = workOrderData.items.map(item => {
//       const key = normalize(item.work_type)
//       const originalQty = Number(item.qty) || 0

//       let usedQty = 0
//       previousProformas.forEach(p => {
//         p.details?.forEach(d => {
//           if (normalize(d.work_type) === key) {
//             usedQty += Number(d.qty) || 0
//           }
//         })
//       })

//       const currentDetail = proformaData.details?.find(
//         d => normalize(d.work_type) === key
//       )

//       const currentQty = currentDetail ? Number(currentDetail.qty) : 0

//       // Convert work_sub_description → array
//       const subDescriptions = currentDetail?.work_sub_description
//         ? currentDetail.work_sub_description.split('\n').map(l => l.trim()).filter(Boolean)
//         : []

//       return {
//         id: currentDetail?.id,
//         work_type: item.work_type || '',
//         uom: item.uom || '',
//         qty: currentQty,
//         price: currentDetail ? Number(currentDetail.price) : Number(item.price) || 0,
//         gst_percent: currentDetail ? Number(currentDetail.gst_percent) : 18,
//         cgst_amount: currentDetail ? Number(currentDetail.cgst_amount) : 0,
//         sgst_amount: currentDetail ? Number(currentDetail.sgst_amount) : 0,
//         total_price: currentDetail ? Number(currentDetail.total_price) : 0,
//         remark: currentDetail?.remark || '',
//         original_qty: originalQty,
//         used_qty: usedQty,
//         sub_descriptions: subDescriptions,
//       }
//     })

//     setWorks(updatedWorks)
//     setNewSubDescs(Array(updatedWorks.length).fill(''))
//   }, [workOrderData, previousProformas, proformaData])

//   const fetchPreviousProformas = async (workOrderId) => {
//     try {
//       const res = await getAPICall(`/api/proforma-invoices?work_order_id=${workOrderId}`)
//       const list = res?.data?.data || []
//       const filtered = list.filter(p => p.id !== Number(id))
//       setPreviousProformas(filtered)
//     } catch (e) {
//       console.error(e)
//       setPreviousProformas([])
//     }
//   }

//   const fetchRules = async () => {
//     try {
//       const resp = await getAPICall('/api/rules')
//       setRules(Array.isArray(resp) ? resp : [])
//     } catch (error) {
//       console.error('Error fetching rules:', error)
//     }
//   }

//   const handleFormChange = (e) => {
//     const { name, value } = e.target
//     setForm(prev => {
//       let newForm = {
//         ...prev,
//         [name]: name === 'discount' || name.endsWith('Percentage') 
//           ? parseFloat(value) || 0 
//           : value,
//       }

//       if (name === 'gstPercentage') {
//         const totalGST = parseFloat(value) || 0
//         const halfGST = totalGST / 2
//         newForm = { ...newForm, sgstPercentage: halfGST, cgstPercentage: halfGST }
//       } else if (name === 'sgstPercentage' || name === 'cgstPercentage') {
//         const sgst = name === 'sgstPercentage' ? parseFloat(value) || 0 : prev.sgstPercentage
//         const cgst = name === 'cgstPercentage' ? parseFloat(value) || 0 : prev.cgstPercentage
//         newForm = { ...newForm, gstPercentage: sgst + cgst }
//       }

//       if (name === 'discount' || name.endsWith('Percentage')) {
//         calculateTotals(works, newForm)
//       }

//       return newForm
//     })
//   }

//   const recalcRow = (index, rows = works) => {
//     const updated = [...rows]
//     const w = updated[index]

//     const base = (w.qty || 0) * (w.price || 0)
//     const half = (w.gst_percent || 0) / 2

//     w.cgst_amount = Math.round((base * half / 100) * 100) / 100
//     w.sgst_amount = Math.round((base * half / 100) * 100) / 100
//     w.total_price = Math.round((base + w.cgst_amount + w.sgst_amount) * 100) / 100

//     setWorks(updated)
//     calculateTotals(updated)
//   }

//   const handleWorkChange = (index, field, value) => {
//     const updated = [...works]

//     if (field === 'qty') {
//       const maxAllowed = updated[index].original_qty - updated[index].used_qty

//       let newVal = Number(value) || 0

//       if (newVal > maxAllowed && maxAllowed >= 0) {
//         newVal = maxAllowed
//         showToast(
//           'danger',
//           `You can bill maximum ${maxAllowed.toFixed(2)} more (remaining quantity)`,
//           4500
//         )
//       }

//       updated[index].qty = Math.max(0, newVal)
//     } else if (field === 'price' || field === 'gst_percent') {
//       updated[index][field] = Number(value) || 0
//     } else {
//       updated[index][field] = value
//     }

//     setWorks(updated)
//     recalcRow(index, updated)
//   }

//   const addWorkRow = () => {
//     setWorks([
//       ...works,
//       {
//         work_type: '',
//         uom: '',
//         qty: 0,
//         price: 0,
//         total_price: 0,
//         remark: '',
//         sub_descriptions: [],
//         gst_percent: 18,
//         cgst_amount: 9,
//         sgst_amount: 9,
//         original_qty: 0,
//         used_qty: 0,
//       }
//     ])
//     setNewSubDescs([...newSubDescs, ''])
//   }

//   const removeWorkRow = (index) => {
//     if (works.length === 1) return
//     const updated = [...works]
//     updated.splice(index, 1)
//     setWorks(updated)
//     calculateTotals(updated)

//     const updatedNew = [...newSubDescs]
//     updatedNew.splice(index, 1)
//     setNewSubDescs(updatedNew)

//     if (editingSubDescWorkIdx === index) {
//       setEditingSubDescWorkIdx(-1)
//       setEditingSubDescIdx(-1)
//     }
//   }

//   const calculateTotals = (rows = works, formData = form) => {
//     const taxable = rows.reduce((s, w) => s + (w.qty || 0) * (w.price || 0), 0)
//     const cgst = rows.reduce((s, w) => s + (w.cgst_amount || 0), 0)
//     const sgst = rows.reduce((s, w) => s + (w.sgst_amount || 0), 0)

//     setForm(prev => ({
//       ...prev,
//       subtotal: Math.round(taxable * 100) / 100,
//       taxableAmount: Math.round(taxable * 100) / 100,
//       cgstAmount: Math.round(cgst * 100) / 100,
//       sgstAmount: Math.round(sgst * 100) / 100,
//       gstAmount: Math.round((cgst + sgst) * 100) / 100,
//       finalAmount: Math.round((taxable + cgst + sgst - (formData.discount || 0)) * 100) / 100
//     }))
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     const formElement = e.currentTarget

//     if (!formElement.checkValidity()) {
//       setValidated(true)
//       return
//     }

//     try {
//       setSaving(true)

//       const data = {
//         tally_invoice_number: form.tally_invoice_number || null,
//         invoice_date: form.invoice_date,
//         delivery_date: form.delivery_date || null,
//         items: works
//           .filter(w => w.work_type && w.qty > 0)
//           .map(w => ({
//             work_type: w.work_type,
//             uom: w.uom,
//             qty: w.qty,
//             price: w.price,
//             total_price: w.total_price,
//             remark: w.remark || '',
//             work_sub_description: w.sub_descriptions?.join('\n') || null,
//             gst_percent: w.gst_percent,
//             cgst_amount: w.cgst_amount,
//             sgst_amount: w.sgst_amount,
//           })),
//         discount: form.discount,
//         gst_percentage: form.gstPercentage,
//         cgst_percentage: form.cgstPercentage,
//         sgst_percentage: form.sgstPercentage,
//         igst_percentage: form.igstPercentage,
//         rule_ids: selectedRules,
//         notes: form.notes || null,
//         status: form.status,
//         terms_conditions: termsAndConditions.join('\n') || null,
//         payment_terms: paymentTerms.join('\n') || null,
//       }

//       const resp = await put(`/api/proforma-invoices/${id}`, data)

//       if (resp && resp.success) {
//         showToast('success', 'Proforma invoice updated successfully')
//         setTimeout(() => {
//           navigate(`/proforma-invoice-details/${id}`)
//         }, 1500)
//       } else {
//         showToast('danger', resp.message || 'Failed to update proforma invoice', 8000)
//       }
//     } catch (error) {
//       console.error('Update error:', error)
//       showToast('danger', error.message || 'Failed to update proforma invoice', 8000)
//     } finally {
//       setSaving(false)
//     }
//   }

//   if (loading) {
//     return (
//       <CCard>
//         <CCardBody className="text-center py-5">
//           <CSpinner color="primary" />
//           <div className="mt-3">Loading proforma invoice...</div>
//         </CCardBody>
//       </CCard>
//     )
//   }

//   if (!proformaData) {
//     return (
//       <CCard>
//         <CCardBody>
//           <CAlert color="danger">
//             <h5>Proforma Invoice Not Found</h5>
//             <p>The requested proforma invoice could not be found.</p>
//             <CButton color="primary" onClick={() => navigate('/invoiceTable')}>
//               Back to Orders
//             </CButton>
//           </CAlert>
//         </CCardBody>
//       </CCard>
//     )
//   }

//   return (
//     <CRow>
//       <CCol xs={12}>
//         <CCard className="mb-4">
//           <CCardHeader>
//             <div className="d-flex justify-content-between align-items-center">
//               <strong>Edit Proforma Invoice #{proformaData.proforma_invoice_number}</strong>
//               <CButton
//                 color="secondary"
//                 size="sm"
//                 onClick={() => navigate(`/proforma-invoice-details/${id}`)}
//               >
//                 <CIcon icon={cilArrowLeft} className="me-1" />
//                 Back to Details
//               </CButton>
//             </div>
//           </CCardHeader>
//           <CCardBody>
//             {/* Work Order Info */}
//             <div className="bg-light p-3 rounded mb-4">
//               <h6 className="mb-2">Work Order Information</h6>
//               <CRow>
//                 <CCol md={3}>
//                   <small className="text-muted">Work Order #:</small>
//                   <div><strong>{proformaData.work_order?.invoice_number}</strong></div>
//                 </CCol>
//                 <CCol md={3}>
//                   <small className="text-muted">Project:</small>
//                   <div><strong>{proformaData.project?.project_name}</strong></div>
//                   <div className="small text-muted">Type: {proformaData.project?.project_type?.name}</div>
//                 </CCol>
//                 <CCol md={3}>
//                   <small className="text-muted">Customer:</small>
//                   <div><strong>{proformaData.customer?.name}</strong></div>
//                 </CCol>
//                 <CCol md={3}>
//                   <small className="text-muted">Payment Status:</small>
//                   <div><strong className="text-capitalize">{proformaData.payment_status}</strong></div>
//                 </CCol>
//               </CRow>
//             </div>

//             <CForm validated={validated} onSubmit={handleSubmit}>
//               {/* Invoice Details */}
//               <CRow className="mb-3">
//                 <CCol md={3}>
//                   <CFormLabel>Tally Invoice Number</CFormLabel>
//                   <CFormInput
//                     type="text"
//                     name="tally_invoice_number"
//                     value={form.tally_invoice_number}
//                     onChange={handleFormChange}
//                     placeholder="Optional"
//                   />
//                 </CCol>
//                 <CCol md={3}>
//                   <CFormLabel>Invoice Date *</CFormLabel>
//                   <CFormInput
//                     type="date"
//                     name="invoice_date"
//                     value={form.invoice_date}
//                     onChange={handleFormChange}
//                     required
//                   />
//                 </CCol>
//                 <CCol md={3}>
//                   <CFormLabel>Delivery Date</CFormLabel>
//                   <CFormInput
//                     type="date"
//                     name="delivery_date"
//                     value={form.delivery_date}
//                     onChange={handleFormChange}
//                   />
//                 </CCol>
//                 <CCol md={3}>
//                   <CFormLabel>Status</CFormLabel>
//                   <CFormSelect
//                     name="status"
//                     value={form.status}
//                     onChange={handleFormChange}
//                   >
//                     <option value="draft">Draft</option>
//                     <option value="sent">Sent</option>
//                     <option value="approved">Approved</option>
//                     <option value="cancelled">Cancelled</option>
//                   </CFormSelect>
//                 </CCol>
//               </CRow>

//               {/* Work Details - Updated Section */}
//               <h6 className="mt-4 mb-3 fw-semibold text-primary border-bottom border-primary pb-2">
//                 Work Details
//               </h6>

//               {works.map((w, idx) => (
//                 <div key={idx} className="border rounded p-3 mb-3 bg-light position-relative">
                 

//                   <CRow className="g-3 mb-3 align-items-end">
//                     <CCol md={6}>
//                       <CFormLabel>Work Type *</CFormLabel>
//                       <CFormInput
//                         placeholder="Enter work type"
//                         value={w.work_type}
//                         onChange={(e) => handleWorkChange(idx, 'work_type', e.target.value)}
//                         required
//                       />
//                     </CCol>

//                     <CCol md={6}>
//                       <CFormLabel>Sub Descriptions</CFormLabel>

                     

//                       {/* Add new sub-description */}
//                       <CInputGroup size="md">
//                         <CFormInput
//                           placeholder="Add sub description..."
//                           value={newSubDescs[idx] || ''}
//                           onChange={(e) => {
//                             const updatedNew = [...newSubDescs]
//                             updatedNew[idx] = e.target.value
//                             setNewSubDescs(updatedNew)
//                           }}
//                         />
//                         <CButton
//                           color="primary"
//                           size="sm"
//                           onClick={() => {
//                             if (newSubDescs[idx]?.trim()) {
//                               const updatedWorks = [...works]
//                               if (!updatedWorks[idx].sub_descriptions) {
//                                 updatedWorks[idx].sub_descriptions = []
//                               }
//                               updatedWorks[idx].sub_descriptions.push(newSubDescs[idx].trim())
//                               setWorks(updatedWorks)

//                               const updatedNew = [...newSubDescs]
//                               updatedNew[idx] = ''
//                               setNewSubDescs(updatedNew)
//                             }
//                           }}
//                         >
//                           <CIcon icon={cilPlus} /> Add
//                         </CButton>
//                       </CInputGroup>
//                     </CCol>



//  {/* Existing sub-descriptions as tags */}
//                       <div className="d-flex flex-wrap gap-2 mb-2">
//                         {(w.sub_descriptions || []).map((desc, subIdx) => {
//                           const isEditing = editingSubDescWorkIdx === idx && editingSubDescIdx === subIdx

//                           if (isEditing) {
//                             return (
//                               <CInputGroup
//                                 key={subIdx}
//                                 size="sm"
//                                 className="align-items-center"
//                                 style={{ width: 'auto', minWidth: '280px' }}
//                               >
//                                 <CFormInput
//                                   value={editingSubDescValue}
//                                   onChange={(e) => setEditingSubDescValue(e.target.value)}
//                                   size="sm"
//                                   autoFocus
//                                 />
//                                 <CButton
//                                   color="success"
//                                   size="sm"
//                                   onClick={() => {
//                                     if (editingSubDescValue.trim() === '') {
//                                       showToast('warning', 'Sub-description cannot be empty')
//                                       return
//                                     }
//                                     const updatedWorks = [...works]
//                                     updatedWorks[idx].sub_descriptions[subIdx] = editingSubDescValue.trim()
//                                     setWorks(updatedWorks)
//                                     setEditingSubDescWorkIdx(-1)
//                                     setEditingSubDescIdx(-1)
//                                     setEditingSubDescValue('')
//                                   }}
//                                 >
//                                   Save
//                                 </CButton>
//                                 <CButton
//                                   color="secondary"
//                                   size="sm"
//                                   onClick={() => {
//                                     setEditingSubDescWorkIdx(-1)
//                                     setEditingSubDescIdx(-1)
//                                     setEditingSubDescValue('')
//                                   }}
//                                 >
//                                   Cancel
//                                 </CButton>
//                               </CInputGroup>
//                             )
//                           }

//                           return (
//                             <span
//                               key={subIdx}
//                               className="badge rounded-pill bg-light text-dark border border-secondary-subtle px-3 py-2 d-flex align-items-center gap-2 shadow-sm"
//                               style={{ fontSize: '0.95rem', fontWeight: 500 }}
//                             >
//                               {desc}
//                               <CIcon
//                                 icon={cilPencil}
//                                 size="sm"
//                                 className="cursor-pointer text-primary"
//                                 onClick={() => {
//                                   setEditingSubDescWorkIdx(idx)
//                                   setEditingSubDescIdx(subIdx)
//                                   setEditingSubDescValue(desc)
//                                 }}
//                               />
//                               <CIcon
//                                 icon={cilX}
//                                 size="sm"
//                                 className="cursor-pointer text-danger"
//                                 onClick={() => {
//                                   const updated = [...works]
//                                   updated[idx].sub_descriptions.splice(subIdx, 1)
//                                   setWorks(updated)
//                                 }}
//                               />
//                             </span>
//                           )
//                         })}
//                       </div>


//                   </CRow>

//                   <CRow className="g-3 mb-3 align-items-end">



//   <CCol md={3}>
//                       <CFormInput
//                         label="UOM"
//                         placeholder="Unit"
//                         value={w.uom}
//                         onChange={(e) => handleWorkChange(idx, 'uom', e.target.value)}
//                       />
//                     </CCol>


//                     <CCol md={3}>
//                       <CFormLabel>
//                         Qty <span className="text-danger fw-bold">*</span>
//                         <small className="text-danger d-block mt-1" style={{ lineHeight: '1.3' }}>
//                           Total in Work Order: <strong>{Number(w.original_qty).toFixed(2)}</strong><br />
//                           Already billed: <strong>{w.used_qty.toFixed(2)}</strong><br />
//                           <strong style={{ fontSize: '1.05em' }}>
//                             Remaining allowed: {(w.original_qty - w.used_qty).toFixed(2)}
//                           </strong>
//                         </small>
//                       </CFormLabel>

//                       <CFormInput
//                         type="number"
//                         step="0.01"
//                         min="0"
//                         max={Math.max(0, w.original_qty - w.used_qty)}
//                         value={w.qty === 0 ? '' : w.qty}
//                         onChange={(e) => {
//                           const inputVal = e.target.value
//                           if (inputVal === '') {
//                             handleWorkChange(idx, 'qty', 0)
//                             return
//                           }
//                           const newVal = Number(inputVal)
//                           if (!isNaN(newVal)) {
//                             handleWorkChange(idx, 'qty', newVal)
//                           }
//                         }}
//                         required
//                         placeholder="0.00"
//                       />
//                     </CCol>

//                     <CCol md={3}>
//                       <CFormLabel>Rate *</CFormLabel>
//                       <CInputGroup>
//                         <CInputGroupText>₹</CInputGroupText>
//                         <CFormInput
//                           type="number"
//                           step="0.01"
//                           min="0"
//                           value={w.price}
//                           readOnly
//                           disabled
//                         />
//                       </CInputGroup>
//                     </CCol>

//                     <CCol md={3}>
//                       <CFormLabel>Base Amount</CFormLabel>
//                       <div className="fw-medium pt-2">
//                         ₹{((w.qty || 0) * (w.price || 0)).toFixed(2)}
//                       </div>
//                     </CCol>

                    
//                   </CRow>

//                   <CRow className="g-3 align-items-end">


// <CCol md={3}>
//                       <CFormLabel>GST %</CFormLabel>
//                       <CFormInput
//                         type="number"
//                         step="0.01"
//                         min="0"
//                         max="100"
//                         value={w.gst_percent}
//                         readOnly
//                         disabled
//                       />
//                     </CCol>


//                     <CCol md={3}>
//                       <CFormLabel>CGST</CFormLabel>
//                       <div className="text-success fw-medium">
//                         ₹{Number(w.cgst_amount || 0).toFixed(2)}
//                       </div>
//                     </CCol>

//                     <CCol md={3}>
//                       <CFormLabel>SGST</CFormLabel>
//                       <div className="text-success fw-medium">
//                         ₹{Number(w.sgst_amount || 0).toFixed(2)}
//                       </div>
//                     </CCol>

//                     <CCol md={3}>
//                       <CFormLabel className="text-primary">Total (with GST)</CFormLabel>
//                       <div className="fw-bold text-primary">
//                         ₹{(w.total_price || 0).toFixed(2)}
//                       </div>
//                     </CCol>

                    
//                   </CRow>


// <CRow className="g-3 mt-2 align-items-end">



// <CCol md={9}>
//                       <CFormLabel>Remark</CFormLabel>
//                       <CFormInput
//                         placeholder="Remark"
//                         value={w.remark}
//                         onChange={(e) => handleWorkChange(idx, 'remark', e.target.value)}
//                       />
//                     </CCol>


//  {/* Remove button - top right */}
//  <CCol md={3}>
//                 {works.length > 1 && (
//                     <CButton
//                       color="danger"
//                       size="sm"
//                       className=""
//                       onClick={() => removeWorkRow(idx)}
//                     >
//                       {/* <CIcon icon={cilX} /> */}
//                       ✖ Remove This Work Order
//                     </CButton>
//                   )}
// </CCol>

// </CRow>

//                 </div>
//               ))}

//               {/* Calculations */}
//               <h6 className="mt-4 mb-3 fw-semibold text-primary border-bottom border-primary pb-2">
//                 Calculations
//               </h6>

//               <CRow className="mb-3">
//                 <CCol md={3}>
//                   <CFormLabel>Total Amount before GST</CFormLabel>
//                   <CInputGroup>
//                     <CInputGroupText>₹</CInputGroupText>
//                     <CFormInput type="number" value={form.subtotal} readOnly />
//                   </CInputGroup>
//                 </CCol>
//                 <CCol md={3}>
//                   <CFormLabel>Discount</CFormLabel>
//                   <CInputGroup>
//                     <CInputGroupText>₹</CInputGroupText>
//                     <CFormInput
//                       type="number"
//                       name="discount"
//                       value={form.discount}
//                       onChange={handleFormChange}
//                       min="0"
//                       step="0.01"
//                       readOnly
//                       disabled
//                     />
//                   </CInputGroup>
//                 </CCol>
//                 <CCol md={3}>
//                   <CFormLabel>Total Amount after GST</CFormLabel>
//                   <CInputGroup>
//                     <CInputGroupText>₹</CInputGroupText>
//                     <CFormInput
//                       type="number"
//                       value={form.finalAmount}
//                       readOnly
//                       className="fw-bold"
//                     />
//                   </CInputGroup>
//                 </CCol>
//               </CRow>

//               {/* Payment Terms */}
//               <h6 className="mt-4 mb-3 fw-semibold text-primary border-bottom border-primary pb-2">
//                 Payment Terms
//               </h6>
//               <div className="d-flex flex-wrap gap-2 mb-3">
//                 {paymentTerms.map((term, idx) => {
//                   if (editingPaymentIndex === idx) {
//                     return (
//                       <CInputGroup key={idx} style={{ width: 'auto' }}>
//                         <CFormInput
//                           value={editingPaymentValue}
//                           onChange={(e) => setEditingPaymentValue(e.target.value)}
//                         />
//                         <CButton
//                           color="success"
//                           onClick={() => {
//                             const newTerms = [...paymentTerms]
//                             newTerms[idx] = editingPaymentValue.trim()
//                             setPaymentTerms(newTerms)
//                             setEditingPaymentIndex(-1)
//                           }}
//                         >
//                           Save
//                         </CButton>
//                         <CButton color="secondary" onClick={() => setEditingPaymentIndex(-1)}>
//                           Cancel
//                         </CButton>
//                       </CInputGroup>
//                     )
//                   } else {
//                     return (
//                       <CBadge
//                         color="info"
//                         key={idx}
//                         className="me-1 mb-1"
//                         style={{ fontSize: '0.9em' }}
//                       >
//                         {term}
//                         <CIcon
//                           icon={cilPencil}
//                           className="ms-2"
//                           style={{ cursor: 'pointer' }}
//                           onClick={() => {
//                             setEditingPaymentIndex(idx)
//                             setEditingPaymentValue(term)
//                           }}
//                         />
//                         <CIcon
//                           icon={cilX}
//                           className="ms-1"
//                           style={{ cursor: 'pointer' }}
//                           onClick={() => {
//                             setPaymentTerms(paymentTerms.filter((_, i) => i !== idx))
//                           }}
//                         />
//                       </CBadge>
//                     )
//                   }
//                 })}
//               </div>
//               <CRow className="mb-3">
//                 <CCol md={6}>
//                   <CInputGroup>
//                     <CFormInput
//                       placeholder="Add new payment term..."
//                       value={newPaymentTerm}
//                       onChange={(e) => setNewPaymentTerm(e.target.value)}
//                     />
//                     <CButton
//                       color="primary"
//                       onClick={() => {
//                         if (newPaymentTerm.trim()) {
//                           setPaymentTerms([...paymentTerms, newPaymentTerm.trim()])
//                           setNewPaymentTerm('')
//                         }
//                       }}
//                     >
//                       Add
//                     </CButton>
//                   </CInputGroup>
//                 </CCol>
//               </CRow>

//               {/* Terms & Conditions */}
//               <h6 className="mt-4 mb-3 fw-semibold text-primary border-bottom border-primary pb-2">
//                 Terms & Conditions
//               </h6>
//               <div className="d-flex flex-wrap gap-2 mb-3">
//                 {termsAndConditions.map((term, idx) => {
//                   if (editingConditionIndex === idx) {
//                     return (
//                       <CInputGroup key={idx} style={{ width: 'auto' }}>
//                         <CFormInput
//                           value={editingConditionValue}
//                           onChange={(e) => setEditingConditionValue(e.target.value)}
//                         />
//                         <CButton
//                           color="success"
//                           onClick={() => {
//                             const newConditions = [...termsAndConditions]
//                             newConditions[idx] = editingConditionValue.trim()
//                             setTermsAndConditions(newConditions)
//                             setEditingConditionIndex(-1)
//                           }}
//                         >
//                           Save
//                         </CButton>
//                         <CButton
//                           color="secondary"
//                           onClick={() => setEditingConditionIndex(-1)}
//                         >
//                           Cancel
//                         </CButton>
//                       </CInputGroup>
//                     )
//                   } else {
//                     return (
//                       <CBadge
//                         color="warning"
//                         key={idx}
//                         className="me-1 mb-1"
//                         style={{ fontSize: '0.9em' }}
//                       >
//                         {term}
//                         <CIcon
//                           icon={cilPencil}
//                           className="ms-2"
//                           style={{ cursor: 'pointer' }}
//                           onClick={() => {
//                             setEditingConditionIndex(idx)
//                             setEditingConditionValue(term)
//                           }}
//                         />
//                         <CIcon
//                           icon={cilX}
//                           className="ms-1"
//                           style={{ cursor: 'pointer' }}
//                           onClick={() => {
//                             setTermsAndConditions(termsAndConditions.filter((_, i) => i !== idx))
//                           }}
//                         />
//                       </CBadge>
//                     )
//                   }
//                 })}
//               </div>
//               <CRow className="mb-3">
//                 <CCol md={6}>
//                   <CInputGroup>
//                     <CFormInput
//                       placeholder="Add new condition..."
//                       value={newCondition}
//                       onChange={(e) => setNewCondition(e.target.value)}
//                     />
//                     <CButton
//                       color="primary"
//                       onClick={() => {
//                         if (newCondition.trim()) {
//                           setTermsAndConditions([...termsAndConditions, newCondition.trim()])
//                           setNewCondition('')
//                         }
//                       }}
//                     >
//                       Add
//                     </CButton>
//                   </CInputGroup>
//                 </CCol>
//               </CRow>

//               {/* Notes */}
//               <CRow className="mb-3">
//                 <CCol md={12}>
//                   <CFormLabel>Additional Notes</CFormLabel>
//                   <CFormTextarea
//                     name="notes"
//                     value={form.notes}
//                     onChange={handleFormChange}
//                     rows={3}
//                     placeholder="Enter any additional notes..."
//                   />
//                 </CCol>
//               </CRow>

//               <div className="d-flex gap-2">
//                 <CButton
//                   color="primary"
//                   type="submit"
//                   disabled={saving}
//                 >
//                   {saving ? <CSpinner size="sm" /> : <CIcon icon={cilSave} className="me-1" />}
//                   Update Proforma Invoice
//                 </CButton>
//                 <CButton
//                   color="secondary"
//                   onClick={() => navigate(`/proforma-invoice-details/${id}`)}
//                   disabled={saving}
//                 >
//                   Cancel
//                 </CButton>
//               </div>
//             </CForm>
//           </CCardBody>
//         </CCard>
//       </CCol>
//     </CRow>
//   )
// }

// export default EditProformaInvoice





















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
  CBadge,
  CFormSelect,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilArrowLeft, cilPencil, cilSave, cilX, cilPlus } from '@coreui/icons'
import { getAPICall, put } from '../../../util/api'
import { useToast } from '../../common/toast/ToastContext'
import { paymentTypes, receiver_bank } from '../../../util/Feilds'

const EditProformaInvoice = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [validated, setValidated] = useState(false)

  const [proformaData, setProformaData] = useState(null)
  const [workOrderData, setWorkOrderData] = useState(null)
  const [previousProformas, setPreviousProformas] = useState([])

  // Sub-description helpers
  const [newSubDescs, setNewSubDescs] = useState([])
  const [editingSubDescWorkIdx, setEditingSubDescWorkIdx] = useState(-1)
  const [editingSubDescIdx, setEditingSubDescIdx] = useState(-1)
  const [editingSubDescValue, setEditingSubDescValue] = useState('')

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
    gstPercentage: 0,
    sgstPercentage: 0,
    cgstPercentage: 0,
    igstPercentage: 0,
    notes: '',
    status: 'draft',
    terms_conditions: '',
    payment_terms: '',
  })

  const [works, setWorks] = useState([])

  // Payment Terms & Conditions
  const [paymentTerms, setPaymentTerms] = useState([])
  const [editingPaymentIndex, setEditingPaymentIndex] = useState(-1)
  const [editingPaymentValue, setEditingPaymentValue] = useState('')
  const [newPaymentTerm, setNewPaymentTerm] = useState('')

  const [termsAndConditions, setTermsAndConditions] = useState([])
  const [editingConditionIndex, setEditingConditionIndex] = useState(-1)
  const [editingConditionValue, setEditingConditionValue] = useState('')
  const [newCondition, setNewCondition] = useState('')

  // Local payment types (with Debit Note)
  const localPaymentTypes = [
    ...paymentTypes,
    { value: 'debit_note', label: 'Debit Note' }
  ]

  // Multiple Advance Payments
  const [advancePayments, setAdvancePayments] = useState([])
  const [currentAdvance, setCurrentAdvance] = useState({
    received_amount: '',
    received_by: '',
    payment_type: 'cash',
    senders_bank: '',
    receivers_bank: '',
    remark: '',
    payment_date: new Date().toISOString().split('T')[0],
  })
  const [editingAdvanceIndex, setEditingAdvanceIndex] = useState(-1)

  // ──────────────────────────────────────────────────────────────
  // Fetch Data
  // ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // 1. Proforma details
        const proformaRes = await getAPICall(`/api/proforma-invoices/${id}`)
        if (!proformaRes?.success) throw new Error('Failed to load proforma')
        const proforma = proformaRes.data
        setProformaData(proforma)

        // Fill form
        setForm({
          tally_invoice_number: proforma.tally_invoice_number || '',
          invoice_date: proforma.invoice_date?.split('T')[0] || '',
          delivery_date: proforma.delivery_date?.split('T')[0] || '',
          discount: Number(proforma.discount) || 0,
          subtotal: Number(proforma.subtotal) || 0,
          taxableAmount: Number(proforma.taxable_amount) || 0,
          gstAmount: Number(proforma.gst_amount) || 0,
          sgstAmount: Number(proforma.sgst_amount) || 0,
          cgstAmount: Number(proforma.cgst_amount) || 0,
          igstAmount: Number(proforma.igst_amount) || 0,
          finalAmount: Number(proforma.final_amount) || 0,
          gstPercentage: Number(proforma.gst_percentage) || 0,
          sgstPercentage: Number(proforma.sgst_percentage) || 0,
          cgstPercentage: Number(proforma.cgst_percentage) || 0,
          igstPercentage: Number(proforma.igst_percentage) || 0,
          notes: proforma.notes || '',
          status: proforma.status || 'draft',
          payment_terms: proforma.payment_terms || '',
          terms_conditions: proforma.terms_conditions || '',
        })

        // Split terms
        if (proforma.payment_terms) {
          setPaymentTerms(proforma.payment_terms.split('\n').map(t => t.trim()).filter(Boolean))
        }
        if (proforma.terms_conditions) {
          setTermsAndConditions(proforma.terms_conditions.split('\n').map(t => t.trim()).filter(Boolean))
        }

        // Load advance payments
        if (proforma.advances?.length > 0) {
          setAdvancePayments(proforma.advances.map(adv => ({
            received_amount: Number(adv.advanced_amount) || 0,
            received_by: adv.received_from || '',
            payment_type: adv.payment_type || 'cash',
            senders_bank: adv.senders_bank || '',
            receivers_bank: adv.receivers_bank || '',
            remark: adv.remark || adv.transaction_number || '',
            payment_date: adv.payment_date?.split('T')[0] || '',
          })))
        }

      } catch (err) {
        console.error(err)
        showToast('danger', 'Failed to load proforma invoice')
        navigate('/invoiceTable')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, navigate])

  useEffect(() => {
    if (!proformaData?.work_order_id) return

    const loadWorkOrderAndPrev = async () => {
      try {
        const woRes = await getAPICall(`/api/order/${proformaData.work_order_id}`)
        setWorkOrderData(woRes)

        const prevRes = await getAPICall(`/api/proforma-invoices?work_order_id=${proformaData.work_order_id}`)
        setPreviousProformas((prevRes?.data?.data || []).filter(p => p.id !== Number(id)))
      } catch (err) {
        console.error(err)
      }
    }

    loadWorkOrderAndPrev()
  }, [proformaData?.work_order_id])

  useEffect(() => {
    if (!workOrderData?.items || !proformaData) return

    const normalize = str => (str || '').trim().toLowerCase()

    const loadedWorks = workOrderData.items.map(item => {
      const key = normalize(item.work_type)
      const originalQty = Number(item.qty) || 0

      let used = 0
      previousProformas.forEach(p => {
        p.details?.forEach(d => {
          if (normalize(d.work_type) === key) used += Number(d.qty) || 0
        })
      })

      const detail = proformaData.details?.find(d => normalize(d.work_type) === key)

      return {
        id: detail?.id,
        work_type: item.work_type || '',
        uom: item.uom || '',
        qty: detail ? Number(detail.qty) : 0,
        price: detail ? Number(detail.price) : Number(item.price) || 0,
        total_price: detail ? Number(detail.total_price) : 0,
        remark: detail?.remark || '',
        gst_percent: detail ? Number(detail.gst_percent) : 18,
        cgst_amount: detail ? Number(detail.cgst_amount) : 0,
        sgst_amount: detail ? Number(detail.sgst_amount) : 0,
        sub_descriptions: detail?.work_sub_description
          ? detail.work_sub_description.split('\n').map(l => l.trim()).filter(Boolean)
          : [],
        original_qty: originalQty,
        used_qty: used,
      }
    })

    setWorks(loadedWorks)
    setNewSubDescs(Array(loadedWorks.length).fill(''))
  }, [workOrderData, previousProformas, proformaData])

  // ──────────────────────────────────────────────────────────────
  // Handlers
  // ──────────────────────────────────────────────────────────────

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setForm(prev => {
      let next = { ...prev, [name]: name === 'discount' || name.endsWith('Percentage') ? parseFloat(value) || 0 : value }

      if (name === 'gstPercentage') {
        const half = (parseFloat(value) || 0) / 2
        next.sgstPercentage = half
        next.cgstPercentage = half
      } else if (name === 'sgstPercentage' || name === 'cgstPercentage') {
        const sgst = name === 'sgstPercentage' ? parseFloat(value) || 0 : prev.sgstPercentage
        const cgst = name === 'cgstPercentage' ? parseFloat(value) || 0 : prev.cgstPercentage
        next.gstPercentage = sgst + cgst
      }

      if (name === 'discount' || name.endsWith('Percentage')) {
        const subtotal = works.reduce((sum, w) => sum + (w.total_price || 0), 0)
        const taxable = subtotal - next.discount
        const sgstAmt = taxable * (next.sgstPercentage / 100)
        const cgstAmt = taxable * (next.cgstPercentage / 100)
        const igstAmt = taxable * (next.igstPercentage / 100)
        const gstAmt = sgstAmt + cgstAmt + igstAmt

        next = {
          ...next,
          subtotal: +subtotal.toFixed(2),
          taxableAmount: +taxable.toFixed(2),
          sgstAmount: +sgstAmt.toFixed(2),
          cgstAmount: +cgstAmt.toFixed(2),
          igstAmount: +igstAmt.toFixed(2),
          gstAmount: +gstAmt.toFixed(2),
          finalAmount: +(taxable + gstAmt).toFixed(2)
        }
      }

      return next
    })
  }

  const handleCurrentAdvanceChange = (e) => {
    const { name, value } = e.target
    setCurrentAdvance(prev => ({ ...prev, [name]: value }))
  }

  const addOrUpdateAdvancePayment = () => {
    const amount = parseFloat(currentAdvance.received_amount || 0)
    if (amount <= 0) {
      showToast('warning', 'Please enter a valid amount > 0')
      return
    }
    if (!currentAdvance.payment_date) {
      showToast('warning', 'Payment date is required')
      return
    }

    let payment = { ...currentAdvance, received_amount: amount }

    if (payment.payment_type === 'debit_note') {
      payment.received_by = '--'
      payment.senders_bank = '--'
      payment.receivers_bank = '--'
    }

    if (editingAdvanceIndex === -1) {
      setAdvancePayments(prev => [...prev, payment])
    } else {
      const updated = [...advancePayments]
      updated[editingAdvanceIndex] = payment
      setAdvancePayments(updated)
    }

    setCurrentAdvance({
      received_amount: '',
      received_by: '',
      payment_type: 'cash',
      senders_bank: '',
      receivers_bank: '',
      remark: '',
      payment_date: new Date().toISOString().split('T')[0],
    })
    setEditingAdvanceIndex(-1)
  }

  const editAdvance = (index) => {
    setCurrentAdvance(advancePayments[index])
    setEditingAdvanceIndex(index)
  }

  const removeAdvance = (index) => {
    setAdvancePayments(prev => prev.filter((_, i) => i !== index))
    if (editingAdvanceIndex === index) {
      setEditingAdvanceIndex(-1)
      setCurrentAdvance({
        received_amount: '',
        received_by: '',
        payment_type: 'cash',
        senders_bank: '',
        receivers_bank: '',
        remark: '',
        payment_date: new Date().toISOString().split('T')[0],
      })
    }
  }

  const handleWorkChange = (index, field, value) => {
    const updated = [...works]

    if (field === 'qty') {
      let val = parseFloat(value) || 0
      const max = updated[index].original_qty - updated[index].used_qty
      val = Math.max(0, Math.min(val, max))
      updated[index].qty = val
    } else if (field === 'price' || field === 'gst_percent') {
      updated[index][field] = Number(value) || 0
    } else {
      updated[index][field] = value
    }

    setWorks(updated)
    recalcRow(index)
  }

  const recalcRow = (index) => {
    const updated = [...works]
    const row = updated[index]
    const base = (row.qty || 0) * (row.price || 0)
    const half = (row.gst_percent || 0) / 2

    row.cgst_amount = +(base * half / 100).toFixed(2)
    row.sgst_amount = +(base * half / 100).toFixed(2)
    row.total_price = +(base + row.cgst_amount + row.sgst_amount).toFixed(2)

    setWorks(updated)
    calculateTotals()
  }

  const calculateTotals = () => {
    const taxable = works.reduce((sum, w) => sum + (w.qty || 0) * (w.price || 0), 0)
    const cgst = works.reduce((sum, w) => sum + (w.cgst_amount || 0), 0)
    const sgst = works.reduce((sum, w) => sum + (w.sgst_amount || 0), 0)
    const gst = cgst + sgst

    setForm(prev => ({
      ...prev,
      subtotal: +taxable.toFixed(2),
      taxableAmount: +taxable.toFixed(2),
      cgstAmount: +cgst.toFixed(2),
      sgstAmount: +sgst.toFixed(2),
      gstAmount: +gst.toFixed(2),
      finalAmount: +(taxable + gst - prev.discount).toFixed(2)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!e.currentTarget.checkValidity()) {
      setValidated(true)
      return
    }

    const totalAdvance = advancePayments.reduce((sum, p) => sum + (Number(p.received_amount) || 0), 0)
    if (totalAdvance > form.finalAmount) {
      showToast('danger', `Total advance (₹${totalAdvance.toFixed(2)}) cannot exceed final amount (₹${form.finalAmount.toFixed(2)})`)
      return
    }

    try {
      setSaving(true)

      const payload = {
        tally_invoice_number: form.tally_invoice_number || null,
        invoice_date: form.invoice_date,
        delivery_date: form.delivery_date || null,
        items: works
          .filter(w => w.work_type && w.qty > 0)
          .map(w => ({
            id: w.id || undefined,
            work_type: w.work_type,
            uom: w.uom || null,
            qty: w.qty,
            price: w.price,
            total_price: w.total_price,
            remark: w.remark || null,
            work_sub_description: w.sub_descriptions?.join('\n') || null,
            gst_percent: w.gst_percent ?? 0,
            cgst_amount: w.cgst_amount ?? 0,
            sgst_amount: w.sgst_amount ?? 0,
          })),
        discount: form.discount,
        gst_percentage: form.gstPercentage,
        cgst_percentage: form.cgstPercentage,
        sgst_percentage: form.sgstPercentage,
        igst_percentage: form.igstPercentage,
        notes: form.notes || null,
        status: form.status,
        payment_terms: paymentTerms.join('\n'),
        terms_conditions: termsAndConditions.join('\n'),
        advance_payments: advancePayments.map(p => ({
          received_amount: Number(p.received_amount) || 0,
          payment_date: p.payment_date,
          received_from: p.received_by || null,
          payment_type: p.payment_type || null,
          senders_bank: p.senders_bank || null,
          receivers_bank: p.receivers_bank || null,
          remark: p.remark || null,
        })),
      }

      const resp = await put(`/api/proforma-invoices/${id}`, payload)

      if (resp?.success) {
        showToast('success', 'Proforma invoice updated successfully')
        setTimeout(() => navigate(`/proforma-invoice-details/${id}`), 1200)
      } else {
        showToast('danger', resp.message || 'Update failed')
      }
    } catch (err) {
      console.error(err)
      showToast('danger', err.message || 'Error updating proforma')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="text-center py-5"><CSpinner color="primary" /></div>

  if (!proformaData) {
    return (
      <CCard>
        <CCardBody>
          <CAlert color="danger">
            <h5>Proforma Invoice Not Found</h5>
            <CButton color="primary" onClick={() => navigate('/invoiceTable')}>Back to List</CButton>
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
              <CButton color="secondary" size="sm" onClick={() => navigate(`/proforma-invoice-details/${id}`)}>
                <CIcon icon={cilArrowLeft} className="me-1" /> Back to Details
              </CButton>
            </div>
          </CCardHeader>

          <CCardBody>
            {/* Work Order Info */}
            <div className="bg-light p-3 rounded mb-4">
              <h6 className="mb-2">Work Order Information</h6>
              <CRow>
                <CCol md={3}>
                  <small className="text-muted">Work Order:</small>
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
                  <div className="fw-bold text-capitalize">{proformaData.payment_status}</div>
                </CCol>
              </CRow>
            </div>

            <CForm noValidate validated={validated} onSubmit={handleSubmit}>
              {/* Invoice Details */}
              <CRow className="mb-4 g-3">
                <CCol md={3}>
                  <CFormLabel>Tally Invoice Number</CFormLabel>
                  <CFormInput name="tally_invoice_number" value={form.tally_invoice_number} onChange={handleFormChange} />
                </CCol>
                <CCol md={3}>
                  <CFormLabel>Invoice Date *</CFormLabel>
                  <CFormInput type="date" name="invoice_date" value={form.invoice_date} onChange={handleFormChange} required />
                </CCol>
                <CCol md={3}>
                  <CFormLabel>Delivery Date</CFormLabel>
                  <CFormInput type="date" name="delivery_date" value={form.delivery_date} onChange={handleFormChange} />
                </CCol>
                <CCol md={3}>
                  <CFormLabel>Status</CFormLabel>
                  <CFormSelect name="status" value={form.status} onChange={handleFormChange}>
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="approved">Approved</option>
                    <option value="cancelled">Cancelled</option>
                  </CFormSelect>
                </CCol>
              </CRow>

              {/* Advance Payments - Multiple */}
              <h6 className="mt-5 mb-3 fw-semibold text-primary border-bottom border-primary pb-2">
                Advance Payments
              </h6>

              <div className="border rounded p-4 mb-5 bg-light">
                <CRow className="g-3 mb-4">
                  <CCol md={4}>
                    <CFormLabel>Amount *</CFormLabel>
                    <CInputGroup>
                      <CInputGroupText>₹</CInputGroupText>
                      <CFormInput
                        type="number"
                        step="0.01"
                        min="0.01"
                        name="received_amount"
                        value={currentAdvance.received_amount}
                        onChange={handleCurrentAdvanceChange}
                        placeholder="0.00"
                      />
                    </CInputGroup>
                  </CCol>

                  <CCol md={4}>
                    <CFormLabel>Payment Date *</CFormLabel>
                    <CFormInput
                      type="date"
                      name="payment_date"
                      value={currentAdvance.payment_date}
                      onChange={handleCurrentAdvanceChange}
                    />
                  </CCol>

                  {currentAdvance.payment_type !== 'debit_note' && (
                    <CCol md={4}>
                      <CFormLabel>Received From</CFormLabel>
                      <CFormInput name="received_by" value={currentAdvance.received_by} onChange={handleCurrentAdvanceChange} />
                    </CCol>
                  )}

                  <CCol md={4}>
                    <CFormLabel>Payment Type</CFormLabel>
                    <CFormSelect name="payment_type" value={currentAdvance.payment_type} onChange={handleCurrentAdvanceChange}>
                      {localPaymentTypes.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </CFormSelect>
                  </CCol>

                  {currentAdvance.payment_type !== 'debit_note' && (
                    <>
                      <CCol md={4}>
                        <CFormLabel>Sender's Bank</CFormLabel>
                        <CFormInput name="senders_bank" value={currentAdvance.senders_bank} onChange={handleCurrentAdvanceChange} />
                      </CCol>
                      <CCol md={4}>
                        <CFormLabel>Receiver's Bank</CFormLabel>
                        <CFormSelect name="receivers_bank" value={currentAdvance.receivers_bank} onChange={handleCurrentAdvanceChange}>
                          <option value="">Select bank</option>
                          {receiver_bank.map(b => (
                            <option key={b.value} value={b.value}>{b.label}</option>
                          ))}
                        </CFormSelect>
                      </CCol>
                    </>
                  )}

                  <CCol md={12}>
                    <CFormLabel>Remark / Transaction No</CFormLabel>
                    <CFormInput name="remark" value={currentAdvance.remark} onChange={handleCurrentAdvanceChange} />
                  </CCol>

                  <CCol md={12} className="text-end">
                    <CButton
                      color={editingAdvanceIndex === -1 ? 'success' : 'primary'}
                      onClick={addOrUpdateAdvancePayment}
                    >
                      {editingAdvanceIndex === -1 ? 'Add Payment' : 'Update Payment'}
                    </CButton>
                    {editingAdvanceIndex !== -1 && (
                      <CButton color="secondary" className="ms-2" onClick={() => {
                        setEditingAdvanceIndex(-1)
                        setCurrentAdvance({
                          received_amount: '',
                          received_by: '',
                          payment_type: 'cash',
                          senders_bank: '',
                          receivers_bank: '',
                          remark: '',
                          payment_date: new Date().toISOString().split('T')[0],
                        })
                      }}>
                        Cancel
                      </CButton>
                    )}
                  </CCol>
                </CRow>

                {advancePayments.length > 0 && (
                  <>
                    <hr />
                    <h6 className="mb-3">Added / Existing Payments:</h6>
                    {advancePayments.map((p, i) => (
                      <div key={i} className="border rounded p-3 mb-3 bg-white">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <strong>₹{Number(p.received_amount).toFixed(2)}</strong>
                            <span className="ms-3 text-muted">{new Date(p.payment_date).toLocaleDateString()}</span>
                            {p.received_by && p.received_by !== '--' && <div className="small text-muted">From: {p.received_by}</div>}
                            <div className="small text-muted">Type: {p.payment_type === 'debit_note' ? 'Debit Note' : p.payment_type}</div>
                            {p.remark && <div className="small text-muted">Remark: {p.remark}</div>}
                          </div>
                          <div>
                            <CButton color="warning" size="sm" variant="outline" className="me-2" onClick={() => editAdvance(i)}>
                              Edit
                            </CButton>
                            <CButton color="danger" size="sm" variant="outline" onClick={() => removeAdvance(i)}>
                              Remove
                            </CButton>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {advancePayments.length === 0 && (
                  <div className="text-center text-muted py-4">No advance payments recorded yet</div>
                )}
              </div>

              {/* Work Details */}
              <h6 className="mt-5 mb-3 fw-semibold text-primary border-bottom border-primary pb-2">
                Work Details
              </h6>

              {/* {works.map((w, idx) => (
                <div key={idx} className="border rounded p-4 mb-4 bg-light position-relative">
                  <CRow className="g-3 mb-4">
                    <CCol md={6}>
                      <CFormLabel>Work Type *</CFormLabel>
                      <CFormInput
                        value={w.work_type}
                        onChange={e => handleWorkChange(idx, 'work_type', e.target.value)}
                        required
                        placeholder="Enter work type"
                      />
                    </CCol>

                    <CCol md={6}>
                      <CFormLabel>Sub Descriptions</CFormLabel>
                      <CInputGroup>
                        <CFormInput
                          placeholder="Add sub description..."
                          value={newSubDescs[idx] || ''}
                          onChange={e => {
                            const arr = [...newSubDescs]
                            arr[idx] = e.target.value
                            setNewSubDescs(arr)
                          }}
                        />
                        <CButton
                          color="primary"
                          size="sm"
                          onClick={() => {
                            if (!newSubDescs[idx]?.trim()) return
                            const updated = [...works]
                            updated[idx].sub_descriptions = [
                              ...(updated[idx].sub_descriptions || []),
                              newSubDescs[idx].trim()
                            ]
                            setWorks(updated)
                            const newArr = [...newSubDescs]
                            newArr[idx] = ''
                            setNewSubDescs(newArr)
                          }}
                        >
                          <CIcon icon={cilPlus} /> Add
                        </CButton>
                      </CInputGroup>

                      <div className="d-flex flex-wrap gap-2 mt-2">
                        {(w.sub_descriptions || []).map((desc, subIdx) => {
                          const editing = editingSubDescWorkIdx === idx && editingSubDescIdx === subIdx

                          if (editing) {
                            return (
                              <CInputGroup key={subIdx} size="sm" className="align-items-center" style={{ width: 'auto', minWidth: '300px' }}>
                                <CFormInput
                                  value={editingSubDescValue}
                                  onChange={e => setEditingSubDescValue(e.target.value)}
                                  autoFocus
                                />
                                <CButton
                                  color="success"
                                  size="sm"
                                  onClick={() => {
                                    if (!editingSubDescValue.trim()) {
                                      showToast('warning', 'Cannot save empty sub-description')
                                      return
                                    }
                                    const updated = [...works]
                                    updated[idx].sub_descriptions[subIdx] = editingSubDescValue.trim()
                                    setWorks(updated)
                                    setEditingSubDescWorkIdx(-1)
                                    setEditingSubDescIdx(-1)
                                    setEditingSubDescValue('')
                                  }}
                                >
                                  Save
                                </CButton>
                                <CButton color="secondary" size="sm" onClick={() => {
                                  setEditingSubDescWorkIdx(-1)
                                  setEditingSubDescIdx(-1)
                                  setEditingSubDescValue('')
                                }}>
                                  Cancel
                                </CButton>
                              </CInputGroup>
                            )
                          }

                          return (
                            <span
                              key={subIdx}
                              className="badge bg-light text-dark border px-3 py-2 d-flex align-items-center gap-2"
                              style={{ fontSize: '0.95rem' }}
                            >
                              {desc}
                              <CIcon
                                icon={cilPencil}
                                size="sm"
                                className="cursor-pointer text-primary"
                                onClick={() => {
                                  setEditingSubDescWorkIdx(idx)
                                  setEditingSubDescIdx(subIdx)
                                  setEditingSubDescValue(desc)
                                }}
                              />
                              <CIcon
                                icon={cilX}
                                size="sm"
                                className="cursor-pointer text-danger"
                                onClick={() => {
                                  const updated = [...works]
                                  updated[idx].sub_descriptions.splice(subIdx, 1)
                                  setWorks(updated)
                                }}
                              />
                            </span>
                          )
                        })}
                      </div>
                    </CCol>
                  </CRow>

                  <CRow className="g-3 mb-3">
                    <CCol md={3}>
                      <CFormLabel>UOM</CFormLabel>
                      <CFormInput
                        value={w.uom}
                        onChange={e => handleWorkChange(idx, 'uom', e.target.value)}
                        placeholder="Unit"
                      />
                    </CCol>
                    <CCol md={3}>
                      <CFormLabel>
                         Qty <span className="text-danger fw-bold">*</span>
                         <small className="text-danger d-block mt-1" style={{ lineHeight: '1.3' }}>
                           Total in Work Order: <strong>{Number(w.original_qty).toFixed(2)}</strong><br />
                           Already billed: <strong>{w.used_qty.toFixed(2)}</strong><br />
                           <strong style={{ fontSize: '1.05em' }}>
                            Remaining allowed: {(w.original_qty - w.used_qty).toFixed(2)}
                           </strong>
                         </small>
                      </CFormLabel>

                      <CFormInput
                        type="number"
                        step="0.01"
                        min="0"
                        value={w.qty}
                        onChange={e => handleWorkChange(idx, 'qty', e.target.value)}
                        required
                      />
                    </CCol>
                    <CCol md={3}>
                      <CFormLabel>Rate</CFormLabel>
                      <CInputGroup>
                        <CInputGroupText>₹</CInputGroupText>
                        <CFormInput type="number" value={w.price} readOnly disabled />
                      </CInputGroup>
                    </CCol>
                    <CCol md={3}>
                      <CFormLabel>Base Amount</CFormLabel>
                      <div className="pt-2 fw-medium">
                        ₹{((w.qty || 0) * (w.price || 0)).toFixed(2)}
                      </div>
                    </CCol>
                  </CRow>

                  <CRow className="g-3 mb-3">
                    <CCol md={3}>
                      <CFormLabel>GST %</CFormLabel>
                      <CFormInput type="number" value={w.gst_percent} readOnly disabled />
                    </CCol>
                    <CCol md={3}>
                      <CFormLabel>CGST</CFormLabel>
                      <div className="text-success fw-medium">₹{Number(w.cgst_amount || 0).toFixed(2)}</div>
                    </CCol>
                    <CCol md={3}>
                      <CFormLabel>SGST</CFormLabel>
                      <div className="text-success fw-medium">₹{Number(w.sgst_amount || 0).toFixed(2)}</div>
                    </CCol>
                    <CCol md={3}>
                      <CFormLabel className="text-primary">Total (incl. GST)</CFormLabel>
                      <div className="fw-bold text-primary">₹{Number(w.total_price || 0).toFixed(2)}</div>
                    </CCol>
                  </CRow>

                  <CRow className="g-3 align-items-end">
                    <CCol md={9}>
                      <CFormLabel>Remark</CFormLabel>
                      <CFormInput
                        value={w.remark}
                        onChange={e => handleWorkChange(idx, 'remark', e.target.value)}
                        placeholder="Remark / note"
                      />
                    </CCol>
                    <CCol md={3}>
                      {works.length > 1 && (
                        <CButton
                          color="danger"
                          size="sm"
                          className="mt-4"
                          onClick={() => {
                            if (works.length > 1) {
                              const updated = works.filter((_, i) => i !== idx)
                              setWorks(updated)
                              setNewSubDescs(prev => prev.filter((_, i) => i !== idx))
                              calculateTotals()
                            }
                          }}
                        >
                          Remove Work Item
                        </CButton>
                      )}
                    </CCol>
                  </CRow>
                </div>
              ))} */}

{works.map((w, idx) => (
  <div key={idx} className="border rounded p-4 mb-4 bg-light position-relative">
    <CRow className="g-3 mb-4">
      <CCol md={6}>
        <CFormLabel>Work Type *</CFormLabel>
        <CFormInput
          value={w.work_type}
          onChange={e => handleWorkChange(idx, 'work_type', e.target.value)}
          required
          placeholder="Enter work type"
        />
      </CCol>

      <CCol md={6}>
        <CFormLabel>Sub Descriptions</CFormLabel>
        <CInputGroup>
          <CFormInput
            placeholder="Add sub description..."
            value={newSubDescs[idx] || ''}
            onChange={e => {
              const arr = [...newSubDescs]
              arr[idx] = e.target.value
              setNewSubDescs(arr)
            }}
          />
          <CButton
            color="primary"
            size="sm"
            onClick={() => {
              if (!newSubDescs[idx]?.trim()) return
              const updated = [...works]
              updated[idx].sub_descriptions = [
                ...(updated[idx].sub_descriptions || []),
                newSubDescs[idx].trim()
              ]
              setWorks(updated)
              const newArr = [...newSubDescs]
              newArr[idx] = ''
              setNewSubDescs(newArr)
            }}
          >
            <CIcon icon={cilPlus} /> Add
          </CButton>
        </CInputGroup>
      </CCol>
    </CRow>

    <div className="d-flex flex-wrap gap-2 mb-3">
      {(w.sub_descriptions || []).map((desc, subIdx) => {
        const editing = editingSubDescWorkIdx === idx && editingSubDescIdx === subIdx

        if (editing) {
          return (
            <CInputGroup key={subIdx} size="sm" className="align-items-center" style={{ width: 'auto', minWidth: '300px' }}>
              <CFormInput
                value={editingSubDescValue}
                onChange={e => setEditingSubDescValue(e.target.value)}
                autoFocus
              />
              <CButton
                color="success"
                size="sm"
                onClick={() => {
                  if (!editingSubDescValue.trim()) {
                    showToast('warning', 'Cannot save empty sub-description')
                    return
                  }
                  const updated = [...works]
                  updated[idx].sub_descriptions[subIdx] = editingSubDescValue.trim()
                  setWorks(updated)
                  setEditingSubDescWorkIdx(-1)
                  setEditingSubDescIdx(-1)
                  setEditingSubDescValue('')
                }}
              >
                Save
              </CButton>
              <CButton color="secondary" size="sm" onClick={() => {
                setEditingSubDescWorkIdx(-1)
                setEditingSubDescIdx(-1)
                setEditingSubDescValue('')
              }}>
                Cancel
              </CButton>
            </CInputGroup>
          )
        }

        return (
          <span
            key={subIdx}
            className="badge bg-light text-dark border px-3 py-2 d-flex align-items-center gap-2"
            style={{ fontSize: '0.95rem' }}
          >
            {desc}
            <CIcon
              icon={cilPencil}
              size="sm"
              className="cursor-pointer text-primary"
              onClick={() => {
                setEditingSubDescWorkIdx(idx)
                setEditingSubDescIdx(subIdx)
                setEditingSubDescValue(desc)
              }}
            />
            <CIcon
              icon={cilX}
              size="sm"
              className="cursor-pointer text-danger"
              onClick={() => {
                const updated = [...works]
                updated[idx].sub_descriptions.splice(subIdx, 1)
                setWorks(updated)
              }}
            />
          </span>
        )
      })}
    </div>

    <CRow className="g-3 mb-3 align-items-end">
      <CCol md={3}>
        <CFormLabel>UOM</CFormLabel>
        <CFormInput
          value={w.uom}
          onChange={e => handleWorkChange(idx, 'uom', e.target.value)}
          placeholder="Unit"
        />
      </CCol>
      <CCol md={3}>
        <CFormLabel>
          Qty <span className="text-danger fw-bold">*</span>
          <small className="text-danger d-block mt-1" style={{ lineHeight: '1.3' }}>
            Total in Work Order: <strong>{Number(w.original_qty).toFixed(2)}</strong>, Already billed: <strong>{w.used_qty.toFixed(2)}</strong>, 
            <strong style={{ fontSize: '1.05em' }}>
              Remaining allowed: {(w.original_qty - w.used_qty).toFixed(2)}
            </strong>
          </small>
        </CFormLabel>

        <CFormInput
          type="number"
          step="0.01"
          min="0"
          value={w.qty}
          onChange={e => handleWorkChange(idx, 'qty', e.target.value)}
          required
        />
      </CCol>

      
      <CCol md={3}>
        <CFormLabel>Rate</CFormLabel>
        <CInputGroup>
          <CInputGroupText>₹</CInputGroupText>
          <CFormInput type="number" value={w.price} readOnly disabled />
        </CInputGroup>
      </CCol>
      <CCol md={3}>
        <CFormLabel>Base Amount</CFormLabel>
        <div className="pt-2 fw-medium">
          ₹{((w.qty || 0) * (w.price || 0)).toFixed(2)}
        </div>
      </CCol>
    </CRow>

    <CRow className="g-3 mb-3">
      <CCol md={3}>
        <CFormLabel>GST %</CFormLabel>
        <CFormInput type="number" value={w.gst_percent} readOnly disabled />
      </CCol>
      <CCol md={3}>
        <CFormLabel>CGST</CFormLabel>
        <div className="text-success fw-medium">₹{Number(w.cgst_amount || 0).toFixed(2)}</div>
      </CCol>
      <CCol md={3}>
        <CFormLabel>SGST</CFormLabel>
        <div className="text-success fw-medium">₹{Number(w.sgst_amount || 0).toFixed(2)}</div>
      </CCol>
      <CCol md={3}>
        <CFormLabel className="text-primary">Total (incl. GST)</CFormLabel>
        <div className="fw-bold text-primary">₹{Number(w.total_price || 0).toFixed(2)}</div>
      </CCol>
    </CRow>

    <CRow className="g-3 align-items-end">
      <CCol md={9}>
        <CFormLabel>Remark</CFormLabel>
        <CFormInput
          value={w.remark}
          onChange={e => handleWorkChange(idx, 'remark', e.target.value)}
          placeholder="Remark / note"
        />
      </CCol>
      <CCol md={3}>
        {works.length > 1 && (
          <CButton
            color="danger"
            size="sm"
            className="mt-4"
            onClick={() => {
              if (works.length > 1) {
                const updated = works.filter((_, i) => i !== idx)
                setWorks(updated)
                setNewSubDescs(prev => prev.filter((_, i) => i !== idx))
                calculateTotals()
              }
            }}
          >
            Remove Work Item
          </CButton>
        )}
      </CCol>
    </CRow>
  </div>
))}
  

              

              {/* Calculations */}
              <h6 className="mt-5 mb-3 fw-semibold text-primary border-bottom border-primary pb-2">
                Summary
              </h6>

              <CRow className="mb-4 g-3">
                <CCol md={6}>
                  <CFormLabel>Subtotal (before GST)</CFormLabel>
                  <CInputGroup>
                    <CInputGroupText>₹</CInputGroupText>
                    <CFormInput type="number" value={form.subtotal.toFixed(2)} readOnly />
                  </CInputGroup>
                </CCol>
                <CCol md={6}>
                  <CFormLabel>Final Amount (incl. GST)</CFormLabel>
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
              <h6 className="mt-5 mb-3 fw-semibold text-primary border-bottom border-primary pb-2">
                Payment Terms
              </h6>
              <div className="d-flex flex-wrap gap-2 mb-3">
                {paymentTerms.map((term, i) => {
                  if (editingPaymentIndex === i) {
                    return (
                      <CInputGroup key={i} style={{ width: 'auto', minWidth: '320px' }}>
                        <CFormInput
                          value={editingPaymentValue}
                          onChange={e => setEditingPaymentValue(e.target.value)}
                        />
                        <CButton
                          color="success"
                          onClick={() => {
                            const arr = [...paymentTerms]
                            arr[i] = editingPaymentValue.trim()
                            setPaymentTerms(arr)
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
                  }
                  return (
                    <CBadge color="info" key={i} className="px-3 py-2" style={{ fontSize: '0.9rem' }}>
                      {term}
                      <CIcon
                        icon={cilPencil}
                        className="ms-2 cursor-pointer"
                        onClick={() => {
                          setEditingPaymentIndex(i)
                          setEditingPaymentValue(term)
                        }}
                      />
                      <CIcon
                        icon={cilX}
                        className="ms-1 cursor-pointer"
                        onClick={() => setPaymentTerms(paymentTerms.filter((_, idx) => idx !== i))}
                      />
                    </CBadge>
                  )
                })}
              </div>

              <CRow className="mb-4">
                <CCol md={6}>
                  <CInputGroup>
                    <CFormInput
                      placeholder="Add new payment term..."
                      value={newPaymentTerm}
                      onChange={e => setNewPaymentTerm(e.target.value)}
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
              <h6 className="mt-5 mb-3 fw-semibold text-primary border-bottom border-primary pb-2">
                Terms & Conditions
              </h6>

              <div className="d-flex flex-wrap gap-2 mb-3">
                {termsAndConditions.map((cond, i) => {
                  if (editingConditionIndex === i) {
                    return (
                      <CInputGroup key={i} style={{ width: 'auto', minWidth: '320px' }}>
                        <CFormInput
                          value={editingConditionValue}
                          onChange={e => setEditingConditionValue(e.target.value)}
                        />
                        <CButton
                          color="success"
                          onClick={() => {
                            const arr = [...termsAndConditions]
                            arr[i] = editingConditionValue.trim()
                            setTermsAndConditions(arr)
                            setEditingConditionIndex(-1)
                          }}
                        >
                          Save
                        </CButton>
                        <CButton color="secondary" onClick={() => setEditingConditionIndex(-1)}>
                          Cancel
                        </CButton>
                      </CInputGroup>
                    )
                  }
                  return (
                    <CBadge color="warning" key={i} className="px-3 py-2" style={{ fontSize: '0.9rem' }}>
                      {cond}
                      <CIcon
                        icon={cilPencil}
                        className="ms-2 cursor-pointer"
                        onClick={() => {
                          setEditingConditionIndex(i)
                          setEditingConditionValue(cond)
                        }}
                      />
                      <CIcon
                        icon={cilX}
                        className="ms-1 cursor-pointer"
                        onClick={() => setTermsAndConditions(termsAndConditions.filter((_, idx) => idx !== i))}
                      />
                    </CBadge>
                  )
                })}
              </div>

              <CRow className="mb-5">
                <CCol md={6}>
                  <CInputGroup>
                    <CFormInput
                      placeholder="Add new term & condition..."
                      value={newCondition}
                      onChange={e => setNewCondition(e.target.value)}
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
              <CRow className="mb-4">
                <CCol md={12}>
                  <CFormLabel>Additional Notes</CFormLabel>
                  <CFormTextarea
                    name="notes"
                    value={form.notes}
                    onChange={handleFormChange}
                    rows={3}
                    placeholder="Any additional instructions or notes..."
                  />
                </CCol>
              </CRow>

              {/* Submit Buttons */}
              <div className="d-flex justify-content-end gap-3 mt-5">
                <CButton color="primary" type="submit" disabled={saving}>
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