// src/components/purchase-vendor/exportHelpers.js
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { getUserData } from "../../../util/session";
import { host } from "../../../util/constants";

/* =================================================================== */
/* 1. Summary Report - PDF & Excel (Main Table)                        */
/* =================================================================== */

// export const exportToPDF = (payments, searchQuery) => {
//   const doc = new jsPDF("landscape");

//   // Header
//   doc.setFontSize(22).setFont(undefined, "bold").text("Purchase Vendor Payments Report", 14, 20);
//   doc.setFontSize(14).setFont(undefined, "normal").text(`Project: ${searchQuery}`, 14, 32);
//   doc.setFontSize(12).text(
//     `Generated on: ${new Date().toLocaleString("en-GB", {
//       day: "2-digit",
//       month: "2-digit",
//       year: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//       second: "2-digit",
//     })}`,
//     14,
//     42
//   );

//   const tableColumn = ["Vendor Name", "Material", "Qty", "Price/Unit", "Total", "Paid", "Balance", "Status", "Created"];
//   const tableRows = [];
//   let totalAmount = 0,
//     totalPaid = 0,
//     totalBalance = 0;

//   payments.forEach((p) => {
//     const amount = parseFloat(p.amount);
//     const paid = parseFloat(p.paid_amount);
//     const balance = parseFloat(p.balance_amount);
//     const qty = parseFloat(p?.purchase?.qty || 0);
//     const pricePerUnit = parseFloat(p?.purchase?.price_per_unit || 0);
//     const percentage = paid / amount;
//     const status = percentage === 0 ? "Unpaid" : percentage === 1 ? "Paid" : "Partial";

//     totalAmount += amount;
//     totalPaid += paid;
//     totalBalance += balance;

//     tableRows.push([
//       p?.purchase?.vendor?.name || "-",
//       p?.purchase?.material_name || "-",
//       qty.toFixed(2),
//       pricePerUnit.toFixed(2),
//       amount.toFixed(2),
//       paid.toFixed(2),
//       balance.toFixed(2),
//       status,
//       new Date(p.created_at).toLocaleDateString("en-GB"),
//     ]);
//   });

//   tableRows.push([
//     "Total:",
//     "",
//     "",
//     "",
//     totalAmount.toFixed(2),
//     totalPaid.toFixed(2),
//     totalBalance.toFixed(2),
//     "",
//     "",
//   ]);

//   doc.autoTable({
//     head: [tableColumn],
//     body: tableRows,
//     startY: 52,
//     theme: "grid",
//     styles: { fontSize: 9, cellPadding: 3, lineColor: [44, 62, 80], lineWidth: 0.1 },
//     headStyles: { 
//       fillColor: [52, 152, 219], 
//       textColor: [255, 255, 255], 
//       fontStyle: "bold", 
//       halign: "center", 
//       fontSize: 10 
//     },
//     columnStyles: {
//       0: { cellWidth: 35, halign: "left" },
//       1: { cellWidth: 30, halign: "left" },
//       2: { cellWidth: 20, halign: "right" },
//       3: { cellWidth: 24, halign: "right" },
//       4: { cellWidth: 24, halign: "right" },
//       5: { cellWidth: 24, halign: "right" },
//       6: { cellWidth: 24, halign: "right" },
//       7: { cellWidth: 22, halign: "center" },
//       8: { cellWidth: 26, halign: "center" },
//     },
//     alternateRowStyles: { fillColor: [245, 245, 245] },
//     didParseCell: (data) => {
//       if (data.row.index === tableRows.length - 1) {
//         data.cell.styles.fontStyle = "bold";
//         data.cell.styles.fillColor = [220, 230, 241];
//       }
//     },
//   });

//   doc.save(`vendor-payments-${searchQuery.replace(/\s+/g, "-")}-${Date.now()}.pdf`);
// };







/* ================= UTILS ================= */

const formatIndianNumber = (number) => {
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number || 0);
};

/* ================= PDF EXPORT ================= */

