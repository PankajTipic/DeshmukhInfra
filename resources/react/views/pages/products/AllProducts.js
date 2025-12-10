import React, { useEffect, useState, useMemo, useRef } from 'react';
import { 
  CBadge, 
  CButton, 
  CCol, 
  CRow, 
  CForm, 
  CFormCheck, 
  CFormInput, 
  CFormLabel,
  CCard,
  CCardBody,
  CCardHeader,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter
} from '@coreui/react';

import CIcon from '@coreui/icons-react';
import { cilPencil, cilCheck } from '@coreui/icons';

const useIsMobile = (breakpoint = 768) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < breakpoint);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return isMobile;
};

import { deleteAPICall, getAPICall, post, postFormData } from '../../../util/api';
import ConfirmationModal from '../../common/ConfirmationModal';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../common/toast/ToastContext';
import { useTranslation } from 'react-i18next';
import { getUserData } from '../../../util/session';
import { generateCompanyReceiptPDF } from '../company/companyPdf';
import { generateUpgradeReceiptPDF } from "./UpgradeReceipt";


const AllProducts = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const { showToast } = useToast();
  const { t, i18n } = useTranslation('global');
  const lng = i18n.language;
  const [products, setProducts] = useState([]);
  const [deleteProduct, setDeleteProduct] = useState();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
const [editingIndex, setEditingIndex] = useState(null);

const [upgradePreview, setUpgradePreview] = useState(null);
const [availablePlans, setAvailablePlans] = useState([]);
const [upgradeModalVisible, setUpgradeModalVisible] = useState(false);
const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
const [selectedPlan, setSelectedPlan] = useState(null);
const [showUpgradeConfirmModal, setShowUpgradeConfirmModal] = useState(false);


  const [searchTerm, setSearchTerm] = useState('');
  const [quantityModal, setQuantityModal] = useState({
  visible: false,
  product: null,
  addedQty: 0,
  maxAddable: 0, // Add this field
});

 const userRaw = localStorage.getItem("userData");
  if (!userRaw) return false;

  let userData;
  try {
    userData = JSON.parse(userRaw);
  } catch (e) {
    console.error("Failed to parse userData:", e);
    return false;
  }
const isRestrictedPlan = () => {
 

  const planName = userData?.user?.company_info?.subscribed_plan_name?.toLowerCase() || '';

  const restrictedPlans = [
    'monthly business essential (start-up) - credit report',
    'monthly business essential (start-up) - advanced booking',
    'annually business essential (start-up) - credit report',
    'annually business essential (start-up) - advanced booking',
    'half-yearly business essential (start-up) - credit report',
    'half-yearly business essential (start-up) - advanced booking',
    'quarterly business essential (start-up) - credit report',
    'quarterly business essential (start-up) - advanced booking',
  ];

  console.log(planName);

  return restrictedPlans.includes(planName);
};

const isGoldenGrowthPlan = () => {
  const planName = userData?.user?.company_info?.subscribed_plan_name?.trim() || '';
  return planName.includes('Golden Growth');
};

  // New Product Modal State
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

  // Bulk Upload Modal State
  const [bulkUploadModal, setBulkUploadModal] = useState({
    visible: false,
    csvFile: null,
    isUploading: false,
    message: '',
    isError: false,
  });

  const currentPlan = userData?.user?.company_info?.subscribed_plan_name?.toLowerCase() || '';
  const company_id = userData?.user?.company_id;
  const user_id = userData?.user?.id;
  const validtill_date = userData?.user?.company_info?.subscription_validity;

const isEssentialPlan = () => currentPlan.includes('essential');
const isElitePlan = () => currentPlan.includes('elite');

const [allPlans, setAllPlans] = useState([]);

const getAvailableUpgrades = () => {
  const user = JSON.parse(localStorage.getItem('userData'));
  const currentPlanName = user?.user?.company_info?.subscribed_plan_name?.toLowerCase() || '';

  const isMonthly = currentPlanName.includes('monthly');
  const isQuarterly = currentPlanName.includes('quarterly');
  const isHalfYearly = currentPlanName.includes('half-yearly');
  const isAnnually = currentPlanName.includes('annually');

  const isEssential = currentPlanName.includes('essential');
  const isGoldenGrowth = currentPlanName.includes('golden growth');

  if (isMonthly) {
    if (isEssential) {
      return allPlans.filter(
        (p) =>
          p.name.toLowerCase().includes('monthly golden growth') ||
          p.name.toLowerCase().includes('monthly elite')
      );
    }
    if (isGoldenGrowth) {
      return allPlans.filter((p) => p.name.toLowerCase().includes('monthly elite'));
    }
  }

  if (isQuarterly) {
    if (isEssential) {
      return allPlans.filter(
        (p) =>
          p.name.toLowerCase().includes('quarterly golden growth') ||
          p.name.toLowerCase().includes('quarterly elite')
      );
    }
    if (isGoldenGrowth) {
      return allPlans.filter((p) => p.name.toLowerCase().includes('quarterly elite'));
    }
  }

  if (isHalfYearly) {
    if (isEssential) {
      return allPlans.filter(
        (p) =>
          p.name.toLowerCase().includes('half-yearly golden growth') ||
          p.name.toLowerCase().includes('half-yearly elite')
      );
    }
    if (isGoldenGrowth) {
      return allPlans.filter((p) => p.name.toLowerCase().includes('half-yearly elite'));
    }
  }

  if (isAnnually) {
    if (isEssential) {
      return allPlans.filter(
        (p) =>
          p.name.toLowerCase().includes('annually golden growth') ||
          p.name.toLowerCase().includes('annually elite')
      );
    }
    if (isGoldenGrowth) {
      return allPlans.filter((p) => p.name.toLowerCase().includes('annually elite'));
    }
  }

  return [];
};


const handleUpgradePreview = async (plan) => {
  const res = await post('/api/upgrade-preview', {
    new_plan_id: plan.id,
  });

  if (res?.payable_amount !== undefined) {
    setSelectedPlan(plan);
    setUpgradePreview({
  ...res,
  current_plan: res.current_plan,
  current_plan_price: res.current_plan_price,
});
    setShowUpgradeConfirmModal(true);
  }
};



useEffect(() => {
  const fetchPlans = async () => {
    const res = await getAPICall('/api/detailsForCompany');
    if (res?.plans) {
      setAllPlans(res.plans);
    }
  };

  fetchPlans();
}, []);

  const [imageModal, setImageModal] = useState({ visible: false, product: null, media: [],description:'' });

const openImageModal = async (product) => {
  const media = await getAPICall(`/api/product/${product.id}/media`);
  setImageModal({ visible: true, product, media });
};

const deleteImage = async (id) => {
  await deleteAPICall(`/api/product/media/${id}`);
  openImageModal(imageModal.product); // Refresh
};

const shareAllOnWhatsApp = (media) => {
  if (!isElitePlan()) {
    setUpgradeModal({
      visible: true,
      plans: getAvailableUpgrades()
    });
    return;
  }

  const text = media
    .map((m, i) => `Image ${i + 1}: ${window.location.origin}/${m.url}`)
    .join('\n');
  const link = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(link, '_blank');
};
const [upgradeModal, setUpgradeModal] = useState({
  visible: false,
  plans: []
});






const shareOnWhatsApp = async (url) => {
  try {
    const response = await fetch(`/${url}`);
    const blob = await response.blob();
    const file = new File([blob], 'ProductImage.png', { type: 'image/png' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: 'Product Image',
        text: 'Check out this product image!',
        files: [file],
      });
    } else {
      alert('Your browser does not support sharing images via WhatsApp or system share.');
    }
  } catch (error) {
    console.error('Error sharing image:', error);
    alert('Failed to share image.');
  }
};


