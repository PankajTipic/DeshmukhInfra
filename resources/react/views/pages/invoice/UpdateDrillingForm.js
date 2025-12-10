
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
import { SurveyTypeDropdown, workTypeDropdown } from '../../../util/Feilds';

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
    machineReading: [{ oprator_id: '', machine_id: '', machine_start: '', machine_end: '', actual_machine_hr: 0 }],
    compressorReading: [{ oprator_id: '', machine_id: '', comp_rpm_start: '', comp_rpm_end: '', com_actul_hr: 0 }],
    workDetails: [{ operator_id: '', work_type: '', work_point: 0, rate: 0, total: 0 }],
    surveys: [{ operator_id: '', survey_type: '', survey_point: 0, rate: 0, total: 0 }],
    isGST: false,
    totalBill: 0,
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [operators, setOperators] = useState([]);
  const [machineries, setMachineries] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const workTypes = ['Drilling', 'Pilling', 'DTH', 'Fencing', 'Casting', 'Casting+Drilling', 'Earthing', 'Compound'];
  const surveyTypes = ['Drone', 'Topography', 'Boundary', 'Site Survey', 'Progress Survey'];

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

        // map machine readings
        const machineReading = (data.machine_reading || data.machine_readings || []).map((m) => ({
          oprator_id: m.oprator_id != null ? Number(m.oprator_id) : '',
          machine_id: m.machine_id != null ? Number(m.machine_id) : '',
          machine_start: m.machine_start ?? '',
          machine_end: m.machine_end ?? '',
          actual_machine_hr: m.actual_machine_hr != null ? Number(m.actual_machine_hr) : 0
        }));

        // map compressor readings
        const compressorReading = (data.compressor_rpm || []).map((c) => ({
          oprator_id: c.oprator_id != null ? Number(c.oprator_id) : '',
          machine_id: c.machine_id != null ? Number(c.machine_id) : '',
          comp_rpm_start: c.comp_rpm_start ?? '',
          comp_rpm_end: c.comp_rpm_end ?? '',
          com_actul_hr: c.com_actul_hr != null ? Number(c.com_actul_hr) : 0
        }));

        // map work points
        const workDetails = (data.work_points || data.work_point_detail || []).map((w) => {
          const wp = Number(w.work_point || 0);
          const rate = Number(w.rate || 0);
          const total = w.total != null ? Number(w.total) : wp * rate;
          return {
            operator_id: w.operator_id != null ? Number(w.operator_id) : '',
            work_type: w.work_type || '',
            work_point: wp,
            rate,
            total
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
            survey_point: sp,
            rate,
            total
          };
        });

        setFormData((prev) => ({
          ...prev,
          project_id: data.project_id != null ? Number(data.project_id) : '',
          project_name: data.project?.project_name || '',
          date: data.date || '',
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
        setMachineries((Array.isArray(list) ? list : []).map((m) => ({ value: m.id, label: m.machine_name || m.name })));
      })
      .catch((err) => console.error('Error fetching machineries:', err));
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

  const handleMachineReadingChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = prev.machineReading.map((r, i) => i === index ? { ...r } : r);
      updated[index][field] = (field === 'oprator_id' || field === 'machine_id') ? (value === '' ? '' : Number(value)) : value;
      if (field === 'machine_start' || field === 'machine_end') {
        updated[index].actual_machine_hr = calculateMachineHours(updated[index].machine_start, updated[index].machine_end);
      }
      return { ...prev, machineReading: updated };
    });
  };

  const handleCompressorChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = prev.compressorReading.map((r, i) => i === index ? { ...r } : r);
      updated[index][field] = (field === 'oprator_id' || field === 'machine_id') ? (value === '' ? '' : Number(value)) : value;
      if (field === 'comp_rpm_start' || field === 'comp_rpm_end') {
        updated[index].com_actul_hr = calculateCompressorHours(updated[index].comp_rpm_start, updated[index].comp_rpm_end);
      }
      return { ...prev, compressorReading: updated };
    });
  };

  const addMachineReading = () => {
    setFormData((prev) => ({
      ...prev,
      machineReading: [...prev.machineReading, { oprator_id: '', machine_id: '', machine_start: '', machine_end: '', actual_machine_hr: 0 }]
    }));
  };

  const removeMachineReading = (index) => {
    setFormData((prev) => ({ ...prev, machineReading: prev.machineReading.filter((_, i) => i !== index) }));
  };

  const addCompressorReading = () => {
    setFormData((prev) => ({
      ...prev,
      compressorReading: [...prev.compressorReading, { oprator_id: '', machine_id: '', comp_rpm_start: '', comp_rpm_end: '', com_actul_hr: 0 }]
    }));
  };

  const removeCompressorReading = (index) => {
    setFormData((prev) => ({ ...prev, compressorReading: prev.compressorReading.filter((_, i) => i !== index) }));
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
      workDetails: [...prev.workDetails, { operator_id: '', work_type: '', work_point: 0, rate: 0, total: 0 }]
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
      surveys: [...prev.surveys, { operator_id: '', survey_type: '', survey_point: 0, rate: 0, total: 0 }]
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

    const payload = {
      project_id: formData.project_id,
      date: formData.date,
      oprator_helper: formData.oprator_helper ?? null,
      machineReading: formData.machineReading.map((m) => ({
        oprator_id: m.oprator_id || null,
        machine_id: m.machine_id || null,
        machine_start: m.machine_start || null,
        machine_end: m.machine_end || null,
        actual_machine_hr: m.actual_machine_hr || 0,
      })),
      compressor_rpm: formData.compressorReading.map((c) => ({
        oprator_id: c.oprator_id || null,
        machine_id: c.machine_id || null,
        comp_rpm_start: c.comp_rpm_start || null,
        comp_rpm_end: c.comp_rpm_end || null,
        com_actul_hr: c.com_actul_hr || 0,
      })),
      work_points: formData.workDetails.map((w) => ({
        operator_id: w.operator_id || null,
        work_type: w.work_type || '',
        work_point: w.work_point || 0,
        rate: w.rate || 0,
        total: computeWorkRowTotal(w)
      })),
      surveys: formData.surveys.map((s) => ({
        operator_id: s.operator_id || null,
        survey_type: s.survey_type || '',
        survey_point: s.survey_point || 0,
        rate: s.rate || 0,
        total: computeSurveyRowTotal(s)
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
                    <CRow className="mb-2 gx-1" key={index}>
                      <CCol xs={12} md={3} className="p-1">
                        <CFormLabel>Operator / Helper *</CFormLabel>
                        <Select
                          options={operators}
                          isSearchable
                          placeholder="Select Operator..."
                          value={operators.find((op) => op.value === reading.oprator_id) || null}
                          onChange={(selected) => handleMachineReadingChange(index, 'oprator_id', selected ? selected.value : '')}
                        />
                      </CCol>

                      <CCol xs={12} md={2} className="p-1">
                        <CFormLabel>Machinery *</CFormLabel>
                        <Select
                          options={machineries}
                          isSearchable
                          placeholder="Machinery"
                          value={machineries.find((m) => m.value === reading.machine_id) || null}
                          onChange={(selected) => handleMachineReadingChange(index, 'machine_id', selected ? selected.value : '')}
                        />
                      </CCol>

                      <CCol xs={12} sm={6} md={2} className="p-1">
                        <CFormLabel>Machine Start</CFormLabel>
                        <CFormInput
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9.:]*"
                          value={reading.machine_start === 0 ? '' : reading.machine_start}
                          placeholder="0"
                          onChange={(e) => {
                            let val = e.target.value.replace(/[^0-9.:]/g, '');
                            handleMachineReadingChange(index, 'machine_start', val === '' ? '' : val);
                          }}
                        />
                      </CCol>

                      <CCol xs={12} sm={6} md={2} className="p-1">
                        <CFormLabel>Machine End</CFormLabel>
                        <CFormInput
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9.:]*"
                          value={reading.machine_end === 0 ? '' : reading.machine_end}
                          placeholder="0"
                          onChange={(e) => {
                            let val = e.target.value.replace(/[^0-9.:]/g, '');
                            handleMachineReadingChange(index, 'machine_end', val === '' ? '' : val);
                          }}
                        />
                      </CCol>

                      <CCol xs={12} sm={6} md={2} className="p-1">
                        <CFormLabel>Actual Hours</CFormLabel>
                        <CInputGroup>
                          <CFormInput type="text" value={String(reading.actual_machine_hr ?? 0)} readOnly />
                          <CInputGroupText>hrs</CInputGroupText>
                        </CInputGroup>
                      </CCol>

                      <CCol xs={12} sm={6} md={1} className="d-flex align-items-center mt-4 p-1">
                        {formData.machineReading.length > 1 && (
                          <CButton
                            color="danger"
                            variant="ghost"
                            size="lg"
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
                  <CRow className="mb-2 gx-1" key={index}>
                    <CCol xs={12} md={3} className="p-1">
                      <CFormLabel>Operator / Helper *</CFormLabel>
                      <Select
                        options={operators}
                        isSearchable
                        placeholder="Select Operator..."
                        value={operators.find((op) => op.value === reading.oprator_id) || null}
                        onChange={(selected) => handleCompressorChange(index, 'oprator_id', selected ? selected.value : '')}
                      />
                    </CCol>

                    <CCol xs={12} md={2} className="p-1">
                      <CFormLabel>Machinery *</CFormLabel>
                      <Select
                        options={machineries}
                        isSearchable
                        placeholder="Machinery"
                        value={machineries.find((m) => m.value === reading.machine_id) || null}
                        onChange={(selected) => handleCompressorChange(index, 'machine_id', selected ? selected.value : '')}
                      />
                    </CCol>

                    <CCol xs={12} sm={6} md={2} className="p-1">
                      <CFormLabel>RPM Start</CFormLabel>
                      <CFormInput
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9.:]*"
                        value={reading.comp_rpm_start === 0 ? '' : reading.comp_rpm_start}
                        placeholder="0"
                        onChange={(e) => {
                          let val = e.target.value.replace(/[^0-9.:]/g, '');
                          handleCompressorChange(index, 'comp_rpm_start', val === '' ? '' : val);
                        }}
                      />
                    </CCol>

                    <CCol xs={12} sm={6} md={2} className="p-1">
                      <CFormLabel>RPM End</CFormLabel>
                      <CFormInput
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9.:]*"
                        value={reading.comp_rpm_end === 0 ? '' : reading.comp_rpm_end}
                        placeholder="0"
                        onChange={(e) => {
                          let val = e.target.value.replace(/[^0-9.:]/g, '');
                          handleCompressorChange(index, 'comp_rpm_end', val === '' ? '' : val);
                        }}
                      />
                    </CCol>

                    <CCol xs={12} sm={6} md={2} className="p-1">
                      <CFormLabel>Actual Hours</CFormLabel>
                      <CInputGroup>
                        <CFormInput type="text" value={String(reading.com_actul_hr ?? 0)} readOnly />
                        <CInputGroupText>hrs</CInputGroupText>
                      </CInputGroup>
                    </CCol>

                    <CCol xs={12} sm={6} md={1} className="d-flex align-items-center mt-4 p-1">
                      {formData.compressorReading.length > 1 && (
                        <CButton
                          color="danger"
                          variant="ghost"
                          size="lg"
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
                        {/* {workTypes.map((type) => (<option key={type} value={type}>{type}</option>))} */}
                                  {workTypeDropdown.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
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
                        {/* {surveyTypes.map((type) => (<option key={type} value={type}>{type}</option>))} */}
                        {SurveyTypeDropdown.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
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