// import React, { useEffect, useState } from 'react'
// import { useRef } from 'react';
// import { Link } from 'react-router-dom'

// import {
//   CCard,
//   CCardBody,
//   CCol,
//   CRow,
//   CTable,
//   CTableBody,
//   CTableDataCell,
//   CTableHead,
//   CTableHeaderCell,
//   CTableRow,
//   CFormInput,
//   CInputGroup,
//   CInputGroupText,
//   CModal,
//   CModalHeader,
//   CModalTitle,
//   CModalBody,
//   CModalFooter,
//   CButton,
//   CForm,
//   CFormLabel,
//   CFormSelect,
//   CAlert,
//   CBadge,
//   CFormCheck,
//   CTabs,
//   CTabList,
//   CTabContent,
//   CTabPanel,
//   CTab,
// } from '@coreui/react'

// import { cilCloudUpload, cilPlus, cilSearch } from '@coreui/icons'
// import CIcon from '@coreui/icons-react'

// import WidgetsDropdown from '../widgets/WidgetsDropdown'
// import MainChart from './MainChart'

// import { getAPICall, post, postFormData, postFormDataCsv } from '../../util/api'
// import { getUserData, getUserType, getFullUserData } from '../../util/session'
// import { useToast } from '../common/toast/ToastContext'
// import { useTranslation } from 'react-i18next'
// import { generateCompanyReceiptPDF } from '../pages/company/companyPdf' // Import the PDF generator
// import { Custom, Months, Quarter, Week, Year } from '../pages/report/Dates';

// // Duration options for subscription
// const durationOptions = [
//   { value: 1, label: '1 Month' },
//   { value: 3, label: '3 Months' },
//   { value: 6, label: '6 Months' },
//   { value: 12, label: 'Yearly' },
//   // { value: 24, label: '24 Months' },
// ]



// const Dashboard = (Props) => {
//   const user = getUserType()
//   const [reportMonth, setReportMonth] = useState({
//     monthlySales: Array(12).fill(0),
//     monthlyExpense: Array(12).fill(0),
//     monthlyPandL: Array(12).fill(0),
// monthlyTax:    Array(12).fill(0),
//    totals: {
//      totalSales: 0,
//      totalTax: 0,
//      totalExpenses: 0,
//     totalPL: 0   },
//     labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
   
//   })
//   const [stock, setStock] = useState([])
//   const [searchQuery, setSearchQuery] = useState('')
//   const { showToast } = useToast()
//   const [userData, setUserData] = useState(getUserData())
//   const [selectedStockFilter, setSelectedStockFilter] = useState(null);

//   const mode = userData?.company_info?.appMode ?? 'advance'
//   const { t, i18n } = useTranslation('global')
//   const lng = i18n.language

//   const [refData, setRefData] = useState({
//   plans: [],
// });

//     const [quantityModal, setQuantityModal] = useState({
//     visible: false,
//     product: null,
//     addedQty: 0,
//     maxAddable: 0, // Add this field
//   });

//   const [selectedBillingType, setSelectedBillingType] = useState('');


// // Inside your component
// const toastShownRef = useRef(false);

// const handleQuantityChange = (e) => {
//   const value = e.target.value;
//   const maxAddable = quantityModal.maxAddable;

//   if (value === '') {
//     setQuantityModal((prev) => ({ ...prev, addedQty: '' }));
//     toastShownRef.current = false; // Reset when input is cleared
//     return;
//   }

//   const val = parseInt(value, 10);

//   if (isNaN(val) || val < 0) {
//     setQuantityModal((prev) => ({ ...prev, addedQty: 0 }));
//     toastShownRef.current = false;
//   } else if (val > maxAddable) {
//     setQuantityModal((prev) => ({ ...prev, addedQty: maxAddable }));

//     if (!toastShownRef.current) {
//       showToast('warning', t('MESSAGES.maximum_stock_limit', { max: maxAddable }));
//       toastShownRef.current = true;
//     }
//   } else {
//     setQuantityModal((prev) => ({ ...prev, addedQty: val }));
//     toastShownRef.current = false; // Reset once valid
//   }
// };

// const openQuantityModal = (product) => {
//   const currentStock = product.stock ?? 0;
//   const totalQuantity = product.qty ?? 0;
//   const maxAddable = totalQuantity - currentStock;

//   setQuantityModal({ 
//     visible: true, 
//     product, 
//     addedQty: maxAddable > 0 ? 1 : 0,
//     maxAddable 
//   });
// };


// const updateQuantity = async () => {
//   try {
//     const sizeId = quantityModal.product.id; // this is the size id
//     const productId = quantityModal.product.product_id; // this is the product id

//     const payload = {
//       size_id: sizeId,
//       added_qty: Number(quantityModal.addedQty)
//     };

//     const response = await post(`/api/product/${productId}/update-quantity`, payload);

//     if (response.success !== false) {
//       showToast('success', t('MESSAGES.stock_updated_success'));
//       setQuantityModal({ visible: false, product: null, addedQty: 0, maxAddable: 0 });
//       fetchStock();
//     } else {
//       showToast('danger', t('MESSAGES.update_stock_failed', { error: response.message || '-' }));
//     }
//   } catch (err) {
//     const errorMessage = err.response?.data?.message || err.message || '-';
//     showToast('danger', t('MESSAGES.update_stock_failed', { error: errorMessage }));
//   }
// };




//   const [newProductModal, setNewProductModal] = useState({
//       visible: false,
//       localNameEdited: false,
//       formData: {
//         name: '',
//         localName: '',
//         slug: '',
//         categoryId: 0,
//         incStep: 1,
//         desc: '',
//         multiSize: false,
//         show: true,
//         returnable: true,
//         showOnHome: true,
//         unit: '',
//         qty: '',
//         stock:'',
//         oPrice: '',
//         // bPrice: '',
//         media: [],
//         sizes: [],
//       },
//       images: [] 
//     });

//   const isCreditReportPlan = () => {
//   const planName = userData?.company_info?.subscribed_plan_name?.toLowerCase() || '';

//   const restrictedPlans = [
//     'monthly business essential (start-up) - credit report',
//     'quarterly business essential (start-up) - credit report',
//     'half-yearly business essential (start-up) - credit report',
//     'annually business essential (start-up) - credit report',
   
//   ];

//   return restrictedPlans.includes(planName);
// };

//     const isRestrictedPlan = () => {
//   const planName = userData?.company_info?.subscribed_plan_name?.toLowerCase() || '';

//   const restrictedPlans = [
//     'monthly business essential (start-up) - credit report',
//     'monthly business essential (start-up) - advanced booking',
//     'quarterly business essential (start-up) - credit report',
//     'quarterly business essential (start-up) - advanced booking',
//     'half-yearly business essential (start-up) - credit report',
//     'half-yearly business essential (start-up) - advanced booking',
//     'annually business essential (start-up) - credit report',
//     'annually business essential (start-up) - advanced booking'
//   ];

//   return restrictedPlans.includes(planName);
// };

  
//     // Bulk Upload Modal State
//     const [bulkUploadModal, setBulkUploadModal] = useState({
//       visible: false,
//       csvFile: null,
//       isUploading: false,
//       message: '',
//       isError: false,
//     });



// const [activeTab, setActiveTab] = useState('Year');

//   const [stateYear, setStateYear] = useState({ start_date: '', end_date: '' });
//   const [stateQuarter, setStateQuarter] = useState({ start_date: '', end_date: '' });
//   const [stateMonth, setStateMonth] = useState({ start_date: '', end_date: '' });
//   const [stateWeek, setStateWeek] = useState({ start_date: '', end_date: '' });
//   const [stateCustom, setStateCustom] = useState({ start_date: '', end_date: '' });

//   const [loadingReport, setLoadingReport] = useState(false);

// // Fetch only yearly data – best compromise without backend change
// const fetchReportData = async () => {
//     if (mode !== 'advance') return;

//     let params = {};
//     let selectedDates = {};

//     switch (activeTab) {
//       case 'Year':
//         selectedDates = stateYear;
//         if (!selectedDates.start_date) return;
//         const y = new Date(selectedDates.start_date).getFullYear();
//         params = { filter: 'yearly', year: y };
//         break;

//       case 'Quarter':
//         selectedDates = stateQuarter;
//         if (!selectedDates.start_date) return;
//         const qYear = new Date(selectedDates.start_date).getFullYear();
//         const q = Math.ceil(new Date(selectedDates.start_date).getMonth() / 3) + 1;
//         params = { filter: 'quarterly', year: qYear, quarter: q };
//         break;

//       case 'Month':
//         selectedDates = stateMonth;
//         if (!selectedDates.start_date) return;
//         const mYear = new Date(selectedDates.start_date).getFullYear();
//         const m = new Date(selectedDates.start_date).getMonth() + 1;
//         params = { filter: 'monthly', year: mYear, month: m };
//         break;

//       case 'Week':
//         selectedDates = stateWeek;
//         if (!selectedDates.start_date) return;
//         const wYear = new Date(selectedDates.start_date).getFullYear();
//         const weekNum = getISOWeek(new Date(selectedDates.start_date));
//         params = { filter: 'weekly', year: wYear, week: weekNum };
//         break;

//       case 'Custom':
//         selectedDates = stateCustom;
//         if (!selectedDates.start_date || !selectedDates.end_date) return;
//         params = {
//           filter: 'custom',
//           startDate: selectedDates.start_date,
//           endDate: selectedDates.end_date,
//         };
//         break;

//       default:
//         return;
//     }

//     setLoadingReport(true);

//     try {
//       const query = new URLSearchParams(params).toString();
//       const response = await getAPICall(`/api/monthlyIncomeSummaries?${query}`);

//       if (response?.success !== false) {
//         const isYearly = response.filter === 'yearly';

//         setReportMonth({
//           monthlySales: (response.monthlySales || []).map(v => Number(v) || 0),
//           monthlyTax: (response.monthlyTax || []).map(v => Number(v) || 0),
//           monthlyExpense: (response.monthlyExpense || []).map(v => Number(v) || 0),
//           monthlyPandL: (response.monthlyPandL || []).map(v => Number(v) || 0),
//           totals: response.totals || {
//             totalSales: 0,
//             totalTax: 0,
//             totalExpenses: 0,
//             totalPL: 0,
//           },
//           labels: isYearly
//             ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
//             : response.labels || [],
//         });
//       } else {
//         showToast('warning', response?.error || 'No data returned');
//       }
//     } catch (err) {
//       console.error(err);
//       showToast('danger', 'Failed to load financial summary');
//     } finally {
//       setLoadingReport(false);
//     }
//   };

//   // Helper – get ISO week number (1–53)
//   const getISOWeek = (date) => {
//     const d = new Date(date);
//     d.setHours(0, 0, 0, 0);
//     d.setDate(d.getDate() + 4 - (d.getDay() || 7));
//     const yearStart = new Date(d.getFullYear(), 0, 1);
//     return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
//   };

//   useEffect(() => {
//     fetchReportData();
//   }, [activeTab, stateYear.start_date, stateQuarter.start_date, stateMonth.start_date, stateWeek.start_date, stateCustom.start_date, stateCustom.end_date]);



//   // Subscription validity states - now fetched from API
//   const [showValidityModal, setShowValidityModal] = useState(false)
//   const [subscriptionData, setSubscriptionData] = useState(null)
//   const [plans, setPlans] = useState([])
//   const [renewalForm, setRenewalForm] = useState({
//     plan_id: 1,
//     duration: 1, // months
//     validity_date: ''
//   })
//   const [loading, setLoading] = useState(false)

//   // Banner visibility state
//   const [showBanner, setShowBanner] = useState(false)

//   // Fetch subscription status from API
//   const fetchSubscriptionStatus = async () => {
//     try {
//       if (user === 1 && userData?.company_id) {
//         setLoading(true)
//         console.log('Fetching subscription status for company:', userData.company_id)
        
//         const response = await getAPICall(`/api/company/subscription-status/${userData.company_id}`)
        
//         if (response) {
//           console.log('Subscription status received:', response)
//           setSubscriptionData(response)
          
//           // Check if subscription needs attention
//           if (response.is_expired || response.is_expiring_soon) {
//             setShowBanner(true)
            
//             // If expired, show modal immediately
//             if (response.is_expired) {
//               setShowValidityModal(true)
//             }
//           } else {
//             setShowBanner(false)
//           }
//         }
//       }
//     } catch (error) {
//       console.error('Error fetching subscription status:', error)
//       showToast('danger', 'Failed to fetch subscription status')
//     } finally {
//       setLoading(false)
//     }
//   }


//     // New Product Modal Functions
//     const openNewProductModal = () => {
//       setNewProductModal({
//         visible: true,
//         localNameEdited: false,
//         formData: {
//           name: '',
//           localName: '',
//           slug: '',
//           categoryId: 0,
//           incStep: 1,
//           desc: '',
//           multiSize: false,
//           show: true,
//           returnable: true,
//           showOnHome: true,
//           unit: '',
//           qty: '',
//           stock: '',
//           oPrice: '',
//           // bPrice: '',
//           media: [],
//           sizes: [],
//         }
//       });
//     };
  
//     const closeNewProductModal = () => {
//       setNewProductModal(prev => ({ ...prev, visible: false }));
//     };
  
//   const handleNewProductChange = (e) => {
//     const { name, value } = e.target;
//     const numericFields = ['qty', 'stock', 'incStep']; // Removed 'oPrice' from here
    
//     if (numericFields.includes(name)) {
//       // Allow empty string for clearing the field
//       if (value === '') {
//         setNewProductModal(prev => ({
//           ...prev,
//           formData: { ...prev.formData, [name]: '' }
//         }));
//         return;
//       }
      
//       // For numeric fields (qty, stock, incStep)
//       let numValue = parseFloat(value);
//       if (isNaN(numValue) || numValue < 0) return;
      
//       // Additional validation for stock field
//       if (name === 'stock') {
//         const currentQty = parseFloat(newProductModal.formData.qty) || 0;
//         if (currentQty > 0 && numValue > currentQty) {
//           showToast('warning', `Stock cannot exceed capacity (${currentQty})`);
//           return;
//         }
//       }
      
//       // Additional validation for qty field when stock exists
//       if (name === 'qty') {
//         const currentStock = parseFloat(newProductModal.formData.stock) || 0;
//         if (currentStock > 0 && numValue < currentStock) {
//           showToast('warning', `Capacity cannot be less than current stock (${currentStock})`);
//           return;
//         }
//       }
      
//       setNewProductModal(prev => ({
//         ...prev,
//         formData: { ...prev.formData, [name]: numValue }
//       }));
//       return;
//     }
    
//     // Handle price field separately to preserve decimal formatting
//     if (name === 'oPrice') {
//       // Allow empty string for clearing the field
//       if (value === '') {
//         setNewProductModal(prev => ({
//           ...prev,
//           formData: { ...prev.formData, [name]: '' }
//         }));
//         return;
//       }
      