const getRemainingDays = (validTillDate) => {
  const today = new Date();
  const expiry = new Date(validTillDate);
  const diffTime = expiry - today;
  return Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 0);
};

const downloadInvoice = (url) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = 'invoice.pdf';
  link.click();
};

 const fetchProducts = async () => {
  try {
    const response = await getAPICall('/api/product');
    setProducts(response);
  } catch (error) {
    showToast('danger', t('MESSAGES.error_occurred', { error: error.message }));
  }
};

  
  useEffect(() => {
    fetchProducts();
  }, []);
  

  const filteredProducts = useMemo(() => {
  if (!searchTerm.trim()) return products;
  
  return products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.localName && product.localName.toLowerCase().includes(searchTerm.toLowerCase()))
  );
}, [products, searchTerm]);

  const handleDelete = (p) => {
    setDeleteProduct(p);
    setDeleteModalVisible(true);
  };

  const onDelete = async () => {
  try {
    await deleteAPICall(`/api/product/${deleteProduct.id}`);
    setDeleteModalVisible(false);
    fetchProducts();
    showToast('success', t('MESSAGES.product_deleted'));
  } catch (error) {
    showToast('danger', t('MESSAGES.error_occurred', { error: error.message }));
  }
};


  const handleEdit = (p) => {
    navigate(`/products/edit/${p.id}`);
  };

 const openQuantityModal = (product) => {
  const currentStock = product.sizes?.[0]?.stock || 0;
  const totalQuantity = product.sizes?.[0]?.qty || 0;
  const maxAddable = totalQuantity - currentStock;
  
  setQuantityModal({ 
    visible: true, 
    product, 
    addedQty: maxAddable > 0 ? 1 : 0,
    maxAddable 
  });
};

const [deadStockModal, setDeadStockModal] = useState({
  visible: false,
  product: null,
  qty: '',
  price: '',
});

const openDeadStockModal = (product) => {
  const stock = product.sizes?.[0]?.stock || 0;
  const price = product.sizes?.[0]?.oPrice || '';

  setDeadStockModal({
    visible: true,
    product,
    qty: '',
    price: price || '',
  });
};

const handleDeadStockSubmit = async () => {
  try {
    const payload = {
      product_id: deadStockModal.product.id,
      price: parseFloat(deadStockModal.price),
      quantity: parseInt(deadStockModal.qty),
    };
    const res = await post('/api/dead-stock', payload);
    showToast('success', res.message || t('MESSAGES.dead_stock_deducted'));
    setDeadStockModal({ visible: false, product: null, qty: '', price: 0 });
    fetchProducts();
  } catch (err) {
    showToast('danger', t('MESSAGES.dead_stock_failed', { error: err.response?.data?.message || '-' }));
  }
};



const updateQuantity = async () => {
  try {
    const productId = quantityModal.product.id;
    const sizeId = quantityModal.product.sizes[0].id;

    const payload = {
      size_id: sizeId,
      added_qty: Number(quantityModal.addedQty),
    };

    const response = await post(`/api/product/${productId}/update-quantity`, payload);

    if (response.success !== false) {
      showToast('success', t('MESSAGES.stock_updated_success'));
      setQuantityModal({ visible: false, product: null, addedQty: 0, maxAddable: 0 });
      fetchProducts();
    } else {
      showToast('danger', t('MESSAGES.update_stock_failed', { error: response.message || '-' }));
    }
  } catch (err) {
    const errorMessage = err.response?.data?.message || err.message || '-';
    showToast('danger', t('MESSAGES.update_stock_failed', { error: errorMessage }));
  }
};


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

  const oPriceValue = newProductModal.formData.oPrice;
  const oPrice = parseFloat(oPriceValue);
  if (isNaN(oPrice) || oPrice < 0) {
    showToast('danger', t('MESSAGES.invalid_selling_price'));
    return;
  }

  const qty = parseFloat(newProductModal.formData.qty) || 0;
  const stock = parseFloat(newProductModal.formData.stock) || 0;
  if (stock > qty) {
    showToast('danger', t('MESSAGES.stock_exceeds_capacity', { stock, qty }));
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

    if (resp && resp.id) {
      showToast('success', t('MESSAGES.product_added_success'));
      const imageResult = await uploadNewProductImages(resp.id);

      if (imageResult.success) {
        if (
          Array.isArray(newProductModal.images) &&
          newProductModal.images.filter(Boolean).length
        ) {
          showToast('success', t('MESSAGES.images_uploaded_success'));
        }
      } else {
        showToast('warning', t('MESSAGES.images_upload_failed'));
      }

      closeNewProductModal();
      fetchProducts();
    } else if (resp && resp.message) {
      showToast('danger', resp.message);
    } else {
      showToast('danger', t('MESSAGES.unexpected_response'));
    }
  } catch (error) {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      if (status === 422 && data.errors) {
        Object.entries(data.errors).forEach(([field, fieldErrors]) => {
          fieldErrors.forEach((msg) => {
            showToast('danger', t('MESSAGES.validation_error', { error: msg }));
          });
        });
      } else if (data.message) {
        showToast('danger', data.message);
      } else {
        showToast('danger', t('MESSAGES.unexpected_response'));
      }
    } else if (error.request) {
      showToast('danger', t('MESSAGES.network_error'));
    } else {
      showToast('danger', t('MESSAGES.unknown_error'));
    }
  }
};


const companyInfo = userData?.user?.company_info;

const previousPlan = {
  name: upgradePreview?.current_plan,
  price: upgradePreview?.current_plan_price,
  start_date: companyInfo?.subscribed_from || null,
  valid_till: companyInfo?.subscription_validity || null
};


