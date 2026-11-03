// worklogExportUtils.js
// Standalone export helpers for Work Log Reports, Separate Drilling & Casting Reports, and Multi-Site Breakdown.

import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

/**
 * Shared helper to draw the company letterhead and outer page border.
 * Matches the Work Log Report PDF letterhead layout exactly.
 */
const drawCompanyHeader = ({
  doc,
  companyInfo = {},
  host,
  pageWidth,
  pageHeight,
  margin = 12,
  titleText = 'Work Log Report',
}) => {
  const headerTop = margin + 6

  // Outer page border (dark gray)
  doc.setDrawColor(80, 80, 80)
  doc.setLineWidth(0.4)
  doc.rect(margin, margin, pageWidth - margin * 2, pageHeight - margin * 2)

  // Company logo (Right aligned)
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

  // Company details (Left Aligned)
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

  // Horizontal separator line after header
  doc.setLineWidth(0.6)
  doc.setDrawColor(0, 0, 0)
  doc.line(margin + 6, detailY, pageWidth - margin - 6, detailY)

  // Title
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0)
  doc.text(titleText, pageWidth / 2, detailY + 10, { align: 'center' })

  // Return Y position after title
  return detailY + 18
}

/**
 * Helper to safely extract compressor / machine reading values without dropping 0
 */
const getFieldVal = (row, key1, key2) => {
  const val = row[key1] != null && row[key1] !== '—' ? row[key1] : (row[key2] != null && row[key2] !== '—' ? row[key2] : '')
  return val
}

// ─────────────────────────────────────────────────────────────────
// 1. WORK LOG REPORT EXPORTS (Combined Table)
// ─────────────────────────────────────────────────────────────────

/**
 * Download the Work Log Report as an Excel (.xlsx) file with full compressor details.
 */
export const downloadWorkLogExcel = ({
  rows,
  tableTotals = {},
  startDate,
  endDate,
  projectName,
  workType,
  surveyType,
  fileName = 'WorkLogReport.xlsx',
}) => {
  const titleRow = ['Work Log Report']
  const emptyRow = []

  const filterRows = []
  if (startDate || endDate || projectName || workType || surveyType) {
    filterRows.push(['Applied Filters:'])
    if (startDate && endDate) {
      filterRows.push([
        'Date Range:',
        `${new Date(startDate).toLocaleDateString('en-GB')} to ${new Date(endDate).toLocaleDateString('en-GB')}`,
      ])
    }
    if (projectName) filterRows.push(['Project:', projectName])
    if (workType) filterRows.push(['Work Type:', workType])
    if (surveyType) filterRows.push(['Survey Type:', surveyType])
    filterRows.push(emptyRow)
  }

  const headers = [
    'Sr.No.',
    'Date',
    'Site',
    'Supervisor',
    'Operator/Helper',
    'Machine Name',
    'Machine Start',
    'Machine End',
    'Machine Hr',
    'Machine Diesel Filed',
    'Machine Diesel Used',
    'Machine Diesel Bal',
    'Machine Diesel Avg',
    'Compressor Machine',
    'Compressor rpm Start',
    'Compressor rpm End',
    'Compressor rpm Hr',
    'Comp Diesel Filed',
    'Comp Diesel Used',
    'Comp Diesel Bal',
    'Comp Diesel Avg',
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
    row.date ? new Date(row.date).toLocaleDateString('en-GB') : '',
    row.site === '—' ? '' : (row.site || ''),
    row.supervisor === '—' ? '' : (row.supervisor || ''),
    row.operator === '—' ? '' : (row.operator || ''),
    row.machineName === '—' ? '' : (row.machineName || ''),
    row.machineStart === '—' ? '' : (row.machineStart ?? ''),
    row.machineEnd === '—' ? '' : (row.machineEnd ?? ''),
    row.machineHr === '—' ? '' : (row.machineHr ?? ''),
    row.machineDieselFilled === '—' ? '' : (row.machineDieselFilled ?? ''),
    row.machineDieselUsed === '—' ? '' : (row.machineDieselUsed ?? ''),
    row.machineDieselBalance === '—' ? '' : (row.machineDieselBalance ?? ''),
    row.machineDieselAvg === '—' ? '' : (row.machineDieselAvg ?? ''),
    (row.compressorMachineName || row.compMachineName || '') === '—' ? '' : (row.compressorMachineName || row.compMachineName || ''),
    getFieldVal(row, 'compressorStart', 'compStart'),
    getFieldVal(row, 'compressorEnd', 'compEnd'),
    getFieldVal(row, 'compressorHr', 'compHr'),
    getFieldVal(row, 'compressorDieselFilled', 'compDieselFilled'),
    getFieldVal(row, 'compressorDieselUsed', 'compDieselUsed'),
    getFieldVal(row, 'compressorDieselBalance', 'compDieselBalance'),
    getFieldVal(row, 'compressorDieselAvg', 'compDieselAvg'),
    row.workType === '—' ? '' : (row.workType || ''),
    row.workPoint === '—' ? '' : (row.workPoint ?? ''),
    row.workRate === '—' ? '' : (row.workRate ?? ''),
    row.workTotal != null ? Number(row.workTotal).toFixed(2) : '0.00',
    row.workHrs === '—' ? '' : (row.workHrs ?? ''),
    row.workDiesel === '—' ? '' : (row.workDiesel ?? ''),
    row.surveyType === '—' ? '' : (row.surveyType || ''),
    row.surveyPoint === '—' ? '' : (row.surveyPoint ?? ''),
    row.surveyRate === '—' ? '' : (row.surveyRate ?? ''),
    row.surveyTotal != null ? Number(row.surveyTotal).toFixed(2) : '0.00',
    row.surveyHrs === '—' ? '' : (row.surveyHrs ?? ''),
    row.surveyDiesel === '—' ? '' : (row.surveyDiesel ?? ''),
    row.rowTotal != null ? Number(row.rowTotal).toFixed(2) : '0.00',
  ])

  const totalsRow = [
    '', '', '', '', '', // Sr, Date, Site, Supervisor, Operator
    '', '', '', '', // Machine Name, Start, End, Hr
    (parseFloat(tableTotals.machineDieselFilled) || 0).toFixed(2),
    (parseFloat(tableTotals.machineDieselUsed) || 0).toFixed(2),
    '', '', // Bal, Avg
    '', '', '', '', // Comp Machine, Start, End, Hr
    (parseFloat(tableTotals.compressorDieselFilled) || 0).toFixed(2),
    (parseFloat(tableTotals.compressorDieselUsed) || 0).toFixed(2),
    '', '', // Bal, Avg
    'TOTAL',
    (parseFloat(tableTotals.workPoint) || 0).toFixed(2),
    (parseFloat(tableTotals.workRate) || 0).toFixed(2),
    (parseFloat(tableTotals.workTotal) || 0).toFixed(2),
    (parseFloat(tableTotals.workHrs) || 0).toFixed(2),
    (parseFloat(tableTotals.workDiesel) || 0).toFixed(2),
    '',
    (parseFloat(tableTotals.surveyPoint) || 0).toFixed(2),
    (parseFloat(tableTotals.surveyRate) || 0).toFixed(2),
    (parseFloat(tableTotals.surveyTotal) || 0).toFixed(2),
    (parseFloat(tableTotals.surveyHrs) || 0).toFixed(2),
    (parseFloat(tableTotals.surveyDiesel) || 0).toFixed(2),
    (parseFloat(tableTotals.grandTotal) || 0).toFixed(2),
  ]

  const allRows = [titleRow, emptyRow, ...filterRows, headers, ...data, emptyRow, totalsRow]
  const worksheet = XLSX.utils.aoa_to_sheet(allRows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'WorkLogReport')

  worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } }]

  const colWidths = headers.map((h, i) => ({
    wch: Math.max(h.length, ...data.map((r) => (r[i] != null && r[i] !== '' ? r[i].toString().length : 0))) + 2,
  }))
  worksheet['!cols'] = colWidths

  XLSX.writeFile(workbook, fileName)
}

