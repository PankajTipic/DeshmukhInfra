
// import jsPDF from 'jspdf'
// import 'jspdf-autotable'
// import { getAPICall } from '../../../util/api'
// import { getUserData } from '../../../util/session'
// import { host } from '../../../util/constants'

// // ─── Helper functions (unchanged) ──────────────────────────────────────────────
// const formatIndianNumber = (number) => {
//   return new Intl.NumberFormat('en-IN', { 
//     minimumFractionDigits: 2, 
//     maximumFractionDigits: 2 
//   }).format(number)
// }

// const formatCurrency = (amount) => {
//   return `Rs ${formatIndianNumber(amount)}`
// }

// const formatDate = (date) => {
//   if (!date) return 'N/A'
//   return new Date(date).toLocaleDateString('en-IN', {
//     day: '2-digit',
//     month: 'short',
//     year: 'numeric'
//   })
// }

// // Fetch function (unchanged)
// const fetchAllTransferData = async (startDate, endDate, account = null) => {
//   try {
//     const params = new URLSearchParams()
//     if (startDate) params.append('start_date', startDate)
//     if (endDate) params.append('end_date', endDate)
//     if (account && account !== 'all') params.append('account', account)

//     const response = await getAPICall(`/api/internal-money-transfers?${params.toString()}`)
    
//     if (response && response.length > 0) {
//       return {
//         transfers: response,
//         total_amount: response.reduce((sum, t) => sum + parseFloat(t.amount), 0),
//         total_transfers: response.length
//       }
//     }
    
//     return { transfers: [], total_amount: 0, total_transfers: 0 }
//   } catch (error) {
//     console.error('Error fetching transfer data:', error)
//     throw new Error('Failed to fetch transfer data from server')
//   }
// }

// // ─── MAIN PDF GENERATOR ────────────────────────────────────────────────────────
// export const generateTransferReportPDF = async (startDate, endDate, account = 'all') => {
//   if (!startDate || !endDate) {
//     throw new Error('Please select date range')
//   }

//   const { transfers: transferData, total_amount, total_transfers } = await fetchAllTransferData(startDate, endDate, account)

//   if (!transferData || transferData.length === 0) {
//     throw new Error('No transfer records found for the selected date range')
//   }

//   const doc = new jsPDF('l', 'mm', 'a4')
//   const pageWidth = doc.internal.pageSize.getWidth()
//   const pageHeight = doc.internal.pageSize.getHeight()
//   const margin = 12
//   const headerHeight = 40 // mm - approximate height of header (adjust if needed)

//   const user = getUserData()
//   const companyInfo = user?.company_info || {}

//   // ───────────────────────────────────────────────
//   // Draw header and border, return content start Y
//   // ───────────────────────────────────────────────
//   const drawHeaderAndBorder = () => {
//     // Border
//     doc.setDrawColor(80, 80, 80)
//     doc.setLineWidth(0.4)
//     doc.rect(margin, margin, pageWidth - margin * 2, pageHeight - margin * 2)

//     // Logo (top-right)
//     const logoSize = 26
//     const logoX = pageWidth - margin - logoSize - 6
//     const logoY = margin + 6

//     let logoUrl = null
//     if (companyInfo.logo && companyInfo.logo !== "invoice/empty.png") {
//       logoUrl = `${host}/img/${companyInfo.logo}`
//     }

//     if (logoUrl) {
//       try {
//         doc.addImage(logoUrl, 'PNG', logoX, logoY, logoSize, logoSize)
//       } catch (err) {
//         console.warn("Failed to load logo:", err)
//         doc.setFillColor(220, 220, 240)
//         doc.rect(logoX, logoY, logoSize, logoSize, 'F')
//         doc.setFontSize(9)
//         doc.setTextColor(100)
//         doc.text("LOGO", logoX + 6, logoY + 14)
//       }
//     } else {
//       doc.setFillColor(220, 220, 240)
//       doc.rect(logoX, logoY, logoSize, logoSize, 'F')
//       doc.setFontSize(9)
//       doc.setTextColor(100)
//       doc.text("LOGO", logoX + 6, logoY + 14)
//     }

//     // Company name & details (top-left)
//     const textX = margin + 6
//     let textY = margin + 10

//     doc.setFontSize(18)
//     doc.setFont("helvetica", "bold")
//     doc.setTextColor(40, 40, 60)
//     doc.text(companyInfo.company_name || "Deshmukh Infra Soft", textX, textY)

