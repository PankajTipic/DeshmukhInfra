// import React, { useEffect, useState } from 'react';
// import { getAPICall, post, postFormData, put } from '../../../util/api';
// import { 
//   CAlert, 
//   CBadge, 
//   CButton, 
//   CCardHeader, 
//   CModal, 
//   CModalHeader, 
//   CModalTitle, 
//   CModalBody, 
//   CModalFooter,
//   CForm,
//   CFormLabel,
//   CFormInput,
//   CFormCheck,
//   CFormSelect,
//   CSpinner,
//   CCard,
//   CCardBody,
//   CTooltip
// } from '@coreui/react';
// import CIcon from '@coreui/icons-react';
// import { cilArrowThickToBottom, cilArrowThickToTop, cilSettings, cilWarning, cilPlus, cilX, cilSearch, cilCheck } from '@coreui/icons';
// import { getUserData } from '../../../util/session';
// import { useTranslation } from 'react-i18next';
// import { useToast } from '../../common/toast/ToastContext';


// function RawMaterial() {
//     const { t, i18n } = useTranslation("global");
//   const [tableData, setTableData] = useState([]);
//   const [quantities, setQuantities] = useState({});
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [uploading, setUploading] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [failedItems, setFailedItems] = useState([]);
//   const { showToast } = useToast();
//   const [showAlert, setShowAlert] = useState(false);
//   const [showAlertSingleProduct, setShowAlertSingleProduct] = useState(false);
//   const [failAlert, setFailAlert] = useState(false);
//   const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
//   const [logModalVisible, setLogModalVisible] = useState(false);
// const [logData, setLogData] = useState([]);


//   const [showAddQtyModal, setShowAddQtyModal] = useState(false);
// const [showUsedQtyModal, setShowUsedQtyModal] = useState(false);
// const [currentMaterial, setCurrentMaterial] = useState(null);
// const [qtyForm, setQtyForm] = useState({
//   type: 'add',       // 'add' or 'buy'
//   quantity: '',
//   rate: '',
//   total: '',
//   employee: '',
//   date: new Date().toISOString().slice(0, 10)
// });



// const openAddQtyModal = (item) => {
//   setCurrentMaterial(item);
//   setQtyForm({
//     type: 'add', // ✅ FIX: set default type
//     quantity: '',
//     rate: '',
//     total: '',
//     employee: '',
//     date: new Date().toISOString().slice(0, 10),
//   });
//   setShowAddQtyModal(true);
// };


// const openUsedQtyModal = (item) => {
//   setCurrentMaterial(item);
//   setQtyForm({
//     type: 'used', // ✅ Fix: Set type for used log
//     quantity: '',
//     employee: '',
//     date: new Date().toISOString().slice(0, 10),
//     rate: '',
//     total: '',
//   });
//   setShowUsedQtyModal(true);
// };


  
//   // Modal and form states
//   const [showModal, setShowModal] = useState(false);
//   const [submitting, setSubmitting] = useState(false);
//   const [formData, setFormData] = useState({
//     name: '',
//     local_name: '',
//     capacity: '',
//     unit_qty: '0',
//     unit: 'kg',
//     isPackaging: false,
//     isVisible: true,
//     misc: ''
//   });
//   const [syncLocalName, setSyncLocalName] = useState(false);

//   const user = getUserData();
    

//   useEffect(() => {
//     // Handle window resize
//     const handleResize = () => {
//       setIsMobile(window.innerWidth <= 768);
//     };

//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);

//   // Sync local_name with name when checkbox is checked
//   useEffect(() => {
//     if (syncLocalName) {
//       setFormData(prev => ({
//         ...prev,
//         local_name: prev.name
//       }));
//     }
//   }, [syncLocalName, formData.name]);

//   const handleFileChange = (e) => {
//     setSelectedFile(e.target.files[0]);
//   };

//   const handleSubmit = async () => {
//     if (!selectedFile) return;

//     setUploading(true);
//     const formData = new FormData();
//     formData.append('file', selectedFile);
   
//     try {
//       const res = await postFormData('/api/uploadCSVRawMaterial', formData);
//       showToast('success', t('MESSAGES.file_uploaded_successfully'));
//       getData(); 
//     } catch (error) {
//       console.error('Upload failed:', error);
//       showToast('danger', t('MESSAGES.upload_failed'));
//     } finally {
//       setUploading(false);
//       setSelectedFile(null);
//     }
//   };
  
//   useEffect(() => {
//     getData();
//   }, []);

//   useEffect(() => {
//     if (showAlert) {
//       const timer = setTimeout(() => {
//         setShowAlert(false);
//         setShowAlertSingleProduct(false);
//       }, 4000);
//       return () => clearTimeout(timer);
//     }
//      if (showAlertSingleProduct) {
//       const timer = setTimeout(() => {
      
//         setShowAlertSingleProduct(false);
//       }, 4000);
//       return () => clearTimeout(timer);
//     }
//   }, [showAlert,showAlertSingleProduct]);

//   useEffect(() => {
//     if (failAlert) {
//       const timer = setTimeout(() => {
//         setFailAlert(false);
//       }, 4000);
//       return () => clearTimeout(timer);
//     }
//   }, [failAlert]);

// const handleAddQtySubmit = async () => {
//   const quantityToAdd = parseFloat(qtyForm.quantity || 0);

//   if (qtyForm.type === 'add') {
//     const availableSpace = parseFloat(currentMaterial.capacity) - parseFloat(currentMaterial.unit_qty);
//     if (quantityToAdd > availableSpace) {
//       alert(
//         t('VALIDATIONS.add_limit_exceeded', {
//           max: availableSpace,
//           unit: currentMaterial.unit,
//         })
//       );
//       return;
//     }
//   }

