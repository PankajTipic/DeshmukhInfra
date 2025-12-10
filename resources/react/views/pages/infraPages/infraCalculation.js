// import React, { useState, useEffect } from "react";
// import {
//   CForm, CRow, CCol, CFormInput, CButton,
//   CTable,
//   CTableHead,
//   CTableRow,
//   CTableHeaderCell,
//   CTableBody,
//   CTableDataCell,
// } from "@coreui/react";
// import axios from "axios";

// const DrillingForm = () => {
//   const [form, setForm] = useState({
//     date: "",
//     site: "",
//     operator_helper: "",
//     machine_start: "",
//     machine_end: "",
//     actual_hour_machine: "",
//     rpm_start: "",
//     rpm_end: "",
//     actual_hours_rpm: "",
//     drilling_point: "",
//     pilling_point: "",
//     rate: "",
//     total_bill: "",
//     dth_survey_point: "",
//     survey_rate: "",
//     survey_total_bill: "",
//     surveyor_local_work: "",
//     surveyor_payment: "",
//     diesel: "",
//   });

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     let updatedForm = { ...form, [name]: value };

//     // --- Machine actual hours calculation ---
//     if (name === "machine_start" || name === "machine_end") {
//       const start = parseFloat(updatedForm.machine_start) || 0;
//       const end = parseFloat(updatedForm.machine_end) || 0;
//       updatedForm.actual_hour_machine = end > start ? (end - start).toFixed(2) : 0;
//     }

//     // --- Compressor actual hours calculation ---
//     if (name === "rpm_start" || name === "rpm_end") {
//       const start = parseFloat(updatedForm.rpm_start) || 0;
//       const end = parseFloat(updatedForm.rpm_end) || 0;
//       updatedForm.actual_hours_rpm = end > start ? (end - start).toFixed(2) : 0;
//     }

//     // --- Drilling + Pilling total bill calculation ---
//     if (
//       name === "drilling_point" ||
//       name === "pilling_point" ||
//       name === "rate"
//     ) {
//       const drill = parseFloat(updatedForm.drilling_point) || 0;
//       const pilling = parseFloat(updatedForm.pilling_point) || 0;
//       const rate = parseFloat(updatedForm.rate) || 0;
//       updatedForm.total_bill = (drill + pilling) * rate;
//     }

//     // --- Survey total bill calculation ---
//     if (name === "dth_survey_point" || name === "survey_rate") {
//       const surveyPoints = parseFloat(updatedForm.dth_survey_point) || 0;
//       const surveyRate = parseFloat(updatedForm.survey_rate) || 0;
//       updatedForm.survey_total_bill = surveyPoints * surveyRate;
//     }

//     setForm(updatedForm);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await axios.post("http://127.0.0.1:8000/api/drilling", form);
//       alert("Data Saved Successfully!");
//       setForm({});
//     } catch (error) {
//       console.error(error);
//       alert("Error saving data");
//     }
//   };

//    const [records, setRecords] = useState([]);

//   useEffect(() => {
//     const fetchRecords = async () => {
//       try {
//         const response = await axios.get("http://127.0.0.1:8000/api/drilling");
//         setRecords(response.data.data); // store "data" array in state
//       } catch (error) {
//         console.error("Error fetching drilling records:", error);
//       }
//     };

//     fetchRecords();
//   }, []);

//   return (
//     <>
//     <CForm onSubmit={handleSubmit} className="p-3">
//       {/* Date & Site */}
//       <CRow className="mb-3">
//         <CCol md={3}><CFormInput name="site" label="Site" value={form.site || ""} onChange={handleChange} /></CCol>
//         <CCol md={3}><CFormInput type="date" name="date" label="Date" value={form.date || ""} onChange={handleChange} /></CCol>
//         <CCol md={3}><CFormInput name="operator_helper" label="Operator/Helper" value={form.operator_helper || ""} onChange={handleChange} /></CCol>
//       </CRow>

