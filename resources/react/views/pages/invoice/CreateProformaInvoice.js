
// import React, { useState, useEffect } from 'react'
// import { useLocation, useNavigate } from 'react-router-dom'
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
//   CFormCheck,
//   CBadge,
// } from '@coreui/react'
// import CIcon from '@coreui/icons-react'
// import { cilArrowLeft, cilPencil, cilSave, cilX, cilPlus } from '@coreui/icons'
// import { post, getAPICall } from '../../../util/api'
// import { useToast } from '../../common/toast/ToastContext'

// const CreateProformaInvoice = () => {
//   const location = useLocation()
//   const navigate = useNavigate()
//   const { showToast } = useToast()
//   const { workOrderId, workOrderData } = location.state || {}

//   const [loading, setLoading] = useState(false)
//   const [validated, setValidated] = useState(false)
//   const [rules, setRules] = useState([])
//   const [selectedRules, setSelectedRules] = useState([])

//   const [previousProformas, setPreviousProformas] = useState([])

//   // Sub-description states (same as your Invoice component)
//   const [newSubDescs, setNewSubDescs] = useState([''])
//   const [editingSubDescWorkIdx, setEditingSubDescWorkIdx] = useState(-1)
//   const [editingSubDescIdx, setEditingSubDescIdx] = useState(-1)
//   const [editingSubDescValue, setEditingSubDescValue] = useState('')

//   const [form, setForm] = useState({
//     work_order_id: workOrderId || null,
//     project_id: workOrderData?.project_id || null,
//     tally_invoice_number: '',
//     invoice_date: new Date().toISOString().split('T')[0],
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
//     terms_conditions: '',
//     payment_terms: ''
//   })

//   const [works, setWorks] = useState([
//     {
//       work_type: '',
//       uom: '',
//       qty: 0,
//       price: 0,
//       total_price: 0,
//       remark: '',
//       sub_descriptions: [], // must be array
//       gst_percent: 18,
//       cgst_amount: 9,
//       sgst_amount: 9,
//     }
//   ])

//   // Payment Terms
//   const initialPaymentTerms = [
//     '25% Advance release on team mobilization onsite.',
//     '25% Release on completion of pile foundation.',
//     '20% Release after completion of MMS and Module mounting.',
//     '20% to be released on completion of AC/DC.',
//     '10% released after work has been completed and handed over to the client.'
//   ]
//   const [paymentTerms, setPaymentTerms] = useState(initialPaymentTerms)
//   const [editingPaymentIndex, setEditingPaymentIndex] = useState(-1)
//   const [editingPaymentValue, setEditingPaymentValue] = useState('')
//   const [newPaymentTerm, setNewPaymentTerm] = useState('')

//   // Terms & Conditions
//   const initialTermsAndConditions = [
//     '18% Tax Extra',
//     'ROW on your side',
//     'Work will commence only after receiving an official work order'
//   ]
//   const [termsAndConditions, setTermsAndConditions] = useState(initialTermsAndConditions)
//   const [editingConditionIndex, setEditingConditionIndex] = useState(-1)
//   const [editingConditionValue, setEditingConditionValue] = useState('')
//   const [newCondition, setNewCondition] = useState('')

//   // Note
//   const [note, setNote] = useState('')

//   // Load work order data
//   useEffect(() => {
//     if (workOrderData) {
//       // Calculate GST percentages...
//       let globalGstPercentage = 0
//       let globalSgstPercentage = 0
//       let globalCgstPercentage = 0
//       let globalIgstPercentage = 0

//       const totalAmount = parseFloat(workOrderData.totalAmount) || 0
//       const cgstAmount = parseFloat(workOrderData.cgst) || 0
//       const sgstAmount = parseFloat(workOrderData.sgst) || 0
//       const igstAmount = parseFloat(workOrderData.igst) || 0
//       const gstAmount = parseFloat(workOrderData.gst) || 0

//       if (totalAmount > 0) {
//         if (cgstAmount > 0) globalCgstPercentage = Math.round((cgstAmount / totalAmount) * 100 * 100) / 100
//         if (sgstAmount > 0) globalSgstPercentage = Math.round((sgstAmount / totalAmount) * 100 * 100) / 100
//         if (igstAmount > 0) globalIgstPercentage = Math.round((igstAmount / totalAmount) * 100 * 100) / 100
//         if (gstAmount > 0) globalGstPercentage = Math.round((gstAmount / totalAmount) * 100 * 100) / 100
//         else globalGstPercentage = globalCgstPercentage + globalSgstPercentage + globalIgstPercentage
//       }

//       setForm(prev => ({
//         ...prev,
//         work_order_id: workOrderData.id,
//         project_id: workOrderData.project_id,
//         gstPercentage: globalGstPercentage,
//         sgstPercentage: globalSgstPercentage,
//         cgstPercentage: globalCgstPercentage,
//         igstPercentage: globalIgstPercentage,
//       }))

//       if (workOrderData.items && workOrderData.items.length > 0) {
//         const loadedWorks = workOrderData.items.map(item => {
//           const qty = parseFloat(item.qty) || 0
//           const price = parseFloat(item.price) || 0
//           const totalPrice = parseFloat(item.total_price) || 0

//           let gstPercent = 0
//           if (item.gst_percent != null) {
//             gstPercent = parseFloat(item.gst_percent)
//           }

//           // Convert work_sub_description string → array
//           const subDescriptions = item.work_sub_description
//             ? item.work_sub_description.split('\n').map(line => line.trim()).filter(Boolean)
//             : []

//           return {
//             id: item.id,
//             work_type: item.work_type || '',
//             uom: item.uom || '',
//             qty,
//             price,
//             total_price: totalPrice,
//             remark: item.remark || '',
//             sub_descriptions: subDescriptions, // ← FIXED: always array
//             gst_percent: gstPercent,
//             cgst_amount: parseFloat(item.cgst_amount) || 0,
//             sgst_amount: parseFloat(item.sgst_amount) || 0,
//           }
//         }).sort((a, b) => (a.id || 0) - (b.id || 0))

//         setWorks(loadedWorks)
//         // Initialize newSubDescs array matching number of rows
//         setNewSubDescs(Array(loadedWorks.length).fill(''))
//         loadedWorks.forEach((_, i) => recalcRow(i, loadedWorks))
//         calculateTotals(loadedWorks)
//       }
//     }
//   }, [workOrderData])

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
//         const subtotal = works.reduce((sum, w) => sum + (w.total_price || 0), 0)
//         const base = subtotal - newForm.discount
//         const sgstAmount = base * (newForm.sgstPercentage / 100)
//         const cgstAmount = base * (newForm.cgstPercentage / 100)
//         const igstAmount = base * (newForm.igstPercentage / 100)
//         const gstAmount = sgstAmount + cgstAmount + igstAmount
//         const finalAmount = base + gstAmount

//         newForm = {
//           ...newForm,
//           subtotal,
//           taxableAmount: base,
//           gstAmount,
//           sgstAmount,
//           cgstAmount,
//           igstAmount,
//           finalAmount,
//         }
//       }

//       return newForm
//     })
//   }

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

//   const handleWorkChange = (index, field, value) => {
//     const updated = [...works]

//     if (field === 'qty') {
//       const max = updated[index].original_qty
//         ? updated[index].original_qty - updated[index].used_qty
//         : Infinity

//       updated[index].qty = Math.max(0, Math.min(Number(value) || 0, max))
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
//         sub_descriptions: [], // always array
//         gst_percent: 18,
//         cgst_amount: 9,
//         sgst_amount: 9,
//       }
//     ])
//     setNewSubDescs([...newSubDescs, ''])
//   }

//   const removeWorkRow = (index) => {
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

//   const calculateTotals = (rows = works) => {
//     const taxable = rows.reduce((s, w) => s + (w.qty || 0) * (w.price || 0), 0)
//     const cgst = rows.reduce((s, w) => s + (w.cgst_amount || 0), 0)
//     const sgst = rows.reduce((s, w) => s + (w.sgst_amount || 0), 0)

//     setForm(prev => ({
//       ...prev,
//       subtotal: +taxable.toFixed(2),
//       taxableAmount: +taxable.toFixed(2),
//       cgstAmount: +cgst.toFixed(2),
//       sgstAmount: +sgst.toFixed(2),
//       gstAmount: +(cgst + sgst).toFixed(2),
//       finalAmount: +(taxable + cgst + sgst - (prev.discount || 0)).toFixed(2)
//     }))
//   }

//   const fetchPreviousProformas = async () => {
//     try {
//       const resp = await getAPICall(`/api/proforma-invoices?work_order_id=${workOrderId}`)
//       setPreviousProformas(resp?.data?.data || [])
//     } catch (err) {
//       console.error('Failed to load previous proformas', err)
//       setPreviousProformas([])
//     }
//   }

//   useEffect(() => {
//     if (workOrderId) fetchPreviousProformas()
//   }, [workOrderId])

//   useEffect(() => {
//     if (!workOrderData?.items) return

//     const loadedWorks = workOrderData.items.map(original => {
//       const originalQty = parseFloat(original.qty) || 0
//       let used = 0

//       previousProformas.forEach(proforma => {
//         proforma.details?.forEach(detail => {
//           if (detail.work_type?.trim().toLowerCase() === original.work_type?.trim().toLowerCase()) {
//             used += parseFloat(detail.qty) || 0
//           }
//         })
//       })

//       const remaining = Math.max(0, originalQty - used)

//       // Convert string → array safely
//       const subDescriptions = original.work_sub_description
//         ? original.work_sub_description.split('\n').map(l => l.trim()).filter(Boolean)
//         : []

//       return {
//         id: original.id,
//         original_qty: originalQty,
//         used_qty: used,
//         work_type: original.work_type || "",
//         uom: original.uom || "",
//         qty: remaining,
//         price: parseFloat(original.price) || 0,
//         total_price: parseFloat(original.total_price) || 0,
//         remark: original.remark || "",
//         sub_descriptions: subDescriptions, // always array
//         gst_percent: parseFloat(original.gst_percent) || 18,
//         cgst_amount: parseFloat(original.cgst_amount) || 0,
//         sgst_amount: parseFloat(original.sgst_amount) || 0,
//       }
//     })

