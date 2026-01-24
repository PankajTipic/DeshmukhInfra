import React, { useEffect, useState } from "react";
import { getAPICall, post } from "../../../util/api";
import {
  CButton, CCard, CCardHeader, CCardBody, CCol,
  CFormSelect, CRow, CSpinner, CAlert
} from "@coreui/react";
import { cilSearch } from "@coreui/icons";
import CIcon from "@coreui/icons-react";
import "bootstrap/dist/css/bootstrap.min.css";

const OperatorReport = () => {
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [payingOperatorId, setPayingOperatorId] = useState(null);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];
  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let i = currentYear - 5; i <= currentYear + 5; i++) yearOptions.push(i);

  const showAlertMessage = (message, type) => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 5000);
  };

  const fetchSupervisorData = async () => {
    if (!selectedMonth) {
      alert("Please select a month");
      return;
    }
    setLoading(true);
    try {
      const resp = await getAPICall(
        `/api/supervisor-payments?month=${selectedMonth}&year=${selectedYear}`
      );
      if (resp.success) {
        setSupervisors(resp.supervisors || []);
      } else {
        setSupervisors([]);
      }
    } catch (err) {
      console.error("API Error:", err);
      setSupervisors([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePayOperator = async (operator) => {
    setPayingOperatorId(operator.id);
    const payload = {
      id: operator.id,
      payment: operator.payment,
      total_commission: operator.total_commission,
      total_work_point: operator.total_work_point,
      month: selectedMonth,
      year: parseInt(selectedYear, 10)
    };

    try {
      const response = await post("/api/transactions/pay", payload);
      if (response.success) {
        await fetchSupervisorData();
        showAlertMessage("Payment Successfully Done!", "success");
      } else {
        showAlertMessage("Payment failed. Please try again.", "danger");
      }
    } catch (error) {
      console.error("Payment error:", error);
      showAlertMessage("Payment failed. Please try again.", "danger");
    } finally {
      setPayingOperatorId(null);
    }
  };

  return (
    <div className="container-fluid py-4">
      <CCard>
        <CCardHeader className="bg-primary text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Supervisor Salary Report</h5>
        </CCardHeader>
        <CCardBody>
          {showAlert && (
            <CAlert color={alertType} dismissible onClose={() => setShowAlert(false)}>
              {alertMessage}
            </CAlert>
          )}

          {/* Filters */}
          <CRow className="mb-4 d-flex flex-wrap gap-2">
            <CCol md={4}>
              <CFormSelect
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="border"
              >
                <option value="">Select Month</option>
                {months.map((month, idx) => (
                  <option key={idx} value={month}>
                    {month}
                  </option>
                ))}
              </CFormSelect>
            </CCol>

            <CCol md={4}>
              <CFormSelect
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="border"
              >
                <option value="">Select Year</option>
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </CFormSelect>
            </CCol>

            <CCol md={4}>
              <CButton
                color="primary"
                onClick={fetchSupervisorData}
                disabled={loading || !selectedMonth}
                className="w-100"
              >
                {loading ? (
                  <>
                    <CSpinner size="sm" className="me-2" /> Loading...
                  </>
                ) : (
                  <>
                    <CIcon icon={cilSearch} className="me-2" /> Fetch
                  </>
                )}
              </CButton>
            </CCol>
          </CRow>

          {/* Table */}
          {!loading && supervisors.length > 0 && (
            <div className="table-responsive">
              <h6 className="mb-3">Supervisors</h6>
              <table className="table table-striped table-bordered">
                <thead className="table-info">
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Mobile</th>
                    <th>Address</th>
                    <th>Salary</th>
                    <th>Total</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {supervisors.map((sup) => (
                    <tr key={sup.id}>
                      <td>{sup.id}</td>
                      <td>{sup.name}</td>
                      <td>{sup.mobile}</td>
                      <td>{sup.address}</td>
                      <td>{sup.payment}</td>
                      <td>{sup.total_commission}</td>
                      <td>
                        <CButton
                          color={sup.is_paid ? "success" : "warning"}
                          size="sm"
                          disabled={sup.is_paid || payingOperatorId === sup.id}
                          onClick={() => handlePayOperator(sup)}
                          className="px-3"
                        >
                          {payingOperatorId === sup.id ? (
                            <>
                              <CSpinner size="sm" className="me-1" /> Processing...
                            </>
                          ) : sup.is_paid ? (
                            "Paid"
                          ) : (
                            "Pay"
                          )}
                        </CButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CCardBody>
      </CCard>
    </div>
  );
};

export default OperatorReport;
