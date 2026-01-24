import React, { useEffect, useState, useRef } from "react";
import {
  CButton,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CCard,
  CCardBody,
  CCardHeader,
  CBadge,
} from "@coreui/react";
import CIcon from '@coreui/icons-react';
import { cilTrash, cilCloudUpload } from '@coreui/icons';
import { getAPICall, postFormData } from "../../../util/api";
import { useToast } from "../../common/toast/ToastContext";
import { useTranslation } from "react-i18next";
import i18n from "i18next";
import { paymentTypes, receiver_bank } from "../../../util/Feilds";

const EditExpense = ({ visible, onClose, expense, onExpenseUpdated }) => {
  const [validated, setValidated] = useState(false);
  const [expenseTypes, setExpenseTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const { t } = useTranslation("global");

  // Photo states
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [newPhotos, setNewPhotos] = useState([]);
  const [photosToDelete, setPhotosToDelete] = useState([]);
  const [showPhotoPreviewModal, setShowPhotoPreviewModal] = useState(false);
  const fileInputRef = useRef(null);

  const [state, setState] = useState({
    name: "",
    desc: "",
    expense_id: undefined,
    qty: 1,
    price: 0,
    total_price: 0,
    expense_date: new Date().toISOString().split("T")[0],
    show: true,

    // New Fields from backend
    gst: "",
    sgst: "",
    cgst: "",
    igst: "",
    contact: "",
    payment_by: "",
    payment_type: "",
    pending_amount: "",
    isGst: 0,
    photoAvailable: 0,
    photo_url: "",
    photo_remark: "",
    bank_name: "",
    acc_number: "",
    ifsc: "",
    aadhar: "",
    pan: "",
    transaction_id: "",
  });

  const getCurrentLanguage = () => {
    const storedLang = localStorage.getItem("i18nextLng");
    return storedLang || i18n.language || "en";
  };

  const getDisplayName = (item, lng = null) => {
    const currentLang = lng || getCurrentLanguage();
    return currentLang === "mr" ? item.localName || item.name : item.name;
  };

  const fetchExpenseTypes = async () => {
    try {
      const response = await getAPICall("/api/expenseType");
      setExpenseTypes(response.filter((p) => p.show === 1));
    } catch (error) {
      showToast("danger", "Error occurred " + error);
    }
  };

  useEffect(() => {
    if (visible) fetchExpenseTypes();
  }, [visible]);

  useEffect(() => {
    if (visible) fetchExpenseTypes();
  }, [i18n.language, visible]);

  useEffect(() => {
    if (expense && visible) {
      setState({
        ...state,
        ...expense, // ✅ automatically map all backend fields
        expense_date:
          expense.expense_date || new Date().toISOString().split("T")[0],
        show: expense.show !== undefined ? expense.show : true,
      });
      
      // Load existing photos
      if (expense.photos && Array.isArray(expense.photos)) {
        setExistingPhotos(expense.photos);
      } else {
        setExistingPhotos([]);
      }
      
      // Reset photo changes
      setNewPhotos([]);
      setPhotosToDelete([]);
      setValidated(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expense, visible]);

  const roundToTwoDecimals = (value) =>
    Number((Math.round(value * 100) / 100).toFixed(2));

  const calculateFinalAmount = (item) => {
    const qty = roundToTwoDecimals(parseFloat(item.qty) || 0);
    const price = roundToTwoDecimals(parseFloat(item.price) || 0);
    item.total_price = Math.round(qty * price);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (["price", "qty"].includes(name)) {
      setState((prev) => {
        const updated = { ...prev, [name]: value };
        calculateFinalAmount(updated);
        return updated;
      });
    } else {
      setState((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Photo handling functions
  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];

    files.forEach(file => {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        showToast('warning', `${file.name} is not a valid file type.`);
        return;
      }

      if (file.size > 4096 * 1024) {
        showToast('warning', `${file.name} exceeds 4MB size limit.`);
        return;
      }

      validFiles.push({
        file: file,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
        name: file.name,
        size: (file.size / 1024).toFixed(2),
        type: file.type.includes('pdf') ? 'pdf' : 'image',
        remark: '',
        id: 'new_' + Date.now() + Math.random()
      });
    });

    setNewPhotos(prev => [...prev, ...validFiles]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeNewPhoto = (photoId) => {
    setNewPhotos(prev => {
      const updated = prev.filter(p => p.id !== photoId);
      const photo = prev.find(p => p.id === photoId);
      if (photo && photo.preview) {
        URL.revokeObjectURL(photo.preview);
      }
      return updated;
    });
  };

  const markExistingPhotoForDeletion = (photoId) => {
    if (photosToDelete.includes(photoId)) {
      setPhotosToDelete(photosToDelete.filter(id => id !== photoId));
    } else {
      setPhotosToDelete([...photosToDelete, photoId]);
    }
  };

  const updatePhotoRemark = (photoId, remark) => {
    if (typeof photoId === 'string' && photoId.startsWith('new_')) {
      // Update new photo remark
      setNewPhotos(prev => prev.map(p => 
        p.id === photoId ? { ...p, remark } : p
      ));
    } else {
      // Update existing photo remark
      setExistingPhotos(prev => prev.map(p => 
        p.id === photoId ? { ...p, remark } : p
      ));
    }
  };

  const getTotalPhotoCount = () => {
    return existingPhotos.filter(p => !photosToDelete.includes(p.id)).length + newPhotos.length;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    setValidated(true);

    // Validate contact number if provided
    if (state.contact && !/^\d{10}$/.test(state.contact)) {
      showToast("danger", "Contact number must be exactly 10 digits.");
      return;
    }

    // Validate payment type
    if (!state.payment_type) {
      showToast("danger", "Please select payment type");
      return;
    }

    if (state.expense_id && state.price > 0 && state.qty > 0) {
      setLoading(true);
      try {
        const formData = new FormData();
        
        // Laravel _method spoofing for PUT with FormData
        formData.append('_method', 'PUT');
        
        // Add required fields explicitly
        formData.append('expense_id', state.expense_id);
        formData.append('price', state.price);
        formData.append('qty', state.qty);
        formData.append('total_price', state.total_price);
        formData.append('expense_date', state.expense_date);
        formData.append('show', state.show ? 1 : 0);
        formData.append('payment_type', state.payment_type);
        formData.append('payment_by', state.payment_by || '');
        
        // Add optional fields
        if (state.name) formData.append('name', state.name);
        if (state.desc) formData.append('desc', state.desc);
        if (state.contact) formData.append('contact', state.contact);
        if (state.pending_amount) formData.append('pending_amount', state.pending_amount);
        
        // GST fields
        formData.append('isGst', state.isGst ? 1 : 0);
        if (state.gst) formData.append('gst', state.gst);
        if (state.sgst) formData.append('sgst', state.sgst);
        if (state.cgst) formData.append('cgst', state.cgst);
        if (state.igst) formData.append('igst', state.igst);
        
        // Bank fields
        if (state.bank_name) formData.append('bank_name', state.bank_name);
        if (state.acc_number) formData.append('acc_number', state.acc_number);
        if (state.ifsc) formData.append('ifsc', state.ifsc);
        if (state.transaction_id) formData.append('transaction_id', state.transaction_id);
        if (state.aadhar) formData.append('aadhar', state.aadhar);
        if (state.pan) formData.append('pan', state.pan);

        // Add photos to delete
        if (photosToDelete.length > 0) {
          photosToDelete.forEach((id, index) => {
            formData.append(`delete_photo_ids[${index}]`, id);
          });
        }

        // Add new photos
        if (newPhotos.length > 0) {
          newPhotos.forEach((photo, index) => {
            formData.append(`new_photos[${index}]`, photo.file);
            if (photo.remark) {
              formData.append(`new_photo_remarks[${index}]`, photo.remark);
            }
          });
        }

        // Update remarks for existing photos (only if changed)
        existingPhotos.forEach(photo => {
          if (!photosToDelete.includes(photo.id)) {
            formData.append(`photo_remarks[${photo.id}]`, photo.remark || '');
          }
        });

        // Use POST instead of PUT for FormData
        const resp = await postFormData(`/api/expense/${expense.id}`, formData);

        if (resp && resp.success) {
          showToast("success", t("MSG.expense_updated_successfully"));
          onExpenseUpdated && onExpenseUpdated(resp.expense || state);
          onClose();
        } else {
          showToast("danger", t("MSG.error_occured_please_try_again_later_msg"));
        }
      } catch (error) {
        showToast("danger", "Error occurred: " + error.message);
      } finally {
        setLoading(false);
      }
    } else {
      showToast("danger", t("MSG.fill_required_fields"));
    }
  };

  const handleClose = () => {
    setValidated(false);
    onClose();
  };

  const today = new Date().toISOString().split("T")[0];
  const lng = getCurrentLanguage();

  return (
    <CModal visible={visible} onClose={handleClose} size="lg">
      <CModalHeader>
        <CModalTitle>{t("LABELS.edit_expense")}</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CForm noValidate validated={validated} onSubmit={handleSubmit}>
          {/* Basic Info */}
          <div className="row">
            <div className="col-sm-6 mb-3">
              <CFormLabel><b>{t("LABELS.expense_type")}</b></CFormLabel>
              <CFormSelect
                name="expense_id"
                value={state.expense_id || ""}
                onChange={handleChange}
                required
              >
                <option value="">{t("MSG.select_expense_type_msg")}</option>
                {expenseTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {getDisplayName(type, lng)}
                  </option>
                ))}
              </CFormSelect>
            </div>

            <div className="col-sm-6 mb-3">
              <CFormLabel><b>{t("LABELS.about_expense")}</b></CFormLabel>
              <CFormInput
                name="name"
                value={state.name}
                onChange={handleChange}
                placeholder="Enter expense name"
              />
            </div>
          </div>

          {/* Amount Section */}
          <div className="row">
            <div className="col-sm-4 mb-3">
              <CFormLabel><b>{t("LABELS.expense_date")}</b></CFormLabel>
              <CFormInput
                type="date"
                name="expense_date"
                max={today}
                value={state.expense_date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-sm-4 mb-3">
              <CFormLabel><b>{t("LABELS.price_per_unit")}</b></CFormLabel>
              <CFormInput
                type="number"
                name="price"
                min="0"
                step="0.01"
                value={state.price}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-sm-4 mb-3">
              <CFormLabel><b>{t("LABELS.total_units")}</b></CFormLabel>
              <CFormInput
                type="number"
                name="qty"
                step="0.01"
                min="0"
                value={state.qty}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-sm-4 mb-3">
              <CFormLabel><b>{t("LABELS.total_price")}</b></CFormLabel>
              <CFormInput
                readOnly
                name="total_price"
                value={state.total_price}
              />
            </div>
          </div>

          {/* Contact and Payment Section */}
          <div className="row">
            <div className="col-sm-4 mb-3">
              <CFormLabel><b>{t("LABELS.contact")}</b></CFormLabel>
              <CFormInput
                type="text"
                name="contact"
                value={state.contact || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d{0,10}$/.test(value)) {
                    handleChange(e);
                  }
                }}
                maxLength={10}
                inputMode="numeric"
                placeholder="Enter contact"
              />
            </div>

            <div className="col-sm-4 mb-3">
              <CFormLabel><b>{t("LABELS.payment_by")}</b></CFormLabel>
              <CFormSelect
                name="payment_by"
                value={state.payment_by || ""}
                onChange={handleChange}
              >
                <option value="">{t("LABELS.select_payment_by")}</option>
                {receiver_bank.map((bank) => (
                  <option key={bank.value} value={bank.value}>
                    {bank.label}
                  </option>
                ))}
              </CFormSelect>
            </div>

            <div className="col-sm-4 mb-3">
              <CFormLabel><b>{t("LABELS.payment_type")}</b></CFormLabel>
              <CFormSelect
                name="payment_type"
                value={state.payment_type || ""}
                onChange={handleChange}
                required
              >
                <option value="">Select Payment Type</option>
                {paymentTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </CFormSelect>
            </div>
          </div>

          {/* Bank Transfer Fields - IMPS/NEFT/RTGS */}
          {(state.payment_type === "imps" ||
            state.payment_type === "rtgs" ||
            state.payment_type === "neft") && (
            <div className="row">
              <div className="col-sm-3 mb-3">
                <CFormLabel><b>Bank Name</b></CFormLabel>
                <CFormInput
                  name="bank_name"
                  value={state.bank_name || ""}
                  onChange={handleChange}
                  placeholder="Enter Bank Name"
                />
              </div>
              <div className="col-sm-3 mb-3">
                <CFormLabel><b>Account Number</b></CFormLabel>
                <CFormInput
                  name="acc_number"
                  value={state.acc_number || ""}
                  onChange={handleChange}
                  placeholder="Enter Account Number"
                />
              </div>
              <div className="col-sm-3 mb-3">
                <CFormLabel><b>IFSC</b></CFormLabel>
                <CFormInput
                  name="ifsc"
                  value={state.ifsc || ""}
                  onChange={handleChange}
                  placeholder="Enter IFSC"
                />
              </div>
              <div className="col-sm-3 mb-3">
                <CFormLabel><b>Transaction ID</b></CFormLabel>
                <CFormInput
                  name="transaction_id"
                  value={state.transaction_id || ""}
                  onChange={handleChange}
                  placeholder="Enter Transaction ID"
                />
              </div>
            </div>
          )}

          {/* UPI Transaction ID */}
          {state.payment_type === "upi" && (
            <div className="row">
              <div className="col-sm-4 mb-3">
                <CFormLabel><b>Transaction ID</b></CFormLabel>
                <CFormInput
                  name="transaction_id"
                  value={state.transaction_id || ""}
                  onChange={handleChange}
                  placeholder="Enter Transaction ID"
                />
              </div>
            </div>
          )}

          {/* Cheque Fields */}
          {state.payment_type === "cheque" && (
            <div className="row">
              <div className="col-sm-4 mb-3">
                <CFormLabel><b>Cheque Number</b></CFormLabel>
                <CFormInput
                  name="transaction_id"
                  value={state.transaction_id || ""}
                  onChange={handleChange}
                  placeholder="Enter Cheque Number"
                />
              </div>
              <div className="col-sm-4 mb-3">
                <CFormLabel><b>Bank Name</b></CFormLabel>
                <CFormInput
                  name="bank_name"
                  value={state.bank_name || ""}
                  onChange={handleChange}
                  placeholder="Enter Bank Name"
                />
              </div>
            </div>
          )}

          {/* Personal Info */}
          <div className="row">
            <div className="col-sm-4 mb-3">
              <CFormLabel><b>Aadhar Number</b></CFormLabel>
              <CFormInput
                name="aadhar"
                value={state.aadhar || ""}
                onChange={handleChange}
                placeholder="Enter Aadhar Number"
              />
            </div>

            <div className="col-sm-4 mb-3">
              <CFormLabel><b>PAN</b></CFormLabel>
              <CFormInput
                name="pan"
                value={state.pan || ""}
                onChange={handleChange}
                placeholder="Enter PAN"
              />
            </div>

            <div className="col-sm-4 mb-3">
              <CFormLabel><b>Pending Amount</b></CFormLabel>
              <CFormInput
                type="number"
                name="pending_amount"
                value={state.pending_amount || 0}
                onChange={handleChange}
                placeholder="Enter Pending Amount"
              />
            </div>
          </div>

          {/* Photo Upload Section */}
          <div className="row mt-3">
            <div className="col-12">
              <hr />
              <h6>Photos ({getTotalPhotoCount()})</h6>
            </div>
            
            <div className="col-12 mb-3">
              <CFormLabel htmlFor="photo_files">
                <b>Upload Photos (JPG, PNG, PDF - Max 4MB each)</b>
              </CFormLabel>
              <div className="d-flex gap-2">
                <CFormInput
                  ref={fileInputRef}
                  type="file"
                  id="photo_files"
                  name="photo_files"
                  accept="image/png, image/jpeg, image/jpg, application/pdf"
                  onChange={handlePhotoChange}
                  multiple
                  style={{ flex: 1 }}
                />
                {getTotalPhotoCount() > 0 && (
                  <CButton 
                    color="info" 
                    onClick={() => setShowPhotoPreviewModal(true)}
                    type="button"
                  >
                    Preview ({getTotalPhotoCount()})
                  </CButton>
                )}
              </div>
              <small className="text-muted">You can select multiple files at once</small>
            </div>
          </div>
        </CForm>
      </CModalBody>

      <CModalFooter>
        <CButton color="secondary" onClick={handleClose} disabled={loading}>
          {t("LABELS.cancel")}
        </CButton>
        <CButton color="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? "Updating..." : t("LABELS.update_expense")}
        </CButton>
      </CModalFooter>

      {/* Photo Preview Modal */}
      <CModal 
        visible={showPhotoPreviewModal} 
        onClose={() => setShowPhotoPreviewModal(false)}
        size="xl"
        scrollable
      >
        <CModalHeader>
          <CModalTitle>Photo Preview ({getTotalPhotoCount()} photos)</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {/* Existing Photos */}
          {existingPhotos.length > 0 && (
            <div className="mb-4">
              <h6>Existing Photos ({existingPhotos.filter(p => !photosToDelete.includes(p.id)).length})</h6>
              <div className="row g-3">
                {existingPhotos.map((photo) => {
                  const isMarkedForDeletion = photosToDelete.includes(photo.id);
                  return (
                    <div key={photo.id} className="col-md-4">
                      <CCard className={isMarkedForDeletion ? 'border-danger' : ''}>
                        <CCardBody>
                          <div 
                            className="d-flex align-items-center justify-content-center mb-2" 
                            style={{ 
                              height: '200px', 
                              backgroundColor: '#f8f9fa',
                              borderRadius: '4px',
                              overflow: 'hidden',
                              opacity: isMarkedForDeletion ? 0.3 : 1,
                              position: 'relative'
                            }}
                          >
                            {photo.photo_type === 'pdf' ? (
                              <div className="text-center">
                                <CIcon icon={cilCloudUpload} size="4xl" />
                                <div className="mt-2">
                                  <CBadge color="danger">PDF</CBadge>
                                </div>
                              </div>
                            ) : (
                              <img
                                src={`/${photo.photo_url}`}
                                alt={`Photo ${photo.id}`}
                                style={{ 
                                  maxWidth: '100%', 
                                  maxHeight: '100%', 
                                  objectFit: 'contain'
                                }}
                              />
                            )}
                            {isMarkedForDeletion && (
                              <div className="position-absolute top-50 start-50 translate-middle">
                                <CBadge color="danger" style={{ fontSize: '1rem', padding: '8px' }}>
                                  Marked for Deletion
                                </CBadge>
                              </div>
                            )}
                          </div>
                          <small className="text-muted d-block mb-2">
                            {photo.photo_url.split('/').pop()} 
                            {photo.file_size && ` (${photo.file_size} KB)`}
                          </small>
                          <CFormInput
                            type="text"
                            size="sm"
                            placeholder="Photo remark"
                            value={photo.remark || ''}
                            onChange={(e) => updatePhotoRemark(photo.id, e.target.value)}
                            className="mb-2"
                            disabled={isMarkedForDeletion}
                          />
                          <CButton
                            color={isMarkedForDeletion ? 'warning' : 'danger'}
                            size="sm"
                            onClick={() => markExistingPhotoForDeletion(photo.id)}
                            className="w-100"
                          >
                            <CIcon icon={cilTrash} /> 
                            {isMarkedForDeletion ? 'Undo Delete' : 'Delete'}
                          </CButton>
                        </CCardBody>
                      </CCard>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* New Photos */}
          {newPhotos.length > 0 && (
            <div>
              <h6>New Photos to Upload ({newPhotos.length})</h6>
              <div className="row g-3">
                {newPhotos.map((photo) => (
                  <div key={photo.id} className="col-md-4">
                    <CCard className="border-success">
                      <CCardBody>
                        <div 
                          className="d-flex align-items-center justify-content-center mb-2" 
                          style={{ 
                            height: '200px', 
                            backgroundColor: '#f8f9fa',
                            borderRadius: '4px',
                            overflow: 'hidden'
                          }}
                        >
                          {photo.type === 'image' ? (
                            <img
                              src={photo.preview}
                              alt={photo.name}
                              style={{ 
                                maxWidth: '100%', 
                                maxHeight: '100%', 
                                objectFit: 'contain'
                              }}
                            />
                          ) : (
                            <div className="text-center">
                              <CIcon icon={cilCloudUpload} size="4xl" />
                              <div className="mt-2">
                                <CBadge color="danger">PDF</CBadge>
                              </div>
                            </div>
                          )}
                        </div>
                        <small className="text-muted d-block mb-2">
                          {photo.name} ({photo.size} KB)
                        </small>
                        <CFormInput
                          type="text"
                          size="sm"
                          placeholder="Photo remark"
                          value={photo.remark}
                          onChange={(e) => updatePhotoRemark(photo.id, e.target.value)}
                          className="mb-2"
                        />
                        <CButton
                          color="danger"
                          size="sm"
                          onClick={() => removeNewPhoto(photo.id)}
                          className="w-100"
                        >
                          <CIcon icon={cilTrash} /> Remove
                        </CButton>
                      </CCardBody>
                    </CCard>
                  </div>
                ))}
              </div>
            </div>
          )}

          {getTotalPhotoCount() === 0 && (
            <div className="text-center py-4 text-muted">
              No photos added yet
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowPhotoPreviewModal(false)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>
    </CModal>
  );
};

export default EditExpense;