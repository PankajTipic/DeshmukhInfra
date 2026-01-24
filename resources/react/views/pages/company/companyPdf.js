import jsPDF from "jspdf";
import "jspdf-autotable";
import { getUserData } from "../../../util/session";
import logo from "../../../assets/brand/TipicConsultech.png";

/**
 * Generates a professional-looking PDF receipt for company subscriptions
 * @param {Object} receiptData - The data for generating the receipt
 * @param {String} outputType - 'download' or 'blob' (default: 'download')
 * @param {Function} callback - Callback function for blob type (optional)
 * @returns {Promise<String|Blob|null>} - Returns the filename, blob, or null if failed
 */
export async function generateCompanyReceiptPDF(receiptData, outputType = 'download', callback = null) {
    try {
        // Enhanced validation
        if (!receiptData) {
            console.error("Receipt data is null or undefined");
            throw new Error("Receipt data is required");
        }

        // Validate required fields
        const requiredFields = ['company_name', 'phone_no', 'email_id'];
        const missingFields = requiredFields.filter(field => {
            const companyData = receiptData.company || receiptData;
            return !companyData[field];
        });

        if (missingFields.length > 0) {
            console.warn("Missing required fields:", missingFields);
        }

        console.log("Receipt data:", receiptData); // Debug log

        // Initialize PDF document with error handling
        let pdf;
        try {
            pdf = new jsPDF({ 
                orientation: "portrait", 
                unit: "mm", 
                format: "a4" 
            });
        } catch (pdfError) {
            console.error("Failed to initialize PDF:", pdfError);
            throw new Error("Failed to initialize PDF document");
        }
        
        // Theme configuration
        const theme = {
            primary: "#00bcd4",
            secondary: "#607d8b",
            textDark: "#333333",
            textLight: "#666666",
            border: "#cccccc"
        };
        
        // Enhanced helper functions with better error handling
        const formatDate = (dateString) => {
            if (!dateString) return "N/A";
            try {
                const date = new Date(dateString);
                if (isNaN(date.getTime())) {
                    console.warn("Invalid date string:", dateString);
                    return "Invalid Date";
                }
                return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
            } catch (error) {
                console.error("Date formatting error:", error);
                return "N/A";
            }
        };
        
        const formatCurrency = (amount) => {
            if (!amount && amount !== 0) return "0.00 /-";
            try {
                const numAmount = parseFloat(amount);
                if (isNaN(numAmount)) {
                    console.warn("Invalid amount:", amount);
                    return "0.00 /-";
                }
                return `${numAmount.toLocaleString('en-IN', { 
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })} /-`;
            } catch (error) {
                console.error("Currency formatting error:", error);
                return "0.00 /-";
            }
        };

        const safeText = (text, maxLength = 50) => {
            if (!text) return "N/A";
            return String(text).length > maxLength ? String(text).substring(0, maxLength) + "..." : String(text);
        };
        
        // Get company information with fallbacks
        const ci = getUserData()?.company_info || {};
        const today = new Date().toISOString().split("T")[0];
        const formattedDate = formatDate(today);
        
        // Document setup with error handling
        try {
            pdf.setFont("helvetica", "normal");
            
            // Add professional border
            pdf.setDrawColor(theme.border);
            pdf.setLineWidth(0.5);
            pdf.rect(5, 5, pdf.internal.pageSize.getWidth() - 10, pdf.internal.pageSize.getHeight() - 10, "S");
            
            // Header - Title
            pdf.setFontSize(18);
            pdf.setTextColor(theme.textDark);
            pdf.setFont("helvetica", "bold");
            pdf.text("Subscription Receipt", pdf.internal.pageSize.getWidth() / 2, 15, { align: "center" });
        } catch (headerError) {
            console.error("Error creating PDF header:", headerError);
            throw new Error("Failed to create PDF header");
        }
        
        // Add logo with enhanced error handling
        try {
            if (logo) {
                // Check if logo is a valid image format
                if (typeof logo === 'string' && (logo.startsWith('data:image') || logo.startsWith('http'))) {
                    pdf.addImage(logo, "PNG", 15, 25, 50, 25);
                } else {
                    console.warn("Logo format not supported or invalid:", typeof logo);
                }
            }
        } catch (logoError) {
            console.warn("Logo could not be added to PDF:", logoError);
            // Continue without logo rather than failing
        }
        
        // Company information - Right aligned with safe text handling
        try {
            pdf.setFontSize(11);
            pdf.setFont("helvetica", "normal");
            pdf.text(safeText(ci.company_name || "Tipic ConsulTech"), 190, 30, { align: "right" });
            pdf.text(safeText(ci.land_mark || "Konark Karya"), 190, 35, { align: "right" });
            
            // Format address line
            let addressLine = "";
            if (ci.Tal) addressLine += ci.Tal;
            if (ci.Dist) {
                if (addressLine) addressLine += ", ";
                addressLine += ci.Dist;
            }
            if (ci.pincode) {
                if (addressLine) addressLine += ", ";
                addressLine += ci.pincode;
            }
            
            pdf.text(safeText(addressLine || "Keshav Nagar, Pune, 411000"), 190, 40, { align: "right" });
            pdf.text(safeText(`Phone: ${ci.phone_no || "9900000000"}`), 190, 45, { align: "right" });
            
            // Horizontal line separator
            pdf.setDrawColor(theme.primary);
            pdf.setLineWidth(0.7);
            pdf.line(15, 65, pdf.internal.pageSize.getWidth() - 15, 65);
        } catch (companyInfoError) {
            console.error("Error adding company information:", companyInfoError);
            throw new Error("Failed to add company information");
        }
        
        // Customer section with enhanced data extraction
        try {
            pdf.setFontSize(13);
            pdf.setTextColor(theme.primary);
            pdf.setFont("helvetica", "bold");
            pdf.text("Receipt to:", 15, 75);
            
            // Customer details with better null handling and data extraction
            pdf.setFontSize(11);
            pdf.setTextColor(theme.textDark);
            pdf.setFont("helvetica", "normal");
            
            // Extract customer data from various possible locations
            const customerData = receiptData.company || receiptData.customer || receiptData;
            
            // Left-aligned labels
            pdf.text("Company Name", 15, 83);
            pdf.text("Mobile Number", 15, 89);
            pdf.text("Email", 15, 95);
            pdf.text("Transaction ID", 15, 101);
            
            // Right-aligned colons
            pdf.text(": ", 45, 83);
            pdf.text(": ", 45, 89);
            pdf.text(": ", 45, 95);
            pdf.text(": ", 45, 101);
            
            // Values with safe text handling
            pdf.text(safeText(customerData.company_name || "N/A"), 48, 83);
            pdf.text(safeText(customerData.phone_no || customerData.mobile || "N/A"), 48, 89);
            pdf.text(safeText(customerData.email_id || customerData.email || "N/A"), 48, 95);
            pdf.text(safeText(receiptData.transaction_id || receiptData.txn_id || "N/A"), 48, 101);
            
            // Receipt details - Right side
            pdf.text("Receipt Date", 130, 83);
            pdf.text("Valid Till", 130, 89);
            pdf.text(": ", 165, 83);
            pdf.text(": ", 165, 89);
            pdf.text(safeText(formattedDate), 168, 83);
            pdf.text(safeText(formatDate(receiptData.valid_till) || "N/A"), 168, 89);
        } catch (customerError) {
            console.error("Error adding customer information:", customerError);
            throw new Error("Failed to add customer information");
        }
        
        // Plan details section with enhanced error handling
        try {
            pdf.setFontSize(13);
            pdf.setTextColor(theme.primary);
            pdf.setFont("helvetica", "bold");
            pdf.text("Plan Details", 15, 115);
            
            // Plan details table with better data handling
            const planData = receiptData.plan || {};
            const planTable = [
                [
                    safeText(planData.name || planData.plan_name || receiptData.plan_name || "Basic Plan"),
                    formatDate(receiptData.created_at || receiptData.start_date) || formattedDate,
                    formatDate(receiptData.valid_till || receiptData.end_date) || "N/A",
                    formatCurrency(planData.plan_price || planData.price || receiptData.plan_price || 0)
                ]
            ];
            
           pdf.autoTable({
            startY: 120,
            headStyles: { 
                fillColor: theme.primary, 
                textColor: "#FFFFFF", 
                fontStyle: "bold",
                halign: "center"
            },
            bodyStyles: { 
                textColor: theme.textDark
            },
            theme: "grid",
            head: [["Plan Name", "Start Date", "End Date", "Amount(Per Month)"]],
            body: planTable,
            margin: { left: 15, right: 15 },
            columnStyles: {
                3: { halign: "right" }
            },
            });

        } catch (planError) {
            console.error("Error creating plan table:", planError);
            throw new Error("Failed to create plan details table");
        }
        
        // Payment details section with enhanced error handling
        try {
            pdf.setFontSize(13);
            pdf.setTextColor(theme.primary);
            pdf.setFont("helvetica", "bold");
            pdf.text("Payment Details", 15, pdf.autoTable.previous.finalY + 15);
            
            // Calculate values for payment details with better null handling
            const subtotal = parseFloat(receiptData.total_amount || receiptData.subtotal || receiptData.amount || 0);
            const gst = parseFloat(receiptData.gst || receiptData.tax || 0);
            const total = parseFloat(receiptData.payable_amount || receiptData.total || receiptData.final_amount || subtotal + gst);
            
            const paymentTable = [
                ["Amount", formatCurrency(subtotal)],
                ["GST", formatCurrency(gst)],
                ["Amount Paid", formatCurrency(total)]
            ];
            
            // Payment details table
            pdf.autoTable({
                startY: pdf.autoTable.previous.finalY + 20,
                headStyles: { 
                    fillColor: theme.primary, 
                    textColor: "#FFFFFF", 
                    fontStyle: "bold"
                },
                bodyStyles: { 
                    textColor: theme.textDark
                },
                theme: "grid",
                head: [["Description", "Amount"]],
                body: paymentTable,
                margin: { left: 15, right: 15 },
                columnStyles: { 
                    1: { halign: "right" } 
                },
            });
        } catch (paymentError) {
            console.error("Error creating payment table:", paymentError);
            throw new Error("Failed to create payment details table");
        }
        
        // Footer section
        try {
            const footerText = "This receipt has been generated by computer and is authorized.";
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            
            // Set font properties first
            pdf.setFontSize(10);
            pdf.setTextColor(theme.textDark || "#000000");
            pdf.setFont("helvetica", "normal");
            
            // Calculate center position more precisely
            const textWidth = pdf.getTextWidth(footerText);
            const centerX = (pageWidth - textWidth) / 2;
            
            // Position at bottom with some margin
            const footerY = pageHeight - 15;
            
            // Add the centered text
            pdf.text(footerText, centerX, footerY);
            
            console.log("Footer added successfully - centered at:", centerX, footerY);
            
        } catch (footerError) {
            console.warn("Error adding footer:", footerError);
            // Fallback - simple center alignment
            try {
                pdf.setFontSize(10);
                pdf.setTextColor("#000000");
                pdf.text("This receipt has been generated by computer and is authorized.", 
                        pdf.internal.pageSize.getWidth() / 2, 
                        pdf.internal.pageSize.getHeight() - 15, 
                        { align: "center" });
            } catch (fallbackError) {
                console.error("Fallback footer also failed:", fallbackError);
            }
        }

        // Handle different output types
        if (outputType === 'blob') {
            try {
                const pdfBlob = pdf.output('blob');
                console.log("PDF blob generated successfully");
                
                if (callback && typeof callback === 'function') {
                    callback(pdfBlob);
                }
                
                return pdfBlob;
            } catch (blobError) {
                console.error("Error generating PDF blob:", blobError);
                throw new Error(`Failed to generate PDF blob: ${blobError.message}`);
            }
        } else {
            // Default download behavior
            // Generate filename with enhanced sanitization
            const timestamp = new Date().getTime();
            const customerData = receiptData.company || receiptData.customer || receiptData;
            const companyName = customerData.company_name || customerData.name || "Company";
            
            // Sanitize filename more thoroughly
            const sanitizedName = companyName
                .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
                .replace(/\s+/g, '_') // Replace spaces with underscores
                .substring(0, 20); // Limit length
                
            const filename = `${sanitizedName}_Receipt_${timestamp}.pdf`;
            
            console.log("Attempting to save PDF with filename:", filename);
            
            // Enhanced PDF save with additional error handling
            try {
                // Check if pdf.save is available
                if (typeof pdf.save !== 'function') {
                    throw new Error("PDF save function is not available");
                }
                
                // Attempt to save
                await new Promise((resolve, reject) => {
                    try {
                        pdf.save(filename);
                        // Give some time for the save operation
                        setTimeout(resolve, 100);
                    } catch (saveError) {
                        reject(saveError);
                    }
                });
                
                console.log("PDF save command executed successfully");
                
                // Show success message
                if (window.showToast) {
                    window.showToast('success', 'PDF receipt generated successfully!');
                }
                
                return filename;
                
            } catch (saveError) {
                console.error("Error during PDF save:", saveError);
                throw new Error(`Failed to save PDF: ${saveError.message}`);
            }
        }
        
    } catch (error) {
        console.error("Error generating PDF:", error);
        console.error("Error stack:", error.stack);
        
        // Enhanced error reporting
        const errorMessage = error.message || "Unknown error occurred";
        console.error("Detailed error:", {
            message: errorMessage,
            receiptData: receiptData ? "Present" : "Missing",
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
        });
        
        // Show user-friendly error message
        if (window.showToast) {
            window.showToast('danger', `Failed to generate PDF receipt: ${errorMessage}`);
        } else {
            alert(`Failed to generate PDF receipt: ${errorMessage}`);
        }
        
        return null;
    }
}

// Specific function for generating PDF blob (alternative approach)
export async function generateCompanyReceiptPDFBlob(receiptData) {
    return await generateCompanyReceiptPDF(receiptData, 'blob');
}

// Additional utility function for testing PDF generation
export function testPDFGeneration() {
    const testData = {
        company: {
            company_name: "Test Company Ltd",
            phone_no: "9876543210",
            email_id: "test@company.com"
        },
        transaction_id: "TXN123456789",
        created_at: new Date().toISOString(),
        valid_till: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        plan: {
            name: "Premium Plan",
            price: 1000
        },
        total_amount: 1000,
        gst: 180,
        payable_amount: 1180
    };
    
    return generateCompanyReceiptPDF(testData);
}