//     setWorks(loadedWorks)
//     setNewSubDescs(Array(loadedWorks.length).fill(''))
//     loadedWorks.forEach((_, i) => recalcRow(i, loadedWorks))
//     calculateTotals(loadedWorks)
//   }, [workOrderData, previousProformas])

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     const formElement = e.currentTarget

//     if (!formElement.checkValidity()) {
//       setValidated(true)
//       return
//     }

//     if (!form.work_order_id || !form.project_id) {
//       showToast('danger', 'Work order and project information missing')
//       return
//     }

//     if (works.length === 0 || works.every(w => !w.work_type || w.qty <= 0)) {
//       showToast('danger', 'Please add at least one valid work item')
//       return
//     }

//     try {
//       setLoading(true)

//       const itemsWithGST = works
//         .filter(w => w.work_type && w.qty > 0)
//         .map(item => ({
//           work_type: item.work_type,
//           uom: item.uom || null,
//           qty: parseFloat(item.qty) || 0,
//           price: parseFloat(item.price) || 0,
//           total_price: parseFloat(item.total_price) || 0,
//           remark: item.remark || null,
//           work_sub_description: item.sub_descriptions?.join('\n') || null, // join array to string
//           gst_percent: item.gst_percent !== null && item.gst_percent !== undefined
//             ? parseFloat(item.gst_percent)
//             : 0,
//           cgst_amount: parseFloat(item.cgst_amount) || 0,
//           sgst_amount: parseFloat(item.sgst_amount) || 0,
//         }))

//       const data = {
//         work_order_id: form.work_order_id,
//         project_id: form.project_id,
//         tally_invoice_number: form.tally_invoice_number || null,
//         invoice_date: form.invoice_date,
//         delivery_date: form.delivery_date || null,
//         items: itemsWithGST,
//         discount: form.discount,
//         gst_percentage: form.gstPercentage,
//         cgst_percentage: form.cgstPercentage,
//         sgst_percentage: form.sgstPercentage,
//         igst_percentage: form.igstPercentage,
//         rule_ids: selectedRules,
//         notes: form.notes || null,
//         payment_terms: paymentTerms.join('\n'),
//         terms_conditions: termsAndConditions.join('\n'),
//       }

//       const resp = await post('/api/proforma-invoices', data)

//       if (resp && resp.success) {
//         showToast('success', 'Proforma invoice created successfully')
//         setTimeout(() => {
//           navigate(`/proforma-invoice-details/${resp.data.id}`)
//         }, 1500)
//       } else {
//         showToast('danger', resp.message || 'Failed to create proforma invoice', 8000)
//       }
//     } catch (error) {
//       console.error('Submit error:', error)
//       showToast('danger', error.message || 'Failed to create proforma invoice', 8000)
//     } finally {
//       setLoading(false)
//     }
//   }

//   if (!workOrderId || !workOrderData) {
//     return (
//       <CCard>
//         <CCardBody>
//           <CAlert color="warning">
//             <h5>No Work Order Selected</h5>
//             <p>Please select a work order to create a proforma invoice.</p>
//             <CButton color="primary" onClick={() => navigate('/invoiceTable')}>
//               Go to Orders
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
//               <strong>Create Proforma Invoice</strong>
//               <CButton
//                 color="secondary"
//                 size="sm"
//                 onClick={() => navigate('/invoiceTable')}
//               >
//                 <CIcon icon={cilArrowLeft} className="me-1" />
//                 Back to Orders
//               </CButton>
//             </div>
//           </CCardHeader>
//           <CCardBody>
//             {/* Work Order Info */}
//             <div className="bg-light p-3 rounded mb-4">
//               <h6 className="mb-2">Work Order Information</h6>
//               <CRow>
//                 <CCol md={3}>
//                   <small className="text-muted">Work Order :</small>
//                   <div><strong>{workOrderData.invoice_number}</strong></div>
//                 </CCol>
//                 <CCol md={3}>
//                   <small className="text-muted">Project:</small>
//                   <div><strong>{workOrderData.project?.project_name}</strong></div>
//                   <div className="small text-muted">Type: {workOrderData.project?.project_type?.name}</div>
//                 </CCol>
//                 <CCol md={3}>
//                   <small className="text-muted">Customer:</small>
//                   <div><strong>{workOrderData.project?.customer_name}</strong></div>
//                 </CCol>
//                 <CCol md={3}>
//                   <small className="text-muted">Location:</small>
//                   <div>{workOrderData.project?.work_place}</div>
//                 </CCol>
//               </CRow>
//             </div>

//             <CForm validated={validated} onSubmit={handleSubmit}>
//               {/* Invoice Details */}
//               <CRow className="mb-3">
//                 <CCol md={4}>
//                   <CFormLabel>Tally Invoice Number</CFormLabel>
//                   <CFormInput
//                     type="text"
//                     name="tally_invoice_number"
//                     value={form.tally_invoice_number}
//                     onChange={handleFormChange}
//                     placeholder="Optional - Enter Tally invoice "
//                   />
//                 </CCol>
//                 <CCol md={4}>
//                   <CFormLabel>Invoice Date *</CFormLabel>
//                   <CFormInput
//                     type="date"
//                     name="invoice_date"
//                     value={form.invoice_date}
//                     onChange={handleFormChange}
//                     required
//                   />
//                 </CCol>
//                 <CCol md={4}>
//                   <CFormLabel>Delivery Date</CFormLabel>
//                   <CFormInput
//                     type="date"
//                     name="delivery_date"
//                     value={form.delivery_date}
//                     onChange={handleFormChange}
//                   />
//                 </CCol>
//               </CRow>

//               <h6 className="mt-4 mb-3 fw-semibold text-primary border-bottom border-primary pb-2">
//                 Work Details
//               </h6>

//               {works.map((w, idx) => (
//                 <div key={idx} className="border rounded p-3 mb-3 bg-light position-relative">
//                   {/* Remove button */}
                 

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



//                       {/* Add new */}
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









//                       {/* Existing sub-descriptions as tags */}
//                       <div className="d-flex flex-wrap gap-2 mb-2">
//                         {(w.sub_descriptions || []).map((desc, subIdx) => {  // ← safe guard with || []
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
//                               className="badge  bg-light text-dark border border-secondary-subtle px-3 py-2 d-flex align-items-center gap-2 "
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


//                   {/* Rest of the row (UOM, Qty, Rate, etc.) */}
//                   <CRow className="g-3 mb-3 align-items-end">




// <CCol md={3}>
//          <CFormInput
//           label="UOM"
//           placeholder="Unit"
//           value={w.uom}
//           onChange={(e) => handleWorkChange(idx, 'uom', e.target.value)}
//         />
//       </CCol>



//                     <CCol md={3}>
//                       <CFormLabel>
//                         Qty *
//                         {w.original_qty > 0 && w.used_qty > 0 && (
//                           <small className="text-danger d-block mt-1">
//                             Billed: {w.used_qty.toFixed(2)} of {w.original_qty.toFixed(2)}
//                           </small>
//                         )}
//                       </CFormLabel>
//                       <CFormInput
//                         type="number"
//                         step="0.01"
//                         min="0"
//                         value={w.qty}
//                         onChange={(e) => {
//                           let val = parseFloat(e.target.value) || 0
//                           if (w.original_qty) {
//                             const max = w.original_qty - w.used_qty
//                             val = Math.min(val, max)
//                             val = Math.max(0, val)
//                           }
//                           handleWorkChange(idx, 'qty', val)
//                         }}
//                         required
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


// </CRow>


// <CRow className="g-3 mb-3 align-items-end">


//                     <CCol md={3}>
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
// </CRow>

// <CRow className="g-3 mb-3 align-items-end">

//                     <CCol md={9}>
//                       <CFormLabel>Remark</CFormLabel>
//                       <CFormInput
//                         placeholder="Remark"
//                         value={w.remark}
//                         onChange={(e) => handleWorkChange(idx, 'remark', e.target.value)}
//                       />
//                     </CCol>
                 


//  <CCol md={3}>
//  {works.length > 1 && (
//                     <CButton
//                       color="danger"
//                       size="sm"
//                       className="mt-2 ps-40 pe-40"
//                       onClick={() => removeWorkRow(idx)}
//                     >
//                       {/* <CIcon icon={cilX} /> */}
//                       ✖ Remove This Work Order
//                     </CButton>
//                   )}
// </CCol>

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

             




//    <h6 className="mt-4 mb-3 fw-semibold text-primary border-bottom border-primary pb-2">
//   Calculations 
//  </h6>

//                     {/* Financial Summary */}
//                <CRow className="mb-3">
//                  <CCol md={3}>
//                    <CFormLabel>Total Amount before GST</CFormLabel>
//                    <CInputGroup>
//                      <CInputGroupText>₹</CInputGroupText>
//                      <CFormInput
//                       type="number"
//                       value={form.subtotal.toFixed(2)}
//                       readOnly
//                     />
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
//                     />
//                   </CInputGroup>
//                 </CCol>
//                 {/* <CCol md={3}>
//                   <CFormLabel>Taxable Amount</CFormLabel>
//                   <CInputGroup>
//                     <CInputGroupText>₹</CInputGroupText>
//                     <CFormInput
//                       type="number"
//                       value={form.taxableAmount.toFixed(2)}
//                       readOnly
//                     />
//                   </CInputGroup>
//                 </CCol> */}
//                 <CCol md={3}>
//                   <CFormLabel>Total Amount after GST</CFormLabel>
//                   <CInputGroup>
//                     <CInputGroupText>₹</CInputGroupText>
//                     <CFormInput
//                       type="number"
//                       value={form.finalAmount.toFixed(2)}
//                       readOnly
//                       className="fw-bold"
//                     />
//                   </CInputGroup>
//                 </CCol>
//               </CRow>

        


