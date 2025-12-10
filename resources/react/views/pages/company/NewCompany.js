import React, { useEffect, useRef, useState } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CRow,
  CButton,
  CFormSelect,
  CAlert
} from '@coreui/react';

import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter
} from '@coreui/react';
import { getAPICall, post, postFormData } from '../../../util/api';
import { useToast } from '../../common/toast/ToastContext';
import { getUserData } from '../../../util/session';
import { useTranslation } from 'react-i18next';
import { generateCompanyReceiptPDF } from './companyPdf';
import { register } from '../../../util/api';

function NewCompany() {
  const today = new Date();
  const { showToast } = useToast();
  const user = getUserData();
  
  const defaultDuration = 1; // Monthly by default
  const validTill = new Date(today);
  validTill.setMonth(validTill.getMonth() + defaultDuration);
  const userType = user.type;
  const logedInUserId = user.id;
  const [preparedData, setPreparedData] = useState(null);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
const [receiptPdfData, setReceiptPdfData] = useState(null);
const [partners, setPartners] = useState([]);
const [isMobile, setIsMobile] = useState(false);

// Add this useEffect to detect device type
useEffect(() => {
  const checkDevice = () => {
    const userAgent = navigator.userAgent;
    const isMobileDevice = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isSmallScreen = window.innerWidth <= 768;
    setIsMobile(isMobileDevice || isSmallScreen);
  };

  checkDevice();
  
  // Also check on window resize
  window.addEventListener('resize', checkDevice);
  
  return () => {
    window.removeEventListener('resize', checkDevice);
  };
}, []);
  const [formData, setFormData] = useState({
    companyName: '',
    companyId: '',
    land_mark: '',
    Tal: '',
    Dist: '',
    Pincode: '',
    phone_no: '',
    email_id: '',
    bank_name: '',
    account_no: '',
    IFSC: '',
    gst_number: '', // ✅ New field for GST number  
    pan_number: '', // ✅ New field for PAN number
    logo: '',
    sign: '',
    paymentQRCode: '',
    appMode: 'advance',
    payment_mode: 'online',
    subscribed_plan: 1,
    duration: defaultDuration,
    subscription_validity: validTill.toISOString().split('T')[0],
    refer_by_id: logedInUserId,
    user_name: 'Shop Owner'||'',
password: '',
confirm_password: '',
initials: '',
  });

  const { t } = useTranslation("global");
  const [selectedBillingType, setSelectedBillingType] = useState('');

  const [refData, setRefData] = useState({
    plans: [],
    users: []
  });

  const [formErrors, setFormErrors] = useState({
    phone_no: '',
    email_id: '',
  });
  const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  // ✅ Round to nearest 0.2
const roundToPointTwo = (value) => {
  return Math.round(value * 5) / 5;
};

// ✅ Get monthly amount for selected plan
const getAmount = (subscribed_plan) => {
  const price = refData.plans.find(p => p.id == subscribed_plan)?.price || 0;
  return roundToPointTwo(price);
};

// ✅ Get number of months between today and subscription_validity
const getNumberOfMonths = () => {
  const validityDate = new Date(formData.subscription_validity);
  const todayDate = new Date();

  const yearDiff = validityDate.getFullYear() - todayDate.getFullYear();
  const monthDiff = validityDate.getMonth() - todayDate.getMonth();

  let totalMonths = yearDiff * 12 + monthDiff;

  if (validityDate.getDate() < todayDate.getDate()) {
    totalMonths--;
  }

  return Math.max(totalMonths, 1);
};

// ✅ Get total amount (plan × months), rounded to 0.2
const totalAmount = () => {
  const rawPrice = refData.plans.find(p => p.id == formData.subscribed_plan)?.price || 0;
  const months = getNumberOfMonths();
  const total = rawPrice * months;

  return roundToPointTwo(total); // ✅ round total after full calc
};


// ✅ Get GST (18%) of total, rounded to 0.2
const getGSTAmount = () => {
  const gst = totalAmount() * 0.18;
  return roundToPointTwo(gst);
};


 const handleDurationChange = (event) => {
  const { value } = event.target;
  event.preventDefault();
  event.stopPropagation();

  const newDate = new Date();
  const months = parseInt(value);
  
  // Use setMonth for more accurate month calculation
  newDate.setMonth(newDate.getMonth() + months);
  
  const formattedDate = newDate.toISOString().split('T')[0];
  setFormData({ 
    ...formData,
    duration: parseInt(value), // Make sure to store as integer
    subscription_validity: formattedDate
  });
};


  useEffect(() => {
    const fetchRefData = async () => {
      try {
        const response = await getAPICall('/api/detailsForCompany');
        const partnerResponse = await getAPICall('/api/partnersCompany');
        setRefData(response || { plans: [], users: [] });
        setPartners(partnerResponse || []);
      } catch (error) {
        console.error('Error fetching reference data:', error);
        showToast('danger', 'Failed to load reference data');
      }
    }
    fetchRefData();
  }, [])

 

  
  useEffect(() => {
    if (!window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => console.log("Razorpay script loaded");
      document.body.appendChild(script);
    }
  }, []);

  // New function to handle the file uploads and prepare data
  const prepareFormData = async () => {
    try {
      // Start with a complete copy of formData to ensure all fields are included
      let finalData = {
        ...formData,
        logo: 'invoice/jalseva.jpg',
        sign: 'invoice/empty.png',
        paymentQRCode: 'invoice/empty.png',
      };

      if (formData.logo && typeof formData.logo === 'object') {
        const logoData = new FormData();
        logoData.append("file", formData.logo);
        logoData.append("dest", "invoice");
        const responseLogo = await postFormData('/api/fileUpload', logoData);
        const logoPath = responseLogo?.fileName;
        if (logoPath) {
          finalData.logo = logoPath;
        }
      }
       
      if (formData.sign && typeof formData.sign === 'object') {
        const signData = new FormData();
        signData.append("file", formData.sign);
        signData.append("dest", "invoice");
        const responseSign = await postFormData('/api/fileUpload', signData);
        const signPath = responseSign?.fileName;
        if (signPath) {
          finalData.sign = signPath;
        }
      }

      if (formData.paymentQRCode && typeof formData.paymentQRCode === 'object') {
        const paymentQRCodeData = new FormData();
        paymentQRCodeData.append("file", formData.paymentQRCode);
        paymentQRCodeData.append("dest", "invoice");
        const responsePaymentQRCode = await postFormData('/api/fileUpload', paymentQRCodeData);
        const paymentQRCodePath = responsePaymentQRCode?.fileName;
        if (paymentQRCodePath) {
          finalData.paymentQRCode = paymentQRCodePath;
        }
      }

      return finalData;
    } catch (error) {
      showToast('danger', 'Error uploading files: ' + error.message);
      console.error('Error uploading files:', error);
      return null;
    }
  };


useEffect(() => {
  if (!selectedBillingType) return;

  // Find the first plan that matches the billing type
  const matchingPlan = refData.plans.find(plan => {
    const name = plan.name?.toLowerCase() || '';
    return name.startsWith(selectedBillingType.toLowerCase());
  });

  if (matchingPlan) {
    // Set that plan as selected, and auto-fill duration & validity
    const planName = matchingPlan.name.toLowerCase();
    let monthsToAdd = 1;

    if (planName.startsWith('annually') || planName.startsWith('yearly')) {
      monthsToAdd = 12;
    } else if (planName.startsWith('half-yearly')) {
      monthsToAdd = 6;
    } else if (planName.startsWith('quarterly')) {
      monthsToAdd = 3;
    } else if (planName.startsWith('monthly') || planName.startsWith('free trial')) {
      monthsToAdd = 1;
    }

    const today = new Date();
    const validity = new Date(today);
    validity.setMonth(validity.getMonth() + monthsToAdd);

    setFormData(prev => ({
      ...prev,
      subscribed_plan: matchingPlan.id,
      duration: monthsToAdd,
      subscription_validity: validity.toISOString().split('T')[0]
    }));
  } else {
    // No matching plan, reset fields
    setFormData(prev => ({
      ...prev,
      subscribed_plan: '',
      duration: 1,
      subscription_validity: ''
    }));
  }
}, [selectedBillingType, refData.plans]);



// FIXED handlePayment function
// UPDATED registerCompanyDirectly function
const registerCompanyDirectly = async () => {
  try {
    const preparedFormData = await prepareFormData();
    if (!preparedFormData) {
      showToast('danger', 'Failed to prepare form data');
      return;
    }

    setPreparedData(preparedFormData);

    // ✅ Check duplicate
    try {
      await post('/api/company/check-duplicate', {
        email_id: preparedFormData.email_id,
        phone_no: preparedFormData.phone_no,
      });
    } catch (error) {
      showToast('danger', 'Email id or Mobile number is already taken');
      return;
    }

    const companyResponse = await post('/api/company', preparedFormData);
    if (companyResponse?.details?.company_id) {
      showToast('success', 'Company Registration Successful!');

      const userData = {
        name: formData.user_name || 'Shop Owner',
        email: preparedFormData.email_id,
        mobile: preparedFormData.phone_no,
        password: formData.password,
        password_confirmation: formData.confirm_password,
        type: '1',
        company_id: companyResponse.details.company_id
      };

      try {
        const userResp = await register(userData);
        if (userResp) {
          showToast('success', 'Default user created successfully.');
        } else {
          showToast('danger', 'Company created but failed to create default user.');
        }
      } catch (err) {
        console.error('Error creating user:', err);
        showToast('danger', 'Company created but error while creating user.');
      }

      // Build receipt data
      const currentPlan = refData.plans.find(p => p.id == preparedFormData.subscribed_plan);
      const startDate = new Date().toISOString().split('T')[0];
      const durationMonths = getNumberOfMonths();
      const totalPlanAmount = currentPlan?.price || 0;
      const amountPerMonth = durationMonths > 0 ? (totalPlanAmount / durationMonths) : 0;

      const receiptData = {
        company_id: companyResponse.details.company_id,
        plan_id: preparedFormData.subscribed_plan,
        user_id: logedInUserId,
        total_amount: totalAmount(),
        start_date: startDate,
        valid_till: preparedFormData.subscription_validity,
        transaction_id: formData.payment_mode === 'cash' ? 'CASH_PAYMENT' : 'FREE_PLAN',
        transaction_status: formData.payment_mode === 'cash' ? 'cash_received' : 'success',
        payment_mode: formData.payment_mode,
        renewal_type: 'new_registration',
        plan: currentPlan,
        company: {
          company_name: preparedFormData.companyName,
          phone_no: preparedFormData.phone_no,
          email_id: preparedFormData.email_id,
        }
      };

      try {
        await post('/api/company-receipt', receiptData);
      } catch (e) {
        console.error('Receipt API error:', e);
      }

      setReceiptPdfData(receiptData); // ✅ FIX: Set for WhatsApp sharing
      setShowWhatsAppModal(true);
      resetForm();

    } else {
      showToast('danger', 'Company registration failed.');
    }

  } catch (error) {
    console.error('Registration error:', error);
    showToast('danger', 'Company registration failed: ' + error.message);
  }
};




// UPDATED handlePayment function
const handlePayment = async () => {
  try {
    const preparedFormData = await prepareFormData();
    if (!preparedFormData) {
      showToast('danger', 'Failed to prepare form data');
      return;
    }

    setPreparedData(preparedFormData);

    // ✅ Check duplicate
    try {
      await post('/api/company/check-duplicate', {
        email_id: preparedFormData.email_id,
        phone_no: preparedFormData.phone_no,
      });
    } catch (error) {
      showToast('danger', 'Email id or Mobile number is already taken');
      return;
    }

    const currentPlan = refData.plans.find(p => p.id == preparedFormData.subscribed_plan);
    const paymentAmount = totalAmount();
    const baseAmount = paymentAmount - getGSTAmount();
    const gstAmount = getGSTAmount();
    const startDate = new Date().toISOString().split('T')[0];
    const durationMonths = getNumberOfMonths();
    const totalPlanAmount = currentPlan?.price || 0;
    const amountPerMonth = durationMonths > 0 ? (totalPlanAmount / durationMonths) : 0;

    const data = await post("/api/create-order", { amount: paymentAmount });
    if (!data) {
      showToast('danger', 'Technical issue: Could not create payment order');
      return;
    }

    const options = {
      key: data.key,
      amount: data.order.amount,
      currency: data.order.currency,
      order_id: data.order.id,
      name: "Nursery Seva",
      handler: async (response) => {
        const verifyResponse = await post("/api/verify-payment", {
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        });

        if (verifyResponse?.success) {
          try {
            const companyResponse = await post('/api/company', preparedFormData);
            if (companyResponse?.details?.company_id) {
              showToast('success', 'Company Registration Successful!');

              const userData = {
                name: formData.user_name || 'Shop Owner',
                email: preparedFormData.email_id,
                mobile: preparedFormData.phone_no,
                password: formData.password,
                password_confirmation: formData.confirm_password,
                type: '1',
                company_id: companyResponse.details.company_id
              };

              try {
                const userResp = await register(userData);
                if (userResp) {
                  showToast('success', 'Default user created successfully.');
                } else {
                  showToast('danger', 'Company created but failed to create default user.');
                }
              } catch (err) {
                console.error('User creation error:', err);
                showToast('danger', 'Company created but error while creating user.');
              }

              const receiptData = {
                company_id: companyResponse.details.company_id,
                plan_id: preparedFormData.subscribed_plan,
                user_id: logedInUserId,
                total_amount: paymentAmount,
                start_date: startDate,
                price: amountPerMonth,
                valid_till: preparedFormData.subscription_validity,
                transaction_id: response.razorpay_payment_id,
                transaction_status: 'success',
                payment_mode: 'online',
                renewal_type: 'new_registration',
                plan: currentPlan,
                company: {
                  company_name: preparedFormData.companyName,
                  phone_no: preparedFormData.phone_no,
                  email_id: preparedFormData.email_id,
                }
              };

              try {
                await post('/api/company-receipt', receiptData);
              } catch (e) {
                console.error('Receipt save error:', e);
              }

              setReceiptPdfData(receiptData); // ✅ FIX: Now available for sharing
              setShowWhatsAppModal(true);
              resetForm();

            } else {
              showToast('danger', 'Payment succeeded but company registration failed.');
            }
          } catch (error) {
            console.error('Company registration error:', error);
            showToast('danger', 'Payment was successful but company registration failed: ' + error.message);
          }
        } else {
          showToast('info', 'Payment verification failed');
        }
      },
      prefill: {
        name: preparedFormData.companyName,
        email: preparedFormData.email_id,
        contact: preparedFormData.phone_no
      },
      theme: {
        color: "#3399cc",
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();

    razorpay.on("payment.failed", (response) => {
      console.error("Payment Failed:", response.error);
      showToast('danger', 'Payment failed. Company registration canceled.');
    });

  } catch (error) {
    console.error("Payment process error:", error);
    showToast('danger', 'Something went wrong with payment: ' + error.message);
  }
};



  useEffect(() => {
    if (!formData.duration) return;

    const currentDate = new Date();
    const validTill = new Date(currentDate);
    validTill.setMonth(validTill.getMonth() + parseInt(formData.duration));

    const formattedDate = validTill.toISOString().split("T")[0];
    setFormData(prev => ({
      ...prev,
      subscription_validity: formattedDate,
    }));
  }, [formData.duration]);

  const logoInputRef = useRef(null);
  const signInputRef = useRef(null);
  const paymentQRCodeInputRef = useRef(null);
  const [validated, setValidated] = useState(false);

  const appModes = [
    { label: 'Basic', value: 'basic' },
    { label: 'Advance', value: 'advance' },
  ];

 const getDurationOptions = () => {
  const selectedPlan = refData.plans.find(p => p.id == formData.subscribed_plan);
  const name = selectedPlan?.name?.toLowerCase() || '';

  if (name.includes('free trial')) {
    return [{ label: '1 Month', value: 1 }];
  } else if (name.includes('monthly')) {
    return [{ label: '1 Month', value: 1 }];
  } else if (name.includes('quarterly')) {
    return [{ label: '3 Months', value: 3 }];
  } else if (name.includes('half-yearly')) {
    return [{ label: '6 Months', value: 6 }];
  } else if (name.includes('annually') || name.includes('yearly')) {
    return [{ label: '12 Months', value: 12 }];
  }

  // Default fallback
  return [
    { label: '1 Month', value: 1 },
    { label: '3 Months', value: 3 },
    { label: '6 Months', value: 6 },
    { label: '12 Months', value: 12 }
  ];
};


const handleShareWhatsApp = async () => {
  try {
    if (!receiptPdfData) {
      showToast('danger', 'Receipt data not available');
      return;
    }

    // Generate PDF as blob first
    const pdfBlob = await generateCompanyReceiptPDFBlob(receiptPdfData);

    if (!pdfBlob) {
      throw new Error('Failed to generate PDF blob');
    }

    const file = new File([pdfBlob], `Company-Receipt-${formData.companyName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`, {
      type: 'application/pdf',
    });

    // Check if native sharing is supported and can share files
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: `Company Registration Receipt - ${formData.companyName}`,
          text: `Company registration completed successfully for ${formData.companyName}!`,
          files: [file],
        });
        showToast('success', 'Receipt shared successfully');
        return;
      } catch (shareError) {
        console.log('Native share failed, falling back to manual method:', shareError);
      }
    }

    // Fallback: Download PDF and open WhatsApp contact selector
    fallbackToWhatsAppWithContactSelector(file);

  } catch (error) {
    console.error('Error in handleShareWhatsApp:', error);
    showToast('danger', 'Failed to share receipt: ' + error.message);
  }
};

