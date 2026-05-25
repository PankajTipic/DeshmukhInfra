

// import jsPDF from 'jspdf';
// import 'jspdf-autotable';
// import { host } from '../../../util/constants';
// import { getUserData } from '../../../util/session';

// export const exportToPDF = (
//   state,
//   projects,
//   expenseTypes,
//   totalExpense,
//   sortedFilteredExpenses,
//   expenseType,
//   formatIndianNumber,
//   formatDate,
//   showToast,
//   totalCgstAmount,
//   totalSgstAmount,
//   totalIgstAmount,
//   sumQty,
//   sumBase
// ) => {
//   const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
//   const pageWidth = doc.internal.pageSize.getWidth();
//   const pageHeight = doc.internal.pageSize.getHeight();
//   const margin = 40;

//   // User & company data
//   const user = getUserData();
//   const companyInfo = user?.company_info || {};
//   const totalGst = totalCgstAmount + totalSgstAmount + totalIgstAmount;
//   const selectedProject = projects.find(p => p.id === parseInt(state.project_id));

//   // Track page numbers
//   let pageNumber = 0;
//   let headerHeight = 0;


//   // ─────────────────────────────────────────────────
//   // Function to draw header + border on current page
//   // ─────────────────────────────────────────────────
//   const drawHeaderAndBorder = (isFirstPage) => {
//     // 1. Outer border
//     doc.setDrawColor(80, 80, 80);
//     doc.setLineWidth(1);
//     doc.rect(margin, margin, pageWidth - margin * 2, pageHeight - margin * 2);

//     // 2. Logo (top-right)
//     const logoSize = 70; // pt (~25mm)
//     const logoX = pageWidth - margin - logoSize - 15;
//     const logoY = margin + 15;
//     let logoUrl = null;

//     if (companyInfo.logo && companyInfo.logo !== "invoice/empty.png") {
//       logoUrl = `${host}/img/${companyInfo.logo}`;
//     }

//     if (logoUrl) {
//       try {
//         doc.addImage(logoUrl, 'PNG', logoX, logoY, logoSize, logoSize);
//       } catch (err) {
//         console.warn("Logo failed to load:", err);
//         doc.setFillColor(220, 220, 240);
//         doc.rect(logoX, logoY, logoSize, logoSize, 'F');
//         doc.setFontSize(12);
//         doc.setTextColor(100);
//         doc.text("LOGO", logoX + 15, logoY + 40);
//       }
//     } else {
//       doc.setFillColor(220, 220, 240);
//       doc.rect(logoX, logoY, logoSize, logoSize, 'F');
//       doc.setFontSize(12);
//       doc.setTextColor(100);
//       doc.text("LOGO", logoX + 15, logoY + 40);
//     }

//     // 3. Company name & details (top-left)
//     const textX = margin + 15;
//     let textY = margin + 30;

//     doc.setFontSize(20);
//     doc.setFont(undefined, 'bold');
//     doc.setTextColor(40, 40, 60);
//     doc.text(companyInfo.company_name || "Deshmukh Infra Soft", textX, textY);

//     textY += 22;
//     doc.setFontSize(11);
//     doc.setFont(undefined, 'normal');
//     doc.setTextColor(60);

//     const details = [
//       companyInfo.land_mark || "Urali Kanchan, Pune",
//       `Phone: ${companyInfo.phone_no || "9173635656"}`,
//       `Email: ${companyInfo.email_id || "shreyas.gijare.21@gmail.com"}`,
//       `GSTIN: ${companyInfo.gst_number || "Not Available"}`,
//     ];

//     details.forEach(line => {
//       if (line && line.trim()) {
//         doc.text(line, textX, textY);
//         textY += 15;
//       }
//     });

//     // 4. Horizontal separator
//     doc.setLineWidth(1.5);
//     doc.setDrawColor(0, 0, 0);
//     doc.line(margin + 10, textY + 10, pageWidth - margin - 10, textY + 10);

//     // 5. Title
//     // doc.setFontSize(18);
//     // doc.setFont(undefined, 'bold');
//     // doc.setTextColor(0);
//     // let titleText = 'EXPENSE REPORT';
//     // // if (!isFirstPage) titleText += ' (continued)';
//     // doc.text(titleText, pageWidth / 2, textY + 35, { align: 'center' });

//     // 5. Title (ONLY on First Page)
// if (isFirstPage) {
//   doc.setFontSize(18);
//   doc.setFont(undefined, 'bold');
//   doc.setTextColor(0);

//   doc.text(
//     'EXPENSE REPORT',
//     pageWidth / 2,
//     textY + 35,
//     { align: 'center' }
//   );
// }


//     // Return content start Y (below header)
//     let contentStartY = textY + 50;

//     // Period & Generated date (ONLY on first page)
//     if (isFirstPage) {
//       doc.setFontSize(10);
//       doc.setFont(undefined, 'normal');
//       doc.setTextColor(70);

//       const startDate = state.start_date || 'All';
//       const endDate = state.end_date || 'All';
//       const generatedDate = new Date().toLocaleDateString('en-GB');

//       doc.text(`Period: ${startDate} to ${endDate}`, pageWidth / 2, textY + 55, { align: 'center' });
//       doc.text(`Generated on: ${generatedDate}`, pageWidth / 2, textY + 70, { align: 'center' });

//       contentStartY = textY + 90;
//     }

//     // Grand Total at the top (ONLY on first page)
//     if (isFirstPage) {
//       doc.setFillColor(231, 76, 60);
//       doc.setDrawColor(192, 57, 43);
//       doc.setLineWidth(2);
//       doc.rect(margin, contentStartY, pageWidth - margin * 2, 35, 'FD');

//       doc.setFontSize(10);
//       doc.setFont(undefined, 'bold');
//       doc.setTextColor(255, 255, 255);

