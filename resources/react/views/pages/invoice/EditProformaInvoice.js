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

//   const [form, setForm] = useState({
//   tally_invoice_number: '',
//   invoice_date: '',
//   delivery_date: '',
//   discount: 0,
//   subtotal: 0,
//   taxableAmount: 0,
//   gstAmount: 0,
//   sgstAmount: 0,
//   cgstAmount: 0,
//   igstAmount: 0,
//   finalAmount: 0,
//   gstPercentage: 0,  // ✅ Changed from 18 to 0
//   sgstPercentage: 0, // ✅ Changed from 9 to 0
//   cgstPercentage: 0, // ✅ Changed from 9 to 0
//   igstPercentage: 0,
//   notes: '',
//   status: 'draft',
//   terms_conditions: '',
//   payment_terms: '',
// })

//   const [works, setWorks] = useState([
//     { work_type: '', uom: '', qty: 0, price: 0, total_price: 0, remark: '' },
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

//   // Fetch proforma invoice data
//   useEffect(() => {
//     fetchProformaInvoice()
//     fetchRules()
//   }, [id])

// const fetchProformaInvoice = async () => {
//   try {
//     setLoading(true)
//     const response = await getAPICall(`/api/proforma-invoices/${id}`)
    
//     if (response && response.success && response.data) {
//       const data = response.data
//       setProformaData(data)

//       // ✅ Set work items with proper GST handling FIRST
//       let mappedWorks = []
//       if (data.details && data.details.length > 0) {
//         mappedWorks = data.details.map(item => {
//           // Parse values
//           const qty = parseFloat(item.qty) || 0
//           const price = parseFloat(item.price) || 0
//           const totalPrice = parseFloat(item.total_price) || 0
          
//           // ✅ Handle GST percent - allow 0 as valid value
//           let gstPercent = 0
//           if (item.gst_percent !== null && item.gst_percent !== undefined) {
//             gstPercent = parseFloat(item.gst_percent)
//             if (isNaN(gstPercent)) gstPercent = 0  // ✅ Default to 0, not 18
//           }
          
//           // Handle CGST amount
//           let cgstAmount = 0
//           if (item.cgst_amount !== null && item.cgst_amount !== undefined) {
//             cgstAmount = parseFloat(item.cgst_amount)
//             if (isNaN(cgstAmount)) cgstAmount = 0
//           }
          
//           // Handle SGST amount
//           let sgstAmount = 0
//           if (item.sgst_amount !== null && item.sgst_amount !== undefined) {
//             sgstAmount = parseFloat(item.sgst_amount)
//             if (isNaN(sgstAmount)) sgstAmount = 0
//           }

//           return {
//         id: item.id,  // ✅ ADD THIS LINE
//         work_type: item.work_type || '',
//         uom: item.uom || '',
//         qty: qty,
//         price: price,
//         total_price: totalPrice,
//         gst_percent: gstPercent,
//         cgst_amount: cgstAmount,
//         sgst_amount: sgstAmount,
//         remark: item.remark || '',
//       }
//     })
//     .sort((a, b) => (a.id || 0) - (b.id || 0))
//       } else {
//         // Set default empty work row if no items
//         mappedWorks = [{
//           work_type: '',
//           uom: '',
//           qty: 0,
//           price: 0,
//           total_price: 0,
//           gst_percent: 0,
//           cgst_amount: 0,
//           sgst_amount: 0,
//           remark: ''
//         }]
//       }

//       // Calculate totals from works BEFORE setting form
//       const subtotal = mappedWorks.reduce((sum, w) => sum + (w.qty * w.price), 0)
//       const totalCGST = mappedWorks.reduce((sum, w) => sum + (w.cgst_amount || 0), 0)
//       const totalSGST = mappedWorks.reduce((sum, w) => sum + (w.sgst_amount || 0), 0)
//       const rowLevelGST = totalCGST + totalSGST
//       const totalAfterRowGST = mappedWorks.reduce((sum, w) => sum + (w.total_price || 0), 0)
      
//       // ✅ Get global GST percentages from data (default to 0)
//       const gstPercentage = parseFloat(data.gst_percentage) || 0
//       const sgstPercentage = parseFloat(data.sgst_percentage) || 0
//       const cgstPercentage = parseFloat(data.cgst_percentage) || 0
//       const igstPercentage = parseFloat(data.igst_percentage) || 0
      
//       // Calculate global GST amounts
//       const globalSGST = totalAfterRowGST * (sgstPercentage / 100)
//       const globalCGST = totalAfterRowGST * (cgstPercentage / 100)
//       const globalIGST = totalAfterRowGST * (igstPercentage / 100)
//       const globalTotalGST = globalSGST + globalCGST + globalIGST
      
//       // Calculate final amount
//       const discount = parseFloat(data.discount) || 0
//       const beforeDiscount = totalAfterRowGST + globalTotalGST
//       const finalAmount = beforeDiscount - discount

