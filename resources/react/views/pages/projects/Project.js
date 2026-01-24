
// import { useState, useEffect } from "react";
// import {
//   CCard,
//   CCardHeader,
//   CCardBody,
//   CTable,
//   CTableHead,
//   CTableRow,
//   CTableHeaderCell,
//   CTableBody,
//   CTableDataCell,
//   CFormSwitch,
//   CAlert,
//   CButton,
//   CBadge,
// } from "@coreui/react";
// import { getAPICall, put } from "../../../util/api";
// import { useNavigate } from "react-router-dom";
// import { Table } from "tabler-icons-react";
// import EditProjectModal from "./EditProjectModal";

// const ProjectList = () => {
//   const [projects, setProjects] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [errors, setErrors] = useState({});
//   const [success, setSuccess] = useState("");
//   const navigate = useNavigate();

//   const [selectedProject, setSelectedProject] = useState(null);
// const [showEditModal, setShowEditModal] = useState(false);

// const handleEditClick = (project) => {
//   setSelectedProject(project);
//   setShowEditModal(true);
// };


//   const fetchProjects = async () => {
//     try {
//       setLoading(true);
//       const response = await getAPICall("/api/myProjects");
//       setProjects(Array.isArray(response) ? response : []);
//       setErrors({});
//     } catch (error) {
//       console.error("Error fetching projects:", error);
//       setProjects([]);
//       setErrors({
//         general:
//           error.response?.data?.message ||
//           "Failed to fetch projects. Please check the server and try again.",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchProjects();
//   }, []);

//   const handleVisibilityToggle = async (projectId, currentVisibility) => {
//     try {
//       setLoading(true);
//       await put(`/api/projects/${projectId}`, {
//         is_visible: !currentVisibility,
//       });
//       setSuccess("Project visibility updated successfully!");
//       await fetchProjects();
//     } catch (error) {
//       console.error("Error updating visibility:", error);
//       setErrors({
//         general:
//           error.response?.data?.message ||
//           "Failed to update project visibility.",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="container-lg p-2">
//       <CCard>
//         <CCardHeader className="d-flex justify-content-between align-items-center">
//          <strong>Projects</strong>
//           <CButton color="danger" onClick={() => navigate("/projects/new")}>
//              New Project 
//           </CButton>
//         </CCardHeader>
//         <CCardBody>
//           {success && <CAlert color="success">{success}</CAlert>}
//           {errors.general && <CAlert color="danger">{errors.general}</CAlert>}
//           {loading && <CAlert color="info">Loading projects...</CAlert>}
//           <CTable responsive hover>
//             <CTableHead>
//               <CTableRow>
//                 <CTableHeaderCell>ID</CTableHeaderCell>
//                  <CTableHeaderCell>Customer Name</CTableHeaderCell>
//                 <CTableHeaderCell>Project Name</CTableHeaderCell>
//                 <CTableHeaderCell>Work Place</CTableHeaderCell>
//                 <CTableHeaderCell>Start Date</CTableHeaderCell>
//                 <CTableHeaderCell>End Date</CTableHeaderCell>
//                 <CTableHeaderCell>Supervisor</CTableHeaderCell>
//                 <CTableHeaderCell>Remark</CTableHeaderCell>
//                 <CTableHeaderCell>Commission</CTableHeaderCell>
//                 <CTableHeaderCell>Visible</CTableHeaderCell>
//                 <CTableHeaderCell>Action</CTableHeaderCell>

//               </CTableRow>
//             </CTableHead>
//             <CTableBody>
//               {projects.length > 0 ? (
//                 projects.map((project) => (
//                   <CTableRow key={project.id}>
//                     <CTableDataCell>{project.id}</CTableDataCell>
//                       <CTableDataCell>{project.customer_name}</CTableDataCell>
//                     <CTableDataCell>{project.project_name}</CTableDataCell>
//                     <CTableDataCell>{project.work_place}</CTableDataCell>
//                     <CTableDataCell>
//                       {project.start_date || "N/A"}
//                     </CTableDataCell>
//                     <CTableDataCell>{project.end_date || "N/A"}</CTableDataCell>
//                     <CTableDataCell>
//                       {project.supervisor?.name || "N/A"}
//                     </CTableDataCell>
//                     <CTableDataCell>{project.remark || "N/A"}</CTableDataCell>
//                     <CTableDataCell>{project.commission || "N/A"}</CTableDataCell>
//                     <CTableDataCell>
//                       <CFormSwitch
//                         checked={project.is_visible}
//                         onChange={() =>
//                           handleVisibilityToggle(
//                             project.id,
//                             project.is_visible
//                           )
//                         }
//                         disabled={loading}
//                       />
//                     </CTableDataCell>
//                     {/* <CTableDataCell>{project.is_confirm === 1 ? 'Completed' : 'Pending' }</CTableDataCell> */}
//                     {/* <CTableDataCell>
//   {project.is_confirm === 1 ? (
//     <CBadge color="success">Completed</CBadge>
//   ) : (
//     <CBadge color="warning">Pending</CBadge>
//   )}
// </CTableDataCell> */}