//   try {
//     await post('/api/raw-materials/add-quantity', {
//       material_id: currentMaterial.id,
//       ...qtyForm,
//     });

//     setShowAddQtyModal(false);
//     getData(); // ✅ Refresh the stock table
//   } catch (err) {
//     alert(t('VALIDATIONS.failed_to_add_quantity'));
//   }
// };

// const renderRawMaterialCard = (item) => {
//   return (
//     <CCard key={item.id} className="mb-3 order-card" style={{ cursor: 'default' }}>
//       <CCardBody>
//         {/* Row 1: Material Name and Unit */}
//         <div className="card-row-1">
//           <div className="customer-name-section">
//             <div className="customer-name">{item.name}</div>
//             <div className="text-muted" style={{ fontSize: '0.85em' }}>{item.local_name}</div>
//           </div>

//           {/* Stock indicator badge */}
//           <div className="status-badge">
//             <CBadge
//               style={
//                 item.min_qty === 1
//                   ? {
//                       animation: 'strobeRed 0.5s infinite',
//                       backgroundColor: '#ff0000',
//                       color: 'white',
//                     }
//                   : item.min_qty === 2
//                   ? {
//                       backgroundColor: '#ffc107',
//                       color: '#212529',
//                     }
//                   : {
//                       backgroundColor: '#28a745',
//                       color: 'white',
//                     }
//               }
//             >
//               {item.min_qty === 1
//                 ? `${t('LABELS.empty_soon')}`
//                 : item.min_qty === 2
//                 ? `${t('LABELS.moderate')}`
//                 : `${t('LABELS.sufficient')}`}
//             </CBadge>
//           </div>
//         </div>

//         {/* Row 2: Stock Summary */}
//         <div className="card-row-2">
//           <div className="text-muted">{t('LABELS.capacity')}: {item.capacity} {item.unit}</div>
//           <div>{t('LABELS.available_stock')}: <strong>{item.unit_qty} {item.unit}</strong></div>
//         </div>

//         {/* Row 3: Actions */}
//         <div className="card-row-4" style={{ paddingTop: '10px' }}>
//          <div className="action-buttons-mobile d-flex flex-column gap-2">
//   <CButton
//     size="sm"
//     color="success"
//     onClick={() => openAddQtyModal(item)}
//     className="w-100"
//   >
//     {t('LABELS.add_qty')}
//   </CButton>

//   <CButton
//     size="sm"
//     color="danger"
//     onClick={() => openUsedQtyModal(item)}
//     className="w-100"
//   >
//     {t('LABELS.used_qty')}
//   </CButton>

//   <CButton
//     size="sm"
//     color="info"
//     onClick={() => openLogModal(item)}
//     className="w-100"
//   >
//     {t('LABELS.log')}
//   </CButton>
// </div>

//         </div>
//       </CCardBody>
//     </CCard>
//   );
// };



// const handleUsedQtySubmit = async () => {
//   const quantityToUse = parseFloat(qtyForm.quantity || 0);
//   const currentStock = parseFloat(currentMaterial.unit_qty);

//   if (quantityToUse > currentStock) {
//     alert(
//       t('VALIDATIONS.used_limit_exceeded', {
//         max: currentStock,
//         unit: currentMaterial.unit,
//       })
//     );
//     return;
//   }

//   try {
//     await post('/api/raw-materials/used-quantity', {
//       material_id: currentMaterial.id,
//       ...qtyForm,
//     });
//     setShowUsedQtyModal(false);
//     getData();
//   } catch (err) {
//     alert(t('VALIDATIONS.failed_to_use_quantity'));
//   }
// };



//   async function getData() {
//     const response = await getAPICall('/api/raw-materials');
//     console.log(response);
    
//     setTableData(response);
//   }
  
//   const handleQuantityChange = (id, value) => {
//     if (value === '' || /^[1-9][0-9]*$/.test(value)) {
//       setQuantities((prev) => ({
//         ...prev,
//         [id]: value,
//       }));
//     }
//   };

//   const handleAddClick = async (item) => {
//     const quantity = quantities[item.id];
//     if (!quantity || quantity <= 0) {
//       alert('Please enter a valid quantity greater than 0');
//       return;
//     } else {
//       try {
//         const resp = await put(`/api/raw-materials/${item.id}`, { "unit_qty": quantity });
       
//         if(resp?.failed){
//             setFailedItems(resp?.failed)
//         }
//         else if(resp?.updated){
//             setShowAlertSingleProduct(true);
//             setQuantities({});
//             setFailedItems([]);
//             searchMaterials();
//         }
//       } catch (e) {
//         // Error handling
//       }
//     }
//   };

//   const handleDownload = async () => {
//     try {
//       const response = await fetch('/api/csv-download');
//       if (!response.ok) {
//         throw new Error('Failed to download file');
//       }
  
//       const blob = await response.blob();
//       const url = window.URL.createObjectURL(blob);
  
//       const link = document.createElement('a');
//       link.href = url;
//       link.setAttribute('download', 'raw_materials_demo.csv');
//       document.body.appendChild(link);
//       link.click();
//       link.remove();
//     } catch (error) {
//       console.error('Error downloading CSV:', error);
//     }
//   };
    
//   useEffect(() => {
//     const handler = setTimeout(() => {
//       setDebouncedSearchTerm(searchTerm);
//     }, 1000);

//     return () => {
//       clearTimeout(handler);
//     };
//   }, [searchTerm]);