export const exportToPDF = (payments, searchQuery = "All") => {
  const doc = new jsPDF("landscape", "pt", "a4");

  /* ================= PAGE SETUP ================= */

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const margin = 40;        // outer border
  const innerPadding = 12;  // content padding

  const contentLeft = margin + innerPadding;
  const contentRight = pageWidth - margin - innerPadding;
  const contentWidth = contentRight - contentLeft;

  const user = getUserData();
  const companyInfo = user?.company_info || {};

  /* ================= HEADER (STYLE FROM downloadPDF) ================= */

const drawHeaderAndBorder = () => {
  /* ================= OUTER BORDER ================= */
  doc.setDrawColor(80, 80, 80);
  doc.setLineWidth(0.4);
  doc.rect(
    margin,
    margin,
    pageWidth - margin * 2,
    pageHeight - margin * 2
  );

  /* ================= LOGO ================= */
  const logoSize = 75;
  const headerTop = margin + 16;
  const logoX = pageWidth - margin - logoSize - 6;
  const logoY = headerTop;

  let logoUrl = null;
  if (companyInfo.logo && companyInfo.logo !== "invoice/empty.png") {
    logoUrl = `${host}/img/${companyInfo.logo}`;
  }

  if (logoUrl) {
    try {
      doc.addImage(logoUrl, "PNG", logoX, logoY, logoSize, logoSize);
    } catch {
      doc.setFillColor(220, 220, 240);
      doc.rect(logoX, logoY, logoSize, logoSize, "F");
      doc.setFontSize(9);
      doc.text("LOGO", logoX + 6, logoY + 14);
    }
  }

  /* ================= COMPANY NAME ================= */
  const headerX = margin + 14;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(40, 40, 60);
  doc.text(
    companyInfo.company_name || "Deshmukh Infra Soft",
    headerX,
    headerTop + 12
  );

  /* ================= COMPANY DETAILS ================= */
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(70);

  let detailY = headerTop + 36;   // 🔑 IMPORTANT FIX
  const lineHeight = 14;          // 🔑 IMPORTANT FIX

  [
    companyInfo.land_mark || "Urali Kanchan, Pune",
    `Phone: ${companyInfo.phone_no || "9173635656"}`,
    `Email: ${companyInfo.email_id || "shreyas.gijare.21@gmail.com"}`,
    `GSTIN: ${companyInfo.gst_number || "Not Available"}`,
  ].forEach((line) => {
    if (line) {
      doc.text(line, headerX, detailY);
      detailY += lineHeight;
    }
  });

  /* ================= SEPARATOR ================= */
  const separatorY = detailY + 8;
  doc.setLineWidth(1);
  doc.setDrawColor(0, 0, 0);
  doc.line(
    margin + 6,
    separatorY,
    pageWidth - margin - 6,
    separatorY
  );

  /* ================= TITLE ================= */
  const titleY = separatorY + 24;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(0);
  doc.text(
    "PURCHASE VENDOR PAYMENTS REPORT",
    pageWidth / 2,
    titleY,
    { align: "center" }
  );

  /* ================= PROJECT + DATE ================= */
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(60);
  doc.text(
    `Project: ${searchQuery}`,
    pageWidth / 2,
    titleY + 18,
    { align: "center" }
  );
  doc.text(
    `Generated on: ${new Date().toLocaleDateString("en-GB")}`,
    pageWidth / 2,
    titleY + 34,
    { align: "center" }
  );

  /* ================= RETURN SAFE HEADER HEIGHT ================= */
  return titleY + 52;   // 🔒 NOTHING BELOW CAN OVERLAP
};


  /* ================= HEADER CALL ================= */

  let yPosition = drawHeaderAndBorder();

  /* ================= GRAND TOTAL ================= */

  let totalAmount = 0,
    totalPaid = 0,
    totalBalance = 0;

  payments.forEach((p) => {
    totalAmount += Number(p.amount || 0);
    totalPaid += Number(p.paid_amount || 0);
    totalBalance += Number(p.balance_amount || 0);
  });

  doc.setFillColor(231, 76, 60);
  doc.setDrawColor(192, 57, 43);
  doc.setLineWidth(2);

  doc.rect(contentLeft, yPosition, contentWidth, 60, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(255);

  doc.text("Grand Total of Payments", pageWidth / 2, yPosition + 20, {
    align: "center",
  });

  doc.text(
    `Total Amount: ${formatIndianNumber(totalAmount)}`,
    pageWidth / 2,
    yPosition + 38,
    { align: "center" }
  );

  doc.text(
    `Paid: ${formatIndianNumber(totalPaid)} | Balance: ${formatIndianNumber(
      totalBalance
    )}`,
    pageWidth / 2,
    yPosition + 56,
    { align: "center" }
  );

  yPosition += 75;

  /* ================= TABLE ================= */

  const tableColumn = [
    "Vendor Name",
    "Material",
    "Qty",
    "Price/Unit",
    "Total",
    "Paid",
    "Balance",
    "Status",
    "Created",
  ];

  const tableRows = payments.map((p) => {
    const amount = Number(p.amount || 0);
    const paid = Number(p.paid_amount || 0);
    const balance = Number(p.balance_amount || 0);

    const status =
      paid === 0 ? "Unpaid" : paid === amount ? "Paid" : "Partial";

    return [
      p?.purchase?.vendor?.name || "-",
      p?.purchase?.material_name || "-",
      Number(p?.purchase?.qty || 0).toFixed(2),
      formatIndianNumber(p?.purchase?.price_per_unit),
      formatIndianNumber(amount),
      formatIndianNumber(paid),
      formatIndianNumber(balance),
      status,
      new Date(p.created_at).toLocaleDateString("en-GB"),
    ];
  });

  tableRows.push([
    { content: "Total:", colSpan: 4, styles: { halign: "right", fontStyle: "bold" } },
    formatIndianNumber(totalAmount),
    formatIndianNumber(totalPaid),
    formatIndianNumber(totalBalance),
    "",
    "",
  ]);

  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: yPosition,
    tableWidth: contentWidth,
    margin: { left: contentLeft, right: margin + innerPadding },
    theme: "grid",
    styles: {
      fontSize: 9,
      cellPadding: 4,
      overflow: "linebreak",
      halign: "center",
      valign: "middle",
      lineColor: [44, 62, 80],
      lineWidth: 0.3,
    },
    headStyles: {
      fillColor: [52, 152, 219],
      textColor: 255,
      fontStyle: "bold",
      fontSize: 10,
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    didParseCell: (data) => {
      if (data.row.index === tableRows.length - 1) {
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.fillColor = [220, 230, 241];
      }
    },
    didDrawPage: () => {
      drawHeaderAndBorder();
      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.text(
        `Page ${doc.internal.getNumberOfPages()}`,
        pageWidth - margin - 10,
        pageHeight - 15,
        { align: "right" }
      );
    },
  });

  /* ================= FOOTER ================= */

  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(
      `Purchase Vendor Payments Report | Generated: ${new Date().toLocaleDateString(
        "en-GB"
      )}`,
      pageWidth / 2,
      pageHeight - 15,
      { align: "center" }
    );
  }

  doc.save(`vendor-payments-${searchQuery.replace(/\s+/g, "-")}.pdf`);
};







