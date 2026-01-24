// // src/components/purchase/EditPurchaseModal.jsx
// import React, { useState } from 'react';
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
// } from '@coreui/react';
// import { put } from '../../../util/api';
// import { useToast } from '../../common/toast/ToastContext';

// const EditPurchaseModal = ({ visible, purchase, vendors, onClose, onSuccess }) => {
//   const { showToast } = useToast();
//   const [loading, setLoading] = useState(false);

//   const [form, setForm] = useState({
//     payment_id: purchase.id,
//     vendor_id: purchase.vendor_id?.toString() || '',
//     project_id: purchase.project_id?.toString() || '',
//     project_name: purchase.project?.project_name || '—',
//     material_name: purchase.material_name || '',
//     about: purchase.about || '',
//     price_per_unit: parseFloat(purchase.price_per_unit) || 0,
//     qty: parseFloat(purchase.qty) || 1,
//     date: purchase.date || '',
//   });

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleUpdate = async () => {
//     if (!form.material_name.trim()) return showToast('danger', 'Material name is required');
//     if (form.price_per_unit <= 0) return showToast('danger', 'Price must be > 0');
//     if (form.qty <= 0) return showToast('danger', 'Quantity must be > 0');

//     const payload = {
//       payment_id: parseInt(form.payment_id),
//       vendor_id: parseInt(form.vendor_id),
//       project_id: parseInt(form.project_id),
//       material_name: form.material_name,
//       about: form.about || null,
//       price_per_unit: parseFloat(form.price_per_unit),
//       qty: parseFloat(form.qty),
//       date: form.date,
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
//     <CModal visible={visible} onClose={onClose} backdrop="static" size="lg">
//       <CModalHeader closeButton>
//         <CModalTitle>Edit Purchase</CModalTitle>
//       </CModalHeader>

//       <CModalBody>
//         <CForm>
//           {/* Project (read-only) + Vendor */}
//           <CRow className="g-3">
//             <CCol md={6}>
//               <CFormLabel><b>Project</b></CFormLabel>
//               <CFormInput
//                 type="text"
//                 value={form.project_name}
//                 readOnly
//                 plaintext
//               />
//             </CCol>
//             <CCol md={6}>
//               <CFormLabel><b>Vendor *</b></CFormLabel>
//               <select
//                 className="form-select"
//                 name="vendor_id"
//                 value={form.vendor_id}
//                 onChange={handleChange}
//                 required
//               >
//                 <option value="">Select Vendor</option>
//                 {vendors.map((v) => (
//                   <option key={v.id} value={v.id}>{v.name}</option>
//                 ))}
//               </select>
//             </CCol>
//           </CRow>

//           {/* Material Name */}
//           <CRow className="g-3 mt-3">
//             <CCol md={12}>
//               <CFormLabel><b>Material Name *</b></CFormLabel>
//               <CFormInput
//                 type="text"
//                 name="material_name"
//                 value={form.material_name}
//                 onChange={handleChange}
//                 required
//               />
//             </CCol>
//           </CRow>

//           {/* About */}
//           <CRow className="g-3 mt-3">
//             <CCol md={12}>
//               <CFormLabel><b>About (optional)</b></CFormLabel>
//               <CFormInput
//                 type="text"
//                 name="about"
//                 placeholder="Description..."
//                 value={form.about}
//                 onChange={handleChange}
//               />
//             </CCol>
//           </CRow>

//           {/* Price, Qty, Date */}
//           <CRow className="g-3 mt-3 align-items-end">
//             <CCol md={4}>
//               <CFormLabel><b>Price/Unit *</b></CFormLabel>
//               <CFormInput
//                 type="number"
//                 name="price_per_unit"
//                 value={form.price_per_unit}
//                 onChange={handleChange}
//                 min="0"
//                 step="0.01"
//                 required
//               />
//             </CCol>
//             <CCol md={4}>
//               <CFormLabel><b>Quantity *</b></CFormLabel>
//               <CFormInput
//                 type="number"
//                 name="qty"
//                 value={form.qty}
//                 onChange={handleChange}
//                 min="0.01"
//                 step="0.01"
//                 required
//               />
//             </CCol>
//             <CCol md={4}>
//               <CFormLabel><b>Date *</b></CFormLabel>
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
//         <CButton color="secondary" onClick={onClose}>
//           Cancel
//         </CButton>
//         <CButton color="primary" onClick={handleUpdate} disabled={loading}>
//           {loading ? <CSpinner size="sm" /> : 'Update'}
//         </CButton>
//       </CModalFooter>
//     </CModal>
//   );
// };

// export default EditPurchaseModal;




/// src/components/purchase/EditPurchaseModal.jsx
import React, { useState, useEffect } from 'react';
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CSpinner,
  CForm,
  CRow,
  CCol,
  CFormLabel,
  CFormInput,
  CFormCheck,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilSearch, cilX } from '@coreui/icons';
