import React, { useState, useEffect, useRef } from 'react';
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
  CAlert,
  CSpinner
} from '@coreui/react';
import { getAPICall, postFormData, put } from '../../../util/api';
import { useToast } from '../../common/toast/ToastContext';
import { useTranslation } from 'react-i18next';
import { getUserData } from '../../../util/session';
import ImagePopup from './ImagePopup';

function CompanyInfo() {
  const { showToast } = useToast();
  const { t } = useTranslation("global");
  const user = getUserData();
  const isAdmin = user?.type === 1 || user?.type === 0;

  const [loading, setLoading] = useState(true);
  const [validated, setValidated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [companyId, setCompanyId] = useState(null);

  const [formData, setFormData] = useState({
    companyName: '',
    land_mark: '',
    tal: '',
    dist: '',
    pincode: '',
    phone_no: '',
    email_id: '',
    bank_name: '',
    account_no: '',
    IFSC_code: '',
    gst_number: '',
    pan_number: '',
    logo: '',
    sign: '',
    paymentQRCode: '',
    appMode: 'advance',
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

  const openImagePopup = (src, title, alt = 'Image') => {
    setImagePopup({ visible: true, src, title, alt });
  };

  const closeImagePopup = () => {
    setImagePopup({ visible: false, src: '', title: '', alt: '' });
  };

  const handleRemoveImage = (field) => {
    setFormData(prev => ({ ...prev, [field]: '' }));
    setImagePreviews(prev => ({ ...prev, [field]: '' }));
    if (field === 'logo' && logoInputRef.current) logoInputRef.current.value = '';
    if (field === 'sign' && signInputRef.current) signInputRef.current.value = '';
    if (field === 'paymentQRCode' && paymentQRCodeInputRef.current) paymentQRCodeInputRef.current.value = '';
  };

  const fetchCompanyDetails = async () => {
    setLoading(true);
    try {
      let compId = user?.company_id || user?.company_info?.company_id;

      if (!compId) {
        // Fallback: fetch from /api/companies which returns the company for this user
        const companies = await getAPICall('/api/companies');
        if (Array.isArray(companies) && companies.length > 0) {
          compId = companies[0].company_id;
        }
      }

      if (!compId) {
        showToast('danger', 'No company associated with this account.');
        setLoading(false);
        return;
      }

      setCompanyId(compId);
      const response = await getAPICall(`/api/company/${compId}`);

      setFormData({
        companyName: response.company_name || '',
        land_mark: response.land_mark || '',
        tal: response.Tal || '',
        dist: response.Dist || '',
        pincode: response.pincode === '-1' ? '' : (response.pincode || ''),
        phone_no: response.phone_no || '',
        email_id: response.email_id || '',
        bank_name: response.bank_name || '',
        account_no: response.account_no || '',
        IFSC_code: response.IFSC_code || response.ifsc_code || '',
        gst_number: response.gst_number || '',
        pan_number: response.pan_number || '',
        logo: response.logo || '',
        sign: response.sign || '',
        paymentQRCode: response.paymentQRCode || '',
        appMode: response.appMode || 'advance',
        initials: response.initials || '',
      });

      setImagePreviews({
        logo: response.logo ? `/img/${response.logo}` : '',
        sign: response.sign ? `/img/${response.sign}` : '',
        paymentQRCode: response.paymentQRCode ? `/img/${response.paymentQRCode}` : '',
      });
    } catch (error) {
      console.error('Error fetching company details:', error);
      showToast('danger', 'Failed to fetch company details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyDetails();
  }, []);

  const handleChange = (event) => {
    const { name, value, files } = event.target;
    if (files && files.length > 0) {
      const file = files[0];
      setFormData(prev => ({ ...prev, [name]: file }));

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
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const prepareFormData = async () => {
    try {
      let finalData = { ...formData };

      if (formData.logo instanceof File) {
        const logoData = new FormData();
        logoData.append("file", formData.logo);
        logoData.append("dest", "invoice");
        const responseLogo = await postFormData('/api/fileUpload', logoData);
        if (responseLogo.fileName) {
          finalData.logo = responseLogo.fileName;
        }
      }

      if (formData.sign instanceof File) {
        const signData = new FormData();
        signData.append("file", formData.sign);
        signData.append("dest", "invoice");
        const responseSign = await postFormData('/api/fileUpload', signData);
        if (responseSign.fileName) {
          finalData.sign = responseSign.fileName;
        }
      }

      if (formData.paymentQRCode instanceof File) {
        const paymentQRCodeData = new FormData();
        paymentQRCodeData.append("file", formData.paymentQRCode);
        paymentQRCodeData.append("dest", "invoice");
        const responsePaymentQRCode = await postFormData('/api/fileUpload', paymentQRCodeData);
        if (responsePaymentQRCode.fileName) {
          finalData.paymentQRCode = responsePaymentQRCode.fileName;
        }
      }

      return finalData;
    } catch (error) {
      showToast('danger', 'Error uploading files: ' + error);
      console.error('Error uploading files:', error);
      return null;
    }
  };

  const handleSubmit = async (event) => {
    const form = event.currentTarget;
    event.preventDefault();
    event.stopPropagation();
    setValidated(true);

    if (!isAdmin) {
      showToast('danger', 'Only admin has permission to edit company details.');
      return;
    }

    if (form.checkValidity() !== true) {
      showToast('danger', 'Kindly provide data of all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const preparedData = await prepareFormData();
      if (!preparedData) {
        setSubmitting(false);
        return;
      }

      const updatePayload = {
        company_name: preparedData.companyName,
        land_mark: preparedData.land_mark,
        tal: preparedData.tal,
        dist: preparedData.dist,
        pincode: preparedData.pincode,
        phone_no: preparedData.phone_no,
        email_id: preparedData.email_id,
        bank_name: preparedData.bank_name || '',
        account_no: preparedData.account_no || '',
        IFSC_code: preparedData.IFSC_code || '',
        gst_number: preparedData.gst_number || '',
        pan_number: preparedData.pan_number || '',
        logo: preparedData.logo || '',
        sign: preparedData.sign || '',
        paymentQRCode: preparedData.paymentQRCode || '',
        appMode: preparedData.appMode || 'advance',
        initials: preparedData.initials || 'INV',
      };

      await put(`/api/company/${companyId}`, updatePayload);
      showToast('success', 'Company details updated successfully.');
      fetchCompanyDetails();
    } catch (error) {
      console.error('Error updating company:', error);
      showToast('danger', 'Error occurred: ' + (error.response?.data?.message || error.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  const ImagePreview = ({ src, alt, onRemove, label }) => (
    <div className="image-preview-container mt-2">
      {src ? (
        <div className="d-flex align-items-center gap-2 p-2 bg-light rounded">
          <button
            type="button"
            className="btn btn-link p-0 text-primary"
            style={{ fontSize: '14px', textDecoration: 'none' }}
            onClick={() => openImagePopup(src, `${label} Preview`, `${label} image`)}
            title={`View ${label}`}
          >
            <i className="fas fa-eye me-1"></i>
            View {label}
          </button>
          {isAdmin && (
            <button
              type="button"
              className="btn btn-danger btn-sm"
              style={{ fontSize: '12px', padding: '4px 8px' }}
              onClick={onRemove}
              title={`Remove ${label}`}
            >
              <i className="fas fa-trash me-1"></i>
              Remove
            </button>
          )}
        </div>
      ) : (
        <div className="text-muted small fst-italic mt-1">
          <i className="fas fa-image me-1"></i>
          No {label.toLowerCase()} uploaded
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="text-center my-5">
        <CSpinner color="primary" />
        <div className="mt-2">Loading company details...</div>
      </div>
    );
  }

  return (
    <>
      <CRow>
        <CCol xs={12}>
          <CCard className='mb-3 shadow-sm'>
            <CCardHeader className="d-flex justify-content-between align-items-center bg-primary text-white">

              <strong>Company Info</strong>
              <span className="badge bg-light text-primary">
                {formData.companyName || 'My Company'}
              </span>
            </CCardHeader>
            <CCardBody>


 <div
    className="mb-3 p-2 bg-light border rounded text-muted small"
    title="Company information is refreshed after login."
  >
    <i className="fas fa-info-circle me-2 text-primary"></i>
    After updating the company details, please log out and log in again
    to see the updated information across the application.
  </div>

 

              {!isAdmin && (
                <CAlert color="warning" className="d-flex align-items-center mb-3">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  <span>You have view-only access. Only Admin can edit company details.</span>
                </CAlert>
              )}

              <CForm noValidate validated={validated} onSubmit={handleSubmit} encType='multipart/form-data'>
                {/* Row 1: Company Name & Address */}
                <div className='row'>
                  <div className='col-sm-4'>
                    <div className='mb-3'>
                      <CFormLabel htmlFor="companyName">{t("LABELS.company_name") || "Company Name"}</CFormLabel>
                      <CFormInput
                        type='text'
                        name='companyName'
                        id='companyName'
                        maxLength="100"
                        value={formData.companyName}
                        onChange={handleChange}
                        disabled={!isAdmin}
                        feedbackInvalid="Please provide company name."
                        required
                      />
                    </div>
                  </div>
                  <div className='col-sm-8'>
                    <div className='mb-3'>
                      <CFormLabel htmlFor="land_mark">{t("LABELS.address_label") || "Address / Landmark"}</CFormLabel>
                      <CFormInput
                        type='text'
                        name='land_mark'
                        id='land_mark'
                        maxLength="255"
                        value={formData.land_mark}
                        onChange={handleChange}
                        disabled={!isAdmin}
                        feedbackInvalid="Please provide address."
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Row 2: Taluka, District, Pincode */}
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
                        disabled={!isAdmin}
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
                        disabled={!isAdmin}
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
                        disabled={!isAdmin}
                        feedbackInvalid="Please provide valid 6-digit pincode."
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Row 3: Mobile, Email, Initials */}
                <div className='row'>
                  <div className='col-sm-4'>
                    <div className='mb-3'>
                      <CFormLabel htmlFor="phone_no">{t("LABELS.mobile_number") || "Mobile Number"}</CFormLabel>
                      <CFormInput
                        type='text'
                        name='phone_no'
                        id='phone_no'
                        value={formData.phone_no}
                        onChange={handleChange}
                        disabled={!isAdmin}
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
                      <CFormLabel htmlFor="email_id">{t("LABELS.email") || "Email ID"}</CFormLabel>
                      <CFormInput
                        type='email'
                        name='email_id'
                        id='email_id'
                        disabled={!isAdmin}
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
                      <CFormLabel htmlFor="initials">{t("LABELS.initials") || "Invoice Prefix (Initials)"}</CFormLabel>
                      <CFormInput
                        type='text'
                        name='initials'
                        id='initials'
                        maxLength="10"
                        value={formData.initials}
                        onChange={handleChange}
                        disabled={!isAdmin}
                        placeholder="e.g. INV"
                      />
                    </div>
                  </div>
                </div>

                {/* Row 4: Bank Details */}
                <div className='row'>
                  <div className='col-sm-4'>
                    <div className='mb-3'>
                      <CFormLabel htmlFor="bank_name">{t("LABELS.bank_name") || "Bank Name"}</CFormLabel>
                      <CFormInput
                        type='text'
                        name='bank_name'
                        id='bank_name'
                        value={formData.bank_name}
                        onChange={handleChange}
                        disabled={!isAdmin}
                      />
                    </div>
                  </div>
                  <div className='col-sm-4'>
                    <div className='mb-3'>
                      <CFormLabel htmlFor="account_no">{t("LABELS.account_number") || "Account Number"}</CFormLabel>
                      <CFormInput
                        type='text'
                        name='account_no'
                        id='account_no'
                        value={formData.account_no}
                        onChange={handleChange}
                        disabled={!isAdmin}
                      />
                    </div>
                  </div>
                  <div className='col-sm-4'>
                    <div className='mb-3'>
                      <CFormLabel htmlFor="IFSC_code">{t("LABELS.IFSC") || "IFSC Code"}</CFormLabel>
                      <CFormInput
                        type='text'
                        name='IFSC_code'
                        id='IFSC_code'
                        value={formData.IFSC_code}
                        onChange={handleChange}
                        disabled={!isAdmin}
                      />
                    </div>
                  </div>
                </div>

                {/* Row 5: GST, PAN & App Mode */}
                <div className='row'>
                  <div className='col-sm-4'>
                    <div className='mb-3'>
                      <CFormLabel htmlFor="gst_number">{t("LABELS.gst_number") || "GST Number"}</CFormLabel>
                      <CFormInput
                        type='text'
                        name='gst_number'
                        id='gst_number'
                        maxLength="15"
                        value={formData.gst_number}
                        onChange={handleChange}
                        disabled={!isAdmin}
                      />
                    </div>
                  </div>
                  <div className='col-sm-4'>
                    <div className='mb-3'>
                      <CFormLabel htmlFor="pan_number">{t("LABELS.pan_number") || "PAN Number"}</CFormLabel>
                      <CFormInput
                        type='text'
                        name='pan_number'
                        id='pan_number'
                        maxLength="10"
                        value={formData.pan_number}
                        onChange={handleChange}
                        disabled={!isAdmin}
                      />
                    </div>
                  </div>
                  <div className='col-sm-4'>
                    <div className='mb-3'>
                      <CFormLabel htmlFor="appMode">{t("LABELS.app_mode") || "Application Mode"}</CFormLabel>
                      <CFormSelect
                        aria-label="Select Application Mode"
                        value={formData.appMode}
                        id="appMode"
                        name="appMode"
                        options={appModes}
                        onChange={handleChange}
                        disabled={!isAdmin}
                      />
                    </div>
                  </div>
                </div>

                {/* Row 6: Logo, Signature & QR Code */}
                <div className='row'>
                  <div className='col-sm-4'>
                    <div className='mb-3'>
                      <CFormLabel htmlFor="logo">{t("LABELS.logo") || "Company Logo"}</CFormLabel>
                      {isAdmin && (
                        <CFormInput
                          type='file'
                          name='logo'
                          id='logo'
                          accept='image/png, image/jpeg'
                          onChange={handleChange}
                          ref={logoInputRef}
                        />
                      )}
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
                      <CFormLabel htmlFor="sign">{t("LABELS.sign") || "Signature"}</CFormLabel>
                      {isAdmin && (
                        <CFormInput
                          type='file'
                          name='sign'
                          id='sign'
                          accept='image/png, image/jpeg'
                          onChange={handleChange}
                          ref={signInputRef}
                        />
                      )}
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
                      <CFormLabel htmlFor="paymentQRCode">{t("LABELS.qr_img") || "Payment QR Code"}</CFormLabel>
                      {isAdmin && (
                        <CFormInput
                          type='file'
                          name='paymentQRCode'
                          id='paymentQRCode'
                          accept='image/png, image/jpeg'
                          onChange={handleChange}
                          ref={paymentQRCodeInputRef}
                        />
                      )}
                      <ImagePreview
                        src={imagePreviews.paymentQRCode}
                        alt="QR Code Preview"
                        onRemove={() => handleRemoveImage('paymentQRCode')}
                        label="QR Code"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit button - only enabled for Admin */}
                {isAdmin && (
                  <div className="mt-3">
                    <CButton type="submit" color="primary" disabled={submitting}>
                      {submitting ? (
                        <>
                          <CSpinner size="sm" className="me-2" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save me-1"></i>
                          {t("LABELS.update") || "Update Company Info"}
                        </>
                      )}
                    </CButton>
                  </div>
                )}
              </CForm>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

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
}

export default CompanyInfo;
