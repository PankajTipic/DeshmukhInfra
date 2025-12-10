// import React, { useEffect, useState } from 'react';
// import {
//   CButton,
//   CForm,
//   CFormInput,
//   CFormLabel,
//   CFormSelect,
//   CModal,
//   CModalBody,
//   CModalFooter,
//   CModalHeader,
//   CModalTitle,
// } from '@coreui/react';
// import { getAPICall, post, put } from '../../../util/api';
// import { useToast } from '../../common/toast/ToastContext';
// import { useTranslation } from 'react-i18next';
// import i18n from 'i18next';

// const EditExpense = ({ visible, onClose, expense, onExpenseUpdated }) => {
//   const [validated, setValidated] = useState(false);
//   const [expenseTypes, setExpenseTypes] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const { showToast } = useToast();
//   const { t } = useTranslation("global");

//   const [state, setState] = useState({
//     name: '',
//     desc: '',
//     expense_id: undefined,
//     typeNotSet: true,
//     qty: 1,
//     price: 0,
//     total_price: 0,
//     expense_date: new Date().toISOString().split('T')[0],
//     show: true,

//     //New Fields
//     payment_type: '',
//     bank_name: '',
//     acc_number: '',
//     ifsc: '',
//     transaction_id: '',
//   });

//   const getCurrentLanguage = () => {
//     const storedLang = localStorage.getItem('i18nextLng');
//     const i18nLang = i18n.language;
//     const finalLang = storedLang || i18nLang || 'en';
//     return finalLang;
//   };

//   // Helper function to get display name based on language
//   const getDisplayName = (item, lng = null) => {
//     const currentLang = lng || getCurrentLanguage();
//     return currentLang === 'mr' ? (item.localName || item.name) : item.name;
//   };

//   const fetchExpenseTypes = async () => {
//     try {
//       const response = await getAPICall('/api/expenseType');
//       setExpenseTypes(response.filter((p) => p.show === 1));
//     } catch (error) {
//       showToast('danger', 'Error occurred ' + error);
//     }
//   };

//   // Load expense types when modal opens
//   useEffect(() => {
//     if (visible) {
//       fetchExpenseTypes();
//     }
//   }, [visible]);

//   // Update expense types when language changes
//   useEffect(() => {
//     if (visible) {
//       fetchExpenseTypes();
//     }
//   }, [i18n.language, visible]);

//   // Populate form when expense prop changes
//   useEffect(() => {
//     if (expense && visible) {
//       setState({
//         name: expense.name || '',
//         desc: expense.desc || '',
//         expense_id: expense.expense_id,
//         typeNotSet: !expense.expense_id,
//         qty: expense.qty || 1,
//         price: expense.price || 0,
//         total_price: expense.total_price || 0,
//         expense_date: expense.expense_date || new Date().toISOString().split('T')[0],
//         show: expense.show !== undefined ? expense.show : true,

//         // New Fields
//         payment_type: expense.payment_type || '',
//         bank_name: expense.bank_name || '',
//         acc_number: expense.acc_number || '',
//         ifsc: expense.ifsc || '',
//         transaction_id: expense.transaction_id || '',
//       });
//       setValidated(false);
//     }
//   }, [expense, visible]);

//   const roundToTwoDecimals = (value) => {
//     return Number((Math.round(value * 100) / 100).toFixed(2));
//   };

//   const calculateFinalAmount = (item) => {
//     const qty = roundToTwoDecimals(parseFloat(item.qty) || 0);
//     const price = roundToTwoDecimals(parseFloat(item.price) || 0);

