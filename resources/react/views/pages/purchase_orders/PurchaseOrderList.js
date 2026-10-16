import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Select from 'react-select'
import {
  CCard, CCardBody, CCardHeader, CButton, CSpinner,
  CBadge, CFormInput, CRow, CCol, CModal, CModalHeader,
  CModalTitle, CModalBody, CModalFooter, CAlert,
  CFormSelect, CFormTextarea, CFormLabel
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilPencil, cilTrash, cilDescription, cilCloudDownload, cilSearch } from '@coreui/icons'
import { getAPICall, deleteAPICall, put } from '../../../util/api'
import { useToast } from '../../common/toast/ToastContext'
import { generatePurchaseOrderPDF } from './PurchaseOrderPDF'

const fmtCur = (v) => Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const statusColors = {
  Issued: 'success', Draft: 'secondary', 'Partially Received': 'warning',
  Completed: 'primary', Cancelled: 'danger'
}

/* ════════════════════════════════════════
   PurchaseOrderList
════════════════════════════════════════ */
const PurchaseOrderList = () => {
  const navigate  = useNavigate()
  const { showToast } = useToast()

  const [orders,    setOrders]    = useState([])
  const [loading,   setLoading]   = useState(true)
  const [page,      setPage]      = useState(1)
  const [lastPage,  setLastPage]  = useState(1)
  const [total,     setTotal]     = useState(0)
  const [summary,   setSummary]   = useState({ total_pos: 0, total_amount: 0 })
  const perPage = 20

  const [vendors,  setVendors]  = useState([])

  const [filters, setFilters] = useState({
    search:    '',
    vendor_id: null,
    from_date: '',
    to_date:   '',
    status:    '',
  })

  const [deleteModal,    setDeleteModal]    = useState({ show: false, id: null, po_number: '' })
  const [deleteLoading,  setDeleteLoading]  = useState(false)
  const [pdfLoading,     setPdfLoading]     = useState({})

  const [statusModal,    setStatusModal]    = useState({
    show: false,
    order: null,
    newStatus: '',
    note: '',
    loading: false
  })

  const openStatusModal = (order) => {
    setStatusModal({
      show: true,
      order,
      newStatus: order.status || 'Issued',
      note: '',
      loading: false
    })
  }

  const handleStatusSubmit = async (e) => {
    e?.preventDefault()
    if (!statusModal.order || !statusModal.newStatus) return

    try {
      setStatusModal(s => ({ ...s, loading: true }))
      const res = await put(`/api/purchase-orders/${statusModal.order.id}/status`, {
        status: statusModal.newStatus,
        note: statusModal.note
      })
      if (res?.success) {
        showToast('success', res.message || 'Status updated successfully')
        setOrders(prev => prev.map(o => o.id === statusModal.order.id ? { ...o, status: statusModal.newStatus, notes: res.data?.notes || o.notes } : o))
        setStatusModal({ show: false, order: null, newStatus: '', note: '', loading: false })
      } else {
        showToast('danger', res?.message || 'Failed to update status')
        setStatusModal(s => ({ ...s, loading: false }))
      }
    } catch (err) {
      showToast('danger', err?.message || 'Error updating status')
      setStatusModal(s => ({ ...s, loading: false }))
    }
  }

  const searchTimer = useRef(null)

  // Fetch vendors for filter
  useEffect(() => {
    getAPICall('/api/getPurchesVendor')
      .then(v => setVendors(Array.isArray(v) ? v : []))
      .catch(() => {})
  }, [])

  const fetchOrders = useCallback(async (currentPage = 1, f = filters) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        per_page: perPage,
        page:     currentPage,
        ...(f.search    && { search:    f.search }),
        ...(f.vendor_id && { vendor_id: f.vendor_id }),
        ...(f.from_date && { from_date: f.from_date }),
        ...(f.to_date   && { to_date:   f.to_date }),
        ...(f.status    && { status:    f.status }),
      })
      const res = await getAPICall(`/api/purchase-orders?${params}`)
      if (res?.success) {
        setOrders(res.data || [])
        setLastPage(res.last_page || 1)
        setTotal(res.total || 0)
        setSummary(res.summary || { total_pos: 0, total_amount: 0 })
      }
    } catch { showToast('danger', 'Failed to load Purchase Orders') }
    finally { setLoading(false) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  useEffect(() => {
    fetchOrders(1, filters)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const applyFilters = (newFilters) => {
    setFilters(newFilters)
    setPage(1)
    fetchOrders(1, newFilters)
  }

  const setFilterField = (k, v) => {
    const f = { ...filters, [k]: v }
    if (k === 'search') {
      clearTimeout(searchTimer.current)
      searchTimer.current = setTimeout(() => applyFilters(f), 400)
      setFilters(f)
    } else {
      applyFilters(f)
    }
  }

  const handlePageChange = (p) => {
    setPage(p)
    fetchOrders(p)
  }

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      const res = await deleteAPICall(`/api/purchase-orders/${deleteModal.id}`)
      if (res?.success) {
        showToast('success', `Purchase Order ${deleteModal.po_number} deleted.`)
        setDeleteModal({ show: false, id: null, po_number: '' })
        fetchOrders(page)
      } else {
        showToast('danger', res?.message || 'Delete failed')
      }
    } catch { showToast('danger', 'Error deleting Purchase Order') }
    finally { setDeleteLoading(false) }
  }

  const handleDownloadPDF = async (order) => {
    setPdfLoading(prev => ({ ...prev, [order.id]: true }))
    try {
      // Fetch full details for PDF
      const res = await getAPICall(`/api/purchase-orders/${order.id}`)
      if (res?.success) {
        await generatePurchaseOrderPDF(res.data, 'save')
        showToast('success', `PDF for ${order.po_number} downloaded!`)
      }
    } catch { showToast('danger', 'Failed to generate PDF') }
    finally { setPdfLoading(prev => ({ ...prev, [order.id]: false })) }
  }

  const vendorOptions = vendors.map(v => ({ value: v.id, label: v.name }))

  return (
    <div className="po-list-wrapper w-100 mb-4">
      <div className="w-100">

        {/* ── Page Title ── */}
        <div className="d-flex align-items-center gap-3 mb-4 flex-wrap">
          <div>
            <h2 className="mb-0 fw-bold" style={{ color: '#1e3c78', fontSize: '1.7rem' }}>🛒 Purchase Orders</h2>
            <div className="text-muted" style={{ fontSize: '0.88rem' }}>Manage all purchase orders for vendors</div>
          </div>
          <CButton
            color="primary"
            onClick={() => navigate('/purchase-orders/create')}
            className="ms-auto d-flex align-items-center gap-2 fw-bold"
            style={{ background: 'linear-gradient(90deg, #1e3c78, #2a5298)', border: 'none', borderRadius: 8, padding: '10px 24px' }}
          >
            <CIcon icon={cilPlus} /> New Purchase Order
          </CButton>
        </div>

        {/* ── Summary Cards ── */}
        <CRow className="mb-4 g-3">
          {[
            { label: 'Total Purchase Orders', val: total, color: '#1e3c78', icon: '📋', sub: 'All POs this account' },
            { label: 'Total PO Value', val: `₹ ${fmtCur(summary.total_amount)}`, color: '#1e7e34', icon: '💰', sub: 'Across all POs' },
          ].map((card, i) => (
            <CCol md={3} key={i}>
              <div style={{ background: '#fff', border: `2px solid ${card.color}20`, borderRadius: 12, padding: '18px 20px', borderLeft: `4px solid ${card.color}`, boxShadow: '0 2px 8px #0001' }}>
                <div style={{ fontSize: '1.6rem' }}>{card.icon}</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: card.color, fontFamily: 'monospace' }}>{card.val}</div>
                <div style={{ fontSize: '0.82rem', color: '#666' }}>{card.label}</div>
                <div style={{ fontSize: '0.75rem', color: '#aaa' }}>{card.sub}</div>
              </div>
            </CCol>
          ))}
        </CRow>

        {/* ── Filters ── */}
        <CCard className="mb-4 shadow-sm" style={{ borderRadius: 12, border: '1.5px solid #d0dff8' }}>
          <CCardBody style={{ padding: '16px 20px' }}>
            <CRow className="g-2 align-items-end">
              <CCol md={3}>
                <div className="d-flex align-items-center gap-2 mb-1"><CIcon icon={cilSearch} size="sm" className="text-muted" /><small className="text-muted fw-semibold">Search</small></div>
                <CFormInput
                  placeholder="PO number, vendor, ref..."
                  value={filters.search}
                  onChange={e => setFilterField('search', e.target.value)}
                  style={{ borderRadius: 8 }}
                />
              </CCol>
              <CCol md={3}>
                <small className="text-muted fw-semibold d-block mb-1">Vendor</small>
                <Select
                  options={[{ value: null, label: 'All Vendors' }, ...vendorOptions]}
                  value={vendorOptions.find(o => o.value === filters.vendor_id) || { value: null, label: 'All Vendors' }}
                  onChange={o => setFilterField('vendor_id', o?.value ?? null)}
                  styles={{ menu: b => ({ ...b, zIndex: 9999 }), control: b => ({ ...b, borderRadius: 8 }) }}
                />
              </CCol>
              <CCol md={2}>
                <small className="text-muted fw-semibold d-block mb-1">Status</small>
                <select
                  className="form-select"
                  value={filters.status}
                  onChange={e => setFilterField('status', e.target.value)}
                  style={{ borderRadius: 8 }}
                >
                  <option value="">All Status</option>
                  {['Issued', 'Draft', 'Partially Received', 'Completed', 'Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </CCol>
              <CCol md={2}>
                <small className="text-muted fw-semibold d-block mb-1">From Date</small>
                <CFormInput type="date" value={filters.from_date} onChange={e => setFilterField('from_date', e.target.value)} style={{ borderRadius: 8 }} />
              </CCol>
              <CCol md={2}>
                <small className="text-muted fw-semibold d-block mb-1">To Date</small>
                <CFormInput type="date" value={filters.to_date} onChange={e => setFilterField('to_date', e.target.value)} style={{ borderRadius: 8 }} />
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>

        {/* ── Table ── */}
        <CCard className="shadow-sm" style={{ borderRadius: 12, border: '1.5px solid #d0dff8' }}>
          <CCardHeader style={{ background: 'linear-gradient(90deg, #1e3c78, #2a5298)', color: '#fff', borderRadius: '10px 10px 0 0', padding: '14px 20px' }} className="d-flex justify-content-between align-items-center">
            <strong>📋 All Purchase Orders ({total})</strong>
            <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>Page {page} of {lastPage}</span>
          </CCardHeader>
          <CCardBody style={{ padding: 0 }}>
            {loading ? (
              <div className="text-center p-5"><CSpinner color="primary" /><p className="mt-3 text-muted">Loading...</p></div>
            ) : orders.length === 0 ? (
              <div className="text-center p-5">
                <div style={{ fontSize: '3rem' }}>📦</div>
                <p className="text-muted mt-2">No Purchase Orders found. Create your first PO!</p>
                <CButton color="primary" onClick={() => navigate('/purchase-orders/create')}>
                  <CIcon icon={cilPlus} className="me-1" /> New Purchase Order
                </CButton>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead style={{ background: '#f0f4ff', position: 'sticky', top: 0 }}>
                    <tr style={{ borderBottom: '2px solid #d0dff8' }}>
                      {['#', 'PO Number', 'Vendor', 'Project', 'PO Date', 'Del. Date', 'Items', 'Amount', 'Status', 'Actions'].map((h, i) => (
                        <th key={i} style={{ padding: '12px 12px', fontWeight: 700, color: '#1e3c78', textAlign: h === 'Amount' ? 'right' : 'left', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order, idx) => (
                      <tr key={order.id} style={{ background: idx % 2 === 0 ? '#fff' : '#f9faff', borderBottom: '1px solid #e8eef8' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#edf2ff'}
                        onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? '#fff' : '#f9faff'}
                      >
                        <td style={{ padding: '12px 12px', color: '#999' }}>{(page - 1) * perPage + idx + 1}</td>
                        <td style={{ padding: '12px 12px', fontWeight: 700, color: '#1e3c78', fontFamily: 'monospace' }}>
                          {order.po_number}
                          {order.reference_no && <div className="text-muted" style={{ fontSize: '0.75rem' }}>Ref: {order.reference_no}</div>}
                        </td>
                        <td style={{ padding: '12px 12px' }}>
                          <div className="fw-semibold">{order.vendor?.name || '—'}</div>
                          {order.vendor?.gst_no && <div className="text-muted" style={{ fontSize: '0.75rem' }}>GSTIN: {order.vendor.gst_no}</div>}
                        </td>
                        <td style={{ padding: '12px 12px', color: '#555' }}>{order.project?.project_name || '—'}</td>
                        <td style={{ padding: '12px 12px', whiteSpace: 'nowrap' }}>{fmtDate(order.po_date)}</td>
                        <td style={{ padding: '12px 12px', whiteSpace: 'nowrap', color: order.delivery_date ? '#333' : '#bbb' }}>
                          {fmtDate(order.delivery_date)}
                        </td>
                        <td style={{ padding: '12px 12px', textAlign: 'center' }}>
                          <CBadge color="info" shape="rounded-pill">{order.items?.length || 0}</CBadge>
                        </td>
                        <td style={{ padding: '12px 12px', textAlign: 'right', fontWeight: 700, fontFamily: 'monospace', color: '#1e3c78' }}>
                          ₹ {fmtCur(order.final_amount)}
                        </td>
                        <td style={{ padding: '12px 12px' }}>
                          <CBadge
                            color={statusColors[order.status] || 'secondary'}
                            role="button"
                            onClick={() => openStatusModal(order)}
                            style={{ fontSize: '0.8rem', cursor: 'pointer', padding: '6px 10px' }}
                            title="Click to change status"
                          >
                            {order.status} ✏️
                          </CBadge>
                        </td>
                        <td style={{ padding: '12px 8px' }}>
                          <div className="d-flex gap-1 align-items-center">
                            <CButton
                              color="info" size="sm" variant="ghost" title="View"
                              onClick={() => navigate(`/purchase-orders/view/${order.id}`)}
                              style={{ borderRadius: 6 }}
                            >
                              <CIcon icon={cilDescription} size="sm" />
                            </CButton>
                            <CButton
                              color="warning" size="sm" variant="ghost" title="Edit"
                              onClick={() => navigate(`/purchase-orders/edit/${order.id}`)}
                              style={{ borderRadius: 6 }}
                            >
                              <CIcon icon={cilPencil} size="sm" />
                            </CButton>
                            <CButton
                              color="success" size="sm" variant="ghost" title="Download PDF"
                              onClick={() => handleDownloadPDF(order)}
                              disabled={pdfLoading[order.id]}
                              style={{ borderRadius: 6 }}
                            >
                              {pdfLoading[order.id] ? <CSpinner size="sm" /> : <CIcon icon={cilCloudDownload} size="sm" />}
                            </CButton>
                            <CButton
                              color="danger" size="sm" variant="ghost" title="Delete"
                              onClick={() => setDeleteModal({ show: true, id: order.id, po_number: order.po_number })}
                              style={{ borderRadius: 6 }}
                            >
                              <CIcon icon={cilTrash} size="sm" />
                            </CButton>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── Pagination ── */}
            {!loading && lastPage > 1 && (
              <div className="d-flex justify-content-center gap-2 p-3">
                <CButton size="sm" color="light" disabled={page <= 1} onClick={() => handlePageChange(page - 1)}>‹ Prev</CButton>
                {[...Array(lastPage)].map((_, i) => (
                  <CButton
                    key={i + 1}
                    size="sm"
                    color={page === i + 1 ? 'primary' : 'light'}
                    onClick={() => handlePageChange(i + 1)}
                    style={page === i + 1 ? { background: '#1e3c78', border: 'none' } : {}}
                  >
                    {i + 1}
                  </CButton>
                )).slice(Math.max(0, page - 3), page + 2)}
                <CButton size="sm" color="light" disabled={page >= lastPage} onClick={() => handlePageChange(page + 1)}>Next ›</CButton>
              </div>
            )}
          </CCardBody>
        </CCard>

      </div>

      {/* ── Delete Confirmation Modal ── */}
      <CModal visible={deleteModal.show} onClose={() => setDeleteModal({ show: false, id: null, po_number: '' })} alignment="center">
        <CModalHeader>
          <CModalTitle>🗑️ Delete Purchase Order</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p>Are you sure you want to delete <strong>{deleteModal.po_number}</strong>?</p>
          <p className="text-muted">This action cannot be undone. All items linked to this Purchase Order will also be deleted.</p>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setDeleteModal({ show: false, id: null, po_number: '' })} disabled={deleteLoading}>
            Cancel
          </CButton>
          <CButton color="danger" onClick={handleDelete} disabled={deleteLoading} className="d-flex align-items-center gap-1">
            {deleteLoading ? <CSpinner size="sm" /> : <CIcon icon={cilTrash} size="sm" />}
            {deleteLoading ? 'Deleting...' : 'Yes, Delete'}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* ── Status Change & Note Modal ── */}
      <CModal visible={statusModal.show} onClose={() => setStatusModal(s => ({ ...s, show: false }))} alignment="center">
        <CModalHeader>
          <CModalTitle className="h6 mb-0">Update Status - {statusModal.order?.po_number}</CModalTitle>
        </CModalHeader>
        <form onSubmit={handleStatusSubmit}>
          <CModalBody>
            <div className="mb-3">
              <CFormLabel className="fw-semibold">Current Status:</CFormLabel>
              <div>
                <CBadge color={statusColors[statusModal.order?.status] || 'secondary'} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                  {statusModal.order?.status}
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
                placeholder="Enter note or remark for status change (e.g. Received material, partial delivery, cancelled etc.)..."
                value={statusModal.note}
                onChange={e => setStatusModal(s => ({ ...s, note: e.target.value }))}
              />
              <div className="form-text" style={{ fontSize: '0.8rem' }}>
                This note will be saved in the PO audit history.
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

export default PurchaseOrderList