//       const grandText = `Grand Total of Expenses : Amount: Rs ${formatIndianNumber(totalExpense)} | GST: Rs ${formatIndianNumber(totalGst)} | CGST: Rs ${formatIndianNumber(totalCgstAmount)} | SGST: Rs ${formatIndianNumber(totalSgstAmount)} | IGST: Rs ${formatIndianNumber(totalIgstAmount)}`;
//       doc.text(grandText, pageWidth / 2, contentStartY + 23, { align: 'center' });

//       contentStartY += 50;
//     }

//     return contentStartY;
//   };

//   // Draw header on first page
//   // let yPosition = drawHeaderAndBorder(true);
//   let yPosition = drawHeaderAndBorder(true);
// headerHeight = yPosition;

//   pageNumber = 1;

//   // Group expenses
//   let groupedExpenses = {};
//   if (selectedProject) {
//     groupedExpenses[selectedProject.project_name] = sortedFilteredExpenses;
//   } else {
//     sortedFilteredExpenses.forEach(exp => {
//       const projectName = exp.project?.project_name || 'No Project';
//       if (!groupedExpenses[projectName]) groupedExpenses[projectName] = [];
//       groupedExpenses[projectName].push(exp);
//     });
//   }

//   // Process each group
//   Object.keys(groupedExpenses).forEach((projectName) => {
//     const projectExpenses = groupedExpenses[projectName];

//     // Project header
//     doc.setFillColor(41, 128, 185);
//     doc.rect(margin, yPosition, pageWidth - margin * 2, 25, 'F');
//     doc.setFontSize(12);
//     doc.setFont(undefined, 'bold');
//     doc.setTextColor(255, 255, 255);
//     doc.text(`Project: ${projectName}`, margin + 15, yPosition + 18);

//     yPosition += 35;

//     // Table
//     const tableColumn = [
//       'Sr', 'Date', 'Expense Type', 'Party Name', 'Party GST', 'Party Address',
//       'Category', 'Qty', 'Price',
//       'Base Amount', 'GST Rs', 'CGST Rs', 'SGST Rs', 'IGST Rs',
//       'Total', 'Payment By', 'Payment Type', 'Contact', 'Bank',
//       'Account', 'IFSC', 'Txn ID', 'About'
//     ];

//     const tableRows = projectExpenses.map((exp, i) => [
//       i + 1,
//       formatDate(exp.expense_date),
//       exp.expense_type?.name || expenseType[exp.expense_id] || '-',
//  exp.party_name || '-',
//      exp.party_gst_number || '-',
//      exp.party_address || '-',
//       exp.expense_type?.expense_category || '-',
//       exp.qty || '-',
//       formatIndianNumber(exp.price || 0),
//       formatIndianNumber((exp.qty || 0) * (exp.price || 0)),
//       exp.isGst ? formatIndianNumber(exp.gst || 0) : '-',
//       exp.isGst ? formatIndianNumber(exp.cgst || 0) : '-',
//       exp.isGst ? formatIndianNumber(exp.sgst || 0) : '-',
//       exp.isGst ? formatIndianNumber(exp.igst || 0) : '-',
//       formatIndianNumber(exp.total_price || 0),
//       exp.payment_by || '-',
//       exp.payment_type || '-',
//       exp.contact || '-',
//       exp.bank_name || '-',
//       exp.account_number || '-',
//       exp.ifsc_code || '-',
//       exp.transaction_id || '-',
//       exp.name || '-'
//     ]);

//     // Project totals
//     const projectTotal = projectExpenses.reduce((sum, exp) => sum + parseFloat(exp.total_price || 0), 0);
//     const projectQty = projectExpenses.reduce((sum, exp) => sum + parseFloat(exp.qty || 0), 0);
//     const projectBase = projectExpenses.reduce((sum, exp) => sum + ((exp.qty || 0) * (exp.price || 0)), 0);
//     const projectGst = projectExpenses.reduce((sum, exp) => sum + parseFloat(exp.gst || 0), 0);
//     const projectCgst = projectExpenses.reduce((sum, exp) => sum + parseFloat(exp.cgst || 0), 0);
//     const projectSgst = projectExpenses.reduce((sum, exp) => sum + parseFloat(exp.sgst || 0), 0);
//     const projectIgst = projectExpenses.reduce((sum, exp) => sum + parseFloat(exp.igst || 0), 0);

//     tableRows.push([
//       { content: 'Total:', colSpan: 7, styles: { fontStyle: 'bold', halign: 'right' } },
//       projectQty,
//       '-',  
//       formatIndianNumber(projectBase),
//       formatIndianNumber(projectGst),
//       formatIndianNumber(projectCgst),
//       formatIndianNumber(projectSgst),
//       formatIndianNumber(projectIgst),
//       formatIndianNumber(projectTotal),
//       '', '', '', '', '', '', '', '', '', ''
//     ]);



  

//     doc.autoTable({
//       head: [tableColumn],
//       body: tableRows,
//       startY: yPosition,
//       theme: 'grid',
//       styles: {
//         fontSize: 7,
//         cellPadding: 3,
//         halign: 'center',
//         valign: 'middle',
//         lineWidth: 0.5,
//         lineColor: [200, 200, 200]
//       },
//       headStyles: {
//         fillColor: [52, 73, 94],
//         textColor: 255,
//         fontStyle: 'bold',
//         fontSize: 7,
//         halign: 'center'
//       },
//       footStyles: {
//         fillColor: [236, 240, 241],
//         textColor: [0, 0, 0],
//         fontStyle: 'bold'
//       },
//       // margin: { 
//       //   left: margin, 
//       //   right: margin,
//       //   top: 180, // Reserve space for header on new pages
//       //   bottom: 60 // Reserve space for footer
//       // },

// margin: { 
//   left: margin,
//   right: margin,
//   top: 180,   // fixed header space
//   bottom: 60
// },


//       tableWidth: pageWidth - margin * 2,
//       alternateRowStyles: { fillColor: [249, 249, 249] },




//       didDrawPage: (data) => {
//         const currentPageNum = doc.internal.getCurrentPageInfo().pageNumber;
        