//     item.total_price = Math.round(qty * price);
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     if (name === 'price' || name === 'qty') {
//       setState((prev) => {
//         const old = { ...prev };
//         old[name] = value;
//         calculateFinalAmount(old);
//         return { ...old };
//       });
//     } else if (name === 'expense_id') {
//       setState((prev) => {
//         const old = { ...prev };
//         old[name] = value;
//         old.typeNotSet = !value;
//         return { ...old };
//       });
//     } else if (name === 'name') {
//       // Allow English alphanumeric, spaces, and Marathi Devanagari characters
//       const regex = /^[a-zA-Z0-9\u0900-\u097F ]*$/;
//       if (regex.test(value)) {
//         setState((prev) => ({ ...prev, [name]: value }));
//       }
//     } else if (name === "payment_type") {
//       let resetFields = {
//         transaction_id: "",
//         bank_name: "",
//         acc_number: "",
//         ifsc: "",
//       };

//       if (value === "cash") {
//         // already clears all
//       } else if (value === "upi") {
//         resetFields = {
//           transaction_id: "",
//           bank_name: "",
//           acc_number: "",
//           ifsc: "",
//         };
//       } else if (value === "IMPS/NEFT/RTGS") {
//         resetFields = {
//           transaction_id: "",
//           bank_name: "",
//           acc_number: "",
//           ifsc: "",
//         };
//       }

//       setState((prev) => ({
//         ...prev,
//         [name]: value,
//         ...resetFields,
//       }));
//     } else {
//       setState((prev) => ({ ...prev, [name]: value }));
//     }
//   };


//   const handleSubmit = async (event) => {
//     event.preventDefault();
//     event.stopPropagation();
//     setValidated(true);

//     if (state.expense_id && state.price > 0 && state.qty > 0) {
//       setLoading(true);
//       try {
//         let cleanedData = { ...state };

//         // Clear irrelevant fields based on payment_type
//         if (state.payment_type === "cash") {
//           cleanedData = {
//             ...cleanedData,
//             transaction_id: "",
//             bank_name: "",
//             acc_number: "",
//             ifsc: ""
//           };
//         } else if (state.payment_type === "upi") {
//           cleanedData = {
//             ...cleanedData,
//             bank_name: "",
//             acc_number: "",
//             ifsc: ""
//           };
//         } else if (state.payment_type === "IMPS/NEFT/RTGS") {
//           cleanedData = {
//             ...cleanedData,
//             // keep all fields needed for bank transfer
//           };
//         }

//         const updateData = {
//           ...cleanedData,
//           id: expense.id, // Include the expense ID for updating
//         };

//         console.log("Submitting updateData:", updateData); // 🔍 Debug log

//         const resp = await put(`/api/expense/${expense.id}`, updateData);
//         if (resp) {
//           showToast("success", t("MSG.expense_updated_successfully"));
//           onExpenseUpdated && onExpenseUpdated(updateData);
//           onClose();
//         } else {
//           showToast("danger", t("MSG.error_occured_please_try_again_later_msg"));
//         }
//       } catch (error) {
//         showToast("danger", "Error occurred " + error);
//       } finally {
//         setLoading(false);
//       }
//     } else {
//       setState((old) => ({ ...old, typeNotSet: old.expense_id === undefined }));
//       showToast("danger", t("MSG.fill_required_fields"));
//     }
//   };


//   const handleClose = () => {
//     setValidated(false);
//     onClose();
//   };

//   const today = new Date().toISOString().split('T')[0];
//   const lng = getCurrentLanguage();

//   return (
//     <CModal visible={visible} onClose={handleClose} size="lg">
//       <CModalHeader>
//         <CModalTitle>{t("LABELS.edit_expense")}</CModalTitle>
//       </CModalHeader>
//       <CModalBody>
//         <CForm noValidate validated={validated} onSubmit={handleSubmit}>
//           <div className="row">
//             <div className="col-sm-6">
//               <div className="mb-3">
//                 <CFormLabel htmlFor="expense_id">
//                   <b>{t("LABELS.expense_type")}</b>
//                 </CFormLabel>
//                 <CFormSelect
//                   aria-label={t("MSG.select_expense_type_msg")}
//                   value={state.expense_id || ''}
//                   id="expense_id"
//                   name="expense_id"
//                   onChange={handleChange}
//                   required
//                   feedbackInvalid={t("MSG.select_expense_type_validation")}
//                 >
//                   <option value="">{t("MSG.select_expense_type_msg")}</option>
//                   {expenseTypes.map((type) => {
//                     const displayName = getDisplayName(type, lng);
//                     return (
//                       <option key={type.id} value={type.id}>
//                         {displayName}
//                       </option>
//                     );
//                   })}
//                 </CFormSelect>
//               </div>
//             </div>
//             <div className="col-sm-6">
//               <div className="mb-3">
//                 <CFormLabel htmlFor="name">
//                   <b>{t("LABELS.about_expense")}</b>
//                 </CFormLabel>
//                 <CFormInput
//                   type="text"
//                   id="name"
//                   placeholder={t("LABELS.enter_expense_description")}
//                   name="name"
//                   value={state.name}
//                   onChange={handleChange}
//                 />
//               </div>
//             </div>
//           </div>

//           <div className="row">
//             <div className="col-sm-6">
//               <div className="mb-3">
//                 <CFormLabel htmlFor="expense_date">
//                   <b>{t("LABELS.expense_date")}</b>
//                 </CFormLabel>
//                 <CFormInput
//                   type="date"
//                   id="expense_date"
//                   name="expense_date"
//                   max={today}
//                   value={state.expense_date}
//                   onChange={handleChange}
//                   required
//                   feedbackInvalid={t("MSG.select_date_validation")}
//                 />
//               </div>
//             </div>
//             <div className="col-sm-6">
//               <div className="mb-3">
//                 <CFormLabel htmlFor="price">
//                   <b>{t("LABELS.price_per_unit")}</b>
//                 </CFormLabel>
//                 <CFormInput
//                   type="number"
//                   min="0"
//                   id="price"
//                   onWheel={(e) => e.target.blur()}
//                   placeholder="0.00"
//                   step="0.01"
//                   name="price"
//                   // onFocus={() => setState(prev => ({ ...prev, price: '' }))}
//                   value={state.price}
//                   onChange={handleChange}
//                   required
//                   feedbackInvalid={t("MSG.price_validation")}
//                 />
//               </div>
//             </div>
//           </div>

//           <div className="row">
//             <div className="col-sm-6">
//               <div className="mb-3">
//                 <CFormLabel htmlFor="qty">
//                   <b>{t("LABELS.total_units")}</b>
//                 </CFormLabel>
//                 <CFormInput
//                   type="number"
//                   id="qty"
//                   step="0.01"
//                   min="0"
//                   placeholder=" "
//                   name="qty"
//                   value={state.qty}
//                   onWheel={(e) => e.target.blur()}
//                   onKeyDown={(e) => {
//                     if (['e', '+', '-', ','].includes(e.key)) {
//                       e.preventDefault();
//                     }
//                   }}
//                   onChange={(e) => {
//                     const value = e.target.value;
//                     if (
//                       value === '' ||
//                       /^\d+(\.\d{0,2})?$/.test(value)
//                     ) {
//                       handleChange(e);
//                     }
//                   }}
//                   required
//                   feedbackInvalid={t("MSG.quantity_validation")}
//                 />
//               </div>
//             </div>
//             <div className="col-sm-6">
//               <div className="mb-3">
//                 <CFormLabel htmlFor="total_price">
//                   <b>{t("LABELS.total_price")}</b>
//                 </CFormLabel>
//                 <CFormInput
//                   type="number"
//                   min="0"
//                   onWheel={(e) => e.target.blur()}
//                   id="total_price"
//                   placeholder=""
//                   name="total_price"
//                   value={state.total_price}
//                   onChange={handleChange}
//                   readOnly
//                 />
//               </div>
//             </div>

//             <div className="col-sm-6">
//               <div className="mb-3">
//                 <CFormLabel htmlFor="payment_type"><b>{t("LABELS.payment_type")}</b></CFormLabel>
//                 <CFormSelect
//                   id="payment_type"
//                   name="payment_type"
//                   value={state.payment_type || ""}
//                   onChange={handleChange}
//                   required
//                   feedbackInvalid="Please select a payment type"
//                 >
//                   <option value="">Select Payment Type</option>
//                   <option value="cash">Cash</option>
//                   <option value="upi">UPI</option>
//                   <option value="IMPS/NEFT/RTGS">IMPS/NEFT/RTGS</option>
//                 </CFormSelect>
//               </div>
//             </div>

//             {/* Transaction Id */}
//             {(state.payment_type === "upi") && (
//               <div className="col-sm-6">
//                 <div className="mb-3">
//                   <CFormLabel htmlFor="transaction_id">
//                     <b>{t("LABELS.transaction_id")}</b>
//                   </CFormLabel>
//                   <CFormInput
//                     type="text"
//                     id="transaction_id"
//                     placeholder={t("LABELS.enter_transaction_id")}
//                     name="transaction_id"
//                     value={state.transaction_id}
//                     onChange={handleChange}
//                   />
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* New Fields - Conditionally Rendered */}
//           {(state.payment_type === "IMPS/NEFT/RTGS") && (
//             <div className="row">
//               {/* Bank Name */}
//               <div className="col-sm-3">
//                 <div className="mb-3">
//                   <CFormLabel htmlFor="bank_name">
//                     <b>{t("LABELS.bank_name")}</b>
//                   </CFormLabel>
//                   <CFormInput
//                     type="text"
//                     id="bank_name"
//                     placeholder={t("LABELS.enter_bank_name")}
//                     name="bank_name"
//                     value={state.bank_name}
//                     onChange={handleChange}
//                   />
//                 </div>
//               </div>

