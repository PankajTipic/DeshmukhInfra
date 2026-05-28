


// import React, { useState, useEffect } from 'react'
// import {
//   CModal,
//   CModalHeader,
//   CModalTitle,
//   CModalBody,
//   CModalFooter,
//   CButton,
//   CRow,
//   CCol,
//   CSpinner,
//   CAlert,
//   CBadge,
//   CFormInput,
//   CFormLabel,
//   CFormSelect,
//   CFormTextarea,
// } from '@coreui/react'
// import { getAPICall, postAPICall } from '../../../util/api'
// import CIcon from '@coreui/icons-react'
// import { cilHistory, cilCreditCard, cilCalendar, cilX, cilPencil } from '@coreui/icons'

// const SubcontractPaymentModal = ({
//   visible,
//   onClose,
//   subcontractData,
//   onPaymentUpdated
// }) => {
//   const [subcontract, setSubcontract] = useState(null)
//   const [payments, setPayments] = useState([])
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState('')

//   const [showPaymentForm, setShowPaymentForm] = useState(false)
//   const [editingPayment, setEditingPayment] = useState(null)   // ← For Edit

//   const [formData, setFormData] = useState({
//     amount: '',
//     payment_type: 'partial',
//     paid_by: '',
//     payment_date: new Date().toISOString().split('T')[0],
//     description: ''
//   })

//   const [submitting, setSubmitting] = useState(false)

//   useEffect(() => {
//     if (visible && subcontractData) {
//       loadSubcontractData()
//     }
//   }, [visible, subcontractData])

//   const loadSubcontractData = async () => {
//     setLoading(true)
//     setError('')

//     try {
//       const res = await getAPICall(`/api/subcontract-vendor/${subcontractData.subcontract.id}`)
//       setSubcontract(res.data || res)

//       const logsRes = await getAPICall(`/api/subcontract-vendor/${subcontractData.subcontract.id}/payments`)
//       setPayments(logsRes.data || [])
//     } catch (err) {
//       setError('Failed to load subcontract details')
//       console.error(err)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const openAddForm = () => {
//     setEditingPayment(null)
//     setFormData({
//       amount: '',
//       payment_type: 'partial',
//       paid_by: '',
//       payment_date: new Date().toISOString().split('T')[0],
//       description: ''
//     })
//     setShowPaymentForm(true)
//   }

//   const openEditForm = (payment) => {
//     setEditingPayment(payment)
//     setFormData({
//       amount: payment.amount,
//       payment_type: payment.payment_type,
//       paid_by: payment.paid_by,
//       payment_date: payment.payment_date,
//       description: payment.description || ''
//     })
//     setShowPaymentForm(true)
//   }

//   const handleInputChange = (e) => {
//     const { name, value } = e.target
//     setFormData(prev => ({ ...prev, [name]: value }))
//   }

//   const handleSavePayment = async () => {
//     if (!formData.amount || !formData.paid_by) {
//       alert("Amount and Paid By are required")
//       return
//     }

//     setSubmitting(true)
//     try {
//       if (editingPayment) {
//         // Edit Existing Payment
//         await postAPICall(`/api/subcontract-vendor/payment/${editingPayment.id}`, formData)
//         alert('Payment updated successfully!')
//       } else {
//         // Add New Payment
//         await postAPICall(`/api/subcontract-vendor/${subcontract.id}/record-payment`, formData)
//         alert('Payment recorded successfully!')
//       }

//       setShowPaymentForm(false)
//       loadSubcontractData()
//       if (onPaymentUpdated) onPaymentUpdated()
//     } catch (err) {
//       alert(err.response?.data?.message || 'Failed to save payment')
//     } finally {
//       setSubmitting(false)
//     }
//   }

//   if (!subcontractData) return null

//   return (
//     <CModal visible={visible} onClose={onClose} size="lg" backdrop="static">
//       <CModalHeader>
//         <CModalTitle>
//           Subcontract Payment - {subcontractData.order?.project?.project_name}
//         </CModalTitle>
//       </CModalHeader>

