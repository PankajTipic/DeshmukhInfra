
// UpdateDrillingForm.jsx
// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   CCard, CCardBody, CCardHeader, CRow, CCol, CForm, CFormLabel, CFormInput,
//   CFormSelect, CButton, CContainer, CInputGroup, CInputGroupText,
//   CAlert
// } from '@coreui/react';
// import { cilSettings, cilCalculator, cilLocationPin, cilX, cilFile } from '@coreui/icons';
// import CIcon from '@coreui/icons-react';
// import { getAPICall, put } from '../../../util/api';
// import { useParams, useNavigate, useLocation } from 'react-router-dom';
// import Select from 'react-select';
// import { useToast } from '../../common/toast/ToastContext';

// const UpdateDrillingForm = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { showToast } = useToast();
//   const location = useLocation();
//   const drillingRecordId = location.state?.drillingRecordId || id;

//   const [formData, setFormData] = useState({
//     project_id: '',
//     project_name: '',
//     date: '',
//     comp_rpm_start: '',
//     comp_rpm_end: '',
//     machineReading: [{ oprator_id: '', machine_id: '', machine_start: '', machine_end: '', actual_machine_hr: 0 }],
//     workDetails: [{ operator_id: '', work_type: '', work_point: 0, rate: 0, total: 0 }],
//     surveys: [{ operator_id: '', survey_type: '', survey_point: 0, rate: 0, total: 0 }],
//     isGST: false,
//     totalBill: 0,
//   });

//   const [showSuccess, setShowSuccess] = useState(false);
//   const [projects, setProjects] = useState([]);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [operators, setOperators] = useState([]);
//   const [machineries, setMachineries] = useState([]);
//   const [showDropdown, setShowDropdown] = useState(false);

//   const workTypes = ['Drilling', 'Pilling', 'DTH', 'Fencing', 'Casting', 'Casting+Drilling', 'Earthing', 'Compound'];
//   const surveyTypes = ['Drone', 'Topography', 'Boundary', 'Site Survey', 'Progress Survey'];

//   // Helper: safely extract payload data independent of API shape
//   const unwrapApi = (res) => {
//     if (res === null || res === undefined) return res;
//     // If Axios-like response (res.data)
//     if (res?.data !== undefined) {
//       // body could be { message, data }
//       if (res.data?.data !== undefined) return res.data.data;
//       return res.data;
//     }
//     // already body
//     if (res?.data !== undefined) return res.data;
//     return res;
//   };

//   // Fetch existing drilling record and normalize numbers
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const res = await getAPICall(`/api/drilling/${drillingRecordId}`);
//         let data = unwrapApi(res);
//         if (!data) {
//           showToast('danger', 'No data returned from server');
//           return;
//         }

//         // if API returns { message, data } pattern, unwrap
//         if (data?.data) data = data.data;

//         // map machine readings
//         const machineReading = (data.machine_reading || data.machine_readings || []).map((m) => ({
//           oprator_id: m.oprator_id != null ? Number(m.oprator_id) : '',
//           machine_id: m.machine_id != null ? Number(m.machine_id) : '',
//           machine_start: m.machine_start ?? '',
//           machine_end: m.machine_end ?? '',
//           actual_machine_hr: m.actual_machine_hr != null ? Number(m.actual_machine_hr) : 0
//         }));

//         // map work points => use snake_case internal keys to match API mapping
//         const workDetails = (data.work_points || data.work_point_detail || []).map((w) => {
//           const wp = Number(w.work_point || 0);
//           const rate = Number(w.rate || 0);
//           const total = w.total != null ? Number(w.total) : wp * rate;
//           return {
//             operator_id: w.operator_id != null ? Number(w.operator_id) : '',
//             work_type: w.work_type || '',
//             work_point: wp,
//             rate,
//             total
//           };
//         });

//         // map surveys
//         const surveys = (data.surveys || data.survey_detail || []).map((s) => {
//           const sp = Number(s.survey_point || 0);
//           const rate = Number(s.rate || 0);
//           const total = s.total != null ? Number(s.total) : sp * rate;
//           return {
//             operator_id: s.operator_id != null ? Number(s.operator_id) : '',
//             survey_type: s.survey_type || '',
//             survey_point: sp,
//             rate,
//             total
//           };
//         });

//         setFormData((prev) => ({
//           ...prev,
//           project_id: data.project_id != null ? Number(data.project_id) : '',
//           project_name: data.project?.project_name || '',
//           date: data.date || '',
//           comp_rpm_start: data.comp_rpm_start ?? '',
//           comp_rpm_end: data.comp_rpm_end ?? '',
//           machineReading: machineReading.length ? machineReading : prev.machineReading,
//           workDetails: workDetails.length ? workDetails : prev.workDetails,
//           surveys: surveys.length ? surveys : prev.surveys,
//           isGST: data.isGST ?? false,
//           totalBill: data.totalBill != null ? Number(data.totalBill) : prev.totalBill
//         }));

//         // set search display to project name
//         setSearchQuery(data.project?.project_name || '');
//       } catch (err) {
//         console.error('Error fetching drilling data:', err);
//         showToast('danger', 'Failed to fetch existing data!');
//       }
//     };

//     fetchData();
//   }, [drillingRecordId]);

//   // Fetch operators
//   useEffect(() => {
//     getAPICall('/api/operatorsByType')
//       .then((res) => {
//         const arr = unwrapApi(res) || [];
//         setOperators(
//           (Array.isArray(arr) ? arr : []).map((op) => ({ value: op.id, label: op.name || op.label || op.value }))
//         );
//       })
//       .catch((err) => console.error('Error fetching operators:', err));
//   }, []);

//   // Fetch machineries
//   useEffect(() => {
//     getAPICall('/api/machineries')
//       .then((res) => {
//         const payload = unwrapApi(res);
//         const list = Array.isArray(payload) ? payload : (payload?.data || payload || []);
//         setMachineries((Array.isArray(list) ? list : []).map((m) => ({ value: m.id, label: m.machine_name || m.name })));
//       })
//       .catch((err) => console.error('Error fetching machineries:', err));
//   }, []);

//   // Fetch projects (search)
//   const fetchProjects = useCallback(async (query) => {
//     try {
//       const res = await getAPICall(`/api/projects?searchQuery=${encodeURIComponent(query)}`);
//       const payload = unwrapApi(res) || [];
//       setProjects(Array.isArray(payload) ? payload : (payload?.data || []));
//     } catch (error) {
//       console.error('Error fetching projects:', error);
//       setProjects([]);
//     }
//   }, []);

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       if (searchQuery) fetchProjects(searchQuery);
//       else setProjects([]);
//     }, 300);
//     return () => clearTimeout(timer);
//   }, [searchQuery, fetchProjects]);

//   // Derived/computed helpers (do not mutate state)
//   const computeWorkRowTotal = (work) => Number(work.work_point || 0) * Number(work.rate || 0);
//   const computeSurveyRowTotal = (s) => Number(s.survey_point || 0) * Number(s.rate || 0);
//   const workTotalSum = formData.workDetails.reduce((sum, w) => sum + computeWorkRowTotal(w), 0);
//   const surveyTotalSum = formData.surveys.reduce((sum, s) => sum + computeSurveyRowTotal(s), 0);
//   const subtotal = workTotalSum + surveyTotalSum;
//   const totalBillDisplay = formData.isGST ? (subtotal * 1.18) : subtotal;

//   // Compressor hours (derived)
//   const compressorHours = (formData.comp_rpm_end !== '' && formData.comp_rpm_start !== '')
//     ? (parseFloat(formData.comp_rpm_end || 0) - parseFloat(formData.comp_rpm_start || 0)).toFixed(2)
//     : '0.00';

//   const calculateMachineHours = (start, end) => {
//     if (start === '' || end === '') return 0;
//     const diff = parseFloat(end || 0) - parseFloat(start || 0);
//     return diff >= 0 ? Number(diff.toFixed(2)) : 0;
//   };

//   // Handlers
//   const handleInputChange = (field, value) => {
//     setFormData((prev) => ({ ...prev, [field]: value }));
//   };

//   const handleProjectChange = (project) => {
//     setFormData((prev) => ({ ...prev, project_id: Number(project.id), project_name: project.project_name || project.name || '' }));
//     setSearchQuery(project.project_name || project.name || '');
//     setProjects([]);
//     setShowDropdown(false);
//   };

//   const handleMachineReadingChange = (index, field, value) => {
//     setFormData((prev) => {
//       const updated = prev.machineReading.map((r, i) => i === index ? { ...r } : r);
//       updated[index][field] = (field === 'oprator_id' || field === 'machine_id') ? (value === '' ? '' : Number(value)) : value;
//       if (field === 'machine_start' || field === 'machine_end') {
//         updated[index].actual_machine_hr = calculateMachineHours(updated[index].machine_start, updated[index].machine_end);
//       }
//       return { ...prev, machineReading: updated };
//     });
//   };

//   const handleWorkDetailChange = (index, field, value) => {
//     setFormData((prev) => {
//       const updated = prev.workDetails.map((w, i) => i === index ? { ...w } : w);
//       if (field === 'work_point' || field === 'rate' || field === 'operator_id') {
//         updated[index][field] = value === '' ? 0 : (field === 'operator_id' ? Number(value) : Number(value));
//       } else {
//         updated[index][field] = value;
//       }
//       // keep total in state if you want, but UI uses computed total
//       updated[index].total = computeWorkRowTotal(updated[index]);
//       return { ...prev, workDetails: updated };
//     });
//   };

//   const addWorkDetail = () => {
//     setFormData((prev) => ({
//       ...prev,
//       workDetails: [...prev.workDetails, { operator_id: '', work_type: '', work_point: 0, rate: 0, total: 0 }]
//     }));
//   };

//   const removeWorkDetail = (index) => {
//     setFormData((prev) => ({ ...prev, workDetails: prev.workDetails.filter((_, i) => i !== index) }));
//   };

//   const handleSurveyChange = (index, field, value) => {
//     setFormData((prev) => {
//       const updated = prev.surveys.map((s, i) => i === index ? { ...s } : s);
//       if (field === 'survey_point' || field === 'rate' || field === 'operator_id') {
//         updated[index][field] = value === '' ? 0 : (field === 'operator_id' ? Number(value) : Number(value));
//       } else {
//         updated[index][field] = value;
//       }
//       updated[index].total = computeSurveyRowTotal(updated[index]);
//       return { ...prev, surveys: updated };
//     });
//   };

//   const addSurvey = () => {
//     setFormData((prev) => ({
//       ...prev,
//       surveys: [...prev.surveys, { operator_id: '', survey_type: '', survey_point: 0, rate: 0, total: 0 }]
//     }));
//   };

//   const removeSurvey = (index) => {
//     setFormData((prev) => ({ ...prev, surveys: prev.surveys.filter((_, i) => i !== index) }));
//   };

