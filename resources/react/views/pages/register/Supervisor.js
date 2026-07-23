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
import { getAPICall, register, put, post } from '../../../util/api'
import { getUserData, updateUserData } from '../../../util/session'
import { useToast } from '../../common/toast/ToastContext'

const ROLE_DEFAULTS = {
  1: [ // Admin
    '/dashboard', '/dailyActivityDashboard', '/worklog', '/expense/new', '/infraDetailsShowTable',
    '/invoice', '/invoiceTable', '/budget', '/ProjectSummeryReport', '/operatorReport', '/vendorReport',
    '/incomeTable', '/internal-money-transfer', 'Reports/Reports', '/expense/expenseReport', '/seprateAllData',
    '/subcontractLadger', '/RegularProjectsLadger', '/PurchaseVendorLadger', '/VendorLedger',
    '/displayPurchesVendors', '/vendorPurches', '/vendorPurchesPayment', '/PurchaseVendorReport',
    '/project-types', '/work-types', '/survey-types', '/uoms', '/project', '/expense/all-type',
    '/OpratorList', '/supervisor', '/showRawMaterials', '/MachineriesTable', '/machineryStockTable'
  ],
  2: [ // User
    '/worklog', '/expense/new', '/infraDetailsShowTable', '/expense/expenseReport',
    '/project', '/expense/all-type', '/OpratorList', '/MachineriesTable', '/machineryStockTable'
  ],
  3: [ // User++
    '/dailyActivityDashboard', '/worklog', '/expense/new', '/infraDetailsShowTable', '/expense/expenseReport',
    '/invoice', '/invoiceTable', '/budget', '/displayPurchesVendors', '/vendorPurches', '/vendorPurchesPayment',
    '/PurchaseVendorReport', '/project-types', '/work-types', '/survey-types', '/uoms', '/project',
    '/expense/all-type', '/OpratorList', '/MachineriesTable', '/machineryStockTable'
  ],
  4: [ // Purchase Vendor
    '/worklog', '/expense/new', '/infraDetailsShowTable', '/expense/expenseReport',
    '/displayPurchesVendors', '/vendorPurches', '/vendorPurchesPayment', '/PurchaseVendorReport',
    '/project-types', '/work-types', '/survey-types', '/uoms', '/project', '/expense/all-type',
    '/OpratorList', '/MachineriesTable', '/machineryStockTable'
  ],
  5: [ // Work Log User
    '/worklog', '/expense/new', '/infraDetailsShowTable', '/expense/expenseReport', '/project',
    '/project-types', '/work-types', '/survey-types', '/uoms', '/expense/all-type',
    '/MachineriesTable', '/machineryStockTable'
  ]
};

const ALL_PAGES = [
  {
    category: 'Dashboards',
    pages: [
      { label: 'Admin Dashboard', path: '/dashboard' },
      { label: 'Daily Activity Dashboard', path: '/dailyActivityDashboard' },
    ]
  },
  {
    category: 'Work Logs & Expenses',
    pages: [
      { label: 'Work Log Form', path: '/worklog' },
      { label: 'New Expense Entry', path: '/expense/new' },
      { label: 'Work Log Report Table', path: '/infraDetailsShowTable' },
      { label: 'Expense Report Page', path: '/expense/expenseReport' },
      { label: 'Separate All Data Tool', path: '/seprateAllData' },
      { label: 'General Reports options', path: 'Reports/Reports' }
    ]
  },
  {
    category: 'Bills & Invoicing',
    pages: [
      { label: 'Create Invoice', path: '/invoice' },
      { label: 'All Invoices Table', path: '/invoiceTable' },
      { label: 'Vendor Budget Summary', path: '/budget' },
      { label: 'Project Summary Report', path: '/ProjectSummeryReport' }
    ]
  },
  {
    category: 'Payments & Money Flow',
    pages: [
      { label: 'Operator Payment Log', path: '/operatorReport' },
      { label: 'Vendor Payment Log', path: '/vendorReport' },
      { label: 'Income Report Table', path: '/incomeTable' },
      { label: 'Internal Money Transfer', path: '/internal-money-transfer' }
    ]
  },
  {
    category: 'Ledgers',
    pages: [
      { label: 'Sub Contract Ledger', path: '/subcontractLadger' },
      { label: 'Regular Project Ledger', path: '/RegularProjectsLadger' },
      { label: 'Purchase Vendor Ledger', path: '/PurchaseVendorLadger' },
      { label: 'Vendor Ledger Summary', path: '/VendorLedger' }
    ]
  },
  {
    category: 'Purchase Vendor Mgmt',
    pages: [
      { label: 'Add Purchase Vendor', path: '/displayPurchesVendors' },
      { label: 'New Purchase Entry', path: '/vendorPurches' },
      { label: 'Make Vendor Payment', path: '/vendorPurchesPayment' },
      { label: 'Purchase Vendor Report', path: '/PurchaseVendorReport' }
    ]
  },
  {
    category: 'Software Configuration & Masters',
    pages: [
      { label: 'Project Types Config', path: '/project-types' },
      { label: 'Work Types Config', path: '/work-types' },
      { label: 'Survey Types Config', path: '/survey-types' },
      { label: 'UOM Config', path: '/uoms' },
      { label: 'All Customers List', path: '/project' },
      { label: 'All Expense Types List', path: '/expense/all-type' },
      { label: 'All Resources / Operators', path: '/OpratorList' },
      { label: 'All Accountants / Supervisors', path: '/supervisor' },
      { label: 'All Raw Materials Inventory', path: '/showRawMaterials' },
      { label: 'All Machinery Masters', path: '/MachineriesTable' },
      { label: 'Machinery Stock Log Table', path: '/machineryStockTable' }
    ]
  }
];