//       {/* Machine Start-End */}
//       <CRow className="mb-3">
//         <CCol md={3}><CFormInput name="machine_start" label="Machine Start Reading" value={form.machine_start || ""} onChange={handleChange} /></CCol>
//         <CCol md={3}><CFormInput name="machine_end" label="Machine End Reading" value={form.machine_end || ""} onChange={handleChange} /></CCol>
//         <CCol md={3}><CFormInput name="actual_hour_machine" label="Actual Hour in Machine" value={form.actual_hour_machine || ""} readOnly /></CCol>
//       </CRow>

//       {/* Compressor Start-End */}
//       <CRow className="mb-3">
//         <CCol md={3}><CFormInput name="rpm_start" label="Compressor RPM Start" value={form.rpm_start || ""} onChange={handleChange} /></CCol>
//         <CCol md={3}><CFormInput name="rpm_end" label="Compressor RPM End" value={form.rpm_end || ""} onChange={handleChange} /></CCol>
//         <CCol md={3}><CFormInput name="actual_hours_rpm" label="Actual Hours RPM" value={form.actual_hours_rpm || ""} readOnly /></CCol>
//       </CRow>

//       {/* Drilling & Billing */}
//       <CRow className="mb-3">
//         <CCol md={3}><CFormInput name="drilling_point" label="Drilling Point" value={form.drilling_point || ""} onChange={handleChange} /></CCol>
//         <CCol md={3}><CFormInput name="pilling_point" label="Pilling/E/C Point" value={form.pilling_point || ""} onChange={handleChange} /></CCol>
//         <CCol md={3}><CFormInput name="rate" label="Rate" value={form.rate || ""} onChange={handleChange} /></CCol>
//         <CCol md={3}><CFormInput name="total_bill" label="Total Bill" value={form.total_bill || ""} readOnly /></CCol>
//       </CRow>

//       {/* Survey Section */}
//       <CRow className="mb-3">
//         <CCol md={3}><CFormInput name="dth_survey_point" label="DTH Survey Point" value={form.dth_survey_point || ""} onChange={handleChange} /></CCol>
//         <CCol md={3}><CFormInput name="survey_rate" label="Survey Rate" value={form.survey_rate || ""} onChange={handleChange} /></CCol>
//         <CCol md={3}><CFormInput name="survey_total_bill" label="Survey Total Bill" value={form.survey_total_bill || ""} readOnly /></CCol>
//       </CRow>

//       {/* Extra Fields */}
//       <CRow className="mb-3">
//         <CCol md={3}><CFormInput name="surveyor_local_work" label="Surveyor Local Work" value={form.surveyor_local_work || ""} onChange={handleChange} /></CCol>
//         {/* <CCol md={3}><CFormInput name="surveyor_payment" label="Surveyor Payment" value={form.surveyor_payment || ""} onChange={handleChange} /></CCol>
//         <CCol md={3}><CFormInput name="diesel" label="Diesel" value={form.diesel || ""} onChange={handleChange} /></CCol> */}
//       </CRow>

//       <CButton type="submit" color="primary">Save</CButton>
//     </CForm>

