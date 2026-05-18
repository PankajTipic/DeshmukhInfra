
// import React, { useEffect, useState, useRef, useCallback } from 'react';
// import './Invoice.css';
// import {
//   CAlert,
//   CBadge,
//   CButton,
//   CCard,
//   CCardBody,
//   CCardHeader,
//   CCol,
//   CForm,
//   CFormInput,
//   CFormLabel,
//   CRow,
//   CSpinner,
//   CInputGroup,
//   CInputGroupText,
//   CFormSelect,
//   CFormCheck,
//   CModal,
//   CModalHeader,
//   CModalTitle,
//   CModalBody,
//   CModalFooter,
//   CFormTextarea,
// } from '@coreui/react';
// import { cilArrowLeft, cilCart, cilChevronBottom, cilList, cilSearch, cilX, cilPlus, cilPencil } from '@coreui/icons';
// import CIcon from '@coreui/icons-react';
// import { getAPICall, post } from '../../../util/api';
// import { useNavigate } from 'react-router-dom';
// import { useToast } from '../../common/toast/ToastContext';
// import { useTranslation } from 'react-i18next';
// import ProjectSelectionModal from '../../common/ProjectSelectionModal';

// const Invoice = ({ editMode = false, initialData = null, onSubmit = null }) => {
//   const [validated, setValidated] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [projectsLoading, setProjectsLoading] = useState(true);
//   const [errorMessage, setErrorMessage] = useState();
//   const navigate = useNavigate();
//   const { t } = useTranslation();
//   const { showToast } = useToast();
//   const [showProjectModal, setShowProjectModal] = useState(false);

//   const [validatedProjectForm, setValidatedProjectForm] = useState(false);

//   const [allProjects, setAllProjects] = useState([]);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [showDropdown, setShowDropdown] = useState(false);
//   const [filteredProjects, setFilteredProjects] = useState([]);
//   const [isModalSelection, setIsModalSelection] = useState(false);
//   const projectInputRef = useRef(null);
//   const dropdownRef = useRef(null);

//   const [form, setForm] = useState({
//   projectId: null,
//   projectName: '',
//   customer_id: null,
//   customer_name: '',
//   address: '',
//   mobile_number: '',
//   project_type: '', // Add project_type to form state
//   customer: { name: '', address: '', mobile: '' },
//   invoiceType: 1, // Default: Quotation
//   invoiceDate: new Date().toISOString().split('T')[0],
//   deliveryDate: new Date().toISOString().split('T')[0],
//   discount: 0,
//   paidAmount: 0,
//   subtotal: 0,
//   taxableAmount: 0,
//   gstAmount: 0,
//   sgstAmount: 0,
//   cgstAmount: 0,
//   igstAmount: 0,
//   finalAmount: 0,
//   gstPercentage: 0,  // ✅ Changed from 18 to 0
//   sgstPercentage: 0, // ✅ Changed from 9 to 0
//   cgstPercentage: 0, // ✅ Changed from 9 to 0
//   igstPercentage: 0,
//   ref_id: '',
//   po_number: '',
//   gstOnGstMode: false,
// });

//   //const [works, setWorks] = useState([{ work_type: '', uom: '', qty: 0, price: 0, total_price: 0, remark: '' }]);

//   const [works, setWorks] = useState([{
//   work_type: '',
//   uom: '',
//   qty: 0,
//   price: 0,
//   total_price: 0,           // ← This will now be: (qty × price) + CGST + SGST
//   gst_percent: 18,          // customizable per row
//   cgst_amount: 9,
//   sgst_amount: 9,
//   remark: '',
// }]);

//   // Modal state for adding new project
//   const [showAddProjectModal, setShowAddProjectModal] = useState(false);
//   const [newProjectForm, setNewProjectForm] = useState({
//     customer_name: '',
//     mobile_number: '',
//     project_name: '',
//     work_place: '',
//     project_type_id: '',
//     // is_confirm: 0,
//   });

//   const [projectTypes, setProjectTypes] = useState([]);

//   useEffect(() => {
//     const fetchProjectTypes = async () => {
//       try {
//         const response = await getAPICall('/api/project-types');
//         setProjectTypes(response || []);
//       } catch (error) {
//         console.error('Error fetching project types:', error);
//       }
//     };
//     fetchProjectTypes();
//   }, []);

//   // Payment Terms
//   const initialPaymentTerms = [
//     '25% Advance release on team mobilization onsite.',
//     '25% Release on completion of pile foundation.',
//     '20% Release after completion of MMS and Module mounting.',
//     '20% to be released on completion of AC/DC.',
//     '10% released after work has been completed and handed over to the client.',
//   ];
//   const [paymentTerms, setPaymentTerms] = useState(initialPaymentTerms);
//   const [editingPaymentIndex, setEditingPaymentIndex] = useState(-1);
//   const [editingPaymentValue, setEditingPaymentValue] = useState('');
//   const [newPaymentTerm, setNewPaymentTerm] = useState('');

//   // Terms & Conditions
//   const initialTermsAndConditions = [
//     '18% Tax Extra',
//     'ROW on your side',
//     'Work will commence only after receiving an official work order',
//   ];
//   const [termsAndConditions, setTermsAndConditions] = useState(initialTermsAndConditions);
//   const [editingConditionIndex, setEditingConditionIndex] = useState(-1);
//   const [editingConditionValue, setEditingConditionValue] = useState('');
//   const [newCondition, setNewCondition] = useState('');

//   // Note
//   const [note, setNote] = useState('');

//   // Calculate remaining amount
//   const calculateRemainingAmount = () => {
//     return Math.max(0, form.finalAmount - form.paidAmount);
//   };

//   // Fetch projects with search functionality
//   const fetchProjects = useCallback(async (query = '') => {
//     setProjectsLoading(true);
//     try {
//       const endpoint = query ? `/api/projects?searchQuery=${encodeURIComponent(query)}` : '/api/projects';
//       const resp = await getAPICall(endpoint);
//       console.log('Fetched projects (raw):', resp);

//       const data = Array.isArray(resp) ? resp : resp?.data;

//       if (!data || !Array.isArray(data)) {
//         console.log('Invalid API response - no data array');
//         setAllProjects([]);
//         if (!query) showToast('warning', 'No projects data available from server');
//         return;
//       }

//       const validProjects = data
//         .map((p) => ({
//           id: p.id,
//           project_name: p.project_name || 'Unknown Project',
//           customer_name: p.customer_name || 'Unknown Customer',
//           work_place: p.work_place || '',
//           project_cost: p.project_cost || '0',
//           mobile_number: p.mobile_number || '',
//           gst_number: p.gst_number || '',
//           remark: p.remark || '',
//           customer_id: p.customer_id || p.id,
//           customer: {
//             name: p.customer_name || 'Unknown',
//             address: p.work_place || 'N/A',
//             mobile: p.mobile_number || 'N/A',
//           },
//           start_date: p.start_date,
//           end_date: p.end_date,
//           // project_type: p.project_type?.name || '', // Map project_type name
//           project_type: p.project_type || '',
//         }))
//         .filter((p) => p.project_name && p.customer_id);

//       console.log('Transformed projects:', validProjects);
//       setAllProjects(validProjects);

//       if (validProjects.length === 0 && !query) {
//         showToast('warning', 'No valid projects found - check API data');
//       }
//     } catch (error) {
//       console.error('Error fetching projects:', error);
//       setAllProjects([]);
//       if (!query) showToast('danger', 'Failed to fetch projects');
//     } finally {
//       setProjectsLoading(false);
//     }
//   }, []);

//   // Initialize with initialData if in edit mode
//   useEffect(() => {
//   if (editMode && initialData) {
//     setForm({
//       projectId: initialData.projectId,
//       projectName: initialData.projectName,
//       customer_id: initialData.customer_id,
//       customer_name: initialData.customer?.name || '',
//       address: initialData.customer?.address || '',
//       mobile_number: initialData.customer?.mobile || '',
//       project_type: initialData.project_type || '', // Initialize project_type
//       customer: initialData.customer,
//       invoiceType: initialData.invoiceType,
//       invoiceDate: initialData.invoiceDate,
//       deliveryDate: initialData.deliveryDate || new Date().toISOString().split('T')[0],
//       discount: initialData.discount || 0,
//       paidAmount: initialData.paidAmount || 0,
//       subtotal: initialData.subtotal || 0,
//       taxableAmount: initialData.taxableAmount || 0,
//       gstAmount: initialData.gstAmount || 0,
//       sgstAmount: initialData.sgstAmount || 0,
//       cgstAmount: initialData.cgstAmount || 0,
//       igstAmount: initialData.igstAmount || 0,
//       finalAmount: initialData.finalAmount || 0,
//       gstPercentage: initialData.gstPercentage ?? 0,
//       sgstPercentage: initialData.sgstPercentage ?? 0,
//       cgstPercentage: initialData.cgstPercentage ?? 0,
//       igstPercentage: initialData.igstPercentage ?? 0,
//       ref_id: initialData.ref_id,
//       po_number: initialData.po_number || '',
//     });
//     setWorks(initialData.items || [{ work_type: '', uom: '', qty: 0, price: 0, total_price: 0, remark: '' }]);
//     setSearchQuery(initialData.projectName || '');
//     calculateTotals(initialData.items || works);
//     setPaymentTerms(initialData.payment_terms ? initialData.payment_terms.split('\n') : initialPaymentTerms);
//     setTermsAndConditions(initialData.terms_and_conditions ? initialData.terms_and_conditions.split('\n') : initialTermsAndConditions);
//     setNote(initialData.note || '');
//   }
// }, [editMode, initialData]);

//   // Initial fetch
//   useEffect(() => {
//     fetchProjects();
//   }, [fetchProjects]);