//   const searchMaterials = async () => {
//     setLoading(true);
//     try {
//       const response = await getAPICall(`/api/searchRawMaterials?search=${debouncedSearchTerm}`);
//       setTableData(response);
//     } catch (error) {
//       console.error('Error fetching materials:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     const fetchMaterials = async () => {
//       setLoading(true);
//       try {
//         const response = await getAPICall(`/api/serchRawMaterials?search=${debouncedSearchTerm}`);
//         setTableData(response);
//       } catch (error) {
//         console.error('Error fetching materials:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (debouncedSearchTerm === '') {
//       searchMaterials();
//     } else {
//       searchMaterials();
//     }
//   }, [debouncedSearchTerm]);

//   const openLogModal = async (item) => {
//   try {
//     const res = await getAPICall(`/api/raw-materials/${item.id}/logs`);
//     setLogData(res);
//     setLogModalVisible(true);
//   } catch (err) {
//     console.error("Failed to fetch logs", err);
//     alert(t('LABELS.failed_to_load_logs'));
//   }
// };

  
//   const handleBulkAdd = async() => {
//     const bulkData = Object.entries(quantities)
//       .filter(([_, qty]) => qty && qty > 0)
//       .map(([id, quantity]) => ({ id: parseInt(id), quantity: parseInt(quantity) }));
    
//     try{
//         const resp = await post('/api/uploadBulk', bulkData);
//         if(resp?.failed){
//             setFailedItems(resp?.failed)
//         }
//         else if(resp?.message==="Bulk update successful"){
//             setQuantities({});
//             setFailedItems([]);
//             setShowAlert(true);
//             getData(); 
//         }
//     }
//     catch(e){
//       // Error handling
//     }
//   };

// const validateName = (name, t) => {
//   const trimmed = name?.trim() || '';

//   if (trimmed.length === 0) {
//     return t("MSG.name_is_required_msg");
//   }

//   if (trimmed.length < 2) {
//     return t("MSG.name_min_length");
//   }

//   if (trimmed.length > 50) {
//     return t("MSG.name_max_length");
//   }

//   const nameRegex = /^[a-zA-Z\u0900-\u097F\s.'-]+$/;

//   if (!nameRegex.test(trimmed)) {
//     return t("MSG.name_invalid_chars");
//   }

//   return null;
// };


//   // Generate a shortened filename for mobile view
//   const shortenFileName = (name) => {
//     if (!name) return '';
//     if (name.length <= 6) return name;
//     const extension = name.split('.').pop();
//     return `${name.substring(0, 4)}..${extension}`;
//   };

//   // Check if multiple rows have quantities entered
//   const hasMultipleQuantities = Object.values(quantities).filter(qty => qty && qty > 0).length > 1;

//   // Form handling
//    const handleInputChange = (e) => {
//   const { name, value, type, checked } = e.target;

//   let newValue;

//   if (type === 'checkbox') {
//     newValue = checked;
//   } else if (type === 'number') {
//     const numericValue = parseFloat(value);
//     if (isNaN(numericValue) || numericValue < 0) {
//       // Clear the field if invalid
//       newValue = '';
//     } else {
//       newValue = value;
//     }
//   } else {
//     newValue = value;
//   }

//   setFormData(prev => ({
//     ...prev,
//     [name]: newValue
//   }));
// };


//   const handleAddProduct = () => {
//     // Reset form data and open modal
//     setFormData({
//       name: '',
//       local_name: '',
//       capacity: '',
//       unit_qty: '0',
//       unit: 'kg',
//       isPackaging: false,
//       isVisible: true,
//       misc: ''
//     });
//     setSyncLocalName(false);
//     setShowModal(true);
//   };

//   const handleFormSubmit = async (e) => {
//     e.preventDefault();
//     setSubmitting(true);

//     try {
//       // Convert numeric strings to numbers
//       const payload = {
//         ...formData,
//         capacity: parseFloat(formData.capacity),
//         unit_qty: parseFloat(formData.unit_qty),
//       };

//       const response = await post('/api/rawMaterialAdd', payload);
    
//       if (response) {
//         setShowModal(false);
//         setShowAlert(true);
//         getData(); // Refresh the table
//       }
//     } catch (error) {
//       console.error('Error submitting form:', error);
//       alert('Failed to add product');
//     } finally {
//       setSubmitting(false);
//     }
//   };
    
// return (
//   <div className="p-0">
//     <CCardHeader
//       style={{ backgroundColor: '#d6eaff', marginBottom: '10px' }}
//       className="p-2 rounded"
//     >
//       <div
//         style={{
//           display: 'flex',
//           alignItems: 'center',
//           gap: '20px',
//           flexWrap: 'wrap'
//         }}
//       >
//         <h5 className="mb-0">{t('LABELS.raw_materials_inventory')}</h5>
//         <div
//           className="d-flex gap-1 mb-2"
//           style={{ overflowX: 'auto', whiteSpace: 'nowrap' }}
//         >
//           <CBadge
//             style={{
//               backgroundColor: '#ff0000',
//               color: 'white',
//               fontSize: '10px',
//               padding: '4px 6px'
//             }}
//           >
//             {t('LABELS.empty_soon')} &lt; 20%
//           </CBadge>
//           <CBadge
//             style={{
//               backgroundColor: '#ffc107',
//               color: '#212529',
//               fontSize: '10px',
//               padding: '4px 6px'
//             }}
//           >
//             {t('LABELS.moderate')} &lt; 60%
//           </CBadge>
//           <CBadge
//             style={{
//               backgroundColor: '#28a745',
//               color: 'white',
//               fontSize: '10px',
//               padding: '4px 6px'
//             }}
//           >
//             {t('LABELS.sufficient')} &gt; 60%
//           </CBadge>
//         </div>
//       </div>
//     </CCardHeader>

