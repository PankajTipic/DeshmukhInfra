import React, { useEffect, useState, useMemo } from 'react';
import { 
  CBadge, 
  CRow, 
  CCol,
  CButton, 
  CCard,
  CCardBody,
  CCardHeader,
  CForm,
  CFormInput,
  CFormSelect,
  CSpinner,
  CAlert
} from '@coreui/react';
import { MantineReactTable, useMantineReactTable } from 'mantine-react-table';
import { getAPICall } from '../../../util/api';
import { useToast } from '../../common/toast/ToastContext';

const CompanyReceipts = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [error, setError] = useState('');
  const { showToast } = useToast();

  const fetchReceipts = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        ...(search && { search }),
        ...(filterStatus && { status: filterStatus }),
      });

      const response = await getAPICall(`/api/company-receipts?${params}`);
      
      if (response.success) {
        setReceipts(response.data.data || []);
        setTotalPages(response.data.last_page || 1);
        setTotalRecords(response.data.total || 0);
      } else {
        throw new Error(response.message || 'Failed to fetch receipts');
      }
    } catch (error) {
      console.error('Error fetching company receipts:', error);
      setError('Error fetching company receipts. Please try again.');
      showToast('danger', 'Error fetching company receipts');
      setReceipts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, [page, search, filterStatus]);

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1); // Reset to first page when searching
  };

  const handleStatusFilter = (value) => {
    setFilterStatus(value);
    setPage(1);
  };

  const handleDateFilter = (from, to) => {
    setPage(1);
  };

  const clearFilters = () => {
    setSearch('');
    setFilterStatus('');
    setPage(1);
  };

  const columns = useMemo(() => [
    {
      accessorKey: 'id',
      header: 'Receipt ID',
      size: 100,
      Cell: ({ row }) => (
        <span className="fw-bold text-primary">#{row.original.id}</span>
      ),
    },
    {
      accessorKey: 'company.company_name',
      header: 'Company Name',
      size: 200,
      Cell: ({ cell }) => (
        <div>
          <div className="fw-semibold">{cell.getValue() || 'N/A'}</div>
        </div>
      ),
    },
    {
      accessorKey: 'company.phone_no',
      header: 'Mobile',
      size: 130,
      Cell: ({ cell }) => (
        <span className="text-muted">{cell.getValue() || 'N/A'}</span>
      ),
    },
    {
      accessorKey: 'company.email_id',
      header: 'Email',
      size: 200,
      Cell: ({ cell }) => (
        <span className="text-muted small">{cell.getValue() || 'N/A'}</span>
      ),
    },
    {
      accessorKey: 'plan.name',
      header: 'Plan',
      size: 150,
      Cell: ({ cell, row }) => (
        <div>
          <div className="fw-semibold">{cell.getValue() || 'N/A'}</div>
          {row.original.plan?.duration && (
            <small className="text-muted">{row.original.plan.duration} days</small>
          )}
        </div>
      ),
    },
    {
  accessorKey: 'register_date',
  header: 'Register Date',
  size: 150,
  Cell: ({ cell }) => (
    <div className="fw-semibold">
      {cell.getValue() || 'N/A'}
    </div>
  ),
},

    {
      accessorKey: 'total_amount',
      header: 'Amount',
      size: 120,
      Cell: ({ cell }) => (
        <span className="fw-bold text-success">
          ₹{parseFloat(cell.getValue() || 0).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}
        </span>
      ),
    },
    {
      accessorKey: 'transaction_id',
      header: 'Transaction ID',
      size: 180,
      Cell: ({ cell }) => (
        <code className="small bg-light p-1 rounded">
          {cell.getValue() || 'N/A'}
        </code>
      ),
    },
    {
      accessorKey: 'transaction_status',
      header: 'Status',
      size: 100,
      Cell: ({ cell }) => {
        const status = cell.getValue();
        return status === 'success' ? (
          <CBadge color="success" shape="rounded-pill">Success</CBadge>
        ) : (
          <CBadge color="danger" shape="rounded-pill">Failed</CBadge>
        );
      },
    },
  ], []);

  const table = useMantineReactTable({
    columns,
    data: receipts,
    enableStickyHeader: true,
    enableStickyFooter: true,
    enableDensityToggle: false,
    enableColumnResizing: true,
    enableFullScreenToggle: false,
    enableGlobalFilter: false,
    enableColumnFilters: false,
    enableSorting: false,
    enablePagination: false,
    mantineTableProps: {
      striped: true,
      highlightOnHover: true,
      withBorder: true,
      withColumnBorders: false,
    },
    mantineTableHeadCellProps: {
      style: {
        fontWeight: 'bold',
        backgroundColor: '#f8f9fa',
      },
    },
    state: {
      isLoading: loading,
    },
    renderEmptyRowsFallback: () => (
      <div className="text-center py-4">
        <div className="text-muted">
          {error ? (
            <CAlert color="danger" className="mb-0">
              {error}
            </CAlert>
          ) : (
            'No receipts found'
          )}
        </div>
      </div>
    ),
  });

  return (
    <CCard>
      <CCardHeader>
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Company Receipts</h5>
          <CBadge color="info" shape="rounded-pill">
            Total: {totalRecords}
          </CBadge>
        </div>
      </CCardHeader>
      
      <CCardBody>
        {/* Filters Section */}
        <CCard className="mb-4 border-0 bg-light">
          <CCardBody>
            <CForm>
              <CRow className="g-3">
                <CCol md={4}>
                  <CFormInput
                    type="text"
                    placeholder="Search by company, email, transaction ID..."
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="form-control-sm"
                  />
                </CCol>
                <CCol md={3}>
                  <CFormSelect
                    value={filterStatus}
                    onChange={(e) => handleStatusFilter(e.target.value)}
                    className="form-select-sm"
                  >
                    <option value="">All Status</option>
                    <option value="success">Success</option>
                    <option value="failed">Failed</option>
                  </CFormSelect>
                </CCol>
                <CCol md={5}>
                  <div className="d-flex gap-2">
                    <CButton 
                      color="secondary" 
                      variant="outline"
                      size="sm"
                      onClick={clearFilters}
                      disabled={!search && !filterStatus}
                    >
                      Clear Filters
                    </CButton>
                    <CButton 
                      color="primary"
                      size="sm"
                      onClick={fetchReceipts}
                      disabled={loading}
                    >
                      {loading ? <CSpinner size="sm" className="me-2" /> : null}
                      Refresh
                    </CButton>
                  </div>
                </CCol>
              </CRow>
            </CForm>
          </CCardBody>
        </CCard>

        {/* Table */}
        <div className="table-responsive">
          <MantineReactTable table={table} />
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="d-flex justify-content-between align-items-center mt-4">
            <div className="text-muted small">
              Showing {((page - 1) * 25) + 1} to {Math.min(page * 25, totalRecords)} of {totalRecords} entries
            </div>
            <div className="d-flex align-items-center gap-2">
              <CButton 
                color="primary"
                variant="outline"
                size="sm"
                disabled={page === 1 || loading} 
                onClick={() => setPage(page - 1)}
              >
                Previous
              </CButton>
              <span className="px-3 py-1 bg-light rounded small">
                Page {page} of {totalPages}
              </span>
              <CButton 
                color="primary"
                variant="outline"
                size="sm"
                disabled={page >= totalPages || loading} 
                onClick={() => setPage(page + 1)}
              >
                Next
              </CButton>
            </div>
          </div>
        )}
      </CCardBody>
    </CCard>
  );
};

export default CompanyReceipts;