//     textY += 8

//     doc.setFontSize(9.5)
//     doc.setFont("helvetica", "normal")
//     doc.setTextColor(60)

//     const details = [
//       companyInfo.land_mark || "Urali Kanchan, Pune",
//       `Phone: ${companyInfo.phone_no || "9173635656"}`,
//       `Email: ${companyInfo.email_id || "shreyas.gijare.21@gmail.com"}`,
//       `GSTIN: ${companyInfo.gst_number || "Not Available"}`,
//     ]

//     details.forEach(line => {
//       if (line && line.trim()) {
//         doc.text(line, textX, textY)
//         textY += 5.2
//       }
//     })

//     // Horizontal separator
//     doc.setLineWidth(0.7)
//     doc.setDrawColor(0, 0, 0)
//     doc.line(margin + 6, textY + 4, pageWidth - margin - 6, textY + 4)

//     // Title
//     doc.setFontSize(16)
//     doc.setFont("helvetica", "bold")
//     doc.setTextColor(0)
//     doc.text(
//       'INTERNAL MONEY TRANSFER LOG',
//       pageWidth / 2,
//       textY + 12,
//       { align: 'center' }
//     )

//     // Period & generated date
//     doc.setFontSize(10)
//     doc.setFont("helvetica", "normal")
//     doc.setTextColor(70)

//     let subY = textY + 20
//     doc.text(
//       `Period: ${formatDate(startDate)} to ${formatDate(endDate)}`,
//       pageWidth / 2,
//       subY,
//       { align: 'center' }
//     )

//     if (account !== 'all') {
//       subY += 5
//       doc.text(`Account: ${account}`, pageWidth / 2, subY, { align: 'center' })
//     }

//     subY += 5
//     doc.setFontSize(8)
//     doc.setTextColor(100)
//     doc.text(`Generated on: ${formatDate(new Date())}`, pageWidth / 2, subY, { align: 'center' })

//     // Return content start Y (below header)
//     return subY + 12
//   }

//   // Draw header on page 1
//   let yPosition = drawHeaderAndBorder()

//   // ───────────────────────────────────────────────
//   // TRANSFER DETAILS table
//   // ───────────────────────────────────────────────
//   if (yPosition > pageHeight - 100) {
//     doc.addPage()
//     yPosition = drawHeaderAndBorder()
//   }

//   doc.setFillColor(52, 152, 219)
//   doc.setDrawColor(41, 128, 185)
//   doc.setLineWidth(0.2)
//   doc.rect(margin, yPosition, pageWidth - margin * 2, 8, 'FD')
  
//   doc.setTextColor(255, 255, 255)
//   doc.setFontSize(10)
//   doc.setFont('helvetica', 'bold')
//   doc.text('TRANSFER DETAILS', margin + 2, yPosition + 5.5)
  
//   yPosition += 10
//   doc.setTextColor(0, 0, 0)

//   const tableData = transferData.map((transfer) => [
//     formatDate(transfer.transfer_date),
//     transfer.project?.project_name || '-',
//     transfer.from_account || 'N/A',
//     transfer.to_account || 'N/A',
//     formatCurrency(parseFloat(transfer.amount || 0)),
//     transfer.reference_number || 'N/A',
//     transfer.description || 'N/A'
//   ])

//   const totalTransferred = transferData.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0)

//   doc.autoTable({
//     startY: yPosition,
//     head: [['Transfer Date', 'Project', 'From Account', 'To Account', 'Amount (Rs)', 'Reference Number', 'Description']],
//     body: tableData,
//     foot: [[
//       `Total Records: ${total_transfers}`,
//       '',
//       '',
//       '',
//       formatCurrency(totalTransferred),
//       '',
//       ''
//     ]],
//     theme: 'striped',
//     styles: { 
//       fontSize: 7, 
//       cellPadding: 2.5,
//       overflow: 'linebreak',
//       halign: 'left',
//       valign: 'middle',
//       lineColor: [200, 200, 200],
//       lineWidth: 0.1
//     },
//     headStyles: { 
//       fillColor: [46, 204, 113], 
//       textColor: 255, 
//       fontStyle: 'bold',
//       halign: 'center',
//       fontSize: 7
//     },
//     footStyles: {
//       fillColor: [236, 240, 241],
//       textColor: [52, 73, 94],
//       fontStyle: 'bold',
//       halign: 'left',
//       fontSize: 7
//     },
//     columnStyles: {
//       0: { cellWidth: 25, halign: 'center' },
//       1: { cellWidth: 35, halign: 'left' },
//       2: { cellWidth: 40, halign: 'left' },
//       3: { cellWidth: 40, halign: 'left' },
//       4: { cellWidth: 30, halign: 'right' },
//       5: { cellWidth: 30, halign: 'left' },
//       6: { cellWidth: 67, halign: 'left' }
//     },
//     margin: { left: margin, right: margin },
//     didDrawPage: (data) => {
//       // If new page added during table rendering, draw header + border
//       if (data.pageNumber > 1) {
//         drawHeaderAndBorder()
//       }
//     }
//   })

