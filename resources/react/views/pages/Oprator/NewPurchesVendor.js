import React, { useState } from "react";
import {
  CCard,
  CCardBody,
  CCardHeader,
  CRow,
  CCol,
  CForm,
  CFormInput,
  CFormTextarea,
  CButton
} from "@coreui/react";
import { post } from "../../../util/api";
import { useToast } from "../../common/toast/ToastContext";
import { useNavigate } from "react-router-dom";

const OperatorForm = () => {
  const [formData, setFormData] = useState({
    type: "3", // FIXED TYPE = 3 (Purches Vendor)
    name: "",
    mobile: "",
    address: "",
    gst_no: "",
    bank_name: "",
    account_number: "",
    ifsc_code: "",
    adhar_number: "",
    pan_number: "",
    show: true,
    project_id: "0", // always 0 for type 3
    payment: "0"    // always 0 for type 3
  });

  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    let updatedValue = value;

    if (["gst_no", "ifsc_code", "pan_number"].includes(name)) {
      updatedValue = value.toUpperCase();
    }

    if (["mobile", "adhar_number", "account_number"].includes(name)) {
      if (!/^\d*$/.test(value)) return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: updatedValue,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim())
      return showToast("danger", "Name required");

    if (formData.mobile.length !== 10)
      return showToast("danger", "Mobile must be 10 digits");

    if (!formData.address.trim())
      return showToast("danger", "Address required");

    if (!formData.gst_no.trim())
      return showToast("danger", "GST required");

    // APPLYING REQUIRED CONDITIONS FOR TYPE 3
    const payload = {
      ...formData,
      project_id:
        formData.type === "1" ||
        formData.type === "2" ||
        formData.type === "3"
          ? "0"
          : formData.project_id,

      payment:
        formData.type === "2" || formData.type === "3"
          ? "0"
          : formData.payment
    };

    try {
      await post("/api/operators", payload);
      showToast("success", "Purches Vendor Created");
      navigate("/displayPurchesVendors");
    } catch (error) {
      showToast("danger", "Failed to create vendor");
    }
  };

  return (
    <CCard>
      <CCardHeader>
        <strong>Create Purches Vendor</strong>
      </CCardHeader>

      <CCardBody>
        <CForm onSubmit={handleSubmit}>
          {/* Name & Mobile */}
          <CRow>
            <CCol md={6}>
              <CFormInput
                label="Name *"
                placeholder="Enter Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </CCol>

            <CCol md={6}>
              <CFormInput
                maxLength={10}
                label="Mobile *"
                placeholder="Enter Mobile Number"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
              />
            </CCol>
          </CRow>

          {/* Address */}
          <CRow className="mt-3">
            <CCol md={12}>
              <CFormTextarea
                label="Address *"
                name="address"
                placeholder="Enter Address"
                value={formData.address}
                onChange={handleChange}
              />
            </CCol>
          </CRow>

          {/* GST + Aadhar */}
          <CRow className="mt-3">
            <CCol md={6}>
              <CFormInput
                label="GST Number *"
                placeholder="Enter GST Number"
                maxLength={15}
                name="gst_no"
                value={formData.gst_no}
                onChange={handleChange}
              />
            </CCol>

            <CCol md={6}>
              <CFormInput
                label="Aadhar Number"
                placeholder="Enter Aadhaar Number"
                maxLength={12}
                name="adhar_number"
                value={formData.adhar_number}
                onChange={handleChange}
              />
            </CCol>
          </CRow>

          {/* Bank Name + Account Number */}
          <CRow className="mt-3">
            <CCol md={6}>
              <CFormInput
                label="Bank Name"
                placeholder="Enter Bank Name"
                name="bank_name"
                value={formData.bank_name}
                onChange={handleChange}
              />
            </CCol>

            <CCol md={6}>
              <CFormInput
                label="Account Number"
                placeholder="Enter Account Number"
                name="account_number"
                value={formData.account_number}
                onChange={handleChange}
              />
            </CCol>
          </CRow>

          {/* IFSC + PAN */}
          <CRow className="mt-3">
            <CCol md={6}>
              <CFormInput
                label="IFSC Code"
                name="ifsc_code"
                placeholder="Enter IFSC Code"
                value={formData.ifsc_code}
                onChange={handleChange}
              />
            </CCol>

            <CCol md={6}>
              <CFormInput
                label="PAN Number"
                name="pan_number"
                placeholder="Enter PAN Number"
                value={formData.pan_number}
                onChange={handleChange}
              />
            </CCol>
          </CRow>

          {/* Submit + Close */}
          <div className="mt-4">
            <CButton type="submit" color="primary">
              Create Purches Vendor
            </CButton>

            <CButton
              onClick={() => navigate('/displayPurchesVendors')}
              color="secondary"
              className="ms-3"
            >
              Close
            </CButton>
          </div>
        </CForm>
      </CCardBody>
    </CCard>
  );
};

export default OperatorForm;
