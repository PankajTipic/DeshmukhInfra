

import React, { useEffect, useMemo, useState } from 'react'
import { deleteAPICall, getAPICall } from '../../../util/api'
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
  CFormInput,
  CButton,
  CRow,
  CCol,
  CFormSelect,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CTableFoot,
} from '@coreui/react'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { getUserType, getUserData } from '../../../util/session'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../../common/toast/ToastContext'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash } from '@coreui/icons'
import { host } from '../../../util/constants'

function InfraDetailsShowTable() {
  const [rows, setRows] = useState([])
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [maxPoint, setMaxPoint] = useState('')
  const [loading, setLoading] = useState(false)
  const [projects, setProjects] = useState([])
  const [projectName, setProjectName] = useState('')
  const [visible, setVisible] = useState(false)
  const [selectedId, setSelectedId] = useState(null)

  const navigate = useNavigate()
  const { showToast } = useToast()

  // Fetch project list
  const fetchProjects = async () => {
    try {
      const response = await getAPICall('/api/myProjects')
      setProjects(response || [])
    } catch (err) {
      console.error("Error fetching projects:", err)
    }
  }

  const fetchRecords = async (filters = {}) => {
    try {
      const userType = getUserType()
      let apiUrl = "/api/drilling"

      if (userType === 2) {
        apiUrl = "/api/getDataByUserId"
      }

      const params = new URLSearchParams()
      if (filters.start_date && filters.end_date) {
        params.append('start_date', filters.start_date)
        params.append('end_date', filters.end_date)
      }
      if (filters.project_name) {
        params.append('project_name', filters.project_name)
      }
      if (filters.max_point) {
        params.append('max_point', filters.max_point)
      }

      if ([...params].length > 0) {
        apiUrl = `${apiUrl}?${params.toString()}`
      }

      setLoading(true)
      const response = await getAPICall(apiUrl)
      const records = response.data

      const flattened = []
      records.forEach((rec, idx) => {
        const workLen = rec.work_point_detail?.length || 0
        const surveyLen = rec.survey_detail?.length || 0
        const machineLen = rec.machine_reading?.length || 0
        const compressorRpmLen = rec.compressor_rpm?.length || 0

        const totalRows = Math.max(workLen, surveyLen, machineLen, compressorRpmLen, 1)

        for (let i = 0; i < totalRows; i++) {
          const work = rec.work_point_detail?.[i] || {}
          const survey = rec.survey_detail?.[i] || {}
          const machine = rec.machine_reading?.[i] || {}
          const compressorRpm = rec.compressor_rpm?.[i] || {}

          flattened.push({
            srNo: idx + 1,
            date: rec.date,
            site: rec.project?.project_name || '',
            operator: machine.operator?.name || rec.operator?.name || '',

            machineStart: machine.machine_start || '',
            machineEnd: machine.machine_end || '',
            machineHr: machine.actual_machine_hr || '',

            compressorStart: compressorRpm.comp_rpm_start || '',
            compressorEnd: compressorRpm.comp_rpm_end || '',
            compressorHr: compressorRpm.com_actul_hr || '',

            workType: work.work_type || '',
            workPoint: work.work_point || '',
            workRate: work.rate || '',
            workTotal: Number(work.total) || 0,

            surveyType: survey.survey_type || '',
            surveyPoint: survey.survey_point || '',
            surveyRate: survey.rate || '',
            surveyTotal: Number(survey.total) || 0,

            rowTotal: (Number(work.total) || 0) + (Number(survey.total) || 0),

            isFirstRow: i === 0,
            rowSpan: totalRows,
            drillingRecordId: rec.id,
          })
        }
      })

      setRows(flattened)
    } catch (error) {
      console.error("Error fetching records:", error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate totals for the table
  const tableTotals = useMemo(() => {
    return {
      workPoint: rows.reduce((sum, row) => sum + (parseFloat(row.workPoint) || 0), 0),
      workRate: rows.reduce((sum, row) => sum + (parseFloat(row.workRate) || 0), 0),
      workTotal: rows.reduce((sum, row) => sum + (Number(row.workTotal) || 0), 0),
      surveyPoint: rows.reduce((sum, row) => sum + (parseFloat(row.surveyPoint) || 0), 0),
      surveyRate: rows.reduce((sum, row) => sum + (parseFloat(row.surveyRate) || 0), 0),
      surveyTotal: rows.reduce((sum, row) => sum + (Number(row.surveyTotal) || 0), 0),
      grandTotal: rows.reduce((sum, row) => sum + (Number(row.rowTotal) || 0), 0),
    }
  }, [rows])

  const downloadExcel = () => {
    // Title and filter info
    const titleRow = ['Work Log Report']
    const emptyRow = []
    
    // Filter information
    const filterRows = []
    if (startDate || endDate || projectName) {
      filterRows.push(['Applied Filters:'])
      if (startDate && endDate) {
        filterRows.push(['Date Range:', `${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`])
      }
      if (projectName) {
        filterRows.push(['Project:', projectName])
      }
      filterRows.push(emptyRow)
    }

    const headers = [
      'Sr.No.',
      'Date',
      'Site',
      'Operator/Helper',
      'Machine Start',
      'Machine End',
      'Machine Hr',
      'Compressor rpm Start',
      'Compressor rpm End',
      'Compressor rpm Hr',
      'Work Type',
      'Point',
      'Rate',
      'Work Total',
      'Survey Type',
      'Survey Point',
      'Survey Rate',
      'Survey Total',
      'Grand Total',
    ]

    const data = rows.map(row => [
      row.srNo,
      new Date(row.date).toLocaleDateString(),
      row.site,
      row.operator,
      row.machineStart,
      row.machineEnd,
      row.machineHr,
      row.compressorStart,
      row.compressorEnd,
      row.compressorHr,
      row.workType,
      row.workPoint,
      row.workRate,
      row.workTotal,
      row.surveyType,
      row.surveyPoint,
      row.surveyRate,
      row.surveyTotal,
      row.rowTotal,
    ])

    // Calculate totals
    const totalsRow = [
      '', '', '', '', '', '', '', '', '', '', 
      'TOTAL',
      tableTotals.workPoint.toFixed(2),
      tableTotals.workRate.toFixed(2),
      tableTotals.workTotal.toFixed(2),
      '',
      tableTotals.surveyPoint.toFixed(2),
      tableTotals.surveyRate.toFixed(2),
      tableTotals.surveyTotal.toFixed(2),
      tableTotals.grandTotal.toFixed(2),
    ]

    // Combine all rows
    const allRows = [
      titleRow,
      emptyRow,
      ...filterRows,
      headers,
      ...data,
      emptyRow,
      totalsRow,
    ]

    const worksheet = XLSX.utils.aoa_to_sheet(allRows)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'WorkLogReport')

    // Style title (merge cells)
    worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 18 } }]

    // Auto column width
    const colWidths = headers.map((h, i) => ({
      wch: Math.max(h.length, ...data.map(r => (r[i] ? r[i].toString().length : 0))) + 2,
    }))
    worksheet['!cols'] = colWidths

    XLSX.writeFile(workbook, 'WorkLogReport.xlsx')
  }