//     {showAlert && (
//       <CAlert color="success" onDismiss={() => setShowAlert(false)}>
//         <div>✅ {t('LABELS.productUpdateSuccess')}</div>
//       </CAlert>
//     )}
//     {showAlertSingleProduct && (
//       <CAlert
//         color="success"
//         onDismiss={() => setShowAlertSingleProduct(false)}
//       >
//         <div>✅ {t('LABELS.singleProductUpdateSuccess')}</div>
//       </CAlert>
//     )}
//     {failAlert && (
//       <CAlert
//         color="warning"
//         onDismiss={() => setFailAlert(false)}
//         className="d-flex align-items-center mb-2"
//       >
//         <CIcon
//           icon={cilWarning}
//           className="flex-shrink-0 me-2"
//           width={24}
//           height={24}
//         />
//         <div>{t('LABELS.overCapacityWarning')}</div>
//       </CAlert>
//     )}
//     {failedItems.map((item, index) => (
//       <CAlert
//         key={index}
//         color="warning"
//         className="d-flex align-items-center mb-2"
//       >
//         <CIcon
//           icon={cilWarning}
//           className="flex-shrink-0 me-2"
//           width={24}
//           height={24}
//         />
//         <div>
//           {t('LABELS.capacityExceededWarning', {
//             quantity: item.quantity,
//             name: item.name,
//             available: item.capacity - item.current_quantity,
//             limit: item.capacity
//           })}
//         </div>
//       </CAlert>
//     ))}

//     {/* Responsive Controls */}
//   <div className="mb-3">
//   {isMobile ? (
//     <>
//       {/* MOBILE */}
//       <div className="d-flex gap-1 mb-2" style={{ width: '100%' }}>
//         {/* Left Half - Upload Section */}
//         <div className="d-flex gap-1" style={{ flex: '1', maxWidth: '50%' }}>
//           {!selectedFile && (
//             <CTooltip content={t('LABELS.template')} placement="top">
//               <CButton
//                 color="primary"
//                 onClick={handleDownload}
//                 style={{
//                   flex: '1',
//                   height: '40px',
//                   borderRadius: '8px',
//                   padding: '0',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   minWidth: '0'
//                 }}
//                 title={t('LABELS.template')}
//               >
//                 <CIcon icon={cilArrowThickToBottom} size="sm" />
//               </CButton>
//             </CTooltip>
//           )}
          
//           {!selectedFile && (
//             <CTooltip content={t('LABELS.upload_csv')} placement="top">
//               <CButton
//                 color="primary"
//                 onClick={() => document.getElementById('fileInput').click()}
//                 style={{
//                   flex: '1',
//                   height: '40px',
//                   borderRadius: '8px',
//                   padding: '0',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   minWidth: '0'
//                 }}
//                 title={t('LABELS.upload_csv')}
//               >
//                 <CIcon icon={cilArrowThickToTop} size="sm" />
//               </CButton>
//             </CTooltip>
//           )}

//           {selectedFile && (
//             <div 
//               style={{
//                 flex: '1',
//                 height: '40px',
//                 borderRadius: '8px',
//                 padding: '0 8px',
//                 display: 'flex',
//                 alignItems: 'center',
//                 backgroundColor: '#f8f9fa',
//                 border: '1px solid #dee2e6',
//                 fontSize: '12px',
//                 color: '#495057',
//                 overflow: 'hidden'
//               }}
//             >
//               <span style={{ 
//                 whiteSpace: 'nowrap', 
//                 overflow: 'hidden', 
//                 textOverflow: 'ellipsis' 
//               }}>
//                 {selectedFile.name}
//               </span>
//             </div>
//           )}

//           {selectedFile && (
//             <CButton
//               color="success"
//               disabled={uploading}
//               onClick={handleSubmit}
//               style={{
//                 width: '40px',
//                 height: '40px',
//                 borderRadius: '8px',
//                 padding: '0',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 minWidth: '40px'
//               }}
//               title={uploading ? t('LABELS.uploading') : t('LABELS.submit')}
//             >
//               <CIcon icon={cilCheck} size="sm" />
//             </CButton>
//           )}
//         </div>

//         {/* Right Half - Add Material Section */}
//         <div className="d-flex gap-1" style={{ flex: '1', maxWidth: '50%' }}>
//           <CButton
//             color="success"
//             onClick={handleAddProduct}
//             style={{ 
//               flex: '1', 
//               height: '40px',
//               minWidth: '0',
//               fontSize: '14px'
//             }}
//           >
//             <CIcon icon={cilPlus} size="sm" style={{ marginRight: 3 }} />
//             {t('LABELS.add_material')}
//           </CButton>
          
//           {hasMultipleQuantities && (
//             <CButton
//               color="danger"
//               onClick={handleBulkAdd}
//               style={{
//                 flex: '1',
//                 height: '40px',
//                 animation: 'strobeRed 0.5s infinite',
//                 backgroundColor: '#ff0000',
//                 color: 'white',
//                 minWidth: '0',
//                 fontSize: '14px'
//               }}
//             >
//               {t('LABELS.bulk_add')}
//             </CButton>
//           )}
//         </div>
//       </div>

