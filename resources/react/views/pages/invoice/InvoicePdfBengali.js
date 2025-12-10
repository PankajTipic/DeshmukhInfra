import React from 'react';
import html2pdf from "html2pdf.js";
import { getUserData } from '../../../util/session';

export function generatePDF(grandTotal, invoiceNo, customerName, formData, remainingAmount, totalAmountWords, mode = 'blob') {
    const ci = getUserData()?.company_info;

    if (!ci) {
        console.error("কোম্পানির তথ্য পাওয়া যায়নি।");
        return;
    }

    // Invoice HTML structure in Bengali
    const invoiceContent = `
        <div style="font-family: 'Noto Sans Bengali', Arial, sans-serif; line-height: 1.6; padding: 20px; border: 1px solid #ddd; background-color: #f9f9f9;">
            <!-- Header Section -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <div style="width: 40%;">
                    <img src="img/${ci.logo}" alt="কোম্পানির লোগো" style="width: 100px;" />
                </div>
                <div style="text-align: right; width: 60%;">
                    <h2 style="margin: 0; font-size: 16px;">${ci.company_name}</h2>
                    <p style="margin: 5px 0; font-size: 14px;">${ci.land_mark}, ${ci.Tal}, ${ci.Dist}, ${ci.pincode}</p>
                    <p style="margin: 5px 0; font-size: 14px;">ফোন: ${ci.phone_no}</p>
                </div>
            </div>

            <!-- Status Section -->
            <div style="text-align: center; margin-bottom: 20px;">
                <h3 style="background-color: #d1e7dd; padding: 10px; border: 1px solid #b2d8cc; margin: 0; font-size: 16px;">${formData.InvoiceStatus}</h3>
            </div>

            <!-- Customer and Invoice Details -->
            <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                <div style="width: 48%; padding: 10px; background-color: #f0f8ff; border: 1px solid #add8e6;">
                    <p style="font-size: 16px;"><strong>গ্রাহকের নাম:</strong> <span style="font-size: 14px;">${formData.customer.name}</span></p>
                    <p style="font-size: 16px;"><strong>গ্রাহকের ঠিকানা:</strong> <span style="font-size: 14px;">${formData.customer.address}</span></p>
                    <p style="font-size: 16px;"><strong>মোবাইল নম্বর:</strong> <span style="font-size: 14px;">${formData.customer.mobile}</span></p>
                </div>
                <div style="width: 48%; padding: 10px; background-color: #e6ffe6; border: 1px solid #e6ffe6;">
                    <p style="font-size: 16px;"><strong>ইনভয়েস নম্বর:</strong> <span style="font-size: 14px;">${invoiceNo}</span></p>
                    <p style="font-size: 16px;"><strong>ইনভয়েসের তারিখ:</strong> <span style="font-size: 14px;">${formData.date.split("-").reverse().join("-")}</span></p>
                    ${
                        formData.InvoiceType === 2
                            ? `<p style="font-size: 16px;"><strong>ডেলিভারির তারিখ:</strong> <span style="font-size: 14px;">${formData.DeliveryDate.split("-").reverse().join("-")}</span></p>`
                            : ""
                    }
                </div>
            </div>

            <!-- Products Table -->
            <h3 style="font-size: 16px;">পণ্যসমূহ</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; text-align: center;">
                <thead>
                    <tr style="background-color: #f0f0f0;">
                        <th style="border: 1px solid #ddd; padding: 8px; font-size: 16px;">ক্রমিক নং</th>
                        <th style="border: 1px solid #ddd; padding: 8px; font-size: 16px;">পণ্যের নাম</th>
                        <th style="border: 1px solid #ddd; padding: 8px; font-size: 16px;">মূল্য (₹)</th>
                        <th style="border: 1px solid #ddd; padding: 8px; font-size: 16px;">পরিমাণ</th>
                        <th style="border: 1px solid #ddd; padding: 8px; font-size: 16px;">মোট (₹)</th>
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
                        <td colspan="4" style="border: 1px solid #ddd; padding: 8px; text-align: right; font-size: 16px; font-weight: bold;"><strong>মোট</strong></td>
                        <td style="border: 1px solid #ddd; padding: 8px; font-size: 14px; text-align: center;">
                            ${formData.discount > 0 ? 
                                `<span>${formData.totalAmount} /-</span>` : 
                                `${formData.totalAmount} /-`
                            }
                        </td>
                    </tr>
                    ${formData.discount > 0 ? `
                        <tr style="background-color: #f8f9fa;">
                            <td colspan="4" style="border: 1px solid #ddd; padding: 8px; text-align: right; font-size: 16px; font-weight: bold;"><strong>ছাড়ের পরে মোট (${formData.discount}%)</strong></td>
                            <td style="border: 1px solid #ddd; padding: 8px; font-size: 14px; text-align: center;">${formData.finalAmount || grandTotal} /-</td>
                        </tr>
                    ` : ''}
                </tbody>
            </table>

            <!-- Payment Details with QR Code Section -->
            <div style="display: flex; justify-content: space-between; margin-bottom: 20px; border: 1px solid #ddd;">
                <!-- Payment Information -->
                <div style="width: 65%; padding: 15px; background-color: #e6ffe6; border-right: 1px solid #ddd;">
                    <h4 style="font-size: 16px; margin-bottom: 15px; color: #2c5530;">পেমেন্টের বিবরণ</h4>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span style="font-size: 16px; font-weight: bold;">প্রদত্ত অর্থ:</span>
                        <span style="font-size: 16px; color: #2c5530;">${formData.amountPaid.toFixed(2)} /-</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span style="font-size: 16px; font-weight: bold;">বকেয়া অর্থ:</span>
                        <span style="font-size: 16px; color: #d73527;">${remainingAmount.toFixed(2)} /-</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span style="font-size: 16px; font-weight: bold;">পেমেন্টের মাধ্যম:</span>
                        <span style="font-size: 16px;">${formData.paymentMode}</span>
                    </div>
                </div>
                
                <!-- QR Code Section -->
                <div style="width: 33%; text-align: center; padding: 15px; background-color: #f8f9fa;">
                    <h4 style="font-size: 16px; margin-bottom: 10px;">কিউআর কোড</h4>
                    <img src="img/${ci.paymentQRCode}" alt="QR Code" style="width: 90px; height: 90px; border: 1px solid #ddd; border-radius: 5px;" />
                    <p style="font-size: 12px; margin-top: 8px; color: #666;">পেমেন্টের জন্য স্ক্যান করুন</p>
                </div>
            </div>

            <p style="font-size: 16px; margin-bottom: 20px;"><strong>কথায় অর্থ:</strong> <span style="font-size: 14px;">${totalAmountWords} টাকা মাত্র</span></p>

            <!-- Footer Section with Bank Details and E-Signature -->
            <div style="display: flex; justify-content: space-between; margin-top: 20px; border: 1px solid #ddd; padding: 15px;">
                <!-- Bank Details -->
                <div style="width: 48%;">
                    <h4 style="font-size: 16px; margin-bottom: 10px;">ব্যাংকের বিবরণ</h4>
                    <p style="font-size: 14px; margin: 5px 0;"><strong>ব্যাংক:</strong> ${ci.bank_name}</p>
                    <p style="font-size: 14px; margin: 5px 0;"><strong>অ্যাকাউন্ট নম্বর:</strong> ${ci.account_no}</p>
                    <p style="font-size: 14px; margin: 5px 0;"><strong>IFSC কোড:</strong> ${ci.IFSC_code}</p>
                </div>
                
                <!-- E-Signature Section -->
                <div style="text-align: center; width: 48%;">
                    <h4 style="font-size: 16px; margin-bottom: 10px;">ই-স্বাক্ষর</h4>
                    <img src="img/${ci.sign}" alt="স্বাক্ষর" style="width: 120px; height: 60px;" />
                    <p style="font-size: 12px; margin-top: 5px;">অনুমোদিত স্বাক্ষর</p>
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

function InvoicePdfBengali() {
    return (
        <div>
            <button onClick={() => {
                const formData = {
                    customer: {
                        name: "শ্রেয়া জি",
                        address: "কারভেনগর",
                        mobile: "১২৩৪৫৬৭৮৯০",
                    },
                    date: "2024-12-31",
                    InvoiceStatus: "বিতরণ সম্পন্ন অর্ডার",
                    InvoiceType: 2,
                    DeliveryDate: "2025-01-01",
                    products: [
                        { product_name: "আপেল", dPrice: 100, dQty: 2, total_price: 200 },
                        { product_name: "কলা", dPrice: 50, dQty: 4, total_price: 200 },
                    ],
                    totalAmount: 400,
                    discount: 10,
                    finalAmount: 360,
                    amountPaid: 300,
                    paymentMode: "অনলাইন"
                };

                generatePDF(360, "INV-001", "শ্রেয়া জি", formData, 60, "তিনশত ষাট");
            }}>
                ইনভয়েস ডাউনলোড করুন
            </button>
        </div>
    );
}

export default InvoicePdfBengali;