/**
 * Download the Work Log Report as a PDF file with complete company header repeated on every page.
 */
export const downloadWorkLogPDF = ({
  rows,
  tableTotals = {},
  startDate,
  endDate,
  projectName,
  workType,
  surveyType,
  companyInfo = {},
  host,
  fileName = 'WorkLogReport.pdf',
}) => {
  const doc = new jsPDF('l', 'mm', 'a4')
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 12

  const drawHeader = () => {
    return drawCompanyHeader({
      doc,
      companyInfo,
      host,
      pageWidth,
      pageHeight,
      margin,
      titleText: 'Work Log Report',
    })
  }

  const headerBottomY = drawHeader()
  let startY = headerBottomY

  if (startDate || endDate || projectName || workType || surveyType) {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(60)
    doc.text('Applied Filters:', margin + 8, startY)
    startY += 6
    if (startDate && endDate) {
      const range = `${new Date(startDate).toLocaleDateString('en-GB')} to ${new Date(endDate).toLocaleDateString('en-GB')}`
      doc.text(`Date Range: ${range}`, margin + 8, startY)
      startY += 5.5
    }
    if (projectName) {
      doc.text(`Project: ${projectName}`, margin + 8, startY)
      startY += 5.5
    }
    if (workType) {
      doc.text(`Work Type: ${workType}`, margin + 8, startY)
      startY += 5.5
    }
    if (surveyType) {
      doc.text(`Survey Type: ${surveyType}`, margin + 8, startY)
      startY += 5.5
    }
    startY += 6
  }

  const tableColumn = [
    'Sr', 'Date', 'Site', 'Supervisor', 'Opr',
    'Machine', 'M.Strt', 'M.End', 'M.Hr', 'M.D.Fld', 'M.D.Usd', 'M.D.Bal', 'M.D.Avg',
    'Comp', 'C.Strt', 'C.End', 'C.Hr', 'C.D.Fld', 'C.D.Usd', 'C.D.Bal', 'C.D.Avg',
    'WrkTyp', 'Pt', 'Rate', 'W.Tot', 'W.Hr', 'W.Dsl',
    'SrvTyp', 'Pt', 'Rate', 'S.Tot', 'S.Hr', 'S.Dsl', 'Gr.Tot',
  ]

  const tableRows = rows.map((row) => [
    row.srNo,
    row.date ? new Date(row.date).toLocaleDateString('en-GB') : '',
    row.site === '—' ? '' : (row.site || ''),
    row.supervisor === '—' ? '' : (row.supervisor || ''),
    row.operator === '—' ? '' : (row.operator || ''),
    row.machineName === '—' ? '' : (row.machineName || ''),
    row.machineStart === '—' ? '' : (row.machineStart ?? ''),
    row.machineEnd === '—' ? '' : (row.machineEnd ?? ''),
    row.machineHr === '—' ? '' : (row.machineHr ?? ''),
    row.machineDieselFilled === '—' ? '' : (row.machineDieselFilled ?? ''),
    row.machineDieselUsed === '—' ? '' : (row.machineDieselUsed ?? ''),
    row.machineDieselBalance === '—' ? '' : (row.machineDieselBalance ?? ''),
    row.machineDieselAvg === '—' ? '' : (row.machineDieselAvg ?? ''),
    (row.compressorMachineName || row.compMachineName || '') === '—' ? '' : (row.compressorMachineName || row.compMachineName || ''),
    getFieldVal(row, 'compressorStart', 'compStart'),
    getFieldVal(row, 'compressorEnd', 'compEnd'),
    getFieldVal(row, 'compressorHr', 'compHr'),
    getFieldVal(row, 'compressorDieselFilled', 'compDieselFilled'),
    getFieldVal(row, 'compressorDieselUsed', 'compDieselUsed'),
    getFieldVal(row, 'compressorDieselBalance', 'compDieselBalance'),
    getFieldVal(row, 'compressorDieselAvg', 'compDieselAvg'),
    row.workType === '—' ? '' : (row.workType || ''),
    row.workPoint === '—' ? '' : (row.workPoint ?? ''),
    row.workRate === '—' ? '' : (row.workRate ?? ''),
    row.workTotal != null ? Number(row.workTotal).toFixed(2) : '0.00',
    row.workHrs === '—' ? '' : (row.workHrs ?? ''),
    row.workDiesel === '—' ? '' : (row.workDiesel ?? ''),
    row.surveyType === '—' ? '' : (row.surveyType || ''),
    row.surveyPoint === '—' ? '' : (row.surveyPoint ?? ''),
    row.surveyRate === '—' ? '' : (row.surveyRate ?? ''),
    row.surveyTotal != null ? Number(row.surveyTotal).toFixed(2) : '0.00',
    row.surveyHrs === '—' ? '' : (row.surveyHrs ?? ''),
    row.surveyDiesel === '—' ? '' : (row.surveyDiesel ?? ''),
    row.rowTotal != null ? Number(row.rowTotal).toFixed(2) : '0.00',
  ])

  tableRows.push([
    '', '', '', '', '',
    '', '', '', '',
    (parseFloat(tableTotals.machineDieselFilled) || 0).toFixed(2),
    (parseFloat(tableTotals.machineDieselUsed) || 0).toFixed(2),
    '', '',
    '', '', '', '',
    (parseFloat(tableTotals.compressorDieselFilled) || 0).toFixed(2),
    (parseFloat(tableTotals.compressorDieselUsed) || 0).toFixed(2),
    '', '',
    'TOTAL',
    (parseFloat(tableTotals.workPoint) || 0).toFixed(2),
    (parseFloat(tableTotals.workRate) || 0).toFixed(2),
    (parseFloat(tableTotals.workTotal) || 0).toFixed(2),
    (parseFloat(tableTotals.workHrs) || 0).toFixed(2),
    (parseFloat(tableTotals.workDiesel) || 0).toFixed(2),
    '',
    (parseFloat(tableTotals.surveyPoint) || 0).toFixed(2),
    (parseFloat(tableTotals.surveyRate) || 0).toFixed(2),
    (parseFloat(tableTotals.surveyTotal) || 0).toFixed(2),
    (parseFloat(tableTotals.surveyHrs) || 0).toFixed(2),
    (parseFloat(tableTotals.surveyDiesel) || 0).toFixed(2),
    (parseFloat(tableTotals.grandTotal) || 0).toFixed(2),
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
      if (['W.Tot', 'S.Tot', 'Gr.Tot'].includes(data.column.dataKey)) {
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
// 2. SEPARATE DRILLING WORK LOG REPORT EXPORTS
// ─────────────────────────────────────────────────────────────────

/**
 * Download Separate Drilling Work Log Report as Excel (.xlsx).
 */
export const downloadDrillingExcel = ({
  rows,
  tableTotals = {},
  startDate,
  endDate,
  projectName,
  workType,
  drillingType,
  fileName = 'Drilling_WorkLog_Report.xlsx',
}) => {
  const titleRow = ['Drilling Work Log Report']
  const emptyRow = []

  const filterRows = []
  if (startDate || endDate || projectName || workType || drillingType) {
    filterRows.push(['Applied Filters:'])
    if (startDate && endDate) {
      filterRows.push([
        'Date Range:',
        `${new Date(startDate).toLocaleDateString('en-GB')} to ${new Date(endDate).toLocaleDateString('en-GB')}`,
      ])
    }
    if (projectName) filterRows.push(['Project:', projectName])
    if (workType) filterRows.push(['Work Type:', workType])
    if (drillingType) filterRows.push(['Drilling Type:', drillingType])
    filterRows.push(emptyRow)
  }

  const headers = [
    'Sr.No.',
    'Date',
    'Site',
    'Supervisor',
    'Operator',
    'Timing',
    'Machine Name',
    'Machine Start',
    'Machine End',
    'Machine Hr',
    'Machine Diesel Filled',
    'Machine Diesel Used',
    'Machine Diesel Bal',
    'Machine Diesel Avg',
    'Compressor Machine',
    'Compressor rpm Start',
    'Compressor rpm End',
    'Compressor rpm Hr',
    'Comp Diesel Filled',
    'Comp Diesel Used',
    'Comp Diesel Bal',
    'Comp Diesel Avg',
    'Work Type',
    'Drilling Type',
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
    row.date ? new Date(row.date).toLocaleDateString('en-GB') : '',
    row.site === '—' ? '' : (row.site || ''),
    row.supervisor === '—' ? '' : (row.supervisor || ''),
    row.operator === '—' ? '' : (row.operator || ''),
    row.startTime && row.endTime ? `${row.startTime} - ${row.endTime}` : (row.timing || ''),
    row.machineName === '—' ? '' : (row.machineName || ''),
    row.machineStart === '—' ? '' : (row.machineStart ?? ''),
    row.machineEnd === '—' ? '' : (row.machineEnd ?? ''),
    row.machineHr === '—' ? '' : (row.machineHr ?? ''),
    row.machineDieselFilled === '—' ? '' : (row.machineDieselFilled ?? ''),
    row.machineDieselUsed === '—' ? '' : (row.machineDieselUsed ?? ''),
    row.machineDieselBalance === '—' ? '' : (row.machineDieselBalance ?? ''),
    row.machineDieselAvg === '—' ? '' : (row.machineDieselAvg ?? ''),
    (row.compMachineName || row.compressorMachineName || '') === '—' ? '' : (row.compMachineName || row.compressorMachineName || ''),
    getFieldVal(row, 'compStart', 'compressorStart'),
    getFieldVal(row, 'compEnd', 'compressorEnd'),
    getFieldVal(row, 'compHr', 'compressorHr'),
    getFieldVal(row, 'compDieselFilled', 'compressorDieselFilled'),
    getFieldVal(row, 'compDieselUsed', 'compressorDieselUsed'),
    getFieldVal(row, 'compDieselBalance', 'compressorDieselBalance'),
    getFieldVal(row, 'compDieselAvg', 'compressorDieselAvg'),
    row.workType === '—' ? '' : (row.workType || ''),
    row.drillingType === '—' ? '' : (row.drillingType || ''),
    row.workPoint === '—' ? '' : (row.workPoint ?? ''),
    row.workRate === '—' ? '' : (row.workRate ?? ''),
    row.workTotal != null ? Number(row.workTotal).toFixed(2) : '0.00',
    row.workHrs === '—' ? '' : (row.workHrs ?? ''),
    row.workDiesel === '—' ? '' : (row.workDiesel ?? ''),
    row.surveyType === '—' ? '' : (row.surveyType || ''),
    row.surveyPoint === '—' ? '' : (row.surveyPoint ?? ''),
    row.surveyRate === '—' ? '' : (row.surveyRate ?? ''),
    row.surveyTotal != null ? Number(row.surveyTotal).toFixed(2) : '0.00',
    row.surveyHrs === '—' ? '' : (row.surveyHrs ?? ''),
    row.surveyDiesel === '—' ? '' : (row.surveyDiesel ?? ''),
    row.rowTotal != null ? Number(row.rowTotal).toFixed(2) : '0.00',
  ])

  const totalsRow = [
    '', '', '', '', '', '',
    '', '', '', '',
    (parseFloat(tableTotals.machineDieselFilled) || 0).toFixed(2),
    (parseFloat(tableTotals.machineDieselUsed) || 0).toFixed(2),
    '', '',
    '', '', '', '',
    (parseFloat(tableTotals.compressorDieselFilled) || 0).toFixed(2),
    (parseFloat(tableTotals.compressorDieselUsed) || 0).toFixed(2),
    '', '',
    'TOTAL',
    '',
    (parseFloat(tableTotals.workPoint) || 0).toFixed(2),
    (parseFloat(tableTotals.workRate) || 0).toFixed(2),
    (parseFloat(tableTotals.workTotal) || 0).toFixed(2),
    (parseFloat(tableTotals.workHrs) || 0).toFixed(2),
    (parseFloat(tableTotals.workDiesel) || 0).toFixed(2),
    '',
    (parseFloat(tableTotals.surveyPoint) || 0).toFixed(2),
    (parseFloat(tableTotals.surveyRate) || 0).toFixed(2),
    (parseFloat(tableTotals.surveyTotal) || 0).toFixed(2),
    (parseFloat(tableTotals.surveyHrs) || 0).toFixed(2),
    (parseFloat(tableTotals.surveyDiesel) || 0).toFixed(2),
    (parseFloat(tableTotals.grandTotal) || 0).toFixed(2),
  ]

  const allRows = [titleRow, emptyRow, ...filterRows, headers, ...data, emptyRow, totalsRow]
  const worksheet = XLSX.utils.aoa_to_sheet(allRows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Drilling')

  worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } }]

  const colWidths = headers.map((h, i) => ({
    wch: Math.max(h.length, ...data.map((r) => (r[i] != null && r[i] !== '' ? r[i].toString().length : 0))) + 2,
  }))
  worksheet['!cols'] = colWidths

  XLSX.writeFile(workbook, fileName)
}

/**
 * Download Separate Drilling Work Log Report as PDF matching the exact letterhead layout.
 */
export const downloadDrillingPDF = ({
  rows,
  tableTotals = {},
  startDate,
  endDate,
  projectName,
  workType,
  drillingType,
  companyInfo = {},
  host,
  fileName = 'Drilling_WorkLog_Report.pdf',
}) => {
  const doc = new jsPDF('l', 'mm', 'a4')
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 12

  const drawHeader = () => {
    return drawCompanyHeader({
      doc,
      companyInfo,
      host,
      pageWidth,
      pageHeight,
      margin,
      titleText: 'Drilling Work Log Report',
    })
  }

  const headerBottomY = drawHeader()
  let startY = headerBottomY

  if (startDate || endDate || projectName || workType || drillingType) {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(60)
    doc.text('Applied Filters:', margin + 8, startY)
    startY += 6
    if (startDate && endDate) {
      const range = `${new Date(startDate).toLocaleDateString('en-GB')} to ${new Date(endDate).toLocaleDateString('en-GB')}`
      doc.text(`Date Range: ${range}`, margin + 8, startY)
      startY += 5.5
    }
    if (projectName) {
      doc.text(`Project: ${projectName}`, margin + 8, startY)
      startY += 5.5
    }
    if (workType) {
      doc.text(`Work Type: ${workType}`, margin + 8, startY)
      startY += 5.5
    }
    if (drillingType) {
      doc.text(`Drilling Type: ${drillingType}`, margin + 8, startY)
      startY += 5.5
    }
    startY += 6
  }

  const tableColumn = [
    'Sr', 'Date', 'Site', 'Supervisor', 'Opr',
    'Machine', 'M.Strt', 'M.End', 'M.Hr', 'M.D.Fld', 'M.D.Usd', 'M.D.Bal', 'M.D.Avg',
    'Comp', 'C.Strt', 'C.End', 'C.Hr', 'C.D.Fld', 'C.D.Usd', 'C.D.Bal', 'C.D.Avg',
    'WrkTyp', 'Pt', 'Rate', 'W.Tot', 'W.Hr', 'W.Dsl',
    'SrvTyp', 'Pt', 'Rate', 'S.Tot', 'S.Hr', 'S.Dsl', 'Gr.Tot',
  ]

  const tableRows = rows.map((row) => [
    row.srNo,
    row.date ? new Date(row.date).toLocaleDateString('en-GB') : '',
    row.site === '—' ? '' : (row.site || ''),
    row.supervisor === '—' ? '' : (row.supervisor || ''),
    row.operator === '—' ? '' : (row.operator || ''),
    row.machineName === '—' ? '' : (row.machineName || ''),
    row.machineStart === '—' ? '' : (row.machineStart ?? ''),
    row.machineEnd === '—' ? '' : (row.machineEnd ?? ''),
    row.machineHr === '—' ? '' : (row.machineHr ?? ''),
    row.machineDieselFilled === '—' ? '' : (row.machineDieselFilled ?? ''),
    row.machineDieselUsed === '—' ? '' : (row.machineDieselUsed ?? ''),
    row.machineDieselBalance === '—' ? '' : (row.machineDieselBalance ?? ''),
    row.machineDieselAvg === '—' ? '' : (row.machineDieselAvg ?? ''),
    (row.compMachineName || row.compressorMachineName || '') === '—' ? '' : (row.compMachineName || row.compressorMachineName || ''),
    getFieldVal(row, 'compStart', 'compressorStart'),
    getFieldVal(row, 'compEnd', 'compressorEnd'),
    getFieldVal(row, 'compHr', 'compressorHr'),
    getFieldVal(row, 'compDieselFilled', 'compressorDieselFilled'),
    getFieldVal(row, 'compDieselUsed', 'compressorDieselUsed'),
    getFieldVal(row, 'compDieselBalance', 'compressorDieselBalance'),
    getFieldVal(row, 'compDieselAvg', 'compressorDieselAvg'),
    row.workType ? `${row.workType}${row.drillingType && row.drillingType !== '—' ? ` (${row.drillingType})` : ''}` : '',
    row.workPoint === '—' ? '' : (row.workPoint ?? ''),
    row.workRate === '—' ? '' : (row.workRate ?? ''),
    row.workTotal != null ? Number(row.workTotal).toFixed(2) : '0.00',
    row.workHrs === '—' ? '' : (row.workHrs ?? ''),
    row.workDiesel === '—' ? '' : (row.workDiesel ?? ''),
    row.surveyType === '—' ? '' : (row.surveyType || ''),
    row.surveyPoint === '—' ? '' : (row.surveyPoint ?? ''),
    row.surveyRate === '—' ? '' : (row.surveyRate ?? ''),
    row.surveyTotal != null ? Number(row.surveyTotal).toFixed(2) : '0.00',
    row.surveyHrs === '—' ? '' : (row.surveyHrs ?? ''),
    row.surveyDiesel === '—' ? '' : (row.surveyDiesel ?? ''),
    row.rowTotal != null ? Number(row.rowTotal).toFixed(2) : '0.00',
  ])

  tableRows.push([
    '', '', '', '', '',
    '', '', '', '',
    (parseFloat(tableTotals.machineDieselFilled) || 0).toFixed(2),
    (parseFloat(tableTotals.machineDieselUsed) || 0).toFixed(2),
    '', '',
    '', '', '', '',
    (parseFloat(tableTotals.compressorDieselFilled) || 0).toFixed(2),
    (parseFloat(tableTotals.compressorDieselUsed) || 0).toFixed(2),
    '', '',
    'TOTAL',
    (parseFloat(tableTotals.workPoint) || 0).toFixed(2),
    (parseFloat(tableTotals.workRate) || 0).toFixed(2),
    (parseFloat(tableTotals.workTotal) || 0).toFixed(2),
    (parseFloat(tableTotals.workHrs) || 0).toFixed(2),
    (parseFloat(tableTotals.workDiesel) || 0).toFixed(2),
    '',
    (parseFloat(tableTotals.surveyPoint) || 0).toFixed(2),
    (parseFloat(tableTotals.surveyRate) || 0).toFixed(2),
    (parseFloat(tableTotals.surveyTotal) || 0).toFixed(2),
    (parseFloat(tableTotals.surveyHrs) || 0).toFixed(2),
    (parseFloat(tableTotals.surveyDiesel) || 0).toFixed(2),
    (parseFloat(tableTotals.grandTotal) || 0).toFixed(2),
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
      if (['W.Tot', 'S.Tot', 'Gr.Tot'].includes(data.column.dataKey)) {
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
// 3. SEPARATE CASTING WORK LOG REPORT EXPORTS (With Compressor Details)
// ─────────────────────────────────────────────────────────────────

/**
 * Download Separate Casting Work Log Report as Excel (.xlsx) with compressor readings included.
 */
export const downloadCastingExcel = ({
  rows,
  tableTotals = {},
  startDate,
  endDate,
  projectName,
  workType,
  castingTeam,
  fileName = 'Casting_WorkLog_Report.xlsx',
}) => {
  const titleRow = ['Casting Work Log Report']
  const emptyRow = []

  const filterRows = []
  if (startDate || endDate || projectName || workType || castingTeam) {
    filterRows.push(['Applied Filters:'])
    if (startDate && endDate) {
      filterRows.push([
        'Date Range:',
        `${new Date(startDate).toLocaleDateString('en-GB')} to ${new Date(endDate).toLocaleDateString('en-GB')}`,
      ])
    }
    if (projectName) filterRows.push(['Project:', projectName])
    if (workType) filterRows.push(['Work Type:', workType])
    if (castingTeam) filterRows.push(['Casting Team:', castingTeam])
    filterRows.push(emptyRow)
  }

  const headers = [
    'Sr.No.',
    'Date',
    'Site',
    'Supervisor',
    'Operator',
    'Casting Team Name',
    'Casting Team No',
    'Helper Name',
    'Timing',
    'Machine Name',
    'Machine Start',
    'Machine End',
    'Machine Hr',
    'Machine Diesel Filled',
    'Machine Diesel Used',
    'Machine Diesel Bal',
    'Machine Diesel Avg',
    'Compressor Machine',
    'Compressor rpm Start',
    'Compressor rpm End',
    'Compressor rpm Hr',
    'Comp Diesel Filled',
    'Comp Diesel Used',
    'Comp Diesel Bal',
    'Comp Diesel Avg',
    'Work Type',
    'Point',
    'Rate',
    'Work Total',
    'Work Hrs',
    'Raw Material',
    'Used Qty',
    'Grand Total',
  ]

  const data = rows.map((row) => [
    row.srNo,
    row.date ? new Date(row.date).toLocaleDateString('en-GB') : '',
    row.site === '—' ? '' : (row.site || ''),
    row.supervisor === '—' ? '' : (row.supervisor || ''),
    row.operator === '—' ? '' : (row.operator || ''),
    row.castingTeamName === '—' ? '' : (row.castingTeamName || ''),
    row.castingTeamNo === '—' ? '' : (row.castingTeamNo || ''),
    row.helperName === '—' ? '' : (row.helperName || ''),
    row.startTime && row.endTime ? `${row.startTime} - ${row.endTime}` : (row.timing || ''),
    row.machineName === '—' ? '' : (row.machineName || ''),
    row.machineStart === '—' ? '' : (row.machineStart ?? ''),
    row.machineEnd === '—' ? '' : (row.machineEnd ?? ''),
    row.machineHr === '—' ? '' : (row.machineHr ?? ''),
    row.machineDieselFilled === '—' ? '' : (row.machineDieselFilled ?? ''),
    row.machineDieselUsed === '—' ? '' : (row.machineDieselUsed ?? ''),
    row.machineDieselBalance === '—' ? '' : (row.machineDieselBalance ?? ''),
    row.machineDieselAvg === '—' ? '' : (row.machineDieselAvg ?? ''),
    (row.compMachineName || row.compressorMachineName || '') === '—' ? '' : (row.compMachineName || row.compressorMachineName || ''),
    getFieldVal(row, 'compStart', 'compressorStart'),
    getFieldVal(row, 'compEnd', 'compressorEnd'),
    getFieldVal(row, 'compHr', 'compressorHr'),
    getFieldVal(row, 'compDieselFilled', 'compressorDieselFilled'),
    getFieldVal(row, 'compDieselUsed', 'compressorDieselUsed'),
    getFieldVal(row, 'compDieselBalance', 'compressorDieselBalance'),
    getFieldVal(row, 'compDieselAvg', 'compressorDieselAvg'),
    row.workType === '—' ? '' : (row.workType || ''),
    row.workPoint === '—' ? '' : (row.workPoint ?? ''),
    row.workRate === '—' ? '' : (row.workRate ?? ''),
    row.workTotal != null ? Number(row.workTotal).toFixed(2) : '0.00',
    row.workHrs === '—' ? '' : (row.workHrs ?? ''),
    row.materialName === '—' ? '' : (row.materialName || ''),
    row.materialUsedQty === '—' ? '' : (row.materialUsedQty || ''),
    row.rowTotal != null ? Number(row.rowTotal).toFixed(2) : '0.00',
  ])

  const totalsRow = [
    '', '', '', '', '', '', '', '', '',
    '', '', '', '',
    (parseFloat(tableTotals.machineDieselFilled) || 0).toFixed(2),
    (parseFloat(tableTotals.machineDieselUsed) || 0).toFixed(2),
    '', '',
    '', '', '', '',
    (parseFloat(tableTotals.compressorDieselFilled) || 0).toFixed(2),
    (parseFloat(tableTotals.compressorDieselUsed) || 0).toFixed(2),
    '', '',
    'TOTAL',
    (parseFloat(tableTotals.workPoint) || 0).toFixed(2),
    (parseFloat(tableTotals.workRate) || 0).toFixed(2),
    (parseFloat(tableTotals.workTotal) || 0).toFixed(2),
    (parseFloat(tableTotals.workHrs) || 0).toFixed(2),
    '', '',
    (parseFloat(tableTotals.grandTotal) || 0).toFixed(2),
  ]

  const allRows = [titleRow, emptyRow, ...filterRows, headers, ...data, emptyRow, totalsRow]
  const worksheet = XLSX.utils.aoa_to_sheet(allRows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Casting')

  worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } }]

  const colWidths = headers.map((h, i) => ({
    wch: Math.max(h.length, ...data.map((r) => (r[i] != null && r[i] !== '' ? r[i].toString().length : 0))) + 2,
  }))
  worksheet['!cols'] = colWidths

  XLSX.writeFile(workbook, fileName)
}

/**
 * Download Separate Casting Work Log Report as PDF matching the exact letterhead layout,
 * with full Compressor Usage details included.
 */
export const downloadCastingPDF = ({
  rows,
  tableTotals = {},
  startDate,
  endDate,
  projectName,
  workType,
  castingTeam,
  companyInfo = {},
  host,
  fileName = 'Casting_WorkLog_Report.pdf',
}) => {
  const doc = new jsPDF('l', 'mm', 'a4')
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 12

  const drawHeader = () => {
    return drawCompanyHeader({
      doc,
      companyInfo,
      host,
      pageWidth,
      pageHeight,
      margin,
      titleText: 'Casting Work Log Report',
    })
  }

  const headerBottomY = drawHeader()
  let startY = headerBottomY

  if (startDate || endDate || projectName || workType || castingTeam) {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(60)
    doc.text('Applied Filters:', margin + 8, startY)
    startY += 6
    if (startDate && endDate) {
      const range = `${new Date(startDate).toLocaleDateString('en-GB')} to ${new Date(endDate).toLocaleDateString('en-GB')}`
      doc.text(`Date Range: ${range}`, margin + 8, startY)
      startY += 5.5
    }
    if (projectName) {
      doc.text(`Project: ${projectName}`, margin + 8, startY)
      startY += 5.5
    }
    if (workType) {
      doc.text(`Work Type: ${workType}`, margin + 8, startY)
      startY += 5.5
    }
    if (castingTeam) {
      doc.text(`Casting Team: ${castingTeam}`, margin + 8, startY)
      startY += 5.5
    }
    startY += 6
  }

  const tableColumn = [
    'Sr', 'Date', 'Site', 'Supervisor', 'Opr', 'Team', 'Helper',
    'Machine', 'M.Strt', 'M.End', 'M.Hr', 'M.D.Fld', 'M.D.Usd', 'M.D.Bal', 'M.D.Avg',
    'Comp', 'C.Strt', 'C.End', 'C.Hr', 'C.D.Fld', 'C.D.Usd', 'C.D.Bal', 'C.D.Avg',
    'WrkTyp', 'Pt', 'Rate', 'W.Tot', 'W.Hr',
    'Material', 'Used Qty', 'Gr.Tot',
  ]

  const tableRows = rows.map((row) => [
    row.srNo,
    row.date ? new Date(row.date).toLocaleDateString('en-GB') : '',
    row.site === '—' ? '' : (row.site || ''),
    row.supervisor === '—' ? '' : (row.supervisor || ''),
    row.operator === '—' ? '' : (row.operator || ''),
    row.castingTeamName && row.castingTeamName !== '—'
      ? `${row.castingTeamName}${row.castingTeamNo && row.castingTeamNo !== '—' ? ` (${row.castingTeamNo})` : ''}`
      : '',
    row.helperName === '—' ? '' : (row.helperName || ''),

    // Machine Usage
    row.machineName === '—' ? '' : (row.machineName || ''),
    row.machineStart === '—' ? '' : (row.machineStart ?? ''),
    row.machineEnd === '—' ? '' : (row.machineEnd ?? ''),
    row.machineHr === '—' ? '' : (row.machineHr ?? ''),
    row.machineDieselFilled === '—' ? '' : (row.machineDieselFilled ?? ''),
    row.machineDieselUsed === '—' ? '' : (row.machineDieselUsed ?? ''),
    row.machineDieselBalance === '—' ? '' : (row.machineDieselBalance ?? ''),
    row.machineDieselAvg === '—' ? '' : (row.machineDieselAvg ?? ''),

    // Compressor Usage (Fully visible)
    (row.compMachineName || row.compressorMachineName || '') === '—' ? '' : (row.compMachineName || row.compressorMachineName || ''),
    getFieldVal(row, 'compStart', 'compressorStart'),
    getFieldVal(row, 'compEnd', 'compressorEnd'),
    getFieldVal(row, 'compHr', 'compressorHr'),
    getFieldVal(row, 'compDieselFilled', 'compressorDieselFilled'),
    getFieldVal(row, 'compDieselUsed', 'compressorDieselUsed'),
    getFieldVal(row, 'compDieselBalance', 'compressorDieselBalance'),
    getFieldVal(row, 'compDieselAvg', 'compressorDieselAvg'),

    // Work Details
    row.workType === '—' ? '' : (row.workType || ''),
    row.workPoint === '—' ? '' : (row.workPoint ?? ''),
    row.workRate === '—' ? '' : (row.workRate ?? ''),
    row.workTotal != null ? Number(row.workTotal).toFixed(2) : '0.00',
    row.workHrs === '—' ? '' : (row.workHrs ?? ''),

    // Raw Materials
    row.materialName === '—' ? '' : (row.materialName || ''),
    row.materialUsedQty === '—' ? '' : (row.materialUsedQty || ''),

    // Grand Total
    row.rowTotal != null ? Number(row.rowTotal).toFixed(2) : '0.00',
  ])

  tableRows.push([
    '', '', '', '', '', '', '',
    '', '', '', '',
    (parseFloat(tableTotals.machineDieselFilled) || 0).toFixed(2),
    (parseFloat(tableTotals.machineDieselUsed) || 0).toFixed(2),
    '', '',
    '', '', '', '',
    (parseFloat(tableTotals.compressorDieselFilled) || 0).toFixed(2),
    (parseFloat(tableTotals.compressorDieselUsed) || 0).toFixed(2),
    '', '',
    'TOTAL',
    (parseFloat(tableTotals.workPoint) || 0).toFixed(2),
    (parseFloat(tableTotals.workRate) || 0).toFixed(2),
    (parseFloat(tableTotals.workTotal) || 0).toFixed(2),
    (parseFloat(tableTotals.workHrs) || 0).toFixed(2),
    '', '',
    (parseFloat(tableTotals.grandTotal) || 0).toFixed(2),
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
      if (['W.Tot', 'Gr.Tot'].includes(data.column.dataKey)) {
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
// 4. MULTI-SITE BREAKDOWN EXPORTS
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
        projectName: site.project_name,
        workType: wt.work_type || '—',
        workPoints: wt.work_points != null ? wt.work_points : '—',
        totalHours: wt.total_hours != null ? wt.total_hours : '—',
        totalDiesel: wt.total_diesel != null ? wt.total_diesel : '—',
        workPerHour: wt.work_per_hour != null ? wt.work_per_hour : '—',
        workPerDiesel: wt.work_per_diesel != null ? wt.work_per_diesel : '—',
        siteTotalDone: site.total_done != null ? site.total_done : '—',
        siteTotalHrs: site.total_hrs != null ? site.total_hrs : '—',
        siteTotalFuel: site.total_fuel != null ? site.total_fuel : '—',
        siteAvgYield: site.avg_yield != null ? site.avg_yield : '—',
      })
    })
  })
  return flattened
}