//       <div className="mb-2">
//         <div className="input-group">
//           <input
//             type="text"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             placeholder={t('LABELS.search_name')}
//             className="form-control"
//           />
//           <span className="input-group-text bg-white">
//             <CIcon icon={cilSearch} />
//           </span>
//         </div>
//       </div>
//     </>
//   ): (
//           /* Desktop View - Single Row Layout with right-aligned action buttons */
//           <div className="d-flex align-items-center mb-2">
//             {/* Left side - Search and CSV buttons */}
//             <div className="d-flex gap-3 flex-grow-1">
//               {/* Search field */}
//               <div style={{ width: '300px' }}>
//                 <input
//                   type="text"
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   placeholder={t('LABELS.search_name')}
//                   className="form-control"
//                 />
//               </div>
              
//               {/* CSV buttons */}
//               <CButton color="primary" onClick={handleDownload}>
//                 <CIcon icon={cilArrowThickToBottom} size="sm" style={{ marginRight: 3 }}/>
//                 {t('LABELS.download_template')}
//               </CButton>
              
//               <CButton
//                 color={selectedFile ? "primary" : "primary"} 
//                 variant={selectedFile ? "solid" : "outline"}
//                 onClick={() => document.getElementById('fileInput').click()}
//               >
//                 {!selectedFile && (<CIcon icon={cilArrowThickToTop} size="sm" style={{ marginRight: 3 }}/>)}
//                 {selectedFile ? selectedFile.name : `${t('LABELS.upload_csv')}`}
//               </CButton>
              
//               {selectedFile && (
//                 <CButton
//                   color="success"
//                   disabled={uploading}
//                   onClick={handleSubmit}
//                 >
//                   {uploading ? `${t('LABELS.uploading')}` : `${t('LABELS.submit')}`}
//                 </CButton>
//               )}
//             </div>

//             {/* Right side - Action buttons */}
//             <div className="d-flex gap-2">
//               <CButton
//                 color="success"
//                 onClick={handleAddProduct}
//               >
//                 <CIcon icon={cilPlus} size="sm" style={{ marginRight: 3 }}/>
//                 {t('LABELS.add_material')}
//               </CButton>
              
//               {hasMultipleQuantities && (
//   <CButton
//     color="danger"
//     onClick={handleBulkAdd}
//     style={{
//       animation: 'strobeRed 0.5s infinite',
//       backgroundColor: '#ff0000',
//       color: 'white',
//     }}
//   > 
//   {t('LABELS.bulk_add')}
//   </CButton>
// )}

//             </div>
//           </div>
//         )}

//         <input
//           type="file"
//           id="fileInput"
//           style={{ display: 'none' }}
//           accept=".csv"
//           onChange={handleFileChange}
//         />
//       </div>

//     {isMobile ? (
//   <div className="mobile-cards-container">
//     {tableData.map((item) => (
//       <CCard key={item.id} className="mb-3 order-card">
//         <CCardBody>
//           {/* Row 1: Name and status */}
//           <div className="card-row-1" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
//             <div className="customer-name-section">
//               <div className="customer-name">{item.name}</div>
//               <div className="text-muted" style={{ fontSize: '0.85em' }}>{item.local_name}</div>
//             </div>
//             <div className="status-badge">
//               <CBadge
//                 style={
//                   item.min_qty === 1
//                     ? { animation: 'strobeRed 0.5s infinite', backgroundColor: '#ff0000', color: 'white' }
//                     : item.min_qty === 2
//                     ? { backgroundColor: '#ffc107', color: '#212529' }
//                     : { backgroundColor: '#28a745', color: 'white' }
//                 }
//               >
//                 {item.min_qty === 1
//                   ? t('LABELS.empty_soon')
//                   : item.min_qty === 2
//                   ? t('LABELS.moderate')
//                   : t('LABELS.sufficient')}
//               </CBadge>
//             </div>
//           </div>
          
//           {/* Row 2: Capacity and stock */}
//           <div className="card-row-2 d-flex justify-content-between">
//             <div className="text-muted">{t('LABELS.Capacity')}: {item.capacity} {item.unit}</div>
//             <div>{t('LABELS.available_stock')}: <strong>{item.unit_qty} {item.unit}</strong></div>
//           </div>
          
//           {/* Row 3: Action buttons */}
//           <div className="card-row-4" onClick={(e) => e.stopPropagation()}>
//             <div className="action-buttons-mobile d-flex flex-column gap-2 mt-2">
//               {/* Row with 2 buttons side by side */}
//               <div className="d-flex gap-2">
//                 <CButton
//                   size="sm"
//                   color="success"
//                   className="w-50 rounded-pill"
//                   onClick={() => openAddQtyModal(item)}
//                 >
//                   {t('LABELS.add_qty')}
//                 </CButton>
                
//                 <CButton
//                   size="sm"
//                   color="danger"
//                   className="w-50 rounded-pill"
//                   onClick={() => openUsedQtyModal(item)}
//                 >
//                   {t('LABELS.used_qty')}
//                 </CButton>
//               </div>
              
