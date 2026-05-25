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
  <option value="Own">Own</option>
  <option value="Rent">Rent</option>
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











// // ===============================================
// // COMPLETE MACHINERY MANAGEMENT DASHBOARD
// // ===============================================

// import React, { useState } from 'react'

// import {
//   CCard,
//   CCardBody,
//   CCardHeader,
//   CRow,
//   CCol,
//   CButton,
//   CBadge,
//   CTable,
//   CTableHead,
//   CTableRow,
//   CTableHeaderCell,
//   CTableBody,
//   CTableDataCell,
//   CProgress,
//   CNav,
//   CNavItem,
//   CNavLink,
//   CTabContent,
//   CTabPane,
//   CFormInput,
//   CFormSelect,
//   CModal,
//   CModalHeader,
//   CModalBody,
//   CModalFooter,
//   CModalTitle,
// } from '@coreui/react'

// import CIcon from '@coreui/icons-react'

// import {
//   cilTruck,
//   cilSettings,
//   cilTransfer,
//   cilWarning,
//   cilPlus,
//   cilPencil,
//   cilTrash,
// } from '@coreui/icons'

// function MachineryDashboardMockup() {

//   // =====================================
//   // TAB STATE
//   // =====================================

//   const [activeKey, setActiveKey] = useState(1)

//   // =====================================
//   // MODAL STATES
//   // =====================================

//   const [transferModal, setTransferModal] = useState(false)
//   const [machineModal, setMachineModal] = useState(false)
//   const [materialModal, setMaterialModal] = useState(false)
//   const [maintenanceModal, setMaintenanceModal] = useState(false)

//   // =====================================
//   // MOCK DATA
//   // =====================================

//   const machines = [
//     {
//       id: 1,
//       machine: 'Excavator ZX210',
//       reg: 'MH12AB1234',
//       site: 'Pune Site',
//       status: 'Running',
//       fuel: 75,
//       hours: 3200,
//       ownership: 'Own',
//     },

//     {
//       id: 2,
//       machine: 'JCB 3DX',
//       reg: 'MH14XY4567',
//       site: 'Mumbai Site',
//       status: 'Maintenance',
//       fuel: 35,
//       hours: 2200,
//       ownership: 'Rent',
//     },
//   ]

//   const transfers = [
//     {
//       machine: 'Excavator ZX210',
//       from: 'Pune Site',
//       to: 'Mumbai Site',
//       date: '12-05-2026',
//       status: 'Completed',
//     },

//     {
//       machine: 'Hydra Crane',
//       from: 'Nashik Site',
//       to: 'Pune Site',
//       date: '10-05-2026',
//       status: 'Pending',
//     },
//   ]

//   const materials = [
//     {
//       item: 'Drill Bit',
//       stock: 120,
//       used: 40,
//       balance: 80,
//     },

//     {
//       item: 'Hydraulic Oil',
//       stock: 500,
//       used: 120,
//       balance: 380,
//     },
//   ]

//   const maintenance = [
//     {
//       machine: 'JCB 3DX',
//       next_service: '15-05-2026',
//       status: 'Due',
//     },

//     {
//       machine: 'Excavator ZX210',
//       next_service: '25-05-2026',
//       status: 'Upcoming',
//     },
//   ]

//   return (
//     <>

//       {/* ===================================== */}
//       {/* TOP CARDS */}
//       {/* ===================================== */}

//       <CRow className="mb-4">

//         <CCol md={3}>
//           <CCard className="border-0 shadow-sm">
//             <CCardBody>

//               <div className="d-flex justify-content-between">

//                 <div>
//                   <h6>Total Machines</h6>
//                   <h2>24</h2>
//                 </div>

//                 <div
//                   className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
//                   style={{ width: 55, height: 55 }}
//                 >
//                   <CIcon icon={cilTruck} size="xl" />
//                 </div>

//               </div>

//             </CCardBody>
//           </CCard>
//         </CCol>

//         <CCol md={3}>
//           <CCard className="border-0 shadow-sm">
//             <CCardBody>

