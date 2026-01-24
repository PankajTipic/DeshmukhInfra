// import React, { useEffect, useState } from "react";
// import { CCard, CCardBody, CButton, CCardHeader } from "@coreui/react";
// import { getAPICall } from "../../../util/api";
// import { useNavigate } from "react-router-dom";

// const RawMaterialList = () => {
//   const [materials, setMaterials] = useState([]);
//   const navigate = useNavigate();

//   const [editModal, setEditModal] = useState(false);
//   const [currentMaterial, setCurrentMaterial] = useState(null);
//   const [formData, setFormData] = useState({
//     name: "",
//     local_name: "",
//     project_id: "",
//     current_stock: "",
//   });

//   // 🔹 Fetch materials from API
//   const fetchMaterials = async () => {
//     try {
//       const res = await getAPICall("/api/index"); // create index route in backend
//       setMaterials(res.materials || []);
//     } catch (err) {
//       console.error("Error fetching raw materials", err);
//     }
//   };

//   useEffect(() => {
//     fetchMaterials();
//   }, []);

//   // 🔹 Handle Edit
//   const handleEdit = (id) => {
//     alert(`Edit material with ID: ${id}`);
//     // open modal or navigate to edit page
//   };

//   // 🔹 Handle Delete
//   const handleDelete = (id) => {
//     if (window.confirm("Are you sure you want to delete this material?")) {
//       alert(`Deleted material with ID: ${id}`);
//       // call API delete here
//     }
//   };

//   return (
//     <CCard>
//         {/* 🔹 Header with Button */}
//          <CCardHeader> 
//         <div className="d-flex justify-content-between ">
//          <strong>Raw Materials</strong>
//           <CButton color="danger" onClick={() => navigate("/newRawMaterials")}>Add Raw Material</CButton>
//         </div>
//         </CCardHeader>

//       <CCardBody>

//         {/* 🔹 Table */}
//         <table className="table table-striped">
//           <thead>
//             <tr>
//               <th>ID</th>
//               <th>Material Name</th>
//               <th>Local Name</th>
//               <th>Project Name</th>
//               <th>Current Stock</th>
//               <th>Action</th> {/* 🔹 new column */}
//             </tr>
//           </thead>
//           <tbody>
//             {materials.length > 0 ? (
//               materials.map((m) => (
//                 <tr key={m.id}>
//                   <td>{m.id}</td>
//                   <td>{m.name}</td>
//                   <td>{m.local_name || "-"}</td>
//                   <td>{m.logs && m.logs.length > 0 ? m.logs[0].project?.project_name : "-"}</td>
//                   <td>{m.logs && m.logs.length > 0 ? m.logs[0].current_stock : "-"}</td>
//                   <td>
//                     <CButton
//                       size="sm"
//                       color="warning"
//                       className="me-2"
//                       onClick={() => handleEdit(m.id)}
//                     >
//                       Edit
//                     </CButton>
//                     <CButton
//                       size="sm"
//                       color="danger"
//                       onClick={() => handleDelete(m.id)}
//                     >
//                       Delete
//                     </CButton>
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="6" className="text-center">
//                   No materials found
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </CCardBody>
//     </CCard>
//   );
// };

// export default RawMaterialList;










// _______________________________________________________________________________________________ 

// import React, { useEffect, useState } from "react";
// import {
//   CCard,
//   CCardBody,
//   CButton,
//   CCardHeader,
//   CModal,
//   CModalHeader,
//   CModalTitle,
//   CModalBody,
//   CModalFooter,
//   CFormInput,
//   CFormLabel,
//   CFormSelect,
//   CRow,
//   CCol,
// } from "@coreui/react";
// import { deleteAPICall, getAPICall, put } from "../../../util/api"; // ✅ must have putAPICall in util/api
// import { useToast } from "../../common/toast/ToastContext";
// import { useNavigate } from "react-router-dom";
// import ConfirmationModal from "../../common/ConfirmationModal";
// import AddQtyModal from "./addQty";

// const RawMaterialList = () => {
//   const [materials, setMaterials] = useState([]);
//   const [projects, setProjects] = useState([]);        // ✅ store projects from /myProjects
//   const [editModal, setEditModal] = useState(false);
//   const [currentMaterial, setCurrentMaterial] = useState(null);
//   const [formData, setFormData] = useState({
//     name: "",
//     local_name: "",
//     project_id: "",
//     current_stock: "",
//   });