//               {/* Log button full width */}
//               <CButton
//                 size="sm"
//                 color="info"
//                 className="w-100 rounded-pill"
//                 onClick={() => openLogModal(item)}
//               >
//                 {t('LABELS.log')}
//               </CButton>
//             </div>
//           </div>
//         </CCardBody>
//       </CCard>
//     ))}
//   </div>
// ) : (
//   <div className="table-container">
//     <table className="table table-hover table-bordered align-middle">
//       <thead className="table-light" style={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: '#f8f9fa' }}>
//         <tr>
//           <th>{t('LABELS.name')}</th>
//           <th>{t('LABELS.Capacity')}</th>
//           <th>{t('LABELS.stock_indicator')}</th>
//           <th>{t('LABELS.available_stock')}</th>
//           <th>{t('LABELS.add_qty')}</th>
//           <th>{t('LABELS.used_qty')}</th>
//           <th>{t('LABELS.log')}</th>
//         </tr>
//       </thead>
//       <tbody>
//         {tableData.map((item) => (
//           <tr key={item.id}>
//             <td>{item.name}</td>
//             <td>{item.capacity}&nbsp;{item.unit}</td>
//             <td>
//               <CBadge
//                 style={
//                   item.min_qty === 1
//                     ? { animation: 'strobeRed 0.5s infinite', backgroundColor: '#ff0000', color: 'white' }
//                     : item.min_qty === 2
//                     ? { backgroundColor: '#ffc107', color: '#212529' }
//                     : { backgroundColor: '#28a745', color: 'white' }
//                 }
//               >
//                 {item.min_qty === 1
//                   ? t('LABELS.empty_soon')
//                   : item.min_qty === 2
//                   ? t('LABELS.moderate')
//                   : t('LABELS.sufficient')}
//               </CBadge>
//             </td>
//             <td>{item.unit_qty}&nbsp;{item.unit}</td>
//             <td>
//               <CButton
//                 color="success"
//                 size="sm"
//                 className="rounded-pill"
//                 onClick={() => openAddQtyModal(item)}
//               >
//                 {t('LABELS.add_qty')}
//               </CButton>
//             </td>
//             <td>
//               <CButton
//                 color="danger"
//                 size="sm"
//                 className="rounded-pill"
//                 onClick={() => openUsedQtyModal(item)}
//               >
//                 {t('LABELS.used_qty')}
//               </CButton>
//             </td>
//             <td>
//               <CButton
//                 color="info"
//                 size="sm"
//                 className="rounded-pill"
//                 onClick={() => openLogModal(item)}
//               >
//                 {t('LABELS.log')}
//               </CButton>
//             </td>
//           </tr>
//         ))}
//       </tbody>
//     </table>
//   </div>
// )}


//       {/* Add Product Modal */}
//       <CModal 
//         visible={showModal} 
//         onClose={() => setShowModal(false)}
//         alignment="center"
//         size="lg"
//       >
//         <CModalHeader closeButton>
//           <CModalTitle>{t('LABELS.add_raw_material')}</CModalTitle>
//         </CModalHeader>
//         <CModalBody>
//           <CForm onSubmit={handleFormSubmit}>
//             <div className="row mb-3">
//               <div className="col-md-6">
//                 <CFormLabel htmlFor="name">{t('LABELS.material_name')}&nbsp;*</CFormLabel>
//                 <CFormInput
//                   id="name"
//                   name="name"
//                   value={formData.name}
//                   onChange={handleInputChange}
//                   required
//                 />
//                 <CFormCheck 
//                   id="syncNameCheck"
//                   label={t('LABELS.keep_name_and_local_name_same')}
//                   checked={syncLocalName}
//                   onChange={(e) => setSyncLocalName(e.target.checked)}
//                   className="mt-1"
//                 />
//               </div>
//               <div className="col-md-6">
//                 <CFormLabel htmlFor="local_name">{t('LABELS.material_local_name')}&nbsp;*</CFormLabel>
//                 <CFormInput
//                   id="local_name"
//                   name="local_name"
//                   value={formData.local_name}
//                   onChange={handleInputChange}
//                   disabled={syncLocalName}
//                 />
//               </div>
//             </div>

//             <div className="row mb-3">
//               <div className="col-md-4">
//                 <CFormLabel htmlFor="capacity">{t('LABELS.Capacity')}&nbsp;*</CFormLabel>
//                 <CFormInput
//                   type="number"
//                   id="capacity"
//                   name="capacity"
//                   value={formData.capacity}
//                   onChange={handleInputChange}
//                   required
//                   min="0"
//                   step="0.01"
//                 />
//               </div>
//               <div className="col-md-4">
//                 <CFormLabel htmlFor="unit_qty">{t('LABELS.quantity')}&nbsp;*</CFormLabel>
//                 <CFormInput
//                   type="number"
//                   id="unit_qty"
//                   name="unit_qty"
//                   value={formData.unit_qty}
//                   onChange={handleInputChange}
//                   min="0"
//                   step="0.01"
//                 />
//               </div>
//               <div className="col-md-4">
//                 <CFormLabel htmlFor="unit">{t('LABELS.units')}&nbsp;*</CFormLabel>
//                 <CFormSelect
//                   id="unit"
//                   name="unit"
//                   value={formData.unit}
//                   onChange={handleInputChange}
//                   required
//                 >
//                   <option value="">{t('LABELS.select_unit')}</option>
//                   <option value="kg">{t('LABELS.Kilogram')}</option>
//                   <option value="gm">{t('LABELS.grams')}</option>
//                   <option value="ltr">{t('LABELS.liter')}</option>
//                   <option value="pcs">{t('LABELS.pieces')}</option>
//                 </CFormSelect>
//               </div>
//             </div>
            