//       <CModalBody>
//         {loading ? <div className="text-center py-5"><CSpinner /></div> : error ? (
//           <CAlert color="danger">{error}</CAlert>
//         ) : subcontract ? (
//           <>
//             <div className="bg-light p-3 rounded mb-4">
//               <CRow>
//                 <CCol md={4}><strong>Total:</strong><br />₹{parseFloat(subcontract.total_amount).toLocaleString('en-IN')}</CCol>
//                 <CCol md={4}><strong>Paid:</strong><br /><span className="text-success">₹{parseFloat(subcontract.paid_amount).toLocaleString('en-IN')}</span></CCol>
//                 <CCol md={4}><strong>Pending:</strong><br /><span className="text-danger">₹{parseFloat(subcontract.pending_amount).toLocaleString('en-IN')}</span></CCol>
//               </CRow>
//             </div>

//             <CButton color="success" onClick={openAddForm} className="mb-3">
//               <CIcon icon={cilCreditCard} className="me-2" />
//               Record New Payment
//             </CButton>

//             {/* Payment Form */}
//             {showPaymentForm && (
//               <div className="border p-3 rounded mb-4 bg-light">
//                 <h6>{editingPayment ? 'Edit Payment' : 'Record New Payment'}</h6>
//                 {/* Form Fields - Same as before */}
//                 <CRow className="g-3">
//                   <CCol md={6}>
//                     <CFormLabel>Amount (₹)</CFormLabel>
//                     <CFormInput type="number" name="amount" value={formData.amount} onChange={handleInputChange} />
//                   </CCol>
//                   <CCol md={6}>
//                     <CFormLabel>Payment Type</CFormLabel>
//                     <CFormSelect name="payment_type" value={formData.payment_type} onChange={handleInputChange}>
//                       <option value="partial">Partial</option>
//                       <option value="final">Final</option>
//                       <option value="advance">Advance</option>
//                       <option value="retention">Retention</option>
//                     </CFormSelect>
//                   </CCol>
//                   <CCol md={6}>
//                     <CFormLabel>Paid By</CFormLabel>
//                     <CFormInput name="paid_by" value={formData.paid_by} onChange={handleInputChange} />
//                   </CCol>
//                   <CCol md={6}>
//                     <CFormLabel>Payment Date</CFormLabel>
//                     <CFormInput type="date" name="payment_date" value={formData.payment_date} onChange={handleInputChange} />
//                   </CCol>
//                   <CCol md={12}>
//                     <CFormLabel>Description</CFormLabel>
//                     <CFormTextarea name="description" value={formData.description} onChange={handleInputChange} rows={2} />
//                   </CCol>
//                 </CRow>

//                 <div className="mt-3">
//                   <CButton color="primary" onClick={handleSavePayment} disabled={submitting}>
//                     {submitting ? <CSpinner size="sm" /> : editingPayment ? 'Update Payment' : 'Save Payment'}
//                   </CButton>
//                   <CButton color="secondary" className="ms-2" onClick={() => setShowPaymentForm(false)}>
//                     Cancel
//                   </CButton>
//                 </div>
//               </div>
//             )}

//             {/* Payment History */}
//             <h6 className="mb-3">Payment History</h6>
//             {payments.length > 0 ? (
//               <div className="table-responsive">
//                 <table className="table table-bordered table-sm">
//                   <thead className="table-light">
//                     <tr>
//                       <th>Date</th>
//                       <th>Amount</th>
//                       <th>Type</th>
//                       <th>Paid By</th>
//                       <th>Description</th>
//                       <th>Action</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {payments.map((p) => (
//                       <tr key={p.id}>
//                         <td>{new Date(p.payment_date).toLocaleDateString('en-IN')}</td>
//                         <td className="text-success fw-bold">₹{parseFloat(p.amount).toLocaleString('en-IN')}</td>
//                         <td><CBadge color="info">{p.payment_type}</CBadge></td>
//                         <td>{p.paid_by}</td>
//                         <td>{p.description || '-'}</td>
//                         <td>
//                           <CButton color="warning" size="sm" onClick={() => openEditForm(p)}>
//                             <CIcon icon={cilPencil} />
//                           </CButton>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             ) : (
//               <p className="text-muted">No payments recorded yet.</p>
//             )}
//           </>
//         ) : null}
//       </CModalBody>

//       <CModalFooter>
//         <CButton color="secondary" onClick={onClose}>Close</CButton>
//       </CModalFooter>
//     </CModal>
//   )
// }

// export default SubcontractPaymentModal








