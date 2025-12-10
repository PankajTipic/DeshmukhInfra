import React, { useState, useEffect, useCallback } from 'react';
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CFormInput,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CSpinner
} from '@coreui/react';
import { getAPICall } from '../../util/api';

const ProjectSelectionModal = ({ visible, onClose, onSelectProject }) => {
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const fetchProjects = useCallback(async (query) => {
    setLoading(true);
    try {
      const response = await getAPICall(`/api/projects?searchQuery=${query}`);
      setProjects(response || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      fetchProjects('');
    }
  }, [visible, fetchProjects]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProjects(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchProjects]);

  const handleSelect = () => {
    if (selectedProject) {
      onSelectProject(selectedProject);
      handleClose();
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    setSelectedProject(null);
    onClose();
  };

  const handleRowDoubleClick = (project) => {
    onSelectProject(project);
    handleClose();
  };

  return (
    <CModal visible={visible} onClose={handleClose} size="lg" backdrop="static">
      <CModalHeader>
        <CModalTitle>Select Project</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <div className="mb-3">
          <CFormInput
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
        </div>
        
        {loading ? (
          <div className="text-center py-4">
            <CSpinner color="primary" />
          </div>
        ) : (
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <CTable hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell style={{ width: '50px' }}>Select</CTableHeaderCell>
                  <CTableHeaderCell>Project Name</CTableHeaderCell>
                  <CTableHeaderCell>Customer Name</CTableHeaderCell>
                  <CTableHeaderCell>Location</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {projects.length > 0 ? (
                  projects.map((project) => (
                    <CTableRow
                      key={project.id}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelectedProject(project)}
                      onDoubleClick={() => handleRowDoubleClick(project)}
                      className={selectedProject?.id === project.id ? 'table-active' : ''}
                    >
                      <CTableDataCell>
                        <input
                          type="radio"
                          name="projectSelection"
                          checked={selectedProject?.id === project.id}
                          onChange={() => setSelectedProject(project)}
                        />
                      </CTableDataCell>
                      <CTableDataCell>{project.project_name}</CTableDataCell>
                      <CTableDataCell>{project.customer_name || project.customer?.name || '-'}</CTableDataCell>
                      <CTableDataCell>{project.work_place || project.location || '-'}</CTableDataCell>
                    </CTableRow>
                  ))
                ) : (
                  <CTableRow>
                    <CTableDataCell colSpan="4" className="text-center">
                      {searchQuery ? 'No projects found' : 'Loading projects...'}
                    </CTableDataCell>
                  </CTableRow>
                )}
              </CTableBody>
            </CTable>
          </div>
        )}
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={handleClose}>
          Cancel
        </CButton>
        <CButton color="primary" onClick={handleSelect} disabled={!selectedProject}>
          Select Project
        </CButton>
      </CModalFooter>
    </CModal>
  );
};

export default ProjectSelectionModal;