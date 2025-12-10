// import jsPDF from 'jspdf'
// import 'jspdf-autotable'
// import { getAPICall } from '../../../util/api'

// // Helper function to format numbers in Indian numeric system
// const formatIndianNumber = (number) => {
//   return new Intl.NumberFormat('en-IN', { 
//     minimumFractionDigits: 2, 
//     maximumFractionDigits: 2 
//   }).format(number)
// }

// // Helper function to format currency (Rs instead of ₹ for better PDF compatibility)
// const formatCurrency = (amount) => {
//   return `Rs ${formatIndianNumber(amount)}`
// }

// // Helper function to format date
// const formatDate = (date) => {
//   if (!date) return 'N/A'
//   return new Date(date).toLocaleDateString('en-IN', {
//     day: '2-digit',
//     month: 'short',
//     year: 'numeric'
//   })
// }

// // Fetch proforma invoices with income details
// const fetchProformaInvoicesWithIncomes = async (workOrderId) => {
//   try {
//     const response = await getAPICall(`/api/proforma-invoices?work_order_id=${workOrderId}`)
//     if (response && response.success && response.data) {
//       const invoices = response.data.data || response.data
//       return Array.isArray(invoices) ? invoices : []
//     }
//     return []
//   } catch (error) {
//     console.error('Error fetching proforma invoices:', error)
//     return []
//   }
// }





// // Generate PDF for selected work orders
// export const generateWorkOrdersPDF = async (selectedOrders) => {
//   if (!selectedOrders || selectedOrders.length === 0) {
//     throw new Error('No work orders selected')
//   }

//   const doc = new jsPDF('p', 'mm', 'a4')
//   const pageWidth = doc.internal.pageSize.getWidth()
//   const pageHeight = doc.internal.pageSize.getHeight()
//   const margin = 15
//   const contentWidth = pageWidth - (2 * margin)
//   let yPosition = 20

//   // Main Title
//   doc.setFontSize(18)
//   doc.setFont('helvetica', 'bold')
//   doc.text('Work Order Details Report', pageWidth / 2, yPosition, { align: 'center' })
  
//   yPosition += 10
//   doc.setFontSize(10)
//   doc.setFont('helvetica', 'normal')
//   doc.text(`Generated on: ${formatDate(new Date())}`, pageWidth / 2, yPosition, { align: 'center' })
//   doc.text(`Total Work Orders: ${selectedOrders.length}`, pageWidth / 2, yPosition + 5, { align: 'center' })
  
//   yPosition += 15

//   // Process each work order
//   for (let i = 0; i < selectedOrders.length; i++) {
//     const order = selectedOrders[i]
    
//     // Each work order starts on a new page (except the first one)
//     if (i > 0) {
//       doc.addPage()
//       yPosition = 20
//     }

//     // Work Order Header Section
//     doc.setFillColor(41, 128, 185)
//     doc.rect(margin, yPosition, contentWidth, 10, 'F')
    
//     doc.setTextColor(255, 255, 255)
//     doc.setFontSize(12)
//     doc.setFont('helvetica', 'bold')
//     doc.text(`Work Order ${order.invoice_number || order.id}`, margin + 5, yPosition + 7)
    
//     yPosition += 15
//     doc.setTextColor(0, 0, 0)

//     // PROJECT DETAILS SECTION BOX (2 columns)
//     if (order.project) {
//       const boxStartY = yPosition
      
//       doc.setFont('helvetica', 'bold')
//       doc.setFontSize(10)
//       doc.text('Project Information:', margin + 2, yPosition + 4)
//       yPosition += 8

//       const projectDetails = [
//         ['Project Name', order.project.project_name || 'N/A', 'Customer Name', order.project.customer_name || 'N/A'],
//         ['Mobile Number', order.project.mobile_number || 'N/A', 'Work Place', order.project.work_place || 'N/A'],
//         ['Start Date', formatDate(order.project.start_date), 'End Date', formatDate(order.project.end_date)],
//         ['Project Cost', formatCurrency(order.project.project_cost || 0), '', ''],
//       ]

