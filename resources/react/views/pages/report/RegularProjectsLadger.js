
// // import React, { useState, useEffect } from 'react';
// // import axios from 'axios';
// // import {
// //   CCard,
// //   CCardBody,
// //   CCardHeader,
// //   CRow,
// //   CCol,
// //   CFormInput,
// //   CFormLabel,
// //   CButton,
// //   CTable,
// //   CTableHead,
// //   CTableBody,
// //   CTableRow,
// //   CTableHeaderCell,
// //   CTableDataCell,
// //   CCollapse,
// //   CBadge,
// // } from '@coreui/react';
// // import { getAPICall } from '../../../util/api';

// // const LedgerReport = () => {
// //     const [data, setData] = useState([]);
// //     const [grandTotal, setGrandTotal] = useState({});
// //     const [loading, setLoading] = useState(false);
// //     const [expandedProjects, setExpandedProjects] = useState(new Set());

// //     const [search, setSearch] = useState('');
// //     const [endDate, setEndDate] = useState(`${defaultFYStart + 1}-03-31`);
// //     const [minBalance, setMinBalance] = useState('');
// //     const [maxBalance, setMaxBalance] = useState('');
// //     const [hasPending, setHasPending] = useState(false);

// //     const getAuthToken = () => localStorage.getItem('auth_token');

// //     const fetchLedgerReport = async () => {
// //         setLoading(true);
// //         try {
// //             const token = getAuthToken();
// //             const response = await getAPICall('/api/RegularProjectLedgerReport', {
// //                 params: {
// //                     search,
// //                     start_date: startDate,
// //                     end_date: endDate,
// //                     min_balance: minBalance || undefined,
// //                     max_balance: maxBalance || undefined,
// //                     has_pending: hasPending || undefined,
// //                 },
// //                 headers: {
// //                     Authorization: token ? `Bearer ${token}` : '',
// //                 },
// //             });

// //             setData(response.data || []);
// //             setGrandTotal(response.data.grand_total || {});
// //         } catch (error) {
// //             console.error('Error fetching ledger report:', error);
// //             if (error.response?.status === 401) {
// //                 alert('Session expired. Please login again.');
// //             } else {
// //                 alert('Failed to load ledger report');
// //             }
// //         } finally {
// //             setLoading(false);
// //         }
// //     };

// //     useEffect(() => {
// //         fetchLedgerReport();
// //     }, []);

// //     const toggleExpand = (projectId) => {
// //         const newExpanded = new Set(expandedProjects);
// //         if (newExpanded.has(projectId)) {
// //             newExpanded.delete(projectId);
// //         } else {
// //             newExpanded.add(projectId);
// //         }
// //         setExpandedProjects(newExpanded);
// //     };

// //     const formatCurrency = (amount) => {
// //         return Number(amount || 0).toLocaleString('en-IN', {
// //             minimumFractionDigits: 2,
// //             maximumFractionDigits: 2,
// //         });
// //     };

// //     return (
// //         <>
// //             <CCard className="mb-4">
// //                 <CCardHeader>
// //                     <h4 className="mb-0">Regular Project Ledger Report</h4>
// //                 </CCardHeader>
// //                 <CCardBody>
// //                     <CRow className="g-3 mb-4">
// //                         <CCol md={3}>
// //                             <CFormLabel>Search</CFormLabel>
// //                             <CFormInput placeholder="Project, Customer..." value={search} onChange={(e) => setSearch(e.target.value)} />
// //                         </CCol>
// //                         <CCol md={3}>
// //                             <CFormLabel>Start Date</CFormLabel>
// //                             <CFormInput type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
// //                         </CCol>
// //                         <CCol md={3}>
// //                             <CFormLabel>End Date</CFormLabel>
// //                             <CFormInput type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
// //                         </CCol>
// //                         <CCol md={3}>
// //                             <CFormLabel>Has Pending</CFormLabel>
// //                             <div className="mt-2">
// //                                 <input type="checkbox" checked={hasPending} onChange={(e) => setHasPending(e.target.checked)} />
// //                                 <span className="ms-2">Only pending records</span>
// //                             </div>
// //                         </CCol>

// //                         <CCol md={3}>
// //                             <CFormLabel>Min Balance</CFormLabel>
// //                             <CFormInput type="number" value={minBalance} onChange={(e) => setMinBalance(e.target.value)} />
// //                         </CCol>
// //                         <CCol md={3}>
// //                             <CFormLabel>Max Balance</CFormLabel>
// //                             <CFormInput type="number" value={maxBalance} onChange={(e) => setMaxBalance(e.target.value)} />
// //                         </CCol>

// //                         <CCol md={3} className="d-flex align-items-end">
// //                             <CButton color="primary" onClick={fetchLedgerReport} disabled={loading}>
// //                                 {loading ? 'Loading...' : 'Apply Filters'}
// //                             </CButton>
// //                         </CCol>
// //                     </CRow>

// //                     {/* Grand Total */}
// //                     {Object.keys(grandTotal).length > 0 && (
// //                         <CCard className="mb-4 border-primary">
// //                             <CCardHeader className="bg-light"><strong>Grand Total Summary</strong></CCardHeader>
// //                             <CCardBody>
// //                                 <CRow className="text-center">
// //                                     <CCol md={2}><h6>Projects</h6><h3>{grandTotal.project_count}</h3></CCol>
// //                                     <CCol md={2}><h6>Project Cost</h6><h4>₹{formatCurrency(grandTotal.total_project_cost)}</h4></CCol>
// //                                     <CCol md={2}><h6>Orders Amount</h6><h4>₹{formatCurrency(grandTotal.total_orders_amount)}</h4></CCol>
// //                                     <CCol md={2}><h6>Total Expense</h6><h4 className="text-danger">₹{formatCurrency(grandTotal.total_expense_amount)}</h4></CCol>
// //                                     <CCol md={2}><h6>Net Balance</h6><h4 className={grandTotal.net_balance >= 0 ? 'text-success' : 'text-danger'}>₹{formatCurrency(grandTotal.net_balance)}</h4></CCol>
// //                                     <CCol md={2}><h6>Status</h6>
// //                                         <CBadge color={grandTotal.overall_status === 'profit' ? 'success' : 'danger'} size="lg">
// //                                             {grandTotal.overall_status?.toUpperCase()}
// //                                         </CBadge>
// //                                     </CCol>
// //                                 </CRow>
// //                             </CCardBody>
// //                         </CCard>
// //                     )}

// //                     {/* Main Table */}
// //                     <CCard>
// //                         <CCardHeader><strong>Project Ledger Details (with Orders)</strong></CCardHeader>
// //                         <CCardBody>
// //                             <CTable bordered hover responsive>
// //                                 <CTableHead>
// //                                     <CTableRow>
// //                                         <CTableHeaderCell>Project</CTableHeaderCell>
// //                                         <CTableHeaderCell>Customer</CTableHeaderCell>
// //                                         <CTableHeaderCell className="text-end">Project Cost</CTableHeaderCell>
// //                                         <CTableHeaderCell className="text-end">Orders</CTableHeaderCell>
// //                                         <CTableHeaderCell className="text-end">Billing</CTableHeaderCell>
// //                                         <CTableHeaderCell className="text-end">Received</CTableHeaderCell>
// //                                         <CTableHeaderCell className="text-end">Expense</CTableHeaderCell>
// //                                         <CTableHeaderCell className="text-end">Net Balance</CTableHeaderCell>
// //                                         <CTableHeaderCell className="text-center">Status</CTableHeaderCell>
// //                                         <CTableHeaderCell className="text-center">Action</CTableHeaderCell>
// //                                     </CTableRow>
// //                                 </CTableHead>
// //                                 <CTableBody>
// //                                     {data.map((item) => {
// //                                         const project = item.project;
// //                                         const summary = item.summary;
// //                                         const isExpanded = expandedProjects.has(project.id);