//               <div className="d-flex justify-content-between">

//                 <div>
//                   <h6>Running</h6>
//                   <h2>18</h2>
//                 </div>

//                 <div
//                   className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center"
//                   style={{ width: 55, height: 55 }}
//                 >
//                   <CIcon icon={cilSettings} size="xl" />
//                 </div>

//               </div>

//             </CCardBody>
//           </CCard>
//         </CCol>

//         <CCol md={3}>
//           <CCard className="border-0 shadow-sm">
//             <CCardBody>

//               <div className="d-flex justify-content-between">

//                 <div>
//                   <h6>Transfers</h6>
//                   <h2>12</h2>
//                 </div>

//                 <div
//                   className="bg-warning text-white rounded-circle d-flex align-items-center justify-content-center"
//                   style={{ width: 55, height: 55 }}
//                 >
//                   <CIcon icon={cilTransfer} size="xl" />
//                 </div>

//               </div>

//             </CCardBody>
//           </CCard>
//         </CCol>

//         <CCol md={3}>
//           <CCard className="border-0 shadow-sm">
//             <CCardBody>

//               <div className="d-flex justify-content-between">

//                 <div>
//                   <h6>Maintenance Due</h6>
//                   <h2>3</h2>
//                 </div>

//                 <div
//                   className="bg-danger text-white rounded-circle d-flex align-items-center justify-content-center"
//                   style={{ width: 55, height: 55 }}
//                 >
//                   <CIcon icon={cilWarning} size="xl" />
//                 </div>

//               </div>

//             </CCardBody>
//           </CCard>
//         </CCol>

//       </CRow>

//       {/* ===================================== */}
//       {/* MAIN CARD */}
//       {/* ===================================== */}

//       <CCard className="border-0 shadow-sm">

//         <CCardHeader>

//           <CNav variant="tabs">

//             <CNavItem>
//               <CNavLink
//                 active={activeKey === 1}
//                 onClick={() => setActiveKey(1)}
//               >
//                 Machinery Tracking
//               </CNavLink>
//             </CNavItem>

//             <CNavItem>
//               <CNavLink
//                 active={activeKey === 2}
//                 onClick={() => setActiveKey(2)}
//               >
//                 Machine Transfer
//               </CNavLink>
//             </CNavItem>

//             <CNavItem>
//               <CNavLink
//                 active={activeKey === 3}
//                 onClick={() => setActiveKey(3)}
//               >
//                 Material Transfer
//               </CNavLink>
//             </CNavItem>

//             <CNavItem>
//               <CNavLink
//                 active={activeKey === 4}
//                 onClick={() => setActiveKey(4)}
//               >
//                 Maintenance
//               </CNavLink>
//             </CNavItem>

//           </CNav>

//         </CCardHeader>

//         <CCardBody>

//           <CTabContent>

//             {/* ===================================== */}
//             {/* MACHINERY TRACKING */}
//             {/* ===================================== */}

//             <CTabPane visible={activeKey === 1}>

//               <div className="d-flex justify-content-between mb-3">

//                 <h4>Machine Tracking</h4>

//                 <CButton
//                   color="primary"
//                   onClick={() => setMachineModal(true)}
//                 >
//                   <CIcon icon={cilPlus} className="me-2" />
//                   Add Machine
//                 </CButton>

//               </div>

//               <CTable hover responsive bordered>

//                 <CTableHead color="light">

//                   <CTableRow>
//                     <CTableHeaderCell>Machine</CTableHeaderCell>
//                     <CTableHeaderCell>Reg No</CTableHeaderCell>
//                     <CTableHeaderCell>Site</CTableHeaderCell>
//                     <CTableHeaderCell>Status</CTableHeaderCell>
//                     <CTableHeaderCell>Hours</CTableHeaderCell>
//                     <CTableHeaderCell>Fuel</CTableHeaderCell>
//                     <CTableHeaderCell>Ownership</CTableHeaderCell>
//                     <CTableHeaderCell>Actions</CTableHeaderCell>
//                   </CTableRow>

//                 </CTableHead>

