
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
  CFormSelect,
  CRow,
  CCol,
} from "@coreui/react";
import { getAPICall, put } from "../../../util/api";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../common/toast/ToastContext";

const OperatorList = () => {
  const [operators, setOperators] = useState([]);
  const [filteredOperators, setFilteredOperators] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editModal, setEditModal] = useState(false);
  const [currentOperator, setCurrentOperator] = useState(null);
  const [filterType, setFilterType] = useState(""); // Filter by type

  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    fetchOperators();
    fetchProjects();
  }, []);

  useEffect(() => {
    // Filter operators based on selected type
    if (filterType === "") {
      setFilteredOperators(operators);
    } else {
      setFilteredOperators(operators.filter(op => op.type === filterType));
    }
  }, [operators, filterType]);

  const fetchOperators = () => {
    getAPICall("/api/operatorsByCompanyId")
      .then((res) => {
        if (!res) throw new Error("Failed to fetch operators");
        setOperators(res);
        setLoading(false);
      })  
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  const fetchProjects = () => {
    getAPICall("/api/myProjects")
      .then((res) => {
        setProjects(res || []);
      })
      .catch((err) => console.error("Failed to load projects:", err));
  };

  const getRoleText = (type) => {
    switch(type) {
      case "0": return "Supervisor";
      case "1": return "Operator";
      case "2": return "Vendor";
      case "3": return "Purches Vendor";
      default: return "Unknown";
    }
  };

  // Open modal and set operator to edit
  const handleEditClick = (operator) => {
    setCurrentOperator({
      ...operator,
      project_id: operator.project_id || "",
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
    const { name, value, type } = e.target;
    let updatedValue = value;

    // Specific validations
    if (name === "mobile") {
      if (/^\d*$/.test(value) && value.length <= 10) updatedValue = value;
    } else if (name === "account_number") {
      if (/^\d*$/.test(value)) updatedValue = value;
    } else if (name === "adhar_number") {
      if (/^\d*$/.test(value) && value.length <= 12) updatedValue = value;
    } else if (name === "ifsc_code" || name === "pan_number") {
      updatedValue = value.toUpperCase();
      if (/^[A-Z0-9]*$/.test(value)) updatedValue = value.toUpperCase();
    } else if (name === "gst_no") {
      updatedValue = value.toUpperCase();
      if (/^[0-9A-Z]*$/.test(value)) updatedValue = value.toUpperCase();
    }

    setCurrentOperator((prev) => ({
      ...prev,
      [name]: updatedValue,
    }));
  };

  const handleSave = async () => {
    try {
      // Validation
      if (!currentOperator.name.trim()) {
        showToast("danger", 'Name is required');
        return;
      }
      if (!currentOperator.mobile || currentOperator.mobile.length !== 10) {
        showToast("danger", 'Mobile number must be 10 digits');
        return;
      }
      if (!currentOperator.address.trim()) {
        showToast("danger", 'Address is required');
        return;
      }

      // Role-specific validations
      if (currentOperator.type === "0" && !currentOperator.project_id) {
        showToast("danger", 'Project is required for Supervisor');
        return;
      }
      if ((currentOperator.type === "0" || currentOperator.type === "1") && !currentOperator.payment) {
        showToast("danger", 'Payment is required for Supervisor and Operator');
        return;
      }
      if ((currentOperator.type === "2" || currentOperator.type === "3") && !currentOperator.gst_no.trim()) {
        showToast("danger", 'GST Number is required for Vendor');
        return;
      }

      // Bank details validation
      if (currentOperator.bank_name && !currentOperator.account_number) {
        showToast("danger", 'Account Number is required when Bank Name is provided');
        return;
      }
      if (currentOperator.account_number && !currentOperator.bank_name) {
        showToast("danger", 'Bank Name is required when Account Number is provided');
        return;
      }
      if ((currentOperator.bank_name || currentOperator.account_number) && !currentOperator.ifsc_code) {
        showToast("danger", 'IFSC Code is required when bank details are provided');
        return;
      }

      const payload = {
        ...currentOperator,
        project_id: currentOperator.project_id ? String(currentOperator.project_id) : "",
        payment: currentOperator.type === "2" ? "0" : currentOperator.payment,
      };

      await put(`/api/operators/${currentOperator.id}`, payload);
      setEditModal(false);
      showToast("success", "User updated successfully.");
      fetchOperators();
    } catch (err) {
      console.error("Error updating user:", err);
      showToast("danger", "Failed to update user!");
    }
  };

  return (
    <CCard className="mb-4">
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <strong>Users List</strong>
        <div className="d-flex gap-2 align-items-center">
          {/* Filter Dropdown */}
          <CFormSelect
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{ width: '200px' }}
          >
            <option value="">All Users</option>
            <option value="0">Supervisors</option>
            <option value="1">Operators</option>
            <option value="2">Vendors</option>
            <option value="3">Purches Vendors</option>
          </CFormSelect>
          <CButton color="danger" onClick={() => navigate("/oprator")}>
            Add User
          </CButton>
        </div>
      </CCardHeader>

      <CCardBody>
        {loading && <CSpinner color="primary" />}
        {error && <CAlert color="danger">{error}</CAlert>}
        {!loading && !error && (
          <CTable striped hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>#</CTableHeaderCell>
                <CTableHeaderCell>Name</CTableHeaderCell>
                <CTableHeaderCell>Mobile</CTableHeaderCell>
                <CTableHeaderCell>Address</CTableHeaderCell>
                <CTableHeaderCell>Role</CTableHeaderCell>
                <CTableHeaderCell>Payment/GST/Bank</CTableHeaderCell>
                <CTableHeaderCell>Project</CTableHeaderCell>
                <CTableHeaderCell>Action</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {filteredOperators.map((op, index) => (
                <CTableRow key={op.id}>
                  <CTableHeaderCell>{index + 1}</CTableHeaderCell>
                  <CTableDataCell>{op.name}</CTableDataCell>
                  <CTableDataCell>{op.mobile}</CTableDataCell>
                  <CTableDataCell>{op.address}</CTableDataCell>
                  <CTableDataCell>{getRoleText(op.type)}</CTableDataCell>
                  <CTableDataCell>
                    {op.type === "2" ? (op.gst_no || "-") : op.type === "0" || op.type === "1" ? (op.payment || "-") : "-"}
                    {op.bank_name && `, ${op.bank_name}`}
                    {op.account_number && ` (Acc: ${op.account_number})`}
                  </CTableDataCell>
                  <CTableDataCell>{op.project?.project_name || "-"}</CTableDataCell>
                  <CTableDataCell>
                    <CButton
                      color="info"
                      size="sm"
                      onClick={() => handleEditClick(op)}
                    >
                      Edit
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        )}
      </CCardBody>

      {/* Edit Modal */}
      <CModal visible={editModal} onClose={() => setEditModal(false)} size="lg">
        <CModalHeader closeButton>Edit User</CModalHeader>
        <CModalBody>
          {currentOperator && (
            <CForm>
              {/* Name & Mobile */}
              <CRow className="mb-3">
                <CCol md={6}>
                  <CFormInput
                    label="Name *"
                    name="name"
                    value={currentOperator.name}
                    onChange={handleChange}
                    required
                  />
                </CCol>
                <CCol md={6}>
                  <CFormInput
                    label="Mobile *"
                    name="mobile"
                    maxLength={10}
                    value={currentOperator.mobile}
                    onChange={handleChange}
                    required
                  />
                </CCol>
              </CRow>

              {/* Address */}
              <CRow className="mb-3">
                <CCol md={12}>
                  <CFormInput
                    label="Address *"
                    name="address"
                    value={currentOperator.address}
                    onChange={handleChange}
                    required
                  />
                </CCol>
              </CRow>

              {/* Role */}
              <CRow className="mb-3">
                <CCol md={4}>
                  <CFormSelect
                    label="Role *"
                    name="type"
                    value={currentOperator.type}
                    onChange={handleChange}
                    options={[
                      { label: "Select Role", value: "" },
                      { label: "Supervisor", value: "0" },
                      { label: "Operator", value: "1" },
                      { label: "Vendor", value: "2" },
                        { label: "Purches Vendor", value: "3" },
                    ]}
                    required
                  />
                </CCol>
             

              {/* Payment for Supervisor and Operator */}
              {(currentOperator.type === "0" || currentOperator.type === "1") && (
               
                  <CCol md={4}>
                    <CFormInput
                      label="Payment *"
                      name="payment"
                      type="number"
                      value={currentOperator.payment}
                      onChange={handleChange}
                      required
                    />
                  </CCol>
                
              )}

               </CRow>

              {/* GST Number for Vendor */}
              {(currentOperator.type === "2" || currentOperator.type === "3" ) && (
                
                  <CCol md={4}>
                    <CFormInput
                      label="GST Number *"
                      name="gst_no"
                      maxLength={15}
                      value={currentOperator.gst_no}
                      onChange={handleChange}
                      required
                    />
                  </CCol>
              
              )}

              {/* Project (only for Supervisor) */}
              {currentOperator.type === "0" && (
                <CRow className="mb-3">
                  <CCol md={6}>
                    <CFormSelect
                      label="Project *"
                      name="project_id"
                      value={currentOperator.project_id}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Project</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.project_name}
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>
                </CRow>
              )}

              {/* Bank Details - Bank Name, Account Number, IFSC */}
              <CRow className="mb-3">
                <CCol md={4}>
                  <CFormInput
                    label="Bank Name"
                    name="bank_name"
                    value={currentOperator.bank_name}
                    onChange={handleChange}
                  />
                </CCol>
                <CCol md={4}>
                  <CFormInput
                    label="Account Number"
                    name="account_number"
                    maxLength={18}
                    value={currentOperator.account_number}
                    onChange={handleChange}
                  />
                </CCol>
                <CCol md={4}>
                  <CFormInput
                    label="IFSC Code"
                    name="ifsc_code"
                    maxLength={11}
                    value={currentOperator.ifsc_code}
                    onChange={handleChange}
                  />
                </CCol>
              </CRow>

              {/* Aadhar and PAN */}
              <CRow className="mb-3">
                <CCol md={6}>
                  <CFormInput
                    label="Aadhar Number"
                    name="adhar_number"
                    maxLength={12}
                    value={currentOperator.adhar_number}
                    onChange={handleChange}
                  />
                </CCol>
                <CCol md={6}>
                  <CFormInput
                    label="PAN Number"
                    name="pan_number"
                    maxLength={10}
                    value={currentOperator.pan_number}
                    onChange={handleChange}
                  />
                </CCol>
              </CRow>
            </CForm>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setEditModal(false)}>
            Close
          </CButton>
          <CButton color="primary" onClick={handleSave}>
            Save Changes
          </CButton>
        </CModalFooter>
      </CModal>
    </CCard>
  );
};

export default OperatorList;