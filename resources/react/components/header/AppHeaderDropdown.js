import React, { useState } from 'react'
import {
  CAvatar,
  CBadge,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CButton,
  CRow,
  CCol,
} from '@coreui/react'
import { 
  cilApplications, 
  cilAddressBook, 
  cilLockLocked, 
  cilMobile, 
  cilSettings, 
  cilUser,
  cilDevices
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'

import avatar8 from './../../assets/images/user.webp';

import { logout, logoutEverywhere } from '../../util/api'
import { deleteUserData, getUserData } from '../../util/session'
import { Link, useNavigate } from 'react-router-dom'

const AppHeaderDropdown = () => {
  const navigate = useNavigate()
  const user = getUserData();
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingType, setLoadingType] = useState('')

  const handleLogoutClick = () => {
    setShowLogoutModal(true)
  }

  const handleLogout = async () => {
    setIsLoading(true)
    setLoadingType('logout')
    try {
      await logout()
      deleteUserData()
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
      // Handle error appropriately
    } finally {
      setIsLoading(false)
      setLoadingType('')
      setShowLogoutModal(false)
    }
  }

  const handleLogoutEverywhere = async () => {
    setIsLoading(true)
    setLoadingType('logoutEverywhere')
    try {
      await logoutEverywhere()
      deleteUserData()
      navigate('/login')
    } catch (error) {
      console.error('Logout everywhere error:', error)
      // Handle error appropriately
    } finally {
      setIsLoading(false)
      setLoadingType('')
      setShowLogoutModal(false)
    }
  }

  const handleCloseModal = () => {
    if (!isLoading) {
      setShowLogoutModal(false)
    }
  }

  return (
    <>
      <CDropdown variant="nav-item">
        <CDropdownToggle placement="bottom-end" className="py-0 pe-0" caret={false}>
          <CAvatar src={avatar8} size="md" />
        </CDropdownToggle>
        <CDropdownMenu className="pt-0" placement="bottom-end">
          <CDropdownItem>
            <CIcon icon={cilUser} className="me-2" />
            {user?.name}<br/>
          </CDropdownItem>
          <CDropdownItem>
            <CIcon icon={cilAddressBook} className="me-2" />
            {user?.email}
          </CDropdownItem>
          <CDropdownItem>
            <CIcon icon={cilMobile} className="me-2" />
            {user?.mobile}
          </CDropdownItem>
          
          <CDropdownHeader className="bg-body-secondary fw-semibold my-2">Settings</CDropdownHeader>
          
          <Link to="/resetPassword" style={{ textDecoration: 'none', color: 'inherit' }}>
            <CDropdownItem>
              <CIcon icon={cilSettings} className="me-2" />
              Change Password
            </CDropdownItem>
          </Link>
          <CDropdownDivider />
          <CDropdownItem onClick={handleLogoutClick}>
            <CIcon icon={cilLockLocked} className="me-2" />
            Logout
          </CDropdownItem>
        </CDropdownMenu>
      </CDropdown>

     {/* Logout Confirmation Modal */}
<CModal 
  visible={showLogoutModal} 
  onClose={handleCloseModal}
  backdrop="static"
  keyboard={false}
  size="sm"
  centered
>
  <CModalHeader>
    <CModalTitle>Confirm Logout</CModalTitle>
  </CModalHeader>
  <CModalBody className="text-center">
    <div className="mb-3">
      <CIcon icon={cilLockLocked} size="3xl" className="text-warning mb-3" />
    </div>
    <p className="mb-0">Are you sure you want to logout?</p>
    <small className="text-muted">
      Choose to logout from this device only or from all devices where you're signed in.
    </small>
  </CModalBody>
  <CModalFooter className="border-top-0 pt-0">
    <CRow className="w-100 g-2">
      <CCol xs={6} className="d-grid">
        <CButton 
          color="warning" 
          onClick={handleLogout}
          disabled={isLoading}
          size="sm"
        >
          {isLoading && loadingType === 'logout' ? (
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          ) : (
            <CIcon icon={cilLockLocked} className="me-2" />
          )}
          Logout
        </CButton>
      </CCol>
      <CCol xs={6} className="d-grid">
        <CButton 
          color="danger" 
          onClick={handleLogoutEverywhere}
          disabled={isLoading}
          size="sm"
        >
          {isLoading && loadingType === 'logoutEverywhere' ? (
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          ) : (
            <CIcon icon={cilDevices} className="me-2" />
          )}
          Logout From Everywhere
        </CButton>
      </CCol>
    </CRow>
  </CModalFooter>
</CModal>
    </>
  )
}

export default AppHeaderDropdown