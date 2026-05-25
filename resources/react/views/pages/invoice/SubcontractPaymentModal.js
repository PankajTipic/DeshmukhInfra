


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
    <CModal visible={visible} onClose={onClose} size="lg" backdrop="static">
      {/* ── Header ── */}
      <CModalHeader style={{ borderBottom: '1px solid #f0f1f5', padding: '18px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={styles.headerIcon}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <path d="M2 10h20" />
            </svg>
          </div>
          <div>
            <CModalTitle style={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>
              Subcontract Payment
            </CModalTitle>
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
              {subcontractData.order?.project?.project_name || '—'}
            </div>
          </div>
        </div>
      </CModalHeader>

      {/* ── Body ── */}
      <CModalBody style={{ padding: '24px' }}>
        {loading ? (
          <div className="text-center py-5"><CSpinner /></div>
        ) : error ? (
          <CAlert color="danger">{error}</CAlert>
        ) : subcontract ? (
          <>
            {/* Summary Cards */}
            <div style={styles.summaryGrid}>
              {[
                { variant: 'total',   label: 'Total Amount', value: subcontract.total_amount },
                { variant: 'paid',    label: 'Paid',         value: subcontract.paid_amount  },
                { variant: 'pending', label: 'Pending',      value: subcontract.pending_amount },
              ].map(({ variant, label, value }) => (
                <div key={variant} style={styles.summaryCard(variant)}>
                  <div style={styles.cardDot(variant)} />
                  <div style={styles.cardLabel}>{label}</div>
                  <div style={styles.cardValue(variant)}>₹{fmt(value)}</div>
                </div>
              ))}
            </div>

            {/* Section Head */}
            <div style={styles.sectionHead}>
              <div style={styles.sectionTitle}>Payment History</div>
              <CButton
                onClick={openAddForm}
                style={{
                  background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                  border: 'none',
                  borderRadius: '9px',
                  fontSize: '13px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  color: '#fff',
                  boxShadow: '0 2px 8px rgba(79,70,229,.3)',
                }}
              >
                <CIcon icon={cilCreditCard} />
                Record New Payment
              </CButton>
            </div>

            {/* Payment Form */}
            {showPaymentForm && (
              <div style={styles.formBox}>
                <div style={styles.formTitle}>
                  <CIcon icon={editingPayment ? cilPencil : cilCreditCard} />
                  {editingPayment ? 'Edit Payment' : 'Record New Payment'}
                </div>

                <CRow className="g-3">
                  <CCol md={6}>
                    <label style={styles.fieldLabel}>Amount (₹)</label>
                    <CFormInput
                      type="number"
                      name="amount"
                      value={formData.amount}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      onChange={handleAmountChange}
                      onKeyDown={preventNegativeKeys}
                      onInput={preventNegativeInput}
                    />
                  </CCol>
                  <CCol md={6}>
                    <label style={styles.fieldLabel}>Payment Type</label>
                    <CFormSelect
                      name="payment_type"
                      value={formData.payment_type}
                      onChange={handleInputChange}
                    >
                      {paymentTypes.map((type) => (
                                        <option key={type.value} value={type.value}>
                                          {type.label}
                                        </option>
                                      ))}
                    </CFormSelect>
                  </CCol>
                  
                  {/* <CCol md={6}>
                    <label style={styles.fieldLabel}>Paid By</label>
                    <CFormInput
                      name="paid_by"
                      value={formData.paid_by}
                      placeholder="Enter name"
                      onChange={handleInputChange}
                    />
                  </CCol> */}

                  <CCol md={6}>
  <label style={styles.fieldLabel}>Paid By</label>

  <select
    name="paid_by"
    value={formData.paid_by}
    onChange={handleInputChange}
    className="form-select"
  >
    <option value="">Select Bank</option>

    {receiver_bank.map((bank) => (
      <option key={bank.value} value={bank.value}>
        {bank.label}
      </option>
    ))}
  </select>
</CCol>


                  <CCol md={6}>
                    <label style={styles.fieldLabel}>Payment Date</label>
                    <CFormInput
                      type="date"
                      name="payment_date"
                      value={formData.payment_date}
                      onChange={handleInputChange}
                    />
                  </CCol>
                  <CCol md={12}>
                    <label style={styles.fieldLabel}>Description</label>
                    <CFormTextarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={2}
                      placeholder="Optional note..."
                    />
                  </CCol>
                </CRow>

                <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                  <CButton
                    color="primary"
                    onClick={handleSavePayment}
                    disabled={submitting}
                    style={{ borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}
                  >
                    {submitting
                      ? <CSpinner size="sm" />
                      : editingPayment ? 'Update Payment' : 'Save Payment'}
                  </CButton>
                  <CButton
                    color="secondary"
                    variant="outline"
                    onClick={() => setShowPaymentForm(false)}
                    style={{ borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}
                  >
                    Cancel
                  </CButton>
                </div>
              </div>
            )}

            {/* Payment Table */}
            {payments.length > 0 ? (
              <div style={styles.tableWrap}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['Date', 'Amount', 'Type', 'Paid By', 'Description', 'Action'].map(h => (
                        <th key={h} style={styles.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p, i) => (
                      <tr
                        key={p.id}
                        style={{ background: i % 2 === 0 ? '#fff' : '#fafbff' }}
                      >
                        <td style={styles.td}>
                          {new Date(p.payment_date).toLocaleDateString('en-IN')}
                        </td>
                        <td style={styles.tdAmount}>
                          ₹{fmt(p.amount)}
                        </td>
                        <td style={styles.td}>
                          <CBadge color={badgeColorMap[p.payment_type] || 'secondary'}>
                            {p.payment_type}
                          </CBadge>
                        </td>
                        <td style={styles.td}>{p.paid_by}</td>
                        <td style={styles.td}>{p.description || '—'}</td>
                        <td style={styles.td}>
                          <CButton
                            color="warning"
                            variant="outline"
                            size="sm"
                            onClick={() => openEditForm(p)}
                            style={{ borderRadius: '7px', padding: '4px 8px' }}
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
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af' }}>
                <div style={{ fontSize: '32px', marginBottom: '10px', opacity: 0.4 }}>💳</div>
                <div style={{ fontSize: '13px' }}>No payments recorded yet.</div>
              </div>
            )}
          </>
        ) : null}
      </CModalBody>

      {/* ── Footer ── */}
      <CModalFooter style={{ borderTop: '1px solid #f0f1f5', padding: '14px 24px' }}>
        <CButton
          color="secondary"
          variant="outline"
          onClick={onClose}
          style={{ borderRadius: '9px', fontSize: '13px', fontWeight: 600 }}
        >
          <CIcon icon={cilX} className="me-1" /> Close
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default SubcontractPaymentModal