// //                                         return (
// //                                             <React.Fragment key={project.id}>
// //                                                 <CTableRow style={{ cursor: 'pointer' }} onClick={() => toggleExpand(project.id)}>
// //                                                     <CTableDataCell><strong>{project.project_name}</strong><br /><small>{project.work_place}</small></CTableDataCell>
// //                                                     <CTableDataCell>{project.customer_name}<br /><small>{project.mobile_number}</small></CTableDataCell>
// //                                                     <CTableDataCell className="text-end">₹{formatCurrency(project.project_cost)}</CTableDataCell>
// //                                                     <CTableDataCell className="text-end">₹{formatCurrency(summary.total_orders_amount)}</CTableDataCell>
// //                                                     <CTableDataCell className="text-end">₹{formatCurrency(summary.total_billing_amount)}</CTableDataCell>
// //                                                     <CTableDataCell className="text-end">₹{formatCurrency(summary.total_received_amount)}</CTableDataCell>
// //                                                     <CTableDataCell className="text-end text-danger">₹{formatCurrency(summary.total_expense_amount)}</CTableDataCell>
// //                                                     <CTableDataCell className="text-end fw-bold">₹{formatCurrency(summary.net_balance)}</CTableDataCell>
// //                                                     <CTableDataCell className="text-center">
// //                                                         <CBadge color={summary.balance_status === 'profit' ? 'success' : 'danger'}>
// //                                                             {summary.balance_status.toUpperCase()}
// //                                                         </CBadge>
// //                                                     </CTableDataCell>
// //                                                     <CTableDataCell className="text-center">{isExpanded ? '▲' : '▼'}</CTableDataCell>
// //                                                 </CTableRow>

// //                                                 <CTableRow>
// //                                                     <CTableDataCell colSpan="10" className="p-0">
// //                                                         <CCollapse visible={isExpanded}>
// //                                                             <div className="p-4 bg-light">
// //                                                                 <CRow>
// //                                                                     {/* Orders Section */}
// //                                                                     <CCol lg={4}>
// //                                                                         <h5 className="text-info mb-3">Orders ({summary.order_count})</h5>
// //                                                                         {item.orders && item.orders.length === 0 ? (
// //                                                                             <p className="text-muted">No orders</p>
// //                                                                         ) : (
// //                                                                             item.orders.map((ord) => (
// //                                                                                 <CCard key={ord.id} className="mb-3">
// //                                                                                     <CCardBody>
// //                                                                                         <strong>Invoice: {ord.invoice_number}</strong>
// //                                                                                         <span className="float-end fw-bold">₹{formatCurrency(ord.final_amount)}</span>
// //                                                                                         <p className="small text-muted mb-0">
// //                                                                                             Paid: ₹{formatCurrency(ord.paid_amount)} | Status: {ord.order_status}
// //                                                                                         </p>
// //                                                                                     </CCardBody>
// //                                                                                 </CCard>
// //                                                                             ))
// //                                                                         )}
// //                                                                     </CCol>

// //                                                                     {/* Incomes */}
// //                                                                     <CCol lg={4}>
// //                                                                         <h5 className="text-success mb-3">Incomes ({summary.income_count})</h5>
// //                                                                         {item.incomes.length === 0 ? <p className="text-muted">No income records</p> : 
// //                                                                             item.incomes.map(inc => (
// //                                                                                 <CCard key={inc.id} className="mb-3">
// //                                                                                     <CCardBody>
// //                                                                                         <strong>Invoice: {inc.invoice_no}</strong>
// //                                                                                         <span className="float-end text-success">₹{formatCurrency(inc.billing_amount)}</span>
// //                                                                                         <p className="small text-muted">Received: ₹{formatCurrency(inc.received_amount)}</p>
// //                                                                                     </CCardBody>
// //                                                                                 </CCard>
// //                                                                             ))
// //                                                                         }
// //                                                                     </CCol>

// //                                                                     {/* Expenses */}
// //                                                                     <CCol lg={4}>
// //                                                                         <h5 className="text-danger mb-3">Expenses ({summary.expense_count})</h5>
// //                                                                         {item.expenses.length === 0 ? <p className="text-muted">No expense records</p> : 
// //                                                                             item.expenses.map(exp => (
// //                                                                                 <CCard key={exp.id} className="mb-3">
// //                                                                                     <CCardBody>
// //                                                                                         <strong>{exp.name}</strong>
// //                                                                                         <span className="float-end text-danger">₹{formatCurrency(exp.total_price)}</span>
// //                                                                                         <p className="small text-muted">{exp.expense_date}</p>
// //                                                                                     </CCardBody>
// //                                                                                 </CCard>
// //                                                                             ))
// //                                                                         }
// //                                                                     </CCol>
// //                                                                 </CRow>
// //                                                             </div>
// //                                                         </CCollapse>
// //                                                     </CTableDataCell>
// //                                                 </CTableRow>
// //                                             </React.Fragment>
// //                                         );
// //                                     })}

