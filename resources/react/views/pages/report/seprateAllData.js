import React, { useState, useEffect } from 'react';
import {
  CContainer,
  CCard,
  CCardHeader,
  CCardBody,
  CRow,
  CCol,
  CFormInput,
  CFormLabel,
  CButton,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CSpinner,
  CAlert,
  CCollapse,
  CFormSelect,
} from '@coreui/react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { getAPICall } from '../../../util/api';
import { getUserData } from '../../../util/session';
import { host } from '../../../util/constants';

const WorkSummaryTable = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [projectData, setProjectData] = useState([]);
  const [allProjects, setAllProjects] = useState([]);        // ← for dropdown
  const [selectedProjectId, setSelectedProjectId] = useState(''); // ← new state
  const [expandedRows, setExpandedRows] = useState({});
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
  });

  const user = getUserData() || {};
  const company = user.company_info || {};
  const companyName = company.company_name || 'Company Name';
  const companyPhone = company.phone_no || '—';
  const companyEmail = company.email_id || '—';
  const companyAddress = company.land_mark || company.address || '—';
  const companyGST = company.gst_number || user.gst || '—';

  // Fetch projects list (for dropdown) + work data
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      let url = '/api/todaysData';

      const params = new URLSearchParams();
      if (filters.startDate) params.append('start_date', filters.startDate);
      if (filters.endDate)   params.append('end_date',   filters.endDate);
      if (selectedProjectId) params.append('project_id', selectedProjectId);

      if (params.toString()) url += `?${params.toString()}`;

      const response = await getAPICall(url);

      if (!response?.projects) {
        setProjectData([]);
        setAllProjects([]);
        return;
      }

      // Process work entries
      const processed = response.projects.map((project) => {
        const workEntries = [];

        (project.drilling_records || []).forEach((record) => {
          const date = record.date || '';

          (record.work_points || []).forEach((wp) => {
            workEntries.push({
              date,
              workType: wp.work_type || 'Drilling',
              qty: wp.work_point || wp.qty || '—',
              rate: wp.rate || '—',
              total: wp.total || '—',
            });
          });

          (record.surveys || []).forEach((s) => {
            workEntries.push({
              date,
              workType: s.survey_type || 'Survey',
              qty: s.survey_point || s.qty || '—',
              rate: s.rate || '—',
              total: s.total || '—',
            });
          });
        });

        return {
          project_id: project.project_id,
          project_name: project.project_name || 'Unknown',
          workEntries,
          incomes: project.incomes || [],
        };
      });

      setProjectData(processed);

      // Populate dropdown (only once or when needed)
      if (allProjects.length === 0) {
        setAllProjects(response.projects.map(p => ({
          id: p.project_id,
          name: p.project_name || 'Unnamed Project',
        })));
      }

    } catch (err) {
      console.error(err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []); // initial load

  // Re-fetch when filters or project selection changes
  useEffect(() => {
    if (!loading) {
      fetchData();
    }
  }, [filters.startDate, filters.endDate, selectedProjectId]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleProjectChange = (e) => {
    setSelectedProjectId(e.target.value);
  };

  const toggleRow = (key) => {
    setExpandedRows((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const formatNumber = (val) => {
    if (val === '—' || !val) return '—';
    const num = Number(val);
    return isNaN(num) ? val : num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatDateDDMMYYYY = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    } catch {
      return dateStr;
    }
  };

  // ────────────────────────────────────────────────
  // Exports (CSV + PDF) - same as before
  // ────────────────────────────────────────────────
  const exportToExcel = () => {
    const rows = [];
    projectData.forEach((proj) => {
      proj.workEntries.forEach((entry) => {
        rows.push([
          proj.project_name,
          formatDateDDMMYYYY(entry.date),
          entry.workType,
          formatNumber(entry.qty),
          formatNumber(entry.rate),
          formatNumber(entry.total),
        ]);
      });
    });

    if (rows.length === 0) return;

    const headers = ['Project Name', 'Date', 'Work Type', 'Work Qty', 'Rate', 'Total'];
    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Work_Summary_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };




















  

const exportToPDF = async () => {
  if (!projectData || projectData.length === 0) {
    alert("No project data available to export");
    return;
  }

  const userData  = getUserData?.() || {};
  const company   = userData.company_info || {};

  const companyName    = company.company_name    || "Deshmukh Infra Soft";
  const companyPhone   = company.phone_no        || "—";
  const companyEmail   = company.email_id        || "—";
  const companyAddress = company.address || company.land_mark || "—";
  let   logoUrl        = company.logo ? `${host}/${company.logo}` : null;

  const doc = new jsPDF({
    orientation: 'landscape',
    unit:        'pt',
    format:      'a4'
  });

  const pageWidth    = doc.internal.pageSize.getWidth();
  const pageHeight   = doc.internal.pageSize.getHeight();
  const margin       = 40;
  const contentWidth = pageWidth - margin * 2;

  // Estimated safe header height – adjust if your logo/address needs more space
  const headerBottomY = 160;   // ← most important tuning value

  // ─── Load logo (async) ─────────────────────────────────────────
  let logoBase64 = null;
  if (logoUrl) {
    try {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      await new Promise((resolve, reject) => {
        img.onload  = resolve;
        img.onerror = reject;
        img.src     = logoUrl;
      });
      const canvas = document.createElement("canvas");
      canvas.width  = img.width;
      canvas.height = img.height;
      canvas.getContext("2d").drawImage(img, 0, 0);
      logoBase64 = canvas.toDataURL("image/png");
    } catch (err) {
      console.warn("Logo failed to load:", err);
    }
  }

  // ─── Draw header function ──────────────────────────────────────
  const drawHeader = (pageNumber, isFirst = false) => {
    // Page border
    doc.setDrawColor(60, 60, 70);
    doc.setLineWidth(1);
    doc.rect(margin - 8, margin - 8, pageWidth - (margin - 8) * 2, pageHeight - (margin - 8) * 2);

    let y = margin + 8;

    // Company name
    doc.setFont("helvetica", "bold");
    doc.setFontSize(19);
    doc.setTextColor(20, 40, 100);
    doc.text(companyName, margin + 2, y + 18);

    // Address & contact – smaller
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(60);
    y += 26;
    doc.text(companyAddress, margin + 2, y);
    y += 14;
    doc.text(`Phone: ${companyPhone}  |  Email: ${companyEmail}`, margin + 2, y);

    // Logo area – right top
    const logoSize = 70;
    const logoX = pageWidth - margin - logoSize;
    const logoY = margin - 2;

    doc.setFillColor(235, 240, 255);
    doc.rect(logoX, logoY, logoSize, logoSize, "F");

    if (logoBase64) {
      doc.addImage(logoBase64, "PNG", logoX + 4, logoY + 4, logoSize - 8, logoSize - 8);
    } else {
      doc.setFontSize(11);
      doc.setTextColor(120);
      doc.text("LOGO", logoX + logoSize/2, logoY + logoSize/2 + 4, { align: "center" });
    }

    y += 38;

    // Blue separator line
    doc.setLineWidth(1);
    doc.setDrawColor(100, 140, 220);
    doc.line(margin, y, pageWidth - margin, y);
    y += 18;

    // Title – centered
    doc.setFontSize(17);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30);
    doc.text(
      isFirst ? "WORK SUMMARY" : "WORK SUMMARY (continued)",
      pageWidth / 2,
      y + 6,
      { align: "center" }
    );
    y += 26;

    // Generated & page info – top right
    // doc.setFontSize(9.5);
    // doc.setTextColor(80);
    // const today = new Date().toLocaleDateString("en-IN", {
    //   day: "2-digit", month: "short", year: "numeric"
    // });
    // doc.text(`Generated: ${today}`, pageWidth - margin - 4, margin + 22, { align: "right" });
    // doc.text(`Page ${pageNumber}`,    pageWidth - margin - 4, margin + 38, { align: "right" });
  };

  // ─── Table definition ──────────────────────────────────────────
  const tableColumn = [
    "Project Name",
    "Date",
    "Work Type",
    "Qty",
    "Rate",
    "Total"
  ];

  const tableRows = [];
  projectData.forEach(proj => {
    (proj.workEntries || []).forEach(entry => {
      tableRows.push([
        proj.project_name        || "—",
        formatDateDDMMYYYY?.(entry.date)  || "—",
        entry.workType           || "—",
        formatNumber?.(entry.qty)         || "0",
        formatNumber?.(entry.rate)        || "0.00",
        formatNumber?.(entry.total)       || "0.00",
      ]);
    });
  });

  if (tableRows.length === 0) {
    tableRows.push(["No entries found", "—", "—", "—", "—", "—"]);
  }

  // First page: draw header manually before table
  drawHeader(1, true);

  // ─── Generate table ────────────────────────────────────────────
  doc.autoTable({
    startY: headerBottomY,           // ← start exactly after header
    head: [tableColumn],
    body: tableRows,

    theme: 'grid',

    margin: { left: margin, right: margin },

    styles: {
      fontSize:    9.5,
      cellPadding: 5.5,
      overflow:    'linebreak',
      lineColor:   [80, 80, 90],
      lineWidth:   0.4,
      textColor:   [30, 30, 40],
    },

    headStyles: {
      fillColor:   [210, 230, 255],
      textColor:   [0, 0, 0],
      fontStyle:   'bold',
      halign:      'center',
      lineWidth:   0.6,
    },

    columnStyles: {
      0: { cellWidth: 210, halign: 'left'  }, // Project Name
      1: { cellWidth:  78, halign: 'center' }, // Date
      2: { cellWidth: 220, halign: 'left'  }, // Work Type
      3: { cellWidth:  65, halign: 'right' }, // Qty
      4: { cellWidth:  75, halign: 'right' }, // Rate
      5: { cellWidth:  95, halign: 'right', fontStyle: 'bold' }, // Total
    },

    didDrawPage: (data) => {
      const currentPage = doc.getCurrentPageInfo().pageNumber;

      // Draw header on every page (including continued pages)
      drawHeader(currentPage, currentPage === 1);

      // Footer note
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text(
        "Computer generated document • For internal use",
        pageWidth / 2,
        pageHeight - 18,
        { align: "center" }
      );
    },

    showHead:       'everyPage',
    rowPageBreak:   'avoid',
  });

  // Save
  const filename = `Work_Summary_${new Date().toISOString().slice(0,10)}.pdf`;
  doc.save(filename);
};
















  
  if (loading) return <CContainer className="text-center py-5"><CSpinner color="primary" /></CContainer>;
  if (error) return <CContainer className="py-4"><CAlert color="danger">{error}</CAlert></CContainer>;

  const totalEntries = projectData.reduce((sum, p) => sum + p.workEntries.length, 0);

  return (
    <CContainer fluid className="py-4">
      <CCard className="mb-4">
        <CCardHeader><strong>Filters</strong></CCardHeader>
        <CCardBody>
          <CRow className="g-3 align-items-end">
            <CCol md={3}>
              <CFormLabel>Project</CFormLabel>
              <CFormSelect
                value={selectedProjectId}
                onChange={handleProjectChange}
              >
                <option value="">All Projects</option>
                {allProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </CFormSelect>
            </CCol>

            <CCol md={3}>
              <CFormLabel>Start Date</CFormLabel>
              <CFormInput type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
            </CCol>

            <CCol md={3}>
              <CFormLabel>End Date</CFormLabel>
              <CFormInput type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
            </CCol>

            <CCol md={3} className="d-flex gap-2 align-items-end">
              <CButton color="primary" onClick={fetchData} className="flex-grow-1">
                Apply
              </CButton>
              <CButton color="success" onClick={exportToExcel} disabled={totalEntries === 0}>
                Excel
              </CButton>
              <CButton color="danger" onClick={exportToPDF} disabled={totalEntries === 0}>
                PDF
              </CButton>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>

      <CCard>
        <CCardHeader>
          <strong>Work Summary ({totalEntries} entries)</strong>
        </CCardHeader>
        <CCardBody className="p-0">
          {totalEntries === 0 ? (
            <div className="p-5 text-center text-muted">No records found</div>
          ) : (
            <CTable hover responsive bordered className="mb-0">
              <CTableHead color="dark">
                <CTableRow>
                  <CTableHeaderCell>Project Name</CTableHeaderCell>
                  <CTableHeaderCell>Date</CTableHeaderCell>
                  <CTableHeaderCell>Work Type</CTableHeaderCell>
                  <CTableHeaderCell className="text-end">Work Qty</CTableHeaderCell>
                  <CTableHeaderCell className="text-end">Rate</CTableHeaderCell>
                  <CTableHeaderCell className="text-end">Total</CTableHeaderCell>
                  <CTableHeaderCell className="text-center">Action</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {projectData.flatMap((project) =>
                  project.workEntries.map((entry, idx) => {
                    const rowKey = `${project.project_id}-${idx}`;
                    const isExpanded = !!expandedRows[rowKey];

                    return (
                      <React.Fragment key={rowKey}>
                        <CTableRow>
                          <CTableDataCell>{project.project_name}</CTableDataCell>
                          <CTableDataCell>{formatDateDDMMYYYY(entry.date)}</CTableDataCell>
                          <CTableDataCell>{entry.workType}</CTableDataCell>
                          <CTableDataCell className="text-end">{formatNumber(entry.qty)}</CTableDataCell>
                          <CTableDataCell className="text-end">{formatNumber(entry.rate)}</CTableDataCell>
                          <CTableDataCell className="text-end fw-bold">{formatNumber(entry.total)}</CTableDataCell>
                          <CTableDataCell className="text-center">
                            <CButton
                              size="sm"
                              color="primary"
                              variant={isExpanded ? "solid" : "outline"}
                              onClick={() => toggleRow(rowKey)}
                            >
                              {isExpanded ? 'Hide' : 'View'}
                            </CButton>
                          </CTableDataCell>
                        </CTableRow>

                        <CTableRow>
                          <CTableDataCell colSpan={7} className="p-0 border-0">
                            <CCollapse visible={isExpanded}>
                              <div className="p-3 bg-light">
                                <h6 className="mb-3">Payment History - {project.project_name}</h6>

                                {project.incomes.length === 0 ? (
                                  <p className="text-muted mb-0">No payment records available.</p>
                                ) : (
                                  <CTable size="sm" bordered hover>
                                    <CTableHead color="light">
                                      <CTableRow>
                                        <CTableHeaderCell>Date</CTableHeaderCell>
                                        <CTableHeaderCell>Invoice No</CTableHeaderCell>
                                        <CTableHeaderCell className="text-end">Billing Amount</CTableHeaderCell>
                                        <CTableHeaderCell className="text-end">Received</CTableHeaderCell>
                                        <CTableHeaderCell>Payment Type</CTableHeaderCell>
                                        <CTableHeaderCell>Remark</CTableHeaderCell>
                                      </CTableRow>
                                    </CTableHead>
                                    <CTableBody>
                                      {project.incomes.map((inc) => (
                                        <CTableRow key={inc.id}>
                                          <CTableDataCell>{formatDateDDMMYYYY(inc.payment_date)}</CTableDataCell>
                                          <CTableDataCell>{inc.invoice_no || '—'}</CTableDataCell>
                                          <CTableDataCell className="text-end">{formatNumber(inc.billing_amount)}</CTableDataCell>
                                          <CTableDataCell className="text-end text-success fw-bold">
                                            {formatNumber(inc.received_amount)}
                                          </CTableDataCell>
                                          <CTableDataCell>{inc.payment_type || '—'}</CTableDataCell>
                                          <CTableDataCell>{inc.remark || '—'}</CTableDataCell>
                                        </CTableRow>
                                      ))}
                                    </CTableBody>
                                  </CTable>
                                )}
                              </div>
                            </CCollapse>
                          </CTableDataCell>
                        </CTableRow>
                      </React.Fragment>
                    );
                  })
                )}
              </CTableBody>
            </CTable>
          )}
        </CCardBody>
      </CCard>
    </CContainer>
  );
};

export default WorkSummaryTable;