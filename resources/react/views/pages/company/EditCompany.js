import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
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
import { getAPICall, postFormData, put } from '../../../util/api';
import { useToast } from '../../common/toast/ToastContext';
import { useTranslation } from 'react-i18next';

function EditCompany() {
  const { companyId } = useParams();
  const { showToast } = useToast();
  const { t } = useTranslation("global");
  
  const [formData, setFormData] = useState({
    companyName: '',
    land_mark: '',
    Tal: '',
    Dist: '',
    Pincode: '',
    phone_no: '',
    email_id: '',
    bank_name: '',
    account_no: '',
    IFSC: '',
    gst_number: '', // New field for GST number
    pan_number: '', // New field for PAN number
    logo: '',
    sign: '',
    paymentQRCode: '',
    appMode: 'basic',
  });

  const [formErrors, setFormErrors] = useState({
    phone_no: '',
    email_id: '',
  });

  const logoInputRef = useRef(null);
  const signInputRef = useRef(null);
  const paymentQRCodeInputRef = useRef(null);
  const [validated, setValidated] = useState(false);

  const appModes = [
    { label: 'Basic', value: 'basic' },
    // { label: 'Balance', value: 'balance' },
    { label: 'Advance', value: 'advance' },
  ];

  // Fetch existing company details
  const fetchCompanyDetails = async () => {
    try {
      const response = await getAPICall(`/api/company/${companyId}`);
      
      setFormData({
        companyName: response.company_name || '',
        land_mark: response.land_mark || '',
        Tal: response.Tal || '',
        Dist: response.Dist || '',
        Pincode:'-1',
        phone_no: response.phone_no || '',
        email_id: response.email_id || '',
        bank_name: response.bank_name || '',
        account_no: response.account_no || '',
        IFSC: response.IFSC_code || '',
        gst_number: response.gst_number || '', // Set GST number
        pan_number: response.pan_number || '', // Set PAN number
        logo: response.logo || '',
        sign: response.sign || '',
        paymentQRCode: response.paymentQRCode || '',
        appMode: response.appMode || 'basic',
      });
    } catch (error) {
      console.error('Error fetching company details:', error);
      showToast('danger', 'Failed to fetch company details.');
    }
  };

  useEffect(() => {
    if (companyId) {
      fetchCompanyDetails();
    }
  }, [companyId]);

  const handleChange = (event) => {
    const { name, value, files } = event.target;
    if (files && files.length > 0) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const prepareFormData = async () => {
    try {
      let finalData = {...formData};

      if(formData.logo instanceof File){
        const logoData = new FormData();
        logoData.append("file", formData.logo);
        logoData.append("dest", "invoice");
        const responseLogo = await postFormData('/api/fileUpload', logoData);
        const logoPath = responseLogo.fileName;
        if(logoPath){
          finalData.logo = logoPath;
        }
      }
       
      if(formData.sign instanceof File){
        const signData = new FormData();
        signData.append("file", formData.sign);
        signData.append("dest", "invoice");
        const responseSign = await postFormData('/api/fileUpload', signData);
        const signPath = responseSign.fileName;
        if(signPath){
          finalData.sign = signPath;
        }
      }

      if(formData.paymentQRCode instanceof File){
        const paymentQRCodeData = new FormData();
        paymentQRCodeData.append("file", formData.paymentQRCode);
        paymentQRCodeData.append("dest", "invoice");
        const responsePaymentQRCode = await postFormData('/api/fileUpload', paymentQRCodeData);
        const paymentQRCodePath = responsePaymentQRCode.fileName;
        if(paymentQRCodePath){
          finalData.paymentQRCode = paymentQRCodePath;
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
    
    if (form.checkValidity() !== true) {
      showToast('danger', 'Kindly provide data of all required fields');
      return;
    }

    try {
      // First prepare data by uploading files
      const preparedFormData = await prepareFormData();
      if (!preparedFormData) {
        showToast('danger', 'Failed to prepare form data');
        return;
      }

      // Submit the updated company data
      const response = await put(`/api/company/${companyId}`, preparedFormData);
      showToast('success', 'Company details updated successfully.');
    } catch (error) {
      console.error('Error updating company:', error);
      showToast('danger', 'Error occurred: ' + (error.message || 'Unknown error'));
    }
  };

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className='mb-3'>
          <CCardHeader>
            <strong>{t("LABELS.edit_shop")}</strong>
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
                    <CFormLabel htmlFor="land_mark">{t("LABELS.address")}</CFormLabel>
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
                </div>
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
                    {typeof formData.logo === 'string' && formData.logo && (
                      <small className="text-muted">Current file: {formData.logo}</small>
                    )}
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
                    {typeof formData.sign === 'string' && formData.sign && (
                      <small className="text-muted">Current file: {formData.sign}</small>
                    )}
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
                    {typeof formData.paymentQRCode === 'string' && formData.paymentQRCode && (
                      <small className="text-muted">Current file: {formData.paymentQRCode}</small>
                    )}
                  </div>
                </div>
              </div>
              <CButton type="submit" color="primary">{t("LABELS.update")}</CButton>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
}

export default EditCompany;