//         // Draw header on new pages (not page 1)
//         if (currentPageNum > pageNumber) {
//           pageNumber = currentPageNum;
//           drawHeaderAndBorder(false);
//         }

//         // Page number
//         doc.setFontSize(8);
//         doc.setTextColor(128, 128, 128);
//         doc.text(
//           `Page ${currentPageNum}`,
//           pageWidth / 2,
//           pageHeight - 20,
//           { align: 'center' }
//         );
//       },


// // didDrawPage: (data) => {
// //   const currentPageNum = doc.internal.getCurrentPageInfo().pageNumber;

// //   // Draw header on every new page
// //   const startY = drawHeaderAndBorder(currentPageNum === 1);

// //   // Update cursor position so table starts BELOW header
// //   data.cursor.y = startY;

// //   // Save for next pages
// //   headerHeight = startY;

// //   // Page Number
// //   doc.setFontSize(8);
// //   doc.setTextColor(128, 128, 128);

// //   doc.text(
// //     `Page ${currentPageNum}`,
// //     pageWidth / 2,
// //     pageHeight - 20,
// //     { align: 'center' }
// //   );
// // },



      
//       showHead: 'everyPage',
//       rowPageBreak: 'avoid',
//     });

//     yPosition = doc.lastAutoTable.finalY + 25;
//   });

//   // Final footer text on all pages
//   const totalPages = doc.internal.getNumberOfPages();
//   for (let i = 1; i <= totalPages; i++) {
//     doc.setPage(i);
//     doc.setFontSize(8);
//     doc.setTextColor(128, 128, 128);
//     doc.text(
//       `Expense Report | Period: ${state.start_date || 'All'} to ${state.end_date || 'All'} | Generated: ${new Date().toLocaleDateString('en-GB')}`,
//       pageWidth / 2,
//       pageHeight - 35,
//       { align: 'center' }
//     );
//   }

//   const fileName = `Expense_Report_${state.start_date || 'All'}_to_${state.end_date || 'All'}_${new Date().toISOString().split('T')[0]}.pdf`;
//   doc.save(fileName);
//   showToast('success', 'PDF file downloaded successfully!');
// };




// // Add this function in exportToPDF.js
// export const downloadAllExpenseImages = async (expenses, showToast) => {
//   if (!expenses || expenses.length === 0) {
//     showToast('warning', 'No expenses with images found');
//     return;
//   }

//   const imageUrls = [];

//   expenses.forEach(exp => {
//     // Handle multiple photos
//     if (exp.photos && Array.isArray(exp.photos)) {
//       exp.photos.forEach(photo => {
//         if (photo.photo_url) {
//           imageUrls.push({
//             url: `/${photo.photo_url}`,
//             name: `${exp.project?.project_name || 'Expense'}_${photo.remark || 'photo'}_${Date.now()}.jpg`
//           });
//         }
//       });
//     }
//     // Handle old single photo
//     else if (exp.photo_url && exp.photo_url !== "NA") {
//       imageUrls.push({
//         url: `/${exp.photo_url}`,
//         name: `${exp.project?.project_name || 'Expense'}_photo_${Date.now()}.jpg`
//       });
//     }
//   });

//   if (imageUrls.length === 0) {
//     showToast('info', 'No images found in filtered expenses');
//     return;
//   }

//   showToast('info', `Downloading ${imageUrls.length} images...`);

//   // Create ZIP (using JSZip - you need to install it)
//   const JSZip = (await import('jszip')).default;
//   const zip = new JSZip();

//   for (let i = 0; i < imageUrls.length; i++) {
//     const { url, name } = imageUrls[i];
//     try {
//       const response = await fetch(url);
//       const blob = await response.blob();
//       zip.file(name, blob);
//     } catch (err) {
//       console.warn(`Failed to download: ${name}`);
//     }
//   }

//   const zipBlob = await zip.generateAsync({ type: 'blob' });
//   const link = document.createElement('a');
//   link.href = URL.createObjectURL(zipBlob);
//   link.download = `Expense_Images_${new Date().toISOString().split('T')[0]}.zip`;
//   document.body.appendChild(link);
//   link.click();
//   document.body.removeChild(link);

//   showToast('success', `${imageUrls.length} images downloaded as ZIP!`);
// };









// import jsPDF from 'jspdf';
// import 'jspdf-autotable';
// import { host } from '../../../util/constants';
// import { getUserData } from '../../../util/session';

// export const exportToPDF = (
//   state,
//   projects,
//   expenseTypes,
//   totalExpense,
//   sortedFilteredExpenses,
//   expenseType,
//   formatIndianNumber,
//   formatDate,
//   showToast,
//   totalCgstAmount,
//   totalSgstAmount,
//   totalIgstAmount,
//   sumQty,
//   sumBase
// ) => {
//   const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
//   const pageWidth = doc.internal.pageSize.getWidth();
//   const margin = 40;

//   const user = getUserData();
//   const companyInfo = user?.company_info || {};
//   const selectedProject = projects.find(p => p.id === parseInt(state.project_id));

//   let yPosition = 0;

//   const drawHeader = (isFirstPage = false) => {
//     doc.setDrawColor(80, 80, 80);
//     doc.setLineWidth(1.2);
//     doc.rect(margin, margin, pageWidth - margin * 2, 140);

//     const logoX = pageWidth - margin - 80;
//     const logoY = margin + 20;
//     if (companyInfo.logo) {
//       try {
//         doc.addImage(`${host}/img/${companyInfo.logo}`, 'PNG', logoX, logoY, 70, 70);
//       } catch (e) {}
//     }

//     doc.setFontSize(18);
//     doc.setFont(undefined, 'bold');
//     doc.text(companyInfo.company_name || "Deshmukh Infra Soft", margin + 20, margin + 35);

//     doc.setFontSize(10);
//     doc.setFont(undefined, 'normal');
//     doc.text(companyInfo.land_mark || "Urali Kanchan, Pune", margin + 20, margin + 55);
//     doc.text(`GSTIN: ${companyInfo.gst_number || 'N/A'}`, margin + 20, margin + 70);

