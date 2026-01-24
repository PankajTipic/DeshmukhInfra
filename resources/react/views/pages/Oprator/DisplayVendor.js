import React, { useEffect, useState } from "react";
import {
  CCard,
  CCardBody,
  CCardHeader,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CSpinner,
  CAlert,
  CButton,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CForm,
  CFormInput,
  CRow,
  CCol,
} from "@coreui/react";
import { getAPICall, put } from "../../../util/api";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../common/toast/ToastContext";

const OperatorList = () => {
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editModal, setEditModal] = useState(false);
  const [currentOperator, setCurrentOperator] = useState(null);

  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    fetchOperators();
  }, []);

  const fetchOperators = () => {
    getAPICall("/api/operatorsByCompanyId")
      .then((res) => {
        if (!res) throw new Error("Failed to fetch operators");

        // SHOW ONLY TYPE = 3
        setOperators(res.filter(op => op.type === "3"));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  const handleEditClick = (operator) => {
    setCurrentOperator({
      ...operator,
      gst_no: operator.gst_no || "",
      bank_name: operator.bank_name || "",
      account_number: operator.account_number || "",
      ifsc_code: operator.ifsc_code || "",
      adhar_number: operator.adhar_number || "",
      pan_number: operator.pan_number || "",
    });
    setEditModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    let updatedValue = value;

    if (name === "gst_no" || name === "pan_number" || name === "ifsc_code") {
      updatedValue = value.toUpperCase();
    }

    if (name === "mobile" || name === "account_number" || name === "adhar_number") {
      if (!/^\d*$/.test(value)) return;
    }

    setCurrentOperator(prev => ({
      ...prev,
      [name]: updatedValue,
    }));
  };

  const handleSave = async () => {
    if (!currentOperator.name.trim()) {
      showToast("danger", "Name is required");
      return;
    }
    if (!currentOperator.mobile || currentOperator.mobile.length !== 10) {
      showToast("danger", "Mobile must be 10 digits");
      return;
    }
    if (!currentOperator.gst_no.trim()) {
      showToast("danger", "GST number required");
      return;
    }

    try {
      await put(`/api/operators/${currentOperator.id}`, currentOperator);
      showToast("success", "Vendor updated successfully");
      setEditModal(false);
      fetchOperators();
    } catch (err) {
      showToast("danger", "Failed to update vendor");
    }
  };

  return (
    <CCard className="mb-4">
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <strong>Purches Vendor List</strong>
        <CButton color="danger" onClick={() => navigate("/NewPurchesVendor")}>
          Add Purches Vendor
        </CButton>
      </CCardHeader>

      <CCardBody>
        {loading && <CSpinner />}
        {error && <CAlert color="danger">{error}</CAlert>}
        {!loading && !error && (
          <CTable striped hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>#</CTableHeaderCell>
                <CTableHeaderCell>Name</CTableHeaderCell>
                <CTableHeaderCell>Mobile</CTableHeaderCell>
                <CTableHeaderCell>GST No</CTableHeaderCell>
                <CTableHeaderCell>Bank Details</CTableHeaderCell>
                <CTableHeaderCell>Action</CTableHeaderCell>
              </CTableRow>
            </CTableHead>

            <CTableBody>
              {operators.map((op, index) => (
                <CTableRow key={op.id}>
                  <CTableHeaderCell>{index + 1}</CTableHeaderCell>
                  <CTableDataCell>{op.name}</CTableDataCell>
                  <CTableDataCell>{op.mobile}</CTableDataCell>
                  <CTableDataCell>{op.gst_no || "-"}</CTableDataCell>
                  <CTableDataCell>
                    {op.bank_name && `${op.bank_name}, Acc: ${op.account_number}, ${op.ifsc_code}`}
                  </CTableDataCell>
                  <CTableDataCell>
                    <CButton color="info" size="sm" onClick={() => handleEditClick(op)}>
                      Edit
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        )}
      </CCardBody>

      {/* EDIT MODAL */}
      <CModal visible={editModal} onClose={() => setEditModal(false)} size="lg">
        <CModalHeader>Edit Purches Vendor</CModalHeader>
        <CModalBody>
          {currentOperator && (
            <CForm>
              <CRow>
                <CCol md={6}>
                  <CFormInput label="Name" name="name" value={currentOperator.name} onChange={handleChange} />
                </CCol>
                <CCol md={6}>
                  <CFormInput label="Mobile" maxLength={10} name="mobile" value={currentOperator.mobile} onChange={handleChange} />
                </CCol>
              </CRow>

              <CRow className="mt-3">
                <CCol md={6}>
                  <CFormInput label="GST Number" name="gst_no" value={currentOperator.gst_no} maxLength={15} onChange={handleChange} />
                </CCol>
                <CCol md={6}>
                  <CFormInput label="Aadhar Number" name="adhar_number" maxLength={12} value={currentOperator.adhar_number} onChange={handleChange} />
                </CCol>
              </CRow>

              <CRow className="mt-3">
                <CCol md={6}>
                  <CFormInput label="Bank Name" name="bank_name" value={currentOperator.bank_name} onChange={handleChange} />
                </CCol>
                <CCol md={6}>
                  <CFormInput label="Account Number" name="account_number" value={currentOperator.account_number} onChange={handleChange} />
                </CCol>
              </CRow>

              <CRow className="mt-3">
                <CCol md={6}>
                  <CFormInput label="IFSC Code" name="ifsc_code" value={currentOperator.ifsc_code} onChange={handleChange} />
                </CCol>
                <CCol md={6}>
                  <CFormInput label="PAN Number" name="pan_number" value={currentOperator.pan_number} onChange={handleChange} />
                </CCol>
              </CRow>
            </CForm>
          )}
        </CModalBody>

        <CModalFooter>
          <CButton color="secondary" onClick={() => setEditModal(false)}>Close</CButton>
          <CButton color="primary" onClick={handleSave}>Save</CButton>
        </CModalFooter>
      </CModal>
    </CCard>
  );
};

export default OperatorList;