// //                                     {data.length === 0 && !loading && (
// //                                         <CTableRow>
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import {
//   CCard,
//   CCardBody,
//   CCardHeader,
//   CRow,
//   CCol,
//   CFormInput,
//   CFormLabel,
//   CButton,
//   CButtonGroup,
//   CTable,
//   CTableHead,
//   CTableBody,
//   CTableRow,
//   CTableHeaderCell,
//   CTableDataCell,
//   CCollapse,
//   CBadge,
// } from '@coreui/react';
// import { getAPICall } from '../../../util/api';
// import Select from 'react-select';
// import jsPDF from 'jspdf';
// import 'jspdf-autotable';
// import { utils as XLSXUtils, writeFile as XLSXWriteFile } from 'xlsx';
// import { getUserData } from '../../../util/session';
// import { host } from '../../../util/constants';

// const LedgerReport = () => {
//   const [data, setData] = useState([]);
//   const [grandTotal, setGrandTotal] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [expandedProjects, setExpandedProjects] = useState(new Set());
//   const [viewMode, setViewMode] = useState('project'); // 'project' or 'date'

//   // Filter fields
//   const [filterProject, setFilterProject] = useState(null);
//   const [projects, setProjects] = useState([]);
//   const [startDate, setStartDate] = useState('');
//   const [endDate, setEndDate] = useState('');

//   const getAuthToken = () => localStorage.getItem('auth_token');

//   const fetchLedgerReport = async () => {
//     setLoading(true);
//     try {
//       const params = new URLSearchParams();
//       if (filterProject?.value) params.append("project_id", filterProject.value);
//       if (startDate) params.append("start_date", startDate);
//       if (endDate) params.append("end_date", endDate);
//       if (filterVoucherType) params.append("voucher_type", filterVoucherType.value);
//       if (filterTransactionType) params.append("transaction_type", filterTransactionType.value);

//       const response = await getAPICall(`/api/RegularProjectLedgerReport?${params.toString()}`);
//       setData(response.data || []);
//       setGrandTotal(response.data.grand_total || {});
//     } catch (error) {
//       console.error('Error fetching ledger report:', error);
//       if (error.response?.status === 401) {
//         alert('Session expired. Please login again.');
//       } else {
//         alert('Failed to load ledger report');
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch projects list for dropdown
//   const fetchProjects = async () => {
//     try {
//       const response = await getAPICall('/api/projects');
//       setProjects(response || []);
//     } catch (error) {
//       console.error('Error fetching projects:', error);
//     }
//   };

//   useEffect(() => {
//     fetchProjects();
//     fetchLedgerReport();
//   }, []);

//   const toggleExpand = (projectId) => {
//     const newExpanded = new Set(expandedProjects);
//     if (newExpanded.has(projectId)) newExpanded.delete(projectId);
//     else newExpanded.add(projectId);
//     setExpandedProjects(newExpanded);
//   };

//   const formatCurrency = (amount) =>
//     Number(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

//   // Generate PDF
//   const generatePdf = () => {
//     // Landscape A4 for wide columns
//     const doc = new jsPDF('landscape', 'pt', 'a4');
//     const pageWidth = doc.internal.pageSize.getWidth();
//     const pageHeight = doc.internal.pageSize.getHeight();
//     const margin = 30;
//     const user = getUserData();
//     const companyInfo = user?.company_info || {};

//     if (data.length === 0) {
//       doc.text("No data available", pageWidth / 2, pageHeight / 2, { align: "center" });
//       doc.save("Ledger.pdf");
//       return;
//     }

//     const drawHeader = (project) => {
//       let currentY = margin + 15;
      
//       // Top Center: Company Name & Report Name
//       doc.setFontSize(10);
//       doc.setFont("helvetica", "bold");
//       doc.text(companyInfo.company_name || "Deshmukh Infra Solutions LLP", pageWidth / 2, currentY, { align: "center" });
//       doc.setFontSize(9);
//       doc.setFont("helvetica", "normal");
//       doc.text("General Ledger", pageWidth / 2, currentY + 12, { align: "center" });

//       // Top Right: Page Info
//       doc.setFontSize(8);
//       const today = new Date();
//       doc.text(`Date - ${today.toLocaleDateString()}`, pageWidth - margin, currentY, { align: "right" });
//       doc.text(`Time - ${today.toLocaleTimeString()}`, pageWidth - margin, currentY + 10, { align: "right" });
      
//       const dateRangeStr = (startDate && endDate) ? `${startDate} To ${endDate}` : (startDate ? `From ${startDate}` : (endDate ? `Up to ${endDate}` : 'All Dates'));
//       doc.text(`Period - ${dateRangeStr}`, pageWidth - margin, currentY + 20, { align: "right" });

//       currentY += 25;

//       // Top Left: Project Info
//       doc.setFont("helvetica", "bold");
//       doc.text(`Project: ${project?.project_name || "-"}`, margin, currentY);
//       doc.setFont("helvetica", "normal");
//       doc.text(`Customer: ${project?.customer_name || "-"}`, margin, currentY + 12);
//       doc.text(`Address: ${project?.work_place || "-"}`, margin, currentY + 24);

//       currentY += 40;
//       return currentY;
//     };

//     data.forEach((item, index) => {
//       if (index > 0) doc.addPage();
//       let yPosition = drawHeader(item.project);

//       // Assume normal balance is Credit (Income). Net = Income - Expenses
//       let runningBalance = parseFloat(item.summary.opening_balance) || 0;
      
//       const formatBal = (bal) => {
//           if (Math.abs(bal) < 0.01) return "0.00";
//           return Math.abs(bal).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + (bal >= 0 ? " CR" : " DR");
//       };

//       const columns = ['Date', 'Particulars', 'Vch Type', 'Vch No.', 'Debit', 'Credit', 'Running Balance'];
//       const rows = [];

//       // Balance Forward (Opening Balance)
//       rows.push([
//           startDate || '',
//           parseFloat(runningBalance) >= 0 ? 'CR Opening Balance' : 'DR Opening Balance',
//           '',
//           '',
//           runningBalance < 0 ? formatCurrency(Math.abs(runningBalance)) : '',
//           runningBalance > 0 ? formatCurrency(runningBalance) : '',
//           formatBal(runningBalance)
//       ]);

//       let periodTotalDebit = 0;
//       let periodTotalCredit = 0;

//       item.ledger_entries.forEach(entry => {
//           let deb = parseFloat(entry.debit) || 0;
//           let cre = parseFloat(entry.credit) || 0;
          
//           periodTotalDebit += deb;
//           periodTotalCredit += cre;
          
//           runningBalance += (cre - deb); // CR increases balance, DR decreases

//           rows.push([
//               entry.date || '',
//               entry.particulars || '',
//               entry.vch_type || '',
//               entry.vch_no || '',
//               deb > 0 ? formatCurrency(deb) : '',
//               cre > 0 ? formatCurrency(cre) : '',
//               formatBal(runningBalance)
//           ]);
//       });

//       // Period Total Transactions
//       rows.push([
//           '',
//           'Period Total Transactions',
//           '',
//           '',
//           periodTotalDebit > 0 ? formatCurrency(periodTotalDebit) : '',
//           periodTotalCredit > 0 ? formatCurrency(periodTotalCredit) : '',
//           ''
//       ]);

//       // Period End Balance (Closing Balance)
//       rows.push([
//           endDate || '',
//           'Period End Balance',
//           '',
//           '',
//           '',
//           '',
//           formatBal(runningBalance)
//       ]);

//       doc.autoTable({
//         startY: yPosition,
//         head: [columns],
//         body: rows,
//         theme: 'plain',
//         styles: {
//             font: 'helvetica',
//             fontSize: 8,
//             cellPadding: 4,
//             textColor: 0, 
//         },
//         headStyles: {
//             fontStyle: 'bold'
//         },
//         columnStyles: {
//             0: { cellWidth: 70, halign: 'left' },    // Date
//             1: { cellWidth: 260, halign: 'left' },   // Particulars
//             2: { cellWidth: 70, halign: 'center' },  // Vch Type
//             3: { cellWidth: 70, halign: 'center' },  // Vch No
//             4: { cellWidth: 80, halign: 'right' },   // Debit
//             5: { cellWidth: 80, halign: 'right' },   // Credit
//             6: { cellWidth: 90, halign: 'right' },   // Balance
//         },
//         willDrawCell: function(data) {
//             // Dash function compatible with older jsPDF
//             const setDash = () => {
//                if (typeof doc.setLineDashPattern === 'function') doc.setLineDashPattern([3, 3], 0);
//                else if (typeof doc.setLineDash === 'function') doc.setLineDash([3, 3], 0);
//             };
//             const resetDash = () => {
//                if (typeof doc.setLineDashPattern === 'function') doc.setLineDashPattern([], 0);
//                else if (typeof doc.setLineDash === 'function') doc.setLineDash([], 0);
//             };

//             // Draw horizontal dashed lines for headers
//             if (data.row.section === 'head') {
//                 doc.setDrawColor(0);
//                 doc.setLineWidth(0.5);
//                 setDash();
//                 doc.line(data.cell.x, data.cell.y, data.cell.x + data.cell.width, data.cell.y);
//                 doc.line(data.cell.x, data.cell.y + data.cell.height, data.cell.x + data.cell.width, data.cell.y + data.cell.height);
//                 resetDash();
//             }

//             const rowIndex = data.row.index;
//             if (rowIndex === 0 || rowIndex >= rows.length - 2) {
//                 doc.setFont("helvetica", "bold");
//             }

//             if (rowIndex === rows.length - 2) {
//                 doc.setDrawColor(0);
//                 doc.setLineWidth(0.5);
//                 setDash();
//                 doc.line(data.cell.x, data.cell.y, data.cell.x + data.cell.width, data.cell.y);
//                 resetDash();
//             }
//         },
//         didDrawPage: (data) => {
//            doc.setFontSize(8);
//            doc.setFont("helvetica", "normal");
//            doc.text(`Page - ${doc.getCurrentPageInfo().pageNumber}`, pageWidth - margin, margin, { align: 'right' });
//         },
//         margin: { top: margin, left: margin, right: margin }
//       });
//     });

//     const today = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
//     doc.save(`General_Ledger_${today}.pdf`);
//   };

//   // Export to Excel
//   const exportExcel = () => {
//     const exportData = [];
//     data.forEach(item => {
//       exportData.push({
//         Date: '',
//         'Voucher No': '',
//         Particulars: `Vendor: ${item.vendor.name} - ${item.vendor.mobile}`,
//         Debit: '',
//         Credit: '',
//         'Running Balance': ''
//       });
      
//       const ob = parseFloat(item.summary.opening_balance) || 0;
//       exportData.push({
//         Date: startDate || '',
//         'Voucher No': '',
//         Particulars: ob >= 0 ? 'CR Opening Balance' : 'DR Opening Balance',
//         Debit: ob < 0 ? Math.abs(ob) : '',
//         Credit: ob >= 0 ? Math.abs(ob) : '',
//         'Running Balance': Math.abs(ob) + (ob >= 0 ? ' CR' : ' DR')
//       });
      
//       let runningBalance = ob;
//       if (item.ledger_entries) {
//         item.ledger_entries.filter(e => !e.is_opening).forEach(entry => {
//           const deb = parseFloat(entry.debit) || 0;
//           const cre = parseFloat(entry.credit) || 0;
//           runningBalance += (cre - deb);
//           exportData.push({
//             Date: entry.date,
//             'Voucher No': entry.vch_no ? `${entry.vch_type} - ${entry.vch_no}` : entry.vch_type,
//             Particulars: entry.particulars,
//             Debit: deb > 0 ? deb : '',
//             Credit: cre > 0 ? cre : '',
//             'Running Balance': Math.abs(runningBalance).toFixed(2) + (runningBalance >= 0 ? ' CR' : ' DR')
//           });
//         });
//       }
      
//       exportData.push({
//         Date: endDate || '',
//         'Voucher No': '',
//         Particulars: runningBalance >= 0 ? 'CR Closing Balance' : 'DR Closing Balance',
//         Debit: runningBalance < 0 ? Math.abs(runningBalance) : '',
//         Credit: runningBalance >= 0 ? Math.abs(runningBalance) : '',
//         'Running Balance': Math.abs(runningBalance).toFixed(2) + (runningBalance >= 0 ? ' CR' : ' DR')
//       });
      
//       exportData.push({ Date: '', 'Voucher No': '', Particulars: '', Debit: '', Credit: '', 'Running Balance': '' });
//     });

//     const ws = XLSXUtils.json_to_sheet(exportData);
//     const wb = XLSXUtils.book_new();
//     XLSXUtils.book_append_sheet(wb, ws, 'Ledger');
//     XLSXWriteFile(wb, 'Ledger_Report.xlsx');
//   };

//   // Prepare date‑wise entries when needed
//   const dateWiseEntries = data
//     .flatMap((item) =>
//       (item.ledger_entries || []).map((entry) => ({
//         ...entry,
//         project_name: item.project.project_name,
//         work_place: item.project.work_place,
//       }))
//     )
//     .sort((a, b) => new Date(a.date) - new Date(b.date));

//   return (
//     <>
//       <CCard className="mb-4">
//         <CCardHeader>
//           <h4 className="mb-0">Regular Project Ledger Report</h4>
//         </CCardHeader>
//         <CCardBody>
//           {/* Filters */}
//           <CRow className="g-3 mb-4">
//             <CCol md={4}>
//               <CFormLabel>Project</CFormLabel>
//               <Select
//                 placeholder="Select Project..."
//                 options={projects.map(p => ({ value: p.id, label: `${p.project_name} - ${p.customer_name}` }))}
//                 value={filterProject}
//                 onChange={selected => setFilterProject(selected)}
//                 isClearable
//               />
//             </CCol>
//             <CCol md={2}>
//               <CFormLabel>Financial Year</CFormLabel>
//               <Select
//                 placeholder="Select FY"
//                 options={financialYears}
//                 value={filterFinancialYear}
//                 onChange={handleFYChange}
//                 isClearable
//               />
//             </CCol>
//             <CCol md={2}>
//               <CFormLabel>Start Date</CFormLabel>
//               <CFormInput type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
//             </CCol>
//             <CCol md={2}>
//               <CFormLabel>End Date</CFormLabel>
//               <CFormInput type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
//             </CCol>
//             <CCol md={4} className="d-flex align-items-end gap-2">
//               <CButton color="primary" onClick={fetchLedgerReport} disabled={loading}>
//                 {loading ? 'Loading...' : 'Apply Filters'}
//               </CButton>
//               <CButton color="info" onClick={generatePdf} disabled={loading} className="text-white">PDF</CButton>
//               <CButton color="success" onClick={exportExcel} disabled={loading} className="text-white">Excel</CButton>
//             </CCol>
//           </CRow>

//           {/* View mode toggle */}
//           <CButtonGroup className="mb-4">
//             <CButton color={viewMode === 'project' ? 'info' : 'secondary'} onClick={() => setViewMode('project')}>
//               Project View
//             </CButton>
//             <CButton color={viewMode === 'date' ? 'info' : 'secondary'} onClick={() => setViewMode('date')}>
//               Date View
//             </CButton>
//           </CButtonGroup>

//           {/* Grand Total Summary */}
//           {Object.keys(grandTotal).length > 0 && (
//             <CCard className="mb-4 border-primary">
//               <CCardHeader className="bg-light"><strong>Grand Total Summary</strong></CCardHeader>
//               <CCardBody>
//                 <CRow className="text-center">
//                   <CCol md={2}><h6>Projects</h6><h3>{grandTotal.project_count}</h3></CCol>
//                   <CCol md={2}><h6>Project Cost</h6><h4>₹{formatCurrency(grandTotal.total_project_cost)}</h4></CCol>
//                   <CCol md={2}><h6>Orders Amount</h6><h4>₹{formatCurrency(grandTotal.total_orders_amount)}</h4></CCol>
//                   <CCol md={2}><h6>Total Expense</h6><h4 className="text-danger">₹{formatCurrency(grandTotal.total_expense_amount)}</h4></CCol>
//                   <CCol md={2}>
//                     <h6>Net Balance</h6>
//                     <h4 className={grandTotal.net_balance >= 0 ? 'text-success' : 'text-danger'}>
//                       ₹{formatCurrency(grandTotal.net_balance)}
//                     </h4>
//                   </CCol>
//                   <CCol md={2}>
//                     <h6>Status</h6>
//                     <CBadge color={grandTotal.overall_status === 'profit' ? 'success' : 'danger'} size="lg">
//                       {grandTotal.overall_status?.toUpperCase()}
//                     </CBadge>
//                   </CCol>
//                 </CRow>
//               </CCardBody>
//             </CCard>
//           )}

//           {/* Conditional rendering */}
//           {viewMode === 'project' ? (
//             <CCard>
//               <CCardHeader><strong>Project Ledger Summary</strong></CCardHeader>
//               <CCardBody>
//                 <CTable bordered hover responsive>
//                   <CTableHead>
//                     <CTableRow>
//                       <CTableHeaderCell>Project Name</CTableHeaderCell>
//                       <CTableHeaderCell>Customer</CTableHeaderCell>
//                       <CTableHeaderCell className="text-end">Work Order</CTableHeaderCell>
//                       <CTableHeaderCell className="text-end">Received</CTableHeaderCell>
//                       <CTableHeaderCell className="text-end">Expense</CTableHeaderCell>
//                       <CTableHeaderCell className="text-end">Net Balance</CTableHeaderCell>
//                       <CTableHeaderCell className="text-center">Status</CTableHeaderCell>
//                       <CTableHeaderCell className="text-center">Action</CTableHeaderCell>
//                     </CTableRow>
//                   </CTableHead>
//                   <CTableBody>
//                     {data.map((item) => {
//                       const project = item.project;
//                       const summary = item.summary;
//                       const isExpanded = expandedProjects.has(project.id);
//                       return (
//                         <React.Fragment key={project.id}>
//                           <CTableRow style={{ cursor: 'pointer' }} onClick={() => toggleExpand(project.id)}>
//                             <CTableDataCell>
//                               <strong>{project.project_name}</strong><br />
//                               <small className="text-muted">{project.work_place}</small>
//                             </CTableDataCell>
//                             <CTableDataCell>
//                               {project.customer_name}<br />
//                               <small>{project.mobile_number}</small>
//                             </CTableDataCell>
//                             <CTableDataCell className="text-end">₹{formatCurrency(summary.total_orders_amount)}</CTableDataCell>
//                             <CTableDataCell className="text-end">₹{formatCurrency(summary.total_received_amount)}</CTableDataCell>
//                             <CTableDataCell className="text-end text-danger">₹{formatCurrency(summary.total_expense_amount)}</CTableDataCell>
//                             <CTableDataCell className="text-end fw-bold">₹{formatCurrency(summary.net_balance)}</CTableDataCell>
//                             <CTableDataCell className="text-center">
//                               <CBadge color={summary.balance_status === 'profit' ? 'success' : 'danger'}>
//                                 {summary.balance_status.toUpperCase()}
//                               </CBadge>
//                             </CTableDataCell>
//                             <CTableDataCell className="text-center">{isExpanded ? '▲' : '▼'}</CTableDataCell>
//                           </CTableRow>
//                           {/* Ledger Details */}
//                           <CTableRow>
//                             <CTableDataCell colSpan="8" className="p-0">
//                               <CCollapse visible={isExpanded}>
//                                 <div className="p-4 bg-light">
//                                   <h5 className="mb-3">Ledger Entries</h5>
//                                   <CTable bordered hover responsive size="sm" className="bg-white">
//                                     <CTableHead color="dark">
//                                       <CTableRow>
//                                         <CTableHeaderCell>Date</CTableHeaderCell>
//                                         <CTableHeaderCell>Particulars</CTableHeaderCell>
//                                         <CTableHeaderCell>Vch Type</CTableHeaderCell>
//                                         <CTableHeaderCell>Vch No.</CTableHeaderCell>
//                                         <CTableHeaderCell className="text-end">Debit</CTableHeaderCell>
//                                         <CTableHeaderCell className="text-end">Credit</CTableHeaderCell>
//                                         <CTableHeaderCell className="text-end">Balance</CTableHeaderCell>
//                                       </CTableRow>
//                                     </CTableHead>
//                                     <CTableBody>
//                                       <CTableRow>
//                                         <CTableDataCell className="fw-bold">{startDate || ''}</CTableDataCell>
//                                         <CTableDataCell className="fw-bold text-center" colSpan="3">
//                                           {parseFloat(summary.opening_balance) >= 0 ? 'DR Opening Balance' : 'CR Opening Balance'}
//                                         </CTableDataCell>
//                                         <CTableDataCell className="text-end fw-bold">
//                                           {parseFloat(summary.opening_balance) > 0 ? formatCurrency(summary.opening_balance) : '-'}
//                                         </CTableDataCell>
//                                         <CTableDataCell className="text-end fw-bold">
//                                           {parseFloat(summary.opening_balance) < 0 ? formatCurrency(Math.abs(summary.opening_balance)) : '-'}
//                                         </CTableDataCell>
//                                         <CTableDataCell className="text-end fw-bold">₹{formatCurrency(Math.abs(summary.opening_balance))}</CTableDataCell>
//                                       </CTableRow>
                                      
//                                       {item.ledger_entries && item.ledger_entries.length > 0 ? (
//                                         item.ledger_entries.map((entry, idx) => (
//                                           <CTableRow key={idx}>
//                                             <CTableDataCell>{entry.date}</CTableDataCell>
//                                             <CTableDataCell>{entry.particulars}</CTableDataCell>
//                                             <CTableDataCell>{entry.vch_type}</CTableDataCell>
//                                             <CTableDataCell>{entry.vch_no}</CTableDataCell>
//                                             <CTableDataCell className="text-end">
//                                               {entry.debit > 0 ? formatCurrency(entry.debit) : ''}
//                                             </CTableDataCell>
//                                             <CTableDataCell className="text-end">
//                                               {entry.credit > 0 ? formatCurrency(entry.credit) : ''}
//                                             </CTableDataCell>
//                                             <CTableDataCell className="text-end text-muted">₹{formatCurrency(Math.abs(entry.balance))} {entry.balance >= 0 ? 'DR' : 'CR'}</CTableDataCell>
//                                           </CTableRow>
//                                         ))
//                                       ) : (
//                                         <CTableRow>
//                                           <CTableDataCell colSpan="7" className="text-center text-muted py-3">
//                                             No ledger entries found
//                                           </CTableDataCell>
//                                         </CTableRow>
//                                       )}

//                                       <CTableRow className="table-active">
//                                         <CTableDataCell className="fw-bold">{endDate || ''}</CTableDataCell>
//                                         <CTableDataCell className="fw-bold text-center" colSpan="3">
//                                           {parseFloat(summary.closing_balance) >= 0 ? 'DR Closing Balance' : 'CR Closing Balance'}
//                                         </CTableDataCell>
//                                         <CTableDataCell className="text-end fw-bold">
//                                           {parseFloat(summary.closing_balance) > 0 ? formatCurrency(summary.closing_balance) : '-'}
//                                         </CTableDataCell>
//                                         <CTableDataCell className="text-end fw-bold">
//                                           {parseFloat(summary.closing_balance) < 0 ? formatCurrency(Math.abs(summary.closing_balance)) : '-'}
//                                         </CTableDataCell>
//                                         <CTableDataCell className="text-end fw-bold">₹{formatCurrency(Math.abs(summary.closing_balance))}</CTableDataCell>
//                                       </CTableRow>
//                                     </CTableBody>
//                                   </CTable>
//                                 </div>
//                               </CCollapse>
//                             </CTableDataCell>
//                           </CTableRow>
//                         </React.Fragment>
//                       );
//                     })}
//                     {data.length === 0 && !loading && (
//                       <CTableRow>
//                         <CTableDataCell colSpan="8" className="text-center py-5 text-muted">No projects found.</CTableDataCell>
//                       </CTableRow>
//                     )}
//                   </CTableBody>
//                 </CTable>
//               </CCardBody>
//             </CCard>
//           ) : (
//             // Date‑wise view
//             <CCard>
//               <CCardHeader><strong>Date‑wise Ledger</strong></CCardHeader>
//               <CCardBody>
//                 <CTable bordered hover responsive>
//                   <CTableHead color="dark">
//                     <CTableRow>
//                       <CTableHeaderCell>Date</CTableHeaderCell>
//                       <CTableHeaderCell>Project</CTableHeaderCell>
//                       <CTableHeaderCell>Particulars</CTableHeaderCell>
//                       <CTableHeaderCell>Vch Type</CTableHeaderCell>
//                       <CTableHeaderCell>Vch No.</CTableHeaderCell>
//                       <CTableHeaderCell className="text-end">Debit</CTableHeaderCell>
//                       <CTableHeaderCell className="text-end">Credit</CTableHeaderCell>
//                       <CTableHeaderCell className="text-end">Balance</CTableHeaderCell>
//                     </CTableRow>
//                   </CTableHead>
//                   <CTableBody>
//                     {dateWiseEntries.map((entry, idx) => (
//                       <CTableRow key={idx}>
//                         <CTableDataCell>{entry.date}</CTableDataCell>
//                         <CTableDataCell>{entry.project_name}<br /><small className="text-muted">{entry.work_place}</small></CTableDataCell>
//                         <CTableDataCell>{entry.particulars}</CTableDataCell>
//                         <CTableDataCell>{entry.vch_type}</CTableDataCell>
//                         <CTableDataCell>{entry.vch_no}</CTableDataCell>
//                         <CTableDataCell className="text-end">
//                           {entry.debit > 0 ? formatCurrency(entry.debit) : ''}
//                         </CTableDataCell>
//                         <CTableDataCell className="text-end">
//                           {entry.credit > 0 ? formatCurrency(entry.credit) : ''}
//                         </CTableDataCell>
//                         <CTableDataCell className="text-end fw-bold">₹{formatCurrency(Math.abs(entry.balance))} {entry.balance >= 0 ? 'DR' : 'CR'}</CTableDataCell>
//                       </CTableRow>
//                     ))}
//                     {dateWiseEntries.length === 0 && !loading && (
//                       <CTableRow>
//                         <CTableDataCell colSpan="8" className="text-center py-5 text-muted">No ledger entries found.</CTableDataCell>
//                       </CTableRow>
//                     )}
//                   </CTableBody>
//                 </CTable>
//               </CCardBody>
//             </CCard>
//           )}
//         </CCardBody>
//       </CCard>
//     </>
//   );
// };

// export default LedgerReport;









import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CRow,
  CCol,
  CFormInput,
  CFormLabel,
  CButton,
  CButtonGroup,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CCollapse,
  CBadge,
} from '@coreui/react';
import { getAPICall } from '../../../util/api';
import Select from 'react-select';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { utils as XLSXUtils, writeFile as XLSXWriteFile } from 'xlsx';
import { getUserData } from '../../../util/session';
import { host } from '../../../util/constants';

