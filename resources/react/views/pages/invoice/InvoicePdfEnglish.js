import React from 'react';
import html2pdf from "html2pdf.js";
import { getUserData } from '../../../util/session';

export function generatePDF(grandTotal, invoiceNo, customerName, formData, remainingAmount, totalAmountWords, mode = 'blob') {
    const ci = getUserData()?.company_info;

    if (!ci) {
        console.error("Company Info not found.");
        return;
    }

    // Invoice HTML structure
    const invoiceContent = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; border: 1px solid #ddd; background-color: #f9f9f9;">
            <!-- Header Section -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <div style="width: 40%;">
                    <img src="img/${ci.logo}" alt="Company Logo" style="width: 100px;" />
                </div>
                <div style="text-align: right; width: 60%;">
                    <h2 style="margin: 0; font-size: 16px;">${ci.company_name}</h2>
                    <p style="margin: 5px 0; font-size: 14px;">${ci.land_mark}, ${ci.Tal}, ${ci.Dist}, ${ci.pincode}</p>
                    <p style="margin: 5px 0; font-size: 14px;">Phone: ${ci.phone_no}</p>
                </div>
            </div>

            <!-- Status Section -->
            <div style="text-align: center; margin-bottom: 20px;">
                <h3 style="background-color: #d1e7dd; padding: 10px; border: 1px solid #b2d8cc; margin: 0; font-size: 16px;">${formData.InvoiceStatus}</h3>
            </div>

            <!-- Customer and Invoice Details -->
            <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                <div style="width: 48%; padding: 10px; background-color: #f0f8ff; border: 1px solid #add8e6;">
                    <p style="font-size: 16px;"><strong>Customer Name:</strong> <span style="font-size: 14px;">${formData.customer.name}</span></p>
                    <p style="font-size: 16px;"><strong>Customer Address:</strong> <span style="font-size: 14px;">${formData.customer.address}</span></p>
                    <p style="font-size: 16px;"><strong>Mobile Number:</strong> <span style="font-size: 14px;">${formData.customer.mobile}</span></p>
                </div>
                <div style="width: 48%; padding: 10px; background-color: #e6ffe6; border: 1px solid #e6ffe6;">
                    <p style="font-size: 16px;"><strong>Invoice Number:</strong> <span style="font-size: 14px;">${invoiceNo}</span></p>
                    <p style="font-size: 16px;"><strong>Invoice Date:</strong> <span style="font-size: 14px;">${formData.date.split("-").reverse().join("-")}</span></p>
                    ${
                        formData.InvoiceType === 2
                            ? `<p style="font-size: 16px;"><strong>Delivery Date:</strong> <span style="font-size: 14px;">${formData.DeliveryDate.split("-").reverse().join("-")}</span></p>`
                            : ""
                    }
                </div>
            </div>

            <!-- Products Table -->
            <h3 style="font-size: 16px;">Products</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; text-align: center;">
                <thead>
                    <tr style="background-color: #f0f0f0;">
                        <th style="border: 1px solid #ddd; padding: 8px; font-size: 16px;">Sr. No.</th>
                        <th style="border: 1px solid #ddd; padding: 8px; font-size: 16px;">Product Name</th>
                        <th style="border: 1px solid #ddd; padding: 8px; font-size: 16px;">Price (₹)</th>
                        <th style="border: 1px solid #ddd; padding: 8px; font-size: 16px;">Quantity</th>
                        <th style="border: 1px solid #ddd; padding: 8px; font-size: 16px;">Total (₹)</th>
                    </tr>
                </thead>
                <tbody>
                    ${formData.products
                        .map((product, index) => `
                            <tr>
                                <td style="border: 1px solid #ddd; padding: 8px; font-size: 14px;">${index + 1}</td>
                                <td style="border: 1px solid #ddd; padding: 8px; font-size: 14px;">${product.product_name}</td>
                                <td style="border: 1px solid #ddd; padding: 8px; font-size: 14px;">${product.dPrice} /-</td>
                                <td style="border: 1px solid #ddd; padding: 8px; font-size: 14px;">${product.dQty}</td>
                                <td style="border: 1px solid #ddd; padding: 8px; font-size: 14px;">${product.total_price} /-</td>
                            </tr>
                        `)
                        .join("")}
                    <tr style="background-color: #f8f9fa;">
                        <td colspan="4" style="border: 1px solid #ddd; padding: 8px; text-align: right; font-size: 16px; font-weight: bold;"><strong>Total</strong></td>
                        <td style="border: 1px solid #ddd; padding: 8px; font-size: 14px; text-align: center;">
                            ${formData.discount > 0 ? 
                                `<span>${formData.totalAmount} /-</span>` : 
                                `${formData.totalAmount} /-`
                            }
                        </td>
                    </tr>
                    ${formData.discount > 0 ? `
                        <tr style="background-color: #f8f9fa;">
                            <td colspan="4" style="border: 1px solid #ddd; padding: 8px; text-align: right; font-size: 16px; font-weight: bold;"><strong>Total after discount (${formData.discount}%)</strong></td>
                            <td style="border: 1px solid #ddd; padding: 8px; font-size: 14px; text-align: center;">${formData.finalAmount || grandTotal} /-</td>
                        </tr>
                    ` : ''}
                </tbody>
            </table>

            <!-- Payment Details with QR Code Section -->
            <div style="display: flex; justify-content: space-between; margin-bottom: 20px; border: 1px solid #ddd;">
                <!-- Payment Information -->
                <div style="width: 65%; padding: 15px; background-color: #e6ffe6; border-right: 1px solid #ddd;">
                    <h4 style="font-size: 16px; margin-bottom: 15px; color: #2c5530;">Payment Details</h4>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span style="font-size: 16px; font-weight: bold;">Amount Paid:</span>
                        <span style="font-size: 16px; color: #2c5530;">${formData.amountPaid.toFixed(2)} /-</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span style="font-size: 16px; font-weight: bold;">Amount Remaining:</span>
                        <span style="font-size: 16px; color: #d73527;">${remainingAmount.toFixed(2)} /-</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span style="font-size: 16px; font-weight: bold;">Payment Mode:</span>
                        <span style="font-size: 16px;">${formData.paymentMode}</span>
                    </div>
                </div>
                
                <!-- QR Code Section -->
                <div style="width: 33%; text-align: center; padding: 15px; background-color: #f8f9fa;">
                    <h4 style="font-size: 16px; margin-bottom: 10px;">QR CODE</h4>
                    <img src="img/${ci.paymentQRCode}" alt="QR Code" style="width: 90px; height: 90px; border: 1px solid #ddd; border-radius: 5px;" />
                    <p style="font-size: 12px; margin-top: 8px; color: #666;">Scan to Pay</p>
                </div>
            </div>

            <p style="font-size: 16px; margin-bottom: 20px;"><strong>Amount in Words:</strong> <span style="font-size: 14px;">${totalAmountWords} only</span></p>

            <!-- Footer Section with Bank Details and E-Signature -->
            <div style="display: flex; justify-content: space-between; margin-top: 20px; border: 1px solid #ddd; padding: 15px;">
                <!-- Bank Details -->
                <div style="width: 48%;">
                    <h4 style="font-size: 16px; margin-bottom: 10px;">Bank Details</h4>
                    <p style="font-size: 14px; margin: 5px 0;"><strong>Bank:</strong> ${ci.bank_name}</p>
                    <p style="font-size: 14px; margin: 5px 0;"><strong>Account Number:</strong> ${ci.account_no}</p>
                    <p style="font-size: 14px; margin: 5px 0;"><strong>IFSC Code:</strong> ${ci.IFSC_code}</p>
                </div>
                
                <!-- E-Signature Section -->
                <div style="text-align: center; width: 48%;">
                    <h4 style="font-size: 16px; margin-bottom: 10px;">E-Signature</h4>
                    <img src="img/${ci.sign}" alt="Signature" style="width: 120px; height: 60px;" />
                    <p style="font-size: 12px; margin-top: 5px;">Authorized Signature</p>
                </div>
            </div>
        </div>
    `;

    const element = document.createElement("div");
    element.innerHTML = invoiceContent;

    const options = {
        margin: [10, 10, 10, 10],
        filename: `${invoiceNo}-${customerName}.pdf`,
        image: { type: "jpeg", quality: 1 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    const pdfInstance = html2pdf().set(options).from(element);

    if (mode === 'blob') {
        return pdfInstance.outputPdf('blob');
    } else if (mode === 'save') {
        return pdfInstance.save();
    }
}

function InvoicePdf() {
    return (
        <div>
            <button onClick={() => {
                const formData = {
                    customer: {
                        name: "Shreya G",
                        address: "Karvenagar",
                        mobile: "1234567890",
                    },
                    date: "2024-12-31",
                    InvoiceStatus: "Delivered Order",
                    InvoiceType: 2,
                    DeliveryDate: "2025-01-01",
                    products: [
                        { product_name: "Apples", dPrice: 100, dQty: 2, total_price: 200 },
                        { product_name: "Bananas", dPrice: 50, dQty: 4, total_price: 200 },
                    ],
                    totalAmount: 400,
                    discount: 10,
                    finalAmount: 360,
                    amountPaid: 300,
                    paymentMode: "Online"
                };

                generatePDF(360, "INV-001", "Shreya G", formData, 60, "Three Hundred and Sixty");
            }}>
                Download Invoice
            </button>
        </div>
    );
}

export default InvoicePdf;