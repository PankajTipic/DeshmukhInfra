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
} from "@coreui/react";
import { useState, useEffect } from "react";
import { put, getAPICall } from "../../../util/api";
import { getUserType } from "../../../util/session";
import Select from "react-select"; // ✅ correct import
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
    <CModal visible={true} onClose={onClose} alignment="center" size="lg">
      <CModalHeader>Update Project</CModalHeader>
      <CModalBody>
        <div className="row">
          <div className="col-md-6 mb-2">
            <CFormInput
              label="Customer Name"
              name="customer_name"
              value={form.customer_name || ""}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-6 mb-2">
            <CFormInput
              label="Mobile Number"
              name="mobile_number"
              value={form.mobile_number || ""}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-6 mb-2">
            <CFormInput
              label="Project Name"
              name="project_name"
              value={form.project_name || ""}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-6 mb-2">
            <CFormInput
              label="Project Cost"
              name="project_cost"
              value={form.project_cost || ""}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-6 mb-2">
            <CFormInput
              label="Work Place"
              name="work_place"
              value={form.work_place || ""}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-6 mb-2">
            <CFormInput
              type="date"
              label="Start Date"
              name="start_date"
              value={form.start_date || ""}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-6 mb-2">
            <CFormInput
              type="date"
              label="End Date"
              name="end_date"
              value={form.end_date || ""}
              onChange={handleChange}
            />
          </div>

          {/* ✅ Supervisor Dropdown */}
          {(userType === 1 || userType === 3) &&(
            <CCol md={6} className="mb-2">
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
              />
            </CCol>
          )}

          <div className="col-md-6 mb-2">
            <CFormInput
              label="Commission"
              name="commission"
              value={form.commission || ""}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-6 mb-2">
            <CFormInput
              label="GST Number"
              name="gst_number"
              value={form.gst_number || ""}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-6 mb-2">
            <CFormInput
              label="PAN Number"
              name="pan_number"
              value={form.pan_number || ""}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-12 mb-2">
            <CFormTextarea
              label="Remark"
              name="remark"
              rows={3}
              value={form.remark || ""}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-6 mb-3 d-flex align-items-center">
            <CFormSwitch
              id="is_visible"
              label="Visible"
              name="is_visible"
              checked={form.is_visible === 1 || form.is_visible === true}
              onChange={handleChange}
            />
          </div>
        </div>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={onClose}>
          Cancel
        </CButton>
        <CButton color="primary" onClick={handleSubmit}>
          Save Changes
        </CButton>
      </CModalFooter>
    </CModal>
  );
};

export default EditProjectModal;