export const exportToExcel = (payments, searchQuery) => {
  let totalAmount = 0,
    totalPaid = 0,
    totalBalance = 0;

  const worksheetData = payments.map((p) => {
    const amount = parseFloat(p.amount);
    const paid = parseFloat(p.paid_amount);
    const balance = parseFloat(p.balance_amount);
    const qty = parseFloat(p?.purchase?.qty || 0);
    const pricePerUnit = parseFloat(p?.purchase?.price_per_unit || 0);
    const percentage = paid / amount;
    const status = percentage === 0 ? "Unpaid" : percentage === 1 ? "Paid" : "Partial";

    totalAmount += amount;
    totalPaid += paid;
    totalBalance += balance;

    return {
      "Vendor Name": p?.purchase?.vendor?.name || "-",
      "Material": p?.purchase?.material_name || "-",
      "Qty": qty.toFixed(2),
      "Price/Unit": pricePerUnit.toFixed(2),
      "Total": amount.toFixed(2),
      "Paid": paid.toFixed(2),
      "Balance": balance.toFixed(2),
      "Status": status,
      "Created": new Date(p.created_at).toLocaleDateString("en-GB"),
    };
  });

  worksheetData.push({
    "Vendor Name": "Total:",
    "Material": "",
    "Qty": "",
    "Price/Unit": "",
    "Total": totalAmount.toFixed(2),
    "Paid": totalPaid.toFixed(2),
    "Balance": totalBalance.toFixed(2),
    "Status": "",
    "Created": "",
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([]);

  const timestamp = new Date().toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  XLSX.utils.sheet_add_aoa(
    ws,
    [
      ["Purchase Vendor Payments Report"],
      [`Project: ${searchQuery}`],
      [`Generated on: ${timestamp}`],
      [],
    ],
    { origin: "A1" }
  );

  XLSX.utils.sheet_add_json(ws, worksheetData, { origin: "A5", skipHeader: false });

  // Styling
  const columns = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];
  columns.forEach((col) => {
    const headerCell = `${col}5`;
    if (ws[headerCell]) {
      ws[headerCell].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "3498DB" } },
        alignment: { horizontal: "center" },
      };
    }
  });

  // Totals row
  const totalsRow = 4 + worksheetData.length + 1;
  columns.forEach((col) => {
    const cell = ws[`${col}${totalsRow}`];
    if (cell) {
      cell.s = {
        font: { bold: true },
        fill: { fgColor: { rgb: "DCE6F1" } },
        alignment: { horizontal: col === "A" ? "left" : "right" },
      };
    }
  });

  ws["!cols"] = [
    { wch: 25 }, // Vendor Name
    { wch: 25 }, // Material
    { wch: 12 }, // Qty
    { wch: 15 }, // Price/Unit
    { wch: 15 }, // Total
    { wch: 15 }, // Paid
    { wch: 15 }, // Balance
    { wch: 12 }, // Status
    { wch: 18 }, // Created
  ];
  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 8 } },
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Payments");
  XLSX.writeFile(wb, `vendor-payments-${searchQuery.replace(/\s+/g, "-")}-${Date.now()}.xlsx`);
};

/* =================================================================== */
/* 2. All Logs Report - PDF & Excel (Detailed with Payment History)   */
/* =================================================================== */

// export const exportAllLogsToPDF = (payments, searchQuery) => {
//   const doc = new jsPDF("landscape");

//   doc.setFontSize(18).setFont("helvetica", "bold").text("All Vendor Payment Logs", 14, 15);
//   doc.setFontSize(12).setFont("helvetica", "normal").text(`Project: ${searchQuery}`, 14, 23);
//   doc.setFontSize(10).text(`Generated: ${new Date().toLocaleString("en-GB")}`, 14, 30);

//   const body = [];
//   let grandTotal = 0,
//     grandPaid = 0,
//     grandBalance = 0;