//       <div className="table-responsive">
//       <CTable bordered hover>
//         <CTableHead color="dark">
//           <CTableRow>
//             <CTableHeaderCell>ID</CTableHeaderCell>
//             <CTableHeaderCell>Date</CTableHeaderCell>
//             <CTableHeaderCell>Site</CTableHeaderCell>
//             <CTableHeaderCell>Operator Helper</CTableHeaderCell>
//             <CTableHeaderCell>Machine Start</CTableHeaderCell>
//             <CTableHeaderCell>Machine End</CTableHeaderCell>
//             <CTableHeaderCell>Actual Hour (Machine)</CTableHeaderCell>
//             <CTableHeaderCell>RPM Start</CTableHeaderCell>
//             <CTableHeaderCell>RPM End</CTableHeaderCell>
//             <CTableHeaderCell>Actual Hours (RPM)</CTableHeaderCell>
//             <CTableHeaderCell>Drilling Point</CTableHeaderCell>
//             <CTableHeaderCell>Pilling Point</CTableHeaderCell>
//             <CTableHeaderCell>Rate</CTableHeaderCell>
//             <CTableHeaderCell>Total Bill</CTableHeaderCell>
//             <CTableHeaderCell>DTH Survey Point</CTableHeaderCell>
//             <CTableHeaderCell>Survey Rate</CTableHeaderCell>
//             <CTableHeaderCell>Survey Total Bill</CTableHeaderCell>
//             <CTableHeaderCell>Surveyor Local Work</CTableHeaderCell>
//             <CTableHeaderCell>Surveyor Payment</CTableHeaderCell>
//             <CTableHeaderCell>Diesel</CTableHeaderCell>
//           </CTableRow>
//         </CTableHead>
//         <CTableBody>
//           {records.map((rec) => (
//             <CTableRow key={rec.id}>
//               <CTableDataCell>{rec.id}</CTableDataCell>
//               <CTableDataCell>{new Date(rec.date).toLocaleDateString()}</CTableDataCell>
//               <CTableDataCell>{rec.site}</CTableDataCell>
//               <CTableDataCell>{rec.operator_helper}</CTableDataCell>
//               <CTableDataCell>{rec.machine_start}</CTableDataCell>
//               <CTableDataCell>{rec.machine_end}</CTableDataCell>
//               <CTableDataCell>{rec.actual_hour_machine}</CTableDataCell>
//               <CTableDataCell>{rec.rpm_start}</CTableDataCell>
//               <CTableDataCell>{rec.rpm_end}</CTableDataCell>
//               <CTableDataCell>{rec.actual_hours_rpm}</CTableDataCell>
//               <CTableDataCell>{rec.drilling_point ?? "-"}</CTableDataCell>
//               <CTableDataCell>{rec.pilling_point ?? "-"}</CTableDataCell>
//               <CTableDataCell>{rec.rate}</CTableDataCell>
//               <CTableDataCell>{rec.total_bill}</CTableDataCell>
//               <CTableDataCell>{rec.dth_survey_point}</CTableDataCell>
//               <CTableDataCell>{rec.survey_rate}</CTableDataCell>
//               <CTableDataCell>{rec.survey_total_bill}</CTableDataCell>
//               <CTableDataCell>{rec.surveyor_local_work}</CTableDataCell>
//               <CTableDataCell>{rec.surveyor_payment}</CTableDataCell>
//               <CTableDataCell>{rec.diesel}</CTableDataCell>
//             </CTableRow>
//           ))}
//         </CTableBody>
//       </CTable>
//     </div>


// </>
//   );
// };

// export default DrillingForm;


// ___________________________________________________________________________________________ 

import React, { useState, useEffect } from "react";
import {
  CForm, CRow, CCol, CFormInput, CButton,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CCard,
  CCardHeader,
  CCardTitle,
  CCardBody,
} from "@coreui/react";
import axios from "axios";
import { getAPICall, post } from "../../../util/api";
// import { getAPICall, post } from '../../../util/api';



