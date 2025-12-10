import { CButton, CForm, CFormInput, CFormLabel, CFormTextarea, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle, CRow } from '@coreui/react'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { put } from '../../../util/api';
import { useToast } from '../../common/toast/ToastContext';

export default function EditPlanModal({ visible, setVisible, onSuccess, planData }) {
  const { showToast } = useToast();
  const { t } = useTranslation("global")
  
  const [state, setState] = useState({
    name: '',
    description: '',
    price: 0,
    userLimit: 0,
    accessLevel: 1,
    isActive: true
  })

  // Update state when planData changes
 useEffect(() => {
  if (visible && planData) {
    setState({
      name: planData.name || '',
      description: planData.description || '',
      price: planData.price || 0,
      userLimit: planData.userLimit || 0,
      accessLevel: planData.accessLevel || 1,
      isActive: planData.isActive === 1 ? true : false
    });
  }
}, [visible, planData]);


  const handleChange = (e) => {
    const { name, value } = e.target
    setState({ ...state, [name]: value })
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    const form = e.target
    if (!form.checkValidity()) {
      form.classList.add('was-validated')
      return
    }

    let data = { ...state, isActive: state.isActive ? 1 : 0 }
    try {
      const resp = await put(`/api/plan/${planData.id}`, data)
      if (resp?.id || resp) {
        showToast('success', t("MSG.data_updated_successfully_msg"));
        onSuccess(resp)
        setVisible(false)
        handleClear()
      } else {
        showToast('danger', t("MSG.failed_to_update"));
      }
    } catch (error) {
      showToast('danger', 'Error occurred ' + error);
    }
  }

  const handleClear = () => {
    setState({
      name: '',
      description: '',
      price: 0,
      userLimit: 0,
      accessLevel: 1,
      isActive: true
    })
  }
  
  return (
    <>
      <CModal
        backdrop="static"
        visible={visible}
        onClose={() => {handleClear();setVisible(false);}}
        aria-labelledby="EditPlanModalLabel"
      >
        <CModalHeader>
          <CModalTitle id="EditPlanModalLabel">{t("LABELS.edit_plan")}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm className="needs-validation" noValidate onSubmit={handleSubmit}>
                <div className="mb-3">
                  <CFormLabel htmlFor="edit_pname">{t("LABELS.plan_name")}</CFormLabel>
                  <CFormInput
                    type="text"
                    id="edit_pname"
                    placeholder={t('MSG.plan_name')}
                    name="name"
                    value={state.name}
                    onChange={handleChange}
                    required
                    feedbackInvalid={t('MSG.please_provide_plan_name')}
                    feedbackValid={t('MSG.looks_good_msg')}
                  />
                  <div className="invalid-feedback">{t("MSG.name_is_required_msg")}</div>
                </div>
                <div className="mb-3">
                  <CFormLabel htmlFor="edit_description">{t("LABELS.plan_description")}</CFormLabel>
                  <CFormInput
                    type="text"
                    id="edit_description"
                    placeholder={t("MSG.enter_description_msg")}
                    name="description"
                    value={state.description}
                    onChange={handleChange}
                    required
                    feedbackInvalid={t("MSG.please_provide_description_msg")}
                    feedbackValid={t('MSG.looks_good_msg')}
                  />
                  <div className="invalid-feedback">{t("MSG.mobile_description_is_required_msg")}</div>
                </div>
                <div className="mb-3">
                  <CFormLabel htmlFor="edit_price">{t("LABELS.price")}</CFormLabel>
                  <CFormInput
                    type="number"
                    id="edit_price"
                    placeholder=""
                    name="price"
                    value={state.price}
                    onChange={handleChange}
                  />
                </div>
                <div className="mb-3">
                  <CFormLabel htmlFor="edit_userLimit">{t("LABELS.user_limit")}</CFormLabel>
                  <CFormInput
                    type="number"
                    id="edit_userLimit"
                    placeholder=""
                    name="userLimit"
                    value={state.userLimit}
                    onChange={handleChange}
                  />
                </div>
                <div className="mb-3">
                <CButton color="success" type="submit">
                {t("LABELS.update")}
                </CButton>
                &nbsp;
                <CButton color="danger" onClick={() => {handleClear();setVisible(false);}}>
                {t("LABELS.close")}
                </CButton>
              </div>
            </CForm>
        </CModalBody>
      </CModal>
    </>
  )
}