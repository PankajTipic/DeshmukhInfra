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
  CRow,
  CCol,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from "@coreui/react";
// import { getAPICall, post, put, deleteAPICall } from "../../../../util/api";
// import { useToast } from "../../../common/toast/ToastContext";
import { getAPICall, post, put, deleteAPICall } from "../../../util/api";
import { useToast } from "../../common/toast/ToastContext";

const WorkTypeManager = () => {
  const [workTypes, setWorkTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  const { showToast } = useToast();

  const [editModal, setEditModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editName, setEditName] = useState("");

  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);

  const fetchWorkTypes = async () => {
    try {
      setLoading(true);
      const response = await getAPICall("/api/work-types");
      setWorkTypes(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error("Error fetching work types:", error);
      showToast("danger", "Failed to fetch work types.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkTypes();
  }, []);

  const handleAddType = async () => {
    if (!newTypeName.trim()) {
      showToast("warning", "Please enter a work type name.");
      return;
    }

    try {
      setLoading(true);
      await post("/api/work-types", { name: newTypeName });
      showToast("success", "Work Type added successfully!");
      setNewTypeName("");
      fetchWorkTypes();
    } catch (error) {
      console.error("Error adding work type:", error);
      showToast("danger", error.response?.data?.message || "Failed to add work type.");
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
      await deleteAPICall(`/api/work-types/${deleteItem.id}`);
      showToast("success", "Work Type deleted successfully!");
      setDeleteModal(false);
      fetchWorkTypes();
    } catch (error) {
      console.error("Error deleting work type:", error);
      showToast("danger", "Failed to delete work type.");
    }
  };

  const openEditModal = (item) => {
    setEditItem(item);
    setEditName(item.name);
    setEditModal(true);
  };

  const handleUpdateType = async () => {
    if (!editName.trim()) {
      showToast("warning", "Work type name cannot be empty.");
      return;
    }

    try {
      setLoading(true);
      await put(`/api/work-types/${editItem.id}`, { name: editName });
      showToast("success", "Work Type updated successfully!");
      setEditModal(false);
      setEditItem(null);
      setEditName("");
      fetchWorkTypes();
    } catch (error) {
      console.error("Error updating work type:", error);
      showToast("danger", error.response?.data?.message || "Failed to update work type.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-lg p-2">
      <CCard className="mb-4">
        <CCardHeader>
          <strong>Manage Work Types</strong>
        </CCardHeader>
        <CCardBody>
          <CRow className="mb-4 align-items-end">
            <CCol md={8} lg={6}>
              <CFormInput
                label="New Work Type Name"
                placeholder="Enter work type (e.g., Drilling)"
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

          <div className="table-responsive">
            <CTable hover bordered responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Sr no</CTableHeaderCell>
                  <CTableHeaderCell>Work Type Name</CTableHeaderCell>
                  <CTableHeaderCell>Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {workTypes.length > 0 ? (
                  workTypes.map((type, index) => (
                    <CTableRow key={type.id}>
                      <CTableDataCell>{index + 1}</CTableDataCell>
                      <CTableDataCell>{type.name}</CTableDataCell>
                      <CTableDataCell>
                        <div className="d-flex gap-2">
                           <CButton color="warning" size="sm" className="text-white" onClick={() => openEditModal(type)}>
                            Edit
                          </CButton>
                          <CButton color="danger" size="sm" className="text-white" onClick={() => openDeleteModal(type)}>
                            Delete
                          </CButton>
                        </div>
                      </CTableDataCell>
                    </CTableRow>
                  ))
                ) : (
                  <CTableRow>
                    <CTableDataCell colSpan="3" className="text-center">
                      No Work Types found.
                    </CTableDataCell>
                  </CTableRow>
                )}
              </CTableBody>
            </CTable>
          </div>
        </CCardBody>
      </CCard>

      <CModal visible={editModal} onClose={() => setEditModal(false)} backdrop="static">
        <CModalHeader closeButton>
          <CModalTitle>Edit Work Type</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CFormInput label="Work Type Name" value={editName} onChange={(e) => setEditName(e.target.value)} />
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setEditModal(false)}>Cancel</CButton>
          <CButton color="primary" onClick={handleUpdateType}>Update Type</CButton>
        </CModalFooter>
      </CModal>

      <CModal visible={deleteModal} onClose={() => setDeleteModal(false)}>
        <CModalHeader closeButton>
          <CModalTitle>Delete Work Type - {deleteItem?.name}?</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p style={{ fontSize: "16px" }}>Do you really want to <span style={{ color: "red", fontWeight: "bold" }}>Delete</span> this work type?</p>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setDeleteModal(false)}>Close</CButton>
          <CButton color="primary" onClick={confirmDelete}>Yes</CButton>
        </CModalFooter>
      </CModal>
    </div>
  );
};

export default WorkTypeManager;
