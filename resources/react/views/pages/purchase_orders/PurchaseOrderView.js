import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  CCard, CCardBody, CCardHeader, CButton, CRow, CCol,
  CSpinner, CBadge, CAlert, CModal, CModalHeader, CModalTitle,
  CModalBody, CModalFooter, CFormSelect, CFormTextarea, CFormLabel
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilArrowLeft, cilPencil, cilPrint, cilCloudDownload } from '@coreui/icons'
import { getAPICall, put } from '../../../util/api'
import { useToast } from '../../common/toast/ToastContext'
import { generatePurchaseOrderPDF } from './PurchaseOrderPDF'
import { getUserData } from '../../../util/session'

const fmtCur = (v) => Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const statusColors = {
  Issued: 'success', Draft: 'secondary', 'Partially Received': 'warning',
  Completed: 'primary', Cancelled: 'danger'
}

const numberToWords = (num) => {
  if (!num || isNaN(num)) return ''
  const belowTwenty = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight',
    'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen']
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
  const thousands = ['', 'Thousand', 'Lakh', 'Crore']
  function convertLT(n) {
    if (n === 0) return ''
    if (n < 20) return belowTwenty[n]
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + belowTwenty[n % 10] : '')
    return belowTwenty[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convertLT(n % 100) : '')
  }
  const whole = Math.floor(num)
  let words = '', i = 0, temp = whole
  while (temp > 0) {
    const part = temp % 1000
    if (part > 0) { let pw = convertLT(part); if (i > 0) pw += ' ' + thousands[i]; words = pw + (words ? ' ' + words : '') }
    temp = Math.floor(temp / 1000); i++; if (i === 3) i = 1
  }
  return (words || 'Zero') + ' Rupees Only'
}

