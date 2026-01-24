import {
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CButton,
  CFormInput,
  CFormTextarea,
  CFormSwitch,
  CFormLabel,
  CCol,
  CRow,
} from "@coreui/react";
import { useState, useEffect } from "react";
import { put, getAPICall } from "../../../util/api";
import { getUserType } from "../../../util/session";
import Select from "react-select";
import { useToast } from "../../common/toast/ToastContext";

const EditProjectModal = ({ project, onClose, onUpdateSuccess }) => {
  const [form, setForm] = useState({
    ...project,
    start_date: project.start_date ? project.start_date.split("T")[0] : "",
    end_date: project.end_date ? project.end_date.split("T")[0] : "",
  });

  const { showToast } = useToast();

  const userType = getUserType();
  const [users, setUsers] = useState([]);
  const [projectTypes, setProjectTypes] = useState([]);

  // Fetch Project Types
  const fetchProjectTypes = async () => {
    try {
      const response = await getAPICall("/api/project-types");
      setProjectTypes(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error("Error fetching project types:", error);
    }
  };

  useEffect(() => {
    fetchProjectTypes();
  }, []);

  // ✅ Fetch supervisor list
  const fetchUsers = async () => {
    try {
      const response = await getAPICall("/api/usersData");
      setUsers(response?.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    }
  };

  useEffect(() => {
    if (userType === 1 || userType === 3) fetchUsers();
  }, [userType]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const response = await put(`/api/projectsUpdate/${form.id}`, form);
      if (response.success) {
        showToast("success","Project updated successfully");
        onUpdateSuccess();
      }
    } catch (error) {
      console.error("Error updating project:", error);
      showToast("danger","Error updating project");
    }
  };

  return (
    <CModal 
      visible={true} 
      onClose={onClose} 
      alignment="center" 
      size="lg"
      backdrop="static"
      keyboard={true}
      scrollable
    >
      <CModalHeader closeButton>
        <strong>Update Project</strong>
      </CModalHeader>
      
      <CModalBody className="p-3 p-md-4">
        <CRow className="g-3">
          {/* Customer Name */}
          <CCol xs={12} md={6}>
            <CFormInput
              label="Customer Name"
              name="customer_name"
              value={form.customer_name || ""}
              onChange={handleChange}
            />
          </CCol>

          {/* Mobile Number */}
          <CCol xs={12} md={6}>
            <CFormInput
              label="Mobile Number"
              name="mobile_number"
              type="tel"
              value={form.mobile_number || ""}
              onChange={handleChange}
            />
          </CCol>

          {/* Project Type */}
           <CCol xs={12} md={6}>
              <CFormLabel>Project Type</CFormLabel>
              <Select
                options={projectTypes.map((t) => ({
                  value: t.id,
                  label: t.name,
                }))}
                value={
                  projectTypes
                    .map((t) => ({ value: t.id, label: t.name }))
                    .find((t) => t.value === form.project_type_id) || null
                }
                onChange={(selected) =>
                  setForm((prev) => ({
                    ...prev,
                    project_type_id: selected ? selected.value : "",
                  }))
                }
                placeholder="Select Project Type"
                isClearable
              />
            </CCol>

          {/* Project Name */}
          <CCol xs={12} md={6}>
            <CFormInput
              label="Project Name"
              name="project_name"
              value={form.project_name || ""}
              onChange={handleChange}
            />
          </CCol>

          {/* Project Cost */}
          <CCol xs={12} md={6}>
            <CFormInput
              label="Project Cost"
              name="project_cost"
              type="number"
              value={form.project_cost || ""}
              onChange={handleChange}
            />
          </CCol>

          {/* Work Place */}
          <CCol xs={12} md={6}>
            <CFormInput
              label="Work Place"
              name="work_place"
              value={form.work_place || ""}
              onChange={handleChange}
            />
          </CCol>

          {/* Start Date */}
          <CCol xs={12} md={6}>
            <CFormInput
              type="date"
              label="Start Date"
              name="start_date"
              value={form.start_date || ""}
              onChange={handleChange}
            />
          </CCol>

          {/* End Date */}
          <CCol xs={12} md={6}>
            <CFormInput
              type="date"
              label="End Date"
              name="end_date"
              value={form.end_date || ""}
              onChange={handleChange}
            />
          </CCol>

          {/* Supervisor Dropdown */}
          {(userType === 1 || userType === 3) && (
            <CCol xs={12} md={6}>
              <CFormLabel>Supervisor</CFormLabel>
              <Select
                options={users.map((u) => ({
                  value: u.id,
                  label: u.name,
                }))}
                value={
                  users
                    .map((u) => ({ value: u.id, label: u.name }))
                    .find((u) => u.value === form.supervisor_id) || null
                }
                onChange={(selected) =>
                  setForm((prev) => ({
                    ...prev,
                    supervisor_id: selected ? selected.value : "",
                  }))
                }
                placeholder="Select Supervisor"
                isClearable
              />
            </CCol>
          )}

          {/* Commission */}
          <CCol xs={12} md={6}>
            <CFormInput
              label="Commission"
              name="commission"
              type="number"
              value={form.commission || ""}
              onChange={handleChange}
            />
          </CCol>

          {/* GST Number */}
          <CCol xs={12} md={6}>
            <CFormInput
              label="GST Number"
              name="gst_number"
              value={form.gst_number || ""}
              onChange={handleChange}
            />
          </CCol>

          {/* PAN Number */}
          <CCol xs={12} md={6}>
            <CFormInput
              label="PAN Number"
              name="pan_number"
              value={form.pan_number || ""}
              onChange={handleChange}
            />
          </CCol>



          {/* Remark */}
          <CCol xs={12}>
            <CFormTextarea
              label="Remark"
              name="remark"
              rows={3}
              value={form.remark || ""}
              onChange={handleChange}
            />
          </CCol>

          {/* Visible Switch */}
          <CCol xs={12}>
            <CFormSwitch
              id="is_visible"
              label="Visible"
              name="is_visible"
              checked={form.is_visible === 1 || form.is_visible === true}
              onChange={handleChange}
            />
          </CCol>
        </CRow>
      </CModalBody>

      <CModalFooter className="d-flex gap-2">
        <CButton 
          color="secondary" 
          onClick={onClose}
        >
          Cancel
        </CButton>
        <CButton 
          color="primary" 
          onClick={handleSubmit}
        >
          Save Changes
        </CButton>
      </CModalFooter>
    </CModal>
  );
};

export default EditProjectModal;