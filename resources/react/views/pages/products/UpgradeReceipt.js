import jsPDF from "jspdf";
import "jspdf-autotable";
import logo from "../../../assets/brand/TipicConsultech.png"; // Adjust path

export async function generateUpgradeReceiptPDF(receiptData, outputType = 'download', callback = null) {
  try {
    const requiredFields = ['company_name', 'phone_no', 'email_id'];
    const company = receiptData.company || {};

    const formatDate = (d) => {
      if (!d) return "N/A";
      const date = new Date(d);
      return isNaN(date) ? "Invalid Date" : `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
    };

    const formatCurrency = (amt) => {
      const num = parseFloat(amt);
      return isNaN(num) ? "0.00 /-" : `${num.toLocaleString('en-IN', { minimumFractionDigits: 2 })} /-`;
    };

    const safeText = (text, max = 50) => text ? String(text).substring(0, max) : "N/A";

    const pdf = new jsPDF();
    const theme = {
      primary: "#4CAF50",
      textDark: "#333333",
      border: "#cccccc"
    };

    pdf.setFont("helvetica", "normal");

    pdf.setDrawColor(theme.border);
    pdf.setLineWidth(0.5);
    pdf.rect(5, 5, pdf.internal.pageSize.getWidth() - 10, pdf.internal.pageSize.getHeight() - 10);

    pdf.setFontSize(18).setTextColor(theme.textDark).setFont("helvetica", "bold");
    pdf.text("Upgrade Plan Receipt", pdf.internal.pageSize.getWidth() / 2, 15, { align: "center" });

    if (logo && typeof logo === "string") {
      pdf.addImage(logo, "PNG", 15, 25, 50, 25);
    }

    pdf.setFontSize(11).setFont("helvetica", "normal");
    pdf.text(safeText(company.company_name), 190, 30, { align: "right" });
    pdf.text(safeText(company.land_mark || "Konark Karya"), 190, 35, { align: "right" });
    pdf.text(safeText(`${company.Tal || ""}, ${company.Dist || ""}, ${company.pincode || ""}`), 190, 40, { align: "right" });
    pdf.text(safeText(`Phone: ${company.phone_no || "N/A"}`), 190, 45, { align: "right" });

    pdf.setDrawColor(theme.primary);
    pdf.setLineWidth(0.7);
    pdf.line(15, 65, pdf.internal.pageSize.getWidth() - 15, 65);

    pdf.setFontSize(13).setTextColor(theme.primary).setFont("helvetica", "bold");
    pdf.text("Receipt to:", 15, 75);
    pdf.setFontSize(11).setTextColor(theme.textDark).setFont("helvetica", "normal");

    pdf.text("Company Name", 15, 83);
    pdf.text("Mobile Number", 15, 89);
    pdf.text("Email", 15, 95);
    pdf.text("Transaction ID", 15, 101);

    pdf.text(": ", 45, 83);
    pdf.text(": ", 45, 89);
    pdf.text(": ", 45, 95);
    pdf.text(": ", 45, 101);

    pdf.text(safeText(company.company_name), 48, 83);
    pdf.text(safeText(company.phone_no), 48, 89);
    pdf.text(safeText(company.email_id), 48, 95);
    pdf.text(safeText(receiptData.transaction_id), 48, 101);

    const today = new Date().toISOString();
    pdf.text("Receipt Date", 130, 83);
    pdf.text("Valid Till", 130, 89);
    pdf.text(": ", 165, 83);
    pdf.text(": ", 165, 89);
    pdf.text(safeText(formatDate(receiptData.created_at || today)), 168, 83);
    pdf.text(safeText(formatDate(receiptData.new_plan?.valid_till)), 168, 89);

    // --- Plan Details ---
    pdf.setFontSize(13).setTextColor(theme.primary).setFont("helvetica", "bold");
    pdf.text("Plan Details", 15, 115);

    const planTable = [
      [
        "Previous Plan",
        safeText(receiptData.previous_plan?.name),
        formatDate(receiptData.previous_plan?.valid_till),
        formatCurrency(receiptData.previous_plan?.price),
      ],
      [
        "New Plan",
        safeText(receiptData.new_plan?.name),
        formatDate(receiptData.new_plan?.valid_till),
        formatCurrency(receiptData.new_plan?.price),
      ],
    ];

    pdf.autoTable({
      startY: 120,
      theme: "grid",
      headStyles: {
        fillColor: theme.primary,
        textColor: "#FFF",
        fontStyle: "bold",
        halign: "center"
      },
      bodyStyles: {
        textColor: theme.textDark
      },
      head: [["Plan Type", "Plan Name", "Start Date",  "Amount"]],
      body: planTable,
      margin: { left: 15, right: 15 },
      columnStyles: {
        4: { halign: "right" }
      }
    });

    const finalY = pdf.autoTable.previous.finalY + 15;
    pdf.setFontSize(13).setTextColor(theme.primary).setFont("helvetica", "bold");
    pdf.text("Payment Details", 15, finalY);

    const subtotal = parseFloat(receiptData.total_amount || 0);
    const gst = parseFloat(receiptData.gst || 0);
    const total = parseFloat(receiptData.payable_amount || subtotal + gst);

    const paymentTable = [
      ["Amount", formatCurrency(subtotal)],
      ["GST", formatCurrency(gst)],
      ["Amount Paid", formatCurrency(total)],
    ];

    pdf.autoTable({
      startY: finalY + 5,
      theme: "grid",
      head: [["Description", "Amount"]],
      body: paymentTable,
      headStyles: {
        fillColor: theme.primary,
        textColor: "#FFF",
        fontStyle: "bold"
      },
      bodyStyles: {
        textColor: theme.textDark
      },
      columnStyles: {
        1: { halign: "right" }
      },
      margin: { left: 15, right: 15 }
    });

    pdf.setFontSize(10).setTextColor("#000");
    pdf.text("This receipt has been generated by computer and is authorized.", pdf.internal.pageSize.getWidth() / 2, pdf.internal.pageSize.getHeight() - 15, { align: "center" });

    if (outputType === "blob") {
      const blob = pdf.output("blob");
      if (typeof callback === "function") callback(blob);
      return blob;
    } else {
      const fileName = `Upgrade_Receipt_${Date.now()}.pdf`;
      pdf.save(fileName);
      return fileName;
    }
  } catch (err) {
    console.error("Error generating upgrade receipt PDF:", err);
    if (window.showToast) showToast("danger", "Failed to generate PDF");
    return null;
  }
}