// ---- Financial Year helpers ----
// Indian FY runs Apr 1 -> Mar 31. Builds a dropdown list like
// "2026-2027", "2025-2026", ... going back N years from the current FY.
const getCurrentFYStartYear = () => {
  const now = new Date();
  const month = now.getMonth(); // 0 = Jan ... 11 = Dec
  const year = now.getFullYear();
  // If we're in Jan/Feb/Mar, the FY started last calendar year.
  return month < 3 ? year - 1 : year;
};

const buildFinancialYears = (yearsBack = 8) => {
  const currentFYStart = getCurrentFYStartYear();
  const list = [];
  for (let i = 0; i < yearsBack; i++) {
    const startYear = currentFYStart - i;
    const endYear = startYear + 1;
    list.push({
      value: `${startYear}-04-01_${endYear}-03-31`,
      label: `${startYear}-${endYear}`,
      startDate: `${startYear}-04-01`,
      endDate: `${endYear}-03-31`,
    });
  }
  return list;
};

const VOUCHER_TYPE_OPTIONS = [
  { value: 'Receipt', label: 'Receipt' },
  { value: 'Payment', label: 'Payment' },
  { value: 'Sales', label: 'Sales' },
  { value: 'Purchase', label: 'Purchase' },
  { value: 'Journal', label: 'Journal' },
  { value: 'Credit Note', label: 'Credit Note' },
];