// const downloadPDF = () => {
//   const doc = new jsPDF('l', 'mm', 'a4'); // landscape A4
//   // Get user data once
//   const user = getUserData();
//   const companyInfo = user?.company_info || {};
//   // ───────────────────────────────────────────────
//   // COMPANY HEADER & STYLING
//   // ───────────────────────────────────────────────
//   const pageWidth = doc.internal.pageSize.getWidth();
//   const pageHeight = doc.internal.pageSize.getHeight();
//   const margin = 12;

//   const headerTop = margin + 6; // logo & company name same distance from top border

//   // Outer page border (light gray)
//   doc.setDrawColor(80, 80, 80);
//   doc.setLineWidth(0.4);
//   doc.rect(margin, margin, pageWidth - margin * 2, pageHeight - margin * 2);
//   // ───────────────────────────────────────────────
//   // Company logo – REAL IMAGE
//   // ───────────────────────────────────────────────
//   // const logoX = margin + 4;
//   // const logoY = margin + 15;
//   // const logoSize = 20; // Adjusted for better proportion

// const logoSize = 26; // logo size 
// const logoX = pageWidth - margin - logoSize - 6; // right aligned
// // const logoY = margin + 6; // top 
// const logoY = headerTop;



//   // Construct full logo URL
//   let logoUrl = null;
//   if (companyInfo.logo && companyInfo.logo !== "invoice/empty.png") {
//     logoUrl = `${host}/img/${companyInfo.logo}`;
//   }
//   if (logoUrl) {
//     try {
//       // Try to load the real logo
//       doc.addImage(
//         logoUrl,
//         'PNG', // assuming PNG — change to 'JPEG' if needed
//         logoX,
//         logoY,
//         logoSize,
//         logoSize
//       );
//     } catch (err) {
//       console.warn("Failed to load logo:", err);
//       // Fallback to placeholder if image fails
//       doc.setFillColor(220, 220, 240);
//       doc.rect(logoX, logoY, logoSize, logoSize, 'F');
//       doc.setFontSize(9);
//       doc.setTextColor(100);
//       doc.text("LOGO", logoX + 6, logoY + 13);
//     }
//   } else {
//     // No logo → show placeholder
//     doc.setFillColor(220, 220, 240);
//     doc.rect(logoX, logoY, logoSize, logoSize, 'F');
//     doc.setFontSize(9);
//     doc.setTextColor(100);
//     doc.text("LOGO", logoX + 6, logoY + 13);
//   }
//   // ───────────────────────────────────────────────
//   // Company name & details - right of logo
//   // ───────────────────────────────────────────────
//   doc.setFontSize(18);
//   doc.setFont("helvetica", "bold");
//   doc.setTextColor(40, 40, 60);

