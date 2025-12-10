// import React, { useState, useEffect } from 'react'
// import {
//   CModal,
//   CModalHeader,
//   CModalTitle,
//   CModalBody,
//   CModalFooter,
//   CButton,
//   CForm,
//   CFormInput,
//   CFormLabel,
//   CFormTextarea,
//   CFormCheck,
// } from '@coreui/react'
// import { put } from '../../../util/api'

// const UpdateProjectModal = ({ visible, onClose, projectData, onProjectUpdated }) => {
//   const [formData, setFormData] = useState({})
//   const [loading, setLoading] = useState(false)

//   useEffect(() => {
//     if (projectData) {
//       setFormData({
//         customer_name: projectData.customer_name || '',
//         mobile_number: projectData.mobile_number || '',
//         project_name: projectData.project_name || '',
//         project_cost: projectData.project_cost || '',
//         work_place: projectData.work_place || '',
//         start_date: projectData.start_date ? projectData.start_date.split('T')[0] : '',
//         end_date: projectData.end_date ? projectData.end_date.split('T')[0] : '',
//         is_confirm: projectData.is_confirm || 0,
//         is_visible: projectData.is_visible || false,
//         remark: projectData.remark || '',
//         supervisor_id: projectData.supervisor_id || '',
//         commission: projectData.commission || '',
//         gst_number: projectData.gst_number || '',
//       })
//     }
//   }, [projectData])

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target
//     setFormData((prev) => ({
//       ...prev,
//       [name]: type === 'checkbox' ? checked : value,
//     }))
//   }

//   const handleSubmit = async () => {
//     setLoading(true)
//     try {
//       const response = await put(`/api/updateInvoiceStatus/${projectData.id}`, formData)
//       if (response.success) {
//         onProjectUpdated(response.project)
//         onClose()
//       }
//     } catch (error) {
//       console.error('Failed to update project:', error)
//       alert('Failed to update project')
//     } finally {
//       setLoading(false)
//     }
//   }

//   if (!projectData) return null

//   return (
//     <CModal visible={visible} onClose={onClose} size="lg">
//       <CModalHeader>
//         <CModalTitle>Update Project: {projectData.project_name}</CModalTitle>
//       </CModalHeader>
//       <CModalBody>
//         <CForm className="row g-3">
//           <CFormLabel>Customer Name</CFormLabel>
//           <CFormInput
//             name="customer_name"
//             value={formData.customer_name}
//             onChange={handleChange}
//           />

//           <CFormLabel>Mobile Number</CFormLabel>
//           <CFormInput
//             name="mobile_number"
//             value={formData.mobile_number}
//             onChange={handleChange}
//           />

//           <CFormLabel>Project Name</CFormLabel>
//           <CFormInput
//             name="project_name"
//             value={formData.project_name}
//             onChange={handleChange}
//           />

//           <CFormLabel>Project Cost</CFormLabel>
//           <CFormInput
//             name="project_cost"
//             value={formData.project_cost}
//             onChange={handleChange}
//           />

//           <CFormLabel>Work Place</CFormLabel>
//           <CFormInput
//             name="work_place"
//             value={formData.work_place}
//             onChange={handleChange}
//           />

//           <CFormLabel>Start Date</CFormLabel>
//           <CFormInput
//             type="date"
//             name="start_date"
//             value={formData.start_date}
//             onChange={handleChange}
//           />

//           <CFormLabel>End Date</CFormLabel>
//           <CFormInput
//             type="date"
//             name="end_date"
//             value={formData.end_date}
//             onChange={handleChange}
//           />

//           <CFormLabel>GST Number</CFormLabel>
//           <CFormInput
//             name="gst_number"
//             value={formData.gst_number}
//             onChange={handleChange}
//           />

//           <CFormLabel>Commission</CFormLabel>
//           <CFormInput
//             type="number"
//             name="commission"
//             value={formData.commission}
//             onChange={handleChange}
//           />

//           <CFormLabel>Supervisor ID</CFormLabel>
//           <CFormInput
//             type="number"
//             name="supervisor_id"
//             value={formData.supervisor_id}
//             onChange={handleChange}
//           />