/**
 * Download the Multi-Site Breakdown tab as an Excel (.xlsx) file.
 */
export const downloadMultiSiteExcel = ({
  multiSiteData,
  date,
  fileName = 'MultiSiteBreakdown.xlsx',
}) => {
  const titleRow = ['Multi-Site Breakdown Report']
  const emptyRow = []
  const filterRows = [
    ['Active Day:', date ? new Date(date).toLocaleDateString('en-GB') : 'All'],
    ['Total Sites Active:', (multiSiteData || []).length],
    emptyRow,
  ]

  const headers = [
    'Site / Project',
    'Work Type',
    'Points Done',
    'Run Hrs',
    'Fuel (L)',
    'Work / Hr',
    'Work / L',
    'Site Total Points',
    'Site Total Hrs',
    'Site Total Fuel (L)',
    'Site Avg Yield',
  ]

  const flattened = flattenMultiSiteData(multiSiteData || [])
  const data = flattened.map((r) => [
    r.projectName,
    r.workType,
    r.workPoints,
    r.totalHours,
    r.totalDiesel,
    r.workPerHour,
    r.workPerDiesel,
    r.isFirstRow ? r.siteTotalDone : '',
    r.isFirstRow ? r.siteTotalHrs : '',
    r.isFirstRow ? r.siteTotalFuel : '',
    r.isFirstRow ? r.siteAvgYield : '',
  ])

  const grandPoints = (multiSiteData || []).reduce((s, x) => s + (parseFloat(x.total_done) || 0), 0)
  const grandHrs = (multiSiteData || []).reduce((s, x) => s + (parseFloat(x.total_hrs) || 0), 0)
  const grandFuel = (multiSiteData || []).reduce((s, x) => s + (parseFloat(x.total_fuel) || 0), 0)
  const grandAvgYield = grandHrs > 0 ? (grandPoints / grandHrs).toFixed(2) : '0.00'

  const totalsRow = [
    'TOTAL',
    '',
    '',
    '',
    '',
    '',
    '',
    grandPoints.toFixed(2),
    grandHrs.toFixed(2),
    grandFuel.toFixed(2),
    grandAvgYield,
  ]

  const allRows = [titleRow, emptyRow, ...filterRows, headers, ...data, emptyRow, totalsRow]
  const worksheet = XLSX.utils.aoa_to_sheet(allRows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'MultiSiteBreakdown')

  worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } }]

  const colWidths = headers.map((h, i) => ({
    wch: Math.max(h.length, ...data.map((r) => (r[i] != null && r[i] !== '' ? r[i].toString().length : 0))) + 2,
  }))
  worksheet['!cols'] = colWidths

  XLSX.writeFile(workbook, fileName)
}

