
// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';

// import {
//   CCard,
//   CCardBody,
//   CCardHeader,
//   CTable,
//   CTableHead,
//   CTableRow,
//   CTableHeaderCell,
//   CTableBody,
//   CTableDataCell,
//   CButton,
//   CCollapse,
//   CModal,
//   CModalHeader,
//   CModalTitle,
//   CModalBody,
//   CModalFooter,
//   CFormInput,
//   CFormSelect,
//   CFormTextarea,
//   CRow,
//   CCol,
//   CBadge,
// } from '@coreui/react';

// import { getAPICall, postAPICall, put } from '../../../util/api';
// import { useToast } from '../../common/toast/ToastContext';
// import * as XLSX from 'xlsx';

// function MachineryStockList() {
//   const navigate = useNavigate();
//   const { showToast } = useToast();

//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [expandedRows, setExpandedRows] = useState({});

//   // Filters
//   const [projects, setProjects] = useState([]);
//   const [machines, setMachines] = useState([]);
//   const [supervisors, setSupervisors] = useState([]);
//   const [filterProject, setFilterProject] = useState('');
//   const [filterMachine, setFilterMachine] = useState('');

//   // Modals
//   const [showMainEditModal, setShowMainEditModal] = useState(false);
//   const [editingMainRecord, setEditingMainRecord] = useState(null);
//   const [mainEditForm, setMainEditForm] = useState({});

//   const [showStockEditModal, setShowStockEditModal] = useState(false);
//   const [editingStockItem, setEditingStockItem] = useState(null);
//   const [stockEditForm, setStockEditForm] = useState({});

//   const [showTransferModal, setShowTransferModal] = useState(false);
//   const [selectedStockForTransfer, setSelectedStockForTransfer] = useState(null);
//   const [transferData, setTransferData] = useState({
//     to_project_id: '',
//     to_machine_id: '',
//     quantity: '',
//     reason: ''
//   });

//   const [showLogsModal, setShowLogsModal] = useState(false);
//   const [selectedStockForLogs, setSelectedStockForLogs] = useState(null);
//   const [logs, setLogs] = useState([]);
//   const [logsLoading, setLogsLoading] = useState(false);

//   // Fetch Dropdowns
//   const fetchDropdowns = async () => {
//     try {
//       const [pRes, mRes, supRes] = await Promise.all([
//         getAPICall('/api/projects'),
//         getAPICall('/api/machineries'),
//         getAPICall('/api/operatorsByType')
//       ]);
//       setProjects(pRes || []);
//       setMachines(mRes?.data || mRes || []);
//       setSupervisors(supRes || []);
//     } catch (err) {
//       console.error('Dropdown fetch error:', err);
//     }
//   };

//   // Fetch Data
//   const fetchData = async () => {
//     try {
//       setLoading(true);
//       let url = '/api/machinery-stock-update';
//       const params = new URLSearchParams();
//       if (filterProject) params.append('project_id', filterProject);
//       if (filterMachine) params.append('machine_id', filterMachine);
//       const qs = params.toString();
//       if (qs) url += `?${qs}`;

//       const res = await getAPICall(url);
//       setData(res || []);
//     } catch (error) {
//       console.error('Error fetching data:', error);
//       setData([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { fetchDropdowns(); }, []);
//   useEffect(() => { fetchData(); }, [filterProject, filterMachine]);

//   const toggleExpand = (id) => {
//     setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
//   };

//   // Prevent negative sign in number inputs
//   const preventNegative = (e) => {
//     if (e.key === '-') e.preventDefault();
//   };

//   // ====================== LOGS ======================
//   const openLogsModal = async (stockItem) => {
//     setSelectedStockForLogs(stockItem);
//     setLogs([]);
//     setLogsLoading(true);
//     setShowLogsModal(true);
//     try {
//       const res = await getAPICall(`/api/machinery-stock-logs/${stockItem.id}`);
//       setLogs(Array.isArray(res) ? res : []);
//     } catch (error) {
//       console.error('Error fetching logs:', error);
//     } finally {
//       setLogsLoading(false);
//     }
//   };

//   // ====================== MAIN EDIT ======================
//   const openMainEditModal = (record) => {
//     setEditingMainRecord(record);
//     setMainEditForm({ ...record });
//     setShowMainEditModal(true);
//   };

//   const handleMainEditChange = (e) => {
//     const { name, value } = e.target;
//     setMainEditForm(prev => ({ ...prev, [name]: value }));
//   };

//   const handleMainEditSave = async () => {
//     try {
//       await put(`/api/machinery-stock-update/${editingMainRecord.id}`, mainEditForm);
//       showToast('success', 'Main Record Updated Successfully!');
//       setShowMainEditModal(false);
//       fetchData();
//     } catch (err) {
//       showToast('danger', 'Failed to update main record');
//     }
//   };

//   // ====================== STOCK EDIT ======================
//   const openStockEditModal = (stockItem) => {
//     setEditingStockItem(stockItem);
//     setStockEditForm({
//       ...stockItem,
//       used_qty: '',
//       remarks: stockItem.remarks || ''
//     });
//     setShowStockEditModal(true);
//   };

//   const handleStockEditChange = (e) => {
//     const { name, value } = e.target;
//     setStockEditForm(prev => ({ ...prev, [name]: value }));
//   };

//   const handleStockEditSave = async () => {
//     const addUsed = parseFloat(stockEditForm.used_qty) || 0;
//     if (addUsed <= 0) return showToast('danger', 'Used quantity must be greater than 0');

//     const currentUsed = parseFloat(editingStockItem.used_qty) || 0;
//     const issued = parseFloat(editingStockItem.issued_qty) || 0;
//     const transferred = parseFloat(editingStockItem.transferred_qty) || 0;

//     if (currentUsed + addUsed > issued - transferred) {
//       return showToast('danger', 'Used quantity cannot exceed remaining stock');
//     }

//     try {
//       await put(`/api/machinery-stock-items/${editingStockItem.id}`, stockEditForm);
//       showToast('success', 'Stock Item Updated Successfully!');
//       setShowStockEditModal(false);
//       fetchData();
//     } catch (err) {
//       showToast('danger', 'Failed to update stock item');
//     }
//   };

//   // ====================== TRANSFER ======================
//   const openTransferModal = (stockItem) => {
//     setSelectedStockForTransfer(stockItem);
//     setTransferData({ to_project_id: '', to_machine_id: '', quantity: '', reason: '' });
//     setShowTransferModal(true);
//   };

//   const handleTransfer = async () => {
//     const qty = parseFloat(transferData.quantity) || 0;
//     const remaining = parseFloat(selectedStockForTransfer.remaining_qty) || 0;

//     if (!transferData.to_project_id || !transferData.to_machine_id) {
//       return showToast('danger', 'Please select Project and Machine');
//     }
//     if (qty <= 0) return showToast('danger', 'Transfer quantity must be greater than 0');
//     if (qty > remaining) return showToast('danger', 'Transfer quantity cannot exceed remaining quantity');

//     try {
//       await postAPICall('/api/machinery-stock-transfer', {
//         stock_item_id: selectedStockForTransfer.id,
//         to_project_id: transferData.to_project_id,
//         to_machine_id: transferData.to_machine_id,
//         quantity: transferData.quantity,
//         reason: transferData.reason || 'Stock transferred after work'
//       });
//       showToast('success', 'Stock Transferred Successfully!');
//       setShowTransferModal(false);
//       fetchData();
//     } catch (err) {
//       showToast('danger', 'Transfer Failed');
//     }
//   };

//   // ====================== EXCEL ======================
//   const downloadExcel = () => {
//     const exportData = [];
//     data.forEach((record) => {
//       if (record.stock_items?.length > 0) {
//         record.stock_items.forEach((stock) => {
//           exportData.push({
//             'SR No': record.sr_no || '-',
//             'Project': record.project?.project_name || '-',
//             'Machine': record.machine?.machine_name || '-',
//             'Hours': record.hrs || 0,
//             'Update Date': record.update_date || '-',
//             'Supervisor': record.supervisor?.name || '-',
//             'Stock Name': stock.stock_name || '-',
//             'Issued Qty': stock.issued_qty || 0,
//             'Used Qty': stock.used_qty || 0,
//             'Transferred Qty': stock.transferred_qty || 0,
//             'Remaining Qty': stock.remaining_qty || 0,
//           });
//         });
//       }
//     });

//     const ws = XLSX.utils.json_to_sheet(exportData);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "Machinery Stock");
//     XLSX.writeFile(wb, `Machinery_Stock_${new Date().toISOString().slice(0,10)}.xlsx`);
//   };

//   return (
//     <>
//       <CCard className="mb-4">
//         <CCardHeader className="d-flex justify-content-between align-items-center" style={{ background: '#1e3a5f', color: '#fff' }}>
//           <strong>Machinery Stock Update List</strong>
//           <div>
//             <CButton color="primary" className="me-2" onClick={() => navigate('/machineryStockUpdate')}>
//               + Add New Stock
//             </CButton>
//             <CButton color="success" onClick={downloadExcel}>
//               ≡ƒôÑ Download Excel
//             </CButton>
//           </div>
//         </CCardHeader>

//         <CCardBody>
//           {/* Filters */}
//           <CRow className="mb-3 g-3">
//             <CCol md={4}>
//               <CFormSelect value={filterProject} onChange={(e) => setFilterProject(e.target.value)}>
//                 <option value="">All Projects</option>
//                 {projects.map(p => <option key={p.id} value={p.id}>{p.project_name}</option>)}
//               </CFormSelect>
//             </CCol>
//             <CCol md={4}>
//               <CFormSelect value={filterMachine} onChange={(e) => setFilterMachine(e.target.value)}>
//                 <option value="">All Machines</option>
//                 {machines.map(m => <option key={m.id} value={m.id}>{m.machine_name}</option>)}
//               </CFormSelect>
//             </CCol>
//             <CCol md={4}>
//               <CButton color="secondary" onClick={() => { setFilterProject(''); setFilterMachine(''); }}>
//                 Clear Filters
//               </CButton>
//             </CCol>
//           </CRow>

//           {loading ? (
//             <div className="text-center py-5">Loading...</div>
//           ) : (
//             <CTable bordered hover responsive>
//               <CTableHead>
//                 <CTableRow>
//                   <CTableHeaderCell>Project</CTableHeaderCell>
//                   <CTableHeaderCell>Machine</CTableHeaderCell>
//                   <CTableHeaderCell>HRS</CTableHeaderCell>
//                   <CTableHeaderCell>Update Date</CTableHeaderCell>
//                   <CTableHeaderCell>Supervisor</CTableHeaderCell>
//                   <CTableHeaderCell>Action</CTableHeaderCell>
//                 </CTableRow>
//               </CTableHead>
//               <CTableBody>
//                 {data.length === 0 ? (
//                   <CTableRow>
//                     <CTableDataCell colSpan="6" className="text-center">No Records Found</CTableDataCell>
//                   </CTableRow>
//                 ) : (
//                   data.map((record) => (
//                     <React.Fragment key={record.id}>
//                       <CTableRow>
//                         <CTableDataCell>{record.project?.project_name || '-'}</CTableDataCell>
//                         <CTableDataCell>{record.machine?.machine_name || '-'}</CTableDataCell>
//                         <CTableDataCell>{record.hrs || 0}</CTableDataCell>
//                         <CTableDataCell>{record.update_date}</CTableDataCell>
//                         <CTableDataCell>{record.supervisor?.name || '-'}</CTableDataCell>
//                         <CTableDataCell>
//                           <CButton size="sm" color="info" onClick={() => toggleExpand(record.id)} className="me-2">
//                             {expandedRows[record.id] ? 'Hide' : 'View'}
//                           </CButton>
//                           <CButton size="sm" color="warning" onClick={() => openMainEditModal(record)} className="me-2">
//                             Edit
//                           </CButton>
//                         </CTableDataCell>
//                       </CTableRow>

