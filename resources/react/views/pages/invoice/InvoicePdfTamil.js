import React from 'react';
import html2pdf from "html2pdf.js";
import { getUserData } from '../../../util/session';

export function generatePDF(grandTotal, invoiceNo, customerName, formData, remainingAmount, totalAmountWords, mode = 'blob') {
    const ci = getUserData()?.company_info;

    if (!ci) {
        console.error("நிறுவன தகவல் கிடைக்கவில்லை.");
        return;
    }

    // Invoice HTML structure in Tamil
    const invoiceContent = `
        <div style="font-family: 'Noto Sans Tamil', Arial, sans-serif; line-height: 1.6; padding: 20px; border: 1px solid #ddd; background-color: #f9f9f9;">
            <!-- Header Section -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <div style="width: 40%;">
                    <img src="img/${ci.logo}" alt="நிறுவன சின்னம்" style="width: 100px;" />
                </div>
                <div style="text-align: right; width: 60%;">
                    <h2 style="margin: 0; font-size: 16px;">${ci.company_name}</h2>
                    <p style="margin: 5px 0; font-size: 14px;">${ci.land_mark}, ${ci.Tal}, ${ci.Dist}, ${ci.pincode}</p>
                    <p style="margin: 5px 0; font-size: 14px;">தொலைபேசி: ${ci.phone_no}</p>
                </div>
            </div>

            <!-- Status Section -->
            <div style="text-align: center; margin-bottom: 20px;">
                <h3 style="background-color: #d1e7dd; padding: 10px; border: 1px solid #b2d8cc; margin: 0; font-size: 16px;">${formData.InvoiceStatus}</h3>
            </div>

            <!-- Customer and Invoice Details -->
            <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                <div style="width: 48%; padding: 10px; background-color: #f0f8ff; border: 1px solid #add8e6;">
                    <p style="font-size: 16px;"><strong>வாடிக்கையாளர் பெயர்:</strong> <span style="font-size: 14px;">${formData.customer.name}</span></p>
                    <p style="font-size: 16px;"><strong>வாடிக்கையாளர் முகவரி:</strong> <span style="font-size: 14px;">${formData.customer.address}</span></p>
                    <p style="font-size: 16px;"><strong>கைபேசி எண்:</strong> <span style="font-size: 14px;">${formData.customer.mobile}</span></p>
                </div>
                <div style="width: 48%; padding: 10px; background-color: #e6ffe6; border: 1px solid #e6ffe6;">
                    <p style="font-size: 16px;"><strong>விலைப்பட்டியல் எண்:</strong> <span style="font-size: 14px;">${invoiceNo}</span></p>
                    <p style="font-size: 16px;"><strong>விலைப்பட்டியல் தேதி:</strong> <span style="font-size: 14px;">${formData.date.split("-").reverse().join("-")}</span></p>
                    ${
                        formData.InvoiceType === 2
                            ? `<p style="font-size: 16px;"><strong>விநியோக தேதி:</strong> <span style="font-size: 14px;">${formData.DeliveryDate.split("-").reverse().join("-")}</span></p>`
                            : ""
                    }
                </div>
            </div>

            <!-- Products Table -->
            <h3 style="font-size: 16px;">பொருட்கள்</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; text-align: center;">
                <thead>
                    <tr style="background-color: #f0f0f0;">
                        <th style="border: 1px solid #ddd; padding: 8px; font-size: 16px;">வ.எண்.</th>
                        <th style="border: 1px solid #ddd; padding: 8px; font-size: 16px;">பொருள் பெயர்</th>
                        <th style="border: 1px solid #ddd; padding: 8px; font-size: 16px;">விலை (₹)</th>
                        <th style="border: 1px solid #ddd; padding: 8px; font-size: 16px;">அளவு</th>
                        <th style="border: 1px solid #ddd; padding: 8px; font-size: 16px;">மொத்தம் (₹)</th>
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
                        <td colspan="4" style="border: 1px solid #ddd; padding: 8px; text-align: right; font-size: 16px; font-weight: bold;"><strong>மொத்தம்</strong></td>
                        <td style="border: 1px solid #ddd; padding: 8px; font-size: 14px; text-align: center;">
                            ${formData.discount > 0 ? 
                                `<span>${formData.totalAmount} /-</span>` : 
                                `${formData.totalAmount} /-`
                            }
                        </td>
                    </tr>
                    ${formData.discount > 0 ? `
                        <tr style="background-color: #f8f9fa;">
                            <td colspan="4" style="border: 1px solid #ddd; padding: 8px; text-align: right; font-size: 16px; font-weight: bold;"><strong>தள்ளுபடிக்குப் பிறகு மொத்தம் (${formData.discount}%)</strong></td>
                            <td style="border: 1px solid #ddd; padding: 8px; font-size: 14px; text-align: center;">${formData.finalAmount || grandTotal} /-</td>
                        </tr>
                    ` : ''}
                </tbody>
            </table>

            <!-- Payment Details with QR Code Section -->
            <div style="display: flex; justify-content: space-between; margin-bottom: 20px; border: 1px solid #ddd;">
                <!-- Payment Information -->
                <div style="width: 65%; padding: 15px; background-color: #e6ffe6; border-right: 1px solid #ddd;">
                    <h4 style="font-size: 16px; margin-bottom: 15px; color: #2c5530;">கட்டணம் விவரங்கள்</h4>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span style="font-size: 16px; font-weight: bold;">செலுத்திய தொகை:</span>
                        <span style="font-size: 16px; color: #2c5530;">${formData.amountPaid.toFixed(2)} /-</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span style="font-size: 16px; font-weight: bold;">மீதமுள்ள தொகை:</span>
                        <span style="font-size: 16px; color: #d73527;">${remainingAmount.toFixed(2)} /-</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span style="font-size: 16px; font-weight: bold;">கட்டணம் முறை:</span>
                        <span style="font-size: 16px;">${formData.paymentMode}</span>
                    </div>
                </div>
                
                <!-- QR Code Section -->
                <div style="width: 33%; text-align: center; padding: 15px; background-color: #f8f9fa;">
                    <h4 style="font-size: 16px; margin-bottom: 10px;">க்யூ.ஆர் குறியீடு</h4>
                    <img src="img/${ci.paymentQRCode}" alt="QR Code" style="width: 90px; height: 90px; border: 1px solid #ddd; border-radius: 5px;" />
                    <p style="font-size: 12px; margin-top: 8px; color: #666;">கட்டணம் செலுத்த ஸ்கேன் செய்யவும்</p>
                </div>
            </div>

            <p style="font-size: 16px; margin-bottom: 20px;"><strong>வார்த்தைகளில் தொகை:</strong> <span style="font-size: 14px;">${totalAmountWords} ரூபாய் மட்டும்</span></p>

            <!-- Footer Section with Bank Details and E-Signature -->
            <div style="display: flex; justify-content: space-between; margin-top: 20px; border: 1px solid #ddd; padding: 15px;">
                <!-- Bank Details -->
                <div style="width: 48%;">
                    <h4 style="font-size: 16px; margin-bottom: 10px;">வங்கி விவரங்கள்</h4>
                    <p style="font-size: 14px; margin: 5px 0;"><strong>வங்கி:</strong> ${ci.bank_name}</p>
                    <p style="font-size: 14px; margin: 5px 0;"><strong>கணக்கு எண்:</strong> ${ci.account_no}</p>
                    <p style="font-size: 14px; margin: 5px 0;"><strong>IFSC குறியீடு:</strong> ${ci.IFSC_code}</p>
                </div>
                
                <!-- E-Signature Section -->
                <div style="text-align: center; width: 48%;">
                    <h4 style="font-size: 16px; margin-bottom: 10px;">மின்னணு கையொப்பம்</h4>
                    <img src="img/${ci.sign}" alt="கையொப்பம்" style="width: 120px; height: 60px;" />
                    <p style="font-size: 12px; margin-top: 5px;">அங்கீகரித்த கையொப்பம்</p>
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

function InvoicePdfTamil() {
    return (
        <div>
            <button onClick={() => {
                const formData = {
                    customer: {
                        name: "ஸ்ரேயா ஜி",
                        address: "கார்வேநகர்",
                        mobile: "1234567890",
                    },
                    date: "2024-12-31",
                    InvoiceStatus: "விநியோகம் முடிந்த ஆர்டர்",
                    InvoiceType: 2,
                    DeliveryDate: "2025-01-01",
                    products: [
                        { product_name: "ஆப்பிள்", dPrice: 100, dQty: 2, total_price: 200 },
                        { product_name: "வாழைப்பழம்", dPrice: 50, dQty: 4, total_price: 200 },
                    ],
                    totalAmount: 400,
                    discount: 10,
                    finalAmount: 360,
                    amountPaid: 300,
                    paymentMode: "ஆன்லைன்"
                };

                generatePDF(360, "INV-001", "ஸ்ரேயா ஜி", formData, 60, "முன்னூற்று அறுபது");
            }}>
                விலைப்பட்டியல் பதிவிறக்கம் செய்யவும்
            </button>
        </div>
    );
}

export default InvoicePdfTamil;