//     if (isFirstPage) {
//       doc.setFontSize(16);
//       doc.setFont(undefined, 'bold');
//       doc.text('EXPENSE REPORT', pageWidth / 2, margin + 100, { align: 'center' });

//       const period = `${state.start_date || 'All'} to ${state.end_date || 'All'}`;
//       doc.setFontSize(11);
//       doc.text(`Period: ${period}`, pageWidth / 2, margin + 120, { align: 'center' });
//     }

//     return margin + 160;
//   };

//   yPosition = drawHeader(true);

//   const grouped = {};
//   sortedFilteredExpenses.forEach(exp => {
//     const projName = exp.project?.project_name || 'No Project';
//     if (!grouped[projName]) grouped[projName] = [];
//     grouped[projName].push(exp);
//   });

//   Object.keys(grouped).forEach(projName => {
//     const expList = grouped[projName];

//     doc.setFillColor(41, 128, 185);
//     doc.rect(margin, yPosition, pageWidth - margin * 2, 28, 'F');
//     doc.setTextColor(255);
//     doc.setFontSize(13);
//     doc.setFont(undefined, 'bold');
//     doc.text(`Project: ${projName}`, margin + 15, yPosition + 19);
//     yPosition += 40;

//     const columns = [
//       'Sr', 'Date', 'Party Name', 'Party GST', 'Party Address',
//       'Expense Type', 'Category', 'Qty', 'Price', 'Total', 'Payment By'
//     ];

//     const rows = expList.map((exp, i) => [
//       i + 1,
//       formatDate(exp.expense_date),
//       exp.party_name || '-',
//       exp.party_gst_number || '-',
//       exp.party_address || '-',
//       expenseType[exp.expense_id] || '-',
//       exp.expense_type?.expense_category || '-',
//       exp.qty || '-',
//       formatIndianNumber(exp.price || 0),
//       formatIndianNumber(exp.total_price || 0),
//       exp.payment_by || '-'
//     ]);

//     doc.autoTable({
//       head: [columns],
//       body: rows,
//       startY: yPosition,
//       theme: 'grid',
//       styles: { fontSize: 8, cellPadding: 4 },
//       headStyles: { fillColor: [52, 73, 94], textColor: 255 },
//       margin: { left: margin, right: margin },
//       didDrawPage: () => {
//         doc.setFontSize(8);
//         doc.text(`Page ${doc.internal.getCurrentPageInfo().pageNumber}`, pageWidth / 2, doc.internal.pageSize.height - 30, { align: 'center' });
//       }
//     });

//     yPosition = doc.lastAutoTable.finalY + 30;
//   });

//   const fileName = `Expense_Report_${new Date().toISOString().split('T')[0]}.pdf`;
//   doc.save(fileName);
//   showToast('success', 'PDF downloaded successfully!');
// };



// export const downloadAllExpenseImages = async (sortedFilteredExpenses, showToast) => {
//   if (!sortedFilteredExpenses || sortedFilteredExpenses.length === 0) {
//     showToast('warning', 'No expenses found');
//     return;
//   }

//   const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
//   const pageWidth = doc.internal.pageSize.getWidth();
//   const margin = 40;
//   let yPosition = 0;

//   const user = getUserData();
//   const companyInfo = user?.company_info || {};

//   const drawHeader = () => {
//     doc.setDrawColor(80, 80, 80);
//     doc.setLineWidth(1.2);
//     doc.rect(margin, margin, pageWidth - margin * 2, 130);

//     const logoX = pageWidth - margin - 80;
//     const logoY = margin + 20;
//     if (companyInfo.logo) {
//       try {
//         doc.addImage(`${host}/img/${companyInfo.logo}`, 'PNG', logoX, logoY, 70, 70);
//       } catch (e) {}
//     }

//     doc.setFontSize(18);
//     doc.setFont(undefined, 'bold');
//     doc.text(companyInfo.company_name || "Deshmukh Infra Soft", margin + 20, margin + 35);

//     doc.setFontSize(10);
//     doc.setFont(undefined, 'normal');
//     doc.text(companyInfo.land_mark || "Urali Kanchan, Pune", margin + 20, margin + 55);
//     doc.text(`GSTIN: ${companyInfo.gst_number || 'N/A'}`, margin + 20, margin + 70);

//     doc.setFontSize(16);
//     doc.setFont(undefined, 'bold');
//     doc.text('EXPENSE IMAGES ONLY', pageWidth / 2, margin + 110, { align: 'center' });

//     return margin + 150;
//   };

//   yPosition = drawHeader();

//   const grouped = {};
//   sortedFilteredExpenses.forEach(exp => {
//     const projName = exp.project?.project_name || 'No Project';
//     if (!grouped[projName]) grouped[projName] = [];
//     grouped[projName].push(exp);
//   });

//   for (const projName of Object.keys(grouped)) {
//     const expList = grouped[projName];

//     if (yPosition > 700) {
//       doc.addPage();
//       yPosition = drawHeader();
//     }

//     doc.setFillColor(41, 128, 185);
//     doc.rect(margin, yPosition, pageWidth - margin * 2, 28, 'F');
//     doc.setTextColor(255);
//     doc.setFontSize(13);
//     doc.setFont(undefined, 'bold');
//     doc.text(`Project: ${projName}`, margin + 15, yPosition + 19);
//     yPosition += 45;

//     for (const exp of expList) {
//       if (yPosition > 720) {
//         doc.addPage();
//         yPosition = drawHeader();
//       }

//       // Expense Info
//       doc.setFontSize(11);
//       doc.setFont(undefined, 'bold');
//       doc.text(`Expense Type: ${exp.expense_type?.name || expenseType[exp.expense_id] || 'N/A'}`, margin, yPosition);
//       yPosition += 18;

//       doc.setFont(undefined, 'normal');
//       doc.text(`Date: ${exp.expense_date}`, margin, yPosition);
//       yPosition += 18;