//       // Set form data with calculated values
//       setForm({
//         tally_invoice_number: data.tally_invoice_number || '',
//         invoice_date: data.invoice_date?.split('T')[0] || '',
//         delivery_date: data.delivery_date?.split('T')[0] || '',
//         discount: discount,
//         subtotal: subtotal,
//         taxableAmount: totalAfterRowGST,
//         gstAmount: globalTotalGST,
//         sgstAmount: globalSGST,
//         cgstAmount: globalCGST,
//         igstAmount: globalIGST,
//         finalAmount: finalAmount,
//         gstPercentage: gstPercentage,     // ✅ Use actual GST %
//         sgstPercentage: sgstPercentage,   // ✅ Use actual SGST %
//         cgstPercentage: cgstPercentage,   // ✅ Use actual CGST %
//         igstPercentage: igstPercentage,   // ✅ Use actual IGST %
//         notes: data.notes || '',
//         status: data.status || 'draft',
//         terms_conditions: data.terms_conditions || '',
//         payment_terms: data.payment_terms || '',
//       })

//       // Set works AFTER form
//       setWorks(mappedWorks)

//       // Set payment terms
//       if (data.payment_terms) {
//         const terms = data.payment_terms
//           .split('\n')
//           .filter(term => term.trim() !== '')
//         setPaymentTerms(terms.length > 0 ? terms : [])
//       } else {
//         setPaymentTerms([])
//       }

//       // Set terms and conditions
//       if (data.terms_conditions) {
//         const conditions = data.terms_conditions
//           .split('\n')
//           .filter(term => term.trim() !== '')
//         setTermsAndConditions(conditions.length > 0 ? conditions : [])
//       } else {
//         setTermsAndConditions([])
//       }

//       // Set selected rules
//       if (data.invoice_rules && data.invoice_rules.length > 0) {
//         setSelectedRules(data.invoice_rules.map(ir => ir.rules_id))
//       } else {
//         setSelectedRules([])
//       }
//     } else {
//       showToast('danger', 'Failed to load proforma invoice')
//       setTimeout(() => navigate('/invoiceTable'), 2000)
//     }
//   } catch (error) {
//     console.error('Error fetching proforma invoice:', error)
//     showToast('danger', 'Failed to load proforma invoice')
//     setTimeout(() => navigate('/invoiceTable'), 2000)
//   } finally {
//     setLoading(false)
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

//   // const handleWorkChange = (index, field, value) => {
//   //   const updated = [...works]
//   //   updated[index][field] = field === 'qty' || field === 'price' 
//   //     ? parseFloat(value) || 0 
//   //     : value
//   //   updated[index].total_price = (updated[index].qty || 0) * (updated[index].price || 0)
//   //   setWorks(updated)
//   //   calculateTotals(updated)
//   // }

// //   const handleWorkChange = (index, field, value) => {
// //   const updated = [...works];

// //   if (field === 'qty' || field === 'price' || field === 'gst_percent') {
// //     updated[index][field] = parseFloat(value) || 0;
// //   } else {
// //     updated[index][field] = value;
// //   }

// //   const qty = updated[index].qty || 0;
// //   const price = updated[index].price || 0;
// //   const gstPercent = updated[index].gst_percent || 0;

// //   const baseAmount = qty * price;
// //   const cgst = baseAmount * (gstPercent / 2 / 100);
// //   const sgst = baseAmount * (gstPercent / 2 / 100);
// //   const finalLineTotal = baseAmount + cgst + sgst;

// //   updated[index].total_price = finalLineTotal;
// //   updated[index].cgst_amount = cgst;
// //   updated[index].sgst_amount = sgst;

// //   setWorks(updated);
// //   calculateTotals(updated);
// // };

// const handleWorkChange = (index, field, value) => {
//   const updated = [...works];

//   if (field === 'qty' || field === 'price') {
//     updated[index][field] = value === "" ? 0 : parseFloat(value) || 0;
//   } 
//   else if (field === 'gst_percent') {
//     // CRITICAL: Keep 0 as 0, don't default to 18
//     updated[index].gst_percent = value === "" || value === null || value === undefined 
//       ? 0 
//       : parseFloat(value) || 0;
//   } 
//   else {
//     updated[index][field] = value;
//   }

//   const qty = updated[index].qty || 0;
//   const price = updated[index].price || 0;
//   const gstPercent = updated[index].gst_percent ?? 0; // Use ?? to preserve 0

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

//   // const addWorkRow = () => {
//   //   setWorks([...works, { work_type: '', uom: '', qty: 0, price: 0, total_price: 0, remark: '' }])
//   // }

//   const addWorkRow = () => {
//   setWorks([
//     ...works,
//     {
//       work_type: '',
//       uom: '',
//       qty: 0,
//       price: 0,
//       total_price: 0,
//       gst_percent: 18,  // ✅ Keep row-level GST at 18%
//       cgst_amount: 9,
//       sgst_amount: 9,
//       remark: ''
//     }
//   ]);
// };

//   const removeWorkRow = (index) => {
//     if (works.length === 1) return
//     const updated = [...works]
//     updated.splice(index, 1)
//     setWorks(updated)
//     calculateTotals(updated)
//   }

//   // const calculateTotals = (currentWorks) => {
//   //   setForm(prev => {
//   //     const subtotal = currentWorks.reduce((sum, w) => sum + (w.total_price || 0), 0)
//   //     const base = subtotal - (prev.discount || 0)
//   //     const sgstAmount = base * (prev.sgstPercentage / 100)
//   //     const cgstAmount = base * (prev.cgstPercentage / 100)
//   //     const igstAmount = base * (prev.igstPercentage / 100)
//   //     const gstAmount = sgstAmount + cgstAmount + igstAmount
//   //     const finalAmount = base + gstAmount
      
