
import React, { useEffect, useRef, useState } from 'react';
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CFormCheck,
} from '@coreui/react';
import { getAPICall, post, postFormData } from '../../../util/api';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../common/toast/ToastContext';
import { useTranslation } from 'react-i18next';
import Select from "react-select";
import i18n from 'i18next';
import { paymentTypes, receiver_bank } from '../../../util/Feilds';
import { cilSearch, cilX } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import ProjectSelectionModal from '../../common/ProjectSelectionModal'; // adjust path as needed

const NewExpense = () => {
  const inputRefs = useRef({});
  const [validated, setValidated] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [expenseTypes, setExpenseTypes] = useState([]);
  const [expensesList, setExpensesList] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [customerSuggestions, setCustomerSuggestions] = useState([]);
  const [customerName, setCustomerName] = useState({ name: '', id: null });
  // console.log(customerName);

  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useTranslation("global");
  const [state, setState] = useState({
    project_id: '', // ✅ Changed from customer_id to project_id
    name: '',
    desc: '',
    expense_id: undefined,
    typeNotSet: true,
    qty: 1,
    price: 0,
    total_price: 0,
    expense_date: new Date().toISOString().split('T')[0],
    contact: '',
    payment_by: '',
    payment_type: '',
    pending_amount: '',
    show: true,
    isGst: false,

    photoAvailable: true,
    photo_url: null,
    photo_remark: '',

    // New Fields in form 
    bank_name: '',
    acc_number: '',
    ifsc: '',
    aadhar: '',
    pan: '',
    transaction_id: '',

     gst: 18,
  sgst: 9,
  cgst: 9,
  igst: 0,
  gstAmount: 0,
  sgstAmount: 0,
  cgstAmount: 0,
  igstAmount: 0,
  baseAmount: 0,

  });

  const getCurrentLanguage = () => {
    const storedLang = localStorage.getItem('i18nextLng');
    const i18nLang = i18n.language;
    const finalLang = storedLang || i18nLang || 'en';
    return finalLang;
  };

  const getDisplayName = (item, lng = null) => {
    const currentLang = lng || getCurrentLanguage();
    return currentLang === 'mr' ? (item.localName || item.name) : item.name;
  };

  const fetchExpenseTypes = async () => {
    try {
      const response = await getAPICall('/api/expenseType');
      setExpenseTypes(response.filter((p) => p.show === 1));
    } catch (error) {
      showToast('danger', 'Error occurred ' + error);
    }
  };

  useEffect(() => {
    fetchExpenseTypes();
  }, []);

  useEffect(() => {
    fetchExpenseTypes();
  }, [i18n.language]);








// Compute tax amounts contained inside total_price (total includes GST)
const computeTaxesFromTotal = (updated) => {
  const total = parseFloat(updated.total_price) || 0;
  const gstPct = parseFloat(updated.gst) || 0;
  const cgstPct = parseFloat(updated.cgst) || 0;
  const sgstPct = parseFloat(updated.sgst) || 0;
  const igstPct = parseFloat(updated.igst) || 0;

  if (gstPct <= 0 || total <= 0) {
    updated.baseAmount = Number(total.toFixed(2));
    updated.gstAmount = updated.cgstAmount = updated.sgstAmount = updated.igstAmount = 0;
    return updated;
  }

  // base = total / (1 + gst/100)
  const base = total / (1 + gstPct / 100);

  const cgstAmount = base * (cgstPct / 100);
  const sgstAmount = base * (sgstPct / 100);
  const igstAmount = base * (igstPct / 100);

  // round to 2 decimals
  updated.baseAmount = Number(base.toFixed(2));
  updated.cgstAmount = Number(cgstAmount.toFixed(2));
  updated.sgstAmount = Number(sgstAmount.toFixed(2));
  updated.igstAmount = Number(igstAmount.toFixed(2));
  updated.gstAmount = Number((updated.cgstAmount + updated.sgstAmount + updated.igstAmount).toFixed(2));

  // DO NOT change updated.total_price here — it stays as-is
  return updated;
};

// Keep calculateFinalAmount but DO NOT add GST on top — compute taxes from total (if isGst)
const calculateFinalAmount = (item) => {
  const qtyNum = parseFloat(item.qty) || 0;
  const priceNum = parseFloat(item.price) || 0;
  const total = Number((qtyNum * priceNum).toFixed(2));
  item.total_price = total;

  if (item.isGst) {
    computeTaxesFromTotal(item);
  } else {
    item.baseAmount = total;
    item.gstAmount = item.cgstAmount = item.sgstAmount = item.igstAmount = 0;
  }
};









  // const calculateFinalAmount = (item) => {
  //   const qtyNum = parseFloat(item.qty) || 0;
  //   const priceNum = parseFloat(item.price) || 0;
  //   item.total_price = Math.round(qtyNum * priceNum);
  // };

  

  // const handleChange = (e) => {
  //   const { name, value, type, checked, files } = e.target;

  //   setState((prev) => {
  //     const updated = { ...prev };



  //     if (type === "checkbox" && name === "isGst") {
  //       // ✅ Only store boolean, no calculation
  //       updated.isGst = checked;
             
  //     return calculateGST(updated);
  //       // return updated;
  //     }


  //     if (["price", "qty", "gst", "cgst", "sgst", "igst"].includes(name)) {
  //     updated[name] = value;
  //     // Auto split total GST equally if total gst changed
  //     if (name === "gst") {
  //       updated.cgst = value / 2;
  //       updated.sgst = value / 2;
  //     }
  //     return calculateGST(updated);
  //   }




  //     if (name === "price" || name === "qty") {
  //       updated[name] = value;
  //       // ✅ Recalculate total WITHOUT GST
  //       calculateFinalAmount(updated);
  //       return updated;
  //     }

  //     if (name === "expense_id") {
  //       updated.expense_id = value;
  //       updated.typeNotSet = !value;
  //       return updated;
  //     }

  //     if (name === "name") {
  //       const regex = /^[a-zA-Z0-9\u0900-\u097F ]*$/;
  //       if (regex.test(value)) updated.name = value;
  //       return updated;
  //     }


  //     if (name === "photoAvailable") {
  //       updated.photoAvailable = checked;
  //       if (checked) {
  //         updated.photo_remark = ""; // clear remark if photo ON
  //       } else {
  //         updated.photo_url = null; // clear file if photo OFF
  //       }
  //       return updated;
  //     }

  //     if (type === "file" && name === "photo_url") {
  //       updated.photo_url = files[0] || null;
  //       return updated;
  //     }

  //     updated[name] = type === "checkbox" ? checked : value;
  //     return updated;


  //     updated[name] = value;
  //     return updated;
  //   });
  // };

const handleChange = (e) => {
  const { name, value, type, checked, files } = e.target;

  setState((prev) => {
    let updated = { ...prev };

    // file input
    if (type === "file" && name === "photo_url") {
      updated.photo_url = files[0] || null;
      return updated;
    }

    // checkbox - isGst
    if (type === "checkbox" && name === "isGst") {
      updated.isGst = checked;
      // If turning ON GST, compute taxes from current total_price
      if (checked) {
        computeTaxesFromTotal(updated);
      } else {
        // turning off GST: clear tax fields
        updated.baseAmount = Number((updated.total_price || 0).toFixed(2));
        updated.gstAmount = updated.cgstAmount = updated.sgstAmount = updated.igstAmount = 0;
      }
      return updated;
    }

    // price or qty -> recalc total_price, then recompute taxes (if GST on)
    if (name === "price" || name === "qty") {
      updated[name] = value === '' ? '' : value;
      // recalc total_price (two decimals)
      const qtyNum = parseFloat(name === "qty" ? (value || 0) : (updated.qty || 0)) || 0;
      const priceNum = parseFloat(name === "price" ? (value || 0) : (updated.price || 0)) || 0;
      updated.total_price = Number((qtyNum * priceNum).toFixed(2));
      if (updated.isGst) computeTaxesFromTotal(updated);
      return updated;
    }

    // If total_price is edited directly (if you allow manual edit), update and recalc taxes
    if (name === "total_price") {
      updated.total_price = Number(value || 0);
      if (updated.isGst) computeTaxesFromTotal(updated);
      return updated;
    }

    // GST percentage changed -> auto split cgst/sgst and recompute
    if (name === "gst") {
      updated.gst = Number(value || 0);
      // split cgst/sgst equally, keep igst as-is
      const half = (Number(value) || 0) / 2;
      updated.cgst = Number(half.toFixed(2));
      updated.sgst = Number(half.toFixed(2));
      if (updated.isGst) computeTaxesFromTotal(updated);
      return updated;
    }

    // When cgst/sgst/igst changed individually -> update total gst sum and recompute
    if (["cgst", "sgst", "igst"].includes(name)) {
      updated[name] = Number(value || 0);
      // update total GST to be the sum of parts
      updated.gst = Number(((Number(updated.cgst) || 0) + (Number(updated.sgst) || 0) + (Number(updated.igst) || 0)).toFixed(2));
      if (updated.isGst) computeTaxesFromTotal(updated);
      return updated;
    }

    // default case (other form fields)
    updated[name] = type === "checkbox" ? checked : value;
    return updated;
  });
};




  const searchProject = async (value) => {
    if (value.length > 0) {
      try {
        const projects = await getAPICall(`/api/projects?searchQuery=${value}`);
        if (projects?.length) {
          setCustomerSuggestions(projects);
        } else {
          setCustomerSuggestions([]);
        }
      } catch (error) {
        showToast('danger', 'Error fetching projects: ' + error);
      }
    } else {
      setCustomerSuggestions([]);
    }
  };

  const handleCustomerNameChange = (e) => {
    const value = e.target.value;
    setCustomerName({ name: value, id: null });
    searchProject(value);
  };

  const handleCustomerSelect = (project) => {
    setCustomerName({ name: project.project_name, id: project.id });
    setState((prev) => ({ ...prev, project_id: project.id })); // ✅ Changed from customer_id to project_id
    setCustomerSuggestions([]);
  };

  const addToExpensesList = () => {
    if (state.expense_id && state.price > 0 && state.qty > 0 && state.project_id) { // ✅ Changed from customer_id to project_id
      const expenseType = expenseTypes.find(type => type.id === parseInt(state.expense_id));
      const currentLang = getCurrentLanguage();

      const newExpense = {
        ...state,
        expense_type_name: expenseType ? getDisplayName(expenseType, currentLang) : 'Unknown',
        customer_name: customerName.name,
        id: Date.now()
      };

      if (editingExpense) {
        const updatedList = expensesList.map(expense =>
          expense.id === editingExpense.id ? { ...newExpense, id: editingExpense.id } : expense
        );
        setExpensesList(updatedList);
        showToast('success', t("MSG.expense_updated_successfully"));
        setEditingExpense(null);
      } else {
        setExpensesList([...expensesList, newExpense]);
        showToast('success', t("MSG.expense_added_to_list"));
      }

      handleClear();
    } else {
      setState((old) => ({ ...old, typeNotSet: old.expense_id === undefined }));
      showToast('danger', t("MSG.fill_required_fields"));
    }
  };

  const editExpenseFromList = (expense) => {
    setState({
      project_id: expense.project_id, // ✅ Changed from customer_id to project_id
      name: expense.name,
      desc: expense.desc || '',
      expense_id: expense.expense_id,
      typeNotSet: false,
      qty: expense.qty,
      price: expense.price,
      total_price: expense.total_price,
      expense_date: expense.expense_date,
      contact: expense.contact,
      payment_by: expense.payment_by,
      payment_type: expense.payment_type,
      pending_amount: expense.pending_amount,
      show: expense.show,
      isGst: expense.isGst,
    });
    setCustomerName({ name: expense.customer_name, id: expense.project_id }); // ✅ Changed from customer_id to project_id
    setEditingExpense(expense);
    setValidated(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('info', t("MSG.expense_loaded_for_editing"));
  };

  const cancelEdit = () => {
    setEditingExpense(null);
    handleClear();
    showToast('info', t("MSG.edit_cancelled"));
  };

  const removeFromExpensesList = (id) => {
    const updatedList = expensesList.filter((expense) => expense.id !== id);
    setExpensesList(updatedList);
    if (editingExpense && editingExpense.id === id) {
      setEditingExpense(null);
      handleClear();
    }
    showToast('info', t("MSG.expense_removed_from_list"));
  };




  const handleSubmit = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    setValidated(true);

    // ✅ Validate contact number (must be exactly 10 digits)
    if (state.contact && !/^\d{10}$/.test(state.contact)) {
      showToast("danger", "Contact number must be exactly 10 digits.");
      return;
    }

    if (!state.payment_type) { // Added payment_type validation
      showToast("danger", "Please select payment type");
      return;
    }


    // ✅ Only validate if photoAvailable is ON
    if (state.photoAvailable) {
      if (!(state.photo_url instanceof File)) {
        showToast("danger", "Please upload a photo since 'Photo Available' is checked.");
        return;
      }
    }


    const formData = new FormData();

    // Add normal fields
    formData.append("project_id", state.project_id);
    formData.append("name", state.name);
    formData.append("desc", state.desc || "");
    formData.append("expense_id", state.expense_id);
    formData.append("typeNotSet", state.typeNotSet ? 1 : 0);
    formData.append("qty", state.qty);
    formData.append("price", state.price);
    formData.append("total_price", state.total_price);
    formData.append("expense_date", state.expense_date);
    formData.append("contact", state.contact);
    formData.append("payment_by", state.payment_by);
    formData.append("payment_type", state.payment_type);
    formData.append("pending_amount", state.pending_amount);
    formData.append("show", state.show ? 1 : 0);
    formData.append("isGst", state.isGst ? 1 : 0);
    formData.append("photoAvailable", state.photoAvailable ? 1 : 0);
    formData.append("photo_remark", state.photo_remark || ""); // optional always

    // New Fields
    formData.append("bank_name", state.bank_name || "");
    formData.append("acc_number", state.acc_number || "");
    formData.append("ifsc", state.ifsc || "");
    formData.append("transaction_id", state.transaction_id || "");

    formData.append("gst", state.gstAmount || "");
    formData.append("sgst", state.sgstAmount || "");
    formData.append("cgst", state.cgstAmount || "");
    formData.append("igst", state.igstAmount || "");


    // ✅ Add file only if selected
    if (state.photo_url instanceof File) {
      formData.append("photo_url", state.photo_url);
    }

    if (state.expense_id && state.price > 0 && state.qty > 0 && state.project_id) {
      try {
        const resp = await postFormData("/api/expense", formData);
        if (resp) {
          showToast("success", t("MSG.new_expense_added_successfully_msg"));
        } else {
          showToast("danger", t("MSG.error_occured_please_try_again_later_msg"));
        }
        handleClear();
      } catch (error) {
        showToast("danger", "Error occurred " + error);
      }
    } else {
      setState((old) => ({ ...old, typeNotSet: old.expense_id === undefined }));
    }
  };


  const roundToTwoDecimals = (value) => {
    return Number((Math.round(value * 100) / 100).toFixed(2));
  };

  const submitAllExpenses = async () => {
    if (expensesList.length === 0) {
      showToast('warning', t("MSG.add_atleast_one_expense"));
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmSubmitAllExpenses = async () => {
    try {
      const promises = expensesList.map(expense => {
        const { id, expense_type_name, customer_name, ...expenseData } = expense;
        return post('/api/expense', expenseData);
      });

      const results = await Promise.all(promises);
      const successCount = results.filter(result => result).length;

      if (successCount === expensesList.length) {
        const successMsg = t("MSG.expenses_submitted_successfully", { count: successCount })
          || `${successCount} expenses submitted successfully`;
        showToast('success', successMsg);
        setExpensesList([]);
        setEditingExpense(null);
      } else {
        const warningMsg = t("MSG.partial_expenses_submitted", { successCount, totalCount: expensesList.length })
          || `${successCount} out of ${expensesList.length} expenses submitted`;
        showToast('warning', warningMsg);
      }
    } catch (error) {
      const errorMsg = t("MSG.error_occurred") || "Error occurred";
      showToast('danger', `${errorMsg}: ${error}`);
    }

    setShowConfirmModal(false);
  };

  const getTotalAmount = () => {
    const total = expensesList.reduce((sum, item) => {
      const qty = parseFloat(item.qty) || 0;
      const price = parseFloat(item.price) || 0;
      return sum + qty * price;
    }, 0);

    return Number(total.toFixed(2));
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount).toFixed(2)}`;
  };

  const today = new Date().toISOString().split('T')[0];

  const handleClear = async () => {
    setState({
      project_id: '', // ✅ Changed from customer_id to project_id
      name: '',
      desc: '',
      expense_id: '',
      qty: '',
      price: 0,
      total_price: 0,
      expense_date: today,
      contact: '',
      payment_by: '',
      payment_type: '',
      pending_amount: '',
      show: true,
      typeNotSet: false,
      isGst: false,
      photo_remark: '',

      // New Fields
      bank_name: '',
      acc_number: '',
      ifsc: '',
      transaction_id: '',

    });
    setCustomerName({ name: '', id: null });
    setCustomerSuggestions([]);
    setValidated(false);
  };

  const lng = getCurrentLanguage();


  // Prepare options for react-select
  const options = expenseTypes.map(type => ({
    value: type.id,
    label: getDisplayName(type, lng),
  }));

  // Handle selection
  // const handleChange = (selectedOption) => {
  //   setState(prev => ({
  //     ...prev,
  //     expense_id: selectedOption ? selectedOption.value : "",
  //   }));
  // };

  return (
    <>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <div className="d-flex justify-content-between align-items-center">
                <strong>
                  {editingExpense ? t("LABELS.edit_expense") : t("LABELS.new_expense")}
                  {editingExpense && (
                    <span className="ms-2 badge bg-warning text-dark">
                      {t("LABELS.editing_mode")}
                    </span>
                  )}
                </strong>
                <CButton
                  color="danger"
                  size="sm"
                  onClick={() => window.location.href = "/#/expense/new-type"}
                >
                  {t("LABELS.new_expense_type")}
                </CButton>
              </div>
            </CCardHeader>
            <CCardBody>
              <CForm noValidate validated={validated} onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-sm-3" style={{ position: 'relative' }}>
  <CFormLabel htmlFor="project_id">
    <b>{t("LABELS.project_name")}</b>
  </CFormLabel>

  <div style={{ position: 'relative' }}>
    <CFormInput
      type="text"
      id="project_id"
      placeholder={t("LABELS.enter_project_name")}
      name="customerName"
      value={customerName.name}
      onChange={handleCustomerNameChange}
      autoComplete="off"
      required
      feedbackInvalid={t("MSG.customer_name_validation")}
      style={{ paddingRight: '40px' }}
    />

    {/* 🔁 Toggle between Search and Clear (X) button */}
    {!customerName.name ? (
      <CButton
        color="primary"
        variant="outline"
        onClick={() => setShowProjectModal(true)}
        style={{
          position: 'absolute',
          right: '0',
          top: '0',
          bottom: '0',
          zIndex: 5,
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
        }}
      >
        <CIcon icon={cilSearch} />
      </CButton>
    ) : (
      <CButton
        color="danger"
        variant="outline"
        onClick={() => {
          // clear selected project
          setCustomerName({ name: '' })
          setCustomerSuggestions([])
        }}
        style={{
          position: 'absolute',
          right: '0',
          top: '0',
          bottom: '0',
          zIndex: 5,
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
        }}
      >
        <CIcon icon={cilX} />
      </CButton>
    )}
  </div>

  {/* 🔍 Suggestions list */}
  {customerSuggestions.length > 0 && (
    <ul
      className="suggestions-list"
      style={{
        position: 'absolute',
        zIndex: 1000,
        background: 'white',
        border: '1px solid #ccc',
        listStyle: 'none',
        padding: 0,
        maxHeight: '200px',
        overflowY: 'auto',
        width: '100%',
      }}
    >
      {customerSuggestions.map((project) => (
        <li
          key={project.id}
          onClick={() => handleCustomerSelect(project)}
          style={{
            padding: '8px',
            cursor: 'pointer',
            borderBottom: '1px solid #eee',
          }}
          onMouseEnter={(e) => (e.target.style.background = '#f5f5f5')}
          onMouseLeave={(e) => (e.target.style.background = 'white')}
        >
          {project?.project_name}
        </li>
      ))}
    </ul>
  )}
</div>

                  <div className="col-sm-3">
                    <div className="">
                      <CFormLabel htmlFor="expense_id"><b>{t("LABELS.expense_type")}</b></CFormLabel>
                      {/* <CFormSelect
                        aria-label={t("MSG.select_expense_type_msg")}
                        value={state.expense_id}
                        id="expense_id"
                        name="expense_id"
                        onChange={handleChange}
                        required
                        feedbackInvalid={t("MSG.select_expense_type_validation")}
                      >
                        <option value="">{t("MSG.select_expense_type_msg")}</option>
                        {expenseTypes.map((type) => {
                          const displayName = getDisplayName(type, lng);
                          return (
                            <option key={type.id} value={type.id}>
                              {displayName}
                            </option>
                          );
                        })}
                      </CFormSelect> */}
                      <Select
                        id="expense_id"
                        name="expense_id"
                        value={
                          options.find(opt => String(opt.value) === String(state.expense_id)) || null
                        }
                        onChange={(selectedOption) =>
                          setState(prev => ({
                            ...prev,
                            expense_id: selectedOption ? selectedOption.value : ""
                          }))
                        }
                        options={options}
                        placeholder={t("MSG.select_expense_type_msg")}
                        isClearable
                        isSearchable
                        styles={{
                          control: (base) => ({
                            ...base,
                            borderRadius: "0.5rem",
                            borderColor: "#ced4da",
                            minHeight: "38px",
                          }),
                        }}
                      />

                    </div>
                  </div>
                  <div className="col-sm-3">
                    <div className="mb-3">
                      <CFormLabel htmlFor="name"><b>{t("LABELS.about_expense")}</b></CFormLabel>
                      <CFormInput
                        type="text"
                        id="name"
                        placeholder={t("LABELS.enter_expense_description")}
                        name="name"
                        value={state.name}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="col-sm-3">
                    <div className="mb-3">
                      <CFormLabel htmlFor="expense_date"><b>{t("LABELS.expense_date")}</b></CFormLabel>
                      <CFormInput
                        type="date"
                        id="expense_date"
                        name="expense_date"
                        max={today}
                        value={state.expense_date}
                        onChange={handleChange}
                        required
                        feedbackInvalid={t("MSG.select_date_validation")}
                      />
                    </div>
                  </div>
                </div>

                <div className="row align-items-end">
                  <div className="col-sm-3">
                    <div className="mb-3">
                      <CFormLabel htmlFor="price">
                        <b>{t("LABELS.price_per_unit")}</b>
                      </CFormLabel>
                      <CFormInput
                        type="number"
                        min="0"
                        id="price"
                        onWheel={(e) => e.target.blur()}
                        placeholder="0.00"
                        step="0.01"
                        name="price"
                        onFocus={() => setState(prev => ({ ...prev, price: '' }))}
                        value={state.price}
                        onChange={handleChange}
                        required
                        feedbackInvalid={t("MSG.price_validation")}
                      />
                    </div>
                  </div>

                  <div className="col-sm-3">
                    <div className="mb-3">
                      <CFormLabel htmlFor="qty">
                        <b>{t("LABELS.total_units")}</b>
                      </CFormLabel>
                      <CFormInput
                        type="number"
                        id="qty"
                        step="0.01"
                        min="0"
                        placeholder=" "
                        name="qty"
                        value={state.qty}
                        onWheel={(e) => e.target.blur()}
                        onKeyDown={(e) => {
                          if (['e', '+', '-', ','].includes(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        onChange={(e) => {
                          const value = e.target.value
                          if (value === '' || /^\d+(\.\d{0,2})?$/.test(value)) {
                            handleChange(e)
                          }
                        }}
                        required
                        feedbackInvalid={t("MSG.quantity_validation")}
                      />
                    </div>
                  </div>

                  <div className="col-sm-3">
                    <div className="mb-3">
                      <CFormCheck
                        id="isGst"
                        name="isGst"
                        label="Is GST Bill"
                        checked={state.isGst}
                        onChange={handleChange}
                      />
                      {state.isGst && (
                        <small className="text-muted d-block ms-4">
                         
                        </small>
                      )}
                    </div>
                  </div>

                  <div className="col-sm-3">
                    <div className="mb-3">
                      <CFormLabel htmlFor="total_price">
                        <b>{t("LABELS.total_price")}</b>
                      </CFormLabel>
                      <CFormInput
                        type="number"
                        min="0"
                        onWheel={(e) => e.target.blur()}
                        id="total_price"
                        placeholder=""
                        name="total_price"
                        value={state.total_price}
                        onChange={handleChange}
                        readOnly
                      />
                    </div>
                  </div>
                </div>



              {/* GST calculation  */}

{ /* GST calculation block — show only when isGst is true */ }
{state.isGst && (
  <div className="row mt-3 p-3 border rounded bg-light mb-3">
    <div className="col-sm-3">
      <CFormLabel><b>Total GST (%)</b></CFormLabel>
      <div className="d-flex align-items-center">
        <CFormInput
          type="number"
          name="gst"
          value={state.gst}
          onChange={handleChange}
          min="0"
          step="0.01"
        />
        <span className="ms-2">%</span>
      </div>
      <small className="text-muted">GST Amount: ₹{state.gstAmount?.toFixed(2) || '0.00'}</small>
    </div>

    <div className="col-sm-3">
      <CFormLabel><b>SGST (%)</b></CFormLabel>
      <div className="d-flex align-items-center">
        <CFormInput
          type="number"
          name="sgst"
          value={state.sgst}
          onChange={handleChange}
          min="0"
          step="0.01"
        />
        <span className="ms-2">%</span>
      </div>
      <small className="text-muted">SGST Amount: ₹{state.sgstAmount?.toFixed(2) || '0.00'}</small>
    </div>

    <div className="col-sm-3">
      <CFormLabel><b>CGST (%)</b></CFormLabel>
      <div className="d-flex align-items-center">
        <CFormInput
          type="number"
          name="cgst"
          value={state.cgst}
          onChange={handleChange}
          min="0"
          step="0.01"
        />
        <span className="ms-2">%</span>
      </div>
      <small className="text-muted">CGST Amount: ₹{state.cgstAmount?.toFixed(2) || '0.00'}</small>
    </div>

    <div className="col-sm-3">
      <CFormLabel><b>IGST (%)</b></CFormLabel>
      <div className="d-flex align-items-center">
        <CFormInput
          type="number"
          name="igst"
          value={state.igst}
          onChange={handleChange}
          min="0"
          step="0.01"
        />
        <span className="ms-2">%</span>
      </div>
      <small className="text-muted">IGST Amount: ₹{state.igstAmount?.toFixed(2) || '0.00'}</small>
    </div>

    <div className="col-12 mt-2">
      <div className="p-2 bg-info-subtle rounded">
        <strong>Note:</strong> Total price remains unchanged. The values above show how much GST/CGST/SGST/IGST are included inside the current total price.
      </div>
    </div>
  </div>
)}







                <div className="row">
                  <div className="col-sm-3">
                    <div className="mb-3">
                      <CFormLabel htmlFor="contact">
                        <b>{t("LABELS.contact")}</b>
                      </CFormLabel>
                      <CFormInput
                        type="text"
                        id="contact"
                        placeholder={t("LABELS.enter_contact")}
                        name="contact"
                        value={state.contact}
                        onChange={(e) => {
                          const value = e.target.value;

                          // Allow only numbers and restrict to 10 digits
                          if (/^\d{0,10}$/.test(value)) {
                            handleChange(e);
                          }
                        }}
                        maxLength={10} // ensures no more than 10 characters
                        inputMode="numeric" // mobile keyboard will show numbers only
                      />
                    </div>
                  </div>


                  {/* <div className="col-sm-3">
                    <div className="mb-3">
                      <CFormLabel htmlFor="payment_by"><b>{t("LABELS.payment_by")}</b></CFormLabel>
                      <CFormInput
                        type="text"
                        id="payment_by"
                        placeholder={t("LABELS.enter_payment_by")}
                        name="payment_by"
                        value={state.payment_by}
                        onChange={handleChange}
                      />
                    </div>
                  </div> */}
                  <div className="col-sm-3">
                    <div className="mb-3">
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
                        {/* <option value="Mangesh Shitole">Mangesh Shitole</option>
                        <option value="Krishna Shitole">Krishna Shitole</option>
                        <option value="Deshmukh infra LLP">Deshmukh infra LLP</option> */}
                          {receiver_bank.map((bank) => (
                                            <option key={bank.value} value={bank.value}>{bank.label}</option>
                                          ))}
                      </CFormSelect>
                    </div>
                  </div>

                  <div className="col-sm-3">
                    <div className="mb-3">
                      <CFormLabel htmlFor="payment_type"><b>{t("LABELS.payment_type")}</b></CFormLabel>
                      <CFormSelect
                        id="payment_type"
                        name="payment_type"
                        value={state.payment_type || ""}
                        onChange={handleChange}
                        required
                        feedbackInvalid="Please select a payment type"
                      >
                        <option value="">Select Payment Type</option>
                        {/* <option value="cash">Cash</option>
                        <option value="upi">UPI</option>
                        <option value="IMPS/NEFT/RTGS">IMPS/NEFT/RTGS</option> */}
                        {paymentTypes.map((type) => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                       ))}
                      </CFormSelect>
                    </div>
                  </div>

                  <div className="col-sm-3">
                    <div className="mb-3">
                      <CFormLabel htmlFor="pending_amount"><b>{t("LABELS.pending_amount")}</b></CFormLabel>
                      <CFormInput
                        type="number"
                        id="pending_amount"
                        placeholder={t("LABELS.enter_pending_amount")}
                        name="pending_amount"
                        value={state.pending_amount}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>




                {/* New Fields - Conditionally Rendered */}
                {(state.payment_type === "imps"  ||
 state.payment_type === "rtgs" ||
 state.payment_type === "NEFT") && (
                  <div className="row">
                    {/* Bank Name */}
                    <div className="col-sm-3">
                      <div className="mb-3">
                        <CFormLabel htmlFor="bank_name">
                          <b>{t("LABELS.bank_name")}</b>
                        </CFormLabel>
                        <CFormInput
                          type="text"
                          id="bank_name"
                          placeholder={t("LABELS.enter_bank_name")}
                          name="bank_name"
                          value={state.bank_name}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    {/* Account Number */}
                    <div className="col-sm-3">
                      <div className="mb-3">
                        <CFormLabel htmlFor="acc_number">
                          <b>{t("LABELS.acc_number")}</b>
                        </CFormLabel>
                        <CFormInput
                          type="text"
                          id="acc_number"
                          placeholder={t("LABELS.enter_acc_number")}
                          name="acc_number"
                          value={state.acc_number}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    {/* IFSC */}
                    <div className="col-sm-3">
                      <div className="mb-3">
                        <CFormLabel htmlFor="ifsc">
                          <b>{t("LABELS.ifsc")}</b>
                        </CFormLabel>
                        <CFormInput
                          type="text"
                          id="ifsc"
                          placeholder={t("LABELS.enter_ifsc")}
                          name="ifsc"
                          value={state.ifsc}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    {/* Transaction Id */}
                    <div className="col-sm-3">
                      <div className="mb-3">
                        <CFormLabel htmlFor="transaction_id">
                          <b>{t("LABELS.transaction_id")}</b>
                        </CFormLabel>
                        <CFormInput
                          type="text"
                          id="transaction_id"
                          placeholder={t("LABELS.enter_transaction_id")}
                          name="transaction_id"
                          value={state.transaction_id}
                          onChange={handleChange}
                        />
                      </div>
                    </div>


                  </div>
                )}

                {/* Transaction Id */}
                {(state.payment_type === "upi") && (
                  <div className="col-sm-3">
                    <div className="mb-3">
                      <CFormLabel htmlFor="transaction_id">
                        <b>{t("LABELS.transaction_id")}</b>
                      </CFormLabel>
                      <CFormInput
                        type="text"
                        id="transaction_id"
                        placeholder={t("LABELS.enter_transaction_id")}
                        name="transaction_id"
                        value={state.transaction_id}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                )}








                <div className="row mt-3">
                  <div className="col-sm-3">
                    <CFormCheck
                      id="photoAvailable"
                      name="photoAvailable"
                      label="Photo Available"
                      checked={state.photoAvailable}
                      onChange={handleChange}
                    />
                  </div>

                  {state.photoAvailable ? (
                    <div className="col-sm-6">
                      <CFormLabel htmlFor="photo_url"><b>Upload Photo</b></CFormLabel>
                      <CFormInput
                        type="file"
                        id="photo_url"
                        name="photo_url"
                        // accept="image/*"
                        accept="image/png, image/jpeg, image/jpg, application/pdf"
                        onChange={handleChange}
                      />
                    </div>
                  ) : (
                    <div className="col-sm-6">
                      <CFormLabel htmlFor="photo_remark"><b>Photo Remark</b></CFormLabel>
                      <CFormInput
                        type="text"
                        id="photo_remark"
                        name="photo_remark"
                        placeholder="Enter remark"
                        value={state.photo_remark}
                        onChange={handleChange}
                      />
                    </div>
                  )}
                </div>










                <div className="mb-3 mt-3">
                  <CButton color="success" type="submit">
                    {t("LABELS.submit")}
                  </CButton>
                  &nbsp;
                  <CButton color="primary" type="button" onClick={addToExpensesList}>
                    {editingExpense ? t("LABELS.update_in_list") : t("LABELS.add_to_list")}
                  </CButton>
                  &nbsp;
                  {editingExpense && (
                    <>
                      <CButton color="warning" type="button" onClick={cancelEdit}>
                        {t("LABELS.cancel_edit")}
                      </CButton>
                      &nbsp;
                    </>
                  )}
                  <CButton color="secondary" onClick={handleClear}>
                    {t("LABELS.clear")}
                  </CButton>
                </div>
              </CForm>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {expensesList.length > 0 && (
        <CRow>
          <CCol xs={12}>
            <CCard className="mb-4">
              <CCardHeader>
                <div className="d-flex justify-content-between align-items-center">
                  <strong>{t("LABELS.expenses_list")} ({expensesList.length})</strong>
                  <span>{t("LABELS.total_amount")}: <strong>{formatCurrency(getTotalAmount())}</strong></span>
                </div>
              </CCardHeader>
              <CCardBody>
                <div className="table-responsive">
                  <CTable striped hover>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>{t("LABELS.customer_name")}</CTableHeaderCell>
                        <CTableHeaderCell>{t("LABELS.expense_type")}</CTableHeaderCell>
                        <CTableHeaderCell>{t("LABELS.description")}</CTableHeaderCell>
                        <CTableHeaderCell>{t("LABELS.date")}</CTableHeaderCell>
                        <CTableHeaderCell>{t("LABELS.price")}</CTableHeaderCell>
                        <CTableHeaderCell>{t("LABELS.quantity")}</CTableHeaderCell>
                        <CTableHeaderCell>{t("LABELS.total")}</CTableHeaderCell>
                        <CTableHeaderCell>{t("LABELS.actions")}</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {expensesList.map((expense) => (
                        <CTableRow
                          key={expense.id}
                          className={editingExpense && editingExpense.id === expense.id ? 'table-warning' : ''}
                        >
                          <CTableDataCell>{expense.customer_name}</CTableDataCell>
                          <CTableDataCell>{expense.expense_type_name}</CTableDataCell>
                          <CTableDataCell>{expense.name || '-'}</CTableDataCell>
                          <CTableDataCell>{expense.expense_date}</CTableDataCell>
                          <CTableDataCell>{formatCurrency(expense.price)}</CTableDataCell>
                          <CTableDataCell>{expense.qty}</CTableDataCell>
                          <CTableDataCell>{formatCurrency(expense.total_price)}</CTableDataCell>
                          <CTableDataCell>
                            <CButton
                              color="info"
                              size="sm"
                              onClick={() => editExpenseFromList(expense)}
                              className="me-1"
                              disabled={editingExpense && editingExpense.id === expense.id}
                            >
                              {editingExpense && editingExpense.id === expense.id
                                ? t("LABELS.editing")
                                : t("LABELS.edit")
                              }
                            </CButton>
                            <CButton
                              color="danger"
                              size="sm"
                              onClick={() => removeFromExpensesList(expense.id)}
                            >
                              {t("LABELS.remove")}
                            </CButton>
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                </div>
                <div className="mt-3">
                  <CButton
                    color="success"
                    size="lg"
                    onClick={submitAllExpenses}
                    disabled={editingExpense !== null}
                  >
                    {t("LABELS.submit_all_expenses")} ({expensesList.length})
                  </CButton>
                  {editingExpense && (
                    <div className="mt-2">
                      <small className="text-warning">
                        <i className="fas fa-exclamation-triangle me-1"></i>
                        {t("MSG.complete_edit_before_submit")}
                      </small>
                    </div>
                  )}
                </div>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      )}

      <CModal visible={showConfirmModal} onClose={() => setShowConfirmModal(false)}>
        <CModalHeader>
          <CModalTitle>{t("LABELS.confirm_submission")}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p>{t("MSG.confirm_submit_expenses", { count: expensesList.length })}</p>
          <p><strong>{t("LABELS.total_amount")}: {formatCurrency(getTotalAmount().toFixed(2))}</strong></p>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowConfirmModal(false)}>
            {t("LABELS.cancel")}
          </CButton>
          <CButton color="primary" onClick={confirmSubmitAllExpenses}>
            {t("LABELS.confirm_submit")}
          </CButton>
        </CModalFooter>
      </CModal>

       <ProjectSelectionModal
        visible={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        onSelectProject={handleCustomerSelect}
      />
    </>
  );
};

export default NewExpense;