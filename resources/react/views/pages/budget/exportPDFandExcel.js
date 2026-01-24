// src/utils/exportPDFandExcel.js
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import html2pdf from "html2pdf.js";

// Helper: Format currency
const formatCurrency = (value) => {
  return  Number(value || 0);
};



















export const exportToPDF = (data) => {
  const safeSum = (arr, keyPath) => {
    return (arr || []).reduce((sum, item) => {
      const val = keyPath.split(".").reduce((o, k) => (o || {})[k], item);
      return sum + (Number(val) || 0);
    }, 0);
  };

  const vendorName = data.vendor_details?.vendor_name || "—";
  const vendorId = data.vendor_details?.vendor_id || "—";
  const vendorMobile = data.vendor_details?.mobile || "—";
  const vendorAddress = data.vendor_details?.address || "—";

  // Calculate grand totals
  let grandTotal = 0;
  let grandPaid = 0;
  let grandBalance = 0;
  data.projects?.forEach((project) => {
    grandTotal += safeSum(project.purchases || [], "purchase_details.total");
    grandPaid += safeSum(project.purchases || [], "payment_master.paid_amount");
    grandBalance += safeSum(project.purchases || [], "payment_master.balance_amount");
  });

  // ───────────────────────────────────────────────
  // Flatten all transactions into a chronological ledger
  // ───────────────────────────────────────────────
  const allTransactions = [];

  data.projects?.forEach((project) => {
    const projectName = project.project_details?.project_name || "Unnamed Project";
    const projectId = project.project_details?.project_id || "—";

    project.purchases?.forEach((purchase) => {
      // Add purchase (Debit) transaction
      allTransactions.push({
        type: "purchase",
        date: purchase.purchase_details?.date || "—",
        project: { name: projectName, id: projectId },
        material: purchase.purchase_details?.material_name || "—",
        description: `Purchase Inv# ${purchase.purchase_details?.invoice_no || "—"}`,
        debit: Number(purchase.purchase_details?.total || 0),
        credit: 0,
        remark: purchase.purchase_details?.gst_included 
          ? `GST @${purchase.purchase_details?.gst_percent ?? 0}%` 
          : "No GST",
      });

      // Add each payment log as separate Credit transaction
      (purchase.payment_logs || []).forEach((log) => {
        allTransactions.push({
          type: "payment",
          date: log.payment_date || "—",
          project: { name: projectName, id: projectId },
          material: "—",
          description: `Payment - ${log.payment_type || "—"} (${log.paid_by || "—"})`,
          debit: 0,
          credit: Number(log.amount || 0),
          remark: log.remark || "—",
        });
      });
    });
  });

  // Sort transactions chronologically
  allTransactions.sort((a, b) => new Date(a.date) - new Date(b.date));

  // Calculate running balance
  let runningBalance = 0;
  allTransactions.forEach((tx) => {
    runningBalance += tx.debit - tx.credit;
    tx.balance = runningBalance;
    tx.balanceDisplay = runningBalance >= 0 
      ? `₹${runningBalance.toLocaleString("en-IN")} Dr` 
      : `₹${Math.abs(runningBalance).toLocaleString("en-IN")} Cr`;
  });

  // ───────────────────────────────────────────────
  // DOM MEASUREMENT FOR PAGINATION
  // ───────────────────────────────────────────────
  const tempContainer = document.createElement("div");
  tempContainer.style.position = "absolute";
  tempContainer.style.left = "-9999px";
  tempContainer.style.width = "794px"; // A4 width at 96dpi
  tempContainer.style.fontFamily = "helvetica, sans-serif";
  tempContainer.style.fontSize = "10px";
  document.body.appendChild(tempContainer);

  const PAGE_HEIGHT = 1123;
  const MARGIN_VERTICAL = 40;
  const AVAILABLE_HEIGHT = PAGE_HEIGHT - MARGIN_VERTICAL;

  // Measure full header
  tempContainer.innerHTML = `
    <div style="padding: 20px; box-sizing: border-box;">
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
        <tr>
          <td style="width: 70%; vertical-align: top;">
            <div style="font-size: 18px; font-weight: bold;">Deshmukh Infra Soft</div>
            <div>urali kanchan</div>
            <div>Phone: 9173635656</div>
          </td>
          <td style="width: 30%; text-align: right; vertical-align: top;">
            <div style="width: 60px; height: 60px; background: #ccc; border: 1px solid #999;"></div>
          </td>
        </tr>
      </table>
      <hr style="border-top: 1px solid #000; margin: 5px 0;" />
      <div style="text-align: center; font-weight: bold; font-size: 16px; padding: 5px; background: #cfe2ff; border: 1px solid #000; margin-bottom: 10px;">
        Vendor Ledger Account Report
      </div>
      <table style="width: 100%; border-collapse: collapse; border: 1px solid #000; margin-bottom: 10px;">
        <thead>
          <tr>
            <th style="border: 1px solid #000; background: #d9e9ff; padding: 5px; font-size: 11px;">FROM :</th>
            <th style="border: 1px solid #000; background: #d9e9ff; padding: 5px; font-size: 11px;">TO :</th>
            <th style="border: 1px solid #000; background: #d9e9ff; padding: 5px; font-size: 11px;">DETAILS :</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #000; padding: 5px; line-height: 1.4; font-size: 11px;">
              Deshmukh Infra Soft<br>Shop Owner<br>urali kanchan<br>Phone: 9173635656<br>GSTIN: fgffgfgg<br>Dist: pune<br>Tal: haveli<br>Email: shreyas.gijare.21@gmail.com
            </td>
            <td style="border: 1px solid #000; padding: 5px; line-height: 1.4; font-size: 11px;">
              Vendor: ${vendorName}<br>ID: ${vendorId}<br>Phone: ${vendorMobile}<br>Address: ${vendorAddress}
            </td>
            <td style="border: 1px solid #000; padding: 5px; line-height: 1.4; font-size: 11px;">
              Generated: ${new Date().toLocaleDateString("en-IN")}<br>Report ID: -
            </td>
          </tr>
        </tbody>
      </table>
      <table style="width: 100%; border-collapse: collapse; border: 1px solid #000; margin-bottom: 10px;">
        <thead>
          <tr>
            <th style="border: 1px solid #000; background: #d9e9ff; padding: 5px; font-size: 11px;">TOTAL PURCHASE</th>
            <th style="border: 1px solid #000; background: #d9e9ff; padding: 5px; font-size: 11px;">TOTAL PAID</th>
            <th style="border: 1px solid #000; background: #d9e9ff; padding: 5px; font-size: 11px;">BALANCE DUE</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #000; padding: 5px; text-align: right; font-size: 12px; background: #e0e7ff;">₹${grandTotal.toLocaleString("en-IN")}</td>
            <td style="border: 1px solid #000; padding: 5px; text-align: right; font-size: 12px; background: #dcfce7;">₹${grandPaid.toLocaleString("en-IN")}</td>
            <td style="border: 1px solid #000; padding: 5px; text-align: right; font-size: 12px; background: #fee2e2;">₹${grandBalance.toLocaleString("en-IN")}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
  const fullHeaderHeight = tempContainer.offsetHeight;

  // Measure subsequent page header
  tempContainer.innerHTML = `
    <div style="padding: 20px; box-sizing: border-box;">
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 5px;">
        <tr>
          <td style="width: 70%; vertical-align: top;">
            <div style="font-size: 18px; font-weight: bold;">Deshmukh Infra Soft</div>
            <div>urali kanchan</div>
            <div>Phone: 9173635656</div>
          </td>
          <td style="width: 30%; text-align: right; vertical-align: top;">
            <div style="width: 60px; height: 60px; background: #ccc; border: 1px solid #999;"></div>
          </td>
        </tr>
      </table>
      <hr style="border-top: 1px solid #000; margin: 5px 0;" />
    </div>
  `;
  const subsequentHeaderHeight = tempContainer.offsetHeight;

  // Measure footer
  tempContainer.innerHTML = `
    <div style="padding: 20px; box-sizing: border-box;">
      <div style="text-align: center; font-size: 10px; margin-bottom: 5px;">This report is computer generated and authorized.</div>
      <div style="display: flex; justify-content: space-between; font-size: 11px;">
        <div>deshmukhinfra@gmail.com</div>
        <div>www.deshmukhinfrasolutions.com</div>
      </div>
      <div style="text-align: center; font-size: 10px; margin-top: 5px;">Page 1 of 1 • Generated: ${new Date().toLocaleString("en-IN")}</div>
    </div>
  `;
  const footerHeight = tempContainer.offsetHeight;

  // Measure ledger table header
  tempContainer.innerHTML = `
    <div style="padding: 20px; box-sizing: border-box;">
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="width:12%; border: 1px solid #000; background: #d9e9ff; padding: 5px; font-size: 11px;">Date</th>
            <th style="width:18%; border: 1px solid #000; background: #d9e9ff; padding: 5px; font-size: 11px;">Project</th>
            <th style="width:18%; border: 1px solid #000; background: #d9e9ff; padding: 5px; font-size: 11px;">Material</th>
            <th style="width:22%; border: 1px solid #000; background: #d9e9ff; padding: 5px; font-size: 11px;">Particulars</th>
            <th style="width:10%; border: 1px solid #000; background: #d9e9ff; padding: 5px; font-size: 11px; text-align:right;">Debit ₹</th>
            <th style="width:10%; border: 1px solid #000; background: #d9e9ff; padding: 5px; font-size: 11px; text-align:right;">Credit ₹</th>
            <th style="width:10%; border: 1px solid #000; background: #d9e9ff; padding: 5px; font-size: 11px; text-align:right;">Balance ₹</th>
            <th style="width:10%; border: 1px solid #000; background: #d9e9ff; padding: 5px; font-size: 11px;">Remark</th>
          </tr>
        </thead>
      </table>
    </div>
  `;
  const tableHeaderHeight = tempContainer.querySelector("thead").offsetHeight;

  // Measure transaction row height (average)
  tempContainer.innerHTML = `
    <div style="padding: 20px; box-sizing: border-box;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="border: 1px solid #000; padding: 5px; font-size: 10px;">01-01-2025</td>
          <td style="border: 1px solid #000; padding: 5px; font-size: 10px;">Project Sample</td>
          <td style="border: 1px solid #000; padding: 5px; font-size: 10px;">Cement</td>
          <td style="border: 1px solid #000; padding: 5px; font-size: 10px;">Purchase Inv# PUR001</td>
          <td style="border: 1px solid #000; padding: 5px; text-align:right; font-size: 10px;">₹45,000</td>
          <td style="border: 1px solid #000; padding: 5px; text-align:right; font-size: 10px;">—</td>
          <td style="border: 1px solid #000; padding: 5px; text-align:right; font-size: 10px;">₹45,000 Dr</td>
          <td style="border: 1px solid #000; padding: 5px; font-size: 10px;">GST @18%</td>
        </tr>
      </table>
    </div>
  `;
  const rowHeight = tempContainer.querySelector("tr").offsetHeight;

  // ───────────────────────────────────────────────
  // BUILD BLOCKS (each transaction is a block)
  // ───────────────────────────────────────────────
  const blocks = allTransactions.map(tx => ({
    type: "transaction",
    content: tx,
    height: rowHeight
  }));

  blocks.push({
    type: "grand_total",
    height: rowHeight * 1.5 // Slightly taller for total
  });

  // ───────────────────────────────────────────────
  // PAGINATION
  // ───────────────────────────────────────────────
  const pages = [];
  let currentPageBlocks = [];
  let currentHeight = tableHeaderHeight;
  let availableHeight = AVAILABLE_HEIGHT - fullHeaderHeight - footerHeight - tableHeaderHeight;
  let isFirstPage = true;

  blocks.forEach((block) => {
    if (currentHeight + block.height > availableHeight && currentPageBlocks.length > 0) {
      pages.push(currentPageBlocks);
      currentPageBlocks = [];
      currentHeight = tableHeaderHeight;
      availableHeight = AVAILABLE_HEIGHT - subsequentHeaderHeight - footerHeight - tableHeaderHeight;
      isFirstPage = false;
    }
    currentPageBlocks.push(block);
    currentHeight += block.height;
  });

  if (currentPageBlocks.length > 0) {
    pages.push(currentPageBlocks);
  }

  const totalPages = pages.length;

  // ───────────────────────────────────────────────
  // GENERATE HTML CONTENT
  // ───────────────────────────────────────────────
  let pagesHtml = "";
  pages.forEach((pageBlocks, pageIndex) => {
    pagesHtml += `
      <div class="invoice-box">
        <div class="content-wrapper">
          ${pageIndex === 0 ? `
            <table style="width: 100%; margin-bottom: 5px; border-collapse: collapse;">
              <tr>
                <td style="width: 70%; vertical-align: top;">
                  <div style="font-size: 18px; font-weight: bold;">Deshmukh Infra Soft</div>
                  <div>urali kanchan</div>
                  <div>Phone: 9173635656</div>
                </td>
                <td style="width: 30%; text-align: right; vertical-align: top;">
                  <div style="width: 60px; height: 60px; background: #ccc; border: 1px solid #999;"></div>
                </td>
              </tr>
            </table>
            <hr style="border-top: 1px solid #000; margin: 5px 0;" />
            <div style="text-align: center; font-weight: bold; font-size: 16px; padding: 5px; background: #cfe2ff; border: 1px solid #000; margin-bottom: 10px;">
              Vendor Ledger Account Report
            </div>
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #000; margin-bottom: 10px;">
              <thead>
                <tr>
                  <th style="border: 1px solid #000; background: #d9e9ff; padding: 5px; font-size: 11px;">FROM :</th>
                  <th style="border: 1px solid #000; background: #d9e9ff; padding: 5px; font-size: 11px;">TO :</th>
                  <th style="border: 1px solid #000; background: #d9e9ff; padding: 5px; font-size: 11px;">DETAILS :</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="border: 1px solid #000; padding: 5px; line-height: 1.4; font-size: 11px;">
                    Deshmukh Infra Soft<br>Shop Owner<br>urali kanchan<br>Phone: 9173635656<br>GSTIN: fgffgfgg<br>Dist: pune<br>Tal: haveli<br>Email: shreyas.gijare.21@gmail.com
                  </td>
                  <td style="border: 1px solid #000; padding: 5px; line-height: 1.4; font-size: 11px;">
                    Vendor: ${vendorName}<br>ID: ${vendorId}<br>Phone: ${vendorMobile}<br>Address: ${vendorAddress}
                  </td>
                  <td style="border: 1px solid #000; padding: 5px; line-height: 1.4; font-size: 11px;">
                    Generated: ${new Date().toLocaleDateString("en-IN")}<br>Report ID: -
                  </td>
                </tr>
              </tbody>
            </table>
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #000; margin-bottom: 10px;">
              <thead>
                <tr>
                  <th style="border: 1px solid #000; background: #d9e9ff; padding: 5px; font-size: 11px;">TOTAL PURCHASE</th>
                  <th style="border: 1px solid #000; background: #d9e9ff; padding: 5px; font-size: 11px;">TOTAL PAID</th>
                  <th style="border: 1px solid #000; background: #d9e9ff; padding: 5px; font-size: 11px;">BALANCE DUE</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="border: 1px solid #000; padding: 5px; text-align: right; font-size: 12px; background: #e0e7ff;">₹${grandTotal.toLocaleString("en-IN")}</td>
                  <td style="border: 1px solid #000; padding: 5px; text-align: right; font-size: 12px; background: #dcfce7;">₹${grandPaid.toLocaleString("en-IN")}</td>
                  <td style="border: 1px solid #000; padding: 5px; text-align: right; font-size: 12px; background: #fee2e2;">₹${grandBalance.toLocaleString("en-IN")}</td>
                </tr>
              </tbody>
            </table>
          ` : `
            <table style="width: 100%; margin-bottom: 5px; border-collapse: collapse;">
              <tr>
                <td style="width: 70%; vertical-align: top;">
                  <div style="font-size: 18px; font-weight: bold;">Deshmukh Infra Soft</div>
                  <div>urali kanchan</div>
                  <div>Phone: 9173635656</div>
                </td>
                <td style="width: 30%; text-align: right; vertical-align: top;">
                  <div style="width: 60px; height: 60px; background: #ccc; border: 1px solid #999;"></div>
                </td>
              </tr>
            </table>
            <hr style="border-top: 1px solid #000; margin: 5px 0;" />
          `}
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr>
                <th style="width:12%; border: 1px solid #000; background: #d9e9ff; padding: 5px; font-size: 11px;">Date</th>
                <th style="width:18%; border: 1px solid #000; background: #d9e9ff; padding: 5px; font-size: 11px;">Project</th>
                <th style="width:18%; border: 1px solid #000; background: #d9e9ff; padding: 5px; font-size: 11px;">Material</th>
                <th style="width:22%; border: 1px solid #000; background: #d9e9ff; padding: 5px; font-size: 11px;">Particulars</th>
                <th style="width:10%; border: 1px solid #000; background: #d9e9ff; padding: 5px; font-size: 11px; text-align:right;">Debit ₹</th>
                <th style="width:10%; border: 1px solid #000; background: #d9e9ff; padding: 5px; font-size: 11px; text-align:right;">Credit ₹</th>
                <th style="width:10%; border: 1px solid #000; background: #d9e9ff; padding: 5px; font-size: 11px; text-align:right;">Balance ₹</th>
                <th style="width:10%; border: 1px solid #000; background: #d9e9ff; padding: 5px; font-size: 11px;">Remark</th>
              </tr>
            </thead>
            <tbody>
              ${pageBlocks.map((block) => {
                if (block.type === "transaction") {
                  const tx = block.content;
                  return `
                    <tr>
                      <td style="border: 1px solid #000; padding: 5px; font-size: 10px;">${tx.date}</td>
                      <td style="border: 1px solid #000; padding: 5px; font-size: 10px;">${tx.project.name} (ID: ${tx.project.id})</td>
                      <td style="border: 1px solid #000; padding: 5px; font-size: 10px;">${tx.material}</td>
                      <td style="border: 1px solid #000; padding: 5px; font-size: 10px;">${tx.description}</td>
                      <td style="border: 1px solid #000; padding: 5px; text-align:right; font-size: 10px;">${tx.debit ? "₹" + tx.debit.toLocaleString("en-IN") : "—"}</td>
                      <td style="border: 1px solid #000; padding: 5px; text-align:right; color:#22c55e; font-size: 10px;">${tx.credit ? "₹" + tx.credit.toLocaleString("en-IN") : "—"}</td>
                      <td style="border: 1px solid #000; padding: 5px; text-align:right; font-weight:bold; font-size: 10px;">${tx.balanceDisplay}</td>
                      <td style="border: 1px solid #000; padding: 5px; font-size: 10px;">${tx.remark}</td>
                    </tr>
                  `;
                } else if (block.type === "grand_total") {
                  return `
                    <tr style="background: #e8f5e9; font-weight: bold;">
                      <td colspan="4" style="border: 1px solid #000; padding: 5px; text-align:right; font-size: 11px;">Grand Total</td>
                      <td style="border: 1px solid #000; padding: 5px; text-align:right; font-size: 11px;">₹${grandTotal.toLocaleString("en-IN")}</td>
                      <td style="border: 1px solid #000; padding: 5px; text-align:right; color:#22c55e; font-size: 11px;">₹${grandPaid.toLocaleString("en-IN")}</td>
                      <td style="border: 1px solid #000; padding: 5px; text-align:right; font-size: 11px;">₹${grandBalance.toLocaleString("en-IN")} Dr</td>
                      <td style="border: 1px solid #000; padding: 5px; font-size: 11px;"></td>
                    </tr>
                  `;
                }
                return "";
              }).join("")}
            </tbody>
          </table>
        </div>
        <div class="footer">
          <div style="text-align: center; font-size: 10px; margin-bottom: 5px;">This report is computer generated and authorized.</div>
          <div style="display: flex; justify-content: space-between; font-size: 11px;">
            <div>deshmukhinfra@gmail.com</div>
            <div>www.deshmukhinfrasolutions.com</div>
          </div>
          <div style="text-align: center; font-size: 10px; margin-top: 5px;">Page ${pageIndex + 1} of ${totalPages} • Generated: ${new Date().toLocaleString("en-IN")}</div>
        </div>
      </div>
    `;
  });

  const htmlContent = `
    <html>
      <head>
        <style>
          @page { size: A4; margin: 0; }
          body { font-family: helvetica, sans-serif; font-size: 10px; margin: 0; padding: 0; }
          .invoice-box {
            width: 100%;
            height: ${PAGE_HEIGHT}px;
            padding: 20px;
            border: 1px solid #000;
            box-sizing: border-box;
            page-break-after: always;
            position: relative;
            display: flex;
            flex-direction: column;
          }
          .content-wrapper { flex: 1; }
          table { width: 100%; border-collapse: collapse; table-layout: fixed; }
          table th, table td {
            padding: 5px;
            vertical-align: top;
            word-break: break-word;
            font-size: 10px;
          }
          .footer { margin-top: auto; }
        </style>
      </head>
      <body>
        ${pagesHtml}
      </body>
    </html>
  `;

  const opt = {
    margin: 0,
    filename: `Vendor_Ledger_${vendorName.replace(/[^a-zA-Z0-9]/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, windowWidth: 794 },
    jsPDF: { unit: "px", format: [794, 1123], orientation: "portrait" },
  };

  html2pdf().set(opt).from(htmlContent).save();

  document.body.removeChild(tempContainer);
};

















// Export to Excel
export const exportToExcel = (data) => {
  const wb = XLSX.utils.book_new();

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