//   // Submit
//   const handleSubmit = async () => {
//     if (!formData.project_id) { showToast('danger', 'Please select a Project.'); return; }
//     if (!formData.date) { showToast('danger', 'Please select a Date.'); return; }

//     // validation (machineReading)
//     for (let i = 0; i < formData.machineReading.length; i++) {
//       const r = formData.machineReading[i];
//       if (r.machine_start && r.machine_end) {
//         if (!r.oprator_id) { showToast('danger', `Row ${i + 1}: Please select an Operator.`); return; }
//         if (!r.machine_id) { showToast('danger', `Row ${i + 1}: Please select a Machinery.`); return; }
//       }
//     }
//     // work details validation
//     for (let i = 0; i < formData.workDetails.length; i++) {
//       const w = formData.workDetails[i];
//       if (w.work_point && w.rate) {
//         if (!w.operator_id) { showToast('danger', `Row ${i + 1} (Work Details): Please select an Operator.`); return; }
//         if (!w.work_type) { showToast('danger', `Row ${i + 1} (Work Details): Please select a Work Type.`); return; }
//       }
//     }
//     // survey validation
//     for (let i = 0; i < formData.surveys.length; i++) {
//       const s = formData.surveys[i];
//       if (s.survey_point && s.rate) {
//         if (!s.operator_id) { showToast('danger', `Row ${i + 1} (Survey Details): Please select an Operator.`); return; }
//         if (!s.survey_type) { showToast('danger', `Row ${i + 1} (Survey Details): Please select a Survey Type.`); return; }
//       }
//     }

//     const payload = {
//       project_id: formData.project_id,
//       date: formData.date,
//       oprator_helper: formData.oprator_helper ?? null,
//       comp_rpm_start: formData.comp_rpm_start,
//       comp_rpm_end: formData.comp_rpm_end,
//       com_actul_hr: Number(compressorHours) || 0,
//       machineReading: formData.machineReading.map((m) => ({
//         oprator_id: m.oprator_id || null,
//         machine_id: m.machine_id || null,
//         machine_start: m.machine_start || null,
//         machine_end: m.machine_end || null,
//         actual_machine_hr: m.actual_machine_hr || 0,
//       })),
//       work_points: formData.workDetails.map((w) => ({
//         operator_id: w.operator_id || null,
//         work_type: w.work_type || '',
//         work_point: w.work_point || 0,
//         rate: w.rate || 0,
//         total: computeWorkRowTotal(w)
//       })),
//       surveys: formData.surveys.map((s) => ({
//         operator_id: s.operator_id || null,
//         survey_type: s.survey_type || '',
//         survey_point: s.survey_point || 0,
//         rate: s.rate || 0,
//         total: computeSurveyRowTotal(s)
//       })),
//       isGST: formData.isGST,
//       totalBill: totalBillDisplay
//     };

//     try {
//       await put(`/api/drilling/${drillingRecordId}`, payload);
//       setShowSuccess(true);
//       setTimeout(() => setShowSuccess(false), 3000);
//       navigate('/infraDetailsShowTable');
//     } catch (error) {
//       console.error('Error updating data', error);
//       showToast('danger', 'Error updating data');
//     }
//   };

//   return (
//     <CContainer fluid>
//       {showSuccess && (
//         <CAlert color="success" dismissible onClose={() => setShowSuccess(false)}>
//           Form updated successfully!
//         </CAlert>
//       )}

//       <CCard>
//         <CCardHeader className="bg-primary text-white">
//           <h1 className="h4 mb-0 d-flex align-items-center">
//             <CIcon icon={cilSettings} className="me-2" /> Update Drilling Record
//           </h1>
//         </CCardHeader>

//         <CCardBody className="p-4">
//           <CForm>
//             {/* Project Info */}
//             <CCard className="mb-4 border-0" color="info" textColor="dark">
//               <CCardBody className="bg-info-subtle rounded rounded-lg">
//                 <h5 className="text-info mb-3 d-flex align-items-center">
//                   <CIcon icon={cilFile} className="me-2" /> 1. Project Information
//                 </h5>
//                 <CRow className="g-3">
//                   <CCol md={6}>
//                     <CFormLabel>Project Name *</CFormLabel>
//                     <CInputGroup>
//                       <CFormInput
//                         type="text"
//                         value={searchQuery}
//                         onChange={(e) => {
//                           setSearchQuery(e.target.value);
//                           setShowDropdown(true);
//                         }}
//                         placeholder="Search for a project..."
//                       />
//                       {formData.project_name && (
//                         <CButton
//                           type="button"
//                           color="danger"
//                           variant="outline"
//                           onClick={() => {
//                             setFormData((prev) => ({ ...prev, project_name: '' }));
//                             setSearchQuery('');
//                             setShowDropdown(false);
//                           }}
//                         >
//                           ✕
//                         </CButton>
//                       )}
//                     </CInputGroup>

//                     {showDropdown && projects.length > 0 && (
//                       <div className="border rounded bg-white" style={{ maxHeight: '150px', overflowY: 'auto' }}>
//                         {projects.map((project) => (
//                           <div
//                             key={project.id}
//                             className="p-2 hover-bg-light"
//                             style={{ cursor: 'pointer' }}
//                             onClick={() => handleProjectChange(project)}
//                           >
//                             {project.project_name || project.name}
//                           </div>
//                         ))}
//                       </div>
//                     )}
//                   </CCol>

//                   <CCol md={6}>
//                     <CFormLabel>Date *</CFormLabel>
//                     <CFormInput type="date" value={formData.date} onChange={(e) => handleInputChange('date', e.target.value)} />
//                   </CCol>
//                 </CRow>
//               </CCardBody>
//             </CCard>

//             {/* Machine Usage */}
//             <CCard className="mb-4 border-0" color="success" textColor="dark">
//               <CCardBody className="bg-success-subtle rounded rounded-lg">
//                 <div className="d-flex justify-content-between align-items-center mb-3">
//                   <h5 className="text-success mb-3 d-flex align-items-center">
//                     <CIcon icon={cilSettings} className="me-2" /> 2. Machine Usage
//                   </h5>
//                   <CButton
//                     color="success"
//                     variant="outline"
//                     type="button"
//                     size="md"
//                     className="d-flex align-items-center"
//                     onClick={() =>
//                       setFormData((prev) => ({
//                         ...prev,
//                         machineReading: [...prev.machineReading, { oprator_id: '', machine_id: '', machine_start: '', machine_end: '', actual_machine_hr: 0 }]
//                       }))
//                     }
//                   >
//                     Add Machine Reading
//                   </CButton>
//                 </div>

//                 <CRow className="g-1">
//                   {formData.machineReading.map((reading, index) => (
//                     <CRow className="mb-2 gx-1" key={index}>
//                       <CCol xs={12} md={3} className="p-1">
//                         <CFormLabel>Operator / Helper *</CFormLabel>
//                         <Select
//                           options={operators}
//                           isSearchable
//                           placeholder="Select Operator..."
//                           value={operators.find((op) => op.value === reading.oprator_id) || null}
//                           onChange={(selected) => handleMachineReadingChange(index, 'oprator_id', selected ? selected.value : '')}
//                         />
//                       </CCol>

//                       <CCol xs={12} md={2} className="p-1">
//                         <CFormLabel>Machinery *</CFormLabel>
//                         <Select
//                           options={machineries}
//                           isSearchable
//                           placeholder="Machinery"
//                           value={machineries.find((m) => m.value === reading.machine_id) || null}
//                           onChange={(selected) => handleMachineReadingChange(index, 'machine_id', selected ? selected.value : '')}
//                         />
//                       </CCol>

//                       <CCol xs={12} sm={6} md={2} className="p-1">
//                         <CFormLabel>Machine Start</CFormLabel>
//                         <CFormInput
//                           type="text"
//                           inputMode="numeric"
//                           pattern="[0-9.:]*"
//                           value={reading.machine_start === 0 ? '' : reading.machine_start}
//                           placeholder="0"
//                           onChange={(e) => {
//                             let val = e.target.value.replace(/[^0-9.:]/g, '');
//                             handleMachineReadingChange(index, 'machine_start', val === '' ? '' : val);
//                           }}
//                         />
//                       </CCol>

//                       <CCol xs={12} sm={6} md={2} className="p-1">
//                         <CFormLabel>Machine End</CFormLabel>
//                         <CFormInput
//                           type="text"
//                           inputMode="numeric"
//                           pattern="[0-9.:]*"
//                           value={reading.machine_end === 0 ? '' : reading.machine_end}
//                           placeholder="0"
//                           onChange={(e) => {
//                             let val = e.target.value.replace(/[^0-9.:]/g, '');
//                             handleMachineReadingChange(index, 'machine_end', val === '' ? '' : val);
//                           }}
//                         />
//                       </CCol>

//                       <CCol xs={12} sm={6} md={2} className="p-1">
//                         <CFormLabel>Actual Hours</CFormLabel>
//                         <CInputGroup>
//                           <CFormInput type="text" value={String(reading.actual_machine_hr ?? 0)} readOnly />
//                           <CInputGroupText>hrs</CInputGroupText>
//                         </CInputGroup>
//                       </CCol>

//                       <CCol xs={12} sm={6} md={1} className="d-flex align-items-center mt-4 p-1">
//                         {formData.machineReading.length > 1 && (
//                           <CButton
//                             color="danger"
//                             variant="ghost"
//                             size="lg"
//                             onClick={() => setFormData((prev) => ({ ...prev, machineReading: prev.machineReading.filter((_, i) => i !== index) }))}
//                           >
//                             <CIcon icon={cilX} />
//                           </CButton>
//                         )}
//                       </CCol>
//                     </CRow>
//                   ))}

//                   <CCol xs={12} sm={6} md={5} className="p-1">
//                     <CFormLabel>Compressor Start *</CFormLabel>
//                     <CFormInput
//                       type="text"
//                       inputMode="numeric"
//                       pattern="[0-9.:]*"
//                       value={formData.comp_rpm_start === 0 ? '' : formData.comp_rpm_start}
//                       placeholder="0"
//                       onChange={(e) => {
//                         let val = e.target.value.replace(/[^0-9.:]/g, '');
//                         handleInputChange('comp_rpm_start', val === '' ? '' : val);
//                       }}
//                     />
//                   </CCol>

//                   <CCol xs={12} sm={6} md={4} className="p-1">
//                     <CFormLabel>Compressor End *</CFormLabel>
//                     <CFormInput
//                       type="text"
//                       inputMode="numeric"
//                       pattern="[0-9.:]*"
//                       value={formData.comp_rpm_end === 0 ? '' : formData.comp_rpm_end}
//                       placeholder="0"
//                       onChange={(e) => {
//                         let val = e.target.value.replace(/[^0-9.:]/g, '');
//                         handleInputChange('comp_rpm_end', val === '' ? '' : val);
//                       }}
//                     />
//                   </CCol>

