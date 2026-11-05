// worklogExportUtils.js
// Standalone export helpers for Work Log Reports, Separate Drilling, Casting & Rotary Reports, and Multi-Site Breakdown.

import * as XLSX from 'xlsx-js-style'
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

export const downloadWorkLogExcel = ({
  rows = [],
  tableTotals = {},
  startDate,
  endDate,
  projectName,
  workType,
  surveyType,
  companyInfo = {},
  fileName = 'WorkLogReport.xlsx',
}) => {
  const T = tableTotals

  /* ---------- palette & styles ---------- */
  const NAVY = '1F3864'
  const HEAD = '344A5E'
  const ZEBRA = 'F6F8FB'
  const TOTAL = 'E2E8F0'
  const GREEN = '008000'
  const INK = '1E2328'
  const MUTED = '6E7680'
  const LINE = 'C8CDD4'

  // Indian digit grouping: 5,09,712.00
  const NUM_FMT = '[>=10000000]##\\,##\\,##\\,##0.00;[>=100000]##\\,##\\,##0.00;##,##0.00'

  const thin = { style: 'thin', color: { rgb: LINE } }
  const border = { top: thin, bottom: thin, left: thin, right: thin }

  const styleFor = ({ fill, bold = false, color = INK, align = 'left', size = 9 } = {}) => ({
    font: { name: 'Calibri', sz: size, bold, color: { rgb: color } },
    fill: fill ? { patternType: 'solid', fgColor: { rgb: fill } } : undefined,
    alignment: { horizontal: align, vertical: 'center', wrapText: true },
    border,
  })

  /* ---------- value helpers ---------- */
  const isEmpty = (v) => v === undefined || v === null || v === '' || v === '—'
  const num = (v) => {
    if (isEmpty(v)) return ''
    const n = parseFloat(v)
    return isNaN(n) ? '' : n
  }
  const txt = (v) => (isEmpty(v) ? '' : String(v))
  const dateStr = (d) => (d ? new Date(d).toLocaleDateString('en-GB') : '')
  const pick = (row, ...keys) => {
    for (const k of keys) if (!isEmpty(row[k])) return row[k]
    return ''
  }

  /* ---------- column definitions (all 34 columns) ---------- */
  const C = (group, header, width, type, get, total, align) => ({
    group, header, width, type, get, total: total || (() => ''), align,
  })

  const cols = [
    C('Entry', 'Sr.No.', 7, 'int', (r) => r.srNo, () => 'TOTAL', 'center'),
    C('Entry', 'Date', 12, 'text', (r) => dateStr(r.date)),
    C('Entry', 'Site', 16, 'text', (r) => txt(r.site)),
    C('Entry', 'Supervisor', 16, 'text', (r) => txt(r.supervisor)),
    C('Entry', 'Operator/Helper', 16, 'text', (r) => txt(r.operator)),
    C('Entry', 'Machine Name', 14, 'text', (r) => txt(r.machineName)),

    C('Machine Diesel', 'Start', 10, 'num', (r) => num(r.machineStart)),
    C('Machine Diesel', 'End', 10, 'num', (r) => num(r.machineEnd)),
    C('Machine Diesel', 'Hours', 9, 'num', (r) => num(r.machineHr)),
    C('Machine Diesel', 'Diesel Filled', 12, 'num', (r) => num(r.machineDieselFilled), () => num(T.machineDieselFilled)),
    C('Machine Diesel', 'Diesel Used', 12, 'num', (r) => num(r.machineDieselUsed), () => num(T.machineDieselUsed)),
    C('Machine Diesel', 'Balance', 11, 'num', (r) => num(r.machineDieselBalance)),
    C('Machine Diesel', 'Avg', 10, 'num', (r) => num(r.machineDieselAvg)),

    C('Compressor Diesel', 'Machine', 14, 'text', (r) => txt(pick(r, 'compressorMachineName', 'compMachineName'))),
    C('Compressor Diesel', 'Start', 10, 'num', (r) => num(pick(r, 'compressorStart', 'compStart'))),
    C('Compressor Diesel', 'End', 10, 'num', (r) => num(pick(r, 'compressorEnd', 'compEnd'))),
    C('Compressor Diesel', 'Hours', 9, 'num', (r) => num(pick(r, 'compressorHr', 'compHr'))),
    C('Compressor Diesel', 'Diesel Filled', 12, 'num', (r) => num(pick(r, 'compressorDieselFilled', 'compDieselFilled')), () => num(T.compressorDieselFilled)),
    C('Compressor Diesel', 'Diesel Used', 12, 'num', (r) => num(pick(r, 'compressorDieselUsed', 'compDieselUsed')), () => num(T.compressorDieselUsed)),
    C('Compressor Diesel', 'Balance', 11, 'num', (r) => num(pick(r, 'compressorDieselBalance', 'compDieselBalance'))),
    C('Compressor Diesel', 'Avg', 10, 'num', (r) => num(pick(r, 'compressorDieselAvg', 'compDieselAvg'))),

    C('Work', 'Type', 14, 'text', (r) => txt(r.workType)),
    C('Work', 'Points', 9, 'num', (r) => num(r.workPoint), () => num(T.workPoint)),
    C('Work', 'Rate', 10, 'num', (r) => num(r.workRate)),
    C('Work', 'Total', 13, 'num', (r) => num(r.workTotal), () => num(T.workTotal)),
    C('Work', 'Hours', 9, 'num', (r) => num(r.workHrs), () => num(T.workHrs)),
    C('Work', 'Diesel', 10, 'num', (r) => num(r.workDiesel), () => num(T.workDiesel)),

    C('Survey', 'Type', 14, 'text', (r) => txt(r.surveyType)),
    C('Survey', 'Points', 9, 'num', (r) => num(r.surveyPoint), () => num(T.surveyPoint)),
    C('Survey', 'Rate', 10, 'num', (r) => num(r.surveyRate)),
    C('Survey', 'Total', 13, 'num', (r) => num(r.surveyTotal), () => num(T.surveyTotal)),
    C('Survey', 'Hours', 9, 'num', (r) => num(r.surveyHrs), () => num(T.surveyHrs)),
    C('Survey', 'Diesel', 10, 'num', (r) => num(r.surveyDiesel), () => num(T.surveyDiesel)),

    C('Grand', 'Grand Total', 14, 'num', (r) => num(r.rowTotal), () => num(T.grandTotal)),
  ]

  const N = cols.length
  const ws = {}
  const merges = []
  let r = 0

  const put = (row, col, value, style, fmt) => {
    const addr = XLSX.utils.encode_cell({ r: row, c: col })
    if (value === '' || value === null || value === undefined) {
      ws[addr] = { t: 's', v: '', s: style }
      return
    }
    const t = typeof value === 'number' ? 'n' : 's'
    ws[addr] = { t, v: value, s: style }
    if (t === 'n' && fmt) ws[addr].z = fmt
  }

  const mergeAcross = (row, from, to) => {
    if (to > from) merges.push({ s: { r: row, c: from }, e: { r: row, c: to } })
  }

  /* ---------- title block ---------- */
  const titleStyle = {
    font: { name: 'Calibri', sz: 16, bold: true, color: { rgb: 'FFFFFF' } },
    fill: { patternType: 'solid', fgColor: { rgb: NAVY } },
    alignment: { horizontal: 'left', vertical: 'center', indent: 1 },
  }
  for (let c = 0; c < N; c++) put(r, c, c === 0 ? 'Work Log Report' : '', titleStyle)
  mergeAcross(r, 0, N - 1)
  ws['!rows'] = [{ hpt: 30 }]
  r++

  if (companyInfo.name || companyInfo.company_name) {
    const companyDisplayName = companyInfo.company_name || companyInfo.name
    const subStyle = styleFor({ color: MUTED, size: 10 })
    put(r, 0, companyDisplayName, { ...subStyle, font: { ...subStyle.font, bold: true, color: { rgb: NAVY } } })
    mergeAcross(r, 0, N - 1)
    r++
  }

  /* ---------- applied filters ---------- */
  const filters = []
  if (startDate && endDate) {
    filters.push(`Date Range: ${dateStr(startDate)} to ${dateStr(endDate)}`)
  }
  if (projectName) filters.push(`Project: ${projectName}`)
  if (workType) filters.push(`Work Type: ${workType}`)
  if (surveyType) filters.push(`Survey Type: ${surveyType}`)

  if (filters.length) {
    filters.forEach((f) => {
      put(r, 0, f, styleFor({ color: MUTED, size: 9 }))
      r++
    })
  }
  r++ // spacer row

  /* ---------- group band ---------- */
  const groups = []
  cols.forEach((c, i) => {
    const last = groups[groups.length - 1]
    if (last && last.name === c.group) last.end = i
    else groups.push({ name: c.group, start: i, end: i })
  })
  groups.forEach((g) => {
    for (let c = g.start; c <= g.end; c++) {
      put(r, c, c === g.start ? g.name : '', styleFor({ fill: NAVY, bold: true, color: 'FFFFFF', align: 'center', size: 10 }))
    }
    mergeAcross(r, g.start, g.end)
  })
  r++

  /* ---------- header row ---------- */
  cols.forEach((c, i) => {
    put(r, i, c.header, styleFor({ fill: HEAD, bold: true, color: 'FFFFFF', align: 'center' }))
  })
  ws['!rows'] = ws['!rows'] || []
  ws['!rows'][r] = { hpt: 30 }
  r++

  /* ---------- data rows ---------- */
  if (!rows.length) {
    put(r, 0, 'No work log entries match the selected filters.', styleFor({ color: MUTED, size: 10 }))
    r++
  } else {
    rows.forEach((row, ri) => {
      const fill = ri % 2 === 1 ? ZEBRA : undefined
      cols.forEach((c, i) => {
        const highlight = c.header === 'Total' || c.header === 'Grand Total'
        const align = c.align || (c.type === 'text' ? 'left' : 'right')
        put(
          r, i, c.get(row),
          styleFor({ fill, align, bold: highlight, color: highlight ? GREEN : INK }),
          c.type === 'num' ? NUM_FMT : undefined
        )
      })
      r++
    })
  }

  /* ---------- totals row ---------- */
  cols.forEach((c, i) => {
    const align = c.align || (c.type === 'text' ? 'left' : 'right')
    put(r, i, c.total(T), styleFor({ fill: TOTAL, bold: true, align }), c.type === 'num' ? NUM_FMT : undefined)
  })
  r++

  /* ---------- sheet settings ---------- */
  ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: r - 1, c: N - 1 } })
  ws['!merges'] = merges
  ws['!cols'] = cols.map((c) => ({ wch: c.width }))

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, ws, 'WorkLogReport')
  XLSX.writeFile(workbook, fileName)
}