//   payments.forEach((p) => {
//     const vendor = p.purchase?.vendor?.name || "Unknown";
//     const material = p.purchase?.material_name || "-";
//     const total = parseFloat(p.amount);
//     const paid = parseFloat(p.paid_amount);
//     const balance = parseFloat(p.balance_amount);

//     grandTotal += total;
//     grandPaid += paid;
//     grandBalance += balance;

//     body.push([
//       {
//         content: `Vendor: ${vendor} | Material: ${material}`,
//         colSpan: 6,
//         styles: { fontStyle: "bold", fillColor: [230, 240, 255], fontSize: 10, textColor: [20, 40, 90] },
//       },
//       { content: total.toFixed(2), styles: { fontStyle: "bold", halign: "right" } },
//       { content: paid.toFixed(2), styles: { fontStyle: "bold", halign: "right" } },
//       {
//         content: balance.toFixed(2),
//         styles: { fontStyle: "bold", halign: "right", fillColor: balance === 0 ? [220, 255, 220] : [255, 230, 230] },
//       },
//     ]);

//     if (p.logs?.length > 0) {
//       p.logs.forEach((log, i) => {
//         body.push([
//           i + 1,
//           log.paid_by || "-",
//           log.payment_type || "-",
//           parseFloat(log.amount).toFixed(2),
//           new Date(log.payment_date).toLocaleDateString("en-GB"),
//           (log.description || "-").substring(0, 40) + (log.description?.length > 40 ? "..." : ""),
//           "", "", "",
//         ]);
//       });
//     } else {
//       body.push([{ content: "No payments yet", colSpan: 6, styles: { fontStyle: "italic", textColor: [150, 150, 150] } }, "", "", ""]);
//     }

//     body.push(["", "", "", "", "", "", "", "", ""]);
//   });

//   body.push([
//     { content: "GRAND TOTAL", colSpan: 6, styles: { fontStyle: "bold", fillColor: [200, 230, 200], fontSize: 11 } },
//     { content: grandTotal.toFixed(2), styles: { fontStyle: "bold", halign: "right" } },
//     { content: grandPaid.toFixed(2), styles: { fontStyle: "bold", halign: "right" } },
//     {
//       content: grandBalance.toFixed(2),
//       styles: { fontStyle: "bold", halign: "right", fillColor: grandBalance === 0 ? [180, 255, 180] : [255, 180, 180] },
//     },
//   ]);

//   doc.autoTable({
//     head: [["No.", "Paid By", "Type", "Amount", "Date", "Description", "Total", "Paid", "Balance"]],
//     body,
//     startY: 35,
//     theme: "grid",
//     styles: { fontSize: 8.5, cellPadding: 2.5, lineColor: [180, 180, 180], lineWidth: 0.1 },
//     headStyles: { fillColor: [30, 100, 180], textColor: 255, fontStyle: "bold", fontSize: 9 },
//     columnStyles: {
//       0: { cellWidth: 12 }, 1: { cellWidth: 35 }, 2: { cellWidth: 25 }, 3: { cellWidth: 28 },
//       4: { cellWidth: 28 }, 5: { cellWidth: 85 }, 6: { cellWidth: 30, halign: "right" },
//       7: { cellWidth: 30, halign: "right" }, 8: { cellWidth: 30, halign: "right" },
//     },
//     margin: { top: 35, left: 8, right: 8 },
//   });

//   doc.save(`All_Logs_${searchQuery.replace(/[^a-zA-Z0-9]/g, "_")}_${Date.now()}.pdf`);
// };