//   yPosition = doc.lastAutoTable.finalY + 6

//   // ─── Project-wise summary ──────────────────────────────────────────────────
//   const projectSummary = {}
//   let hasProjects = false
  
//   transferData.forEach(transfer => {
//     if (transfer.project_id && transfer.project) {
//       hasProjects = true
//       const projectName = transfer.project.project_name
//       if (!projectSummary[projectName]) {
//         projectSummary[projectName] = { count: 0, total: 0 }
//       }
//       projectSummary[projectName].count++
//       projectSummary[projectName].total += parseFloat(transfer.amount)
//     }
//   })

//   if (hasProjects && Object.keys(projectSummary).length > 0) {
//     if (yPosition > pageHeight - headerHeight - 60) {
//       doc.addPage()
//       yPosition = drawHeaderAndBorder()
//     } else {
//       yPosition += 5
//     }

//     doc.setFillColor(149, 165, 166)
//     doc.setDrawColor(127, 140, 141)
//     doc.setLineWidth(0.2)
//     doc.rect(margin, yPosition, pageWidth - margin * 2, 8, 'FD')
    
//     doc.setTextColor(255, 255, 255)
//     doc.setFontSize(10)
//     doc.setFont('helvetica', 'bold')
//     doc.text('PROJECT-WISE SUMMARY', margin + 2, yPosition + 5.5)
    
//     yPosition += 10

//     const projectTableData = Object.entries(projectSummary).map(([projectName, data]) => [
//       projectName,
//       data.count.toString(),
//       formatCurrency(data.total)
//     ])

//     doc.autoTable({
//       startY: yPosition,
//       head: [['Project Name', 'Transfer Count', 'Total Amount (Rs)']],
//       body: projectTableData,
//       theme: 'striped',
//       styles: { 
//         fontSize: 8, 
//         cellPadding: 3,
//         overflow: 'linebreak',
//         halign: 'left',
//         valign: 'middle',
//         lineColor: [200, 200, 200],
//         lineWidth: 0.1
//       },
//       headStyles: { 
//         fillColor: [52, 152, 219], 
//         textColor: 255, 
//         fontStyle: 'bold',
//         halign: 'center',
//         fontSize: 8
//       },
//       columnStyles: {
//         0: { cellWidth: 'auto', halign: 'left' },
//         1: { cellWidth: 40, halign: 'center' },
//         2: { cellWidth: 50, halign: 'right' }
//       },
//       margin: { left: margin, right: margin },
//       didDrawPage: (data) => {
//         if (data.pageNumber > 1) {
//           drawHeaderAndBorder()
//         }
//       }
//     })

//     yPosition = doc.lastAutoTable.finalY + 6
//   }

//   // ─── Grand total section ───────────────────────────────────────────────────
//   if (yPosition > pageHeight - headerHeight - 30) {
//     doc.addPage()
//     yPosition = drawHeaderAndBorder()
//   } else {
//     yPosition += 5
//   }

//   doc.setFillColor(41, 128, 185)
//   doc.setDrawColor(52, 73, 94)
//   doc.setLineWidth(0.5)
//   doc.rect(margin, yPosition, pageWidth - margin * 2, 12, 'FD')
  
//   doc.setTextColor(255, 255, 255)
//   doc.setFontSize(11)
//   doc.setFont('helvetica', 'bold')
//   doc.text('GRAND TOTAL TRANSFERRED AMOUNT:', margin + 3, yPosition + 8)
//   doc.setFontSize(12)
//   doc.text(formatCurrency(total_amount), pageWidth - margin - 3, yPosition + 8, { align: 'right' })
  
//   doc.setTextColor(0, 0, 0)