//               {/* Account Number */}
//               <div className="col-sm-3">
//                 <div className="mb-3">
//                   <CFormLabel htmlFor="acc_number">
//                     <b>{t("LABELS.acc_number")}</b>
//                   </CFormLabel>
//                   <CFormInput
//                     type="text"
//                     id="acc_number"
//                     placeholder={t("LABELS.enter_acc_number")}
//                     name="acc_number"
//                     value={state.acc_number}
//                     onChange={handleChange}
//                   />
//                 </div>
//               </div>

//               {/* IFSC */}
//               <div className="col-sm-3">
//                 <div className="mb-3">
//                   <CFormLabel htmlFor="ifsc">
//                     <b>{t("LABELS.ifsc")}</b>
//                   </CFormLabel>
//                   <CFormInput
//                     type="text"
//                     id="ifsc"
//                     placeholder={t("LABELS.enter_ifsc")}
//                     name="ifsc"
//                     value={state.ifsc}
//                     onChange={handleChange}
//                   />
//                 </div>
//               </div>

//               {/* Transaction Id */}
//               <div className="col-sm-3">
//                 <div className="mb-3">
//                   <CFormLabel htmlFor="transaction_id">
//                     <b>{t("LABELS.transaction_id")}</b>
//                   </CFormLabel>
//                   <CFormInput
//                     type="text"
//                     id="transaction_id"
//                     placeholder={t("LABELS.enter_transaction_id")}
//                     name="transaction_id"
//                     value={state.transaction_id}
//                     onChange={handleChange}
//                   />
//                 </div>
//               </div>


//             </div>
//           )}
//         </CForm>
//       </CModalBody>
//       <CModalFooter>
//         <CButton color="secondary" onClick={handleClose} disabled={loading}>
//           {t("LABELS.cancel")}
//         </CButton>
//         <CButton
//           color="primary"
//           onClick={handleSubmit}
//           disabled={loading}
//         >
//           {loading ? t("LABELS.updating") || "Updating..." : t("LABELS.update_expense")}
//         </CButton>
//       </CModalFooter>
//     </CModal>
//   );
// };

// export default EditExpense;



import React, { useEffect, useState } from "react";
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
} from "@coreui/react";
import { getAPICall, put } from "../../../util/api";
import { useToast } from "../../common/toast/ToastContext";
import { useTranslation } from "react-i18next";
import i18n from "i18next";
import { receiver_bank } from "../../../util/Feilds";

