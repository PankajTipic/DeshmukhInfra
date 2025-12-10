// src/components/purchase-vendor/AddEditMaterialModal.jsx
import React from "react";
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CForm,
  CFormLabel,
  CFormInput,
  CRow,
  CCol,
  CAlert,
} from "@coreui/react";

const AddEditMaterialModal = ({
  visible,
  onClose,
  isEdit = false,
  form = {},           // ← Default empty object
  vendors = [],        // ← Prevent errors when vendors not loaded
  onChange,
  onSubmit,
  error,
}) => {
  // Safety guard – if form is missing, don't render anything (or show loader)
  if (!form || !vendors) {
    return null;
  }

  return (
    <CModal visible={visible} onClose={onClose} size="lg" backdrop="static">
      <CModalHeader onClose={onClose}>
        <CModalTitle>{isEdit ? "Edit" : "Add"} Material</CModalTitle>
      </CModalHeader>

      <CModalBody>
        <CForm>
          <CRow className="g-3">
            <CCol md={6}>
              <CFormLabel>Vendor *</CFormLabel>
              <select
                className="form-select"
                name="vendor_id"
                value={form.vendor_id || ""}
                onChange={onChange}
              >
                <option value="">Select Vendor</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </CCol>

            <CCol md={6}>
              <CFormLabel>Material Name *</CFormLabel>
              <CFormInput
                name="material_name"
                value={form.material_name || ""}
                onChange={onChange}
                placeholder="e.g. Cement, Bricks"
              />
            </CCol>
          </CRow>

          <CRow className="g-3 mt-3">
            <CCol>
              <CFormLabel>About (optional)</CFormLabel>
              <CFormInput
                name="about"
                value={form.about || ""}
                onChange={onChange}
                placeholder="Any additional details"
              />
            </CCol>
          </CRow>

          <CRow className="g-3 mt-3 align-items-end">
            <CCol md={3}>
              <CFormLabel>Qty *</CFormLabel>
              <CFormInput
                type="number"
                name="qty"
                value={form.qty || ""}
                onChange={onChange}
                min="0.01"
                step="0.01"
              />
            </CCol>

            <CCol md={3}>
              <CFormLabel>Price/Unit *</CFormLabel>
              <CFormInput
                type="number"
                name="price"
                value={form.price || ""}
                onChange={onChange}
                min="0"
                step="0.01"
              />
            </CCol>

            <CCol md={3}>
              <CFormLabel>Total</CFormLabel>
              <CFormInput
                value={(form.qty && form.price ? (form.qty * form.price).toFixed(2) : "0.00")}
                readOnly
                className="bg-light"
              />
            </CCol>

            <CCol md={3}>
              <CFormLabel>Date *</CFormLabel>
              <CFormInput
                type="date"
                name="date"
                value={form.date || ""}
                onChange={onChange}
                max={new Date().toISOString().split("T")[0]}
              />
            </CCol>
          </CRow>

          {error && <CAlert color="danger" className="mt-3">{error}</CAlert>}
        </CForm>
      </CModalBody>

      <CModalFooter>
        <CButton color="secondary" onClick={onClose}>
          Cancel
        </CButton>
        <CButton color="primary" onClick={onSubmit}>
          {isEdit ? "Update" : "Save"}
        </CButton>
      </CModalFooter>
    </CModal>
  );
};

export default AddEditMaterialModal;