export const downloadWorkLogPDF = ({
  rows = [],
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
  const doc = new jsPDF('l', 'mm', 'a3')
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 10

  const NAVY = [31, 56, 100]
  const NAVY_LIGHT = [52, 73, 94]
  const INK = [30, 35, 40]
  const MUTED = [110, 118, 128]
  const GREEN = [0, 128, 0]
  const TOTAL_FILL = [226, 232, 240]

  const T = tableTotals

  /* ---------- helpers ---------- */
  const isEmpty = (v) => v === undefined || v === null || v === '' || v === '—'

  const pick = (row, ...keys) => {
    for (const k of keys) {
      if (!isEmpty(row[k])) return row[k]
    }
    return ''
  }

  const fmt = (v) => {
    if (isEmpty(v)) return ''
    const n = parseFloat(v)
    return isNaN(n)
      ? ''
      : n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const txt = (v) => (isEmpty(v) ? '' : String(v))
  const dateStr = (d) => (d ? new Date(d).toLocaleDateString('en-GB') : '')

  /* ---------- column definitions (all 34 original columns) ---------- */
  const C = (g, h, get, total = () => '', align = 'center') => ({ g, h, get, total, align })

  const cols = [
    // Entry
    C('Entry', 'Sr', (r) => r.srNo, () => 'TOTAL'),
    C('Entry', 'Date', (r) => dateStr(r.date)),
    C('Entry', 'Site', (r) => txt(r.site), undefined, 'left'),
    C('Entry', 'Supervisor', (r) => txt(r.supervisor), undefined, 'left'),
    C('Entry', 'Operator', (r) => txt(r.operator), undefined, 'left'),
    C('Entry', 'Machine', (r) => txt(r.machineName), undefined, 'left'),

    // Machine diesel
    C('Machine', 'Start', (r) => fmt(r.machineStart)),
    C('Machine', 'End', (r) => fmt(r.machineEnd)),
    C('Machine', 'Hours', (r) => fmt(r.machineHr)),
    C('Machine', 'Diesel Filled', (r) => fmt(r.machineDieselFilled), () => fmt(T.machineDieselFilled)),
    C('Machine', 'Diesel Used', (r) => fmt(r.machineDieselUsed), () => fmt(T.machineDieselUsed)),
    C('Machine', 'Balance', (r) => fmt(r.machineDieselBalance)),
    C('Machine', 'Avg', (r) => fmt(r.machineDieselAvg)),

    // Compressor diesel
    C('Compressor', 'Name', (r) => txt(pick(r, 'compressorMachineName', 'compMachineName')), undefined, 'left'),
    C('Compressor', 'Start', (r) => fmt(pick(r, 'compressorStart', 'compStart'))),
    C('Compressor', 'End', (r) => fmt(pick(r, 'compressorEnd', 'compEnd'))),
    C('Compressor', 'Hours', (r) => fmt(pick(r, 'compressorHr', 'compHr'))),
    C('Compressor', 'Diesel Filled', (r) => fmt(pick(r, 'compressorDieselFilled', 'compDieselFilled')), () => fmt(T.compressorDieselFilled)),
    C('Compressor', 'Diesel Used', (r) => fmt(pick(r, 'compressorDieselUsed', 'compDieselUsed')), () => fmt(T.compressorDieselUsed)),
    C('Compressor', 'Balance', (r) => fmt(pick(r, 'compressorDieselBalance', 'compDieselBalance'))),
    C('Compressor', 'Avg', (r) => fmt(pick(r, 'compressorDieselAvg', 'compDieselAvg'))),

    // Work
    C('Work', 'Type', (r) => txt(r.workType), undefined, 'left'),
    C('Work', 'Points', (r) => fmt(r.workPoint), () => fmt(T.workPoint)),
    C('Work', 'Rate', (r) => fmt(r.workRate)),
    C('Work', 'Total', (r) => fmt(r.workTotal), () => fmt(T.workTotal)),
    C('Work', 'Hours', (r) => fmt(r.workHrs), () => fmt(T.workHrs)),
    C('Work', 'Diesel', (r) => fmt(r.workDiesel), () => fmt(T.workDiesel)),

    // Survey
    C('Survey', 'Type', (r) => txt(r.surveyType), undefined, 'left'),
    C('Survey', 'Points', (r) => fmt(r.surveyPoint), () => fmt(T.surveyPoint)),
    C('Survey', 'Rate', (r) => fmt(r.surveyRate)),
    C('Survey', 'Total', (r) => fmt(r.surveyTotal), () => fmt(T.surveyTotal)),
    C('Survey', 'Hours', (r) => fmt(r.surveyHrs), () => fmt(T.surveyHrs)),
    C('Survey', 'Diesel', (r) => fmt(r.surveyDiesel), () => fmt(T.surveyDiesel)),

    // Grand total
    C('Total', 'Grand Total', (r) => fmt(r.rowTotal), () => fmt(T.grandTotal)),
  ]

  /* ---------- header ---------- */
  const drawHeader = () =>
    drawCompanyHeader({
      doc,
      companyInfo,
      host,
      pageWidth,
      pageHeight,
      margin,
      titleText: 'Work Log Report',
    })

  const headerBottomY = drawHeader()
  let y = headerBottomY

  /* ---------- applied filters ---------- */
  const filters = []
  if (startDate && endDate) {
    filters.push(`Date Range: ${dateStr(startDate)} to ${dateStr(endDate)}`)
  }
  if (projectName) filters.push(`Project: ${projectName}`)
  if (workType) filters.push(`Work Type: ${workType}`)
  if (surveyType) filters.push(`Survey Type: ${surveyType}`)

  if (filters.length) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...MUTED)
    doc.text(`Applied Filters:  ${filters.join('     |     ')}`, margin, y)
    y += 7
  }

  /* ---------- table ---------- */
  if (!rows.length) {
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(10)
    doc.setTextColor(...MUTED)
    doc.text('No work log entries match the selected filters.', margin, y + 10)
  } else {
    const groupRow = []
    cols.forEach((c) => {
      const last = groupRow[groupRow.length - 1]
      if (last && last.key === c.g) {
        last.colSpan += 1
      } else {
        groupRow.push({ key: c.g, content: c.g, colSpan: 1 })
      }
    })
    const headGroup = groupRow.map(({ content, colSpan }) => ({ content, colSpan }))
    const headLabels = cols.map((c) => c.h)

    const body = rows.map((r) => cols.map((c) => c.get(r)))
    const totalRow = cols.map((c) => c.total(T))
    const allBody = [...body, totalRow]

    const leftCols = cols.reduce((acc, c, i) => {
      if (c.align === 'left') acc[i] = { halign: 'left' }
      return acc
    }, {})

    const grandTotalIndex = cols.length - 1
    const totalsIndex = [
      cols.findIndex((c) => c.h === 'Total' && c.g === 'Work'),
      cols.findIndex((c) => c.h === 'Total' && c.g === 'Survey'),
      grandTotalIndex,
    ]

    doc.autoTable({
      head: [headGroup, headLabels],
      body: allBody,
      startY: y,
      theme: 'grid',
      margin: { top: headerBottomY, left: margin, right: margin, bottom: 14 },
      styles: {
        font: 'helvetica',
        fontSize: 6.8,
        cellPadding: 1,
        halign: 'center',
        valign: 'middle',
        textColor: INK,
        lineColor: [200, 205, 212],
        lineWidth: 0.2,
        overflow: 'linebreak',
      },
      headStyles: {
        fillColor: NAVY_LIGHT,
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle',
      },
      columnStyles: leftCols,
      didParseCell: (data) => {
        if (data.section === 'head' && data.row.index === 0) {
          data.cell.styles.fillColor = NAVY
          data.cell.styles.fontSize = 7.5
          return
        }
        if (data.section !== 'body') return

        const isTotalRow = data.row.index === allBody.length - 1
        if (isTotalRow) {
          data.cell.styles.fontStyle = 'bold'
          data.cell.styles.fillColor = TOTAL_FILL
        } else if (data.row.index % 2 === 1) {
          data.cell.styles.fillColor = [246, 248, 251]
        }

        if (totalsIndex.includes(data.column.index) && !isTotalRow) {
          data.cell.styles.textColor = GREEN
          data.cell.styles.fontStyle = 'bold'
        }
      },
      addPageContent: () => drawHeader(),
      showHead: 'everyPage',
      rowPageBreak: 'avoid',
    })

    y = doc.lastAutoTable.finalY + 6
  }

  /* ---------- footer with page numbers ---------- */
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...MUTED)
    doc.text(
      `Generated on ${new Date().toLocaleDateString('en-GB')}`,
      margin,
      pageHeight - 6
    )
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 6, {
      align: 'right',
    })
  }

  doc.save(fileName)
}

// ─────────────────────────────────────────────────────────────────
// 2. SEPARATE DRILLING WORK LOG REPORT EXPORTS
// ─────────────────────────────────────────────────────────────────

