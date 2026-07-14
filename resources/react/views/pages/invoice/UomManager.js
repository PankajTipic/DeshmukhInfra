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
import { getAPICall, post, put, deleteAPICall } from "../../../util/api";
import { useToast } from "../../common/toast/ToastContext";

const UomManager = () => {
  const [uoms, setUoms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newUomName, setNewUomName] = useState("");
  const { showToast } = useToast();

  const [editModal, setEditModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editName, setEditName] = useState("");

  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);

  const fetchUoms = async () => {
    try {
      setLoading(true);
      const response = await getAPICall("/api/uoms");
      setUoms(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error("Error fetching UOMs:", error);
      showToast("danger", "Failed to fetch UOMs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUoms();
  }, []);

  const handleAddUom = async () => {
    if (!newUomName.trim()) {
      showToast("warning", "Please enter a UOM name.");
      return;
    }

    try {
      setLoading(true);
      await post("/api/uoms", { name: newUomName });
      showToast("success", "UOM added successfully!");
      setNewUomName("");
      fetchUoms();
    } catch (error) {
      console.error("Error adding UOM:", error);
      showToast("danger", error.response?.data?.message || "Failed to add UOM.");
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
      await deleteAPICall(`/api/uoms/${deleteItem.id}`);
      showToast("success", "UOM deleted successfully!");
      setDeleteModal(false);
      fetchUoms();
    } catch (error) {
      console.error("Error deleting UOM:", error);
      showToast("danger", "Failed to delete UOM.");
    }
  };

  const openEditModal = (item) => {
    setEditItem(item);
    setEditName(item.name);
    setEditModal(true);
  };

  const handleUpdateUom = async () => {
    if (!editName.trim()) {
      showToast("warning", "UOM name cannot be empty.");
      return;
    }

    try {
      setLoading(true);
      await put(`/api/uoms/${editItem.id}`, { name: editName });
      showToast("success", "UOM updated successfully!");
      setEditModal(false);
      setEditItem(null);
      setEditName("");
      fetchUoms();
    } catch (error) {
      console.error("Error updating UOM:", error);
      showToast("danger", error.response?.data?.message || "Failed to update UOM.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-lg p-2">
      <CCard className="mb-4">
        <CCardHeader>
          <strong>Manage UOMs (Unit of Measurement)</strong>
        </CCardHeader>
        <CCardBody>
          <CRow className="mb-4 align-items-end">
            <CCol md={8} lg={6}>
              <CFormInput
                label="New UOM Name"
                placeholder="Enter UOM (e.g., RMT)"
                value={newUomName}
                onChange={(e) => setNewUomName(e.target.value)}
              />
            </CCol>
            <CCol md={4} lg={2} className="mt-2 mt-md-0">
              <CButton color="primary" onClick={handleAddUom} disabled={loading}>
                {loading ? "Adding..." : "Add UOM"}
              </CButton>
            </CCol>
          </CRow>

          <div className="table-responsive">
            <CTable hover bordered responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Sr no</CTableHeaderCell>
                  <CTableHeaderCell>UOM Name</CTableHeaderCell>
                  <CTableHeaderCell>Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {uoms.length > 0 ? (
                  uoms.map((uom, index) => (
                    <CTableRow key={uom.id}>
                      <CTableDataCell>{index + 1}</CTableDataCell>
                      <CTableDataCell>{uom.name}</CTableDataCell>
                      <CTableDataCell>
                        <div className="d-flex gap-2">
                           <CButton color="warning" size="sm" className="text-white" onClick={() => openEditModal(uom)}>
                            Edit
                          </CButton>
                          <CButton color="danger" size="sm" className="text-white" onClick={() => openDeleteModal(uom)}>
                            Delete
                          </CButton>
                        </div>
                      </CTableDataCell>
                    </CTableRow>
                  ))
                ) : (
                  <CTableRow>
                    <CTableDataCell colSpan="3" className="text-center">
                      No UOMs found.
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
          <CModalTitle>Edit UOM</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CFormInput label="UOM Name" value={editName} onChange={(e) => setEditName(e.target.value)} />
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setEditModal(false)}>Cancel</CButton>
          <CButton color="primary" onClick={handleUpdateUom}>Update UOM</CButton>
        </CModalFooter>
      </CModal>

      <CModal visible={deleteModal} onClose={() => setDeleteModal(false)}>
        <CModalHeader closeButton>
          <CModalTitle>Delete UOM - {deleteItem?.name}?</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p style={{ fontSize: "16px" }}>Do you really want to <span style={{ color: "red", fontWeight: "bold" }}>Delete</span> this UOM?</p>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setDeleteModal(false)}>Close</CButton>
          <CButton color="primary" onClick={confirmDelete}>Yes</CButton>
        </CModalFooter>
      </CModal>
    </div>
  );
};

export default UomManager;
