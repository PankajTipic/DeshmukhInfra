

// import React, { useState, useEffect } from 'react';
// import {
//   CForm,
//   CRow,
//   CCol,
//   CFormLabel,
//   CFormInput,
//   CButton,
//   CModalFooter,
//   CSpinner,
//   CFormCheck,
// } from '@coreui/react';
// import CIcon from '@coreui/icons-react';
// import { cilSearch, cilX } from '@coreui/icons';
// import CreatableSelect from 'react-select/creatable';   // ← Changed to CreatableSelect
// import { postAPICall, getAPICall } from '../../../util/api';
// import { useToast } from '../../common/toast/ToastContext';
// import ProjectSelectionModal from '../../common/ProjectSelectionModal';

// const PurchaseForm = ({ vendors, onSuccess, onCancel, editData = null }) => {
//   const { showToast } = useToast();
//   const [customerName, setCustomerName] = useState({ name: '', id: null });
//   const [customerSuggestions, setCustomerSuggestions] = useState([]);
//   const [showProjectModal, setShowProjectModal] = useState(false);
//   const [loading, setLoading] = useState(false);

//   // Material dropdown states
//   const [materials, setMaterials] = useState([]); // fetched list [{value, label}]
//   const [selectedMaterial, setSelectedMaterial] = useState(null);

//   const [state, setState] = useState({
//     project_id: '',
//     vendor_id: '',
//     material_name: '',
//     about: '',
//     price_per_unit: 0,
//     qty: 1,
//     total: 0,
//     date: new Date().toISOString().split('T')[0],
//     include_gst: false,
//     gst_percent: 18,
//     cgst_percent: 9,
//     sgst_percent: 9,
//   });

//   // Fetch materials list
//   useEffect(() => {
//     const fetchMaterials = async () => {
//       try {
//         const res = await getAPICall('/api/materialList');
//         const options = (res || []).map(name => ({
//           value: name,
//           label: name,
//         }));
//         setMaterials(options);
//       } catch (err) {
//         console.error('Failed to load materials', err);
//         showToast('danger', 'Could not load material list');
//       }
//     };

//     fetchMaterials();
//   }, []);

//   // Load edit data
//   useEffect(() => {
//     if (editData) {
//       const gstIncluded = editData.gst_included === 1 || editData.gst_percent > 0;
//       const gst = parseFloat(editData.gst_percent) || 18;

//       const materialValue = editData.material_name || '';
//       const materialOption = materials.find(m => m.value === materialValue) || {
//         value: materialValue,
//         label: materialValue,
//       };

//       setState({
//         project_id: editData.project_id || '',
//         vendor_id: editData.vendor_id || '',
//         material_name: materialValue,
//         about: editData.about || '',
//         price_per_unit: parseFloat(editData.price_per_unit) || 0,
//         qty: parseFloat(editData.qty) || 1,
//         total: parseFloat(editData.total) || 0,
//         date: editData.date || new Date().toISOString().split('T')[0],
//         include_gst: gstIncluded,
//         gst_percent: gst,
//         cgst_percent: Number((gst / 2).toFixed(2)),
//         sgst_percent: Number((gst / 2).toFixed(2)),
//       });

//       setSelectedMaterial(materialOption);

//       if (editData.project) {
//         setCustomerName({ name: editData.project.project_name, id: editData.project_id });
//       }
//     }
//   }, [editData, materials]);

//   // Recalculate total
//   useEffect(() => {
//     const baseAmount = (parseFloat(state.qty) || 0) * (parseFloat(state.price_per_unit) || 0);
//     let total = baseAmount;

//     if (state.include_gst && state.gst_percent > 0) {
//       const gstAmount = baseAmount * (parseFloat(state.gst_percent) / 100);
//       total = baseAmount + gstAmount;
//     }

//     setState(prev => ({ ...prev, total: Number(total.toFixed(2)) }));
//   }, [state.qty, state.price_per_unit, state.include_gst, state.gst_percent]);