export const downloadDrillingExcel = ({
  rows = [],
  tableTotals = {},
  startDate,
  endDate,
  projectName,
  workType,
  drillingType,
  companyInfo = {},
  fileName = 'Drilling_WorkLog_Report.xlsx',
}) => {
  const T = tableTotals

  const NAVY = '1F3864'
  const HEAD = '344A5E'
  const ZEBRA = 'F6F8FB'
  const TOTAL = 'E2E8F0'
  const GREEN = '008000'
  const INK = '1E2328'
  const MUTED = '6E7680'
  const LINE = 'C8CDD4'

  const NUM_FMT = '[>=10000000]##\\,##\\,##\\,##0.00;[>=100000]##\\,##\\,##0.00;##,##0.00'

  const thin = { style: 'thin', color: { rgb: LINE } }
  const border = { top: thin, bottom: thin, left: thin, right: thin }

  const styleFor = ({ fill, bold = false, color = INK, align = 'left', size = 9 } = {}) => ({
    font: { name: 'Calibri', sz: size, bold, color: { rgb: color } },
    fill: fill ? { patternType: 'solid', fgColor: { rgb: fill } } : undefined,
    alignment: { horizontal: align, vertical: 'center', wrapText: true },
    border,
  })

  const isEmpty = (v) => v === undefined || v === null || v === '' || v === '—'
  const num = (v) => {
    if (isEmpty(v)) return ''
    const n = parseFloat(v)
    return isNaN(n) ? '' : n
  }
  const txt = (v) => (isEmpty(v) ? '' : String(v))
  const dateStr = (d) => (d ? new Date(d).toLocaleDateString('en-GB') : '')
  const pick = (row, ...keys) => {
    for (const k of keys) if (!isEmpty(row[k])) return row[k]
    return ''
  }

  const C = (group, header, width, type, get, total, align) => ({
    group, header, width, type, get, total: total || (() => ''), align,
  })

  const cols = [
    C('Entry', 'Sr.No.', 7, 'int', (r) => r.srNo, () => 'TOTAL', 'center'),
    C('Entry', 'Date', 12, 'text', (r) => dateStr(r.date)),
    C('Entry', 'Site', 16, 'text', (r) => txt(r.site)),
    C('Entry', 'Supervisor', 16, 'text', (r) => txt(r.supervisor)),
    C('Entry', 'Operator', 16, 'text', (r) => txt(r.operator)),
    C('Entry', 'Timing', 14, 'text', (r) => (r.startTime && r.endTime ? `${r.startTime} - ${r.endTime}` : txt(r.timing))),
    C('Entry', 'Machine Name', 14, 'text', (r) => txt(r.machineName)),

    C('Machine Diesel', 'Start', 10, 'num', (r) => num(r.machineStart)),
    C('Machine Diesel', 'End', 10, 'num', (r) => num(r.machineEnd)),
    C('Machine Diesel', 'Hours', 9, 'num', (r) => num(r.machineHr)),
    C('Machine Diesel', 'Diesel Filled', 12, 'num', (r) => num(r.machineDieselFilled), () => num(T.machineDieselFilled)),
    C('Machine Diesel', 'Diesel Used', 12, 'num', (r) => num(r.machineDieselUsed), () => num(T.machineDieselUsed)),
    C('Machine Diesel', 'Balance', 11, 'num', (r) => num(r.machineDieselBalance)),
    C('Machine Diesel', 'Avg', 10, 'num', (r) => num(r.machineDieselAvg)),

    C('Compressor Diesel', 'Machine', 14, 'text', (r) => txt(pick(r, 'compMachineName', 'compressorMachineName'))),
    C('Compressor Diesel', 'Start', 10, 'num', (r) => num(pick(r, 'compStart', 'compressorStart'))),
    C('Compressor Diesel', 'End', 10, 'num', (r) => num(pick(r, 'compEnd', 'compressorEnd'))),
    C('Compressor Diesel', 'Hours', 9, 'num', (r) => num(pick(r, 'compHr', 'compressorHr'))),
    C('Compressor Diesel', 'Diesel Filled', 12, 'num', (r) => num(pick(r, 'compDieselFilled', 'compressorDieselFilled')), () => num(T.compressorDieselFilled)),
    C('Compressor Diesel', 'Diesel Used', 12, 'num', (r) => num(pick(r, 'compDieselUsed', 'compressorDieselUsed')), () => num(T.compressorDieselUsed)),
    C('Compressor Diesel', 'Balance', 11, 'num', (r) => num(pick(r, 'compDieselBalance', 'compressorDieselBalance'))),
    C('Compressor Diesel', 'Avg', 10, 'num', (r) => num(pick(r, 'compDieselAvg', 'compressorDieselAvg'))),

    C('Work', 'Type', 14, 'text', (r) => txt(r.workType)),
    C('Work', 'Drilling Type', 14, 'text', (r) => txt(r.drillingType)),
    C('Work', 'Points', 9, 'num', (r) => num(r.workPoint), () => num(T.workPoint)),
    C('Work', 'Rate', 10, 'num', (r) => num(r.workRate)),
    C('Work', 'Total', 13, 'num', (r) => num(r.workTotal), () => num(T.workTotal)),
    C('Work', 'Hours', 9, 'num', (r) => num(r.workHrs), () => num(T.workHrs)),
    C('Work', 'Diesel', 10, 'num', (r) => num(r.workDiesel), () => num(T.workDiesel)),

    C('Survey', 'Type', 14, 'text', (r) => txt(r.surveyType)),
    C('Survey', 'Points', 9, 'num', (r) => num(r.surveyPoint), () => num(T.surveyPoint)),
    C('Survey', 'Rate', 10, 'num', (r) => num(r.surveyRate)),
    C('Survey', 'Total', 13, 'num', (r) => num(r.surveyTotal), () => num(T.surveyTotal)),
    C('Survey', 'Hours', 9, 'num', (r) => num(r.surveyHrs), () => num(T.surveyHrs)),
    C('Survey', 'Diesel', 10, 'num', (r) => num(r.surveyDiesel), () => num(T.surveyDiesel)),

    C('Grand', 'Grand Total', 14, 'num', (r) => num(r.rowTotal), () => num(T.grandTotal)),
  ]

  const N = cols.length
  const ws = {}
  const merges = []
  let r = 0

  const put = (row, col, value, style, fmt) => {
    const addr = XLSX.utils.encode_cell({ r: row, c: col })
    if (value === '' || value === null || value === undefined) {
      ws[addr] = { t: 's', v: '', s: style }
      return
    }
    const t = typeof value === 'number' ? 'n' : 's'
    ws[addr] = { t, v: value, s: style }
    if (t === 'n' && fmt) ws[addr].z = fmt
  }

  const mergeAcross = (row, from, to) => {
    if (to > from) merges.push({ s: { r: row, c: from }, e: { r: row, c: to } })
  }

  const titleStyle = {
    font: { name: 'Calibri', sz: 16, bold: true, color: { rgb: 'FFFFFF' } },
    fill: { patternType: 'solid', fgColor: { rgb: NAVY } },
    alignment: { horizontal: 'left', vertical: 'center', indent: 1 },
  }
  for (let c = 0; c < N; c++) put(r, c, c === 0 ? 'Drilling Work Log Report' : '', titleStyle)
  mergeAcross(r, 0, N - 1)
  ws['!rows'] = [{ hpt: 30 }]
  r++

  if (companyInfo.name || companyInfo.company_name) {
    const companyDisplayName = companyInfo.company_name || companyInfo.name
    const subStyle = styleFor({ color: MUTED, size: 10 })
    put(r, 0, companyDisplayName, { ...subStyle, font: { ...subStyle.font, bold: true, color: { rgb: NAVY } } })
    mergeAcross(r, 0, N - 1)
    r++
  }

  const filters = []
  if (startDate && endDate) {
    filters.push(`Date Range: ${dateStr(startDate)} to ${dateStr(endDate)}`)
  }
  if (projectName) filters.push(`Project: ${projectName}`)
  if (workType) filters.push(`Work Type: ${workType}`)
  if (drillingType) filters.push(`Drilling Type: ${drillingType}`)

  if (filters.length) {
    filters.forEach((f) => {
      put(r, 0, f, styleFor({ color: MUTED, size: 9 }))
      r++
    })
  }
  r++

  const groups = []
  cols.forEach((c, i) => {
    const last = groups[groups.length - 1]
    if (last && last.name === c.group) last.end = i
    else groups.push({ name: c.group, start: i, end: i })
  })
  groups.forEach((g) => {
    for (let c = g.start; c <= g.end; c++) {
      put(r, c, c === g.start ? g.name : '', styleFor({ fill: NAVY, bold: true, color: 'FFFFFF', align: 'center', size: 10 }))
    }
    mergeAcross(r, g.start, g.end)
  })
  r++

  cols.forEach((c, i) => {
    put(r, i, c.header, styleFor({ fill: HEAD, bold: true, color: 'FFFFFF', align: 'center' }))
  })
  ws['!rows'] = ws['!rows'] || []
  ws['!rows'][r] = { hpt: 30 }
  r++

  if (!rows.length) {
    put(r, 0, 'No drilling work log entries match the selected filters.', styleFor({ color: MUTED, size: 10 }))
    r++
  } else {
    rows.forEach((row, ri) => {
      const fill = ri % 2 === 1 ? ZEBRA : undefined
      cols.forEach((c, i) => {
        const highlight = c.header === 'Total' || c.header === 'Grand Total' || c.header === 'Work Total' || c.header === 'Survey Total'
        const align = c.align || (c.type === 'text' ? 'left' : 'right')
        put(
          r, i, c.get(row),
          styleFor({ fill, align, bold: highlight, color: highlight ? GREEN : INK }),
          c.type === 'num' ? NUM_FMT : undefined
        )
      })
      r++
    })
  }

  cols.forEach((c, i) => {
    const align = c.align || (c.type === 'text' ? 'left' : 'right')
    put(r, i, c.total(T), styleFor({ fill: TOTAL, bold: true, align }), c.type === 'num' ? NUM_FMT : undefined)
  })
  r++

  ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: r - 1, c: N - 1 } })
  ws['!merges'] = merges
  ws['!cols'] = cols.map((c) => ({ wch: c.width }))

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, ws, 'Drilling')
  XLSX.writeFile(workbook, fileName)
}