//   const navigate = useNavigate();

//   const { showToast } = useToast();

//   // ✅ Fetch raw materials
//   // const fetchMaterials = async () => {
//   //   try {
//   //     const res = await getAPICall("/api/index");
//   //     setMaterials(res.materials || []);
//   //   } catch (err) {
//   //     console.error("Error fetching raw materials", err);
//   //   }
//   // };

//   // ✅ Fetch projects for dropdown
//   const fetchProjects = async () => {
//     try {
//       const res = await getAPICall("/api/myProjects");
//       setProjects(res || []);
//     } catch (err) {
//       console.error("Error fetching projects", err);
//     }
//   };

//   useEffect(() => {
//     fetchMaterials();
//     fetchProjects();
//   }, []);

//   // ✅ Open modal & preload selected data
//   const handleEdit = (material) => {
//     const latestLog = material.logs?.[0] || {};
//     setCurrentMaterial(material);
//     setFormData({
//       name: material.name || "",
//       local_name: material.local_name || "",
//       project_id: latestLog.project_id || "",
//       current_stock: latestLog.current_stock || "",
//     });
//     setEditModal(true);
//   };

//   // ✅ Close modal
//   const handleClose = () => {
//     setEditModal(false);
//     setCurrentMaterial(null);
//   };

//   // ✅ Input change
//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   // ✅ Update material
//   const handleUpdate = async () => {
//     if (!currentMaterial) return;
//     try {
//       await put(`/api/rawMaterial/${currentMaterial.id}`, formData);
//       showToast("success", "Material updated successfully!");
//       handleClose();
//       fetchMaterials();
//     } catch (err) {
//       console.error("Error updating material", err);
//       showToast("danger", "Failed to update material");
//     }
//   };




//     const [deleteModalVisible, setDeleteModalVisible] = useState(false);
//   const [deleteResource, setDeleteResource] = useState(null);

//   // Show modal when delete button is clicked
//   const confirmDelete = (material) => {
//     setDeleteResource(material);
//     setDeleteModalVisible(true);
//   };


//    const handleDelete = async () => {
//     if (!deleteResource) return;

//     try {
//       const response = await deleteAPICall(`/api/rawMaterial/${deleteResource.id}`);

//       if (response) {
//         showToast("success", "Material deleted successfully!");
//         fetchMaterials(); // refresh your list
//       }
//     } catch (error) {
//       showToast("danger", "Failed to delete the material.");
//     } finally {
//       setDeleteModalVisible(false);
//       setDeleteResource(null);
//     }
//   };

//   // ✅ Delete material
// //   const handleDelete = async (id) => {
// //   // Ask for confirmation first
// //   if (!window.confirm("Are you sure you want to delete this material?")) {
// //     return; // exit if user cancels
// //   }

// //   try {
// //     // Call DELETE API
// //     const response = await deleteAPICall(`/api/rawMaterial/${id}`);

// //     if (response) {
// //       showToast('success','Material deleted successfully!');
// //       fetchMaterials();
// //       // Optionally, refresh the list or remove the item from state
// //       // e.g., setMaterials(materials.filter(item => item.id !== id));
// //     }
// //   } catch (error) {
// //     // console.error('Delete failed:', error);
// //     showToast('danger','Failed to delete the material.');
// //   }
// // };

// const [addQtyVisible, setAddQtyVisible] = useState(false);
// const [selectedMaterial, setSelectedMaterial] = useState(null);

// const handleAddQty = (material) => {
//   setSelectedMaterial(material);
//   setAddQtyVisible(true);
// };



// const [selectedProject, setSelectedProject] = useState(""); // for filtering

// // Update fetchMaterials to accept optional project_id
// const fetchMaterials = async (project_id = "") => {
//   try {
//     let url = "/api/index";
//     if (project_id) {
//       url += `?project_id=${project_id}`;
//     }
//     const res = await getAPICall(url);
//     setMaterials(res.materials || []);
//   } catch (err) {
//     console.error("Error fetching raw materials", err);
//   }
// };

