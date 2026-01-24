import React, { useState, useEffect } from 'react';
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CFormTextarea,
  CFormLabel
} from '@coreui/react';
import { useTranslation } from 'react-i18next';

const RemarkModal = ({ visible, setVisible, currentRemark, onSave, productName }) => {
  const [remark, setRemark] = useState('');
  const { t, i18n } = useTranslation("global");
  const lng = i18n.language;

  useEffect(() => {
    setRemark(currentRemark || '');
  }, [currentRemark]);

  const handleSave = () => {
    onSave(remark);
    setVisible(false);
  };

  const handleClose = () => {
    setRemark(currentRemark || '');
    setVisible(false);
  };

  return (
    <CModal visible={visible} onClose={handleClose} size="md">
      <CModalHeader>
        <CModalTitle>{t("remarkModal.title")}</CModalTitle>
      </CModalHeader>
      <CModalBody>
        {productName && (
          <div className="mb-3">
            <strong>{t("remarkModal.product")}: </strong>{productName}
          </div>
        )}
        <CFormLabel htmlFor="remarkTextarea">{t("remarkModal.remarkLabel")}</CFormLabel>
        <CFormTextarea
          id="remarkTextarea"
          rows={4}
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
          placeholder={t("remarkModal.placeholder")}
        />
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={handleClose}>
          {t("remarkModal.cancel")}
        </CButton>
        <CButton color="primary" onClick={handleSave}>
          {t("remarkModal.save")}
        </CButton>
      </CModalFooter>
    </CModal>
  );
};

export default RemarkModal;