//                 <CTableBody>

//                   {machines.map((item, index) => (

//                     <CTableRow key={index}>

//                       <CTableDataCell>{item.machine}</CTableDataCell>

//                       <CTableDataCell>{item.reg}</CTableDataCell>

//                       <CTableDataCell>{item.site}</CTableDataCell>

//                       <CTableDataCell>
//                         <CBadge
//                           color={
//                             item.status === 'Running'
//                               ? 'success'
//                               : 'danger'
//                           }
//                         >
//                           {item.status}
//                         </CBadge>
//                       </CTableDataCell>

//                       <CTableDataCell>
//                         {item.hours} hrs
//                       </CTableDataCell>

//                       <CTableDataCell style={{ width: '180px' }}>
//                         <CProgress value={item.fuel}>
//                           {item.fuel}%
//                         </CProgress>
//                       </CTableDataCell>

//                       <CTableDataCell>
//                         <CBadge
//                           color={
//                             item.ownership === 'Own'
//                               ? 'primary'
//                               : 'warning'
//                           }
//                         >
//                           {item.ownership}
//                         </CBadge>
//                       </CTableDataCell>

//                       <CTableDataCell>

//                         <div className="d-flex gap-2">

//                           <CButton size="sm" color="info">
//                             <CIcon icon={cilPencil} />
//                           </CButton>

//                           <CButton size="sm" color="danger">
//                             <CIcon icon={cilTrash} />
//                           </CButton>

//                         </div>

//                       </CTableDataCell>

//                     </CTableRow>

//                   ))}

//                 </CTableBody>

//               </CTable>

//             </CTabPane>

//             {/* ===================================== */}
//             {/* MACHINE TRANSFER */}
//             {/* ===================================== */}

//             <CTabPane visible={activeKey === 2}>

//               <div className="d-flex justify-content-between mb-3">

//                 <h4>Machine Transfer</h4>

//                 <CButton
//                   color="warning"
//                   onClick={() => setTransferModal(true)}
//                 >
//                   <CIcon icon={cilTransfer} className="me-2" />
//                   Transfer Machine
//                 </CButton>

//               </div>

//               <CTable hover responsive bordered>

//                 <CTableHead color="light">

//                   <CTableRow>
//                     <CTableHeaderCell>Machine</CTableHeaderCell>
//                     <CTableHeaderCell>From Site</CTableHeaderCell>
//                     <CTableHeaderCell>To Site</CTableHeaderCell>
//                     <CTableHeaderCell>Date</CTableHeaderCell>
//                     <CTableHeaderCell>Status</CTableHeaderCell>
//                   </CTableRow>

//                 </CTableHead>

//                 <CTableBody>

//                   {transfers.map((item, index) => (

//                     <CTableRow key={index}>

//                       <CTableDataCell>{item.machine}</CTableDataCell>

//                       <CTableDataCell>{item.from}</CTableDataCell>

//                       <CTableDataCell>{item.to}</CTableDataCell>

//                       <CTableDataCell>{item.date}</CTableDataCell>

//                       <CTableDataCell>
//                         <CBadge
//                           color={
//                             item.status === 'Completed'
//                               ? 'success'
//                               : 'warning'
//                           }
//                         >
//                           {item.status}
//                         </CBadge>
//                       </CTableDataCell>

//                     </CTableRow>

//                   ))}

//                 </CTableBody>

//               </CTable>

//             </CTabPane>

//             {/* ===================================== */}
//             {/* MATERIAL TRANSFER */}
//             {/* ===================================== */}

//             <CTabPane visible={activeKey === 3}>

//               <div className="d-flex justify-content-between mb-3">

//                 <h4>Material Transfer</h4>

//                 <CButton
//                   color="success"
//                   onClick={() => setMaterialModal(true)}
//                 >
//                   <CIcon icon={cilPlus} className="me-2" />
//                   Transfer Material
//                 </CButton>

//               </div>

//               <CTable hover responsive bordered>

//                 <CTableHead color="light">

