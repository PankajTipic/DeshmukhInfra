import React, { useState, useEffect } from 'react';
import {
    CButton,
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
    CFormSwitch,
    CRow,
    CTable,
    CTableBody,
    CTableDataCell,
    CTableHead,
    CTableHeaderCell,
    CTableRow,
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter,
} from '@coreui/react';
import { getAPICall, put,deleteAPICall } from '../../../util/api';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../common/toast/ToastContext';
import NewPlanModal from './NewPlanModal';
import EditPlanModal from './EditPlanModal';

function Plans() {
    const [plans, setPlans] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [planToDelete, setPlanToDelete] = useState(null);
    
    const { t } = useTranslation("global");
    const { showToast } = useToast();

    const fetchPlans = async () => {
        try {
            const response = await getAPICall('/api/plan');
            setPlans(response);
        } catch (error) {
            console.error('Error fetching Plans:', error);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const toggleVisibility = async (plan) => {
        const uPlan = { ...plan, isActive: plan.isActive === 1 ? 0 : 1 };
        try {
            await put('/api/plan/'+uPlan.id, uPlan);
            setPlans((prevPlans) =>
                prevPlans.map((u) =>
                    u.id === plan.id ? uPlan : u
                )
            );
        } catch (error) {
            console.error('Error updating plan:', error);
        }
    };

    const handleEdit = (plan) => {
        setSelectedPlan(plan);
        setShowEditModal(true);
    };

    const handleDelete = (plan) => {
        setPlanToDelete(plan);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            await deleteAPICall(`/api/plan/${planToDelete.id}`);
            setPlans((prevPlans) =>
                prevPlans.filter((plan) => plan.id !== planToDelete.id)
            );
            showToast('success', t("MSG.data_deleted_successfully_msg"));
            setShowDeleteModal(false);
            setPlanToDelete(null);
        } catch (error) {
            console.error('Error deleting plan:', error);
            showToast('danger', 'Error occurred while deleting plan');
        }
    };

    const handleEditSuccess = (updatedPlan) => {
        setPlans((prevPlans) =>
            prevPlans.map((plan) =>
                plan.id === updatedPlan.id ? updatedPlan : plan
            )
        );
    };

    return (
        <CRow>
            <NewPlanModal onSuccess={fetchPlans} visible={showModal} setVisible={setShowModal}/>
            <EditPlanModal 
                onSuccess={handleEditSuccess} 
                visible={showEditModal} 
                setVisible={setShowEditModal}
                planData={selectedPlan}
            />
            
            {/* Delete Confirmation Modal */}
            <CModal
                backdrop="static"
                visible={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                aria-labelledby="DeleteConfirmationModalLabel"
            >
                <CModalHeader>
                    <CModalTitle id="DeleteConfirmationModalLabel">
                        {t("LABELS.confirm_delete")}
                    </CModalTitle>
                </CModalHeader>
                <CModalBody>
                    {t("MSG.are_you_sure_delete_plan")} "{planToDelete?.name}"?
                </CModalBody>
                <CModalFooter>
                    <CButton color="danger" onClick={confirmDelete}>
                        {t("LABELS.delete")}
                    </CButton>
                    <CButton color="secondary" onClick={() => setShowDeleteModal(false)}>
                        {t("LABELS.cancel")}
                    </CButton>
                </CModalFooter>
            </CModal>

            <CCol xs={12}>
                <CCard className="mb-4">
                    <CCardHeader>
                        <div className="d-flex justify-content-between align-items-center">
                            <strong>All Plans</strong>
                            <CButton size="sm" color="primary" onClick={() => setShowModal(true)}>New</CButton>
                        </div>   
                    </CCardHeader>
                    <CCardBody>
                        <div className="table-responsive">
                            <CTable>
                                <CTableHead>
                                    <CTableRow>
                                        <CTableHeaderCell scope="col">Id</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Name</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Description</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Price</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">User Limit</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Active</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
                                    </CTableRow>
                                </CTableHead>
                                <CTableBody>
                                    {plans.map((plan, index) => (
                                        <CTableRow key={plan.id}>
                                            <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                                            <CTableDataCell>{plan.name}</CTableDataCell>
                                            <CTableDataCell>{plan.description}</CTableDataCell>
                                            <CTableDataCell>{plan.price}</CTableDataCell>
                                            <CTableDataCell>{plan.userLimit}</CTableDataCell>
                                            <CTableDataCell>
                                                <CFormSwitch
                                                    id={`formSwitchCheckDefault${plan.id}`}
                                                    checked={plan.isActive === 1}
                                                    onChange={() => toggleVisibility(plan)}
                                                />
                                            </CTableDataCell>
                                            <CTableDataCell>
                                                <CButton 
                                                    color="info" 
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEdit(plan)}
                                                    className="me-2"
                                                >
                                                    {t("LABELS.edit")}
                                                </CButton>
                                                <CButton 
                                                    color="danger" 
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDelete(plan)}
                                                >
                                                    {t("LABELS.delete")}
                                                </CButton>
                                            </CTableDataCell>
                                        </CTableRow>
                                    ))}
                                </CTableBody>
                            </CTable>
                        </div>
                    </CCardBody>
                </CCard>
            </CCol>
        </CRow>
    );
}

export default Plans;