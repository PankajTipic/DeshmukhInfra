import { CAlert, CButton, CForm, CFormInput, CFormLabel, CFormTextarea, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle, CRow } from '@coreui/react'
import { getUserData } from '../../util/session'
import { useEffect, useState } from 'react'
import { post } from '../../util/api'
import { useToast } from '../common/toast/ToastContext'
import { useTranslation } from 'react-i18next'

export default function NewCustomerModal({ visible, hint, setVisible, onSuccess }) {
  const user = getUserData()
  const { showToast } = useToast();
  const { t } = useTranslation("global")

  const [state, setState] = useState({
    name: hint,
    mobile: '',
    discount: 0,
    company_id: user?.company_id,
    show: true,
    address: '',
    start_date: '',
    end_date: '',
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (visible) {
      const regex = /^\d+$/;
      if (regex.test(hint?.trim())) {
        setState({ ...state, mobile: hint.trim() })
      } else {
        setState({ ...state, name: hint?.trim() })
      }
      setErrors({})
    }
  }, [hint, visible])

  const validateName = (name) => {
    if (!name || name.trim().length === 0) {
      return t("MSG.project_name_is_required_msg")
    }
    if (name.trim().length < 2) {
      return t("MSG.project_name_min_length")
    }
    if (name.trim().length > 50) {
      return t("MSG.project_name_max_length")
    }
    if (!/^[a-zA-Z\u0900-\u097F\s.'-]+$/.test(name.trim())) {
      return t("MSG.project_name_invalid_chars")
    }
    return null
  }

  const validateMobile = (mobile) => {
    if (!mobile || mobile.trim().length === 0) {
      return t("MSG.mobile_number_is_required_msg")
    }
    if (!/^\d{10}$/.test(mobile.trim())) {
      return t("MSG.please_provide_mobile_number_msg")
    }
    if (/^(\d)\1{9}$/.test(mobile.trim())) {
      return t("MSG.mobile_all_same_digits")
    }
    if (/^[0-2]/.test(mobile.trim())) {
      return t("MSG.mobile_invalid_start")
    }
    return null
  }

  const validateDiscount = (discount) => {
    if (discount === '' || discount === null || discount === undefined) {
      return null
    }
    const discountNum = parseFloat(discount)
    if (isNaN(discountNum)) {
      return t("MSG.discount_not_number")
    }
    if (discountNum < 0) {
      return t("MSG.discount_negative")
    }
    if (discountNum > 100) {
      return t("MSG.discount_exceed")
    }
    return null
  }

  const validateAddress = (address) => {
    if (address && address.length > 500) {
      return t("MSG.address_max_length")
    }
    return null
  }

  const validateDate = (date, fieldName) => {
    if (!date || date.trim().length === 0) {
      return null
    }
    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) {
      return t(`MSG.${fieldName}_invalid`, `${fieldName} is invalid`)
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
          case 'name': fieldError = validateName(value); break
          case 'mobile': fieldError = validateMobile(value); break
          case 'discount': fieldError = validateDiscount(value); break
          case 'address': fieldError = validateAddress(value); break
          case 'start_date': fieldError = validateDate(value, 'start_date'); break
          case 'end_date': fieldError = validateDate(value, 'end_date'); break
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
      showToast('danger', t('MSG.check_fields_before_submit'))
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
      const resp = await post('/api/customer', data)
      if (resp?.id) {
        showToast('success', t("MSG.data_saved_successfully_msg"))
        onSuccess(resp)
        setVisible(false)
        handleClear()
      } else {
        showToast('danger', t("MSG.failed_to_create_project"))
      }
    } catch (error) {
      const backendErrors = error.response?.data?.errors
      if (backendErrors?.mobile?.length > 0) {
        const message = backendErrors.mobile[0]
        setErrors({ mobile: message })
        showToast('danger', message)
      } else if (error.response?.data?.message) {
        showToast('danger', error.response.data.message)
      } else {
        showToast('danger', t("MSG.mobile_already_taken"))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClear = () => {
    setState({
      name: '',
      mobile: '',
      discount: 0,
      company_id: state.company_id,
      show: true,
      address: '',
      start_date: '',
      end_date: '',
    })
    setErrors({})
  }

  return (
    <CModal backdrop="static" visible={visible} onClose={() => {handleClear();setVisible(false);}}>
      <CModalHeader>
        <CModalTitle>{t("LABELS.new_project")}</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CForm onSubmit={handleSubmit}>
          <div className="mb-3">
            <CFormLabel htmlFor="pname">{t("LABELS.project_name")} <span className="text-danger">*</span></CFormLabel>
            <CFormInput
              type="text"
              id="pname"
              name="name"
              placeholder={t('MSG.enter_project_name_msg')}
              value={state.name || ''}
              onChange={handleChange}
              invalid={!!errors.name}
              valid={!errors.name && state.name?.trim().length > 0}
              maxLength={50}
            />
            {errors.name && <div className="invalid-feedback d-block">{errors.name}</div>}
          </div>

          <div className="mb-3">
            <CFormLabel htmlFor="plmobile">{t("LABELS.mobile_number")} <span className="text-danger">*</span></CFormLabel>
            <CFormInput
              type="tel"
              id="plmobile"
              name="mobile"
              placeholder={t("MSG.enter_mob_no_msg")}
              value={state.mobile || ''}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 10)
                handleChange({ target: { name: 'mobile', value } })
              }}
              invalid={!!errors.mobile}
              valid={!errors.mobile && /^\d{10}$/.test(state.mobile)}
              maxLength={10}
              autoComplete='off'
            />
            {errors.mobile && <div className="invalid-feedback d-block">{errors.mobile}</div>}
            {state.mobile && state.mobile.length > 0 && state.mobile.length < 10 && !errors.mobile && (
              <div className="form-text">{10 - state.mobile.length} more digits required</div>
            )}
          </div>

          <div className="mb-3">
            <CFormLabel htmlFor="address">{t("LABELS.address")}</CFormLabel>
            <CFormTextarea
              id="address"
              rows={3}
              name="address"
              value={state.address || ''}
              onChange={handleChange}
              placeholder={t("MSG.enter_address")}
              invalid={!!errors.address}
              maxLength={500}
            />
            {errors.address && <div className="invalid-feedback d-block">{errors.address}</div>}
            {state.address && (
              <div className="form-text">{state.address.length}/500 characters</div>
            )}
          </div>

          <div className="mb-3">
            <CFormLabel htmlFor="start_date">{t("LABELS.start_date")}</CFormLabel>
            <CFormInput
              type="date"
              id="start_date"
              name="start_date"
              value={state.start_date || ''}
              onChange={handleChange}
              invalid={!!errors.start_date}
              valid={!errors.start_date && state.start_date?.trim().length > 0}
            />
            {errors.start_date && <div className="invalid-feedback d-block">{errors.start_date}</div>}
          </div>

          <div className="mb-3">
            <CFormLabel htmlFor="end_date">{t("LABELS.end_date")}</CFormLabel>
            <CFormInput
              type="date"
              id="end_date"
              name="end_date"
              value={state.end_date || ''}
              onChange={handleChange}
              invalid={!!errors.end_date}
              valid={!errors.end_date && state.end_date?.trim().length > 0}
            />
            {errors.end_date && <div className="invalid-feedback d-block">{errors.end_date}</div>}
          </div>
        </CForm>
      </CModalBody>
      <CModalFooter className="d-flex justify-content-end gap-2">
        <CButton color="success" onClick={handleSubmit} disabled={isSubmitting || Object.keys(errors).length > 0}>
          {isSubmitting ? (<><span className="spinner-border spinner-border-sm me-2"></span>{t("LABELS.saving")}</>) : t("LABELS.submit")}
        </CButton>
        <CButton color="secondary" onClick={() => {handleClear();setVisible(false);}} disabled={isSubmitting}>
          {t("LABELS.close")}
        </CButton>
      </CModalFooter>
    </CModal>
  )
}