//                       <CTableRow>
//                         <CTableDataCell colSpan="6" className="p-0">
//                           <CCollapse visible={expandedRows[record.id]}>
//                             <div className="p-3 bg-light">
//                               <h6 className="mb-3">Stock Items</h6>
//                               <CTable bordered small responsive>
//                                 <CTableHead>
//                                   <CTableRow>
//                                     <CTableHeaderCell>Stock Name</CTableHeaderCell>
//                                     <CTableHeaderCell>Issued</CTableHeaderCell>
//                                     <CTableHeaderCell>Used</CTableHeaderCell>
//                                     <CTableHeaderCell>Transferred</CTableHeaderCell>
//                                     <CTableHeaderCell>Remaining</CTableHeaderCell>
//                                     <CTableHeaderCell>Action</CTableHeaderCell>
//                                   </CTableRow>
//                                 </CTableHead>
//                                 <CTableBody>
//                                   {record.stock_items?.map((stock) => (
//                                     <CTableRow key={stock.id}>
//                                       <CTableDataCell><strong>{stock.stock_name}</strong></CTableDataCell>
//                                       <CTableDataCell>{stock.issued_qty}</CTableDataCell>
//                                       <CTableDataCell>{stock.used_qty}</CTableDataCell>
//                                       <CTableDataCell>{stock.transferred_qty || 0}</CTableDataCell>
//                                       <CTableDataCell className="text-success fw-bold">
//                                         {stock.remaining_qty}
//                                       </CTableDataCell>
//                                       <CTableDataCell>
//                                         <CButton size="sm" color="warning" className="me-2" onClick={() => openStockEditModal(stock)}>
//                                           Edit
//                                         </CButton>
//                                         {parseFloat(stock.remaining_qty) > 0 && (
//                                           <CButton size="sm" color="primary" className="me-2" onClick={() => openTransferModal(stock)}>
//                                             Transfer
//                                           </CButton>
//                                         )}
//                                         <CButton size="sm" color="info" onClick={() => openLogsModal(stock)}>
//                                           View Logs
//                                         </CButton>
//                                       </CTableDataCell>
//                                     </CTableRow>
//                                   ))}
//                                 </CTableBody>
//                               </CTable>
//                             </div>
//                           </CCollapse>
//                         </CTableDataCell>
//                       </CTableRow>
//                     </React.Fragment>
//                   ))
//                 )}
//               </CTableBody>
//             </CTable>
//           )}
//         </CCardBody>
//       </CCard>

//       {/* LOGS MODAL */}
//       <CModal visible={showLogsModal} onClose={() => setShowLogsModal(false)} size="lg">
//         <CModalHeader style={{ background: '#1e3a5f', color: '#fff' }}>
//           <CModalTitle>≡ƒôï Stock History - {selectedStockForLogs?.stock_name}</CModalTitle>
//         </CModalHeader>
//         <CModalBody>
//           {logsLoading ? (
//             <div className="text-center py-5">Loading logs...</div>
//           ) : logs.length === 0 ? (
//             <p className="text-center text-muted py-5">No activity logs found for this stock item.</p>
//           ) : (
//             <CTable bordered hover responsive>
//               <CTableHead color="dark">
//                 <CTableRow>
//                   <CTableHeaderCell>Date</CTableHeaderCell>
//                   <CTableHeaderCell>Type</CTableHeaderCell>
//                   <CTableHeaderCell>Quantity</CTableHeaderCell>
//                   <CTableHeaderCell>Remaining After</CTableHeaderCell>
//                   <CTableHeaderCell>Destination</CTableHeaderCell>
//                   <CTableHeaderCell>Remarks</CTableHeaderCell>
//                 </CTableRow>
//               </CTableHead>
//               <CTableBody>
//                 {logs.map((log, index) => (
//                   <CTableRow key={index}>
//                     <CTableDataCell>{log.log_date}</CTableDataCell>
//                     <CTableDataCell>
//                       <CBadge color={log.type === 'used' ? 'warning' : 'danger'}>
//                         {log.type.toUpperCase()}
//                       </CBadge>
//                     </CTableDataCell>
//                     <CTableDataCell className="fw-bold text-center">{log.quantity}</CTableDataCell>
//                     <CTableDataCell className="text-success fw-bold text-center">{log.remaining_after}</CTableDataCell>
//                     <CTableDataCell>
//                       {log.type === 'transferred' && (log.to_project || log.to_machine) ? (
//                         <div>
//                           <strong>To:</strong><br />
//                           {log.to_project && <span>{log.to_project}</span>}<br />
//                           {log.to_machine && <small className="text-muted">{log.to_machine}</small>}
//                         </div>
//                       ) : '-'}
//                     </CTableDataCell>
//                     <CTableDataCell>{log.remarks || '-'}</CTableDataCell>
//                   </CTableRow>
//                 ))}
//               </CTableBody>
//             </CTable>
//           )}
//         </CModalBody>
//         <CModalFooter>
//           <CButton color="secondary" onClick={() => setShowLogsModal(false)}>Close</CButton>
//         </CModalFooter>
//       </CModal>

//       {/* MAIN EDIT MODAL */}
//       <CModal visible={showMainEditModal} onClose={() => setShowMainEditModal(false)} size="xl">
//         <CModalHeader style={{ background: '#1e3a5f', color: '#fff' }}>
//           <CModalTitle>Edit Main Stock Update</CModalTitle>
//         </CModalHeader>
//         <CModalBody>
//           <CRow className="g-3">
//             <CCol md={4}>
//               <CFormSelect label="Project" name="project_id" value={mainEditForm.project_id || ''} onChange={handleMainEditChange}>
//                 {projects.map(p => <option key={p.id} value={p.id}>{p.project_name}</option>)}
//               </CFormSelect>
//             </CCol>
//             <CCol md={4}>
//               <CFormSelect label="Machine" name="machine_id" value={mainEditForm.machine_id || ''} onChange={handleMainEditChange}>
//                 {machines.map(m => <option key={m.id} value={m.id}>{m.machine_name}</option>)}
//               </CFormSelect>
//             </CCol>
//             <CCol md={4}>
//               <CFormSelect label="Supervisor" name="supervisor_id" value={mainEditForm.supervisor_id || ''} onChange={handleMainEditChange}>
//                 <option value="">Select Supervisor</option>
//                 {supervisors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
//               </CFormSelect>
//             </CCol>
//             <CCol md={3}>
//               <CFormInput type="number" label="HRS" name="hrs" value={mainEditForm.hrs || ''} onChange={handleMainEditChange} />
//             </CCol>
//             <CCol md={3}>
//               <CFormInput type="date" label="Update Date" name="update_date" value={mainEditForm.update_date || ''} onChange={handleMainEditChange} />
//             </CCol>
//             <CCol md={3}>
//               <CFormInput type="date" label="Maintenance Date" name="maintenance_date" value={mainEditForm.maintenance_date || ''} onChange={handleMainEditChange} />
//             </CCol>
//             <CCol md={3}>
//               <CFormInput type="number" label="Oil Balance" name="oil_bal" value={mainEditForm.oil_bal || ''} onChange={handleMainEditChange} />
//             </CCol>
//             <CCol md={4}>
//               <CFormInput label="Hammer" name="hammer" value={mainEditForm.hammer || ''} onChange={handleMainEditChange} />
//             </CCol>
//             <CCol md={4}>
//               <CFormInput label="Template" name="tamplet" value={mainEditForm.tamplet || ''} onChange={handleMainEditChange} />
//             </CCol>
//             <CCol md={4}>
//               <CFormInput label="Capping" name="capping" value={mainEditForm.capping || ''} onChange={handleMainEditChange} />
//             </CCol>
//             <CCol md={4}>
//               <CFormInput label="Damage Part" name="damage_part" value={mainEditForm.damage_part || ''} onChange={handleMainEditChange} />
//             </CCol>
//             <CCol md={4}>
//               <CFormInput label="Bit" name="bit" value={mainEditForm.bit || ''} onChange={handleMainEditChange} />
//             </CCol>
//             <CCol md={4}>
//               <CFormInput label="Used Bit" name="used_bit" value={mainEditForm.used_bit || ''} onChange={handleMainEditChange} />
//             </CCol>
//             <CCol md={12}>
//               <CFormTextarea label="Stock Details" name="stock_details" value={mainEditForm.stock_details || ''} onChange={handleMainEditChange} rows={2} />
//             </CCol>
//           </CRow>
//         </CModalBody>
//         <CModalFooter>
//           <CButton color="secondary" onClick={() => setShowMainEditModal(false)}>Cancel</CButton>
//           <CButton color="primary" onClick={handleMainEditSave}>Save Changes</CButton>
//         </CModalFooter>
//       </CModal>

//       {/* STOCK EDIT MODAL */}
//       <CModal visible={showStockEditModal} onClose={() => setShowStockEditModal(false)}>
//         <CModalHeader style={{ background: '#1e3a5f', color: '#fff' }}>
//           <CModalTitle>Update Used Quantity</CModalTitle>
//         </CModalHeader>
//         <CModalBody>
//           {editingStockItem && (
//             <div className="mb-3 p-3 bg-light rounded">
//               <strong>Stock:</strong> {editingStockItem.stock_name}<br />
//               <strong>Current Used:</strong> {editingStockItem.used_qty} | 
//               <strong> Remaining:</strong> {editingStockItem.remaining_qty}
//             </div>
//           )}
//           <CRow className="g-3">
//             <CCol md={12}>
//               <CFormInput label="Stock Name" name="stock_name" value={stockEditForm.stock_name || ''} onChange={handleStockEditChange} />
//             </CCol>
//             <CCol md={12}>
//               <CFormInput 
//                 type="number" 
//                 min="0"
//                 label="Add Used Qty (Today)" 
//                 name="used_qty" 
//                 value={stockEditForm.used_qty || ''} 
//                 onChange={handleStockEditChange} 
//                 onKeyDown={preventNegative}
//                 placeholder="Enter quantity used today"
//               />
//             </CCol>
//             <CCol md={12}>
//               <CFormTextarea label="Remarks" name="remarks" value={stockEditForm.remarks || ''} onChange={handleStockEditChange} rows={3} />
//             </CCol>
//           </CRow>
//         </CModalBody>
//         <CModalFooter>
//           <CButton color="secondary" onClick={() => setShowStockEditModal(false)}>Cancel</CButton>
//           <CButton color="primary" onClick={handleStockEditSave}>Save Used Quantity</CButton>
//         </CModalFooter>
//       </CModal>

//       {/* TRANSFER MODAL */}
//       <CModal visible={showTransferModal} onClose={() => setShowTransferModal(false)}>
//         <CModalHeader style={{ background: '#1e3a5f', color: '#fff' }}>
//           <CModalTitle>Transfer Remaining Stock</CModalTitle>
//         </CModalHeader>
//         <CModalBody>
//           {selectedStockForTransfer && (
//             <div className="mb-3 p-3 bg-light rounded">
//               <strong>Stock:</strong> {selectedStockForTransfer.stock_name}<br />
//               <strong>Remaining:</strong> {selectedStockForTransfer.remaining_qty}
//             </div>
//           )}
//           <CRow className="g-3">
//             <CCol md={6}>
//               <CFormSelect label="To Project" value={transferData.to_project_id} onChange={e => setTransferData({...transferData, to_project_id: e.target.value})}>
//                 <option value="">Select Project</option>
//                 {projects.map(p => <option key={p.id} value={p.id}>{p.project_name}</option>)}
//               </CFormSelect>
//             </CCol>
//             <CCol md={6}>
//               <CFormSelect label="To Machine" value={transferData.to_machine_id} onChange={e => setTransferData({...transferData, to_machine_id: e.target.value})}>
//                 <option value="">Select Machine</option>
//                 {machines.map(m => <option key={m.id} value={m.id}>{m.machine_name}</option>)}
//               </CFormSelect>
//             </CCol>
//             <CCol md={12}>
//               <CFormInput 
//                 type="number" 
//                 min="0"
//                 label="Transfer Quantity" 
//                 value={transferData.quantity} 
//                 onChange={e => setTransferData({...transferData, quantity: e.target.value})} 
//                 onKeyDown={preventNegative}
//               />
//             </CCol>
//             <CCol md={12}>
//               <CFormTextarea label="Reason" value={transferData.reason} onChange={e => setTransferData({...transferData, reason: e.target.value})} placeholder="Reason for transfer (optional)" />
//             </CCol>
//           </CRow>
//         </CModalBody>
//         <CModalFooter>
//           <CButton color="secondary" onClick={() => setShowTransferModal(false)}>Cancel</CButton>
//           <CButton color="primary" onClick={handleTransfer}>Confirm Transfer</CButton>
//         </CModalFooter>
//       </CModal>
//     </>
//   );
// }