const TRANSACTION_TYPE_OPTIONS = [
  { value: 'debit', label: 'Debit' },
  { value: 'credit', label: 'Credit' },
];

const LedgerReport = () => {
  const [data, setData] = useState([]);
  const [grandTotal, setGrandTotal] = useState({});
  const [loading, setLoading] = useState(false);
  const [expandedProjects, setExpandedProjects] = useState(new Set());
  const [viewMode, setViewMode] = useState('project'); // 'project' or 'date'

  // Filter fields
  const [filterProject, setFilterProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterVoucherType, setFilterVoucherType] = useState(null);
  const [filterTransactionType, setFilterTransactionType] = useState(null);

  // Financial Year filter
  const [financialYears] = useState(() => buildFinancialYears());
  const [filterFinancialYear, setFilterFinancialYear] = useState(null);

  const handleFYChange = (selected) => {
    setFilterFinancialYear(selected);
    if (selected) {
      setStartDate(selected.startDate);
      setEndDate(selected.endDate);
    } else {
      setStartDate('');
      setEndDate('');
    }
  };

  const getAuthToken = () => localStorage.getItem('auth_token');

  const fetchLedgerReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterProject?.value) params.append("project_id", filterProject.value);
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);
      if (filterVoucherType) params.append("voucher_type", filterVoucherType.value);
      if (filterTransactionType) params.append("transaction_type", filterTransactionType.value);

      const response = await getAPICall(`/api/RegularProjectLedgerReport?${params.toString()}`);
      setData(response.data || []);
      setGrandTotal(response.data.grand_total || {});
    } catch (error) {
      console.error('Error fetching ledger report:', error);
      if (error.response?.status === 401) {
        alert('Session expired. Please login again.');
      } else {
        alert('Failed to load ledger report');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch projects list for dropdown
  const fetchProjects = async () => {
    try {
      const response = await getAPICall('/api/projects');
      setProjects(response || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchLedgerReport();
  }, []);

  const toggleExpand = (projectId) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectId)) newExpanded.delete(projectId);
    else newExpanded.add(projectId);
    setExpandedProjects(newExpanded);
  };

  const formatCurrency = (amount) =>
    Number(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Generate PDF
  const generatePdf = () => {
    // Landscape A4 for wide columns
    const doc = new jsPDF('landscape', 'pt', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 30;
    const user = getUserData();
    const companyInfo = user?.company_info || {};

    if (data.length === 0) {
      doc.text("No data available", pageWidth / 2, pageHeight / 2, { align: "center" });
      doc.save("Ledger.pdf");
      return;
    }

    const drawHeader = (project) => {
      let currentY = margin + 15;

      // Top Center: Company Name & Report Name
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(companyInfo.company_name || "Deshmukh Infra Solutions LLP", pageWidth / 2, currentY, { align: "center" });
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text("General Ledger", pageWidth / 2, currentY + 12, { align: "center" });

      // Top Right: Page Info
      doc.setFontSize(8);
      const today = new Date();
      doc.text(`Date - ${today.toLocaleDateString()}`, pageWidth - margin, currentY, { align: "right" });
      doc.text(`Time - ${today.toLocaleTimeString()}`, pageWidth - margin, currentY + 10, { align: "right" });

      const dateRangeStr = (startDate && endDate) ? `${startDate} To ${endDate}` : (startDate ? `From ${startDate}` : (endDate ? `Up to ${endDate}` : 'All Dates'));
      doc.text(`Period - ${dateRangeStr}`, pageWidth - margin, currentY + 20, { align: "right" });

      currentY += 25;

      // Top Left: Project Info
      doc.setFont("helvetica", "bold");
      doc.text(`Project: ${project?.project_name || "-"}`, margin, currentY);
      doc.setFont("helvetica", "normal");
      doc.text(`Customer: ${project?.customer_name || "-"}`, margin, currentY + 12);
      doc.text(`Address: ${project?.work_place || "-"}`, margin, currentY + 24);

      currentY += 40;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      return currentY;
    };

    data.forEach((item, index) => {
      if (index > 0) doc.addPage();
      let yPosition = drawHeader(item.project);

      // Assume normal balance is Credit (Income). Net = Income - Expenses
      let runningBalance = parseFloat(item.summary.opening_balance) || 0;

      const formatBal = (bal) => {
          if (Math.abs(bal) < 0.01) return "0.00";
          return Math.abs(bal).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + (bal >= 0 ? " CR" : " DR");
      };

      const columns = ['Date', 'Particulars', 'Vch Type', 'Vch No.', 'Debit', 'Credit', 'Running Balance'];
      const rows = [];

      // Balance Forward (Opening Balance)
      rows.push([
          startDate || '',
          parseFloat(runningBalance) >= 0 ? 'CR Opening Balance' : 'DR Opening Balance',
          '',
          '',
          runningBalance < 0 ? formatCurrency(Math.abs(runningBalance)) : '',
          runningBalance > 0 ? formatCurrency(runningBalance) : '',
          formatBal(runningBalance)
      ]);

      let periodTotalDebit = 0;
      let periodTotalCredit = 0;

      item.ledger_entries.forEach(entry => {
          let deb = parseFloat(entry.debit) || 0;
          let cre = parseFloat(entry.credit) || 0;

          periodTotalDebit += deb;
          periodTotalCredit += cre;

          runningBalance += (cre - deb); // CR increases balance, DR decreases

          rows.push([
              entry.date || '',
              entry.particulars || '',
              entry.vch_type || '',
              entry.vch_no || '',
              deb > 0 ? formatCurrency(deb) : '',
              cre > 0 ? formatCurrency(cre) : '',
              formatBal(runningBalance)
          ]);
      });

      // Period Total Transactions
      rows.push([
          '',
          'Period Total Transactions',
          '',
          '',
          periodTotalDebit > 0 ? formatCurrency(periodTotalDebit) : '',
          periodTotalCredit > 0 ? formatCurrency(periodTotalCredit) : '',
          ''
      ]);

      // Period End Balance (Closing Balance)
      rows.push([
          endDate || '',
          'Period End Balance',
          '',
          '',
          '',
          '',
          formatBal(runningBalance)
      ]);

      doc.autoTable({
        startY: yPosition,
        head: [columns],
        body: rows,
        theme: 'plain',
        tableWidth: pageWidth - margin * 2,
        styles: {
            font: 'helvetica',
            fontSize: 8,
            fontStyle: 'normal',
            cellPadding: 4,
            textColor: 0,
            overflow: 'linebreak',
            valign: 'top',
        },
        headStyles: {
            fontStyle: 'bold'
        },
        columnStyles: {
            0: { cellWidth: 70, halign: 'left' },    // Date
            1: { cellWidth: 260, halign: 'left' },   // Particulars
            2: { cellWidth: 70, halign: 'center' },  // Vch Type
            3: { cellWidth: 70, halign: 'center' },  // Vch No
            4: { cellWidth: 80, halign: 'left' },   // Debit
            5: { cellWidth: 80, halign: 'left' },   // Credit
            6: { cellWidth: 90, halign: 'left' },   // Balance
        },
        didParseCell: function(data) {
            if (data.row.section === 'body') {
                const rowIndex = data.row.index;
                const isSpecialRow = (rowIndex === 0 || rowIndex >= rows.length - 2);
                data.cell.styles.fontStyle = isSpecialRow ? 'bold' : 'normal';
            }
        },
        willDrawCell: function(data) {
            // Dash function compatible with older jsPDF
            const setDash = () => {
               if (typeof doc.setLineDashPattern === 'function') doc.setLineDashPattern([3, 3], 0);
               else if (typeof doc.setLineDash === 'function') doc.setLineDash([3, 3], 0);
            };
            const resetDash = () => {
               if (typeof doc.setLineDashPattern === 'function') doc.setLineDashPattern([], 0);
               else if (typeof doc.setLineDash === 'function') doc.setLineDash([], 0);
            };

            // Draw horizontal dashed lines for headers
            if (data.row.section === 'head') {
                doc.setDrawColor(0);
                doc.setLineWidth(0.5);
                setDash();
                doc.line(data.cell.x, data.cell.y, data.cell.x + data.cell.width, data.cell.y);
                doc.line(data.cell.x, data.cell.y + data.cell.height, data.cell.x + data.cell.width, data.cell.y + data.cell.height);
                resetDash();
                return;
            }

            const rowIndex = data.row.index;
            const isSpecialRow = (rowIndex === 0 || rowIndex >= rows.length - 2);
            doc.setFont("helvetica", isSpecialRow ? "bold" : "normal");

            if (rowIndex === rows.length - 2) {
                doc.setDrawColor(0);
                doc.setLineWidth(0.5);
                setDash();
                doc.line(data.cell.x, data.cell.y, data.cell.x + data.cell.width, data.cell.y);
                resetDash();
            }
        },
        didDrawPage: (data) => {
           doc.setFontSize(8);
           doc.setFont("helvetica", "normal");
           doc.text(`Page - ${doc.getCurrentPageInfo().pageNumber}`, pageWidth - margin, margin, { align: 'right' });
        },
        margin: { top: margin, left: margin, right: margin }
      });
    });

    const today = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
    doc.save(`General_Ledger_${today}.pdf`);
  };

  // Export to Excel
  const exportExcel = () => {
    const exportData = [];
    data.forEach(item => {
      exportData.push({
        Date: '',
        'Voucher No': '',
        Particulars: `Vendor: ${item.vendor.name} - ${item.vendor.mobile}`,
        Debit: '',
        Credit: '',
        'Running Balance': ''
      });

      const ob = parseFloat(item.summary.opening_balance) || 0;
      exportData.push({
        Date: startDate || '',
        'Voucher No': '',
        Particulars: ob >= 0 ? 'CR Opening Balance' : 'DR Opening Balance',
        Debit: ob < 0 ? Math.abs(ob) : '',
        Credit: ob >= 0 ? Math.abs(ob) : '',
        'Running Balance': Math.abs(ob) + (ob >= 0 ? ' CR' : ' DR')
      });

      let runningBalance = ob;
      if (item.ledger_entries) {
        item.ledger_entries.filter(e => !e.is_opening).forEach(entry => {
          const deb = parseFloat(entry.debit) || 0;
          const cre = parseFloat(entry.credit) || 0;
          runningBalance += (cre - deb);
          exportData.push({
            Date: entry.date,
            'Voucher No': entry.vch_no ? `${entry.vch_type} - ${entry.vch_no}` : entry.vch_type,
            Particulars: entry.particulars,
            Debit: deb > 0 ? deb : '',
            Credit: cre > 0 ? cre : '',
            'Running Balance': Math.abs(runningBalance).toFixed(2) + (runningBalance >= 0 ? ' CR' : ' DR')
          });
        });
      }

      exportData.push({
        Date: endDate || '',
        'Voucher No': '',
        Particulars: runningBalance >= 0 ? 'CR Closing Balance' : 'DR Closing Balance',
        Debit: runningBalance < 0 ? Math.abs(runningBalance) : '',
        Credit: runningBalance >= 0 ? Math.abs(runningBalance) : '',
        'Running Balance': Math.abs(runningBalance).toFixed(2) + (runningBalance >= 0 ? ' CR' : ' DR')
      });

      exportData.push({ Date: '', 'Voucher No': '', Particulars: '', Debit: '', Credit: '', 'Running Balance': '' });
    });

    const ws = XLSXUtils.json_to_sheet(exportData);
    const wb = XLSXUtils.book_new();
    XLSXUtils.book_append_sheet(wb, ws, 'Ledger');
    XLSXWriteFile(wb, 'Ledger_Report.xlsx');
  };

  // Prepare date‑wise entries when needed
  const dateWiseEntries = data
    .flatMap((item) =>
      (item.ledger_entries || []).map((entry) => ({
        ...entry,
        project_name: item.project.project_name,
        work_place: item.project.work_place,
      }))
    )
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <>
      <CCard className="mb-4">
        <CCardHeader>
          <h4 className="mb-0">Regular Project Ledger Report</h4>
        </CCardHeader>
        <CCardBody>
          {/* Filters */}
          <CRow className="g-3 mb-4">
            <CCol md={4}>
              <CFormLabel>Project</CFormLabel>
              <Select
                placeholder="Select Project..."
                options={projects.map(p => ({ value: p.id, label: `${p.project_name} - ${p.customer_name}` }))}
                value={filterProject}
                onChange={selected => setFilterProject(selected)}
                isClearable
              />
            </CCol>
            <CCol md={2}>
              <CFormLabel>Financial Year</CFormLabel>
              <Select
                placeholder="Select FY"
                options={financialYears}
                value={filterFinancialYear}
                onChange={handleFYChange}
                isClearable
              />
            </CCol>
            <CCol md={2}>
              <CFormLabel>Start Date</CFormLabel>
              <CFormInput type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </CCol>
            <CCol md={2}>
              <CFormLabel>End Date</CFormLabel>
              <CFormInput type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </CCol>
            <CCol md={4} className="d-flex align-items-end gap-2">
              <CButton color="primary" onClick={fetchLedgerReport} disabled={loading}>
                {loading ? 'Loading...' : 'Apply Filters'}
              </CButton>
              <CButton color="info" onClick={generatePdf} disabled={loading} className="text-white">PDF</CButton>
              <CButton color="success" onClick={exportExcel} disabled={loading} className="text-white">Excel</CButton>
            </CCol>
          </CRow>

          {/* View mode toggle */}
          <CButtonGroup className="mb-4">
            <CButton color={viewMode === 'project' ? 'info' : 'secondary'} onClick={() => setViewMode('project')}>
              Project View
            </CButton>
            <CButton color={viewMode === 'date' ? 'info' : 'secondary'} onClick={() => setViewMode('date')}>
              Date View
            </CButton>
          </CButtonGroup>

          {/* Grand Total Summary */}
          {Object.keys(grandTotal).length > 0 && (
            <CCard className="mb-4 border-primary">
              <CCardHeader className="bg-light"><strong>Grand Total Summary</strong></CCardHeader>
              <CCardBody>
                <CRow className="text-center">
                  <CCol md={2}><h6>Projects</h6><h3>{grandTotal.project_count}</h3></CCol>
                  <CCol md={2}><h6>Project Cost</h6><h4>₹{formatCurrency(grandTotal.total_project_cost)}</h4></CCol>
                  <CCol md={2}><h6>Orders Amount</h6><h4>₹{formatCurrency(grandTotal.total_orders_amount)}</h4></CCol>
                  <CCol md={2}><h6>Total Expense</h6><h4 className="text-danger">₹{formatCurrency(grandTotal.total_expense_amount)}</h4></CCol>
                  <CCol md={2}>
                    <h6>Net Balance</h6>
                    <h4 className={grandTotal.net_balance >= 0 ? 'text-success' : 'text-danger'}>
                      ₹{formatCurrency(grandTotal.net_balance)}
                    </h4>
                  </CCol>
                  <CCol md={2}>
                    <h6>Status</h6>
                    <CBadge color={grandTotal.overall_status === 'profit' ? 'success' : 'danger'} size="lg">
                      {grandTotal.overall_status?.toUpperCase()}
                    </CBadge>
                  </CCol>
                </CRow>
              </CCardBody>
            </CCard>
          )}

          {/* Conditional rendering */}
          {viewMode === 'project' ? (
            <CCard>
              <CCardHeader><strong>Project Ledger Summary</strong></CCardHeader>
              <CCardBody>
                <CTable bordered hover responsive>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Project Name</CTableHeaderCell>
                      <CTableHeaderCell>Customer</CTableHeaderCell>
                      <CTableHeaderCell className="text-end">Work Order</CTableHeaderCell>
                      <CTableHeaderCell className="text-end">Received</CTableHeaderCell>
                      <CTableHeaderCell className="text-end">Expense</CTableHeaderCell>
                      <CTableHeaderCell className="text-end">Net Balance</CTableHeaderCell>
                      <CTableHeaderCell className="text-center">Status</CTableHeaderCell>
                      <CTableHeaderCell className="text-center">Action</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {data.map((item) => {
                      const project = item.project;
                      const summary = item.summary;
                      const isExpanded = expandedProjects.has(project.id);
                      return (
                        <React.Fragment key={project.id}>
                          <CTableRow style={{ cursor: 'pointer' }} onClick={() => toggleExpand(project.id)}>
                            <CTableDataCell>
                              <strong>{project.project_name}</strong><br />
                              <small className="text-muted">{project.work_place}</small>
                            </CTableDataCell>
                            <CTableDataCell>
                              {project.customer_name}<br />
                              <small>{project.mobile_number}</small>
                            </CTableDataCell>
                            <CTableDataCell className="text-end">₹{formatCurrency(summary.total_orders_amount)}</CTableDataCell>
                            <CTableDataCell className="text-end">₹{formatCurrency(summary.total_received_amount)}</CTableDataCell>
                            <CTableDataCell className="text-end text-danger">₹{formatCurrency(summary.total_expense_amount)}</CTableDataCell>
                            <CTableDataCell className="text-end fw-bold">₹{formatCurrency(summary.net_balance)}</CTableDataCell>
                            <CTableDataCell className="text-center">
                              <CBadge color={summary.balance_status === 'profit' ? 'success' : 'danger'}>
                                {summary.balance_status.toUpperCase()}
                              </CBadge>
                            </CTableDataCell>
                            <CTableDataCell className="text-center">{isExpanded ? '▲' : '▼'}</CTableDataCell>
                          </CTableRow>
                          {/* Ledger Details */}
                          <CTableRow>
                            <CTableDataCell colSpan="8" className="p-0">
                              <CCollapse visible={isExpanded}>
                                <div className="p-4 bg-light">
                                  <h5 className="mb-3">Ledger Entries</h5>
                                  <CTable bordered hover responsive size="sm" className="bg-white">
                                    <CTableHead color="dark">
                                      <CTableRow>
                                        <CTableHeaderCell>Date</CTableHeaderCell>
                                        <CTableHeaderCell>Particulars</CTableHeaderCell>
                                        <CTableHeaderCell>Vch Type</CTableHeaderCell>
                                        <CTableHeaderCell>Vch No.</CTableHeaderCell>
                                        <CTableHeaderCell className="text-end">Debit</CTableHeaderCell>
                                        <CTableHeaderCell className="text-end">Credit</CTableHeaderCell>
                                        <CTableHeaderCell className="text-end">Balance</CTableHeaderCell>
                                      </CTableRow>
                                    </CTableHead>
                                    <CTableBody>
                                      <CTableRow>
                                        <CTableDataCell className="fw-bold">{startDate || ''}</CTableDataCell>
                                        <CTableDataCell className="fw-bold text-center" colSpan="3">
                                          {parseFloat(summary.opening_balance) >= 0 ? 'DR Opening Balance' : 'CR Opening Balance'}
                                        </CTableDataCell>
                                        <CTableDataCell className="text-end fw-bold">
                                          {parseFloat(summary.opening_balance) > 0 ? formatCurrency(summary.opening_balance) : '-'}
                                        </CTableDataCell>
                                        <CTableDataCell className="text-end fw-bold">
                                          {parseFloat(summary.opening_balance) < 0 ? formatCurrency(Math.abs(summary.opening_balance)) : '-'}
                                        </CTableDataCell>
                                        <CTableDataCell className="text-end fw-bold">₹{formatCurrency(Math.abs(summary.opening_balance))}</CTableDataCell>
                                      </CTableRow>

                                      {item.ledger_entries && item.ledger_entries.length > 0 ? (
                                        item.ledger_entries.map((entry, idx) => (
                                          <CTableRow key={idx}>
                                            <CTableDataCell>{entry.date}</CTableDataCell>
                                            <CTableDataCell>{entry.particulars}</CTableDataCell>
                                            <CTableDataCell>{entry.vch_type}</CTableDataCell>
                                            <CTableDataCell>{entry.vch_no}</CTableDataCell>
                                            <CTableDataCell className="text-end">
                                              {entry.debit > 0 ? formatCurrency(entry.debit) : ''}
                                            </CTableDataCell>
                                            <CTableDataCell className="text-end">
                                              {entry.credit > 0 ? formatCurrency(entry.credit) : ''}
                                            </CTableDataCell>
                                            <CTableDataCell className="text-end text-muted">₹{formatCurrency(Math.abs(entry.balance))} {entry.balance >= 0 ? 'DR' : 'CR'}</CTableDataCell>
                                          </CTableRow>
                                        ))
                                      ) : (
                                        <CTableRow>
                                          <CTableDataCell colSpan="7" className="text-center text-muted py-3">
                                            No ledger entries found
                                          </CTableDataCell>
                                        </CTableRow>
                                      )}

                                      <CTableRow className="table-active">
                                        <CTableDataCell className="fw-bold">{endDate || ''}</CTableDataCell>
                                        <CTableDataCell className="fw-bold text-center" colSpan="3">
                                          {parseFloat(summary.closing_balance) >= 0 ? 'DR Closing Balance' : 'CR Closing Balance'}
                                        </CTableDataCell>
                                        <CTableDataCell className="text-end fw-bold">
                                          {parseFloat(summary.closing_balance) > 0 ? formatCurrency(summary.closing_balance) : '-'}
                                        </CTableDataCell>
                                        <CTableDataCell className="text-end fw-bold">
                                          {parseFloat(summary.closing_balance) < 0 ? formatCurrency(Math.abs(summary.closing_balance)) : '-'}
                                        </CTableDataCell>
                                        <CTableDataCell className="text-end fw-bold">₹{formatCurrency(Math.abs(summary.closing_balance))}</CTableDataCell>
                                      </CTableRow>
                                    </CTableBody>
                                  </CTable>
                                </div>
                              </CCollapse>
                            </CTableDataCell>
                          </CTableRow>
                        </React.Fragment>
                      );
                    })}
                    {data.length === 0 && !loading && (
                      <CTableRow>
                        <CTableDataCell colSpan="8" className="text-center py-5 text-muted">No projects found.</CTableDataCell>
                      </CTableRow>
                    )}
                  </CTableBody>
                </CTable>
              </CCardBody>
            </CCard>
          ) : (
            // Date‑wise view
            <CCard>
              <CCardHeader><strong>Date‑wise Ledger</strong></CCardHeader>
              <CCardBody>
                <CTable bordered hover responsive>
                  <CTableHead color="dark">
                    <CTableRow>
                      <CTableHeaderCell>Date</CTableHeaderCell>
                      <CTableHeaderCell>Project</CTableHeaderCell>
                      <CTableHeaderCell>Particulars</CTableHeaderCell>
                      <CTableHeaderCell>Vch Type</CTableHeaderCell>
                      <CTableHeaderCell>Vch No.</CTableHeaderCell>
                      <CTableHeaderCell className="text-end">Debit</CTableHeaderCell>
                      <CTableHeaderCell className="text-end">Credit</CTableHeaderCell>
                      <CTableHeaderCell className="text-end">Balance</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {dateWiseEntries.map((entry, idx) => (
                      <CTableRow key={idx}>
                        <CTableDataCell>{entry.date}</CTableDataCell>
                        <CTableDataCell>{entry.project_name}<br /><small className="text-muted">{entry.work_place}</small></CTableDataCell>
                        <CTableDataCell>{entry.particulars}</CTableDataCell>
                        <CTableDataCell>{entry.vch_type}</CTableDataCell>
                        <CTableDataCell>{entry.vch_no}</CTableDataCell>
                        <CTableDataCell className="text-end">
                          {entry.debit > 0 ? formatCurrency(entry.debit) : ''}
                        </CTableDataCell>
                        <CTableDataCell className="text-end">
                          {entry.credit > 0 ? formatCurrency(entry.credit) : ''}
                        </CTableDataCell>
                        <CTableDataCell className="text-end fw-bold">₹{formatCurrency(Math.abs(entry.balance))} {entry.balance >= 0 ? 'DR' : 'CR'}</CTableDataCell>
                      </CTableRow>
                    ))}
                    {dateWiseEntries.length === 0 && !loading && (
                      <CTableRow>
                        <CTableDataCell colSpan="8" className="text-center py-5 text-muted">No ledger entries found.</CTableDataCell>
                      </CTableRow>
                    )}
                  </CTableBody>
                </CTable>
              </CCardBody>
            </CCard>
          )}
        </CCardBody>
      </CCard>
    </>
  );
};

export default LedgerReport;