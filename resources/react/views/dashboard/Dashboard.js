import React, { useEffect, useState } from 'react'
import { useRef } from 'react';
import { Link } from 'react-router-dom'

import {
  CCard,
  CCardBody,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CForm,
  CFormLabel,
  CFormSelect,
  CAlert,
  CBadge,
  CFormCheck,
} from '@coreui/react'

import { cilCloudUpload, cilPlus, cilSearch } from '@coreui/icons'
import CIcon from '@coreui/icons-react'

import WidgetsDropdown from '../widgets/WidgetsDropdown'
import MainChart from './MainChart'

import { getAPICall, post, postFormData, postFormDataCsv } from '../../util/api'
import { getUserData, getUserType, getFullUserData } from '../../util/session'
import { useToast } from '../common/toast/ToastContext'
import { useTranslation } from 'react-i18next'
import { generateCompanyReceiptPDF } from '../pages/company/companyPdf' // Import the PDF generator

// Duration options for subscription
const durationOptions = [
  { value: 1, label: '1 Month' },
  { value: 3, label: '3 Months' },
  { value: 6, label: '6 Months' },
  { value: 12, label: 'Yearly' },
  // { value: 24, label: '24 Months' },
]



const Dashboard = (Props) => {
  const user = getUserType()
  const [reportMonth, setReportMonth] = useState({
    monthlySales: Array(12).fill(0),
    monthlyExpense: Array(12).fill(0),
    monthlyPandL: Array(12).fill(0),
  })
  const [stock, setStock] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const { showToast } = useToast()
  const [userData, setUserData] = useState(getUserData())
  const [selectedStockFilter, setSelectedStockFilter] = useState(null);

  const mode = userData?.company_info?.appMode ?? 'advance'
  const { t, i18n } = useTranslation('global')
  const lng = i18n.language

  const [refData, setRefData] = useState({
  plans: [],
});

    const [quantityModal, setQuantityModal] = useState({
    visible: false,
    product: null,
    addedQty: 0,
    maxAddable: 0, // Add this field
  });

  const [selectedBillingType, setSelectedBillingType] = useState('');


// Inside your component
const toastShownRef = useRef(false);

const handleQuantityChange = (e) => {
  const value = e.target.value;
  const maxAddable = quantityModal.maxAddable;

  if (value === '') {
    setQuantityModal((prev) => ({ ...prev, addedQty: '' }));
    toastShownRef.current = false; // Reset when input is cleared
    return;
  }

  const val = parseInt(value, 10);

  if (isNaN(val) || val < 0) {
    setQuantityModal((prev) => ({ ...prev, addedQty: 0 }));
    toastShownRef.current = false;
  } else if (val > maxAddable) {
    setQuantityModal((prev) => ({ ...prev, addedQty: maxAddable }));

    if (!toastShownRef.current) {
      showToast('warning', t('MESSAGES.maximum_stock_limit', { max: maxAddable }));
      toastShownRef.current = true;
    }
  } else {
    setQuantityModal((prev) => ({ ...prev, addedQty: val }));
    toastShownRef.current = false; // Reset once valid
  }
};

const openQuantityModal = (product) => {
  const currentStock = product.stock ?? 0;
  const totalQuantity = product.qty ?? 0;
  const maxAddable = totalQuantity - currentStock;

  setQuantityModal({ 
    visible: true, 
    product, 
    addedQty: maxAddable > 0 ? 1 : 0,
    maxAddable 
  });
};


const updateQuantity = async () => {
  try {
    const sizeId = quantityModal.product.id; // this is the size id
    const productId = quantityModal.product.product_id; // this is the product id

    const payload = {
      size_id: sizeId,
      added_qty: Number(quantityModal.addedQty)
    };

    const response = await post(`/api/product/${productId}/update-quantity`, payload);

    if (response.success !== false) {
      showToast('success', t('MESSAGES.stock_updated_success'));
      setQuantityModal({ visible: false, product: null, addedQty: 0, maxAddable: 0 });
      fetchStock();
    } else {
      showToast('danger', t('MESSAGES.update_stock_failed', { error: response.message || '-' }));
    }
  } catch (err) {
    const errorMessage = err.response?.data?.message || err.message || '-';
    showToast('danger', t('MESSAGES.update_stock_failed', { error: errorMessage }));
  }
};




  const [newProductModal, setNewProductModal] = useState({
      visible: false,
      localNameEdited: false,
      formData: {
        name: '',
        localName: '',
        slug: '',
        categoryId: 0,
        incStep: 1,
        desc: '',
        multiSize: false,
        show: true,
        returnable: true,
        showOnHome: true,
        unit: '',
        qty: '',
        stock:'',
        oPrice: '',
        // bPrice: '',
        media: [],
        sizes: [],
      },
      images: [] 
    });

  const isCreditReportPlan = () => {
  const planName = userData?.company_info?.subscribed_plan_name?.toLowerCase() || '';

  const restrictedPlans = [
    'monthly business essential (start-up) - credit report',
    'quarterly business essential (start-up) - credit report',
    'half-yearly business essential (start-up) - credit report',
    'annually business essential (start-up) - credit report',
   
  ];

  return restrictedPlans.includes(planName);
};

    const isRestrictedPlan = () => {
  const planName = userData?.company_info?.subscribed_plan_name?.toLowerCase() || '';

  const restrictedPlans = [
    'monthly business essential (start-up) - credit report',
    'monthly business essential (start-up) - advanced booking',
    'quarterly business essential (start-up) - credit report',
    'quarterly business essential (start-up) - advanced booking',
    'half-yearly business essential (start-up) - credit report',
    'half-yearly business essential (start-up) - advanced booking',
    'annually business essential (start-up) - credit report',
    'annually business essential (start-up) - advanced booking'
  ];

  return restrictedPlans.includes(planName);
};

  
    // Bulk Upload Modal State
    const [bulkUploadModal, setBulkUploadModal] = useState({
      visible: false,
      csvFile: null,
      isUploading: false,
      message: '',
      isError: false,
    });

  // Subscription validity states - now fetched from API
  const [showValidityModal, setShowValidityModal] = useState(false)
  const [subscriptionData, setSubscriptionData] = useState(null)
  const [plans, setPlans] = useState([])
  const [renewalForm, setRenewalForm] = useState({
    plan_id: 1,
    duration: 1, // months
    validity_date: ''
  })
  const [loading, setLoading] = useState(false)

  // Banner visibility state
  const [showBanner, setShowBanner] = useState(false)

  // Fetch subscription status from API
  const fetchSubscriptionStatus = async () => {
    try {
      if (user === 1 && userData?.company_id) {
        setLoading(true)
        console.log('Fetching subscription status for company:', userData.company_id)
        
        const response = await getAPICall(`/api/company/subscription-status/${userData.company_id}`)
        
        if (response) {
          console.log('Subscription status received:', response)
          setSubscriptionData(response)
          
          // Check if subscription needs attention
          if (response.is_expired || response.is_expiring_soon) {
            setShowBanner(true)
            
            // If expired, show modal immediately
            if (response.is_expired) {
              setShowValidityModal(true)
            }
          } else {
            setShowBanner(false)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching subscription status:', error)
      showToast('danger', 'Failed to fetch subscription status')
    } finally {
      setLoading(false)
    }
  }


    // New Product Modal Functions
    const openNewProductModal = () => {
      setNewProductModal({
        visible: true,
        localNameEdited: false,
        formData: {
          name: '',
          localName: '',
          slug: '',
          categoryId: 0,
          incStep: 1,
          desc: '',
          multiSize: false,
          show: true,
          returnable: true,
          showOnHome: true,
          unit: '',
          qty: '',
          stock: '',
          oPrice: '',
          // bPrice: '',
          media: [],
          sizes: [],
        }
      });
    };
  
    const closeNewProductModal = () => {
      setNewProductModal(prev => ({ ...prev, visible: false }));
    };
  
  const handleNewProductChange = (e) => {
    const { name, value } = e.target;
    const numericFields = ['qty', 'stock', 'incStep']; // Removed 'oPrice' from here
    
    if (numericFields.includes(name)) {
      // Allow empty string for clearing the field
      if (value === '') {
        setNewProductModal(prev => ({
          ...prev,
          formData: { ...prev.formData, [name]: '' }
        }));
        return;
      }
      
      // For numeric fields (qty, stock, incStep)
      let numValue = parseFloat(value);
      if (isNaN(numValue) || numValue < 0) return;
      
      // Additional validation for stock field
      if (name === 'stock') {
        const currentQty = parseFloat(newProductModal.formData.qty) || 0;
        if (currentQty > 0 && numValue > currentQty) {
          showToast('warning', `Stock cannot exceed capacity (${currentQty})`);
          return;
        }
      }
      
      // Additional validation for qty field when stock exists
      if (name === 'qty') {
        const currentStock = parseFloat(newProductModal.formData.stock) || 0;
        if (currentStock > 0 && numValue < currentStock) {
          showToast('warning', `Capacity cannot be less than current stock (${currentStock})`);
          return;
        }
      }
      
      setNewProductModal(prev => ({
        ...prev,
        formData: { ...prev.formData, [name]: numValue }
      }));
      return;
    }
    
    // Handle price field separately to preserve decimal formatting
    if (name === 'oPrice') {
      // Allow empty string for clearing the field
      if (value === '') {
        setNewProductModal(prev => ({
          ...prev,
          formData: { ...prev.formData, [name]: '' }
        }));
        return;
      }
      
      // Allow only numbers and one decimal point
      const regex = /^\d*\.?\d{0,2}$/;
      if (!regex.test(value)) {
        return; // Don't update if it doesn't match the pattern
      }
      
      // Store as string to preserve decimal formatting
      setNewProductModal(prev => ({
        ...prev,
        formData: { ...prev.formData, [name]: value }
      }));
      return;
    }
    
    // Handle name field with auto-sync to localName
    if (name === 'name') {
      setNewProductModal(prev => ({
        ...prev,
        formData: {
          ...prev.formData,
          name: value,
          localName: prev.localNameEdited ? prev.formData.localName : value
        }
      }));
    } 
    // Handle localName field
    else if (name === 'localName') {
      setNewProductModal(prev => ({
        ...prev,
        localNameEdited: true,
        formData: { ...prev.formData, localName: value }
      }));
    } 
    // Handle all other text fields
    else {
      setNewProductModal(prev => ({
        ...prev,
        formData: { ...prev.formData, [name]: value }
      }));
    }
  };
  
  
    const handleNewProductCBChange = (e) => {
      const { name, checked } = e.target;
      setNewProductModal(prev => ({
        ...prev,
        formData: { ...prev.formData, [name]: checked }
      }));
    };
  
    const uploadNewProductImages = async (productId) => {
    try {
      if (
        !newProductModal ||
        !Array.isArray(newProductModal.images) ||
        newProductModal.images.length === 0
      ) {
        console.log('✅ No images to upload.');
        return { success: true };
      }
  
      // Clean any undefined or empty entries
      const validImages = newProductModal.images.filter(Boolean);
  
      if (validImages.length === 0) {
        console.log('✅ All images were empty or invalid, skipping upload.');
        return { success: true };
      }
  
      const formData = new FormData();
      validImages.forEach((img, index) => {
        formData.append('images[]', img);
      });
      formData.append('product_id', productId.toString());
  
      console.log('📤 Uploading images for product ID:', productId);
  
      const response = await postFormData('/api/product/media/multiple', formData);
  
      console.log('✅ Image upload success:', response);
      return { success: true, response };
    } catch (error) {
      console.error('❌ Image upload failed:', error);
      return { success: false, error };
    }
  };
  
  
  
  
  const handleNewProductSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }
  
    // Validate selling price format
    const oPriceValue = newProductModal.formData.oPrice;
    const oPrice = parseFloat(oPriceValue);
    if (isNaN(oPrice) || oPrice < 0) {
      showToast('danger', 'Please enter a valid selling price');
      return;
    }
  
    // Additional validation for stock vs capacity
    const qty = parseFloat(newProductModal.formData.qty) || 0;
    const stock = parseFloat(newProductModal.formData.stock) || 0;
    if (stock > qty) {
      showToast('danger', `Initial stock (${stock}) cannot exceed capacity (${qty})`);
      return;
    }
  
    let data = { ...newProductModal.formData, sizes: [] };
    data.slug = data.name.replace(/[^\w]/g, '_');
  
    if (!newProductModal.formData.multiSize) {
      data.sizes.push({
        name: data.name,
        localName: data.localName,
        qty: data.qty,
        oPrice: oPriceValue,
        dPrice: oPriceValue,
        stock: data.stock,
        show: true,
        returnable: data.returnable,
      });
      delete data.oPrice;
      delete data.qty;
      delete data.stock;
    }
  
    try {
      const resp = await post('/api/product', data);
      console.log('✅ Product creation response:', resp);
  
      if (resp && resp.id) {
        showToast('success', 'Product added successfully');
  
        console.log('📦 Created product ID:', resp.id);
        console.log('🖼️ Images before upload:', newProductModal.images);
  
        const imageResult = await uploadNewProductImages(resp.id);
  
        if (imageResult.success) {
          if (
            Array.isArray(newProductModal.images) &&
            newProductModal.images.filter(Boolean).length
          ) {
            showToast('success', 'Images uploaded successfully');
          }
        } else {
          showToast('warning', 'Product saved, but image upload failed.');
        }
  
        closeNewProductModal();
        fetchStock();
      } else if (resp && resp.message) {
        showToast('danger', resp.message);
      } else {
        showToast('danger', 'Unexpected response from server.');
      }
    } catch (error) {
      console.error('❌ Product creation error:', error);
  
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
  
        if (status === 422 && data.errors) {
          Object.entries(data.errors).forEach(([field, fieldErrors]) => {
            fieldErrors.forEach((msg) => {
              showToast('danger', msg);
            });
          });
        } else if (data.message) {
          showToast('danger', data.message);
        } else {
          showToast('danger', `Server error (${status}).`);
        }
      } else if (error.request) {
        showToast('danger', 'Network error. Please check your connection.');
      } else {
        showToast('danger', 'An unexpected error occurred. Please try again.');
      }
    }
  };
  
  
  
  
    // Bulk Upload Modal Functions
    const openBulkUploadModal = () => {
      setBulkUploadModal({
        visible: true,
        csvFile: null,
        isUploading: false,
        message: '',
        isError: false,
      });
    };
  
    const closeBulkUploadModal = () => {
      setBulkUploadModal(prev => ({ ...prev, visible: false }));
    };
  
    const handleBulkFileChange = (e) => {
      const file = e.target.files[0];
      setBulkUploadModal(prev => ({
        ...prev,
        csvFile: file,
        message: '',
        isError: false,
      }));
    };
  
    const handleBulkUpload = async () => {
      if (!bulkUploadModal.csvFile) {
        setBulkUploadModal(prev => ({
          ...prev,
          message: 'Please select a CSV file to upload.',
          isError: true,
        }));
        return;
      }
  
      if (bulkUploadModal.csvFile.type !== "text/csv" && !bulkUploadModal.csvFile.name.endsWith(".csv")) {
        setBulkUploadModal(prev => ({
          ...prev,
          message: 'Invalid file type. Please upload a valid CSV file.',
          isError: true,
        }));
        return;
      }
  
      const formData = new FormData();
      formData.append('csv_file', bulkUploadModal.csvFile);
  
      try {
        setBulkUploadModal(prev => ({ ...prev, isUploading: true }));
        
        const response = await postFormDataCsv('/api/uploadProducts', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
  
        const resMessage = response?.data?.message || response?.message;
  
        if (resMessage) {
          setBulkUploadModal(prev => ({
            ...prev,
            message: resMessage,
            isError: false,
            csvFile: null,
          }));
          showToast('success', 'Products uploaded successfully!');
           await fetchStock();
        } else {
          setBulkUploadModal(prev => ({
            ...prev,
            message: 'Upload failed. Check CSV format.',
            isError: true,
          }));
        }
      } catch (error) {
        console.error('Upload error:', error);
        const errMsg = error.response?.data?.error || 'Upload failed. Check CSV format.';
        setBulkUploadModal(prev => ({
          ...prev,
          message: errMsg,
          isError: true,
        }));
        showToast('danger', errMsg);
      } finally {
        setBulkUploadModal(prev => ({ ...prev, isUploading: false }));
      }
    };
  
    const downloadSampleTemplate = () => {
      const link = document.createElement('a');
      link.href = 'sample_products_template.csv';
      link.download = 'SampleProductTemplate.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

  useEffect(() => {
    try {
      const fetchMonthlySales = async () => {
        const response = await getAPICall('/api/monthlyIncomeSummaries')
        setReportMonth(response)
      }
      if (mode === 'advance') {
        fetchMonthlySales()
      }
    } catch (error) {
      showToast('danger', 'Error occurred ' + error)
    }
  }, [])

  const fetchStock = async () => {
  try {
    const response = await getAPICall('/api/stock');
    setStock(response);
  } catch (error) {
    showToast('danger', 'Error occurred while fetching stock');
  }
};

useEffect(() => {
  fetchStock();
}, []);

  // Fetch subscription status and plans on component mount
  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([
        fetchSubscriptionStatus(),
        fetchPlans()
      ])
    }

    initializeData()
    
    // Set up periodic refresh every 5 minutes
    const interval = setInterval(() => {
      fetchSubscriptionStatus()
    }, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [userData?.company_id])

const fetchPlans = async () => {
  try {
    const response = await getAPICall('/api/detailsForCompany');
    console.log('Raw response:', response);

    const allPlans = response?.plans || [];

    // Store full plans in refData
    setRefData((prev) => ({
      ...prev,
      plans: allPlans
    }));

    // Filter Monthly and Annually only (exclude Free Trial)
    const filteredPlans = allPlans.filter(plan => {
      const name = plan.name?.toLowerCase() || '';
      return (
        (name.includes('monthly') || name.includes('annually') ||name.includes('quarterly') ||name.includes('half-yearly')) &&
        !name.includes('free trial')
      );
    });

    console.log('Filtered Plans:', filteredPlans); // Debug
    setPlans(filteredPlans);
  } catch (error) {
    console.error('Error fetching plans:', error);
    showToast('danger', 'Failed to fetch subscription plans');
  }
};





const calculateNewValidityDate = (customDuration = null) => {
  const duration = customDuration ?? renewalForm.duration;
  
  if (!subscriptionData?.subscription_validity) {
    const today = new Date();
    const newDate = new Date(today);
    newDate.setMonth(newDate.getMonth() + parseInt(duration));
    return newDate.toISOString().split('T')[0];
  }

  const currentValidityDate = new Date(subscriptionData.subscription_validity);
  const today = new Date();
  const baseDate = currentValidityDate > today ? currentValidityDate : today;

  const newDate = new Date(baseDate);
  newDate.setMonth(newDate.getMonth() + parseInt(duration));

  return newDate.toISOString().split('T')[0];
};


 const handleRenewalFormChange = (e) => {
  const { name, value } = e.target;

  // When plan is selected
  if (name === 'plan_id') {
    const selectedPlan = plans.find(plan => plan.id === parseInt(value));

    let newDuration = 1; // default

    if (selectedPlan?.name?.toLowerCase().includes('annually')) {
      newDuration = 12;
    } else if (selectedPlan?.name?.toLowerCase().includes('monthly')) {
      newDuration = 1;
    }
     else if (selectedPlan?.name?.toLowerCase().includes('quarterly')) {
      newDuration = 3;
    }
     else if (selectedPlan?.name?.toLowerCase().includes('half-yearly')) {
      newDuration = 6;
    }

    setRenewalForm((prev) => ({
      ...prev,
      plan_id: value,
      duration: newDuration,
      validity_date: calculateNewValidityDate(newDuration)
    }));
  } else {
    setRenewalForm((prev) => ({
      ...prev,
      [name]: value
    }));
  }
};


  const handleDurationChange = (e) => {
    const duration = parseInt(e.target.value)
    setRenewalForm(prev => {
      const newForm = {
        ...prev,
        duration
      }
      return {
        ...newForm,
        validity_date: calculateNewValidityDate()
      }
    })
  }

  useEffect(() => {
    if (renewalForm.duration && subscriptionData?.subscription_validity) {
      const currentValidityDate = new Date(subscriptionData.subscription_validity)
      const today = new Date()
      
      const baseDate = currentValidityDate > today ? currentValidityDate : today
      
      const newDate = new Date(baseDate)
      newDate.setMonth(newDate.getMonth() + parseInt(renewalForm.duration))
      
      const newValidityDate = newDate.toISOString().split('T')[0]
      
      if (newValidityDate !== renewalForm.validity_date) {
        setRenewalForm(prev => ({
          ...prev,
          validity_date: newValidityDate
        }))
      }
    }
  }, [renewalForm.duration, renewalForm.plan_id, subscriptionData])

// ✅ Round to nearest 0.2
const roundToPointTwo = (value) => {
  return Math.round(value * 5) / 5;
};

// ✅ Get selected plan object
const getSelectedPlan = () => {
  return plans.find(p => p.id == renewalForm.plan_id);
};

// ✅ Base amount before GST (rounded to 0.2)
const calculateBaseAmount = () => {
  const plan = getSelectedPlan();
  if (!plan) return 0;

  const totalWithGST = plan.price * renewalForm.duration;
  const baseAmount = totalWithGST / 1.18;

  return roundToPointTwo(baseAmount);
};

// ✅ GST amount (rounded to 0.2)
const calculateGST = () => {
  const plan = getSelectedPlan();
  if (!plan) return 0;

  const totalWithGST = plan.price * renewalForm.duration;
  const baseAmount = totalWithGST / 1.18;
  const gstAmount = totalWithGST - baseAmount;

  return roundToPointTwo(gstAmount);
};

// ✅ Final amount (price × duration, rounded to 0.2)
const calculateFinalAmount = () => {
  const plan = getSelectedPlan();
  if (!plan) return 0;

  const total = plan.price * renewalForm.duration;

  return roundToPointTwo(total);
};



  // Function to generate and download PDF receipt
  const generateReceiptPDF = (paymentResponse, receiptResponse) => {
    try {
      const receiptData = {
        company: {
          company_name: userData?.company_info?.company_name || userData?.name || 'N/A',
          phone_no: userData?.mobile || userData?.company_info?.phone_no || 'N/A',
          email_id: userData?.email || userData?.company_info?.email_id || 'N/A'
        },
        plan: {
          name: getSelectedPlan()?.name || 'Selected Plan',
          price: getSelectedPlan()?.price || 0
        },
        transaction_id: paymentResponse?.razorpay_payment_id || 'N/A',
        total_amount: calculateBaseAmount(),
        gst: calculateGST(),
        payable_amount: calculateFinalAmount(),
        valid_till: renewalForm.validity_date,
        created_at: new Date().toISOString(),
        renewal_duration: renewalForm.duration
      }

      console.log('Generating PDF with data:', receiptData)
      
      // Generate and download the PDF
      const filename = generateCompanyReceiptPDF(receiptData)
      
      console.log('PDF generated successfully:', filename)
      showToast('success', 'Receipt downloaded successfully!')
      
      return filename
    } catch (error) {
      console.error('Error generating PDF receipt:', error)
      showToast('warning', 'Subscription renewed successfully, but failed to generate receipt PDF')
    }
  }

  const getBannerColorClass = (subscriptionData) => {
  // If subscription is expired
  if (subscriptionData.is_expired) {
    return 'expired';
  }
  
  // If it's a free trial (you'll need to add this field to your API response)
  if (subscriptionData.is_trial) {
    return 'trial';
  }
  
  // If less than 15 days remaining
  if (subscriptionData.days_remaining < 15) {
    return 'critical';
  }
  
  // If less than or equal to 30 days (1 month) remaining
  if (subscriptionData.days_remaining <= 30) {
    return 'warning';
  }
  
  // If more than 30 days remaining
  return 'active';
};

// Function to determine button color based on subscription status
const getButtonColor = (subscriptionData) => {
  if (subscriptionData.is_expired || subscriptionData.days_remaining < 15) {
    return 'danger';
  }
  if (subscriptionData.is_trial) {
    return 'warning';
  }
  if (subscriptionData.days_remaining <= 30) {
    return 'warning';
  }
  return 'success';
};

const getStockBadgeColor = (stock, qty) => {
  const percent = (stock / qty) * 100;

  if (stock <= 0) return { color: 'secondary', className: 'badge-strobe-grey' }; // Out of stock
  if (percent <= 25) return { color: 'danger', className: 'badge-strobe-danger' }; // Critical
  if (percent <= 50) return { color: 'warning', className: 'badge-strobe-warning' }; // Low
  return { color: 'success', className: '' }; // Healthy
};


  const handlePayment = async () => {
    try {
      if (!renewalForm.plan_id || !renewalForm.duration) {
        showToast('danger', 'Please select a plan and duration')
        return
      }

      if (!window.Razorpay) {
        const script = document.createElement("script")
        script.src = "https://checkout.razorpay.com/v1/checkout.js"
        await new Promise((resolve, reject) => {
          script.onload = resolve
          script.onerror = reject
          document.body.appendChild(script)
        })
      }

      const paymentData = {
        amount: calculateFinalAmount(),
      }

      const data = await post("/api/create-order", paymentData)

      if (data) {
        const options = {
          key: data.key,
          amount: data.order.amount,
          currency: data.order.currency,
          order_id: data.order.id,
          name: "Subscription Renewal",
          description: `${getSelectedPlan()?.name} - ${renewalForm.duration} months`,
          handler: async (response) => {
            try {
              const verifyResponse = await post("/api/verify-payment", {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              })

              if (verifyResponse?.success) {
                const renewalData = {
                  company_id: userData.company_id,
                  plan_id: renewalForm.plan_id,
                  // user_id: userData.id,
                  total_amount: calculateFinalAmount(),
                  valid_till: renewalForm.validity_date,
                  transaction_id: response.razorpay_payment_id,
                  transaction_status: 'success',
                  renewal_type: 'extension'
                }

                const receiptResponse = await post('/api/company-receipt', renewalData)
                
                const updateResponse = await post('/api/company/update-validity', {
                  company_id: userData.company_id,
                  valid_till: renewalForm.validity_date,
                  plan_id: renewalForm.plan_id
                })

                if (receiptResponse?.success && updateResponse?.success) {
                  showToast('success', 'Subscription renewed successfully!')
                  
                  // Generate and download PDF receipt
                  setTimeout(() => {
                    generateReceiptPDF(response, receiptResponse)
                  }, 1000) // Small delay to ensure UI updates first
                  
                  setShowValidityModal(false)
                  setShowBanner(false)
                  
                  // Refresh subscription status from API
                  await fetchSubscriptionStatus()
                } else {
                  showToast('danger', 'Payment successful but failed to update subscription. Please contact support.')
                }
              } else {
                showToast('danger', 'Payment verification failed')
              }
            } catch (error) {
              showToast('danger', 'Payment successful but failed to update subscription: ' + error)
              console.error('Renewal error:', error)
            }
          },
          prefill: {
            name: userData.name,
            email: userData.email,
            contact: userData.mobile
          },
          theme: {
            color: "#3399cc",
          },
        }

        const razorpay = new window.Razorpay(options)
        razorpay.open()

        razorpay.on("payment.failed", async(response) => {
          console.error("Payment Failed:", response.error)
          showToast('danger', 'Payment failed. Please try again.')
          
          try {
            const receiptData = {
              company_id: userData.company_id,
              plan_id: renewalForm.plan_id,
              user_id: userData.id,
              total_amount: calculateFinalAmount(),
              valid_till: renewalForm.validity_date,
              transaction_id: response.error?.metadata?.payment_id ?? 'failed',
              transaction_status: response.error?.description ?? 'Failed',
              renewal_type: 'extension_failed'
            }
            await post('/api/company-receipt', receiptData)
          } catch (error) {
            console.error('Error logging failed payment:', error)
          }
        })
      }
    } catch (error) {
      console.error("Payment error:", error)
      showToast('danger', 'Something went wrong with payment: ' + error.message)
    }
  }

 const getStockStatus = (stock, quantity) => {
    const stockNum = parseInt(stock) || 0;
    const qtyNum = parseInt(quantity) || 1; // Prevent division by zero
    const percentage = (stockNum / qtyNum) * 100;
    
    if (percentage < 20) {
      return { 
        level: 'critical', 
        color: 'danger', 
        strobe: true, 
        percentage: percentage.toFixed(1),
        description: 'Critical - Less than 20% stock remaining'
      };
    }
    if (percentage >= 20 && percentage <= 50) {
      return { 
        level: 'low', 
        color: 'warning', 
        strobe: true, 
        percentage: percentage.toFixed(1),
        description: 'Low - 20-50% stock remaining'
      };
    }
    return { 
      level: 'good', 
      color: 'success', 
      strobe: false, 
      percentage: percentage.toFixed(1),
      description: 'Good - More than 50% stock remaining'
    };
  };

//   const filteredStock = stock.filter((p) => {
//   if (!p.product || !p.product.showOnHome) return false;

//   const name = (p.name || "").toLowerCase();
//   const localName = (p.localName || "").toLowerCase();
//   const query = searchQuery.toLowerCase();

//   return name.includes(query) || localName.includes(query);
// });
const filteredStock = stock.filter((p) => {
  if (!p.product || !p.product.showOnHome) return false;

  const name = (p.name || "").toLowerCase();
  const localName = (p.localName || "").toLowerCase();
  const query = searchQuery.toLowerCase();

  const matchesSearch = name.includes(query) || localName.includes(query);

  // filter by stock level if selected
  if (selectedStockFilter) {
    const percent = (p.stock / p.qty) * 100;
    if (selectedStockFilter === 'critical' && percent >= 20) return false;
    if (selectedStockFilter === 'low' && (percent < 20 || percent > 50)) return false;
    if (selectedStockFilter === 'good' && percent <= 50) return false;
  }

  return matchesSearch;
});


  // Show loading state while fetching subscription data
  if (loading && !subscriptionData) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  // If subscription is expired, show only the renewal modal
  if (subscriptionData?.is_expired && user === 1) {
    return (
      <>
        <CModal
          visible={true}
          backdrop="static"
          keyboard={false}
          size="lg"
        >
          <CModalHeader closeButton={false}>
            <CModalTitle>Subscription Expired</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CAlert color="danger">
              <div>
                <h5>Your subscription has expired!</h5>
                <p>Your subscription expired on {subscriptionData.validity_date_formatted}.</p>
                <p>Please renew your subscription to continue using the service.</p>
              </div>
            </CAlert>

            <CForm>
              <CRow>
              <CCol md={6}>
  <div className="mb-3">
    <CFormLabel htmlFor="billing_type">Billing Type</CFormLabel>
    <CFormSelect
      id="billing_type"
      name="billing_type"
      value={selectedBillingType}
      onChange={(e) => {
        setSelectedBillingType(e.target.value);
        setRenewalForm((prev) => ({
          ...prev,
          plan_id: '', // Reset selected plan
        }));
      }}
    >
      
      <option value="monthly">Monthly</option>
      <option value="quarterly">Quarterly</option>
      <option value="half-yearly">Half-Yearly</option>
      <option value="annually">Annually</option>
    </CFormSelect>
  </div>
</CCol>

              
                <CCol md={6}>
  <div className="mb-3">
    <CFormLabel htmlFor="plan_id">Select Plan</CFormLabel>
    <CFormSelect
      id="plan_id"
      name="plan_id"
      value={renewalForm.plan_id}
      onChange={handleRenewalFormChange}
      options={[
        { value: '', label: 'Select a plan...' },
        ...plans
          .filter(plan => {
            const name = plan.name?.toLowerCase() || '';
            if (!selectedBillingType) return name.includes('monthly');
            return name.includes(selectedBillingType.toLowerCase());
          })
          .map(plan => ({
            value: plan.id,
            label: `${plan.name} (₹${plan.price}/month incl. GST)`
          }))
      ]}
    />
  </div>
</CCol>

                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel htmlFor="duration">Duration</CFormLabel>
                    <CFormSelect
  id="duration"
  name="duration"
  value={renewalForm.duration}
  onChange={handleDurationChange}
  options={durationOptions}
  disabled // 👈 disables dropdown
/>

                  </div>
                </CCol>
              </CRow>

              <CRow>
                <CCol md={12}>
                  <div className="mb-3">
                    <CFormLabel htmlFor="validity_date">New Validity Date</CFormLabel>
                    <CFormInput
                      type="date"
                      id="validity_date"
                      name="validity_date"
                      value={renewalForm.validity_date}
                      readOnly
                    />
                  </div>
                </CCol>
              </CRow>

              {getSelectedPlan() && (
                <CAlert color="info">
                  <h6>Payment Summary</h6>
                  <div className="row">
                    <div className="col-6">
                      <p className="mb-1">Plan: {getSelectedPlan()?.name}</p>
                      <p className="mb-1">Duration: {renewalForm.duration} months</p>
                      <p className="mb-1">Rate: ₹{getSelectedPlan()?.price}/month (incl. GST)</p>
                    </div>
                    <div className="col-6">
                      <p className="mb-1">Base Amount: ₹{calculateBaseAmount()}</p>
                      <p className="mb-1">GST (18%): ₹{calculateGST()}</p>
                      <p className="mb-1"><strong>Total: ₹{calculateFinalAmount()}</strong></p>
                    </div>
                  </div>
                </CAlert>
              )}
            </CForm>
          </CModalBody>
          <CModalFooter>
            <CButton 
              color="primary" 
              onClick={handlePayment}
              disabled={!getSelectedPlan()}
              size="lg"
            >
              Pay ₹{calculateFinalAmount()} & Renew Now
            </CButton>
          </CModalFooter>
        </CModal>
      </>
    )
  }

  return (
    <>
      {/* Responsive Subscription Validity Banner */}
{/* Responsive Subscription Validity Banner */}
{showBanner && subscriptionData && (
  <div 
    className={`subscription-banner ${getBannerColorClass(subscriptionData)}`}
  >
    <style>
      {`
        @keyframes flicker {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        .subscription-banner {
          border-radius: 5px;
          margin-bottom: 20px;
          animation: flicker 2s infinite;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 15px;
          flex-wrap: wrap;
        }
        
        /* Expired - Red */
        .subscription-banner.expired {
          background-color: #f8d7da;
          border: 1px solid #f5c6cb;
          color: #721c24;
        }
        
        /* Critical (less than 15 days) - Red */
        .subscription-banner.critical {
          background-color: #f8d7da;
          border: 1px solid #f5c6cb;
          color: #721c24;
        }
        
        /* Warning (1 month or less) - Yellow */
        .subscription-banner.warning {
          background-color: #fff3cd;
          border: 1px solid #ffeaa7;
          color: #856404;
        }
        
        /* Free Trial - Orange */
        .subscription-banner.trial {
          background-color: #ffe8d1;
          border: 1px solid #ffb347;
          color: #8b4513;
        }
        
        /* Active (more than 1 month) - Green */
        .subscription-banner.active {
          background-color: #d4edda;
          border: 1px solid #c3e6cb;
          color: #155724;
        }
        
        .subscription-banner .banner-text {
          font-weight: bold;
          flex: 1;
          min-width: 300px;
          margin-right: 15px;
        }
        
        .subscription-banner .banner-button {
          flex-shrink: 0;
        }
        
        /* Mobile Responsive - Text left, button right like in your image */
        @media (max-width: 767px) {
          .subscription-banner {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            padding: 12px;
            gap: 10px;
          }
          
          .subscription-banner .banner-text {
            min-width: auto;
            margin-right: 10px;
            font-size: 13px;
            line-height: 1.3;
            text-align: left;
            flex: 1;
          }
          
          .subscription-banner .banner-button {
            flex-shrink: 0;
            width: auto;
          }
        }
        
        /* Small mobile devices */
        @media (max-width: 480px) {
          .subscription-banner {
            padding: 10px;
            gap: 8px;
          }
          
          .subscription-banner .banner-text {
            font-size: 12px;
            line-height: 1.2;
            margin-right: 8px;
          }
        }
        
        /* Very small screens */
        @media (max-width: 360px) {
          .subscription-banner {
            padding: 8px;
            gap: 6px;
          }
          
          .subscription-banner .banner-text {
            font-size: 11px;
            margin-right: 6px;
          }
        }
      `}
    </style>
    
    <div className="banner-text">
      {subscriptionData.is_expired ? (
        <span>
          Your subscription has expired! Your subscription expired on {subscriptionData.validity_date_formatted}. Please renew your subscription to continue using the service.
        </span>
      ) : (
        <span>
          {subscriptionData.is_trial ? (
            `Free trial expiring in ${Math.abs(subscriptionData.days_remaining)} days on ${subscriptionData.validity_date_formatted}. Upgrade now to continue using the service.`
          ) : (
            `Subscription expiring in ${Math.abs(subscriptionData.days_remaining)} days on ${subscriptionData.validity_date_formatted}. Renew now to avoid service interruption.`
          )}
        </span>
      )}
    </div>
    
    <div className="banner-button">
      <CButton 
        color={getButtonColor(subscriptionData)} 
        size="sm"
        onClick={() => setShowValidityModal(true)}
        style={{ fontWeight: 'bold' }}
      >
        {subscriptionData.is_trial ? 'Upgrade Now' : 'Renew Now'}
      </CButton>
    </div>
  </div>
)}

      {mode === 'advance' && (
        <WidgetsDropdown className="mb-4" reportMonth={reportMonth} />
      )}

      {/* Subscription Validity Modal */}
      <CModal
        visible={showValidityModal}
        onClose={subscriptionData?.is_expired ? undefined : () => setShowValidityModal(false)}
        backdrop={subscriptionData?.is_expired ? "static" : true}
        keyboard={subscriptionData?.is_expired ? false : true}
        size="lg"
      >
        <CModalHeader closeButton={!subscriptionData?.is_expired}>
          <CModalTitle>
            {subscriptionData?.is_expired ? 'Subscription Expired' : 'Subscription Expiring Soon'}
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CAlert color={subscriptionData?.is_expired ? 'danger' : 'warning'}>
            {subscriptionData?.is_expired ? (
              <div>
                <h5>Your subscription has expired!</h5>
                <p>Your subscription expired {Math.abs(subscriptionData.days_remaining)} days ago on {subscriptionData.validity_date_formatted}.</p>
                <p>Please renew your subscription to continue using the service.</p>
              </div>
            ) : (
              <div>
                <h5>Subscription Expiring Soon!</h5>
                <p>Your subscription will expire in {subscriptionData?.days_remaining} days on {subscriptionData?.validity_date_formatted}.</p>
                <p>Renew now to avoid service interruption.</p>
              </div>
            )}
          </CAlert>

          <CForm>
            <CRow>
            <CCol md={6}>
  <div className="mb-3">
    <CFormLabel htmlFor="billing_type">Billing Type</CFormLabel>
    <CFormSelect
      id="billing_type"
      name="billing_type"
      value={selectedBillingType}
      onChange={(e) => {
        setSelectedBillingType(e.target.value);
        setRenewalForm((prev) => ({
          ...prev,
          plan_id: '', // Reset selected plan
        }));
      }}
    >
      
      <option value="monthly">Monthly</option>
      <option value="quarterly">Quarterly</option>
      <option value="half-yearly">Half-Yearly</option>
      <option value="annually">Annually</option>
    </CFormSelect>
  </div>
</CCol>

 <CCol md={6}>
  <div className="mb-3">
    <CFormLabel htmlFor="plan_id">Select Plan</CFormLabel>
    <CFormSelect
      id="plan_id"
      name="plan_id"
      value={renewalForm.plan_id}
      onChange={handleRenewalFormChange}
      options={[
        { value: '', label: 'Select a plan...' },
        ...plans
          .filter(plan => {
            const name = plan.name?.toLowerCase() || '';
            if (!selectedBillingType) return name.includes('monthly');
            return name.includes(selectedBillingType.toLowerCase());
          })
          .map(plan => ({
            value: plan.id,
            label: `${plan.name} (₹${plan.price}/month incl. GST)`
          }))
      ]}
    />
  </div>
</CCol>


              <CCol md={6}>
                <div className="mb-3">
                  <CFormLabel htmlFor="duration">Duration</CFormLabel>
                 <CFormSelect
  id="duration"
  name="duration"
  value={renewalForm.duration}
  onChange={handleDurationChange}
  options={durationOptions}
  disabled // 👈 disables dropdown
/>

                </div>
              </CCol>
            </CRow>

            <CRow>
              <CCol md={12}>
                <div className="mb-3">
                  <CFormLabel htmlFor="validity_date">New Validity Date</CFormLabel>
                  <CFormInput
                    type="date"
                    id="validity_date"
                    name="validity_date"
                    value={renewalForm.validity_date}
                    readOnly
                  />
                </div>
              </CCol>
            </CRow>

            {getSelectedPlan() && (
              <CAlert color="info">
                <h6>Payment Summary</h6>
                <div className="row">
                  <div className="col-6">
                    <p className="mb-1">Plan: {getSelectedPlan()?.name}</p>
                    <p className="mb-1">Duration: {renewalForm.duration} months</p>
                    <p className="mb-1">Rate: ₹{getSelectedPlan()?.price}/month (incl. GST)</p>
                  </div>
                  <div className="col-6">
                    <p className="mb-1">Base Amount: ₹{calculateBaseAmount()}</p>
                    <p className="mb-1">GST (18%): ₹{calculateGST()}</p>
                    <p className="mb-1"><strong>Total: ₹{calculateFinalAmount()}</strong></p>
                  </div>
                </div>
              </CAlert>
            )}
          </CForm>
        </CModalBody>
        <CModalFooter>
          {!subscriptionData?.is_expired && (
            <CButton color="secondary" onClick={() => setShowValidityModal(false)}>
              Later
            </CButton>
          )}
          <CButton 
            color="primary" 
            onClick={handlePayment}
            disabled={!getSelectedPlan()}
          >
            Pay ₹{calculateFinalAmount()} & Renew
          </CButton>
        </CModalFooter>
      </CModal>



{newProductModal.visible && (
  <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
    <div className="modal-dialog modal-dialog-centered" style={{ 
      margin: '0.5rem auto',
      maxWidth: 'min(600px, calc(100vw - 1rem))',
      width: '100%'
    }}>
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">{t('LABELS.create_new_product')}</h5>
          <button
            type="button"
            className="btn-close"
            onClick={closeNewProductModal}
          ></button>
        </div>
        <div className="modal-body">
          <CForm className="needs-validation" noValidate onSubmit={handleNewProductSubmit}>
            {/* Product Name and Local Name - Side by side on desktop, stacked on mobile */}
            <div className="row mb-3">
              <div className="col-12 col-sm-6 mb-3 mb-sm-0">
                <CFormLabel htmlFor="pname"><b>{t('LABELS.product_name')}</b></CFormLabel>
                <CFormInput
                  type="text"
                  id="pname"
                  placeholder={t('LABELS.product_name')}
                  name="name"
                  value={newProductModal.formData.name}
                  onChange={handleNewProductChange}
                  required
                  feedbackInvalid={t('LABELS.please_provide_name')}
                  feedbackValid={t('LABELS.looks_good')}
                />
                <div className="invalid-feedback">{t('LABELS.product_name_required')}</div>
              </div>
              <div className="col-12 col-sm-6">
                <CFormLabel htmlFor="plname"><b>{t('LABELS.local_name')}</b></CFormLabel>
                <CFormInput
                  type="text"
                  id="plname"
                  placeholder={t('LABELS.local_name')}
                  name="localName"
                  value={newProductModal.formData.localName}
                  onChange={handleNewProductChange}
                />
                <div className="invalid-feedback">{t('LABELS.local_name_required')}</div>
              </div>
            </div>

            {/* Capacity, Stock, Price - Proper layout for desktop and mobile */}
            <div className="row mb-3">
              <div className="col-12 col-sm-4 mb-3 mb-sm-0">
                <CFormLabel htmlFor="qty"><b>{t('LABELS.capacity')}</b></CFormLabel>
                <CFormInput
                  type="number"
                  id="qty"
                  placeholder="0"
                  min="0"
                  onWheel={(e) => e.target.blur()}
                  name="qty"
                  value={newProductModal.formData.qty}
                  onChange={handleNewProductChange}
                  required
                />
                <div className="invalid-feedback">{t('LABELS.quantity_required')}</div>
              </div>
              
              {/* Initial Stock */}
              <div className="col-12 col-sm-4 mb-3 mb-sm-0">
                <CFormLabel htmlFor="stock">
                  <b>{t('LABELS.initial_stock')}</b>
                  
                </CFormLabel>
                <CFormInput
                  type="number"
                  id="stock"
                  placeholder="0"
                  min="0"
                  onWheel={(e) => e.target.blur()}
                  max={newProductModal.formData.qty || undefined}
                  name="stock"
                  value={newProductModal.formData.stock}
                  onChange={handleNewProductChange}
                  required
                />
                <div className="invalid-feedback">{t('LABELS.initial_stock_required')}</div>
                {newProductModal.formData.qty && newProductModal.formData.stock > newProductModal.formData.qty && (
                  <div className="text-danger small mt-1">
                    Stock cannot exceed capacity ({newProductModal.formData.qty})
                  </div>
                )}
              </div>
              
              {/* Selling Price - Full width on mobile */}
              <div className="col-12 col-md-4">
                <CFormLabel htmlFor="oPrice"><b>{t('LABELS.selling_price')}</b></CFormLabel>
                <CFormInput
                  type="text"
                  id="oPrice"
                  placeholder="0.00"
                  name="oPrice"
                  onWheel={(e) => e.target.blur()}
                  value={newProductModal.formData.oPrice}
                  onChange={handleNewProductChange}
                  onBlur={(e) => {
                    // Format to 2 decimal places on blur if value exists and is valid
                    const value = e.target.value;
                    if (value && !isNaN(parseFloat(value))) {
                      const formatted = parseFloat(value).toFixed(2);
                      setNewProductModal(prev => ({
                        ...prev,
                        formData: { ...prev.formData, oPrice: formatted }
                      }));
                    }
                  }}
                  pattern="^\d*\.?\d{0,2}$"
                  title="Please enter a valid price (up to 2 decimal places)"
                  required
                />
                <div className="invalid-feedback">{t('LABELS.selling_price_required')}</div>
              </div>
            </div>

            <div className="mb-3">
              <CFormLabel><b>Upload Images</b></CFormLabel>
              <input
                type="file"
                multiple
                accept="image/*"
                className="form-control"
                onChange={(e) => {
                  setNewProductModal(prev => ({
                    ...prev,
                    images: [...e.target.files]
                  }));
                }}
              />
            </div>


            {/* Checkbox */}
            <div className="row mb-3">
              <div className="col-12">
                <CFormCheck
                  id="show"
                  label={t('LABELS.show_for_invoicing')}
                  name="show"
                  checked={newProductModal.formData.show}
                  onChange={handleNewProductCBChange}
                />
              </div>
            </div>

            {/* Mobile-optimized footer */}
            <div className="modal-footer d-flex gap-2">
              <CButton 
                color="secondary" 
                onClick={closeNewProductModal}
                className="flex-fill flex-sm-grow-0"
              >
                {t('LABELS.cancel')}
              </CButton>
              <CButton 
                color="success" 
                type="submit"
                className="flex-fill flex-sm-grow-0"
                disabled={
                  newProductModal.formData.stock > newProductModal.formData.qty ||
                  !newProductModal.formData.name ||
                  !newProductModal.formData.qty ||
                  !newProductModal.formData.oPrice
                }
              >
                {t('LABELS.create_product')}
              </CButton>
            </div>
          </CForm>
        </div>
      </div>
    </div>
  </div>
)}
    {/* Bulk Upload Modal */}
    {bulkUploadModal.visible && (
      <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{t('LABELS.upload_product_csv')}</h5>
              <button
                type="button"
                className="btn-close"
                onClick={closeBulkUploadModal}
              ></button>
            </div>
            <div className="modal-body">
              <div className="mb-3 d-flex align-items-center">
                <strong className="me-2">{t('LABELS.sample_csv_template')}</strong>
                <CButton
                  color="success"
                  variant="outline"
                  size="sm"
                  title={t('LABELS.download_sample_template')}
                  onClick={downloadSampleTemplate}
                >
                  📥 {t('LABELS.download')}
                </CButton>
              </div>
              
              <div className="mb-3">
                <label htmlFor="csvFile" className="form-label">
                  <strong>{t('LABELS.select_csv_file')}</strong>
                </label>
                <input
                  type="file"
                  id="csvFile"
                  className="form-control"
                  accept=".csv"
                  onChange={handleBulkFileChange}
                />
              </div>

              {bulkUploadModal.message && (
                <div 
                  className={`alert ${bulkUploadModal.isError ? 'alert-danger' : 'alert-success'}`}
                  role="alert"
                >
                  {bulkUploadModal.message}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <CButton color="secondary" onClick={closeBulkUploadModal}>
                {t('LABELS.cancel')}
              </CButton>
              <CButton
                color="success"
                onClick={handleBulkUpload}
                disabled={bulkUploadModal.isUploading || !bulkUploadModal.csvFile}
              >
                {bulkUploadModal.isUploading ? t('LABELS.uploading') : t('LABELS.upload_csv')}
              </CButton>
            </div>
          </div>
        </div>
      </div>
    )}

   {quantityModal.visible && (
  <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">
            {t('LABELS.add_stock')} - {quantityModal.product.name}
          </h5>
          <button
            type="button"
            className="btn-close"
            onClick={() =>
              setQuantityModal({ visible: false, product: null, addedQty: 0, maxAddable: 0 })
            }
          ></button>
        </div>
        <div className="modal-body">
          <div className="row mb-3">
            <div className="col-6">
              <p className="mb-1">
                <b>{t('LABELS.total_quantity')}:</b>{' '}
                <span className="badge bg-primary">
                  {quantityModal.product.qty ?? 0}
                </span>
              </p>
            </div>
            <div className="col-6">
              <p className="mb-1">
                <b>{t('LABELS.current_stock')}:</b>{' '}
                <span 
                  className={`badge ${
                    getStockStatus(
                      quantityModal.product.stock ?? 0,
                      quantityModal.product.qty || 1
                    ).color === 'danger' ? 'bg-danger' : 
                    getStockStatus(
                      quantityModal.product.stock ?? 0,
                      quantityModal.product.qty || 1
                    ).color === 'warning' ? 'bg-warning text-dark' : 'bg-success'
                  }`}
                  style={{
                    animation: getStockStatus(
                      quantityModal.product.stock ?? 0,
                      quantityModal.product.qty || 1
                    ).strobe ? 'stockStrobe 1.5s infinite' : 'none'
                  }}
                >
                  {quantityModal.product.stock ?? 0}
                </span>
              </p>
            </div>
          </div>

          <div className="alert alert-info">
            <small>
              <strong>{t('LABELS.stock_percentage')}:</strong>{' '}
              {getStockStatus(
                quantityModal.product.stock ?? 0,
                quantityModal.product.qty || 1
              ).percentage}% {t('LABELS.of_total_quantity')}
            </small>
          </div>

          {quantityModal.maxAddable > 0 ? (
            <>
              <div className="mb-3">
                <label className="form-label">
                  <b>{t('LABELS.stock_to_add')}:</b>
                  <small className="text-muted ms-2">
                    ({t('LABELS.max')}: {quantityModal.maxAddable})
                  </small>
                </label>
                <input
                  type="number"
                  min="1"
                  max={quantityModal.maxAddable}
                  onWheel={(e) => e.target.blur()}
                  className="form-control custom-placeholder"
                  placeholder={`${t('LABELS.enter_stock_to_add')} (${t('LABELS.max')}: ${quantityModal.maxAddable})`}
                  value={quantityModal.addedQty}
                  onChange={handleQuantityChange}
                />
              </div>

              <div className="alert alert-success">
                <small>
                  <strong>{t('LABELS.after_adding')}:</strong> {t('LABELS.stock_will_be')}{' '}
                  {(quantityModal.product.stock ?? 0) + (parseInt(quantityModal.addedQty) || 0)} / {quantityModal.product.qty ?? 0}
                </small>
              </div>
            </>
          ) : (
            <div className="alert alert-warning">
              <strong>{t('LABELS.stock_is_full')}!</strong> {t('LABELS.stock_full_message')}
            </div>
          )}
        </div>
        <div className="modal-footer">
          <CButton
            color="secondary"
            onClick={() =>
              setQuantityModal({ visible: false, product: null, addedQty: 0, maxAddable: 0 })
            }
          >
            {t('LABELS.cancel')}
          </CButton>
          <CButton
            color="primary"
            onClick={updateQuantity}
            disabled={
              !quantityModal.addedQty ||
              parseInt(quantityModal.addedQty) < 1 ||
              quantityModal.maxAddable <= 0
            }
          >
            {t('LABELS.add_stock')}
          </CButton>
        </div>
      </div>
    </div>
  </div>
)}



      {(user === 0 || user === 1) && mode === 'advance' && !isRestrictedPlan() && (
  <CCard className="mt-4 mb-4">
    <CCardBody>
      <CRow>
        <CCol sm={5}>
          <h4 id="traffic" className="card-title mb-0">
            P&L (In Thousands)
          </h4>
          <div className="small text-body-secondary">
            January - December
          </div>
        </CCol>
        <CCol sm={7} className="d-none d-md-block">
          {/* Optional controls */}
        </CCol>
      </CRow>
      <MainChart 
        monthlyPandL={reportMonth.monthlyPandL}
        monthlySales={reportMonth.monthlySales}
        monthlyExpense={reportMonth.monthlyExpense}
      />
    </CCardBody>
  </CCard>
)}

    </>
  )
}

export default Dashboard