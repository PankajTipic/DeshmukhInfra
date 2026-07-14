// worklogExportUtils.js
// Standalone export helpers for the Work Log Report table.
// Import these into any component that has the flattened `rows` array
// and the computed `tableTotals` object.

import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

/**
 * Download the Work Log Report as an Excel (.xlsx) file.
 *
 * @param {Object} params
 * @param {Array}  params.rows          - Flattened row data (same shape as table rows)
 * @param {Object} params.tableTotals   - Precomputed totals object
 * @param {string} [params.startDate]   - Applied filter: start date (yyyy-mm-dd)
 * @param {string} [params.endDate]     - Applied filter: end date (yyyy-mm-dd)
 * @param {string} [params.projectName] - Applied filter: project name
 * @param {string} [params.fileName]    - Output file name (default: WorkLogReport.xlsx)
 */
export const downloadWorkLogExcel = ({
  rows,
  tableTotals,
  startDate,
  endDate,
  projectName,
  fileName = 'WorkLogReport.xlsx',
}) => {
  // Title and filter info
  const titleRow = ['Work Log Report']
  const emptyRow = []

  // Filter information
  const filterRows = []
  if (startDate || endDate || projectName) {
    filterRows.push(['Applied Filters:'])
    if (startDate && endDate) {
      filterRows.push([
        'Date Range:',
        `${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`,
      ])
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
    'Machine Diesel Used',
    'Machine Diesel Bal',
    'Compressor rpm Start',
    'Compressor rpm End',
    'Compressor rpm Hr',
    'Comp Diesel Used',
    'Comp Diesel Bal',
    'Work Type',
    'Point',
    'Rate',
    'Work Total',
    'Work Hrs',
    'Work Diesel',
    'Survey Type',
    'Survey Point',
    'Survey Rate',
    'Survey Total',
    'Survey Hrs',
    'Survey Diesel',
    'Grand Total',
  ]

  const data = rows.map((row) => [
    row.srNo,
    new Date(row.date).toLocaleDateString(),
    row.site,
    row.operator,
    row.machineStart,
    row.machineEnd,
    row.machineHr,
    row.machineDieselUsed,
    row.machineDieselBalance,
    row.compressorStart,
    row.compressorEnd,
    row.compressorHr,
    row.compressorDieselUsed,
    row.compressorDieselBalance,
    row.workType,
    row.workPoint,
    row.workRate,
    row.workTotal,
    row.workHrs,
    row.workDiesel,
    row.surveyType,
    row.surveyPoint,
    row.surveyRate,
    row.surveyTotal,
    row.surveyHrs,
    row.surveyDiesel,
    row.rowTotal,
  ])

  // Totals row
  const totalsRow = [
    '', '', '', '',
    '', '', '',
    tableTotals.machineDieselUsed.toFixed(2), '',
    '', '', '',
    tableTotals.compressorDieselUsed.toFixed(2), '',
    'TOTAL',
    tableTotals.workPoint.toFixed(2),
    tableTotals.workRate.toFixed(2),
    tableTotals.workTotal.toFixed(2),
    tableTotals.workHrs.toFixed(2),
    tableTotals.workDiesel.toFixed(2),
    '',
    tableTotals.surveyPoint.toFixed(2),
    tableTotals.surveyRate.toFixed(2),
    tableTotals.surveyTotal.toFixed(2),
    tableTotals.surveyHrs.toFixed(2),
    tableTotals.surveyDiesel.toFixed(2),
    tableTotals.grandTotal.toFixed(2),
  ]

  // Combine all rows
  const allRows = [titleRow, emptyRow, ...filterRows, headers, ...data, emptyRow, totalsRow]

  const worksheet = XLSX.utils.aoa_to_sheet(allRows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'WorkLogReport')

  // Style title (merge cells)
  worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 18 } }]

  // Auto column width
  const colWidths = headers.map((h, i) => ({
    wch: Math.max(h.length, ...data.map((r) => (r[i] ? r[i].toString().length : 0))) + 2,
  }))
  worksheet['!cols'] = colWidths

  XLSX.writeFile(workbook, fileName)
}