// {/* PAYMENT TERMS */}
// <h6 className="mt-4 mb-3 fw-semibold text-primary border-bottom border-primary pb-2">
//   Payment Terms
// </h6>
// <div className="d-flex flex-wrap gap-2 mb-3">
//   {paymentTerms.map((term, idx) => {
//     if (editingPaymentIndex === idx) {
//       return (
//         <CInputGroup key={idx} style={{ width: 'auto' }}>
//           <CFormInput
//             value={editingPaymentValue}
//             onChange={(e) => setEditingPaymentValue(e.target.value)}
//           />
//           <CButton
//             color="success"
//             onClick={() => {
//               const newTerms = [...paymentTerms]
//               newTerms[idx] = editingPaymentValue
//               setPaymentTerms(newTerms)
//               setEditingPaymentIndex(-1)
//             }}
//           >
//             Save
//           </CButton>
//           <CButton color="secondary" onClick={() => setEditingPaymentIndex(-1)}>
//             Cancel
//           </CButton>
//         </CInputGroup>
//       )
//     } else {
//       return (
//         <CBadge
//           color="info"
//           key={idx}
//           className="me-1 mb-1"
//           style={{ fontSize: '0.9em' }}
//         >
//           {term}
//           <CIcon
//             icon={cilPencil}
//             className="ms-2"
//             style={{ cursor: 'pointer' }}
//             onClick={() => {
//               setEditingPaymentIndex(idx)
//               setEditingPaymentValue(term)
//             }}
//           />
//           <CIcon
//             icon={cilX}
//             className="ms-1"
//             style={{ cursor: 'pointer' }}
//             onClick={() => {
//               setPaymentTerms(paymentTerms.filter((_, i) => i !== idx))
//             }}
//           />
//         </CBadge>
//       )
//     }
//   })}
// </div>
// <CRow className="mb-3">
//   <CCol md={6}>
//     <CInputGroup>
//       <CFormInput
//         placeholder="Add new payment term..."
//         value={newPaymentTerm}
//         onChange={(e) => setNewPaymentTerm(e.target.value)}
//       />
//       <CButton
//         color="primary"
//         onClick={() => {
//           if (newPaymentTerm.trim()) {
//             setPaymentTerms([...paymentTerms, newPaymentTerm.trim()])
//             setNewPaymentTerm('')
//           }
//         }}
//       >
//         Add
//       </CButton>
//     </CInputGroup>
//   </CCol>
// </CRow>

// {/* TERMS & CONDITIONS */}
// <h6 className="mt-4 mb-3 fw-semibold text-primary border-bottom border-primary pb-2">
//   Terms & Conditions
// </h6>
// <div className="d-flex flex-wrap gap-2 mb-3">
//   {termsAndConditions.map((term, idx) => {
//     if (editingConditionIndex === idx) {
//       return (
//         <CInputGroup key={idx} style={{ width: 'auto' }}>
//           <CFormInput
//             value={editingConditionValue}
//             onChange={(e) => setEditingConditionValue(e.target.value)}
//           />
//           <CButton
//             color="success"
//             onClick={() => {
//               const newConditions = [...termsAndConditions]
//               newConditions[idx] = editingConditionValue
//               setTermsAndConditions(newConditions)
//               setEditingConditionIndex(-1)
//             }}
//           >
//             Save
//           </CButton>
//           <CButton
//             color="secondary"
//             onClick={() => setEditingConditionIndex(-1)}
//           >
//             Cancel
//           </CButton>
//         </CInputGroup>
//       )
//     } else {
//       return (
//         <CBadge
//           color="warning"
//           key={idx}
//           className="me-1 mb-1"
//           style={{ fontSize: '0.9em' }}
//         >
//           {term}
//           <CIcon
//             icon={cilPencil}
//             className="ms-2"
//             style={{ cursor: 'pointer' }}
//             onClick={() => {
//               setEditingConditionIndex(idx)
//               setEditingConditionValue(term)
//             }}
//           />
//           <CIcon
//             icon={cilX}
//             className="ms-1"
//             style={{ cursor: 'pointer' }}
//             onClick={() => {
//               setTermsAndConditions(termsAndConditions.filter((_, i) => i !== idx))
//             }}
//           />
//         </CBadge>
//       )
//     }
//   })}
// </div>
// <CRow className="mb-3">
//   <CCol md={6}>
//     <CInputGroup>
//       <CFormInput
//         placeholder="Add new condition..."
//         value={newCondition}
//         onChange={(e) => setNewCondition(e.target.value)}
//       />
//       <CButton
//         color="primary"
//         onClick={() => {
//           if (newCondition.trim()) {
//             setTermsAndConditions([...termsAndConditions, newCondition.trim()])
//             setNewCondition('')
//           }
//         }}
//       >
//         Add
//       </CButton>
//     </CInputGroup>
//   </CCol>
// </CRow>



//               {/* Notes */}
//               <CRow className="mb-3">
//                 <CCol md={12}>
//                   <CFormLabel>Additional Notes</CFormLabel>
//                   <CFormTextarea
//                     name="notes"
//                     value={form.notes}
//                     onChange={handleFormChange}
//                     rows={3}
//                     placeholder="Enter any additional notes or instructions..."
//                   />
//                 </CCol>
//               </CRow>

//               <CButton
//                 color="primary"
//                 type="submit"
//                 disabled={loading}
//               >
//                 {loading ? <CSpinner size="sm" /> : <CIcon icon={cilSave} className="me-1" />}
//                 Create Proforma Invoice
//               </CButton>
//             </CForm>
//           </CCardBody>
//         </CCard>
//       </CCol>
//     </CRow>
//   )
// }

// export default CreateProformaInvoice






























// import React, { useState, useEffect } from 'react'
// import { useLocation, useNavigate } from 'react-router-dom'
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
//   CBadge,
//   CFormSelect,
// } from '@coreui/react'
// import CIcon from '@coreui/icons-react'
// import { cilArrowLeft, cilPencil, cilSave, cilX, cilPlus } from '@coreui/icons'
// import { post, getAPICall } from '../../../util/api'
// import { useToast } from '../../common/toast/ToastContext'
// // Import constants used in RecordPaymentModal
// import { paymentTypes, receiver_bank } from '../../../util/Feilds'

// const CreateProformaInvoice = () => {
//   const location = useLocation()
//   const navigate = useNavigate()
//   const { showToast } = useToast()
//   const { workOrderId, workOrderData } = location.state || {}

//   const [loading, setLoading] = useState(false)
//   const [validated, setValidated] = useState(false)
//   const [previousProformas, setPreviousProformas] = useState([])

//   // Sub-description states
//   const [newSubDescs, setNewSubDescs] = useState([''])
//   const [editingSubDescWorkIdx, setEditingSubDescWorkIdx] = useState(-1)
//   const [editingSubDescIdx, setEditingSubDescIdx] = useState(-1)
//   const [editingSubDescValue, setEditingSubDescValue] = useState('')

//   const [form, setForm] = useState({
//     work_order_id: workOrderId || null,
//     project_id: workOrderData?.project_id || null,
//     tally_invoice_number: '',
//     invoice_date: new Date().toISOString().split('T')[0],
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
//     terms_conditions: '',
//     payment_terms: ''
//   })

//   const [works, setWorks] = useState([
//     {
//       work_type: '',
//       uom: '',
//       qty: 0,
//       price: 0,
//       total_price: 0,
//       remark: '',
//       sub_descriptions: [],
//       gst_percent: '',
//       cgst_amount: '',
//       sgst_amount: '',
//     }
//   ])

//   // Payment Terms
//   const initialPaymentTerms = [
//     '25% Advance release on team mobilization onsite.',
//     '25% Release on completion of pile foundation.',
//     '20% Release after completion of MMS and Module mounting.',
//     '20% to be released on completion of AC/DC.',
//     '10% released after work has been completed and handed over to the client.'
//   ]
//   const [paymentTerms, setPaymentTerms] = useState(initialPaymentTerms)
//   const [editingPaymentIndex, setEditingPaymentIndex] = useState(-1)
//   const [editingPaymentValue, setEditingPaymentValue] = useState('')
//   const [newPaymentTerm, setNewPaymentTerm] = useState('')

//   // Terms & Conditions
//   const initialTermsAndConditions = [
//     '18% Tax Extra',
//     'ROW on your side',
//     'Work will commence only after receiving an official work order'
//   ]
//   const [termsAndConditions, setTermsAndConditions] = useState(initialTermsAndConditions)
//   const [editingConditionIndex, setEditingConditionIndex] = useState(-1)
//   const [editingConditionValue, setEditingConditionValue] = useState('')
//   const [newCondition, setNewCondition] = useState('')

//   // Advance Payment form – same fields as RecordPaymentModal
//   // const [advanceForm, setAdvanceForm] = useState({
//   //   received_amount: '',
//   //   received_by: '',
//   //   payment_type: 'cash',
//   //   senders_bank: '',
//   //   receivers_bank: '',
//   //   remark: '',
//   //   payment_date: new Date().toISOString().split('T')[0],
//   // })


//   const [advancePayments, setAdvancePayments] = useState([]);           // ← array of payments
//   const [currentAdvance, setCurrentAdvance] = useState({
//     received_amount: '',
//     received_by: '',
//     payment_type: 'cash',
//     senders_bank: '',
//     receivers_bank: '',
//     remark: '',
//     payment_date: new Date().toISOString().split('T')[0],
//   });
//   const [editingAdvanceIndex, setEditingAdvanceIndex] = useState(-1);





//   const handleCurrentAdvanceChange = (e) => {
//     const { name, value } = e.target;
//     setCurrentAdvance((prev) => ({ ...prev, [name]: value }));
//   };

//   const addOrUpdateAdvancePayment = () => {
//     const amount = parseFloat(currentAdvance.received_amount || 0);
//     if (amount <= 0) {
//       showToast('warning', 'Please enter a valid payment amount > 0');
//       return;
//     }

//     // Basic validation
//     if (!currentAdvance.payment_date) {
//       showToast('warning', 'Payment date is required');
//       return;
//     }

//     const newPayment = { ...currentAdvance, received_amount: amount };

//     if (editingAdvanceIndex === -1) {
//       // Add new
//       setAdvancePayments((prev) => [...prev, newPayment]);
//     } else {
//       // Update existing
//       const updated = [...advancePayments];
//       updated[editingAdvanceIndex] = newPayment;
//       setAdvancePayments(updated);
//     }

//     // Reset form
//     setCurrentAdvance({
//       received_amount: '',
//       received_by: '',
//       payment_type: 'cash',
//       senders_bank: '',
//       receivers_bank: '',
//       remark: '',
//       payment_date: new Date().toISOString().split('T')[0],
//     });
//     setEditingAdvanceIndex(-1);
//   };

