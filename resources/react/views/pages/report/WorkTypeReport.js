import React, { useEffect, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CFormInput,
  CFormLabel,
  CButton,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CSpinner,
} from '@coreui/react'
import { getAPICall } from '../../../util/api'
import { useToast } from '../../common/toast/ToastContext'

const WorkTypeReport = () => {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [reportData, setReportData] = useState([])

  // Default to current month
  const today = new Date()
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)

  const formatDate = (d) => d.toISOString().split('T')[0]

  const [fromDate, setFromDate] = useState(formatDate(firstDay))
  const [toDate, setToDate] = useState(formatDate(lastDay))

  const fetchReport = async () => {
    setLoading(true)
    try {
      const resp = await getAPICall(
        `/api/worklog/report?from_date=${fromDate}&to_date=${toDate}`
      )
      if (resp && resp.data) {
        setReportData(resp.data)
      } else {
        setReportData([])
      }
    } catch (error) {
      showToast('danger', 'Error fetching report: ' + error)
      setReportData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReport()
  }, [])

  const handleFilter = () => {
    if (!fromDate || !toDate) {
      showToast('danger', 'Please select both From and To dates.')
      return
    }
    fetchReport()
  }

  // Compute totals
  const totals = reportData.reduce(
    (acc, row) => {
      acc.done += row.done || 0
      acc.hrs += row.hrs || 0
      acc.fuel += row.fuel || 0
      return acc
    },
    { done: 0, hrs: 0, fuel: 0 }
  )
  const totalWorkPerHr = totals.hrs > 0 ? (totals.done / totals.hrs).toFixed(2) : '—'
  const totalWorkPerL = totals.fuel > 0 ? (totals.done / totals.fuel).toFixed(2) : '—'

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader className="bg-primary text-white">
            <strong>Work Type Report</strong>
          </CCardHeader>
          <CCardBody>
            {/* Date Filter */}
            <CRow className="mb-3 align-items-end">
              <CCol sm={4}>
                <CFormLabel>From Date</CFormLabel>
                <CFormInput
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </CCol>
              <CCol sm={4}>
                <CFormLabel>To Date</CFormLabel>
                <CFormInput
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </CCol>
              <CCol sm={4}>
                <CButton color="primary" onClick={handleFilter} disabled={loading}>
                  {loading ? <CSpinner size="sm" className="me-1" /> : null}
                  Filter
                </CButton>
              </CCol>
            </CRow>

            <hr />

            {/* Report Table */}
            <div className="table-responsive">
              <CTable bordered hover striped>
                <CTableHead color="dark">
                  <CTableRow>
                    <CTableHeaderCell scope="col">WORK TYPE</CTableHeaderCell>
                    <CTableHeaderCell scope="col" className="text-end">DONE</CTableHeaderCell>
                    <CTableHeaderCell scope="col" className="text-end">HRS</CTableHeaderCell>
                    <CTableHeaderCell scope="col" className="text-end">FUEL (L)</CTableHeaderCell>
                    <CTableHeaderCell scope="col" className="text-end">WORK/HR</CTableHeaderCell>
                    <CTableHeaderCell scope="col" className="text-end">WORK/L</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {reportData.length === 0 && !loading && (
                    <CTableRow>
                      <CTableDataCell colSpan={6} className="text-center text-muted py-4">
                        No data found for the selected date range.
                      </CTableDataCell>
                    </CTableRow>
                  )}
                  {loading && (
                    <CTableRow>
                      <CTableDataCell colSpan={6} className="text-center py-4">
                        <CSpinner color="primary" />
                      </CTableDataCell>
                    </CTableRow>
                  )}
                  {!loading && reportData.map((row, index) => (
                    <CTableRow key={index}>
                      <CTableDataCell>
                        <div className="fw-semibold">{row.type_name || '—'}</div>
                        {row.uom && (
                          <small className="text-muted">{row.uom}</small>
                        )}
                      </CTableDataCell>
                      <CTableDataCell className="text-end">{row.done ?? 0}</CTableDataCell>
                      <CTableDataCell className="text-end">{row.hrs ?? 0}</CTableDataCell>
                      <CTableDataCell className="text-end">{row.fuel ?? 0}</CTableDataCell>
                      <CTableDataCell className="text-end">
                        {row.work_per_hr !== null && row.work_per_hr !== undefined ? row.work_per_hr : '—'}
                      </CTableDataCell>
                      <CTableDataCell className="text-end">
                        {row.work_per_l !== null && row.work_per_l !== undefined ? row.work_per_l : '—'}
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                  {/* Totals Row */}
                  {!loading && reportData.length > 0 && (
                    <CTableRow className="fw-bold table-warning">
                      <CTableDataCell>TOTAL</CTableDataCell>
                      <CTableDataCell className="text-end">{totals.done.toFixed(2)}</CTableDataCell>
                      <CTableDataCell className="text-end">{totals.hrs.toFixed(2)}</CTableDataCell>
                      <CTableDataCell className="text-end">{totals.fuel.toFixed(2)}</CTableDataCell>
                      <CTableDataCell className="text-end">{totalWorkPerHr}</CTableDataCell>
                      <CTableDataCell className="text-end">{totalWorkPerL}</CTableDataCell>
                    </CTableRow>
                  )}
                </CTableBody>
              </CTable>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default WorkTypeReport
