import React, { useEffect, useRef, useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CFormSelect,
  CInputGroup,
  CInputGroupText,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser, cilMobile, cilPeople, cibAmazonPay } from '@coreui/icons'
import { getAPICall, register, put } from '../../../util/api'
import { getUserData } from '../../../util/session'
import { useToast } from '../../common/toast/ToastContext'

const SupervisorsList = () => {
  const [supervisors, setSupervisors] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editModal, setEditModal] = useState(false)
  const [editSupervisor, setEditSupervisor] = useState(null)
  const [validated, setValidated] = useState(false)
  const [companyList, setCompanyList] = useState([])
  
  // Password visibility states
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  // Validation states
  const [isEmailInvalid, setIsEmailInvalid] = useState(false)
  const [isMobileInvalid, setIsMobileInvalid] = useState(false)
  const [isPasswordInvalid, setIsPasswordInvalid] = useState(false)
  const [isConfirmPasswordInvalid, setIsConfirmPasswordInvalid] = useState(false)
  const [isTypeInvalid, setTypeIsInvalid] = useState(false)
  const [isCompanyInvalid, setCompanyIsInvalid] = useState(false)
  const [emailErrorMessage, setEmailErrorMessage] = useState('')
  const [mobileErrorMessage, setMobileErrorMessage] = useState('')
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('')
  const [confirmPasswordErrorMessage, setConfirmPasswordErrorMessage] = useState('')

  // Form refs
  const nameRef = useRef()
  const emailRef = useRef()
  const mobileRef = useRef()
  const pwdRef = useRef()
  const cPwdRef = useRef()
  const typeRef = useRef()
  const companyRef = useRef()

  const { showToast } = useToast()
  const user = getUserData()

  // let userTypes = []
  // if (user.type === 0) {
  //   userTypes = [
  //     { label: 'Select User Type ', value: '' },
  //     { label: 'Super Admin', value: '0' },
  //     { label: 'Admin', value: '1' },
  //     { label: 'User', value: '2', disabled: false },
      
  //   ]
  // } else if (user.type === 1) {
  //   userTypes = [
  //     { label: 'Select User Type ', value: '' },
  //     { label: 'Admin', value: '1' },
  //     { label: 'User', value: '2', disabled: false },
   
  //   ]
  // } else {
  //   userTypes = [
  //     { label: 'Select User Type ', value: '' },
  //     { label: 'User', value: '2', disabled: false }
  //   ]
  // }


  let userTypes = []
  if (user.type === 0) {
    userTypes = [
      { label: 'Select User Type ', value: '' },
      { label: 'Super Admin', value: '0' },
      { label: 'Admin', value: '1' },
      { label: 'User', value: '2', disabled: false },
      { label: 'User++', value: '3', disabled: false },
      { label: 'Purchase Vendor', value: '4', disabled: false },
    ]
  } else if (user.type === 1) {
    userTypes = [
      { label: 'Select User Type ', value: '' },
      { label: 'Admin', value: '1' },
      { label: 'User', value: '2', disabled: false },
      { label: 'User++', value: '3', disabled: false },
      { label: 'Purchase Vendor', value: '4', disabled: false },
    ]
  } else {
    userTypes = [
      { label: 'Select User Type ', value: '' },
      { label: 'User', value: '2', disabled: false },
      { label: 'User++', value: '3', disabled: false },
      { label: 'Purchase Vendor', value: '4', disabled: false },
    ]
  }















  // Email validation function
  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return emailRegex.test(email)
  }

  // Mobile validation function (exactly 10 digits)
  const validateMobile = (mobile) => {
    const cleanMobile = mobile.replace(/\D/g, '')
    return cleanMobile.length === 10
  }

  // Password validation function
  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    return passwordRegex.test(password)
  }

  // Handle email validation
  const handleEmailChange = () => {
    const email = emailRef.current?.value || ''
    if (email && !validateEmail(email)) {
      setIsEmailInvalid(true)
      setEmailErrorMessage('Please enter a valid email address')
    } else {
      setIsEmailInvalid(false)
      setEmailErrorMessage('')
    }
  }

  // Handle mobile validation
  const handleMobileChange = () => {
    const mobile = mobileRef.current?.value || ''
    if (mobile && !validateMobile(mobile)) {
      setIsMobileInvalid(true)
      setMobileErrorMessage('Please enter exactly 10 digits')
    } else {
      setIsMobileInvalid(false)
      setMobileErrorMessage('')
    }
  }

  // Handle password validation
  const handlePasswordChange = () => {
    const password = pwdRef.current?.value || ''
    if (password && !validatePassword(password)) {
      setIsPasswordInvalid(true)
      setPasswordErrorMessage('Password must be at least 8 characters with uppercase, lowercase, number and special character')
    } else {
      setIsPasswordInvalid(false)
      setPasswordErrorMessage('')
    }
    
    if (cPwdRef.current?.value) {
      handleConfirmPasswordChange()
    }
  }

  // Handle confirm password validation
  const handleConfirmPasswordChange = () => {
    const password = pwdRef.current?.value || ''
    const confirmPassword = cPwdRef.current?.value || ''
    
    if (confirmPassword && password !== confirmPassword) {
      setIsConfirmPasswordInvalid(true)
      setConfirmPasswordErrorMessage('Passwords do not match')
    } else {
      setIsConfirmPasswordInvalid(false)
      setConfirmPasswordErrorMessage('')
    }
  }

  const handleSelect = (_, isCompany = false) => {
    const value = parseInt(isCompany ? companyRef.current.value : typeRef.current.value, 10)
    if (isCompany) {
      setCompanyIsInvalid(!(value > 0))
    } else {
      setTypeIsInvalid(![0, 1, 2 , 3, 4].includes(value))
    }
  }

  // Fetch companies
  useEffect(() => {
    getAPICall('/api/company')
      .then((resp) => {
        if (resp?.length) {
          const mappedList = resp.map(itm => ({ label: itm.company_name, value: itm.company_id }))
          if (user.type === 0) {
            setCompanyList(mappedList)
          } else {
            setCompanyList(mappedList.filter(e => e.value === user.company_id))
          }
        }
      })
      .catch(err => showToast('danger', 'Error: ' + err))
  }, [])

  // Fetch supervisors
  const fetchSupervisors = async () => {
    try {
      const resp = await getAPICall('/api/appUsers')
      if (resp?.data) {
        setSupervisors(resp.data)
      } else {
        setSupervisors([])
      }
    } catch (error) {
      console.error('Error fetching supervisors:', error)
      showToast('danger', 'Error fetching supervisors: ' + error.message)
      setSupervisors([])
    }
  }

  useEffect(() => {
    fetchSupervisors()
  }, [])

  const resetForm = () => {
    if (nameRef.current) nameRef.current.value = ""
    if (emailRef.current) emailRef.current.value = ""
    if (mobileRef.current) mobileRef.current.value = ""
    if (pwdRef.current) pwdRef.current.value = ""
    if (cPwdRef.current) cPwdRef.current.value = ""
    if (typeRef.current) typeRef.current.value = ""
    if (companyRef.current) companyRef.current.value = ""

    setValidated(false)
    setTypeIsInvalid(false)
    setCompanyIsInvalid(false)
    setIsEmailInvalid(false)
    setIsMobileInvalid(false)
    setIsPasswordInvalid(false)
    setIsConfirmPasswordInvalid(false)
    setEmailErrorMessage('')
    setMobileErrorMessage('')
    setPasswordErrorMessage('')
    setConfirmPasswordErrorMessage('')
    setShowPassword(false)
    setShowConfirmPassword(false)
  }

  // Close modal handler
  const closeModal = () => {
    setShowModal(false)
    resetForm()
  }

  // Add new supervisor
  // const handleSubmit = async (event) => {
  //   event.preventDefault()
  //   event.stopPropagation()

  //   const form = event.currentTarget
    
  //   // Run all validations before submitting
  //   handleEmailChange()
  //   handleMobileChange()
  //   handlePasswordChange()
  //   handleConfirmPasswordChange()
  //   handleSelect(null, false) // validate type
  //   handleSelect(null, true)  // validate company
    
  //   if (form.checkValidity() === false || 
  //       isEmailInvalid || 
  //       isMobileInvalid || 
  //       isPasswordInvalid || 
  //       isConfirmPasswordInvalid ||
  //       isTypeInvalid ||
  //       isCompanyInvalid) {
  //     setValidated(true)
  //     showToast('danger', 'Please fix all validation errors before submitting')
  //     return
  //   }

  //   const supervisorData = {
  //     name: nameRef.current?.value,
  //     email: emailRef.current?.value,
  //     mobile: mobileRef.current?.value,
  //     password: pwdRef.current?.value,
  //     password_confirmation: cPwdRef.current?.value,
  //     type: typeRef.current?.value,
  //     company_id: companyRef.current?.value,
  //   }

  //   try {
  //     const resp = await register(supervisorData)
  //     if (resp) {
  //       showToast('success', 'New supervisor created successfully')
  //       closeModal() // This will close modal and reset form
  //       fetchSupervisors()
  //     } else {
  //       showToast('danger', 'Error occurred, please try again later.')
  //     }
  //   } catch (error) {
  //     showToast('danger', 'Error occurred ' + error)
  //   }
  // }

  const handleSubmit = async (event) => {
  event.preventDefault()
  event.stopPropagation()

  const form = event.currentTarget
  setValidated(true) // trigger browser + bootstrap validation

  // run validations
  handleEmailChange()
  handleMobileChange()
  handlePasswordChange()
  handleConfirmPasswordChange()
  handleSelect(null, false) // validate type
  handleSelect(null, true)  // validate company

  // if any field invalid → stop
  if (
    form.checkValidity() === false ||
    isEmailInvalid ||
    isMobileInvalid ||
    isPasswordInvalid ||
    isConfirmPasswordInvalid ||
    isTypeInvalid ||
    isCompanyInvalid
  ) {
    showToast("danger", "Please fix all errors before submitting")
    return
  }

  // collect data
  const supervisorData = {
    name: nameRef.current?.value.trim(),
    email: emailRef.current?.value.trim(),
    mobile: mobileRef.current?.value.trim(),
    password: pwdRef.current?.value,
    password_confirmation: cPwdRef.current?.value,
    type: typeRef.current?.value,
    company_id: companyRef.current?.value,
  }

  try {
    const resp = await register(supervisorData)
    if (resp) {
      showToast("success", "New supervisor created successfully")
      closeModal()
      fetchSupervisors()
    } else {
      showToast("danger", "Error occurred, please try again later.")
    }
  } catch (error) {
    showToast("danger", "Error occurred " + error)
  }
}


  // Open edit modal
  const openEditModal = (supervisor) => {
    setEditSupervisor(supervisor)
    setEditModal(true)
  }

  // Update supervisor
  const handleUpdate = async () => {
    if (!editSupervisor) return

    try {
      const payload = {
        id: editSupervisor.id,
        name: editSupervisor.name,
        email: editSupervisor.email,
        mobile: editSupervisor.mobile,
        type: editSupervisor.type,
        company_id: editSupervisor.company_id || user.company_id,
        blocked: editSupervisor.blocked ?? 0,
      }

      const resp = await put(`/api/userUpdated/${editSupervisor.id}`, payload)
      if (resp?.success) {
        showToast('success', 'Supervisor updated successfully')
        setEditModal(false)
        fetchSupervisors()
      } else {
        showToast('danger', resp?.message || 'Update failed')
      }
    } catch (error) {
      showToast('danger', 'Error updating supervisor: ' + error)
    }
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-column">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={12} lg={12} xl={12}>
            {/* --- SUPERVISORS LIST --- */}
            <CCard>
              <CCardHeader className="d-flex justify-content-between align-items-center">
                <strong>Supervisors List</strong>
                <CButton 
                  color="danger" 
                  onClick={() => setShowModal(true)}
                  className="text-white"
                >
                  Add New Supervisor
                </CButton>
              </CCardHeader>
              <CCardBody>
                <CTable striped hover responsive>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>#</CTableHeaderCell>
                      <CTableHeaderCell>Name</CTableHeaderCell>
                      <CTableHeaderCell>Email</CTableHeaderCell>
                      <CTableHeaderCell>Mobile</CTableHeaderCell>
                      <CTableHeaderCell>Type</CTableHeaderCell>
                      <CTableHeaderCell>Company</CTableHeaderCell>
                      <CTableHeaderCell>Action</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {supervisors.map((u, index) => (
                      <CTableRow key={u.id}>
                        <CTableDataCell>{index + 1}</CTableDataCell>
                        <CTableDataCell>{u.name}</CTableDataCell>
                        <CTableDataCell>{u.email}</CTableDataCell>
                        <CTableDataCell>{u.mobile}</CTableDataCell>
                       <CTableDataCell>
  {u.type === 0
    ? "Super Admin"
    : u.type === 1
    ? "Admin"
    : u.type === 2
    ? "User"
    : u.type === 3
    ? "User++"
    : u.type === 4
    ? "Purchase Vendor"
    : "Unknown"}
</CTableDataCell>

                        <CTableDataCell>{companyList.find(c => c.value === u.company_id)?.label || 'N/A'}</CTableDataCell>
                        <CTableDataCell>
                          <CButton 
                            size="sm" 
                            color="info" 
                            className="text-white"
                            onClick={() => openEditModal(u)}
                          >
                            Edit
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>

      {/* --- ADD NEW SUPERVISOR MODAL --- */}
      <CModal 
        visible={showModal} 
        onClose={closeModal}
        backdrop="static"
        keyboard={false}
        size="lg"
      >
        <CModalHeader closeButton>
          <CModalTitle>Add New Supervisor</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm noValidate validated={validated} onSubmit={handleSubmit}>
            {/* Company Selection */}
            <CInputGroup className="mb-4">
              <CInputGroupText><CIcon icon={cibAmazonPay} /></CInputGroupText>
              <CFormSelect
                onChange={(e) => handleSelect(e, true)}
                aria-label="Select Shop / Company"
                ref={companyRef}
                invalid={isCompanyInvalid}
                options={companyList}
                feedbackInvalid="Select Shop / Company"
                required
              />
            </CInputGroup>

            {/* User Type Selection */}
            <CInputGroup className="mb-4">
              <CInputGroupText><CIcon icon={cilPeople} /></CInputGroupText>
              <CFormSelect
                onChange={handleSelect}
                aria-label="Select user type"
                ref={typeRef}
                invalid={isTypeInvalid}
                options={userTypes}
                feedbackInvalid="Please select a valid option."
                required
              />
            </CInputGroup>

            {/* Name Input */}
            <CInputGroup className="mb-3">
              <CInputGroupText><CIcon icon={cilUser} /></CInputGroupText>
              <CFormInput 
                ref={nameRef} 
                type='text' 
                placeholder="Supervisor Name" 
                required 
                    invalid={validated && !nameRef.current?.value} 

                feedbackInvalid="Please provide a valid supervisor name."
              />
            </CInputGroup>

            {/* Email Input */}
            <CInputGroup className="mb-3">
              <CInputGroupText>@</CInputGroupText>
              <CFormInput 
                ref={emailRef} 
                type='email' 
                placeholder="Email" 
                required
                // invalid={isEmailInvalid}
                 invalid={validated && (isEmailInvalid || !emailRef.current?.value)}
                onChange={handleEmailChange}
                feedbackInvalid={emailErrorMessage || "Please provide a valid email."}
              />
            </CInputGroup>

            {/* Mobile Input */}
            <CInputGroup className="mb-3">
  <CInputGroupText>
    <CIcon icon={cilMobile} />
  </CInputGroupText>
  <CFormInput
    ref={mobileRef}
    placeholder="Mobile (10 digits)"
    required
    invalid={isMobileInvalid}
    onChange={(e) => {
      // Allow only digits
      const value = e.target.value.replace(/\D/g, ""); 
      e.target.value = value; 
      handleMobileChange(e);
    }}
    feedbackInvalid={mobileErrorMessage || "Please provide a valid mobile number."}
    maxLength="10"
  />
</CInputGroup>


            {/* Password Input - Clean single row design */}
            <div className="mb-3" style={{ position: 'relative' }}>
              <CInputGroup>
                <CInputGroupText>
                  <CIcon icon={cilLockLocked} />
                </CInputGroupText>
                <CFormInput 
                  type={showPassword ? "text" : "password"} 
                  ref={pwdRef} 
                  placeholder="Enter New Password" 
                  required
                  onChange={handlePasswordChange}
                  autoComplete="new-password"
                  style={{ 
                    paddingRight: '45px',
                    border: isPasswordInvalid ? '1px solid #dc3545' : undefined
                  }}
                />
                <div
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '15px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    cursor: 'pointer',
                    fontSize: '18px',
                    color: '#6c757d',
                    zIndex: 10,
                    userSelect: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '24px',
                    height: '24px'
                  }}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? '🙈' : '👁️'}
                </div>
              </CInputGroup>
              {isPasswordInvalid && (
                <div className="invalid-feedback" style={{ display: 'block' }}>
                  {passwordErrorMessage || "Please provide a valid password."}
                </div>
              )}
            </div>

            {/* Confirm Password Input - Clean single row design */}
            <div className="mb-4" style={{ position: 'relative' }}>
              <CInputGroup>
                <CInputGroupText>
                  <CIcon icon={cilLockLocked} />
                </CInputGroupText>
                <CFormInput 
                  type={showConfirmPassword ? "text" : "password"} 
                  ref={cPwdRef} 
                  placeholder="Confirm Password" 
                  required
                  onChange={handleConfirmPasswordChange}
                  autoComplete="new-password"
                  style={{ 
                    paddingRight: '45px',
                    border: isConfirmPasswordInvalid ? '1px solid #dc3545' : undefined
                  }}
                />
                <div
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '15px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    cursor: 'pointer',
                    fontSize: '18px',
                    color: '#6c757d',
                    zIndex: 10,
                    userSelect: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '24px',
                    height: '24px'
                  }}
                  title={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? '🙈' : '👁️'}
                </div>
              </CInputGroup>
              {isConfirmPasswordInvalid && (
                <div className="invalid-feedback" style={{ display: 'block' }}>
                  {confirmPasswordErrorMessage || "Please confirm your password."}
                </div>
              )}
            </div>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={closeModal}>
            Cancel
          </CButton>
          <CButton color="success" onClick={handleSubmit}>
            Save Supervisor
          </CButton>
        </CModalFooter>
      </CModal>

      {/* --- EDIT SUPERVISOR MODAL --- */}
      <CModal visible={editModal} onClose={() => setEditModal(false)}>
        <CModalHeader><CModalTitle>Edit Supervisor</CModalTitle></CModalHeader>
        <CModalBody>
          {editSupervisor && (
            <>
              <CFormInput
                className="mb-2"
                label="Name"
                value={editSupervisor.name}
                onChange={(e) => setEditSupervisor({ ...editSupervisor, name: e.target.value })}
              />
              <CFormInput
                className="mb-2"
                label="Email"
                value={editSupervisor.email}
                onChange={(e) => setEditSupervisor({ ...editSupervisor, email: e.target.value })}
              />
              <CFormInput
                className="mb-2"
                label="Mobile"
                value={editSupervisor.mobile}
                onChange={(e) => setEditSupervisor({ ...editSupervisor, mobile: e.target.value })}
              />
              <CFormSelect
                className="mb-2"
                label="Type"
                value={editSupervisor.type}
                onChange={(e) => setEditSupervisor({ ...editSupervisor, type: parseInt(e.target.value) })}
                options={userTypes}
              />
            </>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setEditModal(false)}>Close</CButton>
          <CButton color="success" onClick={handleUpdate}>Save Changes</CButton>
        </CModalFooter>
      </CModal>
    </div>
  )
}

export default SupervisorsList