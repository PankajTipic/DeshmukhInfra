import React, { useState } from 'react'
import { postAPICall } from '../../../util/api'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CForm,
  CFormInput,
  CButton,
  CRow,
  CCol,
  CAlert,
  CFormSelect,
  CFormLabel,
} from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../../common/toast/ToastContext'

function MachineryForm({ onSuccess }) {
  const [machineName, setMachineName] = useState('')
  const [regNumber, setRegNumber] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate();
  const [ownRent, setOwnRent] = useState('')

  const { showToast } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      const response = await postAPICall('/api/machineries', {
        machine_name: machineName,
        reg_number: regNumber,
        ownership_type:ownRent
      })

      setSuccess(response.data.message)
      setMachineName('')
      setRegNumber('')
      setOwnRent('')
      showToast("success","Machine Add Successfully")

navigate('/MachineriesTable')
      // ✅ refresh parent table if callback provided
      if (onSuccess) onSuccess()
    } catch (err) {
      console.error('Error saving machinery:', err)
      // setError(err.response?.data?.message || 'Failed to save machinery')
       showToast("Danger","Failed to save machinery")
    }
  }

 const handleClose = async()=>{

navigate('/MachineriesTable')


 }

  return (
    <CCard className="mb-4">
      <CCardHeader>
        <strong>Add New Machinery</strong>
      </CCardHeader>
      <CCardBody>
        {error && <CAlert color="danger">{error}</CAlert>}
        {success && <CAlert color="success">{success}</CAlert>}

        <CForm onSubmit={handleSubmit}>
          <CRow className="mb-3">
            <CCol md={4}>
              <CFormInput
                label="Machine Name"
                placeholder='Enter Machine Name'
                type="text"
                value={machineName}
                onChange={(e) => setMachineName(e.target.value)}
                required
              />
            </CCol>
            <CCol md={4}>
              <CFormInput
                label="Registration Number"
                placeholder='Enter Registration Number'
                type="text"
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value)}
                required
              />
            </CCol>

            <CCol md={4}>
             <CFormLabel>Ownership Type</CFormLabel>
<CFormSelect
  value={ownRent}                          // current value
  onChange={(e) => setOwnRent(e.target.value)}  // update state
  required
>
  <option value="">-- Select Option --</option>
  <option value="Own">Own</option>
  <option value="Rent">Rent</option>
</CFormSelect>

            </CCol>
          </CRow>

          <CButton type="submit" color="primary">
            Save Machinery
          </CButton> &nbsp;&nbsp;&nbsp;
           <CButton onClick={handleClose} color="secondary">
           Close
          </CButton>
        </CForm>
      </CCardBody>
    </CCard>
  )
}

export default MachineryForm