//       if (exp.name || exp.desc) {
//         doc.text(`About: ${exp.name || exp.desc || 'N/A'}`, margin, yPosition);
//         yPosition += 25;
//       } else {
//         yPosition += 10;
//       }

//       // Images
//       let images = [];
//       if (exp.photos && Array.isArray(exp.photos) && exp.photos.length > 0) {
//         images = exp.photos;
//       } else if (exp.photo_url && exp.photo_url !== "NA") {
//         images = [{ photo_url: exp.photo_url, remark: exp.photo_remark }];
//       }

//       if (images.length > 0) {
//         for (const photo of images) {
//           if (photo.photo_url) {
//             try {
//               const imgUrl = `${host}${photo.photo_url.startsWith('/') ? '' : '/'}${photo.photo_url}`;
//               const imgProps = doc.getImageProperties(imgUrl);

//               const imgWidth = pageWidth - margin * 2 - 20;
//               const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

//               if (yPosition + imgHeight > 780) {
//                 doc.addPage();
//                 yPosition = drawHeader();
//               }

//               doc.addImage(imgUrl, 'JPEG', margin + 10, yPosition, imgWidth, imgHeight);
//               yPosition += imgHeight + 15;

//               if (photo.remark) {
//                 doc.setFontSize(10);
//                 doc.text(`Remark: ${photo.remark}`, margin + 15, yPosition);
//                 yPosition += 20;
//               }
//             } catch (err) {
//               doc.setFontSize(10);
//               doc.text("[Image could not be loaded]", margin + 15, yPosition);
//               yPosition += 25;
//             }
//           }
//         }
//       } else {
//         doc.setFontSize(10);
//         doc.text("No images available", margin + 15, yPosition);
//         yPosition += 30;
//       }

//       yPosition += 30; // Gap between expenses
//     }
//   }

//   const fileName = `Expense_Images_Only_${new Date().toISOString().split('T')[0]}.pdf`;
//   doc.save(fileName);
//   showToast('success', 'Images Only PDF downloaded successfully!');
// };




import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { host } from '../../../util/constants';
import { getUserData } from '../../../util/session';

export const exportToPDF = (
  state,
  projects,
  expenseTypes,
  totalExpense,
  sortedFilteredExpenses,
  expenseType,
  formatIndianNumber,
  formatDate,
  showToast,
  totalCgstAmount,
  totalSgstAmount,
  totalIgstAmount,
  sumQty,
  sumBase
) => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;

  // User & company data
  const user = getUserData();
  const companyInfo = user?.company_info || {};
  const totalGst = totalCgstAmount + totalSgstAmount + totalIgstAmount;
  const selectedProject = projects.find(p => p.id === parseInt(state.project_id));

  // Track page numbers
  let pageNumber = 0;
  let headerHeight = 0;


  // ─────────────────────────────────────────────────
  // Function to draw header + border on current page
  // ─────────────────────────────────────────────────
  const drawHeaderAndBorder = (isFirstPage) => {
    // 1. Outer border
    doc.setDrawColor(80, 80, 80);
    doc.setLineWidth(1);
    doc.rect(margin, margin, pageWidth - margin * 2, pageHeight - margin * 2);

    // 2. Logo (top-right)
    const logoSize = 70; // pt (~25mm)
    const logoX = pageWidth - margin - logoSize - 15;
    const logoY = margin + 15;
    let logoUrl = null;

    if (companyInfo.logo && companyInfo.logo !== "invoice/empty.png") {
      logoUrl = `${host}/img/${companyInfo.logo}`;
    }

    if (logoUrl) {
      try {
        doc.addImage(logoUrl, 'PNG', logoX, logoY, logoSize, logoSize);
      } catch (err) {
        console.warn("Logo failed to load:", err);
        doc.setFillColor(220, 220, 240);
        doc.rect(logoX, logoY, logoSize, logoSize, 'F');
        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text("LOGO", logoX + 15, logoY + 40);
      }
    } else {
      doc.setFillColor(220, 220, 240);
      doc.rect(logoX, logoY, logoSize, logoSize, 'F');
      doc.setFontSize(12);
      doc.setTextColor(100);
      doc.text("LOGO", logoX + 15, logoY + 40);
    }

    // 3. Company name & details (top-left)
    const textX = margin + 15;
    let textY = margin + 30;

    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(40, 40, 60);
    doc.text(companyInfo.company_name || "Deshmukh Infra Soft", textX, textY);

    textY += 22;
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(60);

    const details = [
      companyInfo.land_mark || "Urali Kanchan, Pune",
      `Phone: ${companyInfo.phone_no || "9173635656"}`,
      `Email: ${companyInfo.email_id || "shreyas.gijare.21@gmail.com"}`,
      `GSTIN: ${companyInfo.gst_number || "Not Available"}`,
    ];

    details.forEach(line => {
      if (line && line.trim()) {
        doc.text(line, textX, textY);
        textY += 15;
      }
    });

    // 4. Horizontal separator
    doc.setLineWidth(1.5);
    doc.setDrawColor(0, 0, 0);
    doc.line(margin + 10, textY + 10, pageWidth - margin - 10, textY + 10);

    // 5. Title
    // doc.setFontSize(18);
    // doc.setFont(undefined, 'bold');
    // doc.setTextColor(0);
    // let titleText = 'EXPENSE REPORT';
    // // if (!isFirstPage) titleText += ' (continued)';
    // doc.text(titleText, pageWidth / 2, textY + 35, { align: 'center' });

    // 5. Title (ONLY on First Page)
if (isFirstPage) {
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(0);

  doc.text(
    'EXPENSE REPORT',
    pageWidth / 2,
    textY + 35,
    { align: 'center' }
  );
}


    // Return content start Y (below header)
    let contentStartY = textY + 50;

    // Period & Generated date (ONLY on first page)
    if (isFirstPage) {
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(70);

      const startDate = state.start_date || 'All';
      const endDate = state.end_date || 'All';
      const generatedDate = new Date().toLocaleDateString('en-GB');

      doc.text(`Period: ${startDate} to ${endDate}`, pageWidth / 2, textY + 55, { align: 'center' });
      doc.text(`Generated on: ${generatedDate}`, pageWidth / 2, textY + 70, { align: 'center' });

      contentStartY = textY + 90;
    }

    // Grand Total at the top (ONLY on first page)
    if (isFirstPage) {
      doc.setFillColor(231, 76, 60);
      doc.setDrawColor(192, 57, 43);
      doc.setLineWidth(2);
      doc.rect(margin, contentStartY, pageWidth - margin * 2, 35, 'FD');

      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(255, 255, 255);

      const grandText = `Grand Total of Expenses : Amount: Rs ${formatIndianNumber(totalExpense)} | GST: Rs ${formatIndianNumber(totalGst)} | CGST: Rs ${formatIndianNumber(totalCgstAmount)} | SGST: Rs ${formatIndianNumber(totalSgstAmount)} | IGST: Rs ${formatIndianNumber(totalIgstAmount)}`;
      doc.text(grandText, pageWidth / 2, contentStartY + 23, { align: 'center' });

      contentStartY += 50;
    }

    return contentStartY;
  };

  // Draw header on first page
  // let yPosition = drawHeaderAndBorder(true);
  let yPosition = drawHeaderAndBorder(true);
