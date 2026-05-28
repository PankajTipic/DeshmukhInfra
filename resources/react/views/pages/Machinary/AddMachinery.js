// import React, { useState } from 'react'
// import { postAPICall } from '../../../util/api'
// import {
//   CCard,
//   CCardBody,
//   CCardHeader,
//   CForm,
//   CFormInput,
//   CButton,
//   CRow,
//   CCol,
//   CAlert,
//   CFormSelect,
//   CFormLabel,
// } from '@coreui/react'
// import { useNavigate } from 'react-router-dom'
// import { useToast } from '../../common/toast/ToastContext'

// function MachineryForm({ onSuccess }) {
//   const [machineName, setMachineName] = useState('')
//   const [regNumber, setRegNumber] = useState('')
//   const [error, setError] = useState('')
//   const [success, setSuccess] = useState('')
//   const navigate = useNavigate();
//   const [ownRent, setOwnRent] = useState('')

//   const { showToast } = useToast()

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     setError('')
//     setSuccess('')

//     try {
//       const response = await postAPICall('/api/machineries', {
//         machine_name: machineName,
//         reg_number: regNumber,
//         ownership_type:ownRent
//       })

//       setSuccess(response.data.message)
//       setMachineName('')
//       setRegNumber('')
//       setOwnRent('')
//       showToast("success","Machine Add Successfully")

// navigate('/MachineriesTable')
//       // ✅ refresh parent table if callback provided
//       if (onSuccess) onSuccess()
//     } catch (err) {
//       console.error('Error saving machinery:', err)
//       // setError(err.response?.data?.message || 'Failed to save machinery')
//        showToast("Danger","Failed to save machinery")
//     }
//   }

//  const handleClose = async()=>{

// navigate('/MachineriesTable')


//  }

//   return (
//     <CCard className="mb-4">
//       <CCardHeader>
//         <strong>Add New Machinery</strong>
//       </CCardHeader>
//       <CCardBody>
//         {error && <CAlert color="danger">{error}</CAlert>}
//         {success && <CAlert color="success">{success}</CAlert>}

//         <CForm onSubmit={handleSubmit}>
//           <CRow className="mb-3">
//             <CCol md={4}>
//               <CFormInput
//                 label="Machine Name"
//                 placeholder='Enter Machine Name'
//                 type="text"
//                 value={machineName}
//                 onChange={(e) => setMachineName(e.target.value)}
//                 required
//               />
//             </CCol>
//             <CCol md={4}>
//               <CFormInput
//                 label="Registration Number"
//                 placeholder='Enter Registration Number'
//                 type="text"
//                 value={regNumber}
//                 onChange={(e) => setRegNumber(e.target.value)}
//                 required
//               />
//             </CCol>

//             <CCol md={4}>
//              <CFormLabel>Ownership Type</CFormLabel>
// <CFormSelect
//   value={ownRent}                          // current value
//   onChange={(e) => setOwnRent(e.target.value)}  // update state
//   required
// >
//   <option value="">-- Select Option --</option>
//   <option value="Own">Own</option>
//   <option value="Rent">Rent</option>
// </CFormSelect>

//             </CCol>
//           </CRow>

//           <CButton type="submit" color="primary">
//             Save Machinery
//           </CButton> &nbsp;&nbsp;&nbsp;
//            <CButton onClick={handleClose} color="secondary">
//            Close
//           </CButton>
//         </CForm>
//       </CCardBody>
//     </CCard>
//   )
// }

// export default MachineryForm










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
  CFormTextarea,
  // CTextarea,
} from '@coreui/react'

import { useNavigate } from 'react-router-dom'
import { useToast } from '../../common/toast/ToastContext'

