import React, { useState, useEffect } from "react";
import {
  CCard,
  CCardHeader,
  CCardBody,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CSpinner,
  CAlert,
  CBadge,
  CRow,
  CCol,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilArrowLeft, cilSearch } from "@coreui/icons";
import Select from "react-select";
import { getAPICall } from "../../../util/api";
import { useLocation, useNavigate } from "react-router-dom";

const PurchaseVendorLedgerReport = () => {
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [ledgerData, setLedgerData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  // Load vendors + pre-select if passed via navigation
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const res = await getAPICall("/api/getPurchesVendor");
        const vendorOptions = (res || []).map((v) => ({
          value: v.id,
          label: v.name || v.vendor_name || "Unnamed Vendor",
        }));

        setVendors(vendorOptions);

        const passedVendorId = location.state?.vendorId;
        if (passedVendorId) {
          const found = vendorOptions.find(
            (opt) => opt.value === Number(passedVendorId)
          );
          if (found) {
            setSelectedVendor(found);
          }
        }
      } catch (err) {
        console.error("Failed to load vendors", err);
        setError("Could not load vendor list");
      }
    };

    fetchVendors();
  }, [location.state?.vendorId]);

  // Fetch ledger data
  useEffect(() => {
    if (!selectedVendor?.value) {
      setLedgerData(null);
      setError("");
      return;
    }

    const fetchLedger = async () => {
      setLedgerData(null);
      setError("");
      setLoading(true);

      try {
        const vendorId = selectedVendor.value;
        const response = await getAPICall(
          `/api/getVendorLedgerReport?vendor_id=${vendorId}`
        );

        const data = response.data;

        if (data && data.vendor_details && data.ledger_entries?.length > 0) {
          setLedgerData(data);
          setError("");
        } else {
          setError("No ledger entries found for this vendor");
          setLedgerData(null);
        }
      } catch (err) {
        console.error("Ledger API failed:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load vendor ledger report"
        );
        setLedgerData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchLedger();
  }, [selectedVendor]);

  const formatAmount = (value) => {
    const num = Number(value) || 0;
    return num.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const goBackToPurchaseReport = () => {
    navigate("/PurchaseVendorReport", {
      state: {
        vendorId: selectedVendor?.value,
        vendorLabel: selectedVendor?.label,
      },
    });
  };

  return (
    <div className="container-fluid py-3">
      <CCard className="mb-3 shadow">
        <CCardHeader className="bg-primary text-white d-flex justify-content-between align-items-center py-2 px-3">
          <strong style={{ fontSize: '1rem' }}>Vendor Ledger Report</strong>
          <small style={{ fontSize: '0.85rem' }}>Debit / Credit transactions for selected vendor</small>
        </CCardHeader>

        <CCardBody className="p-3">
          {/* Controls */}
          <div className="row g-2 mb-3 align-items-end">
            <div className="col-md-5 col-lg-4">
              <label className="form-label fw-bold mb-1" style={{ fontSize: '0.9rem' }}>
                Select Vendor <span className="text-danger">*</span>
              </label>
              <Select
                placeholder="Search vendor name..."
                options={vendors}
                value={selectedVendor}
                onChange={setSelectedVendor}
                isSearchable
                isClearable
                styles={{
                  control: (base) => ({
                    ...base,
                    minHeight: "34px",
                    fontSize: '0.9rem'
                  }),
                }}
              />
            </div>

            <div className="col-md-7 col-lg-5 d-flex gap-2 flex-wrap">
              <CButton
                color="secondary"
                onClick={goBackToPurchaseReport}
                disabled={loading}
                size="sm"
                className="flex-grow-1"
              >
                <CIcon icon={cilArrowLeft} size="sm" className="me-1" />
                Back to Purchase Report
              </CButton>

              <CButton
                color="primary"
                onClick={() => setSelectedVendor({ ...selectedVendor })}
                disabled={loading || !selectedVendor}
                size="sm"
                className="flex-grow-1"
              >
                <CIcon icon={cilSearch} size="sm" className="me-1" />
                {loading ? "Loading..." : "Refresh"}
              </CButton>
            </div>
          </div>

          {loading && (
            <div className="text-center py-5">
              <CSpinner color="primary" variant="grow" size="lg" />
              <p className="mt-2 text-muted">Loading vendor ledger...</p>
            </div>
          )}

          {error && !loading && <CAlert color="danger" dismissible className="mb-3">{error}</CAlert>}

          {!loading && !selectedVendor && !error && (
            <CAlert color="info" className="mb-3">
              Please select a vendor from the dropdown to view the ledger report.
            </CAlert>
          )}

          {!loading && ledgerData && (
            <>
              {/* Vendor Info – Single Line */}
              <div className="p-2 mb-3 bg-light border rounded d-flex flex-wrap gap-3 align-items-center">
                <div>
                  <strong>Vendor:</strong> {ledgerData.vendor_details?.vendor_name || "—"}
                  <CBadge color="info" className="ms-2">
                    ID: {ledgerData.vendor_details?.vendor_id || "—"}
                  </CBadge>
                </div>
                <div>
                  <strong>Mobile:</strong> {ledgerData.vendor_details?.mobile || "—"}
                </div>
                <div className="flex-grow-1">
                  <strong>Address:</strong> {ledgerData.vendor_details?.address || "—"}
                </div>
              </div>

              {/* Ledger Summary - Compact Row */}
              <CRow className="g-2 mb-4">
                <CCol md={4}>
                  <CCard className="text-center border shadow-sm mb-0" style={{ borderColor: "#000" }}>
                    <CCardBody className="py-2 px-3">
                      <small className="text-muted d-block mb-1" style={{ fontSize: '0.8rem' }}>
                        Total Debit (Purchases)
                      </small>
                      <strong className="text-danger" style={{ fontSize: '1.35rem' }}>
                        ₹{formatAmount(ledgerData.ledger_summary?.total_debit ?? 0)}
                      </strong>
                    </CCardBody>
                  </CCard>
                </CCol>

                <CCol md={4}>
                  <CCard className="text-center border shadow-sm mb-0" style={{ borderColor: "#000" }}>
                    <CCardBody className="py-2 px-3">
                      <small className="text-success d-block mb-1" style={{ fontSize: '0.8rem' }}>
                        Total Credit (Payments)
                      </small>
                      <strong className="text-success" style={{ fontSize: '1.35rem' }}>
                        ₹{formatAmount(ledgerData.ledger_summary?.total_credit ?? 0)}
                      </strong>
                    </CCardBody>
                  </CCard>
                </CCol>

                <CCol md={4}>
                  <CCard className="text-center border shadow-sm mb-0" style={{ borderColor: "#000" }}>
                    <CCardBody className="py-2 px-3">
                      <small className="text-primary d-block mb-1" style={{ fontSize: '0.8rem' }}>
                        Closing Balance
                      </small>
                      <strong className="text-primary" style={{ fontSize: '1.35rem' }}>
                        ₹{formatAmount(ledgerData.ledger_summary?.closing_balance ?? 0)}
                      </strong>
                    </CCardBody>
                  </CCard>
                </CCol>
              </CRow>

              {/* Ledger Table */}
              {ledgerData.ledger_entries?.length > 0 ? (
                <CTable bordered hover responsive className="mb-0" style={{ borderColor: "#000" }}>
                  <CTableHead style={{ backgroundColor: "#e3f2fd" }}>
                    <CTableRow>
                      <CTableHeaderCell style={{ borderColor: "#000", padding: "8px" }}>Date</CTableHeaderCell>
                      <CTableHeaderCell style={{ borderColor: "#000", padding: "8px" }}>Type</CTableHeaderCell>
                      <CTableHeaderCell style={{ borderColor: "#000", padding: "8px" }}>Reference</CTableHeaderCell>
                      <CTableHeaderCell style={{ borderColor: "#000", padding: "8px" }}>Project</CTableHeaderCell>
                      <CTableHeaderCell style={{ borderColor: "#000", padding: "8px" }}>Description</CTableHeaderCell>
                      <CTableHeaderCell className="text-end" style={{ borderColor: "#000", padding: "8px" }}>Debit</CTableHeaderCell>
                      <CTableHeaderCell className="text-end" style={{ borderColor: "#000", padding: "8px" }}>Credit</CTableHeaderCell>
                      <CTableHeaderCell className="text-end" style={{ borderColor: "#000", padding: "8px" }}>Balance</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {ledgerData.ledger_entries.map((entry, index) => (
                      <CTableRow key={index}>
                        <CTableDataCell style={{ borderColor: "#000", padding: "8px" }}>{entry.date || "—"}</CTableDataCell>
                        <CTableDataCell style={{ borderColor: "#000", padding: "8px" }}>
                          <CBadge
                            color={entry.type === "Purchase" ? "danger" : "success"}
                            style={{ fontSize: '0.75rem' }}
                          >
                            {entry.type}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell style={{ borderColor: "#000", padding: "8px" }}>{entry.reference || "—"}</CTableDataCell>
                        <CTableDataCell style={{ borderColor: "#000", padding: "8px" }}>{entry.project || "—"}</CTableDataCell>
                        <CTableDataCell style={{ borderColor: "#000", padding: "8px" }}>{entry.description || "—"}</CTableDataCell>
                        <CTableDataCell className="text-end text-danger fw-bold" style={{ borderColor: "#000", padding: "8px" }}>
                          {entry.debit > 0 ? `₹${formatAmount(entry.debit)}` : "—"}
                        </CTableDataCell>
                        <CTableDataCell className="text-end text-success fw-bold" style={{ borderColor: "#000", padding: "8px" }}>
                          {entry.credit > 0 ? `₹${formatAmount(entry.credit)}` : "—"}
                        </CTableDataCell>
                        <CTableDataCell className="text-end fw-bold" style={{ borderColor: "#000", padding: "8px" }}>
                          ₹{formatAmount(entry.balance)}
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              ) : (
                <CAlert color="warning" className="text-center py-3 mb-0">
                  No ledger entries found for this vendor.
                </CAlert>
              )}
            </>
          )}
        </CCardBody>
      </CCard>
    </div>
  );
};

export default PurchaseVendorLedgerReport;