//                   <CTableRow>
//                     <CTableHeaderCell>Material</CTableHeaderCell>
//                     <CTableHeaderCell>Stock</CTableHeaderCell>
//                     <CTableHeaderCell>Used</CTableHeaderCell>
//                     <CTableHeaderCell>Balance</CTableHeaderCell>
//                   </CTableRow>

//                 </CTableHead>

//                 <CTableBody>

//                   {materials.map((item, index) => (

//                     <CTableRow key={index}>

//                       <CTableDataCell>{item.item}</CTableDataCell>

//                       <CTableDataCell>{item.stock}</CTableDataCell>

//                       <CTableDataCell>{item.used}</CTableDataCell>

//                       <CTableDataCell>
//                         <CBadge color="info">
//                           {item.balance}
//                         </CBadge>
//                       </CTableDataCell>

//                     </CTableRow>

//                   ))}

//                 </CTableBody>

//               </CTable>

//             </CTabPane>

//             {/* ===================================== */}
//             {/* MAINTENANCE */}
//             {/* ===================================== */}

//             <CTabPane visible={activeKey === 4}>

//               <div className="d-flex justify-content-between mb-3">

//                 <h4>Maintenance</h4>

//                 <CButton
//                   color="danger"
//                   onClick={() => setMaintenanceModal(true)}
//                 >
//                   <CIcon icon={cilPlus} className="me-2" />
//                   Add Maintenance
//                 </CButton>

//               </div>

//               <CTable hover responsive bordered>

//                 <CTableHead color="light">

//                   <CTableRow>
//                     <CTableHeaderCell>Machine</CTableHeaderCell>
//                     <CTableHeaderCell>Next Service</CTableHeaderCell>
//                     <CTableHeaderCell>Status</CTableHeaderCell>
//                   </CTableRow>

//                 </CTableHead>

//                 <CTableBody>

//                   {maintenance.map((item, index) => (

//                     <CTableRow key={index}>

//                       <CTableDataCell>{item.machine}</CTableDataCell>

//                       <CTableDataCell>
//                         {item.next_service}
//                       </CTableDataCell>

//                       <CTableDataCell>

//                         <CBadge
//                           color={
//                             item.status === 'Due'
//                               ? 'danger'
//                               : 'warning'
//                           }
//                         >
//                           {item.status}
//                         </CBadge>

//                       </CTableDataCell>

//                     </CTableRow>

//                   ))}

//                 </CTableBody>

//               </CTable>

//             </CTabPane>

//           </CTabContent>

//         </CCardBody>

//       </CCard>

//       {/* ===================================== */}
//       {/* ADD MACHINE MODAL */}
//       {/* ===================================== */}

//       <CModal
//         visible={machineModal}
//         onClose={() => setMachineModal(false)}
//         size="lg"
//       >

//         <CModalHeader closeButton>
//           <CModalTitle>Add Machine</CModalTitle>
//         </CModalHeader>

//         <CModalBody>

//           <CRow>

//             <CCol md={6} className="mb-3">
//               <CFormInput label="Machine Name" />
//             </CCol>

//             <CCol md={6} className="mb-3">
//               <CFormInput label="Registration Number" />
//             </CCol>

//             <CCol md={6} className="mb-3">
//               <CFormSelect label="Ownership">
//                 <option>Own</option>
//                 <option>Rent</option>
//               </CFormSelect>
//             </CCol>

//             <CCol md={6} className="mb-3">
//               <CFormSelect label="Site">
//                 <option>Pune Site</option>
//                 <option>Mumbai Site</option>
//               </CFormSelect>
//             </CCol>

//           </CRow>

//         </CModalBody>

//         <CModalFooter>

//           <CButton
//             color="secondary"
//             onClick={() => setMachineModal(false)}
//           >
//             Close
//           </CButton>

//           <CButton color="primary">
//             Save Machine
//           </CButton>

//         </CModalFooter>

//       </CModal>

//       {/* ===================================== */}
//       {/* MACHINE TRANSFER MODAL */}
//       {/* ===================================== */}

//       <CModal
//         visible={transferModal}
//         onClose={() => setTransferModal(false)}
//         size="lg"
//       >