function MachineryForm({ onSuccess }) {

  const navigate = useNavigate()
  const { showToast } = useToast()

  // Machinery Details
  const [machineName, setMachineName] = useState('')
  const [regNumber, setRegNumber] = useState('')
  const [ownRent, setOwnRent] = useState('')

  // Documents
  const [documents, setDocuments] = useState([
    {
      document_type: '',
      document_number: '',
      issue_date: '',
      expiry_date: '',
      document_file: '',
      remark: '',
    },
  ])

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Add New Document Row
  const addDocumentRow = () => {
    setDocuments([
      ...documents,
      {
        document_type: '',
        document_number: '',
        issue_date: '',
        expiry_date: '',
        document_file: '',
        remark: '',
      },
    ])
  }

  // Remove Document Row
  const removeDocumentRow = (index) => {
    const updated = [...documents]
    updated.splice(index, 1)
    setDocuments(updated)
  }

  // Handle Document Change
  const handleDocumentChange = (index, field, value) => {
    const updated = [...documents]
    updated[index][field] = value
    setDocuments(updated)
  }



  const validateDates = () => {
    for (let doc of documents) {
      if (doc.issue_date && doc.expiry_date) {
        const issue = new Date(doc.issue_date)
        const expiry = new Date(doc.expiry_date)

        if (expiry < issue) {
          return `Expiry Date cannot be before Issue Date for document: ${doc.document_type || 'Untitled'}`
        }
      }
    }
    return null
  }



  const handleSubmit = async (e) => {

    e.preventDefault()

    setError('')
    setSuccess('')

    try {

      const payload = {
        machine_name: machineName,
        reg_number: regNumber,
        ownership_type: ownRent,
        documents: documents,
      }

      const response = await postAPICall('/api/machineries', payload)

      setSuccess(response.data.message)

      showToast('success', 'Machine Added Successfully')

      // Reset Form
      setMachineName('')
      setRegNumber('')
      setOwnRent('')

      setDocuments([
        {
          document_type: '',
          document_number: '',
          issue_date: '',
          expiry_date: '',
          document_file: '',
          remark: '',
        },
      ])

      navigate('/MachineriesTable')

      if (onSuccess) onSuccess()

    } catch (err) {

      console.error('Error saving machinery:', err)

      setError(err.response?.data?.message || 'Failed to save machinery')

      showToast('danger', 'Failed to save machinery')
    }
  }

  const handleClose = () => {
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

          {/* Machinery Details */}

          <CRow className="mb-4">

            <CCol md={4}>
              <CFormInput
                label="Machine Name"
                placeholder="Enter Machine Name"
                value={machineName}
                onChange={(e) => setMachineName(e.target.value)}
                required
              />
            </CCol>

            <CCol md={4}>
              <CFormInput
                label="Registration Number"
                placeholder="Enter Registration Number"
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value)}
                required
              />
            </CCol>

            <CCol md={4}>
              <CFormLabel>Ownership Type</CFormLabel>

              <CFormSelect
                value={ownRent}
                onChange={(e) => setOwnRent(e.target.value)}
                required
              >
                <option value="">-- Select Option --</option>
                <option value="Own">Own</option>
                <option value="Rent">Rent</option>
              </CFormSelect>
            </CCol>

          </CRow>

          {/* Documents Section */}

          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5>Machinery Documents</h5>

            <CButton
              type="button"
              color="success"
              onClick={addDocumentRow}
            >
              + Add Document
            </CButton>
          </div>

          {documents.map((doc, index) => (

            <CCard className="mb-3 border" key={index}>

              <CCardBody>

                <CRow className="mb-3">

                  <CCol md={3}>
                    <CFormLabel>Document Type</CFormLabel>

                    <CFormSelect
                      value={doc.document_type}
                      onChange={(e) =>
                        handleDocumentChange(index, 'document_type', e.target.value)
                      }
                      required
                    >
                      <option value="">Select Type</option>
                      <option value="PUC">PUC</option>
                      <option value="INSURANCE">Insurance</option>
                      <option value="FITNESS">Fitness</option>
                      <option value="PERMIT">Permit</option>
                      <option value="ROAD_TAX">Road Tax</option>
                      <option value="OTHER">Other</option>
                    </CFormSelect>
                  </CCol>

                  <CCol md={3}>
                    <CFormInput
                      label="Document Number"
                      value={doc.document_number}
                      onChange={(e) =>
                        handleDocumentChange(index, 'document_number', e.target.value)
                      }
                    />
                  </CCol>

                  <CCol md={3}>
                    <CFormInput
                      type="date"
                      label="Issue Date"
                      value={doc.issue_date}
                      onChange={(e) =>
                        handleDocumentChange(index, 'issue_date', e.target.value)
                      }
                    />
                  </CCol>

                  {/* <CCol md={3}>
                    <CFormInput
                      type="date"
                      label="Expiry Date"
                      value={doc.expiry_date}
                      onChange={(e) =>
                        handleDocumentChange(index, 'expiry_date', e.target.value)
                      }
                    />
                  </CCol> */}


                  <CCol md={3}>
                    <CFormInput
                      type="date"
                      label="Expiry Date"
                      value={doc.expiry_date}
                      min={doc.issue_date}  
                      onChange={(e) => handleDocumentChange(index, 'expiry_date', e.target.value)}
                    />
                  </CCol>

                </CRow>

                <CRow>

                  {/* <CCol md={5}>
                    <CFormInput
                      label="Document File"
                      placeholder="Upload path or URL"
                      value={doc.document_file}
                      onChange={(e) =>
                        handleDocumentChange(index, 'document_file', e.target.value)
                      }
                    />
                  </CCol> */}

                  <CCol md={5}>
                    <CFormTextarea
                      label="Remark"
                      rows={1}
                      value={doc.remark}
                      onChange={(e) =>
                        handleDocumentChange(index, 'remark', e.target.value)
                      }
                    />
                  </CCol>

                  <CCol
                    md={2}
                    className="d-flex align-items-end"
                  >
                    <CButton
                      type="button"
                      color="danger"
                      onClick={() => removeDocumentRow(index)}
                    >
                      Remove
                    </CButton>
                  </CCol>

                </CRow>

              </CCardBody>

            </CCard>

          ))}

          {/* Buttons */}

          <div className="mt-4">

            <CButton type="submit" color="primary">
              Save Machinery
            </CButton>

            &nbsp;&nbsp;

            <CButton
              type="button"
              color="secondary"
              onClick={handleClose}
            >
              Close
            </CButton>

          </div>

        </CForm>

      </CCardBody>

    </CCard>
  )
}

export default MachineryForm