//       // Allow only numbers and one decimal point
//       const regex = /^\d*\.?\d{0,2}$/;
//       if (!regex.test(value)) {
//         return; // Don't update if it doesn't match the pattern
//       }
      
//       // Store as string to preserve decimal formatting
//       setNewProductModal(prev => ({
//         ...prev,
//         formData: { ...prev.formData, [name]: value }
//       }));
//       return;
//     }
    
//     // Handle name field with auto-sync to localName
//     if (name === 'name') {
//       setNewProductModal(prev => ({
//         ...prev,
//         formData: {
//           ...prev.formData,
//           name: value,
//           localName: prev.localNameEdited ? prev.formData.localName : value
//         }
//       }));
//     } 
//     // Handle localName field
//     else if (name === 'localName') {
//       setNewProductModal(prev => ({
//         ...prev,
//         localNameEdited: true,
//         formData: { ...prev.formData, localName: value }
//       }));
//     } 
//     // Handle all other text fields
//     else {
//       setNewProductModal(prev => ({
//         ...prev,
//         formData: { ...prev.formData, [name]: value }
//       }));
//     }
//   };
  
  
//     const handleNewProductCBChange = (e) => {
//       const { name, checked } = e.target;
//       setNewProductModal(prev => ({
//         ...prev,
//         formData: { ...prev.formData, [name]: checked }
//       }));
//     };
  
//     const uploadNewProductImages = async (productId) => {
//     try {
//       if (
//         !newProductModal ||
//         !Array.isArray(newProductModal.images) ||
//         newProductModal.images.length === 0
//       ) {
//         console.log('✅ No images to upload.');
//         return { success: true };
//       }
  
//       // Clean any undefined or empty entries
//       const validImages = newProductModal.images.filter(Boolean);
  
//       if (validImages.length === 0) {
//         console.log('✅ All images were empty or invalid, skipping upload.');
//         return { success: true };
//       }
  
//       const formData = new FormData();
//       validImages.forEach((img, index) => {
//         formData.append('images[]', img);
//       });
//       formData.append('product_id', productId.toString());
  
//       console.log('📤 Uploading images for product ID:', productId);
  
//       const response = await postFormData('/api/product/media/multiple', formData);
  
//       console.log('✅ Image upload success:', response);
//       return { success: true, response };
//     } catch (error) {
//       console.error('❌ Image upload failed:', error);
//       return { success: false, error };
//     }
//   };
  
  
  
  
//   const handleNewProductSubmit = async (e) => {
//     e.preventDefault();
//     const form = e.target;
//     if (!form.checkValidity()) {
//       form.classList.add('was-validated');
//       return;
//     }
  
//     // Validate selling price format
//     const oPriceValue = newProductModal.formData.oPrice;
//     const oPrice = parseFloat(oPriceValue);
//     if (isNaN(oPrice) || oPrice < 0) {
//       showToast('danger', 'Please enter a valid selling price');
//       return;
//     }
  
//     // Additional validation for stock vs capacity
//     const qty = parseFloat(newProductModal.formData.qty) || 0;
//     const stock = parseFloat(newProductModal.formData.stock) || 0;
//     if (stock > qty) {
//       showToast('danger', `Initial stock (${stock}) cannot exceed capacity (${qty})`);
//       return;
//     }
  
//     let data = { ...newProductModal.formData, sizes: [] };
//     data.slug = data.name.replace(/[^\w]/g, '_');
  
//     if (!newProductModal.formData.multiSize) {
//       data.sizes.push({
//         name: data.name,
//         localName: data.localName,
//         qty: data.qty,
//         oPrice: oPriceValue,
//         dPrice: oPriceValue,
//         stock: data.stock,
//         show: true,
//         returnable: data.returnable,
//       });
//       delete data.oPrice;
//       delete data.qty;
//       delete data.stock;
//     }
  
//     try {
//       const resp = await post('/api/product', data);
//       console.log('✅ Product creation response:', resp);
  
//       if (resp && resp.id) {
//         showToast('success', 'Product added successfully');
  
//         console.log('📦 Created product ID:', resp.id);
//         console.log('🖼️ Images before upload:', newProductModal.images);
  
//         const imageResult = await uploadNewProductImages(resp.id);
  
//         if (imageResult.success) {
//           if (
//             Array.isArray(newProductModal.images) &&
//             newProductModal.images.filter(Boolean).length
//           ) {
//             showToast('success', 'Images uploaded successfully');
//           }
//         } else {
//           showToast('warning', 'Product saved, but image upload failed.');
//         }
  
//         closeNewProductModal();
//         fetchStock();
//       } else if (resp && resp.message) {
//         showToast('danger', resp.message);
//       } else {
//         showToast('danger', 'Unexpected response from server.');
//       }
//     } catch (error) {
//       console.error('❌ Product creation error:', error);
  
//       if (error.response) {
//         const status = error.response.status;
//         const data = error.response.data;
  
//         if (status === 422 && data.errors) {
//           Object.entries(data.errors).forEach(([field, fieldErrors]) => {
//             fieldErrors.forEach((msg) => {
//               showToast('danger', msg);
//             });
//           });
//         } else if (data.message) {
//           showToast('danger', data.message);
//         } else {
//           showToast('danger', `Server error (${status}).`);
//         }
//       } else if (error.request) {
//         showToast('danger', 'Network error. Please check your connection.');
//       } else {
//         showToast('danger', 'An unexpected error occurred. Please try again.');
//       }
//     }
//   };
  
  
  
  
//     // Bulk Upload Modal Functions
//     const openBulkUploadModal = () => {
//       setBulkUploadModal({
//         visible: true,
//         csvFile: null,
//         isUploading: false,
//         message: '',
//         isError: false,
//       });
//     };
  
//     const closeBulkUploadModal = () => {
//       setBulkUploadModal(prev => ({ ...prev, visible: false }));
//     };
  
//     const handleBulkFileChange = (e) => {
//       const file = e.target.files[0];
//       setBulkUploadModal(prev => ({
//         ...prev,
//         csvFile: file,
//         message: '',
//         isError: false,
//       }));
//     };
  
//     const handleBulkUpload = async () => {
//       if (!bulkUploadModal.csvFile) {
//         setBulkUploadModal(prev => ({
//           ...prev,
//           message: 'Please select a CSV file to upload.',
//           isError: true,
//         }));
//         return;
//       }
  
//       if (bulkUploadModal.csvFile.type !== "text/csv" && !bulkUploadModal.csvFile.name.endsWith(".csv")) {
//         setBulkUploadModal(prev => ({
//           ...prev,
//           message: 'Invalid file type. Please upload a valid CSV file.',
//           isError: true,
//         }));
//         return;
//       }
  
//       const formData = new FormData();
//       formData.append('csv_file', bulkUploadModal.csvFile);
  
//       try {
//         setBulkUploadModal(prev => ({ ...prev, isUploading: true }));
        
//         const response = await postFormDataCsv('/api/uploadProducts', formData, {
//           headers: { 'Content-Type': 'multipart/form-data' },
//         });
  
//         const resMessage = response?.data?.message || response?.message;
  
//         if (resMessage) {
//           setBulkUploadModal(prev => ({
//             ...prev,
//             message: resMessage,
//             isError: false,
//             csvFile: null,
//           }));
//           showToast('success', 'Products uploaded successfully!');
//            await fetchStock();
//         } else {
//           setBulkUploadModal(prev => ({
//             ...prev,
//             message: 'Upload failed. Check CSV format.',
//             isError: true,
//           }));
//         }
//       } catch (error) {
//         console.error('Upload error:', error);
//         const errMsg = error.response?.data?.error || 'Upload failed. Check CSV format.';
//         setBulkUploadModal(prev => ({
//           ...prev,
//           message: errMsg,
//           isError: true,
//         }));
//         showToast('danger', errMsg);
//       } finally {
//         setBulkUploadModal(prev => ({ ...prev, isUploading: false }));
//       }
//     };
  
//     const downloadSampleTemplate = () => {
//       const link = document.createElement('a');
//       link.href = 'sample_products_template.csv';
//       link.download = 'SampleProductTemplate.csv';
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//     };

//   useEffect(() => {
//     try {
//       const fetchMonthlySales = async () => {
//         const response = await getAPICall('/api/monthlyIncomeSummaries')
//         setReportMonth(response)
//       }
//       if (mode === 'advance') {
//         fetchMonthlySales()
//       }
//     } catch (error) {
//       showToast('danger', 'Error occurred ' + error)
//     }
//   }, [])

//   const fetchStock = async () => {
//   try {
//     const response = await getAPICall('/api/stock');
//     setStock(response);
//   } catch (error) {
//     showToast('danger', 'Error occurred while fetching stock');
//   }
// };

// useEffect(() => {
//   fetchStock();
// }, []);

//   // Fetch subscription status and plans on component mount
//   useEffect(() => {
//     const initializeData = async () => {
//       await Promise.all([
//         fetchSubscriptionStatus(),
//         fetchPlans()
//       ])
//     }

//     initializeData()
    
//     // Set up periodic refresh every 5 minutes
//     const interval = setInterval(() => {
//       fetchSubscriptionStatus()
//     }, 5 * 60 * 1000)

//     return () => clearInterval(interval)
//   }, [userData?.company_id])

// const fetchPlans = async () => {
//   try {
//     const response = await getAPICall('/api/detailsForCompany');
//     console.log('Raw response:', response);

//     const allPlans = response?.plans || [];

//     // Store full plans in refData
//     setRefData((prev) => ({
//       ...prev,
//       plans: allPlans
//     }));

//     // Filter Monthly and Annually only (exclude Free Trial)
//     const filteredPlans = allPlans.filter(plan => {
//       const name = plan.name?.toLowerCase() || '';
//       return (
//         (name.includes('monthly') || name.includes('annually') ||name.includes('quarterly') ||name.includes('half-yearly')) &&
//         !name.includes('free trial')
//       );
//     });

//     console.log('Filtered Plans:', filteredPlans); // Debug
//     setPlans(filteredPlans);
//   } catch (error) {
//     console.error('Error fetching plans:', error);
//     showToast('danger', 'Failed to fetch subscription plans');
//   }
// };





// const calculateNewValidityDate = (customDuration = null) => {
//   const duration = customDuration ?? renewalForm.duration;
  
//   if (!subscriptionData?.subscription_validity) {
//     const today = new Date();
//     const newDate = new Date(today);
//     newDate.setMonth(newDate.getMonth() + parseInt(duration));
//     return newDate.toISOString().split('T')[0];
//   }

//   const currentValidityDate = new Date(subscriptionData.subscription_validity);
//   const today = new Date();
//   const baseDate = currentValidityDate > today ? currentValidityDate : today;

//   const newDate = new Date(baseDate);
//   newDate.setMonth(newDate.getMonth() + parseInt(duration));

//   return newDate.toISOString().split('T')[0];
// };


//  const handleRenewalFormChange = (e) => {
//   const { name, value } = e.target;

//   // When plan is selected
//   if (name === 'plan_id') {
//     const selectedPlan = plans.find(plan => plan.id === parseInt(value));

//     let newDuration = 1; // default

//     if (selectedPlan?.name?.toLowerCase().includes('annually')) {
//       newDuration = 12;
//     } else if (selectedPlan?.name?.toLowerCase().includes('monthly')) {
//       newDuration = 1;
//     }
//      else if (selectedPlan?.name?.toLowerCase().includes('quarterly')) {
//       newDuration = 3;
//     }
//      else if (selectedPlan?.name?.toLowerCase().includes('half-yearly')) {
//       newDuration = 6;
//     }

//     setRenewalForm((prev) => ({
//       ...prev,
//       plan_id: value,
//       duration: newDuration,
//       validity_date: calculateNewValidityDate(newDuration)
//     }));
//   } else {
//     setRenewalForm((prev) => ({
//       ...prev,
//       [name]: value
//     }));
//   }
// };


//   const handleDurationChange = (e) => {
//     const duration = parseInt(e.target.value)
//     setRenewalForm(prev => {
//       const newForm = {
//         ...prev,
//         duration
//       }
//       return {
//         ...newForm,
//         validity_date: calculateNewValidityDate()
//       }
//     })
//   }

//   useEffect(() => {
//     if (renewalForm.duration && subscriptionData?.subscription_validity) {
//       const currentValidityDate = new Date(subscriptionData.subscription_validity)
//       const today = new Date()
      
//       const baseDate = currentValidityDate > today ? currentValidityDate : today
      
//       const newDate = new Date(baseDate)
//       newDate.setMonth(newDate.getMonth() + parseInt(renewalForm.duration))
      
//       const newValidityDate = newDate.toISOString().split('T')[0]
      
//       if (newValidityDate !== renewalForm.validity_date) {
//         setRenewalForm(prev => ({
//           ...prev,
//           validity_date: newValidityDate
//         }))
//       }
//     }
//   }, [renewalForm.duration, renewalForm.plan_id, subscriptionData])

// // ✅ Round to nearest 0.2
// const roundToPointTwo = (value) => {
//   return Math.round(value * 5) / 5;
// };

// // ✅ Get selected plan object
// const getSelectedPlan = () => {
//   return plans.find(p => p.id == renewalForm.plan_id);
// };

// // ✅ Base amount before GST (rounded to 0.2)
// const calculateBaseAmount = () => {
//   const plan = getSelectedPlan();
//   if (!plan) return 0;

//   const totalWithGST = plan.price * renewalForm.duration;
//   const baseAmount = totalWithGST / 1.18;

//   return roundToPointTwo(baseAmount);
// };

// // ✅ GST amount (rounded to 0.2)
// const calculateGST = () => {
//   const plan = getSelectedPlan();
//   if (!plan) return 0;

//   const totalWithGST = plan.price * renewalForm.duration;
//   const baseAmount = totalWithGST / 1.18;
//   const gstAmount = totalWithGST - baseAmount;

//   return roundToPointTwo(gstAmount);
// };

// // ✅ Final amount (price × duration, rounded to 0.2)
// const calculateFinalAmount = () => {
//   const plan = getSelectedPlan();
//   if (!plan) return 0;

//   const total = plan.price * renewalForm.duration;

//   return roundToPointTwo(total);
// };



//   // Function to generate and download PDF receipt
//   const generateReceiptPDF = (paymentResponse, receiptResponse) => {
//     try {
//       const receiptData = {
//         company: {
//           company_name: userData?.company_info?.company_name || userData?.name || 'N/A',
//           phone_no: userData?.mobile || userData?.company_info?.phone_no || 'N/A',
//           email_id: userData?.email || userData?.company_info?.email_id || 'N/A'
//         },
//         plan: {
//           name: getSelectedPlan()?.name || 'Selected Plan',
//           price: getSelectedPlan()?.price || 0
//         },
//         transaction_id: paymentResponse?.razorpay_payment_id || 'N/A',
//         total_amount: calculateBaseAmount(),
//         gst: calculateGST(),
//         payable_amount: calculateFinalAmount(),
//         valid_till: renewalForm.validity_date,
//         created_at: new Date().toISOString(),
//         renewal_duration: renewalForm.duration
//       }