//   //     return { 
//   //       ...prev, 
//   //       subtotal, 
//   //       taxableAmount: base, 
//   //       gstAmount, 
//   //       sgstAmount, 
//   //       cgstAmount, 
//   //       igstAmount, 
//   //       finalAmount 
//   //     }
//   //   })
//   // }

//   const calculateTotals = (currentWorks) => {
//   setForm(prev => {
//     // Calculate base subtotal (without any GST)
//     const subtotal = currentWorks.reduce((sum, w) => sum + (w.qty * w.price), 0);
    
//     // Calculate row-level GST totals
//     const totalCGST = currentWorks.reduce((sum, w) => sum + (w.cgst_amount || 0), 0);
//     const totalSGST = currentWorks.reduce((sum, w) => sum + (w.sgst_amount || 0), 0);
//     const rowLevelGST = totalCGST + totalSGST;
    
//     // Total after row GST (this is the base for global GST calculation)
//     const totalAfterRowGST = currentWorks.reduce((sum, w) => sum + (w.total_price || 0), 0);
    
//     // Apply global GST percentages on top of totalAfterRowGST - ✅ Round to 2 decimals
//     const globalSGST = Math.round((totalAfterRowGST * (prev.sgstPercentage / 100)) * 100) / 100;
//     const globalCGST = Math.round((totalAfterRowGST * (prev.cgstPercentage / 100)) * 100) / 100;
//     const globalIGST = Math.round((totalAfterRowGST * (prev.igstPercentage / 100)) * 100) / 100;
//     const globalTotalGST = Math.round((globalSGST + globalCGST + globalIGST) * 100) / 100;
    
//     // Final calculation
//     const beforeDiscount = Math.round((totalAfterRowGST + globalTotalGST) * 100) / 100;
//     const finalAmount = Math.round((beforeDiscount - (prev.discount || 0)) * 100) / 100;
    
//     return {
//       ...prev,
//       subtotal: Math.round(subtotal * 100) / 100,              // Base without any GST
//       taxableAmount: Math.round(totalAfterRowGST * 100) / 100, // After row GST, taxable for global GST
//       gstAmount: globalTotalGST,       // Only global GST amount
//       cgstAmount: globalCGST,          // Only global CGST
//       sgstAmount: globalSGST,          // Only global SGST
//       igstAmount: globalIGST,          // Only global IGST
//       finalAmount: finalAmount,
//     };
//   });
// };


//   const handleSubmit = async (e) => {
//   e.preventDefault()
//   const formElement = e.currentTarget

//   if (!formElement.checkValidity()) {
//     setValidated(true)
//     return
//   }

//   try {
//     setSaving(true)

//     const data = {
//       tally_invoice_number: form.tally_invoice_number || null,
//       invoice_date: form.invoice_date,
//       delivery_date: form.delivery_date || null,
//       items: works
//         .filter(w => w.work_type && w.qty > 0)
//         .map(w => ({
//           work_type: w.work_type,
//           uom: w.uom,
//           qty: w.qty,
//           price: w.price,
//           total_price: w.total_price,
//           remark: w.remark || '',
//           gst_percent: w.gst_percent,
//           cgst_amount: w.cgst_amount,
//           sgst_amount: w.sgst_amount,
//         })),
//       discount: form.discount,
//       gst_percentage: form.gstPercentage,
//       cgst_percentage: form.cgstPercentage,
//       sgst_percentage: form.sgstPercentage,
//       igst_percentage: form.igstPercentage,
//       rule_ids: selectedRules,
//       notes: form.notes || null,
//       status: form.status,
//       terms_conditions: termsAndConditions.join('\n') || null,
//       payment_terms: paymentTerms.join('\n') || null,
//     }

//     const resp = await put(`/api/proforma-invoices/${id}`, data)

//     if (resp && resp.success) {
//       showToast('success', 'Proforma invoice updated successfully')
//       setTimeout(() => {
//         navigate(`/proforma-invoice-details/${id}`)
//       }, 1500)
//     } else {
//       showToast('danger', resp.message || 'Failed to update proforma invoice', 8000)
//     }
//   } catch (error) {
//     console.error('Update error:', error)
    
//     // The error.message now contains the parsed message from backend
//     const errorMessage = error.message || 'Failed to update proforma invoice'
    