export const exportAllLogsToPDF = (payments, searchQuery = "All") => {
  const doc = new jsPDF("landscape", "pt", "a4");

  /* ================= PAGE SETUP ================= */

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const margin = 40;          // outer border
  const innerPadding = 12;    // space inside border

  const contentLeft = margin + innerPadding;
  const contentRight = pageWidth - margin - innerPadding;
  const contentWidth = contentRight - contentLeft;

  const user = getUserData();
  const companyInfo = user?.company_info || {};

  /* ================= HEADER + BORDER ================= */

  const drawHeaderAndBorder = () => {
    /* Outer Border */
    doc.setDrawColor(80, 80, 80);
    doc.setLineWidth(0.4);
    doc.rect(
      margin,
      margin,
      pageWidth - margin * 2,
      pageHeight - margin * 2
    );

    /* Logo */
    const logoSize = 75;
    const headerTop = margin + 16;
    const logoX = pageWidth - margin - logoSize - 6;
    const logoY = headerTop;

    let logoUrl = null;
    if (companyInfo.logo && companyInfo.logo !== "invoice/empty.png") {
      logoUrl = `${host}/img/${companyInfo.logo}`;
    }

    if (logoUrl) {
      try {
        doc.addImage(logoUrl, "PNG", logoX, logoY, logoSize, logoSize);
      } catch {
        doc.setFillColor(220, 220, 240);
        doc.rect(logoX, logoY, logoSize, logoSize, "F");
        doc.setFontSize(9);
        doc.text("LOGO", logoX + 10, logoY + 40);
      }
    }

    /* Company Name */
    const headerX = margin + 14;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(40, 40, 60);
    doc.text(
      companyInfo.company_name || "Deshmukh Infra Soft",
      headerX,
      headerTop + 18
    );

    /* Company Details */
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(70);

    let detailY = headerTop + 44;
    const lineHeight = 14;

    [
      companyInfo.land_mark || "Urali Kanchan, Pune",
      `Phone: ${companyInfo.phone_no || "9173635656"}`,
      `Email: ${companyInfo.email_id || "shreyas.gijare.21@gmail.com"}`,
      `GSTIN: ${companyInfo.gst_number || "Not Available"}`,
    ].forEach((line) => {
      if (line) {
        doc.text(line, headerX, detailY);
        detailY += lineHeight;
      }
    });

    /* Separator */
    const separatorY = detailY + 8;
    doc.setLineWidth(1);
    doc.setDrawColor(0, 0, 0);
    doc.line(
      margin + 6,
      separatorY,
      pageWidth - margin - 6,
      separatorY
    );

    /* Title */
    const titleY = separatorY + 26;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text(
      "ALL VENDOR PAYMENT LOGS",
      pageWidth / 2,
      titleY,
      { align: "center" }
    );

    /* Project + Date */
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(60);
    doc.text(
      `Project: ${searchQuery}`,
      pageWidth / 2,
      titleY + 18,
      { align: "center" }
    );
    doc.text(
      `Generated on: ${new Date().toLocaleString("en-GB")}`,
      pageWidth / 2,
      titleY + 34,
      { align: "center" }
    );

    return titleY + 56; // SAFE start Y
  };

  /* ================= HEADER CALL ================= */

  let startY = drawHeaderAndBorder();

  /* ================= TABLE DATA ================= */

  const body = [];
  let grandTotal = 0,
    grandPaid = 0,
    grandBalance = 0;

  payments.forEach((p) => {
    const vendor = p.purchase?.vendor?.name || "Unknown";
    const material = p.purchase?.material_name || "-";
    const total = Number(p.amount || 0);
    const paid = Number(p.paid_amount || 0);
    const balance = Number(p.balance_amount || 0);

    grandTotal += total;
    grandPaid += paid;
    grandBalance += balance;

    body.push([
      {
        content: `Vendor: ${vendor} | Material: ${material}`,
        colSpan: 6,
        styles: {
          fontStyle: "bold",
          fillColor: [230, 240, 255],
          fontSize: 10,
          textColor: [20, 40, 90],
        },
      },
      { content: total.toFixed(2), styles: { fontStyle: "bold", halign: "right" } },
      { content: paid.toFixed(2), styles: { fontStyle: "bold", halign: "right" } },
      {
        content: balance.toFixed(2),
        styles: {
          fontStyle: "bold",
          halign: "right",
          fillColor: balance === 0 ? [220, 255, 220] : [255, 230, 230],
        },
      },
    ]);

    if (p.logs?.length > 0) {
      p.logs.forEach((log, i) => {
        body.push([
          i + 1,
          log.paid_by || "-",
          log.payment_type || "-",
          Number(log.amount).toFixed(2),
          new Date(log.payment_date).toLocaleDateString("en-GB"),
          (log.description || "-").substring(0, 40) +
            (log.description?.length > 40 ? "..." : ""),
          "",
          "",
          "",
        ]);
      });
    } else {
      body.push([
        {
          content: "No payments yet",
          colSpan: 6,
          styles: { fontStyle: "italic", textColor: [150, 150, 150] },
        },
        "",
        "",
        "",
      ]);
    }

    body.push(["", "", "", "", "", "", "", "", ""]);
  });

  body.push([
    { content: "GRAND TOTAL", colSpan: 6, styles: { fontStyle: "bold", fillColor: [200, 230, 200] } },
    { content: grandTotal.toFixed(2), styles: { fontStyle: "bold", halign: "right" } },
    { content: grandPaid.toFixed(2), styles: { fontStyle: "bold", halign: "right" } },
    {
      content: grandBalance.toFixed(2),
      styles: {
        fontStyle: "bold",
        halign: "right",
        fillColor: grandBalance === 0 ? [180, 255, 180] : [255, 180, 180],
      },
    },
  ]);

  /* ================= TABLE ================= */

  doc.autoTable({
    head: [["No.", "Paid By", "Type", "Amount", "Date", "Description", "Total", "Paid", "Balance"]],
    body,
    startY,

    tableWidth: contentWidth,          // 🔒 stays inside border
    margin: {
      left: contentLeft,
      right: margin + innerPadding,
    },

    theme: "grid",

    styles: {
      fontSize: 8.5,
      cellPadding: 2.5,
      lineColor: [180, 180, 180],
      lineWidth: 0.1,
    },

    headStyles: {
      fillColor: [30, 100, 180],
      textColor: 255,
      fontStyle: "bold",
      fontSize: 9,
    },

    didDrawPage: () => {
      drawHeaderAndBorder();
    },
  });

  /* ================= SAVE ================= */

  doc.save(
    `All_Logs_${searchQuery.replace(/[^a-zA-Z0-9]/g, "_")}_${Date.now()}.pdf`
  );
};