export const downloadDrillingPDF = ({
  rows = [],
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
  const doc = new jsPDF('l', 'mm', 'a3')
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 10

  const NAVY = [31, 56, 100]
  const NAVY_LIGHT = [52, 73, 94]
  const INK = [30, 35, 40]
  const MUTED = [110, 118, 128]
  const GREEN = [0, 128, 0]
  const TOTAL_FILL = [226, 232, 240]

  const T = tableTotals

  const isEmpty = (v) => v === undefined || v === null || v === '' || v === '—'

  const pick = (row, ...keys) => {
    for (const k of keys) {
      if (!isEmpty(row[k])) return row[k]
    }
    return ''
  }

  const fmt = (v) => {
    if (isEmpty(v)) return ''
    const n = parseFloat(v)
    return isNaN(n)
      ? ''
      : n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const txt = (v) => (isEmpty(v) ? '' : String(v))
  const dateStr = (d) => (d ? new Date(d).toLocaleDateString('en-GB') : '')

  const C = (g, h, get, total = () => '', align = 'center') => ({ g, h, get, total, align })

  const cols = [
    C('Entry', 'Sr', (r) => r.srNo, () => 'TOTAL'),
    C('Entry', 'Date', (r) => dateStr(r.date)),
    C('Entry', 'Site', (r) => txt(r.site), undefined, 'left'),
    C('Entry', 'Supervisor', (r) => txt(r.supervisor), undefined, 'left'),
    C('Entry', 'Operator', (r) => txt(r.operator), undefined, 'left'),
    C('Entry', 'Timing', (r) => (r.startTime && r.endTime ? `${r.startTime} - ${r.endTime}` : txt(r.timing))),
    C('Entry', 'Machine', (r) => txt(r.machineName), undefined, 'left'),

    C('Machine', 'Start', (r) => fmt(r.machineStart)),
    C('Machine', 'End', (r) => fmt(r.machineEnd)),
    C('Machine', 'Hours', (r) => fmt(r.machineHr)),
    C('Machine', 'Diesel Filled', (r) => fmt(r.machineDieselFilled), () => fmt(T.machineDieselFilled)),
    C('Machine', 'Diesel Used', (r) => fmt(r.machineDieselUsed), () => fmt(T.machineDieselUsed)),
    C('Machine', 'Balance', (r) => fmt(r.machineDieselBalance)),
    C('Machine', 'Avg', (r) => fmt(r.machineDieselAvg)),

    C('Compressor', 'Name', (r) => txt(pick(r, 'compMachineName', 'compressorMachineName')), undefined, 'left'),
    C('Compressor', 'Start', (r) => fmt(pick(r, 'compStart', 'compressorStart'))),
    C('Compressor', 'End', (r) => fmt(pick(r, 'compEnd', 'compressorEnd'))),
    C('Compressor', 'Hours', (r) => fmt(pick(r, 'compHr', 'compressorHr'))),
    C('Compressor', 'Diesel Filled', (r) => fmt(pick(r, 'compDieselFilled', 'compressorDieselFilled')), () => fmt(T.compressorDieselFilled)),
    C('Compressor', 'Diesel Used', (r) => fmt(pick(r, 'compDieselUsed', 'compressorDieselUsed')), () => fmt(T.compressorDieselUsed)),
    C('Compressor', 'Balance', (r) => fmt(pick(r, 'compDieselBalance', 'compressorDieselBalance'))),
    C('Compressor', 'Avg', (r) => fmt(pick(r, 'compDieselAvg', 'compressorDieselAvg'))),

    C('Work', 'Type', (r) => txt(r.workType), undefined, 'left'),
    C('Work', 'Drill Typ', (r) => txt(r.drillingType), undefined, 'left'),
    C('Work', 'Points', (r) => fmt(r.workPoint), () => fmt(T.workPoint)),
    C('Work', 'Rate', (r) => fmt(r.workRate)),
    C('Work', 'Total', (r) => fmt(r.workTotal), () => fmt(T.workTotal)),
    C('Work', 'Hours', (r) => fmt(r.workHrs), () => fmt(T.workHrs)),
    C('Work', 'Diesel', (r) => fmt(r.workDiesel), () => fmt(T.workDiesel)),

    C('Survey', 'Type', (r) => txt(r.surveyType), undefined, 'left'),
    C('Survey', 'Points', (r) => fmt(r.surveyPoint), () => fmt(T.surveyPoint)),
    C('Survey', 'Rate', (r) => fmt(r.surveyRate)),
    C('Survey', 'Total', (r) => fmt(r.surveyTotal), () => fmt(T.surveyTotal)),
    C('Survey', 'Hours', (r) => fmt(r.surveyHrs), () => fmt(T.surveyHrs)),
    C('Survey', 'Diesel', (r) => fmt(r.surveyDiesel), () => fmt(T.surveyDiesel)),

    C('Total', 'Grand Total', (r) => fmt(r.rowTotal), () => fmt(T.grandTotal)),
  ]

  const drawHeader = () =>
    drawCompanyHeader({
      doc,
      companyInfo,
      host,
      pageWidth,
      pageHeight,
      margin,
      titleText: 'Drilling Work Log Report',
    })

  const headerBottomY = drawHeader()
  let y = headerBottomY

  const filters = []
  if (startDate && endDate) {
    filters.push(`Date Range: ${dateStr(startDate)} to ${dateStr(endDate)}`)
  }
  if (projectName) filters.push(`Project: ${projectName}`)
  if (workType) filters.push(`Work Type: ${workType}`)
  if (drillingType) filters.push(`Drilling Type: ${drillingType}`)

  if (filters.length) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...MUTED)
    doc.text(`Applied Filters:  ${filters.join('     |     ')}`, margin, y)
    y += 7
  }

  if (!rows.length) {
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(10)
    doc.setTextColor(...MUTED)
    doc.text('No drilling work log entries match the selected filters.', margin, y + 10)
  } else {
    const groupRow = []
    cols.forEach((c) => {
      const last = groupRow[groupRow.length - 1]
      if (last && last.key === c.g) {
        last.colSpan += 1
      } else {
        groupRow.push({ key: c.g, content: c.g, colSpan: 1 })
      }
    })
    const headGroup = groupRow.map(({ content, colSpan }) => ({ content, colSpan }))
    const headLabels = cols.map((c) => c.h)

    const body = rows.map((r) => cols.map((c) => c.get(r)))
    const totalRow = cols.map((c) => c.total(T))
    const allBody = [...body, totalRow]

    const leftCols = cols.reduce((acc, c, i) => {
      if (c.align === 'left') acc[i] = { halign: 'left' }
      return acc
    }, {})

    const grandTotalIndex = cols.length - 1
    const totalsIndex = [
      cols.findIndex((c) => c.h === 'Total' && c.g === 'Work'),
      cols.findIndex((c) => c.h === 'Total' && c.g === 'Survey'),
      grandTotalIndex,
    ]

    doc.autoTable({
      head: [headGroup, headLabels],
      body: allBody,
      startY: y,
      theme: 'grid',
      margin: { top: headerBottomY, left: margin, right: margin, bottom: 14 },
      styles: {
        font: 'helvetica',
        fontSize: 6.8,
        cellPadding: 1,
        halign: 'center',
        valign: 'middle',
        textColor: INK,
        lineColor: [200, 205, 212],
        lineWidth: 0.2,
        overflow: 'linebreak',
      },
      headStyles: {
        fillColor: NAVY_LIGHT,
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle',
      },
      columnStyles: leftCols,
      didParseCell: (data) => {
        if (data.section === 'head' && data.row.index === 0) {
          data.cell.styles.fillColor = NAVY
          data.cell.styles.fontSize = 7.5
          return
        }
        if (data.section !== 'body') return

        const isTotalRow = data.row.index === allBody.length - 1
        if (isTotalRow) {
          data.cell.styles.fontStyle = 'bold'
          data.cell.styles.fillColor = TOTAL_FILL
        } else if (data.row.index % 2 === 1) {
          data.cell.styles.fillColor = [246, 248, 251]
        }

        if (totalsIndex.includes(data.column.index) && !isTotalRow) {
          data.cell.styles.textColor = GREEN
          data.cell.styles.fontStyle = 'bold'
        }
      },
      addPageContent: () => drawHeader(),
      showHead: 'everyPage',
      rowPageBreak: 'avoid',
    })

    y = doc.lastAutoTable.finalY + 6
  }

  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...MUTED)
    doc.text(
      `Generated on ${new Date().toLocaleDateString('en-GB')}`,
      margin,
      pageHeight - 6
    )
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 6, {
      align: 'right',
    })
  }

  doc.save(fileName)
}

// ─────────────────────────────────────────────────────────────────
// 3. SEPARATE CASTING WORK LOG REPORT EXPORTS
// ─────────────────────────────────────────────────────────────────

