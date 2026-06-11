// import React, { useEffect, useState } from 'react'
// import { getAPICall, deleteAPICall, put } from '../../../util/api'
// import {
//   CCard,
//   CCardBody,
//   CCardHeader,
//   CTable,
//   CTableBody,
//   CTableDataCell,
//   CTableHead,
//   CTableHeaderCell,
//   CTableRow,
//   CButton,
//   CModal,
//   CModalHeader,
//   CModalTitle,
//   CModalBody,
//   CModalFooter,
//   CFormInput,
//   CFormSelect,
// } from '@coreui/react'
// import { useNavigate } from 'react-router-dom'
// import { useToast } from '../../common/toast/ToastContext'

// function MachineriesTable() {
//   const [rows, setRows] = useState([])
//   const [visible, setVisible] = useState(false)
//   const [editData, setEditData] = useState({ id: null, machine_name: '', reg_number: '', ownership_type:'' })

//   const navigate = useNavigate();
//    const { showToast } = useToast()

//   const fetchMachineries = async () => {
//     try {
//       const response = await getAPICall('/api/machineries')
//       setRows(response.data)
//     } catch (error) {
//       console.error('Error fetching machineries:', error)
//     }
//   }

//   const handleDelete = async (id) => {
//     //if (!window.confirm('Are you sure you want to delete this machinery?')) return

//     try {
//       await deleteAPICall(`/api/machineries/${id}`)
//       fetchMachineries()
//       showToast("success",'Machine Delete Successfully')
//     } catch (error) {
//       console.error('Error deleting machinery:', error)
//       showToast("danger",'Error deleting machinery')
//     }
//   }

//   const handleEdit = (row) => {
//     setEditData({ id: row.id, machine_name: row.machine_name, reg_number: row.reg_number, ownership_type:row.ownership_type })
//     setVisible(true)
//   }

//   const handleUpdate = async () => {
//     try {
//       await put(`/api/machineries/${editData.id}`, {
//         machine_name: editData.machine_name,
//         reg_number: editData.reg_number,
//         ownership_type: editData.ownership_type
//       })
//       setVisible(false)
//       showToast("success","Machine update successfully")
//       fetchMachineries()
//     } catch (error) {
//       console.error('Error updating machinery:', error)
//       // alert('Failed to update machinery!')
//         showToast("danger","Failed to update machinery!")
//     }
//   }

//   const handleAdd = () => {
//     navigate('/addMachinery')
//   }

//   useEffect(() => {
//     fetchMachineries()
//   }, [])

//   return (
//     <>
//       <CCard className="mb-4">
//         <CCardHeader className="d-flex justify-content-between align-items-center">
//           <strong>Machineries List</strong>
//           <CButton color="danger" onClick={handleAdd}>
//             Add New Machinery
//           </CButton>
//         </CCardHeader>
//         <CCardBody>
//           <div className="table-responsive">
//             <CTable hover striped>
//               <CTableHead>
//                 <CTableRow>
//                   <CTableHeaderCell>Sr. No.</CTableHeaderCell>
//                   <CTableHeaderCell>Machine Name</CTableHeaderCell>
//                   <CTableHeaderCell>Reg. Number</CTableHeaderCell>
//                   <CTableHeaderCell>Ownership</CTableHeaderCell>

//                   <CTableHeaderCell>Action</CTableHeaderCell>
//                 </CTableRow>
//               </CTableHead>
//               <CTableBody>
//                 {rows.length > 0 ? (
//                   rows.map((row, index) => (
//                     <CTableRow key={row.id}>
//                       <CTableDataCell>{index + 1}</CTableDataCell>
//                       <CTableDataCell>{row.machine_name}</CTableDataCell>
//                       <CTableDataCell>{row.reg_number}</CTableDataCell>
//                       <CTableDataCell>{row.ownership_type}</CTableDataCell>