export const exportAllLogsToExcel = (payments, searchQuery) => {
  const rows = [];
  let grandTotal = 0,
    grandPaid = 0,
    grandBalance = 0;

  payments.forEach((p) => {
    const vendor = p.purchase?.vendor?.name || "Unknown";
    const material = p.purchase?.material_name || "-";
    const total = parseFloat(p.amount);
    const paid = parseFloat(p.paid_amount);
    const balance = parseFloat(p.balance_amount);

    grandTotal += total;
    grandPaid += paid;
    grandBalance += balance;

    rows.push({
      "Vendor → Material": `${vendor} → ${material}`,
      "#": "", "Paid By": "", "Type": "", "Amount": "", "Payment Date": "", "Description": "",
      Total: total.toFixed(2), Paid: paid.toFixed(2), Balance: balance.toFixed(2),
    });

    if (p.logs?.length > 0) {
      p.logs.forEach((log, i) => {
        rows.push({
          "Vendor → Material": "",
          "#": i + 1,
          "Paid By": log.paid_by || "-",
          "Type": log.payment_type || "-",
          "Amount": parseFloat(log.amount).toFixed(2),
          "Payment Date": new Date(log.payment_date).toLocaleDateString("en-GB"),
          "Description": log.description || "-",
          Total: "", Paid: "", Balance: "",
        });
      });
    } else {
      rows.push({ 
        "Vendor → Material": "", 
        "#": "", 
        "Paid By": "No payments yet", 
        Total: "", 
        Paid: "", 
        Balance: "" 
      });
    }

    rows.push({}); // spacer
  });

  rows.push({
    "Vendor → Material": "GRAND TOTAL",
    Total: grandTotal.toFixed(2),
    Paid: grandPaid.toFixed(2),
    Balance: grandBalance.toFixed(2),
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([]);

  const timestamp = new Date().toLocaleString("en-GB", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit"
  });

  XLSX.utils.sheet_add_aoa(ws, [
    ["All Vendor Payment Logs (Detailed)"],
    [`Project: ${searchQuery}`],
    [`Generated on: ${timestamp}`],
    [],
  ], { origin: "A1" });

  XLSX.utils.sheet_add_json(ws, rows, { origin: "A5", skipHeader: false });

  ws["!cols"] = [
    { wch: 40 }, // Vendor → Material
    { wch: 8 },  // #
    { wch: 25 }, // Paid By
    { wch: 15 }, // Type
    { wch: 15 }, // Amount
    { wch: 18 }, // Payment Date
    { wch: 35 }, // Description
    { wch: 15 }, // Total
    { wch: 15 }, // Paid
    { wch: 15 }, // Balance
  ];
  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 9 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 9 } },
  ];

  XLSX.utils.book_append_sheet(wb, ws, "All Payment Logs");
  XLSX.writeFile(wb, `all-payment-logs-${searchQuery.replace(/\s+/g, "-")}-${Date.now()}.xlsx`);
};

/* =================================================================== */
/* 3. Single Vendor Logs - PDF & Excel                                 */
/* =================================================================== */

// export const downloadPDF = (logsData) => {
//   const doc = new jsPDF("landscape");

//   // Title
//   doc.setFontSize(20);
//   doc.setFont(undefined, 'bold');
//   doc.text("Vendor Payment Report", 14, 18);
  
//   // Project name
//   doc.setFontSize(13);
//   doc.setFont(undefined, 'normal');
//   doc.text(`Project: ${logsData.vendor_details?.project?.project_name || 'N/A'}`, 14, 28);
  
//   // Generated timestamp
//   const timestamp = new Date().toLocaleString('en-GB', { 
//     day: '2-digit', 
//     month: '2-digit', 
//     year: 'numeric',
//     hour: '2-digit',
//     minute: '2-digit',
//     second: '2-digit'
//   });
//   doc.setFontSize(11);
//   doc.text(`Generated: ${timestamp}`, 14, 36);

//   // Extract values - NOTE: qty and price_per_unit come from the purchase object in backend
//   const vendorName = logsData.vendor_details?.vendor_name || 'N/A';
//   const materialName = logsData.vendor_details?.material_name || 'N/A';
  
//   // Try multiple possible paths for qty and price_per_unit
//   const qty = parseFloat(
//     logsData.purchase?.qty || 
//     logsData.vendor_details?.qty || 
//     0
//   ).toFixed(2);
  
//   const pricePerUnit = parseFloat(
//     logsData.purchase?.price_per_unit || 
//     logsData.vendor_details?.price_per_unit || 
//     0
//   ).toFixed(2);
  
//   const totalAmount = parseFloat(logsData.payment_master?.total_amount || 0).toFixed(2);
//   const paidAmount = parseFloat(logsData.payment_master?.paid_amount || 0).toFixed(2);
//   const balanceAmount = parseFloat(logsData.payment_master?.balance_amount || 0).toFixed(2);

//   // Summary table - properly formatted
//   const summaryData = [
//     ['Vendor:', vendorName, 'Material:', materialName],
//     ['Qty:', qty, 'Price/Unit:', `Rs ${pricePerUnit}`],
//     ['Total:', `Rs ${totalAmount}`, 'Paid:', `Rs ${paidAmount}`],
//     ['Balance:', `Rs ${balanceAmount}`, '', '']
//   ];