export const downloadCastingExcel = ({
  rows = [],
  tableTotals = {},
  startDate,
  endDate,
  projectName,
  workType,
  castingTeam,
  companyInfo = {},
  fileName = 'Casting_WorkLog_Report.xlsx',
}) => {
  const T = tableTotals

  const NAVY = '1F3864'
  const HEAD = '344A5E'
  const ZEBRA = 'F6F8FB'
  const TOTAL = 'E2E8F0'
  const GREEN = '008000'
  const INK = '1E2328'
  const MUTED = '6E7680'
  const LINE = 'C8CDD4'

  const NUM_FMT = '[>=10000000]##\\,##\\,##\\,##0.00;[>=100000]##\\,##\\,##0.00;##,##0.00'

  const thin = { style: 'thin', color: { rgb: LINE } }
  const border = { top: thin, bottom: thin, left: thin, right: thin }

  const styleFor = ({ fill, bold = false, color = INK, align = 'left', size = 9 } = {}) => ({
    font: { name: 'Calibri', sz: size, bold, color: { rgb: color } },
    fill: fill ? { patternType: 'solid', fgColor: { rgb: fill } } : undefined,
    alignment: { horizontal: align, vertical: 'center', wrapText: true },
    border,
  })

  const isEmpty = (v) => v === undefined || v === null || v === '' || v === '—'
  const num = (v) => {
    if (isEmpty(v)) return ''
    const n = parseFloat(v)
    return isNaN(n) ? '' : n
  }
  const txt = (v) => (isEmpty(v) ? '' : String(v))
  const dateStr = (d) => (d ? new Date(d).toLocaleDateString('en-GB') : '')
  const pick = (row, ...keys) => {
    for (const k of keys) if (!isEmpty(row[k])) return row[k]
    return ''
  }

  const C = (group, header, width, type, get, total, align) => ({
    group, header, width, type, get, total: total || (() => ''), align,
  })

  const cols = [
    C('Entry', 'Sr.No.', 7, 'int', (r) => r.srNo, () => 'TOTAL', 'center'),
    C('Entry', 'Date', 12, 'text', (r) => dateStr(r.date)),
    C('Entry', 'Site', 16, 'text', (r) => txt(r.site)),
    C('Entry', 'Supervisor', 16, 'text', (r) => txt(r.supervisor)),
    C('Entry', 'Operator', 16, 'text', (r) => txt(r.operator)),
    C('Entry', 'Casting Team Name', 16, 'text', (r) => txt(r.castingTeamName)),
    C('Entry', 'Casting Team No', 14, 'text', (r) => txt(r.castingTeamNo)),
    C('Entry', 'Helper Name', 14, 'text', (r) => txt(r.helperName)),
    C('Entry', 'Timing', 14, 'text', (r) => (r.startTime && r.endTime ? `${r.startTime} - ${r.endTime}` : txt(r.timing))),
    C('Entry', 'Machine Name', 14, 'text', (r) => txt(r.machineName)),

    C('Machine Diesel', 'Start', 10, 'num', (r) => num(r.machineStart)),
    C('Machine Diesel', 'End', 10, 'num', (r) => num(r.machineEnd)),
    C('Machine Diesel', 'Hours', 9, 'num', (r) => num(r.machineHr)),
    C('Machine Diesel', 'Diesel Filled', 12, 'num', (r) => num(r.machineDieselFilled), () => num(T.machineDieselFilled)),
    C('Machine Diesel', 'Diesel Used', 12, 'num', (r) => num(r.machineDieselUsed), () => num(T.machineDieselUsed)),
    C('Machine Diesel', 'Balance', 11, 'num', (r) => num(r.machineDieselBalance)),
    C('Machine Diesel', 'Avg', 10, 'num', (r) => num(r.machineDieselAvg)),

    C('Compressor Diesel', 'Machine', 14, 'text', (r) => txt(pick(r, 'compMachineName', 'compressorMachineName'))),
    C('Compressor Diesel', 'Start', 10, 'num', (r) => num(pick(r, 'compStart', 'compressorStart'))),
    C('Compressor Diesel', 'End', 10, 'num', (r) => num(pick(r, 'compEnd', 'compressorEnd'))),
    C('Compressor Diesel', 'Hours', 9, 'num', (r) => num(pick(r, 'compHr', 'compressorHr'))),
    C('Compressor Diesel', 'Diesel Filled', 12, 'num', (r) => num(pick(r, 'compDieselFilled', 'compressorDieselFilled')), () => num(T.compressorDieselFilled)),
    C('Compressor Diesel', 'Diesel Used', 12, 'num', (r) => num(pick(r, 'compDieselUsed', 'compressorDieselUsed')), () => num(T.compressorDieselUsed)),
    C('Compressor Diesel', 'Balance', 11, 'num', (r) => num(pick(r, 'compDieselBalance', 'compressorDieselBalance'))),
    C('Compressor Diesel', 'Avg', 10, 'num', (r) => num(pick(r, 'compDieselAvg', 'compressorDieselAvg'))),

    C('Work', 'Type', 14, 'text', (r) => txt(r.workType)),
    C('Work', 'Points', 9, 'num', (r) => num(r.workPoint), () => num(T.workPoint)),
    C('Work', 'Rate', 10, 'num', (r) => num(r.workRate)),
    C('Work', 'Total', 13, 'num', (r) => num(r.workTotal), () => num(T.workTotal)),
    C('Work', 'Hours', 9, 'num', (r) => num(r.workHrs), () => num(T.workHrs)),

    C('Raw Material', 'Material Name', 14, 'text', (r) => txt(r.materialName)),
    C('Raw Material', 'Used Qty', 10, 'num', (r) => num(r.materialUsedQty)),

    C('Grand', 'Grand Total', 14, 'num', (r) => num(r.rowTotal), () => num(T.grandTotal)),
  ]

  const N = cols.length
  const ws = {}
  const merges = []
  let r = 0

  const put = (row, col, value, style, fmt) => {
    const addr = XLSX.utils.encode_cell({ r: row, c: col })
    if (value === '' || value === null || value === undefined) {
      ws[addr] = { t: 's', v: '', s: style }
      return
    }
    const t = typeof value === 'number' ? 'n' : 's'
    ws[addr] = { t, v: value, s: style }
    if (t === 'n' && fmt) ws[addr].z = fmt
  }

  const mergeAcross = (row, from, to) => {
    if (to > from) merges.push({ s: { r: row, c: from }, e: { r: row, c: to } })
  }

  const titleStyle = {
    font: { name: 'Calibri', sz: 16, bold: true, color: { rgb: 'FFFFFF' } },
    fill: { patternType: 'solid', fgColor: { rgb: NAVY } },
    alignment: { horizontal: 'left', vertical: 'center', indent: 1 },
  }
  for (let c = 0; c < N; c++) put(r, c, c === 0 ? 'Casting Work Log Report' : '', titleStyle)
  mergeAcross(r, 0, N - 1)
  ws['!rows'] = [{ hpt: 30 }]
  r++

  if (companyInfo.name || companyInfo.company_name) {
    const companyDisplayName = companyInfo.company_name || companyInfo.name
    const subStyle = styleFor({ color: MUTED, size: 10 })
    put(r, 0, companyDisplayName, { ...subStyle, font: { ...subStyle.font, bold: true, color: { rgb: NAVY } } })
    mergeAcross(r, 0, N - 1)
    r++
  }

  const filters = []
  if (startDate && endDate) {
    filters.push(`Date Range: ${dateStr(startDate)} to ${dateStr(endDate)}`)
  }
  if (projectName) filters.push(`Project: ${projectName}`)
  if (workType) filters.push(`Work Type: ${workType}`)
  if (castingTeam) filters.push(`Casting Team: ${castingTeam}`)

  if (filters.length) {
    filters.forEach((f) => {
      put(r, 0, f, styleFor({ color: MUTED, size: 9 }))
      r++
    })
  }
  r++

  const groups = []
  cols.forEach((c, i) => {
    const last = groups[groups.length - 1]
    if (last && last.name === c.group) last.end = i
    else groups.push({ name: c.group, start: i, end: i })
  })
  groups.forEach((g) => {
    for (let c = g.start; c <= g.end; c++) {
      put(r, c, c === g.start ? g.name : '', styleFor({ fill: NAVY, bold: true, color: 'FFFFFF', align: 'center', size: 10 }))
    }
    mergeAcross(r, g.start, g.end)
  })
  r++

  cols.forEach((c, i) => {
    put(r, i, c.header, styleFor({ fill: HEAD, bold: true, color: 'FFFFFF', align: 'center' }))
  })
  ws['!rows'] = ws['!rows'] || []
  ws['!rows'][r] = { hpt: 30 }
  r++

  if (!rows.length) {
    put(r, 0, 'No casting work log entries match the selected filters.', styleFor({ color: MUTED, size: 10 }))
    r++
  } else {
    rows.forEach((row, ri) => {
      const fill = ri % 2 === 1 ? ZEBRA : undefined
      cols.forEach((c, i) => {
        const highlight = c.header === 'Total' || c.header === 'Grand Total' || c.header === 'Work Total'
        const align = c.align || (c.type === 'text' ? 'left' : 'right')
        put(
          r, i, c.get(row),
          styleFor({ fill, align, bold: highlight, color: highlight ? GREEN : INK }),
          c.type === 'num' ? NUM_FMT : undefined
        )
      })
      r++
    })
  }

  cols.forEach((c, i) => {
    const align = c.align || (c.type === 'text' ? 'left' : 'right')
    put(r, i, c.total(T), styleFor({ fill: TOTAL, bold: true, align }), c.type === 'num' ? NUM_FMT : undefined)
  })
  r++

  ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: r - 1, c: N - 1 } })
  ws['!merges'] = merges
  ws['!cols'] = cols.map((c) => ({ wch: c.width }))

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, ws, 'Casting')
  XLSX.writeFile(workbook, fileName)
}

