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

// Fetch all income data for the given date range (filtered by payment_date)
const fetchAllIncomeData = async (startDate, endDate) => {
  try {
    const params = new URLSearchParams()
    params.append('per_page', '1000') // Get all records
    
    // The API should filter by payment_date on backend
    // For now, we fetch all and filter on frontend
    const response = await getAPICall(`/api/income?${params.toString()}`)
    
    // Handle the nested structure: response.incomes.data
    let incomes = []
    if (response && response.incomes && response.incomes.data) {
      incomes = response.incomes.data
    }
    
    // Filter by payment_date on frontend
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      
      incomes = incomes.filter(income => {
        // Use payment_date, fallback to invoice_date, then created_at
        const dateToUse = income.payment_date || income.invoice_date || income.created_at
        if (!dateToUse) return false
        
        const incomeDate = new Date(dateToUse)
        return incomeDate >= start && incomeDate <= end
      })
    }
    
    // Calculate summary
    const totalAmount = incomes.reduce((sum, inc) => sum + parseFloat(inc.billing_amount || 0), 0)
    const receivedAmount = incomes.reduce((sum, inc) => sum + parseFloat(inc.received_amount || 0), 0)
    const pendingAmount = totalAmount - receivedAmount
    
    return { 
      incomes, 
      summary: { 
        total_amount: totalAmount, 
        received_amount: receivedAmount,
        pending_amount: pendingAmount 
      } 
    }
  } catch (error) {
    console.error('Error fetching income data:', error)
    throw new Error('Failed to fetch income data from server')
  }
}

