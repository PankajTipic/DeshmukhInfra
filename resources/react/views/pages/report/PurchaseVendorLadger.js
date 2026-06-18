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

const PurchaseVendorLadger = () => {
  const [data, setData] = useState([]);
  const [grandTotal, setGrandTotal] = useState({});
  const [loading, setLoading] = useState(false);
  const [expandedVendors, setExpandedVendors] = useState(new Set());
  const [viewMode, setViewMode] = useState('vendor'); // 'vendor' or 'date'

  // Filter fields
  const [filterProject, setFilterProject] = useState(null);
  const [filterVendor, setFilterVendor] = useState(null);
  const [projects, setProjects] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const getAuthToken = () => localStorage.getItem('auth_token');

  const fetchLedgerReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterProject?.value) params.append("project_id", filterProject.value);
      if (filterVendor?.value) params.append("vendor_id", filterVendor.value);
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);

      const response = await getAPICall(`/api/purchase-vendor-ledger?${params.toString()}`);
      setData(response.data || []);
      setGrandTotal(response.data.grand_total || {});
    } catch (error) {
      console.error('Error fetching ledger report:', error);
      if (error.response?.status === 401) {
        alert('Session expired. Please login again.');
      } else {
        alert('Failed to load purchase vendor ledger report');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await getAPICall('/api/projects');
      setProjects(response || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchVendors = async () => {
    try {
      const response = await getAPICall('/api/getPurchesVendor');
      setVendors(response || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchVendors();
    fetchLedgerReport();
  }, []);

  const toggleExpand = (vendorId) => {
    const newExpanded = new Set(expandedVendors);
    if (newExpanded.has(vendorId)) newExpanded.delete(vendorId);
    else newExpanded.add(vendorId);
    setExpandedVendors(newExpanded);
  };

  const formatCurrency = (amount) =>
    Number(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Generate PDF
  const generatePdf = () => {
    const doc = new jsPDF('landscape', 'pt', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 30;
    const user = getUserData();
    const companyInfo = user?.company_info || {};

    if (data.length === 0) {
      doc.text("No data available", pageWidth / 2, pageHeight / 2, { align: "center" });
      doc.save("Vendor_Ledger.pdf");
      return;
    }

    const drawHeader = (vendor) => {
      let currentY = margin + 15;
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(companyInfo.company_name || "Deshmukh Infra Solutions LLP", pageWidth / 2, currentY, { align: "center" });
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text("Purchase Vendor Ledger", pageWidth / 2, currentY + 12, { align: "center" });

      doc.setFontSize(8);
      const today = new Date();
      doc.text(`Date - ${today.toLocaleDateString()}`, pageWidth - margin, currentY, { align: "right" });
      doc.text(`Time - ${today.toLocaleTimeString()}`, pageWidth - margin, currentY + 10, { align: "right" });
      
      const dateRangeStr = (startDate && endDate) ? `${startDate} To ${endDate}` : (startDate ? `From ${startDate}` : (endDate ? `Up to ${endDate}` : 'All Dates'));
      doc.text(`Period - ${dateRangeStr}`, pageWidth - margin, currentY + 20, { align: "right" });

      currentY += 25;

      doc.setFont("helvetica", "bold");
      doc.text(`Vendor: ${vendor?.name || "-"}`, margin, currentY);
      doc.setFont("helvetica", "normal");
      doc.text(`Mobile: ${vendor?.mobile || "-"}`, margin, currentY + 12);
      doc.text(`Address: ${vendor?.address || "-"}`, margin, currentY + 24);

      currentY += 40;
      return currentY;
    };

    data.forEach((item, index) => {
      if (index > 0) doc.addPage();
      let yPosition = drawHeader(item.vendor);

      let runningBalance = parseFloat(item.summary.opening_balance) || 0;
      
      const formatBal = (bal) => {
          if (Math.abs(bal) < 0.01) return "0.00";
          return Math.abs(bal).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + (bal >= 0 ? " Cr" : " Dr");
      };

      const columns = ['Date', 'Particulars', 'Vch Type', 'Vch No.', 'Debit', 'Credit', 'Balance'];
      const rows = [];

      rows.push([
          startDate || '',
          'Balance Forward',
          '',
          '',
          runningBalance < 0 ? formatCurrency(Math.abs(runningBalance)) : '',
          runningBalance > 0 ? formatCurrency(runningBalance) : '',
          formatBal(runningBalance)
      ]);

      let periodTotalDebit = 0;
      let periodTotalCredit = 0;

      item.ledger_entries.forEach(entry => {
          // Exclude opening balance row from ledger_entries if it was added by controller
          if (entry.is_opening) return;

          let deb = parseFloat(entry.debit) || 0;
          let cre = parseFloat(entry.credit) || 0;
          
          periodTotalDebit += deb;
          periodTotalCredit += cre;
          
          runningBalance += (cre - deb); 

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

      rows.push([
          '',
          'Period Total Transactions',
          '',
          '',
          periodTotalDebit > 0 ? formatCurrency(periodTotalDebit) : '',
          periodTotalCredit > 0 ? formatCurrency(periodTotalCredit) : '',
          ''
      ]);

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
        styles: {
            font: 'helvetica',
            fontSize: 8,
            cellPadding: 4,
            textColor: 0, 
        },
        headStyles: {
            fontStyle: 'bold',
            halign: 'right',
        },
        columnStyles: {
            0: { cellWidth: 70, halign: 'left' },    // Date
            1: { cellWidth: 260, halign: 'left' },   // Particulars
            2: { cellWidth: 70, halign: 'center' },  // Vch Type
            3: { cellWidth: 70, halign: 'center' },  // Vch No
            4: { cellWidth: 80, halign: 'right' },   // Debit
            5: { cellWidth: 80, halign: 'right' },   // Credit
            6: { cellWidth: 90, halign: 'right' },   // Balance
        },
        willDrawCell: function(data) {
            const setDash = () => {
               if (typeof doc.setLineDashPattern === 'function') doc.setLineDashPattern([3, 3], 0);
               else if (typeof doc.setLineDash === 'function') doc.setLineDash([3, 3], 0);
            };
            const resetDash = () => {
               if (typeof doc.setLineDashPattern === 'function') doc.setLineDashPattern([], 0);
               else if (typeof doc.setLineDash === 'function') doc.setLineDash([], 0);
            };

            if (data.row.section === 'head') {
                doc.setDrawColor(0);
                doc.setLineWidth(0.5);
                setDash();
                doc.line(data.cell.x, data.cell.y, data.cell.x + data.cell.width, data.cell.y);
                doc.line(data.cell.x, data.cell.y + data.cell.height, data.cell.x + data.cell.width, data.cell.y + data.cell.height);
                resetDash();
            }

            const rowIndex = data.row.index;
            if (rowIndex === 0 || rowIndex >= rows.length - 2) {
                doc.setFont("helvetica", "bold");
            }

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
    doc.save(`Purchase_Vendor_Ledger_${today}.pdf`);
  };

  const exportExcel = () => {
    const ws = XLSXUtils.json_to_sheet(data.map(item => ({
      Vendor: item.vendor.name,
      Mobile: item.vendor.mobile,
      Address: item.vendor.address,
      'Total Purchase': item.summary.period_purchase,
      'Total Paid': item.summary.period_paid,
      'Net Balance': item.summary.closing_balance,
      Status: item.summary.balance_status,
    })));
    const wb = XLSXUtils.book_new();
    XLSXUtils.book_append_sheet(wb, ws, 'Ledger');
    XLSXWriteFile(wb, 'Purchase_Vendor_Ledger.xlsx');
  };

  const dateWiseEntries = data
    .flatMap((item) =>
      (item.ledger_entries || [])
      .filter((entry) => !entry.is_opening)
      .map((entry) => ({
        ...entry,
        vendor_name: item.vendor.name,
        vendor_mobile: item.vendor.mobile,
      }))
    )
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <>
      <CCard className="mb-4">
        <CCardHeader>
          <h4 className="mb-0">Purchase Vendor Ledger Report</h4>
        </CCardHeader>
        <CCardBody>
          <CRow className="g-3 mb-4">
            <CCol md={3}>
              <CFormLabel>Vendor</CFormLabel>
              <Select
                placeholder="Select Vendor..."
                options={vendors.map(v => ({ value: v.id, label: v.name }))}
                value={filterVendor}
                onChange={selected => setFilterVendor(selected)}
                isClearable
              />
            </CCol>
            <CCol md={3}>
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
              <CFormLabel>Start Date</CFormLabel>
              <CFormInput type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </CCol>
            <CCol md={2}>
              <CFormLabel>End Date</CFormLabel>
              <CFormInput type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </CCol>
            <CCol md={2} className="d-flex align-items-end gap-2">
              <CButton color="primary" onClick={fetchLedgerReport} disabled={loading}>
                {loading ? 'Loading...' : 'Apply Filters'}
              </CButton>
            </CCol>
          </CRow>
          <CRow className="mb-4">
            <CCol>
              <CButton color="info" onClick={generatePdf} disabled={loading} className="text-white me-2">PDF</CButton>
              <CButton color="success" onClick={exportExcel} disabled={loading} className="text-white">Excel</CButton>
            </CCol>
          </CRow>

          <CButtonGroup className="mb-4">
            <CButton color={viewMode === 'vendor' ? 'info' : 'secondary'} onClick={() => setViewMode('vendor')}>
              Vendor View
            </CButton>
            <CButton color={viewMode === 'date' ? 'info' : 'secondary'} onClick={() => setViewMode('date')}>
              Date View
            </CButton>
          </CButtonGroup>

          {Object.keys(grandTotal).length > 0 && (
            <CCard className="mb-4 border-primary">
              <CCardHeader className="bg-light"><strong>Grand Total Summary</strong></CCardHeader>
              <CCardBody>
                <CRow className="text-center">
                  <CCol md={3}><h6>Vendors</h6><h3>{grandTotal.vendor_count}</h3></CCol>
                  <CCol md={3}><h6>Total Purchase</h6><h4>₹{formatCurrency(grandTotal.total_purchase)}</h4></CCol>
                  <CCol md={3}><h6>Total Paid Amount</h6><h4 className="text-danger">₹{formatCurrency(grandTotal.total_paid)}</h4></CCol>
                  <CCol md={3}>
                    <h6>Net Balance</h6>
                    <h4 className={grandTotal.net_balance >= 0 ? 'text-success' : 'text-danger'}>
                      ₹{formatCurrency(grandTotal.net_balance)}
                    </h4>
                    <CBadge color={grandTotal.overall_status === 'payable' ? 'danger' : 'success'} size="sm">
                      {grandTotal.overall_status?.toUpperCase()}
                    </CBadge>
                  </CCol>
                </CRow>
              </CCardBody>
            </CCard>
          )}

          {viewMode === 'vendor' ? (
            <CCard>
              <CCardHeader><strong>Vendor Ledger Summary</strong></CCardHeader>
              <CCardBody>
                <CTable bordered hover responsive>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Vendor Name</CTableHeaderCell>
                      <CTableHeaderCell>Mobile</CTableHeaderCell>
                      <CTableHeaderCell className="text-end">Opening Bal.</CTableHeaderCell>
                      <CTableHeaderCell className="text-end">Purchase</CTableHeaderCell>
                      <CTableHeaderCell className="text-end">Paid</CTableHeaderCell>
                      <CTableHeaderCell className="text-end">Closing Bal.</CTableHeaderCell>
                      <CTableHeaderCell className="text-center">Status</CTableHeaderCell>
                      <CTableHeaderCell className="text-center">Action</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {data.map((item) => {
                      const vendor = item.vendor;
                      const summary = item.summary;
                      const isExpanded = expandedVendors.has(vendor.id);
                      return (
                        <React.Fragment key={vendor.id}>
                          <CTableRow style={{ cursor: 'pointer' }} onClick={() => toggleExpand(vendor.id)}>
                            <CTableDataCell>
                              <strong>{vendor.name}</strong><br />
                              <small className="text-muted">{vendor.address}</small>
                            </CTableDataCell>
                            <CTableDataCell>{vendor.mobile}</CTableDataCell>
                            <CTableDataCell className="text-end">
                              ₹{formatCurrency(Math.abs(summary.opening_balance))} {summary.opening_balance >= 0 ? 'Cr' : 'Dr'}
                            </CTableDataCell>
                            <CTableDataCell className="text-end text-danger">₹{formatCurrency(summary.period_purchase)}</CTableDataCell>
                            <CTableDataCell className="text-end text-success">₹{formatCurrency(summary.period_paid)}</CTableDataCell>
                            <CTableDataCell className="text-end fw-bold">
                              ₹{formatCurrency(Math.abs(summary.closing_balance))} {summary.closing_balance >= 0 ? 'Cr' : 'Dr'}
                            </CTableDataCell>
                            <CTableDataCell className="text-center">
                              <CBadge color={summary.balance_status === 'receivable' ? 'success' : 'danger'}>
                                {summary.balance_status.toUpperCase()}
                              </CBadge>
                            </CTableDataCell>
                            <CTableDataCell className="text-center">{isExpanded ? '▲' : '▼'}</CTableDataCell>
                          </CTableRow>
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
                                          {parseFloat(summary.opening_balance) >= 0 ? 'Cr Opening Balance' : 'Dr Opening Balance'}
                                        </CTableDataCell>
                                        <CTableDataCell className="text-end fw-bold">
                                          {parseFloat(summary.opening_balance) < 0 ? formatCurrency(Math.abs(summary.opening_balance)) : '-'}
                                        </CTableDataCell>
                                        <CTableDataCell className="text-end fw-bold">
                                          {parseFloat(summary.opening_balance) > 0 ? formatCurrency(summary.opening_balance) : '-'}
                                        </CTableDataCell>
                                        <CTableDataCell className="text-end fw-bold">₹{formatCurrency(Math.abs(summary.opening_balance))}</CTableDataCell>
                                      </CTableRow>
                                      
                                      {item.ledger_entries && item.ledger_entries.length > 0 ? (
                                        item.ledger_entries.filter(e => !e.is_opening).map((entry, idx) => (
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
                                            <CTableDataCell className="text-end text-muted">₹{formatCurrency(Math.abs(entry.balance))} {entry.balance >= 0 ? 'Cr' : 'Dr'}</CTableDataCell>
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
                                          {parseFloat(summary.closing_balance) >= 0 ? 'Cr Closing Balance' : 'Dr Closing Balance'}
                                        </CTableDataCell>
                                        <CTableDataCell className="text-end fw-bold">
                                          {parseFloat(summary.closing_balance) < 0 ? formatCurrency(Math.abs(summary.closing_balance)) : '-'}
                                        </CTableDataCell>
                                        <CTableDataCell className="text-end fw-bold">
                                          {parseFloat(summary.closing_balance) > 0 ? formatCurrency(summary.closing_balance) : '-'}
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
                        <CTableDataCell colSpan="8" className="text-center py-5 text-muted">No vendors found.</CTableDataCell>
                      </CTableRow>
                    )}
                  </CTableBody>
                </CTable>
              </CCardBody>
            </CCard>
          ) : (
            <CCard>
              <CCardHeader><strong>Date‑wise Ledger</strong></CCardHeader>
              <CCardBody>
                <CTable bordered hover responsive>
                  <CTableHead color="dark">
                    <CTableRow>
                      <CTableHeaderCell>Date</CTableHeaderCell>
                      <CTableHeaderCell>Vendor</CTableHeaderCell>
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
                        <CTableDataCell>{entry.vendor_name}<br /><small className="text-muted">{entry.vendor_mobile}</small></CTableDataCell>
                        <CTableDataCell>{entry.particulars}</CTableDataCell>
                        <CTableDataCell>{entry.vch_type}</CTableDataCell>
                        <CTableDataCell>{entry.vch_no}</CTableDataCell>
                        <CTableDataCell className="text-end">
                          {entry.debit > 0 ? formatCurrency(entry.debit) : ''}
                        </CTableDataCell>
                        <CTableDataCell className="text-end">
                          {entry.credit > 0 ? formatCurrency(entry.credit) : ''}
                        </CTableDataCell>
                        <CTableDataCell className="text-end fw-bold">₹{formatCurrency(Math.abs(entry.balance))} {entry.balance >= 0 ? 'Cr' : 'Dr'}</CTableDataCell>
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

export default PurchaseVendorLadger;