export const downloadCastingPDF = ({
  rows = [],
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
  const doc = new jsPDF('l', 'mm', 'a3')
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 10

  const NAVY = [31, 56, 100]
  const NAVY_LIGHT = [52, 73, 94]
  const INK = [30, 35, 40]
  const MUTED = [110, 118, 128]
  const GREEN = [0, 128, 0]
  const TOTAL_FILL = [226, 232, 240]

  const T = tableTotals

  const isEmpty = (v) => v === undefined || v === null || v === '' || v === '—'

  const pick = (row, ...keys) => {
    for (const k of keys) {
      if (!isEmpty(row[k])) return row[k]
    }
    return ''
  }

  const fmt = (v) => {
    if (isEmpty(v)) return ''
    const n = parseFloat(v)
    return isNaN(n)
      ? ''
      : n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const txt = (v) => (isEmpty(v) ? '' : String(v))
  const dateStr = (d) => (d ? new Date(d).toLocaleDateString('en-GB') : '')

  const C = (g, h, get, total = () => '', align = 'center') => ({ g, h, get, total, align })

  const cols = [
    C('Entry', 'Sr', (r) => r.srNo, () => 'TOTAL'),
    C('Entry', 'Date', (r) => dateStr(r.date)),
    C('Entry', 'Site', (r) => txt(r.site), undefined, 'left'),
    C('Entry', 'Supervisor', (r) => txt(r.supervisor), undefined, 'left'),
    C('Entry', 'Operator', (r) => txt(r.operator), undefined, 'left'),
    C('Entry', 'Team', (r) => (r.castingTeamName && r.castingTeamName !== '—' ? `${r.castingTeamName}${r.castingTeamNo && r.castingTeamNo !== '—' ? ` (${r.castingTeamNo})` : ''}` : ''), undefined, 'left'),
    C('Entry', 'Helper', (r) => txt(r.helperName), undefined, 'left'),
    C('Entry', 'Timing', (r) => (r.startTime && r.endTime ? `${r.startTime} - ${r.endTime}` : txt(r.timing))),
    C('Entry', 'Machine', (r) => txt(r.machineName), undefined, 'left'),

    C('Machine', 'Start', (r) => fmt(r.machineStart)),
    C('Machine', 'End', (r) => fmt(r.machineEnd)),
    C('Machine', 'Hours', (r) => fmt(r.machineHr)),
    C('Machine', 'Diesel Filled', (r) => fmt(r.machineDieselFilled), () => fmt(T.machineDieselFilled)),
    C('Machine', 'Diesel Used', (r) => fmt(r.machineDieselUsed), () => fmt(T.machineDieselUsed)),
    C('Machine', 'Balance', (r) => fmt(r.machineDieselBalance)),
    C('Machine', 'Avg', (r) => fmt(r.machineDieselAvg)),

    C('Compressor', 'Name', (r) => txt(pick(r, 'compMachineName', 'compressorMachineName')), undefined, 'left'),
    C('Compressor', 'Start', (r) => fmt(pick(r, 'compStart', 'compressorStart'))),
    C('Compressor', 'End', (r) => fmt(pick(r, 'compEnd', 'compressorEnd'))),
    C('Compressor', 'Hours', (r) => fmt(pick(r, 'compHr', 'compressorHr'))),
    C('Compressor', 'Diesel Filled', (r) => fmt(pick(r, 'compDieselFilled', 'compressorDieselFilled')), () => fmt(T.compressorDieselFilled)),
    C('Compressor', 'Diesel Used', (r) => fmt(pick(r, 'compDieselUsed', 'compressorDieselUsed')), () => fmt(T.compressorDieselUsed)),
    C('Compressor', 'Balance', (r) => fmt(pick(r, 'compDieselBalance', 'compressorDieselBalance'))),
    C('Compressor', 'Avg', (r) => fmt(pick(r, 'compDieselAvg', 'compressorDieselAvg'))),

    C('Work', 'Type', (r) => txt(r.workType), undefined, 'left'),
    C('Work', 'Points', (r) => fmt(r.workPoint), () => fmt(T.workPoint)),
    C('Work', 'Rate', (r) => fmt(r.workRate)),
    C('Work', 'Total', (r) => fmt(r.workTotal), () => fmt(T.workTotal)),
    C('Work', 'Hours', (r) => fmt(r.workHrs), () => fmt(T.workHrs)),

    C('Raw Material', 'Material', (r) => txt(r.materialName), undefined, 'left'),
    C('Raw Material', 'Used Qty', (r) => fmt(r.materialUsedQty)),

    C('Total', 'Grand Total', (r) => fmt(r.rowTotal), () => fmt(T.grandTotal)),
  ]

  const drawHeader = () =>
    drawCompanyHeader({
      doc,
      companyInfo,
      host,
      pageWidth,
      pageHeight,
      margin,
      titleText: 'Casting Work Log Report',
    })

  const headerBottomY = drawHeader()
  let y = headerBottomY

  const filters = []
  if (startDate && endDate) {
    filters.push(`Date Range: ${dateStr(startDate)} to ${dateStr(endDate)}`)
  }
  if (projectName) filters.push(`Project: ${projectName}`)
  if (workType) filters.push(`Work Type: ${workType}`)
  if (castingTeam) filters.push(`Casting Team: ${castingTeam}`)

  if (filters.length) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...MUTED)
    doc.text(`Applied Filters:  ${filters.join('     |     ')}`, margin, y)
    y += 7
  }

  if (!rows.length) {
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(10)
    doc.setTextColor(...MUTED)
    doc.text('No casting work log entries match the selected filters.', margin, y + 10)
  } else {
    const groupRow = []
    cols.forEach((c) => {
      const last = groupRow[groupRow.length - 1]
      if (last && last.key === c.g) {
        last.colSpan += 1
      } else {
        groupRow.push({ key: c.g, content: c.g, colSpan: 1 })
      }
    })
    const headGroup = groupRow.map(({ content, colSpan }) => ({ content, colSpan }))
    const headLabels = cols.map((c) => c.h)

    const body = rows.map((r) => cols.map((c) => c.get(r)))
    const totalRow = cols.map((c) => c.total(T))
    const allBody = [...body, totalRow]

    const leftCols = cols.reduce((acc, c, i) => {
      if (c.align === 'left') acc[i] = { halign: 'left' }
      return acc
    }, {})

    const grandTotalIndex = cols.length - 1
    const totalsIndex = [
      cols.findIndex((c) => c.h === 'Total' && c.g === 'Work'),
      grandTotalIndex,
    ]

    doc.autoTable({
      head: [headGroup, headLabels],
      body: allBody,
      startY: y,
      theme: 'grid',
      margin: { top: headerBottomY, left: margin, right: margin, bottom: 14 },
      styles: {
        font: 'helvetica',
        fontSize: 6.8,
        cellPadding: 1,
        halign: 'center',
        valign: 'middle',
        textColor: INK,
        lineColor: [200, 205, 212],
        lineWidth: 0.2,
        overflow: 'linebreak',
      },
      headStyles: {
        fillColor: NAVY_LIGHT,
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle',
      },
      columnStyles: leftCols,
      didParseCell: (data) => {
        if (data.section === 'head' && data.row.index === 0) {
          data.cell.styles.fillColor = NAVY
          data.cell.styles.fontSize = 7.5
          return
        }
        if (data.section !== 'body') return

        const isTotalRow = data.row.index === allBody.length - 1
        if (isTotalRow) {
          data.cell.styles.fontStyle = 'bold'
          data.cell.styles.fillColor = TOTAL_FILL
        } else if (data.row.index % 2 === 1) {
          data.cell.styles.fillColor = [246, 248, 251]
        }

        if (totalsIndex.includes(data.column.index) && !isTotalRow) {
          data.cell.styles.textColor = GREEN
          data.cell.styles.fontStyle = 'bold'
        }
      },
      addPageContent: () => drawHeader(),
      showHead: 'everyPage',
      rowPageBreak: 'avoid',
    })

    y = doc.lastAutoTable.finalY + 6
  }

  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...MUTED)
    doc.text(
      `Generated on ${new Date().toLocaleDateString('en-GB')}`,
      margin,
      pageHeight - 6
    )
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 6, {
      align: 'right',
    })
  }

  doc.save(fileName)
}

// ─────────────────────────────────────────────────────────────────
// 4. SEPARATE ROTARY WORK LOG REPORT EXPORTS
// ─────────────────────────────────────────────────────────────────

export const downloadRotaryExcel = ({
  rows = [],
  tableTotals = {},
  startDate,
  endDate,
  projectName,
  companyInfo = {},
  fileName = 'Rotary_WorkLog_Report.xlsx',
}) => {
  const T = tableTotals

  const NAVY = '1F3864'
  const HEAD = '344A5E'
  const ZEBRA = 'F6F8FB'
  const TOTAL = 'E2E8F0'
  const GREEN = '008000'
  const INK = '1E2328'
  const MUTED = '6E7680'
  const LINE = 'C8CDD4'

  const NUM_FMT = '[>=10000000]##\\,##\\,##\\,##0.00;[>=100000]##\\,##\\,##0.00;##,##0.00'

  const thin = { style: 'thin', color: { rgb: LINE } }
  const border = { top: thin, bottom: thin, left: thin, right: thin }

  const styleFor = ({ fill, bold = false, color = INK, align = 'left', size = 9 } = {}) => ({
    font: { name: 'Calibri', sz: size, bold, color: { rgb: color } },
    fill: fill ? { patternType: 'solid', fgColor: { rgb: fill } } : undefined,
    alignment: { horizontal: align, vertical: 'center', wrapText: true },
    border,
  })

  const isEmpty = (v) => v === undefined || v === null || v === '' || v === '—'
  const num = (v) => {
    if (isEmpty(v)) return ''
    const n = parseFloat(v)
    return isNaN(n) ? '' : n
  }
  const txt = (v) => (isEmpty(v) ? '' : String(v))
  const dateStr = (d) => (d ? new Date(d).toLocaleDateString('en-GB') : '')

  const C = (group, header, width, type, get, total, align) => ({
    group, header, width, type, get, total: total || (() => ''), align,
  })

  const cols = [
    C('Entry', 'Sr.No.', 7, 'int', (r) => r.srNo, () => 'TOTAL', 'center'),
    C('Entry', 'Date', 12, 'text', (r) => dateStr(r.date)),
    C('Entry', 'Site Name', 18, 'text', (r) => txt(r.site)),
    C('Entry', 'Machine No.', 14, 'text', (r) => txt(r.machineNo)),
    C('Entry', 'Group No.', 12, 'text', (r) => txt(r.groupNo)),
    C('Entry', 'Site Engineer', 18, 'text', (r) => txt(r.siteEngineer)),
    C('Entry', 'Operator Name', 18, 'text', (r) => txt(r.operator)),
    C('Entry', 'Helper Name', 16, 'text', (r) => txt(r.helper)),
    C('Entry', 'Shift Time', 12, 'text', (r) => txt(r.shiftTime)),

    C('Reading', 'Open Reading hr.', 14, 'num', (r) => num(r.openReading)),
    C('Reading', 'Closing Reading hr.', 14, 'num', (r) => num(r.closingReading)),
    C('Reading', 'Total Hours', 12, 'num', (r) => num(r.totalHours), () => num(T.totalHours)),

    C('Boring / Pile', 'Dia', 10, 'num', (r) => num(r.dia)),
    C('Boring / Pile', 'Pile No.', 10, 'text', (r) => txt(r.pileNo)),
    C('Boring / Pile', 'Soft Soil', 11, 'num', (r) => num(r.softSoil), () => num(T.softSoil)),
    C('Boring / Pile', 'Hard Rock', 11, 'num', (r) => num(r.hardRock), () => num(T.hardRock)),
    C('Boring / Pile', 'Today Miter', 12, 'num', (r) => num(r.todayMiter), () => num(T.todayMiter)),
    C('Boring / Pile', 'Total Miter', 12, 'num', (r) => num(r.totalMiter)),
    C('Boring / Pile', 'Today Pile', 11, 'num', (r) => num(r.todayPile), () => num(T.todayPile)),
    C('Boring / Pile', 'Total Pile', 11, 'num', (r) => num(r.totalPile)),

    C('Diesel', 'Diesel (Lit.)', 12, 'num', (r) => num(r.dieselLit), () => num(T.dieselLit)),
    C('Diesel', 'Diesel Start %', 12, 'num', (r) => num(r.dieselStartPercent)),
    C('Diesel', 'Diesel Closing %', 13, 'num', (r) => num(r.dieselClosingPercent)),
    C('Diesel', 'Diesel Use %', 12, 'num', (r) => num(r.dieselUsePercent)),

    C('Bullet', 'Bullet Use', 11, 'num', (r) => num(r.bulletUse), () => num(T.bulletUse)),
    C('Bullet', 'Stock Bullet', 12, 'num', (r) => num(r.stockBullet)),
  ]

  const N = cols.length
  const ws = {}
  const merges = []
  let r = 0

  const put = (row, col, value, style, fmt) => {
    const addr = XLSX.utils.encode_cell({ r: row, c: col })
    if (value === '' || value === null || value === undefined) {
      ws[addr] = { t: 's', v: '', s: style }
      return
    }
    const t = typeof value === 'number' ? 'n' : 's'
    ws[addr] = { t, v: value, s: style }
    if (t === 'n' && fmt) ws[addr].z = fmt
  }

  const mergeAcross = (row, from, to) => {
    if (to > from) merges.push({ s: { r: row, c: from }, e: { r: row, c: to } })
  }

  const titleStyle = {
    font: { name: 'Calibri', sz: 16, bold: true, color: { rgb: 'FFFFFF' } },
    fill: { patternType: 'solid', fgColor: { rgb: NAVY } },
    alignment: { horizontal: 'left', vertical: 'center', indent: 1 },
  }
  for (let c = 0; c < N; c++) put(r, c, c === 0 ? 'Rotary Work Log Report' : '', titleStyle)
  mergeAcross(r, 0, N - 1)
  ws['!rows'] = [{ hpt: 30 }]
  r++

  if (companyInfo.name || companyInfo.company_name) {
    const companyDisplayName = companyInfo.company_name || companyInfo.name
    const subStyle = styleFor({ color: MUTED, size: 10 })
    put(r, 0, companyDisplayName, { ...subStyle, font: { ...subStyle.font, bold: true, color: { rgb: NAVY } } })
    mergeAcross(r, 0, N - 1)
    r++
  }

  const filters = []
  if (startDate && endDate) {
    filters.push(`Date Range: ${dateStr(startDate)} to ${dateStr(endDate)}`)
  }
  if (projectName) filters.push(`Project: ${projectName}`)

  if (filters.length) {
    filters.forEach((f) => {
      put(r, 0, f, styleFor({ color: MUTED, size: 9 }))
      r++
    })
  }
  r++

  const groups = []
  cols.forEach((c, i) => {
    const last = groups[groups.length - 1]
    if (last && last.name === c.group) last.end = i
    else groups.push({ name: c.group, start: i, end: i })
  })
  groups.forEach((g) => {
    for (let c = g.start; c <= g.end; c++) {
      put(r, c, c === g.start ? g.name : '', styleFor({ fill: NAVY, bold: true, color: 'FFFFFF', align: 'center', size: 10 }))
    }
    mergeAcross(r, g.start, g.end)
  })
  r++

  cols.forEach((c, i) => {
    put(r, i, c.header, styleFor({ fill: HEAD, bold: true, color: 'FFFFFF', align: 'center' }))
  })
  ws['!rows'] = ws['!rows'] || []
  ws['!rows'][r] = { hpt: 30 }
  r++

  if (!rows.length) {
    put(r, 0, 'No rotary work log entries match the selected filters.', styleFor({ color: MUTED, size: 10 }))
    r++
  } else {
    rows.forEach((row, ri) => {
      const fill = ri % 2 === 1 ? ZEBRA : undefined
      cols.forEach((c, i) => {
        const highlight = c.header === 'Total Hours' || c.header === 'Today Miter' || c.header === 'Total Miter'
        const align = c.align || (c.type === 'text' ? 'left' : 'right')
        put(
          r, i, c.get(row),
          styleFor({ fill, align, bold: highlight, color: highlight ? GREEN : INK }),
          c.type === 'num' ? NUM_FMT : undefined
        )
      })
      r++
    })
  }

  cols.forEach((c, i) => {
    const align = c.align || (c.type === 'text' ? 'left' : 'right')
    put(r, i, c.total(T), styleFor({ fill: TOTAL, bold: true, align }), c.type === 'num' ? NUM_FMT : undefined)
  })
  r++

  ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: r - 1, c: N - 1 } })
  ws['!merges'] = merges
  ws['!cols'] = cols.map((c) => ({ wch: c.width }))

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, ws, 'Rotary')
  XLSX.writeFile(workbook, fileName)
}