//   const editAdvancePayment = (index) => {
//     setCurrentAdvance(advancePayments[index]);
//     setEditingAdvanceIndex(index);
//   };

//   const removeAdvancePayment = (index) => {
//     setAdvancePayments((prev) => prev.filter((_, i) => i !== index));
//     if (editingAdvanceIndex === index) {
//       setEditingAdvanceIndex(-1);
//       setCurrentAdvance({
//         received_amount: '',
//         received_by: '',
//         payment_type: 'cash',
//         senders_bank: '',
//         receivers_bank: '',
//         remark: '',
//         payment_date: new Date().toISOString().split('T')[0],
//       });
//     }
//   };

//   const cancelAdvanceEdit = () => {
//     setEditingAdvanceIndex(-1);
//     setCurrentAdvance({
//       received_amount: '',
//       received_by: '',
//       payment_type: 'cash',
//       senders_bank: '',
//       receivers_bank: '',
//       remark: '',
//       payment_date: new Date().toISOString().split('T')[0],
//     });
//   };




//   // ──────────────────────────────────────────────────────────────
//   // Load work order + previous proformas
//   // ──────────────────────────────────────────────────────────────

//   useEffect(() => {
//     if (workOrderId) {
//       const fetchPrevious = async () => {
//         try {
//           const resp = await getAPICall(`/api/proforma-invoices?work_order_id=${workOrderId}`)
//           setPreviousProformas(resp?.data?.data || [])
//         } catch (err) {
//           console.error('Failed to load previous proformas', err)
//         }
//       }
//       fetchPrevious()
//     }
//   }, [workOrderId])

//   useEffect(() => {
//     if (workOrderData) {
//       let globalGstPercentage = 0
//       let globalSgstPercentage = 0
//       let globalCgstPercentage = 0
//       let globalIgstPercentage = 0

//       const totalAmount = parseFloat(workOrderData.totalAmount) || 0
//       const cgstAmount = parseFloat(workOrderData.cgst) || 0
//       const sgstAmount = parseFloat(workOrderData.sgst) || 0
//       const igstAmount = parseFloat(workOrderData.igst) || 0
//       const gstAmount = parseFloat(workOrderData.gst) || 0

//       if (totalAmount > 0) {
//         if (cgstAmount > 0) globalCgstPercentage = Math.round((cgstAmount / totalAmount) * 100 * 100) / 100
//         if (sgstAmount > 0) globalSgstPercentage = Math.round((sgstAmount / totalAmount) * 100 * 100) / 100
//         if (igstAmount > 0) globalIgstPercentage = Math.round((igstAmount / totalAmount) * 100 * 100) / 100
//         if (gstAmount > 0) globalGstPercentage = Math.round((gstAmount / totalAmount) * 100 * 100) / 100
//         else globalGstPercentage = globalCgstPercentage + globalSgstPercentage + globalIgstPercentage
//       }

//       setForm(prev => ({
//         ...prev,
//         work_order_id: workOrderData.id,
//         project_id: workOrderData.project_id,
//         gstPercentage: globalGstPercentage,
//         sgstPercentage: globalSgstPercentage,
//         cgstPercentage: globalCgstPercentage,
//         igstPercentage: globalIgstPercentage,
//       }))

//       if (workOrderData.items && workOrderData.items.length > 0) {
//         const loadedWorks = workOrderData.items.map(original => {
//           const originalQty = parseFloat(original.qty) || 0
//           let used = 0

//           previousProformas.forEach(proforma => {
//             proforma.details?.forEach(detail => {
//               if (detail.work_type?.trim().toLowerCase() === original.work_type?.trim().toLowerCase()) {
//                 used += parseFloat(detail.qty) || 0
//               }
//             })
//           })

//           const remaining = Math.max(0, originalQty - used)

//           const subDescriptions = original.work_sub_description
//             ? original.work_sub_description.split('\n').map(l => l.trim()).filter(Boolean)
//             : []

//           return {
//             id: original.id,
//             original_qty: originalQty,
//             used_qty: used,
//             work_type: original.work_type || "",
//             uom: original.uom || "",
//             qty: remaining,
//             price: parseFloat(original.price) || 0,
//             total_price: parseFloat(original.total_price) || 0,
//             remark: original.remark || "",
//             sub_descriptions: subDescriptions,
//             gst_percent: parseFloat(original.gst_percent) || 0,
//             cgst_amount: parseFloat(original.cgst_amount) || 0,
//             sgst_amount: parseFloat(original.sgst_amount) || 0,
//           }
//         }).sort((a, b) => (a.id || 0) - (b.id || 0))

//         setWorks(loadedWorks)
//         setNewSubDescs(Array(loadedWorks.length).fill(''))
//         loadedWorks.forEach((_, i) => recalcRow(i, loadedWorks))
//         calculateTotals(loadedWorks)
//       }
//     }
//   }, [workOrderData, previousProformas])

//   // ──────────────────────────────────────────────────────────────
//   // Handlers
//   // ──────────────────────────────────────────────────────────────

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
//         const subtotal = works.reduce((sum, w) => sum + (w.total_price || 0), 0)
//         const base = subtotal - newForm.discount
//         const sgstAmount = base * (newForm.sgstPercentage / 100)
//         const cgstAmount = base * (newForm.cgstPercentage / 100)
//         const igstAmount = base * (newForm.igstPercentage / 100)
//         const gstAmount = sgstAmount + cgstAmount + igstAmount
//         const finalAmount = base + gstAmount

//         newForm = {
//           ...newForm,
//           subtotal,
//           taxableAmount: base,
//           gstAmount,
//           sgstAmount,
//           cgstAmount,
//           igstAmount,
//           finalAmount,
//         }
//       }

//       return newForm
//     })
//   }

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

//   const handleWorkChange = (index, field, value) => {
//     const updated = [...works]

//     if (field === 'qty') {
//       let val = parseFloat(value) || 0
//       const max = updated[index].original_qty
//         ? updated[index].original_qty - updated[index].used_qty
//         : Infinity

//       // Limit qty to remaining quantity
//       val = Math.max(0, Math.min(val, max))
//       updated[index].qty = val
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
//       }
//     ])
//     setNewSubDescs([...newSubDescs, ''])
//   }

//   const removeWorkRow = (index) => {
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

//   const calculateTotals = (rows = works) => {
//     const taxable = rows.reduce((s, w) => s + (w.qty || 0) * (w.price || 0), 0)
//     const cgst = rows.reduce((s, w) => s + (w.cgst_amount || 0), 0)
//     const sgst = rows.reduce((s, w) => s + (w.sgst_amount || 0), 0)

//     setForm(prev => ({
//       ...prev,
//       subtotal: +taxable.toFixed(2),
//       taxableAmount: +taxable.toFixed(2),
//       cgstAmount: +cgst.toFixed(2),
//       sgstAmount: +sgst.toFixed(2),
//       gstAmount: +(cgst + sgst).toFixed(2),
//       finalAmount: +(taxable + cgst + sgst - (prev.discount || 0)).toFixed(2)
//     }))
//   }

//   const handleAdvanceChange = (e) => {
//     const { name, value } = e.target
//     setAdvanceForm(prev => ({ ...prev, [name]: value }))


//   }



















 







// // const handleSubmit = async (e) => {
// //   e.preventDefault();

// //   if (!e.currentTarget.checkValidity()) {
// //     setValidated(true);
// //     return;
// //   }

// //   if (!form.work_order_id || !form.project_id) {
// //     showToast('danger', 'Work order and project information missing');
// //     return;
// //   }

// //   if (works.length === 0 || works.every((w) => !w.work_type || w.qty <= 0)) {
// //     showToast('danger', 'Please add at least one valid work item');
// //     return;
// //   }

// //   // ─── NEW: Early check for invalid advance amount ────────────────────────
// //   const advanceAmt = parseFloat(advanceForm.received_amount || 0);
// //   const finalAmt = parseFloat(form.finalAmount || 0);

// //   if (advanceAmt > 0 && advanceAmt > finalAmt) {
// //     showToast(
// //       'danger',
// //       `Advance amount (₹${advanceAmt.toFixed(2)}) cannot be greater than total invoice amount (₹${finalAmt.toFixed(2)})`
// //     );
// //     return; // ← stop submission completely — don't even create proforma
// //   }

// //   try {
// //     setLoading(true);

// //     const itemsWithGST = works
// //       .filter((w) => w.work_type && w.qty > 0)
// //       .map((item) => ({
// //         work_type: item.work_type,
// //         uom: item.uom || null,
// //         qty: parseFloat(item.qty) || 0,
// //         price: parseFloat(item.price) || 0,
// //         total_price: parseFloat(item.total_price) || 0,
// //         remark: item.remark || null,
// //         work_sub_description: item.sub_descriptions?.join('\n') || null,
// //         gst_percent: item.gst_percent ?? 0,
// //         cgst_amount: parseFloat(item.cgst_amount) || 0,
// //         sgst_amount: parseFloat(item.sgst_amount) || 0,
// //       }));

// //     const data = {
// //       work_order_id: form.work_order_id,
// //       project_id: form.project_id,
// //       tally_invoice_number: form.tally_invoice_number || null,
// //       invoice_date: form.invoice_date,
// //       delivery_date: form.delivery_date || null,
// //       items: itemsWithGST,
// //       discount: form.discount,
// //       gst_percentage: form.gstPercentage,
// //       cgst_percentage: form.cgstPercentage,
// //       sgst_percentage: form.sgstPercentage,
// //       igst_percentage: form.igstPercentage,
// //       notes: form.notes || null,
// //       payment_terms: paymentTerms.join('\n'),
// //       terms_conditions: termsAndConditions.join('\n'),
// //       // Optional advance fields (backend can ignore if null/empty)
// //       received_amount: advanceAmt > 0 ? advanceAmt : null,
// //       payment_date: advanceForm.payment_date || null,
// //       received_from: advanceForm.received_by || null,
// //       payment_type: advanceForm.payment_type || null,
// //       senders_bank: advanceForm.senders_bank || null,
// //       receivers_bank: advanceForm.receivers_bank || null,
// //       remark: advanceForm.remark || null,
// //     };

// //     const createResp = await post('/api/proforma-invoices', data);

