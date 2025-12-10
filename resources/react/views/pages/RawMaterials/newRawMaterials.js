
// import React, { useState, useEffect } from "react";
// import {
//   CCard,
//   CCardBody,
//   CRow,
//   CCol,
//   CButton,
//   CFormInput,
//   CFormLabel,
//   CFormSelect,
//   CCardHeader,
// } from "@coreui/react";
// import { post, getAPICall } from "../../../util/api";
// import { useNavigate } from "react-router-dom";
// import { useToast } from "../../common/toast/ToastContext";
// import { paymentTypes, receiver_bank } from "../../../util/Feilds";
// import { useTranslation } from "react-i18next";

// const RawMaterialForm = () => {
//   const [formData, setFormData] = useState({
//     name: "",
//     local_name: "",
//     project_id: "",
//     current_stock: "",
//     price: "",
//     capacity: "",
//     total: 0,
//     unit: "",
//     contact: "",
//     payment_by: "",
//     payment_type: "",
//   });

//   const navigate = useNavigate();
//   const { showToast } = useToast();
//   const [projects, setProjects] = useState([]);
//   const units = ["kg", "pcs", "mg", "ltr", "bag", "Brass"]; // Available units
//   const { t } = useTranslation("global");

//   // Fetch projects
//   useEffect(() => {
//     const fetchProjects = async () => {
//       try {
//         const res = await getAPICall("/api/myProjects");
//         setProjects(res || []);
//       } catch (err) {
//         console.error("Error fetching projects", err);
//       }
//     };
//     fetchProjects();
//   }, []);

//   // Handle input changes and calculate total = stock * price
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     const updatedData = { ...formData, [name]: value };

//     if (name === "current_stock" || name === "price") {
//       const stock =
//         parseFloat(name === "current_stock" ? value : updatedData.current_stock) || 0;
//       const price =
//         parseFloat(name === "price" ? value : updatedData.price) || 0;
//       updatedData.total = stock * price;
//     }

//     // Restrict contact to numbers and max 10 digits
//     if (name === "contact" && !/^\d{0,10}$/.test(value)) return;

//     setFormData(updatedData);
//   };

//   // Submit form
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await post("/api/store", { ...formData });
//       showToast("success", "Raw material saved successfully!");
//       navigate("/showRawMaterials");
//     } catch (err) {
//       console.error(err);
//       showToast("danger", "Error adding raw material");
//     }
//   };

//   const handleClose = () => {
//     navigate("/showRawMaterials");
//   };

//   return (
//     <CCard className="mb-4">
//       <CCardHeader>
//         <strong>New Raw Material</strong>
//       </CCardHeader>
//       <CCardBody>
//         <form onSubmit={handleSubmit}>
//           {/* Name, Local Name, Project */}
//           <CRow className="mb-2">
//             <CCol md={4}>
//               <CFormLabel>Name *</CFormLabel>
//               <CFormInput
//                 name="name"
//                 value={formData.name}
//                 onChange={handleChange}
//                 placeholder="Enter material name"
//               />
//             </CCol>
//             <CCol md={4}>
//               <CFormLabel>Local Name</CFormLabel>
//               <CFormInput
//                 name="local_name"
//                 value={formData.local_name}
//                 onChange={handleChange}
//                 placeholder="Enter local name"
//               />
//             </CCol>
//             <CCol md={4}>
//               <CFormLabel>Project *</CFormLabel>
//               <CFormSelect
//                 name="project_id"
//                 value={formData.project_id}
//                 onChange={handleChange}
//               >
//                 <option value="">-- Select Project --</option>
//                 {projects.map((project) => (
//                   <option key={project.id} value={project.id}>
//                     {project.project_name}
//                   </option>
//                 ))}
//               </CFormSelect>
//             </CCol>
//           </CRow>

//           <div className="gap-2 d-flex">
//             <CButton type="submit" color="primary">
//               Save
//             </CButton>
//             <CButton type="button" color="secondary" onClick={handleClose}>
//               Close
//             </CButton>
//           </div>
//         </form>
//       </CCardBody>
//     </CCard>
//   );
// };

// export default RawMaterialForm;
import React, { useState, useEffect } from "react";
import {
  CCard,
  CCardBody,
  CRow,
  CCol,
  CButton,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CCardHeader,
} from "@coreui/react";
import { post, getAPICall } from "../../../util/api";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../common/toast/ToastContext";
import { useTranslation } from "react-i18next";

const RawMaterialForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    local_name: "",
    project_id: "",
    current_stock: "",
    price: "",
    capacity: "",
    total: 0,
    unit: "",
    contact: "",
    payment_by: "",
    payment_type: "",
  });

  const navigate = useNavigate();
  const { showToast } = useToast();
  const [projects, setProjects] = useState([]);
  const units = ["kg", "pcs", "mg", "ltr", "bag", "Brass"];
  const { t } = useTranslation("global");

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await getAPICall("/api/myProjects");
        setProjects(res || []);
      } catch (err) {
        console.error("Error fetching projects", err);
      }
    };
    fetchProjects();
  }, []);

  // Handle change
  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedData = { ...formData, [name]: value };

    if (name === "current_stock" || name === "price") {
      const stock =
        parseFloat(name === "current_stock" ? value : updatedData.current_stock) || 0;
      const price =
        parseFloat(name === "price" ? value : updatedData.price) || 0;
      updatedData.total = stock * price;
    }

    // Restrict contact to numbers and max 10 digits
    if (name === "contact" && !/^\d{0,10}$/.test(value)) return;

    setFormData(updatedData);
  };

  // ✅ Validate before submitting
  const validateForm = () => {
    if (!formData.name.trim()) return "Please enter Material Name.";
    if (!formData.local_name.trim()) return "Please enter local Material Name.";
    if (!formData.project_id.trim()) return "Please select a Project.";
    // if (!formData.current_stock.trim()) return "Please enter Current Stock.";
    // if (!formData.price.trim()) return "Please enter Price.";
    // if (!formData.unit.trim()) return "Please select Unit.";
    return null;
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errorMsg = validateForm();
    if (errorMsg) {
      showToast("danger", errorMsg);
      return;
    }

    try {
      await post("/api/store", { ...formData });
      showToast("success", "Raw material saved successfully!");
      navigate("/showRawMaterials");
    } catch (err) {
      console.error(err);
      showToast("danger", "Error adding raw material.");
    }
  };

  const handleClose = () => navigate("/showRawMaterials");

  return (
    <CCard className="mb-4">
      <CCardHeader>
        <strong>New Raw Material</strong>
      </CCardHeader>
      <CCardBody>
        <form onSubmit={handleSubmit}>
          {/* Name, Local Name, Project */}
          <CRow className="mb-3">
            <CCol md={4}>
              <CFormLabel>Name *</CFormLabel>
              <CFormInput
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter material name"
              />
            </CCol>
            <CCol md={4}>
              <CFormLabel>Local Name</CFormLabel>
              <CFormInput
                name="local_name"
                value={formData.local_name}
                onChange={handleChange}
                placeholder="Enter local name"
              />
            </CCol>
            <CCol md={4}>
              <CFormLabel>Project *</CFormLabel>
              <CFormSelect
                name="project_id"
                value={formData.project_id}
                onChange={handleChange}
              >
                <option value="">-- Select Project --</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.project_name}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
          </CRow>

          {/* Stock, Price, Unit */}
          {/* <CRow className="mb-3">
            <CCol md={4}>
              <CFormLabel>Current Stock *</CFormLabel>
              <CFormInput
                name="current_stock"
                value={formData.current_stock}
                onChange={handleChange}
                placeholder="Enter stock"
                type="number"
              />
            </CCol>
            <CCol md={4}>
              <CFormLabel>Price *</CFormLabel>
              <CFormInput
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="Enter price"
                type="number"
              />
            </CCol>
            <CCol md={4}>
              <CFormLabel>Unit *</CFormLabel>
              <CFormSelect name="unit" value={formData.unit} onChange={handleChange}>
                <option value="">-- Select Unit --</option>
                {units.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
          </CRow> */}

          <div className="d-flex gap-2">
            <CButton type="submit" color="primary">
              Save
            </CButton>
            <CButton type="button" color="secondary" onClick={handleClose}>
              Close
            </CButton>
          </div>
        </form>
      </CCardBody>
    </CCard>
  );
};

export default RawMaterialForm;



























          {/* Capacity, Stock, Price, Total, Unit */}
          {/* <CRow className="mb-2">
            <CCol md={2}>
              <CFormLabel>Capacity</CFormLabel>
              <CFormInput
                type="text"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                placeholder="Capacity"
              />
            </CCol>

            <CCol md={2}>
              <CFormLabel>Stock *</CFormLabel>
              <CFormInput
                type="number"
                name="current_stock"
                value={formData.current_stock}
                onChange={handleChange}
                placeholder="Stock"
              />
            </CCol>

            <CCol md={2}>
              <CFormLabel>Price *</CFormLabel>
              <CFormInput
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="Price per unit"
              />
            </CCol>

            <CCol md={2}>
              <CFormLabel>Total</CFormLabel>
              <CFormInput
                type="number"
                name="total"
                value={formData.total}
                readOnly
                placeholder="Total"
              />
            </CCol>

            <CCol md={4}>
              <CFormLabel>Unit *</CFormLabel>
              <CFormSelect
                name="unit"
                value={formData.unit}
                onChange={handleChange}
              >
                <option value="">-- Select Unit --</option>
                {units.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
          </CRow> */}

          {/* Contact, Payment By, Payment Type */}
          {/* <CRow className="mb-3">
            <CCol sm={4}>
              <CFormLabel htmlFor="contact">
                <p>{t("LABELS.contact")}</p>
              </CFormLabel>
              <CFormInput
                type="text"
                id="contact"
                placeholder={t("LABELS.enter_contact")}
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                maxLength={10}
                inputMode="numeric"
              />
            </CCol>

            <CCol sm={4}>
              <CFormLabel htmlFor="payment_by">
                <p>{t("LABELS.payment_by")}</p>
              </CFormLabel>
              <CFormSelect
                id="payment_by"
                name="payment_by"
                value={formData.payment_by}
                onChange={handleChange}
              >
                <option value="">{t("LABELS.select_payment_by")}</option>
                {receiver_bank.map((bank) => (
                  <option key={bank.value} value={bank.value}>
                    {bank.label}
                  </option>
                ))}
              </CFormSelect>
            </CCol>

            <CCol sm={4}>
              <CFormLabel htmlFor="payment_type">
                <p>{t("LABELS.payment_type")}</p>
              </CFormLabel>
              <CFormSelect
                id="payment_type"
                name="payment_type"
                value={formData.payment_type}
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
            </CCol>
          </CRow> */}