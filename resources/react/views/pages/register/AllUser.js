import React, { useState, useEffect } from 'react';
import {
    CBadge,
    CButton,
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
    CFormSwitch,
    CRow,
    CTable,
    CTableBody,
    CTableDataCell,
    CTableHead,
    CTableHeaderCell,
    CTableRow,
} from '@coreui/react';
import { deleteAPICall, getAPICall, put } from '../../../util/api';

function AllUsers() {
    const [AllUsers, setAllUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await getAPICall('/api/appUsers');
                setAllUsers(response.data);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchUsers();
    }, []);
   
    const handleDelete = async (userId) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this user?');
        if (!confirmDelete) return;
    
        try {
            await deleteAPICall(`/api/appUsers/delete/${userId}`);
            setAllUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Failed to delete user.');
        }
    };
    
    
    const toggleVisibility = async (user) => {
        // Prevent blocking/unblocking if user is not of type 2 (i.e., not a normal user)
        if (user.type !== 2) {
            alert("Only users of type 2 (normal users) can be blocked/unblocked.");
            return;
        }
    
        const updatedUser = { ...user, blocked: user.blocked === 1 ? 0 : 1 };
    
        try {
            await put('/api/appUsers', updatedUser);
            setAllUsers((prevUsers) =>
                prevUsers.map((u) =>
                    u.id === user.id ? updatedUser : u
                )
            );
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };
    
   

    return (
        <CRow>
            <CCol xs={12}>
                <CCard className="mb-4">
                    <CCardHeader>
                        <strong>All Users</strong>
                    </CCardHeader>
                    <CCardBody>
                        <div className="table-responsive">
                            <CTable>
                                <CTableHead>
                                    <CTableRow>
                                        <CTableHeaderCell scope="col">Id</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Name</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Email</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Mobile</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Type</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Blocked</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Actions</CTableHeaderCell>

                                        
                                    </CTableRow>
                                </CTableHead>
                                <CTableBody>
                                    {AllUsers.map((user, index) => (
                                        <CTableRow key={user.id}>
                                            <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                                            <CTableDataCell>{user.name}</CTableDataCell>
                                            <CTableDataCell>{user.email}</CTableDataCell>
                                            <CTableDataCell>{user.mobile}</CTableDataCell>
                                            <CTableDataCell> {user.type === 1 ? 'Admin' : 'User'}</CTableDataCell>
                                            <CTableDataCell>
                                            <CFormSwitch
                                                id={`formSwitchCheckDefault${user.id}`}
                                                checked={user.blocked === 1}
                                                onChange={() => toggleVisibility(user)}
                                                disabled={user.type !== 2}
    
                                                  />

                                            </CTableDataCell>
                                            <CTableDataCell>
                                                <CButton
                                                    color="danger"
                                                    size="sm"
                                                    onClick={() => handleDelete(user.id)}
                                                >
                                                    Delete
                                                </CButton>
                                            </CTableDataCell>

                                            
                                        </CTableRow>
                                    ))}
                                </CTableBody>
                            </CTable>
                        </div>
                    </CCardBody>
                </CCard>
            </CCol>
        </CRow>
    );
}

export default AllUsers;