// const headerX = margin + 8;

// doc.setFontSize(18);
// doc.setFont("helvetica", "bold");
// doc.text(
//   companyInfo.company_name || "Deshmukh Infra Soft",
//   headerX,
//   // logoY + 12
//    headerTop + 8
// );


//   // doc.text(
//   //   companyInfo.company_name || "Deshmukh Infra Soft",
//   //   logoX + logoSize + 10,
//   //   logoY + 12
//   // );
//   doc.setFontSize(10);
//   doc.setFont("helvetica", "normal");
//   doc.setTextColor(70);
//   // let detailY = logoY + 18; // Optimized spacing after company name
//   let detailY = headerTop + 14;

//   const lineHeight = 5; // Reduced for space optimization
//   const companyDetails = [
//     companyInfo.land_mark || "Urali Kanchan, Pune",
//     `Phone: ${companyInfo.phone_no || "9173635656"}`,
//     `Email: ${companyInfo.email_id || "shreyas.gijare.21@gmail.com"}`,
//     `GSTIN: ${companyInfo.gst_number || "Not Available"}`,
//   ];
//   // companyDetails.forEach(line => {
//   //   if (line && line.trim() !== "") {
//   //     doc.text(line, logoX + logoSize + 10, detailY);
//   //     detailY += lineHeight;
//   //   }
//   // });
//   companyDetails.forEach(line => {
//   if (line && line.trim() !== "") {
//     doc.text(line, headerX, detailY); // LEFT aligned
//     detailY += lineHeight;
//   }
// });

//   // Horizontal separator line after header
//   doc.setLineWidth(0.6);
//   doc.setDrawColor(0, 0, 0);
//   // doc.line(margin + 6, detailY + 2, pageWidth - margin - 6, detailY + 2);
//   doc.line(margin + 6, detailY + 1, pageWidth - margin - 6, detailY + 1);

