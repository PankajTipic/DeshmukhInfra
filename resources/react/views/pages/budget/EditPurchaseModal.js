
// import React, { useState, useEffect } from 'react';
// import {
//   CModal,
//   CModalHeader,
//   CModalTitle,
//   CModalBody,
//   CModalFooter,
//   CButton,
//   CSpinner,
//   CForm,
//   CRow,
//   CCol,
//   CFormLabel,
//   CFormInput,
//   CFormCheck,
// } from '@coreui/react';
// import CIcon from '@coreui/icons-react';
// import { cilSearch, cilX } from '@coreui/icons';
// import CreatableSelect from 'react-select/creatable';   // ← Changed to CreatableSelect
// import { put, getAPICall } from '../../../util/api';
// import { useToast } from '../../common/toast/ToastContext';
// import ProjectSelectionModal from '../../common/ProjectSelectionModal';

// const EditPurchaseModal = ({ visible, purchase, vendors, onClose, onSuccess }) => {
//   const { showToast } = useToast();
//   const [loading, setLoading] = useState(false);
//   const [showProjectModal, setShowProjectModal] = useState(false);

//   // Project search state
//   const [projectName, setProjectName] = useState({ name: '', id: null });
//   const [projectSuggestions, setProjectSuggestions] = useState([]);

//   // Material dropdown states
//   const [materials, setMaterials] = useState([]); // [{value, label}]
//   const [selectedMaterial, setSelectedMaterial] = useState(null);


//   const fileInputRef = useRef(null);

// const [photos, setPhotos] = useState([]);
// const [showPhotoPreviewModal, setShowPhotoPreviewModal] = useState(false);
// const [photoAvailable, setPhotoAvailable] = useState(true);



//   const [form, setForm] = useState({
//     payment_id: purchase?.id || '',
//     vendor_id: purchase?.vendor_id?.toString() || '',
//     project_id: purchase?.project_id?.toString() || '',
//     material_name: purchase?.material_name || '',
//     about: purchase?.about || '',
//     price_per_unit: parseFloat(purchase?.price_per_unit) || 0,
//     qty: parseFloat(purchase?.qty) || 1,
//     total: parseFloat(purchase?.total) || 0,
//     date: purchase?.date || '',
//     include_gst: purchase?.gst_included === 1 || purchase?.gst_percent > 0,
//     gst_percent: parseFloat(purchase?.gst_percent) || 18,
//     cgst_percent: parseFloat(purchase?.cgst_percent) || 9,
//     sgst_percent: parseFloat(purchase?.sgst_percent) || 9,
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

//   // Initialize form + project name + material when purchase data changes
//   useEffect(() => {
//     if (purchase) {
//       // Project
//       if (purchase.project) {
//         setProjectName({ name: purchase.project.project_name, id: purchase.project_id });
//         setForm(prev => ({ ...prev, project_id: purchase.project_id?.toString() || '' }));
//       }

//       // Material
//       const matName = purchase.material_name || '';
//       const found = materials.find(m => m.value === matName);
//       const materialOption = found || (matName ? { value: matName, label: matName } : null);

//       setSelectedMaterial(materialOption);
//       setForm(prev => ({ ...prev, material_name: matName }));
//     }
//   }, [purchase, materials]);

//   // Recalculate total
//   useEffect(() => {
//     const baseAmount = (parseFloat(form.qty) || 0) * (parseFloat(form.price_per_unit) || 0);
//     let total = baseAmount;

//     if (form.include_gst && form.gst_percent > 0) {
//       const gstAmount = baseAmount * (parseFloat(form.gst_percent) / 100);
//       total = baseAmount + gstAmount;
//     }

//     setForm(prev => ({ ...prev, total: Number(total.toFixed(2)) }));
//   }, [form.qty, form.price_per_unit, form.include_gst, form.gst_percent]);