//                       <CTableDataCell className='d-flex flex-wrap gap-2'>
//                         <CButton
//                           color="info"
//                           size="sm"
//                           className="me-2 text-white"
//                           onClick={() => handleEdit(row)}
//                         >
//                           Edit
//                         </CButton>
//                         <CButton
//                           color="danger"
//                           size="sm"
//                           onClick={() => handleDelete(row.id)}
//                         >
//                           Delete
//                         </CButton>
//                       </CTableDataCell>
//                     </CTableRow>
//                   ))
//                 ) : (
//                   <CTableRow>
//                     <CTableDataCell colSpan={4} className="text-center">
//                       No machineries found
//                     </CTableDataCell>
//                   </CTableRow>
//                 )}
//               </CTableBody>
//             </CTable>
//           </div>
//         </CCardBody>
//       </CCard>

//       {/* Edit Modal */}
//       <CModal visible={visible} onClose={() => setVisible(false)}>
//         <CModalHeader closeButton>
//           <CModalTitle>Edit Machinery</CModalTitle>
//         </CModalHeader>
//         <CModalBody>
//           <CFormInput
//             className="mb-3"
//             type="text"
//             label="Machine Name"
//             value={editData.machine_name}
//             onChange={(e) => setEditData({ ...editData, machine_name: e.target.value })}
//           />
//           <CFormInput
//             type="text"
//             label="Reg. Number"
//             value={editData.reg_number}
//             onChange={(e) => setEditData({ ...editData, reg_number: e.target.value })}
//           />
//           <CFormSelect
//   label="Ownership Type"
//   value={editData.ownership_type || ""}   // ✅ handle null safely
//   onChange={(e) =>
//     setEditData({ ...editData, ownership_type: e.target.value })
//   }
// >
//   <option value="">-- Select Ownership Type --</option>
//   <option value="Own">Own</option>
//   <option value="Rent">Rent</option>
// </CFormSelect>

//         </CModalBody>

            

//         <CModalFooter>
//           <CButton color="secondary" onClick={() => setVisible(false)}>
//             Cancel
//           </CButton>
//           <CButton color="primary" onClick={handleUpdate}>
//             Save Changes
//           </CButton>
//         </CModalFooter>
//       </CModal>
//     </>
//   )
// }

// export default MachineriesTable










import React, { useEffect, useState } from 'react'
import { getAPICall, deleteAPICall, put } from '../../../util/api'

import {
  CCard,
  CCardBody,
  CCardHeader,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormInput,
  CFormSelect,
  CRow,
  CCol,
  // CTextarea,
  CFormTextarea,
} from '@coreui/react'

import { useNavigate } from 'react-router-dom'
import { useToast } from '../../common/toast/ToastContext'
import CIcon from '@coreui/icons-react'
import { cilChevronBottom, cilChevronRight } from '@coreui/icons'

