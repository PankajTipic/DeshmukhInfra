import React, { useState, useEffect } from "react";
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
  CButton,
  CFormInput,
  CAlert,
  CRow,
  CCol,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from "@coreui/react";
import { getAPICall, post, put, deleteAPICall } from "../../../util/api";
import { useToast } from "../../common/toast/ToastContext";

const ProjectTypeManager = () => {
  const [projectTypes, setProjectTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  const { showToast } = useToast();

  // Edit Modal state
  const [editModal, setEditModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editName, setEditName] = useState("");

  // Delete Modal state
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);

  const fetchProjectTypes = async () => {
    try {
      setLoading(true);
      const response = await getAPICall("/api/project-types");
      setProjectTypes(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error("Error fetching project types:", error);
      showToast("danger", "Failed to fetch project types.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectTypes();
  }, []);

  const handleAddType = async () => {
    if (!newTypeName.trim()) {
      showToast("warning", "Please enter a project type name.");
      return;
    }

    try {
      setLoading(true);
      await post("/api/project-types", { name: newTypeName });
      showToast("success", "Project Type added successfully!");
      setNewTypeName("");
      fetchProjectTypes();
    } catch (error) {
      console.error("Error adding project type:", error);
      showToast("danger", error.response?.data?.message || "Failed to add project type.");
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (item) => {
    setDeleteItem(item);
    setDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteAPICall(`/api/project-types/${deleteItem.id}`);
      showToast("success", "Project Type deleted successfully!");
      setDeleteModal(false);
      fetchProjectTypes();
    } catch (error) {
      console.error("Error deleting project type:", error);
      showToast("danger", "Failed to delete project type.");
    }
  };

  // Open Edit Modal
  const openEditModal = (item) => {
    setEditItem(item);
    setEditName(item.name);
    setEditModal(true);
  };

  // Handle Update
 const handleUpdateType = async () => {
  if (!editName.trim()) {
    showToast("warning", "Project type name cannot be empty.");
    return;
  }

  try {
    setLoading(true);

    await put(`/api/project-types/${editItem.id}`, {
      name: editName,
    });

    showToast("success", "Project Type updated successfully!");
    setEditModal(false);
    setEditItem(null);
    setEditName("");
    fetchProjectTypes();
  } catch (error) {
    console.error("Error updating project type:", error);
    showToast(
      "danger",
      error.response?.data?.message || "Failed to update project type."
    );
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="container-lg p-2">
      <CCard className="mb-4">
        <CCardHeader>
          <strong>Manage Project Types</strong>
        </CCardHeader>
        <CCardBody>
          {/* Add New Type Form */}
          <CRow className="mb-4 align-items-end">
            <CCol md={8} lg={6}>
              <CFormInput
                label="New Project Type Name"
                placeholder="Enter project type (e.g., Web App)"
                value={newTypeName}
                onChange={(e) => setNewTypeName(e.target.value)}
              />
            </CCol>
            <CCol md={4} lg={2} className="mt-2 mt-md-0">
              <CButton color="primary" onClick={handleAddType} disabled={loading}>
                {loading ? "Adding..." : "Add Type"}
              </CButton>
            </CCol>
          </CRow>

          {/* List of Types */}
          <div className="table-responsive">
            <CTable hover bordered responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Sr no</CTableHeaderCell>
                  <CTableHeaderCell>Project Type Name</CTableHeaderCell>
                  <CTableHeaderCell>Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {projectTypes.length > 0 ? (
                  projectTypes.map((type, index) => (
                    <CTableRow key={type.id}>
                      <CTableDataCell>{index + 1}</CTableDataCell>
                      <CTableDataCell>{type.name}</CTableDataCell>
                      <CTableDataCell>
                        <div className="d-flex gap-2">
                           <CButton
                            color="warning"
                            size="sm"
                            className="text-white"
                            onClick={() => openEditModal(type)}
                          >
                            Edit
                          </CButton>
                          <CButton
                            color="danger"
                            size="sm"
                            className="text-white"
                            onClick={() => openDeleteModal(type)}
                          >
                            Delete
                          </CButton>
                        </div>
                      </CTableDataCell>
                    </CTableRow>
                  ))
                ) : (
                  <CTableRow>
                    <CTableDataCell colSpan="3" className="text-center">
                      No Project Types found.
                    </CTableDataCell>
                  </CTableRow>
                )}
              </CTableBody>
            </CTable>
          </div>
        </CCardBody>
      </CCard>

      {/* EDIT MODAL */}
      <CModal visible={editModal} onClose={() => setEditModal(false)} backdrop="static">
        <CModalHeader closeButton>
          <CModalTitle>Edit Project Type</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CFormInput
            label="Project Type Name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
          />
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setEditModal(false)}>
            Cancel
          </CButton>
           <CButton color="primary" onClick={handleUpdateType}>
            Update Type
          </CButton>
        </CModalFooter>
      </CModal>

      {/* DELETE CONFIRM MODAL */}
      <CModal visible={deleteModal} onClose={() => setDeleteModal(false)}>
        <CModalHeader closeButton>
          <CModalTitle>Delete Project Type - {deleteItem?.name}?</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p style={{ fontSize: "16px" }}>
            Do you really want to{" "}
            <span style={{ color: "red", fontWeight: "bold" }}>Delete</span>{" "}
            this project type?
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
    </div>
  );
};

export default ProjectTypeManager;