//   const handleGstChange = (e) => {
//     const gst = parseFloat(e.target.value) || 0;
//     setForm(prev => ({
//       ...prev,
//       gst_percent: gst,
//       cgst_percent: Number((gst / 2).toFixed(2)),
//       sgst_percent: Number((gst / 2).toFixed(2)),
//     }));
//   };

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setForm(prev => ({
//       ...prev,
//       [name]: type === 'checkbox' ? checked : value,
//     }));
//   };

//   // Material change handler – supports new values
//   const handleMaterialChange = (newValue, actionMeta) => {
//     if (actionMeta.action === 'create-option') {
//       // User created a new option by typing
//       setSelectedMaterial({ value: newValue.value, label: newValue.label });
//       setForm(prev => ({
//         ...prev,
//         material_name: newValue.value.trim(),
//       }));
//     } else if (newValue) {
//       // Selected existing option
//       setSelectedMaterial(newValue);
//       setForm(prev => ({
//         ...prev,
//         material_name: newValue.value.trim(),
//       }));
//     } else {
//       // Cleared
//       setSelectedMaterial(null);
//       setForm(prev => ({
//         ...prev,
//         material_name: '',
//       }));
//     }
//   };

//   // Project search logic
//   const searchProject = async (value) => {
//     if (!value.trim()) {
//       setProjectSuggestions([]);
//       return;
//     }
//     try {
//       const res = await getAPICall(`/api/projects?searchQuery=${value}`);
//       setProjectSuggestions(res || []);
//     } catch {
//       showToast('danger', 'Error searching projects');
//     }
//   };

//   const handleProjectNameChange = (e) => {
//     const val = e.target.value;
//     setProjectName({ name: val, id: null });
//     setForm(prev => ({ ...prev, project_id: '' }));
//     searchProject(val);
//   };

//   const handleProjectSelect = (proj) => {
//     setProjectName({ name: proj.project_name, id: proj.id });
//     setForm(prev => ({ ...prev, project_id: proj.id.toString() }));
//     setProjectSuggestions([]);
//   };

//   const clearProject = () => {
//     setProjectName({ name: '', id: null });
//     setForm(prev => ({ ...prev, project_id: '' }));
//     setProjectSuggestions([]);
//   };

//   const handleUpdate = async () => {
//     if (!form.project_id) return showToast('danger', 'Please select a project');
//     if (!form.vendor_id) return showToast('danger', 'Please select a vendor');
//     if (!form.material_name.trim()) return showToast('danger', 'Material name is required');
//     if (form.price_per_unit <= 0) return showToast('danger', 'Price must be > 0');
//     if (form.qty <= 0) return showToast('danger', 'Quantity must be > 0');

//     const payload = {
//       payment_id: parseInt(form.payment_id),
//       vendor_id: parseInt(form.vendor_id),
//       project_id: parseInt(form.project_id),
//       material_name: form.material_name.trim(),
//       about: form.about || null,
//       price_per_unit: parseFloat(form.price_per_unit),
//       qty: parseFloat(form.qty),
//       total: parseFloat(form.total),
//       date: form.date,
//       gst_included: form.include_gst ? 1 : 0,
//       gst_percent: form.include_gst ? parseFloat(form.gst_percent) : 0,
//       cgst_percent: form.include_gst ? parseFloat(form.cgst_percent) : 0,
//       sgst_percent: form.include_gst ? parseFloat(form.sgst_percent) : 0,
//     };

//     setLoading(true);
//     try {
//       await put('/api/updatePurchesVendorPayment', payload);
//       showToast('success', 'Purchase updated successfully!');
//       onSuccess();
//       onClose();
//     } catch (err) {
//       showToast('danger', 'Update failed: ' + (err.response?.data?.message || err.message));
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <CModal visible={visible} onClose={onClose} backdrop="static" size="xl">
//       <CModalHeader closeButton>
//         <CModalTitle>Edit Purchase</CModalTitle>
//       </CModalHeader>

//       <CModalBody>
//         <CForm>
//           {/* Project + Vendor */}
//           <CRow className="g-4 mb-3 align-items-end">
//             <CCol md={6} style={{ position: 'relative' }}>
//               <CFormLabel className="fw-bold">Project <span className="text-danger">*</span></CFormLabel>
//               <div style={{ position: 'relative' }}>
//                 <CFormInput
//                   type="text"
//                   placeholder="Search project..."
//                   value={projectName.name}
//                   onChange={handleProjectNameChange}
//                   autoComplete="off"
//                   required
//                   className="pe-5"
//                 />
//                 {!projectName.id ? (
//                   <CButton
//                     color="primary"
//                     variant="outline"
//                     size="sm"
//                     onClick={() => setShowProjectModal(true)}
//                     style={{ position: 'absolute', right: 2, top: 2, bottom: 2, width: '36px' }}
//                   >
//                     <CIcon icon={cilSearch} size="sm" />
//                   </CButton>
//                 ) : (
//                   <CButton
//                     color="danger"
//                     variant="outline"
//                     size="sm"
//                     onClick={clearProject}
//                     style={{ position: 'absolute', right: 2, top: 2, bottom: 2, width: '36px' }}
//                   >
//                     <CIcon icon={cilX} size="sm" />
//                   </CButton>
//                 )}
//               </div>

//               {projectSuggestions.length > 0 && (
//                 <ul className="list-group position-absolute z-index-1000 w-100 mt-1" style={{ maxHeight: '200px', overflowY: 'auto' }}>
//                   {projectSuggestions.map((p) => (
//                     <li
//                       key={p.id}
//                       className="list-group-item list-group-item-action"
//                       style={{ cursor: 'pointer' }}
//                       onClick={() => handleProjectSelect(p)}
//                     >
//                       {p.project_name}
//                     </li>
//                   ))}
//                 </ul>
//               )}
//             </CCol>

//             <CCol md={6}>
//               <CFormLabel className="fw-bold">Vendor <span className="text-danger">*</span></CFormLabel>
//               <select className="form-select" name="vendor_id" value={form.vendor_id} onChange={handleChange} required>
//                 <option value="">Select Vendor</option>
//                 {vendors.map((v) => (
//                   <option key={v.id} value={v.id}>{v.name}</option>
//                 ))}
//               </select>
//             </CCol>
//           </CRow>

//           {/* Material Name - Creatable Dropdown */}
//           <CRow className="g-3 mb-3">
//             <CCol md={6}>
//               <CFormLabel className="fw-bold">Material Name <span className="text-danger">*</span></CFormLabel>
//               <CreatableSelect
//                 options={materials}
//                 value={selectedMaterial}
//                 onChange={handleMaterialChange}
//                 placeholder="Search or type new material name..."
//                 isSearchable
//                 isClearable
//                 formatCreateLabel={(input) => `Create new: "${input}"`}
//                 noOptionsMessage={() => 'No materials found — type to create new'}
//               />
//               {/* Hidden field for validation */}
//               <input type="hidden" name="material_name" value={form.material_name || ''} required />
//             </CCol>

//             <CCol md={6}>
//               <CFormLabel>About (optional)</CFormLabel>
//               <CFormInput
//                 type="text"
//                 name="about"
//                 placeholder="Description..."
//                 value={form.about}
//                 onChange={handleChange}
//               />
//             </CCol>
//           </CRow>

//           {/* Price, Qty, GST, Total */}
//           <CRow className="g-3 mb-3 align-items-end">
//             <CCol md={3}>
//               <CFormLabel>Price/Unit *</CFormLabel>
//               <CFormInput type="number" name="price_per_unit" value={form.price_per_unit} onChange={handleChange} min="0" step="0.01" required />
//             </CCol>
//             <CCol md={3}>
//               <CFormLabel>Quantity *</CFormLabel>
//               <CFormInput type="number" name="qty" value={form.qty} onChange={handleChange} min="0.01" step="0.01" required />
//             </CCol>
//             <CCol md={3}>
//               <CFormLabel>Include GST?</CFormLabel>
//               <CFormCheck
//                 id="include_gst_edit"
//                 label="Yes, Add GST"
//                 checked={form.include_gst}
//                 onChange={handleChange}
//                 name="include_gst"
//               />
//             </CCol>
//             <CCol md={3}>
//               <CFormLabel>Total Amount</CFormLabel>
//               <CFormInput
//                 type="text"
//                 value={`₹${form.total.toFixed(2)}`}
//                 readOnly
//                 className="bg-success text-white fw-bold"
//               />
//             </CCol>
//           </CRow>

//           {/* GST Details */}
//           {form.include_gst && (
//             <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '8px', border: '1px dashed #28a745' }} className="mb-3">
//               <CRow className="g-3">
//                 <CCol md={4}>
//                   <CFormLabel>GST %</CFormLabel>
//                   <CFormInput type="number" value={form.gst_percent} onChange={handleGstChange} min="0" step="0.01" />
//                 </CCol>
//                 <CCol md={4}>
//                   <CFormLabel>CGST % (auto)</CFormLabel>
//                   <CFormInput type="text" value={form.cgst_percent} readOnly className="bg-light" />
//                 </CCol>
//                 <CCol md={4}>
//                   <CFormLabel>SGST % (auto)</CFormLabel>
//                   <CFormInput type="text" value={form.sgst_percent} readOnly className="bg-light" />
//                 </CCol>
//               </CRow>
//               <small className="text-success fw-bold d-block mt-2">
//                 GST Amount: ₹{((form.qty * form.price_per_unit * form.gst_percent) / 100).toFixed(2)}
//               </small>
//             </div>
//           )}

//           {/* Date */}
//           <CRow className="g-3">
//             <CCol md={4}>
//               <CFormLabel>Date *</CFormLabel>
//               <CFormInput
//                 type="date"
//                 name="date"
//                 value={form.date}
//                 onChange={handleChange}
//                 max={new Date().toISOString().split('T')[0]}
//                 required
//               />
//             </CCol>
//           </CRow>
//         </CForm>
//       </CModalBody>

//       <CModalFooter>
//         <CButton color="secondary" onClick={onClose}>Cancel</CButton>
//         <CButton color="primary" onClick={handleUpdate} disabled={loading}>
//           {loading ? <CSpinner size="sm" className="me-2" /> : 'Update Purchase'}
//         </CButton>
//       </CModalFooter>

//       <ProjectSelectionModal
//         visible={showProjectModal}
//         onClose={() => setShowProjectModal(false)}
//         onSelectProject={handleProjectSelect}
//       />
//     </CModal>
//   );
// };

// export default EditPurchaseModal;












import React, { useState, useEffect, useRef } from 'react';
import {
  CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
  CButton, CSpinner, CForm, CRow, CCol, CFormLabel, CFormInput,
  CFormCheck, CCard, CCardBody, CBadge,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilSearch, cilX, cilTrash, cilFile } from '@coreui/icons';
import CreatableSelect from 'react-select/creatable';
import { postFormData, getAPICall } from '../../../util/api';
import { useToast } from '../../common/toast/ToastContext';
import ProjectSelectionModal from '../../common/ProjectSelectionModal';
import { host } from '../../../util/constants';

const EditPurchaseModal = ({ visible, purchase, vendors, onClose, onSuccess }) => {
  const { showToast } = useToast();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projectName, setProjectName] = useState({ name: '', id: null });
  const [projectSuggestions, setProjectSuggestions] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [photoAvailable, setPhotoAvailable] = useState(true);
  const [deletedImageIds, setDeletedImageIds] = useState([]); // tracks IDs of removed existing images

  const [form, setForm] = useState({
    payment_id: '', vendor_id: '', project_id: '', material_name: '',
    about: '', price_per_unit: 0, qty: 1, total: 0, date: '',
    include_gst: false, gst_percent: 18, cgst_percent: 9, sgst_percent: 9,
  });

  // Fetch materials
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const res = await getAPICall('/api/materialList');
        setMaterials((res || []).map((name) => ({ value: name, label: name })));
      } catch (err) {
        showToast('danger', 'Could not load material list');
      }
    };
    fetchMaterials();
  }, []);

  // Load purchase data when modal opens
  useEffect(() => {
    if (!purchase || !visible) return;

    const gstIncluded = purchase.gst_included === 1 || purchase.gst_percent > 0;
    const gst = parseFloat(purchase.gst_percent) || 18;

    setForm({
      payment_id: purchase.id || '',
      vendor_id: purchase.vendor_id?.toString() || '',
      project_id: purchase.project_id?.toString() || '',
      material_name: purchase.material_name || '',
      about: purchase.about || '',
      price_per_unit: parseFloat(purchase.price_per_unit) || 0,
      qty: parseFloat(purchase.qty) || 1,
      total: parseFloat(purchase.total) || 0,
      date: purchase.date || '',
      include_gst: gstIncluded,
      gst_percent: gst,
      cgst_percent: Number((gst / 2).toFixed(2)),
      sgst_percent: Number((gst / 2).toFixed(2)),
    });

    if (purchase.project) {
      setProjectName({ name: purchase.project.project_name, id: purchase.project_id });
    }

    const matName = purchase.material_name || '';
    const found = materials.find((m) => m.value === matName);
    setSelectedMaterial(found || { value: matName, label: matName });

    setPhotoAvailable(purchase.photoAvailable !== false);

    // ─────────────────────────────────────────────────────────────────
    // KEY FIX: API returns purchase.images[] with field image_path.
    // Support both purchase.images (PurchaseList shape) and
    // purchase.photos (alternative shape) so nothing is missed.
    // ─────────────────────────────────────────────────────────────────
    const rawImages =
      (purchase.images && purchase.images.length > 0)
        ? purchase.images          // ← shape from PurchaseList API
        : (purchase.photos || []); // ← fallback

    const loadedPhotos = rawImages.map((img, index) => {
      // Build the full URL for existing server images
      const imagePath = img.image_path || img.url || img.path || img.photo_url || '';
      const fullUrl = imagePath.startsWith('http')
        ? imagePath
        : imagePath
          ? `${host}/${imagePath}`
          : null;

      const fileName = img.original_name || img.name || `Photo ${index + 1}`;
      const isPdf =
        img.type === 'pdf' ||
        fileName.toLowerCase().endsWith('.pdf') ||
        (img.mime_type || '').includes('pdf');

      return {
        id: img.id || Date.now() + index,
        file: null,
        preview: fullUrl,           // ← full URL so <img> renders it
        name: fileName,
        size: img.size ? `${(img.size / 1024).toFixed(2)}` : '',
        type: isPdf ? 'pdf' : 'image',
        remark: img.remark || '',
        isExisting: true,
        path: fullUrl || '',
      };
    });

    setPhotos(loadedPhotos);
    setDeletedImageIds([]); // reset on every modal open
  }, [purchase, visible]); // ← depend on `visible` so it re-runs every time modal opens

  // Total calculation
  useEffect(() => {
    const baseAmount = (parseFloat(form.qty) || 0) * (parseFloat(form.price_per_unit) || 0);
    let total = baseAmount;
    if (form.include_gst && form.gst_percent > 0) {
      total = baseAmount + baseAmount * (parseFloat(form.gst_percent) / 100);
    }
    setForm((prev) => ({ ...prev, total: Number(total.toFixed(2)) }));
  }, [form.qty, form.price_per_unit, form.include_gst, form.gst_percent]);

  // Photo upload handler
  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    const validFiles = [];

    files.forEach((file) => {
      if (!validTypes.includes(file.type)) {
        showToast('warning', `${file.name} is not valid. Only JPG, PNG and PDF allowed.`);
        return;
      }
      if (file.size > 4096 * 1024) {
        showToast('warning', `${file.name} exceeds 4MB size limit.`);
        return;
      }
      validFiles.push({
        file,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
        name: file.name,
        size: (file.size / 1024).toFixed(2),
        type: file.type.includes('pdf') ? 'pdf' : 'image',
        remark: '',
        id: Date.now() + Math.random(),
        isExisting: false,
      });
    });

    setPhotos((prev) => [...prev, ...validFiles]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePhoto = (photoId) => {
    setPhotos((prev) => {
      const photo = prev.find((p) => p.id === photoId);
      // If removing an existing server image, record its DB id for deletion
      if (photo?.isExisting && photo.id) {
        setDeletedImageIds((ids) => [...ids, photo.id]);
      }
      // If removing a newly added local file, free the blob URL
      if (photo?.preview && !photo.isExisting && photo.preview.startsWith('blob:')) {
        URL.revokeObjectURL(photo.preview);
      }
      return prev.filter((p) => p.id !== photoId);
    });
  };

  const updatePhotoRemark = (photoId, remark) => {
    setPhotos((prev) => prev.map((p) => (p.id === photoId ? { ...p, remark } : p)));
  };

  const handleGstChange = (e) => {
    const gst = parseFloat(e.target.value) || 0;
    setForm((prev) => ({
      ...prev,
      gst_percent: gst,
      cgst_percent: Number((gst / 2).toFixed(2)),
      sgst_percent: Number((gst / 2).toFixed(2)),
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleMaterialChange = (newValue, actionMeta) => {
    if (actionMeta.action === 'create-option') {
      setSelectedMaterial({ value: newValue.value, label: newValue.label });
      setForm((prev) => ({ ...prev, material_name: newValue.value.trim() }));
    } else if (newValue) {
      setSelectedMaterial(newValue);
      setForm((prev) => ({ ...prev, material_name: newValue.value.trim() }));
    } else {
      setSelectedMaterial(null);
      setForm((prev) => ({ ...prev, material_name: '' }));
    }
  };

  const searchProject = async (value) => {
    if (!value.trim()) { setProjectSuggestions([]); return; }
    try {
      const res = await getAPICall(`/api/projects?searchQuery=${value}`);
      setProjectSuggestions(res || []);
    } catch {
      showToast('danger', 'Error searching projects');
    }
  };

  const handleProjectNameChange = (e) => {
    const val = e.target.value;
    setProjectName({ name: val, id: null });
    setForm((prev) => ({ ...prev, project_id: '' }));
    searchProject(val);
  };

  const handleProjectSelect = (proj) => {
    setProjectName({ name: proj.project_name, id: proj.id });
    setForm((prev) => ({ ...prev, project_id: proj.id.toString() }));
    setProjectSuggestions([]);
  };

  const clearProject = () => {
    setProjectName({ name: '', id: null });
    setForm((prev) => ({ ...prev, project_id: '' }));
    setProjectSuggestions([]);
  };

  const handleUpdate = async () => {
    if (!form.project_id) return showToast('danger', 'Please select a project');
    if (!form.vendor_id) return showToast('danger', 'Please select a vendor');
    if (!form.material_name.trim()) return showToast('danger', 'Material name is required');
    if (form.price_per_unit <= 0) return showToast('danger', 'Price must be > 0');
    if (form.qty <= 0) return showToast('danger', 'Quantity must be > 0');
    if (photoAvailable && photos.length === 0)
      return showToast('danger', 'Please upload at least one photo.');

    const formData = new FormData();
    formData.append('_method', 'PUT'); // ← Laravel method spoofing (multipart/form-data can't send true PUT)
    formData.append('payment_id', parseInt(form.payment_id));
    formData.append('vendor_id', parseInt(form.vendor_id));
    formData.append('project_id', parseInt(form.project_id));
    formData.append('material_name', form.material_name.trim());
    formData.append('about', form.about || '');
    formData.append('price_per_unit', parseFloat(form.price_per_unit));
    formData.append('qty', parseFloat(form.qty));
    formData.append('total', parseFloat(form.total));
    formData.append('date', form.date);
    formData.append('gst_included', form.include_gst ? 1 : 0);
    formData.append('gst_percent', form.include_gst ? parseFloat(form.gst_percent) : 0);
    formData.append('cgst_percent', form.include_gst ? parseFloat(form.cgst_percent) : 0);
    formData.append('sgst_percent', form.include_gst ? parseFloat(form.sgst_percent) : 0);
    formData.append('photoAvailable', photoAvailable ? 1 : 0);

    // Send IDs of removed existing images so Laravel can delete them from DB + disk
    formData.append('deleted_image_ids', JSON.stringify(deletedImageIds));

    const existingPhotos = photos.filter((p) => p.isExisting);
    formData.append('existing_photos', JSON.stringify(existingPhotos));

    const newPhotos = photos.filter((p) => !p.isExisting);
    newPhotos.forEach((photo, index) => {
      formData.append(`photos[${index}]`, photo.file);
      if (photo.remark) formData.append(`photo_remarks[${index}]`, photo.remark);
    });

    setLoading(true);
    try {
      await postFormData('/api/updatePurchesVendorPayment', formData);
      showToast('success', 'Purchase updated successfully!');
      onSuccess();
      onClose();
    } catch (err) {
      showToast('danger', 'Update failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <CModal visible={visible} onClose={onClose} backdrop="static" size="xl">
        <CModalHeader closeButton>
          <CModalTitle>Edit Purchase</CModalTitle>
        </CModalHeader>

        <CModalBody>
          <CForm>
            {/* Project + Vendor */}
            <CRow className="g-4 mb-3 align-items-end">
              <CCol md={6} style={{ position: 'relative' }}>
                <CFormLabel className="fw-bold">
                  Project <span className="text-danger">*</span>
                </CFormLabel>
                <div style={{ position: 'relative' }}>
                  <CFormInput
                    type="text"
                    placeholder="Search project..."
                    value={projectName.name}
                    onChange={handleProjectNameChange}
                    autoComplete="off"
                    required
                    className="pe-5"
                  />
                  {!projectName.id ? (
                    <CButton color="primary" variant="outline" size="sm"
                      onClick={() => setShowProjectModal(true)}
                      style={{ position: 'absolute', right: 2, top: 2, bottom: 2, width: '36px' }}>
                      <CIcon icon={cilSearch} size="sm" />
                    </CButton>
                  ) : (
                    <CButton color="danger" variant="outline" size="sm"
                      onClick={clearProject}
                      style={{ position: 'absolute', right: 2, top: 2, bottom: 2, width: '36px' }}>
                      <CIcon icon={cilX} size="sm" />
                    </CButton>
                  )}
                </div>
                {projectSuggestions.length > 0 && (
                  <ul className="list-group position-absolute w-100 mt-1"
                    style={{ maxHeight: '200px', overflowY: 'auto', zIndex: 9999 }}>
                    {projectSuggestions.map((p) => (
                      <li key={p.id}
                        className="list-group-item list-group-item-action"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleProjectSelect(p)}>
                        {p.project_name}
                      </li>
                    ))}
                  </ul>
                )}
              </CCol>

              <CCol md={6}>
                <CFormLabel className="fw-bold">
                  Vendor <span className="text-danger">*</span>
                </CFormLabel>
                <select className="form-select" name="vendor_id" value={form.vendor_id}
                  onChange={handleChange} required>
                  <option value="">Select Vendor</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              </CCol>
            </CRow>

            {/* Material + About */}
            <CRow className="g-3 mb-3">
              <CCol md={6}>
                <CFormLabel className="fw-bold">
                  Material Name <span className="text-danger">*</span>
                </CFormLabel>
                <CreatableSelect
                  options={materials}
                  value={selectedMaterial}
                  onChange={handleMaterialChange}
                  placeholder="Search or type new material name..."
                  isSearchable isClearable
                  formatCreateLabel={(input) => `Create new: "${input}"`}
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>About (optional)</CFormLabel>
                <CFormInput type="text" name="about" placeholder="Description..."
                  value={form.about} onChange={handleChange} />
              </CCol>
            </CRow>

            {/* Price + Qty + GST + Total */}
            <CRow className="g-3 mb-3 align-items-end">
              <CCol md={3}>
                <CFormLabel>Price/Unit *</CFormLabel>
                <CFormInput type="number" name="price_per_unit" value={form.price_per_unit}
                  onChange={handleChange} min="0" step="0.01" required />
              </CCol>
              <CCol md={3}>
                <CFormLabel>Quantity *</CFormLabel>
                <CFormInput type="number" name="qty" value={form.qty}
                  onChange={handleChange} min="0.01" step="0.01" required />
              </CCol>
              <CCol md={3}>
                <CFormLabel>Include GST?</CFormLabel>
                <CFormCheck id="include_gst_edit" label="Yes, Add GST"
                  checked={form.include_gst} onChange={handleChange} name="include_gst" />
              </CCol>
              <CCol md={3}>
                <CFormLabel>Total Amount</CFormLabel>
                <CFormInput type="text" value={`₹${form.total.toFixed(2)}`}
                  readOnly className="bg-success text-white fw-bold" />
              </CCol>
            </CRow>

            {/* GST breakdown */}
            {form.include_gst && (
              <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '8px', border: '1px dashed #28a745' }}
                className="mb-3">
                <CRow className="g-3">
                  <CCol md={4}>
                    <CFormLabel>GST %</CFormLabel>
                    <CFormInput type="number" value={form.gst_percent}
                      onChange={handleGstChange} min="0" step="0.01" />
                  </CCol>
                  <CCol md={4}>
                    <CFormLabel>CGST %</CFormLabel>
                    <CFormInput type="text" value={form.cgst_percent} readOnly className="bg-light" />
                  </CCol>
                  <CCol md={4}>
                    <CFormLabel>SGST %</CFormLabel>
                    <CFormInput type="text" value={form.sgst_percent} readOnly className="bg-light" />
                  </CCol>
                </CRow>
                <small className="text-success fw-bold d-block mt-2">
                  GST Amount: ₹{((form.qty * form.price_per_unit * form.gst_percent) / 100).toFixed(2)}
                </small>
              </div>
            )}

            {/* ─── PHOTO SECTION ─── */}
            <CRow className="mt-4 mb-2">
              <CCol md={12}>
                <CFormCheck id="photoAvailable" label="Photo Available"
                  checked={photoAvailable}
                  onChange={(e) => setPhotoAvailable(e.target.checked)} />
              </CCol>
            </CRow>

            {photoAvailable && (
              <>
                <CRow className="mb-3">
                  <CCol md={12}>
                    <CFormLabel>
                      <b>Upload Photos / Documents (JPG, PNG, PDF — Max 4MB each)</b>
                    </CFormLabel>
                    <CFormInput ref={fileInputRef} type="file" multiple
                      accept="image/png,image/jpeg,image/jpg,application/pdf"
                      onChange={handlePhotoChange} />
                    <small className="text-muted">You can select multiple files</small>
                  </CCol>
                </CRow>

                {/* ── Inline photo grid ── */}
                {photos.length > 0 && (
                  <CRow className="mb-4 g-3">
                    {photos.map((photo) => (
                      <CCol key={photo.id} xs={12} sm={6} md={4} lg={3}>
                        <CCard className="h-100"
                          style={{ border: '1px solid #dee2e6', borderRadius: '8px', overflow: 'hidden' }}>
                          <CCardBody className="p-2">
                            {/* Preview area */}
                            <div style={{
                              height: '150px', backgroundColor: '#f1f3f5', borderRadius: '6px',
                              overflow: 'hidden', display: 'flex', alignItems: 'center',
                              justifyContent: 'center', marginBottom: '8px', position: 'relative',
                            }}>
                              {photo.type === 'image' && photo.preview ? (
                                <img
                                  src={photo.preview}
                                  alt={photo.name}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  onError={(e) => {
                                    // If image fails to load, show a fallback icon
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                              ) : null}

                              {/* PDF icon OR image fallback */}
                              <div
                                style={{
                                  display: (photo.type === 'pdf' || !photo.preview) ? 'flex' : 'none',
                                  flexDirection: 'column', alignItems: 'center',
                                  justifyContent: 'center', width: '100%', height: '100%',
                                }}
                              >
                                <CIcon icon={cilFile} size="3xl"
                                  style={{ color: photo.type === 'pdf' ? '#e74c3c' : '#aaa' }} />
                                <CBadge color={photo.type === 'pdf' ? 'danger' : 'secondary'}
                                  className="mt-1" style={{ fontSize: '11px' }}>
                                  {photo.type === 'pdf' ? 'PDF' : 'No Preview'}
                                </CBadge>
                              </div>

                              {/* Remove button overlay */}
                              <CButton color="danger" size="sm"
                                onClick={() => removePhoto(photo.id)}
                                style={{
                                  position: 'absolute', top: '4px', right: '4px',
                                  padding: '2px 6px', lineHeight: 1, borderRadius: '50%',
                                  fontSize: '12px',
                                }}
                                title="Remove">
                                <CIcon icon={cilX} size="sm" />
                              </CButton>
                            </div>

                            {/* Name + size + badge */}
                            <small className="text-muted d-block text-truncate fw-semibold"
                              title={photo.name} style={{ fontSize: '12px' }}>
                              {photo.name}
                            </small>
                            <small className="text-muted d-block" style={{ fontSize: '11px' }}>
                              {photo.size ? `${photo.size} KB` : ''}
                              {photo.isExisting && (
                                <CBadge color="info" className="ms-1" style={{ fontSize: '10px' }}>
                                  Saved
                                </CBadge>
                              )}
                            </small>

                            {/* Remark */}
                            <CFormInput type="text" placeholder="Remark (optional)"
                              value={photo.remark || ''}
                              onChange={(e) => updatePhotoRemark(photo.id, e.target.value)}
                              className="mt-2" size="sm" />
                          </CCardBody>
                        </CCard>
                      </CCol>
                    ))}
                  </CRow>
                )}
              </>
            )}

            {/* Date */}
            <CRow className="g-3">
              <CCol md={4}>
                <CFormLabel>Date *</CFormLabel>
                <CFormInput type="date" name="date" value={form.date}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]} required />
              </CCol>
            </CRow>
          </CForm>
        </CModalBody>

        <CModalFooter>
          <CButton color="secondary" onClick={onClose}>Cancel</CButton>
          <CButton color="primary" onClick={handleUpdate} disabled={loading}>
            {loading ? (<><CSpinner size="sm" className="me-2" />Updating...</>) : 'Update Purchase'}
          </CButton>
        </CModalFooter>
      </CModal>

      <ProjectSelectionModal
        visible={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        onSelectProject={handleProjectSelect}
      />
    </>
  );
};

export default EditPurchaseModal;