const SupervisorsList = () => {
  const [supervisors, setSupervisors] = useState([])
  const [rolesList, setRolesList] = useState([])
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [newRoleName, setNewRoleName] = useState('')
  const [newRoleBaseType, setNewRoleBaseType] = useState('2')
  const [newRolePerms, setNewRolePerms] = useState([])

  const [showModal, setShowModal] = useState(false)
  const [editModal, setEditModal] = useState(false)
  const [editSupervisor, setEditSupervisor] = useState(null)
  const [validated, setValidated] = useState(false)
  const [companyList, setCompanyList] = useState([])
  
  // Permissions management states
  const [permissionsModal, setPermissionsModal] = useState(false)
  const [permUser, setPermUser] = useState(null)
  const [selectedPerms, setSelectedPerms] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  
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

  let userTypes = [{ label: 'Select User Type ', value: '' }]
  rolesList.forEach(role => {
    // If user is Admin (1), they shouldn't see Super Admin (0)
    if (user.type !== 0 && role.base_type === 0) return;
    
    if (role.is_default) {
       userTypes.push({ label: role.name, value: role.base_type.toString() })
    } else {
       userTypes.push({ label: `Custom: ${role.name}`, value: `custom_${role.id}` })
    }
  })















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
    const rawValue = isCompany ? companyRef.current?.value : typeRef.current?.value
    if (isCompany) {
      const value = parseInt(rawValue, 10)
      setCompanyIsInvalid(!(value > 0))
    } else {
      if (!rawValue) {
        setTypeIsInvalid(true)
      } else if (typeof rawValue === 'string' && rawValue.startsWith('custom_')) {
        setTypeIsInvalid(false)
      } else {
        const value = parseInt(rawValue, 10)
        setTypeIsInvalid(![0, 1, 2, 3, 4, 5].includes(value))
      }
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
      
    // Fetch roles
    getAPICall('/api/roles')
      .then(resp => {
        if (resp) setRolesList(resp)
      })
      .catch(err => console.error(err))
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
  const selectedTypeValue = typeRef.current?.value;
  let finalType = selectedTypeValue;
  let finalPermissions = null;

  if (selectedTypeValue && selectedTypeValue.startsWith('custom_')) {
      const customRoleId = parseInt(selectedTypeValue.replace('custom_', ''));
      const customRole = rolesList.find(r => r.id === customRoleId);
      if (customRole) {
          finalType = customRole.base_type;
          finalPermissions = customRole.permissions;
      }
  } else {
      finalType = parseInt(selectedTypeValue, 10);
  }

  const supervisorData = {
    name: nameRef.current?.value.trim(),
    email: emailRef.current?.value.trim(),
    mobile: mobileRef.current?.value.trim(),
    password: pwdRef.current?.value,
    password_confirmation: cPwdRef.current?.value,
    type: finalType,
    company_id: companyRef.current?.value,
    permissions: finalPermissions
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
    let typeStr = supervisor.type !== undefined ? supervisor.type.toString() : '';
    if (supervisor.permissions && supervisor.permissions.length > 0) {
      const matchedRole = rolesList.find(r => 
        !r.is_default && 
        r.permissions && 
        r.permissions.length === supervisor.permissions.length &&
        r.permissions.every(p => supervisor.permissions.includes(p))
      );
      if (matchedRole) {
        typeStr = `custom_${matchedRole.id}`;
      }
    }
    setEditSupervisor({ ...supervisor, type_string: typeStr })
    setEditModal(true)
  }

  // Update supervisor
  const handleUpdate = async () => {
    if (!editSupervisor) return

    let finalType = editSupervisor.type;
    let finalPermissions = null;

    const selectedTypeStr = editSupervisor.type_string || editSupervisor.type?.toString();
    
    if (selectedTypeStr && selectedTypeStr.startsWith('custom_')) {
        const customRoleId = parseInt(selectedTypeStr.replace('custom_', ''));
        const customRole = rolesList.find(r => r.id === customRoleId);
        if (customRole) {
            finalType = customRole.base_type;
            finalPermissions = customRole.permissions;
        }
    } else if (selectedTypeStr) {
        finalType = parseInt(selectedTypeStr, 10);
        finalPermissions = null; // Revert to static default permissions
    }

    try {
      const payload = {
        id: editSupervisor.id,
        name: editSupervisor.name,
        email: editSupervisor.email,
        mobile: editSupervisor.mobile,
        type: finalType,
        permissions: finalPermissions,
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

  // Permissions management helper functions
  const openPermissionsModal = (supervisor) => {
    setPermUser(supervisor)
    setSelectedPerms(supervisor.permissions || [])
    setSearchQuery('')
    setPermissionsModal(true)
  }

  const handleTogglePage = (path) => {
    setSelectedPerms(prev => {
      if (prev.includes(path)) {
        return prev.filter(p => p !== path)
      } else {
        return [...prev, path]
      }
    })
  }

  const handleSelectAll = () => {
    const allPaths = ALL_PAGES.flatMap(cat => cat.pages.map(p => p.path))
    setSelectedPerms(allPaths)
  }

  const handleDeselectAll = () => {
    setSelectedPerms([])
  }

  const handleResetToDefault = () => {
    if (!permUser) return
    const defaults = ROLE_DEFAULTS[permUser.type] || []
    setSelectedPerms(defaults)
  }

  const handleSavePermissions = async () => {
    if (!permUser) return

    try {
      const resp = await put(`/api/userPermissions/${permUser.id}`, {
        permissions: selectedPerms
      })
      if (resp?.success) {
        showToast('success', 'Page access permissions updated successfully')
        setPermissionsModal(false)
        fetchSupervisors()
        
        // If the admin updated their own permissions, sync their session data immediately
        if (permUser.id === user.id) {
          updateUserData({ user: { ...user, permissions: selectedPerms } })
          setTimeout(() => {
            window.location.reload()
          }, 1500)
        }
      } else {
        showToast('danger', resp?.message || 'Failed to save permissions')
      }
    } catch (error) {
      showToast('danger', 'Error saving permissions: ' + error)
    }
  }

  const getUserRoleName = (u) => {
    // 1. Direct match by base_type (unique dynamic role integer type)
    const directRole = rolesList.find(r => r.base_type === u.type);
    if (directRole) {
      return directRole.name;
    }

    // 2. Permission match fallback
    if (u.permissions && u.permissions.length > 0) {
      const matchedRole = rolesList.find(r => 
        !r.is_default && 
        r.permissions && 
        r.permissions.length === u.permissions.length &&
        r.permissions.every(p => u.permissions.includes(p))
      );
      if (matchedRole) {
        return matchedRole.name;
      }
      return "Custom Access";
    }

    switch (u.type) {
      case 0: return "Super Admin";
      case 1: return "Admin";
      case 2: return "User";
      case 3: return "User++";
      case 4: return "Purchase Vendor";
      case 5: return "Work Log User";
      default: return `Type ${u.type}`;
    }
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-column">
      <CContainer>




{/* ==================== ROLE PERMISSIONS SECTION ==================== */}
           <CCard className="mb-4">
  <CCardHeader className="d-flex justify-content-between align-items-center">
    <strong>Role Permissions Overview</strong>
    <span className="badge bg-primary">{rolesList.filter(r => !r.is_default).length} Custom Roles Created</span>
  </CCardHeader>
  <CCardBody>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>

      {[
        { label: 'Admin', sub: 'Full access', color: '#A32D2D', bg: '#FCEBEB', icon: 'ti-shield-lock',
          perms: ['All entries', 'All reports', 'All screens', 'Full system access'] },
        { label: 'User', sub: 'Basic access', color: '#0F6E56', bg: '#E1F5EE', icon: 'ti-user',
          perms: ['Work log', 'Expenses', 'Allocated projects'] },
        { label: 'User++', sub: 'Extended access', color: '#854F0B', bg: '#FAEEDA', icon: 'ti-user-plus',
          perms: ['Work log', 'Expenses', 'Bills', 'Purchase vendor', 'Software mgmt', 'Machinery stock'] },
        { label: 'Purchase vendor', sub: 'Vendor access', color: '#534AB7', bg: '#EEEDFE', icon: 'ti-building-store',
          perms: ['Work log', 'Expenses', 'Purchase vendor'] },
        { label: 'Work log user', sub: 'Log access', color: '#185FA5', bg: '#E6F1FB', icon: 'ti-clipboard-list',
          perms: ['Work log', 'Expenses', 'All projects access'] },
        ...rolesList.filter(r => !r.is_default).map(r => ({
          label: r.name,
          sub: `Custom Role (Base: Type ${r.base_type})`,
          color: '#6200ea',
          bg: '#f3e8ff',
          icon: 'ti-user-check',
          perms: [
            `${r.permissions?.length || 0} pages assigned`,
            'Custom configured access'
          ]
        }))
      ].map(({ label, sub, color, bg, icon, perms }) => (
        <div key={label} style={{ background: 'var(--cui-card-bg, #fff)', border: '0.5px solid var(--cui-border-color)', borderRadius: '12px', padding: '1rem', borderTop: `3px solid ${color}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className={`ti ${icon}`} style={{ fontSize: 16, color }} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>{label}</p>
              <p style={{ margin: 0, fontSize: 11, color: 'inherit' }}>{sub}</p>
            </div>
          </div>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {perms.map(p => (
              <li key={p} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'inherit' }}>
                <i className="ti ti-check" style={{ fontSize: 14, color: 'inherit' }} />{p}
              </li>
            ))}
          </ul>
        </div>
      ))}

    </div>
  </CCardBody>
</CCard>






        <CRow className="justify-content-center">
          <CCol md={12} lg={12} xl={12}>
            {/* --- SUPERVISORS LIST --- */}
            <CCard>
              <CCardHeader className="d-flex justify-content-between align-items-center">
                <strong>Supervisors List</strong>
                <div className="d-flex gap-2">
                  <CButton 
                    color="primary" 
                    onClick={() => setShowRoleModal(true)}
                    className="text-white"
                  >
                    Create Custom Role
                  </CButton>
                  <CButton 
                    color="danger" 
                    onClick={() => setShowModal(true)}
                    className="text-white"
                  >
                    Add New Supervisor
                  </CButton>
                </div>
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
                      <CTableHeaderCell>Page Access</CTableHeaderCell>
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
                          <strong>{getUserRoleName(u)}</strong>
                        </CTableDataCell>
                        <CTableDataCell>
                          {u.permissions && u.permissions.length > 0 ? (
                            <span 
                              className="badge bg-success" 
                              style={{ cursor: 'pointer', padding: '6px 10px', borderRadius: '8px' }}
                              onClick={() => openPermissionsModal(u)}
                            >
                              Custom ({u.permissions.length} pages)
                            </span>
                          ) : (
                            <span 
                              className="badge bg-secondary" 
                              style={{ cursor: 'pointer', padding: '6px 10px', borderRadius: '8px' }}
                              onClick={() => openPermissionsModal(u)}
                            >
                              Role Defaults
                            </span>
                          )}
                        </CTableDataCell>

                        <CTableDataCell>{companyList.find(c => c.value === u.company_id)?.label || 'N/A'}</CTableDataCell>
                        <CTableDataCell>
                          <div className="d-flex gap-2">
                            <CButton 
                              size="sm" 
                              color="info" 
                              className="text-white"
                              onClick={() => openEditModal(u)}
                            >
                              Edit
                            </CButton>
                            <CButton 
                              size="sm" 
                              color="primary" 
                              style={{ backgroundColor: '#6200ea', borderColor: '#6200ea' }}
                              className="text-white"
                              onClick={() => openPermissionsModal(u)}
                            >
                              Page Access
                            </CButton>
                          </div>
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
                value={editSupervisor.type_string || editSupervisor.type}
                onChange={(e) => setEditSupervisor({ ...editSupervisor, type_string: e.target.value })}
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

      {/* --- MANAGE PERMISSIONS MODAL --- */}
      <CModal 
        visible={permissionsModal} 
        onClose={() => setPermissionsModal(false)}
        size="lg"
        scrollable
        backdrop="static"
      >
        <CModalHeader closeButton>
          <CModalTitle style={{ fontWeight: '700' }}>
            🔑 Manage Page Access - {permUser?.name}
          </CModalTitle>
        </CModalHeader>
        <CModalBody className="p-4" style={{ background: '#f8f9fa' }}>
          {permUser && (
            <div>
              {/* User info banner */}
              <div 
                className="mb-4 p-3 d-flex align-items-center justify-content-between"
                style={{ 
                  backgroundColor: '#ffffff', 
                  borderRadius: '12px', 
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                }}
              >
                <div>
                  <h6 style={{ margin: 0, fontWeight: '700' }}>{permUser.name}</h6>
                  <small style={{ color: '#718096' }}>{permUser.email} • Mobile: {permUser.mobile}</small>
                </div>
                <div>
                  <span className="badge bg-secondary px-3 py-2 text-capitalize" style={{ fontSize: '12px' }}>
                    Role: {
                      permUser.type === 0 ? "Super Admin" :
                      permUser.type === 1 ? "Admin" :
                      permUser.type === 2 ? "User" :
                      permUser.type === 3 ? "User++" :
                      permUser.type === 4 ? "Purchase Vendor" :
                      permUser.type === 5 ? "Work Log User" : "Unknown"
                    }
                  </span>
                </div>
              </div>

              {/* Toolbar */}
              <div className="mb-4 d-flex flex-wrap align-items-center justify-content-between gap-3">
                <div style={{ flex: '1 1 300px' }}>
                  <CFormInput
                    placeholder="🔍 Search pages by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      borderRadius: '10px',
                      padding: '10px 15px',
                      border: '1.5px solid #cbd5e0',
                      boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
                    }}
                  />
                </div>
                <div className="d-flex gap-2 flex-wrap">
                  <CButton 
                    size="sm" 
                    color="secondary" 
                    variant="outline"
                    onClick={handleSelectAll}
                    style={{ borderRadius: '8px', fontWeight: '600' }}
                  >
                    Select All
                  </CButton>
                  <CButton 
                    size="sm" 
                    color="secondary" 
                    variant="outline"
                    onClick={handleDeselectAll}
                    style={{ borderRadius: '8px', fontWeight: '600' }}
                  >
                    Clear All
                  </CButton>
                  <CButton 
                    size="sm" 
                    color="warning" 
                    className="text-white"
                    onClick={handleResetToDefault}
                    style={{ borderRadius: '8px', fontWeight: '600' }}
                  >
                    Reset to Role Defaults
                  </CButton>
                </div>
              </div>

              {/* Scrollable checklists */}
              <div 
                style={{ 
                  maxHeight: '400px', 
                  overflowY: 'auto', 
                  paddingRight: '6px'
                }}
              >
                {ALL_PAGES.map(categoryObj => {
                  const filteredPages = categoryObj.pages.filter(p => 
                    p.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    p.path.toLowerCase().includes(searchQuery.toLowerCase())
                  );

                  if (filteredPages.length === 0) return null;

                  return (
                    <div 
                      key={categoryObj.category}
                      className="mb-4 p-3"
                      style={{ 
                        background: '#ffffff', 
                        borderRadius: '16px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
                      }}
                    >
                      <h6 
                        style={{ 
                          fontWeight: '800', 
                          color: '#2d3748', 
                          borderBottom: '2px solid #edf2f7', 
                          paddingBottom: '8px',
                          marginBottom: '15px'
                        }}
                      >
                        {categoryObj.category}
                      </h6>
                      <div className="row">
                        {filteredPages.map(page => {
                          const isChecked = selectedPerms.includes(page.path);
                          return (
                            <div key={page.path} className="col-12 col-md-6 mb-3">
                              <div 
                                onClick={() => handleTogglePage(page.path)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '12px',
                                  padding: '12px 16px',
                                  borderRadius: '12px',
                                  border: isChecked ? '1.5px solid #6200ea' : '1.5px solid #edf2f7',
                                  background: isChecked ? '#f3e8ff' : '#fcfcfc',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.transform = 'translateY(-2px)';
                                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                                  if (!isChecked) e.currentTarget.style.borderColor = '#cbd5e0';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform = 'translateY(0)';
                                  e.currentTarget.style.boxShadow = 'none';
                                  if (!isChecked) e.currentTarget.style.borderColor = '#edf2f7';
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {}} // handled by parent div click
                                  style={{ 
                                    width: '18px', 
                                    height: '18px', 
                                    accentColor: '#6200ea',
                                    cursor: 'pointer'
                                  }}
                                />
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <span style={{ fontWeight: '700', fontSize: '13.5px', color: '#1a202c' }}>
                                    {page.label}
                                  </span>
                                  <span style={{ fontSize: '11px', color: '#718096', fontFamily: 'monospace' }}>
                                    {page.path}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CModalBody>
        <CModalFooter style={{ background: '#ffffff', borderTop: '1px solid #edf2f7' }}>
          <CButton color="secondary" style={{ borderRadius: '10px', fontWeight: '600' }} onClick={() => setPermissionsModal(false)}>
            Close
          </CButton>
          <CButton color="primary" style={{ backgroundColor: '#6200ea', borderColor: '#6200ea', borderRadius: '10px', fontWeight: '700', padding: '8px 24px' }} onClick={handleSavePermissions}>
            Save Page Access
          </CButton>
        </CModalFooter>
      </CModal>

      {/* --- CREATE CUSTOM ROLE MODAL --- */}
      <CModal visible={showRoleModal} onClose={() => setShowRoleModal(false)} size="lg" backdrop="static">
        <CModalHeader closeButton>
          <CModalTitle>Create Custom Role</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <div className="mb-3">
              <label className="form-label">Role Name</label>
              <CFormInput 
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                placeholder="e.g. Field Manager" 
              />
            </div>
            
            <div className="mb-3">
              <label className="form-label"><strong>Select Permissions</strong></label>
              <div className="d-flex flex-wrap gap-2 mb-3">
                <CButton size="sm" color="secondary" variant="outline" onClick={() => setNewRolePerms(ALL_PAGES.flatMap(cat => cat.pages.map(p => p.path)))}>Select All</CButton>
                <CButton size="sm" color="secondary" variant="outline" onClick={() => setNewRolePerms([])}>Clear All</CButton>
              </div>
              <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #e2e8f0', padding: '10px', borderRadius: '8px' }}>
                {ALL_PAGES.map((categoryObj, idx) => (
                  <div key={idx} className="mb-3">
                    <h6 style={{ fontWeight: 'bold' }}>{categoryObj.category}</h6>
                    <div className="row">
                      {categoryObj.pages.map(page => {
                        const isChecked = newRolePerms.includes(page.path);
                        return (
                          <div key={page.path} className="col-12 col-md-6 mb-2">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                              <input 
                                type="checkbox" 
                                checked={isChecked}
                                onChange={() => {
                                  setNewRolePerms(prev => {
                                    if (prev.includes(page.path)) return prev.filter(p => p !== page.path)
                                    return [...prev, page.path]
                                  })
                                }}
                              />
                              <span style={{ fontSize: '14px' }}>{page.label}</span>
                            </label>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowRoleModal(false)}>Cancel</CButton>
          <CButton color="primary" onClick={async () => {
            if (!newRoleName.trim()) {
              showToast('danger', 'Please provide a role name');
              return;
            }
            try {
              const payload = {
                name: newRoleName,
                permissions: newRolePerms
              }
              const resp = await post('/api/roles', payload)
              if (resp) {
                showToast('success', 'Custom role created successfully');
                setShowRoleModal(false);
                setNewRoleName('');
                setNewRolePerms([]);
                // Refresh roles
                getAPICall('/api/roles').then(r => { if (r) setRolesList(r) });
              }
            } catch (error) {
              showToast('danger', 'Error creating role: ' + error);
            }
          }}>Create Role</CButton>
        </CModalFooter>
      </CModal>
    </div>
  )
}

export default SupervisorsList