//             <div className="row mb-3">
//               <div className="col-md-6">
//                 {/* <div className="d-flex align-items-center mb-3">
//                   <CFormCheck 
//                     id="isPackaging"
//                     name="isPackaging"
//                     label={t('LABELS.is_packaging')}
//                     checked={formData.isPackaging}
//                     onChange={handleInputChange}
//                   />
//                 </div> */}
//                 <div className="d-flex align-items-center">
//                   <CFormCheck 
//                     id="isVisible"
//                     name="isVisible"
//                     label={t('LABELS.is_visible')}
//                     checked={formData.isVisible}
//                     onChange={handleInputChange}
//                   />
//                 </div>
//               </div>
//               {/* <div className="col-md-6">
//                 <CFormLabel htmlFor="misc">{t('LABELS.additional_notes')}</CFormLabel>
//                 <CFormInput
//                   id="misc"
//                   name="misc"
//                   value={formData.misc}
//                   onChange={handleInputChange}
//                   placeholder={t('LABELS.any_additional_info')}
//                 />
//               </div> */}
//             </div>
//           </CForm>
//         </CModalBody>
//         <CModalFooter>
//           <CButton color="secondary" onClick={() => setShowModal(false)}>
//           {t('LABELS.cancel')}
//           </CButton>
//           <CButton color="primary" onClick={handleFormSubmit} disabled={submitting}>
//             {submitting ? <><CSpinner size="sm" /> {t('LABELS.saving')}</> : `${t('LABELS.save')}`}
//           </CButton>
//         </CModalFooter>
//       </CModal>

//       {/* Add Quantity Modal */}
//      {/* Add Quantity Modal */}
// <CModal visible={showAddQtyModal} onClose={() => setShowAddQtyModal(false)}>
//   <CModalHeader>
//     <CModalTitle>{t('LABELS.add_quantity')}</CModalTitle>
//   </CModalHeader>
//   <CModalBody>
//     <CForm>
//       <div className="mb-3">
//         <CFormLabel>{t('LABELS.action_type')}</CFormLabel>
//         <CFormSelect
//           value={qtyForm.type || 'add'}
//           onChange={(e) => setQtyForm({ ...qtyForm, type: e.target.value })}
//         >
//           <option value="add">{t('LABELS.add_from_existing')}</option>
//           <option value="buy">{t('LABELS.buy_new_stock')}</option>
//         </CFormSelect>
//       </div>

//       <div className="mb-3">
//   <CFormLabel>{t('LABELS.employee_name')}</CFormLabel>
//  <CFormInput
//   value={qtyForm.employee}
//   onChange={(e) => setQtyForm({ ...qtyForm, employee: e.target.value })}
//   placeholder={t('LABELS.enter_employee_name')}
//   onBlur={(e) => {
//     const error = validateName(e.target.value, t);
//     if (error) {
//       showToast('warning', error);
//     }
//   }}
//   invalid={!!qtyForm.employee && validateName(qtyForm.employee, t) !== null}
// />

// </div>


//      <div className="mb-3">
//   <CFormLabel>{t('LABELS.quantity')}</CFormLabel>
//   <CFormInput
//     type="number"
//     min="0"
//     step="1"
//     value={qtyForm.quantity}
//     onChange={(e) => {
//       const quantityValue = e.target.value;

//       // Allow only whole numbers or blank
//       if (/^\d*$/.test(quantityValue)) {
//         const quantity = parseInt(quantityValue, 10);
//         const rate = parseFloat(qtyForm.rate);

//         const total = !isNaN(rate) && !isNaN(quantity)
//           ? parseFloat((rate * quantity).toFixed(2))
//           : '';

//         setQtyForm({
//           ...qtyForm,
//           quantity: quantityValue,
//           total,
//         });
//       } else if (quantityValue === '') {
//         setQtyForm({ ...qtyForm, quantity: '', total: '' });
//       }
//     }}
//     onKeyDown={(e) => {
//       if (['.', ',', 'e', '-', '+'].includes(e.key)) {
//         e.preventDefault(); // ❌ Disallow decimal, exponential, negative, plus
//       }
//     }}
//     placeholder={t('LABELS.enter_quantity')}
//     invalid={qtyForm.quantity && qtyForm.quantity < 0}
//   />

//   {qtyForm.quantity && qtyForm.quantity < 0 && (
//     <div className="invalid-feedback d-block">
//       {t('LABELS.quantity_cannot_be_negative')}
//     </div>
//   )}
// </div>


//       {qtyForm.type === 'buy' && (
//         <>
//           <div className="mb-3">
//             <CFormLabel>{t('LABELS.amount_per_unit')}</CFormLabel>
//             <CFormInput
//   type="number"
//   min="0"
//   step="0.01"
//   value={qtyForm.rate || ''}
//   onChange={(e) => {
//     const rateValue = e.target.value;
//     const rate = parseFloat(rateValue);
//     const quantity = parseFloat(qtyForm.quantity);

//     if (!isNaN(rate) && rate >= 0) {
//       const total = !isNaN(quantity) ? parseFloat((rate * quantity).toFixed(2)) : '';
//       setQtyForm({ ...qtyForm, rate: rateValue, total });
//     } else if (rateValue === '') {
//       setQtyForm({ ...qtyForm, rate: '', total: '' });
//     }
//   }}
//   placeholder={t('LABELS.enter_price_per_unit')}
//   invalid={qtyForm.rate && qtyForm.rate < 0}
// />

//             {qtyForm.rate && qtyForm.rate < 0 && (
//               <div className="invalid-feedback d-block">
//                 {t('LABELS.rate_cannot_be_negative')}
//               </div>
//             )}
//           </div>

//           <div className="mb-3">
//             <CFormLabel>{t('LABELS.total_amount')}</CFormLabel>
//             <CFormInput
//               type="number"
//               value={qtyForm.total || ''}
//               disabled
//               placeholder={t('LABELS.auto_calculated_total')}
//             />
//           </div>
//         </>
//       )}