// export default MachineryStockList;





import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getAPICall, postAPICall, put, deleteAPICall } from '../../../util/api';
import { useToast } from '../../common/toast/ToastContext';

/* ΓöÇΓöÇΓöÇ helpers ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */
const today = () => new Date().toISOString().split('T')[0];
const fmt   = (v) => (v == null || v === '' ? 'ΓÇö' : v);
const money = (v) => `Γé╣${Number(v).toLocaleString('en-IN')}`;

function pct(current, initial) {
  if (!initial) return 0;
  return Math.round((current / initial) * 100);
}

function stockStatus(item) {
  const p = pct(item.currentQty, item.initialQty);
  if (item.currentQty <= item.minQty) return { label: 'Critical', color: '#E24B4A', bg: '#FCEBEB', dot: '#E24B4A' };
  if (p <= 30)                         return { label: 'Low',      color: '#BA7517', bg: '#FAEEDA', dot: '#EF9F27' };
  return                                      { label: 'OK',       color: '#0F6E56', bg: '#E1F5EE', dot: '#1D9E75' };
}

/* ΓöÇΓöÇΓöÇ tiny modal helper ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */
function Modal({ title, onClose, children, wide }) {
  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(15,23,42,0.55)',zIndex:999,display:'flex',alignItems:'center',justifyContent:'center',padding:16 }}>
      <div style={{ background:'#fff',borderRadius:14,width:'100%',maxWidth: wide ? 760 : 520,maxHeight:'90vh',overflowY:'auto',boxShadow:'0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'18px 22px',borderBottom:'1px solid #F1F5F9' }}>
          <h3 style={{ margin:0,fontSize:16,fontWeight:700,color:'#0F172A' }}>{title}</h3>
          <button onClick={onClose} style={{ background:'none',border:'none',cursor:'pointer',fontSize:20,color:'#94A3B8',lineHeight:1 }}>├ù</button>
        </div>
        <div style={{ padding:'20px 22px' }}>{children}</div>
      </div>
    </div>
  );
}

/* ΓöÇΓöÇΓöÇ form field ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */
const FRow = ({ label, children }) => (
  <div style={{ marginBottom:14 }}>
    <label style={{ fontSize:12,fontWeight:700,color:'#64748B',textTransform:'uppercase',letterSpacing:'0.4px',display:'block',marginBottom:5 }}>{label}</label>
    {children}
  </div>
);
const inp = { width:'100%',padding:'8px 12px',borderRadius:8,border:'1.5px solid #E2E8F0',fontSize:13,fontFamily:'inherit',color:'#1E293B',outline:'none',boxSizing:'border-box' };
const sel = { ...inp };

/* ΓöÇΓöÇΓöÇ badge ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */
const Badge = ({ label, color, bg }) => (
  <span style={{ fontSize:11,fontWeight:700,color,background:bg,padding:'2px 8px',borderRadius:20,whiteSpace:'nowrap' }}>{label}</span>
);

/* ΓöÇΓöÇΓöÇ progress bar ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */
const Bar = ({ pct: p, color }) => (
  <div style={{ height:5,background:'#F1F5F9',borderRadius:4,overflow:'hidden',marginTop:5 }}>
    <div style={{ height:5,width:`${Math.min(p,100)}%`,background:color,borderRadius:4,transition:'width 0.5s' }} />
  </div>
);

/* ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ
   STOCK MASTER TAB
ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ */
function StockMasterTab({ state, onRefresh }) {
  const { stockMaster, projects, machines, dashboardStats } = state;
  const { showToast } = useToast();
  
  const [filterProject, setFilterProject] = useState('');
  const [filterCat,     setFilterCat]     = useState('');
  const [showAdd,       setShowAdd]       = useState(false);
  const [showEdit,      setShowEdit]      = useState(null);
  const [showUsage,     setShowUsage]     = useState(null);
  const [showTransfer,  setShowTransfer]  = useState(null);
  const [showHistory,   setShowHistory]   = useState(null);
  
  const [addForm, setAddForm] = useState({ projectId:'', machineId:'', itemName:'', unit:'NOS', initialQty:'', minQty:'', category:'Consumable' });
  const [editForm, setEditForm] = useState({ projectId:'', machineId:'', itemName:'', unit:'NOS', initialQty:'', minQty:'', category:'Consumable' });
  const [usageForm, setUsageForm] = useState({ qty:'', note:'' });
  const [tfForm, setTfForm] = useState({ toProjectId:'', toMachineId:'', qty:'', note:'' });
  
  const [historyLogs,   setHistoryLogs]   = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const filtered = stockMaster.filter(s =>
    (!filterProject || s.projectId === Number(filterProject)) &&
    (!filterCat     || s.category === filterCat)
  );

  const cats = [...new Set(stockMaster.map(s => s.category))];

  const submitAdd = async () => {
    if (!addForm.projectId || !addForm.itemName || !addForm.initialQty) return alert('Fill required fields');
    try {
      await postAPICall('/api/machinery/stock', {
        project_id: Number(addForm.projectId),
        machine_id: addForm.machineId ? Number(addForm.machineId) : null,
        item_name: addForm.itemName,
        category: addForm.category,
        unit: addForm.unit,
        initial_qty: Number(addForm.initialQty),
        min_qty: Number(addForm.minQty || 0)
      });
      showToast('success', 'Stock item added successfully!');
      setShowAdd(false);
      setAddForm({ projectId:'', machineId:'', itemName:'', unit:'NOS', initialQty:'', minQty:'', category:'Consumable' });
      onRefresh();
    } catch (err) {
      alert(err.message || 'Failed to add stock item');
    }
  };

  const submitEdit = async () => {
    if (!editForm.projectId || !editForm.itemName || !editForm.initialQty) return alert('Fill required fields');
    try {
      await put(`/api/machinery/stock/${showEdit.id}`, {
        project_id: Number(editForm.projectId),
        machine_id: editForm.machineId ? Number(editForm.machineId) : null,
        item_name: editForm.itemName,
        category: editForm.category,
        unit: editForm.unit,
        initial_qty: Number(editForm.initialQty),
        min_qty: Number(editForm.minQty || 0)
      });
      showToast('success', 'Stock item updated successfully!');
      setShowEdit(null);
      onRefresh();
    } catch (err) {
      alert(err.message || 'Failed to update stock item');
    }
  };

  const deleteItem = async (id) => {
    if (!window.confirm("Are you sure you want to delete this stock item?")) return;
    try {
      await deleteAPICall(`/api/machinery/stock/${id}`);
      showToast('success', 'Stock item deleted successfully!');
      onRefresh();
    } catch (err) {
      alert(err.message || 'Failed to delete stock item');
    }
  };

  const submitUsage = async () => {
    const qty = Number(usageForm.qty);
    if (!qty || qty <= 0) return alert('Enter valid qty');
    if (qty > showUsage.currentQty) return alert('Insufficient stock');
    try {
      await postAPICall('/api/machinery/stock/use', {
        stock_item_id: showUsage.id,
        qty: qty,
        note: usageForm.note
      });
      showToast('success', 'Usage recorded successfully!');
      setShowUsage(null);
      setUsageForm({ qty:'', note:'' });
      onRefresh();
    } catch (err) {
      alert(err.message || 'Failed to record usage');
    }
  };

  const submitTransfer = async () => {
    const qty = Number(tfForm.qty);
    if (!qty || !tfForm.toProjectId) return alert('Fill all fields');
    if (qty > showTransfer.currentQty) return alert('Insufficient stock');
    try {
      await postAPICall('/api/machinery/stock/transfer', {
        stock_item_id: showTransfer.id,
        to_project_id: Number(tfForm.toProjectId),
        to_machine_id: tfForm.toMachineId ? Number(tfForm.toMachineId) : null,
        qty: qty,
        note: tfForm.note
      });
      showToast('success', 'Stock transferred successfully!');
      setShowTransfer(null);
      setTfForm({ toProjectId:'', toMachineId:'', qty:'', note:'' });
      onRefresh();
    } catch (err) {
      alert(err.message || 'Failed to transfer stock');
    }
  };

  const openHistory = async (item) => {
    setShowHistory(item);
    setHistoryLogs([]);
    setLoadingHistory(true);
    try {
      const res = await getAPICall(`/api/machinery/stock/${item.id}/history`);
      setHistoryLogs(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const proj = (id) => projects.find(p => p.id === id)?.name || id;
  const mach = (id) => machines.find(m => m.id === id)?.name || id;

  return (
    <div>
      <div style={{ display:'flex',gap:8,flexWrap:'wrap',marginBottom:20,alignItems:'center' }}>
        <select style={{ ...sel, width:170 }} value={filterProject} onChange={e=>setFilterProject(e.target.value)}>
          <option value="">All Projects</option>
          {projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select style={{ ...sel, width:150 }} value={filterCat} onChange={e=>setFilterCat(e.target.value)}>
          <option value="">All Categories</option>
          {cats.map(c=><option key={c} value={c}>{c}</option>)}
        </select>
        <div style={{ flex:1 }} />
        <button onClick={()=>setShowAdd(true)} style={{ padding:'8px 18px',background:'#0F172A',color:'#fff',border:'none',borderRadius:8,fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'inherit' }}>
          + Add Stock Item
        </button>
      </div>

      <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))',gap:10,marginBottom:20 }}>
        {[
          { label:'Total Items',    val: stockMaster.length,     color:'#2563EB' },
          { label:'Critical',       val: dashboardStats.criticalAlerts || 0, color:'#E24B4A' },
          { label:'Low Stock',      val: dashboardStats.lowStock || 0, color:'#BA7517' },
          { label:'Transfers',      val: dashboardStats.totalTransfers || 0, color:'#7C3AED' },
        ].map(s=>(
          <div key={s.label} style={{ background:'#F8FAFC',borderRadius:10,padding:'14px 16px',border:'1px solid #E2E8F0' }}>
            <div style={{ fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.4px',color:'#94A3B8' }}>{s.label}</div>
            <div style={{ fontSize:28,fontWeight:800,color:s.color,marginTop:4 }}>{s.val}</div>
          </div>
        ))}
      </div>

      <div style={{ background:'#fff',border:'1.5px solid #E2E8F0',borderRadius:12,overflow:'hidden' }}>
        <table style={{ width:'100%',borderCollapse:'collapse',fontSize:13 }}>
          <thead>
            <tr style={{ background:'#F8FAFC' }}>
              {['Item Name','Project','Machine','Category','Initial','Current','Min Qty','Status','Stock %','Actions'].map(h=>(
                <th key={h} style={{ padding:'10px 14px',textAlign:'left',fontWeight:700,fontSize:11,color:'#64748B',textTransform:'uppercase',letterSpacing:'0.4px',borderBottom:'1px solid #E2E8F0',whiteSpace:'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((s,i)=>{
              const st = stockStatus(s);
              const p  = pct(s.currentQty, s.initialQty);
              return (
                <tr key={s.id} style={{ borderBottom:'1px solid #F8FAFC', background: i%2===0?'#fff':'#FAFAFA' }}>
                  <td style={{ padding:'10px 14px',fontWeight:600,color:'#1E293B' }}>{s.itemName}</td>
                  <td style={{ padding:'10px 14px',color:'#475569' }}>{proj(s.projectId)}</td>
                  <td style={{ padding:'10px 14px',color:'#475569' }}>{mach(s.machineId)}</td>
                  <td style={{ padding:'10px 14px' }}><Badge label={s.category} color="#2563EB" bg="#EFF6FF" /></td>
                  <td style={{ padding:'10px 14px',color:'#475569' }}>{s.initialQty} {s.unit}</td>
                  <td style={{ padding:'10px 14px',fontWeight:700,color:'#0F172A' }}>{s.currentQty} {s.unit}</td>
                  <td style={{ padding:'10px 14px',color:'#94A3B8' }}>{s.minQty} {s.unit}</td>
                  <td style={{ padding:'10px 14px' }}><Badge label={st.label} color={st.color} bg={st.bg} /></td>
                  <td style={{ padding:'10px 14px',minWidth:100 }}>
                    <div style={{ fontSize:11,color:'#64748B',marginBottom:2 }}>{p}%</div>
                    <Bar pct={p} color={st.dot} />
                  </td>
                  <td style={{ padding:'10px 14px' }}>
                    <div style={{ display:'flex',gap:5,flexWrap:'wrap' }}>
                      <Btn small onClick={()=>{ setShowUsage(s); setUsageForm({qty:'',note:''}); }}>Use</Btn>
                      <Btn small gray onClick={()=>{ setShowTransfer(s); setTfForm({toProjectId:'',qty:'',note:''}); }}>Transfer</Btn>
                      <Btn small gray onClick={()=>openHistory(s)}>History</Btn>
                      <Btn small onClick={() => {
                        setShowEdit(s);
                        setEditForm({
                          projectId: s.projectId || '',
                          machineId: s.machineId || '',
                          itemName: s.itemName || '',
                          category: s.category || 'Consumable',
                          unit: s.unit || 'NOS',
                          initialQty: s.initialQty || '',
                          minQty: s.minQty || ''
                        });
                      }} style={{ background:'#3B82F6', color:'#fff' }}>Edit</Btn>
                      <Btn small onClick={() => deleteItem(s.id)} style={{ background:'#EF4444', color:'#fff' }}>Delete</Btn>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showHistory && (
        <Modal wide title={`Stock History ΓÇö ${showHistory.itemName}`} onClose={()=>setShowHistory(null)}>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%',borderCollapse:'collapse',fontSize:13 }}>
              <thead><tr style={{ background:'#F8FAFC' }}>
                {['Date','Type','Qty','Balance After','Note','By'].map(h=><th key={h} style={{ padding:'8px 12px',textAlign:'left',fontWeight:700,fontSize:11,color:'#64748B',textTransform:'uppercase',borderBottom:'1px solid #E2E8F0' }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {loadingHistory ? (
                  <tr><td colSpan={6} style={{ padding:20,textAlign:'center',color:'#94A3B8' }}>Loading history...</td></tr>
                ) : historyLogs.map(l=>(
                  <tr key={l.id} style={{ borderBottom:'1px solid #F8FAFC' }}>
                    <td style={{ padding:'8px 12px',color:'#475569' }}>{l.date}</td>
                    <td style={{ padding:'8px 12px' }}><Badge label={l.type} color={l.type==='usage'?'#E24B4A':l.type==='issued'?'#059669':'#2563EB'} bg={l.type==='usage'?'#FCEBEB':l.type==='issued'?'#ECFDF5':'#EFF6FF'} /></td>
                    <td style={{ padding:'8px 12px',fontWeight:700,color:'#0F172A' }}>{l.qty} {showHistory.unit}</td>
                    <td style={{ padding:'8px 12px',color:'#0F172A' }}>{l.balanceAfter} {showHistory.unit}</td>
                    <td style={{ padding:'8px 12px',color:'#64748B' }}>{fmt(l.note)}</td>
                    <td style={{ padding:'8px 12px',color:'#475569' }}>{l.by}</td>
                  </tr>
                ))}
                {!loadingHistory && historyLogs.length===0 && (
                  <tr><td colSpan={6} style={{ padding:20,textAlign:'center',color:'#94A3B8' }}>No history yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Modal>
      )}

      {showAdd && (
        <Modal title="Add New Stock Item" onClose={()=>setShowAdd(false)}>
          <FRow label="Project *">
            <select style={sel} value={addForm.projectId} onChange={e=>setAddForm({...addForm, projectId:e.target.value})}>
              <option value="">Select Project</option>
              {projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </FRow>
          <FRow label="Machine">
            <select style={sel} value={addForm.machineId} onChange={e=>setAddForm({...addForm, machineId:e.target.value})}>
              <option value="">Select Machine (optional)</option>
              {machines.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </FRow>
          <FRow label="Item Name *">
            <input type="text" placeholder="e.g. Engine Oil, Drilling Bit" style={inp} value={addForm.itemName} onChange={e=>setAddForm({...addForm, itemName:e.target.value})} />
          </FRow>
          <FRow label="Category *">
            <select style={sel} value={addForm.category} onChange={e=>setAddForm({...addForm, category:e.target.value})}>
              <option value="Consumable">Consumable</option>
              <option value="Spare">Spare</option>
              <option value="Tool">Tool</option>
              <option value="Lubricant">Lubricant</option>
            </select>
          </FRow>
          <FRow label="Unit *">
            <select style={sel} value={addForm.unit} onChange={e=>setAddForm({...addForm, unit:e.target.value})}>
              <option value="NOS">NOS</option>
              <option value="SET">SET</option>
              <option value="LTR">LTR</option>
              <option value="KG">KG</option>
              <option value="MTR">MTR</option>
            </select>
          </FRow>
          <FRow label="Initial Qty *">
            <input type="number" min="0" placeholder="e.g. 10" style={inp} value={addForm.initialQty} onChange={e=>setAddForm({...addForm, initialQty:e.target.value})} />
          </FRow>
          <FRow label="Min Qty (Low Alert Level)">
            <input type="number" min="0" placeholder="e.g. 2" style={inp} value={addForm.minQty} onChange={e=>setAddForm({...addForm, minQty:e.target.value})} />
          </FRow>
          <div style={{ display:'flex',justifyContent:'flex-end',gap:8,marginTop:20 }}>
            <Btn gray onClick={()=>setShowAdd(false)}>Cancel</Btn>
            <Btn onClick={submitAdd}>Save Item</Btn>
          </div>
        </Modal>
      )}

      {showEdit && (
        <Modal title="Edit Stock Item" onClose={()=>setShowEdit(null)}>
          <FRow label="Project *">
            <select style={sel} value={editForm.projectId} onChange={e=>setEditForm({...editForm, projectId:e.target.value})}>
              <option value="">Select Project</option>
              {projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </FRow>
          <FRow label="Machine">
            <select style={sel} value={editForm.machineId} onChange={e=>setEditForm({...editForm, machineId:e.target.value})}>
              <option value="">Select Machine (optional)</option>
              {machines.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </FRow>
          <FRow label="Item Name *">
            <input type="text" placeholder="e.g. Engine Oil, Drilling Bit" style={inp} value={editForm.itemName} onChange={e=>setEditForm({...editForm, itemName:e.target.value})} />
          </FRow>
          <FRow label="Category *">
            <select style={sel} value={editForm.category} onChange={e=>setEditForm({...editForm, category:e.target.value})}>
              <option value="Consumable">Consumable</option>
              <option value="Spare">Spare</option>
              <option value="Tool">Tool</option>
              <option value="Lubricant">Lubricant</option>
            </select>
          </FRow>
          <FRow label="Unit *">
            <select style={sel} value={editForm.unit} onChange={e=>setEditForm({...editForm, unit:e.target.value})}>
              <option value="NOS">NOS</option>
              <option value="SET">SET</option>
              <option value="LTR">LTR</option>
              <option value="KG">KG</option>
              <option value="MTR">MTR</option>
            </select>
          </FRow>
          <FRow label="Initial Qty *">
            <input type="number" min="0" placeholder="e.g. 10" style={inp} value={editForm.initialQty} onChange={e=>setEditForm({...editForm, initialQty:e.target.value})} />
          </FRow>
          <FRow label="Min Qty (Low Alert Level)">
            <input type="number" min="0" placeholder="e.g. 2" style={inp} value={editForm.minQty} onChange={e=>setEditForm({...editForm, minQty:e.target.value})} />
          </FRow>
          <div style={{ display:'flex',justifyContent:'flex-end',gap:8,marginTop:20 }}>
            <Btn gray onClick={()=>setShowEdit(null)}>Cancel</Btn>
            <Btn onClick={submitEdit}>Save Changes</Btn>
          </div>
        </Modal>
      )}

      {showUsage && (
        <Modal title={`Record Stock Usage — ${showUsage.itemName}`} onClose={()=>setShowUsage(null)}>
          <div style={{ background:'#F8FAFC',borderRadius:8,padding:'12px 14px',marginBottom:16,border:'1px solid #E2E8F0',fontSize:13 }}>
            <div>Current Balance: <strong>{showUsage.currentQty} {showUsage.unit}</strong></div>
            <div>Project: <strong>{proj(showUsage.projectId)}</strong></div>
          </div>
          <FRow label="Usage Qty *">
            <input type="number" min="0" max={showUsage.currentQty} placeholder="e.g. 2" style={inp} value={usageForm.qty} onChange={e=>setUsageForm({...usageForm, qty:e.target.value})} />
          </FRow>
          <FRow label="Remarks / Purpose">
            <textarea placeholder="e.g. Used for maintenance work" rows={3} style={{ ...inp, resize:'vertical' }} value={usageForm.note} onChange={e=>setUsageForm({...usageForm, note:e.target.value})} />
          </FRow>
          <div style={{ display:'flex',justifyContent:'flex-end',gap:8,marginTop:20 }}>
            <Btn gray onClick={()=>setShowUsage(null)}>Cancel</Btn>
            <Btn onClick={submitUsage}>Record Usage</Btn>
          </div>
        </Modal>
      )}

      {showTransfer && (
        <Modal title={`Transfer Stock — ${showTransfer.itemName}`} onClose={()=>setShowTransfer(null)}>
          <div style={{ background:'#F8FAFC',borderRadius:8,padding:'12px 14px',marginBottom:16,border:'1px solid #E2E8F0',fontSize:13 }}>
            <div>Available Qty: <strong>{showTransfer.currentQty} {showTransfer.unit}</strong></div>
            <div>From Project: <strong>{proj(showTransfer.projectId)}</strong></div>
          </div>
          <FRow label="Transfer To Project *">
            <select style={sel} value={tfForm.toProjectId} onChange={e=>setTfForm({...tfForm, toProjectId:e.target.value})}>
              <option value="">Select Project</option>
              {projects.filter(p=>p.id!==showTransfer.projectId).map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </FRow>
          <FRow label="Transfer To Machine">
            <select style={sel} value={tfForm.toMachineId} onChange={e=>setTfForm({...tfForm, toMachineId:e.target.value})}>
              <option value="">Select Machine (optional)</option>
              {machines.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </FRow>
          <FRow label="Transfer Qty *">
            <input type="number" min="0" max={showTransfer.currentQty} placeholder="e.g. 2" style={inp} value={tfForm.qty} onChange={e=>setTfForm({...tfForm, qty:e.target.value})} />
          </FRow>
          <FRow label="Reason / Notes">
            <textarea placeholder="Reason for transfer..." rows={3} style={{ ...inp, resize:'vertical' }} value={tfForm.note} onChange={e=>setTfForm({...tfForm, note:e.target.value})} />
          </FRow>
          <div style={{ display:'flex',justifyContent:'flex-end',gap:8,marginTop:20 }}>
            <Btn gray onClick={()=>setShowTransfer(null)}>Cancel</Btn>
            <Btn onClick={submitTransfer}>Confirm Transfer</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ╔══════════════════════════════════════════════════════════════════════════
   DAILY LOG TAB
   ╚══════════════════════════════════════════════════════════════════════════ */
function DailyLogTab({ state, onRefresh }) {
  const { dailyLogs, projects, machines, supervisors } = state;
  const { showToast } = useToast();
  
  const [filterDate,    setFilterDate]    = useState('');
  const [filterProject, setFilterProject] = useState('');
  const [showAdd,       setShowAdd]       = useState(false);
  const [showEdit,      setShowEdit]      = useState(null);
  const [form, setForm] = useState({ 
    projectId:'', 
    machineId:'', 
    supervisorId:'', 
    date:today(), 
    hoursWorked:'', 
    workDone:'', 
    remarks:'',
    hammer:'',
    capping:'',
    bit:'',
    used_bit:'',
    damage_part:'',
    tamplet:''
  });

  const [editForm, setEditForm] = useState({ 
    projectId:'', 
    machineId:'', 
    supervisorId:'', 
    date:today(), 
    hoursWorked:'', 
    workDone:'', 
    remarks:'',
    hammer:'',
    capping:'',
    bit:'',
    used_bit:'',
    damage_part:'',
    tamplet:''
  });

  const filtered = dailyLogs.filter(l =>
    (!filterDate    || l.date === filterDate) &&
    (!filterProject || l.projectId === Number(filterProject))
  ).sort((a,b)=>b.date.localeCompare(a.date));

  const submit = async () => {
    if (!form.projectId || !form.machineId || !form.hoursWorked) return alert('Fill required fields');
    try {
      await postAPICall('/api/machinery/daily-logs', {
        project_id: Number(form.projectId),
        machine_id: Number(form.machineId),
        supervisor_id: form.supervisorId ? Number(form.supervisorId) : null,
        date: form.date,
        hours_worked: Number(form.hoursWorked),
        work_done: form.workDone,
        remarks: form.remarks,
        hammer: form.hammer,
        capping: form.capping,
        bit: form.bit,
        used_bit: form.used_bit,
        damage_part: form.damage_part,
        tamplet: form.tamplet
      });
      showToast('success', 'Daily work log added successfully!');
      setShowAdd(false);
      setForm({ 
        projectId:'', 
        machineId:'', 
        supervisorId:'', 
        date:today(), 
        hoursWorked:'', 
        workDone:'', 
        remarks:'',
        hammer:'',
        capping:'',
        bit:'',
        used_bit:'',
        damage_part:'',
        tamplet:''
      });
      onRefresh();
    } catch (err) {
      alert(err.message || 'Failed to add daily log');
    }
  };

  const submitEdit = async () => {
    if (!editForm.projectId || !editForm.machineId || !editForm.hoursWorked) return alert('Fill required fields');
    try {
      await put(`/api/machinery/daily-logs/${showEdit.id}`, {
        project_id: Number(editForm.projectId),
        machine_id: Number(editForm.machineId),
        supervisor_id: editForm.supervisorId ? Number(editForm.supervisorId) : null,
        date: editForm.date,
        hours_worked: Number(editForm.hoursWorked),
        work_done: editForm.workDone,
        remarks: editForm.remarks,
        hammer: editForm.hammer,
        capping: editForm.capping,
        bit: editForm.bit,
        used_bit: editForm.used_bit,
        damage_part: editForm.damage_part,
        tamplet: editForm.tamplet
      });
      showToast('success', 'Daily work log updated successfully!');
      setShowEdit(null);
      onRefresh();
    } catch (err) {
      alert(err.message || 'Failed to update daily log');
    }
  };

  const deleteLog = async (id) => {
    if (!window.confirm("Are you sure you want to delete this work log?")) return;
    try {
      await deleteAPICall(`/api/machinery/daily-logs/${id}`);
      showToast('success', 'Daily log deleted successfully!');
      onRefresh();
    } catch (err) {
      alert(err.message || 'Failed to delete daily log');
    }
  };

  const proj = (id) => projects.find(p=>p.id===id)?.name    || id;
  const mach = (id) => machines.find(m=>m.id===id)?.name    || id;
  const sup  = (id) => supervisors.find(s=>s.id===id)?.name || '—';

  return (
    <div>
      <div style={{ display:'flex',gap:8,flexWrap:'wrap',marginBottom:20,alignItems:'center' }}>
        <input
          type="date"
          style={{ ...sel, width:150 }}
          value={filterDate}
          onChange={e=>setFilterDate(e.target.value)}
        />
        <select style={{ ...sel, width:170 }} value={filterProject} onChange={e=>setFilterProject(e.target.value)}>
          <option value="">All Projects</option>
          {projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <div style={{ flex:1 }} />
        <button onClick={()=>setShowAdd(true)} style={{ padding:'8px 18px',background:'#0F172A',color:'#fff',border:'none',borderRadius:8,fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'inherit' }}>
          + Add Work Log
        </button>
      </div>

      <div style={{ background:'#fff',border:'1.5px solid #E2E8F0',borderRadius:12,overflowX:'auto' }}>
        <table style={{ width:'100%',borderCollapse:'collapse',fontSize:13 }}>
          <thead>
            <tr style={{ background:'#F8FAFC' }}>
              {['Date','Project','Machine','Supervisor','Hours Worked','Hammer','Capping','Bit','Used Bit','Damage Part','Tamplet','Work Details','Remarks','Actions'].map(h=>(
                <th key={h} style={{ padding:'10px 14px',textAlign:'left',fontWeight:700,fontSize:11,color:'#64748B',textTransform:'uppercase',letterSpacing:'0.4px',borderBottom:'1px solid #E2E8F0',whiteSpace:'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((l,i)=>(
              <tr key={l.id} style={{ borderBottom:'1px solid #F8FAFC', background: i%2===0?'#fff':'#FAFAFA' }}>
                <td style={{ padding:'10px 14px',color:'#475569',whiteSpace:'nowrap' }}>{l.date}</td>
                <td style={{ padding:'10px 14px',fontWeight:600,color:'#1E293B',whiteSpace:'nowrap' }}>{proj(l.projectId)}</td>
                <td style={{ padding:'10px 14px',color:'#475569',whiteSpace:'nowrap' }}>{mach(l.machineId)}</td>
                <td style={{ padding:'10px 14px',whiteSpace:'nowrap' }}><Badge label={sup(l.supervisorId)} color="#7C3AED" bg="#F3E8FF" /></td>
                <td style={{ padding:'10px 14px',fontWeight:700,color:'#059669',whiteSpace:'nowrap' }}>{l.hoursWorked} hrs</td>
                <td style={{ padding:'10px 14px',color:'#475569' }}>{fmt(l.hammer)}</td>
                <td style={{ padding:'10px 14px',color:'#475569' }}>{fmt(l.capping)}</td>
                <td style={{ padding:'10px 14px',color:'#475569' }}>{fmt(l.bit)}</td>
                <td style={{ padding:'10px 14px',color:'#475569' }}>{fmt(l.used_bit)}</td>
                <td style={{ padding:'10px 14px',color:'#475569' }}>{fmt(l.damage_part)}</td>
                <td style={{ padding:'10px 14px',color:'#475569' }}>{fmt(l.tamplet)}</td>
                <td style={{ padding:'10px 14px',color:'#475569' }}>{fmt(l.workDone)}</td>
                <td style={{ padding:'10px 14px',color:'#64748B' }}>{fmt(l.remarks)}</td>
                <td style={{ padding:'10px 14px' }}>
                  <div style={{ display:'flex',gap:5 }}>
                    <Btn small onClick={() => {
                      setShowEdit(l);
                      setEditForm({
                        projectId: l.projectId || '',
                        machineId: l.machineId || '',
                        supervisorId: l.supervisorId || '',
                        date: l.date || today(),
                        hoursWorked: l.hoursWorked || '',
                        workDone: l.workDone || '',
                        remarks: l.remarks || '',
                        hammer: l.hammer || '',
                        capping: l.capping || '',
                        bit: l.bit || '',
                        used_bit: l.used_bit || '',
                        damage_part: l.damage_part || '',
                        tamplet: l.tamplet || ''
                      });
                    }} style={{ background:'#3B82F6', color:'#fff' }}>Edit</Btn>
                    <Btn small onClick={() => deleteLog(l.id)} style={{ background:'#EF4444', color:'#fff' }}>Delete</Btn>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={14} style={{ padding:24,textAlign:'center',color:'#94A3B8' }}>No daily logs found matching the criteria.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <Modal title="Add Daily Work Log" onClose={()=>setShowAdd(false)}>
          <FRow label="Project *">
            <select style={sel} value={form.projectId} onChange={e=>setForm({...form, projectId:e.target.value})}>
              <option value="">Select Project</option>
              {projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </FRow>
          <FRow label="Machine *">
            <select style={sel} value={form.machineId} onChange={e=>setForm({...form, machineId:e.target.value})}>
              <option value="">Select Machine</option>
              {machines.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </FRow>
          <FRow label="Supervisor">
            <select style={sel} value={form.supervisorId} onChange={e=>setForm({...form, supervisorId:e.target.value})}>
              <option value="">Select Supervisor</option>
              {supervisors.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </FRow>
          <FRow label="Date *">
            <input type="date" style={inp} value={form.date} onChange={e=>setForm({...form, date:e.target.value})} />
          </FRow>
          <FRow label="Hours Worked *">
            <input type="number" min="0" max="24" step="0.5" placeholder="e.g. 8" style={inp} value={form.hoursWorked} onChange={e=>setForm({...form, hoursWorked:e.target.value})} />
          </FRow>
          
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:14 }}>
            <FRow label="Hammer">
              <input type="text" placeholder="e.g. 6 inch" style={inp} value={form.hammer} onChange={e=>setForm({...form, hammer:e.target.value})} />
            </FRow>
            <FRow label="Capping">
              <input type="text" placeholder="e.g. Yes" style={inp} value={form.capping} onChange={e=>setForm({...form, capping:e.target.value})} />
            </FRow>
            <FRow label="Bit">
              <input type="text" placeholder="e.g. Button Bit" style={inp} value={form.bit} onChange={e=>setForm({...form, bit:e.target.value})} />
            </FRow>
            <FRow label="Used Bit">
              <input type="text" placeholder="e.g. 1" style={inp} value={form.used_bit} onChange={e=>setForm({...form, used_bit:e.target.value})} />
            </FRow>
            <FRow label="Damage Part">
              <input type="text" placeholder="e.g. Hose Pipe" style={inp} value={form.damage_part} onChange={e=>setForm({...form, damage_part:e.target.value})} />
            </FRow>
            <FRow label="Tamplet">
              <input type="text" placeholder="e.g. Pattern A" style={inp} value={form.tamplet} onChange={e=>setForm({...form, tamplet:e.target.value})} />
            </FRow>
          </div>

          <FRow label="Work Details">
            <input type="text" placeholder="e.g. Drilling 50 meters, extra details" style={inp} value={form.workDone} onChange={e=>setForm({...form, workDone:e.target.value})} />
          </FRow>
          <FRow label="Remarks">
            <textarea placeholder="Any additional notes..." rows={3} style={{ ...inp, resize:'vertical' }} value={form.remarks} onChange={e=>setForm({...form, remarks:e.target.value})} />
          </FRow>
          <div style={{ display:'flex',justifyContent:'flex-end',gap:8,marginTop:20 }}>
            <Btn gray onClick={()=>setShowAdd(false)}>Cancel</Btn>
            <Btn onClick={submit}>Save Daily Log</Btn>
          </div>
        </Modal>
      )}

      {showEdit && (
        <Modal title="Edit Daily Work Log" onClose={()=>setShowEdit(null)}>
          <FRow label="Project *">
            <select style={sel} value={editForm.projectId} onChange={e=>setEditForm({...editForm, projectId:e.target.value})}>
              <option value="">Select Project</option>
              {projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </FRow>
          <FRow label="Machine *">
            <select style={sel} value={editForm.machineId} onChange={e=>setEditForm({...editForm, machineId:e.target.value})}>
              <option value="">Select Machine</option>
              {machines.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </FRow>
          <FRow label="Supervisor">
            <select style={sel} value={editForm.supervisorId} onChange={e=>setEditForm({...editForm, supervisorId:e.target.value})}>
              <option value="">Select Supervisor</option>
              {supervisors.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </FRow>
          <FRow label="Date *">
            <input type="date" style={inp} value={editForm.date} onChange={e=>setEditForm({...editForm, date:e.target.value})} />
          </FRow>
          <FRow label="Hours Worked *">
            <input type="number" min="0" max="24" step="0.5" placeholder="e.g. 8" style={inp} value={editForm.hoursWorked} onChange={e=>setEditForm({...editForm, hoursWorked:e.target.value})} />
          </FRow>
          
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:14 }}>
            <FRow label="Hammer">
              <input type="text" placeholder="e.g. 6 inch" style={inp} value={editForm.hammer} onChange={e=>setEditForm({...editForm, hammer:e.target.value})} />
            </FRow>
            <FRow label="Capping">
              <input type="text" placeholder="e.g. Yes" style={inp} value={editForm.capping} onChange={e=>setEditForm({...editForm, capping:e.target.value})} />
            </FRow>
            <FRow label="Bit">
              <input type="text" placeholder="e.g. Button Bit" style={inp} value={editForm.bit} onChange={e=>setEditForm({...editForm, bit:e.target.value})} />
            </FRow>
            <FRow label="Used Bit">
              <input type="text" placeholder="e.g. 1" style={inp} value={editForm.used_bit} onChange={e=>setEditForm({...editForm, used_bit:e.target.value})} />
            </FRow>
            <FRow label="Damage Part">
              <input type="text" placeholder="e.g. Hose Pipe" style={inp} value={editForm.damage_part} onChange={e=>setEditForm({...editForm, damage_part:e.target.value})} />
            </FRow>
            <FRow label="Tamplet">
              <input type="text" placeholder="e.g. Pattern A" style={inp} value={editForm.tamplet} onChange={e=>setEditForm({...editForm, tamplet:e.target.value})} />
            </FRow>
          </div>

          <FRow label="Work Details">
            <input type="text" placeholder="e.g. Drilling 50 meters, extra details" style={inp} value={editForm.workDone} onChange={e=>setEditForm({...editForm, workDone:e.target.value})} />
          </FRow>
          <FRow label="Remarks">
            <textarea placeholder="Any additional notes..." rows={3} style={{ ...inp, resize:'vertical' }} value={editForm.remarks} onChange={e=>setEditForm({...editForm, remarks:e.target.value})} />
          </FRow>
          <div style={{ display:'flex',justifyContent:'flex-end',gap:8,marginTop:20 }}>
            <Btn gray onClick={()=>setShowEdit(null)}>Cancel</Btn>
            <Btn onClick={submitEdit}>Save Changes</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ╔══════════════════════════════════════════════════════════════════════════
   MAINTENANCE TAB
   ╚══════════════════════════════════════════════════════════════════════════ */
function MaintenanceTab({ state, onRefresh }) {
  const { maintenanceLogs, machines, projects } = state;
  const { showToast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(null);
  const [form, setForm] = useState({ machineId:'', projectId:'', date:today(), type:'Preventive', desc:'', cost:'', nextDue:'', by:'' });
  const [editForm, setEditForm] = useState({ machineId:'', projectId:'', date:today(), type:'Preventive', desc:'', cost:'', nextDue:'', by:'' });
  const [filterMachine, setFilterMachine] = useState('');

  const submit = async () => {
    if (!form.machineId || !form.desc) return alert('Fill required fields');
    try {
      await postAPICall('/api/machinery/maintenance', {
        machine_id: Number(form.machineId),
        project_id: form.projectId ? Number(form.projectId) : null,
        date: form.date,
        type: form.type,
        desc: form.desc,
        cost: Number(form.cost || 0),
        next_due: form.nextDue || null,
        by: form.by || null
      });
      showToast('success', 'Maintenance record added successfully!');
      setShowAdd(false);
      setForm({ machineId:'', projectId:'', date:today(), type:'Preventive', desc:'', cost:'', nextDue:'', by:'' });
      onRefresh();
    } catch (err) {
      alert(err.message || 'Failed to add maintenance record');
    }
  };

  const submitEdit = async () => {
    if (!editForm.machineId || !editForm.desc) return alert('Fill required fields');
    try {
      await put(`/api/machinery/maintenance/${showEdit.id}`, {
        machine_id: Number(editForm.machineId),
        project_id: editForm.projectId ? Number(editForm.projectId) : null,
        date: editForm.date,
        type: editForm.type,
        desc: editForm.desc,
        cost: Number(editForm.cost || 0),
        next_due: editForm.nextDue || null,
        by: editForm.by || null
      });
      showToast('success', 'Maintenance record updated successfully!');
      setShowEdit(null);
      onRefresh();
    } catch (err) {
      alert(err.message || 'Failed to update maintenance record');
    }
  };

  const deleteRecord = async (id) => {
    if (!window.confirm("Are you sure you want to delete this maintenance record?")) return;
    try {
      await deleteAPICall(`/api/machinery/maintenance/${id}`);
      showToast('success', 'Maintenance record deleted successfully!');
      onRefresh();
    } catch (err) {
      alert(err.message || 'Failed to delete record');
    }
  };

  const mach = (id) => machines.find(m=>m.id===id)?.name  || id;
  const proj = (id) => projects.find(p=>p.id===id)?.name  || id;

  const filtered = maintenanceLogs.filter(l =>
    !filterMachine || l.machineId === Number(filterMachine)
  );

  return (
    <div>
      <div style={{ display:'flex',gap:8,flexWrap:'wrap',marginBottom:20,alignItems:'center' }}>
        <select style={{ ...sel, width:180 }} value={filterMachine} onChange={e=>setFilterMachine(e.target.value)}>
          <option value="">All Machines</option>
          {machines.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
        <div style={{ flex:1 }} />
        <button onClick={()=>setShowAdd(true)} style={{ padding:'8px 18px',background:'#0F172A',color:'#fff',border:'none',borderRadius:8,fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'inherit' }}>
          + Add Maintenance Record
        </button>
      </div>

      <div style={{ background:'#fff',border:'1.5px solid #E2E8F0',borderRadius:12,overflow:'hidden' }}>
        <table style={{ width:'100%',borderCollapse:'collapse',fontSize:13 }}>
          <thead>
            <tr style={{ background:'#F8FAFC' }}>
              {['Date','Machine','Project','Type','Description / Remarks','Cost','Next Due','Serviced By','Actions'].map(h=>(
                <th key={h} style={{ padding:'10px 14px',textAlign:'left',fontWeight:700,fontSize:11,color:'#64748B',textTransform:'uppercase',letterSpacing:'0.4px',borderBottom:'1px solid #E2E8F0',whiteSpace:'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((l,i)=>{
              const isBreakdown = l.type === 'Breakdown' || l.type === 'Emergency';
              return (
                <tr key={l.id} style={{ borderBottom:'1px solid #F8FAFC', background: i%2===0?'#fff':'#FAFAFA' }}>
                  <td style={{ padding:'10px 14px',color:'#475569',whiteSpace:'nowrap' }}>{l.date}</td>
                  <td style={{ padding:'10px 14px',fontWeight:600,color:'#1E293B' }}>{mach(l.machineId)}</td>
                  <td style={{ padding:'10px 14px',color:'#475569' }}>{proj(l.projectId)}</td>
                  <td style={{ padding:'10px 14px' }}>
                    <Badge
                      label={l.type}
                      color={isBreakdown ? '#E24B4A' : '#059669'}
                      bg={isBreakdown ? '#FCEBEB' : '#ECFDF5'}
                    />
                  </td>
                  <td style={{ padding:'10px 14px',color:'#475569' }}>{l.desc}</td>
                  <td style={{ padding:'10px 14px',fontWeight:700,color:'#0F172A' }}>{l.cost ? money(l.cost) : '—'}</td>
                  <td style={{ padding:'10px 14px',color:'#BA7517',fontWeight:600 }}>{fmt(l.nextDue)}</td>
                  <td style={{ padding:'10px 14px',color:'#475569' }}>{fmt(l.by)}</td>
                  <td style={{ padding:'10px 14px' }}>
                    <div style={{ display:'flex',gap:5 }}>
                      <Btn small onClick={() => {
                        setShowEdit(l);
                        setEditForm({
                          machineId: l.machineId || '',
                          projectId: l.projectId || '',
                          date: l.date || today(),
                          type: l.type || 'Preventive',
                          desc: l.desc || '',
                          cost: l.cost || '',
                          nextDue: l.nextDue || '',
                          by: l.by || ''
                        });
                      }} style={{ background:'#3B82F6', color:'#fff' }}>Edit</Btn>
                      <Btn small onClick={() => deleteRecord(l.id)} style={{ background:'#EF4444', color:'#fff' }}>Delete</Btn>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} style={{ padding:24,textAlign:'center',color:'#94A3B8' }}>No maintenance records found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <Modal title="Add Maintenance Record" onClose={()=>setShowAdd(false)}>
          <FRow label="Machine *">
            <select style={sel} value={form.machineId} onChange={e=>setForm({...form, machineId:e.target.value})}>
              <option value="">Select Machine</option>
              {machines.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </FRow>
          <FRow label="Project">
            <select style={sel} value={form.projectId} onChange={e=>setForm({...form, projectId:e.target.value})}>
              <option value="">Select Project (optional)</option>
              {projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </FRow>
          <FRow label="Date *">
            <input type="date" style={inp} value={form.date} onChange={e=>setForm({...form, date:e.target.value})} />
          </FRow>
          <FRow label="Type *">
            <select style={sel} value={form.type} onChange={e=>setForm({...form, type:e.target.value})}>
              <option value="Preventive">Preventive</option>
              <option value="Breakdown">Breakdown</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Emergency">Emergency</option>
            </select>
          </FRow>
          <FRow label="Description / Remarks *">
            <input type="text" placeholder="e.g. Changed engine oil, replaced hydraulic seal" style={inp} value={form.desc} onChange={e=>setForm({...form, desc:e.target.value})} />
          </FRow>
          <FRow label="Cost (₹)">
            <input type="number" min="0" placeholder="e.g. 4500" style={inp} value={form.cost} onChange={e=>setForm({...form, cost:e.target.value})} />
          </FRow>
          <FRow label="Next Due Date">
            <input type="date" style={inp} value={form.nextDue} onChange={e=>setForm({...form, nextDue:e.target.value})} />
          </FRow>
          <FRow label="Serviced By">
            <input type="text" placeholder="e.g. Mechanic Sharma / Self" style={inp} value={form.by} onChange={e=>setForm({...form, by:e.target.value})} />
          </FRow>
          <div style={{ display:'flex',justifyContent:'flex-end',gap:8,marginTop:20 }}>
            <Btn gray onClick={()=>setShowAdd(false)}>Cancel</Btn>
            <Btn onClick={submit}>Save Record</Btn>
          </div>
        </Modal>
      )}

      {showEdit && (
        <Modal title="Edit Maintenance Record" onClose={()=>setShowEdit(null)}>
          <FRow label="Machine *">
            <select style={sel} value={editForm.machineId} onChange={e=>setEditForm({...editForm, machineId:e.target.value})}>
              <option value="">Select Machine</option>
              {machines.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </FRow>
          <FRow label="Project">
            <select style={sel} value={editForm.projectId} onChange={e=>setEditForm({...editForm, projectId:e.target.value})}>
              <option value="">Select Project (optional)</option>
              {projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </FRow>
          <FRow label="Date *">
            <input type="date" style={inp} value={editForm.date} onChange={e=>setEditForm({...editForm, date:e.target.value})} />
          </FRow>
          <FRow label="Type *">
            <select style={sel} value={editForm.type} onChange={e=>setEditForm({...editForm, type:e.target.value})}>
              <option value="Preventive">Preventive</option>
              <option value="Breakdown">Breakdown</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Emergency">Emergency</option>
            </select>
          </FRow>
          <FRow label="Description / Remarks *">
            <input type="text" placeholder="e.g. Changed engine oil, replaced hydraulic seal" style={inp} value={editForm.desc} onChange={e=>setEditForm({...editForm, desc:e.target.value})} />
          </FRow>
          <FRow label="Cost (₹)">
            <input type="number" min="0" placeholder="e.g. 4500" style={inp} value={editForm.cost} onChange={e=>setEditForm({...editForm, cost:e.target.value})} />
          </FRow>
          <FRow label="Next Due Date">
            <input type="date" style={inp} value={editForm.nextDue} onChange={e=>setEditForm({...editForm, nextDue:e.target.value})} />
          </FRow>
          <FRow label="Serviced By">
            <input type="text" placeholder="e.g. Mechanic Sharma / Self" style={inp} value={editForm.by} onChange={e=>setEditForm({...editForm, by:e.target.value})} />
          </FRow>
          <div style={{ display:'flex',justifyContent:'flex-end',gap:8,marginTop:20 }}>
            <Btn gray onClick={()=>setShowEdit(null)}>Cancel</Btn>
            <Btn onClick={submitEdit}>Save Changes</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ╔══════════════════════════════════════════════════════════════════════════
   MASTERS TAB
   ╚══════════════════════════════════════════════════════════════════════════ */
function MastersTab({ state, onRefresh }) {
  const { projects, machines, supervisors } = state;
  const { showToast } = useToast();
  const [tab, setTab] = useState('projects');
  
  const [pForm,  setPForm]  = useState({ name:'' });
  const [mForm,  setMForm]  = useState({ name:'', type:'' });
  const [sForm,  setSForm]  = useState({ name:'' });

  return (
    <div>
      <div style={{ display:'flex',gap:6,marginBottom:20,borderBottom:'1px solid #E2E8F0',paddingBottom:10 }}>
        {['projects','machines','supervisors'].map(t=>(
          <button
            key={t}
            onClick={()=>setTab(t)}
            style={{
              padding:'6px 14px',borderRadius:6,border:'none',
              background: tab===t ? '#0F172A' : 'transparent',
              color: tab===t ? '#fff' : '#64748B',
              fontWeight: 700, fontSize:12, cursor:'pointer',
              textTransform:'capitalize'
            }}
          >
            {t}
          </button>
        ))}
      </div>
      {tab==='projects' && (
        <MasterSection
          title="Projects" items={projects} fields={[['name','Project Name','text']]}
          form={pForm} setForm={setPForm}
          onAdd={async ()=>{
            if(!pForm.name) return alert('Enter name');
            try {
              await postAPICall('/api/storeManually', { project_name: pForm.name });
              showToast('success', 'Project added successfully!');
              setPForm({name:''});
              onRefresh();
            } catch (err) {
              alert(err.message || 'Failed to add project');
            }
          }}
          renderRow={p=><><td style={td}>{p.name}</td></>}
          headers={['Project Name']}
        />
      )}
      {tab==='machines' && (
        <MasterSection
          title="Machines" items={machines} fields={[['name','Machine Name','text'],['type','Machine Type','text']]}
          form={mForm} setForm={setMForm}
          onAdd={async ()=>{
            if(!mForm.name) return alert('Enter name');
            try {
              await postAPICall('/api/machineries', { 
                machine_name: mForm.name, 
                machine_type: mForm.type || 'Standard', 
                reg_number: 'REG-' + Date.now(), 
                ownership_type: 'Owned' 
              });
              showToast('success', 'Machine added successfully!');
              setMForm({name:'',type:''});
              onRefresh();
            } catch (err) {
              alert(err.message || 'Failed to add machine');
            }
          }}
          renderRow={m=><><td style={td}>{m.name}</td><td style={td}><Badge label={m.type||'—'} color="#2563EB" bg="#EFF6FF" /></td></>}
          headers={['Machine Name','Type']}
        />
      )}
      {tab==='supervisors' && (
        <MasterSection
          title="Supervisors" items={supervisors} fields={[['name','Supervisor Name','text']]}
          form={sForm} setForm={setSForm}
          onAdd={async ()=>{
            if(!sForm.name) return alert('Enter name');
            try {
              await postAPICall('/api/operators', { 
                name: sForm.name, 
                type: 'Supervisor', 
                contact_number: '0000000000', 
                alternate_number: '0000000000', 
                bank_details: '' 
              });
              showToast('success', 'Supervisor added successfully!');
              setSForm({name:''});
              onRefresh();
            } catch (err) {
              alert(err.message || 'Failed to add supervisor');
            }
          }}
          renderRow={s=><><td style={td}>{s.name}</td></>}
          headers={['Supervisor Name']}
        />
      )}
    </div>
  );
}

function MasterSection({ title, items, fields, form, setForm, onAdd, renderRow, headers }) {
  return (
    <div style={{ display:'grid',gridTemplateColumns:'300px 1fr',gap:24,alignItems:'start' }}>
      <div style={{ background:'#fff',border:'1.5px solid #E2E8F0',borderRadius:12,padding:'20px 22px' }}>
        <h3 style={{ margin:'0 0 16px',fontSize:15,fontWeight:800,color:'#0F172A',letterSpacing:'-0.2px' }}>Add New {title.slice(0, -1)}</h3>
        {fields.map(([key, label, type]) => (
          <FRow key={key} label={label}>
            <input type={type} style={inp} value={form[key] || ''} onChange={e=>setForm({...form, [key]:e.target.value})} />
          </FRow>
        ))}
        <div style={{ marginTop:18 }}>
          <button onClick={onAdd} style={{ width:'100%',padding:'10px 18px',background:'#0F172A',color:'#fff',border:'none',borderRadius:8,fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'inherit' }}>
            Add {title.slice(0, -1)}
          </button>
        </div>
      </div>

      <div style={{ background:'#fff',border:'1.5px solid #E2E8F0',borderRadius:12,overflow:'hidden' }}>
        <table style={{ width:'100%',borderCollapse:'collapse',fontSize:13 }}>
          <thead>
            <tr style={{ background:'#F8FAFC' }}>
              {headers.map(h=>(
                <th key={h} style={{ padding:'10px 14px',textAlign:'left',fontWeight:700,fontSize:11,color:'#64748B',textTransform:'uppercase',letterSpacing:'0.4px',borderBottom:'1px solid #E2E8F0' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={item.id || i} style={{ borderBottom:'1px solid #F8FAFC', background: i%2===0?'#fff':'#FAFAFA' }}>
                {renderRow(item)}
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={headers.length} style={{ padding:24,textAlign:'center',color:'#94A3B8' }}>No {title.toLowerCase()} configured yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ
   TRANSFER LOG TAB
ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ */
function TransferLogTab({ state, onRefresh }) {
  const { transferLogs, stockMaster, projects } = state;
  const { showToast } = useToast();
  const [showEdit, setShowEdit] = useState(null);
  const [editForm, setEditForm] = useState({ qty: '', note: '' });

  const proj  = (id) => projects.find(p=>p.id===id)?.name || id;
  const item  = (id) => stockMaster.find(s=>s.id===id)?.itemName || id;
  const unit  = (id) => stockMaster.find(s=>s.id===id)?.unit || '';

  const submitEdit = async () => {
    const qty = Number(editForm.qty);
    if (!qty || qty <= 0) return alert('Enter valid quantity');
    try {
      await put(`/api/machinery/transfers/${showEdit.id}`, {
        qty: qty,
        note: editForm.note
      });
      showToast('success', 'Transfer record updated successfully!');
      setShowEdit(null);
      onRefresh();
    } catch (err) {
      alert(err.message || 'Failed to update transfer log');
    }
  };

  const deleteTransfer = async (id) => {
    if (!window.confirm("Are you sure you want to delete this transfer record?")) return;
    try {
      await deleteAPICall(`/api/machinery/transfers/${id}`);
      showToast('success', 'Transfer record deleted successfully!');
      onRefresh();
    } catch (err) {
      alert(err.message || 'Failed to delete transfer record');
    }
  };

  return (
    <div>
        <table style={{ width:'100%',borderCollapse:'collapse',fontSize:13 }}>
          <thead><tr style={{ background:'#F8FAFC' }}>
            {['Date','Item','Qty','From','To','Note','By','Actions'].map(h=>(
              <th key={h} style={{ padding:'10px 14px',textAlign:'left',fontWeight:700,fontSize:11,color:'#64748B',textTransform:'uppercase',letterSpacing:'0.4px',borderBottom:'1px solid #E2E8F0' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {[...transferLogs].map((log,i)=>(
              <tr key={log.id} style={{ background:i%2===0?'#fff':'#FAFAFA',borderBottom:'1px solid #F8FAFC' }}>
                <td style={{ padding:'10px 14px',color:'#475569' }}>{log.date}</td>
                <td style={{ padding:'10px 14px',fontWeight:600,color:'#0F172A' }}>{item(log.stockId)}</td>
                <td style={{ padding:'10px 14px',fontWeight:700,color:'#7C3AED' }}>{log.qty} {unit(log.stockId)}</td>
                <td style={{ padding:'10px 14px' }}><Badge label={proj(log.fromProjectId)} color="#E24B4A" bg="#FCEBEB" /></td>
                <td style={{ padding:'10px 14px' }}><Badge label={proj(log.toProjectId)}   color="#059669" bg="#ECFDF5" /></td>
                <td style={{ padding:'10px 14px',color:'#64748B' }}>{fmt(log.note)}</td>
                <td style={{ padding:'10px 14px',color:'#475569' }}>{log.by}</td>
                <td style={{ padding:'10px 14px' }}>
                  <div style={{ display:'flex',gap:5 }}>
                    <Btn small onClick={() => {
                      setShowEdit(log);
                      setEditForm({
                        qty: log.qty || '',
                        note: log.note || ''
                      });
                    }} style={{ background:'#3B82F6', color:'#fff' }}>Edit</Btn>
                    <Btn small onClick={() => deleteTransfer(log.id)} style={{ background:'#EF4444', color:'#fff' }}>Delete</Btn>
                  </div>
                </td>
              </tr>
            ))}
            {transferLogs.length === 0 && (
              <tr>
                <td colSpan={8} style={{ padding:24,textAlign:'center',color:'#94A3B8' }}>No stock transfers recorded.</td>
              </tr>
            )}
          </tbody>
        </table>

        {showEdit && (
          <Modal title={`Edit Stock Transfer — ${item(showEdit.stockId)}`} onClose={()=>setShowEdit(null)}>
            <div style={{ background:'#F8FAFC',borderRadius:8,padding:'12px 14px',marginBottom:16,border:'1px solid #E2E8F0',fontSize:13 }}>
              <div>From Project: <strong>{proj(showEdit.fromProjectId)}</strong></div>
              <div>To Project: <strong>{proj(showEdit.toProjectId)}</strong></div>
            </div>
            <FRow label={`Transfer Qty (${unit(showEdit.stockId)}) *`}>
              <input type="number" min="0.01" step="any" placeholder="e.g. 2" style={inp} value={editForm.qty} onChange={e=>setEditForm({...editForm, qty:e.target.value})} />
            </FRow>
            <FRow label="Reason / Notes">
              <textarea placeholder="Reason for transfer..." rows={3} style={{ ...inp, resize:'vertical' }} value={editForm.note} onChange={e=>setEditForm({...editForm, note:e.target.value})} />
            </FRow>
            <div style={{ display:'flex',justifyContent:'flex-end',gap:8,marginTop:20 }}>
              <Btn gray onClick={()=>setShowEdit(null)}>Cancel</Btn>
              <Btn onClick={submitEdit}>Save Changes</Btn>
            </div>
          </Modal>
        )}
    </div>
  );
}

/* ΓöÇΓöÇΓöÇ shared components ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */
const td = { padding:'10px 14px',color:'#475569',borderBottom:'1px solid #F8FAFC',fontSize:13 };

function Btn({ children, onClick, gray, small }) {
  return (
    <button onClick={onClick} style={{
      padding: small ? '5px 12px' : '8px 18px',
      background: gray ? '#F8FAFC' : '#0F172A',
      color: gray ? '#475569' : '#fff',
      border: gray ? '1.5px solid #E2E8F0' : 'none',
      borderRadius: 8, fontSize: small ? 12 : 13,
      fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace:'nowrap',
    }}>
      {children}
    </button>
  );
}

function InfoChip({ label, val, warn }) {
  return (
    <div style={{ fontSize:12 }}>
      <span style={{ color:'#94A3B8',fontWeight:600 }}>{label}: </span>
      <span style={{ color: warn ? '#E24B4A' : '#1E293B', fontWeight:600 }}>{val}</span>
    </div>
  );
}

/* ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ
   DASHBOARD / OVERVIEW
ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ */
function Dashboard({ state }) {
  const { stockMaster, dailyLogs, dashboardStats, machines, projects } = state;
  const proj = (id) => projects.find(p=>p.id===id)?.name || id;
  const mach = (id) => machines.find(m=>m.id===id)?.name || id;

  const lowStockItems = stockMaster.filter(s => s.currentQty <= s.minQty);
  const recentLogs = [...dailyLogs].sort((a,b)=>b.date.localeCompare(a.date)).slice(0, 5);

  return (
    <div>
      <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:16,marginBottom:28 }}>
        {[
          { label:'Stock Items',      val: dashboardStats.stockItems || 0, color:'#2563EB', sub:'in inventory'       },
          { label:'Critical Alerts',  val: dashboardStats.criticalAlerts || 0,    color:'#E24B4A', sub:'need restock'       },
          { label:'Today\'s Logs',    val: dashboardStats.todayLogs || 0,   color:'#059669', sub:'work entries today' },
          { label:'Hours Today',      val: `${dashboardStats.hoursToday || 0}h`, color:'#7C3AED', sub:'machine hours'     },
          { label:'Low Stock Items',  val: dashboardStats.lowStock || 0,    color:'#BA7517', sub:'nearing minimum'      },
          { label:'Total Transfers',  val: dashboardStats.totalTransfers || 0, color:'#0891B2', sub:'stock movements'   },
        ].map(k=>(
          <div key={k.label} style={{ background:'#fff',border:'1.5px solid #E2E8F0',borderRadius:12,padding:'18px 20px',boxShadow:'0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.4px',color:'#94A3B8' }}>{k.label}</div>
            <div style={{ fontSize:32,fontWeight:800,color:k.color,lineHeight:1,margin:'8px 0 4px',letterSpacing:'-0.5px' }}>{k.val}</div>
            <div style={{ fontSize:12,color:'#64748B',fontWeight:500 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:24,alignItems:'start' }}>
        {/* RECENT ACTIVITY LOGS CARD */}
        <div style={{ background:'#fff',border:'1.5px solid #E2E8F0',borderRadius:14,padding:'22px 24px' }}>
          <h3 style={{ margin:'0 0 16px',fontSize:15,fontWeight:800,color:'#0F172A',letterSpacing:'-0.2px' }}>Recent Work Logs</h3>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%',borderCollapse:'collapse',fontSize:13 }}>
              <thead>
                <tr style={{ background:'#F8FAFC' }}>
                  {['Date','Project','Machine','Hours'].map(h=>(
                    <th key={h} style={{ padding:'10px 14px',textAlign:'left',fontWeight:700,fontSize:11,color:'#64748B',textTransform:'uppercase',borderBottom:'1px solid #E2E8F0' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentLogs.map((l,i)=>(
                  <tr key={l.id} style={{ borderBottom:'1px solid #F8FAFC' }}>
                    <td style={{ padding:'10px 14px',color:'#64748B',whiteSpace:'nowrap' }}>{l.date}</td>
                    <td style={{ padding:'10px 14px',fontWeight:600,color:'#1E293B' }}>{proj(l.projectId)}</td>
                    <td style={{ padding:'10px 14px',color:'#475569' }}>{mach(l.machineId)}</td>
                    <td style={{ padding:'10px 14px',fontWeight:700,color:'#059669' }}>{l.hoursWorked}h</td>
                  </tr>
                ))}
                {recentLogs.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ padding:20,textAlign:'center',color:'#94A3B8' }}>No activity logged today yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* CRITICAL STOCK ALERTS CARD */}
        <div style={{ background:'#fff',border:'1.5px solid #E2E8F0',borderRadius:14,padding:'22px 24px' }}>
          <h3 style={{ margin:'0 0 16px',fontSize:15,fontWeight:800,color:'#0F172A',letterSpacing:'-0.2px' }}>Critical Stock Alerts</h3>
          <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
            {lowStockItems.map(s=>{
              const p = pct(s.currentQty, s.initialQty);
              return (
                <div key={s.id} style={{ border:'1px solid #E2E8F0',borderRadius:10,padding:'12px 14px',background:'#FFFDFD' }}>
                  <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4 }}>
                    <span style={{ fontWeight:700,fontSize:13,color:'#1E293B' }}>{s.itemName}</span>
                    <Badge label="Critical" color="#E24B4A" bg="#FCEBEB" />
                  </div>
                  <div style={{ fontSize:12,color:'#64748B',marginBottom:6 }}>
                    Project: <span style={{ fontWeight:600,color:'#334155' }}>{proj(s.projectId)}</span> | Machine: <span style={{ fontWeight:600,color:'#334155' }}>{mach(s.machineId)}</span>
                  </div>
                  <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:12,fontWeight:600 }}>
                    <span style={{ color:'#475569' }}>Current Stock: <strong style={{ color:'#E24B4A' }}>{s.currentQty} {s.unit}</strong> (Min: {s.minQty})</span>
                    <span style={{ color:'#94A3B8' }}>{p}% left</span>
                  </div>
                  <Bar pct={p} color="#E24B4A" />
                </div>
              );
            })}
            {lowStockItems.length === 0 && (
              <div style={{ padding:30,textAlign:'center',color:'#94A3B8',background:'#F8FAFC',borderRadius:10,border:'1px dashed #E2E8F0' }}>
                <span style={{ fontSize:20,display:'block',marginBottom:4 }}>🎉</span> All stock levels are currently healthy!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


/* ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ
   APP ROOT
ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ */
const TABS = [
  { id:'dashboard',   label:'Dashboard',     icon:'ti-layout-dashboard'   },
  { id:'stock',       label:'Stock Master',  icon:'ti-package'            },
  { id:'daily',       label:'Daily Logs',    icon:'ti-calendar-stats'     },
  { id:'maintenance', label:'Maintenance',   icon:'ti-tool'               },
  { id:'transfers',   label:'Transfers',     icon:'ti-transfer'           },
  // { id:'masters',     label:'Masters',       icon:'ti-settings'           },
];

export default function MachineryTracker() {
  const [activeTab, setTab] = useState('dashboard');
  const [projects,        setProjects]        = useState([]);
  const [machines,        setMachines]        = useState([]);
  const [supervisors,     setSupervisors]     = useState([]);
  const [stockMaster,     setStockMaster]     = useState([]);
  const [dailyLogs,       setDailyLogs]       = useState([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState([]);
  const [transferLogs,    setTransferLogs]    = useState([]);
  const [dashboardStats,  setDashboardStats]  = useState({
    stockItems: 0, criticalAlerts: 0, lowStock: 0, todayLogs: 0, hoursToday: 0, overdueM: 0, totalTransfers: 0
  });
  const [loading, setLoading] = useState(true);

  const refreshData = useCallback(async () => {
    try {
      const [mastersRes, stockRes, dailyRes, maintRes, transRes, dashRes] = await Promise.all([
        getAPICall('/api/machinery/masters'),
        getAPICall('/api/machinery/stock'),
        getAPICall('/api/machinery/daily-logs'),
        getAPICall('/api/machinery/maintenance'),
        getAPICall('/api/machinery/transfers'),
        getAPICall('/api/machinery/dashboard')
      ]);

      setProjects(mastersRes.projects || []);
      setMachines(mastersRes.machines || []);
      setSupervisors(mastersRes.supervisors || []);
      setStockMaster(stockRes || []);
      setDailyLogs(dailyRes || []);
      setMaintenanceLogs(maintRes || []);
      setTransferLogs(transRes || []);
      setDashboardStats(dashRes || { stockItems: 0, criticalAlerts: 0, lowStock: 0, todayLogs: 0, hoursToday: 0, overdueM: 0, totalTransfers: 0 });
    } catch (err) {
      console.error("Failed to load machinery data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const state = useMemo(() => ({
    projects, machines, supervisors, stockMaster, dailyLogs, maintenanceLogs, transferLogs, dashboardStats, loading
  }), [projects, machines, supervisors, stockMaster, dailyLogs, maintenanceLogs, transferLogs, dashboardStats, loading]);

  const critical = stockMaster.filter(s=>s.currentQty<=s.minQty).length;

  if (loading && projects.length === 0) {
    return (
      <div style={{ display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',background:'#F1F5F9',fontFamily:"'Outfit','Segoe UI',sans-serif" }}>
        <div style={{ textAlign:'center' }}>
          <svg width="45" height="45" viewBox="0 0 50 50" style={{ animation: 'spin 1s linear infinite' }}>
            <circle cx="25" cy="25" r="20" fill="none" stroke="#E2E8F0" strokeWidth="4" />
            <circle cx="25" cy="25" r="20" fill="none" stroke="#6366F1" strokeWidth="4" strokeDasharray="31.4 31.4" strokeLinecap="round" />
          </svg>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <p style={{ marginTop:14,fontWeight:600,color:'#64748B',fontSize:13 }}>Loading MachineryOS...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight:'100vh',background:'#F8FAFC',fontFamily:"'Outfit','Segoe UI',sans-serif",color:'#1E293B' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        input:focus, select:focus, textarea:focus { border-color: #6366F1 !important; outline: none; }
      `}</style>
      <div style={{ background:'#ffffff',borderBottom:'1.5px solid #E2E8F0',padding:'0 24px',display:'flex',alignItems:'center',height:56,position:'sticky',top:0,zIndex:100 }}>
        <div style={{ fontSize:16,fontWeight:800,color:'#0F172A',marginRight:32,whiteSpace:'nowrap',letterSpacing:'-0.3px',display:'flex',alignItems:'center',gap:6 }}>
          <span>⚙️</span> MachineryOS
        </div>
        <div style={{ display:'flex',gap:2,flex:1,overflowX:'auto' }}>
          {TABS.map(t=>(
            <button
              key={t.id}
              onClick={()=>setTab(t.id)}
              style={{
                padding:'0 14px',height:56,border:'none',background:'transparent',
                color: activeTab===t.id ? '#6366F1' : '#64748B',
                fontWeight: activeTab===t.id ? 800 : 500,
                fontSize:13,cursor:'pointer',fontFamily:'inherit',
                borderBottom: activeTab===t.id ? '2.5px solid #6366F1' : '2.5px solid transparent',
                whiteSpace:'nowrap',display:'flex',alignItems:'center',gap:6,
                transition: 'color 0.15s ease'
              }}
            >
              <i className={`ti ${t.icon}`} style={{ fontSize:15 }} aria-hidden="true" />
              {t.label}
              {t.id==='stock' && critical>0 && <span style={{ background:'#E24B4A',color:'#fff',fontSize:10,fontWeight:800,padding:'1px 6px',borderRadius:20 }}>{critical}</span>}
            </button>
          ))}
        </div>
        {/* <div style={{ fontSize:12,color:'#1D9E75',fontWeight:700,whiteSpace:'nowrap',marginLeft:16,display:'flex',alignItems:'center',gap:4 }}>
          <span style={{ display:'inline-block',width:6,height:6,background:'#1D9E75',borderRadius:'50%',animation:'pulse 1.5s infinite' }} />
          Connected to API
        </div> */}
        <style>{`@keyframes pulse { 0% { opacity: 0.3; } 50% { opacity: 1; } 100% { opacity: 0.3; } }`}</style>
      </div>
      <div style={{ maxWidth:1400,margin:'0 auto',padding:'28px 24px' }}>
        <div style={{ marginBottom:20 }}>
          <h1 style={{ fontSize:22,fontWeight:800,color:'#0F172A',margin:0,letterSpacing:'-0.3px' }}>
            {TABS.find(t=>t.id===activeTab)?.label}
          </h1>
          <p style={{ fontSize:13,color:'#64748B',margin:'4px 0 0' }}>
            {activeTab==='dashboard'   && 'Overview of all machinery stock and daily operations'}
            {activeTab==='stock'       && 'Master stock items ΓÇö create once, track daily usage & transfers'}
            {activeTab==='daily'       && 'Daily work logs appended as history ΓÇö no duplicates'}
            {activeTab==='maintenance' && 'Machine maintenance records with cost and next due tracking'}
            {activeTab==='transfers'   && 'Full audit trail of all stock transfers between projects'}
            {activeTab==='masters'     && 'Manage projects, machines and supervisors'}
          </p>
        </div>

        {activeTab==='dashboard'   && <Dashboard       state={state} />}
        {activeTab==='stock'       && <StockMasterTab  state={state} onRefresh={refreshData} />}
        {activeTab==='daily'       && <DailyLogTab     state={state} onRefresh={refreshData} />}
        {activeTab==='maintenance' && <MaintenanceTab  state={state} onRefresh={refreshData} />}
        {activeTab==='transfers'   && <TransferLogTab  state={state} onRefresh={refreshData} />}
        {activeTab==='masters'     && <MastersTab      state={state} onRefresh={refreshData} />}
      </div>
    </div>
  );
}