const DrillingForm = () => {
  const [form, setForm] = useState({
    date: "",
    site: "",
    operator_helper: "",
    machine_start: "",
    machine_end: "",
    actual_hour_machine: "",
    rpm_start: "",
    rpm_end: "",
    actual_hours_rpm: "",
    drilling_point: "",
    pilling_point: "",
    rate: "",
    total_bill: "",
    dth_survey_point: "",
    survey_rate: "",
    survey_total_bill: "",
    surveyor_local_work: "",
    surveyor_payment: "",
    diesel: "",
  });
  const [customerSuggestions, setCustomerSuggestions] = useState([]);
  const [customerName, setCustomerName] = useState({ name: '', id: null });

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedForm = { ...form, [name]: value };

    // --- Machine actual hours calculation ---
    if (name === "machine_start" || name === "machine_end") {
      const start = parseFloat(updatedForm.machine_start) || 0;
      const end = parseFloat(updatedForm.machine_end) || 0;
      updatedForm.actual_hour_machine = end > start ? (end - start).toFixed(2) : 0;
    }

    // --- Compressor actual hours calculation ---
    if (name === "rpm_start" || name === "rpm_end") {
      const start = parseFloat(updatedForm.rpm_start) || 0;
      const end = parseFloat(updatedForm.rpm_end) || 0;
      updatedForm.actual_hours_rpm = end > start ? (end - start).toFixed(2) : 0;
    }

    // --- Drilling + Pilling total bill calculation ---
    if (
      name === "drilling_point" ||
      name === "pilling_point" ||
      name === "rate"
    ) {
      const drill = parseFloat(updatedForm.drilling_point) || 0;
      const pilling = parseFloat(updatedForm.pilling_point) || 0;
      const rate = parseFloat(updatedForm.rate) || 0;
      updatedForm.total_bill = (drill + pilling) * rate;
    }

    // --- Survey total bill calculation ---
    if (name === "dth_survey_point" || name === "survey_rate") {
      const surveyPoints = parseFloat(updatedForm.dth_survey_point) || 0;
      const surveyRate = parseFloat(updatedForm.survey_rate) || 0;
      updatedForm.survey_total_bill = surveyPoints * surveyRate;
    }

    setForm(updatedForm);
  };

  const searchCustomer = async (value) => {
    if (value.length > 0) {
      try {
        const response = await getAPICall (`/api/searchCustomer?searchQuery=${value}`);
        if (response) {
          setCustomerSuggestions(response);
        } else {
          setCustomerSuggestions([]);
        }
      } catch (error) {
        console.error("Error fetching customers:", error);
        alert("Error fetching customers");
      }
    } else {
      setCustomerSuggestions([]);
    }
  };

  const handleCustomerNameChange = (e) => {
    const value = e.target.value;
    setCustomerName({ name: value, id: null });
    searchCustomer(value);
  };

  const handleCustomerSelect = (customer) => {
    setCustomerName({ name: customer.name, id: customer.id });
    setForm((prev) => ({ ...prev, site: customer.id }));
    setCustomerSuggestions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await post("/api/drilling", form);
      alert("Data Saved Successfully!");
      setForm({
        date: "",
        site: "",
        operator_helper: "",
        machine_start: "",
        machine_end: "",
        actual_hour_machine: "",
        rpm_start: "",
        rpm_end: "",
        actual_hours_rpm: "",
        drilling_point: "",
        pilling_point: "",
        rate: "",
        total_bill: "",
        dth_survey_point: "",
        survey_rate: "",
        survey_total_bill: "",
        surveyor_local_work: "",
        surveyor_payment: "",
        diesel: "",
      });
      setCustomerName({ name: '', id: null });
      setCustomerSuggestions([]);
    } catch (error) {
      console.error(error);
      alert("Error saving data");
    }
  };

  const [records, setRecords] = useState([]);
  console.log(records);
  

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await getAPICall("/api/drilling");
        setRecords(response.data); // store "data" array in state
      } catch (error) {
        console.error("Error fetching drilling records:", error);
      }
    };

    fetchRecords();
  }, []);

  return (
    <>
    <CCard className="mb-4 shadow-sm">
      <CCardHeader className="bg-primary text-white">
        <CCardTitle>Dealiy Work Log</CCardTitle>
      </CCardHeader>
      <CCardBody className="p-4">
      <CForm onSubmit={handleSubmit} className="p-3">
        {/* Date & Site */}
        <CRow className="mb-3">
          <CCol md={3} style={{ position: 'relative' }}>
            <CFormInput
              type="text"
              name="customerName"
              label="Project Name"
              value={customerName.name}
              onChange={handleCustomerNameChange}
              autoComplete="off"
              placeholder="Enter Project Name"
            />
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
                {customerSuggestions.map((customer) => (
                  <li
                    key={customer.id}
                    onClick={() => handleCustomerSelect(customer)}
                    style={{
                      padding: '8px',
                      cursor: 'pointer',
                      borderBottom: '1px solid #eee',
                    }}
                    onMouseEnter={(e) => (e.target.style.background = '#f5f5f5')}
                    onMouseLeave={(e) => (e.target.style.background = 'white')}
                  >
                    {customer.name} ({customer.mobile})
                  </li>
                ))}
              </ul>
            )}
          </CCol>
          <CCol md={3}>
            <CFormInput
              type="date"
              name="date"
              label="Date"
              value={form.date || ""}
              onChange={handleChange}
            />
          </CCol>
          <CCol md={3}>
            <CFormInput
              name="operator_helper"
              label="Operator/Helper"
              value={form.operator_helper || ""}
              onChange={handleChange}
            />
          </CCol>
        </CRow>

        {/* Machine Start-End */}
        <CRow className="mb-3">
          <CCol md={3}>
            <CFormInput
              name="machine_start"
              label="Machine Start Reading"
              value={form.machine_start || ""}
              onChange={handleChange}
            />
          </CCol>
          <CCol md={3}>
            <CFormInput
              name="machine_end"
              label="Machine End Reading"
              value={form.machine_end || ""}
              onChange={handleChange}
            />
          </CCol>
          <CCol md={3}>
            <CFormInput
              name="actual_hour_machine"
              label="Actual Hour in Machine"
              value={form.actual_hour_machine || ""}
              readOnly
            />
          </CCol>
        </CRow>

        {/* Compressor Start-End */}
        <CRow className="mb-3">
          <CCol md={3}>
            <CFormInput
              name="rpm_start"
              label="Compressor RPM Start"
              value={form.rpm_start || ""}
              onChange={handleChange}
            />
          </CCol>
          <CCol md={3}>
            <CFormInput
              name="rpm_end"
              label="Compressor RPM End"
              value={form.rpm_end || ""}
              onChange={handleChange}
            />
          </CCol>
          <CCol md={3}>
            <CFormInput
              name="actual_hours_rpm"
              label="Actual Hours RPM"
              value={form.actual_hours_rpm || ""}
              readOnly
            />
          </CCol>
        </CRow>

        {/* Drilling & Billing */}
        <CRow className="mb-3">
          <CCol md={3}>
            <CFormInput
              name="drilling_point"
              label="Drilling Point"
              value={form.drilling_point || ""}
              onChange={handleChange}
            />
          </CCol>
          <CCol md={3}>
            <CFormInput
              name="pilling_point"
              label="Pilling/E/C Point"
              value={form.pilling_point || ""}
              onChange={handleChange}
            />
          </CCol>
          <CCol md={3}>
            <CFormInput
              name="rate"
              label="Rate"
              value={form.rate || ""}
              onChange={handleChange}
            />
          </CCol>
          <CCol md={3}>
            <CFormInput
              name="total_bill"
              label="Total Bill"
              value={form.total_bill || ""}
              readOnly
            />
          </CCol>
        </CRow>

        {/* Survey Section */}
        <CRow className="mb-3">
          <CCol md={3}>
            <CFormInput
              name="dth_survey_point"
              label="DTH Survey Point"
              value={form.dth_survey_point || ""}
              onChange={handleChange}
            />
          </CCol>
          <CCol md={3}>
            <CFormInput
              name="survey_rate"
              label="Survey Rate"
              value={form.survey_rate || ""}
              onChange={handleChange}
            />
          </CCol>
          <CCol md={3}>
            <CFormInput
              name="survey_total_bill"
              label="Survey Total Bill"
              value={form.survey_total_bill || ""}
              readOnly
            />
          </CCol>
        </CRow>

        {/* Extra Fields */}
        <CRow className="mb-3">
          <CCol md={3}>
            <CFormInput
              name="surveyor_local_work"
              label="Surveyor Local Work"
              value={form.surveyor_local_work || ""}
              onChange={handleChange}
            />
          </CCol>
          {/* <CCol md={3}><CFormInput name="surveyor_payment" label="Surveyor Payment" value={form.surveyor_payment || ""} onChange={handleChange} /></CCol>
          <CCol md={3}><CFormInput name="diesel" label="Diesel" value={form.diesel || ""} onChange={handleChange} /></CCol> */}
        </CRow>

        <CButton type="submit" color="primary">Save</CButton>
      </CForm>
      </CCardBody>