//                   <CCol xs={12} sm={6} md={2} className="p-1">
//                     <CFormLabel>Compressor Hours</CFormLabel>
//                     <CInputGroup>
//                       <CFormInput value={String(compressorHours)} readOnly className="bg-light fw-bold" />
//                       <CInputGroupText>hrs</CInputGroupText>
//                     </CInputGroup>
//                   </CCol>
//                 </CRow>
//               </CCardBody>
//             </CCard>

//             {/* Work Details */}
//             <CCard className="mb-4 border-0" color="warning" textColor="dark">
//               <CCardBody className="bg-warning-subtle rounded rounded-lg">
//                 <div className="d-flex justify-content-between align-items-center mb-3">
//                   <h5 className="text-warning mb-0 d-flex align-items-center">
//                     <CIcon icon={cilCalculator} className="me-2" /> 3. Work Details
//                   </h5>
//                   <CButton color="warning" variant="outline" onClick={addWorkDetail}>Add Work</CButton>
//                 </div>

//                 {formData.workDetails.map((work, index) => (
//                   <CRow key={index} className="align-items-center mb-2">
//                     <CCol md={3}>
//                       <CFormLabel>Operator</CFormLabel>
//                       <Select
//                         options={operators}
//                         isSearchable
//                         placeholder="Select Operator..."
//                         value={operators.find((op) => op.value === work.operator_id) || null}
//                         onChange={(selected) => handleWorkDetailChange(index, 'operator_id', selected ? selected.value : '')}
//                       />
//                     </CCol>

//                     <CCol lg={2}>
//                       <CFormLabel>Work Type</CFormLabel>
//                       <CFormSelect value={work.work_type} onChange={(e) => handleWorkDetailChange(index, 'work_type', e.target.value)}>
//                         <option value="">Select Work Type</option>
//                         {workTypes.map((type) => (<option key={type} value={type}>{type}</option>))}
//                       </CFormSelect>
//                     </CCol>

//                     <CCol lg={2}>
//                       <CFormLabel>Points</CFormLabel>
//                       <CFormInput
//                         type="text"
//                         inputMode="numeric"
//                         pattern="[0-9]*"
//                         value={work.work_point === 0 ? '' : String(work.work_point)}
//                         placeholder="0"
//                         onChange={(e) => {
//                           let val = e.target.value.replace(/\D/g, '');
//                           handleWorkDetailChange(index, 'work_point', val === '' ? 0 : Number(val));
//                         }}
//                       />
//                     </CCol>

//                     <CCol lg={2}>
//                       <CFormLabel>Rate</CFormLabel>
//                       <CInputGroup>
//                         <CInputGroupText>₹</CInputGroupText>
//                         <CFormInput
//                           type="text"
//                           inputMode="numeric"
//                           pattern="[0-9]*"
//                           value={work.rate === 0 ? '' : String(work.rate)}
//                           placeholder="0"
//                           onChange={(e) => {
//                             let val = e.target.value.replace(/\D/g, '');
//                             handleWorkDetailChange(index, 'rate', val === '' ? 0 : Number(val));
//                           }}
//                         />
//                       </CInputGroup>
//                     </CCol>

//                     <CCol lg={2}>
//                       <CFormLabel>Total</CFormLabel>
//                       <CInputGroup>
//                         <CInputGroupText>₹</CInputGroupText>
//                         <CFormInput value={(computeWorkRowTotal(work)).toFixed(2)} readOnly className="bg-light fw-bold" />
//                       </CInputGroup>
//                     </CCol>

//                     <CCol lg={1}>
//                       {formData.workDetails.length > 1 && (
//                         <CButton color="danger" variant="ghost" size="sm" onClick={() => removeWorkDetail(index)}>
//                           <CIcon icon={cilX} />
//                         </CButton>
//                       )}
//                     </CCol>
//                   </CRow>
//                 ))}

//               </CCardBody>
//             </CCard>

//             {/* Survey Details */}
//             <CCard className="mb-4 border-0" color="info" textColor="dark">
//               <CCardBody className="bg-info-subtle rounded rounded-lg">
//                 <div className="d-flex justify-content-between align-items-center mb-3">
//                   <h5 className="text-info mb-0 d-flex align-items-center">
//                     <CIcon icon={cilLocationPin} className="me-2" /> 4. Survey Details
//                   </h5>
//                   <CButton color="info" variant="outline" onClick={addSurvey}>Add Survey</CButton>
//                 </div>

//                 {formData.surveys.map((survey, index) => (
//                   <CRow key={index} className="align-items-center mb-2">
//                     <CCol md={3}>
//                       <CFormLabel>Operator</CFormLabel>
//                       <Select
//                         options={operators}
//                         isSearchable
//                         placeholder="Select Operator..."
//                         value={operators.find((op) => op.value === survey.operator_id) || null}
//                         onChange={(selected) => handleSurveyChange(index, 'operator_id', selected ? selected.value : '')}
//                       />
//                     </CCol>

//                     <CCol lg={2}>
//                       <CFormLabel>Survey Type</CFormLabel>
//                       <CFormSelect value={survey.survey_type} onChange={(e) => handleSurveyChange(index, 'survey_type', e.target.value)}>
//                         <option value="">Select Survey Type</option>
//                         {surveyTypes.map((type) => (<option key={type} value={type}>{type}</option>))}
//                       </CFormSelect>
//                     </CCol>

//                     <CCol lg={2}>
//                       <CFormLabel>Points</CFormLabel>
//                       <CFormInput
//                         type="text"
//                         inputMode="numeric"
//                         pattern="[0-9]*"
//                         value={survey.survey_point === 0 ? '' : String(survey.survey_point)}
//                         placeholder="0"
//                         onChange={(e) => {
//                           let val = e.target.value.replace(/\D/g, '');
//                           handleSurveyChange(index, 'survey_point', val === '' ? 0 : Number(val));
//                         }}
//                       />
//                     </CCol>

//                     <CCol lg={2}>
//                       <CFormLabel>Rate</CFormLabel>
//                       <CInputGroup>
//                         <CInputGroupText>₹</CInputGroupText>
//                         <CFormInput
//                           type="text"
//                           inputMode="numeric"
//                           pattern="[0-9]*"
//                           value={survey.rate === 0 ? '' : String(survey.rate)}
//                           placeholder="0"
//                           onChange={(e) => {
//                             let val = e.target.value.replace(/\D/g, '');
//                             handleSurveyChange(index, 'rate', val === '' ? 0 : Number(val));
//                           }}
//                         />
//                       </CInputGroup>
//                     </CCol>

//                     <CCol lg={2}>
//                       <CFormLabel>Total</CFormLabel>
//                       <CInputGroup>
//                         <CInputGroupText>₹</CInputGroupText>
//                         <CFormInput value={(computeSurveyRowTotal(survey)).toFixed(2)} readOnly className="bg-light fw-bold" />
//                       </CInputGroup>
//                     </CCol>

//                     <CCol lg={1}>
//                       {formData.surveys.length > 1 && (
//                         <CButton color="danger" variant="ghost" size="sm" onClick={() => removeSurvey(index)}>
//                           <CIcon icon={cilX} />
//                         </CButton>
//                       )}
//                     </CCol>
//                   </CRow>
//                 ))}

//               </CCardBody>
//             </CCard>

//             {/* Submit */}
//             <div className="d-flex justify-content-center">
//               <CButton color="danger" size="lg" className="px-5 d-flex align-items-center" onClick={handleSubmit}>
//                 <CIcon icon={cilFile} className="me-2" /> Update
//               </CButton>
//             </div>

//           </CForm>
//         </CCardBody>
//       </CCard>
//     </CContainer>
//   );
// };

// export default UpdateDrillingForm;









import React, { useState, useEffect, useCallback } from 'react';
import {
  CCard, CCardBody, CCardHeader, CRow, CCol, CForm, CFormLabel, CFormInput,
  CFormSelect, CButton, CContainer, CInputGroup, CInputGroupText,
  CAlert
} from '@coreui/react';
import { cilSettings, cilCalculator, cilLocationPin, cilX, cilFile } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import { getAPICall, put } from '../../../util/api';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Select from 'react-select';
import { useToast } from '../../common/toast/ToastContext';

const UpdateDrillingForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const location = useLocation();
  const drillingRecordId = location.state?.drillingRecordId || id;

  const [formData, setFormData] = useState({
    project_id: '',
    project_name: '',
    date: '',
    start_time: '',
    end_time: '',
    break_time: '',
    net_hours: 0,
    machineReading: [{ oprator_id: '', machine_id: '', machine_start: '', machine_end: '', actual_machine_hr: 0, diesel_filled: '', diesel_used: '', diesel_balance: '', diesel_avg: 0, old_diesel_used: 0, old_diesel_filled: 0 }],
    compressorReading: [{ oprator_id: '', machine_id: '', comp_rpm_start: '', comp_rpm_end: '', com_actul_hr: 0, diesel_filled: '', diesel_used: '', diesel_balance: '', diesel_avg: 0, old_diesel_used: 0, old_diesel_filled: 0 }],
    workDetails: [{ operator_id: '', work_type: '', drilling_type: '', uom: '', work_point: 0, rate: 0, total: 0, hrs: '', diesel: '' }],
    surveys: [{ operator_id: '', survey_type: '', uom: '', survey_point: 0, rate: 0, total: 0, hrs: '', diesel: '' }],
    isGST: false,
    totalBill: 0,
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [operators, setOperators] = useState([]);
  const [machineries, setMachineries] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [workTypes, setWorkTypes] = useState([]);
  const [surveyTypes, setSurveyTypes] = useState([]);
  const [uoms, setUoms] = useState([]);
  const [customBreak, setCustomBreak] = useState(false);

  // Helper: safely extract payload data independent of API shape
  const unwrapApi = (res) => {
    if (res === null || res === undefined) return res;
    // If Axios-like response (res.data)
    if (res?.data !== undefined) {
      // body could be { message, data }
      if (res.data?.data !== undefined) return res.data.data;
      return res.data;
    }
    // already body
    if (res?.data !== undefined) return res.data;
    return res;
  };

  // Fetch existing drilling record and normalize numbers
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getAPICall(`/api/drilling/${drillingRecordId}`);
        let data = unwrapApi(res);
        if (!data) {
          showToast('danger', 'No data returned from server');
          return;
        }

        // if API returns { message, data } pattern, unwrap
        if (data?.data) data = data.data;

        // If this is a Rotary record, redirect to WorkLog Rotary edit tab
        if (data.tab_type === 'rotary' || (data.rotary_details && data.rotary_details.length > 0) || (data.rotaryDetails && data.rotaryDetails.length > 0)) {
          navigate(`/worklog?id=${drillingRecordId}&tab=rotary`, {
            state: { id: drillingRecordId, editId: drillingRecordId, tab: 'rotary' },
            replace: true,
          });
          return;
        }

        // map machine readings
        const machineReading = (data.machine_reading || data.machine_readings || []).map((m) => ({
          oprator_id: m.oprator_id != null ? Number(m.oprator_id) : '',
          machine_id: m.machine_id != null ? Number(m.machine_id) : '',
          machine_start: m.machine_start ?? '',
          machine_end: m.machine_end ?? '',
          actual_machine_hr: m.actual_machine_hr != null ? Number(m.actual_machine_hr) : 0,
          diesel_filled: m.diesel_filled ?? '',
          diesel_used: m.diesel_used ?? '',
          diesel_balance: m.diesel_balance ?? '',
          diesel_avg: m.diesel_avg ?? 0,
          old_diesel_used: m.diesel_used != null ? parseFloat(m.diesel_used) : 0,
          old_diesel_filled: m.diesel_filled != null ? parseFloat(m.diesel_filled) : 0,
        }));

        // map compressor readings
        const compressorReading = (data.compressor_rpm || []).map((c) => ({
          oprator_id: c.oprator_id != null ? Number(c.oprator_id) : '',
          machine_id: c.machine_id != null ? Number(c.machine_id) : '',
          comp_rpm_start: c.comp_rpm_start ?? '',
          comp_rpm_end: c.comp_rpm_end ?? '',
          com_actul_hr: c.com_actul_hr != null ? Number(c.com_actul_hr) : 0,
          diesel_filled: c.diesel_filled ?? '',
          diesel_used: c.diesel_used ?? '',
          diesel_balance: c.diesel_balance ?? '',
          diesel_avg: c.diesel_avg ?? 0,
          old_diesel_used: c.diesel_used != null ? parseFloat(c.diesel_used) : 0,
          old_diesel_filled: c.diesel_filled != null ? parseFloat(c.diesel_filled) : 0,
        }));

        // map work points
        const workDetails = (data.work_points || data.work_point_detail || []).map((w) => {
          const wp = Number(w.work_point || 0);
          const rate = Number(w.rate || 0);
          const total = w.total != null ? Number(w.total) : wp * rate;
          return {
            operator_id: w.operator_id != null ? Number(w.operator_id) : '',
            work_type: w.work_type || '',
            drilling_type: w.drilling_type || '',
            uom: w.uom || '',
            work_point: wp,
            rate,
            total,
            hrs: w.hrs ?? '',
            diesel: w.diesel ?? '',
          };
        });

        // map surveys
        const surveys = (data.surveys || data.survey_detail || []).map((s) => {
          const sp = Number(s.survey_point || 0);
          const rate = Number(s.rate || 0);
          const total = s.total != null ? Number(s.total) : sp * rate;
          return {
            operator_id: s.operator_id != null ? Number(s.operator_id) : '',
            survey_type: s.survey_type || '',
            uom: s.uom || '',
            survey_point: sp,
            rate,
            total,
            hrs: s.hrs ?? '',
            diesel: s.diesel ?? '',
          };
        });

        setFormData((prev) => ({
          ...prev,
          project_id: data.project_id != null ? Number(data.project_id) : '',
          project_name: data.project?.project_name || '',
          date: data.date || '',
          start_time: data.start_time ?? '',
          end_time: data.end_time ?? '',
          break_time: data.break_time ?? '',
          net_hours: data.net_hours != null ? Number(data.net_hours) : 0,
          machineReading: machineReading.length ? machineReading : prev.machineReading,
          compressorReading: compressorReading.length ? compressorReading : prev.compressorReading,
          workDetails: workDetails.length ? workDetails : prev.workDetails,
          surveys: surveys.length ? surveys : prev.surveys,
          isGST: data.isGST ?? false,
          totalBill: data.totalBill != null ? Number(data.totalBill) : prev.totalBill
        }));

        // set search display to project name
        setSearchQuery(data.project?.project_name || '');
      } catch (err) {
        console.error('Error fetching drilling data:', err);
        showToast('danger', 'Failed to fetch existing data!');
      }
    };

    fetchData();
  }, [drillingRecordId]);

  // Fetch operators
  useEffect(() => {
    getAPICall('/api/operatorsByType')
      .then((res) => {
        const arr = unwrapApi(res) || [];
        setOperators(
          (Array.isArray(arr) ? arr : []).map((op) => ({ value: op.id, label: op.name || op.label || op.value }))
        );
      })
      .catch((err) => console.error('Error fetching operators:', err));
  }, []);

  // Fetch machineries
  useEffect(() => {
    getAPICall('/api/machineries')
      .then((res) => {
        const payload = unwrapApi(res);
        const list = Array.isArray(payload) ? payload : (payload?.data || payload || []);
        setMachineries((Array.isArray(list) ? list : []).map((m) => ({ 
          value: m.id, 
          label: m.machine_name || m.name,
          diesel_balance: m.diesel_balance || 0 
        })));
      })
      .catch((err) => console.error('Error fetching machineries:', err));
  }, []);

  // Fetch Work Types, Survey Types, UOMs
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const [wt, st, um] = await Promise.all([
          getAPICall('/api/work-types'),
          getAPICall('/api/survey-types'),
          getAPICall('/api/uoms'),
        ]);
        setWorkTypes(wt || []);
        setSurveyTypes(st || []);
        setUoms(um || []);
      } catch (err) {
        console.error('Error fetching types/uoms:', err);
      }
    };
    fetchTypes();
  }, []);

  // Fetch projects (search)
  const fetchProjects = useCallback(async (query) => {
    try {
      const res = await getAPICall(`/api/projects?searchQuery=${encodeURIComponent(query)}`);
      const payload = unwrapApi(res) || [];
      setProjects(Array.isArray(payload) ? payload : (payload?.data || []));
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) fetchProjects(searchQuery);
      else setProjects([]);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchProjects]);

  // Derived/computed helpers (do not mutate state)
  const computeWorkRowTotal = (work) => Number(work.work_point || 0) * Number(work.rate || 0);
  const computeSurveyRowTotal = (s) => Number(s.survey_point || 0) * Number(s.rate || 0);
  const workTotalSum = formData.workDetails.reduce((sum, w) => sum + computeWorkRowTotal(w), 0);
  const surveyTotalSum = formData.surveys.reduce((sum, s) => sum + computeSurveyRowTotal(s), 0);
  const subtotal = workTotalSum + surveyTotalSum;
  const totalBillDisplay = formData.isGST ? (subtotal * 1.18) : subtotal;

  const calculateMachineHours = (start, end) => {
    if (start === '' || end === '') return 0;
    const diff = parseFloat(end || 0) - parseFloat(start || 0);
    return diff >= 0 ? Number(diff.toFixed(2)) : 0;
  };

  const calculateCompressorHours = (start, end) => {
    if (start === '' || end === '') return 0;
    const diff = parseFloat(end || 0) - parseFloat(start || 0);
    return diff >= 0 ? Number(diff.toFixed(2)) : 0;
  };

  // Convert "HH:mm" time string to total minutes
  const timeToMinutes = (timeStr) => {
    if (!timeStr) return null;
    const parts = String(timeStr).split(':');
    if (parts.length < 2) return null;
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (isNaN(h) || isNaN(m)) return null;
    return h * 60 + m;
  };

  // Parse any break/lunch duration to minutes (e.g. "00:30", "00:45", "30", "45", "30 min", "1 hr", "01:00")
  const parseBreakTimeToMinutes = (val) => {
    if (val === null || val === undefined || val === '') return 0;
    const str = String(val).trim().toLowerCase();
    if (!str || str === '0' || str === '00:00' || str === '00:00:00') return 0;

    if (str.includes(':')) {
      const parts = str.split(':');
      const h = parseInt(parts[0], 10) || 0;
      const m = parseInt(parts[1], 10) || 0;
      return h * 60 + m;
    }

    if (str.includes('min') || str.includes('m')) {
      const num = parseFloat(str.replace(/[^0-9.]/g, ''));
      return isNaN(num) ? 0 : num;
    }

    if (str.includes('hr') || str.includes('h')) {
      const num = parseFloat(str.replace(/[^0-9.]/g, ''));
      return isNaN(num) ? 0 : Math.round(num * 60);
    }

    const num = parseFloat(str);
    if (!isNaN(num)) {
      if (num < 5 && str.includes('.')) {
        return Math.round(num * 60);
      }
      return num;
    }
    return 0;
  };

  // Format net hours e.g. 8.5 -> "(8h 30m)"
  const formatNetHoursDuration = (netHours) => {
    if (!netHours || isNaN(netHours) || netHours <= 0) return '';
    const totalMinutes = Math.round(Number(netHours) * 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    if (h > 0 && m > 0) return `(${h}h ${m}m)`;
    if (h > 0) return `(${h}h)`;
    return `(${m}m)`;
  };

  // Normalize break_time to standard "HH:mm" if matching known presets, or return as-is
  const normalizeBreakValue = (val) => {
    if (!val || val === '0' || val === '00:00' || val === '00:00:00') return '00:00';
    const s = String(val).trim();
    if (s === '30' || s === '00:30' || s === '00:30:00') return '00:30';
    if (s === '45' || s === '00:45' || s === '00:45:00') return '00:45';
    if (s === '60' || s === '01:00' || s === '01:00:00') return '01:00';
    if (s === '15' || s === '00:15' || s === '00:15:00') return '00:15';
    if (s === '75' || s === '01:15' || s === '01:15:00') return '01:15';
    if (s === '90' || s === '01:30' || s === '01:30:00') return '01:30';
    if (s === '120' || s === '02:00' || s === '02:00:00') return '02:00';
    if (/^\d{2}:\d{2}:\d{2}$/.test(s)) return s.substring(0, 5);
    return s;
  };

  // Calculate Net Working Hours: (End Time - Start Time) - (Break / Lunch)
  const calculateNetWorkingHours = (startTime, endTime, breakTime) => {
    const startMins = timeToMinutes(startTime);
    const endMins = timeToMinutes(endTime);
    if (startMins === null || endMins === null) return 0;

    let totalMins = endMins - startMins;
    if (totalMins < 0) {
      totalMins += 24 * 60;
    }

    const breakMins = parseBreakTimeToMinutes(breakTime);
    const netMins = Math.max(0, totalMins - breakMins);
    return parseFloat((netMins / 60).toFixed(2));
  };

  const handleWorkTimingChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      updated.net_hours = calculateNetWorkingHours(
        updated.start_time,
        updated.end_time,
        updated.break_time
      );
      return updated;
    });
  };

  // Handlers
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleProjectChange = (project) => {
    setFormData((prev) => ({ ...prev, project_id: Number(project.id), project_name: project.project_name || project.name || '' }));
    setSearchQuery(project.project_name || project.name || '');
    setProjects([]);
    setShowDropdown(false);
  };

  // Sequential cascade recalculation for Edit Form
  const recalculateAllReadings = (readingsState, machineriesList) => {
    const machineBaselines = {};

    // Restore baseline before this record was saved
    (readingsState.machineReading || []).forEach(r => {
      if (r.machine_id) {
        const id = String(r.machine_id);
        if (!(id in machineBaselines)) {
          const found = (machineriesList || []).find(m => String(m.value) === id);
          machineBaselines[id] = found ? parseFloat(found.diesel_balance) || 0 : 0;
        }
        machineBaselines[id] += (parseFloat(r.old_diesel_used) || 0) - (parseFloat(r.old_diesel_filled) || 0);
      }
    });

    (readingsState.compressorReading || []).forEach(r => {
      if (r.machine_id) {
        const id = String(r.machine_id);
        if (!(id in machineBaselines)) {
          const found = (machineriesList || []).find(m => String(m.value) === id);
          machineBaselines[id] = found ? parseFloat(found.diesel_balance) || 0 : 0;
        }
        machineBaselines[id] += (parseFloat(r.old_diesel_used) || 0) - (parseFloat(r.old_diesel_filled) || 0);
      }
    });

    const runningBalances = { ...machineBaselines };

    const processRow = (row, hrField) => {
      const mId = row.machine_id ? String(row.machine_id) : '';
      const filled = parseFloat(row.diesel_filled) || 0;
      const used = parseFloat(row.diesel_used) || 0;
      const hrs = parseFloat(row[hrField]) || 0;
      const avg = (hrs > 0 && used > 0) ? parseFloat((used / hrs).toFixed(2)) : 0;

      let bal = 0;
      if (mId) {
        if (!(mId in runningBalances)) {
          const found = (machineriesList || []).find(m => String(m.value) === mId);
          runningBalances[mId] = found ? parseFloat(found.diesel_balance) || 0 : 0;
        }
        runningBalances[mId] = runningBalances[mId] + filled - used;
        bal = parseFloat(runningBalances[mId].toFixed(2));
      }

      return {
        ...row,
        diesel_balance: bal,
        diesel_avg: avg,
      };
    };

    const newMR = (readingsState.machineReading || []).map(r => processRow(r, 'actual_machine_hr'));
    const newCR = (readingsState.compressorReading || []).map(r => processRow(r, 'com_actul_hr'));

    return {
      ...readingsState,
      machineReading: newMR,
      compressorReading: newCR,
    };
  };

  const handleMachineReadingChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = prev.machineReading.map((r, i) => i === index ? { ...r } : r);
      updated[index][field] = (field === 'oprator_id' || field === 'machine_id') ? (value === '' ? '' : Number(value)) : value;

      if (field === 'machine_start' || field === 'machine_end') {
        updated[index].actual_machine_hr = calculateMachineHours(updated[index].machine_start, updated[index].machine_end);
      }

      const nextState = { ...prev, machineReading: updated };
      return recalculateAllReadings(nextState, machineries);
    });
  };

  const handleCompressorChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = prev.compressorReading.map((r, i) => i === index ? { ...r } : r);
      updated[index][field] = (field === 'oprator_id' || field === 'machine_id') ? (value === '' ? '' : Number(value)) : value;

      if (field === 'comp_rpm_start' || field === 'comp_rpm_end') {
        updated[index].com_actul_hr = calculateCompressorHours(updated[index].comp_rpm_start, updated[index].comp_rpm_end);
      }

      const nextState = { ...prev, compressorReading: updated };
      return recalculateAllReadings(nextState, machineries);
    });
  };

  const addMachineReading = () => {
    setFormData((prev) => {
      const nextState = {
        ...prev,
        machineReading: [...prev.machineReading, { oprator_id: '', machine_id: '', machine_start: '', machine_end: '', actual_machine_hr: 0, diesel_filled: '', diesel_used: '', diesel_balance: '', diesel_avg: 0, old_diesel_used: 0, old_diesel_filled: 0 }]
      };
      return recalculateAllReadings(nextState, machineries);
    });
  };

  const removeMachineReading = (index) => {
    setFormData((prev) => {
      const nextState = { ...prev, machineReading: prev.machineReading.filter((_, i) => i !== index) };
      return recalculateAllReadings(nextState, machineries);
    });
  };

  const addCompressorReading = () => {
    setFormData((prev) => {
      const nextState = {
        ...prev,
        compressorReading: [...prev.compressorReading, { oprator_id: '', machine_id: '', comp_rpm_start: '', comp_rpm_end: '', com_actul_hr: 0, diesel_filled: '', diesel_used: '', diesel_balance: '', diesel_avg: 0, old_diesel_used: 0, old_diesel_filled: 0 }]
      };
      return recalculateAllReadings(nextState, machineries);
    });
  };

  const removeCompressorReading = (index) => {
    setFormData((prev) => {
      const nextState = { ...prev, compressorReading: prev.compressorReading.filter((_, i) => i !== index) };
      return recalculateAllReadings(nextState, machineries);
    });
  };


  const handleWorkDetailChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = prev.workDetails.map((w, i) => i === index ? { ...w } : w);
      if (field === 'work_point' || field === 'rate' || field === 'operator_id') {
        updated[index][field] = value === '' ? 0 : (field === 'operator_id' ? Number(value) : Number(value));
      } else {
        updated[index][field] = value;
      }
      updated[index].total = computeWorkRowTotal(updated[index]);
      return { ...prev, workDetails: updated };
    });
  };

  const addWorkDetail = () => {
    setFormData((prev) => ({
      ...prev,
      workDetails: [...prev.workDetails, { operator_id: '', work_type: '', drilling_type: '', uom: '', work_point: 0, rate: 0, total: 0, hrs: '', diesel: '' }]
    }));
  };

  const removeWorkDetail = (index) => {
    setFormData((prev) => ({ ...prev, workDetails: prev.workDetails.filter((_, i) => i !== index) }));
  };

  const handleSurveyChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = prev.surveys.map((s, i) => i === index ? { ...s } : s);
      if (field === 'survey_point' || field === 'rate' || field === 'operator_id') {
        updated[index][field] = value === '' ? 0 : (field === 'operator_id' ? Number(value) : Number(value));
      } else {
        updated[index][field] = value;
      }
      updated[index].total = computeSurveyRowTotal(updated[index]);
      return { ...prev, surveys: updated };
    });
  };

  const addSurvey = () => {
    setFormData((prev) => ({
      ...prev,
      surveys: [...prev.surveys, { operator_id: '', survey_type: '', uom: '', survey_point: 0, rate: 0, total: 0, hrs: '', diesel: '' }]
    }));
  };

  const removeSurvey = (index) => {
    setFormData((prev) => ({ ...prev, surveys: prev.surveys.filter((_, i) => i !== index) }));
  };

  // Submit
  const handleSubmit = async () => {
    if (!formData.project_id) { showToast('danger', 'Please select a Project.'); return; }
    if (!formData.date) { showToast('danger', 'Please select a Date.'); return; }

    // validation (machineReading)
    for (let i = 0; i < formData.machineReading.length; i++) {
      const r = formData.machineReading[i];
      if (r.machine_start && r.machine_end) {
        if (!r.oprator_id) { showToast('danger', `Machine Reading Row ${i + 1}: Please select an Operator.`); return; }
        if (!r.machine_id) { showToast('danger', `Machine Reading Row ${i + 1}: Please select a Machinery.`); return; }
      }
    }

    // validation (compressorReading)
    for (let i = 0; i < formData.compressorReading.length; i++) {
      const r = formData.compressorReading[i];
      if (r.comp_rpm_start && r.comp_rpm_end) {
        if (!r.oprator_id) { showToast('danger', `Compressor Reading Row ${i + 1}: Please select an Operator.`); return; }
        if (!r.machine_id) { showToast('danger', `Compressor Reading Row ${i + 1}: Please select a Machinery.`); return; }
      }
    }

    // work details validation
    for (let i = 0; i < formData.workDetails.length; i++) {
      const w = formData.workDetails[i];
      if (w.work_point && w.rate) {
        if (!w.operator_id) { showToast('danger', `Row ${i + 1} (Work Details): Please select an Operator.`); return; }
        if (!w.work_type) { showToast('danger', `Row ${i + 1} (Work Details): Please select a Work Type.`); return; }
      }
    }

    // survey validation
    for (let i = 0; i < formData.surveys.length; i++) {
      const s = formData.surveys[i];
      if (s.survey_point && s.rate) {
        if (!s.operator_id) { showToast('danger', `Row ${i + 1} (Survey Details): Please select an Operator.`); return; }
        if (!s.survey_type) { showToast('danger', `Row ${i + 1} (Survey Details): Please select a Survey Type.`); return; }
      }
    }

    // Diesel Validation (Cross-section sum)
    const dieselUsageMap = {};
    const oldDieselMap = {};

    const addDieselUsage = (machineId, used, oldUsed) => {
      if (!machineId) return;
      const amount = parseFloat(used) || 0;
      const oldAmount = parseFloat(oldUsed) || 0;
      
      if (!dieselUsageMap[machineId]) dieselUsageMap[machineId] = 0;
      if (!oldDieselMap[machineId]) oldDieselMap[machineId] = 0;
      
      dieselUsageMap[machineId] += amount;
      oldDieselMap[machineId] += oldAmount;
    };

    formData.machineReading.forEach(r => addDieselUsage(r.machine_id, r.diesel_used, r.old_diesel_used));
    formData.compressorReading.forEach(r => addDieselUsage(r.machine_id, r.diesel_used, r.old_diesel_used));

    for (const machineId of Object.keys(dieselUsageMap)) {
      const machine = machineries.find(m => String(m.value) === String(machineId));
      const currentBalance = machine ? parseFloat(machine.diesel_balance) || 0 : 0;
      const oldUsed = oldDieselMap[machineId];
      const availableBalance = currentBalance + oldUsed;
      const totalUsed = dieselUsageMap[machineId];

      if (totalUsed > availableBalance) {
        showToast("danger", `Total diesel used (${totalUsed}) for machine "${machine?.label || 'Unknown'}" exceeds available balance (${availableBalance}).`);
        return;
      }
    }

    const payload = {
      project_id: formData.project_id,
      date: formData.date,
      start_time: formData.start_time || null,
      end_time: formData.end_time || null,
      break_time: formData.break_time || null,
      net_hours: formData.net_hours != null ? formData.net_hours : null,
      oprator_helper: formData.oprator_helper ?? null,
      machineReading: formData.machineReading.map((m) => ({
        oprator_id: m.oprator_id || null,
        machine_id: m.machine_id || null,
        machine_start: m.machine_start || null,
        machine_end: m.machine_end || null,
        actual_machine_hr: m.actual_machine_hr || 0,
        diesel_filled: m.diesel_filled !== '' ? parseFloat(m.diesel_filled) : 0,
        diesel_used: m.diesel_used !== '' ? parseFloat(m.diesel_used) : 0,
        diesel_balance: m.diesel_balance !== '' ? parseFloat(m.diesel_balance) : 0,
        diesel_avg: m.diesel_avg !== '' ? parseFloat(m.diesel_avg) : 0,
      })),
      compressor_rpm: formData.compressorReading.map((c) => ({
        oprator_id: c.oprator_id || null,
        machine_id: c.machine_id || null,
        comp_rpm_start: c.comp_rpm_start || null,
        comp_rpm_end: c.comp_rpm_end || null,
        com_actul_hr: c.com_actul_hr || 0,
        diesel_filled: c.diesel_filled !== '' ? parseFloat(c.diesel_filled) : 0,
        diesel_used: c.diesel_used !== '' ? parseFloat(c.diesel_used) : 0,
        diesel_balance: c.diesel_balance !== '' ? parseFloat(c.diesel_balance) : 0,
        diesel_avg: c.diesel_avg !== '' ? parseFloat(c.diesel_avg) : 0,
      })),
      work_points: formData.workDetails.map((w) => ({
        operator_id: w.operator_id || null,
        work_type: w.work_type || '',
        drilling_type: w.drilling_type || null,
        uom: w.uom || null,
        work_point: w.work_point || 0,
        rate: w.rate || 0,
        total: computeWorkRowTotal(w),
        hrs: w.hrs !== '' ? parseFloat(w.hrs) : null,
        diesel: w.diesel !== '' ? parseFloat(w.diesel) : null,
      })),
      surveys: formData.surveys.map((s) => ({
        operator_id: s.operator_id || null,
        survey_type: s.survey_type || '',
        uom: s.uom || null,
        survey_point: s.survey_point || 0,
        rate: s.rate || 0,
        total: computeSurveyRowTotal(s),
        hrs: s.hrs !== '' ? parseFloat(s.hrs) : null,
        diesel: s.diesel !== '' ? parseFloat(s.diesel) : null,
      })),
      isGST: formData.isGST,
      totalBill: totalBillDisplay
    };

    try {
      await put(`/api/drilling/${drillingRecordId}`, payload);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      showToast('success', 'Record updated successfully!');
      navigate('/infraDetailsShowTable');
    } catch (error) {
      console.error('Error updating data', error);
      showToast('danger', 'Error updating data');
    }
  };

  return (
    <CContainer fluid>
      {showSuccess && (
        <CAlert color="success" dismissible onClose={() => setShowSuccess(false)}>
          Form updated successfully!
        </CAlert>
      )}

      <CCard>
        <CCardHeader className="bg-primary text-white">
          <h1 className="h4 mb-0 d-flex align-items-center">
            <CIcon icon={cilSettings} className="me-2" /> Update Drilling Record
          </h1>
        </CCardHeader>

        <CCardBody className="p-4">
          <CForm>
            {/* Project Info */}
            <CCard className="mb-4 border-0" color="info" textColor="dark">
              <CCardBody className="bg-info-subtle rounded rounded-lg">
                <h5 className="text-info mb-3 d-flex align-items-center">
                  <CIcon icon={cilFile} className="me-2" /> 1. Project Information
                </h5>
                <CRow className="g-3">
                  <CCol md={6}>
                    <CFormLabel>Project Name *</CFormLabel>
                    <CInputGroup>
                      <CFormInput
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setShowDropdown(true);
                        }}
                        placeholder="Search for a project..."
                      />
                      {formData.project_name && (
                        <CButton
                          type="button"
                          color="danger"
                          variant="outline"
                          onClick={() => {
                            setFormData((prev) => ({ ...prev, project_name: '' }));
                            setSearchQuery('');
                            setShowDropdown(false);
                          }}
                        >
                          ✕
                        </CButton>
                      )}
                    </CInputGroup>

                    {showDropdown && projects.length > 0 && (
                      <div className="border rounded bg-white" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                        {projects.map((project) => (
                          <div
                            key={project.id}
                            className="p-2 hover-bg-light"
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleProjectChange(project)}
                          >
                            {project.project_name || project.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </CCol>

                  <CCol md={6}>
                    <CFormLabel>Date *</CFormLabel>
                    <CFormInput type="date" value={formData.date} onChange={(e) => handleInputChange('date', e.target.value)} />
                  </CCol>
                </CRow>
              </CCardBody>
            </CCard>

            {/* Work Timing - Red/Pink Card matching uploaded design */}
            <div
              className="mb-4 rounded-3 p-3 p-md-4"
              style={{
                backgroundColor: '#fff1f2',
                border: '1px solid #fecdd3',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              }}
            >
              <div className="d-flex align-items-center mb-3">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#e11d48"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="me-2"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <h5 className="mb-0 fw-bold" style={{ color: '#e11d48', fontSize: '18px' }}>
                  Work Timing
                </h5>
              </div>

              <CRow className="g-3 align-items-start">
                <CCol xs={12} sm={6} md={3}>
                  <div className="d-flex align-items-center mb-1" style={{ height: '22px' }}>
                    <CFormLabel className="fw-semibold text-dark mb-0" style={{ fontSize: '14px' }}>
                      Start Time <span className="text-danger">*</span>
                    </CFormLabel>
                  </div>
                  <CFormInput
                    type="time"
                    value={formData.start_time || ''}
                    onChange={(e) => handleWorkTimingChange('start_time', e.target.value)}
                    className="bg-white"
                    style={{
                      borderRadius: '8px',
                      height: '44px',
                      fontSize: '15px',
                      borderColor: '#e5e7eb',
                    }}
                  />
                </CCol>

                <CCol xs={12} sm={6} md={3}>
                  <div className="d-flex align-items-center mb-1" style={{ height: '22px' }}>
                    <CFormLabel className="fw-semibold text-dark mb-0" style={{ fontSize: '14px' }}>
                      End Time <span className="text-danger">*</span>
                    </CFormLabel>
                  </div>
                  <CFormInput
                    type="time"
                    value={formData.end_time || ''}
                    onChange={(e) => handleWorkTimingChange('end_time', e.target.value)}
                    className="bg-white"
                    style={{
                      borderRadius: '8px',
                      height: '44px',
                      fontSize: '15px',
                      borderColor: '#e5e7eb',
                    }}
                  />
                </CCol>

                <CCol xs={12} sm={6} md={3}>
                  <div className="d-flex justify-content-between align-items-center mb-1" style={{ height: '22px' }}>
                    <CFormLabel className="fw-semibold text-dark mb-0" style={{ fontSize: '14px' }}>
                      Break / Lunch
                    </CFormLabel>
                    {formData.break_time && parseBreakTimeToMinutes(formData.break_time) > 0 && (
                      <span className="badge bg-danger-subtle text-danger" style={{ fontSize: '11px' }}>
                        -{parseBreakTimeToMinutes(formData.break_time)} min
                      </span>
                    )}
                  </div>

                  {!customBreak ? (
                    <CFormSelect
                      value={normalizeBreakValue(formData.break_time)}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'custom') {
                          setCustomBreak(true);
                        } else {
                          handleWorkTimingChange('break_time', val);
                        }
                      }}
                      className="bg-white"
                      style={{
                        borderRadius: '8px',
                        height: '44px',
                        fontSize: '14px',
                        borderColor: '#e5e7eb',
                      }}
                    >
                      <option value="00:00">No Break (0 min)</option>
                      <option value="00:15">15 min</option>
                      <option value="00:30">30 min (Fixed)</option>
                      <option value="00:45">45 min (Fixed)</option>
                      <option value="01:00">1 hr (60 min)</option>
                      <option value="01:15">1 hr 15 min</option>
                      <option value="01:30">1 hr 30 min</option>
                      <option value="02:00">2 hrs</option>
                      <option value="custom">✏️ Custom Time / Minutes...</option>
                    </CFormSelect>
                  ) : (
                    <div className="d-flex gap-1 align-items-center">
                      <CFormInput
                        type="text"
                        placeholder="e.g. 30 or 45 or 00:30"
                        value={formData.break_time || ''}
                        onChange={(e) => handleWorkTimingChange('break_time', e.target.value)}
                        className="bg-white"
                        style={{
                          borderRadius: '8px',
                          height: '44px',
                          fontSize: '14px',
                          borderColor: '#e5e7eb',
                        }}
                      />
                      <CButton
                        type="button"
                        color="secondary"
                        variant="outline"
                        size="sm"
                        style={{ height: '44px' }}
                        title="Back to Fixed Options"
                        onClick={() => setCustomBreak(false)}
                      >
                        List
                      </CButton>
                    </div>
                  )}

                  {/* Quick Selection Chips */}
                  <div className="d-flex gap-1 mt-1 align-items-center" style={{ flexWrap: 'nowrap', overflowX: 'auto' }}>
                    <span className="text-muted" style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>Quick:</span>
                    {[
                      { label: '0m', val: '00:00' },
                      { label: '30m', val: '00:30' },
                      { label: '45m', val: '00:45' },
                      { label: '1h', val: '01:00' },
                    ].map((chip) => {
                      const isSelected = normalizeBreakValue(formData.break_time) === chip.val && !customBreak;
                      return (
                        <button
                          key={chip.val}
                          type="button"
                          onClick={() => {
                            setCustomBreak(false);
                            handleWorkTimingChange('break_time', chip.val);
                          }}
                          className={`btn btn-sm py-0 px-2 rounded-pill ${
                            isSelected
                              ? 'btn-danger text-white shadow-sm'
                              : 'btn-outline-secondary'
                          }`}
                          style={{ fontSize: '11px', fontWeight: 600, height: '22px', lineHeight: '20px', whiteSpace: 'nowrap' }}
                        >
                          {chip.label}
                        </button>
                      );
                    })}
                  </div>
                </CCol>

                <CCol xs={12} sm={6} md={3}>
                  <div className="d-flex justify-content-between align-items-center mb-1" style={{ height: '22px' }}>
                    <CFormLabel className="fw-semibold text-dark mb-0" style={{ fontSize: '14px' }}>
                      Net Working Hours
                    </CFormLabel>
                    {formatNetHoursDuration(formData.net_hours) && (
                      <span className="badge bg-warning-subtle text-dark" style={{ fontSize: '11px' }}>
                        {formatNetHoursDuration(formData.net_hours)}
                      </span>
                    )}
                  </div>
                  <div
                    className="rounded-3 px-3 d-flex justify-content-between align-items-center"
                    style={{
                      backgroundColor: '#fef9c3',
                      border: '1px solid #fef08a',
                      height: '44px',
                      borderRadius: '8px',
                    }}
                  >
                    <span className="fw-bold" style={{ fontSize: '22px', color: '#111827', lineHeight: '1' }}>
                      {Number(formData.net_hours || 0).toFixed(2)}
                    </span>
                    <span className="fw-semibold text-dark" style={{ fontSize: '14px' }}>
                      hrs
                    </span>
                  </div>
                </CCol>
              </CRow>
            </div>

            {/* Machine Usage */}
            <CCard className="mb-4 border-0" color="success" textColor="dark">
              <CCardBody className="bg-success-subtle rounded rounded-lg">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="text-success mb-3 d-flex align-items-center">
                    <CIcon icon={cilSettings} className="me-2" /> 2. Machine Usage
                  </h5>
                  <CButton
                    color="success"
                    variant="outline"
                    type="button"
                    size="md"
                    className="d-flex align-items-center"
                    onClick={addMachineReading}
                  >
                    Add Machine Reading
                  </CButton>
                </div>

                <CRow className="g-1">
                  {formData.machineReading.map((reading, index) => (
                    <CRow className="mb-2 gx-1 align-items-end" key={index}>
                      <CCol xs={12} md={2} className="p-1">
                        <CFormLabel className="text-nowrap" style={{ fontSize: '13px' }}>Operator / Helper *</CFormLabel>
                        <Select
                          options={operators}
                          isSearchable
                          placeholder="Select Operator..."
                          value={operators.find((op) => op.value === reading.oprator_id) || null}
                          onChange={(selected) => handleMachineReadingChange(index, 'oprator_id', selected ? selected.value : '')}
                        />
                      </CCol>

                      <CCol xs={12} md={2} className="p-1">
                        <CFormLabel className="text-nowrap" style={{ fontSize: '13px' }}>Machinery *</CFormLabel>
                        <Select
                          options={machineries}
                          isSearchable
                          placeholder="Machinery"
                          value={machineries.find((m) => m.value === reading.machine_id) || null}
                          onChange={(selected) => handleMachineReadingChange(index, 'machine_id', selected ? selected.value : '')}
                        />
                      </CCol>

                      <CCol xs={6} sm={4} md={1} className="p-1">
                        <CFormLabel className="text-nowrap" style={{ fontSize: '13px' }}>Start</CFormLabel>
                        <CFormInput
                          type="text"
                          inputMode="decimal"
                          pattern="[0-9.:]*"
                          value={reading.machine_start === 0 ? '' : reading.machine_start}
                          placeholder="0"
                          onChange={(e) => {
                            let val = e.target.value.replace(/[^0-9.:]/g, '');
                            handleMachineReadingChange(index, 'machine_start', val === '' ? '' : val);
                          }}
                        />
                      </CCol>

                      <CCol xs={6} sm={4} md={1} className="p-1">
                        <CFormLabel className="text-nowrap" style={{ fontSize: '13px' }}>End</CFormLabel>
                        <CFormInput
                          type="text"
                          inputMode="decimal"
                          pattern="[0-9.:]*"
                          value={reading.machine_end === 0 ? '' : reading.machine_end}
                          placeholder="0"
                          onChange={(e) => {
                            let val = e.target.value.replace(/[^0-9.:]/g, '');
                            handleMachineReadingChange(index, 'machine_end', val === '' ? '' : val);
                          }}
                        />
                      </CCol>

                      <CCol xs={6} sm={4} md={1} className="p-1">
                        <CFormLabel className="text-nowrap" style={{ fontSize: '13px' }}>Actual Hrs</CFormLabel>
                        <CInputGroup>
                          <CFormInput type="text" value={String(reading.actual_machine_hr ?? 0)} readOnly className="bg-light fw-semibold" />
                        </CInputGroup>
                      </CCol>

                      <CCol xs={6} sm={3} md={1} className="p-1">
                        <CFormLabel className="text-nowrap" style={{ fontSize: '13px' }}>Diesel Filed</CFormLabel>
                        <CFormInput
                          type="text"
                          inputMode="decimal"
                          pattern="[0-9.]*"
                          value={reading.diesel_filled}
                          placeholder="0"
                          onChange={(e) => {
                            let val = e.target.value.replace(/[^0-9.]/g, '');
                            const parts = val.split('.');
                            if (parts.length > 2) val = parts[0] + '.' + parts.slice(1).join('');
                            handleMachineReadingChange(index, 'diesel_filled', val);
                          }}
                        />
                      </CCol>

                      <CCol xs={6} sm={3} md={1} className="p-1">
                        <CFormLabel className="text-nowrap" style={{ fontSize: '13px' }}>Diesel Used</CFormLabel>
                        <CFormInput
                          type="text"
                          inputMode="decimal"
                          pattern="[0-9.]*"
                          value={reading.diesel_used}
                          placeholder="0"
                          onChange={(e) => {
                            let val = e.target.value.replace(/[^0-9.]/g, '');
                            const parts = val.split('.');
                            if (parts.length > 2) val = parts[0] + '.' + parts.slice(1).join('');
                            handleMachineReadingChange(index, 'diesel_used', val);
                          }}
                        />
                      </CCol>

                      <CCol xs={6} sm={3} md={1} className="p-1">
                        <CFormLabel className="text-nowrap" style={{ fontSize: '13px' }}>Diesel Balance</CFormLabel>
                        <CFormInput
                          type="text"
                          value={reading.diesel_balance}
                          readOnly
                          className="bg-light fw-bold text-success"
                        />
                      </CCol>

                      <CCol xs={6} sm={3} md={1} className="p-1">
                        <CFormLabel className="text-nowrap" style={{ fontSize: '13px' }} title="Formula: Diesel Used / Machine HR">Diesel Avg.</CFormLabel>
                        <CFormInput
                          type="text"
                          value={reading.diesel_avg}
                          readOnly
                          className="bg-light fw-bold text-primary"
                          placeholder="0.00"
                          title="Formula: Diesel Used / Machine HR"
                        />
                      </CCol>

                      <CCol xs={12} sm={12} md={1} className="d-flex align-items-center justify-content-center p-1">
                        {formData.machineReading.length > 1 && (
                          <CButton
                            color="danger"
                            variant="ghost"
                            size="md"
                            onClick={() => removeMachineReading(index)}
                          >
                            <CIcon icon={cilX} />
                          </CButton>
                        )}
                      </CCol>
                    </CRow>
                  ))}
                </CRow>
              </CCardBody>
            </CCard>

            {/* Compressor RPM Usage */}
            <CCard className="mb-4 border-0" color="primary" textColor="dark">
              <CCardBody className="bg-primary-subtle rounded rounded-lg">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="text-primary mb-3 d-flex align-items-center">
                    <CIcon icon={cilSettings} className="me-2" /> 3. Compressor Usage
                  </h5>
                  <CButton
                    color="primary"
                    variant="outline"
                    type="button"
                    size="md"
                    className="d-flex align-items-center"
                    onClick={addCompressorReading}
                  >
                    Add Compressor Reading
                  </CButton>
                </div>

                {formData.compressorReading.map((reading, index) => (
                  <CRow className="mb-2 gx-1 align-items-end" key={index}>
                    <CCol xs={12} md={2} className="p-1">
                      <CFormLabel className="text-nowrap" style={{ fontSize: '13px' }}>Operator / Helper *</CFormLabel>
                      <Select
                        options={operators}
                        isSearchable
                        placeholder="Select Operator..."
                        value={operators.find((op) => op.value === reading.oprator_id) || null}
                        onChange={(selected) => handleCompressorChange(index, 'oprator_id', selected ? selected.value : '')}
                      />
                    </CCol>

                    <CCol xs={12} md={2} className="p-1">
                      <CFormLabel className="text-nowrap" style={{ fontSize: '13px' }}>Machinery *</CFormLabel>
                      <Select
                        options={machineries}
                        isSearchable
                        placeholder="Machinery"
                        value={machineries.find((m) => m.value === reading.machine_id) || null}
                        onChange={(selected) => handleCompressorChange(index, 'machine_id', selected ? selected.value : '')}
                      />
                    </CCol>

                    <CCol xs={6} sm={4} md={1} className="p-1">
                      <CFormLabel className="text-nowrap" style={{ fontSize: '13px' }}>Start</CFormLabel>
                      <CFormInput
                        type="text"
                        inputMode="decimal"
                        pattern="[0-9.:]*"
                        value={reading.comp_rpm_start === 0 ? '' : reading.comp_rpm_start}
                        placeholder="0"
                        onChange={(e) => {
                          let val = e.target.value.replace(/[^0-9.:]/g, '');
                          handleCompressorChange(index, 'comp_rpm_start', val === '' ? '' : val);
                        }}
                      />
                    </CCol>

                    <CCol xs={6} sm={4} md={1} className="p-1">
                      <CFormLabel className="text-nowrap" style={{ fontSize: '13px' }}>End</CFormLabel>
                      <CFormInput
                        type="text"
                        inputMode="decimal"
                        pattern="[0-9.:]*"
                        value={reading.comp_rpm_end === 0 ? '' : reading.comp_rpm_end}
                        placeholder="0"
                        onChange={(e) => {
                          let val = e.target.value.replace(/[^0-9.:]/g, '');
                          handleCompressorChange(index, 'comp_rpm_end', val === '' ? '' : val);
                        }}
                      />
                    </CCol>

                    <CCol xs={6} sm={4} md={1} className="p-1">
                      <CFormLabel className="text-nowrap" style={{ fontSize: '13px' }}>RPM Hrs</CFormLabel>
                      <CInputGroup>
                        <CFormInput type="text" value={String(reading.com_actul_hr ?? 0)} readOnly className="bg-light fw-semibold" />
                      </CInputGroup>
                    </CCol>

                    <CCol xs={6} sm={3} md={1} className="p-1">
                      <CFormLabel className="text-nowrap" style={{ fontSize: '13px' }}>Diesel Filed</CFormLabel>
                      <CFormInput
                        type="text"
                        inputMode="decimal"
                        pattern="[0-9.]*"
                        value={reading.diesel_filled}
                        placeholder="0"
                        onChange={(e) => {
                          let val = e.target.value.replace(/[^0-9.]/g, '');
                          const parts = val.split('.');
                          if (parts.length > 2) val = parts[0] + '.' + parts.slice(1).join('');
                          handleCompressorChange(index, 'diesel_filled', val);
                        }}
                      />
                    </CCol>

                    <CCol xs={6} sm={3} md={1} className="p-1">
                      <CFormLabel className="text-nowrap" style={{ fontSize: '13px' }}>Diesel Used</CFormLabel>
                      <CFormInput
                        type="text"
                        inputMode="decimal"
                        pattern="[0-9.]*"
                        value={reading.diesel_used}
                        placeholder="0"
                        onChange={(e) => {
                          let val = e.target.value.replace(/[^0-9.]/g, '');
                          const parts = val.split('.');
                          if (parts.length > 2) val = parts[0] + '.' + parts.slice(1).join('');
                          handleCompressorChange(index, 'diesel_used', val);
                        }}
                      />
                    </CCol>

                    <CCol xs={6} sm={3} md={1} className="p-1">
                      <CFormLabel className="text-nowrap" style={{ fontSize: '13px' }}>Diesel Balance</CFormLabel>
                      <CFormInput
                        type="text"
                        value={reading.diesel_balance}
                        readOnly
                        className="bg-light fw-bold text-success"
                      />
                    </CCol>

                    <CCol xs={6} sm={3} md={1} className="p-1">
                      <CFormLabel className="text-nowrap" style={{ fontSize: '13px' }} title="Formula: Diesel Used / RPM HR">Diesel Avg.</CFormLabel>
                      <CFormInput
                        type="text"
                        value={reading.diesel_avg}
                        readOnly
                        className="bg-light fw-bold text-primary"
                        placeholder="0.00"
                        title="Formula: Diesel Used / RPM HR"
                      />
                    </CCol>

                    <CCol xs={12} sm={12} md={1} className="d-flex align-items-center justify-content-center p-1">
                      {formData.compressorReading.length > 1 && (
                        <CButton
                          color="danger"
                          variant="ghost"
                          size="md"
                          onClick={() => removeCompressorReading(index)}
                        >
                          <CIcon icon={cilX} />
                        </CButton>
                      )}
                    </CCol>
                  </CRow>
                ))}
              </CCardBody>
            </CCard>

            {/* Work Details */}
            <CCard className="mb-4 border-0" color="warning" textColor="dark">
              <CCardBody className="bg-warning-subtle rounded rounded-lg">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="text-warning mb-0 d-flex align-items-center">
                    <CIcon icon={cilCalculator} className="me-2" /> 4. Work Details
                  </h5>
                  <CButton color="warning" variant="outline" onClick={addWorkDetail}>Add Work</CButton>
                </div>

                {formData.workDetails.map((work, index) => (
                  <CRow key={index} className="align-items-center mb-2">
                    <CCol md={3}>
                      <CFormLabel>Operator</CFormLabel>
                      <Select
                        options={operators}
                        isSearchable
                        placeholder="Select Operator..."
                        value={operators.find((op) => op.value === work.operator_id) || null}
                        onChange={(selected) => handleWorkDetailChange(index, 'operator_id', selected ? selected.value : '')}
                      />
                    </CCol>

                    <CCol lg={2}>
                      <CFormLabel>Work Type</CFormLabel>
                      <CFormSelect value={work.work_type} onChange={(e) => handleWorkDetailChange(index, 'work_type', e.target.value)}>
                        <option value="">Select Work Type</option>
                        {workTypes.map((type) => (
                          <option key={type.id} value={type.name}>{type.name}</option>
                        ))}
                      </CFormSelect>
                    </CCol>

                    <CCol lg={2}>
                      <CFormLabel>Drilling Type (Optional)</CFormLabel>
                      <CFormSelect value={work.drilling_type || ''} onChange={(e) => handleWorkDetailChange(index, 'drilling_type', e.target.value)}>
                        <option value="">Select Drilling Type</option>
                        <option value="Hard">Hard</option>
                        <option value="Medium">Medium</option>
                        <option value="Soft">Soft</option>
                      </CFormSelect>
                    </CCol>

                    <CCol lg={2}>
                      <CFormLabel>UOM</CFormLabel>
                      <CFormSelect value={work.uom} onChange={(e) => handleWorkDetailChange(index, 'uom', e.target.value)}>
                        <option value="">Select UOM</option>
                        {uoms.map((u) => (
                          <option key={u.id} value={u.name}>{u.name}</option>
                        ))}
                      </CFormSelect>
                    </CCol>

                    <CCol lg={2}>
                      <CFormLabel>Points</CFormLabel>
                      <CFormInput
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={work.work_point === 0 ? '' : String(work.work_point)}
                        placeholder="0"
                        onChange={(e) => {
                          let val = e.target.value.replace(/\D/g, '');
                          handleWorkDetailChange(index, 'work_point', val === '' ? 0 : Number(val));
                        }}
                      />
                    </CCol>

                    <CCol lg={2}>
                      <CFormLabel>Rate</CFormLabel>
                      <CInputGroup>
                        <CInputGroupText>₹</CInputGroupText>
                        <CFormInput
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={work.rate === 0 ? '' : String(work.rate)}
                          placeholder="0"
                          onChange={(e) => {
                            let val = e.target.value.replace(/\D/g, '');
                            handleWorkDetailChange(index, 'rate', val === '' ? 0 : Number(val));
                          }}
                        />
                      </CInputGroup>
                    </CCol>

                    <CCol lg={2}>
                      <CFormLabel>Total</CFormLabel>
                      <CInputGroup>
                        <CInputGroupText>₹</CInputGroupText>
                        <CFormInput value={(computeWorkRowTotal(work)).toFixed(2)} readOnly className="bg-light fw-bold" />
                      </CInputGroup>
                    </CCol>

                    <CCol lg={2}>
                      <CFormLabel>Hrs</CFormLabel>
                      <CFormInput
                        type="text"
                        inputMode="decimal"
                        pattern="[0-9.]*"
                        value={work.hrs}
                        placeholder="0"
                        onChange={(e) => {
                          let val = e.target.value.replace(/[^0-9.]/g, '');
                          handleWorkDetailChange(index, 'hrs', val);
                        }}
                      />
                    </CCol>

                    <CCol lg={2}>
                      <CFormLabel>Diesel (L)</CFormLabel>
                      <CFormInput
                        type="text"
                        inputMode="decimal"
                        pattern="[0-9.]*"
                        value={work.diesel}
                        placeholder="0"
                        onChange={(e) => {
                          let val = e.target.value.replace(/[^0-9.]/g, '');
                          handleWorkDetailChange(index, 'diesel', val);
                        }}
                      />
                    </CCol>

                    <CCol lg={1}>
                      {formData.workDetails.length > 1 && (
                        <CButton color="danger" variant="ghost" size="sm" onClick={() => removeWorkDetail(index)}>
                          <CIcon icon={cilX} />
                        </CButton>
                      )}
                    </CCol>
                  </CRow>
                ))}

              </CCardBody>
            </CCard>

            {/* Survey Details */}
            <CCard className="mb-4 border-0" color="info" textColor="dark">
              <CCardBody className="bg-info-subtle rounded rounded-lg">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="text-info mb-0 d-flex align-items-center">
                    <CIcon icon={cilLocationPin} className="me-2" /> 5. Survey Details
                  </h5>
                  <CButton color="info" variant="outline" onClick={addSurvey}>Add Survey</CButton>
                </div>

                {formData.surveys.map((survey, index) => (
                  <CRow key={index} className="align-items-center mb-2">
                    <CCol md={3}>
                      <CFormLabel>Operator</CFormLabel>
                      <Select
                        options={operators}
                        isSearchable
                        placeholder="Select Operator..."
                        value={operators.find((op) => op.value === survey.operator_id) || null}
                        onChange={(selected) => handleSurveyChange(index, 'operator_id', selected ? selected.value : '')}
                      />
                    </CCol>

                    <CCol lg={2}>
                      <CFormLabel>Survey Type</CFormLabel>
                      <CFormSelect value={survey.survey_type} onChange={(e) => handleSurveyChange(index, 'survey_type', e.target.value)}>
                        <option value="">Select Survey Type</option>
                        {surveyTypes.map((type) => (
                          <option key={type.id} value={type.name}>{type.name}</option>
                        ))}
                      </CFormSelect>
                    </CCol>

                    <CCol lg={2}>
                      <CFormLabel>UOM</CFormLabel>
                      <CFormSelect value={survey.uom} onChange={(e) => handleSurveyChange(index, 'uom', e.target.value)}>
                        <option value="">Select UOM</option>
                        {uoms.map((u) => (
                          <option key={u.id} value={u.name}>{u.name}</option>
                        ))}
                      </CFormSelect>
                    </CCol>

                    <CCol lg={2}>
                      <CFormLabel>Points</CFormLabel>
                      <CFormInput
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={survey.survey_point === 0 ? '' : String(survey.survey_point)}
                        placeholder="0"
                        onChange={(e) => {
                          let val = e.target.value.replace(/\D/g, '');
                          handleSurveyChange(index, 'survey_point', val === '' ? 0 : Number(val));
                        }}
                      />
                    </CCol>

                    <CCol lg={2}>
                      <CFormLabel>Rate</CFormLabel>
                      <CInputGroup>
                        <CInputGroupText>₹</CInputGroupText>
                        <CFormInput
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={survey.rate === 0 ? '' : String(survey.rate)}
                          placeholder="0"
                          onChange={(e) => {
                            let val = e.target.value.replace(/\D/g, '');
                            handleSurveyChange(index, 'rate', val === '' ? 0 : Number(val));
                          }}
                        />
                      </CInputGroup>
                    </CCol>

                    <CCol lg={2}>
                      <CFormLabel>Total</CFormLabel>
                      <CInputGroup>
                        <CInputGroupText>₹</CInputGroupText>
                        <CFormInput value={(computeSurveyRowTotal(survey)).toFixed(2)} readOnly className="bg-light fw-bold" />
                      </CInputGroup>
                    </CCol>

                    <CCol lg={2}>
                      <CFormLabel>Hrs</CFormLabel>
                      <CFormInput
                        type="text"
                        inputMode="decimal"
                        pattern="[0-9.]*"
                        value={survey.hrs}
                        placeholder="0"
                        onChange={(e) => {
                          let val = e.target.value.replace(/[^0-9.]/g, '');
                          handleSurveyChange(index, 'hrs', val);
                        }}
                      />
                    </CCol>

                    <CCol lg={2}>
                      <CFormLabel>Diesel (L)</CFormLabel>
                      <CFormInput
                        type="text"
                        inputMode="decimal"
                        pattern="[0-9.]*"
                        value={survey.diesel}
                        placeholder="0"
                        onChange={(e) => {
                          let val = e.target.value.replace(/[^0-9.]/g, '');
                          handleSurveyChange(index, 'diesel', val);
                        }}
                      />
                    </CCol>

                    <CCol lg={1}>
                      {formData.surveys.length > 1 && (
                        <CButton color="danger" variant="ghost" size="sm" onClick={() => removeSurvey(index)}>
                          <CIcon icon={cilX} />
                        </CButton>
                      )}
                    </CCol>
                  </CRow>
                ))}

              </CCardBody>
            </CCard>

            {/* Submit */}
            <div className="d-flex justify-content-center">
              <CButton color="danger" size="lg" className="px-5 d-flex align-items-center" onClick={handleSubmit}>
                <CIcon icon={cilFile} className="me-2" /> Update
              </CButton>
            </div>

          </CForm>
        </CCardBody>
      </CCard>
    </CContainer>
  );
};

export default UpdateDrillingForm;