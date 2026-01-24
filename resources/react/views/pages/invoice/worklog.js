import React, { useState, useEffect, useCallback } from 'react';
import {
  CCard, CCardBody, CCardHeader, CRow, CCol, CForm, CFormLabel, CFormInput,
  CFormSelect, CButton, CContainer, CAlert,
  CInputGroup,
  CInputGroupText
} from '@coreui/react';
import { cilSettings, cilCalculator, cilLocationPin, cilX, cilFile, cilSearch } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import { getAPICall, post } from '../../../util/api';
import { useNavigate } from 'react-router-dom';
import Select from "react-select";
import { useToast } from '../../common/toast/ToastContext';
import { SurveyTypeDropdown, workTypeDropdown } from '../../../util/Feilds';
import ProjectSelectionModal from '../../common/ProjectSelectionModal';

const MachineUsageForm = () => {
  const [formData, setFormData] = useState({
    project_id: '',
    project_name: '',
    date: '',
    workDetails: [{ operator_id: '', workType: '', workPoints: '', rate: '', total: 0 }],
    surveys: [{ operator_id: '', survey_type: '', survey_point: '', rate: '', total: 0 }],
    machineReading: [{ oprator_id: '', machine_id: '', machine_start: '', machine_end: '', actual_machine_hr: 0 }],
    compressorReading: [{ oprator_id: '', machine_id: '', comp_rpm_start: '', comp_rpm_end: '', com_actul_hr: 0 }],
    rawMaterials: [{ material_type: '', qty_used: '' }],
  });

  const { showToast } = useToast();
  const [showSuccess, setShowSuccess] = useState(false);
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [operators, setOperators] = useState([]);
  const [machineries, setMachineries] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [materialTypes, setMaterialTypes] = useState([]);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [materials, setMaterials] = useState([]);

  

  const navigate = useNavigate();

  // Fetch projects
  const fetchProjects = useCallback(async (query) => {
    try {
      const response = await getAPICall(`/api/projects?searchQuery=${query}`);
      setProjects(response || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
    }
  }, []);

  // Fetch operators
  useEffect(() => {
    getAPICall("/api/operatorsByType")
      .then((response) => {
        const options = response.map((op) => ({
          value: op.id,
          label: op.name
        }));
        setOperators(options);
      })
      .catch((error) => {
        console.error("Error fetching operators:", error);
      });
  }, []);

  // Fetch machineries
  useEffect(() => {
    const fetchMachineries = async () => {
      try {
        const res = await getAPICall("/api/machineries");
        if (res.data && Array.isArray(res.data)) {
          setMachineries(
            res.data.map((m) => ({
              value: m.id,
              label: m.machine_name,
            }))
          );
        }
      } catch (err) {
        console.error("Error fetching machineries:", err);
      }
    };
    fetchMachineries();
  }, []);

  // Fetch materials based on project_id
  useEffect(() => {
    const fetchMaterials = async () => {
      if (formData.project_id) {
        try {
          const res = await getAPICall(`/api/getMaterialByProject?project_id=${formData.project_id}`);
          if (res.materials && Array.isArray(res.materials)) {
            setMaterialTypes(res.materials.map(material => ({
              value: material.id,
              label: material.name
            })));
          } else {
            setMaterialTypes([]);
          }
        } catch (err) {
          console.error("Error fetching materials:", err);
          setMaterialTypes([]);
          showToast("danger", "Failed to fetch materials for the selected project.");
        }
      } else {
        setMaterialTypes([]);
      }
    };
    fetchMaterials();
  }, [formData.project_id]);

  // Debounced project search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        fetchProjects(searchQuery);
      } else {
        setProjects([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchProjects]);

  // Calculate machine hours
  const calculateMachineHours = (start, end) => {
    if (!start || !end) return 0;
    const diff = parseFloat(end) - parseFloat(start);
    return diff >= 0 ? diff.toFixed(2) : 0;
  };

  const handleMachineReadingChange = (index, field, value) => {
    const updated = [...formData.machineReading];
    updated[index][field] = value;

    if (field === "machine_start" || field === "machine_end") {
      updated[index].actual_machine_hr = calculateMachineHours(
        updated[index].machine_start,
        updated[index].machine_end
      );
    }

    setFormData({ ...formData, machineReading: updated });
  };

  const handleCompressorChange = (index, field, value) => {
    setFormData(prev => {
      const updated = [...prev.compressorReading];
      updated[index] = { ...updated[index], [field]: value };

      const start = parseFloat(updated[index].comp_rpm_start || 0);
      const end = parseFloat(updated[index].comp_rpm_end || 0);
      updated[index].com_actul_hr =
        start && end && end > start ? (end - start).toFixed(2) : 0;

      return { ...prev, compressorReading: updated };
    });
  };

  // Update totals for workDetails and surveys
  useEffect(() => {
    const updatedWorkDetails = formData.workDetails.map(work => ({
      ...work,
      total: work.workPoints && work.rate
        ? parseFloat(work.workPoints) * parseFloat(work.rate)
        : 0
    }));

    const updatedSurveys = formData.surveys.map(survey => ({
      ...survey,
      total: survey.survey_point && survey.rate
        ? parseFloat(survey.survey_point) * parseFloat(survey.rate)
        : 0
    }));

    const workTotal = updatedWorkDetails.reduce((sum, work) => sum + work.total, 0);
    const surveyTotal = updatedSurveys.reduce((sum, survey) => sum + survey.total, 0);
    const totalBill = workTotal + surveyTotal;

    setFormData(prev => ({
      ...prev,
      workDetails: updatedWorkDetails,
      surveys: updatedSurveys,
      totalBill
    }));
  }, [formData.workDetails, formData.surveys]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleProjectChange = (project) => {
    setFormData(prev => ({
      ...prev,
      project_id: project.id,
      project_name: project.project_name
    }));
    setSearchQuery(project.project_name);
    setProjects([]);
    setShowDropdown(false);
  };

  const handleWorkDetailChange = (index, field, value) => {
    const updatedWorkDetails = [...formData.workDetails];
    updatedWorkDetails[index] = { ...updatedWorkDetails[index], [field]: value };
    setFormData(prev => ({ ...prev, workDetails: updatedWorkDetails }));
  };

  const addWorkDetail = () => {
    setFormData(prev => ({
      ...prev,
      workDetails: [...prev.workDetails, { operator_id: '', workType: '', workPoints: '', rate: '', total: 0 }]
    }));
  };

  const removeWorkDetail = (index) => {
    setFormData(prev => ({
      ...prev,
      workDetails: prev.workDetails.filter((_, i) => i !== index)
    }));
  };

  const handleSurveyChange = (index, field, value) => {
    const updatedSurveys = [...formData.surveys];
    updatedSurveys[index] = {
      ...updatedSurveys[index],
      [field]: value,
      total: field === 'rate' || field === 'survey_point'
        ? (parseFloat(updatedSurveys[index].survey_point || 0) * parseFloat(updatedSurveys[index].rate || 0))
        : updatedSurveys[index].total
    };
    setFormData(prev => ({ ...prev, surveys: updatedSurveys }));
  };

  const addSurvey = () => {
    setFormData(prev => ({
      ...prev,
      surveys: [...prev.surveys, { operator_id: '', survey_type: '', survey_point: '', rate: '', total: 0 }]
    }));
  };

  const removeSurvey = (index) => {
    setFormData(prev => ({
      ...prev,
      surveys: prev.surveys.filter((_, i) => i !== index)
    }));
  };

  const handleRawMaterialChange = (index, field, value) => {
    const updatedRawMaterials = [...formData.rawMaterials];
    updatedRawMaterials[index] = { ...updatedRawMaterials[index], [field]: value };
    setFormData(prev => ({ ...prev, rawMaterials: updatedRawMaterials }));
  };

  const addRawMaterial = () => {
    setFormData(prev => ({
      ...prev,
      rawMaterials: [...prev.rawMaterials, { material_type: '', qty_used: '' }]
    }));
  };

  const removeRawMaterial = (index) => {
    setFormData(prev => ({
      ...prev,
      rawMaterials: prev.rawMaterials.filter((_, i) => i !== index)
    }));
  };

  const defaultFormData = {
    project_id: '',
    project_name: '',
    date: '',
    workDetails: [{ operator_id: '', workType: '', workPoints: '', rate: '', total: 0 }],
    surveys: [{ operator_id: '', survey_type: '', survey_point: '', rate: '', total: 0 }],
    machineReading: [{ oprator_id: '', machine_id: '', machine_start: '', machine_end: '', actual_machine_hr: 0 }],
    compressorReading: [{ oprator_id: '', machine_id: '', comp_rpm_start: '', comp_rpm_end: '', com_actul_hr: 0 }],
    rawMaterials: [{ material_type: '', qty_used: '' }],
  };

  const handleSubmit = async () => {
    // Section 1 Validation
    if (!formData.project_id) {
      showToast("danger", "Please select a Project.");
      return;
    }
    if (!formData.date) {
      showToast("danger", "Please select a Date.");
      return;
    }

    // Section 2 Validation (Machine Reading)
    for (let i = 0; i < formData.machineReading.length; i++) {
      const reading = formData.machineReading[i];
      if (reading.machine_start && reading.machine_end) {
        if (!reading.oprator_id) {
          showToast("danger", `Row ${i + 1}: Please select an Operator.`);
          return;
        }
        if (!reading.machine_id) {
          showToast("danger", `Row ${i + 1}: Please select a Machinery.`);
          return;
        }
      }
    }

    // Section 3 Validation (Work Details)
    for (let i = 0; i < formData.workDetails.length; i++) {
      const work = formData.workDetails[i];
      if (work.workPoints && work.rate) {
        if (!work.operator_id) {
          showToast("danger", `Row ${i + 1} (Work Details): Please select an Operator.`);
          return;
        }
        if (!work.workType) {
          showToast("danger", `Row ${i + 1} (Work Details): Please select a Work Type.`);
          return;
        }
      }
    }

    // Section 4 Validation (Survey Details)
    for (let i = 0; i < formData.surveys.length; i++) {
      const survey = formData.surveys[i];
      if (survey.survey_point && survey.rate) {
        if (!survey.operator_id) {
          showToast("danger", `Row ${i + 1} (Survey Details): Please select an Operator.`);
          return;
        }
        if (!survey.survey_type) {
          showToast("danger", `Row ${i + 1} (Survey Details): Please select a Survey Type.`);
          return;
        }
      }
    }

    // Section 5 Validation (Raw Materials)
    for (let i = 0; i < formData.rawMaterials.length; i++) {
      const material = formData.rawMaterials[i];
      if (material.qty_used) {
        if (!material.material_type) {
          showToast("danger", `Row ${i + 1} (Raw Materials): Please select a Material Type.`);
          return;
        }
      }
    }

    const payload = {
      project_id: formData.project_id,
      date: formData.date,
      work_points: formData.workDetails.map(work => ({
        operator_id: work.operator_id,
        work_type: work.workType,
        work_point: work.workPoints,
        rate: work.rate,
        total: work.total
      })),
      surveys: formData.surveys.map(survey => ({
        operator_id: survey.operator_id,
        survey_type: survey.survey_type,
        survey_point: survey.survey_point,
        rate: survey.rate,
        total: survey.total
      })),
      machineReading: formData.machineReading.map(machineRead => ({
        oprator_id: machineRead.oprator_id,
        machine_id: machineRead.machine_id,
        machine_start: machineRead.machine_start,
        machine_end: machineRead.machine_end,
        actual_machine_hr: machineRead.actual_machine_hr,
      })),
      compressor_rpm: formData.compressorReading.map(compRpm => ({
        oprator_id: compRpm.oprator_id,
        machine_id: compRpm.machine_id,
        comp_rpm_start: compRpm.comp_rpm_start,
        comp_rpm_end: compRpm.comp_rpm_end,
        com_actul_hr: compRpm.com_actul_hr,
      })),
      raw_material_usage: formData.rawMaterials.map(material => ({
        material_id: material.material_type,
        qty_used: material.qty_used
      })),
    };

    try {
      await post("/api/drilling", payload);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      navigate('/infraDetailsShowTable');
      setFormData({ ...defaultFormData });
    } catch (error) {
      console.error("Error saving data", error);
      showToast("danger", "Error saving data");
    }
  };

  return (
    <div className="">
      <CContainer fluid>
        {showSuccess && (
          <CAlert color="success" dismissible onClose={() => setShowSuccess(false)}>
            Form submitted successfully!
          </CAlert>
        )}

        <CCard className="">
          <CCardHeader className="bg-primary text-white">
            <h1 className="mb-2 h4 d-flex align-items-center">
              <CIcon icon={cilSettings} className="me-2" /> Daily Work Logic
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

      {/* 🔁 Toggle Search / Clear Button */}
      {!formData.project_name ? (
        <CButton
          color="primary"
          variant="outline"
          onClick={() => setShowProjectModal(true)}
        >
          <CIcon icon={cilSearch} />
        </CButton>
      ) : (
        <CButton
          type="button"
          color="danger"
          variant="outline"
          onClick={() => {
            setFormData((prev) => ({
              ...prev,
              project_name: "",
              project_id: "",
            }));
            setSearchQuery("");
            setShowDropdown(false);
          }}
        >
          <CIcon icon={cilX} />
        </CButton>
      )}
    </CInputGroup>

    {/* 🔽 Dropdown List */}
    {showDropdown && projects.length > 0 && (
      <div
        className="border rounded bg-white mt-1"
        style={{
          maxHeight: "150px",
          overflowY: "auto",
          position: "relative",
          zIndex: 1000,
        }}
      >
        {projects.map((project) => (
          <div
            key={project.id}
            className="p-2 hover-bg-light"
            style={{ cursor: "pointer" }}
            onClick={() => {
              handleProjectChange(project);
              setSearchQuery(project.project_name);
              setShowDropdown(false);
            }}
          >
            {project.project_name}
          </div>
        ))}
      </div>
    )}
  </CCol>

  <CCol md={6}>
    <CFormLabel>Date *</CFormLabel>
    <CFormInput
      type="date"
      value={formData.date}
      onChange={(e) => handleInputChange("date", e.target.value)}
    />
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
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          machineReading: [
                            ...prev.machineReading,
                            { oprator_id: '', machine_id: '', machine_start: '', machine_end: '', actual_machine_hr: 0 },
                          ],
                        }))
                      }
                    >
                      Add Machine Reading
                    </CButton>
                  </div>
                  <CRow className="g-1">
                    {formData.machineReading.map((reading, index) => (
                      <CRow className="mb-2 gx-1" key={index}>
                        <CCol xs={12} md={3} className="p-1">
                          <CFormLabel>Oprator / Helper *</CFormLabel>
                          <Select
                            options={operators}
                            isSearchable
                            placeholder="Select Oprator..."
                            value={operators.find((op) => op.value === reading.oprator_id) || null}
                            onChange={(selected) =>
                              handleMachineReadingChange(index, "oprator_id", selected ? selected.value : "")
                            }
                          />
                        </CCol>
                        <CCol xs={12} md={2} className="p-1">
                          <CFormLabel>Machinery *</CFormLabel>
                          <Select
                            options={machineries}
                            isSearchable
                            placeholder="Machinery"
                            value={machineries.find((m) => m.value === reading.machine_id) || null}
                            onChange={(selected) =>
                              handleMachineReadingChange(index, "machine_id", selected ? selected.value : "")
                            }
                          />
                        </CCol>
                        <CCol xs={12} sm={6} md={2} className="p-1">
                          <CFormLabel>Excavator Meter Start</CFormLabel>
                          <CFormInput
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9.:]*"
                            value={reading.machine_start === 0 ? "" : reading.machine_start}
                            placeholder="0"
                            onChange={(e) => {
                              let val = e.target.value.replace(/[^0-9.:]/g, "");
                              handleMachineReadingChange(index, "machine_start", val === "" ? 0 : val);
                            }}
                          />
                        </CCol>
                        <CCol xs={12} sm={6} md={2} className="p-1">
                          <CFormLabel>Excavator Meter End</CFormLabel>
                          <CFormInput
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9.:]*"
                            value={reading.machine_end === 0 ? "" : reading.machine_end}
                            placeholder="0"
                            onChange={(e) => {
                              let val = e.target.value.replace(/[^0-9.:]/g, "");
                              handleMachineReadingChange(index, "machine_end", val === "" ? 0 : val);
                            }}
                          />
                        </CCol>
                        <CCol xs={12} sm={6} md={2} className="p-1">
                          <CFormLabel>Actual Hours</CFormLabel>
                          <CInputGroup>
                            <CFormInput type="text" value={reading.actual_machine_hr} readOnly />
                            <CInputGroupText>hrs</CInputGroupText>
                          </CInputGroup>
                        </CCol>
                        <CCol xs={12} sm={6} md={1} className="d-flex align-items-center mt-4 p-1">
                          {formData.machineReading.length > 1 && (
                            <CButton
                              color="danger"
                              variant="ghost"
                              size="lg"
                              onClick={() =>
                                setFormData((prev) => {
                                  if (prev.machineReading.length <= 1) return prev;
                                  return {
                                    ...prev,
                                    machineReading: prev.machineReading.filter((_, i) => i !== index),
                                  };
                                })
                              }
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

              {/* Compressor RPM */}
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
                      onClick={() =>
                        setFormData(prev => ({
                          ...prev,
                          compressorReading: [
                            ...prev.compressorReading,
                            { oprator_id: '', machine_id: '', comp_rpm_start: '', comp_rpm_end: '', com_actul_hr: 0 },
                          ],
                        }))
                      }
                    >
                      Add Compressor Reading
                    </CButton>
                  </div>
                  {formData.compressorReading.map((rpmReading, index) => (
                    <CRow className="mb-2 gx-1" key={index}>
                      <CCol xs={12} md={3} className="p-1">
                        <CFormLabel>Oprator / Helper *</CFormLabel>
                        <Select
                          options={operators}
                          isSearchable
                          placeholder="Select Oprator..."
                          value={operators.find((op) => op.value === rpmReading.oprator_id) || null}
                          onChange={(selected) =>
                            handleCompressorChange(index, "oprator_id", selected ? selected.value : "")
                          }
                        />
                      </CCol>
                      <CCol xs={12} md={2} className="p-1">
                        <CFormLabel>Machinery *</CFormLabel>
                        <Select
                          options={machineries}
                          isSearchable
                          placeholder="Machinery"
                          value={machineries.find((m) => m.value === rpmReading.machine_id) || null}
                          onChange={(selected) =>
                            handleCompressorChange(index, "machine_id", selected ? selected.value : "")
                          }
                        />
                      </CCol>
                      <CCol xs={12} md={2} className="p-1">
                        <CFormLabel>RPM Start *</CFormLabel>
                        <CFormInput
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9.:]*"
                          value={rpmReading.comp_rpm_start}
                          placeholder="0"
                          onChange={(e) => {
                            let val = e.target.value.replace(/[^0-9.:]/g, '');
                            handleCompressorChange(index, "comp_rpm_start", val);
                          }}
                        />
                      </CCol>
                      <CCol xs={12} md={2} className="p-1">
                        <CFormLabel>RPM End *</CFormLabel>
                        <CFormInput
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9.:]*"
                          value={rpmReading.comp_rpm_end}
                          placeholder="0"
                          onChange={(e) => {
                            let val = e.target.value.replace(/[^0-9.:]/g, '');
                            handleCompressorChange(index, "comp_rpm_end", val);
                          }}
                        />
                      </CCol>
                      <CCol xs={12} md={2} className="p-1">
                        <CFormLabel>RPM Hours</CFormLabel>
                        <CInputGroup>
                          <CFormInput
                            value={rpmReading.com_actul_hr}
                            readOnly
                            className="bg-light fw-bold"
                          />
                          <CInputGroupText>hrs</CInputGroupText>
                        </CInputGroup>
                      </CCol>
                      <CCol xs={12} sm={6} md={1} className="d-flex align-items-center mt-4 p-1">
                        {formData.compressorReading.length > 1 && (
                          <CButton
                            color="danger"
                            variant="ghost"
                            size="lg"
                            onClick={() =>
                              setFormData(prev => ({
                                ...prev,
                                compressorReading: prev.compressorReading.filter((_, i) => i !== index)
                              }))
                            }
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
                    <CButton color="warning" variant="outline" onClick={addWorkDetail}>
                      Add Work
                    </CButton>
                  </div>
                  {formData.workDetails.map((work, index) => (
                    <CRow key={index} className="align-items-center mb-2">
                      <CCol md={3}>
                        <CFormLabel>Oprator</CFormLabel>
                        <Select
                          options={operators}
                          isSearchable
                          placeholder="Select Oprator..."
                          value={operators.find((op) => op.value === work.operator_id) || null}
                          onChange={(selected) =>
                            handleWorkDetailChange(index, "operator_id", selected ? selected.value : "")
                          }
                        />
                      </CCol>
                      <CCol lg={2}>
                        <CFormLabel>Work Type</CFormLabel>
                        <CFormSelect
                          value={work.workType}
                          onChange={(e) =>
                            handleWorkDetailChange(index, "workType", e.target.value)
                          }
                        >
                          <option value="">Select Work Type</option>
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
                          value={work.workPoints === 0 ? "" : work.workPoints}
                          placeholder="0"
                          onChange={(e) => {
                            let val = e.target.value.replace(/\D/g, "");
                            handleWorkDetailChange(
                              index,
                              "workPoints",
                              val === "" ? 0 : Number(val)
                            );
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
                            value={work.rate === 0 ? "" : work.rate}
                            placeholder="0"
                            onChange={(e) => {
                              let val = e.target.value.replace(/\D/g, "");
                              handleWorkDetailChange(
                                index,
                                "rate",
                                val === "" ? 0 : Number(val)
                              );
                            }}
                          />
                        </CInputGroup>
                      </CCol>
                      <CCol lg={2}>
                        <CFormLabel>Total</CFormLabel>
                        <CInputGroup>
                          <CInputGroupText>₹</CInputGroupText>
                          <CFormInput
                            value={work.total.toFixed(2)}
                            readOnly
                            className="bg-light fw-bold"
                          />
                        </CInputGroup>
                      </CCol>
                      <CCol lg={1}>
                        {formData.workDetails.length > 1 && (
                          <CButton
                            color="danger"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeWorkDetail(index)}
                          >
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
                    <CButton color="info" variant="outline" onClick={addSurvey}>
                      Add Survey
                    </CButton>
                  </div>
                  {formData.surveys.map((survey, index) => (
                    <CRow key={index} className="align-items-center mb-2">
                      <CCol md={3}>
                        <CFormLabel>Oprator</CFormLabel>
                        <Select
                          options={operators}
                          isSearchable
                          placeholder="Select Oprator..."
                          value={operators.find((op) => op.value === survey.operator_id) || null}
                          onChange={(selected) =>
                            handleSurveyChange(index, "operator_id", selected ? selected.value : "")
                          }
                        />
                      </CCol>
                      <CCol lg={2}>
                        <CFormLabel>Survey Type</CFormLabel>
                        <CFormSelect
                          value={survey.survey_type}
                          onChange={(e) =>
                            handleSurveyChange(index, "survey_type", e.target.value)
                          }
                        >
                          <option value="">Select Survey Type</option>
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
                          value={survey.survey_point === 0 ? "" : survey.survey_point}
                          placeholder="0"
                          onChange={(e) => {
                            let val = e.target.value.replace(/\D/g, "");
                            handleSurveyChange(
                              index,
                              "survey_point",
                              val === "" ? 0 : Number(val)
                            );
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
                            value={survey.rate === 0 ? "" : survey.rate}
                            placeholder="0"
                            onChange={(e) => {
                              let val = e.target.value.replace(/\D/g, "");
                              handleSurveyChange(
                                index,
                                "rate",
                                val === "" ? 0 : Number(val)
                              );
                            }}
                          />
                        </CInputGroup>
                      </CCol>
                      <CCol lg={2}>
                        <CFormLabel>Total</CFormLabel>
                        <CInputGroup>
                          <CInputGroupText>₹</CInputGroupText>
                          <CFormInput
                            value={survey.total.toFixed(2)}
                            readOnly
                            className="bg-light fw-bold"
                          />
                        </CInputGroup>
                      </CCol>
                      <CCol lg={1}>
                        {formData.surveys.length > 1 && (
                          <CButton
                            color="danger"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSurvey(index)}
                          >
                            <CIcon icon={cilX} />
                          </CButton>
                        )}
                      </CCol>
                    </CRow>
                  ))}
                </CCardBody>
              </CCard>

              {/* Raw Material Section */}
              <CCard className="mb-4 border-0" color="secondary" textColor="dark">
                <CCardBody className="bg-secondary-subtle rounded rounded-lg">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="text-secondary mb-0 d-flex align-items-center">
                      <CIcon icon={cilCalculator} className="me-2" /> 6. Raw Material
                    </h5>
                    <CButton color="secondary" variant="outline" onClick={addRawMaterial}>
                      Add Material
                    </CButton>
                  </div>
                  {formData.rawMaterials.map((material, index) => (
                    <CRow key={index} className="align-items-center mb-2">
                      <CCol lg={4}>
                        <CFormLabel>Material Type</CFormLabel>
                        <CFormSelect
                          value={material.material_type}
                          onChange={(e) =>
                            handleRawMaterialChange(index, "material_type", e.target.value)
                          }
                        >
                          <option value="">Select Material Type</option>
                          {materialTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </CFormSelect>
                      </CCol>
                      <CCol lg={4}>
                        <CFormLabel>Quantity Used</CFormLabel>
                        <CFormInput
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={material.qty_used === '' ? "" : material.qty_used}
                          placeholder="0"
                          onChange={(e) => {
                            let val = e.target.value.replace(/\D/g, "");
                            handleRawMaterialChange(
                              index,
                              "qty_used",
                              val === "" ? '' : Number(val)
                            );
                          }}
                        />
                      </CCol>




<CCol lg={3}>
  <CFormLabel>Unit</CFormLabel>
  <CFormSelect
    value={material.unit || ""}
    onChange={(e) =>
      handleRawMaterialChange(index, "unit", e.target.value)
    }
    disabled={!material.material_type} // disable if no material selected
  >
    <option value="">Select Unit</option>

    {(() => {
      // Find the selected material from API list
      const selectedMaterial = materials.find(
        (m) => m.id === parseInt(material.material_type)
      );

      // Extract unit from the first log if available
      const unitFromLog = selectedMaterial?.logs?.[0]?.unit;

      // If we got a unit, show it as only option
      if (unitFromLog) {
        return (
          <option key={unitFromLog} value={unitFromLog}>
            {unitFromLog.toUpperCase()}
          </option>
        );
      }

      // fallback if no unit in log
      return <option value="NA">NA</option>;
    })()}
  </CFormSelect>
</CCol>





                      <CCol lg={1}>
                        {formData.rawMaterials.length > 1 && (
                          <CButton
                            color="danger"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeRawMaterial(index)}
                          >
                            <CIcon icon={cilX} />
                          </CButton>
                        )}
                      </CCol>
                    </CRow>
                  ))}
                </CCardBody>
              </CCard>

              {/* Submit Section */}
              <div className="d-flex justify-content-center">
                <CButton color="danger" size="lg" className="px-5 d-flex align-items-center" onClick={handleSubmit}>
                  <CIcon icon={cilFile} className="me-2" /> Submit
                </CButton>
              </div>
            </CForm>
          </CCardBody>
        </CCard>
      </CContainer>

      {/* Project Selection Modal */}
      <ProjectSelectionModal
        visible={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        onSelectProject={handleProjectChange}
      />
    </div>
  );
};

export default MachineUsageForm;