const fallbackToWhatsAppWithContactSelector = (file) => {
  try {
    // First, download the PDF file
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Then open WhatsApp Web without specific contact (user can choose)
    const message = encodeURIComponent(
      `Hello! Company registration for ${formData.companyName} is completed successfully. Please find the receipt PDF attached.`
    );
    
    // Open WhatsApp Web main page so user can select contact
    const whatsappUrl = `https://web.whatsapp.com/send?text=${message}`;
    
    const whatsappWindow = window.open(whatsappUrl, '_blank', 'width=800,height=600');
    
    // Show instructions to user
    showToast('info', 'PDF downloaded! WhatsApp Web opened - select a contact and attach the downloaded PDF file.');
    
    // Optional: Show additional instructions in a more prominent way
    setTimeout(() => {
      if (whatsappWindow && !whatsappWindow.closed) {
        showToast('info', 'Instructions: 1) Select contact in WhatsApp 2) Click attachment icon 3) Choose "Document" 4) Select the downloaded PDF file');
      }
    }, 3000);

  } catch (error) {
    console.error('Error in fallbackToWhatsAppWithContactSelector:', error);
    showToast('danger', 'Failed to open WhatsApp: ' + error.message);
  }
};

// Alternative method - Opens WhatsApp with contact selection on mobile
const handleShareWhatsAppMobile = async () => {
  try {
    if (!receiptPdfData) {
      showToast('danger', 'Receipt data not available');
      return;
    }

    // Generate PDF as blob
    const pdfBlob = await generateCompanyReceiptPDFBlob(receiptPdfData);
    if (!pdfBlob) {
      throw new Error('Failed to generate PDF blob');
    }

    const file = new File([pdfBlob], `Company-Receipt-${formData.companyName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`, {
      type: 'application/pdf',
    });

    // For mobile devices, try to use the share API which will show contact selector
    if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      if (navigator.share) {
        try {
          await navigator.share({
            title: `Company Registration Receipt - ${formData.companyName}`,
            text: `Company registration completed successfully for ${formData.companyName}!`,
            files: [file],
          });
          showToast('success', 'Receipt shared successfully');
          return;
        } catch (shareError) {
          console.log('Mobile share failed:', shareError);
        }
      }
      
      // Mobile fallback - open WhatsApp app with intent
      const message = encodeURIComponent(
        `Company registration for ${formData.companyName} completed successfully! Receipt attached.`
      );
      
      // Download file first
      const url = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Open WhatsApp app (will show contact selector on mobile)
      window.location.href = `whatsapp://send?text=${message}`;
      
      showToast('info', 'PDF downloaded! WhatsApp opened - select contact and attach the PDF.');
      
    } else {
      // Desktop fallback
      fallbackToWhatsAppWithContactSelector(file);
    }

  } catch (error) {
    console.error('Error in handleShareWhatsAppMobile:', error);
    showToast('danger', 'Failed to share receipt: ' + error.message);
  }
};