//   const handleGstChange = (e) => {
//     const gst = parseFloat(e.target.value) || 0;
//     setState(prev => ({
//       ...prev,
//       gst_percent: gst,
//       cgst_percent: Number((gst / 2).toFixed(2)),
//       sgst_percent: Number((gst / 2).toFixed(2)),
//     }));
//   };

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     if (type === 'checkbox') {
//       setState(prev => ({ ...prev, [name]: checked }));
//     } else {
//       setState(prev => ({ ...prev, [name]: value }));
//     }
//   };

//   // Material change (now supports new values)
//   const handleMaterialChange = (newValue, actionMeta) => {
//     if (actionMeta.action === 'create-option') {
//       // New value was typed and created
//       setSelectedMaterial({ value: newValue.value, label: newValue.label });
//       setState(prev => ({ ...prev, material_name: newValue.value.trim() }));
//     } else if (newValue) {
//       // Existing option selected
//       setSelectedMaterial(newValue);
//       setState(prev => ({ ...prev, material_name: newValue.value.trim() }));
//     } else {
//       // Cleared
//       setSelectedMaterial(null);
//       setState(prev => ({ ...prev, material_name: '' }));
//     }
//   };

//   // Project search logic (unchanged)
//   const searchProject = async (value) => {
//     if (!value.trim()) {
//       setCustomerSuggestions([]);
//       return;
//     }
//     try {
//       const res = await getAPICall(`/api/projects?searchQuery=${value}`);
//       setCustomerSuggestions(res || []);
//     } catch {
//       showToast('danger', 'Error searching projects');
//     }
//   };

//   const handleCustomerNameChange = (e) => {
//     const val = e.target.value;
//     setCustomerName({ name: val, id: null });
//     searchProject(val);
//   };

//   const handleCustomerSelect = (proj) => {
//     setCustomerName({ name: proj.project_name, id: proj.id });
//     setState(s => ({ ...s, project_id: proj.id }));
//     setCustomerSuggestions([]);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!state.project_id) return showToast('danger', 'Please select a project');
//     if (!state.vendor_id) return showToast('danger', 'Please select a vendor');
//     if (!state.material_name.trim()) return showToast('danger', 'Enter material name');
//     if (state.price_per_unit <= 0) return showToast('danger', 'Price must be > 0');
//     if (state.qty <= 0) return showToast('danger', 'Quantity must be > 0');

//     const payload = {
//       project_id: parseInt(state.project_id),
//       vendor_id: parseInt(state.vendor_id),
//       material_name: state.material_name.trim(),
//       about: state.about || null,
//       price_per_unit: parseFloat(state.price_per_unit),
//       qty: parseFloat(state.qty),
//       total: parseFloat(state.total),
//       date: state.date,
//       paid_amount: 0,
//       gst_included: state.include_gst ? 1 : 0,
//       gst_percent: state.include_gst ? parseFloat(state.gst_percent) : 0,
//       cgst_percent: state.include_gst ? parseFloat(state.cgst_percent) : 0,
//       sgst_percent: state.include_gst ? parseFloat(state.sgst_percent) : 0,
//     };

//     setLoading(true);
//     try {
//       if (editData) {
//         await postAPICall('/api/updatePurchase', { ...payload, id: editData.id });
//         showToast('success', 'Purchase updated successfully!');
//       } else {
//         await postAPICall('/api/purchesVendor', payload);
//         showToast('success', 'Purchase saved successfully!');
//       }
//       onSuccess();
//     } catch (err) {
//       showToast('danger', err.response?.data?.message || 'Operation failed');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleClear = () => {
//     setState({
//       project_id: '',
//       vendor_id: '',
//       material_name: '',
//       about: '',
//       price_per_unit: 0,
//       qty: 1,
//       total: 0,
//       date: new Date().toISOString().split('T')[0],
//       include_gst: false,
//       gst_percent: 18,
//       cgst_percent: 9,
//       sgst_percent: 9,
//     });
//     setCustomerName({ name: '', id: null });
//     setCustomerSuggestions([]);
//     setSelectedMaterial(null);
//   };

//   return (
//     <>
//       <style jsx global>{`
//         .total-input {
//           background-color: #e9f7ef !important;
//           font-weight: 700;
//           font-size: 1.1em;
//           color: #155724;
//         }
//         .gst-section {
//           background: #f8f9fa;
//           padding: 16px;
//           border-radius: 8px;
//           border: 1px dashed #28a745;
//         }
//         .react-select__control {
//           min-height: 38px !important;
//         }
//       `}</style>

//       <CForm onSubmit={handleSubmit} className="needs-validation p-4">
//         <CRow className="g-4 align-items-end mb-3">
//           <CCol md={6} style={{ position: 'relative' }}>
//             <CFormLabel className="fw-bold">Project Name <span className="text-danger">*</span></CFormLabel>
//             <div style={{ position: 'relative' }}>
//               <CFormInput
//                 type="text"
//                 placeholder="Search project..."
//                 value={customerName.name}
//                 onChange={handleCustomerNameChange}
//                 autoComplete="off"
//                 required
//                 className="pe-5"
//               />
//               {!customerName.id ? (
//                 <CButton
//                   color="primary"
//                   variant="outline"
//                   size="sm"
//                   onClick={() => setShowProjectModal(true)}
//                   style={{ position: 'absolute', right: 2, top: 2, bottom: 2, width: '36px' }}
//                 >
//                   <CIcon icon={cilSearch} size="sm" />
//                 </CButton>
//               ) : (
//                 <CButton
//                   color="danger"
//                   variant="outline"
//                   size="sm"
//                   onClick={() => {
//                     setCustomerName({ name: '', id: null });
//                     setState(s => ({ ...s, project_id: '' }));
//                   }}
//                   style={{ position: 'absolute', right: 2, top: 2, bottom: 2, width: '36px' }}
//                 >
//                   <CIcon icon={cilX} size="sm" />
//                 </CButton>
//               )}
//             </div>
//             {customerSuggestions.length > 0 && (
//               <ul className="suggestions-list">
//                 {customerSuggestions.map((p) => (
//                   <li key={p.id} onClick={() => handleCustomerSelect(p)}>
//                     {p.project_name}
//                   </li>
//                 ))}
//               </ul>
//             )}
//           </CCol>

//           <CCol md={6}>
//             <CFormLabel className="fw-bold">Vendor <span className="text-danger">*</span></CFormLabel>
//             <select
//               className="form-select"
//               name="vendor_id"
//               value={state.vendor_id}
//               onChange={handleChange}
//               required
//             >
//               <option value="">Select Vendor</option>
//               {vendors.map((v) => (
//                 <option key={v.id} value={v.id}>
//                   {v.name}
//                 </option>
//               ))}
//             </select>
//           </CCol>
//         </CRow>

//         <CRow className="g-4 mb-3">
//           <CCol md={6}>
//             <CFormLabel className="fw-bold">Material Name <span className="text-danger">*</span></CFormLabel>
//             <CreatableSelect
//               options={materials}
//               value={selectedMaterial}
//               onChange={handleMaterialChange}
//               placeholder="Search or type new material name..."
//               isSearchable
//               isClearable
//               formatCreateLabel={(inputValue) => `Create new: "${inputValue}"`}
//               noOptionsMessage={() => 'No materials found — type to create new'}
//               required
//             />
//             {/* Hidden input for native form validation */}
//             <input
//               type="hidden"
//               name="material_name"
//               value={state.material_name || ''}
//               required
//             />
//           </CCol>

//           <CCol md={6}>
//             <CFormLabel className="fw-bold">About (optional)</CFormLabel>
//             <CFormInput
//               type="text"
//               name="about"
//               placeholder="Enter description..."
//               value={state.about}
//               onChange={handleChange}
//             />
//           </CCol>
//         </CRow>

//         {/* Rest of the form remains unchanged */}
//         <CRow className="g-4 mb-3 align-items-end">
//           <CCol md={3}>
//             <CFormLabel className="fw-bold">Price/Unit <span className="text-danger">*</span></CFormLabel>
//             <CFormInput
//               type="number"
//               name="price_per_unit"
//               value={state.price_per_unit}
//               onChange={handleChange}
//               min="0"
//               step="0.01"
//               required
//             />
//           </CCol>

//           <CCol md={3}>
//             <CFormLabel className="fw-bold">Quantity <span className="text-danger">*</span></CFormLabel>
//             <CFormInput
//               type="number"
//               name="qty"
//               value={state.qty}
//               onChange={handleChange}
//               min="0.01"
//               step="0.01"
//               required
//             />
//           </CCol>

//           <CCol md={3}>
//             <CFormLabel className="fw-bold">Include GST?</CFormLabel>
//             <CFormCheck
//               id="include_gst"
//               label="Yes, Add GST"
//               checked={state.include_gst}
//               onChange={handleChange}
//               name="include_gst"
//             />
//           </CCol>

//           <CCol md={3}>
//             <CFormLabel className="fw-bold">Total Amount</CFormLabel>
//             <CFormInput
//               type="number"
//               value={state.total}
//               readOnly
//               className="total-input text-success fw-bold"
//             />
//           </CCol>
//         </CRow>

//         {state.include_gst && (
//           <div className="gst-section mb-4">
//             <CRow className="g-3">
//               <CCol md={4}>
//                 <CFormLabel>GST %</CFormLabel>
//                 <CFormInput
//                   type="number"
//                   value={state.gst_percent}
//                   onChange={handleGstChange}
//                   min="0"
//                   step="0.01"
//                   placeholder="18"
//                 />
//               </CCol>
//               <CCol md={4}>
//                 <CFormLabel>CGST % (auto)</CFormLabel>
//                 <CFormInput
//                   type="text"
//                   value={state.cgst_percent}
//                   readOnly
//                   className="bg-light"
//                 />
//               </CCol>
//               <CCol md={4}>
//                 <CFormLabel>SGST % (auto)</CFormLabel>
//                 <CFormInput
//                   type="text"
//                   value={state.sgst_percent}
//                   readOnly
//                   className="bg-light"
//                 />
//               </CCol>
//             </CRow>
//             <small className="text-success d-block mt-2 fw-bold">
//               GST Amount: ₹{((state.qty * state.price_per_unit * state.gst_percent) / 100).toFixed(2)}
//             </small>
//           </div>
//         )}

//         <CRow className="g-4 mb-4">
//           <CCol md={4}>
//             <CFormLabel className="fw-bold">Date <span className="text-danger">*</span></CFormLabel>
//             <CFormInput
//               type="date"
//               name="date"
//               value={state.date}
//               onChange={handleChange}
//               max={new Date().toISOString().split('T')[0]}
//               required
//             />
//           </CCol>
//         </CRow>

//         <CModalFooter className="border-0 pt-4 justify-content-between">
//           <div>
//             <CButton color="secondary" onClick={handleClear} className="me-2">
//               Clear
//             </CButton>
//             <CButton color="secondary" onClick={onCancel}>
//               Cancel
//             </CButton>
//           </div>
//           <CButton color="success" type="submit" disabled={loading}>
//             {loading ? (
//               <>
//                 <CSpinner size="sm" className="me-2" />
//                 Saving...
//               </>
//             ) : (
//               editData ? 'Update Purchase' : 'Submit Purchase'
//             )}
//           </CButton>
//         </CModalFooter>
//       </CForm>

//       <ProjectSelectionModal
//         visible={showProjectModal}
//         onClose={() => setShowProjectModal(false)}
//         onSelectProject={handleCustomerSelect}
//       />
//     </>
//   );
// };

// export default PurchaseForm;

















import React, { useState, useEffect, useRef } from 'react';
import {
  CForm,
  CRow,
  CCol,
  CFormLabel,
  CFormInput,
  CButton,
  CModalFooter,
  CSpinner,
  CFormCheck,
  CModal,
  CModalBody,
  CModalHeader,
  CModalTitle,
  CCard,
  CCardBody,
  CBadge,
} from '@coreui/react';
import Select from 'react-select';
import CIcon from '@coreui/icons-react';
import { cilSearch, cilX, cilTrash, cilCloudUpload } from '@coreui/icons';
import CreatableSelect from 'react-select/creatable';
import { postAPICall, getAPICall, postFormData } from '../../../util/api';
import { useToast } from '../../common/toast/ToastContext';
import ProjectSelectionModal from '../../common/ProjectSelectionModal';

const PurchaseForm = ({ vendors, onSuccess, onCancel, editData = null }) => {
  const { showToast } = useToast();
  const fileInputRef = useRef(null);

  const [customerName, setCustomerName] = useState({ name: '', id: null });
  const [customerSuggestions, setCustomerSuggestions] = useState([]);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Material dropdown states
  const [materials, setMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  // Multi Photo States
  const [photos, setPhotos] = useState([]);
  const [showPhotoPreviewModal, setShowPhotoPreviewModal] = useState(false);
  const [photoAvailable, setPhotoAvailable] = useState(true);

  const [state, setState] = useState({
    project_id: '',
    vendor_id: '',
    material_name: '',
    about: '',
    price_per_unit: 0,
    qty: 1,
    total: 0,
    date: new Date().toISOString().split('T')[0],
    include_gst: false,
    gst_percent: 18,
    cgst_percent: 9,
    sgst_percent: 9,
  });

  // Fetch materials list
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const res = await getAPICall('/api/materialList');
        const options = (res || []).map(name => ({ value: name, label: name }));
        setMaterials(options);
      } catch (err) {
        console.error('Failed to load materials', err);
        showToast('danger', 'Could not load material list');
      }
    };
    fetchMaterials();
  }, []);

  // Load edit data with photo paths
  useEffect(() => {
    if (editData) {
      const gstIncluded = editData.gst_included === 1 || editData.gst_percent > 0;
      const gst = parseFloat(editData.gst_percent) || 18;

      const materialValue = editData.material_name || '';
      const materialOption = materials.find(m => m.value === materialValue) || {
        value: materialValue,
        label: materialValue,
      };

      setState({
        project_id: editData.project_id || '',
        vendor_id: editData.vendor_id || '',
        material_name: materialValue,
        about: editData.about || '',
        price_per_unit: parseFloat(editData.price_per_unit) || 0,
        qty: parseFloat(editData.qty) || 1,
        total: parseFloat(editData.total) || 0,
        date: editData.date || new Date().toISOString().split('T')[0],
        include_gst: gstIncluded,
        gst_percent: gst,
        cgst_percent: Number((gst / 2).toFixed(2)),
        sgst_percent: Number((gst / 2).toFixed(2)),
      });

      setSelectedMaterial(materialOption);
      setPhotoAvailable(editData.photoAvailable !== false);

      if (editData.project) {
        setCustomerName({ name: editData.project.project_name, id: editData.project_id });
      }

      // Load existing photos with paths/URLs
      if (editData.photos && Array.isArray(editData.photos)) {
        const loadedPhotos = editData.photos.map((photo, index) => ({
          id: photo.id || Date.now() + index,
          file: null,                    // No file for existing photos
          preview: photo.url || photo.path || photo.photo_url || null,
          name: photo.name || photo.original_name || `Photo ${index + 1}`,
          size: photo.size || '',
          type: photo.type || (photo.name?.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image'),
          remark: photo.remark || '',
          isExisting: true,              // Mark as existing photo
          path: photo.url || photo.path || photo.photo_url || ''  // ← This is what you want
        }));
        setPhotos(loadedPhotos);
      } else {
        setPhotos([]);
      }
    }
  }, [editData, materials]);

  // Recalculate total
  useEffect(() => {
    const baseAmount = (parseFloat(state.qty) || 0) * (parseFloat(state.price_per_unit) || 0);
    let total = baseAmount;
    if (state.include_gst && state.gst_percent > 0) {
      const gstAmount = baseAmount * (parseFloat(state.gst_percent) / 100);
      total = baseAmount + gstAmount;
    }
    setState(prev => ({ ...prev, total: Number(total.toFixed(2)) }));
  }, [state.qty, state.price_per_unit, state.include_gst, state.gst_percent]);

  // ==================== PHOTO HANDLERS ====================
  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];

    files.forEach(file => {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        showToast('warning', `${file.name} is not a valid file type. Only JPG, PNG, and PDF are allowed.`);
        return;
      }
      if (file.size > 4096 * 1024) {
        showToast('warning', `${file.name} exceeds 4MB size limit.`);
        return;
      }

      validFiles.push({
        file: file,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
        name: file.name,
        size: (file.size / 1024).toFixed(2),
        type: file.type.includes('pdf') ? 'pdf' : 'image',
        remark: '',
        id: Date.now() + Math.random(),
        isExisting: false
      });
    });

    setPhotos(prev => [...prev, ...validFiles]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePhoto = (photoId) => {
    setPhotos(prev => {
      const photo = prev.find(p => p.id === photoId);
      if (photo?.preview && !photo.isExisting) {
        URL.revokeObjectURL(photo.preview);
      }
      return prev.filter(p => p.id !== photoId);
    });
  };

  const updatePhotoRemark = (photoId, remark) => {
    setPhotos(prev => prev.map(p => 
      p.id === photoId ? { ...p, remark } : p
    ));
  };

  // ==================== OTHER HANDLERS ====================
  const handleGstChange = (e) => {
    const gst = parseFloat(e.target.value) || 0;
    setState(prev => ({
      ...prev,
      gst_percent: gst,
      cgst_percent: Number((gst / 2).toFixed(2)),
      sgst_percent: Number((gst / 2).toFixed(2)),
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setState(prev => ({ ...prev, [name]: checked }));
    } else {
      setState(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleMaterialChange = (newValue, actionMeta) => {
    if (actionMeta.action === 'create-option') {
      setSelectedMaterial({ value: newValue.value, label: newValue.label });
      setState(prev => ({ ...prev, material_name: newValue.value.trim() }));
    } else if (newValue) {
      setSelectedMaterial(newValue);
      setState(prev => ({ ...prev, material_name: newValue.value.trim() }));
    } else {
      setSelectedMaterial(null);
      setState(prev => ({ ...prev, material_name: '' }));
    }
  };

  const searchProject = async (value) => {
    if (!value.trim()) {
      setCustomerSuggestions([]);
      return;
    }
    try {
      const res = await getAPICall(`/api/projects?searchQuery=${value}`);
      setCustomerSuggestions(res || []);
    } catch {
      showToast('danger', 'Error searching projects');
    }
  };

  const handleCustomerNameChange = (e) => {
    const val = e.target.value;
    setCustomerName({ name: val, id: null });
    searchProject(val);
  };

  const handleCustomerSelect = (proj) => {
    setCustomerName({ name: proj.project_name, id: proj.id });
    setState(s => ({ ...s, project_id: proj.id }));
    setCustomerSuggestions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!state.project_id) return showToast('danger', 'Please select a project');
    if (!state.vendor_id) return showToast('danger', 'Please select a vendor');
    if (!state.material_name?.trim()) return showToast('danger', 'Enter material name');
    if (state.price_per_unit <= 0) return showToast('danger', 'Price must be > 0');
    if (state.qty <= 0) return showToast('danger', 'Quantity must be > 0');
    if (photoAvailable && photos.length === 0) {
      return showToast('danger', "Please upload at least one photo since 'Photo Available' is checked.");
    }

    const formData = new FormData();

    formData.append('project_id', state.project_id);
    formData.append('vendor_id', state.vendor_id);
    formData.append('material_name', state.material_name.trim());
    formData.append('about', state.about || '');
    formData.append('price_per_unit', state.price_per_unit);
    formData.append('qty', state.qty);
    formData.append('total', state.total);
    formData.append('date', state.date);
    formData.append('gst_included', state.include_gst ? 1 : 0);
    formData.append('gst_percent', state.include_gst ? state.gst_percent : 0);
    formData.append('cgst_percent', state.include_gst ? state.cgst_percent : 0);
    formData.append('sgst_percent', state.include_gst ? state.sgst_percent : 0);
    formData.append('photoAvailable', photoAvailable ? 1 : 0);

    // Append NEW files only
    const newPhotos = photos.filter(p => !p.isExisting);
    if (photoAvailable && newPhotos.length > 0) {
      newPhotos.forEach((photo, index) => {
        formData.append(`photos[${index}]`, photo.file);
        if (photo.remark) {
          formData.append(`photo_remarks[${index}]`, photo.remark);
        }
      });
    }

    setLoading(true);
    try {
      let response;
      if (editData) {
        formData.append('id', editData.id); // Important for update
        response = await postFormData('/api/updatePurchase', formData);
      } else {
        response = await postFormData('/api/purchesVendor', formData);
      }

      showToast('success', editData ? 'Purchase updated successfully!' : 'Purchase saved successfully!');

      // If backend returns saved data with photo paths, you can use it here
      if (response?.photos) {
        console.log("Saved Photo Paths:", response.photos); // ← You can see paths here
      }

      onSuccess();
      handleClear();
    } catch (err) {
      showToast('danger', err.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setState({
      project_id: '',
      vendor_id: '',
      material_name: '',
      about: '',
      price_per_unit: 0,
      qty: 1,
      total: 0,
      date: new Date().toISOString().split('T')[0],
      include_gst: false,
      gst_percent: 18,
      cgst_percent: 9,
      sgst_percent: 9,
    });
    setCustomerName({ name: '', id: null });
    setCustomerSuggestions([]);
    setSelectedMaterial(null);
    setPhotos([]);
    setPhotoAvailable(true);
  };

  return (
    <>
      <style jsx global>{`
        .total-input {
          background-color: #e9f7ef !important;
          font-weight: 700;
          font-size: 1.1em;
          color: #155724;
        }
        .gst-section {
          background: #f8f9fa;
          padding: 16px;
          border-radius: 8px;
          border: 1px dashed #28a745;
        }
        .react-select__control {
          min-height: 38px !important;
        }
      `}</style>

      <CForm onSubmit={handleSubmit} className="needs-validation p-4">
        {/* Project, Vendor, Material, Price, Qty, GST, Date fields remain same as before */}
        <CRow className="g-4 align-items-end mb-3">
          <CCol md={6} style={{ position: 'relative' }}>
            <CFormLabel className="fw-bold">Project Name <span className="text-danger">*</span></CFormLabel>
            <div style={{ position: 'relative' }}>
              <CFormInput
                type="text"
                placeholder="Search project..."
                value={customerName.name}
                onChange={handleCustomerNameChange}
                autoComplete="off"
                required
                className="pe-5"
              />
              {!customerName.id ? (
                <CButton color="primary" variant="outline" size="sm" onClick={() => setShowProjectModal(true)}
                  style={{ position: 'absolute', right: 2, top: 2, bottom: 2, width: '36px' }}>
                  <CIcon icon={cilSearch} size="sm" />
                </CButton>
              ) : (
                <CButton color="danger" variant="outline" size="sm"
                  onClick={() => {
                    setCustomerName({ name: '', id: null });
                    setState(s => ({ ...s, project_id: '' }));
                  }}
                  style={{ position: 'absolute', right: 2, top: 2, bottom: 2, width: '36px' }}>
                  <CIcon icon={cilX} size="sm" />
                </CButton>
              )}
            </div>
            {customerSuggestions.length > 0 && (
              <ul className="suggestions-list" style={{ position: 'absolute', zIndex: 1000, background: 'white', border: '1px solid #ccc', width: '100%', maxHeight: '200px', overflowY: 'auto' }}>
                {customerSuggestions.map((p) => (
                  <li key={p.id} onClick={() => handleCustomerSelect(p)} style={{ padding: '8px', cursor: 'pointer' }}>
                    {p.project_name}
                  </li>
                ))}
              </ul>
            )}
          </CCol>

          {/* <CCol md={6}>
            <CFormLabel className="fw-bold">Vendor <span className="text-danger">*</span></CFormLabel>
            <select className="form-select" name="vendor_id" value={state.vendor_id} onChange={handleChange} required>
              <option value="">Select Vendor</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </CCol> */}

         <CCol md={6}>
  <CFormLabel className="fw-bold">
    Vendor <span className="text-danger">*</span>
  </CFormLabel>
  
  <Select
    placeholder="Select Vendor..."
    options={vendors.map((v) => ({
      value: v.id,
      label: v.name,
    }))}
    value={vendors.find(v => v.id === Number(state.vendor_id)) 
      ? {
          value: Number(state.vendor_id),
          label: vendors.find(v => v.id === Number(state.vendor_id))?.name
        }
      : null
    }
    onChange={(selectedOption) => {
      if (selectedOption) {
        setState(prev => ({ ...prev, vendor_id: selectedOption.value }));
      } else {
        setState(prev => ({ ...prev, vendor_id: '' }));
      }
    }}
    isClearable
    isSearchable
    styles={{
      control: (base) => ({
        ...base,
        minHeight: '38px',
        borderColor: '#d1d5db',
      })
    }}
  />
</CCol>
        </CRow>

        {/* Material, About, Price, Qty, GST, Date sections - same as previous version */}
        <CRow className="g-4 mb-3">
          <CCol md={6}>
            <CFormLabel className="fw-bold">Material Name <span className="text-danger">*</span></CFormLabel>
            <CreatableSelect
              options={materials}
              value={selectedMaterial}
              onChange={handleMaterialChange}
              placeholder="Search or type new material name..."
              isSearchable
              isClearable
              formatCreateLabel={(inputValue) => `Create new: "${inputValue}"`}
            />
            <input type="hidden" name="material_name" value={state.material_name || ''} required />
          </CCol>
          <CCol md={6}>
            <CFormLabel className="fw-bold">About (optional)</CFormLabel>
            <CFormInput type="text" name="about" placeholder="Enter description..." value={state.about} onChange={handleChange} />
          </CCol>
        </CRow>

        {/* Price, Quantity, GST, Date - same */}
        <CRow className="g-4 mb-3 align-items-end">
          <CCol md={3}>
            <CFormLabel className="fw-bold">Price/Unit <span className="text-danger">*</span></CFormLabel>
            <CFormInput type="number" name="price_per_unit" value={state.price_per_unit} onChange={handleChange} min="0" step="0.01" required />
          </CCol>
          <CCol md={3}>
            <CFormLabel className="fw-bold">Quantity <span className="text-danger">*</span></CFormLabel>
            <CFormInput type="number" name="qty" value={state.qty} onChange={handleChange} min="0.01" step="0.01" required />
          </CCol>
          <CCol md={3}>
            <CFormLabel className="fw-bold">Include GST?</CFormLabel>
            <CFormCheck id="include_gst" label="Yes, Add GST" checked={state.include_gst} onChange={handleChange} name="include_gst" />
          </CCol>
          <CCol md={3}>
            <CFormLabel className="fw-bold">Total Amount</CFormLabel>
            <CFormInput type="number" value={state.total} readOnly className="total-input text-success fw-bold" />
          </CCol>
        </CRow>

        {state.include_gst && (
          <div className="gst-section mb-4">
            <CRow className="g-3">
              <CCol md={4}>
                <CFormLabel>GST %</CFormLabel>
                <CFormInput type="number" value={state.gst_percent} onChange={handleGstChange} min="0" step="0.01" />
              </CCol>
              <CCol md={4}>
                <CFormLabel>CGST % (auto)</CFormLabel>
                <CFormInput type="text" value={state.cgst_percent} readOnly className="bg-light" />
              </CCol>
              <CCol md={4}>
                <CFormLabel>SGST % (auto)</CFormLabel>
                <CFormInput type="text" value={state.sgst_percent} readOnly className="bg-light" />
              </CCol>
            </CRow>
          </div>
        )}

        <CRow className="g-4 mb-4">
          <CCol md={4}>
            <CFormLabel className="fw-bold">Date <span className="text-danger">*</span></CFormLabel>
            <CFormInput type="date" name="date" value={state.date} onChange={handleChange} max={new Date().toISOString().split('T')[0]} required />
          </CCol>
        </CRow>

        {/* Photo Upload Section */}
        <CRow className="mt-4 mb-4">
          <CCol md={12}>
            <CFormCheck
              id="photoAvailable"
              label="Photo Available"
              checked={photoAvailable}
              onChange={(e) => setPhotoAvailable(e.target.checked)}
            />
          </CCol>

          {photoAvailable && (
            <CCol md={12} className="mt-3">
              <CFormLabel><b>Upload Photos / Documents (JPG, PNG, PDF - Max 4MB each)</b></CFormLabel>
              <div className="d-flex gap-2 align-items-center">
                <CFormInput
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, application/pdf"
                  onChange={handlePhotoChange}
                  multiple
                  style={{ flex: 1 }}
                />
                {photos.length > 0 && (
                  <CButton color="info" onClick={() => setShowPhotoPreviewModal(true)}>
                    Preview ({photos.length})
                  </CButton>
                )}
              </div>
              <small className="text-muted">You can select multiple files at once</small>
            </CCol>
          )}
        </CRow>

        <CModalFooter className="border-0 pt-4 justify-content-between">
          <div>
            <CButton color="secondary" onClick={handleClear} className="me-2">Clear</CButton>
            <CButton color="secondary" onClick={onCancel}>Cancel</CButton>
          </div>
          <CButton color="success" type="submit" disabled={loading}>
            {loading ? (
              <>
                <CSpinner size="sm" className="me-2" />
                Saving...
              </>
            ) : (
              editData ? 'Update Purchase' : 'Submit Purchase'
            )}
          </CButton>
        </CModalFooter>
      </CForm>

      {/* Photo Preview Modal - Shows Paths */}
      <CModal visible={showPhotoPreviewModal} onClose={() => setShowPhotoPreviewModal(false)} size="xl" scrollable>
        <CModalHeader>
          <CModalTitle>Selected Files ({photos.length})</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="row g-3">
            {photos.map((photo) => (
              <div key={photo.id} className="col-md-6 col-lg-4">
                <CCard className="h-100">
                  <CCardBody>
                    <div style={{ height: '200px', backgroundColor: '#f8f9fa', borderRadius: '4px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {photo.type === 'image' && photo.preview ? (
                        <img src={photo.preview} alt={photo.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                      ) : (
                        <div className="text-center">
                          <CIcon icon={cilCloudUpload} size="4xl" />
                          <div className="mt-2"><CBadge color="danger">PDF</CBadge></div>
                        </div>
                      )}
                    </div>

                    <div className="mt-2">
                      <small className="text-muted">
                        <strong>{photo.name}</strong><br />
                        {photo.size} KB
                      </small>
                      {photo.path && (
                        <small className="text-info d-block mt-1">
                          Path: {photo.path}
                        </small>
                      )}
                    </div>

                    <CFormInput
                      type="text"
                      placeholder="Enter remark (optional)"
                      value={photo.remark || ''}
                      onChange={(e) => updatePhotoRemark(photo.id, e.target.value)}
                      className="mb-2"
                      size="sm"
                    />
                    <CButton color="danger" size="sm" className="w-100" onClick={() => removePhoto(photo.id)}>
                      <CIcon icon={cilTrash} /> Remove
                    </CButton>
                  </CCardBody>
                </CCard>
              </div>
            ))}
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowPhotoPreviewModal(false)}>Close</CButton>
        </CModalFooter>
      </CModal>

      <ProjectSelectionModal
        visible={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        onSelectProject={handleCustomerSelect}
      />
    </>
  );
};

export default PurchaseForm;