import { put, getAPICall } from '../../../util/api'; // assuming getAPICall exists
import { useToast } from '../../common/toast/ToastContext';
import ProjectSelectionModal from '../../common/ProjectSelectionModal';

const EditPurchaseModal = ({ visible, purchase, vendors, onClose, onSuccess }) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);

  // Project search state
  const [projectName, setProjectName] = useState({ name: '', id: null });
  const [projectSuggestions, setProjectSuggestions] = useState([]);

  const [form, setForm] = useState({
    payment_id: purchase?.id || '',
    vendor_id: purchase?.vendor_id?.toString() || '',
    project_id: purchase?.project_id?.toString() || '',
    material_name: purchase?.material_name || '',
    about: purchase?.about || '',
    price_per_unit: parseFloat(purchase?.price_per_unit) || 0,
    qty: parseFloat(purchase?.qty) || 1,
    total: parseFloat(purchase?.total) || 0,
    date: purchase?.date || '',
    include_gst: purchase?.gst_included === 1 || purchase?.gst_percent > 0,
    gst_percent: parseFloat(purchase?.gst_percent) || 18,
    cgst_percent: parseFloat(purchase?.cgst_percent) || 9,
    sgst_percent: parseFloat(purchase?.sgst_percent) || 9,
  });

  // Initialize project name when purchase data loads
  useEffect(() => {
    if (purchase?.project) {
      setProjectName({ name: purchase.project.project_name, id: purchase.project_id });
      setForm(prev => ({ ...prev, project_id: purchase.project_id?.toString() }));
    }
  }, [purchase]);

  // Recalculate total
  useEffect(() => {
    const baseAmount = (parseFloat(form.qty) || 0) * (parseFloat(form.price_per_unit) || 0);
    let total = baseAmount;

    if (form.include_gst && form.gst_percent > 0) {
      const gstAmount = baseAmount * (parseFloat(form.gst_percent) / 100);
      total = baseAmount + gstAmount;
    }

    setForm(prev => ({ ...prev, total: Number(total.toFixed(2)) }));
  }, [form.qty, form.price_per_unit, form.include_gst, form.gst_percent]);

  // Sync CGST/SGST
  const handleGstChange = (e) => {
    const gst = parseFloat(e.target.value) || 0;
    setForm(prev => ({
      ...prev,
      gst_percent: gst,
      cgst_percent: Number((gst / 2).toFixed(2)),
      sgst_percent: Number((gst / 2).toFixed(2)),
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Project Search
  const searchProject = async (value) => {
    if (!value.trim()) {
      setProjectSuggestions([]);
      return;
    }
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
    setForm(prev => ({ ...prev, project_id: '' }));
    searchProject(val);
  };

  const handleProjectSelect = (proj) => {
    setProjectName({ name: proj.project_name, id: proj.id });
    setForm(prev => ({ ...prev, project_id: proj.id.toString() }));
    setProjectSuggestions([]);
  };

  const clearProject = () => {
    setProjectName({ name: '', id: null });
    setForm(prev => ({ ...prev, project_id: '' }));
    setProjectSuggestions([]);
  };

  const handleUpdate = async () => {
    if (!form.project_id) return showToast('danger', 'Please select a project');
    if (!form.vendor_id) return showToast('danger', 'Please select a vendor');
    if (!form.material_name.trim()) return showToast('danger', 'Material name is required');
    if (form.price_per_unit <= 0) return showToast('danger', 'Price must be > 0');
    if (form.qty <= 0) return showToast('danger', 'Quantity must be > 0');

    const payload = {
      payment_id: parseInt(form.payment_id),
      vendor_id: parseInt(form.vendor_id),
      project_id: parseInt(form.project_id),
      material_name: form.material_name,
      about: form.about || null,
      price_per_unit: parseFloat(form.price_per_unit),
      qty: parseFloat(form.qty),
      total: parseFloat(form.total),
      date: form.date,
      gst_included: form.include_gst ? 1 : 0,
      gst_percent: form.include_gst ? parseFloat(form.gst_percent) : 0,
      cgst_percent: form.include_gst ? parseFloat(form.cgst_percent) : 0,
      sgst_percent: form.include_gst ? parseFloat(form.sgst_percent) : 0,
    };

    setLoading(true);
    try {
      await put('/api/updatePurchesVendorPayment', payload);
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
    <CModal visible={visible} onClose={onClose} backdrop="static" size="xl">
      <CModalHeader closeButton>
        <CModalTitle>Edit Purchase</CModalTitle>
      </CModalHeader>

      <CModalBody>
        <CForm>
          {/* Project Search + Vendor */}
          <CRow className="g-4 mb-3 align-items-end">
            <CCol md={6} style={{ position: 'relative' }}>
              <CFormLabel className="fw-bold">Project <span className="text-danger">*</span></CFormLabel>
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
                  <CButton
                    color="primary"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowProjectModal(true)}
                    style={{ position: 'absolute', right: 2, top: 2, bottom: 2, width: '36px' }}
                  >
                    <CIcon icon={cilSearch} size="sm" />
                  </CButton>
                ) : (
                  <CButton
                    color="danger"
                    variant="outline"
                    size="sm"
                    onClick={clearProject}
                    style={{ position: 'absolute', right: 2, top: 2, bottom: 2, width: '36px' }}
                  >
                    <CIcon icon={cilX} size="sm" />
                  </CButton>
                )}
              </div>

              {/* Suggestions Dropdown */}
              {projectSuggestions.length > 0 && (
                <ul className="list-group position-absolute z-index-1000 w-100 mt-1" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {projectSuggestions.map((p) => (
                    <li
                      key={p.id}
                      className="list-group-item list-group-item-action"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleProjectSelect(p)}
                    >
                      {p.project_name}
                    </li>
                  ))}
                </ul>
              )}
            </CCol>

            <CCol md={6}>
              <CFormLabel className="fw-bold">Vendor <span className="text-danger">*</span></CFormLabel>
              <select className="form-select" name="vendor_id" value={form.vendor_id} onChange={handleChange} required>
                <option value="">Select Vendor</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </CCol>
          </CRow>

          {/* Material Name */}
          <CRow className="g-3 mb-3">
            <CCol md={12}>
              <CFormLabel className="fw-bold">Material Name <span className="text-danger">*</span></CFormLabel>
              <CFormInput
                type="text"
                name="material_name"
                value={form.material_name}
                onChange={handleChange}
                required
              />
            </CCol>
          </CRow>

          {/* About */}
          <CRow className="g-3 mb-3">
            <CCol md={12}>
              <CFormLabel>About (optional)</CFormLabel>
              <CFormInput
                type="text"
                name="about"
                placeholder="Description..."
                value={form.about}
                onChange={handleChange}
              />
            </CCol>
          </CRow>

          {/* Price, Qty, GST, Total */}
          <CRow className="g-3 mb-3 align-items-end">
            <CCol md={3}>
              <CFormLabel>Price/Unit *</CFormLabel>
              <CFormInput type="number" name="price_per_unit" value={form.price_per_unit} onChange={handleChange} min="0" step="0.01" required />
            </CCol>
            <CCol md={3}>
              <CFormLabel>Quantity *</CFormLabel>
              <CFormInput type="number" name="qty" value={form.qty} onChange={handleChange} min="0.01" step="0.01" required />
            </CCol>
            <CCol md={3}>
              <CFormLabel>Include GST?</CFormLabel>
              <CFormCheck
                id="include_gst_edit"
                label="Yes, Add GST"
                checked={form.include_gst}
                onChange={handleChange}
                name="include_gst"
              />
            </CCol>
            <CCol md={3}>
              <CFormLabel>Total Amount</CFormLabel>
              <CFormInput
                type="text"
                value={`₹${form.total.toFixed(2)}`}
                readOnly
                className="bg-success text-white fw-bold"
              />
            </CCol>
          </CRow>

          {/* GST Section */}
          {form.include_gst && (
            <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '8px', border: '1px dashed #28a745' }} className="mb-3">
              <CRow className="g-3">
                <CCol md={4}>
                  <CFormLabel>GST %</CFormLabel>
                  <CFormInput type="number" value={form.gst_percent} onChange={handleGstChange} min="0" step="0.01" />
                </CCol>
                <CCol md={4}>
                  <CFormLabel>CGST % (auto)</CFormLabel>
                  <CFormInput type="text" value={form.cgst_percent} readOnly className="bg-light" />
                </CCol>
                <CCol md={4}>
                  <CFormLabel>SGST % (auto)</CFormLabel>
                  <CFormInput type="text" value={form.sgst_percent} readOnly className="bg-light" />
                </CCol>
              </CRow>
              <small className="text-success fw-bold d-block mt-2">
                GST Amount: ₹{((form.qty * form.price_per_unit * form.gst_percent) / 100).toFixed(2)}
              </small>
            </div>
          )}

          {/* Date */}
          <CRow className="g-3">
            <CCol md={4}>
              <CFormLabel>Date *</CFormLabel>
              <CFormInput
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
                required
              />
            </CCol>
          </CRow>
        </CForm>
      </CModalBody>

      <CModalFooter>
        <CButton color="secondary" onClick={onClose}>Cancel</CButton>
        <CButton color="primary" onClick={handleUpdate} disabled={loading}>
          {loading ? <CSpinner size="sm" className="me-2" /> : 'Update Purchase'}
        </CButton>
      </CModalFooter>

      {/* Project Selection Modal */}
      <ProjectSelectionModal
        visible={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        onSelectProject={handleProjectSelect}
      />
    </CModal>
  );
};

export default EditPurchaseModal;