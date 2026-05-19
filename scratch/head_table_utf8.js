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

// // ΓöÇΓöÇΓöÇ inline styles ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
// const styles = {
//   card: {
//     borderRadius: '12px',
//     boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
//     border: 'none',
//     overflow: 'hidden',
//   },
//   cardHeader: {
//     background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)',
//     color: '#fff',
//     padding: '16px 24px',
//     fontSize: '17px',
//     fontWeight: 700,
//     letterSpacing: '0.3px',
//   },
//   filterBar: {
//     background: '#f8fafc',
//     borderRadius: '10px',
//     padding: '14px 16px',
//     marginBottom: '18px',
//     border: '1px solid #e2e8f0',
//   },
//   parentTable: {
//     fontSize: '13px',
//     borderCollapse: 'separate',
//     borderSpacing: 0,
//     width: '100%',
//   },
//   th: {
//     background: '#1e3a5f',
//     color: '#fff',
//     fontWeight: 600,
//     fontSize: '12px',
//     textTransform: 'uppercase',
//     letterSpacing: '0.5px',
//     padding: '11px 10px',
//     whiteSpace: 'nowrap',
//     borderBottom: 'none',
//     verticalAlign: 'middle',
//   },
//   td: {
//     padding: '10px 10px',
//     verticalAlign: 'middle',
//     borderBottom: '1px solid #e9ecef',
//     background: '#fff',
//     fontSize: '13px',
//     color: '#334155',
//   },
//   expandedRow: {
//     background: '#f0f6ff',
//     borderBottom: '2px solid #2563eb',
//   },
//   childSection: {
//     padding: '16px 20px',
//     background: 'linear-gradient(180deg, #f0f6ff 0%, #f8fafc 100%)',
//     borderLeft: '4px solid #2563eb',
//   },
//   childTitle: {
//     fontSize: '13px',
//     fontWeight: 700,
//     color: '#1e3a5f',
//     marginBottom: '10px',
//     display: 'flex',
//     alignItems: 'center',
//     gap: '6px',
//   },
//   childTable: {
//     fontSize: '12.5px',
//     background: '#fff',
//     borderRadius: '8px',
//     overflow: 'hidden',
//     boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
//   },
//   childTh: {
//     background: '#334155',
//     color: '#fff',
//     fontWeight: 600,
//     fontSize: '11.5px',
//     textTransform: 'uppercase',
//     letterSpacing: '0.4px',
//     padding: '9px 10px',
//     whiteSpace: 'nowrap',
//     border: 'none',
//   },
//   childTd: {
//     padding: '9px 10px',
//     verticalAlign: 'middle',
//     borderBottom: '1px solid #f1f5f9',
//     fontSize: '12.5px',
//     color: '#374151',
//   },
//   remainingQty: {
//     color: '#16a34a',
//     fontWeight: 700,
//     fontSize: '13px',
//   },
//   btnView: {
//     background: '#06b6d4',
//     border: 'none',
//     color: '#fff',
//     borderRadius: '6px',
//     padding: '4px 10px',
//     fontSize: '12px',
//     fontWeight: 600,
//   },
//   btnEdit: {
//     background: '#f59e0b',
//     border: 'none',
//     color: '#fff',
//     borderRadius: '6px',
//     padding: '4px 10px',
//     fontSize: '12px',
//     fontWeight: 600,
//   },
//   btnTransfer: {
//     background: '#2563eb',
//     border: 'none',
//     color: '#fff',
//     borderRadius: '6px',
//     padding: '4px 10px',
//     fontSize: '12px',
//     fontWeight: 600,
//   },
//   btnLogs: {
//     background: '#64748b',
//     border: 'none',
//     color: '#fff',
//     borderRadius: '6px',
//     padding: '4px 10px',
//     fontSize: '12px',
//     fontWeight: 600,
//   },
//   actionGroup: {
//     display: 'flex',
//     gap: '5px',
//     flexWrap: 'wrap',
//     alignItems: 'center',
//   },
//   addBtn: {
//     background: '#2563eb',
//     border: 'none',
//     borderRadius: '8px',
//     padding: '7px 16px',
//     color: '#fff',
//     fontWeight: 600,
//     fontSize: '13px',
//   },
//   excelBtn: {
//     background: '#16a34a',
//     border: 'none',
//     borderRadius: '8px',
//     padding: '7px 16px',
//     color: '#fff',
//     fontWeight: 600,
//     fontSize: '13px',
//   },
// };

// // ΓöÇΓöÇΓöÇ Column count for parent table ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
// const PARENT_COL_COUNT = 14; // Project, Machine, HRS, Update Date, Supervisor, Maint Date, Hammer, Template, Capping, Damage Part, Bit, Used Bit, Oil Bal, Action

// function MachineryStockList() {
//   const navigate = useNavigate();
//   const { showToast } = useToast();

//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [expandedRows, setExpandedRows] = useState({});

//   const [projects, setProjects] = useState([]);
//   const [machines, setMachines] = useState([]);
//   const [supervisors, setSupervisors] = useState([]);
//   const [filterProject, setFilterProject] = useState('');
//   const [filterMachine, setFilterMachine] = useState('');

//   const [showMainEditModal, setShowMainEditModal] = useState(false);
//   const [editingMainRecord, setEditingMainRecord] = useState(null);
//   const [mainEditForm, setMainEditForm] = useState({});

//   const [showStockEditModal, setShowStockEditModal] = useState(false);
//   const [editingStockItem, setEditingStockItem] = useState(null);
//   const [stockEditForm, setStockEditForm] = useState({});

//   const [showTransferModal, setShowTransferModal] = useState(false);
//   const [selectedStockForTransfer, setSelectedStockForTransfer] = useState(null);
//   const [transferData, setTransferData] = useState({ to_project_id: '', to_machine_id: '', quantity: '', reason: '' });

