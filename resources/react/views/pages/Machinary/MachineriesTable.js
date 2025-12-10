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
} from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../../common/toast/ToastContext'

function MachineriesTable() {
  const [rows, setRows] = useState([])
  const [visible, setVisible] = useState(false)
  const [editData, setEditData] = useState({ id: null, machine_name: '', reg_number: '', ownership_type:'' })

  const navigate = useNavigate();
   const { showToast } = useToast()

  const fetchMachineries = async () => {
    try {
      const response = await getAPICall('/api/machineries')
      setRows(response.data)
    } catch (error) {
      console.error('Error fetching machineries:', error)
    }
  }

  const handleDelete = async (id) => {
    //if (!window.confirm('Are you sure you want to delete this machinery?')) return

    try {
      await deleteAPICall(`/api/machineries/${id}`)
      fetchMachineries()
      showToast("success",'Machine Delete Successfully')
    } catch (error) {
      console.error('Error deleting machinery:', error)
      showToast("danger",'Error deleting machinery')
    }
  }

  const handleEdit = (row) => {
    setEditData({ id: row.id, machine_name: row.machine_name, reg_number: row.reg_number, ownership_type:row.ownership_type })
    setVisible(true)
  }

  const handleUpdate = async () => {
    try {
      await put(`/api/machineries/${editData.id}`, {
        machine_name: editData.machine_name,
        reg_number: editData.reg_number,
        ownership_type: editData.ownership_type
      })
      setVisible(false)
      showToast("success","Machine update successfully")
      fetchMachineries()
    } catch (error) {
      console.error('Error updating machinery:', error)
      // alert('Failed to update machinery!')
        showToast("danger","Failed to update machinery!")
    }
  }

  const handleAdd = () => {
    navigate('/addMachinery')
  }

  useEffect(() => {
    fetchMachineries()
  }, [])

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
            <CTable hover striped>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Sr. No.</CTableHeaderCell>
                  <CTableHeaderCell>Machine Name</CTableHeaderCell>
                  <CTableHeaderCell>Reg. Number</CTableHeaderCell>
                  <CTableHeaderCell>Ownership</CTableHeaderCell>

                  <CTableHeaderCell>Action</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {rows.length > 0 ? (
                  rows.map((row, index) => (
                    <CTableRow key={row.id}>
                      <CTableDataCell>{index + 1}</CTableDataCell>
                      <CTableDataCell>{row.machine_name}</CTableDataCell>
                      <CTableDataCell>{row.reg_number}</CTableDataCell>
                      <CTableDataCell>{row.ownership_type}</CTableDataCell>

                      <CTableDataCell className='d-flex flex-wrap gap-2'>
                        <CButton
                          color="info"
                          size="sm"
                          className="me-2 text-white"
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
                    <CTableDataCell colSpan={4} className="text-center">
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
      <CModal visible={visible} onClose={() => setVisible(false)}>
        <CModalHeader closeButton>
          <CModalTitle>Edit Machinery</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CFormInput
            className="mb-3"
            type="text"
            label="Machine Name"
            value={editData.machine_name}
            onChange={(e) => setEditData({ ...editData, machine_name: e.target.value })}
          />
          <CFormInput
            type="text"
            label="Reg. Number"
            value={editData.reg_number}
            onChange={(e) => setEditData({ ...editData, reg_number: e.target.value })}
          />
          <CFormSelect
  label="Ownership Type"
  value={editData.ownership_type || ""}   // ✅ handle null safely
  onChange={(e) =>
    setEditData({ ...editData, ownership_type: e.target.value })
  }
>
  <option value="">-- Select Ownership Type --</option>
  <option value="own">Own</option>
  <option value="rent">Rent</option>
</CFormSelect>

        </CModalBody>

            

        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisible(false)}>
            Cancel
          </CButton>
          <CButton color="primary" onClick={handleUpdate}>
            Save Changes
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default MachineriesTable