const EditExpense = ({ visible, onClose, expense, onExpenseUpdated }) => {
  const [validated, setValidated] = useState(false);
  const [expenseTypes, setExpenseTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const { t } = useTranslation("global");

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

  const handleSubmit = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    setValidated(true);

    if (state.expense_id && state.price > 0 && state.qty > 0) {
      setLoading(true);
      try {
        const cleanedData = { ...state, id: expense.id };
        const resp = await put(`/api/expense/${expense.id}`, cleanedData);

        if (resp) {
          showToast("success", t("MSG.expense_updated_successfully"));
          onExpenseUpdated && onExpenseUpdated(cleanedData);
          onClose();
        } else {
          showToast("danger", t("MSG.error_occured_please_try_again_later_msg"));
        }
      } catch (error) {
        showToast("danger", "Error occurred " + error);
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
    <CModal visible={visible} onClose={handleClose} size="xl">
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

          {/* Payment Section */}
          <div className="row">
            {/* <div className="col-sm-4 mb-3">
              <CFormLabel><b>{t("LABELS.payment_by")}</b></CFormLabel>
              <CFormInput
                name="payment_by"
                value={state.payment_by || ""}
                onChange={handleChange}
              />
            </div> */}

            <div className="row">
  <div className="col-sm-4 mb-3">
    <CFormLabel htmlFor="payment_by">
      <b>{t("LABELS.payment_by")}</b>
    </CFormLabel>

    <CFormSelect
      id="payment_by"
      name="payment_by"
      value={state.payment_by}
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
</div>


            <div className="col-sm-4 mb-3">
              <CFormLabel><b>{t("LABELS.payment_type")}</b></CFormLabel>
              <CFormSelect
                name="payment_type"
                value={state.payment_type || ""}
                onChange={handleChange}
              >
                <option value="">Select Payment Type</option>
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="IMPS/NEFT/RTGS">IMPS/NEFT/RTGS</option>
              </CFormSelect>
            </div>

            {(state.payment_type === "upi" ||
              state.payment_type === "IMPS/NEFT/RTGS") && (
              <>
                <div className="col-sm-3 mb-3">
                  <CFormLabel><b>Transaction ID</b></CFormLabel>
                  <CFormInput
                    name="transaction_id"
                    value={state.transaction_id || ""}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}
          </div>

          {/* Bank Info */}
          {state.payment_type === "IMPS/NEFT/RTGS" && (
            <div className="row">
              <div className="col-sm-3 mb-3">
                <CFormLabel><b>Bank Name</b></CFormLabel>
                <CFormInput
                  name="bank_name"
                  value={state.bank_name || ""}
                  onChange={handleChange}
                />
              </div>
              <div className="col-sm-3 mb-3">
                <CFormLabel><b>Account Number</b></CFormLabel>
                <CFormInput
                  name="acc_number"
                  value={state.acc_number || ""}
                  onChange={handleChange}
                />
              </div>
              <div className="col-sm-3 mb-3">
                <CFormLabel><b>IFSC</b></CFormLabel>
                <CFormInput
                  name="ifsc"
                  value={state.ifsc || ""}
                  onChange={handleChange}
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
              />
            </div>

            <div className="col-sm-4 mb-3">
              <CFormLabel><b>PAN</b></CFormLabel>
              <CFormInput
                name="pan"
                value={state.pan || ""}
                onChange={handleChange}
              />
            </div>

            <div className="col-sm-4 mb-3">
              <CFormLabel><b>Pending Amount</b></CFormLabel>
              <CFormInput
                type="number"
                name="pending_amount"
                value={state.pending_amount || 0}
                onChange={handleChange}
              />
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
    </CModal>
  );
};

export default EditExpense;










































































































































































// import React, { useEffect, useState } from 'react';
// import {
//   CButton,
//   CForm,
//   CFormInput,
//   CFormLabel,
//   CFormSelect,
//   CFormCheck,
//   CModal,
//   CModalBody,
//   CModalFooter,
//   CModalHeader,
//   CModalTitle,
// } from '@coreui/react';
// import { getAPICall, put } from '../../../util/api';
// import { useToast } from '../../common/toast/ToastContext';
// import { useTranslation } from 'react-i18next';
// import i18n from 'i18next';
// import Select from "react-select";

// const EditExpense = ({ visible, onClose, expense, onExpenseUpdated }) => {
//   const [validated, setValidated] = useState(false);
//   const [expenseTypes, setExpenseTypes] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const { showToast } = useToast();
//   const { t } = useTranslation("global");

//   const [state, setState] = useState({
//     project_id: '', // Changed from customer_id to project_id
//     name: '',
//     desc: '',
//     expense_id: undefined,
//     typeNotSet: true,
//     qty: 1,
//     price: 0,
//     total_price: 0,
//     expense_date: new Date().toISOString().split('T')[0],
//     contact: '',
//     payment_by: '',
//     payment_type: '',
//     pending_amount: '',
//     show: true,
//     isGst: false,
//     photoAvailable: true,
//     photo_url: null,
//     photo_remark: '',
//     bank_name: '',
//     acc_number: '',
//     ifsc: '',
//     aadhar: '',
//     pan: '',
//     transaction_id: '',
//     gst: 18,
//     sgst: 9,
//     cgst: 9,
//     igst: 0,
//     baseAmount: 0,
//     gstAmount: 0,
//     sgstAmount: 0,
//     cgstAmount: 0,
//     igstAmount: 0,
//   });

//   const getCurrentLanguage = () => {
//     const storedLang = localStorage.getItem('i18nextLng');
//     const i18nLang = i18n.language;
//     const finalLang = storedLang || i18nLang || 'en';
//     return finalLang;
//   };

//   const getDisplayName = (item, lng = null) => {
//     const currentLang = lng || getCurrentLanguage();
//     return currentLang === 'mr' ? (item.localName || item.name) : item.name;
//   };

//   const fetchExpenseTypes = async () => {
//     try {
//       const response = await getAPICall('/api/expenseType');
//       setExpenseTypes(response.filter((p) => p.show === 1));
//     } catch (error) {
//       showToast('danger', 'Error occurred ' + error);
//     }
//   };

//   useEffect(() => {
//     if (visible) {
//       fetchExpenseTypes();
//     }
//   }, [visible]);

//   useEffect(() => {
//     if (visible) {
//       fetchExpenseTypes();
//     }
//   }, [i18n.language, visible]);

//   useEffect(() => {
//     if (expense && visible) {
//       setState({
//         project_id: expense.project_id || '',
//         name: expense.name || '',
//         desc: expense.desc || '',
//         expense_id: expense.expense_id,
//         typeNotSet: !expense.expense_id,
//         qty: expense.qty || 1,
//         price: expense.price || 0,
//         total_price: expense.total_price || 0,
//         expense_date: expense.expense_date || new Date().toISOString().split('T')[0],
//         contact: expense.contact || '',
//         payment_by: expense.payment_by || '',
//         payment_type: expense.payment_type || '',
//         pending_amount: expense.pending_amount || '',
//         show: expense.show !== undefined ? expense.show : true,
//         isGst: expense.isGst || false,
//         photoAvailable: expense.photoAvailable || true,
//         photo_url: expense.photo_url || null,
//         photo_remark: expense.photo_remark || '',
//         bank_name: expense.bank_name || '',
//         acc_number: expense.acc_number || '',
//         ifsc: expense.ifsc || '',
//         aadhar: expense.aadhar || '',
//         pan: expense.pan || '',
//         transaction_id: expense.transaction_id || '',
//         gst: expense.gst || 18,
//         sgst: expense.sgst || 9,
//         cgst: expense.cgst || 9,
//         igst: expense.igst || 0,
//         baseAmount: expense.baseAmount || 0,
//         gstAmount: expense.gstAmount || 0,
//         sgstAmount: expense.sgstAmount || 0,
//         cgstAmount: expense.cgstAmount || 0,
//         igstAmount: expense.igstAmount || 0,
//       });
//       setValidated(false);
//     }
//   }, [expense, visible]);

//   const roundToTwoDecimals = (value) => {
//     return Number((Math.round(value * 100) / 100).toFixed(2));
//   };

//   const computeTaxesFromTotal = (updated) => {
//     const total = parseFloat(updated.total_price) || 0;
//     const gstPct = parseFloat(updated.gst) || 0;
//     const cgstPct = parseFloat(updated.cgst) || 0;
//     const sgstPct = parseFloat(updated.sgst) || 0;
//     const igstPct = parseFloat(updated.igst) || 0;

//     if (gstPct <= 0 || total <= 0) {
//       updated.baseAmount = Number(total.toFixed(2));
//       updated.gstAmount = updated.cgstAmount = updated.sgstAmount = updated.igstAmount = 0;
//       return updated;
//     }

//     const base = total / (1 + gstPct / 100);
//     const cgstAmount = base * (cgstPct / 100);
//     const sgstAmount = base * (sgstPct / 100);
//     const igstAmount = base * (igstPct / 100);

//     updated.baseAmount = Number(base.toFixed(2));
//     updated.cgstAmount = Number(cgstAmount.toFixed(2));
//     updated.sgstAmount = Number(sgstAmount.toFixed(2));
//     updated.igstAmount = Number(igstAmount.toFixed(2));
//     updated.gstAmount = Number((cgstAmount + sgstAmount + igstAmount).toFixed(2));

//     return updated;
//   };

//   const calculateFinalAmount = (item) => {
//     const qtyNum = parseFloat(item.qty) || 0;
//     const priceNum = parseFloat(item.price) || 0;
//     const total = Number((qtyNum * priceNum).toFixed(2));
//     item.total_price = total;

//     if (item.isGst) {
//       computeTaxesFromTotal(item);
//     } else {
//       item.baseAmount = total;
//       item.gstAmount = item.cgstAmount = item.sgstAmount = item.igstAmount = 0;
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value, type, checked, files } = e.target;

//     setState((prev) => {
//       let updated = { ...prev };

//       if (type === "file" && name === "photo_url") {
//         updated.photo_url = files[0] || null;
//         return updated;
//       }

//       if (type === "checkbox" && name === "isGst") {
//         updated.isGst = checked;
//         if (checked) {
//           computeTaxesFromTotal(updated);
//         } else {
//           updated.baseAmount = Number((updated.total_price || 0).toFixed(2));
//           updated.gstAmount = updated.cgstAmount = updated.sgstAmount = updated.igstAmount = 0;
//         }
//         return updated;
//       }

//       if (name === "price" || name === "qty") {
//         updated[name] = value === '' ? '' : value;
//         const qtyNum = parseFloat(name === "qty" ? (value || 0) : (updated.qty || 0)) || 0;
//         const priceNum = parseFloat(name === "price" ? (value || 0) : (updated.price || 0)) || 0;
//         updated.total_price = Number((qtyNum * priceNum).toFixed(2));
//         if (updated.isGst) computeTaxesFromTotal(updated);
//         return updated;
//       }

//       if (name === "total_price") {
//         updated.total_price = Number(value || 0);
//         if (updated.isGst) computeTaxesFromTotal(updated);
//         return updated;
//       }

//       if (name === "gst") {
//         updated.gst = Number(value || 0);
//         const half = (Number(value) || 0) / 2;
//         updated.cgst = Number(half.toFixed(2));
//         updated.sgst = Number(half.toFixed(2));
//         if (updated.isGst) computeTaxesFromTotal(updated);
//         return updated;
//       }

//       if (["cgst", "sgst", "igst"].includes(name)) {
//         updated[name] = Number(value || 0);
//         updated.gst = Number(((Number(updated.cgst) || 0) + (Number(updated.sgst) || 0) + (Number(updated.igst) || 0)).toFixed(2));
//         if (updated.isGst) computeTaxesFromTotal(updated);
//         return updated;
//       }

//       if (name === "expense_id") {
//         updated.expense_id = value;
//         updated.typeNotSet = !value;
//         return updated;
//       }

//       if (name === "name") {
//         const regex = /^[a-zA-Z0-9\u0900-\u097F ]*$/;
//         if (regex.test(value)) updated.name = value;
//         return updated;
//       }

//       if (name === "photoAvailable") {
//         updated.photoAvailable = checked;
//         if (checked) {
//           updated.photo_remark = "";
//         } else {
//           updated.photo_url = null;
//         }
//         return updated;
//       }

//       if (name === "payment_type") {
//         let resetFields = {
//           transaction_id: "",
//           bank_name: "",
//           acc_number: "",
//           ifsc: "",
//           aadhar: "",
//           pan: "",
//         };

//         if (value === "cash") {
//         } else if (value === "upi") {
//           resetFields = {
//             bank_name: "",
//             acc_number: "",
//             ifsc: "",
//             aadhar: "",
//             pan: "",
//           };
//         } else if (value === "IMPS/NEFT/RTGS") {
//         }

//         updated = {
//           ...updated,
//           [name]: value,
//           ...resetFields,
//         };
//         return updated;
//       }

//       updated[name] = type === "checkbox" ? checked : value;
//       return updated;
//     });
//   };

//   const handleSubmit = async (event) => {
//     event.preventDefault();
//     event.stopPropagation();
//     setValidated(true);

//     if (state.expense_id && state.price > 0 && state.qty > 0 && state.project_id) {
//       setLoading(true);
//       try {
//         let cleanedData = { ...state };

//         if (state.payment_type === "cash") {
//           cleanedData = {
//             ...cleanedData,
//             transaction_id: "",
//             bank_name: "",
//             acc_number: "",
//             ifsc: "",
//             aadhar: "",
//             pan: "",
//           };
//         } else if (state.payment_type === "upi") {
//           cleanedData = {
//             ...cleanedData,
//             bank_name: "",
//             acc_number: "",
//             ifsc: "",
//             aadhar: "",
//             pan: "",
//           };
//         }

//         const updateData = {
//           ...cleanedData,
//           id: expense.id,
//         };

//         const resp = await put(`/api/expense/${expense.id}`, updateData);
//         if (resp) {
//           showToast("success", t("MSG.expense_updated_successfully"));
//           onExpenseUpdated && onExpenseUpdated(updateData);
//           onClose();
//         } else {
//           showToast("danger", t("MSG.error_occured_please_try_again_later_msg"));
//         }
//       } catch (error) {
//         showToast("danger", "Error occurred " + error);
//       } finally {
//         setLoading(false);
//       }
//     } else {
//       setState((old) => ({ ...old, typeNotSet: old.expense_id === undefined }));
//       showToast("danger", t("MSG.fill_required_fields"));
//     }
//   };

//   const handleClose = () => {
//     setValidated(false);
//     onClose();
//   };

//   const today = new Date().toISOString().split('T')[0];
//   const lng = getCurrentLanguage();

//   const options = expenseTypes.map(type => ({
//     value: type.id,
//     label: getDisplayName(type, lng),
//   }));

//   return (
//     <CModal visible={visible} onClose={handleClose} size="lg">
//       <CModalHeader>
//         <CModalTitle>{t("LABELS.edit_expense")}</CModalTitle>
//       </CModalHeader>
//       <CModalBody>
//         <CForm noValidate validated={validated} onSubmit={handleSubmit}>
//           <div className="row">
//             <div className="col-sm-6" style={{ position: 'relative' }}>
//               <CFormLabel htmlFor="project_id"><b>{t("LABELS.project_name")}</b></CFormLabel>
//               <CFormInput
//                 type="text"
//                 id="project_id"
//                 placeholder={t("LABELS.enter_project_name")}
//                 name="project_id"
//                 value={state.project_id}
//                 onChange={handleChange}
//                 autoComplete="off"
//                 required
//                 feedbackInvalid={t("MSG.customer_name_validation")}
//               />
//             </div>
//             <div className="col-sm-6">
//               <CFormLabel htmlFor="expense_id"><b>{t("LABELS.expense_type")}</b></CFormLabel>
//               <Select
//                 id="expense_id"
//                 name="expense_id"
//                 value={options.find(opt => String(opt.value) === String(state.expense_id)) || null}
//                 onChange={(selectedOption) => setState(prev => ({
//                   ...prev,
//                   expense_id: selectedOption ? selectedOption.value : "",
//                 }))}
//                 options={options}
//                 placeholder={t("MSG.select_expense_type_msg")}
//                 isClearable
//                 isSearchable
//                 styles={{
//                   control: (base) => ({
//                     ...base,
//                     borderRadius: "0.5rem",
//                     borderColor: "#ced4da",
//                     minHeight: "38px",
//                   }),
//                 }}
//               />
//             </div>
//           </div>

//           <div className="row">
//             <div className="col-sm-6">
//               <CFormLabel htmlFor="name"><b>{t("LABELS.about_expense")}</b></CFormLabel>
//               <CFormInput
//                 type="text"
//                 id="name"
//                 placeholder={t("LABELS.enter_expense_description")}
//                 name="name"
//                 value={state.name}
//                 onChange={handleChange}
//               />
//             </div>
//             <div className="col-sm-6">
//               <CFormLabel htmlFor="expense_date"><b>{t("LABELS.expense_date")}</b></CFormLabel>
//               <CFormInput
//                 type="date"
//                 id="expense_date"
//                 name="expense_date"
//                 max={today}
//                 value={state.expense_date}
//                 onChange={handleChange}
//                 required
//                 feedbackInvalid={t("MSG.select_date_validation")}
//               />
//             </div>
//           </div>

//           <div className="row align-items-end">
//             <div className="col-sm-3">
//               <CFormLabel htmlFor="price"><b>{t("LABELS.price_per_unit")}</b></CFormLabel>
//               <CFormInput
//                 type="number"
//                 min="0"
//                 id="price"
//                 onWheel={(e) => e.target.blur()}
//                 placeholder="0.00"
//                 step="0.01"
//                 name="price"
//                 value={state.price}
//                 onChange={handleChange}
//                 required
//                 feedbackInvalid={t("MSG.price_validation")}
//               />
//             </div>
//             <div className="col-sm-3">
//               <CFormLabel htmlFor="qty"><b>{t("LABELS.total_units")}</b></CFormLabel>
//               <CFormInput
//                 type="number"
//                 id="qty"
//                 step="0.01"
//                 min="0"
//                 placeholder=" "
//                 name="qty"
//                 value={state.qty}
//                 onWheel={(e) => e.target.blur()}
//                 onKeyDown={(e) => ['e', '+', '-', ','].includes(e.key) && e.preventDefault()}
//                 onChange={(e) => {
//                   const value = e.target.value;
//                   if (value === '' || /^\d+(\.\d{0,2})?$/.test(value)) handleChange(e);
//                 }}
//                 required
//                 feedbackInvalid={t("MSG.quantity_validation")}
//               />
//             </div>
//             <div className="col-sm-3">
//               <CFormCheck
//                 id="isGst"
//                 name="isGst"
//                 label="Is GST Bill"
//                 checked={state.isGst}
//                 onChange={handleChange}
//               />
//             </div>
//             <div className="col-sm-3">
//               <CFormLabel htmlFor="total_price"><b>{t("LABELS.total_price")}</b></CFormLabel>
//               <CFormInput
//                 type="number"
//                 min="0"
//                 onWheel={(e) => e.target.blur()}
//                 id="total_price"
//                 placeholder=""
//                 name="total_price"
//                 value={state.total_price}
//                 onChange={handleChange}
//                 readOnly
//               />
//             </div>
//           </div>

//           {state.isGst && (
//             <div className="row mt-3 p-3 border rounded bg-light mb-3">
//               <div className="col-sm-3">
//                 <CFormLabel><b>Total GST (%)</b></CFormLabel>
//                 <div className="d-flex align-items-center">
//                   <CFormInput
//                     type="number"
//                     name="gst"
//                     value={state.gst}
//                     onChange={handleChange}
//                     min="0"
//                     step="0.01"
//                   />
//                   <span className="ms-2">%</span>
//                 </div>
//                 <small className="text-muted">GST Amount: ₹{state.gstAmount?.toFixed(2) || '0.00'}</small>
//               </div>
//               <div className="col-sm-3">
//                 <CFormLabel><b>SGST (%)</b></CFormLabel>
//                 <div className="d-flex align-items-center">
//                   <CFormInput
//                     type="number"
//                     name="sgst"
//                     value={state.sgst}
//                     onChange={handleChange}
//                     min="0"
//                     step="0.01"
//                   />
//                   <span className="ms-2">%</span>
//                 </div>
//                 <small className="text-muted">SGST Amount: ₹{state.sgstAmount?.toFixed(2) || '0.00'}</small>
//               </div>
//               <div className="col-sm-3">
//                 <CFormLabel><b>CGST (%)</b></CFormLabel>
//                 <div className="d-flex align-items-center">
//                   <CFormInput
//                     type="number"
//                     name="cgst"
//                     value={state.cgst}
//                     onChange={handleChange}
//                     min="0"
//                     step="0.01"
//                   />
//                   <span className="ms-2">%</span>
//                 </div>
//                 <small className="text-muted">CGST Amount: ₹{state.cgstAmount?.toFixed(2) || '0.00'}</small>
//               </div>
//               <div className="col-sm-3">
//                 <CFormLabel><b>IGST (%)</b></CFormLabel>
//                 <div className="d-flex align-items-center">
//                   <CFormInput
//                     type="number"
//                     name="igst"
//                     value={state.igst}
//                     onChange={handleChange}
//                     min="0"
//                     step="0.01"
//                   />
//                   <span className="ms-2">%</span>
//                 </div>
//                 <small className="text-muted">IGST Amount: ₹{state.igstAmount?.toFixed(2) || '0.00'}</small>
//               </div>
//               <div className="col-12 mt-2">
//                 <div className="p-2 bg-info-subtle rounded">
//                   <strong>Note:</strong> Total price remains unchanged. The values above show how much GST/CGST/SGST/IGST are included inside the current total price.
//                 </div>
//               </div>
//             </div>
//           )}

//           <div className="row">
//             <div className="col-sm-3">
//               <CFormLabel htmlFor="contact"><b>{t("LABELS.contact")}</b></CFormLabel>
//               <CFormInput
//                 type="text"
//                 id="contact"
//                 placeholder={t("LABELS.enter_contact")}
//                 name="contact"
//                 value={state.contact}
//                 onChange={(e) => {
//                   const value = e.target.value;
//                   if (/^\d{0,10}$/.test(value)) handleChange(e);
//                 }}
//                 maxLength={10}
//                 inputMode="numeric"
//               />
//             </div>
//             <div className="col-sm-3">
//               <CFormLabel htmlFor="payment_by"><b>{t("LABELS.payment_by")}</b></CFormLabel>
//               <CFormSelect
//                 id="payment_by"
//                 name="payment_by"
//                 value={state.payment_by}
//                 onChange={handleChange}
//               >
//                 <option value="">{t("LABELS.select_payment_by")}</option>
//               </CFormSelect>
//             </div>
//             <div className="col-sm-3">
//               <CFormLabel htmlFor="payment_type"><b>{t("LABELS.payment_type")}</b></CFormLabel>
//               <CFormSelect
//                 id="payment_type"
//                 name="payment_type"
//                 value={state.payment_type || ""}
//                 onChange={handleChange}
//                 required
//                 feedbackInvalid="Please select a payment type"
//               >
//                 <option value="">Select Payment Type</option>
//                 <option value="cash">Cash</option>
//                 <option value="upi">UPI</option>
//                 <option value="IMPS/NEFT/RTGS">IMPS/NEFT/RTGS</option>
//               </CFormSelect>
//             </div>
//             <div className="col-sm-3">
//               <CFormLabel htmlFor="pending_amount"><b>{t("LABELS.pending_amount")}</b></CFormLabel>
//               <CFormInput
//                 type="number"
//                 id="pending_amount"
//                 placeholder={t("LABELS.enter_pending_amount")}
//                 name="pending_amount"
//                 value={state.pending_amount}
//                 onChange={handleChange}
//               />
//             </div>
//           </div>

//           {(state.payment_type === "IMPS/NEFT/RTGS") && (
//             <div className="row">
//               <div className="col-sm-3">
//                 <CFormLabel htmlFor="bank_name"><b>{t("LABELS.bank_name")}</b></CFormLabel>
//                 <CFormInput
//                   type="text"
//                   id="bank_name"
//                   placeholder={t("LABELS.enter_bank_name")}
//                   name="bank_name"
//                   value={state.bank_name}
//                   onChange={handleChange}
//                 />
//               </div>
//               <div className="col-sm-3">
//                 <CFormLabel htmlFor="acc_number"><b>{t("LABELS.acc_number")}</b></CFormLabel>
//                 <CFormInput
//                   type="text"
//                   id="acc_number"
//                   placeholder={t("LABELS.enter_acc_number")}
//                   name="acc_number"
//                   value={state.acc_number}
//                   onChange={handleChange}
//                 />
//               </div>
//               <div className="col-sm-3">
//                 <CFormLabel htmlFor="ifsc"><b>{t("LABELS.ifsc")}</b></CFormLabel>
//                 <CFormInput
//                   type="text"
//                   id="ifsc"
//                   placeholder={t("LABELS.enter_ifsc")}
//                   name="ifsc"
//                   value={state.ifsc}
//                   onChange={handleChange}
//                 />
//               </div>
//               <div className="col-sm-3">
//                 <CFormLabel htmlFor="transaction_id"><b>{t("LABELS.transaction_id")}</b></CFormLabel>
//                 <CFormInput
//                   type="text"
//                   id="transaction_id"
//                   placeholder={t("LABELS.enter_transaction_id")}
//                   name="transaction_id"
//                   value={state.transaction_id}
//                   onChange={handleChange}
//                 />
//               </div>
//             </div>
//           )}

//           {(state.payment_type === "upi") && (
//             <div className="col-sm-3">
//               <CFormLabel htmlFor="transaction_id"><b>{t("LABELS.transaction_id")}</b></CFormLabel>
//               <CFormInput
//                 type="text"
//                 id="transaction_id"
//                 placeholder={t("LABELS.enter_transaction_id")}
//                 name="transaction_id"
//                 value={state.transaction_id}
//                 onChange={handleChange}
//               />
//             </div>
//           )}

//           <div className="row mt-3">
//             <div className="col-sm-3">
//               <CFormCheck
//                 id="photoAvailable"
//                 name="photoAvailable"
//                 label="Photo Available"
//                 checked={state.photoAvailable}
//                 onChange={handleChange}
//               />
//             </div>
//             {state.photoAvailable ? (
//               <div className="col-sm-6">
//                 <CFormLabel htmlFor="photo_url"><b>Upload Photo</b></CFormLabel>
//                 <CFormInput
//                   type="file"
//                   id="photo_url"
//                   name="photo_url"
//                   accept="image/png, image/jpeg, image/jpg, application/pdf"
//                   onChange={handleChange}
//                 />
//               </div>
//             ) : (
//               <div className="col-sm-6">
//                 <CFormLabel htmlFor="photo_remark"><b>Photo Remark</b></CFormLabel>
//                 <CFormInput
//                   type="text"
//                   id="photo_remark"
//                   name="photo_remark"
//                   placeholder="Enter remark"
//                   value={state.photo_remark}
//                   onChange={handleChange}
//                 />
//               </div>
//             )}
//           </div>
//         </CForm>
//       </CModalBody>
//       <CModalFooter>
//         <CButton color="secondary" onClick={handleClose} disabled={loading}>
//           {t("LABELS.cancel")}
//         </CButton>
//         <CButton color="primary" onClick={handleSubmit} disabled={loading}>
//           {loading ? t("LABELS.updating") || "Updating..." : t("LABELS.update_expense")}
//         </CButton>
//       </CModalFooter>
//     </CModal>
//   );
// };

// export default EditExpense;