//   const [showLogsModal, setShowLogsModal] = useState(false);
//   const [selectedStockForLogs, setSelectedStockForLogs] = useState(null);
//   const [logs, setLogs] = useState([]);
//   const [logsLoading, setLogsLoading] = useState(false);

//   const fetchDropdowns = async () => {
//     try {
//       const [pRes, mRes, supRes] = await Promise.all([
//         getAPICall('/api/projects'),
//         getAPICall('/api/machineries'),
//         getAPICall('/api/operatorsByType'),
//       ]);
//       setProjects(pRes || []);
//       setMachines(mRes?.data || mRes || []);
//       setSupervisors(supRes || []);
//     } catch (err) {
//       console.error('Dropdown fetch error:', err);
//     }
//   };

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

//   const toggleExpand = (id) => setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));

//   // ΓöÇΓöÇ Logs ΓöÇΓöÇ
//   const openLogsModal = async (stockItem) => {
//     setSelectedStockForLogs(stockItem);
//     setLogs([]);
//     setLogsLoading(true);
//     setShowLogsModal(true);
//     try {
//       const res = await getAPICall(`/api/machinery-stock-logs/${stockItem.id}`);
//       setLogs(Array.isArray(res) ? res : []);
//     } catch (error) { console.error('Error fetching logs:', error); }
//     finally { setLogsLoading(false); }
//   };

//   // ΓöÇΓöÇ Main Edit ΓöÇΓöÇ
//   const openMainEditModal = (record) => { setEditingMainRecord(record); setMainEditForm({ ...record }); setShowMainEditModal(true); };
//   const handleMainEditChange = (e) => { const { name, value } = e.target; setMainEditForm(prev => ({ ...prev, [name]: value })); };
//   const handleMainEditSave = async () => {
//     try {
//       await put(`/api/machinery-stock-update/${editingMainRecord.id}`, mainEditForm);
//       showToast('success', 'Main Record Updated Successfully!');
//       setShowMainEditModal(false);
//       fetchData();
//     } catch { showToast('danger', 'Failed to update main record'); }
//   };

//   // ΓöÇΓöÇ Stock Edit ΓöÇΓöÇ
//   const openStockEditModal = (stockItem) => { setEditingStockItem(stockItem); setStockEditForm({ ...stockItem, used_qty: '', remarks: stockItem.remarks || '' }); setShowStockEditModal(true); };
//   const handleStockEditChange = (e) => { const { name, value } = e.target; setStockEditForm(prev => ({ ...prev, [name]: value })); };
//   const handleStockEditSave = async () => {
//     const addUsed = parseFloat(stockEditForm.used_qty) || 0;
//     if (addUsed <= 0) { showToast('danger', 'Used quantity must be greater than 0'); return; }
//     const currentUsed = parseFloat(editingStockItem.used_qty) || 0;
//     const issued = parseFloat(editingStockItem.issued_qty) || 0;
//     const transferred = parseFloat(editingStockItem.transferred_qty) || 0;
//     if (currentUsed + addUsed > issued - transferred) { showToast('danger', 'Used quantity cannot exceed remaining stock'); return; }
//     try {
//       await put(`/api/machinery-stock-items/${editingStockItem.id}`, stockEditForm);
//       showToast('success', 'Stock Item Updated Successfully!');
//       setShowStockEditModal(false);
//       fetchData();
//     } catch { showToast('danger', 'Failed to update stock item'); }
//   };

//   // ΓöÇΓöÇ Transfer ΓöÇΓöÇ
//   const openTransferModal = (stockItem) => { setSelectedStockForTransfer(stockItem); setTransferData({ to_project_id: '', to_machine_id: '', quantity: '', reason: '' }); setShowTransferModal(true); };
//   const handleTransfer = async () => {
//     const qty = parseFloat(transferData.quantity) || 0;
//     const remaining = parseFloat(selectedStockForTransfer.remaining_qty) || 0;
//     if (!transferData.to_project_id || !transferData.to_machine_id) { showToast('danger', 'Please select Project and Machine'); return; }
//     if (qty <= 0) { showToast('danger', 'Transfer quantity must be greater than 0'); return; }
//     if (qty > remaining) { showToast('danger', 'Transfer quantity cannot exceed remaining quantity'); return; }
//     try {
//       await postAPICall('/api/machinery-stock-transfer', {
//         stock_item_id: selectedStockForTransfer.id,
//         to_project_id: transferData.to_project_id,
//         to_machine_id: transferData.to_machine_id,
//         quantity: transferData.quantity,
//         reason: transferData.reason || 'Stock transferred after work',
//       });
//       showToast('success', 'Stock Transferred Successfully!');
//       setShowTransferModal(false);
//       fetchData();
//     } catch { showToast('danger', 'Transfer Failed'); }
//   };

//   // ΓöÇΓöÇ Excel ΓöÇΓöÇ
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
//             'Maintenance Date': record.maintenance_date || '-',
//             'Hammer': record.hammer || '-',
//             'Template': record.tamplet || '-',
//             'Capping': record.capping || '-',
//             'Damage Part': record.damage_part || '-',
//             'Bit': record.bit || '-',
//             'Used Bit': record.used_bit || '-',
//             'Oil Balance': record.oil_bal || '-',
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
//     XLSX.utils.book_append_sheet(wb, ws, 'Machinery Stock');
//     XLSX.writeFile(wb, `Machinery_Stock_${new Date().toISOString().slice(0, 10)}.xlsx`);
//   };

