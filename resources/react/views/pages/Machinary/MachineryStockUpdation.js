

// import React, { useEffect, useState } from 'react';
// import {
//   CCard,
//   CCardBody,
//   CCardHeader,
//   CRow,
//   CCol,
//   CFormInput,
//   CFormSelect,
//   CButton,
//   CFormTextarea,
//   CTable,
//   CTableHead,
//   CTableRow,
//   CTableHeaderCell,
//   CTableBody,
//   CTableDataCell,
// } from '@coreui/react';

// import { getAPICall, postAPICall } from '../../../util/api';

// function MachineryStockUpdate() {

//   // =========================================
//   // DROPDOWN DATA
//   // =========================================
//   const [projects, setProjects] = useState([]);
//   const [machines, setMachines] = useState([]);
//   const [supervisors, setSupervisors] = useState([]);

//   // =========================================
//   // MAIN FORM DATA
//   // =========================================
//   const [formData, setFormData] = useState({
//     sr_no: '',
//     project_id: '',
//     machine_id: '',
//     hrs: '',
//     update_date: '',
//     maintenance_date: '',
//     hammer: '',
//     stock_details: '',
//     tamplet: '',
//     capping: '',
//     damage_part: '',
//     bit: '',
//     used_bit: '',
//     oil_bal: '',
//     supervisor_id: '',
//     remarks: '',
//   });

//   // =========================================
//   // MULTIPLE STOCK ITEMS
//   // =========================================
//   const [stockItems, setStockItems] = useState([
//     {
//       stock_name: '',
//       issued_qty: '',
//       used_qty: '',
//       remaining_qty: '',
//       remarks: ''
//     }
//   ]);

//   // =========================================
//   // FETCH DROPDOWNS
//   // =========================================
//   const fetchDropdowns = async () => {
//     try {
//       const projectRes = await getAPICall('/api/projects');
//       setProjects(projectRes || []);

//       const machineRes = await getAPICall('/api/machineries');
//       setMachines(machineRes?.data || machineRes || []);

//       const supervisorRes = await getAPICall('/api/operatorsByType');
//       setSupervisors(supervisorRes || []);
//     } catch (error) {
//       console.log('Error fetching dropdowns:', error);
//     }
//   };

//   useEffect(() => {
//     fetchDropdowns();
//   }, []);

