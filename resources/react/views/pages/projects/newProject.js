import {
  CCard,
  CCardHeader,
  CCardBody,
  CForm,
  CFormInput,
  CFormLabel,
  CFormTextarea,
  CFormCheck,
  CButton,
  CAlert,
  CCol,
} from "@coreui/react";
import { useState, useEffect } from "react";
import { getAPICall, post } from "../../../util/api";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { getUserData, getUserType } from "../../../util/session";

const ProjectForm = () => {
  const [formData, setFormData] = useState({
    customer_name:"",
    mobile_number:"",
    project_name: "",
    project_cost:"",
    supervisor_id: "",
    work_place: "",
    commission: "",
    start_date: "",
    end_date: "",
    is_visible: true,
    remark: "",
    gst_number:"",
    pan_number:"",
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const userType = getUserType();
  const user = getUserData();
  const userId = user?.id;

  useEffect(() => {
    if (userType === 2 && userId) {
      setFormData((prev) => ({ ...prev, supervisor_id: userId }));
    }
    fetchUsers();
  }, [userType, userId]);

  const fetchUsers = async () => {
    try {
      const response = await getAPICall("/api/usersData");
      setUsers(response?.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess("");
    setLoading(true);

    if (
      formData.end_date &&
      formData.start_date &&
      new Date(formData.end_date) < new Date(formData.start_date)
    ) {
      setErrors({ end_date: "End date must be after or equal to start date." });
      setLoading(false);
      return;
    }

    try {
      await post("/api/storeManually", formData);                 // /projects
      setSuccess("Project created successfully!");
      navigate("/project"); // go back to table page
    } catch (error) {
      console.error("Error creating project:", error);
      if (error.response?.data.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({
          general:
            error.response?.data?.message || "Failed to create project.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-lg p-2">
      <CCard>
        <CCardHeader>Create New Project</CCardHeader>
        <CCardBody>
          {success && <CAlert color="success">{success}</CAlert>}
          {errors.general && <CAlert color="danger">{errors.general}</CAlert>}
          <CForm onSubmit={handleSubmit}>
            <div className="row g-3">
            <CCol md={4}>
                <CFormLabel>Customer Name</CFormLabel>
                <CFormInput
                  type="text"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleChange}
                  required
                  placeholder="Enter Customer Name..."
                />
              </CCol>

               {/* <CCol md={4}>
                <CFormLabel>Customer Mobile Number</CFormLabel>
                <CFormInput
                  type="text"
                  name="mobile_number"
                  value={formData.mobile_number}
                  onChange={handleChange}
                  required
                  placeholder="Enter Customer Mobile..."
                />
              </CCol> */}
              <CCol md={4}>
  <CFormLabel>Customer Mobile Number</CFormLabel>
  <CFormInput
    type="text"
    name="mobile_number"
    value={formData.mobile_number}
    onChange={(e) => {
      // Allow only numbers and max 10 digits
      const value = e.target.value.replace(/\D/g, ''); // remove non-digits
      if (value.length <= 10) {
        handleChange({ target: { name: 'mobile_number', value } });
      }
    }}
    required
    placeholder="Enter Customer Mobile..."
  />
</CCol>



<CCol md={4}>
                <CFormLabel>GST number</CFormLabel>
                <CFormInput
                  type="text"
                  name="gst_number"
                  value={formData.gst_number}
                  onChange={handleChange}
                  required
                  placeholder="Enter GST number..."
                />
              </CCol>

              <CCol md={4}>
                <CFormLabel>Pan Card number</CFormLabel>
                <CFormInput
                  type="text"
                  name="pan_number"
                  value={formData.pan_number}
                  onChange={handleChange}
                  required
                  placeholder="Enter Pan Card number..."
                />
              </CCol>

              <CCol md={4}>
                <CFormLabel>Project Name</CFormLabel>
                <CFormInput
                  type="text"
                  name="project_name"
                  value={formData.project_name}
                  onChange={handleChange}
                  required
                  placeholder="Enter Project Name..."
                />
              </CCol>

              <CCol md={4}>
                <CFormLabel>Project Cost</CFormLabel>
                <CFormInput
                  type="number"
                  name="project_cost"
                  value={formData.project_cost}
                  onChange={handleChange}
                  required
                  placeholder="Enter Project cost..."
                />
              </CCol>



               <CCol md={4}>
                <CFormLabel>Work Place</CFormLabel>
                <CFormInput
                  type="text"
                  name="work_place"
                  value={formData.work_place}
                  onChange={handleChange}
                  required
                  placeholder="Enter Work Place Address..."
                />
              </CCol>

              {userType === 1 && (
                <CCol md={6}>
                  <CFormLabel>Supervisor</CFormLabel>
                  <Select
                    options={users.map((u) => ({
                      value: u.id,
                      label: u.name,
                    }))}
                    value={
                      users
                        .map((u) => ({ value: u.id, label: u.name }))
                        .find((u) => u.value === formData.supervisor_id) || null
                    }
                    onChange={(selected) =>
                      setFormData((prev) => ({
                        ...prev,
                        supervisor_id: selected ? selected.value : "",
                      }))
                    }
                  />
                </CCol>
              )}

             

              {/* <CCol md={6}>
                <CFormLabel>Commission</CFormLabel>
                <CFormInput
                  type="text"
                  name="commission"
                  value={formData.commission}
                  onChange={handleChange}
                  required
                />
              </CCol> */}
              <CCol md={6}>
  <CFormLabel>Commission</CFormLabel>
  <CFormInput
    type="text"
    name="commission"
    value={formData.commission}
    onChange={(e) => {
      // Allow only digits, dot, and colon
      const val = e.target.value.replace(/[^0-9.:]/g, '');
      handleChange({
        target: {
          name: "commission",
          value: val
        }
      });
    }}
    required
    placeholder="Enter Oprator Comission ( Per Point )"
  />
</CCol>



  


              <CCol md={6}>
                <CFormLabel>Start Date</CFormLabel>
                <CFormInput
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                />
              </CCol>

              <CCol md={6}>
                <CFormLabel>End Date</CFormLabel>
                <CFormInput
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                />
              </CCol>

              <CCol xs={12}>
                <CFormCheck
                  id="is_visible"
                  name="is_visible"
                  checked={formData.is_visible}
                  onChange={handleChange}
                  label="Is Visible"
                />
              </CCol>

              <CCol xs={12}>
                <CFormLabel>Remark</CFormLabel>
                <CFormTextarea
                  name="remark"
                  value={formData.remark}
                  onChange={handleChange}
                  placeholder="Enter Remark About Project"
                />
              </CCol>

              <CCol xs={12}>
                <CButton type="submit" color="primary" disabled={loading}>
                  {loading ? "Submitting..." : "Create Project"}
                </CButton>
                <CButton
                  type="button"
                  color="secondary"
                  className="ms-2"
                  onClick={() => navigate("/project")}
                >
                  Cancel
                </CButton>
              </CCol>
            </div>
          </CForm>
        </CCardBody>
      </CCard>
    </div>
  );
};

export default ProjectForm;