//     showToast('danger', errorMessage, 8000)
//   } finally {
//     setSaving(false)
//   }
// }

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
//               {/* <h6 className="mt-4 mb-3 fw-semibold text-primary border-bottom border-primary pb-2">
//                 Work Details
//               </h6> */}
//               {/* {works.map((w, idx) => (
//                 <CRow className="g-3 mb-3 align-items-center" key={idx}>
//                   <CCol md={2}>
//                     <CFormInput
//                       placeholder="Work Type"
//                       value={w.work_type}
//                       onChange={(e) => handleWorkChange(idx, 'work_type', e.target.value)}
//                       required
//                     />
//                   </CCol>
//                   <CCol md={2}>
//                     <CFormInput
//                       placeholder="Unit"
//                       value={w.uom}
//                       onChange={(e) => handleWorkChange(idx, 'uom', e.target.value)}
//                     />
//                   </CCol>
//                   <CCol md={2}>
//                     <CFormInput
//                       type="number"
//                       placeholder="Quantity"
//                       value={w.qty}
//                       onChange={(e) => handleWorkChange(idx, 'qty', e.target.value)}
//                       min="0"
//                       required
//                     />
//                   </CCol>
//                   <CCol md={2}>
//                     <CInputGroup>
//                       <CInputGroupText>₹</CInputGroupText>
//                       <CFormInput
//                         type="number"
//                         placeholder="Price"
//                         value={w.price}
//                         onChange={(e) => handleWorkChange(idx, 'price', e.target.value)}
//                         min="0"
//                         step="0.01"
//                         required
//                       />
//                     </CInputGroup>
//                   </CCol>
//                   <CCol md={1}>
//                     <span className="text-success fw-medium">₹{w.total_price.toFixed(2)}</span>
//                   </CCol>
//                   <CCol md={2}>
//                     <CFormInput
//                       placeholder="Remark"
//                       value={w.remark}
//                       onChange={(e) => handleWorkChange(idx, 'remark', e.target.value)}
//                     />
//                   </CCol>
//                   <CCol md={1}>
//                     <CButton
//                       color="danger"
//                       size="sm"
//                       onClick={() => removeWorkRow(idx)}
//                       disabled={works.length === 1}
//                     >
//                       ×
//                     </CButton>
//                   </CCol>
//                 </CRow>
//               ))} */}




//                   {/* {works.map((w, idx) => (
//   <CRow className="g-3 mb-3 align-items-end" key={idx}>
//     <CCol md={2}>
//       <CFormLabel>Work Type *</CFormLabel>
//       <CFormInput
//         placeholder="Work Type"
//         value={w.work_type}
//         onChange={(e) => handleWorkChange(idx, 'work_type', e.target.value)}
//         required
//       />
//     </CCol>
//     <CCol md={1}>
//        <CFormLabel>UOM</CFormLabel>
//       <CFormInput
//         placeholder="Unit"
//         value={w.uom}
//         onChange={(e) => handleWorkChange(idx, 'uom', e.target.value)}
//       />
//     </CCol>
//     <CCol md={1}>
//        <CFormLabel>Qty</CFormLabel>
//       <CFormInput
//         type="number"
//         placeholder="Qty"
//         step="0.01"
//         min="0"
//         value={w.qty}
//         onChange={(e) => handleWorkChange(idx, 'qty', e.target.value)}
//         required
//       />
//     </CCol>
//     <CCol md={1}>
//       <CFormLabel>Rate</CFormLabel>
//       <CInputGroup>
//         <CInputGroupText>₹</CInputGroupText>
//         <CFormInput
//           type="number"
//           step="0.01"
//           min="0"
//           value={w.price}
//           onChange={(e) => handleWorkChange(idx, 'price', e.target.value)}
//           required
//         />
//       </CInputGroup>
//     </CCol>
//     <CCol md={1}>
//       <CFormLabel>Base Amt</CFormLabel>
//       <div className="fw-medium">₹{(w.qty * w.price).toFixed(2)}</div>
//     </CCol>
//     <CCol md={1}>
//       <CFormInput
//         label="GST %"
//         type="number"
//         step="0.01"
//         min="0"
//         max="100"
//         value={w.gst_percent}
//         onChange={(e) => handleWorkChange(idx, 'gst_percent', e.target.value)}
//       />
//     </CCol>
//     <CCol md={1}>
//       <CFormLabel>CGST</CFormLabel>
//       <div className="text-success fw-medium">₹{w.cgst_amount.toFixed(2)}</div>
//     </CCol>
//     <CCol md={1}>
//       <CFormLabel>SGST</CFormLabel>
//       <div className="text-success fw-medium">₹{w.sgst_amount.toFixed(2)}</div>
//     </CCol>
//     <CCol md={1}>
//       <CFormLabel className="text-primary">Total</CFormLabel>
//       <div className="fw-bold text-primary">₹{w.total_price.toFixed(2)}</div>
//     </CCol>
//     <CCol md={1}>
//       <CFormInput
//         placeholder="Remark"
//         value={w.remark}
//         onChange={(e) => handleWorkChange(idx, 'remark', e.target.value)}
//       />
//     </CCol>
//     <CCol md={1} className="d-flex align-items-end">
//       <CButton
//         color="danger"
//         size="sm"
//         className="w-100"
//         onClick={() => removeWorkRow(idx)}
//         disabled={works.length === 1}
//       >
//         ×
//       </CButton>
//     </CCol>
//   </CRow>
// ))} */}

//               {/* <CButton
//                 color="warning"
//                 variant="outline"
//                 className="mb-4"
//                 onClick={addWorkRow}
//               >
//                 + Add Work
//               </CButton> */}

//               <h6 className="mt-4 mb-3 fw-semibold text-primary border-bottom border-primary pb-2">
//   Work Details
// </h6>

// {works.map((w, idx) => (
//   <div key={idx} className="border rounded p-3 mb-3 bg-light">
//     {/* First Row */}
//     <CRow className="g-3 mb-2 align-items-end">
//       <CCol md={3}>
//         <CFormInput
//           label="Work Type *"
//           placeholder="Work Type"
//           value={w.work_type}
//           onChange={(e) => handleWorkChange(idx, 'work_type', e.target.value)}
//           required
//         />
//       </CCol>

