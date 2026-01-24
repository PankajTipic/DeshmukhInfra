import React, { useEffect, useState } from 'react';
import { CBadge, CRow, CCol, CCard, CCardHeader, CCardBody, CButton, CAlert } from '@coreui/react';
import { MantineReactTable } from 'mantine-react-table';
import { getAPICall } from '../../util/api';
import { useToast } from '../common/toast/ToastContext';
import { IconAlertCircle, IconCalendarStats } from '@tabler/icons-react';

const ExpiringCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const { showToast } = useToast();
  const daysToExpire = 15; // Companies expiring in 15 days

  const fetchExpiringCompanies = async () => {
    setLoading(true);
    try {
      const response = await getAPICall(`/api/expiring-companies?days=${daysToExpire}&page=${page}&search=${search}`);
      setCompanies(response.data.data || []);
      setTotalPages(response.data.last_page || 1);
    } catch (error) {
      showToast('danger', 'Error fetching companies with expiring subscriptions');
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchExpiringCompanies();
  }, [page, search]);

  const calculateDaysRemaining = (validTill) => {
    const validDate = new Date(validTill);
    const today = new Date();
    const differenceInTime = validDate.getTime() - today.getTime();
    const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));
    return differenceInDays;
  };

  const handleRefresh = () => {
    fetchExpiringCompanies();
    showToast('success', 'Dashboard refreshed');
  };

  const columns = [
    { accessorKey: 'index', header: '#', size: 50 },
    { accessorKey: 'company_name', header: 'Company', size: 200 },
    { accessorKey: 'contact_person', header: 'Contact Person', size: 150 },
    { accessorKey: 'phone_no', header: 'Mobile', size: 120 },
    { accessorKey: 'email_id', header: 'Email', size: 180 },
    { accessorKey: 'current_plan', header: 'Current Plan', size: 120 },
    { 
      accessorKey: 'valid_till', 
      header: 'Valid Till', 
      size: 120,
      Cell: ({ cell }) => {
        const date = new Date(cell.getValue());
        return date.toLocaleDateString();
      }
    },
    {
      accessorKey: 'days_remaining',
      header: 'Days Left',
      size: 100,
      Cell: ({ cell, row }) => {
        const daysLeft = cell.getValue();
        return (
          <CBadge color={daysLeft <= 5 ? "danger" : "warning"}>
            {daysLeft} days
          </CBadge>
        );
      },
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      size: 100,
      Cell: ({ row }) => (
        <CButton 
          size="sm" 
          color="primary"
          onClick={() => window.location.href = `/companies/renew/${row.original.id}`}
        >
          Renew
        </CButton>
      ),
    },
  ];

  // Add days_remaining to each company and sort by days remaining (ascending)
  const data = companies
    .map((company, index) => ({
      ...company,
      index: index + 1,
      days_remaining: calculateDaysRemaining(company.valid_till)
    }))
    .sort((a, b) => a.days_remaining - b.days_remaining);

  const noExpiringCompanies = data.length === 0 && !loading;

  return (
    <>
      <CRow className="mb-3">
        <CCol>
          <CCard>
            <CCardHeader className="d-flex justify-content-between align-items-center bg-warning-subtle">
              <div className="d-flex align-items-center">
                <IconCalendarStats size={24} className="me-2" />
                <h4 className="mb-0">Companies Expiring in {daysToExpire} Days</h4>
              </div>
              <CButton color="primary" size="sm" onClick={handleRefresh}>
                Refresh Data
              </CButton>
            </CCardHeader>
            <CCardBody>
              {noExpiringCompanies ? (
                <CAlert color="success">
                  <IconAlertCircle className="me-2" />
                  No companies are expiring within the next {daysToExpire} days.
                </CAlert>
              ) : (
                <>
                  <MantineReactTable 
                    columns={columns} 
                    data={data} 
                    state={{ isLoading: loading }}
                    enableStickyHeader={true}
                    enableColumnResizing 
                    enableGlobalFilter={true}
                    enableColumnFilters={true}
                    enablePagination={true}
                    manualPagination={true}
                    rowCount={totalPages * 10} // Assuming 10 rows per page
                    onGlobalFilterChange={setSearch}
                    onPaginationChange={({ pageIndex }) => setPage(pageIndex + 1)}
                    initialState={{
                      density: 'compact',
                      sorting: [{ id: 'days_remaining', desc: false }]
                    }}
                    renderTopToolbarCustomActions={() => (
                      <div className="d-flex align-items-center gap-2">
                        <CBadge color="danger">Critical (&lt;= 5 days)</CBadge>
                        <CBadge color="warning">Warning (&lt;= 15 days)</CBadge>
                      </div>
                    )}
                  />
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <CButton disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</CButton>
                    <span>Page {page} of {totalPages}</span>
                    <CButton disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</CButton>
                  </div>
                </>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  );
};

export default ExpiringCompanies;