// <CTableDataCell>
//   <CButton
//     color="warning"
//     size="sm"
//     onClick={() => handleEditClick(project)}
//   >
//     Edit
//   </CButton>
// </CTableDataCell>

//                   </CTableRow>
//                 ))
//               ) : (
//                 <CTableRow>
//                   <CTableDataCell colSpan="9" className="text-center">
//                     No projects found.
//                   </CTableDataCell>
//                 </CTableRow>
//               )}
//             </CTableBody>
//           </CTable>

// {showEditModal && selectedProject && (
//             <EditProjectModal
//               project={selectedProject}
//               onClose={() => setShowEditModal(false)}
//               onUpdateSuccess={() => {
//                 setShowEditModal(false);
//                 fetchProjects();
//               }}
//             />
//           )}


//         </CCardBody>
//       </CCard>
//     </div>
//   );
// };

// export default ProjectList;




import { useState, useEffect } from "react";
import {
  CCard,
  CCardHeader,
  CCardBody,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CFormSwitch,
  CAlert,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CRow,
  CCol,
  CBadge,
} from "@coreui/react";
import { getAPICall, put, deleteAPICall } from "../../../util/api";
import { useNavigate } from "react-router-dom";
import EditProjectModal from "./EditProjectModal";
import { getUserType } from "../../../util/session";

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const [selectedProject, setSelectedProject] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // DELETE MODAL STATES
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);

  const userType = getUserType();

  const handleEditClick = (project) => {
    setSelectedProject(project);
    setShowEditModal(true);
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await getAPICall("/api/myProjects");
      setProjects(Array.isArray(response) ? response : []);
      setErrors({});
    } catch (error) {
      console.error("Error fetching projects:", error);
      setProjects([]);
      setErrors({
        general:
          error.response?.data?.message ||
          "Failed to fetch projects. Please check the server and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleVisibilityToggle = async (projectId, currentVisibility) => {
    try {
      setLoading(true);
      await put(`/api/projects/${projectId}`, {
        is_visible: !currentVisibility,
      });
      setSuccess("Project visibility updated successfully!");
      await fetchProjects();
    } catch (error) {
      console.error("Error updating visibility:", error);
      setErrors({
        general:
          error.response?.data?.message ||
          "Failed to update project visibility.",
      });
    } finally {
      setLoading(false);
    }
  };

  // OPEN DELETE MODAL
  const openDeleteModal = (item) => {
    setDeleteItem(item);
    setDeleteModal(true);
  };

  // DELETE CONFIRM
  const confirmDelete = async () => {
    try {
      await deleteAPICall(`/api/projectsDelete/${deleteItem.id}`);
      setDeleteModal(false);
      setSuccess("Project deleted successfully!");
      fetchProjects();
    } catch (error) {
      console.log("Delete error:", error);
      setErrors({ general: "Failed to delete project." });
    }
  };

  // Mobile Card View Component
  const MobileProjectCard = ({ project }) => (
    <CCard className="mb-3">
      <CCardBody>
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div>
            <small className="text-muted">Type: {project.project_type?.name || "N/A"}</small>
            <h6 className="mb-1">{project.project_name}</h6>
            <small className="text-muted">ID: {project.id}</small>
          </div>
          <CBadge color={project.is_visible ? "success" : "secondary"}>
            {project.is_visible ? "Visible" : "Hidden"}
          </CBadge>
        </div>

        <div className="mb-2">
          <small className="text-muted d-block">Customer</small>
          <div>{project.customer_name}</div>
        </div>

        <CRow className="mb-2">
          <CCol xs="6">
            <small className="text-muted d-block">Work Place</small>
            <div className="small">{project.work_place}</div>
          </CCol>
          <CCol xs="6">
            <small className="text-muted d-block">Supervisor</small>
            <div className="small">{project.supervisor?.name || "N/A"}</div>
          </CCol>
        </CRow>

        <CRow className="mb-2">
          <CCol xs="6">
            <small className="text-muted d-block">Start Date</small>
            <div className="small">{project.start_date || "N/A"}</div>
          </CCol>
          <CCol xs="6">
            <small className="text-muted d-block">End Date</small>
            <div className="small">{project.end_date || "N/A"}</div>
          </CCol>
        </CRow>

        <CRow className="mb-3">
          <CCol xs="6">
            <small className="text-muted d-block">Commission</small>
            <div className="small">{project.commission || "N/A"}</div>
          </CCol>
          <CCol xs="6">
            <small className="text-muted d-block">Remark</small>
            <div className="small text-truncate">{project.remark || "N/A"}</div>
          </CCol>
        </CRow>

        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2">
            <small className="text-muted me-2">Visibility:</small>
            <CFormSwitch
              checked={project.is_visible}
              onChange={() =>
                handleVisibilityToggle(project.id, project.is_visible)
              }
              disabled={loading}
            />
          </div>

          <div className="d-flex gap-2">
            <CButton
              color="warning"
              size="sm"
              onClick={() => handleEditClick(project)}
            >
              Edit
            </CButton>
            {(userType === 1 || userType === 3) && (
              <CButton
                color="danger"
                size="sm"
                onClick={() => openDeleteModal(project)}
              >
                Delete
              </CButton>
            )}
          </div>
        </div>
      </CCardBody>
    </CCard>
  );

  return (
    <div className="container-fluid p-2 p-md-3">
      <CCard>
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <strong>Projects</strong>
          <CButton color="danger" onClick={() => navigate("/projects/new")}>
            New Project
          </CButton>
        </CCardHeader>

        <CCardBody>
          {success && <CAlert color="success">{success}</CAlert>}
          {errors.general && <CAlert color="danger">{errors.general}</CAlert>}
          {loading && <CAlert color="info">Loading projects...</CAlert>}

          {/* Desktop Table View - Hidden on mobile */}
          <div className="d-none d-lg-block">
            <div className="table-responsive">
              <CTable hover>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>ID</CTableHeaderCell>
                    <CTableHeaderCell>Customer Name</CTableHeaderCell>
                    <CTableHeaderCell>Project Type</CTableHeaderCell>
                    <CTableHeaderCell>Project Name</CTableHeaderCell>
                    <CTableHeaderCell>Work Place</CTableHeaderCell>
                    <CTableHeaderCell>Start Date</CTableHeaderCell>
                    <CTableHeaderCell>End Date</CTableHeaderCell>
                    <CTableHeaderCell>Supervisor</CTableHeaderCell>
                    <CTableHeaderCell>Remark</CTableHeaderCell>
                    <CTableHeaderCell>Commission</CTableHeaderCell>
                    <CTableHeaderCell>Visible</CTableHeaderCell>
                    <CTableHeaderCell>Action</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>

                <CTableBody>
                  {projects.length > 0 ? (
                    projects.map((project) => (
                      <CTableRow key={project.id}>
                        <CTableDataCell>{project.id}</CTableDataCell>
                        <CTableDataCell>{project.customer_name}</CTableDataCell>
                        <CTableDataCell>{project.project_type?.name || "N/A"}</CTableDataCell>
                        <CTableDataCell>{project.project_name}</CTableDataCell>
                        <CTableDataCell>{project.work_place}</CTableDataCell>
                        <CTableDataCell>{project.start_date || "N/A"}</CTableDataCell>
                        <CTableDataCell>{project.end_date || "N/A"}</CTableDataCell>
                        <CTableDataCell>{project.supervisor?.name || "N/A"}</CTableDataCell>
                        <CTableDataCell>
                          <div style={{ maxWidth: "150px" }} className="text-truncate">
                            {project.remark || "N/A"}
                          </div>
                        </CTableDataCell>
                        <CTableDataCell>{project.commission || "N/A"}</CTableDataCell>

                        <CTableDataCell>
                          <CFormSwitch
                            checked={project.is_visible}
                            onChange={() =>
                              handleVisibilityToggle(project.id, project.is_visible)
                            }
                            disabled={loading}
                          />
                        </CTableDataCell>

                        <CTableDataCell>
                          <div className="d-flex gap-2 flex-nowrap">
                            <CButton
                              color="warning"
                              size="sm"
                              onClick={() => handleEditClick(project)}
                            >
                              Edit
                            </CButton>
                            {(userType === 1 || userType === 3) && (
                              <CButton
                                color="danger"
                                size="sm"
                                onClick={() => openDeleteModal(project)}
                              >
                                Delete
                              </CButton>
                            )}
                          </div>
                        </CTableDataCell>
                      </CTableRow>
                    ))
                  ) : (
                    <CTableRow>
                      <CTableDataCell colSpan="11" className="text-center">
                        No projects found.
                      </CTableDataCell>
                    </CTableRow>
                  )}
                </CTableBody>
              </CTable>
            </div>
          </div>

          {/* Mobile Card View - Shown on mobile and tablet */}
          <div className="d-lg-none">
            {projects.length > 0 ? (
              projects.map((project) => (
                <MobileProjectCard key={project.id} project={project} />
              ))
            ) : (
              <CAlert color="info" className="text-center">
                No projects found.
              </CAlert>
            )}
          </div>

          {/* EDIT MODAL */}
          {showEditModal && selectedProject && (
            <EditProjectModal
              project={selectedProject}
              onClose={() => setShowEditModal(false)}
              onUpdateSuccess={() => {
                setShowEditModal(false);
                fetchProjects();
              }}
            />
          )}

          {/* DELETE CONFIRM MODAL */}
          <CModal visible={deleteModal} onClose={() => setDeleteModal(false)}>
            <CModalHeader closeButton>
              <CModalTitle>
                Delete Project - {deleteItem?.project_name}?
              </CModalTitle>
            </CModalHeader>

            <CModalBody>
              <p style={{ fontSize: "16px" }}>
                Do you really want to{" "}
                <span style={{ color: "red", fontWeight: "bold" }}>Delete</span>{" "}
                this project?
              </p>
            </CModalBody>

            <CModalFooter>
              <CButton color="secondary" onClick={() => setDeleteModal(false)}>
                Close
              </CButton>
              <CButton color="primary" onClick={confirmDelete}>
                Yes
              </CButton>
            </CModalFooter>
          </CModal>
        </CCardBody>
      </CCard>
    </div>
  );
};

export default ProjectList;