//   // Debounced search
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       if (searchQuery && searchQuery.length > 2 && !isModalSelection && !form.projectId) {
//         fetchProjects(searchQuery);
//       } else {
//         setAllProjects([]);
//         setFilteredProjects([]);
//         setShowDropdown(false);
//       }
//       setIsModalSelection(false); // Reset after handling
//     }, 300);
//     return () => clearTimeout(timer);
//   }, [searchQuery, fetchProjects, isModalSelection, form.projectId]);

//   // Filter projects based on search query
//   useEffect(() => {
//     if (searchQuery && allProjects.length > 0 && !form.projectId) {
//       const query = searchQuery.toLowerCase();
//       const filtered = allProjects.filter((p) => {
//         return (
//           (p.project_name && p.project_name.toLowerCase().includes(query)) ||
//           (p.customer_name && p.customer_name.toLowerCase().includes(query)) ||
//           (p.work_place && p.work_place.toLowerCase().includes(query)) ||
//           (p.mobile_number && p.mobile_number.includes(query)) ||
//           (p.remark && p.remark.toLowerCase().includes(query))
//         );
//       });
//       console.log('Filtered projects:', filtered, 'Query:', searchQuery);
//       setFilteredProjects(filtered);
//       setShowDropdown(filtered.length > 0 && searchQuery.length > 2 && !form.projectId);
//     } else {
//       setFilteredProjects([]);
//       setShowDropdown(false);
//     }
//   }, [searchQuery, allProjects, form.projectId]);

//   // Handle click outside to close dropdown
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (
//         projectInputRef.current &&
//         !projectInputRef.current.contains(event.target) &&
//         dropdownRef.current &&
//         !dropdownRef.current.contains(event.target)
//       ) {
//         setShowDropdown(false);
//       }
//     };

//     if (showDropdown) {
//       document.addEventListener('mousedown', handleClickOutside);
//     }

//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, [showDropdown]);

//   // Handle project selection (used for both dropdown and modal)
//   const handleProjectChange = (project) => {
//     console.log('Selected project:', project);
//     setForm((prev) => ({
//       ...prev,
//       projectId: project.id,
//       projectName: project.project_name,
//       customer_id: project.customer_id || project.id,
//       customer_name: project.customer_name || project.customer?.name || '',
//       address: project.work_place || project.location || '',
//       mobile_number: project.mobile_number || project.customer?.mobile || '',
//       project_type: project.project_type || '', // Set project_type
//       customer: {
//         name: project.customer_name || project.customer?.name || '',
//         address: project.work_place || project.location || '',
//         mobile: project.mobile_number || project.customer?.mobile || '',
//       },
//     }));
//     setSearchQuery(project.project_name);
//     setIsModalSelection(true);
//     setShowDropdown(false);
//     setAllProjects([]);
//     setFilteredProjects([]);
//   };

//   const clearProject = () => {
//     setForm((prev) => ({
//       ...prev,
//       projectId: null,
//       projectName: '',
//       customer_id: null,
//       customer_name: '',
//       address: '',
//       mobile_number: '',
//       project_type: '', // Clear project_type
//       customer: { name: '', address: '', mobile: '' },
//     }));
//     setSearchQuery('');
//     setShowDropdown(false);
//     setAllProjects([]);
//     setFilteredProjects([]);
//   };

//   const handleFormChange = (e) => {
//     const { name, value } = e.target;
//     setForm((prev) => {
//       let newForm = {
//         ...prev,
//         [name]: name === 'discount' || name === 'paidAmount' || name.endsWith('Percentage') ? parseFloat(value) || 0 : value,
//       };

//       if (name === 'gstPercentage') {
//         const totalGST = parseFloat(value) || 0;
//         const halfGST = totalGST / 2;
//         newForm = {
//           ...newForm,
//           sgstPercentage: halfGST,
//           cgstPercentage: halfGST,
//         };
//       } else if (name === 'sgstPercentage' || name === 'cgstPercentage') {
//         const sgst = name === 'sgstPercentage' ? parseFloat(value) || 0 : prev.sgstPercentage;
//         const cgst = name === 'cgstPercentage' ? parseFloat(value) || 0 : prev.cgstPercentage;
//         newForm = {
//           ...newForm,
//           gstPercentage: sgst + cgst,
//         };
//       }

//       if (name === 'discount' || name.endsWith('Percentage')) {
//         const subtotal = works.reduce((sum, w) => sum + (w.total_price || 0), 0);
//         const base = subtotal - newForm.discount;
//         const sgstAmount = base * (newForm.sgstPercentage / 100);
//         const cgstAmount = base * (newForm.cgstPercentage / 100);
//         const igstAmount = base * (newForm.igstPercentage / 100);
//         const gstAmount = sgstAmount + cgstAmount + igstAmount;
//         const finalAmount = base + gstAmount;
//         newForm = {
//           ...newForm,
//           subtotal,
//           taxableAmount: base,
//           gstAmount,
//           sgstAmount,
//           cgstAmount,
//           igstAmount,
//           finalAmount,
//         };
//       }

//       return newForm;
//     });
//   };





// const handleWorkChange = (index, field, value) => {
//   const updated = [...works];
//   const item = updated[index];
//   const isWorkOrder = item.isWorkOrder === true;
//   const alreadyBilled = item.alreadyBilledQty || 0;

//   if (field === 'qty') {
//     // Allow completely empty field (user deleted everything)
//     if (value === '' || value === null) {
//       updated[index].qty = '';
//     }
//     // When user actually types a number
//     else {
//       const parsed = parseFloat(value);
//       let newQty = Number.isNaN(parsed) ? 0 : parsed;

//       // Enforce minimum ONLY when user has entered a real number
//       // and it's a work order row with previous billing
//       if (isWorkOrder && alreadyBilled > 0 && newQty < alreadyBilled) {
//         showToast(
//           'danger',
//           `Quantity cannot be less than already billed (${alreadyBilled.toFixed(2)}). You can only add more.`
//         );
//         newQty = alreadyBilled;
//       }

//       updated[index].qty = newQty;
//     }
//   }
//   else if (field === 'price') {
//     updated[index].price = value === "" ? 0 : parseFloat(value) || 0;
//   }
//   else if (field === 'gst_percent') {
//     updated[index].gst_percent =
//       value === "" || value === null || value === undefined
//         ? 0
//         : parseFloat(value) || 0;
//   }
//   else {
//     updated[index][field] = value;
//   }

//   // For calculations: treat empty qty as 0
//   const qtyForCalc = typeof updated[index].qty === 'string' ? 0 : (updated[index].qty || 0);
//   const price = updated[index].price || 0;
//   const gstPercent = updated[index].gst_percent ?? 0;

//   const baseAmount = qtyForCalc * price;
//   const halfGST = gstPercent / 2;

//   const cgst = baseAmount * (halfGST / 100);
//   const sgst = baseAmount * (halfGST / 100);

//   updated[index].cgst_amount = cgst;
//   updated[index].sgst_amount = sgst;
//   updated[index].total_price = baseAmount + cgst + sgst;

//   setWorks(updated);
//   calculateTotals(updated);
// };









// const addWorkRow = () => {
//   setWorks([
//     ...works,
//     {
//       work_type: '',
//       uom: '',
//       qty: 0,
//       price: 0,
//       total_price: 0,
//       gst_percent: 18,
//       cgst_amount: 9,
//       sgst_amount: 9,
//       remark: '',
//       alreadyBilledQty: 0,     // ← no billed qty
//       isWorkOrder: false,      // ← no restrictions
//     },
//   ]);
// };



//   const removeWorkRow = (index) => {
//     const updated = [...works];
//     updated.splice(index, 1);
//     setWorks(updated);
//     calculateTotals(updated);
//   };



// const calculateTotals = (currentWorks) => {
//   setForm((prev) => {
//     // STEP 1: Calculate base subtotal (qty × price, no GST)
//     const baseSubtotal = currentWorks.reduce((sum, w) => sum + (w.qty * w.price), 0);
    
//     // STEP 2: Calculate row-level GST totals
//     const rowCGST = currentWorks.reduce((sum, w) => sum + (w.cgst_amount || 0), 0);
//     const rowSGST = currentWorks.reduce((sum, w) => sum + (w.sgst_amount || 0), 0);
//     const rowTotalGST = rowCGST + rowSGST;
    
//     // STEP 3: Total after row-level GST (this is the final amount)
//     const totalAfterRowGST = currentWorks.reduce((sum, w) => sum + (w.total_price || 0), 0);
    
//     // STEP 4: Apply discount
//     const finalAmount = totalAfterRowGST - (prev.discount || 0);
    
//     return {
//       ...prev,
//       subtotal: baseSubtotal,           // Original base without any GST
//       taxableAmount: totalAfterRowGST,  // After row GST
      
//       // Global GST fields all stay at 0
//       gstAmount: 0,
//       cgstAmount: 0,
//       sgstAmount: 0,
//       igstAmount: 0,
      
//       finalAmount: finalAmount,
//     };
//   });
// };






//   const submitInvoice = async (e) => {
//     e.preventDefault();
//     const formElement = e.currentTarget;
//     if (!formElement.checkValidity()) {
//       setValidated(true);
//       return;
//     }
//     if (!form.projectId || !form.customer_id) {
//       showToast('danger', 'Please select a project with a valid customer');
//       return;
//     }
   

//     try {
//       setLoading(true);
//       const data = {
//         ...form,
//         project_id: form.projectId,
//         customer_name: form.customer_name,
//         address: form.address,
//         mobile_number: form.mobile_number,
//         items: works.filter((w) => w.work_type && w.qty > 0),
//         payment_terms: paymentTerms.join('\n'),
//         terms_and_conditions: termsAndConditions.join('\n'),
//         note: note,
//       };
//       console.log('Submitting data:', data);

//       if (editMode && onSubmit) {
//         await onSubmit(data);
//       } else {
//         const resp = await post('/api/order', data);
//         if (resp) {
//           showToast('success', 'Invoice created successfully');
//           navigate(`/invoice-details/${resp.id}`);
//         }
//       }
//     } catch (error) {
//       console.error('Submit error:', error);
//       showToast('danger', 'Failed to create invoice');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleNewProjectChange = (e) => {
//     const { name, value } = e.target;
//     setNewProjectForm((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

  


// const saveNewProject = async () => {
//   // Trigger validation
//   setValidatedProjectForm(true);

//   // Check all required fields
//   if (
//     !newProjectForm.customer_name ||
//     !newProjectForm.mobile_number ||
//     newProjectForm.mobile_number.length !== 10 ||
//     !/^[0-9]{10}$/.test(newProjectForm.mobile_number) ||
//     !newProjectForm.project_name ||
//     !newProjectForm.work_place ||
//     !newProjectForm.project_type_id
//   ) {
//     showToast('danger', 'Please fill all required fields correctly');
//     return;
//   }

//   try {
//     const resp = await post('/api/projects', newProjectForm);
//     if (resp) {
//       showToast('success', 'Project added successfully');
//       setShowAddProjectModal(false);
//       // Reset form
//       setNewProjectForm({
//         customer_name: '',
//         mobile_number: '',
//         project_name: '',
//         work_place: '',
//         project_type_id: '',
//         gst_number: '',
//         pan_number: '',
//         // is_confirm: 0,
//       });
//       setValidatedProjectForm(false); // Reset validation state
//       fetchProjects(); // Refresh project list
//     }
//   } catch (error) {
//     console.error('Error adding project:', error);
//     showToast('danger', 'Failed to add project');
//   }
// };



//   return (
//     <CRow>
//       <CCol xs={12}>
//         <CCard className="mb-4">
//           <CCardHeader>
//             <strong>{editMode ? 'Edit Invoice' : 'Create Invoice'}</strong>
//           </CCardHeader>
//           <CCardBody>
//             <CForm validated={validated} onSubmit={submitInvoice}>
//               {/* Project Selection */}
//               <CRow className="mb-3">
//                 <CCol md={6}>
//                   <CFormLabel>Project Name *</CFormLabel>
//                   <div ref={projectInputRef} style={{ position: 'relative' }}>
//                     <CInputGroup>
//                       <CFormInput
//                         type="text"
//                         value={searchQuery}
//                         onChange={(e) => {
//                           setSearchQuery(e.target.value);
//                           if (!form.projectId) {
//                             setShowDropdown(e.target.value.length > 2);
//                           } else {
//                             setShowDropdown(false);
//                           }
//                         }}
//                         placeholder="Search by project name, customer, location..."
//                         required
//                       />
//                       <CInputGroupText
//                         className="cursor-pointer"
//                         onClick={() => {
//                           if (form.projectName || searchQuery) {
//                             clearProject();
//                           } else {
//                             setShowProjectModal(true);
//                           }
//                         }}
//                       >
//                         <CIcon icon={form.projectName || searchQuery ? cilX : cilSearch} />
//                       </CInputGroupText>
//                     </CInputGroup>

//                     {projectsLoading && showDropdown && searchQuery.length > 2 && (
//                       <div className="dropdown-menu show p-2">
//                         <CSpinner size="sm" /> Loading projects...
//                       </div>
//                     )}

//                     {showDropdown && filteredProjects.length > 0 && !form.projectId && (
//                       <div ref={dropdownRef} className="dropdown-menu show" style={{ maxHeight: '300px', overflowY: 'auto' }}>
//                         {filteredProjects.map((project) => (
//                           <div
//                             key={project.id}
//                             className="dropdown-item cursor-pointer p-2 border-bottom"
//                             onClick={() => handleProjectChange(project)}
//                             onMouseEnter={(e) => (e.target.style.backgroundColor = '#f8f9fa')}
//                             onMouseLeave={(e) => (e.target.style.backgroundColor = 'white')}
//                           >
//                             <div className="fw-medium text-primary">{project.project_name}</div>
//                             <div className="small text-muted">
//                               <strong>Customer:</strong> {project.customer_name}
//                             </div>
//                             {project.project_type && (
//                               <div className="small text-muted">
//                                 <strong>Type:</strong> {project.project_type}
//                               </div>
//                             )}
//                             {project.work_place && (
//                               <div className="small text-muted">
//                                 <strong>Location:</strong> {project.work_place}
//                               </div>
//                             )}
//                             {project.project_cost && (
//                               <div className="small text-success">
//                                 <strong>Amount:</strong> ₹{project.project_cost}
//                               </div>
//                             )}
//                             {project.mobile_number && (
//                               <div className="small text-muted">
//                                 <strong>Mobile:</strong> {project.mobile_number}
//                               </div>
//                             )}
//                           </div>
//                         ))}
//                         {!form.projectId && (
//                           <div
//                             className="dropdown-item cursor-pointer p-2 border-top text-primary"
//                             onClick={() => setShowAddProjectModal(true)}
//                           >
//                             <CIcon icon={cilPlus} className="me-2" />
//                             Add New Project
//                           </div>
//                         )}
//                       </div>
//                     )}

//                     {searchQuery.length > 2 && filteredProjects.length === 0 && !projectsLoading && !form.projectId && (
//                       <div className="dropdown-menu show" style={{ maxHeight: '300px', overflowY: 'auto' }}>
//                         <div
//                           className="dropdown-item cursor-pointer p-2 border-top text-primary"
//                           onClick={() => setShowAddProjectModal(true)}
//                         >
//                           <CIcon icon={cilPlus} className="me-2" />
//                           Add New Project
//                         </div>
//                       </div>
//                     )}
//                   </div>

//                   {form.projectName && (
//                     <div className="mt-1 p-2 bg-light rounded border">
//                       <div className="small text-success">
//                         <strong>Selected:</strong> {form.projectName}
//                       </div>
//                       <div className="small text-muted">
//                         <strong>Customer:</strong> {form.customer.name}
//                       </div>
//                       {form.projectName && allProjects.find(p => p.id === form.projectId)?.project_type && (
//                          <div className="small text-muted">
//                            <strong>Type:</strong> {allProjects.find(p => p.id === form.projectId)?.project_type}
//                          </div>
//                       )}
//                       {form.customer.address && (
//                         <div className="small text-muted">
//                           <strong>Location:</strong> {form.customer.address}
//                         </div>
//                       )}
//                     </div>
//                   )}
//                 </CCol>

//                 <CCol md={6}>
//                   <CFormLabel>Invoice Date *</CFormLabel>
//                   <CFormInput
//                     type="date"
//                     name="invoiceDate"
//                     value={form.invoiceDate}
//                     onChange={handleFormChange}
//                     required
//                   />
//                 </CCol>
//               </CRow>

//               <CRow className="mb-3">
//                 <CCol md={4}>
//                   <CFormLabel>Delivery Date *</CFormLabel>
//                   <CFormInput
//                     type="date"
//                     name="deliveryDate"
//                     value={form.deliveryDate}
//                     onChange={handleFormChange}
//                     required
//                   />
//                 </CCol>
//                 <CCol md={4}>
//                   <CFormLabel>Reference ID</CFormLabel>
//                   <CFormInput
//                     type="text"
//                     name="ref_id"
//                     value={form.ref_id}
//                     onChange={handleFormChange}
//                     placeholder="Enter Reference ID"
//                   />
//                 </CCol>

//                 <CCol md={4}>
//                   <CFormLabel>Po Number</CFormLabel>
//                   <CFormInput
//                     type="text"
//                     name="po_number"
//                     value={form.po_number}
//                     onChange={handleFormChange}
//                     placeholder="Enter PO Number"
//                   />
//                 </CCol>
//               </CRow>

//               <CRow className="mb-3">
//                 <CCol md={3}>
//                   <CFormLabel>Customer Name</CFormLabel>
//                   <CFormInput value={form.customer.name} readOnly placeholder="Select a project to populate" />
//                 </CCol>
//                 <CCol md={3}>
//                   <CFormLabel>Work Location</CFormLabel>
//                   <CFormInput value={form.customer.address} readOnly placeholder="Select a project to populate" />
//                 </CCol>
//                 <CCol md={3}>
//                   <CFormLabel>Customer Mobile</CFormLabel>
//                   <CFormInput value={form.customer.mobile} readOnly placeholder="Select a project to populate" />
//                 </CCol>
//                 <CCol md={3}>
//                   <CFormLabel>Project Type</CFormLabel>
//                   <CFormInput value={form.project_type} readOnly placeholder="Select a project to populate" />
//                 </CCol>
//               </CRow>

//               <CRow className="mb-3">
//                 <CCol md={6}>
//                   <CFormLabel>Invoice Type *</CFormLabel>
//                   <CFormSelect name="invoiceType" value={form.invoiceType} onChange={handleFormChange} required>
//                     <option value={1}>Quotation</option>
//                     <option value={2}>Work Order</option>
//                   </CFormSelect>
//                 </CCol>
//               </CRow>




// {/* <h6 className="mt-4 mb-3 fw-semibold text-primary border-bottom border-primary pb-2">
//   Work Details
// </h6>




// {works.map((w, idx) => (
//   <div key={idx} className="border rounded p-3 mb-3 bg-light">
   
//     <CRow className="g-3 mb-2 align-items-end">
//       <CCol md={3}>
//         <CFormInput
//           label="Work Type *"
//           placeholder="Work Type"
//           value={w.work_type}
//           onChange={(e) => handleWorkChange(idx, 'work_type', e.target.value)}
//           required
//         />
//       </CCol>

//       <CCol md={2}>
//         <CFormInput
//           label="Unit"
//           placeholder="UOM"
//           value={w.uom}
//           onChange={(e) => handleWorkChange(idx, 'uom', e.target.value)}
//         />
//       </CCol>

//       <CCol md={2}>
//         <CFormInput
//           label="Qty *"
//           type="number"
//           step="0.01"
//           min="0"
//           value={w.qty}
//           onChange={(e) => handleWorkChange(idx, 'qty', e.target.value)}
//           required
//         />
//       </CCol>

//       <CCol md={2}>
//         <CFormLabel>Rate *</CFormLabel>
//         <CInputGroup>
//           <CInputGroupText>₹</CInputGroupText>
//           <CFormInput
//             type="number"
//             step="0.01"
//             min="0"
//             value={w.price}
//             onChange={(e) => handleWorkChange(idx, 'price', e.target.value)}
//             required
//           />
//         </CInputGroup>
//       </CCol>

//       <CCol md={2}>
//         <CFormLabel>Base Amount</CFormLabel>
//         <div className="fw-medium">₹{(w.qty * w.price).toFixed(2)}</div>
//       </CCol>

//       <CCol md={1} className="d-flex align-items-end">
//         <CButton 
//           color="danger" 
//           size="sm" 
//           onClick={() => removeWorkRow(idx)} 
//           disabled={works.length === 1}
//         >
//           ×
//         </CButton>
//       </CCol>
//     </CRow>

  
//     <CRow className="g-3 align-items-end">
//       <CCol md={2}>
//         <CFormInput
//           label="GST %"
//           type="number"
//           step="0.01"
//           min="0"
//           max="100"
//           value={w.gst_percent}
//           onChange={(e) => handleWorkChange(idx, 'gst_percent', e.target.value)}
//         />
//       </CCol>

//       <CCol md={2}>
//         <CFormLabel>CGST</CFormLabel>
//         <div className="text-success fw-medium">₹{w.cgst_amount.toFixed(2)}</div>
//       </CCol>

//       <CCol md={2}>
//         <CFormLabel>SGST</CFormLabel>
//         <div className="text-success fw-medium">₹{w.sgst_amount.toFixed(2)}</div>
//       </CCol>

//       <CCol md={2}>
//         <CFormLabel className="text-primary">Total (with GST)</CFormLabel>
//         <div className="fw-bold text-primary">₹{w.total_price.toFixed(2)}</div>
//       </CCol>

//       <CCol md={4}>
//         <CFormInput
//           label="Remark"
//           placeholder="Optional"
//           value={w.remark}
//           onChange={(e) => handleWorkChange(idx, 'remark', e.target.value)}
//         />
//       </CCol>
//     </CRow>
//   </div>
// ))} 


// <CButton color="warning" variant="outline" className="mb-4" onClick={addWorkRow}>
//   + Add Work
// </CButton> */}




// <h6 className="mt-4 mb-3 fw-semibold text-primary border-bottom border-primary pb-2">
//   Work Details
// </h6>

// {works.map((w, idx) => {
//   const isWorkOrder = w.isWorkOrder === true;
//   const alreadyBilled = w.alreadyBilledQty || 0;

//   return (
//     <div key={idx} className="border rounded p-3 mb-3 bg-light">
//       <CRow className="g-3 mb-2 align-items-end">
//         <CCol md={3}>
//           <CFormInput
//             label="Work Type *"
//             placeholder="Work Type"
//             value={w.work_type}
//             onChange={(e) => handleWorkChange(idx, 'work_type', e.target.value)}
//             required
//           />
//         </CCol>

//         <CCol md={2}>
//           <CFormInput
//             label="UOM"
//             placeholder="Unit"
//             value={w.uom}
//             onChange={(e) => handleWorkChange(idx, 'uom', e.target.value)}
//           />
//         </CCol>

//         <CCol md={2}>
//           <CFormLabel>
//             Qty *
//             {isWorkOrder && alreadyBilled > 0 && (
//               <small className="text-danger d-block mt-1">
//                 Already billed: {alreadyBilled.toFixed(2)}
//               </small>
//             )}
//           </CFormLabel>
//           <CFormInput
//             type="number"
//             step="0.01"
//             min="0"
//             // value={w.qty}
//             value={w.qty === '' ? '' : w.qty}
//             onChange={(e) => handleWorkChange(idx, 'qty', e.target.value)}
//             required
//           />
//         </CCol>

//         {/* <CCol md={2}>
//           <CFormLabel>Rate *</CFormLabel>
//           <CInputGroup>
//             <CInputGroupText>₹</CInputGroupText>
//             <CFormInput
//               type="number"
//               step="0.01"
//               min="0"
//               value={w.price}
//               onChange={(e) => handleWorkChange(idx, 'price', e.target.value)}
//               required
//               readOnly={isWorkOrder}
//               disabled={isWorkOrder}
//             />
//           </CInputGroup>
//         </CCol> */}


// <CCol md={2}>
//   <CFormLabel>
//     Rate *
//     {w.isWorkOrder && w.alreadyBilledQty > 0 && (
//       <small className="text-danger d-block mt-1">
//         Price locked (already billed)
//       </small>
//     )}
//   </CFormLabel>
//   <CInputGroup>
//     <CInputGroupText>₹</CInputGroupText>
//     <CFormInput
//       type="number"
//       step="0.01"
//       min="0"
//       value={w.price}
//       onChange={(e) => handleWorkChange(idx, 'price', e.target.value)}
//       required
//       readOnly={w.isWorkOrder && w.alreadyBilledQty > 0}
//       disabled={w.isWorkOrder && w.alreadyBilledQty > 0}
//     />
//   </CInputGroup>
// </CCol>



//         <CCol md={2}>
//           <CFormLabel>Base Amount</CFormLabel>
//           <div className="fw-medium pt-2">
//             ₹{((w.qty || 0) * (w.price || 0)).toFixed(2)}
//           </div>
//         </CCol>

//         <CCol md={1} className="d-flex align-items-end">
//           <CButton
//             color="danger"
//             size="sm"
//             onClick={() => removeWorkRow(idx)}
//             disabled={works.length === 1}
//           >
//             ×
//           </CButton>
//         </CCol>
//       </CRow>

//       <CRow className="g-3 align-items-end">
//         <CCol md={2}>
//           <CFormInput
//             label="GST %"
//             type="number"
//             step="0.01"
//             min="0"
//             max="100"
//             value={w.gst_percent}
//             onChange={(e) => handleWorkChange(idx, 'gst_percent', e.target.value)}
//           />
//         </CCol>

//         <CCol md={2}>
//           <CFormLabel>CGST</CFormLabel>
//           <div className="text-success fw-medium">
//             ₹{Number(w.cgst_amount || 0).toFixed(2)}
//           </div>
//         </CCol>

//         <CCol md={2}>
//           <CFormLabel>SGST</CFormLabel>
//           <div className="text-success fw-medium">
//             ₹{Number(w.sgst_amount || 0).toFixed(2)}
//           </div>
//         </CCol>

//         <CCol md={2}>
//           <CFormLabel className="text-primary">Total (with GST)</CFormLabel>
//           <div className="fw-bold text-primary">
//             ₹{(w.total_price || 0).toFixed(2)}
//           </div>
//         </CCol>

//         <CCol md={4}>
//           <CFormInput
//             label="Remark"
//             placeholder="Remark"
//             value={w.remark}
//             onChange={(e) => handleWorkChange(idx, 'remark', e.target.value)}
//           />
//         </CCol>
//       </CRow>
//     </div>
//   );
// })}

// <CButton
//   color="warning"
//   variant="outline"
//   className="mb-4"
//   onClick={addWorkRow}
// >
//   + Add Work
// </CButton>











              

// <div className="alert alert-info border-0 bg-info-subtle mb-3">
//   <div className="d-flex">
//     <div>
//       <strong className="text-info">Auto-Calculation:</strong>
//       <ul className="mb-0 mt-1 text-info">
//         <li>
//           <small>Enter GST % to work row for auto-split into CGST and SGST</small>
//         </li>
//         {/* <li>
//           <small>Modify CGST or SGST to auto-update total GST %</small>
//         </li> */}
//       </ul>
//     </div>
//   </div>
// </div>


// <CRow className="mb-3">
//   <CCol md={6}>
//     <CFormLabel>Final Amount</CFormLabel>
//     <CInputGroup>
//       <CInputGroupText>₹</CInputGroupText>
//       <CFormInput type="number" value={Number(form.finalAmount || 0).toFixed(2)} readOnly />
//     </CInputGroup>
//   </CCol>
//   <CCol md={6}>
//     <CFormLabel>Remaining Amount</CFormLabel>
//     <CInputGroup>
//       <CInputGroupText>₹</CInputGroupText>
//       <CFormInput
//         type="number"
//         value={Number(calculateRemainingAmount() || 0).toFixed(2)}
//         readOnly
//         className="text-danger fw-medium"
//       />
//     </CInputGroup>
//   </CCol>
// </CRow>

//               <h6 className="mt-4 mb-3 fw-semibold text-primary border-bottom border-primary pb-2">Payment Terms</h6>
//               <div className="d-flex flex-wrap gap-2 mb-3">
//                 {paymentTerms.map((term, idx) => {
//                   if (editingPaymentIndex === idx) {
//                     return (
//                       <CInputGroup key={idx} style={{ width: 'auto' }}>
//                         <CFormInput
//                           value={editingPaymentValue}
//                           onChange={(e) => setEditingPaymentValue(e.target.value)}
//                         />
//                         <CButton
//                           color="success"
//                           onClick={() => {
//                             const newTerms = [...paymentTerms];
//                             newTerms[idx] = editingPaymentValue;
//                             setPaymentTerms(newTerms);
//                             setEditingPaymentIndex(-1);
//                           }}
//                         >
//                           Save
//                         </CButton>
//                         <CButton color="secondary" onClick={() => setEditingPaymentIndex(-1)}>
//                           Cancel
//                         </CButton>
//                       </CInputGroup>
//                     );
//                   } else {
//                     return (
//                       <CBadge color="info" key={idx} className="me-1 mb-1" style={{ fontSize: '0.9em' }}>
//                         {term}
//                         <CIcon
//                           icon={cilPencil}
//                           className="ms-2"
//                           style={{ cursor: 'pointer' }}
//                           onClick={() => {
//                             setEditingPaymentIndex(idx);
//                             setEditingPaymentValue(term);
//                           }}
//                         />
//                         <CIcon
//                           icon={cilX}
//                           className="ms-1"
//                           style={{ cursor: 'pointer' }}
//                           onClick={() => {
//                             setPaymentTerms(paymentTerms.filter((_, i) => i !== idx));
//                           }}
//                         />
//                       </CBadge>
//                     );
//                   }
//                 })}
//               </div>
//               <CRow className="mb-3">
//                 <CCol md={6}>
//                   <CInputGroup>
//                     <CFormInput
//                       placeholder="Add new payment term..."
//                       value={newPaymentTerm}
//                       onChange={(e) => setNewPaymentTerm(e.target.value)}
//                     />
//                     <CButton
//                       color="primary"
//                       onClick={() => {
//                         if (newPaymentTerm.trim()) {
//                           setPaymentTerms([...paymentTerms, newPaymentTerm.trim()]);
//                           setNewPaymentTerm('');
//                         }
//                       }}
//                     >
//                       Add
//                     </CButton>
//                   </CInputGroup>
//                 </CCol>
//               </CRow>

//               <h6 className="mt-4 mb-3 fw-semibold text-primary border-bottom border-primary pb-2">Terms & Conditions</h6>
//               <div className="d-flex flex-wrap gap-2 mb-3">
//                 {termsAndConditions.map((term, idx) => {
//                   if (editingConditionIndex === idx) {
//                     return (
//                       <CInputGroup key={idx} style={{ width: 'auto' }}>
//                         <CFormInput
//                           value={editingConditionValue}
//                           onChange={(e) => setEditingConditionValue(e.target.value)}
//                         />
//                         <CButton
//                           color="success"
//                           onClick={() => {
//                             const newConditions = [...termsAndConditions];
//                             newConditions[idx] = editingConditionValue;
//                             setTermsAndConditions(newConditions);
//                             setEditingConditionIndex(-1);
//                           }}
//                         >
//                           Save
//                         </CButton>
//                         <CButton color="secondary" onClick={() => setEditingConditionIndex(-1)}>
//                           Cancel
//                         </CButton>
//                       </CInputGroup>
//                     );
//                   } else {
//                     return (
//                       <CBadge color="warning" key={idx} className="me-1 mb-1" style={{ fontSize: '0.9em' }}>
//                         {term}
//                         <CIcon
//                           icon={cilPencil}
//                           className="ms-2"
//                           style={{ cursor: 'pointer' }}
//                           onClick={() => {
//                             setEditingConditionIndex(idx);
//                             setEditingConditionValue(term);
//                           }}
//                         />
//                         <CIcon
//                           icon={cilX}
//                           className="ms-1"
//                           style={{ cursor: 'pointer' }}
//                           onClick={() => {
//                             setTermsAndConditions(termsAndConditions.filter((_, i) => i !== idx));
//                           }}
//                         />
//                       </CBadge>
//                     );
//                   }
//                 })}
//               </div>
//               <CRow className="mb-3">
//                 <CCol md={6}>
//                   <CInputGroup>
//                     <CFormInput
//                       placeholder="Add new condition..."
//                       value={newCondition}
//                       onChange={(e) => setNewCondition(e.target.value)}
//                     />
//                     <CButton
//                       color="primary"
//                       onClick={() => {
//                         if (newCondition.trim()) {
//                           setTermsAndConditions([...termsAndConditions, newCondition.trim()]);
//                           setNewCondition('');
//                         }
//                       }}
//                     >
//                       Add
//                     </CButton>
//                   </CInputGroup>
//                 </CCol>
//               </CRow>

//               <h6 className="mt-4 mb-2 fw-semibold text-primary border-bottom border-primary pb-2">Additional Note</h6>
//               <CFormTextarea
//                 type="text"
//                 className="mb-3"
//                 placeholder="Enter note if any..."
//                 value={note}
//                 onChange={(e) => setNote(e.target.value)}
//               />

//               <CButton
//                 color="primary"
//                 type="submit"
//                 disabled={loading || !form.projectId || !form.customer_id || projectsLoading}
//               >
//                 {loading ? <CSpinner size="sm" /> : editMode ? 'Update Invoice' : 'Submit Invoice'}
//               </CButton>
//               &nbsp;&nbsp;
//               {editMode && (
//                 <CButton color="secondary" type="button" onClick={() => navigate('/invoiceTable')}>
//                   Close
//                 </CButton>
//               )}
//             </CForm>
//           </CCardBody>
//         </CCard>
//       </CCol>

   

//       <CModal visible={showAddProjectModal} onClose={() => setShowAddProjectModal(false)}>
//   <CModalHeader>
//     <CModalTitle>Add New Project</CModalTitle>
//   </CModalHeader>
//   <CModalBody>
//     <CForm>
//       <CRow className="mb-3">
//         <CCol md={6}>
//           <CFormLabel>Customer Name <span className="text-danger">*</span></CFormLabel>
//           <CFormInput
//             type="text"
//             name="customer_name"
//             value={newProjectForm.customer_name}
//             onChange={handleNewProjectChange}
//             required
//             placeholder="Enter customer name"
//             invalid={!newProjectForm.customer_name && validatedProjectForm}
//           />
//         </CCol>

//         <CCol md={6}>
//           <CFormLabel>Mobile Number <span className="text-danger">*</span></CFormLabel>
//           <CFormInput
//             type="text"
//             name="mobile_number"
//             value={newProjectForm.mobile_number}
//             onChange={handleNewProjectChange}
//             required
//             maxLength={10}
//             minLength={10}
//             pattern="^[0-9]{10}$"
//             placeholder="Enter 10-digit mobile number"
//             invalid={!newProjectForm.mobile_number && validatedProjectForm}
//           />
//         </CCol>
//       </CRow>

//       <CRow className="mb-3">
//         <CCol md={6}>
//           <CFormLabel>Project Name <span className="text-danger">*</span></CFormLabel>
//           <CFormInput
//             type="text"
//             name="project_name"
//             value={newProjectForm.project_name}
//             onChange={handleNewProjectChange}
//             required
//             placeholder="Enter project name"
//             invalid={!newProjectForm.project_name && validatedProjectForm}
//           />
//         </CCol>

//         <CCol md={6}>
//           <CFormLabel>Work Place <span className="text-danger">*</span></CFormLabel>
//           <CFormInput
//             type="text"
//             name="work_place"
//             value={newProjectForm.work_place}
//             onChange={handleNewProjectChange}
//             required
//             placeholder="Enter work location / site address"
//             invalid={!newProjectForm.work_place && validatedProjectForm}
//           />
//         </CCol>
//       </CRow>

//       <CRow className="mb-3">
//         <CCol md={6}>
//           <CFormLabel>Project Type <span className="text-danger">*</span></CFormLabel>
//           <CFormSelect
//             name="project_type_id"
//             value={newProjectForm.project_type_id}
//             onChange={handleNewProjectChange}
//             required
//             invalid={!newProjectForm.project_type_id && validatedProjectForm}
//           >
//             <option value="">Select Project Type</option>
//             {projectTypes.map((type) => (
//               <option key={type.id} value={type.id}>
//                 {type.name}
//               </option>
//             ))}
//           </CFormSelect>
//         </CCol>

//         {/* Optional GST & PAN (kept as they were) */}
//         <CCol md={6}>
//           <CFormLabel>GST number</CFormLabel>
//           <CFormInput
//             type="text"
//             name="gst_number"
//             value={newProjectForm.gst_number || ''}
//             onChange={(e) => {
//               const value = e.target.value.toUpperCase();
//               if (/^[A-Z0-9]{0,15}$/.test(value)) {
//                 handleNewProjectChange({ target: { name: "gst_number", value } });
//               }
//             }}
//             maxLength={15}
//             placeholder="Enter GST number (15 chars)"
//           />
//         </CCol>
//       </CRow>

//       {/* PAN field remains optional */}
//       <CRow className="mb-3">
//         <CCol md={6}>
//           <CFormLabel>Pan Card number</CFormLabel>
//           <CFormInput
//             type="text"
//             name="pan_number"
//             value={newProjectForm.pan_number || ''}
//             onChange={(e) => {
//               const value = e.target.value.toUpperCase();
//               if (/^[A-Z0-9]{0,10}$/.test(value)) {
//                 handleNewProjectChange({ target: { name: "pan_number", value } });
//               }
//             }}
//             maxLength={10}
//             placeholder="Enter PAN number (10 chars)"
//           />
//         </CCol>
//       </CRow>
//     </CForm>
//   </CModalBody>

//   <CModalFooter>
//     <CButton color="secondary" onClick={() => setShowAddProjectModal(false)}>
//       Close
//     </CButton>
//     <CButton
//       color="primary"
//       onClick={saveNewProject}
//       disabled={
//         !newProjectForm.customer_name ||
//         !newProjectForm.mobile_number ||
//         !newProjectForm.project_name ||
//         !newProjectForm.work_place ||
//         !newProjectForm.project_type_id
//       }
//     >
//       Save Project
//     </CButton>
//   </CModalFooter>
// </CModal>

//       <ProjectSelectionModal
//         visible={showProjectModal}
//         onClose={() => setShowProjectModal(false)}
//         onSelectProject={handleProjectChange}
//       />
//     </CRow>
//   );
// };

// export default Invoice
























import React, { useEffect, useState, useRef, useCallback } from 'react';
import './Invoice.css';
import {
  CAlert,
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CRow,
  CSpinner,
  CInputGroup,
  CInputGroupText,
  CFormSelect,
  CFormCheck,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormTextarea,
} from '@coreui/react';
import { cilArrowLeft, cilCart, cilChevronBottom, cilList, cilSearch, cilX, cilPlus, cilPencil } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import { getAPICall, post } from '../../../util/api';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../common/toast/ToastContext';
import { useTranslation } from 'react-i18next';
import ProjectSelectionModal from '../../common/ProjectSelectionModal';

const Invoice = ({ editMode = false, initialData = null, onSubmit = null }) => {
  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [showProjectModal, setShowProjectModal] = useState(false);

  const [validatedProjectForm, setValidatedProjectForm] = useState(false);

  const [allProjects, setAllProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [isModalSelection, setIsModalSelection] = useState(false);
  const projectInputRef = useRef(null);
  const dropdownRef = useRef(null);

  const [form, setForm] = useState({
  projectId: null,
  projectName: '',
  customer_id: null,
  customer_name: '',
  address: '',
  mobile_number: '',
  project_type: '', // Add project_type to form state
  customer: { name: '', address: '', mobile: '' },
  invoiceType: 1, // Default: Quotation
  invoiceDate: new Date().toISOString().split('T')[0],
  deliveryDate: new Date().toISOString().split('T')[0],
  discount: 0,
  paidAmount: 0,
  subtotal: 0,
  taxableAmount: 0,
  gstAmount: 0,
  sgstAmount: 0,
  cgstAmount: 0,
  igstAmount: 0,
  finalAmount: 0,
  gstPercentage: 0,  // ✅ Changed from 18 to 0
  sgstPercentage: 0, // ✅ Changed from 9 to 0
  cgstPercentage: 0, // ✅ Changed from 9 to 0
  igstPercentage: 0,
  ref_id: '',
  po_number: '',
  gstOnGstMode: false,
});

  //const [works, setWorks] = useState([{ work_type: '', uom: '', qty: 0, price: 0, total_price: 0, remark: '' }]);

  const [works, setWorks] = useState([{
  work_type: '',
  uom: '',
  qty: 0,
  price: 0,
  total_price: 0,           // ← This will now be: (qty × price) + CGST + SGST
  gst_percent: 18,          // customizable per row
  cgst_amount: 9,
  sgst_amount: 9,
  remark: '',
  sub_descriptions: [],
}]);

const [newSubDescs, setNewSubDescs] = useState(['']);
const [editingSubDescWorkIdx, setEditingSubDescWorkIdx] = useState(-1);
const [editingSubDescIdx, setEditingSubDescIdx] = useState(-1);
const [editingSubDescValue, setEditingSubDescValue] = useState('');

  // Modal state for adding new project
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [newProjectForm, setNewProjectForm] = useState({
    customer_name: '',
    mobile_number: '',
    project_name: '',
    work_place: '',
    project_type_id: '',
    // is_confirm: 0,
  });

  const [projectTypes, setProjectTypes] = useState([]);

  useEffect(() => {
    const fetchProjectTypes = async () => {
      try {
        const response = await getAPICall('/api/project-types');
        setProjectTypes(response || []);
      } catch (error) {
        console.error('Error fetching project types:', error);
      }
    };
    fetchProjectTypes();
  }, []);

  // Payment Terms
  const initialPaymentTerms = [
    '25% Advance release on team mobilization onsite.',
    '25% Release on completion of pile foundation.',
    '20% Release after completion of MMS and Module mounting.',
    '20% to be released on completion of AC/DC.',
    '10% released after work has been completed and handed over to the client.',
  ];
  const [paymentTerms, setPaymentTerms] = useState(initialPaymentTerms);
  const [editingPaymentIndex, setEditingPaymentIndex] = useState(-1);
  const [editingPaymentValue, setEditingPaymentValue] = useState('');
  const [newPaymentTerm, setNewPaymentTerm] = useState('');

  // Terms & Conditions
  const initialTermsAndConditions = [
    '18% Tax Extra',
    'ROW on your side',
    'Work will commence only after receiving an official work order',
  ];
  const [termsAndConditions, setTermsAndConditions] = useState(initialTermsAndConditions);
  const [editingConditionIndex, setEditingConditionIndex] = useState(-1);
  const [editingConditionValue, setEditingConditionValue] = useState('');
  const [newCondition, setNewCondition] = useState('');

  // Note
  const [note, setNote] = useState('');

  // Calculate remaining amount
  const calculateRemainingAmount = () => {
    return Math.max(0, form.finalAmount - form.paidAmount);
  };

  // Fetch projects with search functionality
  const fetchProjects = useCallback(async (query = '') => {
    setProjectsLoading(true);
    try {
      const endpoint = query ? `/api/projects?searchQuery=${encodeURIComponent(query)}` : '/api/projects';
      const resp = await getAPICall(endpoint);
      console.log('Fetched projects (raw):', resp);

      const data = Array.isArray(resp) ? resp : resp?.data;

      if (!data || !Array.isArray(data)) {
        console.log('Invalid API response - no data array');
        setAllProjects([]);
        if (!query) showToast('warning', 'No projects data available from server');
        return;
      }

      const validProjects = data
        .map((p) => ({
          id: p.id,
          project_name: p.project_name || 'Unknown Project',
          customer_name: p.customer_name || 'Unknown Customer',
          work_place: p.work_place || '',
          project_cost: p.project_cost || '0',
          mobile_number: p.mobile_number || '',
          gst_number: p.gst_number || '',
          remark: p.remark || '',
          customer_id: p.customer_id || p.id,
          customer: {
            name: p.customer_name || 'Unknown',
            address: p.work_place || 'N/A',
            mobile: p.mobile_number || 'N/A',
          },
          start_date: p.start_date,
          end_date: p.end_date,
          // project_type: p.project_type?.name || '', // Map project_type name
          project_type: p.project_type || '',
        }))
        .filter((p) => p.project_name && p.customer_id);

      console.log('Transformed projects:', validProjects);
      setAllProjects(validProjects);

      if (validProjects.length === 0 && !query) {
        showToast('warning', 'No valid projects found - check API data');
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setAllProjects([]);
      if (!query) showToast('danger', 'Failed to fetch projects');
    } finally {
      setProjectsLoading(false);
    }
  }, []);

  // Initialize with initialData if in edit mode
  useEffect(() => {
  if (editMode && initialData) {
    setForm({
      projectId: initialData.projectId,
      projectName: initialData.projectName,
      customer_id: initialData.customer_id,
      customer_name: initialData.customer?.name || '',
      address: initialData.customer?.address || '',
      mobile_number: initialData.customer?.mobile || '',
      project_type: initialData.project_type || '', // Initialize project_type
      customer: initialData.customer,
      invoiceType: initialData.invoiceType,
      invoiceDate: initialData.invoiceDate,
      deliveryDate: initialData.deliveryDate || new Date().toISOString().split('T')[0],
      discount: initialData.discount || 0,
      paidAmount: initialData.paidAmount || 0,
      subtotal: initialData.subtotal || 0,
      taxableAmount: initialData.taxableAmount || 0,
      gstAmount: initialData.gstAmount || 0,
      sgstAmount: initialData.sgstAmount || 0,
      cgstAmount: initialData.cgstAmount || 0,
      igstAmount: initialData.igstAmount || 0,
      finalAmount: initialData.finalAmount || 0,
      gstPercentage: initialData.gstPercentage ?? 0,
      sgstPercentage: initialData.sgstPercentage ?? 0,
      cgstPercentage: initialData.cgstPercentage ?? 0,
      igstPercentage: initialData.igstPercentage ?? 0,
      ref_id: initialData.ref_id,
      po_number: initialData.po_number || '',
    });


    const initialWorks = initialData.items || [{
      work_type: '',
      uom: '',
      qty: 0,
      price: 0,
      total_price: 0,
      gst_percent: 18,
      cgst_amount: 9,
      sgst_amount: 9,
      remark: '',
      sub_descriptions: [],
    }];


    // const processedWorks = initialWorks.map(w => ({
    //   ...w,
    //   sub_descriptions: w.work_sub_description ? w.work_sub_description.split('\n').filter(Boolean) : (w.sub_descriptions || []),
    // }));


    const processedWorks = (initialData.items || []).map(item => ({
  ...item,
  qty: Number(item.qty || 0),
  qtyDisplay: item.qty != null ? String(item.qty) : '',   // ← important: string for input
  sub_descriptions: item.work_sub_description 
    ? item.work_sub_description.split('\n').filter(Boolean) 
    : (item.sub_descriptions || []),
  // alreadyBilledQty and isWorkOrder should already be there from EditInvoice
}));
setWorks(processedWorks);



    setWorks(processedWorks);
    setNewSubDescs(Array(processedWorks.length).fill(''));
    setSearchQuery(initialData.projectName || '');
    calculateTotals(processedWorks);
    setPaymentTerms(initialData.payment_terms ? initialData.payment_terms.split('\n') : initialPaymentTerms);
    setTermsAndConditions(initialData.terms_and_conditions ? initialData.terms_and_conditions.split('\n') : initialTermsAndConditions);
    setNote(initialData.note || '');
  }
}, [editMode, initialData]);

  // Initial fetch
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery && searchQuery.length > 2 && !isModalSelection && !form.projectId) {
        fetchProjects(searchQuery);
      } else {
        setAllProjects([]);
        setFilteredProjects([]);
        setShowDropdown(false);
      }
      setIsModalSelection(false); // Reset after handling
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchProjects, isModalSelection, form.projectId]);

  // Filter projects based on search query
  useEffect(() => {
    if (searchQuery && allProjects.length > 0 && !form.projectId) {
      const query = searchQuery.toLowerCase();
      const filtered = allProjects.filter((p) => {
        return (
          (p.project_name && p.project_name.toLowerCase().includes(query)) ||
          (p.customer_name && p.customer_name.toLowerCase().includes(query)) ||
          (p.work_place && p.work_place.toLowerCase().includes(query)) ||
          (p.mobile_number && p.mobile_number.includes(query)) ||
          (p.remark && p.remark.toLowerCase().includes(query))
        );
      });
      console.log('Filtered projects:', filtered, 'Query:', searchQuery);
      setFilteredProjects(filtered);
      setShowDropdown(filtered.length > 0 && searchQuery.length > 2 && !form.projectId);
    } else {
      setFilteredProjects([]);
      setShowDropdown(false);
    }
  }, [searchQuery, allProjects, form.projectId]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        projectInputRef.current &&
        !projectInputRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  // Handle project selection (used for both dropdown and modal)
  const handleProjectChange = (project) => {
    console.log('Selected project:', project);
    setForm((prev) => ({
      ...prev,
      projectId: project.id,
      projectName: project.project_name,
      customer_id: project.customer_id || project.id,
      customer_name: project.customer_name || project.customer?.name || '',
      address: project.work_place || project.location || '',
      mobile_number: project.mobile_number || project.customer?.mobile || '',
      project_type: project.project_type || '', // Set project_type
      customer: {
        name: project.customer_name || project.customer?.name || '',
        address: project.work_place || project.location || '',
        mobile: project.mobile_number || project.customer?.mobile || '',
      },
    }));
    setSearchQuery(project.project_name);
    setIsModalSelection(true);
    setShowDropdown(false);
    setAllProjects([]);
    setFilteredProjects([]);
  };

  const clearProject = () => {
    setForm((prev) => ({
      ...prev,
      projectId: null,
      projectName: '',
      customer_id: null,
      customer_name: '',
      address: '',
      mobile_number: '',
      project_type: '', // Clear project_type
      customer: { name: '', address: '', mobile: '' },
    }));
    setSearchQuery('');
    setShowDropdown(false);
    setAllProjects([]);
    setFilteredProjects([]);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      let newForm = {
        ...prev,
        [name]: name === 'discount' || name === 'paidAmount' || name.endsWith('Percentage') ? parseFloat(value) || 0 : value,
      };

      if (name === 'gstPercentage') {
        const totalGST = parseFloat(value) || 0;
        const halfGST = totalGST / 2;
        newForm = {
          ...newForm,
          sgstPercentage: halfGST,
          cgstPercentage: halfGST,
        };
      } else if (name === 'sgstPercentage' || name === 'cgstPercentage') {
        const sgst = name === 'sgstPercentage' ? parseFloat(value) || 0 : prev.sgstPercentage;
        const cgst = name === 'cgstPercentage' ? parseFloat(value) || 0 : prev.cgstPercentage;
        newForm = {
          ...newForm,
          gstPercentage: sgst + cgst,
        };
      }

      if (name === 'discount' || name.endsWith('Percentage')) {
        const subtotal = works.reduce((sum, w) => sum + (w.total_price || 0), 0);
        const base = subtotal - newForm.discount;
        const sgstAmount = base * (newForm.sgstPercentage / 100);
        const cgstAmount = base * (newForm.cgstPercentage / 100);
        const igstAmount = base * (newForm.igstPercentage / 100);
        const gstAmount = sgstAmount + cgstAmount + igstAmount;
        const finalAmount = base + gstAmount;
        newForm = {
          ...newForm,
          subtotal,
          taxableAmount: base,
          gstAmount,
          sgstAmount,
          cgstAmount,
          igstAmount,
          finalAmount,
        };
      }

      return newForm;
    });
  };






const handleWorkChange = (index, field, value) => {
  const updated = [...works];
  const item = updated[index];
  const isWorkOrder = item.isWorkOrder === true;
  const alreadyBilled = item.alreadyBilledQty || 0;



//   if (field === 'qty') {
//   const updated = [...works];

//   // Always allow any typing (including empty)
//   updated[index].qtyDisplay = value;

//   // Parse for calculation (treat empty as null / no value yet)
//   let newQty = null;
//   if (value.trim() !== '') {
//     const parsed = parseFloat(value);
//     newQty = isNaN(parsed) ? null : parsed;
//   }

//   updated[index].qty = newQty;

//   // Live calculation (use 0 if still invalid/empty)
//   const qtyForCalc = newQty ?? 0;
//   const price = updated[index].price || 0;
//   const gstPercent = updated[index].gst_percent ?? 0;

//   const baseAmount = qtyForCalc * price;
//   const halfGST = gstPercent / 2;

//   updated[index].cgst_amount = baseAmount * (halfGST / 100);
//   updated[index].sgst_amount = baseAmount * (halfGST / 100);
//   updated[index].total_price = baseAmount + updated[index].cgst_amount + updated[index].sgst_amount;

//   setWorks(updated);
//   calculateTotals(updated);
// }

if (field === 'qty') {
  const updated = [...works];
  // const value = e.target.value;   // already passed as value

  // Allow empty string (user deleting) or valid number including 0
  updated[index].qtyDisplay = value;

  let newQty = null;
  if (value.trim() !== '') {
    const parsed = parseFloat(value);
    newQty = isNaN(parsed) ? 0 : parsed;
  }

  updated[index].qty = newQty ?? 0;   // treat empty as 0 for calculation

  // Recalculate row totals
  const qtyForCalc = updated[index].qty || 0;
  const price = updated[index].price || 0;
  const gstPercent = updated[index].gst_percent ?? 0;

  const baseAmount = qtyForCalc * price;
  const halfGST = gstPercent / 2;

  updated[index].cgst_amount = baseAmount * (halfGST / 100);
  updated[index].sgst_amount = baseAmount * (halfGST / 100);
  updated[index].total_price = baseAmount + updated[index].cgst_amount + updated[index].sgst_amount;

  setWorks(updated);
  calculateTotals(updated);
  return;   // Important: return early
}


  else if (field === 'price') {
    updated[index].price = value === "" ? 0 : parseFloat(value) || 0;
  }
  else if (field === 'gst_percent') {
    updated[index].gst_percent =
      value === "" || value === null || value === undefined
        ? 0
        : parseFloat(value) || 0;
  }
  else {
    updated[index][field] = value;
  }

  // For calculations: treat empty qty as 0
  const qtyForCalc = typeof updated[index].qty === 'string' ? 0 : (updated[index].qty || 0);
  const price = updated[index].price || 0;
  const gstPercent = updated[index].gst_percent ?? 0;

  const baseAmount = qtyForCalc * price;
  const halfGST = gstPercent / 2;

  const cgst = baseAmount * (halfGST / 100);
  const sgst = baseAmount * (halfGST / 100);

  updated[index].cgst_amount = cgst;
  updated[index].sgst_amount = sgst;
  updated[index].total_price = baseAmount + cgst + sgst;

  setWorks(updated);
  calculateTotals(updated);
};





// const invalidRows = works.filter(w => 
//   w.isWorkOrder && 
//   w.alreadyBilledQty > 0 && 
//   (w.qty ?? 0) < w.alreadyBilledQty
// );

// if (invalidRows.length > 0) {
//   showToast('danger', `Cannot submit: ${invalidRows.length} item(s) have quantity below already billed amount`);
//   return;
// }







const addWorkRow = () => {
  setWorks([
    ...works,
    {
      work_type: '',
      uom: '',
      qty: 0,
      price: 0,
      total_price: 0,
      gst_percent: 18,
      cgst_amount: 9,
      sgst_amount: 9,
      remark: '',
      alreadyBilledQty: 0,     // ← no billed qty
      isWorkOrder: false,      // ← no restrictions
      sub_descriptions: [],
    },
  ]);
  setNewSubDescs([...newSubDescs, '']);
};



  const removeWorkRow = (index) => {
    const updated = [...works];
    updated.splice(index, 1);
    setWorks(updated);
    calculateTotals(updated);

    const updatedNew = [...newSubDescs];
    updatedNew.splice(index, 1);
    setNewSubDescs(updatedNew);

    if (editingSubDescWorkIdx === index) {
      setEditingSubDescWorkIdx(-1);
      setEditingSubDescIdx(-1);
    }
  };



const calculateTotals = (currentWorks) => {
  setForm((prev) => {
    // STEP 1: Calculate base subtotal (qty × price, no GST)
    const baseSubtotal = currentWorks.reduce((sum, w) => sum + (w.qty * w.price), 0);
    
    // STEP 2: Calculate row-level GST totals
    const rowCGST = currentWorks.reduce((sum, w) => sum + (w.cgst_amount || 0), 0);
    const rowSGST = currentWorks.reduce((sum, w) => sum + (w.sgst_amount || 0), 0);
    const rowTotalGST = rowCGST + rowSGST;
    
    // STEP 3: Total after row-level GST (this is the final amount)
    const totalAfterRowGST = currentWorks.reduce((sum, w) => sum + (w.total_price || 0), 0);
    
    // STEP 4: Apply discount
    const finalAmount = totalAfterRowGST - (prev.discount || 0);
    
    return {
      ...prev,
      subtotal: baseSubtotal,           // Original base without any GST
      taxableAmount: totalAfterRowGST,  // After row GST
      
      // Global GST fields all stay at 0
      gstAmount: 0,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: 0,
      
      finalAmount: finalAmount,
    };
  });
};






  const submitInvoice = async (e) => {
    e.preventDefault();
    const formElement = e.currentTarget;
    if (!formElement.checkValidity()) {
      setValidated(true);
      return;
    }
    if (!form.projectId || !form.customer_id) {
      showToast('danger', 'Please select a project with a valid customer');
      return;
    }

    const invalidRows = works.filter(w => 
  w.isWorkOrder && 
  w.alreadyBilledQty > 0 && 
  (w.qty ?? 0) < w.alreadyBilledQty
);

if (invalidRows.length > 0) {
  showToast('danger', `Cannot submit: ${invalidRows.length} item(s) have quantity below already billed amount`);
  return;
}


    // if (works.length === 0 || works.every((w) => !w.work_type || w.qty <= 0)) {
    //   showToast('danger', 'Please add at least one valid work item');
    //   return;
    // }

    try {
      setLoading(true);
      // const data = {
      //   ...form,
      //   project_id: form.projectId,
      //   customer_name: form.customer_name,
      //   address: form.address,
      //   mobile_number: form.mobile_number,
      //   items: works.filter((w) => w.work_type && w.qty > 0).map(w => ({
      //     ...w,
      //     work_sub_description: w.sub_descriptions.join('\n'),
      //   })),
      //   payment_terms: paymentTerms.join('\n'),
      //   terms_and_conditions: termsAndConditions.join('\n'),
      //   note: note,
      // };

      const data = {
  ...form,
  project_id: form.projectId,
  customer_id: form.customer_id,
  address: form.address,
  mobile_number: form.mobile_number,
  // items: works.filter((w) => w.work_type && w.qty > 0).map(w => ({
  //   ...w,
  //   work_sub_description: w.sub_descriptions.join('\n'),
  // })),

  items: works
  .filter((w) => w.work_type && w.work_type.trim() !== '')   // Only require work_type
  .map(w => ({
    ...w,
    work_sub_description: w.sub_descriptions.join('\n'),
  })),


  payment_terms: paymentTerms.join('\n'),
  terms_and_conditions: termsAndConditions.join('\n'),
  note: note,
  po_number: form.invoiceType === 2 ? '' : form.po_number,   // Let backend generate if Work Order
};
      console.log('Submitting data:', data);

      if (editMode && onSubmit) {
        await onSubmit(data);
      } else {
        const resp = await post('/api/order', data);
        if (resp) {
          showToast('success', 'Invoice created successfully');
          navigate(`/invoice-details/${resp.id}`);
        }
      }
    } catch (error) {
      console.error('Submit error:', error);
      showToast('danger', 'Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleNewProjectChange = (e) => {
    const { name, value } = e.target;
    setNewProjectForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  
const saveNewProject = async () => {
  // Trigger validation
  setValidatedProjectForm(true);

  // Check all required fields
  if (
    !newProjectForm.customer_name ||
    !newProjectForm.mobile_number ||
    newProjectForm.mobile_number.length !== 10 ||
    !/^[0-9]{10}$/.test(newProjectForm.mobile_number) ||
    !newProjectForm.project_name ||
    !newProjectForm.work_place ||
    !newProjectForm.project_type_id
  ) {
    showToast('danger', 'Please fill all required fields correctly');
    return;
  }

  try {
    const resp = await post('/api/projects', newProjectForm);
    if (resp) {
      showToast('success', 'Project added successfully');
      setShowAddProjectModal(false);
      // Reset form
      setNewProjectForm({
        customer_name: '',
        mobile_number: '',
        project_name: '',
        work_place: '',
        project_type_id: '',
        gst_number: '',
        pan_number: '',
        // is_confirm: 0,
      });
      setValidatedProjectForm(false); // Reset validation state
      fetchProjects(); // Refresh project list
    }
  } catch (error) {
    console.error('Error adding project:', error);
    showToast('danger', 'Failed to add project');
  }
};



  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>{editMode ? 'Edit Invoice' : 'Create Invoice'}</strong>
          </CCardHeader>
          <CCardBody>
            <CForm validated={validated} onSubmit={submitInvoice}>
              {/* Project Selection */}
              <CRow className="mb-3">
                <CCol md={6}>
                  <CFormLabel>Project Name *</CFormLabel>
                  <div ref={projectInputRef} style={{ position: 'relative' }}>
                    <CInputGroup>
                      <CFormInput
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          if (!form.projectId) {
                            setShowDropdown(e.target.value.length > 2);
                          } else {
                            setShowDropdown(false);
                          }
                        }}
                        placeholder="Search by project name, customer, location..."
                        required
                      />
                      <CInputGroupText
                        className="cursor-pointer"
                        onClick={() => {
                          if (form.projectName || searchQuery) {
                            clearProject();
                          } else {
                            setShowProjectModal(true);
                          }
                        }}
                      >
                        <CIcon icon={form.projectName || searchQuery ? cilX : cilSearch} />
                      </CInputGroupText>
                    </CInputGroup>

                    {projectsLoading && showDropdown && searchQuery.length > 2 && (
                      <div className="dropdown-menu show p-2">
                        <CSpinner size="sm" /> Loading projects...
                      </div>
                    )}

                    {showDropdown && filteredProjects.length > 0 && !form.projectId && (
                      <div ref={dropdownRef} className="dropdown-menu show" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {filteredProjects.map((project) => (
                          <div
                            key={project.id}
                            className="dropdown-item cursor-pointer p-2 border-bottom"
                            onClick={() => handleProjectChange(project)}
                            onMouseEnter={(e) => (e.target.style.backgroundColor = '#f8f9fa')}
                            onMouseLeave={(e) => (e.target.style.backgroundColor = 'white')}
                          >
                            <div className="fw-medium text-primary">{project.project_name}</div>
                            <div className="small text-muted">
                              <strong>Customer:</strong> {project.customer_name}
                            </div>
                            {project.project_type && (
                              <div className="small text-muted">
                                <strong>Type:</strong> {project.project_type}
                              </div>
                            )}
                            {project.work_place && (
                              <div className="small text-muted">
                                <strong>Location:</strong> {project.work_place}
                              </div>
                            )}
                            {project.project_cost && (
                              <div className="small text-success">
                                <strong>Amount:</strong> ₹{project.project_cost}
                              </div>
                            )}
                            {project.mobile_number && (
                              <div className="small text-muted">
                                <strong>Mobile:</strong> {project.mobile_number}
                              </div>
                            )}
                          </div>
                        ))}
                        {!form.projectId && (
                          <div
                            className="dropdown-item cursor-pointer p-2 border-top text-primary"
                            onClick={() => setShowAddProjectModal(true)}
                          >
                            <CIcon icon={cilPlus} className="me-2" />
                            Add New Project
                          </div>
                        )}
                      </div>
                    )}

                    {searchQuery.length > 2 && filteredProjects.length === 0 && !projectsLoading && !form.projectId && (
                      <div className="dropdown-menu show" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        <div
                          className="dropdown-item cursor-pointer p-2 border-top text-primary"
                          onClick={() => setShowAddProjectModal(true)}
                        >
                          <CIcon icon={cilPlus} className="me-2" />
                          Add New Project
                        </div>
                      </div>
                    )}
                  </div>

                  {form.projectName && (
                    <div className="mt-1 p-2 bg-light rounded border">
                      <div className="small text-success">
                        <strong>Selected:</strong> {form.projectName}
                      </div>
                      <div className="small text-muted">
                        <strong>Customer:</strong> {form.customer.name}
                      </div>
                      {form.projectName && allProjects.find(p => p.id === form.projectId)?.project_type && (
                         <div className="small text-muted">
                           <strong>Type:</strong> {allProjects.find(p => p.id === form.projectId)?.project_type}
                         </div>
                      )}
                      {form.customer.address && (
                        <div className="small text-muted">
                          <strong>Location:</strong> {form.customer.address}
                        </div>
                      )}
                    </div>
                  )}
                </CCol>

                <CCol md={6}>
                  <CFormLabel>Invoice Date *</CFormLabel>
                  <CFormInput
                    type="date"
                    name="invoiceDate"
                    value={form.invoiceDate}
                    onChange={handleFormChange}
                    required
                  />
                </CCol>
              </CRow>

              <CRow className="mb-3">
                <CCol md={4}>
                  <CFormLabel>Delivery Date *</CFormLabel>
                  <CFormInput
                    type="date"
                    name="deliveryDate"
                    value={form.deliveryDate}
                    onChange={handleFormChange}
                    required
                  />
                </CCol>
                <CCol md={4}>
                  <CFormLabel>Reference ID</CFormLabel>
                  <CFormInput
                    type="text"
                    name="ref_id"
                    value={form.ref_id}
                    onChange={handleFormChange}
                    placeholder="Enter Reference ID"
                  />
                </CCol>

                {/* <CCol md={4}>
                  <CFormLabel>Po Number</CFormLabel>
                  <CFormInput
                    type="text"
                    name="po_number"
                    value={form.po_number}
                    onChange={handleFormChange}
                    placeholder="Enter PO Number"
                  />
                </CCol> */}
              </CRow>

              <CRow className="mb-3">
                <CCol md={3}>
                  <CFormLabel>Customer Name</CFormLabel>
                  <CFormInput value={form.customer.name} readOnly placeholder="Select a project to populate" />
                </CCol>
                <CCol md={3}>
                  <CFormLabel>Work Location</CFormLabel>
                  <CFormInput value={form.customer.address} readOnly placeholder="Select a project to populate" />
                </CCol>
                <CCol md={3}>
                  <CFormLabel>Customer Mobile</CFormLabel>
                  <CFormInput value={form.customer.mobile} readOnly placeholder="Select a project to populate" />
                </CCol>
                <CCol md={3}>
                  <CFormLabel>Project Type</CFormLabel>
                  <CFormInput value={form.project_type} readOnly placeholder="Select a project to populate" />
                </CCol>
              </CRow>

              <CRow className="mb-3">
                <CCol md={6}>
                  <CFormLabel>Invoice Type *</CFormLabel>
                  <CFormSelect name="invoiceType" value={form.invoiceType} onChange={handleFormChange} required>
                    <option value={1}>Quotation</option>
                    <option value={2}>Work Order</option>
                  </CFormSelect>
                </CCol>
              </CRow>






<h6 className="mt-4 mb-3 fw-semibold text-primary border-bottom border-primary pb-2">
  Work Details
</h6>

{works.map((w, idx) => {
  const isWorkOrder = w.isWorkOrder === true;
  const alreadyBilled = w.alreadyBilledQty || 0;

  return (
    <div key={idx} className="border rounded p-3 mb-3 bg-light">
      <CRow className="g-3 mb-2 align-items-end">
        <CCol md={6}>
          <CFormInput
            label="Work Type *"
            placeholder="Work Type"
            value={w.work_type}
            onChange={(e) => handleWorkChange(idx, 'work_type', e.target.value)}
            required
          />
        </CCol>

       
      {/* </CRow> */}

      {/* <CRow className="mb-3"> */}
        <CCol md={6}>
          <CFormLabel>Sub Descriptions</CFormLabel>

          <CInputGroup>
            <CFormInput
              placeholder="Add sub description..."
              value={newSubDescs[idx]}
              onChange={(e) => {
                const updatedNew = [...newSubDescs];
                updatedNew[idx] = e.target.value;
                setNewSubDescs(updatedNew);
              }}
            />
            <CButton
              color="primary"
              onClick={() => {
                if (newSubDescs[idx].trim()) {
                  const updatedWorks = [...works];
                  updatedWorks[idx].sub_descriptions.push(newSubDescs[idx].trim());
                  setWorks(updatedWorks);
                  const updatedNew = [...newSubDescs];
                  updatedNew[idx] = '';
                  setNewSubDescs(updatedNew);
                }
              }}
            >
              Add
            </CButton>
          </CInputGroup>
        </CCol>




                {/* <div className="d-flex flex-wrap gap-2 mb-3">
 {w.sub_descriptions.map((desc, subIdx) => {
  const isEditing = editingSubDescWorkIdx === idx && editingSubDescIdx === subIdx;

  if (isEditing) {
    return (
      <CInputGroup 
        key={subIdx} 
        size="sm" 
        className="align-items-center" 
        style={{ width: 'auto', minWidth: '280px' }}
      >
        <CFormInput
          value={editingSubDescValue}
          onChange={(e) => setEditingSubDescValue(e.target.value)}
          size="sm"
          autoFocus
        />
        <CButton
          color="success"
          size="sm"
          onClick={() => {
            if (editingSubDescValue.trim() === '') {
              showToast('warning', 'Sub-description cannot be empty');
              return;
            }
            const updatedWorks = [...works];
            updatedWorks[idx].sub_descriptions[subIdx] = editingSubDescValue.trim();
            setWorks(updatedWorks);
            setEditingSubDescWorkIdx(-1);
            setEditingSubDescIdx(-1);
            setEditingSubDescValue('');
          }}
        >
          Save
        </CButton>
        <CButton
          color="secondary"
          size="sm"
          onClick={() => {
            setEditingSubDescWorkIdx(-1);
            setEditingSubDescIdx(-1);
            setEditingSubDescValue('');
          }}
        >
          Cancel
        </CButton>
      </CInputGroup>
    );
  }

  return (
    <CBadge
      key={subIdx}
      color="light"
      textColor="dark"
      // shape="rounded-pill"
 className="px-3 py-2 d-flex align-items-center gap-2 border border-secondary-subtle"
      style={{ 
  fontSize: '0.9rem',
  whiteSpace: 'normal',
  maxWidth: '100%',
  display: 'inline-block',
  wordBreak: 'break-word',
  textAlign: 'left',
  lineHeight: '1.5',
}}
    >
      {desc}
      <CIcon
        icon={cilPencil}
        size="xl"
        style={{ fontSize: '1.35rem' }}
        className="cursor-pointer text-primary"
        onClick={() => {
          setEditingSubDescWorkIdx(idx);
          setEditingSubDescIdx(subIdx);
          setEditingSubDescValue(desc);
        }}
      />
      <CIcon
        icon={cilX}
        size="xl"
        className="cursor-pointer text-danger"
        onClick={() => {
          const updated = [...works];
          updated[idx].sub_descriptions.splice(subIdx, 1);
          setWorks(updated);
        }}
      />
    </CBadge>
  );
})}
</div> */}




{/* FIXED Sub Descriptions Badges - Icons always visible & proper size */}
<div className="d-flex flex-wrap gap-2 mb-3">
  {(w.sub_descriptions || []).map((desc, subIdx) => {
    const isEditing = editingSubDescWorkIdx === idx && editingSubDescIdx === subIdx;

    if (isEditing) {
      return (
        <CInputGroup key={subIdx} size="sm" className="align-items-center" style={{ width: 'auto', minWidth: '320px' }}>
          <CFormInput
            value={editingSubDescValue}
            onChange={(e) => setEditingSubDescValue(e.target.value)}
            autoFocus
          />
          <CButton
          color="success"
          size="sm"
          onClick={() => {
            if (editingSubDescValue.trim() === '') {
              showToast('warning', 'Sub-description cannot be empty');
              return;
            }
            const updatedWorks = [...works];
            updatedWorks[idx].sub_descriptions[subIdx] = editingSubDescValue.trim();
            setWorks(updatedWorks);
            setEditingSubDescWorkIdx(-1);
            setEditingSubDescIdx(-1);
            setEditingSubDescValue('');
          }}
        >
          Save
        </CButton>
        <CButton
          color="secondary"
          size="sm"
          onClick={() => {
            setEditingSubDescWorkIdx(-1);
            setEditingSubDescIdx(-1);
            setEditingSubDescValue('');
          }}
        >
          Cancel
        </CButton>
        </CInputGroup>
      );
    }

    return (
      <div
        key={subIdx}
        className="d-flex align-items-start gap-2 border border-secondary-subtle rounded px-3 py-2"
        style={{
          backgroundColor: '#f1f3f5',
          maxWidth: '100%',
          minWidth: '150px',
          fontSize: '0.95rem',
          fontWeight: 500,
          lineHeight: '1.5',
          wordBreak: 'break-word',
        }}
      >
        {/* Text Part - Takes all available space */}
        <div style={{ flex: 1, paddingTop: '3px' }}>
          {desc}
        </div>

        {/* Icons Container - Fixed size, never shrinks */}
        <div className="d-flex align-items-center gap-1 flex-shrink-0 pt-1">
          <CIcon
            icon={cilPencil}
            size="xl"
            className="cursor-pointer text-primary"
            style={{ fontSize: '1.45rem' }}   // ← Clear & Big size
            onClick={() => {
              setEditingSubDescWorkIdx(idx);
              setEditingSubDescIdx(subIdx);
              setEditingSubDescValue(desc);
            }}
          />
          <CIcon
            icon={cilX}
            size="lg"
            className="cursor-pointer text-danger"
            style={{ fontSize: '1.25rem' }}
            onClick={() => {
              const updated = [...works];
              updated[idx].sub_descriptions.splice(subIdx, 1);
              setWorks(updated);
            }}
          />
        </div>
      </div>
    );
  })}
</div>





      </CRow>

      <CRow className="g-3 mb-2 align-items-end">
        <CCol md={3}>
          <CFormInput
            label="UOM"
            placeholder="Unit"
            value={w.uom}
            onChange={(e) => handleWorkChange(idx, 'uom', e.target.value)}
          />
        </CCol>

        <CCol md={3}>
          <CFormLabel>
            Qty *
            {isWorkOrder && alreadyBilled > 0 && (
              <small className="text-danger d-block mt-1">
                Already billed: {alreadyBilled.toFixed(2)}
              </small>
            )}
          </CFormLabel>
          {/* <CFormInput
            type="number"
            step="0.01"
            min="0"
            value={w.qty === '' ? '' : w.qty}
            onChange={(e) => handleWorkChange(idx, 'qty', e.target.value)}
            required
          /> */}

{/* <CFormInput
  type="number"
  step="0.01"
  value={w.qtyDisplay ?? ''}                    // ← use string version
  onChange={(e) => handleWorkChange(idx, 'qty', e.target.value)}
  onBlur={() => {
    if (!w.isWorkOrder || w.alreadyBilledQty <= 0) return;

    const currentQty = w.qty ?? 0;
    if (currentQty < w.alreadyBilledQty) {
      showToast(
        'danger',
        `Quantity cannot be less than already billed (${w.alreadyBilledQty.toFixed(2)})`
      );
     
    }
  }}
  required
/> */}

<CFormInput
  type="text"   // ⚠️ use text, not number (number allows invalid typing)
  value={w.qtyDisplay ?? ''}
  onChange={(e) => {
    const value = e.target.value;

    // ✅ Allow only numbers with max 2 decimal places
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      handleWorkChange(idx, 'qty', value);
    }
  }}
  onBlur={() => {
    if (!w.isWorkOrder || w.alreadyBilledQty <= 0) return;

    const currentQty = parseFloat(w.qty ?? 0);
    if (currentQty < w.alreadyBilledQty) {
      showToast(
        'danger',
        `Quantity cannot be less than already billed (${w.alreadyBilledQty.toFixed(2)})`
      );
    }
  }}
  required
/>




        </CCol>

        <CCol md={3}>
          <CFormLabel>
            Rate 
            {w.isWorkOrder && w.alreadyBilledQty > 0 && (
              <small className="text-danger d-block mt-1">
                Price locked (already billed)
              </small>
            )}
          </CFormLabel>
          <CInputGroup>
            <CInputGroupText>₹</CInputGroupText>
            <CFormInput
              type="number"
              step="0.01"
              min="0"
              value={w.price}
              onChange={(e) => handleWorkChange(idx, 'price', e.target.value)}
              required
              readOnly={w.isWorkOrder && w.alreadyBilledQty > 0}
              disabled={w.isWorkOrder && w.alreadyBilledQty > 0}
            />
          </CInputGroup>
        </CCol>

        <CCol md={3}>
          <CFormLabel>Base Amount</CFormLabel>
          <div className="fw-medium pt-2">
            ₹{((w.qty || 0) * (w.price || 0)).toFixed(2)}
          </div>
        </CCol>
      </CRow>

      <CRow className="g-3 align-items-end">
        <CCol md={3}>
          <CFormInput
            label="GST %"
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={w.gst_percent}
            onChange={(e) => handleWorkChange(idx, 'gst_percent', e.target.value)}
          />
        </CCol>

        <CCol md={3}>
          <CFormLabel>CGST</CFormLabel>
          <div className="text-success fw-medium">
            ₹{Number(w.cgst_amount || 0).toFixed(2)}
          </div>
        </CCol>

        <CCol md={3}>
          <CFormLabel>SGST</CFormLabel>
          <div className="text-success fw-medium">
            ₹{Number(w.sgst_amount || 0).toFixed(2)}
          </div>
        </CCol>

        <CCol md={3}>
          <CFormLabel className="text-primary">Total (with GST)</CFormLabel>
          <div className="fw-bold text-primary">
            ₹{(w.total_price || 0).toFixed(2)}
          </div>
        </CCol>

        
      </CRow>


       <CRow className="g-3 mt-2 align-items-end">

        <CCol md={9}>
          <CFormLabel>Remark</CFormLabel>
          <CFormInput
            // label="Remark"
            placeholder="Remark"
            value={w.remark}
            onChange={(e) => handleWorkChange(idx, 'remark', e.target.value)}
          />
        </CCol>


 <CCol md={3} className="d-flex align-items-end">
          <CButton
            color="danger"
            size="md"
        
            className='mt-2 ps-40 pe-40'
            onClick={() => removeWorkRow(idx)}
            disabled={works.length === 1}
          >
            ✖ Remove This Work Order
          </CButton>
        </CCol>

        </CRow>

    </div>
  );
})}

<CButton
  color="warning"
  variant="outline"
  className="mb-4"
  onClick={addWorkRow}
>
  + Add Work
</CButton>











              

<div className="alert alert-info border-0 bg-info-subtle mb-3">
  <div className="d-flex">
    <div>
      <strong className="text-info">Auto-Calculation:</strong>
      <ul className="mb-0 mt-1 text-info">
        <li>
          <small>Enter GST % to work row for auto-split into CGST and SGST</small>
        </li>
        {/* <li>
          <small>Modify CGST or SGST to auto-update total GST %</small>
        </li> */}
      </ul>
    </div>
  </div>
</div>


<CRow className="mb-3">
  <CCol md={6}>
    <CFormLabel>Final Amount</CFormLabel>
    <CInputGroup>
      <CInputGroupText>₹</CInputGroupText>
      <CFormInput type="number" value={Number(form.finalAmount || 0).toFixed(2)} readOnly />
    </CInputGroup>
  </CCol>
  <CCol md={6}>
    <CFormLabel>Remaining Amount</CFormLabel>
    <CInputGroup>
      <CInputGroupText>₹</CInputGroupText>
      <CFormInput
        type="number"
        value={Number(calculateRemainingAmount() || 0).toFixed(2)}
        readOnly
        className="text-danger fw-medium"
      />
    </CInputGroup>
  </CCol>
</CRow>

              <h6 className="mt-4 mb-3 fw-semibold text-primary border-bottom border-primary pb-2">Payment Terms</h6>
              {/* <div className="d-flex flex-wrap gap-2 mb-3"> */}
              <div className="d-flex flex-wrap gap-2 mb-3" style={{ alignItems: 'flex-start' }}>
                {paymentTerms.map((term, idx) => {
                  if (editingPaymentIndex === idx) {
                    return (
                      <CInputGroup key={idx} style={{ width: 'auto' }}>
                        <CFormInput
                          value={editingPaymentValue}
                          onChange={(e) => setEditingPaymentValue(e.target.value)}
                        />
                        <CButton
                          color="success"
                          onClick={() => {
                            const newTerms = [...paymentTerms];
                            newTerms[idx] = editingPaymentValue;
                            setPaymentTerms(newTerms);
                            setEditingPaymentIndex(-1);
                          }}
                        >
                          Save
                        </CButton>
                        <CButton color="secondary" onClick={() => setEditingPaymentIndex(-1)}>
                          Cancel
                        </CButton>
                      </CInputGroup>
                    );
                  } else {
                    return (
                      // <CBadge color="info" key={idx} className="me-1 mb-1" style={{ fontSize: '0.9em' }}>
                      <CBadge color="info" key={idx} className="me-1 mb-1" style={{ 
  fontSize: '0.9em', 
  whiteSpace: 'normal', 
  maxWidth: '100%',
  display: 'inline-block',
  wordBreak: 'break-word',
  textAlign: 'left',
  lineHeight: '1.5',
  padding: '6px 10px'
}}>
                        {term}
                        <CIcon
                          icon={cilPencil}
                          className="ms-2"
                          style={{ cursor: 'pointer' }}
                          onClick={() => {
                            setEditingPaymentIndex(idx);
                            setEditingPaymentValue(term);
                          }}
                        />
                        <CIcon
                          icon={cilX}
                          className="ms-1"
                          style={{ cursor: 'pointer' }}
                          onClick={() => {
                            setPaymentTerms(paymentTerms.filter((_, i) => i !== idx));
                          }}
                        />
                      </CBadge>
                    );
                  }
                })}
              </div>
              <CRow className="mb-3">
                <CCol md={6}>
                  <CInputGroup>
                    <CFormInput
                      placeholder="Add new payment term..."
                      value={newPaymentTerm}
                      onChange={(e) => setNewPaymentTerm(e.target.value)}
                    />
                    <CButton
                      color="primary"
                      onClick={() => {
                        if (newPaymentTerm.trim()) {
                          setPaymentTerms([...paymentTerms, newPaymentTerm.trim()]);
                          setNewPaymentTerm('');
                        }
                      }}
                    >
                      Add
                    </CButton>
                  </CInputGroup>
                </CCol>
              </CRow>

              <h6 className="mt-4 mb-3 fw-semibold text-primary border-bottom border-primary pb-2">Terms & Conditions</h6>
              <div className="d-flex flex-wrap gap-2 mb-3">
                {termsAndConditions.map((term, idx) => {
                  if (editingConditionIndex === idx) {
                    return (
                      <CInputGroup key={idx} style={{ width: 'auto' }}>
                        <CFormInput
                          value={editingConditionValue}
                          onChange={(e) => setEditingConditionValue(e.target.value)}
                        />
                        <CButton
                          color="success"
                          onClick={() => {
                            const newConditions = [...termsAndConditions];
                            newConditions[idx] = editingConditionValue;
                            setTermsAndConditions(newConditions);
                            setEditingConditionIndex(-1);
                          }}
                        >
                          Save
                        </CButton>
                        <CButton color="secondary" onClick={() => setEditingConditionIndex(-1)}>
                          Cancel
                        </CButton>
                      </CInputGroup>
                    );
                  } else {
                    return (
                      // <CBadge color="warning" key={idx} className="me-1 mb-1" style={{ fontSize: '0.9em' }}>

                      <CBadge color="warning" key={idx} className="me-1 mb-1" style={{ 
  fontSize: '0.9em', 
  whiteSpace: 'normal', 
  maxWidth: '100%',
  display: 'inline-block',
  wordBreak: 'break-word',
  textAlign: 'left',
  lineHeight: '1.5',
  padding: '6px 10px'
}}>
                        {term}
                        <CIcon
                          icon={cilPencil}
                          className="ms-2"
                          style={{ cursor: 'pointer' }}
                          onClick={() => {
                            setEditingConditionIndex(idx);
                            setEditingConditionValue(term);
                          }}
                        />
                        <CIcon
                          icon={cilX}
                          className="ms-1"
                          style={{ cursor: 'pointer' }}
                          onClick={() => {
                            setTermsAndConditions(termsAndConditions.filter((_, i) => i !== idx));
                          }}
                        />
                      </CBadge>
                    );
                  }
                })}
              </div>
              <CRow className="mb-3">
                <CCol md={6}>
                  <CInputGroup>
                    <CFormInput
                      placeholder="Add new condition..."
                      value={newCondition}
                      onChange={(e) => setNewCondition(e.target.value)}
                    />
                    <CButton
                      color="primary"
                      onClick={() => {
                        if (newCondition.trim()) {
                          setTermsAndConditions([...termsAndConditions, newCondition.trim()]);
                          setNewCondition('');
                        }
                      }}
                    >
                      Add
                    </CButton>
                  </CInputGroup>
                </CCol>
              </CRow>

              <h6 className="mt-4 mb-2 fw-semibold text-primary border-bottom border-primary pb-2">Additional Note</h6>
              <CFormTextarea
                type="text"
                className="mb-3"
                placeholder="Enter note if any..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />

              <CButton
                color="primary"
                type="submit"
                disabled={loading || !form.projectId || !form.customer_id || projectsLoading}
              >
                {loading ? <CSpinner size="sm" /> : editMode ? 'Update Invoice' : 'Submit Invoice'}
              </CButton>
              &nbsp;&nbsp;
              {editMode && (
                <CButton color="secondary" type="button" onClick={() => navigate('/invoiceTable')}>
                  Close
                </CButton>
              )}
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>

      
      <CModal visible={showAddProjectModal} onClose={() => setShowAddProjectModal(false)}>
  <CModalHeader>
    <CModalTitle>Add New Project</CModalTitle>
  </CModalHeader>
  <CModalBody>
    <CForm>
      <CRow className="mb-3">
        <CCol md={6}>
          <CFormLabel>Customer Name <span className="text-danger">*</span></CFormLabel>
          <CFormInput
            type="text"
            name="customer_name"
            value={newProjectForm.customer_name}
            onChange={handleNewProjectChange}
            required
            placeholder="Enter customer name"
            invalid={!newProjectForm.customer_name && validatedProjectForm}
          />
        </CCol>

        <CCol md={6}>
          <CFormLabel>Mobile Number <span className="text-danger">*</span></CFormLabel>
          <CFormInput
            type="text"
            name="mobile_number"
            value={newProjectForm.mobile_number}
            onChange={handleNewProjectChange}
            required
            maxLength={10}
            minLength={10}
            pattern="^[0-9]{10}$"
            placeholder="Enter 10-digit mobile number"
            invalid={!newProjectForm.mobile_number && validatedProjectForm}
          />
        </CCol>
      </CRow>

      <CRow className="mb-3">
        <CCol md={6}>
          <CFormLabel>Project Name <span className="text-danger">*</span></CFormLabel>
          <CFormInput
            type="text"
            name="project_name"
            value={newProjectForm.project_name}
            onChange={handleNewProjectChange}
            required
            placeholder="Enter project name"
            invalid={!newProjectForm.project_name && validatedProjectForm}
          />
        </CCol>

        <CCol md={6}>
          <CFormLabel>Work Place <span className="text-danger">*</span></CFormLabel>
          <CFormInput
            type="text"
            name="work_place"
            value={newProjectForm.work_place}
            onChange={handleNewProjectChange}
            required
            placeholder="Enter work location / site address"
            invalid={!newProjectForm.work_place && validatedProjectForm}
          />
        </CCol>
      </CRow>

      <CRow className="mb-3">
        <CCol md={6}>
          <CFormLabel>Project Type <span className="text-danger">*</span></CFormLabel>
          <CFormSelect
            name="project_type_id"
            value={newProjectForm.project_type_id}
            onChange={handleNewProjectChange}
            required
            invalid={!newProjectForm.project_type_id && validatedProjectForm}
          >
            <option value="">Select Project Type</option>
            {projectTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </CFormSelect>
        </CCol>

        {/* Optional GST & PAN (kept as they were) */}
        <CCol md={6}>
          <CFormLabel>GST number</CFormLabel>
          <CFormInput
            type="text"
            name="gst_number"
            value={newProjectForm.gst_number || ''}
            onChange={(e) => {
              const value = e.target.value.toUpperCase();
              if (/^[A-Z0-9]{0,15}$/.test(value)) {
                handleNewProjectChange({ target: { name: "gst_number", value } });
              }
            }}
            maxLength={15}
            placeholder="Enter GST number (15 chars)"
          />
        </CCol>
      </CRow>

      {/* PAN field remains optional */}
      <CRow className="mb-3">
        <CCol md={6}>
          <CFormLabel>Pan Card number</CFormLabel>
          <CFormInput
            type="text"
            name="pan_number"
            value={newProjectForm.pan_number || ''}
            onChange={(e) => {
              const value = e.target.value.toUpperCase();
              if (/^[A-Z0-9]{0,10}$/.test(value)) {
                handleNewProjectChange({ target: { name: "pan_number", value } });
              }
            }}
            maxLength={10}
            placeholder="Enter PAN number (10 chars)"
          />
        </CCol>
      </CRow>
    </CForm>
  </CModalBody>

  <CModalFooter>
    <CButton color="secondary" onClick={() => setShowAddProjectModal(false)}>
      Close
    </CButton>
    <CButton
      color="primary"
      onClick={saveNewProject}
      disabled={
        !newProjectForm.customer_name ||
        !newProjectForm.mobile_number ||
        !newProjectForm.project_name ||
        !newProjectForm.work_place ||
        !newProjectForm.project_type_id
      }
    >
      Save Project
    </CButton>
  </CModalFooter>
</CModal>

      <ProjectSelectionModal
        visible={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        onSelectProject={handleProjectChange}
      />
    </CRow>
  );
};

export default Invoice