headerHeight = yPosition;

  pageNumber = 1;

  // Group expenses
  let groupedExpenses = {};
  if (selectedProject) {
    groupedExpenses[selectedProject.project_name] = sortedFilteredExpenses;
  } else {
    sortedFilteredExpenses.forEach(exp => {
      const projectName = exp.project?.project_name || 'No Project';
      if (!groupedExpenses[projectName]) groupedExpenses[projectName] = [];
      groupedExpenses[projectName].push(exp);
    });
  }

  // Process each group
  Object.keys(groupedExpenses).forEach((projectName) => {
    const projectExpenses = groupedExpenses[projectName];

    // Project header
    doc.setFillColor(41, 128, 185);
    doc.rect(margin, yPosition, pageWidth - margin * 2, 25, 'F');
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(`Project: ${projectName}`, margin + 15, yPosition + 18);

    yPosition += 35;

    // Table
    const tableColumn = [
      'Sr', 'Date', 'Expense Type', 'Party Name', 'Party GST', 'Party Address',
      'Category', 'Qty', 'Price',
      'Base Amount', 'GST Rs', 'CGST Rs', 'SGST Rs', 'IGST Rs',
      'Total', 'Payment By', 'Payment Type', 'Contact', 'Bank',
      'Account', 'IFSC', 'Txn ID', 'About'
    ];

    const tableRows = projectExpenses.map((exp, i) => [
      i + 1,
      formatDate(exp.expense_date),
      exp.expense_type?.name || expenseType[exp.expense_id] || '-',
 exp.party_name || '-',
     exp.party_gst_number || '-',
     exp.party_address || '-',
      exp.expense_type?.expense_category || '-',
      exp.qty || '-',
      formatIndianNumber(exp.price || 0),
      formatIndianNumber((exp.qty || 0) * (exp.price || 0)),
      exp.isGst ? formatIndianNumber(exp.gst || 0) : '-',
      exp.isGst ? formatIndianNumber(exp.cgst || 0) : '-',
      exp.isGst ? formatIndianNumber(exp.sgst || 0) : '-',
      exp.isGst ? formatIndianNumber(exp.igst || 0) : '-',
      formatIndianNumber(exp.total_price || 0),
      exp.payment_by || '-',
      exp.payment_type || '-',
      exp.contact || '-',
      exp.bank_name || '-',
      exp.account_number || '-',
      exp.ifsc_code || '-',
      exp.transaction_id || '-',
      exp.name || '-'
    ]);

    // Project totals
    const projectTotal = projectExpenses.reduce((sum, exp) => sum + parseFloat(exp.total_price || 0), 0);
    const projectQty = projectExpenses.reduce((sum, exp) => sum + parseFloat(exp.qty || 0), 0);
    const projectBase = projectExpenses.reduce((sum, exp) => sum + ((exp.qty || 0) * (exp.price || 0)), 0);
    const projectGst = projectExpenses.reduce((sum, exp) => sum + parseFloat(exp.gst || 0), 0);
    const projectCgst = projectExpenses.reduce((sum, exp) => sum + parseFloat(exp.cgst || 0), 0);
    const projectSgst = projectExpenses.reduce((sum, exp) => sum + parseFloat(exp.sgst || 0), 0);
    const projectIgst = projectExpenses.reduce((sum, exp) => sum + parseFloat(exp.igst || 0), 0);

    tableRows.push([
      { content: 'Total:', colSpan: 7, styles: { fontStyle: 'bold', halign: 'right' } },
      projectQty,
      '-',  
      formatIndianNumber(projectBase),
      formatIndianNumber(projectGst),
      formatIndianNumber(projectCgst),
      formatIndianNumber(projectSgst),
      formatIndianNumber(projectIgst),
      formatIndianNumber(projectTotal),
      '', '', '', '', '', '', '', '', '', ''
    ]);



  

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: yPosition,
      theme: 'grid',
      styles: {
        fontSize: 7,
        cellPadding: 3,
        halign: 'center',
        valign: 'middle',
        lineWidth: 0.5,
        lineColor: [200, 200, 200]
      },
      headStyles: {
        fillColor: [52, 73, 94],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 7,
        halign: 'center'
      },
      footStyles: {
        fillColor: [236, 240, 241],
        textColor: [0, 0, 0],
        fontStyle: 'bold'
      },
      // margin: { 
      //   left: margin, 
      //   right: margin,
      //   top: 180, // Reserve space for header on new pages
      //   bottom: 60 // Reserve space for footer
      // },

margin: { 
  left: margin,
  right: margin,
  top: 180,   // fixed header space
  bottom: 60
},


      tableWidth: pageWidth - margin * 2,
      alternateRowStyles: { fillColor: [249, 249, 249] },




      didDrawPage: (data) => {
        const currentPageNum = doc.internal.getCurrentPageInfo().pageNumber;
        
        // Draw header on new pages (not page 1)
        if (currentPageNum > pageNumber) {
          pageNumber = currentPageNum;
          drawHeaderAndBorder(false);
        }

        // Page number
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
          `Page ${currentPageNum}`,
          pageWidth / 2,
          pageHeight - 20,
          { align: 'center' }
        );
      },


// didDrawPage: (data) => {
//   const currentPageNum = doc.internal.getCurrentPageInfo().pageNumber;

//   // Draw header on every new page
//   const startY = drawHeaderAndBorder(currentPageNum === 1);

//   // Update cursor position so table starts BELOW header
//   data.cursor.y = startY;

//   // Save for next pages
//   headerHeight = startY;

//   // Page Number
//   doc.setFontSize(8);
//   doc.setTextColor(128, 128, 128);

//   doc.text(
//     `Page ${currentPageNum}`,
//     pageWidth / 2,
//     pageHeight - 20,
//     { align: 'center' }
//   );
// },



      
      showHead: 'everyPage',
      rowPageBreak: 'avoid',
    });

    yPosition = doc.lastAutoTable.finalY + 25;
  });

  // Final footer text on all pages
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Expense Report | Period: ${state.start_date || 'All'} to ${state.end_date || 'All'} | Generated: ${new Date().toLocaleDateString('en-GB')}`,
      pageWidth / 2,
      pageHeight - 35,
      { align: 'center' }
    );
  }

  const fileName = `Expense_Report_${state.start_date || 'All'}_to_${state.end_date || 'All'}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
  showToast('success', 'PDF file downloaded successfully!');
};

