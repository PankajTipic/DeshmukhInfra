import React, { useEffect, useState } from "react";
import {
  CCard,
  CCardBody,
  CCardHeader,
  CTable,
  CTableHead,
  CTableHeaderCell,
  CTableBody,
  CTableRow,
  CTableDataCell,
  CSpinner,
  CAlert,
  CRow,
  CCol,
  CFormInput,
  CButton,
  CFormSelect,
  CBadge,
} from "@coreui/react";

import { getAPICall } from "../../../util/api";
import Select from 'react-select';

const SubcontractLedgerReport = () => {
  const [loading, setLoading] = useState(false);
  const [ledgerData, setLedgerData] = useState([]);
  const [projects, setProjects] = useState([]);
  const [vendors, setVendors] = useState([]);

  const [filterProject, setFilterProject] = useState(null);
const [filterVendor, setFilterVendor] = useState(null);

  const [filters, setFilters] = useState({
    project_id: "",
    vendor_id: "",
    from_date: "",
    to_date: "",
  });

  // Fetch Projects
  const fetchProjects = async () => {
    try {
      const response = await getAPICall("/api/projects");
      setProjects(response || []);
    } catch (error) {
      console.error(error);
    }
  };

  // Fetch Vendors / Operators
  const fetchVendors = async () => {
    try {
      const response = await getAPICall("/api/operators");
      setVendors(response || []);
    } catch (error) {
      console.error(error);
    }
  };

  // Fetch Ledger Report
  const fetchLedger = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      if (filters.project_id) {
        params.append("project_id", filters.project_id);
      }

      if (filters.vendor_id) {
        params.append("vendor_id", filters.vendor_id);
      }

      if (filters.from_date) {
        params.append("from_date", filters.from_date);
      }

      if (filters.to_date) {
        params.append("to_date", filters.to_date);
      }

      const response = await getAPICall(
        `/api/subcontract-ledger-report?${params.toString()}`
      );

      if (response.success) {
        setLedgerData(response.data || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchVendors();
    fetchLedger();
  }, []);

  const resetFilters = () => {
    setFilters({
      project_id: "",
      vendor_id: "",
      from_date: "",
      to_date: "",
    });
  };

  return (
    <CCard>
      <CCardHeader>
        <h5 className="mb-0">Subcontract Ledger Report</h5>
      </CCardHeader>

      <CCardBody>

        {/* FILTERS */}
        <CRow className="mb-4 g-3">

        <div style={{ width: 250 }}>
  <label className="form-label">Project</label>

  <Select
    placeholder="Filter by Project"
    options={projects.map((p) => ({
      value: p.id,
      label: `${p.project_name} - ${p.customer_name}`,
    }))}
    value={filterProject}
    onChange={(selected) => {
      setFilterProject(selected);

      setFilters({
        ...filters,
        project_id: selected?.value || "",
      });
    }}
    isClearable
  />
</div>

       <div style={{ width: 250 }}>
  <label className="form-label">Vendor</label>

  <Select
    placeholder="Filter by Vendor"
    options={vendors.map((v) => ({
      value: v.id,
      label: v.name,
    }))}
    value={filterVendor}
    onChange={(selected) => {
      setFilterVendor(selected);

      setFilters({
        ...filters,
        vendor_id: selected?.value || "",
      });
    }}
    isClearable
  />
</div>

          <CCol md={2}>
            <label className="form-label">From Date</label>

            <CFormInput
              type="date"
              value={filters.from_date}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  from_date: e.target.value,
                })
              }
            />
          </CCol>

          <CCol md={2}>
            <label className="form-label">To Date</label>

            <CFormInput
              type="date"
              value={filters.to_date}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  to_date: e.target.value,
                })
              }
            />
          </CCol>

          <CCol md={2} className="d-flex gap-2 align-items-end">
            <CButton color="primary" onClick={fetchLedger}>
              Apply
            </CButton>

            <CButton color="secondary" onClick={resetFilters}>
              Reset
            </CButton>
          </CCol>
        </CRow>

        {/* TABLE */}
        {loading ? (
          <div className="text-center my-5">
            <CSpinner color="primary" />
          </div>
        ) : (
          <div className="table-responsive">
            <CTable bordered hover striped>
              <CTableHead color="dark">
                <CTableRow>
                  <CTableHeaderCell>Sr.No</CTableHeaderCell>
                  <CTableHeaderCell>Date</CTableHeaderCell>
                  <CTableHeaderCell>Invoice No</CTableHeaderCell>
                  <CTableHeaderCell>Project</CTableHeaderCell>
                  <CTableHeaderCell>Vendor</CTableHeaderCell>
                  <CTableHeaderCell>Type</CTableHeaderCell>
                  <CTableHeaderCell>Debit</CTableHeaderCell>
                  <CTableHeaderCell>Credit</CTableHeaderCell>
                  <CTableHeaderCell>Balance</CTableHeaderCell>
                  <CTableHeaderCell>Payment Type</CTableHeaderCell>
                  <CTableHeaderCell>Paid By</CTableHeaderCell>
                  <CTableHeaderCell>Description</CTableHeaderCell>
                </CTableRow>
              </CTableHead>

              <CTableBody>

                {ledgerData.length > 0 ? (
                  ledgerData.map((item, index) => (
                    <CTableRow key={index}>

                      <CTableDataCell>
                        {index + 1}
                      </CTableDataCell>

                      <CTableDataCell>
                        {item.date}
                      </CTableDataCell>

                      <CTableDataCell>
                        <strong>{item.invoice_no}</strong>
                      </CTableDataCell>

                      <CTableDataCell>
                        {item.project_name}
                      </CTableDataCell>

                      <CTableDataCell>
                        {item.vendor_name}
                      </CTableDataCell>

                      <CTableDataCell>
                        {item.type === "Payment" ? (
                          <CBadge color="success">
                            Payment
                          </CBadge>
                        ) : (
                          <CBadge color="warning">
                            Created
                          </CBadge>
                        )}
                      </CTableDataCell>

                      <CTableDataCell className="text-danger fw-bold">
                        ₹ {Number(item.debit || 0).toLocaleString()}
                      </CTableDataCell>

                      <CTableDataCell className="text-success fw-bold">
                        ₹ {Number(item.credit || 0).toLocaleString()}
                      </CTableDataCell>

                      <CTableDataCell className="fw-bold">
                        ₹ {Number(item.balance || 0).toLocaleString()}
                      </CTableDataCell>

                      <CTableDataCell>
                        {item.payment_type || "-"}
                      </CTableDataCell>

                      <CTableDataCell>
                        {item.paid_by || "-"}
                      </CTableDataCell>

                      <CTableDataCell>
                        {item.description || "-"}
                      </CTableDataCell>

                    </CTableRow>
                  ))
                ) : (
                  <CTableRow>
                    <CTableDataCell
                      colSpan={12}
                      className="text-center py-4"
                    >
                      <CAlert color="warning" className="mb-0">
                        No Ledger Data Found
                      </CAlert>
                    </CTableDataCell>
                  </CTableRow>
                )}

              </CTableBody>
            </CTable>
          </div>
        )}
      </CCardBody>
    </CCard>
  );
};

export default SubcontractLedgerReport;