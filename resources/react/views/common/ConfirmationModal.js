import { CButton, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle } from '@coreui/react'
import { useTranslation, Trans } from 'react-i18next'

export default function ConfirmationModal({ resource, visible, setVisible, onYes }) {
  const { t } = useTranslation("global")
  return (
    <>
      <CModal
        backdrop="static"
        visible={visible}
        onClose={() => setVisible(false)}
        aria-labelledby="StaticBackdropExampleLabel"
      >
        <CModalHeader>
          <CModalTitle id="StaticBackdropExampleLabel">{resource}?</CModalTitle>
        </CModalHeader>
        <CModalBody>
  <Trans
    i18nKey="LABELS.conformation_msg"
    ns="global"
    components={{ strong: <span style={{ color: 'red', fontWeight: 'bold' }} /> }}
  />
</CModalBody>   

        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisible(false)}>
            {t("LABELS.close")}
          </CButton>
          <CButton color="primary" onClick={onYes}>
            {t("LABELS.yes")}
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}