/**
 * Download the Work Log Report as a PDF file, with a full company
 * letterhead-style header (logo, name, address, phone, email, GSTIN)
 * repeated on every page, followed by the data table.
 *
 * @param {Object} params
 * @param {Array}  params.rows          - Flattened row data (same shape as table rows)
 * @param {Object} params.tableTotals   - Precomputed totals object
 * @param {string} [params.startDate]   - Applied filter: start date (yyyy-mm-dd)
 * @param {string} [params.endDate]     - Applied filter: end date (yyyy-mm-dd)
 * @param {string} [params.projectName] - Applied filter: project name
 * @param {Object} [params.companyInfo] - Company info object (logo, company_name, land_mark, phone_no, email_id, gst_number)
 * @param {string} params.host          - API host, used to build the logo image URL
 * @param {string} [params.fileName]    - Output file name (default: WorkLogReport.pdf)
 */
export const downloadWorkLogPDF = ({
  rows,
  tableTotals,
  startDate,
  endDate,
  projectName,
  companyInfo = {},
  host,
  fileName = 'WorkLogReport.pdf',
}) => {
  const doc = new jsPDF('l', 'mm', 'a4') // landscape A4

  // ───────────────────────────────────────────────
  // COMPANY HEADER & STYLING
  // ───────────────────────────────────────────────
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 12

  // ───────────────────────────────────────────────
  // Draw header function
  // ───────────────────────────────────────────────
  const drawHeader = () => {
    const headerTop = margin + 6 // logo & company name same distance from top border

    // Outer page border (light gray)
    doc.setDrawColor(80, 80, 80)
    doc.setLineWidth(0.4)
    doc.rect(margin, margin, pageWidth - margin * 2, pageHeight - margin * 2)

    // ───────────────────────────────────────────────
    // Company logo – REAL IMAGE (Right aligned)
    // ───────────────────────────────────────────────
    const logoSize = 26
    const logoX = pageWidth - margin - logoSize - 6
    const logoY = headerTop

    let logoUrl = null
    if (companyInfo.logo && companyInfo.logo !== 'invoice/empty.png') {
      logoUrl = `${host}/img/${companyInfo.logo}`
    }
    if (logoUrl) {
      try {
        doc.addImage(logoUrl, 'PNG', logoX, logoY, logoSize, logoSize)
      } catch (err) {
        console.warn('Failed to load logo:', err)
        doc.setFillColor(220, 220, 240)
        doc.rect(logoX, logoY, logoSize, logoSize, 'F')
        doc.setFontSize(9)
        doc.setTextColor(100)
        doc.text('LOGO', logoX + 8, logoY + 15)
      }
    } else {
      doc.setFillColor(220, 220, 240)
      doc.rect(logoX, logoY, logoSize, logoSize, 'F')
      doc.setFontSize(9)
      doc.setTextColor(100)
      doc.text('LOGO', logoX + 8, logoY + 15)
    }

    // ───────────────────────────────────────────────
    // Company name & details (Left Aligned)
    // ───────────────────────────────────────────────
    const headerTextX = margin + 8

    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(40, 40, 60)
    doc.text(companyInfo.company_name || 'Deshmukh Infra Soft', headerTextX, headerTop + 8)

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(70)
    
    // Address on one line, other info below
    const address = companyInfo.land_mark || 'Urali Kanchan, Pune'
    doc.text(address, headerTextX, headerTop + 14)
    
    const contactLine = `Phone: ${companyInfo.phone_no || '9173635656'}   |   Email: ${companyInfo.email_id || 'shreyas.gijare.21@gmail.com'}`
    doc.text(contactLine, headerTextX, headerTop + 19)
    
    const gstLine = `GSTIN: ${companyInfo.gst_number || 'Not Available'}`
    doc.text(gstLine, headerTextX, headerTop + 24)

    const detailY = headerTop + 28

    // Horizontal separator line after header
    doc.setLineWidth(0.6)
    doc.setDrawColor(0, 0, 0)
    doc.line(margin + 6, detailY, pageWidth - margin - 6, detailY)

    // Title
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0)
    const titleText = 'Work Log Report'
    doc.text(titleText, pageWidth / 2, detailY + 10, { align: 'center' })

    // Return the Y position after the title + space
    return detailY + 18
  }

  // Draw header for the first page
  const headerBottomY = drawHeader()

  // ───────────────────────────────────────────────
  // FILTER INFORMATION (if any) - only on first page
  // ───────────────────────────────────────────────
  let startY = headerBottomY
  if (startDate || endDate || projectName) {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(60)
    doc.text('Applied Filters:', margin + 8, startY)
    startY += 6
    if (startDate && endDate) {
      const range = `${new Date(startDate).toLocaleDateString('en-GB')} to ${new Date(
        endDate,
      ).toLocaleDateString('en-GB')}`
      doc.text(`Date Range: ${range}`, margin + 8, startY)
      startY += 5.5
    }
    if (projectName) {
      doc.text(`Project: ${projectName}`, margin + 8, startY)
      startY += 5.5
    }
    startY += 6 // extra spacing before table
  }

  // ───────────────────────────────────────────────
  // TABLE
  // ───────────────────────────────────────────────
  const tableColumn = [
    'Sr', 'Date', 'Site', 'Opr',
    'M.Strt', 'M.End', 'M.Hr', 'M.D.Usd', 'M.D.Bal',
    'C.Strt', 'C.End', 'C.Hr', 'C.D.Usd', 'C.D.Bal',
    'WrkTyp', 'Pt', 'Rate', 'W.Tot', 'W.Hr', 'W.Dsl',
    'SrvTyp', 'Pt', 'Rate', 'S.Tot', 'S.Hr', 'S.Dsl', 'Gr.Tot',
  ]

  const tableRows = rows.map((row) => [
    row.srNo,
    new Date(row.date).toLocaleDateString('en-GB'),
    row.site,
    row.operator,
    row.machineStart,
    row.machineEnd,
    row.machineHr,
    row.machineDieselUsed,
    row.machineDieselBalance,
    row.compressorStart,
    row.compressorEnd,
    row.compressorHr,
    row.compressorDieselUsed,
    row.compressorDieselBalance,
    row.workType,
    row.workPoint,
    row.workRate,
    row.workTotal,
    row.workHrs,
    row.workDiesel,
    row.surveyType,
    row.surveyPoint,
    row.surveyRate,
    row.surveyTotal,
    row.surveyHrs,
    row.surveyDiesel,
    row.rowTotal,
  ])

  tableRows.push([
    '', '', '', '',
    '', '', '', tableTotals.machineDieselUsed.toFixed(2), '',
    '', '', '', tableTotals.compressorDieselUsed.toFixed(2), '',
    'TOTAL',
    tableTotals.workPoint.toFixed(2),
    tableTotals.workRate.toFixed(2),
    tableTotals.workTotal.toFixed(2),
    tableTotals.workHrs.toFixed(2),
    tableTotals.workDiesel.toFixed(2),
    '',
    tableTotals.surveyPoint.toFixed(2),
    tableTotals.surveyRate.toFixed(2),
    tableTotals.surveyTotal.toFixed(2),
    tableTotals.surveyHrs.toFixed(2),
    tableTotals.surveyDiesel.toFixed(2),
    tableTotals.grandTotal.toFixed(2),
  ])

  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: startY,
    theme: 'grid',
    margin: { top: headerBottomY, left: margin + 6, right: margin + 6, bottom: margin },
    styles: {
      fontSize: 6.5,
      cellPadding: 1,
      overflow: 'linebreak',
      halign: 'center',
      valign: 'middle',
      lineColor: [44, 62, 80],
      lineWidth: 0.3,
    },
    headStyles: {
      fillColor: [52, 73, 94],
      textColor: 255,
      fontSize: 6.5,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
    footStyles: {
      fillColor: [220, 220, 220],
      textColor: 0,
      fontStyle: 'bold',
      fontSize: 6.5,
    },
    didParseCell: (data) => {
      if (data.row.index === tableRows.length - 1) {
        data.cell.styles.fontStyle = 'bold'
        data.cell.styles.fillColor = [235, 235, 235]
      }
      if (['Work Total', 'Survey Total', 'Grand Total'].includes(data.column.dataKey)) {
        data.cell.styles.textColor = [0, 128, 0]
      }
    },
    addPageContent: () => {
      drawHeader()
    },
    showHead: 'everyPage',
    rowPageBreak: 'avoid',
  })

  doc.save(fileName)
}