//       <CCol md={2}>
//         <CFormInput
//           label="UOM"
//           placeholder="Unit"
//           value={w.uom}
//           onChange={(e) => handleWorkChange(idx, 'uom', e.target.value)}
//         />
//       </CCol>



//       <CCol md={2}>
//      {/*    <CFormInput
//           label="Qty *"
//           type="number"
//           placeholder="Qty"
//           step="0.01"
//           min="0"
//           value={w.qty}
//           onChange={(e) => handleWorkChange(idx, 'qty', e.target.value)}
//           required
//         /> */}


// <CFormLabel>
//           Qty <span className="text-danger fw-bold">*</span>
//           <small className="text-danger d-block mt-1" style={{ lineHeight: '1.3' }}>
//             Total in Work Order: <strong>{Number(w.original_qty)}</strong><br />
//             Already billed (previous PIs): <strong>{w.used_qty}</strong><br />
//             <strong style={{ fontSize: '1.05em' }}>
//               Remaining allowed: {(w.original_qty - w.used_qty)}
//             </strong>
//           </small>
//         </CFormLabel>

//           <CFormInput
//             type="number"
//             step="0.01"
//             min="0"
//             max={Math.max(0, w.original_qty - w.used_qty)}
//             value={w.qty === 0 ? '' : w.qty}   // ← जेव्हा 0 असेल तेव्हा empty string दाखव
//             onChange={(e) => {
//               const inputVal = e.target.value;
              
//               // जर user ने पूर्ण रिकामा केला तर 0 सेट कर
//               if (inputVal === '') {
//                 handleWorkChange(idx, 'qty', 0);
//                 return;
//               }
        
//               // इतर वेळी नेहमी number म्हणून हँडल
//               const newVal = Number(inputVal);
//               if (!isNaN(newVal)) {
//                 handleWorkChange(idx, 'qty', newVal);
//               }
//             }}
//             required
//             placeholder="0.00"  // ← optional: placeholder लावल्याने कळतं की empty आहे
//           />

//       </CCol> 

        

//       <CCol md={2}>
//         <CFormLabel>Rate *</CFormLabel>
//         <CInputGroup>
//           <CInputGroupText>₹</CInputGroupText>
//           <CFormInput
//             type="number"
//             step="0.01"
//             min="0"
//             value={w.price}
//             onChange={(e) => handleWorkChange(idx, 'price', e.target.value)}
//             required
//             readOnly
//             disabled
//           />
//         </CInputGroup>
//       </CCol>

//       <CCol md={2}>
//         <CFormLabel>Base Amount</CFormLabel>
//         <div className="fw-medium">₹{(w.qty * w.price).toFixed(2)}</div>
//       </CCol>

//       <CCol md={1} className="d-flex align-items-end">
//         <CButton
//           color="danger"
//           size="sm"
//           onClick={() => removeWorkRow(idx)}
//           disabled={works.length === 1}
//         >
//           ×
//         </CButton>
//       </CCol>
//     </CRow>

//     {/* Second Row */}
//     <CRow className="g-3 align-items-end">
//       <CCol md={2}>
//         <CFormInput
//           label="GST %"
//           type="number"
//           step="0.01"
//           min="0"
//           max="100"
//           value={w.gst_percent}
//           onChange={(e) => handleWorkChange(idx, 'gst_percent', e.target.value)}
//           readOnly
//             disabled
//         />
//       </CCol>

//       <CCol md={2}>
//         <CFormLabel>CGST</CFormLabel>
//         <div className="text-success fw-medium">₹{w.cgst_amount.toFixed(2)}</div>
//       </CCol>

//       <CCol md={2}>
//         <CFormLabel>SGST</CFormLabel>
//         <div className="text-success fw-medium">₹{w.sgst_amount.toFixed(2)}</div>
//       </CCol>

//       <CCol md={2}>
//         <CFormLabel className="text-primary">Total (with GST)</CFormLabel>
//         <div className="fw-bold text-primary">₹{w.total_price.toFixed(2)}</div>
//       </CCol>

//       <CCol md={4}>
//         <CFormInput
//           label="Remark"
//           placeholder="Remark"
//           value={w.remark}
//           onChange={(e) => handleWorkChange(idx, 'remark', e.target.value)}
//         />
//       </CCol>
//     </CRow>
//   </div>
// ))}

// {/* <CButton
//   color="warning"
//   variant="outline"
//   className="mb-4"
//   onClick={addWorkRow}
// >
//   + Add Work
// </CButton> */}

//  <h6 className="mt-4 mb-3 fw-semibold text-primary border-bottom border-primary pb-2">
//  Calculations 
// </h6>