//   // ─── Footer text on all pages (unchanged) ───
//   const totalPages = doc.internal.getNumberOfPages()
//   for (let i = 1; i <= totalPages; i++) {
//     doc.setPage(i)
//     doc.setFontSize(7)
//     doc.setFont('helvetica', 'normal')
//     doc.setTextColor(128, 128, 128)
    
//     doc.text(
//       `Internal Money Transfer Log | Period: ${formatDate(startDate)} to ${formatDate(endDate)} | Generated: ${formatDate(new Date())}`,
//       pageWidth / 2,
//       pageHeight - 5,
//       { align: 'center' }
//     )
//   }

//   // Save
//   const timestamp = new Date().toISOString().split('T')[0]
//   const startFormatted = formatDate(startDate).replace(/\s/g, '_')
//   const endFormatted = formatDate(endDate).replace(/\s/g, '_')
//   let fileName = `Internal_Transfer_Log_${startFormatted}_to_${endFormatted}.pdf`
//   if (account !== 'all') {
//     fileName = `Internal_Transfer_Log_${account.replace(/\s/g, '_')}_${startFormatted}_to_${endFormatted}.pdf`
//   }
//   doc.save(fileName)
// }
















import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { getAPICall } from '../../../util/api'
import { getUserData } from '../../../util/session'
import { host } from '../../../util/constants'

// ─── Helper ──────────────────────────────
const formatIndianNumber = (number) =>
  new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(number)

const formatCurrency = (amount) => `Rs ${formatIndianNumber(amount)}`

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

// ─── Fetch ──────────────────────────────
const fetchAllTransferData = async (startDate, endDate, account = null) => {
  const params = new URLSearchParams()

  if (startDate) params.append('start_date', startDate)
  if (endDate) params.append('end_date', endDate)
  if (account && account !== 'all') params.append('account', account)

  const res = await getAPICall(`/api/internal-money-transfers?${params}`)

  if (res && res.length) {
    return {
      transfers: res,
      total_amount: res.reduce((s, t) => s + parseFloat(t.amount), 0),
      total_transfers: res.length
    }
  }

  return { transfers: [], total_amount: 0, total_transfers: 0 }
}