// ─────────────────────────────────────────────────────────────────
// MULTI-SITE BREAKDOWN EXPORTS
// (data shape: array of site objects, each with project_name,
// total_done, total_hrs, total_fuel, avg_yield, and a work_types array)
// ─────────────────────────────────────────────────────────────────

/**
 * Flattens the multi-site breakdown data into one row per work type
 * (one row with blank work-type fields if a site has no work types).
 */
const flattenMultiSiteData = (multiSiteData) => {
  const flattened = []
  multiSiteData.forEach((site) => {
    const workTypes = site.work_types && site.work_types.length > 0 ? site.work_types : [{}]
    workTypes.forEach((wt, idx) => {
      flattened.push({
        isFirstRow: idx === 0,
        rowSpan: workTypes.length,
        projectName: site.project_name || '',
        totalDone: site.total_done ?? '',
        totalHrs: site.total_hrs ?? '',
        totalFuel: site.total_fuel ?? '',
        avgYield: site.avg_yield ?? '',
        typeName: wt.type_name || '',
        uom: wt.uom || '',
        done: wt.done ?? '',
        hrs: wt.hrs ?? '',
        fuel: wt.fuel ?? '',
        workPerHr: wt.work_per_hr ?? '',
        workPerL: wt.work_per_l ?? '',
      })
    })
  })
  return flattened
}