// // When project changes, fetch materials filtered by that project
// const handleProjectFilter = (e) => {
//   const project_id = e.target.value;
//   setSelectedProject(project_id);
//   fetchMaterials(project_id);
// };


//   return (
//     <>
//       <CCard>
//         <CCardHeader>
//  <div className="d-flex justify-content-between align-items-center">
//   {/* Left side */}
//   <strong>Raw Materials</strong>

//   {/* Right side */}
//   <div className="d-flex gap-2 justify-content-end">
//     <CFormSelect
//       size="sm"                // ✅ smaller height
//       className="w-auto"       // ✅ shrink to fit content
//       value={selectedProject}
//       onChange={handleProjectFilter}
//     >
//       <option value="">-- All Projects --</option>
//       {projects.map((p) => (
//         <option key={p.id} value={p.id}>
//           {p.project_name}
//         </option>
//       ))}
//     </CFormSelect>

//     <CButton
//       color="danger"
//       size="sm"                // ✅ smaller button
//       onClick={() => navigate("/newRawMaterials")}
//     >
//       Add Raw Material
//     </CButton>
//   </div>
// </div>


//         </CCardHeader>

//         <CCardBody>
//           <table className="table table-striped">
//             <thead>
//               <tr>
//                 <th>ID</th>
//                 <th>Material Name</th>
//                 <th>Local Name</th>
//                 <th>Project Name</th>
//                 {/* <th>Capaity</th> */}
//                 <th>Current Stock</th>
//                   <th>Unit</th>
//                  {/* <th>Price</th> */}
//                   <th>Total</th> 
//                 <th>Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               {materials.length > 0 ? (
//                 materials.map((m) => (
//                   <tr key={m.id}>
//                     <td>{m.id}</td>
//                     <td>{m.name}</td>
//                     <td>{m.local_name || "-"}</td>
//                     <td>
//                       {m.logs && m.logs.length > 0
//                         ? m.logs[0].project?.project_name
//                         : "-"}
//                     </td>
//                     <td>
//                       {m.logs && m.logs.length > 0
//                         ? m.logs[0].current_stock
//                         : "-"}
//                     </td>

//                        <td>
//                       {m.logs && m.logs.length > 0
//                         ? m.logs[0].unit
//                         : "-"}
//                     </td>
//                     {/* <td>
//                       {m.logs && m.logs.length > 0
//                         ? m.logs[0].capacity
//                         : "-"}
//                     </td> */}
//                     {/* <td>
//                       {m.logs && m.logs.length > 0
//                         ? m.logs[0].price
//                         : "-"}
//                     </td> */}
//                      <td>
//                       {m.logs && m.logs.length > 0
//                         ? m.logs[0].total
//                         : "-"}
//                     </td>
                 
//                     <td>

//                       <CButton
//                         size="sm"
//                         color="success"
//                         className="me-2"
//                         onClick={() => handleAddQty(m)}
//                       >
//                         Add Qty
//                       </CButton>

//                       <CButton
//                         size="sm"
//                         color="warning"
//                         className="me-2"
//                         onClick={() => handleEdit(m)}
//                       >
//                         Edit
//                       </CButton>
//                       {/* <CButton
//                         size="sm"
//                         color="danger"
//                         onClick={() => handleDelete(m.id)}
//                       >
//                         Delete
//                       </CButton> */}
                    
//         <CButton
//           // key={material.id}
//           size="sm"
//           color="danger"
//           onClick={() => confirmDelete(m)}
//         >
//           Delete
//         </CButton>
     

      
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="6" className="text-center">
//                     No materials found
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </CCardBody>
//       </CCard>

//       {/* Confirmation Modal */}
//       <ConfirmationModal
//         visible={deleteModalVisible}
//         setVisible={setDeleteModalVisible}
//         onYes={handleDelete}
//         resource={`Delete material - ${deleteResource?.name}`}
//       />

//       <AddQtyModal
//   visible={addQtyVisible}
//   onClose={() => setAddQtyVisible(false)}
//   material={selectedMaterial}
//   refreshList={fetchMaterials}
// />


//       {/* ✅ Edit Modal */}
//       <CModal visible={editModal} onClose={handleClose}>
//         <CModalHeader onClose={handleClose}>
//           <CModalTitle>Edit Raw Material</CModalTitle>
//         </CModalHeader>