// //     if (!createResp?.success) {
// //       showToast('danger', createResp.message || 'Failed to create proforma invoice', 8000);
// //       return;
// //     }

// //     const proformaId = createResp.data.id;

// //     // ─── Only attempt to record payment if advance was actually entered ─────
// //     let paymentRecorded = false;

// //     if (advanceAmt > 0) {
// //       // We already checked advanceAmt <= finalAmt above → safe to proceed
// //       paymentRecorded = await recordAdvancePayment(proformaId);

// //       if (!paymentRecorded) {
// //         // Optional: you can decide whether to continue or show warning
// //         showToast(
// //           'warning',
// //           'Proforma created successfully, but advance payment recording failed. Please record it manually from details page.'
// //         );
// //       }
// //     }

// //     showToast('success', 'Proforma invoice created successfully');

// //     setTimeout(() => {
// //       navigate(`/proforma-invoice-details/${proformaId}`);
// //     }, 1500);
// //   } catch (error) {
// //     console.error('Submit error:', error);
// //     showToast('danger', error.message || 'Failed to create proforma invoice', 8000);
// //   } finally {
// //     setLoading(false);
// //   }
// // };




// // const recordAdvancePayment = async (proformaId, payment) => {
// //   try {
// //     const paymentData = {
// //       received_amount: Number(payment.received_amount),
// //       received_by:     payment.received_by?.trim() || null,
// //       payment_type:    payment.payment_type || null,
// //       senders_bank:    payment.senders_bank?.trim() || null,
// //       receivers_bank:  payment.receivers_bank || null,
// //       remark:          payment.remark?.trim() || null,
// //       payment_date:    payment.payment_date || null,
// //     };

// //     const resp = await post(`/api/proforma-invoices/${proformaId}/record-payment`, paymentData);

// //     if (!resp?.success) {
// //       showToast('danger', resp.message || `Failed to record payment of ₹${payment.received_amount}`, 8000);
// //       return false;
// //     }

// //     showToast('success', `Recorded advance of ₹${payment.received_amount}`, 4000);
// //     return true;
// //   } catch (err) {
// //     console.error('Payment record error:', err);
// //     showToast('danger', `Error recording payment of ₹${payment.received_amount}`, 8000);
// //     return false;
// //   }
// // };















// const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!e.currentTarget.checkValidity()) {
//       setValidated(true);
//       return;
//     }

//     if (!form.work_order_id || !form.project_id) {
//       showToast('danger', 'Work order and project information missing');
//       return;
//     }

//     if (works.length === 0 || works.every((w) => !w.work_type || w.qty <= 0)) {
//       showToast('danger', 'Please add at least one valid work item');
//       return;
//     }

//     // Check total advance doesn't exceed final amount
//     const totalAdvance = advancePayments.reduce(
//       (sum, p) => sum + parseFloat(p.received_amount || 0),
//       0
//     );
//     const finalAmt = parseFloat(form.finalAmount || 0);

//     if (totalAdvance > finalAmt) {
//       showToast(
//         'danger',
//         `Total advance (₹${totalAdvance.toFixed(2)}) cannot exceed invoice amount (₹${finalAmt.toFixed(2)})`
//       );
//       return;
//     }

//     try {
//       setLoading(true);

//       const itemsWithGST = works
//         .filter((w) => w.work_type && w.qty > 0)
//         .map((item) => ({
//           work_type: item.work_type,
//           uom: item.uom || null,
//           qty: parseFloat(item.qty) || 0,
//           price: parseFloat(item.price) || 0,
//           total_price: parseFloat(item.total_price) || 0,
//           remark: item.remark || null,
//           work_sub_description: item.sub_descriptions?.join('\n') || null,
//           gst_percent: item.gst_percent ?? 0,
//           cgst_amount: parseFloat(item.cgst_amount) || 0,
//           sgst_amount: parseFloat(item.sgst_amount) || 0,
//         }));

//       const data = {
//         work_order_id: form.work_order_id,
//         project_id: form.project_id,
//         tally_invoice_number: form.tally_invoice_number || null,
//         invoice_date: form.invoice_date,
//         delivery_date: form.delivery_date || null,
//         items: itemsWithGST,
//         discount: form.discount,
//         gst_percentage: form.gstPercentage,
//         cgst_percentage: form.cgstPercentage,
//         sgst_percentage: form.sgstPercentage,
//         igst_percentage: form.igstPercentage,
//         notes: form.notes || null,
//         payment_terms: paymentTerms.join('\n'),
//         terms_conditions: termsAndConditions.join('\n'),

//         // ─── The important change ───────────────────────────────
//         advance_payments: advancePayments.map((p) => ({
//           received_amount: p.received_amount,
//           payment_date: p.payment_date,
//           received_from: p.received_by || null,
//           payment_type: p.payment_type || null,
//           senders_bank: p.senders_bank || null,
//           receivers_bank: p.receivers_bank || null,
//           remark: p.remark || null,
//         })),
//       };

//       const createResp = await post('/api/proforma-invoices', data);

//       if (!createResp?.success) {
//         showToast('danger', createResp.message || 'Failed to create proforma invoice', 8000);
//         return;
//       }

//       const proformaId = createResp.data.id;

//       // showToast('success', 'Proforma invoice created successfully');


// // const proformaId = createResp.data.id;

//     // Now record each advance payment separately
//     // let successCount = 0;
//     // let failCount = 0;

//     // for (const payment of advancePayments) {
//     //   const ok = await recordAdvancePayment(proformaId, payment);
//     //   if (ok) successCount++;
//     //   else    failCount++;
//     // }

//     // // Final feedback
//     // if (advancePayments.length === 0) {
//     //   showToast('success', 'Proforma invoice created successfully');
//     // } else if (failCount === 0) {
//     //   showToast('success', `Proforma created + ${successCount} advance payment(s) recorded`);
//     // } else {
//     //   showToast(
//     //     'warning',
//     //     `Proforma created, but ${failCount} of ${advancePayments.length} payments failed. Check details page.`
//     //   );
//     // }

   


//       setTimeout(() => {
//         navigate(`/proforma-invoice-details/${proformaId}`);
//       }, 1500);



//     } catch (error) {
//       console.error('Submit error:', error);
//       showToast('danger', error.message || 'Failed to create proforma invoice', 8000);
//     } finally {
//       setLoading(false);
//     }
//   };


















//   if (!workOrderId || !workOrderData) {
//     return (
//       <CCard>
//         <CCardBody>
//           <CAlert color="warning">
//             <h5>No Work Order Selected</h5>
//             <p>Please select a work order to create a proforma invoice.</p>
//             <CButton color="primary" onClick={() => navigate('/invoiceTable')}>
//               Go to Orders
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
//               <strong>Create Proforma Invoice</strong>
//               <CButton
//                 color="secondary"
//                 size="sm"
//                 onClick={() => navigate('/invoiceTable')}
//               >
//                 <CIcon icon={cilArrowLeft} className="me-1" />
//                 Back to Orders
//               </CButton>
//             </div>
//           </CCardHeader>

//           <CCardBody>
//             {/* Work Order Info */}
//             <div className="bg-light p-3 rounded mb-4">
//               <h6 className="mb-2">Work Order Information</h6>
//               <CRow>
//                 <CCol md={3}>
//                   <small className="text-muted">Work Order :</small>
//                   <div><strong>{workOrderData.invoice_number}</strong></div>
//                 </CCol>
//                 <CCol md={3}>
//                   <small className="text-muted">Project:</small>
//                   <div><strong>{workOrderData.project?.project_name}</strong></div>
//                   <div className="small text-muted">Type: {workOrderData.project?.project_type?.name}</div>
//                 </CCol>
//                 <CCol md={3}>
//                   <small className="text-muted">Customer:</small>
//                   <div><strong>{workOrderData.project?.customer_name}</strong></div>
//                 </CCol>
//                 <CCol md={3}>
//                   <small className="text-muted">Location:</small>
//                   <div>{workOrderData.project?.work_place}</div>
//                 </CCol>
//               </CRow>
//             </div>

//             <CForm noValidate validated={validated} onSubmit={handleSubmit}>
//               {/* Invoice Details */}
//               <CRow className="mb-3">
//                 <CCol md={4}>
//                   <CFormLabel>Tally Invoice Number</CFormLabel>
//                   <CFormInput
//                     type="text"
//                     name="tally_invoice_number"
//                     value={form.tally_invoice_number}
//                     onChange={handleFormChange}
//                     placeholder="Optional - Enter Tally invoice "
//                   />
//                 </CCol>
//                 <CCol md={4}>
//                   <CFormLabel>Invoice Date *</CFormLabel>
//                   <CFormInput
//                     type="date"
//                     name="invoice_date"
//                     value={form.invoice_date}
//                     onChange={handleFormChange}
//                     required
//                   />
//                 </CCol>
//                 <CCol md={4}>
//                   <CFormLabel>Delivery Date</CFormLabel>
//                   <CFormInput
//                     type="date"
//                     name="delivery_date"
//                     value={form.delivery_date}
//                     onChange={handleFormChange}
//                   />
//                 </CCol>
//               </CRow>







//             <h6 className="mt-4 mb-3 fw-semibold text-primary border-bottom border-primary pb-2">
//               Advance Payments (Optional – can add multiple)
//             </h6>

//             <div className="border rounded p-4 mb-4 bg-light">
//               {/* Currently editing / adding form */}
//               <CRow className="g-3 mb-4">
//                 <CCol md={4}>
//                   <CFormLabel>Amount *</CFormLabel>
//                   <CInputGroup>
//                     <CInputGroupText>₹</CInputGroupText>
//                     <CFormInput
//                       type="number"
//                       step="0.01"
//                       min="0.01"
//                       name="received_amount"
//                       value={currentAdvance.received_amount}
//                       onChange={handleCurrentAdvanceChange}
//                       placeholder="0.00"
                      
//                     />
//                   </CInputGroup>
//                 </CCol>

//                 <CCol md={4}>
//                   <CFormLabel>Payment Date *</CFormLabel>
//                   <CFormInput
//                     type="date"
//                     name="payment_date"
//                     value={currentAdvance.payment_date}
//                     onChange={handleCurrentAdvanceChange}
//                     max={new Date().toISOString().split('T')[0]}
                    
//                   />
//                 </CCol>

