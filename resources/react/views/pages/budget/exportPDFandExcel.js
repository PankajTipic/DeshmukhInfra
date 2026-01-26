// src/utils/exportPDFandExcel.js
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import html2pdf from "html2pdf.js";
import { getUserData } from "../../../util/session";
import { host } from "../../../util/constants";

// Helper: Format currency
const formatCurrency = (value) => {
  return  Number(value || 0);
};








// exportPDFandExcel.js  (or wherever you keep these functions)


export const exportToPDF = async (data) => {
  if (!data || !data.projects || data.projects.length === 0) {
    alert("No data available to export");
    return;
  }

  // Get company data dynamically
  const userData = getUserData(); // must be available in scope
  const company = userData?.company_info || {};
  
  const companyName    = company.company_name || "Deshmukh Infra Soft";
  const companyPhone   = company.phone_no    || "9173635656";
  const companyEmail   = company.email_id    || "shreyas.gijare.21@gmail.com";
  const companyAddress = `${company.land_mark || "Urali Kanchan"}, ${company.Dist || "Pune"}`.trim();
  // const logoUrl        = company.logo; // e.g. "invoice/175228-apple-touch-icon.png" or full URL
  const  logoUrl = `${host}/img/${company.logo}`;
  
  

  const doc = new jsPDF("portrait", "pt", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 36;
  const contentWidth = pageWidth - margin * 2;

  const safeSum = (arr, keyPath) => {
    return (arr || []).reduce((sum, item) => {
      const val = keyPath.split(".").reduce((o, k) => (o || {})[k], item);
      return sum + (Number(val) || 0);
    }, 0);
  };

  const formatAmount = (val) => {
    const num = Number(val) || 0;
    return num.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Helper to load image from URL and convert to base64
  const loadImageToBase64 = (url) => {
    return new Promise((resolve, reject) => {
      if (!url || typeof url !== 'string' || url.trim() === '') {
        reject(new Error("No valid logo URL"));
        return;
      }

      const img = new Image();
      img.crossOrigin = "Anonymous"; // Helps with CORS (may still fail on some servers)

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png")); // or "image/jpeg" if preferred
      };

      img.onerror = (err) => {
        console.error("Logo load failed:", err);
        reject(err);
      };

      img.src = url; // can be relative or absolute URL
    });
  };

  // ─── Header function (now async) ───
  const drawPageHeader = async (pageNum, isFirst = false) => {
    doc.setDrawColor(60);
    doc.setLineWidth(0.7);
    doc.rect(margin - 2, margin - 2, pageWidth - (margin - 2) * 2, pageHeight - (margin - 2) * 2);

    let y = margin + 20;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(30, 30, 80);
    doc.text(companyName, margin + 8, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(70);
    y += 14;
    doc.text(companyAddress, margin + 8, y);
    y += 12;
    doc.text(`Phone: ${companyPhone}`, margin + 8, y);
    y += 12;
    doc.text(`Email: ${companyEmail}`, margin + 8, y);

    // Logo section
    const logoSize = 48;
    const logoX = pageWidth - margin - logoSize - 6;
    const logoY = margin + 6;

    doc.setFillColor(230, 230, 245);
    doc.rect(logoX, logoY, logoSize, logoSize, "F");

    if (logoUrl) {
      try {
        const base64Image = await loadImageToBase64(logoUrl);
        doc.addImage(
          base64Image,
          "PNG",                // change to "JPEG" if your logo is JPEG
          logoX + 2,            // small padding
          logoY + 2,
          logoSize - 4,
          logoSize - 4
        );
      } catch (err) {
        // Fallback when image fails to load
        doc.setFontSize(8);
        doc.setTextColor(110);
        doc.text("LOGO", logoX + logoSize / 2, logoY + logoSize / 2 + 3, { align: "center" });
      }
    } else {
      // No logo provided
      doc.setFontSize(8);
      doc.setTextColor(110);
      doc.text("NO LOGO", logoX + logoSize / 2, logoY + logoSize / 2 + 3, { align: "center" });
    }
    

    y += 18;
    doc.setLineWidth(1);
    doc.setDrawColor(0);
    doc.line(margin + 4, y, pageWidth - margin - 4, y);
    y += 14;

    let nextY = y;
    if (isFirst) {
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0);
      doc.text("VENDOR PURCHASE & PAYMENT REPORT", pageWidth / 2, nextY + 4, { align: "center" });
      nextY += 28;

      doc.setFontSize(9.5);
      doc.setFont("helvetica", "normal");
      const vendorStr = `Vendor: ${vendorName} (ID: ${vendorId}) • Mobile: ${vendorMobile} • ${vendorAddress}`;
      const lines = doc.splitTextToSize(vendorStr, contentWidth - 20);
      doc.text(lines, margin + 10, nextY + 4);
      nextY += lines.length * 11 + 10;

      doc.setFont("helvetica", "bold");
      const summaryStr = `Total: ${formatAmount(grandTotal)} Paid: ${formatAmount(grandPaid)} Balance: ${formatAmount(grandBalance)}`;
      doc.text(summaryStr, pageWidth / 2, nextY + 4, { align: "center" });
      nextY += 26;
    } else {
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Vendor Purchase & Payment Report (continued)", margin + 8, nextY + 4);
      nextY += 22;
    }

    doc.setFontSize(8);
    doc.setTextColor(90);
    doc.text(`Page ${pageNum}`, pageWidth - margin - 30, pageHeight - 18, { align: "right" });

    return nextY;
  };

  // ─── Vendor & totals preparation ───
  const vendor = data.vendor_details || {};
  const vendorName    = vendor.vendor_name || "—";
  const vendorId      = vendor.vendor_id   || "—";
  const vendorMobile  = vendor.mobile      || "—";
  const vendorAddress = vendor.address     || "—";

  let grandTotal = 0, grandPaid = 0, grandBalance = 0;
  data.projects.forEach(p => {
    grandTotal += safeSum(p.purchases || [], "purchase_details.total");
    grandPaid  += safeSum(p.purchases || [], "payment_master.paid_amount");
    grandBalance += safeSum(p.purchases || [], "payment_master.balance_amount");
  });

  let y = await drawPageHeader(1, true);

  // ─── Projects loop ───
  for (const project of data.projects) {
    const projName = project.project_details?.project_name || "Unnamed Project";
    const projId   = project.project_details?.project_id   || "—";

    if (y > pageHeight - 240) {
      doc.addPage();
      y = await drawPageHeader(doc.internal.getCurrentPageInfo().pageNumber, false);
    }

    // Project header
    doc.setFillColor(225, 230, 245);
    doc.rect(margin + 4, y, contentWidth - 8, 26, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(30);
    doc.text(`Project: ${projName} (ID: ${projId})`, margin + 12, y + 17);
    y += 34;

    const head = [["Material", "Qty", "Rate", "Total", "GST", "Date", "Paid", "Balance"]];

    const tableWidth = contentWidth - 8;
    const colWidths = {
      0: tableWidth * 0.22,
      1: tableWidth * 0.06,
      2: tableWidth * 0.10,
      3: tableWidth * 0.10,
      4: tableWidth * 0.07,
      5: tableWidth * 0.12,
      6: tableWidth * 0.14,
      7: tableWidth * 0.19
    };

    const body = [];
    (project.purchases || []).forEach((pur, pIdx) => {
      const pd = pur.purchase_details || {};
      const pm = pur.payment_master || {};
      const logs = pur.payment_logs || [];

      body.push([
        pd.material_name || "—",
        pd.qty ?? "—",
        Number(pd.price_per_unit ?? 0).toFixed(2),
        Number(pd.total ?? 0).toFixed(2),
        pd.gst_included ? `${pd.gst_percent ?? 0}%` : "No GST",
        pd.date || "—",
        Number(pm.paid_amount ?? 0).toFixed(2),
        Number(pm.balance_amount ?? 0).toFixed(2)
      ]);

      if (logs.length > 0) {
        body.push([{
          content: "Payment History",
          colSpan: 8,
          styles: {
            fillColor: [255, 243, 224],
            textColor: [130, 60, 0],
            fontStyle: "bold",
            fontSize: 9,
            halign: "left",
            cellPadding: 5
          }
        }]);

        logs.forEach(log => {
          body.push([
            log.payment_date || "—",
            Number(log.amount ?? 0).toFixed(2),
            (log.payment_type || "—").toUpperCase(),
            log.paid_by || "—",
            log.remark || "—",
            "", "", ""
          ]);
        });
      } else {
        body.push([{
          content: "No payment transactions recorded",
          colSpan: 8,
          styles: {
            fontStyle: "italic",
            textColor: [140, 140, 140],
            fontSize: 8,
            fillColor: [248, 248, 248],
            halign: "center",
            cellPadding: 6
          }
        }]);
      }

      if (pIdx < (project.purchases?.length || 1) - 1) {
        body.push([{ content: "", colSpan: 8, styles: { minCellHeight: 12, fillColor: [255,255,255] } }]);
      }
    });

    const pTotal   = safeSum(project.purchases || [], "purchase_details.total");
    const pPaid    = safeSum(project.purchases || [], "payment_master.paid_amount");
    const pBalance = safeSum(project.purchases || [], "payment_master.balance_amount");

    body.push([
      { content: "Project Total", colSpan: 3, styles: { halign: "right", fontStyle: "bold", fillColor: [255, 245, 210] } },
      { content: formatAmount(pTotal), styles: { halign: "right", fontStyle: "bold", fillColor: [255, 245, 210] } },
      { content: "", colSpan: 2, styles: { fillColor: [255, 245, 210] } },
      { content: formatAmount(pPaid), styles: { halign: "right", fontStyle: "bold", textColor: [0, 100, 0], fillColor: [255, 245, 210] } },
      { content: formatAmount(pBalance), styles: { halign: "right", fontStyle: "bold", textColor: [160, 0, 0], fillColor: [255, 245, 210] } }
    ]);

    doc.autoTable({
      startY: y,
      head: head,
      body: body,
      theme: "grid",
      styles: {
        fontSize: 8,
        cellPadding: 4,
        lineColor: [180,180,180],
        lineWidth: 0.35,
        overflow: "linebreak",
        cellWidth: "wrap"
      },
      headStyles: {
        fillColor: [235, 240, 250],
        textColor: 30,
        fontStyle: "bold",
        halign: "center",
        lineWidth: 0.5
      },
      columnStyles: {
        0: { cellWidth: colWidths[0] },
        1: { cellWidth: colWidths[1], halign: "center" },
        2: { cellWidth: colWidths[2], halign: "right" },
        3: { cellWidth: colWidths[3], halign: "right" },
        4: { cellWidth: colWidths[4], halign: "center" },
        5: { cellWidth: colWidths[5], halign: "center" },
        6: { cellWidth: colWidths[6], halign: "right" },
        7: { cellWidth: colWidths[7], halign: "left" }
      },
      margin: { left: margin + 4, right: margin + 4 },
      didParseCell: (data) => {
        if (data.section === "body" && data.row.index > 0) {
          const prevRow = body[data.row.index - 1];
          if (prevRow && prevRow[0]?.content === "Payment History") {
            data.cell.styles.fillColor = [255, 253, 240];
            if (data.column.index === 3 || data.column.index === 4) {
              data.cell.styles.halign = "left";
            }
          }
        }
      },
      willDrawPage: (hookData) => {
        const pageNum = doc.internal.getCurrentPageInfo().pageNumber;
        // Note: we can't await here, but since header is only drawn on new pages
        // and we await when adding pages manually, it should be fine in most cases
      },
      didDrawPage: (hookData) => {
        doc.setFontSize(8);
        doc.setTextColor(90);
        doc.text(`Generated: ${new Date().toLocaleString("en-IN")}`, margin + 8, pageHeight - 18);
      }
    });

    y = doc.lastAutoTable.finalY + 28;
  }

  // ─── Grand Total ───
  if (y > pageHeight - 140) {
    doc.addPage();
    y = await drawPageHeader(doc.internal.getCurrentPageInfo().pageNumber, false);
  }

  doc.autoTable({
    startY: y,
    body: [[
      { content: "GRAND TOTAL", colSpan: 3, styles: { halign: "right", fontStyle: "bold", fontSize: 10, fillColor: [220, 250, 230] } },
      { content: formatAmount(grandTotal), styles: { halign: "right", fontStyle: "bold", fontSize: 10, fillColor: [220, 250, 230] } },
      { content: "", colSpan: 2, styles: { fillColor: [220, 250, 230] } },
      { content: formatAmount(grandPaid), styles: { halign: "right", fontStyle: "bold", textColor: [0, 100, 0], fontSize: 10, fillColor: [220, 250, 230] } },
      { content: formatAmount(grandBalance), styles: { halign: "right", fontStyle: "bold", textColor: [160, 0, 0], fontSize: 10, fillColor: [220, 250, 230] } }
    ]],
    theme: "grid",
    styles: { lineColor: [160,160,160], lineWidth: 0.6 },
    columnStyles: {
      0: { cellWidth: 120 },
      1: { cellWidth: 54 },
      2: { cellWidth: 38 },
      3: { cellWidth: 58 },
      4: { cellWidth: 56 },
      5: { cellWidth: 56 },
      6: { cellWidth: 56 },
      7: { cellWidth: 56 }
    },
    margin: { left: margin + 4, right: margin + 4 }
  });

  const filename = `Vendor_Purchase_Payment_${vendorName.replace(/[^a-zA-Z0-9]/g, "_")}_${new Date().toISOString().slice(0,10)}.pdf`;
  doc.save(filename);
};








// Export to Excel
export const exportToExcel = (data) => {
  const wb = XLSX.utils.book_new();


    const safeSum = (arr, keyPath) => {
    return (arr || []).reduce((sum, item) => {
      const val = keyPath.split(".").reduce((o, k) => (o || {})[k], item);
      return sum + (Number(val) || 0);
    }, 0);
  };

  // Vendor Summary Sheet
  const summaryData = [
    ["Vendor Name", data.vendor_details?.vendor_name || "—"],
    ["Vendor ID", data.vendor_details?.vendor_id || "—"],
    ["Mobile", data.vendor_details?.mobile || "—"],
    ["Address", data.vendor_details?.address || "—"],
    [],
    ["Total Amount", formatCurrency(data.vendor_summary?.total_amount)],
    ["Paid Amount", formatCurrency(data.vendor_summary?.paid_amount)],
    ["Balance Due", formatCurrency(data.vendor_summary?.balance_amount)],
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, "Vendor Summary");

  // Projects + Purchases + Logs
  data.projects?.forEach((project, pIndex) => {
    const sheetName = `Project_${pIndex + 1}_${project.project_details?.project_name?.slice(0, 20) || "Unnamed"}`;

    const purchaseHeaders = [
      "Material", "Qty", "Rate", "Total", "GST", "Date", "Paid", "Balance"
    ];

    const purchaseRows = project.purchases?.map(p => [
      p.purchase_details?.material_name || "—",
      p.purchase_details?.qty ?? "—",
      formatCurrency(p.purchase_details?.price_per_unit),
      formatCurrency(p.purchase_details?.total),
      p.purchase_details?.gst_included ? `${p.purchase_details?.gst_percent ?? 0}%` : "No GST",
      p.purchase_details?.date || "—",
      formatCurrency(p.payment_master?.paid_amount),
      formatCurrency(p.payment_master?.balance_amount),
    ]) || [];

    // Add project total
    purchaseRows.push([
      "Project Total", "", "", formatCurrency(safeSum(project.purchases || [], "purchase_details.total")),
      "", "", formatCurrency(safeSum(project.purchases || [], "payment_master.paid_amount")),
      formatCurrency(safeSum(project.purchases || [], "payment_master.balance_amount"))
    ]);

    // Logs - grouped under each purchase
    const logRows = [];
    project.purchases?.forEach((purchase, idx) => {
      if (purchase.payment_logs?.length > 0) {
        logRows.push([`Logs for: ${purchase.purchase_details?.material_name || "Purchase " + (idx + 1)}`]);
        logRows.push(["Date", "Amount", "Mode", "Paid By", "Remark"]);
        purchase.payment_logs.forEach(log => {
          logRows.push([
            log.payment_date || "—",
            formatCurrency(log.amount),
            log.payment_type?.toUpperCase() || "—",
            log.paid_by || "—",
            log.remark || "—"
          ]);
        });
        logRows.push([]); // blank row separator
      }
    });

    const wsProject = XLSX.utils.aoa_to_sheet([
      [`Project: ${project.project_details?.project_name || "Unnamed"}`],
      [`Project ID: ${project.project_details?.project_id || "—"}`],
      [],
      purchaseHeaders,
      ...purchaseRows,
      [],
      ["Payment Logs"],
      ...logRows
    ]);

    XLSX.utils.book_append_sheet(wb, wsProject, sheetName);
  });

  XLSX.writeFile(wb, `Vendor_Ledger_Report_${data.vendor_details?.vendor_name || "Unknown"}_${new Date().toISOString().slice(0,10)}.xlsx`);
};

















export const formatAmount = (val) => {
  const num = Number(val) || 0;
  return num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};




export const exportDateWisePDF = (ledgerData, appliedStartDate = "", appliedEndDate = "") => {
  if (!ledgerData?.ledger_entries?.length) {
    alert("No ledger data to export");
    return;
  }

  const doc = new jsPDF('portrait', 'pt', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;

  // Get company & user data
  const userData = getUserData(); // your function
  const company = userData?.company_info || {};
  const user = userData?.user || {};

  const companyName    = company.company_name    || "Company Name";
  const phone          = company.phone_no        || "—";
  const email          = company.email_id        || "—";
  const addressParts   = [
    company.land_mark || "",
    company.Tal       || "",
    company.Dist      || "",
  ].filter(Boolean);
  const companyAddress = addressParts.length ? addressParts.join(", ") : "—";
  const logoPath       = `${host}/img/${company.logo}` || null;           // ← adjust if needed (path or URL)

  const formatAmount = (val) => {
    const num = Number(val) || 0;
    return num.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // ─────────────────────────────────────────────
  // HEADER + BORDER (every page) — matched to second example style
  // ─────────────────────────────────────────────
  const drawHeaderAndBorder = () => {
    // Outer page border
    doc.setDrawColor(60);
    doc.setLineWidth(0.7);
    doc.rect(margin - 2, margin - 2, pageWidth - (margin - 2) * 2, pageHeight - (margin - 2) * 2);

    let y = margin + 20;

    // Company info – left side (clean vertical stack like second code)
    const textX = margin + 8;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(30, 30, 80);
    doc.text(companyName, textX, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(70);
    y += 14;
    doc.text(companyAddress, textX, y);
    y += 12;
    doc.text(`Phone: ${phone}`, textX, y);
    y += 12;
    doc.text(`Email: ${email}`, textX, y);

    // Logo placeholder – top-right (similar size & position)
    const logoSize = 48;
    const logoX = pageWidth - margin - logoSize - 6;
    const logoY = margin + 6;

    doc.setFillColor(230, 230, 245);
    doc.rect(logoX, logoY, logoSize, logoSize, 'F');

    if (logoPath) {
       doc.addImage(logoPath, 'PNG', logoX + 2, logoY + 2, logoSize - 4, logoSize - 4);
      // ↑ uncomment + adjust when you have proper base64 / URL loading
      doc.setFontSize(8);
      doc.setTextColor(90);
      // doc.text("LOGO", logoX + logoSize/2, logoY + logoSize/2 + 3, { align: "center" });
    } else {
      doc.setFontSize(8);
      doc.setTextColor(110);
      doc.text("NO LOGO", logoX + logoSize/2, logoY + logoSize/2 + 3, { align: "center" });
    }

    // Separator line
    y += 18;
    doc.setLineWidth(1);
    doc.setDrawColor(0);
    doc.line(margin + 4, y, pageWidth - margin - 4, y);

    return y + 14; // return position after header for content to start
  };

  // Start first page
  let yPosition = drawHeaderAndBorder();

  // Report Title
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0);
  doc.text("VENDOR LEDGER REPORT (DATE-WISE)", pageWidth / 2, yPosition, { align: "center" });

  yPosition += 28;

  // ─────────────────────────────────────────────
  // VENDOR INFO → Single line / compact block
  // ─────────────────────────────────────────────
  const vendorName    = ledgerData.vendor_details?.vendor_name || "—";
  const vendorId      = ledgerData.vendor_details?.vendor_id   || "—";
  const vendorMobile  = ledgerData.vendor_details?.mobile      || "—";
  const vendorAddress = ledgerData.vendor_details?.address     || "—";

  const vendorInfoLine = `Vendor: ${vendorName} (ID: ${vendorId})  |  Mobile: ${vendorMobile}  |  Address: ${vendorAddress}`;

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30);

  const maxTextWidth = pageWidth - margin * 4;
  const vendorLines = doc.splitTextToSize(vendorInfoLine, maxTextWidth);

  doc.text(vendorLines, pageWidth / 2, yPosition, { align: "center" });

  yPosition += (vendorLines.length * 13) + 10;

  // ─────────────────────────────────────────────
  // Period
  // ─────────────────────────────────────────────
  const periodText = appliedStartDate && appliedEndDate
    ? `${appliedStartDate} to ${appliedEndDate}`
    : appliedStartDate ? `From ${appliedStartDate}`
    : appliedEndDate   ? `Upto ${appliedEndDate}`
    : "All Transactions";

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`Period: ${periodText}`, pageWidth / 2, yPosition, { align: "center" });

  yPosition += 24;

  // ─────────────────────────────────────────────
  // TABLE (unchanged)
  // ─────────────────────────────────────────────
  const usableWidth = pageWidth - margin * 2 - 10;
  const tableMargin = margin + 10;
  const tableWidth = pageWidth - (tableMargin * 2);

  doc.autoTable({
    startY: yPosition,

    head: [["Date", "Type", "Project", "Materials", "Description", "Debit", "Credit", "Balance"]],

    body: ledgerData.ledger_entries.map(entry => [
      entry.date || "—",
      entry.type || "—",
      entry.project || "—",
      entry.material || "—",
      entry.description || "—",
      entry.debit > 0 ? `${formatAmount(entry.debit)}` : "—",
      entry.credit > 0 ? `${formatAmount(entry.credit)}` : "—",
      `${formatAmount(entry.balance || 0)}`,
    ]),

    theme: "grid",

    margin: { left: tableMargin, right: tableMargin },
    tableWidth: tableWidth,

    styles: {
      fontSize: 8.5,
      cellPadding: 4,
      overflow: "linebreak",
      lineColor: [210, 210, 210],
      lineWidth: 0.4,
    },

    headStyles: {
      fillColor: [235, 235, 235],
      textColor: [30, 30, 30],
      fontStyle: "bold",
      halign: "center",
      lineWidth: 0.5,
    },

    alternateRowStyles: {
      fillColor: [252, 252, 252],
    },

    columnStyles: {
      0: { cellWidth: tableWidth * 0.09, halign: "center" },     // Date
      1: { cellWidth: tableWidth * 0.08, halign: "center" },     // Type
      2: { cellWidth: tableWidth * 0.13 },                       // Project
      3: { cellWidth: tableWidth * 0.13 },                       // Material
      4: { cellWidth: tableWidth * 0.24 },                       // Description
      5: { cellWidth: tableWidth * 0.11, halign: "right" },      // Debit
      6: { cellWidth: tableWidth * 0.11, halign: "right" },      // Credit
      7: { cellWidth: tableWidth * 0.11, halign: "right" },      // Balance
    },

    didParseCell: (data) => {
      if (data.section === "body") {
        if (data.column.index === 5 && data.cell.text[0] !== "—") {
          data.cell.styles.textColor = [200, 30, 30];
          data.cell.styles.fontStyle = "bold";
        }
        if (data.column.index === 6 && data.cell.text[0] !== "—") {
          data.cell.styles.textColor = [20, 120, 60];
          data.cell.styles.fontStyle = "bold";
        }
        if (data.column.index === 1) {
          if (data.cell.text[0] === "Purchase") {
            data.cell.styles.fillColor = [255, 235, 235];
          }
          if (data.cell.text[0] === "Payment") {
            data.cell.styles.fillColor = [225, 245, 225];
          }
        }
      }
    },

    didDrawPage: (hookData) => {
      drawHeaderAndBorder();

      doc.setFontSize(8);
      doc.setTextColor(110);
      doc.text(
        `Page ${hookData.pageNumber}`,
        pageWidth / 2,
        pageHeight - 22,
        { align: "center" }
      );
    }
  });

  // ─────────────────────────────────────────────
  // SUMMARY BOX (unchanged)
  // ─────────────────────────────────────────────
  let finalY = doc.lastAutoTable.finalY + 25;

  if (finalY > pageHeight - 140) {
    doc.addPage();
    finalY = drawHeaderAndBorder() + 15;
  }

  doc.setFillColor(245, 248, 250);
  doc.roundedRect(margin + 8, finalY, pageWidth - margin * 2 - 16, 85, 4, 4, 'F');

  finalY += 18;

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30);
  doc.text("FINAL LEDGER SUMMARY", margin + 18, finalY);

  finalY += 18;

  doc.setFontSize(9.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(50);

  const summaryItems = [
    { label: "Opening Balance:",          value: `${formatAmount(ledgerData.ledger_summary?.opening_balance || 0)}`, color: [50,50,50] },
    { label: "Total Debit (Purchases):",  value: `${formatAmount(ledgerData.ledger_summary?.total_debit || 0)}`,    color: [200,30,30] },
    { label: "Total Credit (Payments):",  value: `${formatAmount(ledgerData.ledger_summary?.total_credit || 0)}`,  color: [20,120,60] },
  ];

  summaryItems.forEach((item, i) => {
    const rowY = finalY + i * 15;
    doc.setTextColor(...item.color);
    if (i >= 1) doc.setFont("helvetica", "bold");
    doc.text(item.label, margin + 18, rowY);
    doc.text(item.value, margin + 170, rowY);
  });

  // Closing Balance
  finalY += summaryItems.length * 15 + 8;
  const closing = Number(ledgerData.ledger_summary?.closing_balance || 0);

  doc.setFontSize(10.5);
  doc.setFont("helvetica", "bold");

  if (closing > 0) {
    doc.setTextColor(200, 30, 30);
    doc.text("Closing Balance (Payable):", margin + 18, finalY);
    doc.text(`${formatAmount(closing)}`, margin + 170, finalY);
  } else if (closing < 0) {
    doc.setTextColor(20, 120, 60);
    doc.text("Closing Balance (Receivable):", margin + 18, finalY);
    doc.text(`${formatAmount(Math.abs(closing))}`, margin + 170, finalY);
  } else {
    doc.setTextColor(50);
    doc.text("Closing Balance:", margin + 18, finalY);
    doc.text("0.00", margin + 170, finalY);
  }

  // Generated timestamp (first page)
  doc.setPage(1);
  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text(
    `Generated on ${new Date().toLocaleString('en-IN')}`,
    margin + 12,
    pageHeight - 28
  );

  // ─────────────────────────────────────────────
  // SAVE
  // ─────────────────────────────────────────────
  const safeVendor = vendorName.replace(/[^a-zA-Z0-9]/g, "_");
  doc.save(`Vendor_Ledger_${safeVendor}_${new Date().toISOString().slice(0,10)}.pdf`);
};








export const exportDateWiseExcel = (ledgerData, startDate = "", endDate = "") => {
  if (!ledgerData?.ledger_entries?.length) {
    alert("No ledger entries available to export");
    return;
  }

  const vendorNameSafe = (ledgerData.vendor_details?.vendor_name || "Vendor")
    .replace(/[^a-zA-Z0-9]/g, "_");

  // Filename
  let filename = `Vendor_Ledger_${vendorNameSafe}`;
  if (startDate || endDate) {
    const parts = [];
    if (startDate) parts.push(startDate);
    if (endDate) parts.push(endDate);
    filename += `_${parts.join("_to_")}`;
  }
  filename += ".xlsx";

  // ────────────────────────────────
  // Build rows (array of arrays style – most reliable)
  // ────────────────────────────────

  const rows = [];

  // Title row
  rows.push([`Vendor Ledger - ${ledgerData.vendor_details?.vendor_name || "Unknown Vendor"}`]);

  // Empty line
  rows.push([]);

  // Headers
  rows.push([
    "Date",
    "Type",
    "Project",
    "Material",
    "Description",
    "Debit",
    "Credit",
    "Balance"
  ]);

  // Ledger entries
  ledgerData.ledger_entries.forEach(entry => {
    rows.push([
      entry.date || "",
      entry.type || "",
      entry.project || "",
      entry.material || "",
      entry.description || "",
      Number(entry.debit || 0),
      Number(entry.credit || 0),
      Number(entry.balance || 0)
    ]);
  });

  // Separator
  rows.push([]);

  // Summary section
  rows.push(["Opening Balance as on " + (startDate || "—"), "", "", "", "", "", "", Number(ledgerData.ledger_summary?.opening_balance || 0)]);
  rows.push(["Total Debit",                                 "", "", "", "", Number(ledgerData.ledger_summary?.total_debit || 0), "", ""]);
  rows.push(["Total Credit",                                "", "", "", "", "", Number(ledgerData.ledger_summary?.total_credit || 0), ""]);
  rows.push(["Closing Balance",                             "", "", "", "", "", "", Number(ledgerData.ledger_summary?.closing_balance || 0)]);

  // ────────────────────────────────
  // Create worksheet
  // ────────────────────────────────

  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Auto-fit columns (optional but very useful)
  const colWidths = [];
  rows.forEach(row => {
    row.forEach((val, i) => {
      const len = String(val || "").length;
      colWidths[i] = Math.max(colWidths[i] || 10, len + 2);
    });
  });
  ws['!cols'] = colWidths.map(w => ({ wch: Math.min(w, 60) })); // cap at 60 chars

  // Number formatting for money columns (F=Debit, G=Credit, H=Balance)
  const range = XLSX.utils.decode_range(ws['!ref']);
  for (let R = 3; R <= range.e.r; ++R) {   // start from header + 1
    for (let C = 5; C <= 7; ++C) {         // columns 5,6,7 = F,G,H (0-based)
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      const cell = ws[cellAddress];
      if (cell && typeof cell.v === 'number') {
        cell.z = '#,##0.00;[Red](#,##0.00)';
      }
    }
  }

  // Make title bold & larger (optional)
  ws['A1'].s = { font: { bold: true, sz: 16 } };

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Ledger");

  // Save file
  XLSX.writeFile(wb, filename);
};