/* ════════════════════════════════════════
   PurchaseOrderView
════════════════════════════════════════ */
const PurchaseOrderView = () => {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const { showToast } = useToast()

  const [po,         setPo]         = useState(null)
  const [company,    setCompany]    = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [downloading, setDownloading] = useState(false)

  const [statusModal, setStatusModal] = useState({
    show: false,
    newStatus: '',
    note: '',
    loading: false
  })

  const openStatusModal = (initialStatus = null) => {
    setStatusModal({
      show: true,
      newStatus: initialStatus || po?.status || 'Issued',
      note: '',
      loading: false
    })
  }

  const handleStatusSubmit = async (e) => {
    e?.preventDefault()
    if (!statusModal.newStatus) {
      showToast('danger', 'Please select a status')
      return
    }
    try {
      setStatusModal(s => ({ ...s, loading: true }))
      const res = await put(`/api/purchase-orders/${id}/status`, {
        status: statusModal.newStatus,
        note: statusModal.note
      })
      if (res?.success) {
        setPo(res.data)
        showToast('success', res.message || 'Status updated successfully')
        setStatusModal({ show: false, newStatus: '', note: '', loading: false })
      } else {
        showToast('danger', res?.message || 'Failed to update status')
        setStatusModal(s => ({ ...s, loading: false }))
      }
    } catch (err) {
      showToast('danger', err?.message || 'Error updating status')
      setStatusModal(s => ({ ...s, loading: false }))
    }
  }

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true)
        const res = await getAPICall(`/api/purchase-orders/${id}`)
        if (res?.success) {
          setPo(res.data)
          setCompany(res.company)
        } else {
          showToast('danger', 'Purchase Order not found')
          navigate('/purchase-orders')
        }
      } catch {
        showToast('danger', 'Error loading Purchase Order')
        navigate('/purchase-orders')
      } finally { setLoading(false) }
    }
    fetch()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const handleDownload = async () => {
    try {
      setDownloading(true)
      await generatePurchaseOrderPDF(po, 'save')
      showToast('success', 'PDF downloaded successfully!')
    } catch (e) {
      showToast('danger', 'Failed to generate PDF')
      console.error(e)
    } finally { setDownloading(false) }
  }

  const handlePrint = () => window.print()

  if (loading) return (
    <div className="text-center p-5">
      <CSpinner color="primary" style={{ width: 48, height: 48 }} />
      <p className="mt-3 text-muted">Loading Purchase Order...</p>
    </div>
  )
  if (!po) return null

  const isInter = po.tax_type === 'inter_state'
  const vendor  = po.vendor  || {}
  const project = po.project || {}
  const items   = (po.items  || []).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
  const user    = getUserData() || {}
  const co      = company || user.company_info || {}

  const subtotal    = parseFloat(po.subtotal     || 0)
  const discount    = parseFloat(po.discount     || 0)
  const taxable     = parseFloat(po.taxable_amount || 0)
  const cgst        = parseFloat(po.cgst_amount  || 0)
  const sgst        = parseFloat(po.sgst_amount  || 0)
  const igst        = parseFloat(po.igst_amount  || 0)
  const totalTax    = parseFloat(po.total_tax    || 0)
  const roundOff    = parseFloat(po.round_off    || 0)
  const finalAmount = parseFloat(po.final_amount || 0)

  return (
    <div className="w-100 mb-4">
      <style>{`
        @media print {
          .d-print-none { display: none !important; }
          body { background: white !important; }
          .po-print-area { box-shadow: none !important; border: none !important; }
        }
      `}</style>

      <div className="w-100">

        {/* ── Action Bar ── */}
        <div className="d-flex gap-2 mb-4 flex-wrap align-items-center d-print-none">
          <CButton color="light" variant="outline" onClick={() => navigate('/purchase-orders')} className="d-flex align-items-center gap-1">
            <CIcon icon={cilArrowLeft} size="sm" /> All Purchase Orders
          </CButton>
          <div className="ms-auto d-flex gap-2">
            <CButton color="primary" variant="outline" onClick={() => openStatusModal()} className="d-flex align-items-center gap-1 fw-semibold">
              🔄 Change Status
            </CButton>
            <CButton color="warning" onClick={() => navigate(`/purchase-orders/edit/${id}`)} className="d-flex align-items-center gap-1 fw-semibold">
              <CIcon icon={cilPencil} size="sm" /> Edit
            </CButton>
            <CButton color="secondary" onClick={handlePrint} className="d-flex align-items-center gap-1">
              <CIcon icon={cilPrint} size="sm" /> Print
            </CButton>
            <CButton
              color="success"
              onClick={handleDownload}
              disabled={downloading}
              className="d-flex align-items-center gap-2 fw-bold"
              style={{ background: 'linear-gradient(90deg, #1e7e34, #28a745)', border: 'none', borderRadius: 8, padding: '8px 24px', fontSize: '0.95rem' }}
            >
              {downloading ? <CSpinner size="sm" /> : <CIcon icon={cilCloudDownload} />}
              {downloading ? 'Generating...' : 'Download PDF'}
            </CButton>
          </div>
        </div>

        {/* ── PO Document ── */}
        <CCard className="po-print-area shadow" style={{ borderRadius: 14, border: '2px solid #1e3c78', overflow: 'hidden' }}>

          {/* ── Company Header ── */}
          <div style={{ background: 'linear-gradient(135deg, #1e3c78 0%, #2a5298 100%)', padding: '24px 32px', color: '#fff' }}>
            <CRow className="align-items-center">
              <CCol>
                <h2 className="mb-1 fw-bold" style={{ fontSize: '1.5rem', letterSpacing: 1 }}>{co.company_name || 'Company Name'}</h2>
                <div style={{ opacity: 0.85, fontSize: '0.88rem' }}>
                  {co.land_mark || co.address || '—'}
                  {co.phone_no && <span className="ms-3">📞 {co.phone_no}</span>}
                  {co.email_id && <span className="ms-3">✉️ {co.email_id}</span>}
                </div>
                {co.gst_number && <div style={{ opacity: 0.75, fontSize: '0.82rem', marginTop: 4 }}>GSTIN: {co.gst_number}</div>}
              </CCol>
              <CCol xs="auto" className="text-end">
                <div style={{ background: 'rgba(255,255,255,0.18)', borderRadius: 10, padding: '10px 24px', border: '2px solid rgba(255,255,255,0.4)' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: 2 }}>PURCHASE ORDER</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ffd700', fontFamily: 'monospace' }}>{po.po_number}</div>
                  <div style={{ fontSize: '0.82rem', opacity: 0.8 }}>Date: {fmtDate(po.po_date)}</div>
                </div>
              </CCol>
            </CRow>
          </div>

          <CCardBody style={{ padding: '24px 32px' }}>

            {/* ── PO Meta + Status ── */}
            <CRow className="mb-4 g-3 align-items-start">
              <CCol md={4}>
                <div style={{ background: '#f8fbff', border: '1.5px solid #c5d8f8', borderRadius: 10, padding: '14px 16px' }}>
                  <div className="fw-bold text-muted mb-2" style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 1 }}>PO Details</div>
                  <table style={{ width: '100%', fontSize: '0.88rem' }}>
                    <tbody>
                      <tr>
                        <td className="text-muted pe-2">Status:</td>
                        <td>
                          <CBadge
                            color={statusColors[po.status] || 'secondary'}
                            role="button"
                            onClick={() => openStatusModal()}
                            style={{ cursor: 'pointer', padding: '6px 12px', fontSize: '0.85rem' }}
                            title="Click to change status"
                          >
                            {po.status} <span style={{ fontSize: '0.75rem', opacity: 0.85 }}>✏️ Change</span>
                          </CBadge>
                        </td>
                      </tr>
                      <tr><td className="text-muted pe-2">PO Date:</td><td className="fw-semibold">{fmtDate(po.po_date)}</td></tr>
                      {po.delivery_date && <tr><td className="text-muted pe-2">Del. Date:</td><td>{fmtDate(po.delivery_date)}</td></tr>}
                      {po.reference_no && <tr><td className="text-muted pe-2">Ref No:</td><td>{po.reference_no}</td></tr>}
                      <tr><td className="text-muted pe-2">Tax Type:</td><td>{isInter ? 'Inter-State (IGST)' : 'Intra-State (CGST+SGST)'}</td></tr>
                    </tbody>
                  </table>
                </div>
              </CCol>
              <CCol md={4}>
                <div style={{ background: '#f0fff4', border: '1.5px solid #b6ddb6', borderRadius: 10, padding: '14px 16px' }}>
                  <div className="fw-bold text-muted mb-2" style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 1 }}>Vendor / Supplier</div>
                  <div className="fw-bold" style={{ fontSize: '1rem', color: '#1e5c1e' }}>{vendor.name || '—'}</div>
                  {vendor.mobile && <div className="text-muted" style={{ fontSize: '0.85rem' }}>📞 {vendor.mobile}</div>}
                  {vendor.gst_no && <div className="text-muted" style={{ fontSize: '0.85rem' }}>GSTIN: {vendor.gst_no}</div>}
                  {vendor.address && <div className="text-muted" style={{ fontSize: '0.85rem' }}>📍 {vendor.address}</div>}
                </div>
              </CCol>
              <CCol md={4}>
                <div style={{ background: '#fffaf0', border: '1.5px solid #f0d080', borderRadius: 10, padding: '14px 16px' }}>
                  <div className="fw-bold text-muted mb-2" style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 1 }}>Delivery To</div>
                  <div className="fw-bold" style={{ fontSize: '1rem' }}>{co.company_name || '—'}</div>
                  <div className="text-muted" style={{ fontSize: '0.85rem' }}>{co.land_mark || co.address || '—'}</div>
                  {project.project_name && (
                    <div className="mt-2">
                      <span className="badge bg-info text-dark">📍 {project.project_name}</span>
                    </div>
                  )}
                </div>
              </CCol>
            </CRow>

            {/* ── Items Table ── */}
            <div className="mb-4">
              <div className="fw-bold mb-2" style={{ color: '#1e3c78', fontSize: '1rem' }}>📦 Items / Materials</div>
              <div style={{ overflowX: 'auto', borderRadius: 10, border: '1.5px solid #c5d8f8' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead style={{ background: '#1e3c78', color: '#fff' }}>
                    <tr>
                      {['#', 'Item / Description', 'HSN', 'UOM', 'Qty', 'Rate', 'Taxable Amt', 'GST%',
                        ...(isInter ? ['IGST'] : ['CGST', 'SGST']),
                        'Total', 'Remark'
                      ].map((h, i) => (
                        <th key={i} style={{ padding: '10px 10px', fontWeight: 600, whiteSpace: 'nowrap', textAlign: ['Qty', 'Rate', 'Taxable Amt', 'IGST', 'CGST', 'SGST', 'Total'].includes(h) ? 'right' : 'left' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr key={idx} style={{ background: idx % 2 === 0 ? '#f5f8ff' : '#fff', borderBottom: '1px solid #dce8fa' }}>
                        <td style={{ padding: '10px', textAlign: 'center', color: '#666', fontWeight: 600 }}>{idx + 1}</td>
                        <td style={{ padding: '10px', maxWidth: 200 }}>
                          <div className="fw-semibold">{item.item_name}</div>
                          {item.description && <div className="text-muted" style={{ fontSize: '0.78rem' }}>{item.description}</div>}
                        </td>
                        <td style={{ padding: '10px', color: '#666' }}>{item.hsn_code || '—'}</td>
                        <td style={{ padding: '10px' }}>{item.uom || '—'}</td>
                        <td style={{ padding: '10px', textAlign: 'right', fontFamily: 'monospace' }}>{fmtCur(item.qty)}</td>
                        <td style={{ padding: '10px', textAlign: 'right', fontFamily: 'monospace' }}>₹ {fmtCur(item.rate)}</td>
                        <td style={{ padding: '10px', textAlign: 'right', fontFamily: 'monospace' }}>₹ {fmtCur(item.taxable_amount)}</td>
                        <td style={{ padding: '10px', textAlign: 'right' }}>{fmtCur(item.gst_percent)}%</td>
                        {isInter
                          ? <td style={{ padding: '10px', textAlign: 'right', fontFamily: 'monospace', color: '#666' }}>₹ {fmtCur(item.igst_amount)}</td>
                          : <>
                              <td style={{ padding: '10px', textAlign: 'right', fontFamily: 'monospace', color: '#666' }}>₹ {fmtCur(item.cgst_amount)}</td>
                              <td style={{ padding: '10px', textAlign: 'right', fontFamily: 'monospace', color: '#666' }}>₹ {fmtCur(item.sgst_amount)}</td>
                            </>
                        }
                        <td style={{ padding: '10px', textAlign: 'right', fontWeight: 700, color: '#1e3c78', fontFamily: 'monospace' }}>₹ {fmtCur(item.total_amount)}</td>
                        <td style={{ padding: '10px', color: '#888', fontSize: '0.82rem' }}>{item.remark || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── Financial Summary ── */}
            <CRow className="mb-4">
              <CCol md={7}>
                {/* Terms */}
                {(po.payment_terms || po.delivery_terms || po.terms_and_conditions || po.notes) && (
                  <div style={{ background: '#fffdf0', border: '1.5px solid #e8d880', borderRadius: 10, padding: '16px' }}>
                    <div className="fw-bold mb-2" style={{ color: '#7c5800', fontSize: '0.95rem' }}>📋 Terms & Conditions</div>
                    {po.payment_terms && <div className="mb-2"><strong>Payment Terms:</strong><div className="text-muted" style={{ whiteSpace: 'pre-wrap', fontSize: '0.85rem' }}>{po.payment_terms}</div></div>}
                    {po.delivery_terms && <div className="mb-2"><strong>Delivery Terms:</strong><div className="text-muted" style={{ whiteSpace: 'pre-wrap', fontSize: '0.85rem' }}>{po.delivery_terms}</div></div>}
                    {po.terms_and_conditions && <div className="mb-2"><strong>Terms & Conditions:</strong><div className="text-muted" style={{ whiteSpace: 'pre-wrap', fontSize: '0.85rem' }}>{po.terms_and_conditions}</div></div>}
                    {po.notes && <div><strong>Notes:</strong><div className="text-muted" style={{ whiteSpace: 'pre-wrap', fontSize: '0.85rem' }}>{po.notes}</div></div>}
                  </div>
                )}
              </CCol>
              <CCol md={5}>
                <div style={{ background: 'linear-gradient(135deg, #f0f4ff, #e0eaff)', border: '2px solid #1e3c78', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ background: '#1e3c78', color: '#fff', padding: '10px 16px', fontWeight: 700, fontSize: '0.95rem' }}>💰 Financial Summary</div>
                  <div style={{ padding: '12px 16px' }}>
                    {[
                      { label: 'Sub Total', val: subtotal },
                      ...(discount > 0 ? [{ label: 'Discount', val: discount, minus: true }] : []),
                      { label: 'Taxable Amount', val: taxable, bold: true },
                      ...(isInter ? [{ label: 'IGST', val: igst }] : [
                        ...(cgst > 0 ? [{ label: 'CGST', val: cgst }] : []),
                        ...(sgst > 0 ? [{ label: 'SGST', val: sgst }] : []),
                      ]),
                      { label: 'Total Tax', val: totalTax },
                      ...(Math.abs(roundOff) > 0.001 ? [{ label: 'Round Off', val: roundOff }] : []),
                    ].map((row, i) => (
                      <div key={i} className="d-flex justify-content-between py-1" style={{ borderBottom: '1px solid #c5d8f8', fontWeight: row.bold ? 600 : 400 }}>
                        <span className="text-muted">{row.label}</span>
                        <span style={{ fontFamily: 'monospace', color: row.minus ? '#c00' : '#333' }}>
                          {row.minus ? '(-) ' : ''}₹ {fmtCur(Math.abs(row.val))}
                        </span>
                      </div>
                    ))}
                    <div className="d-flex justify-content-between mt-3 pt-2" style={{ borderTop: '2.5px solid #1e3c78', fontWeight: 800, fontSize: '1.2rem', color: '#1e3c78' }}>
                      <span>Grand Total</span>
                      <span style={{ fontFamily: 'monospace' }}>₹ {fmtCur(finalAmount)}</span>
                    </div>
                    <div className="mt-2 p-2 text-center" style={{ background: '#fff3cd', borderRadius: 6, fontSize: '0.8rem', fontStyle: 'italic' }}>
                      {numberToWords(finalAmount)}
                    </div>
                  </div>
                </div>
              </CCol>
            </CRow>

            {/* ── Signature Section ── */}
            <CRow className="mt-5 d-print-flex">
              <CCol md={5}>
                <div className="text-center" style={{ borderTop: '1.5px solid #666', paddingTop: 8, marginTop: 60 }}>
                  <div className="fw-bold">{vendor.name || 'Vendor'}</div>
                  <div className="text-muted" style={{ fontSize: '0.82rem' }}>Vendor Signature & Seal</div>
                </div>
              </CCol>
              <CCol md={2} />
              <CCol md={5}>
                <div className="text-center" style={{ borderTop: '1.5px solid #666', paddingTop: 8, marginTop: 60 }}>
                  <div className="fw-bold">{co.company_name || 'Authorized Signatory'}</div>
                  <div className="text-muted" style={{ fontSize: '0.82rem' }}>Authorized Signatory</div>
                </div>
              </CCol>
            </CRow>

          </CCardBody>
        </CCard>

        {/* Bottom Download Button */}
        <div className="text-center mt-4 mb-5 d-print-none">
          <CButton
            color="success"
            size="lg"
            onClick={handleDownload}
            disabled={downloading}
            className="d-flex align-items-center gap-2 mx-auto fw-bold"
            style={{ background: 'linear-gradient(90deg, #1e7e34, #28a745)', border: 'none', borderRadius: 10, padding: '12px 40px', fontSize: '1rem' }}
          >
            {downloading ? <CSpinner size="sm" /> : <CIcon icon={cilCloudDownload} />}
            {downloading ? 'Generating PDF...' : '⬇️ Download Purchase Order PDF'}
          </CButton>
          <div className="text-muted mt-2" style={{ fontSize: '0.85rem' }}>Standard A4 PDF with company letterhead, GST breakup, terms & signatures</div>
        </div>

      </div>

      {/* ── Status Change & Note Modal ── */}
      <CModal visible={statusModal.show} onClose={() => setStatusModal(s => ({ ...s, show: false }))} alignment="center">
        <CModalHeader>
          <CModalTitle className="h6 mb-0">Update Status - {po?.po_number}</CModalTitle>
        </CModalHeader>
        <form onSubmit={handleStatusSubmit}>
          <CModalBody>
            <div className="mb-3">
              <CFormLabel className="fw-semibold">Current Status:</CFormLabel>
              <div>
                <CBadge color={statusColors[po?.status] || 'secondary'} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                  {po?.status}
                </CBadge>
              </div>
            </div>

            <div className="mb-3">
              <CFormLabel className="fw-semibold">New Status <span className="text-danger">*</span></CFormLabel>
              <CFormSelect
                value={statusModal.newStatus}
                onChange={e => setStatusModal(s => ({ ...s, newStatus: e.target.value }))}
                required
              >
                {['Draft', 'Issued', 'Partially Received', 'Completed', 'Cancelled'].map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </CFormSelect>
            </div>

            <div className="mb-2">
              <CFormLabel className="fw-semibold">Add Note / Reason <span className="text-muted fw-normal">(Optional)</span></CFormLabel>
              <CFormTextarea
                rows={3}
                placeholder="Enter note or reason for status change (e.g. Received 50% material, cancelled by vendor, etc.)..."
                value={statusModal.note}
                onChange={e => setStatusModal(s => ({ ...s, note: e.target.value }))}
              />
              <div className="form-text" style={{ fontSize: '0.8rem' }}>
                This note will be recorded with date, time, and user in the PO history.
              </div>
            </div>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setStatusModal(s => ({ ...s, show: false }))} disabled={statusModal.loading}>
              Cancel
            </CButton>
            <CButton type="submit" color="primary" disabled={statusModal.loading}>
              {statusModal.loading ? <CSpinner size="sm" /> : 'Update Status & Save Note'}
            </CButton>
          </CModalFooter>
        </form>
      </CModal>
    </div>
  )
}

export default PurchaseOrderView