//       doc.autoTable({
//         startY: yPosition,
//         head: [],
//         body: projectDetails,
//         theme: 'grid',
//         styles: { 
//           fontSize: 9, 
//           cellPadding: 3,
//           overflow: 'linebreak'
//         },
//         columnStyles: {
//           0: { 
//             fontStyle: 'bold', 
//             cellWidth: 40,
//             halign: 'left'
//           },
//           1: { 
//             cellWidth: 45,
//             halign: 'left'
//           },
//           2: { 
//             fontStyle: 'bold', 
//             cellWidth: 40,
//             halign: 'left'
//           },
//           3: { 
//             cellWidth: 45,
//             halign: 'left'
//           }
//         },
//         margin: { left: margin, right: margin }
//       })

//       yPosition = doc.lastAutoTable.finalY
      
//       // Draw box around project details
//       doc.setDrawColor(100, 100, 100)
//       doc.setLineWidth(0.5)
//       doc.rect(margin, boxStartY, contentWidth, yPosition - boxStartY)
      
//       yPosition += 10
//     }

//     // WORK ORDER DETAILS SECTION BOX (2 columns)
//     // Check if we need a new page
//     if (yPosition > pageHeight - 80) {
//       doc.addPage()
//       yPosition = 20
//     }

//     const woBoxStartY = yPosition

//     doc.setFont('helvetica', 'bold')
//     doc.setFontSize(10)
//     doc.text('Work Order Information:', margin + 2, yPosition + 4)
//     yPosition += 8

//     const workOrderDetails = [
//       ['Invoice Number', order.invoice_number || `ORD-${order.id}`, 'Invoice Date', formatDate(order.invoiceDate)],
//       ['Status', order.invoiceType === 2 ? 'Work Order' : order.invoiceType === 1 ? 'Quotation' : 'Other', 'Total Amount', formatCurrency(order.finalAmount || order.totalAmount || 0)],
//       ['Paid Amount', formatCurrency(order.paidAmount || 0), 'Pending Amount', formatCurrency((order.finalAmount || order.totalAmount || 0) - (order.paidAmount || 0))],
//     ]

//     doc.autoTable({
//       startY: yPosition,
//       head: [],
//       body: workOrderDetails,
//       theme: 'grid',
//       styles: { 
//         fontSize: 9, 
//         cellPadding: 3,
//         overflow: 'linebreak'
//       },
//       columnStyles: {
//         0: { 
//           fontStyle: 'bold', 
//           cellWidth: 40,
//           halign: 'left'
//         },
//         1: { 
//           cellWidth: 45,
//           halign: 'left'
//         },
//         2: { 
//           fontStyle: 'bold', 
//           cellWidth: 40,
//           halign: 'left'
//         },
//         3: { 
//           cellWidth: 45,
//           halign: 'left'
//         }
//       },
//       margin: { left: margin, right: margin }
//     })

//     yPosition = doc.lastAutoTable.finalY
    
//     // Draw box around work order details
//     doc.setDrawColor(100, 100, 100)
//     doc.setLineWidth(0.5)
//     doc.rect(margin, woBoxStartY, contentWidth, yPosition - woBoxStartY)
    
//     yPosition += 10

//     // PROFORMA INVOICES SECTION (Each PI with its transactions in a box)
//     const proformaInvoices = await fetchProformaInvoicesWithIncomes(order.id)
    
//     if (proformaInvoices && proformaInvoices.length > 0) {
//       // Process each Proforma Invoice separately
//       for (let j = 0; j < proformaInvoices.length; j++) {
//         const pi = proformaInvoices[j]
        
//         // Check if we need a new page
//         if (yPosition > pageHeight - 100) {
//           doc.addPage()
//           yPosition = 20
//         }

//         const piBoxStartY = yPosition

//         // Proforma Invoice Header
//         doc.setFont('helvetica', 'bold')
//         doc.setFontSize(10)
//         doc.text(`Proforma Invoice: ${pi.proforma_invoice_number || 'N/A'}`, margin + 2, yPosition + 4)
//         yPosition += 8

//         // Proforma Invoice Details
//         const piDetails = [
//           ['PI Number', pi.proforma_invoice_number || 'N/A', 'Invoice Date', formatDate(pi.invoice_date)],
//           ['Final Amount', formatCurrency(pi.final_amount || 0), 'Paid Amount', formatCurrency(pi.paid_amount || 0)],
//           ['Pending Amount', formatCurrency(pi.pending_amount || 0), 'Payment Status', (pi.payment_status?.toUpperCase() || 'PENDING')],
//         ]