//       <div className="mb-3">
//         <CFormLabel>{t('LABELS.date')}</CFormLabel>
//         <CFormInput
//           type="date"
//           value={qtyForm.date}
//           onChange={(e) => setQtyForm({ ...qtyForm, date: e.target.value })}
//         />
//       </div>
//     </CForm>
//   </CModalBody>
//   <CModalFooter>
//     <CButton color="secondary" onClick={() => setShowAddQtyModal(false)}>
//       {t('LABELS.cancel')}
//     </CButton>
//     <CButton 
//       color="primary" 
//       onClick={handleAddQtySubmit}
//       disabled={
//         !qtyForm.employee ||
//         !qtyForm.quantity ||
//         qtyForm.quantity <= 0 ||
//         (qtyForm.type === 'buy' && (!qtyForm.rate || qtyForm.rate <= 0))
//       }
//     >
//       {t('LABELS.submit')}
//     </CButton>
//   </CModalFooter>
// </CModal>

// {/* Used Quantity Modal */}
// <CModal visible={showUsedQtyModal} onClose={() => setShowUsedQtyModal(false)}>
//   <CModalHeader>
//     <CModalTitle>{t('LABELS.used_quantity')}</CModalTitle>
//   </CModalHeader>
//   <CModalBody>
//     <CForm>
//       <div className="mb-3">
//   <CFormLabel>{t('LABELS.employee_name')}</CFormLabel>
//   <CFormInput
//   value={qtyForm.employee}
//   onChange={(e) => setQtyForm({ ...qtyForm, employee: e.target.value })}
//   placeholder={t('LABELS.enter_employee_name')}
//   onBlur={(e) => {
//     const error = validateName(e.target.value, t);
//     if (error) {
//       showToast('warning', error);
//     }
//   }}
//   invalid={!!qtyForm.employee && validateName(qtyForm.employee, t) !== null}
// />


// </div>

//      <div className="mb-3">
//   <CFormLabel>{t('LABELS.quantity')}</CFormLabel>
//   <CFormInput
//     type="number"
//     min="0"
//     step="1"
//     value={qtyForm.quantity}
//     onChange={(e) => {
//       const quantityValue = e.target.value;

//       // Allow only whole numbers or blank
//       if (/^\d*$/.test(quantityValue)) {
//         const quantity = parseInt(quantityValue, 10);
//         const rate = parseFloat(qtyForm.rate);

//         const total = !isNaN(rate) && !isNaN(quantity)
//           ? parseFloat((rate * quantity).toFixed(2))
//           : '';

//         setQtyForm({
//           ...qtyForm,
//           quantity: quantityValue,
//           total,
//         });
//       } else if (quantityValue === '') {
//         setQtyForm({ ...qtyForm, quantity: '', total: '' });
//       }
//     }}
//     onKeyDown={(e) => {
//       if (['.', ',', 'e', '-', '+'].includes(e.key)) {
//         e.preventDefault(); // ❌ Disallow decimal, exponential, negative, plus
//       }
//     }}
//     placeholder={t('LABELS.enter_quantity')}
//     invalid={qtyForm.quantity && qtyForm.quantity < 0}
//   />

//   {qtyForm.quantity && qtyForm.quantity < 0 && (
//     <div className="invalid-feedback d-block">
//       {t('LABELS.quantity_cannot_be_negative')}
//     </div>
//   )}
// </div>

//     </CForm>
//   </CModalBody>
//   <CModalFooter>
//     <CButton color="secondary" onClick={() => setShowUsedQtyModal(false)}>
//       {t('LABELS.cancel')}
//     </CButton>
//     <CButton 
//       color="danger" 
//       onClick={handleUsedQtySubmit}
//       disabled={
//         !qtyForm.employee ||
//         !qtyForm.quantity ||
//         qtyForm.quantity <= 0 
      
//       }
//     >
//       {t('LABELS.submit')}
//     </CButton>
//   </CModalFooter>
// </CModal>

// {/* Logs Modal */}
// <CModal visible={logModalVisible} onClose={() => setLogModalVisible(false)}>
//   <CModalHeader>
//     <CModalTitle>{t('LABELS.logs')}</CModalTitle>
//   </CModalHeader>
//   <CModalBody>
//     {logData.length === 0 ? (
//       <div>{t('LABELS.no_logs_found')}</div>
//     ) : (
//       <table className="table table-bordered table-sm">
//         <thead>
//           <tr>
//             <th>{t('LABELS.date')}</th>
//             <th>{t('LABELS.type')}</th>
//             <th>{t('LABELS.quantity')}</th>
//             <th>{t('LABELS.employee_name')}</th>
//           </tr>
//         </thead>
//         <tbody>
//          {[...logData].sort((a, b) => b.id - a.id).map((log, index) => (
//   <tr key={index}>
//     <td>{log.date}</td>
//     <td>{log.type}</td>
//     <td>{log.quantity}</td>
//     <td>{log.employee}</td>
//   </tr>
// ))}
//         </tbody>
//       </table>
//     )}
//   </CModalBody>
//   <CModalFooter>
//     <CButton color="secondary" onClick={() => setLogModalVisible(false)}>
//       {t('LABELS.close')}
//     </CButton>
//   </CModalFooter>
// </CModal>


//       {/* Add custom CSS */}
//       <style jsx>{`
//         @keyframes strobeRed {
//           0% { opacity: 1; }
//           50% { opacity: 0.5; }
//           100% { opacity: 1; }
//         }
        
//                 button.btn.rounded-pill {
//           border-radius: 50px !important;
//         }
//         /* Hide scrollbar for Chrome, Safari and Opera */
//         .table-container::-webkit-scrollbar {
//           display: none;
//         }
        
//         /* Hide scrollbar for IE, Edge and Firefox */
//         .table-container {
//           -ms-overflow-style: none;  /* IE and Edge */
//           scrollbar-width: none;  /* Firefox */
//         }
//       `}</style>
//     </div>
//   );
// }

// export default RawMaterial;




