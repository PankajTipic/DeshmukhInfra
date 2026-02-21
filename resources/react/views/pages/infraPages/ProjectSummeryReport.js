import React, { useState, useEffect } from 'react';
import {
  CCard, CCardBody, CCardHeader, CRow, CCol, CForm, CFormLabel, CFormInput,
  CContainer, CInputGroup, CInputGroupText, CAlert, CSpinner, CButton,
  CCollapse, CTable, CTableHead, CTableRow, CTableHeaderCell,
  CTableBody, CTableDataCell, CBadge
} from '@coreui/react';
import { cilSearch, cilFile, cilLocationPin, cilPlus, cilMinus } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import Select from "react-select";
import { getAPICall } from '../../../util/api';

const ProjectSummary = () => {
  const [projects, setProjects] = useState([]);
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [projectsList, setProjectsList] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [error, setError] = useState('');
  
  const [vendorPayments, setVendorPayments] = useState([]);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [showVendorDetails, setShowVendorDetails] = useState(false);

  const [rawMaterials, setRawMaterials] = useState([]);
  const [loadingRawMaterials, setLoadingRawMaterials] = useState(false);
  const [showRawMaterialDetails, setShowRawMaterialDetails] = useState(false);

  const [showOrderDetails, setShowOrderDetails] = useState(false);

  const formatIndianCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Number(amount || 0));
  };

  const formatNumber = (num) => {
    return Number(num || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const fetchVendorPayments = async (projectId) => {
    if (!projectId) return;
    
    setLoadingVendors(true);
    try {
      const response = await getAPICall(`/api/vendor-payments/${projectId}`);
      setVendorPayments(Array.isArray(response) ? response : (response?.data || []));
    } catch (error) {
      console.error('Error fetching vendor payments:', error);
      setVendorPayments([]);
    } finally {
      setLoadingVendors(false);
    }
  };

  const fetchRawMaterials = async (projectId) => {
    if (!projectId) return;

    setLoadingRawMaterials(true);
    try {
      const response = await getAPICall(`/api/getRawMaterialsForSummary?project_id=${projectId}`);
      setRawMaterials(Array.isArray(response) ? response : (response?.data || []));
    } catch (error) {
      console.error('Error fetching raw materials:', error);
      setRawMaterials([]);
    } finally {
      setLoadingRawMaterials(false);
    }
  };

  const getVendorTotals = () => {
    return vendorPayments.reduce(
      (totals, vendor) => ({
        totalAmount: totals.totalAmount + Number(vendor.total_amount || 0),
        paidAmount: totals.paidAmount + Number(vendor.paid_amount || 0),
        balanceAmount: totals.balanceAmount + Number(vendor.balance_amount || 0)
      }),
      { totalAmount: 0, paidAmount: 0, balanceAmount: 0 }
    );
  };

  const getRawMaterialTotal = () => {
    return rawMaterials.reduce((total, material) => total + Number(material.used_qty || 0), 0);
  };

  const getPaymentStatus = (vendor) => {
    const total = parseFloat(vendor.total_amount || 0);
    const paid = parseFloat(vendor.paid_amount || 0);
    
    if (paid === 0) return { text: 'Unpaid', color: 'danger' };
    if (paid >= total) return { text: 'Paid', color: 'success' };
    return { text: 'Partial', color: 'warning' };
  };

  const getOrderStatusBadge = (status) => {
    const statusStr = String(status || '').toLowerCase();
    const statusMap = {
      'pending': { color: 'warning', text: 'Pending' },
      'completed': { color: 'success', text: 'Completed' },
      'cancelled': { color: 'danger', text: 'Cancelled' },
      'processing': { color: 'info', text: 'Processing' },
    };
    return statusMap[statusStr] || { color: 'secondary', text: status || 'Unknown' };
  };

  const fetchProjectSummary = async (projectId = null) => {
    setLoading(true);
    try {
      const res = await getAPICall(
        `/api/project-summary${projectId ? `?project_id=${projectId}` : ''}`
      );
      console.log(res);
      setProjects(res.data);

      

      const dropdownList = res.data.map(p => ({
        value: p.sr_no.toString(),
        label: `${p.site_name} - ${p.company_name}`,
      }));
      setProjectsList(dropdownList);

      if (!projectId && res.data.length > 0) {
        setSelectedProjectId(res.data[0].sr_no.toString());
        setCurrentProjectIndex(0);
        fetchVendorPayments(res.data[0].sr_no);
        fetchRawMaterials(res.data[0].sr_no);
      }
    } catch (err) {
      setError('Error fetching project summary data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectSummary();
  }, []);

  const handleProjectSelection = (selectedOption) => {
    if (selectedOption) {
      setSelectedProjectId(selectedOption.value);
      const projectIndex = projects.findIndex(p => p.sr_no.toString() === selectedOption.value);
      if (projectIndex !== -1) {
        setCurrentProjectIndex(projectIndex);
        fetchVendorPayments(selectedOption.value);
        fetchRawMaterials(selectedOption.value);
      }
    } else {
      setSelectedProjectId('');
      setCurrentProjectIndex(0);
      setVendorPayments([]);
      setRawMaterials([]);
    }
  };

  const currentProject = projects[currentProjectIndex];
  const vendorTotals = getVendorTotals();
  const totalUsedQty = getRawMaterialTotal();

  if (loading) {
    return (
      <CContainer fluid>
        <div className="text-center p-4">
          <CSpinner color="primary" />
          <p className="mt-2">Loading project summary...</p>
        </div>
      </CContainer>
    );
  }

  return (
    <CContainer fluid>
      <CCard>
        <CCardHeader className="bg-primary text-white">
          <h1 className="mb-0 h4 d-flex align-items-center">
            <CIcon icon={cilFile} className="me-2" /> Project Summary Report
          </h1>
        </CCardHeader>

        <CCardBody className="p-4">
          {error && (
            <CAlert color="danger" dismissible onClose={() => setError('')}>
              {error}
            </CAlert>
          )}

          {currentProject && (
            <CForm>
              <CCard className="mb-4 border-0" color="primary" textColor="dark">
                <CCardBody className="bg-primary-subtle rounded">
                  <h5 className="text-primary mb-3 d-flex align-items-center">
                    <CIcon icon={cilSearch} className="me-2" /> Project Selection & Customer Information
                  </h5>
                  <CRow className="g-3">
                    <CCol lg={6} md={12}>
                      <CFormLabel>Select Project</CFormLabel>
                      <Select
                        options={projectsList}
                        isSearchable
                        isClearable
                        placeholder="Select a project..."
                        value={projectsList.find(p => p.value === selectedProjectId) || null}
                        onChange={handleProjectSelection}
                        className="react-select-container"
                        classNamePrefix="react-select"
                      />
                    </CCol>
                    <CCol lg={6} md={12}>
                      <CFormLabel>Company Name</CFormLabel>
                      <CFormInput
                        value={currentProject.company_name}
                        readOnly
                        className="bg-white"
                      />
                    </CCol>
                  </CRow>
                </CCardBody>
              </CCard>

              <CCard
                className="mb-4 border-0"
                color={currentProject.sales?.is_positive_balance ? "success" : "danger"}
                textColor="dark"
              >
                <CCardBody
                  className={`${currentProject.sales?.is_positive_balance ? 'bg-success-subtle' : 'bg-danger-subtle'} rounded`}
                >
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className={`${currentProject.sales?.is_positive_balance ? 'text-success' : 'text-danger'} mb-0`}>
                      Sales
                    </h5>
                    <small className="text-muted fst-italic">* Including GST</small>
                  </div>
                  <CRow className="g-3">
                    <CCol lg={3} md={3} sm={12}>
                      <CFormLabel className="fs-6 fw-bold">Total Amount (with GST)</CFormLabel>
                      <CInputGroup>
                        <CInputGroupText className="bg-primary text-white">₹</CInputGroupText>
                        <CFormInput
                          value={formatIndianCurrency(currentProject.sales?.total_amount || 0)}
                          readOnly
                          className="bg-white fw-bold text-primary"
                        />
                      </CInputGroup>
                    </CCol>



<CCol lg={3} md={3} sm={12}>
                      <CFormLabel className="fs-6 fw-bold"> GST Amount</CFormLabel>
                      <CInputGroup>
                        <CInputGroupText className="bg-primary text-white">₹</CInputGroupText>
                        <CFormInput
                          value={formatIndianCurrency(currentProject.sales?.gst_amount || 0)}
                          readOnly
                          className="bg-white fw-bold text-primary"
                        />
                      </CInputGroup>
                    </CCol>


                    <CCol lg={3} md={3} sm={12}>
                      <CFormLabel className="fs-6 fw-bold">Expense Amount</CFormLabel>
                      <CInputGroup>
                        <CInputGroupText className="bg-warning text-dark">₹</CInputGroupText>
                        <CFormInput
                          value={formatIndianCurrency(currentProject.sales?.expense_amount || 0)}
                          readOnly
                          className="bg-white fw-bold text-warning"
                        />
                      </CInputGroup>
                    </CCol>
                    <CCol lg={3} md={3} sm={12}>
                      <CFormLabel className="fs-6 fw-bold">Net Balance</CFormLabel>
                      <CInputGroup>
                        <CInputGroupText
                          className={currentProject.sales?.is_positive_balance ? 'bg-success text-white' : 'bg-danger text-white'}
                        >
                          ₹
                        </CInputGroupText>
                        <CFormInput
                          value={formatIndianCurrency(currentProject.sales?.net_balance || 0)}
                          readOnly
                          className={`bg-white fw-bold ${
                            currentProject.sales?.is_positive_balance ? 'text-success' : 'text-danger'
                          }`}
                        />
                      </CInputGroup>
                    </CCol>
                  </CRow>
                </CCardBody>
              </CCard>

              <CCard className="mb-4 border-0" color="secondary" textColor="dark">
                <CCardBody className="bg-secondary-subtle rounded">
                  <h5 className="text-secondary mb-3">Payment Received in Account</h5>
                  {currentProject.receiver_banks && currentProject.receiver_banks.length > 0 ? (
                    <CRow className="g-3">
                      {currentProject.receiver_banks.map((bank, index) => (
                        <CCol xl={4} lg={6} md={6} sm={12} key={index}>
                          <CFormLabel>
                            <strong>{bank.account_name || bank.bank_name || 'Unknown Account'}</strong>
                            {bank.bank_name && bank.account_name && bank.bank_name !== bank.account_name && (
                              <span className="text-muted ms-1">({bank.bank_name})</span>
                            )}
                          </CFormLabel>
                          {bank.account_number && (
                            <div className="small text-muted mb-1">
                              A/C: {bank.account_number}
                              {bank.ifsc_code && ` | IFSC: ${bank.ifsc_code}`}
                            </div>
                          )}
                          <CInputGroup>
                            <CInputGroupText className="bg-secondary text-white">₹</CInputGroupText>
                            <CFormInput
                              value={formatIndianCurrency(bank.amount)}
                              readOnly
                              className="bg-white fw-bold"
                            />
                          </CInputGroup>
                        </CCol>
                      ))}
                    </CRow>
                  ) : (
                    <div className="text-center py-3 text-muted">
                      <p className="mb-0">No payment account information available</p>
                    </div>
                  )}
                </CCardBody>
              </CCard>





              {/* <CCard className="mb-4 border-0" color="info" textColor="dark">
                <CCardBody className="bg-info-subtle rounded">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="text-info mb-0">Payment / Order Details</h5>
                    {currentProject.order_details && currentProject.order_details.length > 0 && (
                      <CButton
                        color="info"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowOrderDetails(!showOrderDetails)}
                      >
                        <CIcon 
                          icon={showOrderDetails ? cilMinus : cilPlus} 
                          className="me-1" 
                        />
                        {showOrderDetails ? 'Hide Details' : 'Show Details'}
                      </CButton>
                    )}
                  </div>
                  <CRow className="g-3 mb-3">
                    <CCol lg={4} md={6} sm={12}>
                      <CFormLabel>Amount (without GST)</CFormLabel>
                      <CInputGroup>
                        <CInputGroupText className="bg-secondary text-white">₹</CInputGroupText>
                        <CFormInput
                          value={formatIndianCurrency(currentProject.order_summary?.total_amount_without_gst || 0)}
                          readOnly
                          className="bg-white fw-bold"
                        />
                      </CInputGroup>
                    </CCol>
                    <CCol lg={4} md={6} sm={12}>
                      <CFormLabel>GST Amount</CFormLabel>
                      <CInputGroup>
                        <CInputGroupText className="bg-primary text-white">₹</CInputGroupText>
                        <CFormInput
                          value={formatIndianCurrency(currentProject.order_summary?.gst_amount || 0)}
                          readOnly
                          className="bg-white fw-bold text-primary"
                        />
                      </CInputGroup>
                    </CCol>
                    <CCol lg={4} md={12} sm={12}>
                      <CFormLabel>Amount (with GST)</CFormLabel>
                      <CInputGroup>
                        <CInputGroupText className="bg-info text-white">₹</CInputGroupText>
                        <CFormInput
                          value={formatIndianCurrency(currentProject.order_summary?.final_amount_with_gst || 0)}
                          readOnly
                          className="bg-white fw-bold text-info"
                        />
                      </CInputGroup>
                    </CCol>
                  </CRow>
                  <CRow className="g-3">
                    <CCol lg={6} md={6} sm={12}>
                      <CFormLabel>Paid Amount</CFormLabel>
                      <CInputGroup>
                        <CInputGroupText className="bg-success text-white">₹</CInputGroupText>
                        <CFormInput
                          value={formatIndianCurrency(currentProject.order_summary?.paid_amount || 0)}
                          readOnly
                          className="bg-white fw-bold text-success"
                        />
                      </CInputGroup>
                    </CCol>
                    <CCol lg={6} md={6} sm={12}>
                      <CFormLabel>Pending Amount</CFormLabel>
                      <CInputGroup>
                        <CInputGroupText className="bg-warning text-dark">₹</CInputGroupText>
                        <CFormInput
                          value={formatIndianCurrency(currentProject.order_summary?.pending_amount || 0)}
                          readOnly
                          className="bg-white fw-bold text-warning"
                        />
                      </CInputGroup>
                    </CCol>
                  </CRow>

                  {currentProject.order_details && currentProject.order_details.length > 0 && (
                    <CCollapse visible={showOrderDetails}>
                      <div className="mt-4">
                        <h6 className="text-dark mb-3">Individual Order Details</h6>
                        <div className="table-responsive">
                          <CTable striped hover className="bg-white">
                            <CTableHead color="dark">
                              <CTableRow>
                                <CTableHeaderCell>Invoice #</CTableHeaderCell>
                                <CTableHeaderCell>Invoice Date</CTableHeaderCell>
                                <CTableHeaderCell>Total Amount</CTableHeaderCell>
                                <CTableHeaderCell>GST</CTableHeaderCell>
                                <CTableHeaderCell>Final Amount</CTableHeaderCell>
                                <CTableHeaderCell>Paid</CTableHeaderCell>
                                <CTableHeaderCell>Pending</CTableHeaderCell>
                                <CTableHeaderCell>Status</CTableHeaderCell>
                                <CTableHeaderCell>Payment Type</CTableHeaderCell>
                              </CTableRow>
                            </CTableHead>
                            <CTableBody>
                              {currentProject.order_details.map((order) => {
                                const status = getOrderStatusBadge(order.order_status);
                                return (
                                  <CTableRow key={order.id}>
                                    <CTableDataCell>
                                      <div className="fw-bold">{order.invoice_number || '-'}</div>
                                      <small className="text-muted">ID: {order.id}</small>
                                    </CTableDataCell>
                                    <CTableDataCell>
                                      {order.invoice_date || '-'}
                                    </CTableDataCell>
                                    <CTableDataCell>
                                      {formatIndianCurrency(order.total_amount)}
                                      {order.discount > 0 && (
                                        <div>
                                          <small className="text-success">
                                            Discount: {formatIndianCurrency(order.discount)}
                                          </small>
                                        </div>
                                      )}
                                    </CTableDataCell>
                                    <CTableDataCell>
                                      {formatIndianCurrency(order.gst_amount)}
                                      <div>
                                        <small className="text-muted">
                                          {order.cgst > 0 && `CGST: ${formatIndianCurrency(order.cgst)} `}
                                          {order.sgst > 0 && `SGST: ${formatIndianCurrency(order.sgst)} `}
                                          {order.igst > 0 && `IGST: ${formatIndianCurrency(order.igst)}`}
                                        </small>
                                      </div>
                                    </CTableDataCell>
                                    <CTableDataCell className="fw-bold">
                                      {formatIndianCurrency(order.final_amount)}
                                    </CTableDataCell>
                                    <CTableDataCell className="text-success fw-bold">
                                      {formatIndianCurrency(order.paid_amount)}
                                    </CTableDataCell>
                                    <CTableDataCell className="text-danger fw-bold">
                                      {formatIndianCurrency(order.pending_amount)}
                                    </CTableDataCell>
                                    <CTableDataCell>
                                      <CBadge color={status.color}>{status.text}</CBadge>
                                      {order.is_settled && (
                                        <div><CBadge color="success" className="mt-1">Settled</CBadge></div>
                                      )}
                                    </CTableDataCell>
                                    <CTableDataCell>
                                      {order.payment_type || '-'}
                                      {order.pay_later && (
                                        <div><CBadge color="warning" className="mt-1">Pay Later</CBadge></div>
                                      )}
                                    </CTableDataCell>
                                  </CTableRow>
                                );
                              })}
                            </CTableBody>
                          </CTable>
                        </div>
                      </div>
                    </CCollapse>
                  )}
                </CCardBody>
              </CCard> */}




<CCard className="mb-4 border-0" color="info" textColor="dark">
  <CCardBody className="bg-info-subtle rounded">
    <div className="d-flex justify-content-between align-items-center mb-4">
      <h5 className="text-info mb-0">Payment / Order Details</h5>
      {currentProject.order_details?.length > 0 && (
        <CButton
          color="info"
          variant="outline"
          size="sm"
          onClick={() => setShowOrderDetails(!showOrderDetails)}
        >
          <CIcon 
            icon={showOrderDetails ? cilMinus : cilPlus} 
            className="me-1" 
          />
          {showOrderDetails ? 'Hide Details' : 'Show Details'}
        </CButton>
      )}
    </div>

    {/* Summary – Always visible with correct fields */}
    <CRow className="g-3 mb-4">
      {/* 1. Total Amount (excluding GST) */}
      <CCol lg={4} md={6} sm={12}>
        <CFormLabel className="fs-6 fw-bold">Total Amount (excl. GST)</CFormLabel>
        <CInputGroup>
          <CInputGroupText className="bg-secondary text-white">₹</CInputGroupText>
          <CFormInput
            value={formatIndianCurrency(currentProject.order_summary?.total_amount_without_gst || 0)}
            readOnly
            className="bg-white fw-bold text-secondary"
          />
        </CInputGroup>
      </CCol>

      {/* 2. GST Amount */}
      <CCol lg={4} md={6} sm={12}>
        <CFormLabel className="fs-6 fw-bold">Total GST Amount</CFormLabel>
        <CInputGroup>
          <CInputGroupText className="bg-primary text-white">₹</CInputGroupText>
          <CFormInput
            value={formatIndianCurrency(currentProject.order_summary?.gst_amount || 0)}
            readOnly
            className="bg-white fw-bold text-primary"
          />
        </CInputGroup>
      </CCol>

      {/* 3. Grand Total (incl. GST) */}
      <CCol lg={4} md={12} sm={12}>
        <CFormLabel className="fs-6 fw-bold">Grand Total (incl. GST)</CFormLabel>
        <CInputGroup>
          <CInputGroupText className="bg-info text-white">₹</CInputGroupText>
          <CFormInput
            value={formatIndianCurrency(currentProject.order_summary?.final_amount_with_gst || 0)}
            readOnly
            className="bg-white fw-bold text-info"
          />
        </CInputGroup>
      </CCol>
    </CRow>

    {/* Paid & Pending */}
    <CRow className="g-3 mb-4">
      <CCol lg={6} md={6} sm={12}>
        <CFormLabel className="fs-6 fw-bold">Total Paid Amount</CFormLabel>
        <CInputGroup>
          <CInputGroupText className="bg-success text-white">₹</CInputGroupText>
          <CFormInput
            value={formatIndianCurrency(currentProject.order_summary?.paid_amount || 0)}
            readOnly
            className="bg-white fw-bold text-success"
          />
        </CInputGroup>
      </CCol>

      <CCol lg={6} md={6} sm={12}>
        <CFormLabel className="fs-6 fw-bold">Pending / Balance Amount</CFormLabel>
        <CInputGroup>
          <CInputGroupText className="bg-warning text-dark">₹</CInputGroupText>
          <CFormInput
            value={formatIndianCurrency(currentProject.order_summary?.pending_amount || 0)}
            readOnly
            className="bg-white fw-bold text-warning"
          />
        </CInputGroup>
      </CCol>
    </CRow>

    {/* Individual Orders Table – Only if orders exist */}
    {currentProject.order_details?.length > 0 && (
      <CCollapse visible={showOrderDetails}>
        <div className="mt-5">
          <h6 className="text-dark mb-3 fw-bold">Individual Invoice / Order Details</h6>
          <div className="table-responsive">
            <CTable striped hover responsive className="bg-white shadow-sm">
              <CTableHead color="dark">
                <CTableRow>
                  <CTableHeaderCell>Invoice #</CTableHeaderCell>
                  <CTableHeaderCell>Date</CTableHeaderCell>
                  <CTableHeaderCell>Amount (excl. GST)</CTableHeaderCell>
                  <CTableHeaderCell>GST Amount</CTableHeaderCell>
                  <CTableHeaderCell>Grand Total</CTableHeaderCell>
                  <CTableHeaderCell>Paid</CTableHeaderCell>
                  <CTableHeaderCell>Pending</CTableHeaderCell>
                  <CTableHeaderCell>Status</CTableHeaderCell>
                  <CTableHeaderCell>Payment Type</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {currentProject.order_details.map((order) => {
                  const status = getOrderStatusBadge(order.order_status);
                  return (
                    <CTableRow key={order.id}>
                      <CTableDataCell>
                        <div className="fw-bold">{order.invoice_number || 'Draft'}</div>
                        <small className="text-muted">ID: {order.id}</small>
                      </CTableDataCell>
                      <CTableDataCell>{order.invoice_date || '-'}</CTableDataCell>
                      <CTableDataCell className="text-secondary fw-bold">
                        {formatIndianCurrency(order.total_amount || 0)}
                      </CTableDataCell>
                      <CTableDataCell className="text-primary fw-bold">
                        {formatIndianCurrency(order.gst_amount || (order.cgst + order.sgst + order.igst) || 0)}
                      </CTableDataCell>
                      <CTableDataCell className="fw-bold text-info">
                        {formatIndianCurrency(order.final_amount || 0)}
                      </CTableDataCell>
                      <CTableDataCell className="text-success fw-bold">
                        {formatIndianCurrency(order.paid_amount || 0)}
                      </CTableDataCell>
                      <CTableDataCell className="text-danger fw-bold">
                        {formatIndianCurrency(order.pending_amount || 0)}
                      </CTableDataCell>
                      <CTableDataCell>
                        <CBadge color={status.color} size="lg">{status.text}</CBadge>
                        {order.is_settled && (
                          <CBadge color="success" className="ms-2">Settled</CBadge>
                        )}
                      </CTableDataCell>
                      <CTableDataCell>
                        {order.payment_type || 'N/A'}
                        {order.pay_later && <CBadge color="warning" className="ms-2">Pay Later</CBadge>}
                      </CTableDataCell>
                    </CTableRow>
                  );
                })}
              </CTableBody>
            </CTable>
          </div>
        </div>
      </CCollapse>
    )}

    {/* No orders fallback */}
    {(!currentProject.order_details || currentProject.order_details.length === 0) && (
      <div className="text-center py-4 text-muted">
        <p className="mb-0">No order / invoice details available for this project yet.</p>
      </div>
    )}
  </CCardBody>
</CCard>








              <CCard className="mb-4 border-0" color="success" textColor="dark">
                <CCardBody className="bg-success-subtle rounded">
                  <h5 className="text-success mb-4">Work Done</h5>
                  
                  <div className="mb-4">
                    <h6 className="text-success mb-3">DTH Work</h6>
                    <CRow className="g-3">
                      <CCol lg={4} md={4} sm={12}>
                        <CFormLabel>Total DTH Points</CFormLabel>
                        <CFormInput
                          value={formatNumber(currentProject.total_dth_points)}
                          readOnly
                          className="bg-white fw-bold text-center"
                        />
                      </CCol>
                      <CCol lg={4} md={4} sm={12}>
                        <CFormLabel>Average Rate per Point</CFormLabel>
                        <CInputGroup>
                          <CInputGroupText>₹</CInputGroupText>
                          <CFormInput
                            value={formatNumber(currentProject.avg_dth_rate)}
                            readOnly
                            className="bg-white fw-bold"
                          />
                        </CInputGroup>
                      </CCol>
                      <CCol lg={4} md={4} sm={12}>
                        <CFormLabel>Total DTH Billing</CFormLabel>
                        <CInputGroup>
                          <CInputGroupText className="bg-success text-white">₹</CInputGroupText>
                          <CFormInput
                            value={formatIndianCurrency(currentProject.total_dth_billing_amount)}
                            readOnly
                            className="bg-white fw-bold text-success"
                          />
                        </CInputGroup>
                      </CCol>
                    </CRow>
                  </div>

                  <div>
                    <h6 className="text-success mb-3">Survey Work</h6>
                    <CRow className="g-3">
                      <CCol lg={4} md={4} sm={12}>
                        <CFormLabel>Total Survey Points</CFormLabel>
                        <CFormInput
                          value={formatNumber(currentProject.total_survey_points)}
                          readOnly
                          className="bg-white fw-bold text-center"
                        />
                      </CCol>
                      <CCol lg={4} md={4} sm={12}>
                        <CFormLabel>Average Rate per Point</CFormLabel>
                        <CInputGroup>
                          <CInputGroupText>₹</CInputGroupText>
                          <CFormInput
                            value={formatNumber(currentProject.avg_survey_rate)}
                            readOnly
                            className="bg-white fw-bold"
                          />
                        </CInputGroup>
                      </CCol>
                      <CCol lg={4} md={4} sm={12}>
                        <CFormLabel>Total Survey Billing</CFormLabel>
                        <CInputGroup>
                          <CInputGroupText className="bg-success text-white">₹</CInputGroupText>
                          <CFormInput
                            value={formatIndianCurrency(currentProject.total_survey_billing_amount)}
                            readOnly
                            className="bg-white fw-bold text-success"
                          />
                        </CInputGroup>
                      </CCol>
                    </CRow>
                  </div>
                </CCardBody>
              </CCard>

              <CCard className="mb-4 border-0" color="warning" textColor="dark">
                <CCardBody className="bg-warning-subtle rounded">
                  <div className="d-flex gap-4 mb-3">
                    <h5 className="text-warning mb-0">Expenses</h5>
                    <h5 className="text-dark mb-0">
                      ( Total:
                      <span className="text-warning fw-bold ms-1">
                        {formatIndianCurrency(currentProject.expenses?.total_expenses || 0)}
                      </span> )
                    </h5>
                  </div>
                  <CRow className="g-3">
                    <CCol xl={3} lg={6} md={6} sm={12}>
                      <CFormLabel>Transport</CFormLabel>
                      <CInputGroup>
                        <CInputGroupText>₹</CInputGroupText>
                        <CFormInput
                          value={formatIndianCurrency(currentProject.expenses?.transport || 0)}
                          readOnly
                          className="bg-white fw-bold"
                        />
                      </CInputGroup>
                    </CCol>
                    <CCol xl={3} lg={6} md={6} sm={12}>
                      <CFormLabel>Other Billing</CFormLabel>
                      <CInputGroup>
                        <CInputGroupText>₹</CInputGroupText>
                        <CFormInput
                          value={formatIndianCurrency(currentProject.expenses?.other_billing || 0)}
                          readOnly
                          className="bg-white fw-bold"
                        />
                      </CInputGroup>
                    </CCol>
                    <CCol xl={3} lg={6} md={6} sm={12}>
                      <CFormLabel>Total Fuel Amount</CFormLabel>
                      <CInputGroup>
                        <CInputGroupText>₹</CInputGroupText>
                        <CFormInput
                          value={formatIndianCurrency(currentProject.expenses?.diesel || 0)}
                          readOnly
                          className="bg-white fw-bold"
                        />
                      </CInputGroup>
                    </CCol>
                    <CCol xl={3} lg={6} md={6} sm={12}>
                      <CFormLabel>Extra Billing</CFormLabel>
                      <CInputGroup>
                        <CInputGroupText>₹</CInputGroupText>
                        <CFormInput
                          value={formatIndianCurrency(currentProject.expenses?.extra_billing || 0)}
                          readOnly
                          className="bg-white fw-bold"
                        />
                      </CInputGroup>
                    </CCol>
                  </CRow>
                </CCardBody>
              </CCard>

              <CCard className="mb-4 border-0" color="dark" textColor="dark">
                <CCardBody className="bg-dark-subtle rounded">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="d-flex gap-4">
                      <h5 className="text-dark mb-0">Vendor Payments</h5>
                      {vendorPayments.length > 0 && (
                        <h5 className="text-muted mb-0">
                          ( Total:
                          <span className="text-dark fw-bold ms-1">
                            {formatIndianCurrency(vendorTotals.totalAmount)}
                          </span> )
                        </h5>
                      )}
                    </div>
                    {vendorPayments.length > 0 && (
                      <CButton
                        color="dark"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowVendorDetails(!showVendorDetails)}
                      >
                        <CIcon 
                          icon={showVendorDetails ? cilMinus : cilPlus} 
                          className="me-1" 
                        />
                        {showVendorDetails ? 'Hide Details' : 'Show Details'}
                      </CButton>
                    )}
                  </div>

                  {loadingVendors ? (
                    <div className="text-center py-3">
                      <CSpinner size="sm" />
                      <span className="ms-2">Loading vendor payments...</span>
                    </div>
                  ) : vendorPayments.length > 0 ? (
                    <>
                      <CRow className="g-3">
                        <CCol xl={4} lg={6} md={12}>
                          <CFormLabel>Total Vendor Amount</CFormLabel>
                          <CInputGroup>
                            <CInputGroupText className="bg-dark text-white">₹</CInputGroupText>
                            <CFormInput
                              value={formatIndianCurrency(vendorTotals.totalAmount)}
                              readOnly
                              className="bg-white fw-bold"
                            />
                          </CInputGroup>
                        </CCol>
                        <CCol xl={4} lg={6} md={12}>
                          <CFormLabel>Total Paid Amount</CFormLabel>
                          <CInputGroup>
                            <CInputGroupText className="bg-success text-white">₹</CInputGroupText>
                            <CFormInput
                              value={formatIndianCurrency(vendorTotals.paidAmount)}
                              readOnly
                              className="bg-white fw-bold text-success"
                            />
                          </CInputGroup>
                        </CCol>
                        <CCol xl={4} lg={12} md={12}>
                          <CFormLabel>Total Remaining Amount</CFormLabel>
                          <CInputGroup>
                            <CInputGroupText className="bg-warning text-dark">₹</CInputGroupText>
                            <CFormInput
                              value={formatIndianCurrency(vendorTotals.balanceAmount)}
                              readOnly
                              className="bg-white fw-bold text-warning"
                            />
                          </CInputGroup>
                        </CCol>
                      </CRow>

                      <CCollapse visible={showVendorDetails}>
                        <div className="mt-4">
                          <h6 className="text-dark mb-3">Individual Vendor Details</h6>
                          <div className="table-responsive">
                            <CTable striped hover className="bg-white">
                              <CTableHead color="dark">
                                <CTableRow>
                                  <CTableHeaderCell>Vendor Name</CTableHeaderCell>
                                  <CTableHeaderCell>Total Amount</CTableHeaderCell>
                                  <CTableHeaderCell>Paid Amount</CTableHeaderCell>
                                  <CTableHeaderCell>Balance Amount</CTableHeaderCell>
                                  <CTableHeaderCell>Status</CTableHeaderCell>
                                </CTableRow>
                              </CTableHead>
                              <CTableBody>
                                {vendorPayments.map((vendor) => {
                                  const status = getPaymentStatus(vendor);
                                  return (
                                    <CTableRow key={vendor.id}>
                                      <CTableDataCell>
                                        <div>
                                          <div className="fw-bold">
                                            {vendor.vendor?.name || 'Unknown Vendor'}
                                          </div>
                                          {vendor.vendor?.mobile && (
                                            <small className="text-muted">
                                              {vendor.vendor.mobile}
                                            </small>
                                          )}
                                        </div>
                                      </CTableDataCell>
                                      <CTableDataCell>
                                        {formatIndianCurrency(vendor.total_amount)}
                                      </CTableDataCell>
                                      <CTableDataCell className="text-success fw-bold">
                                        {formatIndianCurrency(vendor.paid_amount)}
                                      </CTableDataCell>
                                      <CTableDataCell className="text-warning fw-bold">
                                        {formatIndianCurrency(vendor.balance_amount)}
                                      </CTableDataCell>
                                      <CTableDataCell>
                                        <CBadge color={status.color}>{status.text}</CBadge>
                                      </CTableDataCell>
                                    </CTableRow>
                                  );
                                })}
                              </CTableBody>
                            </CTable>
                          </div>
                        </div>
                      </CCollapse>
                    </>
                  ) : (
                    <div className="text-center py-3 text-muted">
                      <p className="mb-0">No vendor payments found for this project</p>
                    </div>
                  )}
                </CCardBody>
              </CCard>

              <CCard className="mb-4 border-0" color="info" textColor="dark">
                <CCardBody className="bg-info-subtle rounded">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="d-flex gap-4">
                      <h5 className="text-info mb-0">Used Raw Material</h5>
                      {rawMaterials.length > 0 && (
                        <h5 className="text-muted mb-0">
                          ( Total Quantity:
                          <span className="text-info fw-bold ms-1">
                            {formatNumber(totalUsedQty)}
                          </span> )
                        </h5>
                      )}
                    </div>
                  </div>

                  {loadingRawMaterials ? (
                    <div className="text-center py-3">
                      <CSpinner size="sm" />
                      <span className="ms-2">Loading raw materials...</span>
                    </div>
                  ) : rawMaterials.length > 0 ? (
                    <div className="table-responsive">
                      <CTable striped hover className="bg-white">
                        <CTableHead color="dark">
                          <CTableRow>
                            <CTableHeaderCell>Material Name</CTableHeaderCell>
                            <CTableHeaderCell>Used Quantity</CTableHeaderCell>
                            <CTableHeaderCell>Amount</CTableHeaderCell>
                          </CTableRow>
                        </CTableHead>
                        <CTableBody>
                          {rawMaterials.map((material) => (
                            <CTableRow key={material.id}>
                              <CTableDataCell>
                                <div className="fw-bold">
                                  {material.material_name || 'Unknown Material'}
                                </div>
                                {material.local_name && material.local_name !== material.material_name && (
                                  <small className="text-muted">{material.local_name}</small>
                                )}
                              </CTableDataCell>
                              <CTableDataCell>
                                {formatNumber(material.used_qty)}
                              </CTableDataCell>
                              <CTableDataCell>
                                {material.misc ? formatIndianCurrency(material.misc) : '-'}
                              </CTableDataCell>
                            </CTableRow>
                          ))}
                        </CTableBody>
                      </CTable>
                    </div>
                  ) : (
                    <div className="text-center py-3 text-muted">
                      <p className="mb-0">No raw materials found for this project</p>
                    </div>
                  )}
                </CCardBody>
              </CCard>

            </CForm>
          )}

          {!loading && projects.length === 0 && (
            <div className="text-center p-4 text-muted">
              <CIcon icon={cilLocationPin} size="3xl" className="mb-3" />
              <h5>No Projects Found</h5>
              <p>No project data available at the moment.</p>
            </div>
          )}
        </CCardBody>
      </CCard>
    </CContainer>
  );
};

export default ProjectSummary;