import React, { useState, useEffect } from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CRow,
  CCol,
  CSpinner,
  CAlert,
  CBadge,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormTextarea,
} from '@coreui/react'
import { getAPICall, postAPICall } from '../../../util/api'
import CIcon from '@coreui/icons-react'
import { cilCreditCard, cilPencil, cilX } from '@coreui/icons'
import { paymentTypes, receiver_bank } from '../../../util/Feilds'
import { useToast } from '../../common/toast/ToastContext'

/* ─── Inline Styles ─────────────────────────────────────────────────────────── */
const styles = {
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '14px',
    marginBottom: '24px',
  },
  summaryCard: (variant) => {
    const map = {
      total:   { background: '#eff6ff', border: '1px solid #bfdbfe' },
      paid:    { background: '#f0fdf4', border: '1px solid #bbf7d0' },
      pending: { background: '#fff7ed', border: '1px solid #fed7aa' },
    }
    return {
      borderRadius: '12px',
      padding: '16px 18px',
      position: 'relative',
      overflow: 'hidden',
      ...map[variant],
    }
  },
  cardDot: (variant) => {
    const colors = { total: '#2563eb', paid: '#16a34a', pending: '#ea580c' }
    return {
      position: 'absolute',
      right: '-10px',
      top: '-10px',
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      background: colors[variant],
      opacity: 0.12,
    }
  },
  cardLabel: {
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
    color: '#6b7280',
    marginBottom: '6px',
  },
  cardValue: (variant) => {
    const colors = { total: '#1d4ed8', paid: '#15803d', pending: '#c2410c' }
    return {
      fontSize: '22px',
      fontWeight: 700,
      fontFamily: 'monospace',
      color: colors[variant],
    }
  },
  sectionHead: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '14px',
  },
  sectionTitle: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#111827',
  },
  formBox: {
    background: '#f8f9ff',
    border: '1px solid #e0e3ff',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '22px',
  },
  formTitle: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#4f46e5',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  fieldLabel: {
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: '#6b7280',
    marginBottom: '5px',
    display: 'block',
  },
  tableWrap: {
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    overflow: 'hidden',
  },
  th: {
    padding: '11px 14px',
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: '#6b7280',
    textAlign: 'left',
    background: '#f8f9ff',
    borderBottom: '1px solid #e5e7eb',
  },
  td: {
    padding: '11px 14px',
    color: '#374151',
    fontSize: '13px',
    borderBottom: '1px solid #f3f4f6',
    verticalAlign: 'middle',
  },
  tdAmount: {
    padding: '11px 14px',
    fontWeight: 700,
    color: '#15803d',
    fontFamily: 'monospace',
    fontSize: '13px',
    borderBottom: '1px solid #f3f4f6',
    verticalAlign: 'middle',
  },
  headerIcon: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '12px',
    flexShrink: 0,
  },
}

/* ─── Badge helper ───────────────────────────────────────────────────────────── */
const badgeColorMap = {
  partial:   'info',
  final:     'success',
  advance:   'warning',
  retention: 'secondary',
}

/* ─── Prevent negative / minus in number inputs ──────────────────────────────── */
const preventNegativeKeys = (e) => {
  if (['-', '+', 'e', 'E'].includes(e.key)) e.preventDefault()
}
const preventNegativeInput = (e) => {
  if (parseFloat(e.target.value) < 0 || e.target.value === '-') {
    e.target.value = ''
  }
}