// ─── MAIN ──────────────────────────────
export const generateTransferReportPDF = async (
  startDate,
  endDate,
  account = 'all'
) => {
  if (!startDate || !endDate) throw new Error('Select date')

  const {
    transfers,
    total_amount,
    total_transfers
  } = await fetchAllTransferData(startDate, endDate, account)

  if (!transfers.length) throw new Error('No Data')

  const doc = new jsPDF('l', 'mm', 'a4')

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  const margin = 12
  const miniHeaderHeight = 63

  const user = getUserData()
  const companyInfo = user?.company_info || {}

  // ─── HEADER ──────────────────────────────
  const drawHeader = (showMainTitle = false) => {
    // Border
    doc.setLineWidth(0.4)
    doc.rect(margin, margin, pageWidth - 24, pageHeight - 24)

    // Logo
    const logoSize = 26
    const logoX = pageWidth - margin - logoSize - 6
    const logoY = margin + 6

    if (companyInfo.logo) {
      try {
        doc.addImage(
          `${host}/img/${companyInfo.logo}`,
          'PNG',
          logoX,
          logoY,
          logoSize,
          logoSize
        )
      } catch {}
    }

    // Company
    let y = margin + 10
    const x = margin + 6

    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text(companyInfo.company_name || 'Deshmukh Infra Soft', x, y)

    y += 8
    doc.setFontSize(9)

    const info = [
      companyInfo.land_mark || 'urali kanchan',
      `Phone: ${companyInfo.phone_no || ''}`,
      `Email: ${companyInfo.email_id || ''}`,
      `GSTIN: ${companyInfo.gst_number || ''}`
    ]

    info.forEach((t) => {
      if (t) {
        doc.text(t, x, y)
        y += 5
      }
    })

    // HR
    const hrY = y + 3
    doc.setLineWidth(0.7)
    doc.line(margin + 5, hrY, pageWidth - margin - 5, hrY)

    // ✅ ONLY ON FIRST PAGE
    if (showMainTitle) {
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')

      doc.text(
        'INTERNAL MONEY TRANSFER LOG',
        pageWidth / 2,
        hrY + 12,
        { align: 'center' }
      )

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')

      let sy = hrY + 20

      doc.text(
        `Period: ${formatDate(startDate)} to ${formatDate(endDate)}`,
        pageWidth / 2,
        sy,
        { align: 'center' }
      )

      sy += 5
      doc.setFontSize(8)

      doc.text(
        `Generated on: ${formatDate(new Date())}`,
        pageWidth / 2,
        sy,
        { align: 'center' }
      )

      return sy + 8
    }

    return hrY + 3
  }

  // ─── FIRST HEADER ──────────────────────────────
  let y = drawHeader(true)

  // ─── TRANSFER BAR ──────────────────────────────
  doc.setFillColor(52, 152, 219)
  doc.rect(margin, y, pageWidth - 24, 8, 'F')

  doc.setTextColor(255)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')

  doc.text('TRANSFER DETAILS', margin + 2, y + 5.5)

  y += 10
  doc.setTextColor(0)

  // ─── TABLE DATA ──────────────────────────────
  const rows = transfers.map((t) => [
    formatDate(t.transfer_date),
    t.project?.project_name || '-',
    t.from_account,
    t.to_account,
    formatCurrency(t.amount),
    t.reference_number || '-',
    t.description || '-'
  ])

  let isMainTable = true // 🔥 FLAG

  // ─── MAIN TABLE ──────────────────────────────
  doc.autoTable({
    startY: y,

    head: [[
      'Date',
      'Project',
      'From',
      'To',
      'Amount',
      'Ref No',
      'Description'
    ]],

    body: rows,

    foot: [[
      `Total Records: ${total_transfers}`,
      '',
      '',
      '',
      formatCurrency(total_amount),
      '',
      ''
    ]],

    styles: { fontSize: 7 },

    margin: {
      left: margin,
      right: margin,
      top: miniHeaderHeight,
      bottom: margin + 10
    },

    didDrawPage: (data) => {
      drawHeader(data.pageNumber === 1 && isMainTable)
    }
  })

  isMainTable = false // ❗ after main table

  y = doc.lastAutoTable.finalY + 10

  // ─── PROJECT SUMMARY ──────────────────────────────
  const summary = {}

  transfers.forEach((t) => {
    if (t.project?.project_name) {
      const name = t.project.project_name

      if (!summary[name]) {
        summary[name] = { count: 0, total: 0 }
      }

      summary[name].count++
      summary[name].total += parseFloat(t.amount)
    }
  })

  if (Object.keys(summary).length) {
    if (y > pageHeight - 80) {
      doc.addPage()
      y = drawHeader(false)
    }

    doc.setFillColor(150)
    doc.rect(margin, y, pageWidth - 24, 8, 'F')

    doc.setTextColor(255)
    doc.text('PROJECT-WISE SUMMARY', margin + 2, y + 5.5)

    y += 10
    doc.setTextColor(0)

    const pdata = Object.entries(summary).map(([k, v]) => [
      k,
      v.count,
      formatCurrency(v.total)
    ])

    doc.autoTable({
      startY: y,

      head: [['Project', 'Count', 'Total']],

      body: pdata,

      styles: { fontSize: 8 },

      margin: {
        left: margin,
        right: margin,
        top: miniHeaderHeight,
        bottom: margin + 10
      },

      didDrawPage: () => {
        drawHeader(false) // ❗ NO MAIN TITLE
      }
    })

    y = doc.lastAutoTable.finalY + 10
  }

  // ─── GRAND TOTAL ──────────────────────────────
  if (y > pageHeight - 40) {
    doc.addPage()
    y = drawHeader(false)
  }

  doc.setFillColor(41, 128, 185)
  doc.rect(margin, y, pageWidth - 24, 12, 'F')

  doc.setTextColor(255)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')

  doc.text('GRAND TOTAL:', margin + 3, y + 8)

  doc.text(
    formatCurrency(total_amount),
    pageWidth - margin - 3,
    y + 8,
    { align: 'right' }
  )

  // ─── FOOTER ──────────────────────────────
  const pages = doc.internal.getNumberOfPages()

  for (let i = 1; i <= pages; i++) {
    doc.setPage(i)

    doc.setFontSize(7)
    doc.setTextColor(120)

    doc.text(
      `Internal Transfer Report | ${formatDate(startDate)} to ${formatDate(endDate)}`,
      pageWidth / 2,
      pageHeight - 5,
      { align: 'center' }
    )

    doc.text(
      `Page ${i}`,
      pageWidth - margin - 3,
      pageHeight - 5,
      { align: 'right' }
    )
  }

  // ─── SAVE ──────────────────────────────
  doc.save('Internal_Money_Transfer.pdf')
}