export const downloadRotaryPDF = ({
  rows = [],
  tableTotals = {},
  startDate,
  endDate,
  projectName,
  companyInfo = {},
  host,
  fileName = 'Rotary_WorkLog_Report.pdf',
}) => {
  const doc = new jsPDF('l', 'mm', 'a3')
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 10

  const NAVY = [31, 56, 100]
  const NAVY_LIGHT = [52, 73, 94]
  const INK = [30, 35, 40]
  const MUTED = [110, 118, 128]
  const GREEN = [0, 128, 0]
  const TOTAL_FILL = [226, 232, 240]

  const T = tableTotals

  const isEmpty = (v) => v === undefined || v === null || v === '' || v === '—'
  const fmt = (v) => {
    if (isEmpty(v)) return ''
    const n = parseFloat(v)
    return isNaN(n) ? '' : n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }
  const txt = (v) => (isEmpty(v) ? '' : String(v))
  const dateStr = (d) => (d ? new Date(d).toLocaleDateString('en-GB') : '')

  const C = (g, h, get, total = () => '', align = 'center') => ({ g, h, get, total, align })

  const cols = [
    C('Entry', 'Sr', (r) => r.srNo, () => 'TOTAL'),
    C('Entry', 'Date', (r) => dateStr(r.date)),
    C('Entry', 'Site Name', (r) => txt(r.site), undefined, 'left'),
    C('Entry', 'Machine No.', (r) => txt(r.machineNo), undefined, 'left'),
    C('Entry', 'Group No.', (r) => txt(r.groupNo), undefined, 'left'),
    C('Entry', 'Site Engineer', (r) => txt(r.siteEngineer), undefined, 'left'),
    C('Entry', 'Operator Name', (r) => txt(r.operator), undefined, 'left'),
    C('Entry', 'Helper Name', (r) => txt(r.helper), undefined, 'left'),
    C('Entry', 'Shift', (r) => txt(r.shiftTime)),

    C('Reading', 'Open Hr', (r) => fmt(r.openReading)),
    C('Reading', 'Close Hr', (r) => fmt(r.closingReading)),
    C('Reading', 'Tot Hrs', (r) => fmt(r.totalHours), () => fmt(T.totalHours)),

    C('Boring', 'Dia', (r) => fmt(r.dia)),
    C('Boring', 'Pile No', (r) => txt(r.pileNo)),
    C('Boring', 'Soft Soil', (r) => fmt(r.softSoil), () => fmt(T.softSoil)),
    C('Boring', 'Hard Rock', (r) => fmt(r.hardRock), () => fmt(T.hardRock)),
    C('Boring', 'Today Mtr', (r) => fmt(r.todayMiter), () => fmt(T.todayMiter)),
    C('Boring', 'Tot Mtr', (r) => fmt(r.totalMiter)),
    C('Boring', 'Today Pile', (r) => fmt(r.todayPile), () => fmt(T.todayPile)),
    C('Boring', 'Tot Pile', (r) => fmt(r.totalPile)),

    C('Diesel', 'Dsl (L)', (r) => fmt(r.dieselLit), () => fmt(T.dieselLit)),
    C('Diesel', 'Start %', (r) => fmt(r.dieselStartPercent)),
    C('Diesel', 'Close %', (r) => fmt(r.dieselClosingPercent)),
    C('Diesel', 'Use %', (r) => fmt(r.dieselUsePercent)),

    C('Bullet', 'Bullet Use', (r) => fmt(r.bulletUse), () => fmt(T.bulletUse)),
    C('Bullet', 'Stock Bullet', (r) => fmt(r.stockBullet)),
  ]

  const drawHeader = () =>
    drawCompanyHeader({
      doc,
      companyInfo,
      host,
      pageWidth,
      pageHeight,
      margin,
      titleText: 'Rotary Work Log Report',
    })

  const headerBottomY = drawHeader()
  let y = headerBottomY

  const filters = []
  if (startDate && endDate) filters.push(`Date Range: ${dateStr(startDate)} to ${dateStr(endDate)}`)
  if (projectName) filters.push(`Project: ${projectName}`)

  if (filters.length) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...MUTED)
    doc.text(`Applied Filters:  ${filters.join('     |     ')}`, margin, y)
    y += 7
  }

  if (!rows.length) {
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(10)
    doc.setTextColor(...MUTED)
    doc.text('No rotary work log entries match the selected filters.', margin, y + 10)
  } else {
    const groupRow = []
    cols.forEach((c) => {
      const last = groupRow[groupRow.length - 1]
      if (last && last.key === c.g) last.colSpan += 1
      else groupRow.push({ key: c.g, content: c.g, colSpan: 1 })
    })
    const headGroup = groupRow.map(({ content, colSpan }) => ({ content, colSpan }))
    const headLabels = cols.map((c) => c.h)

    const body = rows.map((r) => cols.map((c) => c.get(r)))
    const totalRow = cols.map((c) => c.total(T))
    const allBody = [...body, totalRow]

    const leftCols = cols.reduce((acc, c, i) => {
      if (c.align === 'left') acc[i] = { halign: 'left' }
      return acc
    }, {})

    const totalsIndex = [
      cols.findIndex((c) => c.h === 'Tot Hrs'),
      cols.findIndex((c) => c.h === 'Today Mtr'),
      cols.findIndex((c) => c.h === 'Dsl (L)'),
    ]

    doc.autoTable({
      head: [headGroup, headLabels],
      body: allBody,
      startY: y,
      theme: 'grid',
      margin: { top: headerBottomY, left: margin, right: margin, bottom: 14 },
      styles: {
        font: 'helvetica',
        fontSize: 6.8,
        cellPadding: 1,
        halign: 'center',
        valign: 'middle',
        textColor: INK,
        lineColor: [200, 205, 212],
        lineWidth: 0.2,
        overflow: 'linebreak',
      },
      headStyles: {
        fillColor: NAVY_LIGHT,
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle',
      },
      columnStyles: leftCols,
      didParseCell: (data) => {
        if (data.section === 'head' && data.row.index === 0) {
          data.cell.styles.fillColor = NAVY
          data.cell.styles.fontSize = 7.5
          return
        }
        if (data.section !== 'body') return

        const isTotalRow = data.row.index === allBody.length - 1
        if (isTotalRow) {
          data.cell.styles.fontStyle = 'bold'
          data.cell.styles.fillColor = TOTAL_FILL
        } else if (data.row.index % 2 === 1) {
          data.cell.styles.fillColor = [246, 248, 251]
        }

        if (totalsIndex.includes(data.column.index) && !isTotalRow) {
          data.cell.styles.textColor = GREEN
          data.cell.styles.fontStyle = 'bold'
        }
      },
      addPageContent: () => drawHeader(),
      showHead: 'everyPage',
      rowPageBreak: 'avoid',
    })

    y = doc.lastAutoTable.finalY + 6
  }

  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...MUTED)
    doc.text(`Generated on ${new Date().toLocaleDateString('en-GB')}`, margin, pageHeight - 6)
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 6, { align: 'right' })
  }

  doc.save(fileName)
}

