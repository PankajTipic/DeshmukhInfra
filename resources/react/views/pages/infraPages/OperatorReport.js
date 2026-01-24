import React, { useEffect, useState, useCallback, useRef } from "react";
import { getAPICall, post } from "../../../util/api";
import { 
  CButton, CCard, CCardHeader, CCardBody, CCol, 
  CFormSelect, CFormInput, CInputGroup, CRow, 
  CSpinner, CAlert, CModal, CModalHeader, CModalTitle,
  CModalBody, CModalFooter 
} from '@coreui/react';
import { cilSearch, cilX } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { paymentTypes, receiver_bank } from "../../../util/Feilds";
import ProjectSelectionModal from '../../common/ProjectSelectionModal';

const OperatorReport = () => {
  const [operators, setOperators] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [showDropdown, setShowDropdown] = useState(false);
  const [payingOperator, setPayingOperator] = useState(null);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('');
  const [showAlert, setShowAlert] = useState(false);

  // NEW states for previous pending
  const [previousMsg, setPreviousMsg] = useState('');
  const [previousMonths, setPreviousMonths] = useState([]);

  // 👉 Modal form state
  const [paymentBy, setPaymentBy] = useState('');
  const [paymentType, setPaymentType] = useState('');
  const [transactionNo, setTransactionNo] = useState('');
  const [savingPayment, setSavingPayment] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);

  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  const months = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];

  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let i = currentYear - 5; i <= currentYear + 5; i++) {
    yearOptions.push(i);
  }

  const showTempAlert = (message, type) => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 5000);
  };

  const fetchProjects = useCallback(async (query) => {
    try {
      const response = await getAPICall(`/api/projects?searchQuery=${query}`);
      setProjects(response || []);
      setShowDropdown(true);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
      setShowDropdown(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery && searchQuery.length > 2) {
        fetchProjects(searchQuery);
      } else {
        setProjects([]);
        setShowDropdown(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchProjects]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProjectChange = (project) => {
    setSearchQuery(project.project_name);
    setSelectedProjectId(project.id);
    setProjects([]);
    setShowDropdown(false);
    if (inputRef.current) inputRef.current.blur();
  };

  const handleInputFocus = () => {
    if (projects.length > 0) setShowDropdown(true);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (selectedProjectId && value !== searchQuery) {
      setSelectedProjectId('');
    }
  };

  /** 🔑 Fetch operators/supervisors + previous pending months */
  const fetchOperatorData = async (customMonth = null, customYear = null) => {
    const monthToUse = customMonth || selectedMonth;
    const yearToUse = customYear || selectedYear;

    if (!selectedProjectId || !monthToUse) {
      alert('Please select a project and month');
      return;
    }

    setLoading(true);
    try {
      const resp = await getAPICall(
        `/api/operators-by-product?product_id=${selectedProjectId}&month=${monthToUse}&year=${yearToUse}`
      );

      if (resp.success) {
        setOperators(resp.operators || []);
        setSupervisors(resp.supervisors || []);

        // ✅ handle previous pending info
        setPreviousMsg(resp.previous_payment_msg || '');
        setPreviousMonths(resp.previous_pending_months || []);
      } else {
        setOperators([]);
        setSupervisors([]);
        setPreviousMsg('');
        setPreviousMonths([]);
      }
    } catch (err) {
      console.error("API Error:", err);
      setOperators([]);
      setSupervisors([]);
      setPreviousMsg('');
      setPreviousMonths([]);
    } finally {
      setLoading(false);
    }
  };

  /** ------------------------
   * Payment Modal Logic
   -------------------------*/
  const openPaymentModal = (operator) => {
    setPayingOperator(operator);
    setPaymentBy('');
    setPaymentType('');
    setTransactionNo('');
  };

  const closePaymentModal = () => {
    setPayingOperator(null);
  };

  const handlePaymentSubmit = async () => {
    if (!paymentBy || !paymentType || !transactionNo) {
      showTempAlert('Please fill all payment details', 'danger');
      return;
    }

    setSavingPayment(true);
    const op = payingOperator;

    const payload = {
      id: op.id,
      payment: op.payment,
      total_commission: op.total_commission,
      total_work_point: op.total_work_point,
      month: selectedMonth,
      year: parseInt(selectedYear),
      project_id: selectedProjectId,
      payment_by: paymentBy,
      payment_type: paymentType,
      transaction_id: transactionNo
    };

    try {
      const response = await post('/api/transactions/pay', payload);
      if (response.success) {
        await fetchOperatorData();
        showTempAlert('Payment Successfully Done!', 'success');
        closePaymentModal();
      } else {
        showTempAlert(response.message || 'Payment failed', 'danger');
      }
    } catch (error) {
      console.error('Payment error:', error);
      showTempAlert('Payment failed. Please try again.', 'danger');
    } finally {
      setSavingPayment(false);
    }
  };

  /** ✅ Jump to oldest pending month when Pay Previous clicked */
  const handlePayPrevious = () => {
    if (!previousMonths || previousMonths.length === 0) return;

    // pick earliest pending month (e.g. 2025-08)
    const earliest = previousMonths.sort()[0];
    const [yr, mn] = earliest.split('-');
    const monthName = months[parseInt(mn, 10) - 1];

    setSelectedYear(yr);
    setSelectedMonth(monthName);

    // fetch that month data
    fetchOperatorData(monthName, yr);
  };

  const renderTable = (data, isSupervisor = false) => (
    <div className="table-responsive mb-5">
      <h6 className="mb-3">{isSupervisor ? "Supervisors" : "Oprators"}</h6>
      <table className="table table-striped table-bordered">
        <thead className={isSupervisor ? "table-info" : "table-primary"}>
          <tr>
            <th>ID</th><th>Name</th><th>Mobile</th><th>Address</th>
            {isSupervisor ? null : <th>Total Work Point</th>}
            <th>Salary</th>
            {isSupervisor ? null : <th>Commission</th>}
            <th>Total</th><th>Action</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id}>
              <td>{row.id}</td>
              <td>{row.name}</td>
              <td>{row.mobile}</td>
              <td>{row.address}</td>
              {isSupervisor ? null : <td>{row.total_work_point}</td>}
              <td>{row.payment}</td>
              {isSupervisor ? null : (
                <td>
                  {row.commission} × {row.total_work_point} = {row.total_commission}
                </td>
              )}
              <td>
                {(parseFloat(row.payment || 0) + parseFloat(row.total_commission || 0)).toFixed(2)}
              </td>
              <td>
                <CButton
                  color={row.is_paid ? "success" : "warning"}
                  size="sm"
                  disabled={row.is_paid}
                  onClick={() => openPaymentModal(row)}
                >
                  {row.is_paid ? "Paid" : "Pay"}
                </CButton>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="container-fluid py-4">
      <CCard>
        <CCardHeader className="bg-primary text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Oprator Salary and Commission Report</h5>
        </CCardHeader>
        <CCardBody>
          {showAlert && (
            <CAlert color={alertType} dismissible onClose={() => setShowAlert(false)}>
              {alertMessage}
            </CAlert>
          )}

          {/* ✅ Show Previous Payment Pending Alert */}
          {previousMsg && previousMonths.length > 0 && (
            <CAlert color="warning" className="d-flex justify-content-between align-items-center">
              <div>
                <strong>{previousMsg}</strong> &nbsp;
                (Pending Months: {previousMonths.join(', ')})
              </div>
              <CButton color="danger" size="sm" onClick={handlePayPrevious}>
                Pay Previous
              </CButton>
            </CAlert>
          )}

          <CRow className="mb-4 d-flex flex-wrap gap-2">
            <CCol md={4}>
  <div className="position-relative" ref={dropdownRef}>
    <CInputGroup>
      <CFormInput
        ref={inputRef}
        type="text"
        value={searchQuery}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        placeholder="Search for a project..."
        className="border"
        autoComplete="off"
      />

      {/* 🔁 Toggle Search / Clear Button */}
      {!selectedProjectId ? (
        <CButton
          color="primary"
          variant="outline"
          onClick={() => setShowProjectModal(true)}
          style={{
            position: 'absolute',
            right: '0',
            top: '0',
            bottom: '0',
            zIndex: 5,
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
          }}
        >
          <CIcon icon={cilSearch} />
        </CButton>
      ) : (
        <CButton
          color="danger"
          variant="outline"
          onClick={() => {
            // Clear selected project and search
            setSearchQuery('');
            setSelectedProjectId('');
            setProjects([]);
            setShowDropdown(false);
          }}
          style={{
            position: 'absolute',
            right: '0',
            top: '0',
            bottom: '0',
            zIndex: 5,
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
          }}
        >
          <CIcon icon={cilX} />
        </CButton>
      )}
    </CInputGroup>

    {/* Dropdown list */}
    {showDropdown && projects.length > 0 && (
      <div
        className="dropdown-menu show w-100"
        style={{
          maxHeight: '200px',
          overflowY: 'auto',
          position: 'absolute',
          zIndex: 1000,
          marginTop: '2px',
        }}
      >
        {projects.map((project) => (
          <div
            key={project.id}
            className="dropdown-item"
            style={{ cursor: 'pointer' }}
            onClick={() => handleProjectChange(project)}
          >
            {project.project_name}
          </div>
        ))}
      </div>
    )}

    {/* Selected project display */}
    {selectedProjectId && (
      <div className="text-success mt-1 small">
        ✓ Selected: {searchQuery}
      </div>
    )}
  </div>
</CCol>


            <CCol md={3}>
              <CFormSelect value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="border">
                <option value="">Select Month</option>
                {months.map((month, index) => (
                  <option key={index} value={month}>{month}</option>
                ))}
              </CFormSelect>
            </CCol>
            
            <CCol md={3}>
              <CFormSelect value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="border">
                <option value="">Select Year</option>
                {yearOptions.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </CFormSelect>
            </CCol>
            
            <CCol md={2}>
              <CButton color="primary" onClick={() => fetchOperatorData()} disabled={loading || !selectedProjectId || !selectedMonth} className="w-100">
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

          {!loading && operators.length > 0 && renderTable(operators)}
          {!loading && supervisors.length > 0 && renderTable(supervisors, true)}

          {/* 💳 Payment Modal */}
          <CModal visible={!!payingOperator} onClose={closePaymentModal} backdrop="static">
            <CModalHeader onClose={closePaymentModal}>
              <CModalTitle>Make Payment</CModalTitle>
            </CModalHeader>
            <CModalBody>
              {payingOperator && (
                <>
                  <p className="fw-bold">Oprator: {payingOperator.name}</p>
                  <CFormSelect
                    className="mb-3"
                    value={paymentBy}
                    onChange={(e) => setPaymentBy(e.target.value)}
                  >
                    <option value="">Select Payment By</option>
                    {/* <option value="Mangesh Shitole">Mangesh Shitole</option>
                    <option value="Krishna Shitole">Krishna Shitole</option>
                    <option value="Deshmukh infra LLP">Deshmukh infra LLP</option> */}
                    {receiver_bank.map((bank) => (
                     <option key={bank.value} value={bank.value}>{bank.label}</option>
                  ))}
                  </CFormSelect>

                  <CFormSelect
                    className="mb-3"
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value)}
                  >
                    <option value="">Select Payment Type</option>
                    {/* <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                    <option value="IMPS/NEFT/RTGS">IMPS/NEFT/RTGS</option> */}
                    {paymentTypes.map((type) => (
                                            <option key={type.value} value={type.value}>{type.label}</option>
                                           ))}
                  </CFormSelect>

                  <CFormInput
                    type="text"
                    placeholder="Transaction Number"
                    value={transactionNo}
                    onChange={(e) => setTransactionNo(e.target.value)}
                  />
                </>
              )}
            </CModalBody>
            <CModalFooter>
              <CButton color="secondary" onClick={closePaymentModal}>
                Cancel
              </CButton>
              <CButton color="primary" disabled={savingPayment} onClick={handlePaymentSubmit}>
                {savingPayment ? <CSpinner size="sm" /> : 'Submit'}
              </CButton>
            </CModalFooter>
          </CModal>
        </CCardBody>
      </CCard>
       <ProjectSelectionModal
        visible={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        onSelectProject={handleProjectChange}
      />
    </div>
  );
};

export default OperatorReport;