//                 <CCol md={4}>
//                   <CFormLabel>Received From</CFormLabel>
//                   <CFormInput
//                     type="text"
//                     name="received_by"
//                     value={currentAdvance.received_by}
//                     onChange={handleCurrentAdvanceChange}
//                     placeholder="Payer name"
//                   />
//                 </CCol>

//                 <CCol md={4}>
//                   <CFormLabel>Payment Type</CFormLabel>
//                   <CFormSelect
//                     name="payment_type"
//                     value={currentAdvance.payment_type}
//                     onChange={handleCurrentAdvanceChange}
//                   >
//                     {paymentTypes.map((type) => (
//                       <option key={type.value} value={type.value}>
//                         {type.label}
//                       </option>
//                     ))}
//                   </CFormSelect>
//                 </CCol>

//                 <CCol md={4}>
//                   <CFormLabel>Sender's Bank</CFormLabel>
//                   <CFormInput
//                     type="text"
//                     name="senders_bank"
//                     value={currentAdvance.senders_bank}
//                     onChange={handleCurrentAdvanceChange}
//                     placeholder="Sender bank name"
//                   />
//                 </CCol>

//                 <CCol md={4}>
//                   <CFormLabel>Receiver's Bank</CFormLabel>
//                   <CFormSelect
//                     name="receivers_bank"
//                     value={currentAdvance.receivers_bank}
//                     onChange={handleCurrentAdvanceChange}
//                   >
//                     <option value="">Select bank</option>
//                     {receiver_bank.map((bank) => (
//                       <option key={bank.value} value={bank.value}>
//                         {bank.label}
//                       </option>
//                     ))}
//                   </CFormSelect>
//                 </CCol>

//                 <CCol md={12}>
//                   <CFormLabel>Transaction No / Remark</CFormLabel>
//                   <CFormInput
//                     type="text"
//                     name="remark"
//                     value={currentAdvance.remark}
//                     onChange={handleCurrentAdvanceChange}
//                     placeholder="Transaction ID or note"
//                   />
//                 </CCol>

//                 <CCol md={12} className="text-end">
//                   <CButton
//                     color={editingAdvanceIndex === -1 ? 'success' : 'primary'}
//                     onClick={addOrUpdateAdvancePayment}
//                     className="me-2"
//                   >
//                     {editingAdvanceIndex === -1 ? 'Add Payment' : 'Update Payment'}
//                   </CButton>
//                   {editingAdvanceIndex !== -1 && (
//                     <CButton color="secondary" onClick={cancelAdvanceEdit}>
//                       Cancel Edit
//                     </CButton>
//                   )}
//                 </CCol>
//               </CRow>

//               {/* List of added payments */}
//               {advancePayments.length > 0 && (
//                 <>
//                   <hr />
//                   <h6 className="mb-3">Added Advance Payments:</h6>
//                   {advancePayments.map((payment, idx) => (
//                     <div
//                       key={idx}
//                       className="border rounded p-3 mb-3 bg-white position-relative"
//                     >
//                       <div className="d-flex justify-content-between align-items-start">
//                         <div>
//                           <strong>₹{payment.received_amount.toFixed(2)}</strong>
//                           <span className="ms-3 text-muted">
//                             {new Date(payment.payment_date).toLocaleDateString()}
//                           </span>
//                           {payment.received_by && (
//                             <div className="small text-muted">
//                               Received from: {payment.received_by}
//                             </div>
//                           )}
//                           {payment.payment_type && (
//                             <div className="small text-muted">
//                               Type: {payment.payment_type}
//                             </div>
//                           )}
//                           {payment.remark && (
//                             <div className="small text-muted mt-1">
//                               Remark: {payment.remark}
//                             </div>
//                           )}
//                         </div>
//                         <div>
//                           <CButton
//                             color="warning"
//                             size="sm"
//                             variant="outline"
//                             className="me-2"
//                             onClick={() => editAdvancePayment(idx)}
//                           >
//                             Edit
//                           </CButton>
//                           <CButton
//                             color="danger"
//                             size="sm"
//                             variant="outline"
//                             onClick={() => removeAdvancePayment(idx)}
//                           >
//                             Remove
//                           </CButton>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </>
//               )}

//               {advancePayments.length === 0 && (
//                 <div className="text-center text-muted py-3">
//                   No advance payments added yet
//                 </div>
//               )}
//             </div>
























//               {/* Work Details */}
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

//                       <div className="d-flex flex-wrap gap-2 mb-2 mt-2">
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
//                               className="badge bg-light text-dark border border-secondary-subtle px-3 py-2 d-flex align-items-center gap-2"
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
//                     </CCol>
//                   </CRow>

//                   <CRow className="g-3 mb-3 align-items-end">
//                     <CCol md={3}>
//                       <CFormLabel>UOM</CFormLabel>
//                       <CFormInput
//                         placeholder="Unit"
//                         value={w.uom}
//                         onChange={(e) => handleWorkChange(idx, 'uom', e.target.value)}
//                       />
//                     </CCol>

//                     <CCol md={3}>
//                       <CFormLabel>
//                         Qty *
//                         {w.original_qty > 0 && w.used_qty > 0 && (
//                           <small className="text-danger d-block mt-1">
//                             Billed: {w.used_qty.toFixed(2)} of {w.original_qty.toFixed(2)}
//                           </small>
//                         )}
//                       </CFormLabel>
//                       <CFormInput
//                         type="number"
//                         step="0.01"
//                         min="0"
//                         value={w.qty}
//                         onChange={(e) => {
//                           let val = parseFloat(e.target.value) || 0
//                           if (w.original_qty) {
//                             const max = w.original_qty - w.used_qty
//                             val = Math.min(val, max)
//                             val = Math.max(0, val)
//                           }
//                           handleWorkChange(idx, 'qty', val)
//                         }}
//                         required
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

//                   <CRow className="g-3 mb-3 align-items-end">
//                     <CCol md={3}>
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

//                   <CRow className="g-3 mb-3 align-items-end">
//                     <CCol md={9}>
//                       <CFormLabel>Remark</CFormLabel>
//                       <CFormInput
//                         placeholder="Remark"
//                         value={w.remark}
//                         onChange={(e) => handleWorkChange(idx, 'remark', e.target.value)}
//                       />
//                     </CCol>

//                     <CCol md={3}>
//                       {works.length > 1 && (
//                         <CButton
//                           color="danger"
//                           size="sm"
//                           className="mt-2"
//                           onClick={() => removeWorkRow(idx)}
//                         >
//                           ✖ Remove This Work Order
//                         </CButton>
//                       )}
//                     </CCol>
//                   </CRow>
//                 </div>
//               ))}

//               {/* <CButton
//                 color="primary"
//                 variant="outline"
//                 className="mb-4"
//                 onClick={addWorkRow}
//               >
//                 + Add Work Item
//               </CButton> */}

//               {/* Calculations */}
//               <h6 className="mt-4 mb-3 fw-semibold text-primary border-bottom border-primary pb-2">
//                 Calculations
//               </h6>

//               <CRow className="mb-3">
//                 <CCol md={6}>
//                   <CFormLabel>Total Amount before GST</CFormLabel>
//                   <CInputGroup>
//                     <CInputGroupText>₹</CInputGroupText>
//                     <CFormInput
//                       type="number"
//                       value={form.subtotal.toFixed(2)}
//                       readOnly
//                     />
//                   </CInputGroup>
//                 </CCol>
//                 {/* <CCol md={4}>
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
//                     />
//                   </CInputGroup>
//                 </CCol> */}
//                 <CCol md={6}>
//                   <CFormLabel>Total Amount after GST</CFormLabel>
//                   <CInputGroup>
//                     <CInputGroupText>₹</CInputGroupText>
//                     <CFormInput
//                       type="number"
//                       value={form.finalAmount.toFixed(2)}
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
//                             newTerms[idx] = editingPaymentValue
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
//                   }
//                   return (
//                     <CBadge
//                       color="info"
//                       key={idx}
//                       className="me-1 mb-1"
//                       style={{ fontSize: '0.9em' }}
//                     >
//                       {term}
//                       <CIcon
//                         icon={cilPencil}
//                         className="ms-2"
//                         style={{ cursor: 'pointer' }}
//                         onClick={() => {
//                           setEditingPaymentIndex(idx)
//                           setEditingPaymentValue(term)
//                         }}
//                       />
//                       <CIcon
//                         icon={cilX}
//                         className="ms-1"
//                         style={{ cursor: 'pointer' }}
//                         onClick={() => {
//                           setPaymentTerms(paymentTerms.filter((_, i) => i !== idx))
//                         }}
//                       />
//                     </CBadge>
//                   )
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
//                             newConditions[idx] = editingConditionValue
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
//                   }
//                   return (
//                     <CBadge
//                       color="warning"
//                       key={idx}
//                       className="me-1 mb-1"
//                       style={{ fontSize: '0.9em' }}
//                     >
//                       {term}
//                       <CIcon
//                         icon={cilPencil}
//                         className="ms-2"
//                         style={{ cursor: 'pointer' }}
//                         onClick={() => {
//                           setEditingConditionIndex(idx)
//                           setEditingConditionValue(term)
//                         }}
//                       />
//                       <CIcon
//                         icon={cilX}
//                         className="ms-1"
//                         style={{ cursor: 'pointer' }}
//                         onClick={() => {
//                           setTermsAndConditions(termsAndConditions.filter((_, i) => i !== idx))
//                         }}
//                       />
//                     </CBadge>
//                   )
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
//                     placeholder="Enter any additional notes or instructions..."
//                   />
//                 </CCol>
//               </CRow>

//               <CButton
//                 color="primary"
//                 type="submit"
//                 disabled={loading}
//               >
//                 {loading ? <CSpinner size="sm" /> : <CIcon icon={cilSave} className="me-1" />}
//                 Create Proforma Invoice
//               </CButton>
//             </CForm>
//           </CCardBody>
//         </CCard>
//       </CCol>
//     </CRow>
//   )
// }

// export default CreateProformaInvoice

























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
  CBadge,
  CFormSelect,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilArrowLeft, cilPencil, cilSave, cilX, cilPlus } from '@coreui/icons'
import { post, getAPICall } from '../../../util/api'
import { useToast } from '../../common/toast/ToastContext'
import { paymentTypes, receiver_bank } from '../../../util/Feilds'

