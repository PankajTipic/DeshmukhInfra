import React, { useState, useRef } from 'react';
import { CRow, CCol, CButton } from '@coreui/react';  // CoreUI components
import { postFormData } from '../../../util/api';     // Ensure correct path

const SampleProductTemplate = "sample_products_template.csv";

const CsvUpload = () => {
  const [csvFile, setCsvFile] = useState(null);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    setCsvFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!csvFile) {
      setMessage('Please select a CSV file to upload.');
      setIsError(true);
      return;
    }
  
    if (csvFile.type !== "text/csv" && !csvFile.name.endsWith(".csv")) {
      setMessage('Invalid file type. Please upload a valid CSV file.');
      setIsError(true);
      return;
    }
  
    const formData = new FormData();
    formData.append('csv_file', csvFile);
  
    try {
      setIsUploading(true);
      const response = await postFormData('/api/uploadProducts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
  
      console.log('Response from backend:', response);
  
      // Get message from either response.data.message or response.message
      const resMessage = response?.data?.message || response?.message;
  
      if (resMessage) {
        setMessage(resMessage);
        setIsError(false);
        setCsvFile(null);
        if (fileInputRef.current) fileInputRef.current.value = null;
      } else {
        setMessage('Upload failed Check CSV format.');
        setIsError(true);
      }
  
    }  catch (error) {
        console.error('Upload error:', error);
        const errMsg = error.response?.data?.error || 'Upload failed Check CSV format.';
        setMessage(errMsg);
        setIsError(true);
      }
      finally {
      setIsUploading(false);
    }
  };
  

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Upload Product CSV</h2>

      <CRow className="mb-3 align-items-center">
        <CCol xs="auto" className="d-flex align-items-center">
          <strong className="me-1" style={{ marginLeft: '10px' }}>
            Sample CSV template for products
          </strong>
          <CButton
            color="success"
            variant="outline"
            title="Download Sample Template"
            style={{ padding: '6px 10px' }}
            onClick={() => {
              const link = document.createElement('a');
              link.href = SampleProductTemplate;
              link.download = 'SampleProductTemplate.csv';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
          >
            📥
          </CButton>
        </CCol>
      </CRow>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        style={styles.fileInput}
      />

      <button
        onClick={handleUpload}
        style={{
          ...styles.uploadButton,
          backgroundColor: isUploading ? '#6c757d' : '#007bff',
          cursor: isUploading ? 'not-allowed' : 'pointer',
        }}
        disabled={isUploading}
      >
        {isUploading ? 'Uploading...' : 'Upload'}
      </button>

      {message && (
        <p
          style={{
            ...styles.message,
            color: isError ? 'red' : 'green',
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: 30,
    maxWidth: 500,
    margin: '50px auto',
    border: '1px solid #ccc',
    borderRadius: 12,
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    backgroundColor: '#f9f9f9',
    fontFamily: 'Arial, sans-serif',
  },
  heading: {
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  fileInput: {
    display: 'block',
    width: '100%',
    padding: '10px',
    marginBottom: 15,
    borderRadius: 6,
    border: '1px solid #ccc',
    backgroundColor: '#fff',
  },
  uploadButton: {
    padding: '10px 20px',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    width: '100%',
    fontWeight: 'bold',
  },
  message: {
    marginTop: 15,
    textAlign: 'center',
    fontWeight: 'bold',
  },
};

export default CsvUpload;