function MachineriesTable() {

  const [rows, setRows] = useState([])

  const [visible, setVisible] = useState(false)

  const [editData, setEditData] = useState({
    id: null,
    machine_name: '',
    reg_number: '',
    ownership_type: '',
    documents: [],
  })

  const navigate = useNavigate()

  const { showToast } = useToast()

  // Fetch Data
  const fetchMachineries = async () => {

    try {

      const response = await getAPICall('/api/machineries')

      // setRows(response.data.data)
      setRows(response?.data || [])

    } catch (error) {

      console.error('Error fetching machineries:', error)
    }
  }


  // Validate Expiry Dates
  const validateDates = () => {
    for (let doc of editData.documents) {
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

  // Delete
  const handleDelete = async (id) => {

    try {

      await deleteAPICall(`/api/machineries/${id}`)

      fetchMachineries()

      showToast('success', 'Machine Deleted Successfully')

    } catch (error) {

      console.error('Error deleting machinery:', error)

      showToast('danger', 'Error deleting machinery')
    }
  }

  // Edit Open
  const handleEdit = (row) => {

    setEditData({
      id: row.id,
      machine_name: row.machine_name,
      reg_number: row.reg_number,
      ownership_type: row.ownership_type,
      documents: row.documents || [],
    })

    setVisible(true)
  }

  // Update Machinery
  const handleUpdate = async () => {

    try {

      await put(`/api/machineries/${editData.id}`, {

        machine_name: editData.machine_name,

        reg_number: editData.reg_number,

        ownership_type: editData.ownership_type,

        documents: editData.documents,

      })

      setVisible(false)

      showToast('success', 'Machine updated successfully')

      fetchMachineries()

    } catch (error) {

      console.error('Error updating machinery:', error)

      showToast('danger', error.message ||'Failed to update machinery!')
    }
  }

  // Add New Document Row
  const addDocument = () => {

    setEditData({
      ...editData,
      documents: [
        ...editData.documents,
        {
          document_type: '',
          document_number: '',
          issue_date: '',
          expiry_date: '',
          document_file: '',
          remark: '',
        },
      ],
    })
  }

  // Remove Document
  const removeDocument = (index) => {

    const updatedDocs = [...editData.documents]

    updatedDocs.splice(index, 1)

    setEditData({
      ...editData,
      documents: updatedDocs,
    })
  }

  // Update Document Field
  const handleDocumentChange = (index, field, value) => {

    const updatedDocs = [...editData.documents]

    updatedDocs[index][field] = value

    setEditData({
      ...editData,
      documents: updatedDocs,
    })
  }

  // Navigate Add Page
  const handleAdd = () => {

    navigate('/addMachinery')
  }

  useEffect(() => {

    fetchMachineries()

  }, [])

const [expandedRow, setExpandedRow] = useState(null); 

  const toggleExpand = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };


  return (
    <>
      <CCard className="mb-4">

        <CCardHeader className="d-flex justify-content-between align-items-center">

          <strong>Machineries List</strong>

          <CButton color="danger" onClick={handleAdd}>
            Add New Machinery
          </CButton>

        </CCardHeader>

        <CCardBody>

          <div className="table-responsive">

            {/* <CTable hover striped>

              <CTableHead>

                <CTableRow>

                  <CTableHeaderCell>Sr. No.</CTableHeaderCell>

                  <CTableHeaderCell>Machine Name</CTableHeaderCell>

                  <CTableHeaderCell>Reg. Number</CTableHeaderCell>

                  <CTableHeaderCell>Ownership</CTableHeaderCell>

                  <CTableHeaderCell>Documents</CTableHeaderCell>

                  <CTableHeaderCell>Action</CTableHeaderCell>

                </CTableRow>

              </CTableHead>

              <CTableBody>

                {rows?.length > 0 ? (

                  rows.map((row, index) => (

                    <CTableRow key={row.id}>

                      <CTableDataCell>{index + 1}</CTableDataCell>

                      <CTableDataCell>{row.machine_name}</CTableDataCell>

                      <CTableDataCell>{row.reg_number}</CTableDataCell>

                      <CTableDataCell>{row.ownership_type}</CTableDataCell>

                      <CTableDataCell>

                        {row.documents?.length > 0 ? (

                          row.documents.map((doc, i) => (
                            <div key={i} className="mb-1">

                              <strong>{doc.document_type}</strong>

                              <br />

                              Expiry:
                              {' '}
                              {doc.expiry_date || 'N/A'}

                            </div>
                          ))

                        ) : (

                          'No Documents'

                        )}

                      </CTableDataCell>

                      <CTableDataCell className="d-flex flex-wrap gap-2">

                        <CButton
                          color="info"
                          size="sm"
                          className="text-white"
                          onClick={() => handleEdit(row)}
                        >
                          Edit
                        </CButton>

                        <CButton
                          color="danger"
                          size="sm"
                          onClick={() => handleDelete(row.id)}
                        >
                          Delete
                        </CButton>

                      </CTableDataCell>

                    </CTableRow>

                  ))

                ) : (

                  <CTableRow>

                    <CTableDataCell colSpan={6} className="text-center">
                      No machineries found
                    </CTableDataCell>

                  </CTableRow>

                )}

              </CTableBody>

            </CTable> */}


            <CTable hover striped>
      <CTableHead>
        <CTableRow>
          <CTableHeaderCell style={{ width: '50px' }}></CTableHeaderCell>
          <CTableHeaderCell>Sr. No.</CTableHeaderCell>
          <CTableHeaderCell>Machine Name</CTableHeaderCell>
          <CTableHeaderCell>Reg. Number</CTableHeaderCell>
          <CTableHeaderCell>Ownership</CTableHeaderCell>
          <CTableHeaderCell>Documents</CTableHeaderCell>
          <CTableHeaderCell>Action</CTableHeaderCell>
        </CTableRow>
      </CTableHead>
      <CTableBody>
        {rows?.length > 0 ? (
          rows.map((row, index) => (
            <>
              {/* Main Row */}
              <CTableRow key={row.id}>
                <CTableDataCell>
                  <CButton
                    color="light"
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleExpand(row.id)}
                  >
                    <CIcon 
                      icon={expandedRow === row.id ? cilChevronBottom : cilChevronRight} 
                    />
                  </CButton>
                </CTableDataCell>

                <CTableDataCell>{index + 1}</CTableDataCell>
                <CTableDataCell>{row.machine_name}</CTableDataCell>
                <CTableDataCell>{row.reg_number}</CTableDataCell>
                <CTableDataCell>{row.ownership_type || 'N/A'}</CTableDataCell>

                <CTableDataCell>
                  {row.documents?.length > 0 ? (
                    `${row.documents.length} document(s)`
                  ) : (
                    'No Documents'
                  )}
                </CTableDataCell>

                <CTableDataCell className="d-flex flex-wrap gap-2">
                  <CButton
                    color="info"
                    size="sm"
                    className="text-white"
                    onClick={() => handleEdit(row)}
                  >
                    Edit
                  </CButton>
                  <CButton
                    color="danger"
                    size="sm"
                    onClick={() => handleDelete(row.id)}
                  >
                    Delete
                  </CButton>
                </CTableDataCell>
              </CTableRow>

              {/* Collapsible Details Row */}
              {expandedRow === row.id && (
                <CTableRow>
                  <CTableDataCell colSpan={7} className="p-0">
                    <div className="p-3 bg-light border-top">
                      <h6 className="mb-3">Machine Details</h6>
                      
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <strong>Machine Name:</strong> {row.machine_name}<br />
                          <strong>Registration Number:</strong> {row.reg_number}<br />
                          <strong>Ownership:</strong> {row.ownership_type || 'N/A'}
                        </div>
                      </div>

                      <h6 className="mb-2 mt-4">Documents</h6>
                      {row.documents?.length > 0 ? (
                        <div className="table-responsive">
                          <table className="table table-sm table-bordered bg-white">
                            <thead className="table-light">
                              <tr>
                                <th>Document Type</th>
                                <th>Document Number</th>
                                <th>Issue Date</th>
                                <th>Expiry Date</th>
                                <th>Remark</th>
                              </tr>
                            </thead>
                            <tbody>
                              {row.documents.map((doc, i) => (
                                <tr key={i}>
                                  <td><strong>{doc.document_type}</strong></td>
                                  <td>{doc.document_number || 'N/A'}</td>
                                  <td>{doc.issue_date || 'N/A'}</td>
                                  <td>{doc.expiry_date || 'N/A'}</td>
                                  <td style={{ maxWidth: '300px', whiteSpace: 'pre-wrap' }}>
                                    {doc.remark || 'No remark'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-muted">No documents available.</p>
                      )}
                    </div>
                  </CTableDataCell>
                </CTableRow>
              )}
            </>
          ))
        ) : (
          <CTableRow>
            <CTableDataCell colSpan={7} className="text-center">
              No machineries found
            </CTableDataCell>
          </CTableRow>
        )}
      </CTableBody>
    </CTable>

          </div>

        </CCardBody>

      </CCard>

      {/* Edit Modal */}

      <CModal
        visible={visible}
        onClose={() => setVisible(false)}
        size="xl"
      >

        <CModalHeader closeButton>

          <CModalTitle>Edit Machinery</CModalTitle>

        </CModalHeader>

        <CModalBody>

          {/* Machinery Details */}

          <CRow className="mb-3">

            <CCol md={4}>

              <CFormInput
                label="Machine Name"
                value={editData.machine_name}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    machine_name: e.target.value,
                  })
                }
              />

            </CCol>

            <CCol md={4}>

              <CFormInput
                label="Reg. Number"
                value={editData.reg_number}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    reg_number: e.target.value,
                  })
                }
              />

            </CCol>

            <CCol md={4}>

              <CFormSelect
                label="Ownership Type"
                value={editData.ownership_type || ''}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    ownership_type: e.target.value,
                  })
                }
              >
                <option value="">-- Select Ownership Type --</option>

                <option value="Own">Own</option>

                <option value="Rent">Rent</option>

              </CFormSelect>

            </CCol>

          </CRow>

          <hr />

          {/* Documents */}

          <div className="d-flex justify-content-between align-items-center mb-3">

            <h5>Documents</h5>

            <CButton
              color="success"
              size="sm"
              onClick={addDocument}
            >
              + Add Document
            </CButton>

          </div>

          {editData.documents?.map((doc, index) => (

            <CCard key={index} className="mb-3 border">

              <CCardBody>

                <CRow className="mb-3">

                  <CCol md={3}>

                    <CFormSelect
                      label="Document Type"
                      value={doc.document_type || ''}
                      onChange={(e) =>
                        handleDocumentChange(
                          index,
                          'document_type',
                          e.target.value,
                        )
                      }
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
                      value={doc.document_number || ''}
                      onChange={(e) =>
                        handleDocumentChange(
                          index,
                          'document_number',
                          e.target.value,
                        )
                      }
                    />

                  </CCol>

                  <CCol md={3}>

                    <CFormInput
                      type="date"
                      label="Issue Date"
                      value={doc.issue_date || ''}
                      onChange={(e) =>
                        handleDocumentChange(
                          index,
                          'issue_date',
                          e.target.value,
                        )
                      }
                    />

                  </CCol>

                  {/* <CCol md={3}>

                    <CFormInput
                      type="date"
                      label="Expiry Date"
                      value={doc.expiry_date || ''}
                      onChange={(e) =>
                        handleDocumentChange(
                          index,
                          'expiry_date',
                          e.target.value,
                        )
                      }
                    />

                  </CCol> */}


                  <CCol md={3}>
                    <CFormInput
                      type="date"
                      label="Expiry Date"
                      value={doc.expiry_date || ''}
                      min={doc.issue_date}        
                      onChange={(e) => handleDocumentChange(index, 'expiry_date', e.target.value)}
                    />
                  </CCol>

                </CRow>

                <CRow>

                  {/* <CCol md={5}>

                    <CFormInput
                      label="Document File"
                      value={doc.document_file || ''}
                      onChange={(e) =>
                        handleDocumentChange(
                          index,
                          'document_file',
                          e.target.value,
                        )
                      }
                    />

                  </CCol> */}

                  <CCol md={5}>

                    <CFormTextarea
                      label="Remark"
                      rows={1}
                      value={doc.remark || ''}
                      onChange={(e) =>
                        handleDocumentChange(
                          index,
                          'remark',
                          e.target.value,
                        )
                      }
                    />

                  </CCol>

                  <CCol
                    md={2}
                    className="d-flex align-items-end"
                  >

                    <CButton
                      color="danger"
                      onClick={() => removeDocument(index)}
                    >
                      Remove
                    </CButton>

                  </CCol>

                </CRow>

              </CCardBody>

            </CCard>

          ))}

        </CModalBody>

        <CModalFooter>

          <CButton
            color="secondary"
            onClick={() => setVisible(false)}
          >
            Cancel
          </CButton>

          <CButton
            color="primary"
            onClick={handleUpdate}
          >
            Save Changes
          </CButton>

        </CModalFooter>

      </CModal>
    </>
  )
}

export default MachineriesTable