//       console.log('Generating PDF with data:', receiptData)
      
//       // Generate and download the PDF
//       const filename = generateCompanyReceiptPDF(receiptData)
      
//       console.log('PDF generated successfully:', filename)
//       showToast('success', 'Receipt downloaded successfully!')
      
//       return filename
//     } catch (error) {
//       console.error('Error generating PDF receipt:', error)
//       showToast('warning', 'Subscription renewed successfully, but failed to generate receipt PDF')
//     }
//   }

//   const getBannerColorClass = (subscriptionData) => {
//   // If subscription is expired
//   if (subscriptionData.is_expired) {
//     return 'expired';
//   }
  
//   // If it's a free trial (you'll need to add this field to your API response)
//   if (subscriptionData.is_trial) {
//     return 'trial';
//   }
  
//   // If less than 15 days remaining
//   if (subscriptionData.days_remaining < 15) {
//     return 'critical';
//   }
  
//   // If less than or equal to 30 days (1 month) remaining
//   if (subscriptionData.days_remaining <= 30) {
//     return 'warning';
//   }
  
//   // If more than 30 days remaining
//   return 'active';
// };

// // Function to determine button color based on subscription status
// const getButtonColor = (subscriptionData) => {
//   if (subscriptionData.is_expired || subscriptionData.days_remaining < 15) {
//     return 'danger';
//   }
//   if (subscriptionData.is_trial) {
//     return 'warning';
//   }
//   if (subscriptionData.days_remaining <= 30) {
//     return 'warning';
//   }
//   return 'success';
// };

// const getStockBadgeColor = (stock, qty) => {
//   const percent = (stock / qty) * 100;

//   if (stock <= 0) return { color: 'secondary', className: 'badge-strobe-grey' }; // Out of stock
//   if (percent <= 25) return { color: 'danger', className: 'badge-strobe-danger' }; // Critical
//   if (percent <= 50) return { color: 'warning', className: 'badge-strobe-warning' }; // Low
//   return { color: 'success', className: '' }; // Healthy
// };


//   const handlePayment = async () => {
//     try {
//       if (!renewalForm.plan_id || !renewalForm.duration) {
//         showToast('danger', 'Please select a plan and duration')
//         return
//       }

//       if (!window.Razorpay) {
//         const script = document.createElement("script")
//         script.src = "https://checkout.razorpay.com/v1/checkout.js"
//         await new Promise((resolve, reject) => {
//           script.onload = resolve
//           script.onerror = reject
//           document.body.appendChild(script)
//         })
//       }

//       const paymentData = {
//         amount: calculateFinalAmount(),
//       }

//       const data = await post("/api/create-order", paymentData)

//       if (data) {
//         const options = {
//           key: data.key,
//           amount: data.order.amount,
//           currency: data.order.currency,
//           order_id: data.order.id,
//           name: "Subscription Renewal",
//           description: `${getSelectedPlan()?.name} - ${renewalForm.duration} months`,
//           handler: async (response) => {
//             try {
//               const verifyResponse = await post("/api/verify-payment", {
//                 razorpay_order_id: response.razorpay_order_id,
//                 razorpay_payment_id: response.razorpay_payment_id,
//                 razorpay_signature: response.razorpay_signature,
//               })

//               if (verifyResponse?.success) {
//                 const renewalData = {
//                   company_id: userData.company_id,
//                   plan_id: renewalForm.plan_id,
//                   // user_id: userData.id,
//                   total_amount: calculateFinalAmount(),
//                   valid_till: renewalForm.validity_date,
//                   transaction_id: response.razorpay_payment_id,
//                   transaction_status: 'success',
//                   renewal_type: 'extension'
//                 }

//                 const receiptResponse = await post('/api/company-receipt', renewalData)
                
//                 const updateResponse = await post('/api/company/update-validity', {
//                   company_id: userData.company_id,
//                   valid_till: renewalForm.validity_date,
//                   plan_id: renewalForm.plan_id
//                 })

//                 if (receiptResponse?.success && updateResponse?.success) {
//                   showToast('success', 'Subscription renewed successfully!')
                  
//                   // Generate and download PDF receipt
//                   setTimeout(() => {
//                     generateReceiptPDF(response, receiptResponse)
//                   }, 1000) // Small delay to ensure UI updates first
                  
//                   setShowValidityModal(false)
//                   setShowBanner(false)
                  
//                   // Refresh subscription status from API
//                   await fetchSubscriptionStatus()
//                 } else {
//                   showToast('danger', 'Payment successful but failed to update subscription. Please contact support.')
//                 }
//               } else {
//                 showToast('danger', 'Payment verification failed')
//               }
//             } catch (error) {
//               showToast('danger', 'Payment successful but failed to update subscription: ' + error)
//               console.error('Renewal error:', error)
//             }
//           },
//           prefill: {
//             name: userData.name,
//             email: userData.email,
//             contact: userData.mobile
//           },
//           theme: {
//             color: "#3399cc",
//           },
//         }

//         const razorpay = new window.Razorpay(options)
//         razorpay.open()

//         razorpay.on("payment.failed", async(response) => {
//           console.error("Payment Failed:", response.error)
//           showToast('danger', 'Payment failed. Please try again.')
          
//           try {
//             const receiptData = {
//               company_id: userData.company_id,
//               plan_id: renewalForm.plan_id,
//               user_id: userData.id,
//               total_amount: calculateFinalAmount(),
//               valid_till: renewalForm.validity_date,
//               transaction_id: response.error?.metadata?.payment_id ?? 'failed',
//               transaction_status: response.error?.description ?? 'Failed',
//               renewal_type: 'extension_failed'
//             }
//             await post('/api/company-receipt', receiptData)
//           } catch (error) {
//             console.error('Error logging failed payment:', error)
//           }
//         })
//       }
//     } catch (error) {
//       console.error("Payment error:", error)
//       showToast('danger', 'Something went wrong with payment: ' + error.message)
//     }
//   }

//  const getStockStatus = (stock, quantity) => {
//     const stockNum = parseInt(stock) || 0;
//     const qtyNum = parseInt(quantity) || 1; // Prevent division by zero
//     const percentage = (stockNum / qtyNum) * 100;
    
//     if (percentage < 20) {
//       return { 
//         level: 'critical', 
//         color: 'danger', 
//         strobe: true, 
//         percentage: percentage.toFixed(1),
//         description: 'Critical - Less than 20% stock remaining'
//       };
//     }
//     if (percentage >= 20 && percentage <= 50) {
//       return { 
//         level: 'low', 
//         color: 'warning', 
//         strobe: true, 
//         percentage: percentage.toFixed(1),
//         description: 'Low - 20-50% stock remaining'
//       };
//     }
//     return { 
//       level: 'good', 
//       color: 'success', 
//       strobe: false, 
//       percentage: percentage.toFixed(1),
//       description: 'Good - More than 50% stock remaining'
//     };
//   };

// //   const filteredStock = stock.filter((p) => {
// //   if (!p.product || !p.product.showOnHome) return false;

// //   const name = (p.name || "").toLowerCase();
// //   const localName = (p.localName || "").toLowerCase();
// //   const query = searchQuery.toLowerCase();

// //   return name.includes(query) || localName.includes(query);
// // });
// const filteredStock = stock.filter((p) => {
//   if (!p.product || !p.product.showOnHome) return false;

//   const name = (p.name || "").toLowerCase();
//   const localName = (p.localName || "").toLowerCase();
//   const query = searchQuery.toLowerCase();

//   const matchesSearch = name.includes(query) || localName.includes(query);

//   // filter by stock level if selected
//   if (selectedStockFilter) {
//     const percent = (p.stock / p.qty) * 100;
//     if (selectedStockFilter === 'critical' && percent >= 20) return false;
//     if (selectedStockFilter === 'low' && (percent < 20 || percent > 50)) return false;
//     if (selectedStockFilter === 'good' && percent <= 50) return false;
//   }

//   return matchesSearch;
// });


//   // Show loading state while fetching subscription data
//   if (loading && !subscriptionData) {
//     return (
//       <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
//         <div className="spinner-border" role="status">
//           <span className="visually-hidden">Loading...</span>
//         </div>
//       </div>
//     )
//   }

//   // If subscription is expired, show only the renewal modal
//   if (subscriptionData?.is_expired && user === 1) {
//     return (
//       <>  
//         <CModal
//           visible={true}
//           backdrop="static"
//           keyboard={false}
//           size="lg"
//         >
//           <CModalHeader closeButton={false}>
//             <CModalTitle>Subscription Expired</CModalTitle>
//           </CModalHeader>
//           <CModalBody>
//             <CAlert color="danger">
//               <div>
//                 <h5>Your subscription has expired!</h5>
//                 <p>Your subscription expired on {subscriptionData.validity_date_formatted}.</p>
//                 <p>Please renew your subscription to continue using the service.</p>
//               </div>
//             </CAlert>

//             <CForm>
//               <CRow>
//               <CCol md={6}>
//   <div className="mb-3">
//     <CFormLabel htmlFor="billing_type">Billing Type</CFormLabel>
//     <CFormSelect
//       id="billing_type"
//       name="billing_type"
//       value={selectedBillingType}
//       onChange={(e) => {
//         setSelectedBillingType(e.target.value);
//         setRenewalForm((prev) => ({
//           ...prev,
//           plan_id: '', // Reset selected plan
//         }));
//       }}
//     >
      
//       <option value="monthly">Monthly</option>
//       <option value="quarterly">Quarterly</option>
//       <option value="half-yearly">Half-Yearly</option>
//       <option value="annually">Annually</option>
//     </CFormSelect>
//   </div>
// </CCol>

              
//                 <CCol md={6}>
//   <div className="mb-3">
//     <CFormLabel htmlFor="plan_id">Select Plan</CFormLabel>
//     <CFormSelect
//       id="plan_id"
//       name="plan_id"
//       value={renewalForm.plan_id}
//       onChange={handleRenewalFormChange}
//       options={[
//         { value: '', label: 'Select a plan...' },
//         ...plans
//           .filter(plan => {
//             const name = plan.name?.toLowerCase() || '';
//             if (!selectedBillingType) return name.includes('monthly');
//             return name.includes(selectedBillingType.toLowerCase());
//           })
//           .map(plan => ({
//             value: plan.id,
//             label: `${plan.name} (₹${plan.price}/month incl. GST)`
//           }))
//       ]}
//     />
//   </div>
// </CCol>

//                 <CCol md={6}>
//                   <div className="mb-3">
//                     <CFormLabel htmlFor="duration">Duration</CFormLabel>
//                     <CFormSelect
//   id="duration"
//   name="duration"
//   value={renewalForm.duration}
//   onChange={handleDurationChange}
//   options={durationOptions}
//   disabled // 👈 disables dropdown
// />

//                   </div>
//                 </CCol>
//               </CRow>

//               <CRow>
//                 <CCol md={12}>
//                   <div className="mb-3">
//                     <CFormLabel htmlFor="validity_date">New Validity Date</CFormLabel>
//                     <CFormInput
//                       type="date"
//                       id="validity_date"
//                       name="validity_date"
//                       value={renewalForm.validity_date}
//                       readOnly
//                     />
//                   </div>
//                 </CCol>
//               </CRow>

//               {getSelectedPlan() && (
//                 <CAlert color="info">
//                   <h6>Payment Summary</h6>
//                   <div className="row">
//                     <div className="col-6">
//                       <p className="mb-1">Plan: {getSelectedPlan()?.name}</p>
//                       <p className="mb-1">Duration: {renewalForm.duration} months</p>
//                       <p className="mb-1">Rate: ₹{getSelectedPlan()?.price}/month (incl. GST)</p>
//                     </div>
//                     <div className="col-6">
//                       <p className="mb-1">Base Amount: ₹{calculateBaseAmount()}</p>
//                       <p className="mb-1">GST (18%): ₹{calculateGST()}</p>
//                       <p className="mb-1"><strong>Total: ₹{calculateFinalAmount()}</strong></p>
//                     </div>
//                   </div>
//                 </CAlert>
//               )}
//             </CForm>
//           </CModalBody>
//           <CModalFooter>
//             <CButton 
//               color="primary" 
//               onClick={handlePayment}
//               disabled={!getSelectedPlan()}
//               size="lg"
//             >
//               Pay ₹{calculateFinalAmount()} & Renew Now
//             </CButton>
//           </CModalFooter>
//         </CModal>
//       </>
//     )
//   }

//   return (
//     <>
//       {/* Responsive Subscription Validity Banner */}
// {/* Responsive Subscription Validity Banner */}
// {showBanner && subscriptionData && (
//   <div 
//     className={`subscription-banner ${getBannerColorClass(subscriptionData)}`}
//   >
//     <style>
//       {`
//         @keyframes flicker {
//           0%, 100% { opacity: 1; }
//           50% { opacity: 0.7; }
//         }
        
//         .subscription-banner {
//           border-radius: 5px;
//           margin-bottom: 20px;
//           animation: flicker 2s infinite;
//           display: flex;
//           align-items: center;
//           justify-content: space-between;
//           padding: 15px;
//           flex-wrap: wrap;
//         }
        
//         /* Expired - Red */
//         .subscription-banner.expired {
//           background-color: #f8d7da;
//           border: 1px solid #f5c6cb;
//           color: #721c24;
//         }
        
//         /* Critical (less than 15 days) - Red */
//         .subscription-banner.critical {
//           background-color: #f8d7da;
//           border: 1px solid #f5c6cb;
//           color: #721c24;
//         }
        
//         /* Warning (1 month or less) - Yellow */
//         .subscription-banner.warning {
//           background-color: #fff3cd;
//           border: 1px solid #ffeaa7;
//           color: #856404;
//         }
        
//         /* Free Trial - Orange */
//         .subscription-banner.trial {
//           background-color: #ffe8d1;
//           border: 1px solid #ffb347;
//           color: #8b4513;
//         }
        
//         /* Active (more than 1 month) - Green */
//         .subscription-banner.active {
//           background-color: #d4edda;
//           border: 1px solid #c3e6cb;
//           color: #155724;
//         }
        
//         .subscription-banner .banner-text {
//           font-weight: bold;
//           flex: 1;
//           min-width: 300px;
//           margin-right: 15px;
//         }
        
//         .subscription-banner .banner-button {
//           flex-shrink: 0;
//         }
        