</CCard>
      <div className="table-responsive">
        <CTable bordered hover>
          <CTableHead color="dark">
            <CTableRow>
              <CTableHeaderCell>ID</CTableHeaderCell>
              <CTableHeaderCell>Date</CTableHeaderCell>
              <CTableHeaderCell>Site</CTableHeaderCell>
              <CTableHeaderCell>Operator Helper</CTableHeaderCell>
              <CTableHeaderCell>Machine Start</CTableHeaderCell>
              <CTableHeaderCell>Machine End</CTableHeaderCell>
              <CTableHeaderCell>Actual Hour (Machine)</CTableHeaderCell>
              <CTableHeaderCell>RPM Start</CTableHeaderCell>
              <CTableHeaderCell>RPM End</CTableHeaderCell>
              <CTableHeaderCell>Actual Hours (RPM)</CTableHeaderCell>
              <CTableHeaderCell>Drilling Point</CTableHeaderCell>
              <CTableHeaderCell>Pilling Point</CTableHeaderCell>
              <CTableHeaderCell>Rate</CTableHeaderCell>
              <CTableHeaderCell>Total Bill</CTableHeaderCell>
              <CTableHeaderCell>DTH Survey Point</CTableHeaderCell>
              <CTableHeaderCell>Survey Rate</CTableHeaderCell>
              <CTableHeaderCell>Survey Total Bill</CTableHeaderCell>
              <CTableHeaderCell>Surveyor Local Work</CTableHeaderCell>
              <CTableHeaderCell>Surveyor Payment</CTableHeaderCell>
              <CTableHeaderCell>Diesel</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {records.map((rec) => (
              <CTableRow key={rec.id}>
                <CTableDataCell>{rec.id}</CTableDataCell>
                <CTableDataCell>{new Date(rec.date).toLocaleDateString()}</CTableDataCell>
                <CTableDataCell>{rec.site}</CTableDataCell>
                <CTableDataCell>{rec.operator_helper}</CTableDataCell>
                <CTableDataCell>{rec.machine_start}</CTableDataCell>
                <CTableDataCell>{rec.machine_end}</CTableDataCell>
                <CTableDataCell>{rec.actual_hour_machine}</CTableDataCell>
                <CTableDataCell>{rec.rpm_start}</CTableDataCell>
                <CTableDataCell>{rec.rpm_end}</CTableDataCell>
                <CTableDataCell>{rec.actual_hours_rpm}</CTableDataCell>
                <CTableDataCell>{rec.drilling_point ?? "-"}</CTableDataCell>
                <CTableDataCell>{rec.pilling_point ?? "-"}</CTableDataCell>
                <CTableDataCell>{rec.rate}</CTableDataCell>
                <CTableDataCell>{rec.total_bill}</CTableDataCell>
                <CTableDataCell>{rec.dth_survey_point}</CTableDataCell>
                <CTableDataCell>{rec.survey_rate}</CTableDataCell>
                <CTableDataCell>{rec.survey_total_bill}</CTableDataCell>
                <CTableDataCell>{rec.surveyor_local_work}</CTableDataCell>
                <CTableDataCell>{rec.surveyor_payment}</CTableDataCell>
                <CTableDataCell>{rec.diesel}</CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      </div>
    </>
  );
};

export default DrillingForm;