//         doc.autoTable({
//           startY: yPosition,
//           head: [],
//           body: piDetails,
//           theme: 'grid',
//           styles: { 
//             fontSize: 9, 
//             cellPadding: 3,
//             overflow: 'linebreak'
//           },
//           columnStyles: {
//             0: { 
//               fontStyle: 'bold', 
//               cellWidth: 40,
//               halign: 'left'
//             },
//             1: { 
//               cellWidth: 45,
//               halign: 'left'
//             },
//             2: { 
//               fontStyle: 'bold', 
//               cellWidth: 40,
//               halign: 'left'
//             },
//             3: { 
//               cellWidth: 45,
//               halign: 'left'
//             }
//           },
//           margin: { left: margin, right: margin }
//         })

//         yPosition = doc.lastAutoTable.finalY + 6

//         // Payment History for this Proforma Invoice
//         if (pi.incomes && pi.incomes.length > 0) {
//           doc.setFont('helvetica', 'bold')
//           doc.setFontSize(9)
//           doc.text('Payment History:', margin + 2, yPosition)
//           yPosition += 5

//           const transactionData = pi.incomes.map(income => [
//             formatDate(income.invoice_date),
//             formatCurrency(income.received_amount || 0),
//             (income.payment_type?.toUpperCase() || 'N/A'),
//             income.received_by || 'N/A',
//             income.senders_bank || 'N/A',
//             income.receivers_bank || 'N/A',
//             income.remark || 'N/A'
//           ])

//           doc.autoTable({
//             startY: yPosition,
//             head: [['Date', 'Amount', 'Type', 'Received By', 'Sender Bank', 'Receiver Bank', 'Transaction ID']],
//             body: transactionData,
//             theme: 'grid',
//             styles: { 
//               fontSize: 7, 
//               cellPadding: 2,
//               overflow: 'linebreak',
//               halign: 'left'
//             },
//             headStyles: { 
//               fillColor: [46, 204, 113], 
//               textColor: 255, 
//               fontStyle: 'bold',
//               halign: 'center'
//             },
//             columnStyles: {
//               0: { cellWidth: 22 },
//               1: { cellWidth: 25, halign: 'right' },
//               2: { cellWidth: 18 },
//               3: { cellWidth: 25 },
//               4: { cellWidth: 26 },
//               5: { cellWidth: 26 },
//               6: { cellWidth: 28 }
//             },
//             margin: { left: margin, right: margin }
//           })

//           yPosition = doc.lastAutoTable.finalY
//         } else {
//           doc.setFont('helvetica', 'italic')
//           doc.setFontSize(8)
//           doc.text('No payment transactions found for this proforma invoice.', margin + 2, yPosition)
//           yPosition += 5
//         }

//         // Draw box around this proforma invoice section
//         doc.setDrawColor(100, 100, 100)
//         doc.setLineWidth(0.5)
//         doc.rect(margin, piBoxStartY, contentWidth, yPosition - piBoxStartY)
        
//         yPosition += 10
//       }
//     } else {
//       doc.setFont('helvetica', 'italic')
//       doc.setFontSize(9)
//       doc.text('No proforma invoices found for this work order.', margin, yPosition)
//       yPosition += 8
//     }
//   }

//   // Add footer to all pages
//   const totalPages = doc.internal.getNumberOfPages()
//   for (let i = 1; i <= totalPages; i++) {
//     doc.setPage(i)
//     doc.setFontSize(8)
//     doc.setFont('helvetica', 'normal')
//     doc.setTextColor(128, 128, 128)
//     doc.text(
//       `Page ${i} of ${totalPages}`,
//       pageWidth / 2,
//       pageHeight - 10,
//       { align: 'center' }
//     )
//   }

//   // Save the PDF
//   const timestamp = new Date().toISOString().split('T')[0]
//   doc.save(`WorkOrders_Report_${timestamp}.pdf`)
// }




import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { getAPICall } from '../../../util/api'
import { getUserData } from '../../../util/session'

// === Helper Functions ===
const formatIndianNumber = (number) => {
  const num = parseFloat(number) || 0
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)
}

const formatCurrency = (amount) => {
  const num = parseFloat(amount) || 0
  return  formatIndianNumber(num)
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}



// === DOWNLOAD LOGO AS BASE64 ===
const fetchImageAsBase64 = async (url) => {
  try {
    const res = await fetch(url)
    if (!res.ok) {
      console.error("Image not found:", url)
      return null
    }

    const blob = await res.blob()
    return await new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.readAsDataURL(blob)
    })

  } catch (err) {
    console.error("Logo conversion failed:", err)
    return null
  }
}