//         <CModalBody>
//           <CRow className="mb-3">
//             <CCol md={6}>
//               <CFormLabel>Name *</CFormLabel>
//               <CFormInput
//                 name="name"
//                 value={formData.name}
//                 onChange={handleChange}
//               />
//             </CCol>
//             <CCol md={6}>
//               <CFormLabel>Local Name</CFormLabel>
//               <CFormInput
//                 name="local_name"
//                 value={formData.local_name}
//                 onChange={handleChange}
//               />
//             </CCol>
//           </CRow>

//           <CRow className="mb-3">
//             <CCol md={6}>
//               <CFormLabel>Project *</CFormLabel>
//               <CFormSelect
//                 name="project_id"
//                 value={formData.project_id}
//                 onChange={handleChange}
//               >
//                 <option value="">-- Select Project --</option>
//                 {projects.map((p) => (
//                   <option key={p.id} value={p.id}>
//                     {p.project_name}
//                   </option>
//                 ))}
//               </CFormSelect>
//             </CCol>
//             {/* <CCol md={6}>
//               <CFormLabel>Current Stock *</CFormLabel>
//               <CFormInput
//                 name="current_stock"
//                 type="number"
//                 value={formData.current_stock}
//                 onChange={handleChange}
//               />
//             </CCol> */}
//           </CRow>
//         </CModalBody>

//         <CModalFooter>
//           <CButton color="secondary" onClick={handleClose}>
//             Cancel
//           </CButton>
//           <CButton color="primary" onClick={handleUpdate}>
//             Update
//           </CButton>
//         </CModalFooter>
//       </CModal>
//     </>
//   );
// };

// export default RawMaterialList;







import React, { useEffect, useState } from "react";
import {
  CCard,
  CCardBody,
  CButton,
  CCardHeader,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CRow,
  CCol,
} from "@coreui/react";
import { deleteAPICall, getAPICall, put } from "../../../util/api";
import { useToast } from "../../common/toast/ToastContext";
import { useNavigate } from "react-router-dom";
import ConfirmationModal from "../../common/ConfirmationModal";
import AddQtyModal from "./addQty";