const handleRazorpayPayment = async (selectedPlan, payableAmount) => {
  try {
    if (!selectedPlan || !payableAmount) {
      showToast("danger", "Missing plan or amount!");
      return;
    }

    const storedUser = JSON.parse(localStorage.getItem("userData"));
    const user = storedUser?.user;
    const companyInfo = user?.company_info;

    const user_id = user?.id;
    const company_id = user?.company_id;
    const validtill_date = companyInfo?.subscription_validity;

    if (!user_id || !company_id) {
      showToast("danger", "Company or user not found in localStorage.");
      return;
    }

    // Load Razorpay script
    if (!window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });
    }

    // Create Razorpay Order
    const orderRes = await post("/api/create-order", { amount: payableAmount });

    if (!orderRes?.order?.id) {
      showToast("danger", "Failed to create payment order.");
      return;
    }

    const options = {
      key: orderRes.key,
      amount: orderRes.order.amount,
      currency: orderRes.order.currency,
      order_id: orderRes.order.id,
      name: "Subscription Upgrade",
      description: selectedPlan.name,
      handler: async (response) => {
        try {
          const verifyRes = await post("/api/verify-payment", {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          if (verifyRes?.success) {
            // Save receipt in DB
            const receiptDataForDB = {
              company_id,
              plan_id: selectedPlan.id,
              user_id,
              total_amount: payableAmount,
              valid_till: validtill_date,
              transaction_id: response.razorpay_payment_id,
              transaction_status: "success",
              renewal_type: "upgrade",
            };

            await post("/api/company-receipt", receiptDataForDB);

            // Update plan
            await post("/api/company/update-plan", {
              company_id,
              plan_id: selectedPlan.id,
            });

            
const current_valid_till = companyInfo?.subscription_validity;

const newValidTill = current_valid_till;

            // Update localStorage
            const updatedUserData = { ...storedUser };
            if (updatedUserData?.user?.company_info) {
              updatedUserData.user.company_info.subscribed_plan = selectedPlan.id;
              updatedUserData.user.company_info.subscribed_plan_name = selectedPlan.name;
              localStorage.setItem("userData", JSON.stringify(updatedUserData));
            }

            
            // ✅ Prepare receipt data for PDF
            const receiptData = {
              company: {
                company_name: companyInfo?.company_name || "N/A",
                phone_no: user?.mobile || "N/A",
                email_id: user?.email || "N/A",
                land_mark: companyInfo?.land_mark || "",
                Tal: companyInfo?.Tal || "",
                Dist: companyInfo?.Dist || "",
                pincode: companyInfo?.pincode || "",
              },
              transaction_id: response.razorpay_payment_id,
              created_at: new Date().toISOString(),

              previous_plan: {
                name: previousPlan?.name || "Previous Plan",
                price: previousPlan?.price || 0,
                start_date: previousPlan?.start_date || null,
                valid_till: previousPlan?.valid_till || current_valid_till,
              },

              new_plan: {
                name: selectedPlan.name,
                price: (() => {
                  const isAnnually = selectedPlan.name.toLowerCase().includes('annually');
                  const rawPrice = isAnnually ? selectedPlan.price * 12 : selectedPlan.price;

                  // Round to nearest 0.2 (e.g., 0.20, 0.40, 0.60...)
                  return Math.round(rawPrice * 5) / 5;
                })(),
                start_date: new Date().toISOString(),
                valid_till: newValidTill,
              },


              total_amount: payableAmount,
              gst: 0,
              payable_amount: payableAmount,
            };

            // ✅ Generate receipt PDF
            generateUpgradeReceiptPDF(receiptData);

            showToast("success", "Plan upgraded successfully!");
            setShowUpgradeConfirmModal(false);

            setTimeout(() => {
              window.location.reload();
            }, 1000);
          } else {
            showToast("danger", "Payment verification failed.");
          }
        } catch (err) {
          console.error("Upgrade error:", err);
          showToast("danger", "Upgrade failed: " + err.message);
        }
      },
      prefill: {
        name: user?.name || selectedPlan.name,
        email: user?.email || "support@example.com",
        contact: user?.mobile || "",
      },
      theme: {
        color: "#4CAF50",
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();

    razorpay.on("payment.failed", async (response) => {
      console.error("Payment failed:", response.error);
      showToast("danger", "Payment failed. Please try again.");

      try {
        const failedData = {
          company_id,
          plan_id: selectedPlan.id,
          user_id,
          total_amount: payableAmount,
          valid_till: validtill_date,
          transaction_id: response.error?.metadata?.payment_id ?? "failed",
          transaction_status: response.error?.description ?? "Failed",
          renewal_type: "upgrade_failed",
        };
        await post("/api/company-receipt", failedData);
      } catch (err) {
        console.error("Failed receipt logging:", err);
      }
    });
  } catch (error) {
    console.error("handleRazorpayPayment error:", error);
    showToast("danger", "Something went wrong: " + error.message);
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
      message: t('MESSAGES.select_csv_file'),
      isError: true,
    }));
    return;
  }

  if (bulkUploadModal.csvFile.type !== "text/csv" && !bulkUploadModal.csvFile.name.endsWith(".csv")) {
    setBulkUploadModal(prev => ({
      ...prev,
      message: t('MESSAGES.invalid_csv_file'),
      isError: true,
    }));
    return;
  }

  const formData = new FormData();
  formData.append('csv_file', bulkUploadModal.csvFile);

  try {
    setBulkUploadModal(prev => ({ ...prev, isUploading: true }));

    const response = await postFormData('/api/uploadProducts', formData);

    const resMessage = response?.data?.message || response?.message;

    if (resMessage) {
      setBulkUploadModal(prev => ({
        ...prev,
        message: resMessage,
        isError: false,
        csvFile: null,
      }));
      showToast('success', t('MESSAGES.products_uploaded_success'));
      fetchProducts();
    } else {
      setBulkUploadModal(prev => ({
        ...prev,
        message: t('MESSAGES.upload_failed'),
        isError: true,
      }));
    }
  } catch (error) {
    const errMsg = error.response?.data?.error || '-';
    setBulkUploadModal(prev => ({
      ...prev,
      message: errMsg,
      isError: true,
    }));
    showToast('danger', t('MESSAGES.bulk_upload_failed', { error: errMsg }));
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


  const updateImageDescriptionLocally = (index, value) => {
  setImageModal(prev => {
    const updated = [...prev.media];
    updated[index].description = value;
    return { ...prev, media: updated };
  });
};

const saveDescriptionToServer = async (mediaId, description) => {
  try {
    await post(`/api/product/media/${mediaId}`, { description });
    showToast('success', 'Description updated');
  } catch (err) {
    showToast('danger', 'Failed to update description');
    console.error(err);
  }
};



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



  // Function to get stock status based on percentage of quantity
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

  // Stock Cell Component with Strobing Effect and Tooltip
  const StockCell = ({ stock, quantity }) => {
    const status = getStockStatus(stock, quantity);
    
    return (
      <div 
        style={{
          fontWeight: 'bold',
          fontSize: '14px',
          padding: '4px 8px',
          borderRadius: '4px',
          textAlign: 'center',
          animation: status.strobe ? 'stockStrobe 1.5s infinite' : 'none',
          backgroundColor: status.color === 'danger' ? '#dc3545' : 
                          status.color === 'warning' ? '#ffc107' : '#28a745',
          color: status.color === 'warning' ? '#000' : '#fff',
          cursor: 'help'
        }}
        title={`${status.description} (${status.percentage}% of total quantity)`}
      >
        {stock || 0}
        <style jsx>{`
          @keyframes stockStrobe {
            0%, 50% { opacity: 1; }
            25%, 75% { opacity: 0.3; }
          }
        `}</style>
      </div>
    );
  };

const renderMobileProductCard = (product) => {
  const stock = product.sizes?.[0]?.stock || 0;
  const qty = product.sizes?.[0]?.qty || 1;
  const price = product.sizes?.[0]?.oPrice || 0;
  const percentage = ((stock / qty) * 100).toFixed(1);
  const stockColor = percentage < 20 ? 'danger' : percentage <= 50 ? 'warning' : 'success';

  return (
    <CCard key={product.id} className="mb-3 border shadow-sm rounded mobile-product-card">
      <CCardBody>
        {/* Product Name, Price and Right Side Elements */}
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div>
            <div className="fw-semibold">
              {i18n.language === 'mr' ? product.localName || product.name : product.name}
            </div>
            <small className="text-muted">
              ₹{price?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </small>
          </div>

          {/* Right side - Stock Badge and Images Button */}
          <div className="d-flex flex-column align-items-end gap-2">
            {/* Stock Badge at top right */}
            <CBadge
              color={stockColor}
              style={{
                animation: (() => {
                  if (percentage < 20) return 'stockStrobe 1.5s infinite';
                  if (percentage >= 20 && percentage <= 50) return 'warningStrobe 2s infinite';
                  return 'none';
                })(),
                backgroundColor: (() => {
                  if (percentage >= 20 && percentage <= 50) return '#ff8c00';
                  return undefined;
                })()
              }}
            >
              {stock} ({percentage}%)
            </CBadge>

              
            {/* Images Button below stock badge */}
         {isRestrictedPlan() ? (
  <button
    type="button"
    className="btn btn-danger btn-sm d-flex align-items-center justify-content-center"
    onClick={() => {
      const upgrades = getAvailableUpgrades();
      setAvailablePlans(upgrades);
      setUpgradeModalVisible(true);
    }}
    style={{
      borderRadius: '20px',
      padding: '6px 12px',
      fontSize: '12px',
      fontWeight: '500',
      minWidth: '100px',
      width: '100%',
    }}
  >
    🔒 {t('LABELS.upgrade')}
  </button>
) : (
  <button
    type="button"
    className="btn btn-outline-purple btn-sm d-flex align-items-center justify-content-center"
    onClick={() => openImageModal(product)}
    style={{
      borderRadius: '20px',
      padding: '6px 12px',
      fontSize: '12px',
      fontWeight: '500',
      minWidth: '100px',
      width: '100%',
    }}
  >
    🖼️ {t('LABELS.images')}
  </button>
)}





          </div>
        </div>

       <div className="d-flex gap-1 justify-content-between">
  <button
    type="button"
    className="btn btn-outline-primary btn-sm"
    onClick={() => openQuantityModal(product)}
    style={{
      borderRadius: '20px',
      padding: '6px 4px',
      fontSize: '10px',
      fontWeight: '500',
      width: '32%',
      minWidth: 0
    }}
  >
    🔧 {t('LABELS.update')}
  </button>
  <button
    type="button"
    className="btn btn-outline-danger btn-sm"
    onClick={() => openDeadStockModal(product)}
    style={{
      borderRadius: '20px',
      padding: '6px 4px',
      fontSize: '10px',
      fontWeight: '500',
      width: '32%',
      minWidth: 0
    }}
  >
    ❌ {t('LABELS.dead_stock')}
  </button>
  <button
    type="button"
    className="btn btn-outline-success btn-sm"
    onClick={() => handleEdit(product)}
    style={{
      borderRadius: '20px',
      padding: '6px 4px',
      fontSize: '10px',
      fontWeight: '500',
      width: '32%',
      minWidth: 0
    }}
  >
    ✏️ {t('LABELS.edit')}
  </button>
</div>
      </CCardBody>
    </CCard>
  );
};


return (
  <>
 {/* Add CSS for strobing animation and responsive table */}

<style jsx global>{`
  @keyframes stockStrobe {
    0%, 50% { 
      opacity: 1; 
      box-shadow: 0 0 5px rgba(220, 53, 69, 0.8);
    }
    25%, 75% { 
      opacity: 0.4; 
      box-shadow: 0 0 15px rgba(220, 53, 69, 0.4);
    }
  }
  .badge-purple {
  background-color: #6f42c1 !important;
  color: white;
}

  @keyframes stockStrobe {
  0% { background-color: #dc3545; opacity: 1; }
  50% { background-color: #dc3545; opacity: 0.5; }
  100% { background-color: #dc3545; opacity: 1; }
}

@keyframes warningStrobe {
  0% { background-color: #ff8c00; opacity: 1; }
  50% { background-color: #ff8c00; opacity: 0.5; }
  100% { background-color: #ff8c00; opacity: 1; }
}

  
  @keyframes warningStrobe {
    0%, 50% { 
      opacity: 1; 
      box-shadow: 0 0 5px rgba(255, 165, 0, 0.8);
    }
    25%, 75% { 
      opacity: 0.4; 
      box-shadow: 0 0 15px rgba(255, 165, 0, 0.4);
    }
  }

  .btn-outline-blue {
  border-color: #2563eb !important;
  color: #2563eb !important;
  background-color: white !important;
}

.btn-outline-blue:hover {
  background-color: #2563eb !important;
  border-color: #2563eb !important;
  color: white !important;
}

.btn-outline-red {
  border-color: #dc2626 !important;
  color: #dc2626 !important;
  background-color: white !important;
}

.btn-outline-red:hover {
  background-color: #dc2626 !important;
  border-color: #dc2626 !important;
  color: white !important;
}

.btn-outline-green {
  border-color: #16a34a !important;
  color: #16a34a !important;
  background-color: white !important;
}

.btn-outline-green:hover {
  background-color: #16a34a !important;
  border-color: #16a34a !important;
  color: white !important;
}

.btn-outline-purple {
  border-color: #7c3aed !important;
  color: #7c3aed !important;
  background-color: white !important;
}

.btn-outline-purple:hover {
  background-color: #7c3aed !important;
  border-color: #7c3aed !important;
  color: white !important;
}

  /* Table container with proper scrolling */
  .table-responsive {
    max-height: 61vh;
    overflow: auto; /* Both horizontal and vertical scrolling */
    border: 1px solid #dee2e6;
    border-radius: 0.375rem;
    position: relative;
  }

  /* Main table styling */
  .products-table {
    width: 100%;
    min-width: 800px; /* Minimum width to maintain readability */
    table-layout: fixed;
    margin-bottom: 0;
  }

  /* Sticky header styling */
  .products-table thead th {
    position: sticky;
    top: 0;
    z-index: 10;
    background-color: #f8f9fa;
    border-bottom: 2px solid #dee2e6;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    white-space: nowrap;
    font-weight: 600;
  }

  .products-table th,
  .products-table td {
    text-align: center;
    vertical-align: middle;
    padding: 8px 4px;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }

  /* Remove right border from last column */
  .products-table th:last-child,
  .products-table td:last-child {
    border-right: none;
  }

  /* Fixed column widths for better alignment - REDUCED PRODUCT NAME COLUMN */
  .products-table th:nth-child(1),
  .products-table td:nth-child(1) {
    width: 200px;
    min-width: 200px;
    text-align: center;
  }

  .products-table th:nth-child(2),
  .products-table td:nth-child(2) {
    width: 120px;
    min-width: 120px;
  }

  .products-table th:nth-child(3),
  .products-table td:nth-child(3) {
    width: 100px;
    min-width: 100px;
  }

  .products-table th:nth-child(4),
  .products-table td:nth-child(4) {
    width: 140px;
    min-width: 140px;
  }

  .products-table th:nth-child(5),
  .products-table td:nth-child(5) {
    width: 120px;
    min-width: 120px;
  }

  .products-table th:nth-child(6),
  .products-table td:nth-child(6) {
    width: 140px;
    min-width: 140px;
  }

  .custom-placeholder::placeholder {
    font-size: 11px !important;
  }

  /* Header buttons styling */
  .header-buttons .btn {
    font-size: 16px !important;
    padding: 8px 16px !important;
    font-weight: 500;
  }

  /* Search input styling */
  .search-input {
    font-size: 16px !important;
    padding: 8px 12px !important;
    padding-left: 40px !important;
  }

  /* Quantity update buttons container */
  .qty-update-buttons {
    display: flex;
    flex-direction: column;
    gap: 6px;
    align-items: center;
    justify-content: center;
  }

  .qty-update-buttons .badge {
    min-width: 75px;
    text-align: center;
    font-size: 0.75em;
    padding: 5px 10px;
    cursor: pointer;
    transition: all 0.2s ease;
    border-radius: 4px;
  }

  .qty-update-buttons .badge:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  }

  /* Image column styling */
  .image-column .badge {
    min-width: 85px;
    font-size: 0.75em;
    padding: 6px 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    background-color: #6f42c1 !important;
    color: white !important;
    border: none !important;
    border-radius: 4px;
  }

  .image-column .badge:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(111, 66, 193, 0.3);
    background-color: #5a32a3 !important;
  }

  /* Action buttons styling */
  .action-buttons {
    display: flex;
    flex-direction: column;
    gap: 6px;
    align-items: center;
    justify-content: center;
  }

  .action-buttons .badge {
    min-width: 70px;
    text-align: center;
    font-size: 0.75em;
    padding: 5px 10px;
    cursor: pointer;
    transition: all 0.2s ease;
    border-radius: 4px;
  }

  /* Edit button */
  .action-buttons .badge-edit {
    background-color: #20c997 !important;
    color: white !important;
    border: none !important;
  }

  .action-buttons .badge-edit:hover {
    background-color: #1aa085 !important;
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(32, 201, 151, 0.3);
  }

  /* Delete button */
  .action-buttons .badge-delete {
    background-color: #dc3545 !important;
    color: white !important;
    border: none !important;
  }

  .action-buttons .badge-delete:hover {
    background-color: #c82333 !important;
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(220, 53, 69, 0.3);
  }

  /* Mobile responsive styles */
  @media (max-width: 768px) {
    .table-responsive {
      max-height: 68vh;
    }

    .products-table {
      min-width: 700px; /* Reduced minimum width for mobile */
    }

    .products-table th,
    .products-table td {
      padding: 8px 6px;
      font-size: 13px;
    }

    /* Adjusted mobile column widths */
    .products-table th:nth-child(1),
    .products-table td:nth-child(1) {
      width: 180px;
      min-width: 180px;
      font-size: 12px;
    }

    .products-table th:nth-child(2),
    .products-table td:nth-child(2) {
      width: 100px;
      min-width: 100px;
    }

    .products-table th:nth-child(3),
    .products-table td:nth-child(3) {
      width: 80px;
      min-width: 80px;
    }

    .products-table th:nth-child(4),
    .products-table td:nth-child(4) {
      width: 120px;
      min-width: 120px;
    }

    .mobile-product-card {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

.mobile-product-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(0,0,0,0.15);
}

.product-title {
  font-size: 1rem;
  line-height: 1.2;
}

    .products-table th:nth-child(5),
    .products-table td:nth-child(5) {
      width: 100px;
      min-width: 100px;
    }

    .products-table th:nth-child(6),
    .products-table td:nth-child(6) {
      width: 120px;
      min-width: 120px;
    }

    .action-buttons {
      gap: 4px !important;
    }

    .action-buttons .badge {
      font-size: 11px;
      padding: 4px 8px;
      min-width: 60px;
    }

    .qty-update-buttons {
      gap: 4px;
    }

    .qty-update-buttons .badge {
      min-width: 65px;
      font-size: 0.7em;
      padding: 4px 8px;
    }

    .image-column .badge {
      min-width: 70px;
      font-size: 0.7em;
      padding: 5px 10px;
    }

    /* Keep header buttons side by side on mobile */
    .header-buttons {
      flex-direction: row !important;
      gap: 8px !important;
      flex-wrap: nowrap;
      width: 100%;
    }

    .header-buttons .btn {
      flex: 1;
      min-width: 0;
      font-size: 13px !important;
      padding: 6px 8px !important;
      white-space: nowrap;
    }

    .search-input {
      font-size: 14px !important;
      padding: 6px 8px !important;
      padding-left: 35px !important;
    }
  }

  @media (max-width: 576px) {
    .table-responsive {
      max-height: 57vh;
    }

    .products-table {
      min-width: 650px; /* Further reduced for small mobile */
    }

    .products-table th,
    .products-table td {
      padding: 6px 4px;
      font-size: 12px;
    }

    /* Small mobile column widths */
    .products-table th:nth-child(1),
    .products-table td:nth-child(1) {
      width: 160px;
      min-width: 160px;
      font-size: 11px;
    }

    .products-table th:nth-child(2),
    .products-table td:nth-child(2) {
      width: 90px;
      min-width: 90px;
    }

    .products-table th:nth-child(3),
    .products-table td:nth-child(3) {
      width: 70px;
      min-width: 70px;
    }

    .products-table th:nth-child(4),
    .products-table td:nth-child(4) {
      width: 110px;
      min-width: 110px;
    }

    .products-table th:nth-child(5),
    .products-table td:nth-child(5) {
      width: 90px;
      min-width: 90px;
    }

    .products-table th:nth-child(6),
    .products-table td:nth-child(6) {
      width: 110px;
      min-width: 110px;
    }

   

    .image-column .badge {
      min-width: 60px;
      font-size: 0.65em;
      padding: 4px 8px;
    }

    .action-buttons .badge {
      min-width: 50px;
      font-size: 0.65em;
      padding: 3px 6px;
    }

    .header-buttons {
      flex-direction: row !important;
      gap: 6px !important;
      width: 100%;
      flex-wrap: nowrap;
    }

    .header-buttons .btn {
      flex: 1;
      font-size: 11px !important;
      padding: 5px 6px !important;
      white-space: nowrap;
      min-width: 0;
    }

    .search-input {
      margin-bottom: 16px;
      font-size: 12px !important;
      padding: 5px 6px !important;
      padding-left: 30px !important;
    }

    .products-table td div {
      line-height: 1.2 !important;
    }

    .products-table td div div {
      margin-top: 1px !important;
    }
  }

  /* Desktop - horizontal layout for buttons */
  @media (min-width: 769px) {
    .qty-update-buttons {
      flex-direction: row;
      gap: 8px;
      justify-content: center;
    }

    .action-buttons {
      flex-direction: row;
      gap: 8px;
      justify-content: center;
    }
  }

  /* Search input styling */
  .search-container {
    position: relative;
  }

  .search-input {
    padding-left: 40px;
  }

  .search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #6c757d;
    pointer-events: none;
  }

  .clear-search {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #6c757d;
    cursor: pointer;
    padding: 0;
    font-size: 16px;
  }

  .clear-search:hover {
    color: #dc3545;
  }

  /* Product name styling */
  .product-name {
    font-size: 16px;
    font-weight: 500;
    line-height: 1.3;
  }

  .product-local-name {
    font-size: 14px;
    color: #6c757d;
    margin-top: 2px;
    line-height: 1.2;
  }

  @media (max-width: 768px) {
    .product-name {
      font-size: 14px;
    }

    .product-local-name {
      font-size: 12px;
    }
  }

  @media (max-width: 576px) {
    .product-name {
      font-size: 13px;
    }

    .product-local-name {
      font-size: 11px;
    }
  }

  /* Desktop layout for buttons and search */
  @media (min-width: 769px) {
    .desktop-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .desktop-header-row .header-buttons {
      flex: 0 0 auto;
    }

    .desktop-header-row .search-container {
      flex: 0 0 300px;
    }
  }

  /* Horizontal scroll indicator */
  .table-responsive::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 20px;
    height: 100%;
    background: linear-gradient(to left, rgba(248, 249, 250, 0.8), transparent);
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .table-responsive:hover::after {
    opacity: 1;
  }

  /* Scrollbar styling */
  .table-responsive::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  .table-responsive::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  .table-responsive::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
  }

  .table-responsive::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
`}</style>

{/* Desktop Header Row - Buttons on left, Search on right */}
<div className="d-none d-md-flex desktop-header-row">
  <div className="header-buttons d-flex gap-2">
    <CButton color="primary" onClick={openNewProductModal}>
      {t('LABELS.add_new_product')}
    </CButton>
    <CButton color="success" onClick={openBulkUploadModal}>
      {t('LABELS.bulk_upload_products')}
    </CButton>
  </div>
  <div className="search-container">
    <CFormInput
      type="text"
      className="search-input"
      placeholder={t('LABELS.search_products')}
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
    <div className="search-icon">
      🔍
    </div>
    {searchTerm && (
      <button
        className="clear-search"
        onClick={() => setSearchTerm('')}
        title={t('LABELS.clear_search')}
      >
        ✕
      </button>
    )}
  </div>
</div>

{/* Mobile Header - Stacked layout */}
<div className="d-md-none">
  <CRow className="mb-1">
    <CCol xs={12}>
      <div className="header-buttons d-flex gap-2">
        <CButton color="primary" onClick={openNewProductModal}>
          {t('LABELS.add_new_product')}
        </CButton>
        <CButton color="success" onClick={openBulkUploadModal}>
          {t('LABELS.bulk_upload_products')}
        </CButton>
      </div>
    </CCol>
  </CRow>

  <CRow className="mt-2">
    <CCol xs={12}>
      <div className="search-container">
        <CFormInput
          type="text"
          className="search-input"
          placeholder={t('LABELS.search_products')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="search-icon">
          🔍
        </div>
        {searchTerm && (
          <button
            className="clear-search"
            onClick={() => setSearchTerm('')}
            title={t('LABELS.clear_search')}
          >
            ✕
          </button>
        )}
      </div>
    </CCol>
  </CRow>
</div>

{/* Search Results Info */}
{searchTerm && (
  <CRow className="mb-1">
    <CCol xs={12}>
      <small className="text-muted">
        {filteredProducts.length} {t('LABELS.products_found')} "{searchTerm}"
      </small>
    </CCol>
  </CRow>
)}

<CRow>
  <ConfirmationModal
    visible={deleteModalVisible}
    setVisible={setDeleteModalVisible}
    onYes={onDelete}
    resource={`${t('LABELS.delete_product')} - ${deleteProduct?.name}`}
  />
  <CCol xs={12}>
    <CCard className="mb-4">
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <strong>{t('LABELS.all_products')}</strong>
        <small className="text-muted">
          {t('LABELS.total')}: {filteredProducts.length} {t('LABELS.products')}
        </small>
      </CCardHeader>
      <CCardBody className="p-0">
  {isMobile ? (
  <div className="p-3">
    {filteredProducts.length === 0 ? (
      <div className="text-center text-muted py-4">
        {searchTerm ? t('LABELS.no_products_found') : t('LABELS.no_products_available')}
      </div>
    ) : (
      filteredProducts.map((p) => renderMobileProductCard(p))
    )}
  </div>
)  : (
    <div className="table-responsive">
      <CTable className="products-table mb-0">
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell scope="col">{t('LABELS.product_name')}</CTableHeaderCell>
            <CTableHeaderCell scope="col">
              <span style={{ whiteSpace: 'nowrap' }}>
                {t('LABELS.selling_price')} ₹
              </span>
            </CTableHeaderCell>
            <CTableHeaderCell scope="col">{t('LABELS.stock')}</CTableHeaderCell>
            <CTableHeaderCell scope="col">
              <span style={{ whiteSpace: 'nowrap' }}>
                {t('LABELS.qty_update')}
              </span>
            </CTableHeaderCell>
            <CTableHeaderCell scope="col">{t('LABELS.images')}</CTableHeaderCell>
            <CTableHeaderCell scope="col">{t('LABELS.actions')}</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {filteredProducts.length === 0 ? (
            <CTableRow>
              <CTableDataCell colSpan={6} className="text-center py-4 text-muted">
                {searchTerm ? t('LABELS.no_products_found') : t('LABELS.no_products_available')}
              </CTableDataCell>
            </CTableRow>
          ) : (
            filteredProducts.map((p, index) => (
              <CTableRow key={p.id}>
                <CTableDataCell style={{ textAlign: 'center' }}>
                  <div style={{ wordBreak: 'break-word' }}>
                    <div className="product-name">
                      {i18n.language === 'mr' ? (p.localName || p.name) : p.name}
                    </div>
                  </div>
                </CTableDataCell>
                <CTableDataCell>
                  <strong>{p.sizes?.[0]?.oPrice || ''}</strong>
                </CTableDataCell>
                <CTableDataCell>
                  <CBadge 
                    color={(() => {
                      const stock = p.sizes?.[0]?.stock || 0;
                      const qty = p.sizes?.[0]?.qty || 1;
                      const percentage = (stock / qty) * 100;
                      if (percentage < 20) return 'danger';
                      if (percentage >= 20 && percentage <= 50) return 'orange';
                      return 'success';
                    })()}
                    style={{
                      animation: (() => {
                        const stock = p.sizes?.[0]?.stock || 0;
                        const qty = p.sizes?.[0]?.qty || 1;
                        const percentage = (stock / qty) * 100;
                        if (percentage < 20) return 'stockStrobe 1.5s infinite';
                        if (percentage >= 20 && percentage <= 50) return 'warningStrobe 2s infinite';
                        return 'none';
                      })(),
                      backgroundColor: (() => {
                        const stock = p.sizes?.[0]?.stock || 0;
                        const qty = p.sizes?.[0]?.qty || 1;
                        const percentage = (stock / qty) * 100;
                        if (percentage >= 20 && percentage <= 50) return '#ff8c00';
                        return undefined;
                      })()
                    }}
                  >
                    {p.sizes?.[0]?.stock || 0}
                  </CBadge>
                </CTableDataCell>
                <CTableDataCell>
                  <div className="qty-update-buttons">
                     <button
        type="button"
        className="btn btn-outline-blue btn-sm"
        onClick={() => openQuantityModal(p)}
        style={{
          borderRadius: '20px',
          padding: '6px 12px',
          fontSize: '12px',
          fontWeight: '500',
          minWidth: '80px'
        }}
      >
        🔧 {t('LABELS.update')}
      </button>

                    <button
        type="button"
        className="btn btn-outline-red btn-sm"
        onClick={() => openDeadStockModal(p)}
        style={{
          borderRadius: '20px',
          padding: '6px 12px',
          fontSize: '12px',
          fontWeight: '500',
          minWidth: '80px'
        }}
      >
        ❌ {t('LABELS.dead_stock')}
      </button>
                  </div>
                </CTableDataCell>
                <CTableDataCell>
{isRestrictedPlan() ? (
  <button
    type="button"
    className="btn btn-danger btn-sm"
    onClick={() => {
      const upgrades = getAvailableUpgrades();
      setAvailablePlans(upgrades);
      setUpgradeModalVisible(true);
    }}
    style={{
      borderRadius: '20px',
      padding: '6px 12px',
      fontSize: '12px',
      fontWeight: '500',
      minWidth: '80px'
    }}
  >
    🔒 {t('LABELS.upgrade')}
  </button>
) : (
  <button
    type="button"
    className="btn btn-outline-purple btn-sm"
    onClick={() => openImageModal(p)}
    style={{
      borderRadius: '20px',
      padding: '6px 12px',
      fontSize: '12px',
      fontWeight: '500',
      minWidth: '80px'
    }}
  >
    🖼️ {t('LABELS.images')}
  </button>
)}


                </CTableDataCell>
                <CTableDataCell>
                  <div className="action-buttons">
                    <button
      type="button"
      className="btn btn-outline-green btn-sm"
      onClick={() => handleEdit(p)}
      style={{
        borderRadius: '20px',
        padding: '6px 12px',
        fontSize: '12px',
        fontWeight: '500',
        minWidth: '70px'
      }}
    >
      ✏️ {t('LABELS.edit')}
    </button>
                  </div>
                </CTableDataCell>
              </CTableRow>
            ))
          )}
        </CTableBody>
      </CTable>
    </div>
  )}
  


</CCardBody>

    </CCard>
  </CCol>
</CRow>

{/* Color Code Legend - Multilingual Version */}
<CRow className="mt-3 mb-2">
  <CCol xs={12}>
    <div className="d-flex flex-column flex-lg-row align-items-start align-items-lg-center gap-2">
      <small className="text-muted"><strong>{t('LABELS.stock_color_code')}:</strong></small>
      <div className="d-flex flex-wrap align-items-center gap-3">
        <div className="d-flex align-items-center gap-1">
          <CBadge color="danger" style={{ fontSize: '0.7em' }}>
            {t('LABELS.stock_less_than_20_percent')}
          </CBadge>
          <small className="text-muted">{t('LABELS.red_stock_label')}</small>
        </div>
        <div className="d-flex align-items-center gap-1">
          <CBadge style={{ backgroundColor: '#ff8c00', color: 'white', fontSize: '0.7em' }}>
            {t('LABELS.stock_between_20_50_percent')}
          </CBadge>
          <small className="text-muted">{t('LABELS.orange_stock_label')}</small>
        </div>
        <div className="d-flex align-items-center gap-1">
          <CBadge color="success" style={{ fontSize: '0.7em' }}>
            {t('LABELS.stock_greater_than_50_percent')}
          </CBadge>
          <small className="text-muted">{t('LABELS.green_stock_label')}</small>
        </div>
      </div>
    </div>
  </CCol>
</CRow>

{imageModal.visible && (
  <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
    <div className="modal-dialog modal-xl">
      <div className="modal-content">
        <div className="modal-header d-flex justify-content-between align-items-center">
          <h5 className="modal-title">
            {t('LABELS.images')} - {imageModal.product?.name}
          </h5>
          <button 
            className="btn-close" 
            onClick={() => setImageModal({ visible: false })}
          ></button>
        </div>

        <div className="modal-body p-3">
          <div className="position-relative">
            <div 
              className="d-flex gap-3 overflow-auto pb-3"
              style={{ 
                scrollBehavior: 'smooth',
                scrollSnapType: 'x mandatory'
              }}
            >
              {/* Existing Images */}
              {imageModal.media.map((img, i) => (
                <div 
                  key={i}
                  className="flex-shrink-0 position-relative"
                  style={{ scrollSnapAlign: 'start' }}
                >
                  <div 
                    className="position-relative border rounded overflow-hidden"
                    style={{ width: '200px', height: '200px' }}
                  >
                    <img 
                      src={`/${img.url}`} 
                      className="w-100 h-100 object-fit-cover"
                      style={{ cursor: "zoom-in" }}
                      onClick={() => setPreviewImage(`/${img.url}`)}
                      alt={t('LABELS.product_image_alt', { number: i + 1 })}
                    />
                    <button
                      className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 rounded-circle d-flex align-items-center justify-content-center"
                      style={{ width: '30px', height: '30px', fontSize: '12px' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteImage(img.id);
                      }}
                      title={t('LABELS.delete_image')}
                    >
                      🗑
                    </button>
                  </div>

                  {/* ✅ Description Section */}
                  <div className="text-center mt-2 px-1" style={{ maxWidth: '200px' }}>
  <div className="input-group input-group-sm">
    <input
      type="text"
      value={img.description || ''}
      placeholder={t('LABELS.enter_description')}
      onChange={(e) => updateImageDescriptionLocally(i, e.target.value)}
      disabled={editingIndex !== i}
      className="form-control text-center"
    />
    <button
      className="btn btn-outline-secondary"
      type="button"
      onClick={() => {
        if (editingIndex === i) {
          // Done editing
          saveDescriptionToServer(img.id, img.description);
          setEditingIndex(null);
        } else {
          // Start editing
          setEditingIndex(i);
        }
      }}
    >
      <CIcon icon={editingIndex === i ? cilCheck : cilPencil} />
    </button>
  </div>
</div>


                  {/* Share Button */}
                 
  <div className="text-center mt-2">
    <CButton 
      size="sm" 
      color="success" 
      onClick={() => shareOnWhatsApp(img.url)}
      className="w-100"
    >
      📤 {t('LABELS.share')}
    </CButton>
  </div>

                </div>
              ))}

              {/* Loading Images */}
              {imageModal.uploadingImages && imageModal.uploadingImages.map((file, i) => (
                <div 
                  key={`loading-${i}`}
                  className="flex-shrink-0 position-relative"
                  style={{ scrollSnapAlign: 'start' }}
                >
                  <div 
                    className="position-relative border rounded overflow-hidden d-flex align-items-center justify-content-center bg-light"
                    style={{ width: '200px', height: '200px' }}
                  >
                    <img 
                      src={file.preview} 
                      className="w-100 h-100 object-fit-cover position-absolute"
                      style={{ opacity: 0.5 }}
                      alt="Uploading..."
                    />
                    <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-white bg-opacity-75">
                      <div className="text-center">
                        <div className="spinner-border text-primary mb-2" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        <small className="text-muted d-block">{t('LABELS.uploading')}</small>
                      </div>
                    </div>
                  </div>

                  {/* Placeholder for description */}
                  <div className="text-center mt-2 px-1" style={{ maxWidth: '200px' }}>
                    <small className="text-muted">{t('LABELS.uploading')}</small>
                  </div>

               
  <div className="text-center mt-2">
    <CButton 
      size="sm" 
      color="success" 
      onClick={() => shareOnWhatsApp(img.url)}
      className="w-100"
    >
      📤 {t('LABELS.share')}
    </CButton>
  </div>



                </div>
              ))}

              {/* Add New Image Upload Box */}
              <div 
                className="flex-shrink-0 d-flex align-items-center justify-content-center border border-2 border-dashed rounded"
                style={{ 
                  width: '200px', 
                  height: '200px',
                  cursor: 'pointer',
                  scrollSnapAlign: 'start',
                  borderColor: '#28a745'
                }}
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.multiple = true;

                  input.onchange = async (e) => {
                    const files = e.target.files;
                    if (files && files.length > 0 && imageModal.product?.id) {
                      const uploadingImages = Array.from(files).map(file => ({
                        file,
                        preview: URL.createObjectURL(file)
                      }));

                      setImageModal(prev => ({
                        ...prev,
                        uploadingImages
                      }));

                      const formData = new FormData();
                      for (const file of files) {
                        formData.append('images[]', file);
                      }
                      formData.append('product_id', imageModal.product.id.toString());

                      try {
                        await postFormData('/api/product/media/multiple', formData);
                        showToast('success', 'Images uploaded successfully');
                        uploadingImages.forEach(img => URL.revokeObjectURL(img.preview));
                        openImageModal(imageModal.product); // Refresh
                      } catch (err) {
                        showToast('danger', 'Failed to upload images');
                        console.error(err);
                        uploadingImages.forEach(img => URL.revokeObjectURL(img.preview));
                        setImageModal(prev => ({
                          ...prev,
                          uploadingImages: null
                        }));
                      }
                    }
                  };

                  input.click();
                }}
              >
                <div className="text-center text-success">
                  <div style={{ fontSize: '2rem' }}>+</div>
                  <small>{t('LABELS.add_images')}</small>
                </div>
              </div>
            </div>

            {(imageModal.media.length + (imageModal.uploadingImages?.length || 0)) > 2 && (
              <div className="text-center mt-2">
                <small className="text-muted">
                  {t('LABELS.scroll_to_view_more_images', { 
                    count: imageModal.media.length + (imageModal.uploadingImages?.length || 0) + 1 
                  })}
                </small>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
)}



   {/* Update Quantity Modal */}
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
                  {quantityModal.product.sizes?.[0]?.qty ?? 0}
                </span>
              </p>
            </div>
            <div className="col-6">
              <p className="mb-1">
                <b>{t('LABELS.current_stock')}:</b>{' '}
                <span 
                  className={`badge ${
                    getStockStatus(
                      quantityModal.product.sizes?.[0]?.stock,
                      quantityModal.product.sizes?.[0]?.qty
                    ).color === 'danger' ? 'bg-danger' : 
                    getStockStatus(
                      quantityModal.product.sizes?.[0]?.stock,
                      quantityModal.product.sizes?.[0]?.qty
                    ).color === 'warning' ? 'bg-warning text-dark' : 'bg-success'
                  }`}
                  style={{
                    animation: getStockStatus(
                      quantityModal.product.sizes?.[0]?.stock,
                      quantityModal.product.sizes?.[0]?.qty
                    ).strobe ? 'stockStrobe 1.5s infinite' : 'none'
                  }}
                >
                  {quantityModal.product.sizes?.[0]?.stock ?? 0}
                </span>
              </p>
            </div>
          </div>
          
          <div className="alert alert-info">
            <small>
              <strong>{t('LABELS.stock_percentage')}:</strong> {getStockStatus(
                quantityModal.product.sizes?.[0]?.stock,
                quantityModal.product.sizes?.[0]?.qty
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
                  <strong>{t('LABELS.after_adding')}:</strong> {t('LABELS.stock_will_be')} {' '}
                  {(quantityModal.product.sizes?.[0]?.stock || 0) + (parseInt(quantityModal.addedQty) || 0)} / {quantityModal.product.sizes?.[0]?.qty || 0}
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
            disabled={!quantityModal.addedQty || parseInt(quantityModal.addedQty) < 1 || quantityModal.maxAddable <= 0}
          >
            {t('LABELS.add_stock')}
          </CButton>
        </div>
      </div>
    </div>
  </div>
)}

{deadStockModal.visible && (
  <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">
            {t('LABELS.dead_stock')} - {deadStockModal.product.name}
          </h5>
          <button
            className="btn-close"
            onClick={() => setDeadStockModal({ ...deadStockModal, visible: false })}
          ></button>
        </div>
        <div className="modal-body">
          {/* Available Stock Info */}
          <div className="alert alert-info">
            <strong>{t('LABELS.available_stock')}:</strong>{' '}
            {deadStockModal.product.sizes?.[0]?.stock || 0}
          </div>

          {/* Quantity Input */}
          <div className="mb-3">
            <label><strong>{t('LABELS.dead_stock_qty')}</strong></label>
            <input
              type="number"
              className="form-control"
              min="1"
              max={deadStockModal.product.sizes?.[0]?.stock || 0}
              value={deadStockModal.qty}
              onChange={(e) => {
                const stock = deadStockModal.product.sizes?.[0]?.stock || 0;
                let val = parseInt(e.target.value) || 0;
                if (val < 1) val = 1;
                if (val > stock) val = stock;
                setDeadStockModal({ ...deadStockModal, qty: val });
              }}
            />
          </div>

          {/* Price Input */}
          <div className="mb-3">
            <label><strong>{t('LABELS.price')}</strong></label>
            <input
              type="number"
              className="form-control"
              min="0"
              value={deadStockModal.price}
              onChange={(e) =>
                setDeadStockModal({ ...deadStockModal, price: parseFloat(e.target.value) || ''})
              }
            />
          </div>

          {/* Total Value */}
          <div className="mb-3">
            <strong>
              {t('LABELS.total_value')}:{' '}
              ₹ {(deadStockModal.qty * deadStockModal.price).toFixed(2)}
            </strong>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="modal-footer">
          <CButton
            color="secondary"
            onClick={() => setDeadStockModal({ ...deadStockModal, visible: false })}
          >
            {t('LABELS.cancel')}
          </CButton>
          <CButton
            color="danger"
            onClick={() => setDeadStockModal({ ...deadStockModal, showConfirmation: true })}
            disabled={
              !deadStockModal.qty ||
              deadStockModal.qty < 1 ||
              deadStockModal.qty > (deadStockModal.product.sizes?.[0]?.stock || 0)
            }
          >
            {t('LABELS.confirm_dead_stock')}
          </CButton>
        </div>
      </div>
    </div>
  </div>
)}

{/* Confirmation Popup Modal */}
{deadStockModal.showConfirmation && (
  <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1060 }}>
    <div className="modal-dialog modal-dialog-centered modal-sm">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title text-danger">
            <i className="fa fa-exclamation-triangle me-2"></i>
            {t('LABELS.confirm_dead_stock')}
          </h5>
        </div>
        <div className="modal-body">
          <div className="bg-light p-3 rounded mb-3">
            <div className="row mb-2">
              <div className="col-5"><strong>{t('LABELS.product')}:</strong></div>
              <div className="col-7">{deadStockModal.product.name}</div>
            </div>
            <div className="row mb-2">
              <div className="col-5"><strong>{t('LABELS.quantity')}:</strong></div>
              <div className="col-7">{deadStockModal.qty}</div>
            </div>
            <div className="row">
              <div className="col-5"><strong>{t('LABELS.total_value')}:</strong></div>
              <div className="col-7 text-danger">
                <strong>₹ {(deadStockModal.qty * deadStockModal.price).toFixed(2)}</strong>
              </div>
            </div>
          </div>
          
        </div>
        <div className="modal-footer">
          <CButton
            color="secondary"
            onClick={() => setDeadStockModal({ ...deadStockModal, showConfirmation: false })}
          >
            {t('LABELS.cancel')}
          </CButton>
          <CButton
            color="danger"
            onClick={() => {
              setDeadStockModal({ ...deadStockModal, showConfirmation: false });
              handleDeadStockSubmit();
            }}
          >
            <i className="fa fa-trash me-1"></i>
            {t('LABELS.confirm')}
          </CButton>
        </div>
      </div>
    </div>
  </div>
)}

{previewImage && (
  <div
    className="modal d-block"
    style={{ background: 'rgba(0,0,0,0.8)' }}
    onClick={() => setPreviewImage(null)}
  >
    <div className="modal-dialog modal-dialog-centered">
      <img
        src={previewImage}
        className="img-fluid rounded"
        style={{ maxHeight: '90vh' }}
      />
    </div>
  </div>
)}


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

            {(isGoldenGrowthPlan() || isElitePlan()) && (
  <div className="mb-3">
    <CFormLabel><b>{t('LABELS.add_image')}</b></CFormLabel>
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
)}



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

{upgradeModalVisible && (
  <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
    <div className="modal-dialog modal-lg">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">{t('LABELS.available_plans')}</h5>
          <button className="btn-close" onClick={() => setUpgradeModalVisible(false)} />
        </div>
        <div className="modal-body">
          {availablePlans.length === 0 ? (
            <p>{t('MESSAGES.no_upgrade_plans_found')}</p>
          ) : (
            availablePlans.map((plan) => (
              <div key={plan.id} className="border p-3 mb-2 d-flex justify-content-between align-items-center">
                <div>
                  <h6>{plan.name}</h6>
                </div>
                <CButton
                  color="primary"
                 onClick={() => handleUpgradePreview(plan)}
                >
                  {t('BUTTONS.upgrade')}
                </CButton>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  </div>
)}
{showUpgradeConfirmModal && upgradePreview && (
  <div className="modal d-block" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
    <div className="modal-dialog">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title text-primary">{t('LABELS.confirm_upgrade')}</h5>
          <button className="btn-close" onClick={() => setShowUpgradeConfirmModal(false)}></button>
        </div>
        <div className="modal-body">
          <p>
            <strong>{t('LABELS.current_plan')}:</strong>{' '}
            {upgradePreview.current_plan ?? t('LABELS.not_available')} (
            ₹{parseFloat(upgradePreview.current_plan_price || 0).toFixed(2)})
          </p>
          <p>
            <strong>{t('LABELS.new_plan')}:</strong>{' '}
            {upgradePreview.new_plan ?? t('LABELS.not_available')} (
            ₹{parseFloat(upgradePreview.new_plan_price || 0).toFixed(2)})
          </p>
          <p>
            <strong>{t('LABELS.remaining_days')}:</strong>{' '}
            {upgradePreview.remaining_days ?? 0}
          </p>
          <p>
            <strong>{t('LABELS.unused_value')}:</strong>{' '}
            ₹{parseFloat(upgradePreview.unused_value || 0).toFixed(2)}
          </p>
          <p>
            <strong>{t('LABELS.payable_amount')}:</strong>{' '}
            <strong className="text-success">
              ₹{parseFloat(upgradePreview.payable_amount || 0).toFixed(2)}
            </strong>
          </p>
          <CButton
            color="success"
            onClick={() =>
              handleRazorpayPayment(selectedPlan, upgradePreview.payable_amount, previousPlan)
            }
            disabled={!selectedPlan}
          >
            {t('BUTTONS.confirm_and_pay')} ₹{parseFloat(upgradePreview.payable_amount || 0).toFixed(2)}
          </CButton>
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
  </>
);
};

export default AllProducts;