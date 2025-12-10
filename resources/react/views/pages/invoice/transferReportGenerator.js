import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { getAPICall } from '../../../util/api'

// Helper function to format numbers in Indian numeric system
const formatIndianNumber = (number) => {
  return new Intl.NumberFormat('en-IN', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  }).format(number)
}

// Helper function to format currency
const formatCurrency = (amount) => {
  return `Rs ${formatIndianNumber(amount)}`
}

// Helper function to format date
const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

// Fetch all transfer data for the given date range
const fetchAllTransferData = async (startDate, endDate, account = null) => {
  try {
    const params = new URLSearchParams()
    if (startDate) {
      params.append('start_date', startDate)
    }
    if (endDate) {
      params.append('end_date', endDate)
    }
    if (account && account !== 'all') {
      params.append('account', account)
    }

    // Fetch all internal money transfer records within date range
    const response = await getAPICall(`/api/internal-money-transfers?${params.toString()}`)
    
    if (response && response.length > 0) {
      return {
        transfers: response,
        total_amount: response.reduce((sum, t) => sum + parseFloat(t.amount), 0),
        total_transfers: response.length
      }
    }
    
    return { transfers: [], total_amount: 0, total_transfers: 0 }
  } catch (error) {
    console.error('Error fetching transfer data:', error)
    throw new Error('Failed to fetch transfer data from server')
  }
}

