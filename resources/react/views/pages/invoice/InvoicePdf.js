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
                <div style="width: 48%; padding: 10px; background-color: #f0f8ff; border: 5px solid #f0f8ff;">
                    <p style="font-size: 16px;"><strong>ग्राहकाचे नाव:</strong> <span style="font-size: 14px;">${formData.customer.name}</span></p>
                    <p style="font-size: 16px;"><strong>ग्राहकाचा पत्ता:</strong> <span style="font-size: 14px;">${formData.customer.address}</span></p>
                    <p style="font-size: 16px;"><strong>मोबाईल क्रमांक:</strong> <span style="font-size: 14px;">${formData.customer.mobile}</span></p>
                </div>
                <div style="width: 48%; padding: 10px; background-color: #e6ffe6; border: 5px solid #e6ffe6;">
                    <p style="font-size: 16px;"><strong>चलन क्रमांक:</strong> <span style="font-size: 14px;">${invoiceNo}</span></p>
                    <p style="font-size: 16px;"><strong>चलन तारीख:</strong> <span style="font-size: 14px;">${formData.date.split("-").reverse().join("-")}</span></p>
                    ${
                        formData.InvoiceType === 2
                            ? `<p style="font-size: 16px;"><strong>डिलीव्हरी तारीख:</strong> <span style="font-size: 14px;">${formData.DeliveryDate.split("-").reverse().join("-")}</span></p>`
                            : ""
                    }
                </div>
            </div>

            <!-- Products Table -->
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; text-align: center;">
                <thead>
                    <tr style="background-color: #f0f0f0;">
                        <th style="border: 1px solid #ddd; padding: 8px; font-size: 16px;">अनुक्रमांक</th>
                        <th style="border: 1px solid #ddd; padding: 8px; font-size: 16px;">वस्तूचे नाव</th>
                        <th style="border: 1px solid #ddd; padding: 8px; font-size: 16px;">किंमत (₹)</th>
                        <th style="border: 1px solid #ddd; padding: 8px; font-size: 16px;">प्रमाण</th>
                        <th style="border: 1px solid #ddd; padding: 8px; font-size: 16px;">एकूण (₹)</th>
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
                        <td colspan="4" style="border: 1px solid #ddd; padding: 8px; text-align: right; font-size: 16px; font-weight: bold;"><strong>एकूण</strong></td>
                        <td style="border: 1px solid #ddd; padding: 8px; font-size: 14px; text-align: center;">
                            ${formData.discount > 0 ? 
                                `<span>${formData.totalAmount} /-</span>` : 
                                `${formData.totalAmount} /-`
                            }
                        </td>
                    </tr>
                    ${formData.discount > 0 ? `
                        <tr style="background-color: #f8f9fa;">
                            <td colspan="4" style="border: 1px solid #ddd; padding: 8px; text-align: right; font-size: 16px; font-weight: bold;"><strong>सूट नंतरची एकूण (${formData.discount}%)</strong></td>
                            
                            <td style="border: 1px solid #ddd; padding: 8px; font-size: 14px; text-align: center;">${formData.finalAmount || grandTotal} /-</td>
                        </tr>
                    ` : ''}
                </tbody>
            </table>

            <!-- Payment Details with QR Code Section -->
            <div style="display: flex; justify-content: space-between; margin-bottom: 20px; border: 1px solid #ddd;">
                <!-- Payment Information -->
                <div style="width: ${ci.paymentQRCode ? '65%' : '100%'}; padding: 15px; background-color: #e6ffe6; ${ci.paymentQRCode ? 'border-right: 1px solid #ddd;' : ''}">
                    <h4 style="font-size: 16px; margin-bottom: 15px; color: #2c5530;">पेमेंट तपशील</h4>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span style="font-size: 16px; font-weight: bold;">रक्कम भरलेली:</span>
                        <span style="font-size: 16px; color: #2c5530;">${formData.amountPaid.toFixed(2)} /-</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span style="font-size: 16px; font-weight: bold;">शिल्लक रक्कम:</span>
                        <span style="font-size: 16px; color: #d73527;">${remainingAmount.toFixed(2)} /-</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span style="font-size: 16px; font-weight: bold;">पेमेंट मोड:</span>
                        <span style="font-size: 16px;">${formData.paymentMode}</span>
                    </div>
                </div>
                
                ${ci.paymentQRCode ? `
                    <!-- QR Code Section -->
                    <div style="width: 33%; text-align: center; padding: 15px; background-color: #f8f9fa;">
                        <h4 style="font-size: 16px; margin-bottom: 10px;">QR कोड</h4>
                        <img src="img/${ci.paymentQRCode}" alt="QR Code" style="width: 90px; height: 90px; border: 1px solid #ddd; border-radius: 5px;" />
                        <p style="font-size: 12px; margin-top: 8px; color: #666;">पेमेंटसाठी स्कॅन करा</p>
                    </div>
                ` : ''}
            </div>


            ${(ci.bank_name || ci.account_no || ci.IFSC_code) || ci.sign ? `
                <!-- Footer Section with Bank Details and E-Signature -->
                <div style="display: flex; justify-content: space-between; margin-top: 20px; border: 1px solid #ddd; padding: 15px;">
                    ${(ci.bank_name || ci.account_no || ci.IFSC_code) ? `
                        <!-- Bank Details -->
                        <div style="width: ${ci.sign ? '48%' : '100%'};">
                            <h4 style="font-size: 16px; margin-bottom: 10px;">बँक तपशील</h4>
                            ${ci.bank_name ? `<p style="font-size: 14px; margin: 5px 0;"><strong>बँक:</strong> ${ci.bank_name}</p>` : ''}
                            ${ci.account_no ? `<p style="font-size: 14px; margin: 5px 0;"><strong>खाते क्रमांक:</strong> ${ci.account_no}</p>` : ''}
                            ${ci.IFSC_code ? `<p style="font-size: 14px; margin: 5px 0;"><strong>IFSC कोड:</strong> ${ci.IFSC_code}</p>` : ''}
                        </div>
                    ` : ''}
                    
                    ${ci.sign ? `
                        <!-- E-Signature Section -->
                        <div style="text-align: center; width: ${(ci.bank_name || ci.account_no || ci.IFSC_code) ? '48%' : '100%'};">
                            <h4 style="font-size: 16px; margin-bottom: 10px;">ई-स्वाक्षरी</h4>
                            <img src="img/${ci.sign}" alt="Signature" style="width: 120px; height: 60px;" />
                            <p style="font-size: 12px; margin-top: 5px;">अधिकृत स्वाक्षरी</p>
                        </div>
                    ` : ''}
                </div>
            ` : ''}
        </div>
    `;

    const element = document.createElement("div");
    element.innerHTML = invoiceContent;

    const options = {
        margin: [10, 10, 20, 10],
        filename: `${invoiceNo}-${customerName}.pdf`,
        image: { type: "jpeg", quality: 1 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        callback: function (pdf) {
            const totalPages = pdf.internal.pages.length;
            for (let i = 1; i <= totalPages; i++) {
                pdf.setPage(i);
                pdf.setFontSize(10);
                pdf.text("हे चलन संगणकाद्वारे तयार केले आहे आणि अधिकृत आहे.", 10, 290);
                pdf.text(`Page ${i} of ${totalPages}`, 180, 290);
            }
        }
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
                        name: "श्रेया ग",
                        address: "कर्वेनगर",
                        mobile: "1234567890",
                    },
                    date: "2024-12-31",
                    InvoiceStatus: "डिलिव्हर्ड ऑर्डर",
                    InvoiceType: 2,
                    DeliveryDate: "2025-01-01",
                    products: [
                        { product_name: "सफरचंद", dPrice: 100, dQty: 2, total_price: 200 },
                        { product_name: "केळी", dPrice: 50, dQty: 4, total_price: 200 },
                    ],
                    totalAmount: 400,
                    discount: 10,
                    finalAmount: 360,
                    amountPaid: 300,
                    paymentMode: "ऑनलाइन"
                };

                generatePDF(360, "INV-001", "श्रेया ग", formData, 60, "तीनशे साठ");
            }}>
                चलन डाउनलोड करा
            </button>
        </div>
    );
}

export default InvoicePdf;