/* ─── Component ──────────────────────────────────────────────────────────────── */
const SubcontractPaymentModal = ({
  visible,
  onClose,
  subcontractData,
  onPaymentUpdated,
}) => {
  const [subcontract, setSubcontract]       = useState(null)
  const [payments, setPayments]             = useState([])
  const [loading, setLoading]               = useState(false)
  const [error, setError]                   = useState('')
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [editingPayment, setEditingPayment] = useState(null)
  const [submitting, setSubmitting]         = useState(false)

  const [formData, setFormData] = useState({
    amount:       '',
    payment_type: 'partial',
    paid_by:      '',
    payment_date: new Date().toISOString().split('T')[0],
    description:  '',
  }) 

  const {showToast} = useToast();

  useEffect(() => {
    if (visible && subcontractData) loadSubcontractData()
  }, [visible, subcontractData])

  const loadSubcontractData = async () => {
    setLoading(true)
    setError('')
    try {
      const res     = await getAPICall(`/api/subcontract-vendor/${subcontractData.subcontract.id}`)
      setSubcontract(res.data || res)
      const logsRes = await getAPICall(`/api/subcontract-vendor/${subcontractData.subcontract.id}/payments`)
      setPayments(logsRes.data || [])
    } catch (err) {
      setError('Failed to load subcontract details')    
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const openAddForm = () => {
    setEditingPayment(null)
    setFormData({
      amount:       '',
      payment_type: 'partial',
      paid_by:      '',
      payment_date: new Date().toISOString().split('T')[0],
      description:  '',
    })
    setShowPaymentForm(true)
  }

  const openEditForm = (payment) => {
    setEditingPayment(payment)
    setFormData({
      amount:       payment.amount,
      payment_type: payment.payment_type,
      paid_by:      payment.paid_by,
      payment_date: payment.payment_date,
      description:  payment.description || '',
    })
    setShowPaymentForm(true)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAmountChange = (e) => {
    const value = e.target.value
    // Strip negative
    if (value === '' || parseFloat(value) >= 0) {
      setFormData(prev => ({ ...prev, amount: value }))
    }
  }

  const handleSavePayment = async () => {
    if (!formData.amount || !formData.paid_by) {
    //   alert('Amount and Paid By are required')
     showToast('danger', 'Amount and Paid By are required');
      return
    }
    if (parseFloat(formData.amount) <= 0) {
    //   alert('Amount must be greater than 0')
    showToast('info', 'Amount must be greater than 0');
      return
    }

    setSubmitting(true)
    try {
      if (editingPayment) {
        await postAPICall(`/api/subcontract-vendor/payment/${editingPayment.id}`, formData)
        // alert('Payment updated successfully!')
showToast('success', 'Payment updated successfully!');
      } else {
        await postAPICall(`/api/subcontract-vendor/${subcontract.id}/record-payment`, formData)
        // alert('Payment recorded successfully!')
        showToast('success', 'Payment recorded successfully!');
      }
      setShowPaymentForm(false)
      loadSubcontractData()
      if (onPaymentUpdated) onPaymentUpdated()
    } catch (err) {
    //   alert(err.response?.data?.message || 'Failed to save payment')
    showToast('danger', err.response?.data?.message || 'Failed to save payment');
    } finally {
      setSubmitting(false)
    }
  }

  if (!subcontractData) return null

  const fmt = (val) =>
    parseFloat(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })

  return (
//     <CModal visible={visible} onClose={onClose} size="lg" backdrop="static">
//       {/* ── Header ── */}
//       <CModalHeader style={{ borderBottom: '1px solid #f0f1f5', padding: '18px 24px' }}>
//         <div style={{ display: 'flex', alignItems: 'center' }}>
//           <div style={styles.headerIcon}>
//             <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2">
//               <rect x="2" y="5" width="20" height="14" rx="2" />
//               <path d="M2 10h20" />
//             </svg>
//           </div>
//           <div>
//             <CModalTitle style={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>
//               Subcontract Payment
//             </CModalTitle>
//             <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
//               {subcontractData.order?.project?.project_name || '—'}
//             </div>
//           </div>
//         </div>
//       </CModalHeader>

//       {/* ── Body ── */}
//       <CModalBody style={{ padding: '24px' }}>
//         {loading ? (
//           <div className="text-center py-5"><CSpinner /></div>
//         ) : error ? (
//           <CAlert color="danger">{error}</CAlert>
//         ) : subcontract ? (
//           <>




//           {/* ==================== NEW: Subcontract Details ==================== */}
//             <div style={styles.detailsBox}>
//               <div style={{ fontSize: '15px', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>
//                 Subcontract Details
//               </div>

//               <CRow className="g-3">
//                 <CCol md={6}>
//                   <div style={styles.detailRow}>
//                     <span style={styles.detailLabel}>Project Name</span>
//                     <span style={styles.detailValue}>{subcontract.project?.project_name || '—'}</span>
//                   </div>
//                 </CCol>
//                 <CCol md={6}>
//                   <div style={styles.detailRow}>
//                     <span style={styles.detailLabel}>Customer Name</span>
//                     <span style={styles.detailValue}>{subcontract.project?.customer_name || '—'}</span>
//                   </div>
//                 </CCol>
//                 <CCol md={6}>
//                   <div style={styles.detailRow}>
//                     <span style={styles.detailLabel}>Vendor Name</span>
//                     <span style={styles.detailValue}>{subcontract.operator?.name || '—'}</span>
//                   </div>
//                 </CCol>
//                 <CCol md={6}>
//                   <div style={styles.detailRow}>
//                     <span style={styles.detailLabel}>Order / Invoice No</span>
//                     <span style={styles.detailValue}>{subcontract.order?.invoice_number || '—'}</span>
//                   </div>
//                 </CCol>
//                 <CCol md={6}>
//                   <div style={styles.detailRow}>
//                     <span style={styles.detailLabel}>Work Place</span>
//                     <span style={styles.detailValue}>{subcontract.project?.work_place || '—'}</span>
//                   </div>
//                 </CCol>
               
//               </CRow>
//             </div>






//             {/* Summary Cards */}
//             <div style={styles.summaryGrid}>
//               {[
//                 { variant: 'total',   label: 'Total Amount', value: subcontract.total_amount },
//                 { variant: 'paid',    label: 'Paid',         value: subcontract.paid_amount  },
//                 { variant: 'pending', label: 'Pending',      value: subcontract.pending_amount },
//               ].map(({ variant, label, value }) => (
//                 <div key={variant} style={styles.summaryCard(variant)}>
//                   <div style={styles.cardDot(variant)} />
//                   <div style={styles.cardLabel}>{label}</div>
//                   <div style={styles.cardValue(variant)}>₹{fmt(value)}</div>
//                 </div>
//               ))}
//             </div>

//             {/* Section Head */}
//             <div style={styles.sectionHead}>
//               <div style={styles.sectionTitle}>Payment History</div>
//               <CButton
//                 onClick={openAddForm}
//                 style={{
//                   background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
//                   border: 'none',
//                   borderRadius: '9px',
//                   fontSize: '13px',
//                   fontWeight: 600,
//                   display: 'flex',
//                   alignItems: 'center',
//                   gap: '6px',
//                   padding: '8px 16px',
//                   color: '#fff',
//                   boxShadow: '0 2px 8px rgba(79,70,229,.3)',
//                 }}
//               >
//                 <CIcon icon={cilCreditCard} />
//                 Record New Payment
//               </CButton>
//             </div>

//             {/* Payment Form */}
//             {showPaymentForm && (
//               <div style={styles.formBox}>
//                 <div style={styles.formTitle}>
//                   <CIcon icon={editingPayment ? cilPencil : cilCreditCard} />
//                   {editingPayment ? 'Edit Payment' : 'Record New Payment'}
//                 </div>

//                 <CRow className="g-3">
//                   <CCol md={6}>
//                     <label style={styles.fieldLabel}>Amount (₹)</label>
//                     <CFormInput
//                       type="number"
//                       name="amount"
//                       value={formData.amount}
//                       min="0"
//                       step="0.01"
//                       placeholder="0.00"
//                       onChange={handleAmountChange}
//                       onKeyDown={preventNegativeKeys}
//                       onInput={preventNegativeInput}
//                     />
//                   </CCol>
//                   <CCol md={6}>
//                     <label style={styles.fieldLabel}>Payment Type</label>
//                     <CFormSelect
//                       name="payment_type"
//                       value={formData.payment_type}
//                       onChange={handleInputChange}
//                     >
//                       {paymentTypes.map((type) => (
//                                         <option key={type.value} value={type.value}>
//                                           {type.label}
//                                         </option>
//                                       ))}
//                     </CFormSelect>
//                   </CCol>
                  
//                   {/* <CCol md={6}>
//                     <label style={styles.fieldLabel}>Paid By</label>
//                     <CFormInput
//                       name="paid_by"
//                       value={formData.paid_by}
//                       placeholder="Enter name"
//                       onChange={handleInputChange}
//                     />
//                   </CCol> */}

//                   <CCol md={6}>
//   <label style={styles.fieldLabel}>Paid By</label>

//   <select
//     name="paid_by"
//     value={formData.paid_by}
//     onChange={handleInputChange}
//     className="form-select"
//   >
//     <option value="">Select Bank</option>

//     {receiver_bank.map((bank) => (
//       <option key={bank.value} value={bank.value}>
//         {bank.label}
//       </option>
//     ))}
//   </select>
// </CCol>


//                   <CCol md={6}>
//                     <label style={styles.fieldLabel}>Payment Date</label>
//                     <CFormInput
//                       type="date"
//                       name="payment_date"
//                       value={formData.payment_date}
//                       onChange={handleInputChange}
//                     />
//                   </CCol>
//                   <CCol md={12}>
//                     <label style={styles.fieldLabel}>Description</label>
//                     <CFormTextarea
//                       name="description"
//                       value={formData.description}
//                       onChange={handleInputChange}
//                       rows={2}
//                       placeholder="Optional note..."
//                     />
//                   </CCol>
//                 </CRow>

//                 <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
//                   <CButton
//                     color="primary"
//                     onClick={handleSavePayment}
//                     disabled={submitting}
//                     style={{ borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}
//                   >
//                     {submitting
//                       ? <CSpinner size="sm" />
//                       : editingPayment ? 'Update Payment' : 'Save Payment'}
//                   </CButton>
//                   <CButton
//                     color="secondary"
//                     variant="outline"
//                     onClick={() => setShowPaymentForm(false)}
//                     style={{ borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}
//                   >
//                     Cancel
//                   </CButton>
//                 </div>
//               </div>
//             )}

//             {/* Payment Table */}
//             {payments.length > 0 ? (
//               <div style={styles.tableWrap}>
//                 <table style={{ width: '100%', borderCollapse: 'collapse' }}>
//                   <thead>
//                     <tr>
//                       {['Date', 'Amount', 'Type', 'Paid By', 'Description', 'Action'].map(h => (
//                         <th key={h} style={styles.th}>{h}</th>
//                       ))}
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {payments.map((p, i) => (
//                       <tr
//                         key={p.id}
//                         style={{ background: i % 2 === 0 ? '#fff' : '#fafbff' }}
//                       >
//                         <td style={styles.td}>
//                           {new Date(p.payment_date).toLocaleDateString('en-IN')}
//                         </td>
//                         <td style={styles.tdAmount}>
//                           ₹{fmt(p.amount)}
//                         </td>
//                         <td style={styles.td}>
//                           <CBadge color={badgeColorMap[p.payment_type] || 'secondary'}>
//                             {p.payment_type}
//                           </CBadge>
//                         </td>
//                         <td style={styles.td}>{p.paid_by}</td>
//                         <td style={styles.td}>{p.description || '—'}</td>
//                         <td style={styles.td}>
//                           <CButton
//                             color="warning"
//                             variant="outline"
//                             size="sm"
//                             onClick={() => openEditForm(p)}
//                             style={{ borderRadius: '7px', padding: '4px 8px' }}
//                           >
//                             <CIcon icon={cilPencil} />
//                           </CButton>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             ) : (
//               <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af' }}>
//                 <div style={{ fontSize: '32px', marginBottom: '10px', opacity: 0.4 }}>💳</div>
//                 <div style={{ fontSize: '13px' }}>No payments recorded yet.</div>
//               </div>
//             )}
//           </>
//         ) : null}
//       </CModalBody>

//       {/* ── Footer ── */}
//       <CModalFooter style={{ borderTop: '1px solid #f0f1f5', padding: '14px 24px' }}>
//         <CButton
//           color="secondary"
//           variant="outline"
//           onClick={onClose}
//           style={{ borderRadius: '9px', fontSize: '13px', fontWeight: 600 }}
//         >
//           <CIcon icon={cilX} className="me-1" /> Close
//         </CButton>
//       </CModalFooter>
//     </CModal>

<CModal visible={visible} onClose={onClose} size="lg" backdrop="static">

  {/* ── Header ── */}
  <CModalHeader style={{ borderBottom: '1px solid #f0f1f5', padding: '18px 24px', background: '#fff' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{
        width: '40px', height: '40px', borderRadius: '10px',
        background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <path d="M2 10h20" />
        </svg>
      </div>
      <div>
        <CModalTitle style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0 }}>
          Subcontract Payment
        </CModalTitle>
        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
          {subcontractData.order?.project?.project_name || '—'}
        </div>
      </div>
    </div>
  </CModalHeader>

  {/* ── Body ── */}
  <CModalBody style={{ padding: '24px', background: '#f9fafb' }}>
    {loading ? (
      <div className="text-center py-5"><CSpinner /></div>
    ) : error ? (
      <CAlert color="danger">{error}</CAlert>
    ) : subcontract ? (
      <>
        {/* ── Subcontract Details Card ── */}
        <div style={{
          background: '#fff', borderRadius: '12px',
          border: '0.5px solid #e5e7eb', marginBottom: '16px', overflow: 'hidden',
        }}>
          {/* Card Header */}
          <div style={{
            padding: '12px 20px', borderBottom: '0.5px solid #f0f1f5',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <div style={{
              width: '30px', height: '30px', borderRadius: '8px',
              background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#7c3aed" strokeWidth="2">
                <path d="M9 12h6M9 16h6M7 4H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1" />
                <rect x="9" y="2" width="6" height="4" rx="1" />
              </svg>
            </div>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Subcontract Details</span>
          </div>

          {/* Detail Grid — label on top, value below, dividers between */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          }}>
            {[
              { label: 'Project Name',      value: subcontract.project?.project_name },
              { label: 'Customer Name',     value: subcontract.project?.customer_name },
              { label: 'Vendor Name',       value: subcontract.operator?.name },
              { label: 'Order / Invoice No',value: subcontract.order?.invoice_number },
              { label: 'Work Place',        value: subcontract.project?.work_place },
            ].map((item, i, arr) => {
              const row = Math.floor(i / 3);
              const col = i % 3;
              const totalRows = Math.ceil(arr.length / 3);
              const isLastRow = row === totalRows - 1;
              const isLastCol = col === 2 || i === arr.length - 1;
              return (
                <div key={i} style={{
                  padding: '14px 20px',
                  borderBottom: !isLastRow ? '0.5px solid #f0f1f5' : 'none',
                  borderRight: !isLastCol ? '0.5px solid #f0f1f5' : 'none',
                }}>
                  <div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>
                    {item.value || '—'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Summary Cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
          {[
            {
              variant: 'total', label: 'Total Amount', value: subcontract.total_amount,
              bg: '#ede9fe', color: '#6d28d9', dot: '#7c3aed', icon: '📋',
            },
            {
              variant: 'paid', label: 'Paid', value: subcontract.paid_amount,
              bg: '#d1fae5', color: '#065f46', dot: '#10b981', icon: '✅',
            },
            {
              variant: 'pending', label: 'Pending', value: subcontract.pending_amount,
              bg: '#fff7ed', color: '#92400e', dot: '#f59e0b', icon: '⏳',
            },
          ].map(({ variant, label, value, bg, color, dot, icon }) => (
            <div key={variant} style={{
              background: '#fff', borderRadius: '12px',
              border: '0.5px solid #e5e7eb', padding: '16px 20px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>{label}</span>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '8px',
                  background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px',
                }}>{icon}</div>
              </div>
              <div style={{ fontSize: '20px', fontWeight: 700, color }}>
                ₹{fmt(value)}
              </div>
              <div style={{
                marginTop: '8px', height: '3px', borderRadius: '99px',
                background: '#f3f4f6', overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%', borderRadius: '99px', background: dot,
                  width: variant === 'total' ? '100%'
                    : variant === 'paid' ? `${Math.min(100, (subcontract.paid_amount / (subcontract.total_amount || 1)) * 100)}%`
                    : `${Math.min(100, (subcontract.pending_amount / (subcontract.total_amount || 1)) * 100)}%`,
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* ── Section Header ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '12px',
        }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>Payment History</div>
          <CButton
            onClick={openAddForm}
            style={{
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              border: 'none', borderRadius: '9px', fontSize: '13px',
              fontWeight: 600, display: 'flex', alignItems: 'center',
              gap: '6px', padding: '8px 16px', color: '#fff',
              boxShadow: '0 2px 8px rgba(79,70,229,.3)',
            }}
          >
            <CIcon icon={cilCreditCard} />
            Record New Payment
          </CButton>
        </div>

        {/* ── Payment Form ── */}
        {showPaymentForm && (
          <div style={{
            background: '#fff', borderRadius: '12px',
            border: '0.5px solid #e5e7eb', padding: '20px', marginBottom: '16px',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '16px',
            }}>
              <CIcon icon={editingPayment ? cilPencil : cilCreditCard} />
              {editingPayment ? 'Edit Payment' : 'Record New Payment'}
            </div>

            <CRow className="g-3">
              <CCol md={6}>
                <label style={styles.fieldLabel}>Amount (₹)</label>
                <CFormInput
                  type="number" name="amount" value={formData.amount}
                  min="0" step="0.01" placeholder="0.00"
                  onChange={handleAmountChange}
                  onKeyDown={preventNegativeKeys}
                  onInput={preventNegativeInput}
                />
              </CCol>
              <CCol md={6}>
                <label style={styles.fieldLabel}>Payment Type</label>
                <CFormSelect name="payment_type" value={formData.payment_type} onChange={handleInputChange}>
                  {paymentTypes.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={6}>
                <label style={styles.fieldLabel}>Paid By</label>
                <select name="paid_by" value={formData.paid_by} onChange={handleInputChange} className="form-select">
                  <option value="">Select Bank</option>
                  {receiver_bank.map((bank) => (
                    <option key={bank.value} value={bank.value}>{bank.label}</option>
                  ))}
                </select>
              </CCol>
              <CCol md={6}>
                <label style={styles.fieldLabel}>Payment Date</label>
                <CFormInput type="date" name="payment_date" value={formData.payment_date} onChange={handleInputChange} />
              </CCol>
              <CCol md={12}>
                <label style={styles.fieldLabel}>Description</label>
                <CFormTextarea
                  name="description" value={formData.description}
                  onChange={handleInputChange} rows={2} placeholder="Optional note..."
                />
              </CCol>
            </CRow>

            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <CButton
                color="primary" onClick={handleSavePayment} disabled={submitting}
                style={{ borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}
              >
                {submitting ? <CSpinner size="sm" /> : editingPayment ? 'Update Payment' : 'Save Payment'}
              </CButton>
              <CButton
                color="secondary" variant="outline"
                onClick={() => setShowPaymentForm(false)}
                style={{ borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}
              >
                Cancel
              </CButton>
            </div>
          </div>
        )}

        {/* ── Payment Table ── */}
        {payments.length > 0 ? (
          <div style={{
            background: '#fff', borderRadius: '12px',
            border: '0.5px solid #e5e7eb', overflow: 'hidden',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '0.5px solid #e5e7eb' }}>
                  {['Date', 'Amount', 'Type', 'Paid By', 'Description', 'Action'].map(h => (
                    <th key={h} style={{
                      padding: '10px 16px', textAlign: 'left',
                      fontSize: '11px', fontWeight: 600, color: '#6b7280',
                      textTransform: 'uppercase', letterSpacing: '0.05em',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.map((p, i) => (
                  <tr key={p.id} style={{
                    borderBottom: '0.5px solid #f3f4f6',
                    background: i % 2 === 0 ? '#fff' : '#fafbff',
                  }}>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#374151' }}>
                      {new Date(p.payment_date).toLocaleDateString('en-IN')}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: '#111827' }}>
                      ₹{fmt(p.amount)}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <CBadge color={badgeColorMap[p.payment_type] || 'secondary'}
                        style={{ borderRadius: '6px', fontSize: '11px', padding: '4px 8px' }}>
                        {p.payment_type}
                      </CBadge>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#374151' }}>{p.paid_by}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#6b7280' }}>{p.description || '—'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <CButton
                        color="warning" variant="outline" size="sm"
                        onClick={() => openEditForm(p)}
                        style={{ borderRadius: '7px', padding: '4px 10px' }}
                      >
                        <CIcon icon={cilPencil} />
                      </CButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{
            background: '#fff', borderRadius: '12px', border: '0.5px solid #e5e7eb',
            textAlign: 'center', padding: '48px 0',
          }}>
            <div style={{ fontSize: '36px', marginBottom: '10px', opacity: 0.35 }}>💳</div>
            <div style={{ fontSize: '13px', color: '#9ca3af', fontWeight: 500 }}>No payments recorded yet.</div>
            <div style={{ fontSize: '12px', color: '#d1d5db', marginTop: '4px' }}>Click "Record New Payment" to get started.</div>
          </div>
        )}
      </>
    ) : null}
  </CModalBody>

  {/* ── Footer ── */}
  <CModalFooter style={{ borderTop: '1px solid #f0f1f5', padding: '14px 24px', background: '#fff' }}>
    <CButton
      color="secondary" variant="outline" onClick={onClose}
      style={{ borderRadius: '9px', fontSize: '13px', fontWeight: 600 }}
    >
      <CIcon icon={cilX} className="me-1" /> Close
    </CButton>
  </CModalFooter>

</CModal>
  )
}

export default SubcontractPaymentModal