//         /* Mobile Responsive - Text left, button right like in your image */
//         @media (max-width: 767px) {
//           .subscription-banner {
//             flex-direction: row;
//             align-items: center;
//             justify-content: space-between;
//             padding: 12px;
//             gap: 10px;
//           }
          
//           .subscription-banner .banner-text {
//             min-width: auto;
//             margin-right: 10px;
//             font-size: 13px;
//             line-height: 1.3;
//             text-align: left;
//             flex: 1;
//           }
          
//           .subscription-banner .banner-button {
//             flex-shrink: 0;
//             width: auto;
//           }
//         }
        
//         /* Small mobile devices */
//         @media (max-width: 480px) {
//           .subscription-banner {
//             padding: 10px;
//             gap: 8px;
//           }
          
//           .subscription-banner .banner-text {
//             font-size: 12px;
//             line-height: 1.2;
//             margin-right: 8px;
//           }
//         }
        
//         /* Very small screens */
//         @media (max-width: 360px) {
//           .subscription-banner {
//             padding: 8px;
//             gap: 6px;
//           }
          
//           .subscription-banner .banner-text {
//             font-size: 11px;
//             margin-right: 6px;
//           }
//         }
//       `}
//     </style>
    
//     <div className="banner-text">
//       {subscriptionData.is_expired ? (
//         <span>
//           Your subscription has expired! Your subscription expired on {subscriptionData.validity_date_formatted}. Please renew your subscription to continue using the service.
//         </span>
//       ) : (
//         <span>
//           {subscriptionData.is_trial ? (
//             `Free trial expiring in ${Math.abs(subscriptionData.days_remaining)} days on ${subscriptionData.validity_date_formatted}. Upgrade now to continue using the service.`
//           ) : (
//             `Subscription expiring in ${Math.abs(subscriptionData.days_remaining)} days on ${subscriptionData.validity_date_formatted}. Renew now to avoid service interruption.`
//           )}
//         </span>
//       )}
//     </div>
    
//     <div className="banner-button">
//       <CButton 
//         color={getButtonColor(subscriptionData)} 
//         size="sm"
//         onClick={() => setShowValidityModal(true)}
//         style={{ fontWeight: 'bold' }}
//       >
//         {subscriptionData.is_trial ? 'Upgrade Now' : 'Renew Now'}
//       </CButton>
//     </div>
//   </div>
// )}

//       {/* {mode === 'advance' && (
//         // <WidgetsDropdown className="mb-4" reportMonth={reportMonth} />
//         <WidgetsDropdown
//   className="mb-4"
//   reportMonth={reportMonth}
//   activeFilter={activeTab.toLowerCase()}         // "year", "quarter", "month", "week", "custom"
//   selectedRangeTotals={reportMonth.totals}       // or compute here if needed
// />
//       )} */}

//       {/* Subscription Validity Modal */}
//       <CModal
//         visible={showValidityModal}
//         onClose={subscriptionData?.is_expired ? undefined : () => setShowValidityModal(false)}
//         backdrop={subscriptionData?.is_expired ? "static" : true}
//         keyboard={subscriptionData?.is_expired ? false : true}
//         size="lg"
//       >
//         <CModalHeader closeButton={!subscriptionData?.is_expired}>
//           <CModalTitle>
//             {subscriptionData?.is_expired ? 'Subscription Expired' : 'Subscription Expiring Soon'}
//           </CModalTitle>
//         </CModalHeader>
//         <CModalBody>
//           <CAlert color={subscriptionData?.is_expired ? 'danger' : 'warning'}>
//             {subscriptionData?.is_expired ? (
//               <div>
//                 <h5>Your subscription has expired!</h5>
//                 <p>Your subscription expired {Math.abs(subscriptionData.days_remaining)} days ago on {subscriptionData.validity_date_formatted}.</p>
//                 <p>Please renew your subscription to continue using the service.</p>
//               </div>
//             ) : (
//               <div>
//                 <h5>Subscription Expiring Soon!</h5>
//                 <p>Your subscription will expire in {subscriptionData?.days_remaining} days on {subscriptionData?.validity_date_formatted}.</p>
//                 <p>Renew now to avoid service interruption.</p>
//               </div>
//             )}
//           </CAlert>

//           <CForm>
//             <CRow>
//             <CCol md={6}>
//   <div className="mb-3">
//     <CFormLabel htmlFor="billing_type">Billing Type</CFormLabel>
//     <CFormSelect
//       id="billing_type"
//       name="billing_type"
//       value={selectedBillingType}
//       onChange={(e) => {
//         setSelectedBillingType(e.target.value);
//         setRenewalForm((prev) => ({
//           ...prev,
//           plan_id: '', // Reset selected plan
//         }));
//       }}
//     >
      
//       <option value="monthly">Monthly</option>
//       <option value="quarterly">Quarterly</option>
//       <option value="half-yearly">Half-Yearly</option>
//       <option value="annually">Annually</option>
//     </CFormSelect>
//   </div>
// </CCol>

//  <CCol md={6}>
//   <div className="mb-3">
//     <CFormLabel htmlFor="plan_id">Select Plan</CFormLabel>
//     <CFormSelect
//       id="plan_id"
//       name="plan_id"
//       value={renewalForm.plan_id}
//       onChange={handleRenewalFormChange}
//       options={[
//         { value: '', label: 'Select a plan...' },
//         ...plans
//           .filter(plan => {
//             const name = plan.name?.toLowerCase() || '';
//             if (!selectedBillingType) return name.includes('monthly');
//             return name.includes(selectedBillingType.toLowerCase());
//           })
//           .map(plan => ({
//             value: plan.id,
//             label: `${plan.name} (₹${plan.price}/month incl. GST)`
//           }))
//       ]}
//     />
//   </div>
// </CCol>


//               <CCol md={6}>
//                 <div className="mb-3">
//                   <CFormLabel htmlFor="duration">Duration</CFormLabel>
//                  <CFormSelect
//   id="duration"
//   name="duration"
//   value={renewalForm.duration}
//   onChange={handleDurationChange}
//   options={durationOptions}
//   disabled // 👈 disables dropdown
// />

//                 </div>
//               </CCol>
//             </CRow>

//             <CRow>
//               <CCol md={12}>
//                 <div className="mb-3">
//                   <CFormLabel htmlFor="validity_date">New Validity Date</CFormLabel>
//                   <CFormInput
//                     type="date"
//                     id="validity_date"
//                     name="validity_date"
//                     value={renewalForm.validity_date}
//                     readOnly
//                   />
//                 </div>
//               </CCol>
//             </CRow>

//             {getSelectedPlan() && (
//               <CAlert color="info">
//                 <h6>Payment Summary</h6>
//                 <div className="row">
//                   <div className="col-6">
//                     <p className="mb-1">Plan: {getSelectedPlan()?.name}</p>
//                     <p className="mb-1">Duration: {renewalForm.duration} months</p>
//                     <p className="mb-1">Rate: ₹{getSelectedPlan()?.price}/month (incl. GST)</p>
//                   </div>
//                   <div className="col-6">
//                     <p className="mb-1">Base Amount: ₹{calculateBaseAmount()}</p>
//                     <p className="mb-1">GST (18%): ₹{calculateGST()}</p>
//                     <p className="mb-1"><strong>Total: ₹{calculateFinalAmount()}</strong></p>
//                   </div>
//                 </div>
//               </CAlert>
//             )}
//           </CForm>
//         </CModalBody>
//         <CModalFooter>
//           {!subscriptionData?.is_expired && (
//             <CButton color="secondary" onClick={() => setShowValidityModal(false)}>
//               Later
//             </CButton>
//           )}
//           <CButton 
//             color="primary" 
//             onClick={handlePayment}
//             disabled={!getSelectedPlan()}
//           >
//             Pay ₹{calculateFinalAmount()} & Renew
//           </CButton>
//         </CModalFooter>
//       </CModal>



// {newProductModal.visible && (
//   <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
//     <div className="modal-dialog modal-dialog-centered" style={{ 
//       margin: '0.5rem auto',
//       maxWidth: 'min(600px, calc(100vw - 1rem))',
//       width: '100%'
//     }}>
//       <div className="modal-content">
//         <div className="modal-header">
//           <h5 className="modal-title">{t('LABELS.create_new_product')}</h5>
//           <button
//             type="button"
//             className="btn-close"
//             onClick={closeNewProductModal}
//           ></button>
//         </div>
//         <div className="modal-body">
//           <CForm className="needs-validation" noValidate onSubmit={handleNewProductSubmit}>
//             {/* Product Name and Local Name - Side by side on desktop, stacked on mobile */}
//             <div className="row mb-3">
//               <div className="col-12 col-sm-6 mb-3 mb-sm-0">
//                 <CFormLabel htmlFor="pname"><b>{t('LABELS.product_name')}</b></CFormLabel>
//                 <CFormInput
//                   type="text"
//                   id="pname"
//                   placeholder={t('LABELS.product_name')}
//                   name="name"
//                   value={newProductModal.formData.name}
//                   onChange={handleNewProductChange}
//                   required
//                   feedbackInvalid={t('LABELS.please_provide_name')}
//                   feedbackValid={t('LABELS.looks_good')}
//                 />
//                 <div className="invalid-feedback">{t('LABELS.product_name_required')}</div>
//               </div>
//               <div className="col-12 col-sm-6">
//                 <CFormLabel htmlFor="plname"><b>{t('LABELS.local_name')}</b></CFormLabel>
//                 <CFormInput
//                   type="text"
//                   id="plname"
//                   placeholder={t('LABELS.local_name')}
//                   name="localName"
//                   value={newProductModal.formData.localName}
//                   onChange={handleNewProductChange}
//                 />
//                 <div className="invalid-feedback">{t('LABELS.local_name_required')}</div>
//               </div>
//             </div>

//             {/* Capacity, Stock, Price - Proper layout for desktop and mobile */}
//             <div className="row mb-3">
//               <div className="col-12 col-sm-4 mb-3 mb-sm-0">
//                 <CFormLabel htmlFor="qty"><b>{t('LABELS.capacity')}</b></CFormLabel>
//                 <CFormInput
//                   type="number"
//                   id="qty"
//                   placeholder="0"
//                   min="0"
//                   onWheel={(e) => e.target.blur()}
//                   name="qty"
//                   value={newProductModal.formData.qty}
//                   onChange={handleNewProductChange}
//                   required
//                 />
//                 <div className="invalid-feedback">{t('LABELS.quantity_required')}</div>
//               </div>
              
//               {/* Initial Stock */}
//               <div className="col-12 col-sm-4 mb-3 mb-sm-0">
//                 <CFormLabel htmlFor="stock">
//                   <b>{t('LABELS.initial_stock')}</b>
                  
//                 </CFormLabel>
//                 <CFormInput
//                   type="number"
//                   id="stock"
//                   placeholder="0"
//                   min="0"
//                   onWheel={(e) => e.target.blur()}
//                   max={newProductModal.formData.qty || undefined}
//                   name="stock"
//                   value={newProductModal.formData.stock}
//                   onChange={handleNewProductChange}
//                   required
//                 />
//                 <div className="invalid-feedback">{t('LABELS.initial_stock_required')}</div>
//                 {newProductModal.formData.qty && newProductModal.formData.stock > newProductModal.formData.qty && (
//                   <div className="text-danger small mt-1">
//                     Stock cannot exceed capacity ({newProductModal.formData.qty})
//                   </div>
//                 )}
//               </div>
              
//               {/* Selling Price - Full width on mobile */}
//               <div className="col-12 col-md-4">
//                 <CFormLabel htmlFor="oPrice"><b>{t('LABELS.selling_price')}</b></CFormLabel>
//                 <CFormInput
//                   type="text"
//                   id="oPrice"
//                   placeholder="0.00"
//                   name="oPrice"
//                   onWheel={(e) => e.target.blur()}
//                   value={newProductModal.formData.oPrice}
//                   onChange={handleNewProductChange}
//                   onBlur={(e) => {
//                     // Format to 2 decimal places on blur if value exists and is valid
//                     const value = e.target.value;
//                     if (value && !isNaN(parseFloat(value))) {
//                       const formatted = parseFloat(value).toFixed(2);
//                       setNewProductModal(prev => ({
//                         ...prev,
//                         formData: { ...prev.formData, oPrice: formatted }
//                       }));
//                     }
//                   }}
//                   pattern="^\d*\.?\d{0,2}$"
//                   title="Please enter a valid price (up to 2 decimal places)"
//                   required
//                 />
//                 <div className="invalid-feedback">{t('LABELS.selling_price_required')}</div>
//               </div>
//             </div>

//             <div className="mb-3">
//               <CFormLabel><b>Upload Images</b></CFormLabel>
//               <input
//                 type="file"
//                 multiple
//                 accept="image/*"
//                 className="form-control"
//                 onChange={(e) => {
//                   setNewProductModal(prev => ({
//                     ...prev,
//                     images: [...e.target.files]
//                   }));
//                 }}
//               />
//             </div>


//             {/* Checkbox */}
//             <div className="row mb-3">
//               <div className="col-12">
//                 <CFormCheck
//                   id="show"
//                   label={t('LABELS.show_for_invoicing')}
//                   name="show"
//                   checked={newProductModal.formData.show}
//                   onChange={handleNewProductCBChange}
//                 />
//               </div>
//             </div>

//             {/* Mobile-optimized footer */}
//             <div className="modal-footer d-flex gap-2">
//               <CButton 
//                 color="secondary" 
//                 onClick={closeNewProductModal}
//                 className="flex-fill flex-sm-grow-0"
//               >
//                 {t('LABELS.cancel')}
//               </CButton>
//               <CButton 
//                 color="success" 
//                 type="submit"
//                 className="flex-fill flex-sm-grow-0"
//                 disabled={
//                   newProductModal.formData.stock > newProductModal.formData.qty ||
//                   !newProductModal.formData.name ||
//                   !newProductModal.formData.qty ||
//                   !newProductModal.formData.oPrice
//                 }
//               >
//                 {t('LABELS.create_product')}
//               </CButton>
//             </div>
//           </CForm>
//         </div>
//       </div>
//     </div>
//   </div>
// )}
//     {/* Bulk Upload Modal */}
//     {bulkUploadModal.visible && (
//       <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
//         <div className="modal-dialog modal-dialog-centered">
//           <div className="modal-content">
//             <div className="modal-header">
//               <h5 className="modal-title">{t('LABELS.upload_product_csv')}</h5>
//               <button
//                 type="button"
//                 className="btn-close"
//                 onClick={closeBulkUploadModal}
//               ></button>
//             </div>
//             <div className="modal-body">
//               <div className="mb-3 d-flex align-items-center">
//                 <strong className="me-2">{t('LABELS.sample_csv_template')}</strong>
//                 <CButton
//                   color="success"
//                   variant="outline"
//                   size="sm"
//                   title={t('LABELS.download_sample_template')}
//                   onClick={downloadSampleTemplate}
//                 >
//                   📥 {t('LABELS.download')}
//                 </CButton>
//               </div>
              