//   doc.autoTable({
//     body: summaryData,
//     startY: 44,
//     theme: 'grid',
//     styles: { 
//       fontSize: 11,
//       cellPadding: 4,
//       lineColor: [200, 200, 200],
//       lineWidth: 0.1,
//     },
//     columnStyles: {
//       0: { cellWidth: 35, fontStyle: 'bold', fillColor: [240, 240, 240] },
//       1: { cellWidth: 65 },
//       2: { cellWidth: 35, fontStyle: 'bold', fillColor: [240, 240, 240] },
//       3: { cellWidth: 65 }
//     }
//   });

//   // Payment logs table
//   const tableData = logsData.payment_logs?.map((log, i) => [
//     i + 1,
//     log.paid_by || '-',
//     log.payment_type || '-',
//     `Rs ${Number(log.amount || 0).toFixed(2)}`,
//     new Date(log.payment_date).toLocaleDateString("en-GB"),
//     log.description || "-",
//   ]) || [];

//   doc.autoTable({
//     head: [["No.", "Paid By", "Type", "Amount", "Date", "Description"]],
//     body: tableData,
//     startY: doc.lastAutoTable.finalY + 8,
//     theme: "grid",
//     headStyles: { 
//       fillColor: [52, 152, 219],
//       textColor: 255,
//       fontSize: 11,
//       fontStyle: 'bold',
//       halign: 'center'
//     },
//     bodyStyles: {
//       fontSize: 10
//     },
//     styles: {
//       lineColor: [200, 200, 200],
//       lineWidth: 0.1,
//     },
//     columnStyles: {
//       0: { cellWidth: 15, halign: 'center' },
//       1: { cellWidth: 45 },
//       2: { cellWidth: 30, halign: 'center' },
//       3: { cellWidth: 35, halign: 'right' },
//       4: { cellWidth: 30, halign: 'center' },
//       5: { cellWidth: 85 }
//     },
//     alternateRowStyles: { fillColor: [245, 245, 245] },
//   });

//   const fileName = `Vendor_Payment_${vendorName.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
//   doc.save(fileName);
// };