//               {/* GST Details */}
//              {/* <h6 className="mt-4 mb-3 fw-semibold text-primary border-bottom border-primary pb-2">
//                 GST Details
//               </h6>
//               <CRow className="mb-3">
//                 <CCol md={3}>
//                   <CFormLabel>Total GST (%)</CFormLabel>
//                   <CInputGroup>
//                     <CFormInput
//                       type="number"
//                       name="gstPercentage"
//                       value={form.gstPercentage}
//                       onChange={handleFormChange}
//                       min="0"
//                       max="100"
//                       step="0.01"
//                     />
//                     <CInputGroupText>%</CInputGroupText>
//                   </CInputGroup>
//                   <small className="text-muted">Amount: ₹{form.gstAmount.toFixed(2)}</small>
//                 </CCol>
//                 <CCol md={3}>
//                   <CFormLabel>SGST (%)</CFormLabel>
//                   <CInputGroup>
//                     <CFormInput
//                       type="number"
//                       name="sgstPercentage"
//                       value={form.sgstPercentage}
//                       onChange={handleFormChange}
//                       min="0"
//                       max="50"
//                       step="0.01"
//                     />
//                     <CInputGroupText>%</CInputGroupText>
//                   </CInputGroup>
//                   <small className="text-muted">Amount: ₹{form.sgstAmount.toFixed(2)}</small>
//                 </CCol>
//                 <CCol md={3}>
//                   <CFormLabel>CGST (%)</CFormLabel>
//                   <CInputGroup>
//                     <CFormInput
//                       type="number"
//                       name="cgstPercentage"
//                       value={form.cgstPercentage}
//                       onChange={handleFormChange}
//                       min="0"
//                       max="50"
//                       step="0.01"
//                     />
//                     <CInputGroupText>%</CInputGroupText>
//                   </CInputGroup>
//                   <small className="text-muted">Amount: ₹{form.cgstAmount.toFixed(2)}</small>
//                 </CCol>
//                 <CCol md={3}>
//                   <CFormLabel>IGST (%)</CFormLabel>
//                   <CInputGroup>
//                     <CFormInput
//                       type="number"
//                       name="igstPercentage"
//                       value={form.igstPercentage}
//                       onChange={handleFormChange}
//                       min="0"
//                       max="100"
//                       step="0.01"
//                     />
//                     <CInputGroupText>%</CInputGroupText>
//                   </CInputGroup>
//                   <small className="text-muted">Amount: ₹{form.igstAmount.toFixed(2)}</small>
//                 </CCol>
//               </CRow> */}

//               {/* Financial Summary */}
//               <CRow className="mb-3">
//                 <CCol md={3}>
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
  const [workOrderData, setWorkOrderData] = useState(null)
  const [previousProformas, setPreviousProformas] = useState([])

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

  const [works, setWorks] = useState([
    { work_type: '', uom: '', qty: 0, price: 0, total_price: 0, remark: '' },
  ])


  console.log(works);


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

  // Fetch all data on mount
  useEffect(() => {
    fetchProformaInvoice()
    fetchRules()
  }, [id])

  // Fetch work order when proforma data is loaded
  // useEffect(() => {
  //   if (proformaData?.work_order_id) {
  //     fetchWorkOrder(proformaData.work_order_id)
  //     fetchPreviousProformas(proformaData.work_order_id)
  //   }
  // }, [proformaData?.work_order_id])

  useEffect(() => {
  if (!proformaData?.work_order_id) return

  // 🔥 correct order fetch
  getAPICall(`/api/order/${proformaData.work_order_id}`)
    .then(res => setWorkOrderData(res))

  // 🔥 correct previous PI fetch
  fetchPreviousProformas(proformaData.work_order_id)
}, [proformaData])


 

  const fetchProformaInvoice = async () => {
    try {
      setLoading(true)
      const response = await getAPICall(`/api/proforma-invoices/${id}`)
      
      if (response && response.success && response.data) {
        const data = response.data
        setProformaData(data)

        // Set basic form data
        const gstPercentage = parseFloat(data.gst_percentage) || 0
        const sgstPercentage = parseFloat(data.sgst_percentage) || 0
        const cgstPercentage = parseFloat(data.cgst_percentage) || 0
        const igstPercentage = parseFloat(data.igst_percentage) || 0
        
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
          gstPercentage: gstPercentage,
          sgstPercentage: sgstPercentage,
          cgstPercentage: cgstPercentage,
          igstPercentage: igstPercentage,
          notes: data.notes || '',
          status: data.status || 'draft',
          terms_conditions: data.terms_conditions || '',
          payment_terms: data.payment_terms || '',
        })

        // Set initial works (will be recalculated with limits later)
        if (data.details && data.details.length > 0) {
          const mappedWorks = data.details.map(item => ({
            id: item.id,
            work_type: item.work_type || '',
            uom: item.uom || '',
            qty: parseFloat(item.qty) || 0,
            price: parseFloat(item.price) || 0,
            total_price: parseFloat(item.total_price) || 0,
            gst_percent: parseFloat(item.gst_percent) || 0,
            cgst_amount: parseFloat(item.cgst_amount) || 0,
            sgst_amount: parseFloat(item.sgst_amount) || 0,
            remark: item.remark || '',
            original_qty: 0,
            used_qty: 0,
          })).sort((a, b) => (a.id || 0) - (b.id || 0))
          
          setWorks(mappedWorks)
        }

        // Set payment terms
        if (data.payment_terms) {
          const terms = data.payment_terms.split('\n').filter(term => term.trim() !== '')
          setPaymentTerms(terms.length > 0 ? terms : [])
        }

        // Set terms and conditions
        if (data.terms_conditions) {
          const conditions = data.terms_conditions.split('\n').filter(term => term.trim() !== '')
          setTermsAndConditions(conditions.length > 0 ? conditions : [])
        }

        // Set selected rules
        if (data.invoice_rules && data.invoice_rules.length > 0) {
          setSelectedRules(data.invoice_rules.map(ir => ir.rules_id))
        }
      } else {
        showToast('danger', 'Failed to load proforma invoice')
        setTimeout(() => navigate('/invoiceTable'), 2000)
      }
    } catch (error) {
      console.error('Error fetching proforma invoice:', error)
      showToast('danger', 'Failed to load proforma invoice')
      setTimeout(() => navigate('/invoiceTable'), 2000)
    } finally {
      setLoading(false)
    }
  }