//               <div className="mb-3">
//                 <label htmlFor="csvFile" className="form-label">
//                   <strong>{t('LABELS.select_csv_file')}</strong>
//                 </label>
//                 <input
//                   type="file"
//                   id="csvFile"
//                   className="form-control"
//                   accept=".csv"
//                   onChange={handleBulkFileChange}
//                 />
//               </div>

//               {bulkUploadModal.message && (
//                 <div 
//                   className={`alert ${bulkUploadModal.isError ? 'alert-danger' : 'alert-success'}`}
//                   role="alert"
//                 >
//                   {bulkUploadModal.message}
//                 </div>
//               )}
//             </div>
//             <div className="modal-footer">
//               <CButton color="secondary" onClick={closeBulkUploadModal}>
//                 {t('LABELS.cancel')}
//               </CButton>
//               <CButton
//                 color="success"
//                 onClick={handleBulkUpload}
//                 disabled={bulkUploadModal.isUploading || !bulkUploadModal.csvFile}
//               >
//                 {bulkUploadModal.isUploading ? t('LABELS.uploading') : t('LABELS.upload_csv')}
//               </CButton>
//             </div>
//           </div>
//         </div>
//       </div>
//     )}

//    {quantityModal.visible && (
//   <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
//     <div className="modal-dialog modal-dialog-centered">
//       <div className="modal-content">
//         <div className="modal-header">
//           <h5 className="modal-title">
//             {t('LABELS.add_stock')} - {quantityModal.product.name}
//           </h5>
//           <button
//             type="button"
//             className="btn-close"
//             onClick={() =>
//               setQuantityModal({ visible: false, product: null, addedQty: 0, maxAddable: 0 })
//             }
//           ></button>
//         </div>
//         <div className="modal-body">
//           <div className="row mb-3">
//             <div className="col-6">
//               <p className="mb-1">
//                 <b>{t('LABELS.total_quantity')}:</b>{' '}
//                 <span className="badge bg-primary">
//                   {quantityModal.product.qty ?? 0}
//                 </span>
//               </p>
//             </div>
//             <div className="col-6">
//               <p className="mb-1">
//                 <b>{t('LABELS.current_stock')}:</b>{' '}
//                 <span 
//                   className={`badge ${
//                     getStockStatus(
//                       quantityModal.product.stock ?? 0,
//                       quantityModal.product.qty || 1
//                     ).color === 'danger' ? 'bg-danger' : 
//                     getStockStatus(
//                       quantityModal.product.stock ?? 0,
//                       quantityModal.product.qty || 1
//                     ).color === 'warning' ? 'bg-warning text-dark' : 'bg-success'
//                   }`}
//                   style={{
//                     animation: getStockStatus(
//                       quantityModal.product.stock ?? 0,
//                       quantityModal.product.qty || 1
//                     ).strobe ? 'stockStrobe 1.5s infinite' : 'none'
//                   }}
//                 >
//                   {quantityModal.product.stock ?? 0}
//                 </span>
//               </p>
//             </div>
//           </div>

//           <div className="alert alert-info">
//             <small>
//               <strong>{t('LABELS.stock_percentage')}:</strong>{' '}
//               {getStockStatus(
//                 quantityModal.product.stock ?? 0,
//                 quantityModal.product.qty || 1
//               ).percentage}% {t('LABELS.of_total_quantity')}
//             </small>
//           </div>

//           {quantityModal.maxAddable > 0 ? (
//             <>
//               <div className="mb-3">
//                 <label className="form-label">
//                   <b>{t('LABELS.stock_to_add')}:</b>
//                   <small className="text-muted ms-2">
//                     ({t('LABELS.max')}: {quantityModal.maxAddable})
//                   </small>
//                 </label>
//                 <input
//                   type="number"
//                   min="1"
//                   max={quantityModal.maxAddable}
//                   onWheel={(e) => e.target.blur()}
//                   className="form-control custom-placeholder"
//                   placeholder={`${t('LABELS.enter_stock_to_add')} (${t('LABELS.max')}: ${quantityModal.maxAddable})`}
//                   value={quantityModal.addedQty}
//                   onChange={handleQuantityChange}
//                 />
//               </div>

//               <div className="alert alert-success">
//                 <small>
//                   <strong>{t('LABELS.after_adding')}:</strong> {t('LABELS.stock_will_be')}{' '}
//                   {(quantityModal.product.stock ?? 0) + (parseInt(quantityModal.addedQty) || 0)} / {quantityModal.product.qty ?? 0}
//                 </small>
//               </div>
//             </>
//           ) : (
//             <div className="alert alert-warning">
//               <strong>{t('LABELS.stock_is_full')}!</strong> {t('LABELS.stock_full_message')}
//             </div>
//           )}
//         </div>
//         <div className="modal-footer">
//           <CButton
//             color="secondary"
//             onClick={() =>
//               setQuantityModal({ visible: false, product: null, addedQty: 0, maxAddable: 0 })
//             }
//           >
//             {t('LABELS.cancel')}
//           </CButton>
//           <CButton
//             color="primary"
//             onClick={updateQuantity}
//             disabled={
//               !quantityModal.addedQty ||
//               parseInt(quantityModal.addedQty) < 1 ||
//               quantityModal.maxAddable <= 0
//             }
//           >
//             {t('LABELS.add_stock')}
//           </CButton>
//         </div>
//       </div>
//     </div>
//   </div>
// )}



//       {/* {(user === 0 || user === 1) && mode === 'advance' && !isRestrictedPlan() && (
//   <CCard className="mt-4 mb-4">
//     <CCardBody>
//       <CRow>
//         <CCol sm={5}>
//           <h4 id="traffic" className="card-title mb-0">
//             P&L (In Thousands)
//           </h4>
//           <div className="small text-body-secondary">
//             January - December
//           </div>
//         </CCol>
//         <CCol sm={7} className="d-none d-md-block">
         
//         </CCol>
//       </CRow> 
//       <MainChart 
//         monthlyPandL={reportMonth.monthlyPandL}
//         monthlySales={reportMonth.monthlySales}
//         monthlyExpense={reportMonth.monthlyExpense}
//       />
//     </CCardBody>
//   </CCard>
// )} */}



// {mode === 'advance' && (
//         <>
//           {/* Tabs */}
//           <CTabs activeItemKey={activeTab} onChange={setActiveTab} className="mb-4">
//             <CTabList variant="tabs">
//               <CTab itemKey="Year">{t('Year')}</CTab>
//               <CTab itemKey="Quarter">{t('Quarter')}</CTab>
//               <CTab itemKey="Month">{t('Month')}</CTab>
//               <CTab itemKey="Week">{t('Week')}</CTab>
//               <CTab itemKey="Custom">{t('Custom')}</CTab>
//             </CTabList>

//             <CTabContent>
//               {/* Year Tab */}
//               <CTabPanel itemKey="Year" className="p-3">
//                 <Year setStateYear={setStateYear} />
//               </CTabPanel>

//               {/* Quarter Tab */}
//               <CTabPanel itemKey="Quarter" className="p-3">
//                 <Quarter setStateQuarter={setStateQuarter} />
//               </CTabPanel>

//               {/* Month Tab */}
//               <CTabPanel itemKey="Month" className="p-3">
//                 <Months setStateMonth={setStateMonth} />
//               </CTabPanel>

//               {/* Week Tab */}
//               <CTabPanel itemKey="Week" className="p-3">
//                 <Week setStateWeek={setStateWeek} />
//               </CTabPanel>

//               {/* Custom Tab */}
//               <CTabPanel itemKey="Custom" className="p-3">
//                 <Custom setStateCustom={setStateCustom} />
//               </CTabPanel>
//             </CTabContent>
//           </CTabs>

//           {/* Chart & Widgets */}
//           {/* <WidgetsDropdown className="mb-4" reportMonth={reportMonth} /> */}
//           <WidgetsDropdown
//   className="mb-4"
//   reportMonth={reportMonth}
//   activeFilter={activeTab.toLowerCase()}         // "year", "quarter", "month", "week", "custom"
//   selectedRangeTotals={reportMonth.totals}       // or compute here if needed
// />

//           <CCard className="mb-4">
//             <CCardBody>
//               <CRow>
//                 <CCol sm={5}>
//                   <h4 className="card-title mb-0">P&L (In Thousands)</h4>
//                   <div className="small text-body-secondary">
//                     {activeTab} view — {reportMonth?.totals?.totalPL?.toLocaleString() || '—'}
//                   </div>
//                 </CCol>
//               </CRow>

//               <MainChart
//                 monthlyPandL={reportMonth.monthlyPandL}
//                 monthlySales={reportMonth.monthlySales}
//                 monthlyExpense={reportMonth.monthlyExpense}
//               />
//             </CCardBody>
//           </CCard>
//         </>
//       )}


//     </>
//   )
// }

// export default Dashboard




























// import React, { useEffect, useState } from 'react';
// import {
//   CCard,
//   CCardBody,
//   CCol,
//   CRow,
//   CTabs,
//   CTabList,
//   CTabContent,
//   CTab,
//   CFormLabel,
//   CFormInput,
//   CFormSelect,
//   CSpinner,
// } from '@coreui/react';
// import WidgetsDropdown from '../widgets/WidgetsDropdown';
// import MainChart from './MainChart';
// import { getAPICall } from '../../util/api';
// import { getUserData } from '../../util/session';
// import { useToast } from '../common/toast/ToastContext';
// import { useTranslation } from 'react-i18next';

// // ────────────────────────────────────────────────
// // Period selector components
// // ────────────────────────────────────────────────

// const YearSelector = ({ onChange }) => {
//   const currentYear = new Date().getFullYear();
//   const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

//   return (
//     <div className="d-flex gap-3 align-items-center flex-wrap">
//       <CFormLabel className="mb-0">Year:</CFormLabel>
//       <CFormSelect
//         style={{ width: '160px' }}
//         onChange={(e) => {
//           const year = Number(e.target.value);
//           onChange({
//             startDate: `${year}-01-01`,
//             endDate: `${year}-12-31`,
//           });
//         }}
//         defaultValue={currentYear}
//       >
//         {years.map((y) => (
//           <option key={y} value={y}>
//             {y}
//           </option>
//         ))}
//       </CFormSelect>
//     </div>
//   );
// };

// const QuarterSelector = ({ onChange }) => {
//   const currentYear = new Date().getFullYear();
//   const currentQuarter = Math.ceil((new Date().getMonth() + 1) / 3);

//   const quarters = [
//     { label: 'Q1 (Jan–Mar)', value: 1 },
//     { label: 'Q2 (Apr–Jun)', value: 2 },
//     { label: 'Q3 (Jul–Sep)', value: 3 },
//     { label: 'Q4 (Oct–Dec)', value: 4 },
//   ];

//   const [year, setYear] = useState(currentYear);
//   const [q, setQ] = useState(currentQuarter);

//   useEffect(() => {
//     const m = (q - 1) * 3 + 1;
//     const start = `${year}-${String(m).padStart(2, '0')}-01`;
//     const endMonth = m + 2;
//     const endDay = new Date(year, endMonth, 0).getDate();
//     const end = `${year}-${String(endMonth).padStart(2, '0')}-${endDay}`;
//     onChange({ startDate: start, endDate: end });
//   }, [year, q, onChange]);

//   return (
//     <div className="d-flex gap-3 align-items-center flex-wrap">
//       <div>
//         <CFormLabel className="mb-0 me-2">Year:</CFormLabel>
//         <CFormSelect
//           style={{ width: '140px' }}
//           value={year}
//           onChange={(e) => setYear(Number(e.target.value))}
//         >
//           {Array.from({ length: 11 }, (_, i) => currentYear - 5 + i).map((y) => (
//             <option key={y} value={y}>
//               {y}
//             </option>
//           ))}
//         </CFormSelect>
//       </div>

//       <div>
//         <CFormLabel className="mb-0 me-2">Quarter:</CFormLabel>
//         <CFormSelect
//           style={{ width: '180px' }}
//           value={q}
//           onChange={(e) => setQ(Number(e.target.value))}
//         >
//           {quarters.map((qt) => (
//             <option key={qt.value} value={qt.value}>
//               {qt.label}
//             </option>
//           ))}
//         </CFormSelect>
//       </div>
//     </div>
//   );
// };

// const MonthSelector = ({ onChange }) => {
//   const currentYear = new Date().getFullYear();
//   const currentMonth = new Date().getMonth() + 1;

//   const [year, setYear] = useState(currentYear);
//   const [month, setMonth] = useState(currentMonth);

//   useEffect(() => {
//     const start = `${year}-${String(month).padStart(2, '0')}-01`;
//     const endDay = new Date(year, month, 0).getDate();
//     const end = `${year}-${String(month).padStart(2, '0')}-${endDay}`;
//     onChange({ startDate: start, endDate: end });
//   }, [year, month, onChange]);

//   return (
//     <div className="d-flex gap-3 align-items-center flex-wrap">
//       <div>
//         <CFormLabel className="mb-0 me-2">Year:</CFormLabel>
//         <CFormSelect
//           style={{ width: '140px' }}
//           value={year}
//           onChange={(e) => setYear(Number(e.target.value))}
//         >
//           {Array.from({ length: 11 }, (_, i) => currentYear - 5 + i).map((y) => (
//             <option key={y} value={y}>
//               {y}
//             </option>
//           ))}
//         </CFormSelect>
//       </div>

//       <div>
//         <CFormLabel className="mb-0 me-2">Month:</CFormLabel>
//         <CFormSelect
//           style={{ width: '160px' }}
//           value={month}
//           onChange={(e) => setMonth(Number(e.target.value))}
//         >
//           {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
//             <option key={m} value={m}>
//               {new Date(2000, m - 1, 1).toLocaleString('default', { month: 'long' })}
//             </option>
//           ))}
//         </CFormSelect>
//       </div>
//     </div>
//   );
// };

// const WeekSelector = ({ onChange }) => {
//   const today = new Date();
//   const currentYear = today.getFullYear();

//   const getWeekStartEnd = (year, week) => {
//     const jan1 = new Date(year, 0, 1);
//     const dayOfWeek = jan1.getDay() || 7;
//     const firstMonday = dayOfWeek === 1 ? jan1 : new Date(year, 0, 1 + (8 - dayOfWeek));
//     const start = new Date(firstMonday);
//     start.setDate(firstMonday.getDate() + (week - 1) * 7);
//     const end = new Date(start);
//     end.setDate(start.getDate() + 6);

//     return {
//       startDate: start.toISOString().slice(0, 10),
//       endDate: end.toISOString().slice(0, 10),
//     };
//   };

//   const [year, setYear] = useState(currentYear);
//   const [week, setWeek] = useState(1);

