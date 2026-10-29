import React, { useState, useEffect } from "react";
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CRow,
  CCol,
  CFormLabel,
  CFormInput,
  CFormSelect,
  CFormCheck
} from "@coreui/react";
import { put } from "../../../util/api";
import { useToast } from "../../common/toast/ToastContext";
import { paymentTypes, receiver_bank } from "../../../util/Feilds";
import { useTranslation } from "react-i18next";

const AddQtyModal = ({ visible, onClose, material, refreshList }) => {
  const { showToast } = useToast();
   const { t } = useTranslation("global");
  const [formData, setFormData] = useState({
    current_stock: 0,
    unit: "",
    price: 0,
    total: 0,
    add_qty: 0, // user input to add
    contact: "",
    payment_by: "",
    payment_type: "",
     expense_flag: false,
  });

   const units = ["kg", "pcs", "mg", "ltr", "bag", "Brass"]; 

  // 🔑 Load latest log when modal opens
  useEffect(() => {
    if (material) {
      const log = material.logs?.[0] || {};
      setFormData({
        current_stock: log.current_stock || 0,
        unit: log.unit || "",
        price: log.price || 0,
        total: log.total || 0,
        add_qty: 0,
        expense_flag: false,
      });
    }
  }, [material]);

    const handleChange = (e) => {
  const { name, type, value, checked } = e.target;

  setFormData((prev) => {
    // Start with updating the changed field
    const updated = {
      ...prev,
      [name]: type === "checkbox" ? !!checked : value,
    };

    // Recalculate total if add_qty or price changes
    if (name === "add_qty" || name === "price") {
      const newStock = parseFloat(updated.current_stock || 0) + (parseFloat(updated.add_qty) || 0);
      const price = parseFloat(updated.price) || 0;
      updated.total = (newStock * price).toFixed(2);
    }

    return updated;
  });
};



  const handleSave = async () => {
    try {
      await put(`/api/rawMaterial/addQty/${material.id}`, {
        add_qty: formData.add_qty,
        price: formData.price,
        unit : formData.unit,
        contact: formData.contact,
        payment_by: formData.payment_by,
        payment_type: formData.payment_type,
        expense_flag: false, 
      });
      showToast("success", "Quantity added successfully!");
      refreshList(); // refresh table in parent
      onClose();
    } catch (err) {
      console.error(err);
      showToast("danger", "Failed to update quantity");
    }
  };

  return (
    <CModal visible={visible} onClose={onClose}>
      <CModalHeader onClose={onClose}>
        <CModalTitle>Add Quantity</CModalTitle>
      </CModalHeader>

      <CModalBody>
        <CRow className="mb-3">
          <CCol md={6}>
            <CFormLabel>Current Stock</CFormLabel>
            <CFormInput value={formData.current_stock} readOnly />
          </CCol>
          {/* <CCol md={6}>
            <CFormLabel>Unit</CFormLabel>
            <CFormInput value={formData.unit} readOnly />
          </CCol> */}
           <CCol md={6}>
              <CFormLabel>Unit *</CFormLabel>
              <CFormSelect
                name="unit"
                value={formData.unit}
                onChange={handleChange}
              >
                <option value="">-- Select Unit --</option>
                {units.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
        </CRow>

        <CRow className="mb-3">
          <CCol md={6}>
            <CFormLabel>Price</CFormLabel>
            {/* <CFormInput
              name="price"
              type="number"
              value={formData.price}
              onChange={handleChange}
            /> */}
            <CFormInput
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9.]/g, "");
                setFormData((prev) => {
                  const newStock = (parseFloat(prev.current_stock) || 0) + (parseFloat(prev.add_qty) || 0);
                  const price = parseFloat(val) || 0;
                  return {
                    ...prev,
                    price: val,
                    total: (newStock * price).toFixed(2),
                  };
                });
              }}
            />
          </CCol>
          <CCol md={6}>
            <CFormLabel>Total</CFormLabel>
            <CFormInput value={formData.total} readOnly />
          </CCol>
        </CRow>

        <CRow>
          <CCol md={12}>
            <CFormLabel>Add Qty</CFormLabel>
            <CFormInput
              name="add_qty"
              type="number"
              min="0"
              step="any"
              value={formData.add_qty}
              placeholder="Enter quantity to add"
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9.]/g, "");
                setFormData((prev) => {
                  const newStock = (parseFloat(prev.current_stock) || 0) + (parseFloat(val) || 0);
                  const price = parseFloat(prev.price) || 0;
                  return {
                    ...prev,
                    add_qty: val,
                    total: (newStock * price).toFixed(2),
                  };
                });
              }}
            />
          </CCol>
        </CRow>

        {/* Contact, Payment By, Payment Type  */}
        <CRow className="mb-3">
          <CCol sm={4}>
            <CFormLabel htmlFor="contact">
              <p>{t("LABELS.contact")}</p>
            </CFormLabel>
            <CFormInput
              type="text"
              id="contact"
              placeholder={t("LABELS.enter_contact")}
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              maxLength={10}
              inputMode="numeric"
            />
          </CCol>

          <CCol sm={4}>
            <CFormLabel htmlFor="payment_by">
              <p>{t("LABELS.payment_by")}</p>
            </CFormLabel>
            <CFormSelect
              id="payment_by"
              name="payment_by"
              value={formData.payment_by}
              onChange={handleChange}
            >
              <option value="">{t("LABELS.select_payment_by")}</option>
              {receiver_bank.map((bank) => (
                <option key={bank.value} value={bank.value}>
                  {bank.label}
                </option>
              ))}
            </CFormSelect>
          </CCol>

          <CCol sm={4}>
            <CFormLabel htmlFor="payment_type">
              <p>{t("LABELS.payment_type")}</p>
            </CFormLabel>
            <CFormSelect
              id="payment_type"
              name="payment_type"
              value={formData.payment_type}
              onChange={handleChange}
              required
            >
              <option value="">Select Payment Type</option>
              {paymentTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </CFormSelect>
          </CCol>
        </CRow>

        <CRow className="mb-2" style={{ display: "none" }}>
          <CCol>
            <CFormCheck
              type="checkbox"
              name="expense_flag"
              id="expense_flag"
              label="Add in Expense Record..."
              checked={false}
              onChange={() => {}}
            />
          </CCol>
        </CRow>







      </CModalBody>

      <CModalFooter>
        <CButton color="secondary" onClick={onClose}>
          Cancel
        </CButton>
        <CButton color="primary" onClick={handleSave}>
          Save
        </CButton>
      </CModalFooter>
    </CModal>
  );
};

export default AddQtyModal;