// ====================== IMAGES ONLY PDF (Corrected) ======================
export const downloadAllExpenseImages = async (sortedFilteredExpenses, showToast) => {
  if (!sortedFilteredExpenses || sortedFilteredExpenses.length === 0) {
    showToast('warning', 'No expenses found');
    return;
  }

  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;
  let yPosition = 0;

  const user = getUserData();
  const companyInfo = user?.company_info || {};

  const drawHeader = () => {
    doc.setDrawColor(80, 80, 80);
    doc.setLineWidth(1.2);
    doc.rect(margin, margin, pageWidth - margin * 2, 130);

    const logoX = pageWidth - margin - 80;
    const logoY = margin + 20;
    if (companyInfo.logo) {
      try {
        doc.addImage(`${host}/img/${companyInfo.logo}`, 'PNG', logoX, logoY, 70, 70);
      } catch (e) {}
    }

    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text(companyInfo.company_name || "Deshmukh Infra Soft", margin + 20, margin + 35);

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(companyInfo.land_mark || "Urali Kanchan, Pune", margin + 20, margin + 55);
    doc.text(`GSTIN: ${companyInfo.gst_number || 'N/A'}`, margin + 20, margin + 70);

    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('EXPENSE IMAGES ONLY', pageWidth / 2, margin + 110, { align: 'center' });

    return margin + 150;
  };

  yPosition = drawHeader();

  const grouped = {};

  // Filter only expenses that have images
  const expensesWithImages = sortedFilteredExpenses.filter(exp => {
    return (exp.photos && Array.isArray(exp.photos) && exp.photos.length > 0) ||
           (exp.photo_url && exp.photo_url !== "NA");
  });

  if (expensesWithImages.length === 0) {
    showToast('warning', 'No expenses with images found');
    return;
  }

  expensesWithImages.forEach(exp => {
    const projName = exp.project?.project_name || 'No Project';
    if (!grouped[projName]) grouped[projName] = [];
    grouped[projName].push(exp);
  });

  for (const projName of Object.keys(grouped)) {
    const expList = grouped[projName];

    if (yPosition > 700) {
      doc.addPage();
      yPosition = drawHeader();
    }

    // Project Header
    doc.setFillColor(41, 128, 185);
    doc.rect(margin, yPosition, pageWidth - margin * 2, 28, 'F');
    doc.setTextColor(255);
    doc.setFontSize(13);
    doc.setFont(undefined, 'bold');
    doc.text(`Project: ${projName}`, margin + 15, yPosition + 19);
    yPosition += 45;

    for (const exp of expList) {
      if (yPosition > 720) {
        doc.addPage();
        yPosition = drawHeader();
      }

      // Expense Details
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.text(`Expense Type: ${exp.expense_type?.name || 'N/A'}`, margin, yPosition);
      yPosition += 18;

      doc.setFont(undefined, 'normal');
      doc.text(`Date: ${exp.expense_date ? new Date(exp.expense_date).toLocaleDateString('en-GB') : 'N/A'}`, margin, yPosition);
      yPosition += 18;

      if (exp.name || exp.desc) {
        doc.text(`About: ${exp.name || exp.desc || 'N/A'}`, margin, yPosition);
        yPosition += 25;
      } else {
        yPosition += 10;
      }

      // Images
      let images = [];
      if (exp.photos && Array.isArray(exp.photos) && exp.photos.length > 0) {
        images = exp.photos;
      } else if (exp.photo_url && exp.photo_url !== "NA") {
        images = [{ photo_url: exp.photo_url, remark: exp.photo_remark }];
      }

      if (images.length > 0) {
        for (const photo of images) {
          if (photo.photo_url) {
            try {
              const imgUrl = `${host}${photo.photo_url.startsWith('/') ? '' : '/'}${photo.photo_url}`;
              const imgProps = doc.getImageProperties(imgUrl);

              const imgWidth = pageWidth - margin * 2 - 30;
              const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

              if (yPosition + imgHeight > 780) {
                doc.addPage();
                yPosition = drawHeader();
              }

              doc.addImage(imgUrl, 'JPEG', margin + 15, yPosition, imgWidth, imgHeight);
              yPosition += imgHeight + 18;

              if (photo.remark) {
                doc.setFontSize(10);
                doc.text(`Remark: ${photo.remark}`, margin + 20, yPosition);
                yPosition += 22;
              }
            } catch (err) {
              doc.setFontSize(10);
              doc.text("[Image could not be loaded]", margin + 20, yPosition);
              yPosition += 25;
            }
          }
        }
      }
      yPosition += 35; // Gap between expenses
    }
  }

  const fileName = `Expense_Images_Only_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
  showToast('success', 'Images Only PDF downloaded successfully!');
};
















// ====================== DOWNLOAD ALL IMAGES ======================
// export const downloadAllExpenseImages = async (expenses, showToast) => {
//   if (!expenses || expenses.length === 0) {
//     showToast('warning', 'No expenses with images found');
//     return;
//   }

//   const imageUrls = [];

//   expenses.forEach(exp => {
//     if (exp.photos && Array.isArray(exp.photos)) {
//       exp.photos.forEach(photo => {
//         if (photo.photo_url) {
//           imageUrls.push({
//             url: `/${photo.photo_url}`,
//             name: `${exp.project?.project_name || 'Expense'}_${photo.remark || 'photo'}_${Date.now()}.jpg`
//           });
//         }
//       });
//     } else if (exp.photo_url && exp.photo_url !== "NA") {
//       imageUrls.push({
//         url: `/${exp.photo_url}`,
//         name: `${exp.project?.project_name || 'Expense'}_photo_${Date.now()}.jpg`
//       });
//     }
//   });

//   if (imageUrls.length === 0) {
//     showToast('info', 'No images found in filtered expenses');
//     return;
//   }

//   showToast('info', `Downloading ${imageUrls.length} images...`);

//   const JSZip = (await import('jszip')).default;
//   const zip = new JSZip();

//   for (let i = 0; i < imageUrls.length; i++) {
//     const { url, name } = imageUrls[i];
//     try {
//       const response = await fetch(url);
//       const blob = await response.blob();
//       zip.file(name, blob);
//     } catch (err) {
//       console.warn(`Failed to download: ${name}`);
//     }
//   }

//   const zipBlob = await zip.generateAsync({ type: 'blob' });
//   const link = document.createElement('a');
//   link.href = URL.createObjectURL(zipBlob);
//   link.download = `Expense_Images_${new Date().toISOString().split('T')[0]}.zip`;
//   document.body.appendChild(link);
//   link.click();
//   document.body.removeChild(link);

//   showToast('success', `${imageUrls.length} images downloaded successfully as ZIP!`);
// };



// export const downloadAllExpenseImages = async (sortedFilteredExpenses, showToast) => {
//   if (!sortedFilteredExpenses || sortedFilteredExpenses.length === 0) {
//     showToast('warning', 'No expenses found');
//     return;
//   }

//   const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
//   const pageWidth = doc.internal.pageSize.getWidth();
//   const margin = 40;
//   let yPosition = 60;

//   doc.setFontSize(18);
//   doc.setFont(undefined, 'bold');
//   doc.text('EXPENSE IMAGES REPORT', pageWidth / 2, 40, { align: 'center' });

//   for (const exp of sortedFilteredExpenses) {
//     // Check if we need new page
//     if (yPosition > 700) {
//       doc.addPage();
//       yPosition = 60;
//     }

//     // Project Name
//     doc.setFontSize(14);
//     doc.setFont(undefined, 'bold');
//     doc.text(`Project: ${exp.project?.project_name || 'No Project'}`, margin, yPosition);
//     yPosition += 25;

//     // Expense Details
//     doc.setFontSize(11);
//     doc.setFont(undefined, 'normal');
//     doc.text(`Expense Type: ${exp.expense_type?.name || 'N/A'}`, margin, yPosition);
//     yPosition += 18;
//     doc.text(`Date: ${exp.expense_date ? new Date(exp.expense_date).toLocaleDateString() : 'N/A'}`, margin, yPosition);
//     yPosition += 18;
//     if (exp.name || exp.desc) {
//       doc.text(`About: ${exp.name || exp.desc || 'N/A'}`, margin, yPosition);
//       yPosition += 25;
//     } else {
//       yPosition += 10;
//     }

//     // Get Images
//     let images = [];
//     if (exp.photos && Array.isArray(exp.photos) && exp.photos.length > 0) {
//       images = exp.photos;
//     } else if (exp.photo_url && exp.photo_url !== "NA") {
//       images = [{ photo_url: exp.photo_url, remark: exp.photo_remark }];
//     }

//     if (images.length > 0) {
//       for (const photo of images) {
//         if (photo.photo_url) {
//           try {
//             const imgUrl = `${host}${photo.photo_url.startsWith('/') ? '' : '/'}${photo.photo_url}`;
//             const imgProps = doc.getImageProperties(imgUrl);
            
//             const maxWidth = pageWidth - margin * 2;
//             let imgWidth = maxWidth * 0.9;
//             let imgHeight = (imgProps.height * imgWidth) / imgProps.width;

//             // Check if image fits on page
//             if (yPosition + imgHeight > 780) {
//               doc.addPage();
//               yPosition = 60;
//             }

//             doc.addImage(imgUrl, 'JPEG', margin, yPosition, imgWidth, imgHeight);
//             yPosition += imgHeight + 15;

//             if (photo.remark) {
//               doc.setFontSize(10);
//               doc.text(`Remark: ${photo.remark}`, margin, yPosition);
//               yPosition += 20;
//             }
//           } catch (err) {
//             console.warn("Failed to load image:", err);
//             doc.setFontSize(10);
//             doc.text("[Image could not be loaded]", margin, yPosition);
//             yPosition += 25;
//           }
//         }
//       }
//     } else {
//       doc.setFontSize(10);
//       doc.text("No images available for this expense", margin, yPosition);
//       yPosition += 30;
//     }

//     yPosition += 30; // Space between expenses
//   }

//   const fileName = `Expense_Images_Only_${new Date().toISOString().split('T')[0]}.pdf`;
//   doc.save(fileName);
//   showToast('success', 'Images Only PDF downloaded successfully!');
// };