useEffect(() => {
  if (!workOrderData?.items || !proformaData) return

  const normalize = v => (v || '').trim().toLowerCase()

  const updatedWorks = workOrderData.items.map(item => {
    const key = normalize(item.work_type)
    
    // ← इथे Number() आवश्यक आहे! string → number करा
    const originalQty = Number(item.qty) || 0   // यामुळे 1000.00 येईल

    let usedQty = 0
    previousProformas.forEach(p => {
      p.details?.forEach(d => {
        if (normalize(d.work_type) === key) {
          usedQty += Number(d.qty) || 0
        }
      })
    })

    const currentDetail = proformaData.details.find(
      d => normalize(d.work_type) === key
    )

    const currentQty = currentDetail ? Number(currentDetail.qty) : 0

    return {
      id: currentDetail?.id,
      work_type: item.work_type || '',
      uom: item.uom || '',
      qty: currentQty,
      price: currentDetail ? Number(currentDetail.price) : Number(item.price) || 0,
      gst_percent: currentDetail ? Number(currentDetail.gst_percent) : 18,
      cgst_amount: currentDetail ? Number(currentDetail.cgst_amount) : 0,
      sgst_amount: currentDetail ? Number(currentDetail.sgst_amount) : 0,
      total_price: currentDetail ? Number(currentDetail.total_price) : 0,
      remark: currentDetail?.remark || '',
      original_qty: originalQty,   // ← आता हे number असेल
      used_qty: usedQty,
    }
  })

  console.log("Corrected Works (with real quantities):", updatedWorks)
  setWorks(updatedWorks)
}, [workOrderData, previousProformas, proformaData])

  console.log(previousProformas);












  const fetchWorkOrder = async (workOrderId) => {
    try {
      const response = await getAPICall(`/api/order/${proformaData.work_order_id}`)
      if (response && response.success && response.data) {
        setWorkOrderData(response.data)
      }
    } catch (error) {
      console.error('Error fetching work order:', error)
    }
  }

  // const fetchPreviousProformas = async (workOrderId) => {
  //   try {
  //     const response = await getAPICall(`/api/proforma-invoices?work_order_id=${workOrderId}`)
  //     // Filter out current proforma to get only previous ones
  //     const allProformas = response?.data?.data || []
  //     const previous = allProformas.filter(p => p.id !== parseInt(id))
  //     setPreviousProformas(previous)
  //   } catch (error) {
  //     console.error('Error fetching previous proformas:', error)
  //     setPreviousProformas([])
  //   }
  // }


const fetchPreviousProformas = async (workOrderId) => {
  try {
    const res = await getAPICall(
      `/api/proforma-invoices?work_order_id=${workOrderId}`
    )

    const list = res?.data?.data || []

    // remove current proforma
    const filtered = list.filter(p => p.id !== Number(id))

    setPreviousProformas(filtered)
  } catch (e) {
    console.error(e)
    setPreviousProformas([])
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
        calculateTotals(works, newForm)
      }

      return newForm
    })
  }

  const recalcRow = (index, rows = works) => {
    const updated = [...rows]
    const w = updated[index]

    const base = (w.qty || 0) * (w.price || 0)
    const half = (w.gst_percent || 0) / 2

    w.cgst_amount = Math.round((base * half / 100) * 100) / 100
    w.sgst_amount = Math.round((base * half / 100) * 100) / 100
    w.total_price = Math.round((base + w.cgst_amount + w.sgst_amount) * 100) / 100

    setWorks(updated)
    calculateTotals(updated)
  }







  // const handleWorkChange = (index, field, value) => {
  //   const updated = [...works]

  //   if (field === 'qty') {
  //     const max = updated[index].original_qty 
  //       ? updated[index].original_qty - updated[index].used_qty 
  //       : Infinity
      
  //     updated[index].qty = Math.max(0, Math.min(Number(value) || 0, max))
  //   } else if (field === 'price' || field === 'gst_percent') {
  //     updated[index][field] = value === "" || value === null || value === undefined 
  //       ? 0 
  //       : parseFloat(value) || 0
  //   } else {
  //     updated[index][field] = value
  //   }

  //   setWorks(updated)
  //   recalcRow(index, updated)
  // }






