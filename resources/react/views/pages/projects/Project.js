
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

  return (
    <div className="container-lg p-2">
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

          <CTable responsive hover>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>ID</CTableHeaderCell>
                <CTableHeaderCell>Customer Name</CTableHeaderCell>
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
                    <CTableDataCell>{project.project_name}</CTableDataCell>
                    <CTableDataCell>{project.work_place}</CTableDataCell>
                    <CTableDataCell>{project.start_date || "N/A"}</CTableDataCell>
                    <CTableDataCell>{project.end_date || "N/A"}</CTableDataCell>
                    <CTableDataCell>{project.supervisor?.name || "N/A"}</CTableDataCell>
                    <CTableDataCell>{project.remark || "N/A"}</CTableDataCell>
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
  <CRow className="g-2">
    <CCol xs="6" className="d-flex justify-content-start">
      <CButton
        color="warning"
        size="sm"
        onClick={() => handleEditClick(project)}
      >
        Edit
      </CButton>
    </CCol>

    <CCol xs="6" className="d-flex justify-content-start">
      {(userType === 1 || userType === 3) && (
        <CButton
          color="danger"
          size="sm"
          onClick={() => openDeleteModal(project)}
        >
          Delete
        </CButton>
      )}
    </CCol>
  </CRow>

                      

                   
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
