import React, { useState } from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CForm,
  CFormLabel,
  CFormInput,
  CRow,
  CCol,
  CAlert,
} from '@coreui/react'
import { cilCalendar, cilCloudDownload, cilX } from '@coreui/icons'
import CIcon from '@coreui/icons-react'

const DateRangeModal = ({ visible, onClose, onDownload, isAllProjects = false }) => {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [error, setError] = useState('')

  const handleDownload = () => {
    // Validation
    if (!startDate || !endDate) {
      setError('Please select both start and end dates')
      return
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError('Start date cannot be after end date')
      return
    }

    setError('')
    onDownload(startDate, endDate)
    handleClose()
  }

  const handleClose = () => {
    setStartDate('')
    setEndDate('')
    setError('')
    onClose()
  }

  // Quick date range buttons
  const setQuickRange = (days) => {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - days)
    
    setStartDate(start.toISOString().split('T')[0])
    setEndDate(end.toISOString().split('T')[0])
    setError('')
  }

  const setCurrentMonth = () => {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    
    setStartDate(start.toISOString().split('T')[0])
    setEndDate(end.toISOString().split('T')[0])
    setError('')
  }

  const setLastMonth = () => {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const end = new Date(now.getFullYear(), now.getMonth(), 0)
    
    setStartDate(start.toISOString().split('T')[0])
    setEndDate(end.toISOString().split('T')[0])
    setError('')
  }

  const setCurrentYear = () => {
    const now = new Date()
    const start = new Date(now.getFullYear(), 0, 1)
    const end = new Date(now.getFullYear(), 11, 31)
    
    setStartDate(start.toISOString().split('T')[0])
    setEndDate(end.toISOString().split('T')[0])
    setError('')
  }

  const setLastYear = () => {
    const now = new Date()
    const start = new Date(now.getFullYear() - 1, 0, 1)
    const end = new Date(now.getFullYear() - 1, 11, 31)
    
    setStartDate(start.toISOString().split('T')[0])
    setEndDate(end.toISOString().split('T')[0])
    setError('')
  }

  const setCurrentQuarter = () => {
    const now = new Date()
    const quarter = Math.floor(now.getMonth() / 3)
    const start = new Date(now.getFullYear(), quarter * 3, 1)
    const end = new Date(now.getFullYear(), quarter * 3 + 3, 0)
    
    setStartDate(start.toISOString().split('T')[0])
    setEndDate(end.toISOString().split('T')[0])
    setError('')
  }

  const setAllTime = () => {
    // Set a reasonable "all time" range - last 5 years to today
    const end = new Date()
    const start = new Date()
    start.setFullYear(start.getFullYear() - 5)
    
    setStartDate(start.toISOString().split('T')[0])
    setEndDate(end.toISOString().split('T')[0])
    setError('')
  }

  return (
    <CModal visible={visible} onClose={handleClose} backdrop="static" size="lg">
      <CModalHeader>
        <CModalTitle>
          <CIcon icon={cilCalendar} className="me-2" />
          Select Date Range for Income Report
        </CModalTitle>
      </CModalHeader>
      
      <CModalBody>
        {error && (
          <CAlert color="danger" dismissible onClose={() => setError('')}>
            {error}
          </CAlert>
        )}

        {isAllProjects && (
          <CAlert color="info" className="mb-3">
            <strong>📊 Income Report for All Projects</strong>
            <p className="mb-0 mt-1 small">
              This report will include income/payment records from all projects within the selected date range.
            </p>
          </CAlert>
        )}

        <CForm>
          {/* Custom Date Range Section */}
          <div className="mb-4">
            <h6 className="mb-3">📅 Custom Date Range</h6>
            <CRow>
              <CCol md={6} className="mb-3 mb-md-0">
                <CFormLabel htmlFor="startDate" className="fw-bold">
                  Start Date <span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value)
                    setError('')
                  }}
                  max={endDate || undefined}
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="endDate" className="fw-bold">
                  End Date <span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value)
                    setError('')
                  }}
                  min={startDate || undefined}
                />
              </CCol>
            </CRow>
          </div>

          {/* Quick Select Section */}
          <div className="mb-3">
            <h6 className="mb-3">⚡ Quick Select:</h6>
            
            {/* Days */}
            <div className="mb-3">
              <small className="text-muted d-block mb-2 fw-bold">Days:</small>
              <div className="d-flex flex-wrap gap-2">
                <CButton size="sm" color="secondary" variant="outline" onClick={() => setQuickRange(7)}>
                  Last 7 Days
                </CButton>
                <CButton size="sm" color="secondary" variant="outline" onClick={() => setQuickRange(15)}>
                  Last 15 Days
                </CButton>
                <CButton size="sm" color="secondary" variant="outline" onClick={() => setQuickRange(30)}>
                  Last 30 Days
                </CButton>
                <CButton size="sm" color="secondary" variant="outline" onClick={() => setQuickRange(90)}>
                  Last 90 Days
                </CButton>
              </div>
            </div>

            {/* Months */}
            <div className="mb-3">
              <small className="text-muted d-block mb-2 fw-bold">Months:</small>
              <div className="d-flex flex-wrap gap-2">
                <CButton size="sm" color="info" variant="outline" onClick={setCurrentMonth}>
                  Current Month
                </CButton>
                <CButton size="sm" color="info" variant="outline" onClick={setLastMonth}>
                  Last Month
                </CButton>
              </div>
            </div>

            {/* Quarters & Years */}
            <div className="mb-3">
              <small className="text-muted d-block mb-2 fw-bold">Quarters & Years:</small>
              <div className="d-flex flex-wrap gap-2">
                <CButton size="sm" color="warning" variant="outline" onClick={setCurrentQuarter}>
                  Current Quarter
                </CButton>
                <CButton size="sm" color="warning" variant="outline" onClick={setCurrentYear}>
                  Current Year
                </CButton>
                <CButton size="sm" color="warning" variant="outline" onClick={setLastYear}>
                  Last Year
                </CButton>
              </div>
            </div>

            {/* All Time */}
            <div>
              <small className="text-muted d-block mb-2 fw-bold">All Time:</small>
              <div className="d-flex flex-wrap gap-2">
                <CButton size="sm" color="dark" variant="outline" onClick={setAllTime}>
                  All Time (Last 5 Years)
                </CButton>
              </div>
            </div>
          </div>

          {/* Selected Range Display */}
          {startDate && endDate && (
            <div className="alert alert-success mb-0">
              <strong>✓ Selected Range:</strong> {new Date(startDate).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })} to {new Date(endDate).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })}
            </div>
          )}
        </CForm>
      </CModalBody>

      <CModalFooter>
        <CButton color="secondary" onClick={handleClose}>
          <CIcon icon={cilX} className="me-1" />
          Cancel
        </CButton>
        <CButton 
          color="success" 
          onClick={handleDownload}
          disabled={!startDate || !endDate}
        >
          <CIcon icon={cilCloudDownload} className="me-1" />
          Download Income Report
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default DateRangeModal