const handleWorkChange = (index, field, value) => {
  const updated = [...works]

  if (field === 'qty') {
    const maxAllowed = updated[index].original_qty - updated[index].used_qty

    let newVal = Number(value) || 0

    // जर जास्त टाकण्याचा प्रयत्न केला तर
    if (newVal > maxAllowed && maxAllowed >= 0) {
      newVal = maxAllowed
      showToast(
        'danger',
        `You can bill maximum ${maxAllowed.toFixed(2)} more (remaining quantity)`,
        4500
      )
    }

    updated[index].qty = Math.max(0, newVal)
  } else if (field === 'price' || field === 'gst_percent') {
    updated[index][field] = Number(value) || 0
  } else {
    updated[index][field] = value
  }

  setWorks(updated)
  recalcRow(index, updated)
}









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
        cgst_amount: 9,
        sgst_amount: 9,
        remark: '',
        original_qty: 0,
        used_qty: 0,
      }
    ])
  }

  const removeWorkRow = (index) => {
    if (works.length === 1) return
    const updated = [...works]
    updated.splice(index, 1)
    setWorks(updated)
    calculateTotals(updated)
  }

  const calculateTotals = (rows = works, formData = form) => {
    const taxable = rows.reduce((s, w) => s + (w.qty || 0) * (w.price || 0), 0)
    const cgst = rows.reduce((s, w) => s + (w.cgst_amount || 0), 0)
    const sgst = rows.reduce((s, w) => s + (w.sgst_amount || 0), 0)

    setForm(prev => ({
      ...prev,
      subtotal: Math.round(taxable * 100) / 100,
      taxableAmount: Math.round(taxable * 100) / 100,
      cgstAmount: Math.round(cgst * 100) / 100,
      sgstAmount: Math.round(sgst * 100) / 100,
      gstAmount: Math.round((cgst + sgst) * 100) / 100,
      finalAmount: Math.round((taxable + cgst + sgst - (formData.discount || 0)) * 100) / 100
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const formElement = e.currentTarget

    if (!formElement.checkValidity()) {
      setValidated(true)
      return
    }

    try {
      setSaving(true)

      const data = {
        tally_invoice_number: form.tally_invoice_number || null,
        invoice_date: form.invoice_date,
        delivery_date: form.delivery_date || null,
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
        showToast('danger', resp.message || 'Failed to update proforma invoice', 8000)
      }
    } catch (error) {
      console.error('Update error:', error)
      const errorMessage = error.message || 'Failed to update proforma invoice'
      showToast('danger', errorMessage, 8000)
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
                  <div className="small text-muted">Type: {proformaData.project?.project_type?.name}</div>
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

                    <CCol md={2}>
                      {/* <CFormLabel>
                        Qty *
                        {w.original_qty > 0 && (
                          <small className="text-danger d-block mt-1">
                            Billed: {w.used_qty.toFixed(2)} of {w.original_qty.toFixed(2)}
                          </small>
                        )}
                      </CFormLabel> */}





                      {/* <CFormInput
                        type="number"
                        step="0.01"
                        min="0"
                        max={w.original_qty ? w.original_qty - w.used_qty : undefined}
                        value={w.qty}
                        onChange={(e) => handleWorkChange(idx, 'qty', e.target.value)}
                        required
                      /> */}

        
  <CFormLabel>
    Qty <span className="text-danger fw-bold">*</span>
    <small className="text-danger d-block mt-1" style={{ lineHeight: '1.3' }}>
      Total in Work Order: <strong>{Number(w.original_qty).toFixed(2)}</strong><br />
      Already billed (previous PIs): <strong>{w.used_qty.toFixed(2)}</strong><br />
      <strong style={{ fontSize: '1.05em' }}>
        Remaining allowed: {(w.original_qty - w.used_qty).toFixed(2)}
      </strong>
    </small>
  </CFormLabel>

  {/* <CFormInput
    type="number"
    step="0.01"
    min="0"
    max={w.original_qty - w.used_qty}   // ← ब्राउझर लेव्हल रोक
    value={w.qty}
    onChange={(e) => handleWorkChange(idx, 'qty', e.target.value)}
    required
  /> */}

  <CFormInput
    type="number"
    step="0.01"
    min="0"
    max={Math.max(0, w.original_qty - w.used_qty)}
    value={w.qty === 0 ? '' : w.qty}   // ← जेव्हा 0 असेल तेव्हा empty string दाखव
    onChange={(e) => {
      const inputVal = e.target.value;
      
      // जर user ने पूर्ण रिकामा केला तर 0 सेट कर
      if (inputVal === '') {
        handleWorkChange(idx, 'qty', 0);
        return;
      }

      // इतर वेळी नेहमी number म्हणून हँडल
      const newVal = Number(inputVal);
      if (!isNaN(newVal)) {
        handleWorkChange(idx, 'qty', newVal);
      }
    }}
    required
    placeholder="0.00"  // ← optional: placeholder लावल्याने कळतं की empty आहे
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


              {/* Financial Summary */}
              <CRow className="mb-3">
                <CCol md={3}>
                  <CFormLabel>Total Amount before GST</CFormLabel>
                  <CInputGroup>
                    <CInputGroupText>₹</CInputGroupText>
                    <CFormInput type="number" value={form.subtotal} readOnly />
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
                       readOnly
                          disabled
                    />
                  </CInputGroup>
                </CCol>
                <CCol md={3}>
                  <CFormLabel>Total Amount after GST</CFormLabel>
                  <CInputGroup>
                    <CInputGroupText>₹</CInputGroupText>
                    <CFormInput
                      type="number"
                      value={form.finalAmount}
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