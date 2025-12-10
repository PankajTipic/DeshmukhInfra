// import React, { useState } from 'react';
// import {
//   CForm,
//   CRow,
//   CCol,
//   CFormLabel,
//   CFormInput,
//   CButton,
//   CModalFooter,
//   CSpinner,
// } from '@coreui/react';

// import CIcon from '@coreui/icons-react';

// import { cilSearch, cilX } from '@coreui/icons';
// import { postAPICall, getAPICall } from '../../../util/api';
// import { useToast } from '../../common/toast/ToastContext';
// import ProjectSelectionModal from '../../common/ProjectSelectionModal';

// const PurchaseForm = ({ vendors, onSuccess, onCancel }) => {
//   const { showToast } = useToast();
//   const [customerName, setCustomerName] = useState({ name: '', id: null });
//   const [customerSuggestions, setCustomerSuggestions] = useState([]);
//   const [showProjectModal, setShowProjectModal] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const [state, setState] = useState({
//     project_id: '',
//     vendor_id: '',
//     material_name: '',
//     about: '',
//     price_per_unit: 0,
//     qty: 1,
//     total: 0,
//     date: new Date().toISOString().split('T')[0],
//   });

//   // Calculate total
//   const calculateTotal = (q, p) => Number((q * p).toFixed(2));

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setState((prev) => {
//       const updated = { ...prev, [name]: value };
//       if (name === 'qty' || name === 'price_per_unit') {
//         const qty = name === 'qty' ? parseFloat(value) || 0 : parseFloat(prev.qty) || 0;
//         const price = name === 'price_per_unit' ? parseFloat(value) || 0 : parseFloat(prev.price_per_unit) || 0;
//         updated.total = calculateTotal(qty, price);
//       }
//       return updated;
//     });
//   };

//   // Project search
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
//     setState((s) => ({ ...s, project_id: proj.id }));
//     setCustomerSuggestions([]);
//   };

//   // Submit
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
//       material_name: state.material_name,
//       about: state.about || null,
//       price_per_unit: parseFloat(state.price_per_unit),
//       qty: parseFloat(state.qty),
//       total: parseFloat(state.total),
//       date: state.date,
//       paid_amount: 0,
//     };

//     setLoading(true);
//     try {
//       await postAPICall('/api/purchesVendor', payload);
//       showToast('success', 'Purchase saved successfully!');
//       onSuccess();
//     } catch (err) {
//       showToast('danger', err.response?.data?.message || err.message);
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
//     });
//     setCustomerName({ name: '', id: null });
//     setCustomerSuggestions([]);
//   };

//   return (
//     <>
//       <style jsx global>{`
//         .suggestions-list {
//           position: absolute;
//           z-index: 1050;
//           background: white;
//           border: 1px solid #ddd;
//           border-radius: 0.375rem;
//           max-height: 200px;
//           overflow-y: auto;
//           width: 100%;
//           margin-top: 4px;
//           padding: 0;
//           list-style: none;
//           box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
//         }
//         .suggestions-list li {
//           padding: 10px 12px;
//           cursor: pointer;
//           border-bottom: 1px solid #eee;
//           transition: background 0.2s;
//         }
//         .suggestions-list li:hover {
//           background: #f1f3f5;
//         }
//         .form-control:focus {
//           border-color: #80bdff;
//           box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
//         }
//         .total-input {
//           background-color: #f8f9fa !important;
//           font-weight: 600;
//           color: #2c3e50;
//         }
//       `}</style>

//       <CForm onSubmit={handleSubmit} className="needs-validation p-4 border ">
//         {/* === ROW 1: Project, Vendor, Material === */}
//         <CRow className="g-4 align-items-end">
//           {/* Project Search */}
//           <CCol md={4} style={{ position: 'relative' }}>
//             <CFormLabel className="fw-bold">
//               Project Name <span className="text-danger">*</span>
//             </CFormLabel>
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
//                   style={{
//                     position: 'absolute',
//                     right: 2,
//                     top: 2,
//                     bottom: 2,
//                     borderRadius: '0.375rem',
//                     width: '36px',
//                   }}
//                   className="d-flex align-items-center justify-content-center"
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
//                     setState((s) => ({ ...s, project_id: '' }));
//                     setCustomerSuggestions([]);
//                   }}
//                   style={{
//                     position: 'absolute',
//                     right: 2,
//                     top: 2,
//                     bottom: 2,
//                     borderRadius: '0.375rem',
//                     width: '36px',
//                   }}
//                   className="d-flex align-items-center justify-content-center"
//                 >
//                   <CIcon icon={cilX} size="sm" />
//                 </CButton>
//               )}
//             </div>

//             {/* Suggestions Dropdown */}
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

//           {/* Vendor */}
//           <CCol md={4}>
//             <CFormLabel className="fw-bold">
//               Vendor <span className="text-danger">*</span>
//             </CFormLabel>
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

//           {/* Material */}
//           <CCol md={4}>
//             <CFormLabel className="fw-bold">
//               Material Name <span className="text-danger">*</span>
//             </CFormLabel>
//             <CFormInput
//               type="text"
//               name="material_name"
//               placeholder="e.g. Cement, Sand"
//               value={state.material_name}
//               onChange={handleChange}
//               required
//             />
//           </CCol>
//         </CRow>

//         {/* === ROW 2: About === */}
//         <CRow className="g-4 mt-3">
//           <CCol md={12}>
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

//         {/* === ROW 3: Price, Qty, Total, Date === */}
//         <CRow className="g-4 mt-3 align-items-end">
//           <CCol md={3}>
//             <CFormLabel className="fw-bold">
//               Price/Unit <span className="text-danger">*</span>
//             </CFormLabel>
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
//             <CFormLabel className="fw-bold">
//               Quantity <span className="text-danger">*</span>
//             </CFormLabel>
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
//             <CFormLabel className="fw-bold">Total</CFormLabel>
//             <CFormInput
//               type="number"
//               value={state.total}
//               readOnly
//               className="total-input"
//             />
//           </CCol>

//           <CCol md={3}>
//             <CFormLabel className="fw-bold">
//               Date <span className="text-danger">*</span>
//             </CFormLabel>
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

//         {/* === FOOTER BUTTONS === */}
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
//               'Submit Purchase'
//             )}
//           </CButton>
//         </CModalFooter>
//       </CForm>

//       {/* Project Selection Modal */}
//       <ProjectSelectionModal
//         visible={showProjectModal}
//         onClose={() => setShowProjectModal(false)}
//         onSelectProject={handleCustomerSelect}
//       />
//     </>
//   );
// };

// export default PurchaseForm;




import React, { useState, useEffect } from 'react';
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
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilSearch, cilX } from '@coreui/icons';
import { postAPICall, getAPICall } from '../../../util/api';
import { useToast } from '../../common/toast/ToastContext';
import ProjectSelectionModal from '../../common/ProjectSelectionModal';

const PurchaseForm = ({ vendors, onSuccess, onCancel, editData = null }) => {
  const { showToast } = useToast();
  const [customerName, setCustomerName] = useState({ name: '', id: null });
  const [customerSuggestions, setCustomerSuggestions] = useState([]);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [loading, setLoading] = useState(false);

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

  // Load edit data if provided
  useEffect(() => {
    if (editData) {
      const gstIncluded = editData.gst_included === 1 || editData.gst_percent > 0;
      const gst = parseFloat(editData.gst_percent) || 18;
      setState({
        project_id: editData.project_id || '',
        vendor_id: editData.vendor_id || '',
        material_name: editData.material_name || '',
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

      // Set project name for display
      if (editData.project) {
        setCustomerName({ name: editData.project.project_name, id: editData.project_id });
      }
    }
  }, [editData]);

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

  // Sync CGST/SGST when GST % changes
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

  // Project search
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

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!state.project_id) return showToast('danger', 'Please select a project');
    if (!state.vendor_id) return showToast('danger', 'Please select a vendor');
    if (!state.material_name.trim()) return showToast('danger', 'Enter material name');
    if (state.price_per_unit <= 0) return showToast('danger', 'Price must be > 0');
    if (state.qty <= 0) return showToast('danger', 'Quantity must be > 0');

    const payload = {
      project_id: parseInt(state.project_id),
      vendor_id: parseInt(state.vendor_id),
      material_name: state.material_name,
      about: state.about || null,
      price_per_unit: parseFloat(state.price_per_unit),
      qty: parseFloat(state.qty),
      total: parseFloat(state.total),
      date: state.date,
      paid_amount: 0,
      gst_included: state.include_gst ? 1 : 0,
      gst_percent: state.include_gst ? parseFloat(state.gst_percent) : 0,
      cgst_percent: state.include_gst ? parseFloat(state.cgst_percent) : 0,
      sgst_percent: state.include_gst ? parseFloat(state.sgst_percent) : 0,
    };

    setLoading(true);
    try {
      if (editData) {
        // If you're editing, send update request (adjust endpoint as needed)
        await postAPICall('/api/updatePurchase', { ...payload, id: editData.id });
        showToast('success', 'Purchase updated successfully!');
      } else {
        await postAPICall('/api/purchesVendor', payload);
        showToast('success', 'Purchase saved successfully!');
      }
      onSuccess();
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
      `}</style>

      <CForm onSubmit={handleSubmit} className="needs-validation p-4">
        {/* Project, Vendor, Material */}
        <CRow className="g-4 align-items-end mb-3">
          <CCol md={4} style={{ position: 'relative' }}>
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
                  onClick={() => { setCustomerName({ name: '', id: null }); setState(s => ({ ...s, project_id: '' })); }}
                  style={{ position: 'absolute', right: 2, top: 2, bottom: 2, width: '36px' }}>
                  <CIcon icon={cilX} size="sm" />
                </CButton>
              )}
            </div>
            {customerSuggestions.length > 0 && (
              <ul className="suggestions-list">
                {customerSuggestions.map((p) => (
                  <li key={p.id} onClick={() => handleCustomerSelect(p)}>{p.project_name}</li>
                ))}
              </ul>
            )}
          </CCol>

          <CCol md={4}>
            <CFormLabel className="fw-bold">Vendor <span className="text-danger">*</span></CFormLabel>
            <select className="form-select" name="vendor_id" value={state.vendor_id} onChange={handleChange} required>
              <option value="">Select Vendor</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </CCol>

          <CCol md={4}>
            <CFormLabel className="fw-bold">Material Name <span className="text-danger">*</span></CFormLabel>
            <CFormInput
              type="text"
              name="material_name"
              placeholder="e.g. Cement, Sand"
              value={state.material_name}
              onChange={handleChange}
              required
            />
          </CCol>
        </CRow>

        <CRow className="g-4 mb-3">
          <CCol md={12}>
            <CFormLabel className="fw-bold">About (optional)</CFormLabel>
            <CFormInput
              type="text"
              name="about"
              placeholder="Enter description..."
              value={state.about}
              onChange={handleChange}
            />
          </CCol>
        </CRow>

        {/* Price, Qty, GST Checkbox, Total */}
        <CRow className="g-4 mb-3 align-items-end">
          <CCol md={3}>
            <CFormLabel className="fw-bold">Price/Unit <span className="text-danger">*</span></CFormLabel>
            <CFormInput
              type="number"
              name="price_per_unit"
              value={state.price_per_unit}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
            />
          </CCol>

          <CCol md={3}>
            <CFormLabel className="fw-bold">Quantity <span className="text-danger">*</span></CFormLabel>
            <CFormInput
              type="number"
              name="qty"
              value={state.qty}
              onChange={handleChange}
              min="0.01"
              step="0.01"
              required
            />
          </CCol>

          <CCol md={3}>
            <CFormLabel className="fw-bold">Include GST?</CFormLabel>
            <CFormCheck
              id="include_gst"
              label="Yes, Add GST"
              checked={state.include_gst}
              onChange={handleChange}
              name="include_gst"
            />
          </CCol>

          <CCol md={3}>
            <CFormLabel className="fw-bold">Total Amount</CFormLabel>
            <CFormInput
              type="number"
              value={state.total}
              readOnly
              className="total-input text-success fw-bold"
            />
          </CCol>
        </CRow>

        {/* GST Details */}
        {state.include_gst && (
          <div className="gst-section mb-4">
            <CRow className="g-3">
              <CCol md={4}>
                <CFormLabel>GST %</CFormLabel>
                <CFormInput
                  type="number"
                  value={state.gst_percent}
                  onChange={handleGstChange}
                  min="0"
                  step="0.01"
                  placeholder="18"
                />
              </CCol>
              <CCol md={4}>
                <CFormLabel>CGST % (auto)</CFormLabel>
                <CFormInput
                  type="text"
                  value={state.cgst_percent}
                  readOnly
                  className="bg-light"
                />
              </CCol>
              <CCol md={4}>
                <CFormLabel>SGST % (auto)</CFormLabel>
                <CFormInput
                  type="text"
                  value={state.sgst_percent}
                  readOnly
                  className="bg-light"
                />
              </CCol>
            </CRow>
            <small className="text-success d-block mt-2 fw-bold">
              GST Amount: ₹{((state.qty * state.price_per_unit * state.gst_percent) / 100).toFixed(2)}
            </small>
          </div>
        )}

        {/* Date */}
        <CRow className="g-4 mb-4">
          <CCol md={4}>
            <CFormLabel className="fw-bold">Date <span className="text-danger">*</span></CFormLabel>
            <CFormInput
              type="date"
              name="date"
              value={state.date}
              onChange={handleChange}
              max={new Date().toISOString().split('T')[0]}
              required
            />
          </CCol>
        </CRow>

        {/* Footer */}
        <CModalFooter className="border-0 pt-4 justify-content-between">
          <div>
            <CButton color="secondary" onClick={handleClear} className="me-2">
              Clear
            </CButton>
            <CButton color="secondary" onClick={onCancel}>
              Cancel
            </CButton>
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

      <ProjectSelectionModal
        visible={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        onSelectProject={handleCustomerSelect}
      />
    </>
  );
};

export default PurchaseForm;