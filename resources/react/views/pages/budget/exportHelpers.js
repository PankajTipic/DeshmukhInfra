// src/components/purchase-vendor/exportHelpers.js
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

/* =================================================================== */
/* 1. Summary Report - PDF & Excel (Main Table)                        */
/* =================================================================== */

export const exportToPDF = (payments, searchQuery) => {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(22).setFont(undefined, "bold").text("Purchase Vendor Payments Report", 14, 20);
  doc.setFontSize(14).setFont(undefined, "normal").text(`Project: ${searchQuery}`, 14, 32);
  doc.setFontSize(12).text(
    `Generated on: ${new Date().toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })}`,
    14,
    42
  );

  const tableColumn = ["Vendor Name", "Total", "Paid", "Balance", "Status", "Created"];
  const tableRows = [];
  let totalAmount = 0,
    totalPaid = 0,
    totalBalance = 0;

  payments.forEach((p) => {
    const amount = parseFloat(p.amount);
    const paid = parseFloat(p.paid_amount);
    const balance = parseFloat(p.balance_amount);
    const percentage = paid / amount;
    const status = percentage === 0 ? "Unpaid" : percentage === 1 ? "Paid" : "Partial";

    totalAmount += amount;
    totalPaid += paid;
    totalBalance += balance;

    tableRows.push([
      p?.purchase?.vendor?.name || "-",
      amount.toFixed(2),
      paid.toFixed(2),
      balance.toFixed(2),
      status,
      new Date(p.created_at).toLocaleDateString("en-GB"),
    ]);
  });

  tableRows.push(["Total:", totalAmount.toFixed(2), totalPaid.toFixed(2), totalBalance.toFixed(2), "", ""]);

  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 52,
    theme: "grid",
    styles: { fontSize: 10, cellPadding: 4, lineColor: [44, 62, 80], lineWidth: 0.1 },
    headStyles: { fillColor: [52, 152, 219], textColor: [255, 255, 255], fontStyle: "bold", halign: "center", fontSize: 11 },
    columnStyles: {
      0: { cellWidth: 45, halign: "left" },
      1: { cellWidth: 28, halign: "right" },
      2: { cellWidth: 28, halign: "right" },
      3: { cellWidth: 28, halign: "right" },
      4: { cellWidth: 25, halign: "center" },
      5: { cellWidth: 30, halign: "center" },
    },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    didParseCell: (data) => {
      if (data.row.index === tableRows.length - 1) {
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.fillColor = [220, 230, 241];
      }
    },
  });

  doc.save(`vendor-payments-${searchQuery.replace(/\s+/g, "-")}-${Date.now()}.pdf`);
};

export const exportToExcel = (payments, searchQuery) => {
  let totalAmount = 0,
    totalPaid = 0,
    totalBalance = 0;

  const worksheetData = payments.map((p) => {
    const amount = parseFloat(p.amount);
    const paid = parseFloat(p.paid_amount);
    const balance = parseFloat(p.balance_amount);
    const percentage = paid / amount;
    const status = percentage === 0 ? "Unpaid" : percentage === 1 ? "Paid" : "Partial";

    totalAmount += amount;
    totalPaid += paid;
    totalBalance += balance;

    return {
      "Vendor Name": p?.purchase?.vendor?.name || "-",
      Total: amount.toFixed(2),
      Paid: paid.toFixed(2),
      Balance: balance.toFixed(2),
      Status: status,
      Created: new Date(p.created_at).toLocaleDateString("en-GB"),
    };
  });

  worksheetData.push({
    "Vendor Name": "Total:",
    Total: totalAmount.toFixed(2),
    Paid: totalPaid.toFixed(2),
    Balance: totalBalance.toFixed(2),
    Status: "",
    Created: "",
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
  const columns = ["A", "B", "C", "D", "E", "F"];
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

  ws["!cols"] = [{ wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 18 }];
  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 5 } },
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Payments");
  XLSX.writeFile(wb, `vendor-payments-${searchQuery.replace(/\s+/g, "-")}-${Date.now()}.xlsx`);
};

/* =================================================================== */
/* 2. All Logs Report - PDF & Excel (Detailed with Payment History)   */
/* =================================================================== */