// Generate Internal Money Transfer Report PDF
export const generateTransferReportPDF = async (startDate, endDate, account = 'all') => {
  if (!startDate || !endDate) {
    throw new Error('Please select date range')
  }

  // Fetch all transfer data
  const { transfers: transferData, total_amount, total_transfers } = await fetchAllTransferData(startDate, endDate, account)

  if (!transferData || transferData.length === 0) {
    throw new Error('No transfer records found for the selected date range')
  }

  const doc = new jsPDF('l', 'mm', 'a4') // Landscape orientation
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 10
  const contentWidth = pageWidth - (2 * margin)
  let yPosition = 15

  // ===== HEADER SECTION =====
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(41, 128, 185)
  doc.text('INTERNAL MONEY TRANSFER LOG', pageWidth / 2, yPosition, { align: 'center' })
  
  yPosition += 7
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(0, 0, 0)
  doc.text(`Period: ${formatDate(startDate)} to ${formatDate(endDate)}`, pageWidth / 2, yPosition, { align: 'center' })
  
  if (account !== 'all') {
    yPosition += 5
    doc.text(`Account Filter: ${account}`, pageWidth / 2, yPosition, { align: 'center' })
  }
  
  yPosition += 5
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  doc.text(`Generated on: ${formatDate(new Date())}`, pageWidth / 2, yPosition, { align: 'center' })
  
  yPosition += 8

  // ===== TRANSFERS TABLE =====
  if (yPosition > pageHeight - 100) {
    doc.addPage()
    yPosition = 15
  }

  doc.setFillColor(52, 152, 219)
  doc.setDrawColor(41, 128, 185)
  doc.setLineWidth(0.2)
  doc.rect(margin, yPosition, contentWidth, 8, 'FD')
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('TRANSFER DETAILS', margin + 2, yPosition + 5.5)
  
  yPosition += 10
  doc.setTextColor(0, 0, 0)

  // Prepare table data with project name
  const tableData = transferData.map((transfer) => [
    formatDate(transfer.transfer_date),
    transfer.project?.project_name || '-',
    transfer.from_account || 'N/A',
    transfer.to_account || 'N/A',
    formatCurrency(parseFloat(transfer.amount || 0)),
    transfer.reference_number || 'N/A',
    transfer.description || 'N/A'
  ])

  // Calculate totals for footer
  const totalTransferred = transferData.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0)

  doc.autoTable({
    startY: yPosition,
    head: [['Transfer Date', 'Project', 'From Account', 'To Account', 'Amount (Rs)', 'Reference Number', 'Description']],
    body: tableData,
    foot: [[
      `Total Records: ${total_transfers}`,
      '',
      '',
      '',
      formatCurrency(totalTransferred),
      '',
      ''
    ]],
    theme: 'striped',
    styles: { 
      fontSize: 7, 
      cellPadding: 2.5,
      overflow: 'linebreak',
      halign: 'left',
      valign: 'middle',
      lineColor: [200, 200, 200],
      lineWidth: 0.1
    },
    headStyles: { 
      fillColor: [46, 204, 113], 
      textColor: 255, 
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 7
    },
    footStyles: {
      fillColor: [236, 240, 241],
      textColor: [52, 73, 94],
      fontStyle: 'bold',
      halign: 'left',
      fontSize: 7
    },
    columnStyles: {
      0: { cellWidth: 25, halign: 'center' },
      1: { cellWidth: 35, halign: 'left' },
      2: { cellWidth: 40, halign: 'left' },
      3: { cellWidth: 40, halign: 'left' },
      4: { cellWidth: 30, halign: 'right' },
      5: { cellWidth: 30, halign: 'left' },
      6: { cellWidth: 67, halign: 'left' }
    },
    margin: { left: margin, right: margin },
    didDrawPage: function(data) {
      // Page number
      doc.setFontSize(7)
      doc.setTextColor(128, 128, 128)
      doc.text(
        `Page ${doc.internal.getCurrentPageInfo().pageNumber}`,
        pageWidth - margin - 15,
        pageHeight - 5
      )
    }
  })

  yPosition = doc.lastAutoTable.finalY + 6

  // ===== SUMMARY BY PROJECT (if projects exist) =====
  const projectSummary = {}
  let hasProjects = false
  
  transferData.forEach(transfer => {
    if (transfer.project_id && transfer.project) {
      hasProjects = true
      const projectName = transfer.project.project_name
      if (!projectSummary[projectName]) {
        projectSummary[projectName] = {
          count: 0,
          total: 0
        }
      }
      projectSummary[projectName].count++
      projectSummary[projectName].total += parseFloat(transfer.amount)
    }
  })

  if (hasProjects && Object.keys(projectSummary).length > 0) {
    // Check if we need a new page
    if (yPosition > pageHeight - 60) {
      doc.addPage()
      yPosition = 15
    } else {
      yPosition += 5
    }

    doc.setFillColor(149, 165, 166)
    doc.setDrawColor(127, 140, 141)
    doc.setLineWidth(0.2)
    doc.rect(margin, yPosition, contentWidth, 8, 'FD')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('PROJECT-WISE SUMMARY', margin + 2, yPosition + 5.5)
    
    yPosition += 10

    const projectTableData = Object.entries(projectSummary).map(([projectName, data]) => [
      projectName,
      data.count.toString(),
      formatCurrency(data.total)
    ])

    doc.autoTable({
      startY: yPosition,
      head: [['Project Name', 'Transfer Count', 'Total Amount (Rs)']],
      body: projectTableData,
      theme: 'striped',
      styles: { 
        fontSize: 8, 
        cellPadding: 3,
        overflow: 'linebreak',
        halign: 'left',
        valign: 'middle',
        lineColor: [200, 200, 200],
        lineWidth: 0.1
      },
      headStyles: { 
        fillColor: [52, 152, 219], 
        textColor: 255, 
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 8
      },
      columnStyles: {
        0: { cellWidth: 'auto', halign: 'left' },
        1: { cellWidth: 40, halign: 'center' },
        2: { cellWidth: 50, halign: 'right' }
      },
      margin: { left: margin, right: margin }
    })

    yPosition = doc.lastAutoTable.finalY + 6
  }

  // ===== GRAND TOTAL SECTION =====
  if (yPosition > pageHeight - 30) {
    doc.addPage()
    yPosition = 15
  } else {
    yPosition += 5
  }

  doc.setFillColor(41, 128, 185)
  doc.setDrawColor(52, 73, 94)
  doc.setLineWidth(0.5)
  doc.rect(margin, yPosition, contentWidth, 12, 'FD')
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('GRAND TOTAL TRANSFERRED AMOUNT:', margin + 3, yPosition + 8)
  doc.setFontSize(12)
  doc.text(formatCurrency(total_amount), pageWidth - margin - 3, yPosition + 8, { align: 'right' })
  
  doc.setTextColor(0, 0, 0)

  // ===== FOOTER ON ALL PAGES =====
  const totalPages = doc.internal.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(128, 128, 128)
    
    doc.text(
      `Internal Money Transfer Log | Period: ${formatDate(startDate)} to ${formatDate(endDate)} | Generated: ${formatDate(new Date())}`,
      pageWidth / 2,
      pageHeight - 5,
      { align: 'center' }
    )
  }

  // ===== SAVE PDF =====
  const timestamp = new Date().toISOString().split('T')[0]
  const startFormatted = formatDate(startDate).replace(/\s/g, '_')
  const endFormatted = formatDate(endDate).replace(/\s/g, '_')
  let fileName = `Internal_Transfer_Log_${startFormatted}_to_${endFormatted}.pdf`
  if (account !== 'all') {
    fileName = `Internal_Transfer_Log_${account.replace(/\s/g, '_')}_${startFormatted}_to_${endFormatted}.pdf`
  }
  doc.save(fileName)
}