import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Select from 'react-select'
import {
  CCard, CCardBody, CCardHeader, CButton, CRow, CCol,
  CFormInput, CFormLabel, CFormSelect, CFormTextarea,
  CSpinner, CAlert, CInputGroup, CInputGroupText, CBadge,
  CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilArrowLeft, cilPlus, cilTrash, cilSave, cilCalculator } from '@coreui/icons'
import { getAPICall, post, put } from '../../../util/api'
import { useToast } from '../../common/toast/ToastContext'

const GST_OPTIONS = [0, 5, 12, 18, 28]
const UOM_OPTIONS = ['Nos', 'Kg', 'Ton', 'Bags', 'Meter', 'Sqft', 'Sqmt', 'Ltr', 'Brass', 'Brass (100 cft)', 'Rmt', 'Pair', 'Set', 'Job', 'LS', 'MT', 'Cum', 'Cft', 'Trip']

const EMPTY_ITEM = {
  item_name: '',
  description: '',
  hsn_code: '',
  uom: 'Nos',
  qty: '',
  rate: '',
  taxable_amount: 0,
  gst_percent: 18,
  cgst_amount: 0,
  sgst_amount: 0,
  igst_amount: 0,
  total_amount: 0,
  remark: '',
}

const DEFAULT_TERMS = `1. Quality of material must be as per approved samples / specifications.
2. Material must be packed properly to avoid damage during transit.
3. Delivery to be made at the above mentioned site address.
4. Invoice must mention PO Number for reference.
5. Any deviation in quantity or quality will result in rejection.`

const DEFAULT_PAYMENT_TERMS = `Payment within 30 days from date of invoice / delivery (whichever is later).`

const calcItem = (item, taxType) => {
  const qty  = parseFloat(item.qty  || 0)
  const rate = parseFloat(item.rate || 0)
  const gstP = parseFloat(item.gst_percent || 0)
  const taxable = parseFloat((qty * rate).toFixed(2))

  let cgst = 0, sgst = 0, igst = 0
  if (gstP > 0) {
    if (taxType === 'inter_state') {
      igst = parseFloat(((taxable * gstP) / 100).toFixed(2))
    } else {
      const half = gstP / 2
      cgst = parseFloat(((taxable * half) / 100).toFixed(2))
      sgst = parseFloat(((taxable * half) / 100).toFixed(2))
    }
  }
  const total = parseFloat((taxable + cgst + sgst + igst).toFixed(2))
  return { ...item, taxable_amount: taxable, cgst_amount: cgst, sgst_amount: sgst, igst_amount: igst, total_amount: total }
}

const calcSummary = (items, discount, taxType) => {
  const subtotal   = parseFloat(items.reduce((s, i) => s + (i.taxable_amount || 0), 0).toFixed(2))
  const disc       = parseFloat(discount || 0)
  const taxable    = parseFloat(Math.max(0, subtotal - disc).toFixed(2))
  const cgstTotal  = parseFloat(items.reduce((s, i) => s + (i.cgst_amount  || 0), 0).toFixed(2))
  const sgstTotal  = parseFloat(items.reduce((s, i) => s + (i.sgst_amount  || 0), 0).toFixed(2))
  const igstTotal  = parseFloat(items.reduce((s, i) => s + (i.igst_amount  || 0), 0).toFixed(2))
  const totalTax   = parseFloat((cgstTotal + sgstTotal + igstTotal).toFixed(2))
  const rawFinal   = taxable + totalTax
  const roundOff   = parseFloat((Math.round(rawFinal) - rawFinal).toFixed(2))
  const finalAmount= parseFloat((rawFinal + roundOff).toFixed(2))
  return { subtotal, discount: disc, taxable_amount: taxable, cgst_amount: cgstTotal, sgst_amount: sgstTotal, igst_amount: igstTotal, total_tax: totalTax, round_off: roundOff, final_amount: finalAmount }
}

