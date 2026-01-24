import React, { useEffect, useState } from 'react'
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormCheck,
  CFormInput,
  CFormLabel,
  CRow,
} from '@coreui/react'
import { useNavigate } from 'react-router-dom';
import { getAPICall, postFormData, put } from '../../../util/api'
import { useParams } from 'react-router-dom'
import { useToast } from '../../common/toast/ToastContext';
import { useTranslation } from 'react-i18next';

const EditProduct = () => {
  const { t, i18n } = useTranslation('global');
  const lng = i18n.language;
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const params = useParams()
  const { showToast } = useToast();
  const [state, setState] = useState({
    id: 0,
    name: '',
    localName: '',
    slug: '',
    categoryId: 0,
    incStep: 1,
    desc: '',
    multiSize: false,
    show: true,
    showOnHome: true,
    returnable: true,
    qty: 0,
    stock:0,
    oPrice: '',  // Changed to string to handle decimal input better
    media: [],
    sizes: [],
  })

  const handleChange = (e) => {
    const { name, value } = e.target;
    const numericFields = ['qty', 'incStep'];

    if (numericFields.includes(name)) {
      // Allow empty string for clearing the field
      if (value === '') {
        setState(prev => ({ ...prev, [name]: '' }));
        return;
      }

      let numValue = parseFloat(value);
      if (isNaN(numValue) || numValue < 0) return;

      setState(prev => ({ ...prev, [name]: numValue }));
    } else if (name === 'oPrice') {
      // Handle selling price with decimal validation
      if (value === '') {
        setState(prev => ({ ...prev, [name]: '' }));
        return;
      }

      // Allow only numbers and one decimal point with up to 2 decimal places
      const regex = /^\d*\.?\d{0,2}$/;
      if (!regex.test(value)) {
        return; // Don't update if it doesn't match the pattern
      }

      // Store as string to preserve decimal input
      setState(prev => ({ ...prev, [name]: value }));
    } else {
      setState(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCBChange = (e) => {
    const { name, checked } = e.target
    setState({ ...state, [name]: checked })
  }

 const loadProductData = async () => {
  try {
    const data = await getAPICall('/api/product/' + params.id);
    setState({
      id: data.id,
      name: data.name,
      localName: data.localName,
      slug: data.slug,
      categoryId: data.categoryId,
      incStep: Math.max(1, data.incStep),
      desc: data.desc,
      multiSize: data.multiSize,
      show: data.show,
      returnable: data.sizes[0].returnable,
      showOnHome: data.showOnHome,
      unit: data.unit,
      qty: Math.max(0, parseInt(data.sizes[0].qty)),
      stock: Math.max(0, parseInt(data.sizes[0].stock)), // <--- ADD THIS LINE
      oPrice: parseFloat(data.sizes[0].oPrice).toFixed(2),
      media: data.media,
      sizes: data.sizes,
    });
  } catch (error) {
    showToast('danger', t('MSG.error_occurred') + ' ' + error);
  }
};

const isGoldenGrowthOrElite = () => {
  const userRaw = localStorage.getItem("userData");
  if (!userRaw) return false;

  try {
    const userData = JSON.parse(userRaw);
    const planName = userData?.user?.company_info?.subscribed_plan_name?.toLowerCase() || '';
    return planName.includes('golden growth') || planName.includes('elite');
  } catch (e) {
    console.error("Failed to parse user data", e);
    return false;
  }
};



  useEffect(() => {
    loadProductData()
  }, [])

  const handleSubmit = async () => {
  // 1. Validate selling price
  const oPriceNum = parseFloat(state.oPrice);
  if (isNaN(oPriceNum) || oPriceNum < 0) {
    showToast('danger', t('MSG.invalid_price'));
    return;
  }

  // 2. Validate quantity
  if (state.qty < 0) {
    showToast('danger', t('MSG.negative_values_not_allowed'));
    return;
  }

  // 3. Prepare data
  let data = { ...state };
  data.slug = data.name.replace(/[^\w]/g, '_');

  // 4. Format sizes if not multiSize
  if (!state.multiSize) {
  data.sizes[0].name = data.name;
  data.sizes[0].localName = data.localName;
  data.sizes[0].qty = Math.max(0, parseInt(data.qty));
  data.sizes[0].stock = Math.max(0, parseInt(data.stock)); // FIXED THIS LINE
  data.sizes[0].oPrice = parseFloat(data.oPrice).toFixed(2);
  data.sizes[0].dPrice = parseFloat(data.oPrice).toFixed(2);
  data.sizes[0].show = true;
  data.sizes[0].returnable = data.returnable;
  data.sizes[0].showOnHome = data.showOnHome;
  delete data.oPrice;
  delete data.qty;
}

  try {
    // 5. Update product
    const resp = await put('/api/product/' + data.id, data);

    if (resp?.id) {
      // 6. Upload images if any
      await uploadImages(resp.id);

      showToast('success', t('MSG.product_updated_successfully'));
      navigate('/products/all');
    } else {
      showToast('danger', t('MSG.error_try_again_later'));
    }
  } catch (error) {
    showToast('danger', t('MSG.error_occurred') + ' ' + error);
  }
};


   const handleCancel = async () => {
    navigate('/products/all')
  }

 const uploadImages = async (productId) => {
  if (!images.length) return;

  console.log('Uploading images for product ID:', productId); // Debug log

  const formData = new FormData();
  images.forEach((img) => formData.append('images[]', img));
  formData.append('product_id', productId.toString()); // Ensure it's a string

  // Debug: Log FormData contents
  for (let pair of formData.entries()) {
    console.log(pair[0] + ': ' + pair[1]);
  }

  try {
    await postFormData('/api/product/media/multiple', formData);
  } catch (error) {
    console.error('Upload error:', error);
    throw error; // Re-throw to be caught by handleSubmit
  }
};

  const handlePriceBlur = (e) => {
    // Format the price to 2 decimal places when user leaves the field
    const value = e.target.value;
    if (value && !isNaN(parseFloat(value))) {
      const formatted = parseFloat(value).toFixed(2);
      setState(prev => ({ ...prev, oPrice: formatted }));
    }
  };

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>{t('LABELS.edit_product')}</strong>
          </CCardHeader>
          <CCardBody>
            <CForm>
              <div className="row mb-2">
                <div className="col-6">
                  <CFormLabel htmlFor="pname"><b>{t('LABELS.product_name')}</b></CFormLabel>
                  <CFormInput
                    type="text"
                    id="pname"
                    placeholder={t('LABELS.product_name')}
                    name="name"
                    value={state.name}
                    onChange={handleChange}
                    required
                    feedbackInvalid={t('LABELS.please_provide_name')}
                    feedbackValid={t('LABELS.looks_good')}
                  />
                  <div className="invalid-feedback">{t('LABELS.product_name_required')}</div>
                </div>
                <div className="col-6">
                  <CFormLabel htmlFor="plname"><b>{t('LABELS.local_name')}</b></CFormLabel>
                  <CFormInput
                    type="text"
                    id="plname"
                    placeholder={t('LABELS.local_name')}
                    name="localName"
                    value={state.localName}
                    onChange={handleChange}
                    required
                    feedbackInvalid={t('LABELS.please_provide_local_name')}
                    feedbackValid={t('LABELS.looks_good')}
                  />
                  <div className="invalid-feedback">{t('LABELS.local_name_required')}</div>
                </div>
              </div>
              
              <div className="row mb-2">
                <div className="col-4">
                  <CFormLabel htmlFor="qty"><b>{t('LABELS.capacity')}</b></CFormLabel>
                  <CFormInput
                    type="number"
                    id="qty"
                    placeholder="0"
                    min="0"
                    onWheel={(e) => e.target.blur()}
                    name="qty"
                    value={state.qty}
                    onChange={handleChange}
                    required
                  />
                  <div className="invalid-feedback">{t('LABELS.quantity_required')}</div>
                </div>
                <div className="col-4">
                  <CFormLabel htmlFor="stock"><b>{t('LABELS.stock')}</b></CFormLabel>
                  <CFormInput
                    type="number"
                    id="stock"
                    placeholder="0"
                    min="0"
                    onWheel={(e) => e.target.blur()}
                    name="stock"
                    value={state.stock}
                    onChange={handleChange}
                    required
                  />
                  <div className="invalid-feedback">{t('LABELS.quantity_required')}</div>
                </div>
                <div className="col-4">
                  <CFormLabel htmlFor="oPrice"><b>{t('LABELS.selling_price')}</b></CFormLabel>
                  <CFormInput
                    type="text"  // Changed from number to text for better decimal control
                    id="oPrice"
                    placeholder="0.00"
                    name="oPrice"
                    value={state.oPrice}
                    onWheel={(e) => e.target.blur()}
                    onChange={handleChange}
                    onBlur={handlePriceBlur} // Format on blur
                    pattern="^\d*\.?\d{0,2}$"
                    title="Please enter a valid price (up to 2 decimal places)"
                    required
                  />
                  <div className="invalid-feedback">{t('LABELS.selling_price_required')}</div>
                </div>
              </div>
              {isGoldenGrowthOrElite() && (
  <div className="mb-3">
    <CFormLabel><b>{t('LABELS.add_images')}</b></CFormLabel>
    <input
      type="file"
      multiple
      accept="image/*"
      onChange={(e) => setImages([...e.target.files])}
      className="form-control"
    />
  </div>
)}

              
              <div className="row mb-2">
                <div className="col-6">
                  <CFormCheck
                    id="show"
                    label={t('LABELS.show_for_invoicing')}
                    name="show"
                    checked={state.show}
                    value={state.show}
                    onChange={handleCBChange}
                  />
                </div>
              </div>
            
              <div className="mb-3">
                <CButton color="success" onClick={handleSubmit}>
                  {t('LABELS.update')}
                </CButton>
                <CButton color="secondary" style={{marginLeft:"5px"}} onClick={handleCancel}>
                  {t('LABELS.cancel')}
                </CButton>
              </div>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default EditProduct