// Fetch Proforma Invoices
const fetchProformaInvoicesWithIncomes = async (workOrderId) => {
  try {
    const response = await getAPICall(`/api/proforma-invoices?work_order_id=${workOrderId}`)
    if (response && response.success && response.data) {
      const invoices = response.data.data || response.data
      return Array.isArray(invoices) ? invoices : []
    }
    return []
  } catch (error) {
    console.error('Error fetching proforma invoices:', error)
    return []
  }
}




//  const user = getUserData();
//  console.log(user);
 

// === Main PDF Generator ===
export const generateWorkOrdersPDF = async (selectedOrders) => {
  if (!selectedOrders || selectedOrders.length === 0) {
    throw new Error('No work orders selected')
  }

  const doc = new jsPDF('p', 'mm', 'a4')
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 10
  const contentWidth = pageWidth - 2 * margin

  // Company Info
  // const company = {
  //   name: user.company_name || 'NA',
  //   address: user.land_mark || 'NA',
  //   phone: user.phone_no || 'NA',
  //   email: user.email_id || 'NA',
  //   website: user.website || 'NA',
  //   logo: user.logo || 'NA',
  //   gstin: user.gstin || 'NA',
  // }

  // console.log(company);


  const user = getUserData();
console.log(user);

const companyInfo = user.company_info || {};

// Company Info
const company = {
  name: companyInfo.company_name || 'NA',
  address: companyInfo.land_mark || 'NA',
  phone: companyInfo.phone_no || 'NA',
  email: companyInfo.email_id || 'NA',
  website: companyInfo.website || 'NA',
  logo: companyInfo.logo || 'NA',
  gstin: companyInfo.gst_number || 'NA',
};

console.log(company.logo);
  


      // === FIX LOGO URL ===
  let finalLogoURL = null
  let logoBase64 = null

  if (company.logo && company.logo !== "NA") {

    // Convert "invoice/xyz.png" → "/img/invoice/xyz.png"
    if (company.logo.startsWith("invoice/")) {
      finalLogoURL = `http://localhost:8000/img/${company.logo}`
    }

    // If full URL
    else if (company.logo.startsWith("http")) {
      finalLogoURL = company.logo
    }

    // Relative URL fallback
    else {
      finalLogoURL = `http://localhost:8000/${company.logo}`
    }

    console.log("Final resolved logo URL:", finalLogoURL)
    logoBase64 = await fetchImageAsBase64(finalLogoURL)
  }



  // Loop through each Work Order
  for (let i = 0; i < selectedOrders.length; i++) {
    const order = selectedOrders[i]
    
    if (i > 0) {
      doc.addPage()
    }

    // === FULL PAGE BORDER ===
    doc.setDrawColor(0, 0, 0)
    doc.setLineWidth(1)
    doc.rect(margin, margin, contentWidth, pageHeight - 2 * margin)

    let yPos = margin + 8

    // === HEADER SECTION (Inside Border) ===
    // Company Name (Bold, Large)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    doc.setTextColor(0, 0, 0)
    doc.text(company.name, margin + 5, yPos)

    // Logo (if available) - top right
    // if (company.logo) {
    //   try {
    //     // Check if logo is base64 or URL
    //     if (typeof company.logo === 'string') {
    //       const logoFormat = company.logo.includes('data:image/png') ? 'PNG' : 
    //                        company.logo.includes('data:image/jpeg') || company.logo.includes('data:image/jpg') ? 'JPEG' : 'PNG'
    //       doc.addImage(company.logo, logoFormat, pageWidth - margin - 30, margin + 3, 25, 25)
    //     }
    //   } catch (e) {
    //     console.warn("Logo not added:", e)
    //   }
    // }

     // === Insert logo ===
    if (logoBase64) {
      try {
        doc.addImage(logoBase64, "PNG", pageWidth - margin - 25, margin + 3, 20, 20)
      } catch (err) {
        console.warn("LOGO FAILED:", err)
      }
    } else {
      console.warn("Logo not loaded.")
    }

    yPos += 6
    
    // Company Address
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.text(company.address, margin + 5, yPos)
    yPos += 4
    
    // Phone
    doc.text(`Phone: ${company.phone}`, margin + 5, yPos)
    yPos += 6

    // Horizontal line below header
    doc.setLineWidth(0.5)
    doc.setDrawColor(0, 0, 0)
    doc.line(margin + 3, yPos, pageWidth - margin - 3, yPos)
    yPos += 6

    // === TITLE BAR (Blue Background) with Border ===
    doc.setDrawColor(0, 0, 0)
    doc.setLineWidth(0.5)
    doc.setFillColor(173, 216, 230)
    doc.rect(margin + 3, yPos, contentWidth - 6, 12, 'FD')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text('Work Order Details Report', pageWidth / 2, yPos + 5.5, { align: 'center' })
    
    // Generated on and Total Work Orders
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.text(`Generated on: ${formatDate(new Date())} | Total Work Orders: ${selectedOrders.length}`, pageWidth / 2, yPos + 9.5, { align: 'center' })
    
    yPos += 15

    // === THREE COLUMN SECTION ===
    const colWidth = (contentWidth - 14) / 3
    const col1X = margin + 7
    const col2X = col1X + colWidth + 3
    const col3X = col2X + colWidth + 3
    const sectionStartY = yPos
    const sectionHeight = 48

    // Draw section box
    doc.setLineWidth(0.3)
    doc.setDrawColor(100, 100, 100)
    doc.rect(margin + 3, sectionStartY, contentWidth - 6, sectionHeight)
    
    // Vertical lines
    doc.line(col2X - 1.5, sectionStartY, col2X - 1.5, sectionStartY + sectionHeight)
    doc.line(col3X - 1.5, sectionStartY, col3X - 1.5, sectionStartY + sectionHeight)
    
    // Horizontal line under headers
    doc.line(margin + 3, sectionStartY + 8, pageWidth - margin - 3, sectionStartY + 8)

    // Column Headers with Blue Background
    doc.setFillColor(173, 216, 230)
    doc.rect(margin + 3, sectionStartY, col2X - 1.5 - (margin + 3), 8, 'F')
    doc.rect(col2X - 1.5, sectionStartY, col3X - 1.5 - (col2X - 1.5), 8, 'F')
    doc.rect(col3X - 1.5, sectionStartY, (pageWidth - margin - 3) - (col3X - 1.5), 8, 'F')
    
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(0, 0, 0)
    doc.text('FROM :', col1X, sectionStartY + 5.5)
    doc.text('TO :', col2X, sectionStartY + 5.5)
    doc.text('DETAILS :', col3X, sectionStartY + 5.5)

    let contentY = sectionStartY + 12

    // FROM Column - Company Details
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    doc.text(company.name, col1X, contentY)
    contentY += 4
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.text('Tata', col1X, contentY)
    contentY += 3.5
    const addressLines = doc.splitTextToSize(company.address, colWidth - 4)
    doc.text(addressLines, col1X, contentY)
    contentY += addressLines.length * 3.2
    doc.text(`Phone: ${company.phone}`, col1X, contentY)
    contentY += 3.2
    doc.text(`Email: ${company.email}`, col1X, contentY)
    contentY += 3.2
    doc.text(`GSTIN: ${company.gstin}`, col1X, contentY)
    contentY += 3.2
    doc.text(`UId: Retail`, col1X, contentY)

    // TO Column - Project Information
    let toYPos = sectionStartY + 12
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    const projectName = order.project?.project_name || 'N/A'
    const projNameLines = doc.splitTextToSize(`Project Name: ${projectName}`, colWidth - 4)
    doc.text(projNameLines, col2X, toYPos)
    toYPos += projNameLines.length * 3.5
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    
    const customerName = order.project?.customer_name || 'N/A'
    const custLines = doc.splitTextToSize(`Customer: ${customerName}`, colWidth - 4)
    doc.text(custLines, col2X, toYPos)
    toYPos += custLines.length * 3.2
    
    const siteLine = order.project?.work_place || 'N/A'
    const siteLines = doc.splitTextToSize(`Site: ${siteLine}`, colWidth - 4)
    doc.text(siteLines, col2X, toYPos)
    toYPos += siteLines.length * 3.2
    
    doc.text(`Phone: ${order.project?.mobile_number || 'N/A'}`, col2X, toYPos)
    toYPos += 3.2
    doc.text(`Start Date: ${formatDate(order.project?.start_date)}`, col2X, toYPos)
    toYPos += 3.2
    doc.text(`End Date: ${formatDate(order.project?.end_date)}`, col2X, toYPos)
    toYPos += 3.2
    doc.text(`GSTIN: N/A`, col2X, toYPos)
    toYPos += 3.2
    doc.text(`PAN: -`, col2X, toYPos)

    // DETAILS Column - Invoice Information
    let detailsYPos = sectionStartY + 12
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.text(`Invoice No: ${order.invoice_number || 'N/A'}`, col3X, detailsYPos)
    detailsYPos += 3.2
    doc.text(`Invoice Date: ${formatDate(order.invoiceDate)}`, col3X, detailsYPos)
    detailsYPos += 3.2
    doc.text(`Work Order ID: D-${order.id || 'N/A'}`, col3X, detailsYPos)
    detailsYPos += 3.2
    
    // Fetch and show PI numbers
    const proformaInvoices = await fetchProformaInvoicesWithIncomes(order.id)
    if (proformaInvoices.length > 0) {
      const piNumbers = proformaInvoices.map(pi => pi.proforma_invoice_number).join(', ')
      const piLines = doc.splitTextToSize(`PI Numbers: ${piNumbers}`, colWidth - 4)
      doc.text(piLines, col3X, detailsYPos)
      detailsYPos += piLines.length * 3.2
    } else {
      doc.text(`PI Numbers: N/A`, col3X, detailsYPos)
      detailsYPos += 3.2
    }

    yPos = sectionStartY + sectionHeight + 6

    // === WORK ORDER INFORMATION SECTION ===
    // Section Title
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(0, 0, 0)
    const tableStartX = margin + 3
    doc.text('Work Order Information:', tableStartX + 4, yPos)
    yPos += 6

    // === WORK ORDER SUMMARY TABLE ===
    const totalAmt = order.finalAmount || order.totalAmount || 0
    const paidAmt = order.paidAmount || 0
    const pendingAmt = totalAmt - paidAmt

    // Calculate table width to match three-column section
    const tableWidth = contentWidth - 6

    doc.autoTable({
      startY: yPos,
      head: [['Status', 'Total Amount', 'Paid Amount', 'Pending Amount']],
      body: [[
        order.invoiceType === 2 ? 'Work Order' : 'Quotation',
        formatCurrency(totalAmt),
        formatCurrency(paidAmt),
        formatCurrency(pendingAmt)
      ]],
      theme: 'grid',
      headStyles: {
        fillColor: [173, 216, 230],
        textColor: 0,
        fontStyle: 'bold',
        fontSize: 9,
        halign: 'center',
        lineWidth: 0.3,
        lineColor: [100, 100, 100],
      },
      bodyStyles: {
        fontSize: 9,
        halign: 'center',
        lineWidth: 0.3,
        lineColor: [100, 100, 100],
        cellPadding: 4,
      },
      columnStyles: {
        0: { cellWidth: tableWidth / 4, halign: 'center' },
        1: { cellWidth: tableWidth / 4, halign: 'right' },
        2: { cellWidth: tableWidth / 4, halign: 'right' },
        3: { cellWidth: tableWidth / 4, halign: 'right' },
      },
      margin: { left: tableStartX, right: margin + 3 },
      tableWidth: tableWidth,
    })

    yPos = doc.lastAutoTable.finalY + 8

    // === PROFORMA INVOICES DETAILS ===
    if (proformaInvoices.length > 0) {
      // Section Title
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.setTextColor(0, 0, 0)
      doc.text('Proforma Invoice Details:', tableStartX + 4, yPos)
      yPos += 6

      const piTableData = proformaInvoices.map(pi => [
        pi.proforma_invoice_number || 'N/A',
        formatDate(pi.invoice_date),
        formatCurrency(pi.final_amount || 0),
        formatCurrency(pi.paid_amount || 0),
        formatCurrency(pi.pending_amount || 0),
        (pi.payment_status || 'Pending').toUpperCase()
      ])

      doc.autoTable({
        startY: yPos,
        head: [['PI Number', 'Invoice Date', 'Final Amount', 'Paid Amount', 'Pending Amount', 'Payment Status']],
        body: piTableData,
        theme: 'grid',
        headStyles: {
          fillColor: [173, 216, 230],
          textColor: 0,
          fontStyle: 'bold',
          fontSize: 9,
          halign: 'center',
          lineWidth: 0.3,
          lineColor: [100, 100, 100],
        },
        bodyStyles: {
          fontSize: 9,
          lineWidth: 0.3,
          lineColor: [100, 100, 100],
          cellPadding: 4,
        },
        columnStyles: {
          0: { cellWidth: tableWidth / 6, halign: 'center' },
          1: { cellWidth: tableWidth / 6, halign: 'center' },
          2: { cellWidth: tableWidth / 6, halign: 'right' },
          3: { cellWidth: tableWidth / 6, halign: 'right' },
          4: { cellWidth: tableWidth / 6, halign: 'right' },
          5: { cellWidth: tableWidth / 6, halign: 'center' },
        },
        margin: { left: tableStartX, right: margin + 3 },
        tableWidth: tableWidth,
      })

      yPos = doc.lastAutoTable.finalY + 8

      // === PAYMENT HISTORY ===
      proformaInvoices.forEach((pi, piIndex) => {
        if (pi.incomes && pi.incomes.length > 0) {
          // Check if need new page
          if (yPos > pageHeight - 70) {
            doc.addPage()
            // Draw border on new page
            doc.setDrawColor(0, 0, 0)
            doc.setLineWidth(1)
            doc.rect(margin, margin, contentWidth, pageHeight - 2 * margin)
            yPos = margin + 15
          }

          doc.setFont('helvetica', 'bold')
          doc.setFontSize(10)
          doc.setTextColor(0, 0, 0)
          doc.text(`Payment History - ${pi.proforma_invoice_number}:`, tableStartX + 4, yPos)
          yPos += 6

          const paymentRows = pi.incomes.map(inc => [
            formatDate(inc.invoice_date),
            formatCurrency(inc.received_amount || 0),
            (inc.payment_type || 'N/A').toUpperCase(),
            inc.received_by || 'N/A',
            inc.senders_bank || '-',
            inc.receivers_bank || '-',
            inc.remark || '-',
          ])

          doc.autoTable({
            startY: yPos,
            head: [['Date', 'Amount', 'Payment Type', 'Received By', 'From Bank', 'To Bank', 'Remark']],
            body: paymentRows,
            theme: 'grid',
            headStyles: {
              fillColor: [46, 204, 113],
              textColor: 255,
              fontSize: 8,
              halign: 'center',
              lineWidth: 0.3,
              lineColor: [100, 100, 100],
            },
            bodyStyles: {
              fontSize: 8,
              lineWidth: 0.3,
              lineColor: [100, 100, 100],
              cellPadding: 3,
            },
            columnStyles: {
              0: { cellWidth: tableWidth / 7, halign: 'center' },
              1: { cellWidth: tableWidth / 7, halign: 'right' },
              2: { cellWidth: tableWidth / 7, halign: 'center' },
              3: { cellWidth: tableWidth / 7, halign: 'center' },
              4: { cellWidth: tableWidth / 7, halign: 'center' },
              5: { cellWidth: tableWidth / 7, halign: 'center' },
              6: { cellWidth: tableWidth / 7, halign: 'center' },
            },
            margin: { left: tableStartX, right: margin + 3 },
            tableWidth: tableWidth,
          })

          yPos = doc.lastAutoTable.finalY + 8
        }
      })
    } else {
      doc.setFont('helvetica', 'italic')
      doc.setFontSize(9)
      doc.setTextColor(80, 80, 80)
      doc.text('No proforma invoices found for this work order.', tableStartX + 4, yPos)
    }

    // === FOOTER ===
    const footerY = pageHeight - margin - 10
    
    // Authorized Signature
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(0, 0, 0)
    // doc.text('Authorized Signature', pageWidth - margin - 45, footerY - 5)

    // Horizontal line above footer
    doc.setLineWidth(0.3)
    doc.setDrawColor(150, 150, 150)
    doc.line(margin + 5, footerY, pageWidth - margin - 5, footerY)

    // Computer generated note
    doc.setFontSize(7)
    doc.setFont('helvetica', 'italic')
    doc.text('This is a computer generated work order.', pageWidth / 2, footerY + 4, { align: 'center' })

    // Contact info footer
    doc.setFontSize(8)
    // doc.setFont('helvetica', 'normal')
    // doc.text(`📧 ${company.email}`, margin + 15, footerY + 8)
    // doc.text(`🌐 ${company.website}`, pageWidth - margin - 70, footerY + 8)
  }

  // Save PDF
  const timestamp = new Date().toISOString().slice(0, 10)
  doc.save(`WorkOrders_Report_${timestamp}.pdf`)
}