const RawMaterialList = () => {
  const [materials, setMaterials] = useState([]);
  const [projects, setProjects] = useState([]);
  const [editModal, setEditModal] = useState(false);
  const [currentMaterial, setCurrentMaterial] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    local_name: "",
    project_id: "",
    current_stock: "",
  });

  const navigate = useNavigate();
  const { showToast } = useToast();

  const fetchProjects = async () => {
    try {
      const res = await getAPICall("/api/myProjects");
      setProjects(res || []);
    } catch (err) {
      console.error("Error fetching projects", err);
    }
  };

  const fetchMaterials = async (project_id = "") => {
    try {
      let url = "/api/index";
      if (project_id) url += `?project_id=${project_id}`;
      const res = await getAPICall(url);
      setMaterials(res.materials || []);
    } catch (err) {
      console.error("Error fetching raw materials", err);
    }
  };

  useEffect(() => {
    fetchMaterials();
    fetchProjects();
  }, []);

  const handleEdit = (material) => {
    const latestLog = material.logs?.[0] || {};
    setCurrentMaterial(material);
    setFormData({
      name: material.name || "",
      local_name: material.local_name || "",
      project_id: latestLog.project_id || "",
      current_stock: latestLog.current_stock || "",
    });
    setEditModal(true);
  };

  const handleClose = () => {
    setEditModal(false);
    setCurrentMaterial(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    if (!currentMaterial) return;
    try {
      await put(`/api/rawMaterial/${currentMaterial.id}`, formData);
      showToast("success", "Material updated successfully!");
      handleClose();
      fetchMaterials();
    } catch {
      showToast("danger", "Failed to update material");
    }
  };

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteResource, setDeleteResource] = useState(null);

  const confirmDelete = (material) => {
    setDeleteResource(material);
    setDeleteModalVisible(true);
  };

  const handleDelete = async () => {
    if (!deleteResource) return;
    try {
      const response = await deleteAPICall(`/api/rawMaterial/${deleteResource.id}`);
      if (response) {
        showToast("success", "Material deleted successfully!");
        fetchMaterials();
      }
    } catch {
      showToast("danger", "Failed to delete the material.");
    } finally {
      setDeleteModalVisible(false);
      setDeleteResource(null);
    }
  };

  const [addQtyVisible, setAddQtyVisible] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const handleAddQty = (material) => {
    setSelectedMaterial(material);
    setAddQtyVisible(true);
  };

  const [selectedProject, setSelectedProject] = useState("");
  const handleProjectFilter = (e) => {
    const project_id = e.target.value;
    setSelectedProject(project_id);
    fetchMaterials(project_id);
  };

  return (
    <>
      <CCard>
        <CCardHeader>
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
            <strong>Raw Materials</strong>

            <div className="d-flex flex-wrap gap-2">
              <CFormSelect
                size="sm"
                className="w-auto"
                value={selectedProject}
                onChange={handleProjectFilter}
              >
                <option value="">-- All Projects --</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.project_name}
                  </option>
                ))}
              </CFormSelect>

              <CButton
                color="danger"
                size="sm"
                onClick={() => navigate("/newRawMaterials")}
              >
                Add Raw Material
              </CButton>
            </div>
          </div>
        </CCardHeader>

        <CCardBody>
          {/* ✅ Responsive Table Wrapper */}
          <div className="table-responsive">
            <table className="table table-striped align-middle">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Material Name</th>
                  <th>Local Name</th>
                  <th>Project Name</th>
                  <th>Current Stock</th>
                  <th>Unit</th>
                  <th>Total</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {materials.length > 0 ? (
                  materials.map((m) => (
                    <tr key={m.id}>
                      <td>{m.id}</td>
                      <td>{m.name}</td>
                      <td>{m.local_name || "-"}</td>
                      <td>
                        {m.logs?.[0]?.project?.project_name || "-"}
                      </td>
                      <td>{m.logs?.[0]?.current_stock ?? "-"}</td>
                      <td>{m.logs?.[0]?.unit ?? "-"}</td>
                      <td>{m.logs?.[0]?.total ?? "-"}</td>
                      <td className="d-flex flex-wrap gap-2">
                        <CButton
                          size="sm"
                          color="success"
                          onClick={() => handleAddQty(m)}
                        >
                          Add Qty
                        </CButton>
                        <CButton
                          size="sm"
                          color="warning"
                          onClick={() => handleEdit(m)}
                        >
                          Edit
                        </CButton>
                        <CButton
                          size="sm"
                          color="danger"
                          onClick={() => confirmDelete(m)}
                        >
                          Delete
                        </CButton>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center">
                      No materials found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CCardBody>
      </CCard>

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={deleteModalVisible}
        setVisible={setDeleteModalVisible}
        onYes={handleDelete}
        resource={`Delete material - ${deleteResource?.name}`}
      />

      <AddQtyModal
        visible={addQtyVisible}
        onClose={() => setAddQtyVisible(false)}
        material={selectedMaterial}
        refreshList={fetchMaterials}
      />

      {/* Edit Modal */}
      <CModal visible={editModal} onClose={handleClose}>
        <CModalHeader onClose={handleClose}>
          <CModalTitle>Edit Raw Material</CModalTitle>
        </CModalHeader>

        <CModalBody>
          <CRow className="mb-3">
            <CCol xs={12} md={6} className="mb-2">
              <CFormLabel>Name *</CFormLabel>
              <CFormInput
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </CCol>
            <CCol xs={12} md={6}>
              <CFormLabel>Local Name</CFormLabel>
              <CFormInput
                name="local_name"
                value={formData.local_name}
                onChange={handleChange}
              />
            </CCol>
          </CRow>

          <CRow className="mb-3">
            <CCol xs={12} md={6}>
              <CFormLabel>Project *</CFormLabel>
              <CFormSelect
                name="project_id"
                value={formData.project_id}
                onChange={handleChange}
              >
                <option value="">-- Select Project --</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.project_name}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
          </CRow>
        </CModalBody>

        <CModalFooter>
          <CButton color="secondary" onClick={handleClose}>
            Cancel
          </CButton>
          <CButton color="primary" onClick={handleUpdate}>
            Update
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  );
};

export default RawMaterialList;
