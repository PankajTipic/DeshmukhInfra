import React, { useState, useEffect, useRef } from 'react';
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormInput,
  CFormLabel,
  CButton,
  CFormSelect,
  CRow,
  CCol
} from '@coreui/react';
import { getAPICall, put, postFormData } from '../../../util/api';
import { useToast } from '../../common/toast/ToastContext';
import { useTranslation } from 'react-i18next';
import ImagePopup from './ImagePopup'; // Import the new component

const EditCompanyModal = ({ visible, setVisible, companyData, onSuccess }) => {
  const { showToast } = useToast();
  const [validated, setValidated] = useState(false);
  const { t } = useTranslation("global");
  const [formData, setFormData] = useState({
    companyName: '',
    land_mark: '',
    phone_no: '',
    email_id: '',
    bank_name: '',
    account_no: '',
    IFSC_code: '',
    gst_number:'',
    pan_number:'',
    logo: '',
    sign: '',
    paymentQRCode: '',
    appMode: 'advance',
    tal: 'Pune',
    dist: 'Pune',
    pincode: '',
    initials: '',
  });
  
  const [formErrors, setFormErrors] = useState({
    phone_no: '',
    email_id: '',
  });

  const [imagePreviews, setImagePreviews] = useState({
    logo: '',
    sign: '',
    paymentQRCode: '',
  });

  // Image popup state
  const [imagePopup, setImagePopup] = useState({ 
    visible: false, 
    src: '', 
    title: '',
    alt: ''
  });

  const logoInputRef = useRef(null);
  const signInputRef = useRef(null);
  const paymentQRCodeInputRef = useRef(null);

  const appModes = [
    { label: 'Basic', value: 'basic' },
    { label: 'Advance', value: 'advance' },
  ];

  // Image popup handlers
  const openImagePopup = (src, title, alt = 'Image') => {
    setImagePopup({ visible: true, src, title, alt });
  };

  const closeImagePopup = () => {
    setImagePopup({ visible: false, src: '', title: '', alt: '' });
  };

  useEffect(() => {
    if (companyData && visible) {
      setFormData({
        companyName: companyData.company_name || '',
        land_mark: companyData.land_mark || '',
        phone_no: companyData.phone_no || '',
        email_id: companyData.email_id || '',
        bank_name: companyData.bank_name || '',
        account_no: companyData.account_no || '',
        IFSC_code: companyData.IFSC_code || '',
        gst_number: companyData.gst_number || '',
        pan_number: companyData.pan_number || '',
        logo: companyData.logo || '',
        sign: companyData.sign || '',
        paymentQRCode: companyData.paymentQRCode || '',
        appMode: companyData.appMode || 'advance',
        tal: companyData.Tal ,
        dist: companyData.Dist ,
        pincode: companyData.pincode || '',
        initials: companyData.initials || '',

      });
      
      setImagePreviews({
  logo: companyData.logo ? `/img/${companyData.logo}` : '',
  sign: companyData.sign ? `/img/${companyData.sign}` : '',
  paymentQRCode: companyData.paymentQRCode ? `/img/${companyData.paymentQRCode}` : '',
});

      
      setValidated(false);
      setFormErrors({
        phone_no: '',
        email_id: '',
      });
    }
  }, [companyData, visible]);

  const handleChange = (event) => {
    const { name, value, files } = event.target;
    if (files && files.length > 0) {
      const file = files[0];
      setFormData({ ...formData, [name]: file });
      
      // Create preview for image files
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreviews(prev => ({
            ...prev,
            [name]: e.target.result
          }));
        };
        reader.readAsDataURL(file);
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleRemoveImage = (imageType) => {
    setFormData({ ...formData, [imageType]: '' });
    setImagePreviews(prev => ({ ...prev, [imageType]: '' }));
    
    // Clear the file input
    if (imageType === 'logo' && logoInputRef.current) {
      logoInputRef.current.value = '';
    } else if (imageType === 'sign' && signInputRef.current) {
      signInputRef.current.value = '';
    } else if (imageType === 'paymentQRCode' && paymentQRCodeInputRef.current) {
      paymentQRCodeInputRef.current.value = '';
    }
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

    try {
      // Handle file uploads for logo, sign, and paymentQRCode
      let updatedData = { ...formData };

      if (formData.logo instanceof File) {
        const logoData = new FormData();
        logoData.append('file', formData.logo);
        logoData.append('dest', 'invoice');
        const responseLogo = await postFormData('/api/fileUpload', logoData);
        updatedData.logo = responseLogo.fileName;
      }

      if (formData.sign instanceof File) {
        const signData = new FormData();
        signData.append('file', formData.sign);
        signData.append('dest', 'invoice');
        const responseSign = await postFormData('/api/fileUpload', signData);
        updatedData.sign = responseSign.fileName;
      }

      if (formData.paymentQRCode instanceof File) {
        const paymentQRCodeData = new FormData();
        paymentQRCodeData.append('file', formData.paymentQRCode);
        paymentQRCodeData.append('dest', 'invoice');
        const responseQRCode = await postFormData('/api/fileUpload', paymentQRCodeData);
        updatedData.paymentQRCode = responseQRCode.fileName;
      }

      // Prepare the data object with correct field names
      const updatePayload = {
        company_name: updatedData.companyName,
        land_mark: updatedData.land_mark,
        tal: updatedData.tal,
        dist: updatedData.dist,
        pincode: updatedData.pincode,
        phone_no: updatedData.phone_no,
        email_id: updatedData.email_id,
        bank_name: updatedData.bank_name || '',
        account_no: updatedData.account_no || '',
        IFSC_code: updatedData.IFSC_code || '',
        gst_number: updatedData.gst_number|| '',
        pan_number: updatedData.pan_number|| '',
        logo: updatedData.logo || '',
        sign: updatedData.sign || '',
        paymentQRCode: updatedData.paymentQRCode || '',
        appMode: updatedData.appMode || 'advance',
        initials:updatedData.initials || 'INV',
      };

      console.log('Update payload:', updatePayload);

      // Submit the updated company data
      const response = await put(`/api/company/${companyData.company_id}`, updatePayload);

      showToast('success', 'Company details updated successfully.');
      setVisible(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error updating company:', error);
      showToast('danger', 'Error occurred: ' + (error.response?.data?.message || error.message));
    }
  };

  // Enhanced ImagePreview component with better styling
  const ImagePreview = ({ src, alt, onRemove, label }) => (
    <div className="image-preview-container mt-2">
      {src ? (
        <div className="d-flex align-items-center gap-2 p-2 bg-light rounded">
          <button
            type="button"
            className="btn btn-link p-0 text-primary"
            style={{ 
              fontSize: '14px',
              textDecoration: 'none'
            }}
            onClick={() => openImagePopup(src, `${label} Preview`, `${label} image`)}
            title={`View ${label}`}
          >
            <i className="fas fa-eye me-1"></i>
            View {label}
          </button>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            style={{ 
              fontSize: '12px',
              padding: '4px 8px'
            }}
            onClick={onRemove}
            title={`Remove ${label}`}
          >
            <i className="fas fa-trash me-1"></i>
            Remove
          </button>
        </div>
      ) : (
        <div className="text-muted small fst-italic mt-1">
          <i className="fas fa-image me-1"></i>
          No {label.toLowerCase()} selected
        </div>
      )}
    </div>
  );

  return (
    <>
      <CModal
        visible={visible}
        onClose={() => setVisible(false)}
        size="xl"
        backdrop="static"
      >
        <CModalHeader>
          <CModalTitle>{t("LABELS.edit_company")}: {companyData?.company_name}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm noValidate validated={validated} onSubmit={handleSubmit} encType='multipart/form-data'>
            <div className='row'>
              <div className='col-sm-4'>
                <div className='mb-3'>
                  <CFormLabel htmlFor="companyName">{t("LABELS.company_name")}</CFormLabel>
                  <CFormInput
                    type='text'
                    name='companyName'
                    id='companyName'
                    maxLength="32"
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
                    maxLength="32"
                    value={formData.land_mark}
                    onChange={handleChange}
                    feedbackInvalid="Please provide shop address."
                    required
                  />
                </div>
              </div>
            </div>

            {/* Taluka, District, Pincode Row */}
            <div className='row'>
              <div className='col-sm-4'>
                <div className='mb-3'>
                  <CFormLabel htmlFor="tal">{t("LABELS.taluka") || "Taluka"}</CFormLabel>
                  <CFormInput
                    type='text'
                    name='tal'
                    id='tal'
                    maxLength="50"
                    value={formData.tal}
                    onChange={handleChange}
                    feedbackInvalid="Please provide taluka."
                    required
                  />
                </div>
              </div>
              <div className='col-sm-4'>
                <div className='mb-3'>
                  <CFormLabel htmlFor="dist">{t("LABELS.district") || "District"}</CFormLabel>
                  <CFormInput
                    type='text'
                    name='dist'
                    id='dist'
                    maxLength="50"
                    value={formData.dist}
                    onChange={handleChange}
                    feedbackInvalid="Please provide district."
                    required
                  />
                </div>
              </div>
              <div className='col-sm-4'>
                <div className='mb-3'>
                  <CFormLabel htmlFor="pincode">{t("LABELS.pincode") || "Pincode"}</CFormLabel>
                  <CFormInput
                    type='text'
                    name='pincode'
                    id='pincode'
                    maxLength="6"
                    minLength="6"
                    pattern="[0-9]{6}"
                    value={formData.pincode}
                    onChange={handleChange}
                    feedbackInvalid="Please provide valid 6-digit pincode."
                    required
                  />
                </div>
              </div>
            </div>
            
            {/* Phone and Email Row */}
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
                    feedbackInvalid={formErrors.phone_no !== '' ? formErrors.phone_no : "Please provide valid 10 digit mobile."}
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
                    feedbackInvalid={formErrors.email_id !== '' ? formErrors.email_id : "Please provide email address."}
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

            </div>

            {/* Bank Details Row */}
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
                  <CFormLabel htmlFor="IFSC_code">{t("LABELS.IFSC")}</CFormLabel>
                  <CFormInput
                    type='text'
                    name='IFSC_code'
                    id='IFSC_code'
                    value={formData.IFSC_code}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>





               <div className='row'>
                              <div className='col-sm-4'>
                                <div className='mb-3'>
                                  <CFormLabel htmlFor="GST Number">{t("LABELS.gst_number")}</CFormLabel>
                                  <CFormInput
                                    type='text'
                                    name='gst_number'
                                    id='gst_number'
                                    value={formData.gst_number}
                                    onChange={handleChange}
                                  />
                                </div>
                              </div>
                              <div className='col-sm-4'>
                                <div className='mb-3'>
                                  <CFormLabel htmlFor="Pan Number">{t("LABELS.pan_number")}</CFormLabel>
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





            
            {/* Image Upload Section with Enhanced Previews */}
            <div className='row'>
              <div className='col-sm-4'>
                <div className='mb-3'>
                  <CFormLabel htmlFor="logo">{t("LABELS.logo")}</CFormLabel>
                  <CFormInput
                    type='file'
                    name='logo'
                    id='logo'
                    accept='image/png, image/jpeg'
                    onChange={handleChange}
                    ref={logoInputRef}
                  />
                  <ImagePreview 
                    src={imagePreviews.logo} 
                    alt="Logo Preview" 
                    onRemove={() => handleRemoveImage('logo')}
                    label="Logo"
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
                    accept='image/png, image/jpeg'
                    onChange={handleChange}
                    ref={signInputRef}
                  />
                  <ImagePreview 
                    src={imagePreviews.sign} 
                    alt="Signature Preview" 
                    onRemove={() => handleRemoveImage('sign')}
                    label="Signature"
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
                    accept='image/png, image/jpeg'
                    onChange={handleChange}
                    ref={paymentQRCodeInputRef}
                  />
                  <ImagePreview 
                    src={imagePreviews.paymentQRCode} 
                    alt="QR Code Preview" 
                    onRemove={() => handleRemoveImage('paymentQRCode')}
                    label="QR Code"
                  />
                </div>
              </div>
            </div>
            
            <div className="d-flex gap-2">
              <CButton type="submit" color="primary">
                <i className="fas fa-save me-1"></i>
                {t("LABELS.update")}
              </CButton>
              <CButton 
                type="button" 
                color="secondary" 
                variant="outline"
                onClick={() => setVisible(false)}
              >
                <i className="fas fa-times me-1"></i>
                {t("LABELS.cancel")}
              </CButton>
            </div>
          </CForm>
        </CModalBody>
      </CModal>
      
      {/* Image Popup Modal */}
      <ImagePopup 
        visible={imagePopup.visible}
        onClose={closeImagePopup}
        src={imagePopup.src}
        title={imagePopup.title}
        alt={imagePopup.alt}
      />
    </>
  );
};

export default EditCompanyModal;