//   // ΓöÇΓöÇΓöÇ render ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
//   return (
//     <>
//       <CCard style={styles.card} className="mb-4">
//         {/* ΓöÇΓöÇ Header ΓöÇΓöÇ */}
//         <CCardHeader style={styles.cardHeader} className="d-flex justify-content-between align-items-center">
//           <span>≡ƒÅù∩╕Å Machinery Stock Update List</span>
//           <div style={{ display: 'flex', gap: '10px' }}>
//             <button style={styles.addBtn} onClick={() => navigate('/machineryStockUpdate')}>+ Add New Stock</button>
//             <button style={styles.excelBtn} onClick={downloadExcel}>≡ƒôÑ Download Excel</button>
//           </div>
//         </CCardHeader>

//         <CCardBody style={{ padding: '20px' }}>
//           {/* ΓöÇΓöÇ Filters ΓöÇΓöÇ */}
//           <div style={styles.filterBar}>
//             <CRow className="g-2 align-items-center">
//               <CCol md={4}>
//                 <CFormSelect
//                   value={filterProject}
//                   onChange={(e) => setFilterProject(e.target.value)}
//                   style={{ fontSize: '13px', borderRadius: '8px' }}
//                 >
//                   <option value="">All Projects</option>
//                   {projects.map(p => <option key={p.id} value={p.id}>{p.project_name}</option>)}
//                 </CFormSelect>
//               </CCol>
//               <CCol md={4}>
//                 <CFormSelect
//                   value={filterMachine}
//                   onChange={(e) => setFilterMachine(e.target.value)}
//                   style={{ fontSize: '13px', borderRadius: '8px' }}
//                 >
//                   <option value="">All Machines</option>
//                   {machines.map(m => <option key={m.id} value={m.id}>{m.machine_name}</option>)}
//                 </CFormSelect>
//               </CCol>
//               <CCol md={4}>
//                 <CButton
//                   color="secondary"
//                   size="sm"
//                   style={{ borderRadius: '8px', fontWeight: 600, fontSize: '13px' }}
//                   onClick={() => { setFilterProject(''); setFilterMachine(''); }}
//                 >
//                   Γ£ò Clear Filters
//                 </CButton>
//               </CCol>
//             </CRow>
//           </div>