const CreateProformaInvoice = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { workOrderId, workOrderData } = location.state || {}

  const [loading, setLoading] = useState(false)
  const [validated, setValidated] = useState(false)
  const [previousProformas, setPreviousProformas] = useState([])

  // Sub-description helpers
  const [newSubDescs, setNewSubDescs] = useState([])
  const [editingSubDescWorkIdx, setEditingSubDescWorkIdx] = useState(-1)
  const [editingSubDescIdx, setEditingSubDescIdx] = useState(-1)
  const [editingSubDescValue, setEditingSubDescValue] = useState('')

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
    gstPercentage: 0,
    sgstPercentage: 0,
    cgstPercentage: 0,
    igstPercentage: 0,
    notes: '',
    terms_conditions: '',
    payment_terms: ''
  })

  const [works, setWorks] = useState([])

  // Payment Terms
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

  // Terms & Conditions
  const initialTermsAndConditions = [
    '18% Tax Extra',
    'ROW on your side',
    'Work will commence only after receiving an official work order'
  ]
  const [termsAndConditions, setTermsAndConditions] = useState(initialTermsAndConditions)
  const [editingConditionIndex, setEditingConditionIndex] = useState(-1)
  const [editingConditionValue, setEditingConditionValue] = useState('')
  const [newCondition, setNewCondition] = useState('')

  // Local payment types with added 'debit_note' option (only for this page)
  const localPaymentTypes = [
    ...paymentTypes,
    { value: 'debit_note', label: 'Debit Note' }
  ]

  // Advance Payments (multiple)
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


  // Add these two helpers at the top of the file (after imports)
const formatNumber = (num, decimals = 2) => {
  if (num == null || isNaN(num)) return '0.00';
  
  const rounded = (num * Math.pow(10, decimals).toFixed(2)) / Math.pow(10, decimals);
  
  return rounded.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

const formatCurrency = (amount) => {
  return '₹' + formatNumber(amount)
}













  // ──────────────────────────────────────────────────────────────
  // Load previous proformas
  // ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (workOrderId) {
      const fetchPrevious = async () => {
        try {
          const resp = await getAPICall(`/api/proforma-invoices?work_order_id=${workOrderId}`)
          setPreviousProformas(resp?.data?.data || [])
        } catch (err) {
          console.error('Failed to load previous proformas', err)
        }
      }
      fetchPrevious()
    }
  }, [workOrderId])

  // ──────────────────────────────────────────────────────────────
  // Initialize form & works from workOrderData
  // ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!workOrderData) return

    // Global GST percentages
    const total = parseFloat(workOrderData.totalAmount) || 0
    const cgst = parseFloat(workOrderData.cgst) || 0
    const sgst = parseFloat(workOrderData.sgst) || 0
    const igst = parseFloat(workOrderData.igst) || 0
    const gst  = parseFloat(workOrderData.gst)  || 0

    let gstPercentage = 0, cgstPercentage = 0, sgstPercentage = 0, igstPercentage = 0

    if (total > 0) {
      if (cgst > 0) cgstPercentage = Math.round((cgst / total) * 100 * 100) / 100
      if (sgst > 0) sgstPercentage = Math.round((sgst / total) * 100 * 100) / 100
      if (igst > 0) igstPercentage = Math.round((igst / total) * 100 * 100) / 100
      gstPercentage = gst > 0 ? Math.round((gst / total) * 100 * 100) / 100 : (cgstPercentage + sgstPercentage)
    }

    setForm(prev => ({
      ...prev,
      work_order_id: workOrderData.id,
      project_id: workOrderData.project_id,
      gstPercentage,
      sgstPercentage,
      cgstPercentage,
      igstPercentage,
    }))

    if (workOrderData.items?.length > 0) {
      const loadedWorks = workOrderData.items.map(item => {
        const originalQty = parseFloat(item.qty) || 0
        let used = 0

        previousProformas.forEach(prof => {
          prof.details?.forEach(d => {
            if (d.work_type?.trim().toLowerCase() === item.work_type?.trim().toLowerCase()) {
              used += parseFloat(d.qty) || 0
            }
          })
        })

        const remaining = Math.max(0, originalQty - used)

        return {
          id: item.id,
          original_qty: originalQty,
          used_qty: used,
          work_type: item.work_type || '',
          uom: item.uom || '',
          qty: remaining,
          price: parseFloat(item.price) || 0,
          total_price: parseFloat(item.total_price) || 0,
          remark: item.remark || '',
          sub_descriptions: item.work_sub_description
            ? item.work_sub_description.split('\n').map(l => l.trim()).filter(Boolean)
            : [],
          gst_percent: parseFloat(item.gst_percent) || 0,
          cgst_amount: parseFloat(item.cgst_amount) || 0,
          sgst_amount: parseFloat(item.sgst_amount) || 0,
        }
      }).sort((a, b) => (a.id || 0) - (b.id || 0))

      setWorks(loadedWorks)
      setNewSubDescs(Array(loadedWorks.length).fill(''))
      loadedWorks.forEach((_, i) => recalcRow(i, loadedWorks))
      calculateTotals(loadedWorks)
    }
  }, [workOrderData, previousProformas])

  // ──────────────────────────────────────────────────────────────
  // Handlers – Form
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

      // Recalculate totals when discount or GST changes
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

  // ──────────────────────────────────────────────────────────────
  // Work row calculations
  // ──────────────────────────────────────────────────────────────
  const recalcRow = (index, currentWorks = works) => {
    const updated = [...currentWorks]
    const row = updated[index]

    const base = (row.qty || 0) * (row.price || 0)
    const halfGst = (row.gst_percent || 0) / 2

    row.cgst_amount  = +(base * halfGst / 100).toFixed(2)
    row.sgst_amount  = +(base * halfGst / 100).toFixed(2)
    row.total_price  = +(base + row.cgst_amount + row.sgst_amount).toFixed(2)

    setWorks(updated)
    calculateTotals(updated)
  }

  // const handleWorkChange = (index, field, value) => {
  //   const updated = [...works]

  //   if (field === 'qty') {
  //     let val = parseFloat(value) || 0
  //     if (updated[index].original_qty) {
  //       const max = updated[index].original_qty - updated[index].used_qty
  //       val = Math.max(0, Math.min(val, max))
  //     }
  //     updated[index].qty = val
  //   } else if (field === 'price' || field === 'gst_percent') {
  //     updated[index][field] = Number(value) || 0
  //   } else {
  //     updated[index][field] = value
  //   }

  //   setWorks(updated)
  //   recalcRow(index, updated)
  // }




const handleWorkChange = (index, field, value) => {
  const updated = [...works]
  const row = updated[index]

  if (field === 'qty') {
    // ✅ Allow FREE typing (no restriction)
    row.qty = value   // keep raw string exactly as user types

    setWorks(updated)
    return
  }

  if (field === 'price' || field === 'gst_percent') {
    row[field] = Number(value) || 0
  } else {
    row[field] = value
  }

  setWorks(updated)
}