//   // Title
//   doc.setFontSize(16);
//   doc.setFont("helvetica", "bold");
//   doc.setTextColor(0);
//   doc.text(
//     "Work Log Report",
//     pageWidth / 2,
//     detailY + 10,
//     { align: "center" }
//   );
//   // ───────────────────────────────────────────────
//   // FILTER INFORMATION (if any)
//   // ───────────────────────────────────────────────
//   let startY = detailY + 18;
//   if (startDate || endDate || projectName) {
//     doc.setFontSize(10);
//     doc.setFont("helvetica", "normal");
//     doc.setTextColor(60);
//     doc.text("Applied Filters:", margin + 8, startY);
//     startY += 6;
//     if (startDate && endDate) {
//       const range = `${new Date(startDate).toLocaleDateString("en-GB")} to ${new Date(endDate).toLocaleDateString("en-GB")}`;
//       doc.text(`Date Range: ${range}`, margin + 8, startY);
//       startY += 5.5;
//     }
//     if (projectName) {
//       doc.text(`Project: ${projectName}`, margin + 8, startY);
//       startY += 5.5;
//     }
//     startY += 6; // extra spacing before table
//   }
//   // ───────────────────────────────────────────────
//   // TABLE (unchanged from your version)
//   // ───────────────────────────────────────────────
//   const tableColumn = [
//     'Sr.No.', 'Date', 'Site', 'Operator', 'Machine Start', 'Machine End',
//     'Machine Hr', 'Comp Start', 'Comp End', 'Comp Hr', 'Work Type',
//     'Point', 'Rate', 'Work Total', 'Survey Type', 'Point', 'Rate',
//     'Survey Total', 'Grand Total'
//   ];
//   const tableRows = rows.map(row => [
//     row.srNo,
//     new Date(row.date).toLocaleDateString("en-GB"),
//     row.site,
//     row.operator,
//     row.machineStart,
//     row.machineEnd,
//     row.machineHr,
//     row.compressorStart,
//     row.compressorEnd,
//     row.compressorHr,
//     row.workType,
//     row.workPoint,
//     row.workRate,
//     row.workTotal,
//     row.surveyType,
//     row.surveyPoint,
//     row.surveyRate,
//     row.surveyTotal,
//     row.rowTotal,
//   ]);
//   tableRows.push([
//     '', '', '', '', '', '', '', '', '', '',
//     'TOTAL',
//     tableTotals.workPoint.toFixed(2),
//     tableTotals.workRate.toFixed(2),
//     tableTotals.workTotal.toFixed(2),
//     '',
//     tableTotals.surveyPoint.toFixed(2),
//     tableTotals.surveyRate.toFixed(2),
//     tableTotals.surveyTotal.toFixed(2),
//     tableTotals.grandTotal.toFixed(2),
//   ]);
//   doc.autoTable({
//     head: [tableColumn],
//     body: tableRows,
//     startY: startY,
//     theme: 'grid',
//     margin: { left: margin + 6, right: margin + 6 },
//     styles: {
//       fontSize: 8,
//       cellPadding: 2.2,
//       overflow: 'linebreak',
//       halign: 'center',
//       valign: 'middle',
//       lineColor: [44, 62, 80],
//       lineWidth: 0.3,
//     },
//     headStyles: {
//       fillColor: [52, 73, 94],
//       textColor: 255,
//       fontSize: 8.5,
//       fontStyle: 'bold',
//     },
//     alternateRowStyles: {
//       fillColor: [245, 247, 250],
//     },
//     footStyles: {
//       fillColor: [220, 220, 220],
//       textColor: 0,
//       fontStyle: 'bold',
//       fontSize: 8.5,
//     },
//     didParseCell: (data) => {
//       if (data.row.index === tableRows.length - 1) {
//         data.cell.styles.fontStyle = 'bold';
//         data.cell.styles.fillColor = [235, 235, 235];
//       }
//       if (["Work Total", "Survey Total", "Grand Total"].includes(data.column.dataKey)) {
//         data.cell.styles.textColor = [0, 128, 0];
//       }
//     },
//   });
//   doc.save('WorkLogReport.pdf');
// };