//           <CFormLabel>Remark</CFormLabel>
//           <CFormTextarea
//             name="remark"
//             value={formData.remark}
//             onChange={handleChange}
//           />

//           <CFormCheck
//             label="Visible"
//             name="is_visible"
//             checked={formData.is_visible}
//             onChange={handleChange}
//           />

//           <CFormCheck
//             label="Confirmed"
//             name="is_confirm"
//             checked={formData.is_confirm === 1}
//             onChange={(e) => handleChange({ target: { name: 'is_confirm', value: e.target.checked ? 1 : 0, type: 'number' } })}
//           />
//         </CForm>
//       </CModalBody>
//       <CModalFooter>
//         <CButton color="secondary" onClick={onClose}>Cancel</CButton>
//         <CButton color="primary" onClick={handleSubmit} disabled={loading}>
//           {loading ? 'Saving...' : 'Save Changes'}
//         </CButton>
//       </CModalFooter>
//     </CModal>
//   )
// }

// export default UpdateProjectModal


import React, { useState, useEffect } from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CForm,
  CFormInput,
  CFormLabel,
  CFormTextarea,
  CFormCheck,
  CRow,
  CCol,
  CFormSelect,
} from '@coreui/react'
import { getAPICall, put } from '../../../util/api'

const UpdateProjectModal = ({ visible, onClose, orderData, onUpdated }) => {
  const [formData, setFormData] = useState({})
  const [loading, setLoading] = useState(false)

  console.log(orderData);


     const [accountants, setAccountants] = useState([]);

  useEffect(() => {
    const fetchAccountants = async () => {
      try {
        const response = await getAPICall("/api/usersData");
        if (response.status && response.users) {
          // filter only type=2 (accountants)
          const filtered = response.users.filter((u) => u.type === 2);
          setAccountants(filtered);
        }
      } catch (error) {
        console.error("Error fetching accountants:", error);
      }
    };
    fetchAccountants();
  }, []);



   // Pre-select supervisor if project already has one
//   useEffect(() => {
//     if (orderData?.project?.supervisor_id) {
//       setFormData((prev) => ({
//         ...prev,
//         supervisor_id: orderData.project.supervisor_id,
//       }))
//     }
//   }, [orderData, setFormData])

//   const handleChange = (e) => {
//     const { name, value } = e.target
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }))
//   }
  

  useEffect(() => {
    if (orderData && orderData.project) {
      setFormData({
        customer_name: orderData.project.customer_name || '',
        mobile_number: orderData.project.mobile_number || '',
        project_name: orderData.project.project_name || '',
        project_cost: orderData.project.project_cost || '',
        work_place: orderData.project.work_place || '',
        start_date: orderData.project.start_date ? orderData.project.start_date.split('T')[0] : '',
        end_date: orderData.project.end_date ? orderData.project.end_date.split('T')[0] : '',
        is_confirm: !!orderData.project.is_confirm,
        is_visible: !!orderData.project.is_visible,
        remark: orderData.project.remark || '',
        supervisor_id: orderData.project.supervisor_id || '',
        // supervisor_id: orderData.project.supervisor.name  || '',
        commission: orderData.project.commission || '',
        gst_number: orderData.project.gst_number || '',
        pan_number: orderData.project.pan_number || '',
      })
    }
  }, [orderData])

  
  

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const payload = {
        ...formData,
        invoiceType: 2, // Explicitly set to convert to Work Order
      }
      const response = await put(`/api/updateInvoiceStatus/${orderData.id}`, payload)
      if (response.success) {
        onUpdated(response.data)
        onClose()
      } else {
        throw new Error(response.message || 'Update failed')
      }
    } catch (error) {
      console.error('Failed to update:', error)
      alert(error.response?.data?.message || 'Failed to update')
    } finally {
      setLoading(false)
    }
  }

  if (!orderData || !orderData.project) return null

  return (
    <CModal visible={visible} onClose={onClose} size="lg">
      <CModalHeader>
        <CModalTitle>Update Project: {orderData.project.project_name}</CModalTitle>
      </CModalHeader>
      <CModalBody>
   
  <CForm>
  <CRow className="g-3">
    <CCol md={3}>
      <CFormLabel>Customer Name</CFormLabel>
      <CFormInput
        name="customer_name"
        value={formData.customer_name}
        onChange={handleChange}
      />
    </CCol>

    <CCol md={3}>
      <CFormLabel>Mobile Number</CFormLabel>
      <CFormInput
        name="mobile_number"
        value={formData.mobile_number}
        onChange={handleChange}
      />
    </CCol>

    <CCol md={3}>
      <CFormLabel>Project Name</CFormLabel>
      <CFormInput
        name="project_name"
        value={formData.project_name}
        onChange={handleChange}
      />
    </CCol>

    <CCol md={3}>
      <CFormLabel>Project Cost</CFormLabel>
      <CFormInput
        name="project_cost"
        value={formData.project_cost}
        onChange={handleChange}
      />
    </CCol>

    <CCol md={3}>
      <CFormLabel>Work Place</CFormLabel>
      <CFormInput
        name="work_place"
        value={formData.work_place}
        onChange={handleChange}
      />
    </CCol>

    <CCol md={3}>
      <CFormLabel>Start Date</CFormLabel>
      <CFormInput
        type="date"
        name="start_date"
        value={formData.start_date}
        onChange={handleChange}
      />
    </CCol>

    <CCol md={3}>
      <CFormLabel>End Date</CFormLabel>
      <CFormInput
        type="date"
        name="end_date"
        value={formData.end_date}
        onChange={handleChange}
      />
    </CCol>

    <CCol md={3}>
      <CFormLabel>GST Number</CFormLabel>
      <CFormInput
        name="gst_number"
        value={formData.gst_number}
        onChange={handleChange}
      />
    </CCol>


 <CCol md={3}>
      <CFormLabel>Pan card Number</CFormLabel>
      <CFormInput
        name="pan_number"
        value={formData.pan_number}
        onChange={handleChange}
      />
    </CCol>



    <CCol md={3}>
      <CFormLabel>Commission</CFormLabel>
      <CFormInput
        type="number"
        name="commission"
        value={formData.commission}
        onChange={handleChange}
      />
    </CCol>


    {/* <CCol md={3}>
  <CFormLabel>Accountant</CFormLabel>
  <CFormInput
    type="text"
    name="supervisor_id"
    value={orderData?.project?.supervisor?.name || ''}
       
  />
</CCol> */}

<CCol md={3}>
      <CFormLabel>Accountant</CFormLabel>
      <CFormSelect
        name="supervisor_id"
        value={formData.supervisor_id} // preselect from project
        onChange={handleChange}
      >
        <option value="">Select Accountant</option>
        {accountants.map((acc) => (
          <option key={acc.id} value={acc.id}>
            {acc.name} ({acc.mobile})
          </option>
        ))}
      </CFormSelect>
    </CCol>

    <CCol md={3} className="d-flex align-items-center">
      <CFormCheck
      className='mt-4 me-2'
        label="Visible"
        name="is_visible"
        checked={formData.is_visible}
        onChange={handleChange}
      />
    </CCol>

{/* <CCol md={3}>
  <CFormLabel>Site Supervisor</CFormLabel>
  <CFormInput
    type="text"
    name="supervisor_id"
    value={orderData?.project?.supervisor?.name || ''}
       // only display, not editable
  />
</CCol> */}





    <CCol md={12}>
      <CFormLabel>Remark</CFormLabel>
      <CFormTextarea
        name="remark"
        value={formData.remark}
        onChange={handleChange}
      />
    </CCol>

    

    {/* <CCol md={3} className="d-flex align-items-center">
      <CFormCheck
        label="Confirmed"
        name="is_confirm"
        checked={formData.is_confirm}
        onChange={handleChange}
      />
    </CCol> */}
  </CRow>
</CForm>


      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={onClose}>Cancel</CButton>
        <CButton color="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes & Convert'}
        </CButton>
      </CModalFooter>
    </CModal>

  )
}

export default UpdateProjectModal