// Update the generateCompanyReceiptPDFBlob function to work with your existing PDF generation
const generateCompanyReceiptPDFBlob = async (pdfData) => {
  return new Promise((resolve, reject) => {
    try {
      // Modify your existing generateCompanyReceiptPDF function to accept a callback
      // and return blob instead of auto-downloading
      generateCompanyReceiptPDF(pdfData, 'blob', (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to generate PDF blob'));
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};
  const handleChange = (event) => {
    const { name, value, files } = event.target;
    if (files && files.length > 0) {
      setFormData({ ...formData, [name]: files[0] }); // Ensure the file is stored as a file object
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const resetForm = () => {
  const newValidTill = new Date(today);
  newValidTill.setMonth(newValidTill.getMonth() + defaultDuration);

  setFormData({
    companyName: '',
    companyId: '',
    land_mark: '',
    Tal: '',
    Dist: '',
    Pincode: '',
    phone_no: '',
    email_id: '',
    bank_name: '',
    account_no: '',
    IFSC: '',
    gst_number: '', // ✅ New field for GST number  
    pan_number: '', // ✅ New field for PAN number
    logo: '',
    sign: '',
    paymentQRCode: '',
    appMode: 'advance',
    subscribed_plan: 1,
    duration: defaultDuration,
    subscription_validity: newValidTill.toISOString().split('T')[0],
    refer_by_id: logedInUserId,

    // ✅ Added fields
    user_name:'Shop Owner'|| '',
    password: '',
    confirm_password: '',
  });

  if (logoInputRef.current) {
    logoInputRef.current.value = '';
  }
  if (signInputRef.current) {
    signInputRef.current.value = '';
  }
  if (paymentQRCodeInputRef.current) {
    paymentQRCodeInputRef.current.value = '';
  }

  setPreparedData(null);
  setValidated(false);
};

  
  const handleSubmit = async (event) => {
    const form = event.currentTarget;
    event.preventDefault();
    event.stopPropagation();
    setValidated(true);
    
    if (form.checkValidity() !== true) {
      showToast('danger', 'Kindly provide data of all required fields');
      return;
    }

    if (!formData.user_name || !formData.password || !formData.confirm_password) {
  showToast('danger', 'Please fill all user fields.');
  return;
}

if (formData.password !== formData.confirm_password) {
  showToast('danger', 'Passwords do not match.');
  return;
}
    
    // Check if total amount is 0 (free plan)
   if (totalAmount() === 0 || formData.payment_mode === 'cash') {
  registerCompanyDirectly();
} else {
  handlePayment();
}

  };

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className='mb-3'>
          <CCardHeader>
            <strong>{t("LABELS.new_shop")}</strong>
          </CCardHeader>
          <CCardBody>
            <CForm noValidate validated={validated} onSubmit={handleSubmit} encType='multipart/form-data'>
              <div className='row'>
               <div className='col-sm-4'>
                  <div className='mb-3'>
                    <CFormLabel htmlFor="land_mark">{t("LABELS.company_name")}</CFormLabel>
                    <CFormInput
                      type='text'
                      name='companyName'
                      id='companyName'
                      maxLength="100"
                      value={formData.companyName}
                      onChange={handleChange}
                      feedbackInvalid="Please provide valid data."
                      required
                    />
                  </div>
                </div>
                <div className='col-sm-8'>
                  <div className='mb-3'>
                    <CFormLabel htmlFor="land_mark">{t("LABELS.address_label")}</CFormLabel>
                    <CFormInput
                      type='text'
                      name='land_mark'
                      id='land_mark'
                      maxLength="100"
                      value={formData.land_mark}
                      onChange={handleChange}
                      feedbackInvalid="Please provide shop address."
                      required
                    />
                  </div>
                </div>

                {/* Add new row for Taluka, District, Pincode */}
<div className='row'>
  <div className='col-sm-4'>
    <div className='mb-3'>
      <CFormLabel htmlFor="Tal">{t("LABELS.taluka") || "Taluka"}</CFormLabel>
      <CFormInput
        type='text'
        name='Tal'
        id='Tal'
        maxLength="50"
        value={formData.Tal}
        onChange={handleChange}
        feedbackInvalid="Please provide taluka."
        required
      />
    </div>
  </div>
  <div className='col-sm-4'>
    <div className='mb-3'>
      <CFormLabel htmlFor="Dist">{t("LABELS.district") || "District"}</CFormLabel>
      <CFormInput
        type='text'
        name='Dist'
        id='Dist'
        maxLength="50"
        value={formData.Dist}
        onChange={handleChange}
        feedbackInvalid="Please provide district."
        required
      />
    </div>
  </div>
  <div className='col-sm-4'>
    <div className='mb-3'>
      <CFormLabel htmlFor="Pincode">{t("LABELS.pincode") || "Pincode"}</CFormLabel>
      <CFormInput
        type='text'
        name='Pincode'
        id='Pincode'
        maxLength="6"
        minLength="6"
        pattern="[0-9]{6}"
        value={formData.Pincode}
        onChange={handleChange}
        feedbackInvalid="Please provide valid 6-digit pincode."
        required
      />
    </div>
  </div>
</div>
               </div>
              <div className='row'>
                <div className='col-sm-4'>
                  <div className='mb-3'>
                    <CFormLabel htmlFor="phone_no">{t("LABELS.mobile_number")}</CFormLabel>
                    <CFormInput
                      type='text'
                      name='phone_no'
                      id='phone_no'
                      value={formData.phone_no}
                      onChange={handleChange}
                      invalid={!!formErrors.phone_no}
                      feedbackInvalid={formErrors.phone_no != '' ? formErrors.phone_no : "Please provide valid 10 digit mobile." }
                      pattern="\d{10}"
                      required
                      minLength={10}
                      maxLength={10}
                    />
                  </div>
                </div>
                <div className='col-sm-4'>
                  <div className='mb-3'>
                    <CFormLabel htmlFor="email_id">{t("LABELS.email")}</CFormLabel>
                    <CFormInput
                      type='email'
                      name='email_id'
                      id='email_id'
                      invalid={!!formErrors.email_id}
                      value={formData.email_id}
                      onChange={handleChange}
                      feedbackInvalid={formErrors.email_id != '' ? formErrors.email_id : "Please provide email address." }
                      required
                    />
                  </div>
                </div>
                <div className='col-sm-4'>
  <div className='mb-3'>
    <CFormLabel htmlFor="initials">{t("LABELS.initials") || "Initials"}</CFormLabel>
    <CFormInput
      type='text'
      name='initials'
      id='initials'
      maxLength="10"
      value={formData.initials}
      onChange={handleChange}
    />
  </div>
</div>

                {/* <div className='col-sm-4'>
                  <div className='mb-3'>
                  <CFormLabel htmlFor="appMode">{t("LABELS.app_mode")}</CFormLabel>
                    <CFormSelect
                      aria-label="Select Application Mode"
                      value={formData.appMode}
                      id="appMode"
                      name="appMode"
                      options={appModes}
                      onChange={handleChange}
                      required
                      feedbackInvalid="Select an application mode."
                    />
                  </div>
                </div> */}
               </div>
              <div className='row'>
                <div className='col-sm-4'>
                  <div className='mb-3'>
                    <CFormLabel htmlFor="bank_name">{t("LABELS.bank_name")}</CFormLabel>
                    <CFormInput
                      type='text'
                      name='bank_name'
                      id='bank_name'
                      value={formData.bank_name}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className='col-sm-4'>
                  <div className='mb-3'>
                    <CFormLabel htmlFor="account_no">{t("LABELS.account_number")}</CFormLabel>
                    <CFormInput
                      type='number'
                      name='account_no'
                      id='account_no'
                      value={formData.account_no}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className='col-sm-4'>
                  <div className='mb-3'>
                    <CFormLabel htmlFor="IFSC">{t("LABELS.IFSC")}</CFormLabel>
                    <CFormInput
                      type='text'
                      name='IFSC'
                      id='IFSC'
                      value={formData.IFSC}
                      onChange={handleChange}
                    />
                  </div>
                </div>
               </div>


                  <div className='row'>
                <div className='col-sm-6'>
                  <div className='mb-3'>
                    <CFormLabel htmlFor="gst_number">{t("LABELS.gst_number")}</CFormLabel>
                    <CFormInput
                      type='text'
                      name='gst_number'
                      id='gst_number'
                      value={formData.gst_number}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className='col-sm-6'>
                  <div className='mb-3'>
                    <CFormLabel htmlFor="pan_number">{t("LABELS.pan_number")}</CFormLabel>
                    <CFormInput
                      type='text'
                      name='pan_number'
                      id='pan_number'
                      value={formData.pan_number}
                      onChange={handleChange}
                    />
                  </div>
                </div>
               </div>


              <div className='row'>
                <div className='col-sm-4'>
                  <div className='mb-3'>
                    <CFormLabel htmlFor="logo">{t("LABELS.logo")}</CFormLabel>
                    <CFormInput
                      type='file'
                      name='logo'
                      id='logo'
                      accept='image/png/jpeg'
                      onChange={handleChange}
                      ref={logoInputRef}
                    />
                  </div>
                </div> 
                <div className='col-sm-4'>
                  <div className='mb-3'>
                    <CFormLabel htmlFor="sign">{t("LABELS.sign")}</CFormLabel>
                    <CFormInput
                      type='file'
                      name='sign'
                      id='sign'
                      accept='image/png/jpeg'
                      onChange={handleChange}
                      ref={signInputRef}
                    />
                  </div>
                </div>
                <div className='col-sm-4'>
                  <div className='mb-3'>
                      <CFormLabel htmlFor="paymentQRCode">{t("LABELS.qr_img")}</CFormLabel>
                      <CFormInput
                        type='file'
                        name='paymentQRCode'
                        id='paymentQRCode'
                        accept='image/png/jpeg'
                        onChange={handleChange}
                        ref={paymentQRCodeInputRef}
                      />
                  </div>
                </div>
              </div>
              
              <div className='row'>
              <div className='col-sm-4'>
                <div className='mb-3'>
                  <CFormLabel htmlFor="payment_mode">{t("LABELS.payment_mode") || "Payment Mode"}</CFormLabel>
                  <CFormSelect
                    id="payment_mode"
                    name="payment_mode"
                    value={formData.payment_mode}
                    onChange={handleChange}
                    required
                  >
                    <option value="online">Online</option>
                    <option value="cash">Cash</option>
                  </CFormSelect>
                </div>
              </div>

              <div className="col-sm-3">
  <div className="mb-3">
    <CFormLabel htmlFor="billing_type">Billing Type</CFormLabel>
    <CFormSelect
      id="billing_type"
      name="billing_type"
      value={selectedBillingType}
      onChange={(e) => {
        setSelectedBillingType(e.target.value);
        setFormData((prev) => ({
          ...prev,
          subscribed_plan: '', // Reset plan when billing type changes
        }));
      }}
    >
      <option value="">-- Free Trial --</option>
      <option value="monthly">Monthly</option>
      <option value="quarterly">Quarterly</option>
      <option value="half-yearly">Half-Yearly</option>
      <option value="annually">Annually</option>
    </CFormSelect>
  </div>
</div>


              <div className='col-sm-3'>
  <div className='mb-3'>
    <CFormLabel htmlFor="subscribed_plan">{t("LABELS.plan")}</CFormLabel>
    <CFormSelect
      aria-label="Select Plan"
      value={formData.subscribed_plan}
      id="subscribed_plan"
      name="subscribed_plan"
      onChange={handleChange}
      required
      feedbackInvalid="Select a plan."
      options={
        refData.plans
          .filter((plan) => {
            const name = plan.name?.toLowerCase() || '';
            if (!selectedBillingType) return name.includes('free trial');
            return name.includes(selectedBillingType.toLowerCase());
          })
          .map(plan => ({
            value: plan.id,
            label: plan.name
          }))
      }
    />
  </div>
</div>

               {(userType == 0 || userType == 3) && (
  <div className='col-sm-3'>
    <div className='mb-3'>
      <CFormLabel htmlFor="refer_by_id">{t("LABELS.partner")}</CFormLabel>
      <CFormSelect
        aria-label="Select Partner"
        value={formData.refer_by_id}
        id="refer_by_id"
        name="refer_by_id"
        onChange={handleChange}
        required
        feedbackInvalid="Select an application mode."
      >
        <option value="">-- Select Partner --</option>
        {partners.map(p => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </CFormSelect>
    </div>
  </div>
)}

                <div className='col-sm-3'>
                  <div className='mb-3'>
                    <CFormLabel htmlFor="duration">{t("LABELS.plan_duration")}</CFormLabel>
                    <CFormSelect
                      aria-label="Select duration"
                      id="duration"
                      name="duration"
                      value={formData.duration} // Add this line to show current selected value
                      options={getDurationOptions()}
                      onChange={handleDurationChange}
                      required
                      feedbackInvalid="Select duration."
                    />
                  </div>
                </div>
                <div className='col-sm-3'>
                  <div className='mb-3'>
                  <CFormLabel htmlFor="subscription_validity">{t("LABELS.validity")}</CFormLabel>
                    <CFormInput
                        type="date"
                        id="subscription_validity"
                        name="subscription_validity"
                        value={formData.subscription_validity}
                        onChange={handleChange}
                        required
                        readOnly
                      />
                  </div>
                </div>
              </div>
              
 <div className="row">
  <div className="col-sm-12">
    <h5 className="mt-3 mb-2">User Creation</h5>
  </div>
  <div className="col-sm-4">
    <div className="mb-3">
      <CFormLabel htmlFor="user_name">User Name</CFormLabel>
      <CFormInput
        type="text"
        name="user_name"
        id="user_name"
        value={formData.user_name}
        onChange={handleChange}
        required
        feedbackInvalid="Please enter user name."
      />
    </div>
  </div>

  <div className="col-sm-4">
    <div className="mb-3 position-relative">
      <CFormLabel htmlFor="password">Password</CFormLabel>
      <CFormInput
        type={showPassword ? "text" : "password"}
        name="password"
        id="password"
        value={formData.password}
        onChange={handleChange}
        required
        feedbackInvalid="Please enter password."
      />
      <span
        style={{
          position: "absolute",
          top: "38px",
          right: "10px",
          cursor: "pointer",
          fontSize: "1.2rem",
        }}
        title={showPassword ? "Hide Password" : "Show Password"}
        onClick={() => setShowPassword(!showPassword)}
      >
        {showPassword ? "🔒" : "👁️"}
      </span>
    </div>
  </div>

  <div className="col-sm-4">
    <div className="mb-3 position-relative">
      <CFormLabel htmlFor="confirm_password">Confirm Password</CFormLabel>
      <CFormInput
        type={showConfirmPassword ? "text" : "password"}
        name="confirm_password"
        id="confirm_password"
        value={formData.confirm_password}
        onChange={handleChange}
        required
        feedbackInvalid="Please confirm password."
      />
      <span
        style={{
          position: "absolute",
          top: "38px",
          right: "10px",
          cursor: "pointer",
          fontSize: "1.2rem",
        }}
        title={showConfirmPassword ? "Hide Password" : "Show Password"}
        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
      >
        {showConfirmPassword ? "🔒" : "👁️"}
      </span>
    </div>
  </div>
</div>


              <div className="row">
                <div className='col-sm-12'>
                  <CAlert color="success">
                    <h4>Payment Details</h4>
                    Amount (Per Month): {getAmount(formData.subscribed_plan)}<br/>
                    Number of months: {getNumberOfMonths()}<br/>
                    Total Amount: {totalAmount() - getGSTAmount()}<br/>
                    GST (18%): {getGSTAmount()}<br/>
                    <b>Final Payable Amount:</b> {totalAmount()}
                  </CAlert>
                </div>
              </div>
              <CButton type="submit" color="primary">
                {totalAmount() === 0 ? t("LABELS.submit") || "Submit" : t("LABELS.submit_pay")}
              </CButton>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
      <CModal visible={showWhatsAppModal} onClose={() => setShowWhatsAppModal(false)}>
  <CModalHeader>
    <CModalTitle>Company Registered Successfully!</CModalTitle>
  </CModalHeader>
  <CModalBody>
    <p>Your company <strong>{formData.companyName}</strong> has been registered successfully.</p>
    <p>Choose how you'd like to save and share the receipt:</p>
  </CModalBody>
  <CModalFooter>
    <CButton color="secondary" onClick={() => setShowWhatsAppModal(false)}>
      Close
    </CButton>
    <CButton 
      color="success" 
      onClick={() => {
        generateCompanyReceiptPDF(receiptPdfData);
        setShowWhatsAppModal(false);
      }}
    >
      Save PDF Only
    </CButton>
    {isMobile ? (
      // Mobile/Tablet View
      <CButton 
        color="primary" 
        onClick={() => {
          handleShareWhatsAppMobile();
          setShowWhatsAppModal(false);
        }}
      >
        Share on WhatsApp
      </CButton>
    ) : (
      // Desktop/Laptop View
      <CButton 
        color="primary" 
        onClick={() => {
          handleShareWhatsApp();
          setShowWhatsAppModal(false);
        }}
      >
        Share via WhatsApp Web
      </CButton>
    )}
  </CModalFooter>
</CModal>
    </CRow>
  )
}

export default NewCompany;