/**
 * Download the Multi-Site Breakdown tab as a PDF file, using the same
 * company letterhead-style header.
 */
export const downloadMultiSitePDF = ({
  multiSiteData,
  date,
  companyInfo = {},
  host,
  fileName = 'MultiSiteBreakdown.pdf',
}) => {
  const doc = new jsPDF('l', 'mm', 'a4')
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 12

  const drawHeader = () => {
    return drawCompanyHeader({
      doc,
      companyInfo,
      host,
      pageWidth,
      pageHeight,
      margin,
      titleText: 'Multi-Site Breakdown Report',
    })
  }

  if (!multiSiteData || multiSiteData.length === 0) {
    drawHeader()
    doc.setFontSize(12)
    doc.text('No data available for the selected date.', pageWidth / 2, 80, { align: 'center' })
    doc.save(fileName)
    return
  }

  const grandPoints = multiSiteData.reduce((s, x) => s + (parseFloat(x.total_done) || 0), 0)
  const grandHrs = multiSiteData.reduce((s, x) => s + (parseFloat(x.total_hrs) || 0), 0)
  const grandFuel = multiSiteData.reduce((s, x) => s + (parseFloat(x.total_fuel) || 0), 0)
  const grandAvgYield = grandHrs > 0 ? (grandPoints / grandHrs).toFixed(2) : '0.00'

  const headerBottomY = drawHeader()
  let startY = headerBottomY

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(60)
  const dateFormatted = date ? new Date(date).toLocaleDateString('en-GB') : 'All'
  doc.text(`Active Day: ${dateFormatted}   |   Total Sites: ${multiSiteData.length}   |   Grand Total Points: ${grandPoints.toFixed(2)}   |   Total Run Hrs: ${grandHrs.toFixed(2)} hrs   |   Total Fuel: ${grandFuel.toFixed(2)} L   |   Fleet Avg Yield: ${grandAvgYield}`, margin + 8, startY)
  startY += 8

  const tableColumn = [
    'Work Type',
    'Points Done',
    'Run Hrs',
    'Fuel (L)',
    'Work/Hr',
    'Work/L',
  ]

  multiSiteData.forEach((site) => {
    if (startY > pageHeight - 55) {
      doc.addPage()
      drawHeader()
      startY = headerBottomY
    }

    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(30, 41, 59)
    doc.text(`Site: ${site.project_name || 'Unnamed Site'}`, margin + 8, startY)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(71, 85, 105)
    const summaryLine = `Total Points: ${site.total_done ?? 0}   |   Run Hrs: ${site.total_hrs ?? 0} hrs   |   Fuel: ${site.total_fuel ?? 0} L   |   Avg Yield: ${site.avg_yield ?? 0}`
    doc.text(summaryLine, margin + 8, startY + 4.5)
    startY += 8

    const workTypes = site.work_types && site.work_types.length > 0 ? site.work_types : []
    const tableRows = workTypes.map((wt) => [
      wt.work_type || '—',
      wt.work_points != null ? wt.work_points : '—',
      wt.total_hours != null ? `${wt.total_hours} hrs` : '—',
      wt.total_diesel != null ? `${wt.total_diesel} L` : '—',
      wt.work_per_hour != null ? wt.work_per_hour : '—',
      wt.work_per_diesel != null ? wt.work_per_diesel : '—',
    ])

    if (tableRows.length === 0) {
      tableRows.push(['No work log recorded', '—', '—', '—', '—', '—'])
    }

    tableRows.push([
      'SITE TOTAL',
      site.total_done != null ? site.total_done : '—',
      site.total_hrs != null ? `${site.total_hrs} hrs` : '—',
      site.total_fuel != null ? `${site.total_fuel} L` : '—',
      '—',
      site.avg_yield != null ? site.avg_yield : '—',
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
        if (data.row.index === tableRows.length - 1) {
          data.cell.styles.fontStyle = 'bold'
          data.cell.styles.fillColor = [235, 235, 235]
        }
      },
    })

    startY = doc.lastAutoTable.finalY + 8
  })

  doc.save(fileName)
}