const validateQtyOnBlur = (index) => {
  const updated = [...works]
  const row = updated[index]

  // If user cleared field → keep empty
  if (row.qty === '' || row.qty === '.') {
    setWorks(updated)
    return
  }

  const val = parseFloat(row.qty)

  if (isNaN(val)) {
    row.qty = ''
    setWorks(updated)
    return
  }

  // ✅ Now apply your Pending validation
  if (row.original_qty > 0) {
    // const remaining = row.original_qty - row.used_qty
    // const remaining = toFixedNumber(row.original_qty - row.used_qty)
    const remaining = Number((row.original_qty - row.used_qty).toFixed(4))


    if (val > remaining) {
      showToast('warning', `Entered amount cannot be greater than pending (${formatNumber(remaining)})`)
      row.qty = ''   // ❗ clear instead of forcing value
      setWorks(updated)
      return
    }
  }

  // ✅ Accept value
  row.qty = val
  setWorks(updated)

  recalcRow(index, updated) // calculate only after valid
}



  const addWorkRow = () => {
    const newRow = {
      work_type: '',
      uom: '',
      qty: 0,
      price: 0,
      total_price: 0,
      remark: '',
      sub_descriptions: [],
      gst_percent: '',
      cgst_amount: '',
      sgst_amount: '',
    }
    setWorks([...works, newRow])
    setNewSubDescs([...newSubDescs, ''])
  }

  const removeWorkRow = (index) => {
    const updatedWorks = works.filter((_, i) => i !== index)
    setWorks(updatedWorks)
    setNewSubDescs(newSubDescs.filter((_, i) => i !== index))
    calculateTotals(updatedWorks)

    if (editingSubDescWorkIdx === index) {
      setEditingSubDescWorkIdx(-1)
      setEditingSubDescIdx(-1)
    }
  }

  const calculateTotals = (rows = works) => {
    const taxable = rows.reduce((sum, w) => sum + (w.qty || 0) * (w.price || 0), 0)
    const cgst = rows.reduce((sum, w) => sum + (w.cgst_amount || 0), 0)
    const sgst = rows.reduce((sum, w) => sum + (w.sgst_amount || 0), 0)
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

  // ──────────────────────────────────────────────────────────────
  // Advance Payment Handlers
  // ──────────────────────────────────────────────────────────────
  const handleCurrentAdvanceChange = (e) => {
    const { name, value } = e.target
    setCurrentAdvance(prev => ({ ...prev, [name]: value }))
  }

  const addOrUpdateAdvancePayment = () => {
    const amount = parseFloat(currentAdvance.received_amount || 0)
    if (amount <= 0) {
      showToast('warning', 'Please enter a valid payment amount > 0')
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

    // Reset
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

  const editAdvancePayment = (index) => {
    setCurrentAdvance(advancePayments[index])
    setEditingAdvanceIndex(index)
  }

  const removeAdvancePayment = (index) => {
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

  const cancelAdvanceEdit = () => {
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

  // ──────────────────────────────────────────────────────────────
  // Submit
  // ──────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!e.currentTarget.checkValidity()) {
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

    const totalAdvance = advancePayments.reduce((sum, p) => sum + p.received_amount, 0)
    const finalAmt = form.finalAmount

    if (totalAdvance > finalAmt) {
      showToast('danger', `Total advance (₹${totalAdvance.toFixed(2)}) cannot exceed invoice amount (₹${finalAmt.toFixed(2)})`)
      return
    }

    try {
      setLoading(true)

      const items = works
        .filter(w => w.work_type && w.qty > 0)
        .map(w => ({
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
        }))

      const payload = {
        work_order_id: form.work_order_id,
        project_id: form.project_id,
        tally_invoice_number: form.tally_invoice_number || null,
        invoice_date: form.invoice_date,
        delivery_date: form.delivery_date || null,
        items,
        discount: form.discount,
        gst_percentage: form.gstPercentage,
        cgst_percentage: form.cgstPercentage,
        sgst_percentage: form.sgstPercentage,
        igst_percentage: form.igstPercentage,
        notes: form.notes || null,
        payment_terms: paymentTerms.join('\n'),
        terms_conditions: termsAndConditions.join('\n'),
        advance_payments: advancePayments.map(p => ({
          received_amount: p.received_amount,
          payment_date: p.payment_date,
          received_from: p.received_by || null,
          payment_type: p.payment_type || null,
          senders_bank: p.senders_bank || null,
          receivers_bank: p.receivers_bank || null,
          remark: p.remark || null,
        })),
      }

      const resp = await post('/api/proforma-invoices', payload)

      if (!resp?.success) {
        showToast('danger', resp.message || 'Failed to create proforma invoice', 8000)
        return
      }

      const proformaId = resp.data.id

      showToast('success', 'Proforma invoice created successfully')

      setTimeout(() => {
        navigate(`/proforma-invoice-details/${proformaId}`)
      }, 1200)
    } catch (err) {
      console.error(err)
      showToast('danger', err.message || 'Failed to create proforma invoice', 8000)
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
              <CButton color="secondary" size="sm" onClick={() => navigate('/invoiceTable')}>
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

            <CForm noValidate validated={validated} onSubmit={handleSubmit}>
              {/* Invoice Details */}
              <CRow className="mb-3 g-3">
                <CCol md={4}>
                  <CFormLabel>Tally Invoice Number</CFormLabel>
                  <CFormInput
                    name="tally_invoice_number"
                    value={form.tally_invoice_number}
                    onChange={handleFormChange}
                    placeholder="Optional - Enter Tally invoice"
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

              {/* Advance Payments */}
              <h6 className="mt-5 mb-3 fw-semibold text-primary border-bottom border-primary pb-2">
                Advance Payments (Optional – multiple allowed)
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
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </CCol>

                  {currentAdvance.payment_type !== 'debit_note' && (
                    <CCol md={4}>
                      <CFormLabel>Received From</CFormLabel>
                      <CFormInput
                        name="received_by"
                        value={currentAdvance.received_by}
                        onChange={handleCurrentAdvanceChange}
                        placeholder="Payer name"
                      />
                    </CCol>
                  )}

                  <CCol md={4}>
                    <CFormLabel>Payment Type</CFormLabel>
                    <CFormSelect
                      name="payment_type"
                      value={currentAdvance.payment_type}
                      onChange={handleCurrentAdvanceChange}
                    >
                      {localPaymentTypes.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </CFormSelect>
                  </CCol>

                  {currentAdvance.payment_type !== 'debit_note' && (
                    <CCol md={4}>
                      <CFormLabel>Sender's Bank</CFormLabel>
                      <CFormInput
                        name="senders_bank"
                        value={currentAdvance.senders_bank}
                        onChange={handleCurrentAdvanceChange}
                        placeholder="Sender bank name"
                      />
                    </CCol>
                  )}

                  {currentAdvance.payment_type !== 'debit_note' && (
                    <CCol md={4}>
                      <CFormLabel>Receiver's Bank</CFormLabel>
                      <CFormSelect
                        name="receivers_bank"
                        value={currentAdvance.receivers_bank}
                        onChange={handleCurrentAdvanceChange}
                      >
                        <option value="">Select bank</option>
                        {receiver_bank.map(b => (
                          <option key={b.value} value={b.value}>{b.label}</option>
                        ))}
                      </CFormSelect>
                    </CCol>
                  )}

                  <CCol md={12}>
                    <CFormLabel>Transaction No / Remark</CFormLabel>
                    <CFormInput
                      name="remark"
                      value={currentAdvance.remark}
                      onChange={handleCurrentAdvanceChange}
                      placeholder="Transaction ID or note"
                    />
                  </CCol>

                  <CCol md={12} className="text-end">
                    <CButton
                      color={editingAdvanceIndex === -1 ? 'success' : 'primary'}
                      onClick={addOrUpdateAdvancePayment}
                      className="me-2"
                    >
                      {editingAdvanceIndex === -1 ? 'Add Payment' : 'Update Payment'}
                    </CButton>
                    {editingAdvanceIndex !== -1 && (
                      <CButton color="secondary" onClick={cancelAdvanceEdit}>
                        Cancel
                      </CButton>
                    )}
                  </CCol>
                </CRow>

                {advancePayments.length > 0 && (
                  <>
                    <hr />
                    <h6 className="mb-3">Added Payments:</h6>
                    {advancePayments.map((p, i) => (
                      <div key={i} className="border rounded p-3 mb-3 bg-white position-relative">
                        <div className="d-flex justify-content-between">
                          <div>
                            <strong>₹{p.received_amount.toFixed(2)}</strong>
                            <span className="ms-3 text-muted">
                              {new Date(p.payment_date).toLocaleDateString()}
                            </span>
                            {p.received_by && p.received_by !== '--' && <div className="small text-muted">From: {p.received_by}</div>}
                            {p.payment_type && <div className="small text-muted">Type: {p.payment_type}</div>}
                            {p.remark && <div className="small text-muted mt-1">Remark: {p.remark}</div>}
                          </div>
                          <div>
                            <CButton color="warning" size="sm" variant="outline" className="me-2" onClick={() => editAdvancePayment(i)}>
                              Edit
                            </CButton>
                            <CButton color="danger" size="sm" variant="outline" onClick={() => removeAdvancePayment(i)}>
                              Remove
                            </CButton>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {advancePayments.length === 0 && (
                  <div className="text-center text-muted py-4">
                    No advance payments added yet
                  </div>
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
                        Qty *
                        {w.original_qty > 0 && w.used_qty > 0 && (
                          <small className="text-danger d-block mt-1">
                            Billed: {w.used_qty.toFixed(2)} / {w.original_qty.toFixed(2)}
                          </small>
                        )}


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
                          onClick={() => removeWorkRow(idx)}
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

        {/* Sub descriptions badges - right below input, same column, no extra mb-4 gap */}
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
     

    {/* Second row - all 4 fields in one clean line */}
    <CRow className="g-3 mb-3 align-items-end">
      <CCol md={3}>
        <CFormLabel>UOM</CFormLabel>
        <CFormInput
          value={w.uom}
          onChange={e => handleWorkChange(idx, 'uom', e.target.value)}
          placeholder="Unit"
        />
      </CCol>




      {/* <CCol md={3}>
        <CFormLabel>
          Qty <span className="text-danger fw-bold">*</span>
        </CFormLabel>
        {w.original_qty > 0 && (
          <small className="text-danger d-block mt-1" style={{ lineHeight: '1.2' }}>
            Total: {Number(w.original_qty).toFixed(2)}<br />
            Billed: {w.used_qty.toFixed(2)}<br />
            <strong>Remaining: {(w.original_qty - w.used_qty).toFixed(2)}</strong>
          </small>
        )}
        <CFormInput
          type="text"
          step="0.01"
          min="0"
          // value={w.qty}
          value={formatNumber(w.qty)}
          onChange={e => handleWorkChange(idx, 'qty', e.target.value)}
          required
        />
      </CCol> */}


<CCol md={3}>
  <CFormLabel>
    Qty <span className="text-danger fw-bold">*</span>
  </CFormLabel>
  {w.original_qty > 0 && (
    <small className="text-danger d-block mt-1" style={{ lineHeight: '1.2' }}>
      Total: {formatNumber(w.original_qty)}<br />
      Billed: {formatNumber(w.used_qty)}<br />
      <strong>Remaining: {formatNumber(w.original_qty - w.used_qty)}</strong>
    </small>
  )}
 <CFormInput
  type="text"
  inputMode="decimal"
 // value={w.qty ?? ''}   // ❗ show raw value (NO formatNumber)
 value={
      w.qty === '' || w.qty == null 
        ? '' 
        : (typeof w.qty === 'string' 
            ? w.qty 
            : Number(w.qty).toFixed(2)
          )
    }
  onChange={e => handleWorkChange(idx, 'qty', e.target.value)}
  onBlur={() => validateQtyOnBlur(idx)}
  placeholder="0.00"
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
            onClick={() => removeWorkRow(idx)}
          >
            Remove Work Item
          </CButton>
        )}
      </CCol>
    </CRow>
  </div>
))}



              {/* <CButton color="primary" variant="outline" className="mb-4" onClick={addWorkRow}>
                + Add Another Work Item
              </CButton> */}

              {/* Totals */}
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
                            arr[i] = editingPaymentValue
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
                    // <CBadge color="info" key={i} className="px-3 py-2" style={{ fontSize: '0.9rem' }}>
                    <CBadge color="info" key={i} className="px-3 py-2" style={{ 
  fontSize: '0.9rem',
  whiteSpace: 'normal',
  maxWidth: '100%',
  display: 'inline-block',
  wordBreak: 'break-word',
  textAlign: 'left',
  lineHeight: '1.5',
}}>
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
                            arr[i] = editingConditionValue
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
                    // <CBadge color="warning" key={i} className="px-3 py-2" style={{ fontSize: '0.9rem' }}>
                    <CBadge color="warning" key={i} className="px-3 py-2" style={{ 
  fontSize: '0.9rem',
  whiteSpace: 'normal',
  maxWidth: '100%',
  display: 'inline-block',
  wordBreak: 'break-word',
  textAlign: 'left',
  lineHeight: '1.5',
}}>
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

              <div className="d-flex justify-content-end">
                <CButton color="primary" type="submit" disabled={loading}>
                  {loading ? <CSpinner size="sm" /> : <CIcon icon={cilSave} className="me-1" />}
                  Create Proforma Invoice
                </CButton>
              </div>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default CreateProformaInvoice