export const downloadPDF = (logsData) => {
  const doc = new jsPDF("landscape", "pt", "a4");

  /* ================= PAGE SETUP ================= */

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const margin = 40;          // outer border
  const innerPadding = 12;    // inside border spacing

  const contentLeft = margin + innerPadding;
  const contentRight = pageWidth - margin - innerPadding;
  const contentWidth = contentRight - contentLeft;

  const user = getUserData();
  const companyInfo = user?.company_info || {};

  /* ================= HEADER + BORDER ================= */

  const drawHeaderAndBorder = () => {
    /* Outer Border */
    doc.setDrawColor(80);
    doc.setLineWidth(0.6);
    doc.rect(
      margin,
      margin,
      pageWidth - margin * 2,
      pageHeight - margin * 2
    );

    /* Logo */
    const logoSize = 75;
    const headerTop = margin + 18;
    const logoX = pageWidth - margin - logoSize - 8;
    const logoY = headerTop;

    let logoUrl = null;
    if (companyInfo.logo && companyInfo.logo !== "invoice/empty.png") {
      logoUrl = `${host}/img/${companyInfo.logo}`;
    }

    if (logoUrl) {
      try {
        doc.addImage(logoUrl, "PNG", logoX, logoY, logoSize, logoSize);
      } catch {
        doc.setFillColor(220);
        doc.rect(logoX, logoY, logoSize, logoSize, "F");
      }
    }

    /* Company Name */
    const headerX = margin + 14;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 60);
    doc.text(
      companyInfo.company_name || "Deshmukh Infra Soft",
      headerX,
      headerTop + 18
    );

    /* Company Details */
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(70);

    let detailY = headerTop + 38;
    const lineHeight = 14;

    [
      companyInfo.land_mark || "Urali Kanchan, Pune",
      `Phone: ${companyInfo.phone_no || "9173635656"}`,
      `Email: ${companyInfo.email_id || "shreyas.gijare.21@gmail.com"}`,
      `GSTIN: ${companyInfo.gst_number || "Not Available"}`
    ].forEach((line) => {
      if (line) {
        doc.text(line, headerX, detailY);
        detailY += lineHeight;
      }
    });

    /* Separator */
    const separatorY = detailY + 8;
    doc.setLineWidth(1);
    doc.setDrawColor(0);
    doc.line(
      margin + 6,
      separatorY,
      pageWidth - margin - 6,
      separatorY
    );

    /* Report Title */
    const titleY = separatorY + 24;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(17);
    doc.setTextColor(0);
    doc.text(
      "VENDOR PAYMENT REPORT",
      pageWidth / 2,
      titleY,
      { align: "center" }
    );

    /* Project + Generated Date */
    const timestamp = new Date().toLocaleString("en-GB");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(60);
    doc.text(
      `Project: ${logsData.vendor_details?.project?.project_name || "N/A"}`,
      pageWidth / 2,
      titleY + 18,
      { align: "center" }
    );
    doc.text(
      `Generated: ${timestamp}`,
      pageWidth / 2,
      titleY + 34,
      { align: "center" }
    );

    return titleY + 54; // SAFE start Y
  };

  /* ================= HEADER CALL ================= */

  let startY = drawHeaderAndBorder();

  /* ================= SUMMARY DATA ================= */

  const vendorName = logsData.vendor_details?.vendor_name || "N/A";
  const materialName = logsData.vendor_details?.material_name || "N/A";

  const qty = parseFloat(
    logsData.purchase?.qty ||
    logsData.vendor_details?.qty ||
    0
  ).toFixed(2);

  const pricePerUnit = parseFloat(
    logsData.purchase?.price_per_unit ||
    logsData.vendor_details?.price_per_unit ||
    0
  ).toFixed(2);

  const totalAmount = parseFloat(logsData.payment_master?.total_amount || 0).toFixed(2);
  const paidAmount = parseFloat(logsData.payment_master?.paid_amount || 0).toFixed(2);
  const balanceAmount = parseFloat(logsData.payment_master?.balance_amount || 0).toFixed(2);

  const summaryData = [
    ["Vendor", vendorName, "Material", materialName],
    ["Qty", qty, "Price / Unit", `${pricePerUnit}`],
    ["Total", `${totalAmount}`, "Paid", `${paidAmount}`],
    ["Balance", `${balanceAmount}`, "", ""],
  ];

  /* ================= SUMMARY TABLE ================= */

  doc.autoTable({
    body: summaryData,
    startY,
    tableWidth: contentWidth,
    margin: { left: contentLeft, right: contentLeft },
    theme: "grid",
    styles: {
      fontSize: 11,
      cellPadding: 6,
      lineColor: [200, 200, 200],
      lineWidth: 0.1,
    },
    columnStyles: {
      0: { fontStyle: "bold", fillColor: [240, 240, 240] },
      2: { fontStyle: "bold", fillColor: [240, 240, 240] },
    },
    didDrawPage: () => drawHeaderAndBorder(),
  });

  /* ================= PAYMENT LOGS TABLE ================= */

  const tableData = logsData.payment_logs?.map((log, i) => [
    i + 1,
    log.paid_by || "-",
    log.payment_type || "-",
    `${Number(log.amount || 0).toFixed(2)}`,
    new Date(log.payment_date).toLocaleDateString("en-GB"),
    log.description || "-",
  ]) || [];

  doc.autoTable({
    head: [["No.", "Paid By", "Type", "Amount", "Date", "Description"]],
    body: tableData,
    startY: doc.lastAutoTable.finalY + 10,
    tableWidth: contentWidth,
    margin: { left: contentLeft, right: contentLeft },
    theme: "grid",
    headStyles: {
      fillColor: [52, 152, 219],
      textColor: 255,
      fontStyle: "bold",
      fontSize: 11,
      halign: "center",
    },
    styles: {
      fontSize: 10,
      cellPadding: 4,
      lineColor: [200, 200, 200],
      lineWidth: 0.1,
    },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    didDrawPage: () => drawHeaderAndBorder(),
  });

  /* ================= SAVE ================= */

  const fileName = `Vendor_Payment_${vendorName.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
  doc.save(fileName);
};




export const downloadExcel = (logsData) => {
  const data = [];
  const qty = parseFloat(logsData.vendor_details.qty || 0);
  const pricePerUnit = parseFloat(logsData.vendor_details.price_per_unit || 0);

  data.push(["Vendor Payment Report"], [], [`Project: ${logsData.vendor_details.project.project_name}`], [`Generated: ${new Date().toLocaleString()}`], []);
  data.push([
    `Vendor: ${logsData.vendor_details.vendor_name}`,
    `Material: ${logsData.vendor_details.material_name}`,
    `Qty: ${qty.toFixed(2)}`,
    `Price/Unit: ${pricePerUnit.toFixed(2)}`,
    `Total: ${logsData.payment_master.total_amount}`,
    `Paid: ${logsData.payment_master.paid_amount}`,
    `Balance: ${logsData.payment_master.balance_amount}`,
  ]);
  data.push([], ["No.", "Paid By", "Type", "Amount", "Date", "Description"]);

  logsData.payment_logs.forEach((log, i) => {
    data.push([
      i + 1,
      log.paid_by,
      log.payment_type,
      Number(log.amount).toFixed(2),
      new Date(log.payment_date).toLocaleDateString("en-GB"),
      log.description || "-",
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(data);
  ws["!cols"] = [{ wch: 8 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 40 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Vendor Logs");
  XLSX.writeFile(wb, `Vendor_Payment_${logsData.vendor_details.vendor_name.replace(/\s+/g, "_")}.xlsx`);
};

// import {
//   exportToPDF,
//   exportToExcel,
//   exportAllLogsToPDF,
//   exportAllLogsToExcel,
//   downloadPDF,
//   downloadExcel,
// } from "./exportHelpers";