/**
 * Download the Multi-Site Breakdown tab as an Excel (.xlsx) file.
 *
 * @param {Object} params
 * @param {Array}  params.multiSiteData - Array of site objects as used in the tab
 * @param {string} [params.date]        - The selected "Active Day" (yyyy-mm-dd)
 * @param {string} [params.fileName]    - Output file name (default: MultiSiteBreakdown.xlsx)
 */
export const downloadMultiSiteExcel = ({ multiSiteData, date, fileName = 'MultiSiteBreakdown.xlsx' }) => {
  const titleRow = ['Multi-Site Breakdown Report']
  const emptyRow = []

  const infoRows = []
  if (date) {
    infoRows.push(['Active Day:', new Date(date).toLocaleDateString('en-GB')])
    infoRows.push(emptyRow)
  }

  const headers = [
    'Project Location',
    'Total Work Done',
    'Total Hours Logged',
    'Fuel Consumed (L)',
    'Avg Drilling Yield (M/Hr)',
    'Work Type',
    'UOM',
    'Done',
    'Hrs',
    'Fuel (L)',
    'Work/Hr',
    'Work/L',
  ]

  const flatRows = flattenMultiSiteData(multiSiteData || [])

  const data = flatRows.map((row) => [
    row.isFirstRow ? row.projectName : '',
    row.isFirstRow ? row.totalDone : '',
    row.isFirstRow ? row.totalHrs : '',
    row.isFirstRow ? row.totalFuel : '',
    row.isFirstRow ? row.avgYield : '',
    row.typeName,
    row.uom,
    row.done,
    row.hrs,
    row.fuel,
    row.workPerHr,
    row.workPerL,
  ])

  const allRows = [titleRow, emptyRow, ...infoRows, headers, ...data]

  const worksheet = XLSX.utils.aoa_to_sheet(allRows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'MultiSiteBreakdown')

  worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 11 } }]

  const colWidths = headers.map((h, i) => ({
    wch: Math.max(h.length, ...data.map((r) => (r[i] ? r[i].toString().length : 0))) + 2,
  }))
  worksheet['!cols'] = colWidths

  XLSX.writeFile(workbook, fileName)
}

/**
 * Download the Multi-Site Breakdown tab as a PDF file, using the same
 * company letterhead-style header as the Work Log Report PDF.
 *
 * @param {Object} params
 * @param {Array}  params.multiSiteData - Array of site objects as used in the tab
 * @param {string} [params.date]        - The selected "Active Day" (yyyy-mm-dd)
 * @param {Object} [params.companyInfo] - Company info object (logo, company_name, land_mark, phone_no, email_id, gst_number)
 * @param {string} params.host          - API host, used to build the logo image URL
 * @param {string} [params.fileName]    - Output file name (default: MultiSiteBreakdown.pdf)
 */