// Generate Income Report PDF for ALL projects
export const generateIncomeReportPDF = async (startDate, endDate) => {
  if (!startDate || !endDate) {
    throw new Error('Please select date range')
  }

  // Fetch all income data filtered by payment_date
  const { incomes: incomeData, summary } = await fetchAllIncomeData(startDate, endDate)

  if (!incomeData || incomeData.length === 0) {
    throw new Error('No income records found for the selected date range')
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
  doc.text('INCOME REPORT', pageWidth / 2, yPosition, { align: 'center' })
  
  yPosition += 7
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(0, 0, 0)
  doc.text(`Period: ${formatDate(startDate)} to ${formatDate(endDate)}`, pageWidth / 2, yPosition, { align: 'center' })
  
  yPosition += 5
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  doc.text(`Generated on: ${formatDate(new Date())}`, pageWidth / 2, yPosition, { align: 'center' })
  doc.text(`(Based on Payment Date)`, pageWidth / 2, yPosition + 3, { align: 'center' })
  
  yPosition += 10

  // ===== SUMMARY SECTION =====
  // Calculate all totals from actual income records
  const totalAmount = incomeData.reduce((sum, income) => 
    sum + parseFloat(income.billing_amount || 0), 0
  )
  const receivedAmount = incomeData.reduce((sum, income) => 
    sum + parseFloat(income.received_amount || 0), 0
  )
  const pendingAmount = totalAmount - receivedAmount
  const totalTransactions = incomeData.length

  doc.setFillColor(240, 248, 255)
  doc.setDrawColor(41, 128, 185)
  doc.setLineWidth(0.3)
  doc.rect(margin, yPosition, contentWidth, 18, 'FD')
  
  yPosition += 5
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(41, 128, 185)
  doc.text('SUMMARY', margin + 3, yPosition)
  
  yPosition += 6
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(0, 0, 0)
  
  const col1X = margin + 3
  const col2X = margin + 75
  const col3X = margin + 145
  const col4X = margin + 215
  
  doc.text(`Total Records: ${totalTransactions}`, col1X, yPosition)
  doc.text(`Total Billed: ${formatCurrency(totalAmount)}`, col2X, yPosition)
  doc.setTextColor(22, 160, 133)
  doc.setFont('helvetica', 'bold')
  doc.text(`Received: ${formatCurrency(receivedAmount)}`, col3X, yPosition)
  doc.setTextColor(231, 76, 60)
  doc.text(`Pending: ${formatCurrency(pendingAmount)}`, col4X, yPosition)
  
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'normal')
  
  yPosition += 18

  // ===== GROUP DATA BY PROJECT =====
  const projectMap = {}
  incomeData.forEach(income => {
    const projectId = income.project_id || 'unassigned'
    const projectName = income.project_name || 'Unassigned Project'
    
    if (!projectMap[projectId]) {
      projectMap[projectId] = {
        id: projectId,
        name: projectName,
        incomes: []
      }
    }
    projectMap[projectId].incomes.push(income)
  })

  const projects = Object.values(projectMap)

  // ===== PROJECT-WISE TABLES =====
  for (let projIdx = 0; projIdx < projects.length; projIdx++) {
    const project = projects[projIdx]
    
    // Check if we need a new page for project header
    if (yPosition > pageHeight - 60) {
      doc.addPage()
      yPosition = 15
    }

    // Project Header
    doc.setFillColor(52, 152, 219)
    doc.setDrawColor(41, 128, 185)
    doc.setLineWidth(0.2)
    doc.rect(margin, yPosition, contentWidth, 8, 'FD')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text(`Project: ${project.name}`, margin + 2, yPosition + 5.5)
    
    yPosition += 10
    doc.setTextColor(0, 0, 0)

    // Prepare table data with Payment Date column
    const tableData = project.incomes.map((income, idx) => {
      // Use payment_date, fallback to invoice_date or created_at
      const paymentDate = income.payment_date || income.invoice_date || income.created_at
      
      return [
        income.id || 'N/A',
        income.project_name || 'N/A',
        income.po_no || 'N/A',
        formatDate(income.po_date),
        income.invoice_no || 'N/A',
        formatDate(income.invoice_date),
        formatDate(paymentDate), // Payment Date column
        formatCurrency(parseFloat(income.basic_amount || 0)),
        formatCurrency(parseFloat(income.gst_amount || 0)),
        formatCurrency(parseFloat(income.billing_amount || 0)),
        formatCurrency(parseFloat(income.received_amount || 0)),
        income.received_by || 'N/A',
        (income.payment_type || 'N/A').toUpperCase(),
        income.remark || 'N/A',
        income.receivers_bank || 'N/A'
      ]
    })

    // Calculate project totals
    const projectBasicTotal = project.incomes.reduce((sum, inc) => sum + parseFloat(inc.basic_amount || 0), 0)
    const projectGstTotal = project.incomes.reduce((sum, inc) => sum + parseFloat(inc.gst_amount || 0), 0)
    const projectBillingTotal = project.incomes.reduce((sum, inc) => sum + parseFloat(inc.billing_amount || 0), 0)
    const projectReceivedTotal = project.incomes.reduce((sum, inc) => sum + parseFloat(inc.received_amount || 0), 0)

    doc.autoTable({
      startY: yPosition,
      head: [[
        'ID', 
        'Project Name', 
        'PO No', 
        'PO Date', 
        'Invoice No', 
        'Invoice Date',
        'Payment Date', // New column
        'Amount Before GST',
        'GST Amount',
        'Amount With GST',
        'Received Amount',
        'Received By',
        'Payment Type',
        'Transaction ID',
        'Received Bank'
      ]],
      body: tableData,
      foot: [[
        '',
        '',
        '',
        '',
        '',
        '',
        'Total:',
        formatCurrency(projectBasicTotal),
        formatCurrency(projectGstTotal),
        formatCurrency(projectBillingTotal),
        formatCurrency(projectReceivedTotal),
        '',
        '',
        '',
        ''
      ]],
      theme: 'striped',
      styles: { 
        fontSize: 6, 
        cellPadding: 1.5,
        overflow: 'linebreak',
        halign: 'right',
        valign: 'middle',
        lineColor: [200, 200, 200],
        lineWidth: 0.1
      },
      headStyles: { 
        fillColor: [46, 204, 113], 
        textColor: 255, 
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 6
      },
      footStyles: {
        fillColor: [236, 240, 241],
        textColor: [52, 73, 94],
        fontStyle: 'bold',
        halign: 'right',
        fontSize: 7
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 20 },
        2: { cellWidth: 15 },
        3: { cellWidth: 16 },
        4: { cellWidth: 18 },
        5: { cellWidth: 16 },
        6: { cellWidth: 16, halign: 'center' }, // Payment Date
        7: { cellWidth: 20, halign: 'right' },
        8: { cellWidth: 18, halign: 'right' },
        9: { cellWidth: 20, halign: 'right' },
        10: { cellWidth: 20, halign: 'right' },
        11: { cellWidth: 18 },
        12: { cellWidth: 16, halign: 'center' },
        13: { cellWidth: 18 },
        14: { cellWidth: 20 }
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

    // Add separator between projects
    if (projIdx < projects.length - 1) {
      if (yPosition > pageHeight - 40) {
        doc.addPage()
        yPosition = 15
      } else {
        doc.setDrawColor(200, 200, 200)
        doc.setLineWidth(0.3)
        doc.line(margin, yPosition, pageWidth - margin, yPosition)
        yPosition += 8
      }
    }
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
  doc.text('GRAND TOTAL RECEIVED AMOUNT:', margin + 3, yPosition + 8)
  doc.setFontSize(12)
  doc.text(formatCurrency(receivedAmount), pageWidth - margin - 3, yPosition + 8, { align: 'right' })
  
  doc.setTextColor(0, 0, 0)

  // ===== FOOTER ON ALL PAGES =====
  const totalPages = doc.internal.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(128, 128, 128)
    
    doc.text(
      `Income Report | Period: ${formatDate(startDate)} to ${formatDate(endDate)} | Generated: ${formatDate(new Date())}`,
      pageWidth / 2,
      pageHeight - 5,
      { align: 'center' }
    )
  }

  // ===== SAVE PDF =====
  const timestamp = new Date().toISOString().split('T')[0]
  const startFormatted = formatDate(startDate).replace(/\s/g, '_')
  const endFormatted = formatDate(endDate).replace(/\s/g, '_')
  const fileName = `Income_Report_${startFormatted}_to_${endFormatted}.pdf`
  doc.save(fileName)
}