const downloadPDF = () => {
  const doc = new jsPDF('l', 'mm', 'a4'); // landscape A4
  // Get user data once
  const user = getUserData();
  const companyInfo = user?.company_info || {};
  // ───────────────────────────────────────────────
  // COMPANY HEADER & STYLING
  // ───────────────────────────────────────────────
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;

  // ───────────────────────────────────────────────
  // Draw header function
  // ───────────────────────────────────────────────
  const drawHeader = (isFirst) => {
    const headerTop = margin + 6; // logo & company name same distance from top border

    // Outer page border (light gray)
    doc.setDrawColor(80, 80, 80);
    doc.setLineWidth(0.4);
    doc.rect(margin, margin, pageWidth - margin * 2, pageHeight - margin * 2);

    // ───────────────────────────────────────────────
    // Company logo – REAL IMAGE
    // ───────────────────────────────────────────────
    const logoSize = 26; // logo size 
    const logoX = pageWidth - margin - logoSize - 6; // right aligned
    const logoY = headerTop;

    // Construct full logo URL
    let logoUrl = null;
    if (companyInfo.logo && companyInfo.logo !== "invoice/empty.png") {
      logoUrl = `${host}/img/${companyInfo.logo}`;
    }
    if (logoUrl) {
      try {
        // Try to load the real logo
        doc.addImage(
          logoUrl,
          'PNG', // assuming PNG — change to 'JPEG' if needed
          logoX,
          logoY,
          logoSize,
          logoSize
        );
      } catch (err) {
        console.warn("Failed to load logo:", err);
        // Fallback to placeholder if image fails
        doc.setFillColor(220, 220, 240);
        doc.rect(logoX, logoY, logoSize, logoSize, 'F');
        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.text("LOGO", logoX + 6, logoY + 13);
      }
    } else {
      // No logo → show placeholder
      doc.setFillColor(220, 220, 240);
      doc.rect(logoX, logoY, logoSize, logoSize, 'F');
      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.text("LOGO", logoX + 6, logoY + 13);
    }

    // ───────────────────────────────────────────────
    // Company name & details - left aligned
    // ───────────────────────────────────────────────
    const headerX = margin + 8;

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(40, 40, 60);
    doc.text(
      companyInfo.company_name || "Deshmukh Infra Soft",
      headerX,
      headerTop + 8
    );

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(70);
    let detailY = headerTop + 14;

    const lineHeight = 5; // Reduced for space optimization
    const companyDetails = [
      companyInfo.land_mark || "Urali Kanchan, Pune",
      `Phone: ${companyInfo.phone_no || "9173635656"}`,
      `Email: ${companyInfo.email_id || "shreyas.gijare.21@gmail.com"}`,
      `GSTIN: ${companyInfo.gst_number || "Not Available"}`,
    ];
    companyDetails.forEach(line => {
      if (line && line.trim() !== "") {
        doc.text(line, headerX, detailY);
        detailY += lineHeight;
      }
    });

    // Horizontal separator line after header
    doc.setLineWidth(0.6);
    doc.setDrawColor(0, 0, 0);
    doc.line(margin + 6, detailY + 1, pageWidth - margin - 6, detailY + 1);

    // Title
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0);
    let titleText = "Work Log Report";
    // if (!isFirst) titleText += " (continued)";
    doc.text(
      titleText,
      pageWidth / 2,
      detailY + 10,
      { align: "center" }
    );

    // Return the Y position after the title + space
    return detailY + 18;
  };

  // Draw header for the first page
  const headerBottomY = drawHeader(true);

  // ───────────────────────────────────────────────
  // FILTER INFORMATION (if any) - only on first page
  // ───────────────────────────────────────────────
  let startY = headerBottomY;
  if (startDate || endDate || projectName) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60);
    doc.text("Applied Filters:", margin + 8, startY);
    startY += 6;
    if (startDate && endDate) {
      const range = `${new Date(startDate).toLocaleDateString("en-GB")} to ${new Date(endDate).toLocaleDateString("en-GB")}`;
      doc.text(`Date Range: ${range}`, margin + 8, startY);
      startY += 5.5;
    }
    if (projectName) {
      doc.text(`Project: ${projectName}`, margin + 8, startY);
      startY += 5.5;
    }
    startY += 6; // extra spacing before table
  }

  // ───────────────────────────────────────────────
  // TABLE
  // ───────────────────────────────────────────────
  const tableColumn = [
    'Sr.No.', 'Date', 'Site', 'Operator', 'Machine Start', 'Machine End',
    'Machine Hr', 'Comp Start', 'Comp End', 'Comp Hr', 'Work Type',
    'Point', 'Rate', 'Work Total', 'Survey Type', 'Point', 'Rate',
    'Survey Total', 'Grand Total'
  ];
  const tableRows = rows.map(row => [
    row.srNo,
    new Date(row.date).toLocaleDateString("en-GB"),
    row.site,
    row.operator,
    row.machineStart,
    row.machineEnd,
    row.machineHr,
    row.compressorStart,
    row.compressorEnd,
    row.compressorHr,
    row.workType,
    row.workPoint,
    row.workRate,
    row.workTotal,
    row.surveyType,
    row.surveyPoint,
    row.surveyRate,
    row.surveyTotal,
    row.rowTotal,
  ]);
  tableRows.push([
    '', '', '', '', '', '', '', '', '', '',
    'TOTAL',
    tableTotals.workPoint.toFixed(2),
    tableTotals.workRate.toFixed(2),
    tableTotals.workTotal.toFixed(2),
    '',
    tableTotals.surveyPoint.toFixed(2),
    tableTotals.surveyRate.toFixed(2),
    tableTotals.surveyTotal.toFixed(2),
    tableTotals.grandTotal.toFixed(2),
  ]);
  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: startY,
    theme: 'grid',
    margin: { top: headerBottomY, left: margin + 6, right: margin + 6, bottom: margin },
    styles: {
      fontSize: 8,
      cellPadding: 2.2,
      overflow: 'linebreak',
      halign: 'center',
      valign: 'middle',
      lineColor: [44, 62, 80],
      lineWidth: 0.3,
    },
    headStyles: {
      fillColor: [52, 73, 94],
      textColor: 255,
      fontSize: 8.5,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
    footStyles: {
      fillColor: [220, 220, 220],
      textColor: 0,
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    didParseCell: (data) => {
      if (data.row.index === tableRows.length - 1) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [235, 235, 235];
      }
      if (["Work Total", "Survey Total", "Grand Total"].includes(data.column.dataKey)) {
        data.cell.styles.textColor = [0, 128, 0];
      }
    },
    addPageContent: (data) => {
      drawHeader(false);
    },
    didDrawPage: (data) => {
      // No footer in this report
    },
    showHead: 'everyPage',
    rowPageBreak: 'avoid',
  });
  doc.save('WorkLogReport.pdf');
};







  useEffect(() => {
    fetchProjects()
    fetchRecords()
  }, [])

  const handleFilter = () => {
    fetchRecords({
      start_date: startDate || undefined,
      end_date: endDate || undefined,
      project_name: projectName || undefined,
      max_point: maxPoint || undefined,
    })
  }

  const openDeleteModal = (id) => {
    setSelectedId(id)
    setVisible(true)
  }

  const handleDelete = async () => {
    if (!selectedId) return
    setLoading(true)
    try {
      const res = await deleteAPICall(`/api/drilling/${selectedId}`)
      if (res) {
        showToast("success", "Entry deleted successfully!")
        fetchRecords()
      } else {
        showToast("danger", "Failed to delete entry")
      }
    } catch (err) {
      console.error(err)
      showToast("danger", "Something went wrong while deleting.")
    } finally {
      setLoading(false)
      setVisible(false)
      setSelectedId(null)
    }
  }

  return (
    <div>
      <CCard className="mb-4">
        <CCardHeader>
          <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
            <div className="d-flex flex-wrap gap-2">
              <CButton color="success" className="me-2" onClick={downloadExcel}>
                Download Excel
              </CButton>
              <CButton color="danger" className="pe-3" onClick={downloadPDF}>
                Download PDF
              </CButton>
            </div>
            <h4 className="mb-0">Total Amount : {tableTotals.grandTotal.toFixed(2)}</h4>
          </div>

          <CRow className="align-items-end d-flex flex-wrap gap-2">
            <CCol md={3}>
              <CFormInput
                type="date"
                label="Start Date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </CCol>
            <CCol md={3}>
              <CFormInput
                type="date"
                label="End Date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </CCol>
            <CCol md={3}>
              <CFormSelect
                label="Project Name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              >
                <option value="">-- Select Project --</option>
                {projects.map((proj) => (
                  <option key={proj.id} value={proj.project_name}>
                    {proj?.project_name}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol md={3}>
              <CButton color="primary" onClick={handleFilter}>
                Apply
              </CButton>
              <CButton
                color="secondary"
                className="ms-2"
                onClick={() => {
                  setStartDate('')
                  setEndDate('')
                  setProjectName('')
                  setMaxPoint('')
                  fetchRecords()
                }}
              >
                Reset
              </CButton>
            </CCol>
          </CRow>
        </CCardHeader>
      </CCard>

      {rows.length > 0 && (
        <CCard className="mt-4">
          <CCardBody className="p-0">
            <div className="table-responsive">
              <CTable bordered hover>
                <CTableHead color="dark">
                  <CTableRow>
                    <CTableHeaderCell>Sr.No.</CTableHeaderCell>
                    <CTableHeaderCell>Date</CTableHeaderCell>
                    <CTableHeaderCell>Site</CTableHeaderCell>
                    <CTableHeaderCell>Operator/Helper</CTableHeaderCell>
                    <CTableHeaderCell>Machine Start</CTableHeaderCell>
                    <CTableHeaderCell>Machine End</CTableHeaderCell>
                    <CTableHeaderCell>Machine Hr</CTableHeaderCell>
                    <CTableHeaderCell>Compressor rpm Start</CTableHeaderCell>
                    <CTableHeaderCell>Compressor rpm End</CTableHeaderCell>
                    <CTableHeaderCell>Compressor rpm Hr</CTableHeaderCell>
                    <CTableHeaderCell>Work Type</CTableHeaderCell>
                    <CTableHeaderCell>Point</CTableHeaderCell>
                    <CTableHeaderCell>Rate</CTableHeaderCell>
                    <CTableHeaderCell>Work Total</CTableHeaderCell>
                    <CTableHeaderCell>Survey Type</CTableHeaderCell>
                    <CTableHeaderCell>Survey Point</CTableHeaderCell>
                    <CTableHeaderCell>Survey Rate</CTableHeaderCell>
                    <CTableHeaderCell>Survey Total</CTableHeaderCell>
                    <CTableHeaderCell>Grand Total</CTableHeaderCell>
                    <CTableHeaderCell>Action</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                
                <CTableBody>
                  {rows.map((row, rowIndex) => (
                    <CTableRow key={rowIndex}>
                      {row.isFirstRow && (
                        <>
                          <CTableDataCell rowSpan={row.rowSpan}>{row.srNo}</CTableDataCell>
                          <CTableDataCell rowSpan={row.rowSpan}>
                            {new Date(row.date).toLocaleDateString("en-GB")}
                          </CTableDataCell>
                          <CTableDataCell rowSpan={row.rowSpan}>{row.site}</CTableDataCell>
                        </>
                      )}

                      <CTableDataCell>{row.operator}</CTableDataCell>
                      <CTableDataCell>{row.machineStart}</CTableDataCell>
                      <CTableDataCell>{row.machineEnd}</CTableDataCell>
                      <CTableDataCell>{row.machineHr}</CTableDataCell>
                      <CTableDataCell>{row.compressorStart}</CTableDataCell>
                      <CTableDataCell>{row.compressorEnd}</CTableDataCell>
                      <CTableDataCell>{row.compressorHr}</CTableDataCell>
                      <CTableDataCell>{row.workType}</CTableDataCell>
                      <CTableDataCell>{row.workPoint}</CTableDataCell>
                      <CTableDataCell>{row.workRate}</CTableDataCell>
                      <CTableDataCell className="fw-bold text-primary">{row.workTotal}</CTableDataCell>
                      <CTableDataCell>{row.surveyType}</CTableDataCell>
                      <CTableDataCell>{row.surveyPoint}</CTableDataCell>
                      <CTableDataCell>{row.surveyRate}</CTableDataCell>
                      <CTableDataCell className="fw-bold text-primary">{row.surveyTotal}</CTableDataCell>
                      <CTableDataCell className="fw-bold text-success">{row.rowTotal}</CTableDataCell>

                      {row.isFirstRow && (
                        <CTableDataCell rowSpan={row.rowSpan} className="text-center">
                          <div className="d-flex justify-content-center gap-2">
                            <CButton
                              color="primary"
                              onClick={() =>
                                navigate(`/updateDrillingForm/${row.drillingRecordId}`, {
                                  state: { drillingRecordId: row.drillingRecordId },
                                })
                              }
                            >
                              <CIcon icon={cilPencil} />
                            </CButton>
                            <CButton
                              color="danger"
                              onClick={() => openDeleteModal(row.drillingRecordId)}
                            >
                              <CIcon icon={cilTrash} />
                            </CButton>
                          </div>
                        </CTableDataCell>
                      )}
                    </CTableRow>
                  ))}
                </CTableBody>

                {/* Footer with totals */}
                <CTableFoot>
                  <CTableRow style={{ backgroundColor: '#f0f0f0', fontWeight: 'bold' }}>
                    <CTableDataCell colSpan={11} className="text-end">TOTAL</CTableDataCell>
                    <CTableDataCell className="text-center">{tableTotals.workPoint.toFixed(2)}</CTableDataCell>
                    <CTableDataCell className="text-center">{tableTotals.workRate.toFixed(2)}</CTableDataCell>
                    <CTableDataCell className="text-center text-primary">{tableTotals.workTotal.toFixed(2)}</CTableDataCell>
                    <CTableDataCell></CTableDataCell>
                    <CTableDataCell className="text-center">{tableTotals.surveyPoint.toFixed(2)}</CTableDataCell>
                    <CTableDataCell className="text-center">{tableTotals.surveyRate.toFixed(2)}</CTableDataCell>
                    <CTableDataCell className="text-center text-primary">{tableTotals.surveyTotal.toFixed(2)}</CTableDataCell>
                    <CTableDataCell className="text-center text-success">{tableTotals.grandTotal.toFixed(2)}</CTableDataCell>
                    <CTableDataCell></CTableDataCell>
                  </CTableRow>
                </CTableFoot>
              </CTable>
            </div>
          </CCardBody>
        </CCard>
      )}

      {/* Confirmation Modal */}
      <CModal visible={visible} onClose={() => setVisible(false)} backdrop="static">
        <CModalHeader onClose={() => setVisible(false)}>
          <CModalTitle>Delete drilling record?</CModalTitle>
        </CModalHeader>
        <CModalBody>
          Do you really want to{" "}
          <span className="text-danger fw-bold">Delete</span> this record?
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            variant="outline"
            onClick={() => setVisible(false)}
            disabled={loading}
          >
            Close
          </CButton>
          <CButton
            color="danger"
            disabled={loading}
            onClick={handleDelete}
          >
            {loading ? "Deleting…" : "Yes"}
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  )
}

export default InfraDetailsShowTable

