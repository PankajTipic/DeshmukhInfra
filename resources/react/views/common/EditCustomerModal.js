import { CButton, CForm, CFormInput, CFormLabel, CFormSelect, CFormTextarea, CModal, CModalBody, CModalHeader, CModalTitle } from '@coreui/react'
import { getUserData } from '../../util/session'
import { useEffect, useState } from 'react'
import { getAPICall, put } from '../../util/api'
import { useToast } from '../common/toast/ToastContext'
import { useTranslation } from 'react-i18next'

export default function EditCustomerModal({ visible, setVisible, onSuccess, customer }) {
  const user = getUserData()
  const { showToast } = useToast();
  const { t } = useTranslation("global")
  
  const [state, setState] = useState({
    id: null,
    name: '',
    mobile: '',
    discount: 0,
    company_id: 0,
    show: true,
    address: '',
    start_date: '',
    end_date: '',
  })

  const [companyList, setCompanyList] = useState([])
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (visible) {
      // Load company list
      getAPICall('/api/company').then((resp) => {
        if (resp) {
          const mappedList = resp.map(itm => ({ label: itm.company_name, value: itm.company_id }));
          if (user.type === 0) {
            setCompanyList(mappedList);
          } else {
            setCompanyList(mappedList.filter(e => e.value === user.company_id));
          }
        }
      })

      // Set customer data if available
      if (customer) {
        setState({
          id: customer.id,
          name: customer.name || '',
          mobile: customer.mobile || '',
          discount: customer.discount || 0,
          company_id: customer.company_id || user?.company_id,
          show: customer.show !== undefined ? customer.show : true,
          address: customer.address || '',
          start_date: customer.start_date || '',
          end_date: customer.end_date || '',
        })
      }
      
      // Clear errors when modal opens
      setErrors({})
    }
  }, [visible, customer, user.type, user.company_id])

  // Validation functions
  const validateName = (name) => {
    if (!name || name.trim().length === 0) {
      return t("MSG.project_name_is_required_msg") || "Project name is required"
    }
    if (name.trim().length < 2) {
      return t("MSG.project_name_min_length") || "Project name must be at least 2 characters long"
    }
    if (name.trim().length > 50) {
      return t("MSG.project_name_max_length") || "Project name must not exceed 50 characters"
    }
    if (!/^[a-zA-Z\u0900-\u097F\s.'-]+$/.test(name.trim())) {
      return t("MSG.project_name_invalid_chars") || "Project name can only contain English letters, Marathi characters, spaces, dots, apostrophes, and hyphens"
    }
    return null
  }

  const validateMobile = (mobile) => {
    if (!mobile || mobile.trim().length === 0) {
      return t("MSG.mobile_number_is_required_msg") || "Mobile number is required"
    }
    if (!/^\d{10}$/.test(mobile.trim())) {
      return t("MSG.please_provide_mobile_number_msg") || "Please provide a valid 10-digit mobile number"
    }
    if (/^(\d)\1{9}$/.test(mobile.trim())) {
      return t("MSG.mobile_all_same_digits") || "Mobile number cannot have all same digits"
    }
    if (mobile.trim().startsWith('0') || mobile.trim().startsWith('1') || mobile.trim().startsWith('2')) {
      return t("MSG.mobile_invalid_start") || "Mobile number should start with digits 3-9"
    }
    return null
  }

  const validateDiscount = (discount) => {
    if (discount === '' || discount === null || discount === undefined) {
      return null
    }
    const discountNum = parseFloat(discount)
    if (isNaN(discountNum)) {
      return t("MSG.discount_not_number") || "Discount must be a valid number"
    }
    if (discountNum < 0) {
      return t("MSG.discount_negative") || "Discount cannot be negative"
    }
    if (discountNum > 100) {
      return t("MSG.discount_exceed") || "Discount cannot exceed 100%"
    }
    return null
  }

  const validateAddress = (address) => {
    if (address && address.length > 500) {
      return t("MSG.address_max_length") || "Address must not exceed 500 characters"
    }
    return null
  }

  const validateDate = (date, fieldName) => {
    if (!date || date.trim().length === 0) {
      return null
    }
    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) {
      return t(`MSG.${fieldName}_invalid`, `${fieldName} is invalid`) || `${fieldName} is invalid`
    }
    return null
  }

  const validateForm = () => {
    const newErrors = {}
    
    const nameError = validateName(state.name)
    if (nameError) newErrors.name = nameError

    const mobileError = validateMobile(state.mobile)
    if (mobileError) newErrors.mobile = mobileError

    const discountError = validateDiscount(state.discount)
    if (discountError) newErrors.discount = discountError

    const addressError = validateAddress(state.address)
    if (addressError) newErrors.address = addressError

    const startDateError = validateDate(state.start_date, 'start_date')
    if (startDateError) newErrors.start_date = startDateError

    const endDateError = validateDate(state.end_date, 'end_date')
    if (endDateError) newErrors.end_date = endDateError

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setState({ ...state, [name]: value })

    if (errors[name]) {
      const newErrors = { ...errors }
      delete newErrors[name]
      setErrors(newErrors)

      setTimeout(() => {
        let fieldError = null
        switch (name) {
          case 'name':
            fieldError = validateName(value)
            break
          case 'mobile':
            fieldError = validateMobile(value)
            break
          case 'discount':
            fieldError = validateDiscount(value)
            break
          case 'address':
            fieldError = validateAddress(value)
            break
          case 'start_date':
            fieldError = validateDate(value, 'start_date')
            break
          case 'end_date':
            fieldError = validateDate(value, 'end_date')
            break
        }
        if (fieldError) {
          setErrors(prev => ({ ...prev, [name]: fieldError }))
        }
      }, 500)
    }
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      showToast('danger', t('MSG.check_fields_before_submit') || 'Please fix the validation errors before submitting')
      return
    }

    setIsSubmitting(true)

    let data = { 
      name: state.name?.trim(),
      mobile: state.mobile?.trim(),
      discount: state.discount || 0,
      company_id: state.company_id,
      show: state.show,
      address: state.address?.trim(),
      start_date: state.start_date,
      end_date: state.end_date
    }
    
    try {
      const resp = await put('/api/customer/' + data.id, data)
      if (resp?.id) {
        showToast('success', t("MSG.data_updated_successfully_msg") || 'Project updated successfully')
        onSuccess(resp)
        setVisible(false)
        handleClear()
      } else {
        showToast('danger', t("MSG.failed_to_update_project") || 'Failed to update project')
      }
    } catch (error) {
      if (error.response?.data?.message) {
        showToast('danger', error.response.data.message)
      } else if (error.message?.includes('mobile')) {
        setErrors({ mobile: t("MSG.mobile_already_taken") || 'This mobile number is already registered' })
        showToast('danger', t("MSG.mobile_already_taken") || 'Mobile number already exists')
      } else {
        showToast('danger', t("MSG.error_occurred") || 'Error occurred: ' + error.message)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClear = () => {
    setState({
      id: null,
      name: '',
      mobile: '',
      discount: 0,
      company_id: user?.company_id || 0,
      show: true,
      address: '',
      start_date: '',
      end_date: ''
    })
    setErrors({})
  }

  const handleClose = () => {
    handleClear()
    setVisible(false)
  }
  
  return (
    <>
      <CModal
        backdrop="static"
        visible={visible}
        onClose={handleClose}
        aria-labelledby="EditCustomerModalLabel"
        size="md"
      >
        <CModalHeader>
          <CModalTitle id="EditCustomerModalLabel">{t("LABELS.edit_project") || "Edit Project"}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm className="needs-validation" noValidate onSubmit={handleSubmit}>
            {/* Name Field */}
            <div className="mb-3">
              <CFormLabel htmlFor="edit-pname">
                {t("LABELS.project_name") || "Project Name"} <span className="text-danger">*</span>
              </CFormLabel>
              <CFormInput
                type="text"
                id="edit-pname"
                placeholder={t('MSG.enter_project_name_msg') || "Enter project name"}
                name="name"
                value={state.name || ''}
                onChange={handleChange}
                invalid={!!errors.name}
                valid={!errors.name && state.name && state.name.trim().length > 0}
                maxLength={50}
              />
              {errors.name && (
                <div className="invalid-feedback d-block">
                  {errors.name}
                </div>
              )}
            </div>

            {/* Mobile Field */}
            <div className="mb-3">
              <CFormLabel htmlFor="edit-plmobile">
                {t("LABELS.mobile_number") || "Mobile Number"} <span className="text-danger">*</span>
              </CFormLabel>
              <CFormInput
                type="tel"
                id="edit-plmobile"
                placeholder={t("MSG.enter_mob_no_msg") || "Enter mobile number"}
                name="mobile"
                value={state.mobile || ''}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 10)
                  handleChange({ target: { name: 'mobile', value } })
                }}
                invalid={!!errors.mobile}
                valid={!errors.mobile && state.mobile && /^\d{10}$/.test(state.mobile)}
                maxLength={10}
                autoComplete='off'
              />
              {errors.mobile && (
                <div className="invalid-feedback d-block">
                  {errors.mobile}
                </div>
              )}
              {state.mobile && state.mobile.length > 0 && state.mobile.length < 10 && !errors.mobile && (
                <div className="form-text">
                  {10 - state.mobile.length} more digits required
                </div>
              )}
            </div>

            {/* Address Field */}
            <div className="mb-3">
              <CFormLabel htmlFor="edit-address">{t("LABELS.address") || "Address"}</CFormLabel>
              <CFormTextarea
                id="edit-address"
                rows={3}
                name="address"
                value={state.address || ''}
                onChange={handleChange}
                placeholder={t("MSG.enter_address") || "Enter project address (optional)"}
                invalid={!!errors.address}
                maxLength={500}
              />
              {errors.address && (
                <div className="invalid-feedback d-block">
                  {errors.address}
                </div>
              )}
              {state.address && (
                <div className="form-text">
                  {state.address.length}/500 characters
                </div>
              )}
            </div>

            {/* Start Date Field */}
            <div className="mb-3">
              <CFormLabel htmlFor="edit-start_date">{t("LABELS.start_date") || "Start Date"}</CFormLabel>
              <CFormInput
                type="date"
                id="edit-start_date"
                name="start_date"
                value={state.start_date || ''}
                onChange={handleChange}
                invalid={!!errors.start_date}
                valid={!errors.start_date && state.start_date?.trim().length > 0}
              />
              {errors.start_date && (
                <div className="invalid-feedback d-block">
                  {errors.start_date}
                </div>
              )}
            </div>

            {/* End Date Field */}
            <div className="mb-3">
              <CFormLabel htmlFor="edit-end_date">{t("LABELS.end_date") || "End Date"}</CFormLabel>
              <CFormInput
                type="date"
                id="edit-end_date"
                name="end_date"
                value={state.end_date || ''}
                onChange={handleChange}
                invalid={!!errors.end_date}
                valid={!errors.end_date && state.end_date?.trim().length > 0}
              />
              {errors.end_date && (
                <div className="invalid-feedback d-block">
                  {errors.end_date}
                </div>
              )}
            </div>

            <div className="d-flex justify-content-end gap-2">
              <CButton 
                color="success" 
                type="submit"
                disabled={isSubmitting || Object.keys(errors).length > 0}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    {t("LABELS.updating") || "Updating..."}
                  </>
                ) : (
                  t("LABELS.update") || "Update"
                )}
              </CButton>
              <CButton 
                color="secondary" 
                onClick={handleClose}
                disabled={isSubmitting}
              >
                {t("LABELS.close") || "Close"}
              </CButton>
            </div>
          </CForm>
        </CModalBody>
      </CModal>
    </>
  )
}