export const exportAllLogsToPDF = (payments, searchQuery) => {
  const doc = new jsPDF("landscape");

  doc.setFontSize(18).setFont("helvetica", "bold").text("All Vendor Payment Logs", 14, 15);
  doc.setFontSize(12).setFont("helvetica", "normal").text(`Project: ${searchQuery}`, 14, 23);
  doc.setFontSize(10).text(`Generated: ${new Date().toLocaleString("en-GB")}`, 14, 30);

  const body = [];
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

    body.push([
      {
        content: `Vendor: ${vendor} | Material: ${material}`,
        colSpan: 6,
        styles: { fontStyle: "bold", fillColor: [230, 240, 255], fontSize: 11, textColor: [20, 40, 90] },
      },
      { content: total.toFixed(2), styles: { fontStyle: "bold", halign: "right" } },
      { content: paid.toFixed(2), styles: { fontStyle: "bold", halign: "right" } },
      {
        content: balance.toFixed(2),
        styles: { fontStyle: "bold", halign: "right", fillColor: balance === 0 ? [220, 255, 220] : [255, 230, 230] },
      },
    ]);

    if (p.logs?.length > 0) {
      p.logs.forEach((log, i) => {
        body.push([
          i + 1,
          log.paid_by || "-",
          log.payment_type || "-",
          parseFloat(log.amount).toFixed(2),
          new Date(log.payment_date).toLocaleDateString("en-GB"),
          (log.description || "-").substring(0, 40) + (log.description?.length > 40 ? "..." : ""),
          "", "", "",
        ]);
      });
    } else {
      body.push([{ content: "No payments yet", colSpan: 6, styles: { fontStyle: "italic", textColor: [150, 150, 150] } }, "", "", ""]);
    }

    body.push(["", "", "", "", "", "", "", "", ""]);
  });

  body.push([
    { content: "GRAND TOTAL", colSpan: 6, styles: { fontStyle: "bold", fillColor: [200, 230, 200], fontSize: 11 } },
    { content: grandTotal.toFixed(2), styles: { fontStyle: "bold", halign: "right" } },
    { content: grandPaid.toFixed(2), styles: { fontStyle: "bold", halign: "right" } },
    {
      content: grandBalance.toFixed(2),
      styles: { fontStyle: "bold", halign: "right", fillColor: grandBalance === 0 ? [180, 255, 180] : [255, 180, 180] },
    },
  ]);

  doc.autoTable({
    head: [["No.", "Paid By", "Type", "Amount", "Date", "Description", "Total", "Paid", "Balance"]],
    body,
    startY: 35,
    theme: "grid",
    styles: { fontSize: 8.5, cellPadding: 2.5, lineColor: [180, 180, 180], lineWidth: 0.1 },
    headStyles: { fillColor: [30, 100, 180], textColor: 255, fontStyle: "bold", fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 12 }, 1: { cellWidth: 32 }, 2: { cellWidth: 22 }, 3: { cellWidth: 24 },
      4: { cellWidth: 26 }, 5: { cellWidth: 78 }, 6: { cellWidth: 28, halign: "right" },
      7: { cellWidth: 28, halign: "right" }, 8: { cellWidth: 28, halign: "right" },
    },
    margin: { top: 35, left: 8, right: 8 },
  });

  doc.save(`All_Logs_${searchQuery.replace(/[^a-zA-Z0-9]/g, "_")}_${Date.now()}.pdf`);
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
      rows.push({ "Vendor → Material": "", "#": "", "Paid By": "No payments yet", Total: "", Paid: "", Balance: "" });
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

  ws["!cols"] = [{ wch: 40 }, { wch: 8 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 18 }, { wch: 35 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
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

export const downloadPDF = (logsData) => {
  const doc = new jsPDF("landscape");

  doc.setFontSize(18).text("Vendor Payment Report", 14, 15);
  doc.setFontSize(12).text(`Project: ${logsData.vendor_details.project.project_name}`, 14, 25);
  doc.setFontSize(10).text(`Generated: ${new Date().toLocaleString()}`, 14, 32);

  const info = [[
    `Vendor: ${logsData.vendor_details.vendor_name}`,
    `Material: ${logsData.vendor_details.material_name}`,
    `Total: ${logsData.payment_master.total_amount}`,
    `Paid: ${logsData.payment_master.paid_amount}`,
    `Balance: ${logsData.payment_master.balance_amount}`,
  ]];

  doc.autoTable({ body: info, startY: 40, theme: "plain", columnStyles: { 0: { cellWidth: 70 }, 1: { cellWidth: 70 }, 2: { cellWidth: 35 }, 3: { cellWidth: 35 }, 4: { cellWidth: 35 } } });

  const tableData = logsData.payment_logs.map((log, i) => [
    i + 1,
    log.paid_by,
    log.payment_type,
    Number(log.amount).toFixed(2),
    new Date(log.payment_date).toLocaleDateString("en-GB"),
    log.description || "-",
  ]);

  doc.autoTable({
    head: [["No.", "Paid By", "Type", "Amount", "Date", "Description"]],
    body: tableData,
    startY: doc.lastAutoTable.finalY + 10,
    headStyles: { fillColor: [0, 72, 144], textColor: "#fff" },
    alternateRowStyles: { fillColor: [240, 248, 255] },
  });

  doc.save(`Vendor_Payment_${logsData.vendor_details.vendor_name.replace(/\s+/g, "_")}.pdf`);
};

export const downloadExcel = (logsData) => {
  const data = [];
  data.push(["Vendor Payment Report"], [], [`Project: ${logsData.vendor_details.project.project_name}`], [`Generated: ${new Date().toLocaleString()}`], []);
  data.push([
    `Vendor: ${logsData.vendor_details.vendor_name}`,
    `Material: ${logsData.vendor_details.material_name}`,
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