//   useEffect(() => {
//     onChange(getWeekStartEnd(year, week));
//   }, [year, week, onChange]);

//   return (
//     <div className="d-flex gap-3 align-items-center flex-wrap">
//       <div>
//         <CFormLabel className="mb-0 me-2">Year:</CFormLabel>
//         <CFormSelect
//           style={{ width: '140px' }}
//           value={year}
//           onChange={(e) => setYear(Number(e.target.value))}
//         >
//           {Array.from({ length: 5 }, (_, i) => currentYear - 2 + i).map((y) => (
//             <option key={y} value={y}>
//               {y}
//             </option>
//           ))}
//         </CFormSelect>
//       </div>

//       <div>
//         <CFormLabel className="mb-0 me-2">Week:</CFormLabel>
//         <CFormSelect
//           style={{ width: '100px' }}
//           value={week}
//           onChange={(e) => setWeek(Number(e.target.value))}
//         >
//           {Array.from({ length: 53 }, (_, i) => i + 1).map((w) => (
//             <option key={w} value={w}>
//               {w}
//             </option>
//           ))}
//         </CFormSelect>
//       </div>
//     </div>
//   );
// };

// const CustomDateSelector = ({ onChange }) => {
//   const [start, setStart] = useState('');
//   const [end, setEnd] = useState('');

//   useEffect(() => {
//     if (start && end && start <= end) {
//       onChange({ startDate: start, endDate: end });
//     }
//   }, [start, end, onChange]);

//   return (
//     <div className="d-flex gap-3 align-items-center flex-wrap">
//       <div>
//         <CFormLabel className="mb-0 me-2">From:</CFormLabel>
//         <CFormInput
//           type="date"
//           value={start}
//           onChange={(e) => setStart(e.target.value)}
//         />
//       </div>
//       <div>
//         <CFormLabel className="mb-0 me-2">To:</CFormLabel>
//         <CFormInput
//           type="date"
//           value={end}
//           onChange={(e) => setEnd(e.target.value)}
//         />
//       </div>
//     </div>
//   );
// };

// // ────────────────────────────────────────────────
// // Main Dashboard Component
// // ────────────────────────────────────────────────

// const Dashboard = () => {
//   const { t } = useTranslation();
//   const { showToast } = useToast();
//   const userData = getUserData();
//   const mode = userData?.company_info?.appMode ?? 'advance';

//   const [activeTab, setActiveTab] = useState('Month');
//   const [selectedRange, setSelectedRange] = useState({
//     startDate: '2026-01-01',
//     endDate: '2026-01-31',
//   });

//   // Project filters
//   const [projects, setProjects] = useState([]);
//   const [projectTypes, setProjectTypes] = useState([]);
//   const [selectedProjectType, setSelectedProjectType] = useState('');
//   const [selectedProject, setSelectedProject] = useState('');

//   const [reportData, setReportData] = useState({
//     labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
//     monthlySales: Array(12).fill(0),
//     monthlyTax: Array(12).fill(0),
//     monthlyExpense: Array(12).fill(0),
//     monthlyPandL: Array(12).fill(0),
//     totals: { totalSales: 0, totalTax: 0, totalExpenses: 0, totalPL: 0 },
//   });

//   const [loading, setLoading] = useState(false);

//   // Load project types & projects once
//   useEffect(() => {
//     const fetchFilters = async () => {
//       try {
//         const [projectsRes, typesRes] = await Promise.all([
//           getAPICall('/api/projects'),
//           getAPICall('/api/project-types'),
//         ]);

//         if (Array.isArray(projectsRes)) {
//           setProjects(
//             projectsRes.map((p) => ({
//               value: p.id,
//               label: p.project_name,
//               typeId: p.project_type_id,
//             }))
//           );
//         }

//         if (Array.isArray(typesRes)) {
//           setProjectTypes(typesRes);
//         }
//       } catch (err) {
//         console.error('Error loading project filters:', err);
//         showToast('danger', 'Failed to load project filters');
//       }
//     };

//     if (mode === 'advance') {
//       fetchFilters();
//     }
//   }, [mode, showToast]);

//   const fetchFinancialSummary = async () => {
//     if (mode !== 'advance') return;
//     if (!selectedRange.startDate || !selectedRange.endDate) return;

//     setLoading(true);

//     try {
//       const params = new URLSearchParams({
//         startDate: selectedRange.startDate,
//         endDate: selectedRange.endDate,
//       });

//       if (selectedProjectType) {
//         params.append('project_type_id', selectedProjectType);
//       }
//       if (selectedProject) {
//         params.append('projectId', selectedProject);
//       }

//       const url = `/api/monthlyIncomeSummaries?${params.toString()}`;
//       const response = await getAPICall(url);

//       if (response?.success !== false) {
//         setReportData({
//           labels: response.labels || reportData.labels,
//           monthlySales: response.monthlySales?.map(Number) ?? Array(12).fill(0),
//           monthlyTax: response.monthlyTax?.map(Number) ?? Array(12).fill(0),
//           monthlyExpense: response.monthlyExpense?.map(Number) ?? Array(12).fill(0),
//           monthlyPandL: response.monthlyPandL?.map(Number) ?? Array(12).fill(0),
//           totals: response.totals || reportData.totals,
//         });
//       } else {
//         showToast('warning', response?.message || 'No data returned');
//       }
//     } catch (err) {
//       console.error('Financial summary fetch error:', err);
//       showToast('danger', 'Failed to load financial summary');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Re-fetch when any relevant value changes
//   useEffect(() => {
//     fetchFinancialSummary();
//   }, [
//     activeTab,
//     selectedRange.startDate,
//     selectedRange.endDate,
//     selectedProjectType,
//     selectedProject,
//   ]);

//   const handleProjectTypeChange = (value) => {
//     setSelectedProjectType(value);
//     setSelectedProject(''); // Reset project selection when type changes
//   };

//   const renderPeriodSelector = () => {
//     switch (activeTab) {
//       case 'Year':
//         return <YearSelector onChange={setSelectedRange} />;
//       case 'Quarter':
//         return <QuarterSelector onChange={setSelectedRange} />;
//       case 'Month':
//         return <MonthSelector onChange={setSelectedRange} />;
//       case 'Week':
//         return <WeekSelector onChange={setSelectedRange} />;
//       case 'Custom':
//         return <CustomDateSelector onChange={setSelectedRange} />;
//       default:
//         return null;
//     }
//   };

//   return (
//     <>
//       {mode === 'advance' && (
//         <div className="mb-4">
//           {/* Tabs + Period Selector + Filters */}
//           <div className="d-flex flex-column gap-3 mb-4">
//             <CTabs activeItemKey={activeTab} onChange={setActiveTab}>
//               <CTabList variant="tabs">
//                 <CTab itemKey="Year">Year</CTab>
//                 <CTab itemKey="Quarter">Quarter</CTab>
//                 <CTab itemKey="Month">Month</CTab>
//                 <CTab itemKey="Week">Week</CTab>
//                 <CTab itemKey="Custom">Custom</CTab>
//               </CTabList>
//             </CTabs>

//             <div className="d-flex flex-wrap gap-3 align-items-end">
//               <div className="flex-grow-1" style={{ minWidth: '220px' }}>
//                 {renderPeriodSelector()}
//               </div>

//               <div style={{ minWidth: '220px' }}>
//                 <CFormLabel className="mb-1 small">Project Type</CFormLabel>
//                 <CFormSelect
//                   value={selectedProjectType}
//                   onChange={(e) => handleProjectTypeChange(e.target.value)}
//                 >
//                   <option value="">All Project Types</option>
//                   {projectTypes.map((pt) => (
//                     <option key={pt.id} value={pt.id}>
//                       {pt.name}
//                     </option>
//                   ))}
//                 </CFormSelect>
//               </div>

//               <div style={{ minWidth: '220px' }}>
//                 <CFormLabel className="mb-1 small">Project</CFormLabel>
//                 <CFormSelect
//                   value={selectedProject}
//                   onChange={(e) => setSelectedProject(e.target.value)}
//                   disabled={!selectedProjectType}
//                 >
//                   <option value="">All Projects</option>
//                   {projects
//                     .filter((p) => !selectedProjectType || p.typeId === Number(selectedProjectType))
//                     .map((project) => (
//                       <option key={project.value} value={project.value}>
//                         {project.label}
//                       </option>
//                     ))}
//                 </CFormSelect>
//               </div>
//             </div>
//           </div>

//           {loading ? (
//             <div className="text-center py-5">
//               <CSpinner color="primary" />
//               <div className="mt-2 text-body-secondary">Loading financial data...</div>
//             </div>
//           ) : (
//             <>
//               <WidgetsDropdown
//                 className="mb-4"
//                 reportMonth={reportData}
//                 activeFilter={activeTab.toLowerCase()}
//                 selectedRangeTotals={reportData.totals}
//               />

//               <CCard className="mb-4">
//                 <CCardBody>
//                   <CRow className="mb-3">
//                     <CCol>
//                       <h5 className="card-title mb-1">Profit & Loss Overview</h5>
//                       <div className="small text-body-secondary">
//                         {selectedRange.startDate} → {selectedRange.endDate}
//                         {selectedProjectType &&
//                           ` • Type: ${projectTypes.find((t) => t.id === Number(selectedProjectType))?.name || '?'}`}
//                         {selectedProject &&
//                           ` • Project: ${projects.find((p) => p.value === selectedProject)?.label || '?'}`}
//                       </div>
//                     </CCol>
//                   </CRow>

//                   <MainChart
//                     monthlyPandL={reportData.monthlyPandL}
//                     monthlySales={reportData.monthlySales}
//                     monthlyExpense={reportData.monthlyExpense}
//                   />
//                 </CCardBody>
//               </CCard>
//             </>
//           )}
//         </div>
//       )}

//       {/* If you want to show something when not in advance mode */}
//       {mode !== 'advance' && (
//         <div className="text-center py-5">
//           <p>Financial dashboard is only available in Advance mode.</p>
//         </div>
//       )}
//     </>
//   );
// };

// export default Dashboard;





















// import React, { useEffect, useState } from 'react';
// import {
//   CCard,
//   CCardBody,
//   CCol,
//   CRow,
//   CTabs,
//   CTabList,
//   CTabContent,
//   CTab,
//   CFormLabel,
//   CFormInput,
//   CFormSelect,
//   CSpinner,
// } from '@coreui/react';
// import WidgetsDropdown from '../widgets/WidgetsDropdown';
// import MainChart from './MainChart';
// import { getAPICall } from '../../util/api';
// import { getUserData } from '../../util/session';
// import { useToast } from '../common/toast/ToastContext';
// import { useTranslation } from 'react-i18next';


// // ────────────────────────────────────────────────
// // Period selector components
// // ────────────────────────────────────────────────

// const YearSelector = ({ onChange }) => {
//   const currentYear = new Date().getFullYear();
//   const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

//   return (
//     <div className="d-flex align-items-center">
//       <CFormLabel className="mb-0 me-2 text-nowrap">Year:</CFormLabel>
//       <CFormSelect
//         style={{ width: '120px' }}
//         onChange={(e) => {
//           const year = Number(e.target.value);
//           onChange({
//             startDate: `${year}-01-01`,
//             endDate: `${year}-12-31`,
//           });
//         }}
//         defaultValue={currentYear}
//       >
//         {years.map((y) => (
//           <option key={y} value={y}>
//             {y}
//           </option>
//         ))}
//       </CFormSelect>
//     </div>
//   );
// };

// const QuarterSelector = ({ onChange }) => {
//   const currentYear = new Date().getFullYear();
//   const currentQuarter = Math.ceil((new Date().getMonth() + 1) / 3);

//   const quarters = [
//     { label: 'Q1 (Jan–Mar)', value: 1 },
//     { label: 'Q2 (Apr–Jun)', value: 2 },
//     { label: 'Q3 (Jul–Sep)', value: 3 },
//     { label: 'Q4 (Oct–Dec)', value: 4 },
//   ];

//   const [year, setYear] = useState(currentYear);
//   const [q, setQ] = useState(currentQuarter);

//   useEffect(() => {
//     const m = (q - 1) * 3 + 1;
//     const start = `${year}-${String(m).padStart(2, '0')}-01`;
//     const endMonth = m + 2;
//     const endDay = new Date(year, endMonth, 0).getDate();
//     const end = `${year}-${String(endMonth).padStart(2, '0')}-${endDay}`;
//     onChange({ startDate: start, endDate: end });
//   }, [year, q, onChange]);

//   return (
//     <div className="d-flex align-items-center gap-3">
//       <div className="d-flex align-items-center">
//         <CFormLabel className="mb-0 me-2 text-nowrap">Year:</CFormLabel>
//         <CFormSelect
//           style={{ width: '120px' }}
//           value={year}
//           onChange={(e) => setYear(Number(e.target.value))}
//         >
//           {Array.from({ length: 11 }, (_, i) => currentYear - 5 + i).map((y) => (
//             <option key={y} value={y}>
//               {y}
//             </option>
//           ))}
//         </CFormSelect>
//       </div>

//       <div className="d-flex align-items-center">
//         <CFormLabel className="mb-0 me-2 text-nowrap">Quarter:</CFormLabel>
//         <CFormSelect
//           style={{ width: '160px' }}
//           value={q}
//           onChange={(e) => setQ(Number(e.target.value))}
//         >
//           {quarters.map((qt) => (
//             <option key={qt.value} value={qt.value}>
//               {qt.label}
//             </option>
//           ))}
//         </CFormSelect>
//       </div>
//     </div>
//   );
// };

// const MonthSelector = ({ onChange }) => {
//   const currentYear = new Date().getFullYear();
//   const currentMonth = new Date().getMonth() + 1;

//   const [year, setYear] = useState(currentYear);
//   const [month, setMonth] = useState(currentMonth);

//   useEffect(() => {
//     const start = `${year}-${String(month).padStart(2, '0')}-01`;
//     const endDay = new Date(year, month, 0).getDate();
//     const end = `${year}-${String(month).padStart(2, '0')}-${endDay}`;
//     onChange({ startDate: start, endDate: end });
//   }, [year, month, onChange]);

//   return (
//     <div className="d-flex align-items-center gap-3">
//       <div className="d-flex align-items-center">
//         <CFormLabel className="mb-0 me-2 text-nowrap">Year:</CFormLabel>
//         <CFormSelect
//           style={{ width: '120px' }}
//           value={year}
//           onChange={(e) => setYear(Number(e.target.value))}
//         >
//           {Array.from({ length: 11 }, (_, i) => currentYear - 5 + i).map((y) => (
//             <option key={y} value={y}>
//               {y}
//             </option>
//           ))}
//         </CFormSelect>
//       </div>