//         <CModalHeader closeButton>
//           <CModalTitle>Transfer Machine</CModalTitle>
//         </CModalHeader>

//         <CModalBody>

//           <CRow>

//             <CCol md={6} className="mb-3">
//               <CFormSelect label="Machine">
//                 <option>Excavator ZX210</option>
//               </CFormSelect>
//             </CCol>

//             <CCol md={6} className="mb-3">
//               <CFormInput label="Current Site" value="Pune Site" />
//             </CCol>

//             <CCol md={6} className="mb-3">
//               <CFormSelect label="Transfer To">
//                 <option>Mumbai Site</option>
//                 <option>Nashik Site</option>
//               </CFormSelect>
//             </CCol>

//             <CCol md={6} className="mb-3">
//               <CFormInput type="date" label="Transfer Date" />
//             </CCol>

//           </CRow>

//         </CModalBody>

//         <CModalFooter>

//           <CButton
//             color="secondary"
//             onClick={() => setTransferModal(false)}
//           >
//             Close
//           </CButton>

//           <CButton color="warning">
//             Confirm Transfer
//           </CButton>

//         </CModalFooter>

//       </CModal>

//       {/* ===================================== */}
//       {/* MATERIAL TRANSFER MODAL */}
//       {/* ===================================== */}

//       <CModal
//         visible={materialModal}
//         onClose={() => setMaterialModal(false)}
//         size="lg"
//       >

//         <CModalHeader closeButton>
//           <CModalTitle>Transfer Material</CModalTitle>
//         </CModalHeader>

//         <CModalBody>

//           <CRow>

//             <CCol md={6} className="mb-3">
//               <CFormSelect label="Material">
//                 <option>Drill Bit</option>
//                 <option>Hydraulic Oil</option>
//               </CFormSelect>
//             </CCol>

//             <CCol md={6} className="mb-3">
//               <CFormInput
//                 type="number"
//                 label="Quantity"
//               />
//             </CCol>

//             <CCol md={6} className="mb-3">
//               <CFormSelect label="From Site">
//                 <option>Pune Site</option>
//               </CFormSelect>
//             </CCol>

//             <CCol md={6} className="mb-3">
//               <CFormSelect label="To Site">
//                 <option>Mumbai Site</option>
//               </CFormSelect>
//             </CCol>

//           </CRow>

//         </CModalBody>

//         <CModalFooter>

//           <CButton
//             color="secondary"
//             onClick={() => setMaterialModal(false)}
//           >
//             Close
//           </CButton>

//           <CButton color="success">
//             Transfer Material
//           </CButton>

//         </CModalFooter>

//       </CModal>

//       {/* ===================================== */}
//       {/* MAINTENANCE MODAL */}
//       {/* ===================================== */}

//       <CModal
//         visible={maintenanceModal}
//         onClose={() => setMaintenanceModal(false)}
//         size="lg"
//       >

//         <CModalHeader closeButton>
//           <CModalTitle>Add Maintenance</CModalTitle>
//         </CModalHeader>

//         <CModalBody>

//           <CRow>

//             <CCol md={6} className="mb-3">
//               <CFormSelect label="Machine">
//                 <option>Excavator ZX210</option>
//                 <option>JCB 3DX</option>
//               </CFormSelect>
//             </CCol>

//             <CCol md={6} className="mb-3">
//               <CFormInput
//                 type="date"
//                 label="Service Date"
//               />
//             </CCol>

//             <CCol md={12}>
//               <CFormInput
//                 label="Remarks"
//                 placeholder="Enter maintenance remarks"
//               />
//             </CCol>

//           </CRow>

//         </CModalBody>

//         <CModalFooter>

//           <CButton
//             color="secondary"
//             onClick={() => setMaintenanceModal(false)}
//           >
//             Close
//           </CButton>

//           <CButton color="danger">
//             Save Maintenance
//           </CButton>

//         </CModalFooter>

//       </CModal>

//     </>
//   )
// }

// export default MachineryDashboardMockup