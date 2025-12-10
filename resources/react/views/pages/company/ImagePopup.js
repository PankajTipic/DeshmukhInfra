import React from 'react';
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton
} from '@coreui/react';

const ImagePopup = ({ 
  visible, 
  onClose, 
  src, 
  title = 'Image Preview',
  alt = 'Image',
  maxWidth = '100%',
  maxHeight = '70vh',
  downloadFileName = 'image' // New prop for custom download filename
}) => {
  
  const handleDownload = async () => {
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Get file extension from src or use jpg as default
      const extension = src.split('.').pop()?.toLowerCase() || 'jpg';
      link.download = `${downloadFileName}.${extension}`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: open in new tab if download fails
      window.open(src, '_blank');
    }
  };

  return (
    <CModal
      visible={visible}
      onClose={onClose}
      size="lg"
      backdrop="static"
      scrollable
    >
      <CModalHeader closeButton>
        <CModalTitle>{title}</CModalTitle>
      </CModalHeader>
      <CModalBody className="text-center p-4">
        {src ? (
          <div className="position-relative">
            <img 
              src={src} 
              alt={alt}
              className="img-fluid rounded shadow-sm"
              style={{ 
                maxWidth: maxWidth,
                maxHeight: maxHeight,
                objectFit: 'contain',
                border: '1px solid #e9ecef'
              }} 
            />
          </div>
        ) : (
          <div className="text-muted">
            <i className="fas fa-image fa-3x mb-3"></i>
            <p>No image available</p>
          </div>
        )}
      </CModalBody>
      <CModalFooter className="d-flex justify-content-between">
        <div className="text-muted small">
          {src && (
            <span>Click and drag to view full size</span>
          )}
        </div>
        <div>
          {src && (
            <>
              <CButton 
                color="success" 
                variant="outline" 
                size="sm"
                className="me-2"
                onClick={handleDownload}
              >
                <i className="fas fa-download me-1"></i>
                Download
              </CButton>
              <CButton 
                color="info" 
                variant="outline" 
                size="sm"
                className="me-2"
                onClick={() => window.open(src, '_blank')}
              >
                <i className="fas fa-external-link-alt me-1"></i>
                Open in New Tab
              </CButton>
            </>
          )}
          <CButton color="secondary" onClick={onClose}>
            Close
          </CButton>
        </div>
      </CModalFooter>
    </CModal>
  );
};

export default ImagePopup;