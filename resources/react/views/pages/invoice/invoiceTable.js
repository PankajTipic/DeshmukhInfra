
import React, { useEffect, useRef, useState,  useCallback } from 'react'
import {
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CCard,
  CCardHeader,
  CCardBody,
  CSpinner,
  CBadge,
  CAlert,
  CFormCheck,
  CButtonGroup,
} from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import { deleteAPICall, getAPICall, put } from '../../../util/api'
import { cilArrowRight, cilPencil, cilPlus, cilHistory, cilNotes, cilCloudDownload, cilChart, cilAperture, cilTrash } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import CombinedPaymentModal from './CombinedPaymentModal'
import UpdateProjectModal from '../projects/UpdateProjectModal'
import DateRangeModal from './DateRangeModal'
import { generateWorkOrdersPDF } from './pdfGenerator'
import { generateIncomeReportPDF } from './incomeReportGenerator'

const OrderList = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState({})
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' })
  const [selectedOrders, setSelectedOrders] = useState([])
  const [downloadingPDF, setDownloadingPDF] = useState(false)
  const [downloadingIncome, setDownloadingIncome] = useState(false)

  const [loadingMore, setLoadingMore] = useState(false)
const [hasMore, setHasMore] = useState(true)
const [nextCursor, setNextCursor] = useState(null)
const observerTarget = useRef(null)

  // Modal states
  const [showCombinedModal, setShowCombinedModal] = useState(false)
  const [showDateRangeModal, setShowDateRangeModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [selectedIncomeData, setSelectedIncomeData] = useState(null)

  const [projects, setProjects] = useState([])
  const [projectTypes, setProjectTypes] = useState([])


 const [filters, setFilters] = useState({
  project_id: '',
  project_type_id: '',
  from_date: '',
  to_date: '',
  date_sort: 'desc',
})






  const navigate = useNavigate()

  const [showUpdateProjectModal, setShowUpdateProjectModal] = useState(false)
  const [selectedOrderForUpdate, setSelectedOrderForUpdate] = useState(null)

  const handleConvertClick = (order) => {
    setSelectedOrderForUpdate(order)
    setShowUpdateProjectModal(true)
  }

  // Invoice status mappings
  const getStatusInfo = (invoiceType) => {
    switch (invoiceType) {
      case 1:
        return { text: 'Quotation', color: 'secondary', nextAction: 'Convert to Work Order' }
      case 2:
        return { text: 'Work Order', color: 'success', nextAction: null }
      case 0:
        return { text: 'Cancelled', color: 'danger', nextAction: null }
      default:
        return { text: 'Unknown', color: 'light', nextAction: null }
    }
  }

  const getNextInvoiceType = (currentType) => {
    switch (currentType) {
      case 1: return 2
      default: return null
    }
  }




const fetchProjects = async () => {
  try {
    const res = await getAPICall('/api/projects') // or your project list API
    setProjects(res || [])
    const typesRes = await getAPICall('/api/project-types')
    setProjectTypes(typesRes || [])
  } catch (err) {
    console.error('Failed to load projects/types', err)
  }
}

useEffect(() => {
  fetchProjects()
}, [])






//   const fetchOrders = async (cursor = null, isLoadMore = false) => {
//   try {
//     if (isLoadMore) {
//       setLoadingMore(true)
//     } else {
//       setLoading(true)
//     }

//     // Build URL with cursor for pagination
//     const url = cursor 
//       ? `/api/getAllData?cursor=${cursor}&perPage=25`
//       : '/api/getAllData?perPage=25'
    
//     const response = await getAPICall(url)
    
//     if (isLoadMore) {
//       // Append new data to existing orders (for infinite scroll)
//       setOrders(prev => [...prev, ...(response.data || [])])
//     } else {
//       // Replace orders (for initial load or refresh)
//       setOrders(response.data || [])
//     }
    
//     // Update pagination state from API response
//     setNextCursor(response.next_cursor)
//     setHasMore(response.has_more_pages)
    
//   } catch (error) {
//     console.error('Error fetching orders:', error)
//     showAlert('Failed to fetch orders', 'danger')
//   } finally {
//     setLoading(false)
//     setLoadingMore(false)
//   }
// }


const fetchOrders = async (cursor = null, isLoadMore = false) => {
  try {
    if (isLoadMore) {
      setLoadingMore(true)
    } else {
      setLoading(true)
    }

    const params = new URLSearchParams({
      perPage: 25,
      ...filters,
    })

    if (cursor) {
      params.append('cursor', cursor)
    }

    const response = await getAPICall(`/api/getAllData?${params.toString()}`)

    if (isLoadMore) {
      setOrders(prev => [...prev, ...(response.data || [])])
    } else {
      setOrders(response.data || [])
    }

    setNextCursor(response.next_cursor)
    setHasMore(response.has_more_pages)

  } catch (error) {
    console.error('Error fetching orders:', error)
    showAlert('Failed to fetch orders', 'danger')
  } finally {
    setLoading(false)
    setLoadingMore(false)
  }
}


  useEffect(() => {
    fetchOrders()
  }, [])





  const applyFilters = () => {
  setOrders([])
  setNextCursor(null)
  setHasMore(true)
  fetchOrders(null, false)
}

const resetFilters = () => {
  setFilters({
    project: '',
    project_type_id: '',
    from_date: '',
    to_date: '',
    date_sort: 'desc',
  })
  setOrders([])
  setNextCursor(null)
  setHasMore(true)
  fetchOrders(null, false)
}




const loadMore = useCallback(() => {
  if (!loadingMore && !loading && hasMore && nextCursor) {
    fetchOrders(nextCursor, true)
  }
}, [loadingMore, loading, hasMore, nextCursor])


useEffect(() => {
  const observer = new IntersectionObserver(
    entries => {
      // When the target element is visible and we have more data
      if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
        loadMore()
      }
    },
    { 
      threshold: 0.1, // Trigger when 10% of element is visible
      rootMargin: '100px' // Start loading 100px before reaching the element
    }
  )

  const currentTarget = observerTarget.current
  if (currentTarget) {
    observer.observe(currentTarget)
  }

  // Cleanup
  return () => {
    if (currentTarget) {
      observer.unobserve(currentTarget)
    }
  }
}, [hasMore, loadingMore, loading, loadMore])


  // Alert helper
  const showAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type })
    setTimeout(() => setAlert({ show: false, message: '', type: 'success' }), 5000)
  }

  // Handle select all checkbox
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const workOrders = orders.filter(order => order.invoiceType === 2)
      setSelectedOrders(workOrders)
    } else {
      setSelectedOrders([])
    }
  }

  // Handle individual checkbox
  const handleSelectOrder = (order) => {
    setSelectedOrders(prev => {
      const isSelected = prev.some(o => o.id === order.id)
      if (isSelected) {
        return prev.filter(o => o.id !== order.id)
      } else {
        return [...prev, order]
      }
    })
  }

  // Check if order is selected
  const isOrderSelected = (orderId) => {
    return selectedOrders.some(o => o.id === orderId)
  }

  // Download Work Order Details PDF
  const handleDownloadWorkOrderPDF = async () => {
    if (selectedOrders.length === 0) {
      showAlert('Please select at least one work order to download', 'warning')
      return
    }

    setDownloadingPDF(true)
    try {
      await generateWorkOrdersPDF(selectedOrders)
      showAlert(`PDF generated successfully for ${selectedOrders.length} work order(s)`, 'success')
      setSelectedOrders([])
    } catch (error) {
      console.error('Error generating PDF:', error)
      showAlert('Failed to generate PDF. Please try again.', 'danger')
    } finally {
      setDownloadingPDF(false)
    }
  }

  // Open Date Range Modal for Income Report (ALL PROJECTS)
  const handleAllProjectsIncomeReportClick = () => {
    setShowDateRangeModal(true)
  }

  // Download Income Report PDF for ALL projects
  const handleDownloadAllProjectsIncomeReport = async (startDate, endDate) => {
    setDownloadingIncome(true)
    setShowDateRangeModal(false)
    
    try {
      await generateIncomeReportPDF(startDate, endDate)
      showAlert('Income report generated successfully for all projects', 'success')
    } catch (error) {
      console.error('Error generating income report:', error)
      showAlert(error.message || 'Failed to generate income report. Please try again.', 'danger')
    } finally {
      setDownloadingIncome(false)
    }
  }

  // Status progression
  const handleStatusProgression = async (order) => {
    const nextType = getNextInvoiceType(order.invoiceType)
    if (!nextType) return

    setActionLoading(prev => ({ ...prev, [`progress_${order.id}`]: true }))

    try {
      const response = await put(`/api/updateInvoiceStatus/${order.id}`, {
        invoiceType: nextType
      })

      if (response.success) {
        showAlert(`Successfully converted to ${getStatusInfo(nextType).text}`, 'success')
        fetchOrders()
      } else {
        throw new Error(response.message || 'Update failed')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      showAlert(error.response?.data?.message || 'Failed to update status', 'danger')
    } finally {
      setActionLoading(prev => ({ ...prev, [`progress_${order.id}`]: false }))
    }
  }

  // Navigate to create Proforma Invoice
  const handleCreateProformaInvoice = (order) => {
    navigate('/create-proforma-invoice', { 
      state: { 
        workOrderId: order.id,
        workOrderData: order 
      } 
    })
  }

  // Open payment log modal
  const handlePaymentLog = async (order) => {
    try {
      setActionLoading(prev => ({ ...prev, [`log_${order.id}`]: true }))

      const response = await getAPICall(`/api/proforma-invoices?work_order_id=${order.id}`)
      
      setSelectedOrder(order)
      setSelectedIncomeData({
        workOrderId: order.id,
        workOrder: order,
        proformaInvoices: response.data || []
      })
      setShowCombinedModal(true)
    } catch (error) {
      console.error('Error fetching proforma invoices:', error)
      showAlert(`Failed to open payment log for order ${order.id}`, 'danger')
    } finally {
      setActionLoading(prev => ({ ...prev, [`log_${order.id}`]: false }))
    }
  }

  const handlePaymentUpdated = (orderId, amount) => {
    showAlert(`Payment updated successfully!`, 'success')
    fetchOrders()
  }

  const handleView = (id) => navigate(`/invoice-details/${id}`)
  const handleEdit = (id) => navigate(`/edit-order/${id}`)

  // Count work orders for selection
  const workOrderCount = orders.filter(order => order.invoiceType === 2).length
  const allWorkOrdersSelected = workOrderCount > 0 && selectedOrders.length === workOrderCount






  const [showDeleteModal, setShowDeleteModal] = useState(false)
const [selectedDeleteOrder, setSelectedDeleteOrder] = useState(null)
const [deleteLoading, setDeleteLoading] = useState(false)

const openDeleteModal = (order) => {
  setSelectedDeleteOrder(order)
  setShowDeleteModal(true)
}


const handleDeleteOrder = async (orderId) => {
  try {
    setDeleteLoading(true)

    const response = await deleteAPICall(`/api/ClearAllOrderDetailsById/${orderId}`)

    if (response.status) {
      showAlert('Order deleted successfully', 'success')
      fetchOrders()
    } else {
      showAlert(response.msg || 'Failed to delete order', 'danger')
    }

  } catch (error) {
    console.error('Delete Error:', error)
    showAlert('Error deleting order', 'danger')
  } finally {
    setDeleteLoading(false)
    setShowDeleteModal(false)
  }
}
















  return (
    <>
      <CCard>
        {/* <CCardHeader>
          <div className="d-flex justify-content-between align-items-center flex-wrap">
            <h5 className="mb-0">Invoice Management</h5>
          </div>
        </CCardHeader> */}
        <CCardHeader>
  <div className="d-flex justify-content-between align-items-center flex-wrap">
    <h5 className="mb-0">Invoice Management</h5>
    <div className="text-muted small">
      {orders.length} invoice{orders.length !== 1 ? 's' : ''} loaded
      {hasMore && ' (scroll for more)'}
    </div>
  </div>
</CCardHeader>
        <CCardBody>




<CCard className="mb-3">
  <CCardBody>
    <div className="row g-2 align-items-end">

      {/* Project Search */}
<div className="col-md-3">
  <label className="form-label">Project Type</label>
  <select
    className="form-select"
    value={filters.project_type_id}
    onChange={(e) =>
      setFilters({ ...filters, project_type_id: e.target.value })
    }
  >
    <option value="">All Project Types</option>
    {projectTypes.map((pt) => (
      <option key={pt.id} value={pt.id}>
        {pt.name}
      </option>
    ))}
  </select>
</div>

 {/* Project Dropdown */}
<div className="col-md-3">
  <label className="form-label">Project</label>
  <select
    className="form-select"
    value={filters.project_id}
    onChange={(e) =>
      setFilters({ ...filters, project_id: e.target.value })
    }
  >
    <option value="">All Projects</option>

    {projects.map((p) => (
      <option key={p.id} value={p.id}>
        {p.project_name}
      </option>
    ))}
  </select>
</div>


      {/* From Date */}
      <div className="col-md-2">
        <label className="form-label">From Date</label>
        <input
          type="date"
          className="form-control"
          value={filters.from_date}
          onChange={(e) => setFilters({ ...filters, from_date: e.target.value })}
        />
      </div>

      {/* To Date */}
      <div className="col-md-2">
        <label className="form-label">To Date</label>
        <input
          type="date"
          className="form-control"
          value={filters.to_date}
          onChange={(e) => setFilters({ ...filters, to_date: e.target.value })}
        />
      </div>

      {/* Date Sort */}
      <div className="col-md-2">
        <label className="form-label">Sort Date</label>
        <select
          className="form-select"
          value={filters.date_sort}
          onChange={(e) => setFilters({ ...filters, date_sort: e.target.value })}
        >
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
        </select>
      </div>

      {/* Buttons */}
      <div className="col-md-3 d-flex gap-2">
        <CButton color="primary" onClick={applyFilters}>
          Apply
        </CButton>
        <CButton color="secondary" variant="outline" onClick={resetFilters}>
          Reset
        </CButton>
      </div>

    </div>
  </CCardBody>
</CCard>









          {/* Action Buttons Section - Mobile Responsive */}
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
              <div>
                {selectedOrders.length > 0 && (
                  <span className="text-muted small">
                    {selectedOrders.length} work order(s) selected
                  </span>
                )}
              </div>
              <div className="d-flex flex-wrap gap-2">
                {/* Work Order PDF Button */}
                <CButton
                  color="primary"
                  onClick={handleDownloadWorkOrderPDF}
                  disabled={selectedOrders.length === 0 || downloadingPDF}
                  className="d-flex align-items-center"
                  size="sm"
                >
                  {downloadingPDF ? (
                    <>
                      <CSpinner size="sm" className="me-1" />
                      <span className="d-none d-md-inline">Generating...</span>
                    </>
                  ) : (
                    <>
                      <CIcon icon={cilCloudDownload} className="me-1" />
                      <span className="d-none d-sm-inline">Work Order PDF</span>
                      <span className="d-inline d-sm-none">WO</span>
                      {selectedOrders.length > 0 && ` (${selectedOrders.length})`}
                    </>
                  )}
                </CButton>

                {/* Income Report Button - For ALL Projects */}
                <CButton
                  color="success"
                  onClick={handleAllProjectsIncomeReportClick}
                  disabled={downloadingIncome}
                  className="d-flex align-items-center"
                  size="sm"
                >
                  {downloadingIncome ? (
                    <>
                      <CSpinner size="sm" className="me-1" />
                      <span className="d-none d-md-inline">Generating...</span>
                    </>
                  ) : (
                    <>
                      <CIcon icon={cilChart} className="me-1" />
                      <span className="d-none d-sm-inline">Income Report</span>
                      <span className="d-inline d-sm-none">Income</span>
                    </>
                  )}
                </CButton>
              </div>
            </div>
          </div>

          {alert.show && (
            <CAlert color={alert.type} dismissible onClose={() => setAlert({ show: false, message: '', type: 'success' })}>
              {alert.message}
            </CAlert>
          )}

          {loading ? (
            <div className="text-center my-3">
              <CSpinner color="primary" />
            </div>
          ) : (
            <>
            <div className="table-responsive">
              <CTable bordered hover>
                <CTableHead color="dark">
                  <CTableRow>
                    <CTableHeaderCell style={{ width: '50px' }}>
                      <CFormCheck
                        checked={allWorkOrdersSelected}
                        onChange={handleSelectAll}
                        disabled={workOrderCount === 0}
                        title="Select all work orders"
                      />
                    </CTableHeaderCell>
                    <CTableHeaderCell className="d-none d-md-table-cell">Sr.No.</CTableHeaderCell>
                    <CTableHeaderCell>Invoice Number</CTableHeaderCell>
                    <CTableHeaderCell className="d-none d-lg-table-cell">Project Name</CTableHeaderCell>
                    <CTableHeaderCell className="d-none d-xl-table-cell">Customer Name</CTableHeaderCell>
                    <CTableHeaderCell className="d-none d-lg-table-cell">Date</CTableHeaderCell>
                    <CTableHeaderCell className="d-none d-md-table-cell">Total (Rs)</CTableHeaderCell>
                    <CTableHeaderCell className="d-none d-md-table-cell">Paid (Rs)</CTableHeaderCell>
                    <CTableHeaderCell>Status</CTableHeaderCell>
                    <CTableHeaderCell>Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {orders.length > 0 ? (
                    orders.map((order, index) => {
                      const statusInfo = getStatusInfo(order.invoiceType)
                      const totalAmount = order.finalAmount || order.totalAmount || 0
                      const paidAmount = order.paidAmount || 0
                      const remainingAmount = totalAmount - paidAmount
                      const isWorkOrder = order.invoiceType === 2

                      return (
                       
                        <CTableRow key={order.id}>
                          <CTableDataCell>
                            {isWorkOrder ? (
                              <CFormCheck
                                checked={isOrderSelected(order.id)}
                                onChange={() => handleSelectOrder(order)}
                              />
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </CTableDataCell>
                          <CTableDataCell className="d-none d-md-table-cell">{index + 1}</CTableDataCell>
                          <CTableDataCell>
                            <strong>{order.invoice_number || `ORD-${order.id}`}</strong>
                            <div className="d-lg-none">
                              <small className="text-muted d-block">
                                {order.project?.project_name || 'N/A'}
                              </small>
                              {order.project?.projectType?.name && (
                                <small className="text-muted d-block">
                                  Type: {order.project.projectType.name}
                                </small>
                              )}
                              <small className="text-muted d-xl-none">
                                {order.project?.customer_name || 'N/A'}
                              </small>
                            </div>
                          </CTableDataCell>
                          <CTableDataCell className="d-none d-lg-table-cell">
                            {order.project?.project_name || 'N/A'}
                            {order.project?.projectType?.name && (
                              <div className="text-muted small">Type: {order.project.projectType.name}</div>
                            )}
                            {order.project?.work_place && (
                              <div className="text-muted small">📍 {order.project.work_place}</div>
                            )}
                          </CTableDataCell>
                          <CTableDataCell className="d-none d-xl-table-cell">
                            {order.project?.customer_name || order.customer?.name || 'N/A'}
                            {order.project?.mobile_number && (
                              <div className="text-muted small">📞 {order.project.mobile_number}</div>
                            )}
                          </CTableDataCell>
                          <CTableDataCell className="d-none d-lg-table-cell">
                            {order.invoiceDate ? new Date(order.invoiceDate).toLocaleDateString() : 'N/A'}
                          </CTableDataCell>
                          <CTableDataCell className="d-none d-md-table-cell">
                            <strong>Rs {totalAmount.toLocaleString()}</strong>
                          </CTableDataCell>
                          <CTableDataCell className="d-none d-md-table-cell">
                            <span className={paidAmount > 0 ? 'text-success' : 'text-muted'}>
                              Rs {paidAmount.toLocaleString()}
                            </span>
                          </CTableDataCell>
                          <CTableDataCell>
                            <CBadge color={statusInfo.color} className="mb-1">
                              {statusInfo.text}
                            </CBadge>
                            {remainingAmount > 0 && isWorkOrder && (
                              <div className="text-danger small">
                                <strong>Rs {remainingAmount.toLocaleString()}</strong>
                              </div>
                            )}
                          </CTableDataCell>
                          <CTableDataCell>
                            <div className="d-flex gap-1 flex-wrap">
                              <CButton color="info" size="sm" onClick={() => handleView(order.id)} title="View Details">
                                <CIcon icon={cilAperture} />
                              </CButton>
                              <CButton color="success" size="sm" onClick={() => handleEdit(order.id)} title="Edit Invoice">
                                <CIcon icon={cilPencil} />
                              </CButton>



                          





                              {statusInfo.nextAction && order.invoiceType === 1 && (
                                <CButton
                                  color="warning"
                                  size="sm"
                                  onClick={() => handleConvertClick(order)}
                                  disabled={actionLoading[`progress_${order.id}`]}
                                  title={statusInfo.nextAction}
                                >
                                  {actionLoading[`progress_${order.id}`] ? <CSpinner size="sm" /> : <CIcon icon={cilArrowRight} />}
                                </CButton>
                              )}
                              {isWorkOrder && remainingAmount > 0 && (
                                <CButton
                                  color="primary"
                                  size="sm"
                                  onClick={() => handleCreateProformaInvoice(order)}
                                  title="Create Proforma Invoice"
                                >
                                  <CIcon icon={cilNotes} />
                                </CButton>
                              )}
                              {isWorkOrder && (
                                <CButton
                                  color="secondary"
                                  size="sm"
                                  onClick={() => handlePaymentLog(order)}
                                  disabled={actionLoading[`log_${order.id}`]}
                                  title="View Proforma Invoices & Payments"
                                >
                                  {actionLoading[`log_${order.id}`] ? <CSpinner size="sm" /> : <CIcon icon={cilHistory} />}
                                </CButton>
                              )}


  <CButton
  color="danger"
  size="sm"
  onClick={() => openDeleteModal(order)}
  title="Delete Order"
>
  <CIcon icon={cilTrash} />
</CButton>

                            </div>
                          </CTableDataCell>
                        </CTableRow>
                      )
                    })
                  ) : (
                    <CTableRow>
                      <CTableDataCell colSpan={10} className="text-center py-4">
                        <div className="text-muted">
                          <h6>No invoices found</h6>
                          <p>Create your first invoice to get started</p>
                        </div>
                      </CTableDataCell>
                    </CTableRow>
                  )}
                </CTableBody>
              </CTable>
            </div>



        
                <div 
                  ref={observerTarget} 
                  style={{ height: '20px', margin: '20px 0' }}
                >
                  {loadingMore && (
                    <div className="text-center">
                      <CSpinner color="primary" size="sm" />
                      <span className="ms-2 text-muted small">Loading more invoices...</span>
                    </div>
                  )}
                  {!hasMore && orders.length > 0 && (
                    <div className="text-center text-muted small">
                      <hr />
                      <p>All invoices loaded ({orders.length} total)</p>
                    </div>
                  )}
                </div>
                </>


          )}
        </CCardBody>
      </CCard>

      <CombinedPaymentModal
        visible={showCombinedModal}
        onClose={() => { setShowCombinedModal(false); setSelectedIncomeData(null) }}
        incomeData={selectedIncomeData}
        onPaymentUpdated={handlePaymentUpdated}
      />

      {/* Date Range Modal for Income Report - ALL PROJECTS */}
      <DateRangeModal
        visible={showDateRangeModal}
        onClose={() => setShowDateRangeModal(false)}
        onDownload={handleDownloadAllProjectsIncomeReport}
        isAllProjects={true}
      />

      <UpdateProjectModal
        visible={showUpdateProjectModal}
        onClose={() => { setShowUpdateProjectModal(false); setSelectedOrderForUpdate(null) }}
        orderData={selectedOrderForUpdate}
        onUpdated={() => {
          showAlert('Status & project updated successfully', 'success')
          fetchOrders()
        }}
      />








{/* DELETE CONFIRMATION MODAL */}
{showDeleteModal && selectedDeleteOrder && (
  <div 
    className="modal fade show" 
    style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }}
  >
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">

        <div className="modal-header">
          <h5 className="modal-title">
            Delete order - {selectedDeleteOrder.invoice_number || `ORD-${selectedDeleteOrder.id}`}?
          </h5>
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setShowDeleteModal(false)}
          />
        </div>

        <div className="modal-body">
          <p>
            Do you really want to <span className="text-danger fw-bold">Delete</span> this transaction?
          </p>
        </div>

        <div className="modal-footer">
          <CButton 
            color="secondary" 
            onClick={() => setShowDeleteModal(false)}
          >
            Close
          </CButton>

          <CButton 
            color="danger" 
            onClick={() => handleDeleteOrder(selectedDeleteOrder.id)}
            disabled={deleteLoading}
          >
            {deleteLoading ? (
              <CSpinner size="sm" />
            ) : (
              'Yes'
            )}
          </CButton>
        </div>

      </div>
    </div>
  </div>
)}









    </>
  )
}

export default OrderList