//       <div className="d-flex align-items-center">
//         <CFormLabel className="mb-0 me-2 text-nowrap">Month:</CFormLabel>
//         <CFormSelect
//           style={{ width: '140px' }}
//           value={month}
//           onChange={(e) => setMonth(Number(e.target.value))}
//         >
//           {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
//             <option key={m} value={m}>
//               {new Date(2000, m - 1, 1).toLocaleString('default', { month: 'long' })}
//             </option>
//           ))}
//         </CFormSelect>
//       </div>
//     </div>
//   );
// };

// const WeekSelector = ({ onChange }) => {
//   const today = new Date();
//   const currentYear = today.getFullYear();
//   const currentMonth = today.getMonth();

//   const [year, setYear] = useState(currentYear);
//   const [month, setMonth] = useState(currentMonth);
//   const [selectedWeek, setSelectedWeek] = useState(null);
//   const [showCalendar, setShowCalendar] = useState(false);

//   // Get all weeks in a month
//   const getWeeksInMonth = (year, month) => {
//     const weeks = [];
//     const firstDay = new Date(year, month, 1);
//     const lastDay = new Date(year, month + 1, 0);
    
//     let currentWeekStart = new Date(firstDay);
//     const dayOfWeek = currentWeekStart.getDay();
//     const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
//     currentWeekStart.setDate(currentWeekStart.getDate() + mondayOffset);

//     while (currentWeekStart <= lastDay) {
//       const weekEnd = new Date(currentWeekStart);
//       weekEnd.setDate(currentWeekStart.getDate() + 6);
      
//       weeks.push({
//         start: new Date(currentWeekStart),
//         end: new Date(weekEnd),
//         startDate: currentWeekStart.toISOString().slice(0, 10),
//         endDate: weekEnd.toISOString().slice(0, 10),
//       });
      
//       currentWeekStart.setDate(currentWeekStart.getDate() + 7);
//     }
    
//     return weeks;
//   };

//   const weeks = getWeeksInMonth(year, month);

//   // Get calendar days for the month
//   const getCalendarDays = () => {
//     const firstDay = new Date(year, month, 1);
//     const lastDay = new Date(year, month + 1, 0);
//     const prevMonthLastDay = new Date(year, month, 0);
    
//     const days = [];
//     const startDayOfWeek = firstDay.getDay();
//     const offset = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

//     // Previous month days
//     for (let i = offset - 1; i >= 0; i--) {
//       days.push({
//         date: prevMonthLastDay.getDate() - i,
//         isCurrentMonth: false,
//       });
//     }

//     // Current month days
//     for (let i = 1; i <= lastDay.getDate(); i++) {
//       days.push({
//         date: i,
//         isCurrentMonth: true,
//         fullDate: new Date(year, month, i),
//       });
//     }

//     // Next month days to complete the grid
//     const remainingDays = 42 - days.length;
//     for (let i = 1; i <= remainingDays; i++) {
//       days.push({
//         date: i,
//         isCurrentMonth: false,
//       });
//     }

//     return days;
//   };

//   const isDateInWeek = (date, week) => {
//     if (!date || !week) return false;
//     return date >= week.start && date <= week.end;
//   };

//   const handleWeekClick = (week) => {
//     setSelectedWeek(week);
//     onChange({ startDate: week.startDate, endDate: week.endDate });
//     setShowCalendar(false);
//   };

//   const handleMonthChange = (direction) => {
//     let newMonth = month + direction;
//     let newYear = year;
    
//     if (newMonth > 11) {
//       newMonth = 0;
//       newYear++;
//     } else if (newMonth < 0) {
//       newMonth = 11;
//       newYear--;
//     }
    
//     setMonth(newMonth);
//     setYear(newYear);
//     setSelectedWeek(null);
//   };

//   useEffect(() => {
//     if (weeks.length > 0 && !selectedWeek) {
//       const currentWeek = weeks.find(week => {
//         const now = new Date();
//         return now >= week.start && now <= week.end;
//       }) || weeks[0];
//       setSelectedWeek(currentWeek);
//       onChange({ startDate: currentWeek.startDate, endDate: currentWeek.endDate });
//     }
//   }, [weeks, month, year]);

//   const formatDateRange = (week) => {
//     if (!week) return '';
//     const start = week.start.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' });
//     const end = week.end.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' });
//     return `${start} to ${end}`;
//   };

//   const calendarDays = getCalendarDays();

//   return (
//     <div style={{ position: 'relative' }}>
//       <div 
//         className="d-flex align-items-center border rounded px-3 py-2 bg-white" 
//         style={{ cursor: 'pointer', minWidth: '280px' }}
//         onClick={() => setShowCalendar(!showCalendar)}
//       >
//         <span>{selectedWeek ? formatDateRange(selectedWeek) : 'Select week'}</span>
//       </div>

//       {showCalendar && (
//         <div 
//           className="border rounded bg-white shadow-lg mt-2" 
//           style={{ 
//             position: 'absolute', 
//             zIndex: 1000, 
//             width: '360px',
//             padding: '16px'
//           }}
//         >
//           {/* Month Navigation */}
//           <div className="d-flex justify-content-between align-items-center mb-3">
//             <button 
//               className="btn btn-sm btn-light"
//               onClick={(e) => { e.stopPropagation(); handleMonthChange(-1); }}
//             >
//               ‹
//             </button>
//             <span className="fw-semibold">
//               {new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
//             </span>
//             <button 
//               className="btn btn-sm btn-light"
//               onClick={(e) => { e.stopPropagation(); handleMonthChange(1); }}
//             >
//               ›
//             </button>
//           </div>

//           {/* Calendar Header */}
//           <div className="d-flex mb-2">
//             {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
//               <div key={day} className="text-center fw-semibold" style={{ width: '14.28%', fontSize: '12px' }}>
//                 {day}
//               </div>
//             ))}
//           </div>

//           {/* Calendar Grid */}
//           <div>
//             {Array.from({ length: 6 }).map((_, weekIndex) => {
//               const weekDays = calendarDays.slice(weekIndex * 7, (weekIndex + 1) * 7);
//               const currentWeek = weeks.find(w => 
//                 weekDays.some(day => day.isCurrentMonth && isDateInWeek(day.fullDate, w))
//               );
              
//               const isSelectedWeek = currentWeek && selectedWeek && 
//                 currentWeek.startDate === selectedWeek.startDate;

//               return (
//                 <div 
//                   key={weekIndex} 
//                   className="d-flex"
//                   style={{ 
//                     cursor: currentWeek ? 'pointer' : 'default',
//                     backgroundColor: isSelectedWeek ? '#ff8800' : 'transparent',
//                     borderRadius: '4px',
//                     margin: '2px 0'
//                   }}
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     if (currentWeek) handleWeekClick(currentWeek);
//                   }}
//                 >
//                   {weekDays.map((day, dayIndex) => (
//                     <div
//                       key={dayIndex}
//                       className="text-center py-1"
//                       style={{
//                         width: '14.28%',
//                         color: day.isCurrentMonth ? (isSelectedWeek ? '#fff' : '#000') : '#ccc',
//                         fontSize: '14px'
//                       }}
//                     >
//                       {day.date}
//                     </div>
//                   ))}
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// const CustomDateSelector = ({ onChange }) => {
//   const [start, setStart] = useState('');
//   const [end, setEnd] = useState('');

//   useEffect(() => {
//     if (start && end && start <= end) {
//       onChange({ startDate: start, endDate: end });
//     }
//   }, [start, end, onChange]);

//   return (
//     <div className="d-flex align-items-center gap-3">
//       <div className="d-flex align-items-center">
//         <CFormLabel className="mb-0 me-2 text-nowrap">From:</CFormLabel>
//         <CFormInput
//           type="date"
//           style={{ width: '160px' }}
//           value={start}
//           onChange={(e) => setStart(e.target.value)}
//         />
//       </div>
//       <div className="d-flex align-items-center">
//         <CFormLabel className="mb-0 me-2 text-nowrap">To:</CFormLabel>
//         <CFormInput
//           type="date"
//           style={{ width: '160px' }}
//           value={end}
//           onChange={(e) => setEnd(e.target.value)}
//         />
//       </div>
//     </div>
//   );
// };

// // ────────────────────────────────────────────────
// // Main Dashboard Component
// // ────────────────────────────────────────────────

// const Dashboard = () => {
//   const { t } = useTranslation();
//   const { showToast } = useToast();
//   const userData = getUserData();
//   const mode = userData?.company_info?.appMode ?? 'advance';

//   const [activeTab, setActiveTab] = useState('Month');
//   const [selectedRange, setSelectedRange] = useState({
//     startDate: '2026-01-01',
//     endDate: '2026-01-31',
//   });

//   // Project filters
//   const [projects, setProjects] = useState([]);
//   const [projectTypes, setProjectTypes] = useState([]);
//   const [selectedProjectType, setSelectedProjectType] = useState('');
//   const [selectedProject, setSelectedProject] = useState('');

//   const [reportData, setReportData] = useState({
//     labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
//     monthlySales: Array(12).fill(0),
//     monthlyTax: Array(12).fill(0),
//     monthlyExpense: Array(12).fill(0),
//     monthlyPandL: Array(12).fill(0),
//     totals: { totalSales: 0, totalTax: 0, totalExpenses: 0, totalPL: 0 },
//   });

//   const [loading, setLoading] = useState(false);

//   // Load project types & projects once
//   useEffect(() => {
//     const fetchFilters = async () => {
//       try {
//         const [projectsRes, typesRes] = await Promise.all([
//           getAPICall('/api/projects'),
//           getAPICall('/api/project-types'),
//         ]);

//         if (Array.isArray(projectsRes)) {
//           setProjects(
//             projectsRes.map((p) => ({
//               value: p.id,
//               label: p.project_name,
//               typeId: p.project_type_id,
//             }))
//           );
//         }

//         if (Array.isArray(typesRes)) {
//           setProjectTypes(typesRes);
//         }
//       } catch (err) {
//         console.error('Error loading project filters:', err);
//         showToast('danger', 'Failed to load project filters');
//       }
//     };

//     if (mode === 'advance') {
//       fetchFilters();
//     }
//   }, [mode]);

//   const fetchFinancialSummary = async () => {
//     if (mode !== 'advance') return;
//     if (!selectedRange.startDate || !selectedRange.endDate) return;

//     setLoading(true);

//     try {
//       const params = new URLSearchParams({
//         startDate: selectedRange.startDate,
//         endDate: selectedRange.endDate,
//       });

//       if (selectedProjectType) {
//         params.append('project_type_id', selectedProjectType);
//       }
//       if (selectedProject) {
//         params.append('projectId', selectedProject);
//       }

//       const url = `/api/monthlyIncomeSummaries?${params.toString()}`;
//       const response = await getAPICall(url);

//       if (response?.success !== false) {
//         setReportData({
//           labels: response.labels || reportData.labels,
//           monthlySales: response.monthlySales?.map(Number) ?? Array(12).fill(0),
//           monthlyTax: response.monthlyTax?.map(Number) ?? Array(12).fill(0),
//           monthlyExpense: response.monthlyExpense?.map(Number) ?? Array(12).fill(0),
//           monthlyPandL: response.monthlyPandL?.map(Number) ?? Array(12).fill(0),
//           totals: response.totals || reportData.totals,
//         });
//       } else {
//         showToast('warning', response?.message || 'No data returned');
//       }
//     } catch (err) {
//       console.error('Financial summary fetch error:', err);
//       showToast('danger', 'Failed to load financial summary');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Re-fetch when any relevant value changes
//   useEffect(() => {
//     fetchFinancialSummary();
//   }, [
//     activeTab,
//     selectedRange.startDate,
//     selectedRange.endDate,
//     selectedProjectType,
//     selectedProject,
//   ]);

//   const handleProjectTypeChange = (value) => {
//     setSelectedProjectType(value);
//     setSelectedProject(''); // Reset project selection when type changes
//   };

//   const renderPeriodSelector = () => {
//     switch (activeTab) {
//       case 'Year':
//         return <YearSelector onChange={setSelectedRange} />;
//       case 'Quarter':
//         return <QuarterSelector onChange={setSelectedRange} />;
//       case 'Month':
//         return <MonthSelector onChange={setSelectedRange} />;
//       case 'Week':
//         return <WeekSelector onChange={setSelectedRange} />;
//       case 'Custom':
//         return <CustomDateSelector onChange={setSelectedRange} />;
//       default:
//         return null;
//     }
//   };

//   return (
//     <>
//       {mode === 'advance' && (
//         <div className="mb-4">
//           {/* Tabs */}
//           <div className="mb-3">
//             <CTabs activeItemKey={activeTab} onChange={setActiveTab}>
//               <CTabList variant="tabs">
//                 <CTab itemKey="Year">Year</CTab>
//                 <CTab itemKey="Quarter">Quarter</CTab>
//                 <CTab itemKey="Month">Month</CTab>
//                 <CTab itemKey="Week">Week</CTab>
//                 <CTab itemKey="Custom">Custom</CTab>
//               </CTabList>
//             </CTabs>
//           </div>

//           {/* Single row with all filters */}
//           <div className="d-flex align-items-center gap-3 mb-4 flex-wrap" style={{ padding: '12px', background: '#f8f9fa', borderRadius: '8px' }}>
//             {/* Period Selector */}
//             <div className="d-flex align-items-center" style={{ minWidth: 'fit-content' }}>
//               {renderPeriodSelector()}
//             </div>

//             {/* Vertical divider */}
//             <div style={{ width: '1px', height: '32px', background: '#dee2e6', margin: '0 8px' }}></div>

//             {/* Project Type Filter */}
//             <div className="d-flex align-items-center">
//               <CFormLabel className="mb-0 me-2 text-nowrap">Project Type:</CFormLabel>
//               <CFormSelect
//                 style={{ width: '180px' }}
//                 value={selectedProjectType}
//                 onChange={(e) => handleProjectTypeChange(e.target.value)}
//               >
//                 <option value="">All Types</option>
//                 {projectTypes.map((pt) => (
//                   <option key={pt.id} value={pt.id}>
//                     {pt.name}
//                   </option>
//                 ))}
//               </CFormSelect>
//             </div>

//             {/* Project Filter */}
//             <div className="d-flex align-items-center">
//               <CFormLabel className="mb-0 me-2 text-nowrap">Project:</CFormLabel>
//               <CFormSelect
//                 style={{ width: '200px' }}
//                 value={selectedProject}
//                 onChange={(e) => setSelectedProject(e.target.value)}
//                 disabled={!selectedProjectType}
//               >
//                 <option value="">All Projects</option>
//                 {projects
//                   .filter((p) => !selectedProjectType || p.typeId === Number(selectedProjectType))
//                   .map((project) => (
//                     <option key={project.value} value={project.value}>
//                       {project.label}
//                     </option>
//                   ))}
//               </CFormSelect>
//             </div>
//           </div>