// ─────────────────────────────────────────────────────────────────
// 5. MULTI-SITE BREAKDOWN EXPORTS
// ─────────────────────────────────────────────────────────────────

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

export const downloadMultiSiteExcel = ({
  multiSiteData = [],
  date,
  companyInfo = {},
  fileName = 'MultiSiteBreakdown.xlsx',
}) => {
  const NAVY = '1F3864'
  const HEAD = '344A5E'
  const ZEBRA = 'F6F8FB'
  const TOTAL = 'E2E8F0'
  const GREEN = '008000'
  const INK = '1E2328'
  const MUTED = '6E7680'
  const LINE = 'C8CDD4'
  const NUM_FMT = '[>=10000000]##\\,##\\,##\\,##0.00;[>=100000]##\\,##\\,##0.00;##,##0.00'

  const thin = { style: 'thin', color: { rgb: LINE } }
  const border = { top: thin, bottom: thin, left: thin, right: thin }

  const styleFor = ({ fill, bold = false, color = INK, align = 'left', size = 9 } = {}) => ({
    font: { name: 'Calibri', sz: size, bold, color: { rgb: color } },
    fill: fill ? { patternType: 'solid', fgColor: { rgb: fill } } : undefined,
    alignment: { horizontal: align, vertical: 'center', wrapText: true },
    border,
  })

  const isEmpty = (v) => v === undefined || v === null || v === '' || v === '—'
  const num = (v) => {
    if (isEmpty(v)) return ''
    const n = parseFloat(v)
    return isNaN(n) ? '' : n
  }
  const txt = (v) => (isEmpty(v) ? '' : String(v))
  const dateStr = (d) => (d ? new Date(d).toLocaleDateString('en-GB') : 'All')

  const cols = [
    { header: 'Site / Project', width: 22, type: 'text', align: 'left', get: (r) => txt(r.projectName) },
    { header: 'Work Type', width: 16, type: 'text', align: 'left', get: (r) => txt(r.workType) },
    { header: 'Points Done', width: 13, type: 'num', align: 'right', get: (r) => num(r.workPoints) },
    { header: 'Run Hrs', width: 12, type: 'num', align: 'right', get: (r) => num(r.totalHours) },
    { header: 'Fuel (L)', width: 12, type: 'num', align: 'right', get: (r) => num(r.totalDiesel) },
    { header: 'Work / Hr', width: 12, type: 'num', align: 'right', get: (r) => num(r.workPerHour) },
    { header: 'Work / L', width: 12, type: 'num', align: 'right', get: (r) => num(r.workPerDiesel) },
    { header: 'Site Total Points', width: 16, type: 'num', align: 'right', get: (r) => (r.isFirstRow ? num(r.siteTotalDone) : '') },
    { header: 'Site Total Hrs', width: 14, type: 'num', align: 'right', get: (r) => (r.isFirstRow ? num(r.siteTotalHrs) : '') },
    { header: 'Site Total Fuel (L)', width: 16, type: 'num', align: 'right', get: (r) => (r.isFirstRow ? num(r.siteTotalFuel) : '') },
    { header: 'Site Avg Yield', width: 14, type: 'num', align: 'right', get: (r) => (r.isFirstRow ? num(r.siteAvgYield) : '') },
  ]

  const flattened = flattenMultiSiteData(multiSiteData || [])
  const grandPoints = (multiSiteData || []).reduce((s, x) => s + (parseFloat(x.total_done) || 0), 0)
  const grandHrs = (multiSiteData || []).reduce((s, x) => s + (parseFloat(x.total_hrs) || 0), 0)
  const grandFuel = (multiSiteData || []).reduce((s, x) => s + (parseFloat(x.total_fuel) || 0), 0)
  const grandAvgYield = grandHrs > 0 ? (grandPoints / grandHrs) : 0

  const totals = [
    'TOTAL',
    '',
    grandPoints,
    grandHrs,
    grandFuel,
    '',
    '',
    grandPoints,
    grandHrs,
    grandFuel,
    grandAvgYield,
  ]

  const N = cols.length
  const ws = {}
  const merges = []
  let r = 0

  const put = (row, col, value, style, fmt) => {
    const addr = XLSX.utils.encode_cell({ r: row, c: col })
    if (value === '' || value === null || value === undefined) {
      ws[addr] = { t: 's', v: '', s: style }
      return
    }
    const t = typeof value === 'number' ? 'n' : 's'
    ws[addr] = { t, v: value, s: style }
    if (t === 'n' && fmt) ws[addr].z = fmt
  }

  const mergeAcross = (row, from, to) => {
    if (to > from) merges.push({ s: { r: row, c: from }, e: { r: row, c: to } })
  }

  const titleStyle = {
    font: { name: 'Calibri', sz: 16, bold: true, color: { rgb: 'FFFFFF' } },
    fill: { patternType: 'solid', fgColor: { rgb: NAVY } },
    alignment: { horizontal: 'left', vertical: 'center', indent: 1 },
  }
  for (let c = 0; c < N; c++) put(r, c, c === 0 ? 'Multi-Site Breakdown Report' : '', titleStyle)
  mergeAcross(r, 0, N - 1)
  ws['!rows'] = [{ hpt: 30 }]
  r++

  if (companyInfo.name || companyInfo.company_name) {
    const companyDisplayName = companyInfo.company_name || companyInfo.name
    const subStyle = styleFor({ color: MUTED, size: 10 })
    put(r, 0, companyDisplayName, { ...subStyle, font: { ...subStyle.font, bold: true, color: { rgb: NAVY } } })
    mergeAcross(r, 0, N - 1)
    r++
  }

  put(r, 0, `Active Day: ${dateStr(date)}   |   Total Sites Active: ${(multiSiteData || []).length}`, styleFor({ color: MUTED, size: 9 }))
  mergeAcross(r, 0, N - 1)
  r++
  r++

  cols.forEach((c, i) => {
    put(r, i, c.header, styleFor({ fill: HEAD, bold: true, color: 'FFFFFF', align: 'center' }))
  })
  ws['!rows'] = ws['!rows'] || []
  ws['!rows'][r] = { hpt: 30 }
  r++

  if (!flattened.length) {
    put(r, 0, 'No multi-site data available for the selected date.', styleFor({ color: MUTED, size: 10 }))
    r++
  } else {
    flattened.forEach((row, ri) => {
      const fill = ri % 2 === 1 ? ZEBRA : undefined
      cols.forEach((c, i) => {
        const val = c.get(row)
        put(
          r, i, val,
          styleFor({ fill, align: c.align, bold: false, color: INK }),
          c.type === 'num' && typeof val === 'number' ? NUM_FMT : undefined
        )
      })
      r++
    })
  }

  totals.forEach((val, i) => {
    const isNum = typeof val === 'number'
    put(
      r, i, val,
      styleFor({ fill: TOTAL, bold: true, align: isNum ? 'right' : (i === 0 ? 'center' : 'left'), color: isNum ? GREEN : INK }),
      isNum ? NUM_FMT : undefined
    )
  })
  r++

  ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: r - 1, c: N - 1 } })
  ws['!merges'] = merges
  ws['!cols'] = cols.map((c) => ({ wch: c.width }))

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, ws, 'MultiSiteBreakdown')
  XLSX.writeFile(workbook, fileName)
}

export const downloadMultiSitePDF = ({
  multiSiteData = [],
  date,
  companyInfo = {},
  host,
  fileName = 'MultiSiteBreakdown.pdf',
}) => {
  const doc = new jsPDF('l', 'mm', 'a4')
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 10

  const NAVY = [31, 56, 100]
  const NAVY_LIGHT = [52, 73, 94]
  const INK = [30, 35, 40]
  const MUTED = [110, 118, 128]
  const GREEN = [0, 128, 0]
  const TOTAL_FILL = [226, 232, 240]

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

  const headerBottomY = drawHeader()
  let startY = headerBottomY

  if (!multiSiteData || multiSiteData.length === 0) {
    doc.setFontSize(11)
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(...MUTED)
    doc.text('No data available for the selected date.', margin + 8, startY + 10)
    doc.save(fileName)
    return
  }

  const grandPoints = multiSiteData.reduce((s, x) => s + (parseFloat(x.total_done) || 0), 0)
  const grandHrs = multiSiteData.reduce((s, x) => s + (parseFloat(x.total_hrs) || 0), 0)
  const grandFuel = multiSiteData.reduce((s, x) => s + (parseFloat(x.total_fuel) || 0), 0)
  const grandAvgYield = grandHrs > 0 ? (grandPoints / grandHrs).toFixed(2) : '0.00'

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...MUTED)
  const dateFormatted = date ? new Date(date).toLocaleDateString('en-GB') : 'All'
  doc.text(
    `Active Day: ${dateFormatted}   |   Total Sites: ${multiSiteData.length}   |   Grand Total Points: ${grandPoints.toFixed(2)}   |   Total Run Hrs: ${grandHrs.toFixed(2)} hrs   |   Total Fuel: ${grandFuel.toFixed(2)} L   |   Fleet Avg Yield: ${grandAvgYield}`,
    margin + 8,
    startY
  )
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
    doc.setTextColor(...NAVY)
    doc.text(`Site: ${site.project_name || 'Unnamed Site'}`, margin + 8, startY)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(...MUTED)
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
        fontSize: 8.5,
        cellPadding: 3,
        overflow: 'linebreak',
        halign: 'center',
        valign: 'middle',
        textColor: INK,
        lineColor: [200, 205, 212],
        lineWidth: 0.2,
      },
      headStyles: {
        fillColor: NAVY_LIGHT,
        textColor: 255,
        fontSize: 8.5,
        fontStyle: 'bold',
        halign: 'center',
      },
      alternateRowStyles: {
        fillColor: [246, 248, 251],
      },
      didParseCell: (data) => {
        if (['Work/Hr', 'Work/L'].includes(data.column.dataKey)) {
          data.cell.styles.textColor = GREEN
        }
        if (data.row.index === tableRows.length - 1) {
          data.cell.styles.fontStyle = 'bold'
          data.cell.styles.fillColor = TOTAL_FILL
        }
      },
    })

    startY = doc.lastAutoTable.finalY + 8
  })

  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...MUTED)
    doc.text(
      `Generated on ${new Date().toLocaleDateString('en-GB')}`,
      margin + 8,
      pageHeight - 6
    )
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin - 8, pageHeight - 6, {
      align: 'right',
    })
  }

  doc.save(fileName)
}
