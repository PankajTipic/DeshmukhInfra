import React, { useEffect, useState } from 'react';
import { CBadge, CRow, CCol, CCard, CCardBody, CCardHeader } from '@coreui/react';
import { MantineReactTable } from 'mantine-react-table';
import { getAPICall, put } from '../../../util/api';
import ConfirmationModal from '../../common/ConfirmationModal';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../common/toast/ToastContext';
import { getUserData } from '../../../util/session';
import NewUserModal from '../../common/NewUserModal';
import EditCompanyModal from './EditCompanyModal';

const AllCompanies = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [blockCompany, setBlockCompany] = useState();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedRow, setSelectedRow] = useState({});
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { showToast } = useToast();
  const user = getUserData();
  const userType = user.type;

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await getAPICall('/api/companies');
      if(userType == 0){
        setCustomers(response);
      }else{
        setCustomers(response.filter(r=> r.refer_by_id == user.id))
      }
    } catch (error) {
      showToast('danger', 'Error occured ' + error);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleBlock = (p) => {
    setBlockCompany(p);
    setDeleteModalVisible(true);
  };

 const onDelete = async () => {
  try {
    await put(`/api/company/${blockCompany.company_id}/toggle-blocks`, {
      block_status: blockCompany.block_status == 0 ? 1 : 0  // Toggle the status
    });
    setDeleteModalVisible(false);
    fetchCompanies();
    const action = blockCompany.block_status == 0 ? 'blocked' : 'unblocked';
    showToast('success', `Company "${blockCompany.company_name}" has been ${action} successfully`);
  } catch (error) {
    showToast('danger', 'Error occurred: ' + error);
  }
};

  const handleEdit = (p) => {
    setSelectedRow(p);
    setEditModalVisible(true);
  };

  const handleUserCreation = (p) => {
    setSelectedRow(p);
    setUserModalVisible(true);
  };

  const columns = [
    { accessorKey: 'index', header: 'Id', size: 60 },
    { accessorKey: 'company_name', header: 'Name', size: 150 },
    { accessorKey: 'phone_no', header: 'Mobile', size: 120 },
    { accessorKey: 'email_id', header: 'Email', size: 180 },
    { accessorKey: 'Tal', header: 'Address', size: 150,
      Cell: ({ cell }) => (
        <span title={cell.row.original.land_mark}>
          {cell.row.original.land_mark}
        </span>
      ),
     },
     { accessorKey: 'subscription_validity', header: 'Valid Till', size: 120 },
    {
      accessorKey: 'block_status',
      header: 'Status',
      size: 100,
      Cell: ({ cell }) => (
        cell.row.original.block_status == 0 ? (
          <CBadge color="success">Active</CBadge>
        ) : (
          <CBadge color="danger">Blocked</CBadge>
        )
      ),
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      size: 200,
      Cell: ({ cell }) => (
        userType == 0 ?
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          <CBadge
            role="button"
            color="success"
            onClick={() => handleUserCreation(cell.row.original)}
            style={{ cursor: 'pointer', fontSize: '0.75rem', padding: '4px 8px' }}
          >
            Create User
          </CBadge>
          <CBadge
            role="button"
            color="info"
            onClick={() => handleEdit(cell.row.original)}
            style={{ cursor: 'pointer', fontSize: '0.75rem', padding: '4px 8px' }}
          >
            Edit
          </CBadge>
          <CBadge
            role="button"
            color="danger"
            onClick={() => handleBlock(cell.row.original)}
            style={{ cursor: 'pointer', fontSize: '0.75rem', padding: '4px 8px' }}
          >
            {cell.row.original.block_status == 0 ? 'Block' : 'Unblock'}
          </CBadge>
        </div>
        :
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          <CBadge
            role="button"
            color="info"
            onClick={() => handleEdit(cell.row.original)}
            style={{ cursor: 'pointer', fontSize: '0.75rem', padding: '4px 8px' }}
          >
            Edit
          </CBadge>
          <CBadge
            role="button"
            color="danger"
            onClick={() => handleBlock(cell.row.original)}
            style={{ cursor: 'pointer', fontSize: '0.75rem', padding: '4px 8px' }}
          >
            {cell.row.original.block_status == 0 ? 'Block' : 'Unblock'}
          </CBadge>
        </div>
      ),
    },
  ];

  const data = customers.map((p, index) => ({
    ...p,
    index: index + 1,
  }));

  // Mobile columns configuration
  const mobileColumns = [
    { accessorKey: 'index', header: 'Id', size: 40 },
    { accessorKey: 'company_name', header: 'Name', size: 100 },
    { accessorKey: 'phone_no', header: 'Mobile', size: 90 },
    { accessorKey: 'email_id', header: 'Email', size: 120,
      Cell: ({ cell }) => (
        <div style={{ fontSize: '0.75rem', wordBreak: 'break-word' }}>
          {cell.getValue()}
        </div>
      ),
    },
    { accessorKey: 'Tal', header: 'Address', size: 100,
      Cell: ({ cell }) => (
        <div style={{ fontSize: '0.75rem', wordBreak: 'break-word' }} title={cell.row.original.land_mark}>
          {cell.row.original.land_mark}
        </div>
      ),
    },
    { accessorKey: 'subscription_validity', header: 'Valid Till', size: 80,
      Cell: ({ cell }) => (
        <div style={{ fontSize: '0.75rem' }}>
          {cell.getValue()}
        </div>
      ),
    },
    {
      accessorKey: 'block_status',
      header: 'Status',
      size: 70,
      Cell: ({ cell }) => (
        cell.row.original.block_status == 0 ? (
          <CBadge color="success" style={{ fontSize: '0.65rem' }}>Active</CBadge>
        ) : (
          <CBadge color="danger" style={{ fontSize: '0.65rem' }}>Blocked</CBadge>
        )
      ),
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      size: 120,
      Cell: ({ cell }) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {userType == 0 && (
            <CBadge
              role="button"
              color="success"
              onClick={() => handleUserCreation(cell.row.original)}
              style={{ cursor: 'pointer', fontSize: '0.6rem', padding: '2px 4px' }}
            >
              Create User
            </CBadge>
          )}
          <CBadge
            role="button"
            color="info"
            onClick={() => handleEdit(cell.row.original)}
            style={{ cursor: 'pointer', fontSize: '0.6rem', padding: '2px 4px' }}
          >
            Edit
          </CBadge>
          <CBadge
            role="button"
            color="danger"
            onClick={() => handleBlock(cell.row.original)}
            style={{ cursor: 'pointer', fontSize: '0.6rem', padding: '2px 4px' }}
          >
            {cell.row.original.block_status == 0 ? 'Block' : 'Unblock'}
          </CBadge>
        </div>
      ),
    },
  ];

  return (
    <>
      <ConfirmationModal
        visible={deleteModalVisible}
        setVisible={setDeleteModalVisible}
        onYes={onDelete}
        resource={'Block company "' + blockCompany?.company_name +'"'}
      />
      <NewUserModal
        visible={userModalVisible}
        setVisible={setUserModalVisible}
        data={selectedRow}
      />
      <EditCompanyModal
        visible={editModalVisible}
        setVisible={setEditModalVisible}
        companyData={selectedRow}
        onSuccess={fetchCompanies}
      />
      
      <CRow>
        <CCol xs={12}>
          <div style={{ overflowX: 'auto' }}>
            <MantineReactTable 
              defaultColumn={{
                maxSize: isMobile ? 150 : 400,
                minSize: isMobile ? 40 : 80,
                size: isMobile ? 80 : 120,
              }} 
              enableStickyHeader={true}
              enableStickyFooter={true}
              enableDensityToggle={false}
              initialState={{density: 'xs'}}
              enableColumnResizing={!isMobile}
              columns={isMobile ? mobileColumns : columns} 
              data={data} 
              enableFullScreenToggle={false}
              mantineTableContainerProps={{
                sx: {
                  minHeight: '400px',
                  maxHeight: '80vh',
                  fontSize: isMobile ? '0.75rem' : '1rem',
                },
              }}
              mantineTableProps={{
                sx: {
                  tableLayout: 'fixed',
                  '& th': {
                    fontSize: isMobile ? '0.7rem' : '0.875rem',
                    padding: isMobile ? '4px 6px' : '8px 12px',
                    fontWeight: 600,
                  },
                  '& td': {
                    fontSize: isMobile ? '0.65rem' : '0.875rem',
                    padding: isMobile ? '4px 6px' : '8px 12px',
                    lineHeight: isMobile ? '1.2' : '1.5',
                  },
                },
              }}
              mantineTableHeadProps={{
                sx: {
                  '& th': {
                    backgroundColor: isMobile ? '#f8f9fa' : 'inherit',
                  },
                },
              }}
            />
          </div>
        </CCol>
      </CRow>
    </>
  );
};

export default AllCompanies;