export const downloadMultiSitePDF = ({
  multiSiteData,
  date,
  companyInfo = {},
  host,
  fileName = 'MultiSiteBreakdown.pdf',
}) => {
  const doc = new jsPDF('l', 'mm', 'a4') // landscape A4

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 12

  const drawHeader = () => {
    const headerTop = margin + 6

    doc.setDrawColor(80, 80, 80)
    doc.setLineWidth(0.4)
    doc.rect(margin, margin, pageWidth - margin * 2, pageHeight - margin * 2)

    // Company logo – REAL IMAGE (Right aligned)
    const logoSize = 26
    const logoX = pageWidth - margin - logoSize - 6
    const logoY = headerTop

    let logoUrl = null
    if (companyInfo.logo && companyInfo.logo !== 'invoice/empty.png') {
      logoUrl = `${host}/img/${companyInfo.logo}`
    }
    if (logoUrl) {
      try {
        doc.addImage(logoUrl, 'PNG', logoX, logoY, logoSize, logoSize)
      } catch (err) {
        console.warn('Failed to load logo:', err)
        doc.setFillColor(220, 220, 240)
        doc.rect(logoX, logoY, logoSize, logoSize, 'F')
        doc.setFontSize(9)
        doc.setTextColor(100)
        doc.text('LOGO', logoX + 8, logoY + 15)
      }
    } else {
      doc.setFillColor(220, 220, 240)
      doc.rect(logoX, logoY, logoSize, logoSize, 'F')
      doc.setFontSize(9)
      doc.setTextColor(100)
      doc.text('LOGO', logoX + 8, logoY + 15)
    }

    // Company name & details (Left Aligned)
    const headerTextX = margin + 8

    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(40, 40, 60)
    doc.text(companyInfo.company_name || 'Deshmukh Infra Soft', headerTextX, headerTop + 8)

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(70)
    
    const address = companyInfo.land_mark || 'Urali Kanchan, Pune'
    doc.text(address, headerTextX, headerTop + 14)
    
    const contactLine = `Phone: ${companyInfo.phone_no || '9173635656'}   |   Email: ${companyInfo.email_id || 'shreyas.gijare.21@gmail.com'}`
    doc.text(contactLine, headerTextX, headerTop + 19)
    
    const gstLine = `GSTIN: ${companyInfo.gst_number || 'Not Available'}`
    doc.text(gstLine, headerTextX, headerTop + 24)

    const detailY = headerTop + 28

    doc.setLineWidth(0.6)
    doc.setDrawColor(0, 0, 0)
    doc.line(margin + 6, detailY, pageWidth - margin - 6, detailY)

    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0)
    doc.text('Multi-Site Breakdown Report', pageWidth / 2, detailY + 10, { align: 'center' })

    return detailY + 18
  }

  if (!multiSiteData || multiSiteData.length === 0) {
    drawHeader()
    doc.setFontSize(12)
    doc.text("No data available for the selected date.", pageWidth / 2, 80, { align: 'center' })
    doc.save(fileName)
    return
  }

  multiSiteData.forEach((site, index) => {
    if (index > 0) {
      doc.addPage()
    }
    const headerBottomY = drawHeader()
    
    let startY = headerBottomY
    
    if (date) {
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(60)
      doc.text(`Active Day: ${new Date(date).toLocaleDateString('en-GB')}`, margin + 8, startY)
      startY += 8
    }
    
    // Project Name
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(40, 40, 60)
    doc.text(`PROJECT LOCATION: ${site.project_name}`, margin + 8, startY)
    startY += 8

    // Metrics Blocks
    const summaryWidth = (pageWidth - margin * 2 - 16) / 4
    doc.setDrawColor(200, 200, 200)
    doc.setLineWidth(0.2)
    
    const metrics = [
      { label: "TOTAL WORK DONE", val: site.total_done },
      { label: "TOTAL HOURS LOGGED", val: `${site.total_hrs} Hrs` },
      { label: "FUEL CONSUMED", val: `${site.total_fuel} L` },
      { label: "AVG DRILLING YIELD", val: `${site.avg_yield} M/Hr` }
    ]

    metrics.forEach((m, i) => {
      const bx = margin + 8 + (i * summaryWidth)
      doc.setFillColor(248, 249, 250)
      doc.rect(bx, startY, summaryWidth - 3, 18, 'FD')
      
      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(100)
      doc.text(m.label, bx + 3, startY + 6)
      
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(20, 20, 20)
      doc.text(String(m.val), bx + 3, startY + 14)
    })

    startY += 24

    const tableColumn = [
      'Work Type',
      'UOM',
      'Done',
      'Hrs',
      'Fuel (L)',
      'Work/Hr',
      'Work/L',
    ]

    const tableRows = (site.work_types || []).map((wt) => [
      wt.type_name,
      wt.uom,
      wt.done,
      wt.hrs,
      wt.fuel,
      wt.work_per_hr,
      wt.work_per_l,
    ])

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: startY,
      theme: 'grid',
      margin: { left: margin + 8, right: margin + 8, bottom: margin },
      styles: {
        fontSize: 9,
        cellPadding: 4,
        overflow: 'linebreak',
        halign: 'center',
        valign: 'middle',
        lineColor: [44, 62, 80],
        lineWidth: 0.3,
      },
      headStyles: {
        fillColor: [52, 73, 94],
        textColor: 255,
        fontSize: 9,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250],
      },
      didParseCell: (data) => {
        if (['Work/Hr', 'Work/L'].includes(data.column.dataKey)) {
          data.cell.styles.textColor = [0, 128, 0]
        }
      },
    })
  })

  doc.save(fileName)
}