const fmtCur = (v) => Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/* ════════════════════════════════════════════
   PurchaseOrderForm – used for Create & Edit
════════════════════════════════════════════ */
const PurchaseOrderForm = () => {
  const navigate  = useNavigate()
  const { id }    = useParams()
  const isEdit    = !!id
  const { showToast } = useToast()

  const [loading,   setLoading]   = useState(false)
  const [fetching,  setFetching]  = useState(isEdit)
  const [vendors,   setVendors]   = useState([])
  const [projects,  setProjects]  = useState([])
  const [alert,     setAlert]     = useState(null)

  const [form, setForm] = useState({
    vendor_id:           null,
    project_id:          null,
    po_number:           '',
    po_date:             new Date().toISOString().split('T')[0],
    delivery_date:       '',
    reference_no:        '',
    tax_type:            'intra_state',
    discount:            0,
    status:              'Issued',
    payment_terms:       DEFAULT_PAYMENT_TERMS,
    delivery_terms:      '',
    terms_and_conditions: DEFAULT_TERMS,
    notes:               '',
  })

  const [statusPromptModal, setStatusPromptModal] = useState({
    show: false,
    newStatus: '',
    oldStatus: '',
    note: ''
  })

  const onStatusSelectChange = (newStatus) => {
    if (newStatus !== form.status) {
      setStatusPromptModal({
        show: true,
        newStatus,
        oldStatus: form.status,
        note: ''
      })
    }
  }

  const applyStatusWithNote = () => {
    const { newStatus, oldStatus, note } = statusPromptModal
    let newNotes = form.notes || ''
    if (note && note.trim()) {
      const timeStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      const entry = `[${timeStr}] Status changed from '${oldStatus}' to '${newStatus}': ${note.trim()}`
      newNotes = newNotes ? `${newNotes.trim()}\n\n${entry}` : entry
    }
    setForm(f => ({ ...f, status: newStatus, notes: newNotes }))
    setStatusPromptModal({ show: false, newStatus: '', oldStatus: '', note: '' })
  }

  const skipStatusNote = () => {
    setForm(f => ({ ...f, status: statusPromptModal.newStatus }))
    setStatusPromptModal({ show: false, newStatus: '', oldStatus: '', note: '' })
  }

  const [items,   setItems]   = useState([{ ...EMPTY_ITEM }])
  const [summary, setSummary] = useState({ subtotal: 0, discount: 0, taxable_amount: 0, cgst_amount: 0, sgst_amount: 0, igst_amount: 0, total_tax: 0, round_off: 0, final_amount: 0 })

  // Re-calc summary whenever items / discount / taxType change
  useEffect(() => {
    setSummary(calcSummary(items, form.discount, form.tax_type))
  }, [items, form.discount, form.tax_type])

  // Recalc all items when tax type changes
  useEffect(() => {
    setItems(prev => prev.map(i => calcItem(i, form.tax_type)))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.tax_type])

  // Fetch vendors, projects, next PO#
  useEffect(() => {
    const init = async () => {
      try {
        const [vData, pData] = await Promise.all([
          getAPICall('/api/getPurchesVendor'),
          getAPICall('/api/projects'),
        ])
        setVendors(Array.isArray(vData) ? vData : [])
        setProjects(Array.isArray(pData) ? pData : (pData?.data || []))

        if (!isEdit) {
          const poRes = await getAPICall('/api/purchase-orders/next-po-number')
          if (poRes?.success) setForm(f => ({ ...f, po_number: poRes.po_number }))
        }
      } catch { showToast('danger', 'Failed to load data') }
    }
    init()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Fetch existing PO for edit
  useEffect(() => {
    if (!isEdit) return
    const fetch = async () => {
      try {
        setFetching(true)
        const res = await getAPICall(`/api/purchase-orders/${id}`)
        if (res?.success) {
          const d = res.data
          setForm({
            vendor_id:             d.vendor_id,
            project_id:            d.project_id || null,
            po_number:             d.po_number || '',
            po_date:               d.po_date ? d.po_date.split('T')[0] : '',
            delivery_date:         d.delivery_date ? d.delivery_date.split('T')[0] : '',
            reference_no:          d.reference_no || '',
            tax_type:              d.tax_type || 'intra_state',
            discount:              parseFloat(d.discount || 0),
            status:                d.status || 'Issued',
            payment_terms:         d.payment_terms || DEFAULT_PAYMENT_TERMS,
            delivery_terms:        d.delivery_terms || '',
            terms_and_conditions:  d.terms_and_conditions || DEFAULT_TERMS,
            notes:                 d.notes || '',
          })
          setItems(
            (d.items || []).map(it => ({
              item_name:      it.item_name,
              description:    it.description || '',
              hsn_code:       it.hsn_code || '',
              uom:            it.uom || 'Nos',
              qty:            parseFloat(it.qty),
              rate:           parseFloat(it.rate),
              taxable_amount: parseFloat(it.taxable_amount),
              gst_percent:    parseFloat(it.gst_percent),
              cgst_amount:    parseFloat(it.cgst_amount),
              sgst_amount:    parseFloat(it.sgst_amount),
              igst_amount:    parseFloat(it.igst_amount),
              total_amount:   parseFloat(it.total_amount),
              remark:         it.remark || '',
            }))
          )
        } else showToast('danger', 'Could not load Purchase Order')
      } catch { showToast('danger', 'Error loading Purchase Order') }
      finally { setFetching(false) }
    }
    fetch()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  /* ─── Handlers ─── */
  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const setItemField = useCallback((idx, key, val) => {
    setItems(prev => {
      const updated = [...prev]
      updated[idx] = calcItem({ ...updated[idx], [key]: val }, form.tax_type)
      return updated
    })
  }, [form.tax_type])

  const addItem   = () => setItems(prev => [...prev, { ...EMPTY_ITEM }])
  const removeItem = (idx) => setItems(prev => prev.filter((_, i) => i !== idx))

  const vendorOptions = vendors.map(v => ({
    value: v.id,
    label: v.name,
    sub: v.gst_no ? `GSTIN: ${v.gst_no}` : '',
    raw: v,
  }))
  const projectOptions = [
    { value: null, label: '(No Project)' },
    ...projects.map(p => ({ value: p.id, label: p.project_name || p.projectName || p.name || `Project #${p.id}` }))
  ]

  const selectedVendor  = vendorOptions.find(o => o.value === form.vendor_id) || null
  const selectedProject = projectOptions.find(o => o.value === form.project_id) || null
  const selectedVendorRaw = selectedVendor?.raw || null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.vendor_id) { showToast('warning', 'Please select a vendor'); return }
    if (items.length === 0) { showToast('warning', 'Please add at least one item'); return }
    const invalidItems = items.filter(it => !it.item_name?.trim())
    if (invalidItems.length > 0) { showToast('warning', 'All items must have a name'); return }

    setLoading(true)
    try {
      const payload = { ...form, ...summary, items }
      const res = isEdit
        ? await put(`/api/purchase-orders/${id}`, payload)
        : await post('/api/purchase-orders', payload)

      if (res?.success) {
        showToast('success', isEdit ? 'Purchase Order updated!' : 'Purchase Order created!')
        navigate(`/purchase-orders/view/${res.data.id}`)
      } else {
        showToast('danger', res?.message || 'Failed to save')
      }
    } catch (err) {
      showToast('danger', err?.message || 'Error saving Purchase Order')
    } finally { setLoading(false) }
  }

  if (fetching) return (
    <div className="text-center p-5"><CSpinner color="primary" /><p className="mt-3 text-muted">Loading Purchase Order...</p></div>
  )

  const isInter = form.tax_type === 'inter_state'

  return (
    <div className="po-form-wrapper w-100 mb-4">
      <div className="w-100">

        {/* ── Page Header ── */}
        <div className="d-flex align-items-center gap-3 mb-4">
          <CButton color="dark" variant="outline" onClick={() => navigate('/purchase-orders')} className="d-flex align-items-center gap-1">
            <CIcon icon={cilArrowLeft} size="sm" /> All POs
          </CButton>
          <h2 className="mb-0 fw-bold" style={{ color: '#1e3c78', fontSize: '1.6rem' }}>
            {isEdit ? '✏️ Edit Purchase Order' : '🛒 New Purchase Order'}
          </h2>
          {form.po_number && <CBadge color="primary" style={{ fontSize: '1rem', padding: '6px 12px' }}>{form.po_number}</CBadge>}
        </div>

        {alert && <CAlert color={alert.type} dismissible onClose={() => setAlert(null)}>{alert.msg}</CAlert>}

        <form onSubmit={handleSubmit}>
          {/* ── Section 1: Header Info ── */}
          <CCard className="mb-4 shadow-sm" style={{ borderRadius: 12, border: '1.5px solid #d0dff8' }}>
            <CCardHeader style={{ background: 'linear-gradient(90deg, #1e3c78, #2a5298)', color: '#fff', borderRadius: '10px 10px 0 0', padding: '14px 20px' }}>
              <strong>📋 Purchase Order Details</strong>
            </CCardHeader>
            <CCardBody style={{ padding: '20px 24px' }}>
              <CRow className="g-3">
                <CCol md={3}>
                  <CFormLabel className="fw-semibold">PO Number <span className="text-danger">*</span></CFormLabel>
                  <CFormInput value={form.po_number} onChange={e => setField('po_number', e.target.value)} placeholder="Auto-generated" required style={{ fontWeight: 600, color: '#1e3c78' }} />
                </CCol>
                <CCol md={3}>
                  <CFormLabel className="fw-semibold">PO Date <span className="text-danger">*</span></CFormLabel>
                  <CFormInput type="date" value={form.po_date} onChange={e => setField('po_date', e.target.value)} required />
                </CCol>
                <CCol md={3}>
                  <CFormLabel className="fw-semibold">Expected Delivery Date</CFormLabel>
                  <CFormInput type="date" value={form.delivery_date} onChange={e => setField('delivery_date', e.target.value)} />
                </CCol>
                <CCol md={3}>
                  <CFormLabel className="fw-semibold">Reference No (Quotation / PO Ref)</CFormLabel>
                  <CFormInput value={form.reference_no} onChange={e => setField('reference_no', e.target.value)} placeholder="e.g. QT-2026-001" />
                </CCol>
                <CCol md={3}>
                  <CFormLabel className="fw-semibold">Status</CFormLabel>
                  <CFormSelect value={form.status} onChange={e => onStatusSelectChange(e.target.value)}>
                    {['Draft', 'Issued', 'Partially Received', 'Completed', 'Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                  </CFormSelect>
                </CCol>
                <CCol md={3}>
                  <CFormLabel className="fw-semibold">Tax Type</CFormLabel>
                  <CFormSelect value={form.tax_type} onChange={e => setField('tax_type', e.target.value)}>
                    <option value="intra_state">Intra-State (CGST + SGST)</option>
                    <option value="inter_state">Inter-State (IGST)</option>
                  </CFormSelect>
                </CCol>
                <CCol md={6}>
                  <CFormLabel className="fw-semibold">Project / Site (Optional)</CFormLabel>
                  <Select
                    options={projectOptions}
                    value={selectedProject}
                    onChange={o => setField('project_id', o?.value ?? null)}
                    placeholder="Search & select project..."
                    isClearable
                    styles={{ menu: b => ({ ...b, zIndex: 9999 }) }}
                  />
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>

          {/* ── Section 2: Vendor ── */}
          {/* <CCard className="mb-4 shadow-sm" style={{ borderRadius: 12, border: '1.5px solid #d0dff8' }}>
            <CCardHeader style={{ background: 'linear-gradient(90deg, #1e5c1e, #2e8b2e)', color: '#fff', borderRadius: '10px 10px 0 0', padding: '14px 20px' }}>
              <strong>🏭 Vendor / Supplier Details</strong>
            </CCardHeader>
            <CCardBody style={{ padding: '20px 24px' }}>
              <CRow className="g-3 align-items-start">
                <CCol md={6}>
                  <CFormLabel className="fw-semibold">Select Vendor <span className="text-danger">*</span></CFormLabel>
                  <Select
                    options={vendorOptions}
                    value={selectedVendor}
                    onChange={o => setField('vendor_id', o?.value ?? null)}
                    placeholder="🔍 Search vendor by name..."
                    isClearable
                    formatOptionLabel={o => (
                      <div>
                        <div className="fw-semibold">{o.label}</div>
                        {o.sub && <div className="text-muted" style={{ fontSize: '0.78rem' }}>{o.sub}</div>}
                      </div>
                    )}
                    styles={{ menu: b => ({ ...b, zIndex: 9999 }) }}
                  />
                </CCol>
                {selectedVendorRaw && (
                  <CCol md={6}>
                    <div style={{ background: '#f0faf0', border: '1px solid #b6ddb6', borderRadius: 8, padding: '12px 16px' }}>
                      <div className="fw-bold text-success mb-1">✅ {selectedVendorRaw.name}</div>
                      <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                        {selectedVendorRaw.mobile && <div>📞 {selectedVendorRaw.mobile}</div>}
                        {selectedVendorRaw.gst_no && <div>🏛️ GSTIN: {selectedVendorRaw.gst_no}</div>}
                        {selectedVendorRaw.address && <div>📍 {selectedVendorRaw.address}</div>}
                      </div>
                    </div>
                  </CCol>
                )}
              </CRow>
            </CCardBody>
          </CCard> */}
          <CCard className="mb-4 shadow-sm" style={{ borderRadius: 12, border: '1.5px solid #d0dff8' }}>
  <CCardHeader style={{ background: 'linear-gradient(90deg, #1e5c1e, #2e8b2e)', color: '#fff', borderRadius: '10px 10px 0 0', padding: '14px 20px' }}>
    <strong>🏭 Vendor / Supplier Details</strong>
  </CCardHeader>
  <CCardBody style={{ padding: '20px 24px' }}>
    <CRow className="g-3 align-items-stretch">
      <CCol md={6}>
        <CFormLabel className="fw-semibold">Select Vendor <span className="text-danger">*</span></CFormLabel>
        <Select
          options={vendorOptions}
          value={selectedVendor}
          onChange={o => setField('vendor_id', o?.value ?? null)}
          placeholder="🔍 Search vendor by name..."
          isClearable
          formatOptionLabel={o => (
            <div>
              <div className="fw-semibold">{o.label}</div>
              {o.sub && <div className="text-muted" style={{ fontSize: '0.78rem' }}>{o.sub}</div>}
            </div>
          )}
          styles={{
            menu: b => ({ ...b, zIndex: 9999 }),
            control: b => ({ ...b, minHeight: 58 }),
          }}
        />
      </CCol>
      {selectedVendorRaw && (
        <CCol md={6} className="d-flex">
          <div
            className="d-flex flex-column justify-content-center w-100"
            style={{ background: '#f0faf0', border: '1px solid #b6ddb6', borderRadius: 8, padding: '12px 16px', minHeight: 58 }}
          >
            <div className="fw-bold text-success mb-1">✅ {selectedVendorRaw.name}</div>
            <div className="text-muted" style={{ fontSize: '0.85rem' }}>
              {selectedVendorRaw.mobile && <div>📞 {selectedVendorRaw.mobile}</div>}
              {selectedVendorRaw.gst_no && <div>🏛️ GSTIN: {selectedVendorRaw.gst_no}</div>}
              {selectedVendorRaw.address && <div>📍 {selectedVendorRaw.address}</div>}
            </div>
          </div>
        </CCol>
      )}
    </CRow>
  </CCardBody>
</CCard>

          {/* ── Section 3: Items Table ── */}
          <CCard className="mb-4 shadow-sm" style={{ borderRadius: 12, border: '1.5px solid #d0dff8' }}>
            <CCardHeader style={{ background: 'linear-gradient(90deg, #7c3a00, #c05a00)', color: '#fff', borderRadius: '10px 10px 0 0', padding: '14px 20px' }} className="d-flex justify-content-between align-items-center">
              <strong>📦 Material / Item Details</strong>
              {/* <CButton color="light" size="sm" onClick={addItem} className="d-flex align-items-center gap-1 fw-semibold">
                <CIcon icon={cilPlus} size="sm" /> Add Row
              </CButton> */}
            </CCardHeader>
            <CCardBody style={{ padding: '0', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead style={{ background: '#1e3c78', color: '#fff', position: 'sticky', top: 0 }}>
                  <tr>
                    {['#', 'Item Name *', 'Description / Spec', 'HSN', 'UOM', 'Qty *', 'Rate (₹) *', 'Taxable Amt', `GST%`, isInter ? 'IGST (₹)' : 'CGST (₹)', !isInter && 'SGST (₹)', 'Total (₹)', 'Remark', ''].filter(Boolean).map((h, i) => (
                      <th key={i} style={{ padding: '10px 8px', fontWeight: 600, whiteSpace: 'nowrap', textAlign: h === '#' ? 'center' : 'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx} style={{ background: idx % 2 === 0 ? '#f9faff' : '#fff', borderBottom: '1px solid #e0e8f8' }}>
                      <td style={{ padding: '8px', textAlign: 'center', fontWeight: 600, color: '#666', width: 30 }}>{idx + 1}</td>
                      <td style={{ padding: '4px 6px', minWidth: 140 }}>
                        <CFormInput size="sm" value={item.item_name} onChange={e => setItemField(idx, 'item_name', e.target.value)} placeholder="e.g. M-Sand, Cement..." required />
                      </td>
                      <td style={{ padding: '4px 6px', minWidth: 140 }}>
                        <CFormInput size="sm" value={item.description} onChange={e => setItemField(idx, 'description', e.target.value)} placeholder="Specifications, grade..." />
                      </td>
                      <td style={{ padding: '4px 6px', minWidth: 70 }}>
                        <CFormInput size="sm" value={item.hsn_code} onChange={e => setItemField(idx, 'hsn_code', e.target.value)} placeholder="HSN" />
                      </td>
                      <td style={{ padding: '4px 6px', minWidth: 80 }}>
                        <CFormSelect size="sm" value={item.uom} onChange={e => setItemField(idx, 'uom', e.target.value)}>
                          {UOM_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
                        </CFormSelect>
                      </td>
                      <td style={{ padding: '4px 6px', minWidth: 70 }}>
                        <CFormInput size="sm" type="number" min="0" step="0.01" value={item.qty} onChange={e => setItemField(idx, 'qty', e.target.value)} placeholder="0" />
                      </td>
                      <td style={{ padding: '4px 6px', minWidth: 80 }}>
                        <CFormInput size="sm" type="number" min="0" step="0.01" value={item.rate} onChange={e => setItemField(idx, 'rate', e.target.value)} placeholder="0.00" />
                      </td>
                      <td style={{ padding: '4px 6px', textAlign: 'right', minWidth: 80, fontWeight: 500, color: '#333' }}>
                        ₹ {fmtCur(item.taxable_amount)}
                      </td>
                      <td style={{ padding: '4px 6px', minWidth: 70 }}>
                        <CFormSelect size="sm" value={item.gst_percent} onChange={e => setItemField(idx, 'gst_percent', parseFloat(e.target.value))}>
                          {GST_OPTIONS.map(g => <option key={g} value={g}>{g}%</option>)}
                        </CFormSelect>
                      </td>
                      <td style={{ padding: '4px 6px', textAlign: 'right', minWidth: 80, color: '#555' }}>
                        ₹ {fmtCur(isInter ? item.igst_amount : item.cgst_amount)}
                      </td>
                      {!isInter && (
                        <td style={{ padding: '4px 6px', textAlign: 'right', minWidth: 80, color: '#555' }}>
                          ₹ {fmtCur(item.sgst_amount)}
                        </td>
                      )}
                      <td style={{ padding: '4px 6px', textAlign: 'right', minWidth: 90, fontWeight: 700, color: '#1e3c78' }}>
                        ₹ {fmtCur(item.total_amount)}
                      </td>
                      <td style={{ padding: '4px 6px', minWidth: 100 }}>
                        <CFormInput size="sm" value={item.remark} onChange={e => setItemField(idx, 'remark', e.target.value)} placeholder="Remark..." />
                      </td>
                      <td style={{ padding: '4px 6px' }}>
                        <CButton color="danger" variant="ghost" size="sm" onClick={() => removeItem(idx)} disabled={items.length === 1} title="Remove item">
                          <CIcon icon={cilTrash} size="sm" />
                        </CButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Add Row button below table */}
              <div style={{ padding: '12px 16px' }}>
                <CButton color="primary" variant="outline" size="sm" onClick={addItem} className="d-flex align-items-center gap-1">
                  <CIcon icon={cilPlus} size="sm" /> Add Another Item
                </CButton>
              </div>
            </CCardBody>
          </CCard>

          {/* ── Section 4: Summary ── */}
          <CRow className="mb-4">
            <CCol md={7}>
              {/* Discount */}
              <CCard className="h-100 shadow-sm" style={{ borderRadius: 12, border: '1.5px solid #d0dff8' }}>
                <CCardHeader style={{ background: 'linear-gradient(90deg, #4a0080, #7a0099)', color: '#fff', borderRadius: '10px 10px 0 0', padding: '12px 20px' }}>
                  <strong>📝 Notes & Terms</strong>
                </CCardHeader>
                <CCardBody style={{ padding: '16px 20px' }}>
                  <CRow className="g-3">
                    <CCol xs={12}>
                      <CFormLabel className="fw-semibold">Discount Amount (₹)</CFormLabel>
                      <CInputGroup>
                        <CInputGroupText>₹</CInputGroupText>
                        <CFormInput type="number" min="0" step="0.01" value={form.discount} onChange={e => setField('discount', e.target.value)} placeholder="0.00" />
                      </CInputGroup>
                    </CCol>
                    <CCol xs={12}>
                      <CFormLabel className="fw-semibold">Payment Terms</CFormLabel>
                      <CFormTextarea rows={2} value={form.payment_terms} onChange={e => setField('payment_terms', e.target.value)} placeholder="e.g. Net 30 days..." />
                    </CCol>
                    <CCol xs={12}>
                      <CFormLabel className="fw-semibold">Delivery Terms</CFormLabel>
                      <CFormTextarea rows={2} value={form.delivery_terms} onChange={e => setField('delivery_terms', e.target.value)} placeholder="e.g. Ex-works, FOR Destination..." />
                    </CCol>
                    <CCol xs={12}>
                      <CFormLabel className="fw-semibold">Terms & Conditions</CFormLabel>
                      <CFormTextarea rows={4} value={form.terms_and_conditions} onChange={e => setField('terms_and_conditions', e.target.value)} />
                    </CCol>
                    <CCol xs={12}>
                      <CFormLabel className="fw-semibold">Notes / Special Instructions</CFormLabel>
                      <CFormTextarea rows={2} value={form.notes} onChange={e => setField('notes', e.target.value)} placeholder="Any additional notes..." />
                    </CCol>
                  </CRow>
                </CCardBody>
              </CCard>
            </CCol>
            <CCol md={5}>
              {/* Financial Summary */}
              <CCard className="shadow-sm" style={{ borderRadius: 12, border: '2px solid #1e3c78', background: 'linear-gradient(135deg, #f0f4ff, #e8f0ff)' }}>
                <CCardHeader style={{ background: 'linear-gradient(90deg, #1e3c78, #2a5298)', color: '#fff', borderRadius: '10px 10px 0 0', padding: '14px 20px' }}>
                  <strong>💰 Financial Summary</strong>
                </CCardHeader>
                <CCardBody style={{ padding: '20px' }}>
                  {[
                    { label: 'Sub Total', val: summary.subtotal, style: {} },
                    { label: 'Discount', val: -summary.discount, style: { color: '#c00' }, show: summary.discount > 0 },
                    { label: 'Taxable Amount', val: summary.taxable_amount, style: { fontWeight: 600 } },
                    ...(isInter
                      ? [{ label: 'IGST', val: summary.igst_amount, style: {} }]
                      : [
                          { label: 'CGST', val: summary.cgst_amount, style: {}, show: summary.cgst_amount > 0 },
                          { label: 'SGST', val: summary.sgst_amount, style: {}, show: summary.sgst_amount > 0 },
                        ]),
                    { label: 'Total Tax', val: summary.total_tax, style: {} },
                    { label: 'Round Off', val: summary.round_off, style: {}, show: Math.abs(summary.round_off) > 0.001 },
                  ].filter(r => r.show !== false).map((row, i) => (
                    <div key={i} className="d-flex justify-content-between py-2" style={{ borderBottom: '1px solid #c8d8f8', ...row.style }}>
                      <span>{row.label}</span>
                      <span style={{ fontFamily: 'monospace' }}>₹ {fmtCur(Math.abs(row.val))}{row.val < 0 ? ' (-)' : ''}</span>
                    </div>
                  ))}

                  <div className="d-flex justify-content-between align-items-center mt-3 pt-2" style={{ borderTop: '2.5px solid #1e3c78', fontWeight: 700, fontSize: '1.2rem', color: '#1e3c78' }}>
                    <span>Grand Total</span>
                    <span>₹ {fmtCur(summary.final_amount)}</span>
                  </div>

                  <div className="mt-3 text-center p-2" style={{ background: '#fff3cd', border: '1px solid #ffd700', borderRadius: 8, fontSize: '0.82rem', fontStyle: 'italic', color: '#555' }}>
                    {/* Amount in words */}
                    {summary.final_amount > 0 && (
                      <span>Rupees: {Math.round(summary.final_amount).toLocaleString('en-IN')} Only (approx)</span>
                    )}
                  </div>
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>

          {/* ── Submit Buttons ── */}
          <div className="d-flex gap-3 justify-content-end mb-5">
            <CButton color="secondary" variant="outline" onClick={() => navigate('/purchase-orders')} disabled={loading}>
              Cancel
            </CButton>
            <CButton type="submit" color="primary" className="px-5 fw-bold d-flex align-items-center gap-2" disabled={loading}
              style={{ background: 'linear-gradient(90deg, #1e3c78, #2a5298)', border: 'none', borderRadius: 8, padding: '10px 32px' }}>
              {loading ? <CSpinner size="sm" /> : <CIcon icon={cilSave} />}
              {loading ? 'Saving...' : isEdit ? 'Update Purchase Order' : 'Save & View Purchase Order'}
            </CButton>
          </div>
        </form>
      </div>

      {/* ── Status Change Note Modal ── */}
      <CModal visible={statusPromptModal.show} onClose={() => setStatusPromptModal(s => ({ ...s, show: false }))} alignment="center">
        <CModalHeader>
          <CModalTitle className="h6 mb-0">Add Note for Status Change</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="mb-3">
            <div>Status will change from <strong>{statusPromptModal.oldStatus}</strong> to <strong className="text-primary">{statusPromptModal.newStatus}</strong>.</div>
          </div>
          <div className="mb-2">
            <CFormLabel className="fw-semibold">Note / Reason <span className="text-muted fw-normal">(Optional)</span></CFormLabel>
            <CFormTextarea
              rows={3}
              placeholder="Enter remarks or reason for status change (optional)..."
              value={statusPromptModal.note}
              onChange={e => setStatusPromptModal(s => ({ ...s, note: e.target.value }))}
            />
            <div className="form-text" style={{ fontSize: '0.8rem' }}>
              This note will be appended to the Purchase Order notes.
            </div>
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="ghost" onClick={() => setStatusPromptModal(s => ({ ...s, show: false }))}>
            Cancel
          </CButton>
          <CButton color="light" onClick={skipStatusNote}>
            Skip Note
          </CButton>
          <CButton color="primary" onClick={applyStatusWithNote}>
            Save Note & Apply Status
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  )
}

export default PurchaseOrderForm