//   // =========================================
//   // HANDLE MAIN FORM CHANGE
//   // =========================================
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({
//       ...formData,
//       [name]: value,
//     });
//   };

//   // =========================================
//   // HANDLE STOCK ITEMS
//   // =========================================
//   const handleStockChange = (index, field, value) => {
//     const updatedStocks = [...stockItems];
//     updatedStocks[index][field] = value;

//     // Auto calculate remaining qty
//     if (field === 'issued_qty' || field === 'used_qty') {
//       const issued = parseFloat(updatedStocks[index].issued_qty) || 0;
//       const used = parseFloat(updatedStocks[index].used_qty) || 0;
//       updatedStocks[index].remaining_qty = (issued - used).toString();
//     }

//     setStockItems(updatedStocks);
//   };

//   const addStockRow = () => {
//     setStockItems([
//       ...stockItems,
//       {
//         stock_name: '',
//         issued_qty: '',
//         used_qty: '',
//         remaining_qty: '',
//         remarks: ''
//       }
//     ]);
//   };

//   const removeStockRow = (index) => {
//     if (stockItems.length === 1) return;
//     const updated = stockItems.filter((_, i) => i !== index);
//     setStockItems(updated);
//   };

//   // =========================================
//   // HANDLE SUBMIT
//   // =========================================
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!formData.project_id || !formData.machine_id) {
//       alert('Please select Project and Machine');
//       return;
//     }

//     const payload = {
//       ...formData,
//       stock_items: stockItems.filter(item => item.stock_name?.trim() !== '')
//     };

//     try {
//       const response = await postAPICall('/api/machinery-stock-update', payload);
//       console.log(response);

//       alert('Machinery Stock Updated Successfully!');

//       // Reset Form
//       setFormData({
//         sr_no: '',
//         project_id: '',
//         machine_id: '',
//         hrs: '',
//         update_date: '',
//         maintenance_date: '',
//         hammer: '',
//         stock_details: '',
//         tamplet: '',
//         capping: '',
//         damage_part: '',
//         bit: '',
//         used_bit: '',
//         oil_bal: '',
//         supervisor_id: '',
//         remarks: '',
//       });

//       setStockItems([{
//         stock_name: '',
//         issued_qty: '',
//         used_qty: '',
//         remaining_qty: '',
//         remarks: ''
//       }]);

//     } catch (error) {
//       console.log(error);
//       alert('Failed To Save Data');
//     }
//   };

//   return (
//     <>
//       <CCard className="mb-4">
//         <CCardHeader>
//           <strong>Machinery Stock Update Form</strong>
//         </CCardHeader>

//         <CCardBody>
//           <form onSubmit={handleSubmit}>

//             <CRow className="g-3">

//               {/* SR No */}
//               {/* <CCol md={3}>
//                 <CFormInput
//                   label="SR No"
//                   name="sr_no"
//                   value={formData.sr_no}
//                   onChange={handleChange}
//                   placeholder="Enter SR No"
//                 />
//               </CCol> */}

//               {/* Project */}
//               <CCol md={4}>
//                 <CFormSelect
//                   label="Working Site Name"
//                   name="project_id"
//                   value={formData.project_id}
//                   onChange={handleChange}
//                 >
//                   <option value="">Select Site</option>
//                   {projects.map((item) => (
//                     <option key={item.id} value={item.id}>
//                       {item.project_name}
//                     </option>
//                   ))}
//                 </CFormSelect>
//               </CCol>

//               {/* Machine */}
//               <CCol md={4}>
//                 <CFormSelect
//                   label="Machine Name"
//                   name="machine_id"
//                   value={formData.machine_id}
//                   onChange={handleChange}
//                 >
//                   <option value="">Select Machine</option>
//                   {machines.map((item) => (
//                     <option key={item.id} value={item.id}>
//                       {item.machine_name}
//                     </option>
//                   ))}
//                 </CFormSelect>
//               </CCol>

//               {/* Supervisor */}
//               <CCol md={3}>
//                 <CFormSelect
//                   label="Supervisor"
//                   name="supervisor_id"
//                   value={formData.supervisor_id}
//                   onChange={handleChange}
//                 >
//                   <option value="">Select Supervisor</option>
//                   {supervisors.map((item) => (
//                     <option key={item.id} value={item.id}>
//                       {item.name}
//                     </option>
//                   ))}
//                 </CFormSelect>
//               </CCol>

//               <CCol md={3}>
//                 <CFormInput
//                   type="number"
//                   label="HRS"
//                   name="hrs"
//                   value={formData.hrs}
//                   onChange={handleChange}
//                   placeholder="Hours"
//                 />
//               </CCol>

//               <CCol md={3}>
//                 <CFormInput
//                   type="date"
//                   label="Update Date"
//                   name="update_date"
//                   value={formData.update_date}
//                   onChange={handleChange}
//                 />
//               </CCol>

//               <CCol md={3}>
//                 <CFormInput
//                   type="date"
//                   label="Maintenance Date"
//                   name="maintenance_date"
//                   value={formData.maintenance_date}
//                   onChange={handleChange}
//                 />
//               </CCol>

//               <CCol md={3}>
//                 <CFormInput
//                   type="number"
//                   label="Oil Balance"
//                   name="oil_bal"
//                   value={formData.oil_bal}
//                   onChange={handleChange}
//                   placeholder="Oil Balance"
//                 />
//               </CCol>

//               {/* Additional Fields */}
//               <CCol md={4}>
//                 <CFormInput
//                   label="Hammer"
//                   name="hammer"
//                   value={formData.hammer}
//                   onChange={handleChange}
//                   placeholder="Hammer Details"
//                 />
//               </CCol>

//               {/* <CCol md={4}>
//                 <CFormInput
//                   label="Stock Details"
//                   name="stock_details"
//                   value={formData.stock_details}
//                   onChange={handleChange}
//                   placeholder="Stock Details"
//                 />
//               </CCol> */}

//               <CCol md={4}>
//                 <CFormInput
//                   label="Template"
//                   name="tamplet"
//                   value={formData.tamplet}
//                   onChange={handleChange}
//                   placeholder="Template"
//                 />
//               </CCol>

//               <CCol md={4}>
//                 <CFormInput
//                   label="Capping"
//                   name="capping"
//                   value={formData.capping}
//                   onChange={handleChange}
//                   placeholder="Capping"
//                 />
//               </CCol>

//               <CCol md={4}>
//                 <CFormInput
//                   label="Damage Part"
//                   name="damage_part"
//                   value={formData.damage_part}
//                   onChange={handleChange}
//                   placeholder="Damage Part"
//                 />
//               </CCol>

//               <CCol md={4}>
//                 <CFormInput
//                   label="Bit"
//                   name="bit"
//                   value={formData.bit}
//                   onChange={handleChange}
//                   placeholder="Bit"
//                 />
//               </CCol>

//               <CCol md={4}>
//                 <CFormInput
//                   label="Used Bit"
//                   name="used_bit"
//                   value={formData.used_bit}
//                   onChange={handleChange}
//                   placeholder="Used Bit"
//                 />
//               </CCol>

//               {/* Stock Items Section */}
//               <CCol md={12}>
//                 <div className="border rounded p-3 bg-light">
//                   <div className="d-flex justify-content-between align-items-center mb-3">
//                     <h5 className="mb-0">Stock Items (Issued → Used → Remaining)</h5>
//                     <CButton color="success" size="sm" onClick={addStockRow}>
//                       + Add Stock
//                     </CButton>
//                   </div>

//                   <CTable bordered hover responsive>
//                     <CTableHead>
//                       <CTableRow>
//                         <CTableHeaderCell>Stock Name / Part</CTableHeaderCell>
//                         <CTableHeaderCell>Issued Qty</CTableHeaderCell>
//                         <CTableHeaderCell>Used Qty</CTableHeaderCell>
//                         <CTableHeaderCell>Remaining Qty</CTableHeaderCell>
//                         <CTableHeaderCell>Remarks</CTableHeaderCell>
//                         <CTableHeaderCell>Action</CTableHeaderCell>
//                       </CTableRow>
//                     </CTableHead>
//                     <CTableBody>
//                       {stockItems.map((item, index) => (
//                         <CTableRow key={index}>
//                           <CTableDataCell>
//                             <CFormInput
//                               placeholder="e.g. Drill Bit, Nutbolt"
//                               value={item.stock_name}
//                               onChange={(e) => handleStockChange(index, 'stock_name', e.target.value)}
//                             />
//                           </CTableDataCell>
//                           <CTableDataCell>
//                             <CFormInput
//                               type="number"
//                               value={item.issued_qty}
//                               onChange={(e) => handleStockChange(index, 'issued_qty', e.target.value)}
//                             />
//                           </CTableDataCell>
//                           <CTableDataCell>
//                             <CFormInput
//                               type="number"
//                               value={item.used_qty}
//                               onChange={(e) => handleStockChange(index, 'used_qty', e.target.value)}
//                             />
//                           </CTableDataCell>
//                           <CTableDataCell>
//                             <CFormInput
//                               type="number"
//                               value={item.remaining_qty}
//                               readOnly
//                               className="bg-light"
//                             />
//                           </CTableDataCell>
//                           <CTableDataCell>
//                             <CFormInput
//                               value={item.remarks}
//                               onChange={(e) => handleStockChange(index, 'remarks', e.target.value)}
//                               placeholder="Remarks"
//                             />
//                           </CTableDataCell>
//                           <CTableDataCell>
//                             <CButton color="danger" size="sm" onClick={() => removeStockRow(index)}>
//                               Remove
//                             </CButton>
//                           </CTableDataCell>
//                         </CTableRow>
//                       ))}
//                     </CTableBody>
//                   </CTable>
//                 </div>
//               </CCol>

//               {/* Final Remarks */}
//               <CCol md={12}>
//                 <CFormTextarea
//                   label="Overall Remarks"
//                   name="remarks"
//                   value={formData.remarks}
//                   onChange={handleChange}
//                   rows={3}
//                   placeholder="Enter overall remarks"
//                 />
//               </CCol>

//             </CRow>

//             <div className="mt-4">
//               <CButton type="submit" color="primary" size="lg">
//                 Save Machinery Stock Update
//               </CButton>
//             </div>

//           </form>
//         </CCardBody>
//       </CCard>
//     </>
//   );
// }

// export default MachineryStockUpdate;









import React, { useEffect, useState } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CRow,
  CCol,
  CFormInput,
  CFormSelect,
  CButton,
  CFormTextarea,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
} from '@coreui/react';

import { getAPICall, postAPICall } from '../../../util/api';
import { useToast } from '../../common/toast/ToastContext';

function MachineryStockUpdate() {

  const { showToast } = useToast();

  // =========================================
  // DROPDOWN DATA
  // =========================================
  const [projects, setProjects] = useState([]);
  const [machines, setMachines] = useState([]);
  const [supervisors, setSupervisors] = useState([]);

  // =========================================
  // MAIN FORM DATA
  // =========================================
  const [formData, setFormData] = useState({
    sr_no: '',
    project_id: '',
    machine_id: '',
    hrs: '',
    update_date: '',
    maintenance_date: '',
    hammer: '',
    stock_details: '',
    tamplet: '',
    capping: '',
    damage_part: '',
    bit: '',
    used_bit: '',
    oil_bal: '',
    supervisor_id: '',
    remarks: '',
  });

  // =========================================
  // MULTIPLE STOCK ITEMS
  // =========================================
  const [stockItems, setStockItems] = useState([
    {
      stock_name: '',
      issued_qty: '',
      used_qty: '',
      remaining_qty: '',
      remarks: ''
    }
  ]);

  // =========================================
  // FETCH DROPDOWNS
  // =========================================
  const fetchDropdowns = async () => {
    try {
      const [projectRes, machineRes, supervisorRes] = await Promise.all([
        getAPICall('/api/projects'),
        getAPICall('/api/machineries'),
        getAPICall('/api/operatorsByType')
      ]);

      setProjects(projectRes || []);
      setMachines(machineRes?.data || machineRes || []);
      setSupervisors(supervisorRes || []);
    } catch (error) {
      console.log('Error fetching dropdowns:', error);
    }
  };

  useEffect(() => {
    fetchDropdowns();
  }, []);

  // =========================================
  // HANDLE MAIN FORM CHANGE
  // =========================================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // =========================================
  // HANDLE STOCK ITEMS - STRONG VALIDATION
  // =========================================
  const handleStockChange = (index, field, value) => {
    const updatedStocks = [...stockItems];

    // Prevent negative values
    if ((field === 'issued_qty' || field === 'used_qty') && parseFloat(value) < 0) {
      showToast('danger', `${field === 'issued_qty' ? 'Issued' : 'Used'} quantity cannot be negative`);
      return;
    }

    updatedStocks[index][field] = value;

    // Auto calculate and validate remaining quantity
    if (field === 'issued_qty' || field === 'used_qty') {
      let issued = parseFloat(updatedStocks[index].issued_qty) || 0;
      let used = parseFloat(updatedStocks[index].used_qty) || 0;

      // Prevent Used Qty > Issued Qty
      if (used > issued) {
        showToast('danger', `Used quantity cannot exceed Issued quantity for "${updatedStocks[index].stock_name || 'this item'}"`);
        used = issued; // Auto correct
        updatedStocks[index].used_qty = used.toString();
      }

      const remaining = issued - used;
      updatedStocks[index].remaining_qty = remaining.toString();
    }

    setStockItems(updatedStocks);
  };

  const addStockRow = () => {
    setStockItems([
      ...stockItems,
      {
        stock_name: '',
        issued_qty: '',
        used_qty: '',
        remaining_qty: '',
        remarks: ''
      }
    ]);
  };

  const removeStockRow = (index) => {
    if (stockItems.length === 1) return;
    const updated = stockItems.filter((_, i) => i !== index);
    setStockItems(updated);
  };

  // =========================================
  // HANDLE SUBMIT WITH FULL VALIDATION
  // =========================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.project_id) return showToast('danger', 'Project is required');
    if (!formData.machine_id) return showToast('danger', 'Machine is required');
    if (!formData.supervisor_id) return showToast('danger', 'Supervisor is required');
    if (!formData.update_date) return showToast('danger', 'Update Date is required');

    const validStockItems = stockItems.filter(item => item.stock_name?.trim() !== '');

    if (validStockItems.length === 0) {
      return showToast('danger', 'At least one Stock Item with name is required');
    }

    // Final Validation
    for (let item of validStockItems) {
      const issued = parseFloat(item.issued_qty) || 0;
      const used = parseFloat(item.used_qty) || 0;

      if (issued <= 0) {
        return showToast('danger', `Issued quantity must be greater than 0 for "${item.stock_name}"`);
      }
      if (used > issued) {
        return showToast('danger', `Used quantity cannot exceed Issued quantity for "${item.stock_name}"`);
      }
    }

    const payload = {
      ...formData,
      stock_items: validStockItems
    };

    try {
      await postAPICall('/api/machinery-stock-update', payload);
      showToast('success', 'Machinery Stock Updated Successfully!');

      // Reset Form
      setFormData({
        sr_no: '',
        project_id: '',
        machine_id: '',
        hrs: '',
        update_date: '',
        maintenance_date: '',
        hammer: '',
        stock_details: '',
        tamplet: '',
        capping: '',
        damage_part: '',
        bit: '',
        used_bit: '',
        oil_bal: '',
        supervisor_id: '',
        remarks: '',
      });

      setStockItems([{
        stock_name: '',
        issued_qty: '',
        used_qty: '',
        remaining_qty: '',
        remarks: ''
      }]);

    } catch (error) {
      console.error(error);
      const message = error?.response?.data?.message || 'Failed To Save Data';
      showToast('danger', message);
    }
  };

  return (
    <>
      <CCard className="mb-4">
        <CCardHeader>
          <strong>Machinery Stock Update Form</strong>
        </CCardHeader>

        <CCardBody>
          <form onSubmit={handleSubmit}>

            <CRow className="g-3">

              {/* <CCol md={3}>
                <CFormInput
                  label="SR No"
                  name="sr_no"
                  value={formData.sr_no}
                  onChange={handleChange}
                  placeholder="Enter SR No"
                />
              </CCol> */}

              <CCol md={4}>
                <CFormSelect
                  label="Working Site Name *"
                  name="project_id"
                  value={formData.project_id}
                  onChange={handleChange}
                  
                >
                  <option value="">Select Site</option>
                  {projects.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.project_name}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>

              <CCol md={4}>
                <CFormSelect
                  label="Machine Name *"
                  name="machine_id"
                  value={formData.machine_id}
                  onChange={handleChange}
                 
                >
                  <option value="">Select Machine</option>
                  {machines.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.machine_name}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>

              <CCol md={3}>
                <CFormSelect
                  label="Supervisor"
                  name="supervisor_id"
                  value={formData.supervisor_id}
                  onChange={handleChange}
                >
                  <option value="">Select Supervisor</option>
                  {supervisors.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>

              <CCol md={3}>
                <CFormInput  onKeyDown={(e) => {
    // Prevent negative sign
    if (e.key === '-') {
      e.preventDefault();
    }
  }} type="number" label="HRS" name="hrs" value={formData.hrs} onChange={handleChange} />
              </CCol>

              <CCol md={3}>
                <CFormInput type="date" label="Update Date *" name="update_date" value={formData.update_date} onChange={handleChange}  />
              </CCol>

              <CCol md={3}>
                <CFormInput type="date" label="Maintenance Date" name="maintenance_date" value={formData.maintenance_date} onChange={handleChange} />
              </CCol>

              <CCol md={3}>
                <CFormInput  onKeyDown={(e) => {
    // Prevent negative sign
    if (e.key === '-') {
      e.preventDefault();
    }
  }} type="number" label="Oil Balance" name="oil_bal" value={formData.oil_bal} onChange={handleChange} />
              </CCol>

              <CCol md={4}>
                <CFormInput label="Hammer" name="hammer" value={formData.hammer} onChange={handleChange} />
              </CCol>

              <CCol md={4}>
                <CFormInput  onKeyDown={(e) => {
    // Prevent negative sign
    if (e.key === '-') {
      e.preventDefault();
    }
  }} label="Template" name="tamplet" value={formData.tamplet} onChange={handleChange} />
              </CCol>

              <CCol md={4}>
                <CFormInput  onKeyDown={(e) => {
    // Prevent negative sign
    if (e.key === '-') {
      e.preventDefault();
    }
  }} label="Capping" name="capping" value={formData.capping} onChange={handleChange} />
              </CCol>

              <CCol md={4}>
                <CFormInput label="Damage Part" name="damage_part" value={formData.damage_part} onChange={handleChange} />
              </CCol>

              <CCol md={4}>
                <CFormInput  label="Bit" name="bit" value={formData.bit} onChange={handleChange} />
              </CCol>

              <CCol md={4}>
                <CFormInput label="Used Bit" name="used_bit" value={formData.used_bit} onChange={handleChange} />
              </CCol>

              {/* Stock Items Section */}
              <CCol md={12}>
                <div className="border rounded p-3 bg-light">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0">Stock Items (Issued → Used → Remaining) *</h5>
                    <CButton color="success" size="sm" onClick={addStockRow}>
                      + Add Stock
                    </CButton>
                  </div>

                  <CTable bordered hover responsive>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>Stock Name / Part *</CTableHeaderCell>
                        <CTableHeaderCell>Issued Qty</CTableHeaderCell>
                        <CTableHeaderCell>Used Qty</CTableHeaderCell>
                        <CTableHeaderCell>Remaining Qty</CTableHeaderCell>
                        <CTableHeaderCell>Remarks</CTableHeaderCell>
                        <CTableHeaderCell>Action</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {stockItems.map((item, index) => (
                        <CTableRow key={index}>
                          <CTableDataCell>
                            <CFormInput
                              placeholder="e.g. Drill Bit, Nutbolt"
                              value={item.stock_name}
                              onChange={(e) => handleStockChange(index, 'stock_name', e.target.value)}
                            />
                          </CTableDataCell>
                          <CTableDataCell>
                            <CFormInput
                              type="number"
                              min="0"
                              value={item.issued_qty}
                               onKeyDown={(e) => {
    // Prevent negative sign
    if (e.key === '-') {
      e.preventDefault();
    }
  }}
                              onChange={(e) => handleStockChange(index, 'issued_qty', e.target.value)}
                            />
                          </CTableDataCell>
                          <CTableDataCell>
                            <CFormInput
                              type="number"
                              min="0"
                              value={item.used_qty}
                              onChange={(e) => handleStockChange(index, 'used_qty', e.target.value)}
                            />
                          </CTableDataCell>
                          <CTableDataCell>
                            <CFormInput
                              type="number"
                              value={item.remaining_qty}
                              readOnly
                              className="bg-light"
                            />
                          </CTableDataCell>
                          <CTableDataCell>
                            <CFormInput
                              value={item.remarks}
                              onChange={(e) => handleStockChange(index, 'remarks', e.target.value)}
                            />
                          </CTableDataCell>
                          <CTableDataCell>
                            <CButton color="danger" size="sm" onClick={() => removeStockRow(index)}>
                              Remove
                            </CButton>
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                </div>
              </CCol>

              <CCol md={12}>
                <CFormTextarea
                  label="Overall Remarks"
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Enter overall remarks"
                />
              </CCol>

            </CRow>

            <div className="mt-4">
              <CButton type="submit" color="primary" size="lg">
                Save Machinery Stock Update
              </CButton>
            </div>

          </form>
        </CCardBody>
      </CCard>
    </>
  );
}

export default MachineryStockUpdate;