//           {/* ΓöÇΓöÇ Main Table ΓöÇΓöÇ */}
//           {loading ? (
//             <div className="text-center py-5" style={{ color: '#64748b', fontSize: '15px' }}>
//               <div className="spinner-border spinner-border-sm me-2" role="status" />
//               Loading...
//             </div>
//           ) : (
//             <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
//               <table style={styles.parentTable}>
//                 <thead>
//                   <tr>
//                     {['Project', 'Machine', 'HRS', 'Update Date', 'Supervisor',
//                       'Maintenance Date', 'Hammer', 'Template', 'Capping',
//                       'Damage Part', 'Bit', 'Used Bit', 'Oil Bal', 'Action'].map((h) => (
//                       <th key={h} style={styles.th}>{h}</th>
//                     ))}
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {data.length === 0 ? (
//                     <tr>
//                       <td colSpan={PARENT_COL_COUNT} style={{ ...styles.td, textAlign: 'center', color: '#94a3b8', padding: '30px' }}>
//                         No Records Found
//                       </td>
//                     </tr>
//                   ) : (
//                     data.map((record, idx) => {
//                       const isExpanded = !!expandedRows[record.id];
//                       const rowBg = idx % 2 === 0 ? '#fff' : '#f8fafc';
//                       return (
//                         <React.Fragment key={record.id}>
//                           {/* ΓöÇΓöÇ Parent Row ΓöÇΓöÇ */}
//                           <tr style={{ background: isExpanded ? '#dbeafe' : rowBg }}>
//                             <td style={{ ...styles.td, background: 'inherit', fontWeight: 600 }}>
//                               {record.project?.project_name || '-'}
//                             </td>
//                             <td style={{ ...styles.td, background: 'inherit' }}>
//                               <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>
//                                 {record.machine?.machine_name || '-'}
//                               </span>
//                             </td>
//                             <td style={{ ...styles.td, background: 'inherit', textAlign: 'center', fontWeight: 600 }}>
//                               {record.hrs || 0}
//                             </td>
//                             <td style={{ ...styles.td, background: 'inherit' }}>{record.update_date || '-'}</td>
//                             <td style={{ ...styles.td, background: 'inherit' }}>{record.supervisor?.name || '-'}</td>
//                             <td style={{ ...styles.td, background: 'inherit' }}>{record.maintenance_date || '-'}</td>
//                             <td style={{ ...styles.td, background: 'inherit' }}>{record.hammer || '-'}</td>
//                             <td style={{ ...styles.td, background: 'inherit' }}>{record.tamplet || '-'}</td>
//                             <td style={{ ...styles.td, background: 'inherit' }}>{record.capping || '-'}</td>
//                             <td style={{ ...styles.td, background: 'inherit' }}>{record.damage_part || '-'}</td>
//                             <td style={{ ...styles.td, background: 'inherit' }}>{record.bit || '-'}</td>
//                             <td style={{ ...styles.td, background: 'inherit' }}>{record.used_bit || '-'}</td>
//                             <td style={{ ...styles.td, background: 'inherit', textAlign: 'center' }}>{record.oil_bal || '-'}</td>
//                             <td style={{ ...styles.td, background: 'inherit' }}>
//                               <div style={styles.actionGroup}>
//                                 <button
//                                   style={{ ...styles.btnView, background: isExpanded ? '#0891b2' : '#06b6d4' }}
//                                   onClick={() => toggleExpand(record.id)}
//                                 >
//                                   {isExpanded ? 'Γû▓ Hide' : 'Γû╝ View'}
//                                 </button>
//                                 <button style={styles.btnEdit} onClick={() => openMainEditModal(record)}>
//                                   Γ£Å∩╕Å Edit
//                                 </button>
//                               </div>
//                             </td>
//                           </tr>

//                           {/* ΓöÇΓöÇ Expanded Child Row ΓÇö must span ALL parent columns ΓöÇΓöÇ */}
//                           {isExpanded && (
//                             <tr>
//                               <td colSpan={PARENT_COL_COUNT} style={{ padding: 0, border: 'none' }}>
//                                 <div style={styles.childSection}>
//                                   <div style={styles.childTitle}>
//                                     ≡ƒôª Stock Items for <strong>{record.project?.project_name}</strong> ΓÇö {record.machine?.machine_name}
//                                   </div>

//                                   {(!record.stock_items || record.stock_items.length === 0) ? (
//                                     <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>No stock items found.</p>
//                                   ) : (
//                                     <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
//                                       <table style={{ ...styles.childTable, width: '100%', borderCollapse: 'collapse' }}>
//                                         <thead>
//                                           <tr>
//                                             {['#', 'Stock Name', 'Issued Qty', 'Used Qty', 'Transferred Qty', 'Remaining Qty', 'Actions'].map((h) => (
//                                               <th key={h} style={styles.childTh}>{h}</th>
//                                             ))}
//                                           </tr>
//                                         </thead>
//                                         <tbody>
//                                           {record.stock_items.map((stock, si) => (
//                                             <tr key={stock.id} style={{ background: si % 2 === 0 ? '#fff' : '#f8fafc' }}>
//                                               <td style={{ ...styles.childTd, background: 'inherit', textAlign: 'center', color: '#94a3b8', fontWeight: 600 }}>
//                                                 {si + 1}
//                                               </td>
//                                               <td style={{ ...styles.childTd, background: 'inherit', fontWeight: 700, color: '#1e3a5f' }}>
//                                                 {stock.stock_name}
//                                               </td>
//                                               <td style={{ ...styles.childTd, background: 'inherit', textAlign: 'center' }}>
//                                                 {stock.issued_qty}
//                                               </td>
//                                               <td style={{ ...styles.childTd, background: 'inherit', textAlign: 'center' }}>
//                                                 <span style={{ color: '#dc2626', fontWeight: 600 }}>{stock.used_qty}</span>
//                                               </td>
//                                               <td style={{ ...styles.childTd, background: 'inherit', textAlign: 'center' }}>
//                                                 <span style={{ color: '#7c3aed', fontWeight: 600 }}>{stock.transferred_qty || 0}</span>
//                                               </td>
//                                               <td style={{ ...styles.childTd, background: 'inherit', textAlign: 'center' }}>
//                                                 <span style={styles.remainingQty}>{stock.remaining_qty}</span>
//                                               </td>
//                                               <td style={{ ...styles.childTd, background: 'inherit' }}>
//                                                 <div style={styles.actionGroup}>
//                                                   <button style={styles.btnEdit} onClick={() => openStockEditModal(stock)}>
//                                                     Γ£Å∩╕Å Edit
//                                                   </button>
//                                                   {parseFloat(stock.remaining_qty) > 0 && (
//                                                     <button style={styles.btnTransfer} onClick={() => openTransferModal(stock)}>
//                                                       ≡ƒöä Transfer
//                                                     </button>
//                                                   )}
//                                                   <button style={styles.btnLogs} onClick={() => openLogsModal(stock)}>
//                                                     ≡ƒôï Logs
//                                                   </button>
//                                                 </div>
//                                               </td>
//                                             </tr>
//                                           ))}
//                                         </tbody>
//                                       </table>
//                                     </div>
//                                   )}
//                                 </div>
//                               </td>
//                             </tr>
//                           )}
//                         </React.Fragment>
//                       );
//                     })
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </CCardBody>
//       </CCard>

//       {/* ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ LOGS MODAL ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ */}
//       <CModal visible={showLogsModal} onClose={() => setShowLogsModal(false)} size="lg">
//         <CModalHeader style={{ background: '#1e3a5f', color: '#fff' }}>
//           <CModalTitle>≡ƒôï Stock History ΓÇö {selectedStockForLogs?.stock_name}</CModalTitle>
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

//       {/* ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ MAIN EDIT MODAL ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ */}
//       <CModal visible={showMainEditModal} onClose={() => setShowMainEditModal(false)} size="xl">
//         <CModalHeader style={{ background: '#1e3a5f', color: '#fff' }}>
//           <CModalTitle>Γ£Å∩╕Å Edit Main Stock Update</CModalTitle>
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

//       {/* ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ STOCK EDIT MODAL ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ */}
//       <CModal visible={showStockEditModal} onClose={() => setShowStockEditModal(false)}>
//         <CModalHeader style={{ background: '#1e3a5f', color: '#fff' }}>
//           <CModalTitle>≡ƒôª Update Used Quantity</CModalTitle>
//         </CModalHeader>
//         <CModalBody>
//           {editingStockItem && (
//             <div className="mb-3 p-3 rounded" style={{ background: '#f0f6ff', border: '1px solid #bfdbfe', fontSize: '13px' }}>
//               <strong>Stock:</strong> {editingStockItem.stock_name}<br />
//               <strong>Current Used:</strong> {editingStockItem.used_qty} &nbsp;|&nbsp;
//               <strong>Remaining:</strong> <span style={{ color: '#16a34a', fontWeight: 700 }}>{editingStockItem.remaining_qty}</span>
//             </div>
//           )}
//           <CRow className="g-3">
//             <CCol md={12}>
//               <CFormInput label="Stock Name" name="stock_name" value={stockEditForm.stock_name || ''} onChange={handleStockEditChange} />
//             </CCol>
//             <CCol md={12}>
//               <CFormInput type="number" label="Add Used Qty (Today)" name="used_qty" value={stockEditForm.used_qty || ''} onChange={handleStockEditChange} placeholder="Enter quantity used today" />
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

//       {/* ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ TRANSFER MODAL ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ */}
//       <CModal visible={showTransferModal} onClose={() => setShowTransferModal(false)}>
//         <CModalHeader style={{ background: '#1e3a5f', color: '#fff' }}>
//           <CModalTitle>≡ƒöä Transfer Remaining Stock</CModalTitle>
//         </CModalHeader>
//         <CModalBody>
//           {selectedStockForTransfer && (
//             <div className="mb-3 p-3 rounded" style={{ background: '#f0f6ff', border: '1px solid #bfdbfe', fontSize: '13px' }}>
//               <strong>Stock:</strong> {selectedStockForTransfer.stock_name}<br />
//               <strong>Available Remaining:</strong> <span style={{ color: '#16a34a', fontWeight: 700 }}>{selectedStockForTransfer.remaining_qty}</span>
//             </div>
//           )}
//           <CRow className="g-3">
//             <CCol md={6}>
//               <CFormSelect label="To Project" value={transferData.to_project_id} onChange={e => setTransferData({ ...transferData, to_project_id: e.target.value })}>
//                 <option value="">Select Project</option>
//                 {projects.map(p => <option key={p.id} value={p.id}>{p.project_name}</option>)}
//               </CFormSelect>
//             </CCol>
//             <CCol md={6}>
//               <CFormSelect label="To Machine" value={transferData.to_machine_id} onChange={e => setTransferData({ ...transferData, to_machine_id: e.target.value })}>
//                 <option value="">Select Machine</option>
//                 {machines.map(m => <option key={m.id} value={m.id}>{m.machine_name}</option>)}
//               </CFormSelect>
//             </CCol>
//             <CCol md={12}>
//               <CFormInput type="number" label="Transfer Quantity" value={transferData.quantity} onChange={e => setTransferData({ ...transferData, quantity: e.target.value })} />
//             </CCol>
//             <CCol md={12}>
//               <CFormTextarea label="Reason" value={transferData.reason} onChange={e => setTransferData({ ...transferData, reason: e.target.value })} placeholder="Reason for transfer (optional)" />
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












import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  CCard,
  CCardBody,
  CCardHeader,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CCollapse,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormInput,
  CFormSelect,
  CFormTextarea,
  CRow,
  CCol,
  CBadge,
} from '@coreui/react';

import { getAPICall, postAPICall, put } from '../../../util/api';
import { useToast } from '../../common/toast/ToastContext';
import * as XLSX from 'xlsx';

function MachineryStockList() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState({});

  // Filters
  const [projects, setProjects] = useState([]);
  const [machines, setMachines] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [filterProject, setFilterProject] = useState('');
  const [filterMachine, setFilterMachine] = useState('');

  // Modals
  const [showMainEditModal, setShowMainEditModal] = useState(false);
  const [editingMainRecord, setEditingMainRecord] = useState(null);
  const [mainEditForm, setMainEditForm] = useState({});

  const [showStockEditModal, setShowStockEditModal] = useState(false);
  const [editingStockItem, setEditingStockItem] = useState(null);
  const [stockEditForm, setStockEditForm] = useState({});

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedStockForTransfer, setSelectedStockForTransfer] = useState(null);
  const [transferData, setTransferData] = useState({
    to_project_id: '',
    to_machine_id: '',
    quantity: '',
    reason: ''
  });

  const [showLogsModal, setShowLogsModal] = useState(false);
  const [selectedStockForLogs, setSelectedStockForLogs] = useState(null);
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // Fetch Dropdowns
  const fetchDropdowns = async () => {
    try {
      const [pRes, mRes, supRes] = await Promise.all([
        getAPICall('/api/projects'),
        getAPICall('/api/machineries'),
        getAPICall('/api/operatorsByType')
      ]);
      setProjects(pRes || []);
      setMachines(mRes?.data || mRes || []);
      setSupervisors(supRes || []);
    } catch (err) {
      console.error('Dropdown fetch error:', err);
    }
  };

  // Fetch Data
  const fetchData = async () => {
    try {
      setLoading(true);
      let url = '/api/machinery-stock-update';
      const params = new URLSearchParams();
      if (filterProject) params.append('project_id', filterProject);
      if (filterMachine) params.append('machine_id', filterMachine);
      const qs = params.toString();
      if (qs) url += `?${qs}`;

      const res = await getAPICall(url);
      setData(res || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDropdowns(); }, []);
  useEffect(() => { fetchData(); }, [filterProject, filterMachine]);

  const toggleExpand = (id) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Prevent negative sign in number inputs
  const preventNegative = (e) => {
    if (e.key === '-') e.preventDefault();
  };

  // ====================== LOGS ======================
  const openLogsModal = async (stockItem) => {
    setSelectedStockForLogs(stockItem);
    setLogs([]);
    setLogsLoading(true);
    setShowLogsModal(true);
    try {
      const res = await getAPICall(`/api/machinery-stock-logs/${stockItem.id}`);
      setLogs(Array.isArray(res) ? res : []);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLogsLoading(false);
    }
  };

  // ====================== MAIN EDIT ======================
  const openMainEditModal = (record) => {
    setEditingMainRecord(record);
    setMainEditForm({ ...record });
    setShowMainEditModal(true);
  };

  const handleMainEditChange = (e) => {
    const { name, value } = e.target;
    setMainEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleMainEditSave = async () => {
    try {
      await put(`/api/machinery-stock-update/${editingMainRecord.id}`, mainEditForm);
      showToast('success', 'Main Record Updated Successfully!');
      setShowMainEditModal(false);
      fetchData();
    } catch (err) {
      showToast('danger', 'Failed to update main record');
    }
  };

  // ====================== STOCK EDIT ======================
  const openStockEditModal = (stockItem) => {
    setEditingStockItem(stockItem);
    setStockEditForm({
      ...stockItem,
      used_qty: '',
      remarks: stockItem.remarks || ''
    });
    setShowStockEditModal(true);
  };

  const handleStockEditChange = (e) => {
    const { name, value } = e.target;
    setStockEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleStockEditSave = async () => {
    const addUsed = parseFloat(stockEditForm.used_qty) || 0;
    if (addUsed <= 0) return showToast('danger', 'Used quantity must be greater than 0');

    const currentUsed = parseFloat(editingStockItem.used_qty) || 0;
    const issued = parseFloat(editingStockItem.issued_qty) || 0;
    const transferred = parseFloat(editingStockItem.transferred_qty) || 0;

    if (currentUsed + addUsed > issued - transferred) {
      return showToast('danger', 'Used quantity cannot exceed remaining stock');
    }

    try {
      await put(`/api/machinery-stock-items/${editingStockItem.id}`, stockEditForm);
      showToast('success', 'Stock Item Updated Successfully!');
      setShowStockEditModal(false);
      fetchData();
    } catch (err) {
      showToast('danger', 'Failed to update stock item');
    }
  };

  // ====================== TRANSFER ======================
  const openTransferModal = (stockItem) => {
    setSelectedStockForTransfer(stockItem);
    setTransferData({ to_project_id: '', to_machine_id: '', quantity: '', reason: '' });
    setShowTransferModal(true);
  };

  const handleTransfer = async () => {
    const qty = parseFloat(transferData.quantity) || 0;
    const remaining = parseFloat(selectedStockForTransfer.remaining_qty) || 0;

    if (!transferData.to_project_id || !transferData.to_machine_id) {
      return showToast('danger', 'Please select Project and Machine');
    }
    if (qty <= 0) return showToast('danger', 'Transfer quantity must be greater than 0');
    if (qty > remaining) return showToast('danger', 'Transfer quantity cannot exceed remaining quantity');

    try {
      await postAPICall('/api/machinery-stock-transfer', {
        stock_item_id: selectedStockForTransfer.id,
        to_project_id: transferData.to_project_id,
        to_machine_id: transferData.to_machine_id,
        quantity: transferData.quantity,
        reason: transferData.reason || 'Stock transferred after work'
      });
      showToast('success', 'Stock Transferred Successfully!');
      setShowTransferModal(false);
      fetchData();
    } catch (err) {
      showToast('danger', 'Transfer Failed');
    }
  };

  // ====================== EXCEL ======================
  const downloadExcel = () => {
    const exportData = [];
    data.forEach((record) => {
      if (record.stock_items?.length > 0) {
        record.stock_items.forEach((stock) => {
          exportData.push({
            'SR No': record.sr_no || '-',
            'Project': record.project?.project_name || '-',
            'Machine': record.machine?.machine_name || '-',
            'Hours': record.hrs || 0,
            'Update Date': record.update_date || '-',
            'Supervisor': record.supervisor?.name || '-',
            'Stock Name': stock.stock_name || '-',
            'Issued Qty': stock.issued_qty || 0,
            'Used Qty': stock.used_qty || 0,
            'Transferred Qty': stock.transferred_qty || 0,
            'Remaining Qty': stock.remaining_qty || 0,
          });
        });
      }
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Machinery Stock");
    XLSX.writeFile(wb, `Machinery_Stock_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  return (
    <>
      <CCard className="mb-4">
        <CCardHeader className="d-flex justify-content-between align-items-center" style={{ background: '#1e3a5f', color: '#fff' }}>
          <strong>Machinery Stock Update List</strong>
          <div>
            <CButton color="primary" className="me-2" onClick={() => navigate('/machineryStockUpdate')}>
              + Add New Stock
            </CButton>
            <CButton color="success" onClick={downloadExcel}>
              ≡ƒôÑ Download Excel
            </CButton>
          </div>
        </CCardHeader>

        <CCardBody>
          {/* Filters */}
          <CRow className="mb-3 g-3">
            <CCol md={4}>
              <CFormSelect value={filterProject} onChange={(e) => setFilterProject(e.target.value)}>
                <option value="">All Projects</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.project_name}</option>)}
              </CFormSelect>
            </CCol>
            <CCol md={4}>
              <CFormSelect value={filterMachine} onChange={(e) => setFilterMachine(e.target.value)}>
                <option value="">All Machines</option>
                {machines.map(m => <option key={m.id} value={m.id}>{m.machine_name}</option>)}
              </CFormSelect>
            </CCol>
            <CCol md={4}>
              <CButton color="secondary" onClick={() => { setFilterProject(''); setFilterMachine(''); }}>
                Clear Filters
              </CButton>
            </CCol>
          </CRow>

          {loading ? (
            <div className="text-center py-5">Loading...</div>
          ) : (
            <CTable bordered hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Project</CTableHeaderCell>
                  <CTableHeaderCell>Machine</CTableHeaderCell>
                  <CTableHeaderCell>HRS</CTableHeaderCell>
                  <CTableHeaderCell>Update Date</CTableHeaderCell>
                  <CTableHeaderCell>Supervisor</CTableHeaderCell>
                  <CTableHeaderCell>Action</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {data.length === 0 ? (
                  <CTableRow>
                    <CTableDataCell colSpan="6" className="text-center">No Records Found</CTableDataCell>
                  </CTableRow>
                ) : (
                  data.map((record) => (
                    <React.Fragment key={record.id}>
                      <CTableRow>
                        <CTableDataCell>{record.project?.project_name || '-'}</CTableDataCell>
                        <CTableDataCell>{record.machine?.machine_name || '-'}</CTableDataCell>
                        <CTableDataCell>{record.hrs || 0}</CTableDataCell>
                        <CTableDataCell>{record.update_date}</CTableDataCell>
                        <CTableDataCell>{record.supervisor?.name || '-'}</CTableDataCell>
                        <CTableDataCell>
                          <CButton size="sm" color="info" onClick={() => toggleExpand(record.id)} className="me-2">
                            {expandedRows[record.id] ? 'Hide' : 'View'}
                          </CButton>
                          <CButton size="sm" color="warning" onClick={() => openMainEditModal(record)} className="me-2">
                            Edit
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>

                      <CTableRow>
                        <CTableDataCell colSpan="6" className="p-0">
                          <CCollapse visible={expandedRows[record.id]}>
                            <div className="p-3 bg-light">
                              <h6 className="mb-3">Stock Items</h6>
                              <CTable bordered small responsive>
                                <CTableHead>
                                  <CTableRow>
                                    <CTableHeaderCell>Stock Name</CTableHeaderCell>
                                    <CTableHeaderCell>Issued</CTableHeaderCell>
                                    <CTableHeaderCell>Used</CTableHeaderCell>
                                    <CTableHeaderCell>Transferred</CTableHeaderCell>
                                    <CTableHeaderCell>Remaining</CTableHeaderCell>
                                    <CTableHeaderCell>Action</CTableHeaderCell>
                                  </CTableRow>
                                </CTableHead>
                                <CTableBody>
                                  {record.stock_items?.map((stock) => (
                                    <CTableRow key={stock.id}>
                                      <CTableDataCell><strong>{stock.stock_name}</strong></CTableDataCell>
                                      <CTableDataCell>{stock.issued_qty}</CTableDataCell>
                                      <CTableDataCell>{stock.used_qty}</CTableDataCell>
                                      <CTableDataCell>{stock.transferred_qty || 0}</CTableDataCell>
                                      <CTableDataCell className="text-success fw-bold">
                                        {stock.remaining_qty}
                                      </CTableDataCell>
                                      <CTableDataCell>
                                        <CButton size="sm" color="warning" className="me-2" onClick={() => openStockEditModal(stock)}>
                                          Edit
                                        </CButton>
                                        {parseFloat(stock.remaining_qty) > 0 && (
                                          <CButton size="sm" color="primary" className="me-2" onClick={() => openTransferModal(stock)}>
                                            Transfer
                                          </CButton>
                                        )}
                                        <CButton size="sm" color="info" onClick={() => openLogsModal(stock)}>
                                          View Logs
                                        </CButton>
                                      </CTableDataCell>
                                    </CTableRow>
                                  ))}
                                </CTableBody>
                              </CTable>
                            </div>
                          </CCollapse>
                        </CTableDataCell>
                      </CTableRow>
                    </React.Fragment>
                  ))
                )}
              </CTableBody>
            </CTable>
          )}
        </CCardBody>
      </CCard>

      {/* LOGS MODAL */}
      <CModal visible={showLogsModal} onClose={() => setShowLogsModal(false)} size="lg">
        <CModalHeader style={{ background: '#1e3a5f', color: '#fff' }}>
          <CModalTitle>≡ƒôï Stock History - {selectedStockForLogs?.stock_name}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {logsLoading ? (
            <div className="text-center py-5">Loading logs...</div>
          ) : logs.length === 0 ? (
            <p className="text-center text-muted py-5">No activity logs found for this stock item.</p>
          ) : (
            <CTable bordered hover responsive>
              <CTableHead color="dark">
                <CTableRow>
                  <CTableHeaderCell>Date</CTableHeaderCell>
                  <CTableHeaderCell>Type</CTableHeaderCell>
                  <CTableHeaderCell>Quantity</CTableHeaderCell>
                  <CTableHeaderCell>Remaining After</CTableHeaderCell>
                  <CTableHeaderCell>Destination</CTableHeaderCell>
                  <CTableHeaderCell>Remarks</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {logs.map((log, index) => (
                  <CTableRow key={index}>
                    <CTableDataCell>{log.log_date}</CTableDataCell>
                    <CTableDataCell>
                      <CBadge color={log.type === 'used' ? 'warning' : 'danger'}>
                        {log.type.toUpperCase()}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell className="fw-bold text-center">{log.quantity}</CTableDataCell>
                    <CTableDataCell className="text-success fw-bold text-center">{log.remaining_after}</CTableDataCell>
                    <CTableDataCell>
                      {log.type === 'transferred' && (log.to_project || log.to_machine) ? (
                        <div>
                          <strong>To:</strong><br />
                          {log.to_project && <span>{log.to_project}</span>}<br />
                          {log.to_machine && <small className="text-muted">{log.to_machine}</small>}
                        </div>
                      ) : '-'}
                    </CTableDataCell>
                    <CTableDataCell>{log.remarks || '-'}</CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowLogsModal(false)}>Close</CButton>
        </CModalFooter>
      </CModal>

      {/* MAIN EDIT MODAL */}
      <CModal visible={showMainEditModal} onClose={() => setShowMainEditModal(false)} size="xl">
        <CModalHeader style={{ background: '#1e3a5f', color: '#fff' }}>
          <CModalTitle>Edit Main Stock Update</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CRow className="g-3">
            <CCol md={4}>
              <CFormSelect label="Project" name="project_id" value={mainEditForm.project_id || ''} onChange={handleMainEditChange}>
                {projects.map(p => <option key={p.id} value={p.id}>{p.project_name}</option>)}
              </CFormSelect>
            </CCol>
            <CCol md={4}>
              <CFormSelect label="Machine" name="machine_id" value={mainEditForm.machine_id || ''} onChange={handleMainEditChange}>
                {machines.map(m => <option key={m.id} value={m.id}>{m.machine_name}</option>)}
              </CFormSelect>
            </CCol>
            <CCol md={4}>
              <CFormSelect label="Supervisor" name="supervisor_id" value={mainEditForm.supervisor_id || ''} onChange={handleMainEditChange}>
                <option value="">Select Supervisor</option>
                {supervisors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </CFormSelect>
            </CCol>
            <CCol md={3}>
              <CFormInput type="number" label="HRS" name="hrs" value={mainEditForm.hrs || ''} onChange={handleMainEditChange} />
            </CCol>
            <CCol md={3}>
              <CFormInput type="date" label="Update Date" name="update_date" value={mainEditForm.update_date || ''} onChange={handleMainEditChange} />
            </CCol>
            <CCol md={3}>
              <CFormInput type="date" label="Maintenance Date" name="maintenance_date" value={mainEditForm.maintenance_date || ''} onChange={handleMainEditChange} />
            </CCol>
            <CCol md={3}>
              <CFormInput type="number" label="Oil Balance" name="oil_bal" value={mainEditForm.oil_bal || ''} onChange={handleMainEditChange} />
            </CCol>
            <CCol md={4}>
              <CFormInput label="Hammer" name="hammer" value={mainEditForm.hammer || ''} onChange={handleMainEditChange} />
            </CCol>
            <CCol md={4}>
              <CFormInput label="Template" name="tamplet" value={mainEditForm.tamplet || ''} onChange={handleMainEditChange} />
            </CCol>
            <CCol md={4}>
              <CFormInput label="Capping" name="capping" value={mainEditForm.capping || ''} onChange={handleMainEditChange} />
            </CCol>
            <CCol md={4}>
              <CFormInput label="Damage Part" name="damage_part" value={mainEditForm.damage_part || ''} onChange={handleMainEditChange} />
            </CCol>
            <CCol md={4}>
              <CFormInput label="Bit" name="bit" value={mainEditForm.bit || ''} onChange={handleMainEditChange} />
            </CCol>
            <CCol md={4}>
              <CFormInput label="Used Bit" name="used_bit" value={mainEditForm.used_bit || ''} onChange={handleMainEditChange} />
            </CCol>
            <CCol md={12}>
              <CFormTextarea label="Stock Details" name="stock_details" value={mainEditForm.stock_details || ''} onChange={handleMainEditChange} rows={2} />
            </CCol>
          </CRow>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowMainEditModal(false)}>Cancel</CButton>
          <CButton color="primary" onClick={handleMainEditSave}>Save Changes</CButton>
        </CModalFooter>
      </CModal>

      {/* STOCK EDIT MODAL */}
      <CModal visible={showStockEditModal} onClose={() => setShowStockEditModal(false)}>
        <CModalHeader style={{ background: '#1e3a5f', color: '#fff' }}>
          <CModalTitle>Update Used Quantity</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {editingStockItem && (
            <div className="mb-3 p-3 bg-light rounded">
              <strong>Stock:</strong> {editingStockItem.stock_name}<br />
              <strong>Current Used:</strong> {editingStockItem.used_qty} | 
              <strong> Remaining:</strong> {editingStockItem.remaining_qty}
            </div>
          )}
          <CRow className="g-3">
            <CCol md={12}>
              <CFormInput label="Stock Name" name="stock_name" value={stockEditForm.stock_name || ''} onChange={handleStockEditChange} />
            </CCol>
            <CCol md={12}>
              <CFormInput 
                type="number" 
                min="0"
                label="Add Used Qty (Today)" 
                name="used_qty" 
                value={stockEditForm.used_qty || ''} 
                onChange={handleStockEditChange} 
                onKeyDown={preventNegative}
                placeholder="Enter quantity used today"
              />
            </CCol>
            <CCol md={12}>
              <CFormTextarea label="Remarks" name="remarks" value={stockEditForm.remarks || ''} onChange={handleStockEditChange} rows={3} />
            </CCol>
          </CRow>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowStockEditModal(false)}>Cancel</CButton>
          <CButton color="primary" onClick={handleStockEditSave}>Save Used Quantity</CButton>
        </CModalFooter>
      </CModal>

      {/* TRANSFER MODAL */}
      <CModal visible={showTransferModal} onClose={() => setShowTransferModal(false)}>
        <CModalHeader style={{ background: '#1e3a5f', color: '#fff' }}>
          <CModalTitle>Transfer Remaining Stock</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedStockForTransfer && (
            <div className="mb-3 p-3 bg-light rounded">
              <strong>Stock:</strong> {selectedStockForTransfer.stock_name}<br />
              <strong>Remaining:</strong> {selectedStockForTransfer.remaining_qty}
            </div>
          )}
          <CRow className="g-3">
            <CCol md={6}>
              <CFormSelect label="To Project" value={transferData.to_project_id} onChange={e => setTransferData({...transferData, to_project_id: e.target.value})}>
                <option value="">Select Project</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.project_name}</option>)}
              </CFormSelect>
            </CCol>
            <CCol md={6}>
              <CFormSelect label="To Machine" value={transferData.to_machine_id} onChange={e => setTransferData({...transferData, to_machine_id: e.target.value})}>
                <option value="">Select Machine</option>
                {machines.map(m => <option key={m.id} value={m.id}>{m.machine_name}</option>)}
              </CFormSelect>
            </CCol>
            <CCol md={12}>
              <CFormInput 
                type="number" 
                min="0"
                label="Transfer Quantity" 
                value={transferData.quantity} 
                onChange={e => setTransferData({...transferData, quantity: e.target.value})} 
                onKeyDown={preventNegative}
              />
            </CCol>
            <CCol md={12}>
              <CFormTextarea label="Reason" value={transferData.reason} onChange={e => setTransferData({...transferData, reason: e.target.value})} placeholder="Reason for transfer (optional)" />
            </CCol>
          </CRow>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowTransferModal(false)}>Cancel</CButton>
          <CButton color="primary" onClick={handleTransfer}>Confirm Transfer</CButton>
        </CModalFooter>
      </CModal>
    </>
  );
}

export default MachineryStockList;