//           {loading ? (
//             <div className="text-center py-5">
//               <CSpinner color="primary" />
//               <div className="mt-2 text-body-secondary">Loading financial data...</div>
//             </div>
//           ) : (
//             <>
//               <WidgetsDropdown
//                 className="mb-4"
//                 reportMonth={reportData}
//                 activeFilter={activeTab.toLowerCase()}
//                 selectedRangeTotals={reportData.totals}
//               />

//               <CCard className="mb-4">
//                 <CCardBody>
//                   <CRow className="mb-3">
//                     <CCol>
//                       <h5 className="card-title mb-1">Profit & Loss Overview</h5>
//                       <div className="small text-body-secondary">
//                         {selectedRange.startDate} → {selectedRange.endDate}
//                         {selectedProjectType &&
//                           ` • Type: ${projectTypes.find((t) => t.id === Number(selectedProjectType))?.name || '?'}`}
//                         {selectedProject &&
//                           ` • Project: ${projects.find((p) => p.value === selectedProject)?.label || '?'}`}
//                       </div>
//                     </CCol>
//                   </CRow>

//                   <MainChart
//                     monthlyPandL={reportData.monthlyPandL}
//                     monthlySales={reportData.monthlySales}
//                     monthlyExpense={reportData.monthlyExpense}
//                   />
//                 </CCardBody>
//               </CCard>
//             </>
//           )}
//         </div>
//       )}

//       {/* If you want to show something when not in advance mode */}
//       {mode !== 'advance' && (
//         <div className="text-center py-5">
//           <p>Financial dashboard is only available in Advance mode.</p>
//         </div>
//       )}
//     </>
//   );
// };

// export default Dashboard;













import React, { useEffect, useState } from 'react';
import {
  CCard,
  CCardBody,
  CCol,
  CRow,
  CTabs,
  CTabList,
  CTabContent,
  CTab,
  CFormLabel,
  CFormInput,
  CFormSelect,
  CSpinner,
} from '@coreui/react';

import WidgetsDropdown from '../widgets/WidgetsDropdown';
import MainChart from './MainChart';
import { getAPICall } from '../../util/api';
import { getUserData } from '../../util/session';
import { useToast } from '../common/toast/ToastContext';
import { useTranslation } from 'react-i18next';

// ────────────────────────────────────────────────
// Selector Components (all use onChange prop)
// ────────────────────────────────────────────────

const YearSelector = ({ onChange }) => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const initialFY = currentMonth <= 3 ? currentYear - 1 : currentYear;

  const [year, setYear] = useState(initialFY);

  useEffect(() => {
    onChange({
      startDate: `${year}-04-01`,
      endDate: `${year + 1}-03-31`,
    });
  }, [year, onChange]);

  return (
    <div className="d-flex align-items-center">
      <CFormLabel className="me-2">Financial Year:</CFormLabel>
      <CFormSelect
        style={{ width: 160 }}
        value={year}
        onChange={(e) => setYear(Number(e.target.value))}
      >
        {Array.from({ length: 8 }, (_, i) => 2023 + i).map((y) => (
          <option key={y} value={y}>
            {y}–{(y + 1).toString().slice(-2)}
          </option>
        ))}
      </CFormSelect>
    </div>
  );
};

const QuarterSelector = ({ onChange }) => {
  const today = new Date();
  const cy = today.getFullYear();
  const cm = today.getMonth() + 1;
  const initialYear = cm <= 3 ? cy - 1 : cy;
  const initialQ =
    cm >= 4 && cm <= 6 ? '1' :
    cm >= 7 && cm <= 9 ? '2' :
    cm >= 10 ? '3' : '4';

  const [year, setYear] = useState(initialYear);
  const [quarter, setQuarter] = useState(initialQ);

  useEffect(() => {
    const y = Number(year);
    let start, end;
    switch (quarter) {
      case '1':
        start = `${y}-04-01`;
        end = `${y}-06-30`;
        break;
      case '2':
        start = `${y}-07-01`;
        end = `${y}-09-30`;
        break;
      case '3':
        start = `${y}-10-01`;
        end = `${y}-12-31`;
        break;
      case '4':
        start = `${y + 1}-01-01`;
        end = `${y + 1}-03-31`;
        break;
      default:
        start = `${y}-04-01`;
        end = `${y}-06-30`;
    }
    onChange({ startDate: start, endDate: end });
  }, [year, quarter, onChange]);

  return (
    <div className="d-flex gap-3">
      <div className="d-flex align-items-center">
        <CFormLabel className="me-2">Fin. Year:</CFormLabel>
        <CFormSelect
          style={{ width: 160 }}
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
        >
          {Array.from({ length: 8 }, (_, i) => 2023 + i).map((y) => (
            <option key={y} value={y}>
              {y}–{(y + 1).toString().slice(-2)}
            </option>
          ))}
        </CFormSelect>
      </div>

      <div className="d-flex align-items-center">
        <CFormLabel className="me-2">Quarter:</CFormLabel>
        <CFormSelect
          style={{ width: 180 }}
          value={quarter}
          onChange={(e) => setQuarter(e.target.value)}
        >
          <option value="1">Q1 (Apr–Jun)</option>
          <option value="2">Q2 (Jul–Sep)</option>
          <option value="3">Q3 (Oct–Dec)</option>
          <option value="4">Q4 (Jan–Mar)</option>
        </CFormSelect>
      </div>
    </div>
  );
};

const MonthSelector = ({ onChange }) => {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);

  const getLastDay = (y, m) => new Date(y, m, 0).getDate();

  useEffect(() => {
    const last = getLastDay(year, month);
    onChange({
      startDate: `${year}-${String(month).padStart(2, '0')}-01`,
      endDate: `${year}-${String(month).padStart(2, '0')}-${last}`,
    });
  }, [year, month, onChange]);

  return (
    <div className="d-flex gap-3">
      <div className="d-flex align-items-center">
        <CFormLabel className="me-2">Year:</CFormLabel>
        <CFormSelect
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
        >
          {Array.from({ length: 10 }, (_, i) => today.getFullYear() - 5 + i).map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </CFormSelect>
      </div>

      <div className="d-flex align-items-center">
        <CFormLabel className="me-2">Month:</CFormLabel>
        <CFormSelect
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <option key={m} value={m}>
              {new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}
            </option>
          ))}
        </CFormSelect>
      </div>
    </div>
  );
};

const WeekSelector = ({ onChange }) => {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);

  const getWeeksInMonth = (y, m) => {
    const weeks = [];
    const first = new Date(y, m, 1);
    const last = new Date(y, m + 1, 0);

    let start = new Date(first);
    const dow = start.getDay();
    const offset = dow === 0 ? -6 : 1 - dow;
    start.setDate(start.getDate() + offset);

    while (start <= last) {
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      weeks.push({
        start,
        end,
        startDate: start.toISOString().slice(0, 10),
        endDate: end.toISOString().slice(0, 10),
      });
      start = new Date(start);
      start.setDate(start.getDate() + 7);
    }
    return weeks;
  };

  const weeks = getWeeksInMonth(year, month);

  useEffect(() => {
    if (weeks.length > 0 && !selectedWeek) {
      const now = new Date();
      const current = weeks.find(w => now >= w.start && now <= w.end) || weeks[0];
      setSelectedWeek(current);
      onChange({ startDate: current.startDate, endDate: current.endDate });
    }
  }, [weeks, onChange]);

  const handleWeekSelect = (week) => {
    setSelectedWeek(week);
    onChange({ startDate: week.startDate, endDate: week.endDate });
    setShowCalendar(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <div
        className="border rounded px-3 py-2 bg-white"
        style={{ cursor: 'pointer', minWidth: '280px' }}
        onClick={() => setShowCalendar(!showCalendar)}
      >
        {selectedWeek
          ? `${selectedWeek.start.toLocaleDateString()} – ${selectedWeek.end.toLocaleDateString()}`
          : 'Select Week'}
      </div>

      {showCalendar && (
        <div
          className="border rounded bg-white shadow mt-2 p-3"
          style={{ position: 'absolute', zIndex: 1000, width: 360 }}
        >
          {/* Simple month/year selector + week list */}
          <div className="d-flex gap-2 mb-3">
            <CFormSelect value={month} onChange={e => setMonth(Number(e.target.value))}>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={i}>
                  {new Date(year, i).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </CFormSelect>
            <CFormSelect value={year} onChange={e => setYear(Number(e.target.value))}>
              {Array.from({ length: 10 }, (_, i) => today.getFullYear() - 5 + i).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </CFormSelect>
          </div>

          <div>
            {weeks.map((w, i) => (
              <div
                key={i}
                className="p-2 border-bottom"
                style={{ cursor: 'pointer', background: selectedWeek === w ? '#e0f7fa' : '' }}
                onClick={() => handleWeekSelect(w)}
              >
                {w.start.toLocaleDateString()} – {w.end.toLocaleDateString()}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const CustomDateSelector = ({ onChange }) => {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  useEffect(() => {
    if (start && end && start <= end) {
      onChange({ startDate: start, endDate: end });
    }
  }, [start, end, onChange]);

  return (
    <div className="d-flex gap-3">
      <div className="d-flex align-items-center">
        <CFormLabel className="me-2">From:</CFormLabel>
        <CFormInput
          type="date"
          value={start}
          onChange={(e) => setStart(e.target.value)}
        />
      </div>
      <div className="d-flex align-items-center">
        <CFormLabel className="me-2">To:</CFormLabel>
        <CFormInput
          type="date"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
        />
      </div>
    </div>
  );
};

// ────────────────────────────────────────────────
// Main Dashboard Component
// ────────────────────────────────────────────────

const Dashboard = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const user = getUserData();
  const mode = user?.company_info?.appMode || 'advance';

  const [activeTab, setActiveTab] = useState('Month');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

  const [projects, setProjects] = useState([]);
  const [projectTypes, setProjectTypes] = useState([]);

  const [projectType, setProjectType] = useState('');
  const [project, setProject] = useState('');

  const [loading, setLoading] = useState(false);

  const [reportData, setReportData] = useState({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    monthlySales: Array(12).fill(0),
    monthlyTax: Array(12).fill(0),
    monthlyExpense: Array(12).fill(0),
    monthlyPandL: Array(12).fill(0),
    totals: { totalSales: 0, totalTax: 0, totalExpenses: 0, totalPL: 0 },
  });

  // Load project & type filters
  useEffect(() => {
    if (mode !== 'advance') return;

    const load = async () => {
      try {
        const [p, t] = await Promise.all([
          getAPICall('/api/projects'),
          getAPICall('/api/project-types'),
        ]);

        setProjects(
          p?.map((x) => ({
            value: x.id,
            label: x.project_name,
            typeId: x.project_type_id,
          })) || []
        );

        setProjectTypes(t || []);
      } catch {
        showToast('danger', 'Failed to load filters');
      }
    };

    load();
  }, [mode]);

  // Fetch financial summary
  const fetchSummary = async () => {
    if (!dateRange.startDate || !dateRange.endDate) return;

    setLoading(true);

    try {
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });

      if (projectType) params.append('project_type_id', projectType);
      if (project) params.append('projectId', project);

      const resp = await getAPICall(`/api/monthlyIncomeSummaries?${params}`);

      if (resp?.success === false) {
        showToast('warning', resp.message || 'No data');
        return;
      }

      setReportData({
        labels: reportData.labels,
        monthlySales: resp.monthlySales?.map(Number) || Array(12).fill(0),
        monthlyTax: resp.monthlyTax?.map(Number) || Array(12).fill(0),
        monthlyExpense: resp.monthlyExpense?.map(Number) || Array(12).fill(0),
        monthlyPandL: resp.monthlyPandL?.map(Number) || Array(12).fill(0),
        totals: resp.totals || reportData.totals,
      });
    } catch (err) {
      console.error(err);
      showToast('danger', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [dateRange, projectType, project, activeTab]);

  const handleProjectTypeChange = (value) => {
    setProjectType(value);
    setProject('');
  };

  const renderSelector = () => {
    switch (activeTab) {
      case 'Year':
        return <YearSelector onChange={setDateRange} />;
      case 'Quarter':
        return <QuarterSelector onChange={setDateRange} />;
      case 'Month':
        return <MonthSelector onChange={setDateRange} />;
      case 'Week':
        return <WeekSelector onChange={setDateRange} />;
      case 'Custom':
        return <CustomDateSelector onChange={setDateRange} />;
      default:
        return null;
    }
  };

  if (mode !== 'advance') {
    return <div className="text-center py-5">Dashboard only for Advance Mode</div>;
  }

  return (
    <div className="mb-4">
      {/* Tabs */}
      <CTabs activeItemKey={activeTab} onChange={setActiveTab}>
        <CTabList variant="tabs">
          <CTab itemKey="Year">Year</CTab>
          <CTab itemKey="Quarter">Quarter</CTab>
          <CTab itemKey="Month">Month</CTab>
          <CTab itemKey="Week">Week</CTab>
          <CTab itemKey="Custom">Custom</CTab>
        </CTabList>
      </CTabs>

      {/* Filters Row */}
      <div className="d-flex flex-wrap gap-3 p-3 bg-light rounded mb-4">
        {renderSelector()}

        <div className="d-flex align-items-center">
          <CFormLabel className="me-2">Project Type:</CFormLabel>
          <CFormSelect
            value={projectType}
            onChange={(e) => handleProjectTypeChange(e.target.value)}
          >
            <option value="">All</option>
            {projectTypes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} 
              </option>
            ))}
          </CFormSelect>
        </div>

        <div className="d-flex align-items-center">
          <CFormLabel className="me-2">Project:</CFormLabel>
          <CFormSelect
            value={project}
            disabled={!projectType}
            onChange={(e) => setProject(e.target.value)}
          >
            <option value="">All</option>
            {projects
              .filter((p) => !projectType || p.typeId === Number(projectType))
              .map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label} 
                </option>
              ))}
          </CFormSelect>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-5">
          <CSpinner />
          <div>Loading...</div>
        </div>
      ) : (
        <>
          <WidgetsDropdown
            className="mb-4"
            reportMonth={reportData}
            activeFilter={activeTab.toLowerCase()}
            selectedRangeTotals={reportData.totals}
          />

          <CCard>
            <CCardBody>
              <CRow className="mb-3">
                <CCol>
                  <h5>Profit & Loss Overview</h5>
                  <small className="text-muted">
                    {dateRange.startDate || '—'} → {dateRange.endDate || '—'}
                  </small>
                </CCol>
              </CRow>

              <MainChart
                monthlyPandL={reportData.monthlyPandL}
                monthlySales={reportData.monthlySales}
                monthlyExpense={reportData.monthlyExpense}
              />
            </